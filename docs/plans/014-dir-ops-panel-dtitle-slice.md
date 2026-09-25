---
plan_id: PLAN-014
status: reviewed
feature_name: dir-ops-panel-dtitle-slice
author: [zhaopuming]
created_at: 2026-09-24T16:51:21+08:00
updated_at: 2026-09-25T10:00:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1401"
  - "docs/ARCHITECTURE.md#SD-1402"
  - "docs/README.md#SD-1403"
  - "docs/README.md#SD-1404"
touched_goals: []
---

# [PLAN-014] 知识库第十二切片——目录面二期（删除/重命名目录）+ 链接面板行显示名化

## 0. 变更摘要

SD-301/SD-405 主线第十二片，双件（012/013 两片的直接补全）：

1. **目录面二期**——目录生命周期收口：**删除目录**（递归删除 +
   强确认弹层——「将删除目录 X 及 N 个文件（M 个 .ad 页）」+
   入链悬空警示，全部 **ft_nodes 本地派生**预览[零 fetch——D-28②
   规避]→ back `delete_dir` POST[remove_dir_all + 双复核]→ 目录下
   tab 全关[front 循环复用 `CloseTabsOf`——零新 store 面]→ 刷新族
   v6）+ **重命名目录**（纯 .ad 目录卫 → back `rename_dir` POST
   单事务逐文件 move 循环[read+write+delete——006/012 定文形态]→
   旧空目录 remove_dir → tab 全量 `TabsRenamed` 循环 → **stem 不变
   ⇒ 链接零改写**[三联对照续]）。
2. **链接面板行显示名化**——013 §10.1 留口的兑现：**反链行/提及行**
   path 文本 → `dtitle_of` 显示名（无 title 回落 path——身份域与
   显示域并存的次行/回落口径）；**出链行/wanted 行不动**（target =
   用户所写链接文本——显示即语义，SD-1301 解析域口径续）。语料
   已知答案修订（index.ad 反链源显示 首页）。

北标对表：长期 Obsidian 线（目录生命周期完备 + 显示名一致性——
013 四面显示名后面板行是最后不一致面）；短期 Typora 线连续六片
门控（D-12/Time ledger v16 原样——§2.1 对表如实）。上游缺口适配
内置：D-19（双契约 POST——CJK 目录名常态）；D-24②（返值忽略 +
双复核）；D-24③④⑤；D-25①；D-26②/D-28②（本地派生预填/自派生
刷新）；**D-30①（纯函数参数避模型名——新派生函数参数命名纪律）**；
D-29③（弹层钮标题锚）。

## 1. 目标

- **G1（删除目录可用·双轨）**：树选中目录行（ft_sel 目录态）→
  Shift+Delete / 菜单「文件→删除目录…」→ **强确认弹层**（目录名 +
  文件/页面计数 + **入链悬空警示**[目标页出链计数——dangling_
  impact 族派生]）→ 确认 → 递归删除（remove_dir_all + 双复核）→
  目录下 tab 全关（激活邻档补位）+ 树/链接/标签面刷新 + **入链悬空
  翻转可证**（SD-701 语义目录级复现）；取消零落盘；非目录/根拒绝。
- **G2（重命名目录可用·双轨）**：树选中目录行 → F2 语境分叉？——
  **独立入口**（菜单「文件→重命名目录…」+ Ctrl+Shift+R——与档
  F2 分口）→ 弹层（新名 input + 影响面预览「将移动 N 个 .ad 页
  （链接零改写）」——本地派生）→ 确认 → 单事务逐文件迁移（纯
  .ad 目录卫——非 .ad 子件拒）→ tab 全量更新（TabsRenamed 循环）+
  刷新族 v6 + **链接面板零变化断言**（三联对照目录级复现）；同层
  同名拒；取消零落盘。
- **G3（面板行显示名化·双轨）**：反链行文本 = dtitle_of(titles,
  source_path)（无 title 回落 path）；提及行 path 首行同化；出链/
  wanted 行零变化（断言面）；语料已知答案修订（index 反链源 → 首页）。
- **G4（测试面）**：file 组子步扩（目录二期弧线）+ link 组子步扩
  （面板显示名 + 目录删除悬空翻转）——**组数不变 16/15/十五段**；
  基线 **v13** 计划内重锁（store 双弹层面 + App 两 input 字段）。
- **非目标**（明确排除）：
  - 目录移动（跨父移动/合并——重命名 = 同层改名；移动目录后续批）；
  - 空目录轻确认与递归强确认分档（v1 恒强确认——简化口径）；
  - 非 .ad 子件目录的重命名支持（v1 纯 .ad 卫拒——guard 明示；
    混合目录后续批）；删除目录的回收站/撤销（远期）；
  - 出链/wanted 行显示名化（target 链接文本显示即语义——恒不动
    定文）；提及行 snippet 显示名化（snippet 是命中行原文）；
  - 大纲（D-12）、每日笔记+时间戳（Time）、casefold+词边界批、
    检索上量微批、上游件实做与生成物补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十二片是目录二期 + 面板显示名化

