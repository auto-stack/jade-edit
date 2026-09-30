# PLAN-030 T-01 能力核查：安全手动重载

日期：2026-09-30。基线 main@9ab1b57。执行者：agent（auto-plan:work）。
方法：静态实勘（src/gen/上游生成器/引擎源）+ 双轨最小实操探针各一次
（`e2e/.runtime/p30-probe/probe-vue.mjs`、`probe-vm.mjs`，一次性件居
ignored；工具链载体 auto.exe debug 09-30 16:01 = v0.4.2-2311-g7fcf913eb）。

## 结论总表

| # | 核查项 | 结论 | 证据 |
| --- | --- | --- | --- |
| C1 | 连续输入后（无 blur）store 是否最新 | **两轨均为逐键同步**（D-17 blur 门控已退役） | 探针 A/V1 + 引擎 0.5.0 源 |
| C2 | 编辑器焦点内按 F5（vue） | **现势为死键**（action 不触发；无导航无内容损失） | 探针 B + 生成器守卫源 |
| C3 | 编辑器焦点外按 F5（vue） | action 触发——现势不安全重载直证 | 探针 C |
| C4 | vm 轨重载现势 | INPUT_TEXT → dirty=true；toolbar 重载无守卫吞掉 LOCAL_A 换 DISK_B | 探针 V1/V2 |
| C5 | 确认弹层键盘行为（先例族） | vue：初始焦点=取消钮、**Enter=取消（安全默认）**、Escape 关（v-model 双向）；vm：Modal 形态 Esc/外点不关 | 探针 D + reka/上游源 |
| C6 | 单 map 消息/回执需求 | **不需要 ReloadReadOf 回执消息**——生成器把 store handler 编为 async、`read_wiki` 可在 handler 内直接 await，迟到门在 await 恢复后就地复核 | 生成源 useEditorStore.ts |
| C7 | F5 单源接线 | 上游 `bind {}` 块（464 T2 层）编辑器焦点内 F 键仍可达 + preventDefault——**F5 移交 bind 层、action 去 shortcut**（避免焦点外双派发） | vue.rs 4265/4290 两层守卫对比 + aura/session vm 侧支持 |
| C8 | 手动/内部入口清单 | 手动口唯一 = App `.Reload`（action view.reload[toolbar] + 视图菜单 menubar-item + F5）；内部口四个 = RenameGo/MoveGo/RenDirGo/MoveDirExec 内 `store.Reload()` | app.at 2215/2782/2985/3143/3278 实勘 |

## 探针实录

### vue 轨（probe-vue.mjs，serve-back 8211 + vite dev 4443 + chromium）

```text
[A-type-sync] 未保存 立即可见（无 blur——store 逐键同步）
[B-f5-in-editor] navigations=0 appRebooted=误报(ready 恒显) localMarkerStill=true
                 → F5 编辑器内无动作、无导航、内容无损 = 死键
[C-f5-outside-editor] action 触发（reloaded: wiki/Hello World.ad）→ 现势不安全重载
[D-dialog-focus] activeElement=BUTTON:取消
[D-enter] dialogStillOpen=false docStillOpen=true → Enter=取消（安全默认）
```

截图物证：`e2e/.runtime/p30-probe/a-typed-no-blur.png`、`b-after-f5-in-editor.png`、
`c-after-f5-outside.png`、`d-dialog-open.png`。结果文本：`probe-vue-result.txt`。

### vm merged 轨（probe-vm.mjs，AUTOUI_MCP_PORT=8311 + 隔离 fixture）

```text
[V1-type_text] INPUT_TEXT → active_dirty=true（store 同步口可达）
[V2-unsafe-reload] LOCAL_A 被 DISK_B 替换（现势无确认）
                   dirty=false note="reloaded: wiki/Hello World.ad"
```

结果文本：`probe-vm-result.txt`。vm 轨无真实键盘注入通道（MCP 无按键
工具），键级发射以下述结构证据承载，实测留待 T-04 载体全链（toolbar/
菜单入口同 handler）。

## 静态证据

### C1 输入同步

- 引擎 `@autodown/engine` 0.5.0（gen/front/vue/node_modules）
  `src/editor/components/EngineEditor.vue`：`engine.onChange(() => { …
  const textChanged = emitUpdate() … })`，`emitUpdate()` 按 md 去重后
  **每次变更即发** `update:modelValue`——无 blur 门控残留（D-17 unlock
  = 上游 PLAN-677 键入发射修复已落，0.5.0 载体在册）。
- vue 编译面：`App.vue` `@update:modelValue="Edit"` → store Edit 逐键
  全文回写（INPUT_TEXT 通道）。
