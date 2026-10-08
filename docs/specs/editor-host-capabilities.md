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

> **PLAN-035 收口刷新（2026-10-02）**：下表 ①②③ 行的**能力结论维持**（宿主仍无执行桥——本节为能力核验记录）；界面入口已按 C-2 独立分支收口（失效 toolbar/menu 入口移除、可见说明、宿主三键归还控件、旧 ID/msg 兼容守卫）——现行入口/快捷键/守卫契约见 [editor-command-availability.md](editor-command-availability.md)，本表不再描述已移除的入口面。console_log 降级 handler 已于 035 退役为可见说明守卫（零编辑）。

| 面 | 事实 | 证据 |
| --- | --- | --- |
| ①② native | **缺供给**（结论维持）：宿主通道可达 handler，但 handler→编辑器无执行桥（回执 6/6 正文零变化）。**native 内部撤销描述更正（PLAN-036 SD-04）**：core.rs 已有 Ctrl+Z/Y → block_undo_redo → undo/redo 路径（源码在册，binary 标识提交对应源亦含）；「内部撤销不存在」系旧推论过强——自动化 key_press 词表无修饰键只证明**仪器受限**，不证明运行时无内部撤销；真键与各类编辑历史覆盖仍待补证（宿主命令桥缺口不因内部实现存在而消失） | probe C1/C2（隔离工程缺桥模拟——历史证据，与生产守卫分域）+ 上游复核记录 §2 |
| ③ Vue 内部快捷键 | **已可消费**（编辑器内部；035 后宿主 keymap 三键移除——引擎内部撤销独占不被空 handler 并行）：引擎内部 Ctrl+Z/Y 真键撤销/重做生效（onContentKeydown runHistory）；cut/copy/paste/select-all=浏览器 contenteditable 原生面 | e2e commands + editor-command-availability §2 |
| ③ Vue 宿主菜单 | **缺供给→已收口**（035）：六菜单执行项移除，唯一入口=「编辑命令说明…」可见 dialog；直派兼容消息=守卫说明零编辑（C-2 独立分支交付，命令桥仍缺） | probe_command_availability 真实 Store 臂 + editor-command-availability §1 |
| 全局热键冲突 | **035 收口半**：Ctrl+Z/Y/A 宿主注册已移除（空 handler 不再截获正文/输入框按键）；**生成器组合键丢 Shift 位维持**：`Ctrl+Shift+O` 实测被 `'Ctrl+o'→ActOpen` 抢占（孤页清单快捷键失效；Ctrl+Shift+F/D 同族塌缩）——上游缺口不在 035 修复 | e2e commands 实录 + App.vue `__autoActionsKeymap`（三键已消） |

### 1.3 链接（link）

> **PLAN-036 刷新（2026-10-02）→ PLAN-037 刷新（2026-10-03）**：③ Vue 正文链接已由「缺供给双层」升级为**已消费**——完整事件名接线+单目标只读解析+导航保护交付，现行契约见 [wiki-link-navigation.md](wiki-link-navigation.md)。**①② native merged 链接事件升级为已消费（PLAN-037）**：上游供给链 auto-lang PLAN-732（wikilink attr 语义消费+合成通道）+PLAN-737（ADE_LINK_DISPATCH 派发根修）+PLAN-739（输入补丁摘臂）后，merged 生产真实点击经同一 `on "open-wiki-link"` 直达消费全门——绑定版本 v0.4.2-2713+（PLAN-739 tip）；native **split** 载体 boot 已恢复（F-24-2 未复现，probe_editor_host B1）而 split 链接消费未联验单列。简称 `onopenwikilink` 上游已支持属性简写绑定（便利形态）。

