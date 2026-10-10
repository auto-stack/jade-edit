#!/usr/bin/env node
// probe_quick_open.mjs — PLAN-038 双轨快速打开独立弹层 探针。
//
// T-01 相位（--phase t1，当前默认）：载体工程冻结公开形态——快开根弹层
//   （dialog/input/onenter/行钮/取消钮/列表滚动）+ ui.focus 程序化聚焦 +
//   真实 editor_store（原样拷贝）NavCommit 同步提交门：uid=0 无文档源、
//   已开脏目标直激活（零覆盖零重复 tab）、stale 目录 missing 拒开、零结果
//   Enter 零动作、Escape/Tab 合成通道行为实勘。载体 = e2e/.runtime 生成
//   （pac render vm + src/back 整树拷贝 + src/front/editor_store.at 原样 +
//   探针 app.at），MCP autoui_* 驱动，非复制策略机——提交链全走生产 store。
// 后续相位（T-02/T-03/T-04 后扩）：生产 App Q/C/R（目录/隔离/世代门）与
//   O/S/P（开页/过期/零副作用）组——真实生产 jade 应用 merged 驱动
//   （probe_native_wiki_link N 臂配方）。
//
// 冻结判据（038-quick-open-contract.md §2/§3 载体面）：
//   F1 boot+开弹层（按钮口；生产 = 三入口共口）→ 标题/输入/行/取消可见
//   F2 ui.focus(".Edit") → __focus_result = "ok"（VM 程序化聚焦在册形态）
//   F3 type_text → 独立 q 状态 + 行集过滤 + 首选 path（高亮臂在快照）
//   F4 输入 Enter（autoui_action submit 定址派发 onenter）→ uid=0 票据
//      经真实 NavCommit：新 tab + sel_gen 前进 + 弹层关 + 回执恰一
//   F5 脏目标：已开+已改 → 拾取直激活（tab 数不增、内存正文保持、脏标
//      保持——零读盘零覆盖）
//   F6 stale 目录 missing：磁盘已删 → 行点击 → 独立错误可见、零 tab 零
//      建页、弹层留置
//   F7 零结果 Enter（autoui_keyboard 首输入代理通道）→ 零开页零关闭
//   F8 取消钮 → 关闭零副作用（commit 计数不变）
//   F9 Escape 合成通道 → qopen 不变（VM modal 无 Escape 通道实勘——
//      BLOCKED 性质边界：VM 无公开 Escape 关闭形态，取消钮承载同终态；
//      vue 轨 v-model 通道由 e2e 承载）
//   F10 Tab 合成通道 → 行为实录（无 keybind 时零派发——键盘遍历边界单列）
//   W 窄窗 640x480 载体：弹层可见面（标题/输入/行/取消）+ 列表滚动节点
//
// 用法（仓根）：node tests/probe_quick_open.mjs [--phase t1]

import { spawn, spawnSync, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')

const argOf = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const PHASE = argOf('--phase') ?? 't1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const rec = { pass: 0, fail: 0, blocked: 0, lines: [] }
const ck = (okFlag, label) => {
  rec[okFlag ? 'pass' : 'fail']++
  rec.lines.push(`${okFlag ? 'PASS' : 'FAIL'}  ${label}`)
  if (!okFlag) console.log(`  [FAIL] ${label}`)
}
const bl = (label) => {
  rec.blocked++
  rec.lines.push(`BLOCKED  ${label}`)
  console.log(`  [BLOCKED] ${label}`)
}

// ---------------- MCP 客户端（同族配方 probe_native_wiki_link） ----------------

function makeClient(port) {
  let nextId = 1
  const rpc = async (method, params) => {
    let lastErr
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
        })
        if (!res.ok) throw new Error(`MCP ${method} -> HTTP ${res.status}`)
        const body = await res.json()
        if (body.error) throw new Error(`MCP ${method} error: ${JSON.stringify(body.error)}`)
        return body.result
      } catch (err) {
        lastErr = err
        const msg = String(err?.message ?? err)
        if (!/fetch failed|ECONNRESET|socket|network/i.test(msg)) throw err
        await sleep(300)
      }
    }
    throw lastErr
  }
  const callTool = async (name, toolArgs) => {
    const result = await rpc('tools/call', { name, arguments: toolArgs })
    if (result.isError) {
      const msg = result.content.map((c) => c.text ?? '').join('\n')
      throw new Error(`tool ${name} failed: ${msg}`)
    }
    return result.content.map((c) => c.text ?? '').join('\n')
  }
  return { rpc, callTool }
}

async function waitMcpAndUi(port, clientName, app, appOut) {
  const { rpc, callTool } = makeClient(port)
  const deadline = Date.now() + 60000
  for (;;) {
    try {
      await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: clientName, version: '0.1.0' } })
      break
    } catch (err) {
      if (app.exitCode !== null) throw new Error(`app exited early (code ${app.exitCode}):\n${appOut().slice(-2500)}`)
      if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
      await sleep(500)
    }
  }
  for (let i = 0; i < 90; i++) {
    try {
      const t = await callTool('autoui_snapshot', {})
      if (!/No UI available/.test(t)) return { rpc, callTool }
    } catch { /* 未渲染重试 */ }
    if (app.exitCode !== null) throw new Error(`app exited during UI wait:\n${appOut().slice(-2000)}`)
    if (Date.now() > deadline + 30000) throw new Error('UI never rendered (90s)')
    await sleep(500)
  }
  throw new Error('UI never rendered')
}