- **候选池对表**（PLAN-013 §10.7 在案 + ledger v16 实核）：大纲
  （D-12 原样——**连续六片门控**，候选池首位恒为「解锁候」）、
  每日笔记+时间戳（Time 原样）、**删除目录+重命名目录（本批）**、
  casefold+词边界（裁决重、中文语境可见价值低）、**链接面板行
  显示名化（本批——013 §10.1 留口）**、检索上量（未触发）、供料
  回执（上游未动）。北标口径（SD-405）：长期 Obsidian 线——012
  交付目录创建/移动后，**删除/重命名是生命周期最后缺口**（能建
  不能删=管理残缺）；013 四面显示名后**面板行是显示一致性最后
  面**（tab 显示 首页、反链行显示 index.ad——割裂可感）。双件均
  为在飞切片的直接补全（收割口径续）。
- **形态复用度**：删除 = remove_dir_all 原语（别名双表在册 1014/
  1015——probe 前置）+ 007 删除流同构（确认/刷新/tab 关闭面）；
  重命名 = 012 move_page 五步的循环组合 + 006 TabsRenamed 循环；
  面板名化 = 013 dtitle_of 纯函数第二消费面（D-30① 签名纪律沿
  用——参数名 rows 避开模型名 titles）。**零新 UI 形态、零新
  store 面**（两弹层 + 两循环复用）。

### 2.2 数据面（back：双契约）

```rust
/// 删除目录（递归；入链悬空化——SD-701 语义目录级；双复核）
/// POST /api/delete_dir
#[api(method = "POST", path = "/api/delete_dir")]
pub fn delete_dir(path str) str {
    return wsys.delete_dir_impl(path)
}

/// 重命名目录（同层改名；纯 .ad 目录卫；逐文件迁移单事务；
/// stem 不变 ⇒ 链接零改写）
/// POST /api/rename_dir
#[api(method = "POST", path = "/api/rename_dir")]
pub fn rename_dir(path str, new_name str) str {
    return wsys.rename_dir_impl(path, new_name)
}
```

- **delete_dir_impl 三步**：①卫：path 非空（根拒）+ `File.is_dir`
  （非目录拒——012 探针 B 已证可调）；②`File.remove_dir_all
  (resolve(path))`（**probe C 可调性前置**——别名双表在册[1015/
  2606 族]；返值忽略[D-24②]）；③双复核 `!File.exists` → 返回
  path；失败 ""。
- **rename_dir_impl 五步**：①卫：is_dir + 清洗 new_name（title_
  to_path_stem 复用）空拒 + 同层同名（casefold 同判拒——006 G3
  口径）+ **纯 .ad 卫**（fs.tree(resolve(path), 8) walk 段扫描——
  非 .ad 子件 → ""）；②子件清单收集（tree 标记法——links_json
  同族段收集）；③**逐文件迁移循环**（新 rel = new_dir + 余段：
  read_text → write_text → File.delete——move_page 五步体内复用）；
  ④旧目录 `File.remove_dir`（空目录原语——非递归口径）+ 复核
  （旧无新有）；⑤任一步失败 → ""（**部分迁移容忍注记**：循环中
  段失败留双份——v0 记账，同 006 copy+delete 非原子窗口家族）。
- **两契约均 back 单事务**（多文件 IO VM 内联——D-21 POST 密度
  不升）。

### 2.3 消费面（front）

- **store**：`deldir_open`/`rendir_open` bool + 四开关口（弹层族
  第九/十实例）。**零新操作面**——tab 关闭/更新走 front 循环：
  删除前自 ft_nodes 收集目录下 .ad 路径（`paths_under(ft_nodes,
  dir)` 纯函数——collect_ad_paths 同族）→ 逐 `store.CloseTabsOf(p)`；
  重命名同收集 → 新旧路径对逐 `store.TabsRenamed(old, new)`。
- **App 模型**：`deldir_q`（确认弹层不需 input——改 `deldir_target`
  显示用？设计：删除弹层零 input，目标/计数全预览文本派生——App
  仅 `deldir_open` 在 store、计数派生在渲染期）——实取：App 增
  `rendir_q` str（重命名 input 值）仅一字段；删除弹层零 App 字段。
- **入口**：action `file.deldir`（title「删除目录…」、shortcut
  **Shift+Delete**——与档 Delete 分键）+ `file.rendir`（title
  「重命名目录…」、shortcut **Ctrl+Shift+R**）+ menubar 文件项
  两枚（「删除…」与「退出」之间）；**不挂状态 enabled**（D-24③
  ——handler 守卫：ft_sel 非空且为目录行[路径无 .ad 尾且非空]）。
