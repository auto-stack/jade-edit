# jade-edit v0.1.0 Release 文档（发布收口批——PLAN-039）

> v0.1.0 = **Windows 源码试用里程碑**（配合母工程 auto-lang v0.5）：
> 面向中文个人 wiki 目标用户的 `.ad`（AutoDown/markdown-wiki）桌面
> 编辑器。产品定位/北标见 [README.md](README.md) 与
> [ARCHITECTURE.md](ARCHITECTURE.md) §1；双轨差异/已知缺口登记见
> [parity-ledger.md](parity-ledger.md)。
> 本批（PLAN-039）刷新现势判据与指南；029 时代判据表（§1 旧版）由
> 030..038 后的当前门链替代——历史回执锚保留 §5。
> **发布状态分列**（不混称）：`preparation_only`（现行——最终工具链
> RC 未冻结，D-01）→ `jade_ready`（本仓门全绿）→ `publish_ready`
> （另需用户试用确认＋母工程联合发布门）。当前 = preparation_only。

## 1. v0.1.0 判据（现行——PLAN-039 十项 AC 的发布面摘要）

| # | 收口件 | 状态 | 证据锚 |
| --- | --- | --- | --- |
| ① | 功能截止点冻结（030..038 已交付面） | ✅ 在册 | 038 archived/delivered@80eeea6；本批仅收口修复（空文输入起点＋引擎假保存入口下线），无范围扩张 |
| ② | 双形态基础使用验收（空文输入/保存/重启读回/保护弧） | ✅ 本仓证据在册 | e2e release-readiness 缺口套件 4/4 + vm_matrix merged 20/20 + 空文件保存 0 字节实测——docs/releases/v0.1.0-rc/readiness.md |
| ③ | 可复现候选与依赖冻结（工具链/engine dist/源提交可核对） | ⏳ D-01 待 RC | manifest 字段 pending；本机 dirty/release 载体仅准备证据 |
| ④ | 干净新路径 PowerShell 指南实走（双形态） | ⏳ T-03 | trial-guide §1 定稿后实走回填 validation.md |
| ⑤ | 用户真实试用 ≥1 轮确认 | ⏳ 待用户 | trial-guide §6 回执（029 判据②延续——确认口径不变） |
| ⑥ | 母工程联合发布门（R-03/R-04） | ⏳ 外部 | manifest.gates；本仓不代执行 |

> 历史判据（029 三收口件）其中「release 批全量回归 receipt」以 030..038
> 各批全量门链延续承载；「CJK 开档 vue 轨」✅ 维持（archived/028）。

## 2. 交付形态

**v0.1.0 = 源码里程碑**（仓库自建自用形态——**无独立安装包**；打包批
= v0.2.0 候选）。发布资料必须说明需要工具链和兄弟仓依赖，不承诺独立
安装包或单独静态 dist 可运行。

| 形态 | 启动（PowerShell） | 说明 |
| --- | --- | --- |
| **原生 merged（主交付形态）** | `$env:JADE_WORKSPACE="<wiki 目录>"; & <auto.exe> run -r vm` | back 进程内直调，单命令单进程；原生窗 |
| **Vue 集成形（第二交付形态）** | `& <auto.exe> run -r vue --server vm -B 8211 -F 4443` | vue 前端 serve + HTTP 后端自动接线；浏览器开 http://127.0.0.1:4443；端口可换 |
| 原生 `--no-merge`（split） | 开发/补充诊断路径 | boot 已恢复（034 时代 F-24-2 未复现实测在册）；链接消费未联验单列——不以其证明上述两形态 |
| 单独 Vue dist 静态 serve | 非独立发行形态 | 未验证 API 路由前不提供独立运行承诺 |

**依赖**（最终版本/hash 以 manifest 冻结回填为准）：

- `auto.exe`（auto-lang 工具链）——最终 v0.5 RC 来源待 D-01；本机调查
  载体（debug 2730-dirty / release 2747-gab7a650bd）仅准备证据；
- Node.js + pnpm（vue 形态构建用）；`pnpm install` + `pnpm build`；
- 兄弟仓结构（auto-down 引擎包 / auto-edit stylekit 相对依赖）——
  获取指南见 [trial-guide.md](releases/v0.1.0-rc/trial-guide.md) §1。

> **集成形运行注记（F-29-R3 延续）**：`auto run -r vue` 启动即再生部分
> 生成文件——repo 验证链在 `auto run -r vue` 之后跑 e2e/build 前需先重跑
> `pnpm build`；用户试用零影响。

## 3. 试用指南

完整可执行走查清单（含样例工作区、正常/异常场景、回执表）：
**[docs/releases/v0.1.0-rc/trial-guide.md](releases/v0.1.0-rc/trial-guide.md)**。

