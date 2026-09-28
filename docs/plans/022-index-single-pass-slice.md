---
plan_id: PLAN-022
status: executing
feature_name: 索引单趟合并性能批（第二十切片）
author: [agent]
created_at: 2026-09-28T03:56:15Z
updated_at: 2026-09-28T06:40:00Z
plan_revision: 1
current_step: 4
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/README.md 计划仪表盘 PLAN-022 候选池②（索引单趟合并——150 页实测 findings 衔升）
---

# PLAN-022：索引单趟合并性能批（第二十切片）

## 0. 变更摘要

试用驱动阶段首个立项批（README 仪表盘候选池②——候选①试用反馈件因
用户反馈缺席按定文不立项，顺延至本件）。**纯内部性能优化**：back
`tags_json` 单趟化（O(T×P) 双遍 `page_tag_set` 磁盘重读 → 单趟平行集
内存聚合）+ front `orphan_rows_of` 守卫前置与平面化（无条件 O(P²×L̄)
入度扫描 → 仅零出链候选计数）。**契约零变化、输出逐字节零漂移、
基线 v19 零重锁候选（零重锁第三例——PLAN-017 纯 back 语义扩容片先例
同判）**。021 150 页实测三 findings（tags 3.4-3.6s / 孤页入口
8078-8248ms / boot tags walk 大头）收口，bench150 重放对拍量级门。

## 1. 目标

1. **① tags_json 单趟化**（wsys.at:2541）：现两遍聚合——pass1 全页
   `page_tag_set` 收集 first-seen tag 序后**弃置结果**；pass2 每
   (tag, page) 对**重调** `page_tag_set`（每次 = File.read_text +
   read_body 两趟磁盘读）判定归属。T×P×2 趟读 → **P×2 趟**（150 页
   实测 3.4-3.6s 的主导项）。聚合算法与输出序零变化。
2. **② orphan_rows_of 守卫前置 + 平面化**（app.at:820）：现每页
   **无条件**扫描全部他页出链计 ind（O(P²×L̄) VM 解释循环——孤页
   入口 8078-8248ms 大头），而 ind 仅在 outd==0 时被消费。改为：
   一趟平面收集全部 resolved target_path（O(L)）+ 仅零出链候选页
   对平面表计数（C×L）。行集/序/形状零变化。
3. **③ bench150 重放提速实录**（AC-03 量级门）：同语料同窗对拍
   （021 在档 ignored 件 `e2e/.runtime/p21-bench150.mjs` +
   `p21-ws150`），boot tags walk 大头随之消除（findings ③ 同①根因）。

**非目标**：

- **watch 批**（fs 监听免重 walk）——D-22 观测③原始归属批次，
  独立立项面，本批不动。
- **LinksRefreshOf 双取形消除**（app.at:2236-2238 link_index 原文态
  +解析态两次取）——D-20⑤ 上游 ts_adapter 面（identifier 实参静默
  降恒等）；link_index 289-304ms@150 页健康，非 findings，双取无害
  口径维持（供料候选在册）。
- **links_json / search_json 每页双读单读化**（File.read_text 取
  frontmatter + read_body 再读一遍）——link 290ms / search 54-72ms
  量级健康，非 findings；watch 批联动再议。
- **契约面零变化**：不新增/不合并/不改契约（api.at 零 diff）——
  「单趟合并」指索引装配的趟数合并，非契约合并。

**成功样**：150 页工作区 tags 面板开启、孤页清单入口、boot 序列均
进入秒级内可用带（详见 §5.3 量级预估与 AC-03 门）；标准语料全部
既有断言零漂移全绿。

## 2. 架构方案

**现状证据链**（@7ebe95c 一手勘定）：

- **back tags_json 两遍聚合**（wsys.at:2541-2602）：pass1（2545-2567）
  逐页 `page_tag_set(rel)` 收集 first-seen tag 全集，**每页 tag 集
  弃置**；pass2（2569-2600）每 tag × 每页**重调** `page_tag_set(rel2)`
  （2577）判归属装 paths。`page_tag_set`（2505-2527）= File.read_text
  （frontmatter 面）+ read_body（再读 + 剥离）**两趟磁盘读**——
  pass2 即 T×P×2 趟重复读。021 bench ①b 全量 3.4-3.6s 主导项。
- **front orphan_rows_of 无条件全扫**（app.at:820-857）：i 循环每页
  无条件 j×k 嵌套扫全部他页出链计 ind（831-848），守卫后置——
  `if outd == 0 { if ind == 0 {push} }`（849-853）才消费 ind。021
  bench 孤页清单入口 8078-8248ms（行集 0 全连接语料）。
