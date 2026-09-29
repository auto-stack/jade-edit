---
plan_id: PLAN-024
status: archived
feature_name: mtime 键控缓存专项——watch 批免重 walk 本仓半（第二十二切片）
author: [agent]
created_at: 2026-09-29T00:00:00Z
updated_at: 2026-09-29T00:00:00Z
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components: []
touched_goals:
  - docs/README.md 计划仪表盘候选池②残余面（fs 监听半——mtime 键控
    缓存专项挂账，PLAN-023 §10.2「unlock = 专项立项」条目兑现）
  - docs/parity-ledger.md D-22 watch 批剩余面终账 + D-35② 驻留压力
    复核（P ≤ 200 稳定域口径随批实勘）
completion_kind: delivered
---

# PLAN-024：mtime 键控缓存专项——watch 批免重 walk 本仓半（第二十二切片）

## 0. 变更摘要

PLAN-023 归档后的首个立项批。**立项路由依据**：README 仪表盘候选①试用
反馈件因用户反馈缺席按定文不立项（docs/README.md:723-724——规划会话
中经询问无反馈给出）；候选②已交付，其残余面双取形消除（D-39）重推需
用户明示授权（023 §10.6 三选——r2 已裁①挂账降级，未再授权②③，不触
授权面不立项）；候选③上游回执件**视家族窗——窗口未开**（家族 exe 时
间戳 2026-09-29 实勘与 023 在册值一致：debug 09-28 15:02 / release
09-28 15:17，D-19/D-35② 复测与 F-R17-1 双臂复跑条件均未至）；候选④
微件池 020 §2.1 已判定「池内已无可立项主件」。**候选②残余面的另一件
——fs 监听半的本仓通道（mtime 键控跨调用缓存）是池内唯一「立项即解锁
」的可动主件**（023 §10.2 写明 unlock = 专项立项）。**探针先行的有界
调查批**（技能契约「bounded investigation + 决策工件」形态）：T-01
四面探针（fs.mtime 可调性/语义、模块级状态跨调用持久、驻留量压力 vs
D-35② P≤200 稳定域）产出 **go/no-go 判定表**——go 则 back 索引三面
读缓存落地（cached_read_text 共享口 + 写路径驱逐 + mtime 外部失效）
+ 零漂移双面门（冷态前后采 + 热态二刷等价）+ 热态量级门；no-go 则
关账定文（fs 监听半本仓不可达终账——监听半全量维持上游供料，负结果
在册先例 probe_receipt_d19 同判）。**纯 back 批（front/app.at 零 diff
——比 023 更窄的切片）**；契约零变化（api.at 零 diff）、冷态输出逐
字节零漂移、基线 v19 零重锁（零重锁第五例候选）。

## 1. 目标

1. **① 探针定谳（T-01——有界调查，决策工件）**：四面实录——
   **p1 可调性**：back 模块 `fs.mtime(path)` 直调（`fs.tree` 同族
   调用形——wsys.at:51/:391 在册先例；上游 stdlib.rs:504 rust_fn 宏
   自注册[非 File.copy 的 catalog-only 别名形态——D-24① 教训仍按纪律
   探针定谳，token 硬关键字面 mtime 不涉]）；**p2 语义**：epoch 秒
   粒度（stdlib.rs:508-511 `as_secs()` 一手源注记——探针直证）/失败
   与 1970 前返 -1 / 写后变更可见性 / **同秒写读边缘实录**（秒粒度下
   读→写→再读 mtime 未翻的陈旧窗——设计 §5.2 失效通道的依据面）；
   **p3 模块态**：wsys.at 现为零模块级 var 纯函数模块（grep 实勘），
   模块级可变 List 跨调用持久双臂定谳（merged 进程内直调 + serve-back
   同进程跨请求）+ 值完整性（缓存值 = 纯 str——D-20④ to_value 产物
   vmref 损坏形态结构性规避）；**p4 驻留压力**：150 页语料全文本驻留
   × 连续刷新 ≥10 轮零 D-35② 值损坏签名（HTTP 200 空串/整数/碎片）。
   决策工件 = go/no-go 判定表（023 §10.2 三风险逐项对表：①驻留压力
   ②粒度 ③零漂移纪律适配——预期带 + 实测值）。
2. **② back 读缓存落地（T-02——gated on ① go）**：`cached_read_
   text(rel)` 共享口（fs.mtime 键控：命中同 mtime 返缓存原文，未命中
   File.read_text + 存）换接索引三读面（links_json/search_json/
   page_tag_set——tags_json 经 page_tag_set 受益）；**失效三通道**：
   写路径驱逐（13 个 pub impl 写点逐档/前缀驱逐——自写同秒窗全覆盖）
   + mtime 外部写失效（外部编辑跨秒检测）+ 同秒边缘定文（外部写落于
   我读同秒内的窗 v1 接受注记）。缓存域 = 进程生命周期（重启冷启，
   不跨会话——.jade/ 持久层不扩，recents 专用不泛化先例）。
3. **③ 零漂移双面门（T-03）**：**冷态** = 前后采逐字节门（pre 树
   vs post 树三面 × 双语料——022/023 同款，无需运行时开关）；**热态**
   = 同树连刷两次第二次与第一次逐字节等价（缓存命中路径正确性直证
   ——023 无此面，本批新增的等价论证面）。
4. **④ 量级门（T-04）**：热态二刷 link_index **≤ 170ms**（@150 页
   ——冷态在册 281-304ms 的 ≈60%：省 P 次 read_text，walk fs.tree 与
   stat 面仍在）+ boot-ready **≤ 3.0s**（冷态全 miss 不退化——在册
   2455-2683ms 带 + 余量）+ dbg 孤页弧 **≤ 2.0s**（023 冻结门维持
   不回退）。越门出口预授权（§5.3）。

**非目标**：

- **fs 真监听**（watch 批监听半）：auto-lang 无 watch/notify 原语
  （023 一手源定谳维持）——监听半终账维持上游供料；本批 = 非监听半
  （mtime 键控缓存）的唯一本仓通道。
- **T-03 双取形重推**（D-39 挂账）：三选待用户裁处（023 §10.6——
  重推需②授权或③上游修复），本批不吞并；§5.3 设计文本随 023 归档
  在册不动。
- **read_wiki/编辑器读面换接**：编辑器打开页的新鲜度面零触及——
  v1 缓存域 = 索引三读面 only（read_body 公共壳不动；api.at read_
  wiki 语义面零变化）。
- **派生产物缓存**（links/tags/search 逐页结果缓存）：links 解析
   依赖跨页 stems/aliases 全表（extract_links_json 全表定 target），
   不可逐页独立失效——v1 恒原文态缓存（值域最小正确面）。
- **跨进程/跨重启持久缓存**：.jade/ 持久层「专用不泛化」纪律维持
  （PLAN-021 定文）——缓存进程生命周期即弃。
