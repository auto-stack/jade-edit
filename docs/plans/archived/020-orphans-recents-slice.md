---
plan_id: PLAN-020
status: archived
completion_kind: delivered
feature_name: orphans-recents-slice
author: [zhaopuming]
created_at: 2026-09-27T11:14:25+08:00
updated_at: 2026-09-27T18:05:00+08:00
plan_revision: 1
current_step: 4
total_steps: 4
supersedes_spec_components: []
new_spec_components:
  - "docs/ARCHITECTURE.md#SD-2001"
  - "docs/ARCHITECTURE.md#SD-2002"
  - "docs/README.md#SD-2003"
  - "docs/README.md#SD-2004"
touched_goals: []
---

# [PLAN-020] 知识库第十八切片——孤页清单 + 最近打开（知识健康与快速访问收割批）

## 0. 变更摘要

SD-301/SD-405 主线第十八片——**池外新晋双件**（池内可动件已尽：
大纲十一片门控 / 索引单趟 D-35 后移 / 其余量级触发或微件——§2.1
对表），两件均经典 wiki/Obsidian 特性、**纯 front 派生、零新契约、
零探针**（收割批口径——007/008 同判）：

1. **孤页清单（orphans）**——find 面板**第五模式**（Ctrl+Shift+O）：
  「零入链 + 零出链」的完全孤岛页清单（link_pages 派生——入度 =
  他档 resolved 出链命中数、出度 = 自身 links 数；双零即孤页）→
  行点击开档。**知识健康面**：图谱孤点的清单形态（图谱 vm 组件面
  门控的替代兑现——Obsidian 图谱高亮孤页同语义）；发现「写了没人
  链、也没链别人」的失落页。
2. **最近打开（recents）**——快开 files 模式**空查询行为升级**
  （Obsidian 快速切换器同款）：空 q 且有记录 → **「最近」清单**
  （会话域 App 态，头插去重容量 10，开档成功触点追踪）；有输入 →
  过滤全量（现状不变）；无记录空 q → 全量（现状不变——首跑断言
  零漂移）。**持久化不做**（v1 会话域——重启即失；持久层[back
  配置文件面]后续批 §10.3 留口）。

**已知答案修订面**（计划内）：005「空 q 全量 5 行」断言——开档后
空 q 显 recents 段（find 组断言更新，README 注记）。

上游缺口适配内置：D-20②④；D-24③；D-25①；D-26②；D-28②；D-30①；
D-31；D-33②（recents 段标题走 handler 派生——零 computed 串接）。

## 1. 目标

- **G1（孤页清单可用·双轨）**：Ctrl+Shift+O / 菜单「视图→孤页清单」
  → find·orphans 模式（无 input 清单——wanted/trash 同构）：孤页
  行（path 文本[dtitle 显示期覆盖]）→ 点击 OpenLink 开档；空态
  「（无孤页）」；**语料已知答案**：`Hello World.ad`（零出链——
  PLAN-003 在册「Project X 零真实出链」同类判定面；入链零——无档
  链它）= 孤页；`index.ad`（被链）非孤页。
- **G2（最近打开可用·双轨）**：开 3 档 → Ctrl+P 空 q → 「最近」
  段显 3 行（逆序：最近者首）→ 行点击开档（拾取即关——files 模式
  契约不变）；再开新档 → recents 头插更新；重复开档 → 去重置顶；
  有输入 → 全量过滤（现状回归）；容量 10 截断。
- **G3（测试面）**：find 组子步扩（两件均 find 域）——**组数不变
  16/15/十五段**；基线 **v18** 计划内重锁（App recent_paths +
  find_mode 第五值 + orphan_rows）。
- **非目标**（明确排除）：
  - **recents 持久化**（跨会话——back 配置/存档文件面属新持久层，
    v1 会话域；§10.3 留口）；
  - 孤页的**图谱可视化**（vm 组件面门控——清单是替代形态，图谱
    仍候选池）；
  - 孤页「半孤」变体（仅有出链/仅有入链的半连接页——v1 恒双零
    严格孤；宽口径 §10.4 留口）；
  - recents 段与全量并陈形态（v1 空查询替换式；并陈变体 §10.2）；
  - 清除 recents 操作（v1 无入口——会话域低值）；
  - 大纲（anchor-reveal 十一片门控）、索引单趟（D-35 后移）、
    Time front probe、NFKC、合并三择 r3、批量 restore、F-R19-1
    r3、checkbox 供料回执（池内顺延）、上游件实做与生成物补件
    （AC-05 负向证）。

