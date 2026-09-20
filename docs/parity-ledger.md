# jade-edit 双轨差异登记表 v0（PLAN-081 T-07 首版）

> 方法论继承旧 jade-garden L3 差异表（design 30 §8）：差异不静默、逐项
> 记账（形态/处置/升级路径）。初始版起记账——不积累组装级差异是本仓
> 立项裁定（PLAN-081 §0 纪律）。分类：**归档级**（双轨形态已对齐/不追）
> / **组装级**（当前装配差异，后续批次收口）/ **上游级**（auto-lang /
> engine / auto-down 侧缺口，本仓补丁或纪律规避）。

| # | 面 | vm 形态 | vue 形态 | 级 | 处置 / 升级路径 |
| --- | --- | --- | --- | --- | --- |
| D-01 | 编辑器代码字体/主题 | fence mono CJK tofu 债 + hljs 主题定格（auto-lang DEBTS 041 在册） | DOM 字体栈/hljs 主题随工程 CSS | 上游 | engine/auto-lang 侧债，本仓不修；观感差异接受 |
| D-02 | engine 平台面 | rust/VM 平台面 experimental（engine ARCHITECTURE §2） | 契约面（出口 1.0 冻结）稳定 | 上游 | engine 稳定化后续；断言域=契约面，深层行为不锁 |
| D-03 | 编辑器播种/切换 | `key: path` 重挂载播种（key 变即重读 content:） | 生成 `:key` 为静态串 + `:content` prop 更新 | 组装 | v0 单文档流不触发；多 tab 切换面到 tab 条功能批时实测定夺（若 vue 需真重挂载=上游 key 透传缺口，届时上游另立） |
| D-04 | 生成 api client 四缺口 | 不适用（vm 走 `use back.api:` + #[api] HTTP 改写，正确） | 通配路由 URL 不替换 / `List<T>` / `JsonAny` / `map` 直译 | 上游 | regen-vue.mjs 补丁 + pattern 断言（上游修复后断言失败=撤除提示）；上游候选计划：vue api client 通配与类型发射 |
| D-05 | actions 面 | actions{} 双轨可用（F-1 已过时：vue 合成 451 P2 + 070 T-05 去门化；keydown 回退层双轨） | 同左 | 归档 | v0 无 menubar（最小面裁定 #4）；残余=use 深度不对称（vue 只扫一级 use）——纪律：actions 只放根 widget |
| D-06 | 后端运行模式 | split（AUTO_VM_MERGE=0 + AUTO_BACKEND） | split（vite /api 代理 AUTO_HTTP_PORT） | 归档 | 双轨同指外部 axum 服务器；VM 模式（JADE_GARDEN_SERVER=vm）实验位：run-back --vm 可切，验证属后续 |
| D-07 | JsonAny 契约字段 | 经 VM 变量/Obj 字面量存取损坏（C-1，T-03 实测：落盘 "4000090"/`<vmref>`） | JS 原生对象直通 | 上游 | 纪律 C-1（现读现传）；上游修复（JsonAny 装箱）后解禁。参考：旧 jade desktop vm 轨 save 同款模式未断言 frontmatter——潜在同坑（其仓冻结不改，仅登记） |
| D-08 | 状态读面 | 合并根状态裸读可用 | 裸读发射为未声明标识符（vue-tsc 拒绝） | 归档 | 定形 `.store.*` 单一读面（013 形态），双轨合法；store computed 同因退役（C-2/C-3） |
| D-09 | 结构基线 | tests/baseline/structure-v0.txt 锁 state+snapshot（vnode id 确定性） | 无对应（vue 轨 DOM 断言走 e2e） | 归档 | 断言域=两轨交集（文本/结构/磁盘），vue 侧不复制 vm 基线形态 |

## 增记规则

新差异：先登记（含形态与级），再决定处置（补丁/纪律/上游/接受）；
升级路径完成时把级改归档并留证据链接。差异表后置面（ PLAN-080 尾事）
后续按此表扩展。
