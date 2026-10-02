---
plan_id: PLAN-034
status: executing
feature_name: 编辑器宿主能力核验与供给契约（R-03a）
author: [agent]
created_at: 2026-10-02T04:10:23Z
updated_at: 2026-10-02T07:10:00Z
plan_revision: 1
current_step: 2
total_steps: 4
supersedes_spec_components: []
new_spec_components:
  - docs/specs/editor-host-capabilities.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-03a
---

# PLAN-034：编辑器宿主能力核验与供给契约

## 0. 变更摘要

PLAN-033 已 archived/delivered，名称查找能力已沉淀至 name-search.md。按路线图进入 R-03「编辑器宿主接线」，先完成 R-03a：用当前工具链和真实编辑器证明 save、command、link、selection、cursor、reveal 六类接口的可用性，区分编辑器内部能力、Auto 可调用能力和 Jade 已接线能力，并形成可以交给下一项实施的契约。

本项是有界的能力核验与供给设计，不冒充功能接线交付。当前 Save 按钮未监听、六个菜单命令只写日志；原生与 Vue 的接口供给不同。不能依据 Vue emit、原生内部快捷键或生成器发射了 prop，就承诺宿主菜单已经可用。默认不改变生产界面／业务源码；只新增隔离探针、证据附件和落位的局部能力规范。

明确出口：每项能力得到「已可消费／供给存在但待接线／缺供给／受阻」判定；可消费部分形成本仓接线设计，缺供给部分形成逐仓最小需求和验证门。后续才创建 R-03b 的正式实施 Plan，不提前占号，不修改兄弟仓。

## 1. 目标

- G-01：核实用户可见的保存、正文链接和六个编辑命令入口，明确哪些是真的有效、哪些是内部能力、哪些是失效入口。
- G-02：为六类接口建立三条载体矩阵：原生 merged、原生 split、Vue＋split 后端；实际载体、语法、事件参数、调用结果和缺口可追溯。
- G-03：给保存接线提出保护现有正文／草稿／生命周期门的方案，明确事件来源身份、输入冲刷、重复触发和迟到事件要求。
- G-04：给命令、正文链接及定位提出最小宿主契约，确定消费方与供给方，不让 Jade 复制编辑器历史栈／私有选区／链接解析规则。
- G-05：交付可重跑探针、具体供给需求及后续执行决策，使下次规划能直接据证据分配实施范围。

范围：jade-edit 的 tests、e2e、计划附件和 docs/specs 局部能力规范；生产源码仅只读。auto-lang、auto-down、auto-edit 仅只读定位供给。生成产物与探针工程允许在 jade-edit 的 gen/、e2e/.runtime/ 创建；不修改上游源码、dist、全局工具链或真实知识库。

非目标：本片完成保存／链接／命令桥接、原子保存／自动保存、完整编辑器替换、菜单布局／左右栏改造、光标／滚动持久化、正文搜索定位、链接身份变更、Musk 文档管理、跨仓修复或发布。R-03 整体保持未完成；只有能力核验与契约交付可记 R-03a 完成。

## 2. 架构方案

调查沿「内核实现→公开组件／VM 原语→Auto 转换／生成→Jade 调用→实际用户结果」链条进行。每条能力记录这五层，不能以某一层存在替代整条链可用。

能力状态分为：

- **已可消费**：公开的宿主入口在指定轨实际被调用，结果符合已知答案；仍需区分 Jade 当前是否接线。
- **供给存在、待接线**：公开机制已由最小探针证明，但 Jade 尚未消费。
- **缺供给**：内核有能力或组件有事件，但 Auto 侧缺读出／调用／可靠身份／语义，定位到具体缺层。
- **受阻**：载体启动、dist 新鲜度或测试原语阻止判定，给阻断证据和重入条件，不伪造否定或通过。

保存、命令、链接是首批实施决策的输入；selection/cursor/reveal 只冻结能力边界与供给要求，不与本片绑定成一次大功能发布。矩阵需分别标明源码观察和运行证明，不能把未运行的可能语法写成最终可用 API。

## 3. 技术栈

沿用 Auto 单源、AutoVM merged/split、生成 Vue3、EngineEditor、现有 vm_matrix 与 Playwright 隔离工作区配方。测试不手改生产 gen/front/vue；如需最小宿主探针，在 e2e/.runtime 内生成独立 .at 工程并记录源与构建命令。新增测试脚本由仓库源生成探针，不依赖会话临时文件。

