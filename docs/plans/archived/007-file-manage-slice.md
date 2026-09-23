---
plan_id: PLAN-007
status: archived
feature_name: file-manage-slice
author: [zhaopuming]
created_at: 2026-09-23T02:34:22+08:00
updated_at: 2026-09-23T14:45:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-701"
  - "docs/ARCHITECTURE.md#SD-702"
  - "docs/README.md#SD-703"
  - "docs/README.md#SD-704"
touched_goals: []
---

# [PLAN-007] 知识库第五切片——树文件管理（EXPLORER 新建 + 删除 + tab 关闭面）

> 预立项注：本计划起草于 PLAN-006 复审窗（006 execution_done@b92e07a，
> status=reviewed 流程中）——接地基线 = 006 执行态（gate ALL GREEN 基线
> v6 + ledger v9/D-24）；006 复审若出返工，共享面（rename 弹层形态/
> refresh 双件）漂移则本计划 r2 跟随（§10.8）。**work 启动前提 = 006
> 归档**（单写者主线约定）。

## 0. 变更摘要

SD-301/SD-405 主线第五片：**工作区文件运维收口**——EXPLORER 侧栏从
只读树升级为可管理面：

- **新建**：EXPLORER 头部「＋」钮 → 新建弹层（dialog+input，PLAN-006
  已证主形态）→ **复用 `create_page`**（PLAN-005 契约零改动——幂等
  守卫/清洗/模板/根落位全套在册）→ 落盘新档 + 打开 + 树/链接刷新。
- **删除**：树选中行 Delete 键 / 菜单「文件→删除…」→ 确认弹层
  （**影响面预览**：「N 处入链将变为悬空」+「M 个标签页将关闭
  （未保存修改丢弃）」）→ back 新契约 `delete_page`（POST；
  `File.delete` + **exists 双复核**——D-24② 恒返 0 吞错纪律）→
  tab 关闭面（`CloseTabsOf` 循环复用 `RemoveAt`——索引修正免费）→
  树/链接刷新 + **入链悬空化**（不改写源文——与 SD-601 重命名改写
  形成语义对照：改名保完整性，删除如实悬空）。
- 北标对表：Typora 线第二件 jade 可落地件（文件侧栏运维基本面——
  快开后第二件）；Obsidian 线工作区运维收口（链接读/找/写/改名后，
  工作区自举完整）。

上游缺口适配内置：D-19（删除/新建走 POST——D-21 vite 代理语境簇口径
内单 POST）；D-24③（menubar 不挂状态相关 enabled——handler 守卫兜底）；
D-24④（弹层双钮 = dialog-footer 普通钮）；D-24⑤（参数名避保留字）。

## 1. 目标

- **G1（新建可用·双轨）**：EXPLORER 头部「＋」→ 弹层输入名 → 确认 →
  工作区根落盘新档（`# {target}\n\n` 模板）+ 打开为激活档 + EXPLORER
  新行 + 链接面刷新；同名幂等打开既有档（create_page 语义直承）；
  取消零落盘。Ctrl+N untitled 流**不动**（档内草稿语义，入口语境
  区隔注记入 SD-701）。
- **G2（删除可用·双轨）**：树选中 .ad 行 → Delete/菜单 → 确认弹层
  （入链悬空预览 + tab 关闭警示）→ 磁盘删除（双复核）+ 该档全部
  tab 关闭（激活邻档补位/空态两案）+ 树/链接/快开面刷新 + 入链出链
  行 exists=false 翻转可证；取消零落盘；未选中态 Delete = no-op。
- **G3（back 契约语料首锁）**：`delete_page` 四案（删存在+复核消失/
  删缺失拒/非 .ad 拒/返回值口径）merged 直调与 split HTTP 双臂一致。
- **G4（测试面）**：vm 矩阵 + e2e 同单增 **file 组**（独立组）；基线
  v7 计划内重锁（store new_open/delete_open + App new_q 入 dump）。
- **非目标**（明确排除）：
  - 移动/跨目录（语料 flat 无目录层级——低值；移动不改 stem 故链接
    面零涉，后续批）；
  - 新建目录/重命名目录（`File.create_dir` 别名在册未证可调——
    D-20①/D-24① 教训，目录面另立探针批）；
  - 树行右键菜单（oncontextmenu 事件面在树行控件未证——后续批探针；
    v1 入口 = 头部钮 + Delete 键 + 菜单项）；
  - 删除回收站/撤销（远期）；
  - 删除时入链改写清理（**明确不做**——悬空化是诚实语义；清理属
    悬空链接清单/wanted pages 批）；
  - 大纲（D-12 门控不变）、tags 面板/unlinked mentions、检索上量
    微批（观测未触发）、上游件实做与生成物补件（AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第五片是树文件管理）

- **候选池对表**（PLAN-006 §10.7 首位在案）：树文件管理（新建/删除/
  移动 + tab 关闭面）/ 大纲（D-12 门控）/ tags 面板（frontmatter 面
  未开）/ 检索上量（观测未触发）/ File.rename 供料回执（上游件）。
  北标口径（SD-405）：短期 Typora 线——文件侧栏运维（新建/删除）是
  Typora/VS Code 基本面，jade 侧零上游阻塞（弹层/dialog/input/
  create_page/File.delete 全在册已证）；长期 Obsidian 线——链接
  读/找/写/改名四件后，工作区自举（建删文件）是运维闭环最后一块。
- **形态复用度极高**：新建 = PLAN-005 create_page 契约 + PLAN-006
  dialog 弹层形态的纯组合（零新 back 面）；删除 = 单新契约 + 既有
  确认弹层族 + `RemoveAt` 在册口——本切片是四件套后的**收割片**，
  风险面最小。

### 2.2 数据面（back：`delete_page` 新契约，唯一 back 增量）

