---
plan_id: PLAN-025
status: reviewed
feature_name: 目录合并三择与 tab 重映射批（第二十三切片——微件池顺延）
author: [agent]
created_at: 2026-09-29T00:00:00Z
updated_at: 2026-09-29T18:10:00Z
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/README.md 计划仪表盘候选池④（合并三择 r3 + F-R19-1 r3 两件
    出池——微件池顺延批）
  - docs/parity-ledger.md D-36 处置更新（合并三择 r3 兑现 + F-R19-1
    闭账——019 §9 low finding 收口）
---

# PLAN-025：目录合并三择与 tab 重映射批（第二十三切片——微件池顺延）

## 0. 变更摘要

PLAN-024 归档后的首个立项批。**立项路由依据**：README 仪表盘候选①试用
反馈件因用户反馈缺席按定文不立项（docs/README.md:752-753——规划会话
无反馈内容）；候选②残余面唯一件双取形消除（D-39）重推需用户明示授权
（023 §10.6 三选——r2 已裁①挂账，②③未授权，不触授权面不立项）；
候选③上游回执件**视家族窗——窗口未开**（家族 exe 时间戳 2026-09-29
再勘与在册值一致：debug 09-28 15:02 / release 09-28 15:17——连续第
三批未变）；候选④微件池（**反馈缺位时的顺延项**——池定义即本路由）
顺延立项。**批内择件**（④清单逐件核验）：大纲（上游 anchor-reveal
门控维持）/ recents 全局化 r2（独立价值存疑——021 工作区本地持久层
刚落，跨工作区共享无需求信号）/ Time front probe（独立价值低——020
§2.1 判）/ NFKC（未触发）/ **批量 restore（v0 前端循环已在册——
`TrashRestoreAll` app.at:3227；back 契约升级系「>50 条首现」量级门控
未触发，留池不出）**/ checkbox·url_decode 供料回执（上游窗未开）→
**合并三择 r3 + F-R19-1 r3 两件合批**：同域成对（move_dir 冲突语义
+ 其引发的 tab 误映射——三择契约扩展天然携带 F-R19-1 所需文件映射，
一件契动两案）、源码注记在册（wsys.at:1453 冲突后缀 / app.at:
3110-3114 v1 记账）、零上游门控、零授权面；022..024 三连非功能批
（性能×2 + 探针 no-go）后功能面回归——试用驱动阶段的可用性完备件。
**功能切片**（契约扩展批——api.at 非零 diff，019 merge 参数扩展同款
先例）：back `move_dir` 增三择策略参数（跳过/覆盖/保留双份——**零数据
丢失三通道**：源/靶冲突档改道 `.trash` 可回滚）+ 返回形升级 moves 文件
映射；front 合并弹层三择 UI（D-36① 生成器约束规避形态）+ `MoveDirExec`
映射驱动 tab/recents 重映射（**F-R19-1 闭账**——冲突档 tab 显新位内
容非靶档内容）；基线 v19→**v20 计划内重锁**（dirmerge_strategy 字段
——三连续零重锁批后首个功能重锁，020/021 先例续）。

## 1. 目标

1. **① back move_dir 三择策略**（wsys.at `move_dir_impl` :1463 + api.at
   `move_dir` :282 契约扩展）：签名增 `strategy str`（"both" / "skip"
   / "overwrite"——未知值 fail-closed 拒 ""）。**冲突语义（零数据丢失
   三通道）**：`both` = v1 现行（冲突档 `{stem}--{n}.ad` 后缀保双份
   ——:1453 在册规则零变化）；`skip` = 靶档保留原内容 + **源冲突档
   改道 `.trash`**（`trash_target` :906 复用——保结构 + 序号后缀，
   trash_restore 通道可回滚）；`overwrite` = **靶旧档改道 `.trash`**
   + 源档落靶位（move_file 字节整迁——旧靶内容可回滚）。策略仅作用
   于合并径冲突档——卫语句族（循环卫/.trash 域卫/纯 .ad 卫/同名文件
   占位拒）**先于策略分支正交维持**（拒径零变化）。
2. **② moves 映射返回形**：迁移循环收集 `[old_rel, new_rel]` 平面对
   （正常迁移 src→new；both src→后缀位；skip src→.trash 位；
   overwrite 靶旧→.trash 位 + src→靶位）；成功返回 **JSON**
   `{"dir": <新目录 rel>, "moves": [[old,new],…]}`；拒 = "" **哨兵
   零变化**（front `r != ""` 门原样）。`dir` 域 = 现行返回值原样承载
   （active/ft_sel remap 消费面平滑迁移）。
3. **③ front 三择 UI + 映射驱动重映射（F-R19-1 闭账）**：store 增
   `.dirmerge_strategy str`（缺省 "both"——弹层开即复位，dirmerge_on
   :3066 同款纪律）；合并弹层三择（**三钮分立形态**——D-36① 约束
   规避：无 checkbox[vue 轨 v-model/onchange 双写缺陷净零①a]/无视图
   字符串字面比较条件[vm 轨整子树丢弃①b——bool computed 引用健康]；
   冲突提示行 movedir_conflict 现势维持）；`MoveDirExec`（:3089）改
   **映射驱动**：r JSON 解析（`json.to_value(r)` call-arg 形健康——
   D-20⑤ 恒等陷阱不咬 api-call 实参）→ `.dir` 驱动 active/ft_sel
   remap + **moves 驱动 TabsRenamed/recents 置换循环**（替换现
   paths_under 派生 + `r + "/" + rest` 拼接——**F-R19-1 误映射源
   消除**：冲突档 tab 落映射新位[后缀档/.trash 位]非靶档内容；
   .trash 落位 tab 跟随文件——可看可编辑，019 §10.4 语义）。
4. **④ 验证链与基线重锁**：probe_dir_ops 扩案（三择案组 + 返回形
   m①..m⑨ 期望随校）+ probe_trash 回归 + vm_matrix 扩组（三择弧 +
   tab remap 弧）+ e2e 新弧（D-31③ 角色锚纪律）+ 基线 **v20 重锁**
   （dirmerge_strategy 入 dump——计划内重锁，AC-06 锚位）。

