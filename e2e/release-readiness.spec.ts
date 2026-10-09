// release-readiness.spec.ts — PLAN-039 发行缺口补充（§6.2 新件：只覆盖旧套件
// 未证明的产品场景——空文输入面 / 清空重输入 / 引擎 Save 假入口阴性 /
// 未编辑空文零磁盘污染）。其余保存/重载/草稿保护面由既有八套件承载，
// 本套不重复。
//
// 修复面（PLAN-039 T-02，SD-03/04）：
//   ① 空文输入起点 = app.at content prop 空态种子表达式
//      （trim(active_body)=="" → "# " + active_title——显示层种子，store
//      正文保持 "" 直到真实输入；引擎 lastEmittedMd 以初始文档播种，挂载
//      期 select 不发射——零 store 污染）。
//   ② 引擎动作栏假 Save 钮隐藏 = app.at 编辑器 style 追加 tailwind 任意
//      变体（[&_.autodown-editor-actions]:hidden）——上游 showActions 非
//      prop（attr 透传）维持上游分列；宿主三真实保存入口不变。
import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { visibleEditor, WORKSPACE } from './helpers'

const EMPTY_PAGE = '空页.ad'
const EMPTY_PATH = path.join(WORKSPACE, 'wiki', EMPTY_PAGE)

/** 应用启动（现行 fixture 形态：wiki/ 子树默认折叠——boot 后手动展开）。 */
async function bootApp(page: Page) {
  await page.goto('/')
  await expect(page.getByText('JadeEdit', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'wiki' }).click()
  await expect(page.getByRole('button', { name: 'Hello World' })).toBeVisible({ timeout: 10_000 })
}

async function openTreeDoc(page: Page, label: string) {
  await page.getByText(label, { exact: true }).first().click()
  await expect(visibleEditor(page)).toBeVisible()
}

test.describe('release-readiness 缺口（PLAN-039）', () => {
  test.beforeEach(async ({ page }) => {
    fs.writeFileSync(EMPTY_PATH, '', 'utf8')
    await bootApp(page)
  })

  test('空页：种子起点可见 → 真实键入 → 保存落盘', async ({ page }) => {
    await openTreeDoc(page, '空页')
    // 种子标题块（显示层）——store 正文未污染：状态栏无「未保存」标记
    await expect(visibleEditor(page)).toContainText('空页')
    await expect(page.getByText('未保存', { exact: true })).toHaveCount(0)

    // 真实键入：点击种子标题块（contenteditable 宿主本身）→ insertText
    //（单 input 事件粘贴语义，helpers 同款——点父容器不聚焦块，块锚点击）
    await visibleEditor(page).locator('[data-block-id]').first().click()
    await page.keyboard.insertText('正文起步标记。')
    await expect(visibleEditor(page)).toContainText('正文起步标记。')
    await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()

    // 工具栏保存 → 磁盘读回含键入内容（AC-02 磁盘对读）
    await page.locator('button[title="保存"]').click()
    await expect.poll(() => fs.readFileSync(EMPTY_PATH, 'utf8')).toContain('正文起步标记。')
  })

  test('清空全文后可重输入（种子回归·真清空对读）', async ({ page }) => {
    await openTreeDoc(page, 'Hello World')
    const target = path.join(WORKSPACE, 'wiki', 'Hello World.ad')
    // 先落一个基线标记（真清空判据锚——清空后磁盘不得再含它）
    await visibleEditor(page).locator('[data-block-id]').first().click()
    await page.keyboard.press('Control+End')
    await page.keyboard.insertText('清空前基线标记。')
    await page.locator('button[title="保存"]').click()
    await expect.poll(() => fs.readFileSync(target, 'utf8')).toContain('清空前基线标记。')
    // 真实清空路径：编辑器 select-all = 逐块 contenteditable 宿主的浏览器
    // 原生面（editor-command-availability §1.2 在册）——Ctrl+A 只清聚焦块，
    // **逐块退格**才是全清用户路径（块底退格=跨块合并，退格至空 = 引擎保留
    // 单空块或零块；两者均落种子回归）。
    await visibleEditor(page).locator('.autodown-editor-content').click()
    await page.keyboard.press('Control+End')
    for (let i = 0; i < 400; i++) await page.keyboard.press('Backspace')
    // 清空后种子回归（标题块）——重输入面恢复
    await expect(visibleEditor(page)).toContainText('Hello World')
    // 重输入 → 保存 → 磁盘含新标记且不再含基线标记（真清空证明）
    await visibleEditor(page).locator('[data-block-id]').first().click()
    await page.keyboard.insertText('清空重输入标记。')
    await expect(visibleEditor(page)).toContainText('清空重输入标记。')
    await page.locator('button[title="保存"]').click()
    await expect.poll(() => {
      const t = fs.readFileSync(target, 'utf8')
      return t.includes('清空重输入标记。') && !t.includes('清空前基线标记。') ? 'cleared' : t.slice(-120)
    }).toBe('cleared')
  })

  test('引擎动作栏假 Save 钮不可见（宿主真实入口保持）', async ({ page }) => {
    await openTreeDoc(page, 'Hello World')
    // 假入口阴性：动作栏 display:none（DOM 恒渲染、视觉不可达——上游
    // emit('save') 无消费假入口下线，SD-03）
    await expect(visibleEditor(page).locator('.autodown-editor-actions')).toBeHidden()
    // 宿主真实入口保持：工具栏保存钮在
    await expect(page.locator('button[title="保存"]')).toBeVisible()
  })

  test('未编辑空文零磁盘污染', async ({ page }) => {
    await openTreeDoc(page, '空页')
    await expect(visibleEditor(page)).toBeVisible()
    // 不键入不保存 → 磁盘保持 0 字节（空文合法读回，editor-safety §1）
    await page.waitForTimeout(600)
    expect(fs.statSync(EMPTY_PATH).size).toBe(0)
  })
})
