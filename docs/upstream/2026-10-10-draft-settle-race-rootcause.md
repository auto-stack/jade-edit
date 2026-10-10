# vue 轨草稿结算竞态根因与分配臂 in-flight 门修复（PLAN-750 供料落地）

来源：auto-lang PLAN-750 供料包（`docs/plans/evidence/p750/supply-draft.md`，
2026-10-10）——按其落点建议由 jade 会话取用/改写入库，含 jade 侧落地与复验
记录。上 游 供料入口 = 本仓 `docs/upstream/2026-10-10-draft-settle-supply.md`
（回执节见该文件置顶）。

## 一、根因定谳（auto-lang 侧三证，RC-C 潜伏竞态）

上游载体无回归，竞态一直潜伏：

1. **codegen 零 diff**：同一份 jade 源分别用 v0.4.2-2747（绿时代载体）与
   现役 exe（v0.4.2-2853 域）执行 `build -r vue --gen-only`，34 组件 src 树
   逐字节恒等——转译产物（含 useEditorStore.ts 的 Edit/DraftDrainOf/
   DraftSettleOf 全链）无任何变化。
2. **后端恒等**：两载体作 `--server vm` 后端，draft API 短往返恒等（静载
   p50 1-5ms）；matrix 忠实 [4edit]→[5save] 弧两载体全协议链健康。
3. **老载体同败**：v2747 干净构建在 D 场景复现与现役载体逐字段同构的完整
   失败签名。

**机制**（与本仓 d0003/d0004 一手证据对账）：`Edit` 分配臂
（`doc_id == ""` → `await draft_begin()` / `await draft_alloc()`）存在
**await 悬窗重入**缺口——

- 首挂载编辑器逐键发射存活（D-17「重挂载后逐键发射死」仅覆盖切档重挂载
  态）；matrix 打字弧 `keyboard.type(..., {delay:25})` 每键一个 input 事件；
- 键 N 的 Edit 在 draft_begin/draft_alloc 往返内挂起；键 N+1 重入：erev
  递增、doc_id 仍空 → 再次分配；
- alloc#1 返回 dA → Edit#N 续体排水：快照 erev 已含键 N+1 → checkpoint
  (dA, erev=2)（= c00001.erev=2 之谜）；alloc#2 返回 dB → `tab.doc_id`
  覆写（= d0004 空目录签名——draft_alloc 建目录后永无检查点）；
- checkpoint 回执按 doc_id==dA 重扫 tabs 失配（已变 dB）→ 静默停，
  draft_seq 永不落账（tab 账面 dB，seq=0）；
- 保存：`draft_seq > 0` 为假 → settle 静默跳过（磁盘无墓碑——d_settle
  即使 verify 失败也先写墓碑，无墓碑=从未调用）；文件照存、脏标照清；
- 删除弧：tab 卡 `draft_state='sending'` + dA 检查点无墓碑（跨运行
  draft_pending）→ LC 卫语句「草稿检查点在途」永久误阻。

触发条件 = 两键间隔 < 分配往返（vite 代理静载 ~15ms、批量负载 25-60ms）；
vm 轨 MCP 往返串行故免疫。契约背景：await 悬窗内同 store 事件**可重入**为
双轨统一模型（auto-lang `docs/specs/auto-lang/ui/overview.md` SD-01，
PLAN-750 节）——身份分配单飞责任在宿主 .at，分配臂缺守卫即违反该模型。

## 二、修复（jade 落地，`src/front/editor_store.at`）

App 态新增 `draft_allocating bool`（与 `draft_epoch` 同域）单飞门；全部
三处 `draft_alloc()` 身份分配点（`.Edit` / `.ConfirmKeepClose` /
`.QuitKeepClose`——后两处模态期间编辑器无键入，理论上不可达重入，随批
同形守卫）统一包裹：

- 门内：`draft_allocating = true` → `try { draft_begin 惰性取一（epoch==0
  守卫保持）+ draft_alloc } catch { console_log }` → `draft_allocating =
  false`——**try/catch 保证异常复位，否则永久卡门**；