- **树行目录选中**：ft_sel 现仅档行置位——目录行点击 = FtToggle
  展开；**选中语义扩**：目录行点击双职责（OpenFile 分流已有目录
  分支 = toggle）→ 目录「选中」v1 口径 = **展开态首目录？不可靠**
  → 改口径：**右键替代不可用（事件面）——v1 入口走「最近展开
  目录」**？不可靠。**修正设计**：目录行增独立小钮？——树行结构
  锚敏感（D-29③）。**最简可靠口径：两入口的目标 = 目录 input 弹
  层**（弹层内 input 填目录路径——placeholder = ft_nodes 派生
  目录清单首项，同 012 移动弹层形态）——**ft_sel 不扩**，目录目
  标经弹层 input 指定（本地派生预填建议清单）。零树行结构改动。
- **弹层双形**：删除目录弹层（**目标 input**[预填建议] + 计数/
  悬空警示预览[随 input 值本地派生——`paths_under` + dangling
  impact 族] + 取消/删除双钮[危险钮序：删除居末]）；重命名目录
  弹层（目标 input + 新名 input 双栏 + 影响面预览 + 取消/重命名）。
- **面板行显示名化**：反链行 `text: dtitle_of(.titles, r.source_
  path, r.source_path)`；提及行 path 首行同化（`dtitle_of(.titles,
  r.path, r.path)`）；出链/wanted 行零变化。⚠ D-30①：所有新纯
  函数参数名避开模型字段名（rows/dir 名——源注记）。

### 2.4 键位/菜单面

Shift+Delete = 删除目录、Ctrl+Shift+R = 重命名目录（两新键位——
在册面无冲突[Delete/Ctrl+R 无绑定实核]）；menubar 文件菜单两枚
插入。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-24 会话口述：「计划013已经完成；请规划
  [$auto-plan-new] 下一个计划」——**立项授权**：013 已归档
  （a6bb9f9——正常立项窗）。方向选择（目录二期 + 面板显示名化
  双件）= 候选池对表 + §2.1 依据；handoff 未否决即生效（PLAN-004..
  013 同款约定）。
- **递归删除强确认语义**按默认提案（§2.3 弹层——计数 + 悬空警示
  双防线）；用户可翻（空目录轻确认分档 → r2 小范围）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05）。无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓实读，2026-09-24 @ main f2185fe/a6bb9f9）

- **在册复用件**：`File.is_dir`（012 探针 B 定谳可调——目录卫权
  威件）；`remove_dir`(1014)/`remove_dir_all`(1015) 别名双表在册
  （native_catalog 1770-1771 + 2613-2614——create_dir 已证家族；
  **probe C 前置**）；move_page 五步（012——rename_dir 循环体内
  复用）；`CloseTabsOf`/`TabsRenamed`（store:106/:523——front
  循环复用零新面）；`dtitle_of`（013——参数名 rows 签名[D-30①
  修复形态]）；`dangling_impact`（007——目录级悬空警示派生族）；
  `dirs_of`/`collect_ad_paths`（012/004——paths_under 同族新件）；
  弹层主形态（九实例——第十/十一同构）；移动弹层目录 input 形态
  （012——本批双弹层目标 input 同构先例）。
- **D-30① 纪律（013 实勘首例）**：vue codegen 对模型名统一发射
  `.value`——**纯函数参数与模型字段同名 → 参数被误发射 .value**
  （dtitle_of(titles,...) 首参踩雷实录）→ 本批全部新纯函数
  （paths_under/impact 族扩参）参数名避开模型名（rows/src 等——
  源注记 + AC-05 grep 证）。
- **D-29③ 弹层钮锚纪律**：本批双弹层标题唯一（「删除目录」/
  「重命名目录」——首现实例）+ 危险钮序（删除居末）。
- **语料/测试造档**：目录测试全走测试内造（create_dir + write_
  wiki——012 先例）；面板显示名已知答案：语料 index.ad 反链源
  （CAP 定理 的反链段 index 行 → 显示 首页——link 组断言修订面）。
- **基线**：v12 现行（013）；**v13 变更面** = store deldir_open/
  rendir_open + App rendir_q + 弹层第十/十一实例 id 序列。
- **D-12/Time**：ledger v16 原样（连续六片门控——§2.1 对表）。

### 4.3 与既有计划的关系

- 补全 PLAN-012（目录生命周期）+ PLAN-013（显示一致性——面板行
  兑现 §10.1 留口）；三联对照（SD-1201）目录级复现断言（删除目录
  = 悬空翻转[SD-701]、重命名目录 = 零改写[SD-1201]）。
