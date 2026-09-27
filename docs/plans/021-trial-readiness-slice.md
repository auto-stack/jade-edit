---
plan_id: PLAN-021
status: reviewed
feature_name: trial-readiness-slice
author: [zhaopuming]
created_at: 2026-09-27T17:19:53+08:00
updated_at: 2026-09-27T19:40:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-2101"
  - "docs/ARCHITECTURE.md#SD-2102"
  - "docs/README.md#SD-2103"
  - "docs/README.md#SD-2104"
touched_goals: []
---

# [PLAN-021] 试用赋能批——recents 持久化（持久层首开）+ P≤200 试用防线 + 真实规模首轮实测

## 0. 变更摘要

PLAN-020 §10.5 建议「试用驱动阶段」的**赋能前置批**（池内可立项件
仅 recents 持久化；其余全门控/量级触发——§2.1 对表），三件：

1. **recents 持久化**（020 §10.3 留口兑现——**back 持久层首开**）：
   `.jade/recents.txt`（工作区根点前缀目录——**walk 忽略面一手源
   免索引**[D-33①/SD-302]）；back 双契约 `recent_paths_get() str`
   （GET 无参——零 D-19 面）/`recent_paths_set(paths str) bool`
   （POST）；换行分隔清单**原样存取**（与 020 App 态 recent_paths
   str 形态[D-37①]直通——front 零转换）；Init 载入 + 变更即存
   （≤10 行小文件无 debounce）——**会话域 → 工作区域升级**（跨
   会话/跨重启：重启后快开空 q 显上次「最近」——试用核心润滑）。
2. **P≤200 试用防线**（D-35② 处置更新——试用保护面）：front 树
   刷新时 .ad 计数 > 200 → StatusBar 警示行「工作区超 200 页（上游
   VM 上限）——索引可能不稳定」+ console（D-35② 在册判据：500 页
   实勘损坏、200 安全线）；**不禁用不拦截**（如实警示口径——真实
   工作区超限时用户知情自判）。
3. **真实规模首轮实测**（bounded investigation + 决策工件——PLAN-022
   「试用反馈件」首批输入）：合成 **150 页语料**（P≤200 安全线内；
   CJK/深目录/别名/tags/悬空混布）专项冒烟——索引/检索/改名/建页/
   建目录全链 + 计时实录 + **findings 清单工件**（进本计划 §10 与
   复审记录——上游/本仓分账）。

上游缺口适配内置：D-20②；D-24②③④⑤；D-25①；D-26②；D-28②；
D-29①；D-30①；D-31；D-33②；D-37①（recent_paths str 形态直通）。

## 1. 目标

- **G1（recents 持久化可用·双轨）**：开 3 档 → 重启（e2e = page
  reload / vm = 进程重启矩阵外直证面）→ Ctrl+P 空 q → 「最近」
  3 行恢复（跨会话）；recents 变更即落盘（磁盘逐行验）；缺档容错
  （首跑 .jade 不存在 → get 返回 "" → 空态现状）；工作区隔离
  （.jade 居工作区根——每工作区独立清单）。
- **G2（P≤200 防线可用·双轨）**：合成 >200 页语料（直证面 201 页
  微语料）→ 启动 → StatusBar 警示行 + console；≤200（现行语料/
  实测语料）→ 零警示回归；警示**不影响任何功能路径**（纯显示面）。
- **G3（真实规模实测工件）**：150 页语料全链冒烟绿 + 计时实录
  （索引/检索/建页/改名四点）+ findings 清单（≥0 项如实——预期
  观察点：索引耗时/快开过滤延迟/e2e 段时长膨胀）→ 工件进 §9/§10。
- **G4（测试面）**：find 组子步扩（持久化跨会话弧线）+ boot/tree
  组子步（防线）——**组数不变 16/15/十五段**；基线 **v19** 计划内
  重锁（App ws_warn 面 + recent_paths 载入值域[首跑→载入态]）。
- **非目标**（明确排除）：
  - **通用 KV 持久层**（`state_get/set(key)` 泛化面——v1 专用双
    契约；泛化随第二持久需求出现时再议[避免过早抽象]）；
  - recents 容量/顺序配置、多清单（favorites/pinned——试用反馈
    触发）；
  - **P>200 索引分页/降级策略**（上游 D-35② 根修前的工程绕行——
    不做；防线=知情口径）；
  - 大文档（1MB read_wiki 阻塞——§3 在册 blocked-upstream，防线
    不涉）；**真实用户语料实测**（用户侧动作——本批合成语料代行；
    用户试用反馈另通道）；
  - 大纲（anchor-reveal 十二片门控）、索引单趟（D-35 后）、Time
    front probe、NFKC、合并三择 r3、批量 restore、F-R19-1 r3、
    checkbox/url_decode 回执（池内顺延）、上游件实做与生成物补件
    （AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第二十片是试用赋能批

