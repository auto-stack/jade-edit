# validation.md — Auto Jade v0.1.0 收口回归与验证记录（PLAN-039 T-03）

> 状态：**preparation_only 回归记录**——本档绑定修复批后的当前工作树
> 证据；最终冻结候选（D-01）到位后须在本档追加最终载体重验段并回填
> manifest。计数按实录，不预设。
> 证据日期：2026-10-09；执行环境：本机（Win 10.0.26200 x64，
> Node v25.2.1 / pnpm 11.6.0）。

## 1. 载体指纹（T-01 实测）

| 载体 | 版本 | SHA256 | 角色 |
| --- | --- | --- | --- |
| debug auto.exe | `auto 0.1.0+v0.4.2-2730-g91ae002d3-dirty` | `1dae8b494a045a6409e2b03b7c09ad8d6f3c5bfdad09f82347d947fdc42339e3` | 计划 §4.2 在录调查载体（vm_matrix 默认） |
| release auto.exe | `auto 0.1.0+v0.4.2-2747-gab7a650bd` | `1efdc3ed937ff95448eb2e2d88060dd221cf6b270854a65361b51889ea0a5ee2` | master 干净构建（PLAN-740 复审证据提交） |

依赖调查值：auto-down `895f8d0`（clean）、auto-edit `f9ae2a6`（clean）、
auto-lang 源 HEAD `590cc247d`（含其他会话未跟踪文件，未清理未消费）。
**两载体在全部复现场景行为一致**（readiness §3/§4）。

## 2. 修复批全量门（T-02 落地验证）

| 门 | 命令 | 结果 | 备注 |
| --- | --- | --- | --- |
| 生成链 | `node scripts/regen-vue.mjs` | ✅ 绿（✓built） | 含 vue-tsc + vite build + dist fresh 通道；修复批后重跑 2 次全绿 |
| vm merged 全矩阵 | `node tests/vm_matrix.mjs --arm merged` | ✅ **20/20 ALL GREEN** | 修复批后隔离复跑；[B] 结构基线 v29 **零漂移**（computed 不入 dump、类串不入 id 序列——结构中性直证）；[14 meta] 别名翻转通过 |
| 首跑双红归因 | 同上（首跑） | ⚠️ [B] FAIL＋[14] 别名抛错 → **隔离复跑全绿** | 负载窗瞬态族（F-038-R2 同族）：[B] 状态 dump 瞬态＋别名 8s 窗未翻转；无产物/源码差异，判非回归 |
| e2e 缺口套件 | `pnpm exec playwright test ... e2e/release-readiness.spec.ts` | ✅ **4/4** | 空页种子键入保存落盘 / 清空重输入·真清空对读 / 引擎假 Save 隐藏＋宿主入口保持 / 未编辑空文零污染 |
| e2e 既有宿主面 | `e2e/editor-host-capabilities.spec.ts` | ✅ 绿 | inventory/save 两测按新现实改锚（假钮 toBeHidden；attr 透传结论保持） |
| e2e 全批（44 测试） | `pnpm exec playwright test`（全套件） | 36 passed / 8 failed → 隔离归因见 §3 | 15.3 min 单 worker 负载窗 |

## 3. e2e 批失败逐件归因（隔离复跑）