- **契约面零变化**：api.at 零 diff——不新增/不改契约（022/023 同款
  约束）。

**成功样**：探针判定表三风险逐项闭环（go 或 no-go 均为交付面——
负结果关账在册）；go 形态下 150 页工作区刷新弧热态量级兑现（保存/
面板/孤页入口全触点共享收益）、标准语料全部既有断言零漂移全绿、
三门过门（或越门归因裁定实录）；no-go 形态下 fs 监听半本仓不可达
关账定文落位（watch 批剩余面终账——残余 = 双取形 D-39 + 监听半
上游供料两件）。

## 2. 架构方案

**现状证据链**（@983cc0c main tip 一手勘定 2026-09-29 + auto-lang
家族仓一手源）：

- **三读面现行单读点**（023 落点——wsys.at 符号行号实勘）：
  `links_json`（:446——pass1 每页一次 `File.read_text` 单读两剖 +
  平行 bodies 表）；`search_json`（:508——单读两剖同款）；
  `page_tag_set`（:2527——单读两剖；`tags_json` :2567 pass1 每页
  恰调一次——022 在册）。`read_body`（:92-93）= `body_of(File.
  read_text(resolve(path)))` 薄壳（编辑器面公共口——本批不动）。
  `body_of`（:82）023 共享口先例。
- **fs.mtime 一手源**（auto-lang）：`shim_fs_mtime`
  （crates/auto-lang/src/vm/ffi/stdlib.rs:503-512）——`#[auto_
  macros::rust_fn("auto.fs.mtime")]` 宏自注册 + `fs::metadata
  ().modified().as_secs() as i64`（**epoch 秒粒度**）+ 失败/1970
  前返 **-1**；catalog 双在册（native_catalog.rs:1115 类型表
  `("auto.fs.mtime", 2997, Int)` + :2755 id 表）+ :581 注记
  （PLAN-016 T-05：mtime/len/is_dir 各走直连 native——metadata
  JSON 形态 VM 轨 None 级联 TypeError 在册，直连形态为 blessed 面）。
  调用形 = `fs.mtime(path)`（`fs.tree` 同族——wsys.at:51/:391
  在册调用形先例）。
- **写点清单**（驱逐触点盘点——wsys.at `File.write_text` 12 处
  实勘）：:188（write_body）/ :653（create_page）/ :767（move_
  file——move_page/create_dir 占位共用底座）/ :881（delete_page
  改道 .trash）/ :1042（trash_restore）/ :1158（move_page 组合
  迁移）/ :1256（delete_dir 逐文件改道）/ :1394（rename_dir 逐
  文件）/ :1649（daily_note）+ move_dir 合并域逐文件（:1463 fn
  内）+ page_meta 写面（经 write_body 语义——T-02 实勘接线面全
  盘点）+ linkify_page_impl（:1761——若经 write_body 则随其驱逐）。
  `.jade/recent_paths` 写面（api.at recent_paths_set）非 wiki 页
  域——缓存键域不涉，零驱逐需求。
- **wsys.at 零模块级 var**（`^var` grep 零命中——纯函数模块实勘）：
  缓存 = back 首例模块级可变态 → p3 探针面立项依据。
- **纪律/风险在册**：D-24①（catalog 在册 ≠ 可调——File.copy 解析
  层拒绝教训）；D-20④（store 上下文 to_value 顶层 map 产物入态 =
  裸 vmref 损坏——缓存值恒纯 str 规避 + 容器用模块级平行 List 而
  非 map 值域[App 模型顶层数组健康先例=Init ft_nodes]）；D-34①
  （`.length` = 字符数非字节——缓存实现零字节算术，键恒 str 等值
  比较）；D-35②（VM 字符串池 419/510 族值损坏——**P ≤ 200 稳定
  域**：驻留预算约束 + p4 压力面）；D-33⑥/pick_port（探针端口
  自动避让在册）。
- **量级在册**（023 执行/复审窗）：link_index 281-282ms / tags
  229-235ms / search 48-54ms @150 页；boot-ready 2455-2683ms；
  dbg 孤页弧 742-891ms（≤2.0s 门在册过门态）。

**改法**（纯 back 内部读面换接 + 失效接线——接口/输出/契约三零
变化，022/023 同款纪律）：

1. **`cached_read_text(rel)` 共享口**（wsys.at）：`full =
   resolve(rel)` → `t9 = fs.mtime(full)` → 平行三表（rels/mtimes/
   texts 模块级 List）线性扫 rel：命中且 mtime 等 → 返回 texts[j]；
   否则 `text = File.read_text(full)` + 三表写（追加或原位更新）。
   三读面换接 = 各自的 `File.read_text(resolve(...))` 单点替换为
   `cached_read_text(...)`（links_json/search_json/page_tag_set
   三处——read_body 公共壳与 read_wiki 面不动）。**冷态等价论证**：
   首调用（全 miss）= 现行逐页 File.read_text 同字节同序——输出
   逐字节零漂移（前后采门承载）；**热态等价论证**：命中返回 =
   上次读得同字节（纯 str 驻留无转换）——二刷等价门承载。
2. **失效通道**：`cache_evict(rel)`（线性扫清该 rel 行——P ≤ 200
   域线性可受）/ `cache_evict_under(dir_rel)`（前缀驱逐——目录族
   写点用）。写点接线：单页写点（write_body/create_page/
   trash_restore/daily_note/linkify/page_meta）= evict(目标 rel)
   [源位+靶位双驱逐——改名/移动/改道族]；目录族（delete_dir/
   rename_dir/move_dir）= evict_under(目录前缀) + 源根行。**同秒
   边缘**：自写面 = 写路径驱逐全覆盖（写后同秒刷新不依赖 mtime 翻
   转——e2e 保存点弧即驱逐回归门）；外部写面 = mtime 跨秒检测
   （外部编辑同秒窗[我读 t 秒内→外部写→再读 mtime 未翻]v1 接受
   注记——粒度上游 as_secs 一手源，unlock = 上游亚秒粒度供料）。
3. **容器形态**：模块级平行 List 三表（rels List[str]/mtimes
   List[int]/texts List[str]）——D-20④ map 值域 vmref 风险规避
   （纯 str/int 值域 + 平行表 = ft_nodes/bodies 在册健康形态族）；
   p3 双臂定谳跨调用持久性与值完整性。

## 3. 技术栈

- **back**：Auto（VM 解释——merged 进程内直调 + split serve-back
  `auto run --server vm -B` 双臂同面；wsys.at 单文件）。
- **front**：零触及（app.at/api.at 无 diff——纯 back 批）。
- **探针**：tests/probe_mtime.mjs（新增入库源——p1/p2 契约语义面
  双臂，probe 族形态：merged 直调 + serve-back GET/POST + pick_port
  端口避让）；p3/p4 压力面 = e2e/.runtime 一次性件（ignored 家族
  口径——值内嵌 §8/§9 可追溯，probe_receipt_d19 负结果先例同判）。
