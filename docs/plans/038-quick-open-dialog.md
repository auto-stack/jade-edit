---
plan_id: PLAN-038
status: reviewed
feature_name: 双轨快速打开独立弹层（R-05a）
author: [agent]
created_at: 2026-10-03T03:31:53Z
updated_at: 2026-10-08T15:51:51Z
plan_revision: 2
current_step: 5
total_steps: 5
supersedes_spec_components:
  - docs/specs/name-search.md
new_spec_components:
  - docs/specs/quick-open.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-05a
---

# PLAN-038：双轨快速打开独立弹层

## 0. 变更摘要

030..037 已全部交付归档（037 于 main 0d92d99 归档：执行/复审/归档链 c953837→c1ca4b6→3084d85→0d92d99，native merged 真实点击全门交付、**src/front 零源码改动**、工作树已清）。r1 草稿（2026-10-03）创于 037 executing 1/5 时点并设了写窗口门；本 r2 复基修订只刷新过期事实与解除已满足的前置，**不改目标／验收／范围**，也不接走 037 的任何验收或修改其归档件。

下一片推进路线图 R-05 的独立首片：Ctrl+P／菜单“快速打开”打开轻弹层，输入名称、看清实际路径、Enter 打开首个明确高亮候选或点击指定结果；Escape／取消结束。快开不再占右侧查找栏，不覆盖全文检索查询与结果，不改变标签／引用面板开态。复用 033 名称目录与匹配、现行安全开页提交，不改后端或编辑器内核。

本片交付 VM merged 与 Vue 两轨。选择已有 dialog／input／button 公开构件；上游 command 家族 Spec 明确 VM iced:none，不能把 Vue Command 组件当成双轨前置。首片不承诺 ArrowUp/Down 高亮遍历；使用输入框 Enter 首选、Tab 到结果按钮与按钮 Enter 的键盘路径，所有候选仍可鼠标点击。更大范围的全库左栏／当前页右栏重排留给 R-05b。

## 1. 目标

- G-01：工具栏／菜单／Ctrl+P 同一快开入口，独立弹层在宽窗、窄窗均可操作，不受右侧 hidden md:flex 影响。
- G-02：标题、别名、stem、文件名、相对路径沿 033 同一规则查找；同名页显示实际路径，空查询保留最近文件优先。
- G-03：输入与弹层开关不修改全文查询／结果、标签／反链开态，也不读写编辑器正文；取消不改变活动文档、dirty、草稿或磁盘。
- G-04：真实开页成功才关闭、记最近文件和更新当前页上下文；目标已打开且 dirty 时只激活内存页，失败可见且可重试。
- G-05：过期目录、关闭重开、查询修改、较旧开页请求不得打开错误候选或重新弹出 UI；两轨具备输入、Enter、Escape、Tab／点击证据。

范围：jade-edit 的 app.at、editor_store.at、find_panel.at 必要兼容、tests/e2e 与局部规范。本次不改 backend、auto-lang／auto-down、生产 gen；不实施 037，不补原生内链／实时解析／空白编辑器／命令桥／Shift／定位。拖拽宽度、布局持久化、自动响应式侧栏、全文摘要、排序分页、箭头键选项遍历和 Musk 工作台另立。

成功样：全文查找“项目”的结果仍在侧栏，用户 Ctrl+P 输入“首页”，弹层显示“首页”和 wiki/index.ad；按 Enter 后激活正确页并关闭，全文查询和结果仍在。输入不存在名称再取消，没有新页、脏正文或最近文件变化。

## 2. 架构方案

1. **开态单点**：拟新增 Store.quick_open 和同步 QuickOpen/QuickClose；App 维护 quick_q、quick_rows、quick_first_path、quick_err、quick_busy、quick_epoch／请求号。开态不复用 find_open/find_mode，查询不复用 find_q。
2. **目录共用，查询独立**：共享 names / names_seq / names_gen / names_state 和 page_names，不新增快开 API。过滤复用 name_rows_of；目录提交时按最新 quick_q 重算，逐键过滤零 fetch。全文搜索保持 find_* 状态和请求门。
3. **根弹层，单编辑器**：复用当前 dialog/input/button，input、结果点击与错误/空态留在 App 根视图以维持 native 自动化可见性；编辑器位置、key、content、实例不因开关快开而变。
4. **路径拾取安全**：快开行传真实 path。App 一个协调 handler 拥有检查／读取；复用 Store.NavCommit 同步提交与 tab 身份，不能将未 await 的 OpenLink/Store.Open 视为完成。现有 dirty 目标优先，不通过名称 resolver 猜路径。
5. **真实消费核验**：两轨验证弹层焦点、Enter/Escape 和开页结果，绝不依赖未实现的 native command 组件或全局方向键空 handler。关键公开焦点形态由 T-01 有界原型固化。

## 3. 技术栈

Auto 单源、VM merged/iced、Vue3 与现有 dialog；沿 scripts/regen-vue.mjs 生成。测试沿 vm_matrix / 独立探针工程与 Playwright 配方，不手改生成 Vue、不引入私有 DOM/引擎或原生特殊知识库模型。

dialog 默认首输入聚焦、input.onenter 与 Escape 关闭必须在当前两轨实测。程序化 ui.focus 的 native 输入事件键与 Vue selector 语义不同，不能假定同一个字符串两轨都有效；如使用，T-01 给准确公开调用及证据。不能把 focus miss 或全局截获 Enter 当成功。

