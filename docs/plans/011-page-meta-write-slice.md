---
plan_id: PLAN-011
status: executing
feature_name: page-meta-write-slice
author: [zhaopuming]
created_at: 2026-09-23T16:49:04+08:00
updated_at: 2026-09-23T19:05:00+08:00
plan_revision: 1
current_step: 0
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1101"
  - "docs/ARCHITECTURE.md#SD-1102"
  - "docs/README.md#SD-1103"
  - "docs/README.md#SD-1104"
touched_goals: []
---

# [PLAN-011] 知识库第九切片——页面属性写面（tags/aliases 编辑，frontmatter 受控写首开）

> **双层预立项注**（首例两片提前量）：本计划起草于 **PLAN-010 执行窗
> 内**（010 status=executing@step0，主检出 main@7b8a251）——接地
> 基线 = main 现态 + **PLAN-010 契约 r1 为在飞预期态**（其冻结契约：
> 零新模型字段/组数不变/解析序 stem→alias）。耦合两层：①010 执行
> 若偏离契约（新实勘致实现形态变化）且涉本计划共享面（resolve 面/
> 提及行/刷新族）→ 本计划 r2 跟随；②010 复审 findings 同判。
> **work 启动前提 = 010 归档**（单写者主线约定）。

## 0. 变更摘要

SD-301/SD-405 主线第九片：**frontmatter 受控写面首开（D-14 裁决
收口）**——页面属性编辑器：

- 现状论据：jade 编辑器**只显示 body**（read_wiki 剥 frontmatter，
  SD-301 wiki 域语义）——用户**没有任何 UI 途径维护 tags/aliases**
  （008 tags 读面 / 010 alias 读面只能靠外部文本编辑器喂数据，读面
  价值被写面缺口锁死）。本批以「属性弹层 + 受控改写契约」补上。
- **D-14 受控裁决（默认提案，handoff 可翻）**：v0「frontmatter 逐字
  保留」哲学受控突破——**仅目标键（tags/aliases）改写**、其余键
  **逐字节保留**、值归一 block-list 形态、空值 = 删键、无 frontmatter
  档 = 增建界符段；**时间戳类键（updated_at/created_at）不做**
  （Time 日期原语门控——009 实勘，epoch-only；解锁后另批）。
- back 双契约：GET `page_meta(path)`（裸数组 `[{key,value}]`——
  D-20④ 安全形状）+ POST `set_page_meta(path, tags, aliases)`（界符
  段受控改写引擎——is_delim/body_after_open 家族姊妹件，CRLF 双
  形态保真）。
- front 属性弹层（dialog + 双 input：标签/别名逗号分隔，预填回显）
  → 保存 → 刷新族（tags 面板/链接解析/wanted）。

上游缺口适配内置：D-19（set_page_meta POST——CJK 路径/值常态）；
D-20②④⑤；D-24③④⑤；D-25①；D-26②（自派生纪律）；D-23①
（while-contains 不涉——改写引擎用标记法）。

## 1. 目标

- **G1（属性编辑可用·双轨）**：激活有路径档 Ctrl+I / 菜单「文件→
  页面属性…」→ 弹层（标签/别名两 input 逗号分隔，**预填回显当前
  值**）→ 保存 → 磁盘 frontmatter 受控改写（见 D-14 三原则）→
  弹层关 + tags 面板/链接解析（alias 生效——出链 exists 翻转面）/
  wanted 清单刷新；取消零落盘；untitled 档入口禁用（无路径）。
- **G2（改写引擎字节精度）**：①既有键改写（值归一 block-list）②
  其余键**逐字节保留**（title/status/summary 等任意键）③新增键
  追加（界符段尾、闭合界符前）④空值删键（含键行整删）⑤无
  frontmatter 档增建界符段（`---\n` 起 + body 前）⑥CRLF 档保真
  （改写后行尾风格不变）⑦**幂等**（同值再写 = 逐字节不变）。
  十案双臂直证。
- **G3（读面兑现闭环）**：属性弹层保存 tags → tags 面板新行即时
  可见；保存 alias → `[[别名]]` 出链 exists 翻转（010 解析面即时
  生效——**008/010 两批读面的写面缺口就此闭合**）。
