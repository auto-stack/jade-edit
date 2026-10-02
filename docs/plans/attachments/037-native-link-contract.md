# 037 原生正文内链：供给契约冻结件（PLAN-037 · T-01）

> 效力：本件是 Jade 消费侧对上游供给的**验收契约冻结**（PLAN-037 T-01 产物），不是已存在的 API，也不是已批准的上游 Plan。上游 auto-lang 须按 [需求包](../../upstream/2026-10-native-wiki-link-supply.md) 与本契约在其仓独立立项（`scripts/new-plan.sh` L1 独占编号＋专属工作树 `D:/autostack/.wt/lang-<NNN>/auto-lang`＋独立 review/merge——其 AGENTS.md 在案），以有界原型＋一次复测冻结实现形态；本件约束**验收条款**，不替上游选实现。
> 消费者：PLAN-037 T-02 解锁核验以此件为验收文本；T-03..05 在 T-02 通过前保持锁定。

## 1. 版本绑定（T-01 实勘 2026-10-02T13:30Z）

| 项 | 值 | 说明 |
| --- | --- | --- |
| jade base | 3ee11a3（036 archived/delivered tip）→ 落档批 d6d0000 | 直接 main 线性单一主检出，代码路径零 WIP |
| auto-lang 源 HEAD | `7d50989f7a65497a379b8f1d1321a32a45a7e246`（master） | 与规划收尾复核（13:20Z）恒等；受跟踪路径 clean，仅根目录外部会话 `.tmp-*` 未跟踪残留 |
| 运行 binary | `auto 0.1.0+v0.4.2-2620-g7d50989f7` / SHA256 `9EFC7CCB86655131FD291D8B77825E7F014EB1795A1D1108B7422A99B88F1B64` | **相对规划收尾（v0.4.2-2607-gb3149f74f / 0688B145…45F33）外部重建漂移**；现版本串与源 HEAD 同源。本件绑定此新指纹 |
| 五环源码指纹 | 与需求包 §1 表**逐项恒等**（见 §2） | 上游供给链源码零变化 |

**重绑规则**：上游 binary 由外部会话持续重建（规划窗口内已发生一次）。T-02 每次解锁核验必须以**当时实际 binary** 的 `--version` 首 行＋SHA256 重新绑定并复测，不得沿用本件或 036 的旧指纹结论；指纹变化本身不解锁也不阻塞，供给证据随新指纹重新核验。无日历截止授权——解锁门以合格供给回执为界。

## 2. 五环现状定谳（源码级，T-01 复核恒等）

| 环节（相对 auto-lang 根） | 定谳证据 | SHA256 |
| --- | --- | --- |
| `crates/auto-lang/src/ui/autodown_editor/core.rs` | `DocOutput`（:393）仅 `{text_changed, cursor_changed, focus_changed, request_redraw, captured}`——无链接激活字段；`flatten_inlines`（:132）`Mark::Link | Mark::Image => style.link = true`（:144）——**目标/锚点在 core 即被丢弃，只剩样式**；`DocLayout`（:406）无链接命中区 | `DFB6884E8D5322D2241A8DA287B4A3C2BC51DFCD4AB8332D965E4ECF4AC2730C` |
| `crates/auto-lang/src/ui/autodown_editor/widget.rs` | `publish`（:112）仅 `on_change`（text_changed）与 `on_focus`（focus_changed）两出口 | `755AB0EC703ED273DD41533614398BD35D5562A86FC62C8D7A8F455321A95523` |
| `crates/auto-lang/src/ui/view.rs` | `AutodownEditor` 视图字段（:767 定义、:2490 map 展开）仅 `key/value/is_final/on_change/on_focus/placeholder/style`——无 link callback，扩参须同步 map/cloning | `59CBF773E6539857D2BCB91134138DCB969DABD177B54BF430A5E7FFC0F5A592` |
| `crates/auto-lang/src/ui/aura_view_builder.rs` | `convert_autodown_editor_native`（:3880）现只消费 oninput/onfocusblock | `0B44B8576A193820E8A9C043E53E8338638CB3E8537B29CC064528C69BA88012` |
| `crates/auto-lang/src/ui/iced/renderer.rs` | `build_autodown_editor_generic`（:26228）无该回调传递 | `98CC4C8995D6D2BCB5373AB057FFCC3075190A87BCC0A4C82D9C4C7D2591D7EB` |

