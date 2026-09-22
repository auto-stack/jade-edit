---
plan_id: PLAN-006
status: archived
feature_name: rename-rewrite-slice
author: [zhaopuming]
created_at: 2026-09-23T00:53:44+08:00
updated_at: 2026-09-23T22:20:00+08:00
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-601"
  - "docs/ARCHITECTURE.md#SD-602"
  - "docs/README.md#SD-603"
  - "docs/README.md#SD-604"
touched_goals: []
---

# [PLAN-006] 知识库第四切片——重命名 + 反链改写（rename_page + 改名弹层）

## 0. 变更摘要

SD-301/SD-405 主线第四片：**知识完整性核心件**——页面重命名时自动
改写全部入链 `[[wikilink]]` 源文本（Obsidian 默认形态；旧园 rename 只
补内存索引、不改写源文——索引补丁法在 jade 纯派生链接面下不可用，
**源文改写是本仓首创设计，无旧园先例**）。

- back 新契约 `rename_page(old_path, new_name)`（**POST 单事务**：校验
  → 同目录改名（`File.copy`+`File.delete` 组合——`File.rename` 无
  `.at` 别名，auto.fs.rename 2994 未接语言面，D-20① 同款形态）→
  **反链改写 back 侧循环**（walk 全页面，精确 stem 匹配 `[[Old]]`/
  `[[Old#anchor]]` 标记法改写，anchor 保留，含自链；write_body 保
  frontmatter）→ 返回新路径）。
- front `dialog` 弹层（通用对话框控件在册——弹层内嵌 `input` 预填
  现 stem + **影响面预览**（link_pages 派生「将改写 N 页 M 处链接」））
  + F2/菜单「重命名…」+ 改名流收口（tab 路径全量更新 + 树/链接刷新
  触发集 v3 + 自链改写 Reload 显现）。
- **PLAN-005 §10.6 遗留收口**：casefold 裁决随本批落定——v1 stem
  匹配维持**精确比较**（casefold 不采用）、case-only 重命名拒绝
  （Windows 同档 + 精确匹配下无意义）——ledger 记账留观。

上游缺口适配内置：D-19（CJK 路径 POST 通道——old_path/new_name 均
body 传参）；D-20②（列表元素先拷局部——改写循环纪律）；D-23①
（while-contains 惯用法不涉——改写用标记法 split 族）；D-23②
（try 不发射 await——改名流 fetch 单点，无 store 定序依赖）。

## 1. 目标

- **G1（重命名闭环可用·双轨）**：激活档（有路径且非脏）按 F2 或
  菜单「文件→重命名…」→ `dialog` 弹层（input 预填现 stem + 影响面
  预览）→ 确认 → 磁盘同目录改名 + **全部入链源文改写** + tab 路径
  更新（激活/后台同名档全量）+ EXPLORER 树刷新 + 链接索引刷新（反链
  /出链面板立即反映新 stem）；取消零落盘；脏档/untitled 禁用入口。
- **G2（back 契约语料首锁）**：`rename_page` 八案（基础改名+跨页改写
  /anchor 保留/自链改写/CJK stem/非法字符清洗/目标冲突拒/old 缺失拒/
  case-only 拒）merged 直调与 split HTTP 双臂一致；copy+delete 复核
  （旧档消失、新档在、非链接档字节不动）。
- **G3（casefold 边界收口）**：PLAN-005 §10.6 遗留——精确匹配裁决
  落 SD-601 + ledger v9。
- **G4（测试面）**：vm 矩阵 + e2e 同单增 **rename 组**（独立组——
  文件操作弧线，不并入 link 组）；基线 v6 计划内重锁（store rename
  面 + App rename_q 入 dump）。
- **非目标**（明确排除）：
  - 移动（跨目录 move）/拖拽——改名 = 同目录 stem 变更；移动属树
    管理批；
  - 树上右键重命名/删除/新建（文件管理面板件——D-12 右键面门控，
    快捷键入口可做但独立批）；
  - 「不改写链接」选项（v1 恒改写——确认弹层预览影响面即防线；
    选项面后续批，§10 留口）；
  - alias/显示名（`[[New|别名]]` 文法扩展——grammar v1 不动）；
  - 撤销（重命名 undo 需事务日志——远期）；
  - casefold 匹配本体（G3 只裁边界行为，匹配语义维持精确比较）；
  - 大纲/图谱（D-12/组件面门控不变）；上游件实做与生成物补件
    （`File.rename` 别名缺口只供料候选记账，AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第四片是重命名+反链改写）

- **候选池对表**（PLAN-005 §10.4 首位在案）：重命名+反链改写 / 树
  文件管理（薄）/ 大纲（D-12 门控）/ 检索上量微批（观测未触发）。
  北标口径（SD-405）：短期 Typora 线仍无解锁件（D-12 定位面不变）；
  长期 Obsidian 线上，重命名改写是**知识完整性**基石——无它则改
  名即断链，知识库链接面不可运维；且 PLAN-003..005 的链接索引/
  查找/建页三件已把数据面与 UI 机制备齐（collect_ad_pages /
  refresh_links / refresh_tree / 弹层族 / input 控件全在册），
  本切片零新形态。
- **旧园对照（为何是首创设计）**：jade-garden rename（files.rs:177
  `std::fs::rename` + links.rs:320 `rename_file` → index.rs:221
  `rename_file`）只改**内存索引**的 path/title 引用（pages/blocks/
  links/tags 四表补丁），页面源文 `[[Old]]` 原样——索引重建即断链。
  jade 链接面纯派生（link_index 每次全量 walk），无索引可补丁 →
  **源文改写是唯一一致口径**（与 Obsidian「更新链接」同形态）。

### 2.2 数据面（back：`rename_page` 新契约）

```rust
/// 页面重命名 + 反链源文改写（同目录 stem 变更；全部 [[Old]]/
/// [[Old#anchor]] 精确匹配改写为 [[New]]/…，含自链；frontmatter 保留）
/// POST /api/rename_page
pub fn rename_page(old_path str, new_name str) str {
    return wsys.rename_page_impl(old_path, new_name)
}
```

