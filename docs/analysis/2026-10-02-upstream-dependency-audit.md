# PLAN-035 后续上游依赖复核

日期：2026-10-02。jade-edit 基线 `512b36ff86eddfa5231a48e8fbeb354f34b026ae`。本记录是规划调查证据，不替代 canonical Specs；发现的规范差异交由 PLAN-036 的规范增量复审、沉淀。未修改上游或应用源码。

## 1. 035 是否有未交付任务

[035](../plans/archived/035-editor-command-availability.md) 当前为 archived / completion_kind: delivered，revision 1，4/4 步，AC-01..09 已独立复审通过。交付是失效编辑入口收口、说明与兼容守卫、宿主三键归还；没有约定实现保存事件、正文链接或完整命令桥。不能把 R-03 剩余能力称为 035 验收未完成。

交付提交 56b1c58、复审 fc616a1、账本沉淀 a0b6624、归档 512b36f。复审 F-35-R1（依赖源码漂移但 binary 恒等）、F-35-R2（split 挂点漂移的 A/B 基线证据）、F-35-R3（套件组合时序，单跑复绿）均为在录 nonblocking finding，不是未通过的验收。具体复跑结果以归档计划 §9 为准。

## 2. 依赖复核结论

| 项 | 当前证据与结论 | 后续责任与解锁门 |
| --- | --- | --- |
| A-1 保存来源身份 | EngineEditor 的 save 仍只有序列化正文，无 tab_uid / 挂载世代。相同正文不能判源；md + active_key 仍不得接入保存 | auto-down 供给可核身份或另立等价机制证明，再由 Jade 共保存门消费 |
| A-2 动作栏控制 | EngineEditor defineProps 无 showActions / canEdit；Save 按钮无条件渲染。生成 show-actions attr 不控制按钮 | auto-down 实现真 prop 并做运行期验证；当前不能承诺隐藏引擎 Save |
| A-3 / B-3 宿主命令桥 | Vue / native 均无已核实宿主可调的六命令执行面与回执 | auto-down / auto-lang 分别供给；035 说明与守卫保持，不恢复假菜单 |
| B-1 Vue 链接事件简称映射 | onopenwikilink 仍生成 @openwikilink，名称不匹配。但现有公开 `on "open-wiki-link"` 生成正确监听，真实引擎点击已到达双参 handler | **Vue 正文导航不必等待简称修复**。PLAN-036 消费完整事件名；简称兼容修复仍归 auto-lang |
| B-2 native save / link | 原生 View / 转换层仍无相应点击与保存消息通道 | auto-lang 供给、真实原生入口验证后另立消费片；036 不宣称原生正文可点开 |
| B-4 caret / selection / reveal | 未见公开宿主定位原语；块域与 focusblock 不是 caret 或 reveal | auto-lang / auto-down 按位置契约供给；036 打开目标页但不冒称锚定位成功 |
| 全局 Shift 组合键 | 当前仍保留生成器组合键丢 Shift 的已知边界 | auto-lang 独立修复，不扩大 036 范围 |
| 原生内部撤销描述 | **旧结论过强**：core.rs 已有 Ctrl+Z/Y → block_undo_redo → undo/redo；binary 标识对应提交 982e80004 中也存在该路径。自动化 key_press 不支持 modifiers 只说明仪器受限，不能证明内部撤销不存在 | 修正当前规范事实描述。真实键程、各类编辑覆盖尚未补证；宿主命令桥缺口不因内部实现存在而消失 |

以上没有证明全部上游已解锁。完整事件名只解锁 Vue 链接事件可达性，尚未交付 Jade 的解析、导航、迟到门或缺页确认。原生撤销源码存在也不等于跨所有编辑类型、所有载体验收通过。

## 3. 完整事件名的隔离验证

在本仓忽略目录 `.am/quoted-link-audit` 创建最小 Auto UI 工程，未接工作区或生产后端。组件声明：

```auto
autodown_editor(key: "quote-probe", final: true) {
    content: "# Quote probe\n\nSee [[Hello World]] and [[Hello World#sec1]] now.\n"
    on "open-wiki-link": .OpenWikiLink
}
```

