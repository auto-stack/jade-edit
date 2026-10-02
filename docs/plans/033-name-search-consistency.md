---
plan_id: PLAN-033
status: executing
feature_name: 名称查找一致（R-04）
author: [agent]
created_at: 2026-10-02T01:18:59Z
updated_at: 2026-10-02T09:40:00Z
plan_revision: 1
current_step: 3
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - docs/specs/name-search.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-04
---

# PLAN-033：名称查找一致

## 0. 变更摘要

承接 PLAN-030/031/032 已交付的安全能力，推进独立的 R-04：快开和全文搜索均可按显示标题、别名、文件名及工作区相对路径找到页面。当前 index.ad 显示“首页”，但快开输入“首页”找不到它；全文搜索也不读取 frontmatter.title。本片消除这个名称与查找行为的落差。

查找结果保留实际路径作为打开依据，并展示路径以区分同名页面。新增只读页面名称目录；快开按目录在内存过滤，每次输入不访问后端。全文继续按需检索，既有响应形状、正文摘要规则及链接解析身份保持兼容。

本片不包含编辑器宿主接线、布局改造、Musk 文档管理或搜索摘要增强。R-03、R-05、R-08 继续作为后续候选；不重新占用已归档的 032。

## 1. 目标

- G-01：用户看到的标题和已设置的别名，在快开与全文搜索中都能找到相同的页面；文件 stem、带 .ad 的文件名及相对路径也能查找。
- G-02：同名页面逐路径列出、逐路径打开；搜索显示名称不进入 wikilink 解析或改名改写规则。
- G-03：标题／别名编辑、保存及文件生命周期操作后，索引失效与更新有明确规则；外部变更在重新打开查找入口或主动刷新时可见。
- G-04：加载、空结果、失败／过期状态可区分；旧请求不能覆盖较新的查询或另一个查找模式。
- G-05：保留空查询最近文件、拾取行为、.ad/depth 8/P≤200 范围、双轨生成纪律和 030..032 安全门。

涉及仓库：jade-edit。模块：src/back/wsys.at、src/back/api.at、src/front/app.at、tests、e2e，以及拟新增局部规范。editor_store.at 的 FindOpen/FindClose 开态权威继续复用；只有证据证明必要时才做等价的查找状态接线，不改草稿／保存／生命周期策略。

非目标：模糊匹配、拼音、分词、标签／任意属性检索、排序评分、索引数据库、分页、正文高亮／定位、自动全文检索、运行期切库、文件监听器、大规模性能保证、完整 YAML 新语法、链接路径消歧协议、跨仓修复、Plan/Spec/Wiki 产品集成。工作区超 200 页警示与现有上游边界仍适用。

成功样：wiki/index.ad 的 title=首页、aliases=起点，正文不含这两个词；快开与全文分别输入“ 首页 ”、“起点”、“index.ad”、“wiki/index”，均返回并打开该路径。另一目录也有 title=首页，两行均可区分并正确打开。无首页 alias 的 index.ad 不因本片而获得 [[首页]] 链接身份。

## 2. 架构方案

1. **后端名称目录**：新增无参数只读 page_names()，返回根工作区 depth 8 的 .ad 目录。复用 collect_ad_pages/frontmatter_of/page_fm_value/page_aliases；每个路径一条记录，保留确定性 walk 序，忽略隐藏目录和 .trash。不扩充 link_index 的返回字段以免牵连链接消费面。
2. **统一名称规则**：查询 trim 后 to_lower；候选显示标题、别名、stem、相对路径分别 to_lower 后做 contains。basename 已包含在相对路径中，不增加一套文件名归一规则。快开只查名称；全文查“名称 OR body”，不查其余 frontmatter 值。两端实现用同一组已知答案核对，不能仅互相比较而共犯错误。
3. **前端名称投影**：App 保存 typed List 名称目录及查找请求身份／加载状态；Store 保持面板模式与开态权威。files 行由名称目录过滤；files/text/最近行的名称采用名称目录中 dtitle，缺省 stem，实际路径作次行。title 显示与 path 导航严格分开。
4. **刷新与失效**：查找入口重开时读取新目录；已知本仓写操作在确认磁盘变化后使目录及进行中的查询失效。快开可见时更新目录后按最新输入重算；全文结果标过期，用户通过现有按钮或 Enter 重新检索。不使用 handler 互调后立即读异步完成态。
5. **失败及迟到门**：目录及全文各自绑定请求序号、输入／模式快照和失效世代。仅当前有效响应提交；切模式、关闭面板、修改全文查询或索引失效会使旧请求失效。失败在面板显示原因与重试入口，不把失败渲染成“无结果”。保留的上次结果必须标过期，首载失败不伪造完整结果。