- **boot 序**（app.at:2009-2017）：Init = TreeRefresh +
  LinksRefreshOf("")[link_index 双取形——2 趟] + TagsRefresh（tags
  walk = boot-ready 6.2s 大头）+ MentionsRefreshOf + recents 载入。
  findings ③「boot tags walk 大头」与①同根因（tags_json 重读面）。

**改法**（两处纯函数内部重写，接口/输出零变化）：

1. **tags_json 单趟化**：pass1 循环内保留每页 ptags（`ptags_all`
   List of List——stems/rels/aliases 平行 List 同款在册形态）；pass2
   归聚合循环改读 `ptags_all[i2]`（2577 行 `page_tag_set(rel2)` 调用
   → 平行集索引取）。`page_tag_set` 在 tags_json 内调用点清零（函数
   本体保留——单页语义面在册，见 §10.2）。**输出逐字节等价论证**：
   `ptags_all[i] ≡ page_tag_set(pages[i].rel)`（同函数同输入纯读无
   副作用，调用时机变化零外溢）；first-seen 序 / paths walk 序 /
   装配段零触碰。
2. **orphan_rows_of 守卫前置 + 平面化**：①一趟 j×k 平面收集全部
   resolved target_path（tp != "" 才 push，O(L)）；②i 循环：outd =
   links.len()，**仅 outd==0 候选**对平面表扫计数 ind（C×L），双零
   → push {path}。**行集等价论证**：原码 j != i 排除自链——而
   outd==0 ⇒ 自身零出链 ⇒ 自身对平面表贡献零条 resolved 链 ⇒ 自链
   排除自动满足（守卫前置的副产品，等价成立）；悬空链 tp=="" 不入
   平面表（resolved 面口径原样）；pages 原序（walk 序）与行形状
   {path} 零变化。D-20② 纪律：平面收集循环内元素先拷局部变量再取
   字段（在册形态续）。

**双轨一致性**：改动均在 `.at` 单源（back wsys.at + front app.at），
merged / split / vue 三形态同源生效——vm 矩阵 + vue e2e 同单全量
承载（既有断言域 = 结构/文本/磁盘字节）。

## 3. 技术栈

无新栈。Auto `.at` 单源面两处纯函数改写（AutoVM List 平行结构——
无 map 原语面维持既定形态）；bench 重放 = node 一次性脚本（ignored
`.runtime` 家族口径——021 件在档：`e2e/.runtime/p21-bench150.mjs`
+ 语料 `p21-ws150` 均存续，缺失则按 021 §8 T-04 实录参数重建）；
判绿 = 既有门（`node tests/vm_matrix.mjs` / `pnpm test:e2e` /
`node scripts/gate.mjs` 分段口径）。

## 4. 需求分析与背景调查

**授权记录**：用户口述「请根据设计文档，规划一下个计划任务」+
`$auto-plan-new` 技能调用（2026-09-28）。立项对象裁量依据 = README
计划仪表盘 PLAN-022 候选池首位序（7ebe95c）：候选①试用反馈件——
用户真实试用反馈**本会话缺席**，按仪表盘定文「无反馈则本类不立项」
顺延；候选②索引单趟合并——150 页实测工件衍生 findings 量级在案
（021 §8 T-04 / §10.4 分账 + ledger D-22 观测③ + D-38），**本计划
立项对象**。允许范围 = jade-edit 主检出（本技能仅起草
`docs/plans/022-*.md`，不触实现文件与 canonical 文档——work 阶段
另按 auto-plan-work 惯例授权执行）。无用户指定预算或自动续跑限制
——未发明。

**背景引文**（溯源）：

- 021 §8 T-04 执行实录（150 页实测四点计时 + findings 分账）：
  ①b tags_index 全量 3.4-3.6s；孤页清单入口 8078-8248ms（行集 0）；
  boot-ready 6.2s（tags walk 大头）；「①tags_index 3.6s @150 页
  [本仓 tags_json O(T×P) 双遍 page_tag_set 重读面——D-22 观测③
  「索引单趟合并」量级观测首实录→PLAN-022 候选]；②孤页清单入口
  8.2s[本仓 orphan_rows_of O(P²)+入口即刷新双 walk→PLAN-022 候选
  （随索引单趟顺产）]；③boot-ready 6.2s 大头 = tags walk[同①根因]」。
- 021 §10.4 落定分账：「本仓面 = tags_json O(T×P) 双遍重读 3.6s/
  orphan_rows_of O(P²) 8.2s/boot tags walk 大头（①②③——均转
  PLAN-022『索引单趟合并』候选域）」。
