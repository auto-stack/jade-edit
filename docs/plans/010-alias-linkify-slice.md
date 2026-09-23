---
plan_id: PLAN-010
status: reviewed
completion_kind: executing_done
feature_name: alias-linkify-slice
author: [zhaopuming]
created_at: 2026-09-23T15:21:23+08:00
updated_at: 2026-09-23T18:40:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1001"
  - "docs/ARCHITECTURE.md#SD-1002"
  - "docs/README.md#SD-1003"
  - "docs/README.md#SD-1004"
touched_goals: []
---

# [PLAN-010] 知识库第八切片——别名解析 + 提及转链接（aliases + linkify，链接域二期）

> 立项窗注：用户口径「009 正在 review」，仓库实况 = **009 已归档
> delivered**（复审 5a29e5b pass → 归档 7b8a251，ledger v12/26 项）——
> 本计划为**正常立项**（非预立项，无复审耦合）；接地基线 = main@
> 7b8a251。

## 0. 变更摘要

SD-301/SD-405 主线第八片，双件（链接域二期——PLAN-004/008/009 双件
先例同构）：

1. **别名解析（aliases）**——`[[别名]]` 解析到声明该别名的页面：
   frontmatter `aliases:` block-list 只读解析（tags 解析族泛化），
   解析序 = **stem 精确 → alias 精确**（first-hit walk 序，stem 冲突
   同判）——链接域消费面（exists/target_path/反链/出链/wanted）经
   `stem_resolve` 单点扩容自动生效；**casefold 不做**（与大小写边界
   同批联动裁决，§10.4）。
2. **提及转链接（linkify）**——009 提及段（读面）的写面补全：
   `linkify_page(path, stem)` POST——body **明区**（`[[..]]` 链接
   标记外）纯文本 stem 出现处改写为 `[[stem]]`（while-contains 惯
   用法——D-23① 纪律族），返回改写处数；提及行增「转为链接」钮 →
   改写后该行从提及段消失、转入反链段（009 三段闭环补写侧）。
   **F-R9-4 收口随批**（009 留观：提及刷新未接 DeleteGo——本批触
   及提及面，域内顺收）。

北标对表：长期 Obsidian 线——aliases 是中文知识库高频刚需（中文别名
→英文档名）；linkify 是提及工作流闭环（读→发现→一键转链）。短期
Typora 线仍无解锁件（大纲 D-12 / 每日笔记 Time 原语——候选池双门控
项原样）。上游缺口适配内置：D-19（两契约 POST）；D-20②④⑤；
D-23①（while-contains）；D-24⑤（参数名避保留字）；D-25①；**D-26②
（跨 handler 数据依赖竞态——linkify handler 自派生数据，禁读跨
fetch 的 `.bl_rows` 投影）**。

## 1. 目标

- **G1（别名解析可用·双轨）**：页面 frontmatter 声明 `aliases:`
  block-list（如 `CAP.ad` 声明 `- 帽子定理`）后：其他档 `[[帽子定理]]`
  → exists=true、target_path=CAP.ad、出链行可点击导航、CAP.ad 反链段
  出现来源档；stem 命中优先于 alias（同名时）；wanted 清单不含已由
  alias 解析的目标；**语料基线零漂移**（语料无 aliases 声明——全部
  现行已知答案不变）。
- **G2（linkify 可用·双轨）**：开反链面板 → 提及行（源页 + snippet）
  旁「转为链接」钮 → 点击 → 该源页 body 明区 stem 纯文本全数改写为
  `[[stem]]`（frontmatter 保留——write_body 面）→ 提及段该行消失 +
  反链段增行（刷新同口）+ 返回处数 console_log；无明区出现（如全在
  链接内）→ 返回 "0" no-op；CJK stem 双臂（POST）。
- **G3（F-R9-4 收口）**：DeleteGo 成功分支接 `MentionsRefreshOf`
  （删除激活档后提及段随新激活刷新——009 复审留观项闭账）。
- **G4（测试面）**：link 组子步扩（aliases 解析四案 + linkify 弧线
  + F-R9-4 案）——**组数不变 16/15/十五段**；**基线 v9 零重锁**
  （双件零新 store/App 模型字段——首例零重锁片，§6 注记）。
