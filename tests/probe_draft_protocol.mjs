#!/usr/bin/env node
// probe_draft_protocol.mjs — PLAN-031 T-02 draft_* 契约协议回归（双臂）。
//
// 被测面：src/back/drafts.at（协议实现）+ api.at draft_* 七端点。决策
// 与 T-01 实证记录 docs/plans/attachments/031-draft-protocol.md。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-draft/，脚本生成——repo
//              src/back 整树拷贝 + 探针 widget Init 内直调 draft_*），三个
//              独立进程（write → act → recover）——**进程边界即重启语义**
//              ，Node 在进程间注入磁盘损坏（AC-01/03/04/09 面直证）。
//   split 臂   serve-back 同款 `auto run --server vm`（同一 back 模块），
//              HTTP 面 + emoji/tab 全字符语料 + 守卫 + 清单对读（Node
//              独立校验器逐字段）。
//
// 案表（期望值 = T-01 附件 §3 决策表）：
//   ① 空库 begin/list 不建 .jade（split 臂）
//   ② 检查点确认四步 + 磁盘逐字节（CJK/引号/反斜杠/CRLF/尾随换行/空文
//      /emoji+tab）+ 三重校验（len 字符/slen 字节/sha Node 对读）
//   ③ 身份分配单调（d0001..）+ 守卫（畸形 id/越界路径拒）
//   ④ 结算墓碑 + 清理 + 迟到旧写入不复活（settle_erev 门）
//   ⑤ 故障注入：截断/坏 meta/删 body/杂件 → bad[] 线索 + 前序有效存活
//      + 恢复枚举零写面（树 hash 前后对读）+ **原文件逐字不变**
//   ⑥ 索引面：tree/link_index/search 对 .jade/drafts 零感知
//
// 双臂一致 = 同一 back 模块两形态对读。用法（仓根）：node tests/probe_draft_protocol.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROJ = path.join(RUNTIME, 'probe-draft')
const WS = {
  merged: path.join(RUNTIME, 'probe-draft-ws-merged'),
  split: path.join(RUNTIME, 'probe-draft-ws-split'),
}
const MERGED_PORT = await pickPort()
const SPLIT_PORT = await pickPort()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha256hex = (buf) => crypto.createHash('sha256').update(buf).digest('hex')

// ---- 语料（merged 臂内嵌探针 widget 字面量同源——Node 侧作磁盘对照权威）----
const CORPUS_A = '# 草稿 V1\n\n中文正文，含引号 "双引号" 与 \'单引号\'，行尾反斜杠\\，\r\nCRLF 行\r\n尾随换行\n'
const CORPUS_B = '# 草稿 V2\n\n第二版正文：\n行一 alpha-beta\n行二 中文 English 混排\r\n结束\r\n'
const U_BODY = '未命名文档的草稿\n第二行：带引号 "q" 与反斜杠 \\ 字符\n完\n'
const U_ORIG = '未命名的原文基准\n'
const X1 = '变更前正文 X1\n'
const X2 = '变更后正文 X2——V2 将被损坏\n'
const S5 = '单版本文档内容\n'
const LATE = '迟到旧写入——不得复活\n'
const H1 = 'emoji 😀🚀 类\ntab\t字符\n中日韓 日本語 한국어\n引号 "x" \'y\' 反斜杠 \\ 结尾\r\nCRLF 尾行\r\n'

// ---- 断言 ----
const failures = []
const ck = (ok, label) => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`)
  if (!ok) failures.push(label)
}
const eq = (a, b, label) => ck(a === b, `${label}（got=${JSON.stringify(a)} want=${JSON.stringify(b)}）`)

// ---- 探针 widget（merged 臂相位件；生成件不入库源）----
const PROBE_AT = `// 探针 widget（tests/probe_draft_protocol.mjs 生成件——直证后随
// .runtime 再生，非入库源）。相位经 DP_PHASE 环境选择。
use back.api: env_str, draft_begin, draft_alloc, draft_checkpoint, draft_settle, draft_list, draft_read, draft_read_orig

fn eqs(a str, b str) str {
    if a == b {
        return "MATCH"
    }
    return "MISMATCH"
}

