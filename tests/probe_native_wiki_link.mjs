#!/usr/bin/env node
// probe_native_wiki_link.mjs — PLAN-037 原生正文内链探针（T-02 解锁联验 +
// T-03 N/O/P/S + T-04 M/F）。上游供给=auto-lang PLAN-732（archived/
// delivered；公开契约=docs/specs/auto-lang/ui/design/autodown-wikilink.md）。
//
//   指纹臂    auto.exe 版本/SHA（须含供给：≥ v0.4.2-2650-gd5215b477）、
//            auto-lang rev/732 交付 commit、auto-jade HEAD。
//   N 臂      真实 auto-jade 应用 merged（cwd=仓根 + AUTO_JADE_WORKSPACE fixture）：
//            MCP editor_drag 单点（MousePressed→Released 直经生产
//            core.handle_input 完整点击门——SD-01 §3/§6 press+release=语义
//            完整点击）逐链接真实点击→目标页打开；press-only（门不闭合）/
//            拖选(>4px slop)/非链接/围栏 四类阴性；nav_seq 恰一增量；
//            锚点仅说明。
//   O 臂      双同正文编辑器薄载体（keys edA/edB）：各发各 handler——
//            结构性 per-instance origin（K-02 冻结）真实链路反例。
//   P 臂      真实键入脏源后点击链接：源内存正文/磁盘字节保持；已开
//            dirty 目标激活零覆盖。
//   S 臂      merged 消费同步无真实等待窗；split 载体等待窗验证被
//            F-24-2 阻断（在录）——分列 owner，不冒称。
//   M/F 臂    缺页确认（真实弹层取消/创建）、错误可见（T-04）。
//
// 点击节律注记：core CLICK_TIMING=400ms（core.rs:67）——完整点击尝试间
// 必须 >400ms，否则多击节律 single=false 拒激活（本探针 550ms 间隔）。
// 块 y 带先经 press-only（__mcp_click 纯观察建焦）读 focus 映射，再在带内
// 全点击扫描 x——惰性未命中=caret 落点。编辑器文本把 wikilink 内文脱括号
// 渲染（link span 文本=inner 原文；代码域 literal 保留）。
// 输入通道注记：__mcp_click=press-only（ghost 落点，门不闭合——阴性锚）；
// editor_drag 单点=press+release 经同一 core 门（上游 SD-01 §6 明示语义
// 完整点击、非通道泄漏）；iced OS 事件循环本体由上游
// plan732_real_iced_events_* 生产事件泵证据覆盖（指纹绑交付回执）。
//
// 结果标签：PASS / FAIL（计失败）/ BLOCKED（owner/重入条件在案）。
// 用法（仓根）：node tests/probe_native_wiki_link.mjs [--phase all]

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const NATIVE_WS = path.join(RUNTIME, 'native-wiki-link-ws')
const O_PORT = await pickPort()
const N_PORT = await pickPort()

const argOf = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const PHASE = argOf('--phase') ?? 'all'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase()

const rec = { pass: 0, fail: 0, blocked: 0, lines: [] }
const ck = (okFlag, label) => {
  rec[okFlag ? 'pass' : 'fail']++
  rec.lines.push(`${okFlag ? 'PASS' : 'FAIL'}  ${label}`)
  if (!okFlag) console.log(`  [FAIL] ${label}`)
}
const ok = (label) => {
  rec.pass++
  rec.lines.push(`PASS  ${label}`)
}
const bl = (label) => {
  rec.blocked++
  rec.lines.push(`BLOCKED  ${label}`)
  console.log(`  [BLOCKED] ${label}`)
}

// ---------------- MCP 客户端（同族配方 probe_wiki_link_navigation） ----------------

