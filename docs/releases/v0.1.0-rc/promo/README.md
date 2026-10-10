# promo/ — v0.1.0 宣传截图套件（PLAN-040 T-07）

> 采集纪律（沿用 PLAN-039 §5.4）：只用第一方手册语料（`../sample-workspace/`
> ——14 页「产品手册即示例库」），不传播私人库内容；逐件带 source_commit、
> 工具链 hash、形态、日期、尺寸与语料说明。**当前 = preparation 候选图**——
> 最终 RC（PLAN-039 D-01：auto-lang v0.5 冻结）到位后随 039 终收口以最终
> 工具链重采并回填本表（届时 product 身份面已是 auto-jade，零二次返工）。

| 镜头 | 文件 | 内容 | 形态 | 尺寸 | 采集日期 | 采集方式 |
| --- | --- | --- | --- | --- | --- | --- |
| P1 主界面 | p1-main.png | 欢迎页打开——文件树/编辑器/状态栏三区全景（AutoJade 状态栏入镜） | 原生 merged（`auto run -r vm`，窗口最大化） | 1933×1245 | 2026-10-10 | PrintWindow(PW_RENDERFULLCONTENT)——零前台抢占 |
| P2 反链面板 | p2-backlinks.png | 「双链与反链」页＋右栏 LINKS 面板富集态（反链 7 来源＋出链＋未链接提及） | Vue 集成形（serve-back+vite，headless） | 1440×900 | 2026-10-10 | Playwright headless chromium page.screenshot |
| P3 双链跳转前 | p3-wikilink.png | 正文 `[[..]]` 可点态＋「界面导览」链接 hover 高亮 | 同上 | 1440×900 | 2026-10-10 | 同上 |
| P4 标签面板 | p4-tags.png | 标签面板聚合（`#入门 · 4` 等标签族＋提及区段） | 同上 | 1440×900 | 2026-10-10 | 同上 |
| P5 快速打开 | p5-quick-open.png | Ctrl+P 弹层检索「检索」——别名命中「别名与检索」 | 同上 | 1440×900 | 2026-10-10 | 同上 |
| P6 悬空建页确认 | p6-dangling-create.png | 欢迎页红链「尚不存在的页面」点击→「创建页面」确认弹层 | 同上 | 1440×900 | 2026-10-10 | 同上 |
| P7 文件树＋子目录 | p7-filetree.png | 文件树展开态——`子目录/` 展开、嵌套页入镜 | 原生 merged（窗口最大化） | 1933×1245 | 2026-10-10 | PrintWindow(PW_RENDERFULLCONTENT)——零前台抢占 |

## 采集环境（全镜头一致）

- 产品 source_commit：`212551ffc0a54ec4353a09e68ed043b16822d466`（PLAN-040
  改名批 T-04 后工作树——产品身份已是 AutoJade/auto-jade）。
- 工具链：auto-lang debug `auto 0.1.0+v0.4.2-2900-ge0999cee1-dirty`
  （SHA256 前 16 位 `24239007B3AE711B`）——**preparation 载体**，最终候选
  以 D-01 冻结版重采。
- 语料：`docs/releases/v0.1.0-rc/sample-workspace/` 全量副本（14 页手册型
  示例库；镜头内全部页面名/链接/标签/别名均来自该第一方语料）。

## 构图与如实呈现注记

- vm 镜头（P1/P7）取**窗口最大化自然尺寸**（修正 PLAN-039 vm-main 的
  「边缘轻裁切」遗留——最大化后三区与状态栏完整入镜）。
- P4 标签面板为 288px 窄栏竖向滚动设计——长标签行（如「悬空链接与建页 · 3」）
  行尾在窄栏内收止属 UI 如实呈现，非采集缺陷。
- P2/P3/P4/P5/P6 为同一 Vue 会话连续实拍（真实交互链：开页→开面板→hover→
  检索→红链点击），非多会话拼接。

> 隐私注记：全部镜头仅含产品窗口自身表面（PrintWindow 窗口表面 / headless
> 浏览器视口），零前台屏幕内容、零开发者桌面信息；语料为第一方手册，无任何
> 私人知识库内容。
