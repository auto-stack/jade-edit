# release-readiness — v0.1.0 源码试用发布收口门禁（PLAN-039）

> 状态：**发布收口门禁规范**——固定 v0.1.0「Windows 源码试用里程碑」（配合
> 母工程 auto-lang v0.5）的收敛边界：双支持形态、基础使用/数据安全门、候选
> 与工件指纹规则、收口状态分列与外部状态单列。
> 本规范不是发布动作授权：tag、对外发布、网站部署不在本仓门禁内（母工程
> 联合发布流程承载）；「准备完成」≠「Jade 验收通过」≠「已经发布」。
> 证据：`docs/releases/v0.1.0-rc/`（readiness/validation/trial-guide/
> manifest/checksums/screenshots/sample-workspace）+ `tests/bench_release_150.mjs`
> + `e2e/release-readiness.spec.ts`。

## 1. 收口边界与双形态门（SD-01）

### 1.1 功能截止点

- v0.1.0 试用范围 = 001..038 已交付功能池冻结（各批 archived 计划在册）；
  侧栏重排、完整命令桥、实时链接解析、caret/reveal、大纲/图谱、自动保存/
  版本历史、运行中切库、安装包、跨平台、Musk 工作台、在线应用体验均**非
  本里程碑范围**（重新扩张须新计划，不在收口批次内暗改）。
- 工作区规模边界维持 P≤200 / 名称匹配 depth 8（>200 知情警示纯显示面）；
  版本号不随母工程改为 0.5。

### 1.2 支持形态与完成门

| 形态 | 角色 | 完成门 |
| --- | --- | --- |
| `auto run -r vm`（merged） | 主交付形态 | 真 UI 基础输入／保存／重启读回 + vm_matrix merged 全绿 + 保护探针通过 |
| `auto run -r vue --server vm`（集成形） | 现行第二交付形态 | 集成命令实走、基本编辑与保存通过；Vue 生成／构建和完整 e2e 通过 |
| serve-back + vite（e2e harness） | 验证载体 | 与真实工作区集成路径分开留证；fixture 测试不代替发行启动 |
| 原生 `--no-merge`（split） | 开发／补充诊断路径 | 记录实际结果即可，不要求以其证明上述两形态；不得把 HTTP 后端统称不支持 |
| 单独 Vue dist 静态 serve | 非独立发行形态 | 仅构建与新鲜度验证；未验证 API 路由前不提供独立运行承诺 |

发布资料必须说明需要工具链与兄弟仓依赖（auto-down 引擎包 / auto-edit
stylekit 相对路径），不承诺独立安装包或单独静态 dist 可运行。

### 1.3 收口状态分列

| 状态 | 语义 |
| --- | --- |
| `preparation_only` | dirty 工具链或未冻结依赖——只支持准备证据，不称最终 RC |
| `jade_ready` | 本计划基础行为、修复、冻结依赖与回归均通过（不要求母工程全部门禁） |
| `blocked` | 本仓基础行为或候选来源未达标——列出 owner、复现、所需供给与重入条件；不得作为 execution_done 的成功替代 |
| `publish_ready` | 另需真实用户试用确认、独立复审/交付与母工程联合发布门完成 |

若双轨基础门需要大改：保留已完成成果并报告 needs_replan／供给 blocker；
「只发布已验证形态／另一形态受限预览」类缩减须用户明示修订，不自动减 AC。

## 2. 候选与工件指纹（SD-02）

1. **manifest**（`docs/releases/v0.1.0-rc/manifest.json`）至少含：plan_id/
   revision、Jade source_commit 与发布资料 commit、各依赖 source_commit、
   工具链实际版本/SHA256/获取或重建记录、engine dist SHA256 与 freshness
   结果、Node/pnpm、平台、支持形态、构建命令、工件及 checksum、验证回执
   指针、真实图来源、用户试用与外部门状态。字段未知写 `null`/`pending`
   ——**不得以当前 HEAD 猜测 binary 来源**；dirty 调查版不得作为最终发布
   候选（调查载体指纹分列在案）。
2. **freshness**：engine dist 经 `scripts/assert-dist-fresh.mjs` 通道核验
   （regen-vue 门链随 build 执行）；工具链/engine/产品源码任一变化使相关
   证据 stale——重建并重验两支持形态；纯发布文案变更只核对应链接/事实/
   工件映射。
3. **干净路径实走**：获取/构建/启动指南须在另一绝对路径按 trial-guide
   逐条实走（真实 ws_root 副本；`$LASTEXITCODE` 逐项检查）；不得依赖开发
   机绝对路径、未跟踪 fixture（wiki-demo/.runtime）或私有文件。样例语料
   以 `docs/releases/v0.1.0-rc/sample-workspace/` 第一方交付。
4. **checksums**：`checksums.sha256` 校验随资料交付的截图与工件；源码以
   commit 与来源绑定；manifest/收据不自引用自身 checksum。