- **G4（测试面）**：meta 组子步扩（属性弧线）——组数不变
  16/15/十五段；基线 **v10** 计划内重锁（store meta_open + App
  meta 两字段——010 零重锁后下一号）。
- **非目标**（明确排除）：
  - **时间戳类键**（updated_at/created_at 补写——Time 日期原语
    门控，009 供料候选在案；解锁后另批）；
  - **任意键编辑**（title/status 等其他键——v1 受控面 = tags/
    aliases 两键；title 编辑涉 tab 标题/显示名联动，独立批）；
  - frontmatter **原文视图**（编辑器内显示/编辑 frontmatter 原文
    ——结构性变更（read_wiki 契约/编辑器播种面），远期）；
  - tags/aliases 行内单条增删交互（弹层整域编辑 v1——细粒度交互
    后续 UX 批）；
  - 嵌套 frontmatter/多文档 YAML 兼容（语料 flat 形态外不承诺）；
  - 大纲（D-12）、每日笔记（Time）、移动/新建目录（create_dir
    探针）、casefold+词边界批、检索面 alias 匹配（§10 候选）、
    检索上量微批、上游件实做与生成物补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第九片是属性写面）

- **候选池对表**（PLAN-010 §10.7 投影 + ledger v12 实核）：大纲
  （D-12 原样门控）、每日笔记（Time 原语原样门控——两门控项连续
  三片未动，上游供料是唯一 unlock）、移动/新建目录（create_dir
  探针前置 + 语料 flat 低值）、casefold+词边界批（裁决重、用户可
  见价值低）、tag 写面（D-14 联动——**本批**）、检索 alias 匹配
  （小件）。北标口径（SD-405）：长期 Obsidian 线——**tags/aliases
  是元数据组织两支柱**，008（tags 读）/010（alias 读）只交付了
  半边；编辑器不可见 frontmatter（SD-301 语义）使**写面缺口成为
  读面价值的天花板**——本批是 008/010 的兑现闭环件，非新域。
- **D-14 收口时机**：自 PLAN-001 起挂账（「补写属 wiki 域功能池
  后续批」）；时间戳面被 Time 原语自然排除后，**受控范围（两键）
  边界清晰、破坏面可控**（三原则 + 字节精度测试域）——裁决成熟。
- **形态复用度**：改写引擎 = is_delim/body_after_open/write_body
  界符族第四件（标记法同族）；弹层 = dialog+input 主形态（006 证）
  第三输入位；预填 fetch = 单取形；刷新族 = 010 后在册全件。

### 2.2 数据面（back：双契约 + 受控改写引擎）

```rust
/// 页面元数据读（裸数组 [{key,value}]——key∈{tags,aliases}，
/// value = 逗号连接串；无 frontmatter/键 = 对应项缺席）
/// GET /api/page_meta?path=..
#[api(method = "GET", path = "/api/page_meta")]
pub fn page_meta(path str) str {
    return wsys.page_meta_json(path)
}

/// 页面元数据受控写（tags/aliases 两键；空串=删键；三原则改写）
/// POST /api/set_page_meta
#[api(method = "POST", path = "/api/set_page_meta")]
pub fn set_page_meta(path str, tags str, aliases str) str {
    return wsys.set_page_meta_impl(path, tags, aliases)
}
```

- **page_meta（读）**：frontmatter_of（008）→ page_fm_list 两次
  （tags/aliases——010 泛化件直用）→ 装配裸数组（D-20④：顶层数组
  唯一健康形状）；value = 逗号连接（"," join——逐项 + 重接，v0 规模
  接受）。
- **set_page_meta_impl（写引擎，五步）**：
  1. 卫：exists(path) 否 → ""；**空串/全空白 tags 与 aliases 同时
     且目标档本无两键 → no-op 返回 "ok"**（幂等防线）；
  2. 段取：frontmatter_of(text)（有）或 ""（无——增建路径）；
  3. **键改写（标记法逐行）**：fm.split("\n") 行扫描——命中
     `tags:`/`aliases:` 键行 → **删旧键行块**（键行 + 其后 block-list
     项行——两缩进形态）+ **插新键行块**（键行 + `- x` 逐项——无缩进
     归一形态）于**原键行位**（保序）；未命中 → 追加块至**闭合界符
     前**；值为空（trim 后）→ 只删不插（删键）；
  4. 无 frontmatter 档：新 fm = `tags:…/aliases:…` 块 → 全文 =
     `---\n` + 块 + `---\n` + 原 body；**行尾风格继承**：原 text
     含 "\r\n"（首行界符判定 CRLF）→ 新段行尾 "\r\n" 同步；
  5. write_text 落盘 + 复核 exists；返回 "ok"（""=失败）。
