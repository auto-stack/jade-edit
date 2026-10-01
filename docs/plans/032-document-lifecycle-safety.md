---
plan_id: PLAN-032
status: executing
feature_name: 多文档文件操作保护（R-02b）
author: [agent]
created_at: 2026-10-01T06:23:09Z
updated_at: 2026-10-01T10:00:00Z
plan_revision: 1
current_step: 2
total_steps: 7
supersedes_spec_components:
  - docs/specs/editor-safety.md
  - docs/specs/draft-recovery.md
new_spec_components:
  - docs/specs/document-lifecycle.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-02b
---

# PLAN-032：多文档文件操作保护

## 0. 变更摘要

承接已 archived/delivered 的 PLAN-030、031，补齐路线图 R-02b：页面／目录改名、移动、删除、目录合并、提及转链接、回收站恢复和清空，统一检查所有受影响的打开文档，并按实际结果更新路径与正文。已有未保存修改先阻断；等待期间的新输入保留，不能被内部 Reload 或 CloseTabsOf 覆盖／移除。

本片采用可解释的首版规则：列出受影响未保存文档，让用户通过既有保存、保留草稿关闭或明确放弃动作处理，再重新发起操作；不自动替用户保存或放弃。草稿“已保护”仍是未保存正文，不能作为可覆盖的依据。

R-02a＝PLAN-031 草稿与单文档离开保护已交付；本片验收通过后才可将 R-02 的应用内文件操作保护记为完成。原文件的全事务回滚、断电原子性和多进程并发编辑仍属于另立范围，不借 R-02 的名称宣称已经提供。

## 1. 目标

- G-01：操作检查覆盖活动页、后台页、批量引用改写源页、合并冲突源／目标和回收站预览页，不能只检查 active_dirty。
- G-02：检查与执行使用同一套路径、引用改写及冲突裁决规则；执行前磁盘内容／文件集合变化时拒绝旧方案。
- G-03：操作成功后只更新实际受影响的页面。移动保持正文和稳定草稿 ID；引用改写同步所有已打开且未发生新输入的源页；不重读无关活动页。
- G-04：等待中切页、关闭、重开或输入时，迟到结果不覆盖／关闭新正文。已发生的路径变化如实显示，新正文保持可继续编辑和检查点保护。
- G-05：部分执行失败和结果不确定不能被包装为成功，也不能按空字符串猜测“零变化”；保留本地正文、报告已发生的变化和待核验项。
- G-06：保留既有 case-only 改名、四级链接身份域、目录合并 both/skip/overwrite、回收站及 PLAN-030/031 行为。

涉及仓库：jade-edit。模块：src/back/wsys.at、api.at，拟新增 src/back/lifecycle.at；src/front/editor_store.at、app.at；相关 tests/e2e；局部规范。兄弟仓只读调查，本片不修改 auto-lang、auto-down、auto-musk。

非目标：自动合并未保存正文与引用改写、自动批量保存／丢弃、原文档自动保存、全文件版本历史、断电恢复型操作日志、跨进程排他锁、外部无限并发写入保证、运行期切库、知识库扩展到现有稳定规模以上、Markdown 迁移、Musk Plan/Spec/Wiki 管理、编辑器命令与布局重构。原有 .ad、depth 8、P≤200 声明不扩大。

成功样：A.ad 干净，B.ad 打开且未保存、磁盘引用 [[A]]。给 A 改名应列出 B 并阻断，A/B 磁盘与 B 正文保持。处理 B 后重试，A 路径改变、B 的已保存引用同步。若操作已提交后 B 又有新输入，保留新正文并提示磁盘变化，不能直接 Reload 清掉它。

## 2. 架构方案

分为“影响分析 → Store 门 → 受检执行 → 按回执协调”四段，单次操作有不可复用请求身份和冻结参数：

1. **后端拥有影响分析与文件操作事实。** 从实际磁盘枚举，而非前端 ft_nodes／link_pages 缓存，产生读集合、变更集合、路径映射和冲突分支。分析无写入。实际执行复用同一计算规则，提交前复核预期文件指纹／存在性／集合。
2. **Store 拥有打开文档保护门。** 给每次打开的 tab 增加会话内稳定 tab_uid；现有 doc_id 只在草稿分配后出现，不可强迫每个清洁 tab 建草稿目录。tab_uid 不依赖列表索引或编辑器 key/nonce；关闭后重开同一路径是不同实例。
3. **脏页／未同步页阻断。** 所有变更集合内的打开文档先比对 dirty、正文修订、检查点在途状态和磁盘基准；dirty 即阻断，包括 draft_state=saved。清洁但 original_body 与实际磁盘正文不同也提示先手动重载。未受影响脏页不阻断。
4. **操作期间不丢输入。** 首版不依赖尚未验证的编辑器只读锁。提交前再次核对所有快照；网络等待中后来输入仍被 Edit 接收。提交后的协调仅对相同 tab_uid、旧路径、正文／修订仍匹配的实例替换正文或关闭；否则保留最新正文，标明磁盘差异或转为需另存的保留副本。
5. **明确实际回执。** 新受检入口返回成功、拒绝、部分完成及逐项结果，含实际 old/new 路径、正文改写／删除和错误。不使用旧 "" 结果推断无副作用。响应丢失／解析失败时将相关文档标为待核验，禁止用旧路径继续保存或盲目自动重试。
6. **不用无守卫内部 Reload 收尾。** 迁移只重映射；正文改写按文档快照读前／读后门协调；删除只关闭匹配且仍清洁的实例。无关页正文、原文基准、dirty、编辑器 key、草稿状态保持。

