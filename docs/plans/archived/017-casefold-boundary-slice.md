---
plan_id: PLAN-017
status: archived
completion_kind: delivered
feature_name: casefold-boundary-slice
author: [zhaopuming]
created_at: 2026-09-25T17:50:50+08:00
updated_at: 2026-09-25T22:35:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1701"
  - "docs/ARCHITECTURE.md#SD-1702"
  - "docs/README.md#SD-1703"
  - "docs/README.md#SD-1704"
touched_goals: []
---

# [PLAN-017] 知识库第十五切片——casefold+词边界批（链接解析三期收口：四级解析序 + case-only 改名解锁 + linkify 词边界）

## 0. 变更摘要

SD-301/SD-405 主线第十五片：链接语义鲁棒性收口——**精确（003）→
aliases（010）→ casefold（本批）** 解析三期完成：

1. **解析四级序**：`resolve_target` 扩容——①stem 精确 → ②alias
   精确 → ③stem casefold（双侧 to_lower）→ ④alias casefold；每级
   walk 序 first-hit。**CJK 零影响论证**：to_lower 对 CJK 恒等 →
   三四级对中文 stem/alias 天然 no-op——中文知识库行为逐字节不变。
   消费面（exists/反链/出链/wanted/提及/检索）经单点自动生效；
   **语料基线零漂移**（语料无大小写变体链接）。
2. **case-only 改名解锁**（006 G3 拒 → 本批解锁）：`Tasks → TASKS`
   类改名经**两步临时名迁移**（old → 唯一临时名 → new——Windows
   同档绕行）；**改名改写器同步扩容**（按四级解析序匹配 `[[old]]`
   变体——case 变体链接随改名改写，防改名后悬空）。
3. **linkify 词边界**：纯 ASCII stem 明区替换增**双侧边界判定**
   （相邻字符为 ASCII 字母/数字则跳过该出现处——`CAP` 不再误中
   `CAPTURE`）；CJK stem 豁免（子串语义不变——无词边界概念）。
   实现法：split-by-stem 段接缝判定（右界 = 后段首字符 ASCII 判；
   左界 = 前段 `ends_with` 62 字符枚举——**字节安全**，规避
   D-20③ length/slice 陷阱）。
4. **Windows 同档边界定谳收口**（005 §10.6/006 §10.4/012 §10.6
   三处挂账并账）：create 幂等卫（File.exists Windows 大小写不敏感
   天然正确——注记定谳）/改名 case-only 两步法（本批）/检索面已
   casefold（零变化注记）。

**零新契约、零新 UI 形态、零新状态面**（纯 back 语义扩容 + 既有
弹层行为解锁）——**零重锁片第二例**（基线 v15 不动）。上游缺口
适配：D-20②③（局部拷/禁 length 定长——词边界实现纪律核心）；
D-23①；D-30①；D-31；**D-33②（computed `+` 串接不发射——本批
front 零 computed 面新增，纪律注记）**。

## 1. 目标

- **G1（四级解析可用）**：`[[hello world]]` 解析到 `Hello World.ad`
  （语料现成已知答案！）；`[[HELLO WORLD]]` 同；**精确优先**（
  `[[Hello World]]` 恒精确级命中——大小写变体档并存时精确档先于
  casefold 档，walk 序内）；alias 四级同构；出链行/反链/wanted/
  提及/检索面自动一致。
- **G2（case-only 改名可用·双轨）**：`Tasks.ad → TASKS.ad`（006
  拒路径解锁）——磁盘 casing 翻转（两步迁移）+ tab/树/面板刷新 +
  **变体链接改写**（`[[tasks]]`/`[[TASKS]]` 随改名改写为
  `[[PROJECTS?]]`——新名）；非 case-only 改名行为零变化。
- **G3（linkify 词边界可用）**：提及行「转为链接」——`CAPTURE`
  内的 `CAP` 不再被替换；独立 `CAP` 正常替换；CJK stem 子串语义
  不变（回归）。
- **G4（测试面）**：link 组子步扩（四级解析/词边界）+ rename 组
  子步扩（case-only 弧线）——**组数不变 16/15/十五段**；**基线
  v15 零重锁**（第二例——dump 零新字段断言）。
- **非目标**（明确排除）：
  - **Unicode 全角/宽字符等价**（`ＣＡＰ` ↔ `CAP`——NFKC 面不做；
    仅 to_lower ASCII 语义）；
  - 全角空格/零宽字符规范化（parser 域远期）；
  - linkify CJK 词边界（无概念——恒子串，定文防误期待）；
  - 检索词边界（search 子串语义已是产品口径——保持）；
  - trash 内条目 casefold 恢复（exact path 语义——零变化）；
  - 大纲（anchor-reveal 供料未落——上游实勘 grep 0，仍门控）、
    目录移动/合并、检索上量微批、Time front probe、url_decode
    供料回执件、trash 预览/批量恢复（候选池顺延）、上游件实做
    与生成物补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十五片是 casefold+词边界