- **验证链**：前后采逐字节门（p23-links-sample.mjs 口径复用 +
  热态二刷面扩）+ tests/vm_matrix.mjs（基线 v19）+ playwright
  e2e + vue build（release 路由）+ bench150（四点 + 热态点）+
  dbg 孤页弧（dbg-p22 口径）。
- **基线**：structure-v19 零重锁（缓存零 state 外溢——.links_json
  原文态原样，零重锁第五例候选：017/022/023 先例续）。

## 4. 需求分析与背景调查

**授权记录**（技能纪律：不发明授权/预算）：

- 本次授权 = 用户 `/auto-plan:new` 调用（「计划023已经完成；下一
  个计划如何规划」）——**起草权 only**，本技能不实施（handoff 至
  auto-plan-work）。
- **主题选择**：规划期四选询问（试用反馈件/mtime 专项/微件池合批/
  T-03 授权重推）未获答复 → 按仪表盘首位序 + 实勘核验自主择定，
  排除依据四项在册：①试用反馈件反馈缺席（定文不立项——README
  :723-724）；②T-03 重推需明示授权（023 §10.6 三选 r2 已裁①挂账
  降级，②e2e 基建授权修/③上游修复均未给出——不触授权面）；③上游
  回执件家族窗未开（exe 时间戳 2026-09-29 实勘未变：debug 09-28
  15:02 / release 09-28 15:17）；④微件池无主件（020 §2.1 判定
  「池内已无可立项主件」）。择定 = 候选②残余面 mtime 键控缓存专项
  （023 §10.2「unlock = 专项立项」——立项动作即解锁动作）。用户
  改向出口见 §10.1。
- 无用户预算/自动续跑限制给到——不发明（分步验证惯例随 work 技能）。
- **base**：main @983cc0c（工作树 clean——wsys.at 行号实勘载体）。
- **Specs 状态**：本仓无 docs/specs/（023 §9 spec_inputs 同款声明
  ——canonical = docs/ARCHITECTURE.md + docs/README.md +
  docs/parity-ledger.md@v27；本批 delta 见 §5 规范增量表）。

**背景引证**：

1. 挂账定文：archived/023 §10.2（mtime 键控跨调用缓存挂账——三
   风险①驻留量 vs D-35② ②粒度未知 ③违零漂移纪律需专项设计）；
   §0/§1（fs 监听半上游供料维持 + auto.fs.mtime 2997 在册注记）。
2. ledger v27：D-22 处置列（watch 批剩余面注记——③双取形 D-39
   ④fs 监听半维持上游供料）；D-35②（P ≤ 200 稳定域 + exe 时间戳
   实录窗）；D-24①/D-20④/D-34①（纪律面——§2 证据链已引）。
3. README :721-739（候选池现势——②残余面/③上游回执/④微件池）；
   :741-744（留观面板 F-R17-1/D-35②）。
4. 上游一手源：auto-lang stdlib.rs:503-512 + native_catalog.rs
   :581/:1115/:2755（§2 证据链全引）。
5. wsys.at 符号：body_of :82 / read_body :92 / write_body :137 /
   links_json :446 / search_json :508 / move_file :763 /
   create_page_impl :644 / trash_restore_impl :1006 / page_tag_set
   :2527 / tags_json :2567 / move_dir_impl :1463（@983cc0c 实勘
   ——执行期行号随树复核）。

## 5. 详细设计

### 5.1 探针定谳（T-01——四面与判定表）

- **p1 可调性**（probe_mtime.mjs 案 a）：back 侧新增临时 pub 探针
  契约或直接 .at 冒烟工程调 `fs.mtime(resolve(rel))`——merged 直调
  + serve-back 双臂返回值对读；**期望**：epoch 秒 int 返回（parse
  层拒绝则 no-go 首条件——D-24① 同判面实录）。
- **p2 语义**（案 b-f）：既有档 mtime > 0；缺失档 = -1；写后
  （File.write_text 换内容）mtime 翻转可见；**同秒边缘**：读 t0 →
  同秒内写 → 再读 mtime 未翻（秒粒度直证——失效通道设计依据）；
  CJK 路径双臂（D-19 面：serve-back GET query CJK 败在册——探针
  用 POST body 形或 merged 域承载）。
- **p3 模块态**（一次性件）：wsys.at 临时模块级 List + pub fn 跨
  调用读写——merged 两次调用持久 + serve-back 两次 HTTP 请求持久
  （同进程前提一手源核验：serve-back 单 VM 实例服务请求面）；值
  完整性 = 长 str 往返逐字节（D-35② 家族签名监测）。
- **p4 驻留压力**（一次性件）：150 页语料（p21-ws150 物料重建——
  bench 惯例）全文本入缓存 + 连续 link_index × ≥10 轮——输出零
  值损坏签名（HTTP 200 空串/整数/碎片——D-35② 形态学）+ 驻留量
  实录（文本总量 MB 级注记——P ≤ 200 稳定域复核口径）。
- **判定表**：三风险 × 预期带 × 实测 × 裁定（go = 四面全过；no-go
   = 任一结构性败形——关账支路 §8）。**门数值校准**：p4 后热态门
  （§5.3）按实测带复核——校准属 §9 记录面不静默。

### 5.2 缓存落地（T-02——gated on go）

- **共享口**（§2 改法 1 全文——三读面单点换接，read_body/read_
  wiki 零触及）；**容器** = 模块级平行三表（D-20④ 规避形态）。
- **失效接线**（§2 改法 2 全文）：单页写点 evict(源)+evict(靶)；
  目录族 evict_under；page_meta/linkify 经 write_body 面实勘定
  （T-02 步内 grep 全盘点 `File.write_text` 12 处 + impl 返回
  路径——遗漏面零容忍，负向证 §6 承载）。
- **缓存域边界**：rel 键域 = 工作区 .ad 页（collect_ad_pages 域
  一致）；`.jade/` 与 .trash 域不入缓存（trash 改道写点仍驱逐
  源行——卫生态）。**进程生命周期**：无显式清理（重启即弃）；
  容量上界 = P ≤ 200 稳定域（StatusBar 防线在册——超域形态非
  缓存责任面，p4 注记）。
- **同秒边缘定文**：自写 = 驱逐全覆盖（零陈旧承诺）；外部写 =
  跨秒检测 + 同秒窗 v1 接受（canonical 注记落 SD-2401——unlock
  = 上游亚秒粒度[fs.metadata 亚秒形或 fs.mtime_ms 供料候选]）。

### 5.3 量级预估与门（AC-03 口径）

- **预估带**（150 页语料）：热态二刷 link_index **~40-120ms**
  （省 150 次 read_text ≈ 冷态 281ms 的读面大头；walk fs.tree +
  150 次 fs.mtime stat 保留）；boot-ready 冷态 2.4-2.7s 带内
  （全 miss 直读 = 现行形态）；dbg 孤页弧 ≤1.0s（热态弧优于在册
  742-891ms 冷态带）。
