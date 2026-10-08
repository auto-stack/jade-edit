# 038-quick-open-contract — 双轨快速打开独立弹层·有界原型冻结件（PLAN-038 T-01）

> 状态：**T-01 冻结件**——冻结快开根弹层公开形态（dialog/input/onenter/行钮/取消钮/列表滚动）、程序化聚焦调用、Enter/Escape/Tab 键程边界、无文档（uid=0）提交形态、同步提交完成回执；T-02..T-04 实施与回归以本件为准，偏离须在计划 §9 记录证据。
> 原型载体：`tests/probe_quick_open.mjs --phase t1`（双载体工程 1024x768/640x480 + 原样拷贝生产 `editor_store.at` + 探针 app.at；MCP autoui_* 驱动）。T-01 终判 **10 pass / 0 fail / 2 blocked**（blocked = F9 VM Escape、F10 VM Tab——仪器边界如实单列，非失败）。
> 生产验证分工：载体面（本件 §1–§4）= 探针承载；目录/隔离/世代门（§5）与生产 App 键程 = T-02..T-04 扩臂（probe Q/C/R/O/S/P 组 + e2e/quick-open.spec.ts Vue 面）承载。

## 1. 弹层公开构件（SD-01 冻结）

- 根视图 `dialog (open: <开态>)` + `dialog-content/header(title+description)/footer`；内容序 = input → 状态/错误行 → 结果列表（`col max-h-64 overflow-y-auto` 包裹——VM lowering = scrollable 节点，W 窄窗 640x480 实测在册）→ footer 取消钮。
- 行形态：**双分支 if（r.path == 首选）**——首选行 `bg-accent` 高亮 + `text find_row_path(r)` path 次行（VM 视图 content 位 map 字段不隐式解箱——033 T-04 实勘件复用）；行点击 = `.QuickPick(r.path)`（真实 path 身份域，不传行索引/显示名）。
- 零 input 新增构件：input（value/oninput/onenter/placeholder）、button、dialog——既有公开族（VM iced 无 command 家族，上游 widgets/command-family.md `iced: none` 在案——不把 Vue Command 组件当双轨前置）。

## 2. 焦点（程序化聚焦调用冻结）

- **VM 轨**：入口 handler 内 `ui.focus(".QuickEdit")`——目标键 = 输入 handler **事件键**（`.事件名`，剥点前缀解析 auto_input_{widget}_{event}）。实测定谳两前提：
  1. 调用有效（native 9920 在册、白名单行在），但 **`__focus_result` 回执落盘要求 App 模型已声明 `var __focus_result str = ""`**——未声明字段 renderer write_state FieldNotFound 静默（T-01 首跑 FAIL→补声明复测 PASS，一次原因针对复测闭环）。生产 App 模型含此观察位。
  2. 判据 = `__focus_result: "ok"`（miss 形 = `miss:<key>`）。挂载竞态走 renderer 5 轮重试（programmatic-focus.md 在案），探针 poll 读回。
- **vue 轨**：`ui.focus(sel)` ts_adapter 直译 `document.querySelector(sel)?.focus()`——`.QuickEdit` 非合法 CSS 选择器，静默空转无害（`?.` 链）；vue 聚焦由 reka-ui DialogContent **原生 autofocus 首个可聚焦元素**承载（内容序 slot 在 X 钮前——生成件 DialogContent.vue 实勘，input 即首可聚焦）。证据载体 = e2e/quick-open.spec.ts（T-03 起，`document.activeElement` 断言）。
- 不能把 focus miss 当成功：VM 判据恒 `__focus_result=="ok"`；vue 判据恒 activeElement。

## 3. 键程（Enter/Escape/Tab 实测定谳）