- **候选池对表**（PLAN-016 §10.6 + 上游实勘 2026-09-25）：大纲
  （anchor-reveal grep 0——**连续八片门控**，上游忙于 PLAN-701/702
  他仓线）、casefold+词边界（**本批——池内首个可动件**，顺延七次
  后兑现）、目录移动/合并（低频）、检索上量（未触发）、Time front
  probe（独立价值低）、url_decode 回执（上游未动）、trash 增强
  （锦上添花）。北标口径（SD-405）：长期线链接鲁棒性收口——
  **英文/混合工作流的链接失败主因**就是大小写变体（`[[hello
  world]]` 悬空）；解析三期（精确→别名→casefold）完成后链接域
  语义完备；case-only 改名解锁清偿 006 遗留裁决债；词边界堵
  linkify 自 010 §10.2 记账的误伤面。
- **零成本结构**：四级序 = resolve_target 单点扩容（010 裁定结构
  直承）；两步迁移 = move 组合复用；词边界 = split 段接缝判定
  （split_by_stem 天然给出出现处两侧上下文——无 indexOf 依赖）。
  **零新契约/零新面板/零重锁**。

### 2.2 数据面（back：三处扩容，零新契约）

- **resolve_target 四级**（wsys:185 族）：
  ```
  ①stem 精确首现（walk 序）→ ②alias 精确首现 →
  ③stem casefold 首现（target_l = target.to_lower()；逐页
    stem.to_lower() == target_l）→ ④alias casefold 首现 → ""
  ```
  级间严格有序（exact 全集扫完才进 casefold 级——**精确优先于
  walk 序**：变体档并存时确定性裁决）；⚠ D-20②：页元素先拷局部。
- **rename_page case-only 解锁**（wsys:684 卫语句改道）：
  casefold_eq 命中且**非全等**（case-only 形态）→ 不再拒——
  **两步迁移**：`old → tmp`（tmp = `{stem}--casefold-tmp-{n}` 唯一
  序号 while exists）→ `tmp → new`（move 组合 ×2 + 双复核 ×2）；
  改写器 `rewrite_links` **匹配面扩四级**（`[[tasks]]` 变体随改名
  改写——改写循环内 target 精确/`to_lower` 双判）；其余（清洗/
  同层同名拒[casefold 全等外]/冲突卫）零变化。
- **linkify 词边界**（ASCII stem 分支）：`body.split(stem)` 段接缝
  重构——出现处 k（seg[k] 与 seg[k+1] 之间）：**右界** = seg[k+1]
  `.slice(0,1)` ∈ 62 ASCII 字母数字 → 跳过；**左界** = seg[k] 对
  62 字符 `ends_with` 枚举命中 → 跳过；合格 → `[[stem]]` 包裹；
  计数 = 合格数；**明区判定不变**（[[..]] 段内接缝仍按链接域豁免
  ——段切分与链接域判定正交合并，T-03 设计落定）；CJK stem（含
  非纯 ASCII）恒 while-contains 旧径（豁免注记）。
- **定谳注记面（SD-1701）**：create_page 幂等卫（File.exists
  Windows 大小写不敏感——`create_page("Index")` 幂等返回；**大小写
  敏感 FS 非支持面**定文）；search_wiki 已 casefold（SD-401）零
  变化；mentions 随 search 继承零变化。

### 2.3 消费面（front：零改动）

四级序/case-only/词边界全部 back 侧——front 弹层/面板/行集零变化
（改名弹层 case-only 输入从「拒」变「成功」——行为解锁非形态变化）。
⚠ D-33②：本批 front 零新增——不涉 computed `+` 串接面（纪律预注）。

### 2.4 键位/菜单面

零新增。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新契约、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-25 会话口述：「计划016 已经完成；请规划
  （[$auto-plan-new] 下一个计划）」——**立项授权**：016 已归档
  （6039a8a——正常立项窗）。方向选择（casefold+词边界批）= 候选
  池首个可动件 + §2.1 依据；handoff 未否决即生效（PLAN-004..016
  同款约定）。
- **006 G3 裁决翻转授权评估**：case-only 拒（006——「精确匹配下
  无意义」）→ 本批四级序下 case-only 变为**有意义操作**（改 casing
  即改精确档命中）——裁决翻转随解析序扩容一体成立（§2.2 论证），
  非独立用户决策项；异议 → handoff 提出。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05；上游仓只读实勘）。无预算/自动续跑/工具链版本指定。