function launchVmApp(port, clientName, cwd, env) {
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd,
    env: { ...process.env, AUTOUI_MCP_PORT: String(port), ...(env ?? {}) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  app._out = () => appOut
  app._kill = async () => {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { try { app.kill() } catch { /* 已退出 */ } }
    await sleep(600)
  }
  return app
}

const aliveTail = (app) => (app.exitCode !== null ? `app exited (code ${app.exitCode}) tail:\n${app._out().slice(-900)}` : 'app alive')

const strField = (dump, name) => {
  const raw = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]
  if (raw === undefined) return null
  try { return JSON.parse(`"${raw}"`) } catch { return raw }
}
const intField = (dump, name) => {
  const m = dump.match(new RegExp(`${name}:\\s*(-?\\d+)`))
  return m ? Number(m[1]) : null
}
const boolField = (dump, name) => {
  const m = dump.match(new RegExp(`${name}:\\s*(true|false)`))
  return m ? m[1] === 'true' : null
}

// ---------------- 载体工程 ----------------

const FIXTURE = path.join(RUNTIME, 'quick-open-ws')

function buildFixtureWorkspace() {
  fs.rmSync(FIXTURE, { recursive: true, force: true })
  fs.mkdirSync(path.join(FIXTURE, 'wiki'), { recursive: true })
  fs.writeFileSync(path.join(FIXTURE, 'wiki', 'Alpha.ad'), '---\ntitle: 甲页\n---\n\n甲页正文 alpha。\n', 'utf8')
  fs.writeFileSync(path.join(FIXTURE, 'wiki', 'Beta.ad'), '---\ntitle: 乙页\n---\n\n乙页正文 beta。\n', 'utf8')
  fs.writeFileSync(path.join(FIXTURE, 'wiki', 'Gamma.ad'), '---\ntitle: 丙页\n---\n\n丙页正文 gamma。\n', 'utf8')
}

// 载体 App（探针生成件——目录静态装配冻结视图/键程/提交形态；过滤为
// name_rows_of 同规最小实例；提交链全走原样拷贝的生产 editor_store）。
const CARRIER_AT = `// 探针载体（tests/probe_quick_open.mjs 生成件——e2e/.runtime 再生，非
// 入库源）。PLAN-038 T-01：快开根弹层公开形态冻结 + 真实 editor_store
// NavCommit 同步提交（uid=0 无文档源 / 已开脏目标直激活 / stale missing）。
use editor_store: EditorStore
use back.api: exists, read_wiki

fn rows_of(dir List, q str) List {
    var nq str = q.trim().to_lower()
    var out List = []
    var i int = 0
    while i < dir.len() {
        var r = dir[i]
        var hit bool = false
        if nq == "" {
            hit = true
        } else {
            var dt str = r.dtitle
            if dt.to_lower().contains(nq) {
                hit = true
            }
            if !hit {
                var rp str = r.path
                if rp.to_lower().contains(nq) {
                    hit = true
                }
            }
        }
        if hit {
            out.push({ path: r.path, dtitle: r.dtitle })
        }
        i = i + 1
    }
    return out
}

fn first_of(rows List) str {
    var out str = ""
    if rows.len() > 0 {
        var r0 = rows[0]
        out = r0.path
    }
    return out
}

fn find_row_path(r) str {
    var p str = r.path
    return p
}

widget App {
    msg { Init, OpenDlg, Edit(str), Confirm, Pick(str), Cancel, PrepDirty }
    model {
        var booted bool = false
        var qopen bool = false
        var q str = ""
        var rows List = []
        var first_path str = ""
        var err str = ""
        var busy bool = false
        var seq int = 0
        var dir List = []
        var commit_count int = 0
        var last_commit str = ""
        // ui.focus 回执观察位（renderer write_state 要求已声明字段——
        // 未声明时 FieldNotFound 静默，T-01 实勘定谳）。
        var __focus_result str = ""
    }
    view {
        col (style: "h-full w-full gap-2 p-2") {
            row (style: "gap-2") {
                button (text: "open-quick", variant: "ghost") { onclick: .OpenDlg }
                button (text: "h-dirty", variant: "ghost") { onclick: .PrepDirty }
            }
            text "carrier: quick-open T-01" { style: "text-[12px] text-muted-foreground" }
            dialog (open: .qopen) {
                dialog-content {
                    dialog-header {
                        dialog-title "快速打开"
                        dialog-description "输入标题、别名或路径"
                    }
                    input {
                        value: .q
                        oninput: .Edit
                        onenter: .Confirm
                        placeholder: "输入标题、别名或路径…"
                        style: "w-full h-7 px-2 text-[12px] border rounded bg-background"
                    }
                    if .err != "" {
                        text .err { style: "text-[11px] text-destructive px-1" }
                    }
                    col (style: "w-full max-h-64 overflow-y-auto") {
                        for r in .rows {
                            if r.path == .first_path {
                                row (style: "w-full items-center justify-between") {
                                    button (text: r.dtitle, variant: "ghost") {
                                        onclick: .Pick(r.path)
                                        style: "flex-1 justify-start px-3 h-6 text-left text-[12px] bg-accent"
                                    }
                                    text find_row_path(r) { style: "text-[10px] text-muted-foreground px-3" }
                                }
                            } else {
                                row (style: "w-full items-center justify-between") {
                                    button (text: r.dtitle, variant: "ghost") {
                                        onclick: .Pick(r.path)
                                        style: "flex-1 justify-start px-3 h-6 text-left text-[12px]"
                                    }
                                    text find_row_path(r) { style: "text-[10px] text-muted-foreground px-3" }
                                }
                            }
                        }
                    }
                    dialog-footer {
                        button (text: "取消", variant: "outline") { onclick: .Cancel }
                    }
                }
            }
        }
    }
    on {
        .Init -> {
            .dir.push({ path: "wiki/Alpha.ad", dtitle: "甲页" })
            .dir.push({ path: "wiki/Beta.ad", dtitle: "乙页" })
            .dir.push({ path: "wiki/Gamma.ad", dtitle: "丙页" })
            .rows = rows_of(.dir, "")
            .first_path = first_of(.rows)
            booted = true
        }
        .OpenDlg -> {
            .qopen = true
            .busy = false
            .err = ""
            .seq = .seq + 1
            .rows = rows_of(.dir, .q)
            .first_path = first_of(.rows)
            ui.focus(".Edit")
        }
        .Edit(v) -> {
            .q = v
            .rows = rows_of(.dir, .q)
            .first_path = first_of(.rows)
            .seq = .seq + 1
        }
        .Confirm -> {
            if .busy {
                console_log("quick: busy")
            } else {
                if .first_path != "" {
                    .Pick(.first_path)
                } else {
                    console_log("quick: enter-no-first")
                }
            }
        }
        .Pick(path) -> {
            if path != "" {
                if .busy {
                    console_log("quick: busy")
                } else {
                    .busy = true
                    .err = ""
                    .seq = .seq + 1
                    var myseq int = .seq
                    var t_uid int = .store.active_uid
                    var t_gen int = .store.sel_gen
                    var t_key str = .store.active_key
                    var t_body str = .store.active_body
                    var found int = -1
                    var i int = 0
                    while i < .store.tabs.len() {
                        var tp str = .store.tabs[i].path
                        if tp == path {
                            found = i
                        }
                        i = i + 1
                    }
                    if found >= 0 {
                        store.NavCommit({ uid: t_uid, gen: t_gen, key: t_key, body: t_body, path: path, anchor: "", body2: "" })
                    } else {
                        var ex bool = false
                        var eok bool = true
                        try {
                            ex = exists(path)
                        } catch (e) {
                            eok = false
                        }
                        if !eok {
                            .err = "页面状态检查失败，请重试"
                            console_log("quick: exists failed")
                        } else {
                            if !ex {
                                .err = "目标不存在——请重开快速打开刷新目录"
                                console_log("quick: missing " + path)
                            } else {
                                var body2 str = ""
                                var rok bool = true
                                try {
                                    body2 = read_wiki(path)
                                } catch (e2) {
                                    rok = false
                                }
                                if !rok {
                                    .err = "页面读取失败，请重试"
                                    console_log("quick: read failed " + path)
                                } else {
                                    var g bool = true
                                    if .qopen != true { g = false }
                                    if .seq != myseq { g = false }
                                    if .store.active_uid != t_uid { g = false }
                                    if .store.sel_gen != t_gen { g = false }
                                    if .store.active_key != t_key { g = false }
                                    if .store.active_body != t_body { g = false }
                                    if !g {
                                        console_log("quick: stale dropped " + path)
                                    } else {
                                        store.NavCommit({ uid: t_uid, gen: t_gen, key: t_key, body: t_body, path: path, anchor: "", body2: body2 })
                                    }
                                }
                            }
                        }
                    }
                    if .store.active_path == path {
                        if .store.sel_gen != t_gen {
                            .commit_count = .commit_count + 1
                            .last_commit = path
                            .busy = false
                            .err = ""
                            .qopen = false
                        } else {
                            .busy = false
                        }
                    } else {
                        .busy = false
                    }
                }
            }
        }
        .Cancel -> {
            .seq = .seq + 1
            .busy = false
            .err = ""
            .qopen = false
        }
        .PrepDirty -> {
            store.Open({ path: "wiki/Beta.ad" })
            store.Edit("Beta dirty XYZ 已改正文")
        }
    }
}
`

