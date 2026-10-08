#!/usr/bin/env node
// probe_editor_host.mjs — PLAN-034 编辑器宿主能力核验探针（probe_name_search
// 配方变体：merged 直调探针工程 + split serve-back POST + 原生 split boot
// 尝试 + vue 生成形状检查）。
//
//   merged 臂   临时探针工程（e2e/.runtime/probe-editor-host/，脚本生成
//              ——pac.at render vm + src/back 整树拷贝 + 探针 widget：
//              双 autodown_editor（同正文 A/B）+ 候选事件绑定（oninput/
//              onsave/onfocusblock/onopenwikilink）+ 六命令 action 捷径
//              + back 语料直调），`auto run -r vm` 进程内 CALL——
//              autoui_state 全量 dump 读回 + autoui_snapshot 定位 +
//              autoui_action/keyboard 合成驱动。
//   split 臂   ①原生 split 前端 boot 尝试（`auto run -r vm --no-merge`
//              ——F-24-2 在录家族，不可启动记精确 blocker）②serve-back
//              （`auto run --server vm`）POST /api/link_index 四级解析
//              已知答案（后端供给面）。
//   vue 形状    `auto build -r vue --gen-only`（探针工程内）→ 生成 SFC
//              的 autodown_editor 绑定形状逐项 grep（生成 ≠ 真组件调用
//              ——形状检查只证明生成面）。
//
// 相位（PLAN-034 §6/T-01..T-03）：--phase inventory|save|commands|
//   navigation|all（缺省 all）。
//
// 结果标签：PASS（预期且实测相符）/ FAIL（意外——计失败）/ BLOCKED
// （载体阻断——owner/重入条件在案即调查通过形）。预期缺能力案 = 调查
// 通过、接口尚不可用（unsupported 结论单独成行，不计为功能成功）。
//
// PLAN-035 注记：commands 相位为**隔离工程缺桥模拟**（探针自含 widget
// 六 handler 计数器——历史能力证据，与生产守卫无关）；生产 EditorStore
// 六 handler 已于 035 改为可见说明守卫（零编辑），其直派/键盘/磁盘守卫
// 验证归 tests/probe_command_availability.mjs 真实 Store 臂。live 源码
// 盘点（entryInventory）已对齐 035 现状。
//
// 用法（仓根）：node tests/probe_editor_host.mjs [--phase all]

import { spawn, execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-editor-host')
const MERGED_WS = path.join(RUNTIME, 'probe-editor-host-ws')
const SPLIT_WS = path.join(RUNTIME, 'probe-editor-host-ws-split')
const MERGED_PORT = 9373
const SPLIT_PORT = await pickPort()
const BOOT_PORT = await pickPort()

const argOf = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const PHASES = ['inventory', 'save', 'commands', 'navigation']
const PHASE = argOf('--phase') ?? 'all'
const RUN_PHASES = PHASE === 'all' ? PHASES : [PHASE]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase()

// ---------------- 语料（back 侧四级解析案） ----------------
// 锚语法 = [[target#anchor]]（wsys.extract_links_json split_once "#"）。
const CORPUS = [
  { rel: 'Tgt.ad', body: '---\naliases:\n- 靶心\n- 目标页\n---\n\n# Tgt\n\n别名目标正文。\n' },
  { rel: 'Src.ad', body: '见 [[目标页]] 与 [[靶心]] 与 [[tgt]] 与 [[缺失页]] 与 [[目标页#sec1]] 一处。\n' },
]

function writeCorpus(ws) {
  for (const c of CORPUS) {
    fs.mkdirSync(path.join(ws, c.rel, '..'), { recursive: true })
    fs.writeFileSync(path.join(ws, c.rel), c.body, 'utf8')
  }
}

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
  writeCorpus(ws)
}

// ---------------- 探针 widget 生成 ----------------
// onfocusblock 多参 handler 形态回退链（Auto msg 多参语法未在册先例——
// 编译失败即降级重试一次，编译错误原文入证据）。
const FOCUS_MODES = ['two', 'one', 'none']
let FOCUS_MODE = 'two'

const FOCUS_MSG = { two: 'OnFocusBlock(int, float)', one: 'OnFocusBlock(int)', none: 'OnFocusBlock()' }
const FOCUS_HANDLER = {
  two: `.OnFocusBlock(b int, h float) -> {
            focus_count = focus_count + 1
            focus_last = b.str() + ":" + h.str()
        }`,
  one: `.OnFocusBlock(b int) -> {
            focus_count = focus_count + 1
            focus_last = b.str() + ":?"
        }`,
  none: `.OnFocusBlock() -> {
            focus_count = focus_count + 1
            focus_last = "unit"
        }`,
}

// 编辑器播种正文（A/B 同正文——保存来源身份反例语料；含 wiki 链与
// 中文标点/中英混排/代码栅栏）。
const SEED_BODY = '# Host A\n\n正文段一，含中文标点。\n\nmixed code line: const x = 1;\n\n链 [[目标页]] 内联。\n'

