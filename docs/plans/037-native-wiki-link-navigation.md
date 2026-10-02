---
plan_id: PLAN-037
status: executing
feature_name: VM 原生正文内链导航（R-03b3，上游供给解锁后接入）
author: [agent]
created_at: 2026-10-02T13:17:45Z
updated_at: 2026-10-02T13:35:00Z
plan_revision: 1
current_step: 1
total_steps: 5
supersedes_spec_components:
  - docs/specs/wiki-link-navigation.md
  - docs/specs/editor-host-capabilities.md
new_spec_components: []
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-03b3
---

# PLAN-037：VM 原生正文内链导航

## 0. 变更摘要

036 已 archived/delivered，交付 Vue 正文链接事件＋只读解析＋安全导航，复审记录 AC-01..10 pass；本片不重开它。交付载体仍仅 Vue，原生 View／widget／AURA 没有 link 通道。036 上报的输入期链接解析缺失、Vue 空白编辑器不能输入仍保留，不等于已完成所有原始使用场景。

结合用户对两版一致性的关注，下一项补齐 **VM 原生正文链接入口**：上游 auto-lang 先交付链接语义／命中和真实消息通道；Jade 再复用 036 的 resolver、源票据、选择世代、NavCommit、缺页确认和提示。不是重写一套 VM 知识库，也不在 Jade 猜原生坐标或直接派发伪造点击。

**当前依赖状态：上游供给未交付，Jade 接入阶段受阻。**[原生供给需求包](../upstream/2026-10-native-wiki-link-supply.md) 已写清 U-01..06、责任仓、实际代码链与解锁证据。本 Plan 是完整消费合同；未有合格供给证据前不得实施 T-03，不将“已规划”或“已解析”计作 VM 点击交付。

## 1. 目标

- G-01：原生 merged 产品界面中，加载期已有 `[[页面]]` / `[[别名#锚点]]` 可通过真实正文点击打开正确页面；普通点击／编辑／拖选清晰分工。
- G-02：Vue 与 VM 消费相同链接身份和保护策略，避免两个 resolver／两个导航状态机。
- G-03：源页未保存、目标已开 dirty、缺页确认、迟到事件／响应、取消与错误，原生面均有真实结果证据。
- G-04：保持 Vue 036、树／面板导航、输入、保存、草稿和文件生命周期；显示锚点说明但不冒称定位。
- G-05：上游 binary、载荷、原生事件与 Jade 消费证据绑定 revision，能力矩阵明确区分 merged、native split、Vue＋HTTP split。

实现范围：本仓 src/front/app.at、editor_store.at 中最小适配／共享门修正、tests 与规范交接。auto-lang 提供前置能力，**由其独立 Plan／工作树交付**，不由本仓 work 步骤混写其源码；上游目标文件及门禁见需求包。跨仓实现不是本次用户“请规划”的已执行授权。

非目标：所有输入期实时解析、Vue 空白页补丁、原生 split boot 修复、reveal／caret、引擎 Save／动作栏、六命令桥、全局 Shift、外链机制、布局重构、Musk 集成。原生第一片承诺加载期链接，不能宣称刚键入的链接在两版都已自动转换；B-6/B-7 另由 auto-down 供给。

成功样：在 VM merged 打开 Src.ad，正文已有中文别名链接；源另加未保存文字，再点击链接，打开 Tgt.ad，源脏正文／草稿保留。缺页点击只开确认，取消零建页；目标锚点只给现行“已打开页面，暂不支持定位…”说明。

## 2. 架构方案

1. **供给与消费分仓**：auto-lang 处理文本语义／链接布局命中、DocInput→DocOutput、DocEditor→Shell、View／iced lowering／AURA→DynamicMessage；Jade 只收公开事件并安全导航。
2. **同语义业务载荷**：target＋target_anchor 两语义字段与 Vue 首 # 拆分／trim 一致；来源 key／挂载代次作为公开 origin 或框架派发守卫，由 T-01/上游契约明确，不能把 anchor 当来源。
3. **共享导航核心**：沿已有 OpenWikiLink / NavCommit 流程。原生入口只做载荷归一和来源验证；必要时提取共享协调 handler，禁止复制四级解析和独立 native tab 状态机。
4. **两级迟到门**：编辑器事件来源／挂载代次门先判，再捕获当前源票据并进入 036 的请求号、uid、sel_gen、key、body 每等待期门。旧 editor 回调不得冒领新活动页。
5. **真实原生验证**：至少 core 布局命中、widget/Shell 发布、Auto handler 到达、Jade 正确目标四层贯通。MCP ghost state 点击和 DSL 直派只作策略负例，不能替代生产输入链。

