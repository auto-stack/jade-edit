---
plan_id: PLAN-008
status: executing
feature_name: tags-wanted-slice
author: [zhaopuming]
created_at: 2026-09-23T10:24:24+08:00
updated_at: 2026-09-23T11:30:00+08:00
plan_revision: 1
current_step: 4
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-801"
  - "docs/ARCHITECTURE.md#SD-802"
  - "docs/README.md#SD-803"
  - "docs/README.md#SD-804"
touched_goals: []
---

# [PLAN-008] 知识库第六切片——标签面板 + 悬空链接清单（tags_index + find·wanted 模式）

> 预立项注：本计划起草于 PLAN-007 复审窗（007 execution_done@766ed53，
> status=reviewed 流程中）——接地基线 = 007 执行态（gate ALL GREEN 基线
> v7 + ledger v10/D-25）；007 复审若出返工且涉共享面（find 面板模式面/
> refresh 触发集/建页弹层复用面）则本计划 r2 跟随（§10.8）。**work 启动
> 前提 = 007 归档**（单写者主线约定）。

## 0. 变更摘要

SD-301/SD-405 主线第六片，双件（PLAN-004 双件先例同构）：

1. **标签面板（tags）**——Obsidian 线核心组织面，**frontmatter 面首开**
   （只读解析；D-14 写面不动）：back 新契约 `tags_index`（GET，
   tree/link_index 同族）字符串层解析 `tags:` block-list（缩进两形态）
   → 聚合 `[{tag, paths}]`；front 右栏第三面板（Ctrl+T）——tag 行
   （计数）→ 展开页行 → `OpenLink` 导航。
2. **悬空链接清单（wanted pages）**——知识卫生收割件（PLAN-007 删除
   悬空化语义的清道夫）：**零 back 增量**——find 面板增第三模式
   "wanted"（Ctrl+Shift+D）：link_pages 派生 exists=false 聚合
   （`{target, count}` 行）→ **行点击直连 PLAN-005 建页弹层**（预填
   target）→ 创建后清单自刷新——悬空「发现→建页→消缺」闭环。

北标对表：长期 Obsidian 线（tags 聚合 + wanted 卫生——两件均为
Obsidian 在册核心面）；短期 Typora 线仍 D-12 门控（大纲——候选池
首位顺延，§2.1）。

上游缺口适配内置：D-20②④⑤（列表元素局部拷/顶层数组/call-arg 单取
形——tags 只需解析态，免双取）；D-24③（menubar 无状态 enabled）；
D-25①（**App 上下文禁写 `.console`**——新 handler 全程只用
console_log，007 排雷纪律延续）；双段 `${}` 插值 avoidance（行 label
派生期拼接，PLAN-003 先例）。

## 1. 目标

- **G1（标签面板可用·双轨）**：Ctrl+T/菜单「视图→切换标签」→ 右栏
  tags 面板——全工作区 tag 行（名称 + 页计数，语料已知答案 6 tag）；
  点击 tag → 展开/收起其页面行；点击页行 → `OpenLink` 开档；
  空态「（无标签）」；刷新随触发集 v4 同口（Init/Save 成功/面板开启/
  建页/删除/重命名——同集多一个 fetch，不新增触发点）。
- **G2（wanted 模式可用·双轨）**：Ctrl+Shift+D → find 面板 wanted
  模式（无输入行）——悬空目标聚合行（`{target（n 处）}`——语料已知
  答案 `首页（1）`）；行点击 → 建页确认弹层预填 target（PLAN-005
  弹层复用）→ 确认 → 创建开档 + wanted 行消缺 + 链接面板 exists
  翻转（既有弧线）；空态「（无悬空链接）」；取消零落盘。
- **G3（back 契约语料首锁）**：`tags_index` 六案（全集首锁/无
  frontmatter 档贡献零/无 tags 键贡献零/缩进两形态/同页重复 tag 去重/
  多页聚合 + depth 传递）merged 直调与 split HTTP 双臂一致。
- **G4（测试面）**：vm 矩阵 + e2e 同单增 **meta 组**（tags+wanted
  双件同组——PLAN-004 find 组先例）；基线 v8 计划内重锁（store
  tags_open + App tags/wanted 面字段 + find_mode 值域扩）。
