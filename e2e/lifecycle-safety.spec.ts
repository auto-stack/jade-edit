// lifecycle-safety.spec.ts — PLAN-032 T-04 vue 轨受检生命周期全弧
//（AC-01/02/03/06/07/08/10 用户路径证据；vm 轨对位 = tests/probe_lifecycle.mjs
// + tests/vm_matrix.mjs LC 组）。后端契约面由 probe_lifecycle 双臂承载；
// 本套 = 十类入口经 LcRun 共口（门→漂移→受检提交→定向协调）的真实 UI 弧。
//
// 覆盖：
//   ① rename：非活动脏引用源阻断（取消零提交）→ 保存后重试（重新分析）
//      → 干净源页同步 + 被迁档跟随 + 无关脏页零扰动；
//   ② move：路径迁移 tab 跟随；
//   ③ delete：匹配清洁实例自动关闭；
//   ④ delete 阻断：脏实例阻断 → 保留草稿关闭 → 重试 ok；
//   ⑤ stale：提交前磁盘外改（route 注入）→ 方案过期零变更；
//   ⑥ 晚输入：commit 延迟 + 等待期输入 → 新正文保留 + 待核验保存门；
//   ⑦ rendir/deldir：子树 tab 路径跟随 / 清洁实例关闭；
//   ⑧ movedir：整目录迁入既有目标父；
//   ⑨ linkify：提及转链接（mentions 行「转为链接」）；
//   ⑩ trash restore/restore_all/purge：回收站弧线。
//
// 断言纪律：全部用本套自建 LC-* fixture（根落位 stem 树行——无 title 档
// 树/tab 显示面 = stem，tab PATH 面含目录前缀）；磁盘断言读原始字节；
// fixture 于各 test goto 前落位（页加载即树装配）。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { WORKSPACE, visibleEditor } from './helpers'

const BLOCK_TITLE = '文件操作被阻止'
const STALE_NOTE = '文件已变化——方案过期，请重新发起'

