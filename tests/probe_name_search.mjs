#!/usr/bin/env node
// probe_name_search.mjs — PLAN-033 名称查找一致 双臂探针（probe_dir_move
// 配方变体：merged 直调探针工程 + split serve-back POST；语料 = node 侧
// 隔离置盘——本探针测**读面**（目录/检索/链接身份），语料即 fixture 性质
// 的已知答案输入，不 经 app 写面）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-name-search/，脚本生成
//              ——pac.at render vm + src/back 整树拷贝 + 探针 widget Init
//              内直调 search_wiki/link_index 案表），`auto run -r vm`
//              进程内 CALL——autoui_state 全量 dump 读回。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方
//              ——workspace 覆盖参数分臂隔离）POST /api/*（JSON body
//              ——D-19 面：查询词 CJK 常态走 body）。
//
// 相位（PLAN-033 §6/T-01/T-02）：
//   相位 1（T-01 基础）：隔离语料（nm/ 子树 + 5 层深档，fixture 零触碰）
//           + 已知答案断言 + 载体直证（link_index 嵌套 links/dtitle 列表
//           内嵌 map 字段双臂可取形 + int model 字段）+ 现行行为红相证据
//           （fm title/相对路径不在检索域——T-02 翻转案）+ 磁盘不变量
//           （检索前后逐文件 SHA256 对照——检索零副作用圈定）+ 旧响应
//           形状/limit 钳制回归锚（jade garden 基线逐字节）。
//   相位 2（T-02 扩）：page_names 目录已知答案 + search 扩面翻转案 +
//           转义读回案。
//
// 语料（nm/ 子树；均含 frontmatter 原文直写；正文不含名称词）：
//   nm/Home.ad       title=首页 aliases=[起点]  body 无 首页/起点
//   nm/Dup A.ad      title=重名页               body 甲处正文。
//   nm/Dup B.ad      title=重名页               body 乙处正文。
//   nm/AliasOnly.ad  aliases=[独角兽]（无 title）body 别名页正文。
//   nm/Plain.ad      无 frontmatter             body 含 plain corpus line
//   nm/deep/l2/l3/l4/l5/Deep.ad                body deep line（5 层目录）
//   nm/Quoted.ad     title=q"ote\slash aliases=[tab<TAB>9]  转义案
//   nm/Linker.ad     fm 空段 + body 含 [[首页]]（链接身份不变量案）
//
// 用法（仓根）：node tests/probe_name_search.mjs [--phase 1|2]（缺省 2；
// 相位 1 = 红相基线：翻转案按现行行为断言）。

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-name-search')
const MERGED_WS = path.join(RUNTIME, 'probe-name-search-ws')
const SPLIT_WS = path.join(RUNTIME, 'probe-name-search-ws-split')
const MERGED_PORT = 9363
const SPLIT_PORT = await pickPort()

const argOf = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const PHASE = argOf('--phase') === '1' ? 1 : 2

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase()

// ---- 语料（双臂共享；node 直写含 frontmatter 全文）----
const TAB = '\t'
const CORPUS = [
  { rel: 'nm/Home.ad', body: '---\ntitle: 首页\naliases:\n- 起点\n---\n\n# Doc\n\n普通正文段落。\n' },
  { rel: 'nm/Dup A.ad', body: '---\ntitle: 重名页\n---\n\n甲处正文。\n' },
  { rel: 'nm/Dup B.ad', body: '---\ntitle: 重名页\n---\n\n乙处正文。\n' },
  { rel: 'nm/AliasOnly.ad', body: '---\naliases:\n- 独角兽\n---\n\n别名页正文。\n' },
  { rel: 'nm/Plain.ad', body: '# Plain\n\nplain corpus line\n' },
  { rel: 'nm/deep/l2/l3/l4/l5/Deep.ad', body: 'deep line\n' },
  { rel: 'nm/Quoted.ad', body: `---\ntitle: q"ote\\slash\naliases:\n- tab${TAB}9\n---\n\nquoted body\n` },
  { rel: 'nm/Linker.ad', body: '---\n---\n\n链 [[首页]] 悬空应保持。\n' },
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

function wsSnapshot(ws) {
  const out = {}
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else out[path.relative(ws, full).replace(/\\/g, '/')] = sha(full)
    }
  }
  walk(ws)
  return out
}

