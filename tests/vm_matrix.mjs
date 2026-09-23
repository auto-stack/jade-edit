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
//   10m mentions 未链接提及段（PLAN-009；link 组子步——组数不变，fail
//             即臂败，10c 同款）：六子步——①三段标题（反链/出链/未链
//             接提及）②提及行已知答案 + 已链源排重（测试内造 Mention A
//             纯文本提及 Hello World / Mention B 已链 [[Hello World]]/
//             Mention C 纯文本提及 Tasks——A 入提及段[B 只在反链段]，
//             段区域断言——文件树同列根档 .ad，全文 includes 误中树行）
//             ③行点击 OpenLink（段内行钮定位——全文首个匹配是树行）
//             ④激活变更刷新（切 Tasks → C 行）⑤空态（开 Mention A 本
//             档——无提及者）⑥面板关零 fetch（行为等价断言——关面板
//             → 激活变更 → mention_rows dump 行恒旧值 + 段不渲染；
//             merged 臂网络不可观测[§10.1 落定口径]）。素材 ASCII 双臂
//             ——search_wiki POST 面无（D-19 不涉）；造档后过一次面板
//             关开触点（LinksRefreshOf——B 入 bl_rows 排重断言域成立）。
//             执行序在 10b 后 10c 前（10c 首步按「面板开/active=Hello
//             World」口径——子步收尾复原该态）
//   10c create 悬空建页弧线（PLAN-005）：悬空行点击 → 确认弹层 → 取消
//             零落盘 → 创建 → 落盘 + 链接翻转（触发集 v2）→ 树新行
//             （G3）→ 行翻转；CJK 开档播种子步仅 merged 臂（D-19 同款
//             口径——split 以磁盘/翻转面断言替代）。子步不占检查位
//             （组数不变 12），fail 即臂败
//   11 find   查找面板双模式（PLAN-004）：快开（Ctrl+P·files——开面板/
//             input 锚/type_text 过滤[Pro→Projects 独行 + CJK 定理→CAP
//             独行；CJK 拾取导航子步仅 merged 臂——D-19 同款口径]）+
//             全文检索（Ctrl+Shift+F·text——切模式/未运行提示/CJK 查询
//             「任务列表」[POST 通道——D-19 面无，双臂同跑]/行导航面板
//             保持开/运行后空态）。执行序在 10b 后 9 前
//   12 rename 重命名+反链改写全弧线（PLAN-006；七子步——禁用态 untitled
//             +脏档/弹层锚[预填+影响面预览]/取消零落盘/改名弧线[active
//             投影+磁盘改写 index·CAP 定理]/面板+树新 stem/case-only 拒
//             [弹层留置]/状态复原。素材 Projects.ad ASCII 双臂——D-19
//             面无；CJK 改名/自链/清洗/冲突/缺失案由 tests/probe_rename
//             .mjs 八案双臂直证覆盖）。执行序在 11 后 9 前
//   13 file   树文件管理全弧线（PLAN-007；八子步——新建 index[ASCII 根
//             落位]/同名幂等/取消零落盘/CJK 新页[merged 导航 + split 磁
//             盘，D-19 口径]/删除预览+取消[3 处入链已知答案——index/
//             Tasks/Hello World，T-03 实勘校正]/删除弧线[磁盘消失+
//             tab 关闭邻档+树行消失]/悬空翻转[开 index 出链行 CAP 定
//             理（悬空）——PLAN-003 已知答案反向]/未选中 no-op。删除
//             素材 CAP 定理——merged 臂该档 tab 在[check 10 开]关闭面
//             +邻档补位，split 臂现场开→关同面；两臂删后激活均落
//             Project X[右侧邻档同构]。收尾状态复原回 Hello World
//             [quit 前置——typeWholeDoc 目标档]）+ F-R9-4 案（PLAN-010
//             ⑨——删激活靶档→提及行随新激活刷新消[Fr94Src/Fr94Del 弹
//             层造档，收尾双删复原]）。执行序在 12 后 9 前
//   14 meta   标签面板+wanted 模式八子步 + inline tag 子步（PLAN-008 +
//             PLAN-009；双件同组——find 组先例。tags 子步：面板开 7 tag
//             行[语料实勘全集——执行期校正：7 非计划记的 6，Hello
//             World.ad 实有 demo]/展开导航 ASCII 双臂+CJK 仅 merged[D-19]/
//             Save 刷新外造新行。wanted 子步：模式入口无 input 行无检索
//             钮/语料已知答案页面名（1）【执行期校正：悬空全集=首页+页
//             面名，首页已被 10c 消缺故不在此位】+外造 Wanted Target（1）/
//             取消零落盘/创建开档+消缺+exists 翻转+模板逐字节/空态闭环
//             （无悬空链接）。inline 子步（PLAN-009 T-04 meta 组）：⑦外造
//             body #inline-meta 档[fm 无 tags 键——纯 body 聚合源]保存 →
//             面板新行；⑧语料基线零漂移回归（7 语料 tag 行全在 + 忽略面
//             负向——无 block-project-a 行：`{#block-project-a}` 块锚/
//             `\[\[Tasks#block-project-b\]\]` 转义链接锚双形态不入集，
//             TAGS 区段断言[编辑器文本在面板前——全文负向会误中]）。
//             执行序在 10c 后 11 前——此位 tags 全集/悬空余量已知答案成
//             立；收尾复原反链面板开[check 11 首步口径]）
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
const BASELINE = path.join(repoRoot, 'tests', 'baseline', 'structure-v9.txt')
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
// rename 组（PLAN-006 T-04）——素材 Projects.ad（ASCII 双臂；入链 index/
// CAP 定理 两页两处——预览/改写断言域）
const RENAME_LABEL = 'Projects.ad'
const RENAME_OLD_TITLE = 'wiki/Projects'
const RENAME_NEW_NAME = 'Project X'
const RENAME_NEW_TITLE = 'wiki/Project X'
const RENAME_NEW_REL = 'wiki/Project X.ad'
const RENAME_DIRTY_MARKER = 'rename 组脏档标记。'
// file 组（PLAN-007 T-04）——新建素材 index（ASCII 根落位；wiki/index.ad
// 同名异位不冲突）+ 新页（CJK）；删除素材 CAP 定理（3 入链 = index/
// Tasks/Hello World——T-03 实勘校正已知答案）。
const FILE_NEW_NAME = 'index'
const FILE_NEW_REL = 'index.ad'
const FILE_CJK_NAME = '新页'
const FILE_CJK_REL = '新页.ad'
const FILE_GHOST_NAME = 'Ghost Note'
const FILE_DEL_LABEL = 'CAP 定理.ad'
const FILE_DEL_REL = 'wiki/CAP 定理.ad'

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
      if (Date.now() > deadline) {
        const dbg = await snapshotText()
        const dbgState = await callTool('autoui_state', {})
        fs.writeFileSync(`e2e/.runtime/fail-snap-${Date.now()}.txt`, dbg + '\n=====STATE=====\n' + dbgState)
        throw new Error(`button "${label}" not found (full snap+state dumped)`)
      }
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
        `// jade-edit vm 结构基线 v9（PLAN-009 T-04 重锁；v8=PLAN-008 T-04、v7=PLAN-007 T-04、\n` +
        `// v6=PLAN-006 T-04、v5=PLAN-005 T-04、v4=PLAN-004 T-04、v3=PLAN-003 T-04、v2=PLAN-002\n` +
        `// T-01、v1=PLAN-001 T-04 换基、v0=PLAN-081 T-05 均留档）。\n` +
        `// 重锁因由：App 模型新增 mention_rows 字段（PLAN-009 未链接提及数据态——唯一新模型\n` +
        `// 字段，store 零新增）进 autoui_state 全量 dump；反链面板第三段（未链接提及）在\n` +
        `// backlinks_open 块内——基线采样点面板关故 snapshot vnode id 序列不扩（段节点仅在\n` +
        `// 面板开时渲染）；零新增键位/菜单项。\n` +
        `// 仪器同 v2..v8：state 段逐字节 + snapshot vnode id 出现序列；终态 = 六检查后满状态\n` +
        `//（chrome 全套 + Hello World.ad 开；查找面板/建页弹层/新建弹层/重命名弹层/删除弹层/\n` +
        `// 标签面板/反链面板未开——find_*/create_*/new_*/rename_*/delete_*/tags_*/mention_rows 全为\n` +
        `// 默认值入 dump）。\n` +
        `// 再生成：node tests/vm_matrix.mjs --save-baseline ${path.relative(repoRoot, file).replace(/\\\\/g, '/')}\n`
      const baselineBodyOf = () => `## state\n${stateDump}\n\n## snapshot-ids\n${snapIds}\n`
      if (SAVE_BASELINE) {
        fs.mkdirSync(path.dirname(SAVE_BASELINE), { recursive: true })
        fs.writeFileSync(SAVE_BASELINE, headerFor(SAVE_BASELINE) + baselineBodyOf())
        console.log(`  [baseline] saved: ${SAVE_BASELINE}`)
      } else if (fs.existsSync(BASELINE)) {
        const raw = fs.readFileSync(BASELINE, 'utf8')
        const ok = raw === headerFor(BASELINE) + baselineBodyOf()
        check('B', 'baseline', ok, ok ? '结构基线 v9 零漂移（state 逐字节 + id 序列）' : '结构基线漂移（--save-baseline 重锁需人工裁定）')
      } else {
        console.log('  [baseline] structure-v9 不存在——首锁：node tests/vm_matrix.mjs --save-baseline tests/baseline/structure-v9.txt')
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

    // 10m mentions（PLAN-009 T-04；link 组 mentions 子步——组内子步不占
    // 检查位，fail 即臂败，10c 同款）：未链接提及段六子步（文件头检查单
    // 10m 注记）。此位态：面板开 + active=Hello World（10b 收尾）——
    // ②提及断言前须过一次面板关开触点（LinksRefreshOf——外造档入
    // link_pages，B 入 bl_rows 排重断言域成立）。
    const mnAFile = path.join(FIXTURE, 'Mention A.ad')
    const mnBFile = path.join(FIXTURE, 'Mention B.ad')
    const mnCFile = path.join(FIXTURE, 'Mention C.ad')
    fs.writeFileSync(mnAFile, '纯文本提到 Hello World 一词。\n', 'utf8')
    fs.writeFileSync(mnBFile, '链接 [[Hello World]] 于此。\n', 'utf8')
    fs.writeFileSync(mnCFile, '散文本提到 Tasks 一词。\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // ① 三段标题 + ② 提及行已知答案（段区域断言——文件树同列根档
    // .ad，全文 includes 会误中树行；行集两行留根 = path 钮 + snippet
    // 次行 text）
    let mnRegion = ''
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const i = t.indexOf('未链接提及')
      mnRegion = i >= 0 ? t.slice(i) : ''
      if (mnRegion.includes('Mention A.ad') && mnRegion.includes('纯文本提到 Hello World 一词')) break
      if (Date.now() > dl) throw new Error(`mentions ①② 失守（段标题/提及行/snippet 未现）:\n${mnRegion.slice(0, 400)}`)
      await sleep(300)
    }
    // ② 排重：B 已链源不入提及段（B 在反链段/树行——段区域负向断言
    // 不误中）
    if (mnRegion.includes('Mention B.ad')) throw new Error('mentions 排重失守（B 已链源重复入提及段）:\n' + mnRegion.slice(0, 400))
    // ③ 行点击 OpenLink（段内行钮——全文首个匹配是树行[ft_sel 副作用
    // 面]，取快照序最后一个 'Mention A.ad' 钮——10c 首页钮同款消歧）
    {
      const t = await snapshot()
      const btns = []
      const collect = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === 'Mention A.ad') btns.push(n)
        for (const c of n.children) collect(c)
      }
      collect(t)
      const rowBtn = btns[btns.length - 1]
      if (!rowBtn) throw new Error('mentions 行钮未找到')
      const res = await callTool('autoui_action', { element_id: elementIdOf(rowBtn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press mention row not ok: ${res}`)
    }
    await stateIs('active_title', 'Mention A')
    // ⑤ 空态（无提及档）：Mention A 自身无提及者 → 段空态文本（区段
    // 断言——空态即足；负向行集断言不设：恒渲染删除弹层带 ft_sel 文本
    // 会误中）
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const region = t.slice(t.indexOf('未链接提及'))
        if (region.includes('（无未链接提及）')) break
        if (Date.now() > dl) throw new Error('mentions ⑤ 空态失守（（无未链接提及）未现）:\n' + region.slice(0, 300))
        await sleep(300)
      }
    }
    // ④ 激活变更刷新：树行开 Tasks（OpenFile 触点）→ 提及段随 stem 变
    // （C 行在、A 行不在——段区域断言）
    await pressButton('Tasks.ad')
    await stateIs('active_title', 'wiki/Tasks')
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const region = t.slice(t.indexOf('未链接提及'))
        if (region.includes('Mention C.ad') && !region.includes('Mention A.ad')) break
        if (Date.now() > dl) throw new Error('mentions ④ 激活刷新失守（C 行应现/A 行应消）:\n' + region.slice(0, 400))
        await sleep(300)
      }
    }
    // ⑥ 面板关零 fetch（行为等价断言——merged 臂网络不可观测，§10.1
    // 落定口径）：关面板 → 激活变更（OpenLink 触点 fetch 被守卫拦）→
    // mention_rows dump 行恒旧值 + 段不渲染
    const mnStateBefore = (await stateText('mention_rows')).trim()
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    const mnStateAfter = (await stateText('mention_rows')).trim()
    if (mnStateBefore !== mnStateAfter) throw new Error(`mentions ⑥ 守卫失守（面板关激活变更后 mention_rows 变：${mnStateBefore} -> ${mnStateAfter}）`)
    if ((await snapshotText()).includes('未链接提及')) throw new Error('mentions ⑥ 守卫失守（面板关时段仍渲染）')
    // 收尾复原 10c 口径：面板开（ActBacklinks 触发集——链接/提及重取）
    // + 10m 开启的 Mention A/Tasks tab 关闭（洁净未脏直接关——check 13
    // 删除后激活落点的已知答案按 [HW,index,CAP,…] tab 序口径，子步
    // 残留 tab 会漂位）
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // tab 关闭 hygiene：先激活（tab 题钮 press = OpenLink 激活）再 x 关
    //（非激活 tab 行无 x 钮——view 结构在册）
    await pressButton('Mention A', { exact: true })
    await pressActiveTabClose('Mention A')
    await pressButton(tabTitleOf(TAB_LABEL), { exact: true })
    await pressActiveTabClose(tabTitleOf(TAB_LABEL))
    await stateIs('tab_count', arm === 'merged' ? '3' : '2')
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))

    // linkify 子步（PLAN-010 T-04 ④⑤）：点击提及行「转为链接」钮
    // → 提及行消失 + 反链段增行 + 磁盘逐字节含 [[Hello World]]
    await pressButton('转为链接', { exact: true })
    let linkifyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iLinks = t.indexOf('LINKS')
      const iMentions = t.indexOf('未链接提及')
      const linksPart = iMentions >= 0 ? t.slice(iLinks, iMentions) : t.slice(iLinks)
      const mentionsPart = iMentions >= 0 ? t.slice(iMentions) : ''
      if (linksPart.includes('Mention A.ad') && !mentionsPart.includes('Mention A.ad')) {
        linkifyOk = true
        break
      }
      if (Date.now() > dl) throw new Error(`linkify ④⑤ 失守（未能见 Mention A.ad 入反链段或提及段未消）:\n${t.slice(0, 600)}`)
      await sleep(300)
    }
    const mnABodyAfter = fs.readFileSync(mnAFile, 'utf8')
    if (!mnABodyAfter.includes('纯文本提到 [[Hello World]] 一词。')) {
      throw new Error(`linkify 磁盘逐字节验证失守: ${mnABodyAfter}`)
    }

    // alias 子步（PLAN-010 T-04 ①②③）：
    // ① 造 alias 档 + 呼叫源档 → 呼叫源档出链行「帽子定理」可点击（exists 翻转）
    //   → 导航落 CAP.ad（merged 臂；split 臂 target_path/磁盘断言）
    // ② CAP.ad 反链段增呼叫源档行
    // ③ wanted 清单不含 alias 解析目标「帽子定理」
    const aliasCapFile = path.join(FIXTURE, 'CAP.ad')
    const aliasCallerFile = path.join(FIXTURE, 'AliasCaller.ad')
    fs.writeFileSync(aliasCapFile, '---\ntitle: CAP\naliases:\n  - 帽子定理\n---\n\n# CAP\n\nCAP 定理内容。\n', 'utf8')
    fs.writeFileSync(aliasCallerFile, '# Caller\n\n[[Hello World]]\n[[帽子定理]]\n', 'utf8')
    // 关开一次反链面板触发 LinksRefreshOf，让 link_index 收集新造的 alias 档与 caller 档
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // Hello World 的反链段中可见 AliasCaller.ad 钮，点击开档
    await waitButton('AliasCaller.ad', { exact: true })
    await pressButton('AliasCaller.ad', { exact: true })
    await stateIs('active_title', 'AliasCaller')
    // 检查出链段：帽子定理 为可点击钮（exists: true），非「帽子定理（悬空）」
    let aliasOlOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iOl = t.indexOf('出链')
      const iMn = t.indexOf('未链接提及')
      const olPart = iMn >= 0 ? t.slice(iOl, iMn) : t.slice(iOl)
      if (olPart.includes('帽子定理') && !olPart.includes('帽子定理（悬空）')) {
        aliasOlOk = true
        break
      }
      if (Date.now() > dl) throw new Error(`alias ① 失守（出链段未见非悬空 帽子定理 钮）:\n${t.slice(0, 600)}`)
      await sleep(300)
    }
    // ① 导航落 CAP.ad（merged 臂点击开档；split 臂 links_json target_path 断言）
    if (arm === 'merged') {
      await pressButton('帽子定理', { exact: true })
      await stateIs('active_title', 'CAP')
      // ② CAP.ad 反链段增呼叫源档行
      let capBlOk = false
      for (const dl = Date.now() + 8000; ; ) {
        const t = await snapshotText()
        const iLinks = t.indexOf('LINKS')
        const iOl = t.indexOf('出链')
        const blPart = iOl >= 0 ? t.slice(iLinks, iOl) : t.slice(iLinks)
        if (blPart.includes('AliasCaller.ad')) {
          capBlOk = true
          break
        }
        if (Date.now() > dl) throw new Error(`alias ② 失守（CAP.ad 反链段未见 AliasCaller.ad）:\n${t.slice(0, 600)}`)
        await sleep(300)
      }
    } else {
      await stateHas('links_json', '{\\"target\\":\\"帽子定理\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"CAP.ad\\"}')
    }
    // ③ wanted 清单不含 alias 解析目标「帽子定理」
    const ljNow = await stateText('links_json')
    if (ljNow.includes('{\\"target\\":\\"帽子定理\\",\\"anchor\\":\\"\\",\\"exists\\":false')) {
      throw new Error('alias ③ 失守（帽子定理 误入 wanted 悬空集）')
    }
    // 收尾：关闭新开 tab，删除测试档，切回 Hello World
    if (arm === 'merged') {
      await pressActiveTabClose('CAP')
    }
    await pressButton('AliasCaller', { exact: true })
    await pressActiveTabClose('AliasCaller')
    fs.rmSync(aliasCapFile, { force: true })
    fs.rmSync(aliasCallerFile, { force: true })
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))

    console.log(`  [10m mentions] PASS — 六子步+aliases+linkify（三段标题/提及行已知答案+snippet+已链源排重/行点击 OpenLink/空态[无提及档]/激活变更刷新/面板关零 fetch[行为等价]；linkify 行转链+段间迁移+磁盘逐字节；alias 解析+出链翻转+反链归并+wanted 排除；素材 ASCII 双臂[search_wiki POST 面无]；收尾 tab 复原）`)

    // 10c 建页弧线（PLAN-005 T-04；子步不占检查位——组数不变 12）：悬空行
    // 点击 → 确认弹层（create_confirm_open/create_target 态）→ 取消零落盘
    // → 创建 → 落盘 → 链接翻转（触发集 v2）→ 树新行（G3）→ 行翻转；
    // CJK 开档导航子步仅 merged 臂（D-19 同款口径——split 以磁盘/翻转面
    // 断言替代，active 保持 Hello World）。取消路前置（创建后行翻转为可
    // 点击钮——同一悬空行素材先走取消路）。弹层按钮 press = 「创建」钮
    // （全树唯一）父 footer 行兄弟域（三弹恒渲染 + 弹层根匿名 col——T-02
    // 实勘）。
    const pressInCreateDialog = async (buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const createBtn = findFirst(t, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '创建')
        if (createBtn) {
          if (buttonText === '创建') {
            const res = await callTool('autoui_action', { element_id: elementIdOf(createBtn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press 创建 not ok: ${res}`)
            return
          }
          const row = findParent(t, createBtn)
          const btn = row.children.find((c) => c !== createBtn && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === buttonText)
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText} not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in create-dialog row not found`)
        await sleep(300)
      }
    }
    const newPageFile = path.join(FIXTURE, '首页.ad')
    await pressButton('首页（悬空）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await stateIs('create_target', '首页')
    await pressInCreateDialog('取消')
    await stateIs('create_confirm_open', 'false')
    const cancelOk = !fs.existsSync(newPageFile)
    if (!cancelOk) throw new Error('建页取消路零落盘失守（首页.ad 不应在）')
    await pressButton('首页（悬空）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await pressInCreateDialog('创建')
    await stateIs('create_confirm_open', 'false')
    let createDiskOk = false
    for (const dl = Date.now() + 8000; ; ) {
      createDiskOk = fs.existsSync(newPageFile)
      if (createDiskOk || Date.now() > dl) break
      await sleep(200)
    }
    if (!createDiskOk) throw new Error('建页落盘失守（首页.ad 缺）')
    await stateHas('links_json', '{\\"target\\":\\"首页\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"首页.ad\\"}')
    // 回源档语境再断言面板行翻转（创建成功即开新档——新档自身出链为空，
    // 翻转行只在本源档[Hello World]出链段可见）。merged 从新档 tab 返回；
    // split 同按 tab 题钮（ASCII 路径——行重算随 OpenLink 显式 path，原地
    // 激活语义）。
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // 翻转断言：悬空钮消失 + 面板行钮在（'首页' 与 tab 题钮同名[merged 新
    // 档 tab 在]——计数消歧：merged ≥2[tab+行]、split ≥1[行]；行钮 = 快照
    // 序最后一个——tab 条先于右面板渲染）。
    let treeRowOk = false
    let flipBtnOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const tree = await snapshot()
      const homeBtns = []
      const collect = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '首页') homeBtns.push(n)
        for (const c of n.children) collect(c)
      }
      collect(tree)
      treeRowOk = t.includes('"首页.ad"')
      flipBtnOk = !t.includes('首页（悬空）') && homeBtns.length >= (arm === 'merged' ? 2 : 1)
      if (treeRowOk && flipBtnOk) break
      if (Date.now() > dl) break
      await sleep(300)
    }
    let navNote = ''
    if (arm === 'merged') {
      // CJK 导航子步：press 面板翻转行（快照序最后一个 '首页' 钮）→ 开档
      // + 播种模板断言。
      const t = await snapshot()
      const homeBtns = []
      const collect = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '首页') homeBtns.push(n)
        for (const c of n.children) collect(c)
      }
      collect(t)
      const rowBtn = homeBtns[homeBtns.length - 1]
      const res = await callTool('autoui_action', { element_id: elementIdOf(rowBtn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press 首页 row not ok: ${res}`)
      await stateIs('active_title', '首页')
      await stateHas('active_body', '# 首页')
      navNote = '/CJK 开档播种（merged）'
    } else {
      // split 臂 D-19 口径：CJK 开档导航全败（GET query 不解码）——active
      // 保持 Hello World（Open not-found 落 save_note；弹层已闭/重取已翻）。
      await stateIs('active_title', tabTitleOf(TARGET_LABEL))
      navNote = '/CJK 开档仅 merged（D-19；split 以磁盘+翻转断言替代）'
    }
    const createOk = cancelOk && createDiskOk && treeRowOk && flipBtnOk
    console.log(`  [10c create] ${createOk ? 'PASS' : 'FAIL'} — 建页弧线（取消零落盘/创建落盘/链接翻转/树新行/行翻转${navNote}）`)
    if (!createOk) {
      results.push({ id: '10c', name: 'create', ok: false })
      throw new Error('10c 建页弧线断言失守')
    }

    // 14 meta（PLAN-008 T-04）：tags 面板 + wanted 模式八子步（双件同组
    // ——PLAN-004 find 组先例；组内子步不占检查位，fail 即臂败，10c/12
    // 同款）。执行序在 10c 后 11 前（此位语料态 = tags 全集 7[13 file
    // 未删 CAP/12 rename 未改名] + 悬空仅剩 页面名（1）——首页已被 10c
    // 建页消缺【执行期校正：语料悬空全集 = 首页+页面名，index.ad 尾行
    // [[页面名]] 亦悬空】）。前置：关反链面板（10 开着——tags/wanted
    // 行断言免反链行 .ad 路径文本重叠）；收尾：复原反链面板开（check
    // 11 首步「开着→关」口径不漂移）+ find 面板关。
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    // tags ①：面板开启 + 7 tag 行（label 计数断言；语料实勘全集【执行
    // 期校正：7 非 6——Hello World.ad 实有 `tags: - demo`，计划原记
    // 「无 tags 键」漏勘】）
    await pressButton('视图', { exact: true })
    await pressButton('切换标签', { exact: true })
    await stateIs('tags_open', 'true')
    const metaTagsSnap = await snapshotText()
    const metaTagLabels = ['tasks · 1', 'distributed-systems · 1', 'theory · 1', 'demo · 1', 'project-management · 1', 'index · 1', 'jade-garden · 1']
    const metaTagsOk = metaTagLabels.every((l) => metaTagsSnap.includes(`"${l}"`))
    if (!metaTagsOk) throw new Error('tags 面板 7 tag 行不全（已知答案失守）')
    // tags ②：展开页行 + 导航（ASCII tasks 双臂；CJK CAP 仅 merged——
    // D-19 口径，check 10 同款；单选手风琴换选语义随在）
    await pressButton('tasks · 1', { exact: true })
    await stateIs('tag_expanded', 'tasks')
    await pressButton('wiki/Tasks.ad', { exact: true })
    await stateIs('active_title', 'wiki/Tasks')
    if (arm === 'merged') {
      await pressButton('distributed-systems · 1', { exact: true })
      await stateIs('tag_expanded', 'distributed-systems')
      await pressButton('wiki/CAP 定理.ad', { exact: true })
      await stateIs('active_title', 'wiki/CAP 定理')
    }
    // tags ③：空态不设运行时断言（§6——v1 以「面板开+行集非空」为常态
    // 断言，空态走 wanted ⑦ 同判口径）
    // tags ④：Save 后刷新——外造带 tag 档 → 保存 → 面板新行（List<map>
    // 态 dump = 裸 vmref——断言面 = 快照行文本，10 link 面板行同口径）
    fs.writeFileSync(path.join(FIXTURE, 'Tagged Note.ad'), '---\ntags:\n  - meta-save\n---\n\n# T\n', 'utf8')
    await pressButton('保存')
    let metaSaveOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaSaveOk = (await snapshotText()).includes('"meta-save · 1"')
      if (metaSaveOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaSaveOk) throw new Error('tags Save 刷新失守（meta-save 行未现）')
    // inline ⑦（PLAN-009 T-04；meta 组 inline 子步）：body 行内 #tag 聚
    // 合——外造 inline 档（fm 无 tags 键——纯 body 聚合源面）→ 保存
    // （ActSave 触点 TagsRefresh）→ 面板新行 inline-meta · 1
    fs.writeFileSync(path.join(FIXTURE, 'Inline Tagged.ad'), '正文 #inline-meta 尾\n', 'utf8')
    await pressButton('保存')
    let metaInlineOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaInlineOk = (await snapshotText()).includes('"inline-meta · 1"')
      if (metaInlineOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaInlineOk) throw new Error('inline tag 档保存后 tags 面板新行失守（inline-meta · 1 未现）')
    // inline ⑧ 语料基线零漂移回归：7 语料 tag 行全在 + 忽略面负向——
    // 无 block-project-a 行（`{#block-project-a}` 块锚/`[[Tasks#block-
    // project-b]]` 转义链接锚双形态不入集证；TAGS 区段断言——编辑器
    // 文本在面板前，全文负向会误中）
    let metaInlineBaselineOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const region = t.slice(t.indexOf('TAGS'))
      metaInlineBaselineOk = metaTagLabels.every((l) => region.includes(`"${l}"`)) && !region.includes('block-project-a')
      if (metaInlineBaselineOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaInlineBaselineOk) throw new Error('inline ⑧ 语料基线漂移（7 tag 行不全或 block-project-a 入集）')
    await pressButton('视图', { exact: true })
    await pressButton('切换标签', { exact: true })
    await stateIs('tags_open', 'false')
    // wanted ⑤：模式入口（无 input 行/无触发钮 + 语料已知答案行——首页
    // 已消缺故不在，页面名（1）在）
    await pressButton('视图', { exact: true })
    await pressButton('悬空清单', { exact: true })
    await stateIs('find_mode', 'wanted')
    await stateIs('find_open', 'true')
    const metaWantedSnap = await snapshotText()
    const wantedNoInput = !metaWantedSnap.includes('输入查询词') && !metaWantedSnap.includes('过滤文件名') && !metaWantedSnap.includes('"检索"')
    const wantedKnown = metaWantedSnap.includes('"页面名（1）"') && !metaWantedSnap.includes('"首页（1）"')
    if (!(wantedNoInput && wantedKnown)) throw new Error(`wanted 入口断言失守（noInput=${wantedNoInput} known=${wantedKnown}）`)
    // wanted ⑤b：外造悬空源档 → 重入口（ActFindWanted 即刷新）→ 新行
    fs.writeFileSync(path.join(FIXTURE, 'Wanted Source.ad'), '# WS\n\nsee [[Wanted Target]].\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('悬空清单', { exact: true })
    let wantedRowOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedRowOk = (await snapshotText()).includes('"Wanted Target（1）"')
      if (wantedRowOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!wantedRowOk) throw new Error('wanted 外造行未现（入口刷新失守）')
    // wanted ⑧（取消路前置——10c 同款纪律：悬空行素材先走取消路）：
    // 行点击 → 弹层预填 → 取消零落盘
    await pressButton('Wanted Target（1）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await stateIs('create_target', 'Wanted Target')
    await pressInCreateDialog('取消')
    await stateIs('create_confirm_open', 'false')
    const wantedCancelOk = !fs.existsSync(path.join(FIXTURE, 'Wanted Target.ad'))
    if (!wantedCancelOk) throw new Error('wanted 取消零落盘失守')
    // wanted ⑥：创建 → 开档 + 消缺 + exists 翻转（三切片联动弧线；ASCII
    // 目标双臂开档——D-19 面无[ASCII+空格路径简单转义解码在册]）
    await pressButton('Wanted Target（1）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await pressInCreateDialog('创建')
    await stateIs('active_title', 'Wanted Target')
    let wantedFlipOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedFlipOk = (await stateText('links_json')).includes('{\\"target\\":\\"Wanted Target\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"Wanted Target.ad\\"}')
      if (wantedFlipOk || Date.now() > dl) break
      await sleep(300)
    }
    let wantedGoneOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedGoneOk = !(await snapshotText()).includes('"Wanted Target（1）"')
      if (wantedGoneOk || Date.now() > dl) break
      await sleep(300)
    }
    const wantedDiskOk = fs.existsSync(path.join(FIXTURE, 'Wanted Target.ad'))
      && fs.readFileSync(path.join(FIXTURE, 'Wanted Target.ad'), 'utf8') === '# Wanted Target\n\n'
    if (!(wantedFlipOk && wantedGoneOk && wantedDiskOk)) throw new Error(`wanted 建页弧线失守（flip=${wantedFlipOk} gone=${wantedGoneOk} disk=${wantedDiskOk}）`)
    // wanted ⑦：空态闭环——消缺余量（页面名，语料悬空第二目标【执行期
    // 校正】；create_page POST body CJK 双臂已证——消缺面 = 磁盘+索引
    // 重取+行集重算，双臂同达；split CJK 开档全败不涉本断言）→ wanted
    // 清单空态「（无悬空链接）」
    await pressButton('页面名（1）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await pressInCreateDialog('创建')
    let wantedEmptyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedEmptyOk = (await snapshotText()).includes('（无悬空链接）')
      if (wantedEmptyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!wantedEmptyOk) throw new Error('wanted 空态闭环失守（（无悬空链接）未现）')
    // 收尾：find 面板关（收起——tags/backlinks 已闭，收起钮唯一）+
    // 反链面板复原开（check 11 首步按「开着→关」口径）
    await pressButton('收起', { exact: true })
    await stateIs('find_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    check('14', 'meta', metaTagsOk && metaSaveOk && metaInlineOk && metaInlineBaselineOk && wantedNoInput && wantedKnown && wantedRowOk && wantedCancelOk && wantedFlipOk && wantedGoneOk && wantedDiskOk && wantedEmptyOk,
      `meta 组八子步 + inline 子步（tags：面板开 7 tag 行[语料实勘全集]/展开导航 ASCII 双臂+CJK 仅 merged[D-19]/Save 刷新外造新行；inline：body #inline-meta 档保存后面板新行+语料基线零漂移回归[忽略面负向无 block-project-a]；wanted：模式入口无 input 行无检索钮/语料已知答案 页面名（1）+外造 Wanted Target（1）/取消零落盘/创建开档+消缺+exists 翻转+模板逐字节/空态闭环（无悬空链接））`)

    // 11 find（PLAN-004 T-04）：查找面板双模式。执行序在 quit 前（quit
    // 恒为臂内最后一项）；先关反链面板（check 10 开着）——find 行断言免
    // 反链行 .ad 路径文本重叠。快开：input 锚 + 空 q 全量 5 行 + 过滤
    //（Pro→Projects 独行；CJK 定理→CAP 独行——纯前端 casefold contains
    // 双臂同跑）+ 拾取即关（Projects[ASCII 双臂]；CAP[CJK 导航——仅
    // merged 臂，D-19 同款口径：HTTP GET query CJK 不解码 split 全败]）。
    // 检索：text 切模式 + 未运行提示 + CJK 查询「任务列表」（POST 通道
    // ——D-19 面无，双臂同跑）→ Hello World 行（ASCII 路径导航双臂）+
    // 面板保持开 + 运行后空态。
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('find_open', 'true')
    await stateIs('find_mode', 'files')
    const findTree0 = await snapshot()
    const findInput0 = findFirst(findTree0, (n) => n.head.startsWith('input ') && elementIdOf(n))
    if (!findInput0) throw new Error('find input not found in snapshot（快开子步）')
    const findRowsAll = await snapshotText()
    const allFive = ['wiki/CAP 定理.ad', 'wiki/Hello World.ad', 'wiki/index.ad', 'wiki/Projects.ad', 'wiki/Tasks.ad']
      .every((p) => findRowsAll.includes(`"${p}"`))
    if (!allFive) throw new Error('empty-q 快开应列全量 5 行')
    await callTool('autoui_action', { element_id: elementIdOf(findInput0), action: 'type_text', value: 'Pro' })
    await stateHas('find_q', 'Pro')
    const findRowsPro = await snapshotText()
    const proOk = findRowsPro.includes('"wiki/Projects.ad"')
      && !findRowsPro.includes('"wiki/CAP 定理.ad"')
      && !findRowsPro.includes('"wiki/index.ad"')
    if (!proOk) throw new Error('files 过滤 "Pro" 未隔离 Projects.ad 独行')
    await callTool('autoui_action', { element_id: elementIdOf(await waitButton('wiki/Projects.ad', { exact: true })), action: 'press' })
    await stateIs('active_title', 'wiki/Projects')
    await stateIs('find_open', 'false')
    // CJK 文件名过滤（重开面板；行断言双臂，拾取导航子步仅 merged）
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    const findTree1 = await snapshot()
    const findInput1 = findFirst(findTree1, (n) => n.head.startsWith('input ') && elementIdOf(n))
    await callTool('autoui_action', { element_id: elementIdOf(findInput1), action: 'type_text', value: '定理' })
    await stateHas('find_q', '定理')
    const findRowsCjk = await snapshotText()
    const cjkFilterOk = findRowsCjk.includes('"wiki/CAP 定理.ad"') && !findRowsCjk.includes('"wiki/Projects.ad"')
    if (!cjkFilterOk) throw new Error('CJK 文件名过滤「定理」未隔离 CAP 定理.ad')
    if (arm === 'merged') {
      await callTool('autoui_action', { element_id: elementIdOf(await waitButton('wiki/CAP 定理.ad', { exact: true })), action: 'press' })
      await stateIs('active_title', 'wiki/CAP 定理')
      await stateIs('find_open', 'false')
    }
    // 检索子步（text 模式）
    await pressButton('视图', { exact: true })
    await pressButton('全文检索', { exact: true })
    await stateIs('find_mode', 'text')
    await stateIs('find_open', 'true')
    const notRanOk = (await snapshotText()).includes('（输入查询词后检索）')
    if (!notRanOk) throw new Error('text 未运行空态提示缺失')
    const findTree2 = await snapshot()
    const findInput2 = findFirst(findTree2, (n) => n.head.startsWith('input ') && elementIdOf(n))
    await callTool('autoui_action', { element_id: elementIdOf(findInput2), action: 'type_text', value: '任务列表' })
    await stateHas('find_q', '任务列表')
    await pressButton('检索', { exact: true })
    await stateIs('find_ran', 'true')
    const hitRows = await snapshotText()
    const hitOk = hitRows.includes('"wiki/Hello World.ad"')
    if (!hitOk) throw new Error('CJK 检索「任务列表」未出 Hello World.ad 行（POST 通道双臂）')
    await callTool('autoui_action', { element_id: elementIdOf(await waitButton('wiki/Hello World.ad', { exact: true })), action: 'press' })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await stateIs('find_open', 'true')
    const findTree3 = await snapshot()
    const findInput3 = findFirst(findTree3, (n) => n.head.startsWith('input ') && elementIdOf(n))
    await callTool('autoui_action', { element_id: elementIdOf(findInput3), action: 'type_text', value: 'zzz-无此词-xyz' })
    await stateHas('find_q', 'zzz-无此词-xyz')
    await pressButton('检索', { exact: true })
    const emptyFindOk = (await snapshotText()).includes('（无结果）')
    check('11', 'find', allFive && proOk && cjkFilterOk && notRanOk && hitOk && emptyFindOk,
      `快开（input 锚/空q全量5行/Pro→Projects 独行拾取即关/定理→CAP 独行${arm === 'merged' ? '+CJK 拾取开档' : '（CJK 拾取仅 merged 臂 D-19）'}）+ 检索（text 切换/未运行提示/CJK「任务列表」POST 双臂命中/行导航面板保持开/运行后空态）`)

    // 12 rename（PLAN-006 T-04）：重命名+反链改写全弧线（七子步——组内
    // 子步不占检查位，fail 即臂败，10c 同款）。素材 Projects.ad（ASCII
    // 双臂——D-19 面无；入链 index/CAP 定理 两页两处 = 预览/改写断言
    // 域）。弹层钮定位 = 「重命名」锚父行兄弟域（多弹层恒渲染同名取消
    // 钮纪律——10c pressInCreateDialog 同款）；rename input = 快照序最
    // 后 input（弹层在右面板之后渲染——check 11 find 面板开着亦然）。
    const pressInRenameDialog = async (buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const rnBtn = findFirst(t, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '重命名')
        if (rnBtn) {
          if (buttonText === '重命名') {
            const res = await callTool('autoui_action', { element_id: elementIdOf(rnBtn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press 重命名 not ok: ${res}`)
            return
          }
          const row = findParent(t, rnBtn)
          const btn = row.children.find((c) => c !== rnBtn && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === buttonText)
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText} not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in rename-dialog row not found`)
        await sleep(300)
      }
    }
    const typeIntoRenameInput = async (text) => {
      const tree = await snapshot()
      const inputs = []
      const collect = (n) => {
        if (n.head.startsWith('input ') && elementIdOf(n)) inputs.push(n)
        for (const c of n.children) collect(c)
      }
      collect(tree)
      const dlgInput = inputs[inputs.length - 1]
      if (!dlgInput) throw new Error('rename input not found in snapshot')
      const res = await callTool('autoui_action', { element_id: elementIdOf(dlgInput), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`rename type_text not ok: ${res}`)
    }
    const renameProjectsFile = path.join(FIXTURE, 'wiki', RENAME_LABEL)
    const renamedFile = path.join(FIXTURE, RENAME_NEW_REL)
    // ① 禁用态两形：untitled（文件→新建——path 空）+ 脏档——入口 press
    // 后 rename_open 恒 false（handler 守卫；menubar 项无 enabled——vm
    // boot 冻结缺口 T-02 实勘，action enabled_if 为权威面）。
    await pressButton('文件', { exact: true })
    await pressButton('新建', { exact: true })
    await stateIs('active_title', '未命名')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'false')
    await pressActiveTabClose('未命名')
    await typeWholeDoc(`${bodyOf(fs.readFileSync(targetFile, 'utf8'))}\n\n${RENAME_DIRTY_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'false')
    await pressButton('重载')
    await stateIs('active_dirty', 'false')
    // ② 弹层内容锚（D-23③ 纪律）：开 Projects → 入口 → rename_open +
    // rename_q 预填 + 影响面预览行（「将改写 2 页 2 处链接」——index/CAP
    // 定理 两页各一出链）。
    await pressButton(RENAME_LABEL)
    await stateIs('active_title', RENAME_OLD_TITLE)
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await stateIs('rename_q', 'Projects')
    const dlgSnap = await snapshotText()
    const dlgOk = dlgSnap.includes('重命名页面') && dlgSnap.includes('将改写 2 页 2 处链接')
    // ③ 取消零落盘
    await pressInRenameDialog('取消')
    await stateIs('rename_open', 'false')
    const renameCancelOk = fs.existsSync(renameProjectsFile) && !fs.existsSync(renamedFile)
    if (!renameCancelOk) throw new Error('rename 取消零落盘失守（Projects.ad 应在、Project X.ad 不应在）')
    // ④ 改名弧线：Projects → Project X——active 投影 + 磁盘（旧消失新
    // 在 + index.ad/CAP 定理.ad 源文改写）。
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput(RENAME_NEW_NAME)
    await stateHas('rename_q', 'Project X')
    await pressInRenameDialog('重命名')
    await stateIs('active_title', RENAME_NEW_TITLE)
    await stateIs('active_path', RENAME_NEW_REL)
    const renamedExists = fs.existsSync(renamedFile)
    const oldGone = !fs.existsSync(renameProjectsFile)
    const indexDisk = fs.readFileSync(path.join(FIXTURE, 'wiki', 'index.ad'), 'utf8')
    const capDisk = fs.readFileSync(path.join(FIXTURE, 'wiki', 'CAP 定理.ad'), 'utf8')
    const rewriteOk = indexDisk.includes('[[Project X]]') && capDisk.includes('[[Project X]]')
      && !indexDisk.includes('[[Projects]]')
    if (!(renamedExists && oldGone && rewriteOk)) throw new Error(`rename 磁盘断言失守（renamed=${renamedExists} oldGone=${oldGone} rewrite=${rewriteOk}）`)
    // ⑤ 跨页改写可见：开 index.ad（ASCII 双臂）→ 反链面板（index 反链空
    // 态 + 出链行新 stem『Project X』『CAP Theorem』）→ **出链行点击导航
    // 到新档**（active_title = wiki/Project X——改写链接可走通）+ 树刷新
    //（Project X.ad 行在、Projects.ad 行消失）。（index 无反链——Project
    // X 零真实出链[语料转义面]故非任何页反链源；反链行新 stem 的正证面
    // = probe_rename 案①index/Tasks 改写逐字节。）
    await pressButton('index.ad')
    await stateIs('active_title', 'wiki/index')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    let renamePanelOk = false
    let renameTreeOk = false
    let panelDbg = ''
    for (const dl = Date.now() + 8000; ; ) {
      const pt = await snapshotText()
      panelDbg = pt
      renamePanelOk = pt.includes('（无反链）') && pt.includes('"Project X"') && !pt.includes('"Projects"')
      renameTreeOk = pt.includes('"Project X.ad"') && !pt.includes('"Projects.ad"')
      if (renamePanelOk && renameTreeOk) break
      if (Date.now() > dl) break
      await sleep(300)
    }
    if (!(renamePanelOk && renameTreeOk)) {
      fs.writeFileSync(`e2e/.runtime/fail-panel-${Date.now()}.txt`, panelDbg)
      throw new Error(`rename 面板/树断言失守（panel=${renamePanelOk} tree=${renameTreeOk}）`)
    }
    await pressButton('Project X', { exact: true })
    await stateIs('active_title', RENAME_NEW_TITLE)
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    // ⑥ case-only 拒（G3）：Project X → project x → ""（弹层留置 + 磁
    // 盘零变化——无第二个 project x.ad）→ 取消复原。
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput('project x')
    await pressInRenameDialog('重命名')
    await sleep(500)
    const rejState = await callTool('autoui_state', { fields: ['rename_open', 'rename_q'] })
    // Windows 大小写不敏感 FS——exists(lower) 对同档恒真，第二档判定 =
    // 目录清单 casefold 计数（probe_rename ⑧ 同款）。
    const wikiDirNow = fs.readdirSync(path.join(FIXTURE, 'wiki')).filter((f) => f.endsWith('.ad'))
    const pxCount = wikiDirNow.filter((f) => f.toLowerCase() === 'project x.ad').length
    const rejOk = /rename_open:\s*true/.test(rejState) && fs.existsSync(renamedFile) && pxCount === 1
    await pressInRenameDialog('取消')
    await stateIs('rename_open', 'false')
    if (!rejOk) throw new Error(`case-only 拒断言失守（弹层应留置 + 磁盘零变化）state=[${rejState.replace(/\n/g, ' | ').trim()}] pxCount=${pxCount} wiki=${JSON.stringify(wikiDirNow)}`)
    // ⑦ 状态复原：回 Hello World tab（quit 检查前置——typeWholeDoc 目
    // 标档）。CJK 改名导航子步不设——probe_rename 八案已直证 CJK 面，
    // 本组素材 ASCII 双臂（D-19 口径注记同 10c）。
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    check('12', 'rename', dlgOk && renameCancelOk && renamedExists && oldGone && rewriteOk && renamePanelOk && renameTreeOk && rejOk,
      `rename 组七子步（禁用态 untitled+脏档/弹层锚 预填+预览 2页2处/取消零落盘/改名弧线 active+磁盘+双页改写/面板+树新 stem/case-only 拒弹层留置/状态复原）`)

    // 13 file（PLAN-007 T-04）：树文件管理全弧线八子步（组内子步不占
    // 检查位，fail 即臂败，10c/12 同款）。执行序在 quit 前（quit 恒为
    // 臂内最后一项；本组删除素材 CAP 定理不涉 quit 面——收尾复原回
    // Hello World tab）。弹层钮定位纪律（check 11 遗留 find 面板开着
    // ——input 序[find?,新建,重命名]非首即新建，结构锚定位）：
    //   EXPLORER「＋」= text "EXPLORER" 父行内 icon 钮（ownText 空
    //   ——结构锚，pressActiveTabClose 同族）；
    //   新建 input = 「新建页面」标题上溯 dialog-content 内 input；
    //   新建弹层「创建」= 快照序末创建钮（create_confirm 先声明居前
    //   ——同名钮末者消歧）+ 取消 = 父行兄弟；
    //   删除弹层「删除」= 全树唯一文本锚 + 取消 = 父行兄弟。
    const pressExplorerPlus = async () => {
      const t = await snapshot()
      const label = findFirst(t, (n) => ownText(n) === 'EXPLORER')
      if (!label) throw new Error('EXPLORER text not found')
      const row = findParent(t, label)
      const btn = row.children.find((c) => c !== label && c.head.startsWith('button ') && elementIdOf(c))
      if (!btn) throw new Error('EXPLORER + button not found in header row')
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press EXPLORER + not ok: ${res}`)
    }
    const typeIntoNewInput = async (text) => {
      const t = await snapshot()
      const title = findFirst(t, (n) => ownText(n) === '新建页面')
      if (!title) throw new Error('new-dialog title not found')
      const header = findParent(t, title)
      const content = findParent(t, header)
      const inp = content ? findFirst(content, (n) => n.head.startsWith('input ') && elementIdOf(n)) : null
      if (!inp) throw new Error('new-dialog input not found in snapshot')
      const res = await callTool('autoui_action', { element_id: elementIdOf(inp), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`new-input type_text not ok: ${res}`)
    }
    const pressInNewDialog = async (buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const creates = []
        const collectCreates = (n) => {
          if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '创建') creates.push(n)
          for (const c of n.children) collectCreates(c)
        }
        collectCreates(t)
        const target = creates[creates.length - 1]
        if (target) {
          if (buttonText === '创建') {
            const res = await callTool('autoui_action', { element_id: elementIdOf(target), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press 创建(new) not ok: ${res}`)
            return
          }
          const row = findParent(t, target)
          const btn = row.children.find((c) => c !== target && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === buttonText)
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(new) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in new-dialog row not found`)
        await sleep(300)
      }
    }
    const pressInDeleteDialog = async (buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const delBtn = findFirst(t, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '删除')
        if (delBtn) {
          if (buttonText === '删除') {
            const res = await callTool('autoui_action', { element_id: elementIdOf(delBtn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press 删除 not ok: ${res}`)
            return
          }
          const row = findParent(t, delBtn)
          const btn = row.children.find((c) => c !== delBtn && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === buttonText)
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(delete) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in delete-dialog row not found`)
        await sleep(300)
      }
    }
    // ⑴ 新建 ASCII（index——根落位，wiki/index.ad 同名异位不冲突）
    const fileNewPageFile = path.join(FIXTURE, FILE_NEW_REL)
    const fileCjkPageFile = path.join(FIXTURE, FILE_CJK_REL)
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await stateIs('new_q', '')
    await typeIntoNewInput(FILE_NEW_NAME)
    await stateIs('new_q', FILE_NEW_NAME)
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('active_title', FILE_NEW_NAME)
    await stateIs('ft_sel', FILE_NEW_REL)
    let newDiskOk = false
    for (const dl = Date.now() + 8000; ; ) {
      newDiskOk = fs.existsSync(fileNewPageFile) && fs.readFileSync(fileNewPageFile, 'utf8') === `# ${FILE_NEW_NAME}\n\n`
      if (newDiskOk || Date.now() > dl) break
      await sleep(200)
    }
    let newTreeOk = (await snapshotText()).includes(`"${FILE_NEW_REL}"`)
    // ⑵ 同名幂等：打开既有（tab 数不变 + 磁盘字节不变；基线采样 =
    // ⑴ 落定后——⑴ 自身新增 index tab 计入基线）
    const tabCountPre = await stateText('tab_count')
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput(FILE_NEW_NAME)
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('active_title', FILE_NEW_NAME)
    const tabCountPost = await stateText('tab_count')
    const idemDiskOk = fs.existsSync(fileNewPageFile) && fs.readFileSync(fileNewPageFile, 'utf8') === `# ${FILE_NEW_NAME}\n\n`
    // ⑶ 取消零落盘
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput(FILE_GHOST_NAME)
    await pressInNewDialog('取消')
    await stateIs('new_open', 'false')
    const ghostOk = !fs.existsSync(path.join(FIXTURE, `${FILE_GHOST_NAME}.ad`))
    // ⑷ CJK 新建：merged 导航断言 / split 磁盘断言（D-19 口径——CJK
    // 开档 exists GET query 不解码，Open 落 not-found 不入 tab）
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput(FILE_CJK_NAME)
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    let cjkNavOk = false
    for (const dl = Date.now() + 8000; ; ) {
      if (fs.existsSync(fileCjkPageFile)) {
        if (arm === 'merged') {
          let bodyOk = false
          try { bodyOk = fs.readFileSync(fileCjkPageFile, 'utf8') === `# ${FILE_CJK_NAME}\n\n` } catch {}
          cjkNavOk = bodyOk
        } else {
          cjkNavOk = true
        }
      }
      if (cjkNavOk || Date.now() > dl) break
      await sleep(300)
    }
    if (arm === 'merged') {
      await stateIs('active_title', FILE_CJK_NAME)
    } else {
      await stateIs('active_title', FILE_NEW_NAME)
    }
    // ⑸ 删除预览 + 取消：树行点击 = 打开+选中。D-19 口径分野（10c/11
    // 同款）：merged 树行开 CJK 档成功（激活既有 CAP tab——check 10
    // 开过）→ 预览「1 个标签页将关闭」；split CJK 开档全败（exists
    // GET query 不解码——Open 落 not-found 不入 tab）→ active 保持
    // index、预览「无打开标签页」。ft_sel 两臂同置（OpenFile 前置）。
    await pressButton(FILE_DEL_LABEL)
    await stateIs('ft_sel', FILE_DEL_REL)
    if (arm === 'merged') {
      await stateIs('active_title', 'wiki/CAP 定理')
    } else {
      await stateIs('active_title', FILE_NEW_NAME)
    }
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    const delTabsLine = arm === 'merged' ? '1 个标签页将关闭，未保存修改将丢弃' : '无打开标签页'
    let delDlgOk = false
    let delDlgSnap = ''
    for (const dl = Date.now() + 8000; ; ) {
      delDlgSnap = await snapshotText()
      delDlgOk = delDlgSnap.includes('删除页面') && delDlgSnap.includes(`将删除 ${FILE_DEL_REL}`)
        && delDlgSnap.includes('3 处入链将变为悬空') && delDlgSnap.includes(delTabsLine)
      if (delDlgOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!delDlgOk) fs.writeFileSync(`e2e/.runtime/fail-deldlg-${Date.now()}.txt`, delDlgSnap)
    await pressInDeleteDialog('取消')
    await stateIs('delete_open', 'false')
    const delCancelOk = fs.existsSync(path.join(FIXTURE, FILE_DEL_REL))
    // ⑥ 删除弧线：确认 → 磁盘消失 + tab 关闭面 + ft_sel 清空 + 树行
    // 消失。激活落点两臂异位（实勘）：merged CAP 已开（tab 序
    // [HW,index,CAP,首页,PX]）删 CAP(2) 同位保持→首页；split CAP 未
    // 开（D-19）active 不变=index，CloseTabsOf 零关闭=零 tab 面分支
    // （RemoveAt 修正两形态各证其一，互补）。
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    await stateIs('ft_sel', '')
    if (arm === 'merged') {
      await stateIs('active_title', '首页')
    } else {
      await stateIs('active_title', FILE_NEW_NAME)
    }
    const capGone = !fs.existsSync(path.join(FIXTURE, FILE_DEL_REL))
    const tabCountFinal = parseInt((await stateText('tab_count')).match(/tab_count:\s*(\d+)/)?.[1] ?? '-1', 10)
    // ⑦ 悬空翻转：tab 题钮开 index（树行 index.ad 双行同名歧义——根
    // index.ad ⑴ 新建后与 wiki/index.ad label 同名，tab 题钮唯一）→
    // 反链面板出链行 CAP 定理（悬空）（PLAN-003 已知答案反向）+ 树
    // 零残留；面板复原关闭
    await pressButton('wiki/index', { exact: true })
    await stateIs('active_title', 'wiki/index')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    let flipOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      flipOk = t.includes('CAP 定理（悬空）') && !t.includes(`"${FILE_DEL_REL}"`)
      if (flipOk || Date.now() > dl) break
      await sleep(300)
    }
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    // ⑧ 未选中 no-op（⑥ 后 ft_sel=""）+ 状态复原回 Hello World（quit
    // 前置——typeWholeDoc 目标档）
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    const noopState = await callTool('autoui_state', { fields: ['delete_open'] })
    const noopOk = /delete_open:\s*false/.test(noopState)
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // ⑨ F-R9-4 案（PLAN-010 G3 收口断言；canonical §6 SD-1002 记载位
    // = file 组）：删除激活档 → 提及段随新激活刷新。弹层造源档（存盘
    // 带「Fr94Del」明文提及）+ 靶档（自动开档激活）→ 开面板提及行现 →
    // UI 删除激活靶档 → 提及行消（DeleteGo 接 MentionsRefreshOf——未
    // 接则陈旧行残留，判别面）。收尾源档亦 UI 删 + 复原 Hello World
    //（quit 前置——typeWholeDoc 目标档）。
    let fr94Up = false
    let fr94Down = false
    const fr94SrcFile = path.join(FIXTURE, 'Fr94Src.ad')
    const fr94DelFile = path.join(FIXTURE, 'Fr94Del.ad')
    fs.rmSync(fr94SrcFile, { force: true })
    fs.rmSync(fr94DelFile, { force: true })
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput('Fr94Src')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await typeWholeDoc('# Fr94Src\n\nFr94Del plain mention here.\n')
    await pressButton('保存')
    await stateIs('active_dirty', 'false')
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput('Fr94Del')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('active_title', 'Fr94Del')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iMn = t.indexOf('未链接提及')
      // 有界切片（段内 ~400 字符）：快照 DFS 序 filetree 居面板后，无界
      // slice 会误中树行 Fr94Src.ad（本案例外——树行在册；10m 素材走
      // fs 造档不进树故无界可用）。
      fr94Up = iMn >= 0 && t.slice(iMn, iMn + 400).includes('Fr94Src.ad')
      if (fr94Up || Date.now() > dl) break
      await sleep(300)
    }
    if (!fr94Up) {
      throw new Error(`fr94Up 失守: diskSrc=${fs.existsSync(fr94SrcFile) ? JSON.stringify(fs.readFileSync(fr94SrcFile, 'utf8')) : '<gone>'} diskDel=${fs.existsSync(fr94DelFile) ? JSON.stringify(fs.readFileSync(fr94DelFile, 'utf8')) : '<gone>'}`)
    }
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iMn = t.indexOf('未链接提及')
      // 判别面 = 空态标记（（无未链接提及）与行互斥渲染）——新激活
      // Fr94Src 提及集为空 → 空态现（未接刷新则 Fr94Src.ad 行残留）。
      fr94Down = iMn >= 0 && t.slice(iMn, iMn + 400).includes('（无未链接提及）')
      if (fr94Down || Date.now() > dl) break
      await sleep(300)
    }
    if (!fr94Down) {
      const t2 = await snapshotText()
      const iMn2 = t2.indexOf('未链接提及')
      const at2 = await stateText('active_title')
      throw new Error(`fr94Down 失守: active=${JSON.stringify(at2)} tail=${JSON.stringify(iMn2 >= 0 ? t2.slice(iMn2, iMn2 + 300) : '<no-mention-marker>')}`)
    }
    // 收尾删源档：DeleteGo 清空 ft_sel（⑥ 弧线在册语义）——菜单删除
    // 守卫 no-op 面（⑧ 同款），先点树行置 ft_sel 再删（⑥ 同款前置）。
    await pressButton('Fr94Src.ad', { exact: true })
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    await pressButton('wiki/Hello World', { exact: true })
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    const fileParts = {
      newDiskOk, newTreeOk, idemDiskOk, tabStable: tabCountPre === tabCountPost,
      ghostOk, cjkNavOk, delDlgOk, delCancelOk, capGone, flipOk, noopOk,
      fr94Ok: fr94Up && fr94Down,
    }
    if (Object.values(fileParts).some((v) => !v)) {
      console.log(`  [13 dbg] ${JSON.stringify(fileParts)} tabPre=${JSON.stringify(tabCountPre)} tabPost=${JSON.stringify(tabCountPost)}`)
    }
    check('13', 'file', Object.values(fileParts).every((v) => v) && tabCountFinal >= 0,
      `file 组八子步+F-R9-4 案（新建 index 模板逐字节+树新行/同名幂等 tab+磁盘不变/取消零落盘/CJK 新页${arm === 'merged' ? '导航断言' : '磁盘断言[D-19]'}＋删除预览 3 处入链已知答案+tab 面「${delTabsLine}」+取消零落盘/删除弧线 磁盘消失+ft_sel 清空+激活${arm === 'merged' ? '落邻档首页[同位保持]' : '保持 index[CloseTabsOf 零关闭面，D-19]'}/悬空翻转 出链行 CAP 定理（悬空）/未选中 no-op/F-R9-4 删后提及刷新[提及行现→UI 删激活→行消]）`)

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
  console.log(`[matrix] ALL GREEN：${arms.join(' + ')} 臂检查单全过（六检查 + 基线[merged] + tab/editops/link/create/find/rename/file/meta 扩单 + quit）`)
}