## 2. 架构方案

### 2.1 选型依据（为什么第十八片是池外双件

- **候选池对表**（PLAN-019 §10.7 + ledger v23 实核）：大纲（十一
  片门控——上游 grep 0 维持）、索引单趟合并（D-35② 后移在册）、
  Time front probe（独立价值低）、NFKC（未触发）、url_decode/
  checkbox 供料回执（上游未动）、合并三择 r3 / 批量 restore
  （量级触发）/ F-R19-1 r3（low 微件）——**池内已无可立项主件**。
  北标口径（SD-405）长期 Obsidian 线两缺口可池外收割：①**知识健康
  面**——17 片交付了链接/标签/检索的组织能力，但「知识库健康度」
  仅有 wanted（悬空）一个切面；**孤页**是第二切面（图谱门控下的
  清单替代——lost-and-found 页发现）；②**快速访问润滑**——17 片
  功能后的高频路径打磨：快开空查询显示最近（Obsidian 快速切换器
  标准形态）。两件合计一个标准收割批（4 任务），**为真实试用期
  留出节奏**（§10.6 建议：本片后进入试用反馈驱动阶段）。
- **形态复用度**：orphans = find 模式机制第五值（wanted/trash 无
  input 形态直承）+ link_pages 纯派生（bl/ol 派生族第三/四实例）；
  recents = App 态 + 快开行集装配分支。**零新契约、零新 UI 形态、
  零探针**。

### 2.2 数据面（零 back 增量）

无新契约。两件全 front 派生：
- **orphans**：`orphan_rows_of(pages List) -> List`——双趟 while：
  出度表（page.links.len()）+ 入度表（他档 links 逐项 target_path
  == page.path 计数——**resolved 面**：悬空链接 target_path="" 不
  计入[卫语句面]）；双零 → 行 `{path}`（walk 序）。
- **recents**：App `recent_paths` List——OpenFile/OpenLink/CreateGo
  /MoveDir 后等开档触点头插（去重 + 容量 10 截断 while）。

### 2.3 消费面（front）

- **store**：find_mode 值域扩 "orphans"（第五值）。
- **App**：`recent_paths`/`orphan_rows`；actions `view.find-orphans`
  （shortcut **Ctrl+Shift+O**——O 族：Ctrl+O 在册、Shift+O 空闲）+
  menubar 视图项「孤页清单」；find 第五分支（无 input + 行集 +
  空态——wanted 同构）；快开 files 分支空 q 双态（recents 有 →
  「最近」段[标题行 + 行集——**行 label 走派生期拼接**，D-33②]；
  无 → 全量现状）；开档触点 recents 追踪（OpenFile/OpenLink/
  CreateGo/MoveDir/RenameGo 后路径更新——**重命名/移动后旧键清
  置新键头**——路径有效性口径注记）。
- **刷新**：orphan_rows 随 LinksRefreshOf 派生段顺产（link_pages
  变即重算——v5 触发集零扩）；recents 即时态零刷新。

### 2.4 键位/菜单面

Ctrl+Shift+O = 孤页清单（新键位唯一增量）；menubar 视图菜单「孤页
清单」（「悬空清单」后）。

## 3. 技术栈

不变：AutoUI `.at` 单源双轨 + 自有 Auto src/back + gate 双臂。无新
依赖、无新控件。

## 4. 需求分析与背景调查

### 4.1 授权记录

- 用户 2026-09-27 会话口述：「plan 19已经完成；下一个规划哪个
  计划？（[$auto-plan-new]）」——**立项授权**：019 已归档
  （f2d5a21——正常立项窗）。方向选择（池外孤页+recents 双件）=
  池尽实勘 + §2.1 依据；handoff 未否决即生效（PLAN-004..019 同款
  约定）。
- **快开空查询行为变更**（全量 → recents 替换式）为计划内已知答案
  修订（005 断言面）；用户要并陈形态 → §10.2 口。
