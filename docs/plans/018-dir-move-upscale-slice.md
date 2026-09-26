---
plan_id: PLAN-018
status: executing
feature_name: dir-move-upscale-slice
author: [zhaopuming]
created_at: 2026-09-25T23:04:36+08:00
updated_at: 2026-09-25T23:04:36+08:00
plan_revision: 1
current_step: 1
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-1801"
  - "docs/ARCHITECTURE.md#SD-1802"
  - "docs/README.md#SD-1803"
  - "docs/README.md#SD-1804"
touched_goals: []
---

# [PLAN-018] 知识库第十六切片——目录移动（工作区三部曲收官）+ 上量微批（StringBuilder 装配 + depth 8 统一）

## 0. 变更摘要

SD-301/SD-405 主线第十六片，双件：

1. **目录移动**——工作区三部曲收官（档：建/移/删 ✓[007/012]；目录：
   建/重命名/删 ✓[012/014]、**移 ✗ → 本批**）：`move_dir(path,
   new_parent)` POST（单事务逐文件 move 循环 + 旧目录 remove_dir；
   **循环卫**——移入自身/后代拒；**合并不做**——目标同名目录拒
   [v1，§10.2 留口]；纯 .ad 卫沿袭）——**stem 不变 ⇒ 链接零改写**
   （三联对照目录移动级）。front 弹层双 input（源目录 + 目标父
   目录——014 弹层 input 口径直承，dirs_of 本地派生 placeholder）；
   tab 全量 TabsRenamed 循环。
2. **上量微批**（自 PLAN-003 §10 挂账的检索上量观测项兑现）：①
   **StringBuilder 装配**——`auto.stringbuilder.new/append/len/clear`
   natives 在册（160-165 族，catalog:174-179 实勘）——**探针 F 定谳
   .at 面可调性**后 links_json/tags_json/search_json 装配段切换
   O(P²)→O(n)（**逐字节对照零漂移**断言）；②**depth 8 统一**——
   tree/link_index/tags_index/search/collect 五面调用点 `4→8`
   （fs.tree 钳制上限）——深目录工作区覆盖收窄缺口收口（语料 flat
   → 零漂移）。
3. **观察项随批**：F-R17-1 gate 单命令复核（T-04 gate 跑即复核——
   家族稳定窗若至即闭合）；url_decode 供料重勘（T-01 serve-back
   CJK GET 复测一次——双 exe 状态分野注记，负结果维持则如实记）。

上游缺口适配内置：D-19（move_dir POST）；D-20②③；D-24②③④⑤；
D-25①；D-26②/D-28②；D-29①③；D-30①；D-31；D-33②（front 零
新增 computed 面——预注）；**D-34（.length/char_at 定谳——017 新
纪律面，词边界/装配实现对照）**。

## 1. 目标

- **G1（目录移动可用·双轨）**：菜单「文件→移动目录…」→ 弹层（源
  目录 input + 目标父目录 input——**全本地派生** placeholder/无
  fetch）→ 确认 → 单事务逐文件迁移 + 旧目录消 → 树新位（目录结构
  整迁）+ tab 全量更新（TabsRenamed 循环）+ **链接面板零变化断言**
  （三联对照移动级——与 012 档移动同判）+ 快开/标签路径面刷新；
  循环卫（移入自身/后代）拒 + 弹层留置；目标同名目录拒（合并不做
  v1）；同父幂等；取消零落盘。
- **G2（StringBuilder 装配）**：探针 F 定谳（.at 面调用形态——
  new/append/取出 语法）：可调 → 三索引装配段切换（**逐字节对照**
  既有 probe 全族回归零漂移——纯性能优化零语义变化）；不可调 →
  ledger 记账（供料候选）+ O(P²) 维持（阈值口径在册）。
- **G3（depth 8 统一）**：五面调用点 4→8（front tree/link/tags +
  back collect ×2/search 内部）——深目录覆盖收窄缺口收口；**语料
  flat 零漂移**（现行断言全绿）；README 运行矩阵注记。
