#!/usr/bin/env node
// probe_create.mjs — PLAN-005 T-01 create_page 契约六案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-merged/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调
//              create_page 并落 model 字段），`auto run -r vm` 进程内 CALL
//              ——autoui_state 全量 dump 读回返回值；直证后随 .runtime 再生
//              语义存在（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              POST /api/create_page 六案（JSON body——write_wiki/search_wiki
//              同款 POST 通道，D-19 面：CJK 走 body 不走 query）。
//
// 案表（§6 六案展开；期望值 = SD-501 清洗规则 + 幂等守卫 + 模板定文）：
//   ① 新建（ASCII）        "Probe Page" → "Probe Page.ad"（新建）
//   ② CJK 目标             "首页"       → "首页.ad"（新建；后再调 = 幂等）
//   ③ 清洗                 "a/b:c*d"    → "a-b-c-d.ad"（九字符→'-'）
//                          "标/题"      → "标-题.ad"（CJK+非法混形）
//   ④ 已存在幂等           "seed" ×2（盘上预置）→ "seed.ad" 且内容逐字节
//                          不变；"首页" 再调 → "首页.ad" 内容不变
//   ⑤ 清洗后空名           "///" → ""（守卫，零落盘）；"   " → ""
//   ⑥ 模板断言             新建档 read 逐字节 = "# {title}\n\n"（title =
//                          wikilink 原文非清洗名；无 frontmatter）
//
// 双臂一致 = 两臂返回值逐案相等（G2）。D-21 负载窗 flake：无-RESULT 早崩
// 按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_create.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-merged')
const MERGED_WS = path.join(RUNTIME, 'probe-workspace')
const MERGED_PORT = 9399
const SPLIT_PORT = 8253

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 案表（双臂共享；expect = 落盘名 / ""）----
const CASES = [
  { id: '1-new-ascii', title: 'Probe Page', expect: 'Probe Page.ad' },
  { id: '2-cjk', title: '首页', expect: '首页.ad' },
  { id: '3-clean', title: 'a/b:c*d', expect: 'a-b-c-d.ad' },
  { id: '3b-clean-cjk', title: '标/题', expect: '标-题.ad' },
  { id: '4-idem-seed', title: 'seed', expect: 'seed.ad' },
  { id: '4b-idem-seed-again', title: 'seed', expect: 'seed.ad' },
  { id: '4c-idem-cjk', title: '首页', expect: '首页.ad' },
  { id: '5-empty-slashes', title: '///', expect: '' },
  { id: '5b-empty-ws', title: '   ', expect: '' },
]
const GUARDED_TITLES = ['///', '   ']

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
  // 案④ 幂等预置：根落位 seed.ad（语料根无 .ad——隔离拷贝内自造，源零污染）
  fs.writeFileSync(path.join(ws, 'seed.ad'), 'SEED-ORIGINAL-BYTES\n', 'utf8')
  return fs.readFileSync(path.join(ws, 'seed.ad'), 'utf8')
}