widget App {
    msg { Init }
    model {
        var r1 str = ""
        var r2 str = ""
        var r3 str = ""
        var r4 str = ""
        var r5 str = ""
        var r6 str = ""
        var done bool = false
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: draft protocol" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            var ph str = env_str("DP_PHASE")
            if ph == "write" {
                var e str = draft_begin()
                r1 = "epoch=" + e
                var ev str = ""
                var i1 str = draft_alloc()
                ev = ev + "alloc=" + i1
                ev = ev + "|ck1=" + draft_checkpoint(i1, e.parse_int(), 1, "wiki/首页.ad", "首页", "# 草稿 V1\\n\\n中文正文，含引号 \\"双引号\\" 与 '单引号'，行尾反斜杠\\\\，\\r\\nCRLF 行\\r\\n尾随换行\\n", "")
                ev = ev + "|ck2=" + draft_checkpoint(i1, e.parse_int(), 2, "wiki/首页.ad", "首页", "# 草稿 V2\\n\\n第二版正文：\\n行一 alpha-beta\\n行二 中文 English 混排\\r\\n结束\\r\\n", "# 草稿 V1\\n\\n中文正文，含引号 \\"双引号\\" 与 '单引号'，行尾反斜杠\\\\，\\r\\nCRLF 行\\r\\n尾随换行\\n")
                var i2 str = draft_alloc()
                ev = ev + "|ck3=" + draft_checkpoint(i2, e.parse_int(), 1, "", "未命名", "未命名文档的草稿\\n第二行：带引号 \\"q\\" 与反斜杠 \\\\ 字符\\n完\\n", "未命名的原文基准\\n")
                var i3 str = draft_alloc()
                ev = ev + "|ck4=" + draft_checkpoint(i3, e.parse_int(), 1, "wiki/空.ad", "空", "", "")
                var i4 str = draft_alloc()
                ev = ev + "|ck5=" + draft_checkpoint(i4, e.parse_int(), 1, "wiki/变.ad", "变", "变更前正文 X1\\n", "")
                ev = ev + "|ck6=" + draft_checkpoint(i4, e.parse_int(), 2, "wiki/变.ad", "变", "变更后正文 X2——V2 将被损坏\\n", "变更前正文 X1\\n")
                var i5 str = draft_alloc()
                ev = ev + "|ck7=" + draft_checkpoint(i5, e.parse_int(), 1, "wiki/单.ad", "单", "单版本文档内容\\n", "")
                var i6 str = draft_alloc()
                ev = ev + "|ck8=" + draft_checkpoint(i6, e.parse_int(), 1, "wiki/单.ad", "单", "单版本文档内容\\n", "")
                ev = ev + "|gid=" + draft_checkpoint("x1", 1, 1, "wiki/a.ad", "a", "b", "")
                ev = ev + "|gpath=" + draft_checkpoint(i1, 1, 1, "../escape.ad", "a", "b", "")
                r2 = ev
            }
            if ph == "act" {
                var e str = draft_begin()
                r1 = "epoch=" + e
                r2 = "settle=" + draft_settle("d0001", 2, "saved", "", 2)
                r3 = "late=" + draft_checkpoint("d0001", e.parse_int(), 1, "wiki/首页.ad", "首页", "迟到旧写入——不得复活\\n", "")
            }
            if ph == "recover" {
                r1 = "epoch=" + draft_begin()
                r2 = draft_list()
                r3 = "d2body=" + eqs(draft_read("d0002", 1), "未命名文档的草稿\\n第二行：带引号 \\"q\\" 与反斜杠 \\\\ 字符\\n完\\n")
                r4 = "d2orig=" + eqs(draft_read_orig("d0002", 1), "未命名的原文基准\\n")
                r5 = "d4v1=" + eqs(draft_read("d0004", 1), "变更前正文 X1\\n")
                r6 = "d4v2read=" + draft_read("d0004", 2)
            }
            done = true
        }
    }
}
`

const PAC_AT = `name: "jade-probe-draft"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeDraft"
window: "400x300"
`

function buildProbeProject() {
  fs.rmSync(PROJ, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROJ, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROJ, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROJ, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(path.join(PROJ, 'pac.at'), PAC_AT, 'utf8')
}

function makeMcp(port) {
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
  return { rpc }
}

async function runMergedPhase(phase, ws) {
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: PROJ,
    env: { ...process.env, AUTOUI_MCP_PORT: String(MERGED_PORT), JADE_WORKSPACE: ws, DP_PHASE: phase },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const { rpc } = makeMcp(MERGED_PORT)
    const deadline = Date.now() + 60000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'probe-draft', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe ${phase} exited early (code ${app.exitCode}):\n${appOut.slice(-2500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable (${phase}): ${err.message}`)
        await sleep(500)
      }
    }
    const pollDeadline = Date.now() + 60000
    let dump = ''
    for (;;) {
      const result = await rpc('tools/call', { name: 'autoui_state', arguments: {} })
      dump = (result.content ?? []).map((c) => c.text ?? '').join('\n').trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe ${phase} Init never completed:\n${dump.slice(0, 1500)}`)
      await sleep(300)
    }
    const unesc = (s) => s?.replace(/\\n/g, '\n')?.replace(/\\"/g, '"')?.replace(/\\\\/g, '\\') ?? null
    const field = (name) => {
      const m = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
      return m ? unesc(m[1]) : null
    }
    return { r1: field('r1'), r2: field('r2'), r3: field('r3'), r4: field('r4'), r5: field('r5'), r6: field('r6'), dump }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

async function startSplit(ws) {
  const child = spawn(AUTO_EXE, ['run', '--server', 'vm', '-B', String(SPLIT_PORT)], {
    cwd: repoRoot,
    env: { ...process.env, JADE_WORKSPACE: ws },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  child.stdout.on('data', (d) => (out += d))
  child.stderr.on('data', (d) => (out += d))
  const url = `http://127.0.0.1:${SPLIT_PORT}`
  const deadline = Date.now() + 60000
  for (;;) {
    if (child.exitCode !== null) throw new Error(`split backend exited early:\n${out.slice(-2500)}`)
    try {
      const res = await fetch(`${url}/api/ws_root`)
      if (res.ok) break
    } catch {}
    if (Date.now() > deadline) throw new Error(`split not reachable on ${url}:\n${out.slice(-1500)}`)
    await sleep(400)
  }
  const GET = async (p) => JSON.parse(await (await fetch(`${url}${p}`)).text())
  const POST = async (p, body) => {
    const res = await fetch(`${url}${p}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`POST ${p} -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    return JSON.parse(await res.text())
  }
  return {
    url, GET, POST,
    stop: async () => {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
      await sleep(400)
    },
  }
}

// ---- 磁盘面工具 ----
const DR = (ws) => path.join(ws, '.jade', 'drafts', 'v1')
const df = (ws, rel) => path.join(DR(ws), rel)
const rd = (ws, rel) => fs.readFileSync(df(ws, rel))
const existsf = (ws, rel) => fs.existsSync(df(ws, rel))
const listdir = (ws, rel) => (fs.existsSync(df(ws, rel)) ? fs.readdirSync(df(ws, rel)).sort() : null)

function metaLine(ws, rel, key) {
  const text = rd(ws, rel).toString('utf8')
  for (const line of text.split('\n')) {
    const i = line.indexOf('=')
    if (i > 0 && line.slice(0, i) === key) return line.slice(i + 1)
  }
  return null
}

function treeHash(ws) {
  const root = DR(ws)
  const out = []
  const walk = (d) => {
    if (!fs.existsSync(d)) return
    for (const e of fs.readdirSync(d).sort()) {
      const full = path.join(d, e)
      if (fs.statSync(full).isDirectory()) walk(full)
      else out.push(`${path.relative(root, full)}:${sha256hex(fs.readFileSync(full))}`)
    }
  }
  walk(root)
  return out.join('|')
}

function wikiHash(ws) {
  const root = path.join(ws, 'wiki')
  const out = []
  const walk = (d) => {
    if (!fs.existsSync(d)) return
    for (const e of fs.readdirSync(d).sort()) {
      const full = path.join(d, e)
      if (fs.statSync(full).isDirectory()) walk(full)
      else out.push(`${path.relative(root, full)}:${sha256hex(fs.readFileSync(full))}`)
    }
  }
  walk(root)
  return out.join('|')
}

// Node 独立校验器：从磁盘字节独立推导期望 pending/bad（对读 HTTP list）
function nodeOracle(ws) {
  const root = DR(ws)
  const pending = []
  const bad = []
  if (!fs.existsSync(root)) return { pending, bad }
  const docs = fs.readdirSync(root).filter((d) => /^d\d{4,}$/.test(d) && fs.statSync(path.join(root, d)).isDirectory()).sort()
  for (const doc of docs) {
    const dir = path.join(root, doc)
    const names = fs.readdirSync(dir).sort()
    let settledErev = 0
    for (const n of names.filter((x) => /^s\d{5}\.meta$/.test(x))) {
      const t = fs.readFileSync(path.join(dir, n), 'utf8')
      const m = t.match(/^settle_erev=(\d+)$/m)
      if (m) settledErev = Math.max(settledErev, Number(m[1]))
    }
    let best = null
    for (const n of names.filter((x) => /^c\d{5}\.meta$/.test(x))) {
      const seq = Number(n.slice(1, 6))
      const metaText = fs.readFileSync(path.join(dir, n), 'utf8')
      const ml = (k) => { const m = metaText.match(new RegExp(`^${k}=(.*)$`, 'm')); return m ? m[1] : null }
      const clue = (err) => bad.push({ file: `${doc}/${n}`, err })
      if (ml('schema') !== '1') { clue('schema-invalid'); continue }
      if (ml('doc') !== doc) { clue('doc-mismatch'); continue }
      if (!/^\d+$/.test(ml('erev') ?? '')) { clue('erev-invalid'); continue }
      const bodyPath = path.join(dir, n.replace('.meta', '.body'))
      if (!fs.existsSync(bodyPath)) { clue('body-missing'); continue }
      const bodyBuf = fs.readFileSync(bodyPath)
      if (String([...bodyBuf.toString('utf8')].length) !== ml('len')) { clue('len-mismatch'); continue }
      if (ml('slen') && String(bodyBuf.length) !== ml('slen')) { clue('slen-mismatch'); continue }
      if (ml('sha') && sha256hex(bodyBuf) !== ml('sha')) { clue('sha-mismatch'); continue }
      const erev = Number(ml('erev'))
      if (erev <= settledErev) continue
      if (!best || erev > best.erev) {
        best = { doc, seq, erev, path: ml('path'), name: ml('name'), len: [...bodyBuf.toString('utf8')].length }
      }
    }
    if (best) pending.push(best)
  }
  return { pending, bad }
}

// ================= merged 臂 =================

console.log(`[probe-draft] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROJ)}，三进程真重启）`)
for (const w of Object.values(WS)) {
  fs.rmSync(w, { recursive: true, force: true })
  fs.mkdirSync(path.join(w, 'wiki'), { recursive: true })
}
fs.writeFileSync(path.join(WS.merged, 'wiki', '源.ad'), '原始页面内容——草稿协议不得触碰\n', 'utf8')
fs.writeFileSync(path.join(WS.split, 'wiki', '源.ad'), '原始页面内容——草稿协议不得触碰\n', 'utf8')
buildProbeProject()

const wikiHash0 = wikiHash(WS.merged)

console.log('  -- 进程 1 write：检查点写入与磁盘逐字节 --')
const wr = await runMergedPhase('write', WS.merged)
console.log(`  write r1 = ${wr.r1}`)
console.log(`  write r2 = ${wr.r2}`)
eq(wr.r1, 'epoch=1', 'epoch：空库首分配 = 1')
const wrParts = Object.fromEntries((wr.r2 ?? '').split('|').map((s) => {
  const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]
}))
eq(wrParts.alloc, 'd0001', '身份：首分配 d0001')
for (const k of ['ck1', 'ck3', 'ck4', 'ck5', 'ck7', 'ck8']) eq(wrParts[k], 'ok:1', `检查点 ${k} 确认`)
eq(wrParts.ck2, 'ok:2', '检查点 ck2（d1 V2）确认')
eq(wrParts.ck6, 'ok:2', '检查点 ck6（d4 V2）确认')
eq(wrParts.gid, 'err:id', '守卫：畸形 id 拒')
eq(wrParts.gpath, 'err:path', '守卫：../ 越界路径拒')