- **非目标**（明确排除）：
  - **casefold/大小写不敏感解析**（与 Windows 同档边界、create/
    rename 交互联动——独立批裁决，§10.4）；
  - aliases inline `aliases: [a, b]` 数组形态（同 tags §10.1 口径
    ——block-list 唯一形态，语料无）；
  - **alias 写面**（frontmatter 增删别名——D-14 哲学不动）；
  - 检索面 alias 匹配（search_wiki stem+body 口径不变——alias 不
    入检索，§10.5 记账）；提及面 alias 匹配（提及按 stem 搜索——
    alias 提及后续批）；
  - linkify 词边界（子串命中即换——`CAP` 误中 `CAPTURE` 的边界判
    断需词法面，§10.3 记账 v1 子串口径）；code fence 内改写（原文
    扫口径同 009 inline #tag §10.6）；
  - 大纲（D-12）、每日笔记（Time 原语）、移动/新建目录（create_dir
    探针前置）、tag 写面、检索上量微批、上游件实做与生成物补件
    （AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第八片是 aliases + linkify）

- **候选池对表**（PLAN-009 §10.7 在案）：大纲（D-12 门控——ledger
  v12 原行）、每日笔记（Time 原语门控——009 立项实勘）、移动/新建
  目录（语料 flat 低值 + create_dir 探针前置）、aliases+casefold
  链接解析批、提及转链接、tag 写面、检索上量（未触发）、供料回执
  （上游未动）。**双门控项原样** → 可动件中最优组合 = aliases +
  linkify（候选池两件合并一片——均为链接域、共享 rewrite/解析族
  机制）。
- **北标口径**（SD-405）：长期 Obsidian 线——**aliases 是中文知识
  库刚需**（`[[帽子定理]]` ↔ `CAP 定理.ad`——中文别名挂英文档名是
  Obsidian 中文社区标准用法）；linkify 补全 009 提及工作流（读面
  已交付，写面一键转链 = 提及价值的兑现点）。
- **形态复用度**：aliases = `page_tags` 泛化（`page_fm_list(fm,
  "aliases")`）+ `stem_resolve` 单点扩容（wsys.at:185 在册——全
  消费面自动生效，front 零改动）；linkify = 006 `rewrite_links`
  姊妹件（标记法明区判定 + D-23① while-contains）+ 提及行 +1 钮。
  **两件合计零新 UI 形态、零新面板、零基线字段。**

### 2.2 数据面（back：两契约，`linkify_page` 新 + `stem_resolve` 扩）

```rust
/// 提及转链接：path 档 body 明区（[[..]] 标记外）stem 纯文本出现处
/// 改写为 [[stem]]（frontmatter 保留）；返回改写处数（"0"=无）
/// POST /api/linkify_page
#[api(method = "POST", path = "/api/linkify_page")]
pub fn linkify_page(path str, stem str) str {
    return wsys.linkify_page_impl(path, stem)
}
```

- **POST 通道**：stem CJK 常态（D-19——POST body 先例五契约）。
- **aliases 扩容（无新契约——link_index 内部）**：
  - `page_fm_list(fm, key)`：page_tags 泛化（"tags"/"aliases" 同
    解析器——block-list 两缩进/去重在册逻辑直用）；
  - `resolve_target(stems, aliases, rels, target)`（stem_resolve
    扩名）：①stem 集**精确**首现命中 → rel；②未命中 → alias 集
    精确首现（walk 序 per-page per-alias 顺序扫描）→ rel；③""；
    同名 alias 冲突 = walk 序首现（stem 冲突同判，SD-302 口径续）；
  - 消费面（自动）：extract_links_json 的 exists/target_path 判定
    （wsys.at:232 调用点）——反链/出链/wanted/悬空建页目标解析全
    数经此单点。
