---
plan_id: PLAN-012
status: executing
feature_name: dir-move-search-alias-slice
author: [zhaopuming]
created_at: 2026-09-23T23:04:15+08:00
updated_at: 2026-09-23T23:04:15+08:00
plan_revision: 1
current_step: 3
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1201"
  - "docs/ARCHITECTURE.md#SD-1202"
  - "docs/README.md#SD-1203"
  - "docs/README.md#SD-1204"
touched_goals: []
---

# [PLAN-012] 知识库第十切片——目录面（新建目录/移动档）+ 检索 alias 匹配

## 0. 变更摘要

SD-301/SD-405 主线第十片，双件（工作区组织二期 + 检索补全）：

1. **目录面**——EXPLORER 从平铺工作区升级为可组织面：**新建目录**
   （EXPLORER 头部第二钮 → 弹层输入名 → back `create_dir` POST →
   树新目录行）+ **移动档**（选中档 Ctrl+Shift+M / 菜单「文件→移动
   到目录…」→ 弹层目标目录（**ft_nodes 本地派生目录清单**——同步
   零 D-28② 竞态窗）→ back `move_page` POST（read+write+delete 组合
   ——006 定文形态）→ tab 路径复用 `TabsRenamed` 全量更新 + 刷新族
   v5）。**移动不改 stem ⇒ 链接零改写**——与 SD-601 改名改写、
   SD-701 删除悬空构成三语义对照并表。
2. **检索 alias 匹配**——`search_json` title 命中面 = stem ∪ aliases
   （010 落地的 `page_aliases` 表接入检索 walk；alias-title-only 命中
   → snippet="" 同判）——属性写面（011）与别名解析（010）交付后，
   检索是 alias 数据流的最后消费缺口。

北标对表：长期 Obsidian 线（目录组织 + 检索完备）；短期 Typora 线
**连续四片无解锁件**（D-12 定位面 / Time 日期原语——ledger v14 原样，
上游供料是唯一 unlock，§2.1 对表如实记）。上游缺口适配内置：D-19
（create_dir/move_page POST——CJK 目录/档名常态）；D-24②（原语返值
忽略 + exists 双复核）；D-24③④⑤；D-25①；D-26②/D-28②（自派生 +
零 fetch 预填——弹层预填全走 ft_nodes 本地派生）。

## 1. 目标

- **G1（新建目录可用·双轨）**：EXPLORER 头部「⊕」钮 → 弹层（目录名
  input，清洗复用 title_to_path 去 .ad 段）→ 确认 → 工作区根新目录
  落盘 + 树新行（可展开空态）；同名幂等（已存在 → 返回现路径 + 树
  无变化 + console）；取消零落盘。
- **G2（移动档可用·双轨）**：选中 .ad 档 → Ctrl+Shift+M/菜单 → 弹层
  （目标目录 input，预填 = 该档现目录，**placeholder 列出 ft_nodes
  派生的全部目录路径**）→ 确认 → 磁盘移动（`{dir}/{stem}.ad`，read+
  write+delete 组合 + 双复核）→ tab 条路径/标题全量更新（TabsRenamed
  复用）+ 树刷新（档行入新目录）+ 链接/标签面板路径刷新（**stem 不变
  ⇒ 出链/反链/wanted 行为零变化**——语义对照断言）+ ft_sel 更新；
  目标冲突（目标处同名 .ad）拒 + 弹层留置；取消零落盘；同目录 =
  幂等返回现路径。
- **G3（检索 alias 命中）**：`search_wiki("帽子定理")` 命中声明该
  alias 的档（title-only → snippet=""）；stem 命中优先序不变；命中
  行 title 显示 = stem（口径不变）。
- **G4（测试面）**：file 组子步扩（目录面弧线）+ find 组子步扩
  （alias 检索）——**组数不变 16/15/十五段**；基线 **v11** 计划内
  重锁（store dir_open/move_open + App dir_q/move_q）。
- **非目标**（明确排除）：
  - **删除目录/重命名目录**（remove_dir_all 递归删除破坏面大——
    独立批 + 二次确认设计；本批只加不改不删）；
  - 嵌套目录创建（`a/b` 多层路径——File.create_dir 非递归预期，v1
    单层；嵌套后续批）；
  - 目录拖拽/右键（事件面未证——同 007 §1 排除口径）；
  - 移动中的链接改写（**结构性不需要**——stem 不变；对照表入
    SD-1201 防误期待）、跨工作区移动；
  - 大纲（D-12）、每日笔记+时间戳（Time）、casefold+词边界批、
    title 键编辑、检索上量微批、上游件实做与生成物补件（AC-05
    负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十片是目录面 + 检索 alias）

