---
plan_id: PLAN-040
status: execution_done
feature_name: auto-jade 改名机械批＋手册型示例知识库与宣传截图（v0.1.0 发布前收口两件套）
author: [agent]
created_at: 2026-10-10T05:57:56Z
updated_at: 2026-10-10T08:05:00Z
plan_revision: 1
current_step: 8
total_steps: 8
supersedes_spec_components:
  - docs/specs/draft-recovery.md
  - docs/specs/name-search.md
  - docs/specs/release-readiness.md
  - docs/specs/editor-host-capabilities.md
  - docs/specs/wiki-link-navigation.md
new_spec_components: []
touched_goals:
  - docs/RELEASE.md v0.1.0 源码试用里程碑
  - docs/analysis/2026-09-30-delivery-roadmap.md 发布收口
---

# PLAN-040：auto-jade 改名机械批＋手册型示例知识库与宣传截图

## 0. 变更摘要

v0.1.0 发布（PLAN-039 终收口）之前的两件配套，耦合为一计划按序执行：

1. **改名批**：jade-edit → auto-jade，归队 auto-* 家族（auto-lang/auto-down/auto-edit）。
   全深度机械替换——产品身份层（窗口标题/status/关于/包名）、盘上内部态层（`.jade/`
   → `.auto-jade/`）、环境变量层（`JADE_*` → `AUTO_JADE_*`）、文档与发行资料层。
   零功能改动；窗口标题与 status 文本入 vm 结构基线 → 计划内重锁第十二例（v32→v33）。
   归档计划/分析实录等历史档**不改写**。v0.1.0 未发布、零外部用户 → 零迁移成本，
   弃置语义（旧工作区内部态）如实落档。
2. **示例知识库＋宣传截图**：以新名将 RC sample-workspace 从 4 页种子扩为约 12 页
   「产品手册即示例库」（dogfooding——手册每页即功能演示），面向最终用户行文
   （零工程台账文体）。宣传截图套件从该语料实拍，沿用 PLAN-039 §5.4 采集纪律
   （第一方语料/逐件元数据/PrintWindow 零前台抢占或 headless/隐私注记）。

**与 PLAN-039 的时序**：039 状态 executing（2/5＋三任务 preparation 面），终收口件
（最终候选回归＋素材重采＋manifest 收口）挂 D-01（auto-lang v0.5 RC 冻结）/D-03
（用户试用回执）门且素材**本就要重采**。本计划插在其终收口之前落 main——039 的
重采与 manifest 收口直接消费新名、新语料，避免发布资料二次返工。本计划不接手
039 的门禁与判定。

## 1. 目标

- G-01：仓库现行态全量更名 auto-jade，双轨（vm 原生 merged / vue 生成）呈现一致，
  名字面扫描在现行态范围内零残留（白名单规则见 §5.2），历史档零改写。
- G-02：内部态与环境变量层随批迁移（`.auto-jade/`、`AUTO_JADE_*`），行为契约与
  Specs 逐字一致，draft 恢复/recents/readiness 等受触测试全绿；旧 `.jade/` 工作区
  的处置语义（内部态弃置、用户内容零损）落 trial-guide。
- G-03：示例知识库交付（约 12 页，§5.3 规格表），trial-guide 既有走查锚页与步骤
  零破坏，链接/标签/别名/悬空面规格达标。
- G-04：宣传截图套件交付（≥6 镜头，§5.5 清单），来自示例库实拍，preparation 候选
  图定位与 D-01 重采注记在册；与 PLAN-039 终收口的消费依赖双向落账。

**非目标**：仓库名/磁盘目录改名（`D:\autostack\jade-edit`，见 §10-D1）；归档计划与
分析实录改写；图谱/大纲等未交付功能的演示承诺；PLAN-039 的 D-01/D-03 门禁、
publish_ready 判定或母工程交接（039 保有）；上游仓（auto-lang/auto-down/auto-edit）
任何修改；新建独立宣传网站或独立发行渠道。**不做功能改动**——改名批与语料批都
不混入产品行为变化，测试锚更新仅限名字面。

**成功样**：以新名全新克隆走 trial-guide 的接收者，双轨看到 AutoJade 窗口与
auto-jade 关于页，工作区内是 `.auto-jade/` 内部态与 12 页手册语料；本仓全套回归
绿且基线 v33 漂移逐项可解释为名字面单变量；宣传截图可直接用于发布材料且采集
过程零隐私面。

## 2. 架构方案

### 2.1 与 PLAN-039 的时序耦合

```
039 已落（2/5＋prep，main 线性惯例）
  └─> PLAN-040 全量落 main（本计划：改名＋示例库＋截图）
        └─> 039 终收口（D-01 RC 到位后）：最终候选回归/干净路径实走/素材重采/manifest
            收口——全部以 auto-jade 名与新示例库执行，不出现旧名二次返工
```

