#!/usr/bin/env node
// regen-vue.mjs — vue 生成链一键重建（裸 strict 生成 + 残余补件）。
//
//   gen（auto build -r vue --gen-only，strict）→ 标量契约断言 →
//   残余补件 → engine dist 新鲜度卫兵 → pnpm install → pnpm build
//
// 补件链退役（2026-09-21，照 auto-edit d845e54 先例）：上游 auto-lang
// PLAN-671 r1+Phase 2 全周期 delivered（工具链 v0.4.2-1652+，本仓复验
// 同版）后生成器自备——natives.d.ts + natives.ts 声明层/条件抛错桩
// （①+P2）、store 自调别名内联（③）、ref<number>(-1) int 负初值、
// button text variant（⑥）、menubar 族 schema 吸收 = strict 零 S001
// （附b，--lenient 摘除）、多段插值单段安全（附a）；PLAN-646 gen-only
// 流写真值 auto-sources.ts + vite-env.d.ts。D-10 tab 双分支在 671 新
// 发射形态 + vue-tsc 2.2.12 下零报错——v-for 拆分补件与版本钉（②c/②d）
// 一并退役。历史形态见 git 历史（503e9bd 及此前）。
//
// 二批退役（PLAN-002 T-01 执行期，工具链 1652→1784 实测）：tree
// JSON.parse 补件（原残余②）——1784 ts_adapter 对 json.to_value 原生
// 发射 JSON.parse（裸 gen-only 实证），pattern 断言 fail 后按 protocol
// 撤除。
//
// 残余补件（非上游清偿面；pattern 断言，形态变化即 fail 按实重审）：
//   1. vm-natives.ts 运行期垫片——jade vue 轨有运行期 e2e（检查单热路径
//      console_*/file_basename/dialog 取消语义），生成器 natives.ts 为
//      条件抛错桩（先到先得）——垫片先装即覆盖（parity-ledger D-13）
//   2. tabs.value.remove → splice——生成器 R010 直通缺口（上游未清偿，
//      auto-edit 同源在案；类型面 any 无感、vue 轨运行期地雷，e2e
//      断言域外）——上游修复后 pattern 断言 fail 提示撤除
//   3. AutoDownEditor :key 静态串 → store.active_key 绑定——生成器把
//      key: 绑定表达式发射为字面静态串（D-03 形态）：切档只换 :content
//      不重挂载，引擎换料后键入 update:modelValue 永不回传（PLAN-002
//      T-01 扩单探针实证：切档键入 DOM 收字、store 零回传）——补件恢复
//      vm 同款「key 变即重挂载播种」语义；上游发射动态绑定后撤除
//   4. 孤儿 dep-demo 清理——bps gallery-shell import @/components/ui/
//      popover 而 wrapper 未物化 → vue-tsc TS2307（上游 auto-lang
//      bd64d8df6 在案：Plan 676 外部在途阻塞；件为 dep bp demo，jade
//      App/store 零引用）——仅零引用守卫下移除生成件；上游 676 物化
//      popover 后本补件自然 no-op，pattern 提示撤除
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

// ① 生成（围栏：-r vue 显式覆盖——禁止裸 auto build；strict 裸产出，
// PLAN-671 附b menubar 族 schema 吸收后零 S001 阻断——--lenient 已摘）
run(AUTO_EXE, ['build', '-r', 'vue', '--gen-only'], { cwd: repoRoot })

// ② 标量契约断言（PLAN-001 换基后契约全标量，PLAN-081 时代四缺口
// 补丁随旧契约退役；此断言守"生成器读了陈旧源"类回归——D-04）
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
  console.log('[regen-vue] api.ts 标量契约断言通过')
}

