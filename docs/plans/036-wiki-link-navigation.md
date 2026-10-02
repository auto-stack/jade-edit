---
plan_id: PLAN-036
status: executing
feature_name: Vue 正文内链导航（R-03b2）
author: [agent]
created_at: 2026-10-02T07:21:54Z
updated_at: 2026-10-02T15:40:00Z
plan_revision: 1
current_step: 0
total_steps: 5
supersedes_spec_components:
  - docs/specs/editor-host-capabilities.md
  - docs/specs/editor-command-availability.md
new_spec_components:
  - docs/specs/wiki-link-navigation.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-03b2
---

# PLAN-036：Vue 正文内链导航

## 0. 变更摘要

035 已 archived/delivered，4/4 步及九条验收通过；未交付的保存事件、完整命令桥、原生正文链接是 R-03 后续能力，不是 035 遗漏任务。

本次复核发现：虽然 `onopenwikilink` 的简称生成仍错，现有公开语法 `on "open-wiki-link"` 可生成匹配引擎的监听。隔离真实引擎点击已通过，不需修改 auto-lang 才能消费 Vue 链接事件。第二参是目标锚点，不是源块身份。[上游复核记录](../analysis/2026-10-02-upstream-dependency-audit.md) 保存完整结论、方法与指纹。

下一片交付：Vue 正文 `[[页面]]` / `[[别名#锚点]]` 点击，经现行四级解析打开正确页面；缺页进入既有确认；请求迟到不能抢走后来选择的页面或覆盖未保存输入；锚点保留并如实提示尚不支持定位。同步提出规范更正，纠正“Vue 链接必须等简称修复”和“原生内部撤销不存在”的过强结论。

## 1. 目标

- G-01：Vue 正文链接成为真实可用入口，中文、别名、大小写与面板四级解析一致；不把显示 title 当路径。
- G-02：点击刚输入、尚未保存的链接也能解析，源页保持 dirty / 草稿保护，不为导航自动保存。
- G-03：正常缺页才提示创建；取消零建页，明确确认才复用既有建页流程。网络／解析／读盘失败给独立可见反馈。
- G-04：切档、关闭重开、改名、新输入、再次点击使旧导航失效；已打开且 dirty 的目标直接激活，不能被读盘覆盖。
- G-05：分别证明后端 merged / split 解析与 Vue 真实点击；原生正文事件、锚定位与保存／命令缺供给明确保留。

范围仅 jade-edit 的 Auto 前后端、测试、规划附件和局部文档。非目标：上游修改、引擎 Save 接线或动作栏隐藏、宿主命令桥、原生正文点击、块定位、外链打开机制、Shift 修复、布局、Musk 工作台。仅页面导航成功，不声称 reveal 成功。

成功样：源页新增 `[[靶心#sec1]]` 未保存，点击后打开 aliases 含“靶心”的 Tgt.ad，源 tab 正文／dirty 保留；提示“已打开页面，暂不支持定位到锚点：sec1”。慢响应期间用户切到另一页，旧结果不再切页，不产生错误的最近文件记录。

## 2. 架构方案

1. 编辑组件消费完整事件名；事件只携带 target 与可选 target_anchor，不伪称携带来源身份。handler 进入时同步捕获当前源 tab_uid、key、path、draft_erev 和正文快照，并分配递增请求号，所有异步读取由**一个协调 handler**拥有。
2. 新增只读 `POST /api/resolve_wiki_link`，单参数 target，返回顶层裸数组的一条解析结果；中文经过 POST body，沿用 VM 可消费数组形状。复用 collect_ad_pages / page_aliases / resolve_target，不另写前端 resolver，不依赖保存后的 link_index 或旧缓存。
3. 解析后仍走现行文档身份和 tab 激活规则。旧 OpenLink / Store.Open 的异步互调不能直接当完成回执；T-01 固化一个可验证的协调流程，异步 API 内联、Store 同步门与提交段衔接，复用或提取 Open 的建 tab / 激活段。解析与读取每次 await 后、最终同步提交前都检查请求与来源。
4. 独立导航提示不占 save_note。只有真实激活成功后才刷新当前页上下文和最近文件；正常 missing 才开既有确认，不把失败降格为 missing。
5. 原生轨无正文事件；保留树／面板导航和既有保存门。后端双臂可用不等于原生正文 UI 已支持。

## 3. 技术栈

