#!/usr/bin/env node
// probe_recent.mjs — PLAN-021 T-01 recent_paths_get/set 契约五案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-merged/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调
//              recent_paths_get/set 并落 model 字段），`auto run -r vm`
//              进程内 CALL——autoui_state 全量 dump 读回返回值；直证后随
//              .runtime 再生语义存在（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              GET /api/recent_paths_get + POST /api/recent_paths_set
//              （JSON body——write_wiki 同款 POST 通道，D-19 面：路径行
//              CJK 常态走 body 不走 query）。
//
// 案表（§6 五案展开；期望值 = SD-2101 持久层定文）：
//   ① get 缺档容错   首跑（零 .jade 目录）→ ""（只读不建——目录零创建）
//   ② set/get 往返   set 3 行清单 → true；get 逐字节同值；磁盘逐字节
//   ③ CJK 路径行     set CJK 两行（POST body——D-19 免疫）→ get 同值
//   ④ 空串清空       set "" → true；文件存在空内容；get → ""（清空语义
//                    ——写空文件不删文件）
//   ⑤ 复核+免索引证  set 后 .jade/recents.txt exists；tree/link_index
//                    两面 .jade 零感知（dot 前缀 walk 忽略——D-33①）
//
// 双臂一致 = 两臂返回值逐案相等（G2）。D-21 负载窗 flake：无-RESULT 早崩
// 按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_recent.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-merged')
const MERGED_WS = path.join(RUNTIME, 'probe-workspace')
const MERGED_PORT = 9399
const SPLIT_PORT = await pickPort()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 案表（双臂共享）----
const THREE_LINES = 'wiki/A.ad\nwiki/B.ad\nwiki/C.ad'
const CJK_LINES = 'wiki/首页.ad\nwiki/CAP 定理.ad'
const FINAL_LINES = 'wiki/A.ad\nwiki/首页.ad'

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

