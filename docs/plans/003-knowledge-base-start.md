---
plan_id: PLAN-003
status: drafting
feature_name: knowledge-base-start
author: [zhaopuming]
created_at: 2026-09-22T19:53:53+08:00
updated_at: 2026-09-22T19:53:53+08:00
plan_revision: 1
current_step: 0
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-301"
  - "docs/ARCHITECTURE.md#SD-302"
  - "docs/README.md#SD-303"
  - "docs/README.md#SD-304"
touched_goals: []
---

# [PLAN-003] 知识库方向起步——Q1 产品定位落账 + 链接索引/反链首切片

## 0. 变更摘要

两件收口一件事起步：

1. **Q1 产品定位裁定落账**（用户 2026-09-22 口述，auto-edit 战略 §9-Q1 就此
   收口）：jade-edit 与 auto-edit **长期并存，是两套产品**——auto-edit 保持
   轻量级编辑器，jade-edit **向知识库方向发展**；组件尽量共用，未来实现组件
   插件化时共用升级为**插件级共用**；维持家族栈（stylekit dep / bps L1 零副本 /
   @autodown/engine 官方组件），**不做产品合并**。落 `docs/ARCHITECTURE.md`
   §1 定位节（本仓规范锚），README 派生同步。
2. **知识库线首个可交付切片** = 工作区 wikilink 索引（back `link_index`）
   + 反链/出链面板（front BacklinksPanel）——旧 jade-garden「对标核心环」
   的最小环，双轨同日落地（gate 双臂）。

家族同步残余（active_body 镜像 unlock=上游 rope delta/分块读；vue 轨
ts_adapter 未发射 673 端点族）**只记账不实做**（§1 非目标 + 指针）。

## 1. 目标

- **G1（Q1 落账）**：裁定四要素（并存两产品 / 知识库方向 / 组件共用→插件级
  共用 / 不合并）+ 家族栈约束 + 日期与授权源进 ARCHITECTURE §1；README
  「是什么/不是什么」同步。auto-edit 侧的 Q1 落账由其 M2 首计划携带，
  本仓只落 jade 视角，勿双边重复。
- **G2（知识库首切片）**：`[[wikilink]]` 索引 + 反链/出链面板可用——
  打开某档后能看到「谁链接到它 / 它链接到谁」，点击反链行可打开来源档；
  vm/vue 两轨同单验证（SD-204 判绿口径）。
- **非目标**（均明确排除）：
  - 产品合并 / 组件拆迁 / 插件化本体（插件级共用是未来实现组件插件化时的
    升级方向，本计划只落账不实做）；
  - 未链接提及（unlinked mentions）、图谱 tab、块锚导航（旧园链接族其余
    件——后续批；块锚 v1 只透传显示，D-12 编辑器无定位事件面）；
  - frontmatter `updated_at` 补写（D-14 功能池后续批）；
  - **上游 unlock 件实做**：active_body 镜像改造（unlock=上游 rope delta/
    分块读，ARCHITECTURE §3 在案——上游落地前禁调优）、vue 轨 ts_adapter
    673 端点族补件——**禁生成物补件**（2026-09-21 用户裁定，AC-05 负向证）；
  - auto-edit 形态照搬：去镜像实删（vue 通道承重，结构性不同）、L2/a2r
    （本仓 v0 非目标）明确不搬。

## 2. 架构方案

### 2.1 Q1 落点裁定（本立项时定，通知授权）

**落 ARCHITECTURE §1 定位节扩写，不新立战略档**：本仓无独立战略档且文档
面刻意精简（ARCHITECTURE=规范锚 / PROVENANCE=家族溯源 / README=派生面 /
parity-ledger=差异登记）；单条产品定位裁定不值得开新档位，§1 本就是
「jade-edit = …」的产品定位规范锚。战略面若后续批扩容（多裁定成簇）再议
立档，届时 §1 迁出。

### 2.2 首切片选型（接地调查定稿，勿照抄 auto-edit）

三候选对照（工作区链接索引 / 全文检索 / 笔记清单），取**链接索引**：

