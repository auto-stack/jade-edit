# PROVENANCE

jade-edit 是**全新应用**：不拷贝自 auto-lang `examples/ui/*`，也不是旧
jade-garden（auto-down 仓）的迁移或部署副本。2026-09-20 随 PLAN-081
（jade-edit-bootstrap）立项创建。

家族与引用关系（消费均为运行期/构建期引用，无源码拷贝）：

| 关系 | 对象 | 形态 |
| --- | --- | --- |
| 家族先例 → **基座**（PLAN-001 换基） | `D:\autostack\auto-edit`（auto-edit 仓） | **chrome + back 形态来源**：其 PLAN-003（front/back 拆分 + 双轨化）交付面为 jade-edit 换基基座（menubar/toolbar/tab/alert 组件套件 + api.at 契约形态 + `--server`/merged 语义），PLAN-003/001 双档引用；其本体拷贝自 auto-lang examples/ui/041，jade-edit 不重复该拷贝模型 |
| **家族同步（PLAN-002）** | auto-edit PLAN-004/005（2026-09-21 归档 fdc92aa/dc99328） | **收口形态对照**：jade PLAN-002 对照其「功能基线定标 + 测量体系 + 去镜像」双批收口形态 node 化落地——矩阵扩单与判绿口径（↔PLAN-004 矩阵基线）、tools/bench 测量套件 + budgets + L0 基线（↔PLAN-005 B 段 bench.py/budgets.json/results）、active_body 镜像语义固化（↔PLAN-005 去镜像的**结构性反向**：jade 镜像承重于 vue 通道，只固化不删，ARCHITECTURE §3 SD-201）、上游供料包（↔其 docs/upstream/2026-09-m1-supply.md 结构同源）；vue 轨运行期 e2e（六检查+垫片）jade 领先面，不在本批追赶 |
| 工具链 | `D:\autostack\auto-lang`（auto-lang 仓） | `auto.exe`（`run -r vm` / `build -r vue`）；`dep bps` → blueprints（filetree bp）；`autodown_editor` VM 件位（PLAN-068 T-02） |
| 编辑器组件 | `D:\autostack\auto-down`（auto-down 仓）`autodown/packages/engine` | `@autodown/engine` 外部官方组件：vue 轨 npm_deps link；出口契约 1.0 冻结（四出口+style.css） |
| 后端（自有） | 本仓 `src/back`（Auto 写：api.at 契约 + wsys.at 实现） | PLAN-001 换基新生，supersede 外部 jade-garden-back exe 消费（PLAN-081 R-3 bootstrap 捷径；契约副本 + 漂移门随之退役） |
| 功能池（冻结） | auto-down `jade-garden` | 零改动零依赖；vue 专属组件（reka-ui 等）后续批经 design 30 §6 判定迁 AutoUI 通用组件/BP |

创建决策记录：auto-down 主检出
`docs/plans/081-jade-edit-bootstrap.md`（PLAN-081）+ 用户 2026-09-20
三裁定（独立仓 / 编辑器留守 auto-down 经外部官方组件消费 / 旧
jade-garden 冻结）。
