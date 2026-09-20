# PROVENANCE

jade-edit 是**全新应用**：不拷贝自 auto-lang `examples/ui/*`，也不是旧
jade-garden（auto-down 仓）的迁移或部署副本。2026-09-20 随 PLAN-081
（jade-edit-bootstrap）立项创建。

家族与引用关系（消费均为运行期/构建期引用，无源码拷贝）：

| 关系 | 对象 | 形态 |
| --- | --- | --- |
| 家族先例 | `D:\autostack\auto-edit`（auto-edit 仓） | 栈形态参照（dep bps + stylekit、单工程 vm 轨）；其本体拷贝自 auto-lang examples/ui/041，jade-edit 不重复该拷贝模型 |
| 工具链 | `D:\autostack\auto-lang`（auto-lang 仓） | `auto.exe`（`run -r vm` / `build -r vue`）；`dep bps` → blueprints（filetree bp）；`autodown_editor` VM 件位（PLAN-068 T-02） |
| 编辑器组件 | `D:\autostack\auto-down`（auto-down 仓）`autodown/packages/engine` | `@autodown/engine` 外部官方组件：vue 轨 npm_deps link；出口契约 1.0 冻结（四出口+style.css） |
| 后端 | auto-down `jade-garden/back/server` | 外部服务器进程消费（axum 模式；exe 直引构建产物路径）；契约副本 `src/back/api.at` 带漂移门（冻结源单向部署） |
| 功能池（冻结） | auto-down `jade-garden` | 零改动零依赖；vue 专属组件（reka-ui 等）后续批经 design 30 §6 判定迁 AutoUI 通用组件/BP |

创建决策记录：auto-down 主检出
`docs/plans/081-jade-edit-bootstrap.md`（PLAN-081）+ 用户 2026-09-20
三裁定（独立仓 / 编辑器留守 auto-down 经外部官方组件消费 / 旧
jade-garden 冻结）。
