// draft-recovery.spec.ts — PLAN-031 T-04 定向 e2e（vue 轨用户路径）：
// 状态栏提示入口 / 恢复副本全弧 / 明确放弃 / 面板关闭保留 / 空文副本 /
// 来源状态三态。草稿经 Node fs 直种工作区（后端按需读盘——serve-back
// 重建配方不构成恢复证明面，重启矩阵归 tests/draft_recovery_matrix.mjs）。
// 启动树为折叠设计（matrix.spec 同款：ready 后展开 wiki 目录）。
import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { visibleEditor, WORKSPACE, TARGET_FILE, appendToEditor } from './helpers'

const DRAFTS = path.join(WORKSPACE, '.auto-jade', 'drafts', 'v1')
const sha = (s: string) => crypto.createHash('sha256').update(Buffer.from(s, 'utf8')).digest('hex')
const bodyOf = (disk: string) =>
  disk.split('---').length >= 3 ? disk.split('---').slice(2).join('---').replace(/^\n/, '') : disk

/** 种一份合法检查点记录（T-01 定谳 meta 形——len 字符/slen 字节/sha hex）。 */
function seedDraft(doc: string, opts: { path?: string; name: string; body: string; orig?: string; erev?: number }) {
  const body = opts.body
  const orig = opts.orig ?? ''
  const erev = opts.erev ?? 1
  const dir = path.join(DRAFTS, doc)
  // 先清目录（重跑隔离——上轮墓碑残留会被 settle_erev 门正确排除）
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'c00001.body'), body, 'utf8')
  fs.writeFileSync(path.join(dir, 'c00001.orig'), orig, 'utf8')
  const meta = [
    'schema=1',
    `doc=${doc}`,
    'event=checkpoint',
    'epoch=1',
    `erev=${erev}`,
    `len=${[...body].length}`,
    `leno=${[...orig].length}`,
    `slen=${Buffer.byteLength(body, 'utf8')}`,
    `sleno=${Buffer.byteLength(orig, 'utf8')}`,
    `sha=${sha(body)}`,
    `shao=${sha(orig)}`,
    `path=${opts.path ?? ''}`,
    `name=${opts.name}`,
    'at=2026-09-30 12:00:00',
    '',
  ].join('\n')
  fs.writeFileSync(path.join(dir, 'c00001.meta'), meta, 'utf8')
}

/** 启动（matrix.spec 同款——boot 树折叠：ready 后展开 wiki 目录）。 */
async function boot(page: Page) {
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15000 })
  await page.getByText('wiki', { exact: true }).first().click()
}

/** 经视图菜单开待恢复面板（非模态入口——状态栏提示 + 菜单，T-04 定形）。 */
async function openRecoverPanel(page: Page) {
  await expect(page.getByText('待恢复草稿（视图菜单查看）')).toBeVisible()
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('待恢复草稿', { exact: true }).last().click()
  await expect(page.getByText('上次会话未正常关闭的草稿')).toBeVisible()
}

/** 行内按钮（行名唯一锚——行容器 = 同时含行名与目标钮的最内层 div）。 */
async function clickRowButton(page: Page, rowName: string, label: string) {
  const row = page
    .locator('div')
    .filter({ has: page.getByText(rowName, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: label }) })
    .last()
  await row.getByRole('button', { name: label }).click()
}

async function waitFor(pred: () => boolean, label: string, timeoutMs = 12000) {
  const dl = Date.now() + timeoutMs
  for (;;) {
    if (pred()) return
    if (Date.now() > dl) throw new Error(`timeout: ${label}`)
    await new Promise((r) => setTimeout(r, 200))
  }
}

