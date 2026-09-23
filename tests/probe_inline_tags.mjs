#!/usr/bin/env node
// probe_inline_tags.mjs — PLAN-009 T-01 tags_json 行内 #tag 聚合扩七案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-inline-tags/，脚本生成——
//              pac.at render vm + src/back 整树拷贝 + 探针 widget Init 内
//              直调 tags_index("",4)，返回值落 model 字段），`auto run -r vm`
//              进程内 CALL——autoui_state dump 读回（字符串值含 \" 转义，
//              读回侧反转义后 JSON.parse）。直证后随 .runtime 再生语义
//              存在（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              GET /api/tags_index?path=&depth=4（tree/link_index 同族
//              GET 通道——path/depth ASCII；tag 值在响应 body，UTF-8 JSON
//              无 D-19 面，CJK token 双臂同跑）。
//
// 探针素材（workspace 隔离拷贝后 Node 直写——源零污染）：
//   wiki/probe-inline.ad  fm `tags: - dup-shared` + body 五面同档：
//              `正文 #项目x 尾`（inline 计入）/`# Head Title`（标题忽略）/
//              `## Sub {#anchor-1}`（二级标题 + 块锚忽略）/`计数 #123 与
//              #456`（纯数字忽略）/`共 #dup-shared 一条`（fm+inline 并集
//              去重——同页同 tag 单条目单 path）；
//   wiki/probe-cjk.ad     body `行内 #中文标签 入集`（CJK token——POST 面
//              不存在，GET 契约 body 响应即足）。
//
// 案表（§6 七案；期望值 = SD-901 定文 + 语料实勘已知答案——语料无合法
// inline #tag，7 语料 tag 基线零漂移[probe_tags 六案在册同口径]）：
//   ① 语料基线零漂移   7 语料 tag 全在且 paths 精确；`block-project-a`
//                      （Tasks.ad `## …{#block-project-a}`）不入集——
//                      忽略三则全数生效证
//   ② inline 计入      项目x 入集（probe-inline.ad 归属）
//   ③ 标题忽略         `# Head Title`/`## Sub`（含语料 `# Tasks`/`## 项目…`）
//                      不入集——无 Head/Sub/Title/Tasks 行内源 tag
//   ④ 块锚忽略         `{#anchor-1}`/`{#block-project-a}` 不入集
//   ⑤ 纯数字忽略       `#123`/`#456` 不入集
//   ⑥ fm+inline 并集去重  dup-shared 恰一 tag 条目一 path（fm/inline
//                      两源同 tag）
//   ⑦ CJK token        中文标签 入集（双臂——GET body 响应面无 D-19）
// 双臂一致 = 两臂 JSON.parse 深等 + 逐字节等。D-21 负载窗：无-RESULT
// 早崩按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_inline_tags.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-inline-tags')
const MERGED_WS = path.join(RUNTIME, 'probe-inline-tags-workspace')
const MERGED_PORT = 9399
// 8251-8950 现为 Windows WinNAT 排除区段（netsh interface ipv4
// show excludedportrange——复审窗实勘）——split 臂端口取区段外
//（probe_tags 8221 / G4 8222/8223 同款适配）。
const SPLIT_PORT = 8224

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 探针素材（workspace 拷贝后直写） ----
function materializeWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
  fs.writeFileSync(
    path.join(ws, 'wiki', 'probe-inline.ad'),
    '---\ntags:\n  - dup-shared\n---\n\n正文 #项目x 尾\n\n# Head Title\n\n## Sub {#anchor-1}\n\n计数 #123 与 #456\n\n共 #dup-shared 一条\n',
    'utf8',
  )
  fs.writeFileSync(path.join(ws, 'wiki', 'probe-cjk.ad'), '行内 #中文标签 入集\n', 'utf8')
}

// ---- 期望值（SD-901 定文；tag 序 = first-seen walk 序——语料 7 tag
// fm 序零漂移在前，inline 新 tag 按 walk 序追加其后） ----
const EXPECT_ORDER = [
  'distributed-systems',
  'theory',
  'demo',
  'index',
  'jade-garden',
  '中文标签',
  'dup-shared',
  '项目x',
  'project-management',
  'tasks',
]
const EXPECT_PATHS = {
  'distributed-systems': ['wiki/CAP 定理.ad'],
  theory: ['wiki/CAP 定理.ad'],
  demo: ['wiki/Hello World.ad'],
  index: ['wiki/index.ad'],
  'jade-garden': ['wiki/index.ad'],
  中文标签: ['wiki/probe-cjk.ad'],
  'dup-shared': ['wiki/probe-inline.ad'],
  项目x: ['wiki/probe-inline.ad'],
  'project-management': ['wiki/Projects.ad'],
  tasks: ['wiki/Tasks.ad'],
}
// 忽略三则负向面：绝不可入集的全集
const NEGATIVE = ['block-project-a', 'Head', 'Title', 'Sub', 'anchor-1', '123', '456']

