---
plan_id: PLAN-004
status: executing
feature_name: wiki-search-slice
author: [zhaopuming]
created_at: 2026-09-22T21:40:26+08:00
updated_at: 2026-09-22T21:49:28+08:00
plan_revision: 2
current_step: 1
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-401"
  - "docs/ARCHITECTURE.md#SD-402"
  - "docs/ARCHITECTURE.md#SD-405"
  - "docs/README.md#SD-403"
  - "docs/README.md#SD-404"
touched_goals: []
---

# [PLAN-004] 知识库第二切片——查找面板（快速打开 + 全文检索）+ 北标落账

> revision 2（2026-09-22）：用户北标口述（短期对标 Typora / 长期对标
> Obsidian、Notion、飞书）后扩容——原检索单件扩为**快开+检索双件**
> （共用查找面板机制），并新增北标裁定落账（SD-405）。检索键位
> Ctrl+P → **Ctrl+Shift+F**（IDE/Obsidian 惯例），Ctrl+P 让位快开。

## 0. 变更摘要

三件事一片：

1. **北标落账（SD-405）**：用户 2026-09-22 口述——**短期对标 Typora**
   （编辑体验），**长期对标 Obsidian、Notion、飞书**（本地知识库 →
   块级协作工作台）。落 ARCHITECTURE §1 定位节（SD-301 的细化而非
   替代），README 派生同步。
2. **快速打开（短期 Typora 线最小件）**：Ctrl+P 查找面板·文件模式——
   输入即过滤（前端 casefold contains，数据源 = Init 已取 tree 契约，
   **零 back 增量**），行点击 `OpenLink` 开档、拾取即关。
3. **全文检索（长期 Obsidian 线件）**：back `search_wiki`（POST 标量
   契约）+ 查找面板·全文模式（Ctrl+Shift+F）——命中行（path +
   snippet）→ 点击经 `OpenLink` 打开。旧 jade-garden `/api/search`
   （冻结池）为移植参照；块级检索/倒排索引不迁（v1 = 线性扫描）。

两件**共用一个查找面板**（双模式：文件/全文）——input 控件、行集、
导航口、面板纪律同一套（PLAN-003 BacklinksPanel 族第二实例）。

上游缺口适配内置进设计，不新增补件：D-19（GET query UTF-8 不解码）⇒
检索走 **POST**（write_wiki 同款，body CJK 已证）；D-20④⑤（to_value
形状/恒等）⇒ 顶层裸数组 + 双取形，沿 PLAN-003 已证形态；D-20③（CJK
`.length` 字节语义）⇒ snippet 禁截断、整行交付。

## 1. 目标

- **G0（北标落账）**：北标层级（短期 Typora / 长期 Obsidian → Notion →
  飞书）+ 授权源（2026-09-22 口述）+ 与 SD-301 的细化关系 + 「Typora
  核心差距大头在上游（供料包承载），本仓落地件 = 快开/大纲等周边」
  口径，进 ARCHITECTURE §1；README「是什么」同步。Notion/飞书
  （块级/协作）**只记账不动手**。
- **G1（快开可用·双轨）**：Ctrl+P 开查找面板（文件模式）→ 输入即过滤
  → 行点击开档（拾取即关）。vm/vue 两轨同单验证（SD-204 口径）。
- **G2（检索可用·双轨）**：Ctrl+Shift+F 切全文模式 → 输入查询 → 触发
  （按钮为契约底线；Enter 若 vue 发射在册则叠加）→ 命中行 → 点击开档
  （面板保持开——检索结果浏览语义）。
- **G3（back 契约语料首锁）**：`search_wiki` 已知答案六案（命中 /
  未命中 / CJK 查询 / limit 钳制 / title-only 命中 / snippet=首命中行）
  在语料（tmp/wiki-demo 5 页）上首锁，merged 直调与 split HTTP 双臂一致。
- **G4（测试面）**：vm 矩阵 + e2e 同单扩 find 组（快开+检索子步）；
  结构基线 v4 计划内重锁（store find_open/find_mode + App find 面字段
  入 dump）。
