#!/usr/bin/env node
// probe_lifecycle.mjs — PLAN-032 T-02 受检生命周期契约十类全弧直证（双臂）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-lifecycle/，脚本生成——
//              src/back 整树拷贝含 lifecycle.at + 探针 widget 相位直调
//              lc_plan/lc_commit），`auto run -r vm` 进程内 CALL——
//              autoui_state 读回。每相位一独立进程 + 隔离工作区。
//   split 臂   serve HTTP（`auto run --server vm`，同一 back 模块），
//              Node 直驱 POST /api/lc_plan + /api/lc_commit 全序列。
//
// 覆盖（AC-01/04/05/09 后端面；期望 = 032-lifecycle-protocol §3 定文）：
//   rename      分析变更域（后台引用源/自链/anchor/同前缀异 stem 排除/无关
//               脏域排除）→ 受检提交（四源页改写+frontmatter 保留+逐字节）
//               → stale 拒（改正文+新增引用页双注入，零变更）
//   move        ok / 目标冲突拒 / 同路径幂等零变化 / 源缺失拒
//   delete      ok（.trash 落点如实）/ 源缺失拒
//   deldir      ok（子树含嵌套；sibling 排除）/ 真 ACL 注入 partial（源保留）
//   rendir      ok（嵌套镜像+旧目录清理）/ 同名拒
//   movedir     skip 改道 / both 后缀 / plain / overwrite 双对（靶旧档入
//               moves 端点）/ 同父幂等零变化 / 循环拒 / ACL 注入 partial
//   linkify     提交（count 回执 + 词边界豁免）/ 幂等零变化 / 空 stem 拒
//   restore     ok / 目标冲突拒
//   restore_all 整批方案（冲突条目不入方案）→ partial（冲突如实 error 续行）
//   purge       ok（.trash 整清）/ 空库幂等
//   guards      未知 kind / 非 .ad / 越界 restore / 非法 strategy / 根目录
//
// 用法（仓根）：AUTO_EXE=<auto.exe> node tests/probe_lifecycle.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { pickPort } from './pick_port.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/release/auto.exe'
const RUNTIME = path.join(REPO, 'e2e', '.runtime')
const PROJ = path.join(RUNTIME, 'probe-lifecycle')
const RUN = path.join(RUNTIME, 'probe-lifecycle-run')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha256hex = (buf) => crypto.createHash('sha256').update(buf).digest('hex')

const failures = []
const ck = (ok, label) => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`)
  if (!ok) failures.push(label)
}
const eq = (a, b, label) => ck(a === b, `${label}（got=${JSON.stringify(a)} want=${JSON.stringify(b)}）`)

const LOG = path.join(RUN, 'probe-lifecycle.log')
fs.mkdirSync(RUN, { recursive: true })
const origLog = console.log.bind(console)
console.log = (...args) => {
  origLog(...args)
  fs.appendFileSync(LOG, args.map(String).join(' ') + '\n')
}

// ---- 记录解析（位置文法）----
const recField = (rec, idx) => (rec ?? '').split('|')[idx] ?? null
const recItems = (f) => (f ? f.split('*').filter(Boolean) : [])
const recPairOlds = (f) => recItems(f).map((p) => p.split('>')[0])

// ---- 磁盘面 ----
const WF = (ws, rel, content) => {
  const full = path.join(ws, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, Buffer.from(content, 'utf8'))
}
const rd = (ws, rel) => fs.readFileSync(path.join(ws, rel))
const existsf = (ws, rel) => fs.existsSync(path.join(ws, rel))
const denyDel = (ws, rel) => execFileSync('icacls', [path.join(ws, rel), '/deny', '*S-1-1-0:(D)'], { stdio: 'pipe' })
const allowDel = (ws, rel) => execFileSync('icacls', [path.join(ws, rel), '/remove:d', '*S-1-1-0'], { stdio: 'pipe' })
const aclClean = (ws) => {
  try { execFileSync('icacls', [ws, '/remove:d', '*S-1-1-0', '/t'], { stdio: 'ignore' }) } catch {}
}
const snap = (ws, rels) => JSON.stringify(rels.map((r) => [r, existsf(ws, r) ? sha256hex(rd(ws, r)) : null]))

// ---- 语料 ----
const ROOT_AD = '---\ntitle: 根页\ncreated: 2026-01-01\n---\n自链 [[根页]] 与 [[根页#节一]]。\n'
const YI_AD = '引用：[[根页]] 和 [[根页#节一]]。\n'
const BING_AD = '背景引用 [[根页]]，emoji 😀 与引号 "q"、\r\nCRLF 行\r\n尾随换行\n'
const DING_AD = '无关脏域自链 [[丁页]]。\n'
const QIAN_AD = '同前缀：[[根页]] 改写、[[根页笔记]] 不改。\n'
const RENAME_FILES = ['根页.ad', '乙页.ad', '丙页.ad', '丁页.ad', '根页笔记.ad']

function seedWs(name, seedFn) {
  const ws = path.join(RUN, `ws-${name}`)
  aclClean(ws)
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  seedFn(ws)
  return ws
}

// ================= merged 臂 =================

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

async function runPhase(phase, ws, port, extraEnv = {}) {
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: PROJ,
    env: { ...process.env, AUTOUI_MCP_PORT: String(port), JADE_WORKSPACE: ws, P32_PHASE: phase, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const { rpc } = makeMcp(port)
    const deadline = Date.now() + 60000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'p32-t02', version: '0.1.0' } })
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
    return { r1: field('r1'), r2: field('r2'), r3: field('r3'), r4: field('r4'), r5: field('r5'), r6: field('r6') }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// 探针 widget（生成件——每相位块内局部拷贝纪律：T-01 §5④）
const PROBE_AT = `// 探针 widget（tests/probe_lifecycle.mjs 生成件——.runtime 再生，不入库源）
use back.api: env_str, lc_plan, lc_commit