规划未冻结新的 Auto builtin 名、事件参数或组件 command prop。现有 EngineEditor save(md)、open-wiki-link(title, blockId?) 与公开 handleSave/getBlockMap 是观察到的供给；原生内部 DocInput／历史函数不等同于 Auto 可调用原语。T-01..03 负责裁决，不使用 code_editor_* 操作 autodown_editor，不借 DOM 私有实例或整文重置模拟撤销／复制／选区。

## 4. 需求分析与背景调查

### 4.1 规划基线与现行规范

main HEAD=4f7de843bdd477a7fcf2de63a8a4d0191f5c63f4；起始工作树干净，仅主检出。docs/plans 无 active Plan，archived 最大业务号 033；分配时以排他锁重扫两目录并独占创建，attachments 不占号。033 status=archived、completion_kind=delivered、step=5/5，规范 name-search.md 已落位，不重复 033。

docs/specs 无 overview/index。已读取 editor-safety 全文、draft-recovery 保存／离开边界、document-lifecycle 定向协调与待核验门、name-search 全文；宿主接口尚无局部 Spec，既有定位在 docs/ARCHITECTURE.md §4 与源码中的降级说明。路线图 R-04 行仍写 execution_done 待复审，与顶部及归档事实不一致，本次仅纠正分析状态。

| 来源 | 相关事实 | SHA256／版本 |
| --- | --- | --- |
| docs/specs/editor-safety.md | Reload 结果门、重挂载与规范化回声边界 | 2CD7BB0A5D2F1D6D4BF56A7B616FD1CEC164054E30C3A4AB0A9960AF786D0051 |
| docs/specs/draft-recovery.md | 保存读回核验、较新输入保持 dirty、检查点结算 | 41578330B9F8518EE4E50003293358867FB8F8469AD0292AADEEED4CE8FF72E7 |
| docs/specs/document-lifecycle.md | tab_uid、lc_review 保存门、晚输入与回执协调 | C7C980E4CD008A5F7DCD7F2A1A6752A11F82E935C720DF24B004C9192BEF5DFF |
| docs/specs/name-search.md | title 可查询但不成为链接身份；刷新／请求门 | A4E03D1F4D9F85D413F3DCECA84923EFD29EB862BF7A1587D816DF19F65902B9 |
| docs/ARCHITECTURE.md | §4 autodown_editor 与双轨／生成纪律 | DB0AA00D8353964DA6F5C5AB7A4B96564CDA4B994C3C06D312A4EB37E100A210 |
| src/front/app.at | 编辑器仅 content/oninput；ActSave；六命令／action／菜单，OpenLink、Edit | 6FC3640963DD975C1CF195BAF28B5768E502EB3545409DBAF737617330B9811D |
| src/front/editor_store.at | Save/Edit/TabActivate/DraftDrainOf、ActUndo..ActSelectAll 的日志降级 | C7FA94F188529B40A03E3D311E3AA4197D27D0F830DB623DA30FDC7BF4DD4C6F |
| scripts/regen-vue.mjs | strict 生成与 dist 新鲜度守卫；gen 不入库 | 52F04E96B0939D8DFED7E812B087EFC18B8A3218F76F2EC3F1406D821598E88A |
| ../auto-lang | 源码观察基线；实际 auto.exe 构建可能落后，work 必须独立记录二进制指纹 | 17292c07e792e80d4e4da5495fc3fc2917e8aa1e |
| ../auto-lang/crates/auto-lang/src/ui_gen/vue.rs | 自动编辑器 prop 发射、通用事件 loop；多参数组件事件有生成测试 | F60FFFFF5AC01F2BF0BEF1BC04D0FF1D3C4E4D8456B04EDA15C5340AC42E73D5 |
| ../auto-lang/crates/auto-lang/src/ui/aura_view_builder.rs | convert_autodown_editor_native 只接 on_change/on_focus 等现有字段，未见 save/link/command 消费 | 45DC50F693341FCB1B8DB208AD48B789854281E47FAE517C7A20C6FECCBC3EE9 |
| ../auto-down | 公开 Vue 编辑器／核心能力只读观察基线 | 895f8d0f9355c9f5ec3ce8fca268bdb768395846 |
| ../auto-down/autodown/packages/engine/src/editor/components/EngineEditor.vue | save(md)、open-wiki-link(title,blockId?)、内部 undo/redo；Save 栏固定渲染，未找到 showActions 消费 | D0DE713E82022CA8303BCB42ABABE9A859F4BE0516E3CF3E52807DF3100C14CE |
| tests/vm_matrix.mjs、e2e/helpers.ts、e2e/playwright.config.ts | 当前结构基线 v26；隔离 fixture；真实编辑器与逐事件输入配方 | HEAD 4f7de84 |