## 3. 技术栈

Jade 仍为 Auto 单源；原生用 AutoVM / iced，Vue 生成路径不分叉；resolver 后端沿 resolve_wiki_link 单参接口。auto-lang 原生 Rust 供给按该仓 AGENTS 的 L1 Plan＋工作树＋review/merge。不引入 DOM 私有实例、像素坐标常量、合成整文改写或新知识库格式。

T-01 只固化上游交接和最小验证载体；生产 API 是待供给契约，不能当已存在功能。当前源码没有原生 callback，且没有合格运行期供给证据；规划期间 binary 外部更新，须按 §4.1 的新指纹重测，不能直接沿用 036 旧回归。若原生消息与自动化载体无法经过真实 widget 路径，维持 blocker，不能把 UI 快照有链接样式判为解锁。

## 4. 需求分析与背景调查

### 4.1 基线与当前权威

jade main HEAD=3ee11a372679ff079ee36a6cf75e303b51d652e0，工作树 clean，单一主检出；根无 active Plan，archived 最大 036。分配用独占锁、重扫两个目录、CreateNew、跨池验唯一。无 Spec index，以下局部规范为当前约定。

| 来源 | 事实／影响 | SHA256 |
| --- | --- | --- |
| docs/specs/wiki-link-navigation.md | Vue 消费、每等待期门、NavCommit、缺页、错误、锚点；§4 B-6/B-7 原生／输入期边界 | 82869E12FBB81D97B89394734562D6CD4E9E6B33C4F279537007B6A67B1EE773 |
| docs/specs/editor-host-capabilities.md | §1.3 native link 缺供给、§2 链接身份／保存来源／位置约束 | BDF22C158778D4E58C351B0FB80449F71A36F5E6FB94EE4FE248481B14E86B71 |
| docs/specs/editor-command-availability.md | 宿主六命令仍缺桥、三键归属保持；native 内部历史源码与运行证据分开 | 0E4B75F31678B860A3F9CEDEE94357A2A3DF0A9D83BC7FA9C8FAD1E297C67456 |
| docs/specs/draft-recovery.md | 源正文、草稿身份和排水不被导航改写／结算 | 41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7 |
| docs/specs/document-lifecycle.md | tab_uid、源变更／路径变更／晚输入门 | C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF |
| docs/specs/name-search.md | 显示 title 不入链接身份，四级解析维持 | A4E03D1F4D9F85D413F3DCECA84923EFD29EB862BF7A1587D816DF19F65902B9 |
| src/front/app.at | OpenWikiLink、nav_seq、navc_*、CreateGo、正文完整事件名监听 | 142B480201BCE07C301CA1FEEDEDFBE2CE4A1CC72E1C3C0ABE5148682624C808 |
| src/front/editor_store.at | active_uid、sel_gen、NavCommit、TabActivate，同步提交权威 | DB6AE07C33BA2083B0741985C5F77DD22A58D8CCBF712C8C8E8B711151546A78 |
| src/back/api.at | POST resolve_wiki_link 已可消费，本片不新建第二 resolver | 07CE72C8D98BA5BB184B777A82B510E02A0374620F22395247F0528912C41215 |
| docs/plans/attachments/036-wiki-link-contract.md | B-1..10 真实边界；不能以降级 untitled 测试证明它已可输入 | 414AC4A6DA49538444C0AFF7984DDE8CDFCAB2E73F8F5B77805C7405AC269C0A |

调查开始 auto-lang HEAD=fe5327acf70b20cc3791840195234c05f5df9697；auto-down HEAD=895f8d0f9355c9f5ec3ce8fca268bdb768395846，检查时 clean。binary 版本／hash 与 native 五环指纹见供给包 §1；auto-lang 外部工作未动。已读其 AGENTS、Specs overview / UI overview 与 mcp-pointer-input 规范，不运行 cargo 或生成器。