## 3. 技术栈

继续 Auto 单源、AutoVM merged/split 后端与生成 Vue3；不手改 gen/front/vue。API 使用现有标量 str 返回 JSON 字符串纪律，顶层裸数组。新 page_names 无查询参数，可使用 GET /api/page_names；search_wiki 仍 POST（CJK query 的 D-19 约束）。

候选名称目录形状为 [{path,title,dtitle,aliases:[str,...]}]：title 保持 stem，dtitle 为现有 title 解析结果或 stem。嵌套 aliases 列表在前端两轨的可取形及请求身份保存能力由 T-01 实证；不把 TS 发射成功等同于 VM 可用。若该形状在稳定规模内不可承载，T-01 可裁决保持相同逻辑字段的替代标量／typed 投影并记录线协议；不能减少 alias、名称完整性或迟到门验收。

新目录需合法 JSON 转义（至少引号、反斜杠、换行、回车和制表符）；现有 json_esc 只有反斜杠和引号，不能不经测试直接当通用编码器。避免扩大为所有旧 API 序列化重构；仅实现本片所需编码并验证共享函数若有变动的兼容性。

## 4. 需求分析与背景调查

### 4.1 当前规范与规划基线

主检出 main，HEAD=86a2808668178a31e979bdab1329dd4b6b57bfa0；规划开始工作树干净，仅主工作树。docs/plans 根无 active Plan，archived 最大编号 032；分配使用排他锁并重扫两目录，attachments 不计入业务编号。

docs/specs 无 overview/index；当前三个局部规范为安全／草稿／生命周期，名称查找尚无独立 Spec。已读取 document-lifecycle 全文及 editor-safety/draft-recovery 相关边界；既有名称行为定位于 docs/ARCHITECTURE.md SD-401、SD-1301 和 PLAN-012 检索扩面。ARCHITECTURE 部分段落仍保留早期 depth 4／stem+body 历史描述，当前实现已为 depth 8／stem+aliases+body，不能据旧段落回退当前行为。

SD-1301 原有“title 不进入任何匹配面”同时涵盖链接与检索。本片明确提议修改**查找**部分：title 可检索；链接身份与引用改写仍只按原规则处理。落位时增加局部 Spec 并在旧段落注明新的查找规则出处，保留必要的历史说明，不悄悄改写链接身份。

| 来源 | 已核对事实 | SHA256／版本 |
| --- | --- | --- |
| docs/specs/document-lifecycle.md | 十入口受检门、真实回执、定向协调；F-32-R1/R2 边界继续适用 | C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF |
| docs/specs/draft-recovery.md | 草稿确认、离开门及 VM 多检查点／切档输入边界 | 41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7 |
| docs/specs/editor-safety.md | 手动重载保护与空文档／split boot 边界 | 2CD7BB0A5D2F1D6D4BF56A7B616FD1CEC164054E30C3A4AB0A9960AF786D0051 |
| docs/ARCHITECTURE.md | SD-401 搜索协议，SD-1301 显示名称／链接身份边界 | DCB7ED9FC21D6E0CD2DDC674FA017F050CF6985B9983FC9860AB04B6350B6F05 |
| src/front/app.at | file_rows_of、FindEdit/FindRun/ActFindFiles/ActFindText/FindPick、MetaGo、LinksRefreshOf、TreeRefresh | BECA96F7846FA34A5B5AF6797AA10327CF29537E7273B6846158E8AD745C6C79 |
| src/back/wsys.at | search_json、collect_ad_pages、page_fm_value、page_aliases、json_esc | 11834E7B91030041C5663EE1B085D8EED87BE5571B5D1530FA8FDFCB47F12CC2 |
| src/back/api.at | search_wiki POST；当前没有名称目录 API | E99B4D2E653129AB1758961C3F5B09A85A653D192B43BA727CCEE4F42146861F |
| docs/plans/archived/032-document-lifecycle-safety.md | status archived，completion_kind delivered，step 7/7；不重复实施 | HEAD 86a2808 |
| tests/probe_dir_move.mjs、probe_page_meta.mjs、probe_casefold.mjs、probe_alias_linkify.mjs | alias 检索 title=stem、snippet 空／非空；title 不构成链接身份；属性 parser 的既有范围 | HEAD 86a2808 |
| tests/vm_matrix.mjs、e2e/playwright.config.ts、package.json | 当前结构基线 v25；merged/split 配方；pnpm build/test:e2e；测试工作区隔离 | HEAD 86a2808 |