- **候选池对表**（PLAN-020 §10.6 + ledger v24 实核）：大纲（门控
  维持——上游 grep 0，auto-lang 忙 PLAN-043/清理裁定）、索引单趟
  （D-35② 后移）、**recents 持久化（本批主件——020 §10.3 留口 +
  试用第一痛点[重启丢最近清单]）**、孤页宽口径/合并三择/批量
  restore/F-R19-1（反馈或量级触发）、Time front probe/NFKC（低值
  未触发）、checkbox/url_decode 回执（上游未动）、试用反馈件
  （**未至**——用户尚未反馈）。北标口径（SD-405）+ 020 §10.5：
  **功能面 18 片已完备，瓶颈从「缺功能」移向「可用性验证」**——
  本批三件分别解决：试用润滑（跨会话 recents）、试用安全（P≤200
  防线——真实 wiki 立即会撞的上游限）、试用数据（150 页实测工件
  = 反馈代行）。**赋能批之后进入纯反馈驱动**（PLAN-022+ 无反馈
  则转上游回执/微件池）。
- **形态复用度**：持久层 = File 族原语（read_text/write_text/
  create_dir 递归已证）+ dot-dir 免索引在册语义；防线 = 树刷新
  计数（collect_ad_paths 复用）+ StatusBar 条件行；实测 = probe/
  e2e 资产 + pick_port（016）。**零新 UI 形态、零探针**。

### 2.2 数据面（back：持久层双契约首开）

```rust
/// 最近打开清单读（换行分隔原样；缺档 = ""）
/// GET /api/recent_paths_get
#[api(method = "GET", path = "/api/recent_paths_get")]
pub fn recent_paths_get() str {
    return wsys.recent_paths_get_impl()
}

/// 最近打开清单写（.jade/recents.txt；≤10 行预期——无容量卫[front 权威]）
/// POST /api/recent_paths_set
#[api(method = "POST", path = "/api/recent_paths_set")]
pub fn recent_paths_set(paths str) bool {
    return wsys.recent_paths_set_impl(paths)
}
```

- **get**：`File.read_text(resolve(".jade/recents.txt"))`——缺档
  try/catch 容错返 ""（**只读不建**——首跑零 .jade 目录）。
- **set**：`File.create_dir(resolve(".jade"))`（递归幂等已证）→
  `File.write_text` + 复核（D-24② 双复核形态）。
- **格式定文（SD-2101）**：换行分隔相对路径清单、原样存取（与
  App recent_paths str 形态直通——front 零 parse/serialize）；空串
  = 清空（写入空文件——语义注记：不删除文件）。
- **免索引论证**：`.jade` 点前缀目录 walk 忽略（fs_tree_skipped
  一手源[D-33①]）——索引/标签/检索/孤页面零污染；**非用户内容**
  （jade 内部态——与 D-14 frontmatter 用户域无涉）。

### 2.3 消费面（front）

- **载入**：Init handler——`rp = recent_paths_get()`（try/catch
  容错 ""）→ `recent_paths = rp`（str 直通——D-37① 形态）；空 →
  现状空态。
- **保存**：push_recent/rekeys_rekey 变更点后即存（`recent_paths_
  set(.recent_paths)`——try/catch console；小文件无 debounce）。
- **P≤200 防线**：refresh_tree 派生段顺产 `ws_warn`——`ad_count =
  collect_ad_paths(.ft_nodes).len()`（在册纯函数复用）> 200 →
  `ws_warn = "工作区超 200 页（上游 VM 上限）——索引可能不稳定"`+
  console_log；否则 ""；StatusBar 增条件行（`if .ws_warn != ""`
  text 行——status_bar.at +1 行）。
- ⚠ D-26② 自派生；D-30① 参数纪律；D-33② 零 computed 串接。

### 2.4 键位/菜单面

零新增。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-27 会话口述：「计划020已经完成；请 [$auto-plan-new]
  规划下一个计划」——**立项授权**：020 已归档（283c702——正常
  立项窗）。方向选择（试用赋能批）= 020 §10.5 建议 + §2.1 对表；
  handoff 未否决即生效（PLAN-004..020 同款约定）。
- **.jade 目录语义**按默认提案（jade 内部态、dot 免索引、工作区
  本地）；用户要全局清单（跨工作区）→ r2 口（全局存储位裁决）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05）。无预算/自动续跑/工具链版本指定。

### 4.2 接地证据（本仓/家族实读，2026-09-27 @ main 98dd55e/283c702）