function caseAsserts(json4, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const got = JSON.parse(json4)
  const tagsOf = got.map((r) => r.tag)
  const pathsOf = (name) => got.find((r) => r.tag === name)?.paths ?? null

  // ① 全集首锁：10 tag + first-seen 序 + 每 tag paths 精确（语料 7
  // tag 零漂移 + inline 三新 tag 追加——②/⑦ 计入面同本条一并锁）
  ck(
    JSON.stringify(tagsOf) === JSON.stringify(EXPECT_ORDER),
    `①②⑦ 全集首锁 10 tag + first-seen 序（语料 7 零漂移 + 项目x/中文标签 计入；got=${JSON.stringify(tagsOf)}）`,
  )
  let pathsOk = true
  for (const t of EXPECT_ORDER) {
    if (JSON.stringify(pathsOf(t)) !== JSON.stringify(EXPECT_PATHS[t])) pathsOk = false
  }
  ck(pathsOk, '① 归属页逐项精确（10 tag × paths）')

  // ① 负向面：忽略三则全数生效（标题/块锚/纯数字——含语料
  // `{#block-project-a}` 实勘边界）
  const negOk = NEGATIVE.every((n) => !tagsOf.includes(n))
  ck(negOk, '①③④⑤ 忽略三则负向面（标题/块锚/纯数字 token 全数不入集）')

  // ⑤ 同页 fm+inline 并集去重：dup-shared 恰一条目一 path
  const dupEntries = got.filter((r) => r.tag === 'dup-shared')
  ck(
    dupEntries.length === 1 && JSON.stringify(dupEntries[0]?.paths) === JSON.stringify(['wiki/probe-inline.ad']),
    '⑥ fm+inline 并集去重（两源同 tag → 单条目单 path）',
  )
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_inline_tags.mjs 生成件——直证后随 .runtime
// 再生，非入库源）。Init 内进程内直调 tags_index 全集，返回值落 model
// 字段供 autoui_state dump 读回。入口文件名固定 app.at。
use back.api: tags_index

widget App {
    msg { Init }
    model {
        var done bool = false
        var c_all str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: tags_index inline" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            c_all = tags_index("", 4)
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
    `name: "jade-probe-inline-tags"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeInlineTags"
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

// state dump 字符串值读回：剥引号壳 + 反转义（\" 与 \\ ——dump 转义形）。
function unescapeDump(raw) {
  return raw.replace(/\\(["\\])/g, '$1')
}

async function runMergedArm() {
  materializeWorkspace(MERGED_WS)
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-inline-tags', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    const pollDeadline = Date.now() + 30000
    let dump = ''
    for (;;) {
      dump = (await callTool('autoui_state', {})).trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}`)
      await sleep(300)
    }
    const m = dump.match(new RegExp('c_all:\\s*"((?:[^"\\\\]|\\\\.)*)"'))
    if (!m) throw new Error(`probe state missing c_all:\n${dump.slice(0, 800)}`)
    return { json4: unescapeDump(m[1]) }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂：serve-back GET ----------------

async function runSplitArm() {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT })
  try {
    // serveBackend 自物化 workspace（fixture 拷贝）——探针素材补位于其上
    // （walk 每请求现算，先落位后 GET 即可）。
    materializeWorkspace(back.workspace)
    const res = await fetch(`${back.url}/api/tags_index?path=&depth=4`)
    if (!res.ok) throw new Error(`GET tags_index(depth=4) -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const text = await res.text()
    // str 返回值的 HTTP body = JSON 引号包裹形态（probe_tags 同款剥壳——
    // 内层才是 tags JSON 数组原文）
    try {
      const val = JSON.parse(text)
      if (typeof val === 'string') return { json4: val }
    } catch {}
    return { json4: text }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-inline-tags] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
caseAsserts(merged.json4, 'merged', failures)

console.log(`[probe-inline-tags] arm 2: split serve-back GET（:${SPLIT_PORT}，tree/link_index 同族 query 通道）`)
const split = await runSplitArm()
caseAsserts(split.json4, 'split', failures)

console.log('\n[probe-inline-tags] 双臂返回值对读：')
const agree = merged.json4 === split.json4
console.log(`  [json4] ${agree ? 'PASS' : 'FAIL'} — 双臂逐字节一致=${agree}`)
if (!agree) failures.push('arm-consistency json4: 双臂不一致')

if (failures.length > 0) {
  console.error(`\n[probe-inline-tags] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-inline-tags] RESULT: merged + split 全案通过（七案：语料 7 tag 零漂移+忽略三则负向面/inline 计入 项目x/标题忽略/块锚忽略/纯数字忽略/fm+inline 并集去重 dup-shared/CJK token 中文标签 + 双臂一致=${agree}）`)
