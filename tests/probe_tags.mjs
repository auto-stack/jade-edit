#!/usr/bin/env node
// probe_tags.mjs — PLAN-008 T-01 tags_index 契约六案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-tags/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调
//              tags_index 三深度（4 全集/1 根层/2 一层展开），返回值落
//              model 字段），`auto run -r vm` 进程内 CALL——autoui_state
//              dump 读回（字符串值含 \" 转义，读回侧反转义后 JSON.parse）。
//              直证后随 .runtime 再生语义存在（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              GET /api/tags_index?path=&depth=N（tree/link_index 同族
//              GET 通道——path/depth ASCII 无 D-19 面）。
//
// 探针素材（workspace 隔离拷贝后 Node 直写——源零污染；覆盖语料无的
// 形态面）：probe-nofm.ad（无 frontmatter）/ probe-notags.ad（frontmatter
// 无 tags 键）/ wiki/dup.ad（同页重复 tag + 两空格缩进）/ probe-sub/
// {a,b,nested}.ad（多页同 tag + depth 面）/ probe-crlf.ad（CRLF 行尾
// ——界符 "---\r" 双形态 + trim 容错）。
//
// 案表（§6 六案；期望值 = SD-801 定文 + 语料实勘已知答案【执行期校正】：
// 语料 tags 全集 = 7 tag——计划原记 6 漏勘 Hello World.ad 的 `- demo`；
// 集合含探针素材后 = 11 tag）：
//   ① 全集首锁      depth=4 → 11 tag，tag 序 = first-seen（walk 序），
//                   每 tag paths 精确（含归属页逐项）
//   ② 无 frontmatter 贡献零   probe-nofm.ad 不入任何 tag
//   ③ 无 tags 键贡献零        probe-notags.ad 不入任何 tag
//   ④ 缩进两形态    `  - tasks`（两空格，Tasks.ad/index.ad）与 `- demo`/
//                   `- probe-shared`（无缩进）并在同集
//   ⑤ 同页重复去重  wiki/dup.ad 双写 probe-dup → 输出恰一 tag 条目一
//                   path（page_tags 页内去重 + pass1 全局去重双层；输出
//                   层不变式 = 单条目单 path——纵深防御面如实注记）
//   ⑥ depth 传递    depth=1 → "[]"（根层两探针档均无 tag）；depth=2 =
//                   depth=4 全集（全部 .ad 在第 2 层）
// 双臂一致 = 两臂 JSON.parse 深等。D-21 负载窗：无-RESULT 早崩按 README
// 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_tags.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-tags')
const MERGED_WS = path.join(RUNTIME, 'probe-tags-workspace')
const MERGED_PORT = 9399
// 8251-8950 现为 Windows WinNAT 排除区段（netsh interface ipv4
// show excludedportrange——复审窗实勘，T-01 执行期 8254 尚可用）；
// split 臂端口移至区段外（serve-back 默认 8211 同在区段外）。
const SPLIT_PORT = 8221

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 探针素材（workspace 拷贝后直写） ----
function materializeWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
  fs.writeFileSync(path.join(ws, 'probe-nofm.ad'), '# No FM\n\n', 'utf8')
  fs.writeFileSync(path.join(ws, 'probe-notags.ad'), '---\ntitle: NoTags\nsummary: 无 tags 键\n---\n\n# NT\n', 'utf8')
  fs.writeFileSync(
    path.join(ws, 'wiki', 'dup.ad'),
    '---\ntags:\n  - probe-dup\n  - probe-dup\n---\n\n# D\n',
    'utf8',
  )
  fs.mkdirSync(path.join(ws, 'probe-sub'), { recursive: true })
  fs.writeFileSync(path.join(ws, 'probe-sub', 'a.ad'), '---\ntags:\n- probe-shared\n---\n\n# A\n', 'utf8')
  fs.writeFileSync(path.join(ws, 'probe-sub', 'b.ad'), '---\ntags:\n- probe-shared\n---\n\n# B\n', 'utf8')
  fs.writeFileSync(path.join(ws, 'probe-sub', 'nested.ad'), '---\ntags:\n  - probe-nested\n---\n\n# N\n', 'utf8')
  fs.writeFileSync(
    path.join(ws, 'probe-crlf.ad'),
    '---\r\ntags:\r\n  - probe-crlf\r\n---\r\n\r\n# C\r\n',
    'utf8',
  )
}

// ---- 期望值（SD-801 定文 + 语料实勘【执行期校正：7 语料 tag 非计划记
// 的 6——Hello World.ad 实有 `- demo`】；tag 序 = first-seen walk 序） ----
const EXPECT_ORDER = [
  'probe-shared',
  'probe-nested',
  'distributed-systems',
  'theory',
  'probe-dup',
  'demo',
  'index',
  'jade-garden',
  'project-management',
  'tasks',
  'probe-crlf',
]
const EXPECT_PATHS = {
  'probe-shared': ['probe-sub/a.ad', 'probe-sub/b.ad'],
  'probe-nested': ['probe-sub/nested.ad'],
  'distributed-systems': ['wiki/CAP 定理.ad'],
  theory: ['wiki/CAP 定理.ad'],
  'probe-dup': ['wiki/dup.ad'],
  demo: ['wiki/Hello World.ad'],
  index: ['wiki/index.ad'],
  'jade-garden': ['wiki/index.ad'],
  'project-management': ['wiki/Projects.ad'],
  tasks: ['wiki/Tasks.ad'],
  'probe-crlf': ['probe-crlf.ad'],
}

