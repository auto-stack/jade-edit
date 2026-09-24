---
plan_id: PLAN-013
status: executing
feature_name: display-title-slice
author: [zhaopuming]
created_at: 2026-09-24T08:14:24+08:00
updated_at: 2026-09-24T12:10:00+08:00
plan_revision: 1
current_step: 3
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1301"
  - "docs/ARCHITECTURE.md#SD-1302"
  - "docs/README.md#SD-1303"
  - "docs/README.md#SD-1304"
touched_goals: []
---

# [PLAN-013] 知识库第十一切片——显示名（frontmatter title 消费首开 + 属性弹层 title 编辑）

> 预立项注：本计划起草于 PLAN-012 复审窗（012 execution_done@41a3bce
> 收口补记，status=reviewed 流程中）——接地基线 = 012 执行态（gate
> ALL GREEN + 基线 v11 + ledger v15/D-29）。**work 启动前提 = 012
> 归档**（单写者主线）；012 复审返工涉共享面（弹层族/刷新族/EXPLORER
> 锚）则本计划 r2 跟随（§10.6）。

## 0. 变更摘要

SD-301/SD-405 主线第十一片：**显示域首开——frontmatter `title` 消费
+ 编辑**（候选池「title 键编辑（消费面联动）」兑现——011 裁定「title
独立批」的独立批即本片）：

- **两域边界定文（规范核心）**：SD-302 链接**解析域** title 不参与
  （stem 精确匹配——`[[首页]]` 对 index.ad 仍悬空，**零变化**）；
  本片首开**显示域**——`title` 键作为**显示名**消费：**有 title 显示
  title、无 title 显示 stem**。中文工作流双件套后半兑现：英文/拼音
  文件名 + 中文显示名（与 aliases 010/011 配套——Obsidian 中文社区
  标准形态）。
- **back**：`page_fm_value(fm, "title")` 单行值解析器（page_fm 家族
  第三件）→ link_index 页对象**增量字段 `dtitle`**（title=stem 链接
  域语义不动——wsys.at:318-320 注记在案；dtitle 缺省 = stem）；
  `page_meta`/`set_page_meta` **title 键扩**（011 双键 → 三键——
  D-14 受控面扩容，fm_set_block 引擎复用）。
- **front 显示面四面**：tab 条标题 / EXPLORER 树行 / 快开行 / 检索
  行——`dtitle_of(titles, path, fallback)` 纯函数显示期覆盖（**store
  tabs.title 恒 stem**——基线 dump 零扰动；显示期映射 = 零新状态面
  原则）；链接面板行（反链/出链/提及/wanted）**保持 path 文本**（身
  份可读域——v1 不动，§10.3 留口）。
- **属性弹层第三 input**（title——011 弹层扩容，D-28② fetch 型预填
  竞态面同乘沿用 011 接受口径）。

上游缺口适配内置：D-19（set_page_meta POST）；D-20②④⑤；D-24③④⑤；
D-25①；D-26②/D-28②（预填竞态 = 011 口径沿用）；**D-29③ 弹层钮
标题锚纪律**（「保存」钮——「页面属性」标题唯一锚沿用）。

## 1. 目标

- **G1（显示名四面可用·双轨）**：语料档 `index.ad`（title=首页）——
  tab 标题/树行/快开行/检索行显示 **首页**（stem=index 仅存于路径/
  身份面）；无 title 档（`Hello World.ad`）四面显示 stem（现状零
  变化）；**`[[首页]]` 链接解析仍悬空**（两域边界断言——解析域零
  变化）。
- **G2（title 编辑可用·双轨）**：属性弹层（Ctrl+I）增第三 input
  「标题」（预填回显当前 title/空）→ 保存 → 磁盘受控改写（三键面）
  → 四面显示即时刷新（titles 表随 LinksRefreshOf 派生——011 流复
  用）；清空 title → 显示回落 stem；取消零落盘。
- **G3（back 契约扩容）**：link_index 页对象增 `dtitle`（缺省 =
  stem——**纯增量**，既有消费者零感知回归）；`page_meta` 三项/
  `set_page_meta` 三参（title/tags/aliases）——十案双臂直证（含
  011 十案全量回归——契约扩不破旧）。
