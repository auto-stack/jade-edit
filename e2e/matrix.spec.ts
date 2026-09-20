// matrix.spec.ts — PLAN-081 T-06：vue 轨六检查（同一检查单——与
// tests/vm_matrix.mjs 逐条对应；断言域 = 结构/文本/磁盘字节，非像素）。
//
//   1 boot    应用可达，Init → list_files 成功（状态行 ready）
//   2 tree    filetree 列出 fixture wiki 文件
//   3 open    打开 .ad 进 AutoDownEditor（内容渲染可见）
//   4 edit    编辑回写（追加输入 → ● unsaved）
//   5 save    保存落盘（press 保存 → 脏标清 + 磁盘字节 + frontmatter 保留）
//   6 reload  重载可见（磁盘外改 → press 重载 → 编辑器见新内容）
//
// 单 test：六检查为同一文档上的连续状态（vm 矩阵单进程流的 playwright
// 对应——playwright 每 test 新页面，串行 describe 不保状态延续）。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import {
  EDIT_MARKER,
  RELOAD_MARKER,
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
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  console.log('[4 edit] PASS — 追加输入 → StatusBar 未保存')

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
})