const byteCheck = (ws, rel, want, label) => {
  if (!existsf(ws, rel)) return ck(false, `${label}（文件缺失 ${rel}）`)
  ck(rd(ws, rel).equals(Buffer.from(want, 'utf8')), label)
}
byteCheck(WS.merged, 'd0001/c00001.body', CORPUS_A, '字节：d1-V1 正文逐字节（CJK/引号/反斜杠/CRLF/尾随换行）')
byteCheck(WS.merged, 'd0001/c00002.body', CORPUS_B, '字节：d1-V2 正文逐字节')
byteCheck(WS.merged, 'd0001/c00002.orig', CORPUS_A, '字节：d1-V2 原文基准 = V1 全文（往返）')
byteCheck(WS.merged, 'd0002/c00001.body', U_BODY, '字节：d2 untitled 正文逐字节')
byteCheck(WS.merged, 'd0002/c00001.orig', U_ORIG, '字节：d2 原文基准逐字节')
byteCheck(WS.merged, 'd0003/c00001.body', '', '字节：d3 空正文 = 空文件')
byteCheck(WS.merged, 'd0004/c00002.body', X2, '字节：d4-V2 正文')
const shaCheck = (ws, rel, label) => {
  const disk = sha256hex(rd(ws, rel))
  const meta = metaLine(ws, rel.replace(/\.body$/, '.meta'), 'sha')
  ck(disk === meta, `${label}（meta=${meta?.slice(0, 10)}… 磁盘=${disk.slice(0, 10)}…）`)
}
shaCheck(WS.merged, 'd0001/c00001.body', '校验：d1-V1 meta sha = Node 独立 sha256')
eq(metaLine(WS.merged, 'd0001/c00001.meta', 'len'), String([...CORPUS_A].length), '校验：meta len = 字符数')
eq(metaLine(WS.merged, 'd0001/c00001.meta', 'slen'), String(Buffer.byteLength(CORPUS_A, 'utf8')), '校验：meta slen = 字节数')
eq(wikiHash(WS.merged), wikiHash0, '原文件：写检查点后 wiki 树逐字不变（协议零触碰源页面）')