- D-12/Time 供料留观不变；D-24① copy 缺口对表（remove_dir 族
  probe 依据）；D-30① 参数纪律首批次全面应用。
- PLAN-015 候选池（§10.7 更新）：大纲（D-12 解锁——首位顺延候）、
  每日笔记+时间戳补写（Time 解锁——双件联动）、目录移动/合并、
  casefold+词边界批、检索上量微批、File.rename/copy/remove_dir
  族供料回执件、上游快照/HTTP 面回执批。

## 5. 详细设计

### 5.1 back 双契约（SD-1401）

```
pub fn delete_dir_impl(path str) str {
    // ①卫：path != ""（根拒）+ File.is_dir(resolve(path))
    // ②File.remove_dir_all(resolve(path))——返值忽略（D-24②）
    // ③双复核 !File.exists → path；失败 ""
}

pub fn rename_dir_impl(path str, new_name str) str {
    // ①卫：is_dir + 清洗 + 同层同名（casefold）拒 + 纯 .ad 卫
    //   （fs.tree walk 段扫描——非 .ad 子件 ""）
    // ②子件清单（tree 标记法段收集）
    // ③逐文件迁移循环（move_page 五步体内复用——新 rel = 新目录
    //   + 余段）；④File.remove_dir(旧) + 复核；⑤返回新目录 rel
}
```

### 5.2 front 接线（SD-1401）

- store：deldir_open/rendir_open + 四口。
- app.at：actions 两枚 + menubar 两项 + 弹层第十/十一实例（目标
  input + 新名 input + 预览派生）；`paths_under(nodes, dir)` 纯
  函数（D-30① 参数纪律）；删除流（input 值派生计数/警示 →
  delete_dir → CloseTabsOf 循环 → 刷新族 v6 + ft_sel 复位）；重
  命名流（rendir → TabsRenamed 循环 → 刷新族 v6）；面板行两处
  dtitle_of 接线（反链/提及——fallback path）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1401 | modify | docs/ARCHITECTURE.md §5 文件管理域语义段 | before：目录面 = 新建/移动（SD-1201）；面板行 = path 身份域（SD-1301 v1）。after：①目录生命周期收口——`delete_dir` POST（递归 + 双复核 + **强确认双防线**[计数/悬空警示]；入链悬空化 = SD-701 目录级）、`rename_dir` POST（纯 .ad 目录卫 + 逐文件迁移单事务 + stem 不变零改写[三联对照目录级] + 部分迁移容忍注记）；入口 = 弹层目标 input（树行零结构改动口径）；刷新族 v6（+目录删除/重命名成功）；②**面板行显示名化**——反链/提及行 = dtitle（无 title 回落 path）；出链/wanted 行恒链接文本（显示即语义定文） | 目录生命周期完备 + 显示一致性收口 | AC-01/02/03/06 |
| SD-1402 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v12。after：组数**不变**（目录二期入 file 组、面板名化入 link 组[已知答案修订注记]）+ **基线 v13**（store 双弹层面 + App rendir_q + 弹层第十/十一实例；v12 留档） | 测试体系表更新（009..013 子步内聚口径续） | AC-04 |
| SD-1403 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v12。after：口径不变 + file/link 组子步扩注记 + 基线 v13 指针 + N 定谳续记 | 判绿口径单一权威面（…/1303 续） | AC-04 |
| SD-1404 | modify | docs/README.md「是什么/文档」节 | before：第十一切片=显示名。after：**第十二切片=目录生命周期+面板显示名**条目 + ledger v17 指针 | 产品主线进度面派生同步（…/1304 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：delete_dir 五案——①递归删除（造
  目录+2 档 → 消失 + 子档全无 + 返回 path）②根拒/非目录拒 ③
  CJK 目录名（POST 双臂）④空目录删除 ⑤双复核（缺失再删 → ""）；
  rename_dir 六案——⑥基础（造目录 2 档 → 改名 → 逐文件新位 +
  字节整迁 + 旧目录消）⑦纯 .ad 卫（混入非 .ad 子件 → "" 零变化）⑧
  同层同名拒 ⑨ CJK ⑩链接零扰动（前后 link_index 出链/反链定向
  diff——仅 path 字段变化归一相等）⑪缺失目录拒。
- **vm 矩阵（T-04）**：file 组子步——①删除目录弧线（强确认弹层
  计数/警示预览 → 确认 → 目录下 tab 全关 + 树行消 + **悬空翻转**
  [源档出链行存在→悬空]）②取消零落盘 ③重命名目录弧线（弹层 →
  确认 → tab 标题不变路径变 + 树新位 + **面板快照零变化**[三联
  对照]）④Shift+Delete/Ctrl+Shift+R 键程（menubar 共口先例）；
  link 组子步——⑤面板显示名（CAP 定理 反链段 index 行 → 首页；
  无 title 源档回落 path）⑥出链/wanted 行零变化（断言）。
