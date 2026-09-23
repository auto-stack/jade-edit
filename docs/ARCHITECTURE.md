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
  补写 v0 不做（frontmatter 逐字保留，功能池后续批）。
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
- fixture workspace 每次全新隔离拷贝（源 = auto-down `tmp/wiki-demo`，
  `JADE_FIXTURE` 可覆）——测试会打字保存，源零污染。Auto back 无 config
  文件 ⇒ 旧「exe 旁陈年 config 压 env」事故类别结构性消失（belt 保留为
  ws_root 实际根断言）。

## 6. 测试体系（双轨一致性门；PLAN-001 T-04 换基迁移；SD-402 find 扩单；SD-502 create 扩单；SD-602 rename 扩单；SD-702 file 扩单）

| 门 | 命令 | 断言域 |
| --- | --- | --- |
| vm 矩阵（双臂） | `node tests/vm_matrix.mjs` | merged 臂（进程内直调）+ split 臂（`--no-merge` HTTP）各**十四组检查**（六检查 + 基线[merged] + tab/editops/link/find/rename/file 扩单 + quit——PLAN-002/003/004/005/006/007 扩单；**link 组含建页弧线子步 10c**[PLAN-005]、**rename 组含七子步**[PLAN-006：禁用态/弹层锚/取消零落盘/改名弧线/面板+树/case-only 拒/状态复原]、**file 组含八子步**[PLAN-007：新建/幂等/取消零落盘/CJK 新页/删除预览+取消/删除弧线/悬空翻转/未选中 no-op——激活邻档两臂异位 merged=同位保持[首页]/split=active 不变[D-19 开档面]，tab 警示行两臂分叉「1 个将关闭」/「无打开」]——子步不占检查位，fail 即臂败）+ 结构基线 v7 零漂移（merged 臂锁，`tests/baseline/structure-v7.txt`；v6/v5/v4/v3/v2/v1/v0 留档） |
| vue build | `pnpm build`（= regen-vue.mjs） | 裸 strict 生成 + 三残余补件 + vue-tsc 0 错 + vite build |
| vue e2e | `pnpm test:e2e` | playwright **同一检查单**（含 10c 建页弧线 + 12 rename 七子步 + 13 file 段[9 quit 后段内最后——vue quit 垫片 no-op 无进程约束，删除素材 Hello World.ad 保 quit 三验面]；serve-back AutoVM 后端 + vite 双 webServer） |
| 双臂总门 | `node scripts/gate.mjs` | ①vm 双臂 ②vue(build+e2e) 顺序全绿（契约漂移段已随自有源退役） |

另：契约直证脚本 `tests/probe_create.mjs`（PLAN-005 create_page 六案）/ `tests/probe_rename.mjs`（PLAN-006 rename_page 八案——改写逐字节/锚透传/自链/CJK/清洗/三拒/副作用圈定）/ `tests/probe_delete.mjs`（PLAN-007 delete_page 九案——删存在/幂等闭环/缺失拒/非 .ad 两形拒/CJK 删/重建接回 + **悬空化不改写源文逐字节负证**，双臂返回值逐案对读）独立于矩阵按需跑（入库源，全案期望值 = SD-501/SD-601/SD-701 定文）。

断言域 = 两轨交集（结构/文本/磁盘字节，**非像素**）；差异登记面 =
[parity-ledger.md](parity-ledger.md)（从第一天记账）。

## 7. 双轨纪律

- **同日落地**：新功能单源写入后，vm/vue 两轨验证同日完成（gate 双臂），
  不允许"先 vm 后补 vue"（旧 jade-garden 分裂成因，PLAN-081 立项裁定）。
- 差异不静默：任何一轨暂缺的面 → parity-ledger 记账（形态/处置/升级
  路径），不留在代码注释里埋伏。
- 旧 jade-garden 冻结零改动（功能池）；其 vue 专属组件迁 AutoUI/BP 属
  后续批（design 30 §6 判定），不在本仓 v0 面。