**非目标**：

- **批量 restore back 契约**（`trash_restore_all`）：v0 前端循环已
  在册（app.at:3227）——升级系「单次恢复全部 >50 条首现」量级门控
  （019 §10.3 定文），未触发**留池不出**（本批不吞并——量级门控
  语义维持）。
- **合并径的链接改写**：目录移动链接零扰动 v1 定文维持（m⑦ 归一
  diff 口径）——skip/overwrite 改变靶位内容归属不改变链接解析面
  （冲突 = 同 rel 同 stem，链接解析恒达；改道副本居 .trash walk
  忽略域）。
- **跨档事务性**：逐文件循环中段失败留双份容忍注记维持（006 非原子
  窗口家族——File.rename 上游解锁后整体原子化供料不变）。
- **策略面板预览精化**（三择各自的差异化预览文案）：冲突提示行现势
  维持（movedir_preview bool 化提示）——三择静态标签钮自描述，v1
  不做策略感知预览。
- **menubar/快捷键面**：入口维持 menubar 共口（:1129 现状）——不扩。

**成功样**：三择语义 probe 双臂全绿（both 零漂移回归 + skip/overwrite
零数据丢失直证——.trash 改道可 trash_restore 回滚）；F-R19-1 闭账
（矩阵/e2e tab remap 弧直证冲突档 tab 显新位内容）；标准语料全部既有
断言零漂移全绿（both 缺省路径 = v1 行为逐字节等价）；基线 v20 重锁
单点字段面（无意外 state 外溢）。

## 2. 架构方案

**现状证据链**（@99796ce main tip 一手勘定 2026-09-29）：

- **back 冲突面**：`move_dir_impl`（wsys.at:1463——签名三参 merge
  bool [019 SD-1901 扩展]；合并径逐文件迁移循环冲突档 `{stem}--{n}.ad`
  后缀 while exists[:1453 注记——trash_target 同族规则 n 从 1 起]；
  返回新目录 rel 裸 str；"" = 拒哨兵）。`trash_target`（:906-929——
  `.trash/{orig_rel}` + 冲突 `--{n}` 序号 + create_dir_all 父建
  ——**delete 双改道共享单点**，skip/overwrite 改道复用面）。`move_
  file`（:763——read+write+delete 组合迁移 + 双复核，006 定文形态）。
- **api 契约**：`move_dir`（api.at:282-284——POST 三参，merge bool
  body 原生 JSON 直通[back_proxy 按名绑定一手源]；契约文档块 :249-281
  ——扩展点）。
- **front 误映射源（F-R19-1）**：`MoveDirExec`（app.at:3089-3124——
  `r = move_dir(...)` 裸 rel 消费；成功径 `paths_under(.ft_nodes, src)`
  旧树派生 + `store.TabsRenamed(f, r + "/" + rest)` 逐档
  [app.at:3115-3122]——**冲突后缀档 rest 拼接落靶侧 rel 误映射**
  [:3110-3114 v1 记账注记在案——Reload 后 tab 显靶档内容]；recents
  置换循环同口径 [:3123-3124 同记账面]）。
- **弹层现状**：双钮形态（`MoveDirGo` 拒径 / `MoveDirGoMerge` 合并
  [app.at:3081-3088——`.dirmerge_on` 旗标置位 + MoveDirExec 统一
  消费]）+ 冲突提示行（`if .movedir_conflict` [:1922]——bool
  computed :1094 健康[D-36①b]）+ movedir_preview 文本行（:1917
  ——computed text 节点健康）。
- **生成器约束在册**（D-36①——三择 UI 形态约束）：①a vue 轨
  checkbox v-model/onchange 双写净零（禁用）；①b vm 视图字符串
  字面比较整子树丢弃（bool computed 引用健康）；①c dialog-footer
  内条件节点不现（条件钮居内容流——现役双钮已居内容流 :1932）。
- **JSON 消费健康面**：`json.to_value(<api-call>)` call-arg 形 =
  `JSON.parse(await ...)` 健康发射（D-20⑤ 恒等陷阱仅咬 identifier
  实参——Init tree 在册同款）；vm 侧 to_value 直调健康（merged 矩阵
  ft_nodes 先例）。
- **量级/纪律在册**：D-20②（List 元素先拷局部——迁移循环现役纪律
  续）；D-34①（`.length` 不参与字节算术——rel 拼接零涉）；D-39
  （vue 轨 dev-stack 竞态触发域 = trash 恢复弧——本批 e2e 新弧锚
  纪律注记）；D-31③（弹层断言 heading 角色锚——新弧纪律）。

**改法**（back 契约扩展 + front 消费面切换——019 merge 参数扩展同款
先例，双侧仓内同步无外部消费方）：

1. **back 三择 + 映射**：`move_dir_impl(path, new_parent, merge,
   strategy)`——策略校验前置（未知值 → "" 拒，fail-closed）；迁移
   循环冲突分支三分支（both 现行零变化 / skip = `t =
   trash_target(src_rel)` + move_file(src, t) / overwrite = `t =
   trash_target(target_rel)` + move_file(target, t) + move_file(src,
   target_rel)）；循环内同步收集 moves 平面对（含正常迁移全量——
   **映射完整性不变式**：每迁移档恰一对，改道档新位 = .trash 域）；
   返回 JSON 装配（json_esc :237 复用 + `+` 装配——moves 条目量
   ≤ 工作区档数，P ≤ 200 稳定域内[021 防线在册]）。**both 缺省等价
   论证**：strategy="both" 分支 = 现行代码路径原样（行为逐字节等价
   ——m①..m⑨ 回归承载）；卫语句族先于策略分支（拒径零变化）。