| 候选 | 证据 | 判 |
| --- | --- | --- |
| **链接索引+反链**（取） | 旧园 ARCHITECTURE §123「链接 = wikilink/块锚/反链三面板/linkgraph/图谱 tab——对标核心环已立住」＝家族先例的核心环；wiki-demo 语料既有实样（`[[Hello World]]`/`[[CAP 定理]]`/`[[CAP 定理#block-consistency]]`/`[[首页]]`）；原语齐备（fs.tree walk + read_body + 纯字符串扫描） | 知识库方向的标志性功能——「笔记间关系」正是知识库区别于文本编辑器的面 |
| 全文检索 | 旧园冻结池有（28 路由 search 面） | 通用编辑器亦有的功能，不承载方向性；且大语料下的检索规模问题（索引/分词）超出首切片 |
| 笔记清单（frontmatter 目录页） | read_wiki 已回 body、frontmatter back 侧保留 | 太薄——tree 已覆盖「有什么」，不产生新关系面 |

@autodown/engine 出口契约 1.0（parser 子出口：`parseDocument`/`BlockNode`/
`serialize` 族）**本切片不消费**——链接提取在 back 侧（AutoVM 执行，无法
import TS engine），纯字符串扫描已足（wsys.at split 标记法先例，read_body
根修同族）；front 侧块级解析需求出现时（如块锚导航）再评估 engine parser
消费路径。

### 2.3 数据面（back）

- 新契约 `link_index(path str, depth int) str`（GET，标量 JSON 字符串返回
  ——C-1/D-04 纪律同 tree 先例）。
- wsys 实现三步：①walk（fs.tree 同源遍历，收 .ad 文件集）②提取（逐文件
  read_body 后按 `[[` / `]]` 标记法切分提取；AutoVM 无正则面，split 标记法
  是 read_body 根修已证的唯一 O(n) 通道）③解析（target 标题 = 工作区 .ad
  文件名去尾 **stem 匹配**；`#` 后段为块锚透传；无匹配 → `exists:false`）。
- JSON schema（手工装配，`"`/`\` 转义；对齐旧园 links.rs Outlink 语义面）：

```json
{"pages":[{"path":"wiki/Hello World.ad","title":"Hello World",
  "links":[{"target":"首页","anchor":"","exists":true,
            "target_path":"wiki/index.ad"}]}]}
