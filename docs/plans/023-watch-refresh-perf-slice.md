---
plan_id: PLAN-023
status: executing
feature_name: watch 批——刷新链路读面/取面收口（第二十一切片）
author: [agent]
created_at: 2026-09-28T00:00:00Z
updated_at: 2026-09-28T18:00:00Z
plan_revision: 1
current_step: 4
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/README.md 计划仪表盘 watch 批供料面（PLAN-022 残余——复审 F-1 裁定 unblock 路由 + ledger D-22 watch 批剩余面注记）
---

# PLAN-023：watch 批——刷新链路读面/取面收口（第二十一切片）

## 0. 变更摘要

PLAN-022 归档后的首个立项批。**立项路由依据**：README 仪表盘候选①试用
反馈件因用户反馈缺席按定文不立项（docs/README.md:671-672）；候选②已
交付但其残余供料面即「watch 批」在册（:673-676 + ledger v26 D-22）；
**PLAN-022 复审 F-1 裁定明确 unblock = 「watch 批立项以 dbg-p22 A/B
口径重推门」**（archived/022 §9 findings——孤页门冻结随档，重推路由已
裁）。**纯内部性能优化（PLAN-022 同族续批）**：back 索引装配每页双读
单读化（File.read_text frontmatter 面 + read_body 再读 → 一读两剖）+
front `wanted_rows_of` 同构收口（O(D×P×L̄) 重复全扫 → 平面计数）+
`LinksRefreshOf` 双取形消除（link_index 原文态+解析态两次取 →
`json.parse` 单取——规划期一手源已证通道可行）。**契约零变化、输出
逐字节零漂移、基线 v19 零重锁候选（零重锁第四例——017/022 先例续）**
，收口件 = dbg-p22 口径孤页门重推（F-1 兑现）+ bench150 重放对拍。

## 1. 目标

1. **① back 每页双读单读化**（wsys.at 三处）：`links_json`
   （:433-469——pass1 `File.read_text` 取 frontmatter :444 + pass2
   `read_body` 再读 :452，每页两趟磁盘读）→ pass1 单读保留平行
   `bodies` 表（022 `ptags_all` 同款在册形态），pass2 索引取零磁盘；
   `search_json`（:512 read_body + :518 File.read_text 再读）→ 单读
   两剖；`page_tag_set`（:2505-2507 同款两读）→ 单读两剖。新增
   `body_of(text)` 纯文本剖切助手，`read_body` 重构为其薄壳
   （`body_of(File.read_text(...))` ——同代码路径搬移，字节语义零
   变化）。输出逐字节零漂移（§6 前后采门）。
2. **② front `wanted_rows_of` 同构收口**（app.at:752-808）：现两遍
   聚合 pass2 每 distinct 悬空 target 全页全链重扫计数
   （O(D×P×L̄) VM 解释循环——022 `orphan_rows_of` 收口前同族形态）→
   pass1 平面收集全部悬空 target（flat 含重复，O(L)）+ pass2 首现序
   去重同时计数（O(D×L)）。行集/行序/行形状/label 公式零变化。
3. **③ `LinksRefreshOf` 双取形消除**（app.at:2244-2254）：现
   `lj = link_index("",8)` 原文态 + `json.to_value(link_index("",8))`
   解析态**两次全量取**（双取 ~0.6s@150 页——D-20⑤ ts_adapter 恒等
   陷阱的 workaround）→ `lp = json.parse(lj)` 单取（.links_json 原文
   态赋值保留——基线 v19 state 面零触碰）。通道可行性规划期一手源
   闭合（§4.3）。
4. **④ 量级实录与孤页门重推**（AC-03）：bench150 重放四点对拍 +
   dbg-p22 口径孤页弧 A/B（同 exe 同语料交替轮——双取段清偿直证）；
   **门 = dbg 口径孤页弧（press→mode + mode→rows 合计）≤ 2.0s**
   （数值面沿用 022 冻结门、口径面换 dbg 细粒度[无 bench 固定
   sleep(500) 干扰]——严格性不减的口径净化，F-1 指定口径）。

**非目标**：

- **fs 事件监听**（watch 批原始愿景「免重 walk」的监听半）：auto-lang
  native catalog 一手源**无 fs.watch/notify 原语**（仅 `auto.fs.mtime`
  2997 在册——native_catalog.rs:1115）→ 监听面维持上游供料记账
  （§10.2 mtime 键控缓存挂账面另记）。
- **mentions 串联解耦**：`MentionsRefreshOf` 链式内化是 D-26② 刻意
  设计（已链源集自派生——vue 轨并发 fetch 竞态消除），且面板关守卫
  下零 fetch 零成本（app.at:2295）——不动。
- **派生族单趟化**（titles/bl/ol 融合单趟）：titles/bl/ol 各自谓词
  不同、内功总量不可减，融合仅省循环脚手架——本批不立项；T-04 dbg
  分量复测供料（§10.3 若占比显著 → 下一批候选）。
- **契约面零变化**：api.at 零 diff——不新增/不合并/不改契约（022
  同款约束）。
- **失败路径语义精化面**（③ 副产物）：`json.parse` 对空串/非法 JSON
  显式抛错入 catch（现 to_value 静默 null 传播致下游 null.len() 裸
  崩）——行为差异面仅 D-35② 值损坏域（P>200 病理形），健康语料零
  触及，如实入档不作断言面（§5.3）。

