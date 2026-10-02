#!/usr/bin/env node
// probe_command_availability.mjs — PLAN-035 编辑命令入口真实化探针（T-01 基础
// 案；probe_editor_host 配方变体：merged 直调探针工程 ×2（主工程 + 阴性对照
// variant）+ vue gen-only 形状检查）。
//
//   主工程    六 edit.* action 无 shortcut（title 标注「（菜单暂不可用）」）+
//            help_open 旗标守卫 handler（同步置位+零编辑）+ 根 alert-dialog
//            单「关闭」钮 + Ctrl+S 对照 action（通道活性）+ canary action
//            （enabled_if: "false" —— vue 转译形态观察面）。merged 臂 MCP：
//            六按钮逐个派发（可见说明+零编辑逐值对照）→ Ctrl+Z/Y/A 键盘
//            零宿主路由（flag 恒假）→ Ctrl+S 对照回执 → 磁盘 walk 前后恒等。
//   variant   唯一差异 = edit.undo 挂回 shortcut "Ctrl+Z"——阴性对照：ctrl+z
//            必须 flag 翻真 + last_cmd=undo（键盘→action→handler→flag 仪器
//            链在 shortcut 存在时可测——「取消三 shortcut 的注册效果可观察」
//            的两向证据）。绿相+阴性对照成对在案即 T-01 失败复测完成。
//   vue 形状  `auto build -r vue --gen-only`（两工程各一）：主工程 keymap 含
//            Ctrl+s、不含 Ctrl+z/y/a；variant 含 Ctrl+z；help 文案与 canary
//            disabled 转译形态 grep 在案。
//
// 范围：T-01 = 载体可行性定谳（探针自含 widget，非生产 Store）；T-02 扩
// 真实 EditorStore 六 handler 逐项（store 副本+按钮直派+草稿/dirty 逐值）。
//
// 结果标签：PASS（预期且实测相符）/ FAIL（意外——计失败）。
//
// 用法（仓根）：node tests/probe_command_availability.mjs [--skip-variant] [--skip-vue]