- 重入路径（`doc_id=="" && draft_allocating`）：跳过整个分配臂，只保留
  同步段已完成的正文/erev 更新——在途 Edit 续体在 alloc 返回后必然走
  `doc_id != ""` 分支排水（此时 state 非 sending——首个排水才置位），
  快照自动吸收重入键正文（erev 已前进），重入键的检查点保护由
  DraftDrainOf 既有 `draft_erev > erev → 续发最新` 续发语义覆盖，无保护
  空窗；
- 失败提示面 `if !.draft_allocating` 门（重入期不误报「分配失败」）；
  `.Edit` 头注的竞态断言随批修正（「await 悬窗外 handler 体原子」补充
  悬窗内可重入、两臂各负其责的现实）。

## 三、验证（jade 侧，2026-10-10）

复现工具 = auto-lang `docs/plans/evidence/p750/repro.mjs`（fetch 钩子 API
时间线 + `.auto-jade/drafts/v1` 目录形态 dump；serve-back fixture 隔离
拷贝，每跑干净工作区）。修复前后同机对照：

| 场景 | 修复前 | 修复后 |
|---|---|---|
| D（`type('XY',{delay:0})`+blur） | **红**（本会话静载复现，RTT p50=1ms 仍触发）：draft_begin×2、alloc×2（d0001+d0002）、checkpoint(d0001,erev=2) 卡死、`d0002/: (EMPTY)` 孤儿 | **绿**：begin×1、alloc×1、checkpoint(d0001,erev=2)（双键吸收）、无孤儿目录、状态栏「草稿已保护」（draft_seq 落账——修复前静默丢失的正是此环） |
| E（delay=25，matrix 忠实节奏） | （auto-lang 侧负载窗红证在档） | **绿**：单 alloc + 两 checkpoint（erev=1→2）顺序排水 |
| B（insertText+poll+保存） | settle 静默跳过（供料一手证据） | **绿**：checkpoint(erev=1)→write_wiki→read_wiki 核验→**draft_settle(saved,seq=1)**，磁盘 `s00001.meta[event=saved]` 墓碑 + marker 落盘核对 |
| C（insertText+立即保存） | 同上族 | **绿**：同 B 全链，`event=saved` 墓碑落 |

- `pnpm build` ✓ 14.96s（regen-vue 再生，useEditorStore.ts 三处门 + 态
  导出核对）；
- matrix.spec **2 轮全绿**（1 passed 1.5m / 1 passed 1.3m——含 [4edit]/
  [5save] 草稿弧、[13 file] Hello World 删除弧＝原 4/4 阻断点、[12]
  脏档/重载弃改弧、[14]/[15] 全段——新载体上该段首次完整通过）；
- vm_matrix merged **20/20 ALL GREEN**；结构基线 v33→**v34** 重锁
  （state 增量 = `draft_allocating` 态字段一行；id 序列零漂移——v33 为
  改名批在途未提交锁，随本批并链，因由见基线头注）。

### 复验途中的两处既有测试债（随批修订——供料包 §四「弧线去脆弱化」授权域）

matrix 深段在新载体上此前从未跑通（被原竞态挡在 [13 file] 删除弧），
本修解锁后暴露两处与竞态无关的阻断，均属测试面既有债：

1. **[13 dir5] 收尾关 tab 错靶**（spec:1508）：`.first()` 实际命中 tab 条
   首档而非注释所指 .trash 落位 tab（新起 tab 恒居末位）——历史绿＝首档
   碰巧干净静默关。打字尾键落入 Save 的 write/read await 悬窗时（AC-08
   「较新输入自动保持 dirty」设计语义——blur 冲刷先手不再必胜），带脏关
   闭弹层拦死后续（本日三轮同形实证：15:2x/15:3x/15:5x 均卡 1521）。
   修订＝`.last()` 显式定靶 + 条件脏关结算（弃改——磁盘随行 POST 复原
   语义无差；净关时零弹层直过）。诊断探针实录：静默窗 1.3m 跑至该点仅
   一 tab（.trash 带脏星标），d0004 仅 saved 墓碑无残余 checkpoint＝
   尾键 Edit 落在 Save 悬窗内见 state='sending' 跳过排水、Save 脏标
   重算见更新后正文——AC-08 按设计翻真，与本修无关。
