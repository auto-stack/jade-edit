# jade-edit 架构定版（SD-01，PLAN-081）

> 新应用首个 spec 面（本仓无既有 spec 历史）。锚定 2026-09-20 PLAN-081
> 初始版；后续所有功能的架构锚。决策证据链：
> [plans/attachments/081-t00-rulings.md](plans/attachments/081-t00-rulings.md)（T-00 三勘定）+
> auto-down `docs/plans/081-jade-edit-bootstrap.md`（计划本体）。

## 1. 定位

jade-edit = **知识库方向的 AutoDown（`.ad`）编辑器**，AutoUI 单工程双轨
首例：同一份 `src/front/*.at` 单源，vm 轨解释渲染（iced 原生窗）、vue 轨
生成 Vue3+Vite 工程。双轨一致性从初始版起同日落地（gate 双臂同断言域），
不积累组装级差异——旧 jade-garden 两工程分裂（front/auto vue +
front/desktop VM twin 副本）的教训不在此重演。溯源（全新应用非拷贝、
家族/冻结池关系）：[PROVENANCE.md](PROVENANCE.md)。

**产品定位裁定（SD-301，2026-09-22 Q1 收口）**——授权源 = 用户口述（auto-edit
战略 `docs/strategy/002-north-star-v2.md` §9-Q1 就此收口）：

- **长期并存，两套产品**：auto-edit 保持轻量级编辑器；jade-edit 向
  **知识库方向**发展（wikilink 关系面/反链/图谱/检索族——旧 jade-garden
  冻结功能池以 Auto 形态逐步移植，`[[..]]` 链接索引 + 反链/出链面板为
  首切片）。超越原 §9-Q1 两择框架（jade 非「web 轻量版」改向知识库）。
- **组件尽量共用**；未来实现组件插件化时，共用升级为**插件级共用**
  （展望项，落地属插件化后续批，本裁定只记账方向）。
- **家族栈维持**：stylekit dep / bps L1 零副本 / `@autodown/engine`
  官方组件——不做产品合并，不做仓库合并。
- auto-edit 侧的 Q1 落账由其 M2 首计划携带（§8 兄弟仓分工表 jade 行
  随之收口），本仓不代写；战略面若后续扩容（多裁定成簇）再议独立
  战略档，届时本节裁定块迁出。

**北标裁定（SD-405，2026-09-22 用户口述）**——授权源 = 用户会话口述
「我们短期的目标是对标Typora；长期目标是对标Obsidian；Notion；以及
飞书。」：

- **层级**：短期对标 **Typora**（编辑体验线）；长期对标 **Obsidian、
  Notion、飞书**（本地知识库 → 块级协作工作台线）。
- **与 SD-301 的关系 = 细化而非替代**：知识库方向（SD-301）在北标下
  具体化为 Obsidian 段（长期主目标）；auto-edit 并存两产品、组件共用、
  家族栈维持等裁定全部不变。
- **Typora 核心差距大头在上游**：所见即所得、大文档键入、秒开、行:列、
  右键等承载面 = 上游供料包（D-16 预热 / D-17 键入发射 / rope delta
  分块读 / D-12 事件面扩展，见 [upstream 供料包](upstream/2026-09-jade-supply.md)）；
  本仓落地件 = 编辑器周边（快速打开、大纲等），不替上游做核心。
- **Notion/飞书（块标识/协作后端）远期只记账不动手**；图谱 tab（vm 轨
  图/canvas 组件族依赖上游）主线顺位后移。
- **切片优先级裁决口径**：短期 Typora 线件与长期 Obsidian 线件双线各有
  交付、可合片共享机制（首例 = PLAN-004 查找面板——快开[Typora 线] +
  全文检索[Obsidian 线]）。

## 2. 单工程双轨机制（T-00 R-1 裁定 A'）

pac.at 单声明 `render: ["vm","vue"]` + **双命令分工**：

| 轨 | 命令 | 说明 |
| --- | --- | --- |
| vm | `auto run -r vm` | CLI `--render` 运行期覆盖；解释渲染 iced 窗；MCP 经 `AUTOUI_MCP_PORT` env 开放（自动化通道） |
| vue | `auto build -r vue` | build 期同款覆盖；生成 `gen/front/vue` Vue3+Vite 工程 |

- **围栏**：禁止裸 `auto build`——Multi 声明下选 vm 项走 C/ninja 转译
  路径（T-00 探针①实证）。vue 生成一律经 `pnpm build`
  （= `scripts/regen-vue.mjs`，内含 `-r vue`）。
- `gen/`（生成树）、`deps/`（bp 物化）、`build/`（C 产物）、
  `rust-workspace/` 均不入库——vue 面是纯生成物，jade-edit 无手写 vue
  文件，故无 demo/jade 的 deploy-into-src 步（零 committed 漂移面）。

## 3. 单源与消费面（013 形态定形，T-06 实证）

```
src/front/app.at          App 壳：filetree + 编辑区 + status 行（自有
                           ft_*/status 状态）+ on 纯薄委托
src/front/editor_store.at EditorStore：tabs/脏标/保存流 + active_* 显示
                           投影（状态权威；视图唯一读面 .store.*）
src/back/api.at           /api 契约（自有 Auto 源，与实现同 commit——
                          契约副本与漂移门已随换基退役，见 §5）
```

- **状态权威与显示投影全在 store**；App 视图经 `.store.*` 读（vue=响应式
  ref 投影 / vm=合并根状态），App handler 不回读 store 状态。
- 双轨硬约束（T-03/T-06 实测定律，写入前先查此表）：

| # | 约束 | 处置 |
| --- | --- | --- |
| C-1 | JsonAny 经 VM 变量/Obj 字面量存取均损坏（对象 id 泄漏 / `<vmref>`） | Save 内 read→传不落变量（editor_store `.Save` 注记） |
| C-2 | 合并根状态裸读（`.tabs` 等）仅 vm 成立；vue 发射裸标识符 | 视图一律 `.store.*`，handler 纯薄委托 |
| C-3 | store computed 在 vue 发射为未声明标识符 | 不写 store computed；handler 内联 find |
| C-4 | findIndex VM 静默失效；for-in 参数列表零迭代（P614） | `.find(t => …)` + while+索引 |
| C-5 | INPUT_TEXT / type_text = 整文替换语义（jade 080 同裁定） | 编辑矩阵以磁盘原文构造全文 |
| C-6 | msg 载荷单类型；裸 `var x = []` VM 静默坏列表 | 单 map 载荷；typed 声明 |

- **active_body 镜像语义（SD-201，PLAN-002 T-03 固化）**：`active_body`
  是每键整文回写的镜像——编辑器 `oninput`（vm INPUT_TEXT / vue
  `@update:modelValue` 同源）把**整份文档**经 `.Edit(text)` 回写 store，
  store 即文档事实源（保存/脏标/重载全走它）。这是 **vue 通道承重**
  结构：vue 编辑器 `:content` 单向播种 + 整文回传，无区间增量面；与
  auto-edit 的「编辑器权威 + 去镜像」形态结构性不同（jade 编辑器组件
  不持文档事实源）。**大文档上限受制于此**：每键 O(n) 整文回传 +
  read_wiki 整文读（实测 1MB 文档整文读链阻塞，bench `open_large_doc`
  blocked-upstream 记账）。**unlock = 上游 rope delta/分块读**（delta
  事件流 + back 分块读端点，见 [upstream 供料包](upstream/2026-09-jade-supply.md)
  §1/§2）——上游落地前禁对该路径调优，测试矩阵以磁盘原文构造全文
  （C-5）即其纪律面。

- vue 生成链补件已随上游清偿退役（2026-09-21，照 auto-edit d845e54
  先例；上游 PLAN-671 r1+Phase 2 + PLAN-646，工具链 ≥ v0.4.2-1652）：
  natives 声明层/条件抛错桩、store 自调别名内联、int 负初值、button
  text variant、menubar 族 schema 吸收（strict 零 S001，`--lenient`
  摘除）、多段插值、auto-sources 真值、vite-env 均生成器自备。残余三
  补件（regen-vue.mjs pattern 断言守，见 [parity-ledger.md](parity-ledger.md)
  D-13/D-15）：vm-natives 运行期垫片（e2e 热路径）、tree JSON.parse
  （str 标量契约）、tabs.remove→splice（R010 直通，上游未清偿）。

## 4. 编辑器消费（外部官方组件）

编辑器内核 = `@autodown/engine`（auto-down，AutoUI 标准组件化；出口契约
1.0 冻结）——**唯一特殊 = 不在 auto-lang 仓**，以外部官方组件注册：

- vm 轨：auto-lang `autodown_editor` 官方件位（PLAN-068 T-02）；
  `autodown_editor (key: .store.active_path, final: true) { content: …,
  oninput: .Edit }`——key 变即重挂载 = 播种通道；快照投影为 `textarea`
  （Q1 冻结形态）。
- vue 轨：npm_deps link → 生成 App.vue 的 `AutoDownEditor`
  （`:content` + `@update:modelValue`）；engine dist 新鲜度经
  `assert-dist-fresh` 卫兵（regen-vue 内 fail-fast）。
- **宿主能力边界（SD-3401，PLAN-034 R-03a）**：六类宿主接口
  （save/command/link/selection/cursor/reveal）的三载体能力矩阵、
  后续接线消费约束（保存来源身份/共门/命令历史归属/链接身份/位置
  语义）与逐仓供给缺口见
  [specs/editor-host-capabilities.md](specs/editor-host-capabilities.md)
  ——vue 引擎 `@save`/`@focusblock`/`open-wiki-link` 供给存在未接线，
  native 轨 save/link/命令消息通道缺供给，`show-actions` 为 attr 透传
  非 prop（细节以该规范 §1 为准）。
- **编辑命令入口收口（SD-3501，PLAN-035 R-03b1）**：六宿主编辑命令
  无执行桥现状下的界面契约——失效 toolbar/菜单执行入口移除、可见
  说明弹层、旧 action ID/msg 兼容守卫（零假执行）、宿主 Ctrl+Z/Y/A
  注册移除（正文/input 自主管辖）见
  [specs/editor-command-availability.md](specs/editor-command-availability.md)；
  能力结论（宿主命令桥缺供给）不因入口收口翻案，真执行仍按上游
  解锁门推进。
- **原生正文内链导航（SD-3701，PLAN-037 R-03b3）**：VM merged 载体同一 `on "open-wiki-link"` 消费全门——上游供给链 auto-lang PLAN-732/737/739（wikilink attr 语义消费→合成通道派发→输入补丁摘臂）后，生产左键完整点击直达 OpenWikiLink/resolver/NavCommit（结构性 per-instance origin，双实例反例在案）；native split 消费未联验单列。证据 `tests/probe_native_wiki_link.mjs` 五臂+规范 [wiki-link-navigation](wiki-link-navigation.md) 原生行/[editor-host-capabilities](editor-host-capabilities.md) §1.3。
- **正文内链导航（SD-3601，PLAN-036 R-03b2）**：Vue 正文
  `on "open-wiki-link"` 完整事件名消费（双参=target+可选目标锚点，
  缺参显式归一）→ `POST /api/resolve_wiki_link` 单目标只读解析（共享
  四级 resolver，目录现读零写面）→ `store.NavCommit` 同步门导航（源
  票据/活动选择世代/每等待期门/迟到拒绝零副作用、内存脏目标优先、
  最近文件仅真实成功后变化）+ 缺页确认来源失效门 + 独立导航提示
  （wiki_nav_note 不占 save_note）；锚点=开页后如实提示不支持定位
  （开页≠reveal）见
  [specs/wiki-link-navigation.md](specs/wiki-link-navigation.md)；
  原生轨正文点击、输入期 wikilink 解析、caret/reveal 仍为上游缺口
  （宿主能力边界 SD-3401 维持分列）。
- engine rust/VM 平台面 experimental（engine ARCHITECTURE §2）——深层
  行为差异入 [parity-ledger.md](parity-ledger.md)。

## 5. 后端（PLAN-001 换基定版：自有 Auto src/back——supersede R-3）

> PLAN-081 T-00 R-3（外部 axum exe 复用）为 bootstrap 期零后端工作量
> 捷径，2026-09-20/21 用户改道裁定后由本节取代（HTTP-always split =
> 旧 jade-garden 纯 Vue 时代遗产配方；历史见
> [plans/001-jade-edit-rebase-autoedit.md](plans/001-jade-edit-rebase-autoedit.md)
> §4 supersede 登记）。

- 后端 = **自有 `src/back`（Auto 写）**：`api.at` 契约（`#[api]` fn，
  013-todo 形态）+ `wsys.at` 实现本体（全部 FS IO 收口；front 零
  `fs.*`/`File.*` 内建——vue 轨 ts_adapter 将其拦为 `__vmOnly`）。
  契约与实现同文件同 commit ⇒ 结构性无漂移（PLAN-081 的契约副本 +
  漂移门随之退役）。
- **边界三形态**（auto-lang main.rs:1002-1025 实证）：
  - vm merged（默认）：`use back.api` = 进程内 CALL 直调，零 HTTP 零端口；
  - vm split：`auto run -r vm --no-merge`（AutoVM HTTP 同进程起服）；
  - vue：ts_adapter 生成 HTTP client + vite `/api` 代理（`AUTO_HTTP_PORT`），
    后端独立供给 = `auto run --server vm -B <port>`（`scripts/serve-back.mjs`）。
- **pac 纪律：不写 `api:` 字段**——服务引擎（AutoVM HTTP / a2r rust）
  留运行期 `--server` 切换；`api:"rust"` 会杀 merged 且当前 a2r 生成器
  缺口在册（auto-edit PLAN-003 F-R1，E0432）。旧 28 路由功能面
  （parser/linkgraph/agenda/multipart）仍属 jade-garden 冻结功能池，后续批
  以 Auto 形态移植。
- 工作区根解析：`JADE_WORKSPACE`（fixture 隔离通道）→ `AUTO_PROJECT_DIR`
  （auto-man 无条件注入工程目录——automan.rs:1435，故隔离需独立名）→
  `"."`；相对路径 back 侧 `resolve()` 拼根（VM 渲染期 CWD 会切 src/front）。
- wiki 域语义：`read_wiki` 只回 body（frontmatter 在 back 侧字符串层
  保留/拼回——PLAN-081 的 VM JsonAny 损坏类结构性消除）；`updated_at`
  补写 v0 不做（frontmatter 逐字保留）——**SD-1501 收口**：仅补已有键
  的自动维护随 PLAN-015 落地（保存流 write_body 值替换；无键零引入，
  见 §5 上游解锁兑现批③）。
- **链接域语义（SD-302，PLAN-003 首切片）**：`link_index(path, depth)`
  返回页面数组 JSON 字符串 `[{path,title,links:[{target,anchor,exists,
  target_path}]}]`（**顶层裸数组**——front `json.to_value` 顶层 map 产物
  入态 = 裸 vmref 损坏（C-1 亚型，T-04 实勘），顶层 array = Init
  ft_nodes 已证形态）。walk = `fs.tree` 同源遍历（覆盖 = 文件树：忽略
  .git/target/build/node_modules/gen/dist/点开头；确定性序 = dirs-first
  + 名称 casefold；depth 直通 1..8 钳制；`fs.walk_files` 原语在册未接
  .at 调用面——D-20）。wikilink 文法 v1 = `[[Target]]` /
  `[[Target#anchor]]`：split/split_once 标记法提取（AutoVM 无正则面）；
  忽略 = 无闭合 `]]` / 跨行候选 / trim 空候选 / `#` 后空 target；`#`
  首现拆分——前段 target 参与 stem 匹配、后段 anchor 透传（D-12：无
  定位事件面）；逐括号转义 `\[\[` = 字面量非链接（`[[` 子串不存在）。
  exists = target 严格等于**文件 stem** 首现命中（旧园 links.rs rebuild
  title=file_stem 同语义；frontmatter title 不参与——`[[首页]]` 对
  index.ad = 悬空）；同名 stem 冲突取首现（walk 序）。反链派生在
  front（App 模型持链接态 + handler 触点重算——store 上下文 to_value
  损坏 + ts_adapter identifier 实参 to_value 静默恒等，双缺口 D-20）；
  刷新触发集 v1 = Init / Save 成功 / 面板开启（v1；**v2 起 SD-501 扩**
  ——建页成功 + 树重取；**v3 起 SD-601 扩**——重命名成功）（无文件系统
  watch，后续批）；悬空 active（""）反链恒空（卫语句——否则悬空出链
  `target_path:""` 误配）。
- **检索与快速打开域语义（SD-401，PLAN-004 第二切片）**：`search_wiki
  (query, limit)` 返回命中数组 JSON 字符串 `[{path,title,snippet}]`
 （**顶层裸数组**——link_index 同裁定）。**POST 而非 GET**（D-19 依据：
  HTTP 对 GET query 的 UTF-8 百分号序列不解码，CJK 查询词 GET 全败；
  POST body CJK 已证——write_wiki 同款）。检索面 = **stem + body**
  （read_body frontmatter 剥离面；frontmatter 的 title/tags/summary 均
  不入检索——tags 检索后续批）；title = 文件 stem（链接域同语义）。
  **查找域现行口径（PLAN-033 修订——出处 [name-search](specs/name-search.md)
  §1.2）**：上句"stem + body、title 不入检索"为历史立面；现行命中域 =
  stem ∪ 显示标题（fm title）∪ aliases ∪ 相对路径 ∪ body（统一名称规则
  trim/to_lower/contains），响应形状/limit/walk 序/snippet 规则零变化；
  tags/summary 等非名称 frontmatter 字段仍不入域；快开同规（名称目录
  page_names 过滤，同名行以实际路径消歧）。**链接身份域零变化**——四级
  解析/改写仍按 SD-302/SD-1301 原文。
  匹配语义 v1：query trim 空守卫 → `[]`；大小写 = **两侧 to_lower**
  （探针 A 定谳：vue 发射在册——ts_adapter Plan 053 M1
  `to_lower→toLowerCase` + 构建期 gen 源检）；命中序 = walk 序
  （dirs-first + 名称 casefold，确定性）；limit 钳 1..50（front 传常量
  20 = 旧园 default_limit 同值）；walk depth = 4 内部常量（Init tree
  首屏同值——快开/检索/链接三面覆盖一致）。snippet = body 中首条命中行
  trim 后整行（CRLF 行尾 `\r` 剥离——行终止符非内容；**禁 `.length`
  截断**——D-20③ CJK heap 串字节语义）；title-only 命中 = `""`。
  页面收集 = `collect_ad_pages()` **links_json/search_json 共享单点**
 （覆盖 = 文件树不变式：忽略面/depth/walk 序一处维护）。装配 = json_esc
  + 逐项 `+` 重接（O(P²) v0 规模接受，上量换 StringBuilder native 160
  族）。**快速打开 = 纯 front 件**（零 back 增量）：数据源 = Init 已取
  `tree(root,4)` 的 ft_nodes，`collect_ad_paths` 栈式 while 展开（禁递归）
  + `file_rows_of` 双侧 to_lower contains 过滤（空 q = 全量清单——
  VS Code Ctrl+P 同形态）；**拾取即关**（files 模式行点击 = OpenLink +
  FindClose store 关口），text 模式行点击**面板保持开**（检索结果浏览
  语义）。检索触发 = 检索钮 + Enter（onenter 双轨在册——探针 C 定谳：
  vm convert_input onenter→on_submit / vue @keyup.enter）；检索按需
  fetch、快开过滤纯内存——**刷新触发集 = 无**（与链接面板 Init/Save/
  面板开启触发集的结构性差异）。