- **G4（测试面）**：子步内聚四面（boot/tree 组树行、tab 组标题、
  find 组快开检索行、meta 组 title 编辑弧线）——**组数不变
  16/15/十五段**；基线 **v12** 计划内重锁（App titles 表 +
  meta_q_title + 弹层第三 input id 序列；store tabs.title 恒 stem
  零扰动注记）。
- **非目标**（明确排除）：
  - **解析域 title 参与**（`[[显示名]]` 解析/检索 title 匹配面 = stem
    ∪ aliases 口径不变——title 键**不进任何匹配面**，两域边界 SD-1301
    定文）；
  - 链接面板行显示名化（反链/出链/提及/wanted 行保持 path——身份
    域 v1；显示名化后续 UX 批 §10.3）；
  - title 里的 wikilink/富文本（纯文本值）；
  - 建页模板带 title（create_page 模板 `# {target}` 不变——新建档
    显示=stem，title 属属性弹层后置编辑面）；
  - 每档 title 唯一性校验（显示名可重名——身份恒 path，无冲突面）；
  - 大纲（D-12）、每日笔记+时间戳（Time）、删除/重命名目录（目录面
    二期）、casefold+词边界批、检索上量微批、上游件实做与生成物
    补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十一片是显示名）

- **候选池对表**（PLAN-012 §10.7 在案 + ledger v15 实核）：大纲
  （D-12 原样——**连续五片门控**）、每日笔记+时间戳（Time 原样）、
  删除/重命名目录（目录面二期——管理件低频）、casefold+词边界
  （裁决重可见价值低）、**title 键编辑（本批）**、检索上量（未
  触发）、供料回执（上游未动）。北标口径（SD-405）：长期 Obsidian
  线——**显示名是中文知识库第二刚需**（英文/拼音 stem 保链接与
  文件系统稳健 + 中文显示名保可读性；aliases 解决「怎么链接它」，
  title 解决「怎么显示它」——010/011 与本片构成中文工作流完整
  件套）；语料自带已知答案（index.ad title=首页——SD-302 悬空判
  例的正面显示面素材）。
- **形态复用度**：back = page_fm 家族第三件（单行值解析器——
  block-list 的退化形）+ link_json walk 增量字段 + 011 契约扩参 +
  fm_set_block 引擎原样（title 为单行值形态——键行改写变体）；front
  = 显示期纯函数覆盖（computed 族已有 flatten_tree 先例）+ 011 弹层
  扩容。**零新 UI 形态、零新面板、零新刷新触发**（titles 随
  link_index 派生——v5 触发集零扩）。

### 2.2 数据面（back：增量字段 + 契约扩参）

```rust
/// 页面元数据读（三项——title/tags/aliases；title 为单行值形态）
/// GET /api/page_meta?path=..
#[api(method = "GET", path = "/api/page_meta")]
pub fn page_meta(path str) str {
    return wsys.page_meta_json(path)
}

/// 页面元数据受控写（三键——title/tags/aliases；D-14 受控面扩容）
/// POST /api/set_page_meta
#[api(method = "POST", path = "/api/set_page_meta")]
pub fn set_page_meta(path str, title str, tags str, aliases str) str {
    return wsys.set_page_meta_impl(path, title, tags, aliases)
}
```

- **link_index 增量**：links_json 页对象 `{"path","title","links"}`
  → `{"path","title","dtitle","links"}`——`dtitle = page_fm_value
  (fm, "title")`（空 = 缺省 stem）；**title 字段语义不动**（链接域
  stem——:318-320 注记裁定在案）。消费者回归：backlink_rows_of/
  outlink_rows_of/wanted/mentions 均不读 dtitle（front 新消费）。
- **page_fm_value(fm, key)（新第三件）**：行扫描定位 `key:`（顶层级
  trim 同 page_fm_list）→ **单行值** = 冒号后段 trim → **引号壳剥
  离**（首尾 `"` 对——ASCII 检查 slice 安全；语料无引号形态、旧园
  `title: "X"` 兼容）→ 空值返回 ""；无键 ""。
- **fm_set_block 扩形（title 单行键）**：键行改写 = 键行整行替换
  （`title: 新值`——**无项行块**；删键 = 键行删）；其余键/tags/
  aliases 逻辑逐字节不变（011 引擎原样——title 走独立分支）。
- **set_page_meta 契约扩参**（+title 首参——**签名变更**，唯一
  消费者 front 同批改；旧两参调用不存在[011 单消费者实核]；契约
  修订注记入 SD-1301——house 首例契约签名扩，评审面重点）。