- ledger D-22 观测③（PLAN-004 立项、PLAN-018 部分收口）：
  「O(T×P) page_tag_set 重读面不动——索引单趟合并随 watch 批」；
  wsys.at:2537-2539 装配注记同款（O(T×P) 重读面不动——本批兑现）。
- 021 复审窗 bench 重放（549c8a3 树）：tags 2.8s / boot-ready 5.3s
  ——执行期量级带内在案（AC-03 门取带宽上界计）。
- D-35② 稳定域口径：P ≤ 200（150 页语料在安全线内——本批优化不
  改变该域定文）。

**代码勘定**（@7ebe95c，路径:行号）：

- `src/back/wsys.at:2505-2527` page_tag_set（File.read_text +
  read_body 双读；调用点仅 tags_json 内 2548/2577 两处）。
- `src/back/wsys.at:2541-2602` tags_json 双遍聚合（pass1 2545-2567 /
  pass2 2569-2600——2577 重调点）。
- `src/front/app.at:820-857` orphan_rows_of（828 outd 取 / 831-848
  无条件 ind 扫 / 849-853 守卫后置消费）。
- `src/front/app.at:2009-2017` Init 序；`2231-2261` LinksRefreshOf
  （2236-2238 双取形——非目标面在册）。
- `tests/baseline/structure-v19.txt` state 面含 links_json /
  tags_rows / orphan_rows 既有值（零重锁 = 该文件零触碰零漂移）。
- `e2e/.runtime/p21-bench150.mjs` + `e2e/.runtime/p21-ws150`（021
  一次性 bench 件 + 150 页语料，ignored 存续实勘 2026-09-28）。

**观测项**（不动手记账，work/复审窗复核）：

- wanted_rows_of（app.at:750-808）同构嵌套扫描 O(D×P×L̄)（D=悬空
  目标数）——语料级小非 findings 不动；watch 批联动再议。
- LinksRefreshOf 双取形 / links_json·search_json 每页双读（§1 非目
  标三条——量级健康在案）。

## 5. 详细设计

### 5.1 back：tags_json 单趟化（wsys.at）

现形状（2541-2602）：

```
pass1: i 循环全页 → ptags = page_tag_set(rel) → first-seen 收集 tags 全集（ptags 弃置）
pass2: t × i2 循环 → 每 (tag, page) 重调 ptags2 = page_tag_set(rel2) → 判归属 → paths 装配
```

新形状：

```
pass1: i 循环全页 → ptags = page_tag_set(rel) → ptags_all.push(ptags)【保留】
      + first-seen 收集 tags 全集（算法原样）
pass2: t × i2 循环 → ptags2 = ptags_all[i2]【平行集索引取，零磁盘】→ 判归属 → paths 装配
```

- 平行结构 = `var ptags_all List = []` + `ptags_all.push(ptags)`——
  stems/rels/aliases/dtitles（links_json:435-448）同款在册形态。
- 聚合算法、tag first-seen 序、paths walk 序、StringBuilder 装配段
  全部零触碰——仅数据源从重读换平行集。
- 输出逐字节等价：`ptags_all[i] ≡ page_tag_set(pages[i].rel)`（纯读
  函数同输入同输出；两 pass 间无写操作——文件系统位态不变窗内恒等）。
- `page_tag_set` 函数本体保留（2505-2527）：调用点清零后为语义面
  在册保留（单页 tag 集口径——文档消费者；不删码，见 §10.2）。
- 文档注记：tags_json docstring「两遍聚合」段随改（O(T×P) 重读面
  → 单趟平行集——PLAN-022 SD-2201 指针）。

### 5.2 front：orphan_rows_of 守卫前置 + 平面化（app.at）

现形状（820-857）：i 循环每页无条件 j×k 嵌套扫（ind 全量计算）→
守卫后置消费。

新形状：

```
平面预收: j × k 一趟 → lnk.target_path != "" 才 push 平面表 tps（O(L)）
i 循环:   outd = page.links.len()
          if outd == 0:              【守卫前置——仅候选页扫】
              ind = 平面表 tps 内 == ppath 计数（C×L）
              if ind == 0: push {path}
```

- 等价论证（三面）：
  1. **自链排除**：原码 j != i 排除自身 resolved 出链计入 ind；
    outd==0 ⇒ 自身 links.len()==0 ⇒ 自身对平面表零贡献 ⇒ 排除自动
    满足。
  2. **resolved 面**：原码 tp != "" 卫（悬空不计入）→ 平面表收集
    同卫原样。
  3. **行集**：pages 原序（walk 序）遍历 + 双零判定序不变 → 行集、
    行序、行形状 {path} 逐项等价。
