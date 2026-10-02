# editor-host-capabilities — 编辑器宿主能力核验与供给契约（PLAN-034 · R-03a）

> 状态：**能力核验与消费约束规范**——记录六类宿主接口（save/command/link/selection/cursor/reveal）在三载体上的实际能力边界、后续接线的消费约束与逐仓供给缺口。
> **本规范不是功能接线交付**：R-03（编辑器宿主接线）整体未完成；本片只交付 R-03a（能力核验与契约）。拟议接口（§3）均尚非现行 API。
> 证据：PLAN-034 附件 [034-editor-host-contract.md](../plans/attachments/034-editor-host-contract.md)（矩阵）+ [034-editor-host-supply.md](../plans/attachments/034-editor-host-supply.md)（逐仓供给）+ 可重跑探针 `tests/probe_editor_host.mjs` + `e2e/editor-host-capabilities.spec.ts`。

## 1. 当前能力与载体（SD-01）

三载体：①原生 merged（`auto run -r vm`，进程内 CALL）②原生 split（`--no-merge`；jade 应用 boot 阻断 F-24-2 在录，接口面与①同转换层判定继承；最小探针工程 boot 成功证阻断为 jade 应用面）③Vue＋split 后端（serve-back + gen/front/vue）。判定分四态：已可消费／供给存在待接线／缺供给／受阻。

### 1.1 保存（save）

| 面 | 事实 | 证据 |
| --- | --- | --- |
| 宿主保存入口（toolbar/菜单/Ctrl+S 共 ActSave） | **已可消费**（双轨）：三入口共 `ActSave → store.Save` 门链（untitled 另存旁路、lc_review 待核验门、快照-读回核验、草稿结算、较新输入保 dirty） | e2e save：toolbar 与编辑器聚焦态真键 Ctrl+S 均真落盘（原文/标记/frontmatter 三验 + 单次无双保存面）；editor-safety/draft-recovery 规范门链在册 |
| ①② 编辑器 save 事件 | **缺供给**：`View::AutodownEditor` 仅 key/value/is_final/on_change/on_focus/placeholder/style——无 save 消息通道；候选 `onsave:` 语法入视图模板但零消费（快照显形+零回执） | probe M3/S2（save 回执恒零）+ aura_view_builder convert_autodown_editor_native |
| ③ 引擎动作栏与 @save | **供给存在待接线**：EngineEditor 无条件渲染 Save 钮（`emit('save', serialize(engine.doc, true))`；`defineExpose handleSave`）；App.vue 仅听 `@update:modelValue`——点击引擎 Save 钮=零落盘+脏标保。**`:show-actions` 非 prop**：EngineEditor defineProps 无 canEdit/showActions，生成 attr 透传为 DOM 属性（`show-actions="true"` 可测），按钮显隐不受其控制——「隐藏引擎 Save」路线在 prop 供给前不成立 | e2e inventory（attr 透传）+ e2e save（点击零效果）；EngineEditor.vue defineProps |

### 1.2 命令（undo/redo/cut/copy/paste/select-all——逐项）

| 面 | 事实 | 证据 |
| --- | --- | --- |
| ①② native | **缺供给**：宿主通道（actions 捷径 Ctrl+Z/Y/A + 按钮/菜单）可达 handler，但 handler→编辑器无执行桥（回执 6/6 正文零变化）；编辑器内部撤销不存在——key_press 词表无修饰键（`'ctrl+z'` Invalid keyspec 实录，PLAN-057 v1）；cut/copy/paste 无捷径在册 | probe C1/C2 |
| ③ Vue 内部快捷键 | **已可消费**（编辑器内部）：引擎内部 Ctrl+Z/Y 真键撤销/重做生效（onContentKeydown runHistory）；cut/copy/paste/select-all=浏览器 contenteditable 原生面（Ctrl+A 并行零破坏） | e2e commands |
| ③ Vue 宿主菜单 | **缺供给**：六菜单 handler 仅 console_log 降级（T-00 实勘在录）——菜单 撤销点击对新变更零效果 | e2e commands + editor_store.at ActUndo 族 |
| 全局热键冲突 | vue keymap 修饰键全局拦截无焦点甄别（Ctrl+Z/A 双通道并行当前无害）；**生成器组合键丢 Shift 位**：`Ctrl+Shift+O` 实测被 `'Ctrl+o'→ActOpen` 抢占（孤页清单快捷键失效；Ctrl+Shift+F/D 同族塌缩）——下一片处理项，不在本片修复 | e2e commands 实录 + App.vue `__autoActionsKeymap` |