- **幂等/不变式**：011 七则全量继承（其余键逐字节/CRLF/键序/幂等）
  ——title 案增量并入直证。

### 2.3 消费面（front：显示期覆盖四面 + 弹层扩容）

- **App 模型**：`titles` List（path→dtitle 映射行——LinksRefreshOf
  派生段顺产：`titles_rows_of(link_pages)` 纯函数）+ `meta_q_title`
  str（弹层第三 input）。
- **显示期纯函数**：`dtitle_of(titles List, path str, fallback str)
  -> str`——while 扫描命中返 dtitle（dtitle=="" 返 fallback——
  缺省即 stem）；四面接线：
  - **tab 条**：`text: dtitle_of(.titles, t.path, t.title)`（t.title
    = stem 恒——store 零改动）；
  - **树行**：`text: dtitle_of(.titles, r.id, r.label)`（r.id =
    相对路径——ft_rows label 恒文件名）；
  - **快开行**：file_rows_of 行文本 path → `dtitle_of(.titles,
    r.path, r.path)`（fallback = path——身份可读）；
  - **检索行**：`dtitle_of(.titles, r.path, r.title)`。
- **属性弹层第三 input**：「标题」位（标签/别名之上——title 语义
  位首）；`.MetaOpen` 预填三值（page_meta 三项——D-28② 同乘：011
  fetch 型预填竞态窗接受口径沿用，测试侧 toHaveValue 落定等待）；
  `.MetaGo` 三参 fetch。
- **刷新**：titles 表随 LinksRefreshOf 顺产（link_pages 解析后追加
  `.titles = titles_rows_of(...)` 一行——v5 触发集零扩）；四面
  computed/渲染随之反应。
- **rename/move/create 联动（语义注记入 SD-1301）**：改名 = stem
  变、title 不变 → 显示不变；移动 = path 变 → titles 表随刷新重
  键（path 键）；新建档无 title → 显示 = stem。**title 编辑不改
  stem** → 链接网零扰动（与改名对照——解析域无感）。

### 2.4 键位/菜单面

零新增（title 编辑 = 属性弹层内；显示面无入口）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-24 会话口述：「计划12已经完工，正在review中；可以
  提前规划 [$auto-plan-new] 下一个计划吗？」——**预立项授权**：
  012 复审窗内起草 PLAN-013（接地基线 = 012 执行态 41a3bce；复审
  耦合 §10.6）。方向选择（显示名）= 候选池对表 + §2.1 依据；
  handoff 未否决即生效（PLAN-004..012 同款约定）。
- **work 启动前提**：PLAN-012 归档（单写者主线）；本计划保持
  drafting 至彼时。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓实读，2026-09-24 @ main 41a3bce）

- **两域边界在案裁定**：wsys.at:314-320 links_json 头注——「title =
  文件 stem（旧园 links.rs rebuild 同语义：title = file_stem，非
  frontmatter title——[[首页]] 对 index.ad = 悬空）」——SD-302
  解析域裁定；本片显示域 = **新面**，两域并表防混淆（SD-1301 核心
  规范工作）。
- **语料已知答案**：index.ad `title: 首页`（frontmatter 实读）——
  四面显示 首页 / 路径与解析仍 index；Tasks.ad `title: Tasks`/
  Projects.ad `title: Projects`（=stem——无变化面）；`CAP 定理.ad`
  `title: CAP 定理`（=stem 同）；Hello World.ad 无 title（fallback
  面）。CJK 显示名弧线素材 = 属性弹层编辑中文 title（POST 双臂）。
- **在册复用件**：page_fm 家族（008 page_tags → 010 泛化 → 011
  page_fm_list——page_fm_value 第三件单行值退化形）；fm_set_block
  引擎（011——title 单行键分支）；属性弹层（011 第六实例——第三
  input 扩容）；LinksRefreshOf 派生段（titles 顺产挂点）；dtitle_of
  与 flatten_tree/computed 族先例（显示期纯函数——ft_rows 同形）；
  D-29③ 标题锚纪律（「页面属性」标题唯一——保存钮定位安全）。
