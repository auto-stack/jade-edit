#!/usr/bin/env node
// probe_daily.mjs — PLAN-015 T-01③/T-02/T-03 直证（双臂）：Date 原语 back
// 可调 + daily_note 契约四案 + write_body updated_at 自动维护四案。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-daily/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + 探针 widget Init 内直调全案，
//              返回值落 model 字段），`auto run -r vm` 进程内 CALL。
//   split 臂   serve-back（`auto run --server vm`）——daily_note POST（无参
//              动作契约族）+ write_wiki POST。
//
// 案表（期望值 = SD-1501 定文）：
//   n① 首建       daily_note() → yyyy_MM_dd.ad（当日动态值——格式断言）
//   n② 幂等重入   再调 → 同路径；磁盘零变化（首写模板不被改写）
//   n③ 连日并存   昨日档（20260924——写死动态计算）在盘逐字节不动 +
//                 今日档新建
//   n④ 模板逐字节 frontmatter created_at/updated_at 双时间戳（同值首写、
//                 yyyy-MM-ddTHH:mm:ss 无 Z 形、日期段=当日）+ `# yyyy-MM-dd\n\n`
//   u① 有键档保存 wiki/Tasks.ad（updated_at: 2026-06-16T07:00:00Z——Z 形
//                 语料实勘）write_wiki → updated_at 行 = 当日形（Z 归一）+
//                 其余 fm 键行逐字节 + body 落盘
//   u② 无键零引入 NoFmPage（无 frontmatter）write_wiki ×2 → 零 created_at/
//                 updated_at 键引入
//   u③ CRLF 保真  CrlfPage（\r\n 全行尾 + updated_at 键）→ 键行替换 +
//                 \r 继承 + 其余行逐字节
//   u④ 顶层级卫   NestPage（嵌套 `  updated_at:` 键、无顶层级）→ 嵌套行
//                 逐字节不动 + 零顶层级引入
//
// 双臂一致 = 返回值逐案相等 + 磁盘逐字节同判。D-21 负载窗 flake：无-RESULT
// 早崩按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_daily.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-daily')
const MERGED_WS = path.join(RUNTIME, 'probe-daily-workspace')
// 8232 = 探针族顺延口（8222..8231 在册；8231 = probe_dir_ops）
const SPLIT_PORT = await pickPort()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 当日动态值（Node 本地时区——Date.format 宿主桥同为本地时区） ----
const NOW = new Date()
const pad2 = (n) => String(n).padStart(2, '0')
const TODAY_STEM = `${NOW.getFullYear()}_${pad2(NOW.getMonth() + 1)}_${pad2(NOW.getDate())}`
const TODAY_DAY = `${NOW.getFullYear()}-${pad2(NOW.getMonth() + 1)}-${pad2(NOW.getDate())}`
const YDAY_STEM = `20260924`
const STAMP_RE = new RegExp(`^${TODAY_DAY}T\\d{2}:\\d{2}:\\d{2}$`)

// ---- 素材（契约通道造档——不存在路径 write_wiki 直写 body 即原文落盘） ----
const OLD_DAILY_SEED = `---\ncreated_at: 2026-09-24T08:00:00\nupdated_at: 2026-09-24T08:00:00\n---\n\n# 2026-09-24\n\n昨日内容。\n`
const CRLF_SEED = `---\r\ntitle: Crlf\r\nstatus: draft\r\nupdated_at: 2020-01-01T00:00:00\r\n---\r\n\r\n# C\r\n\r\n旧正文。\r\n`
const CRLF_BODY = `# C\r\n\r\n新正文（CRLF 保存）。\r\n`
const NEST_SEED = `---\ntitle: Nest\n  updated_at: 2020-01-01T00:00:00\nstatus: draft\n---\n\n# N\n\n旧正文。\n`
const NEST_BODY = `# N\n\n新正文（嵌套键不动）。\n`
// u① 有键档：Tasks.ad 原文 body + 保存标记（body = 界符段后原文——write_body
// 界符段重接 + body 拼装的 round-trip 语义，body 原样传入则其余字节零变化）
const tasksSource = fs.readFileSync(path.join(FIXTURE_SOURCE, 'wiki', 'Tasks.ad'), 'utf8')
const tasksBody = tasksSource.slice(tasksSource.indexOf('\n---\n') + 5)
const TASKS_BODY_NEW = tasksBody + '\nu① 保存标记：updated_at 维护面。\n'
const TASKS_SOURCE_LINES = tasksSource.split('\n')

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