2. **front 三择 UI**：`.dirmerge_strategy` store 字段（缺省 "both"
   ——ActMoveDir 复位三件套 [:3062-3066 扩]）；合并侧三钮（「合并·
   保留双份」「合并·跳过同名」「合并·覆盖同名」——各钮置 strategy
   + dirmerge_on=true + MoveDirExec；拒径钮 MoveDirGo 维持现役零
   变化）；静态标签 + bool computed 条件——零字符串比较视图条件
   （D-36①b 规避形态声明）。
3. **front 映射驱动重映射**：`r` JSON 解析（call-arg 形）→ `.dir`
   抽取（active/ft_sel/Reload 消费面替换）→ moves 循环：`TabsRenamed(
   old, new)` + recents 置换（**映射查表替换 paths_under 派生 +
   rest 拼接**——旧树派生删除，F-R19-1 误映射源结构性消除）；.trash
   落位 tab 跟随（可看可编辑——019 §10.4；保存落回 .trash 原位
   语义在册）。刷新族（LinksRefreshOf/TagsRefresh/MentionsRefreshOf/
   TreeRefresh）现役序维持零变化。

## 3. 技术栈

- **back**：Auto（VM 解释——merged 直调 + serve-back `auto run
  --server vm -B` 双臂；wsys.at/api.at 两文件）。
- **front**：app.at（store 字段 + 弹层 UI + MoveDirExec 消费面切换
  ——vue 轨经 regen-vue 发射，checkbox/条件约束规避形态声明）。
- **探针**：tests/probe_dir_ops.mjs 扩案（三择案组——merged 直调 +
  serve-back POST + pick_port）+ tests/probe_trash.mjs 回归（trash_
  restore 对 skip/overwrite 改道档的回滚弧——.trash 域内新条目形）。
- **验证链**：tests/vm_matrix.mjs 扩组（基线 **v20 重锁**）+
  playwright e2e 新弧（角色锚纪律）+ vue build（release 路由）。
- **基线**：structure-v19 → **v20**（dirmerge_strategy 单字段入
  dump——计划内重锁；id 序列/store 其余字段零外溢断言）。

## 4. 需求分析与背景调查

**授权记录**（技能纪律：不发明授权/预算）：

- 本次授权 = 用户 `/auto-plan:new` 调用（「计划24已经事实完，请继续
  安排下一个计划」）——**起草权 only**，本技能不实施（handoff 至
  auto-plan-work）。
- **主题选择**：按仪表盘首位序 + 实勘核验自主择定（先例：PLAN-024
  规划期四选询问无答复 → 池序自主择定 → 用户以执行交付追认）。排除
  链四项在册（§0）：①反馈缺位②D-39 待授权③家族窗未开（exe 时间戳
  09-28 载体未变——连续第三批）④顺延路由。批内择件排除链（§0 六件）
  ——**合并三择 r3 + F-R19-1 r3 合批**为唯二「同域成对 + 源码注记
  在册 + 零上游门控 + 零授权面」件。用户改向出口 §10.1。
- **r3 口门控注记**：两件的 019 §10 原始缓办理由系「需求首现时 r3」
  ——池④「反馈缺位时的顺延项」头部定义即当前顺延路由的授权面（022
  §0「候选②顺延立项」同款先例：①缺席时下位顺延）；本批如实记录
  需求信号 = 反馈缺位下的池序顺延（非用户显式需求首现）——§10.1
  改向出口对冲。
- 无用户预算/自动续跑限制给到——不发明。
- **base**：main @99796ce（工作树 clean——本批符号行号实勘载体；
  024 归档簿记补全后 tip）。
- **Specs 状态**：本仓无 docs/specs/（023/024 §9 同款声明）——
  canonical = docs/ARCHITECTURE.md + docs/README.md +
  docs/parity-ledger.md@v28；本批 delta 见 §5 规范增量表。

**背景引证**：

1. 候选定义：archived/019 §10.2 条 2（合并三择策略 UI——跳过/覆盖/
   保留双份，v1 恒保留双份零数据丢失默认）+ §10.3 条 3（批量 restore
   量级门控——v0 front 循环在册）+ §9 findings F-R19-1 low（tab
   remap 面——MoveDirExec TabsRenamed 按旧树 paths_under 映靶侧
   rel，Reload 后显靶档内容；无数据丢失面；unblock = r3 口）。
2. ledger v28：D-36（019 实勘集——①a/b/c 生成器约束在册）+ D-39
   （vue 轨 dev-stack 竞态——trash 恢复弧触发域）+ D-22/D-35
   （PLAN-024 收口处置）+ D-21 v28（家族窗第八例）。
3. README :750-778（候选池 + 留观面板现势——④清单与批量 restore
   v0 在册态）。
4. 源码注记：wsys.at:1453（冲突后缀规则）/ app.at:3110-3114（v1
   记账——F-R19-1 在源注记）/ api.at:249-284（move_dir 契约文档块）。
5. 上游一手源（不涉本批改动——引用面）：fs.tree/move_file 族健康
   在册；trash_target :906（delete 双改道共享单点——复用声明）。

## 5. 详细设计

### 5.1 back 三择策略与 moves 映射（T-01）

- **签名与校验**：`move_dir_impl(path str, new_parent str, merge
  bool, strategy str)`；策略白名单（"both"/"skip"/"overwrite"——
  逐字等值判定）未知值 → "" 拒（fail-closed——卫语句族同判风格）。
  api.at `move_dir` 四参直通（POST body 按名绑定——merge bool 先例
  同通道；strategy str CJK 无涉纯 ASCII 枚举）。
- **冲突三分支**（迁移循环内——仅 merging 且目标位 exists 时）：
  - both：现行后缀逻辑**原样**（零代码路径变化——等价论证锚点）；
  - skip：`t = trash_target(new_rel)` → `move_file(new_rel, t)`
    （**源档**=待迁入档迁 .trash 位——靶位文件零触碰）；
  - overwrite：`t = trash_target(new_rel)` → `move_file(new_rel,
    t)` 后 `move_file(src_old_rel, new_rel)`（**靶旧档先改道**，
    源档落位——new_rel 双写序：先出后入，双复核维持）。
  - ⚠ 实现注记：skip/overwrite 的「冲突档」判定 = 迁移循环目标位
    exists 检查（现行 both 分支同判位点——while exists 后缀判定
    复用同 exists 探测，分支早于序号循环）。