// .at 文本按当前 FOCUS_MODE 现算（回退链重生成——模块加载期固化会锁死
// 首选形态）。
function makeProbeAt() {
  return `// 探针 widget（tests/probe_editor_host.mjs 生成件——直证后随
// .runtime 再生，非入库源）。双 autodown_editor（同正文 A/B——保存来
// 源身份反例）+ 候选宿主事件绑定（oninput/onsave/onfocusblock/
// onopenwikilink——onsave/onopenwikilink 为候选语法，native 转换层
// 未读出，实测零回执即缺供给直证）+ 六命令 action 捷径（undo/redo/
// select-all）与按钮（cut/copy/paste——无捷径在册，宿主按钮通道）。
use back.api: write_wiki, link_index

widget App {
    msg {
        Init,
        OnInputA(str), OnInputB(str),
        OnSave(str), OnLink(str), ${FOCUS_MSG[FOCUS_MODE]},
        CmdUndo, CmdRedo, CmdCut, CmdCopy, CmdPaste, CmdSelectAll,
        HostCtrlS,
    }
    model {
        var done bool = false
        var body_a str = "${SEED_BODY.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
        var body_b str = "${SEED_BODY.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
        var active_key str = "doc-a"
        var input_a int = 0
        var input_b int = 0
        var input_tail str = ""
        var save_count int = 0
        var save_last str = ""
        var link_count int = 0
        var link_last str = ""
        var focus_count int = 0
        var focus_last str = ""
        var cmd_undo int = 0
        var cmd_redo int = 0
        var cmd_cut int = 0
        var cmd_copy int = 0
        var cmd_paste int = 0
        var cmd_selectall int = 0
        var ctrls int = 0
        // —— 四级解析已知答案（Init 直调 link_index——行 {target,anchor,
        // exists,target_path}）——
        var lk_tgt str = ""
        var lk_alias str = ""
        var lk_case str = ""
        var lk_miss str = ""
        var lk_anchor str = ""
        var raw_links str = ""
    }
    // 载体形状：双编辑器各占半屏（MCP press 定位 vnode 中心）。
    view {
        col (style: "h-full w-full") {
            autodown_editor (key: "doc-a", final: true, style: "h-1/2 w-full") {
                content: .body_a
                oninput: .OnInputA
                onsave: .OnSave
                onfocusblock: .OnFocusBlock
                onopenwikilink: .OnLink
            }
            autodown_editor (key: "doc-b", final: true, style: "h-1/2 w-full") {
                content: .body_b
                oninput: .OnInputB
            }
            row (style: "h-8 items-center gap-1 shrink-0 px-1") {
                button (text: "cut", variant: "ghost") { onclick: .CmdCut, style: "h-6 px-2 text-[11px]" }
                button (text: "copy", variant: "ghost") { onclick: .CmdCopy, style: "h-6 px-2 text-[11px]" }
                button (text: "paste", variant: "ghost") { onclick: .CmdPaste, style: "h-6 px-2 text-[11px]" }
            }
        }
    }
    actions {
        action (id: "probe.save", handler: .HostCtrlS, title: "宿主保存", shortcut: "Ctrl+S")
        action (id: "edit.undo", handler: .CmdUndo, title: "撤销", shortcut: "Ctrl+Z")
        action (id: "edit.redo", handler: .CmdRedo, title: "重做", shortcut: "Ctrl+Y")
        action (id: "edit.select-all", handler: .CmdSelectAll, title: "全选", shortcut: "Ctrl+A")
    }
    on {
        .Init -> {
            // —— back 语料直写 + link_index 四级案读回（handler 体内
            // json.to_value 直调——D-20⑤ call-arg 形；D-20② 元素先拷
            // 局部变量再取字段）——
            write_wiki("Tgt.ad", "---\\naliases:\\n- 靶心\\n- 目标页\\n---\\n\\n# Tgt\\n\\n别名目标正文。\\n")
            write_wiki("Src.ad", "见 [[目标页]] 与 [[靶心]] 与 [[tgt]] 与 [[缺失页]] 与 [[目标页#sec1]] 一处。\\n")
            raw_links = link_index("", 8)
            var pages List = json.to_value(link_index("", 8))
            var i int = 0
            while i < pages.len() {
                var p = pages[i]
                var pp str = p.path
                if pp == "Src.ad" {
                    var links List = p.links
                    var k int = 0
                    while k < links.len() {
                        var ln = links[k]
                        var tg str = ln.target
                        var tp str = ln.target_path
                        var an str = ln.anchor
                        if tg == "目标页" {
                            if an == "" {
                                lk_tgt = tg + ">" + tp
                            }
                        }
                        if tg == "靶心" {
                            lk_alias = tg + ">" + tp
                        }
                        if tg == "tgt" {
                            lk_case = tg + ">" + tp
                        }
                        if tg == "缺失页" {
                            lk_miss = tg + ">" + tp
                        }
                        if an != "" {
                            lk_anchor = tg + "#" + an + ">" + tp
                        }
                        k = k + 1
                    }
                }
                i = i + 1
            }
            done = true
        }
        .OnInputA(t) -> {
            input_a = input_a + 1
            body_a = t
            input_tail = t
        }
        .OnInputB(t) -> {
            input_b = input_b + 1
            body_b = t
            input_tail = t
        }
        .OnSave(md) -> {
            save_count = save_count + 1
            save_last = md
        }
        .OnLink(t) -> {
            link_count = link_count + 1
            link_last = t
        }
        ${FOCUS_HANDLER[FOCUS_MODE]}
        .CmdUndo -> { cmd_undo = cmd_undo + 1 }
        .CmdRedo -> { cmd_redo = cmd_redo + 1 }
        .CmdCut -> { cmd_cut = cmd_cut + 1 }
        .CmdCopy -> { cmd_copy = cmd_copy + 1 }
        .CmdPaste -> { cmd_paste = cmd_paste + 1 }
        .CmdSelectAll -> { cmd_selectall = cmd_selectall + 1 }
        .HostCtrlS -> { ctrls = ctrls + 1 }
    }
}
`
}

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), makeProbeAt(), 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "jade-probe-editor-host"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeEditorHost"
window: "900x700"
`,
    'utf8',
  )
}

// ---------------- dump 字段捕获 ----------------
const strField = (dump, name) => {
  const raw = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]
  if (raw === undefined) return null
  try { return JSON.parse(`"${raw}"`) } catch { return raw }
}
const intField = (dump, name) => {
  const m = dump.match(new RegExp(`${name}:\\s*(-?\\d+)`))
  return m ? Number(m[1]) : null
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

// ---------------- merged 臂 ----------------

async function runMergedArm(rec) {
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-editor-host', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-2000)}`)
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
    rec.dump = dump

    const snapshot = async () => await callTool('autoui_snapshot', {})
    // 编辑器 vnode 定位：native 快照编辑壳 lowering 为 textarea 行
    //（vm_matrix isEditorNode 同款形态）；A/B 按源序（块内 onsave 绑定
    // 显形 = doc-a 判别锚——候选事件名进视图模板但运行时无消费通道，
    // 本身即转换层证据）。
    const editorIds = async () => {
      const snap = await snapshot()
      const lines = snap.split('\n')
      const ids = []
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^\s*textarea #(\S+) \{$/)
        if (!m) continue
        let hasSave = false
        for (let j = i + 1; j < lines.length && j <= i + 40; j++) {
          if (/^\s*\}\s*$/.test(lines[j])) break
          if (/^\s*(textarea|button|col|row|text) #?\S* ?\{/.test(lines[j])) break
          if (/onsave:/.test(lines[j])) hasSave = true
        }
        ids.push({ id: m[1], hasSave })
      }
      return ids
    }
    const statePoll = async (field, want, timeoutMs = 8000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const st = (await callTool('autoui_state', {})).trim()
        const got = intField(st, field) ?? 0
        if (got >= want) return st
        if (Date.now() > dl) throw new Error(`state.${field} never reached ${want} (got ${got})`)
        await sleep(200)
      }
    }
    const stateEqPoll = async (field, want, timeoutMs = 8000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const st = (await callTool('autoui_state', {})).trim()
        if (strField(st, field) === want) return st
        if (Date.now() > dl) throw new Error(`state.${field} never equaled expected`)
        await sleep(200)
      }
    }
    rec.helpers = { editorIds, statePoll, stateEqPoll, callTool, snapshot }

    // —— M1 双编辑器在树 ——
    rec.editors = await editorIds()
    rec.m1_dump = dump

    // —— M2 INPUT_TEXT 通道（editor-a type_text CJK 全文）——
    if (rec.editors[0]?.id) {
      const EDIT_A = `${SEED_BODY}\nM2 探针标记：INPUT_TEXT 通道。`
      rec.m2_sent = EDIT_A
      await callTool('autoui_action', { element_id: rec.editors[0]?.id, action: 'type_text', value: EDIT_A })
      const st = await stateEqPoll('body_a', EDIT_A)
      rec.m2_input_a = intField(st, 'input_a')
      rec.m2_body_a = strField(st, 'body_a')
      rec.m2_tail = strField(st, 'input_tail')
    }

    // —— M3 块聚焦（press → onfocusblock 回执）——
    if (rec.editors[0]?.id) {
      try {
        await callTool('autoui_action', { element_id: rec.editors[0]?.id, action: 'click', value: '100,60' })
      } catch (e) {
        rec.m3_click_err = String(e.message).slice(0, 200)
      }
      await sleep(600)
      const st = (await callTool('autoui_state', {})).trim()
      rec.m3_focus_count = intField(st, 'focus_count')
      rec.m3_focus_last = strField(st, 'focus_last')
      rec.m3_link_count = intField(st, 'link_count')
      rec.m3_save_count = intField(st, 'save_count')
    }

    // —— I5 宿主捷径通道（actions 块 Ctrl+S → HostCtrlS 回执）——
    await callTool('autoui_keyboard', { key: 's', modifiers: ['ctrl'] })
    {
      const st = await statePoll('ctrls', 1)
      rec.i5_ctrls = intField(st, 'ctrls')
    }

    if (RUN_PHASES.includes('save')) {
      // —— S1 来源身份反例：B 编辑器键入（active_key 仍指 A、A/B 同正文）——
      if (rec.editors[1]?.id) {
        const EDIT_B = `${SEED_BODY}\nS1 反例标记：B 编辑器键入。`
        rec.s1_sent = EDIT_B
        await callTool('autoui_action', { element_id: rec.editors[1]?.id, action: 'type_text', value: EDIT_B })
        const st = await stateEqPoll('body_b', EDIT_B)
        rec.s1_input_b = intField(st, 'input_b')
        rec.s1_input_a_after = intField(st, 'input_a')
        rec.s1_active = strField(st, 'active_key')
        rec.s1_body_b = strField(st, 'body_b')
      }
      // —— S2 保存通道盘点终态：save 回执恒零 + 宿主捷径回执在 ——
      {
        const st = (await callTool('autoui_state', {})).trim()
        rec.s2_save_count = intField(st, 'save_count')
        rec.s2_ctrls = intField(st, 'ctrls')
        rec.s2_ctrlz = intField(st, 'cmd_undo')
      }
    }

    if (RUN_PHASES.includes('commands')) {
      // —— C1 六命令宿主通道：捷径三件（Ctrl+Z/Y/A）+ 按钮三件 ——
      await callTool('autoui_keyboard', { key: 'z', modifiers: ['ctrl'] })
      await callTool('autoui_keyboard', { key: 'y', modifiers: ['ctrl'] })
      await callTool('autoui_keyboard', { key: 'a', modifiers: ['ctrl'] })
      {
        const st = await statePoll('cmd_selectall', 1)
        rec.c1_undo = intField(st, 'cmd_undo')
        rec.c1_redo = intField(st, 'cmd_redo')
        rec.c1_selectall = intField(st, 'cmd_selectall')
        rec.c1_body_a_unchanged = strField(st, 'body_a')
      }
      const btnIds = async (text) => {
        const snap = await snapshot()
        const lines = snap.split('\n').filter((l) => l.includes(`"${text}"`) && /vnode_\d+/.test(l))
        return lines.map((l) => l.match(/#(vnode_\d+)/)?.[1]).filter(Boolean)
      }
      for (const [label, field] of [['cut', 'cmd_cut'], ['copy', 'cmd_copy'], ['paste', 'cmd_paste']]) {
        const ids = await btnIds(label)
        rec[`c1_${label}_btn_found`] = ids.length > 0
        if (ids[0]) {
          await callTool('autoui_action', { element_id: ids[0], action: 'press' })
          const st = await statePoll(field, 1)
          rec[`c1_${label}`] = intField(st, field)
        }
      }
      // —— C2 编辑器核心逐键合成：单词表键（backspace——真实按键同构）
      // 与修饰键词表外（ctrl+z——预期工具报错）——
      if (rec.editors[0]?.id) {
        try {
          await callTool('autoui_action', { element_id: rec.editors[0]?.id, action: 'key_press', value: 'backspace' })
          await sleep(500)
          const st = (await callTool('autoui_state', {})).trim()
          rec.c2_backspace_input_a = intField(st, 'input_a')
          rec.c2_body_a_after_bs = strField(st, 'body_a')
        } catch (e) {
          rec.c2_backspace_err = String(e.message).slice(0, 200)
        }
        try {
          // 词表外键名（修饰键组合不在 PLAN-057 v1 词表）——预期工具报错，
          // 拒绝原文即「VM 编辑壳无快捷键消费场景」的运行面锚点；不提交
          // "c:Z"（单字符形态会被接受为字面键入，突变正文）。
          await callTool('autoui_action', { element_id: rec.editors[0]?.id, action: 'key_press', value: 'ctrl+z' })
          rec.c2_ctrlz_accepted = true
        } catch (e) {
          rec.c2_ctrlz_err = String(e.message).slice(0, 220)
        }
        {
          const st3 = (await callTool('autoui_state', {})).trim()
          rec.c2_body_a_no_stray = strField(st3, 'body_a')
        }
        const st2 = (await callTool('autoui_state', {})).trim()
        rec.c2_undo_after = intField(st2, 'cmd_undo')
      }
    }

    if (RUN_PHASES.includes('navigation')) {
      // —— N2 链接点击零回执补强（M3 press 之后再次点入内容区）——
    // N2 链接零回执补强（M3 click 之后再次点入内容区）；聚焦面与 M3
    // 同判（click 直写 ghost state——回执恒零为预期形态，非「续发」）。
    if (rec.editors[0]?.id) {
        try {
          await callTool('autoui_action', { element_id: rec.editors[0]?.id, action: 'click', value: '150,90' })
        } catch (e) {
          rec.n2_click_err = String(e.message).slice(0, 200)
        }
        await sleep(600)
        const st = (await callTool('autoui_state', {})).trim()
        rec.n2_link_count = intField(st, 'link_count')
        rec.n2_link_last = strField(st, 'link_last')
        rec.n2_focus_count = intField(st, 'focus_count')
        rec.n2_focus_last = strField(st, 'focus_last')
    }
      // —— N3 四级解析已知答案（Init 直调产物读回）——
      {
        const st = (await callTool('autoui_state', {})).trim()
        rec.n3_tgt = strField(st, 'lk_tgt')
        rec.n3_alias = strField(st, 'lk_alias')
        rec.n3_case = strField(st, 'lk_case')
        rec.n3_miss = strField(st, 'lk_miss')
        rec.n3_anchor = strField(st, 'lk_anchor')
        rec.n3_raw_head = (strField(st, 'raw_links') ?? '').slice(0, 400)
      }
    }
    rec.boot_tail = appOut.slice(-400)
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
  return rec
}

// ---------------- 原生 split boot 尝试（F-24-2 家族） ----------------

async function attemptNativeSplitBoot(rec) {
  prepareWorkspace(SPLIT_WS)
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm', '--no-merge'], {
    cwd: PROBE_DIR,
    env: { ...process.env, AUTOUI_MCP_PORT: String(BOOT_PORT), JADE_WORKSPACE: SPLIT_WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  app.stdout.on('data', (d) => (out += d))
  app.stderr.on('data', (d) => (out += d))
  try {
    const { rpc } = makeClient(BOOT_PORT)
    const deadline = Date.now() + 30000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-editor-host-split', version: '0.1.0' } })
        rec.split_boot = 'ok'
        return true
      } catch (err) {
        if (app.exitCode !== null) {
          rec.split_boot = 'exited'
          rec.split_boot_tail = out.slice(-1500)
          return false
        }
        if (Date.now() > deadline) {
          rec.split_boot = 'timeout'
          rec.split_boot_tail = out.slice(-1500)
          return false
        }
        await sleep(500)
      }
    }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- vue 生成形状检查 ----------------

function vueShapeCheck(rec) {
  const gen = spawnSync(AUTO_EXE, ['build', '-r', 'vue', '--gen-only'], { cwd: PROBE_DIR, encoding: 'utf8' })
  rec.vue_gen_exit = gen.status
  if (gen.status !== 0) {
    rec.vue_gen_tail = ((gen.stdout ?? '') + (gen.stderr ?? '')).slice(-1200)
    return rec
  }
  const candidates = [
    path.join(PROBE_DIR, 'gen', 'front', 'vue', 'src', 'App.vue'),
    path.join(PROBE_DIR, 'gen', 'front', 'vue', 'src', 'app.vue'),
  ]
  const sfcPath = candidates.find((p) => fs.existsSync(p))
  if (!sfcPath) {
    rec.vue_gen_tail = `generated SFC not found; gen tree: ${fs.existsSync(path.join(PROBE_DIR, 'gen')) ? fs.readdirSync(path.join(PROBE_DIR, 'gen'), { recursive: true }).slice(0, 40).join(', ') : '(no gen)'}`
    return rec
  }
  const sfc = fs.readFileSync(sfcPath, 'utf8')
  const editorLine = sfc.split('\n').find((l) => /<AutoDownEditor/.test(l)) ?? ''
  rec.vue_editor_line = editorLine.trim().slice(0, 400)
  rec.vue_shape = {
    content: /:content=/.test(editorLine),
    oninput_modelValue: /@update:modelValue=/.test(editorLine),
    onupdate: /@update=/.test(editorLine),
    onsave: /@save=/.test(editorLine),
    onfocusblock: /@focusblock=/.test(editorLine),
    onopenwikilink: /@openwikilink=/.test(editorLine),
    onopen_wiki_link_kebab: /@open-wiki-link=/.test(editorLine),
    canEdit: /:can-edit=/.test(editorLine),
    showActions: /:show-actions=/.test(editorLine),
    key: /:key=/.test(editorLine),
  }
  return rec
}

// ---------------- 工具链指纹 ----------------

function fingerprints(rec) {
  const fp = {}
  try {
    const v = spawnSync(AUTO_EXE, ['--version'], { encoding: 'utf8', timeout: 20000 })
    fp.auto_exe_version = ((v.stdout ?? '') + (v.stderr ?? '')).trim().split('\n')[0] || `exit ${v.status}`
  } catch (e) {
    fp.auto_exe_version = `unavailable: ${String(e).slice(0, 80)}`
  }
  const rev = (dir) => {
    try {
      return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    } catch {
      return 'unavailable'
    }
  }
  fp.auto_lang = rev('D:/autostack/auto-lang')
  fp.auto_down = rev('D:/autostack/auto-down')
  try {
    fp.auto_lang_desc = execFileSync('git', ['-C', 'D:/autostack/auto-lang', 'describe', '--tags', '--always', '--dirty'], { encoding: 'utf8' }).trim()
  } catch { fp.auto_lang_desc = 'unavailable' }
  const engineDist = 'D:/autostack/auto-down/autodown/packages/engine/dist'
  try {
    const st = fs.statSync(engineDist)
    fp.engine_dist_mtime = st.mtime.toISOString()
    fp.engine_dist_entry_sha = sha(path.join(engineDist, 'index.js'))
  } catch (e) {
    fp.engine_dist_mtime = 'unavailable'
  }
  fp.jade_edit = rev(repoRoot)
  rec.fingerprints = fp
  return rec
}

// ---------------- 静态入口盘点（源码锚点机读面） ----------------

function entryInventory(rec) {
  const rd = (rel) => {
    try { return fs.readFileSync(path.join(repoRoot, rel), 'utf8') } catch { return '' }
  }
  const appAt = rd('src/front/app.at')
  const storeAt = rd('src/front/editor_store.at')
  const appVue = rd('gen/front/vue/src/App.vue')
  const grab = (src, re) => src.match(re)?.[0]?.slice(0, 300) ?? null
  rec.entries = {
    editor_native: grab(appAt, /autodown_editor \(key:[^}]*?\)/s),
    editor_vue: grab(appVue, /<AutoDownEditor[^>]*>/s),
    actsave: grab(appAt, /\.ActSave -> \{[\s\S]{0,120}/),
    store_save_head: grab(storeAt, /\.Save -> \{[\s\S]{0,80}/),
    // PLAN-035 对齐：六 handler 已改为可见说明守卫（多行形——置位
    // editor_commands_help_open+console 诊断），旧单行 console_log 降级退役
    cmd_family: grab(storeAt, /\.ActUndo -> \{[\s\S]{0,200}/),
    cmd_help_flag: grab(storeAt, /editor_commands_help_open bool = false/),
    cmd_guard_note: grab(appAt, /编辑命令说明[\s\S]{0,120}/),
    openlink: grab(appAt, /\.OpenLink\(path\) -> \{[\s\S]{0,120}/),
  }
  return rec
}

// ---------------- 断言 ----------------

const failures = []
const ck = (ok, label) => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`)
  if (!ok) failures.push(label)
}
const bl = (label) => {
  console.log(`  [BLOCKED] ${label}`)
}
const uns = (label) => {
  console.log(`  [UNSUPPORTED] ${label}`)
}

function checks(rec) {
  console.log('\n[probe-editor-host] 工具链指纹：')
  for (const [k, v] of Object.entries(rec.fingerprints ?? {})) console.log(`  ${k} = ${String(v).slice(0, 100)}`)

  console.log('\n[probe-editor-host] 静态入口盘点（源码锚点）：')
  for (const [k, v] of Object.entries(rec.entries ?? {})) console.log(`  ${k} = ${v === null ? '(not found)' : String(v).replace(/\s+/g, ' ').slice(0, 160)}`)

  console.log('\n[probe-editor-host] merged 臂：')
  // M1 双编辑器在树（textarea lowering + doc-a onsave 绑定显形判别）
  ck(Array.isArray(rec.editors) && rec.editors.length === 2, `M1 双 autodown_editor vnode 在树（textarea lowering：${JSON.stringify((rec.editors ?? []).map((e) => ({ id: String(e.id ?? '').slice(0, 14), hasSave: e.hasSave })))}）`)
  ck(rec.editors?.[0]?.hasSave === true && rec.editors?.[1]?.hasSave === false, 'M1 候选事件绑定入视图模板：doc-a 显形 onsave/onfocusblock/onopenwikilink，doc-b 仅 oninput（转换层声明保留≠运行时消费）')
  // M2 INPUT_TEXT 通道
  if (RUN_PHASES.includes('inventory')) {
    ck(rec.m2_input_a >= 1, `M2 editor-a type_text → OnInput 回执 input_a=${rec.m2_input_a}`)
    ck(rec.m2_body_a === rec.m2_sent, 'M2 INPUT_TEXT 全文回写逐字节（body_a == 发送文）')
    ck((rec.m2_tail ?? '').includes('M2 探针标记'), 'M2 回执载荷含 CJK 标记（全文单参通道）')
    // M3 块聚焦（click 合成→ onfocusblock 回执）+ save/link 零回执
    if ((rec.m3_focus_count ?? 0) >= 1) {
      ck(true, `M3 click → onfocusblock 回执 focus_count=${rec.m3_focus_count} last=${rec.m3_focus_last}（块聚焦消息达 DSL handler——宿主可消费）`)
    } else if (rec.m3_click_err) {
      bl(`M3 click 工具报错：${rec.m3_click_err}——owner=auto-lang MCP 合成通道；重入=修复后重跑`)
    } else {
      uns(`M3 click 后 onfocusblock 零回执（MCP click 路径 write_ghost_state 直写不经 DSL handler——PLAN-044 T6 注锚定；块聚焦的宿主消息消费面未证，真键鼠标 headless 不可达）——VM 轨块聚焦读出=内部 ghost state，非宿主可消费消息`)
    }
    ck((rec.m3_save_count ?? 0) === 0, 'M3 编辑器 save 事件零回执（native 无 save 消息通道）')
    ck((rec.m3_link_count ?? 0) === 0, 'M3 编辑器 link 事件零回执（press-only ghost 点击门不闭合——PLAN-037 后完整点击链接事件已 live，见 probe_native_wiki_link N 臂）')
    uns('save：native 转换层 View::AutodownEditor 仅 on_change/on_focus（aura_view_builder convert_autodown_editor_native）+ 运行时零回执——缺层=auto-lang 转换 + VM 运行时；宿主保存入口=actions 捷径（I5）')
    uns('link：**PLAN-037 后已解锁（2026-10-03）**——上游供给链 auto-lang PLAN-732/737/739（wikilink attr 语义消费+ADE_LINK_DISPATCH 合成通道派发+输入补丁摘臂）后 merged 完整点击链接事件 live 消费（probe_native_wiki_link N/O/P/M 五臂全绿，binary≥v0.4.2-2730）；本探针 M3/N2 的零回执=press-only ghost 语义（阴性锚）非缺通道；save 通道缺口维持前条')
    // I5 宿主捷径
    ck((rec.i5_ctrls ?? 0) >= 1, `I5 autoui_keyboard Ctrl+S → HostCtrlS 回执（actions 捷径归一 "Ctrl+s" 查找命中）ctrls=${rec.i5_ctrls}`)
  }

  if (RUN_PHASES.includes('save')) {
    console.log('\n[probe-editor-host] save 相位：')
    ck((rec.s1_input_b ?? 0) >= 1, `S1 editor-b type_text → OnInputB 回执 input_b=${rec.s1_input_b}`)
    ck((rec.s1_input_a_after ?? 0) === (rec.m2_input_a ?? 0), 'S1 反例：B 键入零串扰 A（input_a 不增——A/B 通道独立）')
    ck(rec.s1_active === 'doc-a' && rec.s1_body_b !== rec.s1_body_a, `S1 同正文双页 + active 指向 A 而事件源于 B——md-only 载荷 + active 读回不可辨识来源（缺口直证）`)
    uns('save 来源身份：事件载荷=全文 md 单参（INPUT_TEXT），无 tab_uid/实例世代字段；同正文双页下宿主无法凭载荷/active 判源——缺层=jade-edit 消费设计 + 上游身份字段供给')
    ck((rec.s2_save_count ?? 0) === 0, `S2 终态：编辑器 save 事件回执恒零（save_count=${rec.s2_save_count}）`)
    ck((rec.s2_ctrls ?? 0) >= 1 && (rec.s2_ctrlz ?? 0) >= 0, `S2 宿主捷径通道在（ctrls=${rec.s2_ctrls}）——原生轨宿主保存唯一入口=actions 捷径/按钮`)
  }

  if (RUN_PHASES.includes('commands')) {
    console.log('\n[probe-editor-host] commands 相位：')
    ck((rec.c1_undo ?? 0) >= 1, `C1 Ctrl+Z → CmdUndo 回执（宿主 action 捷径通道）undo=${rec.c1_undo}`)
    ck((rec.c1_redo ?? 0) >= 1, `C1 Ctrl+Y → CmdRedo 回执 redo=${rec.c1_redo}`)
    ck((rec.c1_selectall ?? 0) >= 1, `C1 Ctrl+A → CmdSelectAll 回执 selectall=${rec.c1_selectall}`)
    ck(rec.c1_body_a_unchanged === rec.m2_sent, 'C1 宿主命令回执后编辑器正文零变化（宿主 handler 无编辑器桥）')
    ck(rec.c1_cut === 1 && rec.c1_copy === 1 && rec.c1_paste === 1, `C1 cut/copy/paste 按钮通道回执（${rec.c1_cut}/${rec.c1_copy}/${rec.c1_paste}）`)
    uns('六命令：宿主通道（捷径/按钮）可达 handler；handler→编辑器执行桥缺失（console_log 降级同款）——缺层=auto-lang VM 原语 + auto-down 组件命令面')
    if (rec.c2_backspace_input_a !== undefined) {
      ck(rec.c2_backspace_input_a >= (rec.m2_input_a ?? 0), `C2 key_press backspace（真实按键同构）→ INPUT_TEXT 回执续发 input_a=${rec.c2_backspace_input_a}`)
    } else {
      bl(`C2 key_press backspace 不可用：${rec.c2_backspace_err ?? '(no attempt)'}`)
    }
    ck(rec.c2_ctrlz_err !== undefined, `C2 修饰键词表外：key_press "ctrl+z" 被拒（${(rec.c2_ctrlz_err ?? '').slice(0, 90)}…）——VM 编辑壳逐键词表无修饰键=源码锚定无快捷键消费场景`)
    ck((rec.c2_undo_after ?? 0) === (rec.c1_undo ?? 0), 'C2 词表外键不产生任何回执（cmd_undo 不增——编辑器内部撤销不可达）')
    ck(rec.c2_body_a_no_stray === rec.m2_sent, 'C2 词表外键零正文突变（body_a 逐字节不变）')
    uns('undo/redo 内部快捷键：native 编辑壳 key_press 词表无修饰键（PLAN-057 v1）+ core 无历史消费场景——native 轨内部撤销=不存在；vue 轨内部撤销=EngineEditor onContentKeydown（vue e2e 面）')
  }

  if (RUN_PHASES.includes('navigation')) {
    console.log('\n[probe-editor-host] navigation 相位：')
    // N2 链接零回执 + 聚焦面（与 M3 同判——回执恒零为预期形态）
    ck((rec.n2_link_count ?? 0) === 0, `N2 内容区二次点入 → link 事件仍零回执（link_count=${rec.n2_link_count}）`)
    ck((rec.n2_focus_count ?? 0) === 0 && (rec.m3_focus_count ?? 0) === 0, 'N2 聚焦回执恒零与 M3 同判（click 直写 ghost state 不经 DSL handler——M3 UNSUPPORTED 锚定一致）')
    // N3 四级解析已知答案
    ck(rec.n3_tgt === '目标页>Tgt.ad', `N3 [[目标页]] alias 精确级 → Tgt.ad（实际：${rec.n3_tgt}）`)
    ck(rec.n3_alias === '靶心>Tgt.ad', `N3 [[靶心]] alias 级 → Tgt.ad（实际：${rec.n3_alias}）`)
    ck(rec.n3_case === 'tgt>Tgt.ad', `N3 [[tgt]] stem casefold 级 → Tgt.ad（实际：${rec.n3_case}）`)
    ck(rec.n3_miss === '缺失页>', `N3 [[缺失页]] 悬空：exists=false + target_path=""（实际：${rec.n3_miss}）`)
    ck(rec.n3_anchor === '目标页#sec1>Tgt.ad', `N3 [[目标页#sec1]] anchor 伴随 target 解析（实际：${rec.n3_anchor}）`)
    uns('selection/cursor/reveal：native 块聚焦=onfocusblock→on_focus 绑定在册（FocusCallback 单元测试在录）；但 MCP click 合成路径直写 ghost state 不达 handler（M3/N2 实测）、真键鼠标 headless 不可达——块聚焦宿主消费面=受阻边界（未证非可用）；caret 行列/选区快照/reveal 调用无宿主原语——块聚焦≠caret、开页≠定位；scroll_sync offset 写入通道在册（PLAN-043）但块/锚定位供给缺')
  }

  console.log('\n[probe-editor-host] split 臂（原生 split boot + HTTP 供给面）：')
  if (rec.split_boot === 'ok') {
    ck(true, 'B1 原生 split 前端 boot 成功（F-24-2 未复现）')
  } else {
    bl(`B1 原生 split 前端 boot ${rec.split_boot}（F-24-2 家族在录）——owner=auto-lang split 前端；重入=上游修复后重跑本探针。tail=${(rec.split_boot_tail ?? '').replace(/\s+/g, ' ').slice(0, 160)}`)
  }
  if (rec.split_http) {
    const h = rec.split_http
    ck(h.tgt === '目标页>Tgt.ad', `B2 split HTTP link_index [[目标页]] → Tgt.ad（实际：${h.tgt}）`)
    ck(h.miss === '缺失页>', `B2 split HTTP [[缺失页]] 悬空（实际：${h.miss}）`)
    ck(h.anchor === '目标页#sec1>Tgt.ad', `B2 split HTTP anchor 伴随解析（实际：${h.anchor}）`)
  }

  console.log('\n[probe-editor-host] vue 生成形状（探针工程 gen-only——生成≠真组件调用）：')
  if (rec.vue_gen_exit === 0 && rec.vue_shape) {
    const s = rec.vue_shape
    for (const [k, v] of Object.entries(s)) console.log(`  ${k} = ${v}`)
    ck(s.content && s.key, 'vue 形状：:content/:key 绑定发射（:key 重挂载播种通道在册）')
    ck(s.oninput_modelValue, 'vue 形状：oninput → @update:modelValue（EngineEditor emit 名匹配——真实消费面在册）')
    if (s.onsave) ck(true, `vue 形状：onsave → @save 发射（EngineEditor 'save' emit 名匹配——供给存在待接线）`)
    else uns('vue 形状：onsave 未发射 @save（生成面缺口）')
    if (s.onfocusblock) ck(true, 'vue 形状：onfocusblock → @focusblock 发射（emit 名匹配——供给存在待接线）')
    else uns('vue 形状：onfocusblock 未发射 @focusblock')
    if (s.onopenwikilink && !s.onopen_wiki_link_kebab) uns(`vue 形状：onopenwikilink → @openwikilink（EngineEditor emit 名为 'open-wiki-link' kebab 形——生成名不匹配=形状缺口）`)
    else if (s.onopen_wiki_link_kebab) ck(true, 'vue 形状：onopenwikilink → @open-wiki-link（kebab 匹配）')
    else uns('vue 形状：onopenwikilink 未发射任何链接事件')
    ck(s.showActions && s.canEdit, `vue 形状：:show-actions/:can-edit 发射（EngineEditor defineProps 无此二 prop——attr 透传非真消费）`)
  } else {
    bl(`vue 生成形状检查未达：exit=${rec.vue_gen_exit} ${(rec.vue_gen_tail ?? '').replace(/\s+/g, ' ').slice(0, 200)}`)
  }
}

// ---------------- split HTTP 供给面 ----------------

async function runSplitHttp(rec) {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT, workspace: SPLIT_WS })
  writeCorpus(back.workspace)
  try {
    const getJson = async (api, query) => {
      const res = await fetch(`${back.url}/api/${api}${query ?? ''}`)
      if (!res.ok) throw new Error(`GET ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      try { return JSON.parse(text) } catch { return text }
    }
    // link_index = GET 端点（probe_name_search 同款 ?path=&depth=8 形）；
    // 响应 = 双壳 JSON 字符串（"[{...}]"——一次 parse 得串，两次得数组）。
    const raw = await getJson('link_index', '?path=&depth=8')
    const pages = typeof raw === 'string' ? JSON.parse(raw) : raw
    const src = Array.isArray(pages) ? pages.find((p) => p.path === 'Src.ad') : null
    const rowOf = (target) => (Array.isArray(src?.links) ? src.links.find((l) => l.target === target) : null)
    const fmt = (r) => (r ? `${r.target}>${r.target_path ?? ''}` : '(missing)')
    const anchorRow = Array.isArray(src?.links) ? src.links.find((l) => (l.anchor ?? '') !== '') : null
    rec.split_http = {
      tgt: fmt(rowOf('目标页')),
      alias: fmt(rowOf('靶心')),
      casefold: fmt(rowOf('tgt')),
      miss: fmt(rowOf('缺失页')),
      anchor: anchorRow ? `${anchorRow.target}#${anchorRow.anchor}>${anchorRow.target_path}` : '(missing)',
    }
  } finally {
    await back.stop()
  }
  return rec
}

// ---------------- run ----------------

console.log(`[probe-editor-host] phase=${RUN_PHASES.join('+')} — 指纹/盘点 → merged 臂（探针工程 ${path.relative(repoRoot, PROBE_DIR)}）→ split 臂 → vue 形状`)
let rec = {}
rec = fingerprints(rec)
rec = entryInventory(rec)

prepareWorkspace(MERGED_WS)
try {
  rec = await runMergedArm(rec)
} catch (e) {
  // onfocusblock 多参编译回退链：探针工程构建失败即降级重试（一次明确
  // 假设一复测——§5.1 预算内）
  const msg = String(e.message ?? e)
  if (FOCUS_MODE !== 'none' && /exited early|never completed/.test(msg)) {
    const idx = FOCUS_MODES.indexOf(FOCUS_MODE)
    if (idx >= 0 && idx < FOCUS_MODES.length - 1) {
      FOCUS_MODE = FOCUS_MODES[idx + 1]
      console.log(`[probe-editor-host] 探针工程启动失败——onfocusblock handler 降级为 ${FOCUS_MODE} 参形态重试（原始错误：${msg.split('\n')[0].slice(0, 160)}）`)
      prepareWorkspace(MERGED_WS)
      rec = await runMergedArm(rec)
    } else {
      throw e
    }
  } else {
    throw e
  }
}
rec.focus_mode = FOCUS_MODE
console.log(`[probe-editor-host] merged 臂完成（focus handler = ${FOCUS_MODE} 参形态）`)

if (RUN_PHASES.includes('navigation')) {
  prepareWorkspace(SPLIT_WS)
  rec = await runSplitHttp(rec)
  await attemptNativeSplitBoot(rec)
} else {
  await attemptNativeSplitBoot(rec)
}

rec = vueShapeCheck(rec)
checks(rec)

if (failures.length > 0) {
  console.error(`\n[probe-editor-host] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-editor-host] RESULT: phase ${RUN_PHASES.join('+')} 全案通过（调查通过≠接口可用——unsupported 结论按行在案）`)
