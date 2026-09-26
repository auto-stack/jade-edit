---
plan_id: PLAN-019
status: reviewed
feature_name: dir-merge-trash-plus-slice
author: [zhaopuming]
created_at: 2026-09-26T23:58:21+08:00
updated_at: 2026-09-27T02:30:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1901"
  - "docs/ARCHITECTURE.md#SD-1902"
  - "docs/README.md#SD-1903"
  - "docs/README.md#SD-1904"
touched_goals: []
---

# [PLAN-019] 知识库第十七切片——目录合并（r2 兑现）+ trash 增强（恢复全部/预览 + F-R18-1 收口）

## 0. 变更摘要

SD-301/SD-405 主线第十七片，工作区收尾双件：

1. **目录合并**（PLAN-018 §10.2 r2 留口兑现）：`move_dir` **扩参
   `merge`**（013 签名扩参先例——`move_dir(path, new_parent, merge)`）
   ——目标同名目录存在且 merge=true → **文件并入**（逐档迁移至目标
   已存目录；**冲突档 `--{n}` 后缀保双份**——同 trash 冲突规则族，
   零数据丢失默认）；merge=false 行为 = 现拒径零变化。front 移动
   目录弹层增「合并同名目录」checkbox（menubar-checkbox 族在册）+
   目标同名预览行（本地派生）。**F-R18-1 收口**（018 遗留：move_dir
   `.trash` 域卫双面无直证案——本批 probe 扩案补证）。
2. **trash 增强**（PLAN-016 §10.2 兑现）：「**恢复全部**」钮（front
   逐条循环 restore——v0 条目量接受；back 批量契约后续批 §10.3）
   + **行点击预览**（`.trash` 路径 store.Open 开档——可编辑口径：
   保存落回 .trash 原位注记[回收站档编辑无破坏面——语义注记入
   SD]）。
3. **观察项随批**：F-R17-1 gate 单命令复核（T-04 载体——家族稳定
   窗若至即闭）；D-35② 上游字符串池复测（bulkalias201 在册复现
   案重跑一次——家族 exe 变更窗若至则顺带回执，负结果维持如实记）。

**上量批后移论证**（池内「索引单趟合并」续顺延依据）：D-35② 定谳
P≤200 上游规模上限（VM 字符串池 >200 页损坏）——单趟合并的规模化
收益区间（P>200）恰被上游 bug 封顶 → 等 D-35 上游收口后随 watch 批
同议（§10.5）。

上游缺口适配内置：D-19（move_dir 扩参 POST）；D-20②③；D-24②③④⑤；
D-25①；D-26②/D-28②；D-29①③；D-30①；D-31；D-33②；D-34。

## 1. 目标

- **G1（目录合并可用·双轨）**：移动目录弹层——目标父目录含同名
  目录时预览行提示「目标已有同名目录」+「合并同名目录」checkbox：
  勾选 → 确认 → **无冲突档直入**（逐档迁移）+ **冲突档 `--{n}`
  后缀保双份**（同名档并存，用户清理）→ 树/链接/标签刷新 + tab
  更新 + 链接零扰动（stem 不变——冲突后缀档为**新档**，入链悬空
  口径注记）；不勾选 → 现拒径零变化；取消零落盘。
- **G2（trash 增强可用·双轨）**：trash 模式——「恢复全部」钮（逐
  条循环 restore → 全清 + 三刷[最后一次] + 清单空态）；行点击 =
  预览开档（`.trash/...` 路径 tab 打开——dtitle/树不可见[dot 忽略]
  断言；编辑保存落回 .trash 原位——语义注记）。
- **G3（F-R18-1 收口）**：move_dir `.trash` 域卫直证双案（源/目标
  含 `.trash` 前缀 → 拒）——018 遗留 low finding 补案闭账。
- **G4（测试面）**：file 组子步扩（合并弧线）+ find·trash 子步扩
  （恢复全部/预览）——**组数不变 16/15/十五段**；基线 **v17** 计划
  内重锁（store/App 合并 checkbox 面 + trash 预览零新态）。
