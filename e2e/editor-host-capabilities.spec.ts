// editor-host-capabilities.spec.ts — PLAN-034 编辑器宿主能力核验（vue 轨
// 真组件观察面；与 tests/probe_editor_host.mjs merged/split 臂互补——
// 原生 split 前端载体的接口证明不归本套件）。
//
// 相位小案（--grep inventory|save|commands|navigation；PLAN-034 §6）：
//   inventory   载体/入口盘点：引擎 Save 按钮无条件渲染、show-actions/
//               can-edit 落为 DOM attr（EngineEditor defineProps 无此二
//               prop——attr 透传非真消费）、宿主 toolbar 保存入口在册、
//               编辑器 content 面与 data-block-id 公开域。
//   save        引擎 Save 点击零宿主效果（@save 无监听——未接线直证）
//               vs 宿主 toolbar/Ctrl+S 真保存（共 ActSave 门链在册）。
//   commands    六命令宿主入口 = PLAN-035 收口后编辑菜单仅「编辑命令说明…」
//               入口（六执行项移除、说明 dialog 可见反馈替代 console 降级
//               ——C-2 交付面）；Ctrl+Z 引擎内部撤销（宿主 keymap 零路由
//               ——独占不并行）；Ctrl+Shift+O Shift 丢失缺口在录维持。
//   navigation  正文 wiki 链接点击零导航（@open-wiki-link 无监听）+
//               data-block-id 块域稳定面（getBlockMap 公开契约）。
//
// 结果语义：全部断言断「当前真实行为」——预期缺能力案以行为为断言域
// （调查通过、接口尚不可用），不把 no-op 伪装成功能成功。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import { TARGET_FILE, visibleEditor, appendToEditor } from './helpers'

const neutralBlur = (page: import('@playwright/test').Page) =>
  page.getByText('EXPLORER', { exact: true }).click()

