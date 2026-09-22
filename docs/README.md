# jade-edit — 知识库方向的 AutoDown 编辑器（独立仓，auto-edit 家族）

> jade-edit：`.ad`（AutoDown/markdown-wiki）文件的桌面编辑器，**AutoUI
> 单工程双轨**首例——同一份 `src/front/*.at` 单源，vm 轨解释渲染（iced
> 原生窗）、vue 轨生成 Vue3+Vite 工程。从初始版起双轨一致性（同日落地，
> gate 双臂同断言域），不再积累组装级差异（旧 jade-garden 的教训）。

## 是什么 / 不是什么

- **产品定位（SD-303，2026-09-22 Q1 裁定）**：jade-edit = **知识库方向**的
  AutoDown 编辑器，与 auto-edit（轻量级编辑器）**长期并存、两套产品**
  ——不做产品合并；组件尽量共用，未来组件插件化时升级为插件级共用；
  家族栈（stylekit/bps/@autodown/engine）维持。裁定全文见
  [ARCHITECTURE.md](ARCHITECTURE.md) §1。
- **北标（SD-405，2026-09-22 用户口述）**：短期对标 **Typora**（编辑
  体验），长期对标 **Obsidian、Notion、飞书**（本地知识库 → 块级协作）。
  Typora 核心差距大头在上游（供料包承载：D-16/D-17/rope delta/D-12），
  本仓落地件 = 快开/大纲等编辑器周边；Notion/飞书远期只记账不动手。
  裁定全文见 [ARCHITECTURE.md](ARCHITECTURE.md) §1。
- **全新应用**（非 examples 拷贝、非旧 jade-garden 迁移）——溯源见
  [PROVENANCE.md](PROVENANCE.md)。
- 旧 `auto-down/jade-garden` = **冻结功能池**——其链接族（反链/图谱/
  检索等）即知识库方向的移植主线，逐步以 AutoUI 组件/BP 形态移植过来
  （首切片 = wikilink 索引 + 反链/出链面板；**第二切片 = 查找面板**
  （SD-401，2026-09-22）：快速打开 Ctrl+P + 全文检索 Ctrl+Shift+F
  双模式；检索 = 冻结池 search.rs Page 面线性化移植，块级/倒排不迁；
  **第三切片 = 悬空建页闭环**（SD-501，2026-09-22）：悬空出链行点击 →
  确认弹层 → 根落位建页 → 开档 + 索引/树刷新——wikilink 读/找/写
  最小环收口；图谱 tab 顺位后移——vm 轨组件面依赖上游），本仓零依赖
  其代码。
- 编辑器内核 = `@autodown/engine`（auto-down，AutoUI 外部官方组件）：
  vue 轨 npm link 消费；vm 轨经 auto-lang `autodown_editor` 官方件位。

## 栈

| 面 | 形态 |
| --- | --- |
| 单源 | AutoUI widget/store DSL（`.at`；038/449 store 形态、013 组件纪律） |
| vm 轨 | `auto run -r vm`（auto-lang exe，解释渲染 iced） |
| vue 轨 | `auto build -r vue`（生成 Vue3+Vite 工程） |
| deps | bps = auto-lang blueprints（filetree）；stylekit = auto-edit specs |
| 后端 | 自有 `src/back`（Auto 写：api.at 契约 + wsys.at 实现；merged=进程内直调 / split·vue=HTTP / `--server` 运行期切引擎——PLAN-001 换基，supersede 外部 exe 复用） |

## 运行矩阵

前置：`auto.exe` 在 PATH 或 `AUTO_EXE` env（须含上游 669 `#[api]` 实参
装配修复 + 671 vue 生成器缺口批——补件链退役面；≥ v0.4.2-1652 构建，
本仓复验版 g055808724）；`pnpm install`（仓根，playwright）。
工作区根：`JADE_WORKSPACE` env（缺席 = AUTO_PROJECT_DIR = 工程目录）。

```sh
# —— vm 轨（默认 merged：back 进程内直调，零后端进程零端口）——
JADE_WORKSPACE=<工作区> auto run -r vm

# —— vm 轨 split（AutoVM HTTP 后端 + 前端窗，HTTP 往返）——
JADE_WORKSPACE=<工作区> auto run -r vm --no-merge

# —— 后端独立 serve（不开窗——vue dev / 联调用）——
node scripts/serve-back.mjs [--port 8211]     # auto run --server vm + 隔离 fixture + ws_root belt

# —— vue 轨（裸 strict 生成+三残余补件+install+build 一键；dev 需代理指向后端）——
pnpm build                          # = node scripts/regen-vue.mjs（补件链已随 671/646 退役）
AUTO_HTTP_PORT=8211 AUTO_FRONT_PORT=4181 pnpm --dir gen/front/vue dev

# —— 门（双轨一致性：vm 双臂矩阵 + vue build/e2e）——
node scripts/gate.mjs

# —— 测量套件（L0 代理：启动分解/首开冷热/换档/大文档/内存；SD-205）——
node tools/bench/bench.mjs check               # 依赖自检 + 环境指纹（工具链 ≥1652）
node tools/bench/bench.mjs proxy [--runs N]    # 测量 → results/<ts>.jsonl
node tools/bench/bench.mjs assert              # 存量 measurements × budgets 重评

# —— 单门 ——
node tests/vm_matrix.mjs            # 双臂（merged+split）检查单 + 基线 v5 零漂移
pnpm test:e2e                       # vue 检查单（同一检查单；serve-back 后端）
```

