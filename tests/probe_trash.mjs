#!/usr/bin/env node
// probe_trash.mjs — PLAN-016 T-01 回收站四组案 + CJK 全弧直证（双臂）+
// 嵌套目录保结构案（merged 探针域）+ 悬空自愈翻转回。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-trash/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + probe_support.at[嵌套目录
//              造档通道——create_dir 清洗层结构性不含分隔符，仅探针消费，
//              非入库源] + 探针 widget Init 内直调全案，返回值落 model
//              字段），`auto run -r vm` 进程内 CALL——autoui_state dump
//              读回；直证后随 .runtime 再生存续（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配
//              方）GET /api/trash_list（**无参 GET 契约首证**——零 D-19
//              暴露面）+ POST /api/trash_restore、/api/trash_purge、
//              /api/delete_page、/api/delete_dir（JSON body——CJK 条目
//              路径走 body，D-19 免疫）。
//
// 案表（§6 T-01 四组案展开；期望值 = SD-1601 定文）：
//   ①改道      r0/r1 delete_page（工作区消失 + .trash/{rel} 在[b1/b2/b3]
//              + 悬空化 l1[[TrashA]] exists:false）；r2 delete_dir（保
//              结构镜像 .trash/BoxDel/…[b4] + 嵌套 .trash/BoxDel/sub/
//              Deep.ad[b5——merged 探针域] + 旧目录消）
//   ②冲突后缀  r3/r4/r5 删→重建→再删 → .trash/TrashB.ad 与
//              .trash/TrashB--1.ad 并存[b6/b7]
//   ③restore   r8 原位恢复（+ b9/b10 + l2 exists 翻转回——悬空自愈）；
//              r9 后缀条目恢复去后缀名（.trash/TrashB--1.ad →
//              TrashB.ad[b15]）；r10 目标冲突拒；r11 无前缀拒；r12
//              ".trash/../" 逃逸拒；r13 "../" 拒；r14 缺失拒
//   ④purge     r16 清单余量（TrashB.ad + BoxDel 树；已恢复条目不在）；
//              r17 purge "ok" + .trash 消[b13]；r18 幂等再 purge "ok"
//   ⑤CJK 全弧  r6 删（POST body）+ r7 清单 GET body CJK + r15 恢复
//              （POST body——D-19 免疫；b11/b12 翻转对）
//   字节整迁   Bytes.ad 自定义 body → 删 → .trash[b1] → r19 恢复 →
//              磁盘逐字节（删-恢复 round-trip 双腿覆盖）
//
// 双臂一致 = 返回值逐案相等 + 布尔翻转对逐案相等 + 清单/链接 contains
// 一致。D-21 负载窗 flake：无-RESULT 早崩按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_trash.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-trash')
const MERGED_WS = path.join(RUNTIME, 'probe-trash-workspace')
const MERGED_PORT = 9363
// 端口自动避让（PLAN-016 G4）——候选段 try-bind 首个可绑；JADE_PROBE_PORT_TRASH 强制通道。
const SPLIT_PORT = await pickPort({ env: 'JADE_PROBE_PORT_TRASH' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 案表（双臂共享；expect = 返回值 / ""）----
const CASES = [
  { id: 'r0-del-bytes', expect: 'Bytes.ad' },
  { id: 'r1-del-page', expect: 'TrashA.ad' },
  { id: 'r2-del-dir', expect: 'BoxDel' },
  { id: 'r3-del-b1', expect: 'TrashB.ad' },
  { id: 'r4-recreate', expect: 'TrashB.ad' },
  { id: 'r5-del-b2', expect: 'TrashB.ad' },
  { id: 'r6-del-cjk', expect: '中文回收.ad' },
  { id: 'r8-restore', expect: 'TrashA.ad' },
  { id: 'r9-restore-suffix', expect: 'TrashB.ad' },
  { id: 'r10-conflict', expect: '' },
  { id: 'r11-no-prefix', expect: '' },
  { id: 'r12-dotdot-trash', expect: '' },
  { id: 'r13-dotdot', expect: '' },
  { id: 'r14-missing', expect: '' },
  { id: 'r15-restore-cjk', expect: '中文回收.ad' },
  { id: 'r19-restore-bytes', expect: 'Bytes.ad' },
  { id: 'r17-purge', expect: 'ok' },
  { id: 'r18-purge-idem', expect: 'ok' },
]
const RET_FIELD = {
  'r0-del-bytes': 'r0', 'r1-del-page': 'r1', 'r2-del-dir': 'r2',
  'r3-del-b1': 'r3', 'r4-recreate': 'r4', 'r5-del-b2': 'r5',
  'r6-del-cjk': 'r6', 'r8-restore': 'r8', 'r9-restore-suffix': 'r9',
  'r10-conflict': 'r10', 'r11-no-prefix': 'r11', 'r12-dotdot-trash': 'r12',
  'r13-dotdot': 'r13', 'r14-missing': 'r14', 'r15-restore-cjk': 'r15',
  'r19-restore-bytes': 'r19', 'r17-purge': 'r17', 'r18-purge-idem': 'r18',
}
// 存在性翻转对（b* 字段；nested = merged 探针域期望；splitSkip = exists
// GET query CJK 面——D-19 同款口径，merged 专属断言，split 侧由磁盘终态
// 断言承载）
const BOOLS = [
  { id: 'b1-trash-bytes', field: 'b1', merged: true, split: true },
  { id: 'b2-trash-trasha', field: 'b2', merged: true, split: true },
  { id: 'b3-root-gone', field: 'b3', merged: false, split: false },
  { id: 'b4-trash-boxpage', field: 'b4', merged: true, split: true },
  { id: 'b5-trash-deep-nested', field: 'b5', merged: true, split: false },
  { id: 'b6-trash-suffix', field: 'b6', merged: true, split: true },
  { id: 'b7-trash-plain', field: 'b7', merged: true, split: true },
  { id: 'b8-trash-cjk', field: 'b8', merged: true, splitSkip: true },
  { id: 'b9-trash-entry-gone', field: 'b9', merged: false, split: false },
  { id: 'b10-root-back', field: 'b10', merged: true, split: true },
  { id: 'b11-trash-cjk-gone', field: 'b11', merged: false, splitSkip: true },
  { id: 'b12-root-cjk-back', field: 'b12', merged: true, splitSkip: true },
  { id: 'b13-trash-gone', field: 'b13', merged: false, split: false },
  { id: 'b14-no-evil', field: 'b14', merged: false, split: false },
  { id: 'b15-root-b-back', field: 'b15', merged: true, split: true },
]
// 清单/链接 contains 断言（转义后 JSON 子串——双臂同域）
const LIST_R7 = ['.trash/TrashB.ad', '.trash/BoxDel/BoxPage.ad', '.trash/中文回收.ad']
const LIST_R7_MERGED_EXTRA = ['.trash/BoxDel/sub/Deep.ad']
const LIST_R16 = ['.trash/TrashB.ad', '.trash/BoxDel/BoxPage.ad']
const LIST_R16_ABSENT = ['.trash/TrashA.ad', '.trash/中文回收.ad', '.trash/Bytes.ad', 'TrashB--1.ad']
const L1_HAS = ['"target":"TrashA","anchor":"","exists":false', '"target":"TrashB","anchor":"","exists":true']
const L2_HAS = ['"target":"TrashA","anchor":"","exists":true']

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

const BYTES_BODY = '# Bytes\n\n字节整迁标记。\n'
const SRC_BODY = '# Src\n\n[[TrashA]] 与 [[TrashB]]。\n'
const TRASH_A_BYTES = '# TrashA\n\n'
const TRASH_B_BYTES = '# TrashB\n\n'
const BOX_PAGE_BYTES = '# BP\n\n页面。\n'

function diskAsserts(ws, tag, failures, opts = {}) {
  const nested = opts.nested === true
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
  // 恢复后根位逐字节（round-trip 双腿 = 字节整迁证明）
  ck(read('TrashA.ad') === TRASH_A_BYTES, '终态 TrashA.ad 模板逐字节（恢复 round-trip）')
  ck(read('TrashB.ad') === TRASH_B_BYTES, '终态 TrashB.ad 模板逐字节（后缀条目恢复名 round-trip）')
  ck(read('Bytes.ad') === BYTES_BODY, '终态 Bytes.ad 自定义 body 逐字节（字节整迁 round-trip）')
  ck(read('中文回收.ad') !== null, '终态 中文回收.ad 根位在')
  ck(read('Src.ad') === SRC_BODY, '终态 Src.ad 源文逐字节（悬空自愈弧线零改写）')
  // 工作区面：目录消 + .trash 消（purge 后）
  ck(!isDir('BoxDel'), '终态 BoxDel/ 目录已消（改道后清理）')
  ck(!isDir('.trash'), '终态 .trash/ 已消（purge）')
  // 越界卫副作用圈定：逃逸文件零创建（候选段相邻位）
  ck(!fs.existsSync(path.join(ws, '..', 'evil.ad')), '终态 工作区外 evil.ad 零创建（越界卫）')
  // 副作用圈定：根 .ad 集合恰为五档；语料 json 不动
  const rootAds = fs.readdirSync(ws).filter((f) => f.endsWith('.ad')).sort()
  ck(rootAds.join(',') === 'Bytes.ad,Src.ad,TrashA.ad,TrashB.ad,中文回收.ad',
    `根 .ad 集合恰为五档（实际：${rootAds.join(', ')}）`)
  ck(read('jade-garden-index.json') !== null, '语料 jade-garden-index.json 在盘（非 .ad 零涉）')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_trash.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 setup + 回收站全案，返回值落 model 字段
// 供 autoui_state dump。入口文件名固定 app.at（auto 前端入口约定）。
use back.api: create_page, write_wiki, create_dir, delete_page, delete_dir, trash_list, trash_restore, trash_purge, exists, link_index
use back.probe_support: ws_join

widget App {
    msg { Init }
    model {
        var done bool = false
        var s1 str = ""
        var s2 str = ""
        var s3 str = ""
        var s4 str = ""
        var s5 str = ""
        var s6 str = ""
        var s7 str = ""
        var s8 str = ""
        var s9 str = ""
        var s10 str = ""
        var s11 str = ""
        var r0 str = ""
        var r1 str = ""
        var r2 str = ""
        var r3 str = ""
        var r4 str = ""
        var r5 str = ""
        var r6 str = ""
        var r7 str = ""
        var r8 str = ""
        var r9 str = ""
        var r10 str = ""
        var r11 str = ""
        var r12 str = ""
        var r13 str = ""
        var r14 str = ""
        var r15 str = ""
        var r16 str = ""
        var r17 str = ""
        var r18 str = ""
        var r19 str = ""
        var b1 bool = false
        var b2 bool = false
        var b3 bool = false
        var b4 bool = false
        var b5 bool = false
        var b6 bool = false
        var b7 bool = false
        var b8 bool = false
        var b9 bool = false
        var b10 bool = false
        var b11 bool = false
        var b12 bool = false
        var b13 bool = false
        var b14 bool = false
        var b15 bool = false
        var l1 str = ""
        var l2 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: trash (delete-reroute/list/restore/purge)" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            // setup（自证字段 s1..s11——一调用一字段）
            s1 = create_page("Bytes")
            s2 = write_wiki("Bytes.ad", "# Bytes\\n\\n字节整迁标记。\\n")
            s3 = create_page("TrashA")
            s4 = create_page("Src")
            s5 = write_wiki("Src.ad", "# Src\\n\\n[[TrashA]] 与 [[TrashB]]。\\n")
            s6 = create_dir("BoxDel")
            s7 = write_wiki("BoxDel/BoxPage.ad", "# BP\\n\\n页面。\\n")
            s8 = ws_join("BoxDel/sub")
            s9 = write_wiki("BoxDel/sub/Deep.ad", "# Deep\\n\\n")
            s10 = create_page("TrashB")
            s11 = create_page("中文回收")
            // ① 改道：page + dir（保结构）+ 悬空化前采
            r0 = delete_page("Bytes.ad")
            b1 = exists(".trash/Bytes.ad")
            r1 = delete_page("TrashA.ad")
            b2 = exists(".trash/TrashA.ad")
            b3 = exists("TrashA.ad")
            l1 = link_index("", 4)
            r2 = delete_dir("BoxDel")
            b4 = exists(".trash/BoxDel/BoxPage.ad")
            b5 = exists(".trash/BoxDel/sub/Deep.ad")
            // ② 冲突后缀：删→重建→再删 → --1 并存
            r3 = delete_page("TrashB.ad")
            r4 = create_page("TrashB")
            r5 = delete_page("TrashB.ad")
            b6 = exists(".trash/TrashB--1.ad")
            b7 = exists(".trash/TrashB.ad")
            // ⑤ CJK 全弧：删（POST body）
            r6 = delete_page("中文回收.ad")
            b8 = exists(".trash/中文回收.ad")
            // 清单（GET 无参——裸数组）
            r7 = trash_list()
            // ③ restore：原位 + 悬空自愈翻转回 + 后缀剥名 + 三拒
            r8 = trash_restore(".trash/TrashA.ad")
            b9 = exists(".trash/TrashA.ad")
            b10 = exists("TrashA.ad")
            l2 = link_index("", 4)
            r9 = trash_restore(".trash/TrashB--1.ad")
            b15 = exists("TrashB.ad")
            r10 = trash_restore(".trash/TrashB.ad")
            r11 = trash_restore("TrashA.ad")
            r12 = trash_restore(".trash/../evil.ad")
            r13 = trash_restore("../evil.ad")
            r14 = trash_restore(".trash/no-such.ad")
            r15 = trash_restore(".trash/中文回收.ad")
            b11 = exists(".trash/中文回收.ad")
            b12 = exists("中文回收.ad")
            r19 = trash_restore(".trash/Bytes.ad")
            // ④ purge：清单余量 → 清空 → 幂等
            r16 = trash_list()
            r17 = trash_purge()
            b13 = exists(".trash")
            r18 = trash_purge()
            b14 = exists("evil.ad")
            done = true
        }
    }
}
`

const PROBE_SUPPORT_AT = `// 探针专用支撑件（tests/probe_trash.mjs 生成——随 .runtime 再生，非
// 入库源）：嵌套目录造档通道。create_dir 清洗层 "/"→'-' 结构性不含分隔
// 符（SD-1201 v1 单层口径），① 嵌套案 setup 专用——直调 File.create_dir
//（create_dir_all 递归语义，探针 A 定谳）+ is_dir 复核。
fn ws_root() str {
    var root str = Env.get("JADE_WORKSPACE")
    if root == "" {
        root = Env.get("AUTO_PROJECT_DIR")
    }
    if root == "" {
        root = "."
    }
    return root
}

pub fn ws_join(rel str) str {
    var full str = ws_root() + "/" + rel
    File.create_dir(full)
    if File.is_dir(full) {
        return rel
    }
    return ""
}
`

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'back', 'probe_support.at'), PROBE_SUPPORT_AT, 'utf8')
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "jade-probe-trash"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeTrash"
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-trash', version: '0.1.0' } })
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
    const setupOk = strField(dump, 's1') === 'Bytes.ad' && truthy(boolField(dump, 's2'))
      && strField(dump, 's3') === 'TrashA.ad' && strField(dump, 's4') === 'Src.ad'
      && truthy(boolField(dump, 's5')) && strField(dump, 's6') === 'BoxDel'
      && truthy(boolField(dump, 's7')) && strField(dump, 's8') === 'BoxDel/sub'
      && truthy(boolField(dump, 's9')) && strField(dump, 's10') === 'TrashB.ad'
      && strField(dump, 's11') === '中文回收.ad'
    if (!setupOk) throw new Error(`probe setup failed:\n${dump.slice(0, 1200)}`)
    const returns = {}
    for (const c of CASES) {
      returns[c.id] = strField(dump, RET_FIELD[c.id])
      if (returns[c.id] === null) throw new Error(`probe state missing ${RET_FIELD[c.id]}:\n${dump.slice(0, 800)}`)
    }
    const bools = {}
    for (const b of BOOLS) {
      bools[b.id] = boolField(dump, b.field)
      if (bools[b.id] === null) throw new Error(`probe state missing ${b.field}`)
    }
    const lists = { r7: strField(dump, 'r7'), r16: strField(dump, 'r16') }
    const links = { l1: strField(dump, 'l1'), l2: strField(dump, 'l2') }
    if (lists.r7 === null || lists.r16 === null || links.l1 === null || links.l2 === null) {
      throw new Error('probe state missing r7/r16/l1/l2')
    }
    return {
      returns, bools, lists, links, nested: true,
      diskCheck: (failures) => diskAsserts(MERGED_WS, 'merged', failures, { nested: true }),
    }
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
    const get = async (api, params) => {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${back.url}/api/${api}${qs ? `?${qs}` : ''}`)
      if (!res.ok) throw new Error(`GET ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      let val
      try { val = JSON.parse(text) } catch { val = text }
      return String(val)
    }
    const boolOf = (v) => (v === 'true' || v === true || v === 1 || v === '1' ? 'true' : 'false')
    const returns = {}
    const bools = {}
    const exec = async (id, api, payload) => { returns[id] = await post(api, payload) }
    // setup
    if (await post('create_page', { title: 'Bytes' }) !== 'Bytes.ad') throw new Error('setup Bytes failed')
    if (!(await post('write_wiki', { path: 'Bytes.ad', body: BYTES_BODY }))) throw new Error('setup Bytes body failed')
    if (await post('create_page', { title: 'TrashA' }) !== 'TrashA.ad') throw new Error('setup TrashA failed')
    if (await post('create_page', { title: 'Src' }) !== 'Src.ad') throw new Error('setup Src failed')
    if (!(await post('write_wiki', { path: 'Src.ad', body: SRC_BODY }))) throw new Error('setup Src body failed')
    if (await post('create_dir', { name: 'BoxDel' }) !== 'BoxDel') throw new Error('setup BoxDel failed')
    if (!(await post('write_wiki', { path: 'BoxDel/BoxPage.ad', body: BOX_PAGE_BYTES }))) throw new Error('setup BoxPage failed')
    if (await post('create_page', { title: 'TrashB' }) !== 'TrashB.ad') throw new Error('setup TrashB failed')
    if (await post('create_page', { title: '中文回收' }) !== '中文回收.ad') throw new Error('setup 中文回收 failed')
    // ① 改道
    await exec('r0-del-bytes', 'delete_page', { path: 'Bytes.ad' })
    bools['b1-trash-bytes'] = boolOf(await get('exists', { path: '.trash/Bytes.ad' }))
    await exec('r1-del-page', 'delete_page', { path: 'TrashA.ad' })
    bools['b2-trash-trasha'] = boolOf(await get('exists', { path: '.trash/TrashA.ad' }))
    bools['b3-root-gone'] = boolOf(await get('exists', { path: 'TrashA.ad' }))
    const links = { l1: await get('link_index', { path: '', depth: '4' }) }
    await exec('r2-del-dir', 'delete_dir', { path: 'BoxDel' })
    bools['b4-trash-boxpage'] = boolOf(await get('exists', { path: '.trash/BoxDel/BoxPage.ad' }))
    bools['b5-trash-deep-nested'] = boolOf(await get('exists', { path: '.trash/BoxDel/sub/Deep.ad' }))
    // ② 冲突后缀
    await exec('r3-del-b1', 'delete_page', { path: 'TrashB.ad' })
    await exec('r4-recreate', 'create_page', { title: 'TrashB' })
    await exec('r5-del-b2', 'delete_page', { path: 'TrashB.ad' })
    bools['b6-trash-suffix'] = boolOf(await get('exists', { path: '.trash/TrashB--1.ad' }))
    bools['b7-trash-plain'] = boolOf(await get('exists', { path: '.trash/TrashB.ad' }))
    // ⑤ CJK 删（POST body）
    await exec('r6-del-cjk', 'delete_page', { path: '中文回收.ad' })
    // b8 存在性 split 侧跳过（exists GET query CJK——D-19 口径）
    bools['b8-trash-cjk'] = '(skip)'
    // 清单（GET 无参）
    const lists = { r7: await get('trash_list', {}) }
    // ③ restore
    await exec('r8-restore', 'trash_restore', { entry: '.trash/TrashA.ad' })
    bools['b9-trash-entry-gone'] = boolOf(await get('exists', { path: '.trash/TrashA.ad' }))
    bools['b10-root-back'] = boolOf(await get('exists', { path: 'TrashA.ad' }))
    links.l2 = await get('link_index', { path: '', depth: '4' })
    await exec('r9-restore-suffix', 'trash_restore', { entry: '.trash/TrashB--1.ad' })
    bools['b15-root-b-back'] = boolOf(await get('exists', { path: 'TrashB.ad' }))
    await exec('r10-conflict', 'trash_restore', { entry: '.trash/TrashB.ad' })
    await exec('r11-no-prefix', 'trash_restore', { entry: 'TrashA.ad' })
    await exec('r12-dotdot-trash', 'trash_restore', { entry: '.trash/../evil.ad' })
    await exec('r13-dotdot', 'trash_restore', { entry: '../evil.ad' })
    await exec('r14-missing', 'trash_restore', { entry: '.trash/no-such.ad' })
    await exec('r15-restore-cjk', 'trash_restore', { entry: '.trash/中文回收.ad' })
    // b11/b12 存在性 split 侧跳过（exists GET query CJK——D-19 口径）
    bools['b11-trash-cjk-gone'] = '(skip)'
    bools['b12-root-cjk-back'] = '(skip)'
    await exec('r19-restore-bytes', 'trash_restore', { entry: '.trash/Bytes.ad' })
    // ④ purge
    lists.r16 = await get('trash_list', {})
    await exec('r17-purge', 'trash_purge', {})
    bools['b13-trash-gone'] = boolOf(await get('exists', { path: '.trash' }))
    await exec('r18-purge-idem', 'trash_purge', {})
    bools['b14-no-evil'] = boolOf(await get('exists', { path: 'evil.ad' }))
    return {
      returns, bools, lists, links, nested: false,
      diskCheck: (failures) => diskAsserts(back.workspace, 'split', failures, { nested: false }),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-trash] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-trash] arm 2: split serve-back GET/POST（:${SPLIT_PORT}，无参 GET 首证 + body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-trash] 双臂返回值逐案对读：')
let agree = true
for (const c of CASES) {
  const m = merged.returns[c.id]
  const s = split.returns[c.id]
  const ok = m === s && m === c.expect
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect="${c.expect}"`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}" expect="${c.expect}"`)
}
console.log('[probe-trash] 存在性翻转对逐案对读：')
const normBool = (v) => (v === '1' ? 'true' : v === '0' ? 'false' : v)
for (const b of BOOLS) {
  const m = normBool(merged.bools[b.id])
  const s = b.splitSkip ? '(skip)' : normBool(split.bools[b.id])
  const em = b.merged ? 'true' : 'false'
  const es = b.splitSkip ? '(skip)' : (b.split ? 'true' : 'false')
  const ok = m === em && (b.splitSkip || s === es)
  // agree 只跟踪双臂应相等的案（b5 嵌套/b8/b11/b12 D-19 口径 arm-variant 除外）
  if (!b.splitSkip && b.merged === b.split && m !== s) agree = false
  console.log(`  [${b.id}] ${ok ? 'PASS' : 'FAIL'} — merged=${m}（expect ${em}） split=${s}（expect ${es}${b.splitSkip ? '——exists GET CJK D-19 口径' : b.merged !== b.split ? '——嵌套造档通道探针域' : ''}）`)
  if (!ok) failures.push(`bool ${b.id}: merged=${m}/${em} split=${s}/${es}`)
}
console.log('[probe-trash] 清单 contains 对读：')
const listChecks = [
  { tag: 'r7', list: merged.lists.r7, has: [...LIST_R7, ...(merged.nested ? LIST_R7_MERGED_EXTRA : [])], absent: [] },
  { tag: 'r7(split)', list: split.lists.r7, has: LIST_R7, absent: [] },
  { tag: 'r16', list: merged.lists.r16, has: LIST_R16, absent: LIST_R16_ABSENT },
  { tag: 'r16(split)', list: split.lists.r16, has: LIST_R16, absent: LIST_R16_ABSENT },
]
for (const lc of listChecks) {
  const ok = lc.list !== null && lc.has.every((h) => lc.list.includes(`"path":"${h}"`)) && lc.absent.every((a) => !lc.list.includes(`"path":"${a}"`))
  console.log(`  [${lc.tag}] ${ok ? 'PASS' : 'FAIL'} — 含 ${lc.has.length} 项 斥 ${lc.absent.length} 项`)
  if (!ok) failures.push(`list ${lc.tag}: ${JSON.stringify(lc.list)?.slice(0, 300)}`)
}
console.log('[probe-trash] 悬空化/自愈 contains 对读：')
const linkChecks = [
  { tag: 'l1(merged)', raw: merged.links.l1, has: L1_HAS },
  { tag: 'l1(split)', raw: split.links.l1, has: L1_HAS },
  { tag: 'l2(merged)', raw: merged.links.l2, has: L2_HAS },
  { tag: 'l2(split)', raw: split.links.l2, has: L2_HAS },
]
for (const lc of linkChecks) {
  const ok = lc.raw !== null && lc.has.every((h) => lc.raw.includes(h))
  console.log(`  [${lc.tag}] ${ok ? 'PASS' : 'FAIL'} — ${lc.has.map((h) => h.slice(0, 40) + '…').join(' && ')}`)
  if (!ok) failures.push(`link ${lc.tag}: contains 失守`)
}

if (failures.length > 0) {
  console.error(`\n[probe-trash] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-trash] RESULT: merged + split 全案通过（四组案①改道[保结构+嵌套 merged]/②冲突后缀 --1 并存/③restore[原位+后缀剥名+冲突拒+越界卫三形]/④purge[幂等]+⑤CJK 全弧[GET 无参 body 面]+悬空自愈翻转回[l1/l2]+字节整迁 round-trip+双臂一致=${agree}）`)
