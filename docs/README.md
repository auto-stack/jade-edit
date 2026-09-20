# jade-edit — AutoDown 编辑器（独立仓，auto-edit 家族）

> jade-edit：`.ad`（AutoDown/markdown-wiki）文件的桌面编辑器，**AutoUI
> 单工程双轨**首例——同一份 `src/front/*.at` 单源，vm 轨解释渲染（iced
> 原生窗）、vue 轨生成 Vue3+Vite 工程。从初始版起双轨一致性（同日落地，
> gate 双臂同断言域），不再积累组装级差异（旧 jade-garden 的教训）。

## 是什么 / 不是什么

- **全新应用**（非 examples 拷贝、非旧 jade-garden 迁移）——溯源见
  [PROVENANCE.md](PROVENANCE.md)。
- 旧 `auto-down/jade-garden` = **冻结功能池**（反链/图谱/检索等后续批
  逐步以 AutoUI 组件/BP 形态移植过来），本仓零依赖其代码。
- 编辑器内核 = `@autodown/engine`（auto-down，AutoUI 外部官方组件）：
  vue 轨 npm link 消费；vm 轨经 auto-lang `autodown_editor` 官方件位。

## 栈

| 面 | 形态 |
| --- | --- |
| 单源 | AutoUI widget/store DSL（`.at`；038/449 store 形态、013 组件纪律） |
| vm 轨 | `auto run -r vm`（auto-lang exe，解释渲染 iced） |
| vue 轨 | `auto build -r vue`（生成 Vue3+Vite 工程） |
| deps | bps = auto-lang blueprints（filetree）；stylekit = auto-edit specs |
| 后端 | jade-garden-back 外部服务器（axum 模式；`JADE_GARDEN_SERVER=vm` 可切实验 VM 模式） |

## 运行矩阵

（T-08 收尾回填：vm / vue / 后端三命令。）

## 文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 架构定版（T-07）
- [plans/081-t00-rulings.md](plans/081-t00-rulings.md) — T-00 三勘定
  决策档（双轨机制 / actions-vue 现状 / 后端选型）
- [../docs/parity-ledger.md](parity-ledger.md) — 双轨差异登记表 v0（T-07）

## 计划

PLAN-081（jade-edit-bootstrap）执行中——计划本体与进度记录在
auto-down 主检出 `docs/plans/081-jade-edit-bootstrap.md`（账本所在）。