- **e2e（T-04）**：file/link 段子步同弧线（真 DOM；CJK 目录 POST
  双臂）。
- **基线 v13（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v12 留档。
- **负向（T-05）**：D-30① 参数纪律 grep 证（新纯函数参数零模型
  名碰撞）；`.console` 零赋值；probe 全族六代回归（008..013——
  013 教训「契约扩参批全 probe 族改后重跑」虽非扩参批、全族回归
  常态化）；冻结池/家族仓零接触；补件面零增量。

## 7. 验收标准

- **AC-01（目录二期 back）**：§6 十一案双臂全绿；递归/纯 .ad 卫/
  零扰动定向 diff 逐案可证。验证：T-01 直证。
- **AC-02（目录二期 UI 双轨）**：删除（强确认双防线 → tab 全关 →
  悬空翻转）与重命名（预览 → tab 全量 → 面板零变化）双轨全绿。
  验证：T-04 + e2e。
- **AC-03（面板显示名化）**：反链/提及行 dtitle + 回落、出链/
  wanted 零变化断言、语料已知答案修订面全绿。验证：T-04 link 组。
- **AC-04（gate ALL GREEN + 基线 v13）**：`node scripts/gate.mjs`
  全绿——16/16 + 15/15（组数不变）+ build + 十五段；基线 v13
  零漂移（v12 留档）；判绿实录（D-21 v16 口径）。
- **AC-05（负向证）**：D-30① 参数纪律 grep 证；`.console` 零；
  probe 全族六代回归；契约纯增量（delete_dir/rename_dir 新增 +
  既有零变化）；冻结池/家族仓零接触；`gen/` 无手改；补件面零增量。
- **AC-06（文档面）**：SD-1401..1404 落位锚注齐；三联对照目录级
  + 强确认双防线 + 出链恒链接文本定文入 SD-1401；parity-ledger
  **v17**（probe C 定谳 + 执行期实勘）。

## 8. 执行步骤

- **T-01 back 双契约 + probe C + 十一案直证**（AC-01）[x]
  - probe C（remove_dir/remove_dir_all 可调性——首闸之一）；wsys
    双 impl（move_page 循环复用 + tree 段扫描纯 .ad 卫）。
  - 验证：直证全绿 + vm 矩阵现行组回归。
  - [✅ 已完成] probe C 定谳（`tests/probe_dir_ops.mjs`——remove_dir
    族可调 + delete_dir 六案 + rename_dir 六案 + 嵌套案[merged 探针域
    ws_join 造档通道] + 链接零扰动归一 diff，双臂一致=true 全绿，端口
    8231[8228 首跑撞临时源端口 CLOSE_WAIT 出站连接 10048——顺延避让，
    环境项 FR-13-1 家族]）。执行期实勘一件：**fs.tree 段标记法下非空
    目录段只含头 + `"children":[` 开括号**（自身 kind 字段落末孙段
    ——collect_ad_pages 注记同源），目录段判定 = kind:dir（空目录）∨
    ends_with `,"children":[`（非空目录）；树走**工作区根** walk +
    前缀过滤（根相对 id 语义在册件，子树 id 相对性免证）。vm 矩阵
    现行组回归随 T-04 双臂全绿承载。
- **T-02 front 双弹层 + 入口**（AC-02 前半）[x]
  - store 双开态 + actions/menubar + 弹层第十/十一实例 + paths_
    under 纯函数（D-30① 纪律）+ 预览派生。
  - 验证：merged 冒烟（弹层/预填/取消）+ `pnpm build` PASS。
  - [✅ 已完成] store deldir_open/rendir_open + 四开关口；actions
    file.deldir（Shift+Delete）/file.rendir（Ctrl+Shift+R）+ menubar
    两枚（「删除…」与分隔符之间）；dialog 第十/十一实例（声明位
    rename 弹层前——input 序锚纪律保持）；纯函数族七件（参数名
    nodes/dir/rows/path——D-30① grep 证零模型名碰撞）；`pnpm build`
    PASS。实取口径：App 字段三枚（deldir_q/rendir_target/rendir_q
    ——§2.3 修正设计目标 input 双弹层，§4.2「仅 rendir_q 一字段」
    为修正设计前旧形）。