元数据编辑 MetaGo、创建页面／目录及 daily_note 仍沿用既有接口；这些操作不会覆盖现有正文或移除 tab，本片不扩大为所有写 API 重构。若 T-01 发现同类遗漏的破坏入口，先记录证据与范围差异，不无声扩仓或降验收。

## 3. 技术栈

继续 Auto 单源、AutoVM merged/split、生成 Vue3、标量 str/int/bool API 和现有 StringBuilder／typed 列表约束。前端不直接文件 IO，不手改 gen/front/vue。后端可用 PLAN-031 已验证的 Hash.file_sha256／fs.size 文件面指纹；不使用已证返回 Nil 的 Hash.sha256(str)。正文／frontmatter 保留规则沿用 write_body 的既有约定。

拟新增生命周期模块 src/back/lifecycle.at 与受检 API（名称／标量载荷在 T-01 决策附件冻结）。保留现有原始 API 的签名以承载既有调用与协议测试；应用内本片入口必须改走受检路径。此保护是 Jade 应用操作契约，不是阻止其他进程／直接 API 调用修改磁盘的权限系统。

## 4. 需求分析与背景调查

### 4.1 规范、交付与版本

规划基线：jade-edit main `c8700afbb8008ac3d145e3238a8d2d90d69d06cc`，起始工作树干净，只有主检出；docs/plans 根目录无 active Plan，archived 最大业务编号 031。创建时加锁重扫，不以 attachments 编号占用业务池。

docs/specs 无 overview/index，已读 editor-safety.md 与 draft-recovery.md 全文；其他文件操作规则在 docs/ARCHITECTURE.md 的既有页面／目录／回收站章节。PLAN-031 已 archived/delivered；路线图仍写 execution_done 和失效链接，需本次更新分析记录，不能据陈旧状态重复执行 031。

| 来源 | 相关事实与锚点 | 版本／指纹 |
| --- | --- | --- |
| docs/specs/draft-recovery.md | 检查点确认／结算与稳定 doc_id；§4 明确保留 R-02b、VM 多检查点楔死边界 | SHA256 C9B2CD3122DB24E1126441E4F41F2EF368BC456E04CF26A7C084AED2F92B301C |
| docs/specs/editor-safety.md | 用户重载与内部 Reload 分野；内部多文件风险仍未覆盖 | SHA256 A1AB8D57556580985EA5E0BFB3E0C6F66AE7DD1C12CCD9699FD88CD74E1DA2AE |
| src/front/editor_store.at | Edit、DraftDrainOf、Save、Reload、RemoveAt、CloseTabsOf、TabsRenamed | SHA256 1837D81A8327C991C27380704D8BDBD70ED7CEBD75F8747259155502D8B5D157 |
| src/front/app.at | 下表十类操作入口及直接后端调用 | SHA256 10F26E78CCF7974CCCB808BE2612E9C9F7337936252116BACDC0846F25243214 |
| src/back/wsys.at | rename_page_impl/rewrite_links、move_file、目录／回收站／linkify 实现 | SHA256 B9E077E36A13A2111DCCC908E091561ECE045140072CC7B5FAB0E51A2841AD52 |
| src/back/drafts.at | d_ckpt/d_settle，记录路径域可含 .trash/；记录不可原位乱改 | SHA256 52CFFF4E3DC3EFB28672AA9865B45FFD6B67394A7F82CB0B317138ACC78B1B8E |
| docs/plans/attachments/031-draft-protocol.md | 原语／编码／检查点实证，不重复进行完整草稿协议调研 | c8700af |
| tests/vm_matrix.mjs / package.json | 结构基线 v24；build/test:e2e 配方 | c8700af |
| ../auto-lang / ../auto-down | 只读供给观察基线；work 必须重新记录载体／dist 新鲜度 | 7491719b8 / 895f8d0 |

### 4.2 操作风险盘点与保护域