- **悬空建页语义（SD-501，PLAN-005 第三切片）**：wikilink 写闭环收口
  ——出链行悬空（exists=false）由非点击文本改渲染为可点击 button
  （`{target}（悬空）`，attr 单段插值——内容插值同族发射），点击 =
  建页入口 → **确认弹层**（alert-dialog 在册族第三实例：标题「创建缺失
  页面？」+ 描述 `[[{target}]] 尚不存在` + 路径预览 = `title_to_path`
  front 镜像纯函数经 widget computed——**仅显示用**，权威在 back，漂移
  =观感非正确性；弹层态居 store 两字段 create_confirm_open/create_target
  ——confirm 族分野先例）→ 创建/取消（取消零落盘；误触防线——旧园
  CreatePagePrompt「Create missing page?」先例移植）。back 契约
  `create_page(title)` **POST**（D-19 同 search_wiki：悬空目标多为 CJK，
  GET query 不解码；POST body CJK 已证）→ wsys.create_page_impl 单事务
  ：①清洗（下）②根落位 `{safe}.ad`（清洗名恒不含分隔符，resolve 恒
  落工作区根——无父目录创建面）③**幂等守卫**（已存在不写返回现路径
  ——write_body 对存在档会改写 body，绝不复用作建页通道；**守卫 back
  侧内移** = front exists 预检对 CJK 在 split/vue 臂失效[D-19] +「先
  exists 后 write」两跳竞态的结构性消除）④模板落盘 `# {title}\n\n`
  （title = wikilink 原文非清洗名——显示保真；无 frontmatter——D-14
  v0 逐字保留哲学，旧园 default_ad_content 的 frontmatter 面**不搬**）
  ⑤exists 复核；返回工作区根相对 path（"" = 空名守卫/复核失败；front
  失败路径 = 弹层留置 + console 注记）。**清洗规则 v1
  （title_to_path，back 权威）**：九字符 `\/:*?"<>|` → `-`（**while-
  contains 收敛惯用法**：每字符 `while t.contains(c) { t = t.replace
  (c, "-") }`——`.replace` 次数语义双轨未证[JS 串参=首现替换
  ts_adapter.rs:1219；VM 全量与否未证]，惯用法首现/全量两态皆收敛，
  免探针；D-23 纪律）+ trim + **空名守卫**（trim 空**或**九字符收敛后
  恰 `"-"`——`///` 形全非法字符名替换后只剩分隔符、无名可立，dash-收敛
  探针同惯用法族无 length/slice 零 CJK 字节语义暴露）→ 守卫命中返回
  ""。**刷新触发集 v2**（SD-302 v1 扩）：v1 + **建页成功**
  （`.CreateGo` 内 `.LinksRefreshOf(r)`——悬空行 exists 翻转，显式
  新档 path 避 handler 内 .store 陈旧投影）+ **树重取**（`.TreeRefresh`
  共享口：Init / 建页成功 / Save 后三触点——**Save 新档顺收**[G3]：
  untitled 落盘后树陈旧至重开的先在面收口；Save 后恒重取，失败保存的
  重取为无害幂等）；快开数据源 ft_nodes 随树重取自动新鲜（
  collect_ad_paths 零额外接线）。五触点 fetch 块收口 = msg handler
  共享口（`.LinksRefreshOf(active)` / `.TreeRefresh`）——json.to_value
  只能 handler 体内直调（D-20⑤）+ 状态赋值需 handler 上下文 ⇒ 「局部
  fn」以 msg 面落地（handler 互调在册先例 .FindPick→.OpenLink）。
- **重命名与反链改写语义（SD-601，PLAN-006 第四切片）**：知识完整性
  核心件——改名即断链的结构性消除。旧园 rename 只补内存索引
  （files.rs:177 + index.rs:221 四表补丁）不改源文，jade 链接面纯派生
  （link_index 每次全量 walk）无索引可补丁 → **源文改写是唯一一致口
  径**（Obsidian「更新链接」同形态；本仓首创设计，无旧园先例）。
  back 契约 `rename_page(old_path, new_name)` **POST**（D-19 同款：
  old_path/new_name 均 body 传参，old_path 工作区相对 CJK 常态）→
  wsys.rename_page_impl **单事务五步**：①校验（old 在盘；new_name 清洗
  非空——title_to_path_stem 复用 SD-501 清洗规则去 ".ad" 拼装段，dash-
  收敛守卫钉定态）②同目录路径合成（dir_of split 法——根档落根）③
  冲突/case-only 卫语句（exists(new) 拒 + **casefold 相等同拒**——G3
  裁决见下）④改名（**read_text+write_text+delete 组合**——探针 A 定谳
  [D-24①]：`File.copy` 别名双表在册但 `copy` 为 Auto 硬关键字，解析层
  不可调，boot 即 fatal；字节整迁等价直证；⚠ `File.delete` 恒返 0 吞错
  [D-24②] → exists 双复核内建；**组合非原子**——崩溃窗双档残留 v0
  记账，`File.rename` 别名供料候选）⑤反链源文改写（collect_ad_pages
  walk 全页面——含被改名档新路径[自链改写]；read_body → rewrite_links
  → **有变更才 write_body 回写**——frontmatter 保留；改写副作用圈定 =
  非链接档字节不动）。**改写规则 v1**：`[[Old]]`/`[[Old#anchor]]` 精确
  stem 匹配（与 extract_links_json 同一忽略面：无闭合/跨行/trim 空候选
  不涉；转义 `\[\[` 字面量不涉——`[[` 子串不存在）；anchor 段与前导
  空白逐字节透传（`[[ Old ]]` 空白保真、`[[Old#Old]]` 锚内同名不误伤
  ——候选 split_once(old) 首现拆分重组 + `"]]"+rest` 段尾回接）；返回
  新 rel（"" = 任一卫语句拒；拒因前端不可见——v1 口径 §10，front 失败
  路径 = console 注记 + 弹层留置）。**casefold 裁决（PLAN-005 §10.6
  收口，G3）**：stem 匹配维持**精确比较**（casefold 不采用）；case-only
  重命名拒（Windows 实盘同档 + 精确匹配下 copy 组合对自身复制未定义）
  ——匹配语义升级为 casefold 属另立计划（stem 解析/改写/建页三面联动）。
  **front 面**：action `file.rename`（**F2**——VS Code/Typora 惯例，
  `enabled_if: active_path 非空 && 非 active_dirty` 权威面）+ menubar
  文件项「重命名…」（**不挂 enabled**——D-24③ vm boot 冻结缺口，禁用
  语义由 `.RenameOpen` handler 守卫兜底）→ **dialog 第三弹层**（dialog
  控件族首用例——内嵌 input 预填现 stem[path_stem split 法] + 影响面
  预览行[rename_impact_text 纯函数经 widget computed：link_pages 扫
  target == 现 stem 精确计数→「将改写 N 页 M 处链接」/「无入链」——仅
  显示，权威在 back] + 双钮[普通 button——D-24⑤ dialog-cancel/action
  轨间不对称禁用]；闭态恒渲染 D-23③ dialog 族同判）→ 改名流四步：
  rename_page 直调 → `TabsRenamed(old, new)`（while 扫描 tabs[D-11]
  path==old 档全量更新 path/title/key——**激活/后台同名档全量**；key 变
  即重挂载播种）→ `Reload`（**自链改写 Reload 显现**——store body 是改
  名前镜像，重读磁盘即改写后文；handler 内 TabsRenamed→Reload 顺序 +
  渲染滞后于 handler 完成 → 重挂载播种即新文）→ LinksRefreshOf(新
  path 显式传参) + TreeRefresh + ft_sel 同步。**刷新触发集 v3**（SD-302
  v2 扩）：v2 + **重命名成功**（.RenameGo 内链接重取 + 树重取——反链/
  出链面板立即反映新 stem、EXPLORER 旧行消失新行在）。⚠ 已开后台 tab
  的 store body 不随改写刷新（v0 口径——改写后从磁盘重开即新文；背景
  tab 脏保存回退改写的窗口 §10 留观）。
- **文件管理域语义（SD-701，PLAN-007 第五切片）**：工作区运维收口——
  EXPLORER 从只读树升级为可管理面（新建 + 删除 + tab 关闭面）。
  **两域语义对照并表（本域定调）**：重命名（SD-601）= **入链源文改写**
  保知识完整性；删除（本域）= **入链悬空化，不改写源文**——出链行
  `exists=false` 翻转如实可见，悬空行可经 create_page（SD-501）再建页
  接回（PLAN-005 弧线反向闭合）；「删除即清理引用」**非**本域语义
  （清理属悬空链接清单 / wanted pages 后续批）。
  **back 半**：`delete_page(path)` **POST**（D-19 同款：path CJK 常态
  body 传参）→ wsys.delete_page_impl **三步**：①卫（`.ad` 后缀**先于**
  exists——目录名/裸名/其他扩展一律拒，**既有路径同样拒**防目录误删；
  exists 缺失拒）②`File.delete`（返回值忽略——D-24② 恒返 0 吞错）
  ③**删后 exists 双复核**（成功唯一可信判据 = 存在性翻转；仍存在→
  ""）。返回工作区根相对 path；"" = 非 .ad/缺失/删除未生效。九案双臂
  直证（`tests/probe_delete.mjs`：删存在/重建再删幂等闭环/缺失拒/
  非 .ad 两形拒[目录 + 既有非 .ad 文件]/CJK 删/create_page 重建根档
  接回 + 再删；**悬空化不改写源文逐字节负证** = index/Hello World/
  Projects/jade-garden-index.json 全原样）。
  **front 半·新建**：EXPLORER 头部「＋」钮（tab 条 plus 同构 icon 钮）
  → `.ActNewFile`（new_q 置空 + store.NewOpen）→ **dialog 第四弹层**
  （内嵌 input[页面名] + footer 普通钮双钮——D-24④/⑤ dialog 纪律；
  **声明位居 rename 弹层前**——vm 快照恒渲染 input 序「后声明者居末」
  锚纪律，check 12 rename input 居末不漂移）→ `.NewGo`：create_page
  直调（**零新 back 面**——SD-501 幂等守卫/清洗/模板/根落位全套直承）
  → 非空 = 关弹层 + store.Open + LinksRefreshOf(r)（「建页成功」口
  直承，行重算内联 active=r）+ TreeRefresh + ft_sel 置位；空 = console
  注记 + 弹层留置。**Ctrl+N untitled 草稿流不动**（untitled 不落盘 vs
  EXPLORER「＋」根落盘新档——语境区隔两口径并存注记）。
  **front 半·删除**：action `file.delete`（**Delete** 键位——执行期定
  谳：字面 boot 吸收零 fallback，F2 同构预期兑现；`enabled_if: ft_sel
  非空` 权威面）+ menubar 项「删除…」（重命名…与分隔线之间；不挂
  enabled——D-24③）→ `.ActDelete` 守卫（ft_sel 空 = console no-op
  [G2 未选中零弹层]；非空 = store.DeleteOpen）→ **dialog 第五弹层**
  （零 input：标题 + 目标[ft_sel] + **影响面预览两行**——
  dangling_impact[link_pages 扫 target == stem 精确计数→「N 处入链将
  变为悬空」/「无入链」] + tabs_impact_text[「M 个标签页将关闭，未
  保存修改将丢弃」/「无打开标签页」]，App 侧纯函数经 widget computed
  ——仅显示，权威在 back；「删除」钮全树唯一文本锚）→ `.DeleteGo`：
  delete_page 直调 → 非空 = 关弹层 + store.**CloseTabsOf**（while 扫描
  [D-11] 命中即 RemoveAt(i) **不增 i**——remove 后左移同位重查；激活
  邻档补位/空态两案在册口免费收口；splice 补件②守 vue 面）+
  LinksRefreshOf（.store.active_path 投影）+ TreeRefresh + ft_sel 清空
  （删除后无选中——no-op 口径复位）；空 = console 注记 + 弹层留置。
  **TabsCountOf 落形注记**：store msg 无返值面——tab 警示预览为 App
  侧派生 computed（`.store.tabs` App 上下文消费，双轨实测通）。
  **刷新触发集 v4**（SD-302 v3 扩）：v3 + **删除成功**（.DeleteGo 内
  链接重取——入链/出链行 exists 翻转 + 树重取 EXPLORER 行消失；新建
  直承「建页成功」口）。
- **标签与悬空清单域语义（SD-801，PLAN-008 第六切片）**：Obsidian 组织
  面（tags）+ 知识卫生闭环件（wanted pages——SD-701 悬空化语义的清道
  夫），双件同批（PLAN-004 双件先例同构）。
  **back 半·tags_index（唯一 back 增量）**：`tags_index(path, depth)`
  **GET**（tree/link_index 同族：path/depth 工作区级 ASCII 常态——tag
  值在响应 body，UTF-8 JSON 无 D-19 面）→ wsys.tags_json 返回聚合数组
  JSON 字符串 `[{tag, paths:[相对路径]}]`（**顶层裸数组**——link_index
  同裁定；tag 序 = walk 序 **first-seen** 确定性，link_index 哲学同判；
  paths = walk 序）。**frontmatter 消费面只读首开（本域边界定文）**：
  frontmatter 在 back 侧自此有两个消费面（read_body 剥离保留 +
  frontmatter_of/page_tags 只读解析），**写面维持零**（D-14 逐字保留
  哲学不动——补写/改写属功能池后续批；tag 编辑若立项 = r2 + D-14 裁决
  联动）。解析面纯字符串层（C-1 纪律；tags 聚合源 = frontmatter `tags:`
  block-list + body 行内 #tag 并集[SD-901]）：①frontmatter_of = read_body
  互补件（首行界符 is_delim 双形态 + 闭合界符行定位；无 frontmatter/
  无闭合 = 贡献零）；②page_tags：键定位 = **顶层级**（原行不以空格/\t
  起——嵌套键头不误收）且 trim 后以 `tags:` 起；后段非空 = inline 数组
  形态 → 贡献零不炸（语料无此形态，v1 记账）；后段空 = block-list 收集
  态——后续行 trim 后以 `-` 起者收集（**缩进两形态** `- x` 与 `  - x`
  trim 归一——语料实勘两种并在；行尾 `\r` trim 剥——CRLF 容错同族），
  非列表行（次键/空行）即止（首个 tags: 键整体收工）；同页重复去重。
  聚合两遍（D-20② 纪律）：pass1 全页 tag first-seen；pass2 每 tag 收
  paths；装配 = json_esc + 逐项 `+` 重接；O(T×P) 重读 v0 规模可接受
  （search_json O(P²) 同判）。**读原文 File.read_text 非 read_body**
  （后者已剥 frontmatter）。六案双臂直证 = `tests/probe_tags.mjs`
  （全集首锁/无 frontmatter 零/无 tags 键零/缩进两形态/同页去重/depth
  传递 + CRLF 形态 + 双臂逐字节一致；语料已知答案 = 7 tag——执行期
  校正：Hello World.ad 实有 demo，计划原记 6 漏勘）。
  **front 半·tags 面板**：store `tags_open`/`TagsToggle`（backlinks
  同构第三实例）+ TagsPanel 壳（013 组件纪律——行集/空态留根）+
  `.TagsRefresh` 共享口（**fetch 单取形**：call-arg 形直入 json.to_value
  ——D-20⑤ 免双取，比 links 面简一档；行 label 派生期拼接
  `{tag} · {n}`——双段插值 avoidance）+ `.TagToggle` 单选手风琴
  （tag 行 → 展开页行 → OpenLink 导航；空态「（无标签）」）。
  **刷新触发集不扩（v4 同口多一 fetch）**：Init / Save 成功 / 面板开启
  / 建页成功（.CreateGo/.NewGo）/ 重命名成功 / 删除成功 七触点全接
  `.TagsRefresh()`。入口 = action `view.tags`（**Ctrl+T**——Ctrl+D 为
  切换 Tab 在册，T 空闲）+ menubar 视图「切换标签」（checked 态；不挂
  状态 enabled——D-24③）。
  **front 半·wanted 模式（零 back 增量）**：find 面板第三模式
  `find_mode == "wanted"`（**无 input 行/无触发钮**——纯清单）：行集 =
  `wanted_rows_of(link_pages)` 纯函数（exists=false 出链按 target 聚合
  计数，两遍规避列表元素定址替换未证形态；label 派生期拼接
  `{target}（{n}）`；行序 first-seen），重算挂 `.LinksRefreshOf` 同触点
  （link_pages 变化即消缺）+ 入口 `.ActFindWanted` 即重取。行点击 =
  `.CreateClick(r.target)` **直连 PLAN-005 建页弹层**（预填/确认/创建
  流全复用——「发现→建页→消缺」闭环：CreateGo → LinksRefreshOf →
  wanted 行自动消失 + 出链 exists 翻转）；空态「（无悬空链接）」（消缺
  后达成）。入口 = action `view.find-wanted`（**Ctrl+Shift+D**——
  Ctrl+D/Shift+F 邻族修饰区分；checked_if 复合式 find-text 同构）+
  menubar 视图「悬空清单」。wanted 行 v1 只显计数（源页可经反链面板/
  检索到达——行内展开源清单留后续批）。
- **未链接提及 + 行内 #tag 域语义（SD-901，PLAN-009 第七切片）**：Obsidian
  组织面两件补全（反链面板第三段 + 标签聚合源扩——双件纯消费/解析扩，
  零新 back 契约）。
  **front 半·未链接提及（零 back 增量）**：反链面板「反链/出链」两段后
  增「未链接提及」第三段——派生 = `search_wiki(stem, 20)`（PLAN-004 契约
  原样，POST 面无 D-19）结果三则过滤（①path≠active 自身 ②path∉bl_rows
  已链源 ③snippet≠""——title-only 排除，SD-401 口径复用），行 = {path,
  snippet} 两行留根（button + text）；fetch 守卫链 backlinks_open→非
  active 空（面板关零 POST——D-21 面纪律）；触点族 = Init/面板开启/
  OpenFile/OpenLink/ActNew/Save 成功/Rename 成功（与 bl/ol 行重算同触点
  族）；数据态 = App 模型 `mention_rows`（唯一新模型字段，store 零新增，
  D-20④ 同款裁定）。
  **back 半·tags 聚合源扩（解析扩）**：`page_inline_tags(body)`
  split("#") 逐段标记法，忽略四则（①段首字符 ∈ {空格/换行/#/回车}——
  标题面 ②前段尾字符 "{"——块锚 `{#id}` 面 ③token 纯数字——#123 面
  ④**前导空白语义**——prev 非空且尾字符 ∉ {空格/换行/制表/回车} 则忽略：
  `X#y` 连续文本非 tag，语料实勘 `\[\[Tasks#block-project-a\]\]` 转义
  链接锚立案；token = 段首至首个空白/} 前缀，split 首段链取禁
  .length[D-20③]）；与 frontmatter tags 并集去重（fm 序在前 first-seen
  零漂移）；body 走 read_body（frontmatter 已剥）；tags_index 契约形状/
  触发集零变化（PLAN-008 定文不变，仅聚合源 +1）。code fence 内 #tag
  v1 原文扫（语料无此形态，fence 感知随 markdown 深解析批）。
  **每日笔记 blocker 记账**：Time.now = Unix epoch 秒字符串（auto-lang
  stdlib.rs shim_time_now 实勘，无日历格式化原语）——本地日期命名上游
  阻塞，Time 日期格式化原语 = 新供料候选（ledger v12 记账），解锁前
  不做。
- **别名解析与提及转链接（SD-1001，PLAN-010 第八切片）**：链接域二期——中文别名刚需 + 提及闭环写面。
  ① **别名解析（读面）**：frontmatter `aliases:` block-list 只读解析（`page_fm_list`；inline 形态记账不做）；解析序为 stem 精确首现优先 → alias 精确首现（walk 序 × alias 序）→ `""`（`resolve_target` 单点收口）；消费面：exists、target_path、反链（`backlink_rows_of`）、出链（`outlink_rows_of`）、wanted 悬空清单均自动对齐别名解析；**不入面**：全文检索（stem+body 恒定）、未链接提及（stem 搜索恒定）、重命名源文改写（按 stem 精确改写，alias 链接自动跟随，禁补改写）。
  ② **提及转链接（写面）**：back 契约 `linkify_page(path, stem)` **POST**（D-19 同款：path/stem 经 POST body 传递）；明区改写：只在 `[[...]]` 标记之外的普通文本区查找并改写 `stem` 为 `[[stem]]`；frontmatter 逐字节保留；返回改写计数（"0" 为未变更）；front 接线：提及行增加「转为链接」小钮，触发 `.LinkifyGo(path)`；自派生刷新（D-26② 纪律：LinksRefreshOf + MentionsRefreshOf；LinksRefreshOf 串联刷新消除 vue 轨并发 fetch 竞态）。
  ③ **F-R9-4 收口注记**：DeleteGo 成功分支串联 `MentionsRefreshOf(.store.active_path)`，消除删除当前文档后提及段陈旧投影。
- **页面属性写面（SD-1101，PLAN-011 第九切片）**：**D-14 受控裁决落地**——frontmatter 受控写首开（008 tags 读面/010 alias 读面的写面兑现闭环件）。
  ① **受控三原则**：仅 tags/aliases 两键改写；其余键**逐字节直通**（含缩进/注释/空行/未知键/folded 块——split/join 同分隔符恒等语义）；空值（trim 后全空白）= 删键（键行+block-list 项行整删）。时间戳类键（updated_at/created_at）Time 门控排除（§1 非目标——解锁后「时间戳补写批」另立）。
  ② **双契约**（PLAN-013 三键扩见 SD-1301——本段为 011 立面史形）：`page_meta(path)` GET（裸数组 `[{key,value}]`——D-20④ 顶层数组唯一健康形状；缺席键项不装配；value = 逗号连接串[现 title 位首单行值 SD-1301]；GET 通道 path CJK 面 = D-19 同款降级口径）+ `set_page_meta(path, tags, aliases)` **POST**（现签名 path,title,tags,aliases——011 两值参立面；D-19：CJK 路径/值常态 body 传参；返回 "ok"="" 卫/失败二态）。
  ③ **写引擎五步**（`set_page_meta_impl` + `fm_set_block` 标记法——is_delim/body_after_open/write_body 界符族第四件）：①exists 卫 + **幂等防线**（两键全空且档本无两键 → no-op "ok" 零写盘）；②段取（首行界符+闭合界符定位）；③`fm_set_block` ×2（tags 先 aliases 后）：删旧键行块（键行+`- ` 项行——两缩进形态，首个非列表行即止同 page_fm_list 收集语义）+ 原位插新块（键行+`- x` 无缩进归一）；未命中 → 尾追（闭合界符前）；④无 frontmatter 档增建界符段（body 前）；**CRLF 继承** = 原 text 含 `\r\n` → 新段行元素尾带 `\r`（split("\n") 空间恒等重接，界符行/非目标行原样直通）；⑤落盘+exists 复核。**幂等**：同值再写逐字节不变（归一形态同形）。
  ④ **front 面**：store `meta_open`（弹层族第四开态）+ App `meta_q_tags`/`meta_q_aliases`（数据态不入 store——D-20④ 同款裁定）；action `file.meta`（title「页面属性…」icon "sliders-horizontal"、shortcut **Ctrl+I**，不挂 enabled——D-24③ handler 守卫 untitled no-op）+ menubar 文件项（重命名与删除之间）；dialog 第六实例（双 input，placeholder 唯一锚；**声明位于 rename 弹层前**——input 序「弹层后声明者居末」锚纪律）；**预填回显 = 首个 fetch 型预填**（page_meta GET 单取形——vue 轨异步返回覆写竞态面在册，测试 fill 前置预填落定等待）；保存流 `.MetaGo`：set_page_meta → "ok" = 关弹层 + **自派生刷新族**（D-26② 纪律：LinksRefreshOf[alias 解析面/wanted 派生随产物 + 内链 MentionsRefreshOf 链式尾] + TagsRefresh[tags 面板即时]；tree 不刷——无文件名变化）；非 "ok" = console 注记 + 弹层留置（006 v1 口径同判）。取消零落盘。