## 4. 需求分析与背景调查

### 4.1 规划时点

r1 开始基线 main HEAD=18c278ada751025f7a56787ead4fd6268d2ee574（037 executing 中，工作树有其 native probe 修改）。**r2 复基基线 main HEAD=0d92d9960c53f4ae1e41ce22fd8454b9c6b4d31a**（037 归档 merge tip）：主检出 clean（唯一未跟踪件为本计划）；r1 记录的 037 WIP 已随其交付归档消失，tests/probe_native_wiki_link.mjs 现为正式交付测试件（037-native-link-contract 附件同在册）。编号沿用 r1 分配：active 仅 038、archived 最大 037，无重号，不预占后续编号。

无 Spec overview/index；当前权威是下列局部规范。r2 已重算全部 SHA256：**10/11 与 r1 恒等**（037 全链零源码改动的直接实证），仅 wiki-link-navigation.md 因 037 merge 追加原生证据行（SD-3701..3704 指针／来源先验步骤 0／原生证据行）而更新——**本片引用的 NavCommit 同步门、源票据／选择世代、目标内存优先、成功后副作用语义未变**。T-01 开工时仍复核 HEAD／指纹／binary，防 r2→work 之间再漂移。

| 来源 | 依据 | SHA256（r2 复基读取时 2026-10-08） |
| --- | --- | --- |
| docs/specs/name-search.md | 名称目录、统一匹配、同名路径、最近、逐键零 fetch、刷新／失效／错误；files 拾取即关语义从旧侧栏迁到快开弹层 | A4E03D1F4D9F85D413F3DCECA84923EFD29EB862BF7A1587D816DF19F65902B9（与 r1 恒等） |
| docs/specs/wiki-link-navigation.md | NavCommit 同步门、源票据／选择世代、目标内存优先、成功后副作用；复用该基础，不扩大正文链接能力 | **42C6237BA87F722DFBB707319614841CB71F99C9A114C1D17459BC3A0067483D（r2 更新：037 merge 追加原生证据行；引用语义恒等）** |
| docs/specs/editor-safety.md | 弹层不能引起 Reload、key 变化或未保存丢失 | 2CD7BB0A5D2F1D6D4BF56A7B616FD1CEC164054E30C3A4AB0A9960AF786D0051（与 r1 恒等） |
| docs/specs/draft-recovery.md | 保留 doc_id/erev/检查点，开关快开不结算草稿，在途排水继续 | 41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7（与 r1 恒等） |
| docs/specs/document-lifecycle.md | 稳定 tab_uid、路径变化和新输入保护 | C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF（与 r1 恒等） |
| src/front/app.at | ActFindFiles→FindOpen(files)，files 与 text 共 find_q 和右栏；NamesRefresh/NamesInvalidate、FindPick、OpenLink；根 dialog/input 已使用 | 142B480201BCE07C301CA1FEEDEDFBE2CE4A1CC72E1C3C0ABE5148682624C808（与 r1 恒等） |
| src/front/editor_store.at | FindOpen/FindClose、NavCommit、TabActivate、保存／草稿保护 | DB6AE07C33BA2083B0741985C5F77DD22A58D8CCBF712C8C8E8B711151546A78（与 r1 恒等） |
| src/front/find_panel.at | 当前 files/text/wanted/trash/orphans 共侧栏壳，需要移出 files 用户面而保留其他模式 | D650734418D709C4FD7753E557497051413D2A3BD834A284DB12A2BE120DA3DE（与 r1 恒等） |
| tests/vm_matrix.mjs | 当前 v28 主结构，快开拾取和键程须适配新位置，旧检查口径不降低 | 8497364C2E23FD161BF8C3075C1925C6D0D4D18DED6FD2C81C347A823B1C1CA8（与 r1 恒等） |
| e2e/name-search.spec.ts | 名称已知答案、失败／过期／刷新弧；原侧栏定位需随迁移更新 | CFC2ABF945C94D2C929BEE089F2D4D938710A7B1396F7DC97AA2E03EA7C6AC4A（与 r1 恒等） |

r2 读取时 auto.exe=`auto 0.1.0+v0.4.2-2730-g91ae002d3-dirty`，SHA256 `1DAE8B494A045A6409E2B03B7C09AD8D6F3C5BFDAD09F82347D947FDC42339E3`（r1 记录为 v0.4.2-2702-g59ff4e66f；037 归档回执接受的上游域 2730-dirty，满足 editor-host 记录的 v0.4.2-2713+ 绑定门）。上游 widgets/command-family.md（SHA256 `07C17542D9AD49FC6D60A7C099EF9B041B5C3072A1600155644B84D9DF41528A`，**r2 复验恒等**）明确 VM iced:none；design/programmatic-focus.md（SHA256 `F38A5565065339A00036E04A0FA769EF9E76D36A4BA411BDBE9A3F073BCA23AF`，**r2 复验恒等**）明确双轨调用语义差异。此处只读，不修改上游或运行其 cargo。

037 merge 另更动了 editor-host-capabilities.md（§1.3 原生 merged/split 分行、§3 B-2 缩窄为 save 通道、C-3 增 native merged 片）与交付路线图（R-03 行更替、推进顺序已记"037 已收口，038 前置解除"、§15 保留 r1 交接）；r2 已读回，均与本片"复用 NavCommit 门、不扩正文链接、不等命令桥"的边界一致，无需改契约。

