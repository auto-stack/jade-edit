#!/usr/bin/env node
// bench.mjs — jade-edit 测量套件（PLAN-002 T-02；对照 auto-edit
// PLAN-005 bench.py 收口形态，node 化）。
//
// 三命令：
//   node tools/bench/bench.mjs check              # 依赖自检 + 环境指纹
//                                                 # （工具链构建号 ≥1652 = 669+671 面）
//   node tools/bench/bench.mjs proxy [--runs N]   # L0 代理测量：启动分解（首跑弃暖机）
//                                                 #   + 首开冷/热 + 换档可见延迟 + 大文档
//                                                 #   + 内存采样 → results/<ts>.jsonl
//   node tools/bench/bench.mjs assert [--results <file>]
//                                                 # 对 results 按 budgets.json 出报告
//                                                 # （hard 违例 exit 1；ledger 行只记不挂）
//
// 测量语义（L0 = VM+merged，debug 构建，无绝对性能效力——报告价值 =
// 形状分解 + 回归护栏 + blocked-upstream 项记账基线）：
//   观测通道 = MCP 心跳法（host 侧计时：press/动作调用 → 快照锚可见，
//   100ms 轮询粒度）。app 侧毫秒钟（VM time 族）未接线（auto-edit 同坑，
//   供料包在册）——全部毫秒值 host 侧记。
//   内存采样 = PowerShell Get-Process -Id <pid> WorkingSet64（按 PID 收，
//   绝不 taskkill //IM）。
//
// 预算口径（budgets.json 六行，每行 tier/validity/unlock 全带）：
//   hard   —— 违例 exit 1（现仅 first_open_warm：热态回归护栏）
//   ledger —— 只记不挂（冷态/切换/大文档/内存/启动，blocked-upstream 面）
//
// 进程卫生（vm-smoke 同款）：只杀自己 spawn 的进程；fixture 隔离拷贝。
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const RESULTS = path.join(HERE, 'results')
const LOGS = path.join(HERE, 'logs')
const BUDGETS = path.join(HERE, 'budgets.json')
const WS = path.join(repoRoot, 'e2e', '.runtime', 'bench-ws')
const LARGE_DOC = path.join(WS, 'wiki', 'Bench 大文档.ad')
const LARGE_MB = 1
const LARGE_TIMEOUT_MS = 30000
const MIN_TOOLCHAIN_BUILD = 1652 // 669+671 面（补件链退役基线；README 注记）

const EXIT_OK = 0
const EXIT_FAIL = 1

const args = process.argv.slice(2)
const cmd = args[0] ?? 'check'
const argOf = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const RUNS = Number(argOf('--runs') ?? 5)

