---
plan_id: PLAN-016
status: reviewed
feature_name: trash-slice
author: [zhaopuming]
created_at: 2026-09-25T12:27:33+08:00
updated_at: 2026-09-25T14:25:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1601"
  - "docs/ARCHITECTURE.md#SD-1602"
  - "docs/README.md#SD-1603"
  - "docs/README.md#SD-1604"
touched_goals: []
---

# [PLAN-016] 知识库第十四切片——回收站（.trash 安全网）+ probe 端口自动避让

## 0. 变更摘要

SD-301/SD-405 主线第十四片，主件+卫生件：

1. **回收站（.trash）**——014 交付递归硬删（remove_dir_all）与档删
   后，**破坏性操作无安全网**是当前最大产品风险；本批引入 Obsidian
   同款 `.trash/` 工作区回收站：**delete_page/delete_dir 改道移入**
   （保结构迁移——`.trash/{原相对路径}`，冲突 `--{n}` 后缀；父目录
   create_dir_all 递归已证[D-29①]）+ **trash_list / trash_restore /
   trash_purge 三契约** + find 面板**第四模式 trash**（Ctrl+Shift+T——
   清单/行恢复/清空）。**删除语义四面表收口**：悬空化（SD-701）不
   变——`.trash` 点前缀目录 walk 自动忽略（在册覆盖面），链接面
   与硬删**逐字节等价**；恢复 = 移回原位（悬空自愈反向闭环——删
   除→悬空→恢复→翻转回，全弧线可证）。
2. **probe 端口自动避让**（工程卫生件）——WinNAT 排除区段漂移已
   三次逼迁 probe 固定端口（8254→8223/8252→8222/probe_tags 8254→
   8221，F-R8-1/F-R13-1/G4 收口注释在案）：`tests/pick_port.mjs`
   共享助手（候选段 try-bind 首个可绑端口，env 注入），probe 族
   七件统一切换——**环境复发痛系统修**。

上游缺口适配内置：D-19 负结果维持（CJK 双臂化不扩——D-32① 精化
在册）；D-24②③④⑤；D-25①；D-26②/D-28②；D-29①③；D-30①；
D-31（split 通道/heading 锚）。

## 1. 目标

- **G1（删除改道·双轨）**：删除档/目录（007/014 既有入口）→
  **移入 `.trash/{原相对路径}`**（保结构；同名冲突 `--{n}` 后缀）
  → 工作区行为与现状**逐字节等价**（树行消/tab 关/悬空翻转——
  断言面复用）；删除弹层文案改「移入回收站」（014 双防线预览沿
  袭）。
- **G2（回收站面板·双轨）**：Ctrl+Shift+T / 菜单「文件→回收站」→
  find·trash 模式（无 input 清单）——trash_list 行（trash 内路径）
  + 行恢复钮（移回原位；目标冲突拒 + console）+「清空回收站」钮
  （trash_purge 强确认二次钮）；空态「（回收站为空）」；恢复成功
  → 树/链接/标签刷新 + **悬空自愈断言**（删除→恢复全弧线）。
- **G3（back 契约语料首锁）**：trash 改道（档/目录/冲突后缀/CJK
  路径）+ trash_list（裸数组）+ trash_restore（前缀剥离去原位/
  后缀剥离去后缀名/目标冲突拒/.trash 外路径拒）+ trash_purge 四
  组案双臂直证。
- **G4（probe 端口自动避让）**：pick_port 助手落地 + probe 族七件
  切换（固定常量清零）+ 一次全 probe 复跑绿——**此后 WinNAT 漂移
  零适配成本**（观测项转归档）。
- **G5（测试面）**：file 组子步扩（改道+恢复弧线）+ find 组子步
  （trash 模式）——**组数不变 16/15/十五段**；基线 **v15** 计划内
  重锁（find_mode 第四值 + App trash_rows）。
- **非目标**（明确排除）：
  - 回收站容量/自动清理策略（30 天过期等——远期配置面）；
  - 逐档选择性恢复 UI 增强（批量恢复/搜索——v1 行级单恢复）；
  - trash 内预览（点行开档——trash 不入 read_wiki 语义域，后续批）；
  - 跨工作区回收站/系统回收站集成（远期）；
  - **目录删除的硬删选项**（v1 恒改道——强确认双防线 + 回收站双
    安全网；用户要「彻底删除」直通选项 → r2 小范围）；
  - casefold+词边界批、目录移动/合并、检索上量微批、Time front
    面 probe 批、url_decode 供料回执件（候选池顺延）、上游件实做
    与生成物补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十四片是回收站

