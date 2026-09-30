---
plan_id: PLAN-031
status: executing
feature_name: 草稿持久化与重启恢复（R-02 第一切片）
author: [agent]
created_at: 2026-09-30T14:37:05Z
updated_at: 2026-09-30T15:45:00Z
plan_revision: 1
current_step: 2
total_steps: 7
supersedes_spec_components:
  - docs/specs/editor-safety.md
new_spec_components:
  - docs/specs/draft-recovery.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-02
---

# PLAN-031：草稿持久化与重启恢复

## 0. 变更摘要

在 PLAN-030 安全手动重载之后，先交付工作区本地草稿检查点、重启恢复入口，以及关闭标签页／退出时的明确保留、保存、放弃语义。恢复默认生成独立副本，不自动覆盖原文档。

这是路线图 R-02 的第一切片（下称 R-02a）。第二切片 R-02b 仍需独立立项：改名、移动、删除、目录合并、提及转链接等事务保护所有受影响脏页，并协调路径变化与草稿身份。本计划完成不等于整个 R-02 完成。推进 R-03 前重新核对 R-02b；若本片存在上游 blocker，可按路线图推进独立的 R-04，不能把安全能力记作已完成。

## 1. 目标

- G-01：已经确认落盘的最新草稿，在前端／编辑进程中断和重新启动后能逐字恢复；原文档保持未保存时的磁盘内容。
- G-02：多个有路径文档、多个未命名文档各有稳定草稿身份；后台标签页也不会因活动页变化漏存。
- G-03：用户能区分“原文件已保存”“草稿已保护”“草稿待写入／失败”，并从待恢复清单查看来源和恢复副本。
- G-04：正常关闭／退出先处理最新内容；保存失败、保存对话框取消、草稿写入失败或请求过期都不能被当作成功退出。
- G-05：保留 PLAN-030 手动重载全部语义，并使明确放弃与草稿恢复记录一致。

非目标：原文档自动保存、完整文件版本历史、断电／磁盘硬件故障下的 fsync 保证、浏览器原生关闭拦截、运行期切库、跨设备同步、跨工作区草稿共享、多个 Jade 编辑会话共同写同一草稿库、外部修改自动合并、R-02b 多文件事务全面保护、Musk 集成、AutoDown／auto-lang 跨仓实现。原文件保存的原子替换与完整修订冲突协议属于 R-07；本片只修正保存结果核验、迟到结果与安全退出。

涉及仓库：jade-edit。允许只读调查 auto-lang／auto-down；实施阶段任何跨仓修改需另列范围。本次用户授权是规划下一项，不是执行本计划或自动连跑 work/review/merge。

成功样：磁盘为 DISK_A，编辑正文为 LOCAL_B；界面确认“草稿已保护”后强制结束编辑进程；原目录不清理，重新启动看到待恢复项；“恢复副本”打开 LOCAL_B，原文件仍是 DISK_A。若磁盘后来成为 DISK_C 或文件已删除，仍能恢复副本，并显示来源已变化／不存在。

## 2. 架构方案

1. **Store 继续拥有正文事实源。** tabs/body/original_body/dirty 不迁到第二个编辑状态仓。草稿服务仅保存带身份和修订的恢复快照；恢复后仍回到同一 Store。
2. **稳定文档身份与编辑器 key 分离。** PLAN-030 的重载 nonce 会改变 key，因此不得以 active_key、tab 索引或仅 path 作为持久身份。未命名文档必须分配不同 ID；Save As 的路径变化不能把草稿串到别的文档。
3. **后端拥有草稿文件格式和 IO。** 新能力经 src/back/api.at 的标量契约提供，仍由 AutoVM 后端执行文件读写；前端不使用 fs／File，不手改生成 Vue。候选位置为工作区 `.jade/drafts/v1/`，最终格式经 T-01 验证后在本 Plan 记录并落规范。
4. **检查点独立于原文件。** 原文件只由显式保存改写；草稿写入不得调用 write_body 更新原文件或 frontmatter。完整正文及其 original_body 基准均需往返，不能只存摘要或差异。
5. **失效结果不能覆盖新状态。** 文档 ID、会话代次、编辑修订、检查点修订构成请求上下文。每文档最多一个正在发送的检查点，其间新输入替换待发送快照；完成后继续处理最新版本。旧回执不得让新正文被标成已保护、清 dirty 或删除新草稿。
6. **正常离开建立屏障。** 保留草稿关闭／退出必须等最新正文检查点成功；明确放弃必须先写入可核验的结算记录；保存成功必须绑定实际保存的正文快照。失败时保留文档和可恢复数据。
7. **启动只读列出恢复项。** 恢复默认播种独立、需用户另存的副本；不能按旧 path 自动回写。关闭恢复面板保留记录；恢复副本的检查点确认之前不能消费来源草稿。

