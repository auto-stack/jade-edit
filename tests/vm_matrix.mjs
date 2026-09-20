#!/usr/bin/env node
// vm_matrix.mjs — PLAN-081 T-05：jade-edit vm 轨六检查矩阵（MCP
// autoui_snapshot/autoui_action 通道；jade desktop vm-smoke 形态的最小集）。
//
// 六检查（AC-03 / §5.4 检查单——vue 轨 playwright 断言域与此同单）：
//   1 boot    App 起窗渲染，status=ready（Init → list_files 成功）
//   2 tree    filetree 列出 fixture wiki 文件（.ad 按钮锚）
//   3 open    打开 .ad 进 autodown_editor（textarea 面 + 播种内容可见）
//   4 edit    编辑回写（type_text → INPUT_TEXT → 脏标 ● unsaved）
//   5 save    保存落盘（press 保存 → 脏标清 + 磁盘字节含标记 + frontmatter 保留）
//   6 reload  重载可见（磁盘外改 → press 重载 → 编辑器见新内容）
//
// 卫生（vm-smoke 同款）：只杀自己 spawn 的进程；fixture 经 run-back 隔离
// 拷贝（源零污染）；断言域 = 结构/文本（非像素）。
//
// 用法（仓根）：node tests/vm_matrix.mjs [--port 9381] [--back-port 8211]
// env：AUTO_EXE / JADE_BACKEND_EXE / JADE_FIXTURE（经 run-back）

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { startBackend } from '../scripts/run-back.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'

const args = process.argv.slice(2)
const argOf = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const MCP_PORT = Number(argOf('--port') ?? process.env.AUTOUI_MCP_PORT ?? 9381)
const BACK_PORT = Number(argOf('--back-port') ?? 8211)
const BASELINE = path.join(repoRoot, 'tests', 'baseline', 'structure-v0.txt')
const SAVE_BASELINE = argOf('--save-baseline')

const EDIT_MARKER = 'jade-edit 冒烟标记：编辑回写可见。'
const RELOAD_MARKER = '外部重载标记：重载可见。'
const TARGET_LABEL = 'Hello World.ad'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------- MCP client ----------------
let nextId = 1
const mcpBase = () => `http://127.0.0.1:${MCP_PORT}/mcp`
async function rpc(method, params) {
  const res = await fetch(mcpBase(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  })
  if (!res.ok) throw new Error(`MCP ${method} -> HTTP ${res.status}`)
  const body = await res.json()
  if (body.error) throw new Error(`MCP ${method} error: ${JSON.stringify(body.error)}`)
  return body.result
}
async function callTool(name, toolArgs) {
  const result = await rpc('tools/call', { name, arguments: toolArgs })
  if (result.isError) throw new Error(`tool ${name} failed: ${JSON.stringify(result.content)}`)
  return result.content.map((c) => c.text ?? '').join('\n')
}