- **候选池对表**（PLAN-015 §10.6 在案 + ledger v18 实核）：大纲
  （**仍门控**——015 复审定谳：行:列字面接线不可达 + anchor-reveal
  供料未落，D-12 处置维持）、casefold+词边界（裁决重、语料零案例）、
  目录移动/合并（低频）、检索上量（未触发）、Time front probe
  （独立价值低）、url_decode 回执（上游未动）。**池外新晋评估**：
  014 交付 `delete_dir` 递归硬删 + 007 档硬删——**误删即永久丢失**
  （无 undo/无 git 保障的用户工作区），北标（SD-405）长期线 Obsidian
  段的标准安全网即 `.trash/`（Obsidian 内置「删除到 .trash 文件夹」
  同构）；本批把破坏性操作的风险面收口——**产品风险清偿优先于
  新功能**。
- **形态复用度**：改道 = 012 move_page/014 rename_dir 的组合复用
  （read+write+delete + create_dir_all 递归）；恢复 = 同组合反向；
  面板 = find 模式机制第四值（wanted 无 input 形态同构）；清空 =
  remove_dir_all（014 已证）。**零新 UI 形态、零新原语**。
- **语义零破坏论证**（SD-1601 核心）：`.trash` 点前缀目录在
  fs.tree walk 忽略面内（SD-302 覆盖面在册）——链接/标签/检索/
  快开/树**全部视 .trash 不存在**；删除 = 「移出工作区 + 副本保留」
  ——悬空化（SD-701）与四面链接语义逐字节不变；恢复 = 移回原位
  ——悬空自愈（PLAN-005 建页弧线的删除-恢复对偶）。

### 2.2 数据面（back：三新契约 + delete 双改道）

```rust
/// 回收站清单（裸数组 [{path}]——.trash 内相对路径）
/// GET /api/trash_list
#[api(method = "GET", path = "/api/trash_list")]
pub fn trash_list() str {
    return wsys.trash_list_json()
}

/// 恢复：.trash 内条目移回原位（前缀剥离去原路径；--{n} 后缀剥离去
/// 后缀名；目标冲突/越界拒）/// POST /api/trash_restore
#[api(method = "POST", path = "/api/trash_restore")]
pub fn trash_restore(entry str) str {
    return wsys.trash_restore_impl(entry)
}

/// 清空回收站（remove_dir_all .trash；幂等——不存在视为已空）
/// POST /api/trash_purge
#[api(method = "POST", path = "/api/trash_purge")]
pub fn trash_purge() str {
    return wsys.trash_purge_impl()
}
```

- **delete_page 改道**（:007 契约签名不变——**行为面扩**，SD-701
  注记）：原 `File.delete` 段替换为「移入 `.trash/{orig_rel}`」——
  冲突（trash 内已存在同名）→ `{stem}--{n}{.ad}` 序号后缀（while
  exists n+1）；父目录 create_dir_all（递归语义 D-29① 实勘在案）；
  移动组合 = read_text→write_text→File.delete + 双复核（006 形态）；
  返回原 rel（front 语义零变化）。
- **delete_dir 改道**（:014 契约不变）：纯 .ad 卫沿袭 → 逐文件
  移入 `.trash/{dir 相对结构}`（同后缀规则）→ 旧目录 remove_dir
  （空）→ 返回原 dir rel。
- **trash_restore_impl**：卫——entry 以 `.trash/` 起否则拒（**越界
  卫**——.trash 外路径拒，路径注入面封死）；目标 = 前缀剥离 + 
  `--{n}` 尾剥（含 .ad 剥析）；目标冲突（exists）拒 ""；父目录
  create_dir_all + 反向移动组合 + 双复核；返回恢复后 rel。
- **trash_purge_impl**：`.trash` 不存在 → "ok"（幂等）；remove_dir_
  all + 复核 → "ok"。
- **trash_list_json**：fs.tree(`.trash`, 8) walk 段收集 .ad 条目
  （复用段标记法）→ 裸数组（D-20④）。
- **D-21/D-19 面**：三新契约 POST×2/GET×1——GET 无 query 参数（零
  D-19 暴露）；POST 单发（密度不升）。