### 4.2 初始接口观察（均非本片运行验收）

| 接口 | 当前 Jade／上游观察 | 核验重点 |
| --- | --- | --- |
| save | Jade toolbar/menu/Ctrl+S 共 ActSave→store.Save；编辑器只监听 oninput。Vue 引擎额外 Save 按钮 emits serialize(engine.doc,true) | 是否能在 Auto 稳定接收；来源 tab_uid／挂载实例与最新输入如何绑定；是否规范化；show_actions 是否真控制按钮 |
| command | 六个宿主菜单 handler 只 console_log；VM／Vue 编辑器内部可有历史／剪贴板快捷键；无已证宿主命令桥 | 六命令逐项可调用性、焦点／选区与历史归属；全局 Ctrl+Z/Y/A 是否抢编辑器和输入框 |
| link | Vue emits open-wiki-link(title,blockId?)；Jade OpenLink 接收已解析 path，不能直接把 title 当路径 | 原生读出、Auto 多参数、alias／stem／anchor 解析与路径映射；缺页／外链安全路由 |
| selection | 内核选区不等于公开宿主选区快照 | 块 ID、偏移单位、跨块、挂载世代与失效 |
| cursor | focusblock(id,height) 是块聚焦，不是 caret 行列 | 无字段不猜坐标；CJK 偏移与光标事件读取 |
| reveal | getBlockMap 是块地图；未证明公开 reveal 调用 | 块／anchor 定位、当前实例、滚动和失败回执 |

show_actions:false 目前只证明生成器发射 :show-actions，不能据此规划“隐藏引擎 Save 即完成修复”。同样，on "open-wiki-link" 的 Vue 生成测试不证明原生事件链存在。接口差异本身是本片必须交付的结论。

已知上游边界：F-24-2 split 前端 boot、F-32-R2 VM 局部槽串扰、F-32-R1 Vue handler 互调未 await、031 多检查点楔死、空文档／切档焦点、F-31-R1 engine dist 新鲜度；033 多套件时序 F-33-R1 保留。不能把新增接口缺证归为上述缺陷后宣称全可用，也不在本片修复它们。

### 4.3 授权

用户指令为“计划033已经完成；请规划下一个计划”，延续 auto-plan-new。允许本次读相关本仓／上游材料、创建下一 Plan 并更新分析路线图；未授权本次实施、canonical Specs 改写、兄弟仓写入、发布或自动继续 work/review/merge，无时间／token／工期预算。r1 提议的工作范围是能力调查、隔离探针及文档交付，不能写成用户已经批准完整编辑器或跨仓改造。

## 5. 详细设计

### 5.1 六能力矩阵与入口盘点

新附件 docs/plans/attachments/034-editor-host-contract.md（工作阶段新增）每项至少记录：能力、平台／载体、内核符号、公开入口、Auto 语法／参数、Jade 触点、期望结果、实际结果、证据文件／代码 revision、状态、缺口所属仓与重入条件。另列六命令 undo/redo/cut/copy/paste/select-all，不以一个“command 有／无”替代逐项结果。

盘点所有现有保存／编辑菜单／action／快捷键、引擎 Save、正文内链。补齐无文档、正文聚焦、菜单夺焦、属性／查找输入框聚焦时的效果。未证明可靠的功能按未可消费记录；源码审查可证明转换层未接字段，必须给完整追踪及最小运行观察，不能仅凭一次点击无反应判定“缺供给”。

每类最小原型一次，失败后针对一个明确假设复测一次。成功记录实际契约；明确缺供给记录具体缺层；仍无法判定记录受阻、缺失证据、负责模块和重入条件。调查可如实交付有 owner 的受阻结论，但不能写成该能力通过。此边界是研究组织约定，不是用户指定预算。

### 5.2 保存消费与身份契约

后续保存必须进入现有 Store.Save 的正文／路径／修订快照、读回核验、草稿结算和 lc_review 门；不允许新 onSave 直接 write_wiki。输入同步仍以 Edit 更新 Store；不得用较旧 save(md) 覆盖最新 Store 正文。

