---
plan_id: PLAN-029
status: archived
completion_kind: delivered
feature_name: v0.1.0 release 就绪批（第二十七切片——判据文档化+全量回归+tag 预案）
author: [agent]
created_at: 2026-09-30T00:00:00Z
updated_at: 2026-09-30T18:00:00Z
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/RELEASE.md（新增——v0.1.0 判据/交付形态/试用指南/已知限制/
    切片摘要）
  - docs/README.md 计划仪表盘（新增 milestone 状态行——首个 tag 轨道）
  - docs/parity-ledger.md H1 v33→v34（release 批处置随行）
---

# PLAN-029：v0.1.0 release 就绪批（第二十七切片——判据文档化 + 全量回归 + tag 预案）

## 0. 变更摘要

PLAN-028 归档后的首个立项批，**里程碑轨道正式入池**。立项路由：候选①
试用反馈件缺位（维持首位——本批产物恰为其供料：试用指南）；②D-39
维持挂账（027 第十一例——②基建授权待裁无新信号）；③回执已收维持；
④剩件弱。**v0.1.0 提案三收口件进度**（PLAN-028 §4.3 提案——用户以
执行追认路线）：①CJK 开档（028 已收口）✅ → ②真实试用 ≥1 轮（用户
侧——本批交付试用指南供料）→ ③**release 批（本批）**。**纯 docs +
验证批（src 零 diff 预期——026/027 同形）**：RELEASE.md 新增（v0.1.0
判据清单 + 交付形态双形说明 + **试用指南**[JADE_WORKSPACE 指向真实
wiki + 双形态启动命令——指南命令实走验证] + 已知限制注记面五件 +
25+2 切片摘要）+ **全量回归门**（merged 全组 + e2e 全量 + build +
probe 15 件 + bench150 现势记录——fresh 全绿 receipt 落档，红 →
triage 挂账不本批修）+ dist 现势核验与双形态冒烟 + **tag 打法预案**
（annotated tag 命令 + message 草案 + 前置条件清单——**tag 本身不
打**，前置 = 用户试用 ≥1 轮确认 + 回归 receipt 在档）+ 仪表盘首个
milestone 状态行 + ledger v34。版本字面注记：package.json
`"version": "0.1.0"` 已在位零变化。

## 1. 目标

1. **① RELEASE.md 落位（T-01——canonical 新件）**：`docs/RELEASE.md`
   五节——**判据**（v0.1.0「试用就绪」三收口件 + 已达面清单——
   028 §4.3 提案定文化）；**交付形态**（v0.1.0 = **源码里程碑**：
   双形启动[merged `auto run` 进程内 / vue dist + serve-back]——
   依赖 auto 工具链 ≥ v0.4.2-2125 + pnpm；**无独立安装包**[打包批
   = 后续 milestone 候选注记]）；**试用指南**（JADE_WORKSPACE 环境变量
   指向真实 wiki 目录[wsys.at:15-22 三级回退机制在册] + 双形态启动
   命令 + 核心弧 walkthrough[开档/编辑保存/建页/链接/标签/检索/回收
   站]）；**已知限制**（五件注记面：split 臂 boot 域[dev/测试模式
   ——交付形态不涉]/P≤200 上限[知情警示内建]/D-39 双取形[纯性能
   ~0.3s/触点]/大纲·行:列·图谱[上游门控]/D-41 probe_mtime release
   挂起[仪器面]）；**切片摘要**（001..028 二十六切片一行一览）。
2. **② 全量回归门（T-02——tag 前收口 receipt）**：merged 全组
  （22 PASS 线——基线 v20）+ split 臂（独立缺陷域分段判绿惯例——
   第十二窗注记续）+ e2e 全量（十五段 + CJK 开档弧——028 扩面现役）
   + vue build ✓built（release 路由）+ probe 全族 15 件 fresh
   （probe_mtime debug 载体路由——D-41）+ bench150 四点现势记录
   （记录面——022/023 在册带对照）。**全绿 receipt 落档 §8**；红 →
   triage 归因挂账（regress 技能纪律——不本批修，§10.4 出口）。
3. **③ dist 现势 + 双形态冒烟（T-03）**：dist ✓built@tip（src 零
   后续变更核验——assert-dist-fresh 通道在册）+ **试用指南命令实走**
   （vue 形态：serve-back + dist 启动 + JADE_WORKSPACE 指向临时真实
   语料开档冒烟；merged 形态：`auto run` 启动冒烟——**指南即验证**
   ：RELEASE.md 每条命令可复制执行直证）。
4. **④ tag 打法预案（T-04——不打，交用户）**：annotated tag 命令
   草案（`git tag -a v0.1.0 -m <message>`——message 草案：二十六
   切片 + CJK 双臂 + 回归 receipt 锚 + 已知限制指针）+ **前置条件
   清单**（用户试用 ≥1 轮确认 + 全量回归 receipt 在档 + dist 现势
   核验通过——三件齐备后 tag 一命令即达）落 RELEASE.md 判据节。
5. **⑤ 文档落位（T-05）**：SD-2901..2904 + **仪表盘首个 milestone
   状态行**（v0.1.0 轨道：收口件 ①✅/②待用户试用/③本批——状态
   可视化）+ ledger v34（release 批处置随行 + D-21 v34 扩记 + exe
   时间戳实录惯例）。

**非目标**：

- **tag 本身不打**：前置 = 用户真实试用 ≥1 轮确认（批交付 tag-ready
  态；tag 命令随预案交用户执行或用户明示后代打——§10.3）。
- **安装包/发行物打包**（独立 exe/installer/zip 产物）：v0.1.0 =
  源码里程碑（RELEASE.md 交付形态节注记；打包批 = v0.2.0 候选）。
- **回归红的修复**：红 → triage 挂账归因（regress 技能纪律）——
  修复批另立，不阻断 release 就绪判定（除阻断级红——§10.4 出口）。