function caseAsserts(json4, json1, json2, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const parse = (s) => JSON.parse(s)
  const tagsOf = (j) => j.map((r) => r.tag)
  const pathsOf = (j, name) => j.find((r) => r.tag === name)?.paths ?? null

  // ① 全集首锁：11 tag + first-seen 序 + 每 tag paths 精确
  const got4 = parse(json4)
  const tags4 = tagsOf(got4)
  ck(
    JSON.stringify(tags4) === JSON.stringify(EXPECT_ORDER),
    `① 全集首锁 11 tag + first-seen 序（got=${JSON.stringify(tags4)}）`,
  )
  let pathsOk = true
  for (const t of EXPECT_ORDER) {
    if (JSON.stringify(pathsOf(got4, t)) !== JSON.stringify(EXPECT_PATHS[t])) pathsOk = false
  }
  ck(pathsOk, '① 归属页逐项精确（11 tag × paths）')

  // ②/③ 无 frontmatter / 无 tags 键 → 贡献零
  const nofmOk = !tags4.includes('probe-nofm') && !got4.some((r) => r.paths.includes('probe-nofm.ad'))
  const notagsOk = !tags4.includes('probe-notags') && !got4.some((r) => r.paths.includes('probe-notags.ad'))
  ck(nofmOk, '② 无 frontmatter 档贡献零（probe-nofm.ad 不入集）')
  ck(notagsOk, '③ 无 tags 键档贡献零（probe-notags.ad 不入集）')

  // ④ 缩进两形态：两空格（tasks 两空格缩进源）与无缩进（demo/probe-shared）并在
  const twoSpace = tags4.includes('tasks') && tags4.includes('index') && tags4.includes('jade-garden')
  const noIndent = tags4.includes('demo') && tags4.includes('probe-shared') && tags4.includes('distributed-systems')
  ck(twoSpace && noIndent, '④ 缩进两形态并在（`  - x` tasks/index/jade-garden + `- x` demo/probe-shared/distributed-systems）')

  // ⑤ 同页重复去重：probe-dup 恰一 tag 条目一 path（dup.ad 双写源）
  const dupEntries = got4.filter((r) => r.tag === 'probe-dup')
  ck(
    dupEntries.length === 1 && JSON.stringify(dupEntries[0]?.paths) === JSON.stringify(['wiki/dup.ad']),
    '⑤ 同页重复 tag 去重（dup.ad 双写 → 单条目单 path）',
  )

  // ⑥ depth 传递：depth=1 → 仅根层（probe-crlf.ad——唯一带 tag 的根层
  // 档；probe-sub/wiki 目录未展开）；depth=2 = depth=4 全集
  const got1 = parse(json1)
  const d1Ok =
    json1.trim() === JSON.stringify([{ tag: 'probe-crlf', paths: ['probe-crlf.ad'] }])
  ck(d1Ok, `⑥ depth=1 → 仅根层 probe-crlf（目录未展开；got=${json1.trim().slice(0, 80)}）`)
  const got2 = parse(json2)
  ck(
    JSON.stringify(tagsOf(got2)) === JSON.stringify(EXPECT_ORDER) && got2.length === got4.length,
    '⑥ depth=2 = depth=4 全集（全部 .ad 在第 2 层）',
  )
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_tags.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 tags_index 三深度，返回值落 model 字段供
// autoui_state dump 读回。入口文件名固定 app.at。
use back.api: tags_index

widget App {
    msg { Init }
    model {
        var done bool = false
        var c_all str = ""
        var c_d1 str = ""
        var c_d2 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: tags_index" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            c_all = tags_index("", 4)
            c_d1 = tags_index("", 1)
            c_d2 = tags_index("", 2)
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
    `name: "jade-probe-tags"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeTags"
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-tags', version: '0.1.0' } })
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
    const field = (name) => {
      const m = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
      if (!m) throw new Error(`probe state missing ${name}:\n${dump.slice(0, 800)}`)
      return unescapeDump(m[1])
    }
    return { json4: field('c_all'), json1: field('c_d1'), json2: field('c_d2') }
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
    //（walk 每请求现算，先落位后 GET 即可）。
    materializeWorkspace(back.workspace)
    const get = async (depth) => {
      const res = await fetch(`${back.url}/api/tags_index?path=&depth=${depth}`)
      if (!res.ok) throw new Error(`GET tags_index(depth=${depth}) -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const text = await res.text()
      // str 返回值的 HTTP body = JSON 引号包裹形态（probe_delete post 同款
      // 剥壳——内层才是 tags JSON 数组原文）
      try {
        const val = JSON.parse(text)
        if (typeof val === 'string') return val
      } catch {}
      return text
    }
    return { json4: await get(4), json1: await get(1), json2: await get(2) }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-tags] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
caseAsserts(merged.json4, merged.json1, merged.json2, 'merged', failures)

console.log(`[probe-tags] arm 2: split serve-back GET（:${SPLIT_PORT}，tree/link_index 同族 query 通道）`)
const split = await runSplitArm()
caseAsserts(split.json4, split.json1, split.json2, 'split', failures)

console.log('\n[probe-tags] 双臂返回值逐案对读：')
let agree = true
for (const k of ['json4', 'json1', 'json2']) {
  const m = merged[k]
  const s = split[k]
  const ok = m === s
  if (!ok) agree = false
  console.log(`  [${k}] ${ok ? 'PASS' : 'FAIL'} — 双臂逐字节一致=${ok}`)
  if (!ok) failures.push(`arm-consistency ${k}: 双臂不一致`)
}

if (failures.length > 0) {
  console.error(`\n[probe-tags] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-tags] RESULT: merged + split 全案通过（六案：全集首锁 11 tag[first-seen+归属精确]/无 frontmatter 零/无 tags 键零/缩进两形态/同页去重/depth 传递[d1=[]+d2=d4] + CRLF 形态 + 双臂一致=${agree}）`)