### 2.3 消费面（front）

- **store**：find_mode 值域扩 "trash"（第四值——FindOpen 复用）；
  零其他新面（恢复/清空无开态——trash 模式即入口）。
- **App 模型**：`trash_rows` List（清单行——单取形 fetch）。
- **入口**：action `file.trash`（title「回收站」、icon "trash-2"、
  shortcut **Ctrl+Shift+T**——T 族：Ctrl+T=标签面板在册，Shift+T
  空闲实核）+ menubar 文件项。
- **find·trash 模式**：无 input（wanted 同构）——标题行「回收站」
  + 行集（trash 内路径文本 + 行尾「恢复」小钮）+ 底部「清空回收站」
  钮（点击 → alert-dialog 强确认[第 N 弹层实例——「将永久删除回收
  站内全部 M 项」M 本地派生]）+ 空态。
- **流程**：`.ActTrash` → FindOpen("trash") + `trash_rows` fetch
  （单取形）；`.TrashRestore(entry)` → trash_restore → 非空：行消
  （refetch）+ **refresh_tree/links/tags**（页回归——悬空自愈）+
  bl/ol 重算；`.TrashPurgeGo` → trash_purge → refetch 空态；删除
  弹层文案两处改「移入回收站」（007/014 弹层——行为等价注记同步）。
- **刷新触发集**：restore 成功接入「建页成功」同级口（树/链接/标签
  三刷——恢复即页回归）；purge 零刷新（工作区本无）。

### 2.4 键位/菜单面

Ctrl+Shift+T = 回收站（新键位唯一增量）；menubar 文件菜单「回收站」
（「删除…」后）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件（弹层/alert-dialog/dialog 族在册）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-25 会话口述：「计划015已经完成；请继续规划下一个
  计划」——**立项授权**：015 已归档（b64794a——正常立项窗）。
  方向选择（回收站+端口卫生件）= 池外新晋评估 + §2.1 依据（014
  破坏性操作风险清偿）；handoff 未否决即生效（PLAN-004..015 同款
  约定）。
- **「彻底删除」直通选项默认不做**（v1 恒改道——双安全网口径）；
  用户要 → r2 小范围（弹层加复选/快捷变体）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05）。无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓实读，2026-09-25 @ main bc3cce3/b64794a）

- **风险面实勘**：wsys delete_page_impl（:007 三步——File.delete
  硬删）+ delete_dir_impl（:014——remove_dir_all 递归硬删）——
  **零副本零恢复通道**；front 删除弹层（007/014）文案「删除」直
  陈硬删语义。
- **在册复用件**：move 组合（read+write+delete + 双复核——006/
  012 定文形态）；`File.create_dir` **递归语义**（D-29① 实勘
  create_dir_all 行为——trash 父目录面零探针）；remove_dir_all
  （014 probe C 已证可调）；fs.tree walk 忽略面（SD-302——.trash
  点前缀自动忽略，**语义零破坏论证依据**）；find 模式机制（013/
  015 trash 第四值——wanted 无 input 形态同构）；弹层族 + 强确认
  形态（014 双防线）；单取形 fetch；probe 族七件（pick_port 切换
  面——probe_tags/probe_inline_tags/probe_rename/probe_delete/
  probe_dir_move/probe_dir_ops/probe_alias_linkify[+probe_page_
  meta]——固定端口常量注释三次适配史在案）。
- **D-32①（015 定谳）**：D-19 负结果维持——本批 GET 契约零 query
  参数（trash_list 无参——零暴露）；CJK trash 条目经 POST（D-19
  免疫）。
- **基线**：v14 现行（015）；**v15 变更面** = find_mode 第四值 +
  App trash_rows + 回收站弹层 id 序列 + 删除弹层文案（快照文本
  变化——计划内）。

### 4.3 与既有计划的关系

- 承接 PLAN-007（delete_page 改道——契约签名不变行为面扩）与
  PLAN-014（delete_dir 改道 + 强确认弹层文案同步）——**删除语义
  四面表**（悬空化/改名改写/移动零改写/回收站副本）SD 并表收口。
- 与 PLAN-005 悬空建页弧线构成对偶（删除→悬空→建页接回 vs 删除→
  悬空→恢复自愈）——恢复弧线断言复用其已知答案反向。