### 4.2 接地证据（本仓/家族实读，2026-09-25 @ main baa3a07/6039a8a）

- **在册扩展点**：wsys `resolve_target`（:185——010 四级序结构位）、
  `casefold_eq`（:628——006 拒卫，本批改道点）、`rename_page_impl`
  （:684 五步——两步迁移插入位）、`rewrite_links`（:230 族——匹配
  面扩容）、`linkify_page_impl`（010——while-contains 径，本批 ASCII
  分支）；move 组合 + 双复核（006/012 定文形态——两步迁移复用）。
- **语料现成已知答案**：`Hello World.ad`（语料档）——`[[hello
  world]]`/`[[HELLO WORLD]]` 四级解析案素材；`[[Hello World]]`
  精确档（对照）；语料无大小写变体链接 → **全部现行断言零漂移**。
- **D-20③ 词边界实现依据**：heap CJK 串 `.length` 字节语义——左界
  `ends_with` 枚举法**字节安全**（ASCII 后缀不可能匹配多字节中段）；
  右界 `.slice(0,1)` 首字节恒字符起点（安全）——两法皆规避
  length/slice 定长陷阱（D-31 整前缀 split 通道同族纪律）。
- **D-33②（016 新增）**：computed 表达式内联 `+` 串接不发射
  （vm 快照节点缺失实录）——本批 front 零新增面（预注纪律）；后续
  批涉显示串接走 handler 派生字段。
- **上游实勘**（2026-09-25）：auto-lang main 近线 = PLAN-701/702
  （他仓归档线）——anchor-reveal grep 0（**大纲连续八片门控**，
  §2.1 对表如实）。
- **基线**：v15 现行（016）；本批**零重锁第二例**（零新 store/App
  字段——dump 不变断言入回归）。

### 4.3 与既有计划的关系

- 承接 PLAN-003（精确解析）/PLAN-010（别名序）——解析三期收口；
  清偿 PLAN-006 G3（case-only 拒裁决债）与 PLAN-010 §10.2（linkify
  词边界记账）；并账 PLAN-005 §10.6/012 §10.6（Windows 同档边界
  三挂账——定谳收口）。
- 与 SD-401（检索 casefold 已在册）对齐——检索面零变化注记。
- D-12（anchor-reveal）/url_decode（D-19）供料留观不变；D-33②
  新纪律预注。
- PLAN-018 候选池（§10.7 更新）：大纲（anchor-reveal 解锁——首位
  顺延候）、目录移动/合并、检索上量微批、Time front 面 probe 批、
  url_decode 供料回执件、trash 预览/批量恢复、Unicode 规范化
  （NFKC——本批 §1 非目标顺延候）。

## 5. 详细设计

### 5.1 back 三处扩容（SD-1701）

```
fn resolve_target(stems, aliases, rels, target) str {
    // ①精确 stem（现径）②精确 alias（现径）
    // ③cf: tl = target.to_lower(); 逐页 st = stems[p].to_lower()
    //   == tl → rels[p]（先拷局部——D-20②）
    // ④同③于 aliases[p] 逐项 → ""
}

// rename_page_impl：casefold_eq && old != new（case-only）→
//   tmp = stem + "--cftmp-" + n（while exists）→ move(old,tmp) →
//   move(tmp,new)（双组合双复核）；rewrite_links 匹配面：
//   target == old || target.to_lower() == old_l（变体全改写）

// linkify_page_impl：stem 纯 ASCII（逐字符 62+…枚举判定 or
//   to_lower 恒等判——T-03 落定）→ split(stem) 段接缝双侧边界
//   重构（合格包裹计数）；否则 while-contains 旧径
```

### 5.2 front（零改动）

