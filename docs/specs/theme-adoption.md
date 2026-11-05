# 主题接入（theme-adoption）— jade-edit（auto-jade）

> 来源：auto-os/PLAN-061（主合同）。宿主策略定义见 OS
> `docs/specs/shell/host-theme-policy-and-delivery.md`；批次登记见 OS
> `docs/specs/apps/product-theme-batch-061.md`。本页只记本产品的实际表面
> 与合法固定值，不重复宿主机制。

## 接入形态（2026-11-05，PLAN-061 T-03）

- `vendor/themes`：UI 管理渠道固定版本快照（themes 0.2.0，内容 digest
  `9fa07742dc68aa5377ae06cb2d966386002063f184c515b6c5dddf8a6bef838e`）。
- pac.at：无 theme 键（缺省 = follow 宿主）；既有 `dep stylekit`/`dep bps`
  不变，新增 `dep themes { path: "vendor/themes" }`。
- `src/front/app.at`：`use themes.themes: Auto` + `dark_mode` 契约位 +
  `design { theme: "Auto", mode: if .dark_mode … }`。双 render 轨
  （render: ["vm","vue"]）同一消费面：VM=iced 主题注册表；vue=生成
  index.html 树主题注入。

## 公共 role 面

chrome（树 sidebar `bg-card`、顶栏 `bg-muted/30`、面板 `border-border`、
输入 `bg-background`）为语义 token 消费（PLAN-001 基座 chrome 形态）。
主题接入 = 官方族供值解析链变化，类名消费面零改动。采样 oracle =
文件树 sidebar bg-card 均匀块（根 col 透明——窗面 dominant 为原生背景，
非主题 token）。

## 合法固定值（内容/业务面，不随主题）

- 编辑器正文/未存稿脏标/草稿保护（draft_recovery）/撤销栈/恢复面板：
  业务面不随肤重染（D 腿：type_text 草稿跨活体翻转守恒 + 保存磁盘
  字节直证）。
- autodown_editor 组件内容渲染面：引擎内容域。
- warn/amber 语义提示色（warn_label）：语义固定值。

## 主题腿实录（tests/test_061_theme.py，5/5）

A `#0f0f12` / B `#ffffff` / C Solarized/dark 宿主候选 `#073642`（sidebar
bg-card 精确）/ D 真实开档（树行 press）+ 整文 type_text + 活体翻转草稿
守恒 + 保存磁盘字节含标记 / E 冷恢复 `#eee8d5` + 标记磁盘存续。
原门 vm_matrix：arm MCP 口 9381 落 WinNAT 排除段——pick_port.mjs 复活；
基线 v35 重锁（delta 全录头注）；merged 臂 15 PASS，trash 增强子步败=
base probe 对拍同域预存上游漂移（候选≥base 逐检查）。
