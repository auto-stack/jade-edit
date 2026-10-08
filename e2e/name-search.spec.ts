// name-search.spec.ts — PLAN-033 vue 轨名称查找一致（T-03 基本名称弧 +
// T-04 刷新/迟到/失败集成；vm 轨对位 = tests/vm_matrix.mjs N 组）。
//
// 覆盖面（AC 映射）：
//   [1] 名称核心弧（AC-01/02/04/05）：title-only 页（fm title=首页，正文
//       无该词）快开可找；显示标题/别名/stem/带 .ad 文件名/相对路径五域；
//       5 层深档；正文专有词不进 files（AC-02 负向）；同名双页逐路径
//       展示与打开（AC-05——行 dtitle 主行 + 实际 path 次行，点击各开
//       各自磁盘正文）；files 拾取即关。
//   [2] 全文扩面与行形态（AC-01/03/05）：title 命中行（wiki/index.ad +
//       nm/Home.ad）；正文命中行 path 次行；text 拾取面板保持开；
//       files/text 行域隔离（正文词只进 text）。
//   [3] 请求计数（AC-06）：入口一次 page_names；逐键输入零 fetch；
//       Enter 逐次 search_wiki。
//   [4] 失败/过期可见（AC-09）：page_names 拒 → 「名称加载失败」+ 重试
//       恢复；search_wiki 拒 → 「搜索失败」横幅（不渲染成"无结果"）+
//       重试成功清错。
//   [5] 迟到门（AC-09）：search_wiki 延迟 + 等待期改查询 → 旧响应不
//       提交（新查询结果可见且唯一）。
//   [6] 刷新失效（AC-08）：外部 fs 改 title → 属性保存（MetaGo）后目录
//       更新；text 结果过期横幅 → 重新检索消解。
//
// 断言纪律（PLAN-038 T-03 迁移）：行定域 = 快开独立根弹层（dialog role
// 全页唯一开态层——右栏 files 面板退役）+ 精确 path 次行文本（路径唯一
// ——同名 dtitle 不作定位键）；素材 = 本测自建 nm/ 子树（boot 前落位，
// matrix 套件遗留面零依赖——wiki/index.ad 仅作 path 断言其 frontmatter
// title=首页随 fixture 在册）。入口 = 菜单口（menuitem role 锚——工具栏
// 钮文本同名，T-03 第三入口在册）。
import { expect, test, type Page, type Locator } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { WORKSPACE, visibleEditor } from './helpers'

const TAB = '\t'

/** nm/ 子树语料（正文不含名称词——title/alias-only 命中形态锚）。 */
function writeCorpus() {
  const put = (rel: string, body: string) => {
    const full = path.join(WORKSPACE, rel)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, body)
  }
  put('nm/Home.ad', '---\ntitle: 首页\naliases:\n- 起点\n---\n\n# Doc\n\n普通正文段落。\n')
  put('nm/Dup A.ad', '---\ntitle: 重名页\n---\n\n甲处正文。\n')
  put('nm/Dup B.ad', '---\ntitle: 重名页\n---\n\n乙处正文。\n')
  put('nm/AliasOnly.ad', '---\naliases:\n- 独角兽\n---\n\n别名页正文。\n')
  put('nm/Plain.ad', '# Plain\n\nplain corpus line\n')
  put('nm/deep/l2/l3/l4/l5/Deep.ad', 'deep line\n')
  put('nm/Quoted.ad', `---\ntitle: q"ote\\slash\naliases:\n- tab${TAB}9\n---\n\nquoted body\n`)
}

/** 快开独立根弹层（PLAN-038 T-03 迁移——dialog role 定域；右栏 files
 *  面板退役，快开弧行断言走本域）。 */
function quickDialog(page: Page): Locator {
  return page.getByRole('dialog')
}

/** 全文检索面板列（text 模式右栏 w-72——快开迁移后仍承载 text/wanted/
 *  trash/orphans 四模式；text 行断言域）。 */
function panel(page: Page): Locator {
  return page.locator('div.w-72')
}

/** 弹层内按 path 次行定行（行包装 div 的唯一子 button——同名 dtitle 不作
 *  定位键，路径唯一）。 */
function rowByPath(dialogCol: Locator, rel: string): Locator {
  return dialogCol.getByText(rel, { exact: true }).locator('..').getByRole('button')
}

async function openQuickOpen(page: Page) {
  await page.getByRole('menuitem', { name: '视图' }).click()
  // ⚠ 工具栏钮文本同含 快速打开（PLAN-038 T-03 第三入口）——menuitem
  // role 锚消歧（工具栏钮非 menuitem）。
  await page.getByRole('menuitem', { name: '快速打开' }).click()
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toBeVisible({ timeout: 10_000 })
}