- **不变式（测试域 = G2 七则）**：其余键行**逐字节直通**（含缩进/
  注释/空行/未知键）；CRLF 档改写后非目标行零变化。
- **与保存流/改名流交互（定文防竞态）**：write_body 保存时**从磁盘
  现读**界符段（PLAN-001 语义）→ 属性改写与 body 保存天然顺序无
  冲突（后写者赢，frontmatter 段/body 段互不覆盖）；改名 = 整文件
  copy+delete（006）→ 属性随文件走。

### 2.3 消费面（front）

- **store**：`meta_open` bool + `MetaOpen()/MetaClose()`（弹层族
  第四开态）。
- **App 模型**：`meta_q_tags`/`meta_q_aliases` str（双 input 值——
  rename_q/find_q 同构居 App）。
- **入口**：action `file.meta`（title「页面属性…」、icon
  "sliders-horizontal"、shortcut **Ctrl+I**——在册键面无冲突[Ctrl+
  N/O/S/Z/Y/A/J/L/T/P/D/F2/Delete/Ctrl+Shift+F/D/Alt+F4 实核]）+
  menubar 文件项（重命名与删除之间）+ **不挂状态 enabled**（D-24③
  ——handler 守卫：untitled/无路径 no-op）。
- **弹层**（dialog 主形态第六实例）：标题「页面属性」+ 双 input
  （标签/别名，placeholder 逗号分隔提示）+ 取消/保存双钮（footer
  普通钮 D-24④）。`.MetaOpen`：守卫 → `store.MetaOpen()` + **预填
  fetch**（page_meta GET 单取形 → 两 input 初值；缺席项 = 空）。
- **保存流** `.MetaGo`：`r = set_page_meta(active_path, .meta_q_tags,
  .meta_q_aliases)`（try/catch console_log）→ "ok" → `store.
  MetaClose()` + **自派生刷新族**（D-26② 纪律）：`LinksRefreshOf
  (active)`（alias 解析面）+ `refresh_tags()`（tags 面板）+ wanted
  重算（link_pages 派生随 LinksRefreshOf 产物）——**tree 不刷**（无
  文件名变化）；非 "ok" → console_log + 弹层留置（006 v1 口径同判）。

### 2.4 键位/菜单面

Ctrl+I = 页面属性（新键位，唯一增量）；menubar 文件菜单「重命名…」
与「删除…」之间插「页面属性…」。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件（dialog/input/button 全在册已证）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「010完成之后下一个计划是什么？可以
  提前规划吗？」——**双层预立项授权**（010 执行窗内起草 PLAN-011
  ——首例两片提前量；耦合口径 §0）。方向选择（属性写面）= 候选池
  对表 + §2.1 论据；handoff 未否决即生效（PLAN-004..010 同款约定）。
- **D-14 受控裁决按默认提案落地**（§0 三原则）——handoff 呈报，
  用户可翻（翻则 r2：任意键编辑面/时间戳面另行评估）。
- **work 启动前提**：PLAN-010 归档（单写者主线）；本计划保持
  drafting 至彼时。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05）。无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-23 @ main 7b8a251 + 010 契约 r1）

- **写面缺口论据**：api.at read_wiki 只回 body（PLAN-001 契约注
  「frontmatter 在 back 侧字符串层保留/拼回」）；编辑器播种 =
  active_body（store）——**frontmatter 全程不可见不可编辑**；
  tags/aliases 声明目前仅能外部文本编辑器手改磁盘。
- **界符族在册件**：wsys `is_delim`（"---"/"---\r" 双形态）、
  `body_after_open`（闭合界符定位标记法）、`write_body`（保存时
  磁盘现读界符段 + 拼 body——**属性写与 body 写的顺序安全论据**）、
  `frontmatter_of`/`page_fm_list`（008/010——读引擎直用）。
