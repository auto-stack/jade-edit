---
plan_id: PLAN-035
status: executing
feature_name: 编辑命令入口真实化（R-03b1）
author: [agent]
created_at: 2026-10-02T05:05:19Z
updated_at: 2026-10-02T11:30:00Z
plan_revision: 1
current_step: 1
total_steps: 4
supersedes_spec_components:
  - docs/specs/editor-host-capabilities.md
new_spec_components:
  - docs/specs/editor-command-availability.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-03b1
---

# PLAN-035：编辑命令入口真实化

## 0. 变更摘要

PLAN-034 已 archived/delivered，其核验确认：主保存三入口可用，但六个宿主编辑命令没有执行桥；Vue 编辑器内部快捷键可用，宿主却仍注册 Ctrl+Z/Y/A 并调用日志 handler。引擎保存、正文链接和完整命令执行需要上游供给，不能立即假定已解锁。

本片落实 034 供给表 C-2 可独立执行的分支：移除失效的撤销／重做工具栏按钮，把六个无法执行的菜单项改为明确的编辑命令说明入口；取消宿主对撤销、重做、全选的全局快捷键注册，保留编辑器／输入框自身行为。旧 action ID 与消息保留兼容守卫，直接派发也只能显示不可用说明，不能静默假成功。

这是功能界面的具体改造，不再重复整套接口调查。它交付「不可用能力如实呈现、内部按键不被宿主空操作抢占」，不宣称已经实现宿主六命令。R-03b1 完成后，实际保存／链接／命令接线仍按 034 的逐仓解锁门推进。

## 1. 目标

- G-01：界面不再呈现可点击却无效果的六个编辑菜单命令和撤销／重做工具栏按钮；用户能看到明确说明。
- G-02：Ctrl+Z、Ctrl+Y、Ctrl+A 及其 Shift 变体不再被 Jade 宿主编辑 action 截获，编辑器／普通输入框按自己支持的语义处理。
- G-03：保留旧 action ID／msg 的兼容性，旁路触发时给可见不可用反馈，文档、选区、历史、草稿、保存状态与磁盘不被修改。
- G-04：维护现有保存、F5、查找、文件生命周期行为；命令说明不能占用 save_note 或吞掉待核验／草稿失败提示。
- G-05：以原生与 Vue 的实际入口／键程验证，更新局部规范并明确剩余供给条件。

范围：jade-edit 的 src/front/app.at、editor_store.at、相关 tests/e2e 与局部文档；不改后端、引擎、编译器或生产 gen。非目标：实现六命令桥、复制历史栈、DOM 私有实例调用、整文替换模拟撤销、引擎 Save 接线／隐藏、正文链接接线、位置族、全局组合键 Shift 丢失修复、布局重构、Musk 集成、原生 split boot 或上游稳定性修复。

成功样：打开含未保存输入的页面，工具栏没有假的撤销／重做按钮；“编辑”菜单进入说明，正文与 dirty 不变。Vue 正文 Ctrl+Z/Y 仍撤销／重做，查找输入框 Ctrl+A 选择其自身文字。旧 edit.undo 直接派发只打开说明，没有写盘或假撤销。

## 2. 架构方案

1. **能力判断采用已核实的显式策略**：034 已证明当前六命令没有宿主桥，本片统一收口，不按 renderer 猜测“Vue 内部快捷键有＝宿主菜单能执行”。不实现运行期私有能力探测或未验证的自动启用。
2. **交互入口真实化**：撤销／重做两个 toolbar item 移除；编辑菜单只保留“编辑命令说明…”有效入口。采用已在两轨使用的根 alert-dialog 展示说明，而非依赖 native menubar 的 enabled 冻结缺口。
3. **快捷键归还控件**：六编辑 action 不再声明快捷键（现行仅 undo/redo/select-all 挂 Ctrl+Z/Y/A），不把它们移到 bind 层；不注册 Ctrl+X/C/V、Shift+Z 等替代键。生成 keymap 不含这些宿主映射，事件自然留给正文／input。
4. **兼容与守卫**：旧六 action ID 和 App/Store ActUndo..ActSelectAll 名称保留；action 元数据标不可用，handler 无论是否被 enabled 门拦住，都只打开命令说明。guard 是策略权威，不能依赖禁用样式或 console 日志保护。保留 ID 不表示这些命令已可执行。
5. **说明状态独立**：拟新增 Store.editor_commands_help_open bool 与 Open/Close msg；六旧 handler 同步置位。不改 body/original_body/key/tab_uid/doc_id/draft/save_note；取消／关闭说明只清开态，避免重挂载或触发 Edit/Save。