- **产品代码任何变更**：src 零 diff 预期（AC-05 主断言）。
- **家族仓介入**：双 exe 载体现势复用（09-30 12:41/12:47——变更
  则随批实录换档）。

**成功样**：RELEASE.md 五节落位且指南命令逐条实走可复制；全量回归
门 fresh 全绿 receipt 在档（六面：矩阵/e2e/build/probe/bench/分段
注记）；dist 现势核验过；tag 预案齐备（一命令即达态）；仪表盘
milestone 行首现；src 零 diff。

## 2. 架构方案

**现状证据链**（@618edc4 main tip 一手勘定 2026-09-30）：

- **tag/版本面**：git tag = **0**（实勘）；package.json `"version":
  "0.1.0"`（:3——版本字面已在位，零变化注记）；docs 无 release 判据
  /里程碑文档（028 规划窗实勘）——本批 RELEASE.md = canonical 首件。
- **工作区根机制**（试用指南事实底座）：wsys.at:15-22 `root_dir()`
  = `JADE_WORKSPACE` env → `AUTO_PROJECT_DIR` env → `"."`（cwd
  三级回退——fixture 隔离通道 automan 无条件覆盖注记在册）；vue 形态
  serve-back belt = JADE_WORKSPACE 未生效 fail-fast（serve-back.
  mjs:8 在册）。
- **启动命令面**（README :321-348 现役——开发向清单）：`pnpm
  install` / `pnpm build`（= regen-vue）/ `AUTO_HTTP_PORT=8211
  AUTO_FRONT_PORT=4181 pnpm --dir gen/front/vue dev` / `pnpm
  test:e2e`——RELEASE.md 试用指南节转用户向（JADE_WORKSPACE 前缀 +
  真实 wiki 指向 + 双形态）。
- **判据提案在册**：PLAN-028 §4.3（三收口件 + 可带病注记面五件
  ——用户以 028 执行追认路线；本批定文化交裁）。
- **回归链现役**：vm_matrix（merged 全组 22 PASS——028 复审窗线；
  split 第十二窗分段惯例）+ e2e（十五段 + 028 CJK 开档弧）+ build
  （release 路由 + SCHEMA_DRIFT_GENERATE_AT=1 随窗）+ probe 15 件
  （probe_mtime debug 路由 D-41）+ bench150（022/023 在册带）+
  gate.mjs 单命令（F-R17-1 载体——split 短路预期注记）。
- **dist 现势**：gen/front/vue/dist（assets + index.html——028 复审
  窗 ✓built 线；本批 assert-dist-fresh 复核 + 冒烟）。
- **auto-plan-regress 技能在册**：批量回归门入口（due-check receipt
  + triage 纪律——T-02 承载形态）。
- **载体现势**：双 exe 09-30 12:41/12:47（026 重建——027/028 复用）。

**做法**（docs + 验证——零产品代码）：

1. **RELEASE.md 五节**（§1 目标① 全文——判据/形态/指南/限制/摘要；
   指南命令 = T-03 实走验证闭环：「指南即验证」纪律——不可复制
   执行的命令不落稿）。
2. **回归门六面**（T-02——regress 技能入口或等效链直接跑：矩阵双
   臂[分段注记]/e2e/build/probe/bench 记录面/gate 单命令注记）——
   receipt 值内嵌 §8（RELG 形）。
3. **dist 冒烟双形**（T-03——vue 形 serve-back+dist 真实语料开档；
   merged 形 `auto run` 冒烟；JADE_WORKSPACE 指向 .runtime 临时
   wiki 语料副本）。
4. **tag 预案**（T-04——命令+message 草案+前置清单三件；**tag 状态
   = ready-not-tagged** 落仪表盘）。

## 3. 技术栈

- **docs**：docs/RELEASE.md 新增（本批主交付）+ README 仪表盘行 +
  ledger v34——纯 docs 面。
- **验证链**（全既有件复跑）：tests/vm_matrix.mjs + playwright
  e2e + vue build + probe 15 件 + bench150 + assert-dist-fresh
  （scripts/regen-vue.mjs:49-50 通道在册）+ serve-back/`auto run`
  双形冒烟。
- **regress 入口**：auto-plan-regress 技能（due-check receipt 形
  ——T-02 承载；本计划不预设其输出形态，receipt 落 §8）。
- **src**：零 diff 预期（AC-05 主断言）。

## 4. 需求分析与背景调查

**授权记录**（技能纪律：不发明授权/预算）：

- 本次授权 = 用户 `/auto-plan:new` 调用（「计划 028已经完成；下一步
  应该做什么？」）——起草权；**里程碑轨道授权链** = 028 §4.3 提案
  （用户测距问询 → 提案 → 028 执行追认）→ 本批 = 提案③「release
  批」的立项兑现。
- **不打 tag 的边界**：tag = 对外承诺动作（硬不可逆面）——前置条件
  （用户试用确认）未满足，本批止于 tag-ready 态（§10.3 出口——
  用户明示后代打或自打）。
- **判据定文交裁面**：RELEASE.md 判据节 r1 草案落稿后经 work/review
  流交用户复审（加減项——尤其「试用 ≥1 轮」确认口径与安装包缺席
  是否接受为 v0.1.0 语义）。
- 无用户预算/自动续跑限制给到——不发明。
- **base**：main @618edc4（工作树 clean——028 归档 tip）；载体 =
  双 exe 09-30 12:41/12:47。
- **Specs 状态**：本仓无 docs/specs/（023..028 同款声明）——
  canonical = ARCHITECTURE.md + README.md + parity-ledger.md@v33
  + **RELEASE.md（本批新增）**。

**背景引证**：

1. 判据提案：archived/028 §4.3（三收口件 + 注记面五件——本批定文
   化源本）；028 归档回执（CJK 双臂化达成——收口件①✅）。
2. 启动/工作区事实：README :321-348（命令清单）+ wsys.at:15-22
  （root_dir 三级回退）+ serve-back.mjs:8（JADE_WORKSPACE belt）+
  scripts/regen-vue.mjs:49-50（assert-dist-fresh 通道）。
