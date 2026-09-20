#!/usr/bin/env node
// regen-vue.mjs — PLAN-081 T-06：vue 生成链一键重建。
//
//   gen（auto build -r vue --gen-only）→ 生成 api client 补丁 →
//   engine dist 新鲜度卫兵 → pnpm install → pnpm build（vue-tsc + vite）
//
// 生成 api client 三个上游缺口补丁（jade-edit 是生成 client 的首个真实
// 消费者；上游修复后补丁 pattern 断言会 fail 提示撤除）：
//   a. 通配路由模板不替换（`/api/wiki/{*path}` 字面进 fetch URL）
//   b. `List<T>` 类型直译（非 TS 类型）
//   c. `map` 参数类型直译（非 TS 类型）
//
// vue 面 = 纯生成物（gen/ 不入库）：jade-edit 无手写 vue 文件，不走
// demo/jade 的 deploy-into-src 步（零 committed 漂移面）。

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const ENGINE_DIST_GUARD =
  process.env.JADE_EDIT_ENGINE_ROOT
    ? path.join(process.env.JADE_EDIT_ENGINE_ROOT, 'scripts', 'assert-dist-fresh.mjs')
    : 'D:/autostack/auto-down/autodown/packages/engine/scripts/assert-dist-fresh.mjs'
const vueDir = path.join(repoRoot, 'gen', 'front', 'vue')
const apiTs = path.join(vueDir, 'src', 'lib', 'api.ts')

const run = (cmd, args, opts = {}) => {
  // shell:true 仅为 pnpm（.cmd shim）；带空格路径的 exe/node 必须 argv 直传
  const useShell = opts.shell ?? false
  console.log(`[regen-vue] ${cmd} ${args.join(' ')}`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: useShell, ...opts })
  if (r.status !== 0) {
    console.error(`[regen-vue] FAIL: ${cmd} ${args.join(' ')} (exit ${r.status})`)
    process.exit(1)
  }
}

// ① 生成（围栏：-r vue 显式覆盖——禁止裸 auto build）
run(AUTO_EXE, ['build', '-r', 'vue', '--gen-only'], { cwd: repoRoot })

// ② 生成 api client 补丁
let src = fs.readFileSync(apiTs, 'utf8')
const patch = (label, from, to) => {
  if (!src.includes(from)) throw new Error(`[regen-vue] 补丁 "${label}" pattern 未命中——生成器输出形态变了？`)
  src = src.split(from).join(to)
}
patch(
  'read_wiki 通配 URL',
  'fetch(`/api/wiki/{*path}?path=${encodeURIComponent(path)}`, {',
  'fetch(`/api/wiki/${encodeURIComponent(path)}`, {'
)
patch('write_wiki 通配 URL', 'fetch(`/api/wiki/{*path}`, {', 'fetch(`/api/wiki/${encodeURIComponent(path)}`, {')
const listCount = src.split('List<').length - 1
if (listCount === 0) throw new Error('[regen-vue] 补丁 "List<T>" pattern 未命中')
src = src.split('List<').join('Array<')
patch('write_wiki map 参数', 'frontmatter: map,', 'frontmatter: Record<string, unknown>,')
const jsonAnyCount = src.split('JsonAny').length - 1
if (jsonAnyCount === 0) throw new Error('[regen-vue] 补丁 "JsonAny" pattern 未命中')
src = src.split('JsonAny').join('unknown')
src = src.split('frontmatter: Record<string, unknown>,').join('frontmatter: any,')
fs.writeFileSync(apiTs, src)
console.log(`[regen-vue] api.ts 补丁：2 通配 URL + ${listCount} List<T> + ${jsonAnyCount} JsonAny + 1 map 参数`)

// ⑤ gen-only 流缺的两个支撑件（`auto run` 才写的 dev-only 面）：
//   - src/auto-sources.ts（PLAN-646 Select Anything 源映射，dev-only、
//     构建期 tree-shake；stub 空映射即可过类型门，auto run vue 流后续会
//     content-hash 重写为真值）
//   - src/env.d.ts（vite/client 类型——main.ts 的 import.meta.env）
const autoSources = path.join(vueDir, 'src', 'auto-sources.ts')
if (!fs.existsSync(autoSources)) {
  fs.writeFileSync(
    autoSources,
    '// auto-sources.ts — stub（gen-only 构建流；`auto run` vue 流会重写真值）\nexport const AUTO_SOURCES: Record<string, string> = {}\n'
  )
  console.log('[regen-vue] 补件：src/auto-sources.ts（stub）')
}
fs.writeFileSync(path.join(vueDir, 'src', 'env.d.ts'), '/// <reference types="vite/client" />\n')
console.log('[regen-vue] 补件：src/env.d.ts（vite/client）')

// ③ engine dist 新鲜度卫兵（并行会话 src 领先 dist 的白屏债务，jade
// e2e-prepare 同款 fail-fast）
if (fs.existsSync(ENGINE_DIST_GUARD)) {
  run(process.execPath, [ENGINE_DIST_GUARD])
} else {
  console.warn(`[regen-vue] WARN: engine dist guard 不存在（${ENGINE_DIST_GUARD}）——跳过`)
}

// ④ install + build（AC-04：vue-tsc 0 错 + vite build 绿）
run('pnpm', ['install'], { cwd: vueDir, shell: true })
run('pnpm', ['build'], { cwd: vueDir, shell: true })
console.log('[regen-vue] OK: vue 面重建 + build 绿')