收尾复核（2026-10-02T13:20:35Z）：auto-lang 外部 PLAN-729 交付后 HEAD=7d50989f7a65497a379b8f1d1321a32a45a7e246，实际 binary=`auto 0.1.0+v0.4.2-2607-gb3149f74f` / SHA256 `0688B14584F8D3B017F844F579A9353BEBFA299B9C0FFCE143AA55DA0F945F33`；native 五环源码指纹恒等，缺少 U-01..06 的供给证据仍成立。未重跑应用，旧 binary 的 split／时序限制须在 T-01 重新核判，不自动宣称已修或仍复现。此为证据版本补记，不改变 r1 的目标／任务／验收。

### 4.2 036 的完成与未解锁面

036 交付／复审／账本／归档链为 bac7905→94e66b7→36e83a9→3ee11a3。用户确认结束且工件 archived/delivered；本次不重跑旧实施全套。

但其 F-36-R2 记录：输入期链接不解析＋空编辑器零块，untitled 新输入链接点击的完整使用场景仍不可达。其 F-36-R3 的确认期失效直派也受仪器限制。本 Plan 不将这些负担静默抹掉或改原验收；对自己新增的原生点击／过期来源验收，缺证即受阻，不照搬“不可达仍算 pass”。auto-down B-7 基础写作问题应优先供给，与本片原生通道解锁并列。

当前阻碍比“零事件监听”更深：core 丢失链接目标，只保留样式；DocOutput/DocEditor/View/renderer/builder 均无回调。因此先要求完整上游供给，不在 Jade 仿造命中或以 tree/panel 点击替代正文。

### 4.3 授权与前置门

用户请求“现在计划036已经结束，下一个计划是什么？请规划”，沿用 auto-plan-new，结合此前 VM 版问题选择双轨补齐方向。本次仅授权规划、读仓、创建本仓 Plan／上游需求包／路线图；未授权当前会话实施、修改 canonical Specs／上游、发布、自动 work/review/merge；无预算。

后续本仓执行可先完成 T-01 交接核验，T-02 依赖合格上游交付；T-03..05 在该门通过后开始。auto-lang 须在其仓独立立项，遵从独占编号与专属工作树，不能把本消费 Plan 当已批准的上游代码任务。无需用户再作知识库格式／resolver 的产品选择。

## 5. 详细设计

### 5.1 上游公开协议与解锁回执

U-01..06 全文见需求包：链接语义／精确坐标、完整点击与拖选排除、原生 callback 全链、来源与世代、真实事件验证面、默认 None 兼容。T-01 冻结载荷、触发方式和验证入口；其 owner 是 auto-lang 供给执行者，Jade 验收者复核。

事件 target／anchor 必须与 Vue 相同；无锚点使用明确空值。origin 字段或框架验源方案必须公开，若 callback 扩参需同时给 DSL handler 签名与 Vue 兼容证据。建议普通左键完整点击，与拖选由生产事件状态区分；改成 Ctrl+click 会改变本片交互验收，先提 Plan 修订，不隐式实现。

合格供给回执必须含上游 Plan ID / revision / reviewed/delivered commit、实际运行 binary SHA256、widget→Shell→DSL 的最小 known-answer、双同正文实例来源反例和事件兼容表。源 HEAD／回调字段存在／只跑 core 单测均不能独立解锁。

### 5.2 Jade 共享消费

- 保留 Vue 现行完整事件名路径。若 native 公开 origin，适配层先验实际来源 key／挂载代次，再调用共享协调流程；若框架保证验源，先用排队旧回调与关闭重开反例证其保证。不能以 active 状态猜旧来源。
- 当前 OpenWikiLink 第一等待前的捕获、nav_seq、active_uid、sel_gen、key、body 门继续作为安全权威；原生 merged 也遵同规则，不因“后端同步”删保护代码。
- 同一 resolve_wiki_link 后端、同一 NavCommit、同一现有 dirty 目标激活与最近文件完成门。无新 native 磁盘 resolver、无 title 拼 .ad。
- 缺页复用现行 navc_* 和 CreateConfirmOpen/CreateGo；取消零建页，明确创建才写盘。输入／正文命中不触自动 Save / Reload / 草稿结算；锚点仅说明，不 reveal。
- 补来源失效／确认失效原生可达证据，不以 Vue 模态下不可切档跳过。测试输入不能另写一份只在 tests 成立的策略机。

### 5.3 载体与发布边界

