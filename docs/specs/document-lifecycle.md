# document-lifecycle — 多文档文件操作保护（PLAN-032 落位）

范围：页面/目录改名、移动、删除，目录合并三择，提及转链接，回收站单条/
全部恢复和清空——十类应用内文件操作的统一受检门、真实回执与定向协调。
权威实现：`src/back/lifecycle.at`（协议本体）+ `src/back/api.at` lc_plan_b/
lc_commit_b/lc_plan/lc_commit 端点 + `src/front/editor_store.at`（LcGate/
LcDrift/LcResolve/LcMarkReview/LcBlockCancel 策略机 + Save/QuitSaveClose
待核验门）+ `src/front/app.at`（十入口受检内联流程 + 阻断弹层）。
本文件是局部新规范（PLAN-032 SD-01..05）；`docs/ARCHITECTURE.md` 单源与
双轨纪律继续适用。契约决策与 T-01 实证 =
`docs/plans/attachments/032-lifecycle-protocol.md`。

## 1. 受检门与影响域（SD-01）

十类入口（RenameGo/MoveGo/DeleteGo/DelDirGo/RenDirGo/MoveDirExec/LinkifyGo/
TrashRestore/TrashRestoreAll/TrashPurgeGo）全部改走受检路径：**App 内联流
程** = lc_plan_b（纯读分析，零写面）→ store.LcGate（门判定）→ 漂移探测 →
lc_commit_b（基线复核 + 受检执行）→ store.LcResolve（定向协调）。旧原始
API（rename_page/move_page/...）签名保留承载协议测试与 split HTTP 探针，
应用内前端面清零。

- **影响域** = changes（指纹域）∪ moves 两端点 ∪ rewrites ∪ deletes 旧端；
  与实际执行结果一致（rename 覆盖后台引用源/自链/anchor/casefold 变体；
  同前缀异 stem 不误匹配；overwrite 覆盖靶旧档；skip 不误判未变靶档；
  回收站预览页纳入）。分析纯读零写面（工作区逐字节对照实证）。
- **脏页先阻断**：变更域内 dirty、草稿检查点在途/待续/异常、待核验实例
  → 阻断弹层（操作名 + 文档清单 + 原因），零提交；取消后用户经既有保
  存/保留草稿关闭/明确放弃/手动重载处理后**重新发起——重试必须重新分
  析**。无关脏页不被阻断（AC-02 面由 e2e ① + probe 门判定承载）。
- **清洁页基准漂移**：清洁匹配实例逐个 read_wiki 对比 original_body，
  基准落后于磁盘 → 阻断「先手动重载」；读取失败按漂移阻断（安全侧）。

## 2. 基线、真实回执与部分完成（SD-02）

- **基线（basis）** = "F"+count+全 .ad 清单（workspace ∪ .trash）+变更域
  逐件 size:sha 指纹（fs.size 字节 + Hash.file_sha256 磁盘字节面；mtime
  不参与——同秒改写必被 sha 捕获）。提交先重算比对，任一失配（改正文/
  新增引用页/目录成员变化/目标占位）→ `stale` 零变更（六文件 hash 对照
  实证）。指纹面在 deny-delete ACL 下抛错 → plan/commit 同态双空，基线
  比较仍闭环（T-01 §5①）。
- **回执** = RC1 位置记录（status ∈ ok|partial|stale|reject + dir/moves/
  rewrites/deletes/errors）——**不用旧 "" 推断无副作用**。迁移/删除核验
  = 复制→尺寸核验→删源→存在性翻转；复制未核验前不删源（短写/空副本
  残件清除+源保留——deny ACL 下 read_text 返空串的实勘强化）。失败即
  停，已完成项如实入回执（status=partial + errors slug:rel）——目录合并
  一项成功一项失败仍报告已完成映射并保留源（AC-05）。
- **未知结果**（响应丢失/畸形/协调读失败）→ 全部受影响实例标 lc_review
  待核验：原路径保存被 Save/QuitSaveClose 门阻止，另存副本与重新核验出
  口保留（AC-10）。