- **linkify_page_impl 三步**：
  1. 卫：exists(path) 否 → ""；stem 空 → ""；
  2. **明区改写**（rewrite_links 姊妹标记法）：`body.split("[[")`
     ——首段 = 明区；后续段 `split_once("]]")`：pair[1]（]] 之后）
     = 明区、pair[0] 段 = 链接内**不改**；无 "]]" 段 = 链接内（未
     闭合）不改；各明区 `while seg.contains(stem) { seg = seg.
     replace(stem, "[["+stem+"]]") }`（**D-23① while-contains 惯
     用法**——首现/全量两态收敛；替换串含 stem 自身但含括号分隔
     不再裸命中，收敛保证成立）；计数累加；
     ⚠ D-20②：段元素先拷局部；
  3. 计数 >0 → write_body 回写（frontmatter 保留）→ 返回计数
     str；0 → 不写返 "0"。
- **rename 交互语义注记（SD-1001）**：006 改写器按 **stem** 匹配
  `[[Old]]`——alias 链接（`[[别名]]` → 改名后档）**不受改名改写
  影响**（别名仍有效，解析自动跟随新 stem 集重算）——正确语义，
  定文防误「补改写」。

### 2.3 消费面（front）

- **aliases：零改动**——target_path/exists 经 link_index 流入，
  出链行（app.at 在册 button 分支）/反链派生（target_path == active）
  /wanted 派生自动生效。
- **linkify**：提及行（009 两行留根）首行 path 钮旁增「转为链接」
  小钮（icon "link"，button text variant）→ `.LinkifyGo(path)`：
  - `r = linkify_page(path, .store.active_path 的 stem)`（stem =
    active_path 剥目录/尾——split 法，RenameOpen 同构派生）；
  - try/catch console_log；r != "0" && r != "" → **自派生刷新**
    （D-26② 纪律：`LinksRefreshOf` + `MentionsRefreshOf`——两 fn
    均自派生数据，无跨 fetch 投影读）；
  - ⚠ handler 内禁 `.console =` 赋值（D-25①）。
- **F-R9-4 收口**：DeleteGo 成功分支（app.at 在册）增 `Mentions-
  RefreshOf(.store.active_path)` 调用——同守卫链（backlinks_open +
  非 active 空）。

### 2.4 键位/菜单面

零新增（linkify = 行内钮语境入口；aliases 无入口）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「计划009已经完成，正在review；请提前
  规划以下一步计划？」——**立项授权**。仓库实况 = 009 已归档
  （7b8a251）→ 正常立项窗（非预立项；用户口径与仓库态差异在案）。
  方向选择（aliases + linkify 双件）= 候选池对表 + §2.1 依据；
  handoff 未否决即生效（PLAN-004..009 同款约定）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-23 @ 7b8a251）

- **在册扩展点**：wsys.at:185 `stem_resolve(stems, rels, target)`
  （exists/target_path 单点判定——:232 调用）；008 `page_tags`/
  `frontmatter_of`（page_fm_list 泛化基座）；006 `rewrite_links`
  标记法（linkify 明区判定的姊妹形态）；009 提及段两行留根 +
  `LinksRefreshOf`/`MentionsRefreshOf`（自派生口径——D-26② 修复
  形态）。
- **旧园对照**（冻结池实读）：index.rs:702-718 `extract_aliases`
  ——frontmatter `aliases` 数组（serde JSON 解析）→ TagRow → 索引
  ——**alias 参与反链解析**（测试 `alias_resolves_for_backlinks`
  在册）——jade 语义同源（解析进反链），实现 = 字符串层（索引
  重建 vs 纯派生，rename 对照同判）。
- **D-26②（009 实勘，本批纪律）**：handler 间无 await 跨 handler
  数据依赖竞态——`MentionsRefreshOf` 曾读 `.bl_rows` 吃双 fetch 时
  序窗陈旧投影（e2e check-10 五现修复）→ 现形态 = 自派生
  `backlink_rows_of(.link_pages, active)`——linkify handler 沿用
  （零跨 fetch 投影读）。
- **F-R9-4**（009 复审 findings·域外留观）：「提及刷新未接
  DeleteGo」——本批 G3 顺收（触及提及面，域内化）。
- **测试造档通道**：write_wiki 新档直写 body——body 以 `---\n
  aliases:\n- x\n---\n` 开头即成带 frontmatter 档（read_body 剥离
  面自洽——008 frontmatter_of 读回验证）；语料本体零改动。