下表是最终覆盖清单；T-01 核对后补齐准确读集合、映射和参数归一，不以统一“阻断所有脏页”代替受影响范围。

| 入口 | 必须纳入的变更域 | 当前风险 |
| --- | --- | --- |
| RenameGo | 被改名页＋rewrite_links 实际改写的所有引用源页（含自链、大小写变体、anchor） | RenameOpen 只检查活动页；其他脏源可被磁盘改写，后台清洁源也不更新 |
| MoveGo | 被移动页、预期目标存在性 | 依据 ft_sel 操作后无条件 Reload 当前活动页，活动页可与目标无关 |
| DeleteGo | 被删页及实际回收站落点 | CloseTabsOf 无条件移除，跳过 031 离开门 |
| DelDirGo | 磁盘子树全部文件及实际回收站落点 | 用缓存 ft_nodes 推导关闭名单，可能漏掉已开页 |
| RenDirGo | 旧子树全部实际迁移页及新路径 | 缓存 paths_under 映射＋无条件活动页 Reload |
| MoveDirExec（三策略） | 实际迁移源；overwrite 冲突目标；skip 源去 .trash；both 后缀新落点 | 仅成功返回 moves；中途失败返回 ""，之前可能已迁移 |
| LinkifyGo | 提及转换目标源页（不是活动的被提及页） | 改写磁盘后不协调该页已开正文／基准 |
| TrashRestore | 回收站源预览页及恢复目标存在性 | 回收站 tab 已可编辑；恢复后未重映射 |
| TrashRestoreAll | 同一批所有恢复源及目标；目标冲突只读不算变更域 | 逐条边循环边执行，可能处理一部分后才遇到脏页 |
| TrashPurgeGo | 整个 .trash/ 的实际页面及打开预览实例 | 清空后未处理已开回收站 tab，旧路径保存可能重建被清空文件 |

move_file 与部分迁移分支当前采用 read→write→delete，成功只看存在性。受检执行需在删除源之前验证目标完整内容；不得复制失败仍删除源。原始两步／多文件 IO 非原子，本片必须报告部分事实，不能宣称增加完整回滚能力。

### 4.3 授权与约束

用户要求“031 已经完成，下一步计划是什么，请规划”。本次授权规划、只读核对、在 jade-edit 主检出创建 Plan 和更新分析路线图；没有实施、跨仓写入、发布或自动连跑授权，没有指定时间／token 预算。Jade/Musk 结合建议尚未纳入本片。

当前上游限制：VM 3+ 检查点 AURA/MCP 楔死、split boot F-24-2、空文键入／重挂载焦点边界、引擎 dist 新鲜度漂移。T-01 不需要先解决所有上游问题，但必须能取得本片真实多文档保护证据；无法达到关键 AC 时写 blocker，不以 blanket skip 宣称完成 R-02b。

## 5. 详细设计

### 5.1 有界分析与协调原型（T-01）

新增 docs/plans/attachments/032-lifecycle-protocol.md（新）。一次原型＋一次针对失败面的复测，输出：十类入口的读／写／迁移／移除集合、前端快照结构、受检接口与回执格式、原语约束、迟到输入协调及部分失败演示。

至少原型验证三个问题：改名时非活动脏引用源被阻断；操作 RPC 等待中输入后结果不覆盖；目录合并执行一项成功后一项失败仍能报告已完成映射并保留正文。关键门不可行 → blocked/needs_replan，列缺失模块、最小复现与重入条件。等价实现调整记录原因；改变验收／兼容／仓库范围必须修订契约，不减掉难例。

### 5.2 后端分析、指纹与执行回执

- 参数冻结：kind、source、target/name、merge/strategy、linkify stem、restore entry 批次；请求期间活动页／输入框／选区变化不改这次目标。
- preview 为纯读。路径比较遵循实际工作区资源归一，处理相对／库内绝对路径、Windows 大小写与目录边界；不可把 `foo` 前缀误判成 `foobar`，也不可漏掉对话框打开的同一文件。
- 改名实际变更源集合必须复用 rewrite_links 同一转换；linkify 抽出纯计算和提交，仍保留边界／已链接豁免。目录冲突计划复用三策略裁决；skip 不改写靶冲突文件，因此靶脏页不应被误阻断；overwrite 必须把靶旧文件算入变更集合。
- 读集合保存原文件完整指纹、目标是否存在与影响相关集合。rename 引用扫描期间有新 .ad 文件加入也要使方案过期；目录／恢复批次新增文件同理。mtime 不能作为唯一版本凭据。
- 提交入口收到预期分析依据，先重算并比较；不同则返回 stale，零变更，用户重新预检。单会话只允许一项生命周期操作在途，双击／另一个入口不重复提交；不确定结果不自动重试。
- 所有受检路径的复制／迁移均在源删除之前验证目标完整字节／文件指纹；正文改写核验提交结果。沿用 frontmatter 保留和已有 updated_at 更新规则，不清理引用身份域或改格式。
- 对每一项记录真实迁移／改写／删除、错误和最终状态。后续失败仍返回 partial 与先前成功项；源删除失败产生双份须如实报告，不能伪造完整迁移映射。复制失败保留源；不以自动覆盖回滚补救。
- 不承诺 OS 级文件锁或全操作原子性。可观测的提交前变化与逐项执行变化须拒绝／停下；不能用这套检查声称排除了所有外部并发竞态。

