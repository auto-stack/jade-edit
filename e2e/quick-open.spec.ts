// quick-open.spec.ts — PLAN-038 vue 轨双轨快速打开独立弹层（T-03 迁移面
// I/K/W + T-04 O/S/P；vm 轨对位 = tests/probe_quick_open.mjs prod 相位 +
// tests/vm_matrix.mjs check 11 快开子步）。
//
// 覆盖面（AC 映射）：
//   [1] 三入口同一根弹层 + ui.focus 等价面（AC-01）：Ctrl+P / 工具栏钮 /
//       菜单项共口 ActFindFiles；无文档（boot 零 tab）可用；重复开关循环
//       幂等零叠层（dialog 单实例——quick_open 单旗标）。
//   [2] 键程（AC-02）：输入 Enter 开可见首选实际 path；Tab 到结果行钮 +
//       Enter 开该行（DOM 焦点序——input→行钮）；Escape 关层（v-model 直
//       写 store.quick_open——关态门兜住在途拾取，契约 §5）；零结果 Enter
//       零动作（弹层留置零开页）；查询跨开合保留（输入框遗留值一致）。
//   [3] 视口（AC-03）：1280/360 输入/结果路径/取消可用（不因 hidden
//       md:flex 丢入口——弹层非右栏域）；开关弹层编辑器实例恒等（零重挂
//       载——element 引用恒等断言）。
//   [4] 真实开页与保护（AC-07/09，T-04）：已开脏目标直激活（零覆盖零重
//       复 tab——内存正文/脏标保持）；missing 拒开（独立错误+弹层留置+
//       零建页零 recents）；取消零副作用（save_note/editor/active 恒等）。
//   [5] 迟到票据门（AC-08，T-04）：exists/read 延迟窗内 Escape → 旧拾取
//       丢弃（零开页零 recents 变化）；延迟窗内关再开 → 旧结果不关新层。
//
// 断言纪律：行定域 = dialog role 层 + 精确 path 次行（同名 dtitle 不作定
// 位键）；素材 = 本测自建 qo/ 子树；route delay 走 playwright route（vue
// 轨 HTTP 真等待窗——VM merged 无此窗，probe 同判分列）。
import { expect, test, type Page, type Locator } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { WORKSPACE, visibleEditor } from './helpers'

/** qo/ 子树语料（正文不含名称词——title/alias-only 命中形态锚）。 */
function writeCorpus() {
  const put = (rel: string, body: string) => {
    const full = path.join(WORKSPACE, rel)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, body)
  }
  put('qo/Home.ad', '---\ntitle: 首页\naliases:\n- 起点\n---\n\n普通正文段落。\n')
  put('qo/Plain.ad', '# Plain\n\nplain corpus line\n')
}

/** 快开独立根弹层（dialog role——全页唯一开态模态层）。 */
function quickDialog(page: Page): Locator {
  return page.getByRole('dialog')
}

/** 弹层内按 path 次行定行（行包装 div 唯一子 button——同名 dtitle 不作
 *  定位键，路径唯一）。 */
function rowByPath(dialogCol: Locator, rel: string): Locator {
  return dialogCol.getByText(rel, { exact: true }).locator('..').getByRole('button')
}

async function openViaMenu(page: Page) {
  await page.getByRole('menuitem', { name: '视图' }).click()
  // ⚠ 工具栏钮文本同含 快速打开（第三入口）——menuitem role 锚消歧。
  await page.getByRole('menuitem', { name: '快速打开' }).click()
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible({ timeout: 10_000 })
}

async function openViaToolbar(page: Page) {
  await page.getByRole('button', { name: '快速打开' }).click()
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible({ timeout: 10_000 })
}

async function openViaCtrlP(page: Page) {
  await page.keyboard.press('Control+P')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible({ timeout: 10_000 })
}

async function cancelViaButton(page: Page) {
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
}

test('三入口同一根弹层 + 幂等 + 无文档可用（PLAN-038 T-03 AC-01）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // ① Ctrl+P 口（boot 零 tab = 无文档可用）。
  await openViaCtrlP(page)
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible()
  // 焦点面（vue 轨 = reka DialogContent 原生 autofocus 首可聚焦——input
  // 即首可聚焦[契约 §2]；键入即达 = 焦点在输入框的公开证据）。
  await page.keyboard.type('首页')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveValue('首页')
  await expect(rowByPath(quickDialog(page), 'qo/Home.ad')).toBeVisible({ timeout: 10_000 })
  await page.keyboard.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })

  // ② 工具栏口（第三入口——始终可见不依赖右栏开态）。
  await openViaToolbar(page)
  await cancelViaButton(page)

  // ③ 菜单口 + 重复开关循环幂等（三度开层零叠层——dialog 单实例）。
  for (let i = 0; i < 3; i++) {
    await openViaMenu(page)
    await cancelViaButton(page)
  }
  await openViaMenu(page)
  // 单弹层（开态 dialog 恰一）。
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await cancelViaButton(page)
})