**成功样**：150 页工作区 link/tags/search 索引面、孤页入口弧、boot
序列量级带内或改善；标准语料全部既有断言零漂移全绿；dbg 口径孤页门
过门（或越门归因裁定实录——022 §10.1 预授权出口续）。

## 2. 架构方案

**现状证据链**（@950b4ea main tip 一手勘定 + auto-lang 家族仓一手源）：

- **back 双读形态三处坐实**：`links_json` pass1 循环
  `frontmatter_of(File.read_text(resolve(p.rel)))`（wsys.at:444）收
  stems/rels/aliases/dtitles 平行表后**弃置原文**，pass2 循环
  `read_body(rels[j])`（:452）**再读一遍**磁盘取 body 提链；两循环
  不可直接融合——`extract_links_json(body, stems, aliases, rels)`
  （:453）需要 pass1 全页 stems/aliases 表（跨页 stem/alias 解析定
  target_path）→ **平行 bodies 保留法**（pass1 单读两剖，body 存平行
  List，pass2 索引取——022 `ptags_all` 平行集同款在册形态，D-20②
  纪律）。`search_json` 每页 `read_body(p.rel)`（:512）+
  `page_aliases(frontmatter_of(File.read_text(...)))`（:518）两读
  ——单页自足无跨页依赖，直接单读两剖。`page_tag_set`
  （:2505-2507）`page_tags(frontmatter_of(File.read_text(...)))` +
  `page_inline_tags(read_body(rel))` 同款两读——单读两剖（022 后
  tags_json pass1 每页恰调一次，本批再砍其第二读）。
- **front `wanted_rows_of` 两遍聚合**（app.at:752-808）：pass1
  first-seen 去重收 targets（:753-780——内层 linear seen 扫描）；
  pass2 每 target **重新全页全链扫**计数（:781-806——O(D×P×L̄)）。
  同构先例 = 022 `orphan_rows_of` 平面化（:825-857——平面预收 +
  守卫前置，A/B 归因 −0.93s 直证同族收口收益）。
- **双取全仓唯一点**：`LinksRefreshOf`（app.at:2249-2251）——
  `tree`/`tags_index`/`search_wiki`/`page_meta`/`trash_list` 全部
  单取 call-arg 形（:2206/:2370/:2301/:2707/:3174），双取仅此一处
  （原文态 .links_json 基线锁面 + D-20⑤ 恒等陷阱 workaround 双因）。
- **基线 v19 锁 .links_json state**（tests/baseline/structure-v19.txt
  :49）→ ③ 必须保留原文态赋值（单取后 `.links_json = lj` 照旧——
  state 值域零变化，零重锁路径）。
- **量级在册**（022 bench150/复审窗）：link_index 289-304ms@150 页
  （双取各一趟）、search 54-72ms、tags_index 237-246ms、boot-ready
  2.64-2.66s、dbg 孤页弧 click→mode 1560ms（09-27 exe）/736ms
  （09-28 exe 复审窗新载体——8.2s 在册基线系 exe+窗口绑定在案）。

**改法**（三处纯函数/共享口内部重写，接口/输出/契约三零变化——022
同款纪律）：

1. **back `body_of(text)` 助手 + 三处单读化**：提取 read_body 的
   starts_with 界符判定 + `body_after_open` 调用（wsys.at:77-86）为
   `fn body_of(text str) str`；`read_body(path)` 重构为
   `body_of(File.read_text(resolve(path)))`（同逻辑搬移）。
   `links_json` pass1：`text = File.read_text(...)` 一次 →
   `fm = frontmatter_of(text)` + `bodies.push(body_of(text))`；
   pass2 `body = bodies[j]`。`search_json`/`page_tag_set`：单读
   `text` → fm 域与 body 域同源两剖。**输出逐字节等价论证**：
   `body_of(text) ≡ read_body 现行剖切`（同代码路径）；
   `frontmatter_of(text)` 输入同字节（现行本就吃全文串）——同输入
   同输出纯读函数，读趟数变化零外溢。
2. **front `wanted_rows_of` 平面计数**：pass1 flat 收集全部悬空
   target（含重复，O(L)——`!ex` 卫原样）；pass2 按 flat 序遍历：首
   现判定（前向已现扫）+ 同 target 全 flat 计数（O(D×L)）→ 装配
   `{target, count, label}`（label 公式原样）。**行集等价论证**：
   首现序 = 现行 pass1 first-seen 扫描序（同一 flat 序的首现）；
   count = 悬空链实例数（现行 pass2 计数同义）；无 List 元素定址
   写（「未证形态」注记 :748-749 规避延续——flat 形全在册原语）。
3. **front 双取形消除**：`lj = link_index("", 8)` 单取 →
   `.links_json = lj`（state 面原样）→ `lp = json.parse(lj)`。
   **双轨等价论证（一手源）**：vm 侧 `json.parse` = native 1902
   `shim_json_parse_vm`（stdlib.rs:2878-2884——JSON 文本物化堆值）
   与 `shim_json_to_value`（:3184-3222）**共用同一
   `json_to_vm_value` 转换管线**（健康路径等价）；vue 侧
   ts_adapter 对 `json.parse(x)` **任意实参直发射
   `JSON.parse(x)`**（ts_adapter.rs:2187-2201——恒等陷阱仅咬
   `to_value` 非 api-call 实参 :2156-2183）。native catalog Void
   标注列非强制（`auto.json.to_value` 3100 同标 Void 而全仓作表达
   式用——native_catalog.rs:1371）。失败路径差异（空串/非法：
   parse 显式抛错入 catch vs to_value null 传播）见 §1 非目标——
   健康语料零触及。

