---
plan_id: PLAN-039
status: executing
feature_name: v0.1.0 源码试用里程碑发布收口（配合 auto-lang v0.5）
author: [agent]
created_at: 2026-10-09T02:44:08Z
updated_at: 2026-10-09T08:30:00Z
plan_revision: 1
current_step: 2
total_steps: 5
supersedes_spec_components:
  - docs/specs/editor-host-capabilities.md
new_spec_components:
  - docs/specs/release-readiness.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md 发布收口
  - docs/analysis/2026-10-09-v05-release-convergence.md
  - docs/RELEASE.md v0.1.0 源码试用里程碑
---

# PLAN-039：v0.1.0 源码试用里程碑发布收口

## 0. 变更摘要

PLAN-038 已在 `80eeea674a0c460856ff5ac4374f1e2ea6a2f78a` 归档为 archived/delivered，revision 2，5/5；reviewed_commit=`64e1a15`，复审 `1bde7a0` → 账本 `1c025ed` → 归档 `80eeea6`。本计划以此为本轮功能截止点，兑现用户“较大改进延后、配合母工程 auto-lang v0.5 快速收敛”的要求。

沿用 PLAN-029 的 Jade v0.1.0 **Windows 源码试用里程碑**，在原生 VM merged 与 Vue 集成路径上完成基础使用验收、必要的最小修复、可复现依赖冻结、回归、指南与真实素材。保留 P≤200 / depth 8 的既有试用边界，版本号不随母工程改成 0.5。发布资料必须说明需要工具链和兄弟仓，不承诺独立安装包或单独静态 dist 可运行。

交付目标为 Jade 可复审的候选及联合发布资料包，不在本计划中修改兄弟仓、打 tag、推送 release 或部署 website。现有用户试用确认及母工程联合发布门禁独立保留。不能将“准备完成”“Jade 验收通过”和“已经发布”混成一个状态。

## 1. 目标

- G-01：冻结 030..038 已交付功能，暂缓 R-05b 及其他大改造；只修复声明范围内的基本使用、数据安全或发行复现阻碍。
- G-02：在两个现行交付形态验证“指定工作区 → 新建／打开 → 输入 → 保存 → 查找／链接导航 → 重启读回”及取消、脏页、草稿和删除恢复。
- G-03：明确处置空正文输入 B-7、引擎 Save 假入口及依赖来源问题，不以旧 nonblocking 标记直接放行。
- G-04：用可获取、可重建的冻结依赖完成最终验证，提交带版本、形态、运行条件和真实证据的发布材料。
- G-05：形成与母工程 R-03/R-04 对接的资料包，分列 Jade readiness、用户试用确认、母工程候选和公开发布状态。

**非目标**：侧栏重排、完整命令桥、实时链接解析、caret/reveal、大纲/图谱、自动保存/版本历史、运行中切库、安装包、跨平台、Musk plan/spec/wiki 工作台、在线应用体验。不上调工作区规模；不直接手改 gen/；不做未经身份核验的 @save 接线；不重写 029/038 归档历史。

**成功样**：接收者按 PowerShell 指南获取冻结版本，在与开发机绝对路径不同的干净目录启动自己的工作区副本；两个形态均完成基础写作及保护验收。全部本仓要求有绑定证据，用户确认／外部发布门保持真实状态，必要资料足以交给母工程完成联合发布验收。

## 2. 架构方案

### 2.1 基线与五个收口任务

T-01 冻结功能范围并调查阻碍 → T-02 完成必要的本仓最小修复及依赖／构建准备 → T-03 在最终候选上回归与试用 → T-04 更新发行资料与素材 → T-05 收据校验、Spec 交接与独立复审交接。

T-01 的有界原型用于选择可证实的修复，不先发明公共接口。T-02 只允许本仓等价修复、已真实供给的接口消费或保持现有协议的宿主降级。上游修复、降低双轨支持承诺或改变 AC 必须先修订契约，不能在执行中暗改。T-04 纯文案可提前准备，最终版本与图片以 T-03 候选为准。

### 2.2 支持形态与门禁

| 形态 | 本计划角色 | 完成门 |
| --- | --- | --- |
| `auto run -r vm` 原生 merged | 主交付形态 | 真 UI 基础输入／保存／重启、vm_matrix merged 与保护探针通过 |
| `auto run -r vue --server vm -B 8211 -F 4443` | 现行第二交付形态 | 集成命令实走、基本编辑与保存通过；Vue 生成／构建和完整 e2e 通过 |
| Vue e2e 的 serve-back + Vite | 验证载体 | 与真实工作区集成路径分开留证，fixture 测试不代替发行启动 |
| 原生 `--no-merge` | 开发／补充诊断路径 | 记录实际结果，不要求以它证明上述两形态；不能把所有 HTTP 后端统称为不支持 |
| 单独 Vue dist 静态 serve | 非独立发行形态 | 构建与新鲜度验证；未验证 API 路由前不提供独立运行承诺 |

现行 editor-host-capabilities §1.3 已记 split boot 恢复、链接消费未联验；旧 RELEASE.md 和部分 Specs 仍保留历史 boot 失败描述。T-01/T-03 据具体载体和用例刷新发行口径，不宣称 split 所有能力恢复。

