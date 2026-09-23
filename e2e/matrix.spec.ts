// matrix.spec.ts — PLAN-081 T-06：vue 轨检查单（同一检查单——与
// tests/vm_matrix.mjs 逐条对应；PLAN-002 T-01 扩三组同步；断言域 =
// 结构/文本/磁盘字节，非像素）。
//
//   1 boot    应用可达，Init → list_files 成功（状态行 ready）
//   2 tree    filetree 列出 fixture wiki 文件
//   3 open    打开 .ad 进 AutoDownEditor（内容渲染可见）
//   4 edit    编辑回写（追加输入 → ● unsaved）
//   5 save    保存落盘（press 保存 → 脏标清 + 磁盘字节 + frontmatter 保留）
//   6 reload  重载可见（磁盘外改 → press 重载 → 编辑器见新内容）
//   7 tab     tab 面：开两档 → 切换（active 断言 + 内容互换）→ dirty 档
//             关闭确认两路（取消=档留；直接关闭=弃改落盘零写入）
//   8 editops 编辑操作族：段中回车/退格（真键盘 + caret 定位达成同语义）
//   10 link   链接索引+反链面板（PLAN-003；vm 矩阵 check 10/10b 同单——
//             ASCII 路径导航；CJK 目标子步 vm merged 专属（HTTP GET query
//             UTF-8 解码缺口 D-19，vue 轨同败故跳过）
//   10c create 悬空建页弧线（PLAN-005；vm 矩阵 10c 同单）：ASCII 悬空源
//             档测试内造（write_wiki POST——语料悬空目标 CJK 受 D-19 开档
//             面，ASCII 造档 = 全弧线全臂可跑，零语料改动）——悬空行点击
//             → 确认弹层三断言 → 取消零落盘 → 创建 → 开新档（模板播种）
//             → 树新行 → 面板翻转 → 模板逐字节
//   11 find   查找面板双模式（PLAN-004；vm 矩阵 check 11 同单）：快开
//             （文件模式——空 q 全量/过滤 Pro→Projects/拾取即关）+ 全文
//             检索（text 模式——未运行提示/CJK 查询「任务列表」[POST 通道
//             ——D-19 面无，vue 臂无 GET query 环节]/行导航面板保持开/
//             运行后空态）。入口 = 视图菜单项（键位面 = 真键盘，e2e 不
//             覆盖）；检索触发 = 检索钮（契约底线；Enter @keyup.enter
//             随 fill() 不发 keyup 不覆盖——按钮面已证触发链）。
//             执行序在 10 后 9 前（先关反链面板——find 行断言免反链行
//             文本重叠）
//   12 rename 重命名+反链改写全弧线（PLAN-006；vm 矩阵 check 12 同单，
//             七子步——禁用态 untitled+脏档[handler 守卫，弹层不开]/
//             弹层锚[预填+影响面预览]/取消零落盘/改名弧线[active/tab
//             更新+磁盘改写 index·CAP 定理]/面板+树新 stem/case-only 拒
//             [弹层留置+casefold 计数]/状态复原。素材 Projects.ad ASCII
//             ——D-19 面无；vue Dialog 闭态=卸载（radix-vue——vm 恒渲染
//             的轨内差异，断言以 visible/hidden 表达））。执行序在 11 后
//             9 前
//   9 quit    退出存盘：dirty → 退出入口 → CloseRequest 确认弹层 →
//             QuitSaveClose → 磁盘三验（原文/标记/frontmatter）。
//             进程退出断言仅 vm 附注——vue 轨 Process.exit = 垫片 no-op
//             （D-13），弹层闭态不复位属该形态的已知后果，不断言。
//   13 file   树文件管理全弧线（PLAN-007；vm 矩阵 check 13 同单收敛
//             为 vue DOM 断言域：新建[＋钮→dialog fill→创建→模板逐
//             字节+树行+编辑器播种]/同名幂等[tab 不重复+磁盘不变]/
//             取消零落盘/删除弧线[弹层锚 3 处入链已知答案+1 tab 警示
//             →取消零落盘→确认→磁盘消失+tab 关闭+树行消失]/悬空翻转
//             [开 index→出链行 Hello World（悬空）——PLAN-003 已知
//             答案反向]。执行序在 9 quit 后（段内最后——删除素材
//             Hello World.ad = quit 检查目标档，先 quit 后删保三验
//             面；vue quit = 垫片 no-op 无进程终止，段序无 vm 侧约束
//             ）。删除素材取 ASCII 档 Hello World——其入链/出链面
//             ASCII 安全；CJK 导航面 vm merged 专属（D-19——vue 轨
//             GET query 同败，新页 CJK 案不设）。无键位面（Delete
//             键 = 真键盘，e2e 不覆盖——11/12 同口径，入口 = 文件
//             菜单→删除…）。
//   14 meta   标签面板+wanted 模式（PLAN-008；vm 矩阵 check 14 同单
//             ——段内最后）：tags 4 行已知答案[13 后位态]+展开导航+
//             write_wiki 外造 Save 刷新；wanted 无 input 三行清单
//             [首页（1）/页面名（1）/CAP 定理（2）——语料实勘全集
//             【执行期校正：页面名亦悬空】]/取消零落盘/创建开档模板
//             逐字节/消缺/空态闭环（无悬空链接）/exists 翻转。建页
//             全走 POST body CJK 已证面——无 vm 侧 D-19 分野。执行序
//             在 13 后（段内最后——13 已定删除面，此位已知答案成立）。
//
// D-17 冲刷机制（vue 轨特有，7/8/9 共用）：切档重挂载后的编辑器实例，
// 键入只进引擎模型、update:modelValue 门控至 blur——中性 blur（点
// EXPLORER 头）= 确定性冲刷；断言语义与 vm 同单，冲刷为轨内机制差异。
//
// 单 test：检查单为同一文档上的连续状态（vm 矩阵单进程流的 playwright
// 对应——playwright 每 test 新页面，串行 describe 不保状态延续）。
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import {
  WORKSPACE,
  EDIT_MARKER,
  QUIT_MARKER,
  RELOAD_MARKER,
  TAB_MARKER,
  TARGET_FILE,
  TARGET_LABEL,
  appendToEditor,
  fixtureAdNames,
  visibleEditor,
} from './helpers'

