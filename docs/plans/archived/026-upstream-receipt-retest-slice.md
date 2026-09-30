---
plan_id: PLAN-026
status: archived
completion_kind: delivered
feature_name: 上游回执复测批——PLAN-705 载体重建与四回执（第二十四切片）
author: [agent]
created_at: 2026-09-29T00:00:00Z
updated_at: 2026-09-30T05:00:00Z
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/README.md 计划仪表盘候选③（上游回执件——D-21/D-39·F-R17-1/
    D-35②/D-19 四回执复测与处置更新）
  - docs/parity-ledger.md D-21/D-35/D-19/D-39 处置列 receipt 实录更新
    + H1 v29→v30
---

# PLAN-026：上游回执复测批——PLAN-705 载体重建与四回执（第二十四切片）

## 0. 变更摘要

PLAN-025 归档后的首个立项批。**立项路由依据**：README 仪表盘候选①试用
反馈件因用户反馈缺席按定文不立项（:766-767——规划会话无反馈内容）；
候选②残余面唯一件双取形消除（D-39）重推需用户明示授权（023 §10.6
三选——r2 已裁①挂账，②③未授权）；**候选③上游回执件（视家族窗）
——窗口首次开启**：本地双 exe（debug 09-28 15:02 / release 09-28
15:17——023..025 跨批稳定载体）之后，**auto-lang master 落 PLAN-705
交付簇（vm-http-handler-async-lifecycle：live-op 登记表单次终结
协议 + 非流式客户端迁固定 async reqwest executor + http_server 请求
状态机四阶段段驱动 owner dispatch + REQUEST_SCOPES 生命周期许可——
09-28 21:20 起草 → 09-29 12:29 复审 pass 合入，实现晚于双 exe 构建）**
——`vm/ffi/http_server.rs`（D-21 疑似根因域：请求体读取/参数装配/
响应生命周期）实质重做 + 706 合并携带 UI 层大宗变更（aura_view_
builder +971 / vm_bridge +616 / vue.rs + memo_deps——split 臂家族
窗签名的潜在解药面）。**源码面已动而本地 exe 未含 → 回执批载体 =
本地重建**（015 先例：release 旁路重建 + AUTO_EXE 显式指路）。候选
④微件池顺延路由让位（③先于④——三次规划核验窗口关闭后首开）。
**纯回执验证批（src 零 diff 预期——024 no-go 支路同形）**：四回执
复测（D-21 负载窗 / F-R17-1·D-39 split 双臂 / D-35② bulkalias /
D-19 url_decode）+ 两回执项源码盘点（checkbox v-model / menubar
memo / autoui_state——无变化面 grep 定谳维持候选）——**receipt 结果
双出口均交付**（正结果 → 处置升级/闭账注记；负结果 → 维持留观第 N
例实录——024 负结果在册先例同判）。

## 1. 目标

1. **① 回执载体重建与健康冒烟（T-01）**：本地 release exe 重建
  （auto-lang master 执行窗实勘 tip——规划窗 66c9cac19，家族在飞以
   执行窗为准；015 旁路先例 + AUTO_EXE 显式指路）；debug exe 无进程
   锁则同窗重建（双载体 receipt 更强——022/023 双 exe 惯例），有锁
   则 release 单载体注记。健康冒烟 = probe_sb 最小工程 + probe 全族
   15 件 fresh 双臂 + merged 矩阵 16/16（基线 v20——025 重锁后）+
   vue build（新 exe gen 面——SCHEMA_DRIFT_GENERATE_AT=1 随窗路由
   017 v20 先例）。
2. **② D-21 回执——负载窗复测（T-02）**：新 exe 下负载窗复测面 =
   e2e 全量 ≥3 轮 + 双臂矩阵 ≥2 轮/臂 + gate 单命令 ≥1 跑——
   **D-21 HTTP 面签名**（400 missing param api-err-body / ECONNRESET
   / ECONNREFUSED / 进程死亡）零复现 → D-21 处置升级「705 后零复现
   receipt 在册」（留观供料 → receipt 兑现注记）；任一复现 → 维持
   留观 + 第 N 例实录（两出口均批 pass）。UI 节拍族（popover 内容
   窗——v11③ 族）单列观察注记（v18 在册形态学分野：非 HTTP 面）。
3. **③ F-R17-1/D-39 回执——split 双臂复跑（T-03）**：新 exe split
   臂 vm_matrix fresh-green 判据（boot ready + wiki 树行现 + 全组
   绿）——**恢复 → F-R17-1 闭账**（unblock 条件「家族 exe 稳定后
   双臂复跑」经重建载体兑现 + gate 单命令复核收口）；**续现 → 第十
   例续记**（判别链强形：本批 src 零 diff@adb9d8d + merged 同窗绿 +
   probe split 臂同窗绿——分段判绿 018..025 先例）。D-39 上游面
   （dev-stack 响应滞留——browser/vite-proxy/backend 三层）同窗
   观察注记：backend 生命周期面已重做，竞态消除与否非本批断言面
   （**T-03 单取重推仍待用户三选裁处——不吞并**）。
4. **④ D-35②/D-19 回执（T-04）**：bulkalias N=500 合成语料
   link_index 复测（d35-retest 形——.runtime 一次性件惯例）——
   返回体值完整（44851 字符族首中尾锚——018 在册健康形态）→ P≤200
   稳定域口径精化/解除注记；损坏续现（空串/整数/碎片——值损坏族）
   → 口径维持 + 复测实录。D-19 = 源码 grep 定谳（url_decode 仍
   `byte as char`——规划期已勘 http_server.rs:520-533）+ probe_
   receipt_d19 复跑四案（g①/g② 负结果双确认维持——供料候选不变）。
5. **⑤ 回执项源码盘点 + 文档落位（T-05）**：checkbox v-model 互斥
   发射（D-36①a——vue.rs:13492 注释域 grep + gen 源检复核）/menubar
   memo 生成器化（8cb0a87 在册形态）/autoui_state 大态序列化
   （D-38②）——705/706 域不涉则维持候选注记（无变化面 receipt =
   定谳即可，probe 无新信息）；SD-2601..2604 落位 + 仪表盘③收窄
   与否随实测 + ledger v30。

**非目标**：

- **任何产品代码变更**：回执批 src 零 diff 预期（git diff adb9d8d
  -- src/ 0 行——AC-05 主断言）；回执裁出需产品侧适配面（无预期）
  → r1 修订交裁。
- **T-03 双取形重推（D-39②③）**：三选维持待用户裁处（023 §10.6
  ——本批仅 D-39 上游面观察注记，不触 app.at/e2e 基建）。
- **矩阵 CJK 导航双臂化**：D-19 源码未动（负结果维持预期）——解锁
  条件「翻 1」不至，双臂化维持现状（回执仅双确认记新）。
- **家族仓源码面介入**：重建仅 target/ 工件（cargo build——家族
  docs WIP 树面零触碰）；家族 PLAN-709 在飞观察不干预。
- **UI 节拍族（popover 内容窗）根修**：D-21 形态学分野在册（v18
  ——非 HTTP 面），receipt 主判据不含；观察注记如实记。

**成功样**：新载体健康冒烟全绿（probe 15 件 + merged 16/16 + build）；
四回执各有明确处置落点（升级/闭账/维持——双出口均交付形态）；src
零 diff + 基线 v20 零触碰；ledger v30 与仪表盘③/留观面板现势一致。

## 2. 架构方案