| 面 | 事实 | 证据 |
| --- | --- | --- |
| 后端解析供给 | **已可消费**：`link_index` 行 `{target, anchor, exists, target_path}` 四级已解析（stems 精确→aliases 精确→stems casefold→aliases casefold；anchor=`#` 首现拆分透传）——merged 直调与 split HTTP 双臂已知答案全过。**PLAN-036 增补单目标口**：`POST /api/resolve_wiki_link`（只读零写、目录现读、无效/missing 严格区分——导航主承面） | probe N3/B2 + probe_wiki_link B3 十案 |
| ③ Vue 链接事件+导航 | **已消费（PLAN-036 交付）**：完整事件名 `on "open-wiki-link"` 双参消费（第二参=目标锚点非来源身份；缺参显式归一）→ 单目标解析 → NavCommit 同步门导航（源票据/选择世代/每等待期门/迟到拒绝/缺页确认/独立提示）——**title 不被当 path、外链零路由**；简称 `@openwikilink` 兼容面仍不匹配（零监听，归 auto-lang） | e2e wiki-link-navigation 八测 + editor-host-capabilities navigation 案（真实导航）+ [wiki-link-navigation.md](wiki-link-navigation.md) |
| ①② native 链接事件（merged） | **已消费（PLAN-037 交付）**：生产完整点击门（左键按下抬起同链接区间，拖选/右中键/陈旧命中零激活）→ 六环派发 → 同一 OpenWikiLink 消费全门；双同正文实例 per-instance origin（无全局单槽）；缺页确认取消/创建 live 可达 | probe_native_wiki_link N/O/P/M 五臂（N2..N5+O 组+M 组全绿）+ [wiki-link-navigation.md](wiki-link-navigation.md) 原生证据行 |
| ①② native 链接事件（split） | **未联验**：split 前端 boot 已恢复（F-24-2 未复现，probe_editor_host B1），split 载体的链接消费未验证——单列，不以 merged 证据替代 | probe_editor_host B1 |
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
3. **命令历史归属**：编辑器拥有历史栈/选区/执行；宿主只传命令请求并消费回执。宿主不得复制历史栈、不得借 DOM 私有实例或整文重置模拟撤销/复制/选区。无支持的命令入口不得伪造成功——035 起现行形态=入口收口+可见说明守卫（[editor-command-availability.md](editor-command-availability.md) §1.2）；原 console_log 降级为历史形态不再使用。
4. **链接身份**：链接事件 target 消费现行四级解析（link_index target_path 逐路径），title/alias 不成为路径身份；`OpenLink(path)` 是开档口——不得将未解析 title 拼 `.ad` 直开或重写磁盘；缺页走既有悬空确认面，外链/白名单规则独立裁决。
5. **位置语义**：块聚焦≠caret 行列；开页≠定位成功；data-block-id 块域与 getBlockMap 为公开坐标域，caret/选区偏移单位与挂载世代稳定域在供给落地前不预设。
6. **show_actions 边界**：在 A-2 供给前，任何「隐藏引擎 Save 钮」的方案不成立；控制动作栏与可靠接入两路线均须真实验证后裁决。

## 3. 缺口与交接（SD-03）

按仓最小需求、拟议接口（**尚非现行 API**）与解锁证据见 [034-editor-host-supply.md](../plans/attachments/034-editor-host-supply.md)。摘要：

- **auto-down**（§A）：A-1 保存/链接/聚焦事件载荷增实例身份（本仓消费 @save 的前置解锁）；A-2 showActions/canEdit 真消费 prop；A-3 六命令宿主可调面（runCommand 或等价回执对）。
- **auto-lang**（§B）：B-1 open-wiki-link **简称** `@openwikilink` 生成名兼容（**PLAN-036 后缩窄为兼容面**——完整事件名 `on "open-wiki-link"` 已消费，正文导航不依赖本项；另 B-0 族新增上游缺口见 [wiki-link-navigation](wiki-link-navigation.md) §4：输入期 wikilink 解析缺失/空编辑器零块/块底 boundary 命中区遮挡——如实上告 owner=auto-down）；B-2 原生轨 save 通道（**link 通道已由 PLAN-037 交付解除**——上游 732/737/739 链，merged 已消费；split 消费未联验单列）；B-3 原生轨命令原语（key_press 词表无修饰键为仪器受限锚定——native 内部撤销源码路径在册，真键覆盖待补证）；B-4 位置族原语（caret/选区/reveal——R-08/R-11 方向输入）。
- **jade-edit**（§C，本仓可实施面，后续 Plan 细化）：C-1 @save 消费接线（依赖 A-1）；C-2 六命令菜单真实化/失效收口——**已由 PLAN-035 交付独立分支**（失效收口形态：入口移除+可见说明+兼容守卫+三键归还，见 [editor-command-availability.md](editor-command-availability.md)；真执行仍待 A-3/B-3 解锁后另立消费片）；C-3 open-wiki-link 接线——**已由 PLAN-036 交付 Vue 片 + PLAN-037 交付 native merged 片**（完整事件名消费+单目标解析+导航保护+原生真实点击，见 [wiki-link-navigation.md](wiki-link-navigation.md)）；C-4 双轨保存同门链一致性。
- **已知上游边界维持**：F-32-R2（VM 局部槽串扰）、F-24-2（jade 应用 split boot）、F-31-R1（engine dist 新鲜度义务）、F-31-R2（vue handler 互调未 await）、vue 多文件 e2e 时序族——本片如实分列，不因调查结论翻案。

## 4. 验证与边界

- 可重跑：`node tests/probe_editor_host.mjs --phase inventory|save|commands|navigation|all`（merged 探针工程 + 原生 split boot 尝试 + split HTTP + vue 生成形状）；`pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts --grep 'inventory|save|commands|navigation'`。
- 结果语义：**预期缺能力案（unsupported/受阻）按行在案即调查通过**——不当作功能成功；每项消费接线仍需实施验收，本规范与探针不替代功能验收。
- 生产源码与既有四局部规范（editor-safety/draft-recovery/document-lifecycle/name-search）承诺零变更；本片新增测试不降低任何现行套件口径。
- 工具链指纹与矩阵逐格证据以 PLAN-034 附件为准（revision 绑定见附件 §0/§4）。