3. 回归链在册：028 复审窗全绿线（merged 22 PASS + e2e 含 CJK 弧 +
  build 16.88s + probe 族）——本批 fresh 复跑对照面。
4. 版本/tag 面：package.json:3（0.1.0 在位）+ git tag 0（实勘）。
5. regress 技能契约：due-check receipt + triage 纪律（T-02 承载
   形态）。

## 5. 详细设计

### 5.1 RELEASE.md 五节（T-01）

- **判据节**：三收口件（①CJK 开档双臂——028 ✅ 落档；②真实试用
  ≥1 轮——用户确认口径[占位：用户回执注记位]；③release 批全绿
  receipt——本批落档）+ 已达面清单（功能 25 切片/性能三批/回执批/
  判绿链六面）+ **tag 前置条件清单**（三件齐备 → `git tag -a
  v0.1.0` 一命令即达——T-04 预案锚）。
- **交付形态节**：双形启动（vue：serve-back + dist；merged：
  `auto run`）+ 依赖（auto ≥ v0.4.2-2125 + pnpm）+ **无安装包
  注记**（v0.2.0 候选——打包批另立）。
- **试用指南节**：`JADE_WORKSPACE=<你的 wiki 目录>` 前缀 + 双形
  启动命令 + 核心弧 walkthrough（开档/编辑保存/建页/双链反链/标签/
  检索/目录操作/回收站/每日笔记/快开——各一行操作指引）。
- **已知限制节**：五件注记面（§1 目标① 全文）+ 上游挂账指针
  （ledger D-19 纵深/D-21/D-35②/族）。
- **切片摘要节**：001..028 二十六切片一行一览（README 是什么节
  浓缩形）。

### 5.2 回归门与双形冒烟（T-02/T-03）

- **六面清单**：①vm_matrix merged 全组（22 PASS——基线 v20）②
  split 臂（第十二窗分段判绿注记——boot 域独立缺陷留观面）③e2e
  全量（十五段 + CJK 弧）④build ✓built ⑤probe 15 件 fresh
  （debug 路由注记）⑥bench150 四点（记录面——在册带对照 + 现势
  值入 RELEASE.md 或 §8）。
- **receipt 形**：六面值内嵌 §8（RELG 锚——regress 技能 due-check
  形或等效直接清单）；**红处置**：非阻断红 → triage 行（归因挂账
  计划指针）+ release 就绪判定注记；阻断级红（merged/e2e/build
  主面败）→ 本批 blocked 出口（§10.4）。
- **双形冒烟**：.runtime 临时 wiki 语料副本（标准 wiki-demo 复制
  ——JADE_WORKSPACE 指向）→ vue 形 serve-back+dist 启动开档直证
  → merged 形 `auto run` 启动直证——**指南命令逐条实走**（指南即
  验证纪律）。

### 5.3 tag 预案（T-04）

- 命令草案：`git tag -a v0.1.0 -m "jade-edit v0.1.0 试用就绪——
  二十六切片/双臂判绿/CJK 全弧/回归 receipt <锚>"`（message 全文
  草案落 RELEASE.md 判据节）。
- 前置三件清单（①②③——判据节互锚）；**状态落仪表盘**：
  `milestone v0.1.0：tag-ready（待用户试用确认）`。

### 5.4 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2901 | add | docs/RELEASE.md（新件） | before：无 release 判据/指南文档（028 规划窗实勘——tag 0/无版本判据）。after：v0.1.0 release 文档五节——判据（三收口件 + 前置清单 + 一命令即达锚）/交付形态（双形 + 无安装包注记）/试用指南（JADE_WORKSPACE + 双形启动 + 核心弧 walkthrough——命令实走验证）/已知限制（五件注记面 + 上游挂账指针）/切片摘要（001..028 一览） | 里程碑轨道 canonical 首件（028 §4.3 提案定文化） | AC-01/03/04 |
| SD-2902 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests heading | before：§6 SD-2802 注记（第二十六切片——CJK 扩单）。after：第二十七切片注记——release 批零扩单零新件（回归门六面复跑 receipt + 双形冒烟——026/027 docs+验证形同判）；regress due-check receipt 落位注记 | §6 heading 惯例随批扩 | AC-02 |
| SD-2903 | modify | docs/README.md（是什么 + 计划仪表盘 + 文档节指针） | before：是什么第二十六切片条目 + 仪表盘无 milestone 行 + 文档节无 RELEASE 指针。after：是什么第二十七切片条目（release 就绪批——RELEASE.md 落位/回归 receipt/双形冒烟/tag-ready 态）+ **仪表盘新增 milestone 状态行**（v0.1.0：①✅②待试用③本批——tag-ready 可视化，首个 tag 轨道行）+ 文档节 RELEASE.md 指针 | 知识库三件形惯例 + milestone 轨道可视化首件 | AC-04/06 |
| SD-2904 | modify | docs/parity-ledger.md | before：v33——D-19 repo 侧收口 + D-21 v33 + split 第十二窗。after：v33→v34——release 批处置随行（D-21 v34 扩记[执行窗实录] + exe 时间戳实录 + milestone tag-ready 注记——非差异面新行不立） | 衍生账随批刷新惯例（SD-2104..2804 同款） | AC-06 |

## 6. 测试设计

- **回归门六面（AC-02 主证）**：§5.2 清单全跑——receipt 值内嵌 §8
  （六面各自日志/输出摘要 + 窗况记录[家族并行况惯例]）。
- **双形冒烟（AC-03）**：.runtime 临时语料（wiki-demo 副本）+
  JADE_WORKSPACE 指向 → vue 形（serve-back + dist）开档直证 +
  merged 形（`auto run`）启动直证——**指南命令逐条实走**（差分
  记录：RELEASE.md 稿面命令 vs 实走命令逐字一致断言）。