### 4.2 独立性与执行顺序

原生正文内链的真实窗口集成核验仍属于 037；本片复用成熟名称目录和弹层，功能不依赖新的 link 事件。R-03 其余保存、命令、位置供给不能绑成所有 UI 改造的前置。R-05a 先解决快速切换入口；R-05b 再归位全库导航、标签与当前页引用，避免一次改全布局。

037 与 038 曾共享 app.at／editor_store.at 写面：r1 设的门是"生产 T-02..05 必须待 037 收口"。**r2 复基解除该门**——037 已 delivered/archived（链 c953837→c1ca4b6→3084d85→0d92d99），三份共享文件自 r1 读取以来 SHA256 恒等（§4.1 表），038 现为共享生产文件的唯一写者。开工时按单写者规则复核当前 HEAD 与文件指纹即可；若 r2→work 之间出现新的共享写面占用，恢复顺序等待而不并行写。本片不接走 037 的任何验收，也不把其残余（native split 链接消费、S 等待窗 live 验证、save／命令桥／caret-reveal 供给）移到自己或跳过。

### 4.3 授权

r1（2026-10-03，并行会话）：用户请求“计划037快要完成了；请继续规划下一个计划”——创建 038／更新分析路线图，仅规划与读仓。r2（2026-10-08，本会话）：用户给定 R-03 现状陈述（037 已交付、剩余缺口分立、路线图下一项为 038），请求 auto-plan-new 规划 038——本会话据此**复用既有草稿做复基修订**（不覆盖重写），仅刷新过期事实；不执行计划、不改 canonical Specs／上游、不自动 work/review/merge。两次授权均无用户预算。后续为 Jade 本仓范围，跨仓组件供给若 T-01 发现硬缺口须单列 blocker，不擅自执行。

## 5. 详细设计

### 5.1 入口与弹层

- 保留 action id=view.find-files、Ctrl+P、菜单“快速打开”；加一个始终可见的工具栏入口（不依赖右侧栏开态）。所有入口同 ActFindFiles→QuickOpen，重复触发幂等，不叠第二弹层。
- 根 dialog 标题“快速打开”，输入提示“输入标题、别名或路径”，结果主行显示名称、次行显示实际相对路径；空查询有最近记录则优先显示最近，否则目录全量，仍保留最近历史容量／顺序／持久化规则。
- 首个有效候选以名称＋路径清楚高亮；输入框 Enter 打开该候选，Tab 可到指定结果按钮再 Enter，点击任一行传其 path。零结果、loading/error 或 busy 时 Enter 不打开、不创建，不落到其他对话框默认动作。
- Escape／取消走同一关闭清理；外部 dialog open=false 也须使旧 quick_epoch／开页请求逻辑失效，避免 ESC 仅关旗标留票据的 036 B-10 同族问题。可由关态门＋每次重开递增世代／重置busy达成，不依赖未经核实的dialog关闭回调。取消不重挂载编辑器、不更 active_key、不清正文/dirty/save_note。
- Vue 在 1280 和 360 宽度、VM 在 1024 和 640 宽度验证输入、结果、关闭均可见；结果长路径可换行／截断但完整路径有可读方式，弹层列表可滚动。不要求本片完成整个应用的小屏侧栏。
- 使用已有 dialog/input/button；默认聚焦和事件归属由 T-01 冻结。不得因 native command 缺实现而交付 Vue-only，也不新增全局方向键／Enter 截获。

### 5.2 独立查询与共享目录

- quick_q 独立于 find_q；快开开启／关闭／输入不改 find_open/find_mode/find_rows/find_ran/find_err/find_stale，不使全文在途请求失效。tags_open/backlinks_open 同样保持。
- 名称数据只留一份：names、names_state、names_gen、names_seq。开启快开仍无条件重取目录（033 外部变更观察口）；输入只 name_rows_of 内存过滤，零请求。不要依赖 computed 列表（VM 旧渲染边界），quick_rows 为模型字段并在输入／有效目录提交时同 handler 重算。
- names 成功返回必须配对**当前** quick_q，选中路径不得沿用旧列表索引；使用 first path／实际 row path。查询变更重置首选；加载或错误清可打开候选，保留输入文本；成功后标出首项。前端不按显示名合并同名页，不把 title 作为 path。
- names_gen 的磁盘变化触点不变；即时重取门改为“全文侧栏开态或 quick_open”，两者都关时只失效。一个有效目录结果可更新共享缓存，但关闭后的 UI 不得因回包重开或改旧快开请求；再开触发新 seq，以新输入为准。
- 目录失败保留独立 loading/error/ready 语义，显示“名称加载失败”和重试，不伪装为无结果。全文仍消费自己错误／过期状态，不能被快开错误覆盖。
- 旧 FindOpen(files)/FindPick/FindEdit 如需兼容，映射到新快开开关／输入／拾取，并记录明确条件；官方入口不再写全文模式为 files。其他 text/wanted/orphans/trash 模式不改。不是同时维护新旧两个快开用户面。

### 5.3 开页事务边界（只读准备＋同步提交）

