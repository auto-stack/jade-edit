# 上游问题报告：auto.exe（jade-edit 宿主）UI 挂起 + abort 崩溃（转 auto-lang 修复）

> 报告方：jade-edit PLAN-039 发布收口执行（2026-10-09）
> 接收方：auto-lang owner/agent
> 证据等级：Windows 事件日志 + WER ReportArchive 签名实勘（路径/时间/异常码
> 均可复核）；jade 侧改动已用基线对照排除。
> jade 侧登记：`jade-edit docs/releases/v0.1.0-rc/readiness.md` §8
> 「UI 挂起低频域」+ `validation.md` §5 运行环境事件（含重验行动项）。

## 1. 现象

| 视角 | 现象 |
| --- | --- |
| 用户 | jade-edit 窗口（原生 merged `auto run -r vm`）间歇性「失去响应」（白窗/不重绘/不响应输入），只能手动关闭；报告原文「最近经常卡住，最近的几次崩溃都是我手动关闭的」 |
| 自动化（jade probe/vm_matrix） | 被驱动的 auto.exe 实例在探针中途消失——`app exited (code 3489660927)`；同探针内多个臂相继失联；probe receipt 随之作废 |
| 系统日志 | 挂起（Event 1002，"stopped interacting with Windows and was closed"）与崩溃（WER AppCrash，异常码 c0000409）**两类签名并存** |

## 2. 硬证据

### 2.1 挂起（2026-10-09 当日簇）

- Event 1002 ×4 + WER 1001 ×4：**13:13:07 / 13:21:58 / 13:22:45 / 13:33:59**
  （1001 对应 13:12:55 / 13:21:58 / 13:22:44 / 13:33:52 + 12:13:08 一份）。
- 四份 1001 同一 **PID 8440**，ReportStatus 134217728（0x08000000 = hung app）——
  同一实例 80 分钟内反复挂起、被用户手动关闭。
- 时间窗恰为 jade-edit 回归批量负载窗（并发数十个 `auto run -r vm` 实例 +
  headless chromium 同机竞载）；**14 天窗内另一日仅 09-29 孤例**（见下）。
- 用户的常驻实例（`release/auto.exe run --render vm`，PID 28256）在同窗结束
  后重启，重启后响应正常。

### 2.2 崩溃（WER ReportArchive——周级慢性，早于本次批量）

| 报告时间 | 异常代码 | 异常数据 | 构建路径 | 备注 |
| --- | --- | --- | --- | --- |
| 2026-10-01 00:52 | **c0000409** | **0x7（FAST_FAIL_FATAL_APP_EXIT = abort）** | `D:\autostack\.wt\lang-717\auto-lang\target\debug\auto.exe` | 异常偏移 0x1575ac1；故障模块 = auto.exe 本体 |
| 2026-09-29 17:39 | c0000409 | （同族） | （debug 构建族） | 异常偏移 0x12d321b |
| 2026-09-29 16:46 | 同上 | 同上 | 同上 | — |
| 2026-09-22 21:55 ×2 | AppCrash | — | — | — |
| 2026-09-12 16:03 | AppCrash | — | — | — |

- c0000409 + FastFailData 7 = **Rust `abort()`/fatal app exit 家族**（非访问
  违例）。若 panic 消息有落 stderr，应在启动方（探针/脚本）的捕获流里——
  probe 侧捕获尾为空（消息可能随控制台分离丢失）；建议 auto-lang 侧在
  复现时以 `stderr` 重定向全量捕获定位 panic 位置。
- 应用版本签名 0.0.0.0（auto.exe 无版本资源）——事件按时间戳 6abd342a/
  6aba1120 区分构建。

### 2.3 当日 probe 实测（自动化视角）

- `tests/probe_native_wiki_link.mjs`（jade-edit）双轮：N 臂/M 臂 mid-run
  `app exited (code 3489660927)`；崩点逐轮不同（轮1 M 臂、轮2 N+M 臂）。
- `probe_command_availability.mjs`：运行中断异常。
- `probe_quick_open.mjs --phase prod`：「text-panel input not found |
  app alive」——进程存活但 UI 面未响应/面缺失（与挂起签名一致）。