## 3. 技术栈

不变（022 同款）：自有 Auto back（src/back/wsys.at——VM .at 模块，
merged 进程内直调/split serve-back 双臂同源）；front .at 单源双轨
（src/front/app.at → vm 轨 + vue 轨 ts_adapter 生成）；测试体系 =
vm 矩阵（tests/vm_matrix.mjs 16 组 + 基线 structure-v19）+ e2e 十五
段 + probe 族（tests/probe_*.mjs）+ gate（scripts/gate.mjs）+ bench
（e2e/.runtime/p21-bench150.mjs ignored 一次性件）+ dbg A/B
（e2e/.runtime/dbg-p22.mjs ignored 一次性件——022 T-04 归因件复用）。
上游依赖 = auto-lang 家族 exe（debug/release 双载体——执行窗时间戳
实录纪律）。**本批零新依赖零探针零闸**（全部可行性规划期一手源闭
合，§4.3）。

## 4. 需求分析与背景调查

**授权记录**：用户授权 = 「计划022已经完毕；请规划下一个计划」——
auto-plan-new 立项起草授权（本技能不实施；work 阶段执行授权随
auto-plan-work 交互另行取得）。无用户指定预算/自动续行限制——按仓
内惯例（001..022 线性直接 main、判绿矩阵+分段路由、bench 量级门+
预授权归因出口）。**立项裁量**（候选池首位序依 README 仪表盘
:669-689）：①试用反馈件——用户反馈缺席按定文「无反馈则本类不立项」
顺延；②已交付（PLAN-022）但其复审 F-1 裁定 = watch 批立项重推门
（已裁 unblock 路由——强于仪表盘陈注「归因待复审裁处」，因复审已
裁）；③上游回执件——「视家族窗」条件未证实（probe_receipt_d19 未
翻案前不具立项面，且回执负结果则批退化 docs-only）；④微件池——
反馈缺位顺延项（优先级次于已裁 unblock 路由）。**选 watch 批本仓
可执行面**（三件改写 + 门重推，全部本仓内零上游解锁依赖）。

**Specs 现状**：本仓无 docs/specs/ 目录——canonical 规范 = 
docs/ARCHITECTURE.md（§5 后端/§6 测试体系）+ docs/README.md（Tests/
是什么/仪表盘）+ docs/parity-ledger.md（衍生账 v26），001..022 在档
惯例（022 §4 同款声明）。

**背景调查（规划期一手源闭合，@950b4ea + auto-lang 家族仓）**：

1. **供料面在册链**：README:673-676（②出池注记——watch 批供料面：
   孤页入口残余 2.5s = 非目标面[双取形/派生族/仪表]）+ ledger v26
   D-22 处置列（watch 批剩余面注记 = fs 监听免重 walk + 双读单读化
   + 双取形 + wanted 同构）+ archived/022:49-57（非目标三条即本批
   ①②③）+ :607-621（§10.7 孤页门归因——供料候选三件在册）+ §9
   F-1（:513-529 unblock 裁定）。
2. **fs 监听原语缺席**：auto-lang native_catalog.rs 全量 grep——
   fs 面无 watch/notify 族；`auto.fs.mtime`（2997，:1115）在册。
   parser dot 访问 = 任意 identifier 通用（parser.rs:2420-2445——
   D-24① File.copy 拒因系 token 关键字冲突非成员白名单，`parse` 非
   关键字零涉）。
3. **json.parse 通道三面一手源**：ts_adapter.rs:2156-2201（发射面
   ——to_value 恒等陷阱精确边界 + parse 直发射任意实参）；
   stdlib.rs:2864-2884 + :3184-3222（VM 面——parse/to_value 共
   json_to_vm_value 管线 + parse 非法输入显式报错 vs to_value 静默
   null）；native_catalog.rs:1352/:2279（1902 在册）+ :1371（Void
   标注列对 to_value 同标而表达式用全仓实证——非强制）。
4. **仪器口径**：p21-bench150.mjs:219/242（sleep(600)/sleep(500)
   固定等待 = 022 残余构成「仪表固定 sleep ~0.7s」界定）；
   dbg-p22.mjs 头注（「无 bench 固定 sleep(500) 干扰」——50ms 细粒
   度轮询，press→mode/mode→rows 两段输出）= F-1 指定重推口径。
5. **wanted/orphan 现状**：app.at:752-808（两遍聚合 + 「列表元素
   定址替换未证形态」规避注记 :748-749）；022 orphan 平面化先例
   （:825-857 + ARCH §5 :1038-1051 定文）。
6. **双读现状**：wsys.at:433-469/:490-530/:2505-2527（§2 证据链
   所列）；`extract_links_json` 跨页依赖（stems/aliases 全表实参
   :453）→ 融合不可行/平行表可行的结构约束。

## 5. 详细设计

### 5.1 back 单读化（T-01）

- `fn body_of(text str) str`（wsys.at read_body 段位）：
  ```text
  fn body_of(text str) str {
      if text.starts_with("---\n") { return body_after_open(text) }
      if text.starts_with("---\r\n") { return body_after_open(text) }
      return text
  }
  pub fn read_body(path str) str { return body_of(File.read_text(resolve(path))) }
  ```
  （现行 :77-86 逻辑原样搬移——`body_after_open` 本体零触碰。）