- **候选池对表**（PLAN-011 §10.7 在案 + ledger v14 实核）：大纲
  （D-12 原样——**连续四片门控**）、每日笔记+时间戳（Time 原样——
  同上）、移动/新建目录（**本批**）、casefold+词边界（裁决重、可见
  价值低）、检索面 alias 匹配（**本批**——小件）、title 键编辑
  （frontmatter title 零消费面——价值空转）、检索上量（未触发）、
  供料回执（上游未动）。北标口径（SD-405）：长期 Obsidian 线——
  真实知识库必然分层（项目/主题目录），007 的根落位平铺是 bootstrap
  简化；目录面补齐工作区组织最后一块，且移动的「链接零改写」语义
  是知识库结构自由度的保证（用户可随时重组目录而不伤链接网）。
- **检索 alias 收尾论据**：010（解析）+ 011（写面）后 alias 数据流
  只剩检索消费缺口——`search_wiki` 找不到已声明别名的内容是可感知
  的不一致（面板/出链认 alias，检索不认）。
- **形态复用度**：移动 = 006 read+write+delete 定文形态 + TabsRenamed
  在册口；新建目录 = create_page 弹层同构（清洗复用）；检索 alias =
  `page_aliases`/`collect_ad_pages` 在册表接入（wsys.at:331-338 同款
  模式）。**零新 UI 形态**（dialog+input 第七/八实例）。

### 2.2 数据面（back：两契约 + 检索扩）

```rust
/// 新建目录（根落位；清洗同 title_to_path 去 .ad 段；幂等返回现路径）
/// POST /api/create_dir
#[api(method = "POST", path = "/api/create_dir")]
pub fn create_dir(name str) str {
    return wsys.create_dir_impl(name)
}

/// 移动档到目标目录（stem 不变——链接零改写；read+write+delete 组合；
/// 冲突/缺失拒；同路径幂等）
/// POST /api/move_page
#[api(method = "POST", path = "/api/move_page")]
pub fn move_page(path str, dir str) str {
    return wsys.move_page_impl(path, dir)
}
```

- **POST 通道**（D-19——CJK 名常态）。
- **create_dir_impl**：清洗（`title_to_path_stem` 复用——011 页内
  派生件）→ 空 → ""；`File.create_dir(resolve(safe))`（**探针 A 可
  调性**——别名双表在册 [native_catalog 1763/2606]，`create_dir`
  非关键字[D-24① copy 教训对表：标识符形态，风险低]，返回值忽略）；
  双复核 `File.exists` → 返回 safe；失败 ""。
- **move_page_impl 五步**：①卫：源 exists（否 → ""）；目标目录有效
  ——`File.is_dir(resolve(dir))`（**探针 B**；fallback = File.exists
  [同名文件误判边案记账 §10.3]）；②同路径幂等（dir == 源目录 → 返回
  原 path）；③冲突卫：`File.exists(resolve(dir + "/" + fname))` →
  ""（fname = 源文件名段——split("/") 末段）；④组合迁移：
  `File.write_text(new_full, File.read_text(old_full))` →
  `File.delete(old_full)`（**D-24② 返值忽略 + 双复核**：新档在 &&
  旧档无——006 定文形态原样）；⑤返回新 rel 路径。
- **检索扩（search_json）**：walk 内 `fm = frontmatter_of(read_text
  (rel))` → `als = page_aliases(fm)`（010 在册件——links_json:338 同
  款）→ title 命中面 = stem ∪ aliases（to_lower 同口径）；**排序/序
  不变**（walk 序）；alias-title-only 命中 → snippet = ""（SD-401
  口径续）。
- **移动-链接语义定文（SD-1201 三联对照并表）**：改名（SD-601）=
  stem 变 ⇒ 改写入链；移动（本批）= stem 不变 ⇒ **零改写零断链**；
  删除（SD-701）= 档消 ⇒ 入链悬空。链接网对目录结构完全无感——
  组织自由度保证，canonical 并表防隐性期待。