- **moves 收集**：循环内 `moves_old.push(o)` / `moves_new.push(n)`
  平行双 List（D-20② 元素拷贝纪律；正常迁移 [src→new_rel] 全量
  入映射——**完整性不变式**：成功径每迁移档恰一对）。skip 档 o=
  src_old_rel n=.trash 位；overwrite 双对（靶旧→.trash + src→
  new_rel）。
- **返回 JSON**：`{"dir":"<new_rel>","moves":[["o","n"],…]}`——
  json_esc :237 复用转义；装配 `+` 串接（条目量 ≤ P ≤ 200 稳定域
  [021 防线]——D-35② 域内；D-40 探针纪律：单调用长循环拆串行不涉
  [迁移循环本 in-call，返回体量小]). 拒 = "" 原样。
- **卫正交论证**：策略分支位于全部卫语句（循环卫/.trash 域卫/纯
  .ad 卫/同名文件占位拒/同父幂等）之后——拒径与 strategy 值无关
  （probe 正交案承载）。

### 5.2 front 三择 UI 与映射驱动重映射（T-02）

- **store**：`.dirmerge_strategy str`（模型字段——缺省 "both"）；
  `ActMoveDir` 复位三件套（src/dst/strategy + dirmerge_on=false）。
  基线 v20 重锁（单字段面）。
- **弹层三择**（合并域）：三钮分立（静态标签「合并·保留双份」/
  「合并·跳过同名」/「合并·覆盖同名」——各 onclick 置 strategy +
  dirmerge_on + MoveDirExec）+ 现役拒径钮（「移动」MoveDirGo :1932
  维持）。**D-36① 规避声明**：零 checkbox（①a）、零视图字符串
  比较条件（①b——三钮静态无策略感知视图分支）、钮居内容流（①c
  现役位维持）。冲突提示行（bool computed）与 preview 文本行现势
  维持。
- **MoveDirExec 映射驱动**（:3089 域重写）：
  - `r = move_dir(src, dst, .dirmerge_on, .dirmerge_strategy)`；
  - 成功径：`m = json.to_value(r)`（call-arg 形健康——vm 直调/
    vue JSON.parse 双轨在册形态）→ `d = m.dir`（active/ft_sel/
    store.Reload 消费面 r→d 替换）→ **moves 循环**：`TabsRenamed(
  o, n)` + recents 键置换（o 命中即换 n——含 .trash 位跟随）；
  旧 `paths_under` 派生 + `rel_under` + `r + "/" + rest` 拼接
  **删除**（F-R19-1 误映射源结构性消除——映射查表替换派生拼接）；
  - 刷新族五连现役序维持；拒径（""）console 注记 + 弹层留置维持。
- **F-R19-1 闭账口径**：冲突档开 tab → merge（任一策略）→ tab
  remap 至映射新位——both 后缀位 / skip·overwrite .trash 位（可看
  可编辑——019 §10.4 语义，保存落回 .trash 原位在册）——**tab 恒
  显其文件真实新位内容**（误映射[显靶档内容]形态消除）。

### 5.3 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2501 | modify | docs/ARCHITECTURE.md §5（后端） | before：§5 第二十二切片段（SD-2401——mtime 键控关账定文）+ 019 SD-1901 合并径定文（冲突档后缀保双份 v1 + 悬空换指口径注记）。after：§5 第二十三切片段——合并三择定文：move_dir 四参契约（strategy both/skip/overwrite——fail-closed 未知拒）+ 零数据丢失三通道（both 后缀保双份 v1 原样 / skip 靶保 + 源档改道 .trash / overwrite 靶旧改道 + 源档落位——trash_target 共享单点复用，trash_restore 回滚通道）+ moves 映射返回形（JSON {dir, moves}——拒 "" 哨兵零变化；映射完整性不变式）+ 卫语句族先于策略分支正交定文 + front 映射驱动 tab/recents 重映射口径（F-R19-1 闭账——.trash 落位 tab 跟随文件可看可编辑） | 019 §10.2 r3 口兑现 + F-R19-1 low 闭账；池④顺延批 | AC-01/02/03 |
| SD-2502 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests heading | before：§6 SD-2402 注记（第二十二切片——probe 族 15 件）。after：第二十三切片注记——probe_dir_ops 扩案（三择案组 + 返回形 m 案期望随校）+ probe_trash 回归扩（skip/overwrite 改道档回滚弧）+ vm_matrix 扩组（三择弧 + tab remap 弧）+ 基线 v20 重锁（dirmerge_strategy 单字段——计划内重锁） | §6 heading 惯例随批扩（SD-2202/2302/2402 先例续） | AC-02/04 |
| SD-2503 | modify | docs/README.md（是什么 + Tests N 定谳 + 计划仪表盘） | before：是什么第二十二切片条目 + 仪表盘④清单（合并三择 r3/F-R19-1 r3 在池）+ 留观面板。after：是什么第二十三切片条目（合并三择与 tab 重映射批——三择语义/映射契约/F-R19-1 闭账实录）+ Tests N 定谳 025 实录 + 仪表盘④收窄（两件出池——批量 restore 维持量级门控留池注记）+ 留观面板续记 | 知识库三件形惯例（019..024 先例续） | AC-03/06 |
| SD-2504 | modify | docs/parity-ledger.md | before：v28——D-36 处置列（019 实勘集——r3 口挂账面）+ D-21 v28 + D-39（trash 恢复弧触发域注记）。after：v28→v29——D-36 处置更新（合并三择 r3 兑现 + F-R19-1 闭账——019 §9 low finding 收口注记）+ D-21 v29 扩记（执行窗实录惯例）+ 执行窗新观测如有则新行/扩记（三择 UI 生成器面如现新形态——D-36① 族续判） | 衍生账随批刷新惯例（SD-2104..2404 同款） | AC-06 |

## 6. 测试设计