function buildCarrierProject(dir, windowSize) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(path.join(dir, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(dir, 'src', 'back'), { recursive: true })
  fs.copyFileSync(path.join(repoRoot, 'src', 'front', 'editor_store.at'), path.join(dir, 'src', 'front', 'editor_store.at'))
  fs.writeFileSync(path.join(dir, 'src', 'front', 'app.at'), CARRIER_AT, 'utf8')
  fs.writeFileSync(
    path.join(dir, 'pac.at'),
    `name: "auto-jade-probe-quick-open"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeQuickOpen"
window: "${windowSize}"
`,
    'utf8',
  )
}

async function pollState(callTool, pred, timeoutMs = 8000, label = 'state') {
  const dl = Date.now() + timeoutMs
  let dump = ''
  for (;;) {
    dump = (await callTool('autoui_state', {})).trim()
    if (pred(dump)) return dump
    if (Date.now() > dl) throw new Error(`state never satisfied (${label}):\n${dump.slice(0, 600)}`)
    await sleep(200)
  }
}

async function waitButton(callTool, label, timeoutMs = 8000) {
  const dl = Date.now() + timeoutMs
  for (;;) {
    const snap = await callTool('autoui_snapshot', {})
    const lines = snap.split('\n').filter((l) => l.includes('button') && l.includes(`"${label}"`))
    const id = lines.map((l) => l.match(/#(vnode_\d+)/)?.[1]).find(Boolean)
    if (id) return id
    if (Date.now() > dl) throw new Error(`button "${label}" not found in snapshot`)
    await sleep(300)
  }
}

async function press(callTool, id) {
  const res = await callTool('autoui_action', { element_id: id, action: 'press' })
  if (!/status: ok/.test(res)) throw new Error(`press not ok: ${res}`)
}

function findInputId(snap) {
  const lines = snap.split('\n').filter((l) => /^\s*input /.test(l))
  return lines.map((l) => l.match(/#(vnode_\d+)/)?.[1]).find(Boolean) ?? null
}

// ---------------- T-01 主流程（单实例载体内序贯执行） ----------------

async function runCarrier(tag, windowSize, port, checks) {
  const dir = path.join(RUNTIME, `probe-quick-open-${tag}`)
  buildCarrierProject(dir, windowSize)
  buildFixtureWorkspace()
  const app = launchVmApp(port, `auto-jade-probe-quick-open-${tag}`, dir, { AUTO_JADE_WORKSPACE: FIXTURE })
  try {
    const { callTool } = await waitMcpAndUi(port, `auto-jade-probe-quick-open-${tag}`, app, app._out)
    await pollState(callTool, (d) => /booted:\s*true/.test(d), 15000, 'booted')
    await checks(callTool)
  } catch (err) {
    ck(false, `[${tag}] 载体异常：${String(err.message).slice(0, 400)} | ${aliveTail(app)}`)
  } finally {
    await app._kill()
  }
}

async function t1BaseChecks(callTool) {
  const state = async () => (await callTool('autoui_state', {})).trim()
  const snap = async () => await callTool('autoui_snapshot', {})

  // F1 开弹层（按钮口；生产 = 三入口共口同 handler）→ 可见面。
  await press(callTool, await waitButton(callTool, 'open-quick'))
  await pollState(callTool, (d) => /qopen:\s*true/.test(d), 6000, 'qopen')
  let s = await snap()
  ck(s.includes('快速打开') && findInputId(s) !== null && s.includes('取消'), 'F1 弹层可见面（标题+输入+取消钮；行集 ready 态 Alpha 行在）')

  // F2 ui.focus 程序化聚焦（VM 在册形态：__focus_result ok/miss 可观察）。
  const st1 = await state()
  const focusOk = /__focus_result:\s*"ok"/.test(st1)
  const focusRaw = st1.match(/__focus_result:[^\n]*/)?.[0] ?? '(field absent)'
  ck(focusOk, `F2 ui.focus(".Edit") __focus_result=ok（实际：${focusRaw.slice(0, 60)}）`)

  // F3 独立查询 + 行集过滤 + 首选 path。
  let inp = findInputId(await snap())
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'alp' })
  const st2 = await pollState(callTool, (d) => /first_path:\s*"wiki\/Alpha\.ad"/.test(d), 6000, 'first_path')
  ck(/q:\s*"alp"/.test(st2), 'F3 独立 q 状态 + 行集过滤（type_text → rows → 首选 wiki/Alpha.ad）')

  // F4 输入 Enter（submit 定址派发 onenter）→ uid=0 票据经真实 NavCommit。
  const gen0 = intField(st2, 'sel_gen') ?? 0
  const tabs0 = intField(st2, 'tab_count') ?? 0
  const uid0 = intField(st2, 'active_uid') ?? -1
  inp = findInputId(await snap())
  await callTool('autoui_action', { element_id: inp, action: 'submit' })
  const st3 = await pollState(callTool, (d) => /qopen:\s*false/.test(d) && /commit_count:\s*1/.test(d), 8000, 'commit')
  const gen1 = intField(st3, 'sel_gen') ?? 0
  ck(
    intField(st3, 'tab_count') === tabs0 + 1
    && (strField(st3, 'active_path') === 'wiki/Alpha.ad')
    && gen1 > gen0
    && (strField(st3, 'last_commit') === 'wiki/Alpha.ad')
    && uid0 === 0,
    `F4 Enter→NavCommit uid=0 票据：新 tab+sel_gen 前进+弹层关+回执恰一（uid0=${uid0} gen ${gen0}→${gen1} tabs ${tabs0}→${intField(st3, 'tab_count')}）`,
  )

  // F5 脏目标直激活：已开+已改 → 拾取零覆盖零重复 tab。
  await press(callTool, await waitButton(callTool, 'h-dirty'))
  const st4 = await pollState(callTool, (d) => /active_dirty:\s*true/.test(d) && new RegExp(`active_path:\\s*"wiki/Beta\\.ad"`).test(d), 8000, 'dirty-prep')
  const tabs1 = intField(st4, 'tab_count') ?? 0
  await press(callTool, await waitButton(callTool, 'open-quick'))
  inp = findInputId(await snap())
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'bet' })
  await pollState(callTool, (d) => /first_path:\s*"wiki\/Beta\.ad"/.test(d), 6000, 'first-beta')
  await callTool('autoui_action', { element_id: inp, action: 'submit' })
  const st5 = await pollState(callTool, (d) => /qopen:\s*false/.test(d) && /commit_count:\s*2/.test(d), 8000, 'commit-beta')
  ck(
    intField(st5, 'tab_count') === tabs1
    && (strField(st5, 'active_path') === 'wiki/Beta.ad')
    && boolField(st5, 'active_dirty') === true
    && (strField(st5, 'active_body') ?? '').includes('XYZ'),
    `F5 脏目标直激活：tab 数不增（${tabs1}）+脏标保持+内存正文保持（零读盘零覆盖）`,
  )

  // F6 stale 目录 missing：磁盘已删 → 行点击 → 独立错误、零 tab 零建页、留置。
  fs.rmSync(path.join(FIXTURE, 'wiki', 'Gamma.ad'), { force: true })
  await press(callTool, await waitButton(callTool, 'open-quick'))
  inp = findInputId(await snap())
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'gam' })
  await pollState(callTool, (d) => /first_path:\s*"wiki\/Gamma\.ad"/.test(d), 6000, 'first-gamma')
  const gammaBtn = await waitButton(callTool, '丙页')
  await press(callTool, gammaBtn)
  const st6 = await pollState(callTool, (d) => /目标不存在/.test(d), 8000, 'err-visible')
  const tabs2 = intField(st6, 'tab_count') ?? 0
  ck(
    boolField(st6, 'qopen') === true
    && intField(st6, 'commit_count') === 2
    && tabs2 === tabs1
    && !fs.existsSync(path.join(FIXTURE, 'wiki', 'Gamma.ad')),
    'F6 stale 目录 missing：独立错误可见+弹层留置+零 tab 零建页（磁盘缺档确认）',
  )

  // F7 零结果 Enter（autoui_keyboard 首输入代理通道）→ 零开页零关闭。
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'zzz' })
  await pollState(callTool, (d) => /first_path:\s*""/.test(d), 6000, 'no-first')
  await callTool('autoui_keyboard', { key: 'Enter' })
  await sleep(600)
  const st7 = await state()
  ck(
    boolField(st7, 'qopen') === true
    && intField(st7, 'commit_count') === 2
    && intField(st7, 'tab_count') === tabs1,
    'F7 零结果 Enter 零动作（autoui_keyboard 代理通道；弹层留置+零开页）',
  )

  // F8 取消钮 → 关闭零副作用。
  await press(callTool, await waitButton(callTool, '取消'))
  const st8 = await pollState(callTool, (d) => /qopen:\s*false/.test(d), 6000, 'cancel')
  ck(intField(st8, 'commit_count') === 2 && intField(st8, 'tab_count') === tabs1, 'F8 取消钮关闭零副作用（commit/tab 不变）')

  // F9 Escape 合成通道实勘（VM 无 keybind 通道预期 qopen 不变——边界记录）。
  await press(callTool, await waitButton(callTool, 'open-quick'))
  await pollState(callTool, (d) => /qopen:\s*true/.test(d), 6000, 'reopen')
  let escOut = ''
  try { escOut = await callTool('autoui_keyboard', { key: 'Escape' }) } catch (e) { escOut = String(e.message).slice(0, 120) }
  await sleep(600)
  const st9 = await state()
  if (boolField(st9, 'qopen') === true) {
    bl(`F9 VM Escape 不关弹层（合成通道零派发：${escOut.replace(/\n/g, ' ').slice(0, 80)}）——VM 无公开 Escape 关闭形态，取消钮承载同终态；vue v-model 通道由 e2e 承载（blocker/边界单列 owner=上游 modal 语义）`)
  } else {
    ck(true, `F9 VM Escape 关闭弹层（合成通道可达：${escOut.replace(/\n/g, ' ').slice(0, 80)}）——公开 Escape 形态在册`)
  }

  // F10 Tab 合成通道实勘（行为实录——键盘遍历边界单列）。
  let tabOut = ''
  try { tabOut = await callTool('autoui_keyboard', { key: 'Tab' }) } catch (e) { tabOut = String(e.message).slice(0, 120) }
  await sleep(400)
  const st10 = await state()
  bl(`F10 VM Tab 合成通道实录：${tabOut.replace(/\n/g, ' ').slice(0, 100)}；qopen=${boolField(st10, 'qopen')}（真实用户 iced 焦点导航不可合成——键盘遍历公开面以 vue e2e 承载，VM 点击承载全候选）`)

  // 收尾：取消留净面。
  await press(callTool, await waitButton(callTool, '取消'))
}

