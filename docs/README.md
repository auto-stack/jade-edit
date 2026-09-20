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

前置：`auto.exe` 在 PATH 或 `AUTO_EXE` env；jade-garden-back exe（auto-down
构建产物，缺失时 run-back 提示构建命令）；`pnpm install`（仓根，playwright）。

```sh
# —— 后端（axum 外部服务器，隔离 fixture 工作区；--vm 可切实验 VM 模式）——
node scripts/run-back.mjs [--port 8199]

# —— vm 轨（iced 原生窗；split 模式连后端）——
AUTO_VM_MERGE=0 AUTO_BACKEND=http://127.0.0.1:8199 auto run -r vm

# —— vue 轨（生成+补丁+install+build 一键；vite dev 需代理指向后端）——
pnpm build                          # = node scripts/regen-vue.mjs
AUTO_HTTP_PORT=8199 AUTO_FRONT_PORT=4181 pnpm --dir gen/front/vue dev

# —— 门（双轨一致性：vm 矩阵 + vue build/e2e + 契约漂移）——
node scripts/gate.mjs

# —— 单门 ——
node tests/vm_matrix.mjs            # vm 六检查 + 结构基线零漂移
pnpm test:e2e                       # vue 六检查（同一检查单）
node scripts/contract-sync.mjs --check   # 契约副本漂移门
```

## 文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 架构定版（SD-01：双轨机制 /
  013 形态消费面 + C-1..C-6 双轨硬约束 / 后端复用 / 测试体系 / 纪律）
- [plans/attachments/081-t00-rulings.md](plans/attachments/081-t00-rulings.md) —
  T-00 三勘定决策档（auto-down PLAN-081 附件；双轨机制 / actions-vue
  现状 / 后端选型）
- [parity-ledger.md](parity-ledger.md) — 双轨差异登记表 v0（九项三分类）

## 计划

PLAN-081（jade-edit-bootstrap）执行中——计划本体与进度记录在
auto-down 主检出 `docs/plans/081-jade-edit-bootstrap.md`（账本所在）。