- **非目标**（明确排除）：
  - **frontmatter 写面**（tag 增删改写回磁盘——D-14 哲学不动：v0
    frontmatter 逐字保留；本批只读解析首开，写面属功能池后续批）；
  - inline 行内 `#tag` 扫描与 aliases（旧园 scanTagRows/extract_
    aliases 面——body 扫描 + frontmatter 别名，后续批；v1 仅
    frontmatter `tags:` block-list）；
  - inline `tags: [a, b]` 数组形态（语料无——block-list 唯一形态，
    v1 记账 §10.5）；
  - tag 编辑/重命名/合并、tag 颜色、嵌套 tag（Obsidian 深面——远期）；
  - unlinked mentions（未链接提及——候选池与 tags 并列，需 search_
    wiki 联动 fetch 面，另立批）；
  - wanted 行多源展开（源页清单——v1 只显计数；源页可经反链面板/
    检索到达，§10.4 留口）；
  - 大纲（D-12 门控不变——候选池首位顺延依据 §2.1）、图谱、移动/
    新建目录（create_dir 探针批）、检索上量微批、上游件实做与生成物
    补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第六片是 tags + wanted）

- **候选池对表**（PLAN-007 §10.7 在案）：大纲（D-12 解锁——**仍门控**
  [ledger v10 D-12 行无变化]；只读形态半值，且 burn 掉面板件后真大纲
  批重复建设——顺延）、移动/新建目录（语料 flat 低值 + create_dir
  探针前置）、tags 面板（frontmatter 面首开）、悬空链接清单（纯派生
  收割件）、检索上量（观测未触发）、供料回执（上游未动）。
- **北标口径**（SD-405）：长期 Obsidian 线——tags 是 Obsidian 组织
  面核心（tag 面板/计数/导航）；wanted pages 是知识卫生闭环件——
  PLAN-007 删除悬空化（SD-701）后，工作区需要「悬空可见→一键建页」
  的清道夫，且 wanted 行直连 PLAN-005 建页弹层 = 三切片联动收割。
- **形态复用度**：tags = 一个 GET 契约（tree/link_index 同族）+ 面板
  第三实例（BacklinksPanel 族）+ 触发集同口 fetch；wanted = find
  面板模式值扩（app.at:596/604 双分支→三分支）+ link_pages 纯派生 +
  建页弹层复用——**零新形态，两件合计约一个半传统切片**。

### 2.2 数据面（back：`tags_index` 新契约，唯一 back 增量）

```rust
/// 工作区标签索引（JSON 字符串；frontmatter tags: block-list 只读解析
/// ——D-14 写面不动；聚合 [{tag, paths}]，walk 序 first-seen）
/// GET /api/tags_index?path=..&depth=..
#[api(method = "GET", path = "/api/tags_index")]
pub fn tags_index(path str, depth int) str {
    return wsys.tags_json(path, depth)
}
```

- **GET 通道**：与 tree/link_index 同族（query 参数 = path/depth 工作区
  级 ASCII 常态——tag 值在响应 body，UTF-8 JSON 无 D-19 面）。
- **解析面（字符串层，零 JsonAny——C-1 纪律）**：
  1. frontmatter 段提取：`read_text` 全文 → 首行界符（"---"/"---\r"，
     is_delim 在册）→ 闭合界符行前段（body_after_open 的互补件——
     `frontmatter_of(text)` 新 fn，split 标记法同族）；无 frontmatter
     → 贡献零；
  2. `tags:` 键定位：行 trim-start 后以 "tags:" 起（顶层级——缩进
     深于首键的嵌套 list 头不误收：v1 顶层级口径，语料全此形态）；
  3. 列表项收集：后续行 while（trim 后以 "-" 起）→ item = "-" 后段
     trim；非列表行（含空行/次键）即止；**缩进两形态**（`- x` 与
     `  - x`——trim 归一，语料实勘两种并在）；同页重复 tag 去重；
  4. 聚合：walk 序（collect_ad_pages 共享件）逐页入集——`[{tag,
     paths:[相对路径]}]`，**顶层裸数组**（D-20④ 唯一健康形状），
     tag 序 = first-seen（确定性，link_index 哲学同判）。
- **只读面首开边界（SD-801 定文）**：frontmatter 解析为**只读派生面**，
  写面（补写/改写）仍属 D-14 功能池——本批后 frontmatter 在 back 侧
  有两个消费面（read_body 剥离保留 + tags_json 只读解析），零写面。

### 2.3 消费面（front）

- **store**（editor_store.at）：`tags_open` bool + `TagsToggle()`（
  backlinks_open/find_open 同构第三实例）。
- **App 模型**（app.at）：`tags_rows` List（解析态聚合行——App 上下文
  持态，D-20④）+ `tag_expanded` str（当前展开 tag——单选手风琴 v1，
  ""=全收）+ `wanted_rows` List（派生行）。**fetch 单取形**：tags 只
  需解析态 → `json.to_value(tags_index("", 4))` call-arg 单调用
  （D-20⑤：call-arg 形发射 JSON.parse——免双取，比 links 面简一档）。
