# editor-command-availability — 编辑命令入口真实化（PLAN-035 · R-03b1）

> 状态：**入口与守卫规范**——记录六宿主编辑命令（undo/redo/cut/copy/paste/select-all）在「无执行桥」现状下的界面收口契约：失效入口移除、可见说明、旧 ID/msg 兼容守卫、宿主快捷键归还控件。
> 本规范交付的是「不可用能力如实呈现、内部按键不被宿主空操作抢占」——**不宣称六命令可从菜单/快捷键执行**；实际命令桥仍按 [editor-host-capabilities](editor-host-capabilities.md) §3 逐仓解锁门推进。
> 契约冻结件：[attachments/035-command-availability-contract.md](../plans/attachments/035-command-availability-contract.md)；证据：`tests/probe_command_availability.mjs`（原型+阴性对照+真实 Store 臂）+ `e2e/command-availability.spec.ts` + vm_matrix E 组。

## 1. 入口与兼容（SD-02）

### 1.1 用户入口（toolbar/menu/dialog）

| 面 | 契约 | 证据 |
| --- | --- | --- |
| toolbar | 撤销/重做两执行钮移除；保存/文件/重载等入口保留——界面不呈现可点击而无效果的编辑命令钮 | vm_matrix E 组六执行项零恰等钮 + e2e 入口案 `button[title="撤销"]` count 0 |
| 编辑菜单 | 仅「编辑命令说明…」一个有效入口（六执行项整体移除——**显式策略**：不依赖 native menubar enabled 冻结缺口 D-24③，菜单上不留可点击的假执行项） | vm E 组菜单开态复认 + e2e 菜单开态六短词 count 0 |
| 说明 dialog | 根 alert-dialog：标题「编辑命令说明」；正文「当前版本不支持从菜单执行撤销、重做、剪切、复制、粘贴和全选。正文和输入框仍可使用当前编辑器支持的操作。」；单「关闭」钮。文案不声称原生轨快捷键可用、不写实现术语。无文档也可打开；关闭仅清旗标（不清 dirty、不重挂载编辑器、不触 Save/Reload） | e2e 文案逐字+DOM 标记法零重挂载+无/有文档双开 |
| 弹层语义 | 说明独立于 save_note 提示通道——打开/关闭不吞未保存/草稿失败/待核验注记 | e2e 不变量案（未保存+草稿已保护 前后原值保持） |

### 1.2 旧 ID/msg 兼容守卫（零假执行）

- 六旧 action ID（edit.undo/redo/cut/copy/paste/select-all）与 App/Store `ActUndo..ActSelectAll` 名称全保留；action 元数据如实标不可用（title 后缀「（菜单暂不可用）」+ `enabled_if: "false"`——T-01 实测 vue 转译 `:disabled="!(false)"` 恒禁用，不门控 keymap/派发）。**保留 ID ≠ 可执行**；MCP/旧脚本不得以仅找到 action ID 推断支持。
- 六 Store handler 同步置位 `editor_commands_help_open`（可见说明）+ console 诊断行（留痕，非唯一反馈）；零编辑器读写、零磁盘/草稿/save_note 副作用。旁路直派（兼容消息）只能得到说明——**不静默假成功**。
- 两轨终态：框架若拒绝激活不可用 action（拒绝终态）或消息到达 handler 开说明（说明终态），均合法；两者都不得表述为「命令执行成功」。
- 证据：probe 真实 Store 臂六 handler 逐项直派（生产 editor_store.at 原样副本）——`last_cmd` 逐命令判别 + body/dirty/save_note/draft 账/磁盘 walk 逐值恒等；variant 阴性对照（undo 挂回 shortcut → ctrl+z 翻 flag）证明仪器两向可测。

## 2. 快捷键归属（SD-03）