- probe 端口件收口 F-R8-1/F-R13-1/G4 三笔环境账（观测项转归档）。
- D-12（anchor-reveal 供料候）/url_decode（D-19 供料候）留观不变。
- PLAN-017 候选池（§10.7 更新）：大纲（anchor-reveal 解锁——首位
  顺延候）、casefold+词边界批、目录移动/合并、检索上量微批、Time
  front 面 probe 批、url_decode 供料回执件、trash 内预览/批量恢复
  （本批 §10 后续）。

## 5. 详细设计

### 5.1 back 三契约 + 双改道（SD-1601）

```
fn trash_target(orig_rel str) str {
    // .trash/{orig_rel}；冲突 while exists → {stem}--{n}{ext}
    //（ext = ".ad"；父目录 create_dir_all(resolve(parent))——递归）
}

// delete_page_impl：File.delete 段 → 移动组合至 trash_target
// delete_dir_impl：逐文件循环 → trash_target（保目录结构）→ 旧目录 remove_dir
// trash_restore_impl：.trash/ 前缀卫 + --{n} 尾剥 + 目标冲突卫 +
//   反向移动组合 + 双复核
// trash_purge_impl：remove_dir_all(.trash) 幂等
// trash_list_json：fs.tree walk 段收集 .ad → 裸数组
```

### 5.2 front 接线（SD-1601）

- app.at：msg `ActTrash`/`TrashRestore(str)`/`TrashPurge`/
  `TrashPurgeGo`/`TrashPurgeCancel`；模型 trash_rows；action file.
  trash（Ctrl+Shift+T）+ menubar 项；find 第四分支（无 input +
  行恢复钮 + 清空钮 + 强确认弹层）；删除弹层文案两处「移入回收
  站」；restore 流（三刷 + 行重算——D-26② 自派生纪律）。
- ⚠ D-30① 参数纪律（新 fn 参数避模型名）；D-31 split 通道（--
  后缀剥析）；零 `.console =` 赋值。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1601 | modify | docs/ARCHITECTURE.md §5 文件管理域语义段 | before：删除 = 硬删（File.delete/remove_dir_all——SD-701/SD-1401 悬空化语义）。after：增「回收站」子段——**删除 = 移出工作区 + .trash 副本保留**（保结构迁移/冲突 `--{n}` 后缀/create_dir_all 递归父目录）；`.trash` 点前缀 walk 忽略（悬空化与链接面**逐字节等价**论证）；`trash_list`/`trash_restore`/`trash_purge` 三契约（前缀越界卫/目标冲突拒/幂等清空）；find·trash 第四模式（恢复行/清空强确认）；**删除语义四面表**并表（悬空化/改写/零改写/副本保留）；恢复 = 悬空自愈（与建页接回对偶注记）；probe 端口自动避让注记（pick_port——环境复发痛收口） | 破坏性操作安全网收口（014 风险清偿） | AC-01/02/03/06 |
| SD-1602 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v14。after：组数**不变**（改道/恢复入 file 组、trash 模式入 find 组）+ **基线 v15**（find_mode 第四值 + trash_rows + 弹层/文案快照变化；v14 留档） | 测试体系表更新（009..015 子步内聚口径续） | AC-05 |
| SD-1603 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v14。after：口径不变 + file/find 组子步扩注记 + 基线 v15 指针 + N 定谳续记 + probe 端口口径注记（固定常量退役） | 判绿口径单一权威面（…/1503 续） | AC-05 |
| SD-1604 | modify | docs/README.md「是什么/文档」节 | before：第十三切片=上游解锁兑现批。after：**第十四切片=回收站**条目（删除安全网 + 四面语义注记）+ ledger v19 指针 | 产品主线进度面派生同步（…/1504 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：四组案——①改道（删档 → 工作区消失
  + `.trash/{rel}` 存在 + 字节整迁；目录删 → 保结构多档）②冲突
  后缀（删→重建→再删 → `--1` 并存）③restore（恢复回原位 + 悬空
  自愈[源档出链 exists 翻转回] + 后缀条目恢复去后缀名 + 目标冲突
  拒 + **越界卫**[`../x`、裸 `x.ad` 无 .trash 前缀 → 拒]）④purge
  （清空幂等 + 再删再列空）⑤CJK 路径全弧（POST 双臂——trash_list
  GET 无参零 D-19 面）。
