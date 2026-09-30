---
plan_id: PLAN-027
status: reviewed
feature_name: 双取形消除重推——watch 批终面（第二十五切片）
author: [agent]
created_at: 2026-09-30T00:00:00Z
updated_at: 2026-09-30T15:30:00Z
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/README.md 计划仪表盘候选②残余面（双取形消除——D-39 挂账重推，
    watch 批终面清空）
  - docs/parity-ledger.md D-39 处置更新（重推 receipt——收口 or 第十一
    例）+ D-20⑤ workaround 退役注记 + H1 v31→v32
---

# PLAN-027：双取形消除重推——watch 批终面（第二十五切片）

## 0. 变更摘要

PLAN-026 归档后的首个立项批。**立项路由依据**：README 仪表盘候选①试用
反馈件因用户反馈缺席按定文不立项；候选③上游回执件**回执已收**（026
交付：D-21 正出口 receipt 在册——③收窄解除冻结；D-19 双确认负结果
维持；D-35② 双窗负结果维持；checkbox/menubar memo/autoui_state 三件
705/706 delta 零触维持候选——无新窗口信号）；候选④剩件均弱（recents
全局化无需求信号/Time probe 独立价值低/NFKC 未触发）；**候选②残余面
唯一件「双取形消除（D-39）」的重推条件③（上游修复）已实质满足**：
PLAN-705 backend 生命周期重做已落载体（http_server 请求状态机四阶段
+ 固定 executor——026 重建双 exe 09-30 12:41/12:47 含之）+ **D-21
回执 e2e ×3 同 dev-stack（browser↔vite-proxy↔backend）HTTP 面签名
全零**（026 复审 grep 直证——ECONNRESET/ECONNREFUSED/400 missing/
SocketError 全零）+ **split 臂独立缺陷域定谳分离**（026 第十例定性
更新：706r2 交互面修复未触 split boot 域——split 失败与 D-39 竞态
域无涉，不构成重推反证）。023 r1 用户裁①「挂账降级——供上游/基建
侧消化，**后批重推**」——上游消化已落，本批即「后批」兑现（**非新
授权**：②e2e 基建授权面本批仍零触碰——复现即回退，不修基建）。
**纯内部性能优化（023 T-03 留存设计 §5.3 原样重推）**：`LinksRefreshOf`
双取形（`link_index` 两调——原文态 :2361 + 解析态 :2363）→ `json.
parse(lj)` 单取；契约零变化、state 值域零变化（`.links_json` 原文态
原样）、基线 v20 零重锁。**双出口交付**：e2e 全量 ≥3 轮绿 → D-39
重推 receipt 收口（仪表盘②残余清空——watch 批终面）；**D-39 签名
复现 → 回退出口**（app.at 还原双取形 + 第十一例实录——r1 已裁①挂账
维持，024 负结果交付先例同判）。

## 1. 目标

1. **① 单取形落地（T-01——023 §5.3 留存设计原样重推）**：
   `LinksRefreshOf` try 体（app.at:2360-2366）——`lj = link_index
   ("", 8)`（:2361）→ `.links_json = lj`（:2362——state 面原样）→
   `lp = json.parse(lj)`（替换 :2363 双取第二调 `json.to_value(
   link_index("", 8))`）；注释块 :2350-2352 更新（「⚠ to_value 双取
   形」workaround 注记 → **D-20⑤ workaround 退役注记** + json.parse
   通道双轨等价一手源引证[vm shim_json_parse_vm 与 shim_json_to_
   value 共用 json_to_vm_value 管线 + ts_adapter 对 json.parse(x)
   任意实参直发射 JSON.parse——023 §2 在册定谳]）。**触发集 v5 与
   派生段零触碰**（titles/bl/ol/wanted/orphan 顺产链原样）。
2. **② e2e D-39 触发域直证（T-02——重推判据本体）**：e2e 全量
   ≥3 轮——trash 恢复弧（:821 域——023 败形触发点）+ 全十五段绿 =
   竞态消除直证（240s 超时/树行滞留/ft_nodes 陈旧形态零复现）。
   **回退出口（预定义）**：任一轮复现 D-39 签名（树行不现→.first()
   落编辑器 wikilink 遮罩超时族）→ app.at 还原双取形（含注释块）→
   第十一例实录（023 根因链对表——同毫秒响应窗是否仍触发三层竞态）
   → 文档仍交付（②残余维持注记——无新授权面）。
3. **③ 判绿矩阵（T-03）**：merged 全组（026 复审窗 22 PASS 线——
   基线 v20 零重锁）+ split 臂（独立缺陷域留观——分段判绿 018..026
   先例 + 判别链[src 零 diff 强形不适用——本批有 diff，pre 树 A/B
   承载]）+ vue build（✓built release 路由 + SCHEMA_DRIFT_GENERATE_
   AT=1 随窗）。