- **非目标**（明确排除）：
  - 合并的逐档冲突策略选择 UI（跳过/覆盖/保留双份三择——v1 恒
    保留双份；策略面板 r2 口 §10.2）；
  - back 批量 restore 契约（`trash_restore_all`——v0 条目量 front
    循环够用；量级证据触发时升级 §10.3）；
  - trash 档只读预览（编辑器 readonly 面未证——v1 可编辑口径）；
  - **索引单趟合并**（D-35② P≤200 上游封顶——watch 批联动顺延，
    §10.5 论证）；
  - 大纲（anchor-reveal 十片门控）、Time front probe、NFKC、
    url_decode 回执（池内顺延）、上游件实做与生成物补件（AC-05
    负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十七片是工作区收尾批

- **候选池对表**（PLAN-018 §10.6 + ledger v22 实核）：大纲（十片
  门控——上游 anchor-reveal grep 0 维持）、目录合并（**本批——018
  r2 留口 + F-R18-1 补案载体**）、索引单趟合并（**后移**——D-35②
  P≤200 封顶论证 §0）、Time front probe（独立价值低）、trash 增强
  （**本批——016 §10.2 兑现**）、NFKC（未触发）、url_decode/上游
  字符串池回执（家族稳定窗——随批轻量复测）。北标口径（SD-405）：
  长期线——工作区组织操作**全对称收官**（建/移/删/改/合——018 后
  仅缺合并）；trash 是 016 安全网的可用性补全（单条恢复 → 批量+
  预览——真实误删场景常是多档）。两件合计一个「收尾批」，后续
  立项重心转向池外/上游解锁候。
- **形态复用度**：合并 = move_dir 循环骨架 + trash 冲突后缀规则族
  直承；checkbox = menubar-checkbox 族在册（弹层内 checkbox 形态
  探针 G——bps form checkbox 在册语法，dialog 内嵌零先例 → 小探针
  或降级按钮切换）；恢复全部 = front 循环 + 既有 restore 契约；
  预览 = store.Open 直通。**零新契约**（move_dir 扩参除外——
  013 先例）。

### 2.2 数据面（back：move_dir 扩参）

```rust
/// 移动目录到新父（merge=true：目标同名目录并入——冲突档 --{n}
/// 后缀保双份；.trash 域卫双面）
/// POST /api/move_dir
#[api(method = "POST", path = "/api/move_dir")]
pub fn move_dir(path str, new_parent str, merge bool) str {
    return wsys.move_dir_impl(path, new_parent, merge)
}
```

- **move_dir_impl 扩**（018 五卫改六卫）：目标冲突卫分支——
  merge=false → 现拒径（零变化）；merge=true → **并入径**：目标
  目录 = new_parent/{dirname}（已存在）→ 逐档迁移（冲突档
  `{stem}--{n}{ext}` 后缀 while exists——trash_target 同族规则）→
  源目录清空 remove_dir；**冲突后缀档 = 新档**（stem 变——链接
  面按新档悬空口径，SD 注记）；**`.trash` 域卫扩双面**（源或
  new_parent 以 `.trash` 起 → 拒——F-R18-1 直证面；018 执行期已
  加护但无直证案）。
- **返回**：目标目录 rel（合并径同）。
- **零其他 back 增量**（恢复全部 front 循环；预览零 back 面）。

### 2.3 消费面（front）

- **store**：`dirmerge_on` bool（checkbox 态——弹层局部态入 App？
  014 弹层 input 值居 App 惯例 → checkbox 态居 App `dirmerge_on`——
  **App 模型**（非 store）——基线面盘点 T-02 落定）。
- **移动目录弹层扩**：预览行（目标同名检测——dirs_of/paths_under
  本地派生：new_parent + "/" + dirname ∈ dirs → 提示行）+ checkbox
  「合并同名目录」（**探针 G**：dialog 内 checkbox 双轨形态——bps
  form checkbox 语法在册，dialog 内嵌零先例；fallback：双钮变体
  「移动」/「合并移动」——目标同名时合并钮显）。
- **`.MoveDirGo` 扩**：三参 fetch（merge = checkbox 态）；合并径
  后刷新族同现径（tree/links/tags + tabs 循环）。
- **trash 模式扩**：「恢复全部」钮（底部清空钮旁——行循环
  `trash_restore(entry)` 逐条 → 完成后 refetch 清单 + 末次三刷）；
  行点击 = `.OpenLink(entry)`（预览开档——.trash 路径直通；tab
  标题 = stem；树不可见断言）。

### 2.4 键位/菜单面