五环 grep `wikilink|wiki_link|open-wiki|on_link|link_callback`：仅 core.rs:2963 一处**注释**（withIdSuffix 同源锚保留），零回调代码。**U-01..06 在源码级全部未供给**——与需求包结论恒等，不因 binary 重建改变。

## 3. 消费契约（冻结——T-02 验收条款）

- **C-01 载荷**：事件沿用完整名 `open-wiki-link`，双参（target, target_anchor）。语义与 Vue 逐值一致：target＝引擎已 trim 页面名；target_anchor＝`[[t#a]]` 首个 `#` 后段 trim，**无锚＝明确空值**（原生通道非 JS `undefined`——公开形态可为 None/空串，Jade 适配层归一为 `""`，不得让空值以 `"undefined"`/null 字面泄漏）；第二参**不是源块身份**，不得接保存/判源。事件名与参数位与现行 Vue `on "open-wiki-link"` 双参消费完全兼容——Vue 路径零改动。
- **C-02 触发交互**：普通左键完整点击（按下→抬起且命中链接区）激活；拖选、右/中键、非链接、越界释放、布局/正文变化后的陈旧命中零激活；导航结果与 Vue 同面（同走 OpenWikiLink 下游）。改修饰键方案须先修订 PLAN-037 AC-02，不隐式实现。
- **C-03 回调全链**：core 链接语义＋布局命中区 → DocOutput 激活出口 → `DocEditor.publish` → `View::AutodownEditor` callback → iced lowering → AURA → DynamicMessage → 真实 Auto handler。任一环缺失即未供给。
- **C-04 来源与世代**：callback 绑定实际来源 editor key／挂载代次（公开 origin 或框架先验后派发，二选一在供给 Plan 冻结）；**禁用全局 last-mounted 单槽**（Vue 现状 B-1 的已知缺陷不得原样复制到原生）；失效/卸载/换内容后排队的旧激活零冒领。双同正文实例来源反例为强制证据。
- **C-05 验证面**：证据必须经生产 DocEditor 指针命中与 `Shell.publish` 真实路径；MCP ghost/state 合成与 DSL 直派只作**策略负例**；测试 seam 须注入真实 iced event 且与生产共一命中实现；四层 known-answer（core 命中区→widget/Shell→DSL handler→Jade 打开正确 target path）须同一次激活内贯通并记录窗口/布局/binary 指纹。计数器、快照蓝字、HTTP 成功均不算。
- **C-06 兼容边界**：未声明 callback 的应用继续可编辑（事件新增默认 None）；View map/cloning、scroll_sync 包装、oninput/onfocusblock 全保留；feature-off 降级；Vue 036 全套零回退；不连带 save/命令桥/reveal/全局 Shift/输入期重解析。

## 4. 合格供给回执清单（T-02 解锁门——五项同时成立）

1. 上游供给 Plan ID／revision 及其 reviewed/delivered commit（auto-lang 仓在案可查）。
2. 实际运行 binary 的版本＋SHA256（源 HEAD ≠ binary）。
3. 公开 callback 契约：事件名、双参语义、origin 形态、handler 签名与 Vue 兼容证据。
4. U-01..06（＝本件 C-01..06）已知答案＋反例＋真实事件证据：布局命中、拖选排除、全链到达、双同正文实例来源反例、缺省兼容。
5. 原生 merged 生产窗口真实点击可执行（打开正确目标页）；native split 的 F-24-2 单列，最小 split 载体事件验证可另证，后端 HTTP 成功不替代。