- **契约签名扩先例评估**：set_page_meta 011 落地——**唯一消费者
  front**（api.at 契约 + app.at 调用点实核；probe_page_meta 直证
  脚本同批扩参）；签名变更 = 本仓自有契约 pre-1.0 修订（AC-05 回归
  面含 probe 旧案全量）。
- **基线**：v11 现行（012）；**v12 变更面** = App titles/meta_q_
  title + 弹层第三 input id 序列；**store 零扰动**（tabs.title 恒
  stem——dump 不变注记）。
- **D-12/Time**：ledger v15 原样（连续五片门控——§2.1 对表如实）。

### 4.3 与既有计划的关系

- 承接 PLAN-011（D-14 受控面两键 → 三键；弹层/引擎复用）+ PLAN-010
  （中文工作流件套前半 aliases）——本片后半 title；PLAN-012 检索
  alias 行显示面随 titles 表升级。
- 与 SD-302 关系：解析域零变化（断言面）+ 显示域新增——两域边界
  定文入 SD-1301（canonical 首次并表）。
- D-12/Time 供料留观不变；D-28② 竞态面沿用 011 口径（不扩大）。
- PLAN-014 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  每日笔记+时间戳补写（Time 解锁——双件联动）、删除目录+重命名
  目录（目录面二期）、casefold+词边界批、链接面板行显示名化（本片
  §10.3 后续）、检索上量微批、File.rename/copy/create_dir 供料回执
  件、上游快照/HTTP 面回执批。

## 5. 详细设计

### 5.1 back 扩容（SD-1301）

```
fn page_fm_value(fm str, key str) str {
    // 行扫描：trim 后以 key+":" 起 → 值 = 冒号后段 trim → 引号壳
    // 剥离（首尾 " 对——starts_with/ends_with ASCII 安全）→ 空返 ""
}

// links_json 页对象装配段：+ "dtitle":"…"（page_fm_value(fm,"title")
//   空 → 值 = stem——缺省即 stem 口径；title 字段原样 stem）

// fm_set_block title 分支：单行键——键行整行替换/删；无项行块

// page_meta_json 三项装配；set_page_meta_impl 四参（title 首参）
```

### 5.2 front 接线（SD-1301）

- app.at：模型 titles/meta_q_title；`titles_rows_of`/`dtitle_of`
  纯函数；四面显示期覆盖（§2.3）；属性弹层第三 input + 预填三值 +
  `.MetaGo` 三参；LinksRefreshOf 派生段顺产 titles。
- ⚠ handler 零 `.console =` 赋值（D-25①）；四面渲染 fn 调用 = 纯
  函数（computed 族先例——无新状态面）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1301 | modify | docs/ARCHITECTURE.md §5 | before：title 键零消费（SD-302 解析域不参与 + 零显示面）；属性受控面 = 两键（SD-1101）。after：增「显示域（title）」子段——**两域边界定文**（解析域 title 不进任何匹配面[stem∪aliases 恒定] / 显示域 title = 显示名[有 title 显 title、无显 stem]）；link_index 页对象 `dtitle` 增量字段（缺省 stem——title 字段链接域语义不动）；`page_fm_value` 单行值解析器（引号壳剥离）；`page_meta`/`set_page_meta` **三键扩**（签名扩参注记——pre-1.0 契约修订首例记录）；显示面四面（tab/树/快开/检索——显示期覆盖，store 零状态面）；面板行 = path 身份域 v1；rename/move/create 联动语义注记（title 编辑零链接扰动） | 中文工作流后半件 + 两域边界 canonical 并表 | AC-01/02/03/06 |
| SD-1302 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v11。after：组数**不变**（四面子步入 boot/tree/tab/find/meta 各组——域内聚）+ **基线 v12**（App titles/meta_q_title + 弹层第三 input；store 零扰动注记；v11 留档） | 测试体系表更新（009..012 子步内聚口径续） | AC-04 |
| SD-1303 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v11。after：口径不变 + 四组子步扩注记 + 基线 v12 指针 + N 定谳续记 | 判绿口径单一权威面（…/1203 续） | AC-04 |
| SD-1304 | modify | docs/README.md「是什么/文档」节 | before：第十切片=目录面+检索 alias。after：**第十一切片=显示名（title 消费+编辑）**条目（中文工作流件套收口注记 + 两域边界一句）+ ledger v16 指针 | 产品主线进度面派生同步（…/1204 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：①dtitle 增量（语料 index.ad →
  dtitle=首页、title=index 双字段并存；无 title 档 dtitle=stem）②
  page_fm_value（无键/空值/引号壳 `title: "X"` 剥离/CJK 值）③
  set_page_meta title 写（新增/改写/删除回 stem）④其余键逐字节
  （title 写后 tags/status 零扰动）⑤CRLF 保真 ⑥幂等 ⑦三键同写
  ⑧CJK title POST 双臂 ⑨**011 十案全量回归**（契约扩参后旧语义
  零漂移）⑩link_index 消费者回归（dtitle 增量零感知——backlink/
  outlink/wanted 派生函数旧断言全绿）。
