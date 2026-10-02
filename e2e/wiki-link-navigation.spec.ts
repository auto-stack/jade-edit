// wiki-link-navigation.spec.ts — PLAN-036 正文内链导航（vue 轨真组件行为
// 套件；与 tests/probe_wiki_link_navigation.mjs merged/split 臂互补——
// 生产 app.at 接线（on "open-wiki-link" → OpenWikiLink 协调流 → store
// NavCommit 同步门）的真实引擎 DOM 点击与可控响应延迟验证）。
//
// 相位（PLAN-036 §6）：
//   events      E 组：中文别名/英文 stem/带锚真实点击——目标正确打开、
//               handler 恰一次（零重复 tab）、无锚零提示（无 undefined
//               字面）、带锚保留且仅开页后提示不支持定位。
//   unsaved     U 组：两类未保存源可导航（具名脏源+untitled 源）——源内存
//               body/dirty 保持、源磁盘字节不变、在途草稿排水继续（导航零
//               Save/Reload/结算——AC-04）。
//   target      D 组：已开且 dirty 目标直接激活不被读盘覆盖（内存脏目标
//               优先——AC-05）；读失败可见且不记最近文件；恢复后再点成功
//               才入 recents（成功副作用面）。
//   stale       S 组：解析/读盘两等待窗的过期拒绝——切档、A→B→A、关闭重
//               开、源新输入、逆序双点击（旧结果零激活/零新 tab/零提示
//               回写——AC-06；选择世代门 A→B→A 直证）。
//
// 结果语义：全部断言断「当前真实行为」；语料链接一律置非首块（契约 B-2
// ——未聚焦首块点击被吞，上游边界在案）。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import { WORKSPACE, visibleEditor, appendToEditor } from './helpers'

const openHome = async (page: import('@playwright/test').Page) => {
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('首页', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 10_000 })
}

const openTreePage = async (page: import('@playwright/test').Page, label: string, marker: string) => {
  // 幂等展开：目标行已可见则不点 wiki（重复点击=折叠——D-23③ 闭态族）
  const row = page.getByText(label, { exact: true }).first()
  if ((await row.count()) === 0 || !(await row.isVisible())) {
    await page.getByText('wiki', { exact: true }).first().click()
  }
  await row.click()
  await expect(visibleEditor(page)).toContainText(marker, { timeout: 10_000 })
}

const tabButton = (page: import('@playwright/test').Page, title: string) =>
  page.locator('button[class*="h-8 px-3"]', { hasText: title })

const tabCount = async (page: import('@playwright/test').Page) =>
  await page.locator('button[class*="h-8 px-3"]').count()