- 仓库/动作范围：仅 jade-edit 主检出；冻结池与家族仓零接触
  （AC-05）。无预算/自动续跑/工具链版本指定。

### 4.2 接地证据（本仓实读，2026-09-27 @ main 32e5400/f2d5a21）

- **find 模式机制在册**：app.at:1209/:1211 files/text 分支 + wanted
  （:978/:1052 无 input 形态）+ trash（016 第四模式）——第五值
  扩展点干净；checked_if/menubar-checkbox 族（:976/:1051-1052）。
- **孤页语料已知答案**：`Hello World.ad`——出链零（PLAN-003 §4.2
  在册判定：「Hello World 出链 {CAP 定理:true, 首页:false}」——
  017 后 casefold 四级下仍解析两链？**实勘修正**：Hello World 出链
  非零（CAP 定理+首页）→ 非孤页；**真孤页候选 = 无链接页**——语料
  5 页出链面盘点：index（链 CAP 定理/Hello World?）/Tasks（链?）/
  Projects——T-01 首锁时按 link_index 实况定（**已知答案首锁面**，
  非预写）；测试内造纯孤页档（write_wiki 无链档）为主断言案。
- **recents 触点在册**：OpenFile/OpenLink（app.at 行重算触点族）/
  CreateGo/MoveDir/RenameGo——开档成功后路径面已显式传递（012/014
  口径），追踪挂点干净。
- **D-36①（019 定谳）**：dialog 内 checkbox 生成器双写缺陷——
  本批零弹层零 checkbox（池外双件全清单/行集形态——**结构性
  规避**）。
- **基线**：v17 现行（019）；**v18 变更面** = App recent_paths/
  orphan_rows + find_mode 第五值 + 快开空 q 分支。
- **上游实勘**（2026-09-27）：auto-lang 近线 = PLAN-043 apps.manifest
  /清理裁定——anchor-reveal grep 0（**十一片门控**维持）。

### 4.3 与既有计划的关系

- 复用 PLAN-003 链接派生面 + PLAN-004 find 模式机制 + PLAN-016
  trash 无 input 形态——收割批（007/008/009 同判）。
- 图谱候选池注记更新：孤页清单 = 图谱健康面的清单替代（图谱解锁
  后可视化仍为候选——两形态互补非互斥）。
- D-12（anchor-reveal）/D-35②（字符串池）/checkbox 三件/url_decode
  供料留观不变；F-R17-1 第四批随附（T-03 gate 载体）。
- PLAN-021 候选池（§10.7 更新）：大纲（anchor-reveal 解锁——首位
  顺延候）、索引单趟合并（D-35 收口后 + watch 联动）、recents
  持久化（试用反馈触发）、孤页宽口径（反馈触发）、Time front
  probe、NFKC、合并三择 r3、批量 restore、F-R19-1 r3、checkbox/
  url_decode 供料回执件。

## 5. 详细设计

### 5.1 front 派生与接线（SD-2001）

```
fn orphan_rows_of(pages List) List {
    // 双趟 while：出度表 + 入度表（resolved 面——target_path 非空
    // 命中计数；⚠ D-20② 局部拷）→ 双零页 → {path} 行（walk 序）
}

// recents：fn push_recent(paths List, path str) -> List
//   头插 + 去重 + 容量 10 截断（while）

// app.at：第五分支（无 input）；快开 files 空 q 双态；触点追踪五处
//   （OpenFile/OpenLink/CreateGo/MoveDirGo/RenameGo 成功后）
```

### 5.2 规范增量