function diskAsserts(ws, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const recentsPath = path.join(ws, '.jade', 'recents.txt')
  ck(fs.existsSync(recentsPath), '⑤ 复核：.jade/recents.txt exists（set 后在盘）')
  if (fs.existsSync(recentsPath)) {
    const bytes = fs.readFileSync(recentsPath, 'utf8')
    ck(bytes === FINAL_LINES, '② 通道：磁盘逐字节 = 最终 set 参数（原样直写无再加工）')
  }
  // ① 只读不建：探针流程只写过一次目录——目录存在性由 set 兑现，缺档
  //    面（首跑）在 get 返回值侧直证，这里补目录面终态（.jade 恰一文件）。
  const jadeFiles = fs.existsSync(path.join(ws, '.jade'))
    ? fs.readdirSync(path.join(ws, '.jade'))
    : []
  ck(jadeFiles.length === 1 && jadeFiles[0] === 'recents.txt', '持久层域圈定：.jade 内恰 recents.txt 一件')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_recent.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 recent_paths_get/set，返回值落 model 字段
// 供 autoui_state dump 读回。入口文件名固定 app.at（auto 前端入口约定）。
use back.api: recent_paths_get, recent_paths_set, tree, link_index

widget App {
    msg { Init }
    model {
        var done bool = false
        var g1_missing str = ""
        var s2_set bool = false
        var g2_round str = ""
        var s3_set bool = false
        var g3_cjk str = ""
        var s4_set bool = false
        var g4_empty str = ""
        var s5_set bool = false
        var g5_back str = ""
        // 免索引证面（小 bool 字段——tree/link_index 大 JSON 不入模型，
        // 规避 autoui_state dump 截断）
        var jade_in_tree bool = false
        var jade_in_idx bool = false
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: recent_paths" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            g1_missing = recent_paths_get()
            s2_set = recent_paths_set("wiki/A.ad\\nwiki/B.ad\\nwiki/C.ad")
            g2_round = recent_paths_get()
            s3_set = recent_paths_set("wiki/首页.ad\\nwiki/CAP 定理.ad")
            g3_cjk = recent_paths_get()
            s4_set = recent_paths_set("")
            g4_empty = recent_paths_get()
            s5_set = recent_paths_set("wiki/A.ad\\nwiki/首页.ad")
            g5_back = recent_paths_get()
            // 局部变量承接大 face——仅 contains 判定入模型（D-20③ 分裂面
            // 规避：局部 str 直调 contains 在册形态）。
            var tr str = tree("", 8)
            jade_in_tree = tr.contains(".jade")
            var idx str = link_index("", 8)
            jade_in_idx = idx.contains(".jade")
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
    `name: "jade-probe-recent"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeRecent"
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-recent', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    const pollDeadline = Date.now() + 20000
    let dump = ''
    for (;;) {
      dump = (await callTool('autoui_state', {})).trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}`)
      await sleep(300)
    }
    // dump 值转义形态还原（\n 转义 → 真换行；\\" → "——autoui_state
    // 对字符串值的展示转义，与磁盘/HTTP 真值比对前必须反转义）。
    const field = (name) =>
      dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]
        ?.replace(/\\n/g, '\n')
        ?.replace(/\\"/g, '"')
        ?.replace(/\\\\/g, '\\') ?? null
    // bool 契约回值入 vm 模型后 dump 形态 = int 1/0（D-35③ GET 裸 1/0
    // 家族——执行期实勘：POST bool 直调回值同域），true/1 双形态同判。
    const boolField = (name) => dump.match(new RegExp(`${name}:\\s*(true|false|1|0)`))?.[1] ?? null
    const returns = {}
    returns['1-get-missing'] = field('g1_missing')
    returns['2-set-roundtrip'] = boolField('s2_set')
    returns['2b-get-round'] = field('g2_round')
    returns['3-set-cjk'] = boolField('s3_set')
    returns['3b-get-cjk'] = field('g3_cjk')
    returns['4-set-empty'] = boolField('s4_set')
    returns['4b-get-empty'] = field('g4_empty')
    returns['5-set-final'] = boolField('s5_set')
    returns['5b-get-back'] = field('g5_back')
    for (const [k, v] of Object.entries(returns)) {
      if (v === null) throw new Error(`probe state missing field for ${k}:\n${dump.slice(0, 1200)}`)
    }
    // ⑤ 免索引证：tree/link_index 两 face 的 contains 判定 bool（期望 false）
    returns['6-tree-no-jade'] = boolField('jade_in_tree') === 'false' && boolField('jade_in_idx') === 'false' ? 'absent' : 'PRESENT'
    return { returns, diskCheck: (failures) => diskAsserts(MERGED_WS, 'merged', failures) }
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
    const ws = back.workspace
    const returns = {}
    // ① get 缺档容错
    returns['1-get-missing'] = JSON.parse(await (await fetch(`${back.url}/api/recent_paths_get`)).text())
    // ② set/get 往返（POST body 三行清单）
    const post = async (body) => {
      const res = await fetch(`${back.url}/api/recent_paths_set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: body }),
      })
      if (!res.ok) throw new Error(`POST recent_paths_set -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      return String(JSON.parse(await res.text()))
    }
    returns['2-set-roundtrip'] = await post(THREE_LINES)
    returns['2b-get-round'] = JSON.parse(await (await fetch(`${back.url}/api/recent_paths_get`)).text())
    // ③ CJK 路径行（POST body——D-19 免疫）
    returns['3-set-cjk'] = await post(CJK_LINES)
    returns['3b-get-cjk'] = JSON.parse(await (await fetch(`${back.url}/api/recent_paths_get`)).text())
    // ④ 空串清空
    returns['4-set-empty'] = await post('')
    returns['4b-get-empty'] = JSON.parse(await (await fetch(`${back.url}/api/recent_paths_get`)).text())
    // ⑤ 复核 + 免索引证（tree/link_index 两面）
    returns['5-set-final'] = await post(FINAL_LINES)
    returns['5b-get-back'] = JSON.parse(await (await fetch(`${back.url}/api/recent_paths_get`)).text())
    const treeBody = await (await fetch(`${back.url}/api/tree?path=&depth=8`)).text()
    const idxBody = await (await fetch(`${back.url}/api/link_index?path=&depth=8`)).text()
    returns['6-tree-no-jade'] = (treeBody.includes('.jade') || idxBody.includes('.jade')) ? 'PRESENT' : 'absent'
    return { returns, diskCheck: (failures) => diskAsserts(ws, 'split', failures) }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const EXPECT = {
  '1-get-missing': '',
  '2-set-roundtrip': '1',
  '2b-get-round': THREE_LINES,
  '3-set-cjk': '1',
  '3b-get-cjk': CJK_LINES,
  '4-set-empty': '1',
  '4b-get-empty': '',
  '5-set-final': '1',
  '5b-get-back': FINAL_LINES,
  '6-tree-no-jade': 'absent',
}

const failures = []
console.log(`[probe-recent] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-recent] arm 2: split serve-back GET/POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-recent] 双臂返回值逐案对读：')
let agree = true
for (const id of Object.keys(EXPECT)) {
  const m = merged.returns[id]
  const s = split.returns[id]
  const ok = m === s && m === EXPECT[id]
  if (m !== s) agree = false
  console.log(`  [${id}] ${ok ? 'PASS' : 'FAIL'} — merged=${JSON.stringify(m)} split=${JSON.stringify(s)} expect=${JSON.stringify(EXPECT[id])}`)
  if (!ok) failures.push(`case ${id}: merged=${JSON.stringify(m)} split=${JSON.stringify(s)} expect=${JSON.stringify(EXPECT[id])}`)
}

if (failures.length > 0) {
  console.error(`\n[probe-recent] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-recent] RESULT: merged + split 全案通过（缺档容错/往返/CJK body/空串清空/复核+免索引证）+ 双臂一致=${agree}`)