async function openFindText(page: Page) {
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('全文检索', { exact: true }).click()
  await expect(page.getByPlaceholder('输入查询词…')).toBeVisible({ timeout: 10_000 })
}

test('名称查找核心弧（PLAN-033 T-03）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // —— ① title-only 页快开可找（AC-01）：查询 首页 → fixture index.ad
  //（fm title=首页）与 nm/Home.ad 双行、同显示名、path 次行可区分。——
  await openQuickOpen(page)
  const p = quickDialog(page)
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('首页')
  await expect(rowByPath(p, 'wiki/index.ad')).toBeVisible({ timeout: 10_000 })
  await expect(rowByPath(p, 'nm/Home.ad')).toBeVisible()
  await expect(rowByPath(p, 'wiki/index.ad')).toHaveText('首页')
  await expect(rowByPath(p, 'nm/Home.ad')).toHaveText('首页')

  // —— ② 按实际路径点击开正确档（AC-05）+ files 拾取即关。——
  await rowByPath(p, 'nm/Home.ad').click()
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0)

  // —— ③ 同名双页逐路径打开（AC-05）：重名页两行各开各盘正文。——
  await openQuickOpen(page)
  await input.fill('重名页')
  await expect(rowByPath(p, 'nm/Dup A.ad')).toBeVisible({ timeout: 10_000 })
  await expect(rowByPath(p, 'nm/Dup B.ad')).toBeVisible()
  await rowByPath(p, 'nm/Dup B.ad').click()
  await expect(visibleEditor(page)).toContainText('乙处正文', { timeout: 10_000 })
  await openQuickOpen(page)
  await input.fill('重名页')
  await expect(rowByPath(p, 'nm/Dup A.ad')).toBeVisible({ timeout: 10_000 })
  await rowByPath(p, 'nm/Dup A.ad').click()
  await expect(visibleEditor(page)).toContainText('甲处正文', { timeout: 15_000 })

  // —— ④ 名称五域（AC-02/04）：alias / stem / 带 .ad 文件名 / 相对路径
  // / 5 层深档；trim 与 ASCII 大小写。——
  await openQuickOpen(page)
  await input.fill('独角兽')
  await expect(rowByPath(p, 'nm/AliasOnly.ad')).toBeVisible({ timeout: 10_000 })
  await input.fill('  Home  ')
  await expect(rowByPath(p, 'nm/Home.ad')).toBeVisible({ timeout: 10_000 })
  await input.fill('DEEP.AD')
  await expect(rowByPath(p, 'nm/deep/l2/l3/l4/l5/Deep.ad')).toBeVisible({ timeout: 10_000 })
  await input.fill('nm/deep')
  await expect(rowByPath(p, 'nm/deep/l2/l3/l4/l5/Deep.ad')).toBeVisible({ timeout: 10_000 })
  await input.fill('Dup')
  await expect(rowByPath(p, 'nm/Dup A.ad')).toBeVisible({ timeout: 10_000 })
  await expect(rowByPath(p, 'nm/Dup B.ad')).toBeVisible()

  // —— ⑤ 正文专有词不进 files（AC-02 负向）+ 空态。——
  await input.fill('plain corpus')
  await expect(p.getByText('（无匹配文件）', { exact: true })).toBeVisible({ timeout: 10_000 })

  // —— ⑥ 制表符 alias 可查（AC-04 转义读回面——JSON 往返后匹配）。——
  await input.fill(`tab${TAB}9`)
  await expect(rowByPath(p, 'nm/Quoted.ad')).toBeVisible({ timeout: 10_000 })
  // Escape 关弹层（vue 轨 reka-ui v-model 直写 store.quick_open——无 msg
  // 派发，在途拾取由关态门兜住[契约 §5]）。
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
})

test('全文扩面与行形态（PLAN-033 T-03）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // —— ① title-only 命中进全文（AC-01）：首页 → index.ad（正文 # 首页
  // 行命中，snippet 非空）+ nm/Home.ad（title-only，snippet 空——行仍在）。
  // text 行断言域 = 右栏面板（PLAN-038 迁移后 text 面仍在右栏）。——
  await openFindText(page)
  const p = panel(page)
  const input = page.getByPlaceholder('输入查询词…')
  await input.fill('首页')
  await input.press('Enter')
  await expect(rowByPath(p, 'nm/Home.ad')).toBeVisible({ timeout: 10_000 })
  await expect(rowByPath(p, 'wiki/index.ad')).toBeVisible()
  // 正文行可辨（path 次行在）——snippet 段同行断言面收窄到 path 唯一定址。
  await expect(p.getByText('nm/Home.ad', { exact: true })).toBeVisible()

  // —— ② text 拾取面板保持开（AC-05）+ 开档正确。——
  await rowByPath(p, 'nm/Home.ad').click()
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })
  await expect(page.getByPlaceholder('输入查询词…')).toBeVisible()

  // —— ③ 正文专有词只进 text（AC-02/03 域隔离）。——
  await input.fill('plain corpus')
  await input.press('Enter')
  await expect(rowByPath(p, 'nm/Plain.ad')).toBeVisible({ timeout: 10_000 })

  // —— ④ 相对路径查询命中（AC-01 path 域）。——
  await input.fill('nm/Dup B')
  await input.press('Enter')
  await expect(rowByPath(p, 'nm/Dup B.ad')).toBeVisible({ timeout: 10_000 })
  await expect(rowByPath(p, 'nm/Dup A.ad')).toHaveCount(0)
})