### 4.2 当前落差与约束

| 场景 | 当前实现 | 本片提议 |
| --- | --- | --- |
| 快开 | file_rows_of 从 ft_nodes 的路径做 contains，query 未 trim；显示使用 titles 缓存 | 名称目录过滤，统一 trim，title/alias/path 可找；空查询保持最近语义 |
| 全文 | search_json 命中 stem、aliases、body；未匹配 title、相对路径 | 加入 title 与 path；返回仍为 path/title/snippet，title 仍是 stem |
| 名称显示 | 查找行显示 dtitle，路径未用于显式消歧 | 显示标题加真实相对路径，不按显示名去重 |
| 更新／异步 | MetaGo 成功刷新 links/tags；FindRun 失败只写 console，无旧请求门 | 精确登记名称失效触点；可见错误、当前请求门；全文仅显式重检 |

032 已交付不意味着上游问题消失：F-32-R2 VM handler 局部槽位串扰、F-32-R1 Vue store 互调未 await、031 多检查点楔死、F-24-2 split boot、编辑器空档／切档输入边界均不能被本片的“通过”覆盖。实施必须记录实际工具链与 dist 新鲜度，并将本片新增失败与原有已知失败分开；名称查找本身受阻时不能沿用旧豁免宣称完成。

### 4.3 授权与执行边界

用户本次指令为“计划032完成了。请规划下一个计划”，并延续此前 auto-plan-new 规划流程。本次允许读取 jade-edit 的相关代码／规范、创建下一项 Plan、更新产品路线图。未要求实施代码、修改 canonical Specs、跨仓写入、发布或自动继续 work/review/merge；没有指定时间、token、工期或自动循环预算。r1 是本次提出的待实施契约，不能把“要求规划”写成“已批准实施所有条款”。

## 5. 详细设计

### 5.1 名称目录与匹配契约

- 唯一身份是工作区相对 path，使用现有路径表示，不引入新的大小写／别名去重规则。目录全量而非 search limit 20；每页一条，walk 顺序保持，不按命中字段评分。
- title=stem；dtitle=page_fm_value(frontmatter,"title")，空则 stem；aliases 复用 page_aliases 当前支持的逗号／块列表规则。未知字段和嵌套 title 不变成查询面。目录可读取原文来解析，但不把正文加入快开数据／匹配字段。
- N(q)=q.trim().to_lower()；名称命中为任一候选字段 to_lower().contains(N(q))。不承诺 Unicode 全 casefold、拼音或路径分隔符自动转换；path 使用现有 /。纯空白按空查询处理。
- files 空查询：有 recent_paths 时仍显示最多 10 条最近文件，既有置顶／去重／持久化行为保持；无最近记录才显示目录。text 空查询仍返回 []。隐藏／.trash 文件不得因名称目录进入普通搜索；最近文件若有既有 .trash 记录，保持现有导航语义，不把它加入目录。
- 同名标题、同名 alias、跨目录同 stem 都逐 path 保留。files/text/最近行均能识别实际路径，点击只传 path 给 OpenLink；files 拾取关面板，text 拾取保留面板。

### 5.2 全文兼容与身份边界