```rust
/// 删除页面（入链悬空化——不改写源文；.ad 后缀卫；双复核）
/// POST /api/delete_page
pub fn delete_page(path str) str {
    return wsys.delete_page_impl(path)
}
```

- **POST 通道**：CJK 路径常态（D-19——GET query split/vue 臂全败；
  POST body 三+1 契约先例）。
- **实现三步**（wsys.delete_page_impl）：①卫：`path.ends_with(".ad")`
  否 → ""；`File.exists(resolve(path))` 否 → ""；②`File.delete
  (resolve(path))`（**返回值忽略**——D-24② 恒返 0 吞错）；③**双复核**
  `!File.exists(resolve(path))` → 成功返回 path；仍存在 → ""。
- **删除语义定调（SD-701）**：**入链悬空化，不改写源文**——重命名
  （SD-601）改写入链保完整性；删除让入链如实悬空（出链行 exists
  翻转 + 悬空可再建页接回——PLAN-005 弧线闭合）。两语义对照入
  canonical，杜绝「删除即清理引用」的隐性期待。

### 2.3 消费面（front）

- **store**（editor_store.at）：`new_open` / `delete_open` bool +
  `NewOpen()/NewClose()/DeleteOpen()/DeleteClose()`（弹层面分野在册）；
  **`CloseTabsOf(path str)`**——while 扫描 tabs，命中即循环调
  `.RemoveAt(i)`（在册口：`.tabs.remove(i)` + 激活索引修正 + tab_count
  维护免费复用——补件②守 vue 面）；返回关闭数（int——弹层警示文案
  预览用 store 侧派生 fn `TabsCountOf(path)`，CloseTabsOf 执行期返值
  仅日志）。
- **App 模型**（app.at）：`new_q` str（新建弹层 input 值——rename_q
  同构）；删除弹层**零新字段**（目标 = `ft_sel`、预览 = link_pages/
  tabs 现场派生）。
- **新建入口**：EXPLORER 头部行增「＋」钮（tab 条 plus 钮同构：
  button + icon "plus"）→ `.ActNewFile` → `store.NewOpen()` + `new_q`
  置空；弹层（dialog：标题「新建页面」+ input[placeholder 页面名] +
  取消/创建双钮——**dialog-footer 普通钮** D-24④）→ `.NewGo`：
  `r = create_page(.new_q)`（try/catch console_log）→ 非空：关弹层 +
  `store.Open({ path: r })` + `refresh_links()`/`refresh_tree()`
  （触发集 v4 口径——「建页成功」口直承）+ bl/ol 行重算（显式 r）+
  `ft_sel = r`。
- **删除入口**：action `file.delete`（title「删除…」、shortcut
  **"Delete"**）+ menubar 文件项（退出前；**不挂 enabled**——D-24③
  boot 冻结纪律，守卫在 handler）→ `.ActDelete`：`ft_sel` 空 → no-op
  （console_log）；非空 → `store.DeleteOpen()`。弹层（dialog：标题
  「删除页面」+ 目标名 + **影响面预览两行**（`dangling_impact
  (link_pages, stem)` 纯函数：「N 处入链将变为悬空」/「无入链」；
  `TabsCountOf`：「M 个标签页将关闭，未保存修改将丢弃」/「无打开
  标签页」）+ 取消/删除双钮）→ `.DeleteGo`：`r = delete_page
  (.ft_sel)`（try/catch）→ 非空：关弹层 + `store.CloseTabsOf(r)` +
  `refresh_links()`/`refresh_tree()` + bl/ol 行重算（显式
  `.store.active_path`——CloseTabsOf 后投影）+ `ft_sel = ""`；空：
  console_log + 弹层留置（PLAN-006 v1 口径同判）。
- **触发集 v4** = v3（Init/Save 成功/面板开启/建页成功/重命名成功）+
  **删除成功**（新建直承「建页成功」口）；快开/检索面随 ft_nodes/
  按需 fetch 自动新鲜（SD-401 口径）。

### 2.4 键位/菜单面

Delete = 删除选中档（新键位，无在册冲突——F2/Ctrl+P/Ctrl+Shift+F/
Ctrl+L/Ctrl+S/Ctrl+N 均异）；menubar 文件菜单「重命名…」与「退出」
之间插「删除…」。Ctrl+N（untitled 草稿）与 EXPLORER「＋」（落盘
新档）**两口径并存**——语境区隔注记入 SD-701，非歧义（§10.2 留
用户合并口）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件（dialog/button/input/icon 全在册已证——PLAN-006 弹层
主形态）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「006实施完毕，正在复审；请问下一步计划
  是什么？请提前 [$auto-plan-new] 规划它」——**预立项授权**：006
  复审窗内起草 PLAN-007（接地基线 = 006 执行态 b92e07a；复审耦合
  §10.8）。方向选择（树文件管理）= 候选池首位（PLAN-006 §10.7）+
  §2.1 依据；handoff 未否决即生效（PLAN-004/005/006 同款约定）。
- **work 启动前提**：PLAN-006 归档（单写者主线约定——直接 main 线性
  历史，一次一片）；本计划 status 保持 drafting 至彼时。
- 语义决策预授权评估：删除 = 入链悬空化（不改写）——§2.2 结构性
  论证 + 弹层预览即防线；若用户要删除前自动改写清理 → §10.3 留口
  （r2 范围，涉 SD-601 改写器复用）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓实读，2026-09-23 @ b92e07a）