要点速览（PowerShell；逐项检查 `$LASTEXITCODE`）：

```powershell
$env:AUTO_EXE = '<冻结工具链>\auto.exe'
$env:JADE_WORKSPACE = 'C:\jade-trial\my-wiki'   # 你的工作区副本
& $env:AUTO_EXE run -r vm                        # 形态一
& $env:AUTO_EXE run -r vue --server vm -B 8211 -F 4443   # 形态二
```

- 样例语料随源码交付：`docs/releases/v0.1.0-rc/sample-workspace/`
  （复制为你的工作区副本后使用；不依赖任何开发机私有 fixture）。
- 工作区根三级回退（`JADE_WORKSPACE` → `AUTO_PROJECT_DIR` → cwd）——
  **两种形态都必须显式 `JADE_WORKSPACE` 指向你的 wiki**。
- `>200` 页触发状态栏知情警示（试用边界 P≤200 / 名称匹配 depth 8）。
- 菜单替代：组合键含 Shift 的入口（Ctrl+Shift+O/F/D）当前被塌缩——
  用菜单对应项替代。
- 正文链接为已解析面：刚键入的 `[[链接]]` 不实时转换样式；开页不等于
  锚点定位。

## 4. 已知限制（现行注记面——release notes 如实记载）

1. **原生轨空页真实键程待用户核验（E1）**：空文档/清空后编辑器显示以
   页名为文本的标题行输入起点（本批交付）；Vue 形态真实键入已实证；
   原生形态自动化键程仪器受限（合成键不达 DSL handler）——请按
   trial-guide E1 记录实际体验；不可输入则登记上游供给，不静默降级。
2. **引擎动作栏 Save 钮已下线（宿主隐藏）**：上游 `emit('save')` 无消
   费假入口由宿主呈现修复隐藏；保存走工具栏/菜单/Ctrl+S 三真实入口
   （同 `ActSave → store.Save` 共门链）。上游 show-actions 供给维持
   分列（editor-host-capabilities §1.1）。
3. **P ≤ 200 / depth 8 上限**（试用防线）：>200 页知情警示（纯显示
   面）；150 页实测健康（tags_index ≤1.5s 门随 tests/bench_release_150.mjs 保留）。
4. **键程组合键塌缩**（035 在录，上游缺口）：Ctrl+Shift+O/F/D 实际按
   不带 Shift 执行——菜单替代可达。
5. **caret/选区/锚点定位原语缺供给**（D-12 族维持）：无行:列读数、开
   页不定位、块聚焦≠caret；大纲/图谱延后。
6. **split 臂链接消费未联验**：boot 恢复实测（probe B1）；链接消费单
   列，不以 merged 证据替代。
7. **D-41 probe_mtime release 载体挂起**（仪器面非产品）：按 debug 路
   由留证；产品面零涉。
8. **F-32-R2（VM 局部槽串扰）**：安全终态断言在册（reject+零变更+弹
   层留置）——上游 blocker 维持单列。

## 5. 切片摘要（029..038 增量；001..028 一览见 git 历史 v20 版 RELEASE）

| 计划 | 切片 | 一行 |
| --- | --- | --- |
| 029 | 第二十七 | v0.1.0 试用就绪里程碑判据定文 + 六面全量回归 receipt（RELG-2901） |
| 030..034 | 二十八..三十二 | 编辑器宿主能力核验/六命令失效收口/open-wiki-link 消费/name-search/能力契约（R-03a..R-05a 面） |
| 035 | 三十三 | 编辑命令入口真实化——六假菜单移除 + 可见说明守卫 + Ctrl+Z/Y/A 归还控件 |
| 036/037 | 三十四/三十五 | wiki 链接导航（Vue + 原生 merged 真实点击全门，上游 732/737/739 链） |
| 038 | 三十六 | 快速打开独立弹层（三入口共口 + 真实开页过期门 + files 用户面退役） |
| 039 | 三十七 | 发布收口批——空文输入起点（双轨）+ 引擎假保存入口下线 + 发行资料/缺口测试/性能入口持久化 |

> 历史 029 回执锚：`docs/plans/archived/029-*.md` §8（RELG-2901 六面）；
> 判据 r1 交裁注记（试用确认口径/无安装包语义）由本 §1 现行表替代，
> 口径延续不回退。

---

> **状态纪律**：本档当前描述 preparation_only 现势——「准备完成」≠「
> Jade 验收通过」≠「已经发布」。最终版本/工具链 hash/截图以 T-03 冻结
> 候选为准回填（manifest + checksums.sha256 + screenshots/）。
