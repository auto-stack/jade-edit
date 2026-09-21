---
plan_id: PLAN-002
status: drafting
feature_name: jade-dualtrack-sync-batch
author: [zhaopuming]
created_at: 2026-09-21T21:30:00+08:00
updated_at: 2026-09-21T21:30:00+08:00
plan_revision: 1
current_step: 0
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-201..203"
  - "docs/README.md#SD-204..205"
touched_goals: []
---

# [PLAN-002] jade 双轨同步批次（对照 auto-edit PLAN-004/005 收口形态）

## 0. 变更摘要

auto-edit 已以 PLAN-004（功能基线定标）+ PLAN-005（测量体系 + 去镜像）
达成 vue/vm 双轨基本一致并归档（fdc92aa..dc99328；vue671 补件链退役
d845e54 + print 遮蔽缓解 3123c50）。jade-edit 与其保持家族同步（换基
PLAN-001↔003、补件退役 01d319c↔d845e54 均已同日对齐），本计划补齐
auto-edit 两批中 jade 尚欠的三块：**测量体系**（主差距）、**矩阵规模与
判绿口径**、**语义固化与上游供料通道**。五任务：矩阵扩展+判绿口径 /
tools/bench 测量套件 / active_body 镜像语义固化 / 上游供料包 / 文档
收口。vue 轨运行期 e2e（六检查同单 + vm-natives 垫片）jade 已领先，
不在本批追赶面。

## 1. 目标

- **G-1 矩阵定标**：检查单从六检查扩至含 tab 切换/关闭、退出存盘、
  编辑操作族（两轨同单纪律不变）；≥5 连跑分布表 + 判绿口径入 README。
- **G-2 测量体系**：`tools/bench/bench.mjs`（check/proxy/assert）+
  `budgets.json`（tier/validity/unlock 全行）+ 首版 L0 基线入仓——把
  2026-09-20 D-16/D-03 的一次性探针（首开冷/热、换档可见延迟）正式化
  为可复跑套件。
- **G-3 语义固化**：active_body 每键整文镜像语义进 ARCHITECTURE §3
  （vue `@update:modelValue` 通道承重 + C-5 契约；大文档上限受制，
  unlock = 上游 rope delta/分块读），parity-ledger 对应行更新。
- **G-4 上游供料包**：`docs/upstream/2026-09-jade-supply.md`——D-16
  boot 预热 / D-15 残余（remove 直通、dropdown schema）/ a2r F-R1 /
  print 遮蔽预防注记；每节期望形态 + 下游复验条件 + 回执方式（669
  先例：上游落后本仓零改动复验解阻）。

### 非目标

- vue 轨运行期追赶（jade 已领先：e2e 六检查绿 + 垫片）。
- L2 性能模式（a2r/RQ——F-R1 阻塞且 jade v0 无预算效力需求）。
- 去镜像实删（jade 镜像承重于 vue 通道，只固化语义，见 §5 T-03）。
- auto-lang 侧任何改动（D-16 修复属上游，本仓只供料）。

## 2. 架构方案

对照 auto-edit 收口形态的 jade 化映射（node 栈，非 python）：

| auto-edit 件 | jade 对应 | 差异说明 |
|---|---|---|
| `tools/bench/bench.py`（check/proxy/assert） | `tools/bench/bench.mjs` | 观测通道=jade 已有的 MCP 心跳法（往返计时），auto-edit 的 AUTO_BENCH 插桩后置（VM time 族未接线同坑） |
| `budgets.json`（10 行战略档） | `tools/bench/budgets.json` | jade 档 ~6 行：首开热态 hard / 首开冷态 ledger+blocked-upstream(D-16) / 换档可见 ledger(D-03) / 启动到 ready / 大文档 ledger(C-5→上游 delta) / 内存上界 |
| `results/baseline-L0-*.md` | `tools/bench/results/baseline-L0-20260920.md` | 首版即 D-16/D-03 既有实测（b8bce4d 在案）+ 本批 proxy 复跑 |
| 矩阵 ≥49/0 判绿口径 | jade 判绿口径（数值执行期定谳） | jade 检查单小，首轮 ≥5 连分布定数 |
| `docs/upstream/2026-09-m1-supply.md` | `docs/upstream/2026-09-jade-supply.md` | 结构同源：节=期望形态/证据/复验条件/回执方式 |
| 去镜像五处回读删除 | **不删**——语义固化 | vue `AutoDownEditor` 整文回传使镜像承重；与 auto-edit（vm 编辑器权威）结构性不同 |

