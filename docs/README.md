# jade-edit — 知识库方向的 AutoDown 编辑器（独立仓，auto-edit 家族）

> jade-edit：`.ad`（AutoDown/markdown-wiki）文件的桌面编辑器，**AutoUI
> 单工程双轨**首例——同一份 `src/front/*.at` 单源，vm 轨解释渲染（iced
> 原生窗）、vue 轨生成 Vue3+Vite 工程。从初始版起双轨一致性（同日落地，
> gate 双臂同断言域），不再积累组装级差异（旧 jade-garden 的教训）。

## 是什么 / 不是什么

- **产品定位（SD-303，2026-09-22 Q1 裁定）**：jade-edit = **知识库方向**的
  AutoDown 编辑器，与 auto-edit（轻量级编辑器）**长期并存、两套产品**
  ——不做产品合并；组件尽量共用，未来组件插件化时升级为插件级共用；
  家族栈（stylekit/bps/@autodown/engine）维持。裁定全文见
  [ARCHITECTURE.md](ARCHITECTURE.md) §1。
- **北标（SD-405，2026-09-22 用户口述）**：短期对标 **Typora**（编辑
  体验），长期对标 **Obsidian、Notion、飞书**（本地知识库 → 块级协作）。
  Typora 核心差距大头在上游（供料包承载：D-16/D-17/rope delta/D-12），
  本仓落地件 = 快开/大纲等编辑器周边；Notion/飞书远期只记账不动手。
  裁定全文见 [ARCHITECTURE.md](ARCHITECTURE.md) §1。
- **全新应用**（非 examples 拷贝、非旧 jade-garden 迁移）——溯源见
  [PROVENANCE.md](PROVENANCE.md)。
- 旧 `auto-down/jade-garden` = **冻结功能池**——其链接族（反链/图谱/
  检索等）即知识库方向的移植主线，逐步以 AutoUI 组件/BP 形态移植过来
  （首切片 = wikilink 索引 + 反链/出链面板；**第二切片 = 查找面板**
  （SD-401，2026-09-22）：快速打开 Ctrl+P + 全文检索 Ctrl+Shift+F
  双模式；检索 = 冻结池 search.rs Page 面线性化移植，块级/倒排不迁；
  **第三切片 = 悬空建页闭环**（SD-501，2026-09-22）：悬空出链行点击 →
  确认弹层 → 根落位建页 → 开档 + 索引/树刷新——wikilink 读/找/写
  最小环收口；**第四切片 = 重命名 + 反链改写**（SD-601，2026-09-23）：
  F2/菜单 → dialog 弹层（预填 + 影响面预览）→ 磁盘改名 + 全部入链
  `[[wikilink]]` 源文自动改写（知识完整性件——旧园 rename 只补内存
  索引不改源文，jade 纯派生链接面下源文改写为本仓首创设计；casefold
  裁决随批落定：stem 匹配维持精确比较、case-only 拒；casefold 匹配本
  体属另立计划）；**第五切片 = 树文件管理**（SD-701，2026-09-23）：
  EXPLORER 头部「＋」新建（复用 create_page——幂等/清洗/模板/根落位
  全套直承）+ Delete 键/菜单删除（影响面预览弹层「N 处入链将变为悬空
  + M 个标签页将关闭」→ delete_page POST → 该档全部 tab 关闭 → **入
  链悬空化不改写源文**——与重命名改写成语义对照并表：改名保完整性，
  删除如实悬空，悬空行可再建页接回）；**第六切片 = 标签面板 + 悬空
  链接清单**（SD-801，2026-09-23）：Ctrl+T 标签面板（back 新契约
  `tags_index` GET——frontmatter `tags:` block-list **只读解析首开**
  [D-14 写面不动：back 侧 frontmatter 消费面 +1、写面维持零]，缩进
  两形态归一聚合 `[{tag, paths}]` first-seen 序；tag 行计数 → 展开
  页行 → 导航）+ Ctrl+Shift+D wanted 模式（**零 back 增量**——
  link_pages 派生 exists=false 悬空目标聚合行，行点击直连建页弹层
  预填 target，创建后清单自消缺 + 出链 exists 翻转——SD-701 删除悬
  空化的「发现→建页→消缺」卫生闭环；inline `#tag`/aliases/tag 写面
  属功能池后续批）；**第七切片 = 未链接提及 + 行内 #tag**（SD-901，
  2026-09-23）：反链面板第三段（search_wiki 派生，零新契约）+ tags
  聚合源扩 body 行内 #tag（忽略四则）；每日笔记 blocker 记账（Time
  epoch-only，供料候选 ledger v12）；**第八切片 = 别名解析 + 提及转链接**（SD-1001，
  2026-09-23）：链接域二期——frontmatter `aliases:` block-list 只读解析（`page_fm_list`，解析序 stem 精确首现优先 → alias 精确首现，消费面 exists/target_path/反链/出链/wanted 全面对齐，检索/提及/改名不入面）+ `linkify_page` POST 契约（明区改写、frontmatter 逐字节保留、计数返回）+ 提及行「转为链接」钮（串联自派生刷新消除 vue 轨并发 fetch 竞态）+ F-R9-4 删除流提及刷新收口；图谱 tab 顺位后移——vm 轨组
  件面依赖上游），本仓零依赖其代码。