| delta_id | add/modify/retire | target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2001 | modify | docs/ARCHITECTURE.md §5 检索与快速打开域语义段 | before：find 四模式（files/text/wanted/trash——SD-401/901/1601）；快开空 q = 全量。after：①**find 第五模式 orphans**——孤页定义（零入链[resolved 面] + 零出链——严格双零；悬空链接计入出链度[有链即非孤]）、link_pages 派生、随 LinksRefreshOf 顺产；②**快开 recents**——空 q 且有记录显「最近」段（替换式——会话域 App 态/头插去重/容量 10/开档触点追踪/重命名移动后旧键清置新键）；有输入过滤全量不变；无记录空 q 全量不变；**持久化不做**（会话域定文——持久层后续批）；③已知答案修订面注记（005 空 q 断言） | 知识健康第二切面（图谱门控清单替代）+ 高频路径打磨 | AC-01/02/06 |
| SD-2002 | modify | docs/ARCHITECTURE.md §6 | before：十五组检查 + 基线 v17。after：组数**不变**（两件入 find 组子步）+ **基线 v18**（App 双字段 + find_mode 第五值 + 快开分支；v17 留档） | 测试体系表更新 | AC-03 |
| SD-2003 | modify | docs/README.md Tests 节 | before：16+15+十五段、基线 v17。after：口径不变 + find 组子步扩与**空 q 断言修订**注记 + 基线 v18 指针 + N 定谳续记（F-R17-1 第四批随附实录） | 判绿口径单一权威面（…/1903 续） | AC-03 |
| SD-2004 | modify | docs/README.md「是什么/文档」节 | before：第十七切片=目录合并+trash。after：**第十八切片=孤页+最近打开**条目（知识健康注记 + 试用驱动阶段建议注记）+ ledger v24 指针 | 产品主线进度面派生同步（…/1904 续） | AC-06 |

## 6. 测试设计

- **vm 矩阵 find 组子步（T-03）**：①Ctrl+Shift+O → orphans 模式
  （无 input 快照）+ 孤页已知答案（**T-01 首锁**：语料实况 + 测试
  内造纯孤页档[write_wiki 无链档]主断言）②孤页行点击开档 ③空态
  （全连接语料态——造链后清孤）④recents 弧线（开 3 档 → Ctrl+P
  空 q → 「最近」段 3 行逆序 + 拾取即关）⑤去重置顶（重复开档）⑥
  有输入过滤回归（全量——现状）⑦容量截断（开 12 档 → 10 行）⑧
  **空 q 断言修订**（005 面更新实录——首跑无记录全量[零漂移] +
  开档后 recents 替换[计划内]）。
- **e2e（T-03）**：同弧线（真 DOM——两模式/空 q 双态）。
- **基线 v18（T-03）**：计划内重锁；连跑 ≥3 零漂移；v17 留档。
- **随批复测（T-03）**：F-R17-1 第四批载体（gate 单命令——家族
  稳定窗若至即闭）；D-35② 复测（bulkalias201——exe 变更窗观测）。
- **负向（T-04）**：probe 全族十二代回归；`.console` 零；契约面
  零变化（纯 front 批——**零 back diff 证**）；纪律 grep 族；冻结
  池/家族仓零接触；`gen/` 无手改；补件面零增量。

## 7. 验收标准

- **AC-01（孤页清单）**：模式/清单/已知答案（首锁面）/行点击/
  空态，vm+e2e 同断言域全绿；resolved 入度口径可证（悬空链接计入
  出链度案）。验证：T-01/T-03。
- **AC-02（最近打开）**：空 q 双态/逆序/去重/截断/拾取即关/有输入
  回归，双轨全绿；**空 q 断言修订面在案**（首跑零漂移 + 开档后
  替换）。验证：T-02/T-03。
- **AC-03（gate + 基线 v18）**：gate ALL GREEN（16/15/十五段口径
  不变）；基线 v18 零漂移（v17 留档）；N 定谳续记（F-R17-1 第四批
  实录）。
- **AC-04（负向证）**：**零 back diff**（纯 front 批——api.at/
  wsys.at 零变化证）；probe 全族十二代回归；其余纪律 grep 族全零；
  冻结池/家族仓零接触。
- **AC-05（文档面）**：SD-2001..2004 落位锚注齐；**孤页定义[严格
  双零+resolved 面]与 recents 会话域定文**入 SD-2001；parity-ledger
  **v24**（执行期实勘 + 随批复测实录）。

## 8. 执行步骤

