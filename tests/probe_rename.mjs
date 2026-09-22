#!/usr/bin/env node
// probe_rename.mjs — PLAN-006 T-01 rename_page 契约八案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-rename/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调
//              create_page/write_wiki（setup）+ rename_page 八案，返回值落
//              model 字段），`auto run -r vm` 进程内 CALL——autoui_state
//              全量 dump 读回；直证后随 .runtime 再生语义存在（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              POST /api/create_page + /api/write_wiki（setup）+ POST
//              /api/rename_page 八案（JSON body——D-19 面：old_path/new_name
//              均 body 传参，CJK 走 body 不走 query）。
//
// 案表（§6 八案展开；期望值 = SD-601 五步流程定文）：
//   ① 基础改名+跨页改写   "wiki/CAP 定理" → "CAP Theorem"：旧档消失新档在
//                        （新档字节 = 原档字节——read+write+delete 组合整迁
//                        等价）+ index.ad / Hello World.ad 源文 `[[CAP 定
//                        理]]`→`[[CAP Theorem]]` 逐字节 + 非链接档（Projects
//                        .ad 转义链面 + jade-garden-index.json）字节不动
//   ② anchor 保留         同案①弧线内语料补造链 wiki/链主.ad（write_wiki
//                        造）：`[[CAP 定理]]`/`[[CAP 定理#block-consistency]]`
//                        /`[[ CAP 定理 ]]` 三形态 → 新 stem + anchor 透传 +
//                        前后空白保真；Tasks.ad 既有锚链同步断言
//   ③ 自链改写            自链页.ad（setup 造 `[[自链页]]` 自引）→ 自链页二
//                        ：档内自链同步改写（改写循环含被改名档新路径）
//   ④ CJK stem            任务清单 → 每日任务（全 CJK 改名链——POST 双臂，
//                        D-19 面无）+ wiki/cjk-src.ad 改写可见
//   ⑤ 清洗                "每日任务" → "a/b:c*d"（非法字符）→ "a-b-c-d.ad"
//                        （title_to_path_stem 九字符收敛）；空名守卫附带案
//                        （new_name=""→ ""）
//   ⑥ 目标冲突拒          "a-b-c-d" → "自链页二"（既有档 stem）→ "" + 磁盘
//                        零变化（双档均原样）
//   ⑦ old 缺失拒          "不存在.ad" → ""（零落盘）
//   ⑧ case-only 拒        "wiki/Tasks" → "tasks" → ""（G3 裁决：精确匹配，
//                        case-only 拒）+ 磁盘零变化（无第二个 tasks.ad）
//
// 双臂一致 = 两臂返回值逐案相等（G2）。D-21 负载窗 flake：无-RESULT 早崩
// 按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_rename.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-rename')
const MERGED_WS = path.join(RUNTIME, 'probe-rename-workspace')
const MERGED_PORT = 9399
const SPLIT_PORT = 8254

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 语料锚（setup 造档原文——期望值来源）----
const LINKPAGE_REL = 'wiki/链主.ad'
const LINKPAGE_BODY = '三态指向：[[CAP 定理]] 与 [[CAP 定理#block-consistency]] 与 [[ CAP 定理 ]] 止。\n'
const SELF_REL = '自链页.ad'
const SELF_BODY_OLD = '# 自链页\n\n自引 [[自链页]] 在身。\n'
// 改写面 = [[wikilink]] 标记法（SD-601）——H1 标题非链接不涉（Obsidian
// 同判），仅自引链接改写。
const SELF_BODY_NEW = '# 自链页\n\n自引 [[自链页二]] 在身。\n'
const CJK_REL = '任务清单.ad'
const CJK_SRC_REL = 'wiki/cjk-src.ad'
const CJK_SRC_OLD = '见 [[任务清单]] 一次。\n'
// 终态 = ④⑤ 链式改写（任务清单→每日任务→a-b-c-d 各改一轮——磁盘断言
// 后置跑，④ 的中间态由终态+⑤ 的改名链传递证明）。
const CJK_SRC_FINAL = '见 [[a-b-c-d]] 一次。\n'
const CJK_CLEAN_STEM = 'a/b:c*d'
const CJK_CLEAN_REL = 'a-b-c-d.ad'
const TEMPLATE_BODY = '# 任务清单\n\n' // create_page 模板（SD-501 定文）