### 5.3 Store 前置门与阻断体验

Store 捕获操作身份、每个受影响实例的 tab_uid/path/key/doc_id/body/original_body/draft_erev/draft_conf/draft_state；doc_id 为空也必须可保护。匹配全部打开实例，不只活动页，不以路径重新打开的 tab 继承旧请求。

阻断条件：变更域内有 dirty 或待处理恢复副本、检查点在途／异常且当前内容尚未确认，或清洁页基准与磁盘不一致。界面显示操作名、受影响未保存／待同步文档列表和跳转入口，说明先保存／保留草稿关闭／明确放弃，再重新发起；取消保持原操作未提交。现有删除／清空强确认继续保留，但不能成为绕过此门的“同意丢正文”。

不自动批量保存、放弃或对后端变更隐式授权。处理文档后重试必须重新分析，不能沿用旧列表。无关 dirty、未命名或恢复副本不妨碍无关操作，也不能被收尾 Reload 触碰。

### 5.4 回执后协调与草稿身份

| 实际结果／当前实例 | 协调规则 |
| --- | --- |
| 仅路径迁移且实例仍在 | 用回执实际 old/new 更新 path/title/key，tab_uid/doc_id 保持，正文／脏标保持；不全局 Reload |
| 正文改写，快照仍匹配且清洁 | 只读该结果页，读前／后复核实例、路径、正文修订；确认后同步 body/original_body，key nonce 播种；后台页同样更新 |
| 等待期间出现新输入 | 保留当前 body/dirty；路径已迁移则跟随实际映射；正文磁盘改写则提示需核对，不自动转换本地内容、不偷偷重设旧基准让旧 Save 覆盖 |
| 删除／清空，实例仍清洁且匹配 | 关闭该实例；取消其它页面的确认目标或作过期处理，不移除后来新开的实例 |
| 删除／清空，但实例后来有输入 | 不 RemoveAt；保留为需另存的副本（path 空、来源可辨识），tab_uid/doc_id 保持并确认新检查点；原路径普通保存被阻止 |
| 回收站恢复／合并 skip 或 overwrite | 跟随回执真实映射，含 .trash/ 落点；不能拼接目录猜路径或把源 tab 合并到内容不同的靶 tab |
| partial 或回执缺失／解析失败 | 只协调可验证成功项；未知项保留正文，标为待核验，阻止旧路径保存／再次变更，提供重新核验或保留副本出口 |

正文外改差异或未知结果标记，必须接入 Save/QuitSaveClose，不能只显示提示后仍让普通保存覆盖。通过“保留副本另存”或现有手动重载／明确放弃处理；本片不自动合并。某项协调读失败不关闭／清 dirty，操作在磁盘已成功这一事实仍可见。

草稿协议 v1 不原位修改历史 meta、不给路径移动写 discarded 墓碑。doc_id 始终保持；路径／来源变化触发新的上下文修订检查点（含忙态排水和迟到旧回执门），成功后才显示该新上下文已保护。失败仍保留上一有效记录，并显示其来源路径可能旧。已关闭的待恢复草稿仍按 031 恢复独立副本，不为其自动搬移或结算；删除原文件／清空回收站也不能删除 `.jade/drafts`。

最近打开列表、filetree、引用／提及／标签的刷新跟随实际成功映射；只有受影响当前实例才改变活动投影，后台协调不抢焦点。所有旧业务入口不再依赖无守卫 Reload／CloseTabsOf 收尾；低层 RemoveAt 保留 031“不自动销毁草稿”的规则。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/document-lifecycle.md | 无统一门 → 十类入口、影响域、脏页阻断、纯读分析和提交复核 | 非活动文档也受保护 | AC-01..04/09 |
| SD-02 | add | docs/specs/document-lifecycle.md | 成功字符串／无副作用猜测 → 实际映射、部分结果、复制验证及未知结果门 | 不假成功，不误删源 | AC-05/06/10 |
| SD-03 | modify | docs/specs/editor-safety.md | 内部 Reload/CloseTabsOf 风险未覆盖 → 应用文件操作改走有身份／修订门的协调；用户重载保持 | 保护晚到输入与无关页 | AC-07/08/11/12 |
| SD-04 | modify | docs/specs/draft-recovery.md | R-02b 待交付 → 指向新生命周期规范，定义稳定 ID、路径上下文检查点和已关闭草稿保留 | 操作后草稿仍可追踪 | AC-08/10/11/12 |
| SD-05 | add | docs/specs/document-lifecycle.md | 无独立多文档故障门 → 验证矩阵、兼容规则和上游限制 | 独立复审可重放 | AC-01..13 |