const clickLink = async (page: import('@playwright/test').Page, label: string) => {
  const link = visibleEditor(page).locator('.autodown-wikilink-label').filter({ hasText: new RegExp(`^${label}$`) }).first()
  await link.waitFor({ timeout: 10_000 })
  // 引擎块底 boundary 命中区（.autodown-block-boundary:after：块底下 20px
  // + 下沿溢出 8px，pointer-events:auto）按块高不同会遮挡 span 的部分高
  // 度带——依次试 span 内多个高度点，被拦截（Playwright 命中检测抛错）即
  // 换下一高度（契约 B-7 记录）。
  const box = await link.boundingBox()
  const h = box?.height ?? 24
  const ys = [Math.floor(h / 2), 10, 6, Math.max(2, h - 8), 2]
  let lastErr: unknown
  for (const y of ys) {
    try {
      await link.click({ position: { x: 8, y }, timeout: 2500 })
      return
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

test('wiki 导航·事件（中文别名/英文 stem/带锚真实点击）', async ({ page }) => {
  test.setTimeout(240_000)
  await openHome(page)

  // E1 英文 stem：[[Hello World]] → 打开 Hello World.ad（新 tab、编辑器
  // 切换、无锚零提示——note 不出现且无 undefined 字面）
  const tabsBefore = await tabCount(page)
  await clickLink(page, 'Hello World')
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  await expect(tabButton(page, 'Hello World')).toHaveCount(1)
  await expect(page.getByText('已打开页面，暂不支持定位到锚点：')).toHaveCount(0)
  await expect(page.getByText('undefined', { exact: true })).toHaveCount(0)
  console.log('[events] [[Hello World]] 英文 stem 真实点击打开目标（恰一新 tab、无锚零提示）')

  // E2 中文 stem：[[CAP 定理]] → 打开 CAP 定理.ad
  await page.getByText('首页', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 10_000 })
  await clickLink(page, 'CAP 定理')
  await expect(visibleEditor(page).locator('.autodown-editor-content')).toContainText(/./, { timeout: 10_000 })
  await expect(tabButton(page, 'CAP 定理')).toHaveCount(1)
  expect(await tabCount(page), '两次导航恰两新 tab（handler 恰一次零重复）').toBe(tabsBefore + 2)
  console.log('[events] [[CAP 定理]] 中文 stem 真实点击打开目标（恰一新 tab）')

  // E3 带锚：磁盘预写锚点链接源页（引擎无输入期解析——B-6 边界，链接
  // 一律加载期解析）→ 点击 → 已开目标激活 + 锚点提示（开页≠reveal）
  fs.writeFileSync(`${WORKSPACE}/NavAnchor.ad`, '# 锚点源\n\n跳 [[Hello World#sec-x]] 一处。\n\n尾部段落。\n', 'utf8')
  await page.keyboard.press('Control+p')
  const anchorFind = page.getByPlaceholder('过滤文件名…')
  await expect(anchorFind).toBeVisible({ timeout: 5_000 })
  await anchorFind.fill('NavAnchor')
  await page.getByText('NavAnchor', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('跳 Hello World#sec-x 一处。', { timeout: 10_000 })
  await clickLink(page, 'Hello World#sec-x')
  await expect(page.getByText('已打开页面，暂不支持定位到锚点：sec-x', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  await expect(tabButton(page, 'Hello World')).toHaveCount(1, '已开目标激活零重复 tab')
  console.log('[events] PASS — 带锚点击：锚点保留+仅开页后定位说明（已开目标激活零重复 tab）')
})

test('wiki 导航·未保存源（具名脏源+untitled 源，AC-04）', async ({ page }) => {
  test.setTimeout(240_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // U1 具名脏源：磁盘预写链接行（加载期解析——B-6）后打开 → 纯文本追加
  // 弄脏（草稿排水）→ 点击 [[Projects]] 打开；源 tab 脏标/正文保持、磁盘
  // 字节不变（导航零 Save/Reload/结算）
  fs.appendFileSync(`${WORKSPACE}/wiki/Tasks.ad`, `\n参见 [[Projects]] 一处。\n`, 'utf8')
  const tasksDiskBefore = fs.readFileSync(`${WORKSPACE}/wiki/Tasks.ad`, 'utf8')
  await openTreePage(page, 'Tasks', '原型设计')
  await appendToEditor(page, ` U1-脏化标记。`)
  await expect(page.getByText('草稿已保护', { exact: true })).toBeVisible({ timeout: 15_000 })
  await clickLink(page, 'Projects')
  await expect(visibleEditor(page).locator('.autodown-editor-content')).toContainText(/./, { timeout: 10_000 })
  await expect(tabButton(page, 'Tasks')).toHaveCount(1)
  // Tasks 脏标在 tab 条 * 号（脏 tab 行内）；状态栏「未保存」属活动页
  //（Projects 干净无未保存）——切回 Tasks 断言正文/脏标/磁盘保持
  await tabButton(page, 'Tasks').click()
  await expect(visibleEditor(page)).toContainText('U1-脏化标记。', { timeout: 10_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  expect(fs.readFileSync(`${WORKSPACE}/wiki/Tasks.ad`, 'utf8'), '源磁盘字节不变（导航零保存）').toBe(tasksDiskBefore)
  console.log('[unsaved] 具名脏源导航：源内存/脏标/磁盘保持（在途草稿已排水——零结算面）')

  // U2 untitled 源（B-6/B-7 引擎边界降级形态）：空 untitled 编辑器渲染
  // 零块（无文本宿主——多点点击+真实逐键均不落，B-7），链接输入期解析
  // 缺失（B-6）——untitled 自身带链接点击导航结构性不可达。本测降级断言：
  // untitled tab 在会话中存在时导航照常工作且 untitled 实例零波及
  //（untitled 源不可导航面如实上报告复审）。
  fs.writeFileSync(`${WORKSPACE}/NavSrc3.ad`, '# 导航源三\n\n参见 [[Projects]] 一处。\n\n尾部段落。\n', 'utf8')
  await page.keyboard.press('Control+n')
  await expect(tabButton(page, '未命名')).toHaveCount(1, { timeout: 10_000 })
  await page.keyboard.press('Control+p')
  const u2Find = page.getByPlaceholder('过滤文件名…')
  await expect(u2Find).toBeVisible({ timeout: 5_000 })
  await u2Find.fill('NavSrc3')
  await page.getByText('NavSrc3', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('参见 Projects 一处。', { timeout: 10_000 })
  await clickLink(page, 'Projects')
  await expect(tabButton(page, 'Projects')).toHaveCount(1, { timeout: 10_000 })
  await expect(tabButton(page, '未命名')).toHaveCount(1, 'untitled tab 零波及')
  await tabButton(page, '未命名').click()
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  console.log('[unsaved] PASS — untitled 存在时导航不波及（untitled 自身带链接点击导航=B-6/B-7 引擎边界在案）')
})

test('wiki 导航·目标状态（脏目标优先/读失败可见不记 recents，AC-05/08）', async ({ page }) => {
  test.setTimeout(300_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // D1 脏目标优先：先开 Hello World 弄脏 → 回首页点击 [[Hello World]] →
  // 激活现有内存页（脏正文不被磁盘覆盖）
  await openTreePage(page, 'Hello World', '这是一段示例文本')
  await appendToEditor(page, ` HELLO-DIRTY 标记。`)
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await page.getByText('首页', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 10_000 })
  await clickLink(page, 'Hello World')
  await expect(visibleEditor(page)).toContainText('HELLO-DIRTY 标记。', { timeout: 10_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  expect(fs.readFileSync(`${WORKSPACE}/wiki/Hello World.ad`, 'utf8'), '脏目标磁盘不被导航触碰').not.toContain('HELLO-DIRTY 标记。')
  console.log('[target] PASS — 已开 dirty 目标直接激活（内存正文保留、零读盘覆盖）')

  // D2 读失败：磁盘预写链接到 Tasks（加载期解析——B-6）→ 新建目标页
  //（磁盘在、未开——EXPLORER「＋」= ActNewFile 弹层，非 toolbar Ctrl+N
  // untitled 口）→ read_wiki 一次性 abort → 错误可见、零 tab、不记
  // recents；恢复后再点成功才入 recents
  fs.appendFileSync(`${WORKSPACE}/wiki/Tasks.ad`, `\n跳 [[NavTarget]] 一处。\n`, 'utf8')
  await page.getByText('EXPLORER', { exact: true }).locator('..').getByRole('button').first().click()
  const newInput = page.getByPlaceholder('页面名…')
  await expect(newInput).toBeVisible({ timeout: 5_000 })
  await newInput.fill('NavTarget')
  await page.getByRole('button', { name: '创建', exact: true }).click()
  await expect(tabButton(page, 'NavTarget')).toHaveCount(1, { timeout: 10_000 })
  // 关闭该干净 tab（X 钮）→ 打开 Tasks 作源
  await tabButton(page, 'NavTarget').locator('..').locator('button').last().click()
  await expect(tabButton(page, 'NavTarget')).toHaveCount(0, { timeout: 10_000 })
  await openTreePage(page, 'Tasks', '原型设计')
  let abortRead = true
  await page.route('**/api/read_wiki', async (route) => {
    if (abortRead) {
      abortRead = false
      await route.abort()
    } else {
      await route.continue()
    }
  })
  await clickLink(page, 'NavTarget')
  await expect(page.getByText('页面读取失败，请重试', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(tabButton(page, 'NavTarget')).toHaveCount(0, '读失败零 tab')
  // 失败不记 recents（快开「最近」段无 NavTarget）
  await page.keyboard.press('Control+p')
  const findInput = page.getByPlaceholder('过滤文件名…')
  await expect(findInput).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('NavTarget.ad', { exact: true })).toHaveCount(0, '读失败不记最近文件')
  await page.getByRole('button', { name: '收起', exact: true }).first().click()
  // 恢复：再点（abort 已消费）→ 成功打开 + 此时入 recents（成功才记）
  await clickLink(page, 'NavTarget')
  await expect(tabButton(page, 'NavTarget')).toHaveCount(1, { timeout: 10_000 })
  await expect(page.getByText('页面读取失败，请重试', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  await page.keyboard.press('Control+p')
  await expect(page.getByPlaceholder('过滤文件名…')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('NavTarget.ad', { exact: true })).toBeVisible({ timeout: 10_000 })
  console.log('[target] PASS — 读失败可见不记 recents；恢复成功才入最近文件（成功副作用面）')
})

test('wiki 导航·过期·解析窗（切档/A→B→A/关闭重开/源新输入，AC-06）', async ({ page }) => {
  test.setTimeout(360_000)
  // S 组源页 = 磁盘直写 NavSrc（链接在非首块——契约 B-2）；快开打开。
  fs.writeFileSync(`${WORKSPACE}/NavSrc.ad`, '# 导航源\n\n参见 [[Hello World]] 与 [[Projects]] 一处。\n\n尾部段落。\n', 'utf8')
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.keyboard.press('Control+p')
  const findInput = page.getByPlaceholder('过滤文件名…')
  await expect(findInput).toBeVisible({ timeout: 5_000 })
  await findInput.fill('NavSrc')
  await page.getByText('NavSrc', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 10_000 })
  // Tasks 预开为 tab（切换面走 tab 条——树折叠态无关）
  await page.keyboard.press('Control+p')
  const sFind = page.getByPlaceholder('过滤文件名…')
  await expect(sFind).toBeVisible({ timeout: 5_000 })
  await sFind.fill('Tasks')
  await page.getByText('Tasks', { exact: true }).first().click()
  await expect(tabButton(page, 'Tasks')).toHaveCount(1, { timeout: 10_000 })
  await tabButton(page, 'NavSrc').click()
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 10_000 })

  let delayResolve = 0
  await page.route('**/api/resolve_wiki_link', async (route) => {
    if (delayResolve > 0) {
      const d = delayResolve
      delayResolve = 0
      await new Promise((r) => setTimeout(r, d))
    }
    await route.continue()
  })

  // S1 切档：解析窗内切到 Tasks → 旧结果零激活零新 tab 零提示
  let tabsBefore = await tabCount(page)
  delayResolve = 2500
  await clickLink(page, 'Hello World')
  await tabButton(page, 'Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  await sleep(3500)
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 5_000 })
  expect(await tabCount(page), 'S1 切档：零新 tab').toBe(tabsBefore)
  await expect(page.getByText('已打开页面', { exact: true })).toHaveCount(0)
  console.log('[stale-resolve] 切档：旧解析结果零激活零 tab 零提示')

  // S2 A→B→A：解析窗内 NavSrc→Tasks→NavSrc 往返（uid/key/body 全同仅
  // 世代 +2 不同）→ 拒绝——选择世代门直证
  await tabButton(page, 'NavSrc').click()
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 10_000 })
  tabsBefore = await tabCount(page)
  delayResolve = 2500
  await clickLink(page, 'Hello World')
  await tabButton(page, 'Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  await tabButton(page, 'NavSrc').click()
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 10_000 })
  await sleep(3500)
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 5_000 })
  expect(await tabCount(page), 'S2 A→B→A：零新 tab').toBe(tabsBefore)
  console.log('[stale-resolve] PASS — A→B→A 往返：字段全同仅世代不同即拒绝')

  // S3 关闭重开：解析窗内关闭源 tab（干净直关）→ 快开重开同 path → 拒绝
  await page.keyboard.press('Control+p')
  const findInput2 = page.getByPlaceholder('过滤文件名…')
  await expect(findInput2).toBeVisible({ timeout: 5_000 })
  await findInput2.fill('NavSrc')
  await page.getByText('NavSrc', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 10_000 })
  tabsBefore = await tabCount(page)
  delayResolve = 2500
  await clickLink(page, 'Hello World')
  // 关闭 NavSrc（干净——X 钮在其 tab 行）
  const srcTab = tabButton(page, 'NavSrc')
  await srcTab.locator('..').locator('button').last().click()
  await expect(tabButton(page, 'NavSrc')).toHaveCount(0, { timeout: 10_000 })
  await page.keyboard.press('Control+p')
  const findInput3 = page.getByPlaceholder('过滤文件名…')
  await expect(findInput3).toBeVisible({ timeout: 5_000 })
  await findInput3.fill('NavSrc')
  await page.getByText('NavSrc', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 10_000 })
  await sleep(3500)
  await expect(visibleEditor(page)).toContainText('参见 Hello World 与 Projects 一处。', { timeout: 5_000 })
  expect(await tabCount(page), 'S3 关闭重开：零新 tab（关一重开一）').toBe(tabsBefore)
  console.log('[stale-resolve] PASS — 关闭重开同 path：新实例世代拒绝旧票据')

  // S4 源新输入：解析窗内编辑器键入 → 票据 body 失效拒绝；源正文保持
  tabsBefore = await tabCount(page)
  delayResolve = 2500
  await clickLink(page, 'Hello World')
  await appendToEditor(page, ` S4-迟到输入标记。`)
  await sleep(3500)
  await expect(visibleEditor(page)).toContainText('S4-迟到输入标记。', { timeout: 5_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  expect(await tabCount(page), 'S4 源新输入：零新 tab').toBe(tabsBefore)
  await expect(page.getByText('已打开页面', { exact: true })).toHaveCount(0)
  console.log('[stale-resolve] PASS — 源新输入：票据失效拒绝、源正文/脏标保持')
})

test('wiki 导航·过期·读盘窗与逆序（stale-after-read/第二点击，AC-06）', async ({ page }) => {
  test.setTimeout(300_000)
  fs.writeFileSync(`${WORKSPACE}/NavSrc2.ad`, '# 导航源二\n\n参见 [[Projects]] 与 [[Hello World]] 一处。\n\n尾部段落。\n', 'utf8')
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.keyboard.press('Control+p')
  const findInput = page.getByPlaceholder('过滤文件名…')
  await expect(findInput).toBeVisible({ timeout: 5_000 })
  await findInput.fill('NavSrc2')
  await page.getByText('NavSrc2', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('参见 Projects 与 Hello World 一处。', { timeout: 10_000 })
  // Tasks 预开为 tab（切换面走 tab 条——树折叠态无关）
  await page.keyboard.press('Control+p')
  const s5Find = page.getByPlaceholder('过滤文件名…')
  await expect(s5Find).toBeVisible({ timeout: 5_000 })
  await s5Find.fill('Tasks')
  await page.getByText('Tasks', { exact: true }).first().click()
  await expect(tabButton(page, 'Tasks')).toHaveCount(1, { timeout: 10_000 })
  await tabButton(page, 'NavSrc2').click()
  await expect(visibleEditor(page)).toContainText('参见 Projects 与 Hello World 一处。', { timeout: 10_000 })

  // S5 读盘窗：解析即时、read_wiki 延迟——窗内切档 → 门②拒绝
  let delayRead = 0
  await page.route('**/api/read_wiki', async (route) => {
    if (delayRead > 0) {
      const d = delayRead
      delayRead = 0
      await new Promise((r) => setTimeout(r, d))
    }
    await route.continue()
  })
  const tabsBefore = await tabCount(page)
  delayRead = 2500
  await clickLink(page, 'Projects')
  await tabButton(page, 'Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  await sleep(3500)
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 5_000 })
  expect(await tabCount(page), 'S5 读盘窗切档：零新 tab').toBe(tabsBefore)
  await expect(page.getByText('已打开页面', { exact: true })).toHaveCount(0)
  console.log('[stale-read] PASS — 读盘等待窗切档：门②拒绝旧结果')

  // S6 逆序双点击：第一点击延迟解析、第二点击即时——只最后有效请求提交
  const tabsBeforeS6 = await tabCount(page)
  delayRead = 0
  let delayResolve2 = 0
  await page.route('**/api/resolve_wiki_link', async (route) => {
    if (delayResolve2 > 0) {
      const d = delayResolve2
      delayResolve2 = 0
      await new Promise((r) => setTimeout(r, d))
    }
    await route.continue()
  })
  await page.getByText('NavSrc2', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('参见 Projects 与 Hello World 一处。', { timeout: 10_000 })
  delayResolve2 = 3000
  await clickLink(page, 'Hello World')
  await clickLink(page, 'Projects')
  await expect(visibleEditor(page).locator('.autodown-editor-content')).toContainText(/./, { timeout: 10_000 })
  await expect(tabButton(page, 'Projects')).toHaveCount(1, { timeout: 10_000 })
  await sleep(4000)
  await expect(visibleEditor(page).locator('.autodown-editor-content')).toContainText(/./, { timeout: 5_000 })
  expect(await tabCount(page), 'S6 逆序：恰一新 tab（慢者零 tab）').toBe(tabsBeforeS6 + 1)
  await expect(tabButton(page, 'Projects').first()).toBeVisible()
  const activeTab = page.locator('button[class*="text-foreground font-medium"]')
  await expect(activeTab).toHaveText(/Projects/)
  console.log('[stale-resolve] PASS — 逆序双点击：快者提交、慢者零效（active 恒 Projects）')
})
