# screenshots/ — 发行真实图（PLAN-039 T-04）

> 采集纪律（计划 §5.4）：只用第一方样例语料（`../sample-workspace/`），
> 不传播私人库内容；图片逐件带 source_commit、工具链 hash、形态、日期、
> 尺寸与语料说明。**当前 = preparation 候选图**——最终 RC（D-01）冻结时
> 以最终工具链重采并回填本表。

| 文件 | 形态 | 工具链（采集时实测） | 语料 | 尺寸 | 采集日期 | 采集方式 |
| --- | --- | --- | --- | --- | --- | --- |
| vue-main.png | Vue 集成形（serve-back+vite，1440×900 视口） | debug `1dae8b49…339e3`（2730-dirty） | sample-workspace 副本（欢迎页打开） | 1440×900 | 2026-10-09 | Playwright headless chromium page.screenshot |
| vue-quick-open.png | 同上＋Ctrl+P 快开弹层（查询「欢迎」） | 同上 | 同上 | 1440×900 | 2026-10-09 | 同上 |
| vm-main.png | 原生 merged（`auto run -r vm`） | 同上 | 同上（欢迎页打开） | 1113×786（窗口自然尺寸；边缘轻裁切——最终候选重采时最大化窗重摄） | 2026-10-09 | PrintWindow(PW_RENDERFULLCONTENT)——零前台抢占 |

> 隐私注记：vm-main.png 采集初版曾误用前台屏幕拷贝（抓到与本仓无关的
> 前台内容）——**已删除未入库**；现行采集法（PrintWindow 窗口自身表面）
> 结构性排除无关内容。
