# PLAN-032 T-01 附件：受检生命周期协议原型与决策（032-lifecycle-protocol）

日期：2026-10-01。执行：/auto-plan:work T-01。基线：jade-edit main `c8700af`（工作树仅 Plan 记账件）。
结论：**本仓可行，受检契约定型如下，继续 T-02**。证据 = 一次性探针装置（`e2e/.runtime/p32/`，git-ignored 在档再生），
编排脚本 `p32/t01.mjs` **连跑两轮各 60 PASS / 0 FAIL（ALL GREEN——原型＋失败面复测）**，完整转录
`p32/t01-transcript.log`。载体 = `D:/autostack/auto-lang/target/release/auto.exe`（debug 路径已不存在——
探针装置直接解释 .at 源，不经 gen/dist，engine dist 漂移非本装置依赖面）。

## 1. 装置形态（可复现）

- 探针后端 `p32/lifecycle_probe.at`（受检协议候选原型全文；T-02 产品化落 `src/back/lifecycle.at`，分析/纯转换/
  核验提交共享件按计划抽 wsys.at）+ 探针前端 `p32/probe_app.at`（相位经 `P32_PHASE` 环境选择：gate /
  commit-ok / stale-plan / stale-commit / late / partial-plan / partial-commit）。
- 编排：`node e2e/.runtime/p32/t01.mjs`（仓根执行，`AUTO_EXE` 指向 release auto.exe）。装配探针工程
  `p32/probe-proj/`（repo `src/back` wsys.at+drafts.at+api.at 拷贝 + 追加 `p32_*` 临时 API 面 +
  lifecycle_probe.at；031 起 api.at 含 `use drafts`——**探针工程必须随拷 drafts.at**，否则链接失败）。
  **merged 臂每相位一独立进程**（`auto run -r vm` + AUTOUI_MCP_PORT，autoui_state 读回 r1..r6），
  **split 臂同一 back 模块起 HTTP 服务**（`auto run --server vm -B <port>`，Node 直驱 plan/commit 全弧）。
- 五隔离工作区（gate/stale/late/partial/split）+ Node 侧独立 sha256/字节对照为权威。故障注入 =
  **icacls deny-delete ACL**（真内核强制；只读属性对该工具链 File.delete 无效——见 §5）。

## 2. 十类入口影响域定谳（读码实勘——T-02 分析面覆盖清单）

| 入口 | 读集合（纯读分析产出） | 变更/迁移/移除集合 | 现状风险（实勘在案） |
| --- | --- | --- | --- |
| RenameGo | 全 .ad walk + 逐页 body 的 [[old_stem]] casefold 命中判定（复用 rewrite_links 同转换） | 迁移 old→new ＋ 改写全部命中源页（自链/anchor/casefold 变体；同前缀异 stem 排除——`根页笔记.ad` 实证） | 仅前置 active_dirty；后台脏源被磁盘改写后基准失效；收尾无守卫 Reload |
| MoveGo | 源存在 + 目标 is_dir + 冲突 | 源迁移 old→new（stem 不变零改写） | 成功后无条件 Reload 当前活动页（可与目标无关） |
| DeleteGo | 源存在 + .ad 卫 | 源移入 .trash（落点 = trash_target 保结构＋`--{n}` 后缀） | CloseTabsOf 无条件移除（不查 dirty/草稿——031 离开门被绕过） |
| DelDirGo | 子树 walk（纯 .ad 卫） | 子树逐文件移入 .trash（保结构）+ 旧目录清理 | 关闭名单来自前端 ft_nodes 缓存 paths_under——可能漏已开页 |
| RenDirGo | 同上 | 子树逐文件 old→new 映射迁移 | 缓存映射 + 无条件活动页 Reload |
| MoveDirExec | 源子树 walk；目标存在性/冲突分支 | 三策略：normal/both 后缀/skip 源改道 .trash/overwrite 靶旧档改道（双对）；纯移动 = 并入名目录 | 中途失败返回 ""——之前已迁移事实丢失（AC-05 反面，本 T-01 复刻修复面） |
| LinkifyGo | 目标源页 body（词边界/已链接豁免同 010/017） | 被转换源页 write_body | 改写磁盘后不协调该页已开正文/基准 |
| TrashRestore | entry 越界/存在/目标冲突卫 | .trash 条目 → 原位（`--{n}` 尾剥） | 回收站 tab 已可编辑（预览页 dirty 无门）；恢复后未重映射 |
| TrashRestoreAll | 整批 entry + 各目标 | 整批恢复（逐条） | front 逐条边查边执行——无整批前置门（AC-09 反面） |
| TrashPurgeGo | .trash 全清单 | remove_dir_all 整目录 | 已开回收站预览 tab 未处理——旧路径保存可重建被清空文件 |