// ---- 八案（双臂共享；expect = 新 rel / ""）----
const CASES = [
  { id: '1-basic', old_path: 'wiki/CAP 定理.ad', new_name: 'CAP Theorem', expect: 'wiki/CAP Theorem.ad' },
  { id: '2-anchor', old_path: 'wiki/CAP 定理.ad', new_name: 'CAP Theorem', expect: 'wiki/CAP Theorem.ad' }, // ① 弧线内子断言占位——双臂对读用 ① 的返回值
  { id: '3-self', old_path: '自链页.ad', new_name: '自链页二', expect: '自链页二.ad' },
  { id: '4-cjk', old_path: '任务清单.ad', new_name: '每日任务', expect: '每日任务.ad' },
  { id: '5-clean', old_path: '每日任务.ad', new_name: CJK_CLEAN_STEM, expect: CJK_CLEAN_REL },
  { id: '6-conflict', old_path: 'a-b-c-d.ad', new_name: '自链页二', expect: '' },
  { id: '7-missing', old_path: '不存在.ad', new_name: '随便', expect: '' },
  { id: '8-case-only', old_path: 'wiki/Tasks.ad', new_name: 'tasks', expect: '' },
]
const RET_FIELD = {
  '1-basic': 'c1', '2-anchor': 'c1', '3-self': 'c2', '4-cjk': 'c3',
  '5-clean': 'c4', '6-conflict': 'c5', '7-missing': 'c6', '8-case-only': 'c7',
}

// ---- setup（双臂同构：merged=直调 / split=POST）----
const SETUP = [
  { kind: 'create', title: '自链页' },
  { kind: 'write', path: SELF_REL, body: SELF_BODY_OLD },
  { kind: 'write', path: LINKPAGE_REL, body: LINKPAGE_BODY },
  { kind: 'create', title: '任务清单' },
  { kind: 'write', path: CJK_SRC_REL, body: CJK_SRC_OLD },
]

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

