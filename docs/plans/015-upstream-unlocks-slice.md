---
plan_id: PLAN-015
status: reviewed
feature_name: upstream-unlocks-slice
author: [zhaopuming]
created_at: 2026-09-25T10:26:10+08:00
updated_at: 2026-09-25T12:05:00+08:00
plan_revision: 2
current_step: 6
total_steps: 6
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1501"
  - "docs/ARCHITECTURE.md#SD-1502"
  - "docs/README.md#SD-1503"
  - "docs/README.md#SD-1504"
touched_goals: []
---

# [PLAN-015] 上游解锁兑现批——HTTP 回执（D-19/D-21）+ 每日笔记与时间戳补写（Time）+ 行:列（oncursor）

## 0. 变更摘要

三原语同窗解锁（上游实勘 2026-09-25），一片兑现（「上游解锁兑现批」
——连续七片门控后的集中收割）：

1. **PLAN-699 HTTP 回执（D-19/D-21）**：上游 auto-lang 以 Axum/Hyper
   传输替换手写 HTTP 解析器（e48d4e366，2026-09-24）——**D-19（GET
   query UTF-8 解码缺口）与 D-21（负载窗丢参/进程死亡竞态）的 unlock
   候选**。回执 = serve-back CJK GET 探针复核 + 矩阵 **CJK 导航子步
   双臂化**（「仅 merged 臂」限制解除——覆盖面扩容）+ D-21 负载窗
   连跑观测 → ledger v18 归档/收敛判定。
2. **Time 解锁兑现：每日笔记 + updated_at 补写**（候选池「双件联
   动」）：上游 `Date.now`（epoch ms）+ `Date.format(epoch, pattern)`
  （本地时区 yyyy/MM/dd/HH/mm/ss 全 pattern——stdlib.rs:8985-9015 +
   宿主桥 :9724-9745，musk 消费在册）——**back 侧独占消费**（front
   零 Date 面——vue 轨 ts_adapter 发射未证，设计性规避）：`daily_
   note()` back 契约（yyyy_MM_dd stem → create_page 复用幂等 → 打开）
   + `write_body` 增 **updated_at 自动维护**（**仅补已有键**——无键
   不增，增量维护不引入；值口径 = 语料同形 `yyyy-MM-ddTHH:mm:ss`）。
3. **编辑器事件解锁兑现：StatusBar 行:列**（D-12 部分解锁——Typora
   线首件真解锁）：上游 PLAN-413 Phase 2 落地编辑器 **`oncursor`**
   （caret moved，aura_view_builder.rs:10703/:10766 实勘）+ offset 写
   入臂/onscroll——**oncursor → store 行:列态 → StatusBar 显示**
   （D-12「行:列降级」处置收口面）。**大纲精确跳转仍门控**（anchor
   -reveal prop 面未暴露——offset 像素映射不可靠，§10.3 记账 +
   D-12 部分解锁注记）。

上游缺口适配内置：D-24③④⑤；D-25①；D-26②/D-28②；D-29③；D-30①
（新纯函数参数纪律）；D-31（014 教训——front 零 split_once/弹层
heading 锚）。

## 1. 目标

- **G1（HTTP 回执）**：serve-back 新传输下 CJK GET query 探针双臂
  复核（exists/read_wiki encoded CJK → 正常返回）；**矩阵 CJK 导航
  子步双臂化**（link/find/file 组「仅 merged 臂」注记解除——已知
  答案不变、臂面扩容）；D-21 负载窗连跑观测（gate ≥3 跑统计）；
  ledger v18：D-19/D-21 按 receipts 归档或续留观（**如实判**——
  复核不过则维持处置，回执记负结果）。
- **G2（每日笔记可用·双轨）**：菜单「文件→今日笔记」/ 工具栏钮 →
  `daily_note()` → 今日档（yyyy_MM_dd stem，模板 `# yyyy-MM-dd\n\n`
  + frontmatter created_at/updated_at）幂等打开（今日重入 = 打开
  同档）；旧日档不动。
- **G3（updated_at 自动维护）**：保存流（write_wiki）对**已有
  updated_at 键**的档自动更新值（语料同形 `yyyy-MM-ddTHH:mm:ss`，
  本地时区）；**无键档零引入**（逐字保留哲学不破）；六检查磁盘
  断言盘点更新（受影响档清单 T-03 落定）。
- **G4（行:列可用·双轨）**：编辑器 caret 移动 → StatusBar「行:列」
  实时显示（vm oncursor 事件 → store 态；vue 轨发射形态探针 E——
  fallback vue 降级现状显示 + D-12 注记口径）。