### 1.3 链接（link）

| 面 | 事实 | 证据 |
| --- | --- | --- |
| 后端解析供给 | **已可消费**：`link_index` 行 `{target, anchor, exists, target_path}` 四级已解析（stems 精确→aliases 精确→stems casefold→aliases casefold；anchor=`#` 首现拆分透传）——merged 直调与 split HTTP 双臂已知答案全过 | probe N3/B2（目标页/靶心→Tgt.ad；tgt casefold；缺失页悬空；`目标页#sec1` anchor 伴随） |
| ③ Vue 链接事件 | **缺供给双层**：渲染面公开（`span.autodown-wikilink-label[data-wikilink-title]`）；点击 emit `'open-wiki-link'(title, blockId?)` 但 ① App.vue 零监听（点击零导航——title 不被当 path 打开，安全侧现状）② 生成器发射名为 `@openwikilink`，与 emit kebab 名不匹配（事件不可达） | e2e navigation + probe vue 形状 |
| ①② native 链接事件 | **缺供给**：VM 编辑壳无链接点击路由与消息通道（M3/N2 零回执） | probe M3/N2 + widget.rs |
| 宿主开档口 | `OpenLink(path)` 接收**已解析 path**（反链/出链 target_path、拾取、建页导航共用）——是开档口不是 title resolver；title 不入链接身份（name-search 规范边界延续） | app.at OpenLink + name-search §2 |

### 1.4 selection / cursor / reveal

| 能力 | 事实 | 证据 |
| --- | --- | --- |
| 块域（reveal 候选坐标域） | **已可消费**（vue 公开契约）：`data-block-id` DOM 面 + `getBlockMap` 公开导出；块 id = `^anchor` 显式或 `block-<i>` 位置回退，同内容切档往返逐值稳定（e2e 实证） | e2e navigation + block-map.ts |
| 块聚焦（focusblock） | ③ 供给存在待接线：emit `focusblock({id,height}|null)`+生成器 `@focusblock` 名匹配；① 绑定在册（onfocusblock→on_focus FocusCallback）但宿主消费面**受阻**——MCP click 合成路径直写 ghost state 不经 DSL handler，真键鼠标 headless 不可达（未证非可用） | probe M3/N2 + PLAN-044 T6 注 |
| caret 行列 | **缺供给**：双轨无 caret 偏移读出字段（oncursor 仅 code_editor 壳）；块聚焦≠caret、开页≠定位 | vue.rs base_event_to_dom 注 + probe |
| 选区快照 | **缺供给**：双轨无宿主选区读出原语（vue DOM 选区=浏览器面；editor_drag 为 MCP 合成通道非读出面） | probe/转换层 |
| reveal 调用 | **缺供给**：无块/锚定位原语；scroll_sync offset 写入通道在册（PLAN-043，像素滚动非块定位） | probe + aura_view_builder |

## 2. 消费约束（SD-02——后续接线的必须项，非已实现功能）