4. **④ 量级面 A/B（T-04）**：bench150——link_index **双取段清偿
   直证**（pre 04ce23b 树 vs post 树、同 exe（09-30 载体）同语料
   交替 ≥3 轮——双取面 −1 全量调用差值实录；023 §5.4 在册预估带
   −0.29s/触点复核）+ boot-ready 带内或改善（在册 2.4-2.7s——预估
   ~2.1-2.4s）+ dbg 孤页弧 ≤2.0s 维持（023 冻结门——在册 742-891ms
   带宽内，双取段贡献 ≈−0.35s[023 全三改动树实录]复核）。
5. **⑤ 文档落位（T-05）**：SD-2701..2704——ARCH §5 第二十五切片段
   （单取形兑现定文 or 重推负结果在册）+ 仪表盘②残余面处置（**watch
   批终面清空** or 维持）+ ledger v32（D-39 处置更新 + D-20⑤ 行
   workaround 退役注记 + D-21 v32 扩记 + exe 时间戳实录）。

**非目标**：

- **e2e 基建任何变更**（②授权面——023 §10.6 三选之②仍待裁）：
  spec :821 锚零触碰、vite proxy 定序零触碰——复现即回退（本批
  唯一败形出口）。
- **MentionsRefreshOf/TreeRefresh/TagsRefresh 零触碰**（单取在册形
  维持——D-20⑤ 恒等陷阱对 call-arg 形无涉，023 §5.3 定谳）。
- **触发集扩展**：v5 触发集（Init/Save/面板/建页/改名/删除/移动/
  手动口）零扩。
- **失败路径语义改造**：json.parse 对空串/非法 JSON 显式 throw →
  catch → lok=false 干净落态（vs to_value null 传播 → 下游 null.
  len() 裸崩）——**差异面仅 D-35② 值损坏域（P>200 病理形）**，健康
  语料零触及，如实入档非断言面（023 §5.3 同款）。
- **split 臂 boot 域**：独立上游缺陷（026 定性更新——unblock = 家族
  专项修复），本批仅分段判绿惯例承载，不涉修复。

**成功样**：e2e 全量 ≥3 轮全绿（trash 恢复弧含——D-39 触发域直证）；
merged 全组 PASS 基线 v20 零漂移；bench150 双取段清偿 A/B 差值实录；
`.links_json` state 值域与基线零漂移；（回退出口时：双取形还原零漂移
+ 第十一例全链证据在档——双出口均交付）。

## 2. 架构方案

**现状证据链**（@04ce23b main tip 一手勘定 2026-09-30）：

- **双取形现役落点**：`LinksRefreshOf`（app.at:2356——触发集 v5
  注释块 :2343-2355）；try 体 :2360-2366——`lj = link_index("", 8)`
  （:2361）+ `.links_json = lj`（:2362）+ `lp = json.to_value(
  link_index("", 8))`（:2363——**双取第二调**）；workaround 注释块
  :2350-2352（「⚠ to_value 双取形——ts_adapter 只对 call-arg 发射
  JSON.parse[identifier 实参静默降恒等——D-20⑤]」）。**双取全仓唯一
  点**（023 实勘——tree/tags_index/search_wiki/page_meta/trash_list
  全部单取 call-arg 形）。
- **重推设计留存**：023 §5.3（app.at:2248-2254 时代行号——本批
  :2360-2366 现役对应[025 插入面平移]）+ §2 双轨等价一手源定谳（vm
  侧 shim_json_parse_vm[stdlib.rs:2878-2884] 与 shim_json_to_value
  [:3184-3222] 共用 json_to_vm_value 转换管线；vue 侧 ts_adapter 对
  `json.parse(x)` 任意实参直发射 `JSON.parse(x)`[ts_adapter.rs:
  2187-2201——恒等陷阱仅咬 to_value identifier 实参 :2156-2183]）。
- **载体现势**：双 exe 09-30 12:41（release）/12:47（debug）——026
  重建载体（706r2 修复 + 708/709 在含）；026 复审窗 e2e ×3 + 矩阵
  r1/r2 + grep 全零实录（D-21 receipt——dev-stack HTTP 面稳定直证）。
- **D-39 在册态**：ledger v31——形态/根因链（恢复弧单取使 Links
  RefreshOf 提前 ~1RTT → 串联响应同毫秒完成 → browser 侧 fetch 200+
  秒未落 → ft_nodes 陈旧 → 树行不渲染 → :821 .first() 落编辑器
  wikilink 遮罩 240s 超时）/二分四象限定谳/unlock 三选；026 split
  面第十例注记（**独立缺陷域分离**——split boot FAIL 与 dev-stack
  竞态无涉）。
- **量级在册**：link_index 281-282ms@150 页（双取各一趟——023 复审
  窗）；boot-ready 2455-2683ms；dbg 孤页弧 742-891ms（≤2.0s 门在册
  过门态）；023 全三改动树曾测 545/495/503ms——T-03 双取段贡献
  ≈−0.35s 在册。
- **基线/探针现势**：structure-v20（025 重锁第七例——`dirmerge_
  strategy` 字段面）；probe 族 15 件（probe_mtime release 载体挂起
  D-41 在册——debug 载体路由纪律）。