### 2.3 收口状态

- `preparation_only`：当前 dirty 工具链或尚未冻结的依赖只支持准备证据，不能称最终 RC。
- `jade_ready`：本计划基础行为、修复、冻结依赖与回归均通过；无需把母工程全部门禁完成算成本仓验收。
- `blocked`：本仓基础行为或候选来源未达标，列出 owner、复现、所需供给及重入条件；不能作为 execution_done 的成功替代。
- `publish_ready`：另需真实用户试用确认、独立复审／交付及母工程联合发布门完成。其 pending 不被隐瞒，但本计划不代执行外部发布。

若双轨基础门需要大改，本计划保留已完成成果并报告 needs_replan／供给 blocker；提出“只发布已验证形态／另一形态受限预览”的具体修订，由用户决定，不自动减少 AC 使计划通过。

## 3. 技术栈

- 单源 AutoUI：`src/front/app.at`、`src/front/editor_store.at`、必要的新宿主辅助 widget；后端 `src/back/api.at` / `wsys.at` 保持保存与工作区协议。
- 冻结配置：`pac.at`、`package.json` / lockfile、`scripts/regen-vue.mjs`。gen/front/vue 为生成物，修复落源文件或已有生成配方，不维护独立 Vue 产品实现。
- 验证复用：`tests/vm_matrix.mjs`、`tests/draft_recovery_matrix.mjs`、现有 probe 家族、完整 Playwright e2e；新增的发行缺口测试只覆盖原测试未能证明的行为。
- 新持久产物：`docs/releases/v0.1.0-rc/manifest.json`、`readiness.md`、`validation.md`、`trial-guide.md`、`screenshots/`、`checksums.sha256`；新增门禁 Spec `docs/specs/release-readiness.md`。日志可落忽略目录，但结论、命令、计数、指纹和关键证据须进入上述可复审文档。

## 4. 需求分析与背景调查

### 4.1 授权和执行范围

用户已确认发布收敛建议，要求“038 已经 merge，根据建议写一个收敛计划”。本次权限为制定契约；后续 work 范围拟定为 jade-edit 本仓必要修复、测试、发布文档和资料准备。兄弟仓仅只读调查／消费已交付供给，不修改其产品源码、版本、网站或发布清单。打 tag、对外发布和部署不在本计划执行任务内。

无用户指定日期、token 预算或自动续跑限制，不发明。当前主检出有本会话上轮留下的路线图与收敛建议文档改动，038 合入已明确排除它们；保留并纳入本次规划，不称整个工作树干净。未发现本仓或祖先 AGENTS.md；实施隔离按 auto-plan-work 和实际 worktree 依赖布局处理，避免同一主检出多个写者。

### 4.2 当前版本与证据

| 对象 | 规划时事实／指纹 | 收口含义 |
| --- | --- | --- |
| Jade | main `80eeea674a0c460856ff5ac4374f1e2ea6a2f78a` | 038 已合入；活跃 Plan 无匹配发布收口件；029 已归档，不重开 |
| 038 归档文件 | SHA256 `D162530226DAA9D0BED869C8D4DF06AE72F810FEC89DBC022C5D37BD424A8DE5` | 独立复跑回执全绿；F-038-R1 键程边界、R2 负载时序 finding 保留 |
| RELEASE.md | SHA256 `669BD406CC0C3C0586A3A92175F2AE3205FE6E282EFE72103673ABFD65DF77B8` | v20、旧工具链下限和 001..028 摘要过时；用户试用仍待确认 |
| auto-lang 源 HEAD | `590cc247def4bd7839f5173c2c14e46c1ba669dc` | 有其他会话未跟踪文件，不清理；不是本计划已冻结版本 |
| 实际 auto.exe | `auto 0.1.0+v0.4.2-2730-g91ae002d3-dirty`；SHA256 `1DAE8B494A045A6409E2B03B7C09AD8D6F3C5BFDAD09F82347D947FDC42339E3` | binary 不等于当前源码 HEAD；只用于准备，最终需可获取／重建的 v0.5 候选 |
| auto-down HEAD | `895f8d0f9355c9f5ec3ce8fca268bdb768395846`，调查时 clean | 空正文、动作栏供给边界与先前复核一致；最终 engine dist 另验新鲜度和 hash |
| auto-edit HEAD | `f9ae2a64361f74ad8565fc5df5c4a9aeb5fc10f2`，调查时 clean | stylekit 相对依赖必须包含在获取指南 |
| 本机 Node / pnpm | v25.2.1 / 11.6.0 | 是调查环境，不能未经候选实测扩写为通用最低版本 |
| 母工程收口清单 | `../auto-lang/docs/plans/v05-release-closeout.md`；SHA256 `D7C220E5BE57DF367753B416D8BD16E16EE888E13838F28DF3B27B2E6BCC6CDB` | 本地未跟踪的跨仓跟踪文件；作为用户发布要求依据，不伪称已交付 canonical Spec |

