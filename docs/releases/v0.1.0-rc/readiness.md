# readiness.md — Jade v0.1.0 源码试用收口裁定（PLAN-039 T-01/T-02）

> 状态：**preparation_only**——最终 auto-lang v0.5 候选（D-01）尚未冻结；本档记录
> 收口裁定与本仓修复证据，不宣称最终 RC。逐命令/计数/指纹证据见
> [validation.md](validation.md)（T-03 回归后成稿）。
> 证据载体：debug `2730-dirty`（计划 §4.2 在录，SHA256 `1dae8b49…339e3`）与
> release `2747-gab7a650bd`（master 干净构建，SHA256 `1efdc3ed…5ee2`）双载体实测；
> 两者在本文全部复现场景行为一致。

## 1. 收口状态分列（§2.3 口径）

| 状态 | 判定 | 依据 |
| --- | --- | --- |
| `preparation_only` | **现行** | D-01 最终 RC 未冻结；本仓修复与准备证据已就位 |
| `jade_ready` | 未判定 | 待 T-03 在最终候选上的完整回归与干净路径实走（AC-05/06/07） |
| `blocked` | 无现行阻断 | 空文输入与 Save 假入口两缺口已在本仓闭环（§3/§4）；其余为已登记边界非阻断 |
| `publish_ready` | **false** | 用户真实试用确认（D-03）、母工程联合发布门（D-04）独立 pending，不被本计划代填 |

## 2. 支持形态与门禁

| 形态 | 角色 | 本轮实测门 |
| --- | --- | --- |
| `auto run -r vm`（merged） | 主交付形态 | vm_matrix merged 20/20 ALL GREEN（修复批后隔离复跑）＋空文/保存/清空场景 MCP 实测 |
| `auto run -r vue --server vm` | 第二交付形态 | e2e 六套件＋新缺口套件（修复批后全绿）＋集成命令实走待 T-03 干净路径复验 |
| serve-back + vite（e2e harness） | 验证载体 | 仅验证；不代替发行启动（不写进用户指南启动段） |
| 原生 `--no-merge`（split） | 补充诊断 | boot 恢复实测（probe_editor_host B1，release 2747）；链接消费未联验维持单列 |
| 单独 Vue dist 静态 serve | 非独立发行形态 | 构建新鲜度由 regen-vue 门保障；无独立运行承诺 |

## 3. 缺口裁定：空正文输入（B-7，SD-04）

**现象与根因（双轨实测）**：

- Vue 轨：空文档（0 字节 `.ad` 或清空后正文落空白）→ 引擎 `parseBlocks` 跳过空白行
  → 零块渲染（`EngineEditor.vue` `v-for views` 空集）→ contenteditable 逐块挂载 =
  零输入面，用户无法输入。纯空白种子同样无效（解析为零块）。
- 原生轨：编辑壳空态只有浅灰 placeholder（jade 未传 `placeholder` prop 时为空域）；
  MCP `key_press` 合成回执 ok 但**非空对照档同样零正文突变**（合成键程不达 DSL
  handler——M3/N2 ghost 家族仪器受限，B-3 单列），空档真实键程**不可由本仓仪器证
  明/证伪**，归真实试用走查（trial-guide 场景 E1）＋上游键程原语供给（auto-lang B-3
  族，owner=auto-lang）。

**处置（本仓最小修复，T-02 已落地并验证）**：

- 修复形态 = `app.at` 显示层空态种子：`editor_content` computed
  （`editor_content_of(body, path_stem(active_path))`——`trim(body)==""` 时返回
  `"# " + 页名`，与 `create_page_impl` 新建页模板同款标题行形态）。
- 约束逐项核验：store 正文保持 `""` 直到真实输入经 `oninput` 落 `.Edit`（单一正文
  权威）；未编辑空文保存保持 0 字节（e2e 零污染案＋VM MCP 实测
  `disk bytes after save: 0`）；引擎 `lastEmittedMd` 以初始文档播种
  （`EngineEditor.vue` 挂载期 select 零发射）→ 种子不产生脏标（e2e 断言状态栏无
  「未保存」）；无新增写盘口/检查点旁路；挂载与输入来源 = 单一 computed 表达式 +
  既有 `.Edit` 路径（可核）。
- 种子经真实输入进入文档后即为用户内容的一部分（与模板页标题行同语义）；关闭不保
  存则磁盘零变化（既有关闭确认/草稿门链不变）。
- 双轨同源生效：VM 快照 `value: "# 空档"`（空档打开即种子标题块）＋Vue e2e
  `空页：种子起点可见 → 真实键入 → 保存落盘` 全案。

**残余边界**：原生轨空档真实键程未证（仪器受限，见上）；种子标题块需要用户点击后
输入（无 caret 自动定位供给——caret/选区族缺口维持 §5）。

## 4. 缺口裁定：引擎 Save 假入口（SD-03）

