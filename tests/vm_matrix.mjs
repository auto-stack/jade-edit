#!/usr/bin/env node
// vm_matrix.mjs — jade-edit vm 轨检查矩阵（PLAN-001 T-04 换基双臂化；
// PLAN-081 T-05 原始形态演进；PLAN-002 T-01 扩三组；PLAN-003 T-04 link 扩单）。
//
// 检查单（AC-03 检查单——vue 轨 playwright 断言域与此同单）：
//   1 boot    App 起窗渲染，status=ready（Init → back tree 成功）
//   2 tree    filetree 列出 fixture wiki 文件（.ad 按钮锚）
//   3 open    打开 .ad 进 autodown_editor（textarea 面 + 播种内容可见）
//   4 edit    编辑回写（type_text → INPUT_TEXT → 脏标）
//   5 save    保存落盘（toolbar 保存 → 脏标清 + 磁盘字节含标记 + frontmatter 保留）
//   6 reload  重载可见（磁盘外改 → toolbar 重载 → 编辑器见新内容）
//   B base    结构基线 v3 零漂移（仅 merged 臂；必须在 1-6 后、扩单前采集
//             ——v3 锁的是六检查终态，扩单不漂移基线；v3=PLAN-003 store
//             增 links_json/backlinks_open 字段重锁，v2/v1/v0 留档）
//   7 tab     tab 面：开两档 → 切换（active 断言 + 内容互换）→ dirty 档
//             关闭走确认弹层两路（取消=档留；直接关闭=弃改落盘零写入）
//   8 editops 编辑操作族：段中回车/退格（C-5 整文构造——回车分段可见 +
//             退格复原 + 脏标重算 body==original_body→false）
//   10 link   链接索引+反链面板（PLAN-003）：link_index 已知答案（语料
//             首锁：首页悬空 exists:false）→ 视图菜单开面板 → 反链三源
//             行（index/CAP 定理/Tasks）→ 点击反链行开 index.ad → 出链
//             行开 CAP 定理.ad → 关档空态（无反链/无出链）→ 重开恢复。
//             执行序在 8 后 9 前（quit 杀进程恒为臂内最后一项）
//   9 quit    退出存盘：dirty → 文件菜单退出 → CloseRequest 确认弹层 →
//             QuitSaveClose → 磁盘三验（原文/标记/frontmatter）+ 进程退出
//             （Process.exit 可能先于 HTTP 响应——连接断开即成功路径；
//             本检查杀进程，恒为臂内最后一项）
//
// 双臂（PLAN-001 换基后配方）：
//   merged 臂（默认）  auto run -r vm + JADE_WORKSPACE=隔离 fixture——
//                      back 进程内直调，零后端进程零端口；
//   split 臂（--arm split / gate 全跑）  auto run -r vm --no-merge——
//                      AutoVM HTTP back 同进程起服，HTTP 往返。
// 结构基线（v1）在 merged 臂采集比对（split 臂结构同构，不重复锁）。
//
// 卫生（vm-smoke 同款）：只杀自己 spawn 的进程；fixture 隔离拷贝（源零
// 污染）；断言域 = 结构/文本/磁盘字节（非像素）。
//
// 用法（仓根）：
//   node tests/vm_matrix.mjs                    # 双臂（gate 形态）
//   node tests/vm_matrix.mjs --arm merged       # 仅 merged
//   node tests/vm_matrix.mjs --save-baseline tests/baseline/structure-v2.txt

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const FIXTURE = path.join(repoRoot, 'e2e', '.runtime', 'workspace')

const args = process.argv.slice(2)
const argOf = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const ARM = argOf('--arm') ?? 'all' // all | merged | split
const BASELINE = path.join(repoRoot, 'tests', 'baseline', 'structure-v3.txt')
const SAVE_BASELINE = argOf('--save-baseline')