## Tests（判绿口径，SD-204；SD-304/403 扩定；SD-503 再扩定）

检查单（PLAN-002 T-01 扩定 + PLAN-003 T-04 link 扩单 + PLAN-004 T-04
find 扩单 + PLAN-005 T-04 create 扩单）：`boot / tree / open / edit /
save / reload` 六检查 + **tab / editops / quit** 扩单三组 + **link /
link-empty**（链接索引已知答案 + 反链面板双轨可用 + 空态——CJK 路径
导航子步仅 vm merged 臂，D-19）+ **create**（建页弧线子步 10c：悬空行
点击 → 确认弹层 → 取消零落盘 → 创建 → 落盘/链接翻转/树新行/行翻转——
CJK 开档播种子步仅 vm merged 臂[D-19 同款口径]；e2e 弧线 = ASCII 悬空
源档测试内造零语料改动）+ **find**（查找面板双模式：快开[files]——
input 锚/空 q 全量 5 行/过滤 Pro→Projects 独行/CJK 文件名定理→CAP
独行/拾取即关；全文检索[text]——未运行提示/CJK 查询「任务列表」**POST
双臂**[D-19 面无]/行导航面板保持开/运行后空态；CJK 文件名拾取导航子步
仅 vm merged 臂——D-19 同款口径）——vm 矩阵与 vue e2e 同单（断言域 =
结构/文本/磁盘字节，非像素）。

- **完成态 = RESULT 行出现且两臂全数通过**：vm 矩阵 `merged 13/13 +
  split 12/12`（merged 多一项基线检查）+ ALL GREEN 行；vue e2e 十二段
  日志齐 + passed。无 RESULT 行 = 工具链竞态早崩 → **重跑一次而非排查**
  （auto-edit F-RV6 同款口径）。
- N 定谳（2026-09-22 link 扩单首锁 ≥5 连跑分布）：vm 双臂 **6/7 连跑
  全绿**（12+11 检查逐跑全过；1 次无 RESULT 行早崩，重跑即绿——F-R1
  同类口径）；vue e2e **5/5 连跑全绿**（注：紧邻 `pnpm build` 的同负载
  窗内竞态敏感——regen 后即跑属已知敏感窗，README 口径覆盖）。
  N = 全数，无失败集漂移。
- N 定谳（2026-09-22 find 扩单首锁，SD-403）：vm 双臂 **4/4 连跑全绿**
  （13+12 检查逐跑全过，零早崩零重试）；vue e2e **6/6 连跑全绿**
  （gate 内 1 + 复跑 1 + 留存连跑 4，14 PASS 行/跑；search_wiki POST
  200 实录）；D-21 负载窗零复现。N = 全数，无失败集漂移。
- N 定谳（2026-09-22 create 扩单首锁，SD-503）：vm 双臂 **4 连跑全绿**
  （v5 锁后 full run ×3 + gate 内 ×1，merged 13/13 + split 12/12 +
  基线 v5 零漂移逐跑）；vue e2e **6/6 连跑全绿**（gate 内 1 + 留存
  连跑 5，10c 建页弧线全过）；D-21 负载窗 **7 失败实录**（家族会话
  同机并行窗——write_wiki 保存点 400 丢参，重跑即绿，ledger v8 扩记）。
  N = 全数，无失败集漂移。
- 结构基线 = `tests/baseline/structure-v5.txt`：state 段逐字节 +
  snapshot vnode id 出现序列（v2 仪器延续；v5 = PLAN-005 store
  create_confirm_open/create_target 入 dump + 悬空行 button 化 +
  alert-dialog 第三实例（建页确认，快照恒渲染）id 序列的计划内重锁，
  v4/v3/v2/v1/v0 留档）。

## 文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 架构定版（SD-01：双轨机制 /
  013 形态消费面 + C-1..C-6 双轨硬约束 / 后端复用 / 测试体系 / 纪律）
- [plans/attachments/081-t00-rulings.md](plans/attachments/081-t00-rulings.md) —
  T-00 三勘定决策档（auto-down PLAN-081 附件；双轨机制 / actions-vue
  现状 / 后端选型）
- [parity-ledger.md](parity-ledger.md) — 双轨差异登记表 v8（SD-504 指针；二十三项三分类；PLAN-005 增补 D-23 + D-21 负载窗扩记）
- [upstream/2026-09-jade-supply.md](upstream/2026-09-jade-supply.md) —
  上游供料包（D-16 预热 / D-15 残余 / D-17 键入发射 / D-18 投影双态，
  期望形态+复验条件+回执方式）

## 计划

PLAN-081（bootstrap）+ PLAN-001（换基自有 back）已交付归档——后者见
[plans/archived/001-jade-edit-rebase-autoedit.md](plans/archived/001-jade-edit-rebase-autoedit.md)；
PLAN-081 本体在 auto-down 主检出 `docs/plans/081-jade-edit-bootstrap.md`。