支持域为单工作区、单 Jade 编辑会话写入草稿库。agent／外部工具修改原文件的场景需作为恢复测试，不属于第二个 Jade 草稿写者。发现多会话需求时另做并发协议，不能在实现中宣称现有纪律已提供锁或事务。

## 3. 技术栈

保持 src/front/*.at 单源、AutoVM merged／split、生成 Vue3 与 @autodown/engine。标量 str/int/bool API、typed 列表、while 索引循环等既有约束继续适用。可以新增 src/back/drafts.at 封装草稿协议；该路径目前不存在。

测试沿用 Node 自动化、AutoUI MCP 和 Playwright。测试脚本可检查 fixture 文件字节、注入损坏／失败／延迟，并控制被测试进程；产品不能依赖测试脚本执行持久化。

运行载体在 work 阶段重新记录实际版本。auto-lang native_catalog 已有 SHA256 原语目录项，只证明目录登记，不证明 `.at` 调用及字符编码往返已验证；本仓未取得可用 File.rename 原子替换证据，不能把它作为既成接口。

## 4. 需求分析与背景调查

### 4.1 规范与版本

规划基线：jade-edit main `1e6ddf7`，完整提交 `1e6ddf705df512f93dcfdad492637681eccc1392`；工作树起始干净，git worktree list 只有主检出。docs/plans/ 根目录无 active Plan；archived 最大业务编号为 030，attachments 的 081 不属于分配池。分配时仍需加锁重扫。

docs/specs 当前只有 editor-safety.md，无 overview/index；已读该文件全文，其他架构与双轨约束仍以 docs/ARCHITECTURE.md 为准。

| 来源 | 当前约定／观察 | 版本锚 |
| --- | --- | --- |
| docs/specs/editor-safety.md | 手动重载受保护；不承诺持久恢复；内部 Reload 的事务风险留 R-02 | SHA256 BE267AD3FEB2D7AD96D19FBD0D289B5F7964509FF34A1DE9BA3AC8A74DD11DDE |
| docs/analysis/2026-09-30-delivery-roadmap.md | R-02 同时含恢复和多文件生命周期；本片显式拆分 | 规划读取时 SHA256 01D195E830A8377DFF28D80FB33880FFE41EC6E7ADF886CAC5707F7637591567 |
| src/front/editor_store.at | 正文、保存、关闭和退出的状态权威 | SHA256 2BEF9565818E100FE3EADD617F153126F754745A72AE6B78AEFE78BB4B664976 |
| src/front/app.at | 根 Init、关闭／退出弹层和薄委托 | SHA256 9297D9C3C7C52E9AE2EEEA0D7887CA07A123D14B89C93EFEA4B870EBCA22C127 |
| src/back/api.at / src/back/wsys.at | 标量接口、frontmatter 保留、.jade/recents.txt | main 1e6ddf7 |
| docs/plans/archived/030-safe-manual-reload.md | status archived、completion_kind delivered；交付与复审证据在册 | main 1e6ddf7 |
| ../auto-lang/crates/auto-lang/src/vm/native_catalog.rs、native.rs | File.write_text 为 Void；hash SHA256 登记及实现；IO 候选需实测 | auto-lang d7a2ddc14（只读） |
| ../auto-down | 引擎与空文档输入边界的相关供给 | auto-down 3373a5c（只读） |

### 4.2 当前行为与缺口

- `.Edit` 更新活动 tab 的 body/dirty，没有草稿持久化；切页只投影，不恢复进程中断后的输入。
- `.CloseTab` 用 confirm_idx 暂记列表位置，`.ConfirmClose` 直接 RemoveAt；异步流程中列表变化可能使索引过期。关闭文案“关闭前要保存吗?”目前只配取消／直接关闭。
- `.QuitSaveClose` 对有路径脏页调用 write_wiki 后直接清 dirty，忽略返回值；跳过未命名脏页，并继续 Process.exit。必须改为逐项核验，不能把未命名输入静默丢弃。
- `.Save` 在 await 写入后使用当时 tabs 内容清 dirty，缺少保存快照与新输入之间的区分。本片需处理这一迟到回执场景，不能只补退出按钮。
- write_body 写原文后只用 File.exists 判断；该条件不足以证明本次写入成功。草稿需内容读回／有效记录核验，原文件保存也需核验提交正文，而不是单凭存在性清 dirty。
- `.RemoveAt` 与 `.CloseTabsOf` 也被删除、目录操作等内部流调用。低层移除不得自动销毁恢复记录；全事务前置保护由 R-02b 负责。
- 现有 recents 路径持久化可复用工作区目录约定，不能复用其“存在即成功”作为草稿成功条件。wsys.json_esc 只转义引号和反斜杠，不能直接拿来序列化包含换行／控制字符的完整正文。
- PLAN-030 确认弃改已明确是用户放弃；新持久化能力需要结算对应草稿，但读取失败、请求失效、取消不能结算。
- scripts/serve-back.mjs 每次启动会重建 fixture；恢复测试须使用不重建工作区的专用 harness，禁止用“清空后重建服务”证明重启恢复。
- Vue 的 Process.exit 是现有 no-op 适配；Vue 测试验证处理结果、刷新／关闭页面后的恢复，原生 VM 另验真实退出。不得宣称本片交付浏览器原生退出或卸载时可靠 await。

### 4.3 授权与产品边界

用户明确要求：继续 jade-edit 产品改造路线图，030 已实施，使用指定 auto-plan-new 技能规划下一项。已授权本次只读调查及在 jade-edit 主检出创建 Plan、维护分析路线图的状态链接；未授权应用实现、跨仓写入、发布或自动后续阶段。没有用户给定 token／时间预算或自动继续次数。

此前讨论的 Jade／Musk 结合方向仍是产品建议，未成为本片的新执行范围。本片保持工作区本地、独立于原文件的草稿协议，便于未来受管文档适配；不增加 Plan/Spec/Wiki 业务规则。

## 5. 详细设计

### 5.1 T-01 有界协议调查与决策门

新增决策附件 docs/plans/attachments/031-draft-protocol.md（新路径）。一次小语料原型及一次故障复测，验证两端共享后端的真实能力，并记录：

1. 格式 schema、稳定 ID 分配、会话代次／修订顺序、API 签名、完整字符往返、有效记录判据。
2. 优先考察带校验的独立代次记录及结算记录：写新记录不先覆盖唯一有效记录，读回一致后回执；恢复选择最新有效逻辑修订，损坏记录不能吞掉前一份有效内容。也可采用实测可用的原子替换方案，但不得只因接口名字存在就使用。
3. checkpoint、saved、discarded、恢复副本关联四种事件的顺序和中断语义。结算与迟到旧写入并存时，旧草稿不得复活；保存期间出现新修订时，不得结算新修订。
4. 重复请求幂等、不同文档／重启间 ID 不串用、原文件路径只为来源信息、草稿记录路径由后端生成；畸形 ID／越界路径请求必须拒绝。
5. 合并等待写入的策略、旧版本清理安全点、正常离开等待上限与失败提示。不能无限阻塞关闭；超时可保留文档、提示重试。阈值由原型测量记录，不捏造性能承诺。
6. 普通无草稿启动不建目录；草稿目录不进入页面树、搜索、反链或日常页面数；有坏记录时仍能读有效项，并保留坏文件及错误线索。

出口：本仓可行 → 记录协议和证据，继续 T-02；仅等价机制调整 → 记录并按语义契约变化递增 revision；依赖上游、不能保留最后有效检查点或必须降低 AC → blocked/needs_replan，给供给模块、复现与重入条件。不能以“最近打开列表”“内存缓存”“localStorage 只适用于 Vue”代替双轨持久恢复。

### 5.2 记录与状态

记录至少包含 schema_version、工作区身份、doc_id、session_epoch、edit_revision、事件类型、来源路径与显示名、body、original_body、有效性校验信息。时间用于展示，不能作为唯一 ID 或唯一顺序依据。body 为空也合法；CJK、emoji、引号、反斜杠、tab、CRLF 和尾随换行须保真。

Store 新状态围绕每个文档保存修订、待发送最新快照、正在提交的快照、最近确认修订和错误；活动页只投影状态。界面“草稿已保护”仅针对正文对应修订的成功回执；旧成功回执不得覆盖更新后的待写／失败状态。清洁文档及回到 original_body 的编辑需结算对应旧记录，失败时提示并保留可追踪的恢复记录。

网络等待期间切页、新建／关闭、手动重载都可能发生。完成后用稳定 ID 和修订重新查找，不保留列表索引作为提交目标。恢复／重载导致编辑器重新播种继续使用 key／nonce 机制，不能把规范化回声误存为用户新输入。

### 5.3 恢复体验

启动有待恢复记录时提供“待恢复草稿”入口，显示来源、最近确认时间、正文预览与原文件存在／已变化状态；关闭入口不丢记录。支持“恢复副本”和逐条“明确放弃草稿”，不提供默认覆写原文件按钮。

恢复副本：分配独立身份、path 为空、标记来源且需另存；即使恢复内容是空文，也保持待处理恢复状态，不可被 body==original_body 的普通判定自动吞掉。恢复来源条目在副本检查点确认之前保留，成功后按协议关联／去重。恢复过程中中断最多产生可辨识副本，不允许零可恢复内容。

原文件缺失、外改或路径已被内部事务迁移，只改变来源提示，不阻止恢复副本。Save As 取消时副本保持打开；成功后结算对应草稿修订。原文件是否外改的判断采用实际读取对比，不依赖 mtime 唯一判据；恢复始终不回写原文件。

### 5.4 关闭、退出、保存与明确放弃

| 动作 | 本片行为与提交门 |
| --- | --- |
| 关闭脏 tab → 取消 | 正文、dirty、tab、磁盘及恢复记录不变 |
| 关闭脏 tab → 保留草稿并关闭 | 等最新正文检查点成功后仅移除该 ID 的 tab；失败／新输入／目标过期不移除 |
| 关闭脏 tab → 放弃修改并关闭 | 明确文案；结算目标快照修订成功，且目标仍匹配，才移除；失败不移除 |
| 退出 → 保留草稿并退出 | 捕获所有脏文档，含后台和未命名；全部最新修订确认后 VM 退出；任一失败／新输入保持应用 |
| 退出 → 保存并退出 | 有路径逐项保存及读回核验；未命名逐项 Save As，取消即停止退出；任一失败保留失败／较新草稿和待处理文档；只有全部当前修订保存成功才允许 VM 退出 |
| 退出 → 放弃修改并退出 | 对所有目标修订明确结算，成功且没有后来输入才允许退出；失败保持应用 |
| 普通 Save／Save As | 写入前捕获 ID/path/body/revision；读回提交正文一致才视为该快照保存成功；较新正文继续 dirty 并持有检查点，旧成功不能清它 |
| PLAN-030 明确放弃并重载 | 保留现有读前／读后门；只有成功读回且目标快照仍匹配时结算被放弃的草稿，结算失败不提交正文替换；取消／读取失败／失效不结算 |

所有确认目标用身份和正文修订快照，不能仅依赖开态 flag 或 confirm_idx；考虑 AlertDialogAction 内部先关闭再派发的已知顺序。取消不新增结算。待等待中允许取消离开请求；若终态记录与新输入竞态，旧终态不得结算新修订。

原文件“保存并退出”不做多文件原子事务：已有部分保存成功时如实标记这些文档，只阻止整体退出并保留剩余草稿。核验 frontmatter 保留及既有 updated_at 唯一受控更新；不承诺重写原文件保存协议。低层 RemoveAt 默认只移除内存 tab；草稿清理只能经本节受保护终态，不能把所有内部调用变成自动放弃。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/draft-recovery.md | 无草稿协议 → 工作区本地 schema、稳定身份、检查点确认和故障保留规则 | 原始数据可追踪、可核验 | AC-01..04 |
| SD-02 | add | docs/specs/draft-recovery.md | 无恢复入口 → 只读发现、恢复副本、来源变化、明确放弃与恢复中断规则 | 不覆写磁盘，防重复／漏恢复 | AC-05/06/09 |
| SD-03 | modify | docs/specs/editor-safety.md | 仅手动重载 → 增关闭／退出与保存快照门、明确结算；保留原手动门和内部事务分野 | 生命周期不能假成功 | AC-07..10 |
| SD-04 | modify | docs/specs/editor-safety.md | 持久恢复完全非目标 → 引用本片规范；R-02b、自动保存、原子原文件写与历史继续未交付 | 清楚区分已交付与剩余能力 | AC-11/12 |
| SD-05 | add | docs/specs/draft-recovery.md | 无持久恢复测试基线 → 定义非清库重启、字符往返、失败／乱序和两轨验证锚 | 复审可独立重放 | AC-01..12 |

规范仅在 work 阶段随实现落位，本次 new 不修改 canonical Specs。README／ARCHITECTURE 的局部引用及测试描述可在 T-07 更新，历史记录不抹除。

## 6. 测试设计

### 6.1 隔离装置

- 新增 tests/probe_draft_protocol.mjs（后端协议与故障注入）和 tests/draft_recovery_matrix.mjs（真实 VM 进程重启）及 e2e/draft-recovery.spec.ts（Vue 用户路径），均为新路径。脚本应复用现有探活／端口／自动化方式；具体 CLI 在 T-01 决策附件定型后落实，预期默认不带参数即可在 fixture 副本执行。
- 恢复脚本持有同一个 fixture 副本，在断开／强制结束、重启期间不重拷数据；至少一次连同后端进程一起重启。只允许修改本测试副本，禁止共享真实知识库。
- e2e 各案使用独有页面和草稿身份；Vue 页 reload 验前端重建，同套后端完整重启由专用 harness 验。不能仅通过重新打开标签页或读取假造内存证明恢复。
- 全部失败注入需确认确实触发：只读／不可写、短写或截断、损坏最新记录、旧回执晚到、原文件改写／删除、Save As 取消、保存返回失败、读回内容不一致、离开等待中再次输入。
- 存量结构基线 v21 已在册，本片新增状态／入口允许有解释地新增 v22；写清 diff，禁止消除断言来换通过。若 T-01 发现另有并行基线变更，重勘而不覆盖。

### 6.2 work 阶段命令与预期

| 命令 | 预期 |
| --- | --- |
| pnpm build | 单源生成、类型检查和打包通过；无生成物手改 |
| node tests/probe_draft_protocol.mjs | 新脚本：schema／字符／路径／损坏／乱序／结算故障检查全部通过 |
| node tests/draft_recovery_matrix.mjs | 新脚本：不清工作区，真进程终止与重启逐字恢复，正常关闭／退出屏障通过 |
| pnpm exec playwright test -c e2e/playwright.config.ts e2e/draft-recovery.spec.ts | 新定向测试：用户恢复、保留、明确放弃、保存失败与延迟全绿 |
| pnpm exec playwright test -c e2e/playwright.config.ts e2e/reload-safety.spec.ts | PLAN-030 定向回归全绿，含新增草稿结算失败的保护场景 |
| node tests/vm_matrix.mjs --arm merged | 原有全部组与新结构基线通过；旧关闭／退出断言按新明确按钮语义更新并说明 |
| pnpm test:e2e | 全量 Vue 回归通过，新案不污染 matrix／reload-safety |
| node tests/vm_matrix.mjs --arm split | 真实执行并记录结果；若 F-24-2 在册 boot 缺陷再现，留同窗对照及 HTTP 后端协议／Vue 同面证据，不记全绿或无声 skip |

记录实际代码 commit／树 hash、Auto 载体、fixture 路径和日志。仅新脚本先不存在不构成假执行：T-02/T-06 创建后必须核验 help／默认启动和断言实效。new 阶段不宣称以上命令已运行。

## 7. 验收标准

- **AC-01 格式与隔离**：在两个工作区及至少两个未命名文档中保存中文、emoji、引号、反斜杠、tab、CRLF、尾随换行和空正文；后端读回逐字一致，ID 不串用；畸形 ID／越界请求拒绝，原文件字节不变，草稿不进页面索引。验证：协议脚本＋fixture 文件对照。
- **AC-02 已确认草稿可重启恢复**：在活动／后台有路径文档和未命名文档输入不同标记；等待对应最新修订“已保护”，强制结束进程，保持同一目录并重启；恢复项包含所有已确认内容，至少一案连后端完整重启。验证：VM 重启矩阵与 Vue 恢复 UI；不得用重建 fixture 替代。
- **AC-03 故障保持最后有效版本**：已有 V1 后制造 V2 写入失败／半写／损坏记录；不能显示 V2 已保护，V1 仍可恢复并有可见错误；异常文件不被自动重建抹除。验证：注入生效证据、后端读回与重启。
- **AC-04 乱序与身份**：输入 V1 后立刻 V2，延迟旧回执，其间切页／触发 key nonce／Save As；最新成功项为正确文档的 V2，旧回执不清新 dirty／草稿。saved/discarded 后到的旧请求不能让被结算修订复活。验证：HTTP 延迟、后端乱序请求与 Store/磁盘对照。
- **AC-05 默认恢复副本**：原文件外改或删除后恢复，原文件／目录不被创建或改写；恢复正文逐字正确、身份独立且需另存。多个未命名和空正文恢复项不漏失。验证：启动前后全文件对照＋UI；空文输入上游限制不作为忽略空草稿的理由。
- **AC-06 恢复中断与取消**：关闭恢复面板或取消另存仍能下次恢复；在副本确认检查点前强制终止，至少一个可恢复来源仍在。验证：副本流程中断、重启与关联记录核验。
- **AC-07 保留草稿离开**：关闭目标 tab／退出所有 tab 时，最新检查点失败、目标变化、超时或等待中输入时不移除／不退出；成功仅处理目标且后台与未命名都覆盖。取消保持正文、dirty、原文件、恢复记录。验证：VM 真实退出/存活、Vue 状态与协议延迟故障。
- **AC-08 保存与退出不假成功**：命名文档写失败／读回不一致、未命名 Save As 取消、保存等待中再次输入均不能清新 dirty 或退出；部分成功只标记实际成功修订。全部最新快照保存成功才允许 VM 退出。验证：保存故障、回执延迟、文件内容/frontmatter 对照与存活检查。
- **AC-09 明确放弃不复活**：逐条放弃恢复项、放弃并关闭／退出、成功放弃并重载均只结算确认的修订；结算失败不破坏正文或现有可恢复记录，重启不复活已成功结算旧修订；普通保存及撤销回原文的结算失败有提示。验证：结算故障、旧请求晚到、重启及记录核验。
- **AC-10 PLAN-030 保持**：三入口、取消、干净重载、合法空文、缺档、读取异常、目标失效／新输入的原门全部维持；重载结算失败不提交覆盖。验证：reload-safety＋VM R 组扩案，保留原断言。
- **AC-11 双轨与限制如实**：Auto 单源，前端无 fs，VM merged 与 Vue 核心能力及现有回归通过；split 实测及旧红归因明确；Vue Process.exit no-op、空文首块输入边界、单会话写者和 R-02b 未交付不被记作完成。验证：源码审查、真实日志、结构 diff 和规范。
- **AC-12 契约沉淀**：SD-01..05 与行为及测试对应；新规范、局部引用、剩余 R-02b 范围和 work→review 证据可定位。验证：独立复审逐项映射与链接／hash 检查。

## 8. 执行步骤

- [x] **T-01 协议能力原型与决策**。依赖：无。涉及只读 auto-lang native_catalog/native.rs、现有 back/API 与 frontend 接线；新增 docs/plans/attachments/031-draft-protocol.md。按 §5.1 一次原型＋一次故障复测，明确格式、完整字符、ID/修订、损坏保留、保存核验、消息等待及恢复中断语义。覆盖 AC-01/03/04/06/07/09/11，支撑 SD-01..05。验证：一次性脚本存 ignored e2e/.runtime/，命令和输出进入附件；关键机制不成立则 blocker/needs_replan，不开始依赖实施。[✅ 已完成] [2026-09-30] 探针装置 e2e/.runtime/p31/（drafts_probe.at 候选协议原型 + probe_app.at 相位 widget + t01.mjs 编排——merged 臂每相位一独立进程真重启 + split 臂同一 back 模块 HTTP，四隔离工作区）终态 **90 PASS / 0 FAIL ALL GREEN**，完整转录 p31/t01-transcript.log。定谳入附件：存储布局 .jade/drafts/v1/d%04d/{c%05d.body,.orig,.meta,s%05d.meta 墓碑}；写新 seq 直写从不覆盖（fs.rename 覆盖语义反证）；确认四步写-读回-三重校验（len 字符/slen 字节 fs.size/sha 文件面 file_sha256——Hash.sha256 str 面 Void 坑出局）；settle_erev 门迟到不复活（late=ok:3 实证）；坏件 bad[] 线索不删；恢复枚举零写面（29 文件 hash 前后对读）；空库 begin/list 不建目录；树/检索/反链零感知；200KB 检查点 ≈5ms → 离开屏障上限 3000ms；守卫十项返回码逐项对上；emoji/CRLF/tab/尾随换行双臂逐字节保真。工具链如实登记：str.length/char_at=字符语义（PLAN-055）、substr=(start,LEN)、Date.now() i32 截断负值（短窗差值可用）、replace 反斜杠替换串反直觉形态（r2/r4 原子）、json_esc 换行缺口。无 blocker，进 T-02。
- [x] **T-02 后端草稿协议与故障验证**。依赖：T-01 可行。新增 src/back/drafts.at，修改 src/back/api.at；仅必要的通用 IO 接线触及 src/back/wsys.at。实现经验证的 schema、检查点、只读枚举、关联／结算、损坏处理、路径边界和新记录读回核验；新增 tests/probe_draft_protocol.mjs。覆盖 AC-01/03/04/09，SD-01/05。验证：pnpm build；node tests/probe_draft_protocol.mjs 全绿，原文件逐字不变。[✅ 已完成] [2026-09-30] src/back/drafts.at 新（T-01 原型产品化：d_begin/d_alloc/d_ckpt/d_settle/d_list/d_read/d_read_orig 七契约实现 + d_* 私有面；T-01 定谳约束全 baked——三重校验/写新 seq 不覆盖/墓碑永留/settle_erev 门/bad[] 线索/预览净化反斜杠加倍）；api.at 契约族七端点（draft_begin/alloc GET 无参 + checkpoint/settle/read/read_orig POST body 通道 + list GET——全标量返回，use drafts 整模块限定 split 扁平面同 wsys 形）；wsys.at 零触及（协议自包含 resolve 走 wsys.root_dir）；editor_store.at 仅 strip_ad 历史注释追加 PLAN-055 勘注（.length 字符语义——不抹历史）。tests/probe_draft_protocol.mjs 新（提交版双臂回归：merged 三进程真重启[write→Node 故障注入→recover]+split HTTP 全字符语料+Node 独立校验器逐字段对读——①空库不建目录②逐字节+三重校验③身份单调+守卫④结算墓碑+清理+迟到不复活⑤截断/坏meta/删body/杂件→前序有效存活+枚举零写面+原文件逐字不变⑥索引面零感知）终态 merged+split 全案通过。§6 验证实录：pnpm build 绿（✓ built in 8.56s+regen OK——vue 轨吸收新契约面）+node tests/probe_draft_protocol.mjs 全绿+wiki 树 hash 写前/写后/枚举后三面对读恒等。
- [ ] **T-03 Store 检查点与保存快照**。依赖：T-02。修改 src/front/editor_store.at 的 Edit/Save/ActNew/Open/TabActivate/RemoveAt 等实际消费符号；新增稳定 ID／修订与检查点消息（名称在 T-01 决策）。实现待发送最新快照、单文档在途限制、回执过期拒绝、保存读回核验与结算。RemoveAt 不自动删除草稿，保留内部调用边界。覆盖 AC-02/04/08/09/10，SD-01/03。验证：协议回执延迟／失败驱动 Store 与文件对照，pnpm build；不以活动页一次测试代替后台页。
- [ ] **T-04 启动发现与恢复副本界面**。依赖：T-03。修改 src/front/app.at 根 Init 与根级恢复入口，Store 新增恢复薄委托；新增 e2e/draft-recovery.spec.ts 的恢复场景。实现可读状态、逐项来源／预览、独立副本、保留／明确放弃及复制中断关联。覆盖 AC-02/05/06/09，SD-02。验证：定向 Playwright 测试；恢复前后原文件全对照；未命名非空副本用播种验证，空文检查内容与状态，不宣称修复上游键入问题。
- [ ] **T-05 正常离开与手动重载结算**。依赖：T-03/T-04。修改 editor_store.at CloseTab/ConfirmClose/ConfirmCancel/CloseRequest/QuitSaveClose/QuitDiscard/ReloadReadOf 与 app.at 现有根确认弹层／薄委托，新增保留草稿动作。稳定目标快照取代关闭索引依赖，所有脏页正常退出建立屏障；考虑先关闭后派发、取消、超时、新输入。扩 reload-safety 的结算失败场景。覆盖 AC-07..10，SD-03/04。验证：定向 Playwright＋VM 真实存活/退出、保存失败／另存取消／重载失败与过期对照。
- [ ] **T-06 真重启、故障全弧及受影响回归**。依赖：T-02..05。新增 tests/draft_recovery_matrix.mjs；完成协议脚本与 e2e；扩 tests/vm_matrix.mjs，必要时新增 tests/baseline/structure-v22.txt 并逐项解释；scripts/serve-back.mjs 仅在专用恢复 harness 需要复用启动逻辑时做兼容扩展，默认旧重建配方保持。执行 §6 全部命令，所有 AC 行为留新证据，旧红对照归因不冒充通过。覆盖 AC-01..11，SD-05。验证：中断重启不得重拷 fixture，注入有效性和代码／载体 hash 在档。
- [ ] **T-07 规范、剩余范围与复审交接**。依赖：T-06。新增 docs/specs/draft-recovery.md，修改 docs/specs/editor-safety.md 的相关规则与非目标、必要的 ARCHITECTURE/README 局部指针；更新分析路线图 R-02a 结果但不标 R-02 完成；保留 R-02b 危险操作清单与重入条件。核对 SD-01..05/AC-01..12 全覆盖，记录真实验证 revision，交 auto-plan-review。覆盖 AC-11/12。验证：规范和源码一致、全部链接有效、记录 outcome 和 blockers；不自动 merge。

T-01 的技术实现路径是执行期研究任务，不是假装已有结论。其验收目标不能降低；只允许目标不变的等价机制。跨仓供给、扩大并发／规模或修改恢复默认覆写策略均需修订契约与范围决策。

## 9. 复审记录

### 2026-09-30 new：r1 草稿交接

- stage: new
- plan: PLAN-031，plan_revision: 1
- outcome: pass（规划契约就绪；尚无应用实施或运行验证）
- next: work，从 T-01 开始；用户本次仅授权规划，未获得执行或后续阶段自动连跑授权。
- changed_tasks: T-01..T-07（新建）
- changed_acceptance: AC-01..AC-12（新建）
- Spec delta: SD-01..SD-05（提案，未落 canonical）
- 检查：任务覆盖全部 AC/SD；已有路径与符号已读；新文件标明新；现有命令与 package/scripts 已核对；新脚本验证命令需随创建核验；active 匹配、分配锁、唯一性与 0..10 结构由本次文件交付检查确认。
- 与前序关系：PLAN-030 已 archived/delivered；其 AC 不删除、不降级。R-02b 明确保留，不能据本 Plan 扩写“全部文档生命周期安全”。

## 10. 待澄清事项

当前无必须向用户索取答案才能开始 T-01 的事项。以下为已指派执行期验证，不能默认为已满足：

| 项目 | owner／下一步 | 失败出口 |
| --- | --- | --- |
| 草稿可靠记录格式、哈希与完整字符、旧版本保留及结算乱序 | T-01，附件记录双轨共享后端原型与故障复测 | 本仓无法满足 AC 时 blocker/needs_replan，列精确上游供给 |
| 正常离开等待／取消及 UI 先关后派发顺序 | T-01/T-05，实测消息与弹层；冻结等待阈值和提示 | 不以直接退出代替保护；不可行则修订机制或 blocked |
| 未命名另存和 Vue no-op 原语 | T-01/T-05，核对现有取消路径；VM 验真实退出，Vue 验状态／刷新恢复 | 本片不承诺浏览器原生退出或上游空文键入；必要接口缺失不能假保存 |
| 新检查点带来的整文 IO 负载／在途积压 | T-01/T-03，在既有可用语料域测输入与最新队列收敛 | 不直接转为每键同步阻塞或丢最新数据；上游需要则列 blocker |
| R-02b 多文件事务危险入口 | 后续 new 重勘 RenameGo/MoveGo/DeleteGo/DelDirGo/RenDirGo/MoveDirExec/LinkifyGo/TrashRestore(All)/TrashPurgeGo 与内部 Reload/CloseTabsOf | 单列下一切片，不在本 Plan 摘要或规范中声称已交付 |

实施目录按 work 技能与当时仓库指令处理；建议独立工作树，主检出保留 Plan 进度。没有 AGENTS.md 的缺席不能推导跨仓或执行授权。