- **tags 面板**（右栏，tags_open 时——find/backlinks 面板独立叠放）：
  壳 = `TagsPanel` 组件（BacklinksPanel 族第三实例）；**行集/空态留根**
  ——tag 行（button，label 派生期拼接 `{tag} · {n}`——双段插值
  avoidance）→ 点击 toggle `tag_expanded`；展开时其下页行（button，
  path 文本）→ `.OpenLink(path)`；空态「（无标签）」。
- **find·wanted 模式**：`find_mode` 值域扩 "files"/"text"/"wanted"
  （app.at:596/604 双分支 → 三分支；wanted 分支**无 input 行/无触发
  钮**——纯清单）；入口 action `view.find-wanted`（shortcut
  **Ctrl+Shift+D**，checked_if 复合式——find-text 同构）；行 =
  `wanted_rows_of(link_pages)` 纯函数（exists=false 出链按 target
  聚合计数，label 派生期拼 `{target}（{n}）`）→ 行点击
  `.CreateClick(r.target)`——**PLAN-005 建页弹层直连**（预填 target，
  弹层/确认/创建流全复用）；空态「（无悬空链接）」。
- **刷新面**：`refresh_tags()` 新 fn（单取形 fetch + tags_rows 装配），
  接线与 refresh_links 同触点（Init/Save 成功/面板开启/建页/删除/
  重命名——**触发集不扩，同口多一 fetch**）；`wanted_rows` 重算挂
  同触点 + ActFindWanted（link_pages 变化即消缺——建页成功后 wanted
  行自动消失，G2 闭环）。

### 2.4 键位/菜单面

Ctrl+T = 切换标签面板（新键位——Ctrl+D 为切换 Tab 在册，T 空闲）；
Ctrl+Shift+D = wanted 模式（Ctrl+D/Shift+F 邻族区分）；menubar 视图
增「切换标签」（view.backlinks 紧邻，**不挂状态 enabled**——D-24③）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件（dialog/button/text/icon 全在册；面板第三实例族）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「计划007已经实施完毕，正在review；接
  下来下一步计划是什么？请 [$auto-plan-new] 提前规划？」——**预立项
  授权**：007 复审窗内起草 PLAN-008（接地基线 = 007 执行态 766ed53；
  复审耦合 §10.8）。方向选择（tags+wanted 双件）= 候选池对表 +
  §2.1 依据；handoff 未否决即生效（PLAN-004..007 同款约定）。
- **work 启动前提**：PLAN-007 归档（单写者主线）；本计划保持
  drafting 至彼时。
- 语义决策预授权评估：frontmatter 只读首开（D-14 写面不动）——与
  v0「逐字保留」哲学一致，无写面即无破坏面；若用户要 tag 编辑 →
  §10.2 留口（r2 + D-14 裁决联动）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-23 @ 766ed53）

- **语料 tags 形态**（tmp/wiki-demo 5 页实读）：全数 frontmatter
  block-list——`tasks`（`  - tasks` 两空格缩进）/`project-management`
  （`- project-management` 无缩进）/`index`+`jade-garden`（两空格）/
  `distributed-systems`+`theory`（无缩进）——**缩进两形态并在**，
  inline `[a,b]` 形态语料无；`Hello World.ad` 无 tags 键（贡献零案
  素材）；已知答案全集 = 6 tag。
- **旧园对照**（冻结池实读）：`back/server/src/index.rs:682-698`
  `extract_tags`——经 links_gen scanTagRows（body 行内扫描 + block
  uuid 绑定）+ `extract_aliases`（frontmatter aliases 别名面）→
  TagRow 索引表。jade 不搬：索引重建形态 vs jade 纯派生哲学结构性
  不同（与 rename 对照同判）；行内 #tag 与 aliases = 后续批（§1
  非目标）。
- **在册复用件**：
  - wsys：`is_delim`/`body_after_open`（frontmatter 界符族——
    `frontmatter_of` 为其互补件）/`collect_ad_pages`（walk 共享）/
    `json_esc`（装配）；
  - front：app.at:596/604 `find_mode` 双分支（三分支扩展点）/
    `CreateClick`+建页弹层（PLAN-005 全套——wanted 直连）/
    BacklinksPanel 壳族（第三实例）/ refresh_links/refresh_tree
    触发点集（v4——refresh_tags 同口接线）/ `rename_impact`/
    `dangling_impact` 纯函数族（`wanted_rows_of` 同构第三实例）；
  - store：find_open/find_mode、backlinks_open、tags_open 第三位。