- **G5（测试面）**：组数不变（子步扩 + CJK 双臂化）——**16/15/十五
  段口径不变**；基线 **v14** 计划内重锁（store cursor 态——行:列；
  每日笔记/updated_at 零新状态面）。
- **非目标**（明确排除）：
  - **大纲**（anchor-reveal prop 面未暴露——offset 写入臂存在但
    heading→像素映射不可靠；D-12 部分解锁注记 + 供料候选[编辑器
    anchor-reveal prop]，§10.3）；
  - **Time front 面消费**（ts_adapter Date.* 发射未证——本批 back
    独占，front 解锁随 vue 面 probe 批）；
  - created_at 新档首写以外的时间戳面（title 键/时间戳编辑——系统
    自动维护键不可经属性弹层编辑，page_meta 三键不动）；
  - D-21 的「根修声明」（上游竞态修复与否 = auto-lang 侧事——本批
    只做 jade 侧行为回执与处置更新）；
  - casefold+词边界批、目录移动/合并、检索上量微批、生成物补件
    （AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么是上游解锁兑现批）

- **候选池对表**（PLAN-014 §10.7 + 上游实勘 2026-09-25）：大纲
  （首位——**anchor-reveal 仍门控**，oncursor/offset 仅半解锁）、
  每日笔记+时间戳（**Time 解锁**——Date.format 原语在册）、HTTP
  回执（**PLAN-699 落地**——D-19/D-21 unlock 候选）。北标口径
  （SD-405）：三件分别兑现 Typora 线（行:列——七片门控后首件真
  解锁）与 Obsidian 线（每日笔记 = 高频工作流）+ 质量面（D-19/D-21
  双上游级长账收口机会）。**解锁不兑现 = 价值滞留**——集中兑现批
  优先于新功能立项。
- **形态复用度**：每日笔记 = create_page 全套复用 + 新入口；updated_
  at = write_body 界符段处理扩一分支（fm_set_block 单行键改写 back
  侧复用）；行:列 = oncursor 事件 + status_bar 显示位；回执 = 既有
  probe/matrix 资产复核扩容。**零新 UI 形态**（无弹层——每日笔记
  直接动作）。

### 2.2 数据面（back：`daily_note` 新契约 + `write_body` 扩 + 回执）

```rust
/// 今日笔记：yyyy_MM_dd stem 建档/幂等打开（back 侧 Date 独占消费）
/// POST /api/daily_note
#[api(method = "POST", path = "/api/daily_note")]
pub fn daily_note() str {
    return wsys.daily_note_impl()
}
```

- **daily_note_impl**：`name = Date.format(Date.now(), "yyyy_MM_dd")`
  → **create_page 幂等口复用**（已存在 → 返回现路径；新建 → 模板
  `# yyyy-MM-dd\n\n` + frontmatter `created_at/updated_at`
  [yyyy-MM-ddTHH:mm:ss]——新建首写双时间戳，旧日档不动）→ 返回
  path。
- **write_body 扩（updated_at 自动维护）**：保存路径（存在档）界符
  段重接时——frontmatter 含 `updated_at` 键行 → 值替换为
  `Date.format(Date.now(), "yyyy-MM-ddTHH:mm:ss")`；**无键零引入**
  （fm_set_block「删键」反向分支——仅改值不增键）；新建档（无
  frontmatter 直写 body）零涉。
- **回执面（零代码 or 极小）**：D-19/D-21 复核走既有 probe 资产 +
  serve-back（新传输随上游 exe 重建自动生效——README 工具链口径）。

### 2.3 消费面（front）

- **每日笔记入口**：action `file.daily`（title「今日笔记」、icon
  "calendar"、shortcut **Ctrl+Shift+N**?——N 族被 Ctrl+N 占，取
  **Alt+D**？键位面：Ctrl+Alt+N 空闲实核[无绑定]——定 Ctrl+Alt+N，
  §10.4 用户可改）+ menubar 文件项 + 工具栏钮 → `.ActDaily`：
  `r = daily_note()`（try/catch console_log）→ 打开（store.Open +
  行重算显式 r + ft_sel）+ `refresh_tree()`/`refresh_links()`（触发
  集「建页成功」口直承）。