零新增（合并 = 弹层内交互；trash 增强 = 模式内钮）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件（checkbox 族在册——dialog 内嵌形态探针 G）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-26 会话口述：「计划018已经完成；请规划
  （[$auto-plan-new]）下一个计划」——**立项授权**：018 已归档
  （8894a16——正常立项窗）。方向选择（目录合并+trash 增强双件）
  = 候选池对表 + §2.1 依据；handoff 未否决即生效（PLAN-004..018
  同款约定）。
- **合并冲突策略默认「保留双份」**（零数据丢失优先）；用户要三择
  UI/跳过策略 → r2 口。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05）。无预算/自动续跑/工具链版本指定。

### 4.2 接地证据（本仓实读，2026-09-26 @ main 8894a16）

- **在册复用件**：move_dir 五卫+循环骨架（018——SD-1801 定文）；
  trash 冲突后缀规则（016 trash_target——合并冲突档同族）；恢复
  契约 trash_restore（016）；store.Open/.trash 路径直通（dot 忽略
  面——SD-1601 walk 语义：开档 read_wiki 直读[不入索引]）；弹层
  双 input（018 移动目录弹层——预览行/checkbox 扩展位）；menubar-
  checkbox 族（app.at:982-983 在册——**弹层内嵌 checkbox 为探针
  G 面**）；DirsOf/paths_under（012/014——目标同名检测派生）。
- **D-35 定谳引用**（018）：①StringBuilder 已落（wsys:328/:449
  装配在册）；②P≤200 上游规模上限（**索引单趟合并后移论证**）；
  bulkalias201 复现案在册（本批 T-04 顺手复测载体）。
- **F-R18-1**（018 复审 low）：move_dir `.trash` 域卫双面（源/
  目标前缀）执行期已加护、无直证案——本批 G3 补案（probe_dir_ops
  扩两案）。
- **F-R17-1**（017/018 留观续）：gate 单命令复核——家族 exe 稳定
  窗；T-04 gate 常规跑即载体（第三批随附——闭/留观如实判）。
- **基线**：v16 现行（018）；**v17 变更面** = App dirmerge_on +
  弹层 checkbox/预览行 id 序列（trash 预览/恢复全部零新态——
  复用 find 模式与 OpenLink）。

### 4.3 与既有计划的关系

- 兑现 PLAN-016 §10.2（trash 预览/批量恢复留口）+ PLAN-018 §10.2
  （目录合并 r2 留口）——两处 r2 口同批清账；F-R18-1 收口（018
  遗留 findings 闭环）。
- 索引单趟合并后移论证（D-35② 封顶——§0/§10.5）与 watch 批联动
  不变。
- D-12（anchor-reveal）/D-35②（字符串池）/url_decode 供料留观
  不变；F-R17-1 第三批随附复核。
- PLAN-020 候选池（§10.7 更新）：大纲（anchor-reveal 解锁——首位
  顺延候）、索引单趟合并（D-35 上游收口后 + watch 联动）、Time
  front 面 probe 批、Unicode NFKC 批、url_decode 供料回执件、
  合并三择策略 UI（r3 口）、back 批量 restore 契约（量级触发）。

## 5. 详细设计

### 5.1 back 扩参（SD-1901）

```
pub fn move_dir_impl(path, new_parent, merge) str {
    // 六卫：is_dir×2 / 循环卫 / .trash 域卫双面[F-R18-1 直证] /
    //   目标冲突卫分支（merge=false 拒径；true 并入径）/
    //   纯 .ad / 同父幂等
    // 并入径：逐档迁移（冲突 --{n} 后缀 while exists——trash 同族）
    //   → 源目录 remove_dir → 目标 rel
}
```

### 5.2 front 接线（SD-1901）

- app.at：模型 dirmerge_on；弹层预览行（dirs 派生目标同名检测）+
  checkbox（探针 G——fallback 双钮变体）；`.MoveDirGo` 三参；
  trash 模式「恢复全部」钮 + 行点击 OpenLink 预览。