- **目录面 + 检索 alias 匹配（SD-1201，PLAN-012 第十切片）**：工作区
  组织二期（EXPLORER 可组织面）+ alias 数据流检索消费缺口收口，双件同批。
  **移动语义三联对照并表（本域核心定调）**：重命名（SD-601）= stem 变
  ⇒ 改写入链源文；**移动（本域）= stem 不变 ⇒ 零改写零断链**——链接面
  纯 stem 解析对目录结构完全无感（入链 `[[Target]]` 经 walk 自动指向
  新位，面板行文本零变化），用户可自由重组目录而不伤链接网（组织
  自由度保证）；删除（SD-701）= 档消 ⇒ 入链悬空化。canonical 并表防
  「移动需清理引用/改写链接」的隐性期待——**移动中的链接改写结构性
  不需要**。
  **back 半·目录面双契约**：`create_dir(name)` / `move_page(path,
  dir)` 均 **POST**（D-19 同款：目录名/路径 CJK 常态 body 传参）。
  `create_dir_impl`：清洗（title_to_path_stem 复用——九字符→`-`——
  弹层输入结构性不含 `/`，嵌套名 v1 不出现）→ **幂等卫**（已存在
  目录 → 返回现路径零变化）→ `File.create_dir`（返值忽略——D-24②
  原语吞错族；**探针 A 定谳 2026-09-24**：可调——实勘 = create_dir_all
  **递归语义** + 已存在幂等不炸；清洗层在前，递归面零暴露，v1 单层
  口径不变）→ 双复核 `File.is_dir` 翻转（**探针 B 定谳**：可调——
  目录判真/文件判假准；同名文件边案：create_dir 静默失败 → is_dir
  不翻转 → ""）。`move_page_impl` **五步**（read+write+delete 组合
  迁移定文复用 SD-601——File.copy 解析层不可调 [D-24①] 故字节整迁；
  ⚠ File.delete 恒返 0 吞错 [D-24②] → exists 双复核内建）：①卫（源
  exists + 目标 `File.is_dir(resolve(dir_norm(dir)))`——dir_norm split
  去空段归一：`wiki`/`wiki/`/`wiki//sub`/`""`（= 根，移动入根合法）
  双形态接受）②同路径幂等（归一后新 rel == 原 path → 返回原 path
  零变化）③冲突卫（目标处同名档 exists → ""）④`write_text(new,
  read_text(old))` → `File.delete(old)` → 双复核（新在 && 旧无）⑤
  返回新 rel（"" = 任一卫拒/迁移未生效；拒因前端不可见，front 失败
  路径 = console 注记 + 弹层留置）。
  **back 半·检索 alias 扩**：`search_json` title 命中面 = **stem ∪
  frontmatter aliases**（`page_aliases` 010 在册件接入——links_json
  同款模式）；alias-title-only 命中 → snippet = `""`（snippet 只从
  body 取——SD-401 口径天然续）；命中行 title 恒 = stem（口径不变）；
  命中序/walk 序零变化（stem 优先序 = walk 序不变）。**检索面是
  alias 数据流最后消费缺口**（010 解析/011 写面交付后，面板/出链认
  alias 而检索不认 = 可感知不一致的收口）。  **front 半**：store `dir_open`/`move_open` 双开态（弹层面分野同
  meta_open——基线 v11 面）+ App `dir_q`/`move_q`（数据态不入
  store——D-20④ 同款裁定）。EXPLORER 头部「⊕」第二钮（icon
  folder-plus——「＋」同构相邻；**序纪律：「＋」居「⊕」前**——
  EXPLORER 行首 button 结构锚在册 [vm_matrix pressExplorerPlus]，
  序翻锚误中）→ `.ActDirNew`（dir_q 置空——零 fetch 预填形态）→
  **dialog 第七实例**（单 input「目录名」；声明位 rename 弹层前——
  vm 快照 input 序「后声明者居末」锚纪律）→ `.DirGo`：create_dir
  直调 → 非空 = 关弹层 + TreeRefresh（G1——树新目录行可展开空态；
  **链接/标签面不刷**——目录不进链接面，触发集纪律见下）；空 =
  console 注记 + 弹层留置。移动入口 = action `file.move`（title
  「移动到目录…」、shortcut **Ctrl+Shift+M**——M 空闲实核 [Ctrl+M/
  Ctrl+Shift+M 均未用]；不挂 enabled——D-24③ handler 守卫兜底：
  ft_sel 空拒 + 非 .ad 拒 [目录行进移动流会误当文件迁移]）+ menubar
  文件项（重命名与页面属性之间）→ `.ActMove` 预填 = 源档现目录
  （`dir_of_path` split 法**本地派生**——**零 fetch 预填**，D-28②
  fetch 型预填竞态窗规避在册形态：双弹层预填全走本地派生，零暴露
  面）→ **dialog 第八实例**（单 input「目标目录」+ placeholder =
  ft_nodes 派生目录清单首项——`dirs_of`/`dirs_first` 栈式 while
  纯函数 [collect_ad_paths 同族第三实例]，本地派生零 fetch 同判；
  placeholder 动态绑定 vue 轨首证）→ `.MoveGo`：move_page 直调 →
  非空 = 关弹层 + `TabsRenamed(old, r)`（006 在册口——tab path/
  title/key 全量；title = strip_ad **全路径**口径——stem 段恒等、
  目录段新）+ `Reload`（body 不变——重挂载播种链一致性，幂等无害）
  + **刷新族 v5**：LinksRefreshOf(r)（bl/ol 行重算 + wanted/mentions
  随产物——移动零扰动的面板面复核锚）+ TagsRefresh（路径面）+
  MentionsRefreshOf(r) + TreeRefresh（档行入新目录）+ ft_sel = r；
  空 = console 注记 + 弹层留置（006 v1 口径同判）。
  **刷新触发集 v5**（SD-302 v4 扩）：v4 + **移动成功**（新建目录
  **不**进链接/标签触发集——目录不进链接面，树单独刷）。十一案
  直证 = `tests/probe_dir_move.mjs`（目录面八案：新建/清洗/同名
  幂等/移动基础[字节整迁 + frontmatter 完整逐字节]/同路径幂等/
  缺失目录拒/冲突拒/CJK 目录名+档名 POST 双臂 + 检索 alias 三案：
  alias 命中[title=stem + snippet=""]/语料基线逐字节回归[walk 序 +
  snippet 行口径零漂移]/alias+body 双命中[snippet 非空]——双臂返回
  值逐案对读 + 磁盘逐字节复核 + 副作用圈定）。
  **测试面固化**：vm file 组四子步（⊕新建目录/移动弧线[预填 wiki
  断言 + tab 全量 + **面板快照前后逐字节一致** + **links_json 定向
  diff 归一相等**（序无关集合语义——移动后 walk 位次迁移 [DirBox <
  wiki] 属预期面）]/取消零落盘/冲突拒弹层留置）+ find 组 alias 子步
  ——组数不变 16/15，子步不占检查位；e2e 同弧线（CJK 目录名
  收件箱——create_dir/move_page POST 双臂面；placeholder 动态绑定
  首证 [值 ∈ {wiki, 收件箱} 两可——序随 fs.tree casefold 实位]；
  弹层钮定位纪律修订 = 标题锚 content 子树扫——「创建」双弹层同名，
  末位序锚随第七实例声明破）。