- **T-03 双流收口 + 面板名化**（AC-02 后半 + AC-03）[x]
  - 删除流（CloseTabsOf 循环 + 刷新族 v6 + 悬空翻转冒烟）+ 重命名
    流（TabsRenamed 循环 + 零变化冒烟）+ 反链/提及行 dtitle 接线
    （link 组已知答案修订）。
  - 验证：merged 冒烟双弧线 + link/file 组回归 + e2e 子步冒烟。
  - [✅ 已完成] 双流收口（CloseTabsOf/TabsRenamed front 循环零新
    store 面 + 刷新族 v6 + ft_sel/active 显式 remap[rel_under]）+
    反链/提及行 dtitle_of 接线（出链/wanted 恒链接文本不动）。
    **执行期实勘一件（D-20③ 家族新项）**：`split_once` 无
    ts_adapter 映射——vue 轨裸发射 `.split_once` TypeError
    [pageerror 实勘，RenDirGo handler 中段断链——后续 Reload/
    TreeRefresh 全跳过致 ft_nodes 陈旧；vm 轨原生有 split_once
    单侧炸面]——`rel_under` 改整前缀 split 等价通道（首元素恒 ""
    语义）。双弧线冒烟随 T-04 vm 双臂 + e2e 全绿承载。
- **T-04 测试扩单 + 基线 v13 + 判绿首锁**（AC-02/03/04）[x]
  - file 组四子步 + link 组两子步 + e2e 扩 + 基线 v13 重锁。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN。
  - [✅ 已完成] vm：link 组 10/10b 反链行显示名化断言（面板区锚
    家族）+ 10m/alias/F-R9-4 stem 形态 + ⑥ 出链/wanted 恒文本
    （12⑤ 非退化并证注记）+ file 组 ⑭-⑯ 目录二期三子步（预览/
    tab 全关计数-1/悬空翻转 Project X（悬空）/links_json 归一 diff/
    面板零变化——三联对照目录级）；e2e：10 段显示名 + 10m/alias
    stem + 13 dir2 三子步（CJK 目录甲/乙 POST body 双臂面）；基线
    v13 首锁（--save-baseline）+ 零漂移 2 跑。判绿实录（D-21 v16
    口径如实）：merged 臂 15/15 ×2 首锁窗 + 16/16 ×2（基线锁 +
    零漂移）+ gate 内 16/16；split 臂 15/15 ×2（独立 + gate 内）；
    e2e 5 绿（首轮 ⑮ 断言失守 1——**getByText 非精确弹层标题断言
    strict 竞态**[标题/描述/预览三元素命中，toBeHidden 重试环即断
    ——heading 角色锚修复，非产品 bug；最小回放 + ⑭→⑮ 全弧线回放
    双 probe 证 cancel 语义健康]）+ probe 全族九件 fresh 绿（back
    改后首跑——013 教训兑现）+ **gate ALL GREEN 一次通过**（vm 双臂
    + build + e2e）。测试面执行期校正三件：①vm pressInRenameDialog/
    pressInDeleteDialog 全树钮文本锚破（新弹层「重命名」/「删除」
    同名钮——D-29③ 家族修订续，标题锚 content 子树扫）；②vm ⑪
    移动后 TreeRefresh 重建树展开态不继承（⑭ DirBox 折叠不可见
    ——展开态自适应前置）；③vm ⑯ 树行消失断言被闭态弹层 input
    value 投影误中（D-23③/D-29④ 族——explorer 区锚消歧）。
- **T-05 文档 + ledger v17 + 收口**（AC-05/06）[x]
  - SD-1401..1404 落位；ledger v16→v17；负向证（含参数纪律
    grep + probe 六代回归）；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。
  - [✅ 已完成] SD-1401（ARCHITECTURE §5 目录面二期+面板行显示名化
    段——三联对照目录级并表/back 双契约三步+五步/目标 input 口径/
    强确认双防线/刷新族 v6/D-30① 首批次应用/名化两域口径 + §6 表
    SD-1402[vm 行 link/file 组 PLAN-014 子步注记 + 基线 v13 重锁史
    + e2e 13 dir2 + probe_dir_ops 清单条目]）+ SD-1403（README Tests
    节——检查单扩定 + PLAN-014 N 定谳 + 基线 v13 指针 + 运行矩阵
    v9 stale 指针校正）+ SD-1404（README 是什么第十二切片条目 + 文档
    节 ledger v17 指针）；parity-ledger **v16→v17**（D-31 四件新行
    [split_once 无映射 vue 裸发射面——gen 字符串方法映射表第四兄弟/
    fs.tree 目录段判定实勘/getByText 弹层标题 strict 竞态纪律/临时
    源端口碰撞环境项] + D-21 v17 扩记[独占窗零复现 + gate 首锁一次
    过]）+ 负向证（AC-05：D-30① 参数纪律 grep 证七新函数零模型名
    碰撞[源注记在案] + `.console` 零赋值 + probe 全族**九件** fresh
    绿[008..013 六代 + 014 新件——013 教训兑现] + 契约纯增量
    [api.at diff 仅追加双契约，既有零变化] + 冻结池/家族仓零接触 +
    `gen/` 不入库 + 补件面零增量]）；gate 复跑绿（见 §9 收口记录）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；probe C 首闸）。

