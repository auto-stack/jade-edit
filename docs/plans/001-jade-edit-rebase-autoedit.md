---
plan_id: PLAN-001
status: executing
feature_name: jade-edit-rebase-autoedit（jade-edit 换基：以 PLAN-003 交付后的 auto-edit[双轨+front/back] 为基座，code_editor→autodown_editor 组件切换 + back 换 Auto 实现）
author: [zhaopuming]
created_at: 2026-09-20
updated_at: 2026-09-21
plan_revision: 1
current_step: 1
total_steps: 6
supersedes_spec_components: [jade-edit/docs/ARCHITECTURE.md §5 后端复用（R-3 axum 裁定）]
new_spec_components: []
touched_goals: []
---

# [PLAN-001] jade-edit 换基——auto-edit 基座 + 编辑器切换 + Auto back

> 本仓账本首号（jade-edit 独立编号空间；auto-down PLAN-081 为立项档，
> 其附件见 plans/attachments/）。

> 需求来源：用户 2026-09-20 口述——「基于这个版本的 auto-edit（同时支持
> vue/vm），通过切换 editor 组件的方式，实现 jade-edit 的初始版」；
> 「先实现完 auto-edit 之后再来本仓库实现」。
> **前置依赖：D:\autostack\auto-edit PLAN-003（front/back 拆分 + 双轨化）
> 交付**——本计划 T-01 起全部任务以其为基座。

## 0. 变更摘要

| 面 | 内容 |
| --- | --- |
| 换基 | front 面以 PLAN-003 交付后的 auto-edit 为基座：chrome 全套迁入（menubar/toolbar/tab 条/treeview/ctx_menu/console_panel/status_bar/alert-dialog），**编辑器组件 code_editor → autodown_editor 切换** |
| back 换 Auto | 退役外部 jade-garden-back Rust exe 消费（HTTP-always split 遗产配方）→ 自有 `src/back`（api.at 契约 + Auto 实现，wiki 工作区面）；pac 不钉 `api:`，merged=进程内直调、split/vue=HTTP、`--server` 运行期切引擎 |
| 测试/门迁移 | vm_matrix 改 merged 配方（无后端进程臂）；e2e 指向 Auto 后端供给；结构基线 v1 重锁；gate.mjs 契约漂移段退役 |
| 旧面退役 | run-back.mjs / contract-sync.mjs / src/back/api.at 契约副本（GENERATED）删除；PLAN-081 R-3（axux 外部服务器）与 §10 #4（无 menubar 最小面）裁定标记 superseded |
| 文档收口 | ARCHITECTURE SD-01 后端节改写 / README 运行矩阵重写 / PROVENANCE 家族表（auto-edit 先例→基座）/ parity-ledger 复核 |

## 1. 目标

1. **基座迁入**：auto-edit chrome 组件套件 + store 形态入本仓，编辑器切换
   autodown_engine 消费面保持（vm 轨 `autodown_editor` 官方件位 + vue 轨
   npm_deps link 现状不回退）。
2. **Auto back**：`src/back` 实现 wiki 工作区 MVP 环（tree/open/save/reload
   + 工作区根），三形态同绿：merged 直调 / split（AutoVM HTTP）/ vue HTTP。
3. **双轨编辑环全通**：boot → filetree → 打开 `.ad` → 编辑 → 保存 →
   重载可见，六检查同单在 vm/vue 两轨各自可验证。
4. **门体系迁移**：gate.mjs ALL GREEN（vm 矩阵 merged 臂 + vue build +
   vue e2e + 结构基线 v1），契约漂移段由「副本↔源对拍」改为「自有 api.at
   与路由实现一致性检查」或退役（T-00 勘定）。
5. **旧面清零 + 文档收口**：外部 exe 消费链全退役，四份文档与实态一致。

**非目标**：jade-garden 功能池解冻（反链/图谱/检索/agenda/multipart 仍
冻结后续批）；autodown/engine 出口契约变更；auto-edit 仓改动（其文档债
其自理）；a2r rust 引擎深度适配（`--server rust` 仅探针登记，同 PLAN-003
AC-06 口径）。