test('请求计数与逐键零 fetch（PLAN-033 T-03 AC-06）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  let namesCalls = 0
  let searchCalls = 0
  page.on('request', (r) => {
    if (r.url().includes('/api/page_names')) namesCalls += 1
    if (r.url().includes('/api/search_wiki')) searchCalls += 1
  })

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  expect(namesCalls, 'boot 懒载——入口前零目录请求').toBe(0)

  // 入口一次 page_names；逐键输入零新增（AC-06）。
  await openQuickOpen(page)
  const base = namesCalls
  expect(base, '入口恰一次目录请求').toBe(1)
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('H')
  await input.fill('Ho')
  await input.fill('Home')
  await page.waitForTimeout(800)
  expect(namesCalls, '逐键零 fetch').toBe(base)

  // 切 text 模式（入口再取一次目录）→ Enter 逐次 search（AC-06 全文触发
  // 面）。⚠ 快开=根模态弹层（PLAN-038）——切菜单入口前先关层（模态域
  // 外菜单不可达——T-03 实勘测试侧纪律）。
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('全文检索', { exact: true }).click()
  await expect(page.getByPlaceholder('输入查询词…')).toBeVisible({ timeout: 10_000 })
  expect(namesCalls, 'text 入口再取一次').toBe(base + 1)
  const tin = page.getByPlaceholder('输入查询词…')
  await tin.fill('普通')
  await tin.press('Enter')
  await page.waitForTimeout(600)
  expect(searchCalls, 'Enter 恰一次检索').toBe(1)
  await tin.press('Enter')
  await page.waitForTimeout(600)
  expect(searchCalls, '再 Enter 恰第二次').toBe(2)
  // 键入（不 Enter）零检索请求。
  await tin.fill('正文')
  await page.waitForTimeout(600)
  expect(searchCalls, '键入零检索').toBe(2)
})

test('失败可见与重试（PLAN-033 T-04 AC-09）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  // page_names 全拒 → 目录错误态（首载失败不伪造"无结果"）。
  let failNames = true
  await page.route('**/api/page_names', async (route) => {
    if (failNames) await route.abort('failed')
    else await route.continue()
  })
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  await openQuickOpen(page)
  const p = quickDialog(page)
  await expect(p.getByText('名称加载失败', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(p.getByText('（无匹配文件）', { exact: true })).toHaveCount(0)

  // 恢复 + 重试 → 目录可用，行集出现，错误横幅消失（快开弹层面）。
  failNames = false
  await p.getByRole('button', { name: '重试', exact: true }).click()
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('Home')
  await expect(rowByPath(p, 'nm/Home.ad')).toBeVisible({ timeout: 10_000 })
  await expect(p.getByText('名称加载失败', { exact: true })).toHaveCount(0)
  // 关快开层（模态域外菜单不可达——T-03 实勘测试侧纪律）。
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })

  // —— text 段（搜索失败横幅/重试 = 右栏面板域）。——
  const tp = panel(page)

  // search_wiki 拒 → 搜索失败横幅（非"无结果"）；重试成功清错。
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('全文检索', { exact: true }).click()
  await expect(page.getByPlaceholder('输入查询词…')).toBeVisible({ timeout: 10_000 })
  await page.route('**/api/search_wiki', async (route) => {
    await route.abort('failed')
  })
  const tin = page.getByPlaceholder('输入查询词…')
  await tin.fill('普通')
  await tin.press('Enter')
  await expect(tp.getByText('搜索失败——请重试', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(tp.getByText('（无结果）', { exact: true })).toHaveCount(0)
  await page.unroute('**/api/search_wiki')
  await tin.press('Enter')
  await expect(rowByPath(tp, 'nm/Home.ad')).toBeVisible({ timeout: 10_000 })
  await expect(tp.getByText('搜索失败——请重试', { exact: true })).toHaveCount(0)
})

test('迟到响应门（PLAN-033 T-04 AC-09）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  // 首个查询延迟挂起 → 等待期改查询并再次 Enter → 旧响应放行也不得提交。
  let delayFirst = true
  await page.route('**/api/search_wiki', async (route) => {
    if (delayFirst) {
      delayFirst = false
      await new Promise((r) => setTimeout(r, 2500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ path: 'STALE/旧查询结果.ad', title: '旧查询结果', snippet: '' }]),
      })
    } else {
      await route.continue()
    }
  })
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  await openFindText(page)
  const p = panel(page)
  const tin = page.getByPlaceholder('输入查询词…')
  await tin.fill('甲处')
  await tin.press('Enter')
  // 等待期改查询（在途请求失效）→ 新查询 Enter → 新结果先到。
  await tin.fill('甲处正文')
  await tin.press('Enter')
  await expect(rowByPath(p, 'nm/Dup A.ad')).toBeVisible({ timeout: 10_000 })
  // 旧响应 2.5s 后放行——迟到旧结果不得覆盖/混入（STALE 路径不得出现）。
  await page.waitForTimeout(3000)
  await expect(p.getByText('STALE/旧查询结果.ad', { exact: true })).toHaveCount(0)
  await expect(rowByPath(p, 'nm/Dup A.ad')).toBeVisible()
})