断言域纪律不变：两轨交集（结构/文本/磁盘字节，非像素）；新检查单条目
须两轨可同锚（退出存盘=quit 触发落盘两轨可验，进程退出断言仅 vm 附注）。

## 3. 技术栈

node（bench/矩阵/e2e 同栈）、playwright（e2e）、AutoUI MCP（vm 驱动
+心跳计时）、pnpm。无新依赖。

## 4. 需求分析与背景调查

- **授权记录**：用户 2026-09-21 批准本批立项（五任务形态按对照分析
  原文）；范围=本仓工作树 + 文档；auto-lang/auto-down 零改动。
- **auto-edit 对照基线**（只读引用）：
  `docs/plans/archived/004-m1-func-baseline-perf-mode.md`、
  `005-m1-measure-bench-desrc-mirror.md`（交付 fdc92aa/dc99328）；
  `tools/bench/{bench.py,budgets.json,results/}`。
- **jade 现状**：gate 三段 ALL GREEN（955ee70 复审实录，01d319c/b8bce4d
  后未全量复跑——T-05 收口时跑）；vm_matrix 双臂六检查+基线 v1；
  e2e 六检查同单；D-16/D-03 实测数据在 b8bce4d commit message +
  `e2e/.runtime/probe-first-open.mjs`（gitignored 一次性探针，本批吸收）。
- **spec 面**：本仓无 `docs/specs/`——canonical = docs/ARCHITECTURE.md
  / README.md / parity-ledger.md（PLAN-001 先例，SD 直接指向三档）。
- **Store 面**：`CloseRequest/QuitSaveClose/QuitDiscard/ActQuit` 在
  editor_store.at:328-345 在册（退出存盘检查的源面就绪）；tab 定位
  while 索引扫描（D-11 纪律）、`.tabs.remove` vm 原生/vue splice 补件
  （01d319c）——tab 关闭检查双轨可行。
- **上游依赖**：工具链须 ≥ v0.4.2-1652（含 669+671，README 已注记）。

## 5. 详细设计

### T-01 矩阵扩展与判绿口径

- `tests/vm_matrix.mjs` 检查单扩三组（双臂同单）：**tab 面**——开两档
  → 切换（active 断言+内容互换）→ 关闭非活动档（dirty 关闭走确认弹层
  QuitDiscard/QuitSaveClose 两路）；**退出存盘**——dirty 态触发
  CloseRequest → QuitSaveClose → 磁盘三验（原文/标记/frontmatter，
  复用 save 验证件）；**编辑操作族**——段中回车/退格（C-5 整文构造，
  vm type_text / vue locator 输入达成同语义）。
- `e2e/matrix.spec.ts` 同单同步（vue 侧 quit=Save 落盘断言，进程退出
  仅 vm 附注）。
- ≥5 连跑分布表进 §9；README Tests 节判绿口径落盘（数值首轮定谳，
  形态学 auto-edit："完成态 = RESULT 行出现且 ≥N/0"）。

### T-02 测量套件

- `tools/bench/bench.mjs` 三命令：
  - `check`——环境指纹（auto.exe 版本断言 ≥1652+669/671、node/pnpm、
    engine dist fresh）；
  - `proxy`——MCP 驱动 L0：启动分解（spawn→MCP ready→status ready）、
    首开冷/热（冷=新进程+未触文档；热=同进程二次开）、换档可见延迟
    （press→锚可见，D-03 口径）、内存采样（进程 RSS 峰值）；产出
    `results/<ts>.jsonl`；
  - `assert`——对最近 results 按 budgets.json 出报告（hard 违例
    exit 1；ledger/blocked-upstream 只记不挂）。