console.log('  -- 进程 2 act：结算 saved + 迟到旧写入 --')
const act = await runMergedPhase('act', WS.merged)
console.log(`  act r1 = ${act.r1}；r2 = ${act.r2}；r3 = ${act.r3}`)
eq(act.r1, 'epoch=2', 'epoch：第二进程续增 = 2')
eq(act.r2, 'settle=ok', '结算：d1 seq2 saved 确认')
eq(act.r3, 'late=ok:3', '迟到旧写入：seq3（墓碑 s00002 占号——号序即史序）')
eq(listdir(WS.merged, 'd0001').join(','), 'c00003.body,c00003.meta,c00003.orig,s00002.meta', '清理：结算后 d1 只余迟到 seq3 + 墓碑（c1/c2 三件组已清）')
eq(metaLine(WS.merged, 'd0001/s00002.meta', 'event'), 'saved', '墓碑：s00002 event=saved')
byteCheck(WS.merged, 'd0001/c00003.body', LATE, '字节：迟到写入残件在盘（排除靠 settle_erev 门）')

console.log('  -- 进程间故障注入 → 进程 3 recover：前序有效存活 --')
fs.writeFileSync(df(WS.merged, 'd0003/c00001.body'), Buffer.from('残', 'utf8').subarray(0, 2))
fs.writeFileSync(df(WS.merged, 'd0004/c00002.meta'), 'junk not a meta\n')
fs.rmSync(df(WS.merged, 'd0005/c00001.body'))
fs.writeFileSync(df(WS.merged, 'd0006/zzz.txt'), 'foreign junk\n')
fs.writeFileSync(df(WS.merged, 'd0006/cX0099.meta'), 'garbage\n')
ck(true, '注入：d3 截断 / d4 meta 坏 / d5 body 删 / d6 杂件×2')
const hashBeforeRecover = treeHash(WS.merged)
const rec = await runMergedPhase('recover', WS.merged)
console.log(`  recover r1 = ${rec.r1}；r3 = ${rec.r3}；r4 = ${rec.r4}；r5 = ${rec.r5}；r6 = ${JSON.stringify(rec.r6)}`)
eq(rec.r1, 'epoch=3', 'epoch：第三进程续增 = 3')
eq(rec.r3, 'd2body=MATCH', '恢复：d2 untitled 正文逐字 MATCH（read 通道 len/slen/sha 复核）')
eq(rec.r4, 'd2orig=MATCH', '恢复：d2 原文基准 MATCH')
eq(rec.r5, 'd4v1=MATCH', '恢复：d4 回落 V1 MATCH（V2 损坏被忽略）')
eq(rec.r6, 'd4v2read=', '恢复：d4 V2 经 read 门被拒（返回空）')
const pendDocs = [...new Set([...(rec.dump ?? '').matchAll(/doc\\":\\"(d\d+)/g)].map((m) => m[1]))].sort()
eq(pendDocs.join(','), 'd0002,d0004,d0006', '恢复清单：pending 恰 d2/d4/d6（d1 已结算不复活、d3/d5 损坏无前序）')
const badCount = (rec.dump ?? '').match(/err\\":\\"/g)?.length ?? 0
eq(badCount, 5, '恢复清单：bad 线索恰 5（d3/d4/d5 各 1 + d6 两件）')
eq(treeHash(WS.merged), hashBeforeRecover, '只读：恢复枚举前后草稿树逐字节不变（枚举零写面）')
eq(wikiHash(WS.merged), wikiHash0, '原文件：恢复枚举后 wiki 树仍逐字不变')