// ②b 补件 1：vm-natives.ts 运行期垫片 + main.ts 注入（须在生成器
// './lib/natives' 抛错桩之前 import——natives.ts 先到先得跳过已装名）。
// 类型面由生成器 natives.d.ts 自备（671）；此处只装运行期实现：
// console_log 聚合 → console_lines 回读（vue 侧 ConsolePanel 真数据）、
// file_basename、dialog_* 返回 ""=取消、Process.exit no-op。
const vmNatives = path.join(vueDir, 'src', 'vm-natives.ts')
fs.writeFileSync(
  vmNatives,
  [
    '// vm-natives.ts — vm 宿主内建运行期垫片（PLAN-001 T-04；类型面见生成器 natives.d.ts）',
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
    '// Process/__vmOnly 走 any 局部变量赋值——natives.d.ts 已 declare 全局',
    '// 常量形态（671 对象形态声明层），直赋会撞全局声明的类型上下文',
    '//（TS2349 实证）。',
    'const __g = globalThis as any',
    '__g["Process"] = {',
    '  exit: (code = 0) => { console.warn("[vm] Process.exit(" + code + ") no-op in vue") },',
    '}',
    '__g["__vmOnly"] = (name: string, ...args: unknown[]) => {',
    '  console.warn("[vm] VM-only native " + name + " no-op in vue")',
    '}',
    '// 1784 起 VM-only 原语经 __vmOnly(name, ...args) 路由发射（R010）——',
    '// 垫片接为 no-op（QuitSaveClose 的 Process.exit 落盘后终止语义在 vue',
    '// 收敛为无害 no-op，e2e 九检查 9 依赖）。',
    '(globalThis as any).__vmOnly = (name: string, ...args: unknown[]) => {',
    '  console.warn("[vm] VM-only native " + name + " no-op in vue")',
    '}',
    '',
  ].join('\n')
)
{
  // 后装注入（PLAN-002 T-01 勘误）：上游 natives.ts 的 R-tier 块为无条件
  // 覆写（先到先得守卫未覆盖 R-tier 实装与 Process）——垫片前置会被压掉
  //（2026-09-21 实探：Process.exit 抛错桩越过 no-op 垫片、console_* 被
  // R-tier 接管）。垫片须排在 './lib/natives' 之后加载即赢。
  const mainTs = path.join(vueDir, 'src', 'main.ts')
  let s = fs.readFileSync(mainTs, 'utf8')
  if (!s.includes('vm-natives')) {
    const anchor = "import './lib/natives'"
    if (s.includes(anchor)) {
      s = s.replace(anchor, anchor + "\nimport './vm-natives'")
    } else {
      s = `import './vm-natives'\n` + s
    }
    fs.writeFileSync(mainTs, s)
  }
}
console.log('[regen-vue] 补件：src/vm-natives.ts 运行期垫片（console 聚合/dialog 取消/no-op exit）+ main.ts 后装注入（压过上游 natives.ts）')

// ②b-2 补件 1 续：store 内联 __vmOnly 抛错桩 → no-op warn——1784 起
// Process.exit 等原语在 store 内联发射为 throw 桩（模块局部函数，全局
// 垫片够不着）；QuitSaveClose 的「落盘后终止」在 vue 收敛为落盘 + 无害
// no-op（e2e 九检查 9 依赖，pageerror 消除）。上游语义化后撤除。
{
  const storeTs = path.join(vueDir, 'src', 'stores', 'useEditorStore.ts')
  let s = fs.readFileSync(storeTs, 'utf8')
  const pat = /function __vmOnly\(name: string, \.\.\.args: any\[\]\): never \{\n  throw new Error\([^\n]*\)\n\}/
  if (!pat.test(s)) throw new Error('[regen-vue] 补件 "vmOnly noop" pattern 未命中——上游发射形态变化，按实重审')
  s = s.replace(
    pat,
    // 注意：store 模块内 `console` 被同名 state 字段遮蔽——注记走 console_log 全局
    "function __vmOnly(name: string, ...args: any[]): void {\n  console_log('[vm] VM-only primitive ' + name + ' no-op in vue')\n}",
  )
  fs.writeFileSync(storeTs, s)
  console.log('[regen-vue] 补件：store __vmOnly 抛错桩 → no-op（Process.exit 终止语义收敛）')
}