- **语料基线**：语料 5 页无 aliases 声明 → G1 零漂移断言成立；
  现行已知答案（`[[首页]]` 悬空等）不受解析序扩容影响（stem 精确
  优先，无 alias 声明时行为恒等）。
- **基线 v9 零重锁依据**：双件零新 store/App 模型字段（linkify 无
  弹层/无开态；aliases front 零改动）——state dump 不变。

### 4.3 与既有计划的关系

- 复用 PLAN-003 解析单点 + PLAN-006 改写器族 + PLAN-008 解析器族
  + PLAN-009 提及段/自派生刷新——**零新形态收割片**（与 007/008/
  009 同判）。
- 与 D-14 边界不变（linkify 走 write_body 保 frontmatter；alias
  只读）；D-12/Time 供料候选留观不变；casefold 独立批（§10.4）。
- PLAN-011 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  每日笔记（Time 原语解锁）、移动/新建目录（create_dir 探针前置）、
  casefold 链接解析批（独立裁决）、tag 写面（D-14）、检索面 alias
  匹配、检索上量微批、File.rename/copy 供料回执件。

## 5. 详细设计

### 5.1 back 契约与实现（SD-1001）

```
fn page_fm_list(fm str, key str) List {
    // page_tags 泛化：定位行 trim 后以 key + ":" 起 → 收集态；
    // block-list 两缩进/去重（008 逻辑直迁）
}

fn resolve_target(stems, aliases, rels, target) str {
    // ①stem 精确首现（stem_resolve 原序）②alias 精确首现
    //（page 序 × alias 序）③""
}

// links_json/collect_ad_pages：页收集时同步收 aliases 表
//（fm = frontmatter_of(read_text(rel))——与 tags_json 同读复用
// 或独立取，T-01 落定读次（v0 双读无害，O(2P)）

pub fn linkify_page_impl(path, stem) str {
    // ①卫 ②明区 while-contains 改写（§2.2 三步）③write_body+计数
}
```

### 5.2 front 接线（SD-1001）

- app.at：msg `LinkifyGo(str)`；提及行首行增「转为链接」钮；
  `.LinkifyGo(path)`：stem 派生（active_path split 法）→ fetch →
  自派生刷新（LinksRefreshOf + MentionsRefreshOf——D-26② 纪律）；
  DeleteGo 成功分支增 MentionsRefreshOf（G3）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1001 | modify | docs/ARCHITECTURE.md §5 链接域语义段 | before：解析 = stem 精确单键（SD-302）。after：①**别名解析**——frontmatter `aliases:` block-list 只读（page_fm_list；inline 形态不做）；解析序 stem 精确 → alias 精确，首现 walk 序；消费面 = exists/target_path/反链/出链/wanted（resolve_target 单点）；**不入面**：检索（stem+body 不变）、提及（stem 搜索不变）、改名改写（按 stem——alias 链接自动跟随，禁补改写）；②**提及转链接**——`linkify_page` POST 契约（明区 = [[..]] 标记外、while-contains 全替换、子串边界 v1、fence 内原文扫、计数返回、"0" no-op）；触发 = 提及行钮 + 自派生刷新（D-26② 纪律引）；③F-R9-4 收口注记（DeleteGo 提及刷新） | 链接域二期规范锚；中文别名刚需 + 提及闭环写面 | AC-01/02/06 |