| 载体 | 本片承诺 | 不可替代证据 |
| --- | --- | --- |
| VM merged 产品窗口 | 新增原生正文真实点击→正确页面，编辑与选择保留 | backend 直调／状态直写不算正文点击 |
| native split 最小工程 | 上游供给应验证事件同形；Jade 整应用 boot 保留 F-24-2 并记准确现状 | HTTP 后端成功不证明 native split UI |
| Vue＋split 后端 | 036 行为零回退；同 resolver／保护／缺页／提示 | 不要求本片修输入期／空白页／boundary |

本片完成门要求 native merged 真正可用与 Vue 回归绿；不承诺 F-24-2 同时修复，不把 native split 标成整体可用。若 native merged 真事件验证也不可达，本片不得交付为功能完成。解锁前清楚列 unsupported，不伪显示可用入口。

### 规范增量

仅为拟议规则，本次不改 canonical。上游 Spec delta 由上游独立 Plan 登记；本表是 Jade 的消费约定。

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | modify | docs/specs/wiki-link-navigation.md 开篇/§1 | 前：仅 Vue；后：已核供给版本下增加 native merged 加载期内链激活，载荷同语义、来源门公开且可验证 | 解除产品入口差异，不改格式 | AC-01, AC-02, AC-03 |
| SD-02 | modify | docs/specs/wiki-link-navigation.md §2 | 后：native origin 先验与共享每等待期门；NavCommit／脏目标／成功副作用继续同一策略 | 防来源串扰、双状态机 | AC-04, AC-05, AC-06 |
| SD-03 | modify | docs/specs/wiki-link-navigation.md §3/4 | 后：原生缺页取消／确认、错误可见、锚点不定位及 native merged 证据；B-6/B-7 等上游限制保留 | 能力交付与边界分开 | AC-07, AC-08, AC-09 |
| SD-04 | modify | docs/specs/editor-host-capabilities.md §1.3/§3 | 前：native link 未供给；后：绑定实际供给版本记录 merged 已消费、split 单独判定；B-2 只缩窄 link，不宣称 save 已解锁 | 防一条通道解锁被泛化为全宿主接线 | AC-01, AC-09, AC-10 |

## 6. 测试设计

新增 `tests/probe_native_wiki_link.mjs`（生产 App 或其真实薄载体的原生事件臂，验证输入入口由 T-01 冻结，非自行猜 MCP action）；新增 `docs/plans/attachments/037-native-link-contract.md`。复用 tests/probe_wiki_link_navigation.mjs 的后端／Vue 臂、tests/vm_matrix.mjs v28 基线；Vue 用 e2e/wiki-link-navigation.spec.ts 与受影响保护套件。auto-lang Rust 链路测试与 binary 构建归上游，不在本仓主检出跑上游编译。

| 组 | 场景与证据 | AC |
| --- | --- | --- |
| N 真实入口 | 加载英文／中文／别名／锚点链接，首块和后续块、折行末段点击；core 区域→widget Shell→Auto handler→目标 path 四层同一次激活；非链接／外链／代码域不发 wiki 事件 | AC-01,02,03 |
| O 来源 | 同正文不同 key 的两个隔离实例各发自己来源；排队旧事件后切档／关闭重开／改名；旧事件零冒领当前页 | AC-04 |
| P 保护 | 具名源输入后 dirty 再点已有链接，源 body/draft/磁盘保留；目标已开 dirty 零覆盖、恰一 tab；成功后才 recents | AC-05 |
| S 请求 | 解析与读盘等待窗中切档、A→B→A、关闭重开、源新输入、第二点击逆序；同步 merged 无等待窗的条款在带同生产消费流程的 split 后端原生最小载体验证 | AC-06 |
| M 缺页 | 原生 missing 开确认、取消无页、确认真建正确页、非法名拒绝；确认来源失效可达反例；创建后 anchor 提示且恰一 tab | AC-07 |
| F 错误 | 原生解析／读取失败可见，不弹建页、不记成功，恢复后重试成功；迟到错误零盖新成功 | AC-08 |
| E 编辑兼容 | 点击非链接放 caret、拖选经过链接不导航、右／中键零导航、IME、输入、内部历史、滚动、兄弟按钮点击；回调缺省应用仍能编辑；GUI输入不因测试 seam 分叉 | AC-02,09 |
| V 回归与矩阵 | Vue 036 全套，merged 基线，保存／草稿／生命周期／名称；native split 精确状态，未供给保存／命令／reveal不冒称 | AC-09,10 |

后续可执行命令（仓根，新增 probe 在 T-01 明确 CLI 默认全臂、每阶段截止与实际输入工具）：