- **在册复用件（本切片零新形态的根据）**：
  - api.at:109-113 `create_page(title) str` POST（PLAN-005——幂等
    守卫/清洗/模板 `# {title}\n\n`/根落位全套；**新建 = 纯复用**）；
  - PLAN-006 落地面：dialog 弹层主形态（T-02 探针 B 定谳通——dialog+
    input+footer 普通钮 D-24④ 纪律）/ `rename_page` 五步（File.delete
    + exists 双复核先例——本批同构）/ `refresh_links()`/`refresh_tree()`
    / `TabsRenamed` while 扫描形态 / `rename_impact` 影响面预览纯函数
    （本批 `dangling_impact` 同构第二实例）；
  - store RemoveAt（editor_store.at:234 `.tabs.remove(i)` + 激活索引
    修正 + tab_count 维护——`CloseTabsOf` 循环复用；补件② splice 守
    vue 面在册）；
  - app.at:399 EXPLORER 头部行（纯 text——增「＋」钮位）；tab 条
    plus 钮形态（button + icon "plus" 同构先例）。
- **D-24 纪律面（ledger v9 实读）**：①File.copy 解析层不可调（本批
  不涉）；②**File.delete 恒返 0 吞错**——双复核必须（本批同构内建）；
  ③**menubar 状态相关 enabled boot 冻结**——本批菜单项不挂 enabled、
  handler 守卫兜底（file.rename 落地形同判）；④dialog-cancel/action
  禁用——footer 普通钮；⑤参数名避保留字（path/old 命名面）。
- **D-21 v9**：vite 代理语境突发簇 + 隔离后端 50/50 实证——本批
  每操作单 POST（新建/删除各一），密度不升；README 重跑口径覆盖。
- **语料**：tmp/wiki-demo 5 页 flat（无目录——移动/新建目录低值
  判断依据）；删除弧线素材：`CAP 定理`（index/Tasks 出链——删除后
  两档出链行 exists=false 翻转逐字节可断言——PLAN-003 已知答案反向
  用）；新建弧线：任意新名（幂等案用 `index`）。
- **基线**：structure-v6.txt（store rename_open + App rename_q +
  dialog 第三弹层 id 序列）；v7 变更面 = store new_open/delete_open +
  App new_q + 第四/五弹层 id 序列（计划内扩）。

### 4.3 与既有计划的关系

- 复用 PLAN-005 create_page/建页触发口 + PLAN-006 弹层形态/双复核/
  影响面预览/refresh 双件——**零新形态收割片**。
- 与 SD-601 的语义对照（删除悬空化 vs 改名改写）入 SD-701——两域
  语义边界首次并表。
- 不触碰上游供料包件；D-12/D-16/D-17/D-19/D-21/D-24 留观不变。
- PLAN-008 候选池（§10.7 更新）：大纲（D-12 解锁）、移动/新建目录
  （`File.create_dir` 可调性探针前置）、tags 面板/unlinked mentions
  （frontmatter 面首开——D-14 联动裁决）、悬空链接清单（wanted
  pages——link_index 派生件）、检索上量微批、`File.rename`/`copy`
  别名供料回执件。

## 5. 详细设计

### 5.1 `delete_page` 契约与 wsys 实现（SD-701 back 半）

```
pub fn delete_page_impl(path str) str {
    // ①卫：path.ends_with(".ad") 否→""；File.exists(resolve(path))
    //   否→""（删缺失拒）
    // ②File.delete(resolve(path))——返回值忽略（D-24② 恒返 0）
    // ③双复核：!File.exists(resolve(path)) → return path；否则 ""
}
```

### 5.2 front 接线（SD-701 front 半）

- store：`new_open`/`delete_open` + 四开关口 + `CloseTabsOf(path)`
  （while 命中循环 `.RemoveAt(i)`）+ `TabsCountOf(path)` int（弹层
  预览派生）。
- app.at：msg `ActNewFile`/`NewEdit(str)`/`NewGo`/`NewCancel`/
  `ActDelete`/`DeleteGo`/`DeleteCancel`；模型 `new_q`；EXPLORER 头部
  「＋」钮；两个 dialog 弹层（新建/删除——第四/五实例，footer 普通
  钮）；`dangling_impact(pages, stem)` 纯函数（target==stem 精确
  计数——G2 预览）；删除流/新建流（§2.3）。
- actions：`file.newfile`（无快捷键，EXPLORER 钮语境入口——不入
  actions 面；`file.delete`（shortcut "Delete"）入 actions+menubar
  （不挂 enabled）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-701 | add | docs/ARCHITECTURE.md §5 | before：无文件管理域段（SD-302 触发集 v3 终）。after：增「文件管理域语义」子段——新建面（EXPLORER「＋」入口、复用 create_page 契约、Ctrl+N untitled 语境区隔注记）；删除面（`delete_page` POST 契约、.ad 卫 + exists 双复核[D-24②]、**入链悬空化不改写**[与 SD-601 改写对照并表]、tab 关闭面 CloseTabsOf、ft_sel 目标口径）；触发集 v4 = v3 + 删除成功；影响面预览两行口径；入口纪律（menubar 无状态 enabled[D-24③]、handler 守卫） | 工作区运维收口规范锚；两域语义边界（改名改写/删除悬空）并表 | AC-01/02/06 |
| SD-702 | modify | docs/ARCHITECTURE.md §6 | before：十三组检查 + 基线 v6。after：**十四组检查**（+file 组：新建弧线/幂等/删除弧线/悬空翻转/取消/no-op）+ **基线 v7**（store new_open/delete_open + App new_q + 弹层 id 序列计划内扩；v6 留档） | 测试体系表更新（PLAN-003..006 同步先例） | AC-03/04 |
| SD-703 | modify | docs/README.md Tests 节 | before：14+14+13+13+十三段口径、基线 v6 指针。after：**15/15+14/14+十四段**口径（file 组双臂全跑——删除/新建 POST 无 D-19 面；删除后导航断言不涉）+ 基线 v7 指针 + N 定谳续记 | 判绿口径单一权威面（SD-204/304/403/503/603 续） | AC-03/04 |
| SD-704 | modify | docs/README.md「是什么/文档」节 | before：第四切片=重命名+反链改写。after：**第五切片=树文件管理**条目（新建+删除+tab 关闭面 + 悬空化语义注记）+ ledger v10 指针 | 产品主线进度面派生同步（SD-303/404/504/604 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：merged 直调 + serve-back POST 四案——
  ①删存在档（返回 path + 复核消失 + 同名重建可再删——幂等闭环）②
  删缺失拒（""）③非 .ad 拒（""——目录名/裸名两形）④CJK 路径删
  （POST 双臂）。附带：删除后 `create_page` 同名重建（悬空接回弧线
  的 back 半）。
