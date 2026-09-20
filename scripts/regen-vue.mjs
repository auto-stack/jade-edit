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

// ① 生成（围栏：-r vue 显式覆盖——禁止裸 auto build；--lenient = 基座
// PLAN-003 T-04 同款：menubar-item 等声明式组件的 title/icon/shortcut
// props 超 vue schema 面[text/disabled/onclick]，lenient 降为 S001 INFO，
// 生成缺口由下方补件兜）
run(AUTO_EXE, ['build', '-r', 'vue', '--gen-only', '--lenient'], { cwd: repoRoot })

// ② 生成 api client 补丁——PLAN-001 换基后契约全标量（str/int/bool），
// PLAN-081 时代的四个上游缺口补丁（通配 URL/List<T>/JsonAny/map 参数）
// 随旧契约退役：新 api.ts 应零补丁直绿。若下列断言失败 = 生成器输出
// 形态变化，按实况重审。
{
  const src = fs.readFileSync(apiTs, 'utf8')
  const leftovers = [
    '/api/wiki/{*path}',
    'List<',
    'JsonAny',
    'frontmatter: map,',
  ].filter((pat) => src.includes(pat))
  if (leftovers.length > 0) {
    throw new Error(`[regen-vue] 旧契约残留出现在生成的 api.ts：${leftovers.join(' / ')}——生成器读了陈旧源？`)
  }
  console.log('[regen-vue] api.ts 标量契约断言通过（旧四补丁已随契约退役）')
}

// ②b 生成器缺口补件（auto-edit PLAN-003 T-04 七类补件的 jade 形态子集——
// 每处 pattern 断言，上游修复后 fail 提示撤除）：
//   1. natives.d.ts——vm 宿主内建声明层（vue 轨类型门；运行期缺口登记）
//   2. useEditorStore 自调别名——composable 内 `store.X()` 直呼闭包 fn
//   3. ref<number>(null) → -1（null 非 number）
//   4. button variant "text" → "ghost"（vue schema 面无 text 档）
//   5. tree JSON 串 → JSON.parse（json.to_value 被 ts_adapter 吸收但
//      本契约 tree 返回 str——前端补解析）
const nativesDts = path.join(vueDir, 'src', 'natives.d.ts')
fs.writeFileSync(
  nativesDts,
  [
    '// natives.d.ts — vm 宿主内建声明层补件（gen-only 构建流；类型门用，',
    '// 运行期实现在 vm-natives.ts 垫片）',
    'declare function console_log(...args: any[]): void',
    'declare function console_lines(): string',
    'declare function console_clear(): void',
    'declare function dialog_open(filter: string): string',
    'declare function dialog_save(default_name: string): string',
    'declare function file_basename(p: string): string',
    'declare const Process: { exit(code: number): void }',
    '',
  ].join('\n')
)
console.log('[regen-vue] 补件：src/natives.d.ts（7 内建声明）')

// natives 运行期垫片（vue 无 vm 宿主——natives.d.ts 只过类型门；六检查
// 走 save/edit 热路径必经 console_* 家族。console_log 聚合 → console_lines
// 回读：vue 侧 ConsolePanel 真数据而非空桩）。
const vmNatives = path.join(vueDir, 'src', 'vm-natives.ts')
fs.writeFileSync(
  vmNatives,
  [
    '// vm-natives.ts — vm 宿主内建运行期垫片（PLAN-001 T-04；类型面见 natives.d.ts）',
    'const __consoleBuf: string[] = []',
    'globalThis.console_log = (...args: any[]) => {',
    '  __consoleBuf.push(args.map((a) => String(a)).join(" "))',
    '  if (__consoleBuf.length > 200) __consoleBuf.shift()',
    '  console.log("[vm]", ...args)',
    '}',
    'globalThis.console_lines = () => __consoleBuf.join("\\n");',
    'globalThis.console_clear = () => { __consoleBuf.length = 0 };',
    'globalThis.file_basename = (p: string) => String(p).replace(/\\\\/g, "/").split("/").filter(Boolean).pop() ?? "";',
    '// 文件对话框在浏览器宿主无阻塞式对应（vue 运行期限制，登记 README）：返回 "" = 取消。',
    'globalThis.dialog_open = () => "";',
    'globalThis.dialog_save = () => "";',
    '(globalThis as any).Process = { exit: (code = 0) => { console.warn("[vm] Process.exit(" + code + ") no-op in vue") } }',
    '',
  ].join('\n')
)
{
  const mainTs = path.join(vueDir, 'src', 'main.ts')
  let s = fs.readFileSync(mainTs, 'utf8')
  if (!s.includes('vm-natives')) {
    s = `import './vm-natives'\n` + s
    fs.writeFileSync(mainTs, s)
  }
}
console.log('[regen-vue] 补件：src/vm-natives.ts 运行期垫片（console 聚合/dialog 取消/no-op exit）+ main.ts 注入')