- **旧园对照**（冻结池实读）：旧园 frontmatter 经 serde_json 全量
  解析/回写（files.rs default_ad_content + index.rs frontmatter
  消费）——**全量解析改写 vs jade 受控标记法**（未知键保真面：
  serde 往返有键序/形态漂移风险，jade 逐字节直通是哲学延续——
  PROVENANCE「非拷贝」口径同源）。
- **CRLF 面**：is_delim 双形态在册；语料 LF（tmp/wiki-demo 实读），
  CRLF 案走测试内造档（write_wiki body 含 \r\n 造法——read_text
  原样落盘）。
- **在册复用件**：dialog+input 主形态（006 探针 B 定谳/弹层族五
  实例）；单取形 fetch（008 refresh_tags）；自派生刷新族
  （LinksRefreshOf/refresh_tags——010 在册口径）；D-24③④⑤/D-25①/
  D-26② 纪律族。
- **键位面**：Ctrl+I 空闲（app.at 34 shortcut 实核无 I）。
- **基线**：v9 现行（010 零重锁承诺——契约 r1）；**v10 变更面** =
  store meta_open + App meta_q_tags/meta_q_aliases + 弹层第六实例
  id 序列。
- **010 在飞共享面**（耦合清单）：resolve_target（010 扩容——本批
  只消费不碰）、提及行（010 增钮——不碰）、LinksRefreshOf（同用）、
  page_fm_list（读引擎同源——本批写引擎独立 fn，不共用写路径）。

### 4.3 与既有计划的关系

- 兑现 PLAN-008（tags 面板）与 PLAN-010（alias 解析）的写面闭环；
  收口 **D-14**（自 PLAN-001 挂账——受控范围裁决落地）。
- 与 Time 供料候选关系：时间戳键明确排除（§1 非目标）——Time 解锁
  后「时间戳补写批」另立（届时与本引擎衔接：+2 键而已）。
- PLAN-012 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  每日笔记+时间戳补写（Time 原语解锁——**双件联动批**）、移动/
  新建目录（create_dir 探针前置）、casefold+词边界批、检索面
  alias 匹配、title 键编辑（tab 标题联动）、检索上量微批、
  File.rename/copy 供料回执件。

## 5. 详细设计

### 5.1 back 双契约与写引擎（SD-1101）

```
pub fn page_meta_json(path str) str {
    // exists 卫 → fm = frontmatter_of(read_text(resolve(path)))
    // tags = page_fm_list(fm, "tags") / aliases = …("aliases")
    // 装配 [{"key":"tags","value":"a,b"},…]（缺席项不装配）
}

fn fm_set_block(fm str, key str, items List) str {
    // 行扫描标记法：删旧键行+block-list 项行（两缩进）→ 原位插新块
    //（键行 + "- x" 无缩进归一）；未命中 → 尾追（闭合前语义——fm
    // 段无闭合界符，追尾即界符前）；items 空 → 只删不插
    // ⚠ D-20②：行元素先拷局部
}

pub fn set_page_meta_impl(path, tags, aliases) str {
    // ①卫+幂等防线 ②段取/增建 ③fm_set_block ×2 ④CRLF 继承
    //（原 text 首行界符 CRLF → 新段行尾 "\r\n"）⑤落盘+复核 → "ok"
}
```

### 5.2 front 接线（SD-1101）

- store：meta_open + MetaOpen/MetaClose。
- app.at：msg `ActMeta`/`MetaEditTags(str)`/`MetaEditAliases(str)`/
  `MetaGo`/`MetaCancel`；模型 meta_q_tags/meta_q_aliases；action
  file.meta（Ctrl+I）+ menubar 项；dialog 第六实例（双 input + 预填
  fetch 单取形）；`.MetaGo` 保存流（§2.3——自派生刷新族三件）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1101 | modify | docs/ARCHITECTURE.md §5 | before：frontmatter 零写面（D-14「逐字保留」v0 + 功能池挂账）。after：增「页面属性写面（D-14 受控裁决）」子段——**受控三原则**（仅 tags/aliases 两键/其余键逐字节保留/空值删键；无 frontmatter 增建；值归一 block-list；时间戳键排除[Time 门控]）；`page_meta` GET（裸数组 [{key,value}]）+ `set_page_meta` POST 契约；写引擎五步 + 不变式七则（幂等/CRLF 保真/键序保持）；与保存流/改名流交互定文（磁盘现读界符段 = 顺序天然安全）；front 面（Ctrl+I/弹层双 input/预填回显/自派生刷新族）；D-14 状态更新（挂账→受控落地，时间戳面仍功能池） | 008/010 读面兑现闭环；D-14 收口规范锚 | AC-01/02/06 |