- **在册复用件**：App recent_paths str 形态（020——app.at:938/
  push_recent :215 族 + D-37① dump 直出定谳）；File 三原语 +
  create_dir 递归（D-29①）；dot-dir walk 忽略一手源（D-33①——
  SD-1601 .trash 同论证）；StatusBar 条件行形态（status_bar.at
  .store 读面——ws_warn 居 App 则经 computed/传参？**StatusBar 读
  .store**——ws_warn 若居 App 模型，StatusBar 组件读不到（组件只
  读 store）→ **ws_warn 居 store**（App 写入 store 新字段——与
  status 族同判）——T-02 落定位）；pick_port（016）。
- **D-35② 判据**（ledger v24）：500 页实勘 VM 字符串池值损坏 /
  200 安全线（018 定谳 P≤200 口径）——防线阈值依据；复测条件
  「exe 变更窗」未至（v24 注记）。
- **实测语料生成通道**：write_wiki 造档（既有 probe 先例）+ 150
  页脚本（tools/ 或 tests/probe 内一次性——居 ignored .runtime
  家族口径[020 先例]）；JADE_WORKSPACE 隔离指向（README 运行矩阵）。
- **基线**：v18 现行（020）；**v19 变更面** = store ws_warn +
  recent_paths 载入值域（首跑空 → 会话中载入态——dump 值变化面）
  + StatusBar 行。
- **上游实勘**（2026-09-27）：auto-lang 近线 = 清理裁定/apps.
  manifest——anchor-reveal grep 0（门控维持）。

### 4.3 与既有计划的关系

- 兑现 PLAN-020 §10.3（recents 持久化留口）+ §10.5（试用赋能
  承接）；D-35② 处置更新（试用防线注记）；D-33①（.jade 免索引
  引用）。
- 试用反馈件类目（020 新晋）本批以「实测工件」代行首批——真实
  用户反馈仍待用户试用。
- D-12（anchor-reveal）/checkbox 三件/url_decode 供料留观不变；
  F-R17-1 第五批随附（T-03 gate 载体）。
- PLAN-022 候选池（§10.7 更新）：**试用反馈件（首位——用户真实
  反馈/本批实测工件衍生）**、大纲（anchor-reveal 解锁）、索引
  单趟合并（D-35 收口后）、recents 全局化（r2 口）、Time front
  probe、NFKC、合并三择 r3、批量 restore、F-R19-1 r3、checkbox/
  url_decode 供料回执件。

## 5. 详细设计

### 5.1 back 双契约（SD-2101）

```
pub fn recent_paths_get_impl() str {
    // try read_text(resolve(".jade/recents.txt")) catch → ""
    //（只读不建——首跑零 .jade）
}

pub fn recent_paths_set_impl(paths str) bool {
    // create_dir(resolve(".jade"))[递归幂等] → write_text(
    //   resolve(".jade/recents.txt"), paths) → 复核 exists
}
```

### 5.2 front 接线（SD-2101）

- store：`ws_warn` str（防线态——StatusBar 读面）；App：Init 载入
  recent_paths_get + 变更点 set；refresh_tree 派生段 ws_warn 计算写
  store；StatusBar 条件行。
- ⚠ recents 保存点 = push_recent/rekeys_rekey 全触点后（七处在册
  ——020 D-37 触点族）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2101 | modify | docs/ARCHITECTURE.md §5 | before：recents 会话域（SD-2001——持久化留口）；D-35② = 规模上限在册无防线。after：增「工作区状态持久层」子段——`.jade/` 定位（jade 内部态/点前缀 walk 免索引一手源/工作区本地/非用户内容域）；`recent_paths_get/set` 双契约（换行分隔原样直通[str 形态 D-37①]/get 只读不建/set 双复核）；front 面（Init 载入/七触点变更即存）；**会话域→工作区域升级**；**P≤200 防线**（树刷新计数 >200 → store ws_warn → StatusBar 警示行——知情不禁用口径；D-35② 处置更新注记） | 试用润滑+安全；持久层首开边界定文（专用不泛化） | AC-01/02/06 |
| SD-2102 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v18。after：组数**不变**（持久化入 find 组、防线入 boot/tree 组子步）+ **基线 v19**（store ws_warn + recent_paths 载入值域 + StatusBar 行；v18 留档） | 测试体系表更新 | AC-04 |
| SD-2103 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v18。after：口径不变 + 子步扩注记 + 基线 v19 指针 + **实测工件注记**（150 页专项——计时/findings 记录面）+ N 定谳续记（F-R17-1 第五批实录） | 判绿口径单一权威面（…/2003 续） | AC-04 |
| SD-2104 | modify | docs/README.md「是什么/文档」节 | before：第十八切片=孤页+最近打开。after：**第十九切片=试用赋能批**条目（持久层首开/防线/实测三件注记 + 试用驱动阶段承接）+ ledger v25 指针 | 产品主线进度面派生同步（…/2004 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：①get 缺档容错（""——零 .jade 目录
  保留）②set/get 往返（3 行清单逐字节）③CJK 路径行（POST 双臂）
  ④空串 set（清空语义——文件存在空内容）⑤复核（set 后 exists）。