- **vm 矩阵（T-04）**：①boot/tree 组：树行 index → 显示 首页（
  快照文本断言）；Hello World → stem ②tab 组：开 index.ad → tab
  标题 首页（state 恒 stem[index.ad]——dump 断言 + 渲染断言两证）
  ③find 组：快开输入 index → 行显示 首页；检索「首页」→ 语料
  body 命中行显示 dtitle ④meta 组：属性弹层第三 input 预填（index
  档 → 首页）→ 改「首页日志」→ 保存 → 四面刷新（tab/树/快开/检索）
  + 磁盘 title 行受控改写（逐字节 diff 仅 title 行）⑤清空 title →
  四面回落 stem ⑥**两域边界**：`[[首页]]` 出链行仍悬空（index.ad
  的 dtitle 变化零影响——解析域断言）⑦取消零落盘。
- **e2e（T-04）**：同弧线（真 DOM 四面 + 弹层 fill——D-28② 预填
  落定等待口径沿用；CJK title POST 双臂）。
- **基线 v12（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v11 留档。
- **负向（T-05）**：`.console` 零赋值；**store tabs.title 恒 stem**
  （dump 无显示名污染——基线零扰动专项）；既有契约零意外变化
  （probe 全族回归——含 012 probe_dir_move/probe_alias_linkify）；
  冻结池/家族仓零接触；补件面零增量。

## 7. 验收标准

- **AC-01（back 扩容）**：§6 十案双臂全绿（含 011 十案回归零漂移）；
  dtitle 增量形状逐字节；title 单行键改写受控。验证：T-01 直证。
- **AC-02（显示名四面双轨）**：四面显示/回落/编辑刷新/取消，vm
  snapshot+state 与 vue e2e 同断言域全绿；**store tabs.title 恒
  stem**（基线零扰动专项断言）。验证：T-04。
- **AC-03（两域边界）**：解析域零变化断言（`[[首页]]` 悬空面 +
  检索 title 匹配面 stem∪aliases 口径不变——probe 回归）在案。
  验证：T-01 ⑩ + T-04 ⑥。
- **AC-04（gate ALL GREEN + 基线 v12）**：`node scripts/gate.mjs`
  顺序全绿——vm merged **16/16** + split **15/15**（组数不变）+
  vue build + e2e **十五段**；基线 v12 重锁零漂移（v11 留档）；判绿
  实录进 §9（D-21 v15 口径——重跑即绿如实记）。
- **AC-05（负向证）**：冻结池与家族仓零接触；`gen/` 无手改；旧园零
  引用；补件面零增量；`.console` 零赋值；probe 全族回归（008..012
  五代直证脚本全绿——契约链纯增量证）。
- **AC-06（文档面）**：SD-1301..1304 落位且锚注齐；**两域边界定文**
  与**契约签名扩参注记**入 SD-1301；parity-ledger **v16**（执行期
  新实勘）。

## 8. 执行步骤

- **T-01 back 扩容 + 十案直证**（AC-01/03）✅
  - wsys page_fm_value + links_json dtitle 段 + fm_set_block title
    分支 + page_meta/set_page_meta 三键扩；probe_page_meta 扩参 +
    011 旧案全量回归。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（现行组回归——
    link/find/meta 三组重点）。
- **T-02 front 显示面四面**（AC-02 前半）✅
  - App titles 表（LinksRefreshOf 顺产）+ dtitle_of 纯函数 + 四面
    显示期覆盖接线。
  - 验证：merged 手动冒烟（index 档四面 首页）+ `pnpm build` PASS。