- **vm 矩阵（T-04）**：file 组子步——①删除改道弧线（删 CAP 定理
  → 悬空翻转[既有断言复用] + trash 模式清单见条目）②恢复弧线
  （行恢复钮 → 树行回 + **exists 翻转回**[悬空自愈断言] + tab 可
  重开）；find 组子步——③trash 模式（Ctrl+Shift+T 清单/空态/清空
  强确认弹层/清空后空态）④删除弹层文案「移入回收站」断言。
- **e2e（T-04）**：同弧线（真 DOM；CJK 全弧 POST 面）。
- **基线 v15（T-04）**：计划内重锁；连跑 ≥3 零漂移；v14 留档。
- **probe 端口件（T-04）**：pick_port.mjs 落地 + probe 族切换 +
  全 probe 复跑绿（一次实录——固定常量 grep 清零证）。
- **负向（T-05）**：probe 全族八代回归；`.console` 零；契约纯增量
  （delete_page/delete_dir 签名不变——行为面扩注记回归）；D-30①/
  D-31 纪律 grep；冻结池/家族仓零接触；`gen/` 无手改；补件面零增量。

## 7. 验收标准

- **AC-01（back 改道+三契约）**：§6 四组案双臂全绿；越界卫/冲突
  后缀/幂等逐案可证；**工作区行为与硬删逐字节等价**（树/链接/标签
  面回归——既有断言零变化）。验证：T-01 直证。
- **AC-02（trash 面板双轨）**：模式入口/清单/恢复（行消+三刷+悬空
  自愈）/清空（强确认+空态）/空态，vm 与 vue e2e 同断言域全绿。
  验证：T-04 + e2e。
- **AC-03（删除弹层语义同步）**：两弹层文案「移入回收站」+ 行为
  等价注记；014 双防线预览沿袭断言。验证：T-04。
- **AC-04（probe 端口件）**：pick_port 落地 + 七 probe 切换 + 复跑
  绿 + 固定常量清零 grep 证。验证：T-04。
- **AC-05（gate + 基线 v15）**：gate ALL GREEN（16/15/十五段口径
  不变）；基线 v15 零漂移（v14 留档）；N 定谳续记。
- **AC-06（文档面）**：SD-1601..1604 落位锚注齐；**删除语义四面
  表**入 SD-1601；ledger **v19**（执行期实勘 + 环境账收口注记）。

## 8. 执行步骤

- **T-01 back 双改道 + 三契约 + 直证**（AC-01）✅
  - wsys trash_target/move 复用改道（delete_page/delete_dir）+
    三 impl；probe_trash.mjs 新增（四组案）。
  - 验证：直证全绿 + vm 矩阵现行组回归（**行为等价证**——link/
    file 组既有断言零变化）。
  - **[✅ 已完成]**（2026-09-25，commit 0d69571）——wsys.at 回收站段
    （trash_target/trash_list_json/trash_stem_strip/trash_restore_impl/
    trash_purge_impl）+ delete_page/delete_dir 改道扩（契约签名零变化
    ——返回语义原样；**执行期增补**：delete 面 `.trash` 路径自涉卫[
    防病态 trash 套 trash——计划 §5.1 未列，卫面补强]）+ api.at 三契约
    （trash_list GET 无参/trash_restore/trash_purge POST）。**接地定谳
    两件**（一手源实勘）：fs.tree 子树 id = 相对查询根
    （native.rs:9970 strip_prefix(root)——rename_dir_impl「子树 id 相
    对性未证免依赖」注记定谳，trash_list 装配期补 ".trash/" 前缀）+
    点前缀忽略面 = fs_tree_skipped 逐名判定（native.rs:9944——语义零
    破坏论证一手源兑现）。pick_port.mjs 随 T-01 提前落地（probe_trash
    即首消费者——计划线性序 T-04 的助手件前移，证据顺延）。probe_trash
    十八案+十五布尔翻转对**双臂全绿**（②③④⑤组全通——①保结构嵌套
    merged 探针域；**执行期校正 2 件**：split 臂 exists=GET 契约首版
    误用 POST 404 即改；布尔落盘 1/0 形态归一口径）；行为等价回归 =
    probe_delete 九案 + probe_dir_ops 十四案 + vm 矩阵 merged 16/16
    （基线 v14 零漂移——工作区面逐字节等价实证；AUTO_EXE=release
    g63e14b045 旁路——debug exe 家族会话进程在册 D-27④ 纪律）。