1. 在输入 Enter／点击时捕获实际 path、quick_epoch／请求号、源 active_uid/sel_gen/key/body；不捕获行索引、不把名称交 resolver。无文档／untitled 源也可快速打开，T-01 必须验证 uid=0 的现行提交形态或给等价同步门。
2. 已在 tabs 的 path 激活现有内存页；不重读覆盖 dirty。未开目标只读 exists/read_wiki，并在每等待期后验弹层仍开、票据／查询选择仍有效、源实例与世代未变；等待中另一个入口已打开目标，最终提交以 Store 当前 tabs 为准，避免重复。
3. 提交复用或提取 NavCommit 的同步门／构造段，保留 tab_seq／doc_id／draft_*／recover_*／lc_review。不要经 OpenLink fire-and-forget 后立刻关弹层、记成功。现行 NavCommit 空 anchor 会清旧定位说明，属于真实成功导航的现行语义；取消／失败不调用它、不改 wiki_nav_note。
4. 成功回执后才关闭弹层、记最近文件和刷新当前页反链／提及。不能只凭active_path等于目标判成功（目标本就是当前页时会误判），T-01须冻结可关联本次提交的回执或同步选择世代推进证据。请求失败留弹层，quick_err 可见，输入仍保留；目标不存在提示刷新目录，不自动 CreateGo 或弹缺页创建。错误不占 save_note。
5. 关闭、关闭重开、输入改变、重复拾取、源切档／关闭重开／改名／新输入使旧开页票据失效。旧结果不得关新弹层、激活页、写最近文件或盖新错误；busy 期间阻止重复确认，但 Escape／取消始终可用。

### 规范增量

本次仅提出，实施／复审后沉淀；037 的规范更改与旧归档历史不被本片代写。

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/quick-open.md（新）§1 | 前：快开混在右查找栏；后：双轨根弹层、三入口共口、焦点／Enter首选／Tab与点击／Escape取消，宽窄窗可操作 | 高频切换入口独立且可达 | AC-01, AC-02, AC-03 |
| SD-02 | add | docs/specs/quick-open.md（新）§2 | 后：query/open独立，目录缓存／匹配共用，全文与其他面板不被快开覆盖，loading/error/ready及世代门明确 | 分离工作空间与临时操作 | AC-04, AC-05, AC-06 |
| SD-03 | add | docs/specs/quick-open.md（新）§3 | 后：实际path拾取、源票据与真实完成门、脏目标优先、取消/失败零副作用、成功后才关闭/最近/上下文 | 防迟到错误打开及假成功 | AC-07, AC-08, AC-09 |
| SD-04 | modify | docs/specs/name-search.md §1.2/§2/§3 | 前：files/text 共 find 面；后：files 用户入口迁独立快开，text状态保留，匹配/目录响应不变，刷新可见消费者门扩 quick_open | 修改UI归属，不改目录／身份 | AC-04, AC-05, AC-06, AC-10 |

## 6. 测试设计

新增 tests/probe_quick_open.mjs（真实生产 Store／App 消费或薄载体，VM merged键程／状态与对照；不是复制策略机）、e2e/quick-open.spec.ts（Vue 键鼠、视口、延迟反例）、attachments/038-quick-open-contract.md（公开构件、焦点、关态清理、完成门冻结件）。复用 name-search 已知答案、page_names 只读证明、vm_matrix 和既有保护用例。

| 组 | 样本／证据 | AC |
| --- | --- | --- |
| I 入口 | Ctrl+P／菜单／工具栏均同一弹层、重复打开不叠、立即可输入；无文档和有 dirty 文档各测 | AC-01 |
| K 键程 | 输入后 Enter 首选、Tab到不同路径按钮再Enter、Escape／取消、零结果Enter零动作；模态期间不触保存／退出或底层编辑键程 | AC-02 |
| W 宽窄窗 | Vue 1280/360、VM 1024/640；输入／路径／取消可见且列表可滚动、无右侧hidden依赖；打开关闭 editor实例不换 | AC-03 |
| Q 名称 | title≠stem中文、alias、大小写、相对路径、同名两路径、空查询最近优先；每输入零新增fetch | AC-04 |
| C 独立状态 | 全文在途及有结果／错误／过期三态下开关和输入快开；fullname查询／结果不变，标签／反链开态保持 | AC-05 |
| R 目录门 | 开启重取、目录延迟后再改输入、取消再开、外部改名后再开、错误恢复，最新query配目录；error不等于空结果 | AC-06 |
| O 正常开页 | 无文档／untitled／dirty源；dirty目标只激活；目标未开成功读取；不存在／读失败不开新tab、不自动创建、不记recents | AC-07 |
| S 开页过期 | 延迟exists/read，期间Escape、关再开、改query、双拾取、源切档往返／关闭重开／改名／新输入；旧结果零开页／关新弹层／最近／提示 | AC-08 |
| P 零副作用 | 无新输入、已落定检查点时取消前后 source body/key/uid/dirty/original/draft身份及磁盘恒等，save_note/wiki_nav_note保留；在途检查点继续，成功后恰一次recents/context | AC-09 |
| G 定向回归 | 033名称、036/037已落地内链、菜单说明、F5/保存/草稿/生命周期及主结构；不同新基线差异逐项记录 | AC-10 |

后续实施命令（仓根）：

```text
node tests/probe_quick_open.mjs
node tests/probe_name_search.mjs
node tests/probe_native_wiki_link.mjs
node scripts/regen-vue.mjs
node tests/vm_matrix.mjs --arm merged
pnpm exec playwright test -c e2e/playwright.config.ts e2e/quick-open.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/name-search.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/wiki-link-navigation.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/command-availability.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/reload-safety.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/draft-recovery.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/lifecycle-safety.spec.ts
git diff --check
```