const EDIT_MARKER = 'jade-edit 冒烟标记：编辑回写可见。'
const RELOAD_MARKER = '外部重载标记：重载可见。'
const TARGET_LABEL = 'Hello World.ad'
// 扩单三组（PLAN-002 T-01）——tab 面 / 编辑操作族 / 退出存盘
const TAB_LABEL = 'Tasks.ad'
const TAB_ANCHOR = '原型设计'
const TAB_MARKER = 'tab 面标记：脏档关闭确认。'
const QUIT_MARKER = '退出存盘标记：QuitSaveClose 落盘。'
const PARA_ANCHOR = '这是一段示例文本'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------- MCP client（每臂独立端口） ----------------
function makeClient(port) {
  let nextId = 1
  const rpc = async (method, params) => {
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
    })
    if (!res.ok) throw new Error(`MCP ${method} -> HTTP ${res.status}`)
    const body = await res.json()
    if (body.error) throw new Error(`MCP ${method} error: ${JSON.stringify(body.error)}`)
    return body.result
  }
  const callTool = async (name, toolArgs) => {
    const result = await rpc('tools/call', { name, arguments: toolArgs })
    if (result.isError) throw new Error(`tool ${name} failed: ${JSON.stringify(result.content)}`)
    return result.content.map((c) => c.text ?? '').join('\n')
  }
  return { rpc, callTool }
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
function findParent(node, target, parent = null) {
  if (node === target) return parent
  for (const child of node.children) {
    const hit = findParent(child, target, node)
    if (hit !== null) return hit
  }
  return null
}

const isEditorNode = (n) =>
  n.head.startsWith('textarea ') ||
  n.head.startsWith('code_editor ') ||
  n.head.startsWith('autodown_editor ') ||
  n.head.startsWith('AutodownEditor ')

