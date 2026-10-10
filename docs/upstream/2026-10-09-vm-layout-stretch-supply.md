# vm 轨 iced 布局三缺陷 + autodown_editor padding 缺口：上游供料（2026-10-09）

> **2026-10-10 PLAN-748 落地回执（jade 复验）**：上游以 PLAN-748 立项收口
> （HEAD `c72ff953b`；jade 复验载体 = debug `v0.4.2-2835-dirty` 后本地增量重建，
> release 工件上游自注待重建）。四件处置——
> ①**件一 resolved（定位修订）**：T-06 定音探针证伪「StretchLine 不交叉拉伸」
> 供料定位——根因 = overflow 转写层视觉类（bg/border）挂滚动内容 col 止于内容
> 高（视口 Fill 拉伸本身正常）；T-07 `split_scroll_visual_classes` 视觉类上移
> 视口 Container 根修。jade 撤侧栏双层 workaround 回单层 overflow col：满高
> 像素终验 785/786（复验前同形态旧载体 550）。
> ②**件二 上游定音 HEAD 干净构建不复现**（p748_j1/j2/j3 定音探针 = 回归锁，
> headless+live 双通道）；jade workaround 已随批撤除，未复验残留。
> ③**件三 layout 面已修、live 绘制层残余（转上游续件）**：`P748_PROBE=1` 实测
> StretchLine 配给正确（child[2] natural_w=289 落位、fill share=586、fill_sum=1），
> 但 live 屏面右栏零绘制（border-l/bg-card/面板文本全无；同点位 border 扫描
> x=780..1113 纯内容底色）——上游定音探针为 **bounds 收集器**（几何绿）覆盖
> 不到绘制面，疑「layout 正确 paint 缺失」分歧（clip/paint bounds/z 序域）。
> jade live 于 HEAD 载体持续不可见（去 if 包装、去行 overflow-hidden 两变体
> 同败）。**测试面已适配**：vm_matrix `panelRegion` 增 `container` 投影臂
> （T-07 起 overflow col 快照投影 = 视口 container[整串 style] + 内嵌
> scrollable）。
> ④**件四 resolved**：T-10 autodown_editor 内建引擎等值 padding
> （CONTENT_PAD_Y=16/X=20 逻辑 px 对齐引擎 css:103；widget 四点联动）。jade 撤
> px-5 py-4 临时层：vm 实测正文左缘 +42 设备px≈20 CSS 与引擎 1.25rem 等值，
> vue 轨引擎 CSS 独挑不变。
> 基线链：jade v29→v30（+2 workaround 节点，2026-10-09 批）→**v31（撤层净
> -1 = T-07 视口 Container +1 / 编辑器 padding col -1，state 零变化）**；
> vm_matrix merged **20/20 ALL GREEN**（panelRegion 适配后）；e2e 全套件 41
> passed + 3 败 = D-21 负载窗族（败集逐窗漂移，冷却过滤单跑 2/2 PASS 9.7s）；
> vue build ✓ 11.30s。

来源：jade-edit。消费者：auto-lang `crates/auto-lang/src/ui/iced/`（renderer.rs /
stretch_line.rs / style/iced_adapter.rs）与 autodown_editor 官方件。这是 Jade 的
上游需求包，不是已登记的 auto-lang Plan；不占编号、不改上游规范。上游走自己的
plan 流程立项；各件落地后 jade 侧零改动或最小改动复验解阻（669/682 先例）。

证据载体：release `auto 0.1.0+v0.4.2-2747-gab7a650bd`（2026-10-08 构建）；复验时
auto-lang 工作区 HEAD `1b05d3d44`（Plan 738 docs）——stretch 代码与 2747 内涵一致
（ab7a650bd 为其祖先，此后 renderer.rs/stretch_line.rs 仅 focus/resize/fit 三件
无关修复）。jade 侧实验均在 `auto run -r vm` merged 形态 + PrintWindow 截图 +
像素测量取得，产物在 jade-edit `e2e/.runtime/exp*.png`（exp5=基线、exp6..13=逐
变量对照）。

共同背景：jade-edit `src/front/app.at` 双轨单源——同一份视图 DSL，vue 轨经
tailwind/CSS 渲染，vm 轨经 iced 解释渲染。下列三件均为「vue 轨正常、vm 轨破」
的双轨差异，锚点都在 iced 渲染器。

---

## 件一：`items-stretch` 行不交叉轴拉伸 Shrink 高子项

现象：`row (style: "flex-1 items-stretch overflow-hidden w-full")` 的直接子 col
（无显式高，含 `overflow-y-auto`）背景/几何止于自身内容高，不随行拉伸。vue 轨
CSS `align-items:stretch` 正常。