- D-20② 纪律：平面收集循环内 `var lnk = olinks[k]` 先拷局部变量再
  取字段（原码 837 同款续）；D-30① 参数名 pages 避开模型名（原样
  保留）。
- docstring 随改（「纯派生零 back 增量」口径不变 + 单趟化注记——
  PLAN-022 SD-2201 指针）。

### 5.3 量级预估（AC-03 门依据）

| 面 | 现（150 页在册） | 改后预估 | 门 |
| --- | --- | --- | --- |
| tags_index HTTP | 3.4-3.6s（首跑）/2.8s（复审窗） | 0.5-1.5s（磁盘读 ~12,000 → 300 趟；VM 聚合循环量不变） | **≤1.5s**（≥2× 底线） |
| 孤页清单入口（merged UI） | 8078-8248ms | ≤1.5s（O(P²×L̄) → O(L+C×L)；含 LinksRefreshOf 双取 walk ~0.6s 不变残余） | **≤2.0s**（≥4× 底线） |
| boot-ready（merged UI） | 6.2s（复审窗 5.3s） | ~2.5-3.5s（tags walk 大头消除；spawn/树取/UI 残余） | 记录面不设门（环境敏感——家族负载窗 D-21） |

### 5.4 测试面影响

- **零新子步 / 零扩单**：行为零变化——既有断言域全量承载（vm 矩阵
  16 组含 link 组 ⑧ orphans 三语义面 / meta 组 tags 面全量）。
- **基线 v19 零重锁候选**（零重锁第三例）：store/App 模型零新字段、
  autoui_state dump 面零变化（links_json/tags_rows/orphan_rows 值
  域不变）、snapshot id 序列零变化——PLAN-017 零重锁先例同判（纯
  内部优化片）。
- **前后采逐字节门**（PLAN-018 StringBuilder 切换先例形态）：改动
  前后 tags_json 输出对拍（标准语料 fixture + p21-ws150 150 页语料
  ——9 采点形态：两语料 × [全文 + 首中尾锚]）相等；orphan 行集由
  vm 矩阵 ⑧ 段既有断言承载（等价论证 §5.2）。

### 5.5 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2201 | modify | docs/ARCHITECTURE.md §5（后端） | before：tags_json 两遍聚合 + 「O(T×P) page_tag_set 重读面不动——索引单趟合并随 watch 批」注记；orphan_rows_of 无条件 ind 扫描无专项定文。after：§5 第二十切片段——索引单趟合并定文（tags 单趟平行集聚合 + orphan 守卫前置/平面化[含自链排除等价论证]）+ 150 页量级实录对拍（3.6s/8.2s → AC-03 门内值）+ 契约/输出零变化定文 + watch 批剩余面注记（重 walk 免除属 watch 批） | 021 150 页实测 findings ①②③收口（§10.4 分账本仓面）；D-22 观测③兑现 | AC-01/02/03 |
| SD-2202 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests 节 | before：SD-2102 口径（16/15/十五段 + 基线 v19 + 实测工件注记 + N 定谳 021 实录）。after：heading 续 SD-2202 + PLAN-022 N 定谳实录（零扩单/零子步 + 基线 v19 零重锁第三例 + bench 对拍门注记 + split 臂家族窗口径续记） | 判绿口径单一权威面（…/2103 续） | AC-04 |
| SD-2203 | modify | docs/README.md 是什么 + 计划（阶段仪表盘） | before：第十九切片条目 + 候选池②索引单趟合并在列。after：第二十切片条目（索引单趟合并性能批）+ 仪表盘候选池更新（② 出池、③④顺延首位）+ 留观项面板续记 | 进度面单一权威（SD-2104 续） | AC-06 |
| SD-2204 | modify | docs/parity-ledger.md | before：v25——D-22 观测③「随 watch 批」挂账 + D-38 量级在案。after：v26——D-22 处置更新（观测③ tags 单趟 + orphan 守卫兑现，量级收口；watch 批剩余面注记）+ 执行窗实勘集若有新面则 D-39 新行 | 衍生账随批刷新惯例（SD-2104 同款） | AC-06 |

frontmatter 注记：`new_spec_components` 为空——四面全为既有文档
modify（本仓 canonical 知识基座 = ARCHITECTURE/README/ledger 三件，
001..021 在档惯例；无 docs/specs/ 目录——非本批新建）。

## 6. 测试设计

- **前后采逐字节门**（T-01 内联 + T-04 复核）：标准语料（tests
  fixture 五档）+ p21-ws150 两面，改动前后 `tags_json` 输出全文 +
  首中尾锚 9 采点相等（node 直调 serve-back HTTP 面——021 bench 同
  通道）。link_index 不改但也入对拍面（本批零涉直证）。