本计划执行期间 039 保持 executing 不动（其阻塞项全为外部门，无执行面冲突）。
040 落地时在 039 计划档补一行协调注记（§8 T-08），不改其契约语义。

### 2.2 改名分层与深度决策

四层替换，深度=全深度（含盘上内部态与环境变量）。依据：trial-guide 用户走查
直接使用 `JADE_WORKSPACE`（trial-guide.md:34），`.jade/` 目录出现在试用者自己的
工作区内——浅改名会把这些面永久留给已更名的产品；当前零外部用户使迁移成本处于
lifetime 最低点。回退预案见 §10-D2。

| 层 | 内容 | 主要载体（§4.1 全列） |
| --- | --- | --- |
| 身份层 | 窗口标题/status 文本/关于菜单/包名/描述 | pac.at、src/front/status_bar.at、src/front/app.at、package.json |
| 内部态层 | `.jade/` → `.auto-jade/`（点前缀 walk 忽略自动保持） | src/back/{wsys,drafts,api}.at、reload-safety e2e、draft-recovery Spec |
| 环境变量层 | `JADE_WORKSPACE`/`JADE_FIXTURE`/`JADE_EDIT_ENGINE_ROOT` → `AUTO_JADE_*` | src/back/wsys.at、scripts/serve-back.mjs、scripts/regen-vue.mjs、e2e/.runtime |
| 文档资料层 | 四 docs＋RC 五件＋manifest 键＋截图 README＋注释面随批 | docs/README.md 等、docs/releases/v0.1.0-rc/* |

### 2.3 示例库＝随包语料合一

不另建宣传专用工作区：直接扩 `docs/releases/v0.1.0-rc/sample-workspace/wiki/`。
一份语料两份用途（宣传截图＋试用者随包基座），且 039 T-04 重采时天然同步。
既有 4 页（欢迎/写作示例/子目录嵌套页/空页）全保留——trial-guide 走查锚
（含悬空链接 `[[尚不存在的页面]]` 建页确认步骤）零破坏。vm_matrix/e2e 的
fixture 是外部 wiki-demo（serve-back JADE_FIXTURE 通道），与本语料无关，
扩库不触基线采集面。

### 2.4 截图纪律沿用

沿用 039 §5.4：只用第一方样例语料；vue 形态 headless chromium page.screenshot
（1440×900）；vm 形态 PrintWindow(PW_RENDERFULLCONTENT) 零前台抢占；逐件元数据
（source_commit/工具链 hash/形态/日期/尺寸/语料说明）＋隐私注记；preparation
候选图定位——D-01 冻结后随 039 终收口以最终工具链重采回填。

### 2.5 基线计划内重锁第十二例

窗口标题（pac.at:13 `JadeEdit`→`AutoJade`）与 status 文本（status_bar.at:21）入
vm 结构基线（v32，tests/baseline/）。流程：改名后首跑预期 [B] 红 → diff 审计
逐项=名字面单变量（chrome 头/status 文本）→ 重锁 v33（第十二例，沿 v32 批同
流程）→ 复跑 20/20。扩库不改 fixture，不触基线。

## 3. 技术栈

无新增。AutoDown 双轨（src/*.at vm 轨＋scripts/regen-vue.mjs 生成 gen/front/vue
不入库）、Playwright e2e（pnpm test:e2e）、tests/vm_matrix.mjs 结构基线、
tests/draft_recovery_matrix.mjs、probe 家族（tests/probe_*.mjs）、PrintWindow/
headless 截图采集。gen/front/vue/package.json 的 name 随 package.json 再生。

## 4. 需求分析与背景调查

### 4.0 授权记录

用户 2026-10-10 会话两轮确认：①示例库选「关于产品自身的手册型知识库」、
auto-lang 作纵深页而非主体（理由：dogfooding 宣传信号＋截图光学＋生态语料的
工程台账文体不适合入册——已向用户明示并认可）；②改名时机=现在、赶在拍宣传
截图之前（截图把名字永久定格；发布前改名成本 lifetime 最低）；③指令「把这两
件事做成一个计划」＝本契约的范围授权。预算/自动续跑限制未指定。

### 4.1 名字触点普查（2026-10-10 实勘，执行时以 T-01 冻结清单为准）

**身份层**：pac.at:8/10/13（name/description/title "JadeEdit"）；
src/front/status_bar.at:21（`text "JadeEdit"`）；src/front/app.at:1571/1662
（「关于 jade-edit」×2，menubar＋help.about action）；package.json:2（name）；
e2e 断言锚 editor-host-capabilities.spec.ts:31 与 reload-safety.spec.ts:87
（`getByText('JadeEdit')`）；e2e/helpers.ts:12（EDIT_MARKER 冒烟串）。

**内部态层**：`.jade/drafts/v1`（src/back/drafts.at:44、api.at:415/429）、
`.jade/recents.txt`（api.at:390/402、wsys.at:2963/2978）、`.jade` 目录创建
（wsys.at:2971/2977）；Specs：draft-recovery.md:14/89（存储契约）、
name-search.md:20（点前缀排除例举）；e2e/reload-safety.spec.ts:36/49（路径直引）。

**环境变量层**：`JADE_WORKSPACE`（src/back/wsys.at:13/16、api.at:33、
scripts/serve-back.mjs:36、e2e/.runtime/dbg-p21b.mjs:11、trial-guide.md:34/42）；
`JADE_FIXTURE`（serve-back.mjs:20）；`JADE_EDIT_ENGINE_ROOT`（regen-vue.mjs:49）。

**文档资料层**：docs/README.md、docs/RELEASE.md、docs/ARCHITECTURE.md、
docs/PROVENANCE.md、docs/parity-ledger.md（名字面计数待 T-01 精确化）；RC：
manifest.json（含 `"jade"` 块键）、trial-guide.md:1/16/22/25/122 等 7 处、
readiness.md 4 处、validation.md 2 处、screenshots/README.md、
sample-workspace/wiki/欢迎.ad:12（「这是 Jade v0.1.0…」）。

**Specs 行为键**：release-readiness.md:41（`jade_ready` 状态键）/:51（Jade
source_commit 表述）；editor-host-capabilities.md:67-68（jade-edit 宿主称谓）。

**白名单（不改）**：docs/plans/archived/**、docs/analysis/**（历史实录——现行
roadmap 交付目标引用除外，见 T-05）、git 历史、`jade-garden`（冻结池历史实体名，
src/back/wsys.at:578 注释）、e2e editor-host-capabilities.spec.ts:186
（`Jade Garden 测试知识库`＝外部 fixture wiki-demo 的页面内容断言，非本仓名字面）。

#### T-01 触点冻结（2026-10-10 执行时 fresh grep 落档，校正 §4.1）

实勘口径：`rg -i jade` 于 §5.2 范围＋env 族枚举 `JADE_[A-Z_]+`。校正与盲区补充：

- **§4.1 低估面（新增触点）**：e2e/release-readiness.spec.ts:25（`getByText('JadeEdit')`
  第四锚——§4.1 只列两锚）；e2e/matrix.spec.ts:167（第五锚）＋:43/259/551/727/729
  （.jade 路径直引与注释）；e2e/draft-recovery.spec.ts:12（.jade 路径——§4.1 只列
  reload-safety）；e2e/playwright.config.ts:40（注释）；src/front/editor_store.at:1290
  （console_log 版本串「jade-edit 0.1 — auto-edit 基座…」）；tests/pick_port.mjs
  （**JADE_PROBE_PORT 族 env 通道**——§4.1 env 三变量外第四族）；tests/probe_*.mjs
  全家族 17 件（注释/`.jade` 路径/clientInfo `jade-probe-*` 名/内嵌 AutoDown 变量
  `jade_in_*`）；tests/draft_recovery_matrix.mjs、tests/bench_release_150.mjs、
  tests/vm_matrix.mjs（EDIT_MARKER :206＋注释）；tools/bench/bench.mjs（env＋
  clientInfo `jade-bench`）＋tools/bench/README.md:3；docs/specs/wiki-link-navigation.md:22
  （「jade 原生探针」＝现行产品指称——随批改，SD 表补 SD-05）。
- **§4.1 高估面（零命中校正）**：docs/releases/v0.1.0-rc/screenshots/README.md
  实测零命中（三张截图表无名字面）。
- **env 族终列**（全仓 live 范围）：`JADE_WORKSPACE`(94)/`JADE_FIXTURE`(32)/
  `JADE_EDIT_ENGINE_ROOT`(10)/`JADE_PROBE_PORT[-TRASH|-MTIME]`(5)；`JADE_GARDEN*`
  仅存 docs/plans/archived＋attachments（历史档，范围外）。
- **白名单定稿（§5.2 断言判据）**：①`jade-garden`/`Jade Garden`/`jade garden`
  （冻结池历史实体＋外部 fixture 内容断言与语料查询族：wsys.at:578、e2e
  wiki-link-navigation.spec.ts:31/95/175、editor-host-capabilities.spec.ts:186、
  matrix.spec.ts:337/996/1127/1515/1527/1635、probe_name_search/probe_dir_move
  的 `"jade garden"` 检索查询族）；②历史重锁审计档 `tests/baseline/structure-v*.txt`
  （v0..v32 全量——历次基线冻结快照，历史档零改写原则；v33 新锁带新名，
  vm_matrix.mjs:203 引用随之）；③历史测量档 `tools/bench/results/**`；④磁盘
  目录指称 `D:\autostack\jade-edit`（D-1 默认不改——pac.at:19 注释保留目录名
  指称并加注）；⑤git 历史；⑥历史档文件名引用（`upstream/2026-09-jade-supply.md`
  供料包×3、`plans/archived/001-jade-edit-rebase-autoedit.md`、auto-down
  `docs/plans/archived/081-jade-edit-bootstrap.md` 跨仓档名×2——扫掠改坏的三处
  引用已回正为实际档名，README:959 路径并订正 archived/ 层级）；⑦历史实体
  叙事（ARCHITECTURE `demo/jade` 上游步×2〔regen-vue.mjs:39 同〕、`jade 080
  同裁定` garden 期裁定、parity-ledger D-07 `旧 jade`、ARCHITECTURE:28 兄弟仓
  分工表 jade 行＝auto-down 081 档外仓表行名、trial-guide 弃置语义注中的旧
  `.jade/` 指称——面向用户解释旧名所必需）；⑧改名叙事行（vm_matrix v33 头注
  与 trial-guide 弃置注中「jade-edit→auto-jade / .jade/→.auto-jade / JADE_*→
  AUTO_JADE_*」旧→新映射表述——描述改名本身所必需的旧名指称）。
- **e2e/.runtime/**（gitignored 会话暂存）：dbg-*.mjs 等 10＋件含 `JADE_*` 用法，
  未入库不入断言面；按注释面随批口径机械清扫（dbg-p21b.mjs 为 §4.1 在列件）。

### 4.2 PLAN-039 交接面

039 §8 进度：T-01/T-02 ✅，T-03/T-04/T-05 preparation 面已落、终收口件挂 D-01/
D-03。T-04 拥有 RC 素材（trial-guide/截图/sample-workspace/manifest/checksums）
且 manifest 明示「最终 RC 供给到位后更新并重验」——本计划的资料层清扫与其
重采面重叠，时序设计（§2.1）使其为接力而非冲突。039 的非目标「不修改兄弟仓」
与本计划一致；其「沿用 PLAN-029 的 Jade v0.1.0 里程碑」表述在其终收口时以
新名刷新（039 协调注记，T-08）。

### 4.3 主检出并行簿记

当前 main 有未提交的他任务簿记两件（M docs/analysis/2026-09-30-delivery-roadmap.md、
?? docs/analysis/2026-10-09-v05-release-convergence.md——039 §9 在录并行会话面）。
本计划不触碰、不裹挟提交；本计划档自身按惯例随批落 main。

### 4.4 假设

- v0.1.0 尚未对外发布、无外部用户工作区 → `.jade/` 弃置语义无需迁移工具
  （开发机自有工作区的 drafts/recents 弃置可接受——内部态非用户内容，
  draft-recovery Spec「原文件只由显式保存改写」保证用户内容零损）。
- 窗口标题/status 文本是 vm 基线漂移的仅有来源（类串不入 id 序列的先例：
  PLAN-039 T-02 记录；但 chrome 头入 dump——v30/v31 批「chrome 头尾零漂移」
  表述反证其入基线）。若 T-04 审计发现名字面以外的漂移，停下归因再动。
- gen/ 纯生成不入库：gen/front/vue/package.json 的 name 源于再生模板，
  `pnpm build` 后自然更新，无手改面。

## 5. 详细设计

### 5.1 改名映射表（契约级决策）

| 语义 | 旧 | 新 | 载体 |
| --- | --- | --- | --- |
| 产品名/包名 | jade-edit | auto-jade | package.json:2、pac.at:8/10、全部现行态 prose |
| 窗口标题 | JadeEdit | AutoJade | pac.at:13 |
| status 文本 | JadeEdit | AutoJade | src/front/status_bar.at:21 |
| 关于菜单 | 关于 jade-edit | 关于 auto-jade | src/front/app.at:1571/1662 |
| e2e 断言锚 | 'JadeEdit' | 'AutoJade' | editor-host-capabilities.spec.ts:31、reload-safety.spec.ts:87 |
| 内部态目录 | `.jade/` | `.auto-jade/` | §4.1 内部态层全列＋两 Specs |
| 隔离通道 env | JADE_WORKSPACE | AUTO_JADE_WORKSPACE | wsys.at:13/16、api.at:33、serve-back、e2e/.runtime、trial-guide |
| fixture env | JADE_FIXTURE | AUTO_JADE_FIXTURE | serve-back.mjs:20 |
| 引擎根 env | JADE_EDIT_ENGINE_ROOT | AUTO_JADE_ENGINE_ROOT | regen-vue.mjs:49 |
| 就绪状态键 | `jade_ready` | `auto_jade_ready` | release-readiness.md:41、manifest/资料引用处 |
| manifest 块键 | `"jade"` | `"auto_jade"` | manifest.json |
| 版本自称 prose | Jade v0.1.0 / jade | Auto Jade v0.1.0 / auto-jade | RC 五件＋欢迎.ad:12＋四 docs |
| 注释面 | jade-edit/jade（现行产品指称） | auto-jade | src/scripts 内注释随批；历史实体指称除外 |

### 5.2 扫描白名单与零残留断言

现行态扫描范围：`src/ scripts/ e2e/ tests/ tools/ pac.at package.json docs/specs/
docs/releases/ docs/README.md docs/RELEASE.md docs/ARCHITECTURE.md docs/PROVENANCE.md
docs/parity-ledger.md`。断言：范围内 `jade|Jade` 命中仅允许白名单模式——
`jade-garden`、`Jade Garden 测试知识库`（外部 fixture 内容断言）、历史引用语法
（「PLAN-xxx 时期 jade…」类，T-01 冻结逐条清单）。gen/ 与 node_modules/、
test-results/、dist/、deps/、rust-workspace/ 不在扫描面（生成物/依赖/他仓）。

### 5.3 示例知识库规格（约 12 页）

| # | 页 | 演示锚（特性面） | 规格要点 |
| --- | --- | --- | --- |
| 1 | 欢迎（既有，改写扩充） | 首页/别名/标签 | aliases 首页/Start；新名自称；保留 `[[写作示例]]`/`[[嵌套页]]`/悬空 `[[尚不存在的页面]]`（trial-guide 锚零破坏） |
| 2 | 快速开始 | 键盘/保存/脏标 | Ctrl+S/Ctrl+P/点击输入；链 [[界面导览]][[双链与反链]] |
| 3 | 界面导览 | 文件树/编辑器/面板 | 三区说明；链各功能页（反链面板富化主源） |
| 4 | 双链与反链 | [[..]] 语法/反链面板 | 正反向解释；密集被链页 |
| 5 | 标签与提及 | #tag/mentions/wanted | 标签页聚合视角；#入门 #链接 等标签族 |
| 6 | 别名与检索 | aliases/quick-open | Ctrl+P 检索别名演示表 |
| 7 | 页面管理 | 目录/移动/回收站 | 子目录/嵌套页（既有）联动 |
| 8 | 悬空链接与建页 | dangling→建页确认 | 从「为什么红色」讲起，链 [[尚不存在的页面]] |
| 9 | AutoDown 语法速查 | 代码块/frontmatter/代码内链接不计 | v2 语义一条以用户语言表述 |
| 10 | 引擎：auto-lang | 生态纵深 | 唯一生态页：auto-* 家族位次、v0.5 协同 |
| 11 | 版本与边界 | v0.1.0 源码试用 | P≤200/depth 8/双形态；链 [[引擎：auto-lang]] |
| 12 | 写作示例（既有，保持） | 长文排版 | 散文长页 |
| 13 | 空页（既有，保持） | 空态 | 0 字节语义 |

链接密度目标：每功能页 ≥3 出链、核心页（欢迎/界面导览/双链与反链）被链 ≥3；
标签族 ≥4 族；别名覆盖 ≥5 页；悬空链接全库恰 1 处（建页演示语义，不造噪音）。
全部链接闭合清点在 T-06 落档（除既有悬空锚）。

### 5.4 文体守则（语料批的验收面）

面向最终用户的干净 prose：零 PLAN-xxx/D-xx/F-xx/SPEC 引用、零上游工程叙事
（基线/回执/双轨内部术语——「双轨」仅在版本与边界页以用户语言表述为两种运行
形态）、零内部路径（D:/autostack 等）；中文为主，术语首现给英文。违例即返工，
不设豁免。

### 5.5 宣传镜头清单（≥6，落 `docs/releases/v0.1.0-rc/promo/`）

| 镜头 | 形态 | 内容 |
| --- | --- | --- |
| P1 主界面 | vm（PrintWindow） | 欢迎/界面导览页打开，三区全景 |
| P2 反链面板 | vue（headless） | 「双链与反链」页右栏 backlink/outlink 富集态 |
| P3 双链跳转前 | vue | 正文 [[..]] 可点态＋hover |
| P4 标签面板 | vue | 标签族聚合＋提及行 |
| P5 快速打开 | vue | Ctrl+P 弹层检索别名命中态 |
| P6 悬空建页确认 | vue | 红链点击→建页确认 dialog |
| P7 文件树＋子目录 | vm | 嵌套目录展开态 |

每镜头 PNG＋README 表（沿用 screenshots/README.md 表结构＋preparation 候选图
定位＋D-01 重采注记＋隐私注记）。构图统一 1440×900（vue）/窗口自然尺寸最大化
（vm，修 v30 批「边缘轻裁切」遗留）。

### 5.6 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | modify | docs/specs/draft-recovery.md | 存储契约 `.jade/drafts/v1/` → `.auto-jade/drafts/v1/`（:14/:89 两处行为文本） | 内部态随产品更名；点前缀 walk 忽略语义不变 | AC-01/02 |
| SD-02 | modify | docs/specs/name-search.md | :20 点前缀排除例举 `.trash/.jade` → `.trash/.auto-jade` | 例举与实际目录名一致 | AC-01/02 |
| SD-03 | modify | docs/specs/release-readiness.md | 状态键 `jade_ready`→`auto_jade_ready`；:7/:51 Jade 表述更新；sample-workspace 面由 4 页种子扩为手册型示例库（§5.3 规格援引＋文体边界） | 发行状态键与产品名一致；示例库成为随包契约面 | AC-01/04/05 |
| SD-04 | modify | docs/specs/editor-host-capabilities.md | :67-68 宿主称谓 jade-edit→auto-jade（行为不变，prose 面） | 宿主称谓与产品名一致 | AC-01 |
| SD-05 | modify | docs/specs/wiki-link-navigation.md | :22 「jade 原生探针 O 组」→「auto-jade 原生探针 O 组」（现行产品指称，行为不变） | T-01 冻结普查发现的 §4.1 盲区——现行指称须随批；证据指称的探针文件同步更名后语义保持 | AC-01 |

无新建 Spec：本计划不引入新行为契约，全部为既有契约的名字面与语料面更新。

## 6. 测试设计

- **零残留断言**（AC-01）：`grep -rin "jade"` 按 §5.2 范围＋白名单 → 仅白名单命中；
  T-01 冻结的逐条白名单清单为判据基准。
- **双轨一致**（AC-01）：`pnpm build`（regen-vue，gen 再生含新名）＋vue 构建绿；
  vm 冒烟起窗见 AutoJade；vue e2e 断言锚改后 editor-host/reload-safety 绿。
- **内部态等价**（AC-02）：draft_recovery_matrix 全绿（路径改后）；reload-safety
  e2e 绿；recents 面（matrix/pick 相关单）绿；serve-back belt fail-fast 通道用
  AUTO_JADE_WORKSPACE 实证。
- **全量回归＋基线**（AC-03）：vm_matrix merged 20/20（首跑预期 [B] 红→审计→
  重锁 v33→复跑全绿）；e2e 全套件隔离口径全绿（套件负载窗瞬态族按 039 §6.1
  既例归因）；受触 probe（editor-host/reload 相关）绿。
- **资料一致**（AC-04）：checksums.sha256 与 RC 目录实际文件态一致（增 promo/
  与语料后重算）；git diff 核对归档/分析目录零改写。
- **语料质量**（AC-05）：链接闭合清点（全库 [[..]] 目标存在，除既有悬空锚 1 处）；
  frontmatter 别名/标签族规格核对；trial-guide 走查步骤在扩库语料上逐步复走。
- **截图纪律**（AC-06）：逐镜头元数据齐备；vm 镜头 PrintWindow 法；隐私注记在册。

## 7. 验收标准

| ID | 标准 | 验证方法 |
| --- | --- | --- |
| AC-01 | 现行态名字面零残留（白名单内）且双轨呈现 AutoJade/auto-jade | §5.2 grep 断言；vm 起窗＋vue 构建与 e2e 锚；gen 再生核 |
| AC-02 | `.auto-jade/` 与 `AUTO_JADE_*` 行为契约与 Specs 逐字一致，受触测试全绿，旧工作区弃置语义落 trial-guide | draft 矩阵/reload-safety/serve-back belt 实证；Specs diff 核对 |
| AC-03 | 全量回归绿且基线 v33 漂移逐项＝名字面单变量 | vm_matrix 20/20＋[B] diff 审计档＋e2e 隔离口径实录 |
| AC-04 | 发行资料全套新名、checksums 一致、历史白名单零改写 | RC 五件＋promo README 核对；sha256 重算比对；git diff 范围核对 |
| AC-05 | 示例库按 §5.3 规格交付，trial-guide 走查零破坏，文体守则零违例 | 链接闭合清点＋规格核对＋trial-guide 复走＋文体扫描（PLAN-\|D-\|F- 零命中） |
| AC-06 | 宣传截图 ≥6 镜头全覆盖 §5.5，实拍自示例库，元数据与隐私注记齐备 | promo/ 目录＋README 表逐行核；preparation 定位注记在册 |
| AC-07 | 与 039 的接力依赖双向落账（040 先落；039 终收口消费新名/新语料） | 039 协调注记＋本计划 §9 记录；039 终收口材料以新名执行（其时验收） |

## 8. 执行步骤

| ID | 任务 | 依赖 | 变更面 | 结果 | AC | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| T-01 触点冻结普查 | 无（只读） | 全仓 fresh grep（含 docs/ specs/ RC/工具脚本盲区），逐条白名单定稿，§4.1 清单校正落档 | 触点清单＋白名单＝后续判据基准 | AC-01 | 清单覆盖 grep 全命中且白名单逐条有据 [✅ 2026-10-10：§4.1「T-01 触点冻结」块落档——新增触点 12 面（含第五锚 matrix.spec.ts:167、JADE_PROBE_PORT 族、probe 家族 17 件、wiki-link-navigation.md:22→SD-05）、高估校正 1 面（screenshots/README.md 零命中）、env 族终列 4 变量、白名单五类定稿（含 baseline v0..v32 历史审计档整体豁免——v33 新锁带新名）] |
| T-02 身份层替换 | T-01 | pac.at/status_bar.at/app.at/package.json/e2e 锚×2/EDIT_MARKER/dbg 脚本 | 身份层全换＋`pnpm build` 再生 | AC-01 | vm 冒烟见 AutoJade；vue 构建绿；受触 e2e 单绿 [✅ 2026-10-10 e949b62：e2e 锚实为五处（T-01 新勘三锚随批）；pnpm build ✓14.17s gen name=auto-jade；vm 冒烟 snapshot AutoJade=true/JadeEdit=false＋PrintWindow 起窗正常；editor-host 4/4＋reload-safety 1/1] |
| T-03 内部态/env 层替换 | T-02 | wsys/drafts/api＋SD-01/02＋reload-safety/serve-back/regen-vue＋注释面随批 | `.auto-jade/`＋`AUTO_JADE_*` 全换 | AC-02 | draft 矩阵全绿；serve-back belt 实证；grep 层零残留 |
| T-04 全量回归＋基线重锁 | T-03 | vm_matrix（预期 [B] 红→审计→重锁 v33→复跑）＋e2e 全套件＋受触 probe | 基线 v33＋回归实录 | AC-03 | 20/20＋diff 审计档（名字面单变量）＋隔离口径全绿 [✅ 2026-10-10：首跑 19/20 唯 [B] 红→diff 审计＝header 行1＋EDIT_MARKER 字节两处名字面（**§2.5/§4.4 前提实证校正：窗口标题/status 不入基线**——chrome 层仪器无此面）→v33 重锁→复跑 20/20 ALL GREEN；split 臂 ×2 MCP 不可达＝F-24-2 在册族（A/B 改名前 303e515 同败定谳）；e2e 41 passed/3 failed 与昨日同形——draft-recovery 隔离 3/3·quick-open 5/5 绿，matrix.spec 三跑败点漂移＝draft-settle 供料件在册〔303e515 pre-v2 同形·owner auto-lang〕＋本窗负载族（e2e 与 probe 链同机并发实录）；probe 家族 21 件全绿（native_wiki_link 隔离二跑 31/0/3＝昨日口径逐字复现，首二跑 flap＝D-54⑦ 瞬态族）] |
| T-05 文档资料清扫 | T-02 | 四 docs＋RC 五件＋manifest 键＋screenshots README＋SD-03/04＋欢迎.ad:12＋trial-guide 弃置语义注 | 资料层新名＋Spec 增量落 | AC-01/04 | §5.2 grep 断言零残留；git diff 白名单零改写 [✅ 2026-10-10：SD-03/04/05 落（+SD-05 新增 wiki-link-navigation.md:22）；screenshots/README.md 实测零命中（T-01 校正）；弃置语义注入 trial-guide §1；扫掠断链回正三处（archived 档名）；剥离法终版断言零残留（白名单八类定稿）；他任务簿记不裹挟] |
| T-06 示例库撰写 | T-05 | sample-workspace 扩至 §5.3 全表＋链接闭合清点＋文体扫描 | 手册型语料交付 | AC-05 | 闭合清点档＋规格核对＋trial-guide 复走 [✅ 2026-10-10：14 页（10 新＋欢迎重写＋3 既有保持）；split 后端 API 实勘闭合 PASS——悬空恰 1·功能页出链全≥3·核心页被链 7/6/7·标签族 8·别名 8 页·引擎：auto-lang 全角冒号页名解析实证；文体扫描零命中；trial-guide 锚结构性核验（欢迎/空页 0 字节/别名 Start/悬空锚/反链富集）] |
| T-07 宣传截图采制 | T-04、T-06 | demo 语料副本装载→§5.5 镜头逐拍→promo/＋README＋元数据→checksums 重算 | 截图套件交付 | AC-06 | README 表逐行核对；隐私注记在册 [✅ 2026-10-10：七镜头（P1-P7）逐张视觉核验通过——vm 两镜头最大化窗 1933×1245 修正边缘轻裁切遗留·AutoJade 状态栏入镜；vue 五镜头 1440×900 同会话连续交互链（P2 反链行级就绪等待）；README 元数据＋preparation/D-01 重采注记＋隐私注记齐；checksums 重算 30 件] |
| T-08 协调与交接 | T-05..07 | 039 协调注记一行（不改其契约）；本计划 §9 交接记录；复审交 auto-plan-review | 接力面落账 | AC-07 | 注记在档；复审另执行不自判 [✅ 2026-10-10：039 §8 协调注记落档（终收口以新名/新语料执行·jade_ready→auto_jade_ready 同步）；§9 work 记录落档；复审交 auto-plan-review] |

进度：8/8（全任务完成；复审交 auto-plan-review）。

## 9. 复审记录

- 2026-10-10T05:57:56Z：stage: new | plan_id: PLAN-040 | plan_revision: 1 |
  outcome: pass | basis: 用户会话两轮定向（示例库选型=产品手册型自指＋生态纵深单页；
  改名时机=发布前/截图前）＋「把这两件事做成一个计划」范围授权；触点普查基于
  2026-10-10 实勘（§4.1 逐路径行号）；039 交接面经其 §8/§9 与 manifest 现势核对；
  号位 040 双目录复核空闲 | changed: T-01..08 / AC-01..07 / SD-01..04 | next: work
  （T-01 触点冻结普查起） | note: 这是 new 阶段契约交接，不是实施通过或复审通过；
  §10-D1/D2 两项用户裁量点不阻塞执行（均有在册默认）。

- 2026-10-10T08:05:00Z：stage: work | plan_id: PLAN-040 | plan_revision: 1 |
  outcome: pass（execution_done） | code_commit: main 线性四批——e949b62（T-02
  身份层）/ ebcda75（T-03 内部态/env 层＋SD-01/02）/ T-05 文档批（SD-03/04/05）/
  T-06 语料批 / T-04 基线 v33 批 / T-07 截图批（基点 303e515；本仓直接 main
  线性惯例——001..039 在册无 worktree 面，039 §9 同口径沿用） | task_ids:
  T-01..T-08 全 8 | evidence: **AC-01** 剥离法终版零残留断言（白名单八类定稿
  §4.1 T-01 块）＋vm 冒烟 snapshot AutoJade=true/JadeEdit=false＋vue build 绿
  （gen name=auto-jade）＋e2e 锚五处；**AC-02** draft_recovery_matrix ALL GREEN
  ＋reload-safety/draft-recovery e2e 绿＋serve-back belt 新 env 通道实证＋
  probe_recent/probe_draft 绿＋trial-guide 弃置语义注入档；**AC-03** vm_matrix
  首跑 19/20 唯 [B] 红→diff 审计＝header＋EDIT_MARKER 两名字面→v33 重锁→
  20/20 ALL GREEN（split 臂=F-24-2 在册族·A/B 改名前同败定谳；e2e 41/3 与昨日
  同形·隔离复跑归因＝draft-settle 供料件在册〔owner auto-lang〕＋本窗负载族；
  probe 21 件全绿——native_wiki_link 隔离二跑 31/0/3 昨日口径逐字复现）；
  **AC-04** RC 五件＋manifest 块键＋promo/README 新名、checksums 重算 30 件、
  plans/archived＋bench/results＋baseline v0..v32 零改写；**AC-05** 14 页闭合
  PASS（悬空恰 1·出链≥3·被链 7/6/7·标签族 8·别名 8 页）＋文体扫描零命中＋
  trial-guide 锚结构性核验；**AC-06** 七镜头逐张视觉核验＋元数据/隐私注记/
  D-01 重采定位在册；**AC-07** 039 §8 协调注记＋本记录双向落账 | blockers:
  无 | next: review（auto-plan-review） | note: ①§2.5/§4.4 前提实证校正——窗口
  标题/status 不入 vm 基线（chrome 层），基线漂移实为 header 模板＋EDIT_MARKER
  两处；②T-01 新勘触点 12 面（第五锚/JADE_PROBE_PORT 族/probe 家族/wiki-link-
  navigation.md:22→SD-05 增补）＋扫掠断链回正三处（auto-down 归档档名）；
  ③bench_release_150 未随批跑（其性能门属 release-readiness Spec＝039 终收口
  D-01 门域，非本计划 AC 面——env token 已随批更名，039 终验时以最终候选执行）；
  ④本窗并行会话在飞（docs/upstream draft-settle 域两件＋docs/analysis 两件，
  均未裹挟）；⑤e2e/.runtime 77 件暂存脚本随扫（gitignored 不入断言面）。

## 10. 待澄清事项

| ID | 事项 | 默认（不阻塞执行） | 裁量者 |
| --- | --- | --- | --- |
| D-1 | 磁盘目录/仓库名 `D:\autostack\jade-edit` 是否随批改为 auto-jade | **不改**——目录改名波及兄弟仓引用与工具链路径，发布公开时随 GitHub 仓改名一并处理；本批仅仓内现行态 | 用户 |
| D-2 | 改名深度回退：若 T-04 审计发现名字面以外漂移或受触测试出现非机械红 | 拆层回退——身份层保留、内部态/env 层缓行（identity-only 发布亦成立，`.jade/` 遗留面记 039 终收口风险表） | 用户＋复审 |
| D-3 | 窗口标题形制 `AutoJade`（vs `Auto Jade`/`auto-jade`） | `AutoJade`——沿 JadeEdit CamelCase 先例 | 用户（T-02 前可改） |
| D-4 | promo/ 素材终位（RC 目录内 vs 独立宣传目录） | RC 目录内（checksums 可覆盖、039 重采同链路） | 用户（T-07 前可改） |
