// reload-safety.spec.ts — PLAN-030 T-04 vue 轨安全手动重载全弧
//（AC-01..06 行为证据；vm 轨对位 = tests/vm_matrix.mjs R 组）。
//
// 覆盖面（不预置中性 blur——T-01 C1 实证逐键同步，plan §6 纪律）：
//   ① 三入口（F5/工具栏/菜单）对未保存页先确认 + 立即输入后 F5；
//   ② 取消：正文/脏标/磁盘全保持；
//   ③ 明确放弃：目标正文=磁盘新文、dirty 清、磁盘字节不动；
//   ④ 干净直入无确认 + untitled 不读空路径 + 合法空文正常加载；
//   ⑤ 缺档：失败提示、正文/脏标保持；
//   ⑥ 迟到结果：read_wiki 拦截延迟 + 等待期新输入 → 旧结果拒覆盖
//      （post-gate 单代码路径——切页/关档同门，vm R 组 + Store 门证据）。
//
// 断言纪律：正文锚全用本测自建标记（相对断言——全量跑时 matrix.spec
// 先行改写同档正文，固定原文锚不成立）；磁盘断言记原始字节。
// ReloadEmpty.ad 于 goto 前创建（树清单 boot 期装配，无外部变更即时刷）。
// 弹层 = Radix AlertDialog（open:false 不渲染 DOM——页内同时仅一弹层
// 钮集，vue 轨无跨弹层「取消」歧义）。fixture 副本工作区随 webServer
// 重建。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { WORKSPACE, appendToEditor, visibleEditor } from './helpers'

const CONFIRM_TEXT = '重载会放弃此文档未保存的修改'
// 专属目标档（全弧隔离——matrix.spec [13 file] 删除弧线会移除 Hello World.ad，
// 套内共享工作区下通用档不作本测依赖；boot 前落位 = 树清单装配窗）。操作域
// 全部收敛本档，磁盘断言记原始字节。
const SAFE_FILE = path.join(WORKSPACE, 'wiki', 'ReloadSafe.ad')
const SAFE_BODY = `# ReloadSafe 头

安全重载正文锚一段。
`
const STALE_TEXT = '文档已变化，请重新发起重载'
/** 草稿结算墓碑计数（drafts 下各 doc 的 s 序列 meta——⑦ 结算弧证据面）。 */
function countSettlements(): number {
  const root = path.join(WORKSPACE, '.auto-jade', 'drafts', 'v1')
  if (!fs.existsSync(root)) return 0
  let n = 0
  for (const d of fs.readdirSync(root)) {
    for (const f of fs.readdirSync(path.join(root, d))) {
      if (/^s\d{5}\.meta$/.test(f)) n += 1
    }
  }
  return n
}

/** 任一检查点正文含标记（⑦ 磁盘前置——确认后再发起放弃）。 */
function markerInCheckpoints(marker: string): boolean {
  const root = path.join(WORKSPACE, '.auto-jade', 'drafts', 'v1')
  if (!fs.existsSync(root)) return false
  for (const d of fs.readdirSync(root)) {
    const dd = path.join(root, d)
    for (const f of fs.readdirSync(dd)) {
      if (/^c\d{5}\.body$/.test(f) && fs.readFileSync(path.join(dd, f), 'utf8').includes(marker)) return true
    }
  }
  return false
}

async function waitFor(cond: () => boolean, label: string, timeoutMs = 10_000) {
  const dl = Date.now() + timeoutMs
  for (;;) {
    if (cond()) return
    if (Date.now() > dl) throw new Error(`timeout: ${label}`)
    await new Promise((r) => setTimeout(r, 200))
  }
}

/** 磁盘 .ad 文本 → body（frontmatter 剥离——vm_matrix bodyOf 同构造）。 */
const bodyOfDisk = (disk: string) =>
  disk.split('---').length >= 3 ? disk.split('---').slice(2).join('---').replace(/^\n/, '') : disk