search_wiki 签名及响应仍是 [{path,title,snippet}]。只扩大命中域至显示标题／别名／stem／相对路径／正文；limit 仍钳制 1..50，前台仍传 20，确定性 walk 序不变。仅名称命中时 snippet=""；正文命中时仍取首条命中行 trim 并剥 CR。不新增 dtitle/hit_kind 等响应字段，不加入 tags/summary。

[[Target]] 链接解析仍遵循“stem 精确→alias 精确→stem to_lower→alias to_lower”；frontmatter.title 不进入解析器、提及转换或改名引用改写。查找整个过程只读；原标题编辑导致的原有显示更新保持，不改 tabs 的稳定身份、正文、草稿或文件字节。

### 5.3 刷新触点、模式与错误

T-01 输出逐入口触点表：查找入口开启／重新进入、现有手动索引刷新，以及 Save/MetaGo/创建页/daily_note 和十类受检文件操作中有实际磁盘变更的终态（含 partial）。拒绝、取消、零变更不凭空刷新；新建空目录不必重读名称。无参数目录必须读当前磁盘，不能仅复用过期 links/title/tree 缓存。

本仓确认变化后，先同步递增名称失效世代并使在途结果失效。files 面板可见则加载新目录，提交时使用最新 find_q 重算；text 已有结果标过期并提示重新检索，保留按钮／Enter触发语义。面板关闭时只标失效，到下一次进入再取。外部写入由重进查找入口或主动刷新观察，本片不承诺实时监听。

目录与全文请求分别绑定编号、失效世代、模式；全文再绑定 query 快照。模式切换／面板关闭／查询修改不允许旧全文响应设置 find_rows/find_ran；目录回执不得覆盖新目录或把行集提交到 text 模式。输入等待中改变时，目录可更新有效缓存，files 行只能按当前输入计算。生成 Vue 的异步互调与原生 VM 局部变量问题均需实测，采用经 T-01 证明可行的同作用域取数／提交方式。

加载时提示加载，失败时显示“名称加载失败”或“搜索失败”及重试操作；保留旧投影必须同时明确过期状态。首载失败不能显示“无结果”或隐藏目录不可用。重试使旧请求失效，成功后清除错误。正文与磁盘不因失败／重试改变。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/name-search.md §1 名称目录与查找域 | 无局部名称规范；新增目录字段、范围、trim/to_lower/contains、快开名称域和全文名称 OR 正文域，明确代替 ARCHITECTURE 中旧检索排除 title 的规则 | 用户可按看到的名称找回页面 | AC-01, AC-02, AC-03, AC-04 |
| SD-02 | add | docs/specs/name-search.md §2 身份与兼容 | 明确 title 可查询但不成为链接身份；逐 path 消歧，旧搜索响应／limit／snippet／最近行为保持 | 防止显示名串入导航／引用写域 | AC-03, AC-05, AC-06, AC-07 |
| SD-03 | add | docs/specs/name-search.md §3 刷新与请求门 | 原快开只读树缓存、全文无失效门；新增具体刷新触点、失效世代、当前响应提交、可见失败／过期与重试 | 避免改名后找不到、旧查询覆盖和失败假空态 | AC-08, AC-09 |
| SD-04 | add | docs/specs/name-search.md §4 验证与边界 | 新增双轨证据、只读不变量、P≤200/depth 8、上游限制与生成产物纪律 | 如实交付，不扩大已有承诺 | AC-04, AC-07, AC-10 |

本阶段只提议增量，不创建 canonical name-search.md，也不修改旧三个 Specs。实施落位时在 ARCHITECTURE 的 SD-401/SD-1301 检索段注明该局部规范，限定变更为查找域，不能删除四级链接身份或既有 parser 保真规则。

## 6. 测试设计

新增隔离 fixture／已知答案语料：title 只在 frontmatter 出现的 index.ad、只有 alias 的页面、无 title 页、同 title 跨目录双页、同 alias 多页、5 层目录、正文专有词、非名称属性专有词、CJK 与 ASCII 大小写、引号／反斜杠／制表符的有效名称值。测试准备与清理只在 e2e/.runtime 等隔离工作区；检索前后逐文件 SHA256／集合对照，不能把设置元数据的写入误算成查询副作用。

三层证据：