无（§2.3）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1701 | modify | docs/ARCHITECTURE.md §5 链接域语义段 | before：解析序 = stem 精确 → alias 精确（SD-1001）；case-only 改名拒（SD-601 G3）；linkify 子串无边界（SD-1001 v1 口径）。after：①**解析四级序**（stem 精确 → alias 精确 → stem casefold → alias casefold；级间有序、级内 walk first-hit；CJK 恒等零影响论证；消费面清单自动生效）②**case-only 改名解锁**（两步临时名迁移；改写器四级匹配面——变体链接随改名改写）③**linkify 词边界**（纯 ASCII stem 双侧边界——ends_with 枚举法[字节安全]；CJK 豁免恒子串定文）④**Windows 同档边界定谳并账**（create 幂等 exists 卫天然正确/大小写敏感 FS 非支持面/检索已 casefold） | 解析三期收口 + 三挂账并账；英文工作流链接失败主因清除 | AC-01/02/03/06 |
| SD-1702 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v15。after：组数**不变**（四级解析/词边界入 link 组、case-only 入 rename 组子步）+ **基线 v15 零重锁第二例**注记（dump 零新字段断言入回归组） | 测试体系表更新（010 首例后第二例——语义扩容片口径） | AC-04 |
| SD-1703 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v15。after：口径不变 + link/rename 组子步扩注记 + 零重锁第二例注记 | 判绿口径单一权威面（…/1603 续） | AC-04 |
| SD-1704 | modify | docs/README.md「是什么/文档」节 | before：第十四切片=回收站。after：**第十五切片=casefold+词边界**条目（解析三期收口注记）+ ledger v20 指针 | 产品主线进度面派生同步（…/1604 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01..T-03，双臂）**：
  - 四级解析案：①`[[hello world]]`/`[[HELLO WORLD]]` → Hello
    World.ad（语料）②精确优先（造 `A.ad`+`a.ad` 双档[Windows 同档
    不可造——大小写敏感断言改走 casefold 档单档验证 + 语义单测面
    T-01 落定]：`[[A]]` 精确、`[[a]]` 精确同档 Windows 下 = 同档
    注记）③alias casefold（造 alias `Hat` → `[[hat]]` 命中）④
    语料基线回归（现行 link_index 逐字节零漂移）。
  - case-only 案：⑤`Tasks → TASKS`（磁盘 casing 翻转 + 字节整迁
    + 变体链接 `[[tasks]]` 改写 + 精确链接零重写）⑥非 case-only
    回归（006 八案全绿）。⑦两步迁移失败残留容忍注记（tmp 段失败
    → old 保持，tmp 残留记账）。
  - 词边界案：⑧`CAPTURE … CAP` → 仅 CAP 包裹（计数 1）⑨`xCAP`/
    `CAPx` 跳过 ⑩CJK stem 子串回归（`首页` 无边界豁免）⑪链接内
    豁免回归。
- **vm 矩阵（T-04）**：link 组子步——①出链行 `[[hello world]]`
  可点击导航（四级解析面）②提及行转链（CAPTURE 语料造——转链后
  磁盘逐字节验边界）；rename 组子步——③case-only 弧线（F2 →
  TASKS → 磁盘 casing + tab + 面板零链接断链）。
- **e2e（T-04）**：同弧线两段（真 DOM）。
- **基线 v15：零重锁断言**（第二例——merged 臂基线组现跑零漂移
  实录）。
- **负向（T-05）**：probe 全族九代回归（含 probe_trash）；`.console`
  零；契约签名零变化（六直证脚本回归）；D-30①/D-31 纪律 grep；
  冻结池/家族仓零接触；`gen/` 无手改；补件面零增量；**D-33② 零
  新增 computed `+` 串接**（grep 证）。

## 7. 验收标准

- **AC-01（四级解析）**：解析案双臂绿 + **语料基线逐字节零漂移**
  + 精确优先级语义案可证。验证：T-01 直证。
- **AC-02（case-only 改名）**：弧线双臂绿（casing 翻转/变体改写/
  精确零重写）+ 006 八案回归零变化。验证：T-02 + T-04。
- **AC-03（linkify 词边界）**：边界案双臂绿 + CJK 豁免回归 +
  链接内豁免回归。验证：T-03 + T-04。
- **AC-04（gate + 零重锁第二例）**：gate ALL GREEN（16/15/十五段
  口径不变）；**基线 v15 现跑零漂移**（dump 零新字段证）；N 定谳
  续记。
- **AC-05（负向证）**：冻结池与家族仓零接触；`gen/` 无手改；旧园
  零引用；补件面零增量；`.console` 零；契约签名零变化；probe 全族
  九代回归；D-33② grep 零新增。
- **AC-06（文档面）**：SD-1701..1704 落位锚注齐；**四级序定文 +
  case-only 解锁裁决翻转注记 + Windows 边界定谳并账**入 SD-1701；
  parity-ledger **v20**（执行期实勘 + 006 G3 翻转记录）。

## 8. 执行步骤

- **T-01 resolve 四级 + 解析直证**（AC-01）✅
  - wsys resolve_target 扩四级；probe_casefold.mjs 新增（解析案 +
    基线回归）。
  - 验证：直证全绿 + vm 矩阵现行组回归（link_index 零漂移含）。
  - **[✅ 已完成]**（2026-09-25，commit ed7fc3c）——resolve_target 四级
    扩容（级间严格有序/级内 walk first-hit/to_lower 双轨在册 D-22①/
    CJK 恒等零影响）+ probe_casefold 七案双臂全绿 58 PASS（含 **§10.1
    落定**：精确优先级语义证通道 = root×wiki/ 跨目录变体档——Windows
    同目录不可造变体双档，跨目录 stems 全局收集天然可并存；[[Z Upper]]
    精确档命中而 casefold 竞争档 wiki/z upper.ad walk 序更早让位 = ①>
    ③ 直证；[[foo]]/[[bar]] 竞争对 = ②>③/③>④ 级间序直证；①>② 在册
    [probe_alias_linkify 案② 回归承载]）；**执行期校正 1 件**：pristine
    期望表漏 index.ad:22 提示行 `[[页面名]]`（语料第 10 链接，悬空档
    ——grep 案式勘的局限）按实勘补；语料基线零漂移 = pristine 5 页 10
    链接全已知答案逐链接断言 + 双臂深等。复跑：probe_casefold 双臂绿
    ×2 + vm_matrix merged 16/16[基线 v15 零漂移]/split 15/15。