规范在 work 随实现落位，本次 new 不写 canonical Specs。R-02 完成声明必须绑定本片完整验收证据，不能只凭 031 已有草稿文件。

## 6. 测试设计

### 6.1 素材与装置

新增 tests/probe_lifecycle.mjs（受检后端，merged 与 split HTTP 同案）与 e2e/lifecycle-safety.spec.ts（用户全弧），修改 tests/vm_matrix.mjs 增原生目标路径。用独立 fixture 页面、库内绝对路径、CJK、空格、CRLF/emoji/frontmatter；不改真实知识库。

最小代表素材：A（自链）、B（引用 A、活动页）、C（引用 A、后台页）、D（完全无关但 dirty）；目录 src/dst 冲突正文不同；同前缀 sibling 目录；.trash 的可编辑预览及后缀恢复条目。至少两个受影响打开页，覆盖一个后台脏页、一个无关活动脏页和同路径关闭重开。

故障必须验证注入生效：预检后新增引用页／改文件、移到目标后源删除失败、复制短写／失败、多项中途失败、提交响应延迟／丢失、协调读失败、等待中输入／切页／关闭重开、上下文检查点失败和旧回执晚到。用正文、dirty、路径、原文基准、doc_id、草稿记录及全文件 Buffer/hash 对照，不只看按钮文字。

当前结构基线 v24，本片新增状态可按解释过的 diff 新增 v25（新文件）；执行时若已有并行基线变化先重勘，不覆盖他人文件。tests/draft_recovery_matrix.mjs 当前异常／exit 钩子使用 taskkill /IM auto.exe 全局清理；T-06 运行前须改为该装置持有的 PID／进程树，验证正常和异常退出都不终止别的应用。新测试也只清理自身进程。

### 6.2 执行命令与预期

| 命令 | 预期 |
| --- | --- |
| pnpm build | strict 生成、类型检查／打包通过，dist 新鲜度异常如实归因 |
| node tests/probe_lifecycle.mjs | 新脚本：双臂影响分析、stale 拒绝、真实回执、部分失败与路径边界全绿 |
| pnpm exec playwright test -c e2e/playwright.config.ts e2e/lifecycle-safety.spec.ts | 新测试：十类用户入口、脏页门、晚输入、无关页与协调故障全绿 |
| node tests/probe_rename.mjs | 既有改名／自链／case-only 回归通过 |
| node tests/probe_dir_ops.mjs | 既有目录与 both/skip/overwrite 回归通过 |
| node tests/probe_trash.mjs | 既有删除／回收站／恢复回归通过 |
| node tests/probe_alias_linkify.mjs | 既有 alias、词边界及已链接豁免回归通过 |
| node tests/probe_draft_protocol.mjs | 031 草稿协议双臂保持 |
| node tests/draft_recovery_matrix.mjs | 真重启／离开路径保持，新增路径上下文案需不清库重启 |
| node tests/vm_matrix.mjs --arm merged | 既有全部组及本片保护案通过，结构 diff 有解释 |
| pnpm test:e2e | Vue 全量通过，目标案不污染已有矩阵 |
| node tests/vm_matrix.mjs --arm split | 真实执行记录；已知 boot 红如再现，提供同窗对照与受检 HTTP/Vue 同面证据，不记全绿 |

新脚本/测试将在 work 创建，当前不存在；创建后需确认默认启动和断言实效。记录代码树／commit、Auto 载体、engine dist、fixture 和日志。VM 多检查点楔死按独立进程隔离证明有界案；若本片关键多页／晚输入保护只能 skip 或无法操作，必须 blocked，不采纳“后端测试通过”等价于原生产品已通过。

## 7. 验收标准