import { spawn, execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const MAIN_DIR = path.join(RUNTIME, 'probe-cmd-avail')
const VARIANT_DIR = path.join(RUNTIME, 'probe-cmd-avail-variant')

const SKIP_VARIANT = process.argv.includes('--skip-variant')
const SKIP_VUE = process.argv.includes('--skip-vue')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase()

// —— 探针正文（含 CJK；键入后 body/dirty 非平凡——零编辑断言域非空转）——
const SEED_BODY = '# Probe\n\n基线正文一，含中文标记。\n'
const TYPED_BODY = `${SEED_BODY}键入标记：脏态下派发六命令。\n`
const esc = (s) => s.replace(/"/g, '\\"').replace(/\n/g, '\\n')

// 探针 widget（本脚本生成件——.runtime 再生，非入库源）。variant 仅
// edit.undo 挂回 Ctrl+Z 一处差异（UNDO_SHORTCUT 参数）。
function makeProbeAt({ undoShortcut = '', withCanary = true } = {}) {
  const undoShortcutDecl = undoShortcut ? `, shortcut: "${undoShortcut}"` : ''
  const canaryDecl = withCanary
    ? `        // canary（T-01 契约 §2 实测面）：enabled_if 字面 "false" 的合成
        // 转译形态观察——本片生产不采用该形态（见契约 §2 冻结结论）。
        action (id: "probe.canary", handler: .HostCtrlS, title: "canary", enabled_if: "false")`
    : ''
  const canaryToolbar = withCanary ? '\n            item (action: "probe.canary")' : ''
  return `// 探针 widget（tests/probe_command_availability.mjs 生成件——直证后随
// .runtime 再生，非入库源）。六 edit.* action 无 shortcut + help 旗标守卫
// handler + 单「关闭」alert-dialog + Ctrl+S 对照 + 键入脏态零编辑不变量。
use back.api: write_wiki

widget App {
    msg {
        Init,
        OnEdit(str),
        CmdUndo, CmdRedo, CmdCut, CmdCopy, CmdPaste, CmdSelectAll,
        HelpClose,
        HostCtrlS,
    }
    model {
        var done bool = false
        var body str = "${esc(SEED_BODY)}"
        var dirty bool = false
        var edits int = 0
        var help_open bool = false
        var last_cmd str = ""
        var ctrl_s int = 0
    }
    view {
        col (style: "h-full w-full") {
            row (style: "h-8 items-center shrink-0 w-full gap-0 px-2") {
                toolbar (style: "ml-auto") {}
            }
            autodown_editor (key: "probe-doc", final: true, style: "h-1/2 w-full") {
                content: .body
                oninput: .OnEdit
            }
            row (style: "h-8 items-center gap-1 shrink-0 px-1") {
                button (text: "undo", variant: "ghost") { onclick: .CmdUndo, style: "h-6 px-2 text-[11px]" }
                button (text: "redo", variant: "ghost") { onclick: .CmdRedo, style: "h-6 px-2 text-[11px]" }
                button (text: "cut", variant: "ghost") { onclick: .CmdCut, style: "h-6 px-2 text-[11px]" }
                button (text: "copy", variant: "ghost") { onclick: .CmdCopy, style: "h-6 px-2 text-[11px]" }
                button (text: "paste", variant: "ghost") { onclick: .CmdPaste, style: "h-6 px-2 text-[11px]" }
                button (text: "select-all", variant: "ghost") { onclick: .CmdSelectAll, style: "h-6 px-2 text-[11px]" }
            }
            alert-dialog (open: .help_open) {
                alert-dialog-content {
                    alert-dialog-header {
                        alert-dialog-title "编辑命令说明"
                        alert-dialog-description "当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选。正文和输入框仍可使用当前编辑器支持的操作。"
                    }
                    alert-dialog-footer {
                        alert-dialog-cancel "关闭" { onclick: .HelpClose }
                    }
                }
            }
        }
    }
    actions {
        action (id: "probe.save", handler: .HostCtrlS, title: "宿主保存", shortcut: "Ctrl+S")
        action (id: "edit.undo", handler: .CmdUndo, title: "撤销（菜单暂不可用）"${undoShortcutDecl})
        action (id: "edit.redo", handler: .CmdRedo, title: "重做（菜单暂不可用）")
        action (id: "edit.cut", handler: .CmdCut, title: "剪切（菜单暂不可用）")
        action (id: "edit.copy", handler: .CmdCopy, title: "复制（菜单暂不可用）")
        action (id: "edit.paste", handler: .CmdPaste, title: "粘贴（菜单暂不可用）")
        action (id: "edit.select-all", handler: .CmdSelectAll, title: "全选（菜单暂不可用）")${canaryDecl}

        toolbar {
            item (action: "probe.save")${canaryToolbar}
        }
    }
    on {
        .Init -> {
            write_wiki("Probe.ad", "${esc(SEED_BODY)}")
            done = true
        }
        .OnEdit(t) -> {
            body = t
            dirty = true
            edits = edits + 1
        }
        .CmdUndo -> { help_open = true; last_cmd = "undo" }
        .CmdRedo -> { help_open = true; last_cmd = "redo" }
        .CmdCut -> { help_open = true; last_cmd = "cut" }
        .CmdCopy -> { help_open = true; last_cmd = "copy" }
        .CmdPaste -> { help_open = true; last_cmd = "paste" }
        .CmdSelectAll -> { help_open = true; last_cmd = "select-all" }
        .HelpClose -> { help_open = false }
        .HostCtrlS -> { ctrl_s = ctrl_s + 1 }
    }
}
`
}

function buildProbeProject(dir, opts) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(path.join(dir, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(dir, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'src', 'front', 'app.at'), makeProbeAt(opts), 'utf8')
  fs.writeFileSync(
    path.join(dir, 'pac.at'),
    `name: "jade-probe-cmd-avail${opts.undoShortcut ? '-variant' : ''}"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeCmdAvail"
window: "900x700"
`,
    'utf8',
  )
}

// ---------------- 磁盘不变量 walk ----------------

function walkHash(root) {
  const out = {}
  const visit = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) visit(p)
      else out[path.relative(root, p).replaceAll('\\', '/')] = sha(p)
    }
  }
  visit(root)
  return out
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