- **T-02 case-only 两步迁移 + 改写器扩容**（AC-02）✅
  - rename_page_impl 改道 + rewrite_links 四级匹配；probe_rename
    扩案（⑤⑥⑦）。
  - 验证：probe_rename 全绿（含 006 八案回归）+ rename 组回归。
  - **[✅ 已完成]**（2026-09-25，commit 0c6422d）——卫语句改道[全等拒
    （原 casefold_eq 拒面收窄）/case-only 两步迁移 `{stem}--cftmp-{n}`
    唯一序号 + move_file 组合提取单点（正常径共用）/非 case-only 冲突
    卫零变化] + rewrite_links 统一 casefold 判（精确态为子集——006 八
    案回归零变化）+ probe_rename ⑧ 行为翻转（casing 翻转 readdir 实名/
    字节整迁/变体三态 [[tasks]]/[[Tasks]]/[[TASKS]]→[[TASKS]] 全改写
    [cf-src 新素材]/对照精确链接零重写/无 --cftmp- 残留）+ ⑧b 全等拒
    新案；§6⑤「精确链接零重写」按 §5.1 统一判口径落定为**副作用圈定**
    （他页目标链接零重写——变体全改写含旧精确态，Obsidian 同形）；
    §6⑦ 两步迁移失败残留 = 观测项注记（D-34③——发生率预期零，全窗
    实录零残留）；**T-04 前置件随批**：vm 矩阵/e2e check 12 ⑥ 子步随
    行为翻转更新（case-only 弧线=翻转+回翻——逐提交保绿纪律）。复跑：
    probe_rename 双臂全案 + 一致=true + vm_matrix 16/16+15/15。
- **T-03 linkify 词边界分支**（AC-03）✅
  - ASCII 判定 + split 段接缝重构；probe_alias_linkify 扩案
    （⑧..⑪）。
  - 验证：probe 全绿 + link 组回归。
  - **[✅ 已完成]**（2026-09-25，commit b3fd5a3）——三助手[ascii_
    alnum_cp（§10.2 r1：62 集 A-Za-z0-9，`_`/`-` 豁免不阻断）/is_pure_
    ascii（逐字节 char_at 码点扫描资格判——纯 ASCII 走边界径，CJK 恒
    子串旧径）/boundary_ok（段接缝双侧判定）] + linkify_page_impl 双径
    改道（不合格处原样透传不计数；明区判定不变）+ probe_alias_linkify
    扩案 ⑪..⑮（CAPTURE 词内/xCAP·CAPx 双侧/_- 豁免/A首页B 定义级
    强化/链接内豁免共存）；char_at 原语一次性冒烟定谳（9398 探针工程
    ——字节索引/码点返回/边界安全/越界 0，实录 67/39318/0/0/39029/0，
    用后清理）。⚠ 首版左界 char_at(length-1) 败形由 T-04 matrix ⑧ 抓
    出（见 T-04——.length=字符数 vs char_at=字节不一致，D-34①）。
    复跑：probe_alias_linkify 双臂全案绿（010/013 案组回归含）+
    vm_matrix 16/16+15/15。