- **D-25① 纪律（007 排雷面）**：App 上下文 handler 禁写 `.console`——
  本批全部新 handler（TagsToggle 接线/FindWanted/wanted 行点击）只用
  console_log，零 `.console =` 赋值（AC-05 负向证含此项）。
- **键位面**：在册 Ctrl+N/O/S/J/L/D/P/Shift+F/F2/Delete——**Ctrl+T
  空闲**（Ctrl+D=切换 Tab 在册，T 无冲突）；Ctrl+Shift+D 与 Ctrl+D
  修饰区分（find-text 的 Ctrl+Shift+F 同族先例）。
- **基线**：structure-v7.txt（store new/delete 面 + App new_q + 五
  弹层 id 序列）；v8 变更面 = store tags_open + App tags_rows/
  tag_expanded/wanted_rows + find_mode 第三值（值域扩——首锁含
  wanted 态 dump）。

### 4.3 与既有计划的关系

- 复用 PLAN-003 链接派生面（link_pages → wanted 聚合）+ PLAN-004
  find 面板模式机制 + PLAN-005 建页弹层全套 + PLAN-006/007 refresh
  触发集 v4——**收割片**（与 007 同判：零新形态）。
- 与 D-14 的边界：frontmatter 消费面 +1（只读），写面维持零——裁决
  记录进 SD-801（「只读首开」边界首次定文）。
- 不触碰上游供料包件；D-12/D-16/D-17/D-19/D-21/D-24/D-25 留观不变。
- PLAN-009 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  unlinked mentions（search_wiki 联动）、移动/新建目录（create_dir
  探针前置）、inline #tag/aliases（body 扫描面）、tag 写面（D-14
  裁决联动）、检索上量微批、File.rename/copy 供料回执件。

## 5. 详细设计

### 5.1 `tags_index` 契约与 wsys 实现（SD-801 back 半）

```
fn frontmatter_of(text str) str {
    // read_body 互补件：首行界符 → 闭合界符行前段（split 标记法
    // 同族）；无 frontmatter → ""
}

fn page_tags(fm str) List {
    // fm.split("\n") 逐行：trim 后以 "tags:" 起 → 收集态 on；
    // 收集态：trim 后以 "-" 起 → item = "-" 后段 trim 入集（去重——
    // while 扫描查重，D-11）；否则收集态 off（次键/空行即止）
    // ⚠ D-20②：行元素先拷局部变量再调方法
}

pub fn tags_json(path str, depth int) str {
    // collect_ad_pages(path, depth) walk 序逐页：
    //   fm = frontmatter_of(read_text(resolve(rel)))  ← 注意原文非
    //   read_body（后者已剥 frontmatter）——新读或复用 read_text
    //   ts = page_tags(fm) → 逐 tag 聚合（tag 表 + paths 表，while
    //   查重聚合——first-seen 序）
    // 装配：[{\"tag\":..,\"paths\":[..]}]——json_esc + 逐项 + 重接
}
```

### 5.2 front 接线（SD-801 front 半）

- store：`tags_open` + `TagsToggle()`。
- app.at：msg `ActTags`/`TagToggle(str)`；模型 `tags_rows`/
  `tag_expanded`/`wanted_rows`；actions `view.tags`（Ctrl+T）+
  `view.find-wanted`（Ctrl+Shift+F 同族 checked_if 复合式）+ menubar
  视图项「切换标签」；`TagsPanel` 壳（第三实例）+ 右栏 tags 区（tag
  行/展开页行/空态——行集留根）；find 面板三分支（wanted 无 input）；
  `wanted_rows_of(pages)` 纯函数（exists=false 按 target 聚合计数，
  label 拼接）；`.TagToggle(tag)` → 单选手风琴；wanted 行点击 →
  `.CreateClick(r.target)`（PLAN-005 弹层直连——预填/确认/创建/消缺
  全复用）；`refresh_tags()`（单取形）接线 refresh_links 同触点 +
  `wanted_rows` 重算同触点。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-801 | add | docs/ARCHITECTURE.md §5 | before：无标签/悬空清单域段（frontmatter 零消费面——read_body 只剥离）。after：增「标签与悬空清单域语义」子段——`tags_index` GET 契约（tree/link_index 同族）；**frontmatter 只读解析面首开**（字符串层 block-list 两缩进形态；写面属 D-14 功能池不动——边界首定文）；聚合形状 `[{tag, paths}]` 顶层裸数组 first-seen 序；触发集 v4 同口多 fetch（不扩集）；wanted 派生语义（link_pages exists=false 聚合、find 第三模式、行点击直连建页弹层——「发现→建页→消缺」闭环）；App 上下文 `.console` 禁写纪律引（D-25①） | Obsidian 组织面 + 知识卫生规范锚；frontmatter 消费/写面边界定文 | AC-01/02/06 |