母工程顺序为应用收口 → website 准备 → RC 冻结 → 最终素材／版本／下载入口验收 → 联合发布。Jade 资料包对接该清单，不勾选母工程事项；website v0.5 为静态介绍和真实图，在线应用体验为后续范围。

### 4.3 权威规范与观察底座

| 规范／代码 | 本计划继承的规则 | SHA256（规范） |
| --- | --- | --- |
| editor-safety.md | 重载取消不动正文／磁盘；空文是合法读回，不能以空串判失败 | `2CD7BB0A5D2F1D6D4BF56A7B616FD1CEC164054E30C3A4AB0A9960AF786D0051` |
| draft-recovery.md | 身份／修订检查点、保存读回、晚输入保持 dirty；不承诺浏览器原生关闭拦截或断电保证 | `41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7` |
| document-lifecycle.md | 十类应用内操作受检、真实回执、失败／晚输入保护；F-32-R1/R2 单列 | `C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF` |
| editor-host-capabilities.md | 保存必须核源、走共门；show-actions 当前不是有效控制 prop | `C905B1C9EDA4C03A6052BD2EB25D963AFF5D697B76D3C7E0479239ECB57D2215` |
| editor-command-availability.md | 不恢复六假菜单或截获 Ctrl+Z/Y/A；内部快捷键与宿主桥区分 | `0E4B75F31678B860A3F9CEDEE94357A2A3DF0A9D83BC7FA9C8FAD1E297C67456` |
| wiki-link-navigation.md | 导航票据、内存脏目标优先、缺页确认、开页不等于锚定位 | `42C6237BA87F722DFBB707319614841CB71F99C9A114C1D17459BC3A0067483D` |
| name-search.md | 名称五域匹配与实际 path 消歧；P≤200 / depth 8 边界不扩大 | `79D6CB18A4495F0744FBFD2B744E4EAE63E481648EDA09D980887E8A055D65E7` |
| quick-open.md | 三入口、查询独立、成功回执后关闭；VM Escape／Tab 分列 | `20A54201F9C35B8DA7E32C2C70257AB401CCB47C9B9BF49D515A180F17A6F140` |

代码观察：app.at 的 autodown_editor 目前仅消费 content/oninput/open-wiki-link，未接 @save；ActSave 进入 store.Save。wsys.create_page_impl 落 `# 标题\n\n`，不能将 B-7 表述为全部新建页不能写。上游 EngineEditor.vue 在 views 为空时无正文块，Save 钮无条件渲染。regen-vue 读取 AUTO_EXE、JADE_EDIT_ENGINE_ROOT；serve-back 托管并重置测试 workspace，不适用于真实库。pac.at 的 engine link 基于 gen/front/vue 相对位置，工作树和干净环境都须验证。

## 5. 详细设计

### 5.1 范围冻结与缺口裁定

`readiness.md` 列出能力、形态、版本、复现步骤、用户影响、处置、owner、重入条件。数据丢失／串档／虚假保存成功、无法启动声明形态、基本写作路径失败均为阻断。仪器限制、已有安全拒绝与可解释的功能限制独立分类，不能只凭 probe exit 0 认为产品可用。

先核验以下真实场景，每个问题一次最小原型加一次复测；仍缺必要接口就写 blocker，不无限延伸为底座项目：

1. **空正文**：新建标题模板输入、打开空 `.ad`、清空全文后再次输入、保存空正文后重启再输入，逐步核 body、dirty 与磁盘。允许研究宿主空态输入替代，但不得把空文自动落盘为 `#` 或空格，不新增第二份正文权威，不规避检查点／保存／导航门；挂载／输入来源必须可核。需要修改引擎则登记 auto-down 供给，另仓另立。
2. **Save**：盘点可见入口。优先保持三个宿主真实保存入口；若无可靠事件身份，不接 emit(md)+active_key。可选本仓已验证的隐藏／禁用／清楚标为不可用并指出工具栏保存的呈现，必须实际生效且无需开发者知识。仅声明 show-actions=false 或在发行说明角落提示不算修复。涉及宿主可见降级而非上游能力变化，须在 Spec 中区分。
3. **快捷键／点击边界**：复核 VM Escape／Tab、Vue Shift 组合键、块边界链接点击。验证取消钮及菜单／鼠标替代确实可达；不承诺全部键盘等价或实时解析／锚定位。
4. **生命周期与退出**：F-32-R1/R2、Vue 退出 no-op、原生检查点仪器楔死分别实测归因；安全拒绝可以公开说明，静默丢输入或误写不允许发布。

### 5.2 最小修复约束

T-01 产出选择说明及原型证据，T-02 只落已验证且满足原 AC 的本仓方案；具体路径、事件和回执记录在该说明。沿用现有 .Edit／store.Save／检查点／源票据等语义，不引入独立写盘口、DOM 私有实例或未经身份门的编辑器事件。必要测试补进真实用户入口；旧能力库存测试需据实际呈现更新，不能保留“假按钮依旧存在”为成功期望。

若最终采用新公共接口、改变支持形态、需要跨仓写入、改变空文／草稿身份或保存协议，先修订 plan_revision 和对应 SD／AC，并重新处理依赖授权。本节不能被解释为授权实施未知上游修复。