**改法**（单点替换——023 §5.3 原样）：

1. **app.at 单点**：:2363 `lp = json.to_value(link_index("", 8))`
   → `lp = json.parse(lj)`（:2361 已取原文复用——单取）；:2350-2352
   注释块改「**D-20⑤ workaround 退役**（023 挂账→027 重推兑现）：
   json.parse 通道双轨等价一手源在册（vm 共用转换管线/ts_adapter
   任意实参直发射）——单取形；失败路径差异面见 §1 非目标」。其余
   零触碰（state 赋值序/派生段/console 形原样）。
2. **等价论证（023 §2 承载复引）**：健康语料——`json.parse(lj)` ≡
   `json.to_value(link_index(...))`（同字节输入同解析管线）；`.links_
   json` state 值域 = lj 原文（原样）；fetch 趟数 2→1（幂等语义下
   输出面零变化）。
3. **回退出口装配**：D-39 签名复现 → git 还原 app.at 本批 diff（单
   点还原零残余）+ 第十一例实录（根因链对表：trace 复采[playwright
   network trace——同毫秒响应窗是否仍现]）。

## 3. 技术栈

- **front**：app.at 单文件单点（:2363 + :2350-2352 注释块）——vue 轨
  经 regen-vue 发射（gen 源检断言面）。
- **back**：零触碰（api.at/wsys.at 零 diff——AC 断言）。
- **验证链**：playwright e2e 全量 ×3（D-39 触发域判据）+ tests/
  vm_matrix.mjs（基线 v20——merged 全组 + split 分段惯例）+ vue
  build（release 路由）+ bench150 + dbg 孤页弧（dbg-p22 口径）+
  probe 全族 15 件 fresh（probe_mtime **debug 载体路由**——D-41
  release 挂起在册注记）+ A/B（pre 04ce23b 树 git-archive 物料 vs
  post 树——D-37⑦ 物料纪律 + archive 不含 deps 补拷教训）。
- **基线**：structure-v20 零重锁（state 值域零变化——零重锁续例）。

## 4. 需求分析与背景调查

**授权记录**（技能纪律：不发明授权/预算）：

- 本次授权 = 用户 `/auto-plan:new` 调用（「计划026已经完成，请继续
  规划下一个计划」）——**起草权 only**，本技能不实施。
- **重推授权依据 = 023 §10.6 ①裁定的内含语义**（「挂账降级——供
  上游/基建侧消化，**后批重推**」）：上游消化已落（PLAN-705 backend
  生命周期重做 + 026 重建载体 + D-21 回执 dev-stack HTTP 面全零）→
  「后批」条件到达，重推 = 既有裁定的执行兑现，**非新授权**。②
  e2e 基建授权面零触碰（复现即回退——唯一败形出口）；③上游修复
  面即本轮证据载体。
- **主题选择**：池序路由（①缺/③回执已收/④弱）→ ②残余唯一件重推
  （024/025/026 先例：池序自主择定 → 用户执行追认）。用户改向出口
  §10.1。
- 无用户预算/自动续跑限制给到——不发明。
- **base**：main @04ce23b（工作树 clean——026 归档 tip；符号行号
  实勘载体）；载体 = 双 exe 09-30 12:41/12:47（026 重建——A/B 同
  exe 面）。
- **Specs 状态**：本仓无 docs/specs/（023..026 同款声明）——
  canonical = ARCHITECTURE.md + README.md + parity-ledger.md@v31。

**背景引证**：

1. 重推设计：archived/023 §5.3（单取形设计全文——本批 §1 原样承载）
   + §2（双轨等价一手源定谳）+ §8 T-03 块（实现-回退-根因链-二分
   四象限全录）+ §9 r2（用户裁①实录）。
2. D-39 现势：ledger v31 D-39 行（形态/根因链/unlock 三选 + 026
   split 面第十例独立缺陷域注记）；D-21 行 v30/v31（705 后零复现
   receipt——dev-stack HTTP 面稳定直证）。
3. README :775-780（②残余面 + ③026 收口注记 + 留观面板 split 独立
   缺陷域定性）。
4. app.at :2343-2370（双取形现役 + workaround 注释块——本批 §2
   实勘）。
5. 量级在册：023 §5.4 预估带（−0.29s/触点；dbg 贡献 ≈−0.35s）+
   023/026 复审窗 bench 实录带。

## 5. 详细设计

### 5.1 单点替换与源检（T-01）

- **替换面**（§2 改法 1 全文——:2363 单行 + :2350-2352 注释块三行，
  本批 app.at 全部 diff 面）。
- **gen 源检**：regen-vue 后 App.vue `link_index` 调用点**恰 1 处**
  （`lp = JSON.parse(await link_index('', 8))`——ts_adapter 对
  json.parse(call-arg) 发射形；023 r2 复审记录在册形态 :646 兑现）。