- `links_json`：pass1 循环体改 `var text str = File.read_text(
  resolve(p.rel))` + `var fm str = frontmatter_of(text)` +
  `bodies.push(body_of(text))`（平行 List 声明随 stems/rels 族）；
  pass2 `var body str = bodies[j]`（:452 替换）。docstring 增单读
  平行表注记（022 ptags_all 同款措辞）。
- `search_json`：循环内 `var text str = File.read_text(resolve(
  p.rel))` → `var body str = body_of(text)` + `var als List =
  page_aliases(frontmatter_of(text))`（:512/:518 替换）。
- `page_tag_set`：`var text str = File.read_text(resolve(rel))` →
  `page_tags(frontmatter_of(text))` + `page_inline_tags(
  body_of(text))`（:2506-2507 替换）。
- **等价面**：三处输出均纯读函数同输入同输出（剖切同代码路径、
  fm 域输入同字节）；probe 全族（probe_tags/probe_dir_ops 等 14 件
  含 links/search/tags 面）+ 前后采逐字节门（§6）承载。

### 5.2 front wanted_rows_of 平面计数（T-02）

- pass1：`var flat List = []`——i×k 扫描（原 pass1 框架）`!ex` 时
  `flat.push(t)`（**不去重**，O(L)——内层 seen 扫描删除）。
- pass2：按 flat 序遍历索引 f2——首现判定（f2 前向已现扫 O(D×L)
  总计）→ 首现时全 flat 同值计数 O(D×L) → `out.push({target: t,
  count: n, label: t + "（" + n.str() + "）"})`（公式原样 :804）。
- 行序 = flat 首现序 ≡ 现行 first-seen 扫描序；count ≡ 现行 pass2
  实例计数；无索引写/无未证形态（D-20② 元素先拷局部纪律续）。
- docstring 增平面计数注记（orphan_rows_of 022 注记同款）。

### 5.3 front 双取形消除（T-03）与量级预估（§5.4 门）

- `LinksRefreshOf` try 体（app.at:2248-2254）：
  ```text
  try {
      lj = link_index("", 8)
      .links_json = lj
      lp = json.parse(lj)
  } catch (e) { lok = false }
  ```
  （两次 `link_index` 调用 → 一次；`.links_json` 赋值面/state 值域
  原样——基线 v19 零触碰。注释块 :2238-2243 更新：D-20⑤ workaround
  退役注记 + json.parse 通道双轨等价一手源引证。）
- **失败路径差异面**（如实入档非断言面）：split 臂值损坏域
  （D-35②——HTTP 200 空串形）下，旧形 `to_value("")` → null 传播
  → 下游 `null.len()` handler 中段裸崩（状态半刷新）；新形
  `parse("")` → 显式 throw → catch → `lok=false` → console 注记 +
  空行集干净落态。健康语料（矩阵/e2e/probe/bench 全断言域）零触及。
- **MentionsRefreshOf/TreeRefresh/TagsRefresh 零触碰**（单取在册
  形维持——D-20⑤ 恒等陷阱对 call-arg 形无涉）。

### 5.4 量级预估与门（AC-03 口径）

- **预估带**（150 页语料）：link_index 双取面 −1 全量调用 ≈ −0.29s
  /触点（boot Init、保存、面板开启、孤页入口全触点共享）；back 单读
  化 link ~0.29s → ~0.15-0.25s、tags 0.24s → ~0.15-0.2s、search 微
  降；boot-ready 2.64s → 预估 ~2.0-2.3s（记录面不设门）；dbg 孤页
  弧（022 复审窗 736ms 新载体）→ 预估 ~0.4-0.7s（双取段清偿 +
  wanted 同构小贡献）。
- **门**：dbg 口径孤页弧（press→mode + mode→rows 合计）**≤ 2.0s**
  ——数值面沿用 022 冻结门（防静默弱化目的延续）、口径面换 dbg
  细粒度（bench ⑨ 的仪表固定 sleep(500)+菜单弧等非产品成本出
  门——F-1 指定口径重推）。bench ⑨口径降记录面（如实实录+仪表
  sleep 界定注记）。
- **越门出口（预授权——022 §10.1 同款续）**：同窗重跑一次（D-21
  家族负载窗口径）；仍越门 → dbg 分量计时归因（VM 循环量/非目标面
  分账）如实记交复审裁处——不硬调门。
- **A/B 归因口径**：dbg-p22.mjs 同 exe 同语料交替 ≥3 轮（022 T-04
  惯例）——pre-change 树（950b4ea git-archive+deps 物料，D-37⑦/
  022 物料形状教训：archive 不含 ignored deps/ 需补拷）vs 本批树，
  双取段清偿直证（press→mode 分量对比）。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2301 | modify | docs/ARCHITECTURE.md §5（后端） | before：§5 第二十切片段（SD-2201）watch 批剩余面注记（重 walk 免除属 watch 批）；links_json/search_json/page_tag_set 双读形态无专项定文；§5 front 共享口域 LinksRefreshOf 双取形 workaround 注记（D-20⑤）。after：§5 第二十一切片段——刷新链路读面/取面收口定文：back 单读两剖（body_of 助手 + 平行 bodies 表——逐字节等价论证）+ wanted 平面计数（O(D×P×L̄)→O(D×L)——行集等价论证）+ 双取形消除（json.parse 单取——ts_adapter/stdlib 双面一手源引证 + 失败路径精化注记）+ 量级实录（150 页对拍带）+ fs 监听原语缺席一手源结论（watch 愿景监听半维持上游供料；auto.fs.mtime 在册注记） | watch 批供料兑现（ledger v26 D-22 剩余面四件之三 + F-1 unblock）；022 非目标三条转正 | AC-01/02/03 |