- **门**：热态二刷 link_index **≤ 170ms**（冷态在册 ≈60%——
  p4 实测后按带校准，§5.1 判定表条款）+ boot-ready **≤ 3.0s** +
  dbg 孤页弧 **≤ 2.0s**（023 冻结门数值面不回退）。
- **越门出口（预授权——022 §10.1/023 §5.4 同款续）**：同窗重跑
  一次（D-21 家族负载窗口径）；仍越门 → dbg 分量计时归因（walk/
  stat/read 三段分账）如实记交复审裁处——不硬调门。
- **A/B 归因口径**：pre-change 树（983cc0c git-archive + deps 补
  拷——022/023 物料形状教训 D-37⑦）vs 本批树同 exe 同语料交替
  ≥3 轮（热态二刷分量对比直证——022 T-04 惯例）。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-2401 | modify | docs/ARCHITECTURE.md §5（后端） | before：§5 第二十一切片段（SD-2301）mtime 键控缓存挂账注记（三风险未勘 + unlock = 专项立项）+ fs 监听半上游供料注记。after：§5 第二十二切片段——mtime 键控跨调用缓存定文：cached_read_text 共享口（fs.mtime epoch 秒键控——一手源粒度注记）+ 失效三通道（写路径驱逐[单页/前缀双形]/mtime 外部失效/同秒边缘定文[自写全覆盖 + 外部同秒窗 v1 接受——unlock 上游亚秒粒度]）+ 零漂移双面门（冷态前后采 + 热态二刷等价）+ 驻留量预算与 D-35② P≤200 稳定域压力实录 + 容器平行三表形态（D-20④ 规避）；**no-go 支路形态**：fs 监听半本仓不可达关账定文（监听半全量维持上游供料终账——残余 = 双取形 D-39 + 监听半两件） | 023 §10.2 挂账 unlock 兑现（专项立项）；watch 批非监听半收官 | AC-01/02/03 |
| SD-2402 | modify | docs/ARCHITECTURE.md §6 + docs/README.md Tests heading | before：§6 SD-2302 续零扩单注记（第二十一切片——纯内部性能片第三例）。after：第二十二切片注记——纯 back 批面：probe_mtime 新增（契约语义双臂——probe 族 +1 件）+ 前后采门热态二刷面扩 + 基线 v19 零漂移续（零重锁第五例候选）；矩阵/e2e 断言域零扩（既有保存点弧内建承载写路径驱逐回归——同秒窗覆盖注记） | §6 heading 惯例随批扩（SD-2202/2302 先例续） | AC-02/04 |
| SD-2403 | modify | docs/README.md（是什么 + Tests N 定谳 + 计划仪表盘） | before：是什么第二十一切片条目 + 仪表盘②残余面注记（双取形 D-39 + fs 监听半 mtime 专项挂账）+ 留观面板。after：是什么第二十二切片条目（mtime 键控缓存批——探针判定表/热态门实录值/no-go 关账形态）+ Tests N 定谳 024 实录 + 仪表盘②残余面收窄（fs 监听半本仓半出池——go 形态兑现注记 or no-go 终账；残余 = 双取形 D-39 + 监听半上游供料）+ 留观面板续记 | 知识库三件形惯例（019..023 先例续） | AC-03/06 |
| SD-2404 | modify | docs/parity-ledger.md | before：v27——D-22 处置列 watch 批剩余面注记（③双取形挂账 D-39 + ④fs 监听半维持上游供料）+ D-35② P≤200 口径 + D-24① 教训。after：v27→v28——D-22 处置更新（mtime 键控半兑现[go]/关账[no-go]终账 + 监听半终账注记）+ D-35② 处置更新（驻留压力实测——P≤200 口径复核或精化 + exe 时间戳随批实录）+ 探针新观测入册（fs.mtime 可调性/模块态健康——如有双轨差异面则新行在册，无则归档级注记）+ D-21 v28 扩记（执行窗实录惯例） | 衍生账随批刷新惯例（SD-2104/2204/2304 同款） | AC-06 |

## 6. 测试设计

- **前后采逐字节门 + 热态二刷面（AC-02 主证）**：一次性件
  `e2e/.runtime/p24-links-sample.mjs`（023 p23 口径复用）：三面
  （links/tags/search）× 双语料（标准 wiki-demo + p21-ws150）
  pre 树冷态采 vs post 树冷态采 cmp 逐字节全等（sha256 九件）
  + **post 树热态二刷**：同进程连刷两次，第二次三面输出与第一次
  逐字节等值（命中路径直证——023 无此面，本批新增）。
- **写路径驱逐回归 = 既有弧内建承载**：e2e 保存点弧（ActSave →
  LinksRefreshOf 同秒窗）+ vm_matrix fs 造档弧（10m/⑩ 族）——
  写后刷新断言新内容即驱逐正确性回归（**无新增专项弧**——同秒窗
  天然覆盖，§5.2 定文依据）；负向盘点 = T-02 写点接线 grep 全量
  复核（12 处 File.write_text + impl 路径）。
- **probe 族**：全族 14 件 fresh 重跑（双臂——含 probe_receipt_d19
  负结果在册一致）+ **probe_mtime.mjs 新增**（p1/p2 案 a-f 双臂
  ——merged 直调 + serve-back POST[端口 pick_port]）。
- **矩阵**：vm_matrix merged 16/16（基线 v19 零漂移——缓存零
  state 外溢）+ split 15/15（家族窗续则分段判绿 018..023 先例 +
  判别链 git-archive pre 树 A/B 惯例）。
- **e2e + build**：十五段全绿 + vue build（release 路由——家族
  debug exe 语境路由惯例随窗）。
- **量级**：bench150 四点（boot-ready/link/tags/search）+ 热态
  二刷点新增 + dbg 孤页弧（dbg-p22 口径——023 冻结门维持）。
- **负向证七面**：api.at diff 0 行 / `.console` 写面 grep 0
  （D-25① 纪律） / 基线·冻结池零触碰 / gen·dist ignored 零手改 /
  家族仓零接触（A/B 物料仓外即用即删——D-37⑦） / 一次性件居
  ignored .runtime / 缓存调试口零外泄（pub 契约面零新增——cached_
  read_text 为内部 fn 非 pub api）。

## 7. 验收标准

- **AC-01 探针定谳工件**：四面实录落 §8（fs.mtime 可调性 + epoch
  秒语义[>0/-1/写后翻转/同秒边缘] + 模块态双臂持久与值完整 + 150
  页驻留 ≥10 轮零值损坏签名）+ go/no-go 判定表与 023 §10.2 三风险
  逐项对表。验证：probe_mtime.mjs RESULT 绿（双臂）+ 压力件日志值
  内嵌 §8/§9（.runtime 一次性件口径）。
