# jade-edit 双轨差异登记表 v4（PLAN-081 T-07 首版；PLAN-001 T-05 换基复核；2026-09-21 补件链退役复核 + 首开延迟登记 D-16；PLAN-002 T-01/T-02 扩单实测增补 D-17/D-18 + D-03/D-16/D-13 处置更新）

> 方法论继承旧 jade-garden L3 差异表（design 30 §8）：差异不静默、逐项
> 记账（形态/处置/升级路径）。分类：**归档级**（双轨形态已对齐/不追）
> / **组装级**（当前装配差异，后续批次收口）/ **上游级**（auto-lang /
> engine / auto-down 侧缺口，本仓补丁或纪律规避）。

| # | 面 | vm 形态 | vue 形态 | 级 | 处置 / 升级路径 |
| --- | --- | --- | --- | --- | --- |
| D-01 | 编辑器代码字体/主题 | fence mono CJK tofu 债 + hljs 主题定格（auto-lang DEBTS 041 在册） | DOM 字体栈/hljs 主题随工程 CSS | 上游 | engine/auto-lang 侧债，本仓不修；观感差异接受 |
| D-02 | engine 平台面 | rust/VM 平台面 experimental（engine ARCHITECTURE §2） | 契约面（出口 1.0 冻结）稳定 | 上游 | engine 稳定化后续；断言域=契约面，深层行为不锁 |
| D-03 | 编辑器播种/切换 | `key: active_key` 重挂载播种（key 变即重读 content:） | 生成 `:key` 为静态串 + `:content` prop 更新——**PLAN-002 补件③（regen-vue）改绑 `store.active_key` 恢复重挂载播种语义（vm 同款）**；播种类切换可见延迟 0.5-1.95s（aura 状态同步 ~500ms idle tick 节拍 + 重挂载，bench doc_switch 行 ledger 记账） | 组装→部分归档 | 补件③守（上游 :key 动态绑定直发后撤）；切换可见延迟上游节拍改造 unlock；budgets.json `doc_switch_visible` 行互指（tools/bench/） |
| D-16 | vm 首开编辑器全局初始化延迟 | 首个编辑器挂载付全部进程级一次性成本：two-face/syntect 注册表构建（首次触碰内嵌语法数据页）+ 围栏语言 onig 正则编译（debug 构建秒级，auto-lang highlight.rs 注释在册）+ 首次 CJK shaping | 不适用（vue 轨无此路径） | 上游 | 用户实录首开 2s+ 卡顿、二次开即恢复；热页缓存态复测首开 53ms 且 UI 线程零阻塞（心跳探针最差 4ms）——冷页缓存 + 系统负载（当时三兄弟 vm 实例在跑）放大所致。**PLAN-002 bench 复测（2026-09-21）**：进程内首开 54-415ms、热回访 press 往返 51-52ms 稳定（budgets `first_open_warm` hard 行锚）。优化路径（auto-lang 侧）：① boot 期预热——`spawn_syntax_warm_up` 机制已在库但只在编辑器创建时才点火（必输竞速），应在应用启动即跑常见语言 + 预建注册表；② release 构建（onig debug 正则编译秒级为 in-tree 文档明示）。**预算互指**：budgets.json `first_open_cold` 行 = ledger+blocked-upstream(D-16)；unlock = 供料包 §1 |
| D-04 | ~~生成 api client 四缺口~~ → 标量契约 | 不适用（vm 走 `use back.api` 直调） | 换基后契约全标量（str/int/bool）⇒ 旧四缺口（通配 URL/List\<T\>/JsonAny/map）**结构性消除**（regen-vue 断言守残留） | 归档 | PLAN-001 T-02 契约设计即规避；残余缺口见 D-10/D-15 |
| D-05 | actions 面 | actions{} 双轨可用（menubar/toolbar 快照锚 + keydown 回退层） | 同左（换基后 menubar/toolbar 已进入） | 归档 | PLAN-081「v0 无 menubar 最小面裁定 #4」随换基 supersede；残余=use 深度不对称（vue 只扫一级 use）——纪律：actions 只放根 widget |
| D-06 | ~~后端运行模式~~ | ~~split 外部 exe~~ → 换基后：自有 Auto src/back，merged 进程内直调 | HTTP（vite /api 代理 → `auto run --server vm -B`） | 归档 | PLAN-001 换基定版（supersede R-3）；a2r rust 引擎 = 上游缺口 F-R1（auto-edit PLAN-003 在册），不可用不阻塞 |
| D-07 | ~~JsonAny 契约字段~~ | ~~VM 存取损坏~~ → 换基后 front 全程零 JsonAny（frontmatter back 侧字符串层保留/拼回；read_wiki 只回 body） | 同左 | 归档 | PLAN-081 C-1「现读现传」绕法随边界内移退役；上游 JsonAny 装箱修复仍登记（旧 jade 潜在同坑在案） |
| D-08 | 状态读面 | 合并根状态裸读可用 | 裸读发射为未声明标识符（vue-tsc 拒绝） | 归档 | 定形 `.store.*` 单一读面（013 形态）；store computed 双轨皆坏已退役 |
| D-09 | 结构基线 | tests/baseline/structure-v1.txt 锁 state+snapshot（换基满状态；v0 留档） | 无对应（vue 轨 DOM 断言走 e2e） | 归档 | 断言域=两轨交集；vue 侧不复制 vm 基线形态 |
| D-10 | ~~vue-tsc v-for 兄弟模板作用域~~ | 不适用 | T-03 三症状（i/t/r；2.0.29/2.2.12 × vue3.4/3.5 全试无免）随 PLAN-671 新发射形态消失——2026-09-21 裸 strict 生成 + vue-tsc 2.2.12 实测零报错，v-for 拆分补丁与版本钉（vue 3.5.35+vue-tsc 2.0.29）一并退役 | 归档 | 源级消对（explorer 单按钮 + handler 分流）保留；tab 互补双分支发射仍在但零触发——源级若再引入同类兄弟对需重验 |
| D-11 | `.find` 闭包 split 硬崩 | merged OK；**`--no-merge` split 下 `.tabs.find(t => …)` 闭包使进程硬崩**（无 panic 输出；T-01 实勘，type/save 双复现） | 不适用（js 原生 find） | 上游 | 纪律：store 内 tab 定位一律 while 索引扫描（基座同款形态）；auto-lang 侧另立计划修复后解禁 |
| D-12 | autodown_editor 事件面 | key/content/final/oninput/on_focus（aura_view_builder.rs 实勘）——**无 oncursor/oncontextmenu**，无 code_editor_* 内建族 | 同左 | 上游 | StatusBar 行:列降级（docs 计数+脏标替代）；ctx_menu 组件不迁入（无右键锚）；menubar 编辑项 no-op+console 注记（编辑器内原生快捷键仍可用）；engine 事件面扩展后续批 |
| D-13 | vm 宿主内建 vue 运行期 | 不适用（宿主原生） | 类型面生成器自备（PLAN-671 ①+P2）；运行期 = regen-vue 补 `vm-natives.ts` 垫片。**PLAN-002 勘误（2026-09-21 实探，1784）**：上游 natives.ts 新增 R-tier 实装块**无条件覆写** console_*/file_basename（先到先得守卫未覆盖 R-tier）+ Process 走 `__vmOnly(name,...)` 内联抛错桩（store 模块局部，全局垫片够不着）——垫片改**后装注入**（main.ts 排 `./lib/natives` 之后）+ 新增 `__vmOnly` no-op + store 内联桩 pattern 补丁为 no-op；console_* 语义由上游 R-tier 接管（更优，垫片同名义覆盖），dialog_*/Process.exit 保持垫片语义（""=取消 / 落盘后 no-op） | 组装 | 垫片为 gen 产物常驻补件（vue 轨 e2e 热路径依赖，PLAN-002 九检查复验共存成立）；上游 dialog 取消语义落地后垫片可退役 |
| D-14 | frontmatter updated_at 补写 | 旧 jade-garden-back 保存时服务端补 updated_at；换基 Auto back v0 **逐字保留 frontmatter**（不补写） | 同左 | 组装 | 六检查断言域不含 updated_at（磁盘原文+标记+frontmatter 三验）；补写属 wiki 域功能池后续批 |
| D-15 | 生成器残余缺口（换基面） | 不适用 | 双段 `${}` 插值错序（671 附a）、`--lenient` 通道（671 附b）、**tree JSON.parse（1784 ts_adapter 对 json.to_value 原生发射 JSON.parse——PLAN-002 补件②退役）**、**menubar 族真组件化（1784 起 Menubar/Trigger/Content/Item 组件族发射，裸 div 形态消失）** 已消；**仍存**：`tabs.value.remove` 直通（R010 INFO：receiver 非证数组即原样直通——regen-vue splice 补件守，上游未清偿）、deps/bps 部分同步 package load 告警 + dropdown-menu `open` prop schema 未吸收（warning 级不阻断）、**GalleryShell popover TS2307**（bps demo 件 import popover 而 wrapper 未物化——上游 auto-lang bd64d8df6 在案 Plan 676 在途，regen-vue 孤儿清理补件守[零引用才移]） | 上游 | 残余件上游清偿后补件断言 fail 提示撤除；auto-edit 侧七类链同日退役（d845e54 在册） |
| D-17 | vue 轨编辑器键入发射门控（PLAN-002 T-01 扩单实测登记） | 不适用（type_text 即发，INPUT_TEXT 整文回写同步可达） | 切档重挂载（:key 变）/外部换料（replaceDoc）后的编辑器实例：可打印键入**进引擎模型但不发射** `update:modelValue`，blur 时一次性调和冲刷（text-diff 路径）；回车块分裂为引擎死区（DOM 亦不分裂，replaceDoc 后实例）；首挂载实例逐键发射正常 | 上游 | e2e 以中性 blur（点 EXPLORER 头）= 确定性冲刷达成与 vm 即发同语义（D-17 机制注记入 spec）；store 段中插入/退格弧线全程可证、回车/退格净零断言（引擎局部）；unlock = 上游 engine（PLAN-677 在飞区）键入发射/块分裂路修复；供料包 §3 |
| D-18 | 上游快照投影属性双态（PLAN-002 T-01 基线实测登记） | MCP snapshot 的 style/onclick 属性行 + 花括号包裹**随实例非确定发射**（同二进制双态实测：state 段逐字节一致、vnode id 不变）——字节基线漂移源（auto-edit F-RV6 家族） | 不适用（vue 轨 DOM 断言） | 上游 | 基线仪器 v2 改 state 逐字节 + snapshot vnode id 出现序列（结构哈希，双态下确定）；textarea value 为多行原义区，文本层行归一不可靠（勘误记录）。unlock = 上游投影确定化；供料包 §4 |

## 增记规则

新差异：先登记（含形态与级），再决定处置（补丁/纪律/上游/接受）；
升级路径完成时把级改归档并留证据链接。差异表后置面（ PLAN-080 尾事）
后续按此表扩展。