调查方案必须说明：①来自哪个 tab_uid 和编辑器挂载世代；②事件触发时的已确认正文修订，输入／composition 是否已冲刷；③切页／关闭／重开后的迟到事件如何拒绝；④单次 Ctrl+S／按钮如何避免宿主与引擎重复保存；⑤未命名另存取消、写失败、读回失败、等待中新输入时如何沿用既有终态。

仅传 md 且在收到事件时读取 active_key，不构成可靠来源身份；key 可因 Reload 或路径操作改变，tab_uid 又不等于编辑器世代。不能凭两个页面正文相等推断来源。若没有可消费来源字段／挂载绑定机制，列为具体供给缺口。后续可选“可靠接入”或“有效控制组件动作栏并只保留宿主入口”，两种方案都须真实验证，当前不假设 show_actions 能用。

### 5.3 命令、链接与位置契约

- 命令由编辑器拥有历史栈、选区和执行；宿主传稳定实例身份、命令名和请求标识，收到成功／不可用／失效／失败回执。测试证明焦点恢复不会令目标变成菜单／查找输入框；无支持的菜单需由下一实施片明确禁用／提示，不能只打 console 日志或伪造成功。原生快捷键内部可用与宿主调用分别记录。
- 链接事件需表达 target 与可选 anchor／source block、来源实例；映射继续消费后端现有四级解析规则，title 不成为身份。OpenLink(path) 是开档口，不是 title resolver。链接解析／缺页确认／外链白名单及跳转失败给独立规则；不能把未解析 title 直接拼 .ad 打开或重写磁盘。
- selection/cursor/reveal 要明确偏移单位、块 ID 稳定域、挂载世代、不可定位回执；块聚焦不充当光标行列、打开页不充当定位成功。当前已有 anchor 透传但缺定位供给时如实报告。正文精确定位留给后续 R-08/R-11。

### 5.4 供给分工与出口

供给附件逐仓列最小改动层、拟议接口（标明尚非现行 API）、载体、必要测试与兼容约束：auto-down 负责引擎公开动作／事件／动作栏的消费；auto-lang 负责 VM 原语／事件读出与 Auto 生成映射；jade-edit 负责 Store 门、链接业务、菜单入口和错误反馈。必要时只读定位 auto-edit 的可复用宿主契约，不复制 code_editor 实现。

出口决策分为「本仓可直接消费的接线片」「需上游解锁的供给片」「位置能力后续片」。缺供给项写明负责仓、最小验收和可开始本仓 work 的解锁证据；不在本 Plan 中跨仓实现，也不承诺上游将何时交付。不预分下一业务号。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/editor-host-capabilities.md §1 当前能力与载体 | 缺局部宿主规范；新增六类接口、六命令、三载体的证据矩阵，逐项区分内部能力／公开入口／已接线与受阻 | 避免把单轨 emit 或内部快捷键当全轨可调用 | AC-01, AC-02, AC-03, AC-04, AC-06 |
| SD-02 | add | docs/specs/editor-host-capabilities.md §2 消费约束 | 新增可靠事件来源、保存共门、命令历史归属、链接身份与位置语义的设计要求；明确这是后续接线条件，不是功能已实现 | 后续实施保护既有安全与身份契约 | AC-03, AC-04, AC-05, AC-06, AC-07 |
| SD-03 | add | docs/specs/editor-host-capabilities.md §3 缺口与交接 | 新增按仓供给需求、解锁证据、可执行范围、已知限制和重入条件，注明 R-03 整体未交付 | 调查有具体出口，避免循环研究或扩大授权 | AC-01, AC-07, AC-08 |

本阶段只提议增量。工作阶段按实际证据落位新规范，在 ARCHITECTURE §4 添加指针；不修改四个既有局部 Specs 或把 proposed 接口写成现行支持。

## 6. 测试设计

新增 tests/probe_editor_host.mjs 与 e2e/editor-host-capabilities.spec.ts（均为拟新增）。探针生成隔离最小 .at 宿主并记录原始事件／实际回执；Vue 生成形状检查只能证明生成，不替代真组件调用。针对不可达事件，保留诊断／事件计数／转换层追踪，预期缺能力案有自己的结果标签，不能当作功能成功测试。