**现状证据链**（@adb9d8d main tip 一手勘定 2026-09-29 + auto-lang
master 实勘）：

- **上游交付簇**：PLAN-705（vm-http-handler-async-lifecycle）——
  T-01 决策冻结（d37019d60 09-28 22:15）→ T-02 live-op 登记表
  （3ddf07cb7 22:35——新 `vm/ffi/async_http.rs`）→ T-03 固定
  executor（3159a15c8 22:55——ClientExecutor AUTO_HTTP_ASYNC_
  WORKERS/MAX_ACTIVE）→ T-04 段驱动 owner dispatch（390e335a0
  23:51——http_server 请求状态机四阶段）→ T-05 REQUEST_SCOPES
  （bad060695 00:19）→ T-06 middleware 续链（c473b476c 00:22）→
  T-07 生命周期探针（71aa3d71d 02:51——http_server.rs 最后变更）→
  复审 pass（0c7588323 09-29 12:29）+ specs 沉淀（03a2172e5）+
  归档（5fe583cfa/e2deb4f87 12:34-12:35）。**全部晚于本地双 exe**
  （09-28 15:02/15:17）。
- **706 合并携带**（051b892ac 09-29 10:52 merge）：aura_view_
  builder.rs +971 / vm_bridge.rs +616 / memo_deps.rs +155 / vue.rs
  （gallery vue display fixes——lucide fallback ADR-25 + shadcn
  transitive materialize）+ lucide_generated——**split 臂家族窗 WIP
  签名（boot FAIL/树行不现——v22..v25 在册「快照/渲染 WIP 漂移」
  族）的候选解药面**（UI 渲染层大宗变更后重建验证 = F-R17-1 unblock
  动作本体）。
- **D-19 源码未动**：`url_decode`（http_server.rs:520-533）仍
  `result.push(byte as char)`（byte-as-char Latin-1 映射——015 回执
  在册形态原样）；checkbox v-model 面 vue.rs:13492 reka-ui
  CheckboxRoot modelValue 注释域在（D-36①a 疑未动——T-05 gen 源检
  复核）。
- **本地在册载体**：双 exe 09-28 15:02/15:17（023 执行/复审 + 024
  第五证 + 025 执行窗同载体——**三次规划核验未变**：09-29 三次
  stat 实勘同值）；split 臂第九例（025 执行窗 boot FAIL 逐字同形
  ×4 连跑 + clean-HEAD 复现 src 无关定谳）。
- **回执判据在册**：D-21（v18 新传输零复现口径 + v9-v25 负载窗形态
  学全录——HTTP 面签名 vs UI 节拍族分野）；F-R17-1（unblock = 家族
  exe 稳定后双臂复跑——v25 起 D-21 行合流载体）；D-35②（018 立案
  N=500 值损坏族 + 019/020 复测负结果 + 022/023/025 exe 时间戳实录
  惯例 + 024 p4 驻留压力补勘[P≤200 域内健康]）；D-19（015 回执四案
  g①..g④——probe_receipt_d19 入库可复跑）。
- **重建先例**：015（D-32⑤——本地 release exe 重建 02ae0ac1c →
  63e14b045 含 PLAN-699：debug 被家族进程锁[运行中映像锁写]则
  release 旁路 + AUTO_EXE 全窗显式指路）；022 执行窗 debug 重建
  （09-27 22:38）后新载体健康实证惯例。
- **基线/探针现势**：structure-v20（025 重锁第七例）；probe 族 15
  件（024 +probe_mtime）；merged 矩阵 16/16 + split 15/15 组面。

**改法**（纯验证面——零产品代码，载体更换 + 既有验证链复跑）：

1. **载体**：release exe 重建（执行窗 tip 实录 + 时间戳/stat 记档）
   ——全部验证经 AUTO_EXE 显式指路（serve-back/regen-vue env 通道
   在册）；debug exe 视进程锁同窗重建或注记单载体。
2. **回执面**：既有入库验证链原样复跑（e2e/vm_matrix/gate/probe
   族/build）+ .runtime 一次性复测件（d35-retest 形）——**零新入库
   件**（回执复测非契约面）。
3. **处置面**：ledger D-21/D-35/D-19/D-39 处置列 receipt 实录 +
   README 仪表盘③/留观面板随实测更新——docs 形交付。

## 3. 技术栈

- **载体**：auto-lang master 重建 release（cargo build——target/
  工件面；家族仓树零触碰）+ AUTO_EXE env 指路（scripts/serve-back.
  mjs:19 / regen-vue.mjs:47 env 通道在册）。
- **验证链**（全既有件复跑）：tests/probe_*.mjs 15 件（双臂 +
  pick_port）+ tests/vm_matrix.mjs（基线 v20）+ playwright e2e +
  scripts/gate.mjs（单命令——F-R17-1 复核载体）+ vue build
  （release 路由 + SCHEMA_DRIFT_GENERATE_AT=1 随窗）+ .runtime
  一次性件（d35-retest 形 + 负载窗多轮记录）。
- **src**：零 diff 预期（AC-05 主断言——回执批不触产品代码）。

## 4. 需求分析与背景调查

**授权记录**（技能纪律：不发明授权/预算）：

- 本次授权 = 用户 `/auto-plan:new` 调用（「计划025已经完成；请规划
  下一个计划」）——**起草权 only**，本技能不实施。
- **主题选择**：按仪表盘首位序 + 实勘核验自主择定（024/025 先例
  ——四选询问无答复 → 池序自主择定 → 用户以执行交付追认）。**③
  窗口开启判据 = 源码面实勘**（非 exe 时间戳——规划期三次核验 exe
  未变，但 PLAN-705 交付簇晚于 exe 构建落 master：本地 exe 不含
  其代码 → 回执批须重建载体——015 本地重建先例承载）；③先于④
  （池序）。④让位注记：剩件三件均弱（recents 全局化无需求信号/
  Time probe 独立价值低 020 §2.1 判/NFKC 未触发）——③首开即出。
  用户改向出口 §10.1。
- **家族仓动作面**：重建 release exe = target/ 工件写入（015 先例
  在册动作——非源码介入）；家族 PLAN-709 在飞（规划窗 18:09 起草
  + docs WIP）——执行窗观察互斥（§10.2 载体条件）。
- 无用户预算/自动续跑限制给到——不发明。
- **base**：main @adb9d8d（工作树 clean——025 归档 tip）；auto-lang
  master @66c9cac19（规划窗实勘——执行窗以当时 tip 为准并实录）。
- **Specs 状态**：本仓无 docs/specs/（023..025 同款声明）——
  canonical = ARCHITECTURE.md + README.md + parity-ledger.md@v29。

**背景引证**：

1. 回执项定义：README :779-783（③清单五件 + 留观面板 F-R17-1/D-35②
   ——025 第九例续记）；ledger v29 D-21（处置列负载窗形态学全录 +
   unlock = auto-lang HTTP 层修复留观供料）/D-35②（P≤200 稳定域 +
   复测条件[exe 变更窗]——**源码面变更即条件满足**）/D-19（url_
   decode byte-as-char + unlock 供料候选）/D-39（unlock 三选——
   ③上游修复后重推载体）。
2. 上游一手源：auto-lang master log（705 交付簇 + 706 merge——§2
   证据链全引）；http_server.rs:520-533（url_decode 现势勘定）；
   vue.rs:13492（checkbox 注释域）。