test('reload safety（PLAN-030 全弧）', async ({ page }) => {
  test.setTimeout(240_000)
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  page.on('response', (r) => {
    if (r.url().includes('/api/draft_')) console.log(`    [draft-api] ${r.status()} ${r.request().method()} ${r.url().slice(-40)}`)
  })

  // 素材：boot 前落位（树清单 boot 期装配）——专属目标档 + 空文素材。
  const emptyFile = path.join(WORKSPACE, 'wiki', 'ReloadEmpty.ad')
  fs.rmSync(SAFE_FILE, { force: true })
  fs.writeFileSync(SAFE_FILE, SAFE_BODY)
  fs.writeFileSync(emptyFile, '')

  await page.goto('/')
  await expect(page.getByText('AutoJade', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('ReloadSafe', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('安全重载正文锚一段', { timeout: 10_000 })

  // —— ①a 连续输入后立即 F5（焦点在编辑器，无 blur）→ 确认弹层；
  // 提示前不读盘（正文未被磁盘覆盖）、不清脏（AC-01 F5 臂）。——
  await appendToEditor(page, 'LOCAL_A安全重载探针')
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('LOCAL_A安全重载探针')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()

  // —— ①b 取消：弹层关 + 正文/脏标/磁盘全保持（AC-02）。——
  const diskBefore = fs.readFileSync(SAFE_FILE, 'utf8')
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByText(CONFIRM_TEXT)).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('LOCAL_A安全重载探针')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  expect(fs.readFileSync(SAFE_FILE, 'utf8')).toBe(diskBefore)

  // —— ①c 工具栏入口：磁盘外改 → 重载 → 确认 → 放弃修改并重载 →
  // 目标正文=磁盘新文（本地未保存输入随放弃让位）+ dirty 清
  //（AC-01 工具栏臂 + AC-03）。——
  fs.appendFileSync(SAFE_FILE, '\nDISK_B外部重载标记\n')
  await page.locator('button[title="重载"]').click()
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '放弃修改并重载', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('DISK_B外部重载标记', { timeout: 15_000 })
  await expect(visibleEditor(page)).not.toContainText('LOCAL_A安全重载探针')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeHidden({ timeout: 10_000 })

  // —— ①d 菜单入口：弄脏 → 视图菜单 → 重载 → 确认弹层 → 取消
  //（AC-01 菜单臂；取消零落盘）。——
  await appendToEditor(page, ' MENU脏标')
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('重载', { exact: true }).click()
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('MENU脏标')
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByText(CONFIRM_TEXT)).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('MENU脏标')
  const diskMenu = fs.readFileSync(SAFE_FILE, 'utf8')
  expect(diskMenu).toBe(diskBefore + '\nDISK_B外部重载标记\n')

  // —— ③ 放弃落盘对账：再走一次放弃，正文=磁盘、磁盘字节不动
  //（AC-03 磁盘字节；此后 diskMenu 即本测磁盘基准）。——
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '放弃修改并重载', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('DISK_B外部重载标记', { timeout: 15_000 })
  await expect(visibleEditor(page)).not.toContainText('MENU脏标')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeHidden({ timeout: 10_000 })
  expect(fs.readFileSync(SAFE_FILE, 'utf8')).toBe(diskMenu)
  const bodyAtDiscard = bodyOfDisk(diskMenu)

  // —— ④a 干净直入（无确认）：外部再改 → F5 直读（AC-04）。——
  fs.appendFileSync(SAFE_FILE, '\nDISK_C干净直入标记\n')
  await page.keyboard.press('F5')
  await expect(visibleEditor(page)).toContainText('DISK_C干净直入标记', { timeout: 15_000 })
  await expect(page.getByText(CONFIRM_TEXT)).toBeHidden()

  // —— ④b untitled：不读空路径、无弹层、可读提示（AC-04）。untitled
  // 分支与脏无关（path=="" 即提示）；空档键入不可落点 = 上游引擎空文
  // 档渲染行为，非本项范围（vm 轨经 INPUT_TEXT 口覆盖脏 untitled 形）。——
  await page.locator('button[title="新建"]').click()
  await expect(page.getByText('未命名', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await expect(visibleEditor(page)).toBeVisible({ timeout: 10_000 })
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeHidden({ timeout: 5_000 })
  await expect(page.getByText('请先保存此文档').first()).toBeVisible({ timeout: 10_000 })
  // 收尾：untitled 干净关闭（x 即闭，无确认）。
  await page.locator('button:has(svg.lucide-xicon)').first().click()
  await expect(page.getByText('未命名', { exact: true }).first()).toBeHidden({ timeout: 10_000 })

  // —— ④c 合法空文：打开空档（加载成功、无失败误判、干净）→ 外部写 →
  // F5 直读（空文干净直入，AC-04 空文臂）。——
  await page.getByText('ReloadEmpty', { exact: true }).first().click()
  await expect(visibleEditor(page)).toBeVisible({ timeout: 10_000 })
  await expect(visibleEditor(page)).not.toContainText('空文件外部写入标记')
  await expect(page.getByText('重载失败').first()).toBeHidden()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeHidden()
  fs.writeFileSync(emptyFile, '空文件外部写入标记\n')
  await page.keyboard.press('F5')
  await expect(visibleEditor(page)).toContainText('空文件外部写入标记', { timeout: 15_000 })
  // 收尾：关 Empty 档（干净即闭）+ 删档。tab 断言锚 tab 条区（树行同名
  // 档在删档前恒在——tabBtn 区域锚 matrix 同款）。
  await page.locator('button:has(svg.lucide-xicon)').first().click()
  await expect(page.locator('button[class*="h-8 px-3"]', { hasText: 'ReloadEmpty' })).toBeHidden({ timeout: 10_000 })
  fs.rmSync(emptyFile)

  // —— ⑤ 缺档：弄脏 → 删档 → F5 → 确认 → 放弃 → 失败提示 + 正文/
  // 脏标保持（AC-05）。④c 收尾已关 Empty 档——活动档回落 ReloadSafe。——
  await expect(page.locator('button[class*="h-8 px-3"]', { hasText: 'ReloadSafe' })).toBeVisible({ timeout: 10_000 })
  await page.locator('button[class*="h-8 px-3"]', { hasText: 'ReloadSafe' }).click()
  await expect(visibleEditor(page)).toContainText('DISK_B外部重载标记', { timeout: 10_000 })
  await appendToEditor(page, ' MISSING探针')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  fs.rmSync(SAFE_FILE)
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '放弃修改并重载', exact: true }).click()
  await expect(page.getByText('重载失败：文件已不存在').first()).toBeVisible({ timeout: 15_000 })
  await expect(visibleEditor(page)).toContainText('MISSING探针')
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  // 恢复：按 tab 已知正文重建磁盘（fm 前缀 + 正文——③ 后正文 + MISSING
  // 探针）→ 放弃重载 → 干净（正文不变，基准复原）。
  const fmPart = diskMenu.slice(0, diskMenu.indexOf(bodyAtDiscard))
  fs.writeFileSync(SAFE_FILE, fmPart + bodyAtDiscard + ' MISSING探针')
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '放弃修改并重载', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('MISSING探针', { timeout: 15_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeHidden({ timeout: 10_000 })

  // —— ⑥ 迟到结果：read_wiki 拦截延迟 + 等待期新输入 → 旧结果拒覆盖、
  // 当前正文保持、提示重发（AC-06；post-gate 单门——切页/关档同径）。——
  await page.route('**/api/read_wiki', async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.continue()
  })
  await page.keyboard.press('F5') // clean 直入——读在途
  await page.waitForTimeout(300)
  await appendToEditor(page, ' LATE迟到输入')
  await expect(visibleEditor(page)).toContainText('LATE迟到输入')
  await expect(visibleEditor(page)).toContainText('LATE迟到输入', { timeout: 15_000 }) // 迟到回执落地后仍未被覆盖
  await expect(page.getByText(STALE_TEXT).first()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  await page.unroute('**/api/read_wiki')

  // —— ⑦ 放弃重载的草稿结算成功弧（PLAN-031 T-05）：当前档（⑥ 的
  // LATE 输入已脏）+ **磁盘前置**（标记已入检查点再发起——排除在途
  // 竞态）；放弃并重载 → 结算被放弃草稿（墓碑 +1）→ 正文=磁盘新文、
  // dirty 清（§5.4 表第八行正半）。切档后新编辑器实例键入不落地为上
  // 游 remount/focus 边界（实勘），故本弧不切档。——
  await waitFor(() => markerInCheckpoints('LATE迟到输入'), '⑥ 标记入检查点', 15_000)
  const tombsBefore = countSettlements()
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '放弃修改并重载', exact: true }).click()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeHidden({ timeout: 15_000 })
  await waitFor(() => countSettlements() >= tombsBefore + 1, '⑦ 墓碑+1', 15_000)

  // —— ⑧ 结算失败不提交（T-05）：draft_settle 拦截失败 → 正文/脏标
  // 保持、提示可见、不因结算失败假重载（§5.4 表第八行负半）。——
  await appendToEditor(page, 'SETTLEFAIL探针')
  await waitFor(() => markerInCheckpoints('SETTLEFAIL探针'), '⑧ 标记入检查点', 15_000)
  await page.route('**/api/draft_settle', async (route) => {
    await route.fulfill({ status: 500, body: 'settle blocked' })
  })
  await page.keyboard.press('F5')
  await expect(page.getByText(CONFIRM_TEXT)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '放弃修改并重载', exact: true }).click()
  await expect(page.getByText('草稿结算失败——重载未执行（正文保持）')).toBeVisible({ timeout: 15_000 })
  await expect(visibleEditor(page)).toContainText('SETTLEFAIL探针', { timeout: 10_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  await page.unroute('**/api/draft_settle')
})