- **G4（观察项随批）**：F-R17-1 gate 单命令复核实录（闭/续留观如
  实判）；url_decode 重勘实录（同）。
- **G5（测试面）**：file 组子步扩（目录移动弧线）——**组数不变
  16/15/十五段**；**基线 v15 零重锁第三例**（零新 store/App 字段
  ——弹层复用 014 input 模式但目录移动弹层为新实例？——**实勘定**：
  弹层 id 序列入 dump → **v16 重锁**[若新增弹层]；§6 落定时按实
  取，倾向 v16）。
- **非目标**（明确排除）：
  - **目录合并**（目标同名目录存在时的文件并入 + 冲突裁决——v1
    拒；§10.2 留口 r2）；
  - 跨工作区移动、拖拽交互（事件面未证）；
  - **索引单趟合并**（links+tags+dtitle 三 walk 一趟——需契约面/
    缓存层重设，与 watch 批同议 §10.4）；
  - bench 预算面新增（tools/bench 现有 L0 面不动——上量效果以
    probe 计时对照记录，非预算断言）；
  - 大纲（anchor-reveal 连续九片门控）、Time front probe、trash
    增强、Unicode NFKC（候选池顺延）、上游件实做与生成物补件
    （AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十六片是目录移动+上量微批

- **候选池对表**（PLAN-017 §10.6 + 上游实勘 2026-09-25）：大纲
  （连续九片门控——上游 PLAN-701/702 他仓归档线忙，anchor-reveal
  grep 0 维持）、**目录移动/合并（本批主件——池内首个可动件）**、
  **检索上量微批（本批副件——StringBuilder natives 实勘在册，观测
  项兑现条件成熟）**、Time front probe（独立价值低）、url_decode
  回执（家族重建窗重勘——随批轻量）、trash 增强/NFKC（顺延）。
  北标口径（SD-405）：长期线——目录三部曲收官（组织自由度完备：
  建目录/改名/删除/移动 × 档全操作对称）；上量批 = 真实使用前的
  性能预备（O(P²) 装配与 depth 覆盖是仅存的两处已知伸缩性缺口）。
- **形态复用度**：move_dir = 014 rename_dir 循环骨架直承（新父
  路径合成差异）；弹层 = 014 双 input 形态；TabsRenamed/刷新族/
  定向 diff 断言全套在册；StringBuilder 切换 = 装配段等价替换 +
  probe 逐字节对照。**零新语义、零新 UI 形态**。

### 2.2 数据面（back：`move_dir` 新契约 + 装配/深度扩）

```rust
/// 移动目录到新父（单事务逐文件迁移；stem 不变 ⇒ 链接零改写；
/// 循环卫/合并拒/纯 .ad 卫）
/// POST /api/move_dir
#[api(method = "POST", path = "/api/move_dir")]
pub fn move_dir(path str, new_parent str) str {
    return wsys.move_dir_impl(path, new_parent)
}
```

- **move_dir_impl 五步**（rename_dir 骨架直承）：①卫：is_dir(path)
  + is_dir(new_parent) + 清洗（dirname 段原样——移动不改名）+
  **循环卫**（new_parent == path 或 new_parent 以 `path + "/"`
  起 → 拒）+ 目标冲突（`new_parent/{dirname}` exists → 拒——**合并
  不做**）+ 纯 .ad 卫（tree 段扫描）+ 同父幂等（new_parent ==
  dir_of(path) → 返回 path）；②子件清单（tree 标记法——保相对
  结构）；③逐文件迁移（新 rel = new_parent + 余段；move 组合 +
  双复核）；④旧目录 remove_dir + 复核；⑤返回新 dir rel。
- **StringBuilder 装配**（探针 F 后）：`links_json`/`tags_json`/
  `search_json`（+ `trash_list_json`/`page_meta_json` 同族装配点——
  T-01 盘点）逐项 `+` 重接 → builder 追加；**零语义变化**（probe
  全族逐字节对照）。
