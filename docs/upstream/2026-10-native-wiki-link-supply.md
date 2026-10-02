# VM 原生正文内链：auto-lang 供给交接

日期：2026-10-02。消费者：[PLAN-037](../plans/037-native-wiki-link-navigation.md)。这是 Jade 的上游需求包，不是已经登记／批准执行的 auto-lang Plan；不占 auto-lang 编号、不修改其规范或代码。

## 1. 为什么仍不能接线

Jade PLAN-036 已交付 Vue 片。调查开始时 auto-lang HEAD `fe5327acf70b20cc3791840195234c05f5df9697`，binary 为 `auto 0.1.0+v0.4.2-2573-g982e80004-dirty`，SHA256 `D63B3DDC722D606167516BF2C6AFE3709C5B32353BA03A090E7C3B3D8070B19B`。上游有其他会话在工作，本次未改动。

**收尾漂移复核（2026-10-02T13:20:35Z）**：外部会话完成 PLAN-729 后，HEAD 更新为 `7d50989f7a65497a379b8f1d1321a32a45a7e246`，实际 binary 变为 `auto 0.1.0+v0.4.2-2607-gb3149f74f`，SHA256 `0688B14584F8D3B017F844F579A9353BEBFA299B9C0FFCE143AA55DA0F945F33`。下表五个原生供给环节源码指纹复核恒等，仍没有 U-01..06 新的供给交付证据，因此不解锁消费。旧运行期限制是历史证据；T-01/02 应绑定新 binary 重测，包括 native split 状态，不能声称旧回归结果自动适用于新版本。本次没有重跑应用。

已核实以下链路均没有 wikilink 激活消息：

| 环节（相对 auto-lang 根） | 当前事实 | SHA256 |
| --- | --- | --- |
| crates/auto-lang/src/ui/autodown_editor/core.rs | DocOutput 只有 text/cursor/focus/redraw/captured；flatten_inlines 仅将 Link/Image 归为样式，不保存可消费目标。需补链接语义与布局命中，不能只加回调字段 | DFB6884E8D5322D2241A8DA287B4A3C2BC51DFCD4AB8332D965E4ECF4AC2730C |
| crates/auto-lang/src/ui/autodown_editor/widget.rs | DocEditor.publish 只发 on_change/on_focus；真实 iced 指针映射进入 DocInput，与 MCP 合成点击不同 | 755AB0EC703ED273DD41533614398BD35D5562A86FC62C8D7A8F455321A95523 |
| crates/auto-lang/src/ui/view.rs | View::AutodownEditor 无 link callback，map/cloning 也须随字段扩展 | 59CBF773E6539857D2BCB91134138DCB969DABD177B54BF430A5E7FFC0F5A592 |
| crates/auto-lang/src/ui/aura_view_builder.rs | convert_autodown_editor_native 只有 oninput 与 onfocusblock 消费，完整事件名目前不产生链接回调 | 0B44B8576A193820E8A9C043E53E8338638CB3E8537B29CC064528C69BA88012 |
| crates/auto-lang/src/ui/iced/renderer.rs | AutodownEditor lowering / build_autodown_editor_generic 尚无该回调传递 | 98CC4C8995D6D2BCB5373AB057FFCC3075190A87BCC0A4C82D9C4C7D2591D7EB |

因此这不是在 Jade 再加一行 on 监听即可完成的功能，也不能以 backend resolver 双臂通过称 native UI 可点击。

## 2. 供给契约（待上游 Plan 原型冻结，尚非现行 API）