- **显示名（SD-1301，PLAN-013 第十一切片——frontmatter title 消费
  首开 + 属性弹层 title 编辑）**：中文工作流件套收口件（010/011
  aliases 解决「怎么链接它」，本片 title 解决「怎么显示它」——
  英文/拼音 stem 保链接与文件系统稳健 + 中文显示名保可读性）。
  **两域边界定文（本域核心规范）**：**解析域**（SD-302）title 键
  **不进任何匹配面**——链接解析 = stem ∪ aliases 精确匹配恒定
  （`[[首页]]` 对 index.ad 仍悬空零变化）、检索 title 面 = stem ∪
  aliases 口径不变、改名/移动改写面零接入；**查找域修订注记（PLAN-033
  ——出处 [name-search](specs/name-search.md) §2）**：上句"检索 title
  面"的排除口径已由查找域修订代替（title/dtitle/别名/相对路径可检索），
  **解析域本体零变化**——链接解析/提及转换/改写面仍不接入 title；
  **显示域**（本域）title
  = 显示名——**有 title 显示 title、无 title 显示 stem**（G1 口径
  ——back 装配面即定值，front fallback 参数仅 stale 防御）。两域
  并表防混淆：title 编辑零链接扰动（解析域无感），改名/移动不改
  title（显示域跟随 stem 语义面：改名 = stem 变、title 键不迁移
  → **显示名恒等** [stale title 语义面——vm 12⑤ 断言固化]；移动
  = path 变、titles 表随刷新重键；新建档无 title → 显示 = stem）。
  **back 半·三件**：①`page_fm_value(fm, key)`（page_fm 家族第三件
  ——单行值退化形）：顶层级键行定位（trim + 缩进排除同
  page_fm_list）→ 冒号后段 trim → **引号壳剥离**（首尾 `"` 对——
  starts_with/ends_with ASCII 检查，两端切点恒 ASCII 字节界，CJK
  内文 slice 安全）；空值/无键 → ""。②links_json 页对象**增量字段
  `dtitle`**（`{"path","title","dtitle","links"}`——纯增量，既有
  消费者零感知回归：backlink/outlink/wanted/mentions 派生面不读）；
  **title 字段链接域语义不动**（stem 恒）；dtitle = page_fm_value
  (fm,"title")，空 → **缺省 stem 装配定值**（front dtitle_of
  fallback 双保险）。③**page_meta/set_page_meta 三键扩**（D-14 受控
  面 011 两键 → 三键——**本仓 pre-1.0 契约签名扩参首例**：三值参
  title 值参首位 path,title,tags,aliases；011 唯一消费者 front 同批
  改，probe 旧案全量回归承载契约扩不破旧）：`page_meta_json` 三项
  装配序 **title,tags,aliases**（title 位首——front 弹层 input 序
  同源；缺席键项不装配 title 空值同判）；`set_page_meta_impl` 幂等
  防线三值扩 + **`fm_set_line`**（`fm_set_block` 单行姊妹件——011
  块引擎原样不动，title 走独立分支：顶层级键行整行替换/删——无项
  行块单行键契约形态；未命中且值非空 → 尾追；先行执行保新键追时
  键序 title,tags,aliases 位首归一）+ `fm_line_block`（增建段单行
  件——`key: value` 冒号后带空格语料同形）；011 七则不变式全量继承
  （其余键逐字节/CRLF 继承/键序/幂等——title 案增量并入直证）。
  **front 半·显示面四面**（**显示期纯函数覆盖**——store tabs.title
  恒路径面零改动，基线 dump 零状态面）：App `titles` 表（path→dtitle
  映射行——`titles_rows_of(link_pages)` 于 LinksRefreshOf 派生段
  顺产，**触发集 v5 零扩**）+ `dtitle_of(rows, path, fallback)`
  行扫解析；四面接线 = tab 条（双分支 text 覆盖，fallback t.title
  恒路径面）/ EXPLORER 树行（fallback r.label）/ 快开行（fallback
  path 身份可读）/ 检索行（fallback r.title 恒 stem）——⚠
  **back dtitle 缺省=stem 短路 fallback**：无 title 档四面显示
  **stem**（执行期校正 2026-09-24：计划 §10.3「快开显示完整 path」
  注记与 G1/§2.2 矛盾，按 G1 stem 口径落定）；链接面板行（反链/
  出链/提及/wanted）**保持 path/target 文本**（身份可读域 v1——
  显示名化后续 UX 批）。⚠ **D-30 gen 阴影面**：vue codegen 对模型
  名统一发射 `.value`——纯函数参数与模型名同名（dtitle_of 首参
  titles）→ 参数被误发射 `.value` → undefined 炸（树空实勘首例）
  ——纪律：**纯函数参数避开模型名**（首参 rows）。
  **front 半·属性弹层第三 input**（011 第六实例扩容）：「标题」
  位（标签/别名之上——title 语义位首，视图序与 page_meta 装配序
  同源）；ActMeta **三值预填**（D-28② fetch 型预填竞态窗同乘 011
  接受口径——测试侧预填落定等待）；`.MetaGo` 三参 fetch；保存流
  刷新族不变（LinksRefreshOf——**titles 表顺产即四面即时刷新**；
  **title 编辑零链接扰动**——bl/ol 行语义不动两域边界）。
  **测试面固化**：vm meta 组 title 弧线四断言（预填 title 位首/
  改写磁盘 title 行受控 diff 仅 title 行 + 树行显示即时刷新/清空
  删键回 stem 显示/双臂目标页异位 merged=CAP 定理/split=Tasks）+
  probe_page_meta title 面五案（改写[diff 仅 title 行]/删键+删后
  幂等[防线三值扩]/尾追/三键同写增建 title 位首/引号壳剥离读回）+
  probe_alias_linkify ⑪ dtitle 案组（语料 index.ad 双字段并存
  title=index & dtitle=首页/**⑪e 两域边界并证**——dtitle=首页 在册
  而 `[[首页]]` 解析仍悬空）。
- **目录面二期 + 面板行显示名化（SD-1401，PLAN-014 第十二切片——目录
  生命周期收口 + 显示一致性最后面）**：012 目录创建/移动后的最后缺口
  （能建不能删 = 管理残缺）+ 013 四面显示名后面板行的不一致面（tab 显
  示 首页、反链行显 index.ad——割裂可感），双件同批（012/013 直接补全）。
  **三联对照目录级并表（本域核心定调，SD-1201 续）**：重命名**目录**
  = 同层改名，**stem 不变 ⇒ 链接零改写零断链**（移动零改写同判目录级
  ——入链 `[[Target]]` 经 walk 自动指向新位，面板行/链接网零变化）；
  删除**目录** = 目录消 ⇒ 其下全档入链悬空化（SD-701 语义目录级复现
  ——不改写源文，悬空行可再建页接回）。canonical 并表防「删除/改名目
  录需清理引用」的隐性期待。
  **back 半·双契约**：`delete_dir(path)` / `rename_dir(path, new_name)`
  均 **POST**（D-19 同款：目录路径/新名 CJK 常态 body 传参）。
  `delete_dir_impl` **三步**：①卫（dir_norm 归一非空——**根拒**
  [resolve("") 即工作区根绝不可删] + `File.is_dir` 非目录拒——文件/
  缺失同判，探针 B 定谳件）②`File.remove_dir_all`（**probe C 定谳
  2026-09-24**：可调——别名双表在册[native_catalog 1014/1015]，
  create_dir/is_dir 同族已证探针 A/B；返值忽略——D-24② 原语吞错族）
  ③双复核 `!File.exists` 翻转 → 返回归一 path；失败 ""。
  `rename_dir_impl` **五步**：①卫（is_dir + 清洗 title_to_path_stem
  复用 + 同层同名拒[新路径 exists——同名目录/文件同判] + **casefold
  同判拒**[case-only 自身拒——006 G3 口径目录级；Windows 不敏感 FS
  exists 已真，显式卫语义自载] + **纯 .ad 卫**[树 walk 段扫描——任一
  file 子件非 .ad 尾拒，混合目录 v1 不支持 §10 记账]）②子件清单收集
  （.ad files + 嵌套 subdirs 双收集——⚠ 树走**工作区根**
  `fs.tree(resolve(""), 8)` + 前缀过滤[id 起于 `path + "/"`]，根相对
  id 语义在册件[collect_ad_pages/front ft_nodes 同源]，子树 id 相对性
  免证；**树段标记法目录段判定**：每节点起一段，file 自身 kind 恒落
  本段[叶无后裔]，**非空目录段只含头 + `"children":[` 开括号**[自身
  kind 落末孙段——collect_ad_pages 注记同源实勘]，空目录自身 kind 落
  本段——判定 = contains "kind":"dir" ∨ ends_with `,"children":[`]）
  ③新目录建（`File.create_dir`——create_dir_all 递归语义 + 幂等，探
  针 A 定谳）+ 嵌套镜像目录逐个建 + **逐文件迁移循环**（余段 =
  rel.split_once(path + "/")[1]——首现即前缀位[rel 恒以前缀起，重复
  段名免疫]；read_text → write_text → File.delete——006/012 定文形态
  + 双复核[新在 && 旧无——delete 恒返 0 吞错 D-24②]）④旧目录清理
  （嵌套旧子目录**逆序** `File.remove_dir`[dirs-first walk 序父先子后
  ⇒ 逆序即子先于父——空目录原语非递归口径] + 顶层 remove_dir + 复核
  旧无新有）⑤返回新工作区根相对目录路径（"" = 任一卫拒/迁移未生效；
  **部分迁移容忍注记**：循环中段失败留双份——v0 记账，006 copy+delete
  非原子窗口家族同判，File.rename 别名供料解锁后可整体原子化）。
  **front 半·目标 input 口径（v1 定案）**：目录行点击 = 展开在册语义
  （ft_sel 不扩、树行零结构改动——D-29③ 结构锚敏感），目录目标经
  **弹层目标 input** 指定（placeholder = ft_nodes 派生目录清单首项
  `dirs_first`——同 012 移动弹层形态，零 fetch 预填 D-28② 规避在册
  形态）。store `deldir_open`/`rendir_open`（弹层面分野同族——基线
  v13 面）+ App `deldir_q`/`rendir_target`/`rendir_q`（数据态不入
  store——D-20④ 同款裁定；**三字段实取**——删除单 input + 重命名双
  input[目标居首新名居次]）。入口 = action `file.deldir`（「删除目
  录…」**Shift+Delete**——与档 Delete 分键）+ `file.rendir`（「重命
  名目录…」**Ctrl+Shift+R**——与档 F2 分口）+ menubar 文件项两枚
  （「删除…」与分隔符之间）；不挂 enabled（D-24③——目标 input 口径
  无状态依赖可挂，handler 空目标守卫兜底）。**删除流**：delete_dir
  直调 → 非空 = 关弹层 + tab 全关循环（`paths_under` 纯函数 ft_nodes
  本地派生 .ad 子集 → 逐 `store.CloseTabsOf`——007 在册口零新 store
  面）+ **刷新族 v6**（LinksRefreshOf[入链悬空翻转——wanted/bl 面随
  产物] + MentionsRefreshOf + TagsRefresh + TreeRefresh[树行消]）+
  ft_sel 属目录清空；空/拒 = console 注记 + 弹层留置（006 v1 口径
  同判）。**重命名流**：rename_dir 直调 → 非空 = 关弹层 + tab 全量
  循环（余段 rel_under → 逐 `store.TabsRenamed`——006 在册口，stem
  不变标题恒等）+ `Reload`（body 不变——MoveGo 同判）+ 刷新族 v6 +
  ft_sel/active 属目录显式 remap（handler 内 .store 陈旧投影规避
  ——T-03 实勘同款）。**强确认双防线**（删除弹层，SD-1401 定文）：
  计数行「将删除目录 X 及 N 个文件（M 个 .ad 页）」+ 悬空警示行
  「N 处入链将变为悬空」——`dir_del_files_text`/`dir_del_dangling_text`
  纯函数（**ft_nodes 本地派生零 fetch**——D-28② 规避在册形态；悬空
  计数 = link_pages 出链扫 target_path 路径前缀精确圈定，stem 同名异
  位不误计）；重命名弹层影响面预览「将移动 N 个 .ad 页（链接零改
  写）」（`dir_ren_preview_text`——三联对照语义面）；危险钮序 = 删除
  居末（D-29③ 弹层钮标题锚纪律——「删除目录」/「重命名目录」标题
  全树唯一）。⚠ **D-30① 参数纪律首批次全面应用**：全部新纯函数
  （paths_under/dir_known/dir_del_files_text/dir_del_dangling_text/
  dir_ren_preview_text/rel_under/dir_trim）参数名避开模型字段名
  （nodes/dir/rows/path——源注记 + grep 证）。
  **front 半·面板行显示名化（013 §10.1 留口兑现）**：**反链行** =
  `dtitle_of(.titles, r.source_path, r.source_path)`、**提及行 path
  首行** = `dtitle_of(.titles, r.path, r.path)`——显示域覆盖（身份域
  onclick 恒 path 零扰动）；**无 title 档显示 stem**（back dtitle 缺
  省=stem 装配定值——回落 path 仅 stale 面，013 G1 口径同判**执行期
  校正**：计划 §6「无 title 源档回落 path」按 G1 stem 口径落定，挂
  本条注记）；**出链行/wanted 行恒链接文本不动**（target = 用户所写
  链接文本——显示即语义 SD-1301 解析域口径续，SD-1401 定文）。
  **测试面固化**：vm link 组 10/10b 反链三源显示名断言（首页/CAP 定
  理/Tasks——面板区锚族）+ 10m/alias/F-R9-4 行 stem 形态 + 出链/wanted
  恒文本非退化并证（12⑤ 'Project X' 非 'Projects' + 14⑤ wanted
  label）+ file 组**目录二期三子步**（⑭ 重命名目录弧线[双 input 弹
  层/预览「将移动 1 个 .ad 页（链接零改写）」/tab 全量路径变标题恒
  [stale title 语义面]/磁盘整迁/面板快照零变化/links_json 归一 diff
  ——三联对照目录级]/⑮ 取消零落盘两形/⑯ 删除目录弧线[强确认预览
  计数+悬空警示 → tab 全关计数-1 + 树行消[explorer 区锚] + 悬空翻转
  Project X（悬空）+ links_json exists:false——SD-701 目录级]）+
  e2e 13 dir2 三子步（CJK 目录甲→乙 POST body 双臂面）+ probe
  **probe_dir_ops 双臂直证**（probe C 定谳 + delete_dir 六案[根拒/
  非目录拒/递归/空目录/CJK/缺失再删] + rename_dir 六案[基础/纯 .ad
  卫/同层同名两形/casefold/CJK/缺失] + **嵌套案**[DirNest/sub/Deep.ad
  余段迁移 + 旧嵌套清理——merged 探针域 ws_join 造档通道，create_dir
  清洗层结构性不含分隔符] + **链接零扰动归一 diff**[moved 集合 path/
  target_path 归一后逐字节相等——三联对照目录级固化]）。
- **上游解锁兑现批（SD-1501，PLAN-015 第十三切片——HTTP 回执 + 每日笔记
  + updated_at 维护 + 行:列定谳，三原语同窗解锁的集中收割）**：
  ① **PLAN-699 回执判定（2026-09-25 实录，`tests/probe_receipt_d19.mjs`
  四案双臂）——D-19 负结果如实判**：上游 auto-lang e48d4e366 以
  Axum/Hyper 传输替换手写 HTTP 解析器后，serve-back CJK GET query
  **仍不解码多字节序列**——新传输已含 percent-decode 管道（`url_decode`
  进 `match_route` 查询参数面 + `+`→空格归一），但 `url_decode` 实现
  为 **byte-as-char**（`%E5%AE%9A` 三字节逐字节 push 为 `å®š` 三字符
  ——不组 UTF-8），`exists`/`read_wiki` encoded CJK 全败原样（g①/g②
  负结果实录）；ASCII 简单转义/缺失拒原绿（g③/g④）。**缺口精化**：
  D-19 从「GET query UTF-8 不解码」精化为「**percent-decode 在册但不
  组 UTF-8 序列**」（byte-as-char Latin-1 形映射）——unlock 供料候选
  升级为单点修复面（`url_decode` 换 UTF-8 序列组装）。**矩阵 CJK 导航
  子步双臂化维持现状**（「仅 merged 臂」口径不变——回执窗不扩臂）；
  **D-21**：新传输（owned ApiRequest 有界 mpsc + Graceful Shutdown）下
  PLAN-015 执行窗负载实录 = **HTTP 丢参/进程死亡零复现**（e2e 十五段
  全绿 2 轮 + gate 全绿 + probe 全族双臂——败点仅 menubar popover 内容
  窗 1 例[v11③ UI 渲染节拍家族，非 HTTP 面] + vue-build 负载窗 gen-only
  exit 1 一例[0xC0000409 家族，独占重跑绿]）——处置维持留观（结构根修
  与否 = auto-lang 侧事），v18 扩记。
  ② **每日笔记 `daily_note()` POST 契约**（**Time 解锁兑现**——上游
  `Date.now` epoch ms + `Date.format(epoch, pattern)` 宿主桥
  [本地时区，token 最小集 yyyy/MM/dd/HH/H/mm/m/ss/s/SSS 未知 run 原样，
  musk forge_helpers.at 消费先例]——**back 侧独占消费**，front 零
  Date 面[ts_adapter Date.* 发射未证，设计性规避；front 解锁随 vue 面
  probe 批]）：stem = `yyyy_MM_dd`（全 ASCII 无 D-19 面）→ **create_page
  幂等口同构三步**（已存在 → 返回现路径零变化——**旧日档/今日重入均
  不动**，write_body 复用会触发 updated_at 维护面故建档通道不复用[模板
  直写同 create_page 纪律]）→ 模板落盘 = frontmatter
  `created_at`/`updated_at` **双时间戳同值首写**（yyyy-MM-ddTHH:mm:ss）
  + body `# yyyy-MM-dd\n\n` → exists 复核。front 面 = action
  `file.daily`（**Ctrl+Alt+N**——N 族避让 Ctrl+N，Alt 族仅 Alt+F4 在册）
  + menubar 文件项「今日笔记」+ 工具栏 calendar 钮（同 handler
  `.ActDaily` 共口）→ **零弹层直接动作**（日期权威在 back 单点，无
  input 面）→ `.ActDaily` = daily_note 直调（try/catch console）→ 非空
  = store.Open + LinksRefreshOf(r) + TagsRefresh + TreeRefresh + ft_sel
  （**NewGo「建页成功」口直承同构**——触发集 v6 零扩）；空 = console
  注记（Date 桥不可达/落盘复核失败）。
  ③ **updated_at 自动维护键（D-14 受控面续——保存流收口）**：
  `write_body` 界符段重接循环内**顶层级 `updated_at:` 键行** → 值段替换
  `Date.format(Date.now(), "yyyy-MM-ddTHH:mm:ss")`（语料同形——Projects.ad
  `2026-08-27T00:40:36` 无 Z 形；Z 形语料[Tasks/index]保存即归一无 Z）。
  **仅补已有键**（`fm_touch_updated_at_line` = fm_set_line「删键」反向
  分支——顶层级卫[嵌套键头不误收] + 首现即止[单行键同款语义] + 行尾
  `\r` 继承[CRLF 保真] + stamp 空[Date 桥不可达]零改写直通）；**无键
  零引入**（增量维护不引入——逐字保留哲学不破）；新建档（无
  frontmatter 直写 body）零涉；六检查磁盘断言盘点 = 受影响档为全部带
  updated_at 键的语料档[fixture 五档全带]，矩阵 check 5 = 更新面正证位
  （当日形 + title/status/summary 逐字节），其余磁盘断言均 presence 形
  不受扰（`tests/probe_daily.mjs` u①..u④ 直证：Z 归一/零引入/CRLF \r
  继承/顶层级卫四形态双臂全绿）。**系统自动维护键**——不可经属性弹层
  编辑（page_meta 三键不动）。
  ④ **行:列消费定谳（D-12 处置维持——探针 E 负结果）**：上游 PLAN-413
  Phase 2（90fe40409）的 `oncursor` 事件面落在 **`code_editor`** 组件
  （convert_code_editor——:10703/:10766 实勘），本仓消费的
  **`autodown_editor` 无 oncursor 转换臂**（convert_autodown_editor_native
  事件面 = oninput/on_focus + scroll binding——View::AutodownEditor 无
  on_cursor 字段；vue 轨 engine `EngineEditor.vue` emits = update/
  update:modelValue/save/focusblock/open-wiki-link，无 cursor 载荷）——
  **双轨组件面均缺**，行:列接线不落地，**D-12「行:列降级」处置维持**
  （docs 计数+脏标替代）；**大纲跳转续门控**（anchor-reveal prop 未
  暴露——立项实勘不变）；**供料候选扩面**：编辑器 oncursor 面暴露
  （View::AutodownEditor 增 on_cursor 字段 + core 光标变更回调——与
  anchor-reveal prop 同族双件）。
- **回收站（SD-1601，PLAN-016 第十四切片——.trash 安全网 + probe 端口
  自动避让，主件+卫生件）**：014 交付 `delete_dir` 递归硬删 + 007 档硬
  删后，**破坏性操作无安全网**（无 undo/无 git 保障的用户工作区，误删
  即永久丢失）为最大产品风险——本批引入 Obsidian 同款 `.trash/` 工作
  区回收站，删除语义四面表并表收口：**悬空化（SD-701）/改名改写
  （SD-601）/移动零改写（SD-1201）不变，删除 = 移出工作区 + `.trash`
  副本保留**。
  ① **双改道（契约签名/返回语义零变化——行为面扩）**：
  `delete_page_impl`/`delete_dir_impl` 的硬删段替换为**移入
  `.trash/{原相对路径}`**——保结构镜像迁移（组合迁移 read+write+
  delete[006/012 定文形态] + 双复核[D-24② 存在性翻转唯一可信判据]；
  目标目录 `File.create_dir` 递归幂等[D-29①]免费达成）；同名冲突 →
  `{stem}--{n}.ad` 序号后缀（while exists n+1）；`delete_dir` 沿袭
  纯 .ad 卫 + 根树段扫描前缀过滤（rename_dir_impl 同款段分类）→ 逐
  文件移入（保结构）→ 嵌套逆序 `remove_dir` + 顶层（空目录面——内容
  已尽迁）；**`.trash` 路径自涉卫**（delete 面 `.trash/` 前缀拒——防
  病态 trash 套 trash）。
  ② **语义零破坏论证（一手源实勘）**：`fs_tree_skipped` 点前缀逐名
  跳过（auto-lang native.rs:9944——`.git/target/...` + `starts_with('.')`
  ）⇒ 链接/标签/检索/树/快开五面视 `.trash` 不存在——SD-701 悬空化
  与硬删**逐字节等价**（vm merged 16/16 基线零漂移 + probe_delete/
  probe_dir_ops 全案绿为行为等价证）。
  ③ **三契约**：`trash_list`（**GET 无参**——零 D-19 暴露面；裸数组
  [{path}]，path = 工作区相对 `.trash/` 前缀形；缺失目录 → `[]` 幂等
  空态；**fs.tree 子树 id = 相对查询根**[native.rs:9970 strip_prefix
  (root)——rename_dir_impl「子树 id 相对性未证免依赖」注记本批定谳，
  装配期补前缀]）+ `trash_restore`（**POST**——前缀越界卫 + `..` 段
  拒[`.trash/../` 逃逸面封死] + .ad 卫 + 存在卫 + 目标冲突拒 +
  `--{n}` 尾剥去后缀名[trash_stem_strip split 标记法——档名本体含
  `--1` 形态误剥为观测项 §10] + 父目录 create_dir_all + 反向组合迁
  移 + 双复核）+ `trash_purge`（**POST 无参**——remove_dir_all + 双
  复核；**幂等**：缺失 → "ok"）。
  ④ **front 面（find 第四模式）**：action `file.trash`（**Ctrl+Shift
  +T**——T 族：Ctrl+T=标签面板在册）+ menubar 文件项（「删除…」后）
  → `FindOpen("trash")`（find_mode 第四值）+ `trash_rows` 单取形
  fetch；行 = trash 内路径文本（**非点击面**——点行开档属非目标）+
  行尾「恢复」钮；「清空回收站」钮 → **强确认 alert-dialog**（M 本
  地派生 `trash_purge_desc` computed）；恢复成功 = 行消（refetch）+
  LinksRefreshOf/TagsRefresh/TreeRefresh 三刷（**悬空自愈**——删除→
  悬空→恢复→翻转回，PLAN-005 建页弧线的删除-恢复对偶闭环）；
  purge 零刷新（工作区本无）；删除弹层两处文案改「移入回收站」（
  007/014——014 双防线预览沿袭不动）。
  ⑤ **probe 端口自动避让（环境复发痛系统修）**：`tests/pick_port.mjs`
  共享助手（候选段 8221..8260 try-bind 首个可绑端口，env 强制通道
  JADE_PROBE_PORT 保留复现口径）——probe 族 11 件固定 SPLIT_PORT 常
  量清零（F-R8-1[8251-8950]/F-R13-1[4094-4193]/8228 临时源端口三笔
  适配史收口——**此后 WinNAT 漂移零适配成本**，观测项转归档）。
  ⑥ **直证**：`tests/probe_trash.mjs` 十八案+十五布尔翻转对双臂全绿
  （①改道[保结构+嵌套 merged 探针域]/②冲突后缀 --1 并存/③restore
  [原位+后缀剥名+冲突拒+越界卫三形]/④purge 幂等/⑤CJK 全弧[GET 无参
  body 面+POST body 免疫]+悬空自愈翻转回[l1/l2 links_json]+字节整迁
  round-trip）。
- **链接解析三期收口：casefold 四级序 + case-only 改名解锁 + linkify
  词边界（SD-1701，PLAN-017 第十五切片——精确[003]→别名[010]→
  casefold[本批] 解析主线完成）**：英文/混合工作流链接失败主因
  （`[[hello world]]` 悬空——大小写变体不解析）清除；**零新契约、零新
  UI 形态、零新状态面**（纯 back 语义扩容——零重锁第二例，基线 v15
  不动）。
  ① **解析四级序**（`resolve_target` 单点扩容——消费面
  links_json→extract_links_json 单点全量生效：exists/反链/出链/
  wanted/提及自动一致）：`①stem 精确首现 → ②alias 精确首现 →
  ③stem casefold 首现 → ④alias casefold 首现`——级间严格有序
  （exact 全集扫完才进 casefold 级——**精确优先于 walk 序**：大小写
  变体档并存时确定性裁决），级内 walk first-hit（010 同名 alias 首
  现口径随行）；casefold = 两侧 to_lower（D-22① 双轨在册）——
  **CJK 恒等 → 三四级对中文 stem/alias 天然 no-op**（中文知识库行为
  逐字节不变）；未命中 = ""。语料无大小写变体链接 → 基线零漂移
  （probe_casefold pristine 5 页 10 链接全已知答案逐链接断言）。
  Unicode 全角/宽字符等价（NFKC）明确不做（§非目标——仅 to_lower
  ASCII 语义）。
  ② **case-only 改名解锁（006 G3 裁决翻转——「精确匹配下无意义」→
  四级序下改 casing 即改精确档命中，从拒变有意义操作）**：
  `rename_page_impl` 卫语句改道——casefold 相等**非全等**（case-only
  形态）不再拒，走**两步临时名迁移**绕行 Windows 同档 casing 翻转：
  `old → {stem}--cftmp-{n}.ad`（唯一序号 while exists；`--cftmp-`
  可辨识标记——迁移段失败残留档据此辨识，观测项[发生率预期零]）
  `→ new`（move_file 组合[read+write+delete+双复核] ×2——006/012
  定文形态提取单点，正常径共用）；**全等拒**（new_rel == old_path
  原名 no-op——原 casefold_eq 拒面收窄）；非 case-only 冲突卫零
  变化（case-only 免——同档物理同件，Windows exists 大小写不敏感
  恒真）。**改写器四级匹配面**（`rewrite_links`）：`target.to_lower
  () == old.to_lower()` 统一判（精确态为子集——006 精确改写行为零
  变化；split_once(target) 首现拆分对精确/变体两态等价）——
  `[[old]]` 变体随改名改写为 `[[new]]`（防悬空 + 规范化新精确档）。
  ③ **linkify 词边界**（`linkify_page_impl` 双径）：**纯 ASCII stem =
  出现处双侧词边界**（相邻字符 ∈ 62 集 `A-Za-z0-9` 则跳过该出现处
  ——`CAP` 不再误中 `CAPTURE`；`_`/`-` 归边界豁免字符不阻断——r1
  裁定[保守防误伤反侧：`my-CAP-x` 包裹]；62 集外 ASCII[空格/标点]
  与全部非 ASCII 恒不阻断）；**非纯 ASCII[CJK 等] stem = 恒子串旧径**
  （无词边界概念——定文防误期待，`A首页B` 邻 ASCII 字母仍包裹）。
  实现 = split(stem) 段接缝判定 + `char_at` 码点原语（**T-04 执行期
  定谳：str `.length` = 字符数而 char_at 索引 = 字节——两原语语义
  不一致[冒烟实录 "X 与 x".length=5 / char_at(4)=0 / char_at(6)=
  120]，D-20③「.length 字节语义」按现工具链实测不成立，ledger
  D-34① 记账**）→ 左界 = `last_char_cp` 前向码点步进扫描（零
  .length 依赖——首版 char_at(length-1) 在 CJK 混串落多字节中段恒
  0 不阻断，matrix ⑧ 三态体首跑实录 xHello World 误包裹即此败形）、
  右界 = char_at(0) 恒字符起点（字节安全——与计划 §2.2 ends_with
  62 枚举同效通道，规避 length/slice 定长陷阱）；明区判定不变
  （[[..]] 候选段内不替换——链接内豁免与词边界正交共存）。
  ④ **Windows 同档边界定谳并账（005 §10.6/006 §10.4/012 §10.6 三处
  挂账收口）**：create_page 幂等卫 = File.exists（Windows 大小写
  不敏感——`create_page("Index")` 幂等返回，**天然正确**；大小写
  敏感 FS 非支持面定文）/ 检索面已 casefold（SD-401——零变化注记）
  / mentions 随 search 继承零变化 / trash 内条目恢复 exact path 语义
  （非目标——零变化）。
  ⑤ **直证**：`tests/probe_casefold.mjs`（解析四级序七案——①
  `[[hello world]]`/`[[HELLO WORLD]]` → Hello World.ad[语料现成
  答案]+精确档对照 ②精确优先[§10.1 落定 = root×wiki/ 跨目录变体
  通道——Windows 同目录不可造变体双档，跨目录 stems 全局收集天然
  可并存；casefold 竞争档 walk 序更早让位] ③②>③ 级间序 ④③>④
  级间序 ⑤④级可用[qux/hat 混合形] ⑥CJK 零影响 ⑦pristine 基线
  零漂移+双臂深等）+ probe_rename ⑧ 行为翻转（casing 翻转/字节
  整迁/变体三态全改写/无 cftmp 残留）+ ⑧b 全等拒 + probe_alias_
  linkify ⑪..⑮（CAPTURE 词内不误伤/xCAP·CAPx 双侧跳过/_- 豁免/
  CJK 恒子串[A首页B 定义级强化]/链接内豁免共存）。
- fixture workspace 每次全新隔离拷贝（源 = auto-down `tmp/wiki-demo`，
  `JADE_FIXTURE` 可覆）——测试会打字保存，源零污染。Auto back 无 config
  文件 ⇒ 旧「exe 旁陈年 config 压 env」事故类别结构性消失（belt 保留为
  ws_root 实际根断言）。
- **目录移动 + 上量微批（SD-1801，PLAN-018 第十六切片——工作区三部曲
  收官 + PLAN-003/004 上量挂账兑现，主件+副件）**：档（建[007]/移[012]/
  删[007]/改名[006]）与目录（建[012]/删[014]/改名[014]）全操作面补齐
  最后一格——**移动目录**；组织自由度完备（北标 SD-405 长期线）。
  ① **`move_dir(path, new_parent)` POST 契约**（三联对照目录级第三案
  ——SD-1201 档移动/SD-1401 目录重命名并表续：**stem 不变 ⇒ 链接零
  改写零断链**，链接面纯 stem 解析对目录结构完全无感）。单事务五步
  （rename_dir 骨架直承）：**五卫** = dir_norm(path) 非空（根拒）+
  **.trash 域卫双面**（path/new_parent 任一为 `.trash` 本体或
  `.trash/` 前缀拒——回收站条目唯一合法通道 = trash_restore；
  delete_dir/delete_page 同族域卫，执行期加护）+ is_dir×2（目标父根
  `""` 合法——移入根为合法弧线）+ **循环卫**（new_parent == path 或
  以 `path + "/"` 起拒——移入自身/后代结构性非法）+ **同父幂等**
  （new_parent == dir_of(path) → 返回归一 path 零变化）+ **合并拒**
  （`new_parent/{dirname}` exists 拒——同名目录/同名文件同判；**目录
  合并不做 v1**[目标同名即拒]——文件并入 + 逐档冲突裁决 r2 留口）+
  **纯 .ad 卫**（根树段扫描——任一 file 子件非 .ad 尾拒，先于一切
  落盘）；子件清单（前缀过滤 + 段分类）→ 新目录 + 嵌套镜像建 →
  逐文件迁移循环（新 rel = new_rel + 余段[split_once 首现即前缀位]；
  move_file 组合单点[006/012/017 定文形态]）→ 旧目录清理（嵌套逆序
  remove_dir + 顶层）+ 复核；**dirname 段原样——移动不改名**（清洗
  属 rename_dir 面）；部分迁移容忍注记同 rename_dir（006 非原子窗口
  家族）。front 弹层双 input 口径（第十二实例——源居首/目标父居次
  [014 双 input 序纪律]；双空 + placeholder 本地派生引导[dirs_first，
  D-28② 零 fetch]；**无快捷键**——低频 + Ctrl+Shift+M 已属档移动；
  MoveDirGo 流 = RenDirGo 同构：迁移前 ft_nodes 派生 paths_under →
  TabsRenamed 循环[stem 不变标题恒等] + active/ft_sel 属目录 remap +
  Reload + 刷新族四口）。
  ② **StringBuilder 装配定文**（PLAN-003 §10.7 + PLAN-004 §10.7
  O(P²) 阈值挂账兑现）：**探针 F 定谳 natives 160-167 族 .at 面可调**
  （`var sb StringBuilder = StringBuilder.new(n)` / `sb.append(s)` /
  `sb.len()` / `sb.build()`——上游 test/vm/13_collections 014-019 同款
  语法；平帧返回安全——上游 C2「递归帧返回 builder 产物损坏」面不涉
  [装配全平循环]；vue ts_adapter 发射不涉——装配全在 wsys back 侧）
  → 三索引 + 双 JSON 装配段切换（extract_links_json/links_json/
  search_json/tags_json[双 builder]/trash_list_json/page_meta_json——
  T-01 盘点扩：extract_links_json 为 links 装配链内件）O(P²)→O(n)；
  **逐字节对照纪律** = 标准语料前后采 9/9 逐字节相等 + probe 全族
  回归承载（零语义变化——纯性能优化）。**规模上限实勘（ledger D-35
  新立）**：500 档合成语料 link_index 在旧 `+` 装配 P≈512 即 VM 值
  损坏（split 返 HTTP 200 空串/0 形态——阈值口径从「性能债」实勘
  升级为「正确性缺口」）；builder 切换后 500 档仍坏（「bulkalias201」
  陈旧槽内容形——非确定性）且 merged 臂 N=200 正确/N=300 handler
  静默中止（240s 预算排除慢）——**上游字符串池域**（rc.rs Plan
  419/510 UAF/幻影 freelist 家族 + D-21 家族重建窗），非本批装配面；
  稳定域口径 = **P ≤ 200**（「P ≤ 数百」收窄）。
  ③ **depth 8 统一**（深目录覆盖收窄收口——fs.tree 钳制上限内）：
  五面调用点 4→8——front `tree(root,8)`/`link_index("",8)`[双取形
  两处]/`tags_index("",8)` + wsys `search_json` walk/`rename_page_
  impl` 改写 walk；语料 flat 零漂移（tree/link/tags 断言全绿——
  快开/链接/标签/检索五面覆盖一致）；probe p⑨ 直证（5 层深档
  depth 8 含/depth 4 不含 + search 内部 8 walk 命中 + vm deep 案
  快开命中）。
- **目录合并 + trash 增强（SD-1901，PLAN-019 第十七切片——工作区
  收尾批，r2 双留口兑现）**：018 §10.2「目录合并不做 v1」留口 +
  016 §10.2「trash 预览/批量恢复」留口同批清账；**工作区组织操作
  全对称收官**（建/移/删/改名/合——北标 SD-405 长期线）。
  ① **`move_dir(path, new_parent, merge)` POST 契约扩参**（SD-1801
  五卫→六卫；013 set_page_meta 签名扩参先例二——唯一消费者 front
  同批改；merge bool POST body 原生 JSON 直通[back_proxy 按名绑定
  一手源实勘]）。**目标冲突卫分支**：merge=false → 现拒径零变化
  （018 七案全绿回归承载）；merge=true → **并入径**——目标同名
  **文件**占位仍拒（并入面是目录）、同名**目录** → 逐档迁移并入 +
  **冲突档 `{stem}--{n}.ad` 后缀 while exists**（trash_target 同族
  规则——**零数据丢失默认**，冲突保双份用户清理）；**循环卫先于
  合并分支**（merge=true 不绕移入自身/后代拒）；`.trash` 域卫双面
  定文（path/new_parent 前缀拒——018 执行期加护，本批 probe mb⑥⑦
  直证 **F-R18-1 闭账**）。**冲突后缀档 = 新档**（stem 变——链接
  零改写语义下入链不悬空但如实换指：[[stem]] 经四级解析指向靶侧
  保留档；语义注记 = 合并非改写域，SD-1201 三联对照并表续）；
  **无冲突 merge=true = 纯移动语义**（probe mb⑨ link_index 归一
  diff 零扰动直证）。嵌套镜像/逆序清理/部分迁移容忍同 018 骨架。
  ② **front 合并面（探针 G 定谳 = fallback 双钮变体）**：移动目录
  弹层增预览行（`movedir_preview` computed——dirs_of 本地派生目标
  同名检测，零 fetch[D-28② 形态]）+「合并移动」条件钮（目标同名
  时显——bool computed `movedir_conflict` 驱动；**探针 G 实勘链**：
  dialog 内嵌 checkbox 生成器双写缺陷[v-model 隐式写 + onchange
  显式翻转 = 净零，vue.rs shadcn Checkbox 组件路径一手源]→ 降级
  双钮；`if <computed str> != ""` vm 视图条件整子树丢弃[一次性
  diag 弹层子树 dump 实录]→ bool computed 引用健康——ledger
  D-36①②）；模型 `dirmerge_on` 旗标（ActMoveDir 复位/双钮 handler
  显式置位/MoveDirExec 统一消费）。
  ③ **trash 增强（016 §10.2 兑现）**：「恢复全部」钮（TrashRestoreAll
  ——front 逐条循环 trash_restore[v0 条目量接受，back 批量契约
  trash_restore_all §10.3 量级触发 >50 条首现时升级] + **末次三刷**
  [Links/Tags/Tree 循环外单次] + 循环毕 trash_list refetch + 零恢复
  零刷触发集纪律）；**行点击预览**（016「路径文本非点击面」裁决
  翻转——路径 ghost button → OpenLink：`.trash/...` read_wiki 直读
  [dot 忽略不进树/不入索引五面]、tab 标题 = strip_ad 全路径、
  **可编辑口径**：保存落回 `.trash` 原位[回收站档编辑无破坏面——
  待清理域语义注记；vm ⑦ 磁盘标记直证]）。
  ④ **直证**：probe_dir_ops 扩 merge 九案双臂（mb①合并基础并入/
  mb②冲突后缀保双份[靶原档逐字节不变+后缀新档字节整迁]/mb③
  merge=false 拒径回归/mb④循环卫先于合并/mb⑤文件占位仍拒/mb⑥⑦
  域卫双面[F-R18-1]/mb⑧CJK/mb⑨无冲突链接零扰动）+ vm 矩阵
  ㉓合并弧线/⑦ trash 增强 + e2e dir4/trash 增强同单。
- **孤页清单 + 最近打开（SD-2001，PLAN-020 第十八切片——知识健康与
  快速访问收割批，池尽后首片池外双件）**：**纯 front 派生零 back 增
  量**（f2d5a21..HEAD src/back 零 diff 主证；007/008 收割批同判——
  零新契约/零新 UI 形态/零探针）。① **find 第五模式 orphans（孤页
  清单，Ctrl+Shift+O——O 族避让实核）**：完全孤岛页定义 = **严格双
  零**——出度 = 自身 links.len()（**悬空链接计入出链度**：有链即非
  孤）+ 入度 = 他档出链 target_path 精确命中计数（**resolved 面**：
  悬空 target_path="" 卫语句不计入——backlink_rows_of 同族；自链接
  排除 j!=i——SD-302 自链计入出链不计入反链同语义）；
  `orphan_rows_of(pages)` 纯派生（wanted_rows_of 聚合族同构第四实
  例），行 {path} walk 序，行点击 OpenLink 开档（dtitle 显示期覆盖
  fallback=path），空态「（无孤页）」；**重算挂 LinksRefreshOf 派生
  段顺产**（触发集 v5 零扩——link_pages 变即重算）+ 入口
  ActFindOrphans 即刷新（link_index back walk 零树依赖——fs 外造档
  入口即现，alias 检索同款口径）；图谱孤点清单形态（图谱 vm 组件面
  门控的清单替代——两形态互补非互斥）。② **快开 recents（最近打开
  ，空查询行为升级——Obsidian 快速切换器同款替换式 v1）**：App
  `recent_paths` 会话域（**持久化不做**——重启即失，back 配置面后
  续批留口）；`push_recent` 头插+去重置顶+**容量 10 截断**（while
  重建法）；**开档成功触点族** = OpenFile/OpenLink[CreateGo 等建页
  导航经此]/NewGo/ActDaily 直开口 push + RenameGo/MoveGo/RenDirGo
  循环/MoveDirExec 循环 `recents_rekey` 旧键置换（存在判定单趟+命中
  才重建——无关路径零扰动；删除档**留** recents——缺档容错定案，
  recents 恒可开口径）；消费 = 快开 files 模式**空 q 双态**：有记录
  → 「最近」段（静态标题 text 零 computed 串接[D-33②]+recent_paths
  直读 str 清单 for——r.paths 同款在册形态）**替换**全量；无记录 →
  全量（现状不变）；有输入 → 过滤（现状回归）；拾取即关契约不变。
  ③ **已知答案修订面（计划内）**：005「空 q 全量 5 行」断言 → 累积
  位态 recents 替换面（vm check 11 首步——「最近」段+已开档行+未开
  档排除 Projects）；**首跑无记录全量面** = T-02 冒烟一次性件承载
  [.runtime——boot 后零开档窗全量 5 行实录；arm 内 recent_paths 会
  话域自 boot 累积，六检查位无零记录窗]；e2e 位态 = 10m goto 重载后
  唯一零记录窗（absolute 全量断言原位保留）+ ⑧ 绝对空态（pristine
  全连接——T-01 首锁：语料 5 页入/出度全非零[Projects 出链零但入链
  2——双零恒空]）。④ **直证**：vm 矩阵 ⑧ orphans 子步[无 input 负
  向面+纯孤页档入列→行点击开档→造链清孤[typeWholeDoc+ActSave 顺产
  重算行消]→悬空出链计入出链度[OrphanD 仅悬空出链档非孤]] + ⑨
  recents 弧线[清 q→「最近」段→3 开逆序→拾取即关→去重置顶→容量截
  断 RecCap×12→10 行] + e2e 同弧线真 DOM（⑧ 绝对空态+造链清孤
  write_wiki 外改——[[ 括号不落 vue 渲染 DOM[D-23③]]+⑨ 同弧+逐拾
  取三试重试[负载窗家族瞬态]）。
- **工作区状态持久层 + P≤200 试用防线（SD-2101，PLAN-021 第十九切片
  ——试用赋能批，020 §10.3 留口兑现）**：北标口径（SD-405）功能面
  18 片完备后的**可用性验证**批三件之二——试用润滑 + 试用安全。
  ① **back 持久层首开（专用不泛化）**：`.jade/` = jade 内部态目录
  （工作区根点前缀——fs_tree_skipped 点前缀忽略一手源[D-33①]——
  SD-1601 .trash 同论证：索引/标签/检索/树/快开五面零污染；**非用户
  内容**——D-14 frontmatter 用户域无涉；工作区本地——每工作区独立
  清单）。**通用 KV 持久层不做**（`state_get/set` 泛化面 v1 不做——
  第二持久需求出现时再议，避免过早抽象）。双契约：`recent_paths_get`
  （GET 无参——零 D-19 暴露面 trash_list 同判；缺档容错返 ""——
  exists 卫先行**只读不建**，首跑零 .jade 目录）+ `recent_paths_set`
  （POST body——路径行 CJK 常态 D-19 免疫；create_dir 递归幂等
  D-29①→write_text 原样直写→exists 复核 D-24② 族；≤10 行小文件
  无容量卫——front 权威 push_recent 单点；**空串 = 清空语义**——写
  空文件不删文件）。格式定文：换行分隔相对路径清单**原样存取**（与
  front App 态直通——零 JSON 包装；join/split = str 形态与 List 态
  最小换装）。**会话域 → 工作区域升级**（跨会话/跨重启：重启后快开
  空 q 显上次「最近」——试用核心润滑）。
  ② **front 面**：Init 载入半（get try/catch 容错 "" → recents_split
  入态——缺档现状空态零漂移）+ **RecentsPersist 共享 msg 口**（变更
  即存——≤10 行小文件无 debounce；触点族 = 020 D-37 八触点同源[直
  开口四 push 后 + rekey 二 + 目录循环尾二单发]；handler 间直发
  vue 轨 fire-and-forget 安全——无后续同 handler 读依赖）+ StatusBar
  条件行（store ws_warn 直读）。
  ③ **P≤200 试用防线（D-35② 处置更新——知情不禁用）**：TreeRefresh
  派生段 `collect_ad_paths` 在册纯函数计数 .ad 页 > 200 → store
  `ws_warn` 警示文案（`WsWarn(str)` msg 单向通道——App→store 直写
  无先例）+ console 计数 → StatusBar 条件行；阈值 = D-35② 稳定域
  口径（500 页实勘上游字符串池值损坏、200 安全线）；**纯显示面零拦
  截**（功能路径零影响——真实工作区超限用户知情自判；警示窗内快开
  可用双轨直证）。
  ④ **直证**：probe_recent 五案双臂（缺档容错/往返逐字节/CJK body/
  空串清空/复核+.jade 域圈定+免索引证 tree+link_index 双 face）+
  vm 矩阵 ⑩ 持久化逐行验/⑩b 进程重启载入真弧[臂尾第二 boot——
  recent_paths state 清单逐行 = 退出时磁盘逐行]/⑩c 防线案（201 页
  警示+警示窗内快开+清料回归）+ e2e ⑩三面（磁盘逐行/reload 跨会话
  「最近」段恢复/StatusBar 警示行显隐渲染面——vm 组件子树快照不可
  见的对位承载）+ 150 页实测工件（§10.4 分账——T-04）。
- **索引单趟合并性能批（SD-2201，PLAN-022 第二十切片——纯内部性能
  优化，契约零变化）**：021 150 页实测 findings ①②③（§10.4 分账本
  仓面）收口批——两处纯函数内部重写，接口/输出/契约三零变化。
  ① **back tags_json 单趟平行集聚合**（wsys.at）：原两遍聚合 pass2
  每 (tag, page) 对重调 `page_tag_set`（File.read_text + read_body
  两趟磁盘读——O(T×P) 重读面）→ pass1 循环内 `ptags_all` 平行集保留
  （pages 序平行——links_json stems/rels 同款在册形态），pass2 读
  `ptags_all[i2]` 平行集索引取（零磁盘）。输出逐字节等价定文：
  `ptags_all[i] ≡ page_tag_set(pages[i].rel)`（纯读函数同输入同输出
  ——前后采门实证：标准语料 + 150 页语料全文逐字节相等，9 采点形）；
  tag first-seen 序/paths walk 序/StringBuilder 装配段零触碰；
  `page_tag_set` 本体保留（单页语义面在册——调用点 tags_json 内清
  零）。150 页量级：tags_index 2.8-3.6s → **246ms**（AC-03 门
  ≤1.5s 过）。
  ② **front orphan_rows_of 守卫前置 + 平面化**（app.at）：原每页无
  条件 O(P²×L̄) 入度全扫（守卫后置——ind 仅 outd==0 时被消费）→
  平面预收一趟全部 resolved target_path（O(L)，tp != "" 卫原样）+
  仅零出链候选页对平面表计 ind（C×L）。**自链排除等价定文**：
  outd==0 ⇒ 自身 links.len()==0 ⇒ 平面表零自贡献（原 j != i 卫的
  守卫前置副产品）；行集/行序/行形状 {path} 零变化（vm 矩阵 ⑧
  orphans 三语义面全绿承载）。入口弧同 exe A/B（7ebe95c 树 vs 本批
  树）：click→mode 2480→1560ms（定向面贡献 ≈ −0.93s）；bench 口径
  8.2s → 3.4s——**残余 2.5s = 非目标面**（LinksRefreshOf 双取形
  link_index 两次 GET ~0.6s + json.to_value 解析 + 派生族
  [titles/backlink/outlink/wanted] + MentionsRefreshOf 串联 + 仪表
  固定 sleep ~0.7s——VM 循环量主导而非磁盘读，AC-03 孤页门 ≤2.0s
  越门如实记：门在本批授权范围内不可达[零成本反事实仍越]，watch 批
  供料面记账不硬调门，复审裁处）。
  ③ **boot 序顺产**：Init tags walk 大头随①消除——boot-ready
  5.3-6.2s → 2.64s（记录面不设门）。
  ④ **直证**：前后采逐字节门（两语料 sha256 前后全等 + 首中尾锚）+
  probe_tags 双臂六案全绿 + api.at 零 diff + merged 矩阵 16/16 ALL
  GREEN（基线 v19 零漂移——**零重锁第三例**[PLAN-017 纯 back 语义
  扩容片先例同判：store/App 模型零新字段、autoui_state dump 零变
  化、snapshot id 序列零变化]）+ probe 全族 14 件 fresh + e2e 十五段
  + vue build（release 路由）+ bench150 重放对拍（§5.3 门裁定实录）。
- **watch 批——刷新链路读面/取面收口（SD-2301，PLAN-023 第二十一
  切片——纯内部性能优化，契约零变化；部分交付：③双取形消除挂账
  D-39）**：PLAN-022 复审 F-1 裁定 unblock 路由批（watch 批立项以
  dbg-p22 A/B 口径重推门）。①**back 单读两剖**（wsys.at——每页磁
  盘读 2→1）：`body_of(text)` 共享口提取（read_body 剖切逻辑原样
  搬移——同代码路径字节语义零变化），`links_json` pass1 全文一次
  File.read_text、fm 域（aliases/dtitles）与 body 域同源剖切、body
  存平行 bodies 表（pages 序平行——022 ptags_all 同款在册形态）+
  pass2 索引取零磁盘（输出逐字节等价定文 `bodies[j] ≡
  read_body(rels[j])`——纯读同输入同输出）+ `search_json` 单读两
  剖（body 域/fm 域同源——原 read_body +
  frontmatter_of(File.read_text) 两趟收口）+ `page_tag_set` 单读两
  剖（022 tags_json pass1 每页恰调一次本函数，本批再砍其第二读）。
  ②**front `wanted_rows_of` 平面计数**（022 orphan_rows_of 平面化
  同构先例）：pass1 平面收全部悬空 target（flat 含重复 O(L)——不
  去重）+ pass2 首现判定去重 + 同值计数一次装配（O(D×L)——原每
  distinct target 全页全链重扫 O(D×P×L̄) 收口）；行序 = flat 首现
  序 ≡ 原 first-seen 扫描序、count = 悬空链实例数——行集/行序/行
  形状/label 公式零变化（无 List 元素定址写，「未证形态」规避延
  续；vm 矩阵 wanted 已知答案直证）。③**双取形消除挂账（D-39）**：
  `LinksRefreshOf` json.parse 单取实现完成且 vm 轨全绿（native
  1902 表达式消费实跑直证 + gen 源检 link_index 调用点恰 1 处），
  但 vue 轨 e2e 确定性触发 dev-stack 树响应滞留竞态（恢复弧
  MentionsRefreshOf search_wiki 与 TreeRefresh tree 响应同毫秒完成
  → 浏览器侧 fetch 200+ 秒未落——后端已 200；git-archive pre-change
  树 A/B 二分四象限定谳唯 T-03 引入）→ 实现回退、双取形维持在册
  （D-20⑤ workaround 保留），待用户裁处（挂账/基建授权修/上游修
  复后重推三选——ledger D-39 全链证据）。④**量级实录**（150 页，
  落点树 = T-01+T-02）：link_index 282/265ms（022 在册 289-304 带
  内微改善）、tags_index **235ms** ≤1.5s 门过（022 门续）、search
  48-54ms（在册 54-72 微改善）、boot-ready 2455ms（022 在册
  2640-2659——单读化 Init 链顺产，记录面不设门）；**dbg 口径孤页
  门重推 PASS**（F-1 兑现）：dbg-p22 A/B 口径弧合计（press→mode +
  mode→rows）891/841ms ≤ 2.0s（交替轮 pre 树 866/867ms 同带；022
  冻结门数值面沿用、口径面换 dbg 细粒度[无 bench 固定 sleep(500)
  干扰]——严格性不减的口径净化；bench ⑨ 3699ms 降记录面照录）。
  ⑤**fs 监听原语缺席定谳**（auto-lang native_catalog.rs 全量 grep
  一手源）：fs 面无 watch/notify 族，`auto.fs.mtime`（2997）在册
  ——watch 批原始愿景「免重 walk」的监听半维持上游供料记账；
  mtime 键控跨调用缓存（读缓存 + mtime 失效）为潜在本仓通道但违
  「纯读函数同输入同输出」零漂移纪律 + 字符串驻留量/mtime 粒度未
  勘，挂账（unlock = 专项立项）。⑥**直证**：前后采逐字节门三面双
  语料（links_json/tags_json/search_json——sha256 全等 9 件 + tags
  两面与 022 在册值同源）+ probe 全族 14 件 fresh + api.at 零 diff
  + merged 矩阵 16/16 ALL GREEN（基线 v19 零漂移——**零重锁第四
  例**[017/022 先例续]）+ e2e 十五段全绿 1.3m + vue build（release
  路由）+ split 臂家族窗第七例（git-archive 950b4ea pre-change 树
  同 exe 同签名零接触定谳——分段判绿 018..022 先例续）。
- **mtime 键控缓存专项——探针定谳与收益面关账（SD-2401，PLAN-024
  第二十二切片——有界调查批，契约零变化，repo src 零 diff）**：
  PLAN-023 §10.2 挂账 unlock 兑现（专项立项即解锁动作）。**四面
  探针实录**（tests/probe_mtime.mjs 入库双臂 + e2e/.runtime 原型
  一次性件；判定表/分量分账值内嵌 plan §8.1）：①**fs.mtime 可调
  性直证**（back 模块直调 epoch 秒——merged 进程内 + split POST
  双臂全等；stdlib.rs rust_fn 宏自注册 + native_catalog 2997 双表
  在册与行为一致，缺失档 -1）；②**语义面**：写后跨秒翻转可见 +
  **同秒写读边缘 same-sec-yes 双臂**（读→写→再读 mtime 未翻——秒
  粒度陈旧窗直证，失效通道设计依据与一手源 as_secs 一致）；③
  **模块级可变态本仓首例定谳**：`var` 模块级平行三表（rels/mtimes/
  texts——D-20④ map 值域规避形态）跨调用 + 跨 HTTP 请求持久、
  174K 字符长串逐字节完整、驱逐（重建三表 + 模块级 var 重赋值）
  双臂生效；④**驻留压力**：150 页语料全文本驻留 152 行 + ≥10 串
  行轮/进程内 ×3 轮输出逐字节等值——D-35② 值损坏签名全零（P≤200
  域驻留健康实测）。**判定表裁定 = no-go（收益面结构性否定）**：
  三风险（驻留/粒度/零漂移适配）全过，但分量分账（@150 页 VM 侧
  计时）——walk 16-18ms / read×150 **11ms（全弧 4%）** / mtime×150
  8-9ms / O(P) 查表扫描 ~95-105ms / full 未缓存 271-278ms / 原型
  热态 361-389ms：**主导面 = 跨页解析/提取/装配 ≈243ms（90%）非
  逐页可缓存**（links 解析跨页 stems/aliases 全表依赖——派生产物
  缓存 = 非目标 v1），免重读收益上限 11ms < 热态 ≤170ms 门所需
  101ms——**门结构性不可达，原型热态 ≥ 未缓存（mtime stat + 查表
  扫描开销 > 读省）→ 缓存实现不落地（src 零 diff 直证），本仓非
  监听半通道经济性关账**：watch 批剩余面终账维持（残余 = 双取形
  D-39 + 监听半上游供料两件）——终账依据由 023 的「三风险未勘
  挂账」升级为「四面实测 + 收益面否定」（负结果在册先例
  probe_receipt_d19 同判形态；跨进程零漂移旁证 = cached link_index
  ≡ 未补丁仓源逐字节全等）。附：执行窗新观测 **D-40**（VM 单调用
  长执行约束——单调用越 ~2-3s 域返回体破坏/静默中止，同逻辑串行
  独立调用全绿；生产形态零涉，探针/基准件设计纪律供料）。
- **目录合并三择与 moves 映射返回形（SD-2501，PLAN-025 第二十三
  切片——功能切片，back 契约扩展批）**：019 §10.2 r3 口兑现 +
  §9 F-R19-1 low 闭账（微件池顺延批——README 仪表盘④两件出池）。
  **`move_dir` 四参契约**（wsys.at `move_dir_impl` + api.at 契约块，
  POST 按名绑定——019 merge 扩参先例续：唯一消费者 front 同批改，
  双侧仓内同步无外部消费方）：签名增 `strategy str`——白名单
  `both`/`skip`/`overwrite` 逐字等值判定，未知值 → "" 拒
  **fail-closed 前置**（校验居全部卫语句之前；合法三值下拒径与
  strategy 值零耦合——probe s⑤ 策略×卫正交八案 + s⑥ 直证）。
  **冲突三择零数据丢失三通道**（策略仅作用于合并径冲突分支，卫语句
  族先于其正交维持）：`both` = `{stem}--{n}.ad` 后缀保双份 **v1 现行
  原样**（零代码路径变化——m①..mb⑨ 全案四参化回归承载，行为逐字节
  等价）；`skip` = 靶档保留原内容 + **源冲突档改道 `.trash`**
  （trash_target 以源 rel 复用——保源结构 + `--{n}` 序号续接，
  trash_restore 回源位）；`overwrite` = **靶旧档改道 `.trash`**
  （靶位 rel——restore 回靶位，占用期恢复受 v1 exists 冲突卫拒、
  占用档移出后两步可回）+ 源档落靶位——改道均 move_file 字节整迁 +
  双复核（trash_target 共享单点复用，delete 双改道同族）。**moves
  映射返回形**：成功返回 JSON `{"dir":"<新目录 rel>","moves":
  [["old","new"],…]}`（json_esc 转义 + `+` 装配——条目量 ≤ 工作区
  档数 P≤200 稳定域）；moves = 迁移映射平面，**完整性不变式**：成功
  径每迁移档恰一对（正常迁移/后缀/skip 改道恰一对，overwrite 双对
  [靶旧→.trash + 源→靶位]，同父幂等 moves=[]）；拒 = "" 哨兵零变化。
  **front 映射驱动重映射（F-R19-1 闭账）**：`MoveDirExec` 弃旧树
  `paths_under` 派生 + `r + "/" + rest` 拼接（v1 误映射源结构性消除
  ——冲突后缀档 rest 拼接落靶侧 rel → Reload 后 tab 显靶档内容的
  019 记账面），改 moves 查表逐对 `TabsRenamed` + recents 置换——
  冲突档 tab 落映射新位（后缀档/.trash 位）恒显其文件真实新位内容；
  `.trash` 落位 tab 跟随文件可看可编辑、保存落回 .trash 原位（019
  §10.4 语义在册）；active/ft_sel 属目录 remap 以 `.dir` 驱动（映射
  循环后 active 已随 TabsRenamed 落位，rel_under 归 "" 零扰动；余留
  面 = ft_sel 目录选区）。**front 解包通道**：`json.to_value(r)`
  identifier 实参在 vue 轨发射恒等（D-20⑤ gen-only 直证——本批
  App.vue emitted `let m = r`），且 move_dir 变更型调用双取不可行
  （二次调用源目录已消返 ""）→ 纯 str 手工解包双轨同构
  （`move_json_dir`/`move_json_moves` + `json_unesc`——split/rejoin
  镜像逆精确可逆；结构引号恒随分隔模式消费；split_once 无 ts_adapter
  映射/.replace 次数语义双轨未证/切片 D-20③ 禁——原语域纪律注记）。
  **弹层三择 UI**：三钮分立（合并·保留双份/跳过同名/覆盖同名——各钮
  显式置 strategy + dirmerge_on 后统一消费 MoveDirExec；D-36① 规避
  形态声明：零 checkbox[①a]/零视图字符串比较条件[①b——三钮静态
  无策略感知视图分支]/钮居内容流[①c 现役位]；拒径钮「移动」现役
  零变化；冲突提示行/预览行现势维持）。**链接零扰动语义维持**：目录
  移动链接零改写 v1 定文三择径不破——skip/overwrite 改变靶位内容
  归属不改变链接解析面（冲突 = 同 rel 同 stem 链接解析恒达；改道
  副本居 .trash walk 忽略域；overwrite 2→1 页面塌缩 = 被覆盖档退出
  索引面，s⑨ 归一 diff 前态剔除承载）。**验证链**：probe_dir_ops
  三择案组 s①..s⑩ 双臂全绿（s②③ skip 零数据丢失[靶 twin 逐字节
  不动 + 源冲突档 .trash 改道 + 序号续接]/s④ overwrite[靶旧改道 +
  源落位 + 双映射对]/s⑧ trash_restore 回滚弧[去后缀名回源位 +
  exists 卫拒 + 两步可回]/s⑨ 三择径链接归一/s⑩ moves 完整性）+
  既有 m①..mb⑨ 全案四参化零漂移 + 双臂 raw 字节等值升级；vm 矩阵
  tab 重映射弧（skip 弧 tab path = .trash 改道位 + active_body = 源
  档内容非靶档内容——F-R19-1 直证）+ e2e 同单 vue 轨真 DOM 直证；
  基线 **v20 计划内重锁**（App dirmerge_strategy 入 dump——store 新
  字段面第七例 + 三钮闭态渲染 id 序列）。

  **第二十四切片——上游回执复测批（SD-2601，纯回执验证 src 零
  diff——PLAN-705/706 载体重建与四回执；blocked 出口形）**：
  载体重建口径（015 旁路先例续）：上游 PLAN-705 交付簇（vm http
  handler 异步生命周期——live-op 登记表/固定 async reqwest
  executor/请求状态机四阶段段驱动 owner dispatch/REQUEST_SCOPES）
  + 706 合并携带（aura_view_builder +971/vm_bridge +616/memo_deps
  +155/vue.rs gallery display fixes）晚于本地双 exe（09-28
  15:02/15:17）→ 本地重建载体（家族 master 66c9cac19 src 洁净实
  勘；`cargo build -p auto` **双载体** release 80,972,800B@09-29
  21:19/debug 128,110,080B@21:26——**`-p auto` 有界旁路适配**：全
  量构建败于 auto-cosmic-demo 旁支 crate 预存编译断 E0061[09-23
  PLAN-695 引入 `View::Text.selectable` 字段 demo 未随改——家族源
  码面观察非本仓修域]；家族并行窗互斥观察——运行中 auto.exe 实例
  映像锁归 `.wt/musk-093` 自携工作树，master 双 exe 无锁；全程
  AUTO_EXE 显式指路）。**回执判据与双出口定文**：D-21 负载窗
  （e2e ≥3+双臂矩阵 ≥2/臂+gate ≥1——HTTP 面签名[400 missing
  param/ECONNRESET/ECONNREFUSED/进程死亡]零复现=处置升级/任一复
  现=留观+形态实录；UI 节拍族[popover 内容窗 v11③]分野单列）/
  F-R17-1（split fresh-green 判据——恢复=闭账/续现=第十例）/
  D-35②（N=500 值完整锚判据——值完整=口径精化注记/损坏=口径维
  持+实录）/D-19（源码 grep+四案复跑——负结果双确认）。**执行窗
  实录（blocked 出口触发——非静默）**：merged 臂**脏标/确认弹层
  交互面双载体确定性断裂 ×4**（debug=[7 tab] 标脏弧进程死亡 ×2
  同点[基线 v20 PASS 后 MCP 控制通道进程死亡伴生 SocketError@
  vm_matrix:673/674]/release=[7 tab]+[10 link] PASS 后 [10b] 脏关
  弧弹层栈积 ×2 同点[:774——fail-snap 双叠「有未保存的修改」确认
  弹层滞留=脏态泄漏形]；**A/B 判别链强形**：同矩阵同 fixture 旧
  exe 09-29 19:42 merged 16/16 ALL GREEN 在库[p25-merge-smoke.log]
  ——断裂=载体 delta 交互语义面[706 UI 输入层最邻域候选]，dump 结
  构面完好[基线 v20 双载体 PASS]）→ 冒烟败形 §plans/026 §5.2/
  §10.3 **blocked 出口**（src 零 diff 约束下不自修——r1 交裁：待
  家族修复窗重入 or 断裂实录供料另立）；**split 臂结构性不可达**
  （矩阵单跑先 merged 后 split——F-R17-1/D-39 复核轮 0/2）。**已
  交付回执面**：D-35② 负结果维持（新载体 N=500 HTTP 200 整数
  322 len=3——019 整数 500 同族形态变体，P≤200 口径不变）/D-19
  负结果双确认（url_decode byte-as-char 原样 http_server.rs:527
  +四案 g① body=0/g② len=0/g③/g④ 原绿——供料候选不变）/D-21 负
  出口形态实录（进程死亡 ×2 + e2e ×3=2 绿+popover v11③ 族 1 例
  重跑即绿+e2e 窗 HTTP 签名零复现——留观维持）/盘点三件维持候选
  （checkbox vue.rs:13491 注释域在+gen 面 App.vue 零实例/menubar
  memo 零发射/autoui_state 序列化零触——705/706 delta 零触定
  谳）/build ✓built 20.23s（新 gen 面全链绿——SCHEMA_DRIFT_
  GENERATE_AT=1 随窗路由，706 生成器变更对 jade 语料零破坏直
  证）。**回执批形态注记**：src 零 diff（git diff adb9d8d -- src/
  0 行——024 no-go 支路同判）；一次性复测件居 ignored
  e2e/.runtime（p26-* 在档可追溯）。

  **重入收口（2026-09-30，家族 706 rev2 修复落 master 后——blocked
  解除→全绿交付）**：家族定谳一手承接——bisect first-bad=**432068075
  （plan047 T-06 computed 信号网）**：裸 Value 无 RC 堆身份入网，
  脏档 TabActivate 状态替换释放旧对象后信号伪命中（deps 键随对象
  释放永不 bump）——**三面同根因**（debug RC canary UAF panic/
  release id 复用错读=弹层滞留/probe_mtime 挂起）；修复=双守卫
  （`value_carries_heap_identity` 准入拒收+`heap_dep_key_alive`
  死键 miss 重求值——不入网退回每帧重算即 pre-706 行为）。本批重
  入（tip 9fbf4ebd5：706r2+708+709 在含；`-p auto` 双载体 release
  81,313,280B@09-30 12:41 全新构建/debug 128,245,248B@12:47）：
  **冒烟门四腿全绿——merged 矩阵 16/16 ALL GREEN（[7 tab]/[10b]
  全过=706 r2 AC-10 消费者回执面兑现）+ probe_sb 双载体+probe 双
  电池[debug 14 绿/release 13 绿+receipt_d19 三确认；probe_mtime
  release 独立缺陷维持=D-41]+build ✓built 18.63s+基线 v20 零漂移
  [新载体零重锁]**。D-21 **正出口**：全判据面补齐（e2e ×3 全绿+
  双臂矩阵 ≥2 轮/臂+gate ×1[merged 段过→split 短路既定形]）——
  HTTP 面签名全窗零复现，处置升级「705+706r2 后零复现 receipt 在
  册」。F-R17-1 **第十例续记**：split [1 boot] FAIL+wiki 树行不现
  v23..v27 逐字同形 ×2+gate——判别链强形（src 零 diff+merged 同
  窗 ×2+probe split 臂 HTTP 全绿）；**定性更新：706r2 交互面修复
  未触 split boot 域=独立缺陷域证实**（unblock 更新=家族 split 臂
  专项修复）。D-35② 双窗 CORRUPT 同形（整数 322——P≤200 维持加
  强）；盘点三件新 delta 零触维持候选。

  **第二十五切片——双取形消除重推批（SD-2701，纯内部性能优化重推
  ——回退出口形）**：023 §10.6 ①裁定内含「后批重推」兑现批（重推
  条件③证据链在册：PLAN-705 backend 生命周期重做落载体+D-21
  receipt e2e×3 dev-stack HTTP 面全零+split 域独立缺陷分离定谳）
  ——023 §5.3 留存设计原样执行：`LinksRefreshOf` try 体单点（:2363
  `json.to_value(link_index("", 8))` → `json.parse(lj)` 复用 :2361
  原文——fetch 2→1）+ :2350-2352 workaround 注释块退役注记
  （D-20⑤）；gen 源检 App.vue :649 `JSON.parse(lj)` 发射形+调用点
  恰 1 处（:647）。**执行窗定谳（回退出口触发——plans/027 §5.2 复
  现判据）**：e2e 窗 D-39 签名族 **2/2 复现**（r2/r3 逐字同形：:820
  `.first()` 解析到编辑器 wikilink span[autodown-wikilink-label] 被
  block-boundary 持久拦截→240s 超时；aria 快照 240s 时 TrashMe 树
  行恒缺[recents/LINKS 面有行]=ft_nodes 陈旧形）+ **trace 复采**
  （playwright network trace：trash_restore 后三刷响应聚集——
  ws_root[tree] 与 tags_index **同毫秒完成** 46.456s dt=-0ms、弧内
  link_index 恰 1 调[单取发射面直证]、此后 ~234s 零再取——后端
  200+浏览器侧滞留形一手复采，023 trace 05.106/05.107 同族再现）
  → **app.at 单点还原**（git diff 04ce23b -- src/ 0 行——还原零漂
  移直证；gen 源检回归双取形 :647+:649）。**A/B 还原对拍**：单取形
  D-39 域 2/2 败 vs 双取形 2/2 绿（r4/r6 1.5-1.6m；r5=D-21 v11③
  popover 瞬态未达弧重跑即绿）——**023 四象限定谳在 705+706r2 载
  体再证：「705 后竞态续在」**（backend 生命周期重做未触
  browser↔vite-proxy↔backend 树响应滞留域；与 split boot 域分立
  维持）。**处置落定：D-39 三选维持①**（双取形 workaround 维持在
  册——还原即①执行兑现；②e2e 基建授权修零触碰仍待用户明示[spec
  :821/proxy 定序全程零 diff 直证]；③上游修复供料证据链加强[trace
  簇+双树 A/B 新增一手物料]）。D-20⑤ 退役挂起（随①维持；json.parse
  通道双轨等价一手源定谳维持有效）。判绿面（还原树=026 复审树零
  diff 强形）：merged 矩阵 **22 PASS 全组绿**（基线 v20 零漂移——
  零重锁续例）+ probe 双电池（debug 15 路由[14 RESULT 绿+receipt_
  d19 在册守望形]/release 14 路由[13 绿+casefold r2 重跑即绿 D-21
  瞬态+守望件同形；mtime skip——D-41 debug 路由纪律]）+ build
  ✓built 18.54s（SCHEMA_DRIFT_GENERATE_AT=1）+ e2e 还原后 2/2 绿。
  split 臂本窗 boot/tree PASS+[3 open] 编辑器面未现=F-24-2 族内漂
  移形（024 复审窗先例同形——F-R17-1 独立缺陷域维持，第十一窗观
  察）。本批 src 零 diff（负向证七面全零——024 no-go/026 回执支路
  同判形态）；exe 载体全程 09-30 12:41/12:47 未重建（双取形维持=
  载体零变化）；一次性件居 ignored e2e/.runtime（p27-* 在档可追溯，
  trace 解包件即用即删）。

  **第二十六切片——CJK HTTP 面 POST 化适配批（SD-2801，里程碑收
  口件）**：用户里程碑测距问询（2026-09-30）测距出「tag 前收口件
  = CJK 开档 vue 轨」——repo 侧 POST 化适配（不待上游 url_decode
  修复——SD-401 search_wiki GET→POST 先例原样复刻，传输面单点零
  逻辑变更）：**三契约 method 翻转**——`read_wiki`/`exists`/
  `page_meta` `#[api(method = "GET")]` → `"POST"` + 各契约文档块
  D-19 免疫注记（「POST 而非 GET——档名 CJK 常态，body 传参[SD-401
  同款；PLAN-028 适配]」write_wiki 注释族同款文风）；**back 实现
  零变化**（wsys.at 零 diff——method 系传输面注解，进程内 CALL 双
  轨语义零变化）；**GET 端点随批下线**（无外部消费方——api.at 唯
  一出口在册；receipt g⑤ 404 直证）。**消费面勘定（空根 GET 维持
  注记）**：tree/link_index/tags_index 三子树形契约 front 恒空根
  `""` 调用（LinksRefreshOf `link_index("", 8)` app.at:2361/:2363
  + 树/tags 面板同族实勘）——CJK 子树形态零消费，上游 url_decode
  修复后备援纵深面注记（env_str ASCII 环境键同判 GET 维持）。
  **regen 客户端自动翻转**：ts_adapter 按 `#[api]` method 生成
  fetch 形——三契约客户端 GET query → POST body（`:method: 'POST'`
  + `body: JSON.stringify({ path })`——gen 源检 ×3 + GET query 残
  留零；app.at/editor_store.at 调用点零变化——传输面封装在生成层
  ；merged 臂进程内直调无传输面=零变化直证）。**split 臂 CJK 降
  级口径随批解除**（page_meta「split 臂 CJK 路径降级空态」v1 记
  账注记退役——双臂全量可用）。**CJK 双臂化达成**：矩阵 CJK 导航
  子步双臂化（link 面板行/10c 播种/tags 展开/meta 属性目标/find 拾
  取/file 新页/删除预览/激活落点/tab 重开——tab 序两臂同构[HW,
  index,CAP,首页,…]）+ e2e vue CJK 开档新弧（15 cjk——树行点击开
  档 read_wiki POST 语料锚显形 + 属性弹层预填 page_meta POST 已知
  答案 + 保存往返 write_wiki POST frontmatter 存续——vue 轨此前结
  构性不可测弧首测）。判绿面：probe receipt_d19 翻新形 ALL GREEN
  （g①/g② POST CJK 翻绿直证——015/026 三窗负结果转正 + g③/g④
  ASCII 回归 + g⑤ GET 下线 404）+ probe 全族 15 件 fresh + merged
  矩阵 16/16 ALL GREEN（基线 v20 零漂移——零重锁续例）+ e2e 全绿
  1.2m 含新弧 + build ✓built 10.97s（SCHEMA_DRIFT_GENERATE_AT=1
  ；regen 窗 16.88s）；split 臂 boot FAIL ×2=F-24-2 主导形在册
  （独立缺陷域——分段判绿惯例，判别链=merged 同窗全绿+probe split
  臂 HTTP 全绿+e2e 同一 serve-back 面绿）。exe 载体 09-30 12:41/
  12:47 未重建（api.at 系解释数据——引擎零重建面）。里程碑提案
  （v0.1.0「试用就绪」三收口件+可带病注记面）交裁——release 批
  另立（plans/028 §4.3）。

## 6. 测试体系（双轨一致性门；PLAN-001 T-04 换基迁移；SD-402 find 扩单；SD-502 create 扩单；SD-602 rename 扩单；SD-702 file 扩单；SD-802 meta 扩单；SD-902 meta/link 扩单；SD-1002 link 扩单；SD-1102 meta 属性子步扩单；SD-1202 dir/alias 子步扩单；SD-1302 显示名子步扩单；SD-1402 目录二期/面板名化子步扩单；SD-1502 daily/updated_at 子步扩单；SD-1602 trash 子步扩单；SD-1702 四级解析/词边界/case-only 子步扩单；SD-1802 目录移动/depth 8 子步扩单；SD-1902 目录合并/trash 增强子步扩单；SD-2002 orphans/recents 子步扩单；SD-2102 持久化/防线子步扩单；SD-2202 零扩单——PLAN-022 纯内部性能片：行为零变化，既有断言域全量承载[vm 矩阵 16 组含 link ⑧ orphans 三语义面/meta 组 tags 面] + 基线 v19 零漂移[零重锁第三例] + 前后采逐字节门[tags_json 两语料 9 采点] + bench150 重放对拍门[tags ≤1.5s 过 246ms/孤页 ≤2.0s 越门 3.4s——非目标面残余记账，split 臂家族窗第六例口径续记]；SD-2302 续零扩单——PLAN-023 纯内部性能片（读面/取面收口，第三例）：行为零变化，既有断言域全量承载[vm 矩阵 16 组含 ⑧ orphans/wanted 语义面] + 基线 v19 零漂移[零重锁第四例] + 前后采逐字节门扩面[links_json/tags_json/search_json 三面×双语料 9 件 sha256 全等] + dbg 口径孤页门重推门[≤2.0s 过 891/841ms——F-1 兑现；bench ⑨ 降记录面] + 双取形消除挂账[SD-2301③——D-39 vue 轨竞态，split 臂家族窗第七例口径续记]；SD-2402 续零扩单——PLAN-024 有界调查批（探针定谳 no-go 关账）：probe_mtime.mjs 新增入库[契约语义双臂五案——probe 族 14→15 件] + 判定表/分量分账值内嵌 plan §8[.runtime 一次性件口径] + repo src 零 diff——矩阵/e2e 断言域零扩[既有保存点弧/fs 造档弧内建承载零涉]，基线 v19 零漂移续[零重锁第五例——src 零 diff 直证]；SD-2502 续——PLAN-025 功能切片（合并三择批）：probe_dir_ops 三择案组扩[s①..s⑩ 双臂——skip/overwrite 零数据丢失+卫正交+fail-closed+CJK+回滚弧+moves 完整性，既有 m①..mb⑨ 全案四参化零漂移承载，双臂 raw 字节等值升级] + probe_trash 回归续[18+15 案 fresh] + vm_matrix 13 file 组扩[dir4 三择钮面三显断言+保留双份钮续承合并弧线/dir5 tab 重映射弧——F-R19-1 直证：skip 改道位 tab path+源档内容+recents 置换+.trash 位保存落回] + e2e 同单[dir4 三钮三显+保留双份钮/dir5 skip 弧——ASCII 路径 D-19 口径] + **基线 v20 计划内重锁第七例**[App dirmerge_strategy 入 dump["both" 缺省——store 新字段面] + 移动目录弹层三钮[闭态恒渲染 D-23③]入 id 序列]；SD-2602 续——PLAN-026 回执复测批（**blocked 出口**）：零扩单零新件（既有验证链复跑 + .runtime 一次性件——024 no-go 支路同判）；载体健康冒烟门注记（probe_sb 双载体/probe 15 件 fresh 双臂[debug 14 绿+receipt_d19 负结果一致；release 13 绿+probe_mtime 挂起 ×2]/merged 矩阵[本窗 blocked——新载体交互面断裂 ×4，A/B 锚在库]/build ✓built[release 路由]——基线 v20 双载体 PASS 零漂移续；重入收口 2026-09-30：冒烟门四腿全绿[merged 16/16 ALL GREEN 修复直证——706r2 AC-10 兑现+probe_sb 双载体+probe 双电池+build ✓built 18.63s——基线 v20 新载体零重锁]）；SD-2702 续——PLAN-027 重推批（**回退出口**）：零扩单零新件续例（单取形已还原——src 零 diff，e2e ×6 轮 A/B 加强面执行实录在册[单取形 2/2 败@:820/双取形 2/2 绿] + gen 源检两形在录[单取 :649 JSON.parse(lj) 执行窗实录→还原后双取 :647+:649] + 基线 v20 零重锁续例[merged 22 PASS 零 diff 强形] + probe_mtime debug 载体路由纪律[D-41 注记]）；SD-2802 续——PLAN-028 CJK POST 化适配批：**扩单**（probe_receipt_d19 翻新形五案[POST CJK 翻绿直证 g①/g②——015/026 三窗负结果转正 + ASCII 回归 g③/g④ + GET 下线负证 g⑤ 404] + probe_trash b 族 split 三案 skip 解除[exists POST 形全案双臂] + probe_dir_ops p⑩ 随校翻绿[CJK exists POST→1] + vm_matrix CJK 导航子步双臂化[link 面板行/10c 播种/tags 展开/meta 属性目标/find 拾取/file 新页导航/删除预览/激活落点/tab 重开——tab 序两臂同构] + e2e 15 cjk 新弧[树行点击开档/属性预填/保存往返闭环]）+ **基线 v20 零重锁续例**（零 store 字段面——契约注解翻转不触 store/dump 域）；SD-2902 续——PLAN-029 release 就绪批（第二十七切片——**零扩单零新件**，026/027 docs+验证形同判）：回归门六面 fresh receipt 落 plans/029 §8（merged 22 PASS 基线 v20 零漂移[新载体 debug 16:01 v0.4.2-2311 实跑]/split 臂 F-24-2 主导形分段判绿[第十三窗]/e2e 全量 1.2m 首跑绿/build ✓built 15.81s/probe 15 件[14 绿+dir_ops 9362 环境碰撞 triage——D-31④ 族]/bench150 四点带内）+ dist ✓built@tip 现势（assert-dist-fresh 通道随 build 链）+ 双形冒烟指南命令实走（RELEASE.md 试用指南「指南即验证」——merged/vue 集成单命令形全绿；dist 独立 serve 缺口注记=vite preview 代理 vite 5.4.21 实测不生效，RELEASE.md §2）+ 基线 v20 零重锁续例（src 零 diff 强形）；SD-3002 reload-safe 子步扩单——PLAN-030 安全手动重载批：vm_matrix R 组六弧（确认开/取消/放弃/干净直入/缺档/untitled——弹层钮区域锚消歧）+ e2e/reload-safety.spec.ts 九段全弧（三入口/取消/放弃对账/干净直入/untitled/合法空文/缺档/迟到拦截——read_wiki 拦截臂承载迟到门）+ rename 组①脏档复原弧随新语义适配（确认+放弃）+ 基线 v20→v21 计划内重锁第八例（reload_* 五字段入 dump + 重载确认弹层 vnode 扩）；编辑器安全语义规范 = docs/specs/editor-safety.md（SD-01..03 局部新规范首件）

| 门 | 命令 | 断言域 |
| --- | --- | --- |
| vm 矩阵（双臂） | `node tests/vm_matrix.mjs` | merged 臂（进程内直调）+ split 臂（`--no-merge` HTTP）各**十五组检查**（六检查——**check 5 含 updated_at 维护断言**[PLAN-015：保存后行值当日形 + title/status/summary 逐字节——受影响档盘点 = 全部带 updated_at 键语料档，正证位在本检查、其余磁盘断言 presence 形不受扰] + 基线[merged] + tab/editops/link/find/rename/file/meta 扩单 + quit——PLAN-002..008 扩单；**link 组含建页弧线子步 10c**[PLAN-005]、**mentions 子步 10m**[PLAN-009：三段标题/提及行已知答案+已链源排重/行点击 OpenLink/空态/激活变更刷新/面板关零 fetch——行为等价断言，素材 ASCII 双臂；**PLAN-010 扩 aliases 解析三步 + linkify 转链两步**；**PLAN-017 扩 ⑦四级解析导航 + ⑧提及转链词边界两子步**：⑦ 外造 CF Navigate.ad[`[[hello world]]` 小写变体链——③级 stem casefold 命中]→ 反链段新行 → 行点击开档 → 出链行 hello world 非悬空[SD-1401 恒 target 文本]→ 点击导航落 Hello World.ad + links_json target_path 直证；⑧ Mention D 三态体[Hello WorldX/xHello World/Hello World 并置]→ 转为链接 → 磁盘逐字节仅独立位包裹[双侧邻接透传]+D 行消[页级已链源排重]——素材 ASCII 双臂]]、**rename 组含七子步**[PLAN-006：禁用态/弹层锚/取消零落盘/改名弧线/面板+树/**case-only 弧线[PLAN-017：翻转+回翻双向——casing 翻转 readdir 实名/active 小写路径/无 cftmp 残留——006「case-only 拒」子步随 SD-1701 裁决翻转改弧线]**/状态复原]、**file 组含八子步 + F-R9-4 + 目录面四子步**[PLAN-007 八子步：新建/幂等/取消零落盘/CJK 新页/删除预览+取消/删除弧线/悬空翻转/未选中 no-op——激活邻档两臂异位 merged=同位保持[首页]/split=active 不变[D-19 开档面]，tab 警示行两臂分叉「1 个将关闭」/「无打开」；**PLAN-010 增 F-R9-4 删后提及刷新断言**；**PLAN-012 目录面四子步**：⊕新建目录[树新行+磁盘在]/移动弧线[Project X→DirBox：预填 wiki 断言 + tab 全量 DirBox/Project X + 字节整迁 + **面板快照前后逐字节一致** + **links_json 定向 diff 归一相等**（序无关集合语义——walk 位次迁移属预期面）——移动零扰动三联语义固化]/取消零落盘/冲突拒[弹层留置+磁盘零变化]——素材 ASCII 双臂，CJK 案 probe_dir_move 直证覆盖]、**find 组含 alias 检索子步**[PLAN-012：fs 造 alias 档[检索走 back walk 零树依赖]→搜「检别名」→AliasTgt.ad 命中行[title=stem 口径 T-01 直证面]→拾取开档双臂] + **trash 模式子步 ⑥**[PLAN-016：＋新建 TrashMe[NewGo 全弧]→菜单删除[④弹层文案「将移入回收站 TrashMe.ad」断言——AC-03+改道磁盘面 .trash/TrashMe.ad]→文件→回收站[第四模式入口——Ctrl+Shift+T 键程 menubar 共口]→清单行→清空回收站→强确认弹层[M=1 派生+取消留置零落盘]→清空→空态闭环[（回收站为空）]+磁盘 .trash 消] + **trash 增强 ⑦**[PLAN-019：双条目清单→行点击预览[.trash 路径 tab 开 active_title=.trash/TrashR1[strip_ad]+树不可见[EXPLORER 区子树扫描——state dump ft_nodes=不透明 vmref 不可文本断言]]→保存落回 .trash 原位[磁盘标记直证——可编辑口径 SD-1901]→恢复全部[TrashRestoreAll 循环 restore→清单空态+磁盘双档回根字节保真——建一删一双弧线[删除目标=ft_sel 选中档]]] + **⑧ orphans 第五模式子步**[PLAN-020：空 q 断言修订[005「全量 5 行」→recents 替换面——「最近」段+已开档行+未开档排除 Projects；首跑无记录全量面=T-02 冒烟承载]+无 input 负向面+fs 造纯孤页档入列[back walk 零树依赖]→行点击开档→造链清孤[typeWholeDoc+ActSave 顺产重算行消]→悬空出链计入出链度[OrphanD 仅悬空出链档非孤——resolved 面直证]] + **⑨ recents 弧线子步**[PLAN-020：清 q[type_text 空→FindEdit('') 通道]→「最近」段累积态→3 开[index/Tasks/Hello World ASCII 拾取 D-19 免疫——Projects 避让 12 素材位态]→头 3 行逆序→拾取即关→去重置顶→容量截断[RecCap×12 fs 造+ActDaily 树刷新→12 开→10 行 头 RecCap12 尾 RecCap3]] + **⑩ 持久化逐行验子步**[PLAN-021：⑨ 终态 ↔ .jade/recents.txt 磁盘逐行一致[显示域归一剥 .ad——dtitle 缺省 stem]+快照免索引负向[.jade 点前缀 walk 忽略零感知]]、**meta 组含八子步 + inline 子步 + 属性子步**[**PLAN-013 title 弧线四断言**：预填 title 位首[CAP 定理/Tasks]/改写磁盘 title 行受控 diff 仅 title 行+树行显示即时刷新/清空删键回 stem 显示/双臂目标页异位；**改名显示不变语义面**[12⑤ Project X stale title 'Projects'——SD-1301 联动定文固化]；PLAN-008 八子步：tags 面板开 7 tag 行[语料实勘全集]/展开导航 ASCII 双臂+CJK 仅 merged[D-19]/Save 刷新外造新行；wanted 模式入口无 input/外造行+语料已知答案/取消零落盘/创建消缺+exists 翻转/空态闭环——执行序在 10c 后 11 前，tags 全集/悬空余量已知答案位 + PLAN-009 inline：body #inline-meta 档保存后面板新行 + 语料基线零漂移回归（忽略面负向无 block-project-a）+ **PLAN-011 属性子步六案**：untitled no-op[meta_open 恒 false]/预填回显[目标页双臂异位 merged=CAP 定理 distributed-systems,theory/split=Tasks tasks——D-19 口径]/取消零落盘[磁盘零泄漏面——闭态弹层 input 回显恒在不适用快照断言]/tags 保存+面板即时刷[smoke-tag 行]/alias 帽烟别名 exists 翻转[links_json 断言双臂同构 D-19 免疫；Hello World body fs 预置 [[帽烟别名]] 悬空相位]/删值弧线[全空白 input=删键+tags: 键整删]/保存流互作[body 整文保存 frontmatter 存续]——弹层内定位=标题锚 content 子树扫[D-23③ 恒渲染全树首匹配误中他弹层——D-27④ 同款纪律]]**；**link 组含面板行名化子步**[PLAN-014 ⑤⑥：反链三源显示名断言[首页/CAP 定理/Tasks——面板区锚族]+无 title 源档 stem 形态[10m/alias/F-R9-4 行]+出链/wanted 恒链接文本非退化并证[12⑤ 'Project X' 非 'Projects'+14⑤ wanted label——SD-1401 定文]]、**file 组含目录二期三子步**[PLAN-014 ⑭-⑯：重命名目录弧线[DirBox→DirBox2：弹层双 input/预览「将移动 1 个 .ad 页（链接零改写）」/tab 全量路径变标题恒[stale title 语义面]/磁盘整迁/面板快照零变化/links_json 归一 diff——三联对照目录级]/取消零落盘两形/删除目录弧线[强确认预览计数+悬空警示 → tab 全关计数-1+树行消[explorer 区锚——闭态弹层 input value 投影误中规避]+悬空翻转 Project X（悬空）——SD-701 目录级]** + **今日笔记弧线**[PLAN-015 ⑰：工具栏/菜单共口直调 daily_note → 开档[active_title=yyyy_MM_dd stem + body # 当日]→ 树新行[explorer 区锚]→ 磁盘 created_at/updated_at 双时间戳[当日动态值格式断言]→ 重入幂等[tab 数不变——已开即激活]；stem 全 ASCII 无 D-19 面] + **trash 改道/恢复弧线 ⑱**[PLAN-016：⑥ 删除弧线的 CAP 定理此刻在 .trash[改道]→回收站模式入口→清单见 .trash/wiki/CAP 定理.ad→行恢复→空态+磁盘回+**exists 翻转回双向态**[links_json exists:true 现+false 消——悬空自愈 ⑦ 反向闭环]+树行回+merged tab 重开[D-19 口径——CJK 树行开档 split 以 ft_sel/磁盘/links_json 承载]]；键程 = menubar 共口先例[Ctrl+Shift+M 同款]；CJK 案 probe_dir_ops 直证覆盖] + **目录移动四子步**[PLAN-018：移动目录弧线[DirMvA→DirMvB：弹层双 input 源/目标父→磁盘新位字节整迁+旧目录消+tab 全量路径变标题恒+ft_sel remap+面板快照零变化+links_json 归一 diff——三联对照移动级三部曲收官]/取消零落盘/循环卫拒弹层留置[源==目标父自身形]/**5 层深档快开命中**[L1/../../L4/DeepPg.ad fs 外造——depth 8 front 面收口直证：行集含该档即收口证，depth 4 下 ft_nodes 不含]——素材 fs 外造+⑰ ActDaily TreeRefresh 承载树新鲜度] + **目录合并弧线 ㉓**[PLAN-019 + **PLAN-025 三择钮面**：MgA→MgB 同名对[fs 外造×2 对——MgOther/MgTPg 靶原档]弹层双 input→预览行现文+**三择钮三显**[合并·保留双份/跳过同名/覆盖同名——D-36① 规避形态三断言]→**保留双份钮**→磁盘并入 靶原档逐字节不变+源档字节整迁+源目录消+tab 全量路径变+links_json 归一 diff[无冲突全入径=纯移动语义]/不合并拒径回归[「移动」钮→弹层留置+磁盘零变化→取消]——e2e 素材 API 前置 daily 前[树新鲜度 ⑰ 承载]交互后置] + **tab 重映射弧 dir5**[PLAN-025：MgR×MgT/MgR 同名对[fs 外造——019 素材块同位，树新鲜度同载]源档开 tab→弹层「合并·跳过同名」→ **tab path = 映射新位 .trash/MgR/MgRPg.ad 非靶档 rel**[F-R19-1 直证] + active_body = 源档内容非靶档内容[误映射形态消除] + recents 置换同口径 + 磁盘[靶 twin 逐字节不动+.trash 改道逐字节]+**.trash 位保存落回原位**[019 §10.4 可看可编辑直证]——素材 ASCII 双臂 D-19 免疫]]——子步不占检查位，fail 即臂败）+ **臂尾 ⑩b/⑩c**[PLAN-021——check 9 后第二 boot，fail 即臂败不占检查位：⑩b 跨会话重启载入真弧[recent_paths state 清单逐行=check 9 退出时磁盘逐行+「最近」段渲染——Init 载入半]/⑩c 防线案[fs 造 201 页微语料→ActDaily→ws_warn 警示文案 store 态断言+警示窗内快开可用+清料零警示回归——vm 组件子树快照不可见故渲染面=e2e 对位]]）+ 结构基线 **v20** 零漂移（merged 臂锁，`tests/baseline/structure-v20.txt`；**v20=PLAN-025 计划内重锁**：App dirmerge_strategy 入 dump["both" 缺省——store 新字段面第七例] + 移动目录弹层三钮[合并·保留双份/跳过同名/覆盖同名——D-36① 规避形态，闭态恒渲染 D-23③]入 id 序列；**v19=PLAN-021 计划内重锁**：store ws_warn[P≤200 防线态——现行语料恒 "" 入 dump；>200 警示案=臂尾 ⑩c 承载]入 dump——非零重锁第六例[store 新字段面；App 模型零新字段/recent_paths 值域六检查后 1 项同 v18——pristine 语料零 .jade 载入半=⑩b 承载；id 序列零变化——StatusBar 组件子树快照不可见]；**v18=PLAN-020 计划内重锁**：App orphan_rows[pristine 语料全连接恒空 []]+recent_paths[六检查后 1 项=check 3 树行开档；**str 清单 dump 直出字符串非 vmref——新观测面**]入 dump + action view.find-orphans[Ctrl+Shift+O]+menubar 视图项「孤页清单」入 id 序列——非零重锁第五例[第五模式 chrome 扩面；快开空 q「最近」段/孤页行集均在 find_open 门控后不入终态 snapshot]；**v17 = PLAN-019 计划内重锁**：App dirmerge_on 旗标入 dump + 移动目录弹层预览行 text 节点 +「合并移动」条件钮[探针 G 定谳双钮变体——bool computed 条件] + trash 行路径 ghost button 化入 id 序列——非零重锁第四例[弹层扩面+行形态化；恢复全部钮零新 state——trash_rows 复用]；**v16 = PLAN-018 计划内重锁**：store movedir_open + App movedir_src/movedir_dst 入 dump + action file.movedir[无快捷键——M 族避让] + menubar 文件项「移动目录…」+ 移动目录弹层第十二实例[双 input，闭态恒渲染 D-23③]入 id 序列——G5 实勘落定非零重锁第三例；**PLAN-017 零重锁第二例实录**[v15 维持——纯 back 语义扩容片：store/App 零新字段，dump 零新字段断言随零漂移现跑兑现，010 首例后语义扩容片口径]；**v15=PLAN-016 计划内重锁**：App trash_rows/trash_purge_open 入 dump + action file.trash[Ctrl+Shift+T 键位] + menubar 文件项「回收站」+ 清空强确认弹层[第 N 实例——description 静态+M 派生裸 computed text 节点——description 位 computed 插值不发射面 ledger D-33②]入 id 序列[v15 锁文件头注字面 v14 系重锁窗漏改——016 教训同款，v16 随锁校正]；v14=PLAN-015 计划内重锁：每日笔记 UI 面——action file.daily[Ctrl+Alt+N 键位] + menubar 文件项「今日笔记」+ 工具栏 calendar 钮入 vnode id 序列，**store/App 模型零状态面**[ActDaily 直调无新字段]；行:列消费未落地——探针 E 定谳 autodown_editor 无 oncursor 转换臂[D-12 处置维持]；v13=PLAN-014 store deldir_open/rendir_open + App deldir_q/rendir_target/rendir_q 入 dump + 删除目录/重命名目录弹层[第十/十一实例，闭态恒渲染 D-23③]节点 + menubar 两项 + Shift+Delete/Ctrl+Shift+R 键位入 id 序列；v12=PLAN-013 store 零状态面[tabs.title 恒路径面]+App titles/meta_q_title + links_json dtitle 字段扩+属性弹层第三 input 留档、v11=PLAN-012 store dir_open/move_open + App dir_q/move_q + 弹层第七/八实例 + EXPLORER ⊕ 钮 + Ctrl+Shift+M 留档、v10=PLAN-011 store meta_open + App meta_q 双字段 + 属性弹层第六实例 + Ctrl+I 键位留档、v9=PLAN-010 上游 PLAN-089 mouse-area 149 节点重锁留档、v8/v7/v6/v5/v4/v3/v2/v1/v0 留档） |
| vue build | `pnpm build`（= regen-vue.mjs） | 裸 strict 生成 + 三残余补件 + vue-tsc 0 错 + vite build |
| vue e2e | `pnpm test:e2e` | playwright **同一检查单**（含 10c 建页弧线 + 10m mentions 段内增 linkify 行转链/段间迁移/磁盘逐字节 + aliases 解析/出链翻转/反链增行/删测试档 + **PLAN-017 ⑦⑧ 两段**[⑦四级解析导航：CF Navigate 小写变体链 → 出链行 hello world 非悬空 → 导航落 Hello World；⑧提及转链词边界：Mention D 三态体 → 转链磁盘逐字节仅独立位包裹——read_wiki GET ASCII 免 D-19 面] + **5 save updated_at 维护断言**[PLAN-015——当日形正证位] + 12 rename 七子步 + 13 file 段[9 quit 后] + **13 dir 目录面四子步**[PLAN-012：⊕新建目录[CJK 目录名 收件箱——弹层创建+树新行+磁盘在]/移动弧线[E2E Note→收件箱：placeholder=dirs_first 动态绑定首证（值 ∈ {wiki, 收件箱} 两可——序随 fs.tree casefold 实位）+ 根档预填空 + tab 题全量 收件箱/E2E Note + 磁盘整迁]/取消零落盘/冲突拒弹层留置] + **13 dir2 目录面二期三子步**[PLAN-014：重命名目录弧线[目录甲→目录乙 CJK POST body 双臂：双 textbox 弹层/预览「将移动 1 个 .ad 页（链接零改写）」/tab 题恒/磁盘整迁——三联对照目录级]/删除预览[计数行+无入链警示]+取消零落盘/删除弧线[确认 → tab 全关+磁盘消]——弹层 hidden 断言 = heading 角色锚[getByText 标题子串 strict 竞态执行期校正]] + **13 dir3 目录移动三子步**[PLAN-018：素材 ⊕ 目录丙/目录丁 + ＋ DirMvPg 移入 → 移动目录弧线[双 input 弹层 源/目标父 → tab 题恒+磁盘整迁 目录丁/目录丙——三联对照移动级三部曲收官]/取消零落盘/循环卫拒弹层留置[源==目标父自身形]——deep 案 = vm 承载（快开 depth 8 收口，e2e 断言域外）] + **13 dir4 目录合并弧线**[PLAN-019 + **PLAN-025 三择**：POST 造 目录己×合并靶 同名对 → 双 input 弹层 → 预览行现文+**三择钮三显**[保留双份/跳过同名/覆盖同名]→保留双份钮→磁盘并入[靶原档不变+源档字节整迁+源目录消]/「移动」钮拒径回归[弹层留置+磁盘零变化]] + **13 dir5 tab 重映射弧**[PLAN-025：POST 造 MgR×MgT/MgR twin 对[**ASCII 路径**——read_wiki GET query D-19 面，编辑器开档通道约束；嵌套靶 = move_dir+rename_dir 五连——create_dir 清洗层 "/"→'-' 单层口径]+UI 建 MZ 触发树刷新[POST 造料零树刷新——dir3 先例]→树行开源档→「合并·跳过同名」→ **tab 跟随映射新位 .trash/MgR/MgRPg.ad 编辑器显源档内容非靶档内容**[F-R19-1 闭账 vue 真 DOM]→磁盘 twin 逐字节不动+.trash 改道逐字节→.trash 位键入保存落回原位[019 §10.4 可看可编辑]→收尾关 tab+磁盘复原] + **13 daily 弧线**[PLAN-015：菜单「今日笔记」→ 开档[D-23② 渲染文断言口径——`# ` 标记符不落 DOM]→ 磁盘 created_at/updated_at 双时间戳 → 重入幂等——已知答案免疫（今日档无 tags 无链接）] + 14 meta 段[段内最后——tags 4 行此位已知答案 + wanted 建页闭环 + **PLAN-011 属性弧线**：预填回显[placeholder 唯一锚]/取消零落盘/tags 保存面板即时刷/alias 帽烟别名 exists 翻转[快开面板导航 CAP 定理]/删值弧线/保存流互作[appendToEditor+磁盘 frontmatter 存续]——**vue 轨 fetch 型预填覆写竞态在册：fill 前置预填落定等待 toHaveValue**；建页全走 POST body CJK 已证面无 D-19 分野] + **11 find 段 alias 检索子步**[PLAN-012：write_wiki 内造 alias 档 → 搜「检别名」→ AliasTgt.ad 命中行 → 拾取开档双臂]]；serve-back AutoVM 后端 + vite 双 webServer） |
| 双臂总门 | `node scripts/gate.mjs` | ①vm 双臂 ②vue(build+e2e) 顺序全绿（契约漂移段已随自有源退役） |