test('宿主能力核验·inventory（载体/入口盘点）', async ({ page }) => {
  // boot（matrix.spec 同款：状态行 ready——openApp 的树行锚为旧口径）
  await page.goto('/')
  await expect(page.getByText('JadeEdit', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })

  // 打开一档 → 编辑器 content 面可见（vue 载体真组件挂载）
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  const editorRoot = page.locator('.autodown-editor:visible').first()

  // 引擎动作栏：Save 按钮无条件渲染（:show-actions 未被 defineProps
  // 消费——按钮显隐不受其控制；此处仅证「按钮在」，隐藏能力归 save 相位）
  const engineSave = editorRoot.locator('.autodown-editor-save')
  await expect(engineSave).toBeVisible()
  await expect(engineSave).toHaveText('Save')

  // :show-actions/:can-edit 透传为 DOM attr（生成器 bool_prop_binding
  // 发射 kebab attr；EngineEditor defineProps 无 canEdit/showActions
  // ——Vue 未声明 prop 落为根元素属性，非组件行为开关）
  expect(await editorRoot.getAttribute('show-actions'), 'show-actions 落 DOM attr（attr 透传）').toBe('true')
  expect(await editorRoot.getAttribute('can-edit'), 'can-edit 落 DOM attr（attr 透传）').toBe('true')

  // 宿主保存入口三件在册：toolbar 图标钮（title 锚）+ 菜单文件栏触发器
  // + 编辑菜单触发器（六命令菜单面宿主侧存在性——handler 降级面归
  // commands 相位）
  await expect(page.locator('button[title="保存"]')).toBeVisible()
  await expect(page.getByText('文件', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('编辑', { exact: true }).first()).toBeVisible()

  // 编辑器 content 公开域：data-block-id 块域存在（EDITOR-CONTRACT
  // getBlockMap 公开契约的 DOM 面——selection/cursor 坐标域证据）
  const blockIds = await page.locator('.autodown-editor:visible [data-block-id]').count()
  expect(blockIds, 'data-block-id 块域在（公开块地图 DOM 面）').toBeGreaterThan(0)

  // :key 重挂载播种通道（content 换档面）：切档后 content 跟随
  await page.getByText('Tasks', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  console.log('[inventory] PASS — 引擎 Save 钮无条件渲染 + show-actions/can-edit attr 透传 + 宿主入口在册 + data-block-id 块域 + :key 播种面')
})

test('宿主能力核验·save（引擎 @save 未接线 vs 宿主入口真保存）', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })

  // 脏档（blur 冲刷——D-17 在册机制）
  await appendToEditor(page, ` SAVE引擎钮标记。`)
  await neutralBlur(page)
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  const diskBefore = fs.readFileSync(TARGET_FILE, 'utf8')

  // 引擎动作栏 Save 点击 → @save 无监听：零落盘 + 脏标保（未接线直证
  // ——调查通过、接口尚不可用）
  await page.locator('.autodown-editor:visible .autodown-editor-save').click()
  await page.waitForTimeout(800)
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  expect(fs.readFileSync(TARGET_FILE, 'utf8'), '引擎 Save 点击零磁盘写入（@save 未接线）').toBe(diskBefore)
  console.log('[save] 引擎 Save 钮点击 → 零落盘 + 脏标保（emit 无消费者——供给存在待接线）')

  // 宿主 toolbar 保存 → ActSave 共门链真落盘（脏标清 + 磁盘字节 +
  // 原文保留 + frontmatter 保留）
  await page.locator('button[title="保存"]').click()
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  const diskAfterHost = fs.readFileSync(TARGET_FILE, 'utf8')
  expect(diskAfterHost).toContain('SAVE引擎钮标记。')
  expect(diskAfterHost).toContain('这是一段示例文本')
  expect(diskAfterHost).toContain('title: Hello World')
  console.log('[save] PASS — 宿主 toolbar 保存真落盘（store.Save 读回核验门链在册）')

  // Ctrl+S（编辑器聚焦态真键）→ 宿主 window keymap ActSave：再次真落盘
  await appendToEditor(page, ` S快捷键标记。`)
  await neutralBlur(page)
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+s')
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  expect(fs.readFileSync(TARGET_FILE, 'utf8'), 'Ctrl+S 宿主快捷键真落盘').toContain('S快捷键标记。')
  // 双保存面：引擎 Ctrl+S 无内部绑定（onContentKeydown 仅 undo 族+Ctrl+End）
  // ——单次快捷键单次落盘（标记恰一处）
  const occurrences = (fs.readFileSync(TARGET_FILE, 'utf8').match(/S快捷键标记。/g) ?? []).length
  expect(occurrences, '单次 Ctrl+S 单次落盘（引擎无内部 Ctrl+S——零重复保存）').toBe(1)
  console.log('[save] PASS — Ctrl+S 宿主快捷键真落盘且无引擎双保存面')
})