1. 新 tests/probe_name_search.mjs（拟新增）按现有 probe_dir_move 配方覆盖 merged 直调和 split HTTP，独立 Node 已知答案检查目录字段／完整性、名称匹配、全文 limit/shape/snippet、JSON 解码及链接索引前后深等。后端双臂不得仅互相等值。
2. 新 e2e/name-search.spec.ts（拟新增）覆盖 Ctrl+P／菜单、Ctrl+Shift+F／Enter、同名点击、最近、属性变更、文件变化及 route 延迟／拒绝／畸形响应。统计目录／搜索 API 请求，证明键入过滤无 fetch；断言路径、正文、错误状态和最新查询，避免全页文本命中到 Explorer。
3. tests/vm_matrix.mjs 增名称组（N 组）：原生输入与行集、同名路径、标题／alias 查找、模式／错误门；控制草稿输入，避免借本片触发多检查点楔死。新状态导致结构变化时从当前 v25 出发，逐项解释差异，新增 v26（拟新增 tests/baseline/structure-v26.txt），不能以无审查重锁代替回归。

目标验证通过后运行受影响 probe_page_meta/probe_dir_move/probe_casefold/probe_alias_linkify，以及现有 e2e 全集与 vm_matrix。已有安全规范中的 blocker 按精确断言／载体记录；本片新 AC 的缺证或失败需修复／报 blocker，不可笼统归为旧缺陷。无需增加性能阈值测试；通过请求计数与稳定范围语料验证约定成本。

## 7. 验收标准

| ID | 可观察结果与具体判据 | 验证 |
| --- | --- | --- |
| AC-01 | title=首页、正文无首页的 index.ad：快开／全文输入首页均命中；trim、ASCII 大小写、缺 title 回 stem 均按既有解析值正确 | 目录／全文双臂 probe 已知答案 + 两轨前端 |
| AC-02 | 逗号／块 aliases、stem、带 .ad 文件名、相对目录路径在两种模式均可查；不是名称字段的 tags/summary 词不在正文时不得命中 | 共享用例逐项路径断言，前端与后端分别对答案 |
| AC-03 | 名称词仅在属性中时全文 snippet=""；正文专有词只命中全文；旧响应字段恰为 path/title/snippet 且 title=stem，正文首行／CR、1..50 钳制、20 默认与 walk 顺序保持 | probe JSON 深等、边界 limit 0/1/50/51 与 e2e |
| AC-04 | 目录一页一记录，5 层文件可见；普通目录／全文不含 .trash/.jade/非 .ad；CJK、引号／反斜杠／制表有效值可 JSON 读回，名称无截断；不扩大 depth 8/P≤200 声明 | 双臂 probe 字段逐值与页面集合检查 |
| AC-05 | 两目录 title 相同、alias 相同或 stem 相同的页均按 path 保留；files/text/最近结果可见实际路径，各行打开各自磁盘正文；files 拾取关闭、text 保持 | e2e 区域内行／路径／active_body 与 VM 行集 |
| AC-06 | files 空白查询保持最近 10 条的排序／去重／持久化，无最近才全量；text 空白查询返回 []；快开逐次输入不调用后端目录或全文 API，全文只在按钮／Enter 发起 | e2e 请求计数与 recent_paths、既有最近回归 |
| AC-07 | 在不增 alias 的 fixture 上 [[首页]] 仍悬空；其他四级解析结果前后深等；目录／过滤／全文及失败重试前后工作区字节／文件集合保持，打开脏页正文、草稿身份与安全门不变 | probe_casefold/alias + 查询前后 hash + e2e dirty 不变量 |
| AC-08 | 属性标题／alias 编辑、保存及实际创建／迁移／改写／删除／恢复／清空（含 partial）的触点表无遗漏：可见 files 更新最新路径与名称，text 旧结果标过期；外部 title 改动重进／主动刷新后可见；拒绝／取消零变更不伪更新 | T-01 触点表、集成 fixture 各类变化对照、e2e MetaGo/生命周期代表弧 |
| AC-09 | 延迟目录／全文、修改输入、重试、切模式／关开面板后，只有效请求提交；失败／畸形响应有可见错误及重试，旧结果过期与真实无结果可区分；成功重试清错误，无正文／磁盘丢失 | e2e route 控制响应次序／内容 + 原生可达状态弧 |
| AC-10 | Auto 单源生成成功，merged 原生与 Vue 名称弧通过，split 后端 probe 通过；目标与受影响回归证据绑定代码／工具链；原有 split boot 等限制如实分列，本片缺证不算完成；Spec 与结构变动可追踪 | 构建、矩阵、e2e、证据汇总与 SD 对照 |

