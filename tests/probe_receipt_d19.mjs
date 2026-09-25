#!/usr/bin/env node
// probe_receipt_d19.mjs — PLAN-015 T-01①：D-19 回执直证（serve-back CJK
// GET query 复核——PLAN-699 Axum/Hyper 传输替换手写解析器后的行为复核）。
//
// 案表：
//   g① encoded CJK exists    GET /api/exists?path=wiki%2FCAP+%E5%AE%9A%E7%90%86.ad → true
//                            （D-19 立案形态：手写解析器不解码 UTF-8 百分号
//                            序列 → exists:0——新传输下应翻真）
//   g② encoded CJK read_wiki GET /api/read_wiki?path=wiki%2FCAP+%E5%AE%9A%E7%90%86.ad → body 含「CAP 定理指出」
//   g③ ASCII exists 回归     GET /api/exists?path=wiki%2FTasks.ad → true（%2F 简单转义原绿面不漂移）
//   g④ 缺失拒                GET /api/exists?path=wiki%2FNo-Such.ad → false
//
// 判定：g①/g② 绿 = D-19 unlock 兑现（矩阵 CJK 导航子步双臂化放行）；
// 负结果 = 维持现状 + 注记（不阻塞 T-02..04——计划 §8 依赖序）。
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

try {
  // g③ 先行（基线健康面——ASCII 简单转义原绿；bool 响应形 = "1"/"0"）
  const ascii = await fetch(`${back.url}/api/exists?path=${encodeURIComponent('wiki/Tasks.ad')}`)
  const asciiText = await ascii.text()
  ck(ascii.ok && asciiText.trim() === '1', 'g③ ASCII exists 回归（%2F 简单转义原绿面）', `status=${ascii.status} body=${asciiText.trim()}`)

  // g④ 缺失拒
  const miss = await fetch(`${back.url}/api/exists?path=${encodeURIComponent('wiki/No-Such.ad')}`)
  const missText = await miss.text()
  ck(miss.ok && missText.trim() === '0', 'g④ 缺失拒（No-Such.ad → 0）', `body=${missText.trim()}`)

  // g① encoded CJK exists（D-19 立案形态同参——wiki/CAP 定理.ad；bool 响应形 "1"）
  const cjkPath = encodeURIComponent('wiki/CAP 定理.ad')
  const ex = await fetch(`${back.url}/api/exists?path=${cjkPath}`)
  const exText = await ex.text()
  ck(ex.ok && exText.trim() === '1', 'g① encoded CJK exists（wiki/CAP 定理.ad → 1——D-19 判定面）', `status=${ex.status} body=${exText.trim()}`)

  // g② encoded CJK read_wiki（body 锚 = 语料正文）
  const rw = await fetch(`${back.url}/api/read_wiki?path=${cjkPath}`)
  const rwRaw = await rw.text()
  let rwBody = rwRaw
  try { rwBody = JSON.parse(rwRaw) } catch {}
  ck(rw.ok && rwBody.includes('CAP 定理指出'), 'g② encoded CJK read_wiki（body 含语料锚）', `status=${rw.status} len=${rwBody.length}`)

  console.log(failures.length === 0
    ? '\n[probe_receipt_d19] ALL GREEN — D-19 unlock 兑现（CJK GET query 新传输解码正常）'
    : `\n[probe_receipt_d19] FAIL — ${failures.join(' / ')}（D-19 维持处置：双臂化子步维持现状 + 注记）`)
} finally {
  await back.stop()
}
process.exitCode = failures.length === 0 ? 0 : 1