3. 先例：015 receipt 批（D-32⑤ release 旁路重建 + AUTO_EXE 指路 +
   probe_receipt_d19 四案负结果在册）；024 no-go 支路（负结果交付
   形态）；022/023 exe 时间戳实录惯例（D-35 处置列）。
4. scripts/serve-back.mjs:19 + regen-vue.mjs:47（AUTO_EXE env 通道
   在册）。

## 5. 详细设计

### 5.1 回执判据与出口（双出口均交付）

- **D-21（T-02）**：负载窗复测面 = e2e 全量 ≥3 轮 + 双臂矩阵 ≥2
  轮/臂 + gate 单命令 ≥1 跑（新载体独占窗为佳——家族并行窗如实
  记窗况）。**pass 出口**：HTTP 面签名（400 missing param[api-
  err-body 实锤形态]/ECONNRESET/ECONNREFUSED/进程死亡）全零 →
  处置升级「705 后零复现 receipt 在册」（单日单批样本统计效力
  限注记维持——v18 口径：结构性根修与否 = auto-lang 侧事，观测窗
  续记口径可收窄为「receipt 已取」）。**负出口**：任一复现 →
  维持留观 + 形态实录（v9..v25 族对表——705 后首例价值在案）。
  UI 节拍族（popover 内容窗 v11③）单列观察不计入 D-21 主判据。
- **F-R17-1/D-39（T-03）**：split 臂 vm_matrix 复跑（≥2 轮）——
  **恢复出口**：boot ready + wiki 树行现 + 全组绿 → F-R17-1 闭账
  （重建载体 = 「家族 exe 稳定后」条件的本地兑现形——706 UI 层
  变更后新 exe；gate 单命令复核 F-R17-1 定义动作本体收口）；
  **续现出口**：第十例续记（boot FAIL/树行不现签名对表 v23..v25
  逐字同形判 + 判别链强形：src 零 diff@adb9d8d + merged 同窗绿 +
  probe split 臂同窗绿——分段判绿维持）。D-39 注记面：backend
  生命周期已重做（705），dev-stack 三层竞态消除与否非本批断言
  （T-03 单取重推待用户三选——023 §5.3 设计文本留存载体不变）。
- **D-35②（T-04）**：d35-retest 形一次性件（N=500 合成语料
  link_index split 域）——**值完整出口**：返回体 44851 字符族 +
  首中尾锚逐字节 → P≤200 口径精化（「705 后池域改善」注记——
  单点复测样本限注记，防线[StatusBar 警示]维持不撤）；**续现出口**：
  空串/整数/碎片形 → 口径维持 + 实录（019「整数 500 形态变体」族
  对表）。
- **D-19（T-04）**：源码 grep 定谳（byte as char 在——规划期已勘）
  + probe_receipt_d19 复跑四案——g③/g④ 原绿维持 + g①/g② 负结果
  双确认（供料候选不变注记）。
- **盘点项（T-05）**：checkbox v-model（gen 源检——App.vue checkbox
  发射形对照 D-36①a 在册 App.vue:2232 形态）/menubar memo（8cb0a87
  形态 grep）/autoui_state 大态（D-38②——无源码变化信号则维持
  候选注记）。

### 5.2 载体与执行窗

- **重建序**：①实勘 auto-lang tip + 家族进程面（tasklist auto.exe
  清点——泄漏清杀 D-27④ 纪律前置）；②release 重建（cargo build
  --release——产物 stat/size 记档）；③debug exe 视锁（映像锁写
  015 在册——有锁则 release 单载体 + 注记）；④全部验证 AUTO_EXE
  指路（serve-back/regen-vue/gate env 通道）。
- **窗况记录**：家族会话并行况（进程清点 + 同机负载）随批实录
  （D-21 复现率与同机负载正相关在册——v9 口径）；执行窗 auto-lang
  tip 与规划窗差异如实记（家族在飞前移预期）。
- **冒烟门（T-01 内）**：probe_sb 最小工程绿 + probe 15 件双臂
  RESULT 绿（receipt_d19 负结果在册一致形）+ merged 16/16（基线
  v20 零漂移）+ build ✓built（SCHEMA_DRIFT_GENERATE_AT=1 随窗——
  706 lucide/memo_deps 变更或带 schema drift 面，017 v20 路由先例）。
  **冒烟败形处置**：新载体 UI/gen 面大宗变更致 jade 适配面断裂
  （非本批授权修——src 零 diff 约束）→ 本批 blocked 出口（§10.3
  载体条件——r1 交裁：适配批立项或待家族稳定窗）。

### 5.3 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2601 | modify | docs/ARCHITECTURE.md §5（后端） | before：§5 第二十三切片段（SD-2501——合并三择定文）+ D-21/D-35 处置面经 ledger 承载（无回执批专项段）。after：§5 第二十四切片段——上游回执复测定文：载体重建口径（015 旁路先例续——AUTO_EXE 指路 + target 工件面 + 家族窗互斥观察）+ 四回执判据与双出口（D-21 负载窗 HTTP 面签名[UI 节拍族分野注记]/F-R17-1 split fresh-green 判据[闭账 or 第十例]/D-35② 值完整锚判据/P≤200 口径精化或维持/D-19 负结果双确认）+ src 零 diff 回执批形态注记 | ③ 窗口首开（PLAN-705 源码面晚于本地 exe）；024 负结果交付先例续 | AC-01/02/03/04 |
| SD-2602 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests heading | before：§6 SD-2503 注记（第二十三切片——probe 扩案 + 基线 v20 重锁第七例）。after：第二十四切片注记——回执批零扩单零新件（既有验证链复跑 + .runtime 一次性件——024 no-go 支路同判）；载体健康冒烟门注记（probe 15 件 + merged 16/16 基线 v20 零漂移 + build 随窗路由） | §6 heading 惯例随批扩（SD-2202..2503 先例续） | AC-01/05 |
| SD-2603 | modify | docs/README.md（是什么 + 计划仪表盘 + 留观面板） | before：是什么第二十三切片条目 + 仪表盘③清单五件 + 留观面板（F-R17-1 第五批留观/D-35② 复测条件维持）。after：是什么第二十四切片条目（上游回执复测批——载体重建 + 四回执实录值[升级/闭账/维持分岔]）+ 仪表盘③收窄与否随实测（D-21 receipt 兑现注记或维持；D-39 观察注记）+ 留观面板更新（F-R17-1 闭账 or 第十例；D-35② 复测实录 + exe 时间戳新载体档） | 知识库三件形惯例（019..025 先例续） | AC-06 |
| SD-2604 | modify | docs/parity-ledger.md | before：v29——D-21 处置列（留观供料 unlock = auto-lang HTTP 层修复）/D-35②（复测条件 exe 变更窗）/D-19（byte-as-char 供料候选）/D-39（unlock 三选）。after：v29→v30——D-21 处置更新（**705 后负载窗复测 receipt 实录**——零复现升级注记 or 第 N 例维持）/D-35② 处置更新（新载体复测实录 + P≤200 口径复核/精化 + exe 时间戳档）/D-19 维持注记（源码未动 grep 定谳 + 双确认）/D-39 观察注记（backend 面已重做——三选维持待裁）+ D-21 v30 扩记（执行窗实录惯例） | 衍生账随批刷新惯例（SD-2104..2504 同款） | AC-06 |

## 6. 测试设计