test.describe('draft recovery（PLAN-031 T-04）', () => {
  test('恢复副本全弧：提示入口 → 恢复副本 → 副本编辑确认 → 来源结算消费', async ({ page }) => {
    const marker = 'T04-RECOVER-FULL-恢复弧标记'
    // 原文件与草稿正文一致 = intact 面（种当前磁盘 body——read_wiki 剥
    // frontmatter 后对照）
    const disk = fs.readFileSync(TARGET_FILE, 'utf8')
    seedDraft('d9201', { path: 'wiki/Hello World.ad', name: '恢复目标甲', body: bodyOf(disk) })

    await boot(page)
    await openRecoverPanel(page)
    await expect(page.getByText('恢复目标甲', { exact: true })).toBeVisible()
    await expect(page.getByText('原文件未变')).toBeVisible()

    // 恢复副本 → 独立身份新 tab（需另存），原文件不动；来源在副本检查
    // 点确认前保留（面板行仍在——模态面板先关再编辑）
    await clickRowButton(page, '恢复目标甲', '恢复副本')
    // 编辑器 = 富渲染面（markdown 语法不现裸字——matrix 同款正文锚）
    await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15000 })
    await expect(page.getByText('恢复目标甲（恢复副本）').first()).toBeVisible()
    expect(fs.readFileSync(TARGET_FILE, 'utf8')).toBe(disk)
    await expect(page.getByText('恢复目标甲', { exact: true }).first()).toBeVisible()

    await page.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(page.getByText('上次会话未正常关闭的草稿')).toBeHidden()

    // 副本编辑 → 首检确认 → 来源 recovered 结算（link=副本身份）
    await appendToEditor(page, marker)
    await waitFor(() => {
      const t = path.join(DRAFTS, 'd9201', 's00001.meta')
      return fs.existsSync(t) && /event=recovered/.test(fs.readFileSync(t, 'utf8'))
    }, '来源 recovered 墓碑')
    expect(fs.readFileSync(path.join(DRAFTS, 'd9201', 's00001.meta'), 'utf8')).toMatch(/link=d\d+/)
    expect(fs.readFileSync(TARGET_FILE, 'utf8')).toBe(disk)
  })

  test('明确放弃 + 面板关闭保留：放弃行结算、余行保留、菜单重开仍在', async ({ page }) => {
    seedDraft('d9202', { path: 'wiki/Tasks.ad', name: '放弃目标乙', body: '放弃弧草稿内容\n' })
    seedDraft('d9203', { path: '', name: '保留目标丙', body: '保留弧草稿内容\n' })

    await boot(page)
    await openRecoverPanel(page)
    await expect(page.getByText('放弃目标乙', { exact: true })).toBeVisible()
    await clickRowButton(page, '放弃目标乙', '放弃草稿')
    await expect(page.getByText('放弃目标乙', { exact: true })).toHaveCount(0, { timeout: 10000 })
    await waitFor(() => {
      const t = path.join(DRAFTS, 'd9202', 's00001.meta')
      return fs.existsSync(t) && /event=discarded/.test(fs.readFileSync(t, 'utf8'))
    }, '放弃墓碑')

    // 关闭面板不丢记录（AC-06）；菜单重开仍在
    await page.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(page.getByText('上次会话未正常关闭的草稿')).toBeHidden()
    expect(fs.existsSync(path.join(DRAFTS, 'd9203', 'c00001.body'))).toBe(true)
    await openRecoverPanel(page)
    await expect(page.getByText('保留目标丙', { exact: true })).toBeVisible()
    await expect(page.getByText('放弃目标乙', { exact: true })).toHaveCount(0)
  })

  test('来源状态三态 + 空文副本：changed/missing 标注、空文恢复不吞来源', async ({ page }) => {
    seedDraft('d9204', { path: 'wiki/Hello World.ad', name: '变化目标丁', body: '与磁盘不一致的草稿正文\n' })
    seedDraft('d9205', { path: 'wiki/不存在.ad', name: '缺失目标戊', body: '原文件已删的草稿正文\n' })
    seedDraft('d9206', { path: '', name: '未命名', body: '' })

    await boot(page)
    await openRecoverPanel(page)
    await expect(page.getByText('原文件已变化')).toBeVisible()
    await expect(page.getByText('原文件不存在')).toBeVisible()

    // 空文副本：恢复后 tab 面在、来源行保留（不被 body==original 吞没
    // ——AC-05/06）；恢复动作零原文件创建/改写
    await clickRowButton(page, '未命名', '恢复副本')
    await expect(page.getByText('未命名（恢复副本）').first()).toBeVisible()
    await expect(fs.existsSync(path.join(DRAFTS, 'd9206', 'c00001.body')), '空文来源仍在盘').toBe(true)
    await expect(page.getByText('未命名', { exact: true }).first()).toBeVisible()
    expect(fs.existsSync(path.join(WORKSPACE, 'wiki', '不存在.ad'))).toBe(false)
    expect(fs.readFileSync(path.join(DRAFTS, 'd9204', 'c00001.body'), 'utf8')).toBe('与磁盘不一致的草稿正文\n')
  })
})
