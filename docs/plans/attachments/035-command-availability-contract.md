# 035-command-availability-contract — 编辑命令入口真实化·收口载体与兼容守卫契约（PLAN-035 T-01 冻结件）

> 状态：**T-01 冻结件**——冻结 action 禁用形态、说明文案、两轨触点、真键验证配方与 v26→v27 预期变更清单；T-02..T-04 实施与回归以本件为准，偏离须在计划 §9 记录证据。
> 上游依据：[034-editor-host-supply.md](034-editor-host-supply.md) §C-2（无支持命令的菜单项显式提示，替代 console_log 降级——独立决策分支，不依赖 A-3/B-3 命令桥）+ [editor-host-capabilities.md](../../specs/editor-host-capabilities.md) §1.2/§2.3。
> 本片不实施六命令桥：守卫终态 = 可见说明 + 零编辑，不是「命令可执行」。

## 1. 交互入口契约（生产形状，T-02 落地）

| 面 | 冻结形状 |
| --- | --- |
| toolbar | `edit.undo`/`edit.redo` 两 item 从 actions 块 toolbar 列表移除（其余 file.new/open/save/daily/view.reload 保留）；生成面 = 少两个图标按钮 vnode |
| 编辑菜单 | 触发器「编辑」保留；内容仅一项 `menubar-item (title: "编辑命令说明…") { onclick: .EditorCommandsHelpOpen }`——撤销/重做/剪切/复制/粘贴/全选六执行项整体移除（**明确策略**：不依赖 native menubar enabled 冻结缺口 D-24③） |
| 说明弹层 | 根视图 alert-dialog 新实例，`open: .store.editor_commands_help_open`；标题「编辑命令说明」；正文「当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选。正文和输入框仍可使用当前编辑器支持的操作。」；footer 仅 `alert-dialog-cancel "关闭"`（lc_block 单钮先例同形）；不声称原生轨快捷键可用，不写 VM/事件桥等实现术语 |
| 弹层语义 | 无文档也可打开；关闭仅清旗标（不清 dirty、不重挂载编辑器、不触发 Save/Reload）；Escape 沿现有两轨行为（vue 轨 v-model 清开态在册），不统一平台差异 |

## 2. action 元数据与快捷键（禁用形态冻结）

- **六旧 action 保留**：id（edit.undo/redo/cut/copy/paste/select-all）、handler 名（App ActUndo..ActSelectAll → Store 同名）、title 全保留；title 追加「（菜单暂不可用）」后缀作元数据标注（不入任何可见 UI——六 action 不再被 toolbar/menubar 消费）；六 action 挂 `enabled_if: "false"` 元数据标注（T-01 实测良构——见 §7，registry 消费者如实可见不可用）。
- **三 shortcut 删除**：edit.undo `Ctrl+Z`、edit.redo `Ctrl+Y`、edit.select-all `Ctrl+A` 删除 shortcut 声明 → 生成 `__autoActionsKeymap` 不含三键（vue）+ 原生 action 表无三键路由（vm）；bind 层零改动（仍仅 F5）；不新增 Ctrl+X/C/V 等替代截获。
- **enabled_if="false" 候选形态实测结论（T-01）**：见 §7 实测记录——两轨接受、vue 合成按钮转译 `:disabled="!(false)"` 恒禁用、不门控 keymap、不门控 handler 派发。本片 toolbar item 整体移除后无可见合成面，该形态**作为元数据标注采用**（如实标不可用），禁用语义权威仍 = 入口移除 + handler 守卫（AC-03 两终态均可接受：拒绝或说明，均非假成功）。
- Ctrl+S（file.save）、F5（bind）、Ctrl+P、Ctrl+I 等既有 shortcut 声明零变化。

## 3. 状态与兼容守卫（SD-02/03/04 语义冻结）

- Store 新字段 `editor_commands_help_open bool = false`；新 msg `EditorCommandsHelpOpen`/`EditorCommandsHelpClose`（App 同名薄委托）。
- 六旧 Store handler（ActUndo/Redo/Cut/Copy/Paste/SelectAll）改为**同步置位** `editor_commands_help_open = true`（可留 console 诊断行，非唯一反馈）；零编辑器读写、零异步调用、零 handler 互调读态。
- 兼容终态：旧 ID/msg 保留≠可执行——旁路触发（旧脚本/MCP 直派）只能得到可见说明；框架若拒绝激活不可用 action 亦合法。两种终态都不得表述为「命令执行成功」。
- 不变量：说明开关前后 active_path/key/body/original_body/dirty/tab_uid/doc_id/draft_*/save_note/lc_review、文件集合/字节恒定（无新输入且既有检查点落定时）；在途输入/检查点照常接收。

## 4. 两轨触点与验证配方