widget App {
    msg { Init }
    model {
        var done bool = false
        var r1 str = ""
        var r2 str = ""
        var r3 str = ""
        var r4 str = ""
        var r5 str = ""
        var r6 str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe lc" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            var ph str = env_str("P32_PHASE")
            var ea str = env_str("P32_A")
            var eb str = env_str("P32_B")
            var ec str = env_str("P32_C")
            var ebasis str = env_str("P32_BASIS")
            if ph == "rn-gate" {
                var k1 str = "rename"
                var a1 str = ea
                var b1 str = eb
                r1 = lc_plan(k1, a1, b1, "")
            }
            if ph == "rn-commit" {
                var k1 str = "rename"
                var a1 str = ea
                var b1 str = eb
                var rec str = lc_plan(k1, a1, b1, "")
                var segs = rec.split("|")
                var bb str = segs[2]
                r1 = lc_commit(k1, a1, b1, "", bb)
            }
            if ph == "rn-stale" {
                var k1 str = "rename"
                var a1 str = ea
                var b1 str = eb
                var bl1 str = ebasis
                r1 = lc_commit(k1, a1, b1, "", bl1)
            }
            if ph == "file-ops" {
                var km str = "move"
                var pm1 str = "源档.ad"
                var dm1 str = "目标目录"
                var recm str = lc_plan(km, pm1, dm1, "")
                var sg = recm.split("|")
                var bm str = sg[2]
                r1 = lc_commit(km, pm1, dm1, "", bm)
                var kmc str = "move"
                var pm2 str = "源档2.ad"
                var dm2 str = "目标目录"
                r2 = lc_plan(kmc, pm2, dm2, "")
                var kmi str = "move"
                var pm3 str = "源档3.ad"
                r3 = lc_plan(kmi, pm3, "", "")
                var kmx str = "move"
                var pm4 str = "不存在.ad"
                var dm4 str = "目标目录"
                r4 = lc_plan(kmx, pm4, dm4, "")
                var kd str = "delete"
                var pd1 str = "待删.ad"
                var recd str = lc_plan(kd, pd1, "", "")
                var sgd = recd.split("|")
                var bd str = sgd[2]
                r5 = lc_commit(kd, pd1, "", "", bd)
                var kdx str = "delete"
                var pd2 str = "不存在.ad"
                r6 = lc_plan(kdx, pd2, "", "")
            }
            if ph == "dir-ok" {
                var kdd str = "deldir"
                var dd1 str = "tree"
                var recdd str = lc_plan(kdd, dd1, "", "")
                var sgdd = recdd.split("|")
                var bdd str = sgdd[2]
                r1 = lc_commit(kdd, dd1, "", "", bdd)
                r2 = recdd
                var krd str = "rendir"
                var rd1 str = "rdir"
                var rn1 str = "新目录"
                var recrd str = lc_plan(krd, rd1, rn1, "")
                var sgrd = recrd.split("|")
                var brd str = sgrd[2]
                r3 = lc_commit(krd, rd1, rn1, "", brd)
                r4 = recrd
                var krdx str = "rendir"
                var rdx1 str = "新目录"
                var rdxn str = "改名二"
                r5 = lc_plan(krdx, rdx1, rdxn, "")
            }
            if ph == "deldir-partial" {
                var kdd str = "deldir"
                var dd1 str = "ptree"
                var recdd str = lc_plan(kdd, dd1, "", "")
                var sgdd = recdd.split("|")
                var bdd str = sgdd[2]
                r1 = lc_commit(kdd, dd1, "", "", bdd)
            }
            if ph == "movedir-partial" {
                var kmd str = "movedir"
                var ms1 str = "mtree"
                var md1 str = "mdst"
                var recmd str = lc_plan(kmd, ms1, md1, "")
                var sgmd = recmd.split("|")
                var bmd str = sgmd[2]
                r1 = lc_commit(kmd, ms1, md1, "", bmd)
            }
            if ph == "md-strat" {
                var k1 str = "movedir"
                var s1 str = "ms1"
                var d1 str = "md1"
                var rec1 str = lc_plan(k1, s1, d1, "skip")
                var g1 = rec1.split("|")
                var bs1 str = g1[2]
                r1 = lc_commit(k1, s1, d1, "skip", bs1)
                var s2 str = "ms2"
                var d2 str = "md2"
                var rec2 str = lc_plan(k1, s2, d2, "both")
                var g2 = rec2.split("|")
                var bs2 str = g2[2]
                r2 = lc_commit(k1, s2, d2, "both", bs2)
                var s3 str = "ms3"
                var d3 str = "md3"
                var rec3 str = lc_plan(k1, s3, d3, "")
                var g3 = rec3.split("|")
                var bs3 str = g3[2]
                r3 = lc_commit(k1, s3, d3, "", bs3)
                var s4 str = "ms4"
                var d4 str = "md4"
                var rec4 str = lc_plan(k1, s4, d4, "overwrite")
                var g4 = rec4.split("|")
                var bs4 str = g4[2]
                r4 = lc_commit(k1, s4, d4, "overwrite", bs4)
                var s5 str = "md3/ms3"
                var d5 str = "md3"
                r5 = lc_plan(k1, s5, d5, "")
                var s6 str = "md3"
                var d6 str = "md3/ms3"
                r6 = lc_plan(k1, s6, d6, "")
            }
            if ph == "md-strat2" {
                var k1 str = "movedir"
                var s7 str = "ms5"
                var d7 str = "md5"
                var bad str = "bogus"
                r1 = lc_plan(k1, s7, d7, bad)
                var s8 str = "ms6"
                var d8 str = "ms6/sub"
                r2 = lc_plan(k1, s8, d8, "")
                var s9 str = "不存在目录"
                var d9 str = "md5"
                r3 = lc_plan(k1, s9, d9, "")
            }
            if ph == "trash-arc" {
                var kr str = "restore"
                var e1 str = ".trash/t1.ad"
                var rec1 str = lc_plan(kr, e1, "", "")
                var g1 = rec1.split("|")
                var b1 str = g1[2]
                r1 = lc_commit(kr, e1, "", "", b1)
                var e2 str = ".trash/t2.ad"
                r2 = lc_plan(kr, e2, "", "")
                var ka str = "restore_all"
                var rec2 str = lc_plan(ka, "", "", "")
                var g2 = rec2.split("|")
                var b2 str = g2[2]
                r3 = rec2
                r4 = lc_commit(ka, "", "", "", b2)
                var kp str = "purge"
                var rec3 str = lc_plan(kp, "", "", "")
                var g3 = rec3.split("|")
                var b3 str = g3[2]
                r5 = rec3
                r6 = lc_commit(kp, "", "", "", b3)
            }
            if ph == "linkify-arc" {
                var kf str = "linkify"
                var pf str = "lf.ad"
                var sf str = "CAP"
                var rec1 str = lc_plan(kf, pf, sf, "")
                var g1 = rec1.split("|")
                var b1 str = g1[2]
                r1 = lc_commit(kf, pf, sf, "", b1)
                var pz str = "lfz.ad"
                var rec2 str = lc_plan(kf, pz, sf, "")
                var g2 = rec2.split("|")
                var b2 str = g2[2]
                r2 = lc_commit(kf, pz, sf, "", b2)
                var rec3 str = lc_plan(kf, pf, "", "")
                r3 = rec3
            }
            if ph == "guards" {
                var kx str = "nonsense"
                r1 = lc_plan(kx, "x.ad", "", "")
                var bl1 str = "F0**"
                r2 = lc_commit(kx, "x.ad", "", "", bl1)
                var kd str = "delete"
                var pd str = "plain.txt"
                r3 = lc_plan(kd, pd, "", "")
                var kr str = "restore"
                var er str = "outside.ad"
                r4 = lc_plan(kr, er, "", "")
                var km str = "movedir"
                var sm str = "tree"
                var dm str = "tree2"
                var bm str = "wrong"
                r5 = lc_plan(km, sm, dm, bm)
                var kd2 str = "deldir"
                r6 = lc_plan(kd2, "", "", "")
            }
            done = true
        }
    }
}
`

function buildProbeProject() {
  fs.rmSync(PROJ, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROJ, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(REPO, 'src', 'back'), path.join(PROJ, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROJ, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(
    path.join(PROJ, 'pac.at'),
    `name: "auto-jade-probe-lifecycle"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeLifecycle"