- **T-02 front trash 模式 + 弹层文案**（AC-02/03 前半）
  - find 第四分支 + 行恢复/清空钮 + 强确认弹层 + App trash_rows +
    删除弹层文案两处。
  - 验证：merged 冒烟（删→清单→恢复→自愈）+ `pnpm build` PASS。
  - **[✅ 已完成]**（2026-09-25，commit e83b205 前半）——app.at：use
    三契约/msg 五条（ActTrash/TrashRestore(str)/TrashPurge/TrashPurgeGo/
    TrashPurgeCancel）/模型 trash_rows + trash_purge_open[App 模型——
    store 零新面]；action file.trash（Ctrl+Shift+T——T 族 Ctrl+T 在册
    实核空闲）+ menubar 文件项（「删除…」后）；find 第四分支（无 input
    ——input 行守卫 files||text 化）+ 行 = 路径文本（非点击面——点行
    开档属 §10.2 非目标）+「恢复」钮 +「清空回收站」钮 + 强确认
    alert-dialog（**第 N 弹层实例**；执行期实勘两件：computed 内联
    `+` 串接不发射 → trash_purge_desc_of 模块纯函数委托[D-33③]；
    description 位 computed 插值 vm 不渲染/vue 发射字面量 → description
    静态 + M 派生裸 computed text 节点[D-33④——生成器缺口在册供料候]）；
    FindPanel 第四模式标签；删除弹层两处文案「移入回收站」（007 描述
    「将移入回收站 X」/014 描述「将移入回收站：目录及其中全部文件（可在
    回收站恢复）」——**014 双防线预览沿袭**：计数/悬空警示两行零变化，
    既有断言 vm/e2e 相应文案判同步随批）。`pnpm build` PASS（双轨编译）。
    冒烟 = vm 矩阵子步首跑承载（见 T-04——删→清单→恢复→自愈全弧）。
- **T-03 恢复流收口**（AC-02 后半）
  - restore 三刷 + 行重算（D-26② 自派生）+ 悬空自愈冒烟 + purge 流。
  - 验证：merged 冒烟全弧线 + file/find 组回归 + e2e 子步冒烟。
  - **[✅ 已完成]**（2026-09-25，commit e83b205）——TrashRestore 流 =
    trash_restore（POST body——CJK 免疫）→ 非空：行消（trash_list
    refetch 单取形）+ LinksRefreshOf（bl/ol 重算内联 active + wanted/
    mentions 随产物——**悬空自愈**）+ TagsRefresh + TreeRefresh 三刷；
    TrashPurgeGo = trash_purge（无参 POST）→ "ok"：关弹层 + refetch
    空态；purge 零刷新（触发集纪律）。e2e 恢复弧自育素材
    TrashSrc/TrashMe（**14 已知答案域不复用 13 删除素材**——执行期口
    径：e2e wanted/tags 已知答案依赖 Hello World 删除态）+ 行域定位 +
    收尾 tab 位态/面板态/激活态三还原（D-17 家族口径）。
- **T-04 测试扩单 + 端口件 + 基线 v15 + 判绿**（AC-02/03/04/05）
  - 子步扩 + pick_port.mjs + probe 切换 + v15 重锁 + gate。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN + probe 全族复跑。
  - **[✅ 已完成]**（2026-09-25，commit e83b205）——vm 矩阵：find 组 ⑥
    trash 模式子步（④文案断言 + 清单 + 强确认 M=1 + 取消留置 + 清空 +
    空态 + 磁盘消——双臂）+ file 组 ⑱ 改道/恢复弧线（清单见条目 → 行
    恢复 → 空态 + exists 翻转回**双向态** + 树行回 + merged tab 重开
    [D-19 口径]）+ 弹层助手族前移 check11 域（TDZ）+ **⑮ 入链已知答案
    1→2**（⑱ 恢复 CAP 连带——其 12 步改写 [[Project X]] 回归链接面
    ——014 双防线语义不变，执行期校正如实记）+ e2e 同单（trash 全弧 +
    恢复弧自育素材 + 树行 stem 定位/多行恢复钮行域定位/同名收起 first/
    tab 位态三还原——四件测试面迭代如实记，非产品 bug）。**基线 v15**
    （trash_rows/trash_purge_open 入 dump + file.trash action/menubar
    项 + 清空弹层 id 序列；v14 留档）锁后连跑零漂移 ≥3（独立跑 + gate
    内矩阵段）。**pick_port.mjs**（T-01 随 probe_trash 提前落地）+
    probe 族 11 件固定 SPLIT_PORT 常量清零（AC-04 grep 证零）。判绿：
    vm merged **16/16**（基线 v15 零漂移）+ split **15/15** + `pnpm
    build` + e2e 十五段全绿（41.4s）+ **gate ALL GREEN** + probe 全族
    11 件双臂 fresh 绿 + probe_receipt_d19 负结果复现一致（g①=0/g②
    len=0——D-19 定谳面零漂移）+ **probe_rename updated_at 先在缺陷
    归一修复实录**（b64794a 复现同败非本批引入——D-33⑤ 执行期校正）。