- **probe 全族 fresh**（back 改后首跑——013 教训兑现）：probe_tags
  双臂六案重点（契约输出零变化直证）+ 其余 13 件回归（RESULT 全绿
  + probe_receipt_d19 负结果一致）。
- **vm 矩阵**：merged 16/16 ALL GREEN + 基线 v19 零漂移（零重锁第
  三例承载）；link 组 ⑧ orphans 段（fs 造纯孤页入列 → 造链清孤 →
  悬空出链计入出链度）= orphan 重写语义面直证。split 臂 = D-21 v25
  家族窗口径如实记（exe 时间戳复核；分段判绿——018..021 四批先例）。
- **vue e2e 十五段**（同一检查单；serve-back 后端）+ **vue build**
  （release 路由 + SCHEMA_DRIFT_GENERATE_AT=1——家族窗延续口径）。
- **bench150 重放**（AC-03 门）：p21-bench150.mjs 四点计时 + 孤页
  入口 + boot-ready 全弧重放，与 021 在册值对拍（§5.3 门裁定）；
  工件实录进 §8 T-04（ignored 件——量级结论入计划/ledger 持久面，
  021 口径同）。

## 7. 验收标准

- **AC-01（tags 单趟化——输出零漂移直证）**：`tags_json` 改动前后
  输出逐字节相等（标准语料 + p21-ws150 两面 9 采点）+ probe_tags
  双臂六案全绿 + api.at 零 diff（契约零变化）。验证：T-01 前后采
  脚本实录 + `node tests/probe_tags.mjs` RESULT 全绿 + `git diff
  src/back/api.at` 空。
- **AC-02（orphan 语义面零变化直证）**：vm 矩阵 link 组 ⑧ orphans
  段全绿（纯孤页入列/造链清孤/悬空计入出链度三语义面）+ §5.2 等价
  论证三面在案。验证：merged 矩阵 16/16 内 ⑧ 段 PASS。
- **AC-03（bench150 重放量级门）**：同窗重放 `tags_index` ≤1.5s
  （在册 2.8-3.6s）+ 孤页清单入口 ≤2.0s（在册 8.078-8.248s）+
  boot-ready 实录（记录面不设门）+ findings 无新增败形（深档/快开/
  保存/完整性面量级带内）。验证：p21-bench150.mjs 重放实录进 §8
  T-04；越门时同窗重跑一次（家族负载窗口径——README 判绿同款），
  仍越门 = needs_fix 归因。
- **AC-04（判绿门）**：vm merged 16/16 ALL GREEN + 基线 **v19 零漂
  移**（零重锁第三例）+ vue e2e 十五段绿 + vue build 绿；split 臂
  家族窗口径如实记（D-21 v25 延续——分段判绿先例承载，非阻断）。
  验证：`node tests/vm_matrix.mjs`（merged 臂）+ `pnpm test:e2e` +
  `pnpm build` 实录。
- **AC-05（负向证）**：probe 全族 fresh（14 件）+ 冻结池/家族仓零
  接触 + gen/dist 零手改 + 基线文件零触碰（零重锁实证）+ `.console`
  写面零违例（app.at grep 0——D-25①）。验证：grep 族 + git status
  面实录。
- **AC-06（文档落位）**：SD-2201..2204 锚位（ARCH §5/§6 + README
  Tests/是什么/仪表盘 + ledger v26 表头 bump 与 D-22 处置更新读回）
  + 本计划 §8 执行实录齐。验证：文档 diff 检视 + ledger 表头读回。

## 8. 执行步骤

- **T-01 back tags_json 单趟化**（AC-01）
  - [x] wsys.at:2541 tags_json：pass1 平行集保留（ptags_all List of
    List）+ pass2 索引取（2577 重调点清零）+ docstring 注记更新
    （SD-2201 指针）。
  - 验证：前后采逐字节门（标准语料 + p21-ws150 两面 9 采点相等）
    + `node tests/probe_tags.mjs` 双臂全绿 + api.at 零 diff。
  - 影响面：`src/back/wsys.at`（modify——无新路径）。
  - **[执行实录 2026-09-28]**：改写落位（ptags_all 平行集
    `pages` 序平行——links_json stems/rels 在册形态；pass2
    `ptags_all[i2]` 索引取 + D-20② 注记；docstring「单趟平行集聚合
    」SD-2201 指针——O(T×P) 重读面兑现收口注记替换原「随 watch 批」
    挂账）。`page_tag_set` 调用点 tags_json 内清零（剩 pass1 每页一
    调——单趟目标形态），函数本体保留（§10.2 语义面在册）。验证：
    **前后采逐字节门 PASS**（一次性件 `e2e/.runtime/p22-tags-sample
    .mjs`——serve-back 同通道双语料全量落盘：标准语料 397B/7tag
    sha256 `0c5e76e8…` 与 p21-ws150 3379B/46tag sha256 `1dcaad66…`
    改动前后全等[cmp 逐字节] + 首/中/尾锚逐项相等——9 采点形）+
    probe_tags 双臂六案全绿（全集首锁 11 tag first-seen/无 fm 零/
    无键零/缩进两形/同页去重/depth 传递 + 双臂逐字节一致=true ×3）+
    api.at 零 diff（0 行——契约零变化直证）。