- 编辑器内核 = `@autodown/engine`（auto-down，AutoUI 外部官方组件）：
  vue 轨 npm link 消费；vm 轨经 auto-lang `autodown_editor` 官方件位。

## 栈

| 面 | 形态 |
| --- | --- |
| 单源 | AutoUI widget/store DSL（`.at`；038/449 store 形态、013 组件纪律） |
| vm 轨 | `auto run -r vm`（auto-lang exe，解释渲染 iced） |
| vue 轨 | `auto build -r vue`（生成 Vue3+Vite 工程） |
| deps | bps = auto-lang blueprints（filetree）；stylekit = auto-edit specs |
| 后端 | 自有 `src/back`（Auto 写：api.at 契约 + wsys.at 实现；merged=进程内直调 / split·vue=HTTP / `--server` 运行期切引擎——PLAN-001 换基，supersede 外部 exe 复用） |

## 运行矩阵

前置：`auto.exe` 在 PATH 或 `AUTO_EXE` env（须含上游 669 `#[api]` 实参
装配修复 + 671 vue 生成器缺口批——补件链退役面；≥ v0.4.2-1652 构建，
本仓复验版 g055808724）；`pnpm install`（仓根，playwright）。
工作区根：`JADE_WORKSPACE` env（缺席 = AUTO_PROJECT_DIR = 工程目录）。

```sh
# —— vm 轨（默认 merged：back 进程内直调，零后端进程零端口）——
JADE_WORKSPACE=<工作区> auto run -r vm

# —— vm 轨 split（AutoVM HTTP 后端 + 前端窗，HTTP 往返）——
JADE_WORKSPACE=<工作区> auto run -r vm --no-merge

# —— 后端独立 serve（不开窗——vue dev / 联调用）——
node scripts/serve-back.mjs [--port 8211]     # auto run --server vm + 隔离 fixture + ws_root belt

# —— vue 轨（裸 strict 生成+三残余补件+install+build 一键；dev 需代理指向后端）——
pnpm build                          # = node scripts/regen-vue.mjs（补件链已随 671/646 退役）
AUTO_HTTP_PORT=8211 AUTO_FRONT_PORT=4181 pnpm --dir gen/front/vue dev

# —— 门（双轨一致性：vm 双臂矩阵 + vue build/e2e）——
node scripts/gate.mjs

# —— 测量套件（L0 代理：启动分解/首开冷热/换档/大文档/内存；SD-205）——
node tools/bench/bench.mjs check               # 依赖自检 + 环境指纹（工具链 ≥1652）
node tools/bench/bench.mjs proxy [--runs N]    # 测量 → results/<ts>.jsonl
node tools/bench/bench.mjs assert              # 存量 measurements × budgets 重评

# —— 单门 ——
node tests/vm_matrix.mjs            # 双臂（merged+split）检查单 + 基线 v9 零漂移
pnpm test:e2e                       # vue 检查单（同一检查单；serve-back 后端）
```

