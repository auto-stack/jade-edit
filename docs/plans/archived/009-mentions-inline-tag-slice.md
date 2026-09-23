---
plan_id: PLAN-009
status: archived
completion_kind: delivered
feature_name: mentions-inline-tag-slice
author: [zhaopuming]
created_at: 2026-09-23T13:03:40+08:00
updated_at: 2026-09-23T15:26:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-901"
  - "docs/ARCHITECTURE.md#SD-902"
  - "docs/README.md#SD-903"
  - "docs/README.md#SD-904"
touched_goals: []
---

# [PLAN-009] 知识库第七切片——未链接提及 + 行内 #tag（mentions + inline tag 扫描）

## 0. 变更摘要

SD-301/SD-405 主线第七片，双件（PLAN-004/008 双件先例同构——Obsidian
线收割二期）：

1. **未链接提及（unlinked mentions）**——反链面板增第三段「未链接
   提及」：其他页面 body 中**以纯文本提及**激活档 stem、但**未用
   `[[链接]]`** 的位置（Obsidian 反链面板同款段落）。派生 = `search_
   wiki(stem)` 结果 − 已链源（bl_rows）− 自身 − title-only 命中——
   **零新 back 契约**（search_wiki 联动，PLAN-008 候选池在案）。
2. **行内 #tag**——tags_index 解析面扩 body 扫描：`#tag` 行内标记
   （标题 `# `/`##`、块锚 `{#id}`、纯数字三类忽略——语料实勘天然
   边界）与 frontmatter tags 并集聚合；**aliases 不做**（属链接解析
   域——与 casefold 同批联动裁决，§10.4）。

**立项期负结果实勘（方向修正依据）**：每日笔记（候选池外新增考虑）
经查 **`Time.now` = Unix epoch 秒字符串**（auto-lang stdlib.rs:841-847
`shim_time_now`——无日历格式化原语；`Time.now_ms/now_sec` 同族数值）
——本地日期命名需自实现历法+时区换算，**上游阻塞** → 记供料候选
（Time 日期格式化原语）+ 候选池挂账（§10.2），本片不做。

北标对表：长期 Obsidian 线（提及 = 反链面板补全；inline tag = 标签
组织面二期）；短期 Typora 线仍无解锁件（大纲 D-12 门控不变——ledger
v11 D-12 行原样）。上游缺口适配内置：D-19（mentions 走 search_wiki
POST 先例）；D-20②④⑤；D-24③；D-25①（App 上下文禁写 `.console`）。

## 1. 目标

