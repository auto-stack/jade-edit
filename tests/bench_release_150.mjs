#!/usr/bin/env node
// bench_release_150.mjs — PLAN-039 T-02 持久发行规模性能入口（原 e2e/.runtime/
// p21-bench150.mjs 一次性件收编——.runtime 居 ignored 不可作发行依赖，§6.2）。
//
//   语料   150 页合成（P≤200 安全线内；CJK/深目录/别名/tags/悬空混布）
//          → e2e/.runtime/bench150-ws（AUTO_JADE_WORKSPACE 隔离指向，每次重建）
//   HTTP 面 serve-back（`auto run --server vm`）计时：
//     ①索引  link_index GET 全量（冷/热）+ ①b tags_index 全量
//     ②检索  search_wiki POST（CJK/ASCII/别名）
//     ③建页  create_page POST ×3（幂等域外新名）
//     ④改名  rename_page POST（带反链改写 walk——最重操作）
//   UI 面   merged 臂 boot + 冒烟（MCP）：
//     boot-ready 墙钟 / 快开过滤 / 深档开档 / 保存弧线 / 孤页清单 / 警示面
//   硬门    tags_index ≤1500 ms（PLAN-029 已验收门保留——超门 findings+退出
//           码 1）；其余计时作同环境观察值（不发明硬门，实录进 validation）。
//   完整性  页数/首中尾锚/悬空计数/改名改写翻转/残留旧链逐项断言。
//
// 用法（仓根）：node tests/bench_release_150.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const WS = path.join(repoRoot, 'e2e', '.runtime', 'bench150-ws')
const PORT = 9431
const TAGS_INDEX_GATE_MS = 1500 // PLAN-029 已验收门（150 页聚合）
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const now = () => Number(process.hrtime.bigint() / 1000000n)
const timings = {}
const findings = []

// ---------------- 语料生成（150 页） ----------------
function buildCorpus() {
  fs.rmSync(WS, { recursive: true, force: true })
  fs.mkdirSync(path.join(WS, 'wiki'), { recursive: true })
  fs.mkdirSync(path.join(WS, 'deep/d1/d2/d3/d4'), { recursive: true })
  fs.mkdirSync(path.join(WS, 'notes'), { recursive: true })
  let n = 0
  const w = (rel, body) => { fs.writeFileSync(path.join(WS, rel), body, 'utf8'); n++ }
  // ① wiki/ 30 页 CJK frontmatter 档（title/tags/aliases 三键混布 + 互链）
  for (let i = 1; i <= 30; i++) {
    const links = i < 30 ? `见 [[CJK页${i + 1}]] 与 [[Deep页${(i % 40) + 1}]]。` : '链尾。'
    w(`wiki/CJK页${i}.ad`, `---\ntitle: CJK页${i}显示名\ntags:\n  - 领域${(i % 5) + 1}\n  - 计${i}\naliases:\n  - 别名${i}\nupdated_at: 2026-09-27T00:00:00\n---\n# CJK页${i}\n\n正文第 ${i} 页，含 #行内标签${(i % 7) + 1} 。\n\n${links}\n`)
  }
  // ② 深目录 40 页（d1..d4 嵌套——depth 8 覆盖域）
  for (let i = 1; i <= 40; i++) {
    const tier = i <= 10 ? 'deep' : i <= 20 ? 'deep/d1' : i <= 30 ? 'deep/d1/d2/d3' : 'deep/d1/d2/d3/d4'
    w(`${tier}/Deep页${i}.ad`, `# Deep页${i}\n\n层级 ${tier}。\n\n参考 [[CJK页${(i % 30) + 1}]]。\n`)
  }
  // ③ notes/ 40 页（别名档 15 + 悬空链 10 + tags 纯 body 15）
  for (let i = 1; i <= 40; i++) {
    if (i <= 15) {
      w(`notes/Note${i}.ad`, `---\naliases:\n  - 别名靶${i}\n---\n# Note${i}\n\n别名载体 ${i}。\n`)
    } else if (i <= 25) {
      w(`notes/Note${i}.ad`, `# Note${i}\n\n悬空指 [[不存在的目标${i}]]。\n`)
    } else {
      w(`notes/Note${i}.ad`, `# Note${i}\n\n纯行内 #批量标签${(i % 4) + 1} 无 frontmatter。\n`)
    }
  }
  // ④ 根 ASCII 40 页（快开/检索 ASCII 面 + 出链）
  for (let i = 1; i <= 40; i++) {
    w(`Root${i}.ad`, `# Root${i}\n\nRoot body ${i} — see [[Note${(i % 40) + 1}]].\n`)
  }
  return n
}