## 8. 执行步骤

### T-01 名称载体与刷新／请求门验证

- [x] **T-01**。依赖：无；第一项可执行任务。范围：wsys.at 现有 parser、api.at 标量返回、app.at Find*/LinksRefreshOf/TreeRefresh/MetaGo/Save 与十个 LcResolve 收尾，现有 probe/e2e 配方。
  [✅ 已完成 2026-10-02] 契约冻结件 docs/plans/attachments/033-name-contract.md（§1 目录线形状 [{path,title,dtitle,aliases}] 载体=link_index 嵌套 List-in-Map 在册通道；§2 json_esc_x 五步转义、VM str.replace=全局替换 engine.rs:8398 一手源实勘；§3 统一匹配规则两端同规；§4 请求身份快照-回读+computed files 行集+失效世代，无 handler 互调读态；§5 十八行逐入口刷新触点表+显式不刷负表；§6 工具链/限制登记含 F-31-R1 engine dist 本批重建）。验证：node tests/probe_name_search.mjs --phase 1 双臂全绿（11 检索案+载体直证+磁盘零副作用+双臂逐字节一致；红相证据 f1/f4/f7——fm title/相对路径现行不在检索域）+ pnpm build 绿（engine dist 卫兵经 F-31-R1 重建过）。新增 serve-back.mjs workspace 覆盖参数（缺省零变化）。
- 产物：新 docs/plans/attachments/033-name-contract.md，冻结目录线形状、JSON 转义方案、两轨 aliases 取形、异步请求身份保存／失效方式及逐入口刷新表；列出实际工具链 revision/dist、已有 blocker。提供可重复的最小探针并扩成拟新增 tests/probe_name_search.mjs 的基础相位。
- 边界：一次最小原型＋一次针对失败的复测。可用→继续 T-02；等价载体可用→记录决策与对应 Plan 修订后继续；名称或请求门不能满足→写出缺失原语、负责模块和重入条件，不能删 AC 或无界重试。无跨仓实现。
- 验证：node tests/probe_name_search.mjs（基础相位，脚本新建于工作阶段）＋ pnpm build；基础目录独立已知答案／两轨取形证据完整，生成成功；原型交互记录进入附件。对应 AC-04/08/09/10，SD-01/03/04。

### T-02 后端名称目录与全文扩面

- [x] **T-02**。依赖：T-01 载体裁决通过。修改 src/back/wsys.at 与 api.at，新增 page_names 与其只读实现；search_json 复用同一名称规则／解析，保持旧返回形状、limit、walk、snippet。为新增字段实现安全编码，链接解析器不接入 title。
  [✅ 已完成 2026-10-02] wsys.at：json_esc_x（反斜杠→引号→\n→\r→\t 五步全局替换；现行 json_esc 调用面零扰动）+ page_names_json（collect_ad_pages("",8) walk 序、title=stem、dtitle=fm title 缺省 stem、aliases=page_aliases、json_esc_x 装配、只读零写面）+ search_json 扩面（命中域 = stem ∪ 相对路径 ∪ dtitle ∪ aliases ∪ body；响应形状/limit 钳制/walk 序/snippet 规则零变化；fm 单读复用——原内联 frontmatter_of 提升变量）。api.at：GET /api/page_names 无参契约（trash_list 同族零 D-19 面）。验证：node tests/probe_name_search.mjs 相位 2 双臂全绿（翻转案 f1 首页/f4 nm/Home/f7 重名页/fa 制表 alias 全中；目录已知答案 nm/ 子树逐字节 walk 序+集合=磁盘 .ad 一一对应+转义读回 q"ote\slash/tab⇥9+零点前缀；基线 fb 逐字节零漂移）+ probe_dir_move/probe_page_meta/probe_casefold/probe_alias_linkify 四探针全绿（回归无新增失败）。