- **probe_dir_ops 扩案（AC-01 主证）**：三择案组（merged 直调 +
  serve-back POST 双臂）——s① both 回归（m①..m⑨ 现行案期望随校
  JSON 形[.dir 抽取]——行为零漂移直证）；s② skip 基础（靶档逐字节
  不动 + 源冲突档居 .trash{orig} 保结构 + 映射对[src→.trash 位]）；
  s③ skip 多冲突（.trash 序号 --{n} 续接——trash_target 同族）；
  s④ overwrite 基础（靶旧档居 .trash + 源档落靶位逐字节 + 双映射
  对）；s⑤ 策略×卫正交（循环卫/.trash 域卫/纯 .ad 卫/同名文件占位
  拒——各卫拒径三策略同判 "" 零变化）；s⑥ 未知策略拒（"xxx" → ""
  fail-closed）；s⑦ CJK 目录/档名三择；s⑧ skip/overwrite 改道档
  trash_restore 回滚弧（恢复回原位/去后缀名——probe_trash 域联证）；
  s⑨ 链接零扰动归一 diff 续（m⑦ 口径——三择径 moved 集合归一对照）；
  s⑩ moves 完整性（成功径迁移档数 == 映射对数[overwrite 双对计]）。
- **probe_trash 回归**：18+15 案全量 fresh（skip/overwrite 改道新
  条目形进入 trash_list/restore 域——s⑧ 联证面）。
- **vm_matrix 扩组（AC-02/03）**：三择弧（合并弹层三钮 × 冲突态
  ——策略置位 + 执行 + 拒径）+ **tab remap 弧（F-R19-1 直证）**：
  冲突源档开 tab → MoveDirGoMerge(策略) → 断言 tab path = 映射新位
  （both 后缀位/skip·overwrite .trash 位——**非靶档 rel**）+
  recents 置换同口径断言。基线 v20 重锁（dirmerge_strategy 入 dump
  + id 序列延续）。
- **e2e 新弧（AC-03/04）**：合并三择 UI 弧（三钮可达 + 冲突提示行
  + skip/overwrite 执行后树/内容断言）+ tab 重映射弧（e2e 面开档→
  合并→tab 内容直证）。**锚纪律（D-31③/D-39 触发域注记）**：弹层
  断言 heading 角色锚 + 树行/内容锚避免 getByText 全树 .first()
  形——既有 :821 trash 弧零触碰（D-39②授权面不涉）。
- **负向证族**：api.at diff = **恰 move_dir 契约面**（四参 + 文档
  块——非「零 diff」形，019 merge 扩展同款注记）/ `.console` 写面
  grep 0 / 基线·冻结池外零触碰 / gen·dist ignored 零手改 / 一次性
  件居 ignored .runtime / 双取形零触碰（D-39 workaround 维持——
  LinksRefreshOf 域不涉）。

## 7. 验收标准

- **AC-01 三择语义面（back）**：probe_dir_ops 三择案组 s①..s⑩
  双臂全绿——both 零漂移回归（s① 现行案 JSON 形随校全过）+ skip/
  overwrite 零数据丢失直证（s②/s④：改道档居 .trash + s⑧ 回滚弧）+
  卫正交（s⑤）+ fail-closed（s⑥）+ CJK（s⑦）+ 链接零扰动（s⑨）+
  映射完整性（s⑩）。验证：probe RESULT 全绿输出内嵌 §8。
- **AC-02 映射契约与 tab 重映射（F-R19-1 闭账）**：moves 完整性
  不变式（s⑩）+ 矩阵 tab remap 弧直证（冲突档开 tab → 合并 → tab
  path = 映射新位[后缀/.trash 位]——非靶档 rel；recents 置换同口径）
  + e2e tab 重映射弧绿。验证：矩阵/e2e 日志 + 基线 v20 PASS。
- **AC-03 前端三择 UI 双轨面**：三钮可达 + 冲突提示行现势 + 拒径
  弹层留置口径维持 + **vm/vue 双轨渲染直证**（D-36① 规避形态——
  零 checkbox/零字符串比较条件；矩阵 UI 弧 + e2e 双轨）。验证：
  矩阵扩组 + e2e + gen 源检（App.vue 三钮发射形态注记）。
- **AC-04 判绿矩阵**：merged 16/16+扩组（基线 v20 重锁后 PASS）+
  split 15/15+扩组（家族窗续则分段判绿 018..024 先例 + 判别链
  惯例）+ e2e 全绿（新弧含）+ build ✓built（release 路由）。验证：
  矩阵/e2e/build 日志 + exe 时间戳实录（留观面板续记）。
- **AC-05 负向证全零**：§6 负向证族全零违例（api.at diff 面单点
  注记形态除外——契约扩展批定文）。验证：各面命令输出内嵌 §8。
- **AC-06 文档四面锚位与一致性**：SD-2501..2504 落位（ARCH §5 第
  二十三切片段 + §6/README Tests heading + README 是什么/N 定谳/
  仪表盘④收窄 + ledger v28→v29——D-36 处置更新 F-R19-1 闭账）+
  基线 v20 重锁注记。验证：锚位 grep 读回全现 + delta after 文本
  与落地文本一致性核验。

## 8. 执行步骤

- **[x] T-01 back 三择 + moves 映射（AC-01/02 前置）**：wsys.at
  `move_dir_impl` 四参化 + 冲突三分支 + moves 平行收集 + JSON 返回；
  api.at `move_dir` 四参契约 + 文档块扩展。依赖：无。验证：
  probe_dir_ops s①..s⑩（T-03 扩案后跑）。[✅ 已完成] probe 双臂
  全案通过（s①..s⑩ + m①..mb⑨ 四参化零漂移 + 双臂 raw 等值，
  p25-probe-final.log 210 PASS——白名单前置 s⑥ 直证、卫正交 s⑤
  八案、序号续接 s③、回滚弧 s⑧ 双臂同判）。