- **T-01 孤页件**（AC-01）[x] 已完成
  - `orphan_rows_of` 派生 + find 第五模式 + action/menubar + 已知
    答案首锁（语料实况 + 造档）。
  - 验证：merged 冒烟（模式/清单/开档）+ `node tests/vm_matrix.mjs`
    find 组回归。
  - **[执行实录]** ca4874d（与 T-02 同提交——纯 front 双件一弧）：
    `orphan_rows_of` 双零派生（出度 links.len 悬空计入出链度/入度
    target_path 精确命中 resolved 面——悬空 "" 卫语句不计+自链排除
    j!=i SD-302 同语义）+ model orphan_rows + LinksRefreshOf 派生段
    顺产（触发集 v5 零扩）+ action view.find-orphans Ctrl+Shift+O
    [O 族避让实核]+menubar 视图项「孤页清单」（悬空清单后）+
    ActFindOrphans 入口即刷新 + find_panel 模式标签「孤页」+ view
    第五分支（无 input/行点击 OpenLink dtitle 覆盖/空态「（无孤页）」
    ）。**已知答案首锁**：pristine 语料 5 页全连接恒空态（Projects
    出链零但入链 2——双零恒空实勘）。验证：dbg 一次性件五面全弧绿
    （pristine 空态/纯孤页档入列[fs 造档 back walk 零树依赖]/行点击
    开档/造链清孤[保存→顺产重算行消]/悬空出链计入出链度[OrphanD 非
    孤]）。
- **T-02 recents 件**（AC-02）[x] 已完成
  - `recent_paths` + push_recent + 五触点追踪 + 快开空 q 双态 +
    005 断言面盘点修订。
  - 验证：merged 冒烟（开档 → 空 q recents → 拾取）+ `pnpm build`
    PASS。
  - **[执行实录]** ca4874d：model recent_paths（会话域持久化不做）+
    push_recent 头插去重置顶容量 10 截断（while 重建法 cap 预算）+
    recents_rekey 旧键置换（存在判定单趟+命中才重建——无关零扰动）+
    **触点七处**（OpenFile/OpenLink[CreateGo 经此]/NewGo/ActDaily
    push + RenameGo/MoveGo/RenDirGo/MoveDirExec rekey——§2.3 五触点
    扩为等开档触点全收口[「等开档触点」授权]；删除档留 recents 缺档
    容错 §10.4 定案）+ 快开 files 空 q 双态（视图直读 recent_paths
    ——「最近」段静态标题零 computed 串接 D-33②+str 清单 for 消费
    r.paths 同款形态；`if .find_q == ""` 模型字段条件+`!=` 互补分支
    ——tab 条双分支同款在册形态）。验证：dbg 一次性件 recents 四面
    绿（无记录空 q 全量 5 行[005 零漂移]/开档后「最近」段替换
    [head=Projects]/去重置顶/type_text 空串清 q 通道+多 tab 保存弧
    ）+ smoke 一次性件 7 PASS[保存钮 press 不派发 2 跑实录=v22/v23
    debug exe chrome 弧家族签名——同窗 dbg 同流程派发正常，环境面非
    产品败形]。
- **T-03 测试扩单 + 基线 v18 + gate + 随批复测**（AC-01/02/03）[x]
  已完成
  - find 组八子步 + e2e + v18 重锁 + gate（F-R17-1 第四批）+
    bulkalias 复测。
  - 验证：双臂全绿 + e2e 连跑 ≥5 + gate ALL GREEN。
  - **[执行实录]** bc7262d：vm 矩阵 ⑧⑨ 子步 + 空 q 断言修订（首跑
    无记录全量面=T-02 冒烟承载——arm 内 recent_paths 自 boot 累积
    六检查位无零记录窗）+ e2e 同弧线（⑧ 绝对空态置 check11 首步
    [10m goto 重载唯一零记录窗]+相对弧置 alias 后[反链关洁净位态]）
    + playwright 预算 90s→240s + 逐拾取三试重试 + 基线 v18 重锁。
    **验证实录**：merged 16/16 ALL GREEN ×3（锁前 15/15 ×2[执行期
    校正两件：逆序断言「收起」壳钮偏移/⑨ 终态 files 面板行集污染
    12 负向断言——测试面] + 锁后独立 16/16 + gate 内 16/16 含基线
    v18 PASS；popover 内容窗瞬态 1 例重跑即绿）+ e2e 5 连绿（1.2-1.3m
    ；位态校正五件实录全数测试面[12①b 激活回落/追加断言面 D-17
    门控/Orphan Pg 第 4 入链防漂移/今日笔记菜单 strict 冲突[⑥ 先例
    同判]/RecCap 循环超时]）+ build PASS（release 路由+
    SCHEMA_DRIFT_GENERATE_AT=1）+ **split 臂 3+1 跑稳定家族签名
    [boot FAIL+wiki 树行不现——D-21 v23 同形 exe 未变——分段判绿
    018 v22/019 v23 先例]** + **gate 单命令 F-R17-1 第四批=维持留观
    [merged 段过含基线 v18 PASS→split boot FAIL 短路 build 未达
    ——019 第三批同形]** + probe 全族 13 件 fresh（12 RESULT 全绿
    双臂+receipt 负结果一致 g①=0/g② len=0）+ D-35② 复测条件未至
    [exe 时间戳未变]。