- ⚠ 自派生（D-26②）/D-30①/D-31/D-33② 纪律族全套。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1901 | modify | docs/ARCHITECTURE.md §5 文件管理域语义段 | before：move_dir 目标同名拒（SD-1801「合并不做」）；trash = 单条恢复（SD-1601）。after：①**目录合并**——move_dir 扩参 merge（013 签名扩参先例二）；并入径定文（逐档迁移 + 冲突档 `--{n}` 保双份——零数据丢失默认；**冲突后缀档 = 新档，入链悬空口径**）；`.trash` 域卫双面定文（F-R18-1 收口）；front 面（checkbox/预览行/探针 G 定谳形态）；②**trash 增强**——恢复全部（front 循环 + 末次三刷）、预览开档（`.trash` 路径直通——可编辑口径[保存落回原位]/不入索引断言注记） | 016/018 两 r2 口清账 + F-R18-1 闭环 | AC-01/02/03/06 |
| SD-1902 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v16。after：组数**不变**（合并入 file 组、trash 增强入 find 组子步）+ **基线 v17**（App dirmerge_on + 弹层扩面；v16 留档） | 测试体系表更新 | AC-05 |
| SD-1903 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v16。after：口径不变 + 子步扩注记 + 基线 v17 指针 + N 定谳续记（F-R17-1 第三批随附实录） | 判绿口径单一权威面（…/1803 续） | AC-05 |
| SD-1904 | modify | docs/README.md「是什么/文档」节 | before：第十六切片=目录移动+上量。after：**第十七切片=目录合并+trash 增强**条目（工作区收尾注记）+ ledger v23 指针 | 产品主线进度面派生同步（…/1804 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：move_dir 扩参案——①合并基础（目标
  同名 + 无冲突档 → 全入 + 源目录消）②**冲突后缀保双份**（同名档
  `--{n}` 并存 + 字节整迁 + 源档内容不变）③merge=false 拒径回归
  （018 七案全绿零变化）④**`.trash` 域卫双面直证**（源/目标
  `.trash` 前缀 → 拒——F-R18-1 闭账案）⑤CJK ⑥循环卫回归 ⑦链接
  零扰动（无冲突全入径——定向 diff；冲突档 = 新档悬空口径注记案）。
- **vm 矩阵（T-04）**：file 组子步——①合并弧线（弹层预览行 +
  checkbox → 确认 → 树并入 + tab 更新 + 无冲突零扰动断言）②不勾
  选拒径回归 ③取消零落盘；find·trash 子步——④恢复全部弧线（多
  条目 → 钮 → 清单空 + 末档悬空自愈）⑤行点击预览（.trash 档开档
  tab + 树不可见断言 + 保存落回原位[磁盘断言]）。
- **e2e（T-04）**：同弧线（真 DOM——checkbox/预览行为探针 G 定谳
  形态）。
- **基线 v17（T-04）**：计划内重锁；连跑 ≥3 零漂移；v16 留档。
- **随批复测（T-04）**：F-R17-1 gate 单命令（第三批载体——闭/留观
  如实判）；D-35② bulkalias201 复现案复测一次（负结果维持则注记）。
- **负向（T-05）**：probe 全族十一代回归（含 018 probe_dir_ops 扩
  merge 案）；`.console` 零；契约面 = move_dir 签名扩（唯一消费者
  front 同批改——013 先例口径）+ 其余零变化；纪律 grep 族；冻结池/
  家族仓零接触；`gen/` 无手改；补件面零增量。

## 7. 验收标准

- **AC-01（move_dir 扩参）**：§6 七案双臂全绿；冲突保双份/域卫
  直证/拒径回归逐案可证。验证：T-01 直证。
- **AC-02（合并 UI 双轨）**：预览行/checkbox（探针 G 定谳形态）/
  合并弧线/拒径/取消，vm+e2e 同断言域全绿。验证：T-04。
- **AC-03（trash 增强 + F-R18-1）**：恢复全部/预览开档/保存落回/
  不入索引断言双轨绿；域卫直证案在案（G3 闭账）。验证：T-04 +
  T-01④。
- **AC-04（随批复测）**：F-R17-1 第三批复核实录 + D-35② 复测实录
  （闭/维持均如实判）。验证：T-04。
- **AC-05（gate + 基线 v17）**：gate ALL GREEN（16/15/十五段口径
  不变）；基线 v17 零漂移（v16 留档）；N 定谳续记。
- **AC-06（文档面）**：SD-1901..1904 落位锚注齐；**并入径定文 +
  冲突后缀档悬空口径 + .trash 可编辑语义注记**入 SD-1901；
  parity-ledger **v23**（F-R18-1 闭账 + 随批复测实录 + 执行期
  实勘）。

## 8. 执行步骤