- **载体健康冒烟（AC-01）**：probe_sb（最小工程 StringBuilder 全原语
  ——015/022 判别链件）+ probe 全族 15 件 fresh（双臂——RESULT 14
  绿 + receipt_d19 负结果在册一致）+ merged 矩阵 16/16（基线 v20 零
  漂移 PASS）+ vue build ✓built（release 路由 + SCHEMA_DRIFT_
  GENERATE_AT=1 随窗）。
- **D-21 负载窗（AC-02）**：e2e 全量 ≥3 轮（保存点簇签名面——400
  missing param/ECONNRESET 对表）+ 双臂矩阵 ≥2 轮/臂（含基线行）+
  gate 单命令 ≥1 跑——窗况（家族并行/独占）如实记；UI 节拍族
  （popover 内容窗）单列观察注记。
- **F-R17-1 split（AC-03）**：split 臂 vm_matrix ≥2 轮（boot/树形
  签名面）+ gate 单命令（F-R17-1 定义动作——split 段达与否实录）；
  判别链件（src 零 diff + merged 同窗 + probe split 臂）随出口装配。
- **D-35②/D-19（AC-04）**：.runtime 一次性件 d35-retest 形（N=500
  bulkalias link_index——返回体长度 + 首中尾锚 + 形态对表）+
  probe_receipt_d19 复跑（四案——入库件）。
- **盘点面（AC-04 附）**：checkbox gen 源检（regen 后 App.vue 发射
  形 grep——D-36①a 对照）+ menubar memo/autoui_state grep 定谳。
- **负向证（AC-05）**：`git diff adb9d8d -- src/` 0 行（回执批 src
  零 diff 主断言）+ 基线 v20/冻结池零触碰 + gen·dist ignored 零手改
  + 一次性件居 ignored .runtime + 家族仓树面零触碰（cargo target
  工件面——家族 docs WIP diff 前后对照）。

## 7. 验收标准

- **AC-01 载体重建与健康冒烟**：release exe 重建（源码 tip + 产物
  stat 记档）+ probe_sb 绿 + probe 15 件 fresh 双臂（receipt_d19
  负结果一致）+ merged 16/16（基线 v20 零漂移）+ build ✓built。
  验证：各件输出值内嵌 §8；AUTO_EXE 指路实录。**（冒烟败形 → 本批
  blocked 出口——§5.2 处置条款，非静默。）**
- **AC-02 D-21 回执**：负载窗复测面全跑（e2e ≥3 轮 + 双臂 ≥2 轮/
  臂 + gate ≥1）——HTTP 面签名零复现 → 处置升级注记落 SD-2604/
  ledger；复现 → 第 N 例实录维持（双出口均 pass 形）。验证：签名
  对表（v9..v25 族）+ 窗况记录内嵌 §8。
- **AC-03 F-R17-1/D-39 回执**：split 臂 ≥2 轮 + gate 单命令——
  恢复 → F-R17-1 闭账（仪表盘/ledger 落位）；续现 → 第十例续记 +
  判别链（双出口均 pass 形）；D-39 观察注记（三选维持待裁）。
  验证：矩阵/gate 日志 + 签名对表内嵌 §8。
- **AC-04 D-35②/D-19 回执 + 盘点**：bulkalias 复测实录（值完整锚
  or 损坏形态对表）+ P≤200 口径处置落位；probe_receipt_d19 四案
  复跑（g①/g② 负结果双确认）；checkbox/menubar memo/autoui_state
  盘点定谳注记。验证：一次性件值内嵌 §8 + probe RESULT。
- **AC-05 负向证全零**：src 零 diff（git diff adb9d8d -- src/ 0
  行）+ 基线 v20/冻结池零触碰 + gen·dist 零手改 + 一次性件 ignored
  + 家族仓树面零触碰。验证：各面命令输出内嵌 §8。
- **AC-06 文档锚位与一致性**：SD-2601..2604 落位（ARCH §5 第二十
  四切片段 + §6/README Tests heading + README 是什么/仪表盘③/留观
  面板 + ledger v29→v30 四行处置更新）+ 实测分岔与文档文本一致
  （升级/闭账/维持对应）。验证：锚位 grep 读回全现 + delta after
  与落地文本一致性核验。

## 8. 执行步骤

- **T-01 载体重建与健康冒烟（AC-01）**：家族进程清点 + release
  重建（tip/stat 记档）+ debug 视锁 + AUTO_EXE 指路 + 冒烟门四件
  （probe_sb/probe 15/merged/build）。依赖：无。**冒烟败形 →
  blocked 出口（§5.2）**。
  - **[x] 已完成（blocked 出口形）**：①执行窗实勘——家族 master
    tip=66c9cac19（与规划窗同值；src 零 WIP、仅 docs WIP[708/709
    设计件]）；进程清点=运行中 auto.exe 实例映像锁归
    `.wt/musk-093/auto-lang`（家族并行会话自携工作树）——**master
    双 exe 无映像锁**；双载体均重建（`cargo build --release -p
    auto` EXIT=0 → release 80,972,800B@09-29 21:19；`cargo build
    -p auto` → debug 128,110,080B@09-29 21:26；旧值 09-28
    15:02/15:17）。**执行窗适配一件**：全量 `cargo build
    --release` E0061 败于 `auto-cosmic-demo` 旁支 crate（`View::Text`
    缺 `selectable`——master 66c9cac19 预存编译断，09-23 PLAN-695
    引入字段、demo 未随改；家族源码面观察非本批修面）→ **`-p auto`
    载体包有界旁路**（015 旁路先例同族——产物 auto.exe 同一工件，
    零源码触碰）。②冒烟门四件实跑（AUTO_EXE 显式指路全程）：
    probe_sb **双载体绿**（debug/release 同形全原语+CJK+大装配
    15000:3——p26-probe-sb-*.log）；probe 全族 15 件 fresh 双臂
    **debug 14 绿 + receipt_d19 负结果在册一致**（p26-probe-all.log）
    / **release 13 绿 + receipt_d19 一致 + probe_mtime 挂起 ×2**
    （Init `probe_cases` 调用不返 done 恒 false——release 载体特异
    [debug 同分钟绿 r2 对照]，p26-probe-mtime-rel-r2.log）；merged
    矩阵 **双载体双形断裂**（下详）——16/16 不可达；build
    **✓built 20.23s**（release 路由 gen + SCHEMA_DRIFT_GENERATE_AT=1
    随窗——S001/R010 注记路由非阻断，标量契约断言过，vue-tsc 零错
    ——p26-build.log）。③**冒烟败形定谳（blocked 出口触发）**：
    新载体（705+706+plan047 在含）merged 臂确定性断裂 ×4 连跑——
    **debug exe：[7 tab] 脏标弧进程死亡 ×2 同点**（[B baseline] 7
    PASS 后 MCP 控制通道 SocketError other side closed =
    进程死亡伴生形，栈点 vm_matrix:673/674[标脏切回弧]，
    p26-matrix-r1/r2.log）；**release exe：[10b] 脏关弧弹层栈积
    ×2 同点**（[7 tab] PASS + [10 link] PASS 后 `button "Hello
    World" not found in region` @:774——fail-snap 实勘**双叠「有
    未保存的修改」确认弹层滞留**=脏态泄漏形，p26-matrix-rel-r1/r2
    .log）；**A/B 判别链强形**：同矩阵同 fixture 同机，旧 exe
    （09-28 15:02）09-29 19:42 merged 16/16 ALL GREEN 含 [7 tab]
    PASS（p25-merge-smoke.log 在库直证）——断裂面=载体 delta
    （c8f86ef92..66c9cac19：705 http 生命周期 + 706 aura_view_
    builder +971/vm_bridge +616/plan047 memo_deps）**标脏/确认弹
    层交互面**（debug=标脏弧崩/release=弹层滞留——706 UI 输入层
    最邻域；基线 v20 **双载体均 PASS**[采点在 [7 tab] 前——dump
    结构面完好]）。④**冒烟败形处置条款执行**：§5.2/§10.3 blocked
    出口（非静默）——src 零 diff 约束下不自修，r1 交裁。
  - **【重入 2026-09-30，家族 706 rev2 修复落 master 后】冒烟门全
    绿——blocked 解除**：①执行窗实勘——家族 master tip=**9fbf4ebd5**
    （706 rev2 修复 ed81a3295+3776035e3 + 706 归档 c1e7a3e34/
    9fbf4ebd5 + 708/709 多 T 落位；载体 delta 66c9cac19..9fbf4ebd5
    =84 文件 +16K/−8K）；**家族定谳一手在档**：bisect first-bad=
    **432068075（plan047 T-06 computed 信号网）**——裸 Value 无 RC
    堆身份入网，脏档 TabActivate 状态替换释放旧对象后信号伪命中，
    debug RC canary UAF panic / release id 复用错读 = 弹层滞留 +
    probe_mtime 挂起**三面同根因**；修复=双守卫
    [value_carries_heap_identity 准入拒收 + heap_dep_key_alive 死
    键 miss 重求值]（定谳报告 auto-lang docs/plans/reports/706-
    bisect-verdict.md——本批 §11.4 plan047 候选不预设的裁定被证实）。
    ②双载体重建（release 已被家族 cleanup 移除→全新构建；`-p auto`
    惯例续）：release 81,313,280B@09-30 12:41 / debug
    128,245,248B@12:47。③冒烟门四腿：probe_sb 双载体绿；probe 15
    双电池——debug 14 绿+receipt_d19 负一致 / release 13 绿+
    receipt_d19 负+**probe_mtime release 仍挂（独立缺陷定谳维持
    ——家族证 old-carrier release 同挂，非 706 域，另立 D-41）**；
    **merged 矩阵 16/16 ALL GREEN（[7 tab]/[10b] 全过——706 r2
    AC-10 消费者回执面兑现=修复验证直证；基线 v20 零漂移[新载体
    零重锁]）**；build ✓built 18.63s（release 路由+SCHEMA_DRIFT_
    GENERATE_AT=1 随窗）。→ **AC-01 复核 PASS**。