- **AC-02 数据面零漂移**：前后采三面 × 双语料 sha256 全等（pre
  983cc0c 树 vs post 树）+ 热态二刷等价 + probe 全族 14 件 fresh +
  api.at 零 diff + 基线 v19 零重锁。验证：cmp/sha256 值内嵌 §8；
  `git diff 983cc0c -- src/back/api.at` 0 行；矩阵基线行 PASS。
  **（no-go 支路：以关账定文 + 负向证承载——判定表 §8 在案，本
  AC 数据面门不适用注记，非静默移除。）**
- **AC-03 量级门**：热态二刷 link_index ≤ 170ms @150 页 + boot-
  ready ≤ 3.0s + dbg 孤页弧 ≤ 2.0s（三门全过；或越门归因实录
  [§5.3 预授权出口——重跑/分账/交复审裁处]）。验证：bench150 +
  dbg 计时值内嵌 §8。**（no-go 支路同 AC-02 注记。）**
- **AC-04 判绿矩阵**：merged 16/16 + split 15/15（或家族窗分段
  判绿先例实录——pre 树 A/B 判别链随档）+ e2e 十五段全绿 + build
  ✓built（release 路由）。验证：矩阵/e2e/build 日志文件 + exe 时
  间戳实录（D-35② 留观面板随批续记）。
- **AC-05 负向证全零**：§6 七面 grep/状态面全零违例。验证：各面
  命令输出内嵌 §8。
- **AC-06 文档四面锚位与一致性**：SD-2401..2404 落位（ARCH §5 第
  二十二切片段 + §6/README Tests heading + README 是什么/N 定谳/
  仪表盘 + ledger v27→v28）+ 仪表盘②残余面收窄文本与实际交付面
  一致（go/no-go 形态分岔文本对应）。验证：锚位 grep 读回 [1]-[N]
  全现 + delta after 文本与落地文本一致性核验。

## 8. 执行步骤

- **T-01 探针定谳（有界调查——决策工件）**：probe_mtime.mjs 入库
  （p1/p2 双臂）+ .runtime 一次性件（p3 模块态/p4 驻留压力）→
  go/no-go 判定表内嵌本节 + §5.3 门数值按 p4 带校准（校准记 §9）。
  依赖：无。AC-01。
- **T-02 back 缓存落地（gated on T-01 go）**：wsys.at——cached_
  read_text 共享口 + 三读面单点换接 + cache_evict/evict_under 双
  助手 + 写点全量接线（12 处 File.write_text + impl 路径 grep 全
  盘点复核）。AC-02（数据面前置面）。**no-go 支路**：本任务置换
  为关账面预备（SD-2401 关账定文草拟——docs-only）。
- **T-03 零漂移门 + 判绿矩阵（dep T-02）**：前后采 + 热态二刷 +
  probe 全族 + api.at diff + 基线 v19 + merged/split 矩阵 + e2e +
  build。AC-02/04/05。
- **T-04 量级门（dep T-03）**：bench150（四点 + 热态点）+ boot-
  ready + dbg 孤页弧 + A/B 归因（pre 树物料 git-archive + deps
  补拷）。AC-03。
- **T-05 文档落位（dep 全）**：SD-2401..2404 四件 + 仪表盘 + 留观
  面板续记（exe 时间戳/D-21 v28 扩记）+ §9 work 记录 + 负向证
  grep 族内嵌。AC-06。

执行期行号复核约定：§2/§4 符号行号 @983cc0c 勘定——work 期随树
复核（docs-only 后代漂移面零预期）。

### 8.1 执行实录（2026-09-29，@983cc0c 落点树——判定表裁定 no-go，全批走 no-go 支路）

- **[x] T-01 探针定谳 [✅ 已完成]**——四面全实录，判定表如下。

  **probe_mtime.mjs（入库源，p1/p2 双臂）RESULT 绿**：merged 直调 +
  split serve 形（探针工程 api 桥接路由 POST 通道）五案全过——
  a p1 可调性：存在档 mtime=1789452217（epoch 秒，双臂全等）；
  c 缺失档 = -1（双臂全等）；f CJK rel（wiki/CAP 定理.ad）mtime
  双臂全等（split POST body 通道——D-19 免疫面）；d 写后跨秒翻转
  m_vis > m_before 双臂；e 同秒写读边缘 **same-sec-yes 双臂**（读
  →写→再读 mtime 未翻——秒粒度陈旧窗直证，失效通道设计依据面；
  一手源 stdlib.rs as_secs 与行为一致）。运行实录：仓根
  `node tests/probe_mtime.mjs` 首跑即绿（探针工程
  e2e/.runtime/probe-mtime 生成件——src/back 副本 + 桥接 fn 追加，
  非入库源）。

  **p3 模块态（一次性件 e2e/.runtime/p24-cache-proto.mjs）绿**：
  模块级可变平行三表（`var ck_rels/ck_mtimes/ck_texts List`）解析
  + boot + 跨调用持久直证——merged 进程内：174000 字符长串
  （3000 单元 CJK/ASCII 混排）in-back 逐字节 eq、驱逐（重建三表+
  模块级 var 重赋值）后 stats=0、双键重入 c2=1/c3=2；split serve
  形跨 HTTP 请求：put→get 逐字节全等（174000 chars ==
  unit.repeat(3000)）→二次 get 逐字节稳定→驱逐后 stats=0→双键
  持久——**模块级 var List + 重赋值 = 本仓首例可变模块态在役形态
  定谳（D-20④ 平行表规避形态健康直证）**。

  **p4 驻留压力（同件）绿**：150 页语料（p21-ws150 同参重建
  p24-ws150）全文本驻留 152 行 + **串行 link_index ×10 轮逐字节
  等值**（26458 B/轮）+ tags ×3/search ×2 等值 + merged 进程内
  ×3 轮等值——D-35② 值损坏签名（空串/整数/碎片）**全零**；
  驻留量实录 = 语料全文本 ~9.3K 字符（150 页短页语料）——P≤200
  稳定域内驻留压力实测健康（D-35② 口径复核供料）。

  **判定表（023 §10.2 三风险 + 收益面逐项对表）**：

  | # | 面 | 预期带 | 实测 | 裁定 |
  | --- | --- | --- | --- | --- |
  | ① | 驻留压力（D-35② P≤200 域） | 全文本驻留零值损坏 | 152 行驻留 + ≥10 串行轮/进程内 ×3 轮逐字节等值 + 174K 长串完整——损坏签名全零 | 过 |
  | ② | 粒度（同秒边缘） | epoch 秒（一手源） | same-sec-yes 双臂 + 缺失 -1 + 跨秒翻转可见 | 过（同秒窗确认——写路径驱逐通道按设计必要） |
  | ③ | 零漂移纪律适配 | 冷态逐字节零漂移 | 跨进程对拍 cached ≡ 未补丁仓源逐字节全等 + 轮间恒等 | 过 |
  | ④ | **收益面（量级前提）** | 热态二刷 ≤170ms（省 P 次 read_text ≈ 读面大头） | **read×150 ≈ 11ms（全弧 4%）——主导面 = 跨页解析/提取/装配 ≈243ms（90%）非逐页可缓存；原型热态 361-389ms ≥ 未缓存 271-278ms（mtime stat+查表扫描开销 > 读省）** | **no-go（结构性败形）** |

  **分量分账（dbg-p24b.mjs @150 页，VM 侧 back 计时 ms）**：
  walk（collect_ad_pages）16-18 / read×150 **11** / body_of(read×150)
  12 / mtime×150 8-9 / lookup×150 热态（含 mtime）103-113[扫描
  ~95-105——O(P) VM 解释线性扫/页] / full 未缓存 271-278 / full
  原型热态 361-389（HTTP 面）/ 388（进程内）。**门校准结论
  （§5.3 ≤170ms 条款）**：免重读收益理论上限 = read 占比 11ms，
  门需省 101ms——**结构性不可达**（即使查表零开销，热态下限 ≈
  260-270ms）；主导成本（walk+跨页 stem/alias 四级解析+提取+装配
  ≈90%）非本缓存设计可达面（派生产物缓存 = 计划非目标 v1——
  links 解析跨页依赖）。**裁定 = no-go（收益面否定）**：通道可达
  （p1）、语义明（p2）、容器安全（p3）、零漂移可保（③），但
  经济性实测否定——落地即净回归（三读面热态 +90-110ms/次）。

  **附：执行窗新观测（一次性件隔离实录，D-40 立案供料）**：VM
  单调用长执行约束——dbg_time（10×300ms 纯时长环）1.47s 返回体
  破坏形（期望 "t,t,…" 实得 "114797" 整数态）；p4_rounds n=8/10
  （2.9s 单调用）HTTP 体 "0"、merged Init handler 静默中止
  （rounds/arc/done 恒空——120s 无措）；n=5（1.83s）内绿；**同逻辑
  串行 10 次独立调用全绿稳定**（361-384ms/次）。形态 = 单 VM 调用
  越界（疑每调用指令/时长预算域 ~2-3s）→ 中途弃断/破坏返回——
  生产形态（每次刷新 = 一次调用 ≤0.4s）零涉；探针/基准件设计纪律
  供料（长循环拆串行调用）。机制一手源未勘（unlock = 上游专项）。