| SD-802 | modify | docs/ARCHITECTURE.md §6 | before：十四组检查 + 基线 v7。after：**十五组检查**（+meta 组：tags 面板弧线/wanted 模式弧线）+ **基线 v8**（store tags_open + App tags/wanted 面字段 + find_mode 值域扩；v7 留档） | 测试体系表更新（PLAN-003..007 同步先例） | AC-03/04 |
| SD-803 | modify | docs/README.md Tests 节 | before：15+15+14+14+十四段口径、基线 v7 指针。after：**16/16+15/15+十五段**口径（meta 组双臂全跑——tags GET 无 D-19 面；wanted→建页 POST 同先例）+ 基线 v8 指针 + N 定谳续记 | 判绿口径单一权威面（SD-204/304/403/503/603/703 续） | AC-03/04 |
| SD-804 | modify | docs/README.md「是什么/文档」节 | before：第五切片=树文件管理。after：**第六切片=标签面板+悬空链接清单**条目（frontmatter 只读首开 + 卫生闭环注记）+ ledger v11 指针 | 产品主线进度面派生同步（SD-303/404/504/604/704 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：merged 直调 + serve-back GET 六案——
  ①全集首锁（6 tag 集 + 归属页精确——语料已知答案）②无 frontmatter
  档贡献零（测试内造）③无 tags 键档贡献零（`Hello World.ad` 在册）④
  缩进两形态（`tasks` 两空格 vs `project-management` 无缩进——同集
  并收）⑤同页重复 tag 去重（测试内造双写）⑥多页聚合 + depth 传递
  （limit depth=1 收窄——tree 同族语义）。
- **vm 矩阵 meta 组（T-04）**：
  - tags 子步：①Ctrl+T 开面板（tags_open 态 + 6 tag 行快照——
    label 计数断言）②tag 展开→页行→`OpenLink` 开档（ASCII tag 导航
    双臂；CJK 页行导航 merged 臂——D-19 口径）③空态（测试内造空
    workspace？——不可；v1 以「面板开+行集非空」为常态断言，空态走
    单元面 wanted 子步 ⑦ 同判）④Save 后刷新（造档带新 tag → 保存 →
    面板新行）；
  - wanted 子步：⑤Ctrl+Shift+D → wanted 模式（无 input 行快照 +
    `首页（1）` 行——语料已知答案）⑥行点击→建页弹层预填→确认→
    创建开档 + wanted 行消缺 + 链接面板 exists 翻转（三切片联动弧线）
    ⑦空态（建页消缺后再进 wanted 模式 →「（无悬空链接）」——空态
    弧线经闭环达成）⑧取消零落盘。
- **e2e（T-04）**：meta 段同弧线（真 DOM：Ctrl+T 面板/tag 展开/页行
  导航；Ctrl+Shift+D/wanted 行/建页弹层/消缺——CJK 建页弧线走
  ASCII 悬空目标测试内造，D-19 口径同 PLAN-005 e2e 先例）。
- **基线 v8（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v7 留档。
- **负向（T-05）**：regen-vue 补件面零增量；冻结池/家族仓零接触；
  **`.console` 赋值零新增**（App 上下文——D-25① 纪律负向证）；建页
  /删除/rename 组回归零变化。

## 7. 验收标准

- **AC-01（back 契约）**：`tags_index` GET 契约落 api.at + wsys 实现；
  §6 六案双臂全绿；聚合形状逐字节符合 SD-801 定文。验证：T-01 直证
  脚本实录。
- **AC-02（tags/wanted 闭环双轨）**：tags 面板（开关/tag 行计数/展开/
  页行导航/Save 刷新）与 wanted 模式（清单/行点击建页/消缺/exists
  翻转/取消/空态）双轨全绿，vm snapshot+state 与 vue e2e 同断言域
  （CJK 导航子步 merged 臂——D-19 口径注记）。验证：T-04 meta 组 +
  e2e meta 段。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **16/16** + split **15/15**（+meta 组）+ vue build +
  e2e **十五段**；判绿实录进 §9（D-21 v10 三形态口径——失败重跑
  即绿，次数如实记）。