- **T-02 front orphan_rows_of 守卫前置 + 平面化**（AC-02）
  - [x] app.at:820 orphan_rows_of：平面预收一趟（tps List）+ 守卫
    前置（outd==0 才扫）+ docstring 注记更新；§5.2 等价论证随文。
  - 验证：vm 矩阵 merged 16/16 内 link 组 ⑧ orphans 段 PASS（T-03
    判绿承载）+ 孤页行集前后对拍（标准语料——probe/矩阵既有断言）。
  - 影响面：`src/front/app.at`（modify——无新路径）。
  - **[执行实录 2026-09-28]**：改写落位（平面预收 tps List 一趟
    O(L)——tp != "" 卫原样；守卫前置 outd==0 才对平面表计 ind
    C×L；D-20② 局部拷贝纪律续/D-30① 参数名 pages 保留；docstring
    单趟化注记 + 自链排除等价论证随文）。**等价论证三面成立**：①自
    链排除 = outd==0 ⇒ 零自贡献（守卫前置副产品）②resolved 面 =
    tp != "" 卫原样 ③行集/序/形状 {path} = pages 原序遍历不变。验证：
    merged 矩阵 16/16 内 **⑧ orphans 段 PASS**（无 input 负向面+fs
    造纯孤页档入列→行点击开档→造链清孤→悬空出链计入出链度——
    resolved 面三语义直证）+ 基线 v19 零漂移（orphan_rows pristine
    恒空值域不变直证）。
- **T-03 判绿跑**（AC-04/05）
  - [x] vm merged 矩阵 16/16 ALL GREEN + 基线 v19 零漂移；e2e 十五
    段；vue build（release 路由）；probe 全族 14 件 fresh；split 臂
    家族窗实录（exe 时间戳 + 独立跑判别链——D-21 v25 口径）。
  - 验证：各门 RESULT/日志实录进本节。
  - **[执行实录 2026-09-28]**：merged 矩阵 **16/16 ALL GREEN**（基线
    v19 零漂移 PASS——**零重锁第三例**：store/App 零新字段/dump 面
    零变化/id 序列零变化；⑧ orphans 三语义面/⑩ 持久化逐行验/⑩b/⑩c
    防线案全过；日志 `e2e/.runtime/p22-matrix-merged.log`）+ e2e 十五
    段全绿 **1.1m**（`p22-e2e.log`）+ vue build 绿（release 路由
    +SCHEMA_DRIFT_GENERATE_AT=1 ✓ built 8.75s——`p22-build.log`）+
    probe 全族 **14 件 fresh**（probe_alias_linkify/casefold/create/
    daily/delete/dir_move/dir_ops/inline_tags/page_meta/recent/
    rename/trash 12 件 RESULT 全绿双臂 + probe_tags[ T-01 窗] +
    probe_receipt_d19 负结果 D-19 在册一致）+ **split 臂 = 外部家族
    窗第六例**（分段判绿先例承载）：独立跑 ×2 boot FAIL+wiki 树行
    不现 v23/v24/v25 逐字同形——**判别链外部性定谳**：git-archive
    pre-change 树（7ebe95c）同 exe 复现同款[本批零接触证；**物料形
    状新教训**：archive 不含 ignored `deps/` 首跑 flatten_tree 符号
    未定——补拷后复现同款；物料即用即删 D-37⑦ 纪律续]+ serve-back
    通道健康旁证[e2e 1.1m + probe 族 split 臂同窗全绿] + **exe 时间
    戳变更实录**：debug **09-27 22:38**（021 在册 09-26 10:43 后家
    族重建——本批全程新 exe 载体实跑）/release 09-25 17:58 未变
    （D-35② 复测执行窗条件或至——留观面板交接 §10.6）。