- **dist 现势（AC-03 附）**：assert-dist-fresh 通道复核（✓built@
  tip——src 零后续变更）。
- **RELEASE.md 锚位（AC-01）**：五节标题 grep 读回 + 指南命令块
  提取可执行性（T-03 实走即证）+ 已知限制五件逐一对照 ledger/README
  在册（一致性核验——不发明新限制不漏记在册件）。
- **负向证（AC-05）**：`git diff 618edc4 -- src/` 0 行 + 基线
  v20/冻结池零触碰 + gen·dist ignored 零手改（build 再生面例外注记
  ——dist 由 build 通道再生合规）+ 一次性件居 ignored .runtime +
  package.json 零 diff（版本字面在位注记）。

## 7. 验收标准

- **AC-01 RELEASE.md 落位**：五节齐全（判据/形态/指南/限制/摘要
  ——锚位 grep 读回）+ 判据与 028 §4.3 提案一致 + 已知限制五件
  与在册逐一对表。验证：锚位 grep + 对照清单内嵌 §8。
- **AC-02 全量回归门 receipt**：六面 fresh 全绿（merged 22 PASS/
  split 分段注记/e2e 全量/build ✓built/probe 15 件/bench 记录面
  ——receipt 值内嵌 §8）。**红出口**：非阻断红 → triage 行注记
  （release 就绪判定注记）；阻断级红 → 本批 blocked（§10.4——
  非静默）。
- **AC-03 双形冒烟 + dist 现势**：vue 形 + merged 形启动开档直证
  （JADE_WORKSPACE 真实指向）+ 指南命令逐条实走一致 + dist
  ✓built@tip。验证：冒烟输出内嵌 §8。
- **AC-04 tag 预案与 milestone 可视化**：命令+message 草案+前置
  三件清单落 RELEASE.md + 仪表盘 milestone 状态行首现（tag-ready
  态）+ **tag 未打注记**（git tag 仍 0——AC 断言面）。验证：RELEASE
  锚位 + 仪表盘行 grep + `git tag -l | wc -l` == 0。
- **AC-05 负向证全零**：src 零 diff + 基线冻结零触碰 + 一次性件
  ignored + package.json 零 diff。验证：各面命令输出内嵌 §8。
- **AC-06 文档锚位与一致性**：SD-2901..2904 落位（RELEASE.md 新件
  + §6/README Tests heading + README 是什么/仪表盘 milestone 行/
  文档节指针 + ledger v33→v34）。验证：锚位 grep 读回全现 + delta
  after 与落地文本一致性核验。

## 8. 执行步骤

- **T-01 RELEASE.md 起草（AC-01）**：[x] 五节全文（判据草案交裁注记
  §10.2）+ README 文档节指针。依赖：无。**[✅ 已完成]**——docs/
  RELEASE.md 落位（判据/形态/指南/限制/摘要五节锚位 grep 读回全现，
  见 §8.1 RELG-2901 AC-01 面）。
- **T-02 全量回归门（AC-02）**：[x] 六面复跑 + receipt 落 §8 + 红处置
  分岔。依赖：无（与 T-01 可并行）。**[✅ 已完成]**——六面 receipt
  =§8.1（merged 22 PASS 零漂移/split 主导形分段/e2e 1.2m/build
  15.81s/probe 14 绿+dir_ops triage/bench150 带内）。
- **T-03 双形冒烟 + dist 现势（AC-03）**：[x] .runtime 临时语料 +
  JADE_WORKSPACE 双形实走 + assert-dist-fresh。依赖：T-01（指南
  稿面命令对齐）。**[✅ 已完成]**——merged 形 r4 ALL GREEN + vue 形
  （等效调整=集成单命令形）r2 ALL GREEN + 指南命令逐条实走对账 +
  dist ✓built@tip（等效调整注记 §8.1）。
- **T-04 tag 预案 + milestone 行（AC-04）**：[x] 命令/message/前置清单
  + 仪表盘行落位。依赖：T-02/T-03（receipt 与冒烟齐备）。**[✅ 已完成
  ]**——RELEASE.md §1 判据节（命令+message 草案+前置三件清单）+
  README 仪表盘 milestone 行首现；git tag 保持 0（AC-04 断言——
  §8.1 负向证）。
- **T-05 文档落位（AC-05/06）**：[x] 负向证族 + SD-2901..2904 + ledger
  v34 + §9 work 记录。依赖：T-04。**[✅ 已完成]**——负向证全零
  （§8.1）+ 四 delta 落位锚位读回全现。

### 8.1 全量回归门 receipt（RELG-2901——2026-09-30 执行窗 fresh）

**窗况**：debug exe **09-30 16:01**（v0.4.2-2311-g7fcf913eb——12:47
在册档后家族重建，本批全程新载体实跑；≥ v0.4.2-2125 门槛满足）/
release 09-30 12:41 未变；ProxyBridge.exe 常驻本地代理连接在窗
（9362 碰撞来源）；三枚非本会话 auto.exe 进程在窗（家族会话——
未触碰）。

