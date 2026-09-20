#!/usr/bin/env node
// smoke-merged.mjs — PLAN-001 T-01/T-02 merged 六步环冒烟（一次性脚本，
// 供任务验证；正式门在 T-04 由 vm_matrix 双臂化取代）。
// 用法：node tests/smoke-merged.mjs （自起 vm 实例 + 自杀；fixture 隔离）

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const MCP_PORT = 9412
const FIXTURE = path.join(repoRoot, 'e2e', '.runtime', 'workspace')
const TARGET = 'Hello World.ad'
const EDIT_MARKER = 'jade-edit 换基冒烟标记：编辑回写可见。'
const RELOAD_MARKER = '外部重载标记：重载可见。'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let nextId = 1
async function rpc(method, params) {
  const res = await fetch(`http://127.0.0.1:${MCP_PORT}/mcp`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  })
  const body = await res.json()
  if (body.error) throw new Error(JSON.stringify(body.error))
  return body.result
}
async function callTool(name, toolArgs) {
  const r = await rpc('tools/call', { name, arguments: toolArgs })
  if (r.isError) throw new Error(JSON.stringify(r.content))
  return r.content.map((c) => c.text ?? '').join('\n')
}
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
const elementIdOf = (n) => n.head.match(/#(vnode_\d+)/)?.[1] ?? null
const ownText = (n) => n.head.match(/"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
function findFirst(n, pred) { if (pred(n)) return n; for (const c of n.children) { const h = findFirst(c, pred); if (h) return h } return null }
const snapshot = async () => parseAura(await callTool('autoui_snapshot', {}))
const stateText = (f) => callTool('autoui_state', { fields: [f] })
async function stateHas(f, needle, ms = 6000) {
  const dl = Date.now() + ms
  for (;;) {
    const st = await stateText(f)
    if (st.includes(needle)) return st.trim()
    if (Date.now() > dl) throw new Error(`state.${f} !~ "${needle}": ${st.trim().slice(0, 200)}`)
    await sleep(150)
  }
}
async function pressButton(pred, label) {
  const tree = await snapshot()
  const btn = findFirst(tree, (n) => n.head.startsWith('button ') && elementIdOf(n) && pred(ownText(n)))
  if (!btn) throw new Error(`button ${label} not found`)
  const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
  if (!/status: ok/.test(res)) throw new Error(`press ${label} not ok: ${res}`)
  return true
}
const isEditorNode = (n) => n.head.startsWith('textarea ') || n.head.startsWith('autodown_editor ') || n.head.startsWith('AutodownEditor ')

const results = []
const check = (id, name, ok, ev) => { results.push(ok); console.log(`[${id} ${name}] ${ok ? 'PASS' : 'FAIL'} — ${ev}`) }

// fixture 重灌
fs.rmSync(FIXTURE, { recursive: true, force: true })
fs.cpSync('D:/autostack/auto-down/tmp/wiki-demo', FIXTURE, { recursive: true })

const SPLIT = process.argv.includes('--split')
const app = spawn(AUTO_EXE, SPLIT ? ['run', '-r', 'vm', '--no-merge'] : ['run', '-r', 'vm'], {
  cwd: repoRoot,
  env: { ...process.env, AUTOUI_MCP_PORT: String(MCP_PORT), JADE_WORKSPACE: FIXTURE },
  stdio: ['ignore', 'pipe', 'pipe'],
})
console.log(`[smoke] mode: ${SPLIT ? 'split（--no-merge，AutoVM HTTP back）' : 'merged（进程内直调）'}`)
let out = ''
app.stdout.on('data', (d) => (out += d))
app.stderr.on('data', (d) => (out += d))
const kill = async () => { try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {} await sleep(300) }

try {
  const dl = Date.now() + 45000
  for (;;) {
    try {
      await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'smoke', version: '0.1' } })
      break
    } catch (e) {
      if (Date.now() > dl) throw new Error(`MCP not reachable: ${e.message}`)
      await sleep(500)
    }
  }

  // 1 boot
  let bootText = ''
  for (let i = 0; i < 60; i++) {
    try { const t = await callTool('autoui_snapshot', {}); if (!/No UI available/.test(t)) { bootText = t; break } } catch {}
    await sleep(500)
  }
  check('1', 'boot', bootText.includes('ready') && bootText.includes('没有打开的文档'), 'ready（插值 workspace · ready） + 空态可见')

  // 2 tree：展开 wiki 目录 → .ad 行可见
  await pressButton((t) => t === 'wiki', 'wiki folder')
  await sleep(400)
  const treeText = await callTool('autoui_snapshot', {})
  check('2', 'tree', treeText.includes(TARGET), `tree 含 ${TARGET}`)

  // 3 open：按 .ad 行 → 编辑器 + 播种内容
  await pressButton((t) => t === TARGET, TARGET)
  const st3 = await stateHas('active_title', 'Hello World', 6000)
  const snap3 = await snapshot()
  const ed = findFirst(snap3, (n) => isEditorNode(n) && elementIdOf(n))
  check('3', 'open', !!ed && !!st3, `editor=${ed?.head.split(' ')[0]} + active_title=Hello World`)

  // 4 edit：type 标记 → 脏标
  const edId = elementIdOf(ed)
  await callTool('autoui_action', { element_id: edId, action: 'type_text', value: EDIT_MARKER })
  const st4 = await stateHas('active_dirty', 'true', 6000)
  check('4', 'edit', !!st4, 'active_dirty=true（INPUT_TEXT 回写）')

  // 5 save：toolbar 「save保存」 → 脏标清 + 磁盘字节 + frontmatter 保留
  await pressButton((t) => t.includes('保存'), 'toolbar 保存')
  const st5 = await stateHas('active_dirty', 'false', 6000)
  const disk = fs.readFileSync(path.join(FIXTURE, 'wiki', TARGET), 'utf8')
  check('5', 'save', !!st5 && disk.includes(EDIT_MARKER) && disk.includes('---') && disk.includes('title:'), `save_note + 磁盘含标记 + frontmatter 保留`)

  // 6 reload：外部改盘 → toolbar 「refresh-cw重载」 → 编辑器见新内容
  fs.appendFileSync(path.join(FIXTURE, 'wiki', TARGET), '\n' + RELOAD_MARKER + '\n')
  await pressButton((t) => t.includes('重载'), 'toolbar 重载')
  const st6 = await stateHas('save_note', 'reloaded', 6000)
  const snap6 = await snapshot()
  const ed6 = findFirst(snap6, (n) => isEditorNode(n) && elementIdOf(n))
  // 播种内容经 INPUT_TEXT 后编辑器持有全文；重载重播种——state 投影断言为主
  const bodyState = await stateText('active_body')
  check('6', 'reload', !!st6 && bodyState.includes(RELOAD_MARKER), `save_note=reloaded + active_body 含重载标记`)

  console.log(results.every(Boolean) ? 'SMOKE 6/6 PASS' : 'SMOKE FAILED')
} catch (e) {
  console.error('SMOKE ERROR:', e.message)
  console.error(out.slice(-2000))
  process.exitCode = 1
} finally {
  await kill()
}