5. **性能门**：150 页语料 `tests/bench_release_150.mjs`——tags_index
   ≤1500ms 硬门（029 延续）+ 完整性锚（页数/改名改写翻转/悬空计数）；
   其余计时作同环境观察值不发明硬门（当前实录：深档开档 23.9s@150 页为
   上游观察项——重验时对照）。

## 3. 空文输入起点（SD-04）

### 3.1 契约

- 空 `.ad`（0 字节）与「清空全文后」的文档：编辑器必须提供**真实输入起
  点**。现行实现 = `app.at` `editor_content` computed 显示层种子——
  `trim(active_body)==""` 时编辑器 content 绑定 `"# " + 页名`
  （`path_stem(active_path)`，与 `create_page_impl` 新建页模板同款标题行
  形态）。
- **约束（不可让渡）**：store 正文保持空串直到真实输入经 `oninput` 落
  `.Edit`——单一正文权威、无第二份正文缓存；未编辑空文读回/保存保持原
  字节（0 字节进 0 字节出，e2e 阴性案在册）；种子不得自动落盘（无自动保
  存旁路）；检查点/保存/导航门链零规避；挂载与输入来源单一可核（一个
  computed 表达式 + 既有 `.Edit` 路径）。
- 种子经用户真实输入进入文档后即为用户内容的一部分（与模板页标题行同
  语义）；关闭不保存则磁盘零变化（既有关闭确认/草稿门链承载）。
- 引擎 `lastEmittedMd` 以初始文档播种（挂载期 select 零发射）——种子不
  产生脏标；该前提若上游变更（挂载期发射），须按 §2.2 freshness 规则重
  验并修订本条。

### 3.2 单列边界

- 原生轨空档真实键程：自动化仪器不可证（合成键程不达 DSL handler——
  M3/N2 ghost 家族），归用户试用走查（trial-guide E1）；不可输入则登记
  auto-lang 供给（B-3 族延伸），不静默降级。
- 编辑器 select-all = 逐块 contenteditable 宿主的浏览器原生面（Vue 轨）
  ——Ctrl+A 不达全文档；全清用户路径 = 逐块退格（trial-guide A8 口径）。
  这是引擎块宿主语义的如实呈现，不计为缺陷回退。

## 4. 保存入口诚实性（衔接 editor-host-capabilities SD-03）

每个可见保存入口必须真落盘或清楚呈现不可用及实际替代；无虚假成功。现行
形态：宿主三真实入口（工具栏/菜单/Ctrl+S）共 `ActSave → store.Save` 门链；
引擎动作栏假 Save 钮由宿主呈现修复下线（`editor-host-capabilities` §1.1
现行行）——不接 `emit(md)+active_key`（身份供给前禁止），不绕过 store.Save。

## 5. 用户确认与外部状态单列（SD-05）

1. **用户真实试用确认独立单列**：`publish_ready` 前必须收到可绑定版本
   （工具链版本+SHA256）的用户回执（trial-guide §6）；代理/工程验收不代
   填。确认缺失时 publish_ready=false——资料准备可交付，发布条件不豁免。
2. **受限形态不得无修订降级**：双轨承诺的缩减（如「只发布 merged 形态」）
   须先修订计划契约并经用户确认；不静默撤销 AC。
3. **独立复审与联合发布先于公开承诺**：本仓门全绿 ≠ 公开就绪；tag/对外
   发布/网站部署由母工程联合发布流程实际执行，本仓资料不预测 URL、不虚
   构下载入口。
4. **UI 挂起域如实注记**（2026-10-09 用户信号）：auto.exe 低频挂起
   （14 天窗内 09-29 孤例＋10-09 四次——后者与回归批量负载窗重合，probe
   基线对照与本仓改动无涉）属上游 iced/VM 事件循环域，owner=auto-lang；
   最终候选 T-03 须在静默环境复核稳定性并记入 validation。

## 6. 验证与边界

- 可重跑：`node tests/vm_matrix.mjs --arm merged`（主形态矩阵）；
  `pnpm exec playwright test -c e2e/playwright.config.ts`（vue 轨套件——
  批量运行存在先例在册的共享工作区/负载窗瞬态族，红色以逐套隔离复跑归
  因，038 R2 同判）；`node tests/bench_release_150.mjs`（规模门）；
  `node tests/draft_recovery_matrix.mjs`；probe 家族按各件 --phase 语义。
- 结果语义：预期缺能力案（unsupported/BLOCKED）按行在册即调查通过，不计
  为功能成功；计数按实录不预设；新红须归因（隔离复跑/基线对照）后处置，
  不无限重试。
- 八项既有局部规范（editor-safety/draft-recovery/document-lifecycle/
  editor-host-capabilities/editor-command-availability/wiki-link-navigation/
  name-search/quick-open）的门链不因发布收口下调；本规范与之冲突时以修
  订计划契约先行，不静默改判。