### 5.3 可复现候选与资料格式

`manifest.json` 至少含：plan_id/revision、Jade source_commit 与发布资料 commit、各依赖 source_commit、工具链实际版本／SHA256／获取或重建记录、engine dist SHA256 与 freshness 结果、Node/pnpm、平台、支持形态、构建命令、工件及 checksum、验证回执指针、真实图来源、用户试用和外部门禁状态。字段未知写 null/pending，不能用当前 HEAD 猜 binary 来源。

冻结依赖可来自母工程维护者提供的 RC 或可复建的洁净提交；记录输入而不要求本仓替母工程构建全生态。dirty 调查版不得作为最终发布候选。若不同验证需 debug 与发布载体，分别记录对应版本和 hash；debug 仪器证据不替代用户路径在最终发行工具链上的实走。

在另一绝对路径下保持指南声明的兄弟仓结构；设置 AUTO_EXE、JADE_EDIT_ENGINE_ROOT、JADE_FIXTURE 等当前已有覆盖口，不新增“无需家族仓”承诺。fixture 获取／生成必须写清来源；不能依赖开发机未跟踪的 wiki-demo 或 .runtime 文件。

源码里程碑提供可获取的冻结源码入口／版本清单，校验真正随资料交付的文件。Vue dist 仅附构建产物性质；不以本计划扩展安装器、打包协议或独立静态部署。manifest／收据不自引用自身 checksum；SHA256 文件校验截图及实际交付工件，源码以 commit 和来源绑定。

### 5.4 文档、素材与外部交接

更新 RELEASE.md：移除旧“仅剩用户确认即可发布”的现势误导，保留历史 029 回执；以本候选的门禁、版本、030..038 用户结果和边界替代 v20／旧统计。提供 PowerShell 命令和真实库路径，解释 Vue 集成形与测试形差异，菜单替代失效快捷键，不把刚键入的链接描述为已实时转换。

`trial-guide.md` 是可执行走查清单，含正常／异常场景和回执位。T-03 的代理／工程验收不代填 RELEASE.md 的用户真实试用确认。用户确认可独立待办，准备工作不中断；发布前必须收到，缺失时 publish_ready=false。

至少准备原生与 Vue 各一张最终候选真实主界面图，另留快开／安全保护的实际交互证据；图片逐件带 source_commit、工具链 hash、形态、日期、尺寸和语料说明。只用经允许的示例或脱敏工作区，不传播私人库内容。不能用旧 Jade Garden 图片或模拟截图替代。新捕获能力不足登记证据缺口；不伪造图片。

对母工程提供资料包与验收映射，不直接写 website 或发送其他会话消息。最终公开下载／网站发布入口由联合发布流程实际验证，本计划只交付真实可获取的候选来源与明确交接动作，不虚构未来 URL。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/release-readiness.md | 无当前发布门禁 Spec → v0.1.0 源码试用范围、双形态、基本使用／数据安全门、准备／本仓就绪／公开发布状态分列 | 固定收敛边界，避免重新扩张产品范围 | AC-01/02/03/04/10 |
| SD-02 | add | docs/specs/release-readiness.md | 历史回执和依赖路径散落 → 候选版本与工件指纹、freshness、干净环境实走、证据失效和重验规则 | 本机成功可交接和复现 | AC-05/06/07/09 |
| SD-03 | modify | docs/specs/editor-host-capabilities.md | Vue 引擎 Save 未接线的现行呈现 → 按 T-01/T-02 已验证修复记录宿主呈现、保存入口与版本；未供给身份／showActions 的上游结论仍真实分列 | 如实消除假入口，不把宿主降级冒称组件供给 | AC-03/04 |
| SD-04 | add | docs/specs/release-readiness.md | 无收口期空文输入判据 → 空 `.ad` 与清空后重输入必须实证；若采用宿主替代，注明形态、来源门和零磁盘污染；原空文合法语义保持 | 将基本写作与展示性功能区分 | AC-02/04 |
| SD-05 | add | docs/specs/release-readiness.md | 029 用户试用与母工程门未集中 → 用户确认单列、受限形态不得无修订降级、独立复审／联合发布先于公开承诺 | 不把 readiness 当已发布，不静默降低 AC | AC-08/09/10 |

以上为提议，planning 不写 canonical。输入／保存／导航的已有八项 Specs 不因发布收口下调；如原型揭示额外规范影响，先记录并修订契约，再实施。

## 6. 测试设计

### 6.1 候选准备与命令

下面命令均在 Jade 验证检出执行；T-02 先设置实际候选路径，用户源码启动指南经 T-03 实走后才定稿。PowerShell 调用外部程序逐项检查 `$LASTEXITCODE`，不能以最后一项成功掩盖前项失败。