**现象与根因**：`EngineEditor.vue` 无条件渲染动作栏 Save 钮
（`emit('save', serialize(...))`），jade 只听 `@update:modelValue`——点击=零落盘+脏
标保（假入口）。`:show-actions` 非 EngineEditor defineProps（attr 透传非行为开关），
上游无隐藏供给（e2e inventory + probe 形状双证）。

**处置（本仓宿主呈现修复，T-02 已落地并验证）**：

- 修复形态 = `app.at` 编辑器 style 追加 tailwind 任意变体
  `[&_.autodown-editor-actions]:hidden` → 生成 App.vue 类串 → 引擎动作栏
  `display:none`（DOM 恒渲染、视觉不可达、不可点击）。VM 轨无该动作栏（原生壳无此
  面），样式串被 Style::parse 安全容忍（快照原样保留、boot/渲染零异常）。
- 宿主三真实保存入口保持：工具栏保存钮（`button[title="保存"]`）、菜单「保存」、
  Ctrl+S——共 `ActSave → store.Save` 全门链（e2e save 案在册）。
- 上游结论维持分列：`emit('save')` 供给存在待接线、`:show-actions` 非 prop、A-1 身
  份供给未落地——`@save` 消费接线在身份供给前仍被 editor-host-capabilities §2 禁止
  （不接 md+active_key）。
- e2e 更新：`editor-host-capabilities.spec.ts` inventory/save 两测按新现实改锚
  （假钮 toBeHidden + attr 透传结论保持），不保留「假按钮依旧存在」为成功期望。

## 5. 键程与交互边界（维持单列，不因收口放行）

| 边界 | 状态 | owner/重入 |
| --- | --- | --- |
| VM Escape/Tab 键程（F-038-R1） | 维持 nonblocking 单列（上游单列） | auto-lang |
| 生成器组合键丢 Shift 位（Ctrl+Shift+O/F/D 塌缩，035 在录） | 维持；菜单替代可达（菜单项存在性 e2e 在册） | auto-lang |
| 原生轨真键撤销/编辑历史覆盖 | 仪器受限未证（key_press 词表无修饰键＋合成不达 handler 双限）——真实试用走查 | auto-lang B-3 |
| 输入期 wikilink 解析/空编辑器零块/块底命中遮挡（B-0 族） | 维持上游单列；空编辑器零块面已由本仓种子缓解（有内容即有块） | auto-down |
| caret/选区/reveal 原语 | 缺供给维持；开页≠锚定位如实说明 | auto-lang B-4 |

## 6. 生命周期与退出边界（维持分列）

- F-32-R2（VM 局部槽串扰）：vm_matrix LC3 安全终态断言 PASS（reject+零变更+弹层留
  置+save_note 如实）——单列不合并。
- Vue 退出 no-op：不宣传为关窗成功；试用指南按其真实终止方式写（T-04）。
- 原生检查点仪器楔死（D-45② 单检查点窗）：vm_matrix 键入有界维持。
- F-31-R1 engine dist 新鲜度：regen-vue 门链在册。

## 7. 功能池冻结（G-01）

030..038 已交付功能全部在册为 v0.1.0 试用范围；R-05b 及侧栏重排、完整命令桥、实时
链接解析、caret/reveal、大纲/图谱、自动保存/版本历史、运行中切库、安装包、跨平台、
Musk 工作台等延后（非目标清单见计划 §1）。本批新增面仅：空态种子 computed、编辑器
隐藏类、e2e 缺口套件、bench 持久化、发行资料——无产品范围扩张。

## 8. 重入条件与外部依赖

| 项 | owner | 重入条件 |
| --- | --- | --- |
| D-01 最终 v0.5 RC（工具链+engine dist 冻结来源/hash） | 母工程发布负责人 | RC 提供后：回填 manifest、重验两形态门、AC-05/06/07 收口 |
| D-03 用户真实试用确认 | 用户 | 按 trial-guide 完成一次可绑定版本回执；缺失则 publish_ready=false |
| D-04 联合发布入口验收 | 母工程 R-03/R-04 | 本仓仅交付候选来源与交接表；不猜 URL/不部署/不代打 tag |
| 原生空档真实键程走查 | 用户试用（E1 场景） | 若不可输入 → 登记 auto-lang 供给（B-3 族延伸），不静默降级 |
| **UI 挂起低频域（用户信号 2026-10-09）** | auto-lang（上游 iced/VM 事件循环域） | 事件日志实勘：14 天窗内 2 天有 auto.exe 挂起记录（09-29 孤例＋10-09 四次——后者与本计划回归批量负载窗重合，probe 三件 receipt 失效经基线对照与本批改动无涉）。最终候选 T-03 须在静默环境复核稳定性；试用指南提示长时间无响应时先等待数秒（MCP 快照序列化窗）再判定 |