- **[x] T-01 back 扩参 + 直证**（AC-01）
  - move_dir 三参 + 并入径 + .trash 域卫；probe_dir_ops 扩七案。
  - 验证：直证全绿 + vm 矩阵现行组回归（拒径零变化）。
  - **[2026-09-27 执行实录]**（3b7a85a）：move_dir(path,new_parent,
    merge bool)——目标冲突卫分支[merge=false 拒径零变化/merge=true
    并入径：同名文件占位仍拒+冲突档 `{stem}--{n}.ad` 后缀 while
    exists]；循环卫先于合并分支；.trash 域卫双面（018 加护定文）；
    api.at 契约同步三参[013 先例二] + POST body bool 一手源实勘
    （back_proxy 按名绑定原生 JSON 直通）；front 调用点同批三参适配
    （merge=false）。probe_dir_ops 扩 merge 九案[mb①..mb⑨]双臂全绿
    （嵌套靶 back 管线五连造档通道——write_text 不建父目录+
    create_dir 清洗层不含分隔符，双臂同构零 ws_join）；既有 m①..
    m⑥/m2b/m3b 三参化零漂移；双臂一致=true。执行期校正×1：mb⑥⑦
    首版 `.trash` 存在性断言败于 d②/d④ delete 改道案合法副产物——
    改「拒绝操作零残留」断言（.trash/NoDir、.trash/DirMove 零落点）。
- **[x] T-02 front 弹层扩 + 探针 G**（AC-02 前半）
  - 预览行 + checkbox（探针 G 定谳——fallback 双钮变体）+ 三参
    fetch；trash 模式两钮/行点击接线。
  - 验证：merged 冒烟（预览/勾选/合并/恢复全部/预览开档）+
    `pnpm build` PASS。
  - **[2026-09-27 执行实录]**（773934a）：**探针 G 定谳 = fallback
    双钮变体**——dialog 内嵌 checkbox 生成器双写缺陷实勘[shadcn
    Checkbox 组件路径 checked=状态引用 → v-model 隐式写 + onchange
    → 显式 @update 双翻转净零（vue.rs:13451+gen App.vue:2232 一手
    源）]→「合并移动」条件钮（目标同名时显）+「移动」恒在；模型
    dirmerge_on 旗标（ActMoveDir 复位/双钮 handler 置位/MoveDirExec
    统一消费——handler 间调用直发在册）；预览行 movedir_preview_
    text 纯函数（D-28②/D-30①/D-33② 纪律全套）；trash 增强：行
    点击预览[路径 ghost button→OpenLink] + 恢复全部[TrashRestoreAll
    ——trash_paths_of call-arg 过桥+末次三刷+refetch]。pnpm build
    PASS[release 路由]；vm merged 15/16[唯基线漂移=计划内 v17 面]。
- **[x] T-03 弧线收口**（AC-02/03 后半）
  - 合并全弧线（tabs 循环/刷新族/零扰动冒烟）+ trash 全弧线
    （恢复全部末次三刷/保存落回磁盘验）。
  - 验证：merged 冒烟 + file/find 组回归 + e2e 子步冒烟。
  - **[2026-09-27 执行实录]**（b820bda）：vm ㉓合并弧线[预览行现文
    +合并移动钮→磁盘并入+tab 全量+links_json 归一 diff]+②不合并
    拒径回归；⑦ trash 增强[行点击预览+树不可见（EXPLORER 区子树
    扫描——ft_nodes dump=不透明 vmref 校正）+保存落回 .trash 原位
    [磁盘标记]（保存按法=check 5 在册非精确形校正）+恢复全部[空态
    +磁盘回根字节保真]（建一删一双弧线——ft_sel 选中档语义校正）]；
    e2e dir4[素材 API 前置 daily 前——⑰ 树新鲜度承载，交互后置
    （首版败于 ft_nodes 陈旧，校正）]+trash 增强行为面。**探针 G
    二次定谳**：`if <computed str> != ""` vm 视图条件整子树丢弃
    [diag 一次性件弹层子树 dump 实录]→bool computed 引用健康
    （movedir_conflict）——D-36① 记账素材；dialog-footer 内 if
    不现→条件钮居内容流。基线 v17 重锁（merged 15/15 ×3+v17 锁）。