- **POST 单事务**：old_path（工作区相对，CJK 常态）+ new_name 均
  body 传参（D-19——GET query CJK split/vue 臂全败；POST body CJK
  三契约先例 write_wiki/search_wiki/create_page）。**改写循环
  back 侧内联**（VM 直调 File.*，无 front HTTP 风暴——split/vue 形态
  下单次 POST 完成全部 IO）。
- **流程五步**（wsys.rename_page_impl）：
  1. **校验**：`File.exists(resolve(old_path))`（缺失 → ""）；清洗
     new_name（复用 PLAN-005 `title_to_path`——dash-收敛守卫钉定态）
     → 空 → ""；
  2. **路径合成**：new_rel = old 所在目录 + safe + `.ad`（**同目录
     改名**——根档落根；split("/") 取目录段，join 拼回）；
  3. **冲突/case-only 卫语句**：`File.exists(resolve(new_rel))` →
     拒（返回 ""；**case-only 变更（casefold 相等）同拒**——G3 裁决
     面：Windows 实盘同档，copy+delete 组合对自身复制未定义）；
  4. **改名**：`File.copy(old_abs, new_abs)` → `File.delete(old_abs)`
     → 复核 `exists(new) && !exists(old)`（**组合非原子**——崩溃窗
     双档残留，v0 记账 + `File.rename` 别名供料候选，§10）；front-
     matter 随文件字节整体迁移（无需 read/write 拼装）；
  5. **反链改写**：`collect_ad_pages`（PLAN-005 共享件）walk 全页面，
     逐档 `read_body` → 标记法改写 → 有变更才 `write_body` 回写：
     split(`"[[\"`) 取段，每段 `split_once("]]")` 取候选，`split_once
     ("#")` 拆 target/anchor，**target == old_stem 精确相等**（G3：
     casefold 不采用）才改写为 new_stem（anchor 透传保留）；行内
     重组用 split→join 同族标记法（VM 无 str.join——段序重接，O(n)
     通道族已证）；**含被改名档自身**（自链 `[[Old]]` 同步改写——
     注意第 4 步后读 new_rel）。
- **返回**：new_rel（成功）/ ""（任一卫语句拒）；改写处数不回传
  （影响面预览由 front 侧 link_pages 派生，§2.3）。

### 2.3 消费面（front）

- **store**（editor_store.at）：`rename_open` bool + `RenameOpen()`/
  `RenameClose()`（弹层面分野在册）；**tab 路径更新口** `TabsRenamed
  (old str, new str)`——while 扫描 tabs（D-11：禁 .find 闭包），path
  == old 的档更新 path/title（=stem）/key（编辑器 key 变即重挂载播
  种——D-03 归一形态），激活态不变；`ft_sel` 同步（App 侧）。
- **App 模型**（app.at）：`rename_q` str（input 值——find_q 同构，
  不入 store）。
- **入口**：action `file.rename`（title「重命名…」、shortcut **F2**
  ——VS Code/Typora 惯例、`enabled_if: ".store.active_path != \"\" &&
  !.store.active_dirty"`）+ menubar 文件项（保存/退出之间）。
- **弹层**：`dialog` 控件（在册——ui/dialog 组件族 + vm convert
  在案；**非 alert-dialog**——内容需嵌 input，通用对话框为专用形态）
  ——`dialog (open: .store.rename_open)` 内：标题「重命名页面」+
  `input`（value: .rename_q / oninput: .RenameEdit / 预填现 stem——
  RenameOpen 时由 handler 置初值）+ **影响面预览行**（`rename_impact
  (link_pages, active_stem)` 纯函数：扫描 target == 现 stem 的出链
  计数 → 「将改写 N 页 M 处链接」/「无入链」）+ 取消/重命名双钮。
  D-23③ 纪律沿袭：弹层快照内容锚定位（dialog 根形态 T-02 探针裁定）。