## 9. 复审记录

- **2026-09-25 复审（auto-plan-review）**：
  - `stage: review | plan_id: PLAN-014 | plan_revision: 1 | outcome:
    pass | reviewed_commit: 156a0e2 | base_commit: a6bb9f9 |
    dependency_revisions: 无依赖仓接触[冻结池/家族仓零接触；工具链 =
    auto-lang debug exe 现行（schema drift 已随家族 exe 稳定解除）] |
    spec_inputs: docs/ARCHITECTURE.md §5/§6 @156a0e2 + docs/README.md
    Tests/是什么 @156a0e2 + docs/parity-ledger.md v17 @156a0e2 |
    acceptance_results: AC-01..AC-06 全 PASS | findings: 无
    needs_fix 级（复审窗瞬态 1 例如实记——非 blocker）| next: merge`
  - **独立性声明**：本复审在实现会话内进行（011/013 先例）——独立性
    不可声明，判决全部自工件重建（证据现跑重放，不采信执行摘要）。
  - **基线**：reviewed_commit = 156a0e2 = HEAD；工作树零 WIP；diff 窗
    a6bb9f9..156a0e2 = 12 文件全授权面（back×2/front×2/测试
    vm+e2e+probe×2/基线 v13/文档×3+计划簿记）；直接 main 线性约定
    （worktree 清单仅 main）。
  - **AC→证据现跑重放**：
    - **AC-01**（目录二期 back）：probe 全族九件 fresh 绿
      （2026-09-25 复审窗重跑）——probe_dir_ops 双臂全案
      [probe C 定谳 + delete_dir 六案 + rename_dir 六案 + 嵌套案 +
      链接零扰动归一 diff] + probe_dir_move/probe_delete/probe_rename
      邻域回归零漂移。
    - **AC-02**（目录二期 UI 双轨）+ **AC-03**（面板名化）+ **AC-04**
      （gate + 基线 v13）：复审窗 gate 重放 2 跑——第 1 跑 split 臂
      check-10 **menubar popover 内容窗 1 例**[「切换反链」项 6s 未现
      ——D-21 v11③ 家族签名（v12/v16 前例），fail-snap 转储实勘
      [menubar 触发器在/popover 内容零] + split 单臂复跑 15/15 即绿
      ——环境瞬态非回归]；第 2 跑 **ALL GREEN 全过**（merged 16/16
      [含基线 v13 零漂移复审位] + split 15/15 + build + e2e 十五段
      ——vm file 组 ⑭-⑯ 目录二期三子步 + link 组名化子步 + e2e 13
      dir2 三子步全现跑）。
    - **AC-05**（负向证）：grep 实勘——D-30① 七新纯函数参数
      （dir/nodes/rows/path 族）零模型字段名碰撞；App 上下文
      `.console` 零赋值；api.at diff **纯增量**（a6bb9f9..156a0e2
      删除行空——delete_dir/rename_dir 追加、既有契约零变化）；
      `gen/` git-ignore 在册（不入库）；冻结池/家族仓零接触（diff
      窗文件清单全在本仓）。
    - **AC-06**（文档面）：SD-1401..1404 锚注落位实勘（ARCHITECTURE
      ×6 + README ×3）；canonical→source 对点核验——三联对照目录级
      并表/出链 wanted 恒链接文本定文/强确认双防线/无 title 显 stem
      执行期校正[ARCHITECTURE.md:570/:645/:627]全现文；ledger v17
      表头 + D-31 四件行 + D-21 v17 扩记在册；基线 v13 指针三面一致
      （README/ARCHITECTURE/vm_matrix:147）。
  - **知识增量检视**：SD-1401（modify §5）before/after 与现行为一致
    （back 三步/五步、目标 input 口径 v1 定案、刷新族 v6、名化两域
    口径——源码/测试双面核验通过）；SD-1402（modify §6）组数不变
    16/15 + 基线 v13 重锁面如实；SD-1403（modify README Tests）判绿
    口径单一权威面延续 + N 定谳续记；SD-1404（modify README 是什么/
    文档）第十二切片条目 + ledger v17 指针。supersedes_spec_components
    = []、new_spec_components = SD-1401..1404 与落位一致、
    touched_goals = []（本仓无 goals 文件族，历批同判）。delta 描述
    现行为与持久决策，无执行日记面。
  - **findings**：无 needs_fix 级。复审窗瞬态 1 例（D-21 v11③ 签名
    popover 内容窗）入 D-21 v17 记账面（ledger 已载）——环境瞬态
    非回归，重跑即绿，不影响判决。