- **vm 轨发射**：`json.parse` native 1902 直调（shim_json_parse_vm
  ——023 全三改动树 vm 轨全绿在册，merged 矩阵承载）。

### 5.2 e2e 判据与回退出口（T-02——重推判据本体）

- **判据面**：e2e 全量 ≥3 轮（026 载体惯例——D-21 receipt 同窗
  口径）；**trash 恢复弧重点直证**（:821 域——023 确定性败形点：
  TrashRestore → LinksRefreshOf+TagsRefresh+TreeRefresh 三刷并发 →
  树行渲染 + .first() 解析）；全绿判据 = 十五段 PASS + 零 pageerror
  + 零 240s 超时族。
- **复现判据（回退触发）**：任一轮出现 023 签名族（树行恒缺→.
  first() 落编辑器 wikilink 遮罩拦截→240s 超时；或 ft_nodes 陈旧
  形态）→ 判 D-39 竞态未消 → 回退出口（§2 改法 3）。
- **回退出口**：app.at 单点还原（含注释块——双取形+workaround 注记
  原样）+ trace 复采（playwright network trace——同毫秒响应窗对表
  023 05.106/05.107 形态）+ 第十一例实录（ledger/README 落位——
  「705 后竞态续在」负结果在册）。

### 5.3 量级 A/B 与门（T-04）

- **A/B 口径**：pre 树（04ce23b git-archive + deps 补拷——D-37⑦/
  022/023 物料形状教训）vs post 树，同 exe（09-30 载体）同语料
  （标准 wiki-demo + p21-ws150）交替 ≥3 轮——link_index 双取段
  差值直证（pre 双趟 vs post 单趟）。
- **门**：dbg 孤页弧 ≤2.0s（023 冻结门数值面维持——在册 742-891ms
  带宽内预期）；bench link_index / boot-ready **记录面**（带内或
  改善实录——023 §5.4 口径：boot-ready 预估 ~2.1-2.4s 不设门）。
- **越门出口（预授权——022 §10.1/023 §5.4 同款续）**：同窗重跑一次
  （D-21 家族负载窗口径）；仍越门 → dbg 分量归因如实记交复审裁处。

### 5.4 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2701 | modify | docs/ARCHITECTURE.md §5（后端） | before：§5 第二十四切片段（SD-2601——回执批定文）+ 第二十一切片段 SD-2301 ③双取形消除挂账定文（D-39——双取形/D-20⑤ workaround 维持在册，unlock 三选随 D-39）。after：§5 第二十五切片段——**双取形消除兑现定文**（json.parse 单取形——LinksRefreshOf fetch 2→1；D-20⑤ workaround 退役注记 + 双轨等价一手源引证；失败路径差异面定文[parse throw → catch → lok=false 干净落态——仅 D-35② 值损坏域，健康语料零触及]；量级实录[双取段清偿 A/B 差值]）——**或重推负结果形态**（回退出口：双取形维持在册 + 第十一例实录 + 「705 后竞态续在」定谳注记——双出口文本对应） | ②残余面终件；023 r1 裁①「后批重推」条件③到达（705 + D-21 receipt + split 域分离） | AC-01/02/03/04 |
| SD-2702 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests heading | before：§6 SD-2602 注记（第二十四切片——回执批零扩单）。after：第二十五切片注记——纯内部性能片续例：零扩单零子步（既有断言域全量承载[e2e ×3 加强面注记] + gen 源检单取发射形 + 基线 v20 零重锁续例 + probe_mtime debug 载体路由纪律[D-41 注记]） | §6 heading 惯例随批扩（SD-2202..2602 先例续） | AC-02/03 |
| SD-2703 | modify | docs/README.md（是什么 + Tests N 定谳 + 计划仪表盘 + 留观面板） | before：是什么第二十四切片条目 + 仪表盘②残余面（双取形消除 D-39 挂账）。after：是什么第二十五切片条目（双取形消除重推——单取形/量级实录/D-39 处置分岔）+ Tests N 定谳 027 实录 + 仪表盘②**残余面清空**（watch 批终面注记——①..④ 池面更新）or ②维持（回退出口注记）+ 留观面板续记（split 独立缺陷域/D-41/D-35② 惯例） | 知识库三件形惯例（019..026 先例续） | AC-04/06 |
| SD-2704 | modify | docs/parity-ledger.md | before：v31——D-39（unlock 三选 + 026 split 面第十例注记）+ D-20⑤（双取 workaround 在册）+ D-21 v31。after：v31→v32——**D-39 处置更新**（重推 receipt：e2e ×3 直证收口[行改归档注记] or 第十一例实录[维持]）+ D-20⑤ 行 workaround 退役注记（或维持）+ D-21 v32 扩记（执行窗实录惯例）+ exe 时间戳实录（09-30 载体） | 衍生账随批刷新惯例（SD-2104..2604 同款） | AC-06 |

## 6. 测试设计

