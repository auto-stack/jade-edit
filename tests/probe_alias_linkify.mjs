#!/usr/bin/env node
// probe_alias_linkify.mjs — PLAN-010 T-01 别名解析 + 提及转链接十案直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-alias-linkify/，脚本生成——
//              pac.at render vm + src/back 整树拷贝 + 探针 widget Init 内
//              直调 link_index 与 linkify_page 各案，返回值落 model 字段供
//              autoui_state dump 读回）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              GET /api/link_index + POST /api/linkify_page 各案。
//
// 案表（§6 十案）：
//   aliases 案：
//     ① 造 CAP.ad（aliases: - 帽子定理）→ [[帽子定理]] target_path = wiki/CAP.ad + exists=true
//     ② stem 优先（Other.ad stem 与 Another.ad alias "Other" 冲突 → stem Other.ad 优先）
//     ③ alias 冲突首现（Another.ad 与 CAP.ad 同别名 "共享别名" → walk 序首现 Another.ad）
//     ④ 语料基线零漂移（语料既有 5 页解析结果无 alias 声明时答案恒等）
//     ⑤ CJK alias 双臂（link_index GET 响应含中文 target/target_path）
//   linkify 案：
//     ⑥ 明区改写（正文 CAP 尾 → 正文 [[CAP]] 尾，frontmatter 逐字节保留 + 计数 "1"）
//     ⑦ 链接内不改（[[CAP]] 已链 → 计数 "0" 不写）
//     ⑧ 多处全替换（三处 → 计数 "3"）
//     ⑨ CJK stem（首页 明区改写双臂，计数 "1"）
//     ⑩ 卫（缺失档/空 stem → ""）
//
// 用法（仓根）：node tests/probe_alias_linkify.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-alias-linkify')
const MERGED_WS = path.join(RUNTIME, 'probe-alias-linkify-workspace')
const MERGED_PORT = 9399
const SPLIT_PORT = 8225

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function materializeWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })

  // 案①: CAP.ad 带 aliases
  fs.writeFileSync(
    path.join(ws, 'wiki', 'CAP.ad'),
    `---
title: CAP
aliases:
  - 帽子定理
  - 共享别名
---

CAP Theorem content.
`,
    'utf8',
  )

  // 案②: Other.ad（stem = Other）
  fs.writeFileSync(path.join(ws, 'wiki', 'Other.ad'), '# Other Page\n', 'utf8')

  // 案②/③: Another.ad（walk 序在 CAP.ad 之前，声明 alias Other 和 共享别名）
  fs.writeFileSync(
    path.join(ws, 'wiki', 'Another.ad'),
    `---
aliases:
  - Other
  - 共享别名
---

Another Page content.
`,
    'utf8',
  )

  // 呼叫页 Caller.ad 测试解析
  fs.writeFileSync(
    path.join(ws, 'wiki', 'Caller.ad'),
    `# Caller

[[帽子定理]]
[[Other]]
[[共享别名]]
[[首页]]
`,
    'utf8',
  )

  // 案⑥: 明区改写源
  fs.writeFileSync(
    path.join(ws, 'wiki', 'LinkifySource.ad'),
    `---
title: Source
---

正文 CAP 尾
`,
    'utf8',
  )

  // 案⑦: 已链不改源
  fs.writeFileSync(
    path.join(ws, 'wiki', 'LinkifyExisting.ad'),
    `---
title: Existing
---

正文 [[CAP]] 尾
`,
    'utf8',
  )

  // 案⑧: 多处改写源
  fs.writeFileSync(
    path.join(ws, 'wiki', 'LinkifyMulti.ad'),
    `CAP 和 CAP 还有 CAP
`,
    'utf8',
  )

  // 案⑨: CJK stem
  fs.writeFileSync(
    path.join(ws, 'wiki', 'LinkifyCJK.ad'),
    `欢迎来到 首页 这里
`,
    'utf8',
  )
}