## 3. 技术栈

沿用 Auto 单源、AutoVM merged/split 后端与生成 Vue3；复用 actions/toolbar/menubar/alert-dialog 组件。App 仍薄委托，Store 管说明开态。生成物通过 scripts/regen-vue.mjs，不手写 Vue、不补全局 keydown 监听、不修改 auto-lang 的 Shift 组合规则。

action.enabled_if="false" 是候选元数据形态，原生实际可见性／直接派发行为在 T-01 验证；无论该层是否有效，六 handler 始终显示说明且零编辑。不存在必须解锁上游才能满足的生产行为：说明 dialog、移除 toolbar/menu 失效入口、删除 action shortcut 均用本仓现有构件。若该最小 UI 载体异常，给精确 blocker，不把静默 no-op 当实现。

## 4. 需求分析与背景调查

### 4.1 当前基线与依赖

main HEAD=0cc67f261d86a66e642fbdeb77087017bdd96d1c；规划开始工作树干净，仅主检出。docs/plans 根无 active Plan，archived 最大业务号 034；分配时独占锁、重扫两目录、CreateNew 并验唯一，attachments 不占号。

docs/specs 无 overview/index。已读取 editor-host-capabilities 全文与 034 供给附件；结合 editor-safety/draft-recovery/document-lifecycle/name-search 相关安全／身份／输入边界。034 只交付核验，不把测试中的“缺能力符合预期”当作可执行命令。下一片采用供给表 C-2 的独立收口出口，不实施被 A-1/A-3/B-1/B-2 阻挡的接线。

| 来源 | 事实与锚点 | SHA256／版本 |
| --- | --- | --- |
| docs/specs/editor-host-capabilities.md | §1.2 六命令缺桥、Vue 内部快捷键、宿主全局键；§2 历史归属；§3 C-2 独立收口 | 7A121ACDC45491BA5CED370D3EA419AF090A00360FADC97CE718F268354BD848 |
| docs/plans/attachments/034-editor-host-supply.md | C-2 明确允许禁用／提示分支；A-1 保存来源、A-2 动作栏、A-3 命令桥、B-1 链接事件需解锁 | DAA1F8B769927A1CD1380B43FB69583F929A66D947A387C31F4D011A40F9DD92 |
| docs/specs/editor-safety.md | 三入口 F5 共门；key 变化会重挂载，不允许说明操作触发重载 | 2CD7BB0A5D2F1D6D4BF56A7B616FD1CEC164054E30C3A4AB0A9960AF786D0051 |
| docs/specs/draft-recovery.md | 保存读回核验／较新输入保 dirty／草稿结算 | 41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7 |
| docs/specs/document-lifecycle.md | tab_uid、待核验保存门及晚输入保留 | C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF |
| docs/specs/name-search.md | 名称查询／输入与身份边界；查找失败与过期态不能被说明吞掉 | A4E03D1F4D9F85D413F3DCECA84923EFD29EB862BF7A1587D816DF19F65902B9 |
| src/front/app.at | 六 actions、两 toolbar item、六 menubar item、App Act* 委托、根弹层、bind F5 | 6FC3640963DD975C1CF195BAF28B5768E502EB3545409DBAF737617330B9811D |
| src/front/editor_store.at | ActUndo..ActSelectAll 仅 console_log；新增说明须独立于 save_note | C7FA94F188529B40A03E3D311E3AA4197D27D0F830DB623DA30FDC7BF4DD4C6F |
| src/front/status_bar.at | save_note、未保存／草稿提示现行显示，保持不变 | 81F28ADE922C411B847A08F6A4E09AFB023399C3277195BD9A307411D277BC58 |
| docs/ARCHITECTURE.md | §4 宿主规范指针，Auto 单源／双轨纪律 | DE16CCD93B7ECA96BD03C37C64B45D5F7710C70D8EF367A14E6B7AD48CA6EC74 |
| e2e/editor-host-capabilities.spec.ts | commands 案目前点击旧菜单并验无效果，须适配新入口；内部 Ctrl+Z 真键用例可复用 | 38856B2DBEECBC56AE8B7E1058D7DDEE40463E240B1C28DBFA6BEC0CC46C262A |
| tests/probe_editor_host.mjs | 独立探针六命令路由仍证明缺桥；源码盘点部分与新状态对齐 | D40C37C8CAB64121C23E3299AC57503A6E0E7F267E0A738EFC87BB580558AE3A |
| tests/vm_matrix.mjs | 当前结构基线 v26；可扩说明状态／入口组 | E922D3850C918DF3A177A8494A23680125E87C772BB3D48BC1D7C4A5BF0A0DF5 |

