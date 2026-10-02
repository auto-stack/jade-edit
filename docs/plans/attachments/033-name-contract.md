# 033-name-contract — PLAN-033 T-01 名称载体与刷新/请求门契约（冻结件）

日期：2026-10-02。任务：PLAN-033 T-01（名称载体与刷新/请求门验证）。
状态：**frozen for T-02..T-05**（等价载体裁决权限仅限本文件记录的技术细节；改目标/验收/兼容须先修订 Plan）。
基线：jade-edit main `86a2808`（规划基线）；本附件落档于 T-01 执行批（见 Plan §9 work 记录 code_commit）。

## 1. 冻结：目录线形状与载体

**page_names 契约**：`GET /api/page_names`，无查询参数，返回 JSON 字符串——顶层裸数组
`[{"path":"…","title":"…","dtitle":"…","aliases":["…",…]},…]`。

- 每 .ad 页一条记录；walk 序 = `collect_ad_pages("", 8)` 同源（fs.tree dirs-first +
  名称 casefold，确定性）；范围 = depth 8 根工作区；忽略面 = fs_tree_skipped 点前缀
  （.trash/.jade 等）自动排除。全量目录（非 search limit 20 域）。
- `title` = 文件 stem（links_json 同口径恒 stem）；`dtitle` = `page_fm_value(fm,"title")`
  （引号壳剥离），空 → 缺省 stem（links_json dtitle 缺省装配同款双保险）；
  `aliases` = `page_aliases(fm)`（逗号无效——block-list 两缩进形态 trim 归一，在册规则）。
- **载体先例（决定性证据）**：嵌套列表内嵌对象字段在 link_index 已生产服役——
  `[{path,title,dtitle,links:[{target,anchor,exists,target_path},…]}]`，App 侧
  `backlink_rows_of/wanted_rows_of/orphan_rows_of` 三消费面迭代 `p.links`，
  merged VM + vue 生成双轨 e2e（matrix.spec [10]/[11] 组）全绿在册。aliases 取同构形
  （List[str] 内嵌 map 行）= 同一已证通道，无新载面。
- **T-01 直证**：tests/probe_name_search.mjs 双臂（merged 进程内 CALL + split HTTP
  POST）link_index 行 `dtitle` 字符串 + `links` 嵌套数组解析/迭代成功；
  App model int 字段计数器（c1=3）直证 VM 侧 int model 载体。
  **不把 TS 发射成功等同于 VM 可用**——merged 直调臂即 VM 根证据；vue 臂由在册
  e2e 双轨纪律承载（T-03/T-04 扩单）。

## 2. 冻结：JSON 转义方案

新增 `wsys.json_esc_x(s) str`（page_names 专用安全编码，**不动现行 json_esc 调用面**）：

```
r = s.replace("\\", "\\\\")   // 1. 反斜杠先行（次序颠倒产生假转义）
r = r.replace("\"", "\\\"")   // 2. 引号
r = r.replace("\n", "\\n")    // 3. 换行
r = r.replace("\r", "\\r")    // 4. 回车
r = r.replace("\t", "\\t")    // 5. 制表
```

- 依据：VM `str.replace` = Rust `String::replace` **全局替换**（engine.rs:8398 一手源
  实勘本批 T-01——while-contains 收敛惯用法为防御风格非语义要求；json_esc 现行
  无循环即依赖全局替换语义）。`.at` 字符串字面量 `\t`/`\n`/`\\`/`\"` 转义在册
  （lexer.rs:464/543/615 实勘）。
- 现行 json_esc（反斜杠+引号）保持原样服务 links_json/search_json/tags/move_dir
  全部既有装配——零兼容扰动（probe fb 基线逐字节锚承载）。
- search_json 响应装配**不切** json_esc_x：响应字段 path（NTFS 无控制符）/title
  （= stem，NTFS 无控制符）/snippet（单行 trim + CR 已剥）现行形状逐字节保持
  （AC-03 兼容验收优先于理论控制符边案；语料制表符经 JSON 往返的查询/目录面由
  json_esc_x 全覆盖——fa 案双臂直证）。
- 验证：probe 语料 `nm/Quoted.ad`（title `q"ote\slash`、alias `tab<TAB>9`）双臂
  JSON.parse 读回逐字段等值（相位 2 目录案 + fa 检索案）。

## 3. 冻结：统一名称匹配规则（两端同规）

`N(q) = q.trim().to_lower()`；名称命中 = 候选字段 `to_lower().contains(N(q))` 任一：