沿用 Auto 单源、AutoVM merged / HTTP split、Vue3 / AutoDown 引擎与 Playwright。生成走 scripts/regen-vue.mjs，不手写生产 Vue 或私有 DOM 实例。最小探针沿 tests/probe_editor_host.mjs 的隔离工程＋serve-back 配方；生产 UI 走 e2e/playwright.config.ts 的现有双服务。

已证明完整事件名在当前 binary 与真实 engine dist 可达；正式落地仍须验证可选参数、源快照与同步 Store 门的实际发射。若 T-01 不能保证全等待期的过期拒绝，记录 blocker / needs_replan，不以仅判断解析请求号替代完整门。

## 4. 需求分析与背景调查

### 4.1 基线和依据

main HEAD `512b36ff86eddfa5231a48e8fbeb354f34b026ae`，规划开始 clean，单一主检出；docs/plans 根无 active，archived 最大 035。独占分配锁后重扫，CreateNew 分配与验唯一，attachments 不占号。无 Spec index / overview；使用以下局部 Specs 为当前权威。

| 当前来源 | 决策依据 | SHA256 |
| --- | --- | --- |
| docs/specs/editor-host-capabilities.md | §1.3/§2.4 四级解析和开档口；§2.1 保存判源限制；当前 Vue 链接缺供给、native undo 描述与新证据有差异，须提 SD 更正 | BCFD7D89050B7F353A9A31902ED553FF10A2135BDC981B14C0711FFBE355ABD6 |
| docs/specs/editor-command-availability.md | 三键归还与六守卫保持；§2 原生撤销、§3 全部正文链接均为上游项需要缩窄 | B41F26809A9F762844A36329D3379C6086826CCBD6FCD9A61F0C2627BC62ACC0 |
| docs/specs/editor-safety.md | reload / key 重挂载门，不以导航重载源页 | 2CD7BB0A5D2F1D6D4BF56A7B616FD1CEC164054E30C3A4AB0A9960AF786D0051 |
| docs/specs/draft-recovery.md | draft_erev、doc_id、检查点和保存结算；导航不改写或结算源草稿 | 41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7 |
| docs/specs/document-lifecycle.md | 稳定 tab_uid，等待期新输入／路径变化／关闭重开保护 | C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF |
| docs/specs/name-search.md | title / 名称查找不扩链接身份，depth 8 / .ad / 忽略域 | A4E03D1F4D9F85D413F3DCECA84923EFD29EB862BF7A1587D816DF19F65902B9 |
| src/back/wsys.at | resolve_target 四级级间优先、级内 walk 首现；collect_ad_pages、page_aliases、JSON 输出 | 967D187078C46EB628816E3942E854D960F11C0C40B453807F7EFB629DC013A2 |
| src/back/api.at | 新增 POST 单参；旧 link_index 保持兼容 | 8FC2AE955ED896B47EB6E20D7EF45905324D82DDDAD02288F9CBADF860D37BE6 |
| src/front/app.at | 当前 editor 仅 content/oninput；OpenLink、CreateClick/CreateGo、recents 与链接上下文 | F845D99DE66837369D74843C8AA84B2CD39AC3142425AD20C9192194657063B4 |
| src/front/editor_store.at | Open 的 tab 创建／激活、Edit 的 erev、TabActivate 与稳定身份 | 50503C60428793EC8742925B221FC862C0AD5DD2601C7DBC829B4A960C04E9B3 |

上游版本、源码 / binary 区分、引擎 dist 新鲜度、隔离点击结果见复核记录 §3/4。本次生成监听成功与两次真实点击通过；这不是应用导航实施通过。源规范差异通过 SD 提议处理，不因代码证据而静默改当前约定。

### 4.2 当前缺口与风险

- 引擎已经 emit 页面名及目标锚点；App 零监听。简称问题可绕开，但还缺“名称→路径→安全激活”的完整应用链。
- link_index 读取磁盘正文，无法代表尚未保存的新链接；因此新增按 target 解析接口，读取现行页面目录。name-search 的 dtitle 不进入链接身份。
- Store.Open 在 Vue 读盘 await 之后才激活，App.OpenLink 的调用不 await；简单接过去会产生迟到抢页、提前记最近文件的风险。
- 无锚点时第二参可能 undefined，Auto 声明的 str 不代表运行期已归一化；T-01 必测。
- F-32-R2 VM 局部槽、F-24-2 / F-35-R2 原生 split boot、Vue 互调与多套件时序、dist 新鲜度义务继续按在录边界分列。不能依靠删断言、修改全局超时或手改 gen 解锁。
- native 内部 Ctrl+Z/Y 源码存在，真键载体及各类编辑历史覆盖尚待补证；本片只修正误推论，不承诺 native 全量编辑历史。