## 3. 定向协调与晚输入保留（SD-03）

回执后逐快照实例（tab_uid 定址——会话内稳定 ID，关闭即逝，重开同路径 =
新实例）协调：

| 实际结果/实例状态 | 协调 |
| --- | --- |
| 路径在 moves 旧端 | path/key/title 跟随回执实际 new；tab_uid/doc_id/脏标保持；不全局 Reload |
| 改写域命中且 body==快照 | read_wiki 读回同步 body+original_body（后台页同样）；key 播种重挂载 |
| 改写域命中但 body≠快照（等待期新输入） | 保留新正文与脏标，标待核验；不重读、不重设 original_body |
| 删除域命中且仍清洁 | 关闭该实例（RemoveAt 在册口，不毁草稿） |
| 删除域命中但有输入/判定失据 | 保留为需另存副本（path 空、title 标记、doc_id 保持）；原路径普通保存被阻止 |

迁移后脏页以新路径续排检查点（同 doc_id 新 seq——031 协议 path 逐记录
在案；忙态不重入，在途排水自续）。vue 臂编辑器事件发射滞后于回执时序
（实勘在案）：晚输入分支与同步分支的**终态不变量**一致——用户输入不丢、
磁盘事实可见、保存不静默丢输入；分支级语义由 vm 臂 LC 组与 T-01 原型承
载。已知边界（F-32-R1，031 既有面非本片引入）：vue 臂 store 互调不
await——ConfirmKeepClose 排水检查先于回执，"保留草稿并关闭"可能提示
「检查点未确认」不移除（安全终态=档留+草稿已保护；重试弧由 vm 臂 031
证据承载）。

## 4. 双轨形态与已知边界（SD-05）

- **受检流程内联于各入口 handler**（App 发起全部 fetch、store 只做同步
  策略机）：vue 生成器对 handler 互调 fire-and-forget——状态读回须同异
  步作用域（T-04 执行期实勘）。verdict/basis/moves 为 msg 派发后同步可
  读的模型面。bundle 单参形态（"kind|a|b|c[|basis]"，| 为 NTFS 非法字
  符）规避 VM 跨模块多参槽位覆写。
- **上游 blocker（F-32-R2，在案）**：auto-lang VM 帧槽跨调用别名蔓延至
  前端 handler 命名局部（跨操作残留——LC3 实证 kind='deldir'）。安全侧
  设计包含之：verdict=reject 零磁盘变更、弹层留置、save_note 如实提示。
  vm 臂 LC3-delete 弧与 13-组部分断言由此 blocker 承载为已知失败；不影响
  vue 臂（TS 局部无此面）与 probe 双臂（独立进程/HTTP 按名绑定）。
- 回执/记录分隔符全部取 NTFS 文件名非法字符（| * > : 与 \u0001 仅作
  store 内部分隔）——路径结构性不含，手工 split 可解析（D-20④ 规避）。

## 5. 验证矩阵（SD-05）

- probe_lifecycle.mjs 双臂（merged 探针工程十相位 + split HTTP 直驱）：
  十类分析/提交/守卫/stale/partial 全绿（连跑两轮 97 PASS）。
- e2e/lifecycle-safety.spec.ts 九测：①rename 阻断→保存→重试全弧+无关
  脏页零扰动 ②move 跟随 ③④delete 清洁协调关闭+脏档阻断安全终态 ⑤
  stale route 注入零变更 ⑥晚输入 checkpoint 落定证+保存门 ⑦rendir/deldir
  ⑧movedir ⑨linkify ⑩trash 全弧——全绿。
- vm_matrix merged：全组 PASS（含 13-file/dir 组受检语义适配）+ LC 组
  LC1/LC2 弧绿；LC3-delete 弧 = F-32-R2 上游 blocker（安全终态验证在
  案）。split 臂与 vm_matrix 结构基线 v25 随本批落位。