test('宿主能力核验·commands（菜单收口说明入口 + 引擎内部撤销 + Shift 缺口实录）', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })

  // 真键入字（首挂载实例逐键发射存活——matrix check 8 同款通道）
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type('撤', { delay: 25 })
  await expect
    .poll(async () => /撤\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)

  // 引擎内部撤销（Ctrl+Z 真键——EngineEditor onContentKeydown runHistory；
  // PLAN-035 起宿主 keymap 无 Ctrl+Z 路由——内部撤销独占不并行）
  await page.keyboard.press('Control+z')
  await expect
    .poll(async () => !/撤\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)
  await expect(page.getByText('编辑命令说明', { exact: true })).toHaveCount(0)
  console.log('[commands] 引擎内部 Ctrl+Z 撤销生效（内容复原——vue 轨内部历史栈在册；宿主零截获——无说明弹出）')

  // PLAN-035 收口（C-2）：编辑菜单仅「编辑命令说明…」有效入口——六执行
  // 项移除，旧「菜单可点但零效果」面退役；点击入口 → 可见说明 dialog
  //（替代 console_log 降级——可见不可用反馈）
  await page.getByText('编辑', { exact: true }).first().click()
  await expect(page.getByText('编辑命令说明…', { exact: true })).toBeVisible()
  for (const gone of ['撤销', '重做', '剪切', '复制', '粘贴', '全选']) {
    await expect(page.getByText(gone, { exact: true })).toHaveCount(0)
  }
  await page.getByText('编辑命令说明…', { exact: true }).first().click()
  await expect(page.getByText('编辑命令说明', { exact: true })).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选。正文和输入框仍可使用当前编辑器支持的操作。')).toBeVisible()
  // 新变更仍原样（说明不编辑——zero-effect 面由「内容保持」承载）
  await page.getByText('关闭', { exact: true }).click()
  await expect(page.getByText('编辑命令说明', { exact: true })).toHaveCount(0)
  await expect(visibleEditor(page)).toContainText('这是一段示例文本')
  console.log('[commands] PASS — 编辑菜单收口：六执行项移除+说明入口可见 dialog（console_log 降级面退役——C-2 交付）')

  // Ctrl+A 编辑器内：浏览器原生全选（宿主 keymap 无路由——无并行面），
  // 内容零破坏
  await content.click()
  await page.keyboard.press('Control+a')
  await page.waitForTimeout(400)
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 5_000 })
  await expect(page.getByText('编辑命令说明', { exact: true })).toHaveCount(0)
  console.log('[commands] PASS — Ctrl+A 编辑器内原生全选（宿主零路由）、内容零破坏')

  // 全局热键 Shift 丢失（在录生成器缺口）：Ctrl+Shift+O 组合按 keymap
  // 'Ctrl+o' 命中 ActOpen（vue dialog_open 垫片 ""=取消——无害），
  // 孤页清单面板不开（034 实录缺口维持——不在本片修复范围）
  await page.keyboard.press('Control+Shift+o')
  await page.waitForTimeout(600)
  await expect(page.getByPlaceholder('输入标题、别名或路径…')).toHaveCount(0)
  console.log('[commands] PASS — Ctrl+Shift+O 被 ActOpen 抢占（keymap Shift 丢失在录面）：孤页清单不开、无崩溃（dialog 取消垫片）')
})

test('宿主能力核验·navigation（wiki 链接真实导航 + 块域稳定面）', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  // index.ad（树行显示名 首页）正文含 [[Hello World]]——D-23③ 渲染为
  // 链接 span（autodown-wikilink-label + data-wikilink-title）
  await page.getByText('首页', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 10_000 })
  const link = page.locator('.autodown-editor:visible .autodown-wikilink-label[data-wikilink-title="Hello World"]').first()
  await expect(link).toBeVisible()
  console.log('[navigation] wiki 链接渲染面可见（span.autodown-wikilink-label + data-wikilink-title=Hello World）')

  // **PLAN-036 起真实导航**（旧「@open-wiki-link 无监听零导航」面随接线
  // 退役——调查通过、接口已消费）：点击链接 → resolve→read→NavCommit →
  // Hello World.ad 打开激活（新 tab + 编辑器切换；vue 载体完整事件名消费
  // 直证；旧缺供给模拟证据分域见 probe_editor_host navigation 相位与
  // editor-host-capabilities 规范历史行）
  await link.click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  await expect(page.locator('button[class*="h-8 px-3"]', { hasText: 'Hello World' })).toHaveCount(1)
  console.log('[navigation] PASS — 链接点击真实导航（目标页打开激活——PLAN-036 接线交付；原生轨正文点击仍无通道=上游边界维持）')

  // 块域稳定面（data-block-id——^anchor 显式或 block-<i> 位置回退，同内
  // 容确定性）：切档往返后 id 集稳定
  const idsBefore = await page.locator('.autodown-editor:visible [data-block-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-block-id')))
  expect(idsBefore.length).toBeGreaterThan(0)
  await page.getByText('Tasks', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  await page.getByText('Hello World', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 10_000 })
  const idsAfter = await page.locator('.autodown-editor:visible [data-block-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-block-id')))
  expect(idsAfter, '块域 id 集切档往返稳定（同内容确定性——reveal 定位候选坐标域）').toEqual(idsBefore)
  console.log('[navigation] PASS — data-block-id 块域切档往返稳定（getBlockMap 公开契约 DOM 面；caret/reveal 原语缺口以 probe navigation UNSUPPORTED 行在案）')
})