- **e2e ×3（AC-03 主证——重推判据）**：全量十五段 ×3 轮（trash
  恢复弧重点直证——:821 域零触碰前提下跑；D-39 签名族[树行恒缺/
  .first() 遮罩超时/ft_nodes 陈旧]逐轮 grep）+ pageerror 零断言。
- **判绿矩阵（AC-02）**：merged 全组（22 PASS 线——基线 v20 零漂移；
  `.links_json` state 值域 + id 序列零变化）+ split 臂（独立缺陷域
  留观——分段判绿 + 判别链：pre 树 A/B 物料承载[本批有 src diff，
  「src 零 diff 强形」不适用——023 二分四象限同款 A/B 形]）+ vue
  build ✓built（release 路由 + SCHEMA_DRIFT_GENERATE_AT=1）。
- **gen 源检（AC-01）**：App.vue `link_index` 调用点恰 1 处 +
  `JSON.parse(await link_index('', 8))` 发射形（regen 后）。
- **probe 全族（AC-02）**：15 件 fresh 双臂（probe_mtime **debug
  载体路由**——D-41 release 挂起在册，release 面 skip 注记；receipt_
  d19 负结果在册一致形）。
- **量级（AC-04）**：bench150 四点（boot-ready/link/tags/search）
  + dbg 孤页弧（dbg-p22 口径 ≤2.0s 冻结门）+ A/B 交替 ≥3 轮（pre
  04ce23b 物料 vs post 树——同 exe 同语料）。
- **负向证七面（AC-05）**：api.at/wsys.at diff 0（back 零触碰）/
  e2e spec diff 0（:821 锚零触碰——②授权面不涉）/ MentionsRefreshOf
  ·TreeRefresh·TagsRefresh 零触碰 grep / 基线 v20·冻结池零触碰 /
  gen·dist ignored 零手改 / A/B 物料仓外即用即删（D-37⑦）/ 一次性
  件居 ignored .runtime。

## 7. 验收标准

- **AC-01 单取形落地与源检**：app.at :2363 单取形 + 注释块退役注记
  （本批全部 src diff 面 = app.at 单文件单点）+ gen 源检 App.vue 调用
  点恰 1 处（JSON.parse 发射形）。验证：diff 面 grep + gen 源检输出
  内嵌 §8。
- **AC-02 数据面零漂移**：merged 全组 PASS（基线 v20 零重锁——
  `.links_json` 值域/id 序列零变化）+ probe 全族 15 件 fresh（probe_
  mtime debug 路由注记）+ api.at/wsys.at 零 diff。验证：矩阵/probe
  输出 + `git diff 04ce23b -- src/back/` 0 行。
- **AC-03 e2e D-39 触发域直证（重推判据——双出口）**：e2e ×3 全绿
  （trash 恢复弧含、D-39 签名族零复现）→ **收口出口**：D-39 处置
  收口落 SD-2701/2704 + 仪表盘②清空；**复现 → 回退出口**：app.at
  还原 + trace 复采 + 第十一例实录（双出口均 pass 形——回退出口下
  AC-01 改判「还原零漂移直证」+ AC-04 N/A 注记，非静默移除）。验
  证：e2e 日志 ×3 + 签名 grep 输出内嵌 §8。
- **AC-04 量级面**：dbg 孤页弧 ≤2.0s（冻结门维持）+ bench link_
  index/boot-ready 带内或改善实录 + **双取段清偿 A/B 差值直证**
  （pre/post 同 exe 交替 ≥3 轮）。验证：bench/dbg/A/B 值内嵌 §8。
  **（回退出口 N/A 注记。）**
- **AC-05 负向证全零**：§6 七面全零违例。验证：各面命令输出内嵌
  §8。
- **AC-06 文档锚位与一致性**：SD-2701..2704 落位（ARCH §5 第二十五
  切片段[双出口文本对应] + §6/README Tests heading + README 是什么/
  N 定谳/仪表盘②处置 + ledger v31→v32）+ 实测分岔与文档一致。验
  证：锚位 grep 读回全现 + delta after 与落地文本一致性核验。

## 8. 执行步骤

- **T-01 单点替换 + gen 源检（AC-01）**：app.at :2363 单取 + 注释
  块退役注记 + regen-vue 源检（调用点恰 1 处 + 发射形）。依赖：
  无。
  - [x] 已执行→随 T-02 复现**还原**（AC-01 改判「还原零漂移直
    证」兑现——§8 分岔记录）。执行窗实录：app.at :2363
    `json.parse(lj)`+ :2350-2352 退役注记（git diff 单文件单点 6+/4-
    行）；regen-vue ✓built 14.93s；gen 源检 App.vue 调用点恰 1 处
    （:647）+ 发射形 `lp = JSON.parse(lj)`（:649）。还原后：git diff
    04ce23b -- src/ = **0 行** + gen 回归双取形 :647+:649
    （`JSON.parse(await link_index('', 8))`）。