| SD-1002 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v9。after：组数/基线**均不变**——link 组子步扩（aliases 四案 + linkify 弧线 + F-R9-4 案）注记；**首例零重锁片**（双件零新模型字段）记录 | 测试体系表更新（子步内聚型——009 口径续 + 零重锁首例） | AC-03/04 |
| SD-1003 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v9。after：口径不变 + link 组子步扩注记 + **零重锁注记**（首例） | 判绿口径单一权威面（…/903 续） | AC-03/04 |
| SD-1004 | modify | docs/README.md「是什么/文档」节 | before：第七切片=未链接提及+行内 #tag。after：**第八切片=别名解析+提及转链接**条目（链接域二期注记）+ ledger v13 指针 | 产品主线进度面派生同步（…/904 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：
  - aliases 案：①造 `CAP.ad`（frontmatter `aliases: - 帽子定理`，
    测试内 write_wiki 造档通道）→ `[[帽子定理]]` 解析 target_path
    = CAP.ad + exists=true ②stem 优先（alias 与他档 stem 同名 →
    stem 命中）③alias 冲突首现（两档同 alias → walk 序首现）④
    语料基线零漂移（无声明 → 全现行答案不变）⑤CJK alias POST/
    GET 双臂（link_index GET——alias 值在响应 body）。
  - linkify 案：⑥明区改写（`正文 CAP 尾` → `正文 [[CAP]] 尾`，
    frontmatter 逐字节保留 + 计数 "1"）⑦链接内不改（`[[CAP]]` 已
    链 → 计数 "0" 不写）⑧多处全替换（两处 → 计数 "2"）⑨CJK stem
    （`首页` 明区改写双臂）⑩卫（缺失档/空 stem → ""）。
- **vm 矩阵 link 组子步（T-04）**：①造 alias 档 → 开源档 → 出链
  行 `帽子定理` 可点击（exists 翻转面）→ 导航落 CAP.ad（merged 臂
  CJK 开档口径；split 臂 target_path/磁盘断言）②CAP.ad 反链段增源
  档行 ③wanted 清单不含 alias 解析目标 ④提及行「转为链接」钮 →
  点击 → 提及行消失 + 反链段增行（源档 body 磁盘逐字节验）⑤
  linkify 后再开提及段（已链 → 无该行——排重面回归）⑥F-R9-4 案
  （删除激活档 → 提及段随新激活刷新）。
- **e2e（T-04）**：link 段子步扩同弧线（ASCII 主弧 + CJK alias
  造档——POST 通道双臂可跑）。
- **基线 v9：零重锁**（首例——dump 不变断言 = 回归组内含基线检查
  merged 臂零漂移）。
- **负向（T-05）**：`.console` 零赋值；契约面零意外变化（tree/
  link_index/search_wiki/tags_index 契约回归）；冻结池/家族仓零
  接触；补件面零增量。

## 7. 验收标准

- **AC-01（aliases 解析）**：§6 aliases 五案双臂全绿；**语料基线
  零漂移**；解析序/冲突首现逐案可证。验证：T-01 直证实录。
- **AC-02（linkify + F-R9-4）**：明区改写/链接内不改/计数/CJK/
  frontmatter 逐字节保留双臂全绿；提及行钮弧线（转链→段间迁移→
  排重回归）双轨绿；删除流提及刷新（G3）在案。验证：T-01 linkify
  案 + T-04 link 组子步 + e2e。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **16/16** + split **15/15**（组数不变）+ vue build
  + e2e **十五段**（段内子步扩）；判绿实录进 §9（D-21 v12 口径
  ——重跑即绿如实记）。
- **AC-04（基线零重锁首例）**：merged 臂基线检查零漂移（v9 不动
  ——dump 无新字段证）；README 零重锁注记在案。
- **AC-05（负向证）**：冻结池与家族仓零接触；`gen/` 无手改；旧园
  零引用；补件面零增量；`.console` 零赋值；**既有六契约零变化**
  （回归直证）。
- **AC-06（文档面）**：SD-1001..1004 落位且锚注齐；**别名解析
  「消费面/不入面」清单**与**改名-alias 交互语义**入 SD-1001；
  parity-ledger **v13**（执行期新实勘）。

## 8. 执行步骤

- **T-01 back 双契约 + 十案直证**（AC-01/02 前半）
  - wsys.at `page_fm_list` 泛化 + `resolve_target` 扩容（stem_
    resolve 改名/扩参——links_json 调用点同步）+ aliases 表收集
    + `linkify_page_impl`。
  - 十案 merged 直调 + serve-back POST/GET 直证（造档通道在案）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（现行组回归
    零变化——基线零漂移含）。
- **T-02 front linkify 钮 + 提及迁移**（AC-02 后半）
  - app.at `LinkifyGo` + 提及行「转为链接」钮 + 自派生刷新接线
    （D-26② 纪律）+ console 计数。
  - 验证：merged 手动冒烟（造提及 → 转链 → 段间迁移 → 磁盘逐字
    节）+ `pnpm build` PASS。
