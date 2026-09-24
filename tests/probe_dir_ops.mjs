#!/usr/bin/env node
// probe_dir_ops.mjs — PLAN-014 T-01 delete_dir 六案 + rename_dir 六案直证
// （双臂）+ 嵌套案（merged 探针域）+ 链接零扰动归一 diff。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-dir-ops/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + probe_support.at[嵌套目录
//              造档通道——create_dir 清洗层结构性不含分隔符，仅探针消费，
//              非入库源] + 探针 widget Init 内直调全案，返回值落 model
//              字段），`auto run -r vm` 进程内 CALL——autoui_state dump
//              读回；直证后随 .runtime 再生存续（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              POST /api/delete_dir、/api/rename_dir（JSON body——D-19 面：
//              目录路径/新名 CJK 常态走 body）。
//
// **probe C 定谳件**：File.remove_dir / File.remove_dir_all 可调性首闸
// ——别名双表在册[native_catalog 1014/1015]，同族 create_dir/is_dir
// 探针 A/B 已证；解析层不可调则探针工程 boot 即 fatal（D-24① 同判面），
// 全案绿 = 可调 + 语义双定谳。
//
// 案表（§6 十一案展开；期望值 = SD-1401 三步/五步定文）：
//   d① 根拒+非目录拒  delete_dir("") → ""；delete_dir("DelFile.ad") → ""
//   d② 递归基础       DirDel（2 档含内链）删除 → "DirDel"；目录+档全消
//   d③ 空目录         EmptyDir → "EmptyDir"；消
//   d④ CJK            临时目录（中文甲）→ "临时目录"；消
//   d⑤ 缺失再删       DirDel 再删 → ""（卫面——双复核前置）
//   r① 基础           DirRen（RenA+RenB）→ "DirRen2"；逐文件新位 + 字节
//                     整迁 + 旧目录消
//   r② 纯 .ad 卫      混入 notes.txt → ""；目录/档零变化（DirRen3 不在）
//   r③ 同层同名拒     → Sibling（同名目录）→ ""；→ Blocker（同名档）→ ""
//   r④ casefold 拒    DirRen2 → dirren2 → ""（006 G3 口径目录级）
//   r⑤ CJK            资料夹（中文乙）→ 归档夹 → "归档夹"；字节整迁
//   r⑥ 缺失拒         no-such-dir → ""
//   r⑦ 嵌套（merged） DirNest/sub/Deep.ad → "DirNest2"；余段迁移 + 旧
//                     嵌套目录清理（逆序 remove_dir 面）——setup 走
//                     probe_support.ws_join（split 臂无此通道，案跳过）
//   r⑧ 链接零扰动     link_index 前后定向 diff 归一相等（仅 path/
//                     target_path 字段变化——moved 集合归一 <MOVED> 后
//                     逐字节相等；三联对照目录级固化）双臂
//
// 双臂一致 = 返回值逐案相等 + link JSON 归一相等。D-21 负载窗 flake：
// 无-RESULT 早崩按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_dir_ops.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-dir-ops')
const MERGED_WS = path.join(RUNTIME, 'probe-dir-ops-workspace')
const MERGED_PORT = 9362
// 8251-8950 = WinNAT 排除区段（F-R8-1）；8222..8227 = 探针族在册口——
// 本案 8231（8228 首跑撞临时源端口 CLOSE_WAIT 出站连接[10048]——非监听
// 占用，顺延避让）。
const SPLIT_PORT = 8231

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 案表（双臂共享；expect = 归一路径 / ""）----
const CASES = [
  { id: 'd1-root', expect: '' },
  { id: 'd2-not-dir', expect: '' },
  { id: 'd3-recursive', expect: 'DirDel' },
  { id: 'd4-empty', expect: 'EmptyDir' },
  { id: 'd5-cjk', expect: '临时目录' },
  { id: 'd6-missing', expect: '' },
  { id: 'r1-basic', expect: 'DirRen2' },
  { id: 'r2-pur-ad', expect: '' },
  { id: 'r3a-same-dir', expect: '' },
  { id: 'r3b-same-file', expect: '' },
  { id: 'r4-casefold', expect: '' },
  { id: 'r5-cjk', expect: '归档夹' },
  { id: 'r6-missing', expect: '' },
]
const RET_FIELD = {
  'd1-root': 'd1', 'd2-not-dir': 'd2', 'd3-recursive': 'd3', 'd4-empty': 'd4',
  'd5-cjk': 'd5', 'd6-missing': 'd6', 'r1-basic': 'r1', 'r2-pur-ad': 'r2',
  'r3a-same-dir': 'r3', 'r3b-same-file': 'r4', 'r4-casefold': 'r5',
  'r5-cjk': 'r6', 'r6-missing': 'r7',
}
// r⑦ 嵌套（merged 探针域）+ r⑧ 链接面（link_index 前后采 dual field）
const MERGED_ONLY_CASES = [{ id: 'r7-nested', expect: 'DirNest2', field: 'r8' }]

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