### 4.3 授权

用户要求“计划035已经完成。请继续规划下一个计划……请检查上游依赖的阻碍”。继续 auto-plan-new：本次读取本仓与相关上游，做隔离验证，创建 Plan / 审计记录、更新路线图；不实施应用、改 canonical Specs、改上游或自动 work/review/merge。无用户预算／工期／自动续行授权。r1 提议后续实施只在 jade-edit；跨仓供给另立计划，不隐含授权。

## 5. 详细设计

### 5.1 事件和只读解析

- App 新消息 OpenWikiLink，组件明确 `on "open-wiki-link": .OpenWikiLink`；不增加 raw DOM click 或借私有 engine。
- target 为引擎 emit 已 trim 的页面名，anchor 为 emit 的目标锚点（缺参显式归一为空）。保留 # 首拆后的锚点文本，不把它当来源身份；不改现行磁盘链接提取的 trim / # 语义。
- 拟新增 api.resolve_wiki_link(target str) str → wsys.resolve_wiki_link_json(target str) str。正常响应 `[{"target":"靶心","exists":true,"target_path":"Tgt.ad"}]`；正常未命中仍一行 exists false / path 空。无效空／跨行值返回 `[]`，前端按无效处理，不开建页。
- 解析目录取 collect_ad_pages("", 8)，frontmatter aliases 取 page_aliases，调用现有 resolve_target（stem 精确→alias 精确→stem lower→alias lower，级内 walk 首现）。不用显示 title、不要拼 .ad。输出沿 json_esc_x 等已核实转义器，T-01 验中文、引号、反斜线，解码后逐值一致。
- 本接口不会调用 write_wiki / create_page；target 不是 filesystem 路径参数。路径样式或 URL 样式也只可作为 resolver 的文字输入；未命中不得直接 read_wiki 或自动建目录。UI 复用现有创建校验，非法建页名可见拒绝；普通 Markdown 外链不进入本路由。
- 目录读失败、HTTP 失败、响应不是合约的一行有效对象均是 error，不能伪造成正常 missing。未命中和错误严格区分。

### 5.2 导航时序、身份和完成

1. 点击入口在第一 await 前捕获单次不可变源票据：tab_uid / key / path / draft_erev / body，以及 nav_seq。尚未保存的 untitled 源也有 tab_uid，不能要求来源必须磁盘存在。
2. 每次 await 后与提交前检查请求号仍最新、源仍是当前同实例、key/path/erev/body 相同。切档后又切回的情况还须捕获活动选择世代，不能仅比较最终相同字段；活动选择／关闭／改名失效点在 T-01 逐入口冻结。A→B→A、关闭重开同 path 都拒绝旧票据。
3. found 目标已在 tabs：提交时重新查目标 path / tab_uid，激活现有内存页，不重读覆盖 dirty。未打开目标：只读 exists / read_wiki；再次过门；若等待中目标被别的动作打开，转为激活现有 tab，不追加重复 tab。
4. 最终同步 Store 提交负责按现有 Open 字段构造新 tab（tab_seq、草稿默认值、lc_review 等同构）或 TabActivate。复用／提取共享同步段；不引入第二套文档身份。异步 I/O 不藏在未 await 的 Store 调用之后；T-01 固化实际可执行形态与回执。
5. 只有提交成功才写最近文件和刷新当前页上下文；失败／过期不做这些成功副作用。刷新仍使用成功目标 path 及请求门，不让旧上下文回写新活动页。已有 OpenLink 的面板行为不借机全量重构。
6. 导航不 Save / Reload 源页，不清 dirty、改 original_body 或结算草稿；在途检查点继续正常排水，不要求磁盘零草稿写。源正文保存前后逐值检查。普通切档允许编辑器正常重挂载，不能把源 tab 内容重置为磁盘。

T-01 有界原型只决定上列协调形态、缺参归一化、活动世代与同步门发射；每个问题一次原型＋一次针对失败原因的复测。决策产物必须含实际 Auto 片段、生成代码核对与延迟反例测试。不增加“先接上看看”的无门中间生产实现。

### 5.3 缺页、错误、锚点