function diskAsserts(ws, seedBefore, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  // ⑥ 模板：新建档逐字节 = "# {title}\n\n"（原文非清洗名；无 frontmatter）
  for (const [file, title] of [
    ['Probe Page.ad', 'Probe Page'],
    ['首页.ad', '首页'],
    ['a-b-c-d.ad', 'a/b:c*d'],
    ['标-题.ad', '标/题'],
  ]) {
    let body = ''
    try { body = fs.readFileSync(path.join(ws, file), 'utf8') } catch {}
    ck(body === `# ${title}\n\n`, `模板 ${file} = "# ${title}\\n\\n" 逐字节`)
  }
  // ④ 幂等：seed.ad 逐字节不变
  const seedAfter = fs.readFileSync(path.join(ws, 'seed.ad'), 'utf8')
  ck(seedAfter === seedBefore, '幂等 seed.ad 内容逐字节不变')
  // ⑤ 守卫：零落盘（无 ---.ad / 空白名档）
  ck(!fs.existsSync(path.join(ws, '---.ad')), '守卫 "///" 零落盘（无 ---.ad）')
  const rootAds = fs.readdirSync(ws).filter((f) => f.endsWith('.ad'))
  ck(
    rootAds.every((f) => ['Probe Page.ad', '首页.ad', 'a-b-c-d.ad', '标-题.ad', 'seed.ad'].includes(f)),
    `根 .ad 集合恰为五新建/预置档（实际：${rootAds.join(', ')}）`,
  )
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_create.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 create_page，返回值落 model 字段供
// autoui_state dump 读回。入口文件名固定 app.at（auto 前端入口约定）。
use back.api: create_page

widget App {
    msg { Init }
    model {
        var done bool = false
        var c1_new str = ""
        var c2_cjk str = ""
        var c3_clean str = ""
        var c3b_mix str = ""
        var c4_idem str = ""
        var c4b_idem str = ""
        var c4c_cjk str = ""
        var c5_slash str = ""
        var c5b_ws str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: create_page" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            c1_new = create_page("Probe Page")
            c2_cjk = create_page("首页")
            c3_clean = create_page("a/b:c*d")
            c3b_mix = create_page("标/题")
            c4_idem = create_page("seed")
            c4b_idem = create_page("seed")
            c4c_cjk = create_page("首页")
            c5_slash = create_page("///")
            c5b_ws = create_page("   ")
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
    `name: "jade-probe-create"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeCreate"
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
  const seedBefore = prepareWorkspace(MERGED_WS)
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-create', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    // 轮询等 Init 直调链落定（done=true）
    const pollDeadline = Date.now() + 20000
    let dump = ''
    for (;;) {
      dump = (await callTool('autoui_state', {})).trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}`)
      await sleep(300)
    }
    const field = (name) => dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1] ?? null
    const returns = {}
    for (const c of CASES) {
      const key = {
        '1-new-ascii': 'c1_new', '2-cjk': 'c2_cjk', '3-clean': 'c3_clean', '3b-clean-cjk': 'c3b_mix',
        '4-idem-seed': 'c4_idem', '4b-idem-seed-again': 'c4b_idem', '4c-idem-cjk': 'c4c_cjk',
        '5-empty-slashes': 'c5_slash', '5b-empty-ws': 'c5b_ws',
      }[c.id]
      returns[c.id] = field(key)
      if (returns[c.id] === null) throw new Error(`probe state missing ${key}:\n${dump.slice(0, 800)}`)
    }
    return { returns, diskCheck: (failures) => diskAsserts(MERGED_WS, seedBefore, 'merged', failures) }
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
    // 案④ 幂等预置（serve-back 自行重灌 fixture——预置在其后注入）
    fs.writeFileSync(path.join(back.workspace, 'seed.ad'), 'SEED-ORIGINAL-BYTES\n', 'utf8')
    const seedBefore = fs.readFileSync(path.join(back.workspace, 'seed.ad'), 'utf8')
    const returns = {}
    for (const c of CASES) {
      const res = await fetch(`${back.url}/api/create_page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: c.title }),
      })
      if (!res.ok) throw new Error(`POST create_page("${c.title}") -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const text = await res.text()
      let val
      try { val = JSON.parse(text) } catch { val = text }
      returns[c.id] = String(val)
    }
    return { returns, diskCheck: (failures) => diskAsserts(back.workspace, seedBefore, 'split', failures) }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-create] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-create] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-create] 双臂返回值逐案对读：')
let agree = true
for (const c of CASES) {
  const m = merged.returns[c.id]
  const s = split.returns[c.id]
  const ok = m === s && m === c.expect
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect="${c.expect}"`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}" expect="${c.expect}"`)
}

if (failures.length > 0) {
  console.error(`\n[probe-create] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-create] RESULT: merged + split 全案通过（${CASES.length} 案返回值 + 模板/幂等/守卫磁盘复核）+ 双臂一致=${agree}`)