| 面 | 命令 | 结果 | 证据（e2e/.runtime/） |
| --- | --- | --- | --- |
| ① 矩阵 merged | `node tests/vm_matrix.mjs` | **22 PASS 全组绿**（r2——含 [B baseline] v20 零漂移；r1 merged 臂 10m「切换反链」popover 内容窗瞬态 ×1 无 RESULT 行——D-21 v11③ 族重跑即绿在册惯例） | p29-matrix-r1.log / p29-matrix-r2.log |
| ② 矩阵 split | 同上双臂连跑 | **boot FAIL 主导形 ×1**（[1 boot] FAIL+wiki 树行不现——F-24-2 在册独立缺陷域**第十三窗观察**；分段判绿——判别链=src 零 diff+merged 同窗 22 PASS+probe split 臂 HTTP 全绿 14 件+e2e 同一 serve 面 1.2m） | p29-matrix-r2.log |
| ③ e2e 全量 | `pnpm test:e2e` | **1 passed (1.2m)** 首跑即绿（十五段+15 cjk 弧；D-21 HTTP 签名零复现） | p29-e2e-r1.log |
| ④ vue build | `SCHEMA_DRIFT_GENERATE_AT=1 pnpm build` | **✓ built in 15.81s** exit 0（engine assert-dist-fresh 卫兵过=**dist ✓built@tip**；regen 链全绿——src 零 diff 下再生=零漂移合规面） | p29-build.log |
| ⑤ probe 15 件 | `node tests/probe_*.mjs` ×15 | **14 件 fresh ALL GREEN**（receipt_d19 守望形 g① CJK exists POST→1/g② read_wiki CJK len=513 语料锚/g③ g④ ASCII 回归/g⑤ GET 下线 404——028 收口续证；probe_mtime debug 载体路由绿——D-41 纪律）+ **probe_dir_ops 非阻断红 triage**（下行） | p29-probe-*.log |
| ⑥ bench150 | `node e2e/.runtime/p21-bench150.mjs` | **四点带内**：link_index 冷 279/热 264-267ms（在册 282-304）·search 48-55ms（48-72 带）·**tags_index 233ms ≤1.5s 门续**（在册 233-246）·boot-ready 2677ms 记录面（在册 2455-2640 带缘）+ 孤页入口 3435ms（022 口径 3.4s 带）+ **findings 零新增** | p29-bench150.log |

**gate 单命令注记**：F-R17-1 载体留观维持（split 短路预期——第十
三窗同判；六面分段承载不单跑，018..028 同判惯例）。

**triage 行（非阻断红——§10.4 出口）**：probe_dir_ops——merged 臂
MCP not reachable（0 案起跑，boot 前置失败非案败）。归因=固定 MCP
口 **9362** 被 ProxyBridge.exe→10808 本地代理 ESTABLISHED 长连接的
**临时源端口**占用（netstat 直证 PID 22380）+ **系统动态端口范围
下调 1024-15000**（netsh 直证——覆盖固定探针口域；D-31④ 8228
CLOSE_WAIT 同族环境项新形）。r1/r2/门控重试 ×5/批末终试同形 ×8
观测（p29-probe-dir_ops*.log）。**release 就绪判定注记**：非阻断
（主面 merged/e2e/build 全绿+probe 族 14/15 fresh 绿+同树 028 复审
窗 probe_dir_ops fresh 全绿先例在档）；unlock=probe 族 MCP 口
pick_port 化（tests 面变更——非本批授权，供下批）。

**双形冒烟 receipt（AC-03）**：

- **merged 形**（RELEASE.md §3 形态 A 命令实走）：`JADE_WORKSPACE=<
  ws> auto run -r vm` → boot-ready 1256ms + 树行 ASCII（Hello World）
  +CJK（CAP 定理/首页）+状态面——**ALL GREEN**（p29-smoke-merged-
  r4.log；r1-r3=冒烟脚本判定口径迭代三件[快照节拍/树根折叠态/树行
  钮紧凑形态——vm_matrix check 2 press('wiki') 口径对齐]——测试面
  非产品败形）。
- **vue 形**（RELEASE.md §3 形态 B 命令实走）：`JADE_WORKSPACE=<ws>
  auto run -r vue --server vm -B 8211 -F 4443` → front serve 200 +
  /api 代理链 + CJK exists POST→1 + read_wiki CJK len=547 语料锚 +
  工具链窗 Init 链（tree/tags_index 200@冒烟语料——自有 webview 窗
  已载入）——**ALL GREEN**（p29-smoke-vue-r2.log）。
- **指南命令实走对账**：`pnpm install` ✓（Done in 218ms——
  p29-install.log）/`pnpm build` ✓（面④同命令）/merged 命令 ✓/vue
  命令 ✓——RELEASE.md §3 每条命令可复制执行直证（**指南即验证**）。
- **等效调整注记**（adapt 表——equivalent local implementation）：
  计划稿「vue dist + serve-back」→ dist 独立静态 serve **实测不可用**
  （vite preview 不代理 /api——vite 5.4.21 实录：静态 index 200 但
  `/api/*` 404，p29-smoke-vue.log r1+diag 复测；vite.config server.proxy
  为 dev 通道）→ vue 形以**工具链集成单命令形**承载（ledger 在册
  `run -r vue --server vm` 形——单命令/后端自动接线/JADE_WORKSPACE
  生效直证）；dist = ✓built@tip 构建物现势（面④）；RELEASE.md §2
  交付形态节随批注记（dist 独立 serve=打包批 v0.2.0 候选收口）。
  开档弧直证承载=e2e 1.2m 全绿（同一 vite serve-back 面 15 cjk
  开档全弧）+ 集成形窗 Init 链。

**负向证 receipt（AC-05）**：

- `git diff 618edc4 -- src/` = **0 行**；`git diff 618edc4 --
  package.json` = **0 行**（版本字面在位零变化）；`git diff 618edc4
  -- tests/baseline/` = **0 行**（基线冻结零触碰）。
- `git tag -l | wc -l` = **0**（**tag 未打**——AC-04 断言面）。
- tracked 变更面 = docs/README.md + docs/ARCHITECTURE.md + docs/
  RELEASE.md（新）+ docs/plans/029 + docs/parity-ledger.md——**本批
  授权面恰五件（全 docs）**；gen/dist
  check-ignore 直证 ignored（build 再生面合规例外注记）；一次性件
  （p29-* 日志/冒烟脚本/p29-manual-ws 语料）居 ignored e2e/.runtime；
  .auto/ 工具链缓存（auto run 窗产物）已清场。

**AC-01 对表**：RELEASE.md 五节锚位 grep 读回全现（§9 work 记录）；
已知限制五件逐一对照在册：split 臂=F-R17-1 第十三窗/P≤200=D-35②
知情警示/D-39 双取形~0.3s/触点/大纲·行:列·图谱=D-12 上游门控/
probe_mtime release 挂起=D-41 仪器面——一致性核验通过（不发明新
限制不漏记在册件）。