// ---------------- 单臂六检查 ----------------
async function runArm(arm, port) {
  const { rpc, callTool } = makeClient(port)
  const results = []
  const check = (id, name, ok, evidence) => {
    results.push({ id, name, ok })
    console.log(`  [${id} ${name}] ${ok ? 'PASS' : 'FAIL'} — ${evidence}`)
  }
  const snapshot = async () => parseAura(await callTool('autoui_snapshot', {}))
  const snapshotText = async () => await callTool('autoui_snapshot', {})
  const stateText = (f) => callTool('autoui_state', { fields: [f] })
  async function stateHas(field, needle, timeoutMs = 6000) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const st = await stateText(field)
      if (st.includes(needle)) return st.trim()
      if (Date.now() > deadline) throw new Error(`state.${field} never contained "${needle}": ${st.trim().slice(0, 300)}`)
      await sleep(150)
    }
  }
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
  /** press 首个 OWN label 等值（树行/弹层）或 toolbar 图标前缀形（"save保存"）按钮。
   *  exact=true 只认 ownText 全等——退出存盘用：弹层「不保存退出」endsWith('退出')
   *  恒在快照（alert-dialog 内容恒渲染），前缀匹配会误中。 */
  async function pressButton(label, { exact = false, timeoutMs = 6000 } = {}) {
    const btn = await waitButton(label, { exact, timeoutMs })
    const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press "${label}" not ok: ${res}`)
  }
  /** 轮询等按钮出现（menubar popover 展开有渲染节拍；vnode id 逐次漂移
   *  ——每次轮询重取快照，不用旧 id）。 */
  async function waitButton(label, { exact = false, timeoutMs = 6000 } = {}) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const tree = await snapshot()
      const hit = findFirst(
        tree,
        (n) =>
          n.head.startsWith('button ') &&
          elementIdOf(n) &&
          (exact ? ownText(n) === label : ownText(n) === label || ownText(n).endsWith(label)),
      )
      if (hit) return hit
      if (Date.now() > deadline) throw new Error(`button "${label}" not found in the snapshot`)
      await sleep(300)
    }
  }
  /** 活动档的 x 关闭钮：vm 快照中图标钮 ownText 空（icon 投影 [Image]），
   *  定位 = tab 标题钮的父行内兄弟空文本按钮。 */
  async function pressActiveTabClose(tabTitle) {
    const tree = await snapshot()
    const titleBtn = findFirst(tree, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === tabTitle)
    if (!titleBtn) throw new Error(`active tab button "${tabTitle}" not found`)
    const parent = findParent(tree, titleBtn)
    if (!parent) throw new Error('tab title button has no parent row')
    const xBtn = parent.children.find(
      (c) => c !== titleBtn && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === '',
    )
    if (!xBtn) throw new Error(`close (x) button next to "${tabTitle}" not found`)
    const res = await callTool('autoui_action', { element_id: elementIdOf(xBtn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press tab-x not ok: ${res}`)
  }
  /** 编辑器整文替换（C-5）：每次重取 editor id——tab 切换即重挂载，
   *  旧 vnode id 跨重挂载失效。 */
  async function typeWholeDoc(text) {
    const id = await findEditorId()
    if (!id) throw new Error('editor face not found for type_text')
    return callTool('autoui_action', { element_id: id, action: 'type_text', value: text })
  }
  /** 磁盘 .ad 文本 → body（frontmatter 剥离，无 --- 则原文）——check 4 同构造。 */
  const bodyOf = (disk) =>
    disk.split('---').length >= 3 ? disk.split('---').slice(2).join('---').replace(/^\n/, '') : disk
  async function findEditorId() {
    const tree = await snapshot()
    const ta = findFirst(tree, (n) => isEditorNode(n) && elementIdOf(n))
    return ta ? elementIdOf(ta) : null
  }

  // fixture 重灌（每臂全新——臂间零污染）
  fs.rmSync(FIXTURE, { recursive: true, force: true })
  fs.cpSync(FIXTURE_SOURCE, FIXTURE, { recursive: true })

  const split = arm === 'split'
  const app = spawn(AUTO_EXE, split ? ['run', '-r', 'vm', '--no-merge'] : ['run', '-r', 'vm'], {
    cwd: repoRoot,
    env: { ...process.env, AUTOUI_MCP_PORT: String(port), JADE_WORKSPACE: FIXTURE },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  const kill = async () => {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }

  console.log(`\n[matrix] arm: ${arm}（${split ? 'split：--no-merge，AutoVM HTTP back' : 'merged：进程内直调，零后端进程'}）`)
  try {
    const deadline = Date.now() + 45000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-edit-vm-matrix', version: '0.2.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`AutoUI MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }

    const targetFile = path.join(FIXTURE, 'wiki', TARGET_LABEL)

    // 1 boot
    let bootText = ''
    for (let i = 0; i < 60; i++) {
      try { const t = await snapshotText(); if (!/No UI available/.test(t)) { bootText = t; break } } catch {}
      await sleep(500)
    }
    check('1', 'boot', bootText.includes('ready') && bootText.includes('没有打开的文档'), 'status ready + 空态可见')

    // 2 tree：展开 wiki 目录 → .ad 行可见
    await pressButton('wiki')
    await sleep(400)
    const treeText = await snapshotText()
    const fixtureFiles = fs.readdirSync(path.join(FIXTURE, 'wiki')).filter((f) => f.endsWith('.ad'))
    const listedCount = fixtureFiles.filter((f) => treeText.includes(`"${f}"`)).length
    check('2', 'tree', listedCount === fixtureFiles.length && listedCount >= 5, `filetree 列出 ${listedCount}/${fixtureFiles.length} 个 fixture .ad`)

    // 3 open
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
    await stateHas('active_body', '这是一段示例文本')
    check('3', 'open', true, `autodown_editor 面在（element ${editorId.slice(0, 18)}…）+ 播种可见（active_body 含正文锚）`)

    // 4 edit：整文替换语义——磁盘原文构造 edited，type_text → INPUT_TEXT。
    const diskBefore = fs.readFileSync(targetFile, 'utf8')
    const edited = `${bodyOf(diskBefore)}\n\n${EDIT_MARKER}`
    const typeRes = await callTool('autoui_action', { element_id: editorId, action: 'type_text', value: edited })
    await stateIs('active_dirty', 'true')
    check('4', 'edit', /status: ok/.test(typeRes), 'type_text（整文+标记）→ INPUT_TEXT → active_dirty=true')

    // 5 save：toolbar 保存 → 脏标清 + 磁盘含标记 + frontmatter 保留
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

    // 6 reload：磁盘外改 → toolbar 重载 → active_body 含新内容
    fs.appendFileSync(targetFile, `\n${RELOAD_MARKER}\n`)
    await pressButton('重载')
    await stateHas('active_body', RELOAD_MARKER, 8000)
    check('6', 'reload', true, `磁盘外改 + toolbar 重载 → active_body 含「${RELOAD_MARKER}」`)

// 结构基线（仅 merged 臂）。
// 采集位 = 六检查后、扩单三组前：基线锁六检查终态，扩单不漂移基线。
// v2 重锁（PLAN-002 T-01）：上游快照投影属性双态（style/onclick 非确定
// 发射，1652→1784，F-RV6 家族）——仪器改为 state 逐字节 + snapshot vnode
// id 出现序列（结构哈希），双态下确定（详见基线文件头注）。
    if (arm === 'merged') {
      // 基线仪器 v2（PLAN-002 T-01 勘误定型）：上游快照投影双态（1652→1784，
      // style/onclick 属性 + 花括号包裹随实例非确定发射，F-RV6 家族）——文本
      // 层归一不可靠（textarea value 为多行原义区）。仪器改为：
      //   ## state  逐字节（全部 store 状态含 active_body——内容面）
      //   ## snapshot-ids  vnode id 出现序列（确定性内容哈希——结构面）
      // 属性双态不影响两段 ⇒ 基线确定；真实结构漂移（增删节点/移位）必然
      // 改 id 序列。归因与登记见 parity-ledger D-18 / 上游供料包。
      const stateDump = (await callTool('autoui_state', {})).trim()
      const snapIds = JSON.stringify([...(await snapshotText()).matchAll(/#(vnode_\d+)/g)].map((m) => m[1]))
      const headerFor = (file) =>
        `// jade-edit vm 结构基线 v3（PLAN-003 T-04 重锁；v2=PLAN-002 T-01、v1=PLAN-001 T-04 换基、v0=PLAN-081 T-05 均留档）。\n` +
        `// 重锁因由：store 新增 links_json/backlinks_open 字段（PLAN-003 链接索引）进 autoui_state 全量\n` +
        `// dump——逐字节必漂移，属计划内态扩（非漂移事故）。仪器同 v2：state 段逐字节 + snapshot\n` +
        `// vnode id 出现序列；终态 = 六检查后满状态（chrome 全套 + Hello World.ad 开）。\n` +
        `// 再生成：node tests/vm_matrix.mjs --save-baseline ${path.relative(repoRoot, file).replace(/\\\\/g, '/')}\n`
      const baselineBodyOf = () => `## state\n${stateDump}\n\n## snapshot-ids\n${snapIds}\n`
      if (SAVE_BASELINE) {
        fs.mkdirSync(path.dirname(SAVE_BASELINE), { recursive: true })
        fs.writeFileSync(SAVE_BASELINE, headerFor(SAVE_BASELINE) + baselineBodyOf())
        console.log(`  [baseline] saved: ${SAVE_BASELINE}`)
      } else if (fs.existsSync(BASELINE)) {
        const raw = fs.readFileSync(BASELINE, 'utf8')
        const ok = raw === headerFor(BASELINE) + baselineBodyOf()
        check('B', 'baseline', ok, ok ? '结构基线 v3 零漂移（state 逐字节 + id 序列）' : '结构基线漂移（--save-baseline 重锁需人工裁定）')
      } else {
        console.log('  [baseline] structure-v3 不存在——首锁：node tests/vm_matrix.mjs --save-baseline tests/baseline/structure-v3.txt')
      }
    }

    // 7 tab 面：开两档 → 切换（active 断言 + 内容互换）→ dirty 档关闭确认两路。
    // vm 快照中 alert-dialog 内容恒渲染（闭态也在树里），弹层开出与否以
    // state confirm_open 断言，不以按钮出现为准；弹层按钮 press 恒可达。
    await pressButton(TAB_LABEL)
    await stateIs('tab_count', '2')
    await stateHas('active_body', TAB_ANCHOR)
    const tabTitleOf = (label) => `wiki/${label.replace(/\.ad$/, '')}`
    await pressButton(tabTitleOf(TARGET_LABEL))
    await stateHas('active_body', PARA_ANCHOR)
    await pressButton(tabTitleOf(TAB_LABEL))
    await stateHas('active_body', TAB_ANCHOR)
    // dirty Tasks（C-5 整文构造）→ 切走再切回：脏标经 TabActivate 投影还原
    await typeWholeDoc(`${bodyOf(fs.readFileSync(path.join(FIXTURE, 'wiki', TAB_LABEL), 'utf8'))}\n\n${TAB_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressButton(tabTitleOf(TARGET_LABEL))
    await stateHas('active_body', PARA_ANCHOR)
    await pressButton(tabTitleOf(TAB_LABEL))
    await stateIs('active_dirty', 'true')
    // 取消路：弹层开 → 取消 → 档留 + 脏标保
    await pressActiveTabClose(tabTitleOf(TAB_LABEL))
    await stateIs('confirm_open', 'true')
    await pressButton('取消', { exact: true })
    await stateIs('confirm_open', 'false')
    await stateIs('tab_count', '2')
    await stateIs('active_dirty', 'true')
    // 直接关闭路：弃改关闭（磁盘零写入）→ 档数回落 + 激活回落 Hello World
    await pressActiveTabClose(tabTitleOf(TAB_LABEL))
    await stateIs('confirm_open', 'true')
    await pressButton('直接关闭', { exact: true })
    await stateIs('tab_count', '1')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    const tabDisk = fs.readFileSync(path.join(FIXTURE, 'wiki', TAB_LABEL), 'utf8')
    check('7', 'tab', !tabDisk.includes(TAB_MARKER), `双档切换互换 + dirty 关闭确认两路（取消档留/直接关闭弃改，磁盘零写入=${!tabDisk.includes(TAB_MARKER)}）`)

    // 8 编辑操作族：段中回车/退格（C-5 整文构造达成同语义）。
    // state dump 中字符串换行以 \n 字面转义呈现——断言锚用转义形。
    await typeWholeDoc(bodyOf(fs.readFileSync(targetFile, 'utf8')).replace(PARA_ANCHOR, '这是一段\n示例文本'))
    await stateHas('active_body', '一段\\n示例')
    await stateIs('active_dirty', 'true')
    await typeWholeDoc(bodyOf(fs.readFileSync(targetFile, 'utf8')))
    await stateHas('active_body', PARA_ANCHOR)
    await stateIs('active_dirty', 'false')
    check('8', 'editops', true, '段中回车分段可见（active_body 含转义换行锚）+ 退格复原 + 脏标重算 body==original→false')

    // 10 link（PLAN-003 T-04）：链接索引已知答案 + 反链面板 + 点击开档 +
    // 空态。执行序在 quit 前（quit 杀进程恒为臂内最后一项）；id 10 = 扩单
    // 序号延续。期望值 = T-02 语料首锁（docs/plans/003 §8 T-02 证据）：
    //   Hello World 出链 {CAP 定理:true, 首页:false(悬空)}；
    //   反链源 = index/CAP 定理/Tasks 三档；index 无反链（首页悬空）。
    await stateHas('links_json', 'wiki/Hello World.ad')
    // state dump 对字符串值引号转义（\" 形态）——锚用转义形（T-04 实勘）。
    await stateHas('links_json', '{\\"target\\":\\"首页\\",\\"anchor\\":\\"\\",\\"exists\\":false,\\"target_path\\":\\"\\"}')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    const blBtn1 = await waitButton('wiki/index.ad', { exact: true })
    const blBtn1Id = elementIdOf(blBtn1)
    await waitButton('wiki/CAP 定理.ad', { exact: true })
    await waitButton('wiki/Tasks.ad', { exact: true })
    const panelText1 = await snapshotText()
    const panelOk = panelText1.includes('首页（悬空）') && panelText1.includes('CAP 定理')
    check('10', 'link', panelOk, `link_index 已知答案（首页悬空存在判）+ 面板反链三源（index/CAP 定理/Tasks）+ 出链段（CAP 定理钮/首页悬空文本）=${panelOk}`)
    // 点击反链行 → 开来源档 index.ad（ASCII 路径——HTTP 通道可导航；
    // CJK 路径 GET query 解码缺口见 D-19，CJK 导航子步仅 merged 臂）
    await callTool('autoui_action', { element_id: blBtn1Id, action: 'press' })
    await stateIs('active_title', 'wiki/index')
    await stateHas('active_body', 'Jade Garden 测试知识库')
    // index 无反链 → 空态文本（text 节点，非 button——快照包含轮询）
    const emptyDeadline = Date.now() + 6000
    let emptyIdx = ''
    for (;;) {
      emptyIdx = await snapshotText()
      if (emptyIdx.includes('（无反链）')) break
      if (Date.now() > emptyDeadline) throw new Error('empty-state text （无反链） never appeared for index.ad')
      await sleep(300)
    }
    // 出链行点击（ASCII 目标 Hello World——两轨同单）；随后 CJK 目标子步
    // 仅 merged（D-19 上游缺口：HTTP GET query UTF-8 不解码，CJK 路径
    // exists/read_wiki 全败——先在缺口，vue/split 轨点 CJK 树行同败，
    // 本切片首测暴露；unlock = 上游 HTTP 层解码修复）
    await pressButton('Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await stateHas('active_body', PARA_ANCHOR)
    if (arm === 'merged') {
      await pressButton('CAP 定理', { exact: true })
      await stateIs('active_title', 'wiki/CAP 定理')
      await stateHas('active_body', 'CAP 定理指出')
    }
    // 空态（无激活档）：文件→新建（untitled，path 空 → 行集空）→ 双空态
    // 文本（stateIs 通过后视图渲染滞后一拍——轮询快照，同上款）
    await pressButton('文件', { exact: true })
    await pressButton('新建', { exact: true })
    await stateIs('active_title', '未命名')
    const untDeadline = Date.now() + 6000
    let emptyText = ''
    for (;;) {
      emptyText = await snapshotText()
      if (emptyText.includes('（无反链）') && emptyText.includes('（无出链）')) break
      if (Date.now() > untDeadline) break
      await sleep(300)
    }
    const emptyOk = emptyText.includes('（无反链）') && emptyText.includes('（无出链）')
    // 关 untitled（未脏直接关）→ 重开 Hello World（树仍展开；Open 已开即
    // 激活）→ 反链行恢复，quit 检查前置状态还原（此时 tabs = HW/index/CAP）
    await pressActiveTabClose('未命名')
    await pressButton(TARGET_LABEL)
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await waitButton('wiki/CAP 定理.ad', { exact: true })
    check('10b', 'link-empty', emptyOk, `点击反链行开 index.ad + 出链行开 CAP 定理.ad + 空态（untitled 激活）双文本=${emptyOk} + 重开行恢复`)

    // 9 退出存盘：dirty → 文件菜单退出 → 确认弹层 → QuitSaveClose →
    // 磁盘三验 + 进程退出。恒为臂内最后一项（Process.exit 杀进程）。
    await typeWholeDoc(`${bodyOf(fs.readFileSync(targetFile, 'utf8'))}\n\n${QUIT_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressButton('文件', { exact: true })
    await pressButton('退出', { exact: true })
    await stateIs('quit_confirm_open', 'true')
    let quitRes = ''
    try {
      quitRes = await callTool('autoui_action', {
        element_id: elementIdOf(await waitButton('保存并退出', { exact: true })),
        action: 'press',
      })
    } catch {
      // Process.exit 可能先于 HTTP 响应杀进程——连接断开即成功路径
      //（auto-edit desktop_mcp T8 同款口径）。
    }
    const quitDeadline = Date.now() + 10000
    while (app.exitCode === null && Date.now() < quitDeadline) await sleep(300)
    const exited = app.exitCode !== null
    let quitDisk = ''
    if (exited) {
      for (const dl = Date.now() + 6000; ; ) {
        quitDisk = fs.readFileSync(targetFile, 'utf8')
        if (quitDisk.includes(QUIT_MARKER)) break
        if (Date.now() > dl) break
        await sleep(150)
      }
    }
    const quitOk = exited && quitDisk.includes(QUIT_MARKER) && quitDisk.includes(PARA_ANCHOR) && quitDisk.includes('title: Hello World')
    check('9', 'quit', quitOk, `进程退出=${exited}（exit=${app.exitCode}${quitRes ? '' : '，press 响应随进程终止断连——成功路径'}） 磁盘三验（原文/标记/frontmatter）=${quitOk}`)
  } finally {
    await kill()
  }

  return results
}

// ---------------- run ----------------
const arms = ARM === 'all' ? ['merged', 'split'] : [ARM]
const all = []
let failed = 0
for (const [idx, arm] of arms.entries()) {
  const port = 9381 + idx * 2
  const results = await runArm(arm, port)
  all.push({ arm, results })
  failed += results.filter((r) => !r.ok).length
}
for (const { arm, results } of all) {
  const pass = results.filter((r) => r.ok).length
  console.log(`[matrix:${arm}] ${pass}/${results.length} checks passed`)
}
if (failed > 0) process.exitCode = 1
if (all.every(({ results }) => results.every((r) => r.ok))) {
  console.log(`[matrix] ALL GREEN：${arms.join(' + ')} 臂检查单全过（六检查 + 基线[merged] + tab/editops/link 扩单 + quit）`)
}