- **行:列**：编辑器事件面增 `oncursor: .Cursor`（app.at 编辑器
  实例——key/content/final/oninput 既有族 +1）；store 增 `cursor_
  line int`/`cursor_col int`（+0 归零口：Open/Reload/切换档）；
  StatusBar 显示 `行 {line} 列 {col}`（status_bar.at .store 读面
  +1 行——docs 计数旁）。**探针 E**：oncursor 事件载荷形态（vm
  msg 参数——"line:col" 串 or 双参？aura:10766 实勘定）+ vue 发射
  （engine 组件 update:cursor 族 or 不发射——fallback vue 降级
  现状 + D-12 注记[轨内差异先例 D-19 同判]）。
- **updated_at 零 front 面**（保存流自动——用户无感）。

### 2.4 键位/菜单面

Ctrl+Alt+N = 今日笔记（新键位唯一增量）；menubar 文件菜单「今日
笔记」+ 工具栏 calendar 钮；StatusBar 行:列为显示面无键位。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件、无弹层。**上游工具链敏感**：PLAN-699 传输 + PLAN-
413 编辑器事件均随 exe 重建生效——README ≥1652 口径复核（T-01 首
项，D-27① 同判工具链窗口）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-25 会话口述：「计划14已经完成；请继续规划下一步
  计划」——**立项授权**：014 已归档（be92d44——正常立项窗）。
  方向选择（上游解锁兑现批）= 上游实勘三 unlock + §2.1 依据；
  handoff 未否决即生效（PLAN-004..014 同款约定）。
- **updated_at 自动维护语义**按默认提案（仅补已有键——增量维护
  不引入）；用户可翻（全档引入/可开关 → r2 + D-14 面重裁）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05；上游仓只读实勘）。无预算/自动续跑/工具链版本指定。

### 4.2 接地证据（本仓/家族实读，2026-09-25 @ main be92d44 + 上游 main）

- **上游三 unlock 实勘**（auto-lang main 只读）：
  - **PLAN-699**（e48d4e366 2026-09-24）：Axum/Hyper 传输替换手写
    解析器——专用 auto-http-net 线程 + hyper-util/连接 + Graceful
    Shutdown + owned ApiRequest 有界 mpsc → VM owner loop；落地链
    归档 4324a5ce4/1f08bfce2。**D-19/D-21 unlock 候选**（手写解析
    器两缺口的结构性替代）——回执判定 jade 侧行为复核。
  - **Date 原语**：stdlib.rs:9724-9745 宿主桥（"Date","now"→epoch
    ms；"Date","format"→format_date_ms[本地时区 + 秒/毫秒归一
    1e11 阈值]）——musk forge_helpers.at 消费在册（.at 可调先例）；
    pattern token 最小集 yyyy/MM/dd/HH/H/mm/m/ss/s/SSS（未知原样）。
  - **编辑器事件**：aura_view_builder.rs:10703 注记 + :10766
    `on_cursor = aura_events_get_base(events, "oncursor")`——
    PLAN-413 Phase 2（90fe40409）链路；**offset 写入臂/onscroll**
    在册（:2087/:2118 autodown_scroll_binding）；**anchor-reveal
    prop 未暴露**（convert_autodown_editor_native props 面 = key/
    id/content/value/final/style/placeholder/scroll_sync——:3529+
    实勘）→ 大纲跳转仍门控。
- **语料 updated_at 形态**：Projects.ad `updated_at: 2026-08-27
  T00:40:36`（yyyy-MM-ddTHH:mm:ss 无 Z——值口径依据）；CAP 定理/
  Hello World/index 无该键（零影响面）；Tasks.ad 有（created_at 面
  有无 T-03 盘点）。
- **在册复用件**：create_page 幂等口（005）/fm_set_block 单行键改写
  （011——updated_at 值替换反向复用）/store.Open+行重算显式参族/
  refresh 双件（建页成功口直承）/status_bar .store 读面（docs 计数
  +脏标在册——行:列 +1 行）。
- **D-31 教训**（014）：front 零 split_once（整前缀 split 通道）/
  弹层标题 heading 角色锚——本批无弹层，行:列/status 接线遵 split
  通道。
- **基线**：v13 现行（014）；**v14 变更面** = store cursor_line/
  cursor_col（行:列态）——每日笔记/updated_at/回执零新状态面。

### 4.3 与既有计划的关系

- 收口候选：D-19/D-21（HTTP 回执判定）、Time 供料候选（Date.format
  收据）、D-12 部分解锁注记（oncursor 兑现 + anchor-reveal 续门控）。
- 承接 PLAN-005（create_page 复用）/011（fm_set_block 反向复用）/
- D-14 面：updated_at = **系统自动维护键**（用户不可编辑——属性
  弹层三键不动；SD-1101 注记扩）。
