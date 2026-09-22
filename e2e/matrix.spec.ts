// matrix.spec.ts — PLAN-081 T-06：vue 轨检查单（同一检查单——与
// tests/vm_matrix.mjs 逐条对应；PLAN-002 T-01 扩三组同步；断言域 =
// 结构/文本/磁盘字节，非像素）。
//
//   1 boot    应用可达，Init → list_files 成功（状态行 ready）
//   2 tree    filetree 列出 fixture wiki 文件
//   3 open    打开 .ad 进 AutoDownEditor（内容渲染可见）
//   4 edit    编辑回写（追加输入 → ● unsaved）
//   5 save    保存落盘（press 保存 → 脏标清 + 磁盘字节 + frontmatter 保留）
//   6 reload  重载可见（磁盘外改 → press 重载 → 编辑器见新内容）
//   7 tab     tab 面：开两档 → 切换（active 断言 + 内容互换）→ dirty 档
//             关闭确认两路（取消=档留；直接关闭=弃改落盘零写入）
//   8 editops 编辑操作族：段中回车/退格（真键盘 + caret 定位达成同语义）
//   10 link   链接索引+反链面板（PLAN-003；vm 矩阵 check 10/10b 同单——
//             ASCII 路径导航；CJK 目标子步 vm merged 专属（HTTP GET query
//             UTF-8 解码缺口 D-19，vue 轨同败故跳过）
//   9 quit    退出存盘：dirty → 退出入口 → CloseRequest 确认弹层 →
//             QuitSaveClose → 磁盘三验（原文/标记/frontmatter）。
//             进程退出断言仅 vm 附注——vue 轨 Process.exit = 垫片 no-op
//             （D-13），弹层闭态不复位属该形态的已知后果，不断言。
//
// D-17 冲刷机制（vue 轨特有，7/8/9 共用）：切档重挂载后的编辑器实例，
// 键入只进引擎模型、update:modelValue 门控至 blur——中性 blur（点
// EXPLORER 头）= 确定性冲刷；断言语义与 vm 同单，冲刷为轨内机制差异。
//
// 单 test：检查单为同一文档上的连续状态（vm 矩阵单进程流的 playwright
// 对应——playwright 每 test 新页面，串行 describe 不保状态延续）。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import {
  EDIT_MARKER,
  QUIT_MARKER,
  RELOAD_MARKER,
  TAB_MARKER,
  TARGET_FILE,
  TARGET_LABEL,
  appendToEditor,
  fixtureAdNames,
  visibleEditor,
} from './helpers'