- 候选集 = `{stem, dtitle(解析值或 stem 缺省), aliases…, 工作区相对 path}`。
  basename 已含于 path（"带 .ad 的文件名"/"相对目录路径"均 path contains 承载，
  不设第二套文件名归一）。
- 快开（前端）：对目录行集同规过滤（内存，零 fetch）；空查询（纯空白同判）=
  全量（既有 recents 替换式在空查询支路不变）。
- 全文（后端 search_json）：命中域 = 名称候选集 ∪ body（现行 body 域逐字节保持）；
  非名称 frontmatter 字段（tags/summary/status…）不入域（f6 "active" 案负向锚）。
- 不承诺：Unicode 全 casefold、拼音、分词、路径分隔符转换（D-22① to_lower 双轨
  在册语义；CJK 恒等）。
- **两端不得仅互相比较**：probe 已知答案语料（nm/ 八档）分别对 merged/split 臂
  独立断言（期望值硬编码于脚本，非双臂互证）。

## 4. 冻结：异步请求身份与失效方式

**App 模型新字段**（store 零新增——开态权威仍在 store FindOpen/FindClose）：

| 字段 | 形 | 用途 |
| --- | --- | --- |
| `names` | `List` | 名称目录行集 [{path,title,dtitle,aliases}] |
| `names_state` | `str` | ""（未载）\|"loading"\|"ready"\|"error" |
| `names_seq` | `int` | 目录请求序号（每次 NamesRefresh +1） |
| `names_gen` | `int` | 失效世代（磁盘变化触点 +1） |
| `find_seq` | `int` | 全文请求序号（FindRun/FindEdit[text] +1） |
| `find_err` | `str` | 全文可见错误文案（""=无） |
| `find_stale` | `bool` | 全文结果过期旗标（失效世代递增置位，重检索清位） |

- **提交门（同一 handler 体内快照-回读）**：fetch 前取局部快照 `myseq = .find_seq`
  （及 query 快照），await 回来后 `.find_seq == myseq` 才允许写 `find_rows/find_ran/
  find_err`。vue 臂模型字段 = ref 直读（每次读最新值），生成代码形态以 T-03 build
  后 gen/front/vue 静态核验记录；merged 臂同步单作用域，门恒成立（无在途窗口）。
  **禁 handler 互调读异步完成态**（D-23② F-32-R1 面）——门比较与提交全部留在
  发起 handler 体内。
- **VM 帧槽别名风险（F-32-R2 在案）规避**：本片 handler 均为新建小作用域（快照
  局部变量命名不与 LC 族 handler 同名复用）；不做 handler 间异步链式取数；
  循环面不引入（目录/全文皆单请求单提交）。
- **失效流**：磁盘变化触点 → `.NamesInvalidate`（names_gen+1；find_stale=true；
  `if .store.find_open` 才 `.NamesRefresh()`——面板关只失效不取）。NamesRefresh
  捕获 seq+gen 快照，回包 seq 失配丢弃；seq 相配而 gen 失配（迟到旧代次）→ 丢弃
  不递归（下次入口/失效触点再取——无自递归，规避 vue fire-and-forget 链）。
- **files 行集改为 computed**：`files_rows => name_rows_of(.names, .find_q)`——
  目录回包/输入变化自动重算（ft_rows 先例 4 参函数 computed 在册），"提交时使用
  最新 find_q 重算"结构性成立，无时序窗。`find_rows` 只承载 text 模式后端检索行。

## 5. 冻结：逐入口刷新触点表（T-01 输出，AC-08 对照域）

规则：**确认磁盘变化的终态才刷新**（拒绝/取消/零变更/守卫拒不刷）；刷新 =
`.NamesInvalidate()`（内部按面板可见性决定重取）。终态判定沿用各 handler 既有
回执/哨兵分支，不新增成功态读回。