| SD-1102 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v9。after：组数**不变**（属性弧线入 meta 组子步——元数据域内聚）+ **基线 v10**（store meta_open + App meta 两字段 + 弹层第六实例；v9 留档） | 测试体系表更新（009/010 子步内聚口径续） | AC-03/04 |
| SD-1103 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v9。after：口径不变 + meta 组子步扩注记 + 基线 v10 指针 + N 定谳续记 | 判绿口径单一权威面（…/1003 续） | AC-03/04 |
| SD-1104 | modify | docs/README.md「是什么/文档」节 | before：第八切片=别名+转链。after：**第九切片=页面属性写面**条目（D-14 受控首开 + 008/010 兑现闭环注记）+ ledger v14 指针 | 产品主线进度面派生同步（…/1004 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：写引擎十案——①既有键改写归一（inline/
  两缩进旧值 → 无缩进 block-list）②**其余键逐字节保留**（title/
  status/summary/未知键/注释行/空行混排档——改写前后 diff 仅目标
  键块）③新增键尾追（有 frontmatter 无 tags 档）④空值删键 ⑤无
  frontmatter 增建（body 前插段 + body 逐字节不变）⑥CRLF 档保真
  （造档行尾 \r\n——非目标行零变化）⑦幂等（同值再写逐字节不变）⑧
  双键同写 ⑨CJK 值（标签/别名中文——POST 双臂）⑩page_meta 读回
  闭环（写→读回值一致；缺席项形态）。附：与 write_body 顺序互作案
  （属性写→body 保存→frontmatter 段仍为属性写后形态）。
- **vm 矩阵 meta 组子步（T-04）**：①Ctrl+I 弹层（untitled no-op +
  有路径档弹层快照/预填回显——语料 `CAP 定理` 档 tags 回显
  `distributed-systems,theory`）②保存 tags 新值 → tags 面板新行
  即时可见 ③保存 alias `帽子定理` → 开源档 `[[帽子定理]]` 出链行
  exists 翻转（010 解析面兑现）④取消零落盘 ⑤删值弧线（清空 input
  → 键删除 → tags 面板行消失）⑥改写后档保存流回归（body 保存不
  覆盖属性）。
- **e2e（T-04）**：meta 段子步扩同弧线（真 DOM：Ctrl+I → input
  fill → 保存 → 面板/出链翻转断言；CJK 值 POST 双臂）。
- **基线 v10（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v9 留档。
- **负向（T-05）**：`.console` 零赋值；既有契约零变化回归（含 010
  新增 linkify_page）；冻结池/家族仓零接触；补件面零增量。

## 7. 验收标准

- **AC-01（读契约）**：page_meta GET 落地；写读闭环案（⑩）双臂绿；
  裸数组形状符合 SD-1101。验证：T-01 直证。
- **AC-02（写引擎 + 属性闭环双轨）**：十案双臂全绿（**其余键逐字节
  保留/CRLF/幂等**三则专项）；UI 弧线（预填/保存/面板与解析刷新/
  删值/取消/保存流互作）vm+e2e 同断言域全绿。验证：T-01/T-04。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **16/16** + split **15/15**（组数不变）+ vue build +
  e2e **十五段**；判绿实录进 §9（D-21 v12 口径——重跑即绿如实记）。
- **AC-04（基线 v10）**：重锁完成零漂移（v9 留档）；dump 含 meta_
  open/meta_q_tags/meta_q_aliases。
- **AC-05（负向证）**：冻结池与家族仓零接触；`gen/` 无手改；旧园
  零引用；补件面零增量；`.console` 零赋值；既有契约（含 010 面）
  零变化回归。
