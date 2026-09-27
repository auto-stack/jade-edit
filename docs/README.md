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
  epoch-only，供料候选 ledger v12）；**第九切片 = 页面属性写面**（SD-1101，
  2026-09-23）：**D-14 受控裁决落地**——frontmatter 受控写首开（008/010 读面的写面
  兑现闭环）：仅 tags/aliases 两键改写/其余键逐字节直通/空值删键/无 frontmatter
  增建/CRLF 保真/幂等（写引擎五步+fm_set_block 界符族第四件）；page_meta GET+
  set_page_meta POST 双契约；属性弹层 dialog 第六实例（Ctrl+I 双 input 预填回显→
  保存→自派生刷新族）；**第十切片 = 目录面 + 检索 alias**（SD-1201，
  2026-09-24）：EXPLORER「⊕」新建目录 + Ctrl+Shift+M/菜单「移动到目录…」
  （弹层预填/placeholder 全走 ft_nodes 本地派生——零 fetch 预填，D-28②
  竞态窗规避在册形态；create_dir/move_page POST 双契约——清洗复用/幂等/
  is_dir 双复核/五步迁移 read+write+delete 组合）；**移动语义三联对照
  并表**：改名=stem 变⇒改写入链 / **移动=stem 不变⇒零改写零断链**（链
  接面纯 stem 解析对目录结构无感——组织自由度保证）/ 删除=档消⇒悬空；
  检索 title 面扩 = stem ∪ aliases（alias-title-only → snippet=""——
  alias 数据流最后消费缺口收口）；**第十一切片 = 显示名**（SD-1301，
  2026-09-24）：frontmatter `title` 消费首开 + 属性弹层 title 编辑——
  中文工作流件套收口（aliases 解决「怎么链接它」、title 解决「怎么显示
  它」）；**两域边界定文**：解析域 title 不进任何匹配面（`[[首页]]`
  解析/检索 title 面 stem∪aliases 恒定——title 编辑零链接扰动）、显示
  域 title = 显示名（有 title 显 title、无 title 显 stem——back links_json
  增量字段 dtitle 缺省=stem 装配定值）；显示面四面（tab/树/快开/检索
  ——titles 表随链接索引刷新顺产，显示期纯函数覆盖，store 零状态面）；
  page_meta/set_page_meta 三键扩（**契约签名扩参首例** path,title,tags,
  aliases——probe 旧案全量回归承载不破旧）；属性弹层第三 input「标题」
  位首（预填三值→保存→四面即时刷新）；改名/移动不改 title（改名显示
  恒等/移动 titles 重键）；**第十二切片 = 目录面二期 + 面板行显示名化**
  （SD-1401，2026-09-24）：**目录生命周期收口**——Shift+Delete/菜单
  「删除目录…」（弹层目标 input 口径——ft_sel 不扩树行零结构改动；
  **强确认双防线**「将删除目录 X 及 N 个文件（M 个 .ad 页）」+「N 处
  入链将变为悬空」本地派生预览）→ delete_dir POST（remove_dir_all
  递归 + 双复核——probe C 定谳）→ 目录下 tab 全关（CloseTabsOf 循环
  零新 store 面）+ **入链悬空化**（SD-701 目录级）；Ctrl+Shift+R/
  菜单「重命名目录…」（双 input 弹层——目标+新名，预览「将移动 N 个
  .ad 页（链接零改写）」）→ rename_dir POST（纯 .ad 目录卫 + 逐文件
  迁移单事务 + 嵌套镜像/逆序清理 + casefold 同判拒——**stem 不变链接
  零改写，三联对照目录级**：改名目录=零改写/删除目录=悬空化/移动=
  零改写并表）；**面板行显示名化**（013 §10.1 留口兑现）——反链行/
  提及行 = dtitle_of 显示名（无 title 显 stem——back 缺省装配定值，
  回落 path 仅 stale 面），出链/wanted 恒链接文本（显示即语义定文）；
  **第十三切片 = 上游解锁兑现批**（SD-1501，2026-09-25）：三原语同窗
  解锁的集中收割——**HTTP 回执**（PLAN-699 Axum/Hyper 传输下 D-19
  复核 = **负结果如实判**：percent-decode 在册但 url_decode byte-as-char
  不组 UTF-8，CJK GET 仍败——缺口精化「解码不组 UTF-8」，矩阵 CJK
  导航子步维持「仅 merged 臂」注记；D-21 新传输负载窗丢参/进程死亡
  零复现——留观续）+ **每日笔记**（Time 解锁兑现——Ctrl+Alt+N/菜单
  「今日笔记」/工具栏 calendar 钮 → daily_note POST[yyyy_MM_dd stem
  幂等建档/模板 created_at+updated_at 双时间戳首写/`# yyyy-MM-dd` body
  /旧日档不动——Date 原语 back 侧独占消费，front 零 Date 面]）+
  **updated_at 自动维护**（D-14 受控面续：write_body 保存流对已有
  updated_at 键的档自动更新值[语料同形 yyyy-MM-ddTHH:mm:ss，Z 形归一；
  仅补已有键/无键零引入/新建档零涉/CRLF \r 继承/顶层级卫——系统维护
  键不可经属性弹层编辑]）+ **行:列定谳**（探针 E 负结果：oncursor 在
  code_editor 非本仓消费的 autodown_editor、vue EngineEditor 亦无
  cursor emit——D-12「行:列降级」处置维持，供料候选扩面
  [autodown_editor oncursor/anchor-reveal 双件]）；**第十四切片 = 回收站**
  （SD-1601，2026-09-25）：`.trash/` 工作区回收站——delete_page/
  delete_dir **改道移入**（保结构镜像 + 冲突 `--{n}` 后缀；**删除语义
  四面表并表**：悬空化/改写/零改写不变 + 删除=移出工作区+副本保留——
  点前缀目录 walk 自动忽略[一手源实勘]，工作区行为与硬删逐字节等价）
  + trash_list/trash_restore/trash_purge 三契约（恢复 = 悬空自愈反向
  闭环——删除→悬空→恢复→翻转回）+ find·trash 第四模式（Ctrl+Shift+T
  ——清单/行恢复/清空强确认/空态）+ **probe 端口自动避让**（pick_port
  ——WinNAT 漂移三笔环境账收口，固定常量清零）；
  **第十五切片 = casefold+词边界**（SD-1701，2026-09-25）：链接解析
  三期收口——**精确[003]→别名[010]→casefold[本批]**：①**解析四级
  序**（stem 精确→alias 精确→stem casefold→alias casefold；级间严格
  有序=精确优先于 walk 序；CJK 恒等零影响——中文知识库逐字节不变；
  消费面单点全量生效——`[[hello world]]` → Hello World.ad 语料现成
  答案）+ ②**case-only 改名解锁**（006 G3 裁决翻转——四级序下改
  casing 即改精确档命中；两步临时名迁移 `{stem}--cftmp-{n}` 绕行
  Windows 同档 casing 翻转 + 改写器四级匹配面——`[[old]]` 变体随
  改名改写）+ ③**linkify 词边界**（纯 ASCII stem 双侧 62 集
  A-Za-z0-9 判定——`CAP` 不再误中 `CAPTURE`；`_`/`-` 豁免不阻断；
  CJK 恒子串定文）+ ④**Windows 同档边界定谳并账**（005/006/012 三处
  挂账——create 幂等 exists 卫天然正确/检索已 casefold 零变化）；
  零新契约/零新 UI 形态/**零重锁第二例**（基线 v15 不动——纯 back
  语义扩容）；
  **第十六切片 = 目录移动 + 上量微批**（SD-1801，2026-09-26）：
  **工作区三部曲收官**——档（建/移/删/改名）与目录（建/删/改名/
  移动[本批]）全操作面补齐：①**`move_dir` POST 契约**（五卫定文：
  循环卫[移入自身/后代拒]/合并拒[目标同名拒——目录合并不做 v1]/
  纯 .ad/同父幂等/.trash 域卫[执行期加护]；单事务逐文件 + **stem
  不变 ⇒ 链接零改写**——三联对照移动级）+ front 弹层双 input（
  源/目标父——无快捷键 M 族避让）；②**StringBuilder 装配**（探针 F
  定谳 natives 160-167 族可调 → 三索引+双 JSON 装配段 O(P²)→O(n)，
  逐字节零漂移——PLAN-003/004 上量挂账兑现；**500 档实勘 VM 字符串
  池值损坏→上游域 ledger D-35，稳定域 P ≤ 200**）；③**depth 8 统一**
  （五面调用点 4→8——深目录覆盖收窄收口，语料 flat 零漂移）；基线
  **v16 重锁**（movedir 弹层/开态/双字段入 dump）；
  **第十七切片 = 目录合并 + trash 增强**（SD-1901，2026-09-27）：
  **工作区收尾批**——018/016 两处 r2 留口同批清账：①**目录合并**（
  `move_dir` 扩参 merge[013 签名扩参先例二]——目标同名目录并入，冲突
  档 `--{n}` 后缀保双份[零数据丢失默认]；循环卫先于合并/文件占位仍拒
  /`.trash` 域卫双面直证[F-R18-1 闭账]；front 弹层预览行+「合并移动」
  条件钮[探针 G 定谳双钮变体——checkbox 生成器双写缺陷降级]；无冲突
  merge=true=纯移动语义）+ ②**trash 增强**（「恢复全部」front 循环
  restore+末次三刷 + 行点击预览开档[.trash 路径 read_wiki 直读不入
  索引——可编辑口径：保存落回 .trash 原位]）；**F-R17-1 gate 第三批
  维持留观**+**D-35② 复测负结果维持**[新 exe split N=500 仍坏——
  整数 500 形态变体]；基线 **v17 重锁**（合并弹层扩面/trash 行按钮
  化入 dump+id 序列）；
  **第十八切片 = 孤页清单 + 最近打开**（SD-2001，2026-09-27）：
  **知识健康与快速访问收割批**——池内可立项件已尽后的首片池外双件，
  **纯 front 派生零 back 增量**（007/008 收割批同判）：①**孤页清单**
  （find 第五模式 orphans——Ctrl+Shift+O/菜单「孤页清单」：完全孤岛
  页 = 严格双零[零入链 resolved 面+零出链——悬空链接计入出链度]，
  link_pages 纯派生随 LinksRefreshOf 顺产，行点击开档+空态；**图谱
  孤点的清单替代形态**——写了没人链、也没链别人的失落页发现面）+
  ②**最近打开**（快开空 q 双态——Obsidian 快速切换器同款：空 q 有
  记录显「最近」段[会话域 App 态，头插去重容量 10，开档触点追踪，重
  命名/移动旧键置换]；无记录/有输入现状不变；**持久化不做** v1 留
  口）；005「空 q 全量」断言计划内修订（recents 替换面+首跑无记录
  全量面双载）；**§10.5 建议：本片后进入试用驱动阶段**（池外推测 >
  试用反馈——PLAN-021+ 以真实工作区反馈驱动）；基线 **v18 重锁**（
  orphan_rows/recent_paths 入 dump+第五模式 chrome 入 id 序列——str
  清单 dump 直出字符串新观测面）；
  **第八切片 = 别名解析 + 提及转链接**（SD-1001，
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
装配修复 + 671 vue 生成器缺口批——补件链退役面；**≥ v0.4.2-2125 构建**
[PLAN-699 Axum/Hyper HTTP 传输 + PLAN-413 code_editor 事件族在册——
本仓 PLAN-015 复验版 g63e14b045]）；**2026-09-25 家族重建窗注记**：
auto-lang 双 exe 中间态（debug 全量 vue gen 自旋 / 新 release deps
select prop schema drift + vm 矩阵不稳）——分段路由判绿口径见
parity-ledger D-21 v20（build 段 `SCHEMA_DRIFT_GENERATE_AT=1` 生成
通道）；`pnpm install`（仓根，playwright）。
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
node tests/vm_matrix.mjs            # 双臂（merged+split）检查单 + 基线 v18 零漂移
pnpm test:e2e                       # vue 检查单（同一检查单；serve-back 后端）
```

## Tests（判绿口径，SD-204；SD-304/403 扩定；SD-503 再扩定；SD-603 再扩定；SD-703 再扩定；SD-803 再扩定；SD-903 再扩定；SD-1003 再扩定；SD-1103 再扩定；SD-1203 再扩定；SD-1303 再扩定；SD-1403 再扩定；SD-1503 再扩定；SD-1603 再扩定；SD-1703 再扩定；SD-1803 再扩定；SD-1903 再扩定；SD-2003 再扩定）

检查单（PLAN-002 T-01 扩定 + PLAN-003 T-04 link 扩单 + PLAN-004 T-04
find 扩单 + PLAN-005 T-04 create 扩单 + PLAN-006 T-04 rename 扩单 +
PLAN-007 T-04 file 扩单 + PLAN-008 T-04 meta 扩单 + PLAN-009 T-04 mentions 扩单 +
PLAN-010 T-04 alias/linkify 扩单 + PLAN-011 T-04 meta 属性扩单 + PLAN-012
T-04 目录面/alias 检索扩单 + PLAN-013 T-04 显示名扩单 + PLAN-014 T-04
面板行名化/目录二期扩单 + PLAN-015 T-05 daily/updated_at 扩单 + PLAN-016 T-04 trash 模式/改道恢复扩单 + PLAN-017 T-04 四级解析/词边界/case-only 弧线扩单 + PLAN-018 T-04 目录移动/depth 8 扩单 + PLAN-019 T-04 目录合并/trash 增强扩单 + PLAN-020 T-04 orphans/recents 扩单）：
`boot / tree / open / edit / save / reload` 六检查 + **tab / editops /
quit** 扩单三组 + **link / link-empty**（链接索引已知答案 + 反链面板双轨
可用 + 空态——CJK 路径导航子步仅 vm merged 臂，D-19）+ **create**（建页
弧线子步 10c：悬空行点击 → 确认弹层 → 取消零落盘 → 创建 → 落盘/链接
翻转/树新行/行翻转——CJK 开档播种子步仅 vm merged 臂[D-19 同款口径]；
e2e 弧线 = ASCII 悬空源档测试内造零语料改动）+ **find**（查找面板双模
式：快开[files]——input 锚/空 q 全量 5 行/过滤 Pro→Projects 独行/CJK
文件名定理→CAP 独行/拾取即关；全文检索[text]——未运行提示/CJK 查询
「任务列表」**POST 双臂**[D-19 面无]/行导航面板保持开/运行后空态；CJK
文件名拾取导航子步仅 vm merged 臂——D-19 同款口径；**alias 检索子步
[PLAN-012]：内造 alias 档 → 搜「检别名」→ AliasTgt.ad 命中行 → 拾取开
档双臂——title=stem 口径 = `tests/probe_dir_move.mjs` 直证面**；**PLAN-020 ⑧⑨**：空 q 断言修订[005「全量 5 行」→ recents 替换面——累积位态「最近」段；首跑无记录全量面 = T-02 冒烟一次性件承载]+⑧ orphans 第五模式[无 input 负向面+fs 造纯孤页档入列→行点击开档→造链清孤→悬空出链计入出链度——resolved 面直证]+⑨ recents 弧线[清 q→「最近」段→3 开逆序→拾取即关→去重置顶→容量截断 RecCap×12→10 行]**）+ **rename**（重命
名七子步：入口禁用态[untitled+脏档——handler 守卫，D-24③]/弹层锚[预填
stem + 影响面预览 N 页 M 处]/取消零落盘/改名弧线[active 投影 + tab 更新
+ 磁盘改名 + 双页源文改写]/跨页改写可见[出链行新 stem + 点击导航新档 +
树新行]/case-only 弧线[PLAN-017 裁决翻转：Project X → project x **成功**——casing 翻转 readdir 实名 + 回翻双向 + 无 --cftmp- 残留——006「case-only 拒」子步随 SD-1701 改弧线]/状态复原——素材
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
臂直证覆盖；**目录面四子步[PLAN-012]：⊕ 新建目录[树新行+磁盘在]/
移动弧线[弹层预填=源档现目录本地派生 + tab 题全量 + 字节整迁 +
**面板快照/links_json 定向 diff 零扰动**——移动 stem 不变零改写三联
语义固化]/取消零落盘/冲突拒弹层留置——目录面八案 + 检索 alias 三案
= `tests/probe_dir_move.mjs` 双臂直证覆盖；vm 素材 ASCII 双臂 + e2e
CJK 目录名（收件箱——POST 双臂面）+ placeholder 动态绑定首证**）+
**显示名四面跨组子步[PLAN-013]**：树行/tab/快开/检索行显示名覆盖[有
title 显 title、无 title 显 stem——back dtitle 缺省=stem 装配定值]；
meta 组 **title 弧线四断言**[预填 title 位首/改写磁盘 title 行受控
diff 仅 title 行+树行显示即时刷新/清空删键回 stem 显示/双臂目标页异
位 merged=CAP 定理/split=Tasks]；12 rename 组 **改名显示不变语义面**
[Project X stale title 'Projects'——SD-1301 联动定文固化]；dtitle 增
量面 + 两域边界并证[dtitle=首页 在册而 [[首页]] 仍悬空] =
`tests/probe_alias_linkify.mjs` ⑪ 案组直证；probe_page_meta title 面
五案[011 十案全量回归承载契约扩不破旧]）+ **面板行名化/目录二期
[PLAN-014]**：link 组 **反链三源显示名断言**[首页/CAP 定理/Tasks——
面板区锚族；无 title 源档 stem 形态——10m/alias/F-R9-4 行；出链/
wanted 恒链接文本非退化并证——12⑤ 'Project X' 非 'Projects'+14⑤
wanted label]；file 组 **目录二期三子步**[重命名目录弧线[双 input 弹
层/预览「将移动 1 个 .ad 页（链接零改写）」/tab 全量路径变标题恒/
磁盘整迁/面板零变化/links_json 归一 diff——三联对照目录级]/取消零
落盘两形/删除目录弧线[强确认预览计数+悬空警示 → tab 全关计数-1+树
行消[explorer 区锚]+悬空翻转 Project X（悬空）——SD-701 目录级]；
键程 = menubar 共口先例；dir ops 双契约十三案 + 嵌套案 + 链接零扰动
归一 diff = `tests/probe_dir_ops.mjs` 双臂直证覆盖（probe C 定谳件
——remove_dir 族可调）] + **daily/updated_at [PLAN-015]**：check 5
**updated_at 维护断言**[已有键保存即更新值——当日形 yyyy-MM-ddTHH:mm:ss
正证 + title/status/summary 逐字节；受影响档盘点 = fixture 五档全带
updated_at 键，其余磁盘断言均 presence 形不受扰]；file 组 **⑰ 今日笔记
弧线**[工具栏/菜单共口 → 开档[active_title=yyyy_MM_dd + body # 当日]→
树新行[explorer 区锚]→ 磁盘 created_at/updated_at 双时间戳[当日动态
格式断言]→ 重入幂等[tab 数不变]；Date 原语 back 直证 + daily_note 四案
+ updated_at 四形态[Z 形归一/零引入/CRLF \r 继承/顶层级卫] =
`tests/probe_daily.mjs` 双臂十四案直证；**D-19 回执 = 负结果**[新传输
percent-decode 在册但 byte-as-char 不组 UTF-8——CJK 导航子步维持
「仅 merged 臂」注记，`tests/probe_receipt_d19.mjs` 四案实录]] + **meta**（标签面板 + wanted 模式八子步[PLAN-008]：
tags 面板开 7 tag 行[语料实勘全集——执行期校正：Hello World.ad 实
有 demo]/展开导航 ASCII 双臂 + CJK 仅 merged 臂[D-19]/Save 刷新外
造新行；wanted 模式入口无 input 行/无检索钮/取消零落盘/创建开档+
消缺+exists 翻转/空态闭环「（无悬空链接）」——vm 位态 = 10c 后[悬
空余量 页面名（1）+ 外造 Wanted Target（1）]、e2e 位态 = 13 后[两行
已知答案 Hello World（3）+ 页面名（1）——两轨素材异位既有口径]；
wanted back 面零增量纯派生，tags_index 契约六案 = `tests/probe_tags
.mjs` 双臂直证覆盖[含 CRLF 形态 + depth 传递]）+ **trash 模式/改道
恢复弧线子步 [PLAN-016]**：find 组 ⑥[＋新建 TrashMe→菜单删除[删除
弹层文案「将移入回收站」断言——AC-03 + 改道磁盘面 .trash/TrashMe
.ad]→文件→回收站[第四模式——Ctrl+Shift+T/menubar 共口]→清单行→
清空回收站→强确认弹层[M=1 派生+取消留置零落盘]→清空→空态闭环+
磁盘 .trash 消——双臂同跑]；file 组 ⑱[⑥ 删除弧线的 CAP 定理在
.trash→回收站模式→清单见条目→行恢复→空态+磁盘回+exists 翻转回
双向态[悬空自愈——SD-1601]→树行回→merged tab 重开[CJK 树行开档
D-19 口径 split 以 ft_sel/磁盘/links_json 承载]]；⑮ 入链已知答案
1→2[⑱ 恢复 CAP 连带——其 12 步改写 [[Project X]] 回归链接面——
014 双防线语义不变]）+ **trash 增强/目录合并子步 [PLAN-019]**：
find 组 ⑦[双条目清单→行点击预览[.trash 路径 tab 开 active_title=
.trash/TrashR1+树不可见——EXPLORER 区子树扫描]→保存落回 .trash
原位[磁盘标记直证——可编辑口径 SD-1901]→恢复全部[循环 restore→
清单空态+磁盘双档回根字节保真——建一删一双弧线]]；file 组 ㉓[
MgA→MgB 同名对 弹层双 input→预览行现文+「合并移动」钮显[探针 G
定谳双钮变体]→磁盘并入 靶原档逐字节不变+源档字节整迁+源目录消+
tab 全量+links_json 归一 diff/不合并拒径回归[「移动」钮→弹层留置
+磁盘零变化]——e2e 素材 API 前置 daily 前[⑰ 树新鲜度承载]交互
后置]；merge back 九案[含 F-R18-1 .trash 域卫双面直证闭账/冲突
后缀保双份/无冲突链接零扰动] = `tests/probe_dir_ops.mjs` 双臂
直证覆盖（mb①..mb⑨）+ **四级解析/词边界子步 [PLAN-017]**：link 组
10m ⑦[外造 CF Navigate.ad 含 `[[hello world]]` 小写变体链——③级
stem casefold 命中 → 反链段新行 → 行点击开档 → 出链行 hello world
非悬空[SD-1401 恒 target 文本]→ 点击导航落 Hello World.ad +
links_json target_path 直证——ASCII 双臂]；⑧[外造 Mention D 三态体
Hello WorldX/xHello World/Hello World 并置 → 转为链接 → **磁盘逐字节
仅独立位包裹**[双侧邻接透传——词边界直证]+ D 行消[页级已链源排重]
——ASCII 双臂]；解析四级序七案/级间序两证/pristine 基线零漂移 =
`tests/probe_casefold.mjs` 双臂直证；case-only 两步迁移 + 变体改写
+ 全等拒 = `tests/probe_rename.mjs` ⑧/⑧b；词边界五案 = `tests/
probe_alias_linkify.mjs` ⑪..⑮——vm 矩阵与 vue
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
- N 定谳（2026-09-24 PLAN-012 T-04，SD-1203）：vm 双臂 **ALL GREEN ×多轮**
  （判绿跑 merged **16/16** + split **15/15** + 基线 **v11** 零漂移逐跑
  ——v11 锁后独立连跑 ×2 零漂移确认 + gate 内 ×2；file 组目录面四子步 +
  find 组 alias 子步全通——移动零扰动三联语义断言[面板快照逐字节 +
  links_json 定向 diff 归一]固化在案）+ e2e **11 跑 3 绿**（败点全数
  D-21 签名——quit/check-5 保存点 400 missing param `path` + serve-back
  ECONNRESET/HTTP 500 死亡形态；**连跑簇内 7 连中实录**[冷却 90s 后仍中
  1 例]——与本窗口家族负载正相关，清卫前置[僵尸 auto.exe 清杀]后孤立
  跑即绿 ×3；目录面/alias 子步自身零失败漂移）+ **gate 3 跑 ALL GREEN**
  （第 1 跑 e2e 保存点 D-21、第 2 跑 vue-build 负载窗 0xC0000409 家族、
  第 3 跑全过——败点如实记）；file/find 组子步扩——组数不变 16/15/十五段，
  子步不占检查位。
- N 定谳（2026-09-24 PLAN-013 T-04，SD-1303）：vm 双臂 **ALL GREEN ×多轮**
  （判绿跑 merged **16/16** + split **15/15** + 基线 **v12** 零漂移逐跑
  ——v12 锁后独立连跑多轮零漂移；显示名四面跨组子步 + meta title 弧线 +
  改名显示不变语义面全通——执行期校正两件在案[stem 显示口径=G1 落定/
  D-30 gen 参数名阴影]）+ e2e **窗口 6 跑**：前 3 败为本批真 bug 三件
  迭代[dtitle_of 参数名阴影→树空[D-30]/严格模式碰撞→面板区锚/弹层重开
  缺失]，修复后 3 败全数 **D-21 保存点 400 签名**[api-err-body 实锤；
  家族会话双进程 release+debug auto.exe 并行负载窗实勘]——e2e 判绿 +
  gate ALL GREEN **挂外部条件**[D-21 负载窗 + 工具链 schema drift：家族
  11:27 重建 auto-lang debug exe 新严格校验 deps/bps reference 档
  [D-27① 实锤，依赖面阻塞非本片代码]——重跑口径如实记，T-05 收口窗
  终验]；vm 矩阵判绿域内零失败漂移。
- N 定谳（2026-09-24 PLAN-014 T-04，SD-1403）：vm 双臂 **ALL GREEN
  一次通过**（判绿跑 merged **16/16** + split **15/15** + 基线 **v13**
  零漂移 2 跑——v13 锁后独立跑 + gate 内矩阵段；merged 首锁窗 15/15
  ×2 + 基线锁后 16/16 ×2；vm 首摇期测试锚校正三件如实记[同名钮标题
  锚/树展开态自适应/闭态 input value 投影 explorer 区锚——均测试面
  非产品 bug]）+ e2e **5 绿**（窗口 6 跑：首轮 ⑮ getByText 弹层标题
  断言 **strict 竞态** 1 败[标题/描述/预览三元素命中——heading 角色
  锚修复，**非产品 bug**——最小回放 + ⑭→⑮ 全弧线回放双 probe 证
  cancel 语义健康] + **vue 轨真 bug 一件实勘修复**[split_once 无
  ts_adapter 映射裸发射 TypeError——pageerror 实勘，rel_under 改整
  前缀 split 等价通道，ledger D-31]后连绿）+ **gate ALL GREEN 首锁
  一次通过** + probe 全族九件 fresh 绿（back 改后首跑——013 教训
  兑现）。file/link 组零失败漂移，组数不变 16/15/十五段。
- N 定谳（2026-09-25 PLAN-015 T-05，SD-1503）：vm 双臂 **ALL GREEN ×多轮**
  （判绿跑 merged **16/16** + split **15/15** + 基线 **v14** 零漂移逐跑
  ——v14 锁后独立跑 + gate 内矩阵段连过；check 5 updated_at 维护 +
  file 组 ⑰ 今日笔记弧线双臂全通）+ e2e **十五段全绿**（daily 弧线
  D-23② 渲染文断言口径执行期校正 1 轮——`# ` 标记符不落 DOM 非产品
  bug；**新传输[D-21 观测窗]负载实录：HTTP 丢参/进程死亡零复现**——
  e2e 全绿 2 轮 + gate 矩阵段连过 + probe 全族双臂；败点 = split menubar
  popover 内容窗 1 例[v11③ UI 渲染节拍家族签名，重跑即绿] + vue-build
  负载窗 gen-only exit 1 一例[0xC0000409 家族，独占重跑绿]）+ **gate
  3 跑 1 绿**（第 1 跑 vm 段败[输出过滤失当败点未留痕，非判绿跑]、
  第 2 跑 build 段 0xC0000409 家族、第 3 跑 ALL GREEN——如实记）+
  probe 全族十一件 fresh 绿（back 改后首跑——013 教训兑现）。file 组
  零失败漂移，组数不变 16/15/十五段。
- N 定谳（2026-09-25 PLAN-016 T-04，SD-1603）：vm 双臂 **ALL GREEN ×多轮**
  （判绿跑 merged **16/16** + split **15/15** + 基线 **v15** 零漂移逐跑
  ——v15 锁后独立跑 + gate 内矩阵段连过；find 组 ⑥ trash 模式子步 +
  file 组 ⑱ 改道/恢复弧线双臂全通；⑮ 入链已知答案 1→2 连带如实记）
  + e2e 十五段全绿（41.4s；trash 全弧+恢复弧自育素材 TrashSrc/TrashMe
  [14 已知答案域不复用 13 删除素材——执行期口径]；败点 = 子步实勘期
  真窗迭代[树行 stem 定位/多行恢复钮行域/同名收起 strict/tab 位态三
  还原——测试面非产品 bug]）+ **gate ALL GREEN**（vm 双臂 + build +
  e2e）+ probe 全族 11 件 fresh 绿 + D-19 回执负结果复现一致[g①=0/
  g② len=0——SD-1501 定谳面] + probe_rename 先在缺陷归一修复实录
  （b64794a 复现同败非本批引入——updated_at 维护键语义面）。file/find
  组零失败漂移，组数不变 16/15/十五段。
- N 定谳（2026-09-25 PLAN-017 T-04，SD-1703）：vm 双臂 **ALL GREEN ×多轮**
  （判绿跑 merged **16/16** + split **15/15** + 基线 **v15** 零漂移逐跑——
  **零重锁第二例实录**[纯 back 语义扩容：store/App 零新字段，dump 零新
  字段断言随零漂移现跑兑现]；link 组 ⑦ 四级解析导航 + ⑧ 提及转链词
  边界 + rename 组 case-only 弧线双臂全通；⑧ 三态体首跑实录 T-03 首版
  左界败形[D-34①——str .length=字符数 vs char_at=字节索引实测定谳，
  last_char_cp 修复]）+ e2e 十五段全绿 **5 连绿**（43.8-44.2s；前 2 跑
  = 断言口径迭代[DOM 渲染文/read_wiki JSON 壳——D-23③ 家族]非产品
  败形）+ vue build 绿[**工具链家族重建窗环境路由**：AUTO_EXE=release
  [17:58 家族重建]+SCHEMA_DRIFT_GENERATE_AT=1——debug exe 对全量输入
  gen 满核自旋、release 对 deps select prop 打 schema drift 且 vm 矩阵
  split 臂不稳——唯一全过的旧 release g63e14b045 已被覆盖；**单命令
  gate 待家族工具链稳定窗复核**（PLAN-013 v16 先例原样——分段判绿
  在案：矩阵[debug]多轮 + build[release+drift] + e2e[debug] 5 连绿，
  ledger D-21 v20 扩记）] + probe 全族 13 件复跑：12 件 RESULT 全绿
  （含 probe_casefold 新增）+ probe_receipt_d19 负结果复现一致（D-19
  维持原样）。link/rename 组零失败漂移，组数不变 16/15/十五段。
- N 定谳（2026-09-26 PLAN-018 T-04，SD-1803）：vm 双臂 **ALL GREEN**
  （判绿跑 merged **16/16** + split **15/15** + 基线 **v16** 零漂移——
  计划内重锁后即跑全绿；file 组目录移动四子步双臂全通[移动弧线/
  取消/循环卫拒/5 层深档快开命中——depth 8 收口]；deep 案首跑实录
  断言口径迭代[行标签 dtitle 优先于 path fallback——测试面 1 轮非产品
  败形]）+ e2e 十五段全绿 **5 连绿**（46.9-48.9s；13 dir3 同弧线三子步
  含）+ vue build 绿 ×2[release 路由——家族重建窗延续口径同 017] +
  **F-R17-1 gate 单命令复核实录 = 维持留观**（裸 `node scripts/gate.mjs`
  build 段 debug exe gen 满核自旋[717 CPU 秒/12min 墙钟实锚]——exe
  时间戳 09-25 未变即家族稳定窗未至，D-21 v21 扩记；分段路由判绿在案）
  + probe 全族 13 件复跑：12 件 RESULT 全绿 + probe_receipt_d19 负结果
  一致（D-19 维持）+ **probe_dir_ops 扩案全绿**（move_dir 六案+merged
  域两形+depth 8+url_decode 重勘 p⑩[GET bool 裸 1/0 定谳——断言口径
  随校]）；**StringBuilder 装配逐字节零漂移主证** = 标准语料前后采
  9/9 相等 + probe 全族；500 档 VM 池值损坏实勘 → ledger **D-35** 新立
  （上游域，稳定域 P ≤ 200）。file 组零失败漂移，组数不变 16/15/十五段。
- N 定谳（2026-09-27 PLAN-019 T-04，SD-1903）：vm **merged 臂 ALL
  GREEN ×4**（16/16 含基线 **v17** 零漂移——计划内重锁[App
  dirmerge_on+弹层预览行/合并移动条件钮/trash 行按钮化入 dump/id
  序列——非零重锁第四例]锁前 ×3[15/15 基线未锁窗] + gate 内锁后
  零漂移 PASS 实录；file 组 ㉓合并弧线 + find 组 ⑦ trash 增强
  双臂面全通）+ **split 臂 = 外部家族窗延续[分段判绿，018 v22
  先例]**：三跑 + **本批前代码[8894a16 git-archive+deps 物料]同
  exe 同签名复现**[boot FAIL+wiki 树行不现——判别链外部性定谳，
  D-21 v23 扩记]；merged/probe 双臂/e2e 全绿承载本批载体）+
  e2e 十五段全绿 **5 连绿**（50.1-53.5s；13 dir4 合并弧线+trash
  增强含；首跑败于 ft_nodes 陈旧预览落空——素材前置 daily 校正，
  测试面非产品败形）+ vue build 绿[release 路由——家族重建窗延续
  口径同 017/018] + **F-R17-1 gate 单命令第三批复核 = 维持留观**
  （裸 `node scripts/gate.mjs` 两跑实录：merged 段过[含基线 v17
  PASS]→split 段 boot FAIL 短路——build 段未达，exe 家族稳定窗
  未至，D-21 v23 扩记；分段路由判绿在案）+ probe 全族 13 件
  fresh：12 件 RESULT 全绿[含 probe_dir_ops 扩 merge 九案双臂——
  mb⑥⑦ F-R18-1 域卫闭账]+probe_receipt_d19 负结果一致（D-19
  维持）+ **D-35② 复测负结果维持**[新 exe 下 split N=500 仍损坏
  ——HTTP 200 body=整数 500 字面量 len=3，018「空串/整数 0」同
  域形态变体，P≤200 稳定域口径不变]。file/find 组零失败漂移，
  组数不变 16/15/十五段。
- N 定谳（2026-09-27 PLAN-020 T-03，SD-2003）：vm **merged 臂 ALL
  GREEN ×3**（16/16 含基线 **v18** 零漂移——锁前 15/15 ×2[首版逆序
  断言「收起」壳钮偏移+⑨ 终态 files 面板行集污染 12 负向断言两件执
  行期校正] + 锁后独立 16/16 + gate 内 16/16 含基线 PASS；menubar
  popover 内容窗瞬态 1 例重跑即绿[v11③ 家族]）+ **split 臂 = 外部家
  族窗延续[分段判绿，018 v22/019 v23 先例]**：独立三跑 + gate 内一跑
  全数同签名[boot FAIL+wiki 树行不现——D-21 v23 同形，exe 时间戳未变
  09-26 10:43——外部性定谳链：merged 16/16+probe 双臂 13 件+e2e 5 连
  绿+build 绿承载本批载体]）+ e2e 十五段全绿 **5 连绿**（1.2-1.3m/
  跑[240s 预算扩容——90s 窗 ⑬ 位 popover 窗即触顶实录]；执行期位态
  校正五件全数测试面非产品败形[12①b 激活回落 ⑨ 弧后邻位漂移/Orphan
  Pg 第 4 入链防漂移/今日笔记菜单 strict 冲突[⑥ 先例同判]/RecCap 循
  环逐拾取三试重试[负载窗家族瞬态]/追加断言面 D-17 门控]）+ vue
  build 绿[release 路由+SCHEMA_DRIFT_GENERATE_AT=1——D-21 v20+ 家族
  窗延续口径] + **F-R17-1 gate 单命令第四批复核 = 维持留观**（裸
  `node scripts/gate.mjs` 两跑实录：merged 段过[含基线 v18 PASS]→
  split 段 boot FAIL 短路——build 段未达，exe 家族稳定窗未至，D-21
  v24 扩记；分段路由判绿在案）+ probe 全族 13 件 fresh：12 件 RESULT
  全绿双臂 + probe_receipt_d19 负结果一致[g①=0/g② len=0——D-19 维
  持] + **D-35② 复测条件未至**[exe 时间戳未变——bulkalias 观测窗挂
  起维持]。file/find 组零失败漂移，组数不变 16/15/十五段。
- 结构基线 = `tests/baseline/structure-v18.txt`：state 段逐字节 +
  snapshot vnode id 出现序列（v2 仪器延续；**v18 = PLAN-020 计划内重
  锁**[App orphan_rows[pristine 恒空 []]+recent_paths[六检查后 1 项
  ——**str 清单 dump 直出字符串非 vmref** 新观测面]入 dump + action
  view.find-orphans[Ctrl+Shift+O]+menubar 视图项「孤页清单」入 id 序
  列——非零重锁第五例；快开空 q「最近」段/孤页行集均在 find_open 门
  控后不入终态 snapshot]；**v17 = PLAN-019 计划内重锁**
  [App dirmerge_on 旗标入 dump + 移动目录弹层预览行 text 节点 +「合并
  移动」条件钮[探针 G 定谳双钮变体——bool computed 条件] + trash 行
  路径 ghost button 化入 id 序列——非零重锁第四例；恢复全部钮零新
  state——trash_rows 复用]；**v16 = PLAN-018 计划内重锁**
  [store movedir_open + App movedir_src/movedir_dst 入 dump + action
  file.movedir 无快捷键 + menubar 文件项「移动目录…」+ 移动目录弹层
  第十二实例双 input 闭态恒渲染入 id 序列——G5 实勘落定非零重锁第三例
  ；v15 锁文件头注字面 v14 系重锁窗漏改——016 教训同款，v16 随锁校正]
  ；**PLAN-017 = 零重锁第二例**[v15 维持——纯 back 语义扩容片]；**v15
  = PLAN-016 计划内重锁**
  [App trash_rows/trash_purge_open 入 dump + action file.trash[Ctrl+Shift+T
  键位] + menubar 文件项「回收站」+ 清空强确认弹层实例入 id 序列；
  **v14 = PLAN-015 计划内重锁**
  [每日笔记 UI 面——action file.daily[Ctrl+Alt+N 键位] + menubar 文件项
  「今日笔记」+ 工具栏 calendar 钮入 id 序列；store/App 模型零状态面
  ——行:列消费未落地，探针 E 定谳 autodown_editor 无 oncursor 转换臂
  （PLAN-413 在 code_editor——组件错位），D-12 处置维持]；v13 = PLAN-014
  [store deldir_open/rendir_open + App deldir_q/rendir_target/rendir_q
  入 dump + 删除目录/重命名目录弹层第十/十一实例闭态恒渲染节点 +
  menubar「删除目录…」/「重命名目录…」项 + Shift+Delete/Ctrl+Shift+R
  键位]；v12 = PLAN-013 [store 零状态面——tabs.title 恒路径面显示域
  零扰动注记 + App titles/meta_q_title 入 dump + back links_json 态串
  dtitle 字段逐字节扩 + 属性弹层第三 input 节点]；v11 = PLAN-012
  [store dir_open/move_open + App dir_q/move_q 入 dump + 弹层第七/八
  实例闭态恒渲染节点 + EXPLORER ⊕ 钮 + menubar「移动到目录…」项 +
  Ctrl+Shift+M 键位]；v10 = PLAN-011 [store meta_open + App meta_q 双
  字段 + 属性弹层第六实例 + Ctrl+I 键位]、v9 = PLAN-010 上游 MouseArea
  149 节点重锁、v8/v7/v6/v5/v4/v3/v2/v1/v0 留档）。

## 文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 架构定版（SD-01：双轨机制 /
  013 形态消费面 + C-1..C-6 双轨硬约束 / 后端复用 / 测试体系 / 纪律）
- [plans/attachments/081-t00-rulings.md](plans/attachments/081-t00-rulings.md) —
  T-00 三勘定决策档（auto-down PLAN-081 附件；双轨机制 / actions-vue
  现状 / 后端选型）
- [parity-ledger.md](parity-ledger.md) — 双轨差异登记表 v24（SD-2004 指针；三十七项三分类；PLAN-019 增补 D-36[目录合并+trash 增强切片实勘集——**探针 G 定谳双钮变体**[dialog 内嵌 checkbox 生成器 v-model/onchange 双写缺陷/vm 视图条件表达式 computed 字符串字面比较整子树丢弃——bool computed 引用健康/dialog-footer 内 if 条件节点不现三面一手实勘]+split 臂 D-21 v23 扩记[家族重建窗第三例——本批前代码同 exe 同签名判别链外部性定谳]+D-35② 复测负结果维持[整数 500 形态变体]+D-19/D-22 注记随行]；D-19/D-21/D-35 处置随行）
- [upstream/2026-09-jade-supply.md](upstream/2026-09-jade-supply.md) —
  上游供料包（D-16 预热 / D-15 残余 / D-17 键入发射 / D-18 投影双态，
  期望形态+复验条件+回执方式）

## 计划

PLAN-081（bootstrap）+ PLAN-001（换基自有 back）已交付归档——后者见
[plans/archived/001-jade-edit-rebase-autoedit.md](plans/archived/001-jade-edit-rebase-autoedit.md)；
PLAN-081 本体在 auto-down 主检出 `docs/plans/081-jade-edit-bootstrap.md`。