- **T-03 恢复流收口**（AC-02 后半）
  - restore 三刷 + 行重算（D-26② 自派生）+ 悬空自愈冒烟 + purge
    流。
  - 验证：merged 冒烟全弧线 + file/find 组回归 + e2e 子步冒烟。
- **T-04 测试扩单 + 端口件 + 基线 v15 + 判绿**（AC-02/03/04/05）
  - 子步扩 + pick_port.mjs + probe 切换 + v15 重锁 + gate。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN + probe 全族
    复跑。
- **T-05 文档 + ledger v19 + 收口**（AC-06/负向）
  - SD-1601..1604 落位（四面表）；ledger v18→v19；负向证；§9
    work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。
  - **[✅ 已完成]**（2026-09-25）——SD-1601（ARCHITECTURE §5 回收站
    段六目：双改道/语义零破坏一手源论证/三契约/front 面/probe 端口件/
    probe_trash 直证——**删除语义四面表并表**）+ SD-1602（§6 表头 +
    矩阵行 ⑥/⑱ 子步 + 基线 v15 变更面 + probe_trash/pick_port 段）+
    SD-1603（README Tests 扩定链 + trash 子步注记 + N 定谳 v15 续记 +
    基线指针 + 单门注释）+ SD-1604（README 第十四切片条目 + ledger
    v19 指针）+ **ledger v19**（D-33 六目新行 + D-19 PLAN-016 面随行 +
    D-21 v19 扩记零复现 + 表头 v18→v19）。负向证 grep 实录：`.console`
    App 上下文零赋值/front split_once 代码零（2 处在册注释）/契约纯
    增量（delete_page/delete_dir 签名不变）/D-30① 参数名纪律（rows/
    orig_rel/base 零模型名碰撞）/固定 82xx 端口常量清零/冻结池家族仓
    零接触/gen 零手改/补件面零增量。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；零待裁探针——
create_dir 递归/move 组合/remove_dir_all 全已证）。

## 9. 复审记录

- **2026-09-25 复审（auto-plan-review，r1 pass）**：
  - `stage: review` | PLAN-016 | plan_revision 1 | `outcome: pass` |
    reviewed_commit de7da15 | base_commit b64794a |
    dependency_revisions 无依赖工作树/分支（直接 main 线性约定）；
    工具链 release exe v0.4.2-2125-g63e14b045（AUTO_EXE 显式指路）。
  - **独立性声明**：复审与实现同会话——限制如实记，判定从工件重建
    （现跑复放 + 锚注实勘），不采信执行摘要。
  - acceptance_results（全部现跑复放）：AC-01 **pass**（probe_trash
    十八案+十五布尔对双臂 RESULT 全案通过[本窗复放] + probe_dir_ops
    十四案复放绿 + vm merged 16/16 基线零漂移——行为等价）；AC-02
    **pass**（gate 现跑：vm find ⑥ + file ⑱ 双臂全过 + e2e 十五段
    42.0s）；AC-03 **pass**（vm ⑸「将移入回收站 wiki/CAP 定理.ad」
    + 双防线两行沿袭 + e2e 657 同断言——全绿）；AC-04 **pass**
    （固定 82xx 常量 grep=0 + pickPort 13 处在册 + probe 全族复跑绿
    ——11 件超计划七件口径，AC-04 清零判据所致，scope 扩有据）；
    AC-05 **pass**（gate ALL GREEN 现跑：merged 16/16 + [B baseline]
    v15 零漂移 + split 15/15 + build 8.98s + e2e 42.0s + README:370
    N 定谳续记）；AC-06 **pass**（SD-1601@ARCH:729[四面表:733]/
    SD-1602@ARCH:786+790/SD-1603@README:164+370/SD-1604@README:410
    实勘落位 + ledger D-33@:44 + D-19 随行 + D-21 v19——H1 版本字面
    stale 见 F-R16-1）。
  - findings：**F-R16-1**（low，非阻塞）——ledger H1 版本字面 stale
    （行 1「登记表 v18」未随链尾「表头版本 v18→v19（SD-1604 指针）」
    bump；README 指针 v19/行数 33/链尾均一致）——随 merge ledger
    refresh 校正（F-R9-1「随 merge 校正」先例）。观察项两条（非
    findings，执行期校正已如实记录）：计划 §4.2 v15 变更面摘要未列
    App trash_purge_open 字段（§2.3 强确认弹层设计自带开态——基线/
    commit 如实记）；delete 面 `.trash` 自涉卫为计划未列卫面补强
    （T-01 证据在册——语义收窄方向，无 AC 偏离）。
  - evidence：本记录所引全部为本复审窗现跑实录（probe_trash/
    probe_dir_ops RESULT 行 + gate 五段 PASS 行 + 锚注行号）；基线
    记录 = 树零 WIP/worktree 仅 main/pickPort grep 证。
  - `next: merge`。