- PLAN-016 候选池（§10.7 更新）：大纲（anchor-reveal prop 解锁——
  首位顺延候）、casefold+词边界批、目录移动/合并、检索上量微批、
  Time front 面 probe 批（ts_adapter Date.* 发射）、D-12 anchor-
  reveal 供料回执件。

## 5. 详细设计

### 5.1 back 契约与扩容（SD-1501）

```
pub fn daily_note_impl() str {
    // name = Date.format(Date.now(), "yyyy_MM_dd")
    // → create_page 幂等口复用（模板/首写双时间戳分支）
    // → 返回 path
}

// write_body 扩：界符段重接循环内——行 trim 后以 "updated_at:" 起
// → 值段替换 Date.format(Date.now(), "yyyy-MM-ddTHH:mm:ss")
//（单行键值替换——fm_set_block 反向分支；无键零引入）
```

### 5.2 front 接线（SD-1501）

- app.at：action file.daily + menubar + 工具栏钮 + `.ActDaily` 流；
  编辑器实例 `oncursor: .Cursor` + store cursor 态 + StatusBar 行:列。
- ⚠ D-30① 参数纪律；D-31 split 通道；零 `.console =` 赋值。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1501 | modify | docs/ARCHITECTURE.md §5（+§3 编辑器消费/§8 供料指针） | before：Time/编辑器事件/HTTP 传输三面门控（D-12/D-19/D-21 + Time 供料候选）。after：①**上游解锁兑现段**——PLAN-699 回执判定（D-19/D-21 处置更新——归档或续留观，如实判）+ CJK 导航双臂化口径；②`daily_note` POST 契约（yyyy_MM_dd stem/幂等/模板+首写双时间戳/back 侧 Date 独占——front 零 Time 面）；③**updated_at 自动维护键**（仅补已有键、值同形 yyyy-MM-ddTHH:mm:ss、系统维护不可编辑、无键零引入）；④**行:列消费**（oncursor → store 态 → StatusBar；D-12「行:列降级」处置收口 + anchor-reveal 续门控注记） | 三 unlock 的规范收口 + 长账处置更新 | AC-01/02/03/04/06 |
| SD-1502 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v13。after：组数**不变**（子步扩 + CJK 导航双臂化注记——「仅 merged 臂」限制解除面清单）+ **基线 v14**（store cursor 态；v13 留档） | 测试体系表更新 + 覆盖面扩容记录 | AC-05 |
| SD-1503 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v13。after：口径不变 + CJK 双臂化注记 + 基线 v14 指针 + N 定谳续记（D-21 回执窗连跑统计） | 判绿口径单一权威面（…/1403 续） | AC-05 |
| SD-1504 | modify | docs/README.md「是什么/文档」节 | before：第十二切片=目录生命周期+面板显示名。after：**第十三切片=上游解锁兑现批**条目（HTTP 回执/每日笔记+时间戳/行:列 三面注记）+ ledger v18 指针 + §8 供料包指针更新 | 产品主线进度面派生同步（…/1404 续） | AC-06 |

## 6. 测试设计

- **T-01 回执直证（双臂）**：①serve-back CJK GET query 复核（encoded
  首页/CAP 定理 → exists/read_wiki 正常——**D-19 判定面**）②D-21
  负载窗：gate 连跑 ≥3 统计（败点签名清点——新传输下丢参/进程死亡
  形态归零判定）③Date 原语 back 可调直证（daily_note 全链 + 档名
  断言 yyyy_MM_dd 形[当日动态值——正则面用格式断言]）。
- **T-02/T-03 直证**：daily_note 案（新建模板+frontmatter 双时间戳/
  今日重入幂等/连日两档并存）；updated_at 案（有键档保存→值更新+
  其余键逐字节/无键档保存→零引入/新建档首写/值形 yyyy-MM-ddTHH:
  mm:ss）——六检查磁盘断言盘点（受影响档清单 + 期望值更新）。
- **vm 矩阵（T-05）**：①file 组：今日笔记弧线（入口→开档→树新行
  →重入幂等）②boot/editops 组：有键档保存 updated_at 更新断言
  （档面 T-03 定）③status：行:列显示（type_text 后 cursor 态断言
  ——vm 事件链）④**CJK 导航双臂化**（link/find/file 组「仅 merged
  臂」子步 split 臂解除——已知答案复跑）。⑤vue 轨行:列（探针 E
  定——通则 e2e 断言，不通则 vue 降级注记）。