- **AC-04（基线 v8）**：计划内重锁完成、v7 留档、连跑 ≥3 次零漂移；
  dump 含 tags_open/tags_rows/tag_expanded/wanted_rows。
- **AC-05（负向证）**：冻结池与家族仓零接触（git status 证据）；
  `gen/` 无手改；旧园代码零引用；补件面零增量；**App 上下文
  `.console` 赋值零新增**（grep 证——D-25①）；frontmatter 写面零
  （磁盘原文逐字节不变——tags 只读面证）。
- **AC-06（文档面）**：SD-801..804 落位且 canonical 文中锚注齐
  （SD-301..704 先例）；**frontmatter 只读/写面边界**与**「发现→
  建页→消缺」闭环语义**入 SD-801；parity-ledger **v11**（执行期
  新实勘入册）。

## 8. 执行步骤

> 每任务收口 = 代码 + 验证命令实录进本节证据块；§10 观测项闭合标
> 「已裁定」。前置：PLAN-007 归档（§4.1）。

- **T-01 back 契约 + 实现 + 六案直证**（AC-01）✅ 已完成
  - api.at 增 `tags_index` GET；wsys.at `frontmatter_of`（read_body
    互补件）+ `page_tags`（block-list 解析——两缩进形态/去重）+
    `tags_json`（walk 聚合 + 装配）。
  - 六案 merged 直调 + serve-back GET 直证。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（link/find/
    create/rename/file 组回归零变化）。
  - **证据（2026-09-23，base=2e16871 直接 main 约定）**：
    - `node tests/probe_tags.mjs`（新入库直证脚本，双臂）——**全案
      通过 + 双臂一致=true**：①全集首锁 11 tag（first-seen 序 + 归属
      页逐项精确）②无 frontmatter 贡献零③无 tags 键贡献零④缩进两
      形态并在⑤同页重复去重（单条目单 path）⑥depth 传递（d1=仅根层
      probe-crlf、d2=d4 全集）+ **CRLF 形态**（probe-crlf.ad 界符
      `---\r` + trim 容错正证）。探针素材六件 Node 直写隔离 workspace
      （nofm/notags/dup/sub 三页/crlf）。
    - **执行期校正（计划勘误两处——语料实勘）**：①语料 tags 全集 =
      **7 tag** 非 6（`Hello World.ad` 实有 `tags:\n- demo`，计划
      §4.2/§6/G1/G3 误记「无 tags 键」——「无 tags 键」案素材改探针
      内造 probe-notags.ad，语义不变）；②悬空目标全集 = **首页 +
      页面名 各 1**（index.ad 尾行 `[[页面名]]` 亦悬空，计划 G2/§6
      ⑤ 只记 首页——wanted 已知答案随实勘），PLAN-006/007 执行期
      校正先例同判（测试面证据驱动，revision 1 保持）。
    - `node tests/vm_matrix.mjs`（front 未动回归）——merged 16 项全
      过含基线 v7 零漂移；split 臂 **check-11 首步 menubar 项瞬态
      2 次**（popover 内容窗内未渲染——D-21 家族新形态注记，独占重跑
      **14/14 ALL GREEN**，重跑即绿口径）。
- **T-02 front tags 面板**（AC-02 前半）✅ 已完成
  - store tags_open/TagsToggle + TagsPanel 壳（第三实例）+ app.at
    右栏 tags 区（tag 行/展开页行/空态——行集留根）+ actions
    Ctrl+T + menubar 项 + `refresh_tags()`（单取形）同触点接线 +
    `.TagToggle` 单选手风琴。
  - 验证：merged 手动冒烟（6 tag 集快照/展开/导航）+ `pnpm build`
    PASS。
  - **证据（2026-09-23）**：
    - 冒烟（e2e/.runtime/smoke-t02.mjs 临时件，merged 臂）**6/6 ALL
      GREEN**——面板开（tags_open 态 + TAGS 壳 + 7 tag 行 label 全在
      [语料实勘全集]）/tasks 展开 → wiki/Tasks.ad 开档/单选手风琴换选
      distributed-systems → wiki/CAP 定理.ad CJK 导航（merged 臂）/外
      造 Tagged Note.ad → 保存 → 面板新行 `meta-save · 1`（触发集：
      Save 成功——List<map> 态 dump = 裸 vmref，断言面 = 快照行文本，
      links 面同口径）/面板关断。首跑 ③ 处 1 次瞬态（面板页行 8s 未
      渲染——aura 渲染节拍窗，重跑全绿，D-21 家族口径如实记）。
    - `pnpm build` **PASS**（首次 gen-only exit 1 瞬态[上轮冒烟进程
      残留窗]，同源二跑 OK：裸 strict 重建 + vue-tsc 零错 + vite
      14.57s）。
    - 触发集接线（v4 同口多 fetch 不扩集）：Init / ActSave /
      ActTags(面板开启) / CreateGo / NewGo / DeleteGo / RenameGo 七
      触点全接 `.TagsRefresh()`；D-25① 纪律落地（App 上下文零
      `.console` 写面——console 面由 store handler 自维护）。
