#!/usr/bin/env node
// probe_dir_move.mjs — PLAN-012 T-01 create_dir/move_page 八案 + 检索 alias
// 三案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-dir-move/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调
//              setup（create_page/write_wiki/set_page_meta）+ create_dir/
//              move_page 十案 + search_wiki 三案，返回值落 model 字段），
//              `auto run -r vm` 进程内 CALL——autoui_state 全量 dump 读回；
//              直证后随 .runtime 再生存续（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              POST /api/*（JSON body——D-19 面：目录名/档名 CJK 常态走
//              body 不走 query）。
//
// 案表（§6 十一案展开；期望值 = SD-1201 五步流程 + 清洗规则 + SD-401 口径）：
//   ① 新建目录     "archives" → "archives"（根新目录 + is_dir 复核）
//   ② 清洗         "a/b:c*d" → "a-b-c-d"（九字符→'-'）
//   ③ 同名幂等     "archives" 再调 → "archives" 零变化
//   ②b 空名守卫    "   " → ""（清洗空名，零落盘）
//   ④ 移动基础     MoveMe.ad + FM Page.ad（带 frontmatter）→ archives/：
//                  旧无新有 + 字节整迁逐字节（FM 档 = fm 增建定形 + body
//                  原样——frontmatter/body 完整断言）
//   ⑤ 同路径幂等   archives/MoveMe.ad → dir "archives" → 返回原 path 零变化
//   ⑥ 缺失目录拒   dir "no-such-dir" → ""（is_dir 卫——探针 B 定谳件）
//   ⑦ 冲突拒       根/archives 各预置 Conflict.ad（异字节）→ "" + 双档原样
//   ⑧ CJK 双臂     create_dir("收件箱") + create_page("中文档") → move →
//                  "收件箱/中文档.ad"（CJK 目录名/档名 POST 双臂）
//   ⑨ alias 命中   wiki/CAP 定理.ad set aliases "帽子定理" → search "帽子
//                  定理" → 命中该档 title="CAP 定理"（stem 口径）snippet=""
//   ⑩ 基线回归     search "jade garden" → 恰 [index.ad]（walk 序/序/
//                  snippet 行口径零漂移——SD-401 语料基线）
//   ⑪ alias+body   烟雾警报.ad（alias "烟感" + body 含 "烟感" 行）→ search
//                  "烟感" → 命中 snippet="烟感 测试行。"（非空——双命中面）
//
// 双臂一致 = 两臂返回值逐案相等 + 检索 JSON 逐字节相等。D-21 负载窗
// flake：无-RESULT 早崩按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_dir_move.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-dir-move')
const MERGED_WS = path.join(RUNTIME, 'probe-dir-move-workspace')
const MERGED_PORT = 9361
// 8251-8950 现为 Windows WinNAT 排除区段（netsh 实勘——PLAN-008 复审
// findings 留档件）；8223 = probe_rename 在册口——本案用 8227。
const SPLIT_PORT = 8227

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 案表（双臂共享；expect = 新 rel/目录名 / ""）----
const CASES = [
  { id: '1-new-dir', expect: 'archives' },
  { id: '2-clean', expect: 'a-b-c-d' },
  { id: '3-idem-dir', expect: 'archives' },
  { id: '2b-empty-name', expect: '' },
  { id: '4-move-basic', expect: 'archives/MoveMe.ad' },
  { id: '4b-move-fm', expect: 'archives/FM Page.ad' },
  { id: '5-same-path', expect: 'archives/MoveMe.ad' },
  { id: '6-missing-dir', expect: '' },
  { id: '7-conflict', expect: '' },
  { id: '8-cjk', expect: '收件箱/中文档.ad' },
]
const RET_FIELD = {
  '1-new-dir': 'd1', '2-clean': 'd2', '3-idem-dir': 'd3', '2b-empty-name': 'd4',
  '4-move-basic': 'd5', '4b-move-fm': 'd6', '5-same-path': 'd7',
  '6-missing-dir': 'd8', '7-conflict': 'd9', '8-cjk': 'd10',
}
// 检索三案（字段名 + 命中断言见下方 SEARCH_CHECKS）
const SEARCH_CASES = [
  { id: '9-alias-hit', field: 'f1' },
  { id: '10-baseline', field: 'f2' },
  { id: '11-alias-body', field: 'f3' },
]
// 语料基线（⑩ 期望值——SD-401 口径：stem/body 命中、walk 序、snippet =
// 首条命中行 trim；title = stem 非 fm title）。Hello World.ad 代码块内
// `println!("Hello, Jade Garden!");` 亦含查询词——walk 序（casefold：
// "hello world.ad" < "index.ad"）两命中行。
const BASELINE_JSON = JSON.stringify([
  { path: 'wiki/Hello World.ad', title: 'Hello World', snippet: 'println!("Hello, Jade Garden!");' },
  { path: 'wiki/index.ad', title: 'index', snippet: '欢迎来到 Jade Garden 测试知识库。' },
])
// FM 档整迁期望值（set_page_meta 增建定形 + write_wiki body 原文——逐字节）
const FM_EXPECT = '---\ntags:\n- alpha\n- beta\naliases:\n- 别名甲\n---\n# FM Page\n\n正文带 [[CAP 定理]] 链。\n'

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
  const read = (rel) => {
    try { return fs.readFileSync(path.join(ws, rel), 'utf8') } catch { return null }
  }
  const isDir = (rel) => {
    try { return fs.statSync(path.join(ws, rel)).isDirectory() } catch { return false }
  }
  // ①②⑧ 目录在盘（含 CJK）
  ck(isDir('archives'), '① archives/ 目录在盘')
  ck(isDir('a-b-c-d'), '② a-b-c-d/ 清洗名目录在盘')
  ck(isDir('收件箱'), '⑧ 收件箱/ CJK 目录在盘')
  // ④ 移动基础：旧无新有 + 字节整迁
  ck(read('MoveMe.ad') === null, '④ 根 MoveMe.ad 已消失')
  ck(read('archives/MoveMe.ad') === '# MoveMe\n\n', '④ archives/MoveMe.ad = create_page 模板逐字节')
  ck(read('FM Page.ad') === null, '④ 根 FM Page.ad 已消失')
  ck(read('archives/FM Page.ad') === FM_EXPECT, '④ archives/FM Page.ad frontmatter/body 完整逐字节')
  // ⑤ 同路径幂等零变化
  ck(read('archives/MoveMe.ad') === '# MoveMe\n\n', '⑤ 幂等后 MoveMe.ad 字节不变')
  // ⑥ 缺失目录拒零落盘
  ck(read('no-such-dir') === null && !isDir('no-such-dir'), '⑥ 无 no-such-dir 落盘')
  // ⑦ 冲突拒：双档均原样
  ck(read('Conflict.ad') === '# Conflict\n\n', '⑦ 根 Conflict.ad 原样')
  ck(read('archives/Conflict.ad') === 'ARCHIVE-CONFLICT-BYTES\n', '⑦ archives/Conflict.ad 原样')
  // ⑧ CJK 移动
  ck(read('中文档.ad') === null, '⑧ 根 中文档.ad 已消失')
  ck(read('收件箱/中文档.ad') === '# 中文档\n\n', '⑧ 收件箱/中文档.ad = 模板逐字节')
  // ⑨⑪ alias 写面
  ck(read('wiki/CAP 定理.ad')?.includes('- 帽子定理') ?? false, '⑨ wiki/CAP 定理.ad aliases 含 帽子定理')
  ck(read('烟雾警报.ad')?.includes('- 烟感') ?? false, '⑪ 烟雾警报.ad aliases 含 烟感')
  // 副作用圈定：根 .ad 集合恰为两新建档；语料 json 不动
  const rootAds = fs.readdirSync(ws).filter((f) => f.endsWith('.ad')).sort()
  ck(rootAds.join(',') === 'Conflict.ad,烟雾警报.ad', `根 .ad 集合恰为 Conflict.ad+烟雾警报.ad（实际：${rootAds.join(', ')}）`)
  ck(read('jade-garden-index.json') !== null, '语料 jade-garden-index.json 在盘（非 .ad 零涉）')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_dir_move.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 setup + create_dir/move_page 十案 +
