# quick-open — 双轨快速打开独立弹层（R-05a）

来源：PLAN-038（2026-10-09 执行交付，T-01..T-04 全门绿）。本规范沉淀双轨快速
打开的现行契约：三入口共口的独立根弹层、独立查询与共享名称目录、真实 path
拾取的开页事务边界（来源票据/等待窗门/同步提交/真实完成回执）与关态清理门。
上位定位：`docs/ARCHITECTURE.md` SD-3801；复用 [name-search](name-search.md)
（目录/匹配/请求门）与 [wiki-link-navigation](wiki-link-navigation.md) §2
（NavCommit 同步提交门）——不改变二者语义。
证据：[038-quick-open-contract](../plans/attachments/038-quick-open-contract.md)
（T-01 冻结件+T-03 执行期定谳）+ `tests/probe_quick_open.mjs`（t1 载体相位
10 pass/0 fail/2 blocked + prod 生产相位 18 pass/0 fail）+
`e2e/quick-open.spec.ts`（I/K/W/O/S 五测）。

## 1. 入口与弹层（SD-01）

| 面 | 规则 | 证据 |
| --- | --- | --- |
| 三入口共口 | action `view.find-files`（Ctrl+P）／菜单「快速打开」／工具栏图标钮（始终可见，不依赖右栏开态/hidden md:flex）——同一 handler `ActFindFiles`；幂等重开（单旗标单弹层零叠层）；无文档（零 tab）与有脏档均可开 | probe I1/I2/I3/I4 + e2e 三入口测 |
| 根弹层 | `dialog (open: .store.quick_open)` 根视图弹层——编辑器位置/key/content/实例不因开关变化（零重挂载）；弹层 = 标题+输入（placeholder「输入标题、别名或路径…」）+目录状态行+错误行+滚动结果列表（max-h-64 overflow-y-auto）+取消钮 | e2e 视口测（1280/360 编辑器实例恒等） |
| 行形态 | 行 = 显示名主行（dtitle）+ 实际相对路径次行（同名消歧）；**首选行 bg-accent 高亮**（sec=="" 且 path==quick_first_path）；点击行传真实 path（`.QuickPick(r.path)`——不传索引/显示名） | probe F3 + Q1d/e 同名双 path |
| 空查询 | 「最近」段替换式（recent_paths 非空→段标题+最近行；否则全量目录）；空态行「（无匹配文件）」；行集三分在 handler 侧物化（quick_view_rows——VM 恒渲染子树 len() 过渡不重评家族规避），视图纯 for+逐行 sec 分支 | probe Q1f + vm check11 recents 面 |
| 程序化聚焦 | VM：入口 handler `ui.focus(".QuickEdit")`（native 9920→iced focus 任务），**回执观察位 `var __focus_result str = ""` 为前置**（renderer write_state 未声明字段 FieldNotFound 静默）；判据 `__focus_result=="ok"`。vue：调用 querySelector 静默空转无害，聚焦由 DialogContent 原生 autofocus（slot 先于 X 钮）承载 | probe F2 + e2e 键入即达 |
| 键程 | 输入 Enter=打开首选实际 path（QuickConfirm 守卫：busy/零首选/目录非 ready→零动作零关层）；Tab 到结果行钮+Enter=开该行（vue DOM 焦点序）；Escape/取消/X 同终态关闭。**VM Escape 无公开关闭形态**（modal 不消费+合成通道零派发；不新增全局 bind——F-038-R1 单列上游），取消钮承载同终态；VM Tab 合成通道零派发（全候选鼠标点击承载） | probe F4/F7/F8/F9/F10 + e2e 键程测 |

## 2. 独立查询与共享目录（SD-02）

- **查询独立**：quick_q 独立于 find_q；开/关/输入不写 find_open/find_mode/
  find_rows/find_ran/find_err/find_stale，不使全文在途请求失效；tags_open/
  backlinks_open 不受扰（probe C1/C1b + e2e）。
- **目录共享**：names/names_state/names_gen/names_seq 单源；入口无条件重取
  （033 外部变更观察口），逐键纯内存过滤零 fetch（name_rows_of 共享出口，
  probe Q2 names_seq 恒定）；目录提交时按最新 quick_q 重算行集/首选（同
  handler 体内收敛）。