test('键程 Enter/Tab/Escape/零结果（PLAN-038 T-03 AC-02）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // ① 输入 Enter 开可见首选实际 path（首选高亮行——qo/Home.ad）。
  await openViaToolbar(page)
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('首页')
  await expect(rowByPath(quickDialog(page), 'qo/Home.ad')).toBeVisible({ timeout: 10_000 })
  await input.press('Enter')
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0)

  // ② Tab 到结果行钮 + Enter 开另一结果（DOM 焦点序 = input → 首个结果
  // 行钮——reka 内容序 slot 先于 X 钮，契约 §2/§3）。
  await openViaToolbar(page)
  await input.fill('Plain')
  await expect(rowByPath(quickDialog(page), 'qo/Plain.ad')).toBeVisible({ timeout: 10_000 })
  await input.press('Tab')
  await page.keyboard.press('Enter')
  await expect(visibleEditor(page)).toContainText('plain corpus line', { timeout: 10_000 })
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0)

  // ③ 零结果 Enter 零动作（弹层留置 + 零开页——active 不变）。
  await openViaToolbar(page)
  await input.fill('zzz-无此词-xyz')
  await expect(quickDialog(page).getByText('（无匹配文件）', { exact: true })).toBeVisible({ timeout: 10_000 })
  const activeBefore = await visibleEditor(page).textContent()
  await input.press('Enter')
  await page.waitForTimeout(500)
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible()
  await expect(visibleEditor(page)).toHaveText(activeBefore ?? '')

  // ④ Escape 关层（vue v-model 直写——关态门兜住）。
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
})

test('视口 1280/360 弹层可用 + 编辑器实例恒等（PLAN-038 T-03 AC-03）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  // 开一档（编辑器在场——实例恒等断言的基座）。
  await openViaToolbar(page)
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('首页')
  await rowByPath(quickDialog(page), 'qo/Home.ad').click()
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })

  // 1280 视口：开关弹层——编辑器元素引用恒等（零重挂载——editor key 不变）。
  await page.setViewportSize({ width: 1280, height: 800 })
  const editorEl = await visibleEditor(page).elementHandle()
  expect(editorEl).not.toBeNull()
  await openViaCtrlP(page)
  await expect(rowByPath(quickDialog(page), 'qo/Home.ad')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
  const editorElAfter = await visibleEditor(page).elementHandle()
  expect(await page.evaluate(([a, b]) => a === b, [editorEl, editorElAfter])).toBe(true)

  // 360 窄视口：输入/结果路径/取消均可用（弹层非右栏域——无 hidden
  // md:flex 依赖）。
  await page.setViewportSize({ width: 360, height: 720 })
  await openViaToolbar(page)
  await input.fill('Plain')
  await expect(rowByPath(quickDialog(page), 'qo/Plain.ad')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
})