语料：具名非空 A/B、同正文不同路径双页、带中文标点／中英混排／代码块与 wiki anchor 的源页、alias 与显示 title 不同的目标页。保存取文件字节、Store 修订／dirty／草稿字段，不只看“saved”文案；同正文切页案验证不能靠正文相等识别事件来源。菜单命令测试历史一次变更与选区作用，不靠整文重设模拟。剪贴板用测试哨兵并恢复原内容，原内容不入日志；IME 可自动证明提交事件时序，不能替代未测的实机组合态。

每轨单独记录：生成与运行版本、source 与 binary/dist 是否一致、真实键入／点击／事件、返回字段、文件／状态前后。split boot 若 F-24-2 重现记受阻，merged 与 Vue＋split 后端只覆盖各自范围，不能替代原生 split 前端接口证明。旧多检查点限制用短进程探针隔离，不降低关键来源／保存终态要求。

本片生产源码与布局不变，结构基线保持 v26；无需重锁和全量应用回归。新增探针／规范交付后跑目标核验、pnpm build 与 git diff --check；只有实际改了受影响共享测试配方才补跑对应现有套件。新测试即使以预期“缺供给”通过，也必须报告「调查通过、接口尚不可用」。

## 7. 验收标准

| ID | 可观察交付与判据 | 验证 |
| --- | --- | --- |
| AC-01 | 矩阵完整包含六接口×三载体；command 再展开六命令。每格有版本、语法／符号链、状态、证据，受阻有 owner／重入条件；source、binary、dist 分列 | 附件逐格审阅与探针证据 manifest；不能以空格／“待研究”通过 |
| AC-02 | 当前入口清单覆盖 toolbar/menu/Ctrl+S/引擎 Save、六 action／菜单／快捷键、正文链接；证明监听存在与否、实际结果，以及 show_actions 真消费或缺口 | 最小生成物、真组件事件／按钮观察、原生消息追踪和源码锚点 |
| AC-03 | save 能否公开消费有确定或受阻结论；保存设计覆盖 source tab_uid／挂载世代、输入冲刷、重复触发、同正文切页、迟到事件及失败／取消／新输入终态，复用原 Store 门 | 原型来源与事件记录、同正文双页反例、设计与安全 Specs 对照；缺来源时明确列供给缺口 |
| AC-04 | 六命令逐项区分内部快捷键和宿主调用；编辑器／查找输入框焦点、选区／历史归属、不可用反馈和全局热键冲突均有观察与下一片处理建议 | 各轨最小键程／调用结果；供给缺失有原语／转换层定位；不把日志当执行 |
| AC-05 | link 事件参数与原生读出有证据；设计明确 target→现有四级 resolver→path、alias/title/anchor 边界和缺页失败，不能将 title 当 path | alias／首页非身份／anchor 语料、参数记录、wsys.resolve_target 对照；缺读出有供给要求 |
| AC-06 | selection/cursor/reveal 分别有公开可消费／缺供给／受阻结果及拟议返回语义，明确块聚焦≠caret、开页≠定位、偏移与实例稳定域 | 公开符号链、最小探针或缺层证据与位置接口表 |
| AC-07 | 供给附件按仓明确最小接口、变更层、验收、兼容和解锁条件；结论把本仓消费与上游供给分开，生产业务源码及真实用户文件不变，旧四个 Specs 承诺不变 | 提案字段审阅、源码／Spec SHA256、隔离路径检查；无跨仓提交／写入 |
| AC-08 | 可重跑目标探针与 Vue 核验，预期缺能力／载体阻断单列；新能力 Spec 与三项 SD 一致，未支持接口不写为已实现；路线图只标 R-03a 的阶段状态，不标 R-03 完成 | 命令与结果证据、Spec/Plan/路线图对照、构建及 diff 检查 |

## 8. 执行步骤

### T-01 载体、入口盘点与最小探针

- 依赖：无；首项。只读 src/front/app.at/editor_store.at、pac.at、scripts/regen-vue.mjs、现行四个 Specs、auto-lang 转换／生成文件与 EngineEditor.vue；按现有 tests/vm_matrix.mjs、e2e/helpers.ts/config 创建隔离配方。
- 新增 tests/probe_editor_host.mjs、e2e/editor-host-capabilities.spec.ts 与 docs/plans/attachments/034-editor-host-contract.md。脚本支持明确的新参数 --phase inventory/save/commands/navigation/all（本工作新增，不是现行参数），输出六能力矩阵骨架、完整入口表及工具链指纹；e2e 用 --grep 对应小案。
- 验证：node tests/probe_editor_host.mjs --phase inventory；pnpm build；pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts --grep inventory。盘点、Save 栏／show_actions 的实际结果与两轨生成／读出证据落表，binary/source 不一致时如实说明；不可启动的载体写精确 blocker。
- 对应 AC-01/02/07/08，SD-01/03。