生成 App.vue 实勘：__autoActionsKeymap 含 Ctrl+z/y/a；keydown 命中后 preventDefault→Act*，有修饰键时不检查 input/contenteditable 焦点。删除三映射可独立消除空 handler 抢键；Shift 丢失及 Ctrl+Shift+F/O/D 等其他全局键族仍是上游缺口，本片不承诺修复。

### 4.2 范围选择与保留边界

035 不重复 save/command/link/selection/cursor/reveal 全调查，也不等待所有上游供给后才改善界面。034 供给契约与历史证据保留；生产能力发生变化时只更新 canonical 当前状态及受影响的在跑测试，不改 archived 034 的验收与旧证据。

既有 F-24-2 原生 split boot、F-32-R2 槽位串扰、F-31-R1 dist 新鲜度、Vue 互调／多套件时序、031 检查点／切档焦点边界继续单列。原生内部 Ctrl+Z 能否真实消费不是本片新承诺；合成 key_press 无修饰键词表不能当作真键事件证明。本片证明的是宿主不再截获空命令，以及 Vue 和普通 input 已支持行为不回退。

### 4.3 授权

用户要求“计划034已经完成；请规划下一个计划”，继续 auto-plan-new。本次允许读取本仓材料、创建 Plan、更新路线图，未授权本次实施、canonical Specs 改写、上游修改、发布或自动继续 work/review/merge；无时间／token／工期预算。r1 提议后续只在 jade-edit 实施 C-2 收口；不把“规划下一项”解释为已经批准全套跨仓供给。

## 5. 详细设计

### 5.1 用户入口

- toolbar 不再列 edit.undo/edit.redo；其他保存／文件／重载按钮保留。
- “编辑”菜单只保留“编辑命令说明…”项；点击根说明 dialog。不存在仍可点击的“撤销／重做／剪切／复制／粘贴／全选”执行菜单项。此明确策略避免依赖 native menubar enabled 的既有缺口。
- 说明标题“编辑命令说明”；正文“当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选。正文和输入框仍可使用当前编辑器支持的操作。”仅“关闭”按钮。不要声称原生轨六快捷键已支持，也不在产品文案写 VM／事件桥等实现术语。
- 没有文档时说明仍可查看，正文区域空态不变；关闭不保存、不重载、不清 dirty。弹层开关沿现有两轨 Escape 行为，不要求本片统一平台 Escape 差异。

### 5.2 旧 ID／消息与快捷键