新增 probe 默认全臂，每阶段截止，真实键／输入／结果可观察；无输入证据则 BLOCKED，不以 state直写过门。Vue单跑分进程，旧选择器随UI迁移更新但名称/保护断言不删；两轨主功能全过。vm_matrix 在037最终基线之上仅解释新弹层/状态和files旧侧栏移除，不直接重锁旧v28覆盖其改动。**r2 落定：037 已 delivered/archived，T-05 运行其正式 native 回归**——probe_native_wiki_link.mjs（N/O/P/M 四臂）入命令清单；如改动涉 boot／通道面再加跑 probe_editor_host.mjs --phase all。037 残余（native split 链接消费、S 等待窗 live）维持其归属单列，本片不代验也不假绿。

## 7. 验收标准

| ID | 可观察结果与验证／预期 |
| --- | --- |
| AC-01 | I组两轨三入口同一根弹层且输入可立即键入；重复入口不叠层，Ctrl+P不打开旧右侧files面；无文档也可用 |
| AC-02 | K组Enter只开可见首选实际path，Tab+Enter可开另一结果，Escape/取消同终态；loading/error/busy/空结果Enter零开页／零其他默认操作；不注册全局方向键或Enter |
| AC-03 | W组四视口输入/结果路径/取消可用，不因hidden md:flex丢入口；仅打开/关闭快开不换editor key或实例，列表可滚动 |
| AC-04 | Q组033全名称域已知答案、同名逐路径、空查询最近优先均通过，逐输入请求数零增；目录/文件数据/链接身份语义不变 |
| AC-05 | C组全文查询/结果/运行/错误/过期状态与在途request语义保持，tags/backlinks开态不变；快开有独立查询和错误 |
| AC-06 | R组每开启重取目录，延迟／关闭重开／修改query只按最新输入展示；旧结果不重开弹层/错选，错误有重试且不伪空，外部变化可观察 |
| AC-07 | O组真实开页正确，无文档/untitled可开、dirty目标零覆盖且不重复tab；只有提交成功才关弹层/记最近/context，失败留层可见且不建页 |
| AC-08 | S组两个等待窗旧票据全部拒绝；Escape后不晚开页、关再开后旧请求不关新层、不改最近或错误；实际App消费路径有证据 |
| AC-09 | P组取消与失败不改源正文/key/dirty/original/draft身份或save_note/wiki_nav_note，无Save/Reload/草稿结算；在途排水继续，成功副作用恰一次 |
| AC-10 | 定向旧套件与两轨新用例通过，037最终落地功能不回退；SD-01..04有终版与证据，源/binary/Spec/revision绑定，旧归档和他任务WIP零改写 |

## 8. 执行步骤

| 步骤 | 依赖 | 已核实路径／符号 | 交付／验证 | AC / SD |
| --- | --- | --- | --- | --- |
| T-01 双轨弹层与完成门原型 | 无；**r2 复基已完成**（037 delivered@0d92d99、共享文件指纹恒等、binary 2730-dirty 在册）——开工时按§4.1 复核 HEAD／指纹／binary 即可，可在隔离工程验证 | app.at根dialog/input/ActFindFiles/NamesRefresh，editor_store.at NavCommit/FindOpen；新probe、契约附件 | 冻结dialog聚焦、input Enter、ESC/外部关态清理、Tab结果键程、列表宽度；验证uid=0／untitled和共享同步提交；每关键未知一次原型＋一次原因针对复测。公开形态不可达报blocker，不能改成Vue-only或删除键程 | AC-01,02,03,07,08；SD-01,03 |
| T-02 [✅ 已完成] 独立快开状态与目录消费 | T-01；037生产写窗口收口，复基完成 | app.at模型/ActFindFiles/FindEdit/NamesRefresh/NamesInvalidate/FindPick；editor_store.at开关/兼容消息 | 新quick状态与query，目录共享／逐键零fetch、最新query配有效目录；全文与其他面板隔离；新probe Q/C/R全过 | AC-04,05,06；SD-02,04 |
| T-03 [✅ 已完成] 三入口与根弹层迁移 | T-02 | app.at action/toolbar/menubar/右栏files分支/根dialog；find_panel.at壳；新e2e | 快开独立根弹层，候选名称/path首选、加载/错误/无结果/最近；旧files用户面移出右栏，其他模式不动。生成后两轨I/K/W通过，双轨指定四视口检查，编辑器仅开关零重挂载 | AC-01,02,03,04；SD-01 |
| T-04 [✅ 已完成] 真实开页和过期门 | T-01,T-02,T-03 | app.at新QuickPick协调段、既有recents/context；editor_store.at NavCommit共享同步段 | path票据+每等待期门、dirty目标优先、成功才关闭/recents，失败独立提示；新probe/e2e O/S/P全过，取消零副作用 | AC-07,08,09；SD-03 |
| T-05 [✅ 已完成] 回归与规范交接 | T-02,T-03,T-04 | §6旧tests/e2e、vm基线；新quick-open Spec、name-search拟议修订、ARCHITECTURE指针、路线图 | 定向门全过、基线差异解释、SD-01..04终版；**跑037正式native回归（probe_native_wiki_link 四臂，已交付无休止分列）**，不删其未通过证据；git diff --check清，递交独立review | AC-01..10；SD-01..04 |