## 2. 架构方案

```
jade-edit/（换基后）
├── pac.at            # render: ["vm","vue"]；不写 api:；deps(stylekit/bps)+npm_deps(engine) 现状保留
├── src/
│   ├── back/
│   │   ├── api.at    # 自有契约（不再是 GENERATED 副本）：wiki 工作区面
│   │   └── ws.at     # Auto 实现：根解析 + tree/read/write/exists
│   └── front/
│       ├── app.at             # 基座 chrome（menubar/toolbar/tab/ctx_menu/alert）
│       ├── editor_store.at    # auto-edit store 骨架 + autodown_editor 通道融合
│       ├── status_bar.at / console_panel.at / ctx_menu.at / components/…
│       └── （filetree 待澄清①：bps 保位或基座 treeview）
├── tests/            # vm_matrix（merged 臂）+ baseline v1
├── e2e/              # vue playwright（后端供给=AutoVM HTTP，T-00 勘定形态）
└── scripts/gate.mjs  # 四段改造（漂移段退役/替换）
```

- **边界机制**：与 PLAN-003 同源同纪律（`use back.api` 直调；pac 无
  `api:`；`--server` 运行期切）。本仓不复制 auto-edit 的 back 实现，
  按 wiki 工作区域自写（读写的仍是纯文本 `.ad`，无解析面——解析属
  engine/功能池）。
- **编辑器切换**：`code_editor (lang:"auto")` → `autodown_editor (key:,
  final:)`（PLAN-081 T-03 已实证的 VM 件位消费形态）；INPUT_TEXT 回写
  通道与 set_text 根 handler 约律沿现行 editor_store 结论。vue 轨 engine
  stub + api.ts 补丁链（regen-vue.mjs）保留适配。

## 3. 技术栈

同 PLAN-081（AutoUI DSL / auto.exe 双命令 / engine 外部官方组件 / node
门脚本 + playwright），差异仅 back：Rust axum exe 外部消费 → 自有 Auto
src/back（AutoVM 服役，a2r 可选）。

## 4. 需求分析与背景调查

**授权记录**：2026-09-20 用户口述换基需求（见引言）+ 架构改道三裁定
（本次会话实录）：① jade-edit 现行 HTTP-always split 是旧 jade-garden
纯 Vue 时代遗产，非 Auto 原生形态；② back 应改 Auto 写（api.at 边界，
vm merged=直调 / vue=HTTP）；③ pac 不钉 `api:`，服务引擎运行期 `--server`
切换。**起草已授权，执行授权未给，且前置 PLAN-003 未交付前不得进入
T-01+。**允许动作面 = 本仓全部 + 对 auto-edit 只读消费。

**现状实勘**（2026-09-20，本仓 HEAD 7ab3911）：

| # | 事实 | 证据 |
| --- | --- | --- |
| F-1 | back = 外部 Rust exe（auto-down 冻结产物）split HTTP-always：vm 轨 `AUTO_VM_MERGE=0`+`AUTO_BACKEND`；vue 轨 `AUTO_HTTP_PORT` 代理 | scripts/run-back.mjs；docs/README.md 运行矩阵 |
| F-2 | src/back/api.at = GENERATED 契约副本（stub fn `return None`），漂移门 contract-sync.mjs 守源↔副本 | api.at 头注；scripts/contract-sync.mjs |
| F-3 | front 现状 358 行最小面（app.at + editor_store.at），menubar 无（PLAN-081 §10 #4 最小面裁定） | src/front/ |
| F-4 | 双轨门体系在库且绿：gate.mjs 四段（vm 矩阵+基线零漂移 / vue build / vue e2e / 契约漂移）；vm_matrix 7/7；基线 structure-v0 | scripts/gate.mjs；tests/ |
| F-5 | engine 消费面已验证：vm 轨 autodown_editor 件位；vue 轨 npm_deps link + regen-vue.mjs 补丁链（四上游缺口在册） | pac.at；scripts/regen-vue.mjs；parity-ledger D-4 |
| F-6 | auto-edit 基座（PLAN-003 后）= chrome 全套 + src/back（api.at+fs.at）+ render 双轨 + pac 无 api 钉 | 依赖计划交付物 |
| F-7 | `--server`/merged 语义源码级实证（同 PLAN-003 F-9/F-10） | auto-lang main.rs:1002-1025；plan 633 |