- `budgets.json` 必含行：first_open_warm（hard）、first_open_cold
  （ledger，blocked-upstream=D-16 boot 预热）、doc_switch_visible
  （ledger，D-03）、boot_to_ready、open_large_doc（ledger，C-5→上游
  delta）、mem_peak（ledger）。
- 首版基线 `results/baseline-L0-<date>.md` 入仓（吸收 b8bce4d 既有
  实测 + 本批 proxy 复跑对照）。
- 探针矩阵四问（指标×通道×模式×阻塞）进 `tools/bench/README.md`。

### T-03 镜像语义固化

- `docs/ARCHITECTURE.md` §3 双轨硬约束表后增段：active_body 镜像
  语义——每键整文回写（vue `@update:modelValue` / vm INPUT_TEXT 同
  源）= vue 通道承重结构，非 auto-edit 的"编辑器权威"形态；大文档
  上限受制（整文 O(n) 回传），unlock = 上游 rope delta/分块读
  （auto-edit 供料 §5.1 同源推进）。
- `docs/parity-ledger.md`：D-16/D-03 处置列补 budget 行指针
  （validity/blocked-upstream 口径）。

### T-04 上游供料包

- `docs/upstream/2026-09-jade-supply.md` 四节（学 auto-edit 结构）：
  ①D-16 vm 首开初始化（boot 期 `spawn_syntax_warm_up`+注册表预建；
  附 b8bce4d 实测与热态边界；复验=冷态首开 <预算）；②D-15 残余
  （`tabs.value.remove` R010 直通——jade regen-vue splice 补件在案；
  dropdown-menu `open` prop schema 未吸收 warning）；③a2r F-R1
  （`--server rust` E0432，auto-edit 在册同坑）；④print 遮蔽预防注记
  （auto-edit 3123c50 家族缺口，jade 未中招——store 无 console 字段；
  约束：新 store 状态避开 `console` 名）。
- 每节：期望形态 / 证据（路径+commit）/ 下游复验条件 / 回执方式。

### T-05 收口

- gate 全量复跑（扩单后 ALL GREEN 收据进 §9）；
- `docs/README.md`：Tests 节判绿口径（SD-204）+ 运行矩阵增 bench 三
  命令行（SD-205）+ parity-ledger 指针 v3→v4（如 T-03 增行）；
- `docs/PROVENANCE.md`：家族同步注记（本批 ↔ auto-edit 004/005 对应
  关系）。

### 规范增量

| delta_id | add/modify/retire | target | before / after | rationale | AC |
|---|---|---|---|---|---|
| SD-201 | add | docs/ARCHITECTURE.md §3 | 无镜像语义陈述 / active_body 每键整文镜像=vue 通道承重+C-5，unlock=上游 delta | 数据语义是 spec 级事实（auto-edit SD-01 同型，jade 形态） | AC-05 |
| SD-202 | modify | docs/parity-ledger.md D-16/D-03 | 手写处置 / 增 budgets.json 行指针（validity 口径） | 预算体系与登记表互指，防失联 | AC-05 |
| SD-203 | add | docs/upstream/2026-09-jade-supply.md | 无供料通道 / 四节供料包（期望形态+复验条件+回执方式） | 上游缺口须有可回执的通道（auto-edit 先例） | AC-06 |
| SD-204 | modify | docs/README.md Tests 节 | 六检查口径无判绿数值 / 扩单说明+判绿口径+≥5 跑引用 | 基线口径是 spec 级事实 | AC-02 |
| SD-205 | modify | docs/README.md 运行矩阵 | 无 bench 命令 / 增 tools/bench 三命令行+基线口径 | 测量体系是 canonical 运行面 | AC-03 |