- **vm 矩阵 file 组（T-04）**：
  - 新建子步：①EXPLORER「＋」→ 弹层快照（new_open/new_q）→ 确认 →
    树新行 + 激活新档（active_path——ASCII 双臂；CJK 案 merged 臂
    导航 + split 臂磁盘断言，D-19 口径）②同名幂等（`index` → 打开
    既有 + 内容不变）③取消零落盘；
  - 删除子步：④选中 `CAP 定理`（点击树行——ft_sel 态）→ Delete →
    弹层预览（「3 处入链将变为悬空」——index/Tasks/**Hello World**
    出链计数已知答案[T-03 实勘校正：原记「2 处」漏数 Hello World.ad
    的 `[[CAP 定理]]` 出链——基线 v6 links_json 三页三处佐证，
    PLAN-006 T-02 预览期望值校正同款]）⑤确认 → 磁盘消失 +
    tab 关闭（关闭面 + 激活邻档断言）⑥开 index.ad
    → 出链行 `CAP 定理（悬空）` 翻转
    （PLAN-003 已知答案反向）⑦取消零落盘 ⑧未选中 Delete = no-op
    （console + 零弹层）。
- **e2e（T-04）**：file 段同弧线（真 DOM：＋ 钮 → dialog fill →
  创建 → 树行/editor 断言；选中行 Delete → dialog → 确认 → 消失
  断言 + 悬空翻转开档断言走 ASCII 档 `Hello World` 删除弧线——其
  出链/入链面 ASCII 安全）。
- **基线 v7（T-04）**：计划内重锁；连跑 ≥3 次零漂移；v6 留档。
- **负向（T-05）**：regen-vue 补件面零增量；冻结池/家族仓零接触；
  Ctrl+N untitled 流回归（boot/editops 组——零变化证）。

## 7. 验收标准

- **AC-01（back 契约）**：`delete_page` POST 契约落 api.at + wsys
  实现；§6 四案双臂全绿；双复核口径可证（缺失案）。验证：T-01
  直证脚本实录。
- **AC-02（新建/删除闭环双轨）**：新建（＋钮→弹层→创建→树新行→
  开档；幂等；取消）与删除（选中→Delete/菜单→预览弹层→确认→磁盘
  消失→tab 关闭面→树/链接刷新→入链悬空翻转；取消；no-op）双轨
  全绿，vm snapshot+state 与 vue e2e 同断言域（CJK 导航子步 merged
  臂——D-19 口径注记）。验证：T-04 file 组 + e2e file 段。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **15/15** + split **14/14**（+file 组）+ vue build +
  e2e **十四段**；判绿实录进 §9（D-21 vite 代理语境簇口径——失败
  重跑即绿，次数如实记）。
- **AC-04（基线 v7）**：计划内重锁完成、v6 留档、连跑 ≥3 次零漂移；
  dump 含 new_open/delete_open/new_q。
- **AC-05（负向证）**：冻结池与家族仓零接触（git status 证据）；
  `gen/` 无手改；旧园代码零引用；补件面零增量（D-13/D-15 残余集
  不变）；Ctrl+N untitled 流行为零变化（回归组实录）。
- **AC-06（文档面）**：SD-701..704 落位且 canonical 文中锚注齐
  （SD-301..604 先例）；**删除悬空化 vs 改名改写语义对照**入
  SD-701；parity-ledger **v10**（执行期新实勘入册；`Delete` 键位
  actions 面形态若现缺口如实记）。

## 8. 执行步骤

> 每任务收口 = 代码 + 验证命令实录进本节证据块；§10 观测项闭合标
> 「已裁定」。前置：PLAN-006 归档（§4.1）。

- **T-01 back 契约 + 四案直证**（AC-01）✅ 已完成
  - api.at 增 `delete_page` POST；wsys.at `delete_page_impl` 三步
    （.ad 卫/删/双复核——D-24② 纪律）。**[✅ 已完成]**（2026-09-23）
    卫语句序 = .ad 后缀先于 exists（目录名/裸名/其他扩展一律拒——
    **既有路径同样拒**，卫先于存在性检查防目录误删）；File.delete 返
    回值忽略 + 删后 `File.exists` 双复核（D-24②：stdlib shim 恒返 0
    吞错，成功唯一判据 = 删后存在性翻转）；返回值 = 工作区根相对
    path / ""。SD-701 语义对照注记随契约落（悬空化不改写 vs rename
    改写）。
  - 四案 merged 直调 + serve-back POST 直证（CJK 案双臂）+ 同名
    重建闭环附带证。**[✅ 已完成]** `node tests/probe_delete.mjs`
    RESULT 全案通过（九案：①删存在 Tasks.ad[零入链隔离素材]+①b
    write_wiki 重建再删幂等闭环+②缺失拒+③非 .ad 两形拒[wiki 目录/
    jade-garden-index.json 既有非 .ad 文件——既有路径也拒]+③附裸名
    拒+④CJK CAP 定理.ad 删+附 create_page 重建根档接回+再删）+
    **双臂一致=true**（九案返回值逐案相等）+ 悬空化不改写源文逐字节
    负证（index.ad[含 [[CAP 定理]] 出链]/Hello World.ad/Projects.ad
    /jade-garden-index.json 全原样）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（link/find/
    create/rename 组回归零变化）。**[✅ 已完成]** merged 14/14 +
    split 13/13 ALL GREEN 一次通过（基线 v6 零漂移——回归零变化；
    delete_page 为纯增量契约，front 零触碰）。
- **T-02 front 新建入口 + 弹层双形**（AC-02 前半）✅ 已完成
  - store new_open/NewOpen/NewClose + app.at EXPLORER「＋」钮 + 新建
    dialog（第四弹层——input + footer 普通钮）+ `.NewGo` 流
    （create_page 复用 + 触发集「建页成功」口 + ft_sel 置位）。
    **[✅ 已完成]**（2026-09-23）store `new_open`/`delete_open` 双字
    段 + 四开关口同批落位（§2.3 弹层面分野在册；删除弹层 T-03 消
    费）；EXPLORER 头部改 row（text + 「＋」icon 钮——tab 条 plus 同
    构）；新建 dialog **声明位在 rename 弹层前**（vm 快照恒渲染
    input 序「后声明者居末」锚纪律——check 12 rename input 居末不
    漂移，实测复核）；「创建」钮与 create_confirm 同名——快照序末
    者消歧（弹层后声明居前纪律镜像）。NewGo = CreateGo 同构四步流
    （store.Open 直口 + LinksRefreshOf(r) 显式 r + TreeRefresh +
    ft_sel=r）。
  - `Delete` 键位 actions 面冒烟（keydown 回退层形态——F2 同构
    预期，如实录）。**[✅ 已完成] §10.1 已裁定**：shortcut "Delete"
    字面 boot 吸收（merged boot ready = actions/menubar 面解析通
    过——F2 同构预期兑现，零 fallback）；menubar-item vm 轨
    Popover lowering 实勘=渲染为 button 头（`__menubar_item("删除…")`
    ——冒烟调试实录，matrix pressButton 同口径）。action enabled_if
    `.ft_sel != ""`（权威面）+ menubar 项不挂 enabled（D-24③）+
    handler 守卫兜底（rename 同判三件套）。
  - 验证：merged 手动冒烟（新建/幂等/取消零落盘 + Delete no-op）+
    `pnpm build` PASS。**[✅ 已完成]** e2e/.runtime/smoke-t02.mjs
    **7/7 PASS**（①未选中 Delete no-op[delete_open 恒 false]②＋→
    弹层开+new_q 置空③input 键入同步④创建→磁盘模板逐字节+active/
    ft_sel 置位+树新行⑤同名幂等 tab 数不变+磁盘字节不变⑥取消零落
    盘⑦选中态删除入口放行[delete_open=true——弹层 T-03 落]）；
    `pnpm build` PASS（vue-tsc 0 错）；vm 矩阵 merged 13/14——唯一
    FAIL = **基线 B 计划内漂移**（store new_open/delete_open + App
    new_q 入 dump + 第四弹层 id 序列计划内扩——PLAN-006 T-02 同判
    [a0659f3 先例]，T-04 v7 重锁），行为面 13 检查含 check 12
    rename 全 PASS。
- **T-03 删除流收口**（AC-02 后半）✅ 已完成
  - store `CloseTabsOf`/`TabsCountOf` + 删除 dialog（第五弹层：
    `dangling_impact` 预览 + tab 警示行）+ `.DeleteGo` 流（触发集
    v4 + ft_sel 清空 + 行重算显式投影）。**[✅ 已完成]**（2026-09-23）
    实勘调整两项（授权内）：①`TabsCountOf` 落形 = app.at 侧纯函数
    `tabs_impact_text(tabs, path)` + computed `delete_tabs_preview`
    （store msg 无返值面——弹层预览 = 视图派生；store 侧派生 fn
    语义由 App 侧消费 `.store.tabs` computed 等价承载，vm/vue 双轨
    实测通）；②删除弹层**零 input**（预览两行 text）——声明位居
    rename 弹层后，input 序锚不受扰；「删除」钮全树唯一文本锚。
    CloseTabsOf = while 扫描命中即 RemoveAt(i) 不增 i（remove 后
    左移同位重查）；触发集 v3→v4 注记随 TreeRefresh/LinksRefreshOf
    注释更新（v4 = v3 + 删除成功）。
  - 验证：merged 冒烟全弧线（删 `CAP 定理` 双 tab 关闭 + 开 index
    悬空翻转）+ link/find/create/rename 组回归 + e2e file 段冒烟。
    **[✅ 已完成]** e2e/.runtime/smoke-t03.mjs **6/6 PASS**（①弹层
    锚[标题/目标/预览两行——「3 处入链将变为悬空」实勘校正 + 「1 个
    标签页将关闭」]②取消零落盘③删除弧线[磁盘消失+ft_sel 清空+
    tab 全关空态 tab_count=0+树行消失]④未选中 no-op⑤悬空翻转
    [出链行 CAP 定理（悬空）+ 树零残留]⑥邻档补位[删除激活档→
    active 落邻档 HW+「无入链」预览第二形]）；vm merged 矩阵
    13/14（唯一 FAIL = 基线 B 计划内漂移——T-04 v7 重锁；行为面
    全 PASS）；e2e 全套 PASS（首跑 check 10 反链面板行断言失败
    [D-21 vite 代理语境簇签名]重跑即绿——README 口径如实记；附带
    `[pageerror] console.log is not a function` 非致命观测——三态
    归因实测[PLAN-006 归档态 3b46b5b/T-02/T-03]**既有面非本计划引
    入**，ledger v10 记观测）。
- **T-04 测试扩单 + 基线 v7 + 判绿首锁**（AC-02/03/04）✅ 已完成
  - vm file 组八子步 + e2e file 段 + 基线 v7 重锁。**[✅ 已完成]**
    （2026-09-23）vm 矩阵 check 13（12 后 9 前——quit 恒末项）八子
    步双臂；实勘四项（授权内）：①**删除预览期望值 2→3 处**（T-03
    校正续）；②**激活邻档两臂异位**——merged CAP tab 已开[check 10]
    删后同位保持→首页、split D-19 CJK 开档全败 active 不变=index
    （RemoveAt 修正两形态各证其一，预览 tab 行两臂分叉「1 个标签页
    将关闭」/「无打开标签页」）；③弹层锚结构定位（find 面板遗留开
    态使 input 序[find?,新建,重命名]非首即新建——「新建页面」标题
    上溯 dialog-content 锚；「创建」钮末者消歧、「删除」全树唯一）
    ；④幂等基线采样点 = ⑴ 落定后（⑴ 自身 +1 tab）。e2e file 段
    （9 quit 后段内最后——vue quit 垫片 no-op 无进程约束 + 删除素材
    Hello World.ad 保 quit 三验面；＋试内造零语料改动）五子步
    （新建/幂等/取消/删除弧线/悬空翻转；no-op+CJK 案 vm 专属口径
    注记）；EXPLORER「＋」vue 定位 = `svg[class*="lucide-plus"]`
    子串匹配（lucide 0.312 class=`lucide-<name>`，.first() DOM 序
    消歧——EXPLORER 列先于 tab 条）。
  - 验证：`node tests/vm_matrix.mjs` 双臂全绿 + `pnpm test:e2e`
    连跑 ≥5 + `node scripts/gate.mjs` ALL GREEN（判绿实录 + N 定谳
    续记——D-21 v9 口径）。**[✅ 已完成]** 基线 v7 首锁（--save-
    baseline；v6 留档）+ **连跑 3 次零漂移**（15/15×3 B PASS）+
    split 14/14；**gate ALL GREEN 一次通过**（vm merged 15/15 +
    split 14/14 + vue build + e2e 十四段 1 passed）。e2e 判绿实录
    （D-21 如实记）：T-03 窗首跑 check 10 面板行断言失败重跑即绿；
    T-04 窗一轮 save 磁盘标记失败（失败点漂移[D-21 签名]）+ 一轮
    HTTP 400 pageerror 瞬时——后续连绿。
  - **执行期修正（授权内，AC-05 补件面零增量前提下）**：app.at 移除
    全部 8 处 App 上下文 `.console = console_lines()`——实勘定谳
    ts_adapter 对 App 上下文未知字段 `.console` **裸发射全局赋值
    `console = …`（覆写 window.console 为字符串）**：vm 轨无此分野
    （widget 本地无害）/ vue 轨 plan006 起潜伏（12⑥ case-only 拒
    每轮 e2e 必触发——`[pageerror] console.log is not a function`
    即此，三态归因见 T-03 证据），本切片 file 组 e2e **首次行为级
    暴露**：nuke 后 `console_log` 垫片内 `console.log` 抛 TypeError
    → store.Open 在 push→console_log→**TabActivate 之间中断**（tab
    压入激活失败）。App 侧该赋值本就无目标字段（App 无 console）
    ——移除 = vm 无害化 + vue 排雷；store 侧 30 处 `.console.value`
    不动；另 e2e 新建断言锚实勘校正 `# E2E Note`→`E2E Note`
    （markdown 渲染 `# ` 不落 DOM——10c 先例同判）。ledger v10 记
    D-25。
- **T-05 文档 + ledger v10 + 收口**（AC-05/06）✅ 已完成
  - SD-701..704 canonical 落位（锚注齐 + 语义对照并表）；ledger
    v9→v10（执行期实勘）。**[✅ 已完成]**（2026-09-23）ARCHITECTURE
    §5 增「文件管理域语义」段（SD-701：两域语义对照并表[改名改写/
    删除悬空]/delete_page 三步定文/新建删除 front 全弧/触发集 v4/
    TabsCountOf 落形注记/Delete 键位定谳）+ §6 十四组表 + probe_delete
    注（SD-702）；README Tests 15/15+14/14+十四段口径 + file 扩单
    描述 + N 定谳 file 首锁续记 + 基线 v7 指针（SD-703）+ 第五切片
    条目 + ledger v10 指针（SD-704）；parity-ledger v10（D-25 = file
    切片实勘集：**ts_adapter App 上下文 `.console` 裸发射全局覆写**
    [window.console 覆写→console_log 垫片抛错中断 handler——store.
    Open push→log→TabActivate 断链实录；PLAN-006 起潜伏 12⑥ 每轮触
    发，file 组 e2e 首次行为级暴露；纪律 = App 上下文禁写 + 供料候
    选未知字段诊断]/vm menubar-item Popover lowering=button 头/lucide
    icon class 约定 + D-21 v10 扩记[PLAN-007 执行窗三形态实录]）。
  - 负向证采集（含 Ctrl+N 回归证）；§9 work 记录（outcome/
    next=review）。**[✅ 已完成]** 四件：①家族仓零接触（auto-lang/
    auto-down 本会话零写入；auto-lang blueprints 删除面 = **先在外
    来 WIP**[PLAN-006 T-05 同面在案，不触碰]——亦为本仓构建良性
    package load 告警来源，D-15 在册）②gen 树双跑 hash 等价
    （bbf44dad0af4ae67 = bbf44dad0af4ae67——无手改 + regen 确定性）
    ③旧园零代码引用（src/ 全 grep 唯一命中 = wsys.at:333 出处注释
    「移植自冻结池」——文档性非代码引用）④补件面零增量（regen-vue
    .mjs/serve-back.mjs 本计划零 diff；残余垫片族 + splice 两件不变
    ——build 收口行实录）。**Ctrl+N untitled 流回归零变化**：vm
    check 10b（untitled 空态）/12①（untitled 禁用）/7（tab 面）/
    9（quit）+ e2e 同段 gate 全绿实录。
  - 验证：文档 diff 全窗口检视 + gate 复跑绿。**[✅ 已完成]** 文档
    diff 全窗口自检（SD-701..704 锚注齐/指针一致/ledger 25 项三分类
    完整）；gate 复跑 **第 3 跑 ALL GREEN**（前 2 跑 split 臂 check-10
    反链面板行 6s 超时[state=ready 而行空]——D-21 v9 在册新形态原样
    [HTTP 树取空响应疑同窗，独占重跑即绿]；矩阵单跑同期 15/15+14/14
    双绿交叉印证——PLAN-006 同款 gate 窗节拍，如实记）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-23 merge pass（auto-plan-merge）**：
  - `stage: merge` | outcome: **pass** | completion_kind: **delivered**。
  - **prepared** = reviewed 基线（reviewed_commit=c6ff4cf；复审提交为
    766ed53 的 docs-only 后代[diff 全窗口仅计划文件 +56/-2，实现/依赖
    零变化——delivery_commit=c6ff4cf 资格成立]）；canonical delta =
    SD-701..704 已于 T-05 落位 docs/ 根三件（本仓知识库约定——
    PLAN-001..006 在案先例，无 docs/specs/ 面）。
  - **landed** = main tip == c6ff4cf == delivery（直接 main 线性约定，
    本仓无 worktree/dev 分支；ancestry 3b46b5b→c6ff4cf 六提交线性直
    证）；归档前冒烟 merged **15/15 + 基线 v7 零漂移** ALL GREEN
    （e2e/.runtime/merge-smoke.log）。
  - **ledger_refreshed** = docs/parity-ledger.md v10 于 main 读回
    （header v10 + D-25 file 切片实勘集在册 + 25 项三分类）——无
    live ledger 服务，PLAN-001/005/006 同判（tracked 派生面即账本）。
  - **archived** = git mv → docs/plans/archived/007-file-manage-
    slice.md + status: archived + completion_kind: delivered。
  - **cleaned** = 无 worktree/dev 分支待清（直接 main 约定；worktree
    清单仅主检出 D:/autostack/jade-edit、分支清单仅 main+origin/main、
    工作树 tracked 零 WIP——唯一未跟踪件 docs/plans/008-tags-wanted-
    slice.md 为**并行会话外来产物**[006 归档窗同款]，非本计划范围，
    保留不动）。
  - `next: —`（闭环；候选池 §10.7 在案 + PLAN-008 草稿已现工作树）。

- **2026-09-23 复审 pass（auto-plan-work 收口后，auto-plan-review；revision 1 保持）**：（auto-plan-work 收口后，auto-plan-review；revision 1 保持）**：
  - `stage: review`，PLAN-007，revision 1。
  - `outcome: pass`——execution_done → reviewed，next=merge。
  - `reviewed_commit: 766ed534261e1e6437938e8864510d868769fc3b`；
    `base_commit: 3b46b5b33aa88002c0f216d47d26c63e42fb0c8d`（plan006
    归档态；merge-base 线性确认，五提交无合并噪声）。
  - `dependency_revisions`：无依赖工作树/分支（直接 main 线性约定；
    deps/bps·stylekit 只读拷贝零触碰——auto-lang 仓外来 WIP 69 项为
    先在面[PLAN-006 T-05 同判]，本计划全程零写入）。
  - `spec_inputs`：ARCHITECTURE.md@766ed53（§5 SD-701 段/§6 SD-702
    表）/README.md@766ed53（SD-703/704）/parity-ledger.md@766ed53
    （v10 25 项）；frontmatter new_spec_components 四项终化、
    supersedes 空（纯增量正确）。
  - **独立性声明**：实现会话内复审（无独立会话），裁定自工件重建
    ——AC 复现全部本地重放，不采信执行期摘要（PLAN-006 同款）。
  - `acceptance_results`：
    - **AC-01 pass**——`node tests/probe_delete.mjs` 复审基线重放：
      九案全过 + 双臂一致=true；契约/实现源检（diff 自 base）与
      SD-701 三步定文逐条对应（.ad 卫先于 exists/返值忽略/删后双
      复核）。
    - **AC-02 pass**——gate 重放含 vm file 组八子步双臂（13：两臂
      分叉断言域实录与计划 §8 修订一致）+ e2e file 段五子步
      （[13 file] PASS 行实录 gate-review.log）；取消零落盘/悬空翻
      转/no-op 全断言。
    - **AC-03 pass**——`node scripts/gate.mjs` 复审重放 **exit 0
      一次通过**（merged 15/15 + split 14/14 + vue build + e2e 十四
      段；本跑零 D-21 重试——收口窗前 2 败已如实记 §9/§8 T-05）。
    - **AC-04 pass**——gate B 检查=基线 v7 零漂移（复审 HEAD）；
      dump 含 new_open/delete_open/new_q 三字段（源检）；v7 头注重
      锁因由三项齐；v6 留档在库；锁定时连跑 3 次零漂移在案。
    - **AC-05 pass**——四件重验：家族仓零写入（本会话；外来 WIP 不
      触碰）/旧园零代码引用（唯一命中=wsys.at:333 出处注释）/补件
      面零增量（scripts/ 本计划零 diff）/gen hash bbf44dad0af4ae67
      与 T-05 记录逐字节同（gate 内 build 再生后复测——确定性）；
      Ctrl+N untitled 回归 = gate 全绿内含（vm 10b/12①/7/9 + e2e
      同段）。
    - **AC-06 pass**——锚注齐（SD-701@ARCHITECTURE:289/SD-702@§6
      头+probe 行/SD-703@README Tests/SD-704@README 文档节）；ledger
      v10 = 25 项 D 行 + README「二十五项」+ SD-704 指针一致；触发
      集 v4 指针双面（ARCHITECTURE + app.at 注释）；语义对照并表
      与实测行为对读一致（改名改写 SD-601 / 删除悬空 delete_page
      零改写——probe 负证重放）。
  - `findings`: 无阻塞。三项执行期修正（预览期望值 3 处/邻档两臂
    异位/弹层锚结构定位）= 证据驱动测试面校正，语义契约（§5/§7）
    零变化——revision 1 保持（PLAN-006 预览期望值校正同判）；
    app.at console 排雷（8 处 App 上下文移除）= vue 轨潜伏缺陷排除
    [D-25①]，行为面 gate 全绿零回归，已入 ledger 供料候选；D-21
    收口窗 2 败 = 在册形态非回归。
  - `evidence`: e2e/.runtime/gate-review.log（gate exit 0 全门）+
    probe_delete 本地重放 RESULT 行 + 本文 §8 各任务证据块（持久工
    件：tests/probe_delete.mjs、tests/baseline/structure-v7.txt 入
    库可复跑）。
  - `next: merge`。

- **2026-09-23 work 收口（auto-plan-work）**：
  - `stage: work`，PLAN-007，revision 1。
  - `outcome: pass`——T-01..T-05 全收口，execution_done。
  - `code_commit`：T-05 收口提交（本记录随附）；base = 3b46b5b
    （PLAN-006 归档态——单写者主线前提满足）；线性五提交
    T-01 b50b146 → T-02 f07d259 → T-03 fc30a57 → T-04 b7d8fa0 →
    T-05（本提交）。
  - `task_ids: T-01..T-05` 全收口（current_step 5/5）。
  - `evidence`: **gate ALL GREEN**（T-04 判绿窗一次通过；T-05 收口
    复跑第 3 跑绿——前 2 跑 split check-10 面板行 D-21 v9 形态如实
    记；vm merged 15/15 + split 14/14 + vue build + e2e 十四段）；
    基线 v7 连跑 3 次零漂移
    （15/15×3，v6 留档）；probe_delete 九案双臂一致全绿；smoke-t02
    7/7 + smoke-t03 6/6；负向证四件 + Ctrl+N untitled 回归零变化
    （T-05 证据块全录）；执行期修正三项授权内记录（§6 期望值 3 处
    校正/弹层锚结构定位/App 上下文 console 排雷——D-25①）。
  - `blockers: 无`。
  - `next: review`。
- **2026-09-23 预立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-007，revision 1。
  - `outcome: pass`——可进 work，**前提 = PLAN-006 归档**（§4.1
    单写者约定；接地基线 b92e07a 执行态）。
  - `next: work`（006 归档后 T-01 起）。
  - 无待裁探针（dialog 主形态/delete POST/File.delete 双复核全为
    PLAN-006 已证面）；§10 观测项两项非阻塞。

## 10. 待澄清事项

1. **Delete 键位 actions 面形态**（**已裁定**——T-02：shortcut "Delete" 字面 boot 吸收零 fallback，F2 同构预期兑现；menubar-item vm 轨 Popover lowering=button 头实勘入 D-25②）：原观测：shortcut
   "Delete" 字符串面（F2 同构预期——keydown 回退层）；若 actions 面
   对裸修饰键名解析异常 → fallback 菜单项/`Ctrl+Shift+Backspace`
   备选（键位面小改，不涉契约）。
2. **Ctrl+N vs EXPLORER「＋」双口径**（**已裁定**——默认并存生效：SD-701 语境区隔注记已落；合并口留 r2 非阻塞）：untitled
   草稿（不落盘）与落盘新档两语境并存 + SD-701 注记；若用户要合并
   （Ctrl+N 直落盘）→ r2 小范围（ActNew 流改接 create_page——
   untitled 流退役面大，需单独评估 dirty 档语义）。
3. **删除即清理入链**（**已裁定**——默认不做生效：SD-701 语义对照并表已落「清理属悬空清单/wanted pages 批」）：v1 悬空化 + 预览防线；若用户要
   「删除时改写入链为悬空标记/清除」→ r2（复用 SD-601 改写器——
   语义需另裁：清除 or 标记）。
4. **D-21 POST 波及**（**已裁定**——v10 扩记闭合：每操作单 POST 密度不升实证；执行窗三形态实录[check-10 面板行 1 败/save 磁盘标记漂移 1 轮/HTTP 400 瞬时]全数签名吻合重跑即绿，file 组零失败漂移——ledger D-21 v10）。
5. **`File.create_dir` 可调性**（PLAN-008 前置探针预告，本批不涉）：
  别名在册（native_catalog 1004）未证——D-20①/D-24① 教训；目录面
  （新建目录/移动）批首闸。
6. **同名大小写边界**（**已裁定**——v1 接受：exists 卫语句命中→幂等打开既有档；e2e/vm 幂等子步实测同判；casefold 联动裁决另立）：`create_page("Index")` 幂等打开
   `index.ad`？——精确 stem 下 `Index` ≠ `index`，但 Windows 实盘
   `Index.ad` 与 `index.ad` 同档（exists 卫语句命中 → 幂等返回现
   路径）——行为=打开既有档，v1 接受（casefold 批联动裁决已在
   PLAN-006 §10.4 留档）。
7. **PLAN-008 候选池**（本批后更新）：大纲（D-12 解锁）、移动/新建
   目录（create_dir 探针前置）、tags 面板/unlinked mentions
   （frontmatter 面首开——D-14 联动）、悬空链接清单（wanted pages
   ——link_index 派生收割件）、检索上量微批、`File.rename`/`copy`
   别名供料回执件。
8. **PLAN-006 复审耦合**（**已裁定**——006 archived/delivered[3b46b5b]，复审 pass/merge 不触发，docs-only 面先例兑现；共享面零漂移本计划全程门实证）：006 复审若出 needs_fix 返工
   且涉共享面（rename 弹层/refresh 双件/CloseTabsOf 所倚 RemoveAt
   形态）→ 本计划 r2 跟随修订（接地证据重核）；复审 pass/merge 不
   触发（docs-only 面先例）。