## Tests（判绿口径，SD-204；SD-304/403 扩定；SD-503 再扩定；SD-603 再扩定；SD-703 再扩定；SD-803 再扩定；SD-903 再扩定；SD-1003 再扩定）

检查单（PLAN-002 T-01 扩定 + PLAN-003 T-04 link 扩单 + PLAN-004 T-04
find 扩单 + PLAN-005 T-04 create 扩单 + PLAN-006 T-04 rename 扩单 +
PLAN-007 T-04 file 扩单 + PLAN-008 T-04 meta 扩单 + PLAN-009 T-04 mentions 扩单 +
PLAN-010 T-04 alias/linkify 扩单）：
`boot / tree / open / edit / save / reload` 六检查 + **tab / editops /
quit** 扩单三组 + **link / link-empty**（链接索引已知答案 + 反链面板双轨
可用 + 空态——CJK 路径导航子步仅 vm merged 臂，D-19）+ **create**（建页
弧线子步 10c：悬空行点击 → 确认弹层 → 取消零落盘 → 创建 → 落盘/链接
翻转/树新行/行翻转——CJK 开档播种子步仅 vm merged 臂[D-19 同款口径]；
e2e 弧线 = ASCII 悬空源档测试内造零语料改动）+ **find**（查找面板双模
式：快开[files]——input 锚/空 q 全量 5 行/过滤 Pro→Projects 独行/CJK
文件名定理→CAP 独行/拾取即关；全文检索[text]——未运行提示/CJK 查询
「任务列表」**POST 双臂**[D-19 面无]/行导航面板保持开/运行后空态；CJK
文件名拾取导航子步仅 vm merged 臂——D-19 同款口径）+ **rename**（重命
名七子步：入口禁用态[untitled+脏档——handler 守卫，D-24③]/弹层锚[预填
stem + 影响面预览 N 页 M 处]/取消零落盘/改名弧线[active 投影 + tab 更新
+ 磁盘改名 + 双页源文改写]/跨页改写可见[出链行新 stem + 点击导航新档 +
树新行]/case-only 拒[弹层留置 + casefold 计数断言]/状态复原——素材
Projects.ad ASCII 双臂[D-19 面无]；CJK 改名/自链/锚透传/清洗/冲突/
缺失案 = `tests/probe_rename.mjs` 八案双臂直证覆盖）+ **file**（树
文件管理八子步[PLAN-007]：新建 index[根落位——ASCII 双臂，模板逐字
节]/同名幂等[tab 不变 + 磁盘不变]/取消零落盘/CJK 新页[merged 导航 +
split 磁盘断言——D-19 口径]/删除预览 + 取消[「3 处入链将变为悬空」
已知答案——index/Tasks/Hello World 出链计数；tab 警示行两臂分叉
merged「1 个将关闭」/split「无打开标签页」]/删除弧线[磁盘消失 +
ft_sel 清空 + 激活邻档两臂异位——merged=同位保持→首页/split=active
不变[D-19 开档面]，RemoveAt 修正两形态互补]/悬空翻转[开 index 出链
行 CAP 定理（悬空）——PLAN-003 已知答案反向]/未选中 no-op——删除
素材 CAP 定理；e2e file 段 = 9 quit 后段内最后[vue 垫片 no-op 无进
程约束 + 删除素材 Hello World.ad 保 quit 三验面]，删除弧线走
Hello World.ad[ASCII 入链/出链面安全]；CJK 案 + no-op 案 vm 专属口
径；删除 back 面 CJK/幂等/三拒案 = `tests/probe_delete.mjs` 九案双
臂直证覆盖）+ **meta**（标签面板 + wanted 模式八子步[PLAN-008]：
tags 面板开 7 tag 行[语料实勘全集——执行期校正：Hello World.ad 实
有 demo]/展开导航 ASCII 双臂 + CJK 仅 merged 臂[D-19]/Save 刷新外
造新行；wanted 模式入口无 input 行/无检索钮/取消零落盘/创建开档+
消缺+exists 翻转/空态闭环「（无悬空链接）」——vm 位态 = 10c 后[悬
空余量 页面名（1）+ 外造 Wanted Target（1）]、e2e 位态 = 13 后[两行
已知答案 Hello World（3）+ 页面名（1）——两轨素材异位既有口径]；
wanted back 面零增量纯派生，tags_index 契约六案 = `tests/probe_tags
.mjs` 双臂直证覆盖[含 CRLF 形态 + depth 传递]）——vm 矩阵与 vue
e2e 同单（断言域 = 结构/文本/磁盘字节，非像素）。