function verifyDisk(ws, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }

  // ⑥ 明区改写后磁盘内容：frontmatter 逐字节保留，正文变为 "正文 [[CAP]] 尾"
  const s6 = fs.readFileSync(path.join(ws, 'wiki', 'LinkifySource.ad'), 'utf8')
  ck(s6 === `---\ntitle: Source\n---\n\n正文 [[CAP]] 尾\n`, '⑥ LinkifySource.ad frontmatter 保留 + body 改写')

  // ⑦ 链接内不改：磁盘保持原样
  const s7 = fs.readFileSync(path.join(ws, 'wiki', 'LinkifyExisting.ad'), 'utf8')
  ck(s7 === `---\ntitle: Existing\n---\n\n正文 [[CAP]] 尾\n`, '⑦ LinkifyExisting.ad 磁盘未变更')

  // ⑧ 多处全替换
  const s8 = fs.readFileSync(path.join(ws, 'wiki', 'LinkifyMulti.ad'), 'utf8')
  ck(s8 === `[[CAP]] 和 [[CAP]] 还有 [[CAP]]\n`, '⑧ LinkifyMulti.ad 三处均替换')

  // ⑨ CJK stem 改写
  const s9 = fs.readFileSync(path.join(ws, 'wiki', 'LinkifyCJK.ad'), 'utf8')
  ck(s9 === `欢迎来到 [[首页]] 这里\n`, '⑨ LinkifyCJK.ad CJK stem 替换')
}

function verifyLinkIndex(jsonStr, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }

  const pages = JSON.parse(jsonStr)
  const caller = pages.find((p) => p.path === 'wiki/Caller.ad')
  ck(!!caller, 'Caller.ad 存在于链接索引中')
  if (!caller) return

  const linkOf = (target) => caller.links.find((l) => l.target === target)

  // ① 别名解析到 CAP.ad
  const l1 = linkOf('帽子定理')
  ck(!!l1 && l1.exists === true && l1.target_path === 'wiki/CAP.ad', '① [[帽子定理]] 别名解析 -> wiki/CAP.ad (exists=true)')

  // ② stem 优先于别名（Other.ad stem 命中，而非 Another.ad alias）
  const l2 = linkOf('Other')
  ck(!!l2 && l2.exists === true && l2.target_path === 'wiki/Other.ad', '② [[Other]] stem 优先命中 -> wiki/Other.ad (exists=true)')

  // ③ 同名 alias walk 序首现（Another.ad 优先于 CAP.ad）
  const l3 = linkOf('共享别名')
  ck(!!l3 && l3.exists === true && l3.target_path === 'wiki/Another.ad', '③ [[共享别名]] walk 序首现 -> wiki/Another.ad (exists=true)')

  // ④ 语料基线零漂移：[[首页]] 依然为 exists=false
  const l4 = linkOf('首页')
  ck(!!l4 && l4.exists === false && l4.target_path === '', '④ [[首页]] 未声明 alias -> exists=false (语料零漂移)')

  // ⑤ CJK alias 在 link_index 中正确呈现
  ck(!!l1 && l1.target === '帽子定理', '⑤ CJK alias target 字段保真')
}

// ---------------- merged 臂 ----------------

const PROBE_AT = `use back.api: link_index, linkify_page

widget App {
    msg { Init }
    model {
        var done bool = false
        var links_raw str = ""
        var r6 str = ""
        var r7 str = ""
        var r8 str = ""
        var r9 str = ""
        var r10a str = ""
        var r10b str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: alias and linkify" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            links_raw = link_index("", 4)
            r6 = linkify_page("wiki/LinkifySource.ad", "CAP")
            r7 = linkify_page("wiki/LinkifyExisting.ad", "CAP")
            r8 = linkify_page("wiki/LinkifyMulti.ad", "CAP")
            r9 = linkify_page("wiki/LinkifyCJK.ad", "首页")
            r10a = linkify_page("wiki/nonexistent.ad", "CAP")
            r10b = linkify_page("wiki/LinkifySource.ad", "")
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
    `name: "jade-probe-alias-linkify"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeAliasLinkify"
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