- **T-02 D-21 负载窗复测（AC-02）**：e2e ≥3 轮 + 双臂矩阵 ≥2 轮/
  臂 + gate ≥1 + 签名对表与窗况记录。依赖：T-01。
  - **◐ 部分（blocked 窗况下可交付面已跑）**：e2e ×3 =
    **2 绿（1.3m）+ 1 败**（r2：menubar 弹层内容窗——`快速打开`
    项不现 240s 超时，**v11③ UI 节拍族在册形[重跑即绿]——r3
    立即绿同判**；非 HTTP 面不计主判据）；**HTTP 面签名 e2e 窗
    零复现**（400 missing param/ECONNRESET/ECONNREFUSED/进程死亡
    三轮全零）；**进程死亡形态在矩阵面复现**（debug ×2——D-21
    负出口成立：留观维持 + 新载体形态实录）；**双臂矩阵 ≥2 轮/臂
    不可达**（merged 臂先断 ×4——split 段恒未触达）；gate 单命令
    同不可达（首段即矩阵败）。窗况：家族 cargo 双例在飞
    （musk-093 侧）——并行窗如实记；断裂为确定性同点非负载散布形
    （旧 exe 同机全绿 A/B 锚在库）。判定：**负出口**（任一签名复
    现=进程死亡 ×2）——留观维持，不升级。
  - **【重入 2026-09-30】全判据面补齐——正出口兑现**：①e2e
    **×3 = 3/3 绿**（1.5m/1.6m/1.6m——p26r2-e2e.log；popover 内容
    窗零现）；②双臂矩阵 ≥2 轮/臂 = **merged r1+r2 双 16/16 ALL
    GREEN**（基线 v20 零漂移 ×2）+ split ×2 [1 boot] FAIL（F-R17-1
    面——T-03 判据）；③gate ×1：merged 段过（22 PASS 含基线）→
    split 段 boot FAIL 短路[build/e2e 段未达——019/020 既定形]
    （p26r2-gate.log）。**HTTP 面签名全窗零复现**（400 missing
    param/ECONNRESET/ECONNREFUSED/进程死亡——e2e 3 轮+merged 2 轮
    +probe 双电池 30 件臂全零；blocked 窗进程死亡 ×2 归因闭账=706
    r2 修复兑现）。窗况=家族并行窗（musk-093+lang-710 auto 实例在
    飞）如实记。判定：**正出口——处置升级「705+706r2 后零复现
    receipt 在册」**（单日单批样本限注记维持；结构性根修已由家族
    706 r2 兑现——观测窗口径可收窄）。
- **T-03 F-R17-1/D-39 split 双臂（AC-03）**：split ≥2 轮 + gate
  单命令 + 判别链装配（出口分岔）+ D-39 注记。依赖：T-01（与
  T-02 可并行——窗况一致性注记）。
  - **⛔ blocked（结构不可达）**：vm_matrix 单跑先 merged 后
    split、merged 臂双载体确定性断裂 ×4 → **split 臂零触达**（恢
    复/续现双出口均无法取数——F-R17-1 复核轮次 0/2）；gate 单命
    令同不可达。F-R17-1 维持留观（unblock 前置叠加：新载体 merged
    臂断裂修复后双臂复跑方有意义）；D-39 上游面观察注记照付
    （backend 生命周期已重做[705]——三选维持待裁不吞并）。
  - **【重入 2026-09-30】续现出口定谳——第十例续记**：split 臂
    ×2 轮 + gate ×1 = 三观测**同签名续现**（[1 boot] FAIL + `button
    "wiki" not found`——v23..v27 逐字同形；p26r2-matrix-r1/r2.log
    + p26r2-gate.log）。**判别链强形装配**：本批 src 零 diff@ee9e34c
    + merged 同窗 16/16 ×2 直证 + probe 族 split 臂 serve-back HTTP
    真运输面同窗全绿（双电池）——**分段判绿维持（018..025 先例
    续）**。定性更新：706 r2 UAF 修复（交互语义面）**未触及 split
    boot 面**——家族窗第十例在新载体（706r2+708+709）延续，证实
   其为独立于交互回归的另一缺陷域（boot ready/UI chrome 弧）；F-
    R17-1 维持留观，unblock 更新=家族 split 臂专项修复（T-03/D-39
    重推载体条件继续等待）。D-39 三选维持待裁不变。