**AC-04 面**：tag 命令+message 草案+前置三件清单落 RELEASE.md §1
判据节 + 仪表盘 milestone 行首现（tag-ready 态）+ git tag=0 断言。

## 9. 复审记录

- **2026-09-30 draft handoff（auto-plan:new）**：
  - `stage: new`，PLAN-029，revision 1（drafting）。
  - 立项路由：v0.1.0 提案③「release 批」立项兑现（028 §4.3 提案
    ——用户测距问询发起 + 028 执行追认；本批收口件①✅ 基础上推进
    ②供料 + ③本体）；池序面（①缺/②维持/③已收/④弱）让位注记。
  - 契约完备性：任务覆盖全部 AC 与 SD（T-01→AC-01 / T-02→AC-02 /
    T-03→AC-03 / T-04→AC-04 / T-05→AC-05/06）；「指南即验证」
    纪律 + tag 不打边界 + 红处置出口内置。
  - `outcome: pass`（记录授权内——起草 + handoff；work 由用户
    auto-plan:work 入口启动）。
  - `next: work`（T-01 RELEASE.md 起草起）。

- **2026-09-30 work handoff（auto-plan:work）**：
  - `stage: work | plan_id: PLAN-029 | plan_revision: 1 | outcome: pass
    | code_commit: 本提交（执行末单提交——001..028 直接 main 线性惯例）
    | task_ids: T-01..T-05 全链 5/5`
  - base：main@618edc4（工作树 clean——028 归档 tip；仓库无 docs/
    specs/，canonical=ARCH+README+ledger v33→v34+**RELEASE.md 本批
    新增**）；仓库惯例=直接 main 检出执行（001..028 在档，无
    worktree/dev 分支）。
  - **交付面**：docs/RELEASE.md 五节（判据三收口件定文化[①✅/②待
    用户/③本批 receipt]+交付形态双形+试用指南[JADE_WORKSPACE+双形
    命令+核心弧 walkthrough 十弧]+已知限制五件+切片摘要 001..028
    28 行）+ 回归门六面 fresh receipt（RELG-2901 值内嵌 §8.1）+
    双形冒烟 ALL GREEN（merged r4/vue 集成单命令形 r2——指南命令
    逐条实走）+ tag 预案（annotated tag 命令+message 草案+前置三件
    清单——**tag-ready 态，git tag 保持 0**）+ README 仪表盘首个
    milestone 状态行 + README 是什么第二十七切片条目 + README 文档
    节 RELEASE.md 指针 + SD-2902 双 heading（ARCH §6/README Tests）+
    ledger v33→v34（H1+D-35/D-41 行随批）。**src 零 diff**（负向证
    全零——AC-05）。
  - **判绿**：merged 矩阵 **22 PASS 全组绿**（基线 v20 零漂移——
    **新载体 debug 09-30 16:01 v0.4.2-2311-g7fcf913eb 全程实跑**
    [12:47 在册档后家族重建——载体换档实录 D-35②]）+ e2e **1 passed
    1.2m 首跑即绿**（十五段+15 cjk 弧；D-21 HTTP 签名零复现）+
    build **✓ built 15.81s**（SCHEMA_DRIFT_GENERATE_AT=1；engine
    assert-dist-fresh 过=dist ✓built@tip）+ probe **14 件 fresh ALL
    GREEN**（receipt_d19 守望形 g①..g⑤ 全绿=028 D-19 收口续证；
    mtime debug 路由）+ bench150 **四点带内**（tags 233ms 门续/
    link 279-264/search 48-55/boot-ready 2677 记录面；findings 零
    新增）；split 臂 boot FAIL 主导形=F-24-2 **第十三窗观察**（分段
    判绿惯例——判别链四件：src 零 diff+merged 同窗 22 PASS+probe
    split 臂 HTTP 全绿 14 件+e2e 同一 serve 面 1.2m）；probe_dir_ops
    **非阻断红 triage**（9362 临时源端口碰撞+动态端口范围下调
    1024-15000——D-31④ 族新形环境项；0 案起跑非案败；unlock=probe
    MCP 口 pick_port 化供下批）。
  - **执行窗观察三件非阻断**：①矩阵 r1 merged 臂 10m popover 内容
    窗瞬态 ×1（D-21 v11③ 族——重跑 r2 即绿在册惯例）；②debug exe
    载体变更实录（09-30 12:47→16:01 家族重建——新载体全链绿=交付
    面健康直证，D-35② 换档）；③dist 独立 serve 缺口定谳（vite
    preview 代理 vite 5.4.21 实测不生效——vue 形等效调整=工具链
    集成单命令形 `auto run -r vue --server vm`，RELEASE.md §2 注记
    +打包批 v0.2.0 候选收口）。
  - `blockers: 无`。
  - `next: review`（复审基线=本提交；RELEASE.md §1 判据 r1 草案
    交裁面随 review 流——§10.2 ①②③）。