// search_wiki 三案，返回值落 model 字段供 autoui_state dump 读回。
// 入口文件名固定 app.at（auto 前端入口约定）。
use back.api: create_dir, move_page, create_page, write_wiki, set_page_meta, search_wiki

widget App {
    msg { Init }
    model {
        var done bool = false
        var d1 str = ""
        var d2 str = ""
        var d3 str = ""
        var d4 str = ""
        var d5 str = ""
        var d6 str = ""
        var d7 str = ""
        var d8 str = ""
        var d9 str = ""
        var d10 str = ""
        var s1 str = ""
        var s2 str = ""
        var s3 str = ""
        var w1 bool = false
        var w2 bool = false
        var m1 str = ""
        var m2 str = ""
        var w3 bool = false
        var m3 str = ""
        var f1 str = ""
        var f2 str = ""
        var f3 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: dir_move + search alias" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            d1 = create_dir("archives")
            d2 = create_dir("a/b:c*d")
            d3 = create_dir("archives")
            d4 = create_dir("   ")
            s1 = create_page("MoveMe")
            w1 = write_wiki("FM Page.ad", "# FM Page\\n\\n正文带 [[CAP 定理]] 链。\\n")
            m1 = set_page_meta("FM Page.ad", "", "alpha,beta", "别名甲")
            w2 = write_wiki("archives/Conflict.ad", "ARCHIVE-CONFLICT-BYTES\\n")
            s2 = create_page("Conflict")
            d5 = move_page("MoveMe.ad", "archives")
            d6 = move_page("FM Page.ad", "archives")
            d7 = move_page("archives/MoveMe.ad", "archives")
            d8 = move_page("archives/MoveMe.ad", "no-such-dir")
            d9 = move_page("Conflict.ad", "archives")
            d10 = create_dir("收件箱")
            s3 = create_page("中文档")
            d10 = move_page("中文档.ad", "收件箱")
            m2 = set_page_meta("wiki/CAP 定理.ad", "", "", "帽子定理")
            s3 = create_page("烟雾警报")
            w3 = write_wiki("烟雾警报.ad", "# 烟雾警报\\n\\n烟感 测试行。\\n")
            m3 = set_page_meta("烟雾警报.ad", "", "", "烟感")
            f1 = search_wiki("帽子定理", 20)
            f2 = search_wiki("jade garden", 20)
            f3 = search_wiki("烟感", 20)
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
    `name: "jade-probe-dir-move"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeDirMove"
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

// dump 字符串字段捕获（\" 转义面）+ 反转义回实际串
const strField = (dump, name) => {
  const raw = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]
  if (raw === undefined) return null
  try { return JSON.parse(`"${raw}"`) } catch { return raw }
}
const boolField = (dump, name) => dump.match(new RegExp(`${name}:\\s*(true|1|false|0)`))?.[1]

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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-dir-move', version: '0.1.0' } })
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
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}\n---\n${appOut.slice(-800)}`)
      await sleep(300)
    }
    // setup 自证（失败先抛——案值失真前置排除）
    const truthy = (v) => v !== null && v !== '0' && v !== 'false'
    const setupOk = strField(dump, 's1') === 'MoveMe.ad' && truthy(boolField(dump, 'w1'))
      && strField(dump, 'm1') === 'ok' && truthy(boolField(dump, 'w2'))
      && strField(dump, 's2') === 'Conflict.ad' && strField(dump, 's3') === '烟雾警报.ad'
      && strField(dump, 'm2') === 'ok' && truthy(boolField(dump, 'w3')) && strField(dump, 'm3') === 'ok'
    if (!setupOk) throw new Error(`probe setup failed:\n${dump.slice(0, 1200)}`)
    const returns = {}
    for (const c of CASES) {
      returns[c.id] = strField(dump, RET_FIELD[c.id])
      if (returns[c.id] === null) throw new Error(`probe state missing ${RET_FIELD[c.id]}:\n${dump.slice(0, 800)}`)
    }
    const searches = {}
    for (const c of SEARCH_CASES) {
      searches[c.id] = strField(dump, c.field)
      if (searches[c.id] === null) throw new Error(`probe state missing ${c.field}`)
    }
    return { returns, searches, diskCheck: (failures) => diskAsserts(MERGED_WS, 'merged', failures) }
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
    const returns = {}
    const exec = async (id, api, payload) => { returns[id] = await post(api, payload) }
    await exec('1-new-dir', 'create_dir', { name: 'archives' })
    await exec('2-clean', 'create_dir', { name: 'a/b:c*d' })
    await exec('3-idem-dir', 'create_dir', { name: 'archives' })
    await exec('2b-empty-name', 'create_dir', { name: '   ' })
    if (await post('create_page', { title: 'MoveMe' }) !== 'MoveMe.ad') throw new Error('setup create MoveMe failed')
    if (!(await post('write_wiki', { path: 'FM Page.ad', body: '# FM Page\n\n正文带 [[CAP 定理]] 链。\n' }))) throw new Error('setup write FM Page failed')
    if ((await post('set_page_meta', { path: 'FM Page.ad', title: '', tags: 'alpha,beta', aliases: '别名甲' })) !== 'ok') throw new Error('setup set_page_meta FM failed')
    if (!(await post('write_wiki', { path: 'archives/Conflict.ad', body: 'ARCHIVE-CONFLICT-BYTES\n' }))) throw new Error('setup write archives/Conflict failed')
    if (await post('create_page', { title: 'Conflict' }) !== 'Conflict.ad') throw new Error('setup create Conflict failed')
    await exec('4-move-basic', 'move_page', { path: 'MoveMe.ad', dir: 'archives' })
    await exec('4b-move-fm', 'move_page', { path: 'FM Page.ad', dir: 'archives' })
    await exec('5-same-path', 'move_page', { path: 'archives/MoveMe.ad', dir: 'archives' })
    await exec('6-missing-dir', 'move_page', { path: 'archives/MoveMe.ad', dir: 'no-such-dir' })
    await exec('7-conflict', 'move_page', { path: 'Conflict.ad', dir: 'archives' })
    const searches = {}
    if (await post('create_dir', { name: '收件箱' }) !== '收件箱') throw new Error('setup create_dir 收件箱 failed')
    if (await post('create_page', { title: '中文档' }) !== '中文档.ad') throw new Error('setup create 中文档 failed')
    returns['8-cjk'] = await post('move_page', { path: '中文档.ad', dir: '收件箱' })
    if ((await post('set_page_meta', { path: 'wiki/CAP 定理.ad', title: '', tags: '', aliases: '帽子定理' })) !== 'ok') throw new Error('setup alias CAP failed')
    if (await post('create_page', { title: '烟雾警报' }) !== '烟雾警报.ad') throw new Error('setup create 烟雾警报 failed')
    if (!(await post('write_wiki', { path: '烟雾警报.ad', body: '# 烟雾警报\n\n烟感 测试行。\n' }))) throw new Error('setup write 烟雾警报 failed')
    if ((await post('set_page_meta', { path: '烟雾警报.ad', title: '', tags: '', aliases: '烟感' })) !== 'ok') throw new Error('setup alias 烟雾警报 failed')
    searches['9-alias-hit'] = await post('search_wiki', { query: '帽子定理', limit: 20 })
    searches['10-baseline'] = await post('search_wiki', { query: 'jade garden', limit: 20 })
    searches['11-alias-body'] = await post('search_wiki', { query: '烟感', limit: 20 })
    return { returns, searches, diskCheck: (failures) => diskAsserts(back.workspace, 'split', failures) }
  } finally {
    await back.stop()
  }
}