| SD-2302 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests heading | before：§6 SD-2202 heading（PLAN-022 零扩单——第二十切片）。after：SD-2302 续零扩单注记（第二十一切片同判——纯内部性能片第三例：既有断言域全量承载 + 基线 v19 零漂移[零重锁第四例候选] + 前后采逐字节门扩 links/search/tags 三面 + dbg 口径孤页门注记） | 022 SD-2202 先例同款（§6 heading 惯例随批扩） | AC-02/03 |
| SD-2303 | modify | docs/README.md（是什么 + Tests N 定谳 + 计划仪表盘） | before：是什么第二十切片条目 + 仪表盘②出池注记（watch 批供料面在册——孤页门「归因待复审裁处」陈注）+ 留观项面板。after：是什么第二十一切片条目（watch 批读面/取面收口——单读/平面计数/双取消除/dbg 门重推实录值）+ Tests N 定谳 023 实录 + 仪表盘更新（孤页门重推结果落位——F-1 兑现闭环注记；留观面板续记） | 知识库三件形惯例（019/020/021/022 先例）；F-1 陈注闭环 | AC-03/06 |
| SD-2304 | modify | docs/parity-ledger.md | before：v26——D-22 处置列 watch 批剩余面注记（四件挂账）+ D-20⑤ 双取 workaround 在册。after：v26→v27——D-22 处置更新（watch 批供料兑现分账：双读单读化/双取消除/wanted 同构三件兑现 + fs 监听原语缺席一手源定谳 + mtime 键控缓存挂账）+ D-20⑤ 注记（json.parse 通道在册——恒等陷阱 workaround 退役面）+ D-39 新行若执行窗现新双轨差异面（022 惯例：无新面则不立） | 衍生账随批刷新惯例（SD-2104/2204 同款） | AC-06 |

## 6. 测试设计

- **前后采逐字节门（AC-01 主证——022 p22-tags-sample 口径扩面）**：
  一次性件 `e2e/.runtime/p23-links-sample.mjs`（ignored 家族口径）：
  serve-back 同通道全量落盘 **links_json/search_json/tags_json 三面**
  （标准语料 + p21-ws150 150 页语料）改动前后双语料——sha256 全等 +
  首中尾锚逐项相等（links: 首页/中页/末页 JSON 对象；search: 多 q
  采点含 alias 命中/title-only；tags: 022 九采点形续）。
- **vm 矩阵**（AC-02 主证）：`node tests/vm_matrix.mjs` merged 臂
  16/16 ALL GREEN + 基线 v19 零漂移 PASS（零重锁第四例候选——state
  面：.links_json 值域原样/wanted_rows 值域原样[行集等价]/dump 面
  零变化/id 序列零变化）；⑧ orphans 三语义面 + wanted 面（悬空聚
  合/建页消缺）+ meta 组 tags 面全过 = 重写语义面直证。
- **e2e 十五段 + vue build**（AC-02）：`node scripts/gate.mjs` 分段
  路由口径（家族窗常态——build 段 release 路由 + SCHEMA_DRIFT_
  GENERATE_AT=1；e2e 段 debug serve-back）；vue 侧 `json.parse` 发
  射直证 = 生成源检（gen/front/vue App.vue grep `JSON.parse(` 双取
  消除后 link_index 调用点恰 1 处）。
- **probe 全族 fresh**（AC-04）：14 件（probe_tags/probe_dir_ops/
  probe_receipt_d19[负结果 D-19 在册一致预期] 等）双臂。
- **bench150 重放 + dbg A/B**（AC-03）：`node e2e/.runtime/
  p21-bench150.mjs`（tags_index ≤1.5s 022 门续 + link/search 带 +
  boot-ready 记录 + ⑨孤页 bench 口径记录面 + findings 无新增）+
  `node e2e/.runtime/dbg-p22.mjs`（≥3 交替轮 A/B + 门判定——
  §5.4）。
- **负向证族**（AC-05）：`.console` 属性写面精确 grep 0（D-25①）/
  api.at diff 0 行 / 基线文件零触碰（git status tests/baseline 空）
  / gen·dist ignored 零手改 / 冻结池·家族仓零接触（A/B 物料仓外
  即用即删——D-37⑦ + 022 archive 不含 deps 补拷教训预置）/ 一次性
  件居 ignored .runtime。

## 7. 验收标准

- **AC-01 back 单读化输出逐字节零漂移**：前后采门三面双语料 sha256
  改动前后全等 + 首中尾锚逐项相等；probe 全族双臂 RESULT 全绿
  （probe_receipt_d19 负结果在册一致）；`git diff api.at` = 0 行。
  验证：`node e2e/.runtime/p23-links-sample.mjs`（改动前后各一跑，
  sha256 对拍）+ probe 族 fresh。
- **AC-02 front 两处重写行为零变化**：vm 矩阵 merged 臂 16/16 ALL
  GREEN 含基线 v19 零漂移 PASS（⑧ orphans/wanted 语义面全过）+
  e2e 十五段全绿 + vue build 绿（release 路由）+ 生成源检 link_index
  调用点恰 1 处。验证：`node tests/vm_matrix.mjs` + gate 分段 + gen
  源 grep。