- **T-04 D-35②/D-19 回执（AC-04）**：d35-retest 一次性件 +
  probe_receipt_d19 复跑 + 盘点 grep/gen 源检。依赖：T-01。
  - **[x] 已完成（双负出口 + 盘点定谳）**：①d35-retest（debug
    载体 split N=500 合成语料 link_index）：HTTP 200 + **body=
    整数 322（len=3）——CORRUPT**（019「整数 500」同族形态变体续
    现——值损坏族在 705 后新载体原样）→ **P≤200 稳定域口径维持**
    + 复测实录（p26-d35-retest.log）。②D-19 双确认：源码 grep
    定谳 `url_decode` byte-as-char 原样（auto-lang
    crates/auto-lang/src/vm/ffi/http_server.rs:527——执行窗实勘）
    + probe_receipt_d19 四案复跑（debug 载体：g③ body=1/g④ body=0
    原绿 + **g① body=0/g② len=0 负结果双确认**——供料候选不变，
    p26-probe-all.log）。③盘点三件 grep/diff 定谳：checkbox
    （上游注释域在 vue.rs:13491 + **705/706 delta 零触** + regen
    后 App.vue **零 checkbox 实例**[jade 应用不消费]——D-36①a 候
    选维持）/menubar memo（生成器无 memo 发射 + 705/706 delta 零
    触——8cb0a87 在册形态不变，候选维持）/autoui_state（705/706
    delta 零触序列化面——D-38② 候选维持）。
  - **【重入 2026-09-30】新载体复验——全负结果稳定**：①d35-retest
    （新 debug 载体）：HTTP 200 + **body=整数 322（len=3）CORRUPT
    ——双窗同形**（blocked 窗/重入窗两载体一致；p26r2-d35-retest
    .log）→ P≤200 稳定域口径维持加强（UI 层修复与值损坏域无涉的
    独立性旁证）。②receipt_d19 **三确认**（新载体 debug 臂：g③/g④
    原绿+g① body=0/g② len=0——三载体三窗负结果一致）。③盘点三
    件新 delta（66c9cac19..9fbf4ebd5）复核：checkbox/menubar/
    autoui_state **仍零触**（708 parser/aura 面与 709 wins/
    projection 面均不涉三候选域）——候选维持定谳加固；byte-as-
    char 原样（http_server.rs:527）。④probe_mtime release=**D-41
    新行登记**（独立缺陷——家族证 old-carrier release 同挂，非 706
    回归域；AC-11 第二分支兑现）。
- **T-05 文档落位（AC-05/06）**：负向证族 + SD-2601..2604 + 仪表盘
  ③/留观面板 + ledger v30 + §9 work 记录。依赖：T-02..T-04。
  - **[x] 已完成（blocked 形态落位）**：AC-05 负向证五面全零
    （`git diff adb9d8d -- src/` 0 行；tracked 工作树仅本计划文件
    untracked；基线池 v1..v20 零触碰；gen·dist 零手改[gen 面由
    build 再生——ignored]；一次性件居 ignored e2e/.runtime；家族
    仓树面零触碰[cargo 仅 target/ 工件——status 非 docs 面]）。
    SD-2601..2604 落位文本随实测分岔（blocked 形态）；ledger
    v29→v30（D-21 负出口形态实录/D-35② 复测负结果/D-19 双确认/
    D-39 不可达注记）；README 是什么第二十四切片条目 + Tests
    heading + 仪表盘③收窄冻结注记 + 留观面板（新留观件：新载体
    merged 臂脏标/弹层断裂）；ARCH §5 第二十四切片段 + §6 heading。
  - **【重入 2026-09-30】收口落位**：AC-05 负向证族复核全零（src
    零 diff/tracked 零改/基线池零触碰/一次性件居 ignored/家族树面
    零触碰——cargo 仅 target/）；ledger v30→v31（D-21 **处置升级
    正出口**/D-35② 双窗确认/D-19 三确认/D-39 第十例/D-41 新行
    [probe_mtime release 独立缺陷]）；README 是什么第二十四切片
    条目重入收口 + Tests heading + 仪表盘③注记 + 留观面板更新
    （merged 断裂留观件**闭账**[706 r2 修复兑现]；F-R17-1 第十例
    续记）；ARCH §5/§6 重入增记。§9 交接 outcome=pass →
    **execution_done**，next=review。

## 9. 复审记录

- **2026-09-29 draft handoff（auto-plan:new）**：
  - `stage: new`，PLAN-026，revision 1（drafting）。
  - 立项路由：③ 窗口首开（源码面实勘——PLAN-705 交付簇 09-28
    21:20→09-29 12:29 晚于本地双 exe 09-28 15:02/15:17；http_
    server.rs 请求生命周期实质重做 + 706 UI 层大宗——split 家族窗
    候选解药）+ ③先于④ 池序 + ④剩件均弱注记。024/025 先例（池序
    自主择定 → 用户执行追认）。用户改向出口 §10.1。
  - 契约完备性：任务覆盖全部 AC 与 SD（T-01→AC-01 / T-02→AC-02 /
    T-03→AC-03 / T-04→AC-04 / T-05→AC-05/06）；判据与先例 grounded
    （§2/§4 一手勘定）；双出口均交付形态（负结果先例 024）；未决
    假设有 owner/next（§10）。
  - `outcome: pass`（记录授权内——起草 + handoff；work 由用户
    auto-plan:work 入口启动）。
  - `next: work`（T-01 载体重建起——冒烟门内置 blocked 出口）。

- **2026-09-29 work handoff（auto-plan:work，执行窗 21:0x-22:3x）**：
  - `stage: work`，PLAN-026，revision 1（executing）。
  - `outcome: blocked`（§5.2/§10.3 冒烟败形条款触发——非静默）。
  - `code_commit`：无实现提交（src 零 diff@adb9d8d 直证——回执批
    零代码路径；本提交为计划/文档簿记面）。
  - `task_ids`：T-01 ✓（blocked 出口形）/T-02 ◐（e2e 面交付、矩阵
    面不可达）/T-03 ⛔（split 臂结构不可达）/T-04 ✓（双负出口+盘
    点）/T-05 ✓（blocked 形态落位）——current_step=3/5。
  - `evidence`（全部 .runtime/p26-* 在档 + §8 任务注内嵌）：
    - **载体重建**：家族 master 66c9cac19 src 洁净；`-p auto` 双
      载体（release 80,972,800B@09-29 21:19 / debug 128,110,080B
      @21:26；全量构建败于 auto-cosmic-demo 预存编译断 E0061——
      有界旁路适配在录）。
    - **冒烟败形（blocked 主因）**：merged 臂双载体确定性断裂 ×4
      ——debug [7 tab] 脏标弧进程死亡 ×2 同点（MCP SocketError
      other side closed@vm_matrix:673/674）/release [10b] 脏关弹层
      栈积 ×2 同点（fail-snap 双叠「有未保存的修改」确认弹层@
      :774）；A/B 锚=旧 exe 同矩阵 09-29 19:42 merged 16/16 ALL
      GREEN（p25-merge-smoke.log）；基线 v20 双载体 PASS（采点先于
      断裂弧——dump 结构面完好）；断裂域=标脏/确认弹层交互面（706
      aura_view_builder +971/vm_bridge +616 输入层最邻域候选）。
    - **回执交付面**：D-21 负出口（进程死亡 ×2 矩阵面 + e2e 窗
      HTTP 签名零复现 + popover 内容窗 v11③ 族 1 例重跑即绿）；四
      回执中 D-35②（N=500 整数 322 形态变体——P≤200 维持）与
      D-19（byte-as-char 源码定谳 + 四案负结果双确认）双负出口交
      付；盘点三件维持候选；F-R17-1/D-39 split 面不可达（merged
      先断 ×4——split 零触达）；probe_mtime release 挂起 ×2（第三
      断裂面——debug 交错绿）。
    - **build 面**：✓built 20.23s（新 gen 面全链绿——SCHEMA_
      DRIFT_GENERATE_AT=1 路由 S001/R010 注记非阻断；706 生成器
      变更对 jade 语料面零破坏直证）。
  - `blockers`：**新载体（66c9cac19：705+706+plan047 在含）merged
    臂脏标/确认弹层交互面断裂**——双载体双形确定性（非负载散布、
    非瞬态），家族源码面问题非本批授权修域（src 零 diff + 家族仓
    介入非目标）。T-03 split 回执轮与 T-02 矩阵轮结构性不可达。
  - `next`：**用户 r1 交裁**（§10.3/§10.7）——(a) 待家族修复窗：
    家族 706 域回归修复落 master 后重建 exe 重入本批（计划文本即
    复测手册，T-02 矩阵面/T-03 split 面待补）；(b) 适配批另立：新
    立项以断裂面定谳为供料（家族侧修复请求件——10c 弧/弹层生命周期
    一手实录在档）。已交付回执面（D-35②/D-19/盘点/D-21 负出口形
    态实录）不受 blocker 影响，随本提交入册。
  - **r1 裁定回执（2026-09-29，用户「r1选A」）**：选项 (a) 兑现
    ——blocked-waiting 态维持 `executing`；重入触发=家族 master
    落 706 UI 域修复类 src 提交（裁定窗实勘 tip=66c9cac19 未动，
    修复未落）；重入序+补齐面全文见 §10.7 裁定注。下次
    `auto-plan:work` 调用驱动重入，等待期零动作。