**被本计划 supersede 的既有裁定**（保留历史记录，不删档）：
- PLAN-081 T-00 **R-3**（初始版 axux 外部服务器）——bootstrap 期零后端
  工作量捷径，完成历史使命；SD-01 §5 随本计划改写。
- PLAN-081 §10 **#4**（无 menubar 最小面）——基座自带 menubar/toolbar
  面随换基进入，不再沿用最小面约束。

## 5. 详细设计

**back api.at 契约（首版）**：`ws_root/tree/read_text/write_text/exists`
（与 PLAN-003 同形，路由域 /api）；工作区根解析 env 取族形
`AUTO_PROJECT_DIR`（命名从 auto-edit，待澄清③）。测试 fixture 沿用
wiki-demo 隔离拷贝模式（e2e/.runtime/workspace），仅供给方式从 Rust exe
改为 AutoVM/Auto back。

**组件迁移映射**（auto-edit → jade-edit）：

| auto-edit 件 | 落位 | 改造点 |
| --- | --- | --- |
| app.at（actions/menubar/toolbar/tab/alert） | src/front/app.at | code_editor→autodown_editor；tree 数据源接本仓 back；动作集按 `.ad` 域微调（打开过滤 .ad 优先） |
| editor_store.at（497 行骨架） | src/front/editor_store.at | 与现行 store（autodown 通道/INPUT_TEXT/set_text 约律）融合：骨架取基座、编辑器通道取现行 |
| status_bar/console_panel/ctx_menu/components | 同名迁入 | 零或微改 |
| treeview（基座本地件） | 待澄清① | 默认：保本仓 bps filetree（L1 零副本纪律），基座 chrome 适配其回调形 |

**测试/门迁移**：vm_matrix 后端臂改 merged（零后端进程）+ split 臂（AutoVM
HTTP）；基线 structure-v0 → v1 重锁（chrome 面变化必然漂移，首锁即约）；
e2e webServer 段改 Auto 后端供给（形态 T-00 勘定）；gate.mjs 第四段漂移门
退役（api.at 转自有源），或替换为「api.at 契约 ↔ back 路由实现一致性」
内检（T-00 定）。

### T-00 勘定结论（2026-09-21 实勘，四裁定 + 证据改道）

| # | 裁定 | 证据 |
| --- | --- | --- |
| ① vue e2e 后端供给 | `auto run --server vm -B <port>` 独立 serve（不开窗）+ vite `AUTO_HTTP_PORT` 代理；**勿用 `auto run -r vue`**（内置再生成覆盖补件） | PLAN-003 交付 README 运行矩阵（两终端配方实测代理 200） |
| ② 漂移段替代 | **退役**（gate 三段化）：api.at 转自有源后契约与实现同文件同 commit，结构性无漂移可守 | 本节 |
| ③ treeview / env | 树行**保 bps filetree 留根视图**（基座 TreeView 组件对 MCP 快照不可见，矩阵锚需要行级可见）；env = **`JADE_WORKSPACE` 优先 / `AUTO_PROJECT_DIR` 兜底**——待澄清③默认值被实勘推翻：automan.rs:1435 无条件 `set_var("AUTO_PROJECT_DIR", root_dir)`，fixture 隔离不能走它 | auto-edit README「vm 组件边界」②；crates/auto-man/src/automan.rs:1435 |
| ④ merged 臂配方 | `auto run -r vm` + `AUTOUI_MCP_PORT` + `JADE_WORKSPACE=<隔离 fixture>`，零后端进程零 AUTO_BACKEND；split 臂 = `auto run -r vm --no-merge`；workspace belt 改树内容+磁盘断言（Auto back 无 config 文件，exe 旁陈年 config 事故类别结构性消失） | PLAN-003 README split 配方 |

