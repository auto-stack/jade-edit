# draft-recovery — 草稿持久化与重启恢复（PLAN-031 落位）

范围：工作区本地草稿检查点协议、启动发现与恢复副本、关闭/退出/保存的
快照门与结算语义。权威实现：`src/back/drafts.at`（协议本体）+
`src/back/api.at` draft_* 七端点 + `src/front/editor_store.at`
（DraftDrainOf/DraftSettleOf/DraftRecover/QuitKeepClose/QuitSaveClose/
ConfirmKeepClose）+ `src/front/app.at`（恢复面板/状态栏提示/弹层动作）。
本文件是局部新规范（PLAN-031 SD-01/02/05）；`docs/ARCHITECTURE.md`
单源与双轨纪律继续适用。协议决策与 T-01 实证 =
`docs/plans/attachments/031-draft-protocol.md`。

## 1. 检查点协议（SD-01）

**存储**：工作区本地 `.auto-jade/drafts/v1/d%04d/`（点前缀目录 walk 忽略
D-33①——树/检索/反链/页面数零感知，probe+e2e 双面直证）。每稳定文档
身份一目录：`c%05d.body`（正文原始字节）+ `.orig`（原文基准）+
`.meta`（行式 k=v：schema/event/epoch/erev/len 字符+slen 字节/
sha 文件面/path/name/at）+ `s%05d.meta` 结算墓碑（永留）。

**身份与修订**：doc_id 后端盘扫 max+1 分配（d0001 起，永不复用既有
名——与编辑器 key/nonce/tab 索引彻底分离，PLAN-030 reload nonce 改
key 不影响草稿身份）。erev = 前端逻辑修订单调递增；seq = 后端记录序
（c*/s* 墓碑全计 max+1——半写残件与已结算 seq 均占号，号序即史序）。
epoch = 会话代次（只读盘扫 max+1，一 session 一调用持值复用）。

**写 = 新 seq 直写 + 确认四步**：body 写→读回逐字比对 → orig 写→读
回比对 → 三重校验面（len 字符/slen 字节 fs.size/sha256 磁盘字节）→
meta 写→读回解析复核 → 才回执 `ok:<seq>`。任一步失败 `err:<code>`
残件留盘（该 seq 已占号），前序有效记录不受影响。**恢复 = 只读枚
举**：逐目录校验，settle_erev 门排除已结算域（**迟到旧写入 erev ≤
settle_erev 不复活**），erev 最大有效者为 pending；损坏/畸形文件保留
原样入 bad[] 线索不删不重建；枚举零写面。**结算**：墓碑写→读回复核
→清理 ≤seq 检查点三件组（best-effort，残留被门双保险排除）→ 墓碑
永留 = 重启不复活的持久凭据。

**字符与编码**：正文/原文走独立文件原始字节（零转义层）；CJK、
emoji（4 字节）、引号、反斜杠、tab、CRLF、尾随换行、空正文全保真
（probe 双臂 + 磁盘 Buffer 逐字节对照）。`len`=字符数（PLAN-055
语义）、`slen`=字节数（fs.size）、`sha`=文件面 SHA256——三重正交。
预览（展示域）= 净化面：反斜杠加倍 + 控制字符可见符号 + 引号换单引
号（严格合法 JSON）。原文件只由显式保存改写——草稿协议零 wiki 页面
触碰（写前/写后/枚举后 wiki 树 hash 恒等直证）。

## 2. 恢复体验（SD-02）

**启动发现**：Init 调 draft_pending 只读枚举 → 行集（doc/seq/erev/
path/name/at/len/preview）+ 逐行**来源实读三态**（intact=原文件未变/
changed=已变化/missing=不存在/untitled——exists+read_wiki 对照草稿
正文，mtime 不作判据）。有待恢复项 = 状态栏非模态提示（条数）+ 视图
菜单「待恢复草稿」开面板；**不自动弹模态层**（劫持全应用点击面，
T-04 实勘否决）。关闭面板不丢记录。