消息 `OpenWikiLink(str, str)`；handler 记录两个参数与点击计数（第一参页面名，第二参可选目标锚点）。使用当前 auto.exe `build -r vue --gen-only`，生成 `@open-wiki-link="OpenWikiLink"`，handler 双参保留。Vite 隔离挂载生成组件，Vue 插件与 runtime 来自现有 gen/front/vue/node_modules，`@autodown/engine` 指向当前真实 engine/dist/index.js；Playwright 点击真实 `.autodown-wikilink-label`，不是合成派发消息。

执行：忽略工程目录内运行 `D:/autostack/auto-lang/target/debug/auto.exe build -r vue --gen-only`，本仓运行 `node .am/quoted-link-audit/check-runtime.mjs`。预期与实际一致：

```json
{"passed":true,"first":["Hello World","","1"],"second":["Hello World","sec1","2"],"errors":[],"event":"open-wiki-link","payload":"target, target_anchor (not source block)"}
```

核对 auto-down `autodown/packages/engine/src/render/render-node.ts`：首个 `#` 前后分别 trim；点击同步调用 openWikilink(title, blockId)。这里的 blockId 是**目标链接锚点**，不是源块 ID 或源文档身份，不能借此接 save 或宣称来源身份已供给。无锚点时原始第二参可为 undefined；上述空字符串显示不是严格类型保证，036 T-01 必须固化显式归一化及缺参测试。

隔离验证不覆盖应用切档、关闭重开、异步读取、缺页创建与原生 UI。这些仍是 036 实施验收。忽略目录不是持久测试入口；本记录保存方法、结果和指纹，036 T-01 要把必要探针纳入 tests 并生成契约附件。

## 4. 证据指纹与漂移

| 对象 | 版本 / SHA256 |
| --- | --- |
| auto-down HEAD | 895f8d0f9355c9f5ec3ce8fca268bdb768395846（检查时 clean） |
| auto-lang HEAD | b385534d77b040eeb19ad0c234fc674af7d0c450（已有其他工作的 WIP，未改动） |
| 实际 auto.exe | auto 0.1.0+v0.4.2-2573-g982e80004-dirty；D63B3DDC722D606167516BF2C6AFE3709C5B32353BA03A090E7C3B3D8070B19B |
| auto-lang src/ui_gen/vue.rs | F60FFFFF5AC01F2BF0BEF1BC04D0FF1D3C4E4D8456B04EDA15C5340AC42E73D5 |
| auto-lang src/ui/autodown_editor/core.rs | DFB6884E8D5322D2241A8DA287B4A3C2BC51DFCD4AB8332D965E4ECF4AC2730C |
| engine/src/editor/components/EngineEditor.vue | D0DE713E82022CA8303BCB42ABABE9A859F4BE0516E3CF3E52807DF3100C14CE |
| engine/src/render/render-node.ts | 51E1BF0E5E95F9DE224C2FAB4F107429E65B85CB236CFE7F5728CC6C71559FF4 |
| engine/dist/index.js | AE6CCD56E9EB15ECF34B1B0CEE4AE22C621032647629DEF3CA7C22C2F7D9A640 |
| 最小探针 app.at | C4EE61BE43518DAA4A175CAA89D105328894BE897019C4FE79244D0825707E96 |
| 生成探针 App.vue | B86DCEE63C9AEE88018A637DB6F7D47B80AFB4BF2C0943BD1E562D1C09D48A74 |
| 隔离真实点击脚本 | 152BC4A7AD9D01C0AF4D82B9E5FCF7678CEC0A2B4DD5E4FCFF5A75D3D9643850 |

路径根：auto-lang 为 `../auto-lang/crates/auto-lang/`（vue.rs 位于 src/ui_gen/）；引擎为 `../auto-down/autodown/packages/engine/`。源 HEAD 不等于正在执行的 binary 来源；不据此声称 WIP 已编译。已读 binary 标识提交的 core.rs 作为额外源码对照，也不把该标识当成 dirty binary 的完整可复现来源。

只读执行 `node ../auto-down/autodown/packages/engine/scripts/assert-dist-fresh.mjs` 返回 exit 0 / dist up to date with src/auto。未重建上游或刷新其生成产物。

## 5. 下一步

优先实施 **R-03b2：Vue 正文内链导航**：完整事件名接线，实时目标解析，正确页面打开，缺页确认，源页未保存保护与迟到请求拒绝；原生正文点击与锚定位继续按能力供给门推进。这样既复用了知识库基础，也没有把 Musk 集成、布局或全套上游供给绑成一个无法交付的计划。规范更正列入 036 SD， archived 034/035 历史证据不改写。