实测（jade 侧栏，窗口 1113×786）：侧栏 bg-card 底边 y=550（=树内容底），而行本
身满高（`flex-1` 生效）——StretchLine 行高解析正确，缺的是 final 遍对 Shrink 子
项的 `min_h = effective` 拉伸落位（stretch_line.rs 注释声称的 CSS stretch 语义
未兑现于该形态）。

复现最小形：

```
view { col (style: "h-full w-full") {
    row (style: "flex-1 items-stretch w-full") {
        col (style: "w-56 bg-card overflow-y-auto") { text "短内容" }
        col (style: "flex-1") { text "高内容…（多行）" }
    }
} }
```

期望：左 col 高 = 行高（= max 子项内容高或行定高）。实际：左 col 高 = 自身内容高。

## 件二：`overflow-y-auto` col（View::Scrollable）挂显式高 → 子树零几何；且类序敏感

在件一形态上给该 col 直接补 `h-full`（不拆层）：

- `h-full` 位于类串**末位**：col 背景/几何拉满行高，但**子树全部消失**（MCP
  snapshot 里节点在、屏幕零像素——疑 build_scrollable 的显式高分支
  （Shrink + max_height 封顶注释）对 Height(Full) 入射把内容高算 0）。
- `h-full` 位于类串**首位**：**整个应用降级**为无样式形态（menubar 默认字号巨
  大化、其余子树不渲染）——类解析/应用顺序不应影响渲染结果，疑似首位命中了某
  条带全局副作用的分支。

jade 侧 workaround（已验证，件一修复配方）：宿主 col 挂 `h-full`（无 overflow）
+ 内层 col `flex-1 overflow-y-auto` 滚动——内层走 flex-1 转写路径（axis_fix）
即可避开，说明显式类与转写产物在 Scrollable 上行为分叉，供定位。

## 件三：StretchLine 主轴配给挤掉最后一个定宽子项（jade 右栏面板不可见）

`items-stretch` 行含三个直接子 `[定宽 A, FillPortion B, 定宽 C]` 时：B 越界占满
整行宽，C 被配到 ≈0 宽，行 `overflow-hidden` 下完全不可见（MCP snapshot 节点在
、屏幕零像素）。**与 C 的宽度类形态无关**（`w-72` 与 `w-[288px]` 同败）、与 C
是否带 overflow/显式高无关、与 C 是否经 `if` 条件包装无关。

jade 用户可见后果：右栏检索/反链/标签面板（`w-72` col，app.at 右栏）打开后完全
不可见——`backlinks_open=true`、面板行全在快照树，屏幕零渲染。vm_matrix 测不出
（快照断言不含几何）。

复现最小形（件一形追加第三个定宽子即可）：`[w-56 col][flex-1 col][w-72 col]` →
第三列零宽。期望：B = 行宽 − A − C。

## 件四：autodown_editor vm 件缺引擎 CSS wrapper padding（双轨呈现缺口）

vue 轨编辑器 padding 由引擎自带 CSS 承担（auto-down
`packages/engine/src/editor/styles/autodown-editor.css:103`
`.autodown-editor-content-wrapper { padding: 1rem 1.25rem }`，经
`editor/index.ts:1` 随组件导入）；vm 轨 `autodown_editor` 官方件渲染无此层——
正文左缘贴死分隔线（jade 用户报告件）。

jade 临时配方（已验证双轨等值）：`.at` 编辑器外包 `px-5 py-4` 容器 + 编辑器
style 追加任意变体 `[&_.autodown-editor-content-wrapper]:p-0`（vue 轨把引擎层
清零防双重，tailwind 产物 specificity (0,2,0) 压过引擎 (0,1,0) 已在构建产物
核验；vm 轨变体天然 no-op）。**正根修候选**：vm `autodown_editor` 件内建复刻引
擎 wrapper padding（1rem/1.25rem），jade 撤临时层零改动复验。

---

## 修复约束（上游立项时请一并核对）

1. **P642-D12 不回归**：StretchLine 两阶段存在的理由就是 scroll 内容臂（无界）
   下 Fill 包装塌缩 0 高（008 定价卡前科）——件一/件三的拉伸/配给修法不得把
   Fill 拉伸产物重新放回无界祖先语境。
2. **类序无关性**：件二的首位/末位分叉说明存在顺序敏感路径；修复应保证任意类
   序等价（golden/像素对照加乱序案）。
3. **PLAN-655 既有语义保持**：`line_fill_height`（定高行吃满入射上限、无界回落
   auto）与 041 auto-edit 主行既有绿面不漂移。
4. 判绿面建议：iced 档布局单测（三件各一）+ ui-gallery/041 像素对照 + jade 侧
   复验（本仓 vm 矩阵 + 本文件复现形）。

—— jade-edit 2026-10-09（实验窗全记录见 jade-edit 会话存档；联系人面同
2026-10-native-wiki-link-supply.md）