- **depth 8 统一**：调用点五处（app.at:1780/:1807/:1921 +
  wsys collect ×2 + search 内部常数）`4→8`——fs.tree 钳制上限内。

### 2.3 消费面（front）

- **移动目录弹层**（第 N+1 弹层实例）：双 input（源目录 + 目标父
  目录——placeholder = dirs_of 派生首项；预填 = 无[源/目标均用户
  指定——低频操作直填]或源预填 014 选态?——v1 双空 + placeholder
  引导）；入口 menubar「文件→移动目录…」（**无快捷键**——低频
  + Ctrl+Shift+M 已属档移动）；D-29③ 标题锚（「移动目录」标题
  唯一）。
- **流程** `.MoveDirGo`：move_dir fetch → 非空：关弹层 + 目录下
  档清单（**迁移前** ft_nodes 派生 paths_under——新旧路径对）逐
  TabsRenamed + 刷新族（tree/links/tags）+ bl/ol 重算；拒 →
  console + 弹层留置。
- ⚠ 自派生纪律（D-26②）；D-30① 参数命名；D-33② 零 computed 串接
  （预填走 handler 赋值）。

### 2.4 键位/菜单面

零新快捷键；menubar 文件菜单「移动目录…」（「重命名目录…」后）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-25 会话口述：「计划017已经做完；下一步规划什么
  计划？」——**立项授权**：017 已归档（7dde742——正常立项窗）。
  方向选择（目录移动+上量微批双件）= 候选池首个可动件 + §2.1
  依据；handoff 未否决即生效（PLAN-004..017 同款约定）。
- **目录合并不做**（v1 拒——目标同名即拒）：合并语义（文件并入 +
  逐档冲突裁决）r2 留口。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05；上游仓只读实勘）。无预算/自动续跑/工具链版本指定。

### 4.2 接地证据（本仓实读，2026-09-25 @ main 1c18e65/7dde742）

- **StringBuilder natives 在册**（上游 auto-lang catalog:174-179）：
  `auto.stringbuilder.new/append/append_int/append_char/len/clear`
  （160-165 族）——**探针 F**：.at 面调用语法/别名（`StringBuilder.
  new()`? handle 语义? vue ts_adapter 发射**不涉**——back 侧独占
  [装配全在 wsys]）；fallback：不可调 → ledger 供料候选记账。
- **depth 调用点实勘**：app.at:1780 `tree(root, 4)`/:1807 `link_
  index("", 4)`/:1921 `tags_index("", 4)`；wsys collect_ad_pages
  ("", 4) ×2（links/search walk——:493/:795）；search_json 内部
  同 4——**五面统一点清单在案**。
- **在册复用件**：rename_dir 循环骨架（014——move_dir 直承）；
  move 组合+双复核（006/012）；paths_under（014——tab 更新清单
  派生）；TabsRenamed 循环（014）；弹层双 input 形态 + D-29③ 标题
  锚（014）；链接网定向 diff 断言（012——三联对照移动级复用）；
  O(P²) 阈值口径（003 §10.7——上量批兑现的原始挂账）。
- **D-34（017 新定谳）**：`.length`/`char_at` 语义面——本批装配/
  路径处理对照纪律（无词边界类新面——影响轻微，注记引）。
- **F-R17-1**（017 遗留）：gate 单命令复核——家族工具链稳定窗；
  本批 T-04 gate 常规跑即复核载体（闭/留观如实判）。
- **url_decode 重勘注记**（017 §10.6「家族重建窗后重勘」）：T-01
  serve-back CJK GET 复测一次（负结果维持 → ledger v21 注记）。
- **基线**：v15 现行（017 零重锁第二例续）；本批**弹层新增 → dump
  变化预期**（弹层 id 序列）→ **v16 重锁**（G5 落定——若执行期
  证实弹层不入 dump[闭态]则零重锁第三例，T-04 按实取）。

### 4.3 与既有计划的关系