保留 edit.undo/edit.redo/edit.cut/edit.copy/edit.paste/edit.select-all 及 App/Store Act* 名称。actions 明确不可用，删三项 shortcut；六 handler 直接或统一同步打开说明，不再以日志作为唯一反馈。若框架拒绝直接激活不可用 action，可返回拒绝；若外部／兼容消息绕过该门到达 handler，则一定有说明且零编辑。这两种真实终态都不能表述为“命令执行成功”。

旧 ID 的标题可标注“菜单暂不可用”，但不再进入 toolbar，不为兼容恢复快捷键注册；MCP／旧脚本不得以仅找到 action ID 推断支持。新说明入口不占新的编辑快捷键。检查生成 keymap 与原生 action 表中没有 Ctrl+Z/Y/A 的宿主路由，bind 层也没有这些替代路由。

Vue 正文的 Ctrl+Z/Y、浏览器 input 的 Ctrl+A／复制粘贴等仍由对应控件处理。本片不接管或承诺操作系统未提供的剪贴板权限，不使用新全局 listener。Ctrl+S、F5、Ctrl+P、原有其他 shortcut 声明保持；组合键 Shift 丢失作为独立上游缺口保留。

### 5.3 状态与不变量

Store 新 editor_commands_help_open bool（默认 false）及显式 Open/Close msg，App 新说明入口委托和根弹层。旧六 handler 同步开说明，不读写编辑器内容或异步调用；不用 handler 互调后读完成态。关闭只清旗标。

无新的编辑输入时，说明前后 active_path/key/body/original_body/dirty/tab_uid/doc_id/draft_*、save_note、lc_review、文件集合／字节保持；命令说明不替换保存失败、草稿保护失败或待核验提示。打开说明可能改变 UI 焦点，但不得重挂载编辑器、变更历史或选区数据以伪造命令。此前已经在途的输入／检查点继续沿现有链接收，不能为保持快照而丢弃；静态不变量测试先等既有检查点落定，再计数说明本身的调用。Vue 真键历史仍沿引擎自身。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | modify | docs/specs/editor-host-capabilities.md §1.2／§3 C-2 | 当前宿主命令仅日志、Ctrl+Z/Y/A 双通道；改为六命令入口收口、旧消息可见说明、取消三宿主键；保留缺桥结论与其他上游条件 | 当前能力描述跟随实现，不能宣称桥已支持 | AC-01, AC-02, AC-03, AC-04, AC-09 |
| SD-02 | add | docs/specs/editor-command-availability.md §1 入口与兼容 | 新增 toolbar/menu/说明契约与旧 action/msg 的拒绝／说明终态；零假执行 | 用户理解当前能力并保留兼容路径 | AC-01, AC-02, AC-03 |
| SD-03 | add | docs/specs/editor-command-availability.md §2 快捷键归属 | 新增宿主三键不注册、正文／input 自主管理、Ctrl+S/F5/查找不变和 Shift 缺口边界 | 消除空操作抢键而不接管历史／选区 | AC-04, AC-05, AC-08 |
| SD-04 | add | docs/specs/editor-command-availability.md §3 不变量与验证 | 新增说明独立状态、磁盘／正文／草稿／save_note 不变、双轨证据及暂不可用范围 | 保持安全、如实验收 | AC-06, AC-07, AC-08, AC-09 |

本阶段只提议增量；工作阶段再新增／修改上述 Specs，并在 ARCHITECTURE §4 记录当前入口规范指针。editor-host-capabilities 的原始 034 证据标历史，不覆盖旧附件；其保存来源／链接身份／位置约束保持。

## 6. 测试设计

新增 tests/probe_command_availability.mjs 与 e2e/command-availability.spec.ts（工作阶段新增）。原生探针按已有隔离工程配方验证 action 表、说明消息与 Store 字段；真实 Jade vm_matrix 扩 E 组核对 toolbar/menu/说明状态，不以单纯 snapshot includes 推断按钮可执行。直接六消息的兼容守卫用隔离宿主调用实际 EditorStore handler，逐值对照 body／dirty／草稿与文件 hash。