**恢复副本**：行级「恢复副本」→ draft_read/orig 读回（len 核验拒
损）→ 独立身份新 tab（path 空、题 = 来源名（恢复副本）、original_
body="" 非空恒 dirty 需另存）；**空文副本不被 body==original 普通清
洁判定吞没**（来源结算链路独立追踪）。副本首检确认（或副本 Save As
成功）→ 来源 recovered 结算（link=副本身份）——**恢复始终不回写原文
件**。「放弃草稿」= 明确结算 discarded（失败提示并保留恢复记录）。
中断安全：副本确认检查点前来源保留（矩阵相位②：硬 kill → 重启来源
三行全在不丢不复活）。

## 3. 离开/退出/保存快照门（SD-03， editor-safety §2 扩）

- **关闭脏 tab**（close_target_* 身份+正文修订快照取代 confirm_idx）：
  取消全保；「放弃修改并关闭」= 门挂快照（F-30-R1）+ 结算 discarded
  成功才移除（seq==0 = 从未保护如实移除）；「保留草稿并关闭」= 排水
  至 saved 且无新输入（draft_erev==draft_conf）才移除，记录保留。
- **退出**（quit_keys 身份批量捕获，处理中逐项重查）：放弃修改并退出
  = 逐档结算全成功才 exit（保持应用 on 失败）；保留草稿并退出 = 逐档
  排水至最新确认全 saved 且无新输入才 exit；保存并退出 = 逐档保存+
  读回核验，未命名逐项另存（取消即停保持应用），任一失败保持应用+
  如实标记。vue 轨 Process.exit no-op——处理结果态由 e2e 断言，真实
  退出由 vm 矩阵承载。
- **保存**（Save/QuitSaveClose 同门）：写后**读回核验**（read_wiki ==
  提交快照——存在性判据退役）→ 原文基准=提交快照 + 脏标重算（较新输
  入自动保持 dirty）→ 绑定结算 saved(settle_erev=保存快照修订)。
- **手动重载放弃结算**：RequestReload 快照补 doc/seq/conf/was_dirty
  ——成功读回且目标匹配时**先结算再提交，结算失败不提交正文替换**
  （磁盘未动正文保持）；取消/读取失败/失效不结算。

## 4. 边界与验证（SD-05）

- **非目标如实**：原文档自动保存、文件版本历史、断电 fsync 保证、
  浏览器原生关闭拦截、多会话并发写草稿库、跨设备同步、R-02b 多文件
  事务保护——R-02b 已由 PLAN-032 交付（`docs/specs/document-lifecycle.
  md`：受检门/真实回执/定向协调；路径上下文检查点=迁移后同 doc_id 新
  seq 续排，path 逐记录在案），其余项仍未交付。检查点失败注入弧由
  probe 协议矩阵（七类故障）+ e2e ⑧（draft_settle 拦截→结算失败不提
  交）承载。已关闭草稿及 `.auto-jade/drafts` 不被文件操作删除/清空连带结算
  （document-lifecycle 删除协调：清洁实例关闭、有输入保留副本，草稿
  记录保留）。
- **上游边界（实勘在册）**：vm 合并轨 3+ 检查点后 AURA/MCP 面楔死
  （app 活但连接 RST——单文档序列恒过、多相位序列恒楔，矩阵键入预算
  制 + SKIP-VM-WEDGE 显式降级）；vm split 臂 boot FAIL = F-24-2 在册
  再现（后续分段判绿）；引擎空档键入零落点（F-30-R3）；切档后新编辑
  器实例键入不落地（remount/focus 边界）。
- **验证锚**：协议层 = tests/probe_draft_protocol.mjs（双臂：merged
  三进程真重启 + split HTTP；Node 独立校验器逐字段对读；损坏/迟到/
  守卫/索引面/原文件不变全弧）；真进程矩阵 = tests/draft_recovery_
  matrix.mjs（kill/重启×恢复 UI/退出弧，双连 19/19）；vue 用户路径 =
  e2e/draft-recovery.spec.ts（恢复全弧/放弃/关闭保留/三态/空文）+
  e2e/reload-safety.spec.ts ⑦⑧（重载放弃结算成功/失败不提交）；
  结构基线 v24（离开快照九标量入 dump）。