function unescapeDump(raw) {
  return raw.replace(/\\(["\\])/g, '$1')
}

async function runMergedArm() {
  materializeWorkspace(MERGED_WS)
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-alias-linkify', version: '0.1.0' } })
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
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}`)
      await sleep(300)
    }

    const field = (name) => {
      const m = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
      return m ? unescapeDump(m[1]) : null
    }

    return {
      links_raw: field('links_raw'),
      r6: field('r6'),
      r7: field('r7'),
      r8: field('r8'),
      r9: field('r9'),
      r10a: field('r10a'),
      r10b: field('r10b'),
      diskCheck: (failures) => verifyDisk(MERGED_WS, 'merged', failures),
    }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂 ----------------

async function runSplitArm() {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT })
  try {
    materializeWorkspace(back.workspace)

    // GET link_index
    const resIdx = await fetch(`${back.url}/api/link_index?path=&depth=4`)
    if (!resIdx.ok) throw new Error(`GET link_index -> HTTP ${resIdx.status}`)
    const textIdx = await resIdx.text()
    let links_raw
    try {
      const val = JSON.parse(textIdx)
      links_raw = typeof val === 'string' ? val : textIdx
    } catch {
      links_raw = textIdx
    }

    // POST linkify_page cases
    const postLinkify = async (p, s) => {
      const res = await fetch(`${back.url}/api/linkify_page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p, stem: s }),
      })
      if (!res.ok) throw new Error(`POST linkify_page -> HTTP ${res.status}`)
      const text = await res.text()
      try {
        const v = JSON.parse(text)
        return String(v)
      } catch {
        return text
      }
    }

    const r6 = await postLinkify('wiki/LinkifySource.ad', 'CAP')
    const r7 = await postLinkify('wiki/LinkifyExisting.ad', 'CAP')
    const r8 = await postLinkify('wiki/LinkifyMulti.ad', 'CAP')
    const r9 = await postLinkify('wiki/LinkifyCJK.ad', '首页')
    const r10a = await postLinkify('wiki/nonexistent.ad', 'CAP')
    const r10b = await postLinkify('wiki/LinkifySource.ad', '')

    return {
      links_raw,
      r6,
      r7,
      r8,
      r9,
      r10a,
      r10b,
      diskCheck: (failures) => verifyDisk(back.workspace, 'split', failures),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-alias-linkify] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
verifyLinkIndex(merged.links_raw, 'merged', failures)
merged.diskCheck(failures)

console.log(`[probe-alias-linkify] arm 2: split serve-back GET/POST（:${SPLIT_PORT}）`)
const split = await runSplitArm()
verifyLinkIndex(split.links_raw, 'split', failures)
split.diskCheck(failures)

console.log('\n[probe-alias-linkify] 双臂返回值对读：')
const ck = (ok, label) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${label}`)
  if (!ok) failures.push(`consistency: ${label}`)
}

ck(merged.r6 === '1' && split.r6 === '1', `⑥ r6 计数一致=1 (merged=${merged.r6}, split=${split.r6})`)
ck(merged.r7 === '0' && split.r7 === '0', `⑦ r7 计数一致=0 (merged=${merged.r7}, split=${split.r7})`)
ck(merged.r8 === '3' && split.r8 === '3', `⑧ r8 计数一致=3 (merged=${merged.r8}, split=${split.r8})`)
ck(merged.r9 === '1' && split.r9 === '1', `⑨ r9 计数一致=1 (merged=${merged.r9}, split=${split.r9})`)
ck(merged.r10a === '' && split.r10a === '', `⑩ r10a 卫语句一致="" (merged=${merged.r10a}, split=${split.r10a})`)
ck(merged.r10b === '' && split.r10b === '', `⑩ r10b 卫语句一致="" (merged=${merged.r10b}, split=${split.r10b})`)

// 比较 link_index JSON 解析结果一致
const mObj = JSON.parse(merged.links_raw)
const sObj = JSON.parse(split.links_raw)
ck(JSON.stringify(mObj) === JSON.stringify(sObj), '双臂 link_index 解析结构深等')

if (failures.length > 0) {
  console.error(`\n[probe-alias-linkify] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-alias-linkify] RESULT: merged + split 全案通过（十案：别名解析五案 + 提及转链接五案双臂全绿）`)