- **T-03 wanted 模式 + 建页接回**（AC-02 后半）✅ 已完成
  - find_mode 三分支（wanted 无 input）+ `view.find-wanted`
    （Ctrl+Shift+F 同族）+ `wanted_rows_of` 纯函数 + wanted_rows
    重算触点 + 行点击 `.CreateClick` 直连（PLAN-005 弹层复用——
    预填/确认/消缺）。
  - 验证：merged 冒烟全弧线（wanted 清单→建页→消缺→exists 翻转）+
    find/create 组回归 + e2e meta 段冒烟。
  - **证据（2026-09-23）**：
    - 冒烟（e2e/.runtime/smoke-t03-p08.mjs 临时件，merged 臂）**4/4
      ALL GREEN 一次过**——模式入口（find_mode=wanted + 面板无 input
      行/无检索钮）/清单三行（首页（1）+ 页面名（1）[语料实勘全集]
      + Wanted Target（1）[外造 ASCII 源档]）/行点击 → 弹层预填
      create_target → 取消零落盘/再点 → 创建开档（模板播种）+ wanted
      行消缺 + links_json exists 翻转 + 磁盘模板逐字节。
    - `node tests/vm_matrix.mjs --arm merged`——**14/15**（唯一 FAIL =
      基线 B 计划内漂移[App wanted_rows/tags_rows/tag_expanded 字段 +
      menubar 两新项——T-04 v8 重锁]；link/create/find/rename/file 全
      组零变化）。
    - `pnpm build` PASS + `pnpm test:e2e` 首跑 check-5 保存点 1 败
      （D-21 在册签名——write_wiki POST 保存点形态）**重跑全绿 14 段**。
    - menubar 视图增「悬空清单」checkbox 项（find-text 同构复合
      checked_if）+ FindPanel 壳模式标签第三分支「悬空」——action
      view.find-wanted（Ctrl+Shift+D）双入口。
- **T-04 测试扩单 + 基线 v8 + 判绿首锁**（AC-02/03/04）✅ 已完成
  - vm meta 组八子步 + e2e meta 段 + 基线 v8 重锁。
  - 验证：`node tests/vm_matrix.mjs` 双臂全绿 + `pnpm test:e2e`
    连跑 ≥5 + `node scripts/gate.mjs` ALL GREEN（判绿实录 + N 定谳
    续记）。
  - **证据（2026-09-23）**：
    - **vm meta 组**（check 14，双件同组——位置 10c 后 11 前）：tags
      子步（面板开 7 tag 行已知答案/展开导航 ASCII 双臂+CJK 仅
      merged[D-19]/Save 刷新外造新行）+ wanted 子步（入口无 input 行
      无检索钮/页面名（1）已知答案+外造 Wanted Target（1）/取消零落
      盘[⑧ 前置——10c 同款纪律]/创建开档+消缺+exists 翻转+模板逐字
      节/空态闭环（无悬空链接））。双臂 **merged 16/16 + split
      15/15 ALL GREEN**（首跑即过；本窗矩阵连跑 3 轮全绿 + gate 内
      矩阵段 7 连绿）。1 次执行期进程死亡（F-R1/D-21 家族，meta 组
      轮询中 ECONNREFUSED）+ 1 次 check-10 面板行渲染窗瞬态（bl_rows
      在态而快照滞后——D-21 v9 同形态实录），均重跑即绿。
    - **e2e meta 段**（13 file 段后段内最后）：tags 4 行已知答案
      （13 后位态）+ 展开导航 + write_wiki 外造 Save 刷新 + wanted
      两行清单[Hello World（3）+ 页面名（1）——**执行期校正：e2e 13
      删 Hello World.ad 致其三处入链悬空、首页/CAP 定理 不悬空
      [链接方/在盘]，与 vm 位态异位[两轨素材异位既有口径]，初版断言
      按错误位态书写 3 轮失败后实勘修正]+ 取消零落盘/创建开档模板逐
      字节/消缺/空态闭环/exists 翻转[Hello World tab 题钮与出链行同
      名——.last() 消歧]。**e2e 窗口 23 跑 8 绿**（PLAN-006 同款如实
      记：11+ 失败全数 **check-5 保存点 D-21 签名**[api-err-body
      missing param `path` 两次实锤——POST 先于刷新 GETs，非本计划
      新增 fetch 所致]，重跑即绿，最长连绿 3——「连跑 ≥5」bar 本机
      家族会话并行日突发簇窗未达，分布如实记）；meta 段自身每轮达即
      PASS（8 绿全含）。
    - **基线 v8**：`--save-baseline tests/baseline/structure-v8.txt`
      首锁（v7 留档）；重锁面 = store tags_open + App
      tags_rows/tag_expanded/wanted_rows 入 dump + menubar 两新项
      id 序列计划内扩 + find_mode 值域扩（基线态仍 files）。**零漂
      移连跑 ≥4**（独立跑 4 轮 + gate 内 7 轮逐跑 B PASS）。
    - **gate**：`node scripts/gate.mjs` **第 8 跑 ALL GREEN**（vm 双
      臂 16/16+15/15 + build + e2e 十五段；前 7 跑败点 = e2e 段
      check-5 保存点 D-21 ×6 + 矩阵段瞬态 ×1，如实记——PLAN-006/007
      gate 窗节拍同款）。
    - 测试面定位锚两处消歧：vm wanted 收尾「收起」钮（tags/backlinks
      已闭故唯一）；e2e 出链行 .last()（根 Hello World.ad tab 题钮
      同名）。