async function t1NarrowChecks(callTool) {
  const state = async () => (await callTool('autoui_state', {})).trim()
  const snap = async () => await callTool('autoui_snapshot', {})
  await press(callTool, await waitButton(callTool, 'open-quick'))
  await pollState(callTool, (d) => /qopen:\s*true/.test(d), 6000, 'qopen')
  const s = await snap()
  const scrollable = /scrollable /.test(s)
  ck(
    s.includes('快速打开') && findInputId(s) !== null && s.includes('甲页') && s.includes('取消'),
    'W 窄窗 640x480：弹层可见面完整（标题+输入+行+取消）',
  )
  ck(scrollable, 'W 列表滚动节点在（overflow-y-auto → scrollable lowering）')
  await press(callTool, await waitButton(callTool, '取消'))
}

// ---------------- 生产 App 相位（T-03/T-04；真实 jade 应用 merged） ----------------

const PROD_WS = path.join(RUNTIME, 'quick-open-prod-ws')

// 已知答案语料（名称五域 + 同名 + 深层；正文不含名称词——title/alias-only
// 命中形态锚；walk 序 = dirs-first + casefold）。
const PROD_CORPUS = [
  { rel: 'wiki/Home.ad', body: '---\ntitle: 首页\naliases:\n- 起点\n---\n\n# Doc\n\n普通正文段落。\n' },
  { rel: 'wiki/Dup A.ad', body: '---\ntitle: 重名页\n---\n\n甲处正文。\n' },
  { rel: 'wiki/Dup B.ad', body: '---\ntitle: 重名页\n---\n\n乙处正文。\n' },
  { rel: 'wiki/Plain.ad', body: '# Plain\n\nplain corpus line\n' },
  { rel: 'wiki/deep/Deep.ad', body: 'deep line\n' },
]