- **AC-01 精确影响域**：十类操作读／变更集合与实际结果一致；改名覆盖后台引用源／自链、合并 overwrite 覆盖靶旧档、skip 不误判未变靶档、回收站预览纳入；未受影响 dirty 不被阻断。验证：双臂后端素材对照＋用户路径。
- **AC-02 脏页先阻断**：受影响活动／后台 dirty、已保护草稿、待处理恢复副本不允许提交；列出正确页面及跳转。处理后重试重新分析。验证：请求计数与操作前后文件／正文／dirty 对照，至少两个打开受影响页。
- **AC-03 取消与基准不一致**：取消不提交／不结算，快照目标变化不改成新目标；清洁页基准已落后于磁盘时提示先重载，不偷偷覆盖。验证：弹层取消、参数改变和实际磁盘外改。
- **AC-04 stale 方案零变更**：分析后改正文、新增引用页或目录成员／目标占位再提交，受检入口拒绝，全部文件保持提交前状态；mtime 同秒不绕过。验证：故障注入、完整指纹及存在性对照。
- **AC-05 迁移／改写核验**：目标复制不完整时保留源，不能报成功；目录中途失败报告之前实际成功项及未完成项，前端不能按空串关闭／重读全部页。验证：复制／源删除／批次失败注入和逐文件 Buffer 对照。
- **AC-06 正常协调全页**：改名后所有打开清洁引用源正文和 original_body 正确；路径迁移保持 body/dirty/doc_id，按实际三策略映射更新；删除／清空只移除匹配清洁实例；recents 与树指向实际结果。验证：页面逐项对照与回执，含后台页、.trash 及冲突双映射。
- **AC-07 无关页零扰动**：活动页与操作源无关且 dirty 时操作可完成，其正文、基准、dirty、key、草稿 ID/状态不受收尾重载影响；后台同步不抢活动页。验证：操作前后 Store 对照及零 read_wiki 无关页请求。
- **AC-08 晚输入完整保留**：提交等待中输入、切页、关闭后重开，同步不覆盖新正文或错误实例；已删除／清空的晚输入页保留副本并可另存／恢复；正文外改差异阻止旧 Save/QuitSaveClose 直接覆盖。验证：延迟响应、输入标记、存活与原文件对照。
- **AC-09 全批前置门与重复提交**：TrashRestoreAll 在第一次写前检查整批；MoveDirExec 三策略同门；任一受影响脏页使本次整批零写；双击／并发入口不重复变更。验证：请求计数与全文件对照，不以逐条遇脏才停冒充批门。
- **AC-10 未知结果与读失败**：丢失／畸形响应或协调读失败，不清 dirty／草稿、不误关 tab，不按旧路径保存或盲重试；显示待核验与可保留副本出口；部分成功如实可见。验证：注入确已发生＋后续 Save/退出/再次操作行为。
- **AC-11 草稿可追踪**：迁移／副本化保留 doc_id，来源上下文改变的新检查点确认后才显示已保护；失败留旧有效记录并提示；迟到旧回执不清最新修订；已关闭草稿及 .jade/drafts 不被删除／清空连带结算。验证：协议记录、路径与不清库真重启恢复对照。
- **AC-12 双轨／兼容**：单源、前端零文件 IO；旧 API 签名与 case-only／引用身份／三策略／frontmatter／031离开恢复保持；VM merged 与 Vue 核心保护及回归真实通过，已知边界不冒充修复。验证：§6 日志、原生目标案、源码及结构 diff。
- **AC-13 规范与交接**：SD-01..05 和全部 AC 对应代码、真实证据、规范与路线图；声明 R-02 完成前确认覆盖十类入口；不宣称原子回滚或扩仓能力。验证：独立复审映射、路径、hash 检查。

## 8. 执行步骤