### 2.3 消费面（front）

- **store**：`dir_open`/`move_open` bool + 四开关口（弹层族续）。
- **App 模型**：`dir_q`/`move_q` str（弹层 input 值）。
- **入口**：EXPLORER 头部第二钮「⊕」（icon "folder-plus"——007
  「＋」钮同构相邻）；action `file.move`（title「移动到目录…」、
  shortcut **Ctrl+Shift+M**——M 空闲实核[Ctrl+M/Ctrl+Shift+M 均未
  用]）+ menubar 文件项（「重命名…」与「页面属性…」之间）；**不挂
  状态 enabled**（D-24③——handler 守卫 ft_sel）。
- **弹层双形（dialog 第七/八实例）**：新建目录（单 input「目录名」+
  取消/创建）；移动（单 input「目标目录」+ 预填 = 源档目录（**本地
  派生**——active_path/ft_sel split("/") 去末段，同步无 D-28② 竞态
  窗）+ placeholder = ft_nodes 派生目录清单首项（`dirs_of(ft_nodes)`
  纯函数——栈式 while 展开 kind=="dir" 节点）+ 取消/移动）。
- **流程**：`.DirGo`：`r = create_dir(.dir_q)` → 非空 → 关弹层 +
  `refresh_tree()`（新目录行；**links 不刷**——目录不进链接面）；
  `.MoveGo`：`r = move_page(.ft_sel, .move_q)` → 非空 → 关弹层 +
  `store.TabsRenamed(old, r)`（006 在册口——path/title/key 全量）+
  `store.Reload()`（body 不变但重挂载播种链一致性——幂等无害）+
  **刷新族 v5**：`refresh_tree()` + `LinksRefreshOf(r)` +
  `refresh_tags()`（路径面）+ bl/ol 行重算（显式 r）+ `ft_sel = r`；
  拒（""）→ console_log + 弹层留置（006 口径）。
- **触发集 v5** = v4 + **移动成功**（新建目录不进触发集——无链接/
  标签面消费；树单独刷）。

### 2.4 键位/菜单面

Ctrl+Shift+M = 移动（新键位唯一增量）；EXPLORER 头部「＋」「⊕」双
钮并排；menubar 文件菜单增「移动到目录…」。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「计划011已经完成。请给下一个任务立项
  [$auto-plan-new]」——**立项授权**：011 已归档（b0011dd——正常
  立项窗）。方向选择（目录面 + 检索 alias 双件）= 候选池对表 +
  §2.1 依据；handoff 未否决即生效（PLAN-004..011 同款约定）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓实读，2026-09-23 @ main 0c7e534/b0011dd）

- **在册扩展点**：
  - wsys `title_to_path` 族清洗（PLAN-005/011——dir 清洗复用去
    .ad 段）；`collect_ad_pages`（:285——链接/检索共享注释在案）；
    `page_aliases`/`frontmatter_of`（010/011 落地——检索扩接入件，
    links_json:331-338 同款模式）；006 read+write+delete 迁移组合
    定文（SD-601——move_page 直接复用形态）；
  - front `TabsRenamed`（006——tab 路径全量更新口）；`refresh_
    tree`/`LinksRefreshOf`/`refresh_tags`（刷新族——v5 接线）；
    dialog+input 主形态（弹层族六实例——第七/八同构）；EXPLORER
    「＋」钮（007——「⊕」同构相邻位）。
- **原语面实核**：`File.create_dir`(1004)/`File.is_dir`(1009) 别名
  双表在册（native_catalog 1763-1770 + 2606-2613——与 File.delete
  [已证可调]同表同族；`create_dir`/`is_dir` 均非关键字——D-24①
  copy 教训对表：copy 为硬关键字 token.rs:397，本两件为普通标识符
  形态）→ **探针 A/B 可调性仍前置**（别名在册 ≠ 可调——纪律），
  fallback 在案（§10.1/10.3）。
- **D-28② 竞态规避设计**（011 实勘首例）：fetch 型预填弹层竞态窗
  （vue 轨 fetch 返回晚于用户输入 → 覆写）——本批双弹层预填**全部
  本地派生**（移动预填 = 路径 split 同步；目录清单 = ft_nodes 栈式
  展开）——零 fetch 预填 ⇒ 零 D-28② 暴露面（设计声明入 SD-1201）。