- **T-04 bench150 重放工件**（AC-03）
  - [x] p21-bench150.mjs 重放（件在档——缺失则按 021 §8 T-04 参数
    重建）：四点计时 + 孤页入口 + boot-ready + findings 对拍；§5.3
    门裁定实录。
  - 验证：AC-03 门值实录进本节（无越门或同窗重跑绿）。
  - **[执行实录 2026-09-28]**：重放两跑（`p22-bench150.log`/
    `p22-bench150-r2.log`）+ 归因件 dbg-p22.mjs A/B 三轮。
    **首跑（健康窗）**：①link_index 冷/热 294/286/286ms + ②search
    54-65ms + ③create 1-2ms + ④rename 46ms（四点计时带内在册——
    完整性 150 页/首深锚/悬空 10/改名改写/153 计数全过）+ **①b
    tags_index 246ms ≤1.5s PASS**（在册 2.8-3.6s——≥11×；单趟化
    收口直证）+ ⑤UI boot-ready **2640ms**（在册 5.3-6.2s——tags
    walk 大头消除实证；记录面不设门）+ ⑥⑦⑧快开/深档/保存 502/1611/
    512ms 带内 + **⑨孤页清单入口 3412ms 越门（门 ≤2.0s）**（在册
    8078-8248ms——2.4×）+ findings 无新增败形。**同窗重跑 = 家族负
    载劣化窗**（link_index 冷 294→902ms 等零接触面三面同证 ~3× 系统性
    劣化——不作判据口径如实记）。**A/B 归因**（dbg-p22.mjs 一次性
    件——同 exe 同语料交替三轮细粒度弧计时）：click→mode 2480→1560ms
    **定向面贡献 ≈ −0.93s**（旧 orphan_rows_of O(P²×L̄) 全扫成本）；
    残余 2.5s = **非目标面**（LinksRefreshOf 双取 0.6s + to_value
    解析 + 派生族 + MentionsRefreshOf 串联 + 仪表固定 sleep ~0.7s）
    ——VM 循环量主导而非磁盘读；**零成本反事实仍越门 = 门在本批授
    权范围不可达**（§5.3 残余预估 0.6s 失准所致）。**§10.1 口径裁
    定**：needs_fix 归因入档（watch 批供料面记账不硬调门）交复审
    裁处——见 §10.7。
- **T-05 文档 + ledger v26 + 收口**（AC-06）
  - [ ] SD-2201（ARCH §5）/SD-2202（ARCH §6 + README Tests）/SD-2203
    （README 是什么 + 仪表盘）/SD-2204（ledger v25→v26）落位 + §9
    work 记录。
  - 验证：文档 diff 检视 + ledger 表头读回 + 负向证 grep 族（AC-05）。
  - （docs 落位随批线性提交——T-05 实录随收口笔入档）

依赖序：T-01 → T-02 → T-03 → T-04 → T-05（线性——001..021 提交序
惯例；零探针零闸：平行 List/守卫前置全在册形态，无上游解锁依赖）。

## 9. 复审记录

- **2026-09-28 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-022，revision 1。
  - `outcome: pass`——可进 work（021 已归档 7ebe95c——正常立项窗；
    仪表盘候选①试用反馈件因反馈缺席顺延，②索引单趟合并量级证据
    在案）。
  - `next: work`（T-01 起；零探针零闸）。
  - 立项裁量记录：候选池首位序依 README 仪表盘（7ebe95c）——试用
    反馈缺席 → 索引单趟合并（150 页 findings 衔升）；bench 量级门
    取 §5.3（021 执行期 + 复审窗双值带宽上界计）。

- **2026-09-28 work 收口（auto-plan:work）**：
  - `stage: work | plan_id: PLAN-022 | plan_revision: 1 | outcome: pass`
  - `code_commit`: 见提交实录（T-01+T-02 back/front 双面纯函数重写 +
    计划进度随批——线性直接 main，001..021 在档惯例；T-05 docs
    SD-2201..2204 + ledger v26 随后线性提交）。T-03 判绿/T-04 bench
    = 零入库面工件（日志/一次性件居 ignored `.runtime`——实录进 §8）。
  - `task_ids`: T-01..T-04 全勾（T-05 docs 落位随批线性提交——收口
    笔入档后全勾 5/5）；`current_step: 4/5`。
  - `evidence`: 前后采逐字节门（双语料 sha256 改动前后全等 + 首中尾
    锚——AC-01 直证）+ probe_tags 双臂六案全绿 + merged 矩阵 16/16
    ALL GREEN（基线 v19 零漂移——零重锁第三例；⑧ orphans 三语义面
    ——AC-02 直证）+ e2e 十五段 1.1m + vue build 绿（release 路由）+
    probe 全族 14 件 fresh + bench150 重放（tags 246ms ≤1.5s 过门/
    boot-ready 2.64s 实录/孤页 3.4s 越门 A/B 归因在案）+ split 臂家
    族窗第六例 pre-change A/B 零接触定谳 + 负向证六面（§8 T-05 实录）。
  - `blockers`: **AC-03 孤页门越门**[3.4s > 2.0s——A/B 归因=定向面
    −0.93s 已交付、残余 2.5s=非目标面（双取形/派生族/仪表）VM 循环
    量主导；零成本反事实仍越门=授权范围不可达；§10.1/§10.7 口径
    needs_fix 归因入档交复审裁处] + **split 臂外部家族窗第六例**
    [分段判绿先例承载——D-21 v26 扩记；pre-change A/B 零接触定谳]。
  - `next`: review（建议独立会话复审；工件重建口径 = merged 矩阵 +
    前后采件 `e2e/.runtime/p22-tags-sample.mjs` + probe_tags +
    `e2e/.runtime/p21-bench150.mjs` 重放 + dbg-p22.mjs A/B）。

