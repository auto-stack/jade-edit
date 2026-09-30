---
plan_id: PLAN-030
status: reviewed
feature_name: 安全手动重载（可信试用首切片）
author: [agent]
created_at: 2026-09-30T12:29:31Z
updated_at: 2026-09-30T21:45:00Z
plan_revision: 1
current_step: 5
total_steps: 5
supersedes_spec_components: []
new_spec_components:
  - docs/specs/editor-safety.md
touched_goals:
  - docs/analysis/2026-09-30-delivery-roadmap.md R-01
---

# PLAN-030：安全手动重载

## 0. 变更摘要

把用户从 F5、菜单和工具栏发起的重载改成受保护流程：未保存文档先确认，取消不变，明确放弃后才读盘；读失败或请求过期不能丢失当前正文。

本 Plan 是 [执行路线图](../analysis/2026-09-30-delivery-roadmap.md) R-01。完整持久化草稿恢复、自动保存、外部版本冲突与多文件生命周期保护由后续候选承担，本片不宣称已完成这些能力。

## 1. 目标

- G-01：用户输入后立即从任何手动入口重载，都能得到一致的未保存保护。
- G-02：取消保留正文、脏标、磁盘和当前文档；放弃操作有明确文案与固定目标。
- G-03：干净文档仍能读取磁盘外改；缺档、读取异常、目标/内容变化均不清掉用户正文。
- G-04：vm merged 与 Vue 同日验证；内部业务同步重读保留现有调用边界并回归。

非目标：持久化草稿/崩溃恢复、版本历史、保存并重载选项、自动保存、外部编辑自动合并、重命名/移动/合并事务的全面草稿保护、编辑命令接线、布局重构、上游代码修改。特别是“放弃修改”目前是经明确确认后的放弃，不宣称能在下次启动恢复；后续 R-02 增加持久化恢复。

涉及仓库：jade-edit。涉及模块：src/front/editor_store.at、src/front/app.at、tests/vm_matrix.mjs、e2e/；后端契约保持现有 read_wiki/exists。本批允许只读上游接口调查；写入其他仓库需要独立明确范围。

成功样：输入 LOCAL_A（未保存），磁盘另有 DISK_B；F5 弹层“重载会放弃此文档未保存的修改”；取消仍为 LOCAL_A；明确放弃后为 DISK_B；读取失败或弹层目标变化时仍保留 LOCAL_A。

## 2. 架构方案

分离用户请求和内部重读：

1. App 现有用户 handler `.Reload`（actions view.reload/F5、工具栏和视图菜单共用）改委托新 `store.RequestReload`。
2. Store 新增手动请求、取消、确认和受保护读盘流程；现有 `store.Reload` 是内部业务同步口，已有改名/移动/目录操作调用保持。两种入口在注释和规范中明确，不能误把内部同步改成随机弹层。
3. 提示开态与目标快照放 Store；弹层保留 App 根视图，符合 VM 自动化定位约束。
4. 手动读盘结果只提交给发起时的文档身份；等待期间若文档关闭、身份变化、活动页切换或正文又变更，取消结果覆盖并给可读提示。

手动入口新增安全语义，内部业务事务的脏页风险不由这项完成。T-01 盘点结果如果发现用户入口绕过 RequestReload，必须纳入本项；如果发现内部风险，记录到路线图 R-02，不能称为已修复。

## 3. 技术栈