```

- 同名 stem 冲突 v1 取首现（walk 序）；登记 §10 默认裁定。

### 2.4 消费面（front）

- `editor_store.at` 增态：`links_json str`（原始 JSON）/`backlinks_open bool`
  （面板开关）+ 派生行集（**App 根 widget computed**——C-3 只禁 store
  computed，ft_rows 先例）。
- 新组件 `src/front/backlinks_panel.at`（ConsolePanel 同构：读 `.store` +
  直调 store；013 组件纪律）——右栏面板（旧园右栏三面板先例；console 底栏
  不受影响），出链/反链两段列表，行点击 → `store.Open({path:…})`（开档流
  复用，无新通道）。
- 接线：view 菜单 + actions 增「切换反链」项（view.console 先例，
  `checked_if` 绑 `backlinks_open`）。
- 刷新纪律 v1：Init + Save 成功后 + 面板开启时重取 `link_index`；**不做
  文件系统 watch**（后续批）。激活档无笔记时面板显示空态文本。

## 3. 技术栈

不变：AutoUI 单源双轨（vm 解释 + vue 生成）+ 自有 Auto src/back + 家族栈
（stylekit/bps/@autodown/engine）。**无新依赖**。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 2026-09-22 用户口述（auto-edit 侧转达立项通知，本仓立项档）：批准范围 =
  ①Q1 裁定落账进本仓规范层 ②知识库线首切片（候选面接地调查定）③家族同步
  残余只记账不实做；跑 `/auto-plan:new` 以本仓 ARCHITECTURE/README/
  parity-ledger 与代码接地后定稿，勿照抄 auto-edit 形态。
- 禁区（通知明文）：产品合并；生成物补件（2026-09-21 用户裁定）；上游
  unlock 件实做。无追加预算/自动续跑限制。
- Q1 战略原文对照：auto-edit `docs/strategy/002-north-star-v2.md` §9-Q1
  （两择：合并单产品双轨 vs 长期并存）+ §8 兄弟仓分工 jade 行「战略关系
  待裁定（§9-Q1）」——用户裁定 = **长期并存，且超越原两择框架**（jade 非
  原 Q1 设想的「web 轻量版」，改向知识库方向）；§8 该行随 auto-edit 侧
  M2 落账收口（本仓不代写）。

### 4.2 接地证据（本仓实读）

- `docs/ARCHITECTURE.md` §1（定位现文=「AutoDown 编辑器，双轨首例」——落账
  扩写点）；§3 C-1..C-6 双轨硬约束 + active_body 镜像段（unlock=上游 rope
  delta/分块读）；§5 旧 28 路由功能面「parser/linkgraph/agenda/multipart
  仍属 jade-garden 冻结功能池，后续批以 Auto 形态移植」——本切片即该口
  首件；§6 测试体系（gate 双臂）。
- `docs/parity-ledger.md` v5：D-03（播种已归一）/D-11（`.find` 闭包 split
  硬崩——store 内定位一律 while 索引）/D-12（编辑器无 oncursor/ctx_menu
  ——块锚只透传）/D-14（updated_at 功能池）/D-15（生成器残余——补件数
  不增的负向基准=三补件）。
- `src/back/api.at` + `wsys.at`：六契约现面（ws_root/tree/read_wiki/
  write_wiki/exists/env_str）；字符串操作习语（slice/split/length、
  resolve 拼根、is_delim 双形态界符）——标记法扫描的能力证据。
- `src/front/app.at`：ConsolePanel 先例（组件 + view 菜单 checked_if +
  store 开关态）、actions 三源绑定、ft_rows 根 computed 先例、留根视图
  边界（面板行=文本定位锚，同 tab 条纪律）。
- 语料：`D:/autostack/auto-down/tmp/wiki-demo/wiki`（5 档：index/Hello
  World/CAP 定理/Projects/Tasks；wikilink 六形态含 `[[Title#anchor]]`）。
- 旧园先例：`jade-garden/back/server/src/links.rs`（Outlink{target_title,
  target_path,exists,block_id} / Backlink{source_title,source_path,context}
  / GraphData 语义面）+ 其 ARCHITECTURE §123 链接族=对标核心环。
- engine：`auto-down/autodown/packages/engine/package.json`（出口契约
  1.0 冻结；parser 子出口 parseDocument/BlockNode/serialize 族）——
  §2.2 判定本切片不消费。
- auto-edit 近况（只读参考，通知转达）：M1 收官（PLAN-004..007）；可参考
  件 = budgets tier/validity/unlock 形态（本仓 PLAN-002 已收编同款）、
  矩阵断言面、装载协议；不宜照搬件 = 去镜像实删 / L2/a2r。

### 4.3 与既有计划的关系

- PLAN-001/002 已 delivered 归档（`docs/plans/archived/`）；本计划独立
  立项，无在飞计划冲突（docs/plans 根无活动草案）。
- PLAN-002 遗留非阻塞件（F-R1 基线低频漂移留观、D17 引擎修复待上游
  changeset 流）不在本计划范围，不重复处置。

## 5. 详细设计

### 5.1 Q1 落账文本要素（SD-301）

ARCHITECTURE §1 扩写：定位句改「jade-edit = 知识库方向的 AutoDown
（`.ad`）编辑器」+ 裁定块（日期 2026-09-22 / 授权源=用户口述·auto-edit
战略 §9-Q1 收口 / 四要素 / 家族栈约束 / 插件级共用为未来升级方向）+ 指针
（auto-edit 战略档 §8/§9-Q1——其 M2 首计划落 auto-edit 侧）。README
「是什么/不是什么」同步一段（SD-303）：知识库方向 + 两产品并存 + 冻结池
移植线（反链/图谱/检索后续批）注记升级。

### 5.2 link_index 契约（SD-302）

```
/// 工作区链接索引（JSON 字符串；walk depth 层内 .ad 全量：
/// stem 解析 + [[Target]]/[[Target#anchor]] 提取 + exists 判定）
/// GET /api/link_index?path=..&depth=..
#[api(method = "GET", path = "/api/link_index")]
pub fn link_index(path str, depth int) str { return wsys.links_json(path, depth) }
```

- 提取算法（标记法，read_body 同族）：body 按 `"[["` split → 每段首现
  `"]]"` 截断 → 候选串；无 `]]"` 尾 = 不完整链接忽略（跨行链接 v1 不做，
  语料无此形态）。
- stem 解析：walk 集 {path → stem}；`target == stem` 命中 → exists:true +
  target_path；`#` 前段参与匹配，后段进 anchor。自链接（target==本档
  stem）计入出链不计入反链。
- JSON 装配：`"`→`\"`、`\`→`\\` 转义 + 换行不出现在链接串内（提取时已切）
  ——C-1 纪律：全程 str，零 JsonAny。
- 反链派生在 front（出链表按 target 分组倒排——App computed 纯函数），
  back 不做双索引（v0 工作区规模 ≤ 数百档，倒排 O(n·m) 可接受；规模问题
  随检索批再议）。

### 5.3 BacklinksPanel（组件面）

- `src/front/backlinks_panel.at`：props 无（读 `.store` 同源）；两段列表
  （反链=链接到激活档的 {来源档, 锚?}；出链=激活档链接到 {目标, 存在?}）；
  行 = button 留根纪律（面板在组件内，行文本定位锚在组件子树外不可用——
  行渲染留 App 根视图，面板壳（标题/空态）进组件，同 tab 条/树行先例）。
  **执行期裁定点**：若快照锚在组件子树内可定位（ConsolePanel 文本先例），
  则整面板进组件——T-03 实勘后定，两形态均不违 013 纪律。
- store 增面：`links_json`/`backlinks_open` 态 + `BacklinksToggle`/
  `LinksRefresh`/`OpenFromLink(path)` handler（Open 复用）。
- actions：`view.backlinks`（icon: "link-2"，checked_if: backlinks_open）。

### 5.4 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | AC |
| --- | --- | --- | --- | --- | --- |
| SD-301 | modify | docs/ARCHITECTURE.md §1 | 定位=「AutoDown 编辑器，双轨首例」 → 增「知识库方向」定位句 + 2026-09-22 Q1 裁定块（四要素+家族栈+插件级共用展望+指针） | Q1 收口落本仓规范锚；通知授权 | AC-01 |
| SD-302 | add | docs/ARCHITECTURE.md §5 | （无链接域语义） → 增 link_index 契约语义段（wikilink 文法 v1/stem 解析/exists/标量 JSON 纪律/刷新触发集） | 首切片契约入规范；C-1/D-04 纪律延续 | AC-02 |
| SD-303 | modify | docs/README.md 是什么/不是什么 | 「AutoDown 桌面编辑器」 → 知识库方向 + 两产品并存 + 组件共用注记 | 派生面同步 SD-301 | AC-01 |
| SD-304 | modify | docs/README.md Tests/文档节 | 检查单九检查 → 十检查（+link）+ 面板入口/反链断言面注记 | 新检查单口径入 README（SD-204 先例） | AC-03/04 |

parity-ledger：本切片预期无新增双轨差异（全走既有同构通道）；执行期若
实勘差异按增记规则先登记再处置（§8 T-05）。

## 6. 测试设计

- **vm 矩阵新检查 `link`**：fixture 起 → 开 Hello World.ad → 断言
  link_index JSON 已知答案（wiki-demo 语料固定：出链/反链集合执行期首锁
  具体期望值入检查单）→ 面板开 → 反链行数与 store 态可证 → 点击反链行 →
  断言激活档切换（复用 open 断言面）。
- **e2e 同单**：同一检查单步骤（playwright；D-17 blur 冲刷纪律沿 PLAN-002
  e2e 适配——本检查不涉键入发射，天然免疫）。
- **判绿口径**：新检查 ≥5 连跑分布首锁（SD-204 N 定谳先例——vm 双臂 +
  e2e 各 ≥5）；F-R1 口径沿 README（无 RESULT 行重跑一次）。
- **gate 全量**：`node scripts/gate.mjs`（vm 双臂 10+10[新检查各 +1] +
  基线 v2 零漂移 + vue build + e2e 十检查）ALL GREEN。
- **负向（AC-05）**：`git diff` 证 `scripts/regen-vue.mjs` 补件面不变
  （三补件计数不变）；`grep` 证无 rope/delta/分块读/ts_adapter 实做。

## 7. 验收标准

- **AC-01（Q1 落账实读）**：ARCHITECTURE §1 含定位句（知识库方向）+
  裁定块四要素 + 日期 2026-09-22 + auto-edit 战略档指针；README
  「是什么/不是什么」同步；PROVENANCE 家族表述不冲突（实读）。验证：
  文档实读 + `grep -n "知识库\|长期并存\|插件级" docs/ARCHITECTURE.md
  docs/README.md`。
- **AC-02（link_index 契约正确）**：对 wiki-demo fixture，`link_index`
  返回 JSON 的出链集/exists 判定/stem 解析/块锚透传全数符合 §5.2 语义
  （期望值首锁后逐项断言）。验证：vm 矩阵 link 检查断言（merged+split
  双臂同过——HTTP 通道同证）。
- **AC-03（面板双轨可用）**：view 菜单「切换反链」开关面板；激活档
  反链/出链列表正确渲染；点击反链行打开来源档（tab 态/内容断言）；
  空态（无链接档）文本可证。验证：vm 矩阵 + e2e 同单全过。
- **AC-04（gate 全量绿）**：`node scripts/gate.mjs` exit 0（新检查入单
  后的全量矩阵：vm 双臂 + 基线 v2 零漂移 + vue build + e2e 十检查
  ALL GREEN）。验证：gate 实录进 §9。
- **AC-05（禁区负向证）**：`scripts/regen-vue.mjs` 补件面零变化（三补件
  不增）；src/ 无 rope delta/分块读/673 端点族代码。验证：`git diff --
  scripts/regen-vue.mjs` 空 + 负向 grep 空。
- **AC-06（判绿口径首锁）**：新检查 vm 双臂 + e2e 各 ≥5 连跑分布全绿，
  N 定谳入 README Tests 节（SD-204 先例行）。验证：连跑实录（分布表）
  进 §9。

## 8. 执行步骤

- **T-01 Q1 落账**（无依赖，doc-only）
  - 文件：`docs/ARCHITECTURE.md` §1、`docs/README.md`
  - 产出：SD-301/303 文本（§5.1 要素全）；验证：AC-01 命令。
- **T-02 back 链接索引**（依赖 T-01 无，可与 T-01 并行）
  - 文件：`src/back/api.at`（link_index 契约）、`src/back/wsys.at`
    （links_json：walk+标记法提取+stem 解析+JSON 装配）
  - 产出：契约+实现+约定 JSON schema；验证：AC-02（vm 矩阵 link 检查
    后端半——直接调 link_index 断言 JSON）。
- **T-03 front 反链面板**（依赖 T-02）
  - 文件：`src/front/backlinks_panel.at`（新）、`src/front/editor_store.at`
    （links_json/backlinks_open 态 + 三 handler）、`src/front/app.at`
    （actions view.backlinks + 右栏挂点 + 行渲染留根/computed 派生 +
    Init/Save 刷新接线）
  - 产出：SD-302 前端半 + 面板组件；验证：AC-03（vm 臂手工冒烟 → e2e）。
- **T-04 测试扩单与判绿首锁**（依赖 T-03）
  - 文件：`tests/vm_matrix.mjs`（link 检查 + 期望值首锁）、
    `e2e/matrix.spec.ts`（同单）、`docs/README.md` Tests 节（SD-304）
  - 产出：十检查检查单 + ≥5 连跑分布实录；验证：AC-03/06。
- **T-05 收口与 gate 全量**（依赖 T-04）
  - 文件：`docs/README.md`（运行矩阵/文档指针）、`docs/ARCHITECTURE.md`
    §5（SD-302 语义段定稿）、`docs/parity-ledger.md`（仅当执行期实勘
    新差异时增记）
  - 产出：gate ALL GREEN 实录 + AC-05 负向证 + §9 work 记录；验证：
    AC-04/05。

执行约定：每任务一 commit（PLAN-002 惯例）；status drafting → executing
（T-01 开工时）→ execution_done（T-05）→ review → merge。

## 9. 复审记录

- 2026-09-22 stage: new, plan_revision: 1 —— 立项起草（/auto-plan:new），
  接地证据链 §4.2；outcome: pass（授权范围内可开工）；next: work。

## 10. 待澄清事项

均**默认裁定不阻塞**（执行期可依实勘调整，涉语义变更才升 revision）：

1. **面板落位右栏**（默认）：旧园右栏三面板先例 + console 已占底栏；
   若用户要独立 tab/底栏形态，复审时改 §2.4。
2. **同名 stem 冲突取首现**（默认）：语料无同名档；出现歧义语义（报歧义
   vs 取首现）留检索/图谱批再议。
3. **刷新触发集 v1 = Init/Save/面板开启**（默认）：外部编辑器改动文件
   不感知（无 watch）——live 索引属后续批。
4. **跨行 `[[...]]` 链接不支持**（默认）：语料无此形态，v1 忽略不完整
   标记对。
5. 未链接提及/图谱 tab/块锚导航排期：后续批立项时定（本计划非目标）。