// ---------------- merged 臂 ----------------

// 检索案表（merged Init 直调 + split POST 双臂同案序）：
//   f1 首页     相位1=[]（fm title 不在域）      相位2=命中 nm/Home.ad snippet=""
//   f2 起点     alias 域（既有）→ nm/Home.ad snippet=""
//   f3 Home     stem 域（既有）→ nm/Home.ad
//   f4 nm/Home  相位1=[]（路径不在域）           相位2=命中 nm/Home.ad
//   f5 独角兽   alias 域 → nm/AliasOnly.ad snippet=""
//   f6 active   属性专有词（fixture status 值）两相位恒 []（非名称字段）
//   f7 重名页   相位1=[]                          相位2=Dup A+Dup B walk 序
//   f8 plain    limit 1 钳制 → 恰 1 行
//   f9 plain    limit 0 → 钳 1 行（与 f8 同形）
//   fa tab<TAB>9 alias 转义案 → nm/Quoted.ad（相位2 断言；相位1 记录现行）
//   fb jade garden 语料基线逐字节回归锚（两相位恒等）
const SEARCH_CALLS = [
  { field: 'f1', call: 'search_wiki("首页", 20)', api: ['search_wiki', { query: '首页', limit: 20 }] },
  { field: 'f2', call: 'search_wiki("起点", 20)', api: ['search_wiki', { query: '起点', limit: 20 }] },
  { field: 'f3', call: 'search_wiki("Home", 20)', api: ['search_wiki', { query: 'Home', limit: 20 }] },
  { field: 'f4', call: 'search_wiki("nm/Home", 20)', api: ['search_wiki', { query: 'nm/Home', limit: 20 }] },
  { field: 'f5', call: 'search_wiki("独角兽", 20)', api: ['search_wiki', { query: '独角兽', limit: 20 }] },
  { field: 'f6', call: 'search_wiki("active", 20)', api: ['search_wiki', { query: 'active', limit: 20 }] },
  { field: 'f7', call: 'search_wiki("重名页", 20)', api: ['search_wiki', { query: '重名页', limit: 20 }] },
  { field: 'f8', call: 'search_wiki("plain", 1)', api: ['search_wiki', { query: 'plain', limit: 1 }] },
  { field: 'f9', call: 'search_wiki("plain", 0)', api: ['search_wiki', { query: 'plain', limit: 0 }] },
  { field: 'fa', call: `search_wiki("tab${TAB}9", 20)`, api: ['search_wiki', { query: `tab${TAB}9`, limit: 20 }] },
  { field: 'fb', call: 'search_wiki("jade garden", 20)', api: ['search_wiki', { query: 'jade garden', limit: 20 }] },
]

const PROBE_AT = `// 探针 widget（tests/probe_name_search.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 search_wiki 案表 + page_names 目录 +
// link_index 载体案 + int 字段计数 + 刷新弧（元数据/建页/改名/删除/
// 回收站五触点前后目录读回），返回值落 model 字段供 autoui_state dump
// 读回。入口文件名固定 app.at（auto 前端入口约定）。
use back.api: search_wiki, link_index, page_names, set_page_meta, create_page, rename_page, delete_page, trash_restore

widget App {
    msg { Init }
    model {
        var done bool = false
        var c1 int = 0
        var lk str = ""
        var pn str = ""
        var r1 str = ""
        var r2 str = ""
        var r3 str = ""
        var r4 str = ""
        var r5 str = ""
        var r6 str = ""
        var r7 str = ""
        var f1 str = ""
        var f2 str = ""
        var f3 str = ""
        var f4 str = ""
        var f5 str = ""
        var f6 str = ""
        var f7 str = ""
        var f8 str = ""
        var f9 str = ""
        var fa str = ""
        var fb str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: name search" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            c1 = c1 + 1
            c1 = c1 + 1
            c1 = c1 + 1
            lk = link_index("", 8)
            pn = page_names()
            f1 = ${SEARCH_CALLS[0].call}
            f2 = ${SEARCH_CALLS[1].call}
            f3 = ${SEARCH_CALLS[2].call}
            f4 = ${SEARCH_CALLS[3].call}
            f5 = ${SEARCH_CALLS[4].call}
            f6 = ${SEARCH_CALLS[5].call}
            f7 = ${SEARCH_CALLS[6].call}
            f8 = ${SEARCH_CALLS[7].call}
            f9 = ${SEARCH_CALLS[8].call}
            fa = ${SEARCH_CALLS[9].call}
            fb = ${SEARCH_CALLS[10].call}
            // —— 刷新弧（T-04：目录每次调用读当前磁盘——前端触点表的正
            // 确性根基；前置 pn 之后执行零干扰）——
            // r1 属性 title 变更 → 目录 dtitle 随读随新
            r1 = set_page_meta("nm/Plain.ad", "换名页", "", "")
            r2 = page_names()
            // r3 建页 → 新档入目录
            r3 = create_page("新建页")
            r4 = page_names()
            // r5 改名 → 旧 path 消新 path 入（r6 读回）
            r5 = rename_page("新建页.ad", "另名页")
            r6 = page_names()
            // r7 删除 → 目录排除（回收站面——.trash 点前缀不入目录）
            r7 = delete_page("nm/Dup B.ad")
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
    `name: "jade-probe-name-search"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeNameSearch"
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
const intField = (dump, name) => {
  const m = dump.match(new RegExp(`${name}:\\s*(-?\\d+)`))
  return m ? Number(m[1]) : null
}