- 正常 missing 且票据仍有效：走 store.CreateConfirmOpen / CreateClick 对应的既有确认，不调用 create_page。用户取消只关确认；明确确认复用 CreateGo / create_page 的既有校验与幂等行为，不覆写同名现存页。确认期切档／新输入使此导航来源失效时，禁止旧确认借后来的活动源提交导航，并提示重新点击。
- 引用创建的上下文与普通悬空面板创建分开标识；不改变其他建页入口。创建成功也遵循真实回执再开页和最近文件；错误必须可见，不能仅 console。目标已被其他动作创建的情况不覆盖新页。
- 导航错误独立状态（拟 wiki_nav_note），不覆盖 save_note、草稿失败或 lc_review；反馈“链接解析失败，请重试”／“页面读取失败，请重试”，再次点击发新请求，旧错误不覆盖新请求。
- anchor 非空：真实打开页后显示“已打开页面，暂不支持定位到锚点：<anchor>”；失败或 missing 不显示成功。确认创建后也保留此说明。无定位调用、不宣称块选择／caret 移动，导航开页不混淆 reveal。

### 规范增量

本次只提出，下列文件在实施／复审后沉淀；不改 archived 034/035 的历史证据。

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/wiki-link-navigation.md（新）§1 | 前：正文无导航；后：完整事件名、可选 anchor 归一、单 target POST 与现行四级解析；title 不参与身份 | 消费已有公开供给，不扩身份语义 | AC-01, AC-02, AC-03 |
| SD-02 | add | docs/specs/wiki-link-navigation.md（新）§2 | 前：无正文导航异步门；后：不可变源票据＋选择世代＋每等待期门，真实提交才成功副作用，内存脏目标优先 | 防迟到抢页和读盘覆盖 | AC-04, AC-05, AC-06 |
| SD-03 | add | docs/specs/wiki-link-navigation.md（新）§3 | 后：正常 missing 才确认、取消零建页、错误独立可见、anchor 开页与定位分开、普通外链零路由 | 可靠反馈与能力边界 | AC-07, AC-08, AC-09 |
| SD-04 | modify | docs/specs/editor-host-capabilities.md §1.2/1.3/3 | 前：原生内部撤销不存在、Vue 链接必须等 B-1；后：native core 历史代码存在但真键证据不足／宿主桥仍缺，Vue 完整事件名可消费并记录本片导航；A-1/A-2/A-3/B-2/B-4/Shift 保留 | 修正证据推论，区分简称兼容与现有完整事件通道 | AC-01, AC-09, AC-10 |
| SD-05 | modify | docs/specs/editor-command-availability.md §2/3 | 前：原生撤销不存在、正文链接一概上游阻断；后：缩窄为宿主桥未供给、native 真键未补证、Vue 导航指向新规范；035 入口和三键归属保持 | 不因新导航恢复失效编辑命令 | AC-09, AC-10 |

## 6. 测试设计

新增 `tests/probe_wiki_link_navigation.mjs`（隔离工程／fixtures，merged 直调与 split HTTP 双后端）；新增 `e2e/wiki-link-navigation.spec.ts`（真实引擎 DOM 点击与可控响应延迟）；契约附件 `docs/plans/attachments/036-wiki-link-contract.md`（新）。不能以 handler 合成派发替代真实点击；反例可用路由拦截延迟，必须先证明正常臂可导航。

| 组 | 样本与可观察结果 | 验收 |
| --- | --- | --- |
| E 事件 | 中文／英文无锚点、带锚点的真实点击；生成精确监听，handler 一次，缺参不显示 undefined | AC-01 |
| R 解析 | 四级各一级、exact 全集优先于 walk 先出现的 casefold、同 alias 首现、中文、title-only missing、引号／反斜线值；与旧 link_index 同已知答案；双臂 API 一致 | AC-02, AC-03 |
| U 未保存 | 源保存后加入新链接、untitled 源、后台源草稿排水；导航后源 body/dirty/doc_id/erev 保持，新链接不用先保存；源磁盘页未变 | AC-04 |
| D 目标 | 目标已开且 dirty，导航不覆盖；未开目标正常建 tab；等待中其他入口打开目标不重复；读失败不记 recents | AC-05 |
| S 过期 | 延迟解析及延迟读盘分别测试：切档、A→B→A、同 path 关闭重开、改名／移动、源新输入、第二点击逆序响应；旧结果零激活／建页弹层／recents／提示回写 | AC-06 |
| M 缺页 | missing 确认取消、明确创建、确认期来源失效、目标被并发建出、非法建页名拒绝；未确认磁盘页集合／字节相同 | AC-07 |
| F 失败 | 解析离线／畸形 JSON／目录读失败／目标消失及读取失败；只出现错误、不出现建页；恢复后再点成功；旧错误不盖新成功 | AC-08 |
| B 边界 | anchor 非空（含创建后）、无 anchor；普通 Markdown 外链不发 resolver；save_note 与说明守卫保持；原生正文仍明确未供给 | AC-09, AC-10 |