Vue 用区域定位验证两个 toolbar 按钮和六执行菜单项不存在、说明入口真实可用；用真键 Ctrl+Z/Y 验正文一次撤销／重做、input Ctrl+A 后替换仅改变输入框。键入／撤销与检查点交互在短场景隔离；不使用 insertText 的“内容不变”冒充历史通过。监听作用域内事件或检查 live action 表，证明宿主不拦 Ctrl+Z/Y/A 及 Shift 变体。普通 input 的焦点／全选不能只靠正文零变化判断。

更新现行 e2e/editor-host-capabilities.spec.ts commands：将“旧菜单可点但零效果”改为新入口说明／内部快捷键保持；不要继续测试一个已移除的交互。tests/probe_editor_host.mjs 的 live 源码盘点对齐现状，独立模拟宿主缺桥探针和其 historical counters 可保留并注明区别，其他三相位不降低。

新 Store 状态／菜单／toolbar 引起结构变化时从 v26 逐项解释，新增 tests/baseline/structure-v27.txt（拟新增），不能盲目重锁。目标通过后跑原生 merged 矩阵、034 探针 all、受影响 e2e 逐套单跑（已有多套件时序限制）。既有精确 blocker 单列；本片新失败／缺证不可继承豁免。

## 7. 验收标准

| ID | 用户结果／具体判据 | 验证 |
| --- | --- | --- |
| AC-01 | toolbar 无撤销／重做执行钮；编辑菜单无六个虚假执行项，保留有效“编辑命令说明…”入口；菜单／toolbar 不用隐性 no-op 冒充支持 | 原生 E 组区域／action 观察与 Vue UI 区域断言 |
| AC-02 | 有文档／无文档均可打开说明，文案列六命令暂不可用且不声称原生快捷键已支持；关闭仅清旗标，编辑器 key 不变 | VM 状态＋e2e dialog 文案／开关／key 对照 |
| AC-03 | 六旧 action ID/msg 均保留；不可用 action 可拒绝，直接六 handler 必须显示说明，不能编辑／只写 console 假反馈；每个命令有独立证据 | live registry＋隔离真实 Store 六 handler 案＋状态不变量 |
| AC-04 | 生成 Vue keymap、原生 action 表和 bind 均无 Ctrl+Z/Y/A 的宿主路由，Shift 变体也不触发旧编辑 handler；不新增 X/C/V 全局截获 | 源／生成形状＋Vue 真键／事件观察＋原生路由检查 |
| AC-05 | Vue 正文真键 Ctrl+Z/Y 撤销／重做一次变更；查找或属性 input Ctrl+A 后替换仅作用该 input，正文与磁盘保持；内部行为不退化为日志 | e2e 真键、具体内容／input value 与 hash 对照，非合成成功回执 |
| AC-06 | 无新输入且既有检查点落定时，说明及六兼容消息前后身份、正文、dirty、草稿、lc_review、文件集合／字节保持，无额外 Save/Reload/检查点写入；说明打开前已有在途输入／检查点继续正常接收 | probe 全字段／hash，后端 API 计数＋e2e 在途与静态分案 |
| AC-07 | save_note／草稿失败／待核验等原提示在说明前后原值保持且关闭后仍可见；不用说明标记 saved／已保护 | 受控失败／待核验语料与说明叠加案，Store／UI 对读 |
| AC-08 | Ctrl+S 主保存、F5 脏页确认、Ctrl+P 查找及菜单文件操作保护不新增回归；原生 split boot 与既有 Shift 缺口如实单列 | vm merged、reload/name-search/lifecycle 相关单套回归，保存真实字节 |
| AC-09 | Auto 单源生成与目标双轨证据通过；现行 034 测试适配而旧归档证据保留；v27 差异逐项解释，SD-01..04 落位，R-03 整体仍未宣称完成 | 构建／probe／矩阵／e2e 与规范／路线图对照 |

## 8. 执行步骤

### T-01 收口载体与兼容守卫确认