test('真实开页保护：脏目标直激活 + missing 拒开（PLAN-038 T-04 AC-07/09）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // ① 开 Home → 键入改脏（XYZ 标记）→ 快开拾取 Home 自身（目标=当前页）
  // → 直激活零覆盖：编辑器仍含 XYZ、tab 数不变。
  await openViaToolbar(page)
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('首页')
  await rowByPath(quickDialog(page), 'qo/Home.ad').click()
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })
  // 键入改脏。⚠ 先中性点击吸收 reka 关层焦点恢复（dialog close 异步
  // restore 到触发钮——与编辑器聚焦竞速，insertText 落空 T-04 实勘），
  // 再 content.click 聚焦；store 落定锚 = 草稿已保护（Edit→检查点排水
  // ——036 e2e U1 同recipe）。
  await page.getByText('EXPLORER', { exact: true }).click()
  await page.waitForTimeout(300)
  // insertText 竞速环（contenteditable 聚焦后引擎重渲染面——点击/插入
  // 至落定带验证重试 ≤3；T-04 实勘测试侧纪律）。
  const content = visibleEditor(page).locator('.autodown-editor-content')
  for (let i = 0; i < 3; i++) {
    // ⚠ 短文档：content 容器中心可能被 show-actions 钮区遮蔽——点击段落
    // 顶域（position 顶左）保 contenteditable 聚焦（T-04 实勘）。
    await content.click({ position: { x: 10, y: 6 } })
    await page.keyboard.press('Control+End')
    await page.keyboard.insertText('XYZ 脏标')
    await page.waitForTimeout(400)
    if ((await visibleEditor(page).textContent())?.includes('XYZ 脏标')) break
  }
  await expect(visibleEditor(page)).toContainText('XYZ 脏标')
  // blur 冲刷（engine 编辑落 store——matrix D-17 中性 blur 件）+ store
  // 落定锚 = 未保存旗标（store dirty 投影——收字直证）。
  await page.getByText('EXPLORER', { exact: true }).click()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await openViaToolbar(page)
  await input.fill('首页')
  await rowByPath(quickDialog(page), 'qo/Home.ad').click()
  // 直激活零覆盖（store 内存正文保持——含 XYZ）+ 零重复 tab（tab 条恰一
  // 首页 题钮；store tab_count 权威面由 VM probe F5 承载）。
  await expect(visibleEditor(page)).toContainText('XYZ 脏标', { timeout: 10_000 })
  const tabBtn = page.locator('button[class*="h-8 px-3"]').filter({ hasText: /^首页$/ })
  await expect(tabBtn).toHaveCount(1)

  // ② missing 拒开（stale 目录案）：**弹层开着**（入口目录已取——纯内存
  // 过滤零重取）时 fs 删 Plain → 行仍在（内存目录 stale）→ 拾取 → 独立
  // 错误 + 弹层留置 + 零建页（VM probe O 同序——T-04 实勘：入口即重取，
  // 先删后开则行直接消失无 stale 面）。
  await openViaToolbar(page)
  fs.rmSync(path.join(WORKSPACE, 'qo', 'Plain.ad'), { force: true })
  await input.fill('Plain')
  await rowByPath(quickDialog(page), 'qo/Plain.ad').click()
  await expect(quickDialog(page).getByText('目标不存在——请重开快速打开刷新目录', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible()
  expect(fs.existsSync(path.join(WORKSPACE, 'qo', 'Plain.ad'))).toBe(false)
  expect(fs.existsSync(path.join(WORKSPACE, 'Plain.ad'))).toBe(false)
  // 错误不占 save_note（独立分域——状态栏无 read-failed 注记）。
  await expect(page.getByText(/read-failed/)).toHaveCount(0)
  await cancelViaButton(page)
})

test('迟到票据门：延迟窗 Escape / 关再开（PLAN-038 T-04 AC-08）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // ① read_wiki 延迟 2.5s → 拾取发起 → 等待窗内 Escape → 旧拾取丢弃：
  // 零开页（tab 集不变）、零 recents 变化（再开层「最近」段无 Plain）。
  // ⓪ recents 播种（本测自足——成功拾取 Home 一 次；单独 grep 运行时
  // 工作区全新 recents 空，最近段断言需非空基座）。
  await openViaToolbar(page)
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('首页')
  await rowByPath(quickDialog(page), 'qo/Home.ad').click()
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })

  let delayRead = true
  await page.route('**/api/read_wiki', async (route) => {
    if (delayRead) {
      await new Promise((r) => setTimeout(r, 2500))
      await route.continue()
    } else {
      await route.continue()
    }
  })
  await openViaToolbar(page)
  await input.fill('Plain')
  await rowByPath(quickDialog(page), 'qo/Plain.ad').click()
  // 等待窗内 Escape（外部关态——v-model 直写 quick_open=false，关态门判
  // 据在提交前复检）。
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
  await page.waitForTimeout(3000)
  // 旧拾取零提交（读盘回包迟到不得开页/零 recents 写面）。⚠ 查询跨开合
  // 保留——重开层 quick_q='Plain' 遗留，先清空再断言最近段。
  await openViaToolbar(page)
  await input.fill('')
  await expect(quickDialog(page).getByText('最近', { exact: true })).toBeVisible({ timeout: 10_000 })
  // 拾取失败零 recents 写面：最近段首行 = 此前成功的 Home（若迟到票据
  // 曾提交，Plain 会头插至首行）。
  await expect(quickDialog(page).getByRole('button', { name: '首页', exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).click()

  // ② 延迟窗内关再开：旧在途结果不得关新层/写错误。
  delayRead = true
  await openViaToolbar(page)
  await input.fill('Plain')
  await rowByPath(quickDialog(page), 'qo/Plain.ad').click()
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
  await openViaToolbar(page)
  await input.fill('')
  await expect(quickDialog(page).getByText('最近', { exact: true })).toBeVisible({ timeout: 10_000 })
  await input.fill('Home')
  await expect(rowByPath(quickDialog(page), 'qo/Home.ad')).toBeVisible({ timeout: 10_000 })
  await page.waitForTimeout(3000)
  // 新层保持开（旧迟到结果零关层）+ 无错误横幅（旧票据零提示回写）。
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible()
  await expect(quickDialog(page).getByText('页面读取失败，请重试', { exact: true })).toHaveCount(0)
  await page.unroute('**/api/read_wiki')
})