- **U-01 链接语义与坐标**：对加载期存在的合法 `[[target]]` / `[[target#anchor]]` 保留目标与目标锚点，并生成与当前布局一致的可命中区域。复用 AutoDown 解析语义；中文、行内前后文字、换行折行、段落／标题／列表／引用的文本域可识别。代码块／行内代码中的字面标记与普通 Markdown 外链不触发 wiki 导航。不得把整块矩形作为链接命中域。
- **U-02 编辑与激活**：建议普通左键完整点击（按下→抬起）激活，与 Vue 页面导航结果一致；拖选、非链接、右／中键、越界释放、失焦、布局／正文变化后的陈旧命中均零激活。文字编辑、IME、选区、内部撤销和外层滚动不回退。像素阈值与文本字节／字形位置映射在有界原型确定，不能在前端硬编码块索引猜坐标。若必须采用修饰键方案，提交具体用户操作与理由，修订消费 Plan 的交互验收后再实施。
- **U-03 实例回调**：core 输出 → DocEditor.publish → View callback → iced lowering → AURA 事件 → DynamicMessage → 真实 Auto handler 全链到达。链接业务载荷为两个字符串 target、target_anchor（无锚=空），首个 # 拆分并与 Vue 分别 trim 的结果一致；第二参不是源块身份。兼容完整 `on "open-wiki-link"`，简称兼容不是本片前置。
- **U-04 来源与世代**：回调必须绑定实际来源 editor key / 挂载代次，不用全局 last-mounted 单槽。失效／卸载／换内容后排队的旧激活不能被当前活动页冒领。可选择框架先验证来源后派发，或公开 origin 供 Jade 适配器复查；T-01 冻结公开形态和双同正文实例反例。来源身份不清楚不能默认 active_key 接收，且不得由此宣称 save 判源已解决。
- **U-05 真实事件验证面**：提供经过生产 DocEditor 指针处理与 Shell.publish 的可复跑证据。当前 MCP click 可能走 ghost/state 合成通路，不能用改状态／直派 handler 代替点击能力。自动化若采用测试输入 seam，必须注入真实 iced event 路径，与生产共一实现，不新增只在测试生效的第二套 hit-test；记录窗口／布局和 binary 指纹。需证明 core、widget/Shell、DSL handler、Jade 打开目标四层，不以计数器或快照有蓝字独立验收。
- **U-06 兼容边界**：未声明回调的应用继续编辑，事件新增默认 None，feature-off 降级、View map、scroll_sync 包装、原有 oninput/onfocus 均保留。Vue 036 保持现行完整事件消费；本片不连带保存、命令、reveal、全局 Shift 或所有输入期重解析。

## 3. 上游执行与解锁门

owner＝auto-lang 的原生 AutoDown 编辑器／AutoUI 运行时；AutoDown 模型若确需扩展，先说明接口缺口并独立登记 auto-down 供给，不让 Jade 私自复制解析器。

auto-lang 仓 `AGENTS.md` 要求 L1 使用 `scripts/new-plan.sh` 独占分配、`docs/plans/archive/` 历史目录、专属 worktree 及独立 review/merge。本包不能代替上游正式 Plan。上游 canonical 输入至少为 docs/specs/overview.md、auto-lang/ui/overview.md、ui/architecture.md、design/mcp-pointer-input.md；当前未见专门 native wiki-link 局部 Spec，供给 Plan 应提出新增与 UI 索引更新，而不是用旧账本覆盖事实。

上游有界调查每个关键问题一次原型＋一次原因针对复测，输出布局／交互／载荷／来源／验证形态契约；无法达成应报 needs_replan/blocker，不删 U 条款。建议按语义／命中、真实回调、DSL 和验证三个可独立验证阶段实施。不得在其 master 混入本需求代码或挪用已有 WIP。

解锁必须同时有：①已 reviewed/delivered 的供给 Plan 与 revision；②实际运行 binary 的版本/hash（源 HEAD 不等于 binary）；③公开 callback 契约；④U-01..06 已知答案、反例、真实事件证据；⑤原生 merged 生产点击可执行。原生 split 应用的 F-24-2 单列，最小 split 载体事件验证可另证，但不得用后端 HTTP 成功替代它。

按上游现行门禁在专属工作树运行 cargo check -p auto-lang、相关 core/widget/builder scoped tests，复审跑 cargo t；触 UI codegen 另跑 cargo tu，触 VM 桥接按规约加 cargo tv。cargo tf 是主检出单实例到期批回归，不作为每轮原型的默认门。本次只是读仓和写 Jade 文档，没有运行 cargo 或上游生成器。

## 4. 并列缺口与优先级

036 的 B-6（输入期链接不解析）、B-7（Vue 空白编辑器零块，无法键入）、B-2（未聚焦首块点击被吞）、B-8（块底命中区遮挡）仍在录，owner=auto-down。**B-7 是基础写作可用性问题，应在 auto-down 优先修复；本片 native 消息供给不替代它。**此包不把“先修所有问题”设成 U-01..06 前置；native 首片只承诺加载期合法链接，同步保留 Vue 输入期／空白页限制。具体解锁后分别补偿测试，未测试不能勾选消失。