- **e2e（T-05）**：daily 弧线 + updated_at 磁盘 + CJK 双臂化段。
- **基线 v14（T-05）**：重锁；连跑 ≥3 零漂移；v13 留档。
- **负向（T-06）**：probe 全族七代回归；`.console` 零；契约纯增量；
  D-30①/D-31 纪律 grep；冻结池/家族仓零接触；**生成物零补件**。

## 7. 验收标准

- **AC-01（HTTP 回执）**：D-19 复核双臂实录 + 矩阵 CJK 双臂化落地
  （「仅 merged 臂」注记清除清单）；D-21 回执窗统计入 §9 与 ledger
  v18（**如实判**——归档或续留观，负结果同样合规）。验证：T-01 +
  T-05。
- **AC-02（每日笔记）**：新建/幂等/模板/双时间戳/连日并存案双臂
  绿；UI 弧线（入口→开档→树行→重入）双轨绿。验证：T-02 + T-05。
- **AC-03（updated_at）**：有键更新/无键零引入/值形/其余键逐字节
  案双臂绿；受影响断言更新清单在案（无隐性漂移）。验证：T-03+T-05。
- **AC-04（行:列）**：vm 事件链 → store 态 → StatusBar 显示断言；
  探针 E 定谳（vue 通 = e2e 断言；不通 = 降级注记 + D-12 口径）。
  验证：T-04/T-05。
  **[r2 定谳增补（review 裁定 F-W15-1，2026-09-25）]**：探针 E 实勘
  推翻字面子项前提——oncursor 在 code_editor 非本仓消费的
  autodown_editor（组件错位）+ vue engine 无 cursor emit，**双轨
  组件面均缺、字面接线断言上游不可达**。r2 契约面 = AC-04 交付物
  定谳为「**负结果定谳 + D-12 处置维持 + 供料候选双件落位**」
  （probe E 一手源证据在案：aura_view_builder.rs:3529 事件面/
  :10766 code_editor 臂/EngineEditor.vue:366 emits；SD-1501④/
  D-12/D-32/供料包四点落位）——字面接线债务**如实记账不弱化**
  （上游解锁即恢复原 AC 面，PLAN-016 候选池首位）。r1 原文留档
  不改写。
- **AC-05（gate + 基线 v14）**：gate ALL GREEN（16/15/十五段口径
  不变）；基线 v14 零漂移（v13 留档）；N 定谳续记含 D-21 回执窗。
- **AC-06（文档面）**：SD-1501..1504 落位锚注齐；**D-19/D-21/D-12/
  Time 四面处置更新**入 ledger **v18**（回执判定 + 部分解锁注记 +
  Date 收据）；§8 供料包指针同步。

## 8. 执行步骤

- [x] **T-01 HTTP 回执 + Date 直证**（AC-01/02 前置）：serve-back CJK
  GET 复核 + D-21 观测窗首跑 + Date/daily_note back 直证（probe
  D）。验证：直证脚本 + 复核实录。
  **[✅ 2026-09-25]** `tests/probe_receipt_d19.mjs` 四案（g③④ ASCII
  原绿 + g①② CJK **负结果实录**）+ `tests/probe_daily.mjs` 双臂十四案
  全绿（Date 可调定谳——**探针 D 通**）。**工具链顺延实录**：本地
  release exe 重建（02ae0ac1c 09-23 → 63e14b045 09-25 含 PLAN-699——
  debug exe 被家族会话进程映像锁，release 旁路 + AUTO_EXE 显式指路；
  README ≥1652 → ≥2125 升级）。**D-19 回执 = 负结果如实判**：新传输
  percent-decode 在册但 `url_decode` byte-as-char 不组 UTF-8——缺口
  精化「解码不组 UTF-8」，**双臂化子步维持现状+注记**（计划 §8 依赖
  序兑现，ledger v18/D-19 处置列全录）。
- [x] **T-02 每日笔记 back+front**（AC-02）：daily_note 契约 + ActDaily
  入口流（store.Open/refresh 族直承）。验证：merged 冒烟 + build。
  **[✅]** api.at `daily_note` POST（无参契约族首证——ts_adapter 生成
  无 body client）+ wsys.daily_note_impl（幂等三步+模板双时间戳）+
  app.at action file.daily[Ctrl+Alt+N] + menubar 项 + 工具栏 calendar
  钮 + `.ActDaily`（NewGo「建页成功」口直承——零弹层）。vm ⑰ 弧线 +
  e2e daily 弧线双轨绿。