- **[x] T-04 测试扩单 + 基线 v17 + gate + 随批复测**（AC-02/03/04/05）
  - 子步扩 + v17 重锁 + gate（F-R17-1 第三批载体）+ bulkalias
    复测。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN。
  - **[2026-09-27 执行实录]**：merged **ALL GREEN ×4**（16/16 含
    基线 v17 零漂移——gate 内锁后 PASS 实录）；**split = 外部家族
    窗延续[分段判绿]**：三跑 boot FAIL+wiki 行不现 + **本批前代码
    [8894a16 git-archive+deps 物料]同 exe 同签名复现**（判别链外部
    性定谳——D-21 v23 扩记；probe_dir_ops 双臂全弧新 exe 绿+e2e
    serve-back 全程绿承载载体健康）；e2e **5 连绿**（50.1-53.5s）；
    F-R17-1 gate 两跑实录[merged 过→split 败短路——build 段未达]
    维持留观；**D-35② 复测负结果维持**[新 exe split N=500 仍坏
    ——整数 500 字面量 len=3 同域形态变体]；probe 全族 13 件
    fresh[12 RESULT 全绿+receipt_d19 负结果一致 g①=0/g② len=0]。
- **[x] T-05 文档 + ledger v23 + 收口**（AC-06/负向）
  - SD-1901..1904 落位；ledger v22→v23；负向证（probe 十一代）；
    §9 work 记录。
  - 验证：文档 diff 检视 + merged 矩阵回归绿（docs 零代码面；gate
    单命令 split 段=外部窗留观——T-04 实录）。
  - **[2026-09-27 执行实录]**：ARCHITECTURE SD-1901[目录合并+trash
    增强定文四段]+SD-1902[§6 heading+基线 v17 行+子步扩注记+
    probe_dir_ops PLAN-019 扩注记]；README SD-1903[heading/检查单/
    trash 增强+合并子步/N 定谳/基线 v17 条目/单门注释 v17 化]+
    SD-1904[第十七切片条目+ledger v23 指针]；ledger v23[D-36 新行
    五项+D-21 v23 扩记+D-35 复测注记+表头链]；负向证见 §9。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；探针 G 副闸——
fallback 双钮变体在案）。

## 9. 复审记录

- **2026-09-26 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-019，revision 1。
  - `outcome: pass`——可进 work（018 已归档 8894a16——正常立项窗）。
  - `next: work`（T-01 起；探针 G 副闸有 fallback）。
  - 合并冲突策略默认「保留双份」（§4.1——r2 口）；move_dir 签名
    扩参（013 先例二——唯一消费者 front 同批改）。

- **2026-09-27 work 收口（auto-plan-work）**：
  - `stage: work` | PLAN-019 | revision 1 | **outcome: pass** |
    code_commit: 3b7a85a→773934a→b820bda→docs T-05（线性四提交） |
    task_ids: T-01..T-05 全勾 | evidence（七块）：
    ①**back 直证**：probe_dir_ops 双臂全案[既有 d①..d⑥/r①..r⑥/
    r⑦[merged]/m①..m⑥/m2b/m3b 三参化零漂移 + **merge 九案
    mb①..mb⑨ 全绿**——合并基础并入/冲突后缀保双份[靶原档逐字节
    不变+`--1` 新档字节整迁]/merge=false 拒径回归/循环卫先于合并/
    文件占位仍拒/**.trash 域卫双面直证——F-R18-1 闭账**/CJK/无冲突
    链接零扰动归一 diff]双臂一致=true；②**vm 矩阵**：merged ALL
    GREEN **×4**（16/16 含基线 v17 零漂移——锁前 ×3 + gate 内锁后
    PASS 实录；㉓合并弧线+⑦ trash 增强双臂面全通）；**split =
    外部家族窗延续[分段判绿 018 v22 先例]**——三跑 boot FAIL+wiki
    行不现 + **本批前代码[8894a16 git-archive+deps 物料]同 exe 同
    签名复现**[判别链外部性定谳——PLAN-019 零接触证，D-21 v23 扩
    记]；③**e2e 十五段全绿 5 连绿**（50.1-53.5s——dir4 合并弧线+
    trash 增强真 DOM 含）；④**随批复测**：F-R17-1 gate 单命令两跑
    [merged 段过含基线 v17→split 败短路——build 段未达]**维持留
    观**；D-35② 复测**负结果维持**[新 exe split N=500 仍坏——
    整数 500 字面量 len=3 同域形态变体]；⑤**probe 全族 13 件
    fresh**：12 件 RESULT 全绿+probe_receipt_d19 负结果一致[g①=0/
    g② len=0——D-19 维持]；⑥**文档面**：SD-1901..1904 落位锚注
    齐+ledger v23[D-36 新行五项实勘/D-21 v23/D-35 复测注记]；⑦
    **基线 v17**：计划内重锁[App dirmerge_on+弹层预览行/合并移动
    条件钮/trash 行按钮化入 dump/id 序列——非零重锁第四例；v16
    留档]+gate 内零漂移现跑。| blockers: 无（split 臂矩阵 fresh-
    green = 外部家族窗留观[F-R17-1 合流载体]，非本批阻塞——018
    v22 同判先例）| next: review（建议独立会话复审+工件重建口径）。
  - 执行期实勘七件在册：探针 G 三面[D-36①——checkbox 双写缺陷/
    vm computed str 条件丢弃/footer 内 if 不现]、嵌套靶 back 管线
    造档通道[write_text 不建父目录一手源]、删除目标=ft_sel 语义、
    保存按法 exact/menubar 项、.trash 域卫断言口径、D-35② 形态
    变体、8894a16 archive 判别链仪器。
  - 负向证：api.at move_dir 纯扩参[签名+实现+注释，零删除既有
    契约]；front `.console` 写面零违例[D-25①——新增 handler 全
    console_log 形]；split_once front 活用零新增[D-31①——本批
    front 面零 split_once]；gen/dist ignored 零手改；冻结池/家族
    仓零接触[上游仓只读实勘——auto-lang/stdlib.rs/serde 源检]；
    probe 端口 pick_port 通道维持；`.runtime` 一次性件
    [diag-movedir/d35-retest/pre19-check]居 ignored 不入库。