- [x] **T-01 影响与协调协议原型**。依赖：无。只读核对 app.at 十入口、editor_store.at Edit/Save/Reload/CloseTabsOf/TabsRenamed、wsys.at 相关实现和031协议；新增 attachments/032-lifecycle-protocol.md。一原型＋一次故障复测，明确分析／提交契约、tab_uid、快照门、部分回执和迟到输入／保存冲突出口。覆盖 AC-01/04/05/08/09/10/12，支撑 SD-01..05。验证：临时装置只在 ignored e2e/.runtime/，附件记录真实命令／结果；不可满足核心门则 blocker，不降验收。[✅ 已完成]（2026-10-01）探针装置 e2e/.runtime/p32/（lifecycle_probe.at 候选契约 rename+movedir 双代表 kind + probe_app.at 七相位 + t01.mjs 编排）**连跑两轮各 60 PASS/0 FAIL ALL GREEN**（原型＋失败面复测，转录 t01-transcript.log）；三个关键门全过（非活动脏引用源阻断/等待期输入保留/合并部分失败如实回执——真 icacls deny-delete 注入）；受检契约 LP1/RC1 位置记录文法+basis 全清单指纹冻结；工具链新实勘四件在案（deny 下 file_sha256 抛错但基线闭环/只读属性对 File.delete 无效/**跨模块调用参数槽位覆写→受检函数入口参数快照硬纪律**/前端调用块内局部拷贝）；无 blocker 进 T-02。
- [x] **T-02 后端受检操作与真实回执**。依赖：T-01 可行。新增 src/back/lifecycle.at、修改 api.at 受检接口与 wsys.at 共享分析／纯转换／核验提交件；保留旧契约。新增 tests/probe_lifecycle.mjs。实现十类分析、指纹重查、完整复制后删源、逐项结果和部分完成，覆盖 AC-01/04/05/09，SD-01/02。验证：pnpm build、node tests/probe_lifecycle.mjs 双臂全绿；旧 rename/dir/trash/linkify 协议回归保持。[✅ 已完成]（2026-10-01）lifecycle.at 十类全实装（分析纯读/基线复核/逐项核验/partial 如实；全程参数入口快照纪律）；wsys.at 九件 pub 化+linkify_split 纯计算单点抽取（linkify_page_impl 改纯计算消费——行为零变化）；api.at 追加 /api/lc_plan+ /api/lc_commit（旧原始 API 签名原样保留）；probe_lifecycle.mjs 双臂（merged 十相位+split HTTP）**连跑两轮各 97 PASS ALL GREEN**；回归五探针全绿（rename/dir_ops/trash/alias_linkify/draft_protocol——wsys pub 化与 linkify 重构零行为漂移）；pnpm build 生成链通过（api.ts 契约断言过+vue 客户端含 lc_*）+engine dist 新鲜度卫兵失败=F-31-R1 在案环境漂移（上游义务，非本树缺陷）+lifecycle.rs/drafts.rs rust 转译跳过同族（try/catch 面 031 先例，vm 轨无涉）。执行期新实勘两件在案：deny ACL 下 read_text 返空串→**divert 增尺寸核验**（复制未核验前不删源强化——短写/空副本残件清除+源保留）；restore_all 冲突条目入整批方案（门域覆盖被占用目标，commit 期逐条复核如实 error）。
- [ ] **T-03 Store 前置保护与定向协调**。依赖：T-02。修改 editor_store.at Open/ActNew/DraftRecover 初始化会话内 tab_uid；新增生命周期消息／状态（名称 T-01 冻结），实现全部实例快照门、仅受影响同步、未知结果／正文差异保存门。移除业务收尾对无守卫 Reload/CloseTabsOf 的依赖，低层 RemoveAt 不毁草稿。覆盖 AC-02/03/06/07/08/10，SD-03。验证：Store 与磁盘对照，延迟／重开／晚输入故障，不以索引定位。
- [ ] **T-04 十类入口与保护提示接线**。依赖：T-03。修改 app.at RenameGo/MoveGo/DeleteGo/DelDirGo/RenDirGo/MoveDirExec/LinkifyGo/TrashRestore/TrashRestoreAll/TrashPurgeGo，参数快照、统一受检调用与阻断文档列表；成功刷新族／recents 按实际回执更新。新增 e2e/lifecycle-safety.spec.ts。覆盖 AC-01/02/03/06/07/09/10，SD-01/02/03。验证：定向 Playwright，十类操作都经过门；未保护的旧 API 调用不得留作旁路。
- [ ] **T-05 草稿上下文与晚输入保留出口**。依赖：T-03/T-04。修改 editor_store.at 的路径协调、DraftDrainOf、Save/QuitSaveClose 等对应状态门；必要时 back/drafts.at 仅补可验证消费接口，不迁 schema v1、不原位改旧记录。实现同 doc_id 上下文修订、.trash/ 路径、删除后保留副本、未知／外改的另存或核验出口。覆盖 AC-08/10/11/12，SD-03/04。验证：旧回执晚到／检查点失败、部分合并后恢复、不清库真重启；失败不结算最新草稿。
- [ ] **T-06 故障全弧与受影响回归**。依赖：T-02..05。完成 probe_lifecycle／lifecycle-safety，扩 vm_matrix、draft_recovery_matrix 必要路径案；运行前将后者异常／exit 全局 auto.exe 清理改为装置拥有的 PID／进程树；新增结构基线 v25（新，须解释 diff）。执行 §6 全部命令，记录注入生效、代码／载体／fixture。覆盖 AC-01..12，SD-05。验证：新红定位；上游关键路径不可验时 blocker，旧红同窗对照不冒充全绿。
- [ ] **T-07 规范与复审交接**。依赖：T-06。新增 docs/specs/document-lifecycle.md，局部修改 editor-safety/draft-recovery，必要时 README/ARCHITECTURE/parity-ledger 指针；更新分析路线图与R-02实际完成门。映射 SD-01..05/AC-01..13 并绑定实施 revision，交 auto-plan-review。覆盖 AC-12/13。验证：规范、兼容、剩余边界与实现一致，链接/hash 可查；本次规划不自动执行或合并。

## 9. 复审记录

### 2026-10-01 work：T-02 后端受检操作与真实回执（r1 第 2/7 步）