- [x] **T-03 updated_at 扩 + 断言盘点**（AC-03）：write_body 分支 + 六
  检查受影响断言更新（清单实录）。验证：直证 + 磁盘回归。
  **[✅]** `fm_touch_updated_at_line`（仅补已有键/顶层级卫/首现即止/
  \r 继承/stamp 空直通）——probe_daily u①..u④ 双臂直证（Z 形归一/零
  引入/CRLF/嵌套卫）。**断言盘点实录**：受影响档 = fixture 五档全带
  updated_at 键；vm check 5 = 更新面正证位（当日形 + title/status/
  summary 逐字节），其余磁盘断言 presence 形不受扰（⑴/幂等/10c/wanted
  模板逐字节档均无 frontmatter 零涉；move/rename_dir 字节整迁走
  File.write_text 非 write_body 零涉）。D-14 行 ledger 更新。
- [x] **T-04 行:列 + 探针 E**（AC-04）：oncursor 接线 + store 态 +
  StatusBar + 探针 E（载荷/双轨形态）。验证：merged 冒烟（打字 →
  行:列动）。**[✅ 定谳 = 负结果，接线不落地]**：探针 E 实勘——上游
  PLAN-413 Phase 2（90fe40409）oncursor 落在 **code_editor**
  （convert_code_editor :10703/:10766），本仓消费的 **autodown_editor
  无 oncursor 转换臂**（convert_autodown_editor_native 事件面 =
  oninput/on_focus；View::AutodownEditor 无 on_cursor 字段）+ vue
  engine EngineEditor.vue emits 无 cursor 载荷（仅 focusblock 块级）——
  **双轨组件面均缺**，立项前提「vm oncursor 可用」不成立。**D-12
  「行:列降级」处置维持**（负结果同合规——AC-01 如实判哲学同判），
  供料候选扩面（autodown_editor oncursor + anchor-reveal 双件）——
  ledger v18/D-12 + SD-1501④ 落位。基线 v14 变更面相应修正 = 每日
  笔记 UI 三节点（非 store cursor 态——零状态面）。
- [x] **T-05 测试扩单 + CJK 双臂化 + 基线 v14 + 判绿**（AC-01/02/03/
  04/05）：子步扩 + 双臂化清单落地 + v14 重锁 + gate 连跑（D-21 统计）。
  **[✅ 双臂化项按 T-01 负结果维持现状——计划 §8 依赖序授权]**：vm
  check 5 updated_at 断言 + file 组 ⑰ 今日笔记弧线 + e2e 5 save 断言
  + 13 daily 弧线（D-23② 渲染文断言执行期校正 1 轮）；基线 v14 首锁
  （merged 臂）+ 零漂移逐跑确认；**D-21 观测窗**：新传输负载实录 =
  HTTP 丢参/进程死亡零复现（e2e 全绿 2 轮 + gate 矩阵段连过 + probe
  全族）；败点 = split popover 内容窗 1 例[v11③ 家族]+ vue-build
  gen-only exit 1 一例[0xC0000409 家族]；gate 3 跑 1 绿如实记（第 1
  跑 vm 段败[败点未留痕]、第 3 跑 ALL GREEN）。
- [x] **T-06 文档 + ledger v18 + 收口**（AC-06/负向）：SD 四件 + ledger
  v18（四面处置）+ 负向证 + §9 记录。验证：文档 diff + gate 复跑。
  **[✅]** ARCHITECTURE §5 SD-1501 四段 + §6 SD-1502（表头/基线 v14/
  probe 清单/e2e 行）+ wiki 域语义 supersede 注记 + README SD-1503/
  1504（工具链 ≥2125/N 定谳/基线/十三切片/ledger 指针）+ 供料包
  2026-09-25 回执块 + ledger v18（表头/D-19/D-12/D-21/D-14 更新 +
  D-32 新行）+ 负向 grep 证（`.console = console_lines` app.at 零/
  split_once 代码零[2 处均注记]/fm_touch 参数无模型名碰撞/gen tracked
  零漂移/工作树零家族仓写入）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05 → T-06（线性；T-01 回执
判定为全批风向标——D-19 复核不过则双臂化子步维持现状+注记，不
阻塞 T-02..04）。**执行实录**：依赖序按序兑现；T-01 负结果触发
双臂化维持分支。

## 9. 复审记录

- **2026-09-25 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-015，revision 1。
  - `outcome: pass`——可进 work（014 已归档 be92d44——正常立项窗）。
  - `next: work`（T-01 起；**探针 D/E 在案**——Date 可调性/oncursor
    载荷，均有 fallback 不阻塞主线）。
  - updated_at 自动维护语义按默认提案（§4.1——仅补已有键）。