- **T-02 e2e ×3 重推判据（AC-03）**：全量 ×3 + 签名族逐轮 grep +
  分岔（收口/回退——回退 = app.at 还原 + trace 复采 + 第十一例
  实录）。依赖：T-01。
  - [x] **回退出口触发并执行**（§5.2 复现判据命中）。六轮实录：
    r1 进程死亡（D-21 族——RecCap 弧 ECONNREFUSED 8211→⑩a 磁盘
    断言败，D-39 域未达）/ r2 **D-39 签名复现**（:820 `.first()`
    解析到编辑器 wikilink span `autodown-wikilink-label` 被
    `autodown-block-boundary` 持久拦截→240s 超时；aria 240s
    TrashMe 树行恒缺[recents/LINKS 面有行]=ft_nodes 陈旧形）/ r3
    **同签名再现+trace 复采**（`--trace on`：trash_restore 46.321
    后三刷响应聚集——link_index 46.403/ws_root[tree] 46.456/
    tags_index 46.456[同毫秒 dt=-0ms]/search 46.486/二次 tree
    46.491，此后 ~234s 零再取——023 trace 05.106/05.107 同族一手
    复采）/ 还原后 r4 绿 1.6m / r5 popover 瞬态（D-21 v11③ 族
    :686，D-39 域未达）/ r6 绿 1.6m。**A/B 终形：单取形 D-39 域
    2/2 败 vs 双取形 2/2 绿**——023 四象限定谳在 705+706r2 载体
    再证「705 后竞态续在」。日志 p27-e2e-r1/r2/r3-trace/r4-revert/
    r5-revert/r6-revert.log + p27-r3-trace.zip（ignored .runtime）。
- **T-03 判绿矩阵 + build（AC-02）**：merged 全组（基线 v20）+
  split 分段（A/B 物料判别链）+ build + probe 全族 15 件（debug
  路由注记）。依赖：T-01（与 T-02 可并行）。
  - [x] 还原树上执行（零 diff 强形——受审树 ≡ 04ce23b 026 复审
    树）。merged 矩阵 **22 PASS 全组绿**（[B baseline] v20 零漂移
    在录——零重锁续例；p27-matrix-r1.log）/ split 臂 boot/tree
    PASS+[3 open] 编辑器面未现=**F-24-2 族内漂移形**（024 复审窗
    先例同形——F-R17-1 独立缺陷域维持，第十一窗观察；分段判绿
    018..026 先例续，判别链=src 零 diff+merged 同窗全绿+probe
    split 臂 HTTP 全绿+e2e 还原后绿）/ build ✓built 18.54s
    （SCHEMA_DRIFT_GENERATE_AT=1，p27-build.log）/ probe 双电池：
    debug 15 路由全绿（14 RESULT exit=0+receipt_d19 在册守望形
    g① body=0/g② len=0/g③/g④ PASS=D-19 负结果一致）/ release 14
    路由（13 绿+casefold r1 ECONNRESET D-21 瞬态→r2 重跑即绿 58
    PASS+守望件同形；probe_mtime **skip——D-41 debug 路由纪律**
    §10.4）。
- **T-04 量级 A/B（AC-04）**：bench150 + dbg 孤页弧 + pre/post
  交替 ≥3 轮（04ce23b 物料）。依赖：T-01。**（回退出口 N/A。）**
  - [x] **N/A 注记兑现**（AC-04 非静默移除——回退出口 src 零
    diff，量级面维持 023/024 在册数值带零漂移；bench/dbg 零跑）。
- **T-05 文档落位（AC-05/06）**：负向证族 + SD-2701..2704 + 仪表盘
  ②处置 + ledger v32 + §9 work 记录。依赖：T-02..T-04。
  - [x] 负向证七面全零：①git diff 04ce23b -- src/ = 0 行②e2e/
    scripts 授权面 = 0 行③单取形零残余 grep（json.parse(lj)/退役
    注记 = 0；「to_value 双取形」原注记 = 1）+ MentionsRefreshOf/
    TreeRefresh/TagsRefresh 零触碰（零 diff 蕴含）④基线池 = 0
    行⑤gen/dist 居 ignored 零手改（check-ignore 直证）⑥A/B 物料
    仓外（p27-r3-trace.zip 等居 ignored .runtime；trace 解包目录
    即用即删）⑦一次性件居 ignored（check-ignore IGNORED-OK）。
    SD-2701..2704 落位（ARCH §5 第二十五切片段[回退出口形]+§6
    heading+README 是什么/Tests heading/N 定谳/仪表盘②维持注记/
    留观面板三处续记+ledger H1 v32+D-39 v32 第十一例+D-20⑤ 退役
    挂起+D-21 v32 三例实录+D-35② 续证+D-41 注记）。

执行期行号复核约定：§2 符号行号 @04ce23b 勘定——work 期随树复核。

## 9. 复审记录