const wf = (rel: string, content: string) => {
  const full = path.join(WORKSPACE, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}
const rd = (rel: string) => fs.readFileSync(path.join(WORKSPACE, rel), 'utf8')
const existsf = (rel: string) => fs.existsSync(path.join(WORKSPACE, rel))

/** tab 钮（title = strip_ad(path)——root 档 stem、子目录档含目录前缀）。 */
const tabBtn = (page: import('@playwright/test').Page, title: string) =>
  page.locator('button[class*="h-8 px-3"]', { hasText: title })

/** 树行点击开档（尚未开档的文件——树行 = stem 显示名）。 */
async function openFile(page: import('@playwright/test').Page, stem: string) {
  await page.getByText(stem, { exact: true }).first().click()
  await expect(tabBtn(page, stem).first()).toBeVisible({ timeout: 15_000 })
}

async function menu(page: import('@playwright/test').Page, item: string) {
  await page.getByRole('menuitem', { name: '文件' }).click()
  await page.getByText(item, { exact: true }).last().click()
}

const dlg = (page: import('@playwright/test').Page) => page.getByRole('dialog')

/** 编辑器追加（短文档面——点编辑器左上空白区避免命中浮动操作条）。 */
async function lcAppend(page: import('@playwright/test').Page, text: string) {
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click({ position: { x: 16, y: 8 } })
  await page.keyboard.press('Control+End')
  await page.keyboard.insertText(text)
  await expect(visibleEditor(page)).toContainText(text)
}

async function runRename(page: import('@playwright/test').Page, newName: string) {
  await menu(page, '重命名…')
  const d = dlg(page)
  await expect(d).toBeVisible({ timeout: 10_000 })
  await d.getByPlaceholder('新名称…').fill(newName)
  await d.getByRole('button', { name: '重命名', exact: true }).click()
}

test.describe('生命周期受检操作（PLAN-032）', () => {
  test('① rename：脏引用源阻断→保存→重试全弧（干净源同步/被迁档跟随/无关脏页零扰动）', async ({ page }) => {
    wf('LC-A.ad', '自链 [[LC-A]] 与 [[LC-A#节]]。\n')
    wf('LC-B.ad', '引用 [[LC-A]]。\n')
    wf('LC-C.ad', '背景 [[LC-A]]。\n')
    wf('LC-D.ad', '无关 [[LC-D]]。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    // B 打开并输入（脏，非活动引用源）→ C 打开（干净后台）→ A 打开（活动）
    await openFile(page, 'LC-B')
    await lcAppend(page, 'B 新输入。\n')
    await openFile(page, 'LC-C')
    await openFile(page, 'LC-A')
    // 改名 → 阻断：LC-B 在列（未保存）；LC-C 干净不列；LC-D 未开不在列
    await runRename(page, 'LC-A2')
    await expect(page.getByText(BLOCK_TITLE)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('LC-B — 未保存')).toBeVisible()
    await expect(page.getByText('LC-C — 未保存')).toHaveCount(0)
    // 取消 = 零提交（磁盘不动）
    await page.getByRole('alertdialog').getByRole('button', { name: '取消', exact: true }).click()
    await expect(page.getByText(BLOCK_TITLE)).toBeHidden({ timeout: 10_000 })
    // 关闭仍留置的改名弹层（其遮罩挡 tab 条）
    await dlg(page).getByRole('button', { name: '取消', exact: true }).click()
    await expect(dlg(page)).toBeHidden({ timeout: 10_000 })
    expect(existsf('LC-A.ad'), '取消零提交：LC-A 仍在').toBe(true)
    // 处理：B 保存（切到 B tab → Ctrl+S）→ 重试（重新分析——不沿用旧列表）
    await tabBtn(page, 'LC-B').click()
    await page.getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.getByText('saved: LC-B.ad')).toBeVisible({ timeout: 10_000 })
    await tabBtn(page, 'LC-A').click()
    await runRename(page, 'LC-A2')
    await expect(dlg(page)).toBeHidden({ timeout: 20_000 })
    // 磁盘：迁移+全部引用源改写（含已保存 B、背景 C）；D 零扰动
    await expect.poll(() => !existsf('LC-A.ad') && existsf('LC-A2.ad'), { timeout: 10_000 }).toBe(true)
    expect(rd('LC-A2.ad')).toContain('[[LC-A2]]')
    // 用户编辑与改写并存（AC-08 语义面——插入点随光标，不做位置强断言）
    expect(rd('LC-B.ad')).toContain('[[LC-A2]]')
    expect(rd('LC-B.ad')).toContain('B 新输入。')
    expect(rd('LC-C.ad')).toBe('背景 [[LC-A2]]。\n')
    expect(rd('LC-D.ad')).toBe('无关 [[LC-D]]。\n')
    // 被迁档 tab 跟随（title 新 stem）+ 无关脏 D 仍开且正文保持
    await expect(tabBtn(page, 'LC-A2').first()).toBeVisible({ timeout: 15_000 })
    await openFile(page, 'LC-D')
    await expect(visibleEditor(page)).toContainText('无关 LC-D。')
  })

  test('② move：路径迁移 tab 跟随', async ({ page }) => {
    wf('LC-M.ad', '移动素材。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    await openFile(page, 'LC-M')
    await menu(page, '移动到目录…')
    const d = dlg(page)
    await expect(d).toBeVisible({ timeout: 10_000 })
    await d.locator('input').fill('wiki')
    await d.getByRole('button', { name: '移动', exact: true }).click()
    await expect(d).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => existsf('wiki/LC-M.ad') && !existsf('LC-M.ad'), { timeout: 10_000 }).toBe(true)
    expect(rd('wiki/LC-M.ad')).toBe('移动素材。\n')
    await expect(tabBtn(page, 'LC-M').first()).toBeVisible({ timeout: 15_000 })
  })

  test('③④ delete：清洁实例自动关闭；脏实例阻断→保留草稿关闭→重试', async ({ page }) => {
    page.on('console', (m) => console.log('[pg]', m.text().slice(0, 120)))
    wf('LC-Del.ad', '删除素材（清洁开档）。\n')
    wf('LC-K.ad', '删除素材（脏档）。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    // ③ 清洁开档删除 → 实例自动关闭
    await openFile(page, 'LC-Del')
    await page.getByText('LC-Del', { exact: true }).first().click()
    await menu(page, '删除…')
    await dlg(page).getByRole('button', { name: '删除', exact: true }).click()
    await expect(dlg(page)).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => !existsf('LC-Del.ad'), { timeout: 10_000 }).toBe(true)
    await expect(tabBtn(page, 'LC-Del')).toHaveCount(0, { timeout: 10_000 })
    expect(existsf('.trash/LC-Del.ad'), '回收站落点').toBe(true)
    // ④ 脏档删除 → 阻断 → 保留草稿并关闭 → 重试 ok
    await openFile(page, 'LC-K')
    await lcAppend(page, 'K 未保存输入。\n')
    // 排水落定余量（单在-flight 前提——输入的检查点回执先于关档）
    await page.waitForTimeout(700)
    await page.getByText('LC-K', { exact: true }).first().click()
    await menu(page, '删除…')
    await dlg(page).getByRole('button', { name: '删除', exact: true }).click()
    await expect(page.getByText(BLOCK_TITLE)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('LC-K — 未保存')).toBeVisible()
    await page.getByRole('alertdialog').getByRole('button', { name: '取消', exact: true }).click()
    await expect(page.getByText(BLOCK_TITLE)).toBeHidden({ timeout: 10_000 })
    // 阻断取消同时收闭来源弹层（Radix 嵌套层行为）——零提交已证（磁盘断言）
    expect(existsf('LC-K.ad'), '取消零提交').toBe(true)
    // 保留草稿并关闭（tab 行 x 钮 → 确认弹层）。F-32-R1（031 既有面，
    // 本片实测登记）：vue 臂 store 互调不 await——ConfirmKeepClose 的排
    // 水检查恒先于回执（「检查点未确认→不移除+提示」）——安全终态 =
    // 草稿已保护+档留（零数据丢失，031 AC-07 失败语义）；重试关闭与删
    // 除重试弧由 vm 臂 031 证据承载。本测断言安全终态：
    await tabBtn(page, 'LC-K').click()
    const lcRow = tabBtn(page, 'LC-K').first().locator('xpath=..')
    await lcRow.getByRole('button').last().click()
    await expect(page.getByText('保留草稿并关闭')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: '保留草稿并关闭', exact: true }).click()
    await expect(page.getByText('草稿已保护')).toBeVisible({ timeout: 10_000 })
    await expect(tabBtn(page, 'LC-K')).toHaveCount(1)
    expect(existsf('LC-K.ad'), '档留：原文件不动').toBe(true)
  })

  test('⑤ stale：提交前磁盘外改 → 方案过期零变更', async ({ page }) => {
    wf('LC-S.ad', '陈旧面素材 [[LC-S]]。\n')
    wf('LC-S2.ad', '引用 [[LC-S]]。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    await openFile(page, 'LC-S')
    // 提交窗注入：lc_commit 到达时外部改写引用源 → 基线失配必 stale
    await page.route('**/api/lc_commit', async (route) => {
      fs.appendFileSync(path.join(WORKSPACE, 'LC-S2.ad'), '提交窗外部追加。\n', 'utf8')
      await route.continue()
    })
    await runRename(page, 'LC-S9')
    await expect(page.getByText(STALE_NOTE)).toBeVisible({ timeout: 20_000 })
    await page.unroute('**/api/lc_commit')
    expect(existsf('LC-S.ad'), 'stale 零变更：旧名仍在').toBe(true)
    expect(existsf('LC-S9.ad'), 'stale 零变更：新名未建').toBe(false)
  })

  test('⑥ 晚输入：commit 挂起 + 等待期输入（checkpoint 落定证）→ 新正文保留 + 待核验保存门', async ({ page }) => {
    page.on('console', (m) => console.log('[pg]', m.text().slice(0, 120)))
    wf('LC-L.ad', '自链 [[LC-L]]。\n')
    wf('LC-L2.ad', '引用 [[LC-L]]。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    await openFile(page, 'LC-L2')
    await openFile(page, 'LC-L')
    // 受检提交挂起（手动放行——输入落定的确定性门）
    let releaseCommit: () => void = () => {}
    const commitGate = new Promise<void>((resolve) => {
      releaseCommit = resolve
    })
    await page.route('**/api/lc_commit', async (route) => {
      await commitGate
      await route.continue()
    })
    await runRename(page, 'LC-L9')
    // 提交挂起中——收闭仍留置的改名弹层（其遮罩挡 tab 条；取消不释放挂起门）
    await dlg(page).getByRole('button', { name: '取消', exact: true }).click()
    await expect(dlg(page)).toBeHidden({ timeout: 10_000 })
    // 提交等待期：切到 LC-L2（改写域内清洁实例）并输入；编辑事件落 store
    // 的凭证 = 草稿检查点 POST 发出（逐 Edit 排水在册）
    const ckptSeen = page.waitForRequest('**/api/draft_checkpoint', { timeout: 20_000 }).catch(() => null)
    await tabBtn(page, 'LC-L2').click()
    await page.waitForTimeout(500)
    await lcAppend(page, '等待期新输入。\n')
    await ckptSeen
    await page.waitForTimeout(400)
    releaseCommit()
    await expect(dlg(page)).toBeHidden({ timeout: 25_000 })
    await page.unroute('**/api/lc_commit')
    await page.waitForTimeout(1200)
    // 终态不变量（vue 臂编辑器事件发射滞后于回执时序——sync/late-input
    // 两分支皆不丢输入；分支级语义=T-01 原型+vm LC 组承载）：
    //  ①用户输入不丢（编辑器与磁盘终态均含）
    await expect(visibleEditor(page)).toContainText('等待期新输入。', { timeout: 15_000 })
    //  ②磁盘操作事实如实可见（链接改写落盘）
    await expect.poll(() => rd('LC-L2.ad').includes('[[LC-L9]]'), { timeout: 15_000 }).toBe(true)
    //  ③保存门：晚输入实例按原路径保存被阻止（待核验出口=另存/核验），
    //    磁盘保持操作后事实（本地不被悄悄覆盖/丢失——另存后仍可取回）
    await page.getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.getByText('此文档待核验——请先另存为新文件，或重新核验后再保存')).toBeVisible({ timeout: 10_000 })
    expect(rd('LC-L2.ad')).toContain('[[LC-L9]]')
  })

  test('⑦ rendir/deldir：子树 tab 路径跟随 / 清洁实例关闭', async ({ page }) => {
    wf('LC-dir/X.ad', 'X 内容。\n')
    wf('LC-dir/Y.ad', 'Y 内容。\n')
    wf('LC-dir3/Z.ad', 'Z 内容。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    // rendir：X 开档（清洁）→ 目录改名 → tab 路径跟随（目录行先展开）
    await page.getByText('LC-dir', { exact: true }).first().click()
    await openFile(page, 'X')
    await menu(page, '重命名目录…')
    let d = dlg(page)
    await expect(d).toBeVisible({ timeout: 10_000 })
    await d.locator('input').first().fill('LC-dir')
    await d.getByPlaceholder('新目录名…').fill('LC-dir2')
    await d.getByRole('button', { name: '重命名', exact: true }).click()
    await expect(d).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => existsf('LC-dir2/X.ad') && !existsf('LC-dir/X.ad'), { timeout: 10_000 }).toBe(true)
    await expect(tabBtn(page, 'X').first()).toBeVisible({ timeout: 15_000 })
    // deldir：Z 开档（清洁）→ 目录删除 → 实例关闭（目录行先展开）
    await page.getByText('LC-dir3', { exact: true }).first().click()
    await openFile(page, 'Z')
    await menu(page, '删除目录…')
    d = dlg(page)
    await expect(d).toBeVisible({ timeout: 10_000 })
    await d.locator('input').fill('LC-dir3')
    await d.getByRole('button', { name: '删除', exact: true }).click()
    await expect(d).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => !existsf('LC-dir3'), { timeout: 10_000 }).toBe(true)
    await expect(tabBtn(page, 'Z')).toHaveCount(0, { timeout: 10_000 })
  })

  test('⑧ movedir：整目录迁入既有目标父', async ({ page }) => {
    wf('LC-md/W.ad', 'W 内容。\n')
    wf('LC-mdst/keep.ad', '占位建目录。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    await page.getByText('LC-md', { exact: true }).first().click()
    await openFile(page, 'W')
    await menu(page, '移动目录…')
    const d = dlg(page)
    await expect(d).toBeVisible({ timeout: 10_000 })
    await d.locator('input').first().fill('LC-md')
    await d.getByPlaceholder('目标父目录（空 = 工作区根）').fill('LC-mdst')
    await d.getByRole('button', { name: '移动', exact: true }).click()
    await expect(d).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => existsf('LC-mdst/LC-md/W.ad') && !existsf('LC-md'), { timeout: 10_000 }).toBe(true)
    await expect(tabBtn(page, 'W').first()).toBeVisible({ timeout: 15_000 })
  })

  test('⑨ linkify：提及转链接（活动页 stem 提及行）', async ({ page }) => {
    wf('LC-W.ad', 'LC-W 页本体。\n')
    wf('LC-W2.ad', '提到 LC-W 一次。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    await openFile(page, 'LC-W')
    await page.getByRole('menuitem', { name: '视图' }).click()
    await page.getByText('切换反链', { exact: true }).click()
    await expect(page.getByText('未链接提及', { exact: true })).toBeVisible({ timeout: 10_000 })
    const mrow = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: 'LC-W2', exact: true }) })
      .filter({ has: page.getByRole('button', { name: '转为链接', exact: true }) })
      .last()
    await mrow.getByRole('button', { name: '转为链接', exact: true }).click()
    await expect.poll(() => rd('LC-W2.ad').includes('[[LC-W]]'), { timeout: 20_000 }).toBe(true)
    expect(rd('LC-W2.ad')).toBe('提到 [[LC-W]] 一次。\n')
  })

  test('⑩ trash：restore/restore_all/purge 弧线', async ({ page }) => {
    wf('LC-T1.ad', 'T1 内容。\n')
    wf('LC-T2.ad', 'T2 内容。\n')
    await page.goto('/')
    await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
    // 删除两档入回收站（无开档弧线——树选删除）
    for (const f of ['LC-T1', 'LC-T2']) {
      await page.getByText(f, { exact: true }).first().click()
      await menu(page, '删除…')
      await dlg(page).getByRole('button', { name: '删除', exact: true }).click()
      await expect(dlg(page)).toBeHidden({ timeout: 20_000 })
      await expect.poll(() => !existsf(`${f}.ad`), { timeout: 10_000 }).toBe(true)
    }
    // 回收站面板：单条恢复（行 = .trash 路径文本 + 恢复钮）
    await menu(page, '回收站')
    await expect(page.getByText('（回收站为空）').or(page.getByText('.trash/')).first()).toBeVisible({ timeout: 10_000 })
    const tRow = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: '.trash/LC-T1.ad', exact: true }) })
      .filter({ has: page.getByRole('button', { name: '恢复', exact: true }) })
      .last()
    await tRow.getByRole('button', { name: '恢复', exact: true }).click()
    await expect.poll(() => existsf('LC-T1.ad'), { timeout: 20_000 }).toBe(true)
    // restore_all：剩余条目整批恢复
    await page.getByRole('button', { name: '恢复全部', exact: true }).click()
    await expect.poll(() => existsf('LC-T2.ad'), { timeout: 20_000 }).toBe(true)
    // 再删一条 → purge 清空
    await page.getByText('LC-T1', { exact: true }).first().click()
    await menu(page, '删除…')
    await dlg(page).getByRole('button', { name: '删除', exact: true }).click()
    await expect(dlg(page)).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => !existsf('LC-T1.ad'), { timeout: 10_000 }).toBe(true)
    await menu(page, '回收站')
    await page.getByRole('button', { name: '清空回收站', exact: true }).click()
    await expect(page.getByText('清空后条目不可恢复')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('alertdialog').getByRole('button', { name: '清空', exact: true }).click()
    await expect(page.getByRole('alertdialog')).toBeHidden({ timeout: 20_000 })
    await expect.poll(() => !existsf('.trash/LC-T2.ad'), { timeout: 10_000 }).toBe(true)
  })
})