- **[x] T-02 front 三择 UI + 映射驱动重映射（AC-02/03）**：app.at——
  `.dirmerge_strategy` 字段 + ActMoveDir 复位三件套 + 弹层三钮 +
  MoveDirExec r→JSON 消费面切换（moves 循环替换 paths_under 派生
  ——F-R19-1 消除）。依赖：T-01。验证：矩阵扩组 + e2e 新弧。[✅
  已完成] vm `[13 dir5] PASS`（tab path = .trash 改道位 + 源档内容
  非靶档内容——F-R19-1 直证）+ e2e `[13 dir5] PASS`（vue 真 DOM
  同单 + .trash 位保存落回原位）+ gen 源检三钮发射；⚠ 适配：D-20⑤
  identifier 恒等实勘 → 手工解包双轨同构通道（§9 适配记录 1）。
- **[x] T-03 probe 扩案 + 基线 v20 重锁（AC-01）**：probe_dir_ops
  三择案组（m 案期望 JSON 形随校）+ probe_trash 回归面 + vm_matrix
  扩组（三择弧 + tab remap 弧）+ structure-v20 重锁。依赖：T-01/
  T-02。[✅ 已完成] CASES +14 案（s②..s⑦ 组）+ MOVES_EXACT/SET
  完整性形校 + s⑧ 回滚断言 + s⑨ 前态剔除归一 + diskAsserts
  PLAN-025 面；structure-v20.txt 入库（merged 臂采点）+ 比对跑
  B PASS。
- **[x] T-04 判绿矩阵（AC-04/05）**：merged/split 矩阵 + e2e 全量 +
  build + 负向证族 + regen-vue gen 源检（三钮发射形态）。依赖：
  T-03。[✅ 已完成] merged 16/16 ALL GREEN（v20 零漂移）+ e2e
  1 passed ×2 连跑 + build ✓built 22.34s + 负向证族五面全零
  （§9 evidence AC-04/05）；split = 家族窗第九例分段判绿路由
  （clean-HEAD src 无关定谳——§9 适配/ledger D-21 v29）。
- **[x] T-05 文档落位（AC-06）**：SD-2501..2504 四件 + 仪表盘④收窄 +
  留观面板续记（exe 时间戳/D-21 v29）+ §9 work 记录。依赖：全。
  [✅ 已完成] ARCH §5 第二十三切片段 + §6 heading/表格/probe 段 +
  README 是什么/Tests heading/仪表盘④/留观 + ledger H1 v29+
  D-36 处置更新+D-21 v29+D-20⑤ 扩记+D-35 第六证（exe 09-28
  载体未变 debug 15:02/release 15:17）。

执行期行号复核约定：§2/§4 符号行号 @99796ce 勘定——work 期随树
复核。

## 9. 复审记录

- **2026-09-29 draft handoff（auto-plan:new）**：
  - `stage: new`，PLAN-025，revision 1（drafting）。
  - 立项路由：候选池首位序实勘核验（§0 四项排除链 + 批内六件择件
    链）+ PLAN-024 先例（四选询问无答复 → 池序自主择定 → 用户执行
    交付追认）。r3 口门控注记（§4——池④顺延路由为授权面，需求
    信号 = 顺延非显式首现）如实记录。
  - 契约完备性：任务覆盖全部 AC 与 SD（T-01→AC-01/02 / T-02→
    AC-02/03 / T-03→AC-01 / T-04→AC-04/05 / T-05→AC-06）；路径
    与符号 grounded（§2 一手勘定）；未决假设有 owner/next（§10）。
  - `outcome: pass`（记录授权内——起草 + handoff；work 由用户
    auto-plan:work 入口启动）。
  - `next: work`（T-01 back 三择起）。

