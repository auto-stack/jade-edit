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
//   commands    六命令宿主入口 = 菜单/快捷键→console 降级（内容零变化
//               ——宿主命令桥缺供给直证）；Ctrl+Z 引擎内部撤销与宿主
//               ActUndo 并行（互不干扰实录）。
//   navigation  正文 wiki 链接点击零导航（@open-wiki-link 无监听）+
//               data-block-id 块域稳定面（getBlockMap 公开契约）。
//
// 结果语义：全部断言断「当前真实行为」——预期缺能力案以行为为断言域
// （调查通过、接口尚不可用），不把 no-op 伪装成功能成功。
import { expect, test } from '@playwright/test'
import { visibleEditor } from './helpers'

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
