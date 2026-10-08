// command-availability.spec.ts — PLAN-035 编辑命令入口真实化（vue 轨真组
// 件观察面；与 tests/probe_command_availability.mjs 原生 merged 臂互补——
// 契约见 docs/plans/attachments/035-command-availability-contract.md）。
//
// 小案（--grep '入口|键程|不变量'）：
//   入口与说明   toolbar 无撤销/重做执行钮（AC-01）、编辑菜单仅「编辑命令
//               说明…」有效入口（六执行项不存在——不依赖 native enabled
//               冻结的显式策略）、说明 dialog 文案逐字冻结（AC-02）、无文
//               档/有文档均可开、关闭仅清旗标且编辑器 key 不变。
//   键程归属     Ctrl+Z/Y 编辑器内部撤销/重做真键生效（引擎历史栈——内部
//               行为不回退 AC-05）；宿主零截获：三键及 Shift 变体全程不
//               开说明 dialog（AC-04）；快开 input Ctrl+A 后替换仅作用
//               input、正文与磁盘保持（AC-05）。
//   不变量       说明开关前后 dirty/save_note（未保存+草稿已保护）原值保
//               持且关闭后仍可见（AC-06/07）；说明开后编辑器继续接收输
//               入（在途输入不丢——AC-06）；Ctrl+S 主保存不回归（AC-08
//               ——磁盘字节直证）。
//
// 结果语义：断言「当前真实行为」——六旧命令不可执行是如实呈现（守卫=
// 可见说明+零编辑），不把 no-op 伪装成功能成功。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import { TARGET_FILE, visibleEditor, appendToEditor } from './helpers'

const HELP_TITLE = '编辑命令说明'
const HELP_DESC = '当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选。正文和输入框仍可使用当前编辑器支持的操作。'
const neutralBlur = (page: import('@playwright/test').Page) =>
  page.getByText('EXPLORER', { exact: true }).click()

async function openHelpViaMenu(page: import('@playwright/test').Page) {
  await page.getByText('编辑', { exact: true }).first().click()
  await page.getByText('编辑命令说明…', { exact: true }).first().click()
  await expect(page.getByText(HELP_TITLE, { exact: true })).toBeVisible({ timeout: 5_000 })
}

async function closeHelp(page: import('@playwright/test').Page) {
  await page.getByText('关闭', { exact: true }).click()
  await expect(page.getByText(HELP_TITLE, { exact: true })).toHaveCount(0)
}

test('命令可用性·入口与说明（toolbar/菜单/dialog 文案与开关）', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // AC-01：toolbar 无撤销/重做执行钮（title 锚——生成面 Button title 属性）
  await expect(page.locator('button[title="撤销"]')).toHaveCount(0)
  await expect(page.locator('button[title="重做"]')).toHaveCount(0)
  // 其余 toolbar 入口保留（保存钮在册）
  await expect(page.locator('button[title="保存"]')).toBeVisible()

  // AC-02 无文档：说明可打开（空态正文区域不变）——文案逐字冻结
  await openHelpViaMenu(page)
  await expect(page.getByText(HELP_DESC)).toBeVisible()
  await expect(page.getByText('没有打开的文档 — 从左侧文件树打开')).toBeVisible()
  await closeHelp(page)
  await expect(page.getByText('没有打开的文档 — 从左侧文件树打开')).toBeVisible()

  // AC-01：编辑菜单仅一个有效入口，六执行项不存在（开菜单逐一负向断言）
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  await page.getByText('编辑', { exact: true }).first().click()
  await expect(page.getByText('编辑命令说明…', { exact: true })).toBeVisible()
  for (const gone of ['撤销', '重做', '剪切', '复制', '粘贴', '全选']) {
    await expect(page.getByText(gone, { exact: true })).toHaveCount(0)
  }
  await page.getByText('编辑', { exact: true }).first().click() // 收起菜单

  // AC-02 有文档：说明开关仅清旗标——编辑器 key 不变（content 元素打标
  // 记后开关：标记存留＝DOM 节点未重挂载——handle 身份比较不可靠，标记
  // 法直证）
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.evaluate((el) => { (el as HTMLElement).dataset.probeMark = 'm1' })
  await openHelpViaMenu(page)
  await expect(page.getByText(HELP_DESC)).toBeVisible()
  await closeHelp(page)
  await expect(content, '编辑器 content 节点恒一（说明开关不重挂载——标记存留）').toHaveAttribute('data-probe-mark', 'm1')
  await expect(visibleEditor(page)).toContainText('这是一段示例文本')
  console.log('[入口] PASS — toolbar 两执行钮移除+菜单单一入口+文案冻结+无/有文档双开+关闭仅清旗标零重挂载')
})