**门匹配域定谳**：前置门匹配 = `changes`（指纹域）∪ `moves` 两端点 ∪ `deletes` 两端点——deny 注入下
指纹面缺席（§5①）但 moves 端点仍在，仅按 changes 匹配会漏 overwrite 靶旧档（T-01 实证修订）。

## 3. 受检契约（冻结——T-02 按 this 落 lifecycle.at + api.at 两端点）

**接口**：`lc_plan(kind, a, b, c) str`（纯读分析，零写面）与 `lc_commit(kind, a, b, c, basis) str`
（基线复核 + 受检执行）。kind 分派：`rename`(a=old_path,b=new_stem) / `move`(a=path,b=dir) /
`delete`(a=path) / `deldir`(a=dir) / `rendir`(a=dir,b=new_name) / `movedir`(a=dir,b=new_parent,
c=""纯移动|both|skip|overwrite——非空即合并) / `linkify`(a=path,b=stem) / `restore`(a=entry) /
`restore_all` / `purge`。原型实装 rename + movedir 两代表 kind（机制面等价——分析/基线/回执/逐项核验
全链已证）；其余八类 T-02 同构补齐。

**记录文法**（位置定序；全部分隔符取 NTFS 文件名非法字符——路径结构性不含，HTTP body 安全，vm 轨
手工 split 可解析[store 上下文 json.to_value 损坏 D-20④ 规避]）：

```
LP1 | status | basis | changes | moves | rewrites | deletes     （plan；status ∈ ok|reject）
RC1 | status | dir    | moves | rewrites | deletes | errors | extra（commit；status ∈ ok|partial|stale|reject）
  列表项分隔 "*"；迁移对 "old>new"；指纹项 "rel:size:sha"（size=fs.size 字节，sha=file_sha256）
  errors 项 "slug:rel"（slug ∈ move-failed|divert-failed|rewrite-failed|verify-failed|guard-failed|cleanup-failed）
  basis = "F"+count+"*"+全 .ad rel 清单(*连)+"*"+变更域逐件指纹(*连)——前端持为不透明串原样回传
```

**核心规则**（全部实验支撑）：
1. **分析纯读零写面**（gate 相位五文件 hash 前后对照 PASS）；分析结果含 changes/moves/rewrites/
   deletes 与 basis；前端对变更域跑 Store 脏门（§4），阻断则**不调用 commit**。
2. **提交先重算比对 basis**：全 .ad 路径集身份（新增/删除/换名一律失配——戊页注入实证 stale）+
   变更域逐件 size:sha（正文/集合篡改失配——丙页注入实证）。失配 → `stale` 零变更（AC-04：六文件
   hash 保持提交前状态 PASS）。**mtime 不参与**——指纹仅 size+sha，同秒改写必被 sha 捕获。
3. **执行逐项核验**：迁移 = 复制→核验目标在→删源→核验源消（复制未核验前不删源——partial 案源 z
   保留实证）；改写 = write_body→read_body 逐字比对（AC-05）；失败即停，已完成项如实入回执，
   `status=partial`（AC-05：不假成功、不按空串猜零变化）。
4. **回执驱动协调**：moves 实际 old>new 映射 / rewrites 实际改写页 / deletes 实际移除——前端按 §4
   规则协调，不用旧 "" 推断无副作用（RC1 status 字段强制显式）。
5. **单会话单操作在途**（Store 侧状态门——T-03 落地）；确定 stale 零变更，不确定（回执丢失/解析失败）
   不自动重试，相关文档标待核验。

## 4. 前端快照结构与迟到输入协调（late 相位实证——AC-07/08 原型面）

**tab_uid**：会话内稳定整数（Open/ActNew/DraftRecover 分配，store 单调计数）；关闭即逝，重开同路径 =
新实例（不依赖列表索引/编辑器 key/doc_id——doc_id 为空的清洁 tab 同样可保护）。

**提交前快照**（每受影响实例）：`{tab_uid, path, key, doc_id, body, original_body, draft_erev,
draft_conf, draft_state, dirty}`。**回执后协调规则**（全弧三实例实证）：

| 实例状态 | 协调 | 实证 |
| --- | --- | --- |
| 路径在 moves 旧端 | path/key/title 跟随回执实际 new；tab_uid/doc_id/脏标保持；不全局 Reload | T3-followed（自链档迁移+改写双协调，正文经新路径同步） |
| 改写域命中且 body==快照 | read_wiki 读回同步 body+original_body（后台页同样） | T1-synced |
| 改写域命中但 body≠快照（等待期新输入） | **保留新正文与脏标**；不重读、不重设 original_body；标记需核对（本片不自动合并） | T2-kept:1\|review:1 |
| 协调读失败/回执缺失 | 保留正文标待核验，阻止旧路径保存（T-03/T-05 落 Store 保存门） | 规则面冻结，T-03 实装 |