test('保存刷新与过期横幅（PLAN-033 T-04 AC-08）', async ({ page }) => {
  test.setTimeout(300_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  writeCorpus()

  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // 先做一次全文检索留下结果 → 开 Home 档通过属性弹层改 title（MetaGo）
  // → 名称目录更新（files 行新 dtitle）+ text 结果过期横幅 → 重新检索
  // 消解（AC-08 属性编辑代表弧 + §5.3 过期门）。新 title = 甲一（与旧
  // 首页无子串重叠——contains 匹配域可正交断言）。
  await openFindText(page)
  const tp = panel(page)
  const tin = page.getByPlaceholder('输入查询词…')
  await tin.fill('甲处正文')
  await tin.press('Enter')
  await expect(rowByPath(tp, 'nm/Dup A.ad')).toBeVisible({ timeout: 10_000 })

  // 开 Home 档（快开口——menuitem role 锚消歧工具栏同名文本钮[PLAN-038
  // 第三入口]）→ 属性弹层（文件菜单共口——radix dialog 作用域消歧工具
  // 栏同名保存钮）→ 预填落定 → title 改 甲一 → 保存。
  await page.getByRole('menuitem', { name: '视图' }).click()
  await page.getByRole('menuitem', { name: '快速打开' }).click()
  const input = page.getByPlaceholder('输入标题、别名或路径…')
  await input.fill('Home')
  await rowByPath(quickDialog(page), 'nm/Home.ad').click()
  await expect(visibleEditor(page)).toContainText('普通正文段落', { timeout: 10_000 })
  await page.getByRole('menuitem', { name: '文件' }).click()
  await page.getByText('页面属性…', { exact: true }).click()
  await expect(page.getByText('页面属性', { exact: true })).toBeVisible({ timeout: 10_000 })
  const titleInput = page.getByPlaceholder('标题…')
  await expect(titleInput).toHaveValue('首页', { timeout: 10_000 })
  await titleInput.fill('甲一')
  await page.getByRole('dialog').getByRole('button', { name: '保存', exact: true }).click()
  await expect(page.getByText('页面属性', { exact: true })).toBeHidden({ timeout: 10_000 })

  // 名称目录已随保存失效重取：files 查 甲一 命中（旧 首页 查询 Home 行
  // 消失——alias/正文不含甲一）；过期横幅在 text 结果面出现 → 重新检索
  // 后消解。
  await openQuickOpen(page)
  await input.fill('甲一')
  await expect(rowByPath(quickDialog(page), 'nm/Home.ad')).toBeVisible({ timeout: 10_000 })
  await input.fill('首页')
  await expect(rowByPath(quickDialog(page), 'nm/Home.ad')).toHaveCount(0, { timeout: 10_000 })
  await expect(rowByPath(quickDialog(page), 'wiki/index.ad')).toBeVisible()
  // 关快开层（模态域外菜单不可达——T-03 实勘测试侧纪律）。
  await input.press('Escape')
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0, { timeout: 10_000 })

  await page.getByText('视图', { exact: true }).click()
  await page.getByText('全文检索', { exact: true }).click()
  await expect(page.getByText('结果已过期——请重新检索', { exact: true })).toBeVisible({ timeout: 10_000 })
  const tin2 = page.getByPlaceholder('输入查询词…')
  await tin2.fill('甲一')
  await tin2.press('Enter')
  await expect(tp.getByText('结果已过期——请重新检索', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  await expect(rowByPath(tp, 'nm/Home.ad')).toBeVisible({ timeout: 10_000 })
})