- **2026-09-30 draft handoff（auto-plan:new）**：
  - `stage: new`，PLAN-027，revision 1（drafting）。
  - 立项路由：池序（①缺/③回执已收/④弱）→ ②残余唯一件重推；重推
    条件③证据链（705 backend 重做 + 026 重建载体 + D-21 receipt
    e2e×3 dev-stack 全零 + split 域独立缺陷分离定谳）；授权依据 =
    023 r1 裁①内含「后批重推」（非新授权——②基建面零触碰，复现即
    回退）。024/025/026 先例（池序自主择定 → 用户执行追认）。用户
    改向出口 §10.1。
  - 契约完备性：任务覆盖全部 AC 与 SD（T-01→AC-01 / T-02→AC-03 /
    T-03→AC-02 / T-04→AC-04 / T-05→AC-05/06）；双出口交付形态
    （024 负结果先例）；路径与判据 grounded（§2/§4 一手勘定）。
  - `outcome: pass`（记录授权内——起草 + handoff；work 由用户
    auto-plan:work 入口启动）。
  - `next: work`（T-01 单点替换起——回退出口内置）。

- **2026-09-30 work 交接（auto-plan:work）**：
  - `stage: work` | PLAN-027 | revision 1 | **outcome: pass（回退
    出口交付形——双出口设计命中回退臂，非 needs_fix）**。
  - `code_commit`：本提交（执行窗 base=04ce23b——**src 零 diff 终
    态**，git diff 04ce23b -- src/ = 0 行；工作树全程单检出直接
    main 线性惯例 001..026 在档）。
  - `task_ids`：T-01..T-05 全完结（T-01 改判还原零漂移直证/T-02
    回退出口触发并执行/T-03 判绿窗零 diff 强形/T-04 N/A 注记/
    T-05 文档落位）。
  - `evidence`：**D-39 第十一例全链**——重推执行（023 §5.3 原样：
    :2363 单取+退役注记；gen :649 JSON.parse(lj)）→ e2e r2/r3 D-39
    签名族 2/2 复现（:820 .first() 落编辑器 wikilink span 被
    block-boundary 拦截→240s；aria 240s 树行恒缺=ft_nodes 陈旧）
    + trace 复采（同毫秒簇 46.456s dt=-0ms+弧内 link_index 恰 1+
    ~234s 零再取）→ app.at 还原（0 行）→ A/B 单取 2/2 败 vs 双取
    2/2 绿（r4/r6）——「705 后竞态续在」定谳（023 四象限在
    705+706r2 载体再证）。判绿窗：merged 22 PASS（v20 零漂移）+
    probe 双电池（release casefold r2 重跑即绿）+ build ✓built
    18.54s。D-21 族瞬态三例同窗实录（r1 进程死亡/casefold
    ECONNRESET/r5 popover——双树均现，重跑即绿 ×2）。
  - `blockers`：无（回退出口为计划内预定义交付形）。
  - `next`：review（复审基线=本提交；review 判据=双出口文本对应
    [SD-2701/2703/2704 回退出口形]+AC-01 改判+AC-04 N/A 注记+负
    向证七面）。

  执行窗观察二件（非阻断）：
  1. README 「文档」节 ledger 指针仍标 v27（024..026 均未随批刷
     新——SD-2703 授权面不含「文档」节，本批维持不动；随复审裁处
     是否补正）。
  2. split 臂本窗 F-24-2 族内漂移形（boot/tree PASS+[3 open] 编辑
     器面未现——024 复审窗先例同形），F-R17-1 第十一窗观察在册；
     unblock 同前=家族 split 臂专项修复。