- **非目标**（明确排除）：
  - 大纲面板（Typora 线第二件候选——点击定位受 D-12 编辑器定位事件面
    限制需探针；PLAN-005 候选，与悬空建页并列）；
  - 块级检索 / 倒排索引 / 相关性排序（旧园 search.rs Block 面 + index
    状态——v0 规模线性扫描够用；规模上量另立批）；
  - 图谱 tab（vm 轨无图/canvas 组件族，双轨同日纪律下不适——主线顺位
    后移，SD-404 只记不实做）；
  - Notion/飞书面任何实做（块标识/协作后端——远期记账）；
  - unlinked mentions、frontmatter/tags 检索面（v1 检索面 = stem + body；
    frontmatter 不入检索——与链接域 stem 语义一致，tags 检索后续批）；
  - fuzzy（子序列匹配）/拼音/高亮/文件系统 watch（检索按需 fetch；
    快开 v1 = casefold 子串，fuzzy 后续批）；
  - Esc 全局关闭、面板焦点管理（v1 = 快开拾取即关 + 再按快捷键关闭；
    Esc 键位面后续批）；
  - 上游件实做与生成物补件（D-19 GET 修复、input 控件缺口类——只记账
    不补生成树，AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（revision 2：北标口径下的双件构成）

- **北标对表**：短期 Typora 线的核心差距（所见即所得、大文档键入、
  秒开、行:列、右键）大头在 engine/auto-lang 侧——即上游供料包已
  承载的 D-16 预热、D-17 键入、rope delta/分块读、D-12 事件面；本仓
  可落地的 Typora 向件 = **快开**（本次）与大纲（后续，带 D-12 探针）。
  长期 Obsidian 线 = SD-301 主线照走，**检索**即其支件。双件合片 =
  两线各有交付，且共享机制（快开增量成本 ≈ 半个任务）。
- **冻结池先例**：检索 = jade-garden `back/server/src/search.rs` +
  main.rs:100-102 三路由（v1 取 Page 面线性化）；快开在旧园无直接
  对应（其文件切换走 filetree），形态对标 Typora/VS Code Ctrl+P。
- **输入通道** = bps `form/login` 在册 `input` 控件（deps/bps/form/
  login/reference/minimal.at：`value`/`oninput`/`placeholder` 语法
  先例）——bps L1 零拷贝；vm 轨渲染在册（auto-lang validate.rs:556
  核心控件表 + aura_view_builder.rs:9721 `convert_input`，
  onchange/oninput 9752-9756 + **onenter/enter** 9758-9760 事件面），
  vue 轨生成件在案（gen ui/input/Input.vue）。无新组件依赖。

### 2.2 数据面（back，仅检索件）

```rust
/// 工作区全文检索（JSON 字符串；stem+body 线性扫描，命中=[{path,title,snippet}]）
/// POST /api/search_wiki
#[api(method = "POST", path = "/api/search_wiki")]
pub fn search_wiki(query str, limit int) str {
    return wsys.search_json(query, limit)
}
```

- **POST 而非 GET**：D-19（AutoVM HTTP 对 GET query 的 UTF-8 百分号
  序列不解码——CJK 查询词在 split/vue 臂全败，ledger v6 在案）；POST
  body CJK 已证（split 臂 save 检查以磁盘原文（含 CJK body）构造全文经
  write_wiki POST 落盘回读，11/11 绿）。D-21（POST 负载窗丢参 flake）
  = README 无-RESULT 重跑口径覆盖，search 段若复现则 ledger 扩记。
- **返回形状 = 顶层裸数组** `[{path,title,snippet}]`（D-20④：front
  `json.to_value` 只对顶层 array 产物健康——link_index 同款裁定）。
  path = 工作区根相对路径（`/` 分隔，`store.Open` 直吃）；title = 文件
  stem（链接域同语义：frontmatter title 不参与）；snippet = body 中
  **首条命中行 trim 后整行**（title-only 命中 = ""）。
- **匹配语义 v1**：`query.trim()` 空 → `[]` 守卫；命中 = stem 含 q 或
  body（`read_body`，frontmatter 剥离面）含 q；大小写 = 两侧
  `to_lower()`（VM 在册实证：auto-lang musk_vm_track_tests.rs:223
  `"AbC".to_lower()=="abc"`；**vue ts_adapter 发射未证——T-01 探针 A**，
  不通则 v1 大小写敏感 + §10 记账，契约文本不变）；命中序 = walk 序
  （dirs-first + 名称 casefold，确定性）；limit 钳 1..50，front 传常量
  20（旧园 default_limit 同值）；walk depth = 4 内部常量（Init tree
  首屏同值——快开/检索/链接三面覆盖一致性，参数化后续批 §10）。