- **2026-09-27 复审 r1（auto-plan-review）：pass**
  - `stage: review` | PLAN-019 | revision 1 | **outcome: pass** |
    reviewed_commit: 33bc7b6（全窗四提交[base=8894a16]直接 main
    线性祖谱：3b7a85a→773934a→b820bda→33bc7b6；工作树零 WIP；
    worktree 仅 main[直接 main 线性约定 001..018 在档惯例]）|
    dependency_revisions: auto-lang debug exe 09-26 10:43[127,
    419,904B] + release exe 09-25 17:58[家族重建窗第三例窗内——
    D-21 v23 在册] | spec_inputs: ledger v23[36 行 tracked]@
    33bc7b6 + ARCHITECTURE@33bc7b6 + README@33bc7b6。
  - **独立性声明**：同会话复审[用户单指令链授权全流程；实施会话
    局限如实记——全部验收证据以工件重建现跑复放为准，不采信执行
    者摘要；018 fce14bf 同款口径]。
  - **acceptance_results（全现跑复放，复审窗 fresh）**：
    - **AC-01 pass**：probe_dir_ops 双臂全案现跑[151 PASS/0 FAIL
      ——merge 九案 mb①..mb⑨ 全绿[合并基础并入/冲突后缀保双份
      [靶原档逐字节不变+`MgC--1.ad` 字节整迁]/merge=false 拒径回
      归/循环卫先于合并/文件占位仍拒/**.trash 域卫双面直证——
      F-R18-1 闭账**/CJK/无冲突链接零扰动归一 diff] + 既有 29 案
      三参化零漂移 + 双臂一致=true]。
    - **AC-02 pass**：vm_matrix merged 现跑 **16/16 ALL GREEN**
      [㉓合并弧线+②拒径回归双臂面全通] + e2e 现跑 1 passed
      53.0s[dir4 合并弧线真 DOM 含]。
    - **AC-03 pass**：vm ⑦ trash 增强[行点击预览/树不可见/保存落
      回 .trash 原位/恢复全部]merged 现跑全通 + probe mb⑥⑦ 域卫
      直证[G3 闭账] + e2e trash 增强行为面现跑。
    - **AC-04 pass**：F-R17-1 gate 单命令第三批实录**维持留观**
      [证据复用——明示理由：exe 复审窗实测未变[时间戳同 T-04 窗]
      + 败形确定性[split boot FAIL 先于 build 段]+两跑实录在册，
      复跑仅重复已知败径——018 fce14bf 证据复用先例同款]；
      **D-35② 复测复审窗复现**[split N=500 → HTTP 200 整数 500
      字面量 len=3——018「空串/整数 0」同域形态变体，负结果维持
      如实录]。
    - **AC-05 pass[环境 caveat 如实录]**：merged ALL GREEN 现跑
      [16/16 含**基线 v17 零漂移**] + 组数口径不变 16/15/十五段 +
      N 定谳续记在案[SD-1903]；**gate 单命令 fresh-green = 外部家
      族窗未至**[D-21 v23——split 臂败形经 8894a16 git-archive+
      deps 物料同 exe 同签名复现判别链定谳外部性，非本批引入；
      分段判绿路由 = 017 v20/018 v22 在册先例原样；unblock =
      家族 exe 稳定后双臂矩阵复跑，与 F-R17-1 合流同载体——非
      验收面缺失，环境阻塞如实记]。
    - **AC-06 pass**：SD-1901@ARCH:902/SD-1902@ARCH:946/
      SD-1903@README:206+:478/SD-1904@README:139+:538 锚点实勘齐
      + 规范增量表四 delta 与落地一一对应[move_dir bool 参数/
      movedir_conflict·TrashRestoreAll·合并移动 front 面/ledger
      v23 grep 实证] + SD-1901 三项定文面[并入径定文+冲突后缀档
      悬空换指口径+.trash 可编辑语义注记]全在案 + ledger v23
      [D-36 五项+D-21 v23+D-35 复测注记]。
  - **findings**：
    - **F-R19-1 low 非阻塞**：合并冲突后缀档的**已开 tab remap
      面**——MoveDirExec 的 TabsRenamed 循环按旧树 paths_under 将
      冲突源档已开 tab 映至 `r + "/" + rest`[靶侧同名保留档 rel]
      ——Reload 后该 tab 显**靶档内容**而非后缀新档内容；源码注记
      在案[app.at MoveDirExec「合并冲突面 v1 记账」]且 SD-1901
      换指口径覆盖链接域语义面，无数据丢失面[后缀新档磁盘在册，
      重开即达]；unblock = r3 口[tab 映后缀路径或关闭——需求首现
      时]。验收面外加护记录，非缺陷（G1/G2 断言域全不涉）。
    - **留观续**：split fresh-green[F-R17-1 合流载体——D-21 v23
      unblock 条件在册]；索引单趟合并后移[D-35② 复测维持]。
  - **next: merge**（status reviewed；复审窗证据全部可解析——
    probe/matrix/e2e/d35 均为入库脚本可复跑，文档锚点位在册）。