// ---------------- HTTP 面（serve-back） ----------------
async function httpPhase() {
  process.env.AUTO_JADE_FIXTURE = WS // serve-back 隔离源指语料——⚠ 须在 import 前
  // （serve-back 模块加载期读 FIXTURE_SOURCE 常量；p21 首跑实录：import 先行
  // 5 页 fixture 混入，全案计时作废重跑）
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: PORT })
  try {
    const t = async (label, fn) => {
      const s = now()
      const r = await fn()
      const ms = now() - s
      timings[label] = ms
      console.log(`  [http] ${label}: ${ms} ms`)
      return r
    }
    // ① 索引（冷=首查 + 热×2）
    const idx1 = await t('①link_index 冷', async () => (await (await fetch(`${back.url}/api/link_index?path=&depth=8`)).text()).length)
    await t('①link_index 热1', async () => (await (await fetch(`${back.url}/api/link_index?path=&depth=8`)).text()).length)
    const idxHot = await t('①link_index 热2', async () => (await (await fetch(`${back.url}/api/link_index?path=&depth=8`)).text()).length)
    // 完整性锚：页数/首中尾锚/悬空计数（响应 = JSON 字符串壳——双跳解码）
    const decodeArr = (t) => { const one = JSON.parse(t); return typeof one === 'string' ? JSON.parse(one) : one }
    const idxJson = decodeArr(await (await fetch(`${back.url}/api/link_index?path=&depth=8`)).text())
    const pages = idxJson.length
    const withPath = (p) => idxJson.find((x) => x.path === p)
    const hw = withPath('wiki/CJK页1.ad')
    const deep = withPath('deep/d1/d2/d3/d4/Deep页40.ad')
    const dangling = idxJson.flatMap((x) => x.links.filter((l) => !l.exists))
    console.log(`  [integrity] pages=${pages} 首锚=${!!hw} 深锚=${!!deep} 悬空链=${dangling.length}`)
    if (pages !== 150) findings.push(`HTTP 完整性：link_index 页数 ${pages} ≠ 150`)
    if (!hw || !deep) findings.push('HTTP 完整性：CJK/深目录锚缺失')
    if (idx1 === 0 || idxHot === 0) findings.push('HTTP 索引空串形态（D-35② 家族值损坏信号）——需复核')
    // ② 检索
    await t('②search CJK「正文第」', async () => (await (await fetch(`${back.url}/api/search_wiki`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '正文第', limit: 20 }) })).text()).length)
    await t('②search ASCII Root1', async () => (await (await fetch(`${back.url}/api/search_wiki`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'Root1', limit: 20 }) })).text()).length)
    await t('②search 别名「别名靶7」', async () => (await (await fetch(`${back.url}/api/search_wiki`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '别名靶7', limit: 20 }) })).text()).length)
    // ③ 建页 ×3
    for (let i = 1; i <= 3; i++) {
      await t(`③create 新页${i}`, async () => (await (await fetch(`${back.url}/api/create_page`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: `Bench新页${i}` }) })).text()).length)
    }
    // ④ 改名（反链改写 walk——CJK页3 有入链 CJK页2 出链指它 + 尾链）
    await t('④rename CJK页3→CJK页叁', async () => (await (await fetch(`${back.url}/api/rename_page`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ old_path: 'wiki/CJK页3.ad', new_name: 'CJK页叁' }) })).text()).length)
    const reIdx = decodeArr(await (await fetch(`${back.url}/api/link_index?path=&depth=8`)).text())
    const src = reIdx.find((x) => x.path === 'wiki/CJK页2.ad')
    const rewritten = src && src.links.some((l) => l.target === 'CJK页叁' && l.exists && l.target_path === 'wiki/CJK页叁.ad')
    const stale = src && src.links.some((l) => l.target === 'CJK页3')
    console.log(`  [integrity] 改名改写链= ${!!rewritten} 残留旧链= ${!!stale} 页数=${reIdx.length}（含 3 新建+1 改名）`)
    if (!rewritten) findings.push('改名改写：CJK页2 出链未翻转指 CJK页叁')
    if (stale) findings.push('改名改写：残留旧 [[CJK页3]] 链')
    if (reIdx.length !== 153) findings.push(`link_index 页数 ${reIdx.length} ≠ 153（150+3 建页）`)
    // tags 面（150 页聚合——O(T×P) page_tag_set 重读面观测点；≤1.5s 硬门）
    await t('①b tags_index 全量', async () => (await (await fetch(`${back.url}/api/tags_index?path=&depth=8`)).text()).length)
    if (timings['①b tags_index 全量'] > TAGS_INDEX_GATE_MS) {
      findings.push(`tags_index ${timings['①b tags_index 全量']} ms > ${TAGS_INDEX_GATE_MS} ms（PLAN-029 门——发行阻断）`)
    }
  } finally {
    await back.stop()
  }
}