进度5/5（T-01..T-04 已落 2026-10-08/09；T-05 全门绿 2026-10-09）：T-01 **[✅ 已完成]** 载体探针 `tests/probe_quick_open.mjs --phase t1` 全绿（10 pass/0 fail/2 blocked）+ 契约冻结件 `attachments/038-quick-open-contract.md`。冻结面：弹层公开构件（dialog/input/onenter/行钮/取消钮/overflow-y-auto 列表）；VM 程序化聚焦 `ui.focus(".事件名")` 有效且回执落盘须模型声明 `var __focus_result str = ""`（未声明=renderer write_state FieldNotFound 静默——首跑 FAIL→补声明复测 PASS 一次闭环）；uid=0 无文档源经真实 store NavCommit 建页+激活（autoui_action submit 定址派发 onenter）；脏目标直激活零覆盖零重复 tab；stale 目录 missing 独立错误零建页弹层留置；完成回执=`active_path==path && sel_gen 前进`（误判族解除）；busy/零结果 Enter 零动作；取消零副作用。blocked 边界 F-038-R1：VM Escape 无公开关闭形态（modal 不消费+合成通道零派发；不新增全局 Escape bind——035 让位纪律同面，取消钮承载同终态）、VM Tab 键程遍历不可合成（vue 原生 DOM 焦点序+VM 鼠标点击承载全候选）。vue 轨聚焦=DialogContent 原生 autofocus（slot 先于 X 钮实勘）+Escape=v-model 直写开态（030 同型），e2e 于 T-03 首验。T-05 交接批：docs/specs/quick-open.md（新·SD-01..03 终版）+name-search.md 修订（SD-04 消费面归属）+ARCHITECTURE SD-3801 指针+路线图 R-05a 落地行。全门：probe_quick_open t1 10/0/2+prod 18/0/0、probe_name_search 双臂全案、probe_native_wiki_link 31/0/3（既有 blocked 单列）、probe_editor_host 全案（unsupported 按行在案）、vm_matrix merged 20/20+⑩b⑩c（基线 v29）、e2e quick-open 5/5+name-search 6/6+wiki-link 8/8+command-availability 3/3+reload/draft/lifecycle/editor-host 19 passed、regen-vue 绿、git diff --check 清。

## 9. 复审记录

r1（2026-10-03）：

- stage: new
- plan_id: PLAN-038
- plan_revision: 1
- outcome: pass
- next: work（先T-01核对037当前基线与隔离原型；生产T-02起须满足写窗口收口／复基门）
- changed_tasks: T-01..T-05（新建）
- changed_acceptance: AC-01..AC-10（新建）
- 交接检查：5任务覆盖10验收／4SD，当前API/文件已核实，未知焦点／关态／同步完成机制以有界T-01决策件落实。本片无native链接通道硬依赖，未宣称037完成；pass仅表示可开始有界工作，不是功能验证通过。
- 授权仍是本次规划；当前drafting，不自动执行。

r2（2026-10-08 复基修订，依据用户同日请求）：

- stage: new（复用既有草稿的在位修订，非重建）
- plan_id: PLAN-038
- plan_revision: 2
- outcome: pass
- next: work（037 前置已解除；T-01 起即可按单写者在主检出开工，先做§4.1 指纹复核）
- changed_tasks: T-01/T-05 依赖与037回归措辞落定（任务结构、交付、AC 绑定未变）；T-02..T-04 未动
- changed_acceptance: 无（AC-01..AC-10 恒定）
- 修订内容与证据：基线 HEAD 18c278ad→0d92d99（037 归档 tip）；037 executing→delivered/archived（归档链 c953837→c1ca4b6→3084d85→0d92d99）；写窗口门解除（app.at/editor_store.at/find_panel.at 及 vm_matrix/name-search e2e SHA256 与 r1 恒等＝037 零 src 改动实证）；wiki-link-navigation.md 哈希 82869E12→42C6237B（037 merge 追加原生证据行，引用语义恒等）；binary 2702-g59ff4e66f→2730-g91ae002d3-dirty；上游 widgets/command-family.md 与 programmatic-focus.md 复验恒等；主检出 037 WIP 已清；D-01 落定。
- 目标／验收／范围／SD-01..04 与 r1 恒等；本修订属基线事实刷新，继承既有授权，无需用户再决策。
- 当前 drafting，不自动执行。

- 2026-10-08T15:55:00Z：stage: work | plan_id: PLAN-038 | plan_revision: 2 | outcome: executing（启动） | code_commit: 基线 0d92d99（037 archived/delivered tip；直接 main 线性惯例单一主检出——001..037 在册，无 worktree/dev 分支面，本片沿用仓库既定惯例） | task_ids: 无（T-01 未开工） | evidence: 用户指令「计划038: auto-plan-work 实施它」授权执行（drafting→executing）；D-01 复核全绿：HEAD=0d92d99 恒等＋§4.1 表 10/10 指纹实测恒等＋binary 实测 auto 0.1.0+v0.4.2-2730-g91ae002d3-dirty/1DAE8B49…2339E3 恒等＋上游 widgets/command-family.md 07C17542…/programmatic-focus.md F38A5565… 恒等；主检出零 WIP（唯一未跟踪件=本计划簿记）；工作树清单=单一主检出 D:/autostack/jade-edit@main，无既有 038 工作树/分支；r2→work 间无新共享写面占用（共享文件指纹恒等即证），单写者成立 | blockers: 无 | next: T-01（双轨弹层与完成门原型）。