- **[x] T-02（no-go 支路置换）[✅ 已完成]**——判定表裁定 no-go
  → 关账定文草拟落位：本仓非监听半通道（mtime 键控读缓存）经济
  性关账——通道可达/语义明/容器安全/零漂移可保（四面实测在案，
  原型件 .runtime 即用即弃），收益面结构性否定（④），**watch 批
  剩余面终账维持**：残余 = 双取形 D-39 + 监听半上游供料两件（与
  计划 §1 no-go 成功样形态一致——终账依据由「风险未勘」升级为
  「实测否定」，证据强度升级）。SD-2401 关账定文随 T-05 落 ARCH
  §5 第二十二切片段。repo src/**零 diff**（缓存实现不落地——
  `git diff 983cc0c -- src/` 0 行直证）。
- **[x] T-03（no-go 支路口径）[✅ 已完成]**——AC-02/AC-03 no-go
  支路注记兑现（数据面门不适用——非静默移除，判定表 §8.1 在案）；
  可判绿面全量照跑：**probe 全族 15 件 fresh**（14 件 RESULT 全绿
  双臂 + probe_mtime 新件双臂五案绿 + probe_receipt_d19 负结果
  D-19 在册一致）+ api.at 零 diff 0 行 + 负向证七面全零（§8.2）
  + **判绿窗实录**：merged 矩阵 16/16 ALL GREEN（p24-matrix-merged
  .log——基线 v19 零漂移 PASS，零重锁第五例）+ split 矩阵 = 外部
  家族窗第八例（p24-matrix-split.log——[1 boot] FAIL+wiki 树行不
  现 v23..v27 逐字同形；分段判绿先例承载 D-21 v28：判别链最强形
  = 本批 src 零 diff@983cc0c[受审树即 023 归档窗 known-good smoke
  树本身——零改动树强于 git-archive A/B 零接触证]+ merged 16/16
  同树直证 + probe 族 15 件 split 臂同窗全绿旁证）+ e2e 十五段全
  绿 1 passed 1.1m（p24-e2e.log）+ vue build 绿 ✓built 8.17s
  （p24-build.log——release 路由 + SCHEMA_DRIFT_GENERATE_AT=1，
  vue-tsc+vite）。
- **[x] T-04（no-go 支路口径）[✅ 已完成]**——量级门 N/A（AC-03
  no-go 支路注记）；量化交付 = 判定表 ④ + 分量分账（实测带替代
  bench150 四点——原型件 .runtime 口径，值内嵌本节可追溯）；
  bench150/boot-ready/dbg 孤页弧不适用注记（src 零 diff——在册
  023 数值面零漂移延续）；**exe 时间戳实录**：debug 09-28 15:02 /
  release 09-28 15:17 本批全程未变——023 在册载体跨批稳定第五证
  （D-35② 复测条件维持观察）。
- **[x] T-05 [✅ 已完成]**——SD-2401..2404 四件落位（ARCH §5 第
  二十二切片段关账定文 + §6 heading + README 是什么/Tests N 定谳/
  仪表盘②残余面收窄 + ledger v27→v28[D-22 处置更新 + D-40 新行 +
  D-21 v28 扩记 + D-35② 复核实测]）+ 仪表盘留观面板续记 + §9
  work 记录 + 负向证 grep 族内嵌 §8.2。

### 8.2 负向证七面（AC-05——全零实录）

- api.at diff 0 行：`git diff 983cc0c -- src/back/api.at` 空（wsys.at
  同 0 行——src 全树零 diff）。
- `.console` 属性写面 0（D-25① 纪律）：`grep -rn "window\.console"
  src/` 0 命中；src 零 diff ⇒ 与 023 known-good 树逐字节同形（零新
  增写面；`.store.console` 命中为产品 Console 面板状态字段非本面）。
- 基线/冻结池零触碰：`git status` 仅计划文件 + tests/probe_mtime.mjs；
  tests/baseline/structure-v19.txt 零 diff。
- gen·dist ignored 零手改：gen/front/vue/dist 为生成物（ignored），
  本批仅 build 链再生成，零手改。
- 家族仓零接触：auto-lang/auto-down 等家族仓工作树零改动（探针
  物料全在 e2e/.runtime 本仓 ignored 域——D-37⑦ 物料即用即弃口径）。
- 一次性件居 ignored .runtime：p24-cache-proto.mjs/dbg-p24.mjs/
  dbg-p24b.mjs/p24-ws150/probe-p24proto/probe-mtime 均 .runtime 内。
- 缓存调试口零外泄：repo src 零 diff（cached_read_text 原型仅存在
  于 .runtime 探针工程副本——pub 契约面零新增直证）。

## 9. 复审记录

- **2026-09-29 draft handoff（auto-plan:new）**：
  - `stage: new`，PLAN-024，revision 1（drafting）。
  - 立项路由：候选池首位序实勘核验（§0 四项排除依据）+ 主题四选
    询问未获答复 → 按 README 仪表盘定文与 023 §10.2 unlock 条款
    自主择定 mtime 键控缓存专项；用户改向出口 §10.1 在册。
  - 契约完备性：任务覆盖全部 AC 与 SD（T-01→AC-01 / T-02..T-04→
    AC-02/03/04/05 / T-05→AC-06）；路径与命令 grounded（§2/§4
    一手勘定）；未决假设有 owner/next（§10）。
  - `outcome: pass`（记录授权内——起草 + handoff；work 由用户
    auto-plan:work 入口启动）。
  - `next: work`（T-01 探针定谳起——no-go 支路内置）。

- **2026-09-29 work handoff（auto-plan:work）**：
  - `stage: work`，PLAN-024，revision 1（executing → execution_
    done）——判定表裁定 **no-go（收益面结构性否定）**，全批走 §8
    T-02 no-go 支路（关账定文 docs-only）。
  - 裁定链：四面探针全实录（p1 可调性/p2 语义含同秒窗/p3 模块态
    本仓首例/p4 驻留健康）→ 三风险全过，但分量分账实测 read×150
    ≈11ms（全弧 4%）、主导面 = 跨页解析装配 ≈90% 非逐页可缓存、
    原型热态 361-389ms ≥ 未缓存 271-278ms、热态 ≤170ms 门结构性
    不可达（收益上限 < 门需 101ms）——落地即净回归 → 缓存不落
    地（src 零 diff），fs 监听半本仓通道经济性关账（watch 批剩
    余面终账维持：残余 = D-39 + 监听半上游供料）。
  - `outcome: pass`（no-go 支路交付 = 计划 §1 成功样 no-go 形态：
    判定表/分账 §8.1 在档 + AC-02/03 no-go 支路注记兑现非静默移
    除 + AC-04/05/06 全过；§10.5 门校准裁决实录在条）。
  - `code_commit`: 本提交（直接 main 线性约定——001..023 在档惯
    例；base = 983cc0c）。
  - `task_ids`: T-01..T-05 全勾（T-02/T-03/T-04 按 no-go 支路口
    径执行——置换/注记/量化面三分）。
  - `evidence`: 判定表+分量分账（§8.1 全值）+ probe_mtime.mjs 入
    库双臂五案绿（probe 族 14→15 件 fresh：14 RESULT 全绿双臂 +
    probe_receipt_d19 负结果在册一致）+ merged 矩阵 16/16 ALL
    GREEN（基线 v19 零漂移——零重锁第五例）+ split 家族窗第八例
    [分段判绿先例——判别链最强形 src 零 diff@983cc0c] + e2e 十五
    段全绿 1.1m + vue build ✓built 8.17s（release 路由 +
    SCHEMA_DRIFT_GENERATE_AT=1）+ 负向证七面全零（§8.2）+ exe 时
    间戳跨批稳定第五证（debug 09-28 15:02/release 09-28 15:17）。
  - `blockers`: 无。
  - `next: review`（auto-plan:review——复审基线 = 本提交；合并窗
    known-good smoke 惯例随 merge 技能）。

- **2026-09-29 review（auto-plan:review）**：
  - `stage: review`，PLAN-024，revision 1，**outcome: pass**。
  - 复审口径声明：与执行同会话（独立复审会话未授权）——裁值全部
    工件独立重放重建，非执行期摘要采信。量化核心独立重放：dbg-
    p24b 分账 walk 17-19ms / read×150 **12-14ms** / mtime×150 9ms /
    lookup×150 104-107ms + 未缓存基线 277-284ms×5——**read 占比
    4-5%、收益上限 ~12-14ms < 门需 ~110ms，no-go 裁定独立复算成
    立**（与执行窗分账逐项带内）。probe_mtime 双臂重放五案绿（a/c/f
    只读面跨窗逐字节全等 1789452217/-1/CJK 同值——确定性直证）+
    p24-cache-proto 重放全绿（p3 174000|intact/驱逐/持久 + p4 ×10
    轮 26458B 等值/热态 375-391ms 带内/152 行/跨进程零漂移/驱逐弧
    fresh）+ probe 全族 15 件 fresh（14 RESULT 全绿双臂 +
    probe_receipt_d19 负结果在册一致）+ merged 矩阵 16/16 ALL
    GREEN 基线 v19 零漂移（零重锁第五例重放）+ e2e 1 passed 1.1m
    + vue build ✓built 11.90s（release 路由+SCHEMA_DRIFT_GENERATE_
    AT=1）+ 负向证七面全零重放 + AC-06 锚位全现读回。
  - `reviewed_commit`: 1f5d9a5（=复审基线=实现提交——本记录提交为
    docs-only 后代）；`base_commit`: 983cc0c；
    `dependency_revisions`: 家族 exe debug 09-28 15:02/release
    09-28 15:17 未变（第五证重放确认）；
    `spec_inputs`: 本仓无 docs/specs/——canonical 三件
    ARCHITECTURE/README/parity-ledger@v28@1f5d9a5[冻结哈希 sha256
    前 16 位：01c665bfa21e0dbd / 05961841260b4c94 / 2e60b344fe0b6390]。
  - `acceptance_results`: AC-01 pass[判定表四面重放+probe_mtime 绿
    +压力件值复现]/AC-02 pass[no-go 支路注记兑现非静默移除——判定
    表 §8.1 在档+src/api.at 零 diff+probe 全族]/AC-03 pass[no-go
    支路注记——分账重放复算 no-go 成立]/AC-04 pass[merged 16/16+
    基线 v19 零漂移+split 家族窗分段判绿（AC-04 明文许可路由——判
    别链最强形随档）+e2e 1.1m+build 11.90s]/AC-05 pass[七面全零]/
    AC-06 pass[锚位 [1]-[9] 全现+仪表盘文本与交付一致]。
  - `findings`: **F-24-1 观察非阻断**——delta after 措辞演进：plan
    SD-2401 draft 预期形「本仓不可达关账定文」（风险未勘前提）vs
    落地「经济性关账/收益面结构性否定」（实测形态）——终态同形
    [关账+残余两件]、同规则[负结果在册 probe_receipt_d19 同判形]，
    证据升级如实记录于 §8.1/§9（work 技能「随实际更新 delta」兑现
    ——无契约语义变化，不需 revision bump）。**F-24-2 观察非阻断**
    ——家族窗第八例**形漂移**：执行窗 p24-matrix-split.log=[1 boot]
    FAIL+wiki 树行不现 v23..v27 逐字同形；复审窗 p24-rev-matrix-
    split(-r2).log=boot/tree PASS+check 3 open 弧（Hello World，
    ASCII 无 D-19 面）10s 编辑器面未现 ×2 确定性（族内漂移 v25 先
    例形态[check 11 UI 弧败/boot FAIL 短路两形在册]）——判别链最
    强形承载[src 零 diff@983cc0c 受审树 ≡ known-good smoke 树+exe
    未变+merged 16/16 同窗直证+e2e 同窗绿（同编辑器面 vue 轨）+
    probe 族 15 件 split 臂同窗全绿（serve-back HTTP 面健康旁证）]；
    F-R17-1 维持留观 unblock 同前；merge 窗 ledger 刷新时 D-21 v28
    补漂移注记（review 期不动 live ledger）。**F-24-3 微末**——
    dbg-p24b mtime_only 累加 int32 溢出显示负值（150×1.79e9 超
    int32；计时字段不受影响，一次性件显示面，无裁定影响）。
  - `evidence`: p24-rev-{probes,matrix-merged,matrix-split,matrix-
    split-r2,build,e2e}.log（e2e/.runtime——临时件；判定值已内嵌本
    条可追溯）+ 分账/双探针重放值内嵌上文。
  - `next: merge`（merge 基线 = 1f5d9a5；用户已授权全链）。

- **2026-09-29 merge（auto-plan:merge）——PLAN-024:r1 收口回执**：
  - `stage: merge`，PLAN-024:r1，**outcome: pass（delivered 收口）**。
  - `prepared`: 复审基线 r1@1f5d9a5[reviewed——2fa7411 复审记录
    docs-only 后代]——canonical delta 已随实现落 main[SD-2401@ARCH
    §5 第二十二切片段+SD-2402@§6 heading+README Tests heading+
    SD-2403@README 是什么/Tests N 定谳/仪表盘/留观面板+SD-2404@
    ledger v28——直接 main 线性约定 001..023 在档惯例+三件知识库形
    019..023 merge 先例承载（canonical = ARCH/README/parity-ledger
    非文档节外知识库——在档 reviewed precedent）]。
  - `landed`: main tip == 2fa7411 含 1f5d9a5[直接 main 约定无
    worktree/dev 分支无 ff 动作——merge-base --is-ancestor
    ancestor-OK 线性无 merge commit] + **known-good smoke = 合并窗
    fresh vm merged 16/16 ALL GREEN**（当前 tip 实跑
    `p24-merge-smoke.log`——基线 v19 零漂移 PASS，09-28 exe 载体
    跨批稳定第五证续）。
  - `ledger_refreshed`: v28@1f5d9a5 tracked 读回核验[H1 字面 v28 +
    D-40 新行恰一 + D-39 恰一 + PLAN-024 收口处置段（D-22/D-35）+
    D-21 v28 + 复审窗漂移注记随 merge 窗补记（F-24-2）——无 live
    ledger 服务，tracked 文件面 PLAN-001/022/023 同判]。
  - `archived`: untracked→git mv→docs/plans/archived/
    024-mtime-keyed-cache-slice.md + status archived +
    completion_kind delivered。
  - `cleaned`: 无 worktree/dev 分支[直接 main 约定 worktree 仅
    main——git worktree list 单一主检出核验]+代码工作树零 WIP+
    本批 A/B 判别链零物料[判别链 = src 零 diff 强形，无 archive
    树；一次性件 p24-cache-proto/dbg-p24/dbg-p24b/p24-ws150/
    probe-p24proto/probe-mtime 居 ignored .runtime——bench150 存续
    先例同判保留，值已内嵌计划 §8.1 可追溯]。
  - **deployment 面观察**（landing ≠ deployment）：gen/front/vue/
    dist = 复审窗 ✓built@1f5d9a5 src[2fa7411/本归档 docs-only——
    内容现势]；家族 exe = auto-lang 仓所有非本仓工件[debug/release
    09-28 载体——本仓零涉]。jade-edit 无常驻生产进程面。
  - **留观交接**（下游批次口径）：F-R17-1 split 双臂复跑[家族窗第
    八例双位形续——022 第六例/023 第七例延续，unblock = 家族 exe
    稳定后双臂复跑]；D-35② bulkalias 复测[exe 时间戳 09-28 载体
    跨批稳定第五证——复测执行窗条件维持观察；P≤200 驻留压力面
    已实测补勘[PLAN-024 p4]]；**T-03/D-39 挂账面**（双取形维持 +
    dev-stack 竞态——unlock 三选随 ledger D-39/README 候选池③，
    后批重推载体 = 023 §5.3+全链证据）；**fs 监听半终账**[mtime
    键控缓存四面实测收益面否定关账——D-40 在册；上游亚秒粒度
    fs.mtime_ms 供料候选随 D-40② unlock 注记]；试用反馈件维持候
    选池首位（真实反馈缺席）。
  - `next`: ——（PLAN-024 delivered 收口；下一批 = 试用驱动阶段候
    选池首位序[README 仪表盘现势]）

## 10. 待澄清事项

1. **主题确认（draft 阶段出口）**：本 draft 按池序+判断择 mtime
   专项起草；用户如提供真实试用反馈（池定文首位——README :723）
   或改选微件池合批/T-03 授权重推，本 draft 转 revision（目标/AC/
   任务重立）或废立新件——不静默改向。
2. **T-03/D-39 三选仍待裁**（023 §10.6——本批不吞并；若用户改判
   ②e2e 基建授权修，可合批 r2 承载）。
3. **家族窗留观面板续记**（F-R17-1 split 双臂复跑 / D-35②
   bulkalias 复测——条件未至实勘 2026-09-29；本批执行窗若 exe 时
   间戳变则随批实录，022/023 先例同口径）。
4. **驻留压力败形缩形**：p4 若现值损坏签名 → 缩形形态（派生产物
   缓存[links 跨页依赖需重构——语义修订面]/LRU 界/容量钳）超本
   r1 合同 → r2 语义修订交用户（no-go 或缩形两出口）。
5. **热态门数值校准**：§5.3 门（≤170ms）系预估带定门——p4 实测
   后按带校准（§5.1 判定表条款；校准记 §9 不静默；越门出口预授权
   022 §10.1 同款续）。**【执行窗裁决实录 2026-09-29】校准结论 =
   门结构性不可达**（非数值带校准可解）：分量分账实测 read×150
   ≈11ms（全弧 4%）——免重读收益理论上限 11ms < 门所需 101ms；
   原型热态 361-389ms ≥ 未缓存 271-278ms（不硬调门——把门校准到
   冷态带之上 = 洗白净回归，§5.3 出口条款明文禁止）。随判定表
   no-go 裁定走 §8 T-02 no-go 支路（关账定文），门条款随 AC-03
   no-go 注记不适用（非静默移除——本条即校准记录位）。
