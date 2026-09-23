#!/usr/bin/env node
// probe_delete.mjs — PLAN-007 T-01 delete_page 契约四案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-delete/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调
//              delete_page 九案（§6 四案展开 + 重建闭环附带案），返回值落
//              model 字段），`auto run -r vm` 进程内 CALL——autoui_state
//              全量 dump 读回；直证后随 .runtime 再生语义存在（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              POST /api/delete_page 九案（JSON body——D-19 面：path CJK
//              走 body 不走 query）+ /api/create_page 重建案。
//
// 案表（§6 四案展开；期望值 = SD-701 三步定文）：
//   ① 删存在档            "wiki/Tasks.ad" → 返回 rel + 磁盘消失（Tasks
//                        零入链——删除后他档源文零改动的隔离素材）
//   ①b 同名重建再删       write_wiki 重建 → 再删 → 返回 rel（幂等闭环）
//   ② 删缺失拒            "不存在.ad" → ""
//   ③ 非 .ad 拒（两形）   "wiki"（既有目录）→ "" + "jade-garden-index.json"
//                        （既有非 .ad 文件）→ ""（卫语句先于 exists——
//                        既有路径同样拒，防目录误删）+ "wiki/CAP 定理"
//                        （裸名）→ ""
//   ④ CJK 路径删          "wiki/CAP 定理.ad" → rel（POST 双臂——D-19 面：
//                        CJK body 通道）
//   附 悬空接回 back 半   create_page("CAP 定理") → 根 "CAP 定理.ad"
//                        （悬空可再建页——PLAN-005 弧线反向闭合）+ 再删
//                        → rel（根档同样可删）
// 负证（磁盘复核）：**悬空化不改写源文**——index.ad（含 [[CAP 定理]] 出
// 链）/Hello World.ad/Projects.ad 删除后逐字节原样；jade-garden-index.json
// （非 .ad）原样；删除目标三档终态不存在。
//
// 双臂一致 = 两臂返回值逐案相等。D-21 负载窗 flake：无-RESULT 早崩按
// README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_delete.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-delete')
const MERGED_WS = path.join(RUNTIME, 'probe-delete-workspace')
const MERGED_PORT = 9397
const SPLIT_PORT = 8252

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 九案（双臂共享；expect = 删除面返回 rel / ""）----
const CASES = [
  { id: '1-ascii', expect: 'wiki/Tasks.ad' },
  { id: '2-recreate-loop', expect: 'wiki/Tasks.ad' },
  { id: '3-missing', expect: '' },
  { id: '4-dir', expect: '' },
  { id: '5-nonad-file', expect: '' },
  { id: '6-bare', expect: '' },
  { id: '7-cjk', expect: 'wiki/CAP 定理.ad' },
  { id: '8-rebuild', expect: 'CAP 定理.ad' },
  { id: '9-rebuild-del', expect: 'CAP 定理.ad' },
]
const RET_FIELD = {
  '1-ascii': 'c1', '2-recreate-loop': 'c2', '3-missing': 'c3', '4-dir': 'c4',
  '5-nonad-file': 'c5', '6-bare': 'c6', '7-cjk': 'c7', '8-rebuild': 's1',
  '9-rebuild-del': 'c8',
}

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
  // ① 删除目标终态：Tasks.ad（删两次）/wiki/CAP 定理.ad（⑦）/根 CAP 定理.ad（⑨ 重建再删）均不存在
  ck(read('wiki/Tasks.ad') === null, '① wiki/Tasks.ad 终态不存在（删两次幂等闭环）')
  ck(read('wiki/CAP 定理.ad') === null, '④ wiki/CAP 定理.ad 删除（CJK）')
  ck(read('CAP 定理.ad') === null, '附 根 CAP 定理.ad 重建后再删（悬空接回闭环）')
  // 负证：悬空化不改写源文——含 [[CAP 定理]] / [[Tasks]] 关联面逐字节原样
  ck(read('wiki/index.ad') === orig.index, '负证 index.ad 逐字节原样（[[CAP 定理]] 出链不清理——悬空化）')
  ck(read('wiki/Hello World.ad') === orig.helloWorld, '负证 Hello World.ad 逐字节原样（[[CAP 定理]] 出链不清理）')
  ck(read('wiki/Projects.ad') === orig.projects, '负证 Projects.ad 逐字节原样')
  // ③ 非 .ad 既有路径拒：目录与非 .ad 文件均原样
  ck(fs.existsSync(path.join(ws, 'wiki')) && fs.statSync(path.join(ws, 'wiki')).isDirectory(), '③ wiki/ 目录仍在（非 .ad 拒）')
  ck(read('jade-garden-index.json') === orig.gardenJson, '③ jade-garden-index.json 逐字节原样（非 .ad 拒）')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_delete.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 delete_page 九案 + create_page 重建案，