```powershell
$env:AUTO_EXE = '<冻结工具链的绝对路径>/auto.exe'
$env:JADE_EDIT_ENGINE_ROOT = '<冻结 auto-down>/autodown/packages/engine'
$env:JADE_FIXTURE = '<已说明来源的测试知识库副本>'
& $env:AUTO_EXE --version
Get-FileHash -LiteralPath $env:AUTO_EXE -Algorithm SHA256
node "$env:JADE_EDIT_ENGINE_ROOT/scripts/assert-dist-fresh.mjs"
pnpm install
pnpm build
node tests/vm_matrix.mjs --arm merged
pnpm test:e2e
node tests/draft_recovery_matrix.mjs
node tests/probe_quick_open.mjs --phase t1
node tests/probe_quick_open.mjs --phase prod
node tests/probe_editor_host.mjs --phase all
node tests/probe_native_wiki_link.mjs --phase all
git diff --check
```

预期：生成／类型／Vite 构建成功、merged 产品矩阵和完整 e2e 无未处置回归、草稿重启矩阵通过；探针按能力分类，无未经说明的 FAIL，BLOCKED／unsupported 不计为功能成功。T-03 同时串行执行其余现存 `tests/probe_*.mjs`（排除已单列件），包括名称、协议、生命周期、文件管理、属性等原发布面；逐脚本检查退出码、结果分类和来源。probe_mtime 按 D-41 的 debug 路由留证，发布载体挂起单列，不无限等待。测试过程中不手改 assertions 让失败消失。

`node tests/vm_matrix.mjs --arm split` 单独诊断并记录，避免 `scripts/gate.mjs` 默认 all 短路而漏跑 Vue；不将原生 split 的失败掩盖为双轨全部全绿。历史缺陷须按同版本对照／复现证明归因；038 R2 的负载时序红只在隔离复跑、产物指纹一致和原因记录齐备后判环境问题，不无限重试。

`auto run -r vue` 会覆盖部分生成文件，集成冒烟后重跑 pnpm build 再跑 e2e；最终记录每次形态和 dist 指纹，不把集成启动输出与补件后测试产物混称同一物。toolchain/engine/产品源码变化使相关证据 stale，重建并重验两支持形态；纯发布文案变更只核对应链接／事实／工件映射。

### 6.2 必须补证的产品场景

新增 `e2e/release-readiness.spec.ts`（必要时对应 `tests/probe_release_readiness.mjs`，均为新件）只验证旧套件未覆盖的空文输入／清空重输入、全部可见保存入口和本次最小修复阴性；源码类型检查或直接向 Store 注入正文不能代替真实编辑入口证据。原生键程仪器不足则记录可复现真实交互方式／截图与磁盘对读；不能凭“不可合成”判产品通过。

| 场景 | 期望／证据 |
| --- | --- |
| 指定库启动，新建标题页、空页、清空后重输入 | 两形态能真实输入；非空提交正文持久化；未编辑的空文件保持原字节 |
| 三宿主保存入口、引擎动作栏及切档等待窗 | 支持入口正确落盘／dirty 终态；不可用入口清楚呈现；不同页不串写，较新输入保留 |
| 中文／别名／同名双路径、正文内链、快开取消 | 名称及导航身份正确、取消与失败不动磁盘／dirty；锚点仍如实说明不定位 |
| 脏页重载取消、草稿恢复、删除／恢复、未知回执 | 沿现行 Specs 验证正文与磁盘，安全拒绝可见；零静默丢失／虚假成功 |
| 退出和重启 | 原生实际退出再启动，Vue 按其真实终止方式重启；保存内容和最近记录正确，不宣传 Vue Process.exit no-op 为关窗成功 |
| 150 页和接近 200 页语料 | 目录、中文页、链接、名称／全文结果已知答案一致；>200 警示保留，无大库承诺 |

bench150 旧入口为忽略目录 `e2e/.runtime/p21-bench150.mjs`，不可作为唯一发行依赖。T-02 检查并将必要的可复现语料／性能脚本纳入持久测试路径（新 `tests/bench_release_150.mjs`），或复用持久测试中等价面并记录方法；保留 029 已验收的 tags_index ≤1.5s 门，其他时间作同环境观察不发明硬门。不得将旧 runtime 文件默认存在写入干净环境指南。

完整回归一次按序运行，修复后重跑受影响面；依赖／源码改变需要重新绑定候选证据。无需为文档格式另跑整个母工程 Rust 测试；不并发占用同一 fixture／端口或启动多个重型回归实例。

## 7. 验收标准