- vm merged：`auto-lang crates/auto-lang/src/ui/desktop_protocol/
  native_projector.rs:1007`「text_changed 时 INPUT_TEXT 全文代写 +
  on_change 派发」——逐键同步为结构性事实；探针 V1 实证 store 口。
- 结论：**即时 F5 场景两轨 store 均持最新正文**，保护判定（dirty/body
  快照）无需冲刷前置；e2e 不得预置中性 blur 来凑保护通过（plan §6 纪律）。

### C2/C7 F5 键位两层机制

- actions 层守卫（上游 `ui_gen/vue.rs:4274` 生成）：无修饰键且焦点在
  `INPUT/TEXTAREA/contenteditable` → 直接 return——F5 编辑器内死键
  （探针 B 实证：无动作、无导航）。
- `bind {}` 层（`vue.rs:4326`）：同一守卫仅让位**会进文本的键**
  （单字符/Backspace）——F5/Enter/Escape 焦点内仍可达，命中即
  `preventDefault()` + 派发。vm 侧 = keyboard_subscription key_str
  同名机制（vue.rs:4290 注 + aura_view_builder/session/native_widget
  消费 `.bind`）。
- 方案：`action view.reload` 去 `shortcut: "F5"`；App widget 增
  `bind { "F5" -> .Reload }`。单点派发（双层并存会焦点外双触发）；
  menubar-item 的 `shortcut: "F5"` 仅为显示标签，保留。
- 附带收益：bind 层 preventDefault 同时压掉浏览器 F5 默认（页面刷新），
  vue 轨浏览器部署形不再有整页刷新风险路径。

### C5 确认弹层族

- vue = reka-ui AlertDialog（`components/ui/alert-dialog/*` 薄壳），
  编译为 `v-model:open` 双向：Escape → Radix 关闭 → `update:open(false)`
  回写 store 开态（快照标量残置惰性，下次 RequestReload 重快照覆盖；
  文档边界注记）。初始焦点 = 内容首个可聚焦元素 = 取消钮（页序在前）；
  探针 D 实测 activeElement=取消、Enter=取消。
- vm = Modal popover（上游 `ui/view.rs:1332`：**外点/Esc 不关**，仅
  cancel/action 钮经状态翻转关闭）——vm 轨弹层开态与 store 恒一致，
  无 Escape 失同步面。

### C6 消息形态

- 生成源 `gen/front/vue/src/stores/useEditorStore.ts`：`const Reload =
  async () => { … try { body = await read_wiki(...) } catch … }`——
  handler 本体 async，back.api 调用可内联 await；等待期间其它 handler
  （Edit/TabActivate/CloseTab）照常派发 = 迟到竞态面真实存在，
  **读后复核门必须在 await 恢复后就地执行**（方案：零载荷消息四枚
  RequestReload/ReloadCancel/ReloadDiscard/ReloadReadOf，无单 map
  需求；Open(map) 先例在册备用）。
- merged 臂 read_wiki 进程内直调同步完成，竞态窗结构性不存在，同一
  门代码双轨共享。

### C8 入口清单（T-03 改动面）

| 入口 | 位置 | 处置 |
| --- | --- | --- |
| App `.Reload`（用户口） | app.at:2215 | 改委托 `store.RequestReload()` |
| action `view.reload`（toolbar+F5） | app.at:1260 | handler 不变；去 `shortcut: "F5"`（T-01 C7） |
| 视图菜单 menubar-item | app.at:1338 | `onclick: .Reload` 不变 |
| `bind { "F5" -> .Reload }` | app.at actions 块后（新增） | T-01 C7 单源接线 |
| RenameGo → `store.Reload()` | app.at:2782 | 内部口保持 |
| MoveGo → `store.Reload()` | app.at:2985 | 内部口保持 |
| RenDirGo → `store.Reload()` | app.at:3143 | 内部口保持 |
| MoveDirExec → `store.Reload()` | app.at:3278 | 内部口保持 |

## 出口判定

**可本仓实现**（T-02/T-03 按 §2/§5.1 设计推进），无上游供给 blocker。
等价调整两项（均在 plan §5.1 授权的"T-01 验证后可作等价命名调整"内）：

1. 不设 ReloadReadOf 回执消息载荷需求 → 仍以四枚零载荷消息承载
   （读盘 await 内联于 handler，plan §5.1 的"ReloadReadOf 若需载荷"
   前提不成立）。
2. F5 由 action shortcut 移交 `bind {}` 层（新增接线，消除 C2 死键 +
   浏览器刷新风险；action 去 shortcut 属键位面调整，非验收弱化——
   AC-01 的 F5 验收行为由 bind 层兑现且两轨同语义）。

无内部风险移交 R-02 的新项（内部四口事务语义维持现有边界，plan §2
已声明不由本项完成）。