- **2026-09-30 work 收口（重入执行完成）**：
  - `stage: work`，PLAN-026，revision 1，**outcome: pass →
    execution_done**。
  - `code_commit`：无实现提交（src 零 diff——回执批零代码路径；
    本提交为收口簿记面）。
  - `task_ids`：T-01 ✓（重入冒烟门四腿全绿——merged 16/16 修复
    验证直证）/T-02 ✓（D-21 正出口：全判据面补齐+HTTP 面签名零
    复现——处置升级）/T-03 ✓（F-R17-1 续现第十例——判别链强形+
    D-39 三选维持）/T-04 ✓（双负结果新载体加固+盘点复核+D-41 登
    记）/T-05 ✓（收口落位）——current_step=5/5。
  - `evidence`（p26r2-* 全族在档）：双载体 @9fbf4ebd5（release
    81,313,280B@09-30 12:41 / debug 128,245,248B@12:47）；merged
    r1+r2 双 16/16 ALL GREEN（[7 tab]/[10b] 修复直证+基线 v20 零
    漂移 ×2）；e2e ×3 全绿；gate merged 段过→split 短路（既定
    形）；split [1 boot] FAIL ×2+gate=第十例 v23..v27 逐字同形；
    probe 双电池 14+13 绿+receipt_d19 三确认+d35 双窗 CORRUPT 同
    形（整数 322）；盘点三面新 delta 零触；家族定谳=plan047 T-06
    computed 信号网 UAF（706 r2 bisect 报告在档）。
  - `blockers`：无（blocked 已解除；F-R17-1/D-39/D-41 均为留观/
    候选记账面，非本批 blocker）。
  - `next`：**review**（auto-plan:review——本提交为复审基线；r1
    裁定 (a) 闭环：706 r2 AC-10 兑现→重入→冒烟门全绿→全判据面
    补齐→四回执处置落定）。

- **2026-09-30 复审（auto-plan:review）**：
  - `stage: review` | `plan_id: PLAN-026` | `plan_revision: 1` |
    `outcome: pass`。
  - `reviewed_commit: 0204c8c5d6ad28350d27025befc02c98359a8a7f`；
    `base_commit: adb9d8d`（批起点）；工作树 clean、单一主检出
    （直接 main 线性惯例 001..025 在档先例续——无 worktree 面）。
  - `dependency_revisions`：auto-lang **9fbf4ebd5**（载体构建基
    ——release 81,313,280B@09-30 12:41/debug 128,245,248B@12:47
    磁盘现势核验一致）；注记：master 复审窗已前移 8d917c46（执行
    窗后家族活动——回执绑定载体工件非 live master，不失效）。
  - **独立声明**：实现会话内复审——全部判定由工件独立重放（p26rev-
    * 重放族），非执行期摘要采信。
  - `acceptance_results`（全 AC 独立重放）：
    - **AC-01 pass**：exe 档磁盘核验一致；probe_sb 双载体重放绿
      （SBD=0/SBR=0）；merged 矩阵重放 **22 PASS 全组绿**（[7
      tab]/[10b]/[B baseline v20 零漂移] 在录）+ split [1 boot]
      FAIL 同形续现；build 重放 ✓built 17.78s。
    - **AC-02 pass**：e2e 重放 1 passed（1.3m）；签名零复现 grep
      直证（execution 窗 matrix r1/r2+e2e ×3 全零 ECONNRESET/
      ECONNREFUSED/400 missing param/SocketError）；执行窗全判据
      面在档（e2e ×3+双臂 ×2/臂+gate ×1）。
    - **AC-03 pass**：split 败形重放与第九例在库件逐字对表
      （[1 boot] FAIL+`button "wiki" not found`——p25-review-split
      .log vs p26rev-matrix.log 同形）；判别链三件齐（src 零 diff
      +merged 同窗重放直证+probe split 臂 HTTP 电池在档）。
    - **AC-04 pass**：d35 重放 CORRUPT 同形（HTTP 200 len=3 整数
      322）；receipt_d19 重放四案在册形（g③=1/g④=0 原绿+g①=0/
      g② len=0 负结果）；盘点三面 grep 重放零触+byte-as-char 在
      位（http_server.rs:527）。
    - **AC-05 pass**：src 零 diff（vs adb9d8d 与 ee9e34c 双基 0
      行）+tracked 恰四文档+基线池零触碰+一次性件居 ignored
      e2e/.runtime+家族树面零触碰。
    - **AC-06 pass**：锚位 grep 全现（第二十四切片/SD-2602/v31/
      D-41/第十例/execution_done）；落地面与 delta after 文本一
      致性抽核 1:1（D-21 升级语/③收窄解除/留观闭账/ARCH 重入段
      逐字对应）。
  - `spec_inputs`：本仓无 docs/specs/（023..025 同款声明在册）——
    canonical=ARCHITECTURE.md+README.md+parity-ledger.md@v31@0204c8c；
    supersedes/new_spec_components 空有写明解释（§4）。
  - `findings`：
    - **F-26-R1（观察，非阻断）**：依赖 master 复审窗前移
      （9fbf4ebd5→8d917c46）——回执绑定载体工件（exe 时间戳在
      档）非 live master，零失效；无动作。
    - **F-26-R2（观察，非阻断）**：probe_mtime release 挂起=D-41
      在册独立缺陷（家族证 old-carrier 同挂）——供料候选记账完
      整，无未verified 必需判据被记债（AC-11 第二分支兑现）。
  - `evidence`：p26rev-{matrix,build,e2e,d35,d19,sb-dbg,sb-rel}
    .log（重放族）+p26r2-{matrix-r1/r2,gate,e2e,d35-retest,probe-
    all-dbg/rel,build}（执行族）+p26-*（blocked 窗族）——均居
    ignored e2e/.runtime 可追溯；durable 面=计划 §8/§9+ledger
    v31+四文档锚位。
  - `next`：**merge**（用户已授权全工作流——review→merge 连跑；
    merge 基线=0204c8c）。