实施验证命令（均仓根）：

```text
node tests/probe_wiki_link_navigation.mjs
node scripts/regen-vue.mjs
pnpm exec playwright test -c e2e/playwright.config.ts e2e/wiki-link-navigation.spec.ts
node tests/probe_editor_host.mjs --phase all
node tests/probe_command_availability.mjs
node tests/vm_matrix.mjs --arm merged
pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/command-availability.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/reload-safety.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/draft-recovery.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/lifecycle-safety.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/name-search.spec.ts
git diff --check
```

新增 probe 默认全臂 exit 0 且断言全部通过；新增 e2e 每组全通过。旧 editor-host navigation 案中“点击零导航”改为当前真实导航，保留旧缺供给模拟证据分域；旧 command / save / position 边界不删。Vue 受影响套件分进程单跑，既有组合时序限制保留精确记录，不降低断言。vm_matrix 若结构基线必须刷新，逐项解释新消息／状态／提示；零其他漂移。split 后端解析必须通过，原生 split 应用 boot 的在录 blocker 不算本片 UI 成功；本片不承诺该载体正文点击。

## 7. 验收标准

| ID | 可观察行为与验证方法／预期 |
| --- | --- |
| AC-01 | 新 e2e E 组真实点击中文／英文无锚及带锚，精确生成监听，目标和 anchor 正确、一次触发，无 undefined／浏览器错误；探针包含简称错误与完整名正常的对照 |
| AC-02 | 新 probe R 组 merged / split 各级已知答案一致，exact 优先、alias 首现保留；中文／转义逐值一致；dtitle-only 未命中，不拼路径 |
| AC-03 | 新 POST 可处理未保存来源不存在的 target；响应有效 found / missing 与错误明确区分；解析前后页面及草稿文件集合／字节恒等，旧 link_index 响应和解析语义不变 |
| AC-04 | 新 e2e U 组两类未保存源可导航，源内存 body/dirty/erev/doc_id 不被导航变更、源磁盘页字节不变；导航不额外 Save / Reload / 结算草稿，在途保护继续 |
| AC-05 | D 组正确激活现有 dirty 目标且原文不被磁盘覆盖；未开目标只建一个正常 tab、字段遵现行身份；只有成功完成才加入最近文件并更新上下文 |
| AC-06 | S 组解析和读盘两个等待窗覆盖全部过期情形，旧响应不能激活／新增 tab／弹缺页确认／改 recents 或提示；逆序双点击只最后有效请求提交 |
| AC-07 | M 组正常 missing 才提示确认，取消页面集合／字节不变；确认创建正确目标且复用现有校验，来源失效拒绝旧导航，已存在页不覆盖；非法名可见拒绝 |
| AC-08 | F 组离线、畸形、目录读失败、目标消失／读失败可见且不当作 missing，不错误记成功；用户再点可恢复，迟到旧错误不覆盖新成功 |
| AC-09 | B 组 anchor 保留且仅开页后提示不支持定位（含确认创建后），无 anchor 不显示定位成功；普通外链零 resolver 请求；不消费 save、不改命令桥、原生正文不冒称交付 |
| AC-10 | 上述旧套件与 merged vm 基线通过（合理结构差异逐项记证）；说明／保存／草稿／生命周期／名称边界不回退；SD-01..05 对应有拟议终版与证据，native undo 改为源码存在但真键未补证，归档历史不重写 |

## 8. 执行步骤