- **G1（未链接提及相关·双轨）**：开反链面板（Ctrl+L）→ 面板三段
  （反链/出链/**未链接提及**）：提及行 = 源页 path + 命中行 snippet
  → 点击 `OpenLink` 开档；激活档变更/保存/重命名后面板刷新（backlinks
  _open 守卫——面板关时零 fetch）；空 active 恒空（卫语句同反链）；
  空态「（无未链接提及）」。
- **G2（inline #tag 并集·双轨）**：tags 面板聚合 = frontmatter tags
  ∪ body `#tag`（同页去重）；标题 `#`/`##`（# 后空白或 #）、块锚
  `{#id}`（# 前为 `{`）、纯数字 token 三类忽略；tags 面板/计数/wanted
  行为不变（仅聚合源扩）；语料已知答案 = 现 6 tag 基线零漂移（语料
  body 无合法 #tag——`# Tasks` 标题/`{#block-project-a}` 块锚全数
  忽略）。
- **G3（测试面）**：mentions 子步并入 **link 组**、inline-tag 子步
  并入 **meta 组**（域内聚——组数不变 16/15/十五段口径零漂移）；
  基线 v9 计划内重锁（App mention_rows 面）。
- **G4（F-R8-1 遗留收口）**：probe_delete/rename 测试仪具端口 8252
  → 移出 WinNAT 排除区段 8251-8950（6400f3b 同款适配——PLAN-008
  复审 findings 留档件，本批 T-04 顺手收口）。
- **非目标**（明确排除）：
  - **每日笔记**（Time 原语阻塞——§0 实勘；供料候选挂账 §10.2）；
  - **aliases 别名解析**（`[[别名]]` 解析到档——链接域语义变更，
    与 casefold 匹配同批联动裁决，§10.4）；
  - 提及行的「转为链接」一键操作（Obsidian 深功能——写面操作，
    D-14 联动，后续批）；
  - #tag 嵌套（`#a/b`）与 tag 修改（写面）；
  - 大纲（D-12 门控）、图谱、移动/新建目录、检索上量微批、上游件
    实做与生成物补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第七片是 mentions + inline #tag）

- **候选池对表**（PLAN-008 §10.7 在案）：大纲（D-12 仍门控——顺延
  依凭 ledger v11 原行）、unlinked mentions（search_wiki 联动 fetch
  面）、移动/新建目录（语料 flat 低值 + create_dir 探针前置）、
  inline #tag/aliases（body 扫描面）、tag 写面（D-14 裁决）、检索
  上量（观测未触发）。北标口径（SD-405）：Obsidian 线上**反链面板
  与标签面板是两大组织面**——mentions 补全反链面板（Obsidian 同位
  段落）、inline tag 扩标签聚合源（Obsidian 行内标签核心用法）；
  两件均零新 back 契约/零新 UI 形态（面板段落 + 解析面扩），
  **纯收割**；每日笔记经实勘阻塞（§0）转供料候选。
- **旧园对照**：unlinked mentions 旧园未做（其 /api/unlinked/{title}
  路由在册 main.rs:122——**冻结池有路由先例**，实现形态未见消费
  面；jade 以 search_wiki 派生实现，语义同源）；inline #tag = 旧园
  `scanTagRows` body 扫描先例（index.rs:682 extract_tags 经
  links_gen——jade 改字符串层直扫）。

### 2.2 数据面（零新契约；两处既有契约的消费/解析扩）

- **mentions（消费扩）**：`search_wiki(stem, 20)`（PLAN-004 契约
  原样）→ 前端派生：结果过滤三则——①`path != active`（自身）②
  `path ∉ bl_rows 源集`（已链——反链段已示，不重复）③`snippet
  != ""`（body 命中——title-only 命中非提及语义，SD-401 snippet
  空口径复用）。**fetch 守卫**：`.store.backlinks_open` 为真才取
  （面板关时激活变更零 POST——D-21 面纪律）。
- **inline #tag（解析扩）**：`tags_json`（PLAN-008 契约原样）逐页
  增 body 扫描段——`page_inline_tags(body) -> List`：
  - 标记法：`body.split("#")` 逐段（首段直通）；对每段：
    **忽略三则**——①段首字符为空格/换行/`#`（标题 `# x`、`## x`
    ——# 后空白即非 tag；`##` 二级标题段首为 `#`）②**前一段尾字符
    为 `{`**（块锚 `{#block-id}`——语料 `{#block-project-a}` 实勘
    边界）③token（段首至首个空白/`}`）纯数字；
  - 合格：token 非空非纯数字 → 入集（同页与 frontmatter tags 并集
    去重）；
  - ⚠ D-20②：段元素先拷局部变量再调方法；token 截取禁 .length 定长
    （D-20③）——split(" ")/split("\n")/split("}") 首段法。
- **聚合/触发面不变**：tags_index 形状/first-seen 序/触发集 v4 同
  口（PLAN-008 定文零变化——仅聚合源 +1）。

### 2.3 消费面（front）

- **App 模型**（app.at）：`mention_rows` List（唯一新模型字段——
  基线 v9 变更面）+ `mentions_of(results List, active str, linked
  List) -> List` 纯函数（三则过滤 + 行装配 `{path, snippet}`）。
- **反链面板第三段**：backlinks 区（app.at 在册）「反链/出链」两段
  后增「未链接提及」段——标题行 + 空态 + 行集留根（button，双行文
  本 = path + snippet 次行 text——**两行留根**，非单钮双段插值）。
- **fetch 触点**：`refresh_mentions()` 新 fn（backlinks_open 守卫 +
  active 空/untitled 卫语句 + `json.to_value(search_wiki(stem, 20))`
  单取形 + 过滤装配）——接线：Init（面板开时）、ActBacklinks 开面板、
  OpenFile/OpenLink/ActNew（激活变更——守卫内）、Save 成功、Rename
  成功（新 stem）——**与 bl/ol 行重算同触点族**（v3/v4 集内，不扩
  新触发类别）。
- **tags 面板**：零变化（聚合源扩在 back——tags_rows 形状不变）。

### 2.4 键位/菜单面

零新增（mentions 无入口——反链面板段落；inline tag 无入口——解析
面扩）。G4 端口适配为测试仪具面（无 UI）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件、无新契约（双件均消费/解析扩）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「008已经完工，请 [$auto-plan-new]
  规划下一个计划」——**立项授权**：008 已归档（d71ea91——正常
  立项窗，非预立项）。方向选择（mentions + inline #tag 双件）=
  候选池对表 + §2.1 依据 + §0 负结果实勘（每日笔记阻塞）；handoff
  未否决即生效（PLAN-004..008 同款约定）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-23 @ d71ea91）

- **Time 原语负结果（§0 依据）**：auto-lang `crates/auto-lang/src/
  vm/ffi/stdlib.rs:817-847`——`Time.now_ms/now_sec`（epoch 数值）+
  `Time.now`（**epoch 秒字符串**，`shim_time_now`）；native_catalog
  1192-1198 无日历格式化项；vue 垫片面（regen-vue/vm-natives）无
  Time 族——**本地日期命名双轨皆无原语**（自实现历法+时区 = 越界
  实做，供料候选挂账）。
- **旧园先例**：main.rs:122 `/api/unlinked/{title}` 路由在册（冻结
  池——消费面未见，jade 以 search_wiki 派生同源实现）；index.rs:
  682-698 extract_tags 经 links_gen scanTagRows（body 行内扫描 +
  block uuid 绑定）——jade 字符串层直扫对照（索引重建 vs 纯派生，
  rename 对照同判）。
- **语料 inline 边界（忽略三则的天然已知答案）**：`Tasks.ad` body
  实读——`# Tasks`（标题：# 后空格）、`## 项目 A 任务 {#block-
  project-a}`（二级标题 + **块锚 `{#`**——`#` 前为 `{` 须排除，
  否则误收 `block-project-a`）；`index.ad` 2 个 `#` 行同标题形态；
  **语料无合法 inline #tag** → G2 基线零漂移断言成立（6 tag 集
  不变）。
- **在册复用件**：search_wiki POST 契约 + CJK 双臂已证（PLAN-004）；
  snippet=""=title-only 口径（SD-401）；bl_rows 已链源（PLAN-003）；
  tags_json/frontmatter_of/page_tags（PLAN-008——page_inline_tags
  为其姊妹件）；单取形 fetch（PLAN-008 refresh_tags 先例）；
  backlinks 面板两段结构 + 空态形态；`.console` 禁写纪律（D-25①）。
- **F-R8-1**：WinNAT 排除区段 8251-8950（PLAN-008 复审窗 netsh 实勘）
  ——probe_tags 已适配 8221（6400f3b），**probe_delete/rename 8252
  遗留**（PLAN-008 归档提交留档「后续批」——本批 G4 收口）。
- **基线**：structure-v8.txt；v9 变更面 = App mention_rows（唯一新
  模型字段；store 零新增）。

### 4.3 与既有计划的关系

- 复用 PLAN-003 反链面板 + PLAN-004 search_wiki + PLAN-008 tags
  解析族/单取形——纯收割片（与 007/008 同判：零新形态）。
- 与 D-14 边界不变（零写面）；D-12/D-16/D-17/D-19/D-21/D-24/D-25
  留观不变；Time 日期原语 = **新供料候选**（本批立项实勘立案，随
  ledger v12 记账）。
- PLAN-010 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  每日笔记（**Time 日期原语解锁后**——新晋候选）、移动/新建目录
  （create_dir 探针前置）、aliases+casefold 链接解析批（联动裁决）、
  提及转链接（写面 + D-14）、tag 写面、检索上量微批、File.rename/
  copy 供料回执件。

## 5. 详细设计

### 5.1 back 解析扩（SD-901 inline 半）

```
fn page_inline_tags(body str) List {
    // segs = body.split("#")；首段直通；i≥1：
    //   seg 拷局部（D-20②）→ 忽略三则：
    //   ①seg 首字符 ∈ {空格/换行/#/回车}（.slice(0,1) 判——ASCII 安全）
    //   ②segs[i-1] 尾字符 == "{"（块锚——尾取 split("\n")/(" ") 末段
    //     法，禁 length）
    //   ③token（seg 至首个空白/}）纯数字
    //   合格 → token 入集（去重 while 扫描）
}

// tags_json 逐页：ts = page_tags(fm) ∪ page_inline_tags(body)
//   ——body 来自 read_body（frontmatter 已剥——# 扫描面正确）
```

### 5.2 front 接线（SD-901 mentions 半）

- app.at：模型 `mention_rows` + 纯函数 `mentions_of(results, active,
  linked)`（三则过滤）；反链面板第三段（标题「未链接提及」+ 空态 +
  两行行集留根：button path + text snippet）；`refresh_mentions()`
  （守卫链：backlinks_open → active != "" → fetch 单取形 → 过滤装配）
  接线六触点（Init/ActBacklinks/OpenFile/OpenLink/ActNew/Save 成功/
  RenameGo 成功——§2.3）。
- ⚠ 提及 fetch 仅在守卫内（面板关零 POST——D-21 面纪律）；handler
  全程 console_log（**零 `.console =` 赋值**——D-25①，AC-05 负向证）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-901 | modify | docs/ARCHITECTURE.md §5 | before：反链面板 = 反链/出链两段（SD-302）；tags 聚合源 = frontmatter block-list（SD-801）。after：①反链面板增**「未链接提及」第三段**——派生规则（search_wiki(stem) 结果 −自身 −已链源 −title-only[snippet=""]）、fetch 守卫（backlinks_open + 非 active 空——面板关零 POST）、触点族 = 激活变更/Save/Rename 成功同口；②tags 聚合源扩 **body inline #tag**——忽略三则（标题 # 后空白或 #、块锚 `{#`、纯数字 token）、同页并集去重、tags_index 契约/形状/触发集零变化；③**每日笔记 blocker 记账**（Time.now epoch-only 实勘——日期格式化原语供料候选，解锁前不做） | 反链/标签两大组织面补全；负结果实勘以规则沉淀防重复立项 | AC-01/02/06 |
| SD-902 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v8。after：组数**不变**（mentions 子步入 link 组、inline-tag 子步入 meta 组——域内聚注记）+ **基线 v9**（App mention_rows；v8 留档）+ F-R8-1 端口适配注记 | 测试体系表更新；零组数漂移口径首例（子步内聚型） | AC-03/04 |
| SD-903 | modify | docs/README.md Tests 节 | before：16+15+十五段口径、基线 v8。after：口径不变 + link/meta 组子步扩注记 + 基线 v9 指针 + N 定谳续记 | 判绿口径单一权威面（…/803 续） | AC-03/04 |
| SD-904 | modify | docs/README.md「是什么/文档」节 | before：第六切片=标签+悬空清单。after：**第七切片=未链接提及+行内 #tag**条目（Time blocker 注记）+ ledger v12 指针 | 产品主线进度面派生同步（…/804 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：tags_json 扩展七案——①语料基线零漂移
  （6 tag 集不变——忽略三则全数生效证：`# Tasks`/`## …{#block-
  project-a}` 不入集）②inline 计入（测试内造档 `正文 #项目x 尾` →
  `项目x` 入集）③标题忽略（`# T`/`## T`）④块锚忽略（`{#anchor}`）
  ⑤纯数字忽略（`#123`）⑥frontmatter+inline 同页并集去重（两源同
  tag 一条）⑦CJK token（`#中文标签` POST 面——GET 契约 body 响应，
  无 D-19 面）。
- **vm 矩阵（T-04）**：
  - link 组 mentions 子步：①开反链面板（Ctrl+L）→ 段落标题三段快照
    ②提及行已知答案（测试内造：A 档 body 纯文本提及 `Hello World`
    （无 [[]]）→ 开 Hello World 档 → 提及段 A 行 + snippet；**已链
    源不重复合并证**——再造 B 档 `[[Hello World]]` → B 只在反链段
    不在提及段）③行点击 OpenLink ④激活变更刷新（切档 → 提及行随
    stem 变）⑤空态（无提及档）⑥面板关零 fetch（守卫——状态断言
    mention_rows 不变 + POST 计数面豁：merged 臂网络不可观测，以
    split 臂 serve 日志或行为等价断言，T-04 落定）；
  - meta 组 inline 子步：⑦造 inline tag 档保存 → tags 面板新行；
    ⑧语料基线 6 tag 零漂移（回归）。
- **e2e（T-04）**：link/meta 段子步扩（真 DOM：三段标题/提及行/造
  tag 保存后面板行——ASCII 弧线；CJK 提及目标走 merged 断言口径
  [search POST 双臂无 D-19——e2e 全臂可跑]）。
- **基线 v9（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v8 留档。
- **F-R8-1（T-04）**：probe_delete/rename 端口 8252 → 8222/8223
  （区段外，6400f3b 同款）——直证复跑绿。
- **负向（T-05）**：regen-vue 补件面零增量；冻结池/家族仓零接触；
  `.console` 赋值零新增；tags_index 契约形状零变化（PLAN-008 直证
  脚本回归）。

## 7. 验收标准

- **AC-01（inline 解析扩）**：§6 七案双臂全绿；**语料基线 6 tag 零
  漂移**；忽略三则逐案可证。验证：T-01 直证脚本实录。
- **AC-02（提及段双轨）**：三段面板/提及行已知答案/已链源排重/行
  点击导航/激活刷新/空态/守卫零 fetch，vm 与 vue e2e 同断言域全绿。
  验证：T-04 link 组子步 + e2e。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **16/16** + split **15/15**（组数不变）+ vue build +
  e2e **十五段**（段内子步扩）；判绿实录进 §9（D-21 v11 口径——
  重跑即绿如实记）。
- **AC-04（基线 v9 + F-R8-1）**：重锁完成零漂移（v8 留档）；
  probe_delete/rename 端口移出 WinNAT 区段复跑绿（G4 收口实录）。
- **AC-05（负向证）**：冻结池与家族仓零接触；`gen/` 无手改；旧园
  零引用；补件面零增量；`.console` 零赋值；**tags_index 契约/形状
  零变化**（008 直证回归）；search_wiki 契约零变化。
- **AC-06（文档面）**：SD-901..904 落位且锚注齐；**Time blocker
  记账 + 供料候选**入 SD-901/ledger；parity-ledger **v12**（执行期
  新实勘；Time epoch-only 实勘入供料候选清单）。

## 8. 执行步骤

- **T-01 back 解析扩 + 七案直证**（AC-01）
  - wsys.at `page_inline_tags`（忽略三则标记法）+ `tags_json` 并集
    段；PLAN-008 probe_tags 回归（基线零漂移证）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（meta 组回归）。
- **T-02 front 提及段 + 守卫 fetch**（AC-02 前半）
  - app.at mention_rows/mentions_of/refresh_mentions（守卫链）+ 六
    触点接线 + 面板第三段（两行留根）。
  - 验证：merged 手动冒烟（造提及档 → 三段快照 → 行点击）+
    `pnpm build` PASS。
- **T-03 排重/刷新语义收口**（AC-02 后半）
  - 已链源排重（bl_rows 源集传参）+ 激活变更/Save/Rename 触点对齐
    + 空态/空 active 卫语句。
  - 验证：merged 冒烟（B 档造链 → 反链段有 B 提及段无 B）+ link/
    meta 组回归 + e2e 子步冒烟。
- **T-04 测试扩单 + 基线 v9 + F-R8-1 + 判绿首锁**（AC-02/03/04）
  - link 组六子步 + meta 组两子步 + e2e 扩 + 基线 v9 + probe 端口
    适配。
  - 验证：双臂全绿 + `pnpm test:e2e` 连跑 ≥5 + gate ALL GREEN。
- **T-05 文档 + ledger v12 + 收口**（AC-05/06）
  - SD-901..904 落位；ledger v11→v12（Time 供料候选 + 执行期实勘）；
    负向证采集；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-23 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-009，revision 1。
  - `outcome: pass`——可进 work（008 已归档，正常立项窗）。
  - `next: work`（T-01 起）。
  - 无待裁探针（双件全为已证面组合）；§10 观测项非阻塞；**每日
    笔记 blocker 已实勘立案**（负结果，防重复立项）。

- **2026-09-23 work pass（auto-plan-work）**：
  - `stage: work` | plan_id: PLAN-009 | plan_revision: 1 |
    outcome: **pass**。
  - `task_ids: T-01..T-05 全收口`（current_step 5/5）。
  - `evidence`：
    - T-01 back 解析扩——`page_inline_tags`（split("#") 逐段标记法）
      + `is_digits` + `page_tag_set`（fm ∪ inline 并集去重）+
      `tags_json` 两遍聚合换源；`tests/probe_inline_tags.mjs` 七案
      双臂全绿 + 双臂逐字节一致（语料 7 tag 零漂移/忽略面负向/
      inline 计入/标题/块锚/纯数字/fm+inline 去重/CJK token）+
      probe_tags 六案回归绿（PLAN-008 基线零漂移证）。
    - T-02/T-03 front 提及段——`mention_rows`（唯一新模型字段）+
      `mentions_of` 三则过滤纯函数 + `MentionsRefreshOf` 共享口
      （backlinks_open 守卫零 POST + 单取形 search_wiki + 七触点
      接线）+ 面板第三段两行留根；merged 冒烟 6/6 一次全绿（守卫/
      三段标题/已知答案/排重/snippet/点击导航/空态）+ `pnpm build`
      PASS。
    - T-04 测试扩单——vm link 组 mentions 子步 10m 六子步（段区域
      断言纪律——文件树同列根档 .ad 全文 includes 误中面实勘）+
      meta 组 inline 子步两子步（⑦新行⑧语料零漂移负向面）双臂
      **16/16 + 15/15 ALL GREEN** + 基线 **v9** 首锁零漂移（v8 留档）
      + e2e 10m/inline 段扩 **5 连绿** + **gate 首跑 ALL GREEN**；
      F-R8-1 收口 probe_delete 8252→8222 / probe_rename 8254→8223
      移出 WinNAT 区段复跑绿（九案/八案双臂全过）。
    - T-05 文档——SD-901..904 落位（ARCHITECTURE §5/§6 +
      README Tests/是什么）+ ledger **v12**（D-26 三件：行内 #tag
      前导空白语义执行期校正/vue handler 间无 await 跨 handler 数据
      依赖竞态[MentionsRefreshOf 自派生已链源集修复]/面板关零 fetch
      行为等价断言通道 + D-21 v12 扩记三窗实录 + Time 日期原语供料
      候选记账）+ 负向证全清（冻结池/家族仓零接触/gen/ 零手改/
      `.console` 零新增/tags_index 契约形状零变化[probe_tags 回归]/
      search_wiki 契约零变化/语料源零写入）。
  - **执行期校正两件**（如实记）：
    - ① SD-901 忽略三则→**四则**：语料实勘 `\[\[Tasks#block-
      project-a\]\]` 转义链接锚面——`X#y` 连续文本非 tag（Obsidian
      前导空白语义）；probe 首跑实勘 `block-project-a\]\]` 误收后
      立④则修复，语料已知答案零漂移成立。
    - ② `MentionsRefreshOf` 已链源集**直读 .bl_rows → 自派生**
      （`backlink_rows_of(.link_pages, active)`）：vue 轨 handler 间
      调用不发射 await（D-23② 新实例）——ActBacklinks 内两 handler
      并发，单取形 search 先于双取形 link_index 返回，排重吃到
      pre-refresh 陈旧投影（e2e check-10 5/5 必现：已链源三行误入
      提及段）；自派生后两轨语义等价（同输入同输出）。D-26 记账。
  - **§10.1 落定**：面板关零 fetch 断言通道 = **行为等价双断言**
    （关面板 → 激活变更 → mention_rows state dump 行恒旧值 + 段不
    渲染）——merged 臂网络不可观测，vm_matrix 10m ⑥在册。
  - `blockers: 无`（每日笔记 blocker 已立案——Time 日期格式化原语
    = 供料候选，ledger v12 记账）。
  - `next: review`（execution_done；复审窗注意：执行窗 3 形态
    [popover 内容窗/check-10 行渲染窗/tags 7 行渲染窗]全数 D-21
    签名重跑即绿——ledger v12 扩记；e2e 前序两轮 5/5 败为子步实勘
    期真 bug 迭代[排重竞态/收口态复原]非 D-21 签名，修复后 5 连绿）。

- **2026-09-23 复审（auto-plan-review）**：
  - `stage: review`，PLAN-009，revision 1。
  - `outcome: pass`——execution_done → reviewed，next=merge。
  - `reviewed_commit: c1fab7c`（T-05 收口态 = main tip，工作树
    clean 零未提交实现）；`base_commit: d71ea91`（plan008 归档态
    ——diff base，提交链 b7d1c77→464e567→3eac982→c1fab7c 线性
    无合并噪声）。
  - `dependency_revisions`：无依赖工作树/分支（直接 main 线性约定；
    单 worktree = 主检出；deps/bps·stylekit 只读零触碰——diff
    全窗口 gen//deps 零变化实证）。
  - `spec_inputs`：ARCHITECTURE.md@c1fab7c（§5 SD-901 段/§6 SD-902
    表）/README.md@c1fab7c（SD-903 Tests+N 定谳/SD-904 第七切片
    条目）/parity-ledger.md@c1fab7c（v12 D-26 + D-21 v12 扩记）；
    frontmatter new_spec_components 四项终化、supersedes/touched_
    goals 空（纯增量正确——008 同款约定）。
  - **独立性声明**：独立会话复审（实现由先行会话完成），裁定自
    工件重建——AC 复现全部本地重放，不采信执行期摘要。
  - `acceptance_results`：
    - **AC-01 pass**——`node tests/probe_inline_tags.mjs` 重放：
      七案双臂全过 + 双臂逐字节一致=true（语料 7 tag 零漂移[10 tag
      全集 = 7 语料 + 3 探针注入]/归属页逐项精确/忽略面负向[标题/
      块锚/纯数字/前导空白四则——block-project-a 不入集]/inline
      计入/fm+inline 去重/CJK token）；`page_inline_tags` 源检与
      SD-901 定文逐条对应（split 逐段标记法/四则忽略/split 首段链
      取 D-20③/while 查重 D-11）。
    - **AC-02 pass**——gate 重放 vm link 组 10m 六子步双臂 PASS
      （三段标题/提及行已知答案+snippet+已链源排重负证/行点击
      OpenLink/空态/激活刷新/面板关零 fetch 行为等价双断言）+ meta
      组 inline ⑦⑧（新行 inline-meta · 1 + 语料零漂移负向无
      block-project-a）+ e2e [10m mentions]/[14 meta] inline 段
      PASS 行实录；七触点源检逐点对上（Init/OpenFile/ActNew/Save/
      ActBacklinks/OpenLink/Rename——app.at 1024/1046/1065/1079/
      1096/1205/1508）。
    - **AC-03 pass**——`node scripts/gate.mjs` 复审重放 **exit 0
      ALL GREEN 首跑**（merged **16/16** + split **15/15** + vue
      build + e2e 1 passed 23.4s——复审窗零 D-21 签名零重跑）。
    - **AC-04 pass**——基线 v9 重放零漂移（[B baseline] PASS：
      state 逐字节 + id 序列；v9 含 mention_rows: [] 入 dump，
      v8 留档对证无此字段）+ F-R8-1 收口复跑绿（probe_delete
      九案@8222 / probe_rename 八案@8223——均 WinNAT 区段外，
      双臂一致=true）。
    - **AC-05 pass**——负向证复验：diff 全窗口（d71ea91..c1fab7c）
      gen//deps 零变化、冻结池/家族仓零触碰（变更面仅本仓 12 文
      件）；app.at `.console =` 赋值零处（grep 实证）；
      `probe_tags` 六案回归绿（tags_index 契约形状零变化）+
      probe_inline_tags 双臂逐字节一致（GET 契约零变化）；search_
      wiki 契约零变化（消费面原样——源检）；语料源零写入（探针
      隔离拷贝面）。
    - **AC-06 pass**——SD-901..904 落位源检（§5 域语义段含忽略
      四则含前导空白语义/§6 组表含 10m+inline 注记 + 基线 v9/
      README Tests N 定谳 SD-903 条 + 文档节第七切片条 + ledger
      v12 指针）；Time blocker 记账入 SD-901（供料候选）+ ledger
      v12 changelog；D-26 三件在册。
  - `findings`（四件，无一阻塞）：
    - **F-R9-1（low·doc）**：parity-ledger H1 标题仍书「v11」——
      本文件自定约定 = H1 载当前版本号（d71ea91 态 H1=v11 +
      changelog「v10→v11」可证），v12 bump 漏 H1（changelog 内
      「表头版本 v11→v12」与 README v12 指针均在）。校正 = merge
      窗 ledger refresh 时 H1 v11→v12（随 merge 携带，不另开工作
      批）。
    - **F-R9-2（low·doc）**：README ledger 指针行「二十五项三分类
      」——表实有 26 行（D-26 新增；d71ea91 态 25 行配二十五项
      自洽可证）。校正 = merge 窗随 F-R9-1 同笔改「二十六项」。
    - **F-R9-3（info·plan 文本）**：本计划 §1 G2/§4.2/AC-01 书
      「6 tag」——语料实有 7 tag（PLAN-008 执行期校正已在案：
      Hello World.ad 实有 demo——SD-801 定文「语料已知答案 = 7
      tag」）；立项草案承袭旧数漏勘，执行面（probe/matrix/canonical）
      全数一致用 7。零漂移语义（本判据实质）成立不受影响；仅计划
      文本陈旧，随本记录存档不再改版。
    - **F-R9-4（observation·域外留观）**：提及刷新未接 DeleteGo
      ——删除提及源档后面板提及行滞留至次触点（激活变更/Save/
      Rename）。约定范围即七触点（§2.3 与 SD-901 canonical 同枚
      举、删除明确在外）——无意图偏离；候选记入未来触点族扩批
      （与 §10.5 D-21 fetch 预算观测同窗裁决）。
  - `evidence`（命令 + 结果行节录，复审窗 2026-09-23）：
    - `node scripts/gate.mjs` → exit 0；`[matrix:merged] 16/16
      checks passed`、`[matrix:split] 15/15 checks passed`、
      `[10m mentions] PASS — 六子步…`（双臂）、`[14 meta] PASS —
      …+ inline 子步…`（双臂）、`[B baseline] PASS — 结构基线 v9
      零漂移`、`ok 1 e2e\matrix.spec.ts … (23.4s) / 1 passed`、
      `[gate] ALL GREEN：vm 双臂矩阵 + vue build/e2e 全过`。
    - `node tests/probe_inline_tags.mjs` → RESULT 七案双臂全过 +
      `双臂逐字节一致=true`（got 全集 10 tag 序录在 RESULT 行）。
    - `node tests/probe_tags.mjs` → RESULT 六案全过 + 双臂一致
      =true（11 tag 全集——探针素材面，语料 7 零漂移同口径）。
    - `node tests/probe_delete.mjs` → RESULT 九案双臂 + 一致=true
      （SPLIT_PORT=8222）；`node tests/probe_rename.mjs` → RESULT
      八案+空名守卫双臂 + 一致=true（SPLIT_PORT=8223）。
    - 静态：`git diff --stat d71ea91..c1fab7c`（12 文件全清单在
      案）；`grep -rn "\.console =" src/front/app.at` 零命中；
      v8/v9 基线 mention_rows 差异对证。
  - `delta 检定`：SD-901 canonical 文本与实现行为逐条对应（四则
    忽略含执行期校正之前导空白语义——work pass + D-26① 如实记，
    canonical 为准）；SD-902/903/904 与矩阵/README/ledger 实态一
    致；语义契约零变更（review 不触发 revision bump）。
  - `next: merge`（用户本会话预授权「复审 OK 即 merge」——移交
    auto-plan-merge；F-R9-1/2 随 merge 窗 ledger refresh 一并校正）。

- **2026-09-23 merge（auto-plan-merge）**——收据 `PLAN-009:r1`：
  - `stage: merge` | plan_id: PLAN-009 | revision 1 |
    outcome: **pass** | completion_kind: **delivered**。
  - **prepared**——delivery commit **5a29e5b** = c1fab7c 的
    docs-only 后代（diff 全窗口仅 3 文档：本计划 §9 复审记录
    +102 行 + F-R9-1/2 校正各 1 行；实现/依赖零变化——gate
    ALL GREEN 重放@c1fab7c 等价承继，复审窗已全量重放）。
  - **landed**——main tip == 5a29e5b（直接 main 线性约定，无
    合并提交；worktree list 单主检出实证）。
  - **ledger_refreshed**——docs/parity-ledger.md **v12** 读回证
    （H1 v12 + 26 行 D-01..D-26 + D-21 v12 扩记 + F-R8-1 收口 +
    Time 供料候选）；F-R9-1/2 随本窗校正（H1 v11→v12 + README
    「二十六项」）；无 live ledger 服务（PLAN-001..008 同判——
    ledger = tracked file，经 git 提交即发布）。
  - **archived**——git mv → docs/plans/archived/
    009-mentions-inline-tag-slice.md + status: archived +
    completion_kind: delivered；canonical 面（ARCHITECTURE §5
    SD-901/§6 SD-902 + README SD-903/904）@5a29e5b 在 main。
  - **cleaned**——无 worktree/无 dev 分支（直接 main 线性约定，
    PLAN-005..008 同款）；主检出 status clean。
  - `next: 无`（PLAN-010 候选池 §10.7——大纲[D-12 解锁首位]/
    每日笔记[Time 原语解锁后]/移动+目录/aliases+casefold）。

## 10. 待澄清事项

1. **面板关零 fetch 的断言通道**（T-04 落定）：merged 臂网络不可
   观测——split 臂 serve 日志计数 or 行为等价断言（关面板 → 激活
   变更 → mention_rows 恒旧值）；落定后进 T-04 证据块。
2. **每日笔记 blocker**（已实勘立案）：Time.now epoch-only（stdlib
   实读）；**unlock = auto-lang Time 日期格式化原语**（新供料候选，
   ledger v12 记账）；解锁后每日笔记为新晋候选（create_page 复用 +
   yyyy_MM_dd stem + 模板口径届时裁）。
3. **提及 snippet 截断**（观测项）：SD-401 整行禁截断口径沿袭——
   长行提及行显示溢出（面板窄）；截断需 D-20③ 安全窗口法（后续 UX
   批）。
4. **aliases + casefold 链接解析批**（候选池联动项）：`[[别名]]`/
  大小写不敏感解析 = stem 解析/改写/建页/提及四面联动——独立批
   裁决（本批明确不做）。
5. **D-21 POST 波及**（观测项）：提及 fetch = 面板开时每次激活变更
   +1 POST（v0 规模接受）；负载窗失败按 README 重跑口径，ledger
   v12 如实记。
6. **inline #tag 在 code fence 内**（观测项）：v1 原文扫（fence 内
   `#x` 会计入——语料无此形态）；fence 感知扫描随 markdown 深解析
   批（parser 域）。
7. **PLAN-010 候选池**（本批后更新）：大纲（D-12 解锁——首位顺延
   候）、每日笔记（Time 原语解锁——新晋）、移动/新建目录（create_
   dir 探针前置）、aliases+casefold 链接解析批、提及转链接（写面）、
   tag 写面（D-14）、检索上量微批、File.rename/copy 供料回执件。