- **2026-09-30 review pass（auto-plan:review）——全 AC 独立重放裁定
  （同会话复审声明+工件重放口径：1e3fab3 树 fresh 重放非执行期
  摘要采信；工作树 clean 单检出=直接 main 惯例）**：
  - `stage: review | plan_id: PLAN-029 | plan_revision: 1 | outcome: pass
    | reviewed_commit: 1e3fab3 | base_commit: 618edc4 | dependency_
    revisions: debug exe 09-30 16:01 v0.4.2-2311-g7fcf913eb + release
    exe 09-30 12:41（复审窗全程未再变）| spec_inputs: docs/ARCHITECTURE
    .md + docs/README.md + docs/parity-ledger.md v34 + docs/RELEASE.md
    （本批新增——本仓无 docs/specs/，canonical 四件）`
  - **AC-01 pass（重放）**：五节锚位 grep 读回全现（§1..§5——
    `^## [1-5]\. ` ×5）+ 判据三收口件与 028 §4.3 提案逐项一致
    （①CJK 开档✅ 028 收口/②真实试用 ≥1 轮待用户[回执注记位]/③
    release 批 receipt）+ 已知限制五件与在册逐一对表（split=F-R17-1
    第十三窗/P≤200=D-35② 知情警示/D-39 双取形/大纲行:列图谱=D-12
    /probe_mtime=D-41 仪器面——不发明不漏记）+ 切片摘要 28 行
    （`^\| 0xx \|` grep 计数）。
  - **AC-02 pass（重放）**：六面 fresh——①矩阵 merged **22 PASS
    全组绿** 基线 v20 零漂移（**复审窗 r1 一次成型**——执行窗 r1
    popover 瞬态未再现；p29-rev-matrix-r1.log）②split 臂 boot FAIL
    主导形同形复现（F-24-2 第十三窗续证——分段判绿判别链同前）
    ③e2e **r3 1 passed 1.2m 全绿**（r1=gen 漂移败形→F-29-R3 归因+
    标准 build 通道复原后重放；r2=reload ready 窗 15s 超时 D-21 族
    瞬态重跑即绿；p29-rev-e2e-r1/r2/r3.log）④build ✓ built 15.81s
    （重放）+ 复原窗 ✓ built 7.92s ⑤probe **15/15 fresh ALL GREEN**
    （**probe_dir_ops 复审窗翻绿**——9362 环境碰撞窗口间自愈，执行
    窗 triage 归因获直证；receipt_d19 守望形 g①/g②/g⑤ 全绿；
    p29-rev-probe-*.log）⑥bench150 带内（link 279/search 50/tags
    244ms 门续/boot-ready 2698 记录面；p29-rev-bench150.log）。
  - **AC-03 pass（重放）**：merged 形冒烟 ALL GREEN（boot-ready+树行
    ASCII+CJK+状态面——p29-rev-smoke-merged.log）+ vue 集成形冒烟
    ALL GREEN（front serve/代理链/CJK exists POST→1/read_wiki len=
    547 语料锚/工具链窗 Init 链——p29-rev-smoke-vue.log）+ dist
    ✓built@tip（执行窗 15.81s + 复审复原窗 7.92s——assert-dist-fresh
    通道随链）+ 指南命令实走对账维持。
  - **AC-04 pass（重放）**：RELEASE.md §1 tag 命令+message 草案+
    前置三件清单锚位在 + 仪表盘 milestone 行在（README :867）+
    **`git tag -l | wc -l` == 0**（复审末复核）。
  - **AC-05 pass（重放）**：`git diff 618edc4 -- src/` 0 行 +
    package.json 0 行 + tests/baseline/ 0 行 + tracked 面=五 docs 件
    + gen/dist check-ignore ignored + 复审末复核维持全零（复审冒烟
    再生的 .auto/ 缓存已清场）。
  - **AC-06 pass（重放）**：SD-2901（RELEASE.md 新件+README 文档节
    指针）/SD-2902（ARCH §6 + README Tests heading 双锚 grep 各 1）
    /SD-2903（是什么第二十七切片条目+仪表盘 milestone 行）
    /SD-2904（ledger H1 v34+SD-2904 指针+D-35②/D-41 行随批）——
    锚位读回全现 + delta after 与落地文本一致性核验通过。
  - **发现四件**（非阻断——pass 裁定不受涉）：
    - **F-29-R3（medium——复审窗实勘新知，操作序纪律缺口感）**：
      T-03 vue 集成形冒烟的 launcher（`auto run -r vue`）**启动即
      再生 gen 部分文件、抹掉 regen-vue 运行期补件面**（tabs.remove
      →splice + store __vmOnly no-op 双面——store mtime 17:31=冒烟
      窗实证；:245 remove 裸奔 + :319 throw 桩复原双证）→ 复审 e2e
      r1 [7 tab] 直接关闭路 pageerror（`tabs.value.remove is not a
      function`）。**非受审提交缺陷**（src 零 diff+dist 17:19 补丁态
      构建=✓built@tip 主张不受损+执行窗 e2e 17:18 补丁态在窗绿先于
      冒烟）；复审窗标准 build 通道复原（补件重铺+✓ built 7.92s）后
      e2e r3 绿=因果闭环。**处置=merge 窗随批**：ledger D-15/R010
      族记账（launcher regen 抹补件面——e2e/build 须在任何 `auto run
      -r vue` 之后重跑 regen-vue 的操作序纪律）+ RELEASE.md §2 集成
      形注记补「运行即再生 gen——repo 验证链随后需重跑 `pnpm build`
      恢复补件面；vue 集成形=工具链原生 run 语义（无运行期垫片，
      D-13 终止面行为差异在册）」。
    - **F-29-R1（low——docs 陈旧交叉引用）**：RELEASE.md §4①「留观
      第十二窗」——本批已续记第十三窗。→ merge 窗补正（F-27-R1
      先例）。
    - **F-29-R2（low——docs 文内一致性别扭）**：RELEASE.md §4①「交
      付形态 merged/vue dist 不涉」——§2 已定形 vue=集成单命令形
      （T-03 等效调整），dist=构建物非 serve 形。→ merge 窗补正
      （F-27-R1 先例）。
    - **F-29-R4（info——正面观察）**：probe_dir_ops 9362 环境碰撞
      窗口间自愈——复审窗 15/15 fresh 绿直证「环境瞬态非产品」
      triage 归因；release 就绪判定强化（probe 面 review 窗满编）。
  - **观察二件非阻断**：①复审 e2e r2 reload ready 窗 15s 超时
    （D-21 族瞬态——r3 重跑即绿在册惯例）；②复审窗矩阵 r1 一次
    成型（执行窗 r1 popover 瞬态未再现——D-21 单日单批样本限注记
    续）。
  - `findings: F-29-R1/R2（low docs 补正→merge 窗）+ F-29-R3（medium
    操作序纪律+记账→merge 窗随批）+ F-29-R4（info 正面）`
  - `evidence: e2e/.runtime/p29-rev-*.log（复审窗 fresh 重放全录——
    ignored 一次性件惯例，关键值已内嵌本记录）+ docs/RELEASE.md
    （reviewed Spec delta 冻结面=本提交 1e3fab3 内容）`
  - `next: merge`（用户已授权 review→merge 连跑；merge 基线=1e3fab3
    +复审记录 docs-only 后代）。