保持 Auto 单源 src/front/*.at、AutoVM merged/split 与生成 Vue3；编辑器仍为 @autodown/engine。现有 alert-dialog 和普通按钮变体用于确认；后端消费 read_wiki/exists POST。测试沿用 Node VM 矩阵与 Playwright。

不手改 gen/front/vue 作为正式实现。若需要接口供给，以 T-01 的能力结果为准，按 needs_replan/blocked 交接，不用只对 Vue 有效的旁路凑两轨通过。

## 4. 需求分析与背景调查

### 4.1 规范现状

本仓当前没有 docs/specs/。legacy 规范以 docs/ARCHITECTURE.md 为主：§3 定义 Store 文档事实源/显示投影，§4 编辑器消费，§6 测试交集，§7 单源与双轨纪律。不能因缺少新式 Specs 就忽略这些约束。

本片提议在实施时新增局部 docs/specs/editor-safety.md；不迁移其他模块，也不在 new 阶段修改 canonical 文档。

### 4.2 当前代码与测试

- editor_store.at `.Reload` 无 dirty 守卫，读成功即替换 body/original_body 并清 dirty；读异常虽不替换，但无完整手动失败流程。
- app.at `.Reload -> store.Reload()` 是三类手动入口共口；内部另有四处直接 `store.Reload()`，供改名、移动和目录迁移同步。
- Store 已有关闭脏 tab 与退出确认形态；App 根层已有 alert-dialog 可复用。
- tests/vm_matrix.mjs check 6 和 e2e/matrix.spec.ts 的 reload 场景验证的是干净文档读取外改，没有验证脏文档取消与放弃。
- e2e 的 D-17 注释记录编辑器输入可能在 blur 才回传。T-01 必须用“持续输入后直接 F5”验证现势；测试额外点击空白不能替代该用户场景。
- active_path 在 untitled 时为空；用户重载应给“请先保存此文档”等提示且不读盘。
- 读取空正文可能合法，不能以 body=="" 判断失败。缺档用 exists 与现有异常语义判断；外部文件在读取中变化的完整修订协议属于后续 T-保存协议。

### 4.3 版本锚

基线 main@9ab1b5790cf2c564f5e606a0d7ded3abc83b3252。以下 SHA256 是草拟时证据，不是执行期可跳过重读的理由：

| 文件 | SHA256 |
| --- | --- |
| docs/ARCHITECTURE.md | 4326A2EADC1054E415388A040E1787614E3453B9C945FC5475B1A8D96AFEDE4A |
| src/front/editor_store.at | F25C85EEE0A677304E65E135F700CBC77CD378426DFAB179C61F3D53B262326B |
| src/front/app.at | B9AB4BF1C86DB1853D326FC3B2FB0750B961CDE269F8121261D095EA6187D124 |
| e2e/matrix.spec.ts | 5065C87AA5D2ACD44DFF18DFC68246FCE6C95E5381818D4B0CAD4D60740F6AD6 |
| tests/vm_matrix.mjs | 0426171E14CC5AEA31B5700E6A96C391EA9B3975AA2237ADE459518C2AFBD4D2 |

发布说明 P≤200、split boot 独立缺陷及基线 v20 仍是现有边界。本片不是扩大规模或修上游缺陷的授权。

### 4.4 已有授权

用户先要求系统产品分析，随后问“上述的修改，如何做成计划去执行？”。本次已授权产物是执行路线图及详细计划草案；没有把全部建议视为已批准实施的范围。未指定工时、token 预算、版本号、自动持续执行或跨仓写入。

本次 new 只写 Plan/路线图，未实施、未合入、未发布。后续 work 使用用户对本 Plan 的执行指令；不能从 status:drafting 推断批准了云同步或整套改造。

## 5. 详细设计

### 5.1 状态与目标固定

建议最小 Store 标量：reload_confirm_open、reload_target_key、reload_target_path、reload_target_body。它们是新字段；取消/成功/失败/失效后归零，目标 body 只在请求期间保留。本体仍由 tabs 管理，不新增第二份持久文档权威。

RequestReload 基于真实已同步的正文与 dirty 判断。新消息名 RequestReload / ReloadCancel / ReloadDiscard / ReloadReadOf 为拟新增；ReloadReadOf 若需载荷使用单 map，遵守既有单载荷限制。T-01 验证调用、快照和生成器行为后可作等价命名调整，并记录证据。

身份判定按 tab key + path，不能只依赖列表索引。弹层确认时先校验目标仍为活动页、存在且正文等于提示时快照；读盘结束再校验，避免 HTTP 等待期间的新输入被旧结果抹掉。遇变化给“文档已变化，请重新发起重载”，关闭待确认态并保留当前正文。

### 5.2 用户行为表

| 条件 | 行为 | 不变式 |
| --- | --- | --- |
| 无文档或未命名文档 | no-op/可读提示 | 不访问空路径，不改变内容 |
| 有路径、干净 | 直接进入受保护读盘 | 不先清 dirty，不改磁盘 |
| 有路径、未保存 | 打开确认，不读盘 | 正文、原文基准、dirty、磁盘保持 |
| 取消/Escape/关闭确认 | 结束请求 | 当前内容与磁盘保持 |
| 明确放弃且目标一致 | 读成功后替换目标及活动投影 | 只改此 tab，原文基准变为读回正文，dirty=false |
| 缺档/读取异常 | 失败提示 | 不替换正文，不清 dirty，不关闭文档 |
| 请求过期/目标变化 | 拒绝覆盖 | 不改其他 tab 或新输入 |
| 真空文件 | 正常加载空正文 | 不将合法空文当读取失败 |

首版确认文案：“重载会放弃此文档未保存的修改”；按钮“取消”和“放弃修改并重载”。默认聚焦安全选项，Enter 不应意外触发放弃；标题、文档身份与提示可读。避免承诺不存在的版本恢复。

### 5.3 UI 与调用边界

App 根新增确认弹层与三个薄委托；所有用户重载入口继续共用 actions handler，不复制三套安全判断。关闭/退出确认的现有含义保持。

内部 Reload 调用先列清单再回归；本片新增的用户确认不会介入已完成的重命名/移动流程。测试证据明确“保护手动重载”范围。后续生命周期保护 Plan 可以再统一两类入口与事务规则。

### 规范增量

| delta_id | add/modify/retire | docs/specs/... target | before/after rule | rationale | acceptance IDs |
| --- | --- | --- | --- | --- | --- |
| SD-01 | add | docs/specs/editor-safety.md（新）§手动重载 | 现为无脏态保护；改为三入口一致、取消不变、确认后加载 | 防止误重载丢失编辑 | AC-01、AC-02、AC-03 |
| SD-02 | add | docs/specs/editor-safety.md（新）§结果提交 | 现无请求目标/正文有效性门；改为身份与内容复核，失败不清状态，空文合法 | 防失败、迟到与错误目标覆盖 | AC-04、AC-05、AC-06 |
| SD-03 | add | docs/specs/editor-safety.md（新）§边界与验证 | 区分手动请求和内部同步、说明非持久恢复，两轨证据齐备 | 避免把局部保护误报完整数据安全 | AC-07、AC-08 |

规范新增在 work 阶段按提案落盘，review 核对实际行为，merge 才最终沉淀。旧 ARCHITECTURE 的接口/单源约束继续适用；若需增加引用，作为本 Plan 的局部文档 delta，不重写历史。

## 6. 测试设计

使用独立复制的 fixture，所有磁盘比较记录原始字节。隔离路径必须在当前工作树授权范围内；运行现有清理脚本前先复核其解析后的绝对目录，不能触及真实用户库。

- Vue：新增 e2e/reload-safety.spec.ts（新路径）。复用 visibleEditor/appendToEditor 的实际结构，创建专属页面并验证：三入口、取消、明确放弃、立即 F5、合法空文、缺档、请求过期。不能为了让保护通过而预先加中性 blur。
- Vue 读取异常/迟到：用 Playwright 针对 read_wiki 的请求拦截制造 5xx/延迟，响应前再输入或切页，断言正文不被覆盖。单独记录测试装置，不污染生产客户端。
- VM：tests/vm_matrix.mjs 扩 reload 组；确认开态/dirty/body 走 state，操作锚留根；磁盘字节直读。不为读取异常写生产故障注入 API；缺档与目标变化至少覆盖，异常失败由 Vue 拦截与 Store 错误门证据补齐。
- 内部重读：现有 rename/file/目录合并/tab remap 弧线维持；关闭/退出确认回归。
- 基线：新增状态/弹层必然改变 structure-v20；先审查预期差异，再重锁新结构基线（按现目录下一个版本命名，预期 v21），更新矩阵引用。不可直接接受未解释的差异。

实施后的验证命令：

```text
pnpm build
pnpm exec playwright test -c e2e/playwright.config.ts e2e/reload-safety.spec.ts
node tests/vm_matrix.mjs --arm merged
pnpm test:e2e
node tests/vm_matrix.mjs --arm split
```

预期：build/目标 Vue 测试/merged/完整 Vue exit 0，覆盖 AC 并记录版本。split 若重现已登记 boot 缺陷，记录原始失败及旧载体对照，按既有分段口径评估；新保护行为不可静默 skip。若涉及后端变化则本契约失效，先修订再选择相应 probe 回归。

文档计划阶段不运行上述应用回归；本次只做契约路径、编号、AC/T/SD 覆盖和格式检查。

## 7. 验收标准

| ID | 可观察行为 | 具体验证及预期 |
| --- | --- | --- |
| AC-01 | F5/菜单/工具栏对未保存页先确认，包含直接输入后立即重载 | 两轨逐入口；提示前不读 read_wiki，不清 dirty；最新输入仍在 |
| AC-02 | 取消、Escape 或关闭确认不丢修改 | body/original_body/dirty/key/path 与请求前一致；磁盘 bytes 不变；弹层关 |
| AC-03 | 明确放弃后只加载原目标 | LOCAL_A 与 DISK_B；成功后目标正文与基准为 DISK_B、dirty=false，其他 tab 与磁盘 bytes 不变 |
| AC-04 | 干净页正常重载，未命名页不读空路径，合法空文正常加载 | 已有 check 6 + 专属空文/untitled 案；body 正确，空文成功且无失败误判 |
| AC-05 | 缺档或异常不丢正文、不清脏标 | 删除专属 fixture/5xx 拦截；body/基准/dirty 保持、可读失败状态 |
| AC-06 | 提示/读盘期间目标或正文变化拒绝旧结果覆盖 | 关闭/改身份/切页/新输入/延迟回执；当前正文及其他 tab 保持，提示需重试 |
| AC-07 | 现有内部同步重读、关闭/退出流程无新增回归 | merged 与 Vue 既有 rename/file/tab/quit 弧线通过；结构变化仅批准字段与弹层 |
| AC-08 | 完成单源实现、局部规范与双轨证据 | src 单源与 regen 一致；SD-01..03 落档；记录真实限制，不宣称持久草稿恢复 |

## 8. 执行步骤

- [x] **T-01 能力核查与决定**。依赖：无。文件/符号：editor_store.Edit/Reload、App.Reload、AutoDownEditor 输入回传、根 alert-dialog。创建 docs/plans/attachments/030-reload-capabilities.md（新），确认立即 F5 是否回传最新内容、单 map 消息/目标快照/确认 Escape 与焦点行为，列手动与内部所有入口。调查限定一次最小探针与一次确认复测。验 AC-01/02/06/07 的前提；可本仓实现则进入 T-02，否则给缺失接口/负责模块/重入条件，记录 blocked 或 needs_replan，不降验收。验证：两轨最小实操与生成源检查，预期能力清单有证据和明确出口。[✅ 已完成] 结论=可本仓实现零 blocker（[attachments/030-reload-capabilities.md](attachments/030-reload-capabilities.md)）：C1 两轨逐键同步实证（vue 探针 A 无 blur 未保存即现 + engine 0.5.0 emitUpdate 逐变更发射[D-17 门控已退]；vm INPUT_TEXT 口探针 V1 + native_projector 结构证据）；C2 vue F5 编辑器内现势死键（actions 层守卫，探针 B 无动作无导航）→ 等价调整①F5 移交 `bind {}` 层（464 T2 焦点内 F 键可达 + preventDefault 压浏览器刷新）+ action 去 shortcut；C3/C4 焦点外 F5 与 vm toolbar 现势不安全重载直证（探针 C/V2：LOCAL_A 被 DISK_B 静默替换）；C5 弹层族 vue Enter=取消安全默认+焦点=取消钮实测、Escape 走 v-model 双向、vm Modal Esc 不关；C6 等价调整②零载荷四消息即可（handler 内联 await read_wiki，无需回执消息载荷）；C8 入口清单=手动口唯一 App.Reload@2215 + 内部四口 RenameGo/MoveGo/RenDirGo/MoveDirExec。探针一次性件 e2e/.runtime/p30-probe/（ignored）。
- [x] **T-02 受保护状态流程**。依赖：T-01 可行结论。修改 src/front/editor_store.at，新增 RequestReload/ReloadCancel/ReloadDiscard/受保护读取，不改变后端契约。实现身份快照、前后提交门、合法空文与失败保留。覆盖 AC-01..06。验证：目标测试开发中逐案核对 body/original_body/dirty 与磁盘；无法保持任一不变式先修，不进入合入。[✅ 已完成] store 新增五标量（reload_confirm_open/reload_target_key/reload_target_path/reload_target_body/reload_nonce——第五字段为 T-04 开发期发现的 vue 轨引擎 round-trip 回声污染修复，见 T-04）+ 四零载荷消息（T-01 C6 等价调整：无回执消息，read_wiki 内联 await 后就地复核）。门语义：身份=key+path 双查（索引无关）；前置门（活动页+正文==快照）→ exists 缺档卫 → try/catch 读盘 → 读后门（tab 仍在+正文未变+仍活动页）→ 提交（body/original_body=读回文、dirty=false、nonce 递增改 key 重挂载播种）或失效拒绝（"文档已变化，请重新发起重载"）；终态快照归零；untitled（path==""）提示不读盘。开发中逐案核对=confirm-vm 探针五弧（e2e/.runtime/p30-probe/confirm-vm-result.txt：N1 确认开未读盘/N2 取消全保/N3 放弃换文 dirty 清/N4 干净直入/N5 缺档保文）全过。
- [x] **T-03 用户入口与确认 UI**。依赖：T-02。修改 src/front/app.at 的用户 Reload 薄委托，根弹层与消息；保留内部 store.Reload 调用边界。覆盖 AC-01/02/03/07。验证：pnpm build + 两轨三入口/取消焦点/连续输入立即 F5；预期不需要额外点空白才能保护。[✅ 已完成] app.at 五处：①`.Reload -> store.RequestReload()`（用户口薄委托）+ ReloadCancel/ReloadDiscard 薄委托；②根弹层第四实例（标题「重载「${active_title}」？」+ 文案"重载会放弃此文档未保存的修改" + 取消在前=初始焦点安全默认）；③action view.reload 去 shortcut（T-01 C7——双层并存焦点外双派发）；④widget 级 `bind { "F5" -> .Reload }`（464 T2 层——编辑器焦点内可达 + preventDefault 压浏览器刷新）；⑤内部四口（RenameGo/MoveGo/RenDirGo/MoveDirExec）store.Reload() 原边界零变化。pnpm build 绿（strict 生成 + vue-tsc + vite ✓built）。立即 F5 实测=e2e ①a（appendToEditor 后焦点在编辑器直接 F5 → 弹层现，无 blur 无点空白）；取消焦点=vue 探针 D（activeElement=取消钮、Enter=取消）+ vm Modal 结构性无 Esc 面。
- [x] **T-04 目标验证与回归**。依赖：T-03。新增 e2e/reload-safety.spec.ts；扩 tests/vm_matrix.mjs；按已解释 diff 重锁 tests/baseline 新版本。执行 §6 命令，留代码 hash、载体、fixture 和日志。覆盖 AC-01..08 的行为证据；完整回归新红必须定位，已有独立上游红按登记口径分段，不伪报全绿。[✅ 已完成] **载体**=auto.exe debug 09-30 16:01（v0.4.2-2311-g7fcf913eb，与 029 merge 记录同档零换档）；**fixture**=D:/autostack/auto-down/tmp/wiki-demo 隔离拷贝（e2e/.runtime/workspace + p30-vm-ws/p30-vm-ws2，ignored）；**一次性探针**=e2e/.runtime/p30-probe/（probe-vue/probe-vm/confirm-vm/confirm-vue + 结果文本与截图在档）。**测试件**：e2e/reload-safety.spec.ts（新——vue 全弧九段：三入口/取消/放弃对账/干净直入/untitled/合法空文/缺档/迟到拦截；专属目标档 ReloadSafe.ad boot 前落位——matrix [13 file] 删除弧线会移除 Hello World.ad，套内共享工作区下通用档不作依赖的隔离裁定）；tests/vm_matrix.mjs R 组六弧（弹层钮区域锚消歧——多弹层「取消」并存）+ 基线 const/header v21 + rename 组①脏档复原弧改走确认+放弃（原直读形=旧无守卫行为，新语义下同为用户口设计路径——两处同形适配：vm_matrix:2171 与 matrix.spec:930）。**§6 命令实录**：①pnpm build 绿（✓built，strict 零 S001）；②reload-safety 定向 1 passed（7.4s→7.8s 终态）；③merged 臂 **17/17 ALL GREEN**（六检查+基线 v21 零漂移 B+R 组六弧+扩单全组+quit+bootAgain——RecCap 窗 D-21 v11③ 瞬态一次重跑即绿在册惯例）；④pnpm test:e2e **2/2 passed**（matrix 1.3m + reload-safety 7.8s）；⑤split 臂 boot FAIL=F-24-2 **第十四窗**（A/B 对照：stash 本批 src 后基线 src 同窗同形同点 boot FAIL——非本批引入；按既有分段判绿口径：merged 同窗 17/17 + e2e serve-back 同面[split HTTP back] 2/2 + 前端逻辑同源，新保护行为无静默 skip）。**基线 v20→v21 重锁**（tests/baseline/structure-v21.txt）：diff 逐项解释=头部版本史+reload_* 五字段入 dump+active_key "#r1" 后缀[check 6 直入读盘同走 nonce 提交]+console "reloaded:" 前缀+弹层族 vnode id 序列扩——计划内第八例 store 新字段面。**开发期发现三件**（已修/已记）：F-30-R1 reka AlertDialogAction=DialogClose 内部先关弹层（v-model 写 flag=false）再派发 @click——Discard 旗标门恒 no-op（vue e2e ①c 抓获），处置=门挂快照非开态旗标（Escape 残置/闲触 armed 门兜底；既有弹层族动作钮均无旗标门故从未触发）；F-30-R2 vue 轨引擎 round-trip 非字节保真（样本：正文首空行剥除）——commit 磁盘原文经 replaceDoc→onChange→emitUpdate(规范化文)回声 .Edit→dirty 翻真，处置=commit nonce 递增改 tab key→重挂载播种（挂载期 lastEmittedMd 预播种零发射——D-03 在册形态），双轨同源；F-30-R3 上游空文档渲染零可落点块——untitled 键入不可达（新档打字面），非本项范围注记（vm INPUT_TEXT 口结构性可达，e2e untitled 臂与脏无关 path=="" 即提示）。
- [x] **T-05 规范与复审交接**。依赖：T-04。新增 docs/specs/editor-safety.md，必要时为 legacy ARCHITECTURE 增局部引用，核对 SD-01..03 与全部 AC；更新本 Plan 执行记录，交 auto-plan-review。验 AC-08。验证：路径/链接有效，文档不承诺草稿持久恢复或内部事务全面保护，证据绑定实际实施 revision。[✅ 已完成] docs/specs/editor-safety.md（新——§1 手动重载[SD-01 行为表+取消不变式+文案]/§2 结果提交[SD-02 五门+空文合法+nonce 重挂载因由 F-30-R2]/§3 边界与验证[SD-03 双口分野+非目标如实+vue Escape 残置/F-30-R1+上游边界 F-30-R3/F-24-2 第十四窗+验证锚]——不承诺草稿持久恢复/内部事务全面保护）；ARCHITECTURE §6 heading 增 SD-3002 扩单注记 + 规范指针（局部文档 delta，不重写历史）。AC 映射核对：AC-01..06=T-02/T-03/T-04 行为证据（e2e 九段+R 组六弧）、AC-07=存量回归（merged 17/17+e2e 2/2+rename 组适配两处）、AC-08=单源实现（src 两文件零 gen 手改）+SD-01..03 落档+本记录。

状态变更按 work/review 流；合入、正式规范沉淀和归档另由 merge 技能处理。

## 9. 复审记录

### 2026-09-30 复审（auto-plan:review）

- stage: review
- plan: PLAN-030
- revision: 1
- outcome: pass
- reviewed_commit: a5a1d64449b034057889b60c1cac7b1f3fbf1d89（工作树 clean；本记录为 docs-only 后代）
- base_commit: 9ab1b5790cf2c564f5e606a0d7ded3abc83b3252
- dependency_revisions: auto.exe debug 09-30 16:01 = v0.4.2-2311-g7fcf913eb（与 work 窗零换档）；@autodown/engine 0.5.0（gen/front/vue/node_modules）
- spec_inputs: docs/specs/editor-safety.md（新 75 行——本批 canonical 首件）；docs/ARCHITECTURE.md §6 heading SD-3002 扩单注记（局部 delta）；本 Plan §5 规范增量 SD-01..03 逐条对实勘行为核对一致
- 独立性声明：同实现会话复审——裁定基于工件独立重放（§6 门 fresh 重跑 + 提交树 diff 实勘 + 追加复审探针），不采信执行期摘要
- acceptance_results（全数重放）：
  - **AC-01 pass**：范围实勘（back/ 零 diff、gen/dist 零 tracked diff、内部四口 `store.Reload()` 零触及——唯一改动行即用户口薄委托）+ build ✓（✓built 8.24s strict OK）+ reload-safety 定向重放 1 passed（7.2s：①a 立即 F5 弹层/①c 工具栏/①d 菜单）
  - **AC-02 pass**：e2e ①b 重放（取消后正文/脏标/磁盘逐字节保持）+ merged 臂 R2
  - **AC-03 pass**：e2e ③ 重放（放弃后正文=磁盘、磁盘字节不动）+ merged 臂 R3
  - **AC-04 pass**：e2e ④a/④b/④c 重放（干净直入/untitled 提示/合法空文）+ merged 臂 R4/R6
  - **AC-05 pass**：e2e ⑤ 重放（缺档保文）+ merged 臂 R5
  - **AC-06 pass**：e2e ⑥ 重放（新输入+延迟回执拒覆盖）+ **本窗补证探针** e2e/.runtime/p30-probe/review-ac06.mjs（review-ac06-result.txt）——切页条款（S：在途切 tab → stale 提示 + 目标正文无磁盘标记）与关档条款（C：在途关档 → tab 不复活 + 重开正文净）live 直证，读后门三布尔子句全数有 run-time 证据
  - **AC-07 pass**：merged 臂 **17/17 ALL GREEN** fresh 重放 + pnpm test:e2e **2/2 passed**（matrix 1.2m + reload-safety 7.0s）+ rename 组①适配两处 diff 实勘（vm_matrix:2171/matrix.spec:930——确认+放弃路径，语义同向）+ 基线 v21 diff 逐项解释复核
  - **AC-08 pass**：单源实现核验（src/front/*.at 两文件，gen/dist 零手改——build 链再生成）+ SD-01..03 落档与行为一致抽查（untitled 文案/弹层文案/双失败提示源锚各恰）+ 非目标如实（无草稿持久恢复/内部事务保护承诺）
- findings：
  - **F-30-R4（info，非阻断）**：复审补证探针首轮 S 支「FAIL」定性为探针装置竞态——read_wiki 拦截器把切页目标自身开档 read 一并延迟，回执落地时 TabActivate 未达（active_key 仍=目标页），门判提交为正确行为；装置纪律（切页走 tab 钮零 HTTP）已修正后 S/C 双 PASS。零产品代码缺陷、零改动。
  - split 臂 boot FAIL 维持 F-24-2 第十四窗登记（work 窗 stash A/B 对照在档：基线 src 同窗同点同形）——既有分段判绿口径续用，非新发现。
- evidence: 本记录内嵌命令/结果摘要 + e2e/.runtime/p30-probe/（review-ac06.mjs/result.txt 等，ignored 一次性件——值已内嵌可追溯）；规范增量冻结面 = docs/specs/editor-safety.md@本提交树
- next: merge（用户已授权 work→review→merge 连跑）

### 2026-09-30 草案交接

- stage: new
- plan: PLAN-030
- revision: 1
- outcome: pass（规划契约检查通过；不表示实现已复审或全部产品提案已授权实施）
- next: work / T-01，收到本项执行指令后在专属工作树开展能力核查
- changed_tasks: T-01..T-05（新增）
- changed_acceptance: AC-01..AC-08（新增）
- spec_delta: SD-01..SD-03（提案，new 阶段尚未落 canonical）
- evidence: 当前路径/符号已核对；AC 与 T/SD 覆盖完整；本仓无 active 匹配 Plan；应用测试尚未执行

### 2026-09-30 work（auto-plan:work）

- stage: work
- plan: PLAN-030
- revision: 1
- outcome: pass（T-01..T-05 全数 [x]，current_step 5/5；实现已验证、已落档、随本批提交落 main——直接 main 线性约定 001..029 在册惯例，无 worktree/dev 分支）
- code_commit: 本批提交（base = 9ab1b5790cf2c564f5e606a0d7ded3abc83b3252；改动面 = src/front/editor_store.at + src/front/app.at + tests/vm_matrix.mjs + e2e/matrix.spec.ts + e2e/reload-safety.spec.ts[新] + tests/baseline/structure-v21.txt[新] + docs/specs/editor-safety.md[新] + docs/ARCHITECTURE.md §6 heading SD-3002 + 本 Plan + docs/plans/attachments/030-reload-capabilities.md[新]）
- task_ids: T-01/T-02/T-03/T-04/T-05 全数 [x]（证据随各 checkbox）
- evidence（AC 映射）：
  - **AC-01**：三入口共口确认——e2e ①a 立即 F5（appendToEditor 后焦点在编辑器直接 F5 → 弹层现，无 blur 无点空白）、①c 工具栏、①d 视图菜单；提示前不读盘（vm R1 磁盘逐字节未动 + 正文/脏标保持）；bind 层 F5 编辑器焦点内可达（T-01 C2 死键修复）
  - **AC-02**：取消全保——e2e ①b（正文/脏标/弹层关/磁盘逐字节）+ vm R2（取消后 confirm=false、dirty=true、body 标记在、磁盘逐字节）
  - **AC-03**：明确放弃只动原目标——e2e ③（正文=磁盘新文、磁盘字节不动、LOCAL 输入让位）+ vm R3（active_body=DISK 标记、dirty=false）
  - **AC-04**：干净直入无确认（e2e ④a + vm R4）；untitled 不读空路径可读提示（e2e ④b + vm R6）；合法空文加载（e2e ④c——boot 前落位空档，读回空文非失败，外部写后 F5 直读）
  - **AC-05**：缺档不丢正文不清脏（e2e ⑤ + vm R5——exists 卫、失败提示、body/dirty 保持、文档不关）；读取异常由 vue 拦截臂 + Store try/catch 门承载（§6 口径）
  - **AC-06**：迟到结果不覆盖（e2e ⑥——read_wiki 拦截 1.5s 延迟 + 等待期 appendToEditor 新输入 → 旧回执拒覆盖、正文保持、"文档已变化，请重新发起重载" 提示、dirty 保持；切页/关档同 post-gate 单门）
  - **AC-07**：存量回归 merged 17/17 ALL GREEN（六检查+基线 v21+R 组+扩单全组+quit+bootAgain）+ pnpm test:e2e 2/2（matrix 1.3m + reload-safety 7.8s）；结构变化仅批准面（基线 v20→v21 diff 逐项解释：reload_* 五字段 + active_key #r1 + console 前缀 + 弹层 vnode——计划内第八例重锁）；rename 组①脏档复原弧两处（vm_matrix/matrix.spec）随新语义适配为确认+放弃；内部四口 store.Reload() 边界零变化
  - **AC-08**：单源实现（src/front/*.at 两文件；gen/dist 零手改——regen-vue 链 ✓built；后端契约零变化——read_wiki/exists 原面）；SD-01..03 落档 docs/specs/editor-safety.md；ARCHITECTURE §6 SD-3002 局部注记；已知限制如实（§3 边界——无草稿持久恢复、无内部事务保护、vue Escape 残置惰性、F-30-R3 空档键入、F-24-2 第十四窗）
- execution-window observations（非阻断）：
  - F-30-R1（medium→已修）：reka AlertDialogAction=DialogClose 内部先关弹层（v-model 写 flag=false）再派发 @click——Discard 旗标门恒 no-op（vue e2e ①c 抓获；既有弹层族动作钮无旗标门故从未触发）→ 门挂快照不挂旗标，Escape 残置/闲触 armed 门兜底
  - F-30-R2（medium→已修）：vue 轨引擎 round-trip 非字节保真（样本：正文首空行剥除）——commit 磁盘原文经 replaceDoc→onChange→emitUpdate(规范化文) 回声 .Edit → dirty 翻真 → nonce 递增改 tab key 重挂载播种（挂载期零发射），双轨同源；此发现同时解释了 0.5.0 逐键发射形态下存量 check 6 后脏标静默翻真的潜在面（无断言域故从未暴露）
  - F-30-R3（info）：上游空文档零可落点块——untitled 真实键入不可达（新档打字面）；vm INPUT_TEXT 口结构性可达；e2e untitled 臂与脏无关（path=="" 即提示），注记留上游
  - F-24-2 第十四窗（split 臂 boot FAIL）：A/B 对照（stash 本批 src → 基线 src 同窗同点同形 boot FAIL）非本批引入；分段判绿 = merged 17/17 + e2e serve-back 同面 2/2 + 前端逻辑同源
  - D-21 v11③ 瞬态一例（RecCap 窗 快速打开 popover 内容窗一次失败、重跑即绿——在册惯例续记）
- blockers: 无
- next: review（复审基线 = 本批提交树；probe 一次性件 e2e/.runtime/p30-probe/ 在档可追溯）

## 10. 待澄清事项

| 项目 | 当前判断 | 负责人 / 下一动作 |
| --- | --- | --- |
| 当前输入是否仍受 D-17 blur 门控 | **已解决（T-01 实测）**：engine 0.5.0 emitUpdate 逐变更发射——两轨逐键同步，D-17 blur 门控已退役（unlock=上游 PLAN-677 兑现）；e2e 即时 F5 弧即证 | 无（editor-safety §边界在档） |
| 确认弹层 Escape/焦点与单 map 流程 | **已解决（T-01/T-04 实测）**：vue Enter=取消安全默认、Escape 走 v-model 清态（残置惰性——editor-safety §3）；vm Modal Esc/外点不关；零载荷四消息即可，无单 map 需求 | 无（F-30-R1 门挂快照设计在档） |
| 持久草稿与内部事务保护 | 后续 R-02；不是本项欠缺验收 | 下一项 new 时做保存协议调查 |
| 执行容量与自动继续范围 | 用户指定本 Plan 为执行范围（四个执行重点全部覆盖）；无跨 Plan 授权 | 复审/合入由 review/merge 流承接 |
| 上游修改 | 本批零跨仓写（T-01 只读调查；F-30-R1/R2/R3 均以本仓等价设计收口，登记供上游供料） | 如需上游供给另立范围 |

本草案没有等待用户选择的产品设计问题；保守默认已写明。T-01 是待执行调查，未执行不能被写成已确认可行。