- **AC-03 量级实录与孤页门重推（F-1 兑现）**：bench150 重放——
  tags_index ≤1.5s（022 门续）+ link/search 带内或改善 + boot-ready
  实录（记录面）+ findings 无新增；**dbg 口径孤页弧 ≤2.0s**（§5.4
  门——同窗重跑一次预授权出口 + 越门归因裁定实录[022 §10.1 同款]，
  门文本随本计划冻结）；A/B 分量归因 = 双取段清偿直证（pre-change
  950b4ea 树 vs 本批树交替 ≥3 轮 press→mode 对比）。验证：
  p21-bench150.mjs + dbg-p22.mjs A/B 两树日志（.runtime 落盘）。
- **AC-04 判绿矩阵与外部窗口径**：merged 矩阵 + e2e + build 全绿
  （AC-02 载体）；probe 全族 14 件 fresh；split 臂 = 家族窗口径续
  （若再现 boot FAIL+树行不现族签名 → git-archive pre-change
  A/B 零接触定谳 + 分段判绿——018..022 五批先例 + D-21 v26；exe
  时间戳实录随批）。验证：vm_matrix 双臂 + 判别链物料（即用即删）。
- **AC-05 负向证全零**：§6 负向证族七面 grep/状态面全零违例。验证：
  精确 grep 族 + git status 面。
- **AC-06 文档四面锚位与一致性**：SD-2301..2304 落位（ARCH §5 第
  二十一切片段 + §6/README Tests heading + README 是什么/N 定谳/
  仪表盘 + ledger H1 v27/表尾 v26→v27/D-22·D-20⑤ 处置读回）+ delta
  文本与实测值带内。验证：文档 diff 检视 + 锚位行号读回 + ledger
  表头读回。

## 8. 执行步骤

- **T-01 back 单读化**（AC-01；wsys.at）
  - [x] `body_of(text)` 助手提取 + `read_body` 薄壳重构（:77-86）；
  - [x] `links_json` 平行 bodies 表（pass1 单读两剖 :440-448 + pass2
    索引取 :452）+ docstring 单读注记；
  - [x] `search_json` 单读两剖（:512/:518）；
  - [x] `page_tag_set` 单读两剖（:2506-2507）。
  - 验证：前后采件三面双语料 sha256 全等 + probe 全族 fresh +
    `git diff src/back/api.at` 0 行。
  - **预期**：三面输出逐字节零漂移；磁盘读面每页 2→1（150 页
    link/tags/search 各 −P 趟）。
  - **[✅ 已完成 2026-09-28]** 前后采逐字节门 PASS：p23-links-sample.mjs
    三面（links_json/tags_json/search_json）× 双语料（标准 wiki-demo +
    p21-ws150）改动前后 cmp 逐字节全等（9 件 sha256 全等；tags 两面
    sha256 0c5e76e8/1dcaad66 与 022 在册值同源）；probe 全族 14 件
    fresh（13 RESULT 全绿双臂 + probe_receipt_d19 负结果 D-19 在册
    一致）；`git diff api.at` 0 行。落地提交随批。
- **T-02 front wanted_rows_of 平面计数**（AC-02；app.at:752-808）
  - [x] pass1 flat 收集（含重复）+ pass2 首现计数装配（label 公式
    原样）+ docstring 平面化注记。
  - 验证：vm 矩阵 merged 臂 16/16（⑧ orphans/wanted 面直证）+
    基线 v19 零漂移 PASS（state 段含 wanted_rows 值域——零漂移即
    行集/行序等价直证）+ bench150 findings 无新增承载。
  - **[✅ 已完成 2026-09-28]** 落点树 merged 矩阵 16/16 ALL GREEN
    （基线 v19 零漂移 PASS——**零重锁第四例**：store/App 零新字段/
    dump 零变化/id 序列零变化；⑧ orphans 三语义面 + wanted 已知答案
    「页面名（1）+外造 Wanted Target（1）」label 全过 = 重写语义面
    直证）。
- **T-03 front LinksRefreshOf 双取形消除**（AC-02/03；app.at:
  2244-2254）
  - [ ] `json.parse(lj)` 单取替换 + 注释块更新（D-20⑤ workaround
    退役 + 一手源引证 + 失败路径精化注记）。
  - 验证：vm 矩阵（link 组全过——bl/ol/wanted/orphan/mentions 派
    生链）+ e2e + build 后 gen 源检 `JSON.parse(` link_index 调用
    点恰 1 处 + merged 臂冒烟（json.parse native 1902 表达式消费
    实跑直证）。
  - **[⛔ blocked 2026-09-28——实现完成并验证后回退，待用户裁处]**
    实现已按 §5.3 落地且 **vm 轨全绿**（全三改动树 merged 矩阵
    16/16 含基线 v19 零漂移——json.parse native 1902 表达式消费
    实跑直证；gen 源检 `lp = JSON.parse(lj)` link_index 调用点恰
    1 处）。**vue 轨 e2e 确定性败形**（3/3 复现）：`pnpm test:e2e`
    稳定败于 trash 恢复弧 tab 重开步（matrix.spec.ts:821——
    `.first()` 解析到编辑器 wikilink span 被引擎 block-boundary
    遮罩持久拦截 240s 超时）。**二分定谳**（git-archive 950b4ea
    pre-change 树 A/B，同 exe 同引擎 dist）：pre 树 3/3 绿、全三
    改动树 3/3 败、**仅 T-03 树败**（同签名）、仅 T-01+T-02 树绿
    ——败形唯 T-03 引入。**根因链**（trace 实证）：单取使恢复弧
    LinksRefreshOf 提前 ~1 RTT 完成 → 串联 MentionsRefreshOf 的
    search_wiki 响应与 TreeRefresh 的 tree 响应**同毫秒完成**
    （network trace 05.106/05.107）→ 触发 browser↔vite-proxy↔
    backend 潜性竞态：tree 响应**后端已 200（access log）而浏览器
    侧 fetch 200+ 秒未落**（trace 全量快照扫描树行恒缺至 204s+
    error-context aria 240s 始现）→ ft_nodes 陈旧 → 树行不渲染 →
    `.first()` 落 wikilink span 被遮罩拦截。双取形（多一趟 ~150ms
    GET）恰好错开该竞态。**回退**：T-03 已自主树回退（app.at 还原
    双取形+原注释块），落点树 = T-01+T-02 e2e 全绿。**unblock
    三选**（§10.6）：①降级挂账（双取形维持在册）②e2e 基建授权修
    （vite proxy 定序/测试步 821 选择器收紧）③上游竞态修复后重推。