// ---------------- 检索断言（双臂共用）----------------

function searchChecks(tag, searches, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const hitsOf = (id) => {
    try { return JSON.parse(searches[id]) } catch { return null }
  }
  // ⑨ alias 命中：title=stem 口径 + snippet=""（alias-title-only）
  const h9 = hitsOf('9-alias-hit')
  const hit9 = Array.isArray(h9) ? h9.find((h) => h.path === 'wiki/CAP 定理.ad') : undefined
  ck(!!hit9, `⑨ 帽子定理命中 wiki/CAP 定理.ad（实际：${JSON.stringify(h9)?.slice(0, 200)}）`)
  ck(hit9?.title === 'CAP 定理' && hit9?.snippet === '', `⑨ title=stem + snippet=""（title=${hit9?.title} snippet="${hit9?.snippet}"）`)
  // ⑩ 语料基线回归：恰 [index.ad] 且 JSON 逐字节 = 期望值
  ck(searches['10-baseline'] === BASELINE_JSON, `⑩ 基线逐字节（实际：${searches['10-baseline']?.slice(0, 200)}）`)
  // ⑪ alias+body 双命中：snippet 非空 = 命中行
  const h11 = hitsOf('11-alias-body')
  const hit11 = Array.isArray(h11) ? h11.find((h) => h.path === '烟雾警报.ad') : undefined
  ck(!!hit11, `⑪ 烟感命中 烟雾警报.ad（实际：${JSON.stringify(h11)?.slice(0, 200)}）`)
  ck(hit11?.snippet === '烟感 测试行。', `⑪ snippet="烟感 测试行。"（实际 "${hit11?.snippet}"）`)
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-dir-move] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)
searchChecks('merged', merged.searches, failures)

console.log(`[probe-dir-move] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)
searchChecks('split', split.searches, failures)

console.log('\n[probe-dir-move] 双臂返回值逐案对读：')
let agree = true
for (const c of CASES) {
  const m = merged.returns[c.id]
  const s = split.returns[c.id]
  const ok = m === s && m === c.expect
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect="${c.expect}"`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}" expect="${c.expect}"`)
}
for (const c of SEARCH_CASES) {
  const m = merged.searches[c.id]
  const s = split.searches[c.id]
  const ok = m === s && m !== null
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — 检索 JSON 双臂逐字节一致=${m === s}`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}"`)
}

if (failures.length > 0) {
  console.error(`\n[probe-dir-move] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-dir-move] RESULT: merged + split 全案通过（目录面八案 + 检索 alias 三案 + 磁盘逐字节/三拒/幂等复核 + 双臂一致=${agree}）`)