- 2026-10-08T16:20:00Z：stage: work | plan_id: PLAN-038 | plan_revision: 2 | outcome: pass（T-01 闭环） | code_commit: 基线 0d92d99→本批（tests/probe_quick_open.mjs 新增+attachments/038-quick-open-contract.md 新增+计划进度/§9/§10；生产 src/tests 既有面零改动——T-01 为隔离载体原型面） | task_ids: T-01 | evidence: 探针 phase t1 终判 **10 pass/0 fail/2 blocked**（双载体 1024x768/640x480，原样拷贝生产 editor_store.at，MCP autoui_* 真实驱动）：F1 弹层可见面（标题+输入+取消+行集）/F2 ui.focus(".Edit") → `__focus_result:"ok"`〔关键定谳=renderer write_state 要求模型已声明字段，未声明 FieldNotFound 静默——首跑 FAIL→补声明一次复测 PASS〕/F3 独立 q+行集过滤+首选 path/F4 Enter（autoui_action submit 定址派发 onenter）→uid=0 票据经真实 store NavCommit 建页+激活+sel_gen 前进+弹层关+回执恰一/F5 脏目标直激活（tab 不增+脏标+内存正文保持）/F6 stale 目录 missing（磁盘删档→独立错误+留置+零建页）/F7 零结果 Enter 零动作（autoui_keyboard 代理通道）/F8 取消零副作用/W 窄窗 640 可见面+滚动节点 | blockers: F-038-R1（nonblocking 边界单列 §10）：VM Escape 无公开关闭形态（036 modal 语义在案+合成通道零派发实测——不新增全局 Escape bind，取消钮承载同终态）+VM Tab 键程不可合成（vue DOM 焦点序+VM 鼠标点击承载） | next: T-02（独立快开状态与目录消费；生产写窗=本片单写者）。

## 10. 待澄清事项

- D-01 owner=038执行者：**r2 已落定**——037 终态＝delivered/archived@0d92d99（src/front 零改动、共享文件指纹冻结于§4.1 表、037-native-link-contract/probe_native_wiki_link 在册、binary 2730-dirty）。执行侧残余义务收窄为：T-01 开工时复核 HEAD／指纹／binary（防 r2→work 漂移）；若期间出现新的共享写面占用则顺序等待，不并行写 app/store。
- D-02 owner=038执行者（**T-01 已落定**）：双轨焦点、Enter／Escape、列表宽度与无文档提交形态原型冻结于 attachments/038-quick-open-contract.md（焦点=VM ui.focus(".事件名")+__focus_result 声明观察位/vue DialogContent 原生 autofocus；Enter=onenter 双轨声明派发；Escape=vue v-model 关态门兜底/VM 无公开形态 F-038-R1 单列；宽度/滚动=载体 640 实测；uid=0 提交=NavCommit 原生门通过+sel_gen 回执）。没有全局截键、没有 Vue-only 降格。
- F-038-R1（owner=上游 VM modal/键盘语义；nonblocking 边界）：VM 轨 Escape 无公开关闭形态（vm modal 不消费 Escape〔036 在案〕+autoui_keyboard Escape 合成通道零派发〔T-01 F9 实测〕）、Tab 键程遍历不可合成（F10 实录）。处置=不新增全局 Escape bind（035 让位纪律同面）；VM 同终态由取消钮承载、全候选鼠标点击承载；vue Escape/Tab 由 e2e 承载全绿判据。重入门=上游 modal Escape 语义或合成键盘通道解锁。
- 无需用户再决定本片产品范围；箭头高亮遍历、全部侧栏重排、拖拽宽度、布局恢复留作后续候选，不占正式号。
- 036 B-6/B-7、037的live原生点击核验以及保存／命令／位置／Shift供给维持各自归属；本片不宣布解决这些缺口。

- 2026-10-09T02:40:00Z：stage: work | plan_id: PLAN-038 | plan_revision: 2 | outcome: pass（execution_done） | code_commit: d6bceb3（T-02）→T-03/T-04 批（src/front app.at+find_panel.at+editor_store.at=T-02 已含；tests/probe_quick_open prod 相位+vm_matrix v29 迁移+e2e 五套件适配+e2e/quick-open.spec 新建+tests/baseline/structure-v29）→T-05 批（docs/specs/quick-open.md 新+name-search.md 修订+ARCHITECTURE SD-3801+路线图 R-05a 行） | task_ids: T-02/T-03/T-04/T-05（T-01 前批已录） | evidence: **T-02** store quick_open+QuickOpen/QuickClose+App quick_* 七字段+QuickEdit（零 fetch）+NamesRefresh/NamesInvalidate 门扩（生产 boot 冒烟+载体探针回归恒等基线）；**T-03** ActFindFiles 三入口共口迁移+根弹层视图（quick_view_rows 物化行集——VM 恒渲染子树 len() 过渡不重评实勘规避[曾误判渲染边界，实勘定谳=查询跨开合保留语义，视图正确]）+旧 files 用户面退役+ui.focus 入口；**T-04** QuickPick 协调（票据+两窗门+NavCommit+sel_gen 回执+missing 独立错误）——probe prod 18/0/0（I 四入口/K 键程/Q 五域同名/C 独立/R 重取+外部改名/O stale missing 拒开）+e2e quick-open 5/5（含 route-delay 迟到票据+脏目标直激活+missing）+vm_matrix 全绿；**T-05** 规范 SD-01..03 终版（quick-open.md 新）+SD-04（name-search 消费面归属修订——目录/匹配/门语义零变化）+ARCHITECTURE SD-3801+路线图+037 native 回归 31/0/3（既有 blocked 单列）+probe_editor_host 全案+probe_name_search 双臂+regen-vue 绿+git diff --check 清+matrix.spec/vue matrix/wiki-link/command-availability/reload/draft/lifecycle/editor-host 套件选择器迁移（弹层面+menuitem 锚——名称/保护断言零删除） | blockers: 无（F-038-R1 nonblocking 上游键程单列 §10） | next: 独立复审（auto-plan-review）。