{
  const storeTs = path.join(vueDir, 'src', 'stores', 'useEditorStore.ts')
  let s = fs.readFileSync(storeTs, 'utf8')
  const selfCalls = s.split('store.').length - 1
  if (selfCalls === 0) throw new Error('[regen-vue] 补件 "store 自调" pattern 未命中')
  s = s.split('store.').join('')
  const nullRefs = s.split('ref<number>(null)').length - 1
  if (nullRefs === 0) throw new Error('[regen-vue] 补件 "ref<number>(null)" pattern 未命中')
  s = s.split('ref<number>(null)').join('ref<number>(-1)')
  // tabs 强类型（v-for 源 any → 作用域推坏——T-03 实勘）
  s = s.split('const tabs = ref<any>([])').join('const tabs = ref<any[]>([])')
  // .remove() 非数组方法（R010 直通）→ splice
  const removes = s.match(/tabs\.value\.remove\([^)]*\)/g)?.length ?? 0
  if (removes === 0) throw new Error('[regen-vue] 补件 "tabs.remove" pattern 未命中')
  s = s.replace(/tabs\.value\.remove\(([^)]*)\)/g, 'tabs.value.splice($1, 1)')
  fs.writeFileSync(storeTs, s)
  console.log(`[regen-vue] 补件：useEditorStore 自调别名 ×${selfCalls} + ref<number>(null)→-1 ×${nullRefs} + tabs 强类型 + remove→splice ×${removes}`)
}

// ②c tab 条双分支 v-for 拆分——vue-tsc 对 v-for 内互补兄弟 <template v-if>
// 对的第二分支丢作用域（T-03 实勘，i/t/r 三处同症状；源级已消 explorer
// 对[单按钮 + handler 分流]，tab 对 vm 轨需要双分支保留 → 生成后拆成
// 两个独立 v-for 容器，结构 = 已证健康的第一分支同构）。
{
  const appVue = path.join(vueDir, 'src', 'App.vue')
  let s = fs.readFileSync(appVue, 'utf8')
  const a = '<div v-for="(t, i) in store.tabs" :key="i">'
  const b = '<div v-for="(t, i) in store.tabs" :key="\'a-\' + i">'
  if (s.split(a).length !== 2) throw new Error('[regen-vue] 补件 "tab v-for 拆分" 锚 A 未唯一命中')
  s = s.split(a).join(b)
  const c = '              </template>\n              <template v-if="i != store.tab">'
  const d = '              </template>\n            </div>\n            <div v-for="(t, i) in store.tabs" :key="\'b-\' + i">\n              <template v-if="i != store.tab">'
  if (s.split(c).length !== 2) throw new Error('[regen-vue] 补件 "tab v-for 拆分" 锚 C 未唯一命中')
  s = s.split(c).join(d)
  fs.writeFileSync(appVue, s)
  console.log('[regen-vue] 补件：tab 条双分支拆独立 v-for（vue-tsc 兄弟模板作用域 workaround）')
}

// ②d 工具链版本钉（fresh lockfile 解析组合回归：vue-tsc 2.2.12 对 v-for
// 兄弟模板作用域更广丢失 + 组合噪音——T-03 实测定格 3.5.35 + 2.0.29）。
{
  const pkgPath = path.join(vueDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.dependencies.vue = '3.5.35'
  pkg.devDependencies['vue-tsc'] = '2.0.29'
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('[regen-vue] 补件：package.json 版本钉 vue 3.5.35 + vue-tsc 2.0.29')
}

{
  // App.vue + components/*.vue：variant="text" → "ghost"
  const vueFiles = [path.join(vueDir, 'src', 'App.vue')]
  const compDir = path.join(vueDir, 'src', 'components')
  if (fs.existsSync(compDir)) for (const f of fs.readdirSync(compDir)) if (f.endsWith('.vue')) vueFiles.push(path.join(compDir, f))
  let total = 0
  for (const f of vueFiles) {
    let s = fs.readFileSync(f, 'utf8')
    const n = s.split('variant="text"').length - 1
    if (n > 0) {
      s = s.split('variant="text"').join('variant="ghost"')
      fs.writeFileSync(f, s)
      total += n
    }
  }
  if (total === 0) throw new Error('[regen-vue] 补件 "variant text" pattern 未命中')
  console.log(`[regen-vue] 补件：variant="text"→"ghost" ×${total}`)
}

{
  const appVue = path.join(vueDir, 'src', 'App.vue')
  let s = fs.readFileSync(appVue, 'utf8')
  const from = 'nodes = await tree(root, 4);'
  if (!s.includes(from)) throw new Error('[regen-vue] 补件 "tree JSON parse" pattern 未命中')
  s = s.split(from).join('nodes = JSON.parse(await tree(root, 4));')
  fs.writeFileSync(appVue, s)
  console.log('[regen-vue] 补件：App.vue tree JSON.parse（json.to_value 吸收 + str 契约补解析）')
}

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