## 10. 待澄清事项

1. **bench 量级门的环境敏感**：家族负载窗（D-21）可致偶发越门——
   AC-03 已内置同窗重跑一次口径；仍越门 = needs_fix 归因（若 VM
   聚合循环量主导而非磁盘读——watch 批供料面记账，不硬调门）。
2. **page_tag_set 死码面**：T-01 后调用点清零，函数本体保留（单页
   语义面在册——docstring 消费者）；若复审裁定删码，随批修订
   §5.1/wsys.at（语义无涉——纯代码卫生裁量）。
3. **wanted_rows_of 同构嵌套扫描**（O(D×P×L̄)）：语料级小不动
   ——观测项记账（§4）；watch 批联动再议。
4. **试用反馈件首位序维持**：本批非反馈驱动（反馈缺席顺延）——
   用户真实试用反馈首现时仍按仪表盘定文首位立项（本批交付后仪表
   盘随 SD-2203 复位该序）。
5. **split 臂判绿外部依赖**：D-21 v25 家族窗延续（exe 时间戳
   debug 09-26 10:43 / release 09-25 17:58 复核口径）——unblock =
   家族 exe 稳定后双臂复跑（F-R17-1 留观合流，非本批阻断项）。
   **执行窗更新（2026-09-28）**：第六例实录——独立跑 ×2 同形败
   （boot FAIL+wiki 树行不现）+ pre-change 树（7ebe95c）A/B 零接触
   定谳（D-21 v26 扩记——物料形状新教训：archive 不含 ignored
   `deps/`，补拷后复现同款）；exe 时间戳已变更 debug 09-27 22:38
   （家族重建——本批全程新 exe 载体实跑，交付面健康实证）/release
   未变；serve-back 通道健康旁证（e2e + probe 族 split 臂同窗全绿）
   ——分段判绿维持。
6. **D-35② 复测执行窗条件或至**（§10.5 exe 变更实录衔接）：debug
   exe 已变更 09-27 22:38——bulkalias201 复测条件在字面上已至，但
   split 臂家族窗第六例未解（复测走 split 面）——双臂复跑仍待
   F-R17-1 合流；留观面板交接（README 仪表盘已随 SD-2203 续记），
   非本批范围。
7. **AC-03 孤页门越门归因**（needs_fix 归因入档——交复审裁处）：
   孤页清单入口 bench 口径 3412ms > 门 2.0s（在册 8078-8248ms——
   2.4× 改善但未达 ≥4× 底线）。**A/B 归因**（dbg-p22.mjs 同 exe 同
   语料交替三轮）：click→mode 2480→1560ms——本批定向面贡献 ≈
   −0.93s（orphan_rows_of 全扫成本清偿）；残余 2.5s = **非目标面**
   构成（LinksRefreshOf 双取 link_index 两次 GET ~0.6s + json.
   to_value 解析 + titles/backlink/outlink/wanted 派生族 +
   MentionsRefreshOf 串联 + 仪表固定 sleep ~0.7s——VM 循环量主导而
   非磁盘读）。**零成本反事实**：orphan_rows_of 归零后 bench 口径
   残余仍 ~2.5s > 2.0s——门在本批授权范围（非目标三条+观测项不动）
   内不可达，§5.3 残余预估（双取 0.6s）失准所致。**处置**：门文本
   不调（§10.1 口径「不硬调门」）；watch 批供料面记账（双取形消除/
   派生族单趟化/mentions 串联解耦——供料候选在册）；复审裁处门裁
   定与后续批次路由。同窗重跑落家族负载劣化窗（link_index 冷
   294→902ms 零接触面同证 ~3× 劣化）不作判据口径。
