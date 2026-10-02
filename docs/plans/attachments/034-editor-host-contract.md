# 034-editor-host-contract.md — PLAN-034 能力矩阵与入口盘点（工作阶段附件）

> 状态：T-01 落表（inventory 相位证据已入）；T-02 补 save/commands 判定列；T-03 补 navigation 判定列与供给出口。
> 探针：`node tests/probe_editor_host.mjs --phase inventory|save|commands|navigation|all`（可重跑；e2e 对应 `e2e/editor-host-capabilities.spec.ts --grep <相位>`）。
> 约定：状态 ∈ 已可消费（公开宿主入口在指定轨实际被调用）/ 供给存在待接线（公开机制已证，Jade 未消费）/ 缺供给（缺层定位到仓）/ 受阻（阻断证据+owner+重入）。源码观察与运行证明分列；运行面证据 revision = jade-edit 08d7c08 + 附件首跑探针实录。

## 0. 工具链与载体指纹（T-01 探针首跑实录）

| 项 | 值 |
| --- | --- |
| auto.exe | `auto 0.1.0+v0.4.2-2511-gb50dce902-dirty`（debug 10-01 伴生在录载体） |
| auto-lang | 0aa3a6697a69ee9e456d3e2c2b63393b48df21e8（describe v0.4.2-2565-g0aa3a669-dirty） |
| auto-down | 895f8d0f9355c9f5ec3ce8fca268bdb768395846 |
| engine dist | mtime 2026-10-02T01:35:32Z；entry sha256 AE6CCD56…D9A640 |
| jade-edit | 08d7c08（plan034 落档批） |
| 载体① merged | 探针工程 `auto run -r vm`（隔离 e2e/.runtime/probe-editor-host/） |
| 载体② 原生 split | 探针工程 `auto run -r vm --no-merge`：**boot 成功**（最小宿主无 F-24-2 阻断；jade 应用 split boot 阻断以 vm_matrix 在录为准，不因探针工程可启动而翻案） |
| 载体③ Vue＋split 后端 | serve-back（`auto run --server vm`）+ gen/front/vue vite（e2e 双 webServer 配方）+ 探针工程 `auto build -r vue --gen-only` 形状面 |

## 1. 用户可见入口清单（AC-02；源码锚点 + 真组件观察）

| 入口 | 载体 | 源码锚点 | 运行证明 | 结论 |
| --- | --- | --- | --- | --- |
| toolbar 保存图标钮 | 原生+Vue | app.at actions `file.save`→ActSave + toolbar item；App.vue `button[title="保存"]` | e2e inventory：按钮可见；vm_matrix check5 保存面（在册） | 已可消费（宿主 ActSave 门链真实落盘） |
| 菜单 文件→保存 | 原生+Vue | app.at menubar-item 保存 onclick ActSave | 源码锚点（菜单 click 面属 D-21 v11③ 瞬态家族，逐项点击不在本片断言域） | 已可消费（同 ActSave 共口） |
| Ctrl+S | 原生+Vue | actions shortcut "Ctrl+S"；vue __autoActionsKeymap 'Ctrl+s'；VM action_config normalize_shortcut | 探针 I5：autoui_keyboard Ctrl+S→HostCtrlS 回执（merged）；e2e save 相位补真键面（T-02） | 已可消费（合成通道直证；真键面 vue 轨 T-02） |
| 引擎 Save 钮（编辑器动作栏） | 仅 Vue | EngineEditor.vue L26 `.autodown-editor-save` 无条件渲染；emit('save', serialize(engine.doc,true))；defineExpose handleSave | e2e inventory：按钮可见显 "Save"；`:show-actions` 落 DOM attr（defineProps 无此 prop——attr 透传非消费）；点击效果归 save 相位（T-02） | 供给存在待接线（save 相位终判） |
| 六命令菜单（编辑→撤销/重做/剪切/复制/粘贴/全选） | 原生+Vue | app.at menubar edit 菜单 onclick ActUndo…ActSelectAll；editor_store.at 仅 console_log（T-00 实勘登记在案） | 源码锚点 + 探针 commands 相位（T-02）：宿主回执可达、内容零变化 | 缺供给（宿主命令桥）——T-02 终判 |
| 六命令快捷键 | 原生+Vue | undo/redo/select-all 有 shortcut（Ctrl+Z/Y/A）；cut/copy/paste 无；vue keymap 另证 **Shift 修饰丢失**（Ctrl+Shift+O →'Ctrl+o'→ActOpen 抢占孤页清单快捷键——生成器组合键构造缺 Shift 位，既有面在录，非本片修复项） | 探针 commands 相位（T-02） | T-02 终判 |
| F5/菜单/工具栏重载 | 原生+Vue | bind F5→Reload + actions view.reload（PLAN-030 在册） | 在册（editor-safety 规范） | 已可消费（非本片对象） |
| 正文 wiki 链接点击 | 仅 Vue | EngineEditor wikilinkOpener→emit('open-wiki-link', title, blockId?)；App.vue 无 @open-wiki-link 监听；生成器发射名为 @openwikilink（**emit 名不匹配**） | 探针 vue 形状：@openwikilink 发射、kebab 形零命中；e2e navigation 相位补真组件点击（T-03） | 缺供给（双层：生成名不匹配 + App 未接线）——T-03 终判 |
| 原生正文链接点击 | 仅原生 | VM 编辑壳无链接点击路由（widget.rs；快照中候选绑定仅声明保留） | 探针 M3：click 后 link 事件零回执 | 缺供给（auto-lang 转换+VM 壳） |