// ================= split 臂 =================

console.log(`\n[probe-draft] arm 2: split serve-back HTTP（:${SPLIT_PORT}，同一 back 模块）`)
const split = await startSplit(WS.split)
try {
  eq(await split.GET('/api/draft_begin'), '1', '① 空库：begin = "1"')
  ck(!fs.existsSync(path.join(WS.split, '.jade')), '① 空库：begin 只读不建 .jade')
  eq(JSON.stringify(JSON.parse(await split.GET('/api/draft_list'))), '{"epoch":1,"pending":[],"bad":[]}', '① 空库：清单恒空形')
  ck(!fs.existsSync(path.join(WS.split, '.jade')), '① 空库：list 只读不建 .jade')
  eq(await split.GET('/api/draft_alloc'), 'd0001', '③ 身份：分配 d0001')
  const ck1 = await split.POST('/api/draft_checkpoint', { doc_id: 'd0001', epoch: 1, erev: 1, path: 'wiki/表情.ad', name: '表情', body: H1, orig: '' })
  eq(ck1, 'ok:1', '② emoji/tab/多语系 CJK 检查点确认（HTTP POST body 通道）')
  byteCheck(WS.split, 'd0001/c00001.body', H1, '② H1 逐字节在盘（emoji 4 字节/tab/CRLF 全保真）')
  eq(metaLine(WS.split, 'd0001/c00001.meta', 'sha'), sha256hex(rd(WS.split, 'd0001/c00001.body')), '② meta sha = Node 独立 sha256')
  eq(metaLine(WS.split, 'd0001/c00001.meta', 'len'), String([...H1].length), '② meta len = 字符数')
  eq(metaLine(WS.split, 'd0001/c00001.meta', 'slen'), String(Buffer.byteLength(H1, 'utf8')), '② meta slen = 字节数')
  const ck2 = await split.POST('/api/draft_checkpoint', { doc_id: 'd0001', epoch: 1, erev: 2, path: 'wiki/表情.ad', name: '表情', body: '', orig: H1 })
  eq(ck2, 'ok:2', '② 空正文 V2 确认（空文合法）')
  eq(await split.GET('/api/draft_alloc'), 'd0002', '③ 身份：续分配 d0002（单调）')
  eq(await split.POST('/api/draft_checkpoint', { doc_id: 'd0002', epoch: 1, erev: 1, path: '', name: '未命名', body: H1, orig: U_ORIG }), 'ok:1', '② untitled 检查点确认')
  const g1 = await split.POST('/api/draft_checkpoint', { doc_id: 'x1', epoch: 1, erev: 1, path: 'wiki/a.ad', name: 'a', body: 'b', orig: '' })
  eq(g1, 'err:id', '③ 守卫：畸形 id 拒')
  const g2 = await split.POST('/api/draft_checkpoint', { doc_id: 'd0001', epoch: 1, erev: 1, path: '../escape.ad', name: 'a', body: 'b', orig: '' })
  eq(g2, 'err:path', '③ 守卫：越界路径拒')
  const g3 = await split.POST('/api/draft_settle', { doc_id: 'd0001', seq: 1, event: 'purge', link_id: '', erev: 1 })
  eq(g3, 'err:event', '③ 守卫：非法结算事件拒')
  const lst = JSON.parse(await split.GET('/api/draft_list'))
  const oracle = nodeOracle(WS.split)
  const sig = (l) => JSON.stringify(l.pending.map((p) => `${p.doc}:${p.seq}:${p.erev}:${p.len}:${p.path}:${p.name}`).sort()) + '|' + JSON.stringify(l.bad.map((b) => `${b.file}:${b.err}`).sort())
  eq(sig(lst), sig(oracle), '⑤ 清单：Node 独立校验器逐字段对读一致')
  const d1row = lst.pending.find((p) => p.doc === 'd0001')
  ck(!!d1row && d1row.seq === 2 && d1row.erev === 2 && d1row.len === 0, '⑤ 清单：d1 pending = V2 空文（erev 最大者）')
  eq(await split.POST('/api/draft_read', { doc_id: 'd0001', seq: 1 }), H1, '② 读回：seq1 与 H1 逐字相等')
  eq(await split.POST('/api/draft_read', { doc_id: 'd0001', seq: 2 }), '', '② 读回：seq2 空文（len=0 合法通道）')
  fs.writeFileSync(df(WS.split, 'd0002/c00001.meta'), 'garbage line\n')
  const lst2 = JSON.parse(await split.GET('/api/draft_list'))
  ck(lst2.bad.some((b) => b.file === 'd0002/c00001.meta' && b.err === 'schema-invalid'), '⑤ 故障：损坏 meta 入 bad 线索')
  ck(existsf(WS.split, 'd0002/c00001.meta'), '⑤ 故障：坏文件保留原样不删不重建')
  eq(await split.POST('/api/draft_settle', { doc_id: 'd0002', seq: 1, event: 'discarded', link_id: '', erev: 1 }), 'ok', '④ 结算：d2 discarded 确认')
  eq(listdir(WS.split, 'd0002').join(','), 's00001.meta', '④ 清理：d2 只余墓碑')
  eq(metaLine(WS.split, 'd0002/s00001.meta', 'event'), 'discarded', '④ 墓碑：s00001 event=discarded')
  const treeBody = await (await fetch(`${split.url}/api/tree?path=&depth=8`)).text()
  const idxBody = await (await fetch(`${split.url}/api/link_index?path=&depth=8`)).text()
  ck(!treeBody.includes('.jade') && !idxBody.includes('.jade'), '⑥ 索引面：tree/link_index 对 .jade/drafts 零感知')
  const searchBody = await (await fetch(`${split.url}/api/search_wiki`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'emoji', limit: 20 }) })).text()
  ck(!searchBody.includes('😀'), '⑥ 索引面：全文检索对草稿正文零感知')
  const wikiFile = path.join(WS.split, 'wiki', '源.ad')
  ck(fs.readFileSync(wikiFile, 'utf8') === '原始页面内容——草稿协议不得触碰\n', '原文件：split 臂源页面逐字不变')
} finally {
  await split.stop()
}

// ---- 汇总 ----
console.log(`\n[probe-draft] RESULT: ${failures.length === 0 ? 'merged + split 全案通过' : `FAIL（${failures.length} 项）`}`)
if (failures.length > 0) {
  console.error(failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
