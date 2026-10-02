# 034-editor-host-supply.md — PLAN-034 逐仓供给需求与解锁门（工作阶段附件）

> 状态：T-03 落表。拟议接口均为**尚非现行 API**的提案——不写为已实现，不在本 Plan 中跨仓实现，不预分下一业务号。
> 证据基线：attachments/034-editor-host-contract.md（矩阵终判）+ tests/probe_editor_host.mjs + e2e/editor-host-capabilities.spec.ts（revision 177e0c1 链）。

## 出口决策总表（AC-07/AC-08）

| # | 结论项 | 载体 | 状态 | 下一片归属 |
| --- | --- | --- | --- | --- |
| 1 | 保存接线（宿主入口共 ActSave 门链） | 原生+Vue | **本仓可直接消费**——toolbar/菜单/Ctrl+S 已真实落盘（读回核验门在册）；vue 引擎 @save 消费缺来源身份（§A-1） | R-03b 本仓接线片 |
| 2 | 引擎 Save 钮消费（@save/handleSave） | Vue | 供给存在待接线；**来源身份缺口=上游解锁项**（§A-1）；show_actions 隐藏按钮路线受限于 prop 不存在（§A-2） | 先上游供给，后本仓消费 |
| 3 | 六命令宿主命令桥 | 原生+Vue | 缺供给：native 编辑器执行桥整层缺；vue 组件命令面缺（undo/redo 内部栈不可宿主调） | 先上游供给（§A-3），本仓随菜单禁用/提示片先收口失效入口 |
| 4 | 正文链接接线（open-wiki-link） | Vue | 缺供给双层：生成器 emit 名不匹配（§B-1）+ Jade 未接线；后端四级解析已可消费（link_index 行 target/anchor/exists/target_path 双臂已知答案全过） | 先 auto-lang 生成名解锁，后本仓接线 |
| 5 | selection/cursor/reveal | 双轨 | 缺供给/受阻边界：块聚焦消费面未证（MCP 合成不达 handler、真键 headless 不可达）；caret 行列/选区快照/reveal 无原语；vue data-block-id 块域稳定面已证（切档往返逐值稳定） | 位置能力后续片（R-08/R-11 方向），本片只冻结边界 |
| 6 | 原生 split 前端 | ② | 探针工程 boot 成功（最小宿主无 F-24-2）；jade 应用 split boot 阻断在录（vm_matrix）——接口面与 merged 同转换层，判定继承① | 随上游 F-24-2 清偿重跑 probe |

## A. auto-down（引擎公开动作/事件/动作栏消费）

### A-1 保存事件来源身份（解锁项·优先）

- **现状**：`emit('save', serialize(engine.doc, true))`（md 单参）；`defineExpose({ getBlockMap, handleSave })`。无实例身份字段——Jade 消费侧在多标签/同正文双页下无法绑定事件与 tab_uid/挂载世代（探针 S1 反例直证）。
- **拟议最小接口**（提案）：save/open-wiki-link/focusblock 事件载荷增补实例标识（挂载世代 id 或编辑器实例 uid，由引擎 mount 时生成）；或提供 `serialize` 同源快照序号（每次文本变更递增）供宿主对账 Store 修订。
- **载体**：Vue（EngineEditor.vue）。
- **必要测试**：双编辑器同正文，事件载荷身份可区分；序列化快照序号与 update:modelValue 发射同源递增。
- **兼容约束**：现有 @update:modelValue/@save 消费方（auto-edit 等）零破坏——新增字段只增不改形。
- **解锁证据 = 上游交付含上述双编辑器区分测试绿；此前本仓不得消费 @save**。

### A-2 动作栏控制（show_actions 真消费）

- **现状**：EngineEditor defineProps 无 `showActions`/`canEdit`；动作栏 Save 钮无条件渲染；生成器 bool_prop_binding 发射 `:show-actions/:can-edit` 落 DOM attr（e2e inventory 实证）。
- **拟议最小接口**（提案）：defineProps 增补 `showActions?: boolean`（缺省 true 保现状），false 不渲染 `.autodown-editor-actions`。canEdit 或随 streaming/readonly 面统一裁决（引擎另有 readonly ctx）。
- **解锁证据**：生成 attr 真控按钮显隐的组件测试绿；此前「隐藏引擎 Save 即完成修复」不成立。

### A-3 组件命令面（undo/redo/cut/copy/paste/select-all 宿主可调）

- **现状**：引擎内部 Ctrl+Z/Y 有效（onContentKeydown runHistory）；cut/copy/paste/select-all=浏览器 contenteditable 原生面；**无宿主可调命令 API**（handleSave 是唯一 expose 动作）。
- **拟议最小接口**（提案）：defineExpose 增补 `runCommand(name): boolean`（undo/redo/cut/copy/paste/select-all 六名——返回成功/不可用），或等价 emit 请求/回执对；命令执行沿用引擎历史栈单步语义。
- **必要测试**：六命令逐项真组件调用=内容/选区效果与内部快捷键一致；无栈可撤时回执不可用。
- **解锁证据**：六命令组件级测试绿；宿主菜单从 console_log 降级翻为真实执行。