```text
node tests/probe_native_wiki_link.mjs
node tests/probe_wiki_link_navigation.mjs
node tests/probe_editor_host.mjs --phase all
node tests/probe_command_availability.mjs
node scripts/regen-vue.mjs
node tests/vm_matrix.mjs --arm merged
pnpm exec playwright test -c e2e/playwright.config.ts e2e/wiki-link-navigation.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/command-availability.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/reload-safety.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/draft-recovery.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/lifecycle-safety.spec.ts
pnpm exec playwright test -c e2e/playwright.config.ts e2e/name-search.spec.ts
git diff --check
```

结果要求：新增 native 功能臂全 PASS、Vue 受影响套件单跑全绿、同次事件→打开 path 可关联，probe 无真实输入通道即报告 BLOCKED 并非 exit 0 功能成功。原 probe 的缺供给历史模拟保留分域，live 能力行更新有版本依据。必要结构基线刷新逐字段解释，禁止降言／删除案例掩盖迟到门或上游问题。

## 7. 验收标准

| ID | 可观察行为与具体验证／预期 |
| --- | --- |
| AC-01 | U-01..06 合格供给回执、版本/hash、公开契约和真实原生事件证据齐全；native probe N 组实际 handler 恰一次、正确 target/anchor，不能用源码字段或 HTTP 成功替代 |
| AC-02 | N/E 组 ordinary 左键完整点击合法链接可导航，拖选／右中键／非链接／外链／代码域零 wiki 激活，折行和首块可达；输入、IME、选择与滚动不回退；改变触发方式须修 Plan |
| AC-03 | N 组英文／中文／四级 alias 和 anchor 打开既有正确 target_path；同 backend 已知答案逐案一致，title-only 不拼路径，事件第二参不是来源 ID |
| AC-04 | O 组两个同正文实例与过期 callback 反例：关闭重开／切档／改名后旧来源零 handler 冒领、零 tab／提示／最近文件回写，有实际链路断言而非只有 guard grep |
| AC-05 | P 组真实输入让源 dirty，点击已载入链接后源正文／草稿身份与磁盘页字节保留；目标已开 dirty 只激活不覆写，不重复建 tab，只有实际成功才记 recents |
| AC-06 | S 组共享导航两等待窗及逆序请求：旧结果零激活／建页弹层／tab／提示；A→B→A 不能复活旧票据；原生 handler 实际消费路径贯通，不能只算 Vue 回归 |
| AC-07 | 原生 M 组正常 missing 才开确认；取消零页零 tab、明确创建正确页不覆盖已存在页，非法名可见拒绝；确认来源失效实际可达、旧确认零创建／导航 |
| AC-08 | 原生 F 组解析／读失败可见且 save_note 独立，不当 missing／成功；恢复后重试可打开，旧错误不覆盖新成功 |
| AC-09 | anchor 成功开页仅给不支持定位说明；Vue 036、保存／草稿／生命周期／名称／命令说明定向回归通过；输入期／空白页／Shift／save／命令桥／reveal 边界逐项保留 |
| AC-10 | SD-01..04 拟议终版与实际载体证据相符；merged 已消费才改矩阵、native split 状态独立、上游版本和 Plan revision 绑定；本仓 archived 034..036 零改写，规范沉淀不以调查通过代替功能交付 |

## 8. 执行步骤