- **刷新可见消费者门**：NamesInvalidate 即时重取门 = `find_open ||
  quick_open`——两者都关只失效。
- **状态三形**：目录 loading/error/ready 共享 names_state（错误「名称加载
  失败」+重试钮——首载失败不伪造无结果）；quick_err = 拾取独立错误（不占
  save_note 不覆盖草稿注记——wiki_nav_note 同族分域）。
- **files 用户面退役**：旧右栏 files 模式（input/行集/FindPick 即关/
  FindEdit files 分支/files_rows）整体退役；text/wanted/trash/orphans 四
  模式不动。FindOpen("files") 不再被调用（旧 action id/title/快捷键保留
  转投弹层入口）。

## 3. 开页事务边界（SD-03）

1. **票据**：QuickPick 入口同步捕获 uid/gen/key/body 单次不可变 + quick_seq
   递增；busy 置位阻止重复确认（Escape/取消永不受阻）。无文档/untitled 源
   （uid=0/gen=0/空 key/body）原生通过 NavCommit 门——零特例。
2. **已开目标直激活**：tabs 扫 path 命中（含脏）→ 直 NavCommit 激活——零
   exists/read 窗、零覆盖、零重复 tab（内存正文/脏标保持）。
3. **未开目标两等待窗**：exists → 门①（store.quick_open && quick_seq==myseq
   && uid/gen/key/body 五查）→ read_wiki → 门②（同五查）→ NavCommit 同步
   提交（Open 全字段同构构造）。门失败 = 旧票据零副作用零提示回写；vue
   Escape/X v-model 直写 quick_open=false 由关态门兜住（无回调依赖）。
4. **missing/失败**：exists=false → 独立错误「目标不存在——请重开快速打开
   刷新目录」弹层留置，零建页零 CreateGo 零缺页确认；exists/read 异常 →
   独立错误留层可重试；错误不占 save_note。
5. **真实完成回执**：`store.active_path == path && store.sel_gen != 拾取前
   gen`（NavCommit 成功路径恒 TabActivate→sel_gen 前进；拒绝路径零变化）
   ——「目标=当前页」场景误判族解除（036 回执面升级）。回执成立才：关层、
   push_recent+持久化、bl/ol 行重算、MentionsRefreshOf（成功目标 path 显式
   入参）；失败留层输入保留可重试。
6. **取消零副作用**：取消/Escape/X → 世代递增+busy 复位+错误清+关层；不重
   挂载编辑器、不改 active_key、不清正文/dirty/save_note、零磁盘写入、零
   recents 变化（probe F8 + e2e 取消测 + P 组取消弧）。

## 4. 不变量与验证

- 不变量：开关弹层编辑器实例恒等（e2e element 引用对照）；查询/全文/面板
  状态互不覆盖；导航前后源页保护面与 036 同规（NavCommit 共享）；迟票据
  （Escape/关再开/改查询）零开页零 recents 零提示回写。
- 双轨证据分工：VM merged = probe prod 相位（I/K/Q/C/R/O 组——真实键程经
  autoui_action submit/press 与 ui.focus）；载体形态冻结 = probe t1 相位
  （1024x768/640x480 宽窄窗、Escape/Tab 仪器边界实勘）；vue = e2e
  quick-open.spec（真实键鼠、1280/360 视口、route-delay 真等待窗反例）。
  vm_matrix check11/N/13deep/⑩b⑩c 迁弹层面（基线 v29 重锁）。
- 已知边界（如实分列）：VM Escape/Tab 键程无公开形态（F-038-R1 owner=上
  游）；busy 真实窗在 merged 无可验证对象（门代码+vue route-delay 承载）；
  箭头键高亮遍历不做（R-05b 后续候选）。
- 可重跑：`node tests/probe_quick_open.mjs --phase t1`（载体）、
  `--phase prod`（生产）、`pnpm exec playwright test -c
  e2e/playwright.config.ts e2e/quick-open.spec.ts`。