window: "400x300"
`,
    'utf8',
  )
}

// ---- merged fixture 种子 ----
const seedRename = (ws) => {
  WF(ws, '根页.ad', ROOT_AD)
  WF(ws, '乙页.ad', YI_AD)
  WF(ws, '丙页.ad', BING_AD)
  WF(ws, '丁页.ad', DING_AD)
  WF(ws, '根页笔记.ad', QIAN_AD)
}
const seedFileOps = (ws) => {
  WF(ws, '源档.ad', 'M1 内容\n')
  WF(ws, '源档2.ad', 'M2 内容\n')
  WF(ws, '目标目录/源档2.ad', '占位——与源不同\n')
  WF(ws, '源档3.ad', 'M3 幂等\n')
  WF(ws, '待删.ad', 'D1 待删内容\n')
}
const seedDirOk = (ws) => {
  WF(ws, 'tree/a.ad', 'A\n')
  WF(ws, 'tree/b.ad', 'B\n')
  WF(ws, 'tree/sub/c.ad', 'C\n')
  WF(ws, 'sib/q.ad', 'Q——deldir 不波及\n')
  WF(ws, 'rdir/x.ad', 'X\n')
  WF(ws, 'rdir/sub/y.ad', 'Y\n')
}
const seedDirPartial = (ws) => {
  fs.mkdirSync(path.join(ws, 'mdst'), { recursive: true })
  WF(ws, 'ptree/a-ok.ad', 'OK\n')
  WF(ws, 'ptree/b-deny.ad', 'DENY——源保留\n')
  WF(ws, 'mtree/a-ok.ad', 'M-OK\n')
  WF(ws, 'mtree/b-deny.ad', 'M-DENY——源保留\n')
}
const seedMdStrat = (ws) => {
  fs.mkdirSync(path.join(ws, 'md3'), { recursive: true })
  WF(ws, 'ms1/conf.ad', 'S 源冲突\n')
  WF(ws, 'md1/ms1/conf.ad', 'S 靶冲突\n')
  WF(ws, 'ms2/conf.ad', 'B 源冲突\n')
  WF(ws, 'md2/ms2/conf.ad', 'B 靶冲突\n')
  WF(ws, 'ms3/x.ad', 'P 纯移\n')
  WF(ws, 'ms4/c.ad', 'O 源\n')
  WF(ws, 'md4/ms4/c.ad', 'O 靶旧\n')
  WF(ws, 'ms5/ad.ad', '非法策略素材\n')
  WF(ws, 'ms6/sub/deep.ad', '循环素材\n')
}
const seedTrash = (ws) => {
  WF(ws, 't2.ad', 't2 恢复目标已占用\n')
  WF(ws, '.trash/t1.ad', 'T1 恢复我\n')
  WF(ws, '.trash/t2.ad', 'T2 目标冲突\n')
  WF(ws, '.trash/sub/t3.ad', 'T3 批量恢复\n')
}
const seedLinkify = (ws) => {
  WF(ws, 'lf.ad', '提到 CAP 与 CAPTURE 豁免。\n')
  WF(ws, 'lfz.ad', '已链接 [[CAP]] 不转换。\n')
}

async function mergedArm() {
  console.log('\n== merged 臂：受检生命周期全弧 ==')
  buildProbeProject()
  const PORT = await pickPort()

  // ---- rename ----
  const wsRN = seedWs('rn', seedRename)
  const g = await runPhase('rn-gate', wsRN, PORT, { P32_A: '根页.ad', P32_B: '新名' })
  eq(recField(g.r1, 1), 'ok', 'rename：分析 ok')
  eq(recField(g.r1, 4), '根页.ad>新名.ad', 'rename：moves 恰一对')
  eq(recItems(recField(g.r1, 5)).slice().sort().join('*'), ['乙页.ad', '丙页.ad', '根页.ad', '根页笔记.ad'].sort().join('*'), 'rename：rewrites 恰四档（自链+后台引用源+同前缀页内引用）')
  ck(!recField(g.r1, 3).includes('丁页.ad:'), 'rename：无关页不入变更域')
  const before = snap(wsRN, RENAME_FILES)
  const c = await runPhase('rn-commit', wsRN, PORT, { P32_A: '根页.ad', P32_B: '新名' })
  eq(recField(c.r1, 1), 'ok', 'rename：提交 ok')
  eq(recField(c.r1, 2), '新名.ad', 'rename：dir=新落点')
  eq(recField(c.r1, 6), '', 'rename：errors 空')
  ck(!existsf(wsRN, '根页.ad') && existsf(wsRN, '新名.ad'), 'rename 磁盘：旧消失新在')
  eq(rd(wsRN, '新名.ad').toString('utf8'), ROOT_AD.replaceAll('[[根页', '[[新名'), 'rename 磁盘：新档自链/anchor 改写+frontmatter 保留')
  ck(rd(wsRN, '丙页.ad').equals(Buffer.from(BING_AD.replaceAll('[[根页]]', '[[新名]]'), 'utf8')), 'rename 磁盘：后台源改写逐字节（emoji/引号/CRLF）')
  eq(rd(wsRN, '根页笔记.ad').toString('utf8'), '同前缀：[[新名]] 改写、[[根页笔记]] 不改。\n', 'rename 磁盘：同前缀只改目标引用')
  ck(rd(wsRN, '丁页.ad').equals(Buffer.from(DING_AD, 'utf8')), 'rename 磁盘：无关页零扰动')
  // stale
  const p1 = recField(g.r1, 2)
  WF(wsRN, '丙页.ad', BING_AD + '分析后追加\n')
  WF(wsRN, '戊页.ad', '新增引用 [[新名]]。\n')
  const staleBefore = snap(wsRN, [...RENAME_FILES.map((f) => f.replace('根页.ad', '新名.ad')), '戊页.ad'])
  const st = await runPhase('rn-stale', wsRN, PORT, { P32_A: '新名.ad', P32_B: '改名2', P32_BASIS: p1 })
  eq(recField(st.r1, 1), 'stale', 'stale：改正文+新增页双注入 → 拒')
  eq(recField(st.r1, 3), '', 'stale：moves 空（零变更）')
  eq(snap(wsRN, [...RENAME_FILES.map((f) => f.replace('根页.ad', '新名.ad')), '戊页.ad']), staleBefore, 'stale：全部文件保持提交前状态')

  // ---- file-ops ----
  const wsFO = seedWs('fo', seedFileOps)
  const fo = await runPhase('file-ops', wsFO, PORT)
  eq(recField(fo.r1, 1), 'ok', 'move：提交 ok')
  eq(recField(fo.r1, 2), '目标目录/源档.ad', 'move：dir=新路径')
  eq(rd(wsFO, '目标目录/源档.ad').toString('utf8'), 'M1 内容\n', 'move 磁盘：内容字节整迁')
  eq(recField(fo.r2, 1), 'reject', 'move：目标冲突拒')
  eq(recField(fo.r3, 1), 'ok', 'move：同路径幂等 ok')
  eq(recField(fo.r3, 4), '', 'move：幂等 moves 空（零变化）')
  eq(recField(fo.r4, 1), 'reject', 'move：源缺失拒')
  eq(recField(fo.r5, 1), 'ok', 'delete：提交 ok')
  ck(!existsf(wsFO, '待删.ad') && existsf(wsFO, '.trash/待删.ad'), 'delete 磁盘：源消失+回收站落点在')
  eq(rd(wsFO, '.trash/待删.ad').toString('utf8'), 'D1 待删内容\n', 'delete 磁盘：回收站内容字节一致')
  eq(recField(fo.r6, 1), 'reject', 'delete：源缺失拒')

  // ---- dir-ok ----
  const wsDO = seedWs('do', seedDirOk)
  const dos = await runPhase('dir-ok', wsDO, PORT)
  eq(recField(dos.r1, 1), 'ok', 'deldir：提交 ok')
  ck(!existsf(wsDO, 'tree') && existsf(wsDO, '.trash/tree/a.ad') && existsf(wsDO, '.trash/tree/sub/c.ad'), 'deldir 磁盘：子树尽迁回收站（保结构含嵌套）')
  ck(existsf(wsDO, 'sib/q.ad'), 'deldir 磁盘：sibling 零扰动')
  eq(recField(dos.r3, 1), 'ok', 'rendir：提交 ok')
  ck(!existsf(wsDO, 'rdir') && existsf(wsDO, '新目录/x.ad') && existsf(wsDO, '新目录/sub/y.ad'), 'rendir 磁盘：嵌套镜像迁移+旧目录清理')
  eq(rd(wsDO, '新目录/sub/y.ad').toString('utf8'), 'Y\n', 'rendir 磁盘：嵌套内容字节一致')
  eq(recField(dos.r5, 1), 'ok', 'rendir：改名到空闲名 ok（新目录→sib2 无同名）')
}

async function mergedArm2(PORT) {
  // ---- dir-partial ----
  const wsDP = seedWs('dp', seedDirPartial)
  denyDel(wsDP, 'ptree/b-deny.ad')
  denyDel(wsDP, 'mtree/b-deny.ad')
  const dp1 = await runPhase('deldir-partial', wsDP, PORT)
  eq(recField(dp1.r1, 1), 'partial', 'deldir：真故障 → partial（不假成功）')
  eq(recField(dp1.r1, 5), 'ptree/a-ok.ad>.trash/ptree/a-ok.ad', 'deldir：已完成项如实（deletes 域）')
  ck((recField(dp1.r1, 6) ?? '').startsWith('divert-failed:ptree/b-deny.ad'), `deldir：失败项如实（got=${dp1.r1}）`)
  ck(!existsf(wsDP, '.trash/ptree/b-deny.ad'), 'deldir 磁盘：短写/空副本残件被尺寸核验清除（不留数据丢失面）')
  ck(existsf(wsDP, 'ptree/b-deny.ad'), 'deldir 磁盘：deny 源仍在位')
  const dp2 = await runPhase('movedir-partial', wsDP, PORT)
  eq(recField(dp2.r1, 1), 'partial', 'movedir：真故障 → partial')
  eq(recField(dp2.r1, 3), 'mtree/a-ok.ad>mdst/mtree/a-ok.ad', 'movedir：已完成项如实')
  ck(existsf(wsDP, 'mtree/b-deny.ad'), 'movedir 磁盘：deny 源仍在位')
  allowDel(wsDP, 'ptree/b-deny.ad')
  allowDel(wsDP, 'mtree/b-deny.ad')
  ck(rd(wsDP, 'ptree/b-deny.ad').equals(Buffer.from('DENY——源保留\n', 'utf8')), 'deldir 磁盘：deny 源内容完好（ACL 解除后对照）')
  ck(rd(wsDP, 'mtree/b-deny.ad').equals(Buffer.from('M-DENY——源保留\n', 'utf8')), 'movedir 磁盘：deny 源内容完好（ACL 解除后对照）')

  // ---- md-strat ----
  const wsMD = seedWs('md', seedMdStrat)
  const md = await runPhase('md-strat', wsMD, PORT)
  eq(recField(md.r1, 1), 'ok', 'movedir skip：提交 ok')
  eq(recField(md.r1, 3), 'ms1/conf.ad>.trash/ms1/conf.ad', 'movedir skip：源冲突档改道 .trash（靶档保留）')
  ck(rd(wsMD, 'md1/ms1/conf.ad').equals(Buffer.from('S 靶冲突\n', 'utf8')), 'movedir skip 磁盘：靶档原样')
  eq(recField(md.r2, 1), 'ok', 'movedir both：提交 ok')
  eq(recField(md.r2, 3), 'ms2/conf.ad>md2/ms2/conf--1.ad', 'movedir both：后缀新落点')
  eq(recField(md.r3, 1), 'ok', 'movedir plain：提交 ok')
  ck(existsf(wsMD, 'md3/ms3/x.ad') && !existsf(wsMD, 'ms3'), 'movedir plain 磁盘：整目录迁入')
  eq(recField(md.r4, 1), 'ok', 'movedir overwrite：提交 ok')
  eq(recPairOlds(recField(md.r4, 3)).join('*'), ['md4/ms4/c.ad', 'ms4/c.ad'].join('*'), 'movedir overwrite：双对（靶旧档改道+源落靶位）')
  ck(rd(wsMD, 'md4/ms4/c.ad').equals(Buffer.from('O 源\n', 'utf8')), 'movedir overwrite 磁盘：源落靶位')
  ck(rd(wsMD, '.trash/md4/ms4/c.ad').equals(Buffer.from('O 靶旧\n', 'utf8')), 'movedir overwrite 磁盘：靶旧档入回收站（restore 通道）')
  eq(recField(md.r5, 1), 'ok', 'movedir：同父幂等 ok')
  eq(recField(md.r5, 4), '', 'movedir：幂等 moves 空（零变化）')
  eq(recField(md.r6, 1), 'reject', 'movedir：移入自身/后代循环拒')

  const md2 = await runPhase('md-strat2', wsMD, PORT)
  eq(recField(md2.r1, 1), 'reject', 'movedir：非法 strategy 拒（fail-closed）')
  eq(recField(md2.r2, 1), 'reject', 'movedir：移入后代（ms6→ms6/sub）拒')
  eq(recField(md2.r3, 1), 'reject', 'movedir：源目录缺失拒')

  // ---- trash-arc ----
  const wsTR = seedWs('tr', seedTrash)
  const tr = await runPhase('trash-arc', wsTR, PORT)
  eq(recField(tr.r1, 1), 'ok', 'restore：提交 ok')
  eq(recField(tr.r1, 2), 't1.ad', 'restore：dir=恢复目标')
  eq(rd(wsTR, 't1.ad').toString('utf8'), 'T1 恢复我\n', 'restore 磁盘：内容回原位')
  eq(recField(tr.r2, 1), 'reject', 'restore：目标冲突拒')
  const planAll = JSON.parse('{}')
  eq(recField(tr.r3, 1), 'ok', 'restore_all：整批方案 ok')
  ck(recPairOlds(recField(tr.r3, 4)).includes('.trash/t2.ad'), 'restore_all：冲突条目在整批方案中（schema 完整——前端门覆盖被占用目标；commit 期逐条复核）')
  eq(recField(tr.r4, 1), 'partial', 'restore_all：冲突条目 → partial（不假成功）')
  ck((recField(tr.r4, 6) ?? '').startsWith('restore-rejected:.trash/t2.ad'), `restore_all：冲突如实 error（got=${tr.r4}）`)
  eq(rd(wsTR, 'sub/t3.ad').toString('utf8'), 'T3 批量恢复\n', 'restore_all 磁盘：可行条目已恢复（保结构）')
  eq(recField(tr.r5, 1), 'ok', 'purge：方案 ok')
  eq(recField(tr.r6, 1), 'ok', 'purge：提交 ok')
  ck(!existsf(wsTR, '.trash'), 'purge 磁盘：.trash 整清')
  ck(rd(wsTR, 't2.ad').equals(Buffer.from('t2 恢复目标已占用\n', 'utf8')), 'purge 磁盘：被占用目标原样（工作区零扰动）')

  // ---- linkify ----
  const wsLF = seedWs('lf', seedLinkify)
  const lf = await runPhase('linkify-arc', wsLF, PORT)
  eq(recField(lf.r1, 1), 'ok', 'linkify：提交 ok')
  eq(recField(lf.r1, 2), '1', 'linkify：count=1（词边界豁免 CAPTURE）')
  eq(rd(wsLF, 'lf.ad').toString('utf8'), '提到 [[CAP]] 与 CAPTURE 豁免。\n', 'linkify 磁盘：纯文本出现处包裹+豁免如实')
  eq(recField(lf.r2, 1), 'ok', 'linkify：幂等零变化 ok')
  eq(recField(lf.r2, 2), '0', 'linkify：零变化 dir=0')
  eq(recField(lf.r3, 1), 'reject', 'linkify：空 stem 拒')

  // ---- guards ----
  const gu = await runPhase('guards', wsLF, PORT)
  eq(recField(gu.r1, 1), 'reject', 'guards：未知 kind 拒（plan）')
  eq(recField(gu.r2, 1), 'reject', 'guards：未知 kind 拒（commit）')
  eq(recField(gu.r3, 1), 'reject', 'guards：非 .ad 删除拒')
  eq(recField(gu.r4, 1), 'reject', 'guards：.trash 外 restore 拒（越界）')
  eq(recField(gu.r5, 1), 'reject', 'guards：非法 strategy 拒')
  eq(recField(gu.r6, 1), 'reject', 'guards：根目录删除拒')
}

// ================= split 臂 =================

async function startSplit(ws, port) {
  const child = spawn(AUTO_EXE, ['run', '--server', 'vm', '-B', String(port)], {
    cwd: PROJ,
    env: { ...process.env, JADE_WORKSPACE: ws },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  child.stdout.on('data', (d) => (out += d))
  child.stderr.on('data', (d) => (out += d))
  const url = `http://127.0.0.1:${port}`
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
  const POST = async (p, body) => {
    const res = await fetch(`${url}${p}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`POST ${p} -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    return JSON.parse(await res.text())
  }
  const planC = async (kind, a, b, c) => POST('/api/lc_plan', { kind, a, b, c })
  const commitC = async (kind, a, b, c, basis) => POST('/api/lc_commit', { kind, a, b, c, basis })
  return {
    url, child, planC, commitC,
    stop: async () => {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
      await sleep(400)
    },
  }
}

