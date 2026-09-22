---
plan_id: PLAN-005
status: execution_done
feature_name: dangling-create-slice
author: [zhaopuming]
created_at: 2026-09-22T23:36:52+08:00
updated_at: 2026-09-22T23:36:52+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-501"
  - "docs/ARCHITECTURE.md#SD-502"
  - "docs/README.md#SD-503"
  - "docs/README.md#SD-504"
touched_goals: []
---

# [PLAN-005] 知识库第三切片——悬空建页闭环（点击悬空链接创建并打开目标页）

## 0. 变更摘要

SD-301/SD-405 主线第三片：**wikilink 写闭环收口**——目前链接面只读
（悬空出链行渲染为非点击文本，PLAN-003 交付形态），本切片让
「点击悬空链接 → 确认 → 创建目标页 → 打开 → 索引/树刷新」整弧线可用。
至此知识库最小环完整：**链接（读）→ 检索/快开（找）→ 建页（写）**。

- back 新契约 `create_page(title)`（**POST**，D-19 适配——悬空目标多为
  CJK，front 侧 `exists` GET 守卫在 split/vue 臂对 CJK 失效，故守卫
  **back 侧内移**：幂等（已存在 = 不写返回现路径）+ 非法字符清洗 +
  根落位 + 最小模板）。
- front 悬空出链行 button 化 → 确认弹层（alert-dialog 在册族，旧园
  CreatePagePrompt「Create missing page?」先例）→ 创建流（打开新档 +
  链接索引刷新（触发集 v2 增「建页成功」）+ **树重取**（新档入
  EXPLORER；快开数据源 ft_nodes 随之更新））。
- 免探针设计一处：title→path 清洗用 **while-contains 收敛惯用法**
  双侧面规避 `.replace` 次数语义双轨未证风险（ts_adapter.rs:1219
  JS `String.replace` 串参=首现替换；VM 全量与否未证——惯用法两态
  皆收敛）。

旧园先例移植（冻结池，零代码引用）：CreatePagePrompt.vue（确认弹层
形态）+ wikiLink.ts `wikiTitleToPath`（清洗规则）+ files.rs
`default_ad_content`（模板——**不搬 frontmatter 面**，jade v0 逐字
保留哲学，D-14 不动）。

## 1. 目标

- **G1（建页闭环可用·双轨）**：打开含悬空出链的档 → 悬空行可点击 →
  确认弹层（目标名 + 将创建的路径预览）→ 确认 → 新页创建于工作区根、
  以新档打开、EXPLORER 树出现新行、链接面板该行 exists 翻转为可点击
  导航行；取消则零落盘。vm/vue 两轨同单验证（SD-204 口径）。
- **G2（back 契约语料首锁）**：`create_page` 六案（新建 / CJK 目标 /
  非法字符清洗 / 已存在幂等且内容不变 / 清洗后空名守卫 / 返回相对
  path + 落盘复核）merged 直调与 split HTTP 双臂一致。
- **G3（陈旧面顺收）**：Init 树取段提取 `refresh_tree()` 共享——建页
  成功与 **Save 新档**（先在陈旧面：untitled 落盘后树不刷新）两触点
  接线。
- **G4（测试面）**：vm 矩阵 link 组扩建页子步弧线 + e2e 同弧线；基线
  v5 计划内重锁（store 增确认弹层面字段）。
- **非目标**（明确排除）：
  - 重命名/移动 + 反链改写（知识库杀手件但独立切片——含「改写 vs
    断链」语义决策，PLAN-006 候选首位）；
  - 树上右键新建/删除文件管理（Typora/VS Code 线件，独立批）；
  - frontmatter 写入面（created_at/updated_at 模板字段——旧园
    default_ad_content 含 frontmatter，jade **不搬**：v0 frontmatter
    逐字保留哲学 + D-14 在册排除；模板 = 纯 body `# {target}\n\n`）；
  - 建页落位选择（指定目录/同名目录跟随来源档——v1 恒根落位，旧园
    wikiTitleToPath 同判；配置面后续批）；
  - 反链面板中的悬空提示（悬空只出现在**出链**行——反链行天然指向
    存在档）；
  - 大纲面板（Typora 线第二件——D-12 定位事件面门控，只读形态半值，
    供料解锁后议）；
  - 上游件实做与生成物补件（只记账不补生成树，AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第三片是悬空建页）

- **候选池对表**（PLAN-004 §10.4 在案）：悬空建页 / 大纲（D-12 定位
  探针前置）/ 图谱（vm 组件面依赖上游）。北标口径（SD-405）下：短期
  Typora 线下一件 = 大纲，但其核心交互（点击跳转）被 D-12 编辑器
  事件面门控（key/content/final/oninput/on_focus 实勘，无定位/滚动
  锚——ledger v7 在案），只读大纲半值；**悬空建页**无任何上游阻塞、
  为两线综合最优（候选池 #1），且收口知识库「写」半环——与已交付
  读面（PLAN-003）/找面（PLAN-004）构成完整最小环。