// snapshot AURA 树解析（vm_matrix 同款：缩进深度建树 + head 行文本）
function parseAura(text) {
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
const elementIdOf = (node) => node.head.match(/#(vnode_\d+)/)?.[1] ?? null
const ownText = (node) => node.head.match(/"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
const findFirst = (node, pred) => {
  if (pred(node)) return node
  for (const child of node.children) {
    const hit = findFirst(child, pred)
    if (hit) return hit
  }
  return null
}

// ---------------- merged 臂 ----------------

async function runMergedArm({ dir, ws, port, variant }) {
  const rec = { variant }
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: dir,
    env: { ...process.env, AUTOUI_MCP_PORT: String(port), JADE_WORKSPACE: ws },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const { rpc, callTool } = makeClient(port)
    const deadline = Date.now() + 45000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-cmd-avail', version: '0.1.0' } })
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

    const state = async () => (await callTool('autoui_state', {})).trim()
    const pollBool = async (field, want, timeoutMs = 8000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const st = await state()
        if (boolField(st, field) === want) return st
        if (Date.now() > dl) throw new Error(`state.${field} never reached ${want}`)
        await sleep(200)
      }
    }
    const pollInt = async (field, want, timeoutMs = 8000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const st = await state()
        if ((intField(st, field) ?? 0) >= want) return st
        if (Date.now() > dl) throw new Error(`state.${field} never reached ${want}`)
        await sleep(200)
      }
    }
    const editorId = async () => {
      const snap = await callTool('autoui_snapshot', {})
      const m = snap.split('\n').find((l) => /^\s*textarea #(\S+) \{$/.test(l))
      return m?.match(/^(\s*)textarea #(\S+)/)?.[2] ?? null
    }
    const pressButton = async (label, { timeoutMs = 8000 } = {}) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const tree = parseAura(await callTool('autoui_snapshot', {}))
        const btn = findFirst(tree, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === label)
        if (btn) {
          const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
          if (!/status: ok/.test(res)) throw new Error(`press ${label} not ok: ${res}`)
          return
        }
        if (Date.now() > dl) throw new Error(`button "${label}" not found`)
        await sleep(300)
      }
    }

    // —— 键入脏态（零编辑断言域非平凡）——
    const ed = await editorId()
    if (!ed) throw new Error('editor textarea vnode not found')
    await callTool('autoui_action', { element_id: ed, action: 'type_text', value: TYPED_BODY })
    const st0 = await pollInt('edits', 1)
    rec.typed_edits = intField(st0, 'edits')
    rec.typed_body = strField(st0, 'body')
    rec.typed_dirty = boolField(st0, 'dirty')
    rec.disk_before = walkHash(ws)

    if (!variant) {
      // —— P1/P2 六命令逐个：按钮派发 → flag 翻真+last_cmd 判别 → 关闭清
      // 旗标；每次逐值对照 body/dirty/edits（零编辑不变量）——
      rec.commands = {}
      for (const cmd of ['undo', 'redo', 'cut', 'copy', 'paste', 'select-all']) {
        await pressButton(cmd)
        const stOpen = await pollBool('help_open', true)
        const entry = {
          help_open: true,
          last_cmd: strField(stOpen, 'last_cmd'),
          body: strField(stOpen, 'body'),
          dirty: boolField(stOpen, 'dirty'),
          edits: intField(stOpen, 'edits'),
        }
        await pressButton('关闭')
        const stClosed = await pollBool('help_open', false)
        entry.closed_clean = boolField(stClosed, 'help_open') === false
          && strField(stClosed, 'body') === entry.body
          && boolField(stClosed, 'dirty') === entry.dirty
        rec.commands[cmd] = entry
      }
      // —— P3 键盘零宿主路由：Ctrl+Z/Y/A → flag 恒假+last_cmd 不变——
      rec.keys = {}
      const stPreKeys = await state()
      const lastCmdPre = strField(stPreKeys, 'last_cmd')
      for (const k of ['z', 'y', 'a']) {
        await callTool('autoui_keyboard', { key: k, modifiers: ['ctrl'] })
        await sleep(600)
        const st = await state()
        rec.keys[`ctrl+${k}`] = {
          help_open: boolField(st, 'help_open'),
          last_cmd_unchanged: strField(st, 'last_cmd') === lastCmdPre,
          body: strField(st, 'body'),
          dirty: boolField(st, 'dirty'),
        }
      }
      // —— P4 对照通道：Ctrl+S 回执（键盘→action→handler 活性）——
      await callTool('autoui_keyboard', { key: 's', modifiers: ['ctrl'] })
      const stCtrlS = await pollInt('ctrl_s', 1)
      rec.ctrl_s = intField(stCtrlS, 'ctrl_s')
    } else {
      // —— 阴性对照：variant（undo 挂回 Ctrl+Z）——ctrl+z 必须 flag 翻真
      // + last_cmd=undo（仪器灵敏度证明）——
      await callTool('autoui_keyboard', { key: 'z', modifiers: ['ctrl'] })
      const stHit = await pollBool('help_open', true)
      rec.variant_hit = {
        help_open: boolField(stHit, 'help_open'),
        last_cmd: strField(stHit, 'last_cmd'),
        body: strField(stHit, 'body'),
        dirty: boolField(stHit, 'dirty'),
      }
    }
    rec.disk_after = walkHash(ws)
    rec.boot_tail = appOut.slice(-300)
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
  return rec
}

// ---------------- vue 生成形状 ----------------

function vueShape(dir, label) {
  const gen = spawnSync(AUTO_EXE, ['build', '-r', 'vue', '--gen-only'], { cwd: dir, encoding: 'utf8' })
  const rec = { label, gen_exit: gen.status }
  if (gen.status !== 0) {
    rec.gen_tail = ((gen.stdout ?? '') + (gen.stderr ?? '')).slice(-1200)
    return rec
  }
  const sfcPath = path.join(dir, 'gen', 'front', 'vue', 'src', 'App.vue')
  if (!fs.existsSync(sfcPath)) {
    rec.gen_tail = 'generated SFC not found'
    return rec
  }
  const sfc = fs.readFileSync(sfcPath, 'utf8')
  const km = sfc.match(/const __autoActionsKeymap: Record<string, \(\) => void> = \{([\s\S]*?)\}/)?.[1] ?? ''
  rec.keymap_ctrl_s = /'Ctrl\+s':/.test(km)
  rec.keymap_ctrl_z = /'Ctrl\+z':/.test(km)
  rec.keymap_ctrl_y = /'Ctrl\+y':/.test(km)
  rec.keymap_ctrl_a = /'Ctrl\+a':/.test(km)
  rec.help_text = sfc.includes('当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选')
  rec.window_keydown_listener = /window\.addEventListener\('keydown', __autoActionsKeydown\)/.test(sfc)
  // canary disabled 转译形态（enabled_if: "false" 字面串）——记录用
  const canaryIdx = sfc.indexOf('canary')
  rec.canary_emitted = canaryIdx >= 0
  if (canaryIdx >= 0) {
    rec.canary_line = sfc.split('\n').find((l) => l.includes('canary'))?.trim().slice(0, 240) ?? null
  }
  return rec
}

// ---------------- 工具链指纹 ----------------

function fingerprints() {
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
  fp.jade_edit = rev(repoRoot)
  try {
    fp.jade_edit_desc = execFileSync('git', ['-C', repoRoot, 'describe', '--tags', '--always', '--dirty'], { encoding: 'utf8' }).trim()
  } catch { fp.jade_edit_desc = 'unavailable' }
  const engineDist = 'D:/autostack/auto-down/autodown/packages/engine/dist'
  try {
    const st = fs.statSync(engineDist)
    fp.engine_dist_mtime = st.mtime.toISOString()
    fp.engine_dist_entry_sha = sha(path.join(engineDist, 'index.js'))
  } catch {
    fp.engine_dist_mtime = 'unavailable'
  }
  return fp
}

// ---------------- 断言 ----------------

const failures = []
const ck = (ok, label) => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`)
  if (!ok) failures.push(label)
}

function checkMain(rec) {
  console.log('\n[probe-cmd-avail] 主工程 merged 臂（六命令守卫+键盘零路由+磁盘不变量）：')
  ck(rec.typed_edits >= 1 && rec.typed_dirty === true, `键入脏态建立（edits=${rec.typed_edits} dirty=${rec.typed_dirty}）——零编辑断言域非平凡`)
  for (const cmd of ['undo', 'redo', 'cut', 'copy', 'paste', 'select-all']) {
    const c = rec.commands?.[cmd]
    if (!c) { ck(false, `P1 ${cmd}: 案缺失`); continue }
    ck(c.help_open === true && c.last_cmd === cmd, `P1 ${cmd}: 按钮派发 → 说明开（last_cmd=${c.last_cmd}——逐命令独立判别）`)
    ck(c.body === rec.typed_body && c.dirty === true && c.edits === rec.typed_edits, `P1 ${cmd}: 零编辑（body/dirty/edits 逐值恒等）`)
    ck(c.closed_clean === true, `P2 ${cmd}: 关闭仅清旗标（help_open=false+正文/脏态保持）`)
  }
  for (const k of ['z', 'y', 'a']) {
    const r = rec.keys?.[`ctrl+${k}`]
    if (!r) { ck(false, `P3 ctrl+${k}: 案缺失`); continue }
    ck(r.help_open === false && r.last_cmd_unchanged, `P3 Ctrl+${k.toUpperCase()} 键盘零宿主路由（flag 恒假+last_cmd 不变——shortcut 移除效果可观察）`)
    ck(r.body === rec.typed_body && r.dirty === true, `P3 Ctrl+${k.toUpperCase()} 零正文突变`)
  }
  ck((rec.ctrl_s ?? 0) >= 1, `P4 Ctrl+S 对照回执 ctrl_s=${rec.ctrl_s}（键盘→action→handler 通道活性）`)
  const diskEq = JSON.stringify(rec.disk_before) === JSON.stringify(rec.disk_after)
  ck(diskEq, `磁盘不变量：walk 前后恒等（${Object.keys(rec.disk_before ?? {}).length} 件——六派发+键盘族+开关弹层零磁盘写入）`)
}

function checkVariant(rec) {
  console.log('\n[probe-cmd-avail] variant 阴性对照（undo 挂回 Ctrl+Z——仪器灵敏度）：')
  const h = rec.variant_hit
  ck(h?.help_open === true && h?.last_cmd === 'undo', `阴性对照：ctrl+z → flag 翻真+last_cmd=undo（shortcut 存在时键盘→ActUndo 路由可测——主工程同键零翻转成对在案）`)
  ck(h?.body === rec.typed_body && h?.dirty === true, `阴性对照：handler 守卫仍零编辑（body/dirty 恒等——守卫与路由分域）`)
  const diskEq = JSON.stringify(rec.disk_before) === JSON.stringify(rec.disk_after)
  ck(diskEq, `阴性对照：磁盘 walk 恒等`)
}

function checkVue(rec) {
  console.log('\n[probe-cmd-avail] vue 生成形状（两工程 gen-only）：')
  const m = rec.vue_main
  const v = rec.vue_variant
  if (!m) { ck(false, '主工程 vue 形状：案缺失'); return }
  if (m.gen_exit !== 0) { ck(false, `主工程 gen-only 失败：${(m.gen_tail ?? '').slice(0, 160)}`); return }
  if (v && v.gen_exit !== 0) { ck(false, `variant gen-only 失败：${(v.gen_tail ?? '').slice(0, 160)}`); return }
  ck(m.keymap_ctrl_s && !m.keymap_ctrl_z && !m.keymap_ctrl_y && !m.keymap_ctrl_a, `主工程 keymap：含 Ctrl+s 对照、不含 Ctrl+z/y/a（无 shortcut → 无 keymap 映射）`)
  if (v) ck(v.keymap_ctrl_z, `variant keymap：含 Ctrl+z（shortcut 声明 → keymap 映射——两向形状证据成对）`)
  ck(m.help_text, `主工程：说明文案入 App.vue（alert-dialog 声明发射）`)
  ck(m.window_keydown_listener, `主工程：window keydown 监听在（无新增 listener——既有单监听形状不变）`)
  console.log(`  [INFO] canary enabled_if:"false" 转译：emitted=${m.canary_emitted} line=${m.canary_line ?? '(none)'}`)
}

// ---------------- run ----------------

console.log(`[probe-cmd-avail] T-01 基础案 — 主工程+variant 阴性对照+vue 形状（跳位：variant=${SKIP_VARIANT} vue=${SKIP_VUE}）`)
const rec = {}
rec.fingerprints = fingerprints()
for (const [k, v] of Object.entries(rec.fingerprints)) console.log(`  ${k} = ${String(v).slice(0, 100)}`)

const MAIN_WS = path.join(RUNTIME, 'probe-cmd-avail-ws')
const VARIANT_WS = path.join(RUNTIME, 'probe-cmd-avail-ws-variant')
fs.rmSync(MAIN_WS, { recursive: true, force: true })
fs.mkdirSync(MAIN_WS, { recursive: true })
buildProbeProject(MAIN_DIR, {})
rec.main = await runMergedArm({ dir: MAIN_DIR, ws: MAIN_WS, port: await pickPort(), variant: false })
checkMain(rec.main)

if (!SKIP_VARIANT) {
  fs.rmSync(VARIANT_WS, { recursive: true, force: true })
  fs.mkdirSync(VARIANT_WS, { recursive: true })
  buildProbeProject(VARIANT_DIR, { undoShortcut: 'Ctrl+Z', withCanary: false })
  rec.variant = await runMergedArm({ dir: VARIANT_DIR, ws: VARIANT_WS, port: await pickPort(), variant: true })
  checkVariant(rec.variant)
}

if (!SKIP_VUE) {
  rec.vue_main = vueShape(MAIN_DIR, 'main')
  if (!SKIP_VARIANT) rec.vue_variant = vueShape(VARIANT_DIR, 'variant')
  checkVue(rec)
}

if (failures.length > 0) {
  console.error(`\n[probe-cmd-avail] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-cmd-avail] RESULT: T-01 基础案全过（载体可行性定谳——守卫/键盘/磁盘/形状四域；生产 Store 扩面归 T-02）`)