- **2026-09-29 work（auto-plan:work）**：
  - `stage: work`，PLAN-025，revision 1，`outcome: pass`。
  - `code_commit`：落位于执行末态工作树（直接 main 线性约定——
    019..024 先例，无 worktree/dev 分支；base = 99796ce）。
  - `task_ids`：T-01/T-02/T-03/T-04/T-05 全数 `[x]`（证据随各
    checkbox；current_step 5/5）。
  - `evidence`（AC 映射全绿实录）：
    - **AC-01**：probe_dir_ops 双臂全案通过（`RESULT: merged +
      split 全案通过…双臂一致=true`，210 PASS 行内嵌
      e2e/.runtime/p25-probe-final.log）——s①..s⑩ 三择案组全绿
      （s②③ skip 零数据丢失[靶 twin 逐字节不动 + .trash 改道 +
      序号续接 SkP--1]/s④ overwrite[靶旧改道+源落位+双映射对]/
      s⑤ 策略×卫正交八案/s⑥ fail-closed/s⑦ CJK skip/s⑧
      trash_restore 回滚弧[去后缀名回源位+exists 卫拒+两步可回]/
      s⑨ overwrite 径链接归一/s⑩ moves 完整性[精确形+集形+幂等
      空对]）+ 既有 m①..mb⑨ 全案四参化 both 零漂移 + 双臂 raw
      字节等值升级（HTTP 封套剥离 unwrapStr 归一）；probe_trash
      回归 18+15 案 fresh 全绿。
    - **AC-02**：moves 完整性不变式（s⑩ 七案形校）+ vm 矩阵
      `[13 dir5] PASS`（skip 弧 tab path = .trash/MgR/MgRPg.ad
      **非靶档 rel** + active_body = 源档内容非靶档内容 + recents
      置换——F-R19-1 直证）+ e2e `[13 dir5] PASS`（vue 轨真 DOM
      同单直证 + .trash 位保存落回原位）。基线 v20 PASS。
    - **AC-03**：vm `[13 dir4] PASS`（三择钮三显 + 保留双份钮 +
      拒径留置）+ e2e dir4 三钮三显同单 + gen 源检（App.vue 三钮
      发射 `<Button … @click="MoveDirGoMergeBoth/Skip/Over">` +
      dirmerge_strategy ref "both" + move_dir 四参调用 :752）。
    - **AC-04**：merged **16/16 checks passed ALL GREEN**（v20
      基线 B 零漂移，p25-merged-final.log）+ e2e **1 passed ×2
      连跑**（1.1m/1.2m）+ `pnpm build` ✓built 22.34s + **split
      臂 = 家族窗第九例分段判绿路由**（boot FAIL+wiki 树行不现
      v23..v27 逐字同形 ×4 连跑[执行窗 3+冷却后 1]——clean-HEAD
      复现 src 无关定谳[git checkout 三 src 干净树同 exe 同签名]；
      判别链 = probe_dir_ops/probe_trash split 臂（serve-back
      HTTP 真运输面）全绿 + e2e 全绿 + merged 全绿同窗——018..024
      先例 + AC-04 明文许可路由；F-R17-1 维持留观 unblock 同前）。
      exe 时间戳实录：debug 09-28 15:02 / release 09-28 15:17
      本批全程未变（024 载体跨批稳定第六证）。
    - **AC-05**：负向证族五面全零——api.at diff 恰 move_dir 契约
      面（单 hunk @@ -257,31）；`.console` 写面 grep 0（D-25①）；
      LinksRefreshOf 双取形零触碰（D-39 workaround 维持——app.at
      diff 零 link_index 行）；基线池 v1..v19 零触碰（唯一新增
      structure-v20.txt）；gen/dist tracked 零触碰；一次性件居
      ignored .runtime（probe 工程/A/B 备份）。
    - **AC-06**：SD-2501（ARCH §5 第二十三切片段）+ SD-2502（§6
      heading/表格 dir4-dir5/baseline v20 链/probe 段扩）+
      SD-2503（README 是什么第二十三切片条目 + Tests heading +
      仪表盘④收窄两件出池 + 留观面板续记第九例）+ SD-2504
      （ledger H1 v29 + changelog 段 + D-36 处置更新 r3 兑现
      F-R19-1 闭账 + D-21 v29 扩记 + D-20⑤ 处置扩记 + D-35
      exe 第六证）落位。
  - **执行期适配记录**（技能适配表——等价本地实现/测试面校正，
    授权范围内）：
    1. **§5.2 `json.to_value(r)` 形态勘误**：计划标注「call-arg 形
       健康」与 D-20⑤ 在册证据冲突——gen-only 直证 identifier 实参
       发射恒等 `let m = r`（App.vue emitted），vue 轨必坏；且
       move_dir 变更型调用双取不可行（二次调用源目录已消返 ""）。
       改纯 str 手工解包双轨同构通道（move_json_dir/move_json_moves
       + json_unesc——split/rejoin 镜像逆；split_once 无 ts_adapter
       映射故全程 split+starts_with/ends_with；结构引号随分隔模式
       消费）。ledger D-20⑤ 处置扩记承载。vm 轨 probe/矩阵全绿
       承载行为等价。
    2. **skip 改道位 trash_target 实参语义**：§5.1 记 `t =
       trash_target(new_rel)` 与 §1① 「源冲突档改道…可回滚」存在
       符号歧义——按可回滚语义裁定 `trash_target(rel)`（源 rel 保
       结构，restore 回源位；overwrite 对称取靶位 rel）；若取靶位
       则 skip 恢复恒受 exists 卫拒（不可回滚）与零数据丢失纪律
       冲突。s⑧ 回滚弧直证承载。
    3. **s⑨ overwrite 链接归一 2→1 塌缩**：m⑦ 归一 1:1 moved 集
       前提对 overwrite 不成立（被覆盖靶旧档退出索引面）——ljNorm
       增单侧 dropBefore 前态剔除承载（后态占位页保留）。
    4. **e2e 弧素材三校正**：①create_dir 清洗层 "/"→'-' 单层口径
       （嵌套 twin 改 move_dir+rename_dir 五连——probe mb 套路同
       款，在册纪律首例 e2e 面复证）；②CJK 路径开档 D-19 面（
       read_wiki GET query）——素材改 ASCII 路径（vm 弧 MgR 同款
       命名）；③树档行标签 = 纯档名非路径（aria 快照实勘——
       error-context 纪律）。
    5. **vm 矩阵基线采点跑计数**：--save-baseline 窗 B 不计入
       check 计数（15/15 采点跑 vs 16/16 比对跑——B 检查仅比对
       分支调用；非检查单缩减，final 比对跑 16/16 ALL GREEN 在册）。
  - `blockers`：无。
  - `next: review`（复审基线 = 本执行末态工作树；T-01..T-05 +
    AC-01..06 证据在册；§10 ①主题确认已由用户 work 入口追认，
    ②③④⑤ 维持 draft 推荐落地形——复审如裁改向按技能流程处理）。