// ②c 补件 2：tabs.value.remove → splice（R010 直通，上游未清偿）。
// （原补件 2「tree JSON.parse」随 1784 ts_adapter 原生发射撤除——见头注）
{
  const storeTs = path.join(vueDir, 'src', 'stores', 'useEditorStore.ts')
  let s = fs.readFileSync(storeTs, 'utf8')
  const removes = s.match(/tabs\.value\.remove\([^)]*\)/g)?.length ?? 0
  if (removes === 0) throw new Error('[regen-vue] 补件 "tabs.remove" pattern 未命中——上游已修？撤除本补件')
  s = s.replace(/tabs\.value\.remove\(([^)]*)\)/g, 'tabs.value.splice($1, 1)')
  fs.writeFileSync(storeTs, s)
  console.log(`[regen-vue] 补件：tabs.value.remove→splice ×${removes}`)
}

// ②d 补件 3：AutoDownEditor :key 静态串 → store.active_key 绑定
// （D-03 切档键入断裂修复面；pattern 断言守生成器发射形态，形态漂移
// 即 fail 按实重审；上游 key: 绑定直发后撤除）
{
  const appVue = path.join(vueDir, 'src', 'App.vue')
  let s = fs.readFileSync(appVue, 'utf8')
  const el = s.match(/<AutoDownEditor\b[^>]*\/>/)?.[0]
  if (!el) throw new Error('[regen-vue] 补件 "editor key" pattern 未命中：AutoDownEditor 元素缺席')
  if (!el.includes(`:key="'AutoDownEditor-`)) {
    throw new Error('[regen-vue] 补件 "editor key" pattern 未命中：静态 :key 形态变化——上游已发动态绑定？按实重审')
  }
  s = s.replace(el, el.replace(/:key="'AutoDownEditor-\d+'"/, ':key="store.active_key"'))
  fs.writeFileSync(appVue, s)
  console.log('[regen-vue] 补件：AutoDownEditor :key → store.active_key（切档重挂载播种，D-03）')
}

// ②f 补件 4：孤儿 dep-demo 清理（上游 Plan 676 在途缺口，见头注）
{
  const compDir = path.join(vueDir, 'src', 'components')
  const appVue = fs.readFileSync(path.join(vueDir, 'src', 'App.vue'), 'utf8')
  const storeTs = fs.readFileSync(path.join(vueDir, 'src', 'stores', 'useEditorStore.ts'), 'utf8')
  for (const f of fs.readdirSync(compDir)) {
    if (!f.endsWith('.vue')) continue
    const p = path.join(compDir, f)
    const s = fs.readFileSync(p, 'utf8')
    if (!s.includes('@/components/ui/popover')) continue
    if (fs.existsSync(path.join(compDir, 'ui', 'popover'))) continue // 上游已物化——no-op
    const name = f.replace(/\.vue$/, '')
    if (appVue.includes(name) || storeTs.includes(name)) {
      throw new Error(`[regen-vue] 补件 "orphan popover demo"：${f} 已被 App/store 引用而 popover wrapper 缺物化——不可移除，按实重审`)
    }
    fs.rmSync(p)
    console.log(`[regen-vue] 补件：移除孤儿 dep-demo ${f}（popover wrapper 未物化，上游 676 在途；零引用守卫过）`)
  }
}

// ③ engine dist 新鲜度卫兵（并行会话 src 领先 dist 的白屏债务，jade
// e2e-prepare 同款 fail-fast）
if (fs.existsSync(ENGINE_DIST_GUARD)) {
  run(process.execPath, [ENGINE_DIST_GUARD])
} else {
  console.warn(`[regen-vue] WARN: engine dist guard 不存在（${ENGINE_DIST_GUARD}）——跳过`)
}

// ④ install + build（vue-tsc 0 错 + vite build 绿）
run('pnpm', ['install'], { cwd: vueDir, shell: true })
run('pnpm', ['build'], { cwd: vueDir, shell: true })
console.log('[regen-vue] OK: vue 面裸 strict 重建 + build 绿（补件链已随 671/646 退役，残余三件）')