- **完成态 = RESULT 行出现且两臂全数通过**：vm 矩阵 `merged 16/16 +
  split 15/15`（merged 多一项基线检查；link/meta 组子步扩——mentions
  子步入 link 组、inline 子步入 meta 组，组数不变，子步不占检查位）
  + ALL GREEN 行；vue e2e 十五段
  日志齐 + passed。无 RESULT 行 = 工具链竞态早崩 → **重跑一次而非排查**
  （auto-edit F-RV6 同款口径）。
- N 定谳（2026-09-22 link 扩单首锁 ≥5 连跑分布）：vm 双臂 **6/7 连跑
  全绿**（12+11 检查逐跑全过；1 次无 RESULT 行早崩，重跑即绿——F-R1
  同类口径）；vue e2e **5/5 连跑全绿**（注：紧邻 `pnpm build` 的同负载
  窗内竞态敏感——regen 后即跑属已知敏感窗，README 口径覆盖）。
  N = 全数，无失败集漂移。
- N 定谳（2026-09-22 find 扩单首锁，SD-403）：vm 双臂 **4/4 连跑全绿**
  （13+12 检查逐跑全过，零早崩零重试）；vue e2e **6/6 连跑全绿**
  （gate 内 1 + 复跑 1 + 留存连跑 4，14 PASS 行/跑；search_wiki POST
  200 实录）；D-21 负载窗零复现。N = 全数，无失败集漂移。
- N 定谳（2026-09-22 create 扩单首锁，SD-503）：vm 双臂 **4 连跑全绿**
  （v5 锁后 full run ×3 + gate 内 ×1，merged 13/13 + split 12/12 +
  基线 v5 零漂移逐跑）；vue e2e **6/6 连跑全绿**（gate 内 1 + 留存
  连跑 5，10c 建页弧线全过）；D-21 负载窗 **7 失败实录**（家族会话
  同机并行窗——write_wiki 保存点 400 丢参，重跑即绿，ledger v8 扩记）。
  N = 全数，无失败集漂移。
- N 定谳（2026-09-23 rename 扩单首锁，SD-603）：vm 双臂 **5 连跑全绿**
  （final×2 + gate 内 ×3，merged **14/14** + split **13/13** + 基线 v6
  零漂移逐跑；无-RESULT 早崩 2 次如实记——split 臂 check-2 树行超时
  [state=ready 而 ft_nodes 空，独占重跑即绿，D-21 v9 新形态]）；vue
  e2e 断言修正后 **24 跑 13 绿**（11 失败全数 D-21 签名[400 丢参 ×9 +
  ECONNRESET ×2，check-5/quit 保存点]，重跑即绿，最长连绿 4；隔离
  serve-back 连发 write_wiki **50/50** 实证 = 400 仅 vite 代理 e2e
  语境突发簇——D-21 v9 扩记）；gate **第 3 跑 ALL GREEN**（前 2 跑
  e2e 段 D-21 失败如实记）。rename 组零失败漂移。
- N 定谳（2026-09-23 file 扩单首锁，SD-703）：vm 双臂 **4 连跑全绿**
  （merged 15/15 + split 14/14 + 基线 v7 零漂移逐跑——v7 锁后连跑
  ×3 + gate 内 ×1）；vue e2e 绿（gate 内 + 复跑；T-03 窗 check-10
  面板行断言 1 败 + T-04 窗 save 磁盘标记失败点漂移 1 轮 + HTTP 400
  瞬时 pageerror 1 例全数 D-21 签名重跑即绿，ledger v10 扩记）；
  **gate ALL GREEN 一次通过**。file 组零失败漂移。