源 HEAD 含回调字段、只跑 core 单测、resolver 双臂通过——均**不能独立解锁**。T-02 核验失败或缺证即保持 blocked，不进入 T-03。

## 5. Vue 兼容目标（现行消费形态实勘——上游兼容性的对岸）

| 面 | 现行事实 | 证据 |
| --- | --- | --- |
| 事件绑定 | `on "open-wiki-link": .OpenWikiLink`（完整 kebab 名；引擎 emit `('open-wiki-link', title, blockId?)`——第二参语义＝目标锚点） | src/front/app.at:1646（挂载于 autodown_editor 块） |
| handler | `.OpenWikiLink(str, str)` 双参 msg（app.at:1145）；入口即源票据捕获（uid/sel_gen/key/path/body＋nav_seq 递增） | app.at:3024-3044；规范 wiki-link-navigation §2 |
| 缺参归一 | Vue 侧 `"" + anchor` 收敛 `"undefined"`→`""`（JS 引擎无锚 emit undefined）——原生通道不得要求 Jade 再加第二种归一 | app.at:3032-3035 |
| 下游共享面 | resolve_wiki_link 单参只读口→每等待期五查门→NavCommit 同步提交→成功回执 recents/链接行；缺页 navc_* 确认、错误 wiki_nav_note 独立 | docs/specs/wiki-link-navigation.md §1..§3（@d6d0000） |
| 已知 Vue 侧缺陷（上游引以为戒） | 引擎 wikilink opener 全局单槽 last-mounted-wins（契约 B-1）——原生 C-04 明确禁止复制 | 036 契约 §4 B-1 |

## 6. 关键未知与上游原型义务（owner＝供给 Plan，每项一次原型＋一次针对复测）

- **K-01 命中映射**：链接命中区进 `DocLayout` 与指针→文本字节映射（折行/首块/块型覆盖、像素阈值）——Jade 不猜坐标。
- **K-02 origin 形态**：框架验源 or 公开 origin 字段＋callback 扩参后的 DSL handler 签名与 View map 兼容证据。
- **K-03 真实事件工具**：现 MCP autoui_action 走 ghost/state 合成面——须提供经生产指针路径的可复跑证据或注入真实 iced event 的测试 seam（共一实现）。
- **K-04 载荷通道**：AURA/DynamicMessage 对双 string 载荷＋None 默认的承载与完整事件名兼容（简称 `@openwikilink` 不在本片前置）。

以上任何一项在供给 Plan 内原型＋复测仍不可达：报精确 blocker／needs_replan，**不删 U 条款、不降本件验收**。

## 7. 当前状态与责任门（T-01 结算时点）

- **T-02 解锁门＝BLOCKED**：auto-lang 无供给 Plan——活动面 242/719/722/723/730/731、archive 至 729（2026-10-02T13:30Z 实勘），无一涉及 native wikilink 供给；外部 PLAN-729/730 为 HTTP server 线，与本片无关。
- 责任门：auto-lang 按其 AGENTS 独立立项（new-plan.sh 独占编号＋`.wt/lang-<NNN>` 专属工作树＋独立 review/merge；canonical 输入至少 overview／ui overview／ui architecture／mcp-pointer-input，供给 Plan 应新增 native wikilink 局部 Spec 并更新 UI 索引）；Jade 不代占号、不代批上游代码。
- 并列缺口不变：B-6 输入期解析／B-7 空白编辑器（owner auto-down，基础写作应优先）、B-2/B-8、native split F-24-2、保存来源／动作栏、六命令桥、caret/reveal、全局 Shift——本契约不扩大也不抹除。
- 本件只读实勘＋Jade 文档产物：未改上游源码/规范、未运行 cargo/上游生成器、未重跑应用。

## 8. 变更记录

- 2026-10-02T13:31Z：PLAN-037 T-01 冻结。绑定 binary v0.4.2-2620-g7d50989f7（9EFC7CCB…F1B64，相对规划收尾漂移已记）；五环指纹恒等复核；C-01..06 验收条款冻结；T-02 门 BLOCKED 结算。