- **T-04 测试扩单 + 零重锁断言 + 判绿首锁**（AC-01/02/03/04）✅
  - link/rename 组子步 + e2e 两段 + 基线零漂移现跑实录 + gate。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN。
  - **[✅ 已完成]**（2026-09-25，commit 47103d9）——**last_char_cp 左界
    修复**（matrix ⑧ 三态体首跑实录 xHello World 误包裹——实测定谳
    D-34①：`"X 与 x".length`=5[字符数]/char_at(4)=0[mid]/char_at(6)
    =120[字节位]——**str .length=字符数 vs char_at=字节索引语义不一致，
    D-20③「heap 臂=字节」按现工具链实测不成立**；修 = 前向码点步进
    扫描零 .length 依赖）+ link 组两子步[⑦ 四级解析导航（CF Navigate
    小写变体链→出链行非悬空→导航落 Hello World + links_json
    target_path 直证）⑧ 提及转链词边界（三态体磁盘逐字节 + 页级排重）]
    + e2e 同单两段（断言口径执行期校正 2 件：DOM 渲染文/read_wiki
    JSON 壳——D-23③ 家族）+ check B 零重锁第二例注记。复跑实录：vm
    矩阵 merged 16/16[基线 v15 零漂移·**零重锁第二例**]/split 15/15
    多轮 + vue build 绿[**工具链家族重建窗环境路由**——见下] + e2e
    **5 连绿**（43.8/44.2/44.1/44.2/43.9s）。**gate 单命令 ALL GREEN
    未达 = 外部工具链窗口阻塞**（PLAN-013 v16 先例原样）：auto-lang
    双 exe 家族重建中间态——debug exe（11:00）全量输入 vue gen 满核
    自旋（hello-world 秒过=输入相关；**pre-017 状态[6039a8a]同败=非
    本批代码**；drift env 不解；plan-014 worktree exe 同败）、release
    exe（17:58）deps select prop schema drift（SCHEMA_DRIFT_GENERATE_
    AT=1 生成通道绕行后 build 绿）但 vm 矩阵 split 臂不稳（tree 行
    不现）；唯一全过的旧 release g63e14b045 已被家族重建覆盖——**分段
    判绿在案**：矩阵[debug]多轮 ALL GREEN + build[release+drift]绿 +
    e2e[debug] 5 连绿；unblock = 家族工具链稳定窗后单命令复核（ledger
    D-21 v20 全录）。另录：后台管道语境矩阵挂起 2 次（前台直跑即绿）
    + 泄漏 vm 进程 1 例清杀（D-27④）。