- 承接 PLAN-012（档移动/三联对照）/PLAN-014（目录生命周期/弹层
  input 口径）——三部曲收官；上量批兑现 PLAN-003 §10.7 + PLAN-004
  §10.7 两处 O(P²)/depth 挂账。
- F-R17-1/url_decode 两观察项随批轻量复核（闭/续留观如实判）。
- D-12（anchor-reveal）供料留观不变。
- PLAN-019 候选池（§10.7 更新）：大纲（anchor-reveal 解锁——首位
  顺延候）、目录合并（本批 §10.2 r2）、索引单趟合并（watch 批
  联动）、Time front 面 probe 批、trash 预览/批量恢复、Unicode
  NFKC 批、url_decode 供料回执件。

## 5. 详细设计

### 5.1 back 契约与扩容（SD-1801）

```
pub fn move_dir_impl(path str, new_parent str) str {
    // ①五卫（is_dir×2/循环卫/合并拒/纯 .ad/同父幂等）
    // ②子件清单（tree 段标记——保相对结构）
    // ③逐文件 move 组合（新 rel = new_parent + 余段）
    // ④旧目录 remove_dir + 复核 → ⑤新 dir rel
}

// StringBuilder（探针 F 后）：装配点清单（links/tags/search/
//   trash_list/page_meta——T-01 盘点）逐段切换；逐字节对照门
// depth：五调用点 4→8
```

### 5.2 front 接线（SD-1801）

- store：`movedir_open` + 双开态口（弹层族续）。
- app.at：msg `ActMoveDir`/`MoveDirSrc(str)`/`MoveDirDst(str)`/
  `MoveDirGo`/`MoveDirCancel`；模型 movedir_src/movedir_dst；menubar
  项；弹层（双 input + placeholder 本地派生）；`.MoveDirGo` 流
  （迁移前清单派生 + TabsRenamed 循环 + 刷新族）。

### 5.3 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-1801 | modify | docs/ARCHITECTURE.md §5 文件管理域语义段 | before：目录面 = 建/重命名/删除（SD-1401）；装配 O(P²) 阈值口径 + depth=4 两处挂账（003/004 §10）。after：①`move_dir` POST 契约（五卫定文——**循环卫**[移入自身/后代拒]/**合并拒**[目标同名拒——v1 不做合并]/纯 .ad/同父幂等；单事务逐文件 + stem 不变零改写[三联对照移动级]）；front 弹层双 input 口径；②**StringBuilder 装配定文**（探针 F 定谳 + 逐字节对照纪律）或供料记账（fallback）；③**depth 8 统一**（五调用点清单——覆盖收窄收口） | 三部曲收官 + 上量观测项兑现 | AC-01/02/03/06 |
| SD-1802 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v15。after：组数**不变**（目录移动入 file 组子步）+ 基线 **v16**（弹层面[id 序列实勘定]或零重锁第三例注记——T-04 按实取落定） | 测试体系表更新 | AC-05 |
| SD-1803 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v15。after：口径不变 + file 组子步扩注记 + 基线按实取指针 + N 定谳续记（F-R17-1 复核实录） | 判绿口径单一权威面（…/1703 续） | AC-05 |
| SD-1804 | modify | docs/README.md「是什么/文档」节 | before：第十五切片=casefold+词边界。after：**第十六切片=目录移动+上量微批**条目（三部曲收官注记）+ ledger v21 指针 | 产品主线进度面派生同步（…/1704 续） | AC-06 |

## 6. 测试设计