function diskAsserts(ws, orig, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const read = (rel) => {
    try { return fs.readFileSync(path.join(ws, rel), 'utf8') } catch { return null }
  }
  // ① 旧档消失 + 新档在 + 新档字节 = 原档字节（整迁等价）
  ck(read('wiki/CAP 定理.ad') === null, '① 旧档 wiki/CAP 定理.ad 消失')
  ck(read('wiki/CAP Theorem.ad') === orig.capTheoremSrc, '① 新档 wiki/CAP Theorem.ad 字节 = 原档字节（整迁等价）')
  // ① 跨页改写逐字节（index/Hello World 单现；split/join 全量替换后比对）
  const all = (s, from, to) => s.split(from).join(to)
  ck(read('wiki/index.ad') === all(orig.index, '[[CAP 定理]]', '[[CAP Theorem]]'), '① index.ad 源文 [[CAP 定理]]→[[CAP Theorem]] 逐字节')
  ck(read('wiki/Hello World.ad') === all(orig.helloWorld, '[[CAP 定理]]', '[[CAP Theorem]]'), '① Hello World.ad 源文改写逐字节')
  // ② anchor 保留（Tasks 既有锚链 + 链主 三形态补造链——空白/锚透传）
  ck(read('wiki/Tasks.ad') === all(orig.tasks, '[[CAP 定理#block-consistency]]', '[[CAP Theorem#block-consistency]]'), '② Tasks.ad 锚链 [[CAP Theorem#block-consistency]] 逐字节')
  ck(read(LINKPAGE_REL) === LINKPAGE_BODY.replace('[[CAP 定理]]', '[[CAP Theorem]]').replace('[[CAP 定理#block-consistency]]', '[[CAP Theorem#block-consistency]]').replace('[[ CAP 定理 ]]', '[[ CAP Theorem ]]'), '② 链主.ad 三形态改写（锚透传+空白保真）逐字节')
  // ① 非链接档字节不动（副作用圈定）
  ck(read('wiki/Projects.ad') === orig.projects, '① Projects.ad（转义链面）字节不动')
  ck(read('jade-garden-index.json') === orig.gardenJson, '① 非 .ad 档字节不动')
  // ③ 自链改写
  ck(read(SELF_REL) === null && read('自链页二.ad') === SELF_BODY_NEW, '③ 自链改写（自链页二.ad 自引已新）')
  // ④ CJK 改写（旧消失 + 源档改写逐字节；新档体整迁经 ⑤ 字节链传递证明
  // ——磁盘断言后置跑，每日任务.ad 已被 ⑤ 再改名为 a-b-c-d.ad）
  ck(read(CJK_REL) === null, '④ CJK 改名（任务清单.ad 消失）')
  ck(read(CJK_SRC_REL) === CJK_SRC_FINAL, '④⑤ cjk-src.ad 链式改写（[[任务清单]]→[[每日任务]]→[[a-b-c-d]]）终态逐字节')
  // ⑤ 清洗
  ck(read('每日任务.ad') === null && read(CJK_CLEAN_REL) === TEMPLATE_BODY, '⑤ 清洗 a/b:c*d → a-b-c-d.ad（体整迁）')
  // ⑤ 附带：空名守卫
  ck(read('wiki/CAP Theorem.ad') === orig.capTheoremSrc, '⑤附 空名守卫：CAP Theorem.ad 原样')
  // ⑥ 冲突拒：双档均原样
  ck(read(CJK_CLEAN_REL) === TEMPLATE_BODY && read('自链页二.ad') === SELF_BODY_NEW, '⑥ 冲突拒零变化（双档原样）')
  // ⑦ 缺失拒：零落盘
  ck(read('随便.ad') === null, '⑦ old 缺失拒零落盘（无 随便.ad）')
  // ⑧ case-only 拒：Tasks.ad 原样 + 无第二档
  const wikiFiles = fs.readdirSync(path.join(ws, 'wiki')).filter((f) => f.endsWith('.ad'))
  ck(read('wiki/Tasks.ad') === all(orig.tasks, '[[CAP 定理#block-consistency]]', '[[CAP Theorem#block-consistency]]'), '⑧ wiki/Tasks.ad 字节原样（改写态）')
  ck(wikiFiles.filter((f) => f.toLowerCase() === 'tasks.ad').length === 1, `⑧ 无第二个 tasks.ad（wiki .ad 共 ${wikiFiles.length} 档）`)
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_rename.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 setup（create_page/write_wiki）+ rename_page
// 八案，返回值落 model 字段供 autoui_state dump 读回。入口文件名固定 app.at。
use back.api: create_page, write_wiki, rename_page

widget App {
    msg { Init }
    model {
        var done bool = false
        var s1 str = ""
        var w1 bool = false
        var w2 bool = false
        var s2 str = ""
        var w3 bool = false
        var c1 str = ""
        var c2 str = ""
        var c3 str = ""
        var c4 str = ""
        var c5 str = ""
        var c6 str = ""
        var c7 str = ""
        var c8 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: rename_page" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            s1 = create_page("自链页")
            w1 = write_wiki("自链页.ad", "# 自链页\\n\\n自引 [[自链页]] 在身。\\n")
            w2 = write_wiki("wiki/链主.ad", "三态指向：[[CAP 定理]] 与 [[CAP 定理#block-consistency]] 与 [[ CAP 定理 ]] 止。\\n")
            s2 = create_page("任务清单")
            w3 = write_wiki("wiki/cjk-src.ad", "见 [[任务清单]] 一次。\\n")
            c1 = rename_page("wiki/CAP 定理.ad", "CAP Theorem")
            c2 = rename_page("自链页.ad", "自链页二")
            c3 = rename_page("任务清单.ad", "每日任务")
            c4 = rename_page("每日任务.ad", "a/b:c*d")
            c5 = rename_page("a-b-c-d.ad", "自链页二")
            c6 = rename_page("不存在.ad", "随便")
            c7 = rename_page("wiki/Tasks.ad", "tasks")
            c8 = rename_page("wiki/CAP Theorem.ad", "")
            done = true
        }
    }
}
`

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "jade-probe-rename"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeRename"
window: "400x300"
`,
    'utf8',
  )
}

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