const REN_B_BYTES = '# RenB\n\n正文。\n'
const REN_A_TMPL = '# RenA\n\n'
const CJK_YI_TMPL = '# 中文乙\n\n'

/** r⑧ 链接零扰动归一（vm_matrix ljNorm 同族——moved 集合 path/target_path
 *  归一 <MOVED> + 页序无关排序后逐字节比对）。 */
function ljNorm(raw, movedSet) {
  const unesc = (s) => { try { return JSON.parse(`"${s}"`) } catch { return s } }
  try {
    const pages = JSON.parse(unesc(raw))
    const norm = (p) => (movedSet.has(p) ? '<MOVED>' : p)
    return JSON.stringify(pages.map((p) => ({
      path: norm(p.path), title: p.title, dtitle: p.dtitle,
      links: p.links.map((l) => ({ ...l, target_path: norm(l.target_path) })),
    })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
  } catch {
    return '<unparsable>'
  }
}

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
  // d② 递归：目录+档全消
  ck(!isDir('DirDel'), 'd② DirDel/ 目录已消')
  ck(read('DirDel/DelPageA.ad') === null, 'd② DirDel/DelPageA.ad 已消')
  ck(read('DirDel/DelPageB.ad') === null, 'd② DirDel/DelPageB.ad 已消')
  // d③ 空目录
  ck(!isDir('EmptyDir'), 'd③ EmptyDir/ 已消')
  // d④ CJK
  ck(!isDir('临时目录'), 'd④ 临时目录/ 已消')
  // d⑤ 缺失再删零复活
  ck(!isDir('DirDel'), 'd⑤ DirDel/ 零复活')
  // d① 非目录拒：档原样
  ck(read('DelFile.ad') === '# DelFile\n\n', 'd① DelFile.ad 原样（非目录拒零落盘）')
  // r① 基础：旧无新有 + 字节整迁
  ck(!isDir('DirRen'), 'r① DirRen/ 旧目录已消')
  ck(read('DirRen2/RenA.ad') === REN_A_TMPL, 'r① DirRen2/RenA.ad 模板逐字节')
  ck(read('DirRen2/RenB.ad') === REN_B_BYTES, 'r① DirRen2/RenB.ad 字节整迁逐字节')
  // r② 纯 .ad 卫：目录零变化 + DirRen3 不在
  ck(isDir('DirRen2'), 'r② DirRen2/ 原样（卫拒零落盘）')
  ck(read('DirRen2/notes.txt') === 'x\n', 'r② notes.txt 原样')
  ck(!isDir('DirRen3'), 'r② DirRen3/ 不应在')
  ck(read('DirRen2/RenA.ad') === REN_A_TMPL, 'r② RenA.ad 原样')
  // r③ 同层同名拒两形：Sibling/Blocker 原样
  ck(isDir('Sibling'), 'r③ Sibling/ 原样')
  ck(read('Blocker.ad') === '# Blocker\n\n', 'r③ Blocker.ad 原样')
  ck(isDir('DirRen2'), 'r③ DirRen2/ 原样')
  // r④ casefold：目录名 casefold 计数恰 1（Windows 不敏感 FS——probe_rename ⑧ 同款）
  const rootEntries = fs.readdirSync(ws)
  const drCount = rootEntries.filter((f) => f.toLowerCase() === 'dirren2').length
  ck(drCount === 1, `r④ dirren2 casefold 计数=1（实际 ${drCount}）`)
  // r⑤ CJK
  ck(!isDir('资料夹'), 'r⑤ 资料夹/ 旧目录已消')
  ck(read('归档夹/中文乙.ad') === CJK_YI_TMPL, 'r⑤ 归档夹/中文乙.ad 模板逐字节')
  // r⑥ 缺失拒
  ck(!isDir('xx'), 'r⑥ xx/ 不应在')
  // r⑦ 嵌套（merged 探针域）
  if (nested) {
    ck(!isDir('DirNest'), 'r⑦ DirNest/ 旧目录已消（含嵌套清理）')
    ck(isDir('DirNest2/sub'), 'r⑦ DirNest2/sub/ 镜像嵌套目录在')
    ck(read('DirNest2/sub/Deep.ad') === '# Deep\n\n', 'r⑦ DirNest2/sub/Deep.ad 余段迁移逐字节')
  }
  // 副作用圈定：根 .ad 集合恰为三档；语料 json 不动
  const rootAds = rootEntries.filter((f) => f.endsWith('.ad')).sort()
  ck(rootAds.join(',') === 'Blocker.ad,DelFile.ad,LinkSrc.ad', `根 .ad 集合恰为三档（实际：${rootAds.join(', ')}）`)
  ck(read('jade-garden-index.json') !== null, '语料 jade-garden-index.json 在盘（非 .ad 零涉）')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_dir_ops.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 setup + delete_dir 六案 + rename_dir 六案
// + 嵌套案 + link_index 前后采，返回值落 model 字段供 autoui_state dump。
// 入口文件名固定 app.at（auto 前端入口约定）。
use back.api: create_dir, move_page, create_page, write_wiki, delete_dir, rename_dir, link_index
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
        var s12 str = ""
        var s13 str = ""
        var s14 str = ""
        var s15 str = ""
        var d1 str = ""
        var d2 str = ""
        var d3 str = ""
        var d4 str = ""
        var d5 str = ""
        var d6 str = ""
        var l1 str = ""
        var r1 str = ""
        var r2 str = ""
        var r3 str = ""
        var r4 str = ""
        var r5 str = ""
        var r6 str = ""
        var r7 str = ""
        var r8 str = ""
        var w1 bool = false
        var l2 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: dir ops (delete/rename)" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            // setup（自证字段 s1..s15——一调用一字段）
            s1 = create_page("DelFile")
            s2 = create_dir("DirDel")
            s3 = create_page("DelPageA")
            s4 = move_page("DelPageA.ad", "DirDel")
            s5 = write_wiki("DirDel/DelPageB.ad", "# B\\n\\n[[DelPageA]]\\n")
            s6 = create_dir("EmptyDir")
            s7 = create_dir("临时目录")
            s8 = create_page("中文甲")
            s9 = move_page("中文甲.ad", "临时目录")
            s10 = create_dir("DirRen")
            s11 = create_page("RenA")
            s12 = move_page("RenA.ad", "DirRen")
            s13 = write_wiki("DirRen/RenB.ad", "# RenB\\n\\n正文。\\n")
            s14 = create_dir("Sibling")
            s14 = create_page("Blocker")
            s15 = create_dir("资料夹")
            s15 = create_page("中文乙")
            s15 = move_page("中文乙.ad", "资料夹")
            s15 = ws_join("DirNest/sub")
            s15 = write_wiki("DirNest/sub/Deep.ad", "# Deep\\n\\n")
            s15 = create_page("LinkSrc")
            s15 = write_wiki("LinkSrc.ad", "# LS\\n\\n[[RenA]] 与 [[RenB]]。\\n")
            // delete_dir 六案（d①..d⑤——⑤ 缺失再删在 d② 后）
            d1 = delete_dir("")
            d2 = delete_dir("DelFile.ad")
            d3 = delete_dir("DirDel")
            d4 = delete_dir("EmptyDir")
            d5 = delete_dir("临时目录")
            d6 = delete_dir("DirDel")
            // r⑧ 链接前采（删除面已收口——DirDel 页不在窗内）
            l1 = link_index("", 4)
            // rename_dir 六案
            r1 = rename_dir("DirRen", "DirRen2")
            w1 = write_wiki("DirRen2/notes.txt", "x\\n")
            r2 = rename_dir("DirRen2", "DirRen3")
            r3 = rename_dir("DirRen2", "Sibling")
            r4 = rename_dir("DirRen2", "Blocker")
            r5 = rename_dir("DirRen2", "dirren2")
            r6 = rename_dir("资料夹", "归档夹")
            r7 = rename_dir("no-such-dir", "xx")
            r8 = rename_dir("DirNest", "DirNest2")
            l2 = link_index("", 4)
            done = true
        }
    }
}
`

const PROBE_SUPPORT_AT = `// 探针专用支撑件（tests/probe_dir_ops.mjs 生成——随 .runtime 再生，非
// 入库源）：嵌套目录造档通道。create_dir 清洗层 "/"→'-' 结构性不含分隔
// 符（SD-1201 v1 单层口径），r⑦ 嵌套案 setup 专用——直调 File.create_dir
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
    `name: "jade-probe-dir-ops"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeDirOps"
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-dir-ops', version: '0.1.0' } })
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
    const setupOk = strField(dump, 's1') === 'DelFile.ad' && strField(dump, 's2') === 'DirDel'
      && strField(dump, 's3') === 'DelPageA.ad' && strField(dump, 's4') === 'DirDel/DelPageA.ad'
      && truthy(boolField(dump, 's5')) && strField(dump, 's6') === 'EmptyDir'
      && strField(dump, 's7') === '临时目录' && strField(dump, 's8') === '中文甲.ad'
      && strField(dump, 's9') === '临时目录/中文甲.ad' && strField(dump, 's10') === 'DirRen'
      && strField(dump, 's11') === 'RenA.ad' && strField(dump, 's12') === 'DirRen/RenA.ad'
      && truthy(boolField(dump, 's13')) && strField(dump, 's14') === 'Blocker.ad'
      && truthy(boolField(dump, 's15'))
    if (!setupOk) throw new Error(`probe setup failed:\n${dump.slice(0, 1200)}`)
    const returns = {}
    for (const c of CASES) {
      returns[c.id] = strField(dump, RET_FIELD[c.id])
      if (returns[c.id] === null) throw new Error(`probe state missing ${RET_FIELD[c.id]}:\n${dump.slice(0, 800)}`)
    }
    for (const c of MERGED_ONLY_CASES) {
      returns[c.id] = strField(dump, c.field)
      if (returns[c.id] === null) throw new Error(`probe state missing ${c.field}`)
    }
    const links = { before: strField(dump, 'l1'), after: strField(dump, 'l2') }
    if (links.before === null || links.after === null) throw new Error('probe state missing l1/l2')
    return {
      returns, links, nested: true,
      diskCheck: (failures) => diskAsserts(MERGED_WS, 'merged', failures, { nested: true }),
    }
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
    const get = async (api, params) => {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${back.url}/api/${api}${qs ? `?${qs}` : ''}`)
      if (!res.ok) throw new Error(`GET ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      let val
      try { val = JSON.parse(text) } catch { val = text }
      return String(val)
    }
    const returns = {}
    const exec = async (id, api, payload) => { returns[id] = await post(api, payload) }
    // setup
    if (await post('create_page', { title: 'DelFile' }) !== 'DelFile.ad') throw new Error('setup DelFile failed')
    if (await post('create_dir', { name: 'DirDel' }) !== 'DirDel') throw new Error('setup DirDel failed')
    if (await post('create_page', { title: 'DelPageA' }) !== 'DelPageA.ad') throw new Error('setup DelPageA failed')
    if (await post('move_page', { path: 'DelPageA.ad', dir: 'DirDel' }) !== 'DirDel/DelPageA.ad') throw new Error('setup move DelPageA failed')
    if (!(await post('write_wiki', { path: 'DirDel/DelPageB.ad', body: '# B\n\n[[DelPageA]]\n' }))) throw new Error('setup DelPageB failed')
    if (await post('create_dir', { name: 'EmptyDir' }) !== 'EmptyDir') throw new Error('setup EmptyDir failed')
    if (await post('create_dir', { name: '临时目录' }) !== '临时目录') throw new Error('setup 临时目录 failed')
    if (await post('create_page', { title: '中文甲' }) !== '中文甲.ad') throw new Error('setup 中文甲 failed')
    if (await post('move_page', { path: '中文甲.ad', dir: '临时目录' }) !== '临时目录/中文甲.ad') throw new Error('setup move 中文甲 failed')
    if (await post('create_dir', { name: 'DirRen' }) !== 'DirRen') throw new Error('setup DirRen failed')
    if (await post('create_page', { title: 'RenA' }) !== 'RenA.ad') throw new Error('setup RenA failed')
    if (await post('move_page', { path: 'RenA.ad', dir: 'DirRen' }) !== 'DirRen/RenA.ad') throw new Error('setup move RenA failed')
    if (!(await post('write_wiki', { path: 'DirRen/RenB.ad', body: REN_B_BYTES }))) throw new Error('setup RenB failed')
    if (await post('create_dir', { name: 'Sibling' }) !== 'Sibling') throw new Error('setup Sibling failed')
    if (await post('create_page', { title: 'Blocker' }) !== 'Blocker.ad') throw new Error('setup Blocker failed')
    if (await post('create_dir', { name: '资料夹' }) !== '资料夹') throw new Error('setup 资料夹 failed')
    if (await post('create_page', { title: '中文乙' }) !== '中文乙.ad') throw new Error('setup 中文乙 failed')
    if (await post('move_page', { path: '中文乙.ad', dir: '资料夹' }) !== '资料夹/中文乙.ad') throw new Error('setup move 中文乙 failed')
    if (await post('create_page', { title: 'LinkSrc' }) !== 'LinkSrc.ad') throw new Error('setup LinkSrc failed')
    if (!(await post('write_wiki', { path: 'LinkSrc.ad', body: '# LS\n\n[[RenA]] 与 [[RenB]]。\n' }))) throw new Error('setup LinkSrc body failed')
    // delete_dir 六案
    await exec('d1-root', 'delete_dir', { path: '' })
    await exec('d2-not-dir', 'delete_dir', { path: 'DelFile.ad' })
    await exec('d3-recursive', 'delete_dir', { path: 'DirDel' })
    await exec('d4-empty', 'delete_dir', { path: 'EmptyDir' })
    await exec('d5-cjk', 'delete_dir', { path: '临时目录' })
    await exec('d6-missing', 'delete_dir', { path: 'DirDel' })
    // r⑧ 链接前采
    const links = { before: await get('link_index', { path: '', depth: '4' }) }
    // rename_dir 六案（r⑦ 嵌套案 split 臂无造档通道——跳过）
    await exec('r1-basic', 'rename_dir', { path: 'DirRen', new_name: 'DirRen2' })
    if (!(await post('write_wiki', { path: 'DirRen2/notes.txt', body: 'x\n' }))) throw new Error('setup notes.txt failed')
    await exec('r2-pur-ad', 'rename_dir', { path: 'DirRen2', new_name: 'DirRen3' })
    await exec('r3a-same-dir', 'rename_dir', { path: 'DirRen2', new_name: 'Sibling' })
    await exec('r3b-same-file', 'rename_dir', { path: 'DirRen2', new_name: 'Blocker' })
    await exec('r4-casefold', 'rename_dir', { path: 'DirRen2', new_name: 'dirren2' })
    await exec('r5-cjk', 'rename_dir', { path: '资料夹', new_name: '归档夹' })
    await exec('r6-missing', 'rename_dir', { path: 'no-such-dir', new_name: 'xx' })
    links.after = await get('link_index', { path: '', depth: '4' })
    return {
      returns, links, nested: false,
      diskCheck: (failures) => diskAsserts(back.workspace, 'split', failures, { nested: false }),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-dir-ops] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-dir-ops] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-dir-ops] 双臂返回值逐案对读：')
let agree = true
for (const c of CASES) {
  const m = merged.returns[c.id]
  const s = split.returns[c.id]
  const ok = m === s && m === c.expect
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect="${c.expect}"`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}" expect="${c.expect}"`)
}
for (const c of MERGED_ONLY_CASES) {
  const m = merged.returns[c.id]
  const ok = m === c.expect
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" expect="${c.expect}"（探针域——split 无嵌套造档通道）`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" expect="${c.expect}"`)
}

// r⑧ 链接零扰动归一 diff（双臂 + 一致）
const movedBoth = new Set([
  'DirRen/RenA.ad', 'DirRen2/RenA.ad', 'DirRen/RenB.ad', 'DirRen2/RenB.ad',
  '资料夹/中文乙.ad', '归档夹/中文乙.ad',
])
const movedMerged = new Set([...movedBoth, 'DirNest/sub/Deep.ad', 'DirNest2/sub/Deep.ad'])
const mNorm = ljNorm(merged.links.before, movedMerged) + '||' + ljNorm(merged.links.after, movedMerged)
const sNorm = ljNorm(split.links.before, movedBoth) + '||' + ljNorm(split.links.after, movedBoth)
const linkOk = !mNorm.includes('<unparsable>') && !sNorm.includes('<unparsable>')
  && ljNorm(merged.links.before, movedMerged) === ljNorm(merged.links.after, movedMerged)
  && ljNorm(split.links.before, movedBoth) === ljNorm(split.links.after, movedBoth)
console.log(`  [r8-link-net] ${linkOk ? 'PASS' : 'FAIL'} — link_index 归一 diff 双臂零扰动（仅 path/target_path 变化）`)
if (!linkOk) failures.push('r8-link-net: link_index 归一 diff 失守')

if (failures.length > 0) {
  console.error(`\n[probe-dir-ops] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-dir-ops] RESULT: merged + split 全案通过（probe C 定谳[remove_dir 族可调]+delete_dir 六案+rename_dir 六案+嵌套案[merged]+链接零扰动归一 diff+磁盘逐字节/双复核/副作用圈定+双臂一致=${agree}）`)