- [x] T-01 [✅ 已完成 2026-10-02] 三件新增落位：tests/probe_editor_host.mjs（--phase 四相位+all；merged 探针工程直调双编辑器+候选事件绑定+六命令 action 捷径+MCP 合成驱动 autoui_action/keyboard；onfocusblock 多参 handler (int,float) 编译通过零回退）+ e2e/editor-host-capabilities.spec.ts（inventory 小案）+ attachments/034-editor-host-contract.md（指纹/入口表/矩阵 T-01 判定列）。验证：node tests/probe_editor_host.mjs --phase inventory 全绿（EXIT=0——M1 双编辑器 textarea lowering+候选绑定声明显形/M2 INPUT_TEXT 全文逐字节含 CJK/M3 save+link 零回执+click 直写 ghost state 不经 DSL handler[PLAN-044 T6 锚定 UNSUPPORTED]/I5 Ctrl+S→宿主回执/B1 探针工程原生 split boot 成功[最小宿主无 F-24-2——jade 应用阻断不翻案]/vue 形状：@save+@focusblock 发射·@openwikilink 名不匹配[kebab 缺口]·:show-actions/:can-edit attr 透传）；pnpm build 绿；e2e --grep inventory 1/1。指纹：auto.exe v0.4.2-2511-dirty/auto-lang 0aa3a669-dirty/auto-down 895f8d0/engine dist 10-02 stamp。

### T-02 保存／命令能力与输入归属核验

- 依赖：T-01。扩探针 save/commands 相位与 e2e 同名小案，记录 .Edit/.ActSave/store.Save、公开 save(md) 能否被 Auto 消费、六命令／原生快捷键／焦点情况；仅在隔离探针中测试候选接线，不改生产 src。
- 输出附件的保存来源／输入／重复／迟到决策、六命令矩阵、可靠接入与动作栏统一的可行性。无法绑定来源／无法控制按钮就写具体缺口，不把当前 active_key 或 md 相等当替代。
- 验证：node tests/probe_editor_host.mjs --phase save；node tests/probe_editor_host.mjs --phase commands；pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts --grep 'save|commands'。事件／文件／状态结果与各项结论一致，缺能力案明确标 unsupported，真实受阻独立列出。
- 对应 AC-01/02/03/04/07，SD-01/02。

- [x] T-02 [✅ 已完成 2026-10-02] probe save 相位全绿（S1 同正文双页+active 恒指 A 事件源于 B——md 单参载荷零来源字段=身份缺口直证；B 键入零串扰 A 通道独立；S2 编辑器 save 回执恒零+宿主捷径唯一入口）；probe commands 相位全绿（C1 六命令宿主通道回执 6/6[捷径三件+按钮三件]且正文零变化=执行桥缺失直证；C2 key_press backspace 真实按键同构回执续发+'ctrl+z' 词表拒绝[Invalid keyspec 实录——PLAN-057 v1 词表无修饰键]且零回执零突变；C2 探针动作修正：c:Z 单字符形态会被接受为字面键入不作为修饰键证据——改提交词表外键名取拒绝原文）+ C2 探针缺陷修正一件（element_id 回退对象形——修复后重跑）。e2e --grep 'save|commands' 2/2（引擎 Save 钮点击零落盘+脏标保=未接线直证 vs 宿主 toolbar/Ctrl+S 真落盘三验+单次无双保存面；引擎内部 Ctrl+Z 真键撤销生效 vs 宿主菜单撤销零效果=console 降级直证；Ctrl+A 并行零破坏；Ctrl+Shift+O 被 'Ctrl+o'→ActOpen 抢占实录[keymap Shift 丢失在录面]）。附件 save/command 判定列终判落表。

### T-03 链接／位置能力与逐仓供给设计