真实 RPC 悬窗（vue 轨 await 期间 Edit/切页/关闭重开）的插例由 T-04 e2e route 延迟承载；本相位证明
协调规则本体（快照匹配门 + 实际映射跟随）正确。

## 5. 工具链原语定谳（T-01 新增；031 在册面不重复）

| 原语/形态 | 定谳 | 证据 |
| --- | --- | --- |
| ① `Hash.file_sha256` vs deny-delete ACL | ❌ **抛异常**（`fs.size` 同况正常返字节数；Node open 同样 EPERM）→ p_fp=""。**plan/commit 同一 ACL 状态下双方同空——基线比较仍闭环**（partial 案全链通过）。仅当 ACL 在 plan 与 commit 之间施加才失配 → stale（正确拒绝） | partial dbg `exists\|30\|throw\|fp=` |
| ② 只读属性 vs `File.delete` | ❌ **无效**——read-only 文件被直接删除（第 5 轮实证：chmod 444 后 divert 成功）。真故障注入必须 **icacls deny (D)**（内核强制） | 第 5 轮 transcript vs 第 6+ 轮 |
| ③ **跨模块调用参数槽位覆写**（新实勘，T-02 硬纪律） | 后端模块间多参调用，参数槽在函数体内被后续嵌套调用覆写——**strategy 值漏进 basis 槽**（p_movedir_commit 实证：commit 期 strategy 退化为非 skip/overwrite 值、basis 退化为 c 值）。**受检函数入口必须把全部参数快照到独立局部并用快照值**（p_rename_commit/p_movedir_commit 已照办后全绿） | 第 8→10 轮 transcript 对照 |
| ④ merged 臂 5+ 参 API 调用 | widget→back.api 五参（kind,a,b,c,basis）在**每相位独立进程 + 单一 if 块内先拷局部再调用**形态下稳定；同 handler 多相位共享变量的绑定面脆弱（stale-commit 相位曾以 basis="" 偶然 pass——修正为块内局部后按真实 basis 判定）。T-02 前端调用面遵守：**调用前拷块内局部** | 第 7→11 轮对照 |
| ⑤ basis 规模可行性 | 5 档全案毫秒级；P≤200 稳定域 plan+commit 各一次全清单指纹读（O(P)×2）可接受 | 全案时延观测 |
| ⑥ 探针工程装配 | api.at 自 031 起 `use drafts`——探针工程必须随拷 drafts.at；`use lifecycle_probe` 附加面 merged/split 双臂链接正常 | 首轮链接失败 → 修复 |

## 6. 三个关键门验证结果（计划 §5.1 全过）

1. **改名时非活动脏引用源被阻断** ✓——gate 相位：plan 变更域恰含乙页（后台引用源）+ moves/rewrites
   全集正确；Store 门模拟（脏 ∧ 变更域→阻断）产出恰 `[乙页.ad]`；无关脏丁页不阻断（D-in:no）。
2. **操作 RPC 等待中输入后结果不覆盖** ✓——late 相位：T2 新输入保留 + review 标记 + 原始基准不重设；
   T1/T3 干净实例同步/跟随正确。真实悬窗插例归 T-04 e2e。
3. **目录合并一项成功一项失败仍报告已完成映射并保留正文** ✓——partial 相位（icacls deny 真故障）：
   `RC1|partial|dst/src|src/x.ad>dst/src/x.ad|||divert-failed:dst/src/z.ad`；源 z 保留、靶 z 字节完好
   （ACL 解除后对照）、.trash 改道残件如实留痕（双份不伪造）、已完成 x 映射如实。

**blocker：无**。上游限制（vm 合并轨多检查点楔死 / split boot F-24-2 / 引擎 dist 漂移）不影响本装置
（每相位独立进程、单检查点弧、直接解释 .at 源）。关键 AC 的原生 UI 证据由 T-04 e2e 与 T-06 矩阵承载。

## 7. T-02 交接清单

- `src/back/lifecycle.at`：lc_plan_impl/lc_commit_impl 十类全实装；共享件（rewrite_links 转换、
  trash_target、move_file 组合、stem 清洗）按计划自 wsys.at 抽 pub 或以参数快照纪律复制。
- api.at 追加 `/api/lc_plan`、`/api/lc_commit`（POST body 传参——CJK 路径 D-19 免疫）；旧原始 API
  签名原样保留。
- `tests/probe_lifecycle.mjs`：以本装置为蓝本扩全十类 + 守卫码 + 注入面（mtime 同秒、短写、批次中途
  失败、响应丢失模拟在 Node 侧）。
- 前端调用纪律（§5③④）：参数入口快照 + 调用前块内局部拷贝 + 门匹配域 = changes∪moves∪deletes 端点。