| 步骤 | 依赖 | 经核实的影响路径／符号 | 交付与验证 | 覆盖 |
| --- | --- | --- | --- | --- |
| T-01 有界协议原型与契约 | 无 | app.at 的 autodown_editor / OpenLink、editor_store.at Open/TabActivate；tests/probe_editor_host.mjs 配方；新增 tests/probe_wiki_link_navigation.mjs、attachments/036-wiki-link-contract.md | 固定 binary/dist 指纹；持久化完整事件名真实点击、缺参归一、活动选择世代、每 await 门和同步提交的最小原型；冻结协调 handler 与 Store 同步门实际形态。运行新 probe，延迟反例逐项可观测；每问题一次原型＋一次复测，仍不可达记 blocker，不降 AC | AC-01,03,05,06,09；SD-01,02 |
| T-02 单目标只读解析 | T-01 | src/back/wsys.at collect_ad_pages/page_aliases/resolve_target/json_esc_x；src/back/api.at；新增 resolve_wiki_link_json/resolve_wiki_link | 实现 POST 裸数组协议，共享现行四级 resolver；双臂已知答案、转义、失败区分与零写测试。运行新 probe 和原 probe --phase navigation，全部预期一致 | AC-02,03,08；SD-01 |
| T-03 正文导航与保护 | T-01,T-02 | src/front/app.at editor/OpenLink/recents/context；src/front/editor_store.at Open 同步段/TabActivate/Edit/关闭与活动选择入口 | 接完整事件名，落源票据／选择世代与全部等待期门、脏目标优先、真实完成回执和独立提示。新增 e2e E/U/D/S，生成后运行新 e2e；旧响应零提交，源保护与成功后 recents 证据齐全 | AC-01,04,05,06,08；SD-02 |
| T-04 缺页、锚点与失败终态 | T-03 | app.at CreateClick/CreateGo，editor_store.at CreateConfirmOpen；独立导航提示／引用创建上下文（新） | 正常 missing 才确认、取消无建页、明确创建及来源失效门，错误独立可见／再次点击重试，锚点如实提示。新 e2e M/F/B 全过，页面字节与提示前后对照 | AC-07,08,09；SD-03 |
| T-05 定向回归与规范交接 | T-02,T-03,T-04 | tests/probe_editor_host.mjs；e2e/editor-host-capabilities.spec.ts；tests/vm_matrix.mjs 及必要基线；docs/ARCHITECTURE.md、两现行 Spec、新 wiki-link-navigation.md | 按 §6 单跑相关回归，更新 live 能力案而保留历史模拟，给 SD-01..05 终版和复审证据；源/binary/dist 与 revision 绑定。git diff --check 零误差；原生限制、Shift/save/command/reveal 剩余缺口单列；不修改上游 | AC-01..10；SD-01..05 |

进度：0/5；以上命令与新增测试是后续实施交付门，本次没有实施。新 Spec 在交付阶段落位，不在规划阶段写入当前规则。

## 9. 复审记录

- stage: new
- plan_id: PLAN-036
- plan_revision: 1
- outcome: pass
- next: work
- changed_tasks: T-01..T-05（新建）
- changed_acceptance: AC-01..AC-10（新建）
- 交接检查：5 任务覆盖 10 验收、5 项规范增量；路径／符号与现行源码核实，关键协调机制由有界 T-01 固化。现有完整事件通道已真实验证，未发现必须先改上游才能开始 T-01 的前置 blocker。
- 语义：这是规划可执行性 handoff，**不是实施／独立复审 pass**；当前仍 drafting。授权仅本次规划检查，交付本计划后停止，不自动进入 work。
- 2026-10-02T15:40:00Z：stage: work | plan_id: PLAN-036 | plan_revision: 1 | outcome: executing（启动） | code_commit: 基线 512b36f（035 archived/delivered tip；直接 main 线性惯例单一主检出——001..035 在册，无 worktree/dev 分支面，本片沿用仓库既定惯例） | task_ids: 无（T-01 未开工） | evidence: 用户指令「计划 036: auto-plan-work 实施」授权执行；主检出预检=路线图 M+审计记录/计划文件规划面 untracked（本计划规划产物，落档批清零），代码路径（src/tests/e2e/scripts/gen）零 WIP；规划输入实勘=上游审计记录 §3/§4（完整事件名隔离点击通过）+app.at/editor_store.at/api.at/wsys.at/probe_editor_host.mjs/regen-vue.mjs/e2e 配方全读 | blockers: 无 | next: T-01（有界协议原型与契约）。

## 10. 待澄清事项

- 无必须用户先决定的产品问题：本片选择 Vue 导航首片；原生点击和定位保持未供给，保存／命令仍按负责仓解锁。未承诺两轨正文导航同时交付。
- T-01 owner＝本片执行者：冻结缺参归一化、单协调异步形态、活动选择世代、同步 Store 提交和刷新请求门；证据写契约附件。若现有 Auto 不能保持源票据／世代，必须报精确 blocker，重新规划供给，不静默去掉过期验收。
- 上游供给 owner 与重入门见复核记录 §2；本 Plan 不占用后续正式编号、不隐含修改上游授权。原生真键撤销补证另立能力验证，不靠 MCP keyspec 拒绝给否定结论。