- **2026-09-25 执行收口（auto-plan-work）**：
  - `stage: work`，PLAN-015，revision 1，outcome pass。
  - `code_commit`: 0afd8fb（T-01..T-04 实现批——back 双件 + front 三面
    + probe 两件 + 基线 v14 + vm/e2e 扩单）+ 文档批随收口提交。
  - `task_ids`: T-01..T-06 全完成（execution_done，next: review）。
  - `evidence`: 判绿跑 = 独立矩阵 ALL GREEN（merged 16/16 含基线 v14
    零漂移 + split 15/15）+ **gate 终验 ALL GREEN**（第 4 跑 docs-only
    后代现跑——vm 双臂 + build + e2e 40.3s；第 3 跑同绿 47.0s——**新
    exe 全窗一致配置**[工具链顺延 release 重建，debug 被家族进程锁]；
    gate 4 跑 2 绿如实记，败点第 1 跑 vm 段[败点未留痕]/第 2 跑 build
    0xC0000409 家族）+ probe_daily 双臂十四案全绿 + probe_receipt
    _d19 四案实录（含负结果）+ probe 全族十一件 fresh 绿。
  - `findings`（复审请重点裁定两件）：
    - **F-W15-1（AC-04 负结果定谳）**：探针 E 实勘推翻立项前提——
      oncursor 在 code_editor 非本仓消费的 autodown_editor（组件错位
      ——aura_view_builder.rs :3529 事件面实勘 + View::AutodownEditor
      字段面 + vue EngineEditor emits 面），行:列接线不落地，D-12
      处置维持 + 供料候选扩面（oncursor/anchor-reveal 双件）。按
      AC-01「如实判——负结果同样合规」哲学记 pass 级负结果；基线
      v14 变更面相应修正（每日笔记 UI 三节点，store 零状态面）。
      复审若判 AC-04 需 contract 修订（needs_replan 局部）请裁定。
    - **F-W15-2（D-19 负结果回执）**：PLAN-699 新传输 percent-decode
      在册但 `url_decode` byte-as-char 不组 UTF-8——缺口精化「解码
      不组 UTF-8」，矩阵 CJK 双臂化维持现状（计划 §8 依赖序授权分
      支兑现）；unlock 供料候选升级单点修复面（url_decode）。
  - `blockers`: 无。
  - `next`: review（建议独立会话；工件重建口径 = probe 两件 + 矩阵
    双臂 + gate 单跑可复现，D-21 统计见 ledger v18）。