- **T-04 文档 + ledger v24 + 收口**（AC-04/05）[x] 已完成
  - SD-2001..2004 落位；ledger v23→v24；负向证（零 back diff 主证）；
    §9 work 记录。
  - 验证：文档 diff 检视 + gate 复跑绿。
  - **[执行实录]** ARCHITECTURE SD-2001（§5 第十八切片四段：双零
    定义/resolved 面/recents 会话域定文+触点族/空 q 双态+已知答案
    修订面/直证面）+SD-2002（§6 heading+基线 v18 行+find 组 ⑧⑨ 扩
    注记）；README SD-2003（Tests heading+检查单 PLAN-020 续+find
    组 ⑧⑨ 段+N 定谳实录+基线条目 v18 化+运行矩阵注释 v18 化）+
    SD-2004（第十八切片条目+试用驱动阶段建议注记+ledger v24 指针）
    ；ledger v24（表头 bump+D-37 新行七项实勘+D-21 v24 扩记+D-35
    条件未至注记）；负向证七面（零 back diff[git diff f2d5a21..HEAD
    -- src/back/ 空]/.console 写面零违例 D-25①/split_once front 零
    新增 D-31①[2 处均在册注释]/gen·dist ignored 零手改/冻结池家族
    仓零接触/pick_port 维持/.runtime 一次性件居 ignored）。

依赖序：T-01 → T-02 → T-03 → T-04（线性；零探针零闸）。

## 9. 复审记录

- **2026-09-27 立项 handoff（auto-plan-new）**：
  - `stage: new`，PLAN-020，revision 1。
  - `outcome: pass`——可进 work（019 已归档 f2d5a21——正常立项窗）。
  - `next: work`（T-01 起；零探针零闸——收割批口径）。
  - 快开空查询行为变更（替换式 recents）为计划内修订面（§4.1——
    并陈变体 §10.2 口）。
- **2026-09-27 work 收口（auto-plan-work）**：
  - `stage: work` | PLAN-020 | revision 1 | `pass` | code_commit=
    ca4874d→bc7262d（+T-04 docs 本提交） | task_ids=T-01..T-04 全勾 |
  - evidence：merged 16/16 ALL GREEN ×3[含基线 v18 零漂移 gate 内
    PASS]+e2e 5 连绿[1.2-1.3m]+build PASS[release 路由]+probe 全族
    13 件 fresh[12 RESULT 绿+receipt 负结果一致]+dbg/smoke 一次性件
    全弧绿[.runtime 居 ignored]+负向证七面[零 back diff 主证]。
  - blockers：无（split 臂/gate 单命令 = 外部家族窗延续如实记[D-21
    v24——分段判绿 018 v22/019 v23 先例]，非本批验收缺失）。
  - next: review（execution_done；split fresh-green 与 F-R17-1 合流
    留观交接）。