- **快开零 back 增量**：文件模式数据源 = Init 已取 `tree(root, 4)` 的
  `ft_nodes`（App 模型在态），前端过滤，无新契约。
- **实现复用**：.ad 页收集循环自 `links_json` 提取为 `collect_ad_pages()`
  共享（覆盖=文件树不变式字面共享——忽略面/depth 钳制/walk 序单点维护）；
  JSON 装配 = `json_esc` + 逐项 `+` 重接（links_json 同款；v0 规模 O(P²)
  前缀复制接受，规模上量换 StringBuilder native 160 族，§10）。

### 2.3 消费面（front：查找面板双模式）

- **store**（editor_store.at）：`find_open` bool + `find_mode` str
  （"files" / "text"）+ `FindOpen(mode)` / `FindToggle()`——面板开态
  与模式居 store（backlinks_open 同构分野；find_mode 入态 = 双模式
  快捷键分流的结果态，基线 v4 覆盖）。
- **App 模型**（app.at）：`find_q` / `find_rows` List / `find_ran` bool
  ——数据态居 App 不入 store（D-20④ vmref 损坏；链接态同款裁定）；
  检索解析内联 handler 体内直调 + **双取形**（D-20⑤）。
- **右栏查找区**（find_open 时，反链面板上方；与反链面板独立可叠放）：
  壳 = 新组件 `FindPanel`（ConsolePanel/BacklinksPanel 同款 013 纪律）；
  **行集/空态留根视图**（MCP 快照锚不进组件子树）。区内容：模式标签行
  （「文件」/「全文」）+ `input`（value: .find_q / oninput:
  .FindEdit / placeholder 随模式）+ 检索按钮（text 模式）+ 行集
  （`button` 文本 = path → `.OpenLink(r.path)`）+ 空态。
- **模式行为**：
  - **files（Ctrl+P）**：oninput 即时过滤（无 fetch）——`collect_ad_paths
    (ft_nodes)` 全量 .ad 路径（栈式 while 展开，禁递归）+ 双侧 to_lower
    contains（探针 A 同裁）；行点击 = OpenLink + **拾取即关**
    （find_open=false，快开契约）；空态「（无匹配文件）」。
  - **text（Ctrl+Shift+F）**：oninput 只更新 find_q；触发（按钮底线 /
    onenter 探针 C）→ fetch `search_wiki(.find_q, 20)`（try/catch 落
    console_log——链接触点同款）+ 双取形解析 + 行装配；行点击 =
    OpenLink，**面板保持开**（检索浏览语义）；未运行空态「（输入查询
    词后检索）」，运行后空态「（无结果）」（find_ran 区分）。
- **刷新触发集：无**——检索按需 fetch；快开过滤纯内存。不与
  Init/Save/面板开启联动（与链接面板触发集的结构性差异，SD-401 记）。

### 2.4 actions（三源绑定）

```
action (id: "view.find-files", handler: .ActFindFiles, title: "快速打开", icon: "file-search",
        shortcut: "Ctrl+P")
action (id: "view.find-text",  handler: .ActFindText,  title: "全文检索", icon: "search",
        shortcut: "Ctrl+Shift+F", checked_if: ".store.find_open && .store.find_mode == 'text'")
```

menubar 视图项同步（view.backlinks 紧邻先例）；ActFindFiles =
FindOpen("files")（已开则切模式聚焦语义 v1 = 幂等重开）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨（vm 解释渲染 / vue 生成）+ 自有 Auto
src/back + gate 双臂（README 运行矩阵）。无新依赖；bps `input` 控件为
form 族在册件（deps 已物化）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-22 会话口述（立项授权）：「计划003已经完成；下一步的
  计划是什么？请 [$auto-plan-new] 立项」——沿 SD-301 知识库主线确定
  下一切片并起草执行契约。
- 用户 2026-09-22 会话口述（北标）：「我们短期的目标是对标Typora；
  长期目标是对标Obsidian；Notion；以及飞书。」——**北标授权源**（SD-405
  落账文本要素）；随后就切片方向四择答复 **「扩容双件」**（快开+检索+
  北标落账，AskUserQuestion 实录）——即本 revision 2 的范围授权。
- 仓库/动作范围：仅 jade-edit 主检出（docs / src / tests / e2e /
  scripts / tools 文档与测试面）；冻结池（auto-down/jade-garden）与
  家族仓**零接触**（AC-05 负向证）。
- 无预算/自动续跑/工具链版本指定（沿 README 前置：工具链 ≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-22）