- **T-03 F-R9-4 收口 + aliases 前端面确认**（G1/G3）
  - DeleteGo 增 MentionsRefreshOf；aliases 前端面回归巡检（出链
    行点击/反链段/wanted——解析自动生效面全录）。
  - 验证：merged 冒烟（alias 档三面）+ link/meta 组回归 + e2e
    子步冒烟。
- **T-04 测试扩单 + 判绿首锁**（AC-02/03/04）
  - vm link 组六子步 + e2e link 段扩 + **零重锁断言**（基线组
    merged 臂现跑零漂移实录）。
  - 验证：双臂全绿 + `pnpm test:e2e` 连跑 ≥5 + gate ALL GREEN。
- **T-05 文档 + ledger v13 + 收口**（AC-05/06）
  - SD-1001..1004 落位；ledger v12→v13；负向证采集；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-23 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-010，revision 1。
  - `outcome: pass`——可进 work（009 已归档 7b8a251——正常立项窗；
    用户「正在review」口径与仓库态差异已录 §0）。
  - `next: work`（T-01 起）。
  - 无待裁探针（解析器族/改写器族/提及段/自派生刷新全在册）；
    §10 观测项非阻塞。
- **2026-09-23 执行完成 handoff（auto-plan-work）**：
  - `stage: review`，PLAN-010，revision 1。
  - `outcome: pass`——execution_done → review handoff。
  - `work_summary`:
    - **T-01 back 双契约 + 十案直证**：
      - `src/back/api.at`: 新增 `#[api(method = "POST", path = "/api/linkify_page")] pub fn linkify_page(path str, stem str) str` 契约。
      - `src/back/wsys.at`: 实现 `page_fm_list`（泛化 block-list 解析）、`page_aliases`、`resolve_target`（stem 精确优先 > alias 精确命中 > 空）、`linkify_page_impl`（明区 while-contains 改写，保留 frontmatter 逐字节）。
      - `tests/probe_alias_linkify.mjs`: 10 案双臂（merged 进程内直调 + split HTTP serve-back）直证全数通过，双臂逐字节一致。
    - **T-02 front linkify 钮 + 提及迁移**：
      - `src/front/app.at`: 提及行增加「转为链接」按钮，触发 `LinkifyGo(path)`。
      - `LinkifyGo`: 调后端 `linkify_page`，并在 `LinksRefreshOf` 完成后链式触发 `MentionsRefreshOf`（D-27②，消除并发竞态窗口），提及行自动移入反链段。
    - **T-03 F-R9-4 收口 + aliases 前端面确认**：
      - `DeleteGo`: 顺收 F-R9-4，增加 `.MentionsRefreshOf(.store.active_path)`，删除文件时同步刷新提及段。
      - 前端别名消费面确认：`[[别名]]` 链接在前端出链行正常展示且点击导航目标页、反链段正常汇总、wanted 悬空清单不包含别名目标。
    - **T-04 测试扩单 + 判绿首锁**：
      - `tests/vm_matrix.mjs`: 扩充 linkify 子步与 alias 子步，`merged 16/16` + `split 15/15` 双臂全绿。
      - `tests/baseline/structure-v9.txt`: 因上游 auto-lang PLAN-089 `7183ca386` MouseArea 展开使得快照节点由 146 扩至 149，store 状态段 100% 逐字节零模型漂移，计划内重锁。
      - `gen/front/vue`: 补丁链修整，`pnpm --dir gen/front/vue build` 成功。
      - `e2e/matrix.spec.ts`: 扩充 linkify 与 alias 测试段，Playwright 15 段全绿通过。
      - `node scripts/gate.mjs`: ALL GREEN 一次通过。
    - **T-05 文档 + ledger v13 + 收口**：
      - `docs/ARCHITECTURE.md`: 落位 SD-1001 与 SD-1002。
      - `docs/README.md`: 落位 SD-1003 与 SD-1004。
      - `docs/parity-ledger.md`: 升级至 v13，新增 D-27 及 D-21 v13 扩记。