- N 定谳（2026-09-23 meta 扩单首锁，SD-803）：vm 双臂矩阵 **3 轮连跑
  全绿**（merged **16/16** + split **15/15** + 基线 v8 零漂移逐跑
  ——v8 锁后独立跑 ≥4 + gate 内矩阵段 7 连绿；执行窗 1 次进程死亡
  [meta 组轮询 ECONNREFUSED] + 1 次 check-10 面板行渲染窗瞬态
  [bl_rows 在态快照滞后] + split 臂 menubar popover 内容窗瞬态 2 次
  [T-01 回归窗]，全数重跑即绿，ledger v11 扩记）；vue e2e **窗口
  23 跑 8 绿**（PLAN-006 同款如实记：失败全数 **check-5 保存点 D-21
  签名**[400 missing param `path` api-err-body 两次实锤——POST 先于
  刷新 GETs 非新增 fetch 所致]，重跑即绿，最长连绿 3；meta 段自身
  每轮达即 PASS）；**gate 第 8 跑 ALL GREEN**（前 7 跑败点如实记：
  e2e 段 D-21 ×6 + 矩阵段瞬态 ×1）。meta 组零失败漂移。
- N 定谳（2026-09-23 PLAN-009 T-04，SD-903）：vm 双臂 **ALL GREEN ×2
  连续**（判绿跑 merged **16/16** + split **15/15** + 基线 v9 零漂移
  逐跑——前置窗 3 形态[popover 内容窗/check-10 行渲染窗/tags 7 行
  渲染窗]全数 D-21 签名重跑即绿，ledger v12 扩记）+ e2e **5 连绿**
  （25-42s/跑；前序两轮 5/5 败为子步实勘期真 bug 迭代——vue 排重
  竞态[D-26②]与 e2e 收口态复原两案，修复后 5/5 绿，非 D-21 签名）
  + **gate 首跑 ALL GREEN**；mentions 子步入 link 组、inline 子步入
  meta 组——组数不变 16/15，子步不占检查位。
- N 定谳（2026-09-23 PLAN-010 T-04，SD-1003）：vm 双臂 **ALL GREEN**
  （判绿跑 merged **16/16** + split **15/15** + 基线 v9 零漂移逐跑——snapshot
  146 -> 149 节点因上游 auto-lang PLAN-089 `7183ca386` MouseArea 展开所致，
  store 状态段 100% 逐字节零模型漂移重锁）+ e2e **15 段全绿**（linkify 提及
  转链 + alias 别名解析双子步全通；D-21 write_wiki 400 丢参重跑即绿）+
  **gate ALL GREEN**；linkify 子步与 alias 子步均入 link 组——组数保持 16/15，
  子步不占检查位。
- 结构基线 = `tests/baseline/structure-v9.txt`：state 段逐字节 +
  snapshot vnode id 出现序列（v2 仪器延续；v9 = PLAN-009 App 模型新增
  mention_rows 入 dump，PLAN-010 维持零模型字段漂移，快照 146→149 节点
  由上游 MouseArea 展开重锁；v8/v7/v6/v5/v4/v3/v2/v1/v0 留档）。

## 文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 架构定版（SD-01：双轨机制 /
  013 形态消费面 + C-1..C-6 双轨硬约束 / 后端复用 / 测试体系 / 纪律）
- [plans/attachments/081-t00-rulings.md](plans/attachments/081-t00-rulings.md) —
  T-00 三勘定决策档（auto-down PLAN-081 附件；双轨机制 / actions-vue
  现状 / 后端选型）
- [parity-ledger.md](parity-ledger.md) — 双轨差异登记表 v13（SD-1004 指针；二十七项三分类；PLAN-009 增补 ledger v12；PLAN-010 增补 D-27[别名与转为链接切片实勘集]+D-21 v13 扩记）
- [upstream/2026-09-jade-supply.md](upstream/2026-09-jade-supply.md) —
  上游供料包（D-16 预热 / D-15 残余 / D-17 键入发射 / D-18 投影双态，
  期望形态+复验条件+回执方式）

## 计划

PLAN-081（bootstrap）+ PLAN-001（换基自有 back）已交付归档——后者见
[plans/archived/001-jade-edit-rebase-autoedit.md](plans/archived/001-jade-edit-rebase-autoedit.md)；
PLAN-081 本体在 auto-down 主检出 `docs/plans/081-jade-edit-bootstrap.md`。