- **冻结池检索件**：jade-garden `back/server/src/search.rs`——
  `SearchQuery{q, limit(default 20)}`、`SearchResultDto::Page{path,
  title, snippet:Option}` / `Block{uuid,page_path,block_id,content,
  snippet}`、`search_impl(state,q,limit,scope)` 经 `state.with_index`
  （索引态）；main.rs:100-102 路由 `/api/search`(+`/pages`+`/blocks`)。
  v1 取 Page 面线性化，Block/索引态不迁。快开在旧园无对应件（Typora/
  VS Code 形态对标，非移植）。
- **input 控件双轨在册**：bps form/login minimal.at（value/oninput/
  placeholder/id 语法）；auto-lang `crates/auto-lang/src/ui/
  aura_view_builder.rs:9721` `convert_input`（props: placeholder/
  value/password|type；事件解析 9752-9760：onchange|change|oninput|input
  → on_change，**onenter|enter → on_submit**）；validate.rs:556 核心
  控件白名单含 "input"；render_support.rs:127 TagSupport::partial。
  jade gen 树 `gen/front/vue/src/components/ui/input/Input.vue` 在案。
- **to_lower VM 实证**：musk_vm_track_tests.rs:223-224（to_lower/
  to_upper round-trip 用例）。vue ts_adapter 发射未证 → T-01 探针项
  （同裁快开过滤与检索匹配两侧）。
- **POST CJK 通道已证**：split 臂 save 检查（C-5 整文构造含 CJK body →
  write_wiki POST → 回读字节验）11/11 绿（README Tests N 定谳）。
- **wsys 先例**：`links_json`（fs.tree walk + `split("{\"id":")` 节点
  标记法 + json_esc 手工装配 + 顶层裸数组）；`read_body`（frontmatter
  剥离）；`extract_links_json`（D-20② 列表元素先拷局部纪律）。
- **front 先例**：app.at 链接态（App 模型持态 + handler 内解析 + 双取
  形 + 行派生纯函数 + OpenLink 共用导航口）；backlinks_panel.at 壳
  组件形态；editor_store.at BacklinksToggle 形态；flatten_tree/toggle_id
  （bps tree_util 纯函数消费先例——collect_ad_paths 同族新写）。
- **语料**：`D:\autostack\auto-down\tmp\wiki-demo\wiki` 5 页——
  `CAP 定理.ad`/`Hello World.ad`/`Projects.ad`/`Tasks.ad`/`index.ad`，
  全带 frontmatter；`index.ad` frontmatter title=首页（≠stem=index）=
  **stem 语义已知答案素材**；tags 值（如 distributed-systems）居
  frontmatter = **未命中面已知答案素材**（v1 检索面不含 frontmatter）。
  快开过滤已知答案：CJK 文件名（CAP 定理）+ ASCII（index）+ 部分词
  （Pro→Projects）。具体命中行期望值 T-01 首锁时按实文定。
- **约束表**：parity-ledger v6（D-11 `.find` split 崩 → while 扫描；
  D-13/D-15 残余补件不扩；C-1..C-6 双轨硬约束）。

### 4.3 与既有计划的关系

- **直接复用 PLAN-003 交付面**：`OpenLink` 导航口、BacklinksPanel 壳
  纪律、App 态/双取形/裸数组契约、面板 toggle 形态——查找面板是同族
  第二实例，无新形态发明。
- 不触碰上游供料包件（docs/upstream/2026-09-jade-supply.md 全为上游
  侧）；D-16/D-17/D-19/D-21 留观不变（本计划对 D-19/D-21 只有适配与
  观测，无修复）。北标落账所引「Typora 差距大头在上游」的差距清单
  = 供料包 §1/§2/§3 + D-12——只引用不扩。
- PLAN-002/003 测试资产（vm_matrix 检查单 + 基线 + e2e 同单）直接扩，
  不重造。

## 5. 详细设计

### 5.1 `search_wiki` 契约与 wsys.search_json（SD-401 back 半）

契约见 §2.2 代码块。wsys 实现要点（伪码级，T-01 落地）：