## 2. 六能力×三载体矩阵（AC-01；T-01 inventory 判定 + T-02/T-03 补）

图例：①merged（原生 VM）②原生 split（前端）③Vue＋split 后端。每格：源码观察 / 运行证明 / 状态。

### save

| 载体 | 内核符号 | 公开入口 | Auto 语法/参数 | Jade 触点 | 运行证明 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| ① merged | VM 编辑壳 core.handle_input（INPUT_TEXT） | oninput→on_change 全文单参；**无 save 消息通道**（View::AutodownEditor 仅 key/value/is_final/on_change/on_focus/placeholder/style） | `oninput: .Edit(str)`（在册）；`onsave:` 候选语法被视图模板保留但零消费（快照显形、零回执） | app.at L1613 仅 content/oninput；ActSave→store.Save | 探针 M2（type_text 全文回写逐字节含 CJK）+ M3（save 零回执）+ I5（Ctrl+S→宿主回执） | 缺供给（编辑器 save 事件）＝auto-lang 转换+VM 壳；宿主捷径/按钮=已可消费入口（store 门链真实） |
| ② 原生 split | 同①（同转换层） | 同① | 同① | 同①（Jade 应用 split boot 阻断 F-24-2 在录——接口面与①同层，探针工程 boot 成功证最小宿主不受阻断） | 探针 B1（boot 成功）；接口判定继承①（同转换层） | 同① |
| ③ Vue | EngineEditor emit('save', serialize(engine.doc,true)) + defineExpose handleSave；Save 钮无条件渲染（showActions prop 不存在——`:show-actions` 落 DOM attr，e2e inventory 实证 attr 透传） | `@save`（emit 名匹配）；`handleSave`（ref 面） | 生成器 `onsave:`→`@save` 发射（形状检查实证）；App.vue 现状仅 @update:modelValue | e2e save 案：引擎 Save 钮点击=零落盘+脏标保（emit 无消费者）；宿主 toolbar 保存=真落盘（原文/标记/frontmatter 三验）；编辑器聚焦态真键 Ctrl+S=真落盘且单次（引擎无内部 Ctrl+S——零双保存面） | **供给存在待接线**（消费设计=§3/§5；show_actions 隐藏按钮路线不可作为修复假设——prop 不存在） |

### command（六命令 undo/redo/cut/copy/paste/select-all——逐项终判）

| 命令 | ①② native（源码观察/运行证明） | ③ Vue（真组件/真键） | 终判 |
| --- | --- | --- | --- |
| undo | 宿主 action 捷径可达 handler（探针 C1 undo=1）；编辑器内部撤销**不存在**：key_press 词表拒绝 'ctrl+z'（Invalid keyspec 实录——PLAN-057 v1 词表无修饰键）且零回执零突变 | 引擎内部 Ctrl+Z 真键撤销生效（内容复原，e2e commands）；宿主菜单 撤销点击=零效果（console_log 降级直证） | native=缺供给（无内部栈+无执行桥，双缺）；vue=内部快捷键已可消费+宿主桥缺供给 |
| redo | 同 undo（C1 redo=1；同词表拒绝面） | 同 undo（Ctrl+Y 内部；菜单零效果同族） | 同 undo |
| cut | 宿主按钮回执（C1 cut=1）；无捷径在册；执行桥缺失 | contenteditable 浏览器原生命中（真键面——浏览器能力非组件 API）；宿主菜单零效果（同族在录） | native=缺供给；vue=真键可用（浏览器面）+宿主桥缺 |
| copy | 同 cut（C1 copy=1） | 同 cut | 同 cut |
| paste | 同 cut（C1 paste=1） | 同 cut | 同 cut |
| select-all | 宿主 Ctrl+A 回执（C1 selectall=1）；正文零变化 | Ctrl+A 编辑器内=浏览器原生全选与宿主 ActSelectAll 并行、内容零破坏（e2e commands） | 同 cut 族 |
| 全局热键冲突 | MCP 合成通道无焦点语义（key_bindings 查找派发——真键焦点行为不由此通道代表） | vue keymap 修饰键全局拦截无焦点甄别（当前无害：Ctrl+Z/A 双通道并行零互扰）；**Shift 修饰丢失**：Ctrl+Shift+O 实测被 'Ctrl+o'→ActOpen 抢占（e2e commands 实录——孤页清单快捷键失效、dialog 取消垫片下无害）；Ctrl+Shift+F/D 同族塌缩 'Ctrl+f'/'Ctrl+d' | 下一片处理建议：菜单不可用项显式禁用/提示；keymap Shift 修复=auto-lang 生成器供给（不在本片） |