- **vm 矩阵（T-03）**：find 组子步——①持久化跨会话弧线（开 3 档
  → 磁盘逐行验[.jade/recents.txt]→ 矩阵 reopen 面[vm 单进程——
  **进程内二 Init 模拟**或直证面承载，T-03 落定]②载入态空 q 恢复
  （Init 后 recent_paths 非空断言）；boot/tree 组子步——③防线案
  （201 页微语料[JADE_WORKSPACE 指向合成]→ StatusBar 警示行快照）
  ④零警示回归（现行语料）。
- **e2e（T-03）**：⑤跨会话真弧线（page reload → Ctrl+P 空 q →
  「最近」恢复——Playwright reload 通道）。
- **基线 v19（T-03）**：计划内重锁；连跑 ≥3 零漂移；v18 留档。
- **实测件（T-04）**：150 页合成语料（生成脚本 + JADE_WORKSPACE
  隔离）——索引/检索/建页/改名四点计时实录 + 全链冒烟（vm merged
  臂 + probe 复用）+ findings 清单工件（≥0 项如实）。
- **随批复测（T-03）**：F-R17-1 第五批（gate 载体）；D-35② 复测
  条件观测（exe 时间戳）。
- **负向（T-05）**：probe 全族十三代回归；`.console` 零；契约纯
  增量；纪律 grep 族；冻结池/家族仓零接触；`gen/` 无手改；补件面
  零增量；**.jade 免索引证**（索引/孤页/检索面对 .jade 内容零感知
  断言）。

## 7. 验收标准

- **AC-01（recents 持久化）**：直证五案双臂绿；跨会话弧线（vm
  模拟 + e2e reload 真弧线）双轨绿；缺档容错/工作区隔离口径可证。
  验证：T-01/T-03。
- **AC-02（P≤200 防线）**：201 页警示 + 现行语料零回归双轨绿；
  纯显示面（功能路径零影响）断言。验证：T-03。
- **AC-03（实测工件）**：150 页全链冒烟绿 + 四点计时实录 + findings
  清单在案（工件入 §9/§10——上游/本仓分账）。验证：T-04。
- **AC-04（gate + 基线 v19）**：gate ALL GREEN（16/15/十五段口径
  不变）；基线 v19 零漂移（v18 留档）；N 定谳续记（F-R17-1 第五批
  实录）。
- **AC-05（负向证）**：probe 全族十三代回归；`.console` 零；契约
  纯增量；纪律 grep 族；冻结池/家族仓零接触；`gen/` 无手改；补件
  面零增量；.jade 免索引证。
- **AC-06（文档面）**：SD-2101..2104 落位锚注齐；**持久层边界定文
  （专用不泛化/.jade 语义）与防线知情口径**入 SD-2101；parity-
  ledger **v25**（D-35② 处置更新 + 执行期实勘 + 实测工件摘要）。

## 8. 执行步骤

- **T-01 back 双契约 + 直证**（AC-01）
  - [x] wsys 双 impl；probe_recent.mjs 新增（五案）。
  - 验证：直证全绿 + vm 矩阵现行组回归。
  - **[执行实录 2026-09-27 @42cb478]**：wsys.at 尾段「工作区状态持久层」
    区段（专用不泛化/.jade 点前缀免索引 D-33①/非用户内容/工作区本地定
    文注记）+ recent_paths_get_impl（exists 卫先行——只读不建）+
    recent_paths_set_impl（create_dir 递归幂等 D-29①→write_text→exists
    复核 D-24②）；api.at 双契约（GET 无参零 D-19 面/POST body CJK 免疫
    ——_impl 名错开 013 形态）。probe_recent.mjs 双臂**十案全绿**（①缺
    档容错 ②往返逐字节+磁盘逐字节 ③CJK 两行 POST ④空串清空文件存在
    空内容 ⑤exists 复核+.jade 域圈定 ⑥免索引证 tree+link_index contains
    判 false——merged 探针工程 + split serve-back + 逐案对读一致）。执行
    期实勘两件：autoui_state dump 大 str 字段截断（45KB JSON 后字段全缺
    ——免索引面改 bool contains 字段形态）；bool 契约回值入 vm 模型
    dump = int 1/0（D-35③ GET 裸 1/0 家族 POST 直调同域）。