| ID | 可观察完成标准 | 验证方法／预期 |
| --- | --- | --- |
| AC-01 | 038 已交付基线、版本和功能截止点在案，后续大改造明确延后 | 核对归档链、manifest、readiness 和路线图；无重新实施 038 或扩展 R-05b |
| AC-02 | 两支持形态完成模板建页、空页与清空后输入／保存／重启 | 真 UI 走查＋新缺口测试＋磁盘正文对读；未编辑空文零填充，输入可保存且不丢 |
| AC-03 | 每个可见 Save 入口支持且真落盘，或清楚呈现不可用及实际替代；无虚假成功 | 正文标记、写盘／读回／dirty 与切档阴性；不按 md+active_key 判源，不绕过 store.Save |
| AC-04 | 修复保持现行八项 Specs 的身份／取消／迟到／数据保护不变量 | 受影响 e2e 与 probe 对读正文、磁盘、草稿及投影；无支持阈值降级，SD-03/04 与实际一致 |
| AC-05 | 最终候选依赖可获取／重建且工具链、源提交、engine dist 可核对 | manifest、SHA256、freshness 和构建记录；无 dirty 调查版冒充最终候选 |
| AC-06 | 干净新路径按 PowerShell 指南启动真实工作区副本，两形态基本闭环完成 | 获取／构建／启动逐条实走、真实 ws_root；无开发机绝对路径或 runtime 私有文件依赖 |
| AC-07 | 支持范围完整回归、补充 probe／split、规模和性能记录齐备 | validation.md 逐件计数／状态／版本／命令；新红归因处理；unsupported 单列；150/近200 已知答案与性能门通过 |
| AC-08 | 代理试用与用户真实试用确认分列，确认缺失时不得公开就绪 | trial-guide、试用回执来源／日期／版本；用户待确认可保留 pending，不能代填或宣称 publish_ready |
| AC-09 | 当前发行说明、指南、来源入口、候选真实图与校验文件一致，供母工程复核 | 030..038 摘要／菜单与快捷键／退出边界准确；两形态真实图可追溯、无假图／死链接／预测 URL |
| AC-10 | 新 Spec 与 SD、最终收据、外部门状态和独立复审交接形成完整可追踪材料 | 五 SD 对读；jade_ready 可由本仓证据判断，publish_ready 保留用户／母工程门；tag、发布、上游写面零执行 |

AC-08 允许“真实用户确认 pending”的**资料准备交付**，不豁免发布条件；AC-05 的最终候选来源和 AC-02/03 的基本行为不能以 pending 达成。如果外部 RC 尚未提供，仅前期工作可继续，不能执行完成标记为最终就绪。

## 8. 执行步骤

| 任务 | 依赖与范围 | 操作和交付 | 关联 AC／SD | 验证与预期 |
| --- | --- | --- | --- | --- |
| T-01 范围／缺口裁定 | 无；只读基线＋隔离原型 | 核对 038 merge；创建 readiness.md；冻结双形态／功能池；真实复现空文、Save、键程、退出、生命周期边界，产出一次原型＋复测的方案／blocker；不提前修改上游 | AC-01/02/03/04；SD-01/03/04 | probe_editor_host --phase all、现有相关 e2e、原型磁盘对读；每项有影响／owner／下一动作，能决定 T-02 的等价最小方案 |
| T-02 最小修复与候选准备 | T-01；Jade 本仓源码／生成配方／必要测试；候选输入可后补 | 实施已验证的本仓小修复；保存来源及空文身份共门；新增缺口测试和必要持久性能入口；冻结兄弟仓／引擎／工具链记录，准备新路径环境及 manifest | AC-02/03/04/05/06；SD-02/03/04 | pnpm build、补证测试、相关 Specs 定向保护测试、freshness；真实行为与盘面正确；缺公共供给写阻碍，变兼容／跨仓范围先 replan |
| T-03 最终候选回归与试用 | T-02 修复＋可复建最终候选 | 串行运行 §6 支持范围完整门及补充诊断；在干净新路径按指南启动真实库副本，双形态编辑保存／保护／退出重启；150/近200；形成 validation.md 和代理试用记录 | AC-02..08；SD-01/02/04/05 | 各外部命令检查退出码和分类；计数按实录不预设；未处理阻断零项；不能用当前 dirty 成功替代 |
| T-04 文档与真实素材 | 正文草案可提前；最终版本／图片依赖 T-03 | 更新 RELEASE.md、README、路线图及收敛建议的当前状态；trial-guide、版本／获取／启动指南、两轨截图、checksum 与母工程交接表；用户确认独立留位 | AC-01/06/08/09；SD-01/02/05 | 图文与最终候选／实际菜单匹配；本地相对链接、公开来源及 SHA256 核对；无工作流大改造和虚构最终下载地址 |
| T-05 收据／规范与复审交接 | T-01..04 | 落拟议 release-readiness Spec，按真实修复刷新 editor-host-capabilities；形成最终 manifest/readiness 与证据索引；核源码／产物指纹并提交独立 auto-plan-review；记录用户／母工程／实际发布门状态 | AC-01..10；SD-01..05 | git diff --check，十 AC／五 SD 与回执一一对应；独立复审另执行，本任务不自判 review pass；如仍阻断保持未完成并指出重入条件 |

进度：2/5（T-03/T-04/T-05 各完成 preparation 面；最终收口件受 §10 D-01/D-03 门）。T-01 [✅]；T-02 [✅]；T-03 [~]（本仓可跑门全绿：vm_matrix merged 20/20、e2e 全套件隔离全绿、probe 家族 19 件全绿+3 件环境事件失效待静默补跑、bench150 全绿含 tags 244ms 门、draft 矩阵全绿、mtime debug 路由全绿、split 诊断两轮实录——**最终候选回归与干净路径实走受 D-01 冻结门**）；T-04 [~]（RELEASE/trial-guide/readiness/validation/manifest/checksums/sample-workspace/三张真实截图已落——**最终版本与图片以 D-01 候选为准重采回填**）；T-05 [~]（release-readiness Spec 新建＋editor-host-capabilities §1.1/§2.6 SD-03 刷新已落 main——最终 manifest 收口与独立复审交接受 D-01 门）。