- **2026-09-27 复审 r1（auto-plan-review）**：
  - `stage: review` | PLAN-020 | revision 1 | `pass` |
    reviewed_commit=98dd55e | base_commit=f2d5a21 |
    dependency_revisions=auto-lang debug 09-26 10:43(127419904B)+
    release 09-25 17:58(80600064B)——执行窗同值未变 | spec_inputs=
    ARCHITECTURE.md@98dd55e+README.md@98dd55e+parity-ledger.md v24。
  - **独立性声明**：同会话复审[实现会话自审]——verdict 全数自工件
    重建：fresh 重跑四件（build PASS[release 路由]/vm merged 16/16
    含基线 v18 零漂移/e2e 1 passed 1.2m/split boot FAIL 家族签名第
    五例）+ git 级负向实勘（零 back diff/文件清单 front·docs·tests
    九件/front 锚八处实勘）——执行器总结零依赖。probe 全族证据复用
    [明示理由：src/back f2d5a21..98dd55e 零 diff——probe 独占 back
    契约面，执行窗 13 件 fresh 含 receipt 负结果一致直接承载]。
  - **AC-01 pass**：vm ⑧ 六面 fresh[⑤ 无 input/纯孤页入列/行点击
    开档/造链清孤/悬空出链计入出链度 within merged 16/16]+e2e ⑧
    绝对空态[pristine 全连接]+相对弧 fresh passed；resolved 面可证
    [OrphanD 案]。
  - **AC-02 pass**：vm ⑨[「最近」段/逆序/拾取即关/去重置顶/容量
    RecCap×12→10]+e2e ⑨ 同弧 fresh；005 断言修订面在案[recentsRepl
    acedOk 累积位态+首跑无记录全量面=冒烟一次性件+e2e goto 重载零
    记录窗双载]。
  - **AC-03 pass（分段）**：merged 16/16+基线 v18 零漂移 fresh[本窗
    第 4 跑零漂移]；split = D-21 家族窗第五例[boot FAIL 同签名 exe
    未变——分段判绿 018 v22/019 v23 先例，非本批验收缺失]；F-R17-1
    第四批实录在册[merged 段过→split 短路]；N 定谳 README SD-2003
    实录在案。
  - **AC-04 pass**：零 back diff[git diff f2d5a21..98dd55e -- src/
    back/ 空——本窗重验]+全批文件清单九件[front/docs/tests 零 deps
    零契约]+.console 零写面+split_once 零新增[2 处均在册注释]+gen/
    dist 零手改+冻结池/家族仓零接触+pick_port 维持。
  - **AC-05 pass**：SD-2001@ARCH:945/SD-2002@ARCH:987/SD-2003@README:
    221/SD-2004@README:151+ledger 指针:538 锚注齐；canonical 定文与
    已证行为一致[触点族八处代码实勘=定文 4 push+4 rekey 族；空 q
    双态分支 1371-1383 实勘；LinksRefreshOf 顺产 2152 实勘]；ledger
    v24 37 行[D-37+D-21 v24+D-35 注记]；孤页定义[严格双零+resolved
    面]与 recents 会话域定文均在 SD-2001。
  - findings：F-R20-1 low 非阻塞=split 臂 fresh-green 持续未取得
    [外部家族窗第五例——exe 时间戳/字节数未变，判别链外部性：merged
    16/16+probe 双臂+e2e+build 全绿承载；unblock=家族 exe 稳定后
    node tests/vm_matrix.mjs 双臂复跑，与 F-R17-1 合流同载体]——
    环境留观非验收缺失，018 v22/019 v23 先例同判。
  - evidence：e2e/.runtime/rev-{build,merged,e2e,split}.log[fresh
    重跑四件——ignored .runtime]；本计划 §8/§9 在案实录；commits
    ca4874d→bc7262d→98dd55e 线性祖谱。
  - next: merge（status=reviewed；split 留观与 D-35② 随 merge 交接）。