**证据改道（AC-01 注记修订）**：autodown_editor 事件面 = key/content/
final/oninput/on_focus（aura_view_builder.rs:3529-3590 实勘），**无
oncursor / oncontextmenu**——① StatusBar「行:列」光标三元组降级（无锚
事件）；② ctx_menu 组件不迁入（无右键锚点，AC-01 的「ctx_menu」自 v1 面
移出）；③ code_editor_* 剪贴板/undo/fold 族内建不存在 → menubar 编辑项
降级 no-op + console 注记。三项入 parity-ledger（T-05）。

**fs.tree 形状**：`{id,label,children,kind,icon,is_leaf,badge}`、id=相对
路径（vm/native.rs:9771-9789）——bps flatten_tree 直吃，现行 `to_fs_nodes`
转换器退役，`.ft_nodes = json.to_value(tree(...))` 直连。

**执行序调整**：T-02（src/back）先行于 T-01 交付序——front `use
back.api` 需 back 面存在方能 merged 起跑；契约不变，仅落序反转（复审
记录在案）。

**工具链**：auto.exe v0.4.2-1588（2026-09-21 00:55 构建，含上游 669
`#[api]` 实参装配修复——split 带参契约前提；上游 PLAN-670 在跟 a2r 与
code_editor vue 事件缺口，与本计划无阻塞关系）。

### 规范增量

| delta_id | add/modify/retire | target | before/after | rationale | AC |
| --- | --- | --- | --- | --- | --- |
| SD-01 | modify | docs/ARCHITECTURE.md §5 后端复用 | before：外部 axum exe split HTTP-always（R-3）/ after：自有 src/back Auto 实现 + merged 直调 + `--server` 引擎切换 + 三形态语义 | 用户 2026-09-20 改道裁定；HTTP-always=遗产 | AC-02/05 |
| SD-02 | modify | docs/README.md 运行矩阵 | before：run-back 外部 exe 两轨 / after：merged 直跑 + split/vue 后端供给新命令 | 运行面=交付面 | AC-02/03/05 |
| SD-03 | modify | docs/PROVENANCE.md 家族表 | before：auto-edit=栈形态先例 / after：auto-edit=基座（chrome+back 形态来源，PLAN-003/001 双档引用） | 溯源准确 | AC-05 |
| SD-04 | modify | docs/parity-ledger.md | before：D 项按外部 exe 语境 / after：换基后差异复核（增删按实况，D-7 等条目重估） | 差异账本跟实态 | AC-05 |

## 6. 测试设计

- **vm 轨**：vm_matrix 六检查（boot/tree/open/edit/save/reload）双臂——
  merged 臂（无后端进程，直调）+ split 臂（`--server vm`）；结构基线 v1
  首锁后零漂移复跑。
- **vue 轨**：`pnpm build`（vue-tsc+vite）绿 + `pnpm test:e2e` 六检查
  同单（webServer=Auto 后端）。
- **门**：`node scripts/gate.mjs` ALL GREEN（四段改后形态）。
- **静态**：src/front 零 FS IO 内建（同 PLAN-003 口径）；仓内无
  jade-garden-back 路径/JADE_GARDEN_* env 残留（grep）。

## 7. 验收标准

- **AC-01**：基座 chrome 全套在库且 vm 轨可跑——menubar/toolbar/tab 条/
  树/ctx_menu/console/status 可见可用，编辑器为 autodown_editor（非
  code_editor），MCP 快照锚含基座交互面。
- **AC-02**：src/back（Auto）三形态同绿：merged 直调（无独立后端进程）/
  split AutoVM HTTP / `--server rust` 探针登记（不阻塞）。
- **AC-03**：双轨编辑环六检查全通（vm 矩阵 + vue e2e 同单）。
- **AC-04**：gate.mjs ALL GREEN；结构基线 v1 在库且复跑零漂移。
- **AC-05**：旧面清零（run-back.mjs/contract-sync.mjs/GENERATED api.at
  副本删除；grep 无外部 exe/JADE_GARDEN 残留）+ 四文档收口（SD-01..04
  落地，PLAN-081 两裁定 supersede 注记在档）。

