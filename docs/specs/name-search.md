# name-search — 名称查找与页面名称目录（R-04；PLAN-038 消费面修订）

来源：PLAN-033（2026-10-02 交付）；**PLAN-038（2026-10-09）修订消费面归属**
——快开用户面迁独立根弹层（[quick-open](quick-open.md)），本规范的目录、
匹配域、请求门与身份边界全部维持。上位定位：`docs/ARCHITECTURE.md` SD-401
（检索协议）与 SD-1301（显示名/链接身份两域边界）的**查找域**修订出处——本
规范生效起，ARCHITECTURE 旧段落中"frontmatter title 不入检索"的历史描述由
本文件 §1/§2 代替；**链接身份域**（四级解析序、引用改写规则）不受本规范影
响，仍以 SD-302/SD-1301 原文为准。

## 1. 名称目录与查找域

### 1.1 页面名称目录（page_names）

- 契约：`GET /api/page_names`，无查询参数，返回 JSON 字符串——顶层裸数组
  `[{"path","title","dtitle","aliases":[…]},…]`（D-20④ 顶层数组形状；trash_list/
  recent_paths_get 同族零 D-19 面：CJK 值在响应 body UTF-8 直通）。
- 覆盖：工作区根 depth 8 内全部 `.ad` 页，每页恰一条记录；walk 序 =
  `collect_ad_pages` 同源（fs.tree dirs-first + 名称 casefold，确定性）；
  点前缀目录（.trash/.auto-jade 等）自动排除。
- 字段：`title` = 文件 stem（恒，与 link_index 同口径）；`dtitle` =
  frontmatter `title` 单行值（引号壳剥离），空/缺省 → stem（装配即定值）；
  `aliases` = block-list 两缩进形态 trim 归一（page_aliases 在册规则）。
  非名称 frontmatter 字段（tags/summary/status 等）不进入目录，也不进入
  任何查找域。
- 只读零写面：每次调用读当前磁盘，不服务过期缓存；正文不读入匹配数据
  （快开数据面零 body 字段）。
- 转义：目录装配用 `json_esc_x`（反斜杠→引号→换行→回车→制表五步全局
  替换）。现行 `json_esc`（反斜杠+引号）调用面零扰动。fm 值可含引号/
  反斜杠/制表——严格 JSON 控制符必须转义（probe Quoted 案双臂直证）。

### 1.2 统一名称匹配规则（两端同规）

- `N(q) = q.trim().to_lower()`；名称命中 = 候选字段 `to_lower().contains(N(q))`
  任一。纯空白查询按空查询处理。
- 候选集 = `{stem, dtitle（解析值或 stem 缺省）, aliases…, 工作区相对 path}`。
  "带 .ad 的文件名"与"相对目录路径"均由 path contains 承载（basename 已含于
  path，不设第二套文件名归一规则）。
- 快开（独立根弹层——PLAN-038 迁移，旧右栏 files 模式退役）：对名称目录
  行集同规过滤，纯内存零 fetch——逐键输入不调用后端目录或全文 API（AC-06
  请求计数锚）。
- 全文（后端 search_wiki）：命中域 = 上述名称候选集 ∪ body（正文域逐字节
  保持）；**非名称 frontmatter 字段不入域**（属性专有词在正文缺席时不得命中）。
- 不承诺：Unicode 全 casefold、拼音、分词、路径分隔符自动转换（D-22①
  to_lower 双轨在册语义，CJK 恒等）。

### 1.3 快开空查询与最近文件

- 快开空查询（独立弹层）：有最近记录（recent_paths）时显示「最近」段替换
  式（既有置顶/去重/容量 10/持久化行为保持，行显示名同源名称目录）；无最
  近记录才显示全量目录。
- text 模式（右栏面板保留）空查询：无行（既有未运行提示态）。
- 隐藏域：目录/全文均不含 .trash 与点前缀条目；最近文件若含 .trash 预览
  记录，保持既有导航语义，不因目录而变。

## 2. 身份与兼容

- **title 可查询但不成为链接身份**：`[[Target]]` 链接解析仍为四级序
  （stem 精确→alias 精确→stem to_lower→alias to_lower）；frontmatter title
  不进解析器、不进提及转换、不进改名/移动引用改写（SD-1301 两域边界
  维持——`[[首页]]` 对 index.ad 仍悬空）。
- 同名逐路径消歧：同 dtitle、同 alias、跨目录同 stem 的页面均按 path 保留
  为独立行；查找行 = 显示名主行 + 实际相对路径次行，点击只传 path 给
  OpenLink。显示域与导航身份域严格分离（不按显示名去重）。
- 全文响应形状兼容：`search_wiki` 签名与响应仍为 `[{path,title,snippet}]`
  ——不新增 dtitle/hit_kind 等字段；`title` 恒 = stem；limit 钳制 1..50、
  前台 20 默认、确定性 walk 序、snippet 规则（名称-only 命中 = ""、正文命中
  = 首条命中行 trim 剥 CR）全部保持。
- 拾取语义：快开弹层拾取成功即关层（QuickPick——真实完成回执后才关，见
  quick-open §3）；text 模式拾取面板保持开。
