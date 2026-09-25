#!/usr/bin/env node
// probe_casefold.mjs — PLAN-017 T-01 链接解析四级序直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-casefold/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内先取
//              pristine link_index（基线零漂移锚）再 write_wiki 造档后取
//              扩容后 link_index，返回值落 model 字段供 autoui_state dump 读回）。
//   split 臂   serve-back（`auto run --server vm`）GET /api/link_index（两轮，
//              中间 POST /api/write_wiki 造档——D-19 面：CJK 走 body）。
//
// 案表（§6 解析案 + §10.1 精确优先级断言通道落定——Windows 同目录不可造
// 大小写变体双档[大小写不敏感 FS]，变体竞争对经 **root × wiki/ 跨目录** 造：
// stems 全局收集，跨目录 stem 变体天然可并存；walk 序[fs.tree dirs-first +
// 名称 casefold] = wiki/ 先于 root 档——casefold 竞争档 walk 序更早的构造
// 由 fixture 布局保证）：
//   ① [[hello world]] → wiki/Hello World.ad（③级 stem casefold——语料目标
//      档现成已知答案）+ [[HELLO WORLD]] 同
//      [[Hello World]] → wiki/Hello World.ad（①级精确——对照档）
//   ② 精确优先于 casefold + walk 序（§10.1）：[[Z Upper]] → Z Upper.ad
//      （root，①级 exact 命中）——casefold 竞争档 wiki/z upper.ad（③级
//      匹配、walk 序更早）让位；[[z upper]] → wiki/z upper.ad（①级 exact）
//   ③ 级间序 ②>③：[[foo]] → wiki/cf alias foo.ad（②级 alias 精确）——
//      ③级竞争档 wiki/FOO.ad（stem "FOO" casefold 匹配）让位
//      （①>② 在册：probe_alias_linkify 案② [[Other]] stem 优先——回归）
//   ④ 级间序 ③>④：[[bar]] → wiki/BAR.ad（③级 stem casefold）——④级竞争档
//      wiki/cf alias BAR.ad（alias "BAR" casefold 匹配）让位
//   ⑤ ④级可用：[[qux]] → wiki/cf alias QUX.ad（alias "QUX" casefold）
//      alias casefold 混合形：[[hat]] → wiki/cf alias Hat.ad（alias "Hat"）
//   ⑥ CJK 零影响：[[首页]] → exists=false（to_lower 恒等——扩容不翻转）
//   ⑦ 语料基线零漂移：pristine link_index（造档前）5 页 10 链接全已知答案
//      逐链接断言（精确档全命中 / [[首页]]·[[页面名]] 恒悬空）+ 双臂深等
//
// 用法（仓根）：node tests/probe_casefold.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-casefold')
const MERGED_WS = path.join(RUNTIME, 'probe-casefold-workspace')
const MERGED_PORT = 9399
const SPLIT_PORT = await pickPort()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 探针造档面（§10.1 跨目录变体通道 + 级间序竞争对）----
const PAGES = [
  // ② 精确 vs casefold + walk 序（root × wiki/ 跨目录变体对）
  { path: 'Z Upper.ad', body: 'P1 exact stem winner\n' },
  { path: 'wiki/z upper.ad', body: 'P1 casefold competitor (walk earlier)\n' },
  // ③ ②>③（alias 精确 vs stem casefold）
  { path: 'wiki/cf alias foo.ad', body: '---\naliases:\n  - foo\n---\n\nA1 alias exact winner\n' },
  { path: 'wiki/FOO.ad', body: 'B1 stem casefold competitor\n' },
  { path: 'wiki/cf alias upper.ad', body: '---\naliases:\n  - FOO\n---\n\nC1 alias casefold competitor (foo)\n' },
  // ④ ③>④（stem casefold vs alias casefold）
  { path: 'wiki/BAR.ad', body: 'B2 stem casefold winner\n' },
  { path: 'wiki/cf alias BAR.ad', body: '---\naliases:\n  - BAR\n---\n\nC2 alias casefold competitor (bar)\n' },
  // ⑤ ④级可用（含混合形 alias "Hat"）
  { path: 'wiki/cf alias QUX.ad', body: '---\naliases:\n  - QUX\n---\n\nC3 alias casefold winner (qux)\n' },
  { path: 'wiki/cf alias Hat.ad', body: '---\naliases:\n  - Hat\n---\n\nC4 alias casefold (hat)\n' },
]
const CALLER_REL = 'wiki/CF Caller.ad'
const CALLER_BODY = [
  '[[hello world]]',
  '[[HELLO WORLD]]',
  '[[Hello World]]',
  '[[hat]]',
  '[[foo]]',
  '[[bar]]',
  '[[qux]]',
  '[[Z Upper]]',
  '[[z upper]]',
  '[[首页]]',
  '',
].join('\n')

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