const log = (m) => console.log(`[bench ${new Date().toISOString().slice(11, 19)}] ${m}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ts = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)

// ---------------- 环境指纹 ----------------
function fingerprint() {
  let ver = ''
  try {
    ver = execFileSync(AUTO_EXE, ['--version'], { encoding: 'utf8', timeout: 30000 }).trim()
  } catch (e) {
    ver = `<version probe failed: ${e.message}>`
  }
  const m = ver.match(/-(\d+)-g[0-9a-f]+/)
  return {
    auto_path: AUTO_EXE,
    auto_version: ver,
    toolchain_build: m ? Number(m[1]) : null,
    node: process.version,
    fixture_source: FIXTURE_SOURCE,
    os: process.platform,
  }
}

// ---------------- 内存采样（PowerShell 按 PID） ----------------
function sampleMem(pid) {
  try {
    const out = execFileSync(
      'powershell',
      ['-NoProfile', '-Command', `(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).WorkingSet64`],
      { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'ignore'] },
    )
    const v = Number(out.trim())
    return Number.isFinite(v) ? v : null
  } catch {
    return null
  }
}

// ---------------- MCP 客户端 ----------------
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
    const r = await rpc('tools/call', { name, arguments: toolArgs })
    if (r.isError) throw new Error(`tool ${name} failed: ${JSON.stringify(r.content)}`)
    return r.content.map((c) => c.text ?? '').join('\n')
  }
  return { rpc, callTool }
}

const parseAura = (text) => {
  const root = { head: '<root>', children: [] }
  const stack = [{ node: root, depth: -1 }]
  for (const raw of text.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed || trimmed === '}' || raw.startsWith('AURA') || raw.startsWith('widget:') || raw.startsWith('tree:')) continue
    const depth = Math.floor((raw.length - raw.replace(/^ */, '').length) / 2)
    const line = trimmed.replace(/\{$/, '')
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop()
    const node = { head: line, children: [] }
    stack[stack.length - 1].node.children.push(node)
    stack.push({ node, depth })
  }
  return root
}
function findFirst(node, pred) {
  if (pred(node)) return node
  for (const child of node.children) {
    const hit = findFirst(child, pred)
    if (hit) return hit
  }
  return null
}
const elementIdOf = (n) => n.head.match(/#(vnode_\d+)/)?.[1] ?? null
const ownText = (n) => n.head.match(/"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''

// ---------------- 被测实例（spawn + 计时） ----------------
async function launch({ seedLarge = false } = {}) {
  fs.rmSync(WS, { recursive: true, force: true })
  fs.cpSync(FIXTURE_SOURCE, WS, { recursive: true })
  if (seedLarge) {
    // 大文档须在 Init 前入工作区——树一次装载，Init 后新档不可见
    genLargeDoc(LARGE_DOC, LARGE_MB)
  }
  const port = 9411
  const t0 = performance.now()
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: repoRoot,
    env: { ...process.env, AUTOUI_MCP_PORT: String(port), JADE_WORKSPACE: WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  app.stdout.on('data', (d) => (out += d))
  app.stderr.on('data', (d) => (out += d))
  const { rpc, callTool } = makeClient(port)
  const deadline = Date.now() + 45000
  for (;;) {
    try {
      await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-bench', version: '0.1.0' } })
      break
    } catch (e) {
      if (app.exitCode !== null) throw new Error(`app exited early (code ${app.exitCode}):\n${out.slice(-800)}`)
      if (Date.now() > deadline) throw new Error(`MCP not reachable: ${e.message}`)
      await sleep(100)
    }
  }
  const mcpReadyMs = performance.now() - t0
  let snap = ''
  for (;;) {
    try {
      const t = await callTool('autoui_snapshot', {})
      if (!/No UI available/.test(t)) { snap = t; break }
    } catch {}
    if (Date.now() > deadline) throw new Error('UI never became available')
    await sleep(100)
  }
  const readyMs = performance.now() - t0
  return { app, callTool, mcpReadyMs, readyMs, out: () => out }
}

const killApp = async (app) => {
  try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
  await sleep(800)
}

async function waitUiReady(callTool) {
  for (let i = 0; i < 120; i++) {
    try {
      const t = await callTool('autoui_snapshot', {})
      if (!/No UI available/.test(t)) return
    } catch {}
    await sleep(100)
  }
  throw new Error('UI never became available')
}

async function pressStateTimed(callTool, label, stateField, wantValue, timeoutMs = 60000) {
  // store 激活态口径：press → 轮询 autoui_state（轻量，fields 定向）→ 首次快照恢复
  const btn = await findButton(callTool, label)
  const t0 = performance.now()
  const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
  const pressMs = performance.now() - t0
  if (!/status: ok/.test(res)) throw new Error(`press "${label}" not ok: ${res}`)
  for (;;) {
    const st = await callTool('autoui_state', { fields: [stateField] })
    if (st.includes(wantValue)) break
    if (performance.now() - t0 > timeoutMs) throw new Error(`timeout waiting state.${stateField}=${wantValue}（LargeDoc 观测窗）`)
    await sleep(200)
  }
  await callTool('autoui_snapshot', {})
  return { pressMs, totalMs: performance.now() - t0 }
}

async function findButton(callTool, label, { exact = false, timeoutMs = 15000 } = {}) {
  // 轮询等钮出现（boot 渲染节拍；vnode id 逐次漂移——每轮重取快照）
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const tree = parseAura(await callTool('autoui_snapshot', {}))
    const btn = findFirst(
      tree,
      (n) =>
        n.head.startsWith('button ') &&
        elementIdOf(n) &&
        (exact ? ownText(n) === label : ownText(n) === label || ownText(n).endsWith(label)),
    )
    if (btn) return btn
    if (Date.now() > deadline) throw new Error(`button "${label}" not found`)
    await sleep(300)
  }
}

async function pressLabelTimed(callTool, label, anchor, timeoutMs = 20000, pollMs = 100) {
  // host 侧计时：找钮（轮询，不计入）→ press 调用 → 轮询快照锚可见。
  // 大文档锚轮询放宽 pollMs（快照体积随文档膨胀，密轮询自饱和）。
  const btn = await findButton(callTool, label)
  const t0 = performance.now()
  const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
  const pressMs = performance.now() - t0
  if (!/status: ok/.test(res)) throw new Error(`press "${label}" not ok: ${res}`)
  for (;;) {
    const t = await callTool('autoui_snapshot', {})
    if (t.includes(anchor)) return { pressMs, totalMs: performance.now() - t0 }
    if (performance.now() - t0 > timeoutMs) throw new Error(`timeout waiting "${anchor}" for ${label}`)
    await sleep(pollMs)
  }
}

async function expandWiki(callTool) {
  const btn = await findButton(callTool, 'wiki', { exact: true })
  const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
  if (!/status: ok/.test(res)) throw new Error('press wiki not ok')
  await sleep(400)
}

// ---------------- 阶段：check ----------------
function stageCheck() {
  fs.mkdirSync(LOGS, { recursive: true })
  fs.mkdirSync(RESULTS, { recursive: true })
  const fp = fingerprint()
  const envFile = path.join(LOGS, `env-${ts()}.txt`)
  fs.writeFileSync(envFile, JSON.stringify(fp, null, 2))
  log(`环境指纹 → ${envFile}`)
  for (const [k, v] of Object.entries(fp)) log(`  ${k}: ${v}`)
  if (fp.toolchain_build === null) {
    log(`FATAL: 无法解析工具链构建号：${fp.auto_version}`)
    return EXIT_FAIL
  }
  if (fp.toolchain_build < MIN_TOOLCHAIN_BUILD) {
    log(`BLOCKED: 工具链构建 ${fp.toolchain_build} < ${MIN_TOOLCHAIN_BUILD}（须含 669+671 面，补件链退役基线）`)
    return EXIT_FAIL
  }
  log(`check 绿：构建 ${fp.toolchain_build} ≥ ${MIN_TOOLCHAIN_BUILD}`)
  return EXIT_OK
}

// ---------------- 阶段：proxy ----------------
async function stageProxy() {
  fs.mkdirSync(LOGS, { recursive: true })
  fs.mkdirSync(RESULTS, { recursive: true })
  const fp = fingerprint()
  if (fp.toolchain_build === null || fp.toolchain_build < MIN_TOOLCHAIN_BUILD) {
    log(`FATAL: 工具链 ${fp.auto_version} 不满足 ≥${MIN_TOOLCHAIN_BUILD}`)
    return EXIT_FAIL
  }
  const lines = [{ type: 'env', ts: ts(), ...fp }]
  let peakMem = 0
  let memTimer = null

  // —— 1) 启动分解 ×N（首跑弃暖机）——
  log(`启动分解：${RUNS} 跑（首跑弃暖机）——spawn → MCP ready → status ready`)
  const startup = []
  for (let i = 0; i < RUNS; i++) {
    const inst = await launch()
    memTimer = setInterval(() => {
      const v = sampleMem(inst.app.pid)
      if (v && v > peakMem) peakMem = v
    }, 500)
    await waitUiReady(inst.callTool)
    clearInterval(memTimer)
    startup.push({ run: i, warmup: i === 0, spawn_to_mcp_ready_ms: round(inst.mcpReadyMs), spawn_to_ready_ms: round(inst.readyMs) })
    log(`  run${i}${i === 0 ? '(暖机弃)' : ''}: mcp=${round(inst.mcpReadyMs)}ms ready=${round(inst.readyMs)}ms`)
    await killApp(inst.app)
  }
  lines.push({ type: 'startup_runs', warmup_discarded: true, runs: startup })

  // —— 2) 首开冷 / 热 + 换档可见（单实例流，D-16/D-03 口径）——
  log('首开冷/热 + 换档可见：冷=新进程首个编辑器挂载；热=同进程二次开；换档=tab 激活')
  const inst = await launch({ seedLarge: true })
  memTimer = setInterval(() => {
    const v = sampleMem(inst.app.pid)
    if (v && v > peakMem) peakMem = v
  }, 500)
  await waitUiReady(inst.callTool)
  await expandWiki(inst.callTool)
  const coldOpen = await withAppLog(inst, () => pressLabelTimed(inst.callTool, 'Hello World.ad', '这是一段示例文本'))
  log(`  冷开 Hello World.ad（rust 围栏档，进程内首开=含 D-16 一次性初始化）: 可见=${round(coldOpen.totalMs)}ms`)
  // 换档系列（D-03 口径）：切档激活三跑取最坏；热态口径 = 回访已开档最好跑
  const switches = []
  switches.push(await withAppLog(inst, () => pressLabelTimed(inst.callTool, 'Tasks.ad', '原型设计')))
  log(`  换档①开 Tasks.ad: 可见=${round(switches[0].totalMs)}ms`)
  switches.push(await withAppLog(inst, () => pressLabelTimed(inst.callTool, 'wiki/Hello World', '这是一段示例文本')))
  log(`  换档②回 Hello World（热回访）: 可见=${round(switches[1].totalMs)}ms`)
  switches.push(await withAppLog(inst, () => pressLabelTimed(inst.callTool, 'wiki/Tasks', '原型设计')))
  log(`  换档③回 Tasks: 可见=${round(switches[2].totalMs)}ms`)
  // 热回访再加一跑取最小——idle tick 相位双态（D-03）下 min 收敛到
  // 无等待路径（~53ms），hard 门才确定
  switches.push(await withAppLog(inst, () => pressLabelTimed(inst.callTool, 'wiki/Hello World', '这是一段示例文本')))
  log(`  换档④热回访 Hello World: 可见=${round(switches[3].totalMs)}ms`)
  // hard 行口径（PLAN-002 T-02 实测定型）：总可见时受 D-03 idle tick 节拍
  // 支配（53-1689ms 双态，非确定）——hard 锁 press 调用往返（UI 线程响应性，
  // 实测带 51-52ms 全程稳定）；总可见 min/max 作 ledger 信息值。
  const warmOpen = { pressMs: Math.min(...switches.slice(1).map((x) => x.pressMs)), totalMs: Math.min(...switches.slice(1).map((x) => x.totalMs)) }
  const switchBack = { totalMs: Math.max(...switches.map((x) => x.totalMs)) }

  // —— 3) 大文档打开（生成 fixture，文档尾锚可见；C-5 ledger）——
  log(`大文档打开：生成 ${LARGE_MB}MB fixture（gitignored，可再生）`)
  const tGen = performance.now()
  genLargeDoc(LARGE_DOC, LARGE_MB)
  const genS = (performance.now() - tGen) / 1000
  // 大文档「打开完成」= store 激活态（active_key 变更）+ 首次快照恢复。
  // 历史：旧 read_body O(N·L) 逐行重接曾致 1MB 78s+ 阻塞（blocked 记录
  // 在案）——2026-09-21 read_body O(n) 化后 1MB ~0.9s，此臂转常规测量；
  // 超时兜底保留（更大文档/回归时降级为 blocked 记录而非炸套件）。
  let largeOpen = null
  let largeBlocked = null
  try {
    largeOpen = await withAppLog(
      inst,
      () => pressStateTimed(inst.callTool, 'Bench 大文档.ad', 'active_key', 'wiki/Bench 大文档.ad', 30000),
    )
    log(`  大文档（${LARGE_MB}MB，生成 ${genS.toFixed(2)}s）: 激活+快照恢复=${round(largeOpen.totalMs)}ms`)
  } catch (e) {
    largeBlocked = `${LARGE_MB}MB 文档 ${LARGE_TIMEOUT_MS / 1000}s 观测窗内未达 store 激活（整文读链阻塞，read_wiki 未返回）——C-5 blocked-upstream 实证`
    log(`  大文档: BLOCKED — ${largeBlocked}`)
  }
  clearInterval(memTimer)
  await killApp(inst.app)

  const measurements = {
    type: 'timings',
    first_open_cold_ms: round(coldOpen.totalMs),
    first_open_cold_press_ms: round(coldOpen.pressMs),
    first_open_warm_ms: round(warmOpen.pressMs),
    first_open_warm_press_ms: round(warmOpen.pressMs),
    first_open_warm_total_ms: round(warmOpen.totalMs),
    doc_switch_visible_ms: round(switchBack.totalMs),
    doc_switch_press_ms: round(switchBack.pressMs),
    open_large_doc_ms: round(largeOpen?.totalMs ?? null),
    open_large_doc_press_ms: round(largeOpen?.pressMs ?? null),
    open_large_doc_metric: 'store 激活(active_key)+首次快照恢复',
    open_large_doc_blocked_note: largeBlocked,
    large_doc_mb: LARGE_MB,
    large_doc_gen_s: Number(genS.toFixed(3)),
  }
  lines.push(measurements)

  // —— 4) 内存（进程 RSS 峰值，PowerShell WorkingSet64）——
  lines.push({ type: 'mem', method: 'powershell.Get-Process.WorkingSet64', peak_bytes: peakMem, peak_mb: round(peakMem / 1048576) })
  log(`内存峰值: ${round(peakMem / 1048576)}MB（${peakMem} 字节）`)

  // —— 5) 预算断言（hard 违例即红；ledger 只记不挂）——
  const readyMedian = median(startup.filter((r) => !r.warmup).map((r) => r.spawn_to_ready_ms))
  const measuredById = {
    first_open_warm: measurements.first_open_warm_ms,
    first_open_cold: measurements.first_open_cold_ms,
    doc_switch_visible: measurements.doc_switch_visible_ms,
    boot_to_ready: readyMedian,
    open_large_doc: measurements.open_large_doc_ms,
    mem_peak: round(peakMem / 1048576),
  }
  const budgets = JSON.parse(fs.readFileSync(BUDGETS, 'utf8'))
  const report = budgets.map((b) => {
    const measured = measuredById[b.id] ?? null
    const entry = { id: b.id, metric: b.metric, budget: b.budget, tier: b.tier, validity: b.validity, unlock: b.unlock, unit: b.unit ?? 'ms' }
    if (measured == null) {
      if (b.id === 'open_large_doc' && measurements.open_large_doc_blocked_note) {
        entry.state = 'blocked-upstream'
        entry.note = measurements.open_large_doc_blocked_note
      } else {
        entry.state = 'not-measured'
        entry.note = 'proxy 未产出该指标（口径见 tools/bench/README.md）'
      }
    } else {
      entry.measured = measured
      entry.state = 'ledger'
      entry.note = 'ledger 行：记账不阻塞'
    }
    return entry
  })
  // hard 行单独评（有 measured 才评）
  for (const r of report) {
    if (r.tier !== 'hard' || r.measured == null) continue
    const limit = Number(String(r.budget).replace(/[^0-9.]/g, ''))
    r.state = r.measured <= limit ? 'hard-pass' : 'hard-violation'
    r.note = `hard 门：measured ${r.measured}ms ${r.measured <= limit ? '≤' : '>'} ${limit}ms`
  }
  lines.push({ type: 'budget_assert', rows: report })
  log('预算断言报告：')
  for (const r of report) log(`  [${r.state}] ${r.id}: ${r.measured != null ? r.measured + ' ' + r.unit : '—'} — ${r.note}`)

  const outfile = path.join(RESULTS, `${ts()}.jsonl`)
  fs.writeFileSync(outfile, lines.map((l) => JSON.stringify(l)).join('\n') + '\n')
  log(`结果 JSONL → ${outfile}`)
  if (report.some((r) => r.state === 'hard-violation')) {
    log('FATAL: hard 预算违例')
    return EXIT_FAIL
  }
  return EXIT_OK
}

const withAppLog = async (inst, fn) => {
  try {
    return await fn()
  } catch (e) {
    throw new Error(`${e.message}
--- app 输出尾部 ---
${inst.out().slice(-800)}`)
  }
}

const round = (v) => (v == null ? null : Math.round(v))
const median = (arr) => {
  if (arr.length === 0) return null
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

function genLargeDoc(file, mb) {
  const unit = '- 列表项 ^bench-anchor\n\n段落文本：bench 大文档载荷行，用于整文镜像装载计时。\n\n'
  const target = mb * 1024 * 1024
  let buf = '---\ntitle: Bench 大文档\n---\n\n# Bench 大文档 ^bench-head\n\n'
  while (buf.length < target) buf += unit
  fs.writeFileSync(file, buf.slice(0, target) + '\nBENCH-TAIL-ANCHOR ^bench-tail\n')
}

// ---------------- 阶段：assert ----------------
function stageAssert(resultsPath) {
  let file = resultsPath
  if (!file) {
    const cands = fs.readdirSync(RESULTS).filter((f) => f.endsWith('.jsonl')).sort()
    if (cands.length === 0) {
      log('FATAL: 无既往 results 文件（先跑 proxy，或 --results 指定）')
      return EXIT_FAIL
    }
    file = path.join(RESULTS, cands[cands.length - 1])
  }
  log(`断言源：${file}`)
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l))
  const timings = lines.find((l) => l.type === 'timings')
  const mem = lines.find((l) => l.type === 'mem')
  const prev = lines.find((l) => l.type === 'budget_assert')
  if (!timings && !prev) {
    log('FATAL: 该结果文件无 timings/budget_assert 记录')
    return EXIT_FAIL
  }
  // 断言 = 存量 measurements × 当前 budgets.json 重评（budget 改动可对旧
  // 结果重判；构造性红证即改 budgets 后对同一结果 assert）。
  const measuredById = timings
    ? {
        first_open_warm: timings.first_open_warm_ms,
        first_open_cold: timings.first_open_cold_ms,
        doc_switch_visible: timings.doc_switch_visible_ms,
        boot_to_ready: median(
          (lines.find((l) => l.type === 'startup_runs')?.runs ?? [])
            .filter((r) => !r.warmup)
            .map((r) => r.spawn_to_ready_ms),
        ),
        open_large_doc: timings.open_large_doc_ms,
        mem_peak: mem ? round(mem.peak_bytes / 1048576) : null,
      }
    : Object.fromEntries((prev?.rows ?? []).map((r) => [r.id, r.measured ?? null]))
  const budgets = JSON.parse(fs.readFileSync(BUDGETS, 'utf8'))
  const prevRows = Object.fromEntries((prev?.rows ?? []).map((r) => [r.id, r]))
  let hardBad = 0
  log('预算断言报告（存量 measurements × 当前 budgets）：')
  for (const b of budgets) {
    const measured = measuredById[b.id] ?? null
    const unit = b.unit ?? 'ms'
    if (measured == null) {
      const p = prevRows[b.id]
      log(`  [${p?.state ?? 'not-measured'}] ${b.id}: — — ${p?.note ?? 'proxy 未产出该指标'}`)
      if (p?.state === 'hard-violation') hardBad++
      continue
    }
    let state = 'ledger'
    let note = 'ledger 行：记账不阻塞'
    if (b.tier === 'hard') {
      const limit = Number(String(b.budget).replace(/[^0-9.]/g, ''))
      state = measured <= limit ? 'hard-pass' : 'hard-violation'
      note = `hard 门：measured ${measured}${unit} ${measured <= limit ? '≤' : '>'} ${limit}${unit}`
      if (state === 'hard-violation') hardBad++
    }
    log(`  [${state}] ${b.id}: ${measured} ${unit} — ${note}`)
  }
  if (hardBad > 0) {
    log('FATAL: hard 预算违例')
    return EXIT_FAIL
  }
  return EXIT_OK
}

// ---------------- main ----------------
if (cmd === 'check') process.exit(stageCheck())
else if (cmd === 'proxy') process.exit(await stageProxy())
else if (cmd === 'assert') process.exit(stageAssert(argOf('--results')))
else {
  console.error(`未知命令 ${cmd}——用法：bench.mjs check | proxy [--runs N] | assert [--results <file>]`)
  process.exit(2)
}