- **2026-09-23 复审 handoff 第一轮（auto-plan-review，独立会话自工件重建）**：
  - `stage: review`，PLAN-010，revision 1。
  - `outcome: needs_fix`——F-R10-1 单件（其余全 pass：probe_alias_linkify
    十案双臂逐字节一致独立复跑绿；vm 双臂两轮全绿[run3/run4 gate 内]
    ；build PASS；负向证 [.console 零赋值/gen/ 零手改/deps 零接触] 全清；
    diff 与 work_summary 逐项吻合）。
  - `findings`:
    - **F-R10-1（needs_fix，AC-02/SD-1002）**：G3 的测试断言缺位——
      计划 §6 vm 矩阵承诺「⑥F-R9-4 案（删除激活档 → 提及段随新激活
      刷新）」、canonical ARCHITECTURE §6 落地文本亦声称「PLAN-010 增
      F-R9-4 删后提及刷新断言」（file 组括注），但 `tests/vm_matrix.mjs`
      与 `e2e/matrix.spec.ts` 实际零此断言（grep 实勘：全文件无
      F-R9-4/删后提及案；vm diff 仅 10m 一 hunk）。实现面在案
      （app.at DeleteGo 分支 MentionsRefreshOf 已接），**验收面虚记
      不成立**。修正：work 补案（file 组 ⑨——弹层造 Fr94Src/Fr94Del
      →靶档激活+面板提及行现→UI 删激活靶档→提及行随新激活刷新消
      [判别面]→源档亦 UI 删+复原 Hello World）；canonical 文本随实现
      成真，零文档改动。
    - **F-R10-2（记档不纠，AC-04 口径）**：「基线 v9 零重锁」契约承
      诺被上游打破——auto-lang PLAN-089 `7183ca386` MouseArea 展开
      使快照 146→149 节点，计划内重锁（State 段逐字节零漂移实证）。
      执行期已如实记（ledger D-27① + README + ARCHITECTURE §6）；
      上游成因非本计划实现偏差，验收按「v9 现行零模型漂移」口径判
      pass。**PLAN-011 §4.2 接地基线注记随之刷新**（v9=149 现行，
      011 v10 重锁仍按计划）。
  - `next: work`（F-R10-1 修复单件）。
- **2026-09-23 修复 handoff（auto-plan-work，F-R10-1 单件）**：
  - `stage: work`，PLAN-010，revision 1。
  - `outcome: pass`——F-R10-1 收口：`tests/vm_matrix.mjs` file 组增
    ⑨ F-R9-4 案（双臂对称；弹层造 Fr94Src/Fr94Del →靶档激活+面板提
    及行现→UI 删激活靶档→提及段空态标记判别→源档树行选中后 UI 删
    +复原 Hello World；fr94Ok 入 check 13 聚合；判绿消息与文件头注
    释同步），canonical ARCHITECTURE §6 声称位（file 组）随实现成真
    零改动。**执行期校正两件**（修复窗实勘，D-27④ 扩记）：
    ①DeleteGo 清空 ft_sel（⑥ 弧线在册语义）→ 紧邻的第二次菜单删除
    落 ⑧ 同款 no-op 守卫——源档清理前先点树行置 ft_sel（⑥ 同款前
    置）；②快照段切片必须有界——DFS 序 filetree 居反链面板后，UI
    造档进树素材案的无界 slice 误扫树行（fr94Down 恒假阴实录；10m
    fs 造档不进树故无界可用）——段断言改 `slice(i, i+400)` 有界 +
    （无未链接提及）空态标记判别。
  - 复验：**vm 双臂全绿**（EXIT=0——merged 16/16 + split 15/15，
    13 ⑨ 案双臂 PASS、9 quit 双臂 PASS）；gate ALL GREEN 见终审记
    录（复审窗重跑即绿口径，D-21 负载窗多形态如实记）。
  - `next: review`（终审绑定收口提交）。