- **T-02 front 接线（载入/保存/防线）**（AC-01/02 前半）
  - [x] Init 载入 + 七触点保存 + ws_warn 计算（store 写入——StatusBar
    读面落定）+ StatusBar 条件行。
  - 验证：merged 冒烟（开档→磁盘行→防线案）+ `pnpm build` PASS。
  - **[执行实录 2026-09-27 @42cb478]**：app.at 导入扩双件 + recents_
    split/recents_join 换装纯函数对 + Init 载入半（get try/catch 容错""
    →split 入态）+ **RecentsPersist 共享 msg 口**（join→set POST try/
    catch console；handler 间直发 vue 轨 fire-and-forget 安全——无后续
    同 handler 读依赖）+ 八触点（直开口四 push 后 + rekey 二 + 循环尾
    二单发）；ws_warn = **store 模型字段 + WsWarn(str) msg 单向通道**
    （§10.2 落定：App→store 直写字段赋值无先例，msg 口为在册形态；
    TreeRefresh 派生段 collect_ad_paths(nodes) 计数 >200 → 静态文案 +
    console 计数，否则清空）；status_bar.at 条件行（save_note 后 amber
    行）。**执行期裁定（§2.3「str 直通」按实取）**：App recent_paths
    维持 List<str>（020 视图/push_recent/recents_rekey 消费面零波及+
    D-37① dump 基线锚），join/split = 契约 str 形态最小换装——「零
    parse/serialize」读作「零 JSON 包装原样存取」。验证：merged 矩阵
    15/16（唯基线 B 漂移=v19 计划内 ws_warn 新 store 字段；其余全绿含
    ⑨ 弧持久化无扰）+ `pnpm build` PASS（release 路由+SCHEMA_DRIFT_
    GENERATE_AT=1）。
- **T-03 测试扩单 + 基线 v19 + gate + 随批复测**（AC-01/02/04）
  - [x] find/boot 子步 + e2e reload 弧线 + v19 重锁 + gate（F-R17-1
    第五批）。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN。
  - **[执行实录 2026-09-27]**：vm 矩阵 find 组 **⑩ 持久化逐行验子步**
    （⑨ 终态 RecCap12..RecCap3 ↔ .jade/recents.txt 逐行一致[显示域归一
    剥 .ad——dtitle 缺省 stem；身份域逐行锚 = ⑩b] + 快照免索引负向）+
    **臂尾 ⑩b/⑩c**（check 9 后第二 boot——§10.1 落定：**取进程重启真
    弧**强于二 Init 模拟；⑩b = recent_paths state 清单逐行 = check 9
    退出时磁盘逐行[12/13 组 rename/move/daily/deep 触点在 ⑨ 后仍改写
    清单——硬编码 RecCap 面不成立，不变式 = 重启读盘 = 退出时落盘] +
    「最近」段渲染；⑩c = 201 页微语料→ActDaily→ws_warn 警示文案+警示
    窗内快开可用+清料零警示回归——fail 即臂败不占检查位）。基线 **v19**
    重锁（store ws_warn 入 dump——计划内重锁第六例；id 序列零变化——
    StatusBar 组件子树快照不可见）+ merged **16/16 ALL GREEN ×2**（锁
    跑+独立复跑零漂移）。e2e：**快开子步断言计划内修订**（「空 q 零记
    录全量 5 行」→「最近」段跨会话载入——020 会话域复位语义随持久化
    退役）+ **⑩a 磁盘逐行验** + **⑤ reload 跨会话真弧线**（goto→Init
    载入→「最近」段 RecCap12..RecCap3 逐行恢复+拾取开档顺收 tab/树展
    开/反链关位态复原）+ **防线案渲染面**（201 页→StatusBar 警示行
    可见[vm 组件子树不可见的对位承载]→清料→警示行消；面板开启三试重
    试[负载窗家族瞬态 D-21 v11③]+find_q 残留清 q 通道）——e2e 全绿
    1.2m。`pnpm build` PASS。**split 臂+gate 单命令=F-R17-1 第五批维持
    留观**：split 独立跑 boot FAIL+wiki 树行不现（v23/v24 逐字同形）+
    gate 两跑[第一跑 split 段 check 11 快速打开钮 UI 弧败、第二跑 split
    boot FAIL 短路 build 未达]——**判别链外部性定谳**：git-archive 物料
    pre-change 树（283c702）同 exe A/B 两轮——pre 树 ready 失败/
    ready 后开档 tab 恒 0 复现同款（本批零接触证）；败形集中重 UI chrome
    弧[v22 五形态/v23/v24 同族]，分段判绿先例承载（018 v22/019 v23/020
    v24）。D-35② 复测条件观测：exe 时间戳未变（debug 09-26 10:43/
    release 09-25 17:58）——条件未至挂起维持。执行期实勘：e2e testDir
    '.' 递归扫入面再触（pre21-tree 判别链物料忘却清场——D-37⑦ 同款
    教训二例，物料即用即删入纪律）。