| 失败件 | 隔离复跑 | 归因 |
| --- | --- | --- |
| draft-recovery 三态+空文副本 | ✅ 3/3 | 批内草稿目录残留伪红（strict violation 双徽标——套件间状态隔离债，先例在册） |
| quick-open 真实开页保护 | ✅ 5/5（整套件） | 批载负载窗 |
| matrix vue 六检查 | ❌ 三连不同点（menuitem 挂/pick9 悬挂/吞拾取错序）→ **修测后 ✅ 全绿（1.3m 干净通过）** | 两层测试债（038 弹层迁移遗留，非产品回归）：①openQuick 假定可重入——模态域外菜单不可达是 D-55⑥ 在录设计，menuitem 恒挂（应用根 aria-hidden 直证）→ 开层幂等；②弹层行点击两形态瞬态（D-21 v11③ 家族实测：点击回执悬挂[开档重渲染窗]＋点击 resolve 效果被吞[假完成]）→ pick9/RecCap 补关层判据（拾取生效必关层）＋短超时重试。vm 轨对位 [11] 无此形态（MCP 合成不经 aria 语义）零改动 |
| lifecycle ⑩ trash 弧线 | ❌ 单跑复现 → **menu() 有界重试后 ✅ 5.2s 干净通过（整套件 ⑩ 单测+全件）** | 文件菜单 popover 开层瞬态（D-21 v11③ 同族）——⑩ 前弧 restore 重开 tab 的重负载窗内吞开层；共享 menu() helper 3×3s 重试（其余 ①..⑨ 零改动同 helper） |
| wiki-link 三测（未保存源/过期窗/失败终态） | ✅ 8/8（整套件 1.1m） | 批载负载窗（F-038-R2 同族——批量红隔离全恢复） |
| release-readiness 清空重输入（强化版） | ❌ 真清空判据暴露 → **改真实清空路径后 ✅ 4/4** | 测试前提修正：编辑器 select-all = 逐块 contenteditable 宿主的浏览器原生面（editor-command-availability §1.2 在册）——Ctrl+A 只清聚焦块不达全文档；改逐块退格真实清空路径后全绿。**如实注记**：这是引擎块宿主语义的已知呈现（非缺陷翻案），trial-guide A8 同步改为退格口径 |

**批量终验**：全套件 e2e 批（含全部修测）复跑结果见 §2 追加行。

## 4. 修测记录（matrix 弹层韧性——三层）

- openQuick 幂等：开层前探测 input 可见性——已开跳过菜单两击（模态域外菜单
  不可达 = 产品正确行为）；闭态照走。
- pick9 关层判据：拾取生效必关层（QuickPick→quick_open false）＋8s 短超时
  ×3 重试（悬挂/吞点击均入重试；已开档直激活幂等）。
- RecCap 循环同判据补齐（同族最后一处未防护点——RecCap12 吞拾取实录）。
- 影响域：仅 e2e 测试代码；零产品面改动（产品行为两次直证为正确：aria-hidden
  模态语义＋拾取即关设计）。

## 5. 探针面（T-01/T-03）

> **运行环境事件（2026-10-09 用户报告）**：用户报告「auto-jade 最近经常卡住
> （失去响应），最近的几次崩溃都是手动关闭」。Windows 事件日志实勘：4 次
> auto.exe 挂起（Event 1002/WER 1001，PID 8440）集中 **12:13–13:34——恰为本
> 计划回归批量窗**（vm_matrix＋probe 家族＋e2e 批并发：数十个原生窗＋
> headless chromium 同机竞载）；14 天窗内另仅 **09-29 孤例**（早于本会话
> ——低频挂起预先存在）。probe 家族三件 receipt 失效即此因：运行中应用被
> 关闭（probe_native_wiki_link N/M 臂 app exited、probe_command_availability
> 中断异常、probe_quick_open prod text-panel 面消失）——**基线对照已证与
> 本批改动无关**（git stash 还原 038 源码后 probe_native_wiki_link 同形态
> 崩溃复现：N/M 臂同 exit 3489660927）。挂起根因域=上游（iced/VM 事件循
> 环在重载下的 UI 线程停带——D-45② 仪器楔死族同域），owner=auto-lang；
> 用户实例重启后（13:36，PID 1588）响应正常。**行动项**：①挂起簇已如实
> 记入本档与 readiness §5；②剩余原生窗测试改为最小占用批串行；③最终候
> 选 T-03 重验时在静默环境复核（D-01 重入门既括）。

| 探针 | 载体 | 结果 |
| --- | --- | --- |
| `probe_editor_host.mjs --phase all` | release 2747 | ✅ 四相位全案通过（inventory/save/commands/navigation + split boot B1 恢复 + vue 形状）——预期缺能力案按行在册（unsupported≠功能成功） |
| `probe_alias_linkify / casefold / create / daily / delete / dir_move / dir_ops / draft_protocol / inline_tags / lifecycle / name_search / page_meta / receipt_d19 / recent / rename / tags / trash / wiki_link_navigation` | debug（默认） | ✅ 全部 RESULT 全案通过（双臂一致=true 逐件在册） |
| `probe_quick_open.mjs --phase all` | debug | ⚠️ 22 pass / 1 fail / 2 blocked——prod 臂 text-panel input 消失（应用被运行环境事件关闭所致，见上）；t1 相位与既有 prod 案（038 复审 10/0/2+18/0/0）为全绿在册 receipt——待静默环境补跑后回填 |
| `probe_command_availability.mjs` | debug | ⚠️ 运行中断异常（同环境事件）——038 复审 receipt 在册，待静默环境补跑 |
| `probe_native_wiki_link.mjs --phase all` | debug | ⚠️ N/M 臂应用退出（环境事件；**基线对照同崩**=改动无涉）＋BLOCKED 3 如实在册（F 错误臂等）——037 receipt 31/0/3 在册，待静默环境补跑 |
| `probe_mtime.mjs` | debug（D-41 路由） | ✅ merged + split 全案通过（五案+双臂一致——release 载体挂起为在录仪器面，按 debug 路由留证） |
| `draft_recovery_matrix.mjs` | debug | ✅ ALL GREEN |