| 键 | 归属 | 证据 |
| --- | --- | --- |
| Ctrl+Z / Ctrl+Y（及 Shift 变体） | **宿主不注册**——vue 生成 keymap 无三键映射、原生 action 表无三键路由、bind 层零改动（仍仅 F5）。编辑器正文内 Ctrl+Z/Y = 引擎内部历史栈（vue 轨已可消费，行为不回退）；原生轨内部撤销描述更正（PLAN-036 SD-05）——core.rs 内部撤销路径在册，「不存在」系旧推论过强：key_press 词表无修饰键只证明仪器受限，真键与编辑类型覆盖待补证（宿主桥缺口不变） | 生成 App.vue keymap grep + vm E 组键盘零路由 + e2e 真键 Ctrl+Z 撤销/Ctrl+Y 重做+Shift 三变体零说明弹出 |
| Ctrl+A | 宿主不注册——普通 input（快开等）Ctrl+A 原生全选仅作用该 input；编辑器内 Ctrl+A = 浏览器 contenteditable 原生全选 | e2e input Ctrl+A 替换仅改 input、正文/磁盘保持 |
| Ctrl+X/C/V | **不新增**全局截获（无替代键注册）；剪贴板权限不接管 | keymap grep 零新增 |
| Ctrl+S / F5 / Ctrl+P 等 | 既有声明保持——主保存三入口、脏页确认、查找入口不回归 | e2e Ctrl+S 真落盘 + vm 六检查/重载组全绿 |
| Shift 组合键丢失 | 生成器全局缺口（Ctrl+Shift+O/F/D 族塌缩）**在录维持**，不在本片修复范围；新说明入口不占新编辑快捷键 | e2e editor-host-capabilities commands 案在录实录 |

生成 keymap 纪律：六编辑 action 无 shortcut 声明 → `__autoActionsKeymap` 无对应映射 → keydown 无 preventDefault 通道，事件自然留给正文/input。

## 3. 不变量与验证（SD-04）

- **状态独立**：`editor_commands_help_open`（Store，默认 false）+ `EditorCommandsHelpOpen/Close` msg；Open 共口（菜单入口与六守卫 handler 同形置位）；Close 仅清旗标。不改 body/original_body/key/tab_uid/doc_id/draft_*/save_note/lc_review。
- **零副作用不变量**（无新输入且既有检查点落定时）：说明及六兼容消息前后 active_path/key/body/original_body/dirty、save_note、文件集合/字节恒定；无额外 Save/Reload/检查点写入；说明打开前在途输入/检查点照常接收。
- **验证矩阵**：
  - `node tests/probe_command_availability.mjs`——原型臂（六命令守卫/键盘零路由/磁盘 walk 恒等/vue 形状两向）+ variant 阴性对照（仪器灵敏度）+ 真实 Store 臂（生产 handler 直派逐值）。
  - `node tests/vm_matrix.mjs --arm merged`——E cmd-avail 组（生产面入口/说明/键盘零路由）+ B 基线 v27（state +1 行 editor_commands_help_open: false；snapshot 收缩=toolbar 两钮子树+菜单六执行项；新说明弹层闭态恒渲染子树入序列——v26 逐项解释在 PLAN-035 T-03 记录）。
  - `pnpm exec playwright test -c e2e/playwright.config.ts e2e/command-availability.spec.ts`（单跑）——入口/键程/不变量三案。
  - `node tests/probe_editor_host.mjs --phase all`——034 缺桥模拟相位保留（隔离工程历史证据，与生产守卫分域）；live 盘点对齐本规范现状。
- **暂不可用边界（PLAN-036 刷新）**：六命令宿主执行桥、保存来源身份、位置族、Shift 丢失修复仍为上游解锁项（[editor-host-capabilities](editor-host-capabilities.md) §3 供给表 A-1/A-2/A-3/B-3/B-4）；正文链接的 Vue 片已由 PLAN-036 交付（[wiki-link-navigation](wiki-link-navigation.md)——不恢复任何失效编辑命令入口，六守卫与本规范不变；原生轨正文点击仍待 B-2）。本片不消费、不绕过、不提前宣称。上游交付后另立消费 Plan 重新核对 API 与测试。