- **D-27① 注记**（上游 PLAN-089 快照面变更——工具链敏感）：012
  测试面若再遇快照节点数变化（MouseArea 展开类），按计划内重锁处理
  + README 工具链口径（基线重锁先例 D-27① 在案）。
- **语料**：tmp/wiki-demo 平铺无目录（目录面测试 = 测试内 create_
  dir 造 + write_wiki 造档移动——fixture 每次全新隔离零污染）；
  检索 alias 已知答案素材 = 011 测试造档形态（`CAP 定理` 档 alias
  `帽子定理`——e2e/vm 造档先例直用）。
- **基线**：v10 现行（011）；**v11 变更面** = store dir_open/
  move_open + App dir_q/move_q + 弹层第七/八实例 id 序列。
- **键位面**：Ctrl+Shift+M 空闲（34 shortcut 实核无 M）；「⊕」icon
  = folder-plus（lucide 在册——007 plus 同源族）。

### 4.3 与既有计划的关系

- 复用 PLAN-005 清洗 / PLAN-006 迁移组合+TabsRenamed / PLAN-007
  EXPLORER 钮与删除语义对照 / PLAN-008 刷新族 / PLAN-010 alias 表 /
  PLAN-011 page_aliases 接入——**收割片**（007/008/009/010/011 同判）。
- 语义三联对照（改名改写/移动零改写/删除悬空）入 SD-1201——SD-601/
  701 并表扩为三联。
- D-12/Time 供料留观不变；D-24① copy 缺口对表注记（create_dir 探针
  依据）。
- PLAN-013 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  每日笔记+时间戳补写（Time 解锁——双件联动）、删除目录+重命名
  目录（目录面二期——二次确认设计）、casefold+词边界批、title 键
  编辑（消费面联动裁决）、检索上量微批、File.rename/copy 供料回执
  件、**上游快照/HTTP 面回执批**（D-27① 工具链敏感窗持续观测）。

## 5. 详细设计

### 5.1 back 契约与实现（SD-1201）

```
pub fn create_dir_impl(name str) str {
    // 清洗（title_to_path_stem 复用）→ 空→""；File.create_dir(
    // resolve(safe))（返值忽略）；双复核 exists → safe；失败 ""
}

pub fn move_page_impl(path str, dir str) str {
    // ①卫：源 exists；is_dir(resolve(dir))（探针 B；fallback
    //   exists——同名文件误判边案 §10.3）
    // ②同路径幂等 → 返回 path
    // ③冲突卫：exists(dir + "/" + fname) → ""
    // ④write_text(new, read_text(old)) → File.delete(old) →
    //   双复核（新在旧无——006 形态）
    // ⑤返回新 rel
}

// search_json：walk 内 fm → als = page_aliases(fm)；
// title 面 = stem ∪ als（to_lower 同口径）；序/walk/snippet 口径不变
```

### 5.2 front 接线（SD-1201）

- store：dir_open/move_open + 四口。
- app.at：msg `ActDirNew`/`DirEdit(str)`/`DirGo`/`DirCancel`/
  `ActMove`/`MoveEdit(str)`/`MoveGo`/`MoveCancel`；模型 dir_q/
  move_q；EXPLORER「⊕」钮 + action file.move/menubar 项；dialog
  第七/八实例；`dirs_of(ft_nodes)` 纯函数（栈式 while——collect_
  ad_paths 同族第三实例，kind=="dir" 过滤）；`.DirGo`/`.MoveGo`
  流程（§2.3——刷新族 v5 + TabsRenamed 复用 + ft_sel 更新）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1201 | modify | docs/ARCHITECTURE.md §5 文件管理域语义段 | before：文件面 = 根落位新建/删除（SD-701）；无目录面；检索 title 面 = stem。after：①**目录面**——create_dir POST（清洗复用/幂等/双复核）、move_page POST（五步/同路径幂等/冲突拒/read+write+delete 组合定文复用）；**移动语义三联对照并表**（改名=stem 变⇒改写/移动=stem 不变⇒零改写零断链/删除=档消⇒悬空——组织自由度保证）；front 面（EXPLORER「⊕」/Ctrl+Shift+M/弹层双形/**本地派生预填零 D-28② 窗**/dirs_of 清单/TabsRenamed 复用）；触发集 v5 = v4 + 移动成功；②**检索 alias 匹配**——search_json title 面 = stem ∪ aliases（alias-title-only → snippet=""）；③探针 A/B 依据与 fallback 注记（D-24① 对表） | 工作区组织二期 + alias 数据流收尾；三联语义并表防误期待 | AC-01/02/03/06 |