function makeClient(port) {
  let nextId = 1
  const rpc = async (method, params) => {
    // 网络层重试（KNOWN-DEBT P737-D2：MCP 偶发连接复位、应用存活——300ms
    // 退避 3 次；工具级 isError/HTTP 状态错误不重试，照实抛出）。
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
      const err = new Error(`tool ${name} failed: ${msg}`)
      err.toolError = true
      throw err
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
    try { spawnSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { try { app.kill() } catch { /* 已退出 */ } }
    await sleep(900)
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

const isEditorLine = (l) => /^\s*(textarea |autodown_editor |AutodownEditor )/.test(l)
const vnodeIdOf = (l) => l.match(/#(vnode_\d+)/)?.[1] ?? null

// ---------------- fixture 工作区 ----------------

const SRC_BODY = [
  '[[Goals]]',
  '',
  '[[目标页]]',
  '',
  '[[别名页]]',
  '',
  '[[Goals#sec-x]]',
  '',
  '[[幽灵页]]',
  '',
  '普通正文段落，无链接内容。',
  '',
  '[外部链接](https://example.com) 不触发 wiki 导航。',
  '',
  '```text',
  '[[围栏页]]',
  '```',
  '',
].join('\n')

function buildFixtureWorkspace() {
  fs.rmSync(NATIVE_WS, { recursive: true, force: true })
  fs.mkdirSync(path.join(NATIVE_WS, 'wiki'), { recursive: true })
  fs.writeFileSync(path.join(NATIVE_WS, 'wiki', 'Src.ad'), SRC_BODY, 'utf8')
  fs.writeFileSync(
    path.join(NATIVE_WS, 'wiki', 'Goals.ad'),
    '# Goals\n\n目标内容英文页。\n\n## sec-x\n\n锚点节内容。\n',
    'utf8',
  )
  fs.writeFileSync(path.join(NATIVE_WS, 'wiki', '目标页.ad'), '目标页正文内容。\n', 'utf8')
  fs.writeFileSync(
    path.join(NATIVE_WS, 'wiki', 'AliasTarget.ad'),
    // auto-jade page_fm_list 读块式列表（aliases: + "- 项"）——flow list 不识别。
    '---\ntitle: 别名目标\naliases:\n  - 别名页\n---\n\n别名目标页正文。\n',
    'utf8',
  )
}

// ---------------- 应用侧助手 ----------------

function makeHelpers(callTool) {
  const snapshot = async () => await callTool('autoui_snapshot', {})
  const editorId = async () => {
    const snap = await snapshot()
    for (const l of snap.split('\n')) {
      if (isEditorLine(l)) {
        const id = vnodeIdOf(l)
        if (id) return id
      }
    }
    return null
  }
  const editorState = async () => {
    const id = await editorId()
    if (!id) return null
    const dump = await callTool('autoui_editor_state', { element_id: id })
    try { return JSON.parse(dump) } catch { return { raw: dump } }
  }
  const editorText = async () => {
    const st = await editorState()
    return st === null ? null : (st.text ?? st.raw ?? null)
  }
  const editorFocus = async () => {
    const st = await editorState()
    return st === null ? null : (st.focus ?? null)
  }
  const state = async () => (await callTool('autoui_state', {})).trim()
  const findBtn = (snap, text) => {
    const lines = snap.split('\n').filter((l) => l.includes('button') && l.includes(`"${text}"`))
    return lines.map((l) => l.match(/#(vnode_\d+)/)?.[1]).find(Boolean) ?? null
  }
  // 文件树：workspace → 文件夹按钮（"wiki"）→ 页面按钮（label=stem 或 fm
  // title）。先保证展开（已展开零操作），再按候选 label 找页面按钮；树
  // 异步装配（Init→后端树）——整段查找带截止重试。
  const openPage = async (labels, wantTextProbe, timeoutMs = 15000) => {
    const cands = Array.isArray(labels) ? labels : [labels]
    const dl = Date.now() + timeoutMs
    let pageId = null
    let expanded = false
    let misses = 0
    while (!pageId) {
      const snap = await snapshot()
      pageId = cands.map((c) => findBtn(snap, c)).find(Boolean) ?? null
      if (pageId) break
      misses++
      const folder = findBtn(snap, 'wiki')
      if (folder && (!expanded || misses % 4 === 0)) {
        // 首次展开；之后偶发重按兜底（树装配期默认折叠，重复按防折叠态漂移）。
        await callTool('autoui_action', { element_id: folder, action: 'press' })
        expanded = true
      }
      if (Date.now() > dl) throw new Error(`tree page "${cands.join('/')}" not found in snapshot`)
      await sleep(500)
    }
    await callTool('autoui_action', { element_id: pageId, action: 'press' })
    const dl2 = Date.now() + timeoutMs
    let lastPress = Date.now()
    let repressed = 0
    for (;;) {
      const t = await editorText()
      if (t !== null && wantTextProbe.every((p) => t.includes(p))) return t
      // F-037-R1 视面滞后形态：编辑后首次换页视面停在前页（store 已切）——
      // 同按钮重按制造第二次切换可恢复；每 ~7s 补按一次（≤2 次）。
      if (repressed < 2 && Date.now() - lastPress > 7000) {
        await callTool('autoui_action', { element_id: pageId, action: 'press' })
        lastPress = Date.now()
        repressed++
      }
      if (Date.now() > dl2) throw new Error(`page "${cands.join('/')}" text never reached probe:\n${(t ?? '').slice(0, 240)}`)
      await sleep(250)
    }
  }
  // 完整点击（press+release 同点——生产 core.handle_input 完整点击门）。
  // 节律：与上次尝试至少隔 550ms（CLICK_TIMING=400ms 多击判窗）。
  const fullClick = async (id, x, y) => {
    await sleep(560)
    return callTool('autoui_action', { element_id: id, action: 'editor_drag', value: `${x},${y}` })
  }
  // press-only（门不闭合——阴性锚/建焦观察）。
  const pressOnly = async (id, x, y) =>
    callTool('autoui_action', { element_id: id, action: 'click', value: `${x},${y}` })
  // 拖选（跨链接多点——>4px slop 取消）。
  const dragAcross = async (id, x0, y0, x1, y1) =>
    callTool('autoui_action', { element_id: id, action: 'editor_drag', value: `${x0},${y0};${x1},${y1};${x1},${y1}` })
  // 块 y 带映射：press-only 纵扫读 focus（惰性——只建焦不激活）。
  const mapBlocks = async (id, maxY = 320) => {
    const byFocus = new Map()
    for (let y = 6; y <= maxY; y += 5) {
      await pressOnly(id, 30, y)
      const f = await editorFocus()
      if (f !== null && !byFocus.has(f)) byFocus.set(f, y)
    }
    return byFocus
  }
  // 带内链接扫描：y=块 y 带±邻域，x 横扫；命中判据=wantProbe 文本出现。
  // 激活→handler→NavCommit→视图换页跨数帧（R-2 栅栏只保动作应用不保
  // 导航回执）——每点点击后短轮询判据，防"已激活计为未命中"。
  // 判据分两层：navOk=store active_path 切到目标（应用权威态）；viewSwapped=
  // 编辑器视面文本换页（用户可见面）。二者在"键入后导航"序列可分叉
  // （F-037-R1：NavCommit 后视面刷新缺失——上游 VM 桥 dirty 传播，另录）。
  const storeField = async (k) => {
    const s = await state()
    const m = s.match(new RegExp(k + `:\\s*([^\\n]+)`))
    return m ? m[1].trim() : null
  }
  const scanLink = async (id, yBand, wantProbe, opts = {}) => {
    const xs = opts.xs ?? [4, 6, 10, 14, 18, 22, 26, 30, 36, 44, 52]
    const ys = []
    for (let dy = -4; dy <= 8; dy += 4) ys.push(yBand + dy)
    for (const x of xs) {
      for (const y of ys) {
        await fullClick(id, x, y)
        const dl = Date.now() + 1200
        let navOk = false
        let viewSwapped = false
        for (;;) {
          if (!navOk && opts.wantPath) {
            const ap = await storeField('active_path')
            if (ap !== null && ap.includes(opts.wantPath)) navOk = true
          }
          const t = await editorText()
          if (t !== null && wantProbe.every((p) => t.includes(p))) viewSwapped = true
          if (navOk && (viewSwapped || !opts.wantPath)) return { x, y, navOk, viewSwapped }
          if (navOk && Date.now() > dl - 600) return { x, y, navOk, viewSwapped }
          if (!navOk && Date.now() > dl) break
          await sleep(200)
        }
      }
    }
    throw new Error(`link not found by scan (y=${yBand}, probe=${JSON.stringify(wantProbe)})`)
  }
  return { snapshot, editorId, editorText, editorFocus, editorState, state, storeField, findBtn, openPage, fullClick, pressOnly, dragAcross, mapBlocks, scanLink }
}

// ---------------- 指纹臂 ----------------

function fingerprintArm() {
  console.log('\n[probe-native-wiki-link] 指纹臂：')
  const v = spawnSync(AUTO_EXE, ['--version'], { encoding: 'utf8', timeout: 20000 })
  const ver = ((v.stdout ?? '') + (v.stderr ?? '')).trim().split('\n')[0] || `exit ${v.status}`
  let shaVal = 'unavailable'
  try { shaVal = sha(AUTO_EXE) } catch { /* 缺文件 */ }
  const autoJadeHead = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).stdout.trim()
  const langHead = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: 'D:/autostack/auto-lang', encoding: 'utf8' }).stdout.trim()
  rec.fingerprints = { auto_exe_version: ver, auto_exe_sha: shaVal, auto_jade_head: autoJadeHead, auto_lang_head: langHead }
  for (const [k, val] of Object.entries(rec.fingerprints)) console.log(`  ${k} = ${String(val).slice(0, 100)}`)
  const m = ver.match(/v0\.4\.2-(\d+)-g([0-9a-f]+)/)
  ck(m !== null && Number(m[1]) >= 2650, `N0 binary 含供给基线（≥v0.4.2-2650-gd5215b477，实测 ${ver}）`)
}

// ---------------- N 臂（真实应用 merged 真实点击） ----------------

async function nativeArm() {
  console.log('\n[probe-native-wiki-link] N 臂（真实应用 merged 真实点击）：')
  buildFixtureWorkspace()
  const app = launchVmApp(N_PORT, 'auto-jade-probe-native-wiki-link', repoRoot, { AUTO_JADE_WORKSPACE: NATIVE_WS })
  try {
    const { callTool } = await waitMcpAndUi(N_PORT, 'auto-jade-probe-native-wiki-link', app, app._out)
    const H = makeHelpers(callTool)
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    ok('N1 真实应用 boot+开档（AUTO_JADE_WORKSPACE fixture；Src.ad 经 filetree 打开）')
    const edId = await H.editorId()
    if (!edId) throw new Error('editor vnode not found in snapshot')
    const blocks = await H.mapBlocks(edId, 320)
    rec.n_block_map = [...blocks.entries()]
    const yOf = (k) => {
      const y = blocks.get(k)
      if (y === undefined) throw new Error(`block ${k} y-band not mapped: ${JSON.stringify([...blocks.entries()])}`)
      return y
    }
    const st0 = await H.state()
    const seq0 = intField(st0, 'nav_seq') ?? 0

    // N2 英文链接 [[Goals]] → Goals.ad。
    const hit1 = await H.scanLink(edId, yOf(0), ['目标内容英文页'], { wantPath: 'wiki/Goals.ad' })
    const st1 = await H.state()
    const seq1 = intField(st1, 'nav_seq') ?? 0
    ck(hit1.navOk && seq1 - seq0 === 1, `N2 英文链接真实点击→Goals.ad 提交（${hit1.x},${hit1.y}；nav_seq +${seq1 - seq0} 恰一；store active_path 判据）`)
    ck(hit1.viewSwapped, `N2b 编辑器视面已换页（Goals 内容可见）`)

    // N3 中文链接。
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    const hit2 = await H.scanLink(edId, yOf(1), ['目标页正文内容'], { wantPath: 'wiki/目标页.ad' })
    ck(hit2.navOk, `N3 中文链接真实点击→目标页.ad 提交（${hit2.x},${hit2.y}）`)

    // N4 别名链接（frontmatter alias——四级第二级）。
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    const hit3 = await H.scanLink(edId, yOf(2), ['别名目标页正文'], { wantPath: 'wiki/AliasTarget.ad' })
    ck(hit3.navOk, `N4 别名链接真实点击→AliasTarget.ad 提交（${hit3.x},${hit3.y}）`)

    // N5 带锚链接——开页+锚点仅说明（不定位）。
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    const hit4 = await H.scanLink(edId, yOf(3), ['锚点节内容'], { wantPath: 'wiki/Goals.ad' })
    const snapAfterAnchor = await H.snapshot()
    ck(hit4.navOk && /暂不支持定位|不支持定位/.test(snapAfterAnchor), `N5 带锚链接真实点击→Goals.ad 提交+锚点仅说明（${hit4.x},${hit4.y}；状态栏提示在快照）`)

    // N6 阴性组。
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    const seqB = intField(await H.state(), 'nav_seq') ?? 0
    await H.pressOnly(edId, 20, yOf(0))
    await sleep(500)
    const tPress = await H.editorText()
    const seqP = intField(await H.state(), 'nav_seq') ?? 0
    ck(tPress !== null && tPress.includes('普通正文段落') && seqP === seqB, 'N6a press-only（__mcp_click 门不闭合）零导航——阴性锚')

    await H.dragAcross(edId, 6, yOf(0), 170, yOf(0) + 30)
    await sleep(500)
    const tDrag = await H.editorText()
    const seqD = intField(await H.state(), 'nav_seq') ?? 0
    ck(tDrag !== null && tDrag.includes('普通正文段落') && seqD === seqB, 'N6b 拖选跨链接（>4px slop）零导航')

    await H.fullClick(edId, 30, yOf(5))
    await sleep(500)
    const tPlain = await H.editorText()
    const seqPl = intField(await H.state(), 'nav_seq') ?? 0
    ck(tPlain !== null && tPlain.includes('普通正文段落') && seqPl === seqB, 'N6c 非链接正文真实点击零导航（nav_seq 零增量）')

    // N7 围栏阴性（literal 保留+零导航）。
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    const seqF0 = intField(await H.state(), 'nav_seq') ?? 0
    let fenceNav = false
    if (blocks.has(7)) {
      await H.fullClick(edId, 30, yOf(7))
      const t = await H.editorText()
      fenceNav = !(t !== null && t.includes('普通正文段落'))
    }
    const seqF = intField(await H.state(), 'nav_seq') ?? 0
    ck(!fenceNav && seqF === seqF0, 'N7 围栏内 [[围栏页]] 真实点击零导航（代码域零区间）')
  } catch (err) {
    ck(false, `N 臂载体异常：${String(err.message).slice(0, 300)} | ${aliveTail(app)}`)
  } finally {
    await app._kill()
  }
}

// ---------------- O 臂（双实例 origin 薄载体） ----------------

function makeOriginAt() {
  return `widget App {
    msg {
        RecA(str, str),
        RecB(str, str),
    }
    model {
        var a_n int = 0
        var b_n int = 0
        var a_t str = ""
        var a_a str = ""
        var b_t str = ""
        var b_a str = ""
    }
    view {
        col (style: "h-full w-full") {
            autodown_editor (key: "edA", final: true, style: "h-24 w-full") {
                content: "甲编辑：[[靶页]]"
                on "open-wiki-link": .RecA
            }
            autodown_editor (key: "edB", final: true, style: "h-24 w-full") {
                content: "乙编辑：[[靶页]]"
                on "open-wiki-link": .RecB
            }
        }
    }
    on {
        .RecA(t, a) -> {
            .a_n = .a_n + 1
            .a_t = t
            .a_a = a
        }
        .RecB(t, a) -> {
            .b_n = .b_n + 1
            .b_t = t
            .b_a = a
        }
    }
}
`
}

async function originArm() {
  console.log('\n[probe-native-wiki-link] O 臂（双同正文实例 origin 隔离）：')
  const PROBE_DIR = path.join(RUNTIME, 'native-wiki-link-origin')
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), makeOriginAt(), 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "auto-jade-probe-native-origin"\nversion: "0.1.0"\nscene: "ui"\nrender: ["vm"]\ntitle: "ProbeNativeOrigin"\nwindow: "900x420"\n`,
    'utf8',
  )
  const app = launchVmApp(O_PORT, 'auto-jade-probe-native-origin', PROBE_DIR, { AUTO_JADE_WORKSPACE: NATIVE_WS })
  try {
    const { callTool } = await waitMcpAndUi(O_PORT, 'auto-jade-probe-native-origin', app, app._out)
    const H = makeHelpers(callTool)
    const snap = await H.snapshot()
    const ids = snap.split('\n').filter(isEditorLine).map(vnodeIdOf).filter(Boolean)
    if (ids.length < 2) throw new Error(`expected 2 editor vnodes, got ${ids.length}`)
    const idA = ids[0]
    const idB = ids[1]
    const bandsA = await H.mapBlocks(idA, 80)
    const yA = bandsA.get(0) ?? 12
    let aHit = null
    outerA: for (const x of [56, 64, 72, 80, 88, 48, 40, 32, 24, 16, 8]) {
      for (const dy of [0, -4, 4]) {
        await H.fullClick(idA, x, yA + dy)
        const st = await H.state()
        if ((intField(st, 'a_n') ?? 0) > 0) { aHit = { x, y: yA + dy }; break outerA }
      }
    }
    ck(aHit !== null, `O1 编辑器 A 真实点击→RecA 恰一次（${aHit ? `${aHit.x},${aHit.y}` : '未命中'}）`)
    const stA = await H.state()
    ck((intField(stA, 'b_n') ?? 0) === 0, 'O2 A 激活零波及 B（b_n==0——per-instance origin，无全局单槽冒领）')
    const bandsB = await H.mapBlocks(idB, 400)
    const yB = bandsB.get(0) ?? 60
    let bHit = null
    outerB: for (const x of [56, 64, 72, 80, 88, 48, 40, 32, 24, 16, 8]) {
      for (const dy of [0, -4, 4]) {
        await H.fullClick(idB, x, yB + dy)
        const st = await H.state()
        if ((intField(st, 'b_n') ?? 0) > 0) { bHit = { x, y: yB + dy }; break outerB }
      }
    }
    ck(bHit !== null, `O3 编辑器 B 真实点击→RecB 恰一次（${bHit ? `${bHit.x},${bHit.y}` : '未命中'}）`)
    const stB = await H.state()
    const aT = strField(stB, 'a_t')
    const bT = strField(stB, 'b_t')
    const aA = strField(stB, 'a_a')
    ck(aT === '靶页' && bT === '靶页', `O4 双实例载荷逐值一致（a_t=${aT} b_t=${bT}——同正文各发各来源）`)
    ck(aA === '' && strField(stB, 'b_a') === '', `O5 无锚载荷=明确空串（a_a=${JSON.stringify(aA)}——非 undefined 字面）`)
  } catch (err) {
    ck(false, `O 臂载体异常：${String(err.message).slice(0, 300)} | ${aliveTail(app)}`)
  } finally {
    await app._kill()
  }
}

// ---------------- P 臂（脏源保护真实键入） ----------------

async function protectArm() {
  console.log('\n[probe-native-wiki-link] P 臂（脏源/脏目标保护——真实键入+真实点击）：')
  const app = launchVmApp(N_PORT, 'auto-jade-probe-native-wiki-link-p', repoRoot, { AUTO_JADE_WORKSPACE: NATIVE_WS })
  try {
    const { callTool } = await waitMcpAndUi(N_PORT, 'auto-jade-probe-native-wiki-link-p', app, app._out)
    const H = makeHelpers(callTool)
    const srcDiskBefore = fs.readFileSync(path.join(NATIVE_WS, 'wiki', 'Src.ad'), 'utf8')
    await H.openPage(['Src', 'Src.ad'], ['普通正文段落'])
    const edId = await H.editorId()
    if (!edId) throw new Error('editor vnode not found (P)')
    const blocks = await H.mapBlocks(edId, 320)
    const y0 = blocks.get(0)
    if (y0 === undefined) throw new Error('block 0 not mapped (P)')

    // —— 先做脏源（P2）：键入落非链接块 5〔普通段落〕——冻结契约 U-02
    // 被编辑块链接暂态失活，脏源保护由非编辑块承载，块 0 链接保持可点击。
    // 本序列含源键入回声窗口：P2b 为 F-037-R1 探针面。——
    const y5 = blocks.get(5) ?? y0
    // 行尾近旁点击落 caret（key_press 'end' 实测为选区替换语义——不用）。
    await H.pressOnly(edId, 400, y5)
    await sleep(400)
    for (const ch of 'XYZ') {
      await callTool('autoui_action', { element_id: edId, action: 'key_press', value: `c:${ch}` })
      await sleep(150)
    }
    const dirtyText = await H.editorText()
    ck(dirtyText !== null && dirtyText.includes('XYZ'), 'P1 真实键入（key_press 同构路径）源已脏（内存正文含 XYZ——非链接块）')

    const p2 = await H.scanLink(edId, y0, ['目标内容英文页'], { wantPath: 'wiki/Goals.ad' })
    ck(p2.navOk, 'P2 脏源真实点击链接→Goals.ad 提交（store 权威态；导航零阻断）')
    ck(p2.viewSwapped, 'P2b 视面换页跟随（F-037-R1 探针面：键入后导航 NavCommit 提交而视面刷新缺失时此行 FAIL——owner=上游 VM 桥 dirty 传播）')

    await H.openPage(['Src', 'Src.ad'], ['XYZ'])
    const srcMem = await H.editorText()
    ck(srcMem !== null && srcMem.includes('XYZ') && srcMem.includes('目标页'), 'P3 切回源页：脏内存正文保持（XYZ+链接共存——零保存零冲刷）')
    const srcDiskAfter = fs.readFileSync(path.join(NATIVE_WS, 'wiki', 'Src.ad'), 'utf8')
    ck(srcDiskAfter === srcDiskBefore, 'P4 磁盘字节恒等（导航零写源文件）')

    // —— P5（脏目标）：须"编辑 Goals→切回 Src→点击"——其编辑后换页步骤
    // 触发 F-037-R1 视面冻结（粘滞：后续 store 变化亦不刷新视面；冻结后
    // vtree 寻址固定旧页 core，跨页点击不可达）——冻结即记 BLOCKED。——
    try {
      await H.openPage(['Goals'], ['目标内容英文页'])
      const edId2 = await H.editorId()
      await H.pressOnly(edId2, 400, 10)
      await sleep(400)
      for (const ch of 'QW') {
        await callTool('autoui_action', { element_id: edId2, action: 'key_press', value: `c:${ch}` })
        await sleep(150)
      }
      await H.openPage(['Src', 'Src.ad'], ['外部链接'])
      const edId3 = await H.editorId()
      if (!edId3) throw new Error('editor vnode missing after reopen (P5)')
      const blocks3 = await H.mapBlocks(edId3, 320)
      const y03 = blocks3.get(0) ?? y0
      const p5 = await H.scanLink(edId3, y03, ['QW'], { wantPath: 'wiki/Goals.ad' })
      ck(p5.navOk, 'P5 已开 dirty 目标激活零覆盖（store 提交；内存页激活）')
      ck(p5.viewSwapped, 'P5b 视面换页+内存 QW 保留（非磁盘重读）')
    } catch (err) {
      bl(`P5 脏目标序列被 F-037-R1 视面冻结阻断（${String(err.message).slice(0, 160)}）——重入=R1 修复后本探针`)
    }
  } catch (err) {
    ck(false, `P 臂载体异常：${String(err.message).slice(0, 300)} | ${aliveTail(app)}`)
  } finally {
    await app._kill()
  }
}

// ---------------- M 臂（缺页确认真实 UI——T-04） ----------------

async function missingArm() {
  console.log('\n[probe-native-wiki-link] M 臂（缺页确认——真实弹层取消/创建）：')
  buildFixtureWorkspace()
  const app = launchVmApp(N_PORT, 'auto-jade-probe-native-wiki-link-m', repoRoot, { AUTO_JADE_WORKSPACE: NATIVE_WS })
  try {
    const { callTool } = await waitMcpAndUi(N_PORT, 'auto-jade-probe-native-wiki-link-m', app, app._out)
    const H = makeHelpers(callTool)
    const ghostFile = path.join(NATIVE_WS, 'wiki', '幽灵页.ad')
    await H.openPage(['Src', 'Src.ad'], ['外部链接'])
    const edId = await H.editorId()
    if (!edId) throw new Error('editor vnode not found (M)')
    const blocks = await H.mapBlocks(edId, 320)
    const yGhost = blocks.get(4)
    if (yGhost === undefined) throw new Error('block 4 (幽灵页) not mapped')
    // 活动弹层按钮定位：锚"创建缺失页面？"文本行，向后取首个 取消/创建
    // 按钮对（vtree 同时含多个隐藏 dialog 实例——handler 名定位会误抓）。
    const dialogBtns = (snap) => {
      const lines = snap.split('\n')
      const di = lines.findIndex((l) => l.includes('创建缺失页面'))
      if (di < 0) return null
      let cancel = null
      let create = null
      for (let j = di; j < Math.min(lines.length, di + 14); j++) {
        if (cancel === null) { const m = lines[j].match(/button #(vnode_\d+) "取消"/); if (m) cancel = m[1] }
        if (create === null) { const m = lines[j].match(/button #(vnode_\d+) "创建"/); if (m) create = m[1] }
        if (cancel && create) break
      }
      return cancel && create ? { cancel, create } : null
    }

    // 弹层开合判据=store 权威旗标（create_confirm_open/navc_active）——
    // vtree 同时渲染多个 dialog 模板实例，快照文本非可靠开合判据；弹层
    // 按钮按"创建缺失页面？"锚定位（任意实例的同名 handler 派发等价）。
    const confirmOpen = async () => {
      const st = await H.state()
      return (st.match(/create_confirm_open:\s*(\w+)/) ?? [])[1] === 'true'
    }

    // M1: 缺页点击→确认开（store）；取消→零建页+弹层关。
    await H.scanLink(edId, yGhost, ['__never__'], { wantPath: '__never__' }).catch(() => null)
    const dl1 = Date.now() + 8000
    let opened1 = false
    while (Date.now() < dl1) { if (await confirmOpen()) { opened1 = true; break } await sleep(250) }
    ck(opened1, 'M1a 缺页真实点击→既有确认开（store create_confirm_open=true）')
    const snap1 = await H.snapshot()
    const b1 = dialogBtns(snap1)
    ck(b1 !== null, 'M1b-定位 弹层按钮对（取消/创建）在案')
    if (b1) await callTool('autoui_action', { element_id: b1.cancel, action: 'press' })
    const dl2 = Date.now() + 8000
    let closed1 = false
    while (Date.now() < dl2) { if (!(await confirmOpen())) { closed1 = true; break } await sleep(250) }
    ck(closed1 && !fs.existsSync(ghostFile) && !fs.existsSync(path.join(NATIVE_WS, '幽灵页.ad')), 'M1c 取消→弹层关（store 旗标 false）+零建页（root/wiki 双查）')

    // M2: 再点击→确认→创建→真建正确页+开页。
    await H.scanLink(edId, yGhost, ['__never__'], { wantPath: '__never__' }).catch(() => null)
    const dl3 = Date.now() + 8000
    let opened2 = false
    while (Date.now() < dl3) { if (await confirmOpen()) { opened2 = true; break } await sleep(250) }
    ck(opened2, 'M2a 再点击→确认复现（store）')
    const snap2 = await H.snapshot()
    const b2 = dialogBtns(snap2)
    ck(b2 !== null, 'M2a-定位 创建按钮在案')
    if (b2) await callTool('autoui_action', { element_id: b2.create, action: 'press' })
    const dl = Date.now() + 15000
    let created = false
    while (Date.now() < dl) {
      if (fs.existsSync(ghostFile) || fs.existsSync(path.join(NATIVE_WS, '幽灵页.ad'))) { created = true; break }
      await sleep(250)
    }
    ck(created, 'M2b 确认创建→真建页落盘（root/wiki 双查）')
    const dl4 = Date.now() + 8000
    let openedPage = false
    while (Date.now() < dl4) {
      const ap = await H.storeField('active_path')
      if (ap !== null && ap.includes('幽灵页')) { openedPage = true; break }
      await sleep(250)
    }
    ck(openedPage, 'M2c 创建后开新页（active_path=幽灵页.ad）')
    const st2 = await H.state()
    const seqNow = intField(st2, 'nav_seq') ?? 0
    ck(seqNow >= 2, 'M2d 导航确认消费（nav_seq≥2——两轮点击均达 handler）')
    } catch (err) {
    ck(false, `M 臂载体异常：${String(err.message).slice(0, 300)} | ${aliveTail(app)}`)
  } finally {
    await app._kill()
  }
}

// ---------------- 主流程 ----------------

console.log(`[probe-native-wiki-link] phase=${PHASE} — 指纹 → N（真实点击）→ O（origin）→ P（保护）→ M（缺页）→ S/E（分列）`)
fingerprintArm()

if (PHASE === 'all' || PHASE === 'native') await nativeArm()
if (PHASE === 'all' || PHASE === 'origin') await originArm()
if (PHASE === 'all' || PHASE === 'protect') await protectArm()
if (PHASE === 'all' || PHASE === 'missing') await missingArm()

if (PHASE === 'all') {
  console.log('\n[probe-native-wiki-link] S 臂（分列）：')
  bl('S 等待窗迟到族：merged 消费同步无真实等待窗；原生 split 载体 boot 已恢复（probe_editor_host B1——F-24-2 未复现）而 split 链接消费未联验，等待窗 live 验证随 split 消费片；上游六环语料+036 vue S 组证据在案')
  bl('E 右/中键：MCP 词表无右/中键合成——上游 plan732_click_gate_negatives（右/中键零激活）承载，本仓仪器边界如实分列')
  bl('F 错误臂：merged 后端同步调用无真实错误窗（解析/读盘失败可见性=036 vue e2e F 组承载）——merged 强制错误缺仪器通道，如实分列')
}

console.log('\n[probe-native-wiki-link] 结果：')
for (const l of rec.lines) console.log(`  ${l}`)
console.log(`\n[probe-native-wiki-link] PASS=${rec.pass} FAIL=${rec.fail} BLOCKED=${rec.blocked}`)
process.exit(rec.fail > 0 ? 1 : 0)