- **T-05 文档 + ledger v20 + 收口**（AC-05/06）✅
  - SD-1701..1704 落位；ledger v19→v20；负向证；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。
  - **[✅ 已完成]**（2026-09-25）——SD-1701（ARCH §5 链接域语义段：四
    级序定文 + case-only 解锁裁决翻转注记 + 两步迁移 + 词边界双径 +
    char_at/.length 语义不一致注记 + Windows 边界定谳并账 + 直证清单）
    + SD-1702（ARCH §6：头注 + 矩阵行子步扩[link ⑦⑧/rename case-only
    弧线翻转/基线零重锁第二例/probe_casefold+⑧⑧b+⑪..⑮ 入册] + e2e
    行两段）+ SD-1703（README Tests：头注 + 检查单子步 + N 定谳 v15
    续记[分段判绿+环境路由如实记] + 运行矩阵家族重建窗注记）+ SD-1704
    （README 是什么：第十五切片条目 + ledger v20 指针）；ledger v20
    （表头 bump + **D-34 新行**[.length/char_at 语义不一致实测定谳+
    D-20③ 翻案注记/char_at 原语定谳/--cftmp- 观测项/pristine 期望表
    校正] + D-20③ 行内实测校正注记 + D-21 v20 扩记[工具链家族重建窗
    全录 + probe 全族复跑]）。负向证：契约签名零变化（api.at 零 diff）
    /front 零改动（D-33② 零新增自动成立）/.console 存量复核零/gen/
    ignored 无手改/冻结池家族仓零接触/**probe 全族 13 件复跑**（12
    件 RESULT 全绿含 probe_casefold + probe_receipt_d19 负结果复现
    一致——D-19 维持原样与 016 在册态同判）；gate 复跑 = 分段判绿在案
    （T-04 详录——单命令复核留家族稳定窗，先例在册）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；零待裁探针——
四级序/迁移组合/split 段法全在册形态）。

## 9. 复审记录

- **2026-09-25 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-017，revision 1。
  - `outcome: pass`——可进 work（016 已归档 6039a8a——正常立项窗）。
  - `next: work`（T-01 起；零待裁探针）。
  - **006 G3 裁决翻转**（case-only 拒 → 解锁）随解析序扩容一体
    成立（§4.1 授权评估——异议随 handoff 提出）。
- **2026-09-25 work 收口（auto-plan-work）**：
  - `stage: work | PLAN-017 | revision 1 | outcome: pass（execution_done）`
  - `code_commit`: ed7fc3c（T-01）→ 0c6422d（T-02）→ b3fd5a3（T-03）
    → 47103d9（T-04）→ T-05 文档件（随本记录同批提交）——直接 main
    线性约定（015/016 同款；worktree 清单仅 main）。
  - `task_ids`: T-01..T-05 全勾。
  - `evidence`: AC-01 probe_casefold 七案双臂 58 PASS[①..⑥+pristine
    10 链接零漂移] + AC-02 probe_rename ⑧ 翻转/⑧b 全等拒 + 006 八案
    回归零变化 + 矩阵/e2e case-only 弧线双臂 + AC-03 probe_alias_
    linkify ⑪..⑮ + 矩阵 ⑧ 三态体磁盘逐字节 + AC-04 vm 矩阵 16/15
    多轮[基线 v15 零漂移——零重锁第二例]+ e2e 5 连绿[43.8-44.2s]+
    build 绿[环境路由]；AC-05 静态负向证 + probe 全族 13 件复跑[12
    绿 + receipt 负结果一致]；AC-06 SD-1701..1704 + ledger v20。
  - `execution 期校正/实勘在册`: §10.1 落定（跨目录变体通道）；§6⑤
    口径落定（副作用圈定）；**D-34① .length/char_at 语义不一致**
    （D-20③ 翻案——T-03 首版败形 matrix ⑧ 抓出 + last_char_cp 修）
    + ② char_at 定谳 + ③ --cftmp- 观测项 + ④ pristine 期望表校正；
    e2e 断言口径 2 件（DOM 渲染文/JSON 壳）；**工具链家族重建窗**
    （gate 单命令外部阻塞——分段判绿在案，unblock = 家族稳定窗复核，
    PLAN-013 v16 先例）。
  - `blockers`: 无阻塞项；观察项两条——①gate 单命令复核待家族工具
    链稳定窗（分段判绿在案）；②case-only 迁移段失败残留（发生率
    预期零——全窗实录零残留）。
  - `next: review`（复审独立会话/工件重建口径——016 同款）。
- **2026-09-25 复审 r1（auto-plan-review）**：
  - `stage: review | PLAN-017 | revision 1 | outcome: pass`
  - `reviewed_commit`: 898a4e7（全窗五提交 ed7fc3c→0c6422d→b3fd5a3→
    47103d9→898a4e7；base=6039a8a）；`base_commit`: 6039a8a；
    `dependency_revisions`: auto-lang 双 exe 家族重建中间态（debug
    11:00 / release 17:58——ledger D-21 v20 全录；无依赖工作树）。
  - **独立性声明**：与执行同会话——按技能口径以**工件重建**重构裁定
    （实现 diff 全文实勘 + 全部 AC 现跑复放 + 锚注核验），不以执行
    摘要为凭。工作树零 WIP。
  - `spec_inputs`: ARCHITECTURE.md（§5 链接域/§6 测试体系）、
    README.md（Tests/是什么·文档）、parity-ledger.md v19→v20、
    计划 §5.3 规范增量表。
  - `acceptance_results`（全现跑复放）：
    - AC-01 **pass**：probe_casefold 双臂现跑全绿（解析四级序 ①..⑥
      + pristine 10 链接零漂移 + 双臂深等）+ matrix check 10/⑦
      links_json target_path 直证含。
    - AC-02 **pass**：probe_rename 现跑全绿（⑧ 翻转/⑧b 全等拒/006
      八案回归零变化）+ matrix check 12 case-only 弧线双臂。
    - AC-03 **pass**：probe_alias_linkify 现跑全绿（⑪..⑮ + 010/013
      案组回归）+ matrix ⑧ 三态体磁盘逐字节。
    - AC-04 **pass（F-R17-1 观察项随记）**：vm_matrix ALL GREEN
      现跑（merged 16/16 含基线 v15 零漂移——零重锁第二例 + split
      15/15；**复审窗 popover 内容窗瞬态 3 连后冷却即绿**——v11③
      在册家族签名，冷却重跑判绿与史载口径一致）+ vue build 绿
      （记录在案环境路由：AUTO_EXE=release + SCHEMA_DRIFT_GENERATE_
      AT=1）+ vue e2e 十五段绿（44.6s）；**gate 单命令未达 = 外部
      工具链家族重建窗**（hello-world 判别=输入相关 + **pre-017
      状态[6039a8a checkout]同败实勘**=非本批引入——见 F-R17-1）。
    - AC-05 **pass**：全窗 diff 面清点（api.at/front/deps/gen 零
      变化——零新契约/front 零改动/gen 生成物）+ probe 全族 13 件
      （T-05 窗 12 RESULT 绿 + receipt 负结果与在册一致；复审窗
      抽样 probe_dir_ops 现跑绿——目录级 casefold 拒未波及）+
      冻结池/家族仓零接触。
    - AC-06 **pass**：锚注实勘 SD-1701@ARCH:782（§5 链接域段——
      四级序定文+裁决翻转注记+定谳并账）/SD-1702@ARCH:850+854（§6
      头注+矩阵行+e2e 行）/SD-1703@README:182+410（Tests 头注+N
      定谳）/SD-1704@README:455（ledger v20 指针——另第十五切片
      条目@是什么节）；ledger v20 表头 bump + D-34 新行 + D-20③
      行内校正注记 + 34 项计数核验。
  - `findings`: **F-R17-1（low·非阻塞·观察项）** gate 单命令 ALL
    GREEN 待家族工具链稳定窗复核——三段各自现跑绿 + 环境路由在册；
    阻塞证明为外部（pre-017 同败 + hello-world 输入相关判别）；
    unblock = 家族 exe 稳定后跑 `node scripts/gate.mjs`（PLAN-013
    v16 先例；merge 窗 known-good checkpoint 若稳定可顺手闭合）。
    无阻塞 finding。
  - `evidence`: 计划 §8 各任务证据块（durable：commit 哈希 + probe
    RESULT 行 + matrix/e2e 现跑记录 + ledger D-34/D-21 v20）；复审批
    判基线 = 本记录（工件重建口径）。
  - `next: merge`。
- **2026-09-25 merge 收口（auto-plan-merge，PLAN-017:r1）**：
  - `prepared` = 复审基线 r1（reviewed_commit=898a4e7 + 复审记录
    1c18e65）+ canonical delta 落位核验（SD-1701@ARCH:782 / SD-1702
    @ARCH:850+854 / SD-1703@README:182+410 / SD-1704@README:455——
    复审窗实勘在案）+ **delivery_commit=1c18e65 docs-only 后代核验**
    （898a4e7..1c18e65 全窗 diff = 计划文件 51 行，src/deps/tests/
    e2e 零变化，实现/依赖零变化）。
  - `landed` = main tip == 1c18e65 直接 main 线性约定（015/016 同款
    ——无 dev 分支无 ff 步，tip 即 delivery）+ **known-good = merge
    窗 vm 双臂矩阵现跑 ALL GREEN**（merged 16/16[基线 v15 零漂移] +
    split 15/15）；gate 单命令维持 F-R17-1 观察项（家族重建窗 exe
    未变——debug 11:00/release 17:58，稳定窗复核留观）。
  - `ledger_refreshed` = parity-ledger **v20** tracked 在 main 读回
    （表头 v20 bump + D-34 新行 + D-20③ 行内校正注记 + D-21 v20 扩记
    + 34 项计数核验；无 live ledger 服务——PLAN-001 同判，tracked
    文件即派生视图）。
  - `archived` = git mv → docs/plans/archived/017-casefold-boundary-
    slice.md + status archived + completion_kind delivered（本提交）。
  - `cleaned` = 无 worktree/dev 分支（直接 main 约定——worktree 清单
    仅 main，代码工作树零 WIP）；无依赖工作树。
  - `outcome: pass`——五 checkpoint 闭环；PLAN-018 候选首位 = 大纲
    （anchor-reveal 解锁——连续九片门控；gate 单命令复核随家族稳定
    窗列入候选池观察项）。

## 10. 待澄清事项

1. **大小写变体双档并存的断言通道**（✅ T-01 已落定）：Windows 同档
   不可造 `A.ad`+`a.ad` 双档——**跨目录变体通道**（root × wiki/：stems
   全局收集天然可并存；casefold 竞争档 walk 序更早的构造由 fixture
   布局保证）——probe_casefold 案② 直证；级间序 ②>③/③>④ 竞争对
   同批直证；证据块在 §8 T-01。
2. **词边界 62 字符集**（已随 r1 定；T-03/T-04 实现落定）：`A-Za-z0-9`
   阻断集；`_`/`-` 豁免不阻断（probe ⑬ my-CAP-x/CAP_ 直证）；语料
   常规形态外首现时重议 §10 维持。
3. **两步迁移 tmp 残留**（观测项——T-02/T-05 实录）：全窗零残留
   （probe_rename ⑧ + 矩阵/e2e 弧线断言在册）；ledger D-34③ 留观。
4. **D-21 POST 波及**（观测项）：rename 两步 = 单 POST 双 move——
   本窗 HTTP 丢参/进程死亡零复现（D-21 v20 扩记如实）；**新形态两笔**
   ：vue gen 满核自旋[debug]/schema drift[release]——工具链家族重建
   窗实录（gate 单命令分段判绿，unblock = 稳定窗复核）。
5. **Unicode 规范化（NFKC）**（顺延候）：全角/宽字符等价——解析四期
   候选（若真实语料首现）；本批未做（定文在 SD-1701 §非目标）。
6. **PLAN-018 候选池**（本批后更新）：大纲（anchor-reveal 解锁——
   连续九片门控；上游 PLAN-701/702 他仓线忙）、目录移动/合并、检索
   上量微批、Time front 面 probe 批、url_decode 供料回执件（**家族
   重建窗后重勘**——双 exe 状态分野待稳定）、trash 预览/批量恢复、
   Unicode 规范化批、**gate 单命令复核**（家族稳定窗——017 遗留
   观察项）。