## 8. 执行步骤

| ID | 任务 | 依赖 | 影响面 | 产出/意图 | AC | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| T-00 | 勘定：① vue e2e 后端供给形态（AutoVM serve 落位/vite 代理）② 漂移段替代形态（退役 vs 内检）③ treeview 裁定（bps vs 基座件）④ merged 臂矩阵配方——产出决策档补录本档 | **PLAN-003 交付**；零源改动 | docs/plans/ 本档 | 四裁定入档 | AC-02/04 | 决策档复核 |
| T-01 | 基座迁入 + 编辑器切换：auto-edit front 面拷入对齐（含 components）、code_editor→autodown_editor、store 融合（骨架=基座，编辑器通道=现行）；vm merged 跑通编辑环 | T-00 | src/front/*（大改） | 换基面成形 | AC-01 | `auto run -r vm` 手测编辑环 + MCP 快照锚 |
| T-02 | src/back 落成：api.at 自有契约 + ws.at 实现（fixture 隔离沿用）；split 形态实跑 | T-01 | src/back/*（api.at 重写） | Auto back 三形态之二 | AC-02 | merged+split 功能环 |
| T-03 | vue 轨适配：engine link/stub/补丁链保留适配基座新面；`pnpm build` 绿 | T-02 | gen/、scripts/regen-vue.mjs | vue 臂通 | AC-03 | build exit 0 |
| T-04 | 测试/门迁移：vm_matrix 双臂改配方 + 基线 v1 重锁 + e2e webServer 改 Auto 后端 + gate.mjs 改造 | T-03 | tests/、e2e/、scripts/gate.mjs | 门体系换轨 | AC-03/04 | gate ALL GREEN |
| T-05 | 旧面退役 + 文档收口：删 run-back/contract-sync/api.at 副本；SD-01..04 落地；PLAN-081 R-3/#4 supersede 注记 | T-04 | scripts/、docs/ 四件 | 实态=文档 | AC-05 | grep 零残留 + 文档链复查 |

## 9. 复审记录

- 2026-09-20 stage: new / PLAN-001 r1 起草交付评审（原误编 082——沿用了
  auto-down 家族续号，经用户指正改本仓独立编号）。
  outcome: **blocked**（前置 PLAN-003 未交付——依赖序为用户明示裁定）。
  next: 先评审并执行 auto-edit PLAN-003；其交付后本计划 review → work
  （需「开工」授权）。
  备注：supersedes 登记见 §4；结构基线 v0→v1 必然漂移属预期重锁非回退。
- 2026-09-21 stage: work / PLAN-001 r1 / 用户「计划001可以开工」授权
  （前置 auto-edit PLAN-003 已交付 merge，fb68b27 收据四 checkpoint 闭环）。
  outcome: T-00 pass（四勘定全落 §5 T-00 节 + AC-01 证据改道注记 +
  执行序调整 T-02↔T-01）。
  task_ids: T-00 / evidence: PLAN-003 交付面实读（api.at+fsys.at+README
  运行矩阵）、automan.rs:1435、aura_view_builder.rs:3529+、vm/native.rs
  :9771+、auto.exe v0.4.2-1588 / blockers: 无 / next: T-02（src/back
  前置）→ T-01。

## 10. 待澄清事项

1. ~~filetree 取舍~~ → 已裁（T-00 ③）：保 bps filetree 行留根视图。
2. ~~menubar 面确认~~ → 已裁（评审授权随基座进入；换基开工即生效）。
3. ~~工作区根 env 命名~~ → 已裁（T-00 ③）：`JADE_WORKSPACE` 优先 /
   `AUTO_PROJECT_DIR` 兜底（automan 无条件覆盖实勘推翻原默认）。
4. ~~vue e2e 后端供给形态~~ → 已裁（T-00 ①）：`auto run --server vm
   -B <port>` + vite AUTO_HTTP_PORT 代理（PLAN-003 配方复用）。
