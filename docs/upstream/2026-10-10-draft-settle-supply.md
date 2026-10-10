# vue 轨草稿检查点保存不结算 → LC 删除卫语句误阻：上游供料（2026-10-10）

来源：jade-edit。消费者：auto-lang 草稿运行时（`.jade/drafts/v1` 结算协议）与
宿主-引擎结算链。证据载体：debug `v0.4.2-2835-g2fd9c0599-dirty` 后本地重建
（auto-lang HEAD `c72ff953b`）；release `v0.4.2-2747-gab7a650bd` 同败（A/B 排除
PLAN-748 视图层）。这是 Jade 的上游需求包；上游走自己的 plan 流程。

## 症状

jade-edit vue 轨 e2e `matrix.spec`（六检查同单，最长 spec ≈10 分钟）在新载体上
**4/4 连败**（全量/隔离/单跑均败），败形漂移但同根：spec 后段的删除弧线被
PLAN-032 LC 生命周期卫语句拦截——alertdialog「文件操作被阻止」，阻断行 =
**`wiki/Hello World — 草稿检查点在途`** → 后续步骤在 600s 测试超时内全部阻塞
（弹层 backdrop 拦截一切点击）。删除目标 = Hello World，其检查点由**同一次
运行内更早的打字步骤**创建。

## 一手证据（e2e 工作区 `.jade/drafts/v1`，2026-10-10 实拍）

- `d0001/s00001..2.meta`：`event=saved` → `event=discarded`（结算正常，13:17:33-34）；
- `d0002/s00001.meta`：`event=discarded`（正常）；
- **`d0003/c00001.meta`：`event=checkpoint`，`path=wiki/Hello World.ad`，
  `at=13:18:10`，`len=661`——无任何 settle 记录**（打字步骤创建，随后同运行内
  的 toolbar 保存未将其结算为 saved）。

## 双轨分野（同宿主代码）

结算调用面 = jade `src/front/editor_store.at`（`draft_begin/draft_alloc/
draft_checkpoint/draft_settle`，use back.api 单点）——**双轨同一份 .at 宿主代码**：

- **vm 轨**：MCP `type_text` → toolbar 保存 → `.jade/drafts` 记录
  `event=saved` **正常结算**（一次性探针实测，draft-test-ws 干净工作区）；
- **vue 轨**：浏览器真实键入（EngineEditor）→ 保存 → 检查点记录**停留
  checkpoint 态不结算** → PLAN-032 LC 卫语句（删除目标「状态待核验」）在
  同运行后段的删除弧线误阻。

## 时序归因

- 旧载体（v0.4.2-2747 及更早）历史上同 spec 长期绿——打字→保存→删除全弧
  不阻断；
- 新载体（v0.4.2-2835 域）4/4 确定性败；jade v2 链接域批（同日落地）之前
  的运行已同形（工作区 d0003 记录 13:18 创建于 v2 批前的 e2e 运行）——**与
  jade 链接域 v2 零关联**；
- auto-down 引擎仓最后提交 2026-10-01（Plan 717）——引擎面九日未动；
  嫌疑收敛 = auto-lang v0.4.2-2835 域内草稿结算协议/运行时行为变化（checkpoint
  创建后宿主 settle 调用不再落 `event=saved`，或结算通道对引擎轨 doc 绑定
  失效）。

## 复现配方

1. 干净工作区（含任一可编辑页）；
2. vue 轨（`auto run -r vue --server vm`）浏览器键入正文 → toolbar 保存
   （脏标清零）；
3. 检查 `.jade/drafts/v1/d00XX/c00XXX.meta`：`event=checkpoint` 永久无 settle；
4. 之后删除该页（或 e2e matrix.spec ⑯ 删除弧线）→ LC「文件操作被阻止」，
   阻断行「草稿检查点在途」。

对照：vm 轨同流程（MCP type_text → 保存）→ `event=saved` 即时落。

## 影响

- jade vue e2e matrix.spec 在新载体不可达（删除弧线必阻）；
- 产品面：vue 轨用户编辑并保存过的页面，删除时被 LC 卫语句误阻（需手清
  `.jade/drafts` 方可删除）——数据无损但功能受阻。

—— jade-edit 2026-10-10（证据文件：jade-edit `e2e/.runtime/draft-test-ws`、
`e2e/.runtime/workspace/.jade/drafts/v1/d0003`、matrix.spec 四轮失败实录）