| SD-1202 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v10。after：组数**不变**（目录面子步入 file 组、alias 检索子步入 find 组——域内聚）+ **基线 v11**（store dir/move 面 + App dir_q/move_q + 弹层第七/八实例；v10 留档） | 测试体系表更新（009..011 子步内聚口径续） | AC-04 |
| SD-1203 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v10。after：口径不变 + file/find 组子步扩注记 + 基线 v11 指针 + N 定谳续记 | 判绿口径单一权威面（…/1103 续） | AC-04 |
| SD-1204 | modify | docs/README.md「是什么/文档」节 | before：第九切片=页面属性写面。after：**第十切片=目录面+检索 alias**条目（三联语义注记）+ ledger v15 指针 | 产品主线进度面派生同步（…/1104 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：目录面八案——①新建（根新目录 + exists
  复核 + 返回路径）②清洗（非法字符名）③同名幂等（已存在 → 返回现
  路径零变化）④移动基础（档入新目录：旧无新有 + 字节整迁逐字节 +
  **源档 frontmatter/body 完整**）⑤移动冲突拒（目标处同名 .ad → ""
  零变化）⑥同路径幂等 ⑦目标目录缺失拒 ⑧CJK 目录名/CJK 档名移动
  （POST 双臂）。检索 alias 三案——⑨alias 命中（造 alias 档 →
  search_wiki(alias) 返回该档 + snippet=""）⑩stem 优先序不变（语料
  基线回归）⑪alias+body 双命中（snippet 非空——body 含词时）。
- **vm 矩阵（T-04）**：
  - file 组子步：①EXPLORER「⊕」→ 弹层 → 创建 → 树新目录行（可展开
    空态）②选中档 → Ctrl+Shift+M → 弹层预填（现目录）→ 输入新目录
    → 移动 → 树新位（目录下档行）+ tab 标题不变路径变（state 断言）
    + **出链/反链行零变化**（三联语义断言——面板快照前后一致）③
    取消零落盘 ④冲突拒弹层留置；
  - find 组子步：⑤造 alias 档保存（011 属性弹层或 write_wiki 造）→
    Ctrl+Shift+F 搜 alias → 命中行（title=stem）。
- **e2e（T-04）**：file/find 段子步扩同弧线（真 DOM；CJK 目录造/
    移动 POST 双臂可跑——目录行断言不涉开档面）。
- **基线 v11（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v10 留档。
- **负向（T-05）**：`.console` 零赋值；既有契约零变化回归（含 011
  page_meta/set_page_meta）；冻结池/家族仓零接触；补件面零增量；
  **链接网零扰动证**（移动前后 link_index 出链/反链集合逐字节比对
  ——仅 path 字段变化的定向 diff 断言）。

## 7. 验收标准

- **AC-01（目录面 back）**：§6 八案双臂全绿；幂等/冲突/双复核逐案
  可证；字节整迁逐字节。验证：T-01 直证实录。
- **AC-02（目录面 UI 双轨）**：新建（钮→弹层→树新行→幂等→取消）
  与移动（选中→弹层预填→tab 更新→树新位→**链接面板零变化**→
  冲突拒→取消）双轨全绿，vm snapshot+state 与 vue e2e 同断言域。
  验证：T-04 file 组子步 + e2e。
- **AC-03（检索 alias）**：§6 三案双臂绿；stem 优先序与语料基线
  回归零漂移。验证：T-01 直证 + T-04 find 组子步。
- **AC-04（gate ALL GREEN + 基线 v11）**：`node scripts/gate.mjs`
  顺序全绿——vm merged **16/16** + split **15/15**（组数不变）+
  vue build + e2e **十五段**；基线 v11 重锁零漂移（v10 留档）；判绿
  实录进 §9（D-21/D-27① 工具链口径——重跑/重锁如实记）。
- **AC-05（负向证）**：冻结池与家族仓零接触；`gen/` 无手改；旧园零
  引用；补件面零增量；`.console` 零赋值；既有契约零变化；**链接网
  零扰动**（移动前后定向 diff）。