| 载体 | 触点 | 验证 |
| --- | --- | --- |
| 原生 merged vm（探针） | MCP `autoui_action press` 按钮通道（六 handler 派发）+ `autoui_keyboard` Ctrl+Z/Y/A（快捷键移除效果）+ Ctrl+S 对照（通道活性）+ `autoui_state` flag/dirty/body 轮询 | `node tests/probe_command_availability.mjs`（T-01 原型自含件；T-02 扩真实 Store 六 handler 逐项） |
| 原生 merged vm（生产） | vm_matrix E 组（新）：toolbar 无撤销/重做钮、编辑菜单单一入口、说明开关状态、Ctrl+Z/Y 零宿主路由、正文/磁盘不变 | `node tests/vm_matrix.mjs --arm merged` |
| Vue 生成形状 | `__autoActionsKeymap` 无 Ctrl+z/y/a、有 Ctrl+s（对照）；help dialog 文案在 App.vue | 探针 vue shape（探针工程）+ 生产 `pnpm build` 后 grep |
| Vue 真组件 | e2e command-availability 套件（T-02 新增）：入口存在性/说明文案/关闭清旗标/真键 Ctrl+Z/Y 编辑器撤销重做/input Ctrl+A 局部全选/宿主不拦 | `pnpm exec playwright test -c e2e/playwright.config.ts e2e/command-availability.spec.ts`（单跑） |
| 原生真键边界 | key_press 词表无修饰键（PLAN-057 v1，034 已锚定）——原生轨内部撤销不存在的结论不翻案；本片只证宿主不再截获 | probe C2 同款预期工具报错行（historical） |

- **失败复测（仪器灵敏度）**：探针 variant 工程（undo 挂回 Ctrl+Z shortcut）必须复现「ctrl+z → flag 翻真」——证明键盘→action→handler→flag 仪器链在 shortcut 存在时可测；主工程（shortcut 已删）同键零翻转。绿相+阴性对照成对在案。

## 5. v26→v27 结构预期变更清单（T-03 重锁依据）

| 域 | 预期差异 | 逐项解释义务 |
| --- | --- | --- |
| state 段 | +1 行 `editor_commands_help_open: false (bool)`（store 新字段入 dump） | 唯一新增状态；终态值 false（说明未开） |
| snapshot id 序列 | toolbar 少两 button vnode（撤销/重做图标钮）；编辑菜单 6 item+1 separator → 1 item（说明入口） | 其余 vnode 序列零变化；弹层闭态恒渲染族零扰动（新 alert-dialog 声明位在 lc_block 后 StatusBar 前——闭态零可见面） |
| 检查族 | 六检查+扩单全组行为零变化 | E 组新增不占既有检查位；B 组锁 v27 |

## 6. 范围红线（复诵）

不实现六命令桥/复制历史栈/DOM 私有调用/整文替换模拟撤销/引擎 Save 接线/正文链接接线/位置族/Shift 丢失修复/布局重构/Musk 集成/原生 split boot 修复；不改后端、引擎、编译器、生产 gen、status_bar.at；034 archived 证据与旧附件不覆盖（canonical §1.2/§3 C-2 的状态刷新归 T-04 规范落位）。

## 7. T-01 实测记录（2026-10-02）

- **探针全绿**：`node tests/probe_command_availability.mjs` — 主工程六命令逐个「按钮派发→说明开（last_cmd 逐命令判别）→零编辑（body/dirty/edits 逐值恒等）→关闭仅清旗标」18 案 + Ctrl+Z/Y/A 键盘零宿主路由（flag 恒假+last_cmd 不变+零正文突变）6 案 + Ctrl+S 对照回执（通道活性）+ 磁盘 walk 前后恒等；variant 阴性对照（undo 挂回 Ctrl+Z）3 案全过——ctrl+z → flag 翻真+last_cmd=undo，键盘→action→handler→flag 仪器链在 shortcut 存在时可测，主工程同键零翻转成对在案（**失败复测完成**）。
- **vue 形状两向**：主工程 keymap 仅 `'Ctrl+s'`（无 Ctrl+z/y/a——无 shortcut→无映射）；variant 含 `'Ctrl+z': CmdUndo`（shortcut 声明→映射）；说明文案发射入 App.vue；window keydown 监听单件形状不变。canary 实测 `enabled_if: "false"` vue 转译 = `:disabled="!(false)"`（恒禁用，形态良构）。
- **enabled_if="false" 冻结结论（修订 §2）**：两轨接受该形态（探针工程 vm boot 正常+vue gen 正常）、vue 合成按钮转译为恒禁用；不门控 keymap/派发。本片 toolbar item 移除后无可见合成面——**作为元数据标注采用**（六 action 挂 `enabled_if: "false"`，对 registry 消费者如实标不可用），禁用语义权威仍 = 入口移除 + handler 守卫。
- **工具链指纹（T-01 时点）**：auto.exe `0.1.0+v0.4.2-2573-g982e80004-dirty`（debug）；auto-lang 源检出 4614bd9df4ae4c6139962608d3294008570822bd（dirty——外部 WIP 面与 034 复审同款分列，binary 以 --version 描述为准）；auto-down 895f8d0f（clean）；jade-edit 1bffd15（规划批后零漂移）；engine dist stamp AE6CCD56（mtime 2026-10-02T01:35Z——F-31-R1 谱系）。source 与 binary 漂移分列：jade-edit source=binary 同检出；auto-lang source dirty 为外部会话面，不扰本片证据（探针行为绑定现 binary）。
- **pnpm build 绿**（1bffd15 基线，规划批后、T-02 前零源变更——生成面与 T-03 结构预期对账的干净基点）。
