# editor-safety — 编辑器安全语义（PLAN-030 落位）

范围：手动重载的用户保护流与结果提交门。权威实现：`src/front/editor_store.at`
（RequestReload/ReloadCancel/ReloadDiscard/ReloadReadOf）+ `src/front/app.at`
（用户口薄委托、根确认弹层、bind F5）。本文件是局部新规范（PLAN-030 SD-01..03）；
`docs/ARCHITECTURE.md` §3/§7 的单源与双轨纪律继续适用。

## 1. 手动重载（SD-01）

三个用户入口——F5（bind 层 `"F5" -> .Reload`）、工具栏钮（action
`view.reload`）、视图菜单项——共口 `App .Reload -> store.RequestReload()`，
共享同一保护语义，不得出现第二套判断：

| 条件 | 行为 | 不变式 |
| --- | --- | --- |
| 无文档 | console 注记，无 UI 变化 | 不读盘 |
| 未命名文档（`path == ""`） | StatusBar 提示「请先保存此文档（未命名），再重载」 | 不访问空路径，不改内容 |
| 有路径、干净 | 直接进入受保护读盘 | 不先清 dirty，不改磁盘 |
| 有路径、未保存 | 打开确认弹层，不读盘 | 正文/原文基准/脏标/磁盘全保持 |

确认文案：「重载会放弃此文档未保存的修改」；按钮「取消」（前位=初始焦点
安全默认，vue 实测 Enter=取消）与「放弃修改并重载」。不承诺版本恢复或
下次启动恢复。

取消（按钮/Escape/关闭）：结束请求，正文、original_body、dirty、tab、
磁盘全部不变。明确放弃：仍需通过 §2 的门才落结果。

## 2. 结果提交（SD-02）

请求期快照四标量：`reload_confirm_open` / `reload_target_key` /
`reload_target_path` / `reload_target_body`（终态归零；本体仍由 tabs 管理，
零第二份文档权威）。提交门（`ReloadReadOf`）：

1. **前置门**：目标仍为活动页（key+path 双查，不依赖列表索引）且正文
   等于快照——不满足给「文档已变化，请重新发起重载」，不动正文。
2. **缺档卫**：`exists` 为假 → 「重载失败：文件已不存在 <path>」，正文/
   脏标保持，文档不关闭。
3. **读取卫**：`read_wiki` 异常（try/catch）→ 「重载失败：读取异常
   <path>」，同上保持。
4. **读后门**（vue/split 臂 read await 悬窗内 Edit/TabActivate/CloseTab
   照常派发——迟到结果不得覆盖新输入）：按 key+path 重查 tab，且该 tab
   正文仍等于快照、仍为活动页；任一不满足 → 拒绝覆盖（同 1 文案）。
5. **提交**：body 与 original_body 同置为读回正文、dirty=false、活动投影
   同步；`reload_nonce` 递增并改写 tab key（`<path>#r<n>`）触发编辑器
   重挂载播种。
6. **空文合法**：读回空正文是成功提交，不得以 body=="" 判失败。

nonce 重挂载的因由（T-04 开发期实勘，F-30-R2）：vue 轨引擎 round-trip
非字节保真（如正文首空行被规范化剥除）——commit 写磁盘原文经
replaceDoc → onChange → emitUpdate(规范化文) 回声 `.Edit`，原文≠规范化文
→ dirty 翻真。key 变=重挂载播种（挂载期 lastEmittedMd 预播种零发射，
D-03 在册形态），回声路径整体绕开；双轨同源实现。

## 3. 边界与验证（SD-03）

- **手动口与内部口分野**：`store.Reload`（无守卫直读）是内部业务同步口，
  在册调用者 = RenameGo / MoveGo / RenDirGo / MoveDirExec（改名、移动、
  目录迁移事务的显现链）——用户入口不得接回该口，内部事务也不被用户
  确认流介入。内部事务的脏页风险不由本规范覆盖（路线图 R-02）。
- **非目标如实声明**：本规范不含持久化草稿恢复、自动保存、外部编辑自动
  合并、版本历史、保存并重载选项。「放弃修改」是经明确确认后的放弃，
  不宣称可恢复。
- **vue 轨 Escape**：reka AlertDialog `v-model:open` 双向——Escape 关闭
  仅清开态旗标，快照标量残置惰性（下次 RequestReload 重快照覆盖；
  Discard 门挂快照不挂旗标——F-30-R1：AlertDialogAction 内部先关弹层再
  派发 @click，旗标门恒 no-op）。vm 轨 alert-dialog=Modal 形态：外点/Esc
  不关，仅操作钮经状态翻转关闭，无此残置面。
- **上游边界（如实登记，非本规范欠账）**：引擎空文档零可落点块——新建
  untitled 档真实键入不可达（F-30-R3，上游渲染行为；vm 轨经 INPUT_TEXT
  口可达）；split 臂 boot FAIL=F-24-2 在册缺陷（第十四窗，A/B 对照基线
  src 同形），split 前端行为以 merged 臂 + e2e serve-back 同面分段判绿。
- **验证锚**：vm 轨 = tests/vm_matrix.mjs R 组六弧 + 结构基线 v21；
  vue 轨 = e2e/reload-safety.spec.ts 九段全弧（含 read_wiki 拦截迟到门）；
  存量回归 = vm_matrix merged 17/17 + pnpm test:e2e 2/2（rename 组①脏档
  复原弧已随新语义适配为确认+放弃路径）。