- **2026-09-30 复审 pass（auto-plan:review）**：
  - `stage: review` | PLAN-027 | revision 1 | **outcome: pass** |
    reviewed_commit=**1296ac3** | base_commit=04ce23b。
  - **同会话复审声明**：本复审与执行同会话——裁定全部由工件独立
    重放重建（非执行期摘要采信）。dependency_revisions=家族
    auto-lang（exe 载体磁盘核验一致：debug 128,245,248B@09-30
    12:47/release 81,313,280B@09-30 12:41——执行窗与复审窗同值）；
    spec_inputs=ARCHITECTURE.md+README.md+parity-ledger.md@v32
    （本仓无 docs/specs/——canonical 三件形 023..026 同判）。
  - `acceptance_results`（1296ac3 树 fresh 重放）：
    - **AC-01 pass**（改判「还原零漂移直证」重放）：git diff
      04ce23b -- src/ = 0 行 + gen 源检现势重放（复审 build 重生
      gen：App.vue :647+:649 双调 `JSON.parse(await link_index('',
      8))`——023 在册现役形）+ 单取零残余 grep（json.parse(lj)/退
      役注记 = 0；「to_value 双取形」原注记 :2350 现位）；执行窗
      单取形证据在档（r2/r3 日志签名 grep 各 1 现+trace zip+
      :649 JSON.parse(lj) 实录内嵌提交信息与计划 §8）。
    - **AC-02 pass**：merged 矩阵 fresh 重放 **22 PASS 全组绿**
      （[B baseline] v20 零漂移在录——p27-review-matrix.log）+
      probe 抽检 4 件 fresh 重放（probe_trash/probe_dir_ops/
      probe_mtime[debug 路由]全绿 exit=0+probe_receipt_d19[release]
      守望形逐字一致 g① body=0/g② len=0/g③/g④ PASS=D-19 负结果
      在册）+ 电池余量 reuse-with-reason[执行窗终态=复审树零 src
      变化+同 exe+同配置——双电池 fresh 全录 exit 码在档 §8]+
      api.at/wsys.at 零 diff（src 零 diff 蕴含）。
    - **AC-03 pass**（回退出口臂）：e2e ×6 执行实录在档（p27-e2e-*
      六日志+trace zip）+ 复审 e2e fresh 重放 **绿 1 passed 1.2m**
      （HTTP 面签名全零 grep 直证）+ split 臂复审重放=[1 boot]
      FAIL+`button "wiki" not found`=**v23..v27 在册主导形**（执行
      窗 F-24-2 漂移形与复审主导形=同独立缺陷域两形并存——分段判
      绿维持，判别链=src 零 diff+merged 22 PASS 同窗+probe split
      臂 HTTP 全绿+e2e 同窗绿）。
    - **AC-04 pass**（N/A 注记兑现重放）：§8 T-04 块在档（AC-04
      非静默移除）。
    - **AC-05 pass**：七面重放全零（src/e2e+scripts/基线池 diff 0
      行×3+tracked 工作树零改+ignored check-ignore 直证）。
    - **AC-06 pass**：锚位读回全现恰一（ARCH SD-2701/第二十五切
      片/SD-2702 续；README SD-2701/SD-2702 再扩定/N 定谳/是什么条
      目/仪表盘②维持/留观面板第十一窗观察 ×3 处；ledger v32 H1/
      指针续/D-39 v32/D-20⑤/D-21 v32/D-35②/D-41 恰一×7）+ delta
      after 回退出口形一致性抽核（SD-2701/2704 双出口文本对应兑现
      ——SD-2703「量级实录」为收口臂措辞，落地走回退臂 A/B 对拍
      非静默移除）。
  - `findings`（二件非阻断观察）：
    - **F-27-R1**：README「文档」节 ledger 指针滞留 v27（023 后
      024..026 三批均未随批更新——SD-2703 授权面外；语义面=指向
      件版本号漂移非内容错）；随 merge 窗补正或维持留观，交裁。
    - **F-27-R2**：split 臂双形并存确认（执行窗 F-24-2 漂移形+
      复审 boot FAIL 主导形——均在册先例形，零新缺陷；F-R17-1
      第十一窗观察成立，unblock 同前=家族 split 臂专项修复）。
  - `evidence`：p27-review-{matrix,e2e,build}.log+probe 抽检四日志
    （ignored e2e/.runtime）；durable 面=计划 §8/§9+ledger
    v32+四文档锚位+提交信息内嵌值。
  - `next`：**merge**（用户已授权 review→merge 连跑；merge 基线=
    1296ac3）。

## 10. 待澄清事项

1. **主题确认（draft 阶段出口）**：本 draft 按池序择②残余唯一件重推；
   用户如提供真实试用反馈（池定义首位）或改选他项，本 draft 转
   revision 或废立——不静默改向（024..026 §10.1 同款）。
2. **D-39 三选状态澄清**：本批 = ①裁定内含「后批重推」的执行（③
   条件满足证据下）；**复现 → 自动落回①维持**（双取形在册），②
   e2e 基建授权修仍待用户明示（本批不启用——spec/proxy 零触碰）。
3. **split 臂留观（独立缺陷域）**：026 定性更新后 unblock = 家族
   split 臂专项修复——本批分段判绿惯例 + 判别链（pre 树 A/B 物料
   形——本批有 src diff，「src 零 diff 强形」不适用）；split 结果
   不构成本批重推判据（域分离在册）。
4. **D-41 probe_mtime release 挂起**：probe 全族复跑 debug 载体
   路由纪律（release 面 skip 注记——上游供料候选在册，本批不修）。
5. **量级门数值面**：dbg 孤页弧 ≤2.0s 冻结门维持（023 口径）；
   bench/boot 记录面（023 §5.4 口径——预估带复核，不设新门）；
   越门出口预授权（§5.3）。
6. **家族窗观察惯例续**：exe 时间戳随批实录（09-30 载体档——D-35
   处置列）+ D-21 v32 扩记（执行窗实录）+ 窗况记录。
7. **执行窗闭环（2026-09-30 work 收口）**：①主题确认=用户 work 入
   口调用即执行追认（024..026 池序先例同判）；②D-39 三选=复现落
   回①**已执行**（还原即兑现；②基建授权面零触碰维持待裁；③供料
   证据链加强）；③split 臂=F-R17-1 第十一窗观察（F-24-2 漂移形）
   在册，域分离维持；④D-41=debug 路由纪律已循（release skip）；
   ⑤量级门=N/A（回退出口）；⑥exe 09-30 档实录=D-35② 续证（重建
   后首证）。