- stage: work
- plan: PLAN-032，plan_revision: 1
- outcome: pass（T-02 单步；整体仍 executing）
- code_commit: 本批（直接 main 线性，base=5a934eb）
- task_ids: T-02
- evidence: lifecycle.at 十类全实装+probe_lifecycle.mjs 双臂连跑两轮各 97 PASS ALL GREEN+回归五探针全绿（wsys pub 化与 linkify_split 抽取零行为漂移）+pnpm build 生成链通过（api.ts 契约断言过）；执行期新实勘两件：deny ACL read_text 返空串→divert 尺寸核验强化、restore_all 冲突条目入整批方案（门域覆盖被占用目标）；dev 期修复 10 轮在录（deldir 空壳嵌套清理、同父幂等卫、嵌套模块调用展平、ACL 残件核验、fixture 口径族）
- blockers: 无（engine dist 新鲜度卫兵失败=F-31-R1 上游漂移在案归因，非本树缺陷）
- next: T-03 Store 前置保护与定向协调（editor_store.at tab_uid+快照门+定向同步）

### 2026-10-01 work：T-01 影响与协调协议原型（r1 第 1/7 步）

- stage: work
- plan: PLAN-032，plan_revision: 1
- outcome: pass（T-01 单步；整体仍 executing）
- code_commit: 本批（直接 main 线性，base=c8700af，jade-edit 001..031 在册惯例）
- task_ids: T-01
- evidence: 探针装置 e2e/.runtime/p32/（候选契约 lifecycle_probe.at + probe_app.at 七相位 + t01.mjs）连跑两轮各 60 PASS/0 FAIL ALL GREEN；三关键门全过（gate 阻断/late 晚输入/partial 真故障如实回执）；契约 LP1/RC1 文法与 basis 指纹冻结；工具链新实勘四件（deny 下 sha 抛错、只读删除无效、参数槽位覆写、块内局部调用）在录 attachments/032-lifecycle-protocol.md；开发期修复 8 轮在录（stem/文件名参数口径、merge 语义 fixture、ACL 注入选型、VM 参数覆写）
- blockers: 无
- next: T-02 后端受检操作与真实回执（lifecycle.at 十类全实装 + probe_lifecycle.mjs）

### 2026-10-01 new：r1 契约交接

- stage: new
- plan: PLAN-032，plan_revision: 1
- outcome: pass（规划就绪，实施与运行验证尚未开始）
- next: work，交 auto-plan-work（C:/Users/zhaop/.codex/skills/auto-plan-work/SKILL.md）从 T-01 的有界原型开始；本次用户仅授权规划，不自动连跑 work/review/merge。
- changed_tasks: T-01..T-07（新建）
- changed_acceptance: AC-01..AC-13（新建）
- proposed_spec_delta: SD-01..SD-05
- 规划检查：十类入口、现有符号／命令和新路径已区分；AC/SD 有任务覆盖；分配池 active+archived 加锁、CreateNew 防覆盖、唯一性与 0..10 节由交付检查确认。
- 依赖：031 archived/delivered，消费既有检查点／结算协议；030/031 验收不删减。R-04 仍是上游阻塞时的独立候选，不能替代本片完成声明。

## 10. 待澄清事项

无必须向用户索取答案才能开始 T-01 的产品决定。执行期验证项已指派，不能默认为已验证：

| 项目 | owner／下一步 | 失败出口 |
| --- | --- | --- |
| 影响分析与三策略实际执行能否共用准确规则 | T-01/T-02，用实际结果对照十类清单并冻结接口 | 不能只读前端缓存或采用“有任何脏页全拒”；无法满足则 needs_replan |
| tab_uid 和快照／迟到输入在两轨的消息时序 | T-01/T-03，延迟 RPC、切页、重开与后台页原型 | 上游缺接口则列复现与 blocker；不可通过丢弃 input 达成门 |
| 迁移部分结果、丢回执、旧路径保存防护 | T-01/T-02/T-05，故障注入与保留副本／核验出口 | 不宣称原子回滚；旧 API "" 无法表达时使用新受检契约 |
| 031 多检查点楔死／重挂载焦点对原生验证的影响 | T-01/T-06，独立进程有界案例及真实 UI 证据 | 关键 AC 只有 skip 或不可验则 blocked，给上游供料；可独立规划 R-04 |
| 路径归一、库内绝对打开与旧草稿上下文 | T-01/T-05，相对/绝对/CJK/同前缀/case-only/.trash 全案 | 不把不匹配当无影响；无法可靠归一需明确阻断相关操作 |

实施工作树按 work 技能和届时仓库指令处理，主检出保留 Plan 进度。本次不创建实施工作树，不提交代码或 canonical Specs。