async function runMergedArm() {
  prepareWorkspace(MERGED_WS)
  const orig = captureOriginals(MERGED_WS)
  buildProbeProject()
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: PROBE_DIR,
    env: { ...process.env, AUTOUI_MCP_PORT: String(MERGED_PORT), JADE_WORKSPACE: MERGED_WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const { rpc, callTool } = makeClient(MERGED_PORT)
    const deadline = Date.now() + 45000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-rename', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    // 轮询等 Init 直调链落定（done=true）
    const pollDeadline = Date.now() + 30000
    let dump = ''
    for (;;) {
      dump = (await callTool('autoui_state', {})).trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}`)
      await sleep(300)
    }
    // setup 自证（失败先抛——案值失真前置排除）
    const field = (name, re) => dump.match(new RegExp(`${name}:\\s*${re}`))?.[1] ?? null
    const strField = (name) => field(name, '"((?:[^"\\\\]|\\\\.)*)"')
    const boolField = (name) => field(name, '(true|1|false|0)')
    const setupOk = strField('s1') === '自链页.ad' && boolField('w1') !== null && boolField('w1') !== '0' && boolField('w1') !== 'false' && boolField('w2') !== null && boolField('w2') !== '0' && boolField('w2') !== 'false'
      && strField('s2') === '任务清单.ad' && boolField('w3') !== null && boolField('w3') !== '0' && boolField('w3') !== 'false'
    if (!setupOk) throw new Error(`probe setup failed (s1=${strField('s1')} w1=${boolField('w1')} w2=${boolField('w2')} s2=${strField('s2')} w3=${boolField('w3')})`)
    const returns = {}
    for (const c of CASES) {
      returns[c.id] = strField(RET_FIELD[c.id])
      if (returns[c.id] === null) throw new Error(`probe state missing ${RET_FIELD[c.id]}:\n${dump.slice(0, 800)}`)
    }
    // ⑤ 附带案（空名守卫）返回值 = c8
    returns['5b-empty-name'] = strField('c8')
    return { returns, diskCheck: (failures) => diskAsserts(MERGED_WS, orig, 'merged', failures) }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂：serve-back POST ----------------

async function runSplitArm() {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT })
  try {
    const post = async (api, payload) => {
      const res = await fetch(`${back.url}/api/${api}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`POST ${api}(${JSON.stringify(payload)}) -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const text = await res.text()
      let val
      try { val = JSON.parse(text) } catch { val = text }
      return String(val)
    }
    // setup（serve-back 已自灌 fixture——在其后造档）
    for (const s of SETUP) {
      if (s.kind === 'create') await post('create_page', { title: s.title })
      else await post('write_wiki', { path: s.path, body: s.body })
    }
    const orig = captureOriginals(back.workspace)
    const returns = {}
    for (const c of CASES) {
      if (c.id === '2-anchor') {
        // ② 为①弧线内子断言（同一次 rename 的磁盘面）——不重复执行
        //（重复 POST 会因 old 已改名而得 ""）。
        returns[c.id] = returns['1-basic']
        continue
      }
      returns[c.id] = await post('rename_page', { old_path: c.old_path, new_name: c.new_name })
    }
    returns['5b-empty-name'] = await post('rename_page', { old_path: 'wiki/CAP Theorem.ad', new_name: '' })
    return { returns, diskCheck: (failures) => diskAsserts(back.workspace, orig, 'split', failures) }
  } finally {
    await back.stop()
  }
}

// ---- 语料原字节捕获（改名前——期望值来源；init 时 wiki/ 下仍为原语料） ----
function captureOriginals(ws) {
  const read = (rel) => fs.readFileSync(path.join(ws, rel), 'utf8')
  return {
    capTheoremSrc: read('wiki/CAP 定理.ad'),
    index: read('wiki/index.ad'),
    helloWorld: read('wiki/Hello World.ad'),
    tasks: read('wiki/Tasks.ad'),
    projects: read('wiki/Projects.ad'),
    gardenJson: read('jade-garden-index.json'),
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-rename] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-rename] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-rename] 双臂返回值逐案对读：')
let agree = true
for (const c of CASES) {
  const m = merged.returns[c.id]
  const s = split.returns[c.id]
  const ok = m === s && m === c.expect
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect="${c.expect}"`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}" expect="${c.expect}"`)
}
const m8 = merged.returns['5b-empty-name']
const s8 = split.returns['5b-empty-name']
if (m8 === '' && s8 === '') {
  console.log('  [5b-empty-name] PASS — merged="" split="" expect=""（清洗空名守卫）')
} else {
  agree = false
  failures.push(`case 5b-empty-name: merged="${m8}" split="${s8}" expect=""`)
  console.log(`  [5b-empty-name] FAIL — merged="${m8}" split="${s8}" expect=""`)
}

if (failures.length > 0) {
  console.error(`\n[probe-rename] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-rename] RESULT: merged + split 全案通过（八案 + 空名守卫附带案 + 改写逐字节/锚透传/自链/CJK/清洗/三拒磁盘复核 + 副作用圈定）+ 双臂一致=${agree}`)