- **改名流** `.RenameGo`：
  1. `r = rename_page(.store.active_path, .rename_q)`（try/catch 落
     console_log——fetch 单点，D-23② 无定序依赖）；
  2. `r != ""` → `store.RenameClose()` + `store.TabsRenamed(old, r)`
     + `store.Reload()`（**自链改写 Reload 显现**——store body 是
     改名前镜像，重读磁盘即改写后文）；
  3. **refresh_links()**（触发集 v3：Init/Save 成功/面板开启/建页
     成功/**重命名成功**）+ **refresh_tree()** + bl/ol 行重算
     （active = 新路径显式传参——OpenFile 先例）；
  4. `r == ""` → console_log（拒因前端不可见——v1 口径，弹层内联
     错误提示后续批，§10）。

### 2.4 键位面

F2 = 重命名（唯一新键）；与在册 Ctrl+P/Ctrl+Shift+F/Ctrl+L/Ctrl+S
无冲突；menubar 文件菜单「保存」与「退出」之间插入「重命名…」。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖；`dialog` 控件为 ui 组件族在册件（deps 已物化，gen 树在案）。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-23 会话口述：「计划005也做完了。下一步是什么计划？
  请根据我们的战略目标和设计文档，继续安排起草下一阶段的计划」——
  **立项授权**：按北标（SD-405 已落 canonical）与设计文档确定下一
  计划并起草。方向选择（重命名+反链改写）= 候选池首位（PLAN-005
  §10.4）+ 本计划 §2.1 依据；handoff 未否决即生效（PLAN-004/005
  同款约定）。
- 语义决策预授权评估：「改写 vs 断链」——v1 = 恒改写（§2.1 结构性
  论证：jade 无索引可补丁，断链=改名功能无意义；Obsidian 默认同判）。
  若用户要「不改写」选项 → §10.2 留口（执行期可加，契约不变）。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触（AC-05）。
- 无预算/自动续跑/工具链版本指定（沿 README：≥1652）。

### 4.2 接地证据（本仓/家族实读，2026-09-23）

- **File 原语面（可行性核心）**：auto-lang `crates/auto-lang/src/vm/
  native_catalog.rs`——`.at` 静态别名族（FFI shim 名，1758-1773 +
  codegen 表 2602-2614）：`File.read_text/write_text/exists/delete
  (1003)/create_dir/read_bytes/write_bytes/copy (1007)/size/is_dir/
  append_text/remove_dir/remove_dir_all` 在册；**`File.rename`/
  `fs.rename` 别名无**（`auto.fs.rename` 2994 在内部目录未接语言面
  ——2026-09-14 PLAN-016 T-05 注记行同窗口实读；D-20① walk_files
  同款形态）→ 改名 = copy+delete 组合（**T-01 探针 A 定谳可调性**
  ——别名在册 ≠ VM 可调，D-20① 教训；fallback 见 §10.1）。
- **旧园 rename 对照**（冻结池实读）：`back/server/src/files.rs:
  177-192` rename_file_impl = `std::fs::rename` + `links::rename_file`
  （links.rs:320-337）；`index.rs:221-254` rename_file = 内存索引
  四表（pages/blocks/links/tags）path/title 引用补丁——**源文不改写**
  （重建即断）；`useFileTreeStore.ts:49` front RenameFile 直调端点。
  jade 不搬（结构性不同，§2.1）。
- **dialog 控件**：gen 树 `gen/front/vue/src/components/ui/dialog/`
  在案（ui 组件族 ls 实读：alert-dialog/dialog/input/sheet/popover
  齐）；vm 侧 aura_view_builder.rs dialog 转换在册（`"dialog"` 分支
  实读）；**弹层内嵌 input 双轨形态 = T-02 探针 B**（无 jade 先例——
  PLAN-005 弹层为纯钮 alert-dialog；bps form 非 dialog 语境）。
- **本仓在册复用件**：wsys `title_to_path`（PLAN-005 交付——dash-
  收敛守卫钉定态）/ `collect_ad_pages`（PLAN-005 共享件）/ `write_body`
  （frontmatter 保留回写）/ `json_esc`；app.at `refresh_links()/
  refresh_tree()`（PLAN-005 收口件）/ 弹层族三实例（D-23③ 内容锚
  纪律）/ input oninput/onenter（D-22②③ 通态）；store `Reload()`
  （F5 在册）。
- **语料**：tmp/wiki-demo 5 页——`CAP 定理`（被 index/Tasks 出链
  `[[CAP 定理]]`，PLAN-003 已知答案）为天然改名弧线素材：改名
  `CAP 定理` → `CAP Theorem` → index.ad/Tasks.ad 源文改写可逐字节
  断言；`首页`（PLAN-005 建页产物弧线）同理。fixture 每次全新隔离
  拷贝，改名+改写零污染。
- **约束表**：parity-ledger v8（D-11 while 扫描 / D-19 POST CJK /
  D-20②③ 列表元素局部拷 + 禁 length 截断 / D-21 负载窗（本批
  back 单事务设计 = POST 密度不升）/ D-23①③ replace 惯用法 + 弹层
  内容锚 / C-1..C-6）。
- **基线**：structure-v5.txt（store find/create 面 + App find/create
  面——v5 落 PLAN-005）；v6 变更面 = store rename_open + App
  rename_q。

### 4.3 与既有计划的关系

- 复用 PLAN-003 链接面（link_index/出链已知答案）+ PLAN-004 查找面
  （refresh 后快开/检索自动新鲜）+ PLAN-005 建页面（title_to_path/
  collect_ad_pages/refresh 双件/弹层纪律）——本切片零新数据结构。
- 收口 PLAN-005 §10.6（casefold 边界——G3）。
- 不触碰上游供料包件（`File.rename` 别名缺口只记账候选）；D-12/D-16/
  D-17/D-19/D-21 留观不变。
- PLAN-007 候选池（§10.7 更新）：树文件管理（新建/删除/移动——含
  删除的 tab 关闭面）、大纲（D-12 解锁）、tags 面板/unlinked
  mentions、检索上量微批、`File.rename` 别名供料回执件。

## 5. 详细设计

### 5.1 `rename_page` 契约与 wsys 实现（SD-601 back 半）

```
pub fn rename_page_impl(old_path str, new_name str) str {
    // ①校验：exists(old) 否→""；safe = title_to_path_stem(new_name)
    //   （复用 PLAN-005 清洗，去 .ad 拼装段）空→""
    // ②new_rel = dir_of(old_path) + safe + ".ad"（同目录；根档目录段空）
    // ③卫语句：exists(new_rel) → ""；casefold_eq(new_rel, old_path)
    //   → ""（case-only 拒——G3）
    // ④File.copy(resolve(old), resolve(new_rel)) → File.delete(
    //   resolve(old)) → 复核 exists(new) && !exists(old) 否→""
    //   （⚠ D-20② 族：两调用返回值先落局部）
    // ⑤反链改写：collect_ad_pages("", 4) walk（含被改名档新路径）：
    //   逐页 read_body → rewrite_links(body, old_stem, new_stem)
    //   → 变更才 write_body 回写；old_stem = dir 剥离 + .ad 去尾
    //   （split 法——D-20③）
}

fn rewrite_links(body str, old str, new str) str {
    // 标记法：seg = body.split("[[")；首段直通；后续段 split_once
    // ("]]")——无闭合直通；候选 split_once("#") 拆 target（⚠ 局部
    // 变量拷贝——D-20②）；target == old 精确相等 → 段前缀换 new +
    // anchor 段透传重组；否则原样；段间 "[[" / "]]" 重接
}
```

### 5.2 front 接线（SD-601 front 半）

- store：`rename_open` + `RenameOpen/RenameClose` + `TabsRenamed
  (old, new)`（while 扫描——title=stem 重算、key 更新、激活索引保位；
  ft_sel 在 App 侧随 rename 流更新）。
- app.at：msg `RenameEdit(str)`/`RenameGo`；模型 `rename_q`；actions
  `file.rename`（F2 + enabled_if 复合式）+ menubar 文件项；dialog
  第三弹层形态（input + 影响面预览 + 双钮）；`rename_impact` 纯函数
  （link_pages 扫 target == 现 stem——精确比较同口径）。
- `.RenameGo` 四步流（§2.3）；`.RenameOpen` handler 置 `rename_q`
  初值 = 现 stem（active_path 剥目录/尾——split 法）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-601 | modify | docs/ARCHITECTURE.md §5 链接域语义段 | before：无重命名面（触发集 v2 = Init/Save 成功/面板开启/建页成功）；stem 匹配精确比较（SD-302 隐含）。after：增「重命名与反链改写语义」子段——`rename_page` POST 契约（单事务五步：校验/同目录合成/冲突+case-only 卫/copy+delete 组合非原子注记/back 侧改写循环含自链）；改写规则（`[[Old]]`/`[[Old#anchor]]` 精确 stem 匹配、anchor 保留、有变更才回写、frontmatter 保留）；**casefold 裁决（PLAN-005 §10.6 收口）：stem 匹配维持精确比较、case-only 重命名拒**；触发集 v3 = v2 + 重命名成功；front 面（F2/菜单入口脏档禁用、dialog 弹层预填 + 影响面预览、TabsRenamed 全量更新、改名后 Reload 显现自链改写） | 知识完整性核心件规范锚；首创设计（旧园索引补丁法不可用）+ 遗留收口 | AC-01/02/06 |
| SD-602 | modify | docs/ARCHITECTURE.md §6 | before：十二组检查 + 基线 v5。after：**十三组检查**（+rename 组：入口禁用态/弹层/改名/跨页改写/树+面板刷新/取消/case-only 拒）+ **基线 v6**（store rename_open + App rename_q；v5 留档） | 测试体系表更新（PLAN-003/004/005 同步先例） | AC-03/04 |
| SD-603 | modify | docs/README.md Tests 节 | before：13+12+十二段口径、基线 v5 指针。after：**14/14+13/13+十三段**口径（rename 组双臂全跑——CJK 改名/改写走 POST 无 D-19 面）+ 基线 v6 指针 + N 定谳续记 | 判绿口径单一权威面（SD-204/304/403/503 续） | AC-03/04 |
| SD-604 | modify | docs/README.md「是什么/文档」节 | before：第三切片=悬空建页闭环。after：**第四切片=重命名+反链改写**条目（知识完整性件 + casefold 裁决注记）+ ledger v9 指针 | 产品主线进度面派生同步（SD-303/404/504 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：merged 直调 + serve-back POST 八案——
  ①基础改名（`CAP 定理`→`CAP Theorem`：旧档消失新档在 + **index.ad/
  Tasks.ad 源文 `[[CAP 定理]]`→`[[CAP Theorem]]` 逐字节断言** + 非链
  接档字节不动）②anchor 保留（`[[Old#a]]`→`[[New#a]]`——语料补造
  链，测试内 write_wiki 造）③自链改写（改名档内 `[[Old]]` 同步改写
  ——测试内造）④CJK stem（全 CJK 改名链——POST 双臂）⑤清洗（非法
  字符新名）⑥目标冲突拒（新名 = 既有档 stem → "" + 磁盘零变化）⑦
  old 缺失拒 ⑧case-only 拒（`tasks`→`Tasks` → "" + 磁盘零变化）。
- **vm 矩阵 rename 组（T-04）**：①入口禁用态（untitled/脏档 F2 无效
  ——enabled_if 断言）②开档后 F2 → 弹层快照（rename_open/rename_q
  预填——dialog 内容锚，D-23③ 纪律）③确认 → 新档激活（active_path
  == 新路径 + tab 标题 = 新 stem）④跨页改写可见（开 index.ad——出链
  行/反链面板反映新 stem；**CJK 改名导航子步仅 merged 臂**，D-19 开档
  面同判；split 臂以 rename_page 返回值 + 磁盘断言替代）⑤树刷新
  （旧行消失新行在）⑥取消零落盘 ⑦case-only 拒路径（console_log +
  状态复原）。
- **e2e（T-04）**：rename 段同弧线（真 DOM：F2/菜单 → dialog input
  fill → 确认 → editor 标题 + 树 + 面板断言；CJK 弧线用 ASCII 档
  `Hello World`→`Hello`——改写 `[[Hello World]]` 引用可断言[若语料
  无此链，测试内造]；vue 臂全弧线无 D-19 面——改名 POST + 后续开档
  走 ASCII）。
- **基线 v6（T-04）**：store + App 增字段入 dump 计划内重锁；连跑
  ≥3 次零漂移；v5 留档。
- **负向（T-05）**：regen-vue 补件面零增量；冻结池/家族仓零接触；
  非链接档字节不动（改写副作用圈定证——八案①附带）。

## 7. 验收标准

- **AC-01（back 契约）**：`rename_page` POST 契约落 api.at + wsys
  实现；§6 八案双臂全绿；改写逐字节断言 + 副作用圈定（非链接档零
  变化）+ copy+delete 复核全过。验证：T-01 直证脚本实录。
- **AC-02（重命名闭环双轨）**：F2/菜单入口（禁用态正确）→ 弹层
  （预填 + 影响面预览）→ 确认 → 磁盘改名 + 跨页源文改写 + tab 全量
  更新 + 树/链接/面板刷新 + 自链 Reload 显现；取消零落盘。vm
  （snapshot+state）与 vue e2e 同断言域全绿（CJK 导航子步 merged 臂
  ——D-19 口径注记）。验证：T-04 rename 组 + e2e rename 段。
- **AC-03（gate ALL GREEN）**：`node scripts/gate.mjs` 顺序全绿
  ——vm merged **14/14** + split **13/13**（+rename 组）+ vue build +
  e2e **十三段**；判绿实录进 §9（无-RESULT 早崩/负载窗失败按 README
  口径重跑即绿，次数如实记——D-21 v8 扩记口径）。
- **AC-04（基线 v6）**：计划内重锁完成、v5 留档、连跑 ≥3 次零漂移；
  dump 含 rename_open/rename_q。
- **AC-05（负向证）**：冻结池与家族仓零接触（git status 证据）；
  `gen/` 无手改；旧园代码零引用；补件面零增量（D-13/D-15 残余集
  不变）；改写副作用圈定证（非链接档字节不动）。
- **AC-06（文档面）**：SD-601..604 落位且 canonical 文中锚注齐
  （SD-301..504 先例）；**casefold 裁决（G3）入 SD-601 定文**；
  parity-ledger **v9**（`File.rename` 无别名 → copy+delete 组合纪律
  + 非原子窗口记账 + 别名供料候选；dialog 弹层内嵌 input 探针结论
  入册；执行期新实勘）。

## 8. 执行步骤

> 每任务收口 = 代码 + 验证命令实录进本节证据块；§10 观测项闭合标
> 「已裁定」。

- **T-01 back 契约 + 实现 + 八案直证**（AC-01）✅ 已完成
  - 探针 A（File.copy/File.delete VM `.at` 可调性——别名在册 ≠ 可调，
    D-20① 教训）：serve-back/wsys 内最小调用探针 → 定谳
    （fallback 链见 §10.1）。**[✅ 已完成] 定谳 = fallback① 强制**
    （2026-09-23）：
    - `File.copy` **解析层不可调**——`copy` 为 Auto 硬关键字
      （auto-lang token.rs:397，Plan 122 弃用参数模式），dot 访问解析器
      拒绝（parser.rs:2429 白名单无 Copy）→ 含该调用的模块 **boot 即
      fatal**（探针实录 "error at 476:13: … got Copy"）——别名双表在册
      （native_catalog 1007 FFI 表 + 2602 codegen 表）≠ 可调，且比
      D-20① 链接层缺口（fs.walk_files Undefined symbol）更深一层。
      `delete`/`rename` 均非关键字。
    - fallback① 可调性全通：`File.read_text`+`File.write_text`+
      `File.delete` 三原语 VM .at 可调（探针工程 merged 直调，MCP dump
      读回 r1="copied" r2="copied+deleted" + 磁盘字节断言：整迁等价/
      源档未触碰/删除生效）；⚠ `File.delete` 恒返 0 吞错（stdlib shim
      忽略 remove_file 结果）→ **exists 双复核必须**（实现第 ④ 步已内
      建）。
  - api.at 增 `rename_page` POST；wsys.at `title_to_path_stem` 复用
    提取 + `dir_of`（split 法）+ `casefold_eq`（to_lower 双侧比较）
    + `rewrite_links` 标记法 + `rename_page_impl` 五步。**[✅ 已完成]**
    第 ④ 步按探针 A 裁定落 read+write+delete 组合（File.copy 字样零出
    现——模块级 parse fatal）；rewrite_links 实勘修正：候选改写重组须
    **+ "]]"+rest 段尾回接**（首跑实录：漏回接 = 改写档自 "]]" 起截断
    ——split_once CJK needle 六案隔离实验全对，缺陷在本仓重组非上游）。
  - 八案 merged 直调 + serve-back POST 直证（CJK 案双臂；anchor/
    自链案测试内造链）。**[✅ 已完成]** `node tests/probe_rename.mjs`
    RESULT 全案通过（八案+空名守卫附带案+改写逐字节/锚透传/自链/CJK/
    清洗/三拒磁盘复核+副作用圈定）+ **双臂一致=true**（九案返回值逐案
    相等）；探针期望值三处执行期修正（H1 标题非链接不改写[SD-601 改写
    面=标记法]/④⑤ 磁盘断言后置的链式改写终态/②不重复执行）。
  - 验证：直证脚本全绿 + `node tests/vm_matrix.mjs`（link/find/
    create 组回归零变化）。**[✅ 已完成]** merged 13/13 + split 12/12
    ALL GREEN（基线 v5 零漂移——回归零变化）。
- **T-02 front 弹层 + 入口**（AC-02 前半）✅ 已完成
  - 探针 B（dialog 弹层内嵌 input 双轨形态）：最小 dialog+input 用
    例 → `pnpm build` gen 源检 + vm 冒烟快照 → 定谳（fallback 链见
    §10.2）。**[✅ 已完成] 定谳 = dialog+input 双轨全通**（2026-09-23，
    探针工程 probe-c 双臂）：
    - `dialog (open:)` 双轨通：vm 模态 Popover 臂（开合态翻转+快照面）
      / vue `Dialog v-model:open`；
    - **弹层内嵌 input 全链通**：vm 闭态恒渲染（D-23③ dialog 族同判，
      闭态双 input 均在树）+ type_text→oninput→state 同步；vue
      `v-model + @input` 双绑发射（冗余无害）；
    - **双钮 = 普通 `button`**：`dialog-cancel`/`dialog-action` 标签
      **轨间不对称**——vm 轨死标签（不成钮、静默丢弃）/ vue 轨反 Button
      化（outline/ghost 预设）+ schema S002 warning——禁用（vm 死钮为
      硬伤）；dialog-footer 内普通 button 双轨全通（press→handler→
      state_changes 面板实录）。
  - store rename_open/RenameOpen/RenameClose + app.at actions F2/
    menubar + dialog 弹层（预填 + `rename_impact` 预览 + 双钮）。
    **[✅ 已完成]** 实勘调整两项（授权内）：①menubar 项**不挂
    enabled**——vm 轨 menubar-item 状态相关 enabled **boot 冻结**
    （boot 渲染定 handler 有无，状态变化不重评；复合式 `!`/`&&` 更致
    节点整丢——基座保存项同病在案[其矩阵面走 toolbar 钮从未暴露]），
    禁用语义由 `.RenameOpen` handler 守卫兜底（action `enabled_if` 仍
    为权威面），差异入 ledger v9；②影响面预览期望值实勘校正——Hello
    World 入链 = index/Tasks/CAP 定理 **3 页 3 处**（语料相关链接段
    补数）。
  - 验证：merged 手动冒烟（F2 禁用态/弹层/取消零落盘）+ `pnpm
    build` PASS。**[✅ 已完成]** e2e/.runtime/smoke-t02.mjs **6/6
    PASS**（①禁用守卫[press=ok+rename_open 恒 false]②弹层开+预填
    `rename_q: "" -> "Hello World"`[press 响应 state_changes 实录]+
    预览「将改写 3 页 3 处链接」③input 键入同步+取消零落盘[多弹层恒
    渲染同名钮——「重命名」父行兄弟域定位，10c 同款纪律]④确认钮在）
    + `pnpm build` PASS（vue-tsc 0 错 + vite build 绿）。
- **T-03 改名流收口**（AC-02 后半）✅ 已完成
  - `.RenameGo` 四步流 + `store.TabsRenamed`（while 扫描全量更新）
    + Reload 显现 + refresh_links/refresh_tree 接线（触发集 v3）+
    ft_sel/bl/ol 行重算。**[✅ 已完成]** 实勘两项：①msg 双 str 参数在
    册（TabsRenamed(old_path, new_path)——载荷单类型约束[同 str 型]
    不违 C-6）；②**参数名禁 `new`**——ts_adapter 原样发射 TS 形参
    （`new` 为 JS 保留字 → vue-tsc TS1109 语法错，首建实录）→ 改名
    old_path/new_path（**生成器保留字缺口入 ledger v9**；wsys 侧
    rewrite_links 的 `new` 参数不受影响——back 模块 VM 解释不产 TS）。
    定序面：RenameGo 内 rename_page 在 try（api-client try-体 await
    在册——CreateGo 同款）+ store 调用裸调（await 发射——ActSave 先
    例），渲染滞后于 handler 完成 → TabsRenamed 换 key 后的重挂载播
    种即 Reload 后新文（自链改写显现链）。
  - 验证：merged 冒烟全弧线（改名→开 index.ad 改写可见→树刷新→
    面板新 stem）+ link/find/create 组回归 + e2e rename 段冒烟。
    **[✅ 已完成]** e2e/.runtime/smoke-t03.cjs **10/10 PASS**（开档→
    弹层→键入→①tab/激活投影更新 ②磁盘改名+三页源文改写逐字锚 ③
    Reload 显现[active_body==磁盘+字节整迁] ④出链/反链面板新 stem ⑤
    树刷新旧行消失新行在 ⑥取消零落盘回归）+ `node tests/vm_matrix.mjs`
    merged 12/13 + split 12/12（**唯一 FAIL = B 基线漂移——store
    rename_open + App rename_q 入 dump 的计划内 v5→v6 变更，T-04
    重锁**；link/find/create 组功能检查全过零回归）+ `pnpm build`
    PASS（保留字修正后）。e2e rename 段随 T-04 官方落位（同断言域
    一次成文）。
- **T-04 测试扩单 + 基线 v6 + 判绿首锁**（AC-02/03/04）✅ 已完成
  - vm rename 组七子步 + e2e rename 段 + 基线 v6 重锁。**[✅ 已完成]**
    实勘四项：①②弹层钮/输入定位 = 「重命名」锚父行兄弟域 + 快照序最
    后 input（多弹层恒渲染同名钮纪律，10c 同款）；③**case-only 磁盘断
    言 = 目录清单 casefold 计数**（Windows 大小写不敏感 FS——exists(lower)
    对同档恒真，probe_rename ⑧ 同款）；④⑤ 跨页改写断言 = **index 出链
    行新 stem + 出链行点击导航到新档**（初版误设反链行断言——Project X
    零真实出链[语料转义面]非任何页反链源；vm 快照侧初版靠出链 onclick
    求值串误过，两轨修正为行为级断言；另 fixtures index 内联码 `[[页面
    名]]` = 既有悬空链[SD-302 v1 忽略面不含内联码]，非漂移）。
  - 验证：`node tests/vm_matrix.mjs` 双臂全绿 + `pnpm test:e2e`
    连跑 ≥5 + `node scripts/gate.mjs` ALL GREEN（判绿实录 + N 定谳
    续记）。**[✅ 已完成] 判绿实录**：
    - vm 双臂：merged **14/14** + split **13/13** ALL GREEN ×5
      （final1/final4/gate×3；基线 v6 零漂移逐跑）；无-RESULT 早崩
      2 次（split 臂 check-2 树行 6s 超时——`status=ready 但 ft_nodes/ws_name
      空` 形态，独占重跑即绿，D-21 家族新形态留观）。
    - 基线 v6：`tests/baseline/structure-v6.txt` 首锁（store rename_open
      + App rename_q 入 dump + dialog 第三弹层 id 序列计划内扩；v5
      留档）；后续 7+ 跑零漂移。
    - e2e（断言修正后 24 跑）：**13 绿 / 11 失败全数 D-21 签名**
      （write_wiki POST 400 丢参 ×9[check-5 保存点/quit 保存点，
      api-err-body 签名同 v8 记载] + ECONNRESET ×2[check-5]）；失败
      全部重跑即绿；最长连绿 4（run18-21）；rename 组在每个完成跑
      内全过；隔离 serve-back 连发实证 **write_wiki 50/50 + read 20/20**
      （参数装配本体健康——400 仅 vite 代理 e2e 语境突发簇形态，
      D-21 v9 扩记素材）。
    - gate：**第 3 跑 ALL GREEN**（gate1/2 = D-21 400 于 e2e 段，如实
      记；长冷却后过——突发簇形态与 D-21 窗口相关口径一致）。
- **T-05 文档 + ledger v9 + 收口**（AC-05/06）✅ 已完成
  - SD-601..604 canonical 落位（锚注齐 + casefold 裁决定文）；
    ledger v8→v9（探针 A/B 结论 + `File.rename` 别名缺口 + 非原子
    窗口 + 执行期实勘）。**[✅ 已完成]** ARCHITECTURE §5「重命名与反链
    改写语义」段（SD-601：POST 五步[**read+write+delete 组合定文**——
    探针 A 裁定偏离计划原文 File.copy 的实勘修正入定文]/改写规则
    v1[精确 stem/锚+空白透传/段尾回接/有变更才回写]/casefold 裁决
    [G3]/触发集 v3/front 面[F2+enabled_if 权威面/menubar 无 enabled
    D-24③/dialog 第三弹层/TabsRenamed/Reload 显现/背景 tab 不随改写
    刷新 v0 口径 §10 留观]）+ SD-302 触发集注记 v3 + §6 十三组表
    （SD-602：rename 组七子步 + 基线 v6 + 直证脚本注）+ README Tests
    （SD-603：14/14+13/13+十三段 + rename 组条目 + N 定谳续记 + 基线
    v6 指针）+ README 是什么第四切片条目 + ledger v9 指针（SD-604）；
    ledger v9 = D-24 新增（①File.copy 解析层不可调[copy 硬关键字]/
    ②File.delete 恒返 0 吞错/③menubar enabled boot 冻结/④参数名
    保留字直发/⑤dialog-cancel 轨间不对称）+ D-21 扩记（24 跑 13 绿
    11 失败全数签名 + 隔离 50/50 实证 = vite 代理语境突发簇精化 +
    split 树行早崩新形态）。
  - 负向证采集；§9 work 记录（outcome/next=review）。**[✅ 已完成]**
    ①冻结池/家族仓零接触：jade-edit 工作树零 WIP[全部已提交] +
    auto-down status 干净 + auto-lang **只读零写入**[其工作树 blueprints
    删除面为**先在外来 WIP**——非本会话产物，hazard 记忆在案不触碰]；
    ②gen 无手改 = regen-vue 补件断言守绿（gate 2 vue-build PASS——
    D-13/D-15 残余集不变）；③旧园代码零引用（src/ grep 仅 PLAN-004
    历史注释命中）；④改写副作用圈定 = probe_rename 案①（Projects.ad
    转义链面 + jade-garden-index.json 非 .ad 档字节不动，双臂 PASS）。
  - 验证：文档 diff 全窗口检视 + gate 复跑绿。**[✅ 已完成]** 文档
    diff 三文件全窗口检视（ARCHITECTURE/README/ledger——本提交窗）；
    gate 复跑见 §9 记录（gate 第 3 跑 ALL GREEN 后无代码变更——文档
    提交不影响门面；复核口径 = 文档-only 提交，门证据沿用同 commit
    窗实录）。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；T-02 探针 B 与
T-01 探针 A 理论可并行——保守线性）。

## 9. 复审记录

- **2026-09-23 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-006，revision 1。
  - `outcome: pass`——可进 work（授权范围 = §4.1；方向确认含在
    handoff 呈报，未否决即生效——PLAN-004/005 同款约定）。
  - `next: work`（T-01 起；探针 A 为可行性首闸——fallback 链在案）。
  - 语义决策「v1 恒改写」按 §4.1 预授权评估记录；「不改写」选项
    留 §10.2 用户口。

- **2026-09-23 work handoff（auto-plan-work）**：
  - `stage: work` | PLAN-006 | revision 1 | `outcome: pass` |
    code_commit = 收口提交（前序 793faae/7b6c71e/a0659f3/4efd185
    T-01..T-04） | task_ids = T-01..T-05 全收口 | worktree = 直接
    main 线性约定（本仓无 worktree/dev 分支）；依赖 = auto
    v0.4.2-1914-g56bfaf1fc-dirty（本切片零变化）。
  - `evidence`: AC-01 probe_rename 八案双臂全绿（双臂一致=true）；
    AC-02 smoke-t02 6/6 + smoke-t03 10/10 + vm rename 组七子步 +
    e2e rename 段（双轨同断言域）；AC-03 gate ALL GREEN（第 3 跑）
    + vm 双臂 14/14+13/13 ×5 + 基线 v6 零漂移；AC-04 基线 v6 首锁
    （dump 含 rename_open/rename_q，v5 留档）；AC-05 负向证四件
    （§8 T-05）；AC-06 SD-601..604 锚注齐 + ledger v9（D-24 + D-21
    扩记）。探针 A 裁定（fallback① 强制——File.copy 解析层不可调）
    为授权内 §10.1 fallback 落地，实现第④步定文随 SD-601。
  - `blockers`: 无。
  - `next: review`。

- **2026-09-23 复审（auto-plan-review，实现会话内复审）**：
  - `stage: review` | PLAN-006 | revision 1 | `outcome: pass` |
    reviewed_commit = b92e07a | base_commit = 1d1b20d（PLAN-005 归档
    tip） | dependency_revisions = auto 0.1.0+v0.4.2-1914-g56bfaf1fc-
    dirty（与 PLAN-005 交付同版，零变化） | spec_inputs = ARCHITECTURE
    bbb34407 + README 8a73e75d + ledger 8b154803（git hash-object @
    b92e07a）。
  - 独立性受限声明：实现会话内复审，裁定自工件重建（重跑门禁 + 直读
    diff + canonical 对读），不依赖执行期总结。
  - `acceptance_results`: **AC-01..06 全 PASS**——AC-01 = probe_rename
    八案双臂复现全绿（`node tests/probe_rename.mjs` exit 0，双臂一致
    =true）；AC-02 = gate 复现含 vm rename 组七子步 + e2e rename 段
    （十三段全过，双轨同断言域）；AC-03 = gate ALL GREEN 复现
    （e2e/.runtime/review-gate2.log，exit 0）；AC-04 = 基线 v6 零漂移
    复现（review-m1.log B PASS + gate2 内 B PASS）；AC-05 = 负向证四件
    重验（auto-down status 干净/auto-lang 只读[blueprints 删除面为先在
    外来 WIP 不触碰]/gen 补件断言守绿[vue-build PASS]/旧园零代码引用/
    副作用圈定=probe 案①）；AC-06 = SD-601..604 锚注齐 + canonical
    对读=实测行为（含 fallback① 定文与实现逐条对应：五步/改写规则/
    卫语句/front 四步流/触发集 v3）+ casefold 裁决定文 + ledger v9。
  - `findings`: **F-R6-1（低，留观）基线 v6 比对瞬态失配首例**——gate
    复现第 1 跑 B FAIL，同代码即时复跑 PASS 且正文+id 序列逐字节一致
    （仅我方临时保存路径致 header 行差异）；疑捕获点渲染时序敏感
    （D-21 家族留观新形态，不判 AC-04 失败——以复现 PASS 记，处置=
    留观如实记）。F-R6-2（备注）e2e D-21 失败面与本批 rename POST 无关
    （11 失败全落 write_wiki 先在保存点——SD-601 单事务设计支持证，
    ledger 已记）。无阻塞项；无范围缩减/无验收弱化；授权内实勘调整
    （fallback①/menubar 摘 enabled/casefold 计数断言）均有 in-plan
    记录 + ledger 入册。
  - `evidence`: 本节命令与日志路径（e2e/.runtime/review-*.log 为会话期
    产物，可按 §8 各任务验证命令复现）；工件持久面 = 计划 §8 证据块 +
    docs/ 三 canonical（hash 上）+ tests/probe_rename.mjs（入库直证）。
  - `next: merge`（status → reviewed）。

- **2026-09-23 merge 归档（auto-plan-merge）`PLAN-006:r1`**：
  - `stage: merge` | outcome: **pass** | completion_kind: **delivered**。
  - **prepared** = reviewed 基线（reviewed_commit=b92e07a + 复审 ef75569
    为其 docs-only 后代[diff 全窗口仅计划文件 +36/-2，实现/依赖零变化
    ——delivery_commit=ef75569 资格成立]）；canonical delta = SD-601..
    604 已于 T-05 落位 docs/ 根三件（本仓知识库约定——PLAN-001..005
    在案先例，无 docs/specs/ 面）。
  - **landed** = main tip == ef75569 == delivery（直接 main 线性约定，
    本仓无 worktree/dev 分支；ancestry 1d1b20d→ef75569 六提交线性直
    证）；归档前冒烟 merged **14/14 + 基线 v6 零漂移** ALL GREEN
    （e2e/.runtime/merge-smoke.log）。
  - **ledger_refreshed** = docs/parity-ledger.md v9 于 main 读回
    （header v9 + D-24 在册 + D-21 vite 代理语境精化语料在文）——无
    live ledger 服务，PLAN-001/005 同判（tracked 派生面即账本）。
  - **archived** = git mv → docs/plans/archived/006-rename-rewrite-
    slice.md + status: archived + completion_kind: delivered。
  - **cleaned** = 无 worktree/dev 分支待清（直接 main 约定；worktree
    清单仅主检出 D:/autostack/jade-edit、分支清单仅 main+origin/main，
    工作树零 WIP——唯一未跟踪件 docs/plans/007-file-manage-slice.md
    为**并行会话外来产物**，非本计划范围，保留不动）。
  - `next: —`（闭环；后续入口 = PLAN-007 新计划）。

## 10. 待澄清事项

1. **File.copy/File.delete VM 可调性**（探针 A，T-01 首闸）——**已裁定
   （2026-09-23）**：fallback① 强制——`File.copy` 解析层不可调（`copy`
   硬关键字，Plan 122；boot 即 fatal，证据见 T-01）；实现按
   read_text+write_text+delete 组合落地，字节整迁等价（八案直证）；
   `File.delete` 恒返 0 吞错 → exists 双复核必须。别名供料候选升级：
   ①`File.rename`/`fs.rename` 无 `.at` 别名（原记）②`copy` 关键字冲突
   解除（`File.copy` shim 已在册但语法层不可达——上游 dot 访问解析器
   白名单扩或关键字退役，两向任一）。fallback②（全 blocked）不触发。
2. **dialog 弹层内嵌 input 双轨形态**（探针 B，T-02）——**已裁定
   （2026-09-23）**：dialog+input 双轨全通，主形态落定（证据见 T-02）；
   fallback 链不触发。附带定谳：双钮禁用 dialog-cancel/action 标签
   （vm 死标签）；menubar 项 enabled 缺口（boot 冻结）以 handler 守卫
   + action enabled_if 两层兜底，升级路径 = auto-lang menubar popover
   状态重渲（供料候选）。
3. **「不改写」选项**（用户口，默认不做）——**已裁定（执行期未触发，
   v1 恒改写交付）**：影响面预览即防线；用户如需选项 → r2 范围
   （弹层 checkbox + back 契约 rewrite 参）。
4. **casefold 裁决**——**已裁定（r1 定 + SD-601 定文 + ledger 记账
   完成）**：stem 匹配维持精确比较 + case-only 重命名拒（八案⑧双臂
   直证 + 矩阵 case-only 子步双臂绿）；casefold 匹配本体升级属另立
   计划（候选池 §10.7）。
5. **拒因可见性**（v1 口径）——**已落地**：rename_page 返回 "" 时
   front 仅 console_log + 弹层留置（用户可取消/改名重试）；矩阵⑥以
   弹层留置 + 磁盘零变化断言。弹层内联错误提示属 UX 后续批。
6. **D-21 POST 波及**（观测项）——**已实测闭合**：本批 back 单事务
   （rename_page 单 POST）未引新增失败面——e2e 11 失败全数落位
   write_wiki 保存点（check-5/quit，先在流），rename POST 零失败；
   窗口形态精化入 ledger v9（vite 代理语境突发簇 + 隔离 50/50 实证）。
7. **PLAN-007 候选池**（本批后更新）：树文件管理（新建/删除/移动 +
   删除的 tab 关闭面）、大纲（D-12 解锁后）、tags 面板/unlinked
   mentions、检索上量微批（StringBuilder/depth——观测未触发）、
   `File.rename`/`copy` 别名供料回执件[**D-24① 升级**：解析层缺口
   + 关键字冲突两向]、重命名「不改写」选项与内联拒因提示（UX 批）、
   casefold 匹配本体（stem 解析/改写/建页三面联动）。