- **back 直证（T-01，双臂）**：move_dir 七案——①基础（目录+2 档
  移新父 → 逐档新位 + 字节整迁 + 旧目录消）②**循环卫**（移入
  自身/移入子目录 → 拒零变化）③合并拒（目标父有同名目录 → 拒）④
  纯 .ad 卫 ⑤同父幂等 ⑥CJK 目录名（POST 双臂）⑦**链接零扰动定向
  diff**（前后 link_index 归一相等——仅 path 字段变）。StringBuilder
  对照案——⑧装配逐字节（三索引 probe 全族回归——切换前后输出
  逐字节相等）+ 计时对照记录（500 档合成语料——非断言，实录）。
  depth 案——⑨深层目录覆盖（造 5 层深档 → depth 8 下索引/快开
  可见[4 不可见]——覆盖收窄收口证）。url_decode 重勘——⑩serve-
  back CJK GET 复测一次（实录——负结果维持则 ledger 注记）。
- **vm 矩阵（T-04）**：file 组子步——①移动目录弧线（弹层双 input
  → 确认 → 树新位 + tab 更新 + **面板快照零变化**[三联对照]）②
  取消零落盘 ③循环卫拒弹层留置；deep 案④（5 层档快开命中）。
- **e2e（T-04）**：file 段子步同弧线。
- **基线（T-04）**：按实取（v16 或零重锁第三例——弹层 dump 实勘）。
- **负向（T-05）**：probe 全族十代回归（**StringBuilder 切换零漂移
  的主证面**）；`.console` 零；契约纯增量；D-30①/D-31/D-33②
  grep；冻结池/家族仓零接触；`gen/` 无手改；补件面零增量。

## 7. 验收标准

- **AC-01（move_dir 契约）**：§6 七案双臂全绿；循环卫/合并拒/
  零扰动逐案可证。验证：T-01 直证。
- **AC-02（目录移动 UI 双轨）**：弹层弧线（双 input/确认/树新位/
  tab 更新/面板零变化/拒/取消）vm+e2e 同断言域全绿。验证：T-04。
- **AC-03（上量微批）**：**probe 全族逐字节零漂移**（StringBuilder
  切换主证）；depth 8 深层覆盖案可证；计时对照实录在案（非断言）。
  验证：T-01 + T-04。
- **AC-04（观察项）**：F-R17-1 gate 单命令复核实录（闭/留观如实
  判）；url_decode 重勘实录。验证：T-01/T-04。
- **AC-05（gate + 基线）**：gate ALL GREEN（16/15/十五段口径不变
  ——F-R17-1 复核载体）；基线按实取（v16 重锁零漂移或零重锁第三
  例断言）；N 定谳续记。
- **AC-06（文档面）**：SD-1801..1804 落位锚注齐；**五卫定文 +
  三联对照移动级 + StringBuilder/depth 定谳**入 SD-1801；ledger
  **v21**（探针 F 定谳 + 两观察项实录 + 执行期实勘）。

## 8. 执行步骤

- **T-01 back 契约 + 探针 F + 直证**（AC-01/03）
  - [x] 探针 F（StringBuilder .at 面）定谳 → 可调则装配段切换（逐字节
    对照门）+ probe_dir_ops 扩 move_dir 七案 + depth 五点切换。
  - 验证：直证全绿（含 ⑧⑨⑩）+ vm 矩阵现行组回归零漂移。
  - **[2026-09-26 执行实录]**：探针 F **可调定谳**（debug exe——全原语
    冒烟：new/append/append_int/append_char/len/clear/build + CJK 大装配
    15000 字符无损；上游 test/vm/13_collections 014-019 同款语法
    `var sb StringBuilder = StringBuilder.new(n)`/`return sb.build()`——
    平帧安全，C2 递归帧损坏面不涉）。装配切换落位六处（extract_links_
    json/links_json/search_json/tags_json[双 builder]/trash_list_json/
    page_meta_json——T-01 盘点扩：extract_links_json 为 links 装配链内件
    ）。**逐字节对照门**：标准语料三索引+双 JSON 前后采 9/9 逐字节相等
    （切换前/后各一采——e2e/.runtime 一次性脚本）+ probe 全族 13 件
    [12 绿+receipt 负结果一致]。**⑧ 执行期实勘（规模上限——ledger v21
    新条目 D-35 候选）**：500 档合成语料 link_index 在旧 `+` 装配下
    P≈512 即 VM 值损坏（split 返 HTTP 200 空串/0；builder 切换后 500
    档仍坏——「bulkalias201」陈旧槽内容形；merged 臂 N=200 正确/N=300
    handler 静默中止[240s 预算排除慢]）——上游字符串池域（rc.rs Plan
    419/510 UAF/幻影 freelist 家族+家族重建窗 D-21），非本批装配面；
    阈值口径「P ≤ 数百」实勘收窄为「P ≤ 200 稳定域」。depth 五点
    4→8 落位（app.at tree/link×2/tags + wsys search/rename walk）。
    probe_dir_ops 扩案 m①..m⑦+m2b/m3b（merged 域后代/同名目录形）+
    p⑨ depth（三深度采+5 层深档 d8 含/d4 不含+search 8 walk）+ p⑩
    url_decode 重勘（**D-19 维持**——GET bool 序列化实勘为裸 1/0 非
    JSON true/false，断言口径随校）。计时实录（非断言）：500 档 split
    link_index 2744ms[前]/2726ms[后]——文件 IO 主导，装配收益在 ADD
    计数不在墙钟。复跑：vm_matrix merged 16/16[基线 v15 零漂移]/
    split 15/15 ALL GREEN。