- **2026-09-30 merge pass（auto-plan:merge）——PLAN-029:r1 五
  checkpoint 闭环归档（直接 main 线性惯例 001..028 在档承载）**：
  - `prepared`：复审基线 r1@1e3fab3（reviewed——f1a89c1 复审记录
    docs-only 后代，diff 1e3fab3..f1a89c1 恰计划件 85 行核验）——
    **canonical delta 已随实现落 main**（SD-2901 RELEASE.md 新件+
    SD-2902 ARCH §6/README Tests heading+SD-2903 README 是什么/
    仪表盘 milestone 行+SD-2904 ledger v34——1e3fab3 五 docs 件面）
    ；delivery commit 链=1e3fab3→f1a89c1→e655a65（merge 窗补正
    ——F-29-R1 §4① 十二窗→十三窗/F-29-R2 §4① vue dist→集成单
    命令形对齐/F-29-R3 §2 集成形运行注记+ledger v34 merge 窗补记
    [D-15/R010 族 launcher regen 抹补件面全链+操作序纪律立案+
    F-29-R4 dir_ops 自愈正面]——F-27-R1 先例续）。
  - `landed`：main tip==e655a65（merge-base --is-ancestor 全链
    ancestor-OK 线性无 merge commit；known-good smoke=合并窗 fresh
    vm merged 臂 **22 PASS**（基线 v20 零漂移——终树 e655a65 实跑
    p29-merge-smoke.log 一发过；split 臂 [1 boot] FAIL 主导形=预期
    第十三窗形）；src 与 1e3fab3 零差异=docs-only 后代链直证）。
  - `ledger_refreshed`：v34@1e3fab3+merge 窗补记@e655a65 tracked
    读回核验（H1 v34 恰一+SD-2904 指针恰一+merge 窗补记恰一+
    F-29-R3 恰一——无 live ledger 服务[.autoos/ 缺席实勘]，tracked
    文件面 ledger=docs/parity-ledger.md，024..028 同判）。
  - `archived`：git mv→docs/plans/archived/029-release-readiness-
    slice.md + status archived + **completion_kind delivered**（YAML
    块内——675320f 遗漏教训随锁落位）。
  - `cleaned`：无 worktree/dev 分支（git worktree list 单一主检出
    核验）+ 代码工作树零 WIP（status 恰本归档提交面）+ .auto/ 工具
    链缓存清场（复审冒烟窗再生件——两度清场在录）+ 判别链物料复核
    （src 零 diff 强形无 archive 树涉；一次性件居 ignored e2e/
    .runtime——p29-*/p29-rev-*/p29-merge-smoke 日志+冒烟脚本族+
    p29-manual-ws 语料在档可追溯）。
  - deployment 观察：本批 src 零 diff→**零重建面**（家族双 exe
    09-30 12:41/16:01 载体即部署面零变化；gen/dist 复审复原窗
    ✓built@7.92s 补丁态现势——vue dist 载体现势）；批回归到期件=
    无 .last-batch-regression.json（jade-edit 惯例外——024..028
    同判；本批 T-02 六面 full gate+复审全链重放=批级回归门本体）。
  - 留观交接：F-29-R3 操作序纪律（launcher regen 抹补件面——
    RELEASE.md §2 注记+ledger D-15/R010 族在册）+ F-R17-1 第十三窗
    （split 臂独立缺陷域——家族专项修复 unblock 不变）+ probe_
    dir_ops MCP 口 pick_port 化（tests 面——供下批候选）+ **里程碑
    交接=v0.1.0 tag-ready 态**（前置三件：①✅②**待用户试用 ≥1 轮
    确认**[RELEASE.md §1 回执注记位]③receipt 在档——齐备后
    `git tag -a v0.1.0` 一命令即达，tag 动作=用户自打或明示代打）。
  - `outcome: pass`（delivery/derived view/archival/cleanup 全验）。
  - `next: 无`（PLAN-029 delivered 收口；候选池首位=试用反馈件——
    本批 RELEASE.md 试用指南即其供料）。

## 10. 待澄清事项

1. **主题确认（draft 阶段出口）**：本 draft 按里程碑轨道择 release
   批；用户改向（试用反馈件优先——反馈首现仍按池定义首位）→
   revision 或废立——不静默改向。
2. **v0.1.0 判据交裁（RELEASE.md 判据节 r1 草案）**：①「真实试用
   ≥1 轮」的确认口径（用户回执形——一句确认即可？还是反馈件立项
   形？）；②**无安装包语义**（v0.1.0 = 源码里程碑——若需独立
   exe/installer，打包批需另立并入判据，本 r1 不含）；③注记面五件
   加減——work/review 流交用户复审。
3. **tag 打法边界**：本批止于 tag-ready（git tag 保持 0——AC-04
   断言）；tag 动作 = 用户自打或用户明示后代打（前置三件清单互锚）。
4. **回归红处置**：非阻断红 → triage 挂账行（不本批修——regress
   纪律）；阻断级红（merged/e2e/build 主面败）→ 本批 blocked 出口
   交裁（修复批优先于 release）。
5. **split 臂第十二窗留观**（独立上游缺陷——家族专项修复 unblock）
   + D-39 维持①（027 第十一例）+ probe_mtime debug 路由（D-41）
   ——分段判绿/注记惯例续。
6. **家族窗观察惯例续**：exe 时间戳随批实录（09-30 载体档——变更
   则换档注记）+ D-21 v34 扩记 + 窗况记录。