| 步骤 | 依赖 | 已核实路径／符号 | 输出和验证 | AC / SD |
| --- | --- | --- | --- | --- |
| [x] T-01 冻结供给与验证载体（✅ 2026-10-02T13:33Z——契约冻结件 attachments/037-native-link-contract.md 落位：binary 重绑 v0.4.2-2620-g7d50989f7/9EFC7CCB…F1B64〔规划收尾后外部重建，漂移在记〕；五环指纹逐项恒等复核，源码级 U-01..06 全未供给〔core.rs:393/:144 行号定谳〕；C-01..06 消费契约冻结；Vue 兼容目标实勘 app.at:1646/:3024＋spec §1..§3；K-01..04 原型义务登记 owner=上游供给 Plan；负责仓正式 Plan 关联=仍缺席〔活动 242/719/722/723/730/731 无一供给〕。原型不在本仓伪造，关键未知随上游 Plan 原型+复测） | 无，可先完成交接核验 | docs/upstream/2026-10-native-wiki-link-supply.md；上游 core.rs DocInput/DocOutput、widget.rs publish、View::AutodownEditor、convert_autodown_editor_native、build_autodown_editor_generic；新 attachments/037-native-link-contract.md | 核对 U-01..06，登记负责仓正式 Plan 关联／触发交互／公开 origin／真事件工具与截止，检查 Vue 兼容；每关键未知一次原型＋一次复测，不能达成记精确 blocker。只在负责仓工作树原型，不在本仓伪造核心能力 | AC-01,02,04,10；SD-01,04 |
| T-02 验收上游解锁 | T-01＋auto-lang 独立供给 Plan reviewed/delivered，**当前缺失** | 新 native probe；上游交付契约与实际 binary；tests/probe_editor_host.mjs 的 live native 消费面 | 核验 core→widget→Shell→DSL 和来源反例全链、缺省兼容；版本／binary 指纹与证据绑定。合格后记录 unlock，失败／缺证保持 blocked，不进入 T-03 | AC-01,02,04,10；SD-01,04 |
| T-03 原生入口接共享导航 | T-02 unlock | src/front/app.at autodown_editor/OpenWikiLink/navc_*；src/front/editor_store.at NavCommit/TabActivate | 最小 origin 适配，复用现有 resolver／协调流程与门；必要公共提取必须维持 Vue 事件双参消费。运行新 probe N/O/P/S，真实正确目标和保护、旧来源拒绝 | AC-03,04,05,06；SD-01,02 |
| T-04 原生缺页与终态验证 | T-03 | app.at CreateGo/CreateConfirmOpen 对应调用、wiki_nav_note；新 probe M/F/E，既有 vm_matrix | 原生 missing／取消／创建／失效确认／错误／anchor 实际可达；编辑兼容。新 probe 全功能臂 PASS；native merged 点击证据不可达时不得打勾 | AC-02,07,08,09；SD-03 |
| T-05 定向回归与规范交接 | T-03,T-04 | §6 既有 tests/e2e；wiki-link-navigation、editor-host-capabilities、ARCHITECTURE 和路线图 | 单跑定向门全绿，必要 baseline 差异逐项解释，SD-01..04 终版、载体能力表与 upstream revision 回执提交独立 review；保持其他供给缺口，不改上游 WIP或旧归档 | AC-01..10；SD-01..04 |

进度 1/5（T-01 闭环 2026-10-02T13:33Z——供给契约冻结件落位＋五环现状定谳；T-02 解锁门 BLOCKED：上游供给 Plan 仍缺席，详见 §9 结算与契约 §7）。T-02..05 未解锁。本仓 Plan 不实现 auto-lang T；上游自身的任务／规范／门禁由该仓 Plan 管理。本片不能在上游只交付蓝色渲染时归档为 delivered。

## 9. 复审记录