- **T-04 判绿矩阵 + bench150 重放 + dbg A/B 门重推**（AC-03/04/05）
  - [x] vm 矩阵双臂 + e2e 十五段 + vue build（分段路由口径）+
    probe 全族 14 件 fresh；
  - [x] bench150 重放（四点带 + findings 面）；
  - [x] dbg-p22 A/B（pre-change 950b4ea archive 物料[deps 补拷]
    vs 本批树）+ §5.4 门判定 + 分量归因实录；
  - [x] 负向证族七面 + exe 时间戳实录（D-35②/F-R17-1 留观面板
    交接续记——非本批阻断项）。
  - **[✅ 已完成 2026-09-28——按落点树（T-01+T-02）实测]** e2e 十五
    段全绿 1.3m（落点树）+ merged 矩阵 16/16（基线 v19 零漂移）+
    split 臂 = 家族窗第七例（boot FAIL+wiki 树行不现 v23..v26 逐
    字同形——**判别链续**：git-archive 950b4ea pre-change 树同 exe
    复现同款零接触定谳 + probe 族 split 臂同窗全绿旁证 + 分段判绿
    018..022 六批先例；物料即用即删 D-37⑦——archive 不含 deps 补
    拷教训预置兑现）+ vue build 绿（release 路由+
    SCHEMA_DRIFT_GENERATE_AT=1 ✓built）。bench150 落点重放：tags
    **235ms ≤1.5s 过**（022 在册 237-246 带内）+ link 282/265ms
    （在册 289-304 带内微改善）+ search 48-54ms（在册 54-72 微改
    善）+ boot-ready **2455ms**（022 在册 2640-2659——T-01 单读化
    Init 链顺产改善，记录面）+ findings **零新增**。dbg 口径孤页
    门重推（F-1 兑现）**PASS**：落点树弧合计 891/841ms ≤ 2.0s
    （交替轮 pre 树 866/867ms 同带——**门在落点状态已过**；全三改
    动树曾测 545/495/503ms 含 T-03 双取段清偿贡献 ≈−0.35s——该
    归因随 T-03 挂账不适用，如实记）。负向证七面全零：.console 属
    性写面 grep 0（D-25①）/ api.at diff 0 行 / 基线文件零触碰 /
    gen·dist ignored 零手改 / 冻结池·家族仓零接触（A/B 物料仓外
    即用即删复核）/ 一次性件居 ignored .runtime / probe_receipt_d19
    负结果在册一致。exe 时间戳实录：debug 09-28 15:02 / release
    09-28 15:17 本批全程未变（022 复审窗载体——同 exe 跨批稳定
    第四证；D-35② 复测条件维持观察）。
- **T-05 文档 + ledger v27 + 收口**（AC-06）
  - [x] SD-2301（ARCH §5）/SD-2302（§6 + README Tests）/SD-2303
    （README 是什么/N 定谳/仪表盘）/SD-2304（ledger v26→v27）落位
    + §9 work 记录 + 负向证 grep 族。
  - 验证：文档 diff 检视 + 锚位读回 + ledger 表头读回。
  - **[✅ 已完成 2026-09-28——按实际交付面落位]** 四面锚位 + delta
    文本与实测带内；SD-2301 双取消除段记挂账（D-39 引证）；ledger
    D-39 新行（vue 轨 dev-stack 竞态立案）+ D-21 v27 扩记 + D-22
    处置更新（四件之二兑现）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性——001..022 提交序
惯例；零探针零闸：可行性规划期一手源闭合，无上游解锁依赖）。

## 9. 复审记录

- **2026-09-28 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-023，revision 1。
  - `outcome: pass`——可进 work（022 已归档 950b4ea——正常立项窗；
    候选①试用反馈件反馈缺席顺延；F-1 裁定 unblock 路由 + watch 批
    供料面全部本仓可执行）。
  - `next: work`（T-01 起；零探针零闸）。
  - 立项裁量记录：候选池首位序依 README 仪表盘（950b4ea 现势）——
    ①反馈缺席不立项（定文）；②已交付但其复审 F-1 已裁 watch 批立
    项 = 孤页门 unblock（强于仪表盘陈注「待复审裁处」——复审已裁）；
    ③上游回执件条件未证实（回执负结果则退化 docs-only 不具立项面）；
    ④微件池顺延项后置。门口径取 §5.4（dbg 细粒度——F-1 指定），
    数值面 2.0s 沿用冻结门。
  - 规划期调查闭合面：§4.1-4.6（json.parse 通道三面一手源/监听原语
    缺席/双读三处坐实/融合约束/基线锁面/仪器口径界定——零悬置假设）。