- 只读不变量：目录加载、过滤、全文检索与失败重试前后工作区字节/文件集合
  零变化（probe 磁盘快照对照锚）。

## 3. 刷新、失效与请求门

### 3.1 刷新触点（确认磁盘变化才刷）

规则：**确认磁盘变化的终态才刷新**；拒绝/取消/零变更/守卫拒不刷（显式
不刷负表：各弹层 Cancel、lc reject、stale 零变更、lc_hold busy、守卫空选）。

| 触点 | 处置 |
| --- | --- |
| 查找入口（快开弹层/全文面板）开启或重开 | 无条件重取目录——外部变更观察口 |
| ActSave（保存触点） | 失效（失败保存的重取无害幂等，TreeRefresh 同判） |
| MetaGo ok（属性 title/aliases 写面核心触点） | 失效 |
| CreateGo / NewGo / ActDaily 成功 | 失效（ActDaily 幂等重开同判 ActSave 先例） |
| LinkifyGo lc ok | 失效（body 非名称域——统一失效不变式防选择性矩阵漏项） |
| DeleteGo/RenameGo/MoveGo/DelDirGo/RenDirGo/MoveDirExec lc ok | 失效 |
| TrashRestore lc ok；TrashRestoreAll lc ok **与 partial** | 失效（partial = 已恢复项落盘如实面） |
| TrashPurgeGo ok | 失效 |

### 3.2 失效与请求门

- 失效世代（names_gen）：磁盘变化触点先同步递增；目录标记失效 + text 结果
  标过期（find_stale）。可见消费者门 = 全文面板开态**或快开弹层开态**
  （PLAN-038 扩），都关时只失效不取，下一次入口/触点再取。
- 目录请求门（names_seq）：NamesRefresh 捕获 seq+gen 快照，回包 seq 失配
  丢弃；seq 相配而 gen 失配（迟到旧代次）丢弃不递归。提交门与状态写全部
  留在同一 handler 体内（禁 handler 互调读异步完成态——D-23②/F-32-R1 面；
  VM 帧槽别名 F-32-R2 规避：无跨调用同名槽位复用、无递归链）。
- 全文请求门（find_seq）：FindRun 捕获 seq+query 快照，回包仅当前有效才
  提交；输入修改/切模式/关面板使在途响应失效——旧响应不得设置行集或
  运行态。
- files 行集为 model 字段，重算点 = 目录提交（与最新输入配对，同一 handler
  体内收敛）+ files 输入逐键。**实现纪律（T-04 实勘）**：行集不用 widget
  computed（VM 视图对 computed 渲染不可靠——空结果态丢空态、后续渲染区
  整体消失，debug 复现在录）；json.to_value 行字段在 VM 视图 content 位置
  不隐式解箱，经模块纯函数出口收敛 str；模块纯函数参数名避开 App 模型
  字段名（D-30① 阴影面）。

### 3.3 加载、失败与过期态（可区分三形）

- 目录三形：loading（"名称加载中…"）/ error（"名称加载失败" + 重试钮）/
  ready（行集）——快开弹层与全文面板各自消费同一 names_state。首载失败不
  渲染"无结果"、不伪造完整目录。
- 全文失败：可见"搜索失败——请重试"横幅 + 重试钮；既有行集保留不伪删；
  重试成功清错误。失败不渲染成"无结果"。
- 过期：磁盘变化后保留的 text 结果标"结果已过期——请重新检索"+ 重新检索
  钮；过期与真实无结果可区分；重检索成功清过期。

## 4. 验证与边界

- 双轨证据：tests/probe_name_search.mjs（merged 进程内直调 + split HTTP
  POST 双臂，已知答案语料独立对答案，双臂不得仅互证）覆盖目录字段完整性/
  walk 序/转义读回/匹配域/limit 钳制/响应形状/链接身份不变量/磁盘零副作用/
  刷新弧（属性·建页·改名·删除·回收站前后目录读回）。
- 前端证据：e2e/name-search.spec.ts（名称五域、同名逐路径打开、全文扩面、
  请求计数逐键零 fetch、失败重试、route 延迟迟到门、保存刷新与过期横幅——
  快开弧经独立弹层 dialog 域锚）；tests/vm_matrix.mjs N 组+check 11 快开子
  步（弹层面区域锚——原生输入与行集、同名逐路径、标题/alias/路径查找、模
  式门、外部刷新——错误/迟到门为网络可观测面由 e2e 承载）。
- 范围边界：P≤200 试用防线与 depth 8 上游边界维持；不做模糊匹配/拼音/
  分词/标签检索/排序评分/索引数据库/分页/正文高亮定位/自动全文检索/运行期
  切库/文件监听器（外部变更经入口重开或触点刷新可见，不承诺实时监听）。
- 已知边界单列（非本域缺陷）：F-32-R2（上游 VM 帧槽别名——LC3 安全终态
  在档）、F-24-2（split boot 形态，分段判绿判别链在录）、F-32-R1（vue
  handler 互调不 await——本域提交门以同 handler 体内收敛规避）。