### link

| 载体 | 源码观察 | 运行证明 | 状态 |
| --- | --- | --- | --- |
| ①② native | 无链接消息通道（同 save 格） | 探针 M3/N2 link 零回执 | 缺供给（auto-lang——供给附件 §B-2） |
| ③ Vue | emit('open-wiki-link', title, blockId?)（全局 wikilinkOpener seam）；生成器发 @openwikilink（名不匹配）；App.vue 零监听 | 探针 vue 形状（@openwikilink 发射、kebab 零命中）+ e2e navigation（链接渲染面 span.autodown-wikilink-label[data-wikilink-title] 可见；点击零导航、无新 tab——title 不被当 path，安全侧现状） | 缺供给双层（生成名不匹配=auto-lang §B-1 优先解锁；未接线=jade-edit §C-3） |
| 后端解析供给 | link_index 行 {target,anchor,exists,target_path} 四级已解析（resolve_target 私有：stems 精确→aliases 精确→stems casefold→aliases casefold；anchor=`#` split_once） | 探针 N3/B2 双臂已知答案全过（目标页/靶心/tgt→Tgt.ad；缺失页 exists=false path=""; 目标页#sec1 anchor 伴随） | 已可消费（OpenLink(path)=开档口，title 不当路径——现状保真） |

### selection / cursor / reveal

| 能力 | 源码观察 | 运行证明 | 状态 |
| --- | --- | --- | --- |
| selection | vue：引擎内部 selection + editor_drag 拖选合成（MCP 面，本片未拖选——合成通道不改变宿主读出面）；native：core 内部 | 无宿主选区快照读出（双轨） | 缺供给（读出面——§B-4）；vue DOM 选区=浏览器面 |
| cursor | 无 caret 行列字段；oncursor 仅 code_editor 壳（vue.rs base_event_to_dom 注） | 块聚焦≠caret 判定成立（无 caret 数据可读） | 缺供给（caret 读出——§B-4） |
| reveal | getBlockMap（vue 公开导出）+ data-block-id DOM 域（^anchor 显式或 block-<i> 位置回退——同内容确定性）；scroll_sync offset 写入通道（PLAN-043 native）；无块/锚 reveal 原语 | e2e navigation：data-block-id 集合切档往返逐值稳定（reveal 定位候选坐标域实证）；探针 M3/N2 块聚焦消费面受阻边界（click 直写 ghost state 不经 handler） | vue 块域=已可消费（公开契约）；reveal 调用=缺供给（§B-4）；native 块聚焦消费面=受阻（headless 边界——owner auto-lang，重入=真键或等价合成通道） |

## 3. 保存来源身份缺口（AC-03；T-02 终判）

探针 S1 反例（已执行）：A/B 编辑器同正文、active_key 恒指 doc-a、事件源于 B——INPUT_TEXT 载荷=全文 md 单参（无 tab_uid/实例世代字段），B 键入零串扰 A（通道独立可分）但宿主仅凭载荷+active 读回不可辨识来源。vue 侧 emit('save', md) 同为 md 单参（EngineEditor emit 签名）。缺层：上游无来源字段供给（auto-lang 事件载荷 + auto-down emit 载荷均无实例身份）；jade-edit 消费设计须按 034 §5.2 方案（Store 门快照+世代绑定+迟到拒绝）另行真实验证——两条候选路线（可靠接入 / 控制动作栏仅留宿主入口）中后者受限于 showActions prop 不存在（按钮无条件渲染，隐藏能力=上游新增面）。

## 4. 复跑命令

```
node tests/probe_editor_host.mjs --phase inventory   # T-01
node tests/probe_editor_host.mjs --phase save        # T-02
node tests/probe_editor_host.mjs --phase commands    # T-02
node tests/probe_editor_host.mjs --phase navigation  # T-03
node tests/probe_editor_host.mjs --phase all         # T-04 全量
pnpm exec playwright test -c e2e/playwright.config.ts e2e/editor-host-capabilities.spec.ts --grep inventory|'save|commands'|navigation
```