- **AC-06（文档面）**：SD-1101..1104 落位且锚注齐；**D-14 受控裁
  决三原则 + 交互定文**入 SD-1101（D-14 状态：挂账→受控落地注记）；
  parity-ledger **v14**（执行期新实勘）。

## 8. 执行步骤

> 前置：PLAN-010 归档（§0/§4.1）。

- **T-01 back 双契约 + 写引擎 + 十案直证**（AC-01/02 前半）
  - api.at 增 page_meta GET + set_page_meta POST；wsys.at
    page_meta_json + fm_set_block + set_page_meta_impl（五步 +
    CRLF 继承）。
  - 十案 + 互作案 merged 直调 + serve-back 直证（CJK 案双臂）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（现行组回归
    ——含 010 后全组零变化）。
- **T-02 front 属性弹层**（AC-02 中）
  - store meta_open 双口 + app.at action/menubar/dialog 第六实例
    （双 input + 预填 fetch）+ Ctrl+I 冒烟（actions 面形态）。
  - 验证：merged 手动冒烟（预填回显/取消零落盘）+ `pnpm build`
    PASS。
- **T-03 保存流 + 刷新族 + 互作收口**（G3）
  - `.MetaGo` 保存流（自派生刷新族三件——D-26② 纪律）+ 与保存流
    互作冒烟（属性写→body 保存→frontmatter 存续）。
  - 验证：merged 冒烟（tags/alias 双兑现弧线）+ meta/link 组回归 +
    e2e meta 段冒烟。
- **T-04 测试扩单 + 基线 v10 + 判绿首锁**（AC-02/03/04）
  - vm meta 组六子步 + e2e meta 段扩 + 基线 v10 重锁。
  - 验证：双臂全绿 + `pnpm test:e2e` 连跑 ≥5 + gate ALL GREEN。
- **T-05 文档 + ledger v14 + 收口**（AC-05/06）
  - SD-1101..1104 落位（D-14 裁决定文）；ledger v13→v14（010 交
    付 v13 后顺延号——执行期实勘）；负向证采集；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-23 双层预立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-011，revision 1。
  - `outcome: pass`——可进 work，**前提 = PLAN-010 归档**（§0 双层
    耦合：010 执行偏差/复审 findings 涉共享面则 r2）。
  - `next: work`（010 归档后 T-01 起）。
  - **D-14 受控裁决随 handoff 呈报**（默认三原则——用户未否决即
    生效）；无待裁探针（界符族/弹层族/单取形全在册）。

## 10. 待澄清事项

1. **D-14 受控裁决**（handoff 呈报，默认通过）：三原则见 §0——若
   用户要扩面（任意键编辑/时间戳）→ r2 重新评估（时间戳仍 Time
   门控）。
2. **键行形态归一**（已随 r1 定）：写侧统一无缩进 block-list
   （`tags:\n- x`）——读侧两缩进兼容（008）；既有缩进键改写后归一
   为无缩进（值变化时）——归一语义入 SD-1101，用户可改「保持原
   缩进」。
3. **多输入分隔符**（v1 逗号）：标签/别名值含逗号本体的形态（CJK
   顿号/全角逗号兼容）——v1 半角逗号唯一分隔 + trim；多分隔符支
   持后续 UX 批。
4. **检索面 alias 匹配**（记账不做）：search_wiki stem+body 口径
   恒定；alias 入检索 title 面后续小批（010 §10.5 同判）。
5. **D-21 POST 波及**（观测项）：属性保存单 POST；负载窗按 README
   重跑口径。
6. **010 双层耦合**（预立项特有）：010 执行/复审若改共享面
   （LinksRefreshOf 形态/page_fm_list 契约/提及行结构）→ 本计划
   r2 重核接地（§4.2 清单）；010 pass/merge docs-only 面不触发。
7. **PLAN-012 候选池**（本批后更新）：大纲（D-12 解锁——首位顺延
   候）、每日笔记+时间戳补写（Time 原语解锁——双件联动）、移动/
   新建目录（create_dir 探针前置）、casefold+词边界批、检索面
   alias 匹配、title 键编辑（tab 联动）、检索上量微批、File.
   rename/copy 供料回执件。