```
pub fn search_json(query str, limit int) str {
    var q str = query.trim()
    if q == "" { return "[]" }
    var n int = limit  // 钳 1..50
    // ①共享重构：links_json 的 .ad 收集循环提取为
    //   collect_ad_pages(path, depth) -> (stems, rels)（links_json
    //   改调用同源——覆盖=文件树不变式单点；检索侧调用
    //   collect_ad_pages("", 4)——depth 内部常量）
    // ②扫描：walk 序逐页——stem 命中 or body 命中
    //   （ql = q.to_lower()；stem_l/body_l = 侧 to_lower——
    //    T-01 vue 发射探针不过则双侧原样比较）
    //   ⚠ D-20②：列表元素先拷局部变量再调方法
    // ③snippet：body.split("\n") 首条 contains 命中行 trim 整行
    //   （⚠ D-20③：禁 .length 截断——CJK 字节语义）
    // ④装配：json_esc + 逐项 + 重接（links_json 同款），至 limit 止
}
```

### 5.2 FindPanel + App 接线（SD-401 front 半）

- `src/front/find_panel.at`：壳组件（BacklinksPanel 同构——标题行
  「FIND」+ 装饰面），行集留根。
- app.at 增量：msg `FindEdit(str)`/`FindRun`/`ActFindFiles`/
  `ActFindText`；模型 `find_q`/`find_rows`/`find_ran`；右栏查找区
  （§2.3 布局与双模式行为）；actions `view.find-files`/
  `view.find-text`；纯函数：
  - `collect_ad_paths(nodes) -> List`：栈式 while 展开 ft_nodes 全量
    .ad 路径（禁递归；flatten_tree 同族消费先例）；
  - `file_rows_of(paths List, q str) -> List`：双侧 to_lower contains
    过滤（探针 A 同裁），行对象 `{path}`。
  handler：
  - `.FindEdit(q)` → `.find_q = q`；files 模式即时重过滤（find_rows =
    file_rows_of(collect_ad_paths(.ft_nodes), q)；纯内存，无 fetch）；
    text 模式只更 find_q；
  - `.FindRun`（text 模式触发）→ fetch `search_wiki(.find_q, 20)`
    （try/catch 落 console_log）+ **双取形**解析 + 行装配 + find_ran=true；
  - `.ActFindFiles` → `store.FindOpen("files")`（幂等重开；find_ran
    保持）；`.ActFindText` → `store.FindOpen("text")`。
  - 行点击 `.OpenLink(r.path)` 共用口；files 模式点击后 `.find_open =
    false`（拾取即关）——store 关口（FindClose()）或直接态写（T-03
    落定，倾向 store 关口保开态权威单点）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-401 | add | docs/ARCHITECTURE.md §5 | before：无检索/查找域段。after：增「检索与快速打开域语义」定稿段——search_wiki POST 通道（D-19 依据）/ stem+body 检索面（frontmatter 不入）/ 顶层裸数组 `[{path,title,snippet}]` / 匹配语义（trim 空守卫、大小写 T-01 裁定落定文、walk 序、limit 钳 1..50、depth=4 常量）/ snippet=首命中行整行禁截断（D-20③）/ 快开面（纯 front 件：tree 契约复用、collect_ad_paths+casefold contains 过滤、拾取即关、Ctrl+P/Ctrl+Shift+F 键位）/ 刷新触发集=无（按需，与链接面板差异）/ collect_ad_pages 共享（覆盖=文件树单点） | 查找切片规范锚；上游缺口适配（D-19/D-20）以规则而非注释沉淀 | AC-01/02/06 |