- **2026-09-29 review（auto-plan:review）**：
  - `stage: review`，PLAN-025，revision 1，`outcome: pass`。
  - `reviewed_commit`：d7748b440e54000f808caf14305c8510948418c1
    （工作树 clean——受审树即提交树）；`base_commit`：99796ce；
    diff = 11 files +1633/−213。`dependency_revisions`：auto exe
    debug 09-28 15:02 / release 09-28 15:17（JADE_FIXTURE
    wiki-demo 未变）；`spec_inputs`：本仓无 docs/specs/（023/024
    同款声明）——canonical 三件（ARCHITECTURE/README/
    parity-ledger@v29）@d7748b4。
  - **独立性声明**：复审与执行同会话——按技能纪律不采信执行期
    摘要，全部 AC 在复审基线上独立重放（fresh 跑 + 提交树工件
    直证），非执行期日志转录。
  - `acceptance_results`（逐 AC 独立重放）：
    - **AC-01 pass**：probe_dir_ops fresh 重放 `RESULT: merged +
      split 全案通过…双臂一致=true` 零 FAIL（p25-review-probe.log）
      ——s①..s⑩ + m①..mb⑨ 四参化零漂移 + 双臂 raw 等值独立复现；
      probe_trash fresh 0 FAIL 全案通过（p25-review-trash.log）。
    - **AC-02 pass**：s⑩ moves 完整性七案形校重放绿 + merged
      `[13 dir5] PASS`（tab path=.trash/MgR/MgRPg.ad 非靶档 rel +
      active_body 源档内容——F-R19-1 直证）+ e2e `[13 dir5] PASS`
      （vue 真 DOM + .trash 位保存落回）+ `[B baseline] PASS`
      v20 零漂移。
    - **AC-03 pass**：merged `[13 dir4] PASS`（三择钮三显+保留
      双份钮+拒径留置）+ e2e dir4 三钮三显同单 + gen 发射面三钮
      `MoveDirGoMergeBoth/Skip/Over` + dirmerge_strategy ref
      （App.vue :2526-2527 执行期直证 + 复审 build regen 再生绿）。
    - **AC-04 pass**：merged **16/16 checks passed ALL GREEN**
      （p25-review-matrix.log）+ e2e **1 passed**（1.2m，
      p25-review-e2e.log）+ `pnpm build` **✓built 14.59s**（
      p25-review-build.log）+ split 臂家族窗第九例复审窗复测仍
      FAIL（第 5 连同形）——**分段判绿路由复审确认**：判别链
      重放 = probe_dir_ops/probe_trash split 臂（serve-back HTTP
      真运输面）fresh 全绿 + e2e 全绿 + merged 全绿同窗；
      clean-HEAD src 无关定谳（执行窗）维持有效。
    - **AC-05 pass**：五面在提交树重放全零——api.at diff 恰
      move_dir 契约面（单 hunk @@ -257,31，pub fn/±@api 恰 2 行）/
      `.console` 写面 0/app.at diff 零 link_index 行[双取形 D-39
      维持]/基线池唯一新增 structure-v20.txt（v1..v19 零触碰）/
      gen·dist tracked 零触碰。
    - **AC-06 pass**：四 delta 锚位 grep 全现恰一（ARCH §5
      第二十三切片段+SD-2501/§6 heading+SD-2502+v20 链+dir5 弧/
      README 是什么+Tests heading+仪表盘④已交付出池+留观第九例/
      ledger v29+D-36 处置更新+v29 扩记）+ **delta-after 与落地
      文本一致性抽核**（fail-closed 前置/零数据丢失三通道/完整性
      不变式/moves 查表/D-36 处置三通道列/仪表盘出池文案 1:1
      全等）。
  - **语义独立核对**（提交树源读回 vs §5.1）：白名单前置函数头
    直证；skip = trash_target(rel)+move_file(rel→t)+恰一对 ；
    overwrite = trash_target(to_rel)+先出后入+双对；both 分支与
    v1 逐行同形；卫语句族（merging 判定/循环卫/域卫/纯 .ad）全部
    先于迁移循环；同父幂等 JSON {dir:p,moves:[]}（m⑤ 精确形承载）。
    手工解包通道双轨行为等价独立复证（vm probe s 案 + vm 矩阵
    dir5 + e2e dir5 浏览器真 DOM 三面）。
  - `findings`（非阻断观察二件）：
    - **F-25-1**：计划 §5.2 解析形态措辞（json.to_value「call-arg
      形健康」）已被执行窗适配取代（§9 work 适配记录 1 + ledger
      D-20⑤ 处置扩记）——受审语义契约（JSON 返回形/三择语义/
      映射驱动重映射）零变化，落地 delta 文本（SD-2501）已按现势
      描述；024 F-24-1「delta 措辞演进如实记录」先例同判，无需
      revision 升版。
    - **F-25-2**：split 臂家族窗第九例延续入复审窗（024 复审窗
      曾开窗 boot PASS 本批未现）——分段判绿路由与 F-R17-1 留观
      unblock 维持（家族 exe 稳定后双臂复跑），非本批回归面
      （clean-HEAD 定谳）。
  - `evidence`：p25-review-probe.log / p25-review-trash.log /
    p25-review-matrix.log / p25-review-e2e.log / p25-review-build
    .log（e2e/.runtime 一次性窗——本记录内嵌结果摘录为持久凭据）；
    提交树工件 = d7748b4 本体（src/tests/docs/baseline 全部可
    checkout 重放）。
  - `next: merge`（全工作流已由用户授权——review 后接
    auto-plan:merge；merge 基线 = d7748b4）。

## 10. 待澄清事项

1. **主题确认（draft 阶段出口）**：本 draft 按池序④顺延路由择「合并
   三择 + F-R19-1」合批；用户如提供真实试用反馈（池定文首位）或改选
   他项（T-03 授权重推/上游回执窗口件），本 draft 转 revision 或废立
   ——不静默改向（024 §10.1 同款）。
2. **skip/overwrite 零数据丢失口径裁定**：本 draft 推荐 = 冲突档改道
   `.trash`（trash_restore 通道可回滚——与 v1「零数据丢失默认」纪律
   同构）；若用户裁「跳过 = 直接丢弃源冲突档」/「覆盖 = 不可回滚真
   覆盖」→ 数据丢失语义变更，须 r1 修订（compatibility promise 变更
   交用户裁定——技能纪律）。
3. **tab 落 .trash 位的 remap 口径**：draft 推荐 = tab 跟随文件
   （.trash 档可看可编辑——019 §10.4 在册语义）；备选 = 关闭该 tab
   （更保守）。随 T-02 落地前可改（视图面小改——r1 内修订不升版）。
4. **返回形 JSON 化 = 仓内破坏性契约变更**：move_dir 消费方 = app.at
   MoveDirExec + probe_dir_ops（双侧本批同步）——api.at 为唯一出口
   无外部消费方在册；probe m 案期望随校已入 T-03。如复审裁定需兼容
   形（双契约或版本参数），r1 修订。
5. **批量 restore back 契约维持量级门控留池**（>50 条首现——v0
   前端循环 app.at:3227 在册；本批不吞并）。
6. **家族窗留观面板续记**（F-R17-1/D-35②——条件未至实勘 09-29 连续
   第三批；本批执行窗 exe 时间戳随批实录惯例）+ e2e 新弧 D-31③/
   D-39 触发域锚纪律（§6 注记——既有 :821 trash 弧零触碰）。