test('vue 六检查（vm 矩阵同单）', async ({ page }) => {
  page.on('response', (r) => {
    if (r.url().includes('/api/')) console.log(`    [api] ${r.status()} ${r.request().method()} …${r.url().slice(-45)}`)
  })
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  // D-17 中性 blur 冲刷件（vue 轨机制；7/8/9 及 4→5 保存赛跑规避共用）
  const neutralBlur = () => page.getByText('EXPLORER', { exact: true }).click()

  // 1 boot
  await page.goto('/')
  await expect(page.getByText('JadeEdit', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  console.log('[1 boot] PASS')

  // 2 tree（换基后 fs.tree 层级形态：先展开 wiki 目录再断言行可见）
  await page.getByText('wiki', { exact: true }).first().click()
  for (const name of fixtureAdNames()) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  }
  console.log(`[2 tree] PASS — ${fixtureAdNames().length} 个 .ad 全数列出`)

  // 3 open
  await page.getByText(TARGET_LABEL, { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  console.log('[3 open] PASS — 编辑器渲染内容可见')

  // 4 edit（换基后脏标 = StatusBar「未保存」+ tab 星标；断言 StatusBar 面）
  await appendToEditor(page, ` ${EDIT_MARKER}`)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  console.log('[4 edit] PASS — 追加输入 → StatusBar 未保存（blur 冲刷后 store 落定，规避保存点击 blur-flush 与 Save 竞态）')

  // 5 save（原文+标记+frontmatter 三验，磁盘真值；vue toolbar 按钮 =
  // 图标 + title 属性——:has-text 落空，按 title 锚）
  await page.locator('button[title="保存"]').click()
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  const disk = fs.readFileSync(TARGET_FILE, 'utf8')
  expect(disk, '磁盘含标记').toContain(EDIT_MARKER)
  expect(disk, '原文未被整文替换丢失').toContain('这是一段示例文本')
  expect(disk, 'frontmatter 保留').toContain('title: Hello World')
  console.log('[5 save] PASS — 落盘三验（原文/标记/frontmatter）')

  // 6 reload
  fs.appendFileSync(TARGET_FILE, `\n${RELOAD_MARKER}\n`)
  await page.locator('button[title="重载"]').click()
  await expect(visibleEditor(page)).toContainText(RELOAD_MARKER, { timeout: 10_000 })
  console.log('[6 reload] PASS — 磁盘外改 → 重载可见')

  // 7 tab 面（开两档 → 切换互换 → dirty 关闭确认两路；vm 矩阵 check 7 同单）。
  // 执行序适配（D-17）：vue 轨先做 check 8（编辑操作族须在首挂载实例上——
  // 其逐键发射存活），再进 tab 面；检查单与逐项断言不变。
  // tab 标题 = path 剥 .ad（"wiki/Tasks"），与树行文本（"Tasks.ad"）可区分。
  // D-17（切档重挂载实例键入不逐键发射、blur 冲刷）：切档后键入的 store
  // 可见断言前置一次中性 blur（点 EXPLORER 头，无 handler）——vue 轨冲刷
  // 机制，与 vm type_text 即发同语义收敛。
  const tabTitle = (name: string) => page.getByRole('button', { name, exact: true })
  await page.getByText('Tasks.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  console.log('[7 tab] 开两档 — Tasks.ad 激活，编辑器内容互换到位')
  await tabTitle('wiki/Hello World').click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await tabTitle('wiki/Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  console.log('[7 tab] 切换互换 — 双向 active 断言过（D-03 切换面同步在测）')
  // dirty Tasks（真键盘追加）→ blur 冲刷 → 切走再切回：脏标经 TabActivate 投影还原
  await appendToEditor(page, ` ${TAB_MARKER}`)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await tabTitle('wiki/Hello World').click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await tabTitle('wiki/Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  console.log('[7 tab] 脏标跨后台还原 — TabActivate 投影断言过')
  // 取消路：x → 确认弹层 → 取消 → 档留 + 脏标保（x 钮 = 活动档行的 lucide-xicon 图标钮——本版 lucide 图标名 kebab 化带 -icon 尾）
  const activeTabX = page.locator('button:has(svg.lucide-xicon)')
  await activeTabX.click()
  await expect(page.getByText('关闭前要保存吗?')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByText('关闭前要保存吗?')).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  console.log('[7 tab] 确认弹层取消路 — 档留 + 脏标保')
  // 直接关闭路：弃改关闭（磁盘零写入）→ 档数回落 + 激活回落 Hello World
  await activeTabX.click()
  await expect(page.getByText('关闭前要保存吗?')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '直接关闭', exact: true }).click()
  await expect(page.getByText('关闭前要保存吗?')).toBeHidden({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/Tasks', exact: true })).toHaveCount(0, { timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  const tabDisk = fs.readFileSync(TARGET_FILE.replace('Hello World.ad', 'Tasks.ad'), 'utf8')
  expect(tabDisk, '弃改关闭 = 磁盘零写入').not.toContain(TAB_MARKER)
  console.log('[7 tab] PASS — 双档切换互换 + dirty 关闭确认两路（取消档留/直接关闭弃改，磁盘零写入）')

  // 8 编辑操作族（vm 矩阵 check 8 同单）：段中编辑弧线——插入 → 脏标置真
  // → 退格复原 → 脏标重算 false，store 全程可证（vm 侧整文构造回车/退格
  // 同弧线）。D-17 引擎面（实探登记，vue 轨通道约束）：①切档重挂载/
  // replaceDoc 后逐键发射死、blur text-diff 调和存活（可打印编辑以 blur
  // 冲刷达成与 vm 即发同语义）；②调和仅认真实输入事件——合成选区注入
  // （evaluate 放 caret）被引擎无视，故定位用 click+Ctrl+End（文档尾），
  // vm 的段中（整文构造）在 vue 收敛为文档尾（实证可用通道）。
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type('编', { delay: 25 })
  await expect
    .poll(async () => /编\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  console.log('[8 editops] 文档尾插入 — store 收字 + 脏标置真（blur 冲刷）')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.press('Backspace')
  await expect
    .poll(async () => !/编\s*$/.test(await content.innerText()), { timeout: 15_000 })
    .toBe(true)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  console.log('[8 editops] PASS — 插入/退格复原 + 脏标重算（C-5 同语义弧线）')

  // 10 link（vm 矩阵 check 10/10b 同单）：反链面板 + 反链/出链行 + 点击
  // 开档 + 空态。期望值 = T-02 语料首锁（Hello World 反链三源 index/CAP
  // 定理/Tasks；首页悬空；index 无反链）。导航全走 ASCII 路径；CJK 目标
  // 子步（出链点 CAP 定理）仅 vm merged 臂——HTTP GET query UTF-8 解码
  // 缺口（D-19 上游先在缺口），vue 轨同败故跳过（D-17 先例：轨内机制
  // 差异注记）。
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  await expect(page.getByText('LINKS', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/index.ad', exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/CAP 定理.ad', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'wiki/Tasks.ad', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'CAP 定理', exact: true })).toBeVisible()
  await expect(page.getByText('首页（悬空）', { exact: true })).toBeVisible()
  console.log('[10 link] PASS — 面板开 + 反链三源行 + 出链段（CAP 定理钮/首页悬空文本）')
  // 点击反链行 → index.ad（ASCII）
  await page.getByRole('button', { name: 'wiki/index.ad', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 15_000 })
  await expect(page.getByText('（无反链）', { exact: true })).toBeVisible({ timeout: 10_000 })
  // 出链行点击 → Hello World.ad（ASCII；两轨同单上限）
  await page.getByRole('button', { name: 'Hello World', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  console.log('[10 link] PASS — 反链行开 index.ad（空态文本）+ 出链行开 Hello World.ad')
  // 空态（无激活档）：文件→新建（untitled，path 空 → 行集空）
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('新建', { exact: true }).click()
  await expect(page.getByText('（无反链）', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('（无出链）', { exact: true })).toBeVisible()
  // 关 untitled（未脏直接关）→ 树重开 Hello World → 反链行恢复
  await activeTabX.click()
  await page.getByText('Hello World.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'wiki/index.ad', exact: true })).toBeVisible({ timeout: 10_000 })
  console.log('[10 link] PASS — untitled 空态双文本 + 重开行恢复')

  // 9 退出存盘（vm 矩阵 check 9 同单；vue 形态差异两处——见文件头注记）：
  // ① 退出入口 = 文件菜单 → 退出项（1784 起 menubar 族为真组件 popover
  //   形态——此前在册的「裸 div 零尺寸」形态随再生成消失）；
  // ② Process.exit = 垫片 no-op——只断言落盘，不断言进程退出/弹层复位。
  await appendToEditor(page, ` ${QUIT_MARKER}`)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('退出', { exact: true }).click()
  await expect(page.getByText('退出前要保存吗?')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '保存并退出', exact: true }).click()
  await expect
    .poll(() => fs.readFileSync(TARGET_FILE, 'utf8').includes(QUIT_MARKER), { timeout: 15_000 })
    .toBe(true)
  const quitDisk = fs.readFileSync(TARGET_FILE, 'utf8')
  expect(quitDisk, '原文未被整文替换丢失').toContain('这是一段示例文本')
  expect(quitDisk, 'frontmatter 保留').toContain('title: Hello World')
  console.log('[9 quit] PASS — QuitSaveClose 磁盘三验（原文/标记/frontmatter；进程退出仅 vm 附注）')
})