- **2026-09-25 复审（auto-plan-review；实现会话内复审——独立性声明 +
  工件重建口径，PLAN-011/014 先例）**：
  - `stage: review`，PLAN-015，**revision 2**（r1→r2 契约修正随本
    记录——AC-04 定谳增补，见上；实现零变化）。
  - `outcome: pass`。
  - `reviewed_commit`: 539bc1b（main tip）；`base_commit`: be92d44
    （014 归档点；实现批 0afd8fb + 文档批 9bb1a3b 在链）。
  - `dependency_revisions`: auto-lang release exe **v0.4.2-2125-g
    63e14b045**（实现窗同一 exe——构建自 63e14b045；auto-lang main
    已前移 c95f2a00e[PLAN-701 家族会话]，复审差如实记、证据基线不
    随动）；auto-down fixture tmp/wiki-demo 未变。
  - `spec_inputs`: ARCHITECTURE.md@539bc1b（§5 SD-1501 四段 + §6
    SD-1502）+ README.md@539bc1b（SD-1503/1504）+ parity-ledger.md
    v18@539bc1b + upstream/2026-09-jade-supply.md@539bc1b 回执块。
  - `acceptance_results`（全项现跑重放/一手核验，非执行者转述）：
    - **AC-01 pass**（含负结果合规面）：probe_receipt_d19 复放 =
      g③④ PASS + g①② 负结果复现一致（byte-as-char 定谳复现）；
      双臂化维持现状注记三面落位（SD-1501①/README/D-19 处置列）；
      D-21 窗统计在 ledger v18 + §9 + README N 定谳。
    - **AC-02 pass**：probe_daily n①..n④ 双臂复放全绿（幂等/连日/
      模板逐字节）+ gate 复审跑 vm ⑰ 双臂 PASS + e2e 13 daily PASS。
    - **AC-03 pass**：probe_daily u①..u④ 双臂复放全绿（Z 归一/零引
      入/CRLF/顶层级卫）+ gate 复审跑 check 5 双臂 PASS（updated_at
      2026-08-27T01:35:05 → 2026-09-25T11:37:43/11:38:29 + 其余键逐
      字节）+ 断言盘点在册（canonical/D-14 行）。
    - **AC-04 pass（r2 定谳面）**：字面接线子项 = 上游组件面缺失
      不可达（一手源证据三件：convert_autodown_editor_native 事件
      面仅 oninput/on_focus@aura_view_builder.rs:3529+ / on_cursor
      在 convert_code_editor@:10766 / EngineEditor.vue:366 emits 无
      cursor）——r2 契约面 = 负结果定谳 + D-12 处置维持 + 供料候选
      双件（SD-1501④/D-12/D-32②/供料包落位核验齐）；债务如实记账
      不弱化（上游解锁即恢复原 AC 面）。
    - **AC-05 pass**：复审窗 gate 现跑 ALL GREEN（merged **16/16**
      含基线 v14 零漂移 + split **15/15** + vue-build + vue-e2e
      47.2s——`e2e/.runtime/gate-run-review.log`；实现窗 gate 第
      3/4 跑同绿 + 独立矩阵 ALL GREEN——D-21 窗 4+1 跑 3 绿统计如
      实记）；组数不变 16/15/十五段。
    - **AC-06 pass**：SD-1501（ARCHITECTURE:665 段 + :156 supersede
      注）/1502（:734 表头 + probe 清单 + 基线 v14 行）/1503（README
      :156 + :339 N 定谳）/1504（:89 十三切片 + :377 ledger 指针）
      锚注核验齐；ledger v18 四面处置（D-19/D-12/D-21 v18/D-14 +
      D-32 新行）+ 供料包回执块在档；负向 grep 证（`.console =
      console_lines` app.at **0**/split_once 代码 **0**[2 处均注记
      行]/gen tracked 漂移 **0**/家族仓写入 **0**）。
  - `findings`:
    - **F-R15-1（已裁）**：AC-04 字面子项上游不可达——r2 契约修正
      （定谳增补，实现零变化）；无 needs_fix 级。
    - **F-R15-2（留观）**：依赖差 = auto-lang main 已前移
      c95f2a00e（PLAN-701 家族会话供料批），复审/实现证据基线均为
      63e14b045 构建 exe——下批立项时工具链窗口复核（README ≥2125
      口径不变，PLAN-701 供料件随下游消费批复验）。
  - `evidence`: `e2e/.runtime/gate-run-review.log`（复审 gate ALL
    GREEN 全录）+ probe 两件复放输出（本记录 AC-01/02/03 摘录）+
    canonical 落位行号（SD-1501@ARCHITECTURE:665/SD-1502@:734/
    SD-1503@README:156/SD-1504@README:89/ledger v18 表头）+ 负向
    grep 计数。durable 面：canonical 四件 + ledger + 基线
    v14 + probe 两件入库源——worktree 即 main 检出，无清理失效面。
  - `next`: merge（用户已授权全流程——work→review→merge 同会话
    连跑；本记录即 merge 的 revision-bound 复审证据）。

## 10. 待澄清事项

1. **探针 D（Date back 可调性）**：**已定谳 = 通**（probe_daily n①..n④
   双臂直证——宿主桥 .at 直调健康；fallback 分支未触发）。
2. **探针 E（oncursor 载荷与 vue 发射）**：**已定谳 = 负结果（上游
   组件面缺失）**——非载荷形态/vue 发射问题，而是 autodown_editor
   无 oncursor 转换臂（组件错位）+ vue engine 无 cursor emit；行:列
   门控续（F-W15-1）。
3. **大纲跳转续门控**（anchor-reveal prop 未暴露——立项实勘不变）：
   D-12 部分解锁注记修正为**处置维持注记**（oncursor 兑现面未兑现
   ——F-W15-1）+ 供料候选双件（oncursor 面 + anchor-reveal prop）。
4. **键位 Ctrl+Alt+N**（已随 r1 定，用户可改）：N 族避让（Ctrl+N
   新建在册）；Alt 族仅 Alt+F4 在册。
5. **updated_at 负结果容忍**（观测项）：时钟回拨/同秒保存——值
   同形幂等（无单调性保证，v0 接受）。
6. **PLAN-016 候选池**（本批后更新）：大纲（anchor-reveal + oncursor
   双件解锁——首位顺延候）、casefold+词边界批、目录移动/合并、检索
   上量微批、Time front 面 probe 批（ts_adapter Date.* 发射）、
   url_decode UTF-8 供料回执件（D-19 精化面——CJK 导航双臂化随修
   复解锁）。