- **基线对照（排除 jade 侧改动）**：`git stash` 还原 jade-edit 038 基线源码
  后重跑 `probe_native_wiki_link.mjs`，同形态崩溃复现（N/M 臂同
  exit 3489660927）——jade-edit 2026-10-09 修复批（app.at 空文种子 computed
  + 编辑器隐藏类）**不是触发因**。

## 3. 环境与载体指纹

| 项 | 值 |
| --- | --- |
| OS | Windows 10.0.26200 x64（区域 2052） |
| debug 载体 | `auto-lang/target/debug/auto.exe` = `auto 0.1.0+v0.4.2-2730-g91ae002d3-dirty`，SHA256 `1dae8b49…339e3`（2026-10-08 14:22 构建） |
| release 载体 | `auto-lang/target/release/auto.exe` = `auto 0.1.0+v0.4.2-2747-gab7a650bd`，SHA256 `1efdc3ed…5ee2`（2026-10-08 17:00 构建） |
| auto-lang 源 HEAD | `590cc247d`（2026-10-09 调查时） |
| 消费方 | jade-edit main `f49806b`（PLAN-039 work 批；解释数据加载 src/*.at） |
| WER 档案 | `C:\ProgramData\Microsoft\Windows\WER\ReportArchive\AppCrash_auto.exe_*`（09-12/09-22×2/09-29×2/10-01 六份在档可复核） |

注意：debug 二进制（2730-dirty）与当前源 HEAD（590cc247d）不同源——复现时
请以你们侧可重建的当前源构建为准；jade 侧两载体（debug/release）行为无差
异实测。

## 4. 疑似机制方向（供排查，未定谳）

1. **UI/事件循环线程阻塞**：jade 探针经进程内 MCP（HTTP `/mcp`）高频轮询
   `autoui_snapshot`（全 widget 树序列化，250–400ms 周期）——若 handler 或
   树序列化在 UI 线程执行，大树下每次快照即一次主线程停带，外部表现即
   「失去响应」。可先核实 MCP handler 的线程归属与 snapshot 序列化耗时
   （jade 150 页语料实测参照：全量 snapshot ~22KB 文本、tags_index 244ms
   量级）。
2. **多实例并发竞载**：当日簇在并发数十个 iced 实例 + 无头浏览器时发生；
   09-29 孤例与更早 AppCrash 链则无此并发背景——两签名（挂起 vs abort）
   是否同一根因请并案。
3. **abort 来源**：c0000409/FastFailData 7 的触发点未知——建议在 panic hook
   或 stderr 全量捕获下复现（probe 配方可直接给：见 §5），拿到 panic 消息
   即可定位到具体 crate/行。

## 5. 复现建议（jade-edit 仓可直接跑）

```sh
cd D:/autostack/jade-edit
# A. 单实例长驱（挂起观察：任务管理器看「未响应」/事件日志看 1002）
node e2e/.runtime/t01_empty_body.mjs            # spawn run -r vm + MCP 驱动 ~1min
# B. 多实例竞载（当日簇形态）：并行 4-6 个 A，同时再跑
node tests/vm_matrix.mjs --arm merged           # 自带 spawn/驱动/清理
# C. probe 家族（其中 native_wiki_link/probe_quick_open prod 在 10-09 出现
#    实例中途消失；capture stderr 定位 panic）
node tests/probe_native_wiki_link.mjs --phase all
```

（A/B 脚本 spawn 配方：`auto.exe run -r vm` + env `AUTOUI_MCP_PORT`/
`JADE_WORKSPACE`；MCP=HTTP POST `/mcp`，tools `autoui_snapshot`/
`autoui_state`/`autoui_action`。）

## 6. jade 侧联动（本报告的下游承诺）

- probe 三件失效 receipt（quick_open prod / command_availability /
  native_wiki_link）待本问题修复或静默环境后补跑回填
  （`docs/releases/v0.1.0-rc/validation.md` §5）。
- 最终候选（auto-lang v0.5 RC）T-03 重验含静默环境稳定性复核——修复落点
  请回注 PLAN-039（D-01 关联），以便 readiness §8 行动项闭合。