## 10. 待澄清事项

1. **探针 G 定谳（已闭——fallback 双钮变体）**：dialog 内嵌
   checkbox 生成器双写缺陷[v-model/onchange 净零——D-36①a]；vm
   视图条件 computed str 比较整子树丢弃[D-36①b——bool computed
   健康]；dialog-footer 内 if 不现[D-36①c]。unlock = 上游 gen/
   VM 视图面（供料候选三件）。
2. **合并三择策略 UI**（r3 口）：跳过/覆盖/保留双份——v1 恒保留
   双份（零数据丢失默认）；策略面板需求首现时 r3。
3. **back 批量 restore 契约**（量级触发）：v0 front 循环（条目
   量小）；单次恢复全部 >50 条首现时升级 `trash_restore_all`
   （事务性也更好）。
4. **`.trash` 预览可编辑语义**（v1 定案已落）：开档可编辑、保存
   落回 `.trash` 原位（vm ⑦ 磁盘标记直证）；只读预览需编辑器
   readonly 面（未证——上游候）。
5. **索引单趟合并后移论证**（D-35② 封顶——**本批复测维持**）：新
   exe 下 split N=500 仍损坏[整数 500 形态变体]→P≤200 稳定域口径
   不变→D-35 上游收口后与 watch 批同议（触发集重构一体）。
6. **split 臂矩阵 fresh-green 留观（F-R17-1 合流载体）**：外部家
   族窗第三例[D-21 v23——本批前代码同签名判别链]；unblock = 家族
   exe 稳定后 `node tests/vm_matrix.mjs` 双臂复跑。
7. **PLAN-020 候选池（本批后更新）**：大纲（anchor-reveal 解锁
   ——首位顺延候）、索引单趟合并（D-35 收口后 + watch 联动）、
   Time front 面 probe 批、Unicode NFKC 批、url_decode 供料回执
   件、合并三择 UI（r3）、批量 restore 契约（量级触发）、shadcn
   Checkbox/视图条件表达式供料回执件（D-36① 三件——上游 gen/VM
   面修复后 checkbox 形态回归探针）。