| 键 | VM 轨（实测） | vue 轨（冻结预期，T-03 e2e 首验） |
| --- | --- | --- |
| 输入 Enter | `input.onenter: .QuickConfirm` 声明派发——探针通道 = `autoui_action {action:"submit"}`（Input 元素定址派发 onsubmit 声明，等价真实焦点 Enter）+ `autoui_keyboard Enter`（styled_vtree 首个带 onenter input 代理派发）。真实焦点 Enter → iced text_input on_submit 同声明 | `@keyup.enter` → `.QuickConfirm`（find text input 在册同型） |
| 零结果/loading/error/busy Enter | QuickConfirm 守卫：busy / 首选空 → console 注记零动作（F7 实测：弹层留置+零开页+零关层） | 同守卫（单 handler，两轨同代码） |
| Escape | **无公开关闭形态（blocked 单列）**：vm modal 不消费 Escape（036 在案）+ 合成通道 `autoui_keyboard Escape` 零派发（无 keybind/fallback key_escape 无 handler——F9 实测 qopen 不变）。**不新增全局 Escape bind**（035 同族纪律：宿主级截键让位编辑器自管辖；计划禁全局方向键/Enter 截获的同一纪律面）。同终态由取消钮承载 | reka-ui DialogContent Escape → `v-model:open` 直写 `store.quick_open=false`（030 reload 弹层同型在案）——**无 msg 派发**，在途拾取由关态门（§5）兜住 |
| Tab | 合成通道零派发（F10 实录）；真实用户 iced 焦点导航不可合成——键盘遍历公开面以 vue e2e 承载，VM 全候选鼠标点击承载（计划 §5.1「所有候选仍可鼠标点击」） | 原生 DOM 焦点序：input → 结果行钮 → footer 取消；Tab+Enter = 行钮焦点 Enter（浏览器原生 button 激活） |

- F9/F10 以 BLOCKED 计（仪器边界 + 上游 owner 单列），不冒称、不以 vue 证据替代 VM 缺口（037 复审同纪律）。

## 4. 无文档（uid=0）提交与完成回执（SD-03 冻结）

- 源票据 = 入口同步捕获 `active_uid/sel_gen/active_key/active_body`（untitled/无文档源：uid=0/gen=0/key=""/body=""——NavCommit 门全等比较原生通过，无需特例；F4 实测 uid0=0 票据经真实 store NavCommit 建页+激活）。
- 已开目标（含脏）= **found>=0 直 NavCommit 激活**（零 exists/read 窗零覆盖——F5 实测：tab 数不增、active_dirty 保持、内存正文保持）；未开 = exists → read_wiki → 关态+世代+来源门 → NavCommit；missing = 独立错误（「目标不存在——请重开快速打开刷新目录」）弹层留置零建页（F6 实测，stale 目录案）。
- **真实完成回执（冻结判据）**：`store.active_path == path && store.sel_gen != t_gen`（提交前捕获 gen）——NavCommit 成功路径恒 TabActivate（sel_gen 必前进），拒绝路径零变化；解决 036 回执面 `active_path==tp` 的「目标=当前页」误判族。零结果/失败不关弹层不改 recents（F6/F8 实测）。

## 5. 关态清理门（外部关态兜底冻结）

- 世代/请求号 `quick_seq` 递增触点：重开（入口）、查询变更（QuickEdit）、关闭（取消）、拾取启动；`quick_busy` 置位/复位对称。
- 在途拾取每等待期门 = `store.quick_open == true && quick_seq == myseq && uid/gen/key/body 五查`——vue Escape/X 直写 `quick_open=false`（无回调）与重开递增世代同门兜住（036 B-10 同族泄漏面封死）。
- busy 阻止重复确认（QuickPick/QuickConfirm 入口守卫）；Escape/取消/关闭永不受 busy 阻断。
- 取消零副作用：不动 tabs/active_key/active_body/dirty/save_note/磁盘（F8 实测；P 组生产扩臂承载全谱）。

## 6. 执行期定谳边界（如实分列）

- VM Escape 关闭、VM Tab 键程遍历：上游 modal/合成通道边界，owner=上游（F-038-R1 单列计划 §10）；不阻塞本片交付（取消钮+vue Escape 承载同终态）。
- `__focus_result` 观察位为生产模型新增字段（仅 ui.focus 回执观察，无业务消费）——SD-01 终版将记入。
- merged 臂 exists/read 为进程内同步直调——**真实异步等待窗（busy/迟到票据）在 merged 无可验证对象**，与 036/037 同判：门代码 + vue e2e route-delay 反例（T-04）+ 上游语料承载，VM 面不假绿。