// ---- pristine 基线已知答案（fixture 5 页 10 链接——§4.2 语料实勘面）----
const PRISTINE_PAGES = {
  'wiki/CAP 定理.ad': [
    { target: 'Hello World', exists: true, target_path: 'wiki/Hello World.ad' },
    { target: 'Projects', exists: true, target_path: 'wiki/Projects.ad' },
  ],
  'wiki/Hello World.ad': [
    { target: 'CAP 定理', exists: true, target_path: 'wiki/CAP 定理.ad' },
    { target: '首页', exists: false, target_path: '' },
  ],
  'wiki/Projects.ad': [],
  'wiki/Tasks.ad': [
    { target: 'Hello World', exists: true, target_path: 'wiki/Hello World.ad' },
    { target: 'CAP 定理', exists: true, target_path: 'wiki/CAP 定理.ad' },
  ],
  'wiki/index.ad': [
    { target: 'Hello World', exists: true, target_path: 'wiki/Hello World.ad' },
    { target: 'CAP 定理', exists: true, target_path: 'wiki/CAP 定理.ad' },
    { target: 'Projects', exists: true, target_path: 'wiki/Projects.ad' },
    // index.ad:22 提示行内 `[[页面名]]`（code span 内标记法仍提取——既有
    // 忽略面口径，悬空档；语料实勘第 4 链接）
    { target: '页面名', exists: false, target_path: '' },
  ],
}

function verifyBase(jsonStr, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  let pages
  try {
    pages = JSON.parse(jsonStr)
  } catch (e) {
    ck(false, `⑦ link_index JSON 可解析（${e.message}）`)
    return
  }
  ck(Array.isArray(pages) && pages.length === 5, `⑦ pristine 页数 = 5（实际 ${pages.length}）`)
  for (const p of pages) {
    const exp = PRISTINE_PAGES[p.path]
    if (!exp) {
      ck(false, `⑦ 意外页面 ${p.path}（pristine 面）`)
      continue
    }
    const got = (p.links ?? []).map((l) => `${l.target}|${l.exists}|${l.target_path}`)
    const want = exp.map((l) => `${l.target}|${l.exists}|${l.target_path}`)
    ck(got.join(' ; ') === want.join(' ; '), `⑦ ${p.path} 链接全已知答案（${got.length} 条——精确档全命中/悬空恒悬空）`)
  }
}

// ---- 扩容后断言（①..⑥——CF Caller 链接逐条级间序裁决）----
const CALLER_EXPECT = [
  { target: 'hello world', level: '③ stem cf', exists: true, target_path: 'wiki/Hello World.ad' },
  { target: 'HELLO WORLD', level: '③ stem cf', exists: true, target_path: 'wiki/Hello World.ad' },
  { target: 'Hello World', level: '① exact', exists: true, target_path: 'wiki/Hello World.ad' },
  { target: 'hat', level: '④ alias cf', exists: true, target_path: 'wiki/cf alias Hat.ad' },
  { target: 'foo', level: '② alias exact', exists: true, target_path: 'wiki/cf alias foo.ad' },
  { target: 'bar', level: '③ stem cf', exists: true, target_path: 'wiki/BAR.ad' },
  { target: 'qux', level: '④ alias cf', exists: true, target_path: 'wiki/cf alias QUX.ad' },
  { target: 'Z Upper', level: '① exact', exists: true, target_path: 'Z Upper.ad' },
  { target: 'z upper', level: '① exact', exists: true, target_path: 'wiki/z upper.ad' },
  { target: '首页', level: '悬空（CJK 恒等）', exists: false, target_path: '' },
]

function verifyCf(jsonStr, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  let pages
  try {
    pages = JSON.parse(jsonStr)
  } catch (e) {
    ck(false, `link_index JSON 可解析（${e.message}）`)
    return
  }
  const caller = pages.find((p) => p.path === CALLER_REL)
  ck(!!caller, 'CF Caller.ad 在链接索引中')
  if (!caller) return
  const links = caller.links ?? []
  ck(links.length === CALLER_EXPECT.length, `caller 链接数 = ${CALLER_EXPECT.length}（实际 ${links.length}）`)
  for (const exp of CALLER_EXPECT) {
    const l = links.find((x) => x.target === exp.target)
    ck(
      !!l && l.exists === exp.exists && l.target_path === exp.target_path,
      `[[${exp.target}]] → ${exp.target_path || '悬空'}（${exp.level}；实际 exists=${l?.exists} path=${l?.target_path}）`,
    )
  }
}