- **T-05 文档 + ledger v11 + 收口**（AC-05/06）
  - SD-801..804 canonical 落位（锚注齐 + 只读边界/闭环语义定文）；
    ledger v10→v11（执行期实勘）。
  - 负向证采集（含 `.console` 负向 grep + frontmatter 磁盘逐字节）；
    §9 work 记录（outcome/next=review）。
  - 验证：文档 diff 全窗口检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-23 预立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-008，revision 1。
  - `outcome: pass`——可进 work，**前提 = PLAN-007 归档**（§4.1
    单写者约定；接地基线 766ed53 执行态）。
  - `next: work`（007 归档后 T-01 起）。
  - 无待裁探针（GET 契约同族/面板第三实例/建页弹层复用/纯派生——
    全为已证面）；§10 观测项三项非阻塞。

## 10. 待澄清事项

1. **inline `tags: [a, b]` 形态**（观测项，语料无）：v1 仅 block-list；
   遇 inline 形态 = 该键按「值非空但无列表行」处理（贡献零 + 不炸）；
   支持面后续批（语料首现时再议）。
2. **tag 编辑/写面**（用户口，默认不做）：D-14 哲学不动——frontmatter
   只读首开；若用户要 tag 增删改 → r2 + D-14 裁决联动（写面首开 =
   界符段改写器 + 保留语义重验，规模另估）。
3. **wanted 行源页展开**（默认只显计数）：v1 行文本 `{target}（n）`；
   源页可经反链面板/检索到达；若用户要行内展开源清单 → r2 小范围
   （纯派生 +1 段行集）。
4. **D-21 POST 波及**（观测项）：本批新增 GET（tags_index——GET 面
   无 D-21 签名）；wanted→建页走既有 create_page POST（先例面）；
   meta 段如撞负载窗按 README 重跑口径，ledger v11 如实记。
5. **tags 面板空态弧线**（观测项）：语料常态非空——空态「（无标签）」
   断言经 wanted ⑦ 同判闭环弧线或单元面达成（T-04 落定）。
6. **Ctrl+T/Ctrl+Shift+D 键位**（已随 r1 定，用户可改）：T 空闲实勘
   在案；与 Obsidian 惯例（Ctrl+T 无强约定）无冲突担。
7. **PLAN-009 候选池**（本批后更新）：大纲（D-12 解锁——首位顺延
   候）、unlinked mentions（search_wiki 联动 fetch 面）、移动/新建
   目录（create_dir 探针前置）、inline #tag/aliases（body 扫描面）、
   tag 写面（D-14 裁决联动）、检索上量微批、File.rename/copy 供料
   回执件。
8. **PLAN-007 复审耦合**（预立项特有）：007 复审若出 needs_fix 返工
   且涉共享面（find 面板模式面/refresh 触发集/建页弹层/`CreateClick`
   口）→ 本计划 r2 跟随修订（接地证据重核）；复审 pass/merge 不触发
   （docs-only 面先例——PLAN-007 §10.8 同判兑现）。