2. **[14 meta] wanted 断言滞留链接域 v1 语义**（spec:1688/1710）：
   index.ad 提示行 `` `[[页面名]]` `` 在 v2 代码域屏蔽（303e515）后撤出
   悬空清单——vm 矩阵 check-14 同批已改「空态+双负向钉」口径，e2e 孪生
   断言漏改。修订＝页面名行负向钉（提取口径回归锁，vm 同口径）+ 空态
   直断（原「消缺余量建页」弧退役）。

### 复验环境实录（多会话并行纪律）

复验当日与 plan040 T-06 示例库批同机并行：默认 e2e 工作区
（e2e/.runtime/workspace）被并行会话 AUTO_JADE_FIXTURE=示例库 boot 反复
整擦（15:21/15:28 两轮 matrix 中途换库击落——败点各异、草稿弧全过为共
性），另有两轮 backend 中途死亡（16:17/16:18——D-45② auto.exe 挂起族，
plan039 在案）。本批落隔离三件套：serve-back `--workspace` CLI（库 API
workspace 参的 CLI 完形）、e2e helpers `AUTO_JADE_E2E_WS` 覆盖（spec 磁盘
断言面随迁）、vm_matrix FIXTURE 同 env 覆盖；私有 config（gitignored
e2e/.runtime/p750-matrix.config.ts）私有端口跑 matrix 两轮。**产品修复与
环境碰撞的判别证据链**：四轮失败败点各不相同且全在非草稿域，草稿弧在
每轮到达时全过；隔离+静默后同代码两轮全绿。

## 四、已污染工作区恢复面

修复前的失败运行可能遗留卡死检查点（如 e2e 工作区历史 d0003）：草稿
恢复面板可按既有 RecoverDiscard 消费，或手清 `.auto-jade/drafts/v1/`
对应 doc 目录。e2e 工作区由 serve-back 每跑 fixture 重拷（`rmSync` +
隔离复制），无跨跑污染面。

## 五、边界与后续

- 引擎逐键发射（首挂载存活）为既有 D-17 边界族，不在本批改动面；
  matrix 三处 `keyboard.type` 弧如需去脆弱化，可循 helpers
  appendToEditor 的 insertText 先例（单事件化）——守卫为根修，弧线单
  事件化为减载，二选一或双做均成立（PLAN-750 供料口径）；
- **守卫形态已知角落（记录备精化，非本批暴露）**：`draft_allocating`
  为 App 态单标量（供料范式原样）——若**另一 tab 的首次脏编辑**恰落在
  在途分配悬窗内（人手切档间隔 ≫ 悬窗，实际不可达；e2e 亦未构造），
  该 tab 的分配会被跳过且无后续重试。精化方向＝per-tab 门（tab
  draft_state 瞬态 "allocating"，同 tab 单飞 + 跨 tab 独立分配，态面
  零增字段）——本轮矩阵/vm 全绿下不动刀，留 upstream 契约面
  （ui/overview SD-01）续议；
- 「保存尾键落入 Save await 悬窗 → AC-08 脏标翻真」为预存在设计语义
  （spec 早已命名「保存点击 blur-flush 与 Save 竞态」并靠 blur 先手躲
  避）；本日实证该先手不再必胜（时序随载体漂移），产品面「Save 吸收
  在途输入」候选改造单列上游续件，本批仅测试面定靶修订；
- vm 轨零触碰（MCP 往返串行天然免疫；vm_matrix 20/20 维持即证）；
- auto-lang 侧零行为变更需求（三证）；PLAN-750 AC-01/02/05 产品面随本
  批闭环（AC-04/06/07 上游已达成）。