| # | 入口 handler | 磁盘变化确认位 | 处置 |
| --- | --- | --- | --- |
| 1 | `.ActFindFiles` | 入口重开（无前置写） | 无条件 `.NamesRefresh()`（重进即取新——外部变更观察口） |
| 2 | `.ActFindText` | 同上 | 同上（text 行显示名同源目录） |
| 3 | `.Init` | boot | 不取（懒载——入口 1/2 兜底，省 boot fetch） |
| 4 | `.ActSave` | 保存触点（store.Save 后——失败保存重取无害幂等先例 ActSave/TreeRefresh 同判） | `.NamesInvalidate()` |
| 5 | `.MetaGo` | `set_page_meta == "ok"`（title/aliases 写面核心触点） | `.NamesInvalidate()`（ok 支路） |
| 6 | `.CreateGo` | `create_page != ""` | `.NamesInvalidate()`（成功支路） |
| 7 | `.NewGo` | 同上 | 同上 |
| 8 | `.ActDaily` | `daily_note != ""`（含幂等重开——落盘面语义同 ActSave 先例，重取无害幂等；记录不视作"零变更凭空刷新"） | `.NamesInvalidate()` |
| 9 | `.LinkifyGo` | lc `ok`（源文 body 改写落盘） | `.NamesInvalidate()`（body 非名称域——取统一失效不变式，避免选择性矩阵漏项；重取无害幂等） |
| 10 | `.DeleteGo` | lc `ok` | `.NamesInvalidate()` |
| 11 | `.RenameGo` | lc `ok`（含 case-only 双步迁移） | 同上 |
| 12 | `.MoveGo` | lc `ok` | 同上 |
| 13 | `.DelDirGo` | lc `ok` | 同上 |
| 14 | `.RenDirGo` | lc `ok` | 同上 |
| 15 | `.MoveDirExec` | lc `ok`（含合并三择 moves 面） | 同上 |
| 16 | `.TrashRestore` | lc `ok` | 同上 |
| 17 | `.TrashRestoreAll` | lc `ok` **与 `partial`**（partial = 已恢复项落盘如实面） | 两者皆 `.NamesInvalidate()` |
| 18 | `.TrashPurgeGo` | lc `ok` | `.NamesInvalidate()` |

不刷面（显式负表）：各弹层 Cancel/LcGate 拒（reject）/stale（基线失配零变更）/
lc_hold busy/守卫空选（console no-op）/store 内部态迁移——零磁盘变化不触发。

## 6. 工具链与既有限制登记（实施必载）

| 项 | 现值/口径 |
| --- | --- |
| auto.exe | `auto 0.1.0+v0.4.2-2511-gb50dce902-dirty`（D:/autostack/auto-lang target/debug，2026-10-01 build；上游 main 986e765ac 为 docs 批——exe 与登记指纹一致性由本表载明） |
| 构建链 | `pnpm build` = scripts/regen-vue.mjs（gen-only strict + 残余补件 pattern 断言 + engine dist 卫兵 + pnpm build）；gen/front 不入库 |
| F-31-R1 | 上游 @autodown/engine dist 陈旧（auto-down Plan 717 提交于 dist 构建后）——**本批 T-01 已就地重建**（`pnpm --filter @autodown/engine build` 于 D:/autostack/auto-down/autodown，stamp f46a2f188e86faab 与已提交 src 对齐，零源变更；032 会话内重建 auto.exe 同类先例）；`pnpm build` 卫兵随之过绿 |
| F-32-R2 | 上游 VM 帧槽别名（LC3 案在档）——规避口径见 §4；名称弧不引入跨调用同名槽位复用 |
| F-32-R1 | vue handler 互调不 await——本片提交门全在同一 handler 体内（§4），无互调读态 |
| D-19 | GET query CJK 不解码——page_names 无参 GET 免疫；search_wiki 保持 POST |
| D-20⑤ | ts_adapter 仅 call-arg 形发射 JSON.parse——`json.to_value(page_names())` call-arg 形合规 |
| D-24②/D-29① | 只读目录零写面，不涉 |
| split boot / 多检查点楔死等 | 032/031 既有边界原样适用；本片新增失败与旧失败分列（Plan §4.2） |

## 7. 相位 1（T-01 基础）验证回执

- 命令：`node tests/probe_name_search.mjs --phase 1`（基础相位：语料八档 + 11 检索案
  双臂 + 载体直证 + 磁盘不变量）——**现行行为红相证据**：f1 "首页" 双臂均不含
  title-only 页 nm/Home.ad、f4 "nm/Home"/f7 "重名页" 双臂 `[]`（fm title 与相对
  路径不在现行检索域）——T-02 翻转案。
- `pnpm build`：生成成功（T-01 不改 .at 源——基线复现锚；engine dist 卫兵经 §6
  F-31-R1 重建后过绿，33 组件 + api.ts 标量契约断言 + vue-tsc/vite build 绿）。
- 结论：载体可用（嵌套 List-in-Map + int model 字段 + call-arg to_value 双臂在册），
  请求门模式可行（同一 handler 快照-回读 + computed 行集）→ **T-02 放行**。
- 配方注记：本探针语料为 node 侧置盘（读面探针——目录/检索/链接身份皆为只读，
  语料即已知答案输入，不经 app 写面）；serve-back.mjs 增 `workspace` 覆盖参数
  （缺省路径零变化——e2e webServer 与既有探针不经本参）。