## 6. 测试设计

- gate 三段（vm 双臂扩单矩阵 + vue build + e2e 扩单同单）；
- bench：check 绿 / proxy 出 JSONL / assert 报告三态（hard 违例构造
  性红证一次：临时调低 hard 预算验证 exit 1）；
- ≥5 连跑分布（T-01 判绿口径数据源）；
- 复跑对照：proxy 首版基线 vs b8bce4d 既有实测（D-16/D-03 数值同
  量级校验，冷态项按 blocked-upstream 只记不断）。

## 7. 验收标准

- **AC-01** 扩单全绿：vm_matrix 双臂含 tab 面（切换/关闭×确认两路）+
  退出存盘 + 编辑操作族，e2e 同单（vue 侧 quit=落盘断言），gate
  ALL GREEN 收据在 §9。
- **AC-02** 判绿口径落盘：README Tests 节含"完成态 = RESULT 行且
  ≥N/0"口径 + §9 ≥5 连跑分布表（N 数值定谳于首轮分布）。
- **AC-03** bench 可复制执行：`node tools/bench/bench.mjs check` 绿
  （≥1652+669/671 指纹）；`proxy` 产出 JSONL（启动分解/首开冷热/
  换档/内存四类指标齐）；`assert` 出报告；README 命令复制执行绿。
- **AC-04** budgets.json 必含六行全带 tier/validity/unlock；冷态首开
  与大文档 = ledger + blocked-upstream（分别挂 D-16 / C-5→上游
  delta）；assert 对 hard 违例 exit 1 有构造性红证。
- **AC-05** SD-201/202 落盘：ARCHITECTURE §3 镜像语义段 + ledger
  指针互指，实读复核。
- **AC-06** 供料包四节齐（D-16/D-15 残余/F-R1/print 预防），每节
  含期望形态/证据/复验条件/回执方式，实读复核。
- **AC-07** 基线入仓：`results/baseline-L0-<date>.md` 含 D-16/D-03
  既有实测与本批复跑对照；PROVENANCE 家族同步注记落盘。

## 8. 执行步骤

| # | 任务 | 依赖 | 产出 | AC | 验证 |
|---|---|---|---|---|---|
| T-01 | 矩阵扩三组（vm_matrix+e2e 同单）+ ≥5 连跑 + 判绿口径 | — | 扩单矩阵/分布表/README 口径 | AC-01/02 | gate ALL GREEN；≥5 跑分布定 N |
| T-02 | bench.mjs 三命令 + budgets.json + 基线入仓 + bench README | T-01（换档口径） | tools/bench 全套 | AC-03/04/07(基线) | 三命令复制执行绿 + 构造性红证 |
| T-03 | 镜像语义固化（ARCHITECTURE §3 + ledger 指针） | — | SD-201/202 | AC-05 | 实读复核 |
| T-04 | 上游供料包 | T-02（D-16 数据收编） | docs/upstream/…supply.md | AC-06 | 实读复核 |
| T-05 | gate 全量收口 + README/PROVENANCE | T-01..04 | 收口收据 + SD-204/205 | AC-01/07 | gate ALL GREEN 实录 |

执行顺序：T-01 → T-02 →（T-03/T-04 可并行）→ T-05。

## 9. 复审记录

- 2026-09-21 draft handoff（auto-plan:new）：stage=new，revision=1，
  outcome=pass（授权=用户批准五任务形态；判绿数值 N 与 bench 是否入
  gate 已裁定为执行期决策/独立命令，无阻塞待决），next=work。

## 10. 待澄清事项

- 判绿口径数值 N：执行期由 T-01 首轮 ≥5 连分布定谳（auto-edit F-RV6
  类早崩形态若在 jade 复现，口径同型处理——无 RESULT 行=重跑条款）。
- bench 与 gate 关系：本计划定为**独立命令**（gate 保持三段不变），
  用户若要 bench assert 入 gate 另批。
