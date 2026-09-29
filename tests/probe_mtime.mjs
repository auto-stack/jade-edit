#!/usr/bin/env node
// probe_mtime.mjs — PLAN-024 T-01 p1/p2 fs.mtime 契约语义面双臂直证。
//
//   p1 可调性   back 模块 fs.mtime(path) 直调（fs.tree 同族调用形——
//              wsys.at:51/:391 在册先例；上游 stdlib.rs rust_fn 宏自注册
//              + native_catalog 2997 双表在册）→ 解析层拒绝 = no-go 首条件
//              （D-24① File.copy 同判面实录）。
//   p2 语义     epoch 秒粒度（stdlib `as_secs()` 一手源）/ 失败与 1970 前
//              = -1 / 写后跨秒翻转可见 / 同秒写读边缘（秒粒度下读→写→
//              再读 mtime 未翻的陈旧窗——PLAN-024 §5.2 失效通道设计依据面）。
//              CJK 路径走 POST body 形（D-19：GET query 不解码——merged
//              进程内无此面，split 臂 POST 通道）。
//
//   merged 臂   探针工程（e2e/.runtime/probe-mtime/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针桥接 fn 追加[生成件
//              非入库源] + 探针 widget Init 单调用 probe_cases 闭包包），
//              `auto run -r vm` 进程内 CALL——autoui_state dump 读回。
//   split 臂    同探针工程目录 spawn `auto run --server vm -B <port>`
//              （serve-back 同配方，cwd = 探针工程——桥接路由随工程
//              api.at 副本在册），POST /api/probe_cases。
//
// 案表（期望值 = stdlib.rs 一手源 + PLAN-024 §5.1 预期带）：
//   a  存在档 mtime > 1700000000（epoch 秒——2023 后语料生成带内）
//   c  缺失档 mtime == -1（失败/1970 前同判——一手源 unwrap_or(-1)）
//   f  CJK rel POST 通道 mtime > 0（merged 直调 + split POST body 双臂）
//   d  写后跨秒翻转：m_before --busy-wait 1.3s--> write --> m_vis > m_before
//      （秒粒度截断下跨秒界即翻——粒度可见性直证）
//   e  同秒边缘：s0 --> write --> s1 == s0（同秒写读 mtime 未翻——陈旧窗
//      直证；边界跨越自动重试 30 轮——快环逐轮重读 s0，秒界即弃轮重试；
//      亚秒粒度假说下每轮 s1 != s0 → 判 FAIL = 一手源 as_secs 与行为不符
//      ——设计后果注记随实录）
// 双臂语义对读：a/c/f 逐字段全等（只读面）+ d/e 判定面一致（写动态面——
// m_before/m_vis 数值随臂序漂移不比对）。
//
// 用法（仓根）：node tests/probe_mtime.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-mtime')
const MERGED_WS = path.join(RUNTIME, 'probe-mtime-workspace')
const MERGED_PORT = 9401
const SPLIT_PORT = await pickPort({ env: 'JADE_PROBE_PORT_MTIME' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 探针桥接（探针工程 src/back 副本追加段——生成件，非入库源）。
const WSYS_BRIDGE = `
// ===== probe_mtime bridge（tests/probe_mtime.mjs 生成件——探针工程一次性，非入库源）
// PLAN-024 T-01 p1/p2：fs.mtime 直调可调性 + epoch 秒语义面。
pub fn mtime_probe(rel str) int {
    return fs.mtime(resolve(rel))
}

/// 六段闭包包：a 存在档 / c 缺失档 / f CJK 档 / d 写后跨秒翻转（busy-wait
/// 1.3s 过秒界——Date 宿主桥同模块在役形）/ e 同秒写读边缘（逐轮重读 s0
/// 快环——秒界自动弃轮，30 轮内必命中同秒轮）。返回 "|" 六段 pack。
pub fn probe_mtime_cases(rel_exist str, rel_missing str, rel_cjk str, rel_dyn str) str {
    var m_exist int = fs.mtime(resolve(rel_exist))
    var m_miss int = fs.mtime(resolve(rel_missing))
    var m_cjk int = fs.mtime(resolve(rel_cjk))
    var m_before int = fs.mtime(resolve(rel_dyn))
    var now0 int = Date.now()
    var guard int = 0
    while Date.now() < now0 + 1300 {
        guard = guard + 1
    }
    File.write_text(resolve(rel_dyn), "probe dyn v2\\n")
    var m_vis int = fs.mtime(resolve(rel_dyn))
    var e_flag str = "same-sec-no"
    var tries int = 0
    while tries < 30 {
        if e_flag == "same-sec-no" {
            var s0 int = fs.mtime(resolve(rel_dyn))
            File.write_text(resolve(rel_dyn), "probe same-sec\\n")
            var s1 int = fs.mtime(resolve(rel_dyn))
            if s1 == s0 {
                e_flag = "same-sec-yes"
            }
        }
        tries = tries + 1
    }
    var pack str = m_exist.str() + "|" + m_miss.str() + "|" + m_cjk.str() + "|"
    pack = pack + m_before.str() + "|" + m_vis.str() + "|" + e_flag
    return pack
}
`

const API_BRIDGE = `
// ===== probe_mtime bridge（tests/probe_mtime.mjs 生成件——探针工程一次性，非入库源）
#[api(method = "GET", path = "/api/probe_mtime_get")]
pub fn probe_mtime_get(rel str) str {
    return wsys.mtime_probe(rel).str()
}

#[api(method = "POST", path = "/api/probe_cases")]
pub fn probe_cases(rel_exist str, rel_missing str, rel_cjk str, rel_dyn str) str {
    return wsys.probe_mtime_cases(rel_exist, rel_missing, rel_cjk, rel_dyn)
}
`

// 探针 widget（Init 单调用——逻辑全在 back 桥接闭包包，widget 零逻辑）。
const PROBE_AT = `// 探针 widget（tests/probe_mtime.mjs 生成件——非入库源）。
use back.api: probe_cases

widget App {
    msg { Init }
    model {
        var done bool = false
        var pack str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: mtime" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            pack = probe_cases("wiki/index.ad", "zz-no-such-probe.ad", "wiki/CAP 定理.ad", "probe-dyn.ad")
            done = true
        }
    }
}
`

function materializeWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
  // 动态写档（d/e 案载体——初值 v1 由 Node 落，mtime 早于探针秒 ≥1s）
  fs.writeFileSync(path.join(ws, 'probe-dyn.ad'), 'probe dyn v1\n', 'utf8')
}

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.appendFileSync(path.join(PROBE_DIR, 'src', 'back', 'wsys.at'), WSYS_BRIDGE, 'utf8')
  fs.appendFileSync(path.join(PROBE_DIR, 'src', 'back', 'api.at'), API_BRIDGE, 'utf8')
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "jade-probe-mtime"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeMtime"
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-mtime', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    const pollDeadline = Date.now() + 60000
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
    return { pack: field('pack') }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

async function runSplitArm() {
  materializeWorkspace(MERGED_WS) // 同工作区顺序复用（d/e 写动态面按臂独立判定）
  buildProbeProject()
  const app = spawn(AUTO_EXE, ['run', '--server', 'vm', '-B', String(SPLIT_PORT)], {
    cwd: PROBE_DIR,
    env: { ...process.env, JADE_WORKSPACE: MERGED_WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const url = `http://127.0.0.1:${SPLIT_PORT}`
    const deadline = Date.now() + 30000
    let ready = false
    for (;;) {
      if (app.exitCode !== null) throw new Error(`server exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
      try {
        const res = await fetch(`${url}/api/probe_mtime_get?rel=wiki/index.ad`)
        if (res.ok) { ready = true; break }
      } catch {}
      if (Date.now() > deadline) throw new Error(`probe server not reachable on ${url} in 30s:\n${appOut.slice(-1500)}`)
      await sleep(400)
    }
    if (!ready) throw new Error('probe server unreachable')
    const res = await fetch(`${url}/api/probe_cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rel_exist: 'wiki/index.ad',
        rel_missing: 'zz-no-such-probe.ad',
        rel_cjk: 'wiki/CAP 定理.ad',
        rel_dyn: 'probe-dyn.ad',
      }),
    })
    if (!res.ok) throw new Error(`POST probe_cases -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const text = await res.text()
    // str 返回值 HTTP body = JSON 引号包裹形态（probe_delete 剥壳同款）
    try {
      const val = JSON.parse(text)
      if (typeof val === 'string') return { pack: val }
    } catch {}
    return { pack: text }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- 断言 ----------------

function parsePack(pack) {
  const parts = pack.split('|')
  if (parts.length !== 6) throw new Error(`pack 形状异常（${parts.length} 段）: ${pack}`)
  return {
    m_exist: Number(parts[0]),
    m_miss: Number(parts[1]),
    m_cjk: Number(parts[2]),
    m_before: Number(parts[3]),
    m_vis: Number(parts[4]),
    e_flag: parts[5],
  }
}

function caseAsserts(pack, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const p = parsePack(pack)
  ck(p.m_exist > 1700000000, `a p1 可调性+epoch 秒：存在档 mtime=${p.m_exist} > 1700000000`)
  ck(p.m_miss === -1, `c 缺失档 mtime=${p.m_miss} == -1`)
  ck(p.m_cjk > 1700000000, `f CJK rel mtime=${p.m_cjk} > 0（${tag === 'split' ? 'POST body 通道' : '进程内直调'}）`)
  ck(p.m_vis > p.m_before, `d 写后跨秒翻转：m_vis=${p.m_vis} > m_before=${p.m_before}`)
  ck(p.e_flag === 'same-sec-yes', `e 同秒写读边缘：${p.e_flag}（秒粒度陈旧窗直证——失效通道设计依据）`)
  return p
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-mtime] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
console.log(`  [merged] pack = ${merged.pack}`)
const pm = caseAsserts(merged.pack, 'merged', failures)

console.log(`[probe-mtime] arm 2: split serve 形（:${SPLIT_PORT}，探针工程 api 桥接路由 POST 通道）`)
const split = await runSplitArm()
console.log(`  [split] pack = ${split.pack}`)
const ps = caseAsserts(split.pack, 'split', failures)

console.log('\n[probe-mtime] 双臂语义对读（a/c/f 只读面全等 + d/e 判定面一致）：')
const cmp = (label, ok) => {
  console.log(`  [${label}] ${ok ? 'PASS' : 'FAIL'}`)
  if (!ok) failures.push(`arm-consistency ${label}`)
}
cmp(`a m_exist 全等（${pm.m_exist} vs ${ps.m_exist}）`, pm.m_exist === ps.m_exist)
cmp(`c m_miss 全等（${pm.m_miss} vs ${ps.m_miss}）`, pm.m_miss === ps.m_miss)
cmp(`f m_cjk 全等（${pm.m_cjk} vs ${ps.m_cjk}）`, pm.m_cjk === ps.m_cjk)
cmp(`e 判定面一致（${pm.e_flag} vs ${ps.e_flag}）`, pm.e_flag === ps.e_flag)

if (failures.length > 0) {
  console.error(`\n[probe-mtime] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-mtime] RESULT: merged + split 全案通过（五案：p1 可调性 epoch 秒 >0/缺失 -1/CJK POST 通道/写后跨秒翻转/同秒写读边缘 yes + 双臂一致）`)