function verifyDisk(ws, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  for (const pg of PAGES) {
    let ok = false
    try {
      ok = fs.readFileSync(path.join(ws, pg.path), 'utf8') === pg.body
    } catch {}
    ck(ok, `造档 ${pg.path} 落盘逐字节`)
  }
  let callerOk = false
  try {
    callerOk = fs.readFileSync(path.join(ws, CALLER_REL), 'utf8') === CALLER_BODY
  } catch {}
  ck(callerOk, `造档 ${CALLER_REL} 落盘逐字节`)
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_casefold.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内：pristine link_index → write_wiki 造档 → 扩容后
// link_index，返回值落 model 字段供 autoui_state dump 读回。
use back.api: link_index, write_wiki

widget App {
    msg { Init }
    model {
        var done bool = false
        var base_raw str = ""
        var cf_raw str = ""
        var ok_all bool = true
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: casefold resolve" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            base_raw = link_index("", 4)
            if !write_wiki("Z Upper.ad", "P1 exact stem winner\\n") { ok_all = false }
            if !write_wiki("wiki/z upper.ad", "P1 casefold competitor (walk earlier)\\n") { ok_all = false }
            if !write_wiki("wiki/cf alias foo.ad", "---\\naliases:\\n  - foo\\n---\\n\\nA1 alias exact winner\\n") { ok_all = false }
            if !write_wiki("wiki/FOO.ad", "B1 stem casefold competitor\\n") { ok_all = false }
            if !write_wiki("wiki/cf alias upper.ad", "---\\naliases:\\n  - FOO\\n---\\n\\nC1 alias casefold competitor (foo)\\n") { ok_all = false }
            if !write_wiki("wiki/BAR.ad", "B2 stem casefold winner\\n") { ok_all = false }
            if !write_wiki("wiki/cf alias BAR.ad", "---\\naliases:\\n  - BAR\\n---\\n\\nC2 alias casefold competitor (bar)\\n") { ok_all = false }
            if !write_wiki("wiki/cf alias QUX.ad", "---\\naliases:\\n  - QUX\\n---\\n\\nC3 alias casefold winner (qux)\\n") { ok_all = false }
            if !write_wiki("wiki/cf alias Hat.ad", "---\\naliases:\\n  - Hat\\n---\\n\\nC4 alias casefold (hat)\\n") { ok_all = false }
            if !write_wiki("wiki/CF Caller.ad", "[[hello world]]\\n[[HELLO WORLD]]\\n[[Hello World]]\\n[[hat]]\\n[[foo]]\\n[[bar]]\\n[[qux]]\\n[[Z Upper]]\\n[[z upper]]\\n[[首页]]\\n") { ok_all = false }
            cf_raw = link_index("", 4)
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
    `name: "jade-probe-casefold"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeCasefold"
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

function unescapeDump(raw) {
  return raw.replace(/\\(["\\])/g, '$1')
}

async function runMergedArm() {
  prepareWorkspace(MERGED_WS)
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-casefold', version: '0.1.0' } })
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
      return m ? unescapeDump(m[1]) : null
    }
    if (!/ok_all:\s*true/.test(dump)) throw new Error(`probe setup write_wiki failed:\n${dump.slice(0, 800)}`)
    return {
      base_raw: field('base_raw'),
      cf_raw: field('cf_raw'),
      diskCheck: (failures) => verifyDisk(MERGED_WS, 'merged', failures),
    }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂：serve-back GET/POST ----------------

async function runSplitArm() {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT })
  try {
    const getIndex = async () => {
      const res = await fetch(`${back.url}/api/link_index?path=&depth=4`)
      if (!res.ok) throw new Error(`GET link_index -> HTTP ${res.status}`)
      const text = await res.text()
      try {
        const val = JSON.parse(text)
        return typeof val === 'string' ? val : text
      } catch {
        return text
      }
    }
    const postWrite = async (p, body) => {
      const res = await fetch(`${back.url}/api/write_wiki`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p, body }),
      })
      if (!res.ok) throw new Error(`POST write_wiki(${p}) -> HTTP ${res.status}`)
      return String(await res.text())
    }
    const base_raw = await getIndex()
    for (const pg of PAGES) await postWrite(pg.path, pg.body)
    await postWrite(CALLER_REL, CALLER_BODY)
    const cf_raw = await getIndex()
    return {
      base_raw,
      cf_raw,
      diskCheck: (failures) => verifyDisk(back.workspace, 'split', failures),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-casefold] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
verifyBase(merged.base_raw, 'merged', failures)
verifyCf(merged.cf_raw, 'merged', failures)
merged.diskCheck(failures)

console.log(`[probe-casefold] arm 2: split serve-back GET/POST（:${SPLIT_PORT}）`)
const split = await runSplitArm()
verifyBase(split.base_raw, 'split', failures)
verifyCf(split.cf_raw, 'split', failures)
split.diskCheck(failures)

console.log('\n[probe-casefold] 双臂一致对读：')
const ck = (ok, label) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${label}`)
  if (!ok) failures.push(`consistency: ${label}`)
}
ck(JSON.stringify(JSON.parse(merged.base_raw)) === JSON.stringify(JSON.parse(split.base_raw)), '双臂 pristine link_index 深等（基线零漂移）')
ck(JSON.stringify(JSON.parse(merged.cf_raw)) === JSON.stringify(JSON.parse(split.cf_raw)), '双臂 扩容后 link_index 深等')

if (failures.length > 0) {
  console.error(`\n[probe-casefold] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-casefold] RESULT: merged + split 全案通过（解析四级序 ①..⑥ + pristine 基线 5 页 10 链接零漂移 + 造档落盘复核 + 双臂深等）`)