| SD-402 | modify | docs/ARCHITECTURE.md §6 | before：vm 双臂十一组检查 + 基线 v3。after：**十二组检查**（+find 组：快开/检索子步）+ **基线 v4**（store find_open/find_mode + App find_q/find_rows/find_ran 入 dump 的计划内重锁；v3 留档） | 测试体系表随扩单更新（PLAN-002/003 同步先例） | AC-03/04 |
| SD-403 | modify | docs/README.md Tests 节 | before：12+11+十段口径、基线 v3 指针。after：**13/13+12/12+十一段**口径（+find 组：快开开关/过滤/拾取开档 + 检索输入/触发/命中/空态/导航；CJK 查询**双臂**——POST 通道无 D-19 面）+ 基线 v4 指针 + N 定谳补记 | 判绿口径单一权威面（SD-204/304 续） | AC-03/04 |
| SD-404 | modify | docs/README.md「是什么/文档」节 | before：首切片=链接索引+反链/出链。after：**北标条目（短期 Typora / 长期 Obsidian、Notion、飞书——SD-405 派生）**+ 第二切片=查找面板（快开+检索）条目 + 图谱顺位后移注记 + parity-ledger v7 指针 | 产品主线进度面派生同步（SD-303 续） | AC-06 |
| SD-405 | add | docs/ARCHITECTURE.md §1 | before：SD-301 裁定块（并存两产品/知识库方向）。after：增**北标裁定块**——短期对标 Typora / 长期对标 Obsidian、Notion、飞书；授权源 = 用户 2026-09-22 口述；与 SD-301 关系 = 细化而非替代（知识库方向 = Obsidian 段的具体化）；Typora 核心差距大头在上游（供料包承载：D-16/D-17/rope delta/D-12），本仓落地件口径（快开/大纲周边）；Notion/飞书（块级/协作）远期只记账不动手 | 北标是切片优先级裁决口径，须进 canonical（SD-301 同级先例） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：merged 直调 + serve-back HTTP POST
  known-answer 六案——①命中（语料正文词）②未命中（frontmatter-only
  词，如 tags 值）③CJK 查询（POST 通道，**双臂**——split 若败则 D-19
  扩记 POST 面）④limit 钳制（limit=1 截断 + limit=99 钳 50）⑤
  title-only（stem 命中 body 未命中 → snippet=""）⑥snippet=首命中行
  整行（跨多行命中只取首行）。期望值语料实文首锁。
- **vm 矩阵 find 组（T-04）**：
  - 快开子步：①Ctrl+P 开面板（files 模式态）②输入过滤（CJK 文件名 +
    部分词两案——type_text → input 控件通道，**MCP 打字探针 D**，
    fallback 见 §10）③行点击 → OpenLink 开档 + 拾取即关（find_open
    态断言）；
  - 检索子步：④Ctrl+Shift+F 切模式 ⑤输入+触发后命中行快照（行数 +
    path 集合）⑥空结果态两形态（未运行提示/运行后无结果）⑦行点击 →
    OpenLink（面板保持开）⑧CJK 查询往返（双臂）。
  断言域 = state/snapshot 结构（非像素）。
- **e2e 十一段（T-04）**：playwright 真 DOM input 打字（无通道风险），
  同检查单十段 + find 段（快开+检索子步同上）。
- **基线 v4（T-04）**：store 增 find_open/find_mode + App 增 find 面
  字段 → merged 臂 state dump 计划内重锁；重锁后连跑 ≥3 次零漂移；
  v3 留档（v0..v2 同惯例）。
- **负向（T-05）**：regen-vue 面无补件增量（D-13/D-15 残余集不变）；
  冻结池/家族仓 git status 零接触。

## 7. 验收标准

- **AC-01（back 契约）**：`search_wiki` POST 契约落 api.at + wsys
  实现；§6 六案 known-answer 双臂（merged 直调 + split HTTP）全绿；
  返回顶层裸数组形状逐字节符合 SD-401 定文。验证：T-01 探针脚本/矩阵
  段输出。
- **AC-02（查找面板双轨·双模式）**：快开（Ctrl+P/过滤/拾取开档即关）
  与检索（Ctrl+Shift+F/输入/触发/命中/空态两形/导航面板保持开）双轨
  全绿，vm snapshot+state 断言与 vue e2e 同断言域。验证：T-02..T-04
  矩阵+e2e find 组。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿——
  vm merged **13/13** + split **12/12**（+find 组+基线检查）→ vue
  build PASS → e2e **十一段** passed；判绿实录进 §9（无-RESULT 早崩
  按 README 口径重跑即绿，次数如实记）。
- **AC-04（基线 v4）**：计划内重锁完成、v3 留档、重锁后连跑 ≥3 次
  零漂移；dump 含 find_open/find_mode/find_q/find_rows/find_ran。
- **AC-05（负向证）**：冻结池（auto-down/jade-garden）与家族仓零接触
  （git status 证据）；`gen/` 无手改（regen 产物全量再生等价）；旧园
  代码零引用（import/use/copy 检视）；补件面零增量（D-13/D-15 残余集
  不变）。
- **AC-06（文档面）**：SD-401..405 落位且**canonical 文中锚注**齐
  （SD-301..304 先例——F-R1 教训）；**SD-405 北标裁定块四要素**
  （层级/授权源/与 SD-301 关系/上游承载口径）全数在案；
  parity-ledger **v7**（新实勘入册：to_lower vue 发射、onenter vue
  发射、input MCP 打字面三项探针结论，无论过否）。

## 8. 执行步骤