async function splitArm() {
  console.log('\n== split 臂：HTTP 全序列（同一 back 模块） ==')
  const wsS = seedWs('split', (ws) => {
    seedRename(ws)
    WF(ws, 'mv.ad', 'S-MV\n')
    WF(ws, 'dstdir/占.ad', '占\n')
    WF(ws, 'lf.ad', '提到 CAP 与 CAPTURE。\n')
  })
  const SPLIT_PORT = await pickPort()
  const sp = await startSplit(wsS, SPLIT_PORT)
  try {
    const p1 = await sp.planC('rename', '根页.ad', '新名', '')
    eq(recField(p1, 1), 'ok', 'split rename：分析 ok')
    eq(recItems(recField(p1, 5)).length, 4, 'split rename：rewrites 恰四档')
    const c1 = await sp.commitC('rename', '根页.ad', '新名', '', recField(p1, 2))
    eq(recField(c1, 1), 'ok', 'split rename：提交 ok')
    ck(!existsf(wsS, '根页.ad') && existsf(wsS, '新名.ad'), 'split rename 磁盘：迁移生效')
    const bad = await sp.commitC('rename', '新名.ad', '终名', '', recField(p1, 2))
    eq(recField(bad, 1), 'stale', 'split rename：陈旧 basis 拒（零变更）')
    const m1 = await sp.planC('move', 'mv.ad', 'dstdir', '')
    const c2 = await sp.commitC('move', 'mv.ad', 'dstdir', '', recField(m1, 2))
    eq(recField(c2, 1), 'ok', 'split move：提交 ok')
    eq(rd(wsS, 'dstdir/mv.ad').toString('utf8'), 'S-MV\n', 'split move 磁盘：字节一致')
    const d1 = await sp.planC('delete', 'dstdir/mv.ad', '', '')
    const c3 = await sp.commitC('delete', 'dstdir/mv.ad', '', '', recField(d1, 2))
    eq(recField(c3, 1), 'ok', 'split delete：提交 ok')
    ck(existsf(wsS, '.trash/dstdir/mv.ad'), 'split delete 磁盘：回收站保结构落点')
    const l1 = await sp.planC('linkify', 'lf.ad', 'CAP', '')
    const c4 = await sp.commitC('linkify', 'lf.ad', 'CAP', '', recField(l1, 2))
    eq(recField(c4, 1), 'ok', 'split linkify：提交 ok')
    eq(rd(wsS, 'lf.ad').toString('utf8'), '提到 [[CAP]] 与 CAPTURE。\n', 'split linkify 磁盘：包裹正确')
    const gx = await sp.planC('nonsense', 'x', '', '')
    eq(recField(gx, 1), 'reject', 'split guards：未知 kind 拒')
  } finally {
    await sp.stop()
  }
}

// ================= 主流程 =================

origLog(`[p32-t02] repo=${REPO}`)
origLog(`[p32-t02] AUTO_EXE=${AUTO_EXE}`)
fs.rmSync(LOG, { force: true })

buildProbeProject()
const PORT = await pickPort()
await mergedArm(PORT)
await mergedArm2(PORT)
await splitArm()

console.log(`\n[p32-t02] RESULT: ${failures.length === 0 ? 'ALL GREEN' : `FAIL（${failures.length} 项）`}`)
if (failures.length > 0) {
  console.error(failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
