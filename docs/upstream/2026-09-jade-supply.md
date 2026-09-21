# jade-edit → 上游（auto-lang / auto-down engine）供料包（2026-09-21）

> 来源：jade-edit 仓 PLAN-002（T-01 扩单实测 + T-02 测量套件）。模式沿
> 669 先例——本仓登记诉求与证据，上游走自己的 plan 流程立项修复；各件
> 修复落上游后，jade-edit 侧以**零改动或最小改动复验解阻**（669 先例：
> 上游落后本仓零改动复验解阻），并在 README/对应文档更新解锁注记。
> 证据基线：jade-edit main（PLAN-002 T-02 交付时点）；工具链
> `v0.4.2-1784..1798-g9be5a6c3a-dirty`（debug）。

## 1. D-16：vm 首开编辑器全局初始化——boot 期预热（auto-lang）

- **诉求**：`spawn_syntax_warm_up` 机制已在库但只在**编辑器创建时**才
  点火（必输竞速）——改为**应用启动即跑**：boot 期预热常见语言 +
  预建 two-face/syntect 注册表，把一次性成本藏进用户看窗口的头几秒。
- **证据（jade-edit 实测）**：用户实录冷页首开 2s+（b8bce4d 在册）；
  热页缓存态首开 press 53ms、UI 线程 30 发心跳最差 4ms 零阻塞——
  一次性初始化定性成立（two-face/syntect 注册表构建[首触内嵌语法数据页]
  + 围栏语言 onig 正则编译[debug 秒级，auto-lang highlight.rs 注释在册]
  + 首次 CJK shaping）。PLAN-002 bench 复测：进程内首开 54–415ms、
  热回访 press 51–52ms 稳定（`tools/bench/results/baseline-L0-20260921.md`）。
- **期望形态**：boot 期异步预热（不阻塞首帧）；注册表/编译结果进程级
  缓存与编辑器创建路径共享。
- **下游复验条件**：新进程首开（冷）锚可见延迟进入与热回访同量级
  （bench `first_open_cold` ≤ `first_open_warm` ×~3 以内）；budgets
  `first_open_cold` 行由 ledger+blocked-upstream 升 hard 定值。
- **回执方式**：上游 plan 落地后知会本仓 → 零改动复验（跑 bench proxy
  + vm_matrix 全门）→ README/budgets 更新解锁注记。

## 2. D-15 残余 + 671 面新缺口（auto-lang vue 生成器/ts_adapter）

- **2a. `tabs.value.remove` 直通（R010，未清偿）**：receiver 非证数组
  即原样直通——jade regen-vue splice 补件在案守（`useEditorStore.ts`
  内 `tabs.value.remove(i)`）。期望：facade List 类型证得数组后映射
  splice。复验：补件 pattern 断言 fail 提示撤除。
- **2b. GalleryShell popover TS2307（Plan 676 在途，auto-lang
  bd64d8df6 已在案）**：bps demo 件 import `@/components/ui/popover`
  而 wrapper 未物化 → 消费仓 vue-tsc 红。jade 侧补件守（孤儿零引用才
  移除生成件）。期望：ui 组件 wrapper 随引用物化。复验：补件自然
  no-op（popover 目录存在即跳过）。
- **2c. tree JSON.parse 已清偿确认**：1784 ts_adapter 对
  `json.to_value(tree(...))` 原生发射 `JSON.parse`——jade 补件②已按
  pattern-断言 protocol 退役（PLAN-002 执行期）。请上游确认归属计划
  （669 先例）。
- **2d. menubar 族真组件化确认**：1784 起 menubar 族发射真组件
  （Menubar/Trigger/Content/Item），此前裸 div 零尺寸形态消失——同请
  确认归属；jade e2e 退出存盘检查已改按组件形态驱动。
- **2e. natives.ts R-tier 覆写语义**：R-tier 实装块**无条件覆写**
  `console_*`/`file_basename`（先到先得守卫未覆盖 R-tier）——消费侧
  后装 shim 被静默压掉。jade 已改垫片后装（D-13 勘误）。期望：覆写
  行为文档化或统一守卫语义（先到先得或显式 override 开关）。