// ---------------- snapshot tree helpers（vm-smoke 同款）----------------
function parseAura(text) {
  const root = { head: '<root>', children: [] }
  const stack = [{ node: root, depth: -1 }]
  for (const raw of text.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed || trimmed === '}' || raw.startsWith('AURA') || raw.startsWith('widget:') || raw.startsWith('tree:')) continue
    const depth = Math.floor((raw.length - raw.replace(/^ */, '').length) / 2)
    const line = trimmed.replace(/\{$/, '')
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop()
    const node = { head: line, children: [] }
    stack[stack.length - 1].node.children.push(node)
    stack.push({ node, depth })
  }
  return root
}
const elementIdOf = (node) => node.head.match(/#(vnode_\d+)/)?.[1] ?? null
const ownText = (node) => node.head.match(/"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
function findFirst(node, pred) {
  if (pred(node)) return node
  for (const child of node.children) {
    const hit = findFirst(child, pred)
    if (hit) return hit
  }
  return null
}

async function snapshot() {
  return parseAura(await callTool('autoui_snapshot', {}))
}
/** 取渲染稳定快照（预热期 "No UI available" isError 也重试）。 */
async function stableSnapshot(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    try {
      const text = await callTool('autoui_snapshot', {})
      if (!/No UI available yet/.test(text)) return parseAura(text)
    } catch (err) {
      if (!/No UI available/.test(String(err.message))) throw err
    }
    if (Date.now() > deadline) throw new Error('snapshot never became ready')
    await sleep(500)
  }
}
/** 编辑器节点（autodown_editor 在本机 exe 投影为 textarea——Q1 冻结形态）。 */
const isEditorNode = (n) =>
  n.head.startsWith('textarea ') ||
  n.head.startsWith('code_editor ') ||
  n.head.startsWith('autodown_editor ') ||
  n.head.startsWith('AutodownEditor ')
async function findEditorId() {
  const tree = await snapshot()
  const ta = findFirst(tree, (n) => isEditorNode(n) && elementIdOf(n))
  return ta ? elementIdOf(ta) : null
}
/** press 首个 OWN label 等值的 button。 */
async function pressButton(label) {
  const tree = await snapshot()
  const btn = findFirst(tree, (n) => n.head.startsWith('button ') && ownText(n) === label && elementIdOf(n))
  if (!btn) throw new Error(`button "${label}" not found in the snapshot`)
  const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
  if (!/status: ok/.test(res)) throw new Error(`press "${label}" not ok: ${res}`)
}
const snapshotText = async () => await callTool('autoui_snapshot', {})
/** autoui_state 单字段原文（jade vm-smoke stateText 形态）。 */
async function stateText(field) {
  return callTool('autoui_state', { fields: [field] })
}
/** 轮询至 state 字段含 needle。 */
async function stateHas(field, needle, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const st = await stateText(field)
    if (st.includes(needle)) return st.trim()
    if (Date.now() > deadline) throw new Error(`state.${field} never contained "${needle}": ${st.trim().slice(0, 300)}`)
    await sleep(150)
  }
}
/** 轮询至 state 标量 == want（剥类型后缀与引号——stateIs 同款）。 */
async function stateIs(field, want, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const st = await stateText(field)
    const raw = st.match(new RegExp(`${field}:\\s*(.*)`))?.[1]?.trim() ?? ''
    const got = raw.replace(/\s*\((?:str|int|bool|float|map|list)\)\s*$/, '').replace(/^"((?:[^"\\]|\\.)*)"$/, '$1').trim()
    if (got === want) return st.trim()
    if (Date.now() > deadline) throw new Error(`state.${field} never became "${want}" (got "${got}")`)
    await sleep(150)
  }
}

// ---------------- run ----------------
const results = []
const check = (id, name, ok, evidence) => {
  results.push({ id, name, ok })
  console.log(`[${id} ${name}] ${ok ? 'PASS' : 'FAIL'} — ${evidence}`)
}