test('vue 六检查（vm 矩阵同单）', async ({ page, request }) => {
  page.on('response', (r) => {
    if (r.url().includes('/api/')) {
      console.log(`    [api] ${r.status()} ${r.request().method()} …${r.url().slice(-45)}`)
      if (r.status() >= 400) r.text().then((t) => console.log('    [api-err-body]', t.slice(0, 300))).catch(() => {})
    }
  })
  page.on('pageerror', (e) => console.log(`    [pageerror] ${String(e).slice(0, 200)}`))
  // D-17 中性 blur 冲刷件（vue 轨机制；7/8/9 及 4→5 保存赛跑规避共用）
  const neutralBlur = () => page.getByText('EXPLORER', { exact: true }).click()

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
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  console.log('[4 edit] PASS — 追加输入 → StatusBar 未保存（blur 冲刷后 store 落定，规避保存点击 blur-flush 与 Save 竞态）')

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

  // 7 tab 面（开两档 → 切换互换 → dirty 关闭确认两路；vm 矩阵 check 7 同单）。
  // 执行序适配（D-17）：vue 轨先做 check 8（编辑操作族须在首挂载实例上——
  // 其逐键发射存活），再进 tab 面；检查单与逐项断言不变。
  // tab 标题 = path 剥 .ad（"wiki/Tasks"），与树行文本（"Tasks.ad"）可区分。
  // D-17（切档重挂载实例键入不逐键发射、blur 冲刷）：切档后键入的 store
  // 可见断言前置一次中性 blur（点 EXPLORER 头，无 handler）——vue 轨冲刷
  // 机制，与 vm type_text 即发同语义收敛。
  const tabTitle = (name: string) => page.getByRole('button', { name, exact: true })
  await page.getByText('Tasks.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  console.log('[7 tab] 开两档 — Tasks.ad 激活，编辑器内容互换到位')
  await tabTitle('wiki/Hello World').click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await tabTitle('wiki/Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  console.log('[7 tab] 切换互换 — 双向 active 断言过（D-03 切换面同步在测）')
  // dirty Tasks（真键盘追加）→ blur 冲刷 → 切走再切回：脏标经 TabActivate 投影还原
  await appendToEditor(page, ` ${TAB_MARKER}`)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await tabTitle('wiki/Hello World').click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await tabTitle('wiki/Tasks').click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  console.log('[7 tab] 脏标跨后台还原 — TabActivate 投影断言过')
  // 取消路：x → 确认弹层 → 取消 → 档留 + 脏标保（x 钮 = 活动档行的 lucide-xicon 图标钮——本版 lucide 图标名 kebab 化带 -icon 尾）
  const activeTabX = page.locator('button:has(svg.lucide-xicon)')
  await activeTabX.click()
  await expect(page.getByText('关闭前要保存吗?')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByText('关闭前要保存吗?')).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 10_000 })
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible()
  console.log('[7 tab] 确认弹层取消路 — 档留 + 脏标保')
  // 直接关闭路：弃改关闭（磁盘零写入）→ 档数回落 + 激活回落 Hello World
  await activeTabX.click()
  await expect(page.getByText('关闭前要保存吗?')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '直接关闭', exact: true }).click()
  await expect(page.getByText('关闭前要保存吗?')).toBeHidden({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/Tasks', exact: true })).toHaveCount(0, { timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  const tabDisk = fs.readFileSync(TARGET_FILE.replace('Hello World.ad', 'Tasks.ad'), 'utf8')
  expect(tabDisk, '弃改关闭 = 磁盘零写入').not.toContain(TAB_MARKER)
  console.log('[7 tab] PASS — 双档切换互换 + dirty 关闭确认两路（取消档留/直接关闭弃改，磁盘零写入）')

  // 8 编辑操作族（vm 矩阵 check 8 同单）：段中编辑弧线——插入 → 脏标置真
  // → 退格复原 → 脏标重算 false，store 全程可证（vm 侧整文构造回车/退格
  // 同弧线）。D-17 引擎面（实探登记，vue 轨通道约束）：①切档重挂载/
  // replaceDoc 后逐键发射死、blur text-diff 调和存活（可打印编辑以 blur
  // 冲刷达成与 vm 即发同语义）；②调和仅认真实输入事件——合成选区注入
  // （evaluate 放 caret）被引擎无视，故定位用 click+Ctrl+End（文档尾），
  // vm 的段中（整文构造）在 vue 收敛为文档尾（实证可用通道）。
  const content = visibleEditor(page).locator('.autodown-editor-content')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type('编', { delay: 25 })
  await expect
    .poll(async () => /编\s*$/.test(await content.innerText()), { timeout: 10_000 })
    .toBe(true)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  console.log('[8 editops] 文档尾插入 — store 收字 + 脏标置真（blur 冲刷）')
  await content.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.press('Backspace')
  await expect
    .poll(async () => !/编\s*$/.test(await content.innerText()), { timeout: 15_000 })
    .toBe(true)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  console.log('[8 editops] PASS — 插入/退格复原 + 脏标重算（C-5 同语义弧线）')

  // 10 link（vm 矩阵 check 10/10b 同单）：反链面板 + 反链/出链行 + 点击
  // 开档 + 空态。期望值 = T-02 语料首锁（Hello World 反链三源 index/CAP
  // 定理/Tasks；首页悬空；index 无反链）。导航全走 ASCII 路径；CJK 目标
  // 子步（出链点 CAP 定理）仅 vm merged 臂——HTTP GET query UTF-8 解码
  // 缺口（D-19 上游先在缺口），vue 轨同败故跳过（D-17 先例：轨内机制
  // 差异注记）。
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  await expect(page.getByText('LINKS', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/index.ad', exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/CAP 定理.ad', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'wiki/Tasks.ad', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'CAP 定理', exact: true })).toBeVisible()
  await expect(page.getByText('首页（悬空）', { exact: true })).toBeVisible()
  console.log('[10 link] PASS — 面板开 + 反链三源行 + 出链段（CAP 定理钮/首页悬空文本）')
  // 点击反链行 → index.ad（ASCII）
  await page.getByRole('button', { name: 'wiki/index.ad', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 15_000 })
  await expect(page.getByText('（无反链）', { exact: true })).toBeVisible({ timeout: 10_000 })
  // 出链行点击 → Hello World.ad（ASCII；两轨同单上限）
  await page.getByRole('button', { name: 'Hello World', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  console.log('[10 link] PASS — 反链行开 index.ad（空态文本）+ 出链行开 Hello World.ad')
  // 空态（无激活档）：文件→新建（untitled，path 空 → 行集空）
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('新建', { exact: true }).click()
  await expect(page.getByText('（无反链）', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('（无出链）', { exact: true })).toBeVisible()
  // 关 untitled（未脏直接关）→ 树重开 Hello World → 反链行恢复
  await activeTabX.click()
  await page.getByText('Hello World.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'wiki/index.ad', exact: true })).toBeVisible({ timeout: 10_000 })
  console.log('[10 link] PASS — untitled 空态双文本 + 重开行恢复')

  // 10c 建页弧线（PLAN-005 T-04；vm 矩阵 10c 同单）：ASCII 悬空源档测试内
  // 造（write_wiki POST 造 Create Source.ad，悬空目标 NewPage——语料悬空
  // 目标 首页 为 CJK，vue 臂开档面受 D-19，ASCII 造档 = 全弧线全臂可跑；
  // 零语料改动——§6/T-04 落定方案）。goto 重载 = Init 重取链接索引（外部
  // 写入方入索引面）。
  const wRes = await request.post('/api/write_wiki', {
    data: { path: 'Create Source.ad', body: '# Create Source\n\nsee [[NewPage]].\n' },
  })
  expect(wRes.ok(), 'write_wiki 造源档 POST ok').toBe(true)
  await page.goto('/')
  await expect(page.getByText('ready', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('wiki', { exact: true }).first().click()
  await page.getByText('Create Source.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('see', { timeout: 15_000 })
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  await expect(page.getByText('NewPage（悬空）', { exact: true })).toBeVisible({ timeout: 10_000 })
  // 取消路：弹层三断言 → 取消 → 弹层闭 + 零落盘
  await page.getByText('NewPage（悬空）', { exact: true }).click()
  await expect(page.getByText('创建缺失页面？')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('[[NewPage]] 尚不存在')).toBeVisible()
  await expect(page.getByText('将创建：NewPage.ad')).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByText('创建缺失页面？')).toBeHidden({ timeout: 10_000 })
  expect(fs.existsSync(path.join(WORKSPACE, 'NewPage.ad')), '取消零落盘').toBe(false)
  // 创建路：弹层 → 创建 → 开新档（编辑器播种模板）+ 树新行 + 面板翻转
  await page.getByText('NewPage（悬空）', { exact: true }).click()
  await page.getByRole('button', { name: '创建', exact: true }).click()
  await expect(page.getByText('创建缺失页面？')).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('NewPage', { timeout: 15_000 })
  await expect(page.getByText('NewPage.ad', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'NewPage', exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('NewPage（悬空）', { exact: true })).toHaveCount(0)
  const npDisk = fs.readFileSync(path.join(WORKSPACE, 'NewPage.ad'), 'utf8')
  expect(npDisk, '模板逐字节（# {target}\\n\\n 无 frontmatter）').toBe('# NewPage\n\n')
  console.log('[10c create] PASS — 建页弧线（取消零落盘/创建→开档 # NewPage/树新行/面板翻转/模板逐字节；ASCII 源档测试内造）')

  // 11 find（vm 矩阵 check 11 同单）：查找面板双模式。input = 真 DOM
  // （fill() 即发 input 事件 → oninput——无 D-17 通道约束，该门控仅编辑
  // 器组件）；行断言域与 vm 同单（path 按钮/空态文本）。
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  await expect(page.getByText('LINKS', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  // 快开子步：开面板（文件模式）→ 空 q 全量 5 行 → 过滤 → 拾取即关
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('快速打开', { exact: true }).click()
  const findInput = page.getByPlaceholder('过滤文件名…')
  await expect(findInput).toBeVisible({ timeout: 10_000 })
  for (const p of ['wiki/CAP 定理.ad', 'wiki/Hello World.ad', 'wiki/index.ad', 'wiki/Projects.ad', 'wiki/Tasks.ad']) {
    await expect(page.getByRole('button', { name: p, exact: true })).toBeVisible()
  }
  await findInput.fill('Pro')
  await expect(page.getByRole('button', { name: 'wiki/Projects.ad', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'wiki/CAP 定理.ad', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'wiki/Projects.ad', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('当前进行中的项目', { timeout: 15_000 })
  await expect(findInput).toHaveCount(0, { timeout: 10_000 })
  console.log('[11 find] PASS — 快开：空 q 全量 5 行 + 过滤 Pro→Projects 独行 + 拾取开档即关')
  // 检索子步：text 模式 → 未运行提示 → CJK 查询（POST 通道）→ 行导航
  // 面板保持开 → 运行后空态
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('全文检索', { exact: true }).click()
  const searchText = page.getByPlaceholder('输入查询词…')
  await expect(searchText).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('（输入查询词后检索）', { exact: true })).toBeVisible()
  await searchText.fill('任务列表')
  await page.getByRole('button', { name: '检索', exact: true }).click()
  await expect(page.getByRole('button', { name: 'wiki/Hello World.ad', exact: true })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: 'wiki/Hello World.ad', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await expect(searchText).toBeVisible()
  await searchText.fill('zzz-无此词-xyz')
  await page.getByRole('button', { name: '检索', exact: true }).click()
  await expect(page.getByText('（无结果）', { exact: true })).toBeVisible({ timeout: 10_000 })
  console.log('[11 find] PASS — 检索：未运行提示 + CJK「任务列表」命中/行导航面板保持开 + 运行后空态')

  // 12 rename（PLAN-006 T-04；vm 矩阵 check 12 同单）：重命名+反链改写
  // 全弧线。素材 Projects.ad（ASCII——D-19 面无；入链 index/CAP 定理 两
  // 页两处 = 预览/改写断言域）。vue 轨 Dialog 闭态 = 卸载（radix-vue 形
  // 态——vm 恒渲染的轨内差异，断言以 visible/hidden 表达，语义同单）。
  // 入口 = 文件菜单→重命名…（键位面 = 真键盘，e2e 不覆盖——11 同口径）。
  // ① untitled 禁用（handler 守卫——弹层不开）
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('新建', { exact: true }).click()
  await expect(page.getByRole('button', { name: '未命名', exact: true })).toBeVisible({ timeout: 10_000 })
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('重命名…', { exact: true }).click()
  await expect(page.getByText('重命名页面')).toBeHidden({ timeout: 5_000 })
  console.log('[12 rename] untitled 禁用 — 入口 press 后弹层不开（handler 守卫）')
  await page.locator('button:has(svg.lucide-xicon)').first().click()
  // ①b 脏档禁用：HW 追加 → 未保存 → 入口 → 弹层不开 → 重载复原
  await appendToEditor(page, ' rename 脏档标记。')
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('重命名…', { exact: true }).click()
  await expect(page.getByText('重命名页面')).toBeHidden({ timeout: 5_000 })
  await page.locator('button[title="重载"]').click()
  await expect(page.getByText('未保存', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  console.log('[12 rename] 脏档禁用 — 弹层不开 + 重载复原')
  // ② 弹层内容锚：开 Projects.ad → 入口 → 弹层（预填 Projects + 预览
  // 「将改写 2 页 2 处链接」）
  await page.getByText('Projects.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('当前进行中的项目', { timeout: 15_000 })
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('重命名…', { exact: true }).click()
  await expect(page.getByText('重命名页面')).toBeVisible({ timeout: 10_000 })
  const renameInput = page.getByPlaceholder('新名称…')
  await expect(renameInput).toHaveValue('Projects')
  await expect(page.getByText('将改写 2 页 2 处链接', { exact: true })).toBeVisible()
  console.log('[12 rename] 弹层锚 — 预填 Projects + 影响面预览 2 页 2 处')
  // ③ 取消零落盘
  const projectsFile = path.join(WORKSPACE, 'wiki', 'Projects.ad')
  const renamedFile = path.join(WORKSPACE, 'wiki', 'Project X.ad')
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(page.getByText('重命名页面')).toBeHidden({ timeout: 10_000 })
  expect(fs.existsSync(projectsFile), '取消零落盘（Projects.ad 在）').toBe(true)
  expect(fs.existsSync(renamedFile), '取消零落盘（Project X.ad 不在）').toBe(false)
  console.log('[12 rename] 取消零落盘')
  // ④ 改名弧线：Projects → Project X——tab/激活更新 + 磁盘（旧消失新
  // 在 + index.ad/CAP 定理.ad 源文改写）
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('重命名…', { exact: true }).click()
  await expect(renameInput).toHaveValue('Projects', { timeout: 10_000 })
  await renameInput.fill('Project X')
  await page.getByRole('button', { name: '重命名', exact: true }).click()
  await expect(page.getByText('重命名页面')).toBeHidden({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'wiki/Project X', exact: true })).toBeVisible({ timeout: 15_000 })
  expect(fs.existsSync(projectsFile), '旧档消失').toBe(false)
  expect(fs.existsSync(renamedFile), '新档在').toBe(true)
  const indexDisk = fs.readFileSync(path.join(WORKSPACE, 'wiki', 'index.ad'), 'utf8')
  const capDisk = fs.readFileSync(path.join(WORKSPACE, 'wiki', 'CAP 定理.ad'), 'utf8')
  expect(indexDisk, 'index.ad 源文改写').toContain('[[Project X]]')
  expect(capDisk, 'CAP 定理.ad 源文改写').toContain('[[Project X]]')
  console.log('[12 rename] 改名弧线 — active/tab 更新 + 磁盘改名 + 双页源文改写')
  // ⑤ 跨页改写可见：开 index.ad → 反链面板（index 反链空态 + 出链行新
  // stem『Project X』——『Projects』行消失）→ **出链行点击导航到新档**
  //（tab wiki/Project X——改写链接可走通）+ 树新行（Project X.ad 在、
  // Projects.ad 消失）。（index 无反链——Project X 零真实出链[语料转义
  // 面]故非任何页反链源；反链行新 stem 正证面 = probe_rename 案①。）
  await page.getByText('index.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 15_000 })
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  await expect(page.getByText('（无反链）', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'Project X', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Projects', exact: true })).toHaveCount(0, { timeout: 10_000 })
  await expect(page.getByText('Project X.ad', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Projects.ad', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  await page.getByRole('button', { name: 'Project X', exact: true }).click()
  await expect(page.getByRole('button', { name: 'wiki/Project X', exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(visibleEditor(page)).toContainText('当前进行中的项目', { timeout: 15_000 })
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  console.log('[12 rename] 跨页改写可见 — 出链新 stem + 点击导航到新档 + 树新行')
  // ⑥ case-only 拒（G3）：project x → 弹层留置 + 磁盘零变化（目录清单
  // casefold 计数——Windows 大小写不敏感 FS exists 对同档恒真）→ 取消
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('重命名…', { exact: true }).click()
  await expect(page.getByText('重命名页面')).toBeVisible({ timeout: 10_000 })
  await renameInput.fill('project x')
  await page.getByRole('button', { name: '重命名', exact: true }).click()
  await expect(page.getByText('重命名页面')).toBeVisible({ timeout: 10_000 })
  const pxCount = fs
    .readdirSync(path.join(WORKSPACE, 'wiki'))
    .filter((f) => f.endsWith('.ad') && f.toLowerCase() === 'project x.ad').length
  expect(pxCount, 'case-only 拒磁盘零变化（无第二档）').toBe(1)
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(page.getByText('重命名页面')).toBeHidden({ timeout: 10_000 })
  console.log('[12 rename] PASS — case-only 拒（弹层留置 + 磁盘零变化）')
  // ⑦ 状态复原：回 Hello World tab（quit 检查前置）
  await page.getByRole('button', { name: 'wiki/Hello World', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  console.log('[12 rename] PASS — rename 组全弧线（七子步；状态复原 Hello World）')

  // 9 退出存盘（vm 矩阵 check 9 同单；vue 形态差异两处——见文件头注记）：
  // ① 退出入口 = 文件菜单 → 退出项（1784 起 menubar 族为真组件 popover
  //   形态——此前在册的「裸 div 零尺寸」形态随再生成消失）；
  // ② Process.exit = 垫片 no-op——只断言落盘，不断言进程退出/弹层复位。
  await appendToEditor(page, ` ${QUIT_MARKER}`)
  await neutralBlur()
  await expect(page.getByText('未保存', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('退出', { exact: true }).click()
  await expect(page.getByText('退出前要保存吗?')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '保存并退出', exact: true }).click()
  await expect
    .poll(() => fs.readFileSync(TARGET_FILE, 'utf8').includes(QUIT_MARKER), { timeout: 15_000 })
    .toBe(true)
  const quitDisk = fs.readFileSync(TARGET_FILE, 'utf8')
  expect(quitDisk, '原文未被整文替换丢失').toContain('这是一段示例文本')
  expect(quitDisk, 'frontmatter 保留').toContain('title: Hello World')
  console.log('[9 quit] PASS — QuitSaveClose 磁盘三验（原文/标记/frontmatter；进程退出仅 vm 附注）')

  // 13 file（PLAN-007 T-04；vm 矩阵 check 13 同单收敛——执行序在 quit
  // 后，见文件头注）。EXPLORER「＋」钮 = icon 钮（svg class 子串
  // lucide-plus——EXPLORER 列先于 tab 条渲染，.first() 消歧）；vue
  // Dialog 闭态 = 卸载（radix）——弹层内「创建」钮开态唯一，无 vm
  // 侧同名钮消歧面。
  const explorerPlus = page.locator('button:has(svg[class*="lucide-plus"])').first()
  const newNameInput = page.getByPlaceholder('页面名…')
  // ① 新建 ASCII：＋ → fill → 创建 → 编辑器播种 + 树行 + 磁盘模板逐字节
  await explorerPlus.click()
  await expect(newNameInput).toBeVisible({ timeout: 10_000 })
  await newNameInput.fill('E2E Note')
  await page.getByRole('button', { name: '创建', exact: true }).click()
  await expect(page.getByText('新建页面')).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('E2E Note', { timeout: 15_000 })
  await expect(page.getByText('E2E Note.ad', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
  const e2eNoteFile = path.join(WORKSPACE, 'E2E Note.ad')
  await expect
    .poll(() => fs.existsSync(e2eNoteFile) && fs.readFileSync(e2eNoteFile, 'utf8') === '# E2E Note\n\n', { timeout: 10_000 })
    .toBe(true)
  console.log('[13 file] 新建 — 编辑器播种 + 树新行 + 磁盘模板逐字节')
  // ② 同名幂等：再建同名 → 开既有（tab 不重复 + 磁盘字节不变）
  await explorerPlus.click()
  await expect(newNameInput).toBeVisible({ timeout: 10_000 })
  await newNameInput.fill('E2E Note')
  await page.getByRole('button', { name: '创建', exact: true }).click()
  await expect(page.getByText('新建页面')).toBeHidden({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'E2E Note', exact: true })).toHaveCount(1, { timeout: 10_000 })
  expect(fs.readFileSync(e2eNoteFile, 'utf8'), '幂等磁盘字节不变').toBe('# E2E Note\n\n')
  console.log('[13 file] 同名幂等 — tab 不重复 + 磁盘字节不变')
  // ③ 取消零落盘
  await explorerPlus.click()
  await expect(newNameInput).toBeVisible({ timeout: 10_000 })
  await newNameInput.fill('Ghost')
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(page.getByText('新建页面')).toBeHidden({ timeout: 10_000 })
  expect(fs.existsSync(path.join(WORKSPACE, 'Ghost.ad')), '取消零落盘').toBe(false)
  console.log('[13 file] 取消 — 零落盘')
  // ④ 删除弧线（素材 Hello World.ad——入链 3 处 = index/Tasks/CAP 定
  // 理已知答案；tab 开且激活 = 1 个标签页警示）：树行选中 → 菜单删除…
  // → 弹层锚 → 取消零落盘 → 再开 → 确认 → 磁盘消失 + tab 关闭 + 树行
  // 消失
  await page.getByText('Hello World.ad', { exact: true }).first().click()
  await expect(visibleEditor(page)).toContainText('这是一段示例文本', { timeout: 15_000 })
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('删除…', { exact: true }).click()
  await expect(page.getByText('删除页面')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('将删除 wiki/Hello World.ad', { exact: true })).toBeVisible()
  await expect(page.getByText('3 处入链将变为悬空', { exact: true })).toBeVisible()
  await expect(page.getByText('1 个标签页将关闭，未保存修改将丢弃', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(page.getByText('删除页面')).toBeHidden({ timeout: 10_000 })
  expect(fs.existsSync(TARGET_FILE), '取消零落盘（Hello World.ad 在）').toBe(true)
  await page.getByText('文件', { exact: true }).click()
  await page.getByText('删除…', { exact: true }).click()
  await expect(page.getByText('删除页面')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: '删除', exact: true }).click()
  await expect(page.getByText('删除页面')).toBeHidden({ timeout: 10_000 })
  await expect
    .poll(() => fs.existsSync(TARGET_FILE), { timeout: 10_000 })
    .toBe(false)
  await expect(page.getByRole('button', { name: 'wiki/Hello World', exact: true })).toHaveCount(0, { timeout: 10_000 })
  await expect(page.getByText('Hello World.ad', { exact: true })).toHaveCount(0, { timeout: 10_000 })
  console.log('[13 file] 删除弧线 — 弹层锚（3 处入链+1 tab 警示）/取消零落盘/确认→磁盘消失+tab 关闭+树行消失')
  // ⑤ 悬空翻转：开 index tab（12 段已开）→ 反链面板出链行 Hello
  // World（悬空）（PLAN-003 已知答案反向）
  await page.getByRole('button', { name: 'wiki/index', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('Jade Garden 测试知识库', { timeout: 15_000 })
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  await expect(page.getByText('Hello World（悬空）', { exact: true })).toBeVisible({ timeout: 10_000 })
  console.log('[13 file] PASS — file 组弧线（新建/幂等/取消/删除弧线/悬空翻转；no-op+CJK 案 vm 专属口径）')

  // 14 meta（PLAN-008 T-04；vm 矩阵 check 14 同单——段内最后）：tags
  // 面板 + wanted 模式。执行序在 13 后（此位已知答案——e2e 13 删的是
  // Hello World.ad[vm 删 CAP 定理.ad，两轨素材异位既有口径]：tags 4 行
  // [demo/distributed-systems/theory 随删除消失、12 改名 Projects→
  // Project X——tasks/index/jade-garden/project-management]；wanted 2
  // 行 = Hello World（3）[wiki/index + wiki/CAP 定理 + wiki/Tasks 三处
  // 入链悬空] + 页面名（1）[wiki/index 尾行——语料实勘全集执行期校正
  // 面]；首页 不悬空[唯一链接方 Hello World 已删]、CAP 定理 不悬空
  // [wiki/CAP 定理.ad 在盘]。e2e 建页全走 POST body CJK 已证面——无
  // vm 侧 D-19 分野。
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  // tags ①：面板开启 + 4 tag 行（label 计数；此位已知答案）
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换标签', { exact: true }).click()
  await expect(page.getByText('TAGS', { exact: true })).toBeVisible({ timeout: 10_000 })
  for (const l of ['tasks · 1', 'index · 1', 'jade-garden · 1', 'project-management · 1']) {
    await expect(page.getByRole('button', { name: l, exact: true })).toBeVisible({ timeout: 10_000 })
  }
  // tags ②：展开页行 + 导航（ASCII tasks）
  await page.getByRole('button', { name: 'tasks · 1', exact: true }).click()
  await expect(page.getByRole('button', { name: 'wiki/Tasks.ad', exact: true })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: 'wiki/Tasks.ad', exact: true }).click()
  await expect(visibleEditor(page)).toContainText('原型设计', { timeout: 15_000 })
  console.log('[14 meta] tags 面板 — 4 tag 行已知答案 + 展开导航（wiki/Tasks.ad 开档）')
  // tags ④：write_wiki 外造带 tag 档 → 保存 → 面板新行（POST body
  // 通道——write_wiki 对不存在档直写 body 全文，frontmatter 内嵌其上）
  const wRes2 = await request.post('/api/write_wiki', {
    data: { path: 'Tagged E2E.ad', body: '---\ntags:\n  - meta-e2e\n---\n\n# T\n' },
  })
  expect(wRes2.ok(), 'write_wiki 造带 tag 档 POST ok').toBe(true)
  await page.locator('button[title="保存"]').click()
  await expect(page.getByRole('button', { name: 'meta-e2e · 1', exact: true })).toBeVisible({ timeout: 10_000 })
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换标签', { exact: true }).click()
  console.log('[14 meta] tags Save 刷新 — 外造 meta-e2e → 保存 → 面板新行')
  // wanted ⑤：模式入口（无 input 行/无检索钮 + 两行清单已知答案）
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('悬空清单', { exact: true }).click()
  await expect(page.getByText('悬空', { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByPlaceholder('输入查询词…')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '检索', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Hello World（3）', exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: '页面名（1）', exact: true })).toBeVisible()
  console.log('[14 meta] wanted 入口 — 无 input 行/无检索钮 + 两行清单已知答案')
  // wanted ⑧+⑥：Hello World（3）行——取消零落盘 → 再点创建 → 消缺
  //（根落位 Hello World.ad——与 13 删除的 wiki/Hello World.ad 异位不冲
  // 突；三处入链一并接回）
  await page.getByRole('button', { name: 'Hello World（3）', exact: true }).click()
  await expect(page.getByText('创建缺失页面？')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('[[Hello World]] 尚不存在')).toBeVisible()
  await expect(page.getByText('将创建：Hello World.ad')).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).last().click()
  await expect(page.getByText('创建缺失页面？')).toBeHidden({ timeout: 10_000 })
  expect(fs.existsSync(path.join(WORKSPACE, 'Hello World.ad')), '取消零落盘').toBe(false)
  await page.getByRole('button', { name: 'Hello World（3）', exact: true }).click()
  await page.getByRole('button', { name: '创建', exact: true }).click()
  await expect(page.getByText('创建缺失页面？')).toBeHidden({ timeout: 10_000 })
  await expect(visibleEditor(page)).toContainText('Hello World', { timeout: 15_000 })
  await expect
    .poll(() => fs.existsSync(path.join(WORKSPACE, 'Hello World.ad')) && fs.readFileSync(path.join(WORKSPACE, 'Hello World.ad'), 'utf8') === '# Hello World\n\n', { timeout: 10_000 })
    .toBe(true)
  await expect(page.getByRole('button', { name: 'Hello World（3）', exact: true })).toHaveCount(0, { timeout: 10_000 })
  console.log('[14 meta] wanted 建页弧线 — 取消零落盘/创建开档（模板逐字节）/消缺（三处入链一并接回）')
  // wanted ⑦：空态闭环——消缺余量（页面名）→「（无悬空链接）」
  await page.getByRole('button', { name: '页面名（1）', exact: true }).click()
  await page.getByRole('button', { name: '创建', exact: true }).click()
  await expect(page.getByText('（无悬空链接）', { exact: true })).toBeVisible({ timeout: 10_000 })
  console.log('[14 meta] wanted 空态闭环 — 全消缺 →（无悬空链接）')
  // exists 翻转（既有弧线）：开 index tab → 反链面板出链行全 exists
  //（Hello World/页面名 钮在、Hello World（悬空）文本不在——13 ⑤ 曾断
  // 言其悬空，建页接回后翻转）
  await page.getByRole('button', { name: 'wiki/index', exact: true }).click()
  await page.getByText('视图', { exact: true }).click()
  await page.getByText('切换反链', { exact: true }).click()
  // 出链行钮消歧：根 Hello World.ad tab 题钮同名（wanted 建页后开档）
  // ——面板渲染居后，.last() 取行钮
  await expect(page.getByRole('button', { name: 'Hello World', exact: true }).last()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('Hello World（悬空）', { exact: true })).toHaveCount(0)
  console.log('[14 meta] PASS — meta 组（tags 面板+wanted 模式建页闭环+exists 翻转）')
})