- **AC-06（文档面）**：SD-1201..1204 落位且锚注齐；**移动语义三联
  对照表**（改名/移动/删除）入 SD-1201；parity-ledger **v15**（探针
  A/B 定谳 + 执行期新实勘）。

## 8. 执行步骤

- **T-01 back 契约 + 探针 + 直证**（AC-01/03）
  - 探针 A（File.create_dir 可调性）/B（File.is_dir）——首闸（fallback
    §10.1/10.3）；api.at 增 create_dir/move_page POST；wsys 双 impl
    + search_json alias 扩（page_aliases 接入）。
  - 十一案 merged 直调 + serve-back 直证（CJK 案双臂）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（现行组回归零
    变化）。
- **T-02 front 双弹层**（AC-02 前半）
  - store 双开态 + app.at EXPLORER「⊕」/action/menubar/dialog 第七/
    八实例 + `dirs_of` 纯函数 + 本地派生预填（零 fetch——D-28② 声明）。
  - 验证：merged 手动冒烟（新建目录/移动/取消/冲突）+ `pnpm build`
    PASS。
- **T-03 移动流收口**（AC-02 后半）
  - `.MoveGo` 刷新族 v5（TabsRenamed 复用 + Reload + tree/links/
    tags + ft_sel）+ 链接面板零变化冒烟（三联语义实证）。
  - 验证：merged 冒烟（移动前后面板快照比对）+ file/find 组回归 +
    e2e 子步冒烟。
- **T-04 测试扩单 + 基线 v11 + 判绿首锁**（AC-02/03/04）
  - vm file 组四子步 + find 组一子步 + e2e 扩 + 基线 v11 重锁 +
    链接网零扰动定向 diff 断言固化。
  - 验证：双臂全绿 + `pnpm test:e2e` 连跑 ≥5 + gate ALL GREEN。
- **T-05 文档 + ledger v15 + 收口**（AC-05/06）
  - SD-1201..1204 落位（三联对照表 + D-28② 零暴露声明）；ledger
    v14→v15（探针定谳 + 实勘）；负向证采集；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；探针 A 为首闸）。

## 9. 复审记录

- **2026-09-23 work T-01（back 半收口，提交 2eb26ac）**：
  - 探针 A/B 定谳双绿（e2e/.runtime 临时探针实跑）：`File.create_dir`/
    `File.is_dir` 解析/执行/语义全过。**执行期实勘**：
    `create_dir` = **create_dir_all 递归语义** + 已存在幂等不炸（≠ §10.3
    非递归预期——清洗层 "/" → '-' 在前，弹层输入结构性不含分隔符，
    v1 单层口径不变；递归面零暴露——ledger v15 记账件）。
  - api.at 双契约（create_dir/move_page POST——D-19 body 传参）+
    wsys.at create_dir_impl（清洗复用/幂等卫/is_dir 双复核/同名文件
    拒）+ move_page_impl（五步定文：exists+is_dir 卫[dir_norm 归一]/
    同路径幂等/冲突拒/read+write+delete 组合/双复核）+ search_json
    title 面扩 stem∪aliases（alias-title-only snippet=""）。
  - tests/probe_dir_move.mjs 十一案双臂全绿（目录面八案+检索 alias
    三案——⑨title=stem 口径+⑩语料基线逐字节[Hello World 代码块
    `Jade Garden` 行实勘入期望]+⑪双命中 snippet 非空；磁盘逐字节/
    三拒/幂等复核+副作用圈定）+ vm 矩阵现行组回归零变化
    （merged 16/16+split 15/15）。
  - `stage: work | PLAN-012 | rev 1 | outcome: pass(T-01) |
    commit=2eb26ac | task=T-01 | next: T-02`