## B. auto-lang（VM 原语/事件读出与生成映射）

### B-1 open-wiki-link 生成名不匹配（解锁项·优先，小改动）

- **现状**：EngineEditor emit 名为 `'open-wiki-link'`（kebab）；生成器通用事件回退 `onopenwikilink → @openwikilink`（base_event_to_dom strip 'on'）——监听名不匹配，事件不可达（探针 vue 形状：@openwikilink 发射、@open-wiki-link 零命中）。
- **拟议最小接口**（提案）：autodown_editor 臂增事件名映射（onopenwikilink→`@open-wiki-link`；onfocusblock→`@focusblock` 已对齐保留）；或约定 camel→kebab 通用规则。
- **必要测试**：生成形状断言 @open-wiki-link 命中 + 多参载荷（title, blockId?）handler 绑定形状；双轨单源注释同步（aura_view_builder onfocusblock 同款 codegen 直映注）。
- **解锁证据**：探针 vue 形状行翻转（onopen_wiki_link_kebab=true）。

### B-2 原生轨 save/link 消息通道（缺层）

- **现状**：`View::AutodownEditor` 仅 key/value/is_final/on_change/on_focus/placeholder/style（convert_autodown_editor_native）；候选事件名入视图模板但零消费通道（探针 M3 声明显形+零回执）。
- **拟议最小接口**（提案）：View::AutodownEditor 增 on_save（str 载荷=序列化全文）与 on_wikilink（target/anchor 载荷）消息通道，与 on_focus FocusCallback 同型；VM 编辑壳补序列化器消费面。
- **必要测试**：type_text 后合成 save 请求→宿主 handler 回执；含 [[target#anchor]] 文档点击→handler 收 target/anchor。
- **解锁证据**：probe merged 臂 save/link 回执 >0 且载荷形状断言绿。

### B-3 原生轨命令原语（缺层）

- **现状**：key_press 词表无修饰键（PLAN-057 v1——'ctrl+z' Invalid keyspec 实录）；编辑壳 core 无历史/剪贴板消费场景；宿主 handler 可达但无执行桥（探针 C1 回执 6/6 正文零变化）。
- **拟议最小接口**（提案）：编辑壳增命令请求消息（cmd_request(name, request_id) → cmd_receipt(name, request_id, status)），历史栈/剪贴板语义在壳内实现或显式声明不可用回执。
- **解锁证据**：probe C1 后正文效果与回执 status 一致。

### B-4 位置族原语（后续片输入，不在 R-03b 强制）

- **现状**：块聚焦 FocusMetrics(block_index, height) 绑定在册但 MCP 合成路径直写 ghost state 不经 DSL handler（真键鼠标 headless 不可达——消费面未证）；无 caret 行列读出；无 reveal 原语；scroll_sync offset 写入通道在册（PLAN-043）。
- **拟议方向**（提案）：caret/选区快照读出（块 id+偏移域，与 vue data-block-id/getBlockMap 对齐）；reveal(block_id) 请求/回执。**块聚焦≠caret、开页≠定位**边界不变。
- **解锁证据**：真键或等价合成路径下 handler 回执实测。

## C. jade-edit（Store 门、链接业务、菜单入口、错误反馈）——本仓可实施面

| # | 项 | 依赖 | 拟议范围（后续 Plan 细化，本片不实施） |
| --- | --- | --- | --- |
| C-1 | vue 轨 @save 消费接线 | A-1 解锁 | 引擎 Save 事件进入 store.Save 共门链（读回核验/草稿结算/lc_review 门零旁路）；来源=事件身份字段绑定 tab；迟到事件拒绝。**当前不得以 md+active_key 直接消费**（S1 反例） |
| C-2 | 六命令菜单真实化/失效收口 | A-3（真执行）或独立决策（禁用/提示） | 无支持命令的菜单项显式禁用或提示，替代 console_log 降级；菜单/快捷键同结果 |
| C-3 | open-wiki-link 接线 | B-1 解锁 | 监听 open-wiki-link(title, blockId?)→消费 link_index 现行四级解析（target_path 逐路径）→OpenLink(path) 开档口；alias/title/anchor 边界按 name-search 规范（title 不入身份）；缺页走既有悬空建页确认面 |
| C-4 | 保存来源双轨一致性 | A-1/B-2 | merged 宿主捷径路径与 vue @save 路径同门链、同终态语义（失败/取消/新输入终态沿用 Store 现行） |

## D. 明确不做（本片边界重申）

- 不在本 Plan 跨仓实现任何 §A/§B 项；不承诺上游交付时间；R-03b 范围与编号届时按实际结果确定。
- 不把「调查 pass」写成「能力全支持」；每项消费接线仍需实施验收（本片探针不替代功能验收）。
- 既有上游限制（F-32-R2/F-24-2/F-31-R1/F-31-R2/vue 多文件时序族）维持在录口径，不因本片翻案。