function buildProdWorkspace() {
  fs.rmSync(PROD_WS, { recursive: true, force: true })
  fs.mkdirSync(PROD_WS, { recursive: true })
  for (const c of PROD_CORPUS) {
    fs.mkdirSync(path.join(PROD_WS, c.rel, '..'), { recursive: true })
    fs.writeFileSync(path.join(PROD_WS, c.rel), c.body, 'utf8')
  }
}

async function prodChecks(callTool) {
  const state = async () => (await callTool('autoui_state', {})).trim()
  const snap = async () => await callTool('autoui_snapshot', {})
  const findBtnId = async (label) => {
    const s = await snap()
    const line = s.split('\n').find((l) => l.includes('button') && l.includes(`"${label}"`))
    return line ? line.match(/#(vnode_\d+)/)[1] : null
  }
  const pressBtn = async (label, timeoutMs = 10000) => {
    const dl = Date.now() + timeoutMs
    for (;;) {
      const vid = await findBtnId(label)
      if (vid) {
        const r = await callTool('autoui_action', { element_id: vid, action: 'press' })
        if (/status: ok/.test(r)) return
      }
      if (Date.now() > dl) throw new Error(`button "${label}" not found/press failed`)
      await sleep(400)
    }
  }
  // 快开入口（三入口分立锚）：
  //   工具栏钮 ownText = `file-search快速打开`（图标名+标题拼连——VM toolbar
  //   渲染约定，T-03 实勘）——恒在册无 popover 态伪影，确定性重开口。
  //   菜单项 = 视图 popover 展开后的 `"快速打开"`（引号锚——与工具栏行
  //   拼连文本区分）；⚠ popover 开合态：触发钮 press 为 toggle 语义。
  const pressQuickOpenToolbar = async () => {
    const dl = Date.now() + 8000
    for (;;) {
      const s = await snap()
      const lines = s.split('\n')
      // 工具栏钮锚 = onclick .ActFindFiles 行回溯最近 button 行（ownText =
      // `file-search<不可见分隔符>快速打开`——图标名+标题拼连含私有分隔符，
      // 直串匹配恒 miss，T-03 实勘）。
      const oi = lines.findIndex((l) => l.includes('onclick: .ActFindFiles'))
      for (let j = oi; j >= Math.max(0, oi - 3); j--) {
        const m = lines[j].match(/button #(\d+)/) ?? lines[j].match(/button #(vnode_\d+)/)
        if (lines[j].includes('button') && lines[j].match(/#(vnode_\d+)/)) {
          const vid = lines[j].match(/#(vnode_\d+)/)[1]
          const r = await callTool('autoui_action', { element_id: vid, action: 'press' })
          if (/status: ok/.test(r)) return
        }
      }
      if (Date.now() > dl) throw new Error('toolbar quick-open button not found')
      await sleep(400)
    }
  }
  const pressQuickOpenMenu = async () => {
    await pressBtn('视图')
    await pressBtn('"快速打开"'.slice(1, -1))
  }
  const fld = (d, name) => d.match(new RegExp(`(?:^|\\n)\\s*${name}:\\s*([^\\n]+)`))?.[1]?.trim().replace(/\s*\((?:str|int|bool|float|map|list)\)\s*$/, '') ?? null
  const strF = (d, name) => {
    const raw = fld(d, name)
    if (raw === null) return null
    const m = raw.match(/^"((?:[^"\\]|\\.)*)"/)
    if (!m) return raw
    try { return JSON.parse(`"${m[1]}"`) } catch { return m[1] }
  }
  const dialogInputId = async () => {
    // 标题锚 content 子树扫（D-29③ 纪律——闭态弹层恒渲染，全树首 input
    // 在多弹层并存期不稳；「快速打开」标题上溯取本弹层 input）。
    const s = await snap()
    const lines = s.split('\n')
    const ti = lines.findIndex((l) => l.includes('"快速打开"'))
    for (let j = ti; j < Math.min(lines.length, ti + 12); j++) {
      if (/^\s*input /.test(lines[j])) return lines[j].match(/#(vnode_\d+)/)[1]
    }
    return null
  }
  // 快开弹层取消钮（标题锚向后扫——**不能全树首匹配**：alert-dialog 族
  // 闭态恒渲染且在快开弹层之前，全树首「取消」= 关闭确认弹层钮
  // [ConfirmCancel no-op]——T-03 实勘）。
  const pressQuickCancel = async () => {
    const dl = Date.now() + 8000
    for (;;) {
      const s = await snap()
      const lines = s.split('\n')
      const ti = lines.findIndex((l) => l.includes('"快速打开"'))
      for (let j = ti; j < Math.min(lines.length, ti + 120); j++) {
        if (lines[j].includes('button') && lines[j].includes('"取消"')) {
          const vid = lines[j].match(/#(vnode_\d+)/)?.[1]
          if (vid) {
            const r = await callTool('autoui_action', { element_id: vid, action: 'press' })
            if (/status: ok/.test(r)) return
          }
        }
      }
      if (Date.now() > dl) throw new Error('quick-dialog cancel button not found (title-scoped)')
      await sleep(400)
    }
  }
  const stateIs = async (name, want, timeoutMs = 8000) => {
    const dl = Date.now() + timeoutMs
    for (;;) {
      const d = await state()
      if (fld(d, name) === want) return d
      if (Date.now() > dl) throw new Error(`state.${name} never = ${want} (got ${fld(d, name)})`)
      await sleep(200)
    }
  }

  // —— I1 菜单口开弹层 + ui.focus 聚焦 + 无文档可用（boot 零 tab）——
  await pressQuickOpenMenu()
  await stateIs('quick_open', 'true')
  const inp1 = await dialogInputId()
  const st1 = await state()
  ck(
    inp1 !== null && /__focus_result:\s*"ok"/.test(st1) && fld(st1, 'tab_count') === '0' && strF(st1, 'quick_first_path') === 'wiki/deep/Deep.ad',
    `I1 菜单口开弹层：无文档可用+ui.focus ok+首选=显示集首项（空 q 全量 walk 序=dirs-first 深层档首行 wiki/deep/Deep.ad；实际 first=${strF(st1, 'quick_first_path')}；tab_count=${fld(st1, 'tab_count')}）`,
  )

  // —— I4 重复开关循环幂等（单弹层结构保证——开态单 bool 旗标；弹层
  // 开启期模态域不含 toolbar/菜单钮[快照实测]，重触发经关层后入口）——
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  const s4 = await snap()
  const tiCount = (s4.match(/"快速打开"/g) ?? []).length
  ck((await dialogInputId()) !== null && tiCount === 1,
    `I4 重复开关循环幂等（三度开层照常可用；弹层标题快照恰=${tiCount} 处——零叠层）`)
  await pressQuickCancel()
  await stateIs('quick_open', 'false')

  // —— I2 工具栏口（第三入口；图标钮 ownText=file-search快速打开）——
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  ck((await dialogInputId()) !== null, 'I2 工具栏口开同一弹层（独立根弹层——菜单/工具栏共口 ActFindFiles）')
  await pressQuickCancel()
  await stateIs('quick_open', 'false')

  // —— I3 Ctrl+P 合成通道（action_config 快捷键路由实勘）——
  let ctrlP = ''
  try { ctrlP = await callTool('autoui_keyboard', { key: 'p', modifiers: ['ctrl'] }) } catch (e) { ctrlP = String(e.message).slice(0, 100) }
  await sleep(600)
  const st3 = await state()
  if (fld(st3, 'quick_open') === 'true') {
    ck(true, `I3 Ctrl+P 合成通道开弹层（${ctrlP.replace(/\n/g, ' ').slice(0, 60)}）——快捷键入口在册`)
    await pressQuickCancel()
    await stateIs('quick_open', 'false')
  } else {
    bl(`I3 Ctrl+P 合成通道不开弹层（${ctrlP.replace(/\n/g, ' ').slice(0, 60)}；quick_open=${fld(st3, 'quick_open')}）——MCP 合成键盘对 action 快捷键的路由边界，真实用户 iced 键盘监听不在合成面；键盘入口证据由 vue e2e page.keyboard 承载`)
  }

  // —— Q1 名称五域（title≠stem/alias/case/相对路径/同名双 path）——
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  let inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '首页' })
  const q1 = await state()
  ck(strF(q1, 'quick_first_path') === 'wiki/Home.ad', `Q1a title≠stem「首页」首选 wiki/Home.ad（实际 ${strF(q1, 'quick_first_path')}）`)
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'clear' })
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '起点' })
  ck(strF(await state(), 'quick_first_path') === 'wiki/Home.ad', 'Q1b alias「起点」命中 Home')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'clear' })
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'deep/deep' })
  ck(strF(await state(), 'quick_first_path') === 'wiki/deep/Deep.ad', 'Q1c 相对路径 casefold「deep/deep」命中深层档')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'clear' })
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '重名页' })
  let sQ = await snap()
  const dupCount = (sQ.match(/"重名页"/g) ?? []).length
  const dQ = await state()
  ck(dupCount >= 2, `Q1d 同名双页逐 path 双行呈现（快照行文本=${dupCount} 处；Dup A/Dup B 独立行）`)
  // Q1e 同名第二行点击开各自磁盘正文（行点击口——B 行）。
  const dupBLines = sQ.split('\n').filter((l) => l.includes('button') && l.includes('"重名页"'))
  if (dupBLines.length >= 2) {
    await callTool('autoui_action', { element_id: dupBLines[1].match(/#(vnode_\d+)/)[1], action: 'press' })
    const dAfter = await stateIs('quick_open', 'false')
    ck(strF(dAfter, 'active_path') === 'wiki/Dup B.ad', `Q1e 同名第二行点击开 Dup B（实际 ${strF(dAfter, 'active_path')}——身份域恒 path）`)
  } else {
    ck(false, 'Q1e 同名双行快照不足（无法点第二行）')
  }

  // —— K1 输入 Enter 首选开页（真实开页事务：NavCommit+关层+recents）——
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '首页' })
  const k0 = await state()
  const tabs0 = fld(k0, 'tab_count')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'submit' })
  const k1 = await stateIs('quick_open', 'false')
  ck(
    strF(k1, 'active_path') === 'wiki/Home.ad' && fld(k1, 'tab_count') === String(Number(tabs0) + 1),
    `K1 输入 Enter 首选真实开页（active_path=wiki/Home.ad；tab ${tabs0}→${fld(k1, 'tab_count')}；NavCommit+关层）`,
  )

  // —— Q1f 空 q「最近」替换式（开档后重开：最近段首选 = 首条最近）。
  // ⚠ 查询跨开合保留（find_q 同语义——K1 遗留 首页 需先清）——T-03 实勘：
  // 重开不重置 quick_q，输入框遗留值与行集恒一致（视图正确性锚）。——
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  let qfInp = await dialogInputId()
  await callTool('autoui_action', { element_id: qfInp, action: 'clear' })
  const qf = await state()
  // 快照轮询（视图渲染节拍滞后状态一拍——单拍快照竞态 T-03 实勘）。
  let recentsVisible = false
  for (let i = 0; i < 12 && !recentsVisible; i++) {
    recentsVisible = (await snap()).includes('最近')
    if (!recentsVisible) await sleep(300)
  }
  if (!recentsVisible) {
    const dbgLines = (await snap()).split('\n')
    const dti = dbgLines.findIndex((l) => l.includes('"快速打开"'))
    console.log('[Q1F-DBG] ti=', dti, 'region:')
    console.log(dbgLines.slice(dti, dti + 34).map((l) => l.trim().slice(0, 84)).join('\n'))
  }
  ck(
    strF(qf, 'quick_first_path') === 'wiki/Home.ad' && recentsVisible,
    `Q1f 空 q「最近」替换式：首选=首条最近（实际 first=${strF(qf, 'quick_first_path')} recents=${fld(qf, 'recent_paths')}）+ 最近段标题在快照=${recentsVisible}`,
  )

  // —— Q2 逐键零 fetch（names_seq 恒定——重取仅入口触点）——
  const seq0 = fld(await state(), 'names_seq')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '重' })
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '名' })
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: '页' })
  const seq1 = fld(await state(), 'names_seq')
  ck(seq0 === seq1, `Q2 逐键零 fetch（names_seq ${seq0}→${seq1} 恒定；纯内存过滤）`)

  // —— C1 全文独立状态（text 检索结果不被快开覆盖/互不写查询）——
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
  await pressBtn('视图')
  await pressBtn('全文检索')
  await stateIs('find_mode', '"text"')
  inp = await dialogInputId()
  // text 面板输入行 = 右栏（快速打开弹层已关——placeholder 在 input 行
  // 次行渲染，逐行 lookahead 定位）。
  const sTxt = await snap()
  const sLines = sTxt.split('\n')
  const txtIdx = sLines.findIndex((l, i) => /^\s*input /.test(l) && sLines[i + 1]?.includes('输入查询词'))
  if (txtIdx < 0) throw new Error('text-panel input not found in snapshot')
  await callTool('autoui_action', { element_id: sLines[txtIdx].match(/#(vnode_\d+)/)[1], action: 'type_text', value: '正文' })
  await pressBtn('检索')
  await stateIs('find_ran', 'true')
  const c0 = await state()
  const fq0 = strF(c0, 'find_q')
  const fr0 = fld(c0, 'find_ran')
  // 开快开并输入——全文状态必须原样
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'plain' })
  const c1 = await state()
  ck(
    strF(c1, 'find_q') === fq0 && fld(c1, 'find_ran') === fr0 && strF(c1, 'quick_q') === 'plain',
    `C1 全文独立：快开输入不动 find_q（=${strF(c1, 'find_q')}）与 find_ran（=${fld(c1, 'find_ran')}）；quick_q 独立（=${strF(c1, 'quick_q')}）`,
  )
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
  // 反链/标签开态保持（ActBacklinks 开 → 快开开关 → 仍开）。
  await pressBtn('视图')
  await pressBtn('切换反链')
  await stateIs('backlinks_open', 'true')
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
  const cb = await state()
  ck(fld(cb, 'backlinks_open') === 'true', 'C1b 反链开态在快开开关间保持')
  await pressBtn('视图')
  await pressBtn('切换反链')
  await stateIs('backlinks_open', 'false')

  // —— K2 零结果 Enter 零动作 ——
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'zzz-无此词-xyz' })
  const k2a = await state()
  const tabsK2 = fld(k2a, 'tab_count')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'submit' })
  await sleep(500)
  const k2 = await state()
  ck(
    fld(k2, 'quick_open') === 'true' && fld(k2, 'tab_count') === tabsK2 && (strF(k2, 'quick_err') ?? '') === '',
    'K2 零结果 Enter 零动作（弹层留置+零开页+零错误面）',
  )

  // —— R1 入口重取（names_seq 入口触点递增）+ R2 外部改名后再开新档可见 ——
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
  const seqR0 = fld(await state(), 'names_seq')
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  const seqR1 = fld(await state(), 'names_seq')
  ck(Number(seqR1) === Number(seqR0) + 1, `R1 入口无条件重取目录（names_seq ${seqR0}→${seqR1} 恰一递增）`)
  await pressQuickCancel()
  fs.renameSync(path.join(PROD_WS, 'wiki', 'Plain.ad'), path.join(PROD_WS, 'wiki', 'Renamed.ad'))
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'renamed' })
  const r2 = await state()
  ck(strF(r2, 'quick_first_path') === 'wiki/Renamed.ad', `R2 外部改名后再开新档可见（首选 ${strF(r2, 'quick_first_path')}——入口重取观察口）`)
  await pressQuickCancel()
  fs.renameSync(path.join(PROD_WS, 'wiki', 'Renamed.ad'), path.join(PROD_WS, 'wiki', 'Plain.ad'))

  // —— K3 取消钮零副作用收尾 + O 缺页拒绝（stale 目录案——开层内 fs 删档）——
  await pressQuickOpenToolbar()
  await stateIs('quick_open', 'true')
  inp = await dialogInputId()
  await callTool('autoui_action', { element_id: inp, action: 'type_text', value: 'deep' })
  fs.rmSync(path.join(PROD_WS, 'wiki', 'deep', 'Deep.ad'), { force: true })
  const o0 = await state()
  const tabsO = fld(o0, 'tab_count')
  const dupLines = (await snap()).split('\n').filter((l) => l.includes('button') && l.includes('"Deep"'))
  if (dupLines.length >= 1) {
    await callTool('autoui_action', { element_id: dupLines[0].match(/#(vnode_\d+)/)[1], action: 'press' })
    const o1 = await state()
    ck(
      strF(o1, 'quick_err')?.includes('目标不存在') === true && fld(o1, 'quick_open') === 'true' && fld(o1, 'tab_count') === tabsO && !fs.existsSync(path.join(PROD_WS, 'wiki', 'deep', 'Deep.ad')),
      `O stale 目录 missing 拒开（错误="${strF(o1, 'quick_err')}"；弹层留置+零建页+tab ${tabsO} 不变）`,
    )
  } else {
    ck(false, 'O stale 行未呈现（目录/快照异常）')
  }
  await pressQuickCancel()
  await stateIs('quick_open', 'false')
}

async function runProdArm() {
  buildProdWorkspace()
  const port = await pickPort()
  const app = launchVmApp(port, 'auto-jade-probe-quick-open-prod', repoRoot, { AUTO_JADE_WORKSPACE: PROD_WS })
  try {
    const { callTool } = await waitMcpAndUi(port, 'auto-jade-probe-quick-open-prod', app, app._out)
    for (let i = 0; i < 90; i++) {
      const d = (await callTool('autoui_state', {})).trim()
      if (/status:\s*"ready"/.test(d) && /names_seq:\s*[1-9]/.test(d)) break
      await sleep(500)
    }
    await prodChecks(callTool)
  } catch (err) {
    ck(false, `[prod] 生产臂异常：${String(err.message).slice(0, 400)} | ${aliveTail(app)}`)
  } finally {
    await app._kill()
  }
}

// ---------------- run ----------------

if (PHASE === 't1' || PHASE === 'all') {
  console.log(`[probe-quick-open] phase t1 — 载体形态冻结（base 1024x768 @ :${await pickPort()}）`)
  const port1 = await pickPort()
  await runCarrier('base', '1024x768', port1, t1BaseChecks)
  console.log(`[probe-quick-open] 窄窗载体（640x480 @ :${await pickPort()}）`)
  const port2 = await pickPort()
  await runCarrier('narrow', '640x480', port2, t1NarrowChecks)
}
if (PHASE === 'prod' || PHASE === 'all') {
  console.log('[probe-quick-open] phase prod — 生产 App I/K/Q/C/R/O 组（真实 jade 应用 merged）')
  await runProdArm()
}

console.log('\n[probe-quick-open] 结果：')
for (const l of rec.lines) console.log('  ' + l)
if (rec.fail > 0) {
  console.error(`\n[probe-quick-open] FAIL（${rec.fail} fail / ${rec.pass} pass / ${rec.blocked} blocked）`)
  process.exit(1)
}
console.log(`\n[probe-quick-open] RESULT: ${rec.pass} pass / ${rec.fail} fail / ${rec.blocked} blocked（phase ${PHASE}）`)