> 每任务收口 = 代码 + 验证命令实录进本节证据块；探针裁定进 §10 对应
> 条目（闭合后标「已裁定」）。

- **T-01 back 契约 + 实现 + 语料首锁**（AC-01）[✅ 已完成]
  - api.at 增 `search_wiki` POST 契约；wsys.at `collect_ad_pages()`
    共享重构（links_json 改调用，行为零变化——矩阵 link 组回归证）+
    `search_json()` 实现。
  - 探针 A（to_lower vue 发射）：最小 .at 用例双侧 to_lower →
    `pnpm build` 后 gen 树源检（发射 .toLowerCase() 与否）→ **裁定
    大小写语义**（检索匹配 + 快开过滤两侧同裁；写入 SD-401 定文后
    拆除探针或转 fixture）。
  - 探针 B（POST CJK）：serve-back 直发 search_wiki POST CJK 查询
    （预期 200 命中——split save 先例外推；败则 D-19 扩记 + §10 升级）。
  - 语料六案期望值首锁（tmp/wiki-demo 实文）。
  - 验证：`node tests/vm_matrix.mjs`（link/save 组回归零变化）+
    探针实录。
  - **证据（2026-09-22）**：①实现 = api.at `search_wiki(query,limit)`
    POST /api/search_wiki（write_wiki 同款双参 POST 形态）+ wsys.at
    `collect_ad_pages(path,depth)->List[{stem,rel}]` 提取（links_json
    改调用，收集循环逐语句等价迁移）+ `search_json`（trim 空守卫/limit
    钳 1..50/双侧 to_lower/hits<n 门控停扫[无 break 先例——条件门控]/snippet
    首命中行 replace \r + trim 整行[禁 .length 截断，D-20③]）。②**探针 A
    源级定谳：通**——ts_adapter.rs:1610 `"to_lower"|"lower" =>
    "toLowerCase"`（Plan 053 M1 字符串方法映射表；`contains→includes`
    同表 1572 区；`trim` 走 passthrough = JS 原生同名同义）→ 大小写 =
    双侧 to_lower，SD-401 按通态定文；gen 树源检复核延至 T-02 build
    （真实消费代码即 fixture，vue-tsc 对未知方法名会编译失败 = 天然
    断言）。③**探针 B 定谳：通**——serve-back 8251 POST 六案 200：
    「张三」→ Projects.ad snippet「- 负责人：张三 ^4404d43e…」整行/
    「原型设计」→ Tasks.ad「- [ ] 原型设计」/「distributed-systems」
    (frontmatter tags 值) → `[]`/「任务」limit=1 → 仅 Hello World.ad
    (walk 序首命中)「## 任务列表 ^heading-1」/「index」→ title-only
    snippet=""/「CAP 定理」limit=50 → 四页 walk 序（CAP 定理/Hello
    World/index/Tasks）snippet 首行整行——**六案期望值首锁**与 §6 预案
    逐案一致；limit=99→50 钳分支语料不可观测（总命中 ≤4）记账 §10。
    ④回归 = `node tests/vm_matrix.mjs` 双臂全绿：merged 12/12 + split
    11/11，**基线 v3 零漂移**（state dump 含 links_json 全文逐字节
    等价 = 重构零行为变化的强证）。
- **T-02 front 查找面板 + 输入通道**（AC-02 前半）
  - find_panel.at 壳组件 + editor_store find_open/find_mode/
    FindOpen/FindToggle + app.at 模型/msg/右栏查找区（input + 模式
    标签 + 行集 + 空态）+ `collect_ad_paths`/`file_rows_of` 纯函数 +
    files 模式即时过滤。
  - 探针 C（onenter vue 发射）：input onenter 用例 → `pnpm build` →
    gen 源检 → **裁定触发面**（onenter 入契约或仅按钮）；`pnpm build`
    PASS + merged 臂冒烟（面板开关/files 过滤行快照）。
  - 验证：`auto run -r vm` 手动冒烟实录 + `pnpm build`。
- **T-03 接线收口 + 导航**（AC-02 后半）
  - actions view.find-files/view.find-text（Ctrl+P / Ctrl+Shift+F）+
    menubar 视图项 + FindRun 双取形 fetch + OpenLink 行导航 + files
    拾取即关（FindClose 关口落定）+ text 未运行/无结果空态两形。
  - 验证：merged 臂检查单雏形（T-04 固化前手工跑通）+ e2e 单段冒烟。