- 依赖：无。核对 app actions/toolbar/menubar、Store 六 handler、现行说明弹层构件与 034 附件；不重做六接口矩阵。
- 新 docs/plans/attachments/035-command-availability-contract.md 与 tests/probe_command_availability.mjs 基础案，冻结 action 禁用形态、说明消息、两轨触点、真键验证与 v26 预期变更清单。一次最小原型＋一次失败复测；异常给精确 blocker，不改为不可见 no-op。
- 验证：node tests/probe_command_availability.mjs；pnpm build。基础案证明六消息可见说明／零编辑，取消三 shortcut 的注册效果可观察；证据含 binary／dist 指纹，source 与 binary 漂移分列。
- 对应 AC-02/03/04/06/09，SD-01/02/03/04。

- [x] T-01 [✅ 已完成 2026-10-02] 契约冻结件 attachments/035-command-availability-contract.md（§1 入口/§2 元数据与快捷键/§3 状态与守卫/§4 两轨验证配方/§5 v26→v27 预期清单/§6 红线/§7 实测）+ 探针 tests/probe_command_availability.mjs 基础案全绿：主工程六命令逐个「按钮派发→说明开（last_cmd 逐命令判别）→零编辑逐值恒等→关闭仅清旗标」18 案+Ctrl+Z/Y/A 键盘零宿主路由 6 案+Ctrl+S 对照回执+磁盘 walk 恒等；variant 阴性对照（undo 挂回 Ctrl+Z→flag 翻真+last_cmd=undo）=失败复测完成，键盘→action→handler→flag 仪器链两向可测；vue 形状两向（主工程 keymap 仅 Ctrl+s/variant 含 Ctrl+z；canary enabled_if:"false" 转译 :disabled="!(false)" 良构→六 action 采纳为元数据标注）。验证：node tests/probe_command_availability.mjs 全绿（EXIT=0）+ pnpm build 绿。指纹：auto.exe v0.4.2-2573-g982e80004-dirty（debug）·auto-lang 4614bd9 dirty（外部 WIP 分列）·auto-down 895f8d0f clean·jade-edit 1bffd15·engine dist AE6CCD56——source=binary 同检出（jade-edit），auto-lang source dirty 为外部会话面不扰证据。

### T-02 生产入口与说明状态改造

- 依赖：T-01。修改 src/front/app.at 的六 action 元数据与 shortcut、toolbar 两项、编辑菜单与根说明 dialog；保留六 App 委托。修改 src/front/editor_store.at 新开态／Open/Close msg，六旧 handler 改为可见说明守卫。src/front/status_bar.at 不改，避免占用安全注记。
- 新 e2e/command-availability.spec.ts 基本 UI／兼容／不变量案，补 probe 六 handler 逐项测试。
- 验证：pnpm build；node tests/probe_command_availability.mjs；pnpm exec playwright test -c e2e/playwright.config.ts e2e/command-availability.spec.ts。入口、说明、key/body/draft/hash 及旧 ID 均满足 AC。
- 对应 AC-01/02/03/04/06/07，SD-01/02/04。

### T-03 键程、旧核验测试与原生矩阵适配

- 依赖：T-02。补 e2e 新套件的 Ctrl+Z/Y、input 全选、焦点与事件观察；更新 e2e/editor-host-capabilities.spec.ts commands 和 tests/probe_editor_host.mjs 的 live 盘点。扩 tests/vm_matrix.mjs E 组并新增拟定 structure-v27.txt，逐项记录一旗标／新弹层／菜单与 toolbar 节点差异，不改旧结构锁。
- 验证：新 e2e 单套；pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts；node tests/probe_editor_host.mjs --phase all；node tests/vm_matrix.mjs --arm merged。内部快捷键／input 真效果通过、宿主不截获，034 其他能力缺口结论无变化。
- 对应 AC-01..09，SD-01/02/03/04。

### T-04 回归、规范落位与复审交接