- 验证：node tests/probe_name_search.mjs；node tests/probe_dir_move.mjs；node tests/probe_page_meta.mjs；node tests/probe_casefold.mjs；node tests/probe_alias_linkify.mjs。新脚本所有名称／隐藏域／编码／limit／hash 案双臂按答案通过，旧三字段搜索与身份回归无新增失败。
- 对应 AC-01/02/03/04/07/10，SD-01/02/04。

### T-03 快开与查找行接线

- [x] **T-03**。依赖：T-02。修改 src/front/app.at 的导入、名称模型、file_rows_of（或等价替代）、FindEdit/ActFindFiles/ActFindText/FindPick 与 files/text/最近区域。目录加载后本地过滤，title+path 显示，兼容最近与点击语义；不把 fetch 放入逐键过滤。
  [✅ 已完成 2026-10-02] app.at：use 导入 +page_names；模型七新字段（names/names_state/names_seq/names_gen/find_seq/find_err/find_stale——store 零新增）；file_rows_of→name_rows_of（统一名称规则 dtitle∪title∪aliases∪path，参数名 dir 避 D-30① 阴影面——names 参数名实勘 vue codegen .value 误加即 undefined，首跑 e2e pageerror 在录）+ name_dtitle_of 查表；computed files_rows（目录回包/输入自动重算零时序窗）；NamesRefresh（seq/gen 双快照-回读门——生成 TS 静态核验 ref 直读在录）+ NamesInvalidate（gen+1+find_stale+面板开才重取）；FindEdit text 键入使在途失效；FindRun 门化提交（失败置 find_err 不伪"无结果"）；视图 files/text 重排（目录状态三形门+行 dtitle 主行+path 次行+最近段 ready 门——matrix ⑩⑤ fallback 先渲染面在录修正）；十六触点 NamesInvalidate 接线（契约 §5 表全量）。验证：pnpm build 绿 + e2e/name-search.spec.ts 6/6（名称五域/同名逐路径/全文扩面/请求计数/失败重试/迟到门/保存刷新过期横幅）+ e2e/matrix.spec.ts 全套 1/1（既有 [11 find]/⑧⑨⑩ 弧零漂移）。
- 产物：新 e2e/name-search.spec.ts 的基本名称／同名／最近／请求计数弧；按现有 helpers/config 操作，不混入 Explorer 行。
- 验证：pnpm build；pnpm exec playwright test -c e2e/playwright.config.ts e2e/name-search.spec.ts。名称查询与正确路径打开通过，正文专有词不进 files，输入计数零额外 API，最近行为保持。
- 对应 AC-01/02/03/05/06/07，SD-01/02。

### T-04 刷新、迟到及失败集成

- 依赖：T-03。按 T-01 表接入确认变化触点，包括 partial；为名称目录／FindRun 加有效请求提交门、模式／输入／失效处理和可见加载／错误／过期／重试。避开 Vue 异步互调立即读与 VM 跨调用局部残留；全流程不改编辑正文或触发无守卫 Reload。
- 验证：扩展 node tests/probe_name_search.mjs 的实际变化前后案；pnpm exec playwright test -c e2e/playwright.config.ts e2e/name-search.spec.ts；扩 tests/vm_matrix.mjs N 组，node tests/vm_matrix.mjs --arm merged。逐入口表每项有调用路径与终态证据；元数据／文件代表弧和乱序／畸形／重试均按 AC 通过。
- 对应 AC-07/08/09/10，SD-03/04。

### T-05 回归、规范落位与复审交接

- 依赖：T-04。实施阶段新增 docs/specs/name-search.md 落位 SD-01..04，在 docs/ARCHITECTURE.md 的旧检索／title 排除段注明现行查找规则出处，保持链接身份文本。必要时新增 tests/baseline/structure-v26.txt 并解释 v25→v26；不改写旧三个安全 Specs 的承诺。更新路线图 R-04 状态和实际限制。
- 验证：pnpm build；node tests/probe_name_search.mjs；T-02 的四个相关 probe；pnpm test:e2e；node tests/vm_matrix.mjs。目标全过、受影响回归无新增失败；已有精确 blocker 单列证据与替代覆盖，不合并称“全绿”。git diff --check 通过；只读／身份／安全不变量及 SD 全覆盖。
- 输出：Plan 任务勾选与绑定 revision 的验证命令／结果、生成工具链指纹、原生／Vue／split 后端覆盖表和待核验项；具备复审材料后按工作技能交接 review，不自行跳过审查／合入。
- 对应 AC-01..10，SD-01..04。