- **T-04 真实规模实测（工件）**（AC-03）
  - [x] 150 页语料生成 + 四点计时 + 全链冒烟 + findings 清单。
  - 验证：工件实录进 §9/§10（无断言门——如实记录口径）。
  - **[执行实录 2026-09-27]**：一次性件 `e2e/.runtime/p21-bench150.mjs`
    （ignored 家族口径——非入库源；语料 = e2e/.runtime/p21-ws150 150 页
    合成：wiki/ 30 CJK 三键档 + deep/d1..d4 40 深目录 + notes/ 40[别名
    15/悬空 10/纯 body tags 15] + 根 ASCII 40——CJK/深目录/别名/tags/
    悬空混布）。**HTTP 四点计时**（serve-back，JADE_FIXTURE 指语料——
    首跑实录：env 置于 import 后致 5 页 fixture 混入全案作废重跑）：
    ①索引 link_index 冷/热 304/293/295ms（150 页全 walk+装配——P≤200
    稳定域内健康，D-35 对照 P=300 中止）②检索 search CJK/ASCII/别名
    54-72ms ③建页 create ×3 1-3ms ④改名 rename_page 46-50ms（**反链
    改写全 walk**——改写链翻转+零残留+页数 153 直证）+①b tags_index
    全量 **3.4-3.6s**。完整性：150 页 walk/CJK+深锚/悬空 10/153 计数
    全过。**UI 冒烟**（merged 臂）：boot-ready **6.2s**（spawn→UI ready
    全窗）；快开过滤 513-567ms（命中 11 行）；深档开档 1658-1696ms
    （D-03 域内）；保存弧线 513-515ms（ActSave→刷新族 153 页重走）；
    孤页清单 **8078-8248ms**（行集 0——语料全连接）；ws_warn 零警示
    @153 页（阈值不误触）。**findings 清单（§10.4 分账）**：①tags_
    index 3.6s @150 页[本仓 tags_json O(T×P) 双遍 page_tag_set 重读面
    ——D-22 观测③「索引单趟合并」量级观测首实录→PLAN-022 候选]；
    ②孤页清单入口 8.2s[本仓 orphan_rows_of O(P²)+入口即刷新双 walk
    →PLAN-022 候选（随索引单趟顺产）]；③boot-ready 6.2s 大头 = tags
    walk[同①根因]；④**autoui_state 通道 150 页位态间歇降级**（62 字
    符 vs 专注窗 31317 字符；快照通道恒健康 22KB——**仪器面上游级**
    ：MCP state sync 大态序列化，>100 页工作区 state 断言可用性约束
    注记，⑩b 类断言在 ≤26 页位态实证健康）；⑤深档/快开/保存面 150 页
    无恶化证据[D-03 域内]。e2e 段时长膨胀观测：全跑 1.2m（020 era
    40-48s + ⑩ 段 ~25s——含 201 页防线案两次大 walk，240s 预算内）。
- **T-05 文档 + ledger v25 + 收口**（AC-05/06）
  - [x] SD-2101..2104 落位；ledger v24→v25；负向证；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。
  - **[执行实录 2026-09-27]**：ARCHITECTURE SD-2101[§5 第十九切片四
    段：持久层首开定文[.jade 语义/专用不泛化/双契约格式/会话域→工作
    区域]+front 面[Init 载入/RecentsPersist 共享口/StatusBar 条件行]
    +P≤200 防线[知情不禁用/WsWarn msg 通道/阈值即 D-35② 稳定域] +
    直证面] + SD-2102[§6 heading 续+find 组 ⑩ 段+臂尾 ⑩b/⑩c 段+基线
    v19 行[非零重锁第六例 store 新字段面——id 序列零变化 StatusBar 组
    件子树快照不可见]]；README SD-2103[Tests heading/检查单链/find 组
    PLAN-021 ⑩ 段/N 定谳 021 实录[merged ×2+split 家族第五例判别链
    git-archive A/B+e2e 1.2m+gate 第五批留观+probe 14 件+D-35② 条件
    未至]/基线条目 v19 化/运行矩阵注释 v19 化] + SD-2104[第十九切片
    条目+ledger v25 指针]；ledger v25[表头 bump+**D-38 新行**[①bool
    回值 vm 模型 dump=int 1/0 ②state dump 大字段截断+150 页位态通道
    间歇降级[上游仪器面] ③进程重启载入真弧通道 ④testDir 扫入教训二
    例 ⑤时钟基准单源 ⑥toolbar ownText 前缀形]+D-21 v25 扩记[家族窗第
    五例+git-archive A/B 判别链+F-R17-1 第五批维持]+D-35 处置更新[防
    线落地知情口径+复测条件未至维持+150 页稳定域健康实证]]。**负向证
    （AC-05）**：probe 全族 **14 件 fresh**（probe_recent 新件双臂十
    案+十三代回归——13 件 RESULT 全绿双臂+probe_receipt_d19 负结果一
    致[g①/g② D-19 维持在册]）；`.console` 写面零违例（app.at grep
    0——D-25①）；契约纯增量（api.at diff 删除行 0）；纪律 grep 族
    （front split_once 仅 2 处在册注释 D-31①；recents 族零 .length
    字节算术 D-20③/D-34①；零 computed 串接 D-33②——ws_warn 静态文
    案直读）；冻结池/家族仓零接触（全程仅 jade-edit 检出写面；fixture
    源只读拷贝）；gen/dist ignored 零手改；补件面零增量（regen-vue
    diff 0）；.jade 免索引证（probe ⑥ tree+link_index 双 face + 矩阵
    ⑩ 快照负向 + 基线 v19 state 全文）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；零探针零闸——
