// helpers.ts — vue 轨六检查共享件（jade front e2e helpers 形态的最小集）。
import { expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/** run-back 隔离 fixture 工作区（playwright webServer 启动时重建）。 */
export const WORKSPACE = path.join(repoRoot, 'e2e', '.runtime', 'workspace')
export const TARGET_FILE = path.join(WORKSPACE, 'wiki', 'Hello World.ad')

export const EDIT_MARKER = 'jade-edit 冒烟标记：编辑回写可见。'
export const RELOAD_MARKER = '外部重载标记：重载可见。'
export const TARGET_LABEL = 'Hello World.ad'
// 扩单三组（PLAN-002 T-01）——与 tests/vm_matrix.mjs 同名常量同源
export const TAB_MARKER = 'tab 面标记：脏档关闭确认。'
export const QUIT_MARKER = '退出存盘标记：QuitSaveClose 落盘。'

/** 当前可见（活动）的 AutoDown 编辑器实例。 */
export function visibleEditor(page: Page) {
  return page.locator('.autodown-editor:visible').first()
}

/** 打开应用并等首屏（状态行 ready + 文件树首文件可见）。 */
export async function openApp(page: Page) {
  await page.goto('/')
  await expect(page.getByText('index.ad', { exact: true }).first()).toBeVisible()
}

/** 文档末尾追加文本（jade e2e appendToEditor 同款：click + Ctrl+End + 逐字）。 */
export async function appendToEditor(page: Page, text: string) {
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type(text, { delay: 25 })
  await expect(visibleEditor(page)).toContainText(text)
}

/** fixture 全部 .ad 文件名（断言域与 vm 矩阵同源：磁盘真值）。 */
export function fixtureAdNames(): string[] {
  return fs.readdirSync(path.join(WORKSPACE, 'wiki')).filter((f) => f.endsWith('.ad'))
}

/** 语料档显示名（磁盘 frontmatter title 直读——tree/快开行显示面与
 *  dtitle_of 同源已知答案；无 title = **stem**——back dtitle 缺省=stem
 *  装配定值，G1 口径「无 title 档四面显示 stem」；PLAN-013 T-04）。 */
export function displayTitleOf(file: string): string {
  const m = fs.readFileSync(path.join(WORKSPACE, 'wiki', file), 'utf8').match(/^title: (.*)$/m)
  return m ? m[1].trim() : file.replace(/\.ad$/, '')
}