- **2026-09-27 merge 收口（auto-plan-merge）——PLAN-020:r1**：
  - `stage: merge` | PLAN-020:r1 | `pass` | delivery_commit=98dd55e。
  - `prepared`=复审基线 r1[98dd55e——docs-only 后代核验：bc7262d 之上
    仅计划文档+ledger，src/deps/tests/e2e 零变化]+canonical delta 已随
    实现落 main[SD-2001@ARCH:945/SD-2002@ARCH:987/SD-2003@README:221+
    find 组段/SD-2004@README:151+ledger 指针:538——直接 main 线性约定
    001..019 在档惯例；jade-edit canonical 知识库=ARCHITECTURE+README
    非 docs/specs/——001..019 十九批在档 reviewed 先例]+ledger v24
    tracked 读回核验[37 行+D-37+D-21 v24+D-35 注记]。
  - `landed`=main tip==98dd55e+三提交线性祖谱 f2d5a21→ca4874d→
    bc7262d→98dd55e 实证[ancestor-OK]+known-good smoke=复审窗 fresh
    vm merged 16/16 ALL GREEN[含基线 v18 零漂移——98dd55e 树实跑]。
  - `ledger_refreshed`=docs/parity-ledger.md v23→v24@98dd55e[tracked
    读回：表头 v24（SD-2004 指针）+D-01..D-37 三十七行+D-37 新行七项
    实勘+D-21 v24+D-35 条件未至注记；无 live ledger 服务——PLAN-001
    同判 tracked 文件面]。
  - `archived`=git mv 等价[untracked 件 mv+add]→docs/plans/archived/
    020-orphans-recents-slice.md+status archived+completion_kind
    delivered。
  - `cleaned`=无 worktree/dev 分支[直接 main 约定 worktree 仅 main]
    +代码工作树零 WIP[归档提交后 git status 净]+泄漏 auto.exe 复核
    [本会话矩阵/e2e/probe 进程全数 taskkill 收口——家族会话进程
    22648 非本会话未触碰]+一次性件居 ignored .runtime[dbg-p20/
    smoke-p20/rev-*.log——非入库源]。
  - 留观交接：split fresh-green[D-21 v24 第五例——合流 F-R17-1]/
    D-35② bulkalias 复测[exe 变更窗挂起]/F-R19-1 r3 口/试用驱动阶段
    建议[§10.5——PLAN-021+ 反馈驱动]。

## 10. 待澄清事项

1. **快开空 q 形态**（已随 r1 定替换式，用户可改）：空 q 有记录 →
   recents 替换全量（Obsidian 快速切换器同款）；并陈（最近段 +
   全量段）变体 → r2 口。
2. **孤页宽口径**（默认严格双零）：仅有出链（死胡同页）/仅有入链
  （孤岛入口）半孤变体——试用反馈触发再议（模式内分段 or 筛选）。
3. **recents 持久化**（后续批）：会话域 v1——跨会话需 back 持久层
   （`.jade/` 配置面首开——D-14 族外新面，独立批裁决）。
4. **重命名/移动后 recents 键更新**（v1 定案）：旧路径清 + 新路径
   头插（有效性口径——recents 恒可开）；删除档留在 recents（点击
   开档失败面 = store.Open 缺档容错——T-02 冒烟确认现行为，异常
   则 §10 记账）。
5. **试用驱动阶段建议**（非本计划范围）：池内可立项件已尽——
   建议用户以真实工作区试用 jade-edit（JADE_WORKSPACE 指向真实
   wiki），以反馈驱动 PLAN-021+ 方向（试用反馈 > 池外推测）。
6. **PLAN-021 候选池**（本批后更新）：大纲（anchor-reveal 解锁
   ——首位顺延候）、索引单趟合并（D-35 收口后）、recents 持久化、
   孤页宽口径、Time front probe、NFKC、合并三择 r3、批量 restore、
   F-R19-1 r3、checkbox/url_decode 供料回执件、**试用反馈件**
   （新晋类目——首批反馈立案件）。
7. **执行期实勘七件**（T-04 归账）：①recent_paths str 清单 dump
   直出字符串（基线 v18 新观测面——D-37①）；②type_text 空串清 q
   通道定谳（矩阵清 q 口——D-37③）；③recents_rekey 旧键置换触点
   七处（§2.3 五触点扩为等开档触点全收口——OpenFile/OpenLink/
   NewGo/ActDaily push+四 rekey，「等开档触点」授权面）；④e2e strict
   冲突第六例（files 模式标签「文件」×菜单触发——⑥ 先例同判——
   D-37④）；⑤vue 切档重挂载键入门控位态耦合（untitled 关闭回落档
   随 tab 邻位漂移——显式激活复原口径——D-37⑤）；⑥e2e 容量循环
   逐拾取三试重试（负载窗家族瞬态——D-37⑥）；⑦e2e/.runtime/
   pre19-check 陈旧复审拷贝扫入（testDir 递归扫一次性环境件清场
   ——D-37⑦）。
8. **本批后留观交接**：split fresh-green[合流 F-R17-1——D-21 v24
   第四例]/D-35② bulkalias 复测[exe 变更窗挂起]/F-R19-1 r3 口/
   试用驱动阶段建议（§10.5——PLAN-021+ 反馈驱动）。