**复审／交付后出口**：本计划交付就绪资料后，由用户试用确认与母工程联合发布流程处理 tag／对外发布。发布工具链或产品输入变化必须更新 manifest 并重验受影响证据；仅 ledger／归档簿记后代需证明代码与工件恒等并记录 provenance，不伪写旧回执绑定到新代码。用户试用、最终 RC 供给缺失是明确下一动作，不能无限开新功能 Plan 等待。

## 9. 复审记录

- 2026-10-09T02:44:08Z：stage: new | plan_id: PLAN-039 | plan_revision: 1 | outcome: pass | basis: 用户确认发布收敛方向；038 archived/delivered@80eeea6；八局部 Specs／本仓启动与测试链／母工程清单只读调查；changed: T-01..05 / AC-01..10 / SD-01..05 | next: work（先 T-01 缺口原型与范围裁定，T-02 可准备依赖；最终冻结／T-03 受 §10 D-01 门） | note: 这是 new 阶段契约交接，不是实施通过、独立复审通过或 release-ready。
- 2026-10-09T04:30:00Z：stage: work | plan_id: PLAN-039 | plan_revision: 1 | outcome: executing（启动＋T-01 闭环） | code_commit: 基线 80eeea6（038 archived/delivered tip；本仓直接 main 线性惯例单一主检出——001..038 在册无 worktree/dev 分支面，沿用既定惯例） | task_ids: T-01 | evidence: 用户指令「计划039: auto-plan-work 实施它」授权执行（drafting→executing）；主检出零 WIP 代码（仅 docs/analysis 两件他任务簿记＋本计划档，§4.1 预案一致）；038 merge 核对=HEAD 80eeea6 恒等；依赖实勘=auto-lang 源 590cc247d／auto-down 895f8d0／auto-edit f9ae2a6（与 §4.2 恒等）＋**载体更新发现**：release auto.exe 现为 2747-gab7a650bd master 干净构建（SHA256 1efdc3ed…5ee2），debug=2730-dirty（1dae8b49…339e3 与 §4.2 在录恒等）——双载体行为一致实测；缺口复现四件：①空文输入（Vue 轨 parseBlocks 空白行跳过→零块零 contenteditable 直证＋原生轨合成键程 ok 而非空对照亦零突变=M3/N2 仪器受限族，真键归 trial E1）②Save 假入口（emit('save') 零消费＋show-actions attr 透传双证）③键程边界（probe_editor_host --phase all 于 release 2747 全案通过：inventory/save/commands/navigation+split boot B1 恢复+vue 形状，unsupported 按行在册）④生命周期/退出（既有分列维持，vm_matrix LC3 安全终态断言 PASS）；readiness.md 落档（preparation_only＋双形态门＋处置/owner/重入全列）＋缺口裁定写入 SD-03/04 对应面；并行会话 auto.exe 实例（PID 28256 端口 17863/17864）识别不动 | blockers: 无 | next: T-02（最小修复落地＋候选准备）。
- 2026-10-09T06:00:00Z：stage: work | plan_id: PLAN-039 | plan_revision: 1 | outcome: executing（T-02 闭环） | code_commit: 基线 80eeea6＋修复批（未提交——随 T-03 门全绿后单批落 main） | task_ids: T-02 | evidence: 修复两件全在本仓显示层/呈现层，零协议/身份/写盘面变化：①空文输入起点=app.at `editor_content` computed（`editor_content_of(body, path_stem(active_path))`——trim 空→"# "+页名，create_page_impl 模板同形态；D-33② computed 单函数调用形态——三元 prop 表达式实测被生成器丢支不发射，改走在册惯例）＋绑定 `content: .editor_content`；store 正文零污染（引擎 lastEmittedMd 初始播种=挂载期 select 零发射直证 EngineEditor.vue:477）②引擎假 Save 钮宿主下线=编辑器 style 追加 tailwind 任意变体 `[&_.autodown-editor-actions]:hidden`（VM 轨 Style::parse 容忍直证：快照原样保留+boot 渲染零异常；VM 无动作栏面不受涉）；验证链：regen-vue 绿×2、**vm_matrix merged 20/20 ALL GREEN（隔离复跑——首跑 [B]/[14] 双红=负载窗瞬态族按 §6.1 归因，隔离全绿非回归）＋[B] 基线 v29 零漂移（computed 不入 dump/类串不入 id 序列=结构中性直证）**、e2e release-readiness 新套件 4/4（种子键入保存落盘/清空重输入真清空对读/假钮隐藏宿主入口保持/未编辑空文 0 字节）、editor-host-capabilities inventory+save 两测按新现实改锚、VM 空文件保存 0 字节实测、probe_editor_host release 全案；持久件：tests/bench_release_150.mjs（p21 一次性件收编+tags_index ≤1.5s 硬门+完整性锚+失败退出码）、sample-workspace 第一方语料（wiki-demo 脱依赖——trial-guide 基座）、manifest.json 骨架（D-01 字段 null/pending 如实）、readiness/validation/trial-guide/RELEASE.md 文案（最终版本受 T-03 门）；发现的测试债：matrix.spec openQuick 模态重入死挂（038 D-55⑥ 在录设计×测试假定可重入——修测幂等，非产品回归） | blockers: 无（D-01 RC 供给按预案 pending） | next: T-03（剩余门：matrix 修测复跑＋probe 家族＋split 诊断＋bench 首跑＋干净路径实走准备）。
- 2026-10-09T08:30:00Z：stage: work | plan_id: PLAN-039 | plan_revision: 1 | outcome: executing（T-03 preparation 面＋T-04 preparation 面闭环；最终收口件 D-01/D-03 门保持） | code_commit: 基线 80eeea6＋修复批（单批落 main——本记录所在批） | task_ids: T-03、T-04、T-05（Spec 交接半） | evidence: ①e2e 全批归因闭环：批 8 红→逐件隔离复跑全绿（draft 残留伪红 3/3、quick-open 5/5、wiki-link 8/8、matrix 修测后 1.3m 干净绿、lifecycle ⑩ menu 有界重试后 5.2s 绿、release-readiness 真清空路径 4/4）；修测三层全为测试债非产品回归（openQuick 幂等＝D-55⑥ 模态语义×测试假定重入、pick9/RecCap 关层判据＝D-21 v11③ 吞点击两形态实测、lifecycle menu() 3×3s 重试）＋release-readiness 测试前提修正（select-all=逐块宿主浏览器原生面在册——trial-guide A8 同步退格口径）②**用户信号「jade 经常卡住」实勘**：事件日志 4 次 auto.exe 挂起（PID 8440）集中 12:13–13:34＝本计划回归批量负载窗，14 天窗另仅 09-29 孤例（低频挂起预先存在）；probe 三件 receipt 失效经**基线对照（git stash 还原 038 源码同崩：N/M 臂 exit 3489660927）证明与本批改动无涉**；挂起根因域=上游 iced/VM 事件循环（D-45② 族），owner=auto-lang——已如实落 readiness §8/validation §5 行动项（静默环境复核＋最终候选重验既括）③probe 家族 19 件全绿（RESULT 全案通过+双臂一致逐件）＋mtime debug 路由全绿＋draft_recovery_matrix ALL GREEN＋bench150 全绿（**tags_index 244ms ≤1500ms 门✓**、深档开档 23.9s 记上游观察值）＋split 两轮诊断实录（核心九检链稳定 PASS、分歧点=提及 linkify/行点击开档——单列不并双轨口径）④素材：vue-main/vue-quick-open（headless 实拍）+vm-main（PrintWindow 零前台抢占——初版误抓前台无关内容已删除未入库、README 隐私注记在册）+逐件元数据⑤Spec 交接：docs/specs/release-readiness.md 新建（SD-01/02/04/05 全条）+editor-host-capabilities §1.1③/§2.6 SD-03 刷新（假入口宿主下线+showActions 缺口维持分列）⑥checksums.sha256（12 工件）⑦T-05 交付半完成；并行会话 docs/analysis 2 件簿记路由其 owner 不入本批（038 merge 既例） | blockers: D-01（最终 RC——AC-05/06/07 与最终 T-03 重验）、D-03（用户回执——publish_ready）、probe 三件静默环境补跑 | next: work 剩余＝D-01 RC 到位后最终候选回归＋干净路径实走＋素材重采＋manifest 收口→execution_done→auto-plan-review；或用户裁定 preparation 面先行交 review（范围=已落 main 的修复与资料，最终就绪状态明示非本判）。