- **2026-09-24 work 收口（auto-plan-work）**：
  - `stage: work | plan_id: PLAN-014 | plan_revision: 1 | outcome: pass
    | code_commit: <T-05 收口提交> | task_ids: T-01..T-05 | evidence:
    gate ALL GREEN 首锁一次通过[vm 双臂 16/16+15/15 + 基线 v13 零漂移
    2 跑 + build + e2e 15 段] + probe 全族九件 fresh 绿[008..013 六代
    + 014 probe_dir_ops——back 改后首跑] + AC-05 负向证齐[D-30① grep
    七新函数零模型名碰撞/.console 零赋值/契约纯增量/冻结池零接触/gen
    不入库/补件零增量] + SD-1401..1404 落位锚注齐 + ledger v16→v17
    [D-31 四件 + D-21 v17 扩记] | blockers: 无 | next: review`
  - 执行期校正汇总（canonical 已随 SD-1401 落位）：①无 title 源档显
    示 = **stem**（back 缺省装配定值——计划 §6「回落 path」按 013 G1
    同族口径校正落定）；②App 字段三枚（§4.2 旧形一字段——§2.3 修正
    设计实取）；③fs.tree 非空目录段 children 开括号形态（D-31②）；
    ④split_once 无 ts_adapter 映射——rel_under 整前缀 split 等价通
    道（D-31①）；⑤probe 口 8228→8231（D-31④ 环境项）。
- **2026-09-24 work T-01..T-04（auto-plan-work）**：
  - `stage: work`，PLAN-014，revision 1，T-01..T-04 完成 → next: T-05。
  - base commit = a6bb9f9；直接 main 线性约定（无 worktree/dev 分支）。
  - 判绿：gate ALL GREEN 首锁一次通过（vm 双臂 16/16+15/15 + build +
    e2e）+ probe 全族九件 fresh 绿 + 基线 v13 零漂移 2 跑——详见 §8
    T-04 证据注记。
- **2026-09-24 work 启动（auto-plan-work）**：
  - `stage: work`，PLAN-014，revision 1，T-01 起。
  - worktree = 本仓直接 main 线性约定（PLAN-004..013 在册——无
    worktree/dev 分支；base commit = a6bb9f9）；主检出 WIP 前置检查 =
    仅本计划簿记 untracked（惯例内，plan012 归档注记同判）。
  - **设计口径勘定（§2.3 内部演进收敛）**：目录目标 = 弹层目标 input
    （修正设计终词）——删除弹层实取 App `deldir_q` 一字段 + 重命名弹层
    `rendir_target`/`rendir_q` 双字段（§4.2「App 仅 rendir_q 一字段」
    为修正设计前旧形，以 §2.3 弹层双形 + 修正设计为准——三 App 字段
    落地，基线 v13 变更面如实记）。
- **2026-09-24 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-014，revision 1。
  - `outcome: pass`——可进 work（013 已归档 a6bb9f9——正常立项窗）。
  - `next: work`（T-01 起；**probe C = remove_dir 族可调性首闸**，
    fallback：删除目录 blocked → 重命名+面板名化双件降级交付）。
  - 递归删除强确认语义按默认提案（§4.1）；零待裁技术探针外项。

## 10. 待澄清事项

1. **remove_dir/remove_dir_all 可调性**（probe C，T-01 首闸）：
   别名双表在册 + create_dir/is_dir 同族已证——风险低；fallback
   链：remove_dir_all 不可调 → 删除目录 blocked（重命名依赖
   remove_dir[空目录]——不可调则旧目录残留[记账容忍：空壳目录 +
   迁移成功，§10 记账]或双件降级）。
2. **递归删除强确认**（默认提案）：计数 + 悬空警示双防线；用户
   要「空目录轻确认分档」→ r2 小范围；「删除前逐档确认」不做
   （破坏性操作的确认粒度 = 目录级一次）。
3. **目录目标 = 弹层 input 口径**（v1 定案依据）：树行选中语义
   不扩（目录行点击 = 展开在册语义；结构锚敏感[D-29③]）；目录
   移动/合并批若引入目录选中态，本口径重议。
4. **rename_dir 部分迁移容忍**（v0 记账）：循环中段失败留双份
   ——非原子窗口家族（006 copy+delete 同判）；File.rename 别名
   供料解锁后可整体原子化。
5. **D-21 POST 波及**（观测项）：双契约各单 POST（多文件 IO
   back 内联）；负载窗按 README 重跑口径，ledger v17 如实记。
6. **D-30① 参数纪律**（首批次全面应用）：新纯函数参数名避开
   模型字段名（源注记 + AC-05 grep）；既有函数不改（rows 签名
   013 已修）。
7. **PLAN-015 候选池**（本批后更新）：大纲（D-12 解锁——首位
   顺延候）、每日笔记+时间戳补写（Time 解锁——双件联动）、目录
   移动/合并、casefold+词边界批、检索上量微批、File.rename/copy/
   remove_dir 族供料回执件、上游快照/HTTP 面回执批。