- **旧园先例完整**（冻结池实读）：确认弹层（CreatePagePrompt.vue：
  「Create missing page?」+ Cancel/Create + 路径预览 chip）、清洗规则
  （wikiLink.ts:54-61 `wikiTitleToPath`：`\/:*?"<>|` → `-`、空白
  折叠、trim、`.ad` 后缀、根相对）、back 创建端点（files.rs:157
  `/api/files/create` + default_ad_content 模板）。jade 适配三处：
  确认弹层用 alert-dialog 在册族（非自绘 overlay）；模板去 frontmatter
  面；清洗简化（空白折叠/`_`→空格不搬——语料无此形态）。

### 2.2 数据面（back：`create_page` 新契约）

```rust
/// 悬空建页：title 清洗 → 工作区根落位 {safe}.ad；已存在 = 幂等不写
/// 返回现路径；成功返回相对 path（""=失败）。body 模板 = "# {target}\n\n"
/// POST /api/create_page
#[api(method = "POST", path = "/api/create_page")]
pub fn create_page(title str) str {
    return wsys.create_page_impl(title)
}
```

- **POST 通道**：同 search_wiki/write_wiki 判据——悬空目标多为 CJK
  （语料 `[[首页]]`），GET query 在 split/vue 臂不解码 UTF-8（D-19）；
  POST body CJK 已证（PLAN-004 search_wiki 双臂实录）。
- **幂等守卫 back 侧内移**（设计关键）：front 侧 exists 预检对 CJK
  在 split/vue 臂失效（D-19），且「先 exists 后 write」两跳间有竞态——
  守卫收进 back 单事务：`File.exists` 复核（back 侧 resolve 后直查，
  无 HTTP 解码环节）→ 已存在**不写**（write_body 对存在档会改写 body
  ——绝不复用）返回现路径；不存在 → 模板写入 + exists 复核。
- **清洗规则 v1**（title_to_path，back 权威）：`\/:*?"<>|` 九字符 →
  `-`（**while-contains 收敛惯用法**：`while s.contains(c) { s =
  s.replace(c, "-") }`——`.replace` 次数语义双轨未证（JS 串参=首现
  替换 ts_adapter.rs:1219；VM 全量与否未证），惯用法首现/全量两态皆
  收敛，免探针）+ `.trim()` → 空 = 守卫返回 ""；非空拼 `.ad`，根
  相对（resolve("") = 工作区根，目录必在——无父目录创建面）。
- **模板**：`"# " + target + "\n\n"`（target = wikilink 原文，非清洗
  后名——显示保真）；无 frontmatter（§1 非目标第三条）。

### 2.3 消费面（front）

- **store**（editor_store.at）：`create_confirm_open` bool +
  `create_target` str + `CreateConfirmOpen(target)` /
  `CreateConfirmCancel()`（弹层面状态居 store——confirm_open/
  quit_confirm_open 在册分野）。
- **App 模型**（app.at）：无新增数据态（弹层态在 store；建页结果即
  时消费不入态）——**基线 v5 变更面 = store 两字段**。
- **悬空行 button 化**：outlink 行 `!r.exists` 分支由 `text
  "${r.target}（悬空）"` 改 `button` → `.CreateClick(r.target)`
  （exists=true 分支不动——OpenLink 导航）。
- **确认弹层**：alert-dialog（open: .store.create_confirm_open）——
  标题「创建缺失页面？」+ 描述 `[[{target}]] 尚不存在` + 路径预览
  （`title_to_path` front 镜像纯函数——同一 while-contains 惯用法 +
  九字符 replace 链；**仅显示用**，权威在 back，漂移=观感非正确性）
  + 取消/创建双钮。