执行顺序 T-01→T-02→T-03→T-04→T-05。所有任务尚未实施；T-01 的等价实现裁决只能调整技术细节，改变目标、验收、兼容或跨仓范围须先修订契约并处理授权。

回退：应用改动在专属工作树按提交回退；新增只读目录不迁移用户数据，旧 search_wiki 签名／shape 保持，不需数据回滚。测试仅用隔离语料，不能用“恢复 fixture”覆盖真实知识库。

## 9. 复审记录

- 2026-10-02T01:18:59Z：stage: new；plan_id: PLAN-033；plan_revision: 1；outcome: pass；next: work（执行时按用户实施指令和 auto-plan-work 进入专属工作树）。
- 本次规划新增 T-01..05、AC-01..10、SD-01..04；已核对 032 归档、当前局部规范与相关实现，任务／验收／增量覆盖完整。新增载体与异步机制有 T-01 有界调查出口，不以未知机制宣称已可用。
- 本记录仅为规划交接，不是实现复审 pass；本次未运行应用测试、未改实现或 canonical Specs、未自动继续 work/review/merge。
- 2026-10-02T10:30:00Z：stage: work | plan_id: PLAN-033 | plan_revision: 1 | outcome: executing（T-01 完成）| code_commit: f2ccacd(规划落档)+本批 | task_ids: T-01 | evidence: 契约冻结件 attachments/033-name-contract.md；node tests/probe_name_search.mjs --phase 1 双臂全绿（红相 f1/f4/f7 在录）；pnpm build 绿（engine dist F-31-R1 类陈旧就地重建 stamp f46a2f18——零源变更，032 会话内重建 auto.exe 先例）| blockers: 无 | next: T-02（后端 page_names+search_json 扩面）。工作树=主检出（直接 main 线性惯例：git worktree list 单一主检出，001..032 在册惯例；提交随批落 main，工作树零 WIP 休止态）。
- 2026-10-02T11:10:00Z：stage: work | plan_id: PLAN-033 | plan_revision: 1 | outcome: executing（T-02 完成）| code_commit: 本批 | task_ids: T-02 | evidence: node tests/probe_name_search.mjs 相位 2 双臂全绿（翻转案+目录已知答案逐字节+转义读回）+ probe_dir_move/probe_page_meta/probe_casefold/probe_alias_linkify 全绿（回归零新增失败）| blockers: 无 | next: T-03（快开与查找行接线）。
- 2026-10-02T12:00:00Z：stage: work | plan_id: PLAN-033 | plan_revision: 1 | outcome: executing（T-03 完成，含 T-04 e2e 面）| code_commit: 本批 | task_ids: T-03（T-04 e2e 前置）| evidence: pnpm build 绿+gen TS 静态核验（快照-回读门/computed files_rows/await 在 handler 体内）+ e2e name-search 6/6 + e2e matrix 全套（回归零漂移；⑩⑤ recents ready 门修正）| blockers: 无 | next: T-04（probe 刷新案+vm_matrix N 组）。

## 10. 待澄清事项

没有必须等待用户回答才能完成本次规划的问题。实施前由 T-01 负责确认：①aliases 列表及安全 JSON 的两轨承载；②当前请求身份／失效状态在生成 Vue 与原生 VM 的可保存性；③十个文件操作终态的实际刷新触点，尤其 partial 与 purge；④工具链／dist 是否与登记指纹一致。

任何核心能力不可达，记录 blocker 与重新进入所需证据，不能把缺证当成已知旧失败。如果需要兄弟仓改动，先形成具体供给需求和 Plan 范围修订，再由该仓的授权决定；本片不会自行扩大为 Musk 管理工具。R-04 交付后，下一候选为 R-03 编辑器宿主接线，先进行已在路线图列明的接口能力调查，届时才分配正式编号。