- **2f. store 内联 `__vmOnly` 抛错桩**：`Process.exit` 等原语在生成
  store 内联发射为模块局部 throw 桩——「落盘后终止」类语义在 vue 轨
  死于抛错（jade 补丁为 no-op warn）。期望：`Process.exit` 映射为
  vue 轨可达的终止/无操作语义（或契约化让消费方注入）。

## 3. D-17：编辑器键入发射门控 + 回车块分裂死区（auto-down engine；PLAN-677 在飞区）

- **现象（jade 扩单 e2e 探针实证）**：EngineEditor 实例经**外部换料**
  （`:content` watch → replaceDoc）或**重挂载**（:key 变）后：
  ① 可打印键入进入引擎模型但**不发射** `update:modelValue`，blur 时
  一次性 text-diff 调和冲刷（首挂载实例逐键发射正常）；
  ② **回车块分裂死区**：replaceDoc 后实例 Enter 连 DOM 分裂都不发生；
  重挂载实例 DOM 分裂可见但引擎模型不变（serialize 与原文一致 → 消费
  方零感知）。
- **影响**：受控编辑器（content prop + modelValue 回传）在切档/重载
  场景丢失实时性（jade e2e 以中性 blur 冲刷适配，D-17 登记在案）；
  任何「内容换料后继续编辑」的宿主形态同坑。
- **期望形态**：外部换料/重挂载后键入发射语义与首挂载一致（逐键
  update:modelValue）；Enter 块分裂在换料后实例进入模型并发射。
- **下游复验条件**：jade e2e 撤除 blur 冲刷适配后九检查仍全绿
  （零改动复验）；D-17 行归档。
- **回执方式**：同 §1。

## 4. D-18：MCP 快照投影属性行双态（auto-lang desktop_mcp/快照投影层）

- **现象**：同一 auto.exe 二进制，`autoui_snapshot` 的 style/onclick
  属性行 + 花括号包裹**随实例非确定发射**（双态实测：state 段逐字节
  一致、vnode id 不变，仅属性/包裹行差异）——消费侧字节基线间歇漂移。
- **归因家族**：auto-edit F-RV6（工具链层竞态/非确定投影）同型。
- **影响**：jade 结构基线仪器已改为 state 逐字节 + vnode id 序列
  （双态下确定，v2 重锁在案）；文本层基线对本投影不可用。
- **期望形态**：投影确定化（属性恒发射或恒不发射）。
- **下游复验条件**：jade 以文本层字节基线对同一终态连续 N≥10 次快照
  零漂移；届时可评估恢复全文本基线。
- **回执方式**：同 §1。

## 5. 附记：测量通道缺口（PLAN-002 T-02 实勘登记）

- **VM 轨 time 族未接线**：app 侧毫秒钟不可得（auto-edit bench 同坑
  在册）——jade bench 全部 host 侧计时（MCP 心跳法）。接线后 bench
  可升级 app 侧毫秒值。
- **键入到上屏/滚动帧率**：.at 层无帧时间戳观测通道（auto-edit T-03
  同勘；内核帧时间戳插桩小供料）。
- **整文读链阻塞（C-5 面）——已于本仓解阻（2026-09-21 供料勘误）**：
  1MB 78s+ 阻塞的根因是**本仓 wsys.at read_body 的 O(N·L) 逐行重接**
  （VM ADD 全量 clone + 去重哈希放大常数），非上游 VM 缺陷——read_body
  改 split_once 标记法后 1MB 打开 0.87s。**仍供料两件**：①VM 字符串
  `+` 的全量去重哈希对大串是隐性常数放大器（建议阈值化/跳过内容
  去重，auto-lang）；②更大文档打开需 read_text_range 分块读（上游
  PLAN-673 已在途，现实现为整文件读后切片，分块走查前需改流式）；
  编辑面整文回写仍受 C-5（ARCHITECTURE §3 SD-201），unlock 不变 =
  rope delta。

---

**优先级建议**（jade 视角）：§1（用户可感首开卡顿，机制在库改动小）
与 §3（编辑器核心 UX + 受控宿主通用）并列最高；§2a/2e/2f 次之（补件
守面，上游语义化后撤）；§2b 随 676；§4 稳定性面（基线可信度）；
§5 随 rope/time 族搭车。

**回执方式**：各件修复落上游 plan 后，jade-edit 侧以零改动或最小改动
复验解阻（669 先例），并在 README/budgets/parity-ledger 更新对应
解锁注记与本表状态。