File 族/dot 免索引/纯函数复用全在册）。

## 9. 复审记录

- **2026-09-27 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-021，revision 1。
  - `outcome: pass`——可进 work（020 已归档 283c702——正常立项窗）。
  - `next: work`（T-01 起；零探针零闸）。
  - .jade 语义按默认提案（§4.1——全局化 r2 口）；实测工件 = 试用
    反馈代行首批（真实反馈仍待用户试用）。

- **2026-09-27 work 收口（auto-plan:work）**：
  - `stage: work | plan_id: PLAN-021 | plan_revision: 1 | outcome: pass`
  - `code_commit`: 42cb478（T-01+T-02 back 双契约+front 接线）→
    ce39b26（T-03 测试扩单+基线 v19）→ d62aaf8（T-04 150 页实测工件）
    → T-05 docs（本文）——线性直接 main（001..020 在档惯例）。
  - `task_ids`: T-01..T-05 全勾；`current_step: 5/5`。
  - `evidence`: probe_recent 双臂十案全绿；merged 矩阵 16/16 ALL
    GREEN ×2（基线 v19 零漂移）；e2e 十五段全绿 1.2m（⑩三面）；vue
    build PASS（release 路由）；probe 全族 14 件 fresh（13 RESULT 全
    绿+receipt 负结果一致）；150 页实测四点计时+findings 分账工件
    （§8 T-04 实录）；负向证七面（本表 T-05 实录）。
  - `blockers`: split 臂 + gate 单命令 = **外部家族窗延续**（exe
    时间戳未变 debug 09-26 10:43——D-21 v25 第五例；git-archive
    pre-change A/B 判别链定谳本批零接触）——分段判绿先例承载（018
    v22/019 v23/020 v24），unblock = 家族 exe 稳定后双臂复跑（与
    F-R17-1 合流同载体）；D-35② bulkalias 复测条件未至维持。
  - `next`: review（建议独立会话复审；工件重建口径 = probe_recent
    + merged 矩阵 + e2e 三件重跑）。