- stage: new
- plan_id: PLAN-037
- plan_revision: 1
- outcome: blocked
- next: 在 auto-lang 正式立项并交付 U-01..06 原生 link 供给，回执 reviewed/delivered revision、binary 指纹和真实事件证据；随后执行本片 T-02 解锁核验，再进入 T-03 消费。
- changed_tasks: T-01..T-05（新建）
- changed_acceptance: AC-01..AC-10（新建）
- 规划检查：5 任务覆盖 10 验收／4 SD，明确前置 owner、代码链、真实输入与来源反例。供给包已可交接；当前不是立即可执行的 Jade 接入代码任务。
- 这是 draft handoff 依赖结果，不是实施复审结论，也不是目标工具 update_goal 的 blocked 状态。用户只请求规划，本次交付文档后停止。
- 2026-10-02T13:28:35Z：stage: work | plan_id: PLAN-037 | plan_revision: 1 | outcome: executing（启动） | code_commit: 基线 3ee11a3（036 archived/delivered tip；直接 main 线性惯例单一主检出——001..036 在册，无 worktree/dev 分支面，本片沿用仓库既定惯例） | task_ids: 无（T-01 未开工） | evidence: 用户指令「计划037: auto-plan-work 实施」授权执行（drafting→executing）；主检出预检=路线图 M＋本计划/上游供给包 untracked（规划会话产物，本落档批清零），代码路径（src/tests/e2e/scripts/gen）零 WIP；工作树清单=单一主检出 D:/autostack/jade-edit@main，无既有 037 工作树/分支 | blockers: 无（执行启动面；上游供给缺口为 T-02 门前置，见 §0/§4.3） | next: T-01（冻结供给与验证载体）。
- 2026-10-02T13:35:00Z：stage: work | plan_id: PLAN-037 | plan_revision: 1 | outcome: blocked（T-01 闭环；T-02 解锁门未过——按 §4.3 前置门 T-03..05 保持锁定，本 Plan 维持 executing） | code_commit: d6d0000（落档+启动）→本批（docs/plans/attachments/037-native-link-contract.md 新增＋计划进度/§9/§10；直接 main 线性；生产源码/tests/e2e 零改动——本任务为文档交接核验面） | task_ids: T-01 | evidence: 契约冻结件 §1..§8（T-01 实勘 2026-10-02T13:30Z）——①binary 重绑：`auto 0.1.0+v0.4.2-2620-g7d50989f7` SHA256 9EFC7CCB…F1B64（`--version` 首行+sha256sum，与探针指纹臂同法；规划收尾记 v0.4.2-2607/0688B145… 已漂移，重绑规则入契约 §1：T-02 每次核验以当时实际 binary 重测）；②五环源码指纹与需求包 §1 逐项恒等（sha256sum 五文件），源码级 U-01..06 全未供给——core.rs:393 DocOutput 仅五 changed 旗标、:144 `Mark::Link|Image => style.link=true`（目标即丢）、widget.rs:112 publish 仅 on_change/on_focus、view.rs:2490 AutodownEditor 七字段无 link callback、aura_view_builder.rs:3880 与 iced/renderer.rs:26228 无回调传递；五环 grep 仅 :2963 注释一处零回调代码；③C-01..06 消费契约冻结（载荷双参 target/target_anchor 无锚明确空值+普通左键完整点击+全链六环+origin 禁 last-mounted 单槽+真实事件面+缺省 None 兼容）；④Vue 兼容目标实勘（app.at:1145 msg/:1646 绑定/:3024 handler/:3032 缺参归一+spec wiki-link-navigation §1..§3 现行语义）；⑤T-02 解锁门五项清单（契约 §4）；⑥K-01..04 关键未知＝上游原型义务（K-01 布局命中映射/K-02 origin 形态/K-03 真实事件工具/K-04 AURA 双 string 载荷通道），本仓不伪造。T-02 门核验：auto-lang 无供给 Plan——活动 242/719/722/723/730/731、archive 至 729 均无 wikilink 供给（13:30Z 实勘）；其源 HEAD 7d50989f7 与规划收尾恒等（受跟踪路径 clean，仅根目录外部 .tmp-* 残留） | blockers: 上游供给未交付（结构性前置，非本仓可解）——精确解锁动作=auto-lang 按其 AGENTS 独立立项供给 Plan（scripts/new-plan.sh 独占编号+`.wt/lang-<NNN>` 专属工作树+独立 review/merge），交付契约 §4 五项回执后本片 T-02 复验 | next: 上游供给 Plan reviewed/delivered 后 T-02 解锁核验（以当时 binary 重绑复测）；届时未解锁则本 Plan 保持 blocked 休止。

## 10. 待澄清事项

- **D-01 上游供给，owner auto-lang**：U-01..06 未交付；按该仓 AGENTS 独占立项／专属工作树执行。无需本次重复确认已请求的规划；跨仓代码执行由其后续明确任务／Plan 授权。**T-01 结算（2026-10-02T13:35Z）**：供给 Plan 仍缺席（活动 242/719/722/723/730/731、archive 至 729 实勘无一供给）；契约冻结件已落位，binary 已漂移至 v0.4.2-2620-g7d50989f7 并按重绑规则在记——解锁动作与验收条款见契约 §4/§7。
- **D-02 公开载荷和真实事件工具，owner 上游执行者＋Jade 验收者**：由 T-01 有界冻结，不能猜不存在的 callback/API；无法获得真实事件面即阻断本片功能验收。改变 ordinary-click 产品操作须修订 AC-02 并提具体选择。
- **D-03 输入期解析／Vue 空白页，owner auto-down**：036 B-6/B-7 仍未解决，B-7 应优先修复。单独供给解锁后补偿该完整用例，不包含在本片 native 加载期承诺中，也不抹除历史缺口。
- **D-04 native split，owner auto-lang／Jade 运行载体**：F-24-2 保留，本片 merged 成功不等于 split 产品可启动；最小 split 事件与后端 HTTP 两者分别记证。