另：契约直证脚本 `tests/probe_create.mjs`（PLAN-005 create_page 六案）/ `tests/probe_rename.mjs`（PLAN-006 rename_page 八案——改写逐字节/锚透传/自链/CJK/清洗/三拒/副作用圈定）/ `tests/probe_delete.mjs`（PLAN-007 delete_page 九案——删存在/幂等闭环/缺失拒/非 .ad 两形拒/CJK 删/重建接回 + **悬空化不改写源文逐字节负证**，双臂返回值逐案对读）/ `tests/probe_tags.mjs`（PLAN-008 tags_index 六案——全集首锁[11 tag 含探针素材：first-seen 序 + 归属页逐项精确]/无 frontmatter 零/无 tags 键零/缩进两形态/同页去重/depth 传递[d1=仅根层+d2=d4] + CRLF 形态探针 + **双臂返回值逐字节一致**，merged 直调 + serve-back GET）/ `tests/probe_inline_tags.mjs`（PLAN-009 tags_json 行内 #tag 七案——语料 7 tag 零漂移+忽略三则负向面/inline 计入/标题忽略/块锚忽略/纯数字忽略/fm+inline 并集去重/CJK token + 双臂逐字节一致，merged 直调 + serve-back GET 8224）/ `tests/probe_alias_linkify.mjs`（PLAN-010 别名解析五案 + 提及转链接五案十案双臂全绿，merged 直调 + serve-back GET/POST 8225）/ `tests/probe_page_meta.mjs`（PLAN-011 写引擎十案 + write_body 顺序互作案双臂全绿[①改写归一 ②非目标键逐字节 ③尾追 ④删键 ⑤无 fm 增建 ⑥CRLF 保真 ⑦幂等[同值重写+二次空写 no-op] ⑧双键同写 ⑨CJK 值 ⑩读回闭环+缺席形态；互作=属性写→write_body→frontmatter 段存续]——merged 直调 + serve-back GET/POST 8226，双臂磁盘逐字节一致）/ `tests/probe_dir_move.mjs`（PLAN-012 create_dir/move_page 八案 + 检索 alias 三案双臂全绿——新建/清洗/同名幂等/移动基础[字节整迁+frontmatter 完整]/同路径幂等/缺失目录拒/冲突拒/CJK 目录名+档名 POST 双臂 + alias 命中[title=stem+snippet=""]/语料基线逐字节[walk 序+snippet 行口径]/alias+body 双命中[snippet 非空]；**探针 A/B 定谳件**：File.create_dir 可调[实勘 create_dir_all 递归语义+幂等不炸]/File.is_dir 可调——merged 直调 + serve-back POST 8227，双臂磁盘逐字节一致）/ `tests/probe_dir_ops.mjs`（PLAN-014 delete_dir 六案 + rename_dir 六案双臂全绿——**probe C 定谳件**：File.remove_dir/remove_dir_all 可调[首闸；解析层不可调则探针工程 boot 即 fatal D-24① 同判面]+根拒+非目录拒/递归删除[目录+档全消]/空目录/CJK/缺失再删+基础改名[逐文件新位+字节整迁+旧目录消]/纯 .ad 卫[混入 notes.txt 拒零变化]/同层同名两形[同名目录+同名档]/casefold 拒[目录级 G3]/CJK/缺失拒 + **嵌套案**[DirNest/sub/Deep.ad 余段迁移+镜像建+旧嵌套逆序清理——merged 探针域 probe_support.ws_join 造档通道，create_dir 清洗层结构性不含分隔符 v1 单层口径] + **链接零扰动归一 diff**[moved 集合 path/target_path 归一 <MOVED> 后逐字节相等——三联对照目录级固化]——merged 直调 + serve-back POST 8231[8228 首跑撞临时源端口 CLOSE_WAIT 出站连接 10048 顺延避让——FR-13-1 家族环境项]，双臂磁盘逐字节一致；**PLAN-018 扩**：move_dir 六案+merged 域两形+depth 8+url_decode 重勘——m①..m⑦ 基础/循环卫[自身+后代 merged 域]/合并拒[同名文件双臂+同名目录 merged 域——目录合并 v1 不做]/纯 .ad 卫/同父幂等/CJK + m⑦ 移动前后链接零扰动归一 diff[三联对照移动级] + p⑨ depth 三深度采[depth 1 不含 wiki 档/depth 8 全含/语料 flat d4==d8 零漂移——split 域]+5 层深档 d8 含/d4 不含[merged 域 ws_join——4→8 覆盖收窄收口直证]+search 内部 8 walk 命中 + p⑩ url_decode 重勘[GET exists CJK 百分号序列 → 0——D-19 维持在册；**GET bool 序列化实勘 = 裸 1/0 非 JSON true/false**——断言口径随校]；**PLAN-019 扩**：move_dir merge 九案双臂——mb①合并基础[并入+源消+双档并存]/mb②冲突后缀保双份[靶原档逐字节不变+`MgC--1.ad` 后缀新档字节整迁——零数据丢失默认]/mb③merge=false 拒径回归/mb④循环卫先于合并分支/mb⑤同名文件占位仍拒/mb⑥⑦**.trash 域卫双面直证**[源前缀拒+目标前缀 merge=true 亦拒——**F-R18-1 闭账案**；拒绝操作 .trash 内零落点断言]/mb⑧CJK 合并/mb⑨无冲突全入径 link_index 归一 diff 零扰动[merge=true 无冲突=纯移动语义直证]——嵌套靶目录造档通道 = back 管线五连[create_dir+move_page+move_dir+rename_dir——write_text 不建父目录+create_dir 清洗层不含分隔符，双臂同构零 ws_join 依赖]；**PLAN-025 扩**：move_dir 四参三择+moves 映射返回形——全案四参化 strategy="both" 零漂移承载[dir 抽取随校 + 双臂 raw 字节等值升级：HTTP 封套剥离 unwrapStr 归一]+三择案组 s①..s⑩ 双臂[s②③ skip 零数据丢失[靶 twin 逐字节不动+源冲突档 .trash 改道+**序号续接 SkP--1**——trash_target 同族]/s④ overwrite[靶旧改道+源落位+**双映射对**]/s⑤ 策略×卫正交八案[循环卫/域卫双面/纯 .ad 卫/文件占位拒 × skip/overwrite 全 "" 零变化]/s⑥ fail-closed[未知 "xxx"+空串 白名单前置直证——合法几何下仍拒]/s⑦ CJK skip/s⑧ trash_restore 回滚弧[**SkP--1 恢复回源位去后缀名**+SkP.ad 再恢复 exists 卫拒+overwrite 占用期两步可回[occupant 移出前置]/s⑨ overwrite 径链接零扰动归一[**2→1 塌缩前态剔除**——被覆盖靶旧档退出索引面，m⑦ 口径三择径续]/s⑩ moves 完整性[精确形 mb①mb②s② 恰一对/集形 s③ 二对 s④ 三对 overwrite 双对计/幂等 moves=[] 空对]]+setup 自证 s34..s49[twin 靶 move+rename 双通道回执，move_dir 回执 dir 抽取]）独立于矩阵按需跑（入库源，全案期望值 = SD-501/SD-601/SD-701/SD-801/SD-901/SD-1001/SD-1101/SD-1201/SD-1301/SD-1401/SD-1501 定文）。probe_page_meta **PLAN-013 title 面五案扩**（011 十案全量带 title 现值 in-place 同字节改写——契约扩不破旧 + ③t 改写[diff 仅 title 行]/删键+删后幂等[防线三值扩]/尾追/三键同写增建 title 位首/②t 引号壳剥离读回 + 读回装配序 title,tags,aliases）；probe_alias_linkify **⑪ dtitle 案组五案**（index.ad 双字段并存/语料同值零变化/无 title 缺省 stem/单行值直读/⑪e 两域边界并证[dtitle=首页 在册而 [[首页]] 仍悬空]）；`tests/probe_daily.mjs`（PLAN-015 Date 原语 back 直证 + daily_note 四案 + updated_at 维护四案双臂全绿——n① 首建[yyyy_MM_dd.ad 当日动态格式断言]/n② 幂等重入[同路径+磁盘零变化]/n③ 连日并存[昨日档逐字节不动]/n④ 模板逐字节[created_at/updated_at 同值首写 yyyy-MM-ddTHH:mm:ss + # yyyy-MM-dd body] + u① 有键档保存[Z 形语料归一无 Z + 其余 fm 键行逐字节 + body 落盘]/u② 无键零引入/u③ CRLF 保真[键行替换 + \r 继承 + 其余行逐字节]/u④ 顶层级卫[嵌套键行不动 + 零顶层级引入]——merged 直调 + serve-back POST 8232，双臂返回值逐案对读 + 磁盘逐字节一致）；`tests/probe_receipt_d19.mjs`（PLAN-015 D-19 回执四案——g③ ASCII exists 回归/g④ 缺失拒 原绿 + g① encoded CJK exists/g② read_wiki **负结果实录**[byte-as-char 不组 UTF-8——SD-1501 回执判定面]，serve-back 8241）；`tests/probe_trash.mjs`（PLAN-016 回收站十八案+十五布尔翻转对双臂全绿——①改道[page+dir 保结构镜像+嵌套 BoxDel/sub/Deep.ad merged 探针域 ws_join 造档通道+工作区面逐字节等价]/②冲突后缀[删→重建→再删 .trash/TrashB.ad 与 .trash/TrashB--1.ad 并存]/③restore[原位恢复+悬空自愈翻转回[l1/l2 links_json contains]+后缀条目恢复去后缀名[TrashB--1.ad→TrashB.ad]+目标冲突拒+越界卫三形[无前缀/../.trash/../]+缺失拒]/④purge[清单余量→清空→.trash 消→幂等再清空]/⑤CJK 全弧[delete_page/restore POST body D-19 免疫+trash_list GET 无参响应 body 面]+字节整迁 round-trip[Bytes.ad 自定义 body 删→恢复逐字节]+存在性翻转对十五案[b1..b15——split 侧 exists GET CJK 三案 D-19 口径 skip]+越界卫副作用圈定[工作区外 evil.ad 零创建]+根 .ad 集合圈定——**全案期望值 = SD-1601 定文**，merged 直调 + serve-back GET/POST[端口 pick_port 自动避让]）。`tests/probe_casefold.mjs`（PLAN-017 解析四级序七案——①`[[hello world]]`/`[[HELLO WORLD]]` → Hello World.ad[语料现成已知答案]+精确档对照 ②精确优先[§10.1 落定 = root×wiki/ 跨目录变体通道：Windows 同目录不可造变体双档，跨目录 stems 全局收集天然可并存——casefold 竞争档 walk 序更早让位] ③②>③ 级间序[[foo]] → alias 精确档] ④③>④ 级间序[[bar]] → stem casefold 档] ⑤④级可用[[qux]]/[[hat]] ⑥CJK 零影响[[首页]]恒悬空 ⑦pristine 基线 5 页 10 链接全已知答案逐链接断言[含 index.ad 提示行 [[页面名]] 悬空档]+双臂深等——merged 直调 + serve-back GET/POST[端口 pick_port]）；probe_rename **PLAN-017 ⑧⑧b 扩**（⑧ 行为翻转：wiki/Tasks → TASKS 成功——磁盘 casing 翻转[readdir 实名]+字节整迁[①改写态原样过两步迁移]+变体三态 [[tasks]]/[[Tasks]]/[[TASKS]] → [[TASKS]] 全改写[cf-src 素材]+对照精确链接零重写[副作用圈定]+无 --cftmp- 残留；⑧b 全等拒[原名 no-op——原 casefold_eq 拒面收窄]）；probe_alias_linkify **PLAN-017 ⑪..⑮ 词边界五案扩**（⑪CAPTURE 词内不误伤+独立包裹 ⑫xCAP/CAPx 双侧邻接跳过 ⑬`_-` 豁免包裹[§10.2 r1 直证] ⑭A首页B CJK 恒子串[定义级强化] ⑮[[CAPTURE]] 链接内豁免+明区边界共存）。**probe 端口口径注记（PLAN-016 卫生件）**：`tests/pick_port.mjs` 共享助手（候选段 8221..8260 try-bind 首个可绑 + env 强制通道）——probe 族 11 件固定 SPLIT_PORT 常量清零（8221..8227/8231/8232/8241/8253 适配史收口——F-R8-1/F-R13-1/D-31④ 三笔环境账，**此后 WinNAT 漂移零适配成本**）；probe_rename **updated_at 行归一**（PLAN-016 T-04 执行期校正——先在缺陷 b64794a 复现实录：PLAN-015 write_body 维护键使改写页 updated_at 行值必变，逐字节期望未吸收该语义面——双侧归一值域不判，链替换断言不变）。

断言域 = 两轨交集（结构/文本/磁盘字节，**非像素**）；差异登记面 =
[parity-ledger.md](parity-ledger.md)（从第一天记账）。

## 7. 双轨纪律

- **同日落地**：新功能单源写入后，vm/vue 两轨验证同日完成（gate 双臂），
  不允许"先 vm 后补 vue"（旧 jade-garden 分裂成因，PLAN-081 立项裁定）。
- 差异不静默：任何一轨暂缺的面 → parity-ledger 记账（形态/处置/升级
  路径），不留在代码注释里埋伏。
- 旧 jade-garden 冻结零改动（功能池）；其 vue 专属组件迁 AutoUI/BP 属
  后续批（design 30 §6 判定），不在本仓 v0 面。