// ---------------- UI 面（merged 臂 boot + 冒烟） ----------------
async function uiPhase() {
  const uiStart = now() // 墙钟自 spawn 起——boot-ready = 进程启动→UI 就绪全窗
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: repoRoot,
    env: { ...process.env, AUTOUI_MCP_PORT: String(PORT + 1), AUTO_JADE_WORKSPACE: WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  app.stdout.on('data', (d) => (out += d))
  app.stderr.on('data', (d) => (out += d))
  try {
    let nextId = 1
    const rpc = async (method, params) => {
      const res = await fetch(`http://127.0.0.1:${PORT + 1}/mcp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
      })
      const body = await res.json()
      if (body.error) throw new Error(JSON.stringify(body.error))
      return body.result
    }
    const call = async (name, args) => (await rpc('tools/call', { name, arguments: args })).content.map((c) => c.text).join('\n')
    const dl = Date.now() + 45000
    for (;;) {
      try { await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'bench-release-150', version: '0' } }); break } catch (e) {
        if (app.exitCode !== null) throw new Error('exited: ' + out.slice(-800))
        if (Date.now() > dl) throw new Error('mcp timeout')
        await sleep(500)
      }
    }
    const state = async () => (await call('autoui_state', {})).trim()
    // boot-ready 墙钟（Init 全链：tree+link+tags 150 页 walk）。判定面 =
    // 快照 status 文本（矩阵 check 1 同款——state dump 通道在 150 页位态
    // 有降级观测：p21 二跑实录 62 字符 vs 专注 dbg 31317 字符间歇，见 findings；
    // 快照通道恒健康 22KB has-ready=true @3s）。
    const snapText = async () => await call('autoui_snapshot', {})
    let readyMs = -1
    let dumpLens = []
    const bootDeadline = Date.now() + 90000
    for (;;) {
      const hasReady = /ready/.test(await snapText().catch(() => ''))
      if (hasReady) { readyMs = now() - uiStart; break }
      if (dumpLens.length < 6) dumpLens.push((await state().catch(() => '<err>')).length)
      if (Date.now() > bootDeadline) break
      await sleep(300)
    }
    timings['⑤UI boot-ready'] = readyMs
    console.log(`  [ui] boot-ready: ${readyMs} ms (state len 前 6 采: ${dumpLens.join(',')})`)
    if (readyMs < 0) findings.push('UI boot 90s 未观测到 ready（快照判定面）')
    // 快开过滤延迟（150 页 ft_nodes 过滤——视图面纯内存）
    const pressByOwn = async (label, timeoutMs = 8000) => {
      const dl2 = Date.now() + timeoutMs
      for (;;) {
        const snap = await call('autoui_snapshot', {})
        const lines = snap.split('\n').filter((l) => new RegExp(`button #[^"]+"${label}"`).test(l))
        if (lines.length) {
          const m = lines[0].match(/#vnode_(\d+)/)
          const r = await call('autoui_action', { element_id: 'vnode_' + m[1], action: 'press' })
          if (!/status: ok/.test(r)) throw new Error(`press ${label} not ok: ${r}`)
          return
        }
        if (Date.now() > dl2) throw new Error(`button "${label}" not found`)
        await sleep(300)
      }
    }
    await pressByOwn('视图')
    await pressByOwn('快速打开')
    const snap1 = await call('autoui_snapshot', {})
    const inpLine = snap1.split('\n').find((l) => l.trim().startsWith('input ') && l.includes('#vnode_'))
    if (inpLine) {
      const inpId = inpLine.match(/#vnode_(\d+)/)[1]
      const s = now()
      await call('autoui_action', { element_id: 'vnode_' + inpId, action: 'type_text', value: 'Deep页3' })
      for (;;) { if (/find_q: "Deep页3"/.test(await state())) break; if (Date.now() > s + 10000) break; await sleep(100) }
      // 行集等待（PLAN-039 修测——150 页 NamesRefresh 提交段有节拍，定值
      // 轮询至 10s；p21 旧 find-panel 面形态已随 038 弹层迁移退役）。
      let rowLines = []
      for (let w = 0; w < 34; w++) {
        const snap2 = await call('autoui_snapshot', {})
        rowLines = snap2.split('\n').filter((l) => /button #[^"]+"Deep页3\d?"/.test(l))
        if (rowLines.length) break
        await sleep(300)
      }
      timings['⑥快开过滤（type→行集）'] = now() - s
      console.log(`  [ui] 快开过滤: ${timings['⑥快开过滤（type→行集）']} ms`)
      console.log(`  [ui] 过滤命中行: ${rowLines.length}`)
      if (!rowLines.length) findings.push('快开过滤 10s 行集未现（Deep页3——150 页 names 面）')
    } else {
      findings.push('快开 input 未定位（150 页面板）')
    }
    await pressByOwn('取消')
    // 深档开档（树展开 deep→d1→d2→d3→d4 面太长——快开拾取承载开档面）
    const sOpen = now()
    await pressByOwn('视图')
    await pressByOwn('快速打开')
    const snap3 = await call('autoui_snapshot', {})
    const inp3 = snap3.split('\n').find((l) => l.trim().startsWith('input ') && l.includes('#vnode_'))
    const inp3Id = inp3.match(/#vnode_(\d+)/)[1]
    await call('autoui_action', { element_id: 'vnode_' + inp3Id, action: 'type_text', value: 'Deep页40' })
    for (let w = 0; w < 200; w++) { if (/find_q: "Deep页40"/.test(await state())) break; await sleep(100) }
    // 行集等待（⑥ 同修——轮询至 10s）。
    let rowLine = ''
    for (let w = 0; w < 34 && !rowLine; w++) {
      const snap4 = await call('autoui_snapshot', {})
      rowLine = snap4.split('\n').find((l) => /button #[^"]+"Deep页40"/.test(l)) ?? ''
      if (!rowLine) await sleep(300)
    }
    if (rowLine) {
      await call('autoui_action', { element_id: 'vnode_' + rowLine.match(/#vnode_(\d+)/)[1], action: 'press' })
      for (;;) { if (/tab_count: 1/.test(await state())) break; if (Date.now() > sOpen + 20000) break; await sleep(200) }
      timings['⑦深档开档（拾取→播种）'] = now() - sOpen
      console.log(`  [ui] 深档开档: ${timings['⑦深档开档（拾取→播种）']} ms`)
    } else {
      findings.push('深档快开行未现（Deep页40）')
    }
    // 保存弧线（ActSave → LinksRefreshOf 153 页重走）
    const sSave = now()
    await pressByOwn('保存')
    for (;;) { if (/save_note: "saved/.test(await state())) break; if (Date.now() > sSave + 30000) break; await sleep(200) }
    timings['⑧保存弧线（ActSave→刷新族）'] = now() - sSave
    console.log(`  [ui] 保存弧线: ${timings['⑧保存弧线（ActSave→刷新族）']} ms`)
    // 孤页清单 150 页位态（orphan_rows_of O(P²)）
    const sOrph = now()
    await pressByOwn('视图')
    await pressByOwn('孤页清单')
    for (let w = 0; w < 150; w++) { if (/find_mode: "orphans"/.test(await state())) break; await sleep(200) }
    await sleep(500)
    const stOrph = await state()
    const om = stOrph.match(/orphan_rows: \[([^\]]*)\]/)
    const orphCount = om ? om[1].split(',').filter((s) => s.trim() !== '').length : -1
    timings['⑨孤页清单（入口→行集）'] = now() - sOrph
    console.log(`  [ui] 孤页清单: ${timings['⑨孤页清单（入口→行集）']} ms rows=${orphCount}`)
    // 警示面零回归（153 页 ≤200——恒空）
    const warnOk = /ws_warn: ""/.test(stOrph)
    console.log(`  [ui] ws_warn 零警示（≤200）: ${warnOk}`)
    if (!warnOk) findings.push('153 页位态 ws_warn 非空（防线误触发嫌疑）')
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- run ----------------
console.log(`[bench-release-150] 语料生成 150 页 → ${path.relative(repoRoot, WS)}`)
const built = buildCorpus()
console.log(`[bench-release-150] built=${built}`)
console.log(`[bench-release-150] HTTP 面（serve-back :${PORT}）计时`)
await httpPhase()
console.log(`[bench-release-150] UI 面（merged 臂 :${PORT + 1}）boot+冒烟`)
await uiPhase()
console.log('\n[bench-release-150] 计时实录汇总（ms）：')
for (const [k, v] of Object.entries(timings)) console.log(`  ${k}: ${v}`)
console.log('\n[bench-release-150] findings 清单（≥0 项如实）：')
if (findings.length === 0) console.log('  （无——150 页位态全链观测面零异常）')
for (const f of findings) console.log(`  - ${f}`)
if (findings.length > 0) process.exitCode = 1
