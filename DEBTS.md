# DEBTS — 已交付计划遗留的未完事项

> 各计划 merge 收尾时，把「明示延后、条件重入」的遗留项从计划档沉淀到这里，
> 保持可追踪：每项带来源计划、重入条件、owner 与验证口径。已闭环的项随批删除
> 或标记 done（不重写历史回执）。

## PLAN-039 发布收口遗留（2026-10-12 merge 时沉淀）

来源：[docs/plans/archived/039-release-convergence.md]（preparation 面 phase 式
复审 pass @22c34fe 前置记录；用户裁定「记录 DEBTS 后 merge 收尾」关闭本计划）。
状态键现势：manifest `closeout_status = preparation_only`、`auto_jade_ready` 未
判定、`publish_ready = false`——以下各项完成前不得翻真。

| # | 事项 | 重入条件／验证口径 | owner |
| --- | --- | --- | --- |
| D-039-1 | **最终 RC 冻结与最终候选回归**（原 D-01 门＋AC-05/06/07＋T-03/T-04/T-05 终收口面）：auto-lang v0.5 RC 到位后——两形态完整回归、干净新路径按 PowerShell 指南实走真实工作区副本、素材（截图/checksums）以最终候选重采、`manifest.json` 收口回填（各依赖 source_commit/SHA256/freshness；统一仪器漂移：复跑用 debug 3157-g38e4c7c5f vs manifest 调查版 2730-dirty/2747） | 母工程提供可重建 RC → 按 plan039 §6.1 命令序逐项 `$LASTEXITCODE` 检查 → `auto_jade_ready` 判定 | 母工程发布负责人＋本仓执行者 |
| D-039-2 | **用户真实试用回执**（原 D-03 门＋AC-08 发布条件面）：按 `docs/releases/v0.1.0-rc/trial-guide.md` 完成一次可绑定版本的真实试用并落回执 | 回执绑定版本与形态；缺失期间 `publish_ready=false` 不代填 | 用户 |
| D-039-3 | **母工程联合发布门**（原 D-04 门）：对外源码/工件入口、tag、website 部署由联合发布流程处理 | 本仓不猜 URL、不代打 tag；公开前外部门保持 pending | 母工程 |
| D-039-4 | **probe 三件静默环境补跑**（readiness §8／validation §5 行动项）：环境事件失效族，基线对照（git stash 还原 038 同崩）已排除与本仓改动无涉 | 静默环境（无并行负载窗）复跑全案通过 | 本仓执行者 |
| D-039-5 | **上游 auto.exe 挂起/abort 跟踪**：根因域=上游 iced/VM 事件循环（D-45② 族），已转 auto-lang（8ac54d8＋docs/upstream/2026-10-10-draft-settle-race-rootcause.md 交接件） | 上游修复版本落地后于最终候选重验（并入 D-039-1） | auto-lang |