## 10. 待澄清事项

| 项 | owner／下一动作 | 不依赖它的工作／阻断边界 |
| --- | --- | --- |
| D-01 最终 auto-lang v0.5 候选版本／获取来源尚未冻结 | 母工程发布负责人提供可重建的 RC，执行者 T-02 记录 source／binary／hash 对应 | T-01、原型和指南草案可推进；不能以当前 2730-dirty 完成 AC-05 或最终 T-03。准备证据明确 preparation_only |
| D-02 空文／Save 的等价本仓修复是否可成立 | 执行者 T-01 一次原型＋复测，必要供给登记 auto-down／auto-lang owner | 不提前许诺接口；不能成立则保留 AC-02/03 未达标，提交供给需求或具体 replan。支持形态缩减／跨仓写入必须另行锁定 |
| D-03 用户真实试用确认 | T-04 准备可运行候选与试用指南；用户完成一次真实试用并给可绑定版本的回执 | 前期准备及本仓验收可继续；无用户回执时 publish_ready=false，不用代理验收冒充 |
| D-04 对外源码／工件和网站入口由联合发布确定 | T-04 提供实际候选来源与资料包；母工程按其 R-03/R-04 完成最终入口验收 | 本计划不猜 URL、不部署 website、不代打 tag；公开发布前外部门保持 pending |

**默认裁定**：现行双轨源码试用范围和五任务已足够开始 work，不为侧栏、大纲、安装包或 Musk 集成另问偏好。若需要改变双轨承诺或跨仓范围，先给出已有证据与具体修订；不静默撤销 AC，不把安全问题仅写“已知限制”后放行。