test('命令可用性·键程归属（Ctrl+Z/Y 内部撤销重做、input Ctrl+A 局部、宿主零截获）', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  const diskBefore = fs.readFileSync(TARGET_FILE, 'utf8')

  // AC-05：真键逐字键入（首挂载实例逐键发射存活）→ Ctrl+Z 引擎内部撤销
  // → Ctrl+Y 重做；全程无说明 dialog 弹出（宿主零截获——keymap 三键已删）
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type('撤', { delay: 25 })
  await expect
    .poll(async () => /撤\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)
  await page.keyboard.press('Control+z')
  await expect
    .poll(async () => !/撤\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)
  await expect(page.getByText(HELP_TITLE, { exact: true })).toHaveCount(0)
  console.log('[键程] Ctrl+Z 引擎内部撤销生效（内容复原——vue 轨内部历史栈不回退）')
  await page.keyboard.press('Control+y')
  await expect
    .poll(async () => /撤\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)
  await expect(page.getByText(HELP_TITLE, { exact: true })).toHaveCount(0)
  console.log('[键程] Ctrl+Y 引擎内部重做生效（宿主零截获——帮助旗标未翻）')

  // AC-04：Shift 变体不触发旧编辑 handler（Ctrl+Shift+Z/Y/A——旧 Ctrl+Z/A
  // 映射随 Shift 丢失曾可达；现 keymap 无路由）——零说明弹出、零崩溃
  for (const combo of ['Control+Shift+z', 'Control+Shift+y', 'Control+Shift+a']) {
    await page.keyboard.press(combo)
    await page.waitForTimeout(400)
    await expect(page.getByText(HELP_TITLE, { exact: true })).toHaveCount(0)
  }
  console.log('[键程] PASS — Shift 变体零宿主路由（无说明弹出、无崩溃）')

  // AC-05：快开 input Ctrl+A 后替换仅作用 input——正文与磁盘保持
  //（旧形态宿主 Ctrl+A preventDefault+ActSelectAll 空转；现原生全选归
  // input 自辖）
  await page.keyboard.press('Control+p')
  const findInput = page.getByPlaceholder('输入标题、别名或路径…')
  await expect(findInput).toBeVisible({ timeout: 5_000 })
  await findInput.press('Control+End')
  await findInput.type('Hel', { delay: 20 })
  await expect(findInput).toHaveValue('Hel')
  await findInput.press('Control+a')
  await findInput.type('X', { delay: 20 })
  await expect(findInput, 'input Ctrl+A 后替换仅作用 input').toHaveValue('X')
  await expect(page.getByText(HELP_TITLE, { exact: true })).toHaveCount(0)
  await expect(visibleEditor(page)).toContainText('这是一段示例文本')
  expect(fs.readFileSync(TARGET_FILE, 'utf8'), 'input 键程零磁盘写入').toBe(diskBefore)
  await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click()
  console.log('[键程] PASS — input Ctrl+A 局部全选+替换、正文/磁盘保持、零说明弹出')
})

test('命令可用性·不变量与 save_note 保持（在途输入+共门保存不回归）', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })

  // 脏档（blur 冲刷）→ 未保存 + 草稿已保护注记（save_note 通道基线）
  await appendToEditor(page, ` 说明不变量标记。`)
  await neutralBlur(page)
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('草稿已保护', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  const diskBefore = fs.readFileSync(TARGET_FILE, 'utf8')

  // AC-06/07：说明打开前后——脏态与草稿注记原值保持，关闭后仍可见；磁
  // 盘零写入
  await openHelpViaMenu(page)
  await expect(page.getByText(HELP_DESC)).toBeVisible()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('草稿已保护', { exact: true }).first()).toBeVisible()
  await expect(visibleEditor(page)).toContainText('说明不变量标记。')
  await closeHelp(page)
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('草稿已保护', { exact: true }).first()).toBeVisible()
  expect(fs.readFileSync(TARGET_FILE, 'utf8'), '说明开关零磁盘写入').toBe(diskBefore)
  console.log('[不变量] PASS — 说明开关前后 dirty/save_note 原值保持+磁盘零写入（AC-06/07）')

  // AC-06：说明关闭后编辑器继续接收输入（在途输入不丢——无重挂载）
  await appendToEditor(page, ` 说明后继续输入。`)
  await expect(visibleEditor(page)).toContainText('说明后继续输入。')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()

  // AC-08：Ctrl+S 主保存共门不回归（真落盘+脏标清）
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+s')
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  const diskAfter = fs.readFileSync(TARGET_FILE, 'utf8')
  expect(diskAfter).toContain('说明不变量标记。')
  expect(diskAfter).toContain('说明后继续输入。')
  expect(diskAfter).toContain('title: Hello World')
  console.log('[不变量] PASS — 说明后编辑器继续接收输入+Ctrl+S 主保存真落盘（AC-08 共门不回归）')
})
