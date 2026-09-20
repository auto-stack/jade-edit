#!/usr/bin/env node
// contract-sync.mjs — PLAN-081 T-04: /api 契约副本部署 + 单向漂移门。
//
// 冻结源（single source, FROZEN）：auto-down `jade-garden/back/auto/api.at`
// （旧 jade-garden 冻结零改动——本脚本只读它）。
// 部署副本：`src/back/api.at` = GENERATED 头 + 源字节（与 jade desktop
// 副本同款形态：头 4 行 + 正文字节相同）。
//
// 用法：
//   node scripts/contract-sync.mjs            # 部署（copy 源 → 副本）
//   node scripts/contract-sync.mjs --check    # 漂移门：副本 == 头+源字节，
//                                             # 且 ROUTE/#[api] 计数一致，
//                                             # 且初始版四路由标记在册
//
// env：JADE_EDIT_CONTRACT_SRC 覆盖源路径默认值（组 worktree 友好）。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.JADE_EDIT_CONTRACT_SRC ?? 'D:/autostack/auto-down/jade-garden/back/auto/api.at'
const DST = path.join(repoRoot, 'src', 'back', 'api.at')

const HEADER = [
  '// GENERATED from jade-garden/back/auto/api.at via scripts/contract-sync.mjs — do not edit.',
  '// jade-edit 前台契约副本：use back.api 解析 + #[api] 改写元数据（split HTTP）。',
  '// 单源在 auto-down（冻结）；漂移门 = 副本 ↔ 源字节等价，改动只落源后重部署。',
  '',
].join('\n')

// 初始版消费的最小路由集（PLAN-081 §5.3：files/read/save/health 起步；
// 其余路由副本携带但不消费）。
const REQUIRED_ROUTE_MARKERS = [
  '// ROUTE: GET /api/health',
  '// ROUTE: GET /api/files',
  '#[api(method = "GET", path = "/api/wiki/{*path}")]',
  '#[api(method = "POST", path = "/api/wiki/{*path}")]',
]

const countOf = (text, needle) => text.split(needle).length - 1

function fail(msg) {
  console.error(`[contract-sync] FAIL: ${msg}`)
  process.exit(1)
}

const srcText = fs.readFileSync(SRC, 'utf8')

if (process.argv.includes('--check')) {
  if (!fs.existsSync(DST)) fail(`deployed copy missing: ${DST}（先跑 node scripts/contract-sync.mjs 部署）`)
  const dstText = fs.readFileSync(DST, 'utf8')
  if (dstText !== HEADER + srcText) {
    fail('deployed copy != header + frozen source bytes（源已漂移或副本被手改）——重跑 node scripts/contract-sync.mjs')
  }
  if (countOf(dstText, '// ROUTE:') !== countOf(srcText, '// ROUTE:')) fail('ROUTE marker count drift')
  if (countOf(dstText, '#[api(') !== countOf(srcText, '#[api(')) fail('#[api] count drift')
  for (const marker of REQUIRED_ROUTE_MARKERS) {
    if (!dstText.includes(marker)) fail(`required route marker missing: ${marker}`)
  }
  console.log(`[contract-sync] OK: copy byte-equal to frozen source (+${HEADER.length}B header); ROUTE=${countOf(dstText, '// ROUTE:')} #[api]=${countOf(dstText, '#[api(')}; 4 required markers present`)
} else {
  fs.mkdirSync(path.dirname(DST), { recursive: true })
  fs.writeFileSync(DST, HEADER + srcText)
  console.log(`[contract-sync] deployed ${SRC} -> ${DST} (${srcText.length}B source + header)`)
}
