#!/usr/bin/env node
// probe_receipt_d19.mjs — PLAN-015 T-01① 立案（D-19 GET query 回执直证）；
// PLAN-028 T-02 翻新形：三契约 GET→POST 适配后回执复核（在册负结果转正
// 记录 + GET 端点下线负证）。
//
// 案表（PLAN-028 翻新形——g①..g④ POST body 直击，g⑤ 旧 GET 端点下线）：
//   g③ ASCII exists POST    POST /api/exists body {path:"wiki/Tasks.ad"} → 1
//                          （基线健康面——body 传参 ASCII 无差异，write 族
//                          先例同形；bool 响应形 = "1"/"0"）
//   g④ 缺失拒 POST          POST /api/exists body {path:"wiki/No-Such.ad"} → 0
//   g① CJK exists POST      POST /api/exists body {path:"wiki/CAP 定理.ad"} → 1
//                          （015 立案形 GET query 同参在册负结果 exists:0
//                          → **翻绿直证**——D-19 repo 侧收口判定面）
//   g② CJK read_wiki POST   POST /api/read_wiki body 同参 → body 含「CAP 定理指出」
//                          （015/026 在册负结果 read_wiki:"" → 翻绿直证）
//   g⑤ GET 下线负证         GET /api/exists?path=.. → 404/405（三契约 GET
//                          端点随 PLAN-028 下线——015 GET 形四案结构性消缺）
//
// 判定：g①/g② 绿 = D-19 repo 侧收口兑现（vm_matrix CJK 导航子步双臂化
// 放行——本批 T-03；unlock 条件「翻 1 即 CJK 双臂化解锁」repo 侧达成）。
//
// 用法（仓根）：node tests/probe_receipt_d19.mjs

import { serveBackend } from '../scripts/serve-back.mjs'
import { pickPort } from './pick_port.mjs'

const back = await serveBackend({ port: await pickPort() })
const failures = []
const ck = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${label}${detail ? `（${detail}）` : ''}`)
  if (!ok) failures.push(label)
}
const postJson = async (api, payload) => {
  const res = await fetch(`${back.url}${api}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res
}

try {
  // g③ 先行（基线健康面——ASCII POST body 传参原绿；bool 响应形 = "1"/"0"）
  const ascii = await postJson('/api/exists', { path: 'wiki/Tasks.ad' })
  const asciiText = await ascii.text()
  ck(ascii.ok && asciiText.trim() === '1', 'g③ ASCII exists POST 回归（body 传参基线面）', `status=${ascii.status} body=${asciiText.trim()}`)

  // g④ 缺失拒
  const miss = await postJson('/api/exists', { path: 'wiki/No-Such.ad' })
  const missText = await miss.text()
  ck(miss.ok && missText.trim() === '0', 'g④ 缺失拒 POST（No-Such.ad → 0）', `body=${missText.trim()}`)

  // g① CJK exists POST（015 立案形同参——wiki/CAP 定理.ad；015/026 在册
  // 负结果 exists:0 → 翻绿直证）
  const ex = await postJson('/api/exists', { path: 'wiki/CAP 定理.ad' })
  const exText = await ex.text()
  ck(ex.ok && exText.trim() === '1', 'g① CJK exists POST（wiki/CAP 定理.ad → 1——D-19 翻绿直证）', `status=${ex.status} body=${exText.trim()}`)

  // g② CJK read_wiki POST（body 锚 = 语料正文）
  const rw = await postJson('/api/read_wiki', { path: 'wiki/CAP 定理.ad' })
  const rwRaw = await rw.text()
  let rwBody = rwRaw
  try { rwBody = JSON.parse(rwRaw) } catch {}
  ck(rw.ok && rwBody.includes('CAP 定理指出'), 'g② CJK read_wiki POST（body 含语料锚——翻绿直证）', `status=${rw.status} len=${rwBody.length}`)

  // g⑤ GET 下线负证（旧 GET 端点 → 404/405——PLAN-028 下线直证）
  const gone = await fetch(`${back.url}/api/exists?path=${encodeURIComponent('wiki/Tasks.ad')}`)
  const goneText = await gone.text()
  ck(gone.status === 404 || gone.status === 405, 'g⑤ GET 端点下线负证（GET /api/exists → 404/405）', `status=${gone.status} body=${goneText.trim().slice(0, 40)}`)

  console.log(failures.length === 0
    ? '\n[probe_receipt_d19] ALL GREEN — D-19 repo 侧收口（三契约 POST CJK 翻绿直证 + ASCII 回归维持 + GET 端点下线）'
    : `\n[probe_receipt_d19] FAIL — ${failures.join(' / ')}`)
} finally {
  await back.stop()
}
process.exitCode = failures.length === 0 ? 0 : 1