- **2026-09-25 work 收口（auto-plan-work）**：
  - `stage: work` | PLAN-016 | plan_revision 1 | `outcome: pass` |
    code_commit e83b205（T-01=0d69571）| task_ids T-01..T-05 全勾。
  - evidence：T-01 probe_trash 十八案+十五布尔翻转对双臂全绿 + 行为
    等价回归（probe_delete 九案/probe_dir_ops 十四案/vm merged 16/16
    基线 v14 零漂移）；T-02..03 front 双轨（vm find ⑥ + file ⑱ 双臂 +
    e2e 十五段全绿 41.4s）；T-04 基线 v15 锁后零漂移 ≥3 + gate ALL
    GREEN + probe 全族 11 件 + D-19 回执负结果复现一致 + probe_rename
    先在缺陷归一（b64794a 同败实录）；T-05 SD-1601..1604 落位 + ledger
    v19 + 负向证 grep 全零。
  - 执行期校正五件（均在册 D-33/§8 证据）：computed 内联串接不发射
    （纯函数委托）/description 位 computed 插值不发射（裸 computed
    text 节点）/e2e 恢复弧自育素材（14 已知答案域隔离）/⑮ 入链已知
    答案 1→2（恢复弧连带）/probe_rename updated_at 归一（先在缺陷
    b64794a 实录）。
  - blockers：无。
  - `next: review`（建议独立会话复审；工件重建口径——gate/probe_trash
    现跑复放）。
- **2026-09-25 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-016，revision 1。
  - `outcome: pass`——可进 work（015 已归档 b64794a——正常立项窗）。
  - `next: work`（T-01 起；零待裁探针）。
  - 「彻底删除」直通选项默认不做（§4.1——r2 口）；池外新晋方向
    （回收站）依据 §2.1 风险清偿论证。

## 10. 待澄清事项

1. **「彻底删除」直通选项**（默认不做）：v1 恒改道（双安全网）；
   Shift+Delete 变体直硬删或弹层复选 → r2 小范围。
2. **trash 内预览/批量恢复**（后续批）：v1 行级单恢复 + 路径文本
   行；点行开档（read_wiki 通 .trash 路径——语义域裁决）与多选
   批量恢复随 UX 批。
3. **`--{n}` 后缀解析边界**（观测项）：档名本体含 `--1` 形态的剥析
   误判（恢复时错误去尾）——v1 记账（语料/常规命名不含；受影响
   条目恢复名可由用户重命名修正）。
4. **`.trash` 佔位文件**（不做）：空 trash 目录不落 .keep——trash_
   list 对缺失目录返回 []（fs.tree 缺失容错 T-01 验）。
5. **D-21 POST 波及**（观测项）：restore/purge 单 POST/次；负载窗
   按 README 重跑口径，ledger v19 如实记。
6. **PLAN-017 候选池**（本批后更新）：大纲（anchor-reveal 解锁——
   首位顺延候）、casefold+词边界批、目录移动/合并、检索上量微批、
   Time front 面 probe 批、url_decode 供料回执件、trash 预览/批量
   恢复。