- **2026-09-23 work T-02+T-03（front 双弹层 + 移动流收口，提交 待补）**：
  - store 双开态 dir_open/move_open（基线 v11 面）+ 四口 DirOpen/
    DirClose/MoveOpen/MoveClose（MetaOpen 同构）；App 模型 dir_q/
    move_q + 八 msg；`dirs_of`/`dirs_first`（collect_ad_paths 同族
    第三实例——ft_nodes 本地派生零 fetch，D-28② 规避在册形态）/
    `dir_of_path` 纯函数族；EXPLORER「⊕」第二钮（folder-plus——
    「＋」同构相邻）；action file.move（Ctrl+Shift+M 不挂 enabled
    D-24③）+ menubar 文件项（重命名与页面属性之间）；dialog 第七/
    八实例（声明位 rename 前——input 序居末锚纪律）；触发集 v5 =
    v4 + 移动成功（新建目录只刷树不进链接/标签触发集）。
  - merged 冒烟全绿（runtime 临时脚本）：新建目录/取消零落盘/移动
    弧线（tab 路径全量 + 磁盘整迁 + **面板快照前后逐字节一致——
    移动零扰动三联语义实证**）/冲突拒弹层留置/同路径幂等。
  - `pnpm build` 绿（首跑 D-21 负载窗 0xC0000409 如实记——README
    口径重跑即绿）。
  - **执行期校正三件**：①EXPLORER 双钮序纪律——「＋」居「⊕」前
    （vm_matrix pressExplorerPlus 取 EXPLORER 行首 button 子为在册
    结构锚，序翻锚误中）；②tab 标题口径 = strip_ad **全路径**
    （"smoke-dir/SmokePage"——非 stem；matrix check12 wiki/Project X
    同款在册口径，G2「标题不变」语义 = 路径去 .ad 后目录段变化、
    stem 段恒等）；③vm 快照 input 头不投影 placeholder 属性——
    placeholder=.move_ph 绑定形态 vue e2e（T-04）DOM 面断言。
  - `stage: work | PLAN-012 | rev 1 | outcome: pass(T-02/T-03) |
    task=T-02/T-03 | next: T-04（file/find 组回归 + e2e 子步 = T-04
    扩单一体——基线 v10 已因弹层第七/八实例漂移，现行组回归与
    v11 重锁同批做）`

- **2026-09-23 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-012，revision 1。
  - `outcome: pass`——可进 work（011 已归档 b0011dd——正常立项窗）。
  - `next: work`（T-01 起；**探针 A 为可行性首闸**——create_dir
    可调性，fallback 链 §10.1）。
  - 探针 B 次之（is_dir——有 exists fallback 不阻塞）；其余全为
    在册已证面。

## 10. 待澄清事项

1. **File.create_dir 可调性**（探针 A，T-01 首闸）：别名双表在册 +
   非关键字形态（对表 File.delete 已证可调）——风险低但纪律前置。
   fallback：不可调 → **目录面 blocked**（ledger 记账 + 供料候选
   [create_dir shim]）→ 本批降级为检索 alias 单件（009 Time 先例）；
   仅新建目录不可用而移动可（is_dir 可调）→ 移动面向已存在目录交付
   （测试内以外部 mkdir 造目录）——降级形态 T-01 落定。
2. **File.is_dir 可调性**（探针 B）：fallback = File.exists 卫语句
   （同名文件误判目录的边案记账——目标写 `{dir}/{stem}.ad` 冲突卫
   兜底，实害 = 档被移到文件名同级路径下失败，双复核拦截）。
3. **嵌套目录创建**（v1 单层）：`File.create_dir` 非递归预期——
   `a/b` 双层名清洗后为单层字面目录（`-` 连接）；递归创建后续批
   （std::fs::create_dir_all 供料候选随探针 A 一并议）。
4. **检索 alias 显示**（v1 title=stem）：命中行不显示命中别名——
   用户搜「帽子定理」见「CAP 定理」行（可点击，认知可接续）；命中
   别名回显（title 括注）后续 UX 批。
5. **D-21 POST 波及**（观测项）：移动 = 双 POST 密度（write+delete
   组合在 back 单事务——front 单 POST/次）；负载窗按 README 重跑
   口径，ledger v15 如实记。
6. **D-27① 工具链敏感窗**（观测项）：上游 PLAN-089 快照面变更后
   工具链仍敏感——测试面遇节点数漂移按计划内重锁处理（011 同判）。
7. **PLAN-013 候选池**（本批后更新）：大纲（D-12 解锁——首位顺延
   候）、每日笔记+时间戳补写（Time 解锁——双件联动）、删除目录+
   重命名目录（目录面二期）、casefold+词边界批、title 键编辑（消费
   面联动）、检索上量微批、File.rename/copy/create_dir 供料回执件。