- **T-04 测试扩单 + 基线 v4 + 判绿首锁**（AC-02/03/04）
  - vm_matrix.mjs 增 find 组（快开三步+检索五步；探针 D：type_text→
    input MCP 通道，fallback 见 §10）；e2e matrix.spec.ts 增 find 段；
    基线 v4 重锁。
  - 验证：`node tests/vm_matrix.mjs` 双臂全绿 + `pnpm test:e2e`
    连跑 ≥5 + `node scripts/gate.mjs` ALL GREEN（判绿实录：双臂连跑
    分布 + e2e 连跑，N 定谳口径）。
- **T-05 文档 + ledger v7 + 北标落账 + 收口**（AC-05/06）
  - SD-401..405 canonical 落位（文中锚注齐；§1 北标裁定块 + §5 查找
    域段 + §6 表 + README 三处）；parity-ledger v6→v7（探针 A/C/D
    结论 + 执行期新实勘）。
  - 负向证采集（AC-05 三件）；§9 work 记录（outcome/next=review）。
  - 验证：文档 diff 全窗口检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；T-02 可与 T-01 探针
并行无冲突——保守起见线性）。

## 9. 复审记录

- **2026-09-22 立项 handoff（auto-plan-new，revision 1）**：
  `stage: new`；`outcome: pass`；`next: work`。检索单件 + 四探针
  （A/B/C/D）待执行期裁定，均有 fallback。
- **2026-09-22 修订 handoff（auto-plan-new，revision 2）**：
  - 范围修订依据：用户北标口述（短期 Typora / 长期 Obsidian、Notion、
    飞书）+ 方向答复「扩容双件」（§4.1 授权记录）。
  - 变更：+快开件（Ctrl+P，纯 front）+ 北标落账（SD-405）；检索键位
    Ctrl+P → Ctrl+Shift+F；查找面板双模式（store find_open/find_mode、
    App find_q/find_rows/find_ran）；测试 find 组覆盖双件（计数
    13/12/十一段不变——组内子步扩）；任务 T-02/T-03/T-05 相应扩容。
  - `stage: new`（ drafting 修订，未起 work）；`outcome: pass`；
    `next: work`（T-01 起）。探针 A/B/C/D 不变。

## 10. 待澄清事项

1. **to_lower vue 发射**（探针 A，T-01 裁定）：不通 → v1 大小写敏感
   （检索匹配 + 快开过滤两侧；契约文本不变，SD-401 记 fallback 态 +
   ledger 记账）；通 → 双侧 to_lower。两态测试期望均已预案（语料首锁
   按裁定态取值）。
2. **onenter vue 发射**（探针 C，T-02 裁定）：不通 → 触发面仅按钮
   （契约底线，vm 面在册不构成双轨承诺）；通 → 按钮+Enter 双触发。
3. **input 控件 MCP 打字通道**（探针 D，T-04 裁定）：type_text 若不
   达 input 控件 → fallback 链：MCP 事件直派 oninput → 仍不通则
   find 组输入步经按钮触发 + find_q 态断言降级（导航/空态/命中/拾取
   面不降级）；e2e 段无此风险（真 DOM）。
4. ~~方向确认~~ **已裁定（2026-09-22 用户答复）**：扩容双件（快开 +
   检索 + 北标落账）。PLAN-005 候选池更新：悬空建页闭环、大纲面板
   （Typora 线第二件，D-12 定位探针前置）、图谱（vm 组件面依赖上游）。
5. **键位口径**（已随 r2 定，用户可再改）：Ctrl+P = 快开（VS Code/
   Typora 惯例）、Ctrl+Shift+F = 全文检索（VS Code/Obsidian 惯例）；
   Esc 全局关闭/面板自动聚焦 v1 不做（§1 非目标，后续批）。
6. **D-21 对 search 段波及**（观测项）：gate 负载窗 POST flake 若在
   search 段复现 → README 口径内重跑 + ledger v7 扩记；非阻塞。
7. **O(P²) 装配上量阈值**（观测项）：v0 语料规模（≤数百页）接受；
   bench 面证据触发时换 StringBuilder native 160 族（另立微批，非本
   计划）。
8. **walk depth 参数化**（观测项）：检索 depth=4 内部常量与快开数据源
   tree(root,4) 两处同值——工作区深于 4 层时快开/检索覆盖收窄（与
   链接面板同界）；参数化随文件系统 watch/索引批再议。