- **2026-09-30 merge 收据（PLAN-026:r1）**：
  - `prepared`：复审基线 r1@**0204c8c**（reviewed——b66f879 复审
    记录 docs-only 后代，全 AC 独立重放 pass）——canonical delta
    已随实现落 main（仓库惯例 019..025 先例续：SD-2601@ARCH §5
    第二十四切片段+重入收口段[6243eb2+0204c8c]/SD-2602@§6
    heading+README Tests heading/SD-2603@README 是什么第二十四切
    片条目+重入收口+仪表盘③+留观面板/SD-2604@ledger v31 四行处
    置+D-41 新行）。
  - `landed`：main tip==**b66f879** 含 0204c8c（merge-base
    --is-ancestor ancestor-OK——直接 main 线性约定 001..025 在档
    惯例，无 worktree/dev 分支无 ff 动作无 merge commit）；
    **known-good smoke=合并窗 fresh vm merged 22 PASS 16/16 ALL
    GREEN**（基线 v20 零漂移在录——p26-merge-smoke.log 当前 tip
    实跑；split [1 boot] FAIL=F-R17-1 第十例窗内同形，分段判绿
    在档）。
  - `ledger_refreshed`：v31@0204c8c tracked 读回核验（H1 v31 恰
    一+D-41 新行恰一+D-21 处置升级语二处[changelog+行内]——无
    live ledger 服务，tracked 文件面 024/025 同判）。
  - `archived`：git mv→docs/plans/archived/026-upstream-receipt-
    retest-slice.md+status: archived+completion_kind: delivered
    （YAML 块内——675320f 遗漏教训随锁落位）。
  - `cleaned`：无 worktree/dev 分支（git worktree list 单一主检出
    核验）+代码工作树零 WIP+本批判别链物料复核（src 零 diff 强形
    无 archive 树；一次性件居 ignored e2e/.runtime——bench150 先
    例同判保留，值内嵌本计划 §8/§9 可追溯）。
  - `deployment 观察`：gen/front/vue/dist 复审窗 ✓built@17.78s
    （0204c8c src 内容现势——b66f879 docs-only 零变化）+家族双
    exe=本批重建即部署面（release 81,313,280B@09-30 12:41/debug
    128,245,248B@12:47@9fbf4ebd5）。
  - `留观交接`：F-R17-1 第十例（unblock 更新=家族 split 臂专项
    修复——706r2 已证独立缺陷域）/D-35② 双窗 CORRUPT 维持（P≤200
    口径）/D-41 供料候选（probe_mtime release 独立缺陷）/T-03+
    D-39 三选维持待裁/试用反馈件维持候选池首位。
  - `outcome: pass`——PLAN-026 delivered 收口。

## 10. 待澄清事项

1. **主题确认（draft 阶段出口）**：本 draft 按池序③首开路由择「上
   游回执复测批」；用户如提供真实试用反馈（池定义首位）或改选他项
   （④微件/②T-03 授权重推），本 draft 转 revision 或废立——不静默
   改向（024/025 §10.1 同款）。
2. **载体条件（执行窗）**：release/debug 双 exe 均被家族进程锁 →
   重建不可行 = 本批 blocked（015 旁路先例失效形——等待家族窗或
   r1 交裁）；家族 PLAN-709 在飞——执行窗 tip 前移预期内（实录即
   可，不追锁 tip）。
3. **冒烟败形出口**：新载体 UI/gen 面大宗变更致 jade 适配面断裂
   （基线漂移/build schema drift 不可路由等）→ 本批 blocked——
   适配批另立 r1 交裁（src 零 diff 约束下不自修）。
4. **T-03/D-39 三选维持待裁**（023 §10.6——本批仅观察注记，不触
   app.at/e2e 基建；后批重推载体 = 023 §5.3 设计文本 + 本批 backend
   面重做的回执证据）。
5. **D-35② 单点复测样本限**：N=500 单形复测——正结果仅「口径精化
   注记 + 防线维持」（不撤 StatusBar 警示——021 防线定文不因单点
   样本解除）；P≤200 稳定域正式解除需上游池域收口回执（D-35②
   unlock 原文维持）。
6. **家族窗观察惯例续**：exe 时间戳随批实录（D-35 处置列）+ D-21
   v30 扩记（执行窗实录）+ 窗况（家族并行况）随批记录。
7. **【执行窗新增】冒烟败形 blocked 出口（§5.2 条款触发，r1 已
   裁）**：新载体（master 66c9cac19——705+706+plan047 在含）merged
   臂**脏标/确认弹层交互面**双载体确定性断裂（debug=标脏弧进程死
   亡 ×2 同点/release=脏关弹层栈积 ×2 同点；A/B 锚=旧 exe 同矩阵
   09-29 19:42 全绿在库；基线 v20 双载体 PASS——断裂居交互语义面
   非 dump 结构面）。家族源码面问题——本批 src 零 diff 约束下不
   自修（家族仓介入非目标）。**精确 unblock**：家族侧修复落
   master → 重建 exe → 重入本批 T-02 矩阵面 + T-03 split 面（本
   计划文本即复测手册）；交裁选项：(a) 待家族稳定窗重入 (b) 以断
   裂面一手实录为供料另立家族修复请求/适配批。已交付回执面
   （D-35②/D-19/盘点/D-21 形态实录）不受阻。
   **【r1 裁定 2026-09-29，用户】选项 (a) 待家族修复窗**：裁定窗
   实勘家族 master tip=66c9cac19 未动（blocked 窗后零 src 提交——
   修复未落）。PLAN-026 维持 `executing`（blocked-waiting）——**重
   入触发条件 = 家族 master 落 706 UI 域（脏标/确认弹层面）修复类
   src 提交**；届时：重建双 exe（`-p auto` 惯例续）→ 冒烟门四件
   复跑（§8 T-01 判据原样）→ merged 恢复则 T-02 矩阵面（双臂
   ≥2 轮/臂 + gate ≥1）+ T-03 split 面（≥2 轮 + gate + 判别链装
   配）按 §8 判据补齐 → 四回执处置按 §5.1 双出口定谳 → T-05 增
   量落位后经 review 收口。等待期本批零动作（无轮询义务——重入由
   用户下次 `auto-plan:work` 调用驱动）。
   **【r1 refinement 2026-09-29，用户】修复路由落定 = 家族 PLAN-706
   rev2 重开追加 phase**：用户裁定「既然是 706 引发的回归问题，那
   么应当在计划 706 添加一个新的 phase 去解决」——本会话代执行家
   族仓簿记（auto-lang commit **5b9650e87**）：706 自 archived 重开
   （status drafting、plan_revision 2、归档件 git mv 回活跃目录，
   rev1 交付记录原样保留）；追加 §11 修复 phase（T-09 bisect 定谳
   → T-10 修复实现 → T-11 收口验证——**AC-10 = 消费者回执面定义
   性验收：jade-edit merged 16/16 ALL GREEN**；11.1 内嵌本批四跑
   实证表 + A/B 锚；11.4 域协调注记[PLAN-709 在飞/plan047 候选不
   预设/零特性扩张]）。**重入触发条件随之精化** = 家族 PLAN-706
   rev2 T-09..T-11 修复落 master（AC-10 兑现即重入信号）；届时重
   入序同上段（重建 → 冒烟门 → T-02/T-03 补齐 → 收口）。
   **【已闭环 2026-09-30】**：家族 706 rev2 修复落 master（tip
   9fbf4ebd5，AC-10 消费者面家族自验+本批重入独立复验双绿）——
   本项关闭，重入序已走完（见 §9 收口记录），outcome=pass →
   execution_done。