1. **保存来源身份**：事件载荷=全文 md 单参（INPUT_TEXT 与 vue `emit('save', md)` 同形），**无 tab_uid/实例世代字段**。同正文双页+active 读回不可辨识来源（probe S1 反例：A/B 同正文、active 恒指 A、事件源于 B——零串扰可分但判源不可）。任何 save 事件消费**必须**绑定可核来源（上游身份字段或等价机制）方可入 store.Save 门链；仅凭 md+active_key 消费被本规范禁止。
2. **保存共门**：save 接线必须进入现行 `store.Save` 全链（untitled 另存旁路、lc_review 待核验门、写盘读回核验、草稿结算 saved、较新输入经比较保 dirty、取消/写失败/核验失败终态）——不得新 onSave 直写 write_wiki；不得以较旧 save(md) 覆盖 Store 最新正文（迟到事件拒绝）。
3. **命令历史归属**：编辑器拥有历史栈/选区/执行；宿主只传命令请求并消费回执。宿主不得复制历史栈、不得借 DOM 私有实例或整文重置模拟撤销/复制/选区。无支持的菜单入口在接线前不得伪造成功（console_log 降级为在录已知状态，非终态）。
4. **链接身份**：链接事件 target 消费现行四级解析（link_index target_path 逐路径），title/alias 不成为路径身份；`OpenLink(path)` 是开档口——不得将未解析 title 拼 `.ad` 直开或重写磁盘；缺页走既有悬空确认面，外链/白名单规则独立裁决。
5. **位置语义**：块聚焦≠caret 行列；开页≠定位成功；data-block-id 块域与 getBlockMap 为公开坐标域，caret/选区偏移单位与挂载世代稳定域在供给落地前不预设。
6. **show_actions 边界**：在 A-2 供给前，任何「隐藏引擎 Save 钮」的方案不成立；控制动作栏与可靠接入两路线均须真实验证后裁决。

## 3. 缺口与交接（SD-03）

按仓最小需求、拟议接口（**尚非现行 API**）与解锁证据见 [034-editor-host-supply.md](../plans/attachments/034-editor-host-supply.md)。摘要：

- **auto-down**（§A）：A-1 保存/链接/聚焦事件载荷增实例身份（本仓消费 @save 的前置解锁）；A-2 showActions/canEdit 真消费 prop；A-3 六命令宿主可调面（runCommand 或等价回执对）。
- **auto-lang**（§B）：B-1 open-wiki-link 生成名 kebab 不匹配（优先解锁，小改动）；B-2 原生轨 save/link 消息通道；B-3 原生轨命令原语（key_press 词表无修饰键为源码锚定）；B-4 位置族原语（caret/选区/reveal——R-08/R-11 方向输入）。
- **jade-edit**（§C，本仓可实施面，后续 Plan 细化）：C-1 @save 消费接线（依赖 A-1）；C-2 六命令菜单真实化或失效收口（禁用/提示）；C-3 open-wiki-link 接线（依赖 B-1，消费四级解析）；C-4 双轨保存同门链一致性。
- **已知上游边界维持**：F-32-R2（VM 局部槽串扰）、F-24-2（jade 应用 split boot）、F-31-R1（engine dist 新鲜度义务）、F-31-R2（vue handler 互调未 await）、vue 多文件 e2e 时序族——本片如实分列，不因调查结论翻案。

## 4. 验证与边界

- 可重跑：`node tests/probe_editor_host.mjs --phase inventory|save|commands|navigation|all`（merged 探针工程 + 原生 split boot 尝试 + split HTTP + vue 生成形状）；`pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts --grep 'inventory|save|commands|navigation'`。
- 结果语义：**预期缺能力案（unsupported/受阻）按行在案即调查通过**——不当作功能成功；每项消费接线仍需实施验收，本规范与探针不替代功能验收。
- 生产源码与既有四局部规范（editor-safety/draft-recovery/document-lifecycle/name-search）承诺零变更；本片新增测试不降低任何现行套件口径。
- 工具链指纹与矩阵逐格证据以 PLAN-034 附件为准（revision 绑定见附件 §0/§4）。