- 依赖：T-03。工作阶段新增 docs/specs/editor-command-availability.md，更新 editor-host-capabilities.md §1.2／§3 C-2 并在 ARCHITECTURE §4 加指针；保留 034 旧附件／归档与其他四 Specs 承诺。更新路线图 R-03b1 的真实阶段状态，保留 A-1/A-2/A-3/B-1/B-2 等后续解锁项。
- 验证：pnpm build；node tests/probe_command_availability.mjs；node tests/probe_editor_host.mjs --phase all；node tests/vm_matrix.mjs（split 既有 boot blocker 单列）；新 command-availability 与 editor-host-capabilities 两套 e2e 单跑；现有 e2e/matrix.spec.ts、reload-safety.spec.ts、name-search.spec.ts、lifecycle-safety.spec.ts、draft-recovery.spec.ts 各自用 pnpm exec playwright test -c e2e/playwright.config.ts <文件> 单跑；git diff --check。
- 目标通过且受影响回归无新增失败；既有精确 blocker／多套件时序不能冲淡本片验收。输出代码 revision／工具链／命令结果／结构 diff／SD 覆盖，按工作技能交接 review，不自行跨仓或合入。
- 对应 AC-01..09，SD-01..04。

执行顺序 T-01→T-02→T-03→T-04，均尚未实施。回退为专属工作树应用／测试／文档提交回退，无数据迁移；不要用测试 fixture 覆盖真实知识库。技术等价调整可记录证据；扩大到执行桥、改目标或跨仓供给先修订契约并处理授权。

## 9. 复审记录

- 2026-10-02T05:05:19Z：stage: new；plan_id: PLAN-035；plan_revision: 1；outcome: pass；next: work（执行 C-2 收口，不是全套命令桥）。
- 新增 T-01..04、AC-01..09、SD-01..04；确认 034 已归档且 C-2 独立分支可规划。原生禁用元数据与实际派发用 T-01 限定核验，handler 自身始终守卫，不降低可见说明／零编辑验收。
- 本记录仅为规划交接，非实现复审 pass；本次未运行应用测试或探针、未改生产代码／canonical Specs、未自动继续 work/review/merge。
- 2026-10-02T11:30:00Z：stage: work | plan_id: PLAN-035 | plan_revision: 1 | outcome: executing（启动） | code_commit: 本批（规划落档+work 启动；直接 main 线性惯例单一主检出——001..034 在册，无 worktree/dev 分支面） | task_ids: 无（T-01 未开工） | evidence: 用户指令「计划 035 auto-plan-work 实施」授权执行；主检出预检=路线图+计划文件规划面 WIP（本批落档清零），代码路径零 WIP | blockers: 无 | next: T-01（收口载体与兼容守卫确认）。
- 2026-10-02T12:10:00Z：stage: work | plan_id: PLAN-035 | plan_revision: 1 | outcome: executing（T-01 完成） | code_commit: 1bffd15（规划落档）+本批 | task_ids: T-01 | evidence: 契约冻结件 attachments/035-command-availability-contract.md（§1..§7，含 enabled_if 实测修订）+node tests/probe_command_availability.mjs 全绿（主工程 25 案+variant 阴性对照 3 案+vue 形状两向——六命令守卫/键盘零路由/磁盘不变量/形状四域；失败复测=variant ctrl+z→flag 翻真成对在案）+pnpm build 绿 | blockers: 无 | next: T-02（生产入口与说明状态改造）。 |

## 10. 待澄清事项

本次规划无需等待用户回答。T-01 负责当前 action 禁用元数据的两轨行为、兼容消息可达仪器与载体指纹。若真键／框架仪器有缺口，给证据、owner、可重入条件，不把合成 keyboard 的成功回执写成编辑器真行为证明。

下一步仍按 034 供给契约解锁保存来源／动作栏、链接事件映射、组件／原生命令桥。035 不替代这些供给；上游交付后再创建消费 Plan，届时重新核对 API 与测试，不提前分配 036，不把 R-03 记为全完成。