// 返回值落 model 字段供 autoui_state dump 读回。入口文件名固定 app.at。
use back.api: delete_page, create_page, write_wiki

widget App {
    msg { Init }
    model {
        var done bool = false
        var c1 str = ""
        var w1 bool = false
        var c2 str = ""
        var c3 str = ""
        var c4 str = ""
        var c5 str = ""
        var c6 str = ""
        var c7 str = ""
        var s1 str = ""
        var c8 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: delete_page" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            c1 = delete_page("wiki/Tasks.ad")
            w1 = write_wiki("wiki/Tasks.ad", "recreated-by-probe\\n")
            c2 = delete_page("wiki/Tasks.ad")
            c3 = delete_page("不存在.ad")
            c4 = delete_page("wiki")
            c5 = delete_page("jade-garden-index.json")
            c6 = delete_page("wiki/CAP 定理")
            c7 = delete_page("wiki/CAP 定理.ad")
            s1 = create_page("CAP 定理")
            c8 = delete_page("CAP 定理.ad")
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
    `name: "jade-probe-delete"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeDelete"
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-delete', version: '0.1.0' } })
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
    // setup 自证（w1 重建面——失败先抛，案值失真前置排除）
    const field = (name, re) => dump.match(new RegExp(`${name}:\\s*${re}`))?.[1] ?? null
    const strField = (name) => field(name, '"((?:[^"\\\\]|\\\\.)*)"')
    const boolField = (name) => field(name, '(true|1|false|0)')
    const w1Raw = boolField('w1')
    if (w1Raw === null || w1Raw === '0' || w1Raw === 'false') throw new Error(`probe setup failed (w1=${w1Raw}——重建面未落盘)`)
    const returns = {}
    for (const c of CASES) {
      returns[c.id] = strField(RET_FIELD[c.id])
      if (returns[c.id] === null) throw new Error(`probe state missing ${RET_FIELD[c.id]}:\n${dump.slice(0, 800)}`)
    }
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
    const orig = captureOriginals(back.workspace)
    const returns = {}
    returns['1-ascii'] = await post('delete_page', { path: 'wiki/Tasks.ad' })
    await post('write_wiki', { path: 'wiki/Tasks.ad', body: 'recreated-by-probe\n' })
    returns['2-recreate-loop'] = await post('delete_page', { path: 'wiki/Tasks.ad' })
    returns['3-missing'] = await post('delete_page', { path: '不存在.ad' })
    returns['4-dir'] = await post('delete_page', { path: 'wiki' })
    returns['5-nonad-file'] = await post('delete_page', { path: 'jade-garden-index.json' })
    returns['6-bare'] = await post('delete_page', { path: 'wiki/CAP 定理' })
    returns['7-cjk'] = await post('delete_page', { path: 'wiki/CAP 定理.ad' })
    returns['8-rebuild'] = await post('create_page', { title: 'CAP 定理' })
    returns['9-rebuild-del'] = await post('delete_page', { path: 'CAP 定理.ad' })
    return { returns, diskCheck: (failures) => diskAsserts(back.workspace, orig, 'split', failures) }
  } finally {
    await back.stop()
  }
}

// ---- 语料原字节捕获（删除前——期望值来源） ----
function captureOriginals(ws) {
  const read = (rel) => fs.readFileSync(path.join(ws, rel), 'utf8')
  return {
    index: read('wiki/index.ad'),
    helloWorld: read('wiki/Hello World.ad'),
    projects: read('wiki/Projects.ad'),
    gardenJson: read('jade-garden-index.json'),
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-delete] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-delete] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-delete] 双臂返回值逐案对读：')
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
  console.error(`\n[probe-delete] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-delete] RESULT: merged + split 全案通过（九案：删存在/幂等闭环/缺失拒/非 .ad 两形拒/CJK 删/重建接回+再删 + 悬空化不改写源文逐字节负证 + 副作用圈定）+ 双臂一致=${agree}`)