- **2026-09-28 work handoff（auto-plan-work）——blocked（T-03 项）**：
  - `stage: work`，PLAN-023，revision 1。
  - `outcome: blocked`（T-03 一项——环境竞态需用户裁处；T-01/T-02/
    T-04/T-05 按落点树全数完成并通过验证）。
  - `code_commit`：随批线性提交（wsys.at body_of 三处单读化 +
    app.at wanted 平面计数 + 本计划文件 + 文档四面）。
  - `task_ids`：T-01 ✅ / T-02 ✅ / T-03 ⛔ blocked（实现+验证后回退
    ——根因链与 unblock 三选见 §8 T-03 块）/ T-04 ✅（落点树口径）/
    T-05 ✅（按实际交付面）。
  - `evidence`：前后采逐字节门三面双语料 cmp 全等 + probe 全族 14 件
    fresh + merged 矩阵 16/16（基线 v19 零漂移——零重锁第四例）+
    e2e 1.3m 全绿（落点树）+ bench150 tags 235ms 过门/findings 零新
    增 + dbg 口径孤页门重推 **PASS**（891/841ms ≤2.0s——F-1 兑现）
    + 负向证七面全零 + T-03 二分四象限（pre 3/3 绿·全三 3/3 败·
    仅 T-03 败·仅 T-01+T-02 绿）。
  - `blockers`：T-03 vue 轨 e2e 确定性败形（D-39 立案——
    browser↔vite-proxy↔backend 树响应滞留竞态，单取时序移位触发；
    非数据面回归——vm 轨全绿+逐字节等价）。
  - `next`：**用户裁处 T-03**（§10.6 三选：①挂账降级②e2e 基建授权
    修③上游竞态修复后重推）→ 决后进 review（落点范围 AC 全数
    pass 面，T-03 按裁决结果并入或划出 AC-02/03 子断言）。

## 10. 待澄清事项

1. **试用反馈件首位续**：本批非反馈驱动（反馈缺席顺延——022 §10.4
   同款口径）。用户真实试用反馈首现时仍按仪表盘定文首位立项（本批
   执行窗若反馈到达：批次已立项线性推进，反馈件随下一批首位——
   不中断本批）。
2. **mtime 键控跨调用缓存挂账（不立项理由在册）**：`auto.fs.mtime`
   （2997）在册使「读缓存 + mtime 失效」成为潜在本仓通道（免重
   walk 的非监听半），但①缓存驻留字符串量 ~O(全工作区文本) 对
   D-35② P≤200 稳定域（VM 字符串池 419/510 族）压力未勘；②mtime
   粒度未知（秒级则同窗写读陈旧边缘）；③跨调用缓存违「纯读函数
   同输入同输出」零漂移纪律——需专项设计+探针，本批不做（SD-2301
   注记挂账，unlock = 专项立项）。
3. **派生族单趟化供料**：titles/bl/ol 融合仅省循环脚手架（内功总
   量不可减）——本批非目标；T-04 dbg 分量复测若占比显著（≥30%
   click→mode 弧）→ 下一批候选供料（实录入 §8 T-04）。
4. **split 臂/F-R17-1/D-35② 留观面板**（非本批范围）：T-04 判绿窗
   exe 时间戳实录随批续记（家族窗第六例跨两次 exe 重建延续口径）；
   unblock 维持 = 家族 exe 稳定后双臂复跑。
5. **bench ⑨口径降记录面**：022 冻结门文本系 bench 口径（含仪表
   sleep ~0.7s 非产品成本）；本批门重推按 F-1 指定换 dbg 口径
   （数值面 2.0s 不变——严格性不减，§5.4 论证）。复审可裁口径
   净化的接受度；若复审维持 bench 口径原门，则按 bench ⑨实录+
   A/B 归因裁处（预授权出口同 §5.4）。**执行窗实录**：dbg 口径
   门在落点树已过（891/841ms ≤2.0s——F-1 兑现；bench ⑨ 3699ms
   记录面照录）。
6. **【执行窗新立——待用户裁处】T-03 双取形消除去留**：单取实现
   本身 vm 轨全绿且逐字节等价，但确定性触发 vue 轨 e2e 败形
   （D-39——恢复弧 tree 响应 dev-stack 滞留竞态，trace 实证根因
   链见 §8 T-03 块）。**三选**：
   ①**挂账降级**（最小动作）：双取形维持在册（D-20⑤ workaround
   保留），D-39 供上游/基建侧消化，后批重推；
   ②**e2e 基建授权修**：矩阵 spec :821 步选择器收紧（树行域锚替
   换 getByText 全树 .first()——测试面精度修，触及入库 e2e 源
   =授权面）或 vite proxy 定序配置（触及 e2e 拓扑=授权面）；
   ③**上游竞态修复后重推**（browser/vite-proxy/backend 层根修
   ——供料候选立案，T-03 实现保留待重推）。
   三选均不阻断 T-01/T-02 落地（已按落点树提交）；门重推已过
   （dbg 口径），AC-03 不依赖 T-03。