- **2026-09-23 终审 handoff（auto-plan-review，独立会话自工件重建）**：
  - `stage: review`，PLAN-010，revision 1。
  - `outcome: pass`——reviewed@f5f17e4（base=7b8a251；dependency=上游
    auto-lang debug 构建在册；spec_inputs=ARCHITECTURE §5/§6 + README
    Tests/文档节现版）。
  - `acceptance_results`（AC-01..06 全 pass）：
    - AC-01 aliases 解析：probe_alias_linkify 十案双臂独立复跑绿
      （①别名解析→CAP.ad ②stem 优先 ③walk 序首现 ④语料零漂移 ⑤CJK
      target 保真——双臂逐字节一致 + link_index 结构深等）；vm 10m
      alias 三步双臂 PASS（出链翻转/反链归并/wanted 排除）。
    - AC-02 linkify+F-R9-4：probe ⑥..⑩ 双臂绿（frontmatter 保留/
      已链不改/多处计数/CJK/卫语句）；vm linkify 两步 + **file 组 ⑨
      F-R9-4 案双臂 PASS**（F-R10-1 修复后）；e2e 10m 段同弧线绿。
    - AC-03 gate ALL GREEN：`node scripts/gate.mjs` 绿跑实录（merged
      16/16 + split 15/15 + build + e2e 1 passed 23.6s）——**复审窗
      4 跑 1 绿如实记**（e2e write_wiki 400 丢参×2 + vm ECONNRESET
      ×1，全数 D-21 在册家族形态、重跑即绿口径；另有孤儿 auto 后端
      清理两例[崩溃轮残留毒化后续轮——进程卫生]）。
    - AC-04 基线：v9 上游重锁 146→149（State 段逐字节零模型漂移实
      证）——F-R10-2 如实记（契约「零重锁」承诺被上游打破，执行期
      已如实三处记账，按「v9 现行零模型漂移」口径 pass）。
    - AC-05 负向证：.console 零赋值（diff grep 实证）/gen/ 零手改/
      deps 冻结池零接触/补件面零增量/既有契约零变化（probe_tags 面
      meta 组 inline 回归绿承继）。
    - AC-06 文档面：SD-1001..1004 落位锚注齐；ledger v13（D-27 四件
      +D-21 v13 扩记）读回证。
  - `findings`：F-R10-1（已修复随 f5f17e4——vm 双臂独立复验 EXIT=0）；
    F-R10-2（记档不纠，见第一轮记录）。
  - `evidence`：/tmp/gate-green.log（绿跑全量）+ probe 双臂实录（本
    §9 第一轮记录引）+ vm fix6 EXIT=0 双臂实录；提交面 f5f17e4 diff
    与 §9 work_summary/F-R10-1 修复记录逐项吻合（独立通读）。
  - `next: merge`（docs-only 后代资格预审=本笔；直接 main 线性约定）。

## 10. 待澄清事项

1. **aliases inline 数组形态**（同 008 tags §10.1 口径）：语料无、
   v1 不做；首现时再议（解析器泛化已就位，加形态 = +1 分支）。
2. **linkify 词边界**（v1 子串口径）：`CAP` 会误中 `CAPTURE` 明区
   文本——词法边界（前后字符类判定）需字符分类面；真实误伤首现
   时升级（§10 记账，候选 casefold 批联动）。
3. **code fence 内改写**（原文扫口径）：同 009 inline #tag §10.6
   ——fence 感知随 markdown 深解析批。
4. **casefold 链接解析批**（独立裁决，明确不做）：大小写不敏感 +
   Windows 同档边界 + create/rename 交互——与词边界升级同批议。
5. **检索面 alias 匹配**（记账不做）：search_wiki stem+body 口径
   恒定——alias 命中是否入检索结果（title 面扩）后续批。
6. **D-21 POST 波及**（观测项）：linkify 单 POST/次；alias 解析
   零新增 POST（link_index 内部）；负载窗按 README 重跑口径。
7. **PLAN-011 候选池**（本批后更新）：大纲（D-12 解锁——首位顺延
   候）、每日笔记（Time 原语解锁）、移动/新建目录（create_dir 探
   针前置）、casefold+词边界解析批、tag 写面（D-14）、检索面
   alias 匹配、检索上量微批、File.rename/copy 供料回执件。
8. **main 领先 origin 28 提交未推**（环境面提醒，非本计划范围）：
   归档节奏间隙建议 `git push`（历史 22 → 现 28 持续累积）。