- **T-02 front 弹层 + 入口**（AC-02 前半）
  - store 开态 + menubar 项 + 弹层双 input（本地派生 placeholder）。
  - 验证：merged 冒烟（弹层/取消/拒）+ `pnpm build` PASS。
- **T-03 移动流收口**（AC-02 后半）
  - `.MoveDirGo` 流（迁移前清单 + TabsRenamed 循环 + 刷新族）+
  三联对照冒烟（面板快照比对）。
  - 验证：merged 冒烟全弧线 + file 组回归 + e2e 子步冒烟。
- **T-04 测试扩单 + 基线按实取 + 判绿 + F-R17-1 复核**（AC-02/
  03/04/05）
  - file 组子步 + deep 案 + 基线落定 + gate（单命令复核实录）。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN。
- **T-05 文档 + ledger v21 + 收口**（AC-06/负向）
  - SD-1801..1804 落位；ledger v20→v21；负向证（probe 十代回归
    主证）；§9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性；探针 F 为副件
首闸——不可调仅缩副件范围，主件不阻塞）。

## 9. 复审记录

- **2026-09-25 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-018，revision 1。
  - `outcome: pass`——可进 work（017 已归档 7dde742——正常立项窗）。
  - `next: work`（T-01 起；探针 F 副件闸、主件零闸）。
  - 目录合并 v1 不做（§4.1——r2 口）；基线 v16/零重锁第三例按
    弹层 dump 实勘落定（T-04）。

## 10. 待澄清事项

1. **探针 F（StringBuilder .at 面）**：natives 160-165 在册——
   调用语法/别名/handle 语义待定谳；不可调 → 副件缩为 depth 8
   统一 + ledger 供料候选（主件不受影响）。
2. **目录合并**（v1 拒）：目标同名目录拒 + §10 留口——合并语义
   （文件并入 + 逐档冲突裁决/跳过策略）r2 裁决。
3. **索引单趟合并**（watch 批联动，明确不做）：links+tags+dtitle
   三 walk 一趟化需契约/缓存层重设——与文件系统 watch 批同议
   （届时刷新触发集本身重构）。
4. **计时对照口径**（非断言）：500 档合成语料 Builder 前后计时
   实录进 T-01 证据块——bench 预算面不新增（L0 现状）。
5. **D-21 POST 波及**（观测项）：move_dir 单 POST（多文件 back
   内联）；负载窗按 README 重跑口径。
6. **PLAN-019 候选池**（本批后更新）：大纲（anchor-reveal 解锁
   ——首位顺延候）、目录合并（r2）、索引单趟合并（watch 联动）、
   Time front 面 probe 批、trash 预览/批量恢复、Unicode NFKC 批、
   url_decode 供料回执件。