function dailyDiskAsserts(ws, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const read = (rel) => {
    try { return fs.readFileSync(path.join(ws, rel), 'utf8') } catch { return null }
  }
  // n③ 连日并存：昨日档逐字节不动
  ck(read(`${YDAY_STEM}.ad`) === OLD_DAILY_SEED, `n③ ${YDAY_STEM}.ad 昨日档逐字节不动（旧日档不重写）`)
  // n④ 模板逐字节：frontmatter 双时间戳同值 + 日期段当日 + body 标题
  const todayDisk = read(`${TODAY_STEM}.ad`)
  const mCreated = todayDisk?.match(/^created_at: (.*)$/m)?.[1]
  const mUpdated = todayDisk?.match(/^updated_at: (.*)$/m)?.[1]
  const fmShapeOk = mCreated !== undefined && mCreated === mUpdated && STAMP_RE.test(mCreated ?? '')
  const bodyShapeOk = todayDisk?.endsWith(`\n\n# ${TODAY_DAY}\n\n`) ?? false
  const fmHeadOk = todayDisk?.startsWith('---\ncreated_at: ') ?? false
  const fmTailOk = todayDisk?.includes(`\nupdated_at: ${mCreated}\n---\n`) ?? false
  ck(todayDisk !== null && fmHeadOk && fmShapeOk && fmTailOk && bodyShapeOk,
    `n④ ${TODAY_STEM}.ad 模板（fm created_at/updated_at 同值首写 ${mCreated ?? '<none>'} + # ${TODAY_DAY} body）`)
  // u① Tasks.ad：updated_at 行当日形（Z 归一）+ 其余 fm 行逐字节 + body 标记
  const tasksNow = read('wiki/Tasks.ad')
  const nowLines = tasksNow?.split('\n') ?? []
  const uUpdated = nowLines.find((l) => l.startsWith('updated_at:')) ?? ''
  const uUpdatedVal = uUpdated.replace('updated_at: ', '').trim()
  // fm 段 = 首行界符至闭合界符（含）——body 增行不在比对域（保存标记
  // 面独立断言）。
  const fmSeg = (lines) => {
    const out = []
    for (const l of lines) {
      out.push(l)
      if (l === '---' || l === '---\r') break
    }
    return out
  }
  const srcFm = fmSeg(TASKS_SOURCE_LINES)
  const nowFm = fmSeg(nowLines)
  const upIdx = TASKS_SOURCE_LINES.findIndex((x) => x.startsWith('updated_at:'))
  const otherLinesOk = nowFm.length === srcFm.length
    && nowFm.every((l, i) => (i === upIdx) ? true : l === srcFm[i])
  const markerOk = tasksNow?.includes('u① 保存标记：updated_at 维护面。') ?? false
  ck(STAMP_RE.test(uUpdatedVal) && !uUpdatedVal.endsWith('Z'),
    `u① Tasks.ad updated_at 行当日形（${uUpdatedVal || '<none>'}——Z 形语料归一无 Z）`)
  ck(otherLinesOk, 'u① Tasks.ad 其余 fm 键行/界符行逐字节（仅 updated_at 行受控 diff）')
  ck(markerOk, 'u① Tasks.ad body 落盘（保存标记在）')
  // u② 无键零引入
  const noFm = read('NoFmPage.ad')
  ck(noFm === '# NoFm\n\nbody2\n', 'u② NoFmPage.ad 零键引入（无 frontmatter 直写 body 二次覆写）')
  // u③ CRLF：键行替换 + \r 继承 + 其余行逐字节
  const crlf = read('CrlfPage.ad')
  const crlfLines = crlf?.split('\n') ?? []
  const crlfUpdated = crlfLines.find((l) => l.startsWith('updated_at:')) ?? ''
  const crlfUpdatedVal = crlfUpdated.replace('updated_at: ', '').replace(/\r$/, '').trim()
  const crlfCrOk = crlfUpdated.endsWith('\r')
  const crlfRestOk = crlfLines.includes('title: Crlf\r') && crlfLines.includes('status: draft\r')
    && crlfLines[0] === '---\r' && crlfLines.includes('---\r')
  const crlfBodyOk = crlf?.includes('新正文（CRLF 保存）。') ?? false
  ck(STAMP_RE.test(crlfUpdatedVal) && crlfCrOk, `u③ CrlfPage updated_at 替换+\\r 继承（${crlfUpdatedVal || '<none>'}${crlfCrOk ? ' +\\r' : ' 无\\r!'}）`)
  ck(crlfRestOk, 'u③ CrlfPage 其余键行/界符行逐字节（\\r 形态保真）')
  ck(crlfBodyOk, 'u③ CrlfPage body 落盘')
  // u④ 顶层级卫：嵌套键行不动 + 零顶层级引入
  const nest = read('NestPage.ad')
  const nestLines = nest?.split('\n') ?? []
  const nestNestedOk = nestLines.includes('  updated_at: 2020-01-01T00:00:00')
  const nestTopOk = !nestLines.some((l) => l.startsWith('updated_at:'))
  const nestBodyOk = nest?.includes('新正文（嵌套键不动）。') ?? false
  ck(nestNestedOk, 'u④ NestPage 嵌套 updated_at 行逐字节不动（顶层级卫）')
  ck(nestTopOk, 'u④ NestPage 零顶层级键引入（无键零引入）')
  ck(nestBodyOk, 'u④ NestPage body 落盘')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_daily.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 setup + daily_note 四案 + updated_at 四案，
// 返回值落 model 字段供 autoui_state dump。入口文件名固定 app.at。
use back.api: daily_note, write_wiki

widget App {
    msg { Init }
    model {
        var done bool = false
        var s1 bool = false
        var s2 bool = false
        var s3 bool = false
        var s4 bool = false
        var n1 str = ""
        var n2 str = ""
        var u1 bool = false
        var u2 bool = false
        var u3 bool = false
        var u4 bool = false
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: daily note + updated_at" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            // setup（契约通道造档——不存在路径 write_wiki 直写 body 即原文落盘）
            s1 = write_wiki("20260924.ad", "${OLD_DAILY_SEED.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}")
            s2 = write_wiki("CrlfPage.ad", "${CRLF_SEED.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n')}")
            s3 = write_wiki("NestPage.ad", "${NEST_SEED.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}")
            s4 = write_wiki("NoFmPage.ad", "# NoFm\\n\\nbody\\n")
            // n① 首建 + n② 幂等重入
            n1 = daily_note()
            n2 = daily_note()
            // u①..u④（write_body updated_at 维护面）
            u1 = write_wiki("wiki/Tasks.ad", "${TASKS_BODY_NEW.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}")
            u2 = write_wiki("NoFmPage.ad", "# NoFm\\n\\nbody2\\n")
            u3 = write_wiki("CrlfPage.ad", "${CRLF_BODY.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n')}")
            u4 = write_wiki("NestPage.ad", "${NEST_BODY.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}")
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
    `name: "jade-probe-daily"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeDaily"
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
    env: { ...process.env, AUTOUI_MCP_PORT: '9364', JADE_WORKSPACE: MERGED_WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const { rpc, callTool } = makeClient(9364)
    const deadline = Date.now() + 45000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-daily', version: '0.1.0' } })
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
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}\n---\n${appOut.slice(-800)}`)
      await sleep(300)
    }
    const truthy = (v) => v === 'true' || v === '1'
    const setupOk = truthy(boolField(dump, 's1')) && truthy(boolField(dump, 's2'))
      && truthy(boolField(dump, 's3')) && truthy(boolField(dump, 's4'))
    if (!setupOk) throw new Error(`probe setup failed:\n${dump.slice(0, 1200)}`)
    return {
      n1: strField(dump, 'n1'),
      n2: strField(dump, 'n2'),
      u1: truthy(boolField(dump, 'u1')),
      u2: truthy(boolField(dump, 'u2')),
      u3: truthy(boolField(dump, 'u3')),
      u4: truthy(boolField(dump, 'u4')),
      diskCheck: (failures) => dailyDiskAsserts(MERGED_WS, 'merged', failures),
    }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂：serve-back ----------------

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
    // setup
    if (!(await post('write_wiki', { path: '20260924.ad', body: OLD_DAILY_SEED }))) throw new Error('setup 20260924 failed')
    if (!(await post('write_wiki', { path: 'CrlfPage.ad', body: CRLF_SEED }))) throw new Error('setup CrlfPage failed')
    if (!(await post('write_wiki', { path: 'NestPage.ad', body: NEST_SEED }))) throw new Error('setup NestPage failed')
    if (!(await post('write_wiki', { path: 'NoFmPage.ad', body: '# NoFm\n\nbody\n' }))) throw new Error('setup NoFmPage failed')
    const n1 = await post('daily_note', {})
    const n2 = await post('daily_note', {})
    const u1 = await post('write_wiki', { path: 'wiki/Tasks.ad', body: TASKS_BODY_NEW })
    const u2 = await post('write_wiki', { path: 'NoFmPage.ad', body: '# NoFm\n\nbody2\n' })
    const u3 = await post('write_wiki', { path: 'CrlfPage.ad', body: CRLF_BODY })
    const u4 = await post('write_wiki', { path: 'NestPage.ad', body: NEST_BODY })
    const truthy = (v) => v === 'true' || v === '1'
    return {
      n1, n2, u1: truthy(u1), u2: truthy(u2), u3: truthy(u3), u4: truthy(u4),
      diskCheck: (failures) => dailyDiskAsserts(back.workspace, 'split', failures),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-daily] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-daily] arm 2: split serve-back（:${SPLIT_PORT}，daily_note POST 无参族）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-daily] 双臂返回值对读：')
const todayExpect = `${TODAY_STEM}.ad`
const pairs = [
  ['n1-daily-first', merged.n1, split.n1, todayExpect],
  ['n2-daily-idempotent', merged.n2, split.n2, todayExpect],
  ['u1-keyed-save', merged.u1, split.u1, true],
  ['u2-nokey-intro', merged.u2, split.u2, true],
  ['u3-crlf', merged.u3, split.u3, true],
  ['u4-nested-guard', merged.u4, split.u4, true],
]
let agree = true
for (const [id, m, s, expect] of pairs) {
  const ok = String(m) === String(s) && String(m) === String(expect)
  if (String(m) !== String(s)) agree = false
  console.log(`  [${id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect="${expect}"`)
  if (!ok) failures.push(`case ${id}: merged="${m}" split="${s}" expect="${expect}"`)
}

if (failures.length > 0) {
  console.error(`\n[probe-daily] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-daily] RESULT: merged + split 全案通过（Date 原语 back 直证 daily_note 四案+updated_at 维护四案+双臂一致=${agree}）`)