async function runMergedArm(preSnap) {
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-name-search', version: '0.1.0' } })
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
    const c1 = intField(dump, 'c1')
    if (c1 !== 3) throw new Error(`int model field carrier broken: c1=${c1}`)
    const searches = {}
    for (const c of SEARCH_CALLS) {
      searches[c.field] = strField(dump, c.field)
      if (searches[c.field] === null) throw new Error(`probe state missing ${c.field}`)
    }
    const lk = strField(dump, 'lk')
    if (lk === null) throw new Error('probe state missing lk')
    let pn = null
    const refresh = {}
    if (PHASE >= 2) {
      pn = strField(dump, 'pn')
      if (pn === null) throw new Error('probe state missing pn')
      for (const f of ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7']) {
        refresh[f] = strField(dump, f)
        if (refresh[f] === null) throw new Error(`probe state missing ${f}`)
      }
    }
    // 磁盘不变量：检索（Init 内全部案）执行后工作区与检索前快照逐件相等
    //（检索零副作用圈定——目录/全文/链接索引皆只读）。
    const postSnap = wsSnapshot(MERGED_WS)
    const drift = Object.keys(preSnap).filter((k) => preSnap[k] !== postSnap[k])
      .concat(Object.keys(postSnap).filter((k) => !(k in preSnap)))
    return { searches, lk, pn, refresh, drift, ws: MERGED_WS }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂 ----------------

async function runSplitArm(preSnap) {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT, workspace: SPLIT_WS })
  // serve-backend 内部按 fixture 重建工作区——语料在其后置盘。
  writeCorpus(back.workspace)
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
    const searches = {}
    for (const c of SEARCH_CALLS) {
      searches[c.field] = await post(c.api[0], c.api[1])
    }
    const getJson = async (api, query) => {
      const res = await fetch(`${back.url}/api/${api}${query ?? ''}`)
      if (!res.ok) throw new Error(`GET ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      try { return JSON.parse(text) } catch { return text }
    }
    const lk = await getJson('link_index', '?path=&depth=8')
    let pn = null
    const refresh = {}
    if (PHASE >= 2) {
      const raw = await getJson('page_names', '')
      pn = typeof raw === 'string' ? raw : JSON.stringify(raw)
      // 刷新弧（与 merged Init 尾段同案序——元数据/建页/改名/删除/回收站）。
      refresh.r1 = await post('set_page_meta', { path: 'nm/Plain.ad', title: '换名页', tags: '', aliases: '' })
      refresh.r2 = await getJson('page_names', '')
      refresh.r2 = typeof refresh.r2 === 'string' ? refresh.r2 : JSON.stringify(refresh.r2)
      refresh.r3 = await post('create_page', { title: '新建页' })
      refresh.r4 = await getJson('page_names', '')
      refresh.r4 = typeof refresh.r4 === 'string' ? refresh.r4 : JSON.stringify(refresh.r4)
      refresh.r5 = await post('rename_page', { old_path: '新建页.ad', new_name: '另名页' })
      refresh.r6 = await getJson('page_names', '')
      refresh.r6 = typeof refresh.r6 === 'string' ? refresh.r6 : JSON.stringify(refresh.r6)
      refresh.r7 = await post('delete_page', { path: 'nm/Dup B.ad' })
    }
    const postSnap = wsSnapshot(back.workspace)
    const drift = Object.keys(preSnap).filter((k) => preSnap[k] !== postSnap[k])
      .concat(Object.keys(postSnap).filter((k) => !(k in preSnap)))
    return { searches, lk, pn, refresh, drift, ws: back.workspace }
  } finally {
    await back.stop()
  }
}

// ---------------- 断言（双臂共用）----------------

const BASELINE_JSON = JSON.stringify([
  { path: 'wiki/Hello World.ad', title: 'Hello World', snippet: 'println!("Hello, Jade Garden!");' },
  { path: 'wiki/index.ad', title: 'index', snippet: '欢迎来到 Jade Garden 测试知识库。' },
])

// nm/ 子树已知答案（page_names walk 序：根 dirs-first nm<wiki；nm 内
// dirs-first deep 子树先、文件段 casefold 序 aliasonly<dup a<dup b<home<
// linker<plain<quoted；深层档 = nm/deep/l2/l3/l4/l5/Deep.ad）。
const NM_DIR_JSON = JSON.stringify([
  { path: 'nm/deep/l2/l3/l4/l5/Deep.ad', title: 'Deep', dtitle: 'Deep', aliases: [] },
  { path: 'nm/AliasOnly.ad', title: 'AliasOnly', dtitle: 'AliasOnly', aliases: ['独角兽'] },
  { path: 'nm/Dup A.ad', title: 'Dup A', dtitle: '重名页', aliases: [] },
  { path: 'nm/Dup B.ad', title: 'Dup B', dtitle: '重名页', aliases: [] },
  { path: 'nm/Home.ad', title: 'Home', dtitle: '首页', aliases: ['起点'] },
  { path: 'nm/Linker.ad', title: 'Linker', dtitle: 'Linker', aliases: [] },
  { path: 'nm/Plain.ad', title: 'Plain', dtitle: 'Plain', aliases: [] },
  { path: 'nm/Quoted.ad', title: 'Quoted', dtitle: 'q"ote\\slash', aliases: [`tab${TAB}9`] },
])

function checks(tag, data, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const hits = (field) => {
    try { return JSON.parse(data.searches[field]) } catch { return null }
  }
  const pathsOf = (field) => {
    const h = hits(field)
    return Array.isArray(h) ? h.map((r) => r.path) : null
  }

  // ---- 相位 1：现行行为红相证据（T-02 翻转）----
  if (PHASE === 1) {
    const p1 = pathsOf('f1') || []
    ck(!p1.includes('nm/Home.ad'), `红相 f1 "首页" 现行不命中 title-only 页 nm/Home.ad（实际：${JSON.stringify(p1)}）`)
    ck(data.searches['f4'] === '[]', `红相 f4 "nm/Home" 现行不命中相对路径（实际：${data.searches['f4']?.slice(0, 120)}）`)
    ck(data.searches['f7'] === '[]', `红相 f7 "重名页" 现行不命中 fm title（实际：${data.searches['f7']?.slice(0, 120)}）`)
  } else {
    // ---- 相位 2：扩面终案（AC-01/AC-02/AC-05 域）----
    const h1 = hits('f1')
    const home1 = Array.isArray(h1) ? h1.find((r) => r.path === 'nm/Home.ad') : undefined
    ck(!!home1, `f1 "首页" 命中 title-only 页 nm/Home.ad（实际：${JSON.stringify(h1)?.slice(0, 240)}）`)
    ck(home1?.title === 'Home' && home1.snippet === '', `f1 nm/Home.ad 行 title=stem + snippet=""（title-only 命中）`)
    ck(JSON.stringify(pathsOf('f4')) === JSON.stringify(['nm/Home.ad']), `f4 "nm/Home" 相对路径命中 nm/Home.ad（实际：${JSON.stringify(pathsOf('f4'))}）`)
    ck(JSON.stringify(pathsOf('f7')) === JSON.stringify(['nm/Dup A.ad', 'nm/Dup B.ad']), `f7 "重名页" 同名双页逐 path walk 序保留（实际：${JSON.stringify(pathsOf('f7'))}）`)
    ck(JSON.stringify(pathsOf('fa')) === JSON.stringify(['nm/Quoted.ad']), `fa 制表符 alias 命中 nm/Quoted.ad（实际：${JSON.stringify(pathsOf('fa'))}）`)
  }

  // ---- 既有域回归（两相位恒等——AC-03 旧语义保持）----
  const h2 = hits('f2')
  ck(Array.isArray(h2) && h2.length === 1 && h2[0].path === 'nm/Home.ad', `"起点" alias 命中 nm/Home.ad（实际：${data.searches['f2']?.slice(0, 160)}）`)
  ck(h2?.[0]?.title === 'Home' && h2[0].snippet === '', `f2 title=stem + snippet=""（alias-only 既有口径）`)
  ck(JSON.stringify(pathsOf('f3')) === JSON.stringify(['nm/Home.ad']), `"Home" stem 命中（实际：${JSON.stringify(pathsOf('f3'))}）`)
  ck(JSON.stringify(pathsOf('f5')) === JSON.stringify(['nm/AliasOnly.ad']), `"独角兽" alias 命中 AliasOnly（实际：${JSON.stringify(pathsOf('f5'))}）`)
  ck(data.searches['f6'] === '[]', `"active" 属性专有词不命中（tags/status 非名称字段——AC-02 负向）`)
  // limit 钳制：1 与 0（→1）同形
  ck((hits('f8') || []).length === 1, `limit=1 恰 1 行`)
  ck(data.searches['f9'] === data.searches['f8'], `limit=0 钳为 1（与 limit=1 逐字节同形）`)
  // 形状：恰 {path,title,snippet} 三字段 + title=stem
  const all = [...(hits('f1') || []), ...(hits('f2') || []), ...(hits('f3') || []), ...(hits('f5') || []), ...(hits('f7') || []), ...(hits('fb') || [])]
  ck(all.every((r) => Object.keys(r).length === 3 && 'path' in r && 'title' in r && 'snippet' in r), '响应行恰 {path,title,snippet} 三字段')
  ck(all.every((r) => r.title === r.path.split('/').pop().replace(/\.ad$/, '')), 'title 恒 = stem')
  // 语料基线逐字节回归锚（SD-401 口径零漂移）
  ck(data.searches['fb'] === BASELINE_JSON, `jade garden 基线逐字节（实际：${data.searches['fb']?.slice(0, 200)}）`)

  // ---- 载体直证：link_index 嵌套列表/映射字段（两轨在册消费面的 VM 侧根）----
  let lkOk = false
  let lkHome = null
  let lkLinker = null
  let lkDeep = null
  try {
    const pages = JSON.parse(data.lk)
    lkOk = Array.isArray(pages)
    lkHome = pages.find((p) => p.path === 'nm/Home.ad')
    lkLinker = pages.find((p) => p.path === 'nm/Linker.ad')
    lkDeep = pages.find((p) => p.path === 'nm/deep/l2/l3/l4/l5/Deep.ad')
  } catch {}
  ck(lkOk, 'link_index JSON 可解析（顶层裸数组）')
  ck(lkHome?.dtitle === '首页' && Array.isArray(lkHome?.links), 'link_index 行含 dtitle 字符串 + links 嵌套数组（名称载体在册）')
  const linkerLink = Array.isArray(lkLinker?.links) ? lkLinker.links[0] : null
  ck(linkerLink?.target === '首页' && linkerLink?.exists === false && linkerLink.target_path === '', '[[首页]] 悬空——title 不进链接解析器（AC-07 身份不变量）')
  ck(!!lkDeep, '5 层深档 nm/deep/l2/l3/l4/l5/Deep.ad 入索引（depth 8 覆盖）')

  // ---- 磁盘不变量：检索零副作用（pre-search 快照对照；相位 2 的刷新
  // 弧写入面 = 显式白名单——setup 变更自身，其余零 drift）----
  if (PHASE === 1) {
    ck(data.drift.length === 0, `检索零磁盘副作用（drift：${data.drift.slice(0, 5).join(', ') || '无'}）`)
  } else {
    const allowed = (k) =>
      k === 'nm/Plain.ad' || k === 'nm/Dup B.ad' || k === '新建页.ad' || k === '另名页.ad' || k.startsWith('.trash/')
    const bad = data.drift.filter((k) => !allowed(k))
    ck(bad.length === 0, `检索零副作用+刷新弧写入面恰白名单（bad drift：${bad.slice(0, 5).join(', ') || '无'}）`)
  }

  // ---- 相位 2：刷新弧（T-04——目录每次调用读当前磁盘：元数据/建页/
  // 改名/删除触点前后读回；前端触点表正确性的根基案）----
  if (PHASE >= 2) {
    const rf = data.refresh
    const dirRows = (raw) => {
      try { return JSON.parse(raw) } catch { return null }
    }
    ck(rf.r1 === 'ok', `刷新弧 r1 set_page_meta title=换名页 ok（实际：${rf.r1}）`)
    const d2 = dirRows(rf.r2)
    const plain2 = Array.isArray(d2) ? d2.find((r) => r.path === 'nm/Plain.ad') : null
    ck(plain2?.dtitle === '换名页', `刷新弧 r2 属性 title 变更后目录 dtitle 随读随新（实际：${JSON.stringify(plain2)?.slice(0, 140)}）`)
    ck(rf.r3 === '新建页.ad', `刷新弧 r3 create_page 返回（实际：${rf.r3}）`)
    const d4 = dirRows(rf.r4)
    ck(Array.isArray(d4) && d4.some((r) => r.path === '新建页.ad'), `刷新弧 r4 建页后新档入目录`)
    ck(rf.r5 === '另名页.ad', `刷新弧 r5 rename_page 返回（实际：${rf.r5}）`)
    const d6 = dirRows(rf.r6)
    ck(Array.isArray(d6) && !d6.some((r) => r.path === '新建页.ad') && d6.some((r) => r.path === '另名页.ad'), `刷新弧 r6 改名后旧 path 消新 path 入`)
    ck(rf.r7 === 'nm/Dup B.ad', `刷新弧 r7 delete_page 返回（实际：${rf.r7}）`)
    // 删除后磁盘终态：Dup B 在 .trash（回收站点前缀——不入目录）、根新建页已改名。
    ck(!fs.existsSync(path.join(data.ws, 'nm/Dup B.ad')), `刷新弧 r7 原位档消失`)
    ck(fs.existsSync(path.join(data.ws, '.trash', 'nm', 'Dup B.ad')), `刷新弧 r7 回收站副本在（.trash 点前缀不入目录面）`)
    ck(!fs.existsSync(path.join(data.ws, '新建页.ad')) && fs.existsSync(path.join(data.ws, '另名页.ad')), `刷新弧 r5 改名终态 新建页.ad→另名页.ad`)
  }

  // ---- 相位 2：page_names 目录已知答案（AC-04 域）----
  if (PHASE >= 2) {
    let dir = null
    try { dir = JSON.parse(data.pn) } catch {}
    ck(Array.isArray(dir), `page_names 顶层裸数组可解析（实际：${String(data.pn)?.slice(0, 120)}）`)
    if (Array.isArray(dir)) {
      // 形状：恰 {path,title,dtitle,aliases} 四字段 + title=stem + dtitle/title 非空
      ck(dir.every((r) => Object.keys(r).length === 4 && 'path' in r && 'title' in r && 'dtitle' in r && 'aliases' in r && Array.isArray(r.aliases)), '目录行恰 {path,title,dtitle,aliases} 四字段（aliases 数组）')
      ck(dir.every((r) => r.title === r.path.split('/').pop().replace(/\.ad$/, '') && r.title !== '' && r.dtitle !== ''), 'title 恒 = stem 且两名称域非空')
      // 完整性：磁盘 .ad 集合 ↔ 目录一一对应（一页一记录）
      const diskAds = []
      const walkAds = (d, pre) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          if (e.name.startsWith('.')) continue
          const full = path.join(d, e.name)
          if (e.isDirectory()) walkAds(full, `${pre}${e.name}/`)
          else if (e.name.endsWith('.ad')) diskAds.push(`${pre}${e.name}`)
        }
      }
      walkAds(data.ws, '')
      const dirPaths = dir.map((r) => r.path).sort()
      // pn 为刷新弧前读回——对照基线 = 现磁盘集合经弧增量还原（新建页
      // 已改名另名页：−另名页 +Dup B）。
      const baseline = PHASE >= 2
        ? diskAds.filter((x) => x !== '另名页.ad').concat(['nm/Dup B.ad'])
        : diskAds
      ck(JSON.stringify(dirPaths) === JSON.stringify([...baseline].sort()), `目录 path 集合 = 磁盘 .ad 集合（${baseline.length} 页，一页一记录）`)
      // nm/ 子树 walk 序逐字节（dirs-first + casefold 已知答案）
      const nmJson = JSON.stringify(dir.filter((r) => r.path.startsWith('nm/')))
      ck(nmJson === NM_DIR_JSON, `nm/ 子树已知答案逐字节 walk 序（实际：${nmJson.slice(0, 240)}）`)
      // 转义读回：Quoted 行 title/aliases 逐值等值（引号/反斜杠/制表）
      const q = dir.find((r) => r.path === 'nm/Quoted.ad')
      ck(q?.dtitle === 'q"ote\\slash' && JSON.stringify(q?.aliases) === JSON.stringify([`tab${TAB}9`]), `转义读回 title="q\\"ote\\\\slash" aliases=["tab<TAB>9"]（实际：${JSON.stringify(q)?.slice(0, 160)}）`)
      // 忽略面：目录不含 .trash/.jade/非 .ad（集合等价已证——点前缀不入 walkAds）
      ck(dir.every((r) => !r.path.includes('/.') && !r.path.startsWith('.') && r.path.endsWith('.ad')), '目录零点前缀/零非 .ad 条目')
    }
  }

  // ---- 语料在盘逐字节（已知答案输入自证；相位 2 的刷新弧变更面按
  // 终态期望——Plain title 换名、Dup B 已入回收站）----
  for (const c of CORPUS) {
    const full = path.join(data.ws, c.rel)
    if (PHASE >= 2 && c.rel === 'nm/Plain.ad') {
      const t = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''
      ck(t.includes('title: 换名页') && t.includes('# Plain') && t.includes('plain corpus line'), `语料终态 nm/Plain.ad（title 增建+body 保留）`)
      continue
    }
    if (PHASE >= 2 && c.rel === 'nm/Dup B.ad') {
      ck(!fs.existsSync(full), `语料终态 nm/Dup B.ad 已入回收站（原位消失）`)
      continue
    }
    ck(fs.existsSync(full) && fs.readFileSync(full, 'utf8') === c.body, `语料在盘逐字节 ${c.rel}`)
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-name-search] phase ${PHASE} — arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
prepareWorkspace(MERGED_WS)
const mergedPre = wsSnapshot(MERGED_WS)
const merged = await runMergedArm(mergedPre)
checks('merged', merged, failures)

console.log(`[probe-name-search] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
prepareWorkspace(SPLIT_WS)
const splitPre = wsSnapshot(SPLIT_WS)
const split = await runSplitArm(splitPre)
checks('split', split, failures)

console.log('\n[probe-name-search] 双臂检索 JSON 逐案对读：')
let agree = true
for (const c of SEARCH_CALLS) {
  const m = merged.searches[c.field]
  const s = split.searches[c.field]
  const ok = m === s && m !== null
  if (m !== s) agree = false
  console.log(`  [${c.field}] ${ok ? 'PASS' : 'FAIL'} — 双臂逐字节一致=${m === s}`)
  if (!ok) failures.push(`case ${c.field}: merged="${m?.slice(0, 120)}" split="${s?.slice(0, 120)}"`)
}

if (failures.length > 0) {
  console.error(`\n[probe-name-search] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-name-search] RESULT: phase ${PHASE} merged + split 全案通过（11 检索案 + 载体直证 + 磁盘零副作用 + 双臂一致=${agree}）`)