- 2026-10-09T03:20:00Z：stage: review | plan_id: PLAN-038 | plan_revision: 2 | outcome: pass | reviewed_commit: 64e1a150631ef4d904a02d0edd0043af2e396792 | base_commit: 0d92d99（037 archived/delivered tip；链 0d92d99→e067723→d6bceb3→59229a9→64e1a15 直接 main 线性 ancestor-OK，单一主检出，复审窗工作树仅并行会话 docs/analysis v0.5 簿记 2 件〔untracked+roadmap 追记——他任务 WIP 路由其 owner，非代码面不入本判〕） | dependency_revisions: binary 实测 auto 0.1.0+v0.4.2-2730-g91ae002d3-dirty/1DAE8B49…（§4.1 记录恒等）；上游 widgets/command-family.md iced:none 与 programmatic-focus.md 引用恒等；auto-down 未动 | spec_inputs: docs/specs/quick-open.md@64e1a15（SD-01..03 新·逐句对读与实现相符——含 §7 T-03 执行期定谳）+docs/specs/name-search.md@64e1a15（SD-04 消费面归属修订——diff 逐块对读：目录/匹配域/请求门/身份边界语义零变化，拾取语义改 QuickPick 回执关层与 quick-open §3 一致）+docs/ARCHITECTURE.md SD-3801 指针+路线图 R-05a 行 | acceptance_results: AC-01 pass（probe prod I1-I4 菜单/工具栏/Ctrl+P 三入口同一弹层+幂等+无文档+ui.focus ok；e2e 三入口）／AC-02 pass（probe F4 Enter 首选 uid=0 NavCommit+F7 零结果零动作+F8 取消同终态；e2e 键程 Enter/Tab/Escape；VM Escape/Tab=F-038-R1 边界单列非本片 AC 违约——取消钮承载同终态 vue Escape 全绿）／AC-03 pass（载体 1024x768+640x480 可见面+滚动；e2e 1280/360+编辑器实例 element 恒等）／AC-04 pass（probe prod Q1a-f 五域+同名双 path 行点击各开各档+Q1f 最近替换式+Q2 names_seq 恒定逐键零 fetch）／AC-05 pass（probe C1 find_q/find_ran 不动+quick_q 独立+C1b 反链开态保持）／AC-06 pass（probe R1 入口重取 seq 恰一+R2 外部改名可见+e2e name-search 刷新/迟到门）／AC-07 pass（probe K1 Enter 真实开页 tab+1+F5 脏目标直激活零覆盖零重复+Q1e 同名第二行+F6 stale missing 独立错误零建页；e2e 真实开页保护+missing）／AC-08 pass（e2e 迟到票据 route-delay：read_wiki 延迟窗 Escape 零开页零 recents+关再开旧结果不关新层零错误回写；merged 无真实窗=边界分列 probe 契约 §6）／AC-09 pass（probe F8 取消零副作用 commit/tab 不变+e2e 取消 editor 恒等+零磁盘写入+错误不占 save_note）／AC-10 pass（下 evidence 全门+SD-01..04 终版+基线 v29 重锁逐项解释+旧归档/ledger 零触碰[diff 实勘 archived/parity-ledger 零命中]） | findings: F-038-R1（nonblocking 维持——VM Escape/Tab 键程无公开形态，owner=上游，契约 §3/§6+spec §1/§4 单列）；F-038-R2（nonblocking 新录——复审复跑观察三处负载窗 flake：vm arm D-21 popover 内容窗按钮轮询超时[批跑 10m 段一次/隔离复跑 ALL GREEN]、draft-recovery strict-mode ×2[F-037-R5 在录家族同判]、quick-open e2e 批载点击超时[单跑绿]——弹层恒渲染子树增渲染负载微推已知窗，非回归；隔离复跑全数恢复+arm5/复跑两轮 20/20 全绿佐证） | evidence: **独立复跑（本复审会话重构，未采信执行摘要）**=probe_quick_open t1 10/0/2+prod 18/0/0+vm_matrix merged 隔离复跑 26 PASS ALL GREEN+e2e 批 37 passed/2 failed→隔离复跑全绿（上引 F-038-R2）+probe_name_search phase2 全案+probe_native_wiki_link 31/0/3（037 既有 blocked 三项单列）+regen-vue OK（gen 含 QuickPick/quick_view_rows、files_rows 零残留）+git diff --check 清+工作树零 WIP 代码 | 复审限制披露：同会话复审——以工件重建+全门独立复跑+diff 实勘（archived/ledger/gen/dist 零命中）+规范逐句对读为准，未采信执行摘要 | next: merge（auto-plan-merge）——pass 全 AC+delta；F-038-R1/R2 nonblocking 分列。