- 依赖：T-01，保存／命令方案消费 T-02 结果。只读 src/back/wsys.at resolve_target/extract_links_json、app.OpenLink/CreateClick、Auto 通用多参数事件／VM 读出，以及引擎公开链接／块地图；补 navigation 相位，覆盖 link/selection/cursor/reveal。
- 新增 docs/plans/attachments/034-editor-host-supply.md，按 auto-down／auto-lang／jade-edit 写最小需求、提议接口、参数／回执／失败、各轨验证与兼容门。建立本仓可直接实施与需要上游先交付的列表，不修改上游，不为后续片占正式号。
- 验证：node tests/probe_editor_host.mjs --phase navigation；pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts --grep navigation。四类结果字段／来源／位置边界按已知语料记录；提案与四级身份及现行 Store 保护一致。
- 对应 AC-01/05/06/07/08，SD-01/02/03。

### T-04 规范沉淀与后续决策交接

- 依赖：T-02/T-03。工作阶段新增 docs/specs/editor-host-capabilities.md，落位 SD-01..03（当前证据、后续消费要求、逐仓缺口）；在 docs/ARCHITECTURE.md §4 仅加指针。更新路线图的 R-03a 已交付／待复审状态，不宣称 R-03 接线完成。
- 验证：node tests/probe_editor_host.mjs --phase all；pnpm build；pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts；git diff --check。目标调查结果可复跑、证据／Spec／供给表一致；生产 src 与四个旧局部 Specs 的 hash 保持。共享配方若改动，补跑它实际影响的现有套件并说明原因。
- 交接：汇总实际 revision、工具链、每项状态与缺证；推荐具体下一片和前置解锁证据。按 auto-plan-work 转交 review；复审验证研究契约与实证，不以需要上游供给否决已如实交付的调查，也不把调查 pass 写成能力全支持。
- 对应 AC-01..08，SD-01..03。

执行顺序 T-01→T-02→T-03→T-04，尚未实施。研究边界仍无法判定的项可按受阻交付，前提是证据／owner／重入条件完整；如果连入口／载体／规范不变量都无法核实，则本片相应 AC 不通过，先补证据或记录 Plan blocker，不自动扩大跨仓范围。

回退：删除／回退新增测试与规范提交即可，无用户数据迁移；临时探针只在隔离目录清理。供给提案不改现行 API。完成本片后仍必须为实际功能接线建立实施验收。

## 9. 复审记录

- 2026-10-02T04:10:23Z：stage: new；plan_id: PLAN-034；plan_revision: 1；outcome: pass；next: work（能力核验与契约交付，按用户执行指令进入工作阶段）。
- 新增 T-01..04、AC-01..08、SD-01..03；已确认 033 归档与当前实现，未知机制由有界探针和明确供给出口负责，不承诺完整 R-03 功能在本仓立即可实施。
- 本记录是规划交接，非实现复审。此次未运行应用／接口探针、未改生产代码或 canonical Specs、未自动继续 work/review/merge。
- 2026-10-02T07:10:00Z：stage: work | plan_id: PLAN-034 | plan_revision: 1 | outcome: executing（T-02 完成）| code_commit: 013ad6f(T-01)+本批 | task_ids: T-02 | evidence: probe save/commands 相位全绿 + e2e save|commands 2/2 + 附件判定列终判 | blockers: 无 | next: T-03（navigation 与供给附件）。
- 2026-10-02T06:30:00Z：stage: work | plan_id: PLAN-034 | plan_revision: 1 | outcome: executing（T-01 完成）| code_commit: 08d7c08(落档)+本批 | task_ids: T-01 | evidence: 探针 inventory 相位全绿（probe_editor_host.mjs）+ e2e inventory 1/1 + pnpm build 绿 + 附件 034-editor-host-contract.md T-01 判定列落表 | blockers: 无 | next: T-02（save/commands 核验）。工作树=主检出（直接 main 线性惯例 001..033 在册）。

## 10. 待澄清事项

本次规划无需等待用户补充信息。工作阶段 T-01 负责 actual binary／dist 与源码版本、split 载体可启动性；T-02 负责 save 的来源身份／输入顺序、动作栏控制与命令桥；T-03 负责 link/selection/cursor/reveal 读出与调用。

当前未授权跨仓实现。若结论需上游新增接口，产出具体供给契约后，在对应仓独立规划／执行；不以“核查接口”自动改引擎和编译器。R-03b 的范围与编号届时根据实际结果确定。R-05 纯壳可另规划，但本片不擅自改变路线图优先级或把完整命令桥留作无记录欠账。