- **T-03 弹层扩容 + 编辑弧线**（AC-02 后半）✅
  - 属性弹层第三 input（预填三值——D-28② 口径）+ `.MetaGo` 三参 +
    两域边界冒烟（编辑 title 后 `[[首页]]` 仍悬空）。
  - 验证：merged 冒烟（改 title → 四面刷新 → 解析域无感）+ meta/
    link 组回归 + e2e 子步冒烟。
- **T-04 测试扩单 + 基线 v12 + 判绿首锁**（AC-02/03/04）🔄
  - 四组子步 + e2e 弧线 + 基线 v12 重锁 + 两域边界断言固化。
  - 验证：双臂全绿 + `pnpm test:e2e` 连跑 ≥5 + gate ALL GREEN。
- **T-05 文档 + ledger v16 + 收口**（AC-05/06）
  - SD-1301..1304 落位（两域边界 + 签名扩参注记）；ledger v15→v16
    （执行期实勘）；负向证采集（probe 全族五代回归）；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-24 work T-01（back 扩容 + 直证，提交随本记录）**：
  - wsys 五件：`page_fm_value`（单行值解析器——引号壳剥离 ASCII 界切
    安全）+ `fm_line_block`/`fm_set_line`（fm_set_block 单行姊妹件——
    011 块引擎原样不动）+ links_json **dtitle 增量字段**（缺省=stem
    back 侧装配定值）+ page_meta_json 三项（title 位首装配）+
    set_page_meta_impl 三键扩（title 首参——幂等防线三值扩）；api.at
    双契约 doc 同步（签名扩参注记——pre-1.0 首例）。
  - probe_page_meta 扩：011 十案全量带 title 现值（in-place 同字节
    改写——契约扩不破旧）+ title 面五案（改写/删键+删后幂等/尾追/
    三键同写增建 title 位首/引号壳剥离读回）+ 读回装配序断言；
    probe_alias_linkify 扩 ⑪ dtitle 案组五案（index 双字段并存/语料
    同值零变化/无 title 缺省 stem/单行值直读/**⑪e 两域边界并证**
    ——dtitle=首页 在册而 [[首页]] 仍悬空）。
  - 判绿：两探针双臂全绿（011 十案回归零漂移 + 013 新案全过）；
    vm 矩阵窗观察两处**预期中间态**（links_json 态串 dtitle 漂移
    = 基线 v12 重锁面提前显形；meta 组卡死 = front 消费者待换契约
    ——「唯一消费者同批改」归 T-02/T-03 窗口）。
  - `stage: work | PLAN-013 | rev 1 | outcome: pass(T-01) | task=T-01 | next: T-02`

- **2026-09-24 work T-02+T-03（front 四面 + 弹层三 input，提交随本记录）**：
  - app.at：`titles_rows_of`/`dtitle_of` 纯函数族 + 模型 titles/
    meta_q_title（LinksRefreshOf 派生段顺产——触发集 v5 零扩）+ 四面
    显示期覆盖（tab 双分支/树行/快开/检索——面板行身份域不动）+ msg
    MetaEditTitle + 弹层第三 input「标题」（位首——page_meta 装配序
    同源）+ ActMeta 三值预填 + `.MetaGo` 三参（**契约签名扩唯一消费
    者同批改**——D-14 三键面）。
  - `pnpm build` PASS（regen+vue-tsc+vite）。
  - `stage: work | PLAN-013 | rev 1 | outcome: pass(T-02/T-03) |
    task=T-02/T-03 | next: T-04`

- **2026-09-24 work T-04（vm/e2e 扩单 + 基线 v12 + 判绿窗，提交随本记录）**：
  - **执行期校正两件（规范语义面）**：①**stem 显示口径**——back
    dtitle 缺省=stem 装配使无 title 档四面显示 **stem**（fallback
    参数仅 stale 面防御）——§10.3「快开显示完整 path」注记与 G1/
    §2.2/probe ⑪c 冲突，按 G1 stem 口径落定（T-05 canonical 校正）；
    ②**D-30 新立**：vue codegen 对模型名统一发射 `.value`——纯函数
    参数与模型名同名（dtitle_of 首参 titles）→ 参数被误发射 .value →
    undefined 炸（e2e 树空 + pageerror 实勘首例）——参数改名 rows
    消阴影（纪律：纯函数参数避开模型名）。
  - vm_matrix 手术：区域锚 helper 族（EXPLORER 树区/tab 条区[style
    精确锚——toolbar 同族 px-2 后缀消歧]/右面板区[vm col+overflow
    lowering=scrollable 双形态]）+ pressTab/pressTree/pressPanelRow/
    panelRowTexts/panelTexts + 显示名断言面（树行/tab/快开/检索）+
    meta input 序移位（title 位首）+ **meta title 弧线四断言**（预填
    /改写磁盘受控+树行即时刷新/清空删键回 stem 显示）+ **改名显示
    不变语义面**（Project X stale title 'Projects'——SD-1301 联动
    定文直接体现）。
  - e2e 手术：tabBtn 类锚（h-8 px-3）+ panel 区锚（.w-72）+ 显示名
    断言 + meta title 弧线（预填/改写磁盘+tab 即时刷/清空回落）+
    helpers displayTitleOf + **FR-13-1 环境适配**（FRONT_PORT 4181
    → 4443——WinNAT 排除区 4094-4193 新窗 EACCES，F-R8-1 同款）。
  - 判绿实录：**vm 双臂 ALL GREEN**（merged 16/16 多轮含基线 v12
    零漂移逐跑 + split 15/15 首跑绿）；e2e 6 跑——前 3 败为本批
    三 bug（树空=阴影/严格模式/弹层重开）修复后 3 败全 D-21 保存
    点 400 签名（家族会话双进程负载窗实勘——release+debug auto.exe
    并行在跑）；**gate 3 跑**：第 1/2 跑 vm 段 menubar popover 内容
    窗（v11③ 家族——负载窗）×2，第 3 跑 **vm 段过** + build 段撞
    **工具链 schema drift**（D-27① 实锤——家族会话 11:27 重建
    auto-lang debug exe 带新严格校验，deps/bps/dashboard reference
    档[上游件] select/skeleton prop 未声明——非本片代码，依赖面
    阻塞；AC-05 冻结池纪律不触碰）。
  - `stage: work | PLAN-013 | rev 1 | outcome: partial(T-04) |
    task=T-04（vm/e2e/基线面全收口；e2e 判绿+gate ALL GREEN 挂
    D-21 负载窗+工具链 drift——外部条件，重跑口径） | next: T-05`

- **2026-09-24 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-013，revision 1。
  - `outcome: pass`——可进 work，**前提 = PLAN-012 归档**（§0 预立
    项注；复审耦合 §10.6）。
  - `next: work`（012 归档后 T-01 起）。
  - 无待裁探针（page_fm 家族/弹层/显示期纯函数全在册）；契约签名
    扩参（set_page_meta 三参）为评审面重点标注。

## 10. 待澄清事项

1. **链接面板行显示名化**（默认不做）：反链/出链/提及/wanted 行
   保持 path 文本（身份可读 + 与 dtitle 并显的空间窄）；显示名化
   （path 降为次行/悬停）后续 UX 批——本批 §10 留口。
2. **title 编辑与改名的关系**（语义注记已定）：改名改 stem（链接
   域）、title 编辑改显示（显示域）——两弹层并列不合并；「改名即
   改 title」合并交互后续 UX 批（需双写联动裁决）。
3. **快开行 fallback = path**（已随 r1 定）：快开行显示 dtitle、
   无 title 档显示完整 path（非 stem——与现状一致零变化）；统一
   stem 化后续批（快开语境 path 更可辨——维持现状注记）。
4. **D-28② 预填竞态面**（011 口径沿用不扩大）：属性弹层预填三值
   同一 fetch——竞态窗同 011（测试侧 toHaveValue 落定等待）；产品
   侧接受（快速键入被回显覆盖——011 已裁）。
5. **D-21 POST 波及**（观测项）：属性保存单 POST（三参——密度不
   升）；负载窗按 README 重跑口径，ledger v16 如实记。
6. **012 复审耦合**（预立项特有）：012 复审若返工涉共享面（弹层
   族第八实例后序/EXPLORER 锚/LinksRefreshOf 形态）→ 本计划 r2
   重核；pass/merge docs-only 面不触发。
7. **PLAN-014 候选池**（本批后更新）：大纲（D-12 解锁——首位顺延
   候）、每日笔记+时间戳补写（Time 解锁——双件联动）、删除目录+
   重命名目录（目录面二期）、casefold+词边界批、链接面板行显示名
   化、检索上量微批、File.rename/copy/create_dir 供料回执件、上游
   快照/HTTP 面回执批。