let back = null
let app = null
let appOut = ''
try {
  // 后端（隔离 fixture 拷贝）
  back = await startBackend({ port: BACK_PORT })
  console.log(`[matrix] backend up: ${back.url} (workspace: ${back.workspace})`)

  // vm 应用（split 模式：AUTO_VM_MERGE=0 + AUTO_BACKEND）
  app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      AUTOUI_MCP_PORT: String(MCP_PORT),
      AUTO_VM_MERGE: '0',
      AUTO_BACKEND: back.url,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))

  const deadline = Date.now() + 45000
  for (;;) {
    try {
      await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-edit-vm-matrix', version: '0.1.0' } })
      break
    } catch (err) {
      if (Date.now() > deadline) throw new Error(`AutoUI MCP not reachable: ${err.message}`)
      await sleep(500)
    }
  }

  const targetFile = path.join(back.workspace, 'wiki', TARGET_LABEL)

  // 1 boot（渲染稳定门 + status ready）
  await stableSnapshot()
  const bootText = await snapshotText()
  check('1', 'boot', bootText.includes('"ready"'), 'snapshot 含 status "ready"')

  // 2 tree
  const treeText = await snapshotText()
  const fixtureFiles = fs.readdirSync(path.join(back.workspace, 'wiki')).filter((f) => f.endsWith('.ad'))
  const listedCount = fixtureFiles.filter((f) => treeText.includes(`"${f}"`)).length
  check('2', 'tree', listedCount === fixtureFiles.length && listedCount >= 5, `filetree 列出 ${listedCount}/${fixtureFiles.length} 个 fixture .ad`)

  // 3 open：filetree 按钮开文件 → 编辑器面在 + 播种内容可见（App 投影
  // active_body 含正文锚——key 重挂载 + content: 播种通道）。
  await pressButton(TARGET_LABEL)
  const editorId = await (async () => {
    const deadline = Date.now() + 10000
    for (;;) {
      const id = await findEditorId()
      if (id) return id
      if (Date.now() > deadline) throw new Error('editor face never appeared after open')
      await sleep(300)
    }
  })()
  const openState = await stateHas('active_body', '这是一段示例文本')
  check('3', 'open', true, `autodown_editor 面在（element ${editorId.slice(0, 18)}…）+ 播种可见（active_body 含正文锚）`)

  // 4 edit：整文替换语义（jade 080 tabs 臂同款裁定）——以磁盘原文（编辑
  // 前真值）构造 edited，type_text → INPUT_TEXT 全文回写 → 脏标。
  const diskBefore = fs.readFileSync(targetFile, 'utf8')
  const bodyBefore = diskBefore.split('---').length >= 3 ? diskBefore.split('---').slice(2).join('---').replace(/^\n/, '') : diskBefore
  const edited = `${bodyBefore}\n\n${EDIT_MARKER}`
  const typeRes = await callTool('autoui_action', { element_id: editorId, action: 'type_text', value: edited })
  await stateIs('active_dirty', 'true')
  check('4', 'edit', /status: ok/.test(typeRes), `type_text（整文+标记）→ INPUT_TEXT → active_dirty=true（● unsaved）`)

  // 5 save：press 保存 → 脏标清 + 磁盘 = 原文 + 标记 + frontmatter 保留。
  await pressButton('保存')
  await stateIs('active_dirty', 'false')
  let diskAfter = ''
  for (const deadline = Date.now() + 6000; ; ) {
    diskAfter = fs.readFileSync(targetFile, 'utf8')
    if (diskAfter.includes(EDIT_MARKER)) break
    if (Date.now() > deadline) break
    await sleep(150)
  }
  const diskOk = diskAfter.includes(EDIT_MARKER) && diskAfter.includes('这是一段示例文本')
  const fmOk = diskAfter.includes('title: Hello World')
  check('5', 'save', diskOk && fmOk, `磁盘含原文+标记=${diskOk} frontmatter 保留=${fmOk}`)

  // 6 reload：磁盘外改 → press 重载 → active_body 含新内容（重载可见）。
  fs.appendFileSync(targetFile, `\n${RELOAD_MARKER}\n`)
  await pressButton('重载')
  const reloadState = await stateHas('active_body', RELOAD_MARKER, 8000)
  check('6', 'reload', true, `磁盘外改 + press 重载 → active_body 含「${RELOAD_MARKER}」`)

  // 结构基线（jade baseline 同款：## state 全量 dump + ## snapshot 原始
  // 快照——vnode id 为结构确定性哈希，可直接锁零漂移）。终态 = 六检查
  // 跑完后的满状态（fixture 冻结 + 标记字面量 ⇒ 确定性）。
  const stateDump = (await callTool('autoui_state', {})).trim()
  const snapDump = (await snapshotText()).trim()
  const headerFor = (file) =>
    `// jade-edit vm 结构基线 v0（PLAN-081 T-05）——六检查终态满状态：boot + filetree 五 .ad + Hello World.ad 开（编辑/保存/重载后）。\n` +
    `// 再生成：node tests/vm_matrix.mjs --save-baseline ${path.relative(repoRoot, file).replace(/\\\\/g, '/')}\n`
  const baselineBodyOf = () => `## state\n${stateDump}\n\n## snapshot\n${snapDump}\n`
  if (SAVE_BASELINE) {
    fs.mkdirSync(path.dirname(SAVE_BASELINE), { recursive: true })
    fs.writeFileSync(SAVE_BASELINE, headerFor(SAVE_BASELINE) + baselineBodyOf())
    console.log(`[baseline] saved: ${SAVE_BASELINE}`)
  } else if (fs.existsSync(BASELINE)) {
    const want = fs.readFileSync(BASELINE, 'utf8')
    const ok = want === headerFor(BASELINE) + baselineBodyOf()
    check('7', 'baseline', ok, ok ? '结构基线零漂移' : '结构基线漂移（--save-baseline 重锁需人工裁定）')
  } else {
    console.log('[baseline] tests/baseline/structure-v0.txt 不存在——首锁：node tests/vm_matrix.mjs --save-baseline tests/baseline/structure-v0.txt')
  }

  const pass = results.filter((r) => r.ok).length
  console.log(`\n[matrix] ${pass}/${results.length} checks passed`)
  if (pass !== results.length) {
    console.log(`[matrix] app output tail:\n${appOut.split('\n').slice(-25).join('\n')}`)
    process.exitCode = 1
  }
} catch (err) {
  console.error(`[matrix] FATAL: ${err.message}`)
  if (app) console.error(appOut.split('\n').slice(-25).join('\n'))
  process.exitCode = 1
} finally {
  if (app) { try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {} }
  if (back) await back.stop()
}