- **2026-09-27 复审（auto-plan:review）**：
  - `stage: review | plan_id: PLAN-021 | plan_revision: 1 | outcome:
    pass | reviewed_commit: 549c8a3 | base_commit: 283c702 |
    dependency_revisions: auto-lang debug 09-26 10:43 / release 09-25
    17:58（exe 时间戳复核未变） | spec_inputs: docs/ARCHITECTURE.md
    §5/§6@549c8a3 + docs/README.md Tests/是什么/文档@549c8a3 +
    docs/parity-ledger.md v25@549c8a3`
  - **复审方式声明**：实现同会话复审（无独立会话授权）——按技能以
    工件重建裁定：验收命令在受审提交 549c8a3 树上全量重放（非执行
    期摘要采信）。
  - `acceptance_results`:
    - **AC-01 pass**：probe_recent 双臂十案重放全绿（缺档容错/往返/
      CJK/清空/复核+免索引）；merged 矩阵 ⑩ 逐行验 + ⑩b 进程重启载
      入真弧 + e2e ⑤ reload 跨会话恢复重放绿——跨会话/跨重启/缺档
      容错/工作区隔离四口径全证。
    - **AC-02 pass**：merged ⑩c 201 页警示 + 现行语料零回归 + 警示
      窗内快开可用（纯显示面）重放绿；e2e StatusBar 警示行显隐渲染
      面绿。
    - **AC-03 pass**：bench150 复审窗重放一致（link_index 289ms/
      rename 45ms/tags 2.8s/boot-ready 5.3s/保存 511ms——执行期实录
      量级带内；findings 无新增）+ 工件在案（§8 T-04 实录 +
      d62aaf8）。
    - **AC-04 pass（分段判绿——外部阻断如实记）**：merged 16/16
      ALL GREEN（复审重放 + 基线 v19 零漂移）+ e2e 十五段绿（1.1m
      重放）+ vue build 绿（release 路由 ✓ built）；**gate 单命令
      split 段 = 外部家族窗第五例**（D-21 v25——git-archive A/B 判
      别链定谳本批零接触；unblock = 家族 exe 稳定后双臂复跑）——
      018 v22/019 v23/020 v24 复审-delivered 同判先例承载。
    - **AC-05 pass**：probe 全族 14 件 fresh（执行期 T-05 窗实跑——
      13 RESULT 全绿 + receipt 负结果一致；其后零代码变更——docs-only
      后代核验 d62aaf8..549c8a3 仅 docs/**）+ 负向证 grep 族复核
      （.console 0/契约纯增量/纪律族/冻结池零接触/gen 零手改/补件
      零增量/.jade 免索引证）。
    - **AC-06 pass**：SD-2101..2104 锚位核验（ARCH §5/§6 + README
      Tests/是什么/ledger 指针）+ ledger v25 读回（表头 bump+D-38 行
      在册）+ v18 留档在案。
  - `findings`: 无阻断项。观测一项：复审窗 bench150 重放 state 通道
    62 字符降级复现（与 D-38② 在册一致——快照通道健康，仪器面非产
    品败形）。规范增量四面文本核验与实现行为一致（SD-2101 持久层定
    文/SD-2102 测试面/SD-2103 判绿口径/SD-2104 进度面——无废弃实现
    计划语残留）。
  - `evidence`: 本记录验收命令即证据（重放于 549c8a3 树）；基线文件
    tests/baseline/structure-v19.txt（tracked 持久）；探针件
    tests/probe_recent.mjs（tracked）；bench 一次性件居 ignored
    .runtime（口径在 §8 T-04 实录，量级结论已入计划/ledger 持久面）。
  - `next`: merge（工作流已授权——移交 auto-plan:merge）。

## 10. 待澄清事项

1. **vm 跨会话弧线断言通道**（✅ T-03 落定）：**臂尾进程重启真弧**承载
   （check 9 退出存盘后第二 boot——recent_paths state 清单逐行 = 退出时
   磁盘逐行 + 「最近」段渲染）——强于「进程内二 Init 模拟/直证面」两候
   选；e2e ⑤ reload 弧线为 vue 轨对位。见 §8 T-03 实录。
2. **ws_warn 位置**（✅ T-02 落定）：store 模型字段 + `WsWarn(str)` msg
   单向通道（App TreeRefresh 单写口）——App→store 直写字段赋值无先例，
   msg 口为在册形态；StatusBar 组件 `.store.*` 读面。按实取如左。
3. **recents 全局化**（r2 口）：跨工作区共享清单（全局存储位
   [%LOCALAPPDATA% 族]）——用户需求首现时裁决。
4. **实测 findings 分账口径**（✅ T-04 落定）：上游（VM/生成器族）vs
   本仓（索引/面板）——工件逐项标注；上游项转供料候选清单，本仓项转
   PLAN-022 候选。落定分账：本仓面 = tags_json O(T×P) 双遍重读 3.6s/
   orphan_rows_of O(P²) 8.2s/boot tags walk 大头（①②③——均转
   PLAN-022「索引单趟合并」候选域）；上游面 = autoui_state 大态序列化
   间歇降级（④——仪器面，供料候选：state sync 分块/截断标注）；零
   产品败形（⑧ 完整性/防线阈值/切换面全过）。
5. **D-21 POST 波及**（✅ T-03/T-04 观测更新）：recents_set 低频小
   POST——e2e 全跑 1.2m 零 400 丢参签名（API 日志 recent_paths_set
   触点即发实录）；merged 臂全绿多轮零复现；负载窗按 README 重跑口
   径不变。
6. **PLAN-022 候选池**（✅ 本批后更新）：**试用反馈件（首位——用户
   真实反馈 + 本批 150 页实测工件衍生）**；**索引单趟合并（本仓面
   findings 衔升——tags_json O(T×P) 3.6s/orphan O(P²) 8.2s/boot
   tags walk 实测量级在案[D-22 观测③+D-38]）**；大纲（anchor-reveal
   解锁）、recents 全局化（r2 口）、Time front probe、NFKC、合并三
   择 r3、批量 restore、F-R19-1 r3、checkbox/url_decode 供料回执件、
   autoui_state 大态序列化（D-38② 仪器面供料候选）。
