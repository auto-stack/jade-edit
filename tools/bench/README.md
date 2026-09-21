# tools/bench — 测量套件（PLAN-002 T-02）

**定位**：对照 auto-edit PLAN-005 `tools/bench/bench.py` 收口形态的 jade
化（node 栈）。测量**套件**（跑数与断言）：L0 代理测量 + 预算断言。
**L0 = VM+merged（debug 构建）——无绝对性能效力**，报告价值 = 启动/打开
链形状分解 + 热态回归护栏 + blocked-upstream 项记账基线。数字不入公开
对比面。

## 用法

```
node tools/bench/bench.mjs check               # 依赖自检+环境指纹（工具链 ≥1652 = 669+671 面）
node tools/bench/bench.mjs proxy [--runs N]    # L0 测量（默认 5 跑，首跑弃暖机）→ results/<ts>.jsonl
node tools/bench/bench.mjs assert [--results <file>]   # 存量 measurements × 当前 budgets 重评
```

退出码：`0` 绿；`1` 真失败（含 **hard 预算违例**）。

- `proxy` 产出 `results/<ts>.jsonl`（环境指纹 + 启动分解 + 计时 + 内存 +
  断言终态）；`logs/` gitignored（环境指纹留档可再生）。
- `assert` 对**存量 measurements × 当前 budgets.json** 重评——改 budget
  可对旧结果重判（构造性红证 = 调低 hard 门后对同一结果 assert 出
  exit 1，2026-09-21 实证）。

## 探针矩阵（观测通道四问，T-02 实勘）

| 指标 | 观测通道 | 状态 |
|---|---|---|
| 启动分解（spawn→MCP ready→status ready） | host spawn 计时 + MCP initialize 探活 + 快照就绪轮询（100ms 粒度） | ✅ 在位 |
| 首开冷态（D-16 口径） | press→快照锚可见（新进程首挂载，含一次性全局初始化） | ✅ 在位 |
| 热态回访（hard 护栏） | press 调用往返（UI 线程响应性；总可见时受 D-03 节拍支配不作 hard） | ✅ 在位 |
| 换档可见延迟（D-03 口径） | 换档系列 press→锚可见，取最坏 | ✅ 在位 |
| 大文档打开（C-5 口径） | store 激活态轮询（active_key）——**1MB 实测 30s 不达激活**（整文读链阻塞，read_wiki 未返回），blocked-upstream 实证记录 | ⛔ blocked-upstream |
| 内存峰值 | PowerShell `Get-Process -Id <pid>` WorkingSet64（500ms 采样，按 PID 收） | ✅ 在位 |
| app 侧毫秒值 | VM 轨 time 族内建未接线（auto-edit 同坑，供料包在册） | ⛔ blocked-upstream（全部 host 侧计时） |
| 键入到上屏 / 滚动帧率 | .at 层无帧时间戳通道（auto-edit T-03 同勘） | ⛔ blocked-upstream |
| vue 轨逐键发射 | D-17：blur 门控（切档重挂载实例）——vm 通道 type_text 即发可测 | ➖ 登记暂缺 |

### 实测坑位（T-02 过程登记）

- 大文档须 **Init 前入工作区**（树一次装载，Init 后新档不可见）。
- 大文档锚轮询放宽（快照体积随文档膨胀，100ms 密轮询自饱和）；
  快照有体积上限，文档**尾锚不可达**（截断面即 C-5 口径证据）。
- 1MB 文档 `read_wiki` 整文链阻塞（78s 探针仍 tab_count=0、save_note 空
  ——Open 卡在整文读、未到失败分支）。
- 按 PID 收进程（`taskkill /PID <pid> /T /F`），绝不 `taskkill //IM`。
- PowerShell 采样对已退出 PID 静默（`-ErrorAction SilentlyContinue`）。

## 预算断言语义

`budgets.json` 六行，每行 `{metric, budget, tier, validity, unlock, unit}`
全带。断言报告逐行显式终态，无静默缺席：

- `hard-pass / hard-violation`——hard 门评估（违例 exit 1；现仅
  first_open_warm：UI 线程响应性护栏）；
- `ledger`——记账不阻塞（冷态/切换/启动/内存）；
- `blocked-upstream`——测量本身被上游缺口阻塞（大文档整文读链），
  阻塞事实即记录值；
- `not-measured`——proxy 未产出该指标。

## 基线

`results/baseline-L0-20260921.md`——首版 L0 基线（b8bce4d 既有实测 +
本批 proxy 复跑对照）。