## 5b. e2e 截图与素材（T-04 证据）

- `screenshots/vue-main.png` / `vue-quick-open.png`：headless chromium 实拍
  （样例语料，欢迎页+快开弹层）；`vm-main.png`：PrintWindow 窗口表面实拍
  （零前台抢占）。逐件元数据见 `screenshots/README.md`。
- 采集初版 vm 截图曾误抓前台无关内容——**已删除未入库**（README 隐私注
  记在册）；现行采集法结构性排除无关内容。

## 6. 性能与规模（§6.2）

`tests/bench_release_150.mjs`（新持久件）150 页语料实录（2026-10-09，
debug 2730-dirty 载体）：

| 项 | 实测 | 判定 |
| --- | --- | --- |
| **tags_index 全量（硬门 ≤1500ms，029 延续）** | **244 ms** | ✅ 门内（p21 首测 246ms 量级维持） |
| link_index 冷/热 | 288/283/280 ms | 观察值 |
| search（CJK/ASCII/别名） | 56/65/63 ms | 观察值 |
| create ×3 / rename（反链改写） | 2/1/2 / 49 ms | 观察值 |
| 完整性锚 | pages=150→153、首/深锚在、悬空=10、改名改写翻转✓零残留✓ | ✅ |
| UI boot-ready | 3823 ms | 观察值（p21 2.64s 量级同域） |
| 快开过滤 | 1159 ms / 命中 11 行 | 观察值 |
| **深档开档（拾取→播种）** | **23875 ms** | ⚠️ 观察值记录（d1/d2/d3/d4 深档经快开拾取开档 24s@150 页——上游 names/read+open 路径观察项，owner=auto-lang；不发明硬门，最终候选重验对照） |
| 保存弧线（ActSave→刷新族） | 526 ms | 观察值 |
| 孤页清单 | 2927 ms / rows=0 | 观察值 |
| 警示面 | ws_warn 空（≤200 恒零） | ✅ |

vm_matrix merged 内规模案：⑩b/⑩c 防线（201 页警示+警示窗内快开可用）✅。

## 7. split 诊断（§6.1 单列——不作支持形态门）

`vm_matrix --arm split` 两轮实录（2026-10-09，debug 载体）：

- 轮 1：boot 起全链至 [10m] 提及面板流——「转为链接」钮流程在 split 载体
  不可达（崩出）。
- 轮 2：[1] boot-ready 8s 窗一次超时 FAIL，[2 tree]/[3 open]/[4 edit]/
  [5 save]/[6 reload]/[E cmd-avail]/[7 tab]/[8 editops]/[10 link] 全 PASS，
  [10b] 行点击开档流 active_title 未切换（崩出）。
- 判读：**split 诊断路径核心链（树/开档/编辑/保存/重载/命令收口/tab/编辑
  操作/链接面板）两轮稳定可用**；分歧点集中在提及 linkify 与行点击开档
  交互流——与「split 链接消费未联验」单列一致，如实记录，不掩盖为双轨
  全绿，也不以 merged 证据替代。

## 7b. 草稿恢复矩阵

`node tests/draft_recovery_matrix.mjs` → **ALL GREEN**（真实退出 exit=0、
墓碑/消费/来源零伤全案）。

## 8. 干净路径实走（AC-06）

（待 T-03 定稿 trial-guide 后按指南逐条实走回填——当前样例语料
`docs/releases/v0.1.0-rc/sample-workspace/` 已随源码交付。）