- **创建流** `.CreateGo`：
  1. `r = create_page(.store.create_target)`（try/catch 落 console_log）
  2. `r != ""` → `store.CreateConfirmCancel()`（关弹层）+
     `store.Open({ path: r })` + 链接行重算（显式 r——OpenFile 先例）
  3. **链接索引重取**（触发集 v2：Init/Save 成功/面板开启/**建页
     成功**——to_value 双取形沿 house 形态）→ 该悬空行 exists 翻转
  4. **`refresh_tree()`**（Init 树取段提取共享：`ft_nodes = json.
     to_value(tree(root, 4))` try/catch 同形）——EXPLORER 新行 +
     快开 collect_ad_paths 数据源随 ft_nodes 更新（零额外接线）。
- **Save 新档陈旧面顺收**：ActSave 成功分支接线 `refresh_tree()`
  （先在行为：untitled 落盘后树陈旧至重开——§4.2 接地在案；同族陈旧
  面单点收口，G3）。

### 2.4 交互面（无新 actions）

无快捷键/menubar 增量（触发面 = 悬空行点击，语境入口）；弹层取消语义
= alert-dialog-cancel 在册族。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件族（alert-dialog/button/text 全在册）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-22 会话口述：「计划004 已经完成；请 [$auto-plan-new]
  规划下一个计划」——**立项授权**：确定下一计划并起草执行契约。
  方向选择（悬空建页）为本计划建议（§2.1 依据 + §10.4 替代项代价），
  handoff 未否决即生效（PLAN-004 §10.4 同款约定）。
- 北标口径（SD-405，已落 canonical）：短期 Typora / 长期 Obsidian、
  Notion、飞书——本切片 = 长期线写闭环件；短期线下一件（大纲）门控
  依据见 §2.1。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-22）

- **旧园建页先例**（冻结池实读）：
  - `front/src/components/CreatePagePrompt.vue`——确认弹层（标题
    "Create missing page?"、`[[title]]` 展示、`wikiTitleToPath` 路径
    chip 预览、Cancel/Create emit）；
  - `front/src/lib/wikiLink.ts:54-61`——`wikiTitleToPath`：
    `[\\/:*?"<>|]` 正则替换为 `-` + `\s+`→单空格 + trim + `.ad`
    （**根相对**，无目录前缀）；
  - `back/server/src/files.rs:157-174`——`/api/files/create` +
    `default_ad_content`：frontmatter（title/created_at/updated_at）+
    `# {title}` body（jade 不搬 frontmatter 面，§1 非目标）。
- **`.replace` 发射形态**：auto-lang `crates/auto-lang/src/ui_gen/
  ts_adapter.rs:1219-1231`——`(subj).replace(a, b)` 两参直发（JS
  `String.replace` 串参 = **首现替换**）；VM 侧 `.replace` 全量与否
  未证（wsys json_esc 在册用法未触多现案例）→ while-contains 惯用法
  双侧规避（§2.2）。
- **本仓现状**：
  - 悬空行渲染：app.at 出链 `!r.exists` 分支 = 非点击文本
    `${r.target}（悬空）`（PLAN-003 交付形态）；vm_matrix.mjs:419-420
    已锁「首页（悬空）」已知答案——**语料 Hello World.ad 悬空出链
    `[[首页]]` 即本切片天然建页弧线素材**（fixture 每次全新隔离拷贝，
    建页零污染）；
  - 链接刷新触点：Init/ActSave/ActBacklinks/LinksRefresh 四处同构
    双取形块（app.at 在册）——建页成功为第五触点；
  - 树取面：Init handler 内联 try/catch（root=ws_root() + tree+parse
    + file_basename）——提取 refresh_tree() 共享（G3）；
  - 确认弹层族：confirm_open/quit_confirm_open alert-dialog 在册
    （app.at 两实例）；store 弹层面字段分野在册；
  - write_body 语义（wsys.at）：存在档 = 保 frontmatter 改 body
    （**不可作建页通道**——幂等守卫需 back 单事务，§2.2）；新档 =
    直写 body；
  - D-19/D-20②③④⑤/D-21/D-22 纪律表（ledger v7）：POST CJK 通道
    双臂已证（search_wiki 先例）；列表元素先拷局部；CJK `.length` 禁
    截断；to_value 顶层数组 + 双取形；POST 负载窗 flake = README
    重跑口径。
- **基线**：structure-v4.txt（46 行，store find 面 + App find 面）；
  v5 变更面 = store create_confirm_open/create_target 两字段（App 无
  新数据态）。

### 4.3 与既有计划的关系

- 直接复用 PLAN-003 链接面（outlink 行集/刷新触点/OpenLink）与
  PLAN-004 find 面（ft_nodes 数据源——refresh_tree 后快开自动新鲜）；
  复用 PLAN-001 write_wiki 的落盘复核形态。
- 不触碰上游供料包件；D-12/D-16/D-17/D-19/D-21 留观不变（本计划对
  D-19 只有 POST 适配、对 `.replace` 语义只惯用法规避 + 供料候选
  记账，无修复）。
- PLAN-006 候选池（本计划 §10.4 更新）：重命名+反链改写（首位）、
  树文件管理（新建/删除）、大纲（D-12 解锁后）、检索上量微批
  （StringBuilder/depth 参数化）。

## 5. 详细设计

### 5.1 `create_page` 契约与 wsys 实现（SD-501 back 半）

```
pub fn create_page_impl(title str) str {
    // ①清洗：九字符 while-contains 惯用法（每字符：
    //   while t.contains(c) { t = t.replace(c, "-") }——首现/全量
    //   两态收敛）+ trim；空 → return ""
    // ②path = safe + ".ad"（根相对——resolve("") = 根）
    // ③幂等守卫：File.exists(resolve(path)) → return path（不写）
    // ④模板落盘：File.write_text(resolve(path), "# " + title + "\n\n")
    //   （title = 原文，非清洗名——显示保真）
    // ⑤复核：File.exists → path；失败 ""
}
```

### 5.2 front 接线（SD-501 front 半）

- store：`create_confirm_open`/`create_target` + `CreateConfirmOpen
  (target)`/`CreateConfirmCancel()`（msg 面对齐 confirm 族）。
- app.at：msg `CreateClick(str)`/`CreateGo`；悬空行 button 化；
  alert-dialog 第三实例（路径预览 = `title_to_path` 镜像纯函数，
  模块级 fn——与 backlink_rows_of 同位）；`.CreateGo` 四步流（§2.3）；
  `refresh_tree()` 提取 + Init/建页成功/Save 成功三触点接线。
- 链接索引重取第五触点 = `.CreateGo` 内（双取形同构复制——五触点
  重复块已达阈值，**提取 `refresh_links()` 局部 fn 一并收口**（纯
  重构，五触点同形——vm 冒烟 + link/find 组回归证行为零变化）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-501 | modify | docs/ARCHITECTURE.md §5 链接域语义段 | before：刷新触发集 v1 = Init/Save 成功/面板开启；悬空行 = 非点击文本；无建页面。after：增「悬空建页语义」子段——触发 = 悬空出链行点击 + 确认弹层（alert-dialog 族）；title→path 清洗规则（九字符→`-` while-contains 惯用法 + trim + 根落位 `.ad`，front 镜像仅显示）；back `create_page` POST 契约（幂等不写/模板 `# {target}\n\n` 无 frontmatter/落盘复核）；刷新触发集 v2 = v1 + **建页成功** + **树重取**（refresh_tree 共享；Save 新档同接线）；`.replace` 次数语义双轨未证 → 惯用法纪律 | wikilink 写闭环的规范锚；D-19 守卫内移与免探针设计以规则沉淀 | AC-01/02/06 |
| SD-502 | modify | docs/ARCHITECTURE.md §6 | before：十二组检查 + 基线 v4。after：link 组子步扩（建页弧线：悬空行点击/弹层/创建/开档/树新行/exists 翻转/取消）+ **基线 v5**（store create 面字段；v4 留档）；组数不变（12 组，建页子步入 link 组——链接域内聚） | 测试体系表更新（PLAN-003/004 同步先例） | AC-03/04 |
| SD-503 | modify | docs/README.md Tests 节 | before：13+12+十一段口径、基线 v4 指针。after：口径不变注记「link 组含建页弧线子步」+ 基线 v5 指针 + N 定谳续记 | 判绿口径单一权威面（SD-204/304/403 续） | AC-03/04 |
| SD-504 | modify | docs/README.md「是什么/文档」节 | before：第二切片=查找面板。after：**第三切片=悬空建页闭环**条目（wikilink 读/找/写最小环收口注记）+ ledger v8 指针 | 产品主线进度面派生同步（SD-303/404 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：merged 直调 + serve-back POST 六案——
  ①新建（ASCII 目标 → 落盘 + 返回 path + exists 复核）②CJK 目标
  （`首页` → `首页.ad`，POST 双臂——D-19 面）③清洗（`a/b:c*d` 形 →
  `a-b-c-d.ad`；含 CJK+非法混形）④已存在幂等（对语料 `index` →
  返回 `index.ad` **内容逐字节不变**）⑤清洗后空名（`///` → ""）⑥
  模板断言（新建档 read_body == `# {target}\n\n`）。
- **vm 矩阵 link 组建页子步（T-04）**：开 Hello World.ad（悬空出链
  `[[首页]]` 在册已知答案）→ ①悬空行点击（button 锚）→ 弹层快照
  （create_confirm_open/create_target 态）→ ②确认 → 新档打开
  （active_path == `首页.ad`——**CJK 建页导航子步仅 merged 臂**，D-19
  开档面同判；split 臂以磁盘 exists + 返回 path 断言替代）→ ③树新行
  （ft 快照含 `首页.ad`）→ ④链接重取后 exists 翻转（出链行
  `首页` 变可点击钮）→ ⑤取消路径（弹层 → Cancel → 磁盘无新档 +
  状态复原）。
- **e2e（T-04）**：同弧线入 link 段（真 DOM：悬空行 click → dialog
  断言 → 创建 → editor 内容 `# 首页` + 树行 + 面板翻转；CJK 建页
  全臂可用——POST 创建 + vue 开档走 read_wiki GET？**CJK 开档在 vue
  臂受 D-19** → e2e 弧线用 ASCII 悬空目标（语料补 fixture：Hello
  World 增 `[[NewPage]]` 悬空出链？**不改语料**——用 `Projects` 档？
  语料悬空目标仅 `首页`。**fixture 增补走 JADE_FIXTURE 通道或矩阵内
  动态写**——T-04 落定：倾向测试内先经 write_wiki 造 ASCII 悬空源
  档，再走弧线，零语料改动）。
- **基线 v5（T-04）**：store 两字段入 dump 计划内重锁；连跑 ≥3 次
  零漂移；v4 留档。
- **负向（T-05）**：regen-vue 补件面零增量；冻结池/家族仓零接触；
  refresh_links/refresh_tree 重构行为零变化（link/find/树组回归）。

## 7. 验收标准

- **AC-01（back 契约）**：`create_page` POST 契约落 api.at + wsys
  实现；§6 六案双臂全绿；幂等案内容逐字节不变；清洗案产物名精确。
  验证：T-01 直证脚本实录。
- **AC-02（建页闭环双轨）**：悬空行点击→确认→创建→开档→树新行→
  exists 翻转→取消零落盘，vm（snapshot+state）与 vue e2e 同断言域
  全绿（CJK 建页导航子步 merged 臂 + split/vue 以磁盘/返回值断言——
  D-19 口径注记）。验证：T-04 link 组子步 + e2e link 段。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **13/13** + split **12/12**（组数不变）+ vue build +
  e2e **十一段**（段内子步扩）；判绿实录进 §9（无-RESULT 早崩按
  README 口径重跑即绿，次数如实记）。
- **AC-04（基线 v5）**：计划内重锁完成、v4 留档、连跑 ≥3 次零漂移；
  dump 含 create_confirm_open/create_target。
- **AC-05（负向证）**：冻结池与家族仓零接触（git status 证据）；
  `gen/` 无手改；旧园代码零引用；补件面零增量（D-13/D-15 残余集
  不变）；refresh_links/refresh_tree 重构前后行为等价（回归组实录）。
- **AC-06（文档面）**：SD-501..504 落位且 canonical 文中锚注齐
  （SD-301..404 先例）；parity-ledger **v8**（`.replace` 次数语义
  双轨未证 → D-20 增补或新 D 条目 + while-contains 惯用法纪律；
  执行期新实勘入册）。

## 8. 执行步骤

> 每任务收口 = 代码 + 验证命令实录进本节证据块；§10 观测项闭合标
> 「已裁定」。

- **T-01 back 契约 + 实现 + 六案直证**（AC-01）
  - api.at 增 `create_page` POST；wsys.at `title_to_path`（while-
    contains 惯用法）+ `create_page_impl`（幂等守卫/模板/复核）。
  - 六案 merged 直调 + serve-back POST 直证（CJK 案双臂）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（link/save/find
    组回归零变化）。
  - **证据（2026-09-22）**：
    - ①实现 = api.at `create_page(title)` POST /api/create_page（单参
      POST——write_wiki/search_wiki 同族通道）+ wsys.at `title_to_path`
      （九字符 while-contains 收敛惯用法 + trim + 空名守卫）+
      `create_page_impl`（幂等守卫 File.exists 不写返回现路径 / 模板
      `# {title}\n\n` 原文 / exists 复核）。
    - ②**直证脚本 = tests/probe_create.mjs**（新增入库——可复放工件），
      双臂：merged = 临时探针工程（e2e/.runtime/probe-merged/ 脚本生成
      ——pac render vm + src/back 整树拷贝 + 探针 widget Init 直调九案
      落 model 字段，`auto run -r vm` 进程内 CALL，autoui_state dump
      读回；入口文件名固定 app.at——首跑实勘）；split = serve-back:8253
      POST JSON body（CJK 走 body——D-19 通道）。**RESULT：双臂全案
      通过（9 案返回值 + 模板/幂等/守卫磁盘复核）+ 双臂一致=true**——
      案①"Probe Page"→"Probe Page.ad"；②"首页"→"首页.ad"；③"a/b:c*d"
      →"a-b-c-d.ad"、"标/题"→"标-题.ad"；④"seed"×2 及"首页"再调幂等
      （返回现路径 + **seed.ad 逐字节不变**）；⑤"///"/"   "→""（**零
      落盘**，无 ---.ad）；⑥四新建档 read 逐字节 = `# {title}\n\n`
      （**原文非清洗名**——显示保真实证：a-b-c-d.ad body =
      `# a/b:c*d\n\n`）。
    - ③**清洗规则勘定一处（授权内记录）**：§6 案⑤ `///` → "" 与
      §2.2/§5.1「九字符→`-`+trim→空守卫」字面规则不相容（`///` 替换
      后为 `---` 非 trim 空）。裁定 = **守卫语义以案⑤钉定**：trim 空
      **或** 九字符收敛后恰 `"-"`（`///` 形——全非法字符名替换后只剩
      分隔符，无名可立）→ ""；机制 = dash-收敛探针（同 while-contains
      惯用法族，非 `--` 收敛至恰 `-`，无 length/slice——CJK 字节语义
      零暴露）。front 镜像同规则（T-02 落）。规则文本已按此写入
      wsys.title_to_path 注（SD-501 定文以此为准）。
    - ④回归 = `node tests/vm_matrix.mjs` 双臂全绿：merged **13/13** +
      split **12/12**，**基线 v4 零漂移**（back 增量对既有行为零变化）。
    - ⑤附记：merged 探针同时证明 **replace 变量实参在 VM 可用**
      （`t.replace(c, "-")` c 取自 List 元素——先拷局部，D-20② 纪律
      形态）；`.replace` 首现/全量两态收敛惯用法实测通过（账面纪律
      不变，SD-501/ledger v8 记）。
- **T-02 front 弹层 + 悬空行接线**（AC-02 前半）
  - store 两字段 + CreateConfirmOpen/Cancel；app.at 悬空行 button 化
    + CreateClick + alert-dialog 第三实例 + `title_to_path` 镜像
    纯函数（路径预览）。
  - 验证：merged 手动冒烟（悬空行点击→弹层快照→取消零落盘）+
    `pnpm build` PASS。
  - **证据（2026-09-22）**：
    - ①实现 = editor_store.at `create_confirm_open`/`create_target` 两
      字段 + `CreateConfirmOpen(str)`/`CreateConfirmCancel` msg 对（弹层
      态居 store——confirm 族分野先例；Cancel 只关弹层，target 留置待
      覆写）；app.at = `use back.api` 增 create_page + `title_to_path`
      front 镜像纯函数（与 back 同规则同惯用法，含 T-01 dash-收敛守卫）
      + widget computed `create_preview`（ft_rows 同族——computed over
      store 态双轨可用，冒烟实证）+ msg `CreateClick(str)/CreateGo/
      CreateCancel` + 悬空行 `text` → `button（text: "${r.target}（悬空）"）`
      （attr 单段插值——span 内容插值同族发射，gen App.vue 源检
      `{{ r.target }}` 同构）+ alert-dialog 第三实例（标题/描述
      `[[${target}]] 尚不存在`/预览 `将创建：${.create_preview}`/取消+
      创建双钮）+ `.CreateGo` 核心流（create_page try/catch → 成功关弹
      层 + OpenLink(r) 开新档；失败/守卫空名弹层留置 + console 注记）。
    - ②`pnpm build` PASS（裸 strict 生成 + vue-tsc 0 错 + vite build
      绿——attr 插值/第三弹层/镜像 fn 的 vue 轨编译证）。
    - ③**merged 冒烟全过**（e2e/.runtime/smoke-t02.mjs，六断言）：悬空
      行点击 → `create_confirm_open=true`/`create_target=首页` + 弹层
      标题「创建缺失页面？」/描述「[[首页]] 尚不存在」/预览「将创建：
      首页.ad」三断言在快照；取消 → 弹层闭 + **磁盘零落盘**；再开 →
      创建 → `active_title=首页`（**跨分发读 .store.create_target 无
      陈旧投影**——T-03 实勘陈旧面仅同分发内改后读）+ active_body 播种
      `# 首页` + 磁盘 首页.ad 在。
    - ④实勘附记（测试面）：vm 快照中三 alert-dialog 内容恒渲染且弹层
      根为**匿名 col**（无 alert-dialog 头标）——弹层按钮 press 须按
      「创建」钮（全树唯一）的父 footer 行兄弟域定位（smoke
      pressInCreateDialog；T-04 矩阵复用此锚）。
- **T-03 创建流收口 + 共享重构**（AC-02 后半 + G3）
  - `.CreateGo` 四步流；`refresh_links()` 提取（五触点收口）+
    `refresh_tree()` 提取（Init/建页/Save 新档三触点）。
  - 验证：merged 冒烟全弧线（创建→开档→树新行→翻转）+ link/find/
    boot 组回归（重构等价证）+ e2e link 段冒烟。
  - **证据（2026-09-22）**：
    - ①实现 = `.CreateGo` 四步流补全（①create_page try/catch ②关弹层
      + OpenLink(r) 开新档+行重算 ③`.LinksRefreshOf(r)` 链接重取——
      触发集 v2 建页成功，显式 r 避 handler 内 .store 陈旧投影 ④
      `.TreeRefresh()` 树重取——EXPLORER 新行 + 快开 ft_nodes 随新）；
      共享重构 = 五触点 fetch 块收口进 msg handler **`.LinksRefreshOf
      (active str)`**（Init("")/ActSave/ActBacklinks/LinksRefresh 传
      .store.active_path、CreateGo 传 r）+ **`.TreeRefresh`**（Init/
      ActSave/CreateGo）——「局部 fn」落为 msg handler 形态（语言无
      handler 内局部 fn 实证 + json.to_value 只能 handler 体内直调
      [ts_adapter 恒等缺口 D-20⑤] + 状态赋值需 handler 上下文，msg 面
      = 在册共享通道[.FindPick→.OpenLink 先例]）；G3 = ActSave 接线
      `.TreeRefresh()`（**Save 后恒重取**——失败保存重取无害幂等，省
      store 成功态读回的陈旧投影面）。
    - ②**merged 冒烟全弧线全过**（e2e/.runtime/smoke-t03.mjs 八断言）：
      取消零落盘 / 创建→active_title=首页→播种 `# 首页` → links_json
      exists 翻转（`"exists":true,"target_path":"首页.ad"`）→ EXPLORER
      快照含根档 `首页.ad`（TreeRefresh）→ 出链行翻转（首页可点击钮）
      → **G3 Save 新档**：untitled 打字保存（AUTO_SAVE_PATH 旁路）→
      EXPLORER 快照含 `g3-saved.ad`（先在陈旧面收口实证）+ 落盘。
    - ③e2e 冒烟 = `pnpm build`（T-03 重建）+ `pnpm test:e2e` **全绿**
      （vue 轨全检查单含 link 段——button 化后旧断言兼容[getByText 命中
      悬空钮]；write_wiki POST 200 实录）。**D-21 留观续**：本窗 e2e
      连败 3 例后重跑即绿——三例均在 write_wiki 保存点、一例显式 400
      `missing param path` api-err-body 实录（D-21 形态①签名；首例
      quit-save 路径无 ActSave 并发——纯上游窗，非本切片引入）；执行期
      注记 = ActSave 窗内并发 GET 2→3（TreeRefresh 增一），竞态面评估
      为边际增量（D-21 本为任意并发下服务端装配竞态），ledger v8 续记。
    - ④重构等价证 = link/find/boot 组回归随 T-04 基线 v5 锁定后的双臂
      矩阵全绿落账（v4→v5 结构漂移属计划内——第三弹层节点入快照，
      T-03 窗口 v4 基线必漂，组回归以 v5 锁定后全绿为准证；boot/link
      面行为等价已由冒烟 ②③ 预证：Init 共享化后 ready 树链全面 +
      ActBacklinks 共享化后悬空行/反链行全过）。
- **T-04 测试扩单 + 基线 v5 + 判绿首锁**（AC-02/03/04）
  - vm link 组建页子步五步弧线（ASCII 悬空源档测试内造档方案落定）；
    e2e link 段同弧线；基线 v5 重锁。
  - 验证：`node tests/vm_matrix.mjs` 双臂全绿 + `pnpm test:e2e`
    连跑 ≥5 + `node scripts/gate.mjs` ALL GREEN（判绿实录 + N 定谳
    续记）。
  - **证据（2026-09-22）**：
    - ①vm 矩阵 10c 建页子步（子步不占检查位——组数不变 12，fail 即
      臂败）：取消路前置（创建后行翻转即失悬空素材——同弧线素材先走
      取消路，§6 顺序微调授权内记录）→ 弹层态断言
      （create_confirm_open/create_target）→ 取消零落盘 → 创建 → 落盘
      → links_json 翻转（state 级）→ **回源档语境**（OpenLink
      wiki/Hello World.ad——创建成功即开新档、新档自身出链为空，翻转行
      只在源档出链段可见——两臂同按 tab 题钮重算行）→ 面板行翻转
      （悬空钮消失 + '首页' 钮计数消歧：merged ≥2[新档 tab+行]、split
      ≥1[行]——tab 条先于右面板渲染，行钮=快照序末个）→ merged CJK
      开档播种（press 行钮 → active_title=首页 + body `# 首页`）；split
      臂 D-19 口径（active 保持 Hello World，以磁盘/翻转面断言替代）。
    - ②e2e 10c 建页弧线：**ASCII 源档测试内造**落定（§10.7 倾向方案
      定谳）——`request.post('/api/write_wiki')` 造 Create Source.ad
      （悬空目标 NewPage，全 ASCII = vue 臂全弧线可跑[语料悬空目标
      首页为 CJK 受 D-19 开档面]；零语料改动）→ `page.goto('/')` 重载
      （外部写入经 Init 重取方入索引面）→ 弹层三断言（标题/描述/预览）
      → 取消零落盘 → 创建 → 开新档（编辑器渲染 NewPage 标题——**vue
      编辑器 markdown 渲染：DOM 断言用渲染文 '# ' 不落 DOM，逐字节模板
      断言走磁盘**）→ 树新行 → 面板翻转（dangling count=0 + NewPage 钮
      在）→ 磁盘模板逐字节 `# NewPage\n\n`。
    - ③**基线 v5 锁定**（tests/baseline/structure-v5.txt，v4 留档）：
      重锁因由 = store create_confirm_open/create_target 入 dump + 悬空
      行 button 化 + alert-dialog 第三实例（快照恒渲染——id 序列计划内
      扩）；仪器同 v4（state 逐字节 + snapshot id 序列）。
    - ④**判绿实录**：vm 双臂 **4 连跑全绿**（v5 锁后 full run ×3 +
      gate 内 ×1，逐跑 merged 13/13 + split 12/12 + B v5 零漂移；另
      v5 锁定 run merged 12/12[B 采集位不比]）；`pnpm test:e2e`
      **6/6 连跑全绿**（10c 过，15 PASS 行/跑[14+10c]；含 gate 内 1）；
      `node scripts/gate.mjs` **ALL GREEN**（vm 双臂 + vue build
      strict + e2e 同窗连跑）。N 定谳续记（SD-403 口径）：N = 全数，
      无失败集漂移。
    - ⑤**D-21 负载窗实录（留观续，非阻塞）**：本任务窗 e2e 判绿前
      7 失败（均 write_wiki 保存点：check 5 ×6 + check 9 quit ×1；
      ≥2 例显式 400 `missing param path` api-err-body；重跑即绿）——
      窗口期本机**并发家族会话实勘**（lang-692 `run -r vue --server
      vm` + musk-084 release `run --render vm` 与本仓测试同机并行，
      非本会话进程、未触碰）；**时序实验两枚（负结果入账）**：try 包裹
      `store.Save()` **不**发射 await（ts_adapter try-体 await 仅限
      api-client 调用，handler/store 调用均直发——vue 轨 handler 内
      无法对 store 调用定序，保存写 POST 与 App 侧重取 GET 的并发窗
      属生成器形态上限）；ActSave 保存窗并发流 2→3（TreeRefresh 增
      一流）为边际增量评估。处置 = README 重跑口径 + ledger v8 扩记
      （T-05）。
    - ⑥重构等价证（T-03 遗留项闭合）：v5 锁定后 link/find/boot/tab/
      editops/quit 全组双臂 4 连跑零漂移——LinksRefreshOf/TreeRefresh
      收口行为等价（基线 state 段含 links_json 全文逐字节等价）。
- **T-05 文档 + ledger v8 + 收口**（AC-05/06）
  - SD-501..504 canonical 落位（锚注齐）；ledger v7→v8（`.replace`
    语义纪律 + 执行期实勘）；README Tests/产品条。
  - 负向证采集；§9 work 记录（outcome/next=review）。
  - 验证：文档 diff 全窗口检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性）。

## 9. 复审记录

- **2026-09-22 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-005，revision 1。
  - `outcome: pass`——可进 work（授权范围 = §4.1；方向确认含在
    handoff 呈报，未否决即生效——PLAN-004 §10.4 同款约定）。
  - `next: work`（T-01 起）。
  - 免探针设计：`.replace` 语义以惯用法规避（无待裁探针）；唯 §10
    观测项（D-21 波及/大小写不敏感 FS 边界）非阻塞。

- **2026-09-22 work 收口（auto-plan-work）**：
  - `stage: work`，PLAN-005，revision 1。
  - `outcome: pass`——T-01..T-05 全完成，AC-01..06 全数在案。
  - `code_commit: ed759fe(T-01)→1bf7d96(T-02)→6bd444a(T-03)→
    ea1b971(T-04)→本次(T-05)`；base = 44cab26（PLAN-004 归档 tip，
    直接 main 线性约定——本仓无 worktree/dev 分支）。
  - `task_ids: T-01..T-05 全完成`。
  - `evidence`：AC-01 = probe_create.mjs 双臂九案 RESULT 全过 + 双臂
    一致；AC-02 = vm 10c 双臂（merged CJK 开档播种/split D-19 磁盘+
    翻转面）+ e2e 10c 全弧线 + merged 冒烟全弧线八断言；AC-03 = gate
    ALL GREEN（vm 双臂 4 连跑 13/13+12/12 + vue build strict + e2e
    十二段[15 PASS 行/跑]）；AC-04 = 基线 v5 锁定（v4 留档）零漂移
    4 连跑；AC-05 = 负向证四件（家族仓零接触[fixture 隔离拷贝+本仓
    提交链+源目录实勘]/gen regen 双跑等价[hash 逐字节]/旧园零代码
    引用[非注释 grep 空]/补件面零增量[regen-vue.mjs+helpers 零 diff，
    残余垫片族+splice 两件不变] + 重构行为零变化[v5 4 连跑零漂移]）；
    AC-06 = SD-501..504 落位锚注齐 + ledger v8（D-23 增补 + D-21
    扩记）。
  - `blockers: 无`（D-21 负载窗 7 失败重跑即绿——ledger v8 在案，
    非阻塞）。
  - `next: review`（worktree 保留 = 直接 main 约定，本仓无 worktree）。

## 10. 待澄清事项

1. **确认弹层 vs 直接创建**（已随 r1 定，用户可改）：v1 = 确认弹层
   （旧园 CreatePagePrompt 先例 + alert-dialog 在册族 + 误触防线）；
   直接创建（Obsidian 默认形态）为备选——改口仅涉及 `.CreateClick`
   直呼 `.CreateGo`，契约面不变。**已裁定（2026-09-22 交付）**：确认
   弹层形态落地（T-02），改口面保持如上。
2. **模板口径**（已随 r1 定，用户可改）：`# {target}\n\n` 纯 body、
   无 frontmatter（D-14 哲学一致）。**已裁定（2026-09-22 交付）**：
   无 frontmatter 落地（T-01 模板六案直证 + e2e 磁盘逐字节）。
3. **`.replace` 次数语义**（免探针规避 + 供料候选）：while-contains
   惯用法双侧收敛（§2.2）；上游若定谳全量语义可简化为单次调用——
   **已裁定（2026-09-22）**：ledger v8 D-23① 记账（六案双臂实测收敛
   通过；unlock = auto-lang VM 语义文档化）。
4. **方向确认**（用户，handoff 未否决即生效）：第三片 = 悬空建页
   （§2.1 依据）。**已执行**（T-01..T-05 按案交付）。
5. **D-21 POST 波及**（观测项）：**已裁定（2026-09-22）**：执行窗
   e2e 保存点 7 失败实录（家族会话同机并行窗；≥2 例 400 丢参签名；
   重跑即绿）——ledger v8 D-21 扩记（复现率与同机负载正相关 +
   try-await 负结果两枚 + 保存窗并发流 2→3 边际增量评估）；README
   重跑口径覆盖；非阻塞。
6. **大小写不敏感 FS 边界**（观测项）：stem 匹配精确比较下 `A.ad` 与
   `a.ad` 视为不同档，但 Windows 实盘同档——v1 记账（语料无此形态），
   收口随重命名批（casefold 匹配裁决）一并议。**留观不变**。
7. **e2e 弧线语料方案**（T-04 落定）：**已定谳（2026-09-22）**：ASCII
   悬空源档测试内造（write_wiki POST 造 Create Source.ad，悬空目标
   NewPage）——零语料改动、vue 臂全弧线可跑（语料悬空目标 首页 为
   CJK 受 D-19 开档面）；T-04 ② 落地实录。
