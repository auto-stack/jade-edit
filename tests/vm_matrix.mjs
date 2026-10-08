#!/usr/bin/env node
// vm_matrix.mjs — jade-edit vm 轨检查矩阵（PLAN-001 T-04 换基双臂化；
// PLAN-081 T-05 原始形态演进；PLAN-002 T-01 扩三组；PLAN-003 T-04 link 扩单）。
//
// 检查单（AC-03 检查单——vue 轨 playwright 断言域与此同单）：
//   1 boot    App 起窗渲染，status=ready（Init → back tree 成功）
//   2 tree    filetree 列出 fixture wiki 文件（.ad 按钮锚）
//   3 open    打开 .ad 进 autodown_editor（textarea 面 + 播种内容可见）
//   4 edit    编辑回写（type_text → INPUT_TEXT → 脏标）
//   5 save    保存落盘（toolbar 保存 → 脏标清 + 磁盘字节含标记 + frontmatter 保留
//             + updated_at 自动维护——PLAN-015：已有键保存即更新值[当日形]）
//   6 reload  重载可见（磁盘外改 → toolbar 重载 → 编辑器见新内容）
//   B base    结构基线 v29 零漂移（仅 merged 臂；必须在 1-6 后、扩单前采集
//             ——v29 锁的是六检查终态，扩单不漂移基线；v29=PLAN-038 快开
//             独立弹层批[state 纯增 8 字段 quick_* 七件+store quick_open、
//             files_rows 退役；id 序列 = 快开根弹层新节点+工具栏 快速打开
//             钮+右栏 files 分支退役——逐项解释在 PLAN-038 T-03 记录]；
//             v28=PLAN-036 正文内链导航批[state 纯增 10 字段，id 序列零
//             变化]留档；v27=PLAN-035 编辑命令入口真实化批留档；v26=
//             PLAN-033 名称查找批留档；v20=PLAN-025 目录合并三择批[v19
//             留档]；v19=PLAN-021 试用赋能批[v18 留档]；v18=PLAN-020 孤页
//             +recents 切片[第五模式 action/menubar 项入 id 序列——计划内
//             重锁第五例]；v17=PLAN-019、v16=PLAN-018、v15=PLAN-016、
//             v14=PLAN-015、v13=PLAN-014、v12=PLAN-013、v11=PLAN-012 等
//             留档）
//   E cmd-avail 编辑命令入口真实化（PLAN-035；B 后 7 前单臂子步——fail 即
//             臂败不占检查位）：toolbar/编辑菜单六执行项零恰等钮（说明
//             dialog description 长句非短词全等——闭态恒渲染不误中）→
//             编辑菜单单「编辑命令说明…」入口 → 说明 dialog 开
//             [editor_commands_help_open=true——可见说明替代 console 降
//             级]→ 正文/脏标恒等 → 关闭仅清旗标；Ctrl+Z/Y/A 键盘零宿主
//             路由（action 表无三键——flag 恒假；直派守卫逐值面归
//             probe_command_availability 真实 Store 臂）
//   7 tab     tab 面：开两档 → 切换（active 断言 + 内容互换）→ dirty 档
//             关闭走确认弹层两路（取消=档留；放弃修改并关闭=结算式弃改——PLAN-031 T-05 三动作化）
//   8 editops 编辑操作族：段中回车/退格（C-5 整文构造——回车分段可见 +
//             退格复原 + 脏标重算 body==original_body→false）
//   10 link   链接索引+反链面板（PLAN-003）：link_index 已知答案（语料
//             首锁：首页悬空 exists:false）→ 视图菜单开面板 → 反链三源
//             行（**显示名 首页/CAP 定理/Tasks——PLAN-014 反链行名化⑤**
//             ；出链/wanted 恒链接文本⑥——12⑤ 非退化并证）→ 点击反链
//             行开 index.ad → 出链行开 CAP 定理.ad → 关档空态（无反链/
//             无出链）→ 重开恢复。执行序在 8 后 9 前（quit 杀进程恒为
//             臂内最后一项）
//   10m mentions 未链接提及段（PLAN-009；link 组子步——组数不变，fail
//             即臂败，10c 同款）：六子步——①三段标题（反链/出链/未链
//             接提及）②提及行已知答案 + 已链源排重（测试内造 Mention A
//             纯文本提及 Hello World / Mention B 已链 [[Hello World]]/
//             Mention C 纯文本提及 Tasks——A 入提及段[B 只在反链段]，
//             段区域断言——文件树同列根档 .ad，全文 includes 误中树行）
//             ③行点击 OpenLink（段内行钮定位——全文首个匹配是树行）
//             ④激活变更刷新（切 Tasks → C 行）⑤空态（开 Mention A 本
//             档——无提及者）⑥面板关零 fetch（行为等价断言——关面板
//             → 激活变更 → mention_rows dump 行恒旧值 + 段不渲染；
//             merged 臂网络不可观测[§10.1 落定口径]）。素材 ASCII 双臂
//             ——search_wiki POST 面无（D-19 不涉）；造档后过一次面板
//             关开触点（LinksRefreshOf——B 入 bl_rows 排重断言域成立）。
//             执行序在 10b 后 10c 前（10c 首步按「面板开/active=Hello
//             World」口径——子步收尾复原该态）
//   10c create 悬空建页弧线（PLAN-005）：悬空行点击 → 确认弹层 → 取消
//             零落盘 → 创建 → 落盘 + 链接翻转（触发集 v2）→ 树新行
//             （G3）→ 行翻转；CJK 开档播种子步双臂（PLAN-028——三契约
//             POST 化收口，split 同单）。子步不占检查位
//             （组数不变 12），fail 即臂败
//   11 find   查找面板双模式（PLAN-004）：快开（Ctrl+P·files——开面板/
//             input 锚/type_text 过滤[Pro→Projects 独行 + CJK 定理→CAP
//             独行 + CJK 拾取导航子步双臂——PLAN-028 POST 化收口]）+
//             全文检索（Ctrl+Shift+F·text——切模式/未运行提示/CJK 查询
//             「任务列表」[POST 通道——D-19 面无，双臂同跑]/行导航面板
//             保持开/运行后空态）+ **alias 检索子步（PLAN-012——fs 造
//             alias 档[10m 同款——检索走 back walk 零树依赖] → 搜 alias
//             → 命中行 title=stem 口径[T-01 直证面] → 拾取开档双臂
//             [ASCII]）** + **trash 模式子步⑥（PLAN-016）+ trash 增强
//             ⑦（PLAN-019——双条目清单→行点击预览[.trash 路径 tab 开
//             active_title=.trash/TrashR1+树不可见]→保存落回 .trash 原
//             位[磁盘标记直证——可编辑口径]→恢复全部[循环 restore→清单
//             空态+磁盘双档回根字节保真]）** + **⑧ orphans 第五模式子步
//             （PLAN-020——空 q 断言修订[005「全量 5 行」→「最近」段替
//             换式，累积位态；首跑无记录全量面 = T-02 冒烟承载]+无 input
//             负向面+fs 造纯孤页档入列→行点击开档→造链清孤→悬空出链计
//             入出链度[resolved 面直证]）+ ⑨ recents 弧线子步（PLAN-020
//             ——清 q[type_text 空]→「最近」段→3 开逆序→拾取即关→去重
//             置顶→容量截断[RecCap×12→10 行]）+ **⑩ 持久化逐行验子步
//             （PLAN-021——⑨ 弧终态 recents RecCap12..RecCap3 ↔
//             .jade/recents.txt 磁盘逐行一致[变更即存落盘面]+快照免索引
//             负向[.jade 点前缀 walk 忽略——树/面板零感知]）**。执行序在
//             10b 后 9 前。**臂尾 ⑩b/⑩c（PLAN-021——check 9 后第二
//             boot，fail 即臂败不占检查位）**：⑩b 跨会话重启载入弧[真
//             进程重启——Init 载入半：recent_paths state 清单逐行 = 磁盘
//             逐行 RecCap12..RecCap3 + 快开「最近」段渲染]；⑩c 防线案
//             [fs 造 201 页微语料→ActDaily 树刷新→ws_warn 警示文案+警示
//             窗内快开可用（纯显示面零功能影响）→清料→零警示回归]
//   N name    名称查找一致（PLAN-033）：标题域同名双行（title-only 页
//             +fm title 页——path 次行可辨）/逐路径打开（各开各档）/
//             alias·相对路径·5 层深档（入口重开 NamesRefresh 读新目录）
//             /模式门（text 正文词行不泄漏 files 面）/外部刷新（fs 改
//             title→重进→新 dtitle）。执行序在 11 后 12 前。错误/迟到
//             门=网络可观测面由 e2e name-search.spec 承载（merged 无
//             网络层不设虚假案）
//   12 rename 重命名+反链改写全弧线（PLAN-006；七子步——禁用态 untitled
//             +脏档/弹层锚[预填+影响面预览]/取消零落盘/改名弧线[active
//             投影+磁盘改写 index·CAP 定理]/面板+树新 stem/case-only 弧线
//             [弹层留置]/状态复原。素材 Projects.ad ASCII 双臂——D-19
//             面无；CJK 改名/自链/清洗/冲突/缺失案由 tests/probe_rename
//             .mjs 八案双臂直证覆盖）。执行序在 11 后 9 前
//   13 file   树文件管理全弧线（PLAN-007；八子步——新建 index[ASCII 根
//             落位]/同名幂等/取消零落盘/CJK 新页[导航断言双臂——PLAN-028
//             POST 化收口]/删除预览+取消[3 处入链已知答案——index/
//             Tasks/Hello World，T-03 实勘校正]/删除弧线[磁盘消失+
//             tab 关闭邻档+树行消失]/悬空翻转[开 index 出链行 CAP 定
//             理（悬空）——PLAN-003 已知答案反向]/未选中 no-op。删除
//             素材 CAP 定理——merged 臂该档 tab 在[check 10 开]关闭面
//             +邻档补位，split 臂现场开→关同面；两臂删后激活均落
//             Project X[右侧邻档同构]。收尾状态复原回 Hello World
//             [quit 前置——typeWholeDoc 目标档]）+ **目录面四子步
//             （PLAN-012——⑩ ⊕ 新建目录[树新行+磁盘在]/⑪ 移动弧线
//             [Project X→DirBox：tab 全量+字节整迁+面板快照前后逐字节
//             一致+links_json 定向 diff 归一相等——移动零扰动三联语义
//             固化]/⑫ 取消零落盘/⑬ 冲突拒[根 index.ad→wiki 同名拒——
//             弹层留置+磁盘零变化]；素材 ASCII 双臂[D-19 面无；CJK
//             目录/移动案 probe_dir_move 八案双臂直证覆盖]）** +
//             **目录面二期三子步（PLAN-014——⑭ 重命名目录弧线[DirBox→
//             DirBox2：弹层双 input+预览「将移动 1 个 .ad 页（链接零改
//             写）」+tab 全量路径变标题恒+磁盘整迁+面板快照零变化+
//             links_json 归一 diff——三联对照目录级]/⑮ 取消零落盘两形
//             [重命名/删除弹层]/⑯ 删除目录弧线[强确认预览计数+悬空警示
//             → tab 全关+树行消+悬空翻转 Project X（悬空）——SD-701 目
//             录级]；键程 = menubar 共口先例；CJK 案 probe_dir_ops 直证
//             覆盖）** +
//             F-R9-4 案（PLAN-010
//             ⑨——删激活靶档→提及行随新激活刷新消[Fr94Src/Fr94Del 弹
//             层造档，收尾双删复原]）。执行序在 12 后 9 前
//   + **目录移动四子步+目录合并弧线（PLAN-018+PLAN-019——㉒移动目录弧
//             线[DirMvA→DirMvB：弹层双 input 源/目标父→磁盘新位字节整迁
//             +旧目录消+tab 全量标题恒+ft_sel remap+面板快照零变化+
//             links_json 归一 diff——三联对照移动级三部曲收官]/取消零落
//             盘/循环卫拒弹层留置[源==目标父自身形]/5 层深档快开命中
//             [depth 8 front 面收口直证——素材 fs 外造 L1/../../L4/
//             DeepPg.ad]；㉓合并弧线[MgA→MgB 同名对：预览行现文+「合并
//             移动」钮显[探针 G 定谳双钮变体]→磁盘并入 靶原档不变+源
//             档字节整迁+源目录消+tab 全量+links_json 归一 diff]/不合并
//             拒径回归[「移动」钮→弹层留置+磁盘零变化]；CJK 案
//             probe_dir_ops m①..mb⑨ 双臂直证覆盖）**
//   14 meta   标签面板+wanted 模式八子步 + inline tag 子步 + 属性子步
//             六案（PLAN-008 + PLAN-009 + **PLAN-011**；多件同组——find
//             组先例。属性子步：untitled no-op/预填回显[目标页双臂同单
//             CAP 定理——PLAN-028 POST 化收口]/取消零落盘[磁盘零泄漏
//             面]/tags 保存+面板即时刷/alias 帽烟别名 exists 翻转
//             [links_json 双臂]/删值弧线[全空白=删键]/保存流互作
//             [frontmatter 存续]；弹层定位=标题锚 content 子树——D-27④
//             同款纪律）。tags 子步：面板开 7 tag
//             行[语料实勘全集——执行期校正：7 非计划记的 6，Hello
//             World.ad 实有 demo]/展开导航双臂[CJK CAP 案 PLAN-028 双臂化]/
//             Save 刷新外造新行。wanted 子步：模式入口无 input 行无检索
//             钮/语料已知答案页面名（1）【执行期校正：悬空全集=首页+页
//             面名，首页已被 10c 消缺故不在此位】+外造 Wanted Target（1）/
//             取消零落盘/创建开档+消缺+exists 翻转+模板逐字节/空态闭环
//             （无悬空链接）。inline 子步（PLAN-009 T-04 meta 组）：⑦外造
//             body #inline-meta 档[fm 无 tags 键——纯 body 聚合源]保存 →
//             面板新行；⑧语料基线零漂移回归（7 语料 tag 行全在 + 忽略面
//             负向——无 block-project-a 行：`{#block-project-a}` 块锚/
//             `\[\[Tasks#block-project-b\]\]` 转义链接锚双形态不入集，
//             TAGS 区段断言[编辑器文本在面板前——全文负向会误中]）。
//             执行序在 10c 后 11 前——此位 tags 全集/悬空余量已知答案成
//             立；收尾复原反链面板开[check 11 首步口径]）
//   9 quit    退出存盘：dirty → 文件菜单退出 → CloseRequest 确认弹层 →
//             QuitSaveClose → 磁盘三验（原文/标记/frontmatter）+ 进程退出
//             （Process.exit 可能先于 HTTP 响应——连接断开即成功路径；
//             本检查杀进程，恒为臂内最后一项）
//
// 双臂（PLAN-001 换基后配方）：
//   merged 臂（默认）  auto run -r vm + JADE_WORKSPACE=隔离 fixture——
//                      back 进程内直调，零后端进程零端口；
//   split 臂（--arm split / gate 全跑）  auto run -r vm --no-merge——
//                      AutoVM HTTP back 同进程起服，HTTP 往返。
// 结构基线（v1）在 merged 臂采集比对（split 臂结构同构，不重复锁）。
//
// 卫生（vm-smoke 同款）：只杀自己 spawn 的进程；fixture 隔离拷贝（源零
// 污染）；断言域 = 结构/文本/磁盘字节（非像素）。
//
// 用法（仓根）：
//   node tests/vm_matrix.mjs                    # 双臂（gate 形态）
//   node tests/vm_matrix.mjs --arm merged       # 仅 merged
//   node tests/vm_matrix.mjs --save-baseline tests/baseline/structure-v2.txt

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const FIXTURE = path.join(repoRoot, 'e2e', '.runtime', 'workspace')

const args = process.argv.slice(2)
const argOf = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const ARM = argOf('--arm') ?? 'all' // all | merged | split
const BASELINE = path.join(repoRoot, 'tests', 'baseline', 'structure-v29.txt')
const SAVE_BASELINE = argOf('--save-baseline')

const EDIT_MARKER = 'jade-edit 冒烟标记：编辑回写可见。'
const RELOAD_MARKER = '外部重载标记：重载可见。'
const TARGET_LABEL = 'Hello World.ad'
// 扩单三组（PLAN-002 T-01）——tab 面 / 编辑操作族 / 退出存盘
const TAB_LABEL = 'Tasks.ad'
const TAB_ANCHOR = '原型设计'
const TAB_MARKER = 'tab 面标记：脏档关闭确认。'
const QUIT_MARKER = '退出存盘标记：QuitSaveClose 落盘。'
const PARA_ANCHOR = '这是一段示例文本'
// rename 组（PLAN-006 T-04）——素材 Projects.ad（ASCII 双臂；入链 index/
// CAP 定理 两页两处——预览/改写断言域）
const RENAME_LABEL = 'Projects.ad'
const RENAME_OLD_TITLE = 'wiki/Projects'
const RENAME_NEW_NAME = 'Project X'
const RENAME_NEW_TITLE = 'wiki/Project X'
const RENAME_NEW_REL = 'wiki/Project X.ad'
const RENAME_DIRTY_MARKER = 'rename 组脏档标记。'
// file 组（PLAN-007 T-04）——新建素材 index（ASCII 根落位；wiki/index.ad
// 同名异位不冲突）+ 新页（CJK）；删除素材 CAP 定理（3 入链 = index/
// Tasks/Hello World——T-03 实勘校正已知答案）。
const FILE_NEW_NAME = 'index'
const FILE_NEW_REL = 'index.ad'
const FILE_CJK_NAME = '新页'
const FILE_CJK_REL = '新页.ad'
const FILE_GHOST_NAME = 'Ghost Note'
const FILE_DEL_LABEL = 'CAP 定理.ad'
const FILE_DEL_REL = 'wiki/CAP 定理.ad'
// 目录面（PLAN-012 T-04）——素材 ASCII 双臂（D-19 面无；CJK 案
// probe_dir_move 八案双臂直证覆盖）
const DIR_BOX = 'DirBox'
// 目录面二期（PLAN-014 T-04）——DirBox 改名目标 + 删除素材（Project X
// 在册：12 改名 stem 面 + index 入链 + tab 在——三联对照目录级素材）
const DIR_REN2 = 'DirBox2'
// tab 重映射弧（PLAN-025 T-03）——skip 改道位保存标记（F-R19-1 直证）
const SKIP_EDIT_MARKER = 'skip 弧保存标记：.trash 位落盘。'
// 安全手动重载组（PLAN-030 T-04）——确认/取消/放弃/直入/缺档/untitled 六弧
const RELOAD_DIRTY_MARKER = '安全重载脏标：未保存确认弧。'
const RELOAD_DISK_MARKER = '安全重载磁盘外改：放弃弧。'
const RELOAD_DISK2_MARKER = '安全重载磁盘外改二：干净直入弧。'
const RELOAD_DIRTY2_MARKER = '安全重载缺档弧脏标。'
const RELOAD_CONFIRM_TEXT = '重载会放弃此文档未保存的修改'
// LC 生命周期受检组（PLAN-032 T-06；R-02b）——素材根落位 ASCII（树行=stem）。
// 有界案：UI 键入恰一次（LC-B 单检查点——D-45② 上游楔死边界 3+ 检查点，
// 单文档恒过在册）；无关脏页不列断言由 e2e lifecycle-safety ① 承载（vm 组
// 键入预算内不造第二脏档）。
const LC_MARKER = 'LC 组脏档标记。'
const LC_A = 'LC-A.ad'
const LC_B = 'LC-B.ad'
const LC_DEL = 'LC-Del.ad'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------- MCP client（每臂独立端口） ----------------
function makeClient(port) {
  let nextId = 1
  const rpc = async (method, params) => {
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
    })
    if (!res.ok) throw new Error(`MCP ${method} -> HTTP ${res.status}`)
    const body = await res.json()
    if (body.error) throw new Error(`MCP ${method} error: ${JSON.stringify(body.error)}`)
    return body.result
  }
  const callTool = async (name, toolArgs) => {
    const result = await rpc('tools/call', { name, arguments: toolArgs })
    if (result.isError) throw new Error(`tool ${name} failed: ${JSON.stringify(result.content)}`)
    return result.content.map((c) => c.text ?? '').join('\n')
  }
  return { rpc, callTool }
}

function parseAura(text) {
  const root = { head: '<root>', children: [] }
  const stack = [{ node: root, depth: -1 }]
  for (const raw of text.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed || trimmed === '}' || raw.startsWith('AURA') || raw.startsWith('widget:') || raw.startsWith('tree:')) continue
    const depth = Math.floor((raw.length - raw.replace(/^ */, '').length) / 2)
    const line = trimmed.replace(/\{$/, '')
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop()
    const node = { head: line, children: [] }
    stack[stack.length - 1].node.children.push(node)
    stack.push({ node, depth })
  }
  return root
}
const elementIdOf = (node) => node.head.match(/#(vnode_\d+)/)?.[1] ?? null
const ownText = (node) => node.head.match(/"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
function findFirst(node, pred) {
  if (pred(node)) return node
  for (const child of node.children) {
    const hit = findFirst(child, pred)
    if (hit) return hit
  }
  return null
}
function findParent(node, target, parent = null) {
  if (node === target) return parent
  for (const child of node.children) {
    const hit = findParent(child, target, node)
    if (hit !== null) return hit
  }
  return null
}

const isEditorNode = (n) =>
  n.head.startsWith('textarea ') ||
  n.head.startsWith('code_editor ') ||
  n.head.startsWith('autodown_editor ') ||
  n.head.startsWith('AutodownEditor ')

// ---------------- 单臂六检查 ----------------
async function runArm(arm, port) {
  const { rpc, callTool } = makeClient(port)
  const results = []
  const check = (id, name, ok, evidence) => {
    results.push({ id, name, ok })
    console.log(`  [${id} ${name}] ${ok ? 'PASS' : 'FAIL'} — ${evidence}`)
  }
  const snapshot = async () => parseAura(await callTool('autoui_snapshot', {}))
  const snapshotText = async () => await callTool('autoui_snapshot', {})
  const stateText = (f) => callTool('autoui_state', { fields: [f] })
  async function stateHas(field, needle, timeoutMs = 6000) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const st = await stateText(field)
      if (st.includes(needle)) return st.trim()
      if (Date.now() > deadline) throw new Error(`state.${field} never contained "${needle}": ${st.trim().slice(0, 300)}`)
      await sleep(150)
    }
  }
  async function stateIs(field, want, timeoutMs = 6000) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const st = await stateText(field)
      const raw = st.match(new RegExp(`${field}:\\s*(.*)`))?.[1]?.trim() ?? ''
      const got = raw.replace(/\s*\((?:str|int|bool|float|map|list)\)\s*$/, '').replace(/^"((?:[^"\\]|\\.)*)"$/, '$1').trim()
      if (got === want) return st.trim()
      if (Date.now() > deadline) throw new Error(`state.${field} never became "${want}" (got "${got}")`)
      await sleep(150)
    }
  }
  /** press 首个 OWN label 等值（树行/弹层）或 toolbar 图标前缀形（"save保存"）按钮。
   *  exact=true 只认 ownText 全等——退出存盘用：弹层「不保存退出」endsWith('退出')
   *  恒在快照（alert-dialog 内容恒渲染），前缀匹配会误中。 */
  async function pressButton(label, { exact = false, timeoutMs = 6000 } = {}) {
    const btn = await waitButton(label, { exact, timeoutMs })
    const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press "${label}" not ok: ${res}`)
  }
  /** 轮询等按钮出现（menubar popover 展开有渲染节拍；vnode id 逐次漂移
   *  ——每次轮询重取快照，不用旧 id）。 */
  async function waitButton(label, { exact = false, timeoutMs = 6000 } = {}) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const tree = await snapshot()
      const hit = findFirst(
        tree,
        (n) =>
          n.head.startsWith('button ') &&
          elementIdOf(n) &&
          (exact ? ownText(n) === label : ownText(n) === label || ownText(n).endsWith(label)),
      )
      if (hit) return hit
      if (Date.now() > deadline) {
        const dbg = await snapshotText()
        const dbgState = await callTool('autoui_state', {})
        fs.writeFileSync(`e2e/.runtime/fail-snap-${Date.now()}.txt`, dbg + '\n=====STATE=====\n' + dbgState)
        throw new Error(`button "${label}" not found (full snap+state dumped)`)
      }
      await sleep(300)
    }
  }
  /** 活动档的 x 关闭钮：vm 快照中图标钮 ownText 空（icon 投影 [Image]），
   *  定位 = tab 标题钮的父行内兄弟空文本按钮。**PLAN-013 区域锚**：检索
   *  收进 tab 条区（树行/面板行显示名同文名不误中——pressTab 同款）。 */
  async function pressActiveTabClose(tabTitle) {
    const tree = await snapshot()
    const strip = tabStripRegion(tree)
    if (!strip) throw new Error('tab strip region not found')
    const titleBtn = findFirst(strip, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === tabTitle)
    if (!titleBtn) throw new Error(`active tab button "${tabTitle}" not found`)
    const parent = findParent(strip, titleBtn)
    if (!parent) throw new Error('tab title button has no parent row')
    const xBtn = parent.children.find(
      (c) => c !== titleBtn && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === '',
    )
    if (!xBtn) throw new Error(`close (x) button next to "${tabTitle}" not found`)
    const res = await callTool('autoui_action', { element_id: elementIdOf(xBtn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press tab-x not ok: ${res}`)
  }
  // —— 区域锚（PLAN-013 T-04；显示名四面后树行/tab 题/快开检索行文本
  // 同形——如 Hello World 三处齐现，全树 findFirst 序锚失效。D-29 结构
  // 锚纪律续：区域限定 = 唯一消歧面）——
  /** EXPLORER 树区（'EXPLORER' 头 text 上溯两代 = 树 col）。 */
  function explorerRegion(t) {
    const label = findFirst(t, (n) => ownText(n) === 'EXPLORER')
    if (!label) return null
    const row = findParent(t, label)
    return row ? findParent(t, row) : null
  }
  /** tab 条区（style 行**精确等于** tab 条样式——toolbar 行同为
   *  bg-muted/30 族[带 px-2 后缀]，includes 会误中，精确锚消歧）。 */
  function tabStripRegion(t) {
    return findFirst(
      t,
      (n) => n.head.startsWith('row ')
        && n.children.some((c) => c.head === 'style: "h-8 items-center bg-muted/30 shrink-0 w-full gap-0"'),
    )
  }
  /** 右面板区（style 行含 w-72 的容器——vm 轨 col+overflow lowering =
   *  scrollable 节点，双形态兼容；查找/反链/标签面板宿主）。 */
  function panelRegion(t) {
    return findFirst(
      t,
      (n) => (n.head.startsWith('col ') || n.head.startsWith('scrollable '))
        && n.children.some((c) => c.head.includes('w-72 shrink-0')),
    )
  }
  async function waitButtonIn(regionPred, label, { exact = true, timeoutMs = 6000 } = {}) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const tree = await snapshot()
      const region = regionPred(tree)
      const hit = region
        ? findFirst(region, (n) => n.head.startsWith('button ') && elementIdOf(n) && (exact ? ownText(n) === label : ownText(n).endsWith(label)))
        : null
      if (hit) return hit
      if (Date.now() > deadline) {
        const dbg = await snapshotText()
        fs.writeFileSync(`e2e/.runtime/fail-snap-${Date.now()}.txt`, dbg)
        throw new Error(`button "${label}" not found in region (snap dumped)`)
      }
      await sleep(300)
    }
  }
  /** tab 题钮 press（区域锚消歧——树行/面板行同文名不误中）。 */
  async function pressTab(label) {
    const btn = await waitButtonIn(tabStripRegion, label)
    const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press tab "${label}" not ok: ${res}`)
  }
  /** EXPLORER 树行 press（显示名文本——OpenFile 口）。 */
  async function pressTree(label) {
    const btn = await waitButtonIn(explorerRegion, label)
    const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press tree "${label}" not ok: ${res}`)
  }
  /** 右面板行 press（反链/出链/快开/检索行——路径或显示名）。 */
  async function pressPanelRow(label) {
    const btn = await waitButtonIn(panelRegion, label)
    const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
    if (!/status: ok/.test(res)) throw new Error(`press panel row "${label}" not ok: ${res}`)
  }
  /** 右面板行文本集（快开/检索行集断言域——树行/同文 tab 不入集）。 */
  async function panelRowTexts() {
    const tree = await snapshot()
    const region = panelRegion(tree)
    const out = []
    const collect = (n) => {
      if (n.head.startsWith('button ') && elementIdOf(n)) out.push(ownText(n))
      for (const c of n.children) collect(c)
    }
    if (region) collect(region)
    return out
  }
  /** 右面板全节点文本集（text+button——空态文本/行文本混合断言域）。 */
  async function panelTexts() {
    const tree = await snapshot()
    const region = panelRegion(tree)
    const out = []
    const collect = (n) => {
      const t = ownText(n)
      if (t) out.push(t)
      for (const c of n.children) collect(c)
    }
    if (region) collect(region)
    return out
  }
  /** 语料档显示名（磁盘 frontmatter title 直读——tree/快开行显示面与
   *  dtitle_of 同源已知答案；无 title = **stem**[back dtitle 缺省=stem
   *  装配定值——G1 口径「无 title 档四面显示 stem」]）。 */
  const displayTitleOf = (file) => {
    const m = fs.readFileSync(path.join(FIXTURE, 'wiki', file), 'utf8').match(/^title: (.*)$/m)
    return m ? m[1].trim() : file.replace(/\.ad$/, '')
  }
  /** tab 题显示名（有 title = title 裸值；无 title = **stem**——back
   *  dtitle 缺省=stem 短路 fallback[front fallback 仅 stale 防御面]）。 */
  const tabDtitleOf = (file) => {
    const m = fs.readFileSync(path.join(FIXTURE, 'wiki', file), 'utf8').match(/^title: (.*)$/m)
    return m ? m[1].trim() : file.replace(/\.ad$/, '')
  }
  /** active_title 路径面（state 恒全路径去 .ad——PLAN-013 显示域零扰动：
   *  state 面不投影显示名，dump 断言保留路径口径）。 */
  const tabTitleOf = (label) => `wiki/${label.replace(/\.ad$/, '')}`
  /** 编辑器整文替换（C-5）：每次重取 editor id——tab 切换即重挂载，
   *  旧 vnode id 跨重挂载失效。 */
  async function typeWholeDoc(text) {
    const id = await findEditorId()
    if (!id) throw new Error('editor face not found for type_text')
    return callTool('autoui_action', { element_id: id, action: 'type_text', value: text })
  }
  /** 磁盘 .ad 文本 → body（frontmatter 剥离，无 --- 则原文）——check 4 同构造。 */
  const bodyOf = (disk) =>
    disk.split('---').length >= 3 ? disk.split('---').slice(2).join('---').replace(/^\n/, '') : disk
  async function findEditorId() {
    const tree = await snapshot()
    const ta = findFirst(tree, (n) => isEditorNode(n) && elementIdOf(n))
    return ta ? elementIdOf(ta) : null
  }

  // fixture 重灌（每臂全新——臂间零污染）
  fs.rmSync(FIXTURE, { recursive: true, force: true })
  fs.cpSync(FIXTURE_SOURCE, FIXTURE, { recursive: true })
  // LC 组素材（PLAN-032 T-06——boot 期树装配在册；根落位 stem 树行）
  fs.writeFileSync(path.join(FIXTURE, LC_A), '自链 [[LC-A]] 与 anchor [[LC-A#节]]。\n', 'utf8')
  fs.writeFileSync(path.join(FIXTURE, LC_B), '引用 [[LC-A]]。\n', 'utf8')
  fs.writeFileSync(path.join(FIXTURE, LC_DEL), '删除组素材。\n', 'utf8')

  const split = arm === 'split'
  const app = spawn(AUTO_EXE, split ? ['run', '-r', 'vm', '--no-merge'] : ['run', '-r', 'vm'], {
    cwd: repoRoot,
    env: { ...process.env, AUTOUI_MCP_PORT: String(port), JADE_WORKSPACE: FIXTURE },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  const kill = async () => {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }

  console.log(`\n[matrix] arm: ${arm}（${split ? 'split：--no-merge，AutoVM HTTP back' : 'merged：进程内直调，零后端进程'}）`)
  try {
    const deadline = Date.now() + 45000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-edit-vm-matrix', version: '0.2.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`AutoUI MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }

    const targetFile = path.join(FIXTURE, 'wiki', TARGET_LABEL)

    // 1 boot
    let bootText = ''
    for (let i = 0; i < 60; i++) {
      try { const t = await snapshotText(); if (!/No UI available/.test(t)) { bootText = t; break } } catch {}
      await sleep(500)
    }
    check('1', 'boot', bootText.includes('ready') && bootText.includes('没有打开的文档'), 'status ready + 空态可见')

    // 2 tree：展开 wiki 目录 → .ad 行可见（**显示名面**——行文本 =
    // dtitle_of 覆盖：有 title 显 title、无 title 显档名；期望 = 磁盘
    // title 直读同源已知答案，PLAN-013 T-04）
    await pressButton('wiki')
    await sleep(400)
    const treeText = await snapshotText()
    const fixtureFiles = fs.readdirSync(path.join(FIXTURE, 'wiki')).filter((f) => f.endsWith('.ad'))
    const listedCount = fixtureFiles.filter((f) => treeText.includes(`"${displayTitleOf(f)}"`)).length
    check('2', 'tree', listedCount === fixtureFiles.length && listedCount >= 5, `filetree 列出 ${listedCount}/${fixtureFiles.length} 个 fixture 档（显示名面——dtitle 覆盖）`)

    // 3 open（树行显示名 press——Hello World.ad title=Hello World）
    await pressTree('Hello World')
    const editorId = await (async () => {
      const deadline = Date.now() + 10000
      for (;;) {
        const id = await findEditorId()
        if (id) return id
        if (Date.now() > deadline) throw new Error('editor face never appeared after open')
        await sleep(300)
      }
    })()
    await stateHas('active_body', '这是一段示例文本')
    check('3', 'open', true, `autodown_editor 面在（element ${editorId.slice(0, 18)}…）+ 播种可见（active_body 含正文锚）`)

    // 4 edit：整文替换语义——磁盘原文构造 edited，type_text → INPUT_TEXT。
    const diskBefore = fs.readFileSync(targetFile, 'utf8')
    const edited = `${bodyOf(diskBefore)}\n\n${EDIT_MARKER}`
    const typeRes = await callTool('autoui_action', { element_id: editorId, action: 'type_text', value: edited })
    await stateIs('active_dirty', 'true')
    check('4', 'edit', /status: ok/.test(typeRes), 'type_text（整文+标记）→ INPUT_TEXT → active_dirty=true')

    // 5 save：toolbar 保存 → 脏标清 + 磁盘含标记 + frontmatter 保留
    // + **updated_at 自动维护**（PLAN-015 T-03；SD-1501——已有键保存即
    // 更新值，语料 Z 形归一无 Z；其余 fm 键行逐字节 = 界符段受控 diff 面，
    // probe_daily u① 直证同源；六检查磁盘断言盘点——受影响档 = 所有带
    // updated_at 键的语料档[五档全带]，本检查为更新面正证位，其余磁盘
    // 断言均为 presence 形不受扰）。
    await pressButton('保存')
    await stateIs('active_dirty', 'false')
    let diskAfter = ''
    for (const deadline = Date.now() + 6000; ; ) {
      diskAfter = fs.readFileSync(targetFile, 'utf8')
      if (diskAfter.includes(EDIT_MARKER)) break
      if (Date.now() > deadline) break
      await sleep(150)
    }
    const diskOk = diskAfter.includes(EDIT_MARKER) && diskAfter.includes('这是一段示例文本')
    const fmOk = diskAfter.includes('title: Hello World')
    const fmLineOf = (txt, key) => txt.split('\n').find((l) => l.startsWith(key + ':')) ?? ''
    const todayD = new Date()
    const pad2 = (n) => String(n).padStart(2, '0')
    const todayDate = `${todayD.getFullYear()}-${pad2(todayD.getMonth() + 1)}-${pad2(todayD.getDate())}`
    const updBefore = fmLineOf(diskBefore, 'updated_at')
    const updAfter = fmLineOf(diskAfter, 'updated_at')
    const updOk = updAfter !== updBefore
      && new RegExp(`^updated_at: ${todayDate}T\\d{2}:\\d{2}:\\d{2}$`).test(updAfter)
      && fmLineOf(diskAfter, 'title') === fmLineOf(diskBefore, 'title')
      && fmLineOf(diskAfter, 'status') === fmLineOf(diskBefore, 'status')
      && fmLineOf(diskAfter, 'summary') === fmLineOf(diskBefore, 'summary')
    check('5', 'save', diskOk && fmOk && updOk, `磁盘含原文+标记=${diskOk} frontmatter 保留=${fmOk} updated_at 维护=${updOk}（${updBefore || '<none>'} -> ${updAfter || '<none>'}）`)

    // 6 reload：磁盘外改 → toolbar 重载 → active_body 含新内容
    fs.appendFileSync(targetFile, `\n${RELOAD_MARKER}\n`)
    await pressButton('重载')
    await stateHas('active_body', RELOAD_MARKER, 8000)
    check('6', 'reload', true, `磁盘外改 + toolbar 重载 → active_body 含「${RELOAD_MARKER}」`)

// 结构基线（仅 merged 臂）。
// 采集位 = 六检查后、扩单三组前：基线锁六检查终态，扩单不漂移基线。
// v2 重锁（PLAN-002 T-01）：上游快照投影属性双态（style/onclick 非确定
// 发射，1652→1784，F-RV6 家族）——仪器改为 state 逐字节 + snapshot vnode
// id 出现序列（结构哈希），双态下确定（详见基线文件头注）。
    if (arm === 'merged') {
      // 基线仪器 v2（PLAN-002 T-01 勘误定型）：上游快照投影双态（1652→1784，
      // style/onclick 属性 + 花括号包裹随实例非确定发射，F-RV6 家族）——文本
      // 层归一不可靠（textarea value 为多行原义区）。仪器改为：
      //   ## state  逐字节（全部 store 状态含 active_body——内容面）
      //   ## snapshot-ids  vnode id 出现序列（确定性内容哈希——结构面）
      // 属性双态不影响两段 ⇒ 基线确定；真实结构漂移（增删节点/移位）必然
      // 改 id 序列。归因与登记见 parity-ledger D-18 / 上游供料包。
      const stateDump = (await callTool('autoui_state', {})).trim()
      const snapIds = JSON.stringify([...(await snapshotText()).matchAll(/#(vnode_\d+)/g)].map((m) => m[1]))
      const headerFor = (file) =>
        `// jade-edit vm 结构基线 v29（PLAN-038 T-03 重锁；v28=PLAN-036 批、v27=PLAN-035 批、v26=PLAN-033 批、
` +
        `// v25=PLAN-032 批、v20=PLAN-025、v19=PLAN-021、v18=PLAN-020、v17=PLAN-019、v16=PLAN-018、
` +
        `// v15=PLAN-016、v14=PLAN-015、v13=PLAN-014、v12=PLAN-013、v11=PLAN-012 等均留档）。
` +
        `// 重锁因由：双轨快速打开独立弹层批（PLAN-038 T-03）——**state 纯增 8 字段 + App files_rows
` +
        `// 退役 + snapshot id 序列变化**（逐项解释在 PLAN-038 T-03 计划档）：App quick_q/quick_rows/
` +
        `// quick_first_path/quick_err/quick_busy/quick_seq/__focus_result（独立查询/行集/首选/错误/
` +
        `// 忙碌/世代 + ui.focus 回执观察位——终态全缺省）+ store quick_open（独立弹层开态 false）；
` +
        `// files_rows 退役（files 模式用户面迁快开弹层）。id 序列变化面 = 快开根弹层新节点
` +
        `//（dialog/input/行区/取消钮——闭态恒渲染 D-23③ 同族入树）+ 工具栏新增 快速打开 图标钮 +
` +
        `// 右栏 files 模式分支退役（input 行/行集区/模式标签移除）+ 行集行形状 {path,dtitle,sec}
` +
        `//（行区 for 循环节点）。其余结构零漂移。
` +
        `// 仪器同 v2..v28：state 段逐字节 + snapshot vnode id 出现序列；终态 = 六检查后满状态
` +
        `//（chrome 全套 + Hello World.ad 开；查找面板/建页弹层/新建弹层/属性弹层/新建目录
` +
        `// 弹层/移动弹层/删除目录弹层/重命名目录弹层/移动目录弹层/重命名弹层/删除弹层/快开弹层/
` +
        `// 标签面板/反链面板/重载确认弹层未开——find_*/quick_*/names_*/create_*/new_*/meta_*/
` +
        `// dir_*/move_*/movedir_*/deldir_*/rendir_*/rename_*/delete_*/tags_*/mention_rows/reload_*/
` +
        `// editor_commands_help_open/nav_*/navc_*/sel_gen/active_uid/wiki_nav_note/__focus_result
` +
        `// 全为默认值入 dump）。
` +
        `// 再生成：node tests/vm_matrix.mjs --save-baseline ${path.relative(repoRoot, file).replace(/\\\\/g, '/')}\n`
      const baselineBodyOf = () => `## state\n${stateDump}\n\n## snapshot-ids\n${snapIds}\n`
      if (SAVE_BASELINE) {
        fs.mkdirSync(path.dirname(SAVE_BASELINE), { recursive: true })
        fs.writeFileSync(SAVE_BASELINE, headerFor(SAVE_BASELINE) + baselineBodyOf())
        console.log(`  [baseline] saved: ${SAVE_BASELINE}`)
      } else if (fs.existsSync(BASELINE)) {
        const raw = fs.readFileSync(BASELINE, 'utf8')
        const ok = raw === headerFor(BASELINE) + baselineBodyOf()
        check('B', 'baseline', ok, ok ? '结构基线 v29 零漂移（state 逐字节 + id 序列）——PLAN-038 T-03 重锁（state 纯增 8 字段 quick_* 七件+store quick_open + files_rows 退役；id 序列 = 快开弹层新节点+工具栏钮+files 面板分支退役，逐项解释在 PLAN-038 T-03）' : '结构基线漂移（--save-baseline 重锁需人工裁定）')
      } else {
        console.log('  [baseline] structure-v29 不存在——首锁：node tests/vm_matrix.mjs --save-baseline tests/baseline/structure-v29.txt')
      }
    }

    // —— E 编辑命令入口真实化组（PLAN-035；契约
    // attachments/035-command-availability-contract.md §1/§4——merged 臂
    // 生产面）——toolbar 两执行钮移除（全树无 ownText 恰等六短词的
    // button——说明 dialog description 长句非短词全等，闭态恒渲染不误
    // 中）；编辑菜单开 → 单一「编辑命令说明…」项 → 说明 dialog 开
    //（editor_commands_help_open=true——可见说明替代 console 降级）→
    // 正文/脏标不变 → 关闭仅清旗标；Ctrl+Z/Y/A 键盘零宿主路由（action
    // 表无三键——flag 恒假；正文/脏标恒等）。执行序在 B 后 7 前（弹层
    // 开关零状态残留——终态即默认态，不扰后续组与基线）。子步不占检查
    // 位（组数不变），fail 即臂败。
    {
      const eBodyBefore = (await callTool('autoui_state', {})).match(/active_body: "((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
      const eDirtyBefore = /active_dirty: true/.test(await callTool('autoui_state', {}))
      const sixGone = ['撤销', '重做', '剪切', '复制', '粘贴', '全选']
      const countExactButtons = async (label) => {
        const t = await snapshot()
        let n = 0
        const visit = (node) => {
          if (node.head.startsWith('button ') && elementIdOf(node) && ownText(node) === label) n = n + 1
          for (const c of node.children) visit(c)
        }
        visit(t)
        return n
      }
      let eToolbarGoneOk = true
      for (const label of sixGone) {
        if ((await countExactButtons(label)) !== 0) eToolbarGoneOk = false
      }
      // 编辑菜单开 → 单一说明入口（六执行项开态复认）→ 说明 dialog
      await pressButton('编辑')
      const helpItem = await waitButton('编辑命令说明…', { exact: true })
      let eMenuOnlyOk = true
      for (const label of sixGone) {
        if ((await countExactButtons(label)) !== 0) eMenuOnlyOk = false
      }
      const resHelp = await callTool('autoui_action', { element_id: elementIdOf(helpItem), action: 'press' })
      if (!/status: ok/.test(resHelp)) throw new Error('press 编辑命令说明… not ok')
      await stateIs('editor_commands_help_open', 'true')
      const stHelpOpen = await callTool('autoui_state', {})
      const eBodyHelp = stHelpOpen.match(/active_body: "((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
      const eBodyStableOk = eBodyHelp === eBodyBefore
      // 关闭钮 = 说明 dialog 内容域内定位（D-29③ 标题锚变体——逐级上溯
      // 至首个子树含「关闭」钮的祖先即 dialog content 域；recover 等
      // 弹层闭态恒渲染且树序在前，全树 findFirst 会误中其 RecoverClose
      // ——一次性上溯 N 代同样越界，故逐级判定）
      const closeInHelpDialog = async () => {
        const dl = Date.now() + 6000
        for (;;) {
          const t = await snapshot()
          const titleNode = findFirst(t, (n) => ownText(n) === '编辑命令说明')
          if (titleNode) {
            let scope = titleNode
            while (findParent(t, scope)) {
              scope = findParent(t, scope)
              const btn = findFirst(scope, (n) => n !== scope && n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '关闭')
              if (btn) {
                const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
                if (!/status: ok/.test(res)) throw new Error('press help 关闭 not ok')
                return
              }
            }
          }
          if (Date.now() > dl) throw new Error('help dialog 关闭 button not found (content-scoped)')
          await sleep(300)
        }
      }
      await closeInHelpDialog()
      await stateIs('editor_commands_help_open', 'false')
      // Ctrl+Z/Y/A 键盘零宿主路由（生产 action 表无三键——flag 恒假）
      let eKeysOk = true
      for (const k of ['z', 'y', 'a']) {
        await callTool('autoui_keyboard', { key: k, modifiers: ['ctrl'] })
        await sleep(500)
        const st = await callTool('autoui_state', {})
        if (/editor_commands_help_open: true/.test(st)) eKeysOk = false
      }
      const eDirtyAfter = /active_dirty: true/.test(await callTool('autoui_state', {}))
      check('E', 'cmd-avail', eToolbarGoneOk && eMenuOnlyOk && eBodyStableOk && eKeysOk && eDirtyBefore === eDirtyAfter,
        `toolbar/菜单六执行项零恰等钮=${eToolbarGoneOk && eMenuOnlyOk} 说明开关（open→true→关闭→false）正文恒等=${eBodyStableOk} 键盘 Ctrl+Z/Y/A 零宿主路由=${eKeysOk} 脏标恒等=${eDirtyBefore === eDirtyAfter}（PLAN-035 C-2 收口——直派守卫逐值面归 probe_command_availability Store 臂）`)
    }

    // 7 tab 面：开两档 → 切换（active 断言 + 内容互换）→ dirty 档关闭确认两路。
    // vm 快照中 alert-dialog 内容恒渲染（闭态也在树里），弹层开出与否以
    // state confirm_open 断言，不以按钮出现为准；弹层按钮 press 恒可达。
    // tab 题钮 = 显示名（PLAN-013——pressTab 区域锚 + tabDtitleOf 已知答案）。
    await pressTree('Tasks')
    await stateIs('tab_count', '2')
    await stateHas('active_body', TAB_ANCHOR)
    await pressTab('Hello World')
    await stateHas('active_body', PARA_ANCHOR)
    await pressTab('Tasks')
    await stateHas('active_body', TAB_ANCHOR)
    // dirty Tasks（C-5 整文构造）→ 切走再切回：脏标经 TabActivate 投影还原
    await typeWholeDoc(`${bodyOf(fs.readFileSync(path.join(FIXTURE, 'wiki', TAB_LABEL), 'utf8'))}\n\n${TAB_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressTab('Hello World')
    await stateHas('active_body', PARA_ANCHOR)
    await pressTab('Tasks')
    await stateIs('active_dirty', 'true')
    // 取消路：弹层开 → 取消 → 档留 + 脏标保
    await pressActiveTabClose('Tasks')
    await stateIs('confirm_open', 'true')
    await pressButton('取消', { exact: true })
    await stateIs('confirm_open', 'false')
    await stateIs('tab_count', '2')
    await stateIs('active_dirty', 'true')
    // 直接关闭路：弃改关闭（磁盘零写入）→ 档数回落 + 激活回落 Hello World
    await pressActiveTabClose('Tasks')
    await stateIs('confirm_open', 'true')
    // PLAN-031 T-05 语义升级：直接关闭 → 「放弃修改并关闭」（结算式
    // 放弃——tombstone 落 .jade 域，wiki 文件零写入断言不变；保留草稿
    // 并关闭新弧 = T-06 矩阵承载）。
    await pressButton('放弃修改并关闭', { exact: true })
    await stateIs('tab_count', '1')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    const tabDisk = fs.readFileSync(path.join(FIXTURE, 'wiki', TAB_LABEL), 'utf8')
    check('7', 'tab', !tabDisk.includes(TAB_MARKER), `双档切换互换 + dirty 关闭确认两路（取消档留/放弃修改并关闭[结算式弃改——.jade 域墓碑]=${!tabDisk.includes(TAB_MARKER)}；保留草稿新弧=T-06）`)

    // 8 编辑操作族：段中回车/退格（C-5 整文构造达成同语义）。
    // state dump 中字符串换行以 \n 字面转义呈现——断言锚用转义形。
    await typeWholeDoc(bodyOf(fs.readFileSync(targetFile, 'utf8')).replace(PARA_ANCHOR, '这是一段\n示例文本'))
    await stateHas('active_body', '一段\\n示例')
    await stateIs('active_dirty', 'true')
    await typeWholeDoc(bodyOf(fs.readFileSync(targetFile, 'utf8')))
    await stateHas('active_body', PARA_ANCHOR)
    await stateIs('active_dirty', 'false')
    check('8', 'editops', true, '段中回车分段可见（active_body 含转义换行锚）+ 退格复原 + 脏标重算 body==original→false')

    // 10 link（PLAN-003 T-04）：链接索引已知答案 + 反链面板 + 点击开档 +
    // 空态。执行序在 quit 前（quit 杀进程恒为臂内最后一项）；id 10 = 扩单
    // 序号延续。期望值 = T-02 语料首锁（docs/plans/003 §8 T-02 证据）：
    //   Hello World 出链 {CAP 定理:true, 首页:false(悬空)}；
    //   反链源 = index/CAP 定理/Tasks 三档；index 无反链（首页悬空）。
    await stateHas('links_json', 'wiki/Hello World.ad')
    // state dump 对字符串值引号转义（\" 形态）——锚用转义形（T-04 实勘）。
    await stateHas('links_json', '{\\"target\\":\\"首页\\",\\"anchor\\":\\"\\",\\"exists\\":false,\\"target_path\\":\\"\\"}')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // 反链行 = **显示名**（PLAN-014 T-04 link 组⑤——SD-1301 §10.1 留口
    // 兑现：反链行 dtitle_of 显示名[有 title 显 title]；无 title 档显示
    // stem[back dtitle 缺省=stem 装配定值——回落 path 仅 stale 面]）。
    // ⚠ 区域锚：树行显示名同文[wiki/index.ad 树行亦显 首页]——面板区锚
    // 消歧（PLAN-013 区域锚族续）；'CAP 定理' 面板内双现[反链行 + 出链
    // 行 target 文本——出链恒链接文本零变化 SD-1401 定文]，waitButtonIn
    // DFS 首现 = 反链行[反链段先于出链段渲染]。
    const blBtn1 = await waitButtonIn(panelRegion, '首页')
    const blBtn1Id = elementIdOf(blBtn1)
    await waitButtonIn(panelRegion, 'CAP 定理')
    await waitButtonIn(panelRegion, 'Tasks')
    const panelText1 = await snapshotText()
    // ⑥ 出链/wanted 恒链接文本（SD-1401 定文——显示名化零波及面）：
    // 出链行 = target 文本（'首页（悬空）' 非 dtitle 覆盖形）；wanted
    // label 形 `页面名（1）` 断言域在 14⑤ 不动 + 12⑤ 'Project X'
    // 非 'Projects' 非退化并证。
    const panelOk = panelText1.includes('首页（悬空）') && panelText1.includes('CAP 定理')
    check('10', 'link', panelOk, `link_index 已知答案（首页悬空存在判）+ 面板反链三源显示名（首页/CAP 定理/Tasks——PLAN-014 反链行名化 ⑤）+ 出链段恒 target 文本（CAP 定理钮/首页悬空——⑥ 零变化面）=${panelOk}`)
    // 点击反链行 → 开来源档 index.ad（ASCII 路径——HTTP 通道可导航；
    // CJK 导航子步 PLAN-028 双臂化——三契约 POST 化收口）
    await callTool('autoui_action', { element_id: blBtn1Id, action: 'press' })
    await stateIs('active_title', 'wiki/index')
    await stateHas('active_body', 'Jade Garden 测试知识库')
    // index 无反链 → 空态文本（text 节点，非 button——快照包含轮询）
    const emptyDeadline = Date.now() + 6000
    let emptyIdx = ''
    for (;;) {
      emptyIdx = await snapshotText()
      if (emptyIdx.includes('（无反链）')) break
      if (Date.now() > emptyDeadline) throw new Error('empty-state text （无反链） never appeared for index.ad')
      await sleep(300)
    }
    // 出链行点击（ASCII 目标 Hello World——两轨同单；**区域锚**：树行
    // 显示名同名后 pressPanelRow 消歧——PLAN-013）；CJK 目标子步
    // PLAN-028 双臂化（三契约 POST 化——D-19 GET query 缺口 repo 侧收口
    // ，split 臂 CJK exists/read_wiki 走 body 免疫域在册，receipt g①/g②
    // 翻绿直证同源）
    await pressPanelRow('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await stateHas('active_body', PARA_ANCHOR)
    await pressPanelRow('CAP 定理')
    await stateIs('active_title', 'wiki/CAP 定理')
    await stateHas('active_body', 'CAP 定理指出')
    // 空态（无激活档）：文件→新建（untitled，path 空 → 行集空）→ 双空态
    // 文本（stateIs 通过后视图渲染滞后一拍——轮询快照，同上款）
    await pressButton('文件', { exact: true })
    await pressButton('新建', { exact: true })
    await stateIs('active_title', '未命名')
    const untDeadline = Date.now() + 6000
    let emptyText = ''
    for (;;) {
      emptyText = await snapshotText()
      if (emptyText.includes('（无反链）') && emptyText.includes('（无出链）')) break
      if (Date.now() > untDeadline) break
      await sleep(300)
    }
    const emptyOk = emptyText.includes('（无反链）') && emptyText.includes('（无出链）')
    // 关 untitled（未脏直接关）→ 重开 Hello World（树仍展开；Open 已开即
    // 激活）→ 反链行恢复，quit 检查前置状态还原（此时 tabs = HW/index/CAP）
    await pressActiveTabClose('未命名')
    await pressTree('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await waitButtonIn(panelRegion, 'CAP 定理')
    check('10b', 'link-empty', emptyOk, `点击反链行开 index.ad + 出链行开 CAP 定理.ad + 空态（untitled 激活）双文本=${emptyOk} + 重开行恢复`)

    // 10m mentions（PLAN-009 T-04；link 组 mentions 子步——组内子步不占
    // 检查位，fail 即臂败，10c 同款）：未链接提及段六子步（文件头检查单
    // 10m 注记）。此位态：面板开 + active=Hello World（10b 收尾）——
    // ②提及断言前须过一次面板关开触点（LinksRefreshOf——外造档入
    // link_pages，B 入 bl_rows 排重断言域成立）。
    const mnAFile = path.join(FIXTURE, 'Mention A.ad')
    const mnBFile = path.join(FIXTURE, 'Mention B.ad')
    const mnCFile = path.join(FIXTURE, 'Mention C.ad')
    fs.writeFileSync(mnAFile, '纯文本提到 Hello World 一词。\n', 'utf8')
    fs.writeFileSync(mnBFile, '链接 [[Hello World]] 于此。\n', 'utf8')
    fs.writeFileSync(mnCFile, '散文本提到 Tasks 一词。\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // ① 三段标题 + ② 提及行已知答案（段区域断言——文件树同列根档
    // .ad，全文 includes 会误中树行；行集两行留根 = path 钮 + snippet
    // 次行 text）。⚠ 行文本 = **stem**（PLAN-014 T-04 link 组⑤ 无
    // title 源档显示名化——提及行 path 首行同化反链行口径；'Mention A'
    // = back dtitle 缺省 stem 装配定值，回落 path 仅 stale 面——013
    // §10.3 同族口径）。fs 造档不进树[fr94 在册分野]故无界 slice 安全。
    let mnRegion = ''
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const i = t.indexOf('未链接提及')
      mnRegion = i >= 0 ? t.slice(i) : ''
      if (mnRegion.includes('Mention A') && mnRegion.includes('纯文本提到 Hello World 一词')) break
      if (Date.now() > dl) throw new Error(`mentions ①② 失守（段标题/提及行/snippet 未现）:\n${mnRegion.slice(0, 400)}`)
      await sleep(300)
    }
    // ② 排重：B 已链源不入提及段（B 在反链段/树行——段区域负向断言
    // 不误中）
    if (mnRegion.includes('Mention B')) throw new Error('mentions 排重失守（B 已链源重复入提及段）:\n' + mnRegion.slice(0, 400))
    // ③ 行点击 OpenLink（段内行钮——此位无树行同名[fs 造档不进树]/
    // tab 未开，取快照序最后一个 'Mention A' 钮——10c 首页钮同款消歧）
    {
      const t = await snapshot()
      const btns = []
      const collect = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === 'Mention A') btns.push(n)
        for (const c of n.children) collect(c)
      }
      collect(t)
      const rowBtn = btns[btns.length - 1]
      if (!rowBtn) throw new Error('mentions 行钮未找到')
      const res = await callTool('autoui_action', { element_id: elementIdOf(rowBtn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press mention row not ok: ${res}`)
    }
    await stateIs('active_title', 'Mention A')
    // ⑤ 空态（无提及档）：Mention A 自身无提及者 → 段空态文本（区段
    // 断言——空态即足；负向行集断言不设：恒渲染删除弹层带 ft_sel 文本
    // 会误中）
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const region = t.slice(t.indexOf('未链接提及'))
        if (region.includes('（无未链接提及）')) break
        if (Date.now() > dl) throw new Error('mentions ⑤ 空态失守（（无未链接提及）未现）:\n' + region.slice(0, 300))
        await sleep(300)
      }
    }
    // ④ 激活变更刷新：树行开 Tasks（OpenFile 触点——显示名 press）→
    // 提及段随 stem 变（C 行在、A 行不在——段区域断言）
    await pressTree('Tasks')
    await stateIs('active_title', 'wiki/Tasks')
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const region = t.slice(t.indexOf('未链接提及'))
        if (region.includes('Mention C') && !region.includes('Mention A')) break
        if (Date.now() > dl) throw new Error('mentions ④ 激活刷新失守（C 行应现/A 行应消）:\n' + region.slice(0, 400))
        await sleep(300)
      }
    }
    // ⑥ 面板关零 fetch（行为等价断言——merged 臂网络不可观测，§10.1
    // 落定口径）：关面板 → 激活变更（OpenLink 触点 fetch 被守卫拦）→
    // mention_rows dump 行恒旧值 + 段不渲染
    const mnStateBefore = (await stateText('mention_rows')).trim()
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    const mnStateAfter = (await stateText('mention_rows')).trim()
    if (mnStateBefore !== mnStateAfter) throw new Error(`mentions ⑥ 守卫失守（面板关激活变更后 mention_rows 变：${mnStateBefore} -> ${mnStateAfter}）`)
    if ((await snapshotText()).includes('未链接提及')) throw new Error('mentions ⑥ 守卫失守（面板关时段仍渲染）')
    // 收尾复原 10c 口径：面板开（ActBacklinks 触发集——链接/提及重取）
    // + 10m 开启的 Mention A/Tasks tab 关闭（洁净未脏直接关——check 13
    // 删除后激活落点的已知答案按 [HW,index,CAP,…] tab 序口径，子步
    // 残留 tab 会漂位）
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // tab 关闭 hygiene：先激活（tab 题钮 press = OpenLink 激活）再 x 关
    //（非激活 tab 行无 x 钮——view 结构在册）
    await pressTab('Mention A')
    await pressActiveTabClose('Mention A')
    await pressTab('Tasks')
    await pressActiveTabClose('Tasks')
    // tab_count=3 两臂同单（PLAN-028：CAP tab 由 check 10 CJK 导航子步
    // 双臂开档——[HW,index,CAP] tab 序两臂同构，check 13 已知答案同基）
    await stateIs('tab_count', '3')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))

    // linkify 子步（PLAN-010 T-04 ④⑤）：点击提及行「转为链接」钮
    // → 提及行消失 + 反链段增行（行文本 = stem——PLAN-014 名化面）+
    // 磁盘逐字节含 [[Hello World]]
    await pressButton('转为链接', { exact: true })
    let linkifyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iLinks = t.indexOf('LINKS')
      const iMentions = t.indexOf('未链接提及')
      const linksPart = iMentions >= 0 ? t.slice(iLinks, iMentions) : t.slice(iLinks)
      const mentionsPart = iMentions >= 0 ? t.slice(iMentions) : ''
      if (linksPart.includes('Mention A') && !mentionsPart.includes('Mention A')) {
        linkifyOk = true
        break
      }
      if (Date.now() > dl) throw new Error(`linkify ④⑤ 失守（未能见 Mention A 入反链段或提及段未消）:\n${t.slice(0, 600)}`)
      await sleep(300)
    }
    const mnABodyAfter = fs.readFileSync(mnAFile, 'utf8')
    if (!mnABodyAfter.includes('纯文本提到 [[Hello World]] 一词。')) {
      throw new Error(`linkify 磁盘逐字节验证失守: ${mnABodyAfter}`)
    }

    // alias 子步（PLAN-010 T-04 ①②③）：
    // ① 造 alias 档 + 呼叫源档 → 呼叫源档出链行「帽子定理」可点击（exists 翻转）
    //   → 导航落 CAP.ad（merged 臂；split 臂 target_path/磁盘断言）
    // ② CAP.ad 反链段增呼叫源档行
    // ③ wanted 清单不含 alias 解析目标「帽子定理」
    const aliasCapFile = path.join(FIXTURE, 'CAP.ad')
    const aliasCallerFile = path.join(FIXTURE, 'AliasCaller.ad')
    fs.writeFileSync(aliasCapFile, '---\ntitle: CAP\naliases:\n  - 帽子定理\n---\n\n# CAP\n\nCAP 定理内容。\n', 'utf8')
    fs.writeFileSync(aliasCallerFile, '# Caller\n\n[[Hello World]]\n[[帽子定理]]\n', 'utf8')
    // 关开一次反链面板触发 LinksRefreshOf，让 link_index 收集新造的 alias 档与 caller 档
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    // Hello World 的反链段中可见 AliasCaller 钮（行文本 = stem——
    // PLAN-014 名化面；**区域锚**——panelRegion 消歧）
    await waitButtonIn(panelRegion, 'AliasCaller')
    await pressPanelRow('AliasCaller')
    await stateIs('active_title', 'AliasCaller')
    // 检查出链段：帽子定理 为可点击钮（exists: true），非「帽子定理（悬空）」
    let aliasOlOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iOl = t.indexOf('出链')
      const iMn = t.indexOf('未链接提及')
      const olPart = iMn >= 0 ? t.slice(iOl, iMn) : t.slice(iOl)
      if (olPart.includes('帽子定理') && !olPart.includes('帽子定理（悬空）')) {
        aliasOlOk = true
        break
      }
      if (Date.now() > dl) throw new Error(`alias ① 失守（出链段未见非悬空 帽子定理 钮）:\n${t.slice(0, 600)}`)
      await sleep(300)
    }
    // ① 导航落 CAP.ad（merged 臂点击开档；split 臂 links_json target_path 断言）
    if (arm === 'merged') {
      await pressButton('帽子定理', { exact: true })
      await stateIs('active_title', 'CAP')
      // ② CAP.ad 反链段增呼叫源档行
      let capBlOk = false
      for (const dl = Date.now() + 8000; ; ) {
        const t = await snapshotText()
        const iLinks = t.indexOf('LINKS')
        const iOl = t.indexOf('出链')
        const blPart = iOl >= 0 ? t.slice(iLinks, iOl) : t.slice(iLinks)
        if (blPart.includes('AliasCaller')) {
          capBlOk = true
          break
        }
        if (Date.now() > dl) throw new Error(`alias ② 失守（CAP.ad 反链段未见 AliasCaller）:\n${t.slice(0, 600)}`)
        await sleep(300)
      }
    } else {
      await stateHas('links_json', '{\\"target\\":\\"帽子定理\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"CAP.ad\\"}')
    }
    // ③ wanted 清单不含 alias 解析目标「帽子定理」
    const ljNow = await stateText('links_json')
    if (ljNow.includes('{\\"target\\":\\"帽子定理\\",\\"anchor\\":\\"\\",\\"exists\\":false')) {
      throw new Error('alias ③ 失守（帽子定理 误入 wanted 悬空集）')
    }
    // 收尾：关闭新开 tab，删除测试档，切回 Hello World
    if (arm === 'merged') {
      await pressActiveTabClose('CAP')
    }
    await pressTab('AliasCaller')
    await pressActiveTabClose('AliasCaller')
    fs.rmSync(aliasCapFile, { force: true })
    fs.rmSync(aliasCallerFile, { force: true })
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))

    // —— PLAN-017 T-04 link 组子步（四级解析 + 词边界——组数不变，fail 即
    // 臂败；素材 ASCII 双臂——hello world 纯 ASCII 走 HTTP GET 无 D-19 面）——
    // ⑦ 四级解析导航：外造 CF Navigate.ad（[[hello world]] 小写变体链——
    // ③级 stem casefold 命中）→ 反链段新行 → 行点击开档 → 出链行
    // hello world 非悬空（SD-1401 恒 target 文本）→ 点击导航落
    // Hello World.ad + links_json target_path 直证。
    const cfNavFile = path.join(FIXTURE, 'CF Navigate.ad')
    fs.writeFileSync(cfNavFile, '见 [[hello world]] 一处。\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    await waitButtonIn(panelRegion, 'CF Navigate')
    await pressPanelRow('CF Navigate')
    await stateIs('active_title', 'CF Navigate')
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const iOl = t.indexOf('出链')
        const iMn = t.indexOf('未链接提及')
        const olPart = iMn >= 0 ? t.slice(iOl, iMn) : t.slice(iOl)
        if (olPart.includes('hello world') && !olPart.includes('hello world（悬空）')) break
        if (Date.now() > dl) throw new Error(`⑦ 四级解析出链失守（hello world 行未现或悬空）:\n${t.slice(0, 400)}`)
        await sleep(300)
      }
    }
    await pressPanelRow('hello world')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await stateHas('active_body', PARA_ANCHOR)
    await stateHas('links_json', '{\\"target\\":\\"hello world\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"wiki/Hello World.ad\\"}')
    await pressTab('CF Navigate')
    await pressActiveTabClose('CF Navigate')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    fs.rmSync(cfNavFile, { force: true })
    // ⑧ 提及转链词边界（CAPTURE 弧）：Mention D 三态体（右界 X 跳过/左界
    // x 跳过/独立位包裹）→ 转为链接 → **磁盘逐字节仅独立位包裹** + D 行
    // 消（页级已链源排重——PLAN-009 定文面：含链即整页除名入反链段）。
    const mnDFile = path.join(FIXTURE, 'Mention D.ad')
    fs.writeFileSync(mnDFile, '边界三态：Hello WorldX 与 xHello World 与 Hello World 并置。\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const iMn = t.indexOf('未链接提及')
        const mnPart = iMn >= 0 ? t.slice(iMn) : ''
        if (mnPart.includes('Mention D')) break
        if (Date.now() > dl) throw new Error(`⑧ 词边界提及行失守（Mention D 行未现）:\n${mnPart.slice(0, 400)}`)
        await sleep(300)
      }
    }
    await pressButton('转为链接', { exact: true })
    {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshotText()
        const iLinks = t.indexOf('LINKS')
        const iOl = t.indexOf('出链')
        const iMn = t.indexOf('未链接提及')
        const blPart = iOl >= 0 ? t.slice(iLinks, iOl) : t.slice(iLinks)
        const mnPart = iMn >= 0 ? t.slice(iMn) : ''
        if (blPart.includes('Mention D') && !mnPart.includes('Mention D')) break
        if (Date.now() > dl) throw new Error(`⑧ 词边界转链失守（D 未入反链段或提及行未消）:\n${t.slice(0, 500)}`)
        await sleep(300)
      }
    }
    const mnDBodyAfter = fs.readFileSync(mnDFile, 'utf8')
    if (mnDBodyAfter !== '边界三态：Hello WorldX 与 xHello World 与 [[Hello World]] 并置。\n') {
      throw new Error(`⑧ 词边界磁盘逐字节失守（双侧邻接位应透传、独立位应包裹）: ${mnDBodyAfter}`)
    }
    fs.rmSync(mnDFile, { force: true })
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))

    console.log(`  [10m mentions] PASS — 六子步+aliases+linkify（三段标题/提及行已知答案+snippet+已链源排重/行点击 OpenLink/空态[无提及档]/激活变更刷新/面板关零 fetch[行为等价]；linkify 行转链+段间迁移+磁盘逐字节；alias 解析+出链翻转+反链归并+wanted 排除；素材 ASCII 双臂[search_wiki POST 面无]；**PLAN-017：⑦四级解析导航[hello world 变体出链非悬空→导航落 Hello World+target_path 直证]+⑧提及转链词边界[三态体磁盘逐字节——双侧邻接透传/独立包裹]**；收尾 tab 复原）`)

    // 10c 建页弧线（PLAN-005 T-04；子步不占检查位——组数不变 12）：悬空行
    // 点击 → 确认弹层（create_confirm_open/create_target 态）→ 取消零落盘
    // → 创建 → 落盘 → 链接翻转（触发集 v2）→ 树新行（G3）→ 行翻转；
    // CJK 开档导航子步 PLAN-028 双臂化（三契约 POST 化收口——split 同单
    // ，原 D-19 磁盘/翻转面替代口径消缺）。取消路前置（创建后行翻转为可
    // 点击钮——同一悬空行素材先走取消路）。弹层按钮 press = 「创建」钮
    // （全树唯一）父 footer 行兄弟域（三弹恒渲染 + 弹层根匿名 col——T-02
    // 实勘）。
    const pressInCreateDialog = async (buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const createBtn = findFirst(t, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '创建')
        if (createBtn) {
          if (buttonText === '创建') {
            const res = await callTool('autoui_action', { element_id: elementIdOf(createBtn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press 创建 not ok: ${res}`)
            return
          }
          const row = findParent(t, createBtn)
          const btn = row.children.find((c) => c !== createBtn && c.head.startsWith('button ') && elementIdOf(c) && ownText(c) === buttonText)
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText} not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in create-dialog row not found`)
        await sleep(300)
      }
    }
    const newPageFile = path.join(FIXTURE, '首页.ad')
    await pressButton('首页（悬空）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await stateIs('create_target', '首页')
    await pressInCreateDialog('取消')
    await stateIs('create_confirm_open', 'false')
    const cancelOk = !fs.existsSync(newPageFile)
    if (!cancelOk) throw new Error('建页取消路零落盘失守（首页.ad 不应在）')
    await pressButton('首页（悬空）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await pressInCreateDialog('创建')
    await stateIs('create_confirm_open', 'false')
    let createDiskOk = false
    for (const dl = Date.now() + 8000; ; ) {
      createDiskOk = fs.existsSync(newPageFile)
      if (createDiskOk || Date.now() > dl) break
      await sleep(200)
    }
    if (!createDiskOk) throw new Error('建页落盘失守（首页.ad 缺）')
    await stateHas('links_json', '{\\"target\\":\\"首页\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"首页.ad\\"}')
    // 回源档语境再断言面板行翻转（创建成功即开新档——新档自身出链为空，
    // 翻转行只在本源档[Hello World]出链段可见）。merged 从新档 tab 返回；
    // split 同按 tab 题钮（ASCII 路径——行重算随 OpenLink 显式 path，原地
    // 激活语义）。
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // 翻转断言：悬空钮消失 + 面板行钮在（'首页' 与 tab 题钮同名[创建成
    // 功即开新档 tab——PLAN-028 双臂：split 开档随 POST 化可达]——计数
    // ≥2[tab+行]；行钮 = 快照序最后一个——tab 条先于右面板渲染）。
    let treeRowOk = false
    let flipBtnOk = false
    let homeBtnsN = 0
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const tree = await snapshot()
      const homeBtns = []
      const collect = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '首页') homeBtns.push(n)
        for (const c of n.children) collect(c)
      }
      collect(tree)
      homeBtnsN = homeBtns.length
      // 树新行 = 显示名 stem（back dtitle 缺省=stem——新建档树行『首页』
      // 与 wiki/index.ad 树行同文——explorer 区计数 ≥2 为新行在册证）。
      const exr = explorerRegion(tree)
      let homeTreeBtns = 0
      if (exr) {
        const collectTree = (n) => {
          if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '首页') homeTreeBtns++
          for (const c of n.children) collectTree(c)
        }
        collectTree(exr)
      }
      treeRowOk = homeTreeBtns >= 2
      flipBtnOk = !t.includes('首页（悬空）') && homeBtns.length >= 2
      if (treeRowOk && flipBtnOk) break
      if (Date.now() > dl) break
      await sleep(300)
    }
    // CJK 开档导航子步（PLAN-028 双臂化——三契约 POST 化收口，split
    // 开档随 exists/read_wiki body 通道可达）：press 面板翻转行（快照序
    // 最后一个 '首页' 钮）→ 开档 + 播种模板断言。
    {
      const t = await snapshot()
      const homeBtns = []
      const collect = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '首页') homeBtns.push(n)
        for (const c of n.children) collect(c)
      }
      collect(t)
      const rowBtn = homeBtns[homeBtns.length - 1]
      const res = await callTool('autoui_action', { element_id: elementIdOf(rowBtn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press 首页 row not ok: ${res}`)
      await stateIs('active_title', '首页')
      await stateHas('active_body', '# 首页')
    }
    const createOk = cancelOk && createDiskOk && treeRowOk && flipBtnOk
    console.log(`  [10c create] ${createOk ? 'PASS' : 'FAIL'} — 建页弧线（取消零落盘/创建落盘/链接翻转/树新行/行翻转/CJK 开档播种导航双臂[PLAN-028]）`)
    if (!createOk) {
      results.push({ id: '10c', name: 'create', ok: false })
      throw new Error('10c 建页弧线断言失守')
    }

    // 14 meta（PLAN-008 T-04）：tags 面板 + wanted 模式八子步（双件同组
    // ——PLAN-004 find 组先例；组内子步不占检查位，fail 即臂败，10c/12
    // 同款）。执行序在 10c 后 11 前（此位语料态 = tags 全集 7[13 file
    // 未删 CAP/12 rename 未改名] + 悬空仅剩 页面名（1）——首页已被 10c
    // 建页消缺【执行期校正：语料悬空全集 = 首页+页面名，index.ad 尾行
    // [[页面名]] 亦悬空】）。前置：关反链面板（10 开着——tags/wanted
    // 行断言免反链行 .ad 路径文本重叠）；收尾：复原反链面板开（check
    // 11 首步「开着→关」口径不漂移）+ find 面板关。
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    // tags ①：面板开启 + 7 tag 行（label 计数断言；语料实勘全集【执行
    // 期校正：7 非 6——Hello World.ad 实有 `tags: - demo`，计划原记
    // 「无 tags 键」漏勘】）
    await pressButton('视图', { exact: true })
    await pressButton('切换标签', { exact: true })
    await stateIs('tags_open', 'true')
    const metaTagsSnap = await snapshotText()
    const metaTagLabels = ['tasks · 1', 'distributed-systems · 1', 'theory · 1', 'demo · 1', 'project-management · 1', 'index · 1', 'jade-garden · 1']
    const metaTagsOk = metaTagLabels.every((l) => metaTagsSnap.includes(`"${l}"`))
    if (!metaTagsOk) throw new Error('tags 面板 7 tag 行不全（已知答案失守）')
    // tags ②：展开页行 + 导航（双臂——CJK CAP 子步 PLAN-028 双臂化：
    // page_meta/read_wiki/exists POST 化收口，split 臂 CJK 开档可达；
    // 单选手风琴换选语义随在）
    await pressButton('tasks · 1', { exact: true })
    await stateIs('tag_expanded', 'tasks')
    await pressButton('wiki/Tasks.ad', { exact: true })
    await stateIs('active_title', 'wiki/Tasks')
    await pressButton('distributed-systems · 1', { exact: true })
    await stateIs('tag_expanded', 'distributed-systems')
    await pressButton('wiki/CAP 定理.ad', { exact: true })
    await stateIs('active_title', 'wiki/CAP 定理')
    // tags ③：空态不设运行时断言（§6——v1 以「面板开+行集非空」为常态
    // 断言，空态走 wanted ⑦ 同判口径）
    // tags ④：Save 后刷新——外造带 tag 档 → 保存 → 面板新行（List<map>
    // 态 dump = 裸 vmref——断言面 = 快照行文本，10 link 面板行同口径）
    fs.writeFileSync(path.join(FIXTURE, 'Tagged Note.ad'), '---\ntags:\n  - meta-save\n---\n\n# T\n', 'utf8')
    await pressButton('保存')
    let metaSaveOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaSaveOk = (await snapshotText()).includes('"meta-save · 1"')
      if (metaSaveOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaSaveOk) throw new Error('tags Save 刷新失守（meta-save 行未现）')
    // inline ⑦（PLAN-009 T-04；meta 组 inline 子步）：body 行内 #tag 聚
    // 合——外造 inline 档（fm 无 tags 键——纯 body 聚合源面）→ 保存
    // （ActSave 触点 TagsRefresh）→ 面板新行 inline-meta · 1
    fs.writeFileSync(path.join(FIXTURE, 'Inline Tagged.ad'), '正文 #inline-meta 尾\n', 'utf8')
    await pressButton('保存')
    let metaInlineOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaInlineOk = (await snapshotText()).includes('"inline-meta · 1"')
      if (metaInlineOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaInlineOk) throw new Error('inline tag 档保存后 tags 面板新行失守（inline-meta · 1 未现）')
    // inline ⑧ 语料基线零漂移回归：7 语料 tag 行全在 + 忽略面负向——
    // 无 block-project-a 行（`{#block-project-a}` 块锚/`[[Tasks#block-
    // project-b]]` 转义链接锚双形态不入集证；TAGS 区段断言——编辑器
    // 文本在面板前，全文负向会误中）
    let metaInlineBaselineOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const region = t.slice(t.indexOf('TAGS'))
      metaInlineBaselineOk = metaTagLabels.every((l) => region.includes(`"${l}"`)) && !region.includes('block-project-a')
      if (metaInlineBaselineOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaInlineBaselineOk) throw new Error('inline ⑧ 语料基线漂移（7 tag 行不全或 block-project-a 入集）')
    // meta 属性子步（PLAN-011 T-04；组内子步不占检查位）：页面属性弹层
    // 六子步弧线（untitled no-op/预填回显/改值保存+tags 面板即时刷/alias
    // 解析 exists 翻转/取消零落盘/删值弧线/保存流互作）。目标页双臂同单
    //（CAP 定理——PLAN-028 双臂化[page_meta POST 化收口]；tags ② 已开
    // 档两臂同构）。弹层内定位 = 标题锚「页面属性」→ content 子树扫
    //（各闭态弹层恒渲染 D-23③——全树首匹配会误中他弹层按钮/input，
    // F-R10-1 修复窗同款纪律）。预置：Hello World body 尾 fs 直写
    // [[帽烟别名]]（悬空相位素材——MetaGo 刷新族 LinksRefreshOf 收口）。
    const findMetaContent = async () => {
      const t = await snapshot()
      const title = findFirst(t, (n) => ownText(n) === '页面属性')
      if (!title) throw new Error('meta dialog title not found in snapshot')
      const header = findParent(t, title)
      const content = findParent(t, header)
      if (!content) throw new Error('meta dialog content not resolved')
      return content
    }
    const typeIntoMetaInput = async (idx, text) => {
      const content = await findMetaContent()
      const inputs = []
      const collectInputs = (n) => {
        if (n.head.startsWith('input ') && elementIdOf(n)) inputs.push(n)
        for (const c of n.children) collectInputs(c)
      }
      collectInputs(content)
      const inp = inputs[idx]
      if (!inp) throw new Error(`meta input[${idx}] not found in dialog content`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(inp), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`meta type_text not ok: ${res}`)
    }
    const pressInMetaDialog = async (buttonText) => {
      const content = await findMetaContent()
      const btn = findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText)
      if (!btn) throw new Error(`meta button "${buttonText}" not found in dialog content`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(meta) not ok: ${res}`)
    }
    // 属性弹层目标 PLAN-028 双臂化（page_meta POST——split 臂 CJK 目标
    // 解除 D-19 降级，两臂同单 wiki/CAP 定理[语料已知答案]）
    const metaTargetTitle = 'wiki/CAP 定理'
    const metaTargetRel = 'wiki/CAP 定理.ad'
    const metaTargetTags0 = 'distributed-systems,theory'
    const metaTargetTab = 'CAP 定理'
    const metaTargetTitle0 = metaTargetTab
    const metaTargetTitleNew = 'CAP 定理日志'
    const hwBodyPath = path.join(FIXTURE, 'wiki', 'Hello World.ad')
    fs.writeFileSync(hwBodyPath, fs.readFileSync(hwBodyPath, 'utf8') + '\n[[帽烟别名]]\n', 'utf8')
    // ①a untitled no-op：ActNew → 未命名 → 入口 press → meta_open 恒 false
    //（action 不挂 enabled D-24③——handler 守卫语义兜底）；收尾关 tab
    await pressButton('文件', { exact: true })
    await pressButton('新建', { exact: true })
    await stateIs('active_title', '未命名')
    await pressButton('文件', { exact: true })
    await pressButton('页面属性…', { exact: true })
    await stateIs('meta_open', 'false')
    await pressActiveTabClose('未命名')
    // 显式重激活目标页（untitled 关闭后激活落点=末位 clamp 面非邻位回
    // 落——tab 序实勘；tab 题钮 = 显示名——pressTab 区域锚）
    await pressTab(metaTargetTab)
    await stateIs('active_title', metaTargetTitle)
    // ①b 有路径档弹层 + 预填回显（语料已知答案）
    await pressButton('文件', { exact: true })
    await pressButton('页面属性…', { exact: true })
    await stateIs('meta_open', 'true')
    let metaPrefillOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const st = await stateText('meta_q_tags')
      metaPrefillOk = st.includes(metaTargetTags0)
      if (metaPrefillOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaPrefillOk) throw new Error(`meta 预填回显失守（want ${metaTargetTags0}）`)
    // ①c title 预填回显（PLAN-013——第三 input 位首；page_meta 三项装配
    // title 首项 → 预填 title 裸值；D-28② fetch 型预填落定等待同款）
    let metaTitlePrefillOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const st = await stateText('meta_q_title')
      metaTitlePrefillOk = st.includes(metaTargetTitle0)
      if (metaTitlePrefillOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaTitlePrefillOk) throw new Error(`meta title 预填回显失守（want ${metaTargetTitle0}）`)
    // ④t title 编辑弧线（PLAN-013 T-04 meta 组子步）：改 title → 保存 →
    // 磁盘 title 行受控改写（diff 仅 title 行）+ 树行显示即时刷新（titles
    // 表随 LinksRefreshOf 顺产——四面之一树面断言）。
    await typeIntoMetaInput(0, metaTargetTitleNew)
    await pressInMetaDialog('保存')
    await stateIs('meta_open', 'false')
    const metaTitleDisk = fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8')
    const metaTitleDiskOk = metaTitleDisk.includes(`title: ${metaTargetTitleNew}`)
      && !metaTitleDisk.includes(`title: ${metaTargetTitle0}\n`) && !metaTitleDisk.includes(`title: ${metaTargetTitle0}\r`)
    let metaTitleTreeOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaTitleTreeOk = (await snapshotText()).includes(`"${metaTargetTitleNew}"`)
      if (metaTitleTreeOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!(metaTitleDiskOk && metaTitleTreeOk)) throw new Error(`meta title 编辑弧线失守（disk=${metaTitleDiskOk} tree=${metaTitleTreeOk}）`)
    // ⑤t 清空 title → 删键回 stem（显示回落——四面回落面；两域边界：
    // 解析域零感——links_json target 面零变化随 ③ alias 断言域承载）
    await pressButton('文件', { exact: true })
    await pressButton('页面属性…', { exact: true })
    await stateIs('meta_open', 'true')
    await typeIntoMetaInput(0, ' ')
    await pressInMetaDialog('保存')
    await stateIs('meta_open', 'false')
    const metaTitleClearDiskOk = !fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8').match(/^title: /m)
    let metaTitleFallOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaTitleFallOk = (await snapshotText()).includes(`"${metaTargetTitle0}"`)
      if (metaTitleFallOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!(metaTitleClearDiskOk && metaTitleFallOk)) throw new Error(`meta title 清空回落失守（disk=${metaTitleClearDiskOk} tree=${metaTitleFallOk}）`)
    // ④ 取消零落盘（前置在改值前——取消路先行的 10c 同款纪律）
    await typeIntoMetaInput(1, 'ghost-tag-x')
    await pressInMetaDialog('取消')
    await stateIs('meta_open', 'false')
    // 取消零落盘 = 磁盘零泄漏面（闭态弹层 input 回显恒在——快照断言
    // 不适用，D-23③ 恒渲染语义）
    const metaCancelOk = !fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8').includes('ghost-tag-x')
    if (!metaCancelOk) throw new Error('meta 取消零落盘失守（ghost 值落盘）')
    // ② 改 tags 保存（追加 smoke-tag）→ 弹层关 + 磁盘 + tags 面板新行即时
    await pressButton('文件', { exact: true })
    await pressButton('页面属性…', { exact: true })
    await stateIs('meta_open', 'true')
    await typeIntoMetaInput(1, metaTargetTags0 + ',smoke-tag')
    await pressInMetaDialog('保存')
    await stateIs('meta_open', 'false')
    let metaPanelOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const region = t.slice(t.indexOf('TAGS'))
      metaPanelOk = region.includes('"smoke-tag · 1"')
      if (metaPanelOk || Date.now() > dl) break
      await sleep(300)
    }
    const metaDisk2 = fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8')
    const metaSaveOk2 = metaPanelOk && metaDisk2.includes('smoke-tag')
    if (!metaSaveOk2) throw new Error(`meta tags 保存失守（panel=${metaPanelOk}）`)
    // ③ alias 解析兑现：CAP 定理/split 别名声明 → [[帽烟别名]] exists 翻转
    //（links_json 断言双臂同构——D-19 免疫）
    await pressButton('文件', { exact: true })
    await pressButton('页面属性…', { exact: true })
    await stateIs('meta_open', 'true')
    await typeIntoMetaInput(2, '帽烟别名')
    await pressInMetaDialog('保存')
    await stateIs('meta_open', 'false')
    let metaAliasOk = false
    for (const dl = Date.now() + 8000; ; ) {
      metaAliasOk = (await stateText('links_json')).includes('{\\"target\\":\\"帽烟别名\\",\\"anchor\\":\\"\\",\\"exists\\":true')
      if (metaAliasOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!metaAliasOk) throw new Error('alias 解析兑现失守（帽烟别名 exists 未翻转）')
    // ⑤ 删值弧线：tags input 清空（全空白 = 删键口径）→ tags 面板行消失
    await pressButton('文件', { exact: true })
    await pressButton('页面属性…', { exact: true })
    await stateIs('meta_open', 'true')
    await typeIntoMetaInput(1, ' ')
    await pressInMetaDialog('保存')
    await stateIs('meta_open', 'false')
    let metaDelOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const region = t.slice(t.indexOf('TAGS'))
      metaDelOk = !region.includes('"smoke-tag · 1"')
      if (metaDelOk || Date.now() > dl) break
      await sleep(300)
    }
    const metaDisk5 = fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8')
    const metaDelDiskOk = metaDelOk && !metaDisk5.includes('tags:')
    if (!metaDelDiskOk) throw new Error('meta 删值弧线失守（tags 键未删）')
    // ⑥ 改写后档保存流回归：body 保存（整文+标记）→ frontmatter 存续
    //（aliases 段在——磁盘现读界符段语义）+ 标记入盘
    {
      const cur = fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8')
      const body = cur.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      const editorId = await findEditorId()
      if (!editorId) throw new Error('editor not found（meta ⑥）')
      await callTool('autoui_action', { element_id: editorId, action: 'type_text', value: body + '\n\nMETA 保存流互作标记。\n' })
      await stateIs('active_dirty', 'true')
      await pressButton('保存')
      await stateIs('active_dirty', 'false')
    }
    const metaDisk6 = fs.readFileSync(path.join(FIXTURE, metaTargetRel), 'utf8')
    const metaInterOk = metaDisk6.includes('META 保存流互作标记') && metaDisk6.includes('帽烟别名')
    if (!metaInterOk) throw new Error('meta 保存流互作失守（标记/frontmatter 存续）')
    await pressButton('视图', { exact: true })
    await pressButton('切换标签', { exact: true })
    await stateIs('tags_open', 'false')
    // wanted ⑤：模式入口（无 input 行/无触发钮 + 语料已知答案行——首页
    // 已消缺故不在，页面名（1）在）
    await pressButton('视图', { exact: true })
    await pressButton('悬空清单', { exact: true })
    await stateIs('find_mode', 'wanted')
    await stateIs('find_open', 'true')
    const metaWantedSnap = await snapshotText()
    const wantedNoInput = !metaWantedSnap.includes('输入查询词') && !metaWantedSnap.includes('过滤文件名') && !metaWantedSnap.includes('"检索"')
    const wantedKnown = metaWantedSnap.includes('"页面名（1）"') && !metaWantedSnap.includes('"首页（1）"')
    if (!(wantedNoInput && wantedKnown)) throw new Error(`wanted 入口断言失守（noInput=${wantedNoInput} known=${wantedKnown}）`)
    // wanted ⑤b：外造悬空源档 → 重入口（ActFindWanted 即刷新）→ 新行
    fs.writeFileSync(path.join(FIXTURE, 'Wanted Source.ad'), '# WS\n\nsee [[Wanted Target]].\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('悬空清单', { exact: true })
    let wantedRowOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedRowOk = (await snapshotText()).includes('"Wanted Target（1）"')
      if (wantedRowOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!wantedRowOk) throw new Error('wanted 外造行未现（入口刷新失守）')
    // wanted ⑧（取消路前置——10c 同款纪律：悬空行素材先走取消路）：
    // 行点击 → 弹层预填 → 取消零落盘
    await pressButton('Wanted Target（1）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await stateIs('create_target', 'Wanted Target')
    await pressInCreateDialog('取消')
    await stateIs('create_confirm_open', 'false')
    const wantedCancelOk = !fs.existsSync(path.join(FIXTURE, 'Wanted Target.ad'))
    if (!wantedCancelOk) throw new Error('wanted 取消零落盘失守')
    // wanted ⑥：创建 → 开档 + 消缺 + exists 翻转（三切片联动弧线；ASCII
    // 目标双臂开档——D-19 面无[ASCII+空格路径简单转义解码在册]）
    await pressButton('Wanted Target（1）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await pressInCreateDialog('创建')
    await stateIs('active_title', 'Wanted Target')
    let wantedFlipOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedFlipOk = (await stateText('links_json')).includes('{\\"target\\":\\"Wanted Target\\",\\"anchor\\":\\"\\",\\"exists\\":true,\\"target_path\\":\\"Wanted Target.ad\\"}')
      if (wantedFlipOk || Date.now() > dl) break
      await sleep(300)
    }
    let wantedGoneOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedGoneOk = !(await snapshotText()).includes('"Wanted Target（1）"')
      if (wantedGoneOk || Date.now() > dl) break
      await sleep(300)
    }
    const wantedDiskOk = fs.existsSync(path.join(FIXTURE, 'Wanted Target.ad'))
      && fs.readFileSync(path.join(FIXTURE, 'Wanted Target.ad'), 'utf8') === '# Wanted Target\n\n'
    if (!(wantedFlipOk && wantedGoneOk && wantedDiskOk)) throw new Error(`wanted 建页弧线失守（flip=${wantedFlipOk} gone=${wantedGoneOk} disk=${wantedDiskOk}）`)
    // wanted ⑦：空态闭环——消缺余量（页面名，语料悬空第二目标【执行期
    // 校正】；create_page POST body CJK 双臂已证——消缺面 = 磁盘+索引
    // 重取+行集重算，双臂同达；split CJK 开档全败不涉本断言）→ wanted
    // 清单空态「（无悬空链接）」
    await pressButton('页面名（1）', { exact: true })
    await stateIs('create_confirm_open', 'true')
    await pressInCreateDialog('创建')
    let wantedEmptyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      wantedEmptyOk = (await snapshotText()).includes('（无悬空链接）')
      if (wantedEmptyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!wantedEmptyOk) throw new Error('wanted 空态闭环失守（（无悬空链接）未现）')
    // 收尾：find 面板关（收起——tags/backlinks 已闭，收起钮唯一）+
    // 反链面板复原开（check 11 首步按「开着→关」口径）
    await pressButton('收起', { exact: true })
    await stateIs('find_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    check('14', 'meta', metaTagsOk && metaSaveOk && metaInlineOk && metaInlineBaselineOk && wantedNoInput && wantedKnown && wantedRowOk && wantedCancelOk && wantedFlipOk && wantedGoneOk && wantedDiskOk && wantedEmptyOk && metaPrefillOk && metaTitlePrefillOk && metaCancelOk && metaSaveOk2 && metaAliasOk && metaDelDiskOk && metaInterOk && metaTitleDiskOk && metaTitleTreeOk && metaTitleClearDiskOk && metaTitleFallOk,
      `meta 组八子步 + inline 子步 + 属性子步（tags：面板开 7 tag 行[语料实勘全集]/展开导航双臂+CJK CAP 案[PLAN-028 双臂化]/Save 刷新外造新行；inline：body #inline-meta 档保存后面板新行+语料基线零漂移回归[忽略面负向无 block-project-a]；wanted：模式入口无 input 行无检索钮/语料已知答案 页面名（1）+外造 Wanted Target（1）/取消零落盘/创建开档+消缺+exists 翻转+模板逐字节/空态闭环（无悬空链接）；属性[PLAN-011+013]：untitled no-op/预填回显[tags+title 位首]/title 编辑弧线[磁盘 title 行受控改写+树行显示即时刷新]+清空回落[删键回 stem 显示]/取消零落盘/tags 保存+面板即时刷/alias 帽烟别名 exists 翻转[links_json 双臂]/删值弧线[空空白=删键]/保存流互作[frontmatter 存续]——目标页双臂同单 CAP 定理[PLAN-028 POST 化收口]）`)

    // —— 弹层/结构锚助手族（PLAN-012/014 纪律修订形态；**PLAN-016 前移
    // **——check 11 trash 子步先用[＋新建/删除弹层]，声明位从 check 13
    // 域上移至本位——同一 runArm 函数体 const TDZ 纪律）。
    //   EXPLORER「＋」= EXPLORER 文本行首 button 子（结构锚，pressActiveTabClose
    //   同族）；
    //   新建 input = 「新建页面」标题上溯 dialog-content 内 input；
    //   新建弹层「创建」= 快照序末创建钮（create_confirm 先声明居前
    //   ——同名钮末者消歧）+ 取消 = 父行兄弟；
    //   删除弹层「删除」= 全树唯一文本锚 + 取消 = 父行兄弟。
    const pressExplorerPlus = async () => {
      const t = await snapshot()
      const label = findFirst(t, (n) => ownText(n) === 'EXPLORER')
      if (!label) throw new Error('EXPLORER text not found')
      const row = findParent(t, label)
      const btn = row.children.find((c) => c !== label && c.head.startsWith('button ') && elementIdOf(c))
      if (!btn) throw new Error('EXPLORER + button not found in header row')
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press EXPLORER + not ok: ${res}`)
    }
    const typeIntoNewInput = async (text) => {
      const t = await snapshot()
      const title = findFirst(t, (n) => ownText(n) === '新建页面')
      if (!title) throw new Error('new-dialog title not found')
      const header = findParent(t, title)
      const content = findParent(t, header)
      const inp = content ? findFirst(content, (n) => n.head.startsWith('input ') && elementIdOf(n)) : null
      if (!inp) throw new Error('new-dialog input not found in snapshot')
      const res = await callTool('autoui_action', { element_id: elementIdOf(inp), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`new-input type_text not ok: ${res}`)
    }
    const pressInNewDialog = async (buttonText) => {
      // 锚定「新建页面」标题上溯 dialog-content 子树（PLAN-012 纪律修订：
      // 新建目录弹层「创建」钮后声明——全树末位钮序锚破，结构锚为唯一
      // 消歧面；取消 = 目标钮父行兄弟）。
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const title = findFirst(t, (n) => ownText(n) === '新建页面')
        if (title) {
          const header = findParent(t, title)
          const content = findParent(t, header)
          const btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText) : null
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(new) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in new-dialog not found`)
        await sleep(300)
      }
    }
    const pressInDeleteDialog = async (buttonText) => {
      // 标题锚 content 子树扫（PLAN-014 纪律修订——删除目录弹层「删除」
      // 钮同名后全树唯一文本锚破[D-29③ 家族]，标题锚为唯一消歧面——
      // meta/new/目录族同款）。
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const title = findFirst(t, (n) => ownText(n) === '删除页面')
        if (title) {
          const header = findParent(t, title)
          const content = findParent(t, header)
          const btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText) : null
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(delete) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in delete-dialog not found`)
        await sleep(300)
      }
    }
    // PLAN-012 弹层族通用锚（新建目录/移动到目录——标题上溯 content 子树
    // 取 input/按钮：「创建」双弹层同名，末位序锚随第七实例声明破——
    // 结构锚为唯一消歧面，pressInNewDialog 同款纪律修订）。
    const typeIntoDialogInput = async (titleText, text) => {
      const t = await snapshot()
      const title = findFirst(t, (n) => ownText(n) === titleText)
      if (!title) throw new Error(`dialog title "${titleText}" not found`)
      const header = findParent(t, title)
      const content = findParent(t, header)
      const inp = content ? findFirst(content, (n) => n.head.startsWith('input ') && elementIdOf(n)) : null
      if (!inp) throw new Error(`input in "${titleText}" dialog not found`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(inp), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`type_text(${titleText}) not ok: ${res}`)
    }
    // 双 input 弹层第 idx 个 input（PLAN-014 重命名目录——目标[0]居首
    // 新名[1]居次，视图序即快照序；D-29③ 标题锚 content 子树扫）。
    const typeIntoDialogInputIdx = async (titleText, idx, text) => {
      const t = await snapshot()
      const title = findFirst(t, (n) => ownText(n) === titleText)
      if (!title) throw new Error(`dialog title "${titleText}" not found`)
      const header = findParent(t, title)
      const content = findParent(t, header)
      const inputs = []
      const collectInputs = (n) => {
        if (n.head.startsWith('input ') && elementIdOf(n)) inputs.push(n)
        for (const c of n.children) collectInputs(c)
      }
      if (content) collectInputs(content)
      const inp = inputs[idx]
      if (!inp) throw new Error(`input[${idx}] in "${titleText}" dialog not found`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(inp), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`type_text[${idx}](${titleText}) not ok: ${res}`)
    }
    const pressInDialogByTitle = async (titleText, buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const title = findFirst(t, (n) => ownText(n) === titleText)
        if (title) {
          const header = findParent(t, title)
          const content = findParent(t, header)
          const btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText) : null
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(${titleText}) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in "${titleText}" not found`)
        await sleep(300)
      }
    }
    // 弹层按钮可见性探测（PLAN-025 三择钮断言面——press 无副作用版；
    // 标题锚 content 子树同 pressInDialogByTitle 扫描）。
    const buttonInDialogVisible = async (titleText, buttonText) => {
      const t = await snapshot()
      const title = findFirst(t, (n) => ownText(n) === titleText)
      if (!title) return false
      const header = findParent(t, title)
      const content = findParent(t, header)
      return !!findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText)
    }
    const pressExplorerFolderPlus = async () => {
      // 「⊕」= EXPLORER 行第二 button（「＋」居首——序纪律在案，
      // pressExplorerPlus 首 button 锚不扰）。
      const t = await snapshot()
      const label = findFirst(t, (n) => ownText(n) === 'EXPLORER')
      const row = findParent(t, label)
      const btns = row.children.filter((c) => c.head.startsWith('button ') && elementIdOf(c))
      if (btns.length < 2) throw new Error('EXPLORER ⊕ button not found')
      const res = await callTool('autoui_action', { element_id: elementIdOf(btns[1]), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press EXPLORER ⊕ not ok: ${res}`)
    }
    const panelSliceOf = (txt) => {
      const i = txt.indexOf('反链')
      return i < 0 ? '' : txt.slice(i, i + 1200)
    }
    // —— 快开弹层区（PLAN-038 T-03）：标题 ownText 精确 '快速打开' 非按钮
    // 节点上溯两代 = dialog-content；menubar popover 闭态不渲染菜单内容，
    // 工具栏钮 ownText = 图标名拼连（非全等）——标题节点在弹层开启期唯一。
    function quickDialogRegion(t) {
      const title = findFirst(t, (n) => ownText(n) === '快速打开' && !n.head.startsWith('button '))
      if (!title) return null
      const header = findParent(t, title)
      return header ? findParent(t, header) : null
    }
    const quickDialogTexts = (t) => {
      const region = quickDialogRegion(t)
      if (!region) return []
      const out = []
      const walk = (n) => {
        out.push(ownText(n))
        for (const c of n.children) walk(c)
      }
      walk(region)
      return out
    }
    /** 快开弹层 input（区域锚——弹层 input 声明位在其他弹层族之前，但
     *  闭态弹层族恒渲染 input[D-23③]，全树首 input 锚不可靠——区域扫）。 */
    const quickDialogInput = (t) => {
      const region = quickDialogRegion(t)
      return region ? findFirst(region, (n) => n.head.startsWith('input ') && elementIdOf(n)) : null
    }

    // 11 find（PLAN-004 T-04；**PLAN-038 T-03 迁移**）：快开子步迁独立
    // 根弹层（快速打开入口开 quick_open 弹层——files 用户面退役），行集
    // /recents 断言走弹层区域锚；检索 text 模式子步留右栏面板（input 锚
    // 改面板区域扫——快开弹层闭态 input 恒渲染[D-23③]且声明位居前，全树
    // 首 input 锚失效）。执行序在 quit 前（quit 恒为臂内最后一项）；先关
    // 反链面板（check 10 开着）——find 行断言免反链行 .ad 路径文本重叠。
    // 快开：入口（菜单）→ quick_open true + 弹层可见 + 空 q recents 替换
    // 式（开档记录累积后）+ 过滤（Pro→Projects 独行；CJK 定理→CAP 独行
    // ——纯前端 casefold contains 双臂同跑）+ 拾取即关（Projects/CAP——
    // CJK 拾取导航子步 PLAN-028 双臂化：三契约 POST 化收口，split 同单）。
    // 检索：text 切模式 + 未运行提示 + CJK 查询「任务列表」（POST 通道
    // ——D-19 面无，双臂同跑）→ Hello World 行（ASCII 路径导航双臂）+
    // 面板保持开 + 运行后空态。
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    const findTree0 = await snapshot()
    const findInput0 = quickDialogInput(findTree0)
    if (!findInput0) throw new Error('quick dialog input not found in snapshot（快开子步）')
    // 行文本 = 显示名（PLAN-013 快开面——dtitle_of fallback=path：有 title
    // 显 title、无 title 显全路径）；断言域 = panelRowTexts 面板行集（树行
    // 同文名不误中——区域锚）。
    // **PLAN-020 空 q 断言修订（SD-2001——005「空 q 全量 5 行」计划内修
    // 订）**：本位 = check 3..⑦ 开档记录累积后 → 「最近」段替换式（
    // Obsidian 快速切换器同款）：段标题 + 已开档行（Hello World 在——10m
    // 收尾激活口 + ⑦ 预览开口）+ 未开档排除（Projects 首开在 check 12
    // ——替换式直证）；**首跑无记录全量面**[005 零漂移] = T-02 冒烟一次
    // 性件承载[.runtime——boot 后零开档窗全量 5 行实录]，README N 定谳
    // 注记（arm 内 recent_paths 会话域自 boot 累积，六检查位无零记录窗）。
    const panelRows0 = await quickDialogTexts(findTree0)
    const recentsReplacedOk = panelRows0.includes('最近') && panelRows0.includes('Hello World')
      && !panelRows0.includes('Projects') && panelRows0.length >= 1
    if (!recentsReplacedOk) throw new Error(`空 q recents 替换面失守 rows=${JSON.stringify(panelRows0)}`)
    await callTool('autoui_action', { element_id: elementIdOf(findInput0), action: 'type_text', value: 'Pro' })
    await stateHas('quick_q', 'Pro')
    const proRows = await quickDialogTexts(await snapshot())
    const proOk = proRows.includes('Projects') && !proRows.includes('CAP 定理') && !proRows.includes('首页')
    if (!proOk) throw new Error('快开过滤 "Pro" 未隔离 Projects 独行')
    // 弹层行点击（QuickPick——区域锚消歧；拾取成功即关——quick_open false）
    const pressQuickRow = async (label) => {
      const t = await snapshot()
      const region = quickDialogRegion(t)
      const btn = region ? findFirst(region, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === label) : null
      if (!btn) throw new Error(`quick row "${label}" not found`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press quick row "${label}" not ok: ${res}`)
    }
    await pressQuickRow('Projects')
    await stateIs('active_title', 'wiki/Projects')
    await stateIs('quick_open', 'false')
    // CJK 文件名过滤（重开弹层；行断言 + 拾取导航子步双臂——PLAN-028
    // 三契约 POST 化收口）
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    const findTree1 = await snapshot()
    const findInput1 = quickDialogInput(findTree1)
    if (!findInput1) throw new Error('quick dialog input not found in snapshot（CJK 子步）')
    await callTool('autoui_action', { element_id: elementIdOf(findInput1), action: 'type_text', value: '定理' })
    await stateHas('quick_q', '定理')
    const cjkRows = await quickDialogTexts(await snapshot())
    const cjkFilterOk = cjkRows.includes('CAP 定理') && !cjkRows.includes('Projects')
    if (!cjkFilterOk) throw new Error('CJK 文件名过滤「定理」未隔离 CAP 定理')
    await pressQuickRow('CAP 定理')
    await stateIs('active_title', 'wiki/CAP 定理')
    await stateIs('quick_open', 'false')
    // 检索子步（text 模式；input = 右栏面板区域扫——闭态快开弹层 input
    // 恒渲染且声明位居前，全树首 input 锚失效，PLAN-038 T-03）
    await pressButton('视图', { exact: true })
    await pressButton('全文检索', { exact: true })
    await stateIs('find_mode', 'text')
    await stateIs('find_open', 'true')
    const notRanOk = (await snapshotText()).includes('（输入查询词后检索）')
    if (!notRanOk) throw new Error('text 未运行空态提示缺失')
    const panelInputOf = async () => {
      for (let i = 0; i < 10; i++) {
        const t = await snapshot()
        const region = panelRegion(t)
        const inp = region ? findFirst(region, (n) => n.head.startsWith('input ') && elementIdOf(n)) : null
        if (inp) return inp
        await sleep(300)
      }
      throw new Error('text-panel input not found in panel region')
    }
    const findInput2 = await panelInputOf()
    await callTool('autoui_action', { element_id: elementIdOf(findInput2), action: 'type_text', value: '任务列表' })
    await stateHas('find_q', '任务列表')
    await pressButton('检索', { exact: true })
    await stateIs('find_ran', 'true')
    // 命中行文本 = 显示名（PLAN-013 检索面——fallback r.title 恒 stem）
    const hitOk = (await panelRowTexts()).includes('Hello World')
    if (!hitOk) throw new Error('CJK 检索「任务列表」未出 Hello World 行（POST 通道双臂）')
    await pressPanelRow('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await stateIs('find_open', 'true')
    const findInput3 = await panelInputOf()
    await callTool('autoui_action', { element_id: elementIdOf(findInput3), action: 'type_text', value: 'zzz-无此词-xyz' })
    await stateHas('find_q', 'zzz-无此词-xyz')
    await pressButton('检索', { exact: true })
    const emptyFindOk = (await snapshotText()).includes('（无结果）')
    // ⑤ alias 检索子步（PLAN-012 T-04）：fs 造 alias 档（10m 同款——
    // 检索走 back walk 零树依赖；POST 通道双臂无 D-19 面）→ 搜 alias
    // 「检别名」→ 命中行（行文本 = 显示名——AliasTgt 无 title → fallback
    // r.title 恒 stem 口径，title=stem 面由 T-01 probe ⑨ 直证）→ 拾取
    // 开档（ASCII 双臂）→ 复原 Hello World 激活（check 12 前置口径）。
    fs.writeFileSync(path.join(FIXTURE, 'AliasTgt.ad'), '---\ntags:\naliases:\n  - 检别名\n---\n# AliasTgt\n\n正文无别名一词。\n')
    const findInput4 = await panelInputOf()
    await callTool('autoui_action', { element_id: elementIdOf(findInput4), action: 'type_text', value: '检别名' })
    await stateHas('find_q', '检别名')
    await pressButton('检索', { exact: true })
    const aliasHitOk = (await panelRowTexts()).includes('AliasTgt')
    if (!aliasHitOk) throw new Error('alias 检索「检别名」未出 AliasTgt 行（PLAN-012 alias 命中面）')
    await pressPanelRow('AliasTgt')
    await stateIs('active_title', 'AliasTgt')
    await stateIs('find_open', 'true')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // ⑥ trash 模式子步（PLAN-016 T-04；find 组——组数不变，fail 即臂败
    // ，10m 同款）：素材 = ＋ 新建 TrashMe（NewGo 全弧——树新行 + ft_sel
    // 置位 + tab 开）→ 菜单删除（**④ 弹层文案断言**「将移入回收站
    // TrashMe.ad」——AC-03；改道磁盘面 .trash/TrashMe.ad）→ 文件→回收站
    //（第四模式入口——Ctrl+Shift+T 键程 menubar 共口）→ 清单行 →
    // 清空回收站 → 强确认弹层（M=1 派生 + 取消留置 → 清空）→ 空态闭环
    // + 磁盘 .trash 消。⚠ 弹层锚助手（pressInDialogByTitle 族）声明位
    // 在 check 13 域——本子步自带局部锚（标题 text 节点非 button——
    // 「清空回收站」面板钮同名双现，D-29③ 家族消歧）。
    const trashPressIn = async (titleText, buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const title = findFirst(t, (n) => ownText(n) === titleText && !n.head.startsWith('button '))
        if (title) {
          const header = findParent(t, title)
          const content = findParent(t, header)
          const btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText) : null
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(${titleText}) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in "${titleText}" not found`)
        await sleep(300)
      }
    }
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoDialogInput('新建页面', 'TrashMe')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('ft_sel', 'TrashMe.ad')
    await stateIs('active_title', 'TrashMe')
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    let trashCopyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      trashCopyOk = (await snapshotText()).includes('将移入回收站 TrashMe.ad')
      if (trashCopyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashCopyOk) throw new Error('删除弹层文案失守（将移入回收站 TrashMe.ad 未现——AC-03）')
    await pressInDeleteDialog('删除')
    try {
      await stateIs('delete_open', 'false')
    } catch (e) {
      for (const f of ['lc_verdict', 'lc_status', 'lc_hold', 'save_note', 'ft_sel', 'lc_block_list']) {
        console.log('[T11-DBG]', f, '=', await stateText(f))
      }
      const con = await stateText('console')
      console.log('[T11-DBG] console-tail =', con.slice(-800))
      throw e
    }
    const trashRerouteOk = !fs.existsSync(path.join(FIXTURE, 'TrashMe.ad'))
      && fs.existsSync(path.join(FIXTURE, '.trash', 'TrashMe.ad'))
    if (!trashRerouteOk) throw new Error('删除改道失守（.trash/TrashMe.ad 未现）')
    await pressButton('文件', { exact: true })
    await pressButton('回收站', { exact: true })
    await stateIs('find_open', 'true')
    await stateIs('find_mode', 'trash')
    let trashRowOk = false
    for (const dl = Date.now() + 8000; ; ) {
      trashRowOk = (await snapshotText()).includes('.trash/TrashMe.ad')
      if (trashRowOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashRowOk) throw new Error('trash 清单失守（.trash/TrashMe.ad 行未现）')
    // 清空强确认弹层：M=1 派生 + 取消留置（零落盘）→ 复按 → 清空 →
    // 空态闭环 + 磁盘消。
    await pressButton('清空回收站', { exact: true })
    let purgeCopyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      purgeCopyOk = (await snapshotText()).includes('将永久删除回收站内全部 1 项')
      if (purgeCopyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!purgeCopyOk) throw new Error('清空强确认文案失守（M=1 派生未现）')
    await trashPressIn('清空回收站', '取消')
    const purgeCancelOk = fs.existsSync(path.join(FIXTURE, '.trash', 'TrashMe.ad'))
    await pressButton('清空回收站', { exact: true })
    await trashPressIn('清空回收站', '清空')
    let trashEmptyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      trashEmptyOk = (await snapshotText()).includes('（回收站为空）')
      if (trashEmptyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashEmptyOk) throw new Error('清空后空态失守（（回收站为空）未现）')
    const purgeDiskOk = !fs.existsSync(path.join(FIXTURE, '.trash'))
    if (!purgeDiskOk) throw new Error('purge 磁盘失守（.trash 未消）')
    // ⑦ trash 增强子步（PLAN-019 T-03/T-04；find 组——组数不变，fail 即
    // 臂败）：素材 = ＋新建 TrashR1/TrashR2 双档 → 菜单删除双改道（.trash
    // 双条目）→ 清单双行 → **行点击预览**（路径 ghost button → OpenLink
    // ——.trash 路径 read_wiki 直读：tab 开[active_title=.trash/TrashR1
    // ——strip_ad 口径]+树不可见[ft_nodes 零 .trash——dot 忽略]）→
    // **保存落回 .trash 原位**（编辑+ActSave → 磁盘 .trash/TrashR1.ad
    // 含标记——可编辑口径 SD-1901 磁盘直证）→ 关预览 tab → **恢复全部**
    // （TrashRestoreAll——逐条循环 restore + 末次三刷）→ 清单空态 + 磁盘
    // 双档回根（TrashR1 含标记字节保真——保存落回+恢复链全程保真）。
    // 建一删一双弧线（删除目标 = ft_sel——选中档；两档不得连建后删）。
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoDialogInput('新建页面', 'TrashR1')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('ft_sel', 'TrashR1.ad')
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoDialogInput('新建页面', 'TrashR2')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('ft_sel', 'TrashR2.ad')
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    // 重开回收站（ActTrash 单取形 refetch——清单陈旧态刷新，016 收起
    // 重开同款口径；vm 轨 menubar 项「回收站」唯一按钮文本）。
    await pressButton('文件', { exact: true })
    await pressButton('回收站', { exact: true })
    await stateIs('find_mode', 'trash')
    let trashRows2Ok = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      trashRows2Ok = t.includes('.trash/TrashR1.ad') && t.includes('.trash/TrashR2.ad')
      if (trashRows2Ok || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashRows2Ok) throw new Error('trash 增强清单失守（TrashR1/R2 双行未现）')
    // 行点击预览：路径钮（ghost button——行点击 = OpenLink 预览开档）。
    await pressPanelRow('.trash/TrashR1.ad')
    await stateIs('active_title', '.trash/TrashR1')
    // 树不可见 = EXPLORER 区子树零 .trash 行（dot 忽略面；⚠ 全树快照
    // 含 tab 题钮 '.trash/TrashR1'——区域锚消歧；state dump ft_nodes =
    // 不透明 vmref 不可文本断言）。
    const exrTrash = explorerRegion(await snapshot())
    const exrTexts = []
    const walkEx = (n) => {
      const ot = ownText(n)
      if (ot) exrTexts.push(ot)
      for (const c of n.children) walkEx(c)
    }
    if (exrTrash) walkEx(exrTrash)
    const trashTreeInvisibleOk = !!exrTrash && !exrTexts.join('\n').includes('.trash/')
    await typeWholeDoc('# TrashR1\n\n回收站预览标记：保存落回原位。\n')
    await stateIs('active_dirty', 'true')
    // 保存按法 = check 5 在册形态（非精确——toolbar 图标钮 "save保存"
    // endsWith 命中；exact 会命中闭合弹层态 menubar 项，press 不派发）。
    await pressButton('保存')
    await stateIs('active_dirty', 'false')
    let trashSaveBackOk = false
    for (const dl = Date.now() + 8000; ; ) {
      try {
        trashSaveBackOk = fs.readFileSync(path.join(FIXTURE, '.trash', 'TrashR1.ad'), 'utf8').includes('保存落回原位')
      } catch {}
      if (trashSaveBackOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashSaveBackOk) throw new Error('保存落回 .trash 原位失守（可编辑口径 SD-1901）')
    await pressActiveTabClose('.trash/TrashR1')
    // 恢复全部：钮 → 逐条循环 restore → 清单空态 + 磁盘双档回根。
    await pressButton('恢复全部', { exact: true })
    let restoreAllEmptyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      restoreAllEmptyOk = (await snapshotText()).includes('（回收站为空）')
      if (restoreAllEmptyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!restoreAllEmptyOk) throw new Error('恢复全部空态失守（（回收站为空）未现）')
    let restoreAllDiskOk = false
    for (const dl = Date.now() + 8000; ; ) {
      try {
        restoreAllDiskOk = fs.readFileSync(path.join(FIXTURE, 'TrashR1.ad'), 'utf8').includes('保存落回原位')
          && fs.existsSync(path.join(FIXTURE, 'TrashR2.ad'))
          && !fs.existsSync(path.join(FIXTURE, '.trash', 'TrashR1.ad'))
          && !fs.existsSync(path.join(FIXTURE, '.trash', 'TrashR2.ad'))
      } catch {}
      if (restoreAllDiskOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!restoreAllDiskOk) throw new Error('恢复全部磁盘失守（TrashR1 含标记回根/TrashR2 回根/.trash 内清）')
    // ⑧ orphans 模式子步（PLAN-020 T-03；find 组第五模式——组数不变，
    // fail 即臂败）：入口菜单（Ctrl+Shift+O 键程 menubar 共口）→ 无 input
    // 断言（wanted ⑤ 同款负向文本面）→ **fs 造纯孤页档** Orphan Pg[
    // link_index back walk 零树依赖——alias 案同款]→ 重入口（ActFindOrphans
    // 入口即刷新）→ 行现 → 行点击 OpenLink 开档（active_title）→ **造链
    // 清孤**（编辑加出链 + 保存 → ActSave 触发 LinksRefreshOf 顺产重算 →
    // 重入口行消）→ **悬空出链计入出链度**（OrphanD 仅悬空出链档非孤——
    // SD-2001 resolved 面直证）→ 收尾关孤页 tab + fs 删双素材（14 wanted
    // 已知答案域洁净——OrphanD 悬空链随删消；pristine 空态[（无孤页）]面
    // = T-02 冒烟实录承载——本位态 fs 素材族孤儿非空，相对断言口径）。
    await pressButton('视图', { exact: true })
    await pressButton('孤页清单', { exact: true })
    await stateIs('find_open', 'true')
    await stateIs('find_mode', 'orphans')
    const orphSnap0 = await snapshotText()
    const orphNoInput = !orphSnap0.includes('过滤文件名') && !orphSnap0.includes('输入查询词') && !orphSnap0.includes('"检索"')
    if (!orphNoInput) throw new Error('orphans 无 input 断言失守（第五模式 wanted/trash 同构）')
    const orphRowsBefore = await panelRowTexts()
    if (orphRowsBefore.includes('Orphan Pg')) throw new Error('孤页预态失守（Orphan Pg 不应在列——素材残留）')
    fs.writeFileSync(path.join(FIXTURE, 'Orphan Pg.ad'), '# Orphan Pg\n\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('孤页清单', { exact: true })
    let orphListedOk = false
    for (const dl = Date.now() + 8000; ; ) {
      orphListedOk = (await panelRowTexts()).includes('Orphan Pg')
      if (orphListedOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!orphListedOk) throw new Error('孤页行未现（纯孤页档入列——link_index back walk）')
    await pressPanelRow('Orphan Pg')
    await stateIs('active_title', 'Orphan Pg')
    await typeWholeDoc('# Orphan Pg\n\n见 [[Hello World]] 一处。\n')
    await stateIs('active_dirty', 'true')
    await pressButton('保存')
    await stateIs('active_dirty', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('孤页清单', { exact: true })
    let orphClearedOk = false
    for (const dl = Date.now() + 8000; ; ) {
      orphClearedOk = !(await panelRowTexts()).includes('Orphan Pg')
      if (orphClearedOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!orphClearedOk) throw new Error('造链清孤失守（出链度 1 后行未消）')
    fs.writeFileSync(path.join(FIXTURE, 'OrphanD.ad'), '# OrphanD\n\n指 [[No Such Target]]。\n', 'utf8')
    await pressButton('视图', { exact: true })
    await pressButton('孤页清单', { exact: true })
    let orphDanglingOk = false
    for (const dl = Date.now() + 8000; ; ) {
      orphDanglingOk = !(await panelRowTexts()).includes('OrphanD')
      if (orphDanglingOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!orphDanglingOk) throw new Error('悬空出链度失守（仅悬空出链档不应入孤页清单——SD-2001 resolved 面）')
    await pressActiveTabClose('Orphan Pg')
    fs.rmSync(path.join(FIXTURE, 'Orphan Pg.ad'), { force: true })
    fs.rmSync(path.join(FIXTURE, 'OrphanD.ad'), { force: true })
    // ⑨ recents 弧线子步（PLAN-020 T-03；快开空 q 双态行为面——fail 即
    // 臂败）：清 q（type_text 空 → FindEdit('') 通道）→「最近」段（累积
    // 开档记录——⑦ 预览开口 head，结构性断言非具体序避免素材序耦合）→
    // 开 3 档[index/Tasks/Hello World 快开拾取——ASCII 路径双臂 D-19 免疫
    // ；Projects 避让——check 12 素材预开即扰其弹层锚位态]→ 清 q → 头 3
    // 行逆序（Hello World/Tasks/首页——最近者首）→ 拾取即关（files 契约
    // 不变）→ 去重置顶（重拾 Tasks → 头位）→ **容量截断**（fs 造
    // RecCap1..12 + ActDaily 树刷新[018 素材承载同款]→ 12 开 → 10 行
    // 头 RecCap12 尾 RecCap3——daily/旧记录全数位移出窗）。
    // **PLAN-038 T-03 迁移**：⑨ 弧全走快开根弹层面（入口=菜单口；输入=
    // 弹层 input 区域锚；行序断言 = 弹层区 button 标签序[排除取消钮]；
    // 拾取 = QuickPick 行钮——成功即关 quick_open false）。
    const clearFindQ = async () => {
      for (let i = 0; i < 10; i++) {
        const ft = await snapshot()
        const fi = quickDialogInput(ft)
        if (fi) {
          await callTool('autoui_action', { element_id: elementIdOf(fi), action: 'type_text', value: '' })
          await stateIs('quick_q', '')
          return
        }
        await sleep(300)
      }
      throw new Error('quick dialog input not found（recents 清 q）')
    }
    const pickViaQuick = async (query, label) => {
      await pressButton('视图', { exact: true })
      await pressButton('快速打开', { exact: true })
      await stateIs('quick_open', 'true')
      for (let i = 0; i < 10; i++) {
        const ft = await snapshot()
        if (quickDialogInput(ft)) break
        await sleep(300)
      }
      const ft2 = await snapshot()
      const fi2 = quickDialogInput(ft2)
      if (!fi2) throw new Error('quick dialog input not found（recents 拾取）')
      await callTool('autoui_action', { element_id: elementIdOf(fi2), action: 'type_text', value: query })
      await stateHas('quick_q', query)
      await pressQuickRow(label)
      await stateIs('quick_open', 'false')
    }
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    await clearFindQ()
    // 行序断言域 = 弹层区 button 标签（取消钮排除；行显示名 + 无他钮）
    const quickRowLabels = async () => {
      const t = await snapshot()
      const region = quickDialogRegion(t)
      if (!region) return []
      const out = []
      const walk = (n) => {
        if (n.head.startsWith('button ') && elementIdOf(n) && ownText(n) !== '取消') out.push(ownText(n))
        for (const c of n.children) walk(c)
      }
      walk(region)
      return out
    }
    const recRows0 = await quickRowLabels()
    const recAccumOk = recRows0.length >= 1 && quickDialogTexts(await snapshot()).includes('最近')
    if (!recAccumOk) throw new Error(`「最近」段失守（累积态 rows=${JSON.stringify(recRows0)}）`)
    await pickViaQuick('index', '首页')
    await pickViaQuick('Tasks', 'Tasks')
    await pickViaQuick('Hello', 'Hello World')
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    await clearFindQ()
    const recRows1 = await quickRowLabels()
    const recOrderOk = recRows1[0] === 'Hello World' && recRows1[1] === 'Tasks' && recRows1[2] === '首页'
    if (!recOrderOk) throw new Error(`「最近」逆序失守 rows=${JSON.stringify(recRows1)}`)
    await pressQuickRow('Hello World')
    await stateIs('quick_open', 'false')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    await pickViaQuick('Tasks', 'Tasks')
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    await clearFindQ()
    const recRows2 = await quickRowLabels()
    const recDedupOk = recRows2[0] === 'Tasks' && recRows2[1] === 'Hello World' && recRows2[2] === '首页'
    if (!recDedupOk) throw new Error(`去重置顶失守 rows=${JSON.stringify(recRows2)}`)
    for (let i = 1; i <= 12; i++) fs.writeFileSync(path.join(FIXTURE, `RecCap${i}.ad`), `# RecCap${i}\n\n`, 'utf8')
    await pressButton('今日笔记')
    for (let i = 1; i <= 12; i++) {
      await pickViaQuick(`RecCap${i}`, `RecCap${i}`)
    }
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    await clearFindQ()
    const recRows3 = await quickRowLabels()
    const recCapOk = recRows3.length === 10 && recRows3[0] === 'RecCap12' && recRows3[9] === 'RecCap3'
    if (!recCapOk) throw new Error(`容量截断失守 len=${recRows3.length} rows=${JSON.stringify(recRows3)}`)
    // ⑩ 持久化逐行验（PLAN-021 T-03；SD-2101 落盘面——fail 即臂败）：
    // ⑨ 弧终态 recents（RecCap12..RecCap3 十行）↔ .jade/recents.txt 磁盘
    // 逐行一致（八触点「变更即存」的落盘面直证）；面板行文本 = path 本
    // 身（RecCap* 无 title——dtitle fallback = path），与磁盘行同域可比。
    const diskLines = fs.readFileSync(path.join(FIXTURE, '.jade', 'recents.txt'), 'utf8').split('\n').filter((l) => l !== '')
    // 面板行文本 = 显示名（dtitle 缺省 stem——.ad 尾剥）；磁盘行 = 身份域
    // path。逐行验按显示域归一（剥 .ad 尾）——身份域逐行锚 = 臂尾 ⑩b
    // state 清单对读。
    const diskStems = diskLines.map((l) => (l.endsWith('.ad') ? l.slice(0, -3) : l))
    const recDiskOk = JSON.stringify(diskStems) === JSON.stringify(recRows3)
    if (!recDiskOk) throw new Error(`持久化逐行验失守 disk=${JSON.stringify(diskLines)} panel=${JSON.stringify(recRows3)}`)
    // 免索引负向（PLAN-021；D-33① 点前缀 walk 忽略——树/面板快照零 .jade
    // 感知；state dump 侧由基线 v19 全文承载零感知）。
    const snapNoJade = !(await snapshotText()).includes('.jade')
    if (!snapNoJade) throw new Error('.jade 泄漏进树/面板快照（免索引面失守）')
    // 收尾：快开弹层关（⑨ 终态「最近」段行集含 RecCap*——取消钮关层
    // 复位；弹层闭态行区不渲染，check 12 反链面板负向断言不受污染）。
    const pressQuickCancel = async () => {
      const t = await snapshot()
      const region = quickDialogRegion(t)
      const btn = region ? findFirst(region, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '取消') : null
      if (!btn) throw new Error('quick cancel button not found')
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press quick cancel not ok: ${res}`)
    }
    await pressQuickCancel()
    await stateIs('quick_open', 'false')
    check('11', 'find', recentsReplacedOk && proOk && cjkFilterOk && notRanOk && hitOk && emptyFindOk && aliasHitOk && trashCopyOk && trashRerouteOk && trashRowOk && purgeCopyOk && purgeCancelOk && trashEmptyOk && purgeDiskOk && trashRows2Ok && trashTreeInvisibleOk && trashSaveBackOk && restoreAllEmptyOk && restoreAllDiskOk && orphNoInput && orphListedOk && orphClearedOk && orphDanglingOk && recAccumOk && recOrderOk && recDedupOk && recCapOk && recDiskOk && snapNoJade,
      `快开（**PLAN-038 T-03 独立根弹层**——quick_open/quick_q 弹层面[区域锚]/空q recents 替换面[PLAN-020 断言修订语义迁移——最近段+已开档行+未开档排除]/Pro→Projects 独行拾取即关[QuickPick→quick_open false]/定理→CAP 独行+CJK 拾取开档双臂[PLAN-028 POST 化收口]）+ 检索（text 切换/未运行提示/CJK「任务列表」POST 双臂命中/行导航面板保持开/运行后空态）+ alias 检索（PLAN-012——fs 造档→搜「检别名」→AliasTgt.ad 行→拾取开档双臂）+ trash 模式[PLAN-016 ⑥：＋新建 TrashMe→菜单删除 弹层文案「将移入回收站」+改道磁盘面→回收站第四模式 清单行→清空强确认[M=1 派生+取消留置零落盘]→清空→空态闭环+磁盘 .trash 消]+ **trash 增强 ⑦[PLAN-019：双条目清单→行点击预览[.trash 路径 tab 开 active_title=.trash/TrashR1+树不可见]+保存落回 .trash 原位[磁盘标记直证——可编辑口径]+恢复全部[循环 restore→清单空态+磁盘双档回根字节保真]]+ **⑧ orphans 第五模式[PLAN-020：无 input 负向面+fs 造纯孤页档入列[back walk 零树依赖]+行点击开档+造链清孤[ActSave 顺产重算行消]+悬空出链计入出链度[OrphanD 非孤——resolved 面直证]]+ ⑨ recents 弧线[PLAN-020：清 q[type_text 空]→「最近」段累积态→3 开[index/Tasks/Hello World ASCII 拾取]→头 3 行逆序→拾取即关→去重置顶[重拾 Tasks 头位]→容量截断[RecCap×12+ActDaily 树刷新→12 开→10 行 头 RecCap12 尾 RecCap3]]+ **⑩ 持久化逐行验[PLAN-021：⑨ 弧终态 ↔ .jade/recents.txt 磁盘逐行一致+快照免索引负向]**`)

    // N name（PLAN-033 T-04）：名称查找一致原生组（R-04）。语料 = fs 造
    // nm/ 子树（外部变更面——查找入口重开即 NamesRefresh 取新目录：本组
    // 首弧即该规则的原生直证，10m fs 造档先例）。错误/迟到门 = 网络可
    // 观测面——vue 轨 e2e name-search.spec 承载（merged 无网络层，不设
    // 虚假案）；本组 = 输入与行集 / 同名逐路径打开 / 标题·alias·相对
    // 路径查找 / 模式门（行域隔离）/ 外部刷新。
    fs.mkdirSync(path.join(FIXTURE, 'nm', 'deep', 'l2', 'l3', 'l4', 'l5'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'nm', 'NmHome.ad'), '---\ntitle: 首页\naliases:\n- 起点\n---\n\n普通正文段落。\n')
    fs.writeFileSync(path.join(FIXTURE, 'nm', 'NmDupA.ad'), '---\ntitle: 重名页\n---\n\n甲处正文。\n')
    fs.writeFileSync(path.join(FIXTURE, 'nm', 'NmDupB.ad'), '---\ntitle: 重名页\n---\n\n乙处正文。\n')
    fs.writeFileSync(path.join(FIXTURE, 'nm', 'NmAlias.ad'), '---\naliases:\n- 独角兽\n---\n\n别名页正文。\n')
    fs.writeFileSync(path.join(FIXTURE, 'nm', 'deep', 'l2', 'l3', 'l4', 'l5', 'NmDeep.ad'), 'deep line\n')
    // 同名行按 path 次行定址 press（行 = button + path text 兄弟——text
    // 节点 ownText 恰等 rel，其父域内唯一 button）。
    const pressPanelRowByPath = async (rel) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const region = panelRegion(t)
        if (region) {
          const pathNode = findFirst(region, (n) => !n.head.startsWith('button ') && ownText(n) === rel)
          if (pathNode) {
            const wrap = findParent(region, pathNode)
            const btn = wrap ? findFirst(wrap, (n) => n.head.startsWith('button ') && elementIdOf(n)) : null
            if (btn) {
              const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
              if (!/status: ok/.test(res)) throw new Error(`press row by path "${rel}" not ok: ${res}`)
              return
            }
          }
        }
        if (Date.now() > dl) {
          const dbg = await snapshotText()
          fs.writeFileSync(`e2e/.runtime/fail-snap-${Date.now()}.txt`, dbg)
          throw new Error(`panel row by path "${rel}" not found (snap dumped)`)
        }
        await sleep(300)
      }
    }
    // ① 标题域直证 + 同名双行逐路径（title-only 页 NmHome 正文无 首页
    // ——行出现即 page_names 名称域原生直证；wiki/index.ad fm title=首页
    // 同显——同名双行 path 次行可辨）。
    // **PLAN-038 T-03 迁移**：N 组全走快开根弹层面（输入=弹层 input 区域
    // 锚；行断言=弹层 texts；行定址=path 次行 text 父域内 button——同名
    // dtitle 不作定位键；拾取=QuickPick 成功即关）。
    const quickInputReady = async () => {
      for (let i = 0; i < 10; i++) {
        const ft = await snapshot()
        const fi = quickDialogInput(ft)
        if (fi) return fi
        await sleep(300)
      }
      throw new Error('quick dialog input not found（N 组）')
    }
    const pressQuickRowByPath = async (rel) => {
      const t = await snapshot()
      const region = quickDialogRegion(t)
      if (!region) throw new Error('quick dialog region not found（N 组）')
      const hits = []
      const walk = (n) => {
        if (n.head.startsWith('text ') && ownText(n) === rel) hits.push(n)
        for (const c of n.children) walk(c)
      }
      walk(region)
      if (!hits.length) throw new Error(`quick row path "${rel}" not found（N 组）`)
      const parent = findParent(region, hits[0]) ?? region
      const btn = findFirst(parent, (n) => n.head.startsWith('button ') && elementIdOf(n))
      if (!btn) throw new Error(`button for "${rel}" not found（N 组）`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press quick row(${rel}) not ok: ${res}`)
    }
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    await stateIs('names_state', 'ready')
    const findInputN1 = await quickInputReady()
    await callTool('autoui_action', { element_id: elementIdOf(findInputN1), action: 'type_text', value: '首页' })
    await stateHas('quick_q', '首页')
    const nTitleTexts = await quickDialogTexts(await snapshot())
    const nTitleOk = nTitleTexts.includes('nm/NmHome.ad') && nTitleTexts.includes('wiki/index.ad')
    if (!nTitleOk) throw new Error(`N① 标题域同名双行失守 texts=${JSON.stringify(nTitleTexts)}`)
    await pressQuickRowByPath('nm/NmHome.ad')
    await stateIs('active_title', 'nm/NmHome')
    await stateIs('quick_open', 'false')
    // ② 同名双页逐路径打开（重名页 A/B——path 定址各开各档）。
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    const findInputN2 = await quickInputReady()
    await callTool('autoui_action', { element_id: elementIdOf(findInputN2), action: 'type_text', value: '重名页' })
    await stateHas('quick_q', '重名页')
    const nDupTexts = await quickDialogTexts(await snapshot())
    const nDupOk = nDupTexts.includes('nm/NmDupA.ad') && nDupTexts.includes('nm/NmDupB.ad')
    if (!nDupOk) throw new Error(`N② 同名双页行失守 texts=${JSON.stringify(nDupTexts)}`)
    await pressQuickRowByPath('nm/NmDupB.ad')
    await stateIs('active_title', 'nm/NmDupB')
    // ③ alias + 相对路径 + 5 层深档（入口重开即取新目录——② 后弹层
    // 已关，本弧重开触发 NamesRefresh 读入 NmAlias/NmDeep）。
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    const findInputN3 = await quickInputReady()
    await callTool('autoui_action', { element_id: elementIdOf(findInputN3), action: 'type_text', value: '独角兽' })
    await stateHas('quick_q', '独角兽')
    const nAliasOk = (await quickDialogTexts(await snapshot())).includes('nm/NmAlias.ad')
    if (!nAliasOk) throw new Error('N③ alias「独角兽」未出 NmAlias 行')
    await pressQuickRowByPath('nm/NmAlias.ad')
    await stateIs('active_title', 'nm/NmAlias')
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    const findInputN4 = await quickInputReady()
    await callTool('autoui_action', { element_id: elementIdOf(findInputN4), action: 'type_text', value: 'nm/deep' })
    await stateHas('quick_q', 'nm/deep')
    const nDeepOk = (await quickDialogTexts(await snapshot())).includes('nm/deep/l2/l3/l4/l5/NmDeep.ad')
    if (!nDeepOk) throw new Error('N③ 相对路径「nm/deep」未出 5 层深档行')
    await pressQuickRowByPath('nm/deep/l2/l3/l4/l5/NmDeep.ad')
    await stateIs('active_title', 'nm/deep/l2/l3/l4/l5/NmDeep')
    await stateIs('quick_open', 'false')
    // ④ 模式门（行域隔离）：text 检索正文词「任务列表」→ Tasks 行；切
    // files 同残留查询 → files 行集不收正文词（无匹配文件 + Tasks 钮不
    // 泄漏）——find_rows/files_rows 双源结构隔离的原生断言。
    await pressButton('视图', { exact: true })
    await pressButton('全文检索', { exact: true })
    await stateIs('find_mode', 'text')
    // text 面板 input = 右栏区域锚（闭态快开弹层 input 恒渲染且声明位
    // 居前——全树首 input 锚失效，PLAN-038 T-03）。
    const findInputN5 = await panelInputOf()
    await callTool('autoui_action', { element_id: elementIdOf(findInputN5), action: 'type_text', value: '任务列表' })
    await stateHas('find_q', '任务列表')
    await pressButton('检索', { exact: true })
    await stateIs('find_ran', 'true')
    const nTextTexts = await panelTexts()
    // 已知答案 = check 11 同款（「任务列表」命中 Hello World——正文词）；
    // path 次行在（VM 视图 content 位置 str 收敛随行投影修复直证）。
    const nTextOk = nTextTexts.includes('wiki/Hello World.ad') && nTextTexts.includes('Hello World')
    if (!nTextOk) {
      const dbg = await snapshotText()
      fs.writeFileSync(`e2e/.runtime/fail-n4-${Date.now()}.txt`, dbg + '\n=====PANELTEXTS=====\n' + JSON.stringify(nTextTexts, null, 1) + '\n=====STATE=====\n' + (await callTool('autoui_state', {})))
      throw new Error(`N④ text「任务列表」未出 Hello World 行 texts=${JSON.stringify(nTextTexts)}`)
    }
    // 模式门迁移（PLAN-038）：快开弹层行集独立于 text 检索行——重开弹层
    // （quick_q 遗留 'nm/deep'）行集零 text 命中泄漏（结构隔离原生断言；
    // files 面已退役，空态面由 prod probe K2 与 vue e2e 承载）。
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    let nGateTexts = await quickDialogTexts(await snapshot())
    for (let i = 0; i < 15 && !nGateTexts.includes('nm/deep/l2/l3/l4/l5/NmDeep.ad'); i++) {
      await sleep(300)
      nGateTexts = await quickDialogTexts(await snapshot())
    }
    const nGateOk = nGateTexts.includes('nm/deep/l2/l3/l4/l5/NmDeep.ad') && !nGateTexts.includes('wiki/Hello World.ad')
    if (!nGateOk) {
      fs.writeFileSync(`e2e/.runtime/fail-n4gate-${Date.now()}.txt`, '=====DIALOGTEXTS=====\n' + JSON.stringify(nGateTexts, null, 1) + '\n=====STATE=====\n' + (await callTool('autoui_state', {})))
      throw new Error(`N④ 模式门失守——text 行泄漏快开面 texts=${JSON.stringify(nGateTexts)}`)
    }
    await pressQuickCancel()
    await stateIs('quick_open', 'false')
    // ⑤ 外部刷新：fs 改 NmAlias 增 title 另称页（外部变更）→ 重进快开
    // 入口 → 新 dtitle 可查、旧 alias 查询退出（NamesRefresh 入口即取新
    // 目录——AC-08 外部变更观察口原生直证）。
    fs.writeFileSync(path.join(FIXTURE, 'nm', 'NmAlias.ad'), '---\ntitle: 另称页\naliases:\n- 独角兽\n---\n\n别名页正文。\n')
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    const findInputN6 = await quickInputReady()
    await callTool('autoui_action', { element_id: elementIdOf(findInputN6), action: 'type_text', value: '另称页' })
    await stateHas('quick_q', '另称页')
    const nRefreshOk = (await quickDialogTexts(await snapshot())).includes('nm/NmAlias.ad')
    if (!nRefreshOk) throw new Error('N⑤ 外部 title 变更重进后未出 NmAlias 行（NamesRefresh 入口取新）')
    const nTitleBtn = await quickDialogTexts(await snapshot())
    if (!nTitleBtn.includes('另称页')) throw new Error(`N⑤ 行显示名未随新 title（rows=${JSON.stringify(nTitleBtn)}）`)
    await pressQuickCancel()
    await stateIs('quick_open', 'false')
    check('N', 'name', nTitleOk && nDupOk && nAliasOk && nDeepOk && nTextOk && nGateOk && nRefreshOk,
      `名称查找一致原生组（PLAN-033）：标题域同名双行（NmHome title-only+index fm title——path 次行可辨）+ 逐路径打开（NmHome/NmDupB 各开各档 active_title）+ alias/相对路径/5 层深档（入口重开 NamesRefresh 读新目录）+ 模式门（text 正文词行不泄漏 files 面）+ 外部刷新（fs 改 title→重进→新 dtitle 行）。错误/迟到门 = 网络可观测面由 e2e name-search.spec 承载（merged 无网络层不设虚假案）`)

    // 12 rename（PLAN-006 T-04）：重命名+反链改写全弧线（七子步——组内
    // 子步不占检查位，fail 即臂败，10c 同款）。素材 Projects.ad（ASCII
    // 双臂——D-19 面无；入链 index/CAP 定理 两页两处 = 预览/改写断言
    // 域）。弹层钮定位 = 「重命名」锚父行兄弟域（多弹层恒渲染同名取消
    // 钮纪律——10c pressInCreateDialog 同款）；rename input = 快照序最
    // 后 input（弹层在右面板之后渲染——check 11 find 面板开着亦然）。
    const pressInRenameDialog = async (buttonText) => {
      // 标题锚 content 子树扫（PLAN-014 纪律修订——重命名目录弹层
      // 「重命名」钮同名后全树首/末位锚双破[D-29③ 家族]，标题锚为唯一
      // 消歧面——meta/new/目录族同款；取消 = content 内同判）。
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const title = findFirst(t, (n) => ownText(n) === '重命名页面')
        if (title) {
          const header = findParent(t, title)
          const content = findParent(t, header)
          const btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText) : null
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(rename) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in rename-dialog not found`)
        await sleep(300)
      }
    }
    const typeIntoRenameInput = async (text) => {
      const tree = await snapshot()
      const inputs = []
      const collect = (n) => {
        if (n.head.startsWith('input ') && elementIdOf(n)) inputs.push(n)
        for (const c of n.children) collect(c)
      }
      collect(tree)
      const dlgInput = inputs[inputs.length - 1]
      if (!dlgInput) throw new Error('rename input not found in snapshot')
      const res = await callTool('autoui_action', { element_id: elementIdOf(dlgInput), action: 'type_text', value: text })
      if (!/status: ok/.test(res)) throw new Error(`rename type_text not ok: ${res}`)
    }
    const renameProjectsFile = path.join(FIXTURE, 'wiki', RENAME_LABEL)
    const renamedFile = path.join(FIXTURE, RENAME_NEW_REL)
    // ① 禁用态两形：untitled（文件→新建——path 空）+ 脏档——入口 press
    // 后 rename_open 恒 false（handler 守卫；menubar 项无 enabled——vm
    // boot 冻结缺口 T-02 实勘，action enabled_if 为权威面）。
    await pressButton('文件', { exact: true })
    await pressButton('新建', { exact: true })
    await stateIs('active_title', '未命名')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'false')
    await pressActiveTabClose('未命名')
    await typeWholeDoc(`${bodyOf(fs.readFileSync(targetFile, 'utf8'))}\n\n${RENAME_DIRTY_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'false')
    await pressButton('重载')
    // PLAN-030：手动重载对脏档先确认——此处弃改恢复干净态走确认+放弃
    //（原直读形为旧无守卫行为；新语义下同为用户口设计路径）。
    await stateIs('reload_confirm_open', 'true')
    await pressReloadDialogButton('放弃修改并重载')
    await stateIs('active_dirty', 'false')
    // ② 弹层内容锚（D-23③ 纪律）：开 Projects → 入口 → rename_open +
    // rename_q 预填 + 影响面预览行（「将改写 2 页 2 处链接」——index/CAP
    // 定理 两页各一出链）。树行 = 显示名（title=Projects → 'Projects'，
    // pressTree 区域锚）。
    await pressTree('Projects')
    await stateIs('active_title', RENAME_OLD_TITLE)
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await stateIs('rename_q', 'Projects')
    const dlgSnap = await snapshotText()
    const dlgOk = dlgSnap.includes('重命名页面') && dlgSnap.includes('将改写 2 页 2 处链接')
    // ③ 取消零落盘
    await pressInRenameDialog('取消')
    await stateIs('rename_open', 'false')
    const renameCancelOk = fs.existsSync(renameProjectsFile) && !fs.existsSync(renamedFile)
    if (!renameCancelOk) throw new Error('rename 取消零落盘失守（Projects.ad 应在、Project X.ad 不应在）')
    // ④ 改名弧线：Projects → Project X——active 投影 + 磁盘（旧消失新
    // 在 + index.ad/CAP 定理.ad 源文改写）。
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput(RENAME_NEW_NAME)
    await stateHas('rename_q', 'Project X')
    await pressInRenameDialog('重命名')
    try {
      await stateIs('active_title', RENAME_NEW_TITLE)
    } catch (e) {
      for (const f of ['lc_hold', 'lc_status', 'lc_verdict', 'rename_open', 'rename_q', 'active_path']) {
        console.log('[T12-DBG]', f, '=', await stateText(f))
      }
      console.log('[T12-DBG] console-tail =', (await stateText('console')).slice(-500))
      throw e
    }
    await stateIs('active_path', RENAME_NEW_REL)
    const renamedExists = fs.existsSync(renamedFile)
    const oldGone = !fs.existsSync(renameProjectsFile)
    const indexDisk = fs.readFileSync(path.join(FIXTURE, 'wiki', 'index.ad'), 'utf8')
    const capDisk = fs.readFileSync(path.join(FIXTURE, 'wiki', 'CAP 定理.ad'), 'utf8')
    const rewriteOk = indexDisk.includes('[[Project X]]') && capDisk.includes('[[Project X]]')
      && !indexDisk.includes('[[Projects]]')
    if (!(renamedExists && oldGone && rewriteOk)) throw new Error(`rename 磁盘断言失守（renamed=${renamedExists} oldGone=${oldGone} rewrite=${rewriteOk}）`)
    // ⑤ 跨页改写可见：开 index.ad（ASCII 双臂——树行显示名『首页』；
    // **双『首页』树行消歧**：root 首页.ad[10c 建档]与 wiki/index.ad 同
    // 文——pressTree 首中不可靠，改 tab 题钮 pressTab[wiki-index tab 先
    // 于 root 首页 tab 入 strip]）→ 反链面板（index 反链空
    // 态 + 出链行新 stem『Project X』『CAP Theorem』）→ **出链行点击导航
    // 到新档**（active_title = wiki/Project X——改写链接可走通）+ 树刷新
    //（Project X.ad 行在、Projects.ad 行消失）。（index 无反链——Project
    // X 零真实出链[语料转义面]故非任何页反链源；反链行新 stem 的正证面
    // = probe_rename 案①index/Tasks 改写逐字节。）
    await pressTab('首页')
    await stateIs('active_title', 'wiki/index')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    let renamePanelOk = false
    let renameTreeOk = false
    let panelDbg = ''
    for (const dl = Date.now() + 8000; ; ) {
      const pt = await snapshotText()
      panelDbg = pt
      // 面板断言域 = panelTexts()（区域文本集——树行显示名『Projects』
      // [stale title 语义面] 同文后全文 includes 误伤，区域锚消歧）。
      const ptx = await panelTexts()
      renamePanelOk = ptx.includes('（无反链）') && ptx.includes('Project X') && !ptx.includes('Projects')
      // 树行显示不变（PLAN-013 SD-1301 联动定文：改名 = stem 变、title
      // 不变 → 显示名恒 'Projects'——title 键不随 rename 迁移的语义并表
      // 断言面；旧档名行消失）。
      renameTreeOk = pt.includes('"Projects"') && !pt.includes('"Projects.ad"') && !pt.includes('"Project X.ad"')
      if (renamePanelOk && renameTreeOk) break
      if (Date.now() > dl) break
      await sleep(300)
    }
    if (!(renamePanelOk && renameTreeOk)) {
      fs.writeFileSync(`e2e/.runtime/fail-panel-${Date.now()}.txt`, panelDbg)
      throw new Error(`rename 面板/树断言失守（panel=${renamePanelOk} tree=${renameTreeOk}）`)
    }
    await pressPanelRow('Project X')
    await stateIs('active_title', RENAME_NEW_TITLE)
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    // ⑥ case-only 弧线（PLAN-017 SD-1701——006 G3 裁决翻转：拒→解锁）：
    // Project X → project x（**成功**——两步迁移 casing 翻转：弹层关 +
    // active 路径小写 + readdir 实名 project x.ad）→ **回翻** project x →
    // Project X（case-only 双向 + check 13 移动弧线素材复位）+ 无
    // --cftmp- 残留。
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput('project x')
    await pressInRenameDialog('重命名')
    await stateIs('rename_open', 'false')
    await stateIs('active_title', 'wiki/project x')
    const wikiDirCf = fs.readdirSync(path.join(FIXTURE, 'wiki')).filter((f) => f.endsWith('.ad'))
    const cfFlipOk = wikiDirCf.includes('project x.ad') && !wikiDirCf.includes('Project X.ad')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput('Project X')
    await pressInRenameDialog('重命名')
    await stateIs('rename_open', 'false')
    await stateIs('active_title', RENAME_NEW_TITLE)
    const wikiDirBack = fs.readdirSync(path.join(FIXTURE, 'wiki')).filter((f) => f.endsWith('.ad'))
    const cfBackOk = wikiDirBack.includes('Project X.ad') && !wikiDirBack.includes('project x.ad')
    const cfNoTmpOk = wikiDirBack.every((f) => !f.includes('--cftmp-'))
    const rejOk = cfFlipOk && cfBackOk && cfNoTmpOk
    if (!rejOk) throw new Error(`case-only 弧线断言失守（flip=${cfFlipOk} back=${cfBackOk} noCftmp=${cfNoTmpOk} wiki=${JSON.stringify(wikiDirBack)}`)
    // ⑦ 状态复原：回 Hello World tab（quit 检查前置——typeWholeDoc 目
    // 标档）。CJK 改名导航子步不设——probe_rename 八案已直证 CJK 面，
    // 本组素材 ASCII 双臂（D-19 口径注记同 10c）。
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    check('12', 'rename', dlgOk && renameCancelOk && renamedExists && oldGone && rewriteOk && renamePanelOk && renameTreeOk && rejOk,
      `rename 组七子步（禁用态 untitled+脏档/弹层锚 预填+预览 2页2处/取消零落盘/改名弧线 active+磁盘+双页改写/面板+树新 stem/case-only 弧线[PLAN-017 翻转+回翻——casing 翻转/active 路径/无 cftmp 残留]/状态复原）`)

    // 13 file（PLAN-007 T-04）：树文件管理全弧线八子步（组内子步不占
    // 检查位，fail 即臂败，10c/12 同款）。执行序在 quit 前（quit 恒为
    // 臂内最后一项；本组删除素材 CAP 定理不涉 quit 面——收尾复原回
    // Hello World tab）。弹层钮定位纪律（check 11 遗留 find 面板开着
    // ——input 序[find?,新建,重命名]非首即新建，结构锚定位）：
    //   EXPLORER「＋」= text "EXPLORER" 父行内 icon 钮（ownText 空
    //   ——结构锚，pressActiveTabClose 同族）；
    // ⑴ 新建 ASCII（index——根落位，wiki/index.ad 同名异位不冲突）
    const fileNewPageFile = path.join(FIXTURE, FILE_NEW_REL)
    const fileCjkPageFile = path.join(FIXTURE, FILE_CJK_REL)
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await stateIs('new_q', '')
    await typeIntoNewInput(FILE_NEW_NAME)
    await stateIs('new_q', FILE_NEW_NAME)
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('active_title', FILE_NEW_NAME)
    await stateIs('ft_sel', FILE_NEW_REL)
    let newDiskOk = false
    for (const dl = Date.now() + 8000; ; ) {
      newDiskOk = fs.existsSync(fileNewPageFile) && fs.readFileSync(fileNewPageFile, 'utf8') === `# ${FILE_NEW_NAME}\n\n`
      if (newDiskOk || Date.now() > dl) break
      await sleep(200)
    }
    // 树新行 = 显示名 stem（新建档无 title——『index』；同文 wiki/index.ad
    // 树行为『首页』不误中）。
    let newTreeOk = (await snapshotText()).includes('"index"')
    // ⑵ 同名幂等：打开既有（tab 数不变 + 磁盘字节不变；基线采样 =
    // ⑴ 落定后——⑴ 自身新增 index tab 计入基线）
    const tabCountPre = await stateText('tab_count')
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput(FILE_NEW_NAME)
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('active_title', FILE_NEW_NAME)
    const tabCountPost = await stateText('tab_count')
    const idemDiskOk = fs.existsSync(fileNewPageFile) && fs.readFileSync(fileNewPageFile, 'utf8') === `# ${FILE_NEW_NAME}\n\n`
    // ⑶ 取消零落盘
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput(FILE_GHOST_NAME)
    await pressInNewDialog('取消')
    await stateIs('new_open', 'false')
    const ghostOk = !fs.existsSync(path.join(FIXTURE, `${FILE_GHOST_NAME}.ad`))
    // ⑷ CJK 新建（PLAN-028 双臂化——导航断言两臂同单：exists/read_wiki
    // POST 化收口，Open 入 tab 两臂可达）
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput(FILE_CJK_NAME)
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    let cjkNavOk = false
    for (const dl = Date.now() + 8000; ; ) {
      if (fs.existsSync(fileCjkPageFile)) {
        let bodyOk = false
        try { bodyOk = fs.readFileSync(fileCjkPageFile, 'utf8') === `# ${FILE_CJK_NAME}\n\n` } catch {}
        cjkNavOk = bodyOk
      }
      if (cjkNavOk || Date.now() > dl) break
      await sleep(300)
    }
    await stateIs('active_title', FILE_CJK_NAME)
    // ⑸ 删除预览 + 取消：树行点击 = 打开+选中（PLAN-028 双臂化——树行
    // 开 CJK 档两臂可达，激活既有 CAP tab[check 10 开过]——预览「1 个
    // 标签页将关闭」两臂同单）。ft_sel 两臂同置（OpenFile 前置）。
    await pressTree('CAP 定理')
    await stateIs('ft_sel', FILE_DEL_REL)
    await stateIs('active_title', 'wiki/CAP 定理')
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    const delTabsLine = '1 个标签页将关闭，未保存修改将丢弃'
    let delDlgOk = false
    let delDlgSnap = ''
    for (const dl = Date.now() + 8000; ; ) {
      delDlgSnap = await snapshotText()
      delDlgOk = delDlgSnap.includes('删除页面') && delDlgSnap.includes(`将移入回收站 ${FILE_DEL_REL}`)
        && delDlgSnap.includes('3 处入链将变为悬空') && delDlgSnap.includes(delTabsLine)
      if (delDlgOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!delDlgOk) fs.writeFileSync(`e2e/.runtime/fail-deldlg-${Date.now()}.txt`, delDlgSnap)
    await pressInDeleteDialog('取消')
    await stateIs('delete_open', 'false')
    const delCancelOk = fs.existsSync(path.join(FIXTURE, FILE_DEL_REL))
    // ⑥ 删除弧线：确认 → 磁盘消失 + tab 关闭面 + ft_sel 清空 + 树行
    // 消失。激活落点两臂同单（PLAN-028 双臂化——CAP tab 两臂已开
    // [tab 序同构]，删 CAP 同位保持→首页；RemoveAt 同位保持形态两臂
    // 同证[原 split 零关闭分支随 D-19 分野消缺]）。
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    await stateIs('ft_sel', '')
    await stateIs('active_title', '首页')
    const capGone = !fs.existsSync(path.join(FIXTURE, FILE_DEL_REL))
    const tabCountFinal = parseInt((await stateText('tab_count')).match(/tab_count:\s*(\d+)/)?.[1] ?? '-1', 10)
    // ⑦ 悬空翻转：tab 题钮开 index（树行 index.ad 双行同名歧义——根
    // index.ad ⑴ 新建后与 wiki/index.ad label 同名，tab 题钮唯一）→
    // 反链面板出链行 CAP 定理（悬空）（PLAN-003 已知答案反向）+ 树
    // 零残留；面板复原关闭
    await pressTab('首页')
    await stateIs('active_title', 'wiki/index')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    let flipOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      flipOk = t.includes('CAP 定理（悬空）') && !t.includes(`"${FILE_DEL_REL}"`)
      if (flipOk || Date.now() > dl) break
      await sleep(300)
    }
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    // ⑧ 未选中 no-op（⑥ 后 ft_sel=""）+ 状态复原回 Hello World（quit
    // 前置——typeWholeDoc 目标档）
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    const noopState = await callTool('autoui_state', { fields: ['delete_open'] })
    const noopOk = /delete_open:\s*false/.test(noopState)
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // ⑱ trash 改道面 + 恢复弧线（PLAN-016 T-04；file 组子步——组数不变
    // ，fail 即臂败）：⑥ 删除弧线的 CAP 定理此刻在 .trash（改道——工作
    // 区面 ⑦ 已证悬空化等价）。回收站模式入口（文件→回收站——action
    // file.trash/menubar 共口）→ 清单见条目 → 行恢复钮 → 空态 + 树行回
    // + exists 翻转回（悬空自愈——⑦ 反向闭环，links_json 双向态断言）+
    // tab 可重开；收尾关 find 面板 + 复原 Hello World（⑨ 前置同口径）。
    await pressButton('文件', { exact: true })
    await pressButton('回收站', { exact: true })
    await stateIs('find_open', 'true')
    await stateIs('find_mode', 'trash')
    let trashCapRowOk = false
    for (const dl = Date.now() + 8000; ; ) {
      trashCapRowOk = (await snapshotText()).includes('.trash/wiki/CAP 定理.ad')
      if (trashCapRowOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashCapRowOk) throw new Error('trash 清单失守（.trash/wiki/CAP 定理.ad 未现）')
    const trashCapDiskOk = fs.existsSync(path.join(FIXTURE, '.trash', 'wiki', 'CAP 定理.ad'))
    await pressButton('恢复', { exact: true })
    let trashRestoreEmptyOk = false
    for (const dl = Date.now() + 8000; ; ) {
      trashRestoreEmptyOk = (await snapshotText()).includes('（回收站为空）')
      if (trashRestoreEmptyOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!trashRestoreEmptyOk) throw new Error('恢复后空态失守（（回收站为空）未现）')
    const capBackDiskOk = fs.existsSync(path.join(FIXTURE, FILE_DEL_REL))
      && !fs.existsSync(path.join(FIXTURE, '.trash', 'wiki', 'CAP 定理.ad'))
    // exists 翻转回（双向态：exists:true 现 + exists:false 消——links_json
    // state 面，⑦ 悬空行的反向闭环）
    await stateHas('links_json', '{\\"target\\":\\"CAP 定理\\",\\"anchor\\":\\"\\",\\"exists\\":true')
    const dump18 = await callTool('autoui_state', {})
    const capFalseGoneOk = !dump18.includes('{\\"target\\":\\"CAP 定理\\",\\"anchor\\":\\"\\",\\"exists\\":false')
    // 树行回（双臂——显示名行走 back walk 面）+ tab 可重开（PLAN-028
    // 双臂化——pressTree CJK 开档 POST 化收口，两臂同单）
    const t18 = await snapshot()
    const exr18 = explorerRegion(t18)
    const capTreeBackOk = !!exr18 && !!findFirst(exr18, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === 'CAP 定理')
    await pressTree('CAP 定理')
    await stateIs('active_title', 'wiki/CAP 定理')
    // 收尾：关 find 面板 + 复原 Hello World（⑨ backlinks 面板语义前置）
    await pressButton('收起', { exact: true })
    await stateIs('find_open', 'false')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // ⑨ F-R9-4 案（PLAN-010 G3 收口断言；canonical §6 SD-1002 记载位
    // = file 组）：删除激活档 → 提及段随新激活刷新。弹层造源档（存盘
    // 带「Fr94Del」明文提及）+ 靶档（自动开档激活）→ 开面板提及行现 →
    // UI 删除激活靶档 → 提及行消（DeleteGo 接 MentionsRefreshOf——未
    // 接则陈旧行残留，判别面）。收尾源档亦 UI 删 + 复原 Hello World
    //（quit 前置——typeWholeDoc 目标档）。
    let fr94Up = false
    let fr94Down = false
    const fr94SrcFile = path.join(FIXTURE, 'Fr94Src.ad')
    const fr94DelFile = path.join(FIXTURE, 'Fr94Del.ad')
    fs.rmSync(fr94SrcFile, { force: true })
    fs.rmSync(fr94DelFile, { force: true })
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput('Fr94Src')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await typeWholeDoc('# Fr94Src\n\nFr94Del plain mention here.\n')
    await pressButton('保存')
    await stateIs('active_dirty', 'false')
    await pressExplorerPlus()
    await stateIs('new_open', 'true')
    await typeIntoNewInput('Fr94Del')
    await pressInNewDialog('创建')
    await stateIs('new_open', 'false')
    await stateIs('active_title', 'Fr94Del')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'true')
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iMn = t.indexOf('未链接提及')
      // 有界切片（段内 ~400 字符）：快照 DFS 序 filetree 居面板后，无界
      // slice 会误中树行 Fr94Src（本案例外——树行在册；10m 素材走
      // fs 造档不进树故无界可用）。行文本 = stem（PLAN-014 名化——
      // Fr94Src 无 title → back dtitle 缺省 stem）。
      fr94Up = iMn >= 0 && t.slice(iMn, iMn + 400).includes('Fr94Src')
      if (fr94Up || Date.now() > dl) break
      await sleep(300)
    }
    if (!fr94Up) {
      throw new Error(`fr94Up 失守: diskSrc=${fs.existsSync(fr94SrcFile) ? JSON.stringify(fs.readFileSync(fr94SrcFile, 'utf8')) : '<gone>'} diskDel=${fs.existsSync(fr94DelFile) ? JSON.stringify(fs.readFileSync(fr94DelFile, 'utf8')) : '<gone>'}`)
    }
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      const iMn = t.indexOf('未链接提及')
      // 判别面 = 空态标记（（无未链接提及）与行互斥渲染）——新激活
      // Fr94Src 提及集为空 → 空态现（未接刷新则 Fr94Src.ad 行残留）。
      fr94Down = iMn >= 0 && t.slice(iMn, iMn + 400).includes('（无未链接提及）')
      if (fr94Down || Date.now() > dl) break
      await sleep(300)
    }
    if (!fr94Down) {
      const t2 = await snapshotText()
      const iMn2 = t2.indexOf('未链接提及')
      const at2 = await stateText('active_title')
      throw new Error(`fr94Down 失守: active=${JSON.stringify(at2)} tail=${JSON.stringify(iMn2 >= 0 ? t2.slice(iMn2, iMn2 + 300) : '<no-mention-marker>')}`)
    }
    // 收尾删源档：DeleteGo 清空 ft_sel（⑥ 弧线在册语义）——菜单删除
    // 守卫 no-op 面（⑧ 同款），先点树行置 ft_sel 再删（⑥ 同款前置）。
    await pressTree('Fr94Src')
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await stateIs('delete_open', 'true')
    await pressInDeleteDialog('删除')
    await stateIs('delete_open', 'false')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // ⑩ 新建目录（PLAN-012）：⊕ → 弹层 → 创建 → 磁盘在 + 树新行
    await pressExplorerFolderPlus()
    await stateIs('dir_open', 'true')
    await stateIs('dir_q', '')
    await typeIntoDialogInput('新建目录', DIR_BOX)
    await stateIs('dir_q', DIR_BOX)
    await pressInDialogByTitle('新建目录', '创建')
    await stateIs('dir_open', 'false')
    const dirBoxOk = fs.existsSync(path.join(FIXTURE, DIR_BOX)) && fs.statSync(path.join(FIXTURE, DIR_BOX)).isDirectory()
    let dirTreeOk = false
    for (const dl = Date.now() + 8000; ; ) {
      dirTreeOk = (await snapshotText()).includes(`"${DIR_BOX}"`)
      if (dirTreeOk || Date.now() > dl) break
      await sleep(300)
    }
    // ⑪ 移动弧线：Project X（check 12 改名产物——index/CAP 定理入链面）
    // → DirBox。开反链面板 + 树行选中 Project X（激活切该档——面板行
    // 语义挂 active）→ 面板快照 + links_json 双采（移动前）→ 菜单移动
    // → 预填 wiki（本地派生断言）→ DirBox → 移动 → tab 全量/字节整迁/
    // 面板逐字节零变化/links_json 定向 diff 归一相等（**移动零扰动固化
    // ——三联语义断言**：入链行 [[Project X]] 由 stem 解析自动指向新位，
    // 面板行文本与链接网结构零变化，仅 path 字段迁移）。
    // ⚠ 面板态自适应：⑨ F-R9-4 收尾面板开着——先读态，关才开（避免
    // toggle 误关）；⑬ 收尾统一关。
    if (!/backlinks_open:\s*true/.test(await stateText('backlinks_open'))) {
      await pressButton('视图', { exact: true })
      await pressButton('切换反链', { exact: true })
    }
    await stateIs('backlinks_open', 'true')
    await pressTree('Projects')
    await stateIs('ft_sel', RENAME_NEW_REL)
    await waitButtonIn(panelRegion, '首页')
    const panelBefore = panelSliceOf(await snapshotText())
    const ljBefore = (await callTool('autoui_state', {})).match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    const pxBytes = fs.readFileSync(path.join(FIXTURE, RENAME_NEW_REL), 'utf8')
    await pressButton('文件', { exact: true })
    await pressButton('移动到目录…', { exact: true })
    await stateIs('move_open', 'true')
    await stateIs('move_q', 'wiki')
    await typeIntoDialogInput('移动到目录', DIR_BOX)
    await stateIs('move_q', DIR_BOX)
    await pressInDialogByTitle('移动到目录', '移动')
    await stateIs('move_open', 'false')
    await stateIs('ft_sel', `${DIR_BOX}/Project X.ad`)
    const movedPxFile = path.join(FIXTURE, DIR_BOX, 'Project X.ad')
    const moveDiskOk = fs.existsSync(movedPxFile) && !fs.existsSync(path.join(FIXTURE, RENAME_NEW_REL))
      && fs.readFileSync(movedPxFile, 'utf8') === pxBytes
    const mvDump = await callTool('autoui_state', {})
    const moveTabOk = mvDump.includes(`active_path: "${DIR_BOX}/Project X.ad"`) && mvDump.includes(`active_title: "${DIR_BOX}/Project X"`)
    const panelAfter = panelSliceOf(await snapshotText())
    const panelZeroOk = panelBefore !== '' && panelBefore === panelAfter
    const ljAfter = mvDump.match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    // 定向 diff 归一（集合语义——移动后 walk 序Dirs-first casefold 位次
    // 迁移[DirBox < wiki]属预期面，归一 = 逐页逐链 path 字段替换 + 序
    // 无关排序比对；其余字段逐字节相等 = 链接网零扰动）。
    const ljUnesc = (s) => { try { return JSON.parse(`"${s}"`) } catch { return s } }
    const ljNorm = (raw) => {
      try {
        const pages = JSON.parse(ljUnesc(raw))
        const normPath = (p) => (p === `wiki/Project X.ad` || p === `${DIR_BOX}/Project X.ad` ? '<MOVED>' : p)
        return JSON.stringify(pages.map((p) => ({
          path: normPath(p.path), title: p.title,
          links: p.links.map((l) => ({ ...l, target_path: normPath(l.target_path) })),
        })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
      } catch {
        return '<unparsable>'
      }
    }
    const linkNetOk = ljBefore !== '' && ljNorm(ljBefore) === ljNorm(ljAfter)
    // ⑫ 取消零落盘：ft_sel 仍在 DirBox/Project X.ad → 菜单移动 → 输
    // NoDir → 取消 → 零落盘。
    await pressButton('文件', { exact: true })
    await pressButton('移动到目录…', { exact: true })
    await stateIs('move_open', 'true')
    await typeIntoDialogInput('移动到目录', 'NoDir')
    await pressInDialogByTitle('移动到目录', '取消')
    await stateIs('move_open', 'false')
    const moveCancelOk = !fs.existsSync(path.join(FIXTURE, 'NoDir'))
    // ⑬ 冲突拒：选中根 index.ad（同名 label 消歧——若 wiki 展开态首个
    // 命中为 wiki/index.ad，折叠重试；目标 wiki 处语料 index.ad 在 →
    // 冲突拒 + 弹层留置 + 磁盘零变化）→ 取消 → 收尾关面板 + 复原
    // Hello World 激活（quit 前置——typeWholeDoc 目标档）。
    let idxSel = ''
    for (let tries = 0; tries < 2; tries++) {
      await pressTree('index')
      idxSel = (await stateText('ft_sel')).match(/ft_sel:\s*"([^"]*)"/)?.[1] ?? ''
      if (idxSel === 'index.ad') break
      await pressButton('wiki', { exact: true })
      await sleep(400)
    }
    await stateIs('ft_sel', 'index.ad')
    await pressButton('文件', { exact: true })
    await pressButton('移动到目录…', { exact: true })
    await stateIs('move_open', 'true')
    await stateIs('move_q', '')
    await typeIntoDialogInput('移动到目录', 'wiki')
    await pressInDialogByTitle('移动到目录', '移动')
    let conflictHoldOk = false
    for (const dl = Date.now() + 8000; ; ) {
      conflictHoldOk = /move_open:\s*true/.test(await stateText('move_open'))
      if (conflictHoldOk || Date.now() > dl) break
      await sleep(300)
    }
    const conflictDiskOk = fs.existsSync(path.join(FIXTURE, 'index.ad'))
      && fs.readFileSync(path.join(FIXTURE, 'wiki', 'index.ad'), 'utf8').includes('快速开始')
    await pressInDialogByTitle('移动到目录', '取消')
    await stateIs('move_open', 'false')
    await pressButton('视图', { exact: true })
    await pressButton('切换反链', { exact: true })
    await stateIs('backlinks_open', 'false')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // ⑭-⑯ 目录面二期（PLAN-014 T-04；file 组目录二期三子步——组数不变
    // ，fail 即臂败）。素材 = ⑪ 产物 DirBox（Project X.ad 在——12 改名
    // stem 面 + index 入链一处 + tab 在[12② 开]）：
    //   ⑭ 重命名目录弧线（DirBox→DirBox2——弹层双 input/预览「将移动
    //     1 个 .ad 页（链接零改写）」/tab 全量路径变标题恒[显示不变语义
    //     面]/磁盘整迁/面板快照零变化 + links_json 归一 diff——三联对照
    //     目录级固化）
    //   ⑮ 取消零落盘两形（重命名/删除弹层）
    //   ⑯ 删除目录弧线（强确认预览计数+悬空警示 → tab 全关 + 树行消 +
    //     悬空翻转[首页出链行 Project X（悬空）——SD-701 目录级]）
    // CJK 案 probe_dir_ops 双臂直证覆盖（D-19 口径同 012 目录面注记）；
    // 键程 = menubar 共口先例（Ctrl+Shift+M 同款——两入口经菜单项触达，
    // action Shift+Delete/Ctrl+Shift+R 同 handler 落地）。
    if (!/backlinks_open:\s*true/.test(await stateText('backlinks_open'))) {
      await pressButton('视图', { exact: true })
      await pressButton('切换反链', { exact: true })
    }
    await stateIs('backlinks_open', 'true')
    // DirBox 展开态自适应（⑪ 移动后 TreeRefresh 重建树——DirBox 新节
    // 点不在 ft_expanded，子行 Project X 折叠不可见；展开态自适应展开）。
    {
      const t0 = await snapshot()
      const exr0 = explorerRegion(t0)
      const has0 = exr0 ? !!findFirst(exr0, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === 'Projects') : false
      if (!has0) {
        await pressButton(DIR_BOX, { exact: true })
        await sleep(400)
      }
    }
    // 树行 press（显示名『Projects』——stale title 语义面 12⑤ 同款）：
    // 置 ft_sel = DirBox/Project X.ad（⑬ 冲突拒后 ft_sel=index.ad——
    // remap 断言前置）+ 激活该档（OpenFile 口）。
    await pressTree('Projects')
    await stateIs('ft_sel', `${DIR_BOX}/Project X.ad`)
    await stateIs('active_title', `${DIR_BOX}/Project X`)
    await waitButtonIn(panelRegion, '首页')
    const panel2Before = panelSliceOf(await snapshotText())
    const lj2Before = (await callTool('autoui_state', {})).match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    const pxB2 = fs.readFileSync(path.join(FIXTURE, DIR_BOX, 'Project X.ad'), 'utf8')
    await pressButton('文件', { exact: true })
    await pressButton('重命名目录…', { exact: true })
    await stateIs('rendir_open', 'true')
    await stateIs('rendir_target', '')
    await stateIs('rendir_q', '')
    await typeIntoDialogInput('重命名目录', DIR_BOX)
    await stateIs('rendir_target', DIR_BOX)
    let rendirPrevOk = false
    for (const dl = Date.now() + 8000; ; ) {
      rendirPrevOk = (await snapshotText()).includes('将移动 1 个 .ad 页（链接零改写）')
      if (rendirPrevOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!rendirPrevOk) throw new Error('rendir 预览失守（将移动 1 个 .ad 页（链接零改写） 未现）')
    await typeIntoDialogInputIdx('重命名目录', 1, DIR_REN2)
    await stateIs('rendir_q', DIR_REN2)
    await pressInDialogByTitle('重命名目录', '重命名')
    await stateIs('rendir_open', 'false')
    await stateIs('ft_sel', `${DIR_REN2}/Project X.ad`)
    await stateIs('active_path', `${DIR_REN2}/Project X.ad`)
    await stateIs('active_title', `${DIR_REN2}/Project X`)
    const movedPx2 = path.join(FIXTURE, DIR_REN2, 'Project X.ad')
    const renDirDiskOk = fs.existsSync(movedPx2) && !fs.existsSync(path.join(FIXTURE, DIR_BOX, 'Project X.ad'))
      && !fs.existsSync(path.join(FIXTURE, DIR_BOX))
      && fs.readFileSync(movedPx2, 'utf8') === pxB2
    // tab 标题不变（显示名『Projects』恒——stale title 语义面路径变显
    // 示零变化）+ 面板快照零变化。
    await waitButtonIn(tabStripRegion, 'Projects')
    let panel2After = ''
    let panelZero2Ok = false
    for (const dl = Date.now() + 8000; ; ) {
      panel2After = panelSliceOf(await snapshotText())
      panelZero2Ok = panel2Before !== '' && panel2Before === panel2After
      if (panelZero2Ok || Date.now() > dl) break
      await sleep(300)
    }
    const lj2After = (await callTool('autoui_state', {})).match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    const lj2Unesc = (s) => { try { return JSON.parse(`"${s}"`) } catch { return s } }
    const lj2Norm = (raw) => {
      try {
        const pages = JSON.parse(lj2Unesc(raw))
        const normPath = (p) => (p === `${DIR_BOX}/Project X.ad` || p === `${DIR_REN2}/Project X.ad` ? '<MOVED>' : p)
        return JSON.stringify(pages.map((p) => ({
          path: normPath(p.path), title: p.title,
          links: p.links.map((l) => ({ ...l, target_path: normPath(l.target_path) })),
        })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
      } catch {
        return '<unparsable>'
      }
    }
    const linkNet2Ok = lj2Before !== '' && lj2Norm(lj2Before) === lj2Norm(lj2After)
    // ⑮ 取消零落盘两形
    await pressButton('文件', { exact: true })
    await pressButton('重命名目录…', { exact: true })
    await stateIs('rendir_open', 'true')
    await typeIntoDialogInput('重命名目录', DIR_REN2)
    await typeIntoDialogInputIdx('重命名目录', 1, 'NoDir2')
    await pressInDialogByTitle('重命名目录', '取消')
    await stateIs('rendir_open', 'false')
    const renDirCancelOk = !fs.existsSync(path.join(FIXTURE, 'NoDir2')) && fs.existsSync(movedPx2)
    await pressButton('文件', { exact: true })
    await pressButton('删除目录…', { exact: true })
    await stateIs('deldir_open', 'true')
    await stateIs('deldir_q', '')
    await typeIntoDialogInput('删除目录', DIR_REN2)
    await stateIs('deldir_q', DIR_REN2)
    let delDirPrevOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const dt = await snapshotText()
      // ⚠ PLAN-016 起入链计数 = 2（index + CAP 定理——⑱ 恢复 CAP 后其
      // 12 步改写的 [[Project X]] 出链回到链接面；恢复弧前置的连带已知
      // 答案，014 双防线语义不变）。
      delDirPrevOk = dt.includes(`将删除目录 ${DIR_REN2} 及 1 个文件（1 个 .ad 页）`)
        && dt.includes('2 处入链将变为悬空')
      if (delDirPrevOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!delDirPrevOk) throw new Error('deldir 预览失守（计数行/悬空警示行 未现）')
    await pressInDialogByTitle('删除目录', '取消')
    await stateIs('deldir_open', 'false')
    const delDirCancelOk = fs.existsSync(movedPx2) && fs.existsSync(path.join(FIXTURE, DIR_REN2))
    // ⑯ 删除目录弧线：tab 全关（Project X tab 消——计数 -1）+ 磁盘消 +
    // 树行消 + 悬空翻转（首页出链行 Project X（悬空）+ links_json
    // exists:false——SD-701 目录级）。
    const tc16a = parseInt((await stateText('tab_count')).match(/tab_count:\s*(\d+)/)?.[1] ?? '-1', 10)
    await pressButton('文件', { exact: true })
    await pressButton('删除目录…', { exact: true })
    await stateIs('deldir_open', 'true')
    await typeIntoDialogInput('删除目录', DIR_REN2)
    await pressInDialogByTitle('删除目录', '删除')
    await stateIs('deldir_open', 'false')
    const tc16b = parseInt((await stateText('tab_count')).match(/tab_count:\s*(\d+)/)?.[1] ?? '-1', 10)
    const delDirOk = !fs.existsSync(path.join(FIXTURE, DIR_REN2)) && tc16a > 0 && tc16b === tc16a - 1
    let dir2TreeGoneOk = false
    for (const dl = Date.now() + 8000; ; ) {
      // 树行消失 = **explorer 区锚**（全文 includes 会误中闭态删除弹层
      // input 绑定值投影——deldir_q='DirBox2' 恒渲染[D-23③/D-29④ 族]）。
      const t16 = await snapshot()
      const exr16 = explorerRegion(t16)
      dir2TreeGoneOk = !!exr16 && !findFirst(exr16, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === DIR_REN2)
      if (dir2TreeGoneOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!dir2TreeGoneOk) throw new Error('deldir 树行消失失守（DirBox2 仍在树区）')
    // 悬空翻转：开 首页（wiki index tab——root 首页 tab 同文名居后不误
    // 中[strip 序 wiki-index 先]）→ 反链面板出链行 Project X（悬空）。
    await pressTab('首页')
    await stateIs('active_title', 'wiki/index')
    let flip2Ok = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshotText()
      flip2Ok = t.includes('Project X（悬空）')
      if (flip2Ok || Date.now() > dl) break
      await sleep(300)
    }
    await stateHas('links_json', '{\\"target\\":\\"Project X\\",\\"anchor\\":\\"\\",\\"exists\\":false')
    // ⑰ 今日笔记弧线（PLAN-015 T-04 vm 面；SD-1501——直调 daily_note →
    // 开档 → 树新行 → 重入幂等。日期面 back 单点——stem/body 动态值 =
    // 当日格式断言；stem 全 ASCII 无 D-19 面。入口 pressButton('今日笔记')
    // ：菜单闭态 menubar 项不在树——命中工具栏 calendar 钮[endsWith 形]
    // ；menubar 文件项与工具栏钮同 handler .ActDaily 共口，菜单面存在性
    // = 基线 v14 节点承载）。
    const dailyStem = (() => {
      const d = new Date()
      const p2 = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}_${p2(d.getMonth() + 1)}_${p2(d.getDate())}`
    })()
    const dailyDay = dailyStem.split('_').join('-')
    // PLAN-018 素材 fs 外造（⑰ ActDaily 的 TreeRefresh 承载树新鲜度——
    // 新行随刷入树）：DirMvA/MovePg.ad[含 [[Hello World]] 链——面板快照
    // 断言语义面] + DirMvB 目标父 + L1/../L4 5 层深档[depth 8 收口直证
    // 素材——depth 4 下不可见]。
    fs.mkdirSync(path.join(FIXTURE, 'DirMvA'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'DirMvA', 'MovePg.ad'), '# MovePg\n\n见 [[Hello World]] 一处。\n', 'utf8')
    fs.mkdirSync(path.join(FIXTURE, 'DirMvB'), { recursive: true })
    fs.mkdirSync(path.join(FIXTURE, 'L1', 'L2', 'L3', 'L4'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'L1', 'L2', 'L3', 'L4', 'DeepPg.ad'), '# DeepPg\n\n深位档。\n', 'utf8')
    // PLAN-019 素材 fs 外造（merge 弧线——同名目录对×2：MgA[源，MgPg.ad
    // 含 [[Hello World]] 链]×MgB/MgA[靶，MgOther.ad]；MgC[源，MgCPg.ad]×
    // MgB/MgC[靶，MgTPg.ad]——拒径回归靶）。
    fs.mkdirSync(path.join(FIXTURE, 'MgA'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'MgA', 'MgPg.ad'), '# MgPg\n\n见 [[Hello World]] 一处。\n', 'utf8')
    fs.mkdirSync(path.join(FIXTURE, 'MgB', 'MgA'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'MgB', 'MgA', 'MgOther.ad'), '# MgOther\n\n', 'utf8')
    // PLAN-025 tab 重映射弧素材（skip 同名对——MgR 源 × MgT/MgR 靶 twin；
    // 与 019 素材同位 fs 外造——树新鲜度由其后移动弧线成功 TreeRefresh
    // 承载，弹层冲突检测 = dirs_of(ft_nodes) 本地派生同口径）。
    fs.mkdirSync(path.join(FIXTURE, 'MgR'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'MgR', 'MgRPg.ad'), '# MgRPg\n\n源冲突档标记：tab 跟随改道位。\n', 'utf8')
    fs.mkdirSync(path.join(FIXTURE, 'MgT', 'MgR'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'MgT', 'MgR', 'MgRPg.ad'), '# MgRPg\n\n靶 twin 档内容。\n', 'utf8')
    fs.mkdirSync(path.join(FIXTURE, 'MgC'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'MgC', 'MgCPg.ad'), '# MgCPg\n\n', 'utf8')
    fs.mkdirSync(path.join(FIXTURE, 'MgB', 'MgC'), { recursive: true })
    fs.writeFileSync(path.join(FIXTURE, 'MgB', 'MgC', 'MgTPg.ad'), '# MgTPg\n\n', 'utf8')
    await pressButton('今日笔记')
    await stateIs('active_title', dailyStem)
    await stateHas('active_body', `# ${dailyDay}`)
    const dailyFile = path.join(FIXTURE, `${dailyStem}.ad`)
    let dailyDiskOk = false
    for (const dl = Date.now() + 8000; ; ) {
      try {
        const dtxt = fs.readFileSync(dailyFile, 'utf8')
        dailyDiskOk = dtxt.includes(`created_at: ${dailyDay}T`) && dtxt.includes(`updated_at: ${dailyDay}T`)
      } catch {}
      if (dailyDiskOk || Date.now() > dl) break
      await sleep(300)
    }
    let dailyTreeOk = false
    for (const dl = Date.now() + 8000; ; ) {
      const t = await snapshot()
      const exr = explorerRegion(t)
      dailyTreeOk = !!exr && !!findFirst(exr, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === dailyStem)
      if (dailyTreeOk || Date.now() > dl) break
      await sleep(300)
    }
    // 重入幂等：再调 → 同档激活（已开即激活语义——tab 数不变）
    const tcDailyA = parseInt((await stateText('tab_count')).match(/tab_count:\s*(\d+)/)?.[1] ?? '-1', 10)
    await pressButton('今日笔记')
    await stateIs('active_title', dailyStem)
    const tcDailyB = parseInt((await stateText('tab_count')).match(/tab_count:\s*(\d+)/)?.[1] ?? '-1', 10)
    const dailyIdemOk = tcDailyA > 0 && tcDailyB === tcDailyA
    // 收尾：关今日笔记 tab（洁净直接关——激活态 x 钮在册口）
    await pressActiveTabClose(dailyStem)
    const dailyOk = dailyDiskOk && dailyTreeOk && dailyIdemOk
    // —— PLAN-018 T-04 目录移动四子步（file 组子步——组数不变，fail 即
    // 臂败；素材已外造：DirMvA[MovePg.ad 含 [[Hello World]] 链] + DirMvB
    // + L1/../../L4/DeepPg.ad 5 层深档）：
    //   ㉒① 移动目录弧线（DirMvA→DirMvB：弹层双 input[源/目标父]→确认
    //      → movedir_open=false + 磁盘新位字节整迁 + 旧目录消 + tab 全量
    //      路径变标题恒 + 面板快照零变化 + links_json 归一 diff——三联
    //      对照移动级[SD-1201/1401/1801 并表续——三部曲收官]）
    //   ② 取消零落盘 ③ 循环卫拒弹层留置（源==目标父 自身形）
    //   ④ deep 案：5 层深档快开命中（depth 8 front 面收口直证——
    //      tree depth 4 下快开行集不含该档）
    if (!/backlinks_open:\s*true/.test(await stateText('backlinks_open'))) {
      await pressButton('视图', { exact: true })
      await pressButton('切换反链', { exact: true })
    }
    await stateIs('backlinks_open', 'true')
    // DirMvA 展开态自适应（fs 外造行不在 ft_expanded——press 展开）→
    // 开 MovePg 档（tab 面——路径断言载体；显示名 'MovePg'）。
    await pressTree('DirMvA')
    await sleep(400)
    await pressTree('MovePg')
    await stateIs('active_title', 'DirMvA/MovePg')
    // 面板锚 = MovePg 出链行 'Hello World'（区域锚——树行/tab 题同文
    // 消歧；出链恒链接文本 SD-1401 定文）；面板快照零变化的对照态。
    await waitButtonIn(panelRegion, 'Hello World')
    const panel3Before = panelSliceOf(await snapshotText())
    const lj3Before = (await callTool('autoui_state', {})).match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    const mvPgBytes = fs.readFileSync(path.join(FIXTURE, 'DirMvA', 'MovePg.ad'), 'utf8')
    await pressButton('文件', { exact: true })
    await pressButton('移动目录…', { exact: true })
    await stateIs('movedir_open', 'true')
    await stateIs('movedir_src', '')
    await stateIs('movedir_dst', '')
    await typeIntoDialogInput('移动目录', 'DirMvA')
    await stateIs('movedir_src', 'DirMvA')
    await typeIntoDialogInputIdx('移动目录', 1, 'DirMvB')
    await stateIs('movedir_dst', 'DirMvB')
    await pressInDialogByTitle('移动目录', '移动')
    await stateIs('movedir_open', 'false')
    // ① 断言族：磁盘新位字节整迁 + 旧目录消 + tab 全量路径变标题恒 +
    // ft_sel remap + 面板快照零变化 + links_json 归一 diff。
    const movedMvFile = path.join(FIXTURE, 'DirMvB', 'DirMvA', 'MovePg.ad')
    const mvDirDiskOk = fs.existsSync(movedMvFile) && !fs.existsSync(path.join(FIXTURE, 'DirMvA'))
      && fs.readFileSync(movedMvFile, 'utf8') === mvPgBytes
    const mvDump3 = await callTool('autoui_state', {})
    const mvDirTabOk = mvDump3.includes('active_path: "DirMvB/DirMvA/MovePg.ad"') && mvDump3.includes('active_title: "DirMvB/DirMvA/MovePg"')
      && mvDump3.includes('ft_sel: "DirMvB/DirMvA/MovePg.ad"')
    await waitButtonIn(tabStripRegion, 'MovePg')
    let panel3After = ''
    let panelZero3Ok = false
    for (const dl = Date.now() + 8000; ; ) {
      panel3After = panelSliceOf(await snapshotText())
      panelZero3Ok = panel3Before !== '' && panel3Before === panel3After
      if (panelZero3Ok || Date.now() > dl) break
      await sleep(300)
    }
    const lj3After = mvDump3.match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    const lj3Unesc = (s) => { try { return JSON.parse(`"${s}"`) } catch { return s } }
    const lj3Norm = (raw) => {
      try {
        const pages = JSON.parse(lj3Unesc(raw))
        const normPath = (p) => (p === 'DirMvA/MovePg.ad' || p === 'DirMvB/DirMvA/MovePg.ad' ? '<MOVED>' : p)
        return JSON.stringify(pages.map((p) => ({
          path: normPath(p.path), title: p.title,
          links: p.links.map((l) => ({ ...l, target_path: normPath(l.target_path) })),
        })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
      } catch {
        return '<unparsable>'
      }
    }
    const linkNet3Ok = lj3Before !== '' && lj3Norm(lj3Before) === lj3Norm(lj3After)
    // ② 取消零落盘：重开弹层 → 填源/目标父 → 取消 → 零落盘（NoDirMv
    // 不在 + 位移档原样）。
    await pressButton('文件', { exact: true })
    await pressButton('移动目录…', { exact: true })
    await stateIs('movedir_open', 'true')
    await typeIntoDialogInput('移动目录', 'DirMvB/DirMvA')
    await typeIntoDialogInputIdx('移动目录', 1, 'NoDirMv')
    await pressInDialogByTitle('移动目录', '取消')
    await stateIs('movedir_open', 'false')
    const mvDirCancelOk = !fs.existsSync(path.join(FIXTURE, 'NoDirMv')) && fs.existsSync(movedMvFile)
    // ③ 循环卫拒：源==目标父（自身形）→ 移动 → 弹层留置 + 磁盘零变化
    // → 取消收口。
    await pressButton('文件', { exact: true })
    await pressButton('移动目录…', { exact: true })
    await stateIs('movedir_open', 'true')
    await typeIntoDialogInput('移动目录', 'DirMvB/DirMvA')
    await typeIntoDialogInputIdx('移动目录', 1, 'DirMvB/DirMvA')
    await pressInDialogByTitle('移动目录', '移动')
    let mvCycleHoldOk = false
    for (const dl = Date.now() + 8000; ; ) {
      mvCycleHoldOk = /movedir_open:\s*true/.test(await stateText('movedir_open'))
      if (mvCycleHoldOk || Date.now() > dl) break
      await sleep(300)
    }
    const mvCycleDiskOk = fs.existsSync(movedMvFile)
    await pressInDialogByTitle('移动目录', '取消')
    await stateIs('movedir_open', 'false')
    // ④ deep 案：快开 'DeepPg' → 5 层档行在（depth 8 front 面收口——
    // depth 4 下 ft_nodes 不含 → 行集不含）→ 拾取开档（ASCII 路径双臂）
    // → 关档收口。**PLAN-038 T-03 迁移**：弹层面（input/行/拾取区域锚）。
    await pressButton('视图', { exact: true })
    await pressButton('快速打开', { exact: true })
    await stateIs('quick_open', 'true')
    {
      let fi = null
      for (let i = 0; i < 10 && !fi; i++) {
        fi = quickDialogInput(await snapshot())
        if (!fi) await sleep(300)
      }
      if (!fi) throw new Error('quick dialog input not found（deep 案）')
      await callTool('autoui_action', { element_id: elementIdOf(fi), action: 'type_text', value: 'DeepPg' })
      await stateHas('quick_q', 'DeepPg')
    }
    const DEEP_REL = 'L1/L2/L3/L4/DeepPg.ad'
    // 行标签 = dtitle（titles 随 link_index depth 8 含深档 → stem
    // 'DeepPg'；depth 4 时 ft_nodes 不含 → 行集不含——行存在性即收口
    // 证）。'DeepPg' 全树唯一（素材名避让）。
    let deepRowOk = false
    for (const dl = Date.now() + 8000; ; ) {
      deepRowOk = (await quickDialogTexts(await snapshot())).includes('DeepPg')
      if (deepRowOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!deepRowOk) throw new Error(`deep 案快开行失守（DeepPg[${DEEP_REL}] 未现——depth 8 收口面）`)
    await pressQuickRow('DeepPg')
    await stateIs('active_title', 'L1/L2/L3/L4/DeepPg')
    await stateHas('active_body', '深位档')
    await pressActiveTabClose('DeepPg')
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    // —— PLAN-019 T-03 目录合并弧线（file 组 dir3 扩——组数不变，fail
    // 即臂败；素材已外造 MgA/MgPg×MgB/MgA/MgOther + MgC/MgCPg×MgB/MgC/
    // MgTPg 同名目录对）：
    //   ㉓① 合并弧线：弹层双 input → 预览行现文[目标同名检测——探针 G
    //      定谳双钮变体：合并移动钮显]→ 合并移动 → 磁盘并入（靶原档
    //      不变+源档字节整迁+源目录消）+ tab 全量路径变 + links_json
    //      归一 diff（无冲突全入径=纯移动语义零改写）
    //   ② 不合并拒径回归：同名对按「移动」钮 → 循环后目标冲突拒 → 弹层
    //      留置 + 磁盘零变化 → 取消收口（③ 取消零落盘 = 018 ② 案既有
    //      承载）
    await pressTree('MgA')
    await sleep(400)
    await pressTree('MgPg')
    await stateIs('active_title', 'MgA/MgPg')
    const mgPgBytes = fs.readFileSync(path.join(FIXTURE, 'MgA', 'MgPg.ad'), 'utf8')
    const ljMgBefore = (await callTool('autoui_state', {})).match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    await pressButton('文件', { exact: true })
    await pressButton('移动目录…', { exact: true })
    await stateIs('movedir_open', 'true')
    await stateIs('dirmerge_on', 'false')
    await stateIs('dirmerge_strategy', 'both')
    await typeIntoDialogInput('移动目录', 'MgA')
    await typeIntoDialogInputIdx('移动目录', 1, 'MgB')
    // 预览行现文 + 三择钮显（PLAN-025 三钮分立——D-36① 规避形态双断言）。
    let mgPrevOk = false
    for (const dl = Date.now() + 8000; ; ) {
      mgPrevOk = (await snapshotText()).includes('目标已有同名目录：MgB/MgA')
      if (mgPrevOk || Date.now() > dl) break
      await sleep(300)
    }
    if (!mgPrevOk) throw new Error('合并预览行失守（目标已有同名目录：MgB/MgA 未现——探针 G 双钮变体）')
    const mgThreeOk = (await buttonInDialogVisible('移动目录', '合并·保留双份'))
      && (await buttonInDialogVisible('移动目录', '合并·跳过同名'))
      && (await buttonInDialogVisible('移动目录', '合并·覆盖同名'))
    if (!mgThreeOk) throw new Error('三择钮失守（合并·保留双份/跳过同名/覆盖同名 未全现）')
    await pressInDialogByTitle('移动目录', '合并·保留双份')
    await stateIs('movedir_open', 'false')
    const mgPgMoved = path.join(FIXTURE, 'MgB', 'MgA', 'MgPg.ad')
    const mgDiskOk = fs.existsSync(mgPgMoved)
      && fs.readFileSync(mgPgMoved, 'utf8') === mgPgBytes
      && fs.existsSync(path.join(FIXTURE, 'MgB', 'MgA', 'MgOther.ad'))
      && !fs.existsSync(path.join(FIXTURE, 'MgA'))
    const mgDump = await callTool('autoui_state', {})
    const mgTabOk = mgDump.includes('active_path: "MgB/MgA/MgPg.ad"')
      && mgDump.includes('ft_sel: "MgB/MgA/MgPg.ad"')
    const ljMgAfter = mgDump.match(/links_json:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? ''
    const ljMgUnesc = (s) => { try { return JSON.parse(`"${s}"`) } catch { return s } }
    const ljMgNorm = (raw) => {
      try {
        const pages = JSON.parse(ljMgUnesc(raw))
        const norm = (p) => (p === 'MgA/MgPg.ad' || p === 'MgB/MgA/MgPg.ad' ? '<MOVED>' : p)
        return JSON.stringify(pages.map((p) => ({
          path: norm(p.path), title: p.title,
          links: p.links.map((l) => ({ ...l, target_path: norm(l.target_path) })),
        })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
      } catch {
        return '<unparsable>'
      }
    }
    const mgLinkOk = ljMgBefore !== '' && ljMgNorm(ljMgBefore) === ljMgNorm(ljMgAfter)
    await pressActiveTabClose('MgPg')
    // ② 不合并拒径：MgC → MgB 同名对按「移动」钮 → 拒（目标冲突卫——
    // merge=false 拒径回归）→ 弹层留置 + 磁盘零变化 → 取消。
    await pressButton('文件', { exact: true })
    await pressButton('移动目录…', { exact: true })
    await stateIs('movedir_open', 'true')
    await typeIntoDialogInput('移动目录', 'MgC')
    await typeIntoDialogInputIdx('移动目录', 1, 'MgB')
    await pressInDialogByTitle('移动目录', '移动')
    let mgRejHoldOk = false
    for (const dl = Date.now() + 8000; ; ) {
      mgRejHoldOk = /movedir_open:\s*true/.test(await stateText('movedir_open'))
      if (mgRejHoldOk || Date.now() > dl) break
      await sleep(300)
    }
    const mgRejDiskOk = fs.existsSync(path.join(FIXTURE, 'MgC', 'MgCPg.ad'))
      && fs.existsSync(path.join(FIXTURE, 'MgB', 'MgC', 'MgTPg.ad'))
      && !fs.existsSync(path.join(FIXTURE, 'MgB', 'MgC', 'MgCPg.ad'))
      && !fs.existsSync(path.join(FIXTURE, 'MgB', 'MgB'))
    await pressInDialogByTitle('移动目录', '取消')
    await stateIs('movedir_open', 'false')
    const mgOk = mgPrevOk && mgThreeOk && mgDiskOk && mgTabOk && mgLinkOk && mgRejHoldOk && mgRejDiskOk
    console.log(`  [13 dir4] ${mgOk ? 'PASS' : 'FAIL'} — PLAN-019 目录合并弧线 + PLAN-025 三择钮面（弹层双 input→预览行现文+三择钮三显[合并·保留双份/跳过同名/覆盖同名——D-36① 规避形态]→保留双份钮→磁盘并入 靶原档不变+源档字节整迁+源目录消+tab 全量路径变+links_json 归一 diff/不合并拒径 弹层留置+磁盘零变化）`)
    if (!mgOk) {
      console.log(`  [13 dir4 dbg] prev=${mgPrevOk} three=${mgThreeOk} disk=${mgDiskOk} tab=${mgTabOk} link=${mgLinkOk} rej=${mgRejHoldOk}/${mgRejDiskOk}`)
    }
    // —— PLAN-025 T-03 tab 重映射弧（F-R19-1 直证——skip 改道位跟随）：
    //   素材已外造同名对[MgR（MgRPg.ad=源标记）× MgT/MgR（MgRPg.ad=靶
    //   twin 内容）——PLAN-019 素材块同位]→ 源档开 tab → 三择「合并·跳过
    //   同名」→ 断言 tab path = 映射新位 .trash/MgR/MgRPg.ad（**非靶档
    //   rel**）+ active_body = 源档内容（v1 误映射[显靶档内容]形态消除
    //   直证）+ recents 置换同口径 + 磁盘[靶 twin 逐字节不动 + .trash
    //   改道逐字节] + .trash 位保存落回原位（019 §10.4 可看可编辑）。
    await pressTree('MgR')
    await sleep(300)
    await pressTree('MgRPg')
    await stateIs('active_title', 'MgR/MgRPg')
    await pressButton('文件', { exact: true })
    await pressButton('移动目录…', { exact: true })
    await stateIs('movedir_open', 'true')
    await typeIntoDialogInput('移动目录', 'MgR')
    await typeIntoDialogInputIdx('移动目录', 1, 'MgT')
    await pressInDialogByTitle('移动目录', '合并·跳过同名')
    await stateIs('movedir_open', 'false')
    await sleep(400)
    const skipDump = await callTool('autoui_state', {})
    const skipTabOk = skipDump.includes('active_path: ".trash/MgR/MgRPg.ad"')
      && skipDump.includes('active_title: ".trash/MgR/MgRPg"')
      && /active_body:[^]*?源冲突档标记：tab 跟随改道位。/.test(skipDump)
      && !/active_body:[^]*?靶 twin 档内容。/.test(skipDump)
      && skipDump.includes('recent_paths') && skipDump.includes('.trash/MgR/MgRPg.ad')
    const skipDiskOk = fs.readFileSync(path.join(FIXTURE, 'MgT', 'MgR', 'MgRPg.ad'), 'utf8') === '# MgRPg\n\n靶 twin 档内容。\n'
      && fs.readFileSync(path.join(FIXTURE, '.trash', 'MgR', 'MgRPg.ad'), 'utf8') === '# MgRPg\n\n源冲突档标记：tab 跟随改道位。\n'
      && !fs.existsSync(path.join(FIXTURE, 'MgR'))
    // .trash 落位 tab 可看可编辑（019 §10.4）——保存落回 .trash 原位直证
    await typeWholeDoc(`# MgRPg\n\n源冲突档标记：tab 跟随改道位。\n\n${SKIP_EDIT_MARKER}`)
    await pressButton('保存')
    await sleep(400)
    const skipSaveOk = fs.readFileSync(path.join(FIXTURE, '.trash', 'MgR', 'MgRPg.ad'), 'utf8').includes(SKIP_EDIT_MARKER)
    await pressActiveTabClose('.trash/MgR/MgRPg')
    const skipArcOk = skipTabOk && skipDiskOk && skipSaveOk
    console.log(`  [13 dir5] ${skipArcOk ? 'PASS' : 'FAIL'} — PLAN-025 skip 三择 tab 重映射弧（源档开 tab→合并·跳过同名→tab path=.trash 改道位[F-R19-1 直证：映射新位非靶档 rel]+active_body=源档内容非靶档内容[误映射形态消除]+recents 置换+磁盘 twin 不动/.trash 改道+.trash 位保存落回原位）`)
    if (!skipArcOk) {
      console.log(`  [13 dir5 dbg] tab=${skipTabOk} disk=${skipDiskOk} save=${skipSaveOk}`)
    }
    const mvDirOk = mvDirDiskOk && mvDirTabOk && panelZero3Ok && linkNet3Ok && mvDirCancelOk && mvCycleHoldOk && mvCycleDiskOk && deepRowOk && mgOk && skipArcOk
    console.log(`  [13 dir3] ${mvDirOk ? 'PASS' : 'FAIL'} — PLAN-018 目录移动四子步 + PLAN-019 目录合并弧线 + PLAN-025 三择/tab 重映射弧（移动弧线[弹层双 input→磁盘整迁+旧目录消+tab 全量标题恒+ft_sel remap+面板零变化+links_json 归一]/取消零落盘/循环卫拒弹层留置/5 层深档快开命中[depth 8 收口]/合并弧线[预览行+三择钮→保留双份并入+靶原档不变+归一 diff]/不合并拒径留置/skip 弧 tab 重映射[F-R19-1 闭账]）`)
    if (!mvDirOk) {
      console.log(`  [13 dir3 dbg] disk=${mvDirDiskOk} tab=${mvDirTabOk} panel=${panelZero3Ok} link=${linkNet3Ok} cancel=${mvDirCancelOk} cycle=${mvCycleHoldOk}/${mvCycleDiskOk} deep=${deepRowOk} skip=${skipArcOk}`)
    }
    // 收尾：面板关 + Hello World 复原（quit 前置口径——13 收尾同款）。
    if (/backlinks_open:\s*true/.test(await stateText('backlinks_open'))) {
      await pressButton('视图', { exact: true })
      await pressButton('切换反链', { exact: true })
      await stateIs('backlinks_open', 'false')
    }
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    const fileParts = {
      newDiskOk, newTreeOk, idemDiskOk, tabStable: tabCountPre === tabCountPost,
      ghostOk, cjkNavOk, delDlgOk, delCancelOk, capGone, flipOk, noopOk,
      fr94Ok: fr94Up && fr94Down,
      dirBoxOk, dirTreeOk, moveDiskOk, moveTabOk, panelZeroOk, linkNetOk,
      moveCancelOk, conflictHoldOk, conflictDiskOk,
      rendirPrevOk, renDirDiskOk, panelZero2Ok, linkNet2Ok,
      renDirCancelOk, delDirPrevOk, delDirCancelOk, delDirOk, flip2Ok,
      dailyOk, mvDirOk,
      trashCapRowOk, trashCapDiskOk, trashRestoreEmptyOk, capBackDiskOk,
      capFalseGoneOk, capTreeBackOk,
    }
    if (Object.values(fileParts).some((v) => !v)) {
      console.log(`  [13 dbg] ${JSON.stringify(fileParts)} tabPre=${JSON.stringify(tabCountPre)} tabPost=${JSON.stringify(tabCountPost)}`)
    }
    check('13', 'file', Object.values(fileParts).every((v) => v) && tabCountFinal >= 0,
      `file 组八子步+F-R9-4 案+目录面四子步+目录二期三子步+今日笔记弧线[PLAN-015 ⑰ 开档+树新行+磁盘双时间戳+重入幂等]+trash 改道/恢复弧线[PLAN-016 ⑱ 清单见 .trash/wiki/CAP 定理.ad→行恢复→空态+磁盘回+exists 翻转回双向态+树行回+tab 重开]（新建 index 模板逐字节+树新行/同名幂等 tab+磁盘不变/取消零落盘/CJK 新页导航断言双臂[PLAN-028 POST 化收口]＋删除预览 3 处入链已知答案+tab 面「${delTabsLine}」+取消零落盘/删除弧线 磁盘消失+ft_sel 清空+激活落邻档首页[同位保持双臂]/悬空翻转 出链行 CAP 定理（悬空）/未选中 no-op/F-R9-4 删后提及刷新/PLAN-012：⊕新建目录[树新行+磁盘在]→Project X 移动[预填 wiki/tab 全量${DIR_BOX}/Project X/字节整迁/面板快照零变化/links_json 定向 diff 归一]→取消零落盘→冲突拒[弹层留置+磁盘零变化]；PLAN-014：重命名目录 弧线[双 input 弹层+预览 将移动 1 个 .ad 页+tab 全量路径变标题恒+磁盘整迁+面板零变化+links_json 归一 diff——三联对照目录级]/取消零落盘两形/删除目录[预览计数+悬空警示→tab 全关计数-1+树行消+悬空翻转 Project X（悬空）]——键程 menubar 共口；**PLAN-018：目录移动四子步[弹层双 input 弧线——磁盘整迁/旧目录消/tab 全量标题恒/面板零变化/links_json 归一——三联对照移动级三部曲收官+取消零落盘+循环卫拒弹层留置+5 层深档快开命中——depth 8 收口]**）`)

    // R 安全手动重载（PLAN-030 T-04；AC-01..05 vm 轨行为面）。迟到/异常门
    // 由 vue 拦截臂承载（§6 口径：不为读取异常写生产故障注入；vm Modal 弹
    // 层期间交互整吞——目标变化门 UI 不可达，e2e reload-safety ⑥ 实测）。
    // 此处覆盖：确认开/取消/放弃/干净直入/缺档/untitled 六弧。弹层钮区域
    // 锚消歧（多弹层「取消」并存——闭态恒渲染 D-23③ 家族）。
    async function pressReloadDialogButton(label) {
      const tree = await snapshot()
      const desc = findFirst(tree, (n) => ownText(n) === RELOAD_CONFIRM_TEXT)
      if (!desc) throw new Error('reload confirm dialog not open')
      let cur = findParent(tree, desc)
      let panel = null
      while (cur) {
        if (findFirst(cur, (n) => n.head.startsWith('button ') && ownText(n) === '放弃修改并重载')) { panel = cur; break }
        cur = findParent(tree, cur)
      }
      if (!panel) throw new Error('reload dialog panel not found')
      const btn = findFirst(panel, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === label)
      if (!btn) throw new Error(`button "${label}" not found in reload dialog`)
      const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
      if (!/status: ok/.test(res)) throw new Error(`press reload-dialog "${label}" not ok: ${res}`)
    }
    // R1 未保存确认：弄脏 → toolbar 重载 → 确认开 + 正文/脏标不动 + 未读盘
    const reloadDisk0 = fs.readFileSync(targetFile, 'utf8')
    await typeWholeDoc(`${bodyOf(reloadDisk0)}\n\n${RELOAD_DIRTY_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressButton('重载')
    await stateIs('reload_confirm_open', 'true')
    await stateHas('active_body', RELOAD_DIRTY_MARKER)
    await stateIs('active_dirty', 'true')
    const r1Ok = fs.readFileSync(targetFile, 'utf8') === reloadDisk0
    // R2 取消：弹层关 + 正文/脏标/磁盘全保持
    await pressReloadDialogButton('取消')
    await stateIs('reload_confirm_open', 'false')
    await stateIs('active_dirty', 'true')
    await stateHas('active_body', RELOAD_DIRTY_MARKER)
    const r2Ok = fs.readFileSync(targetFile, 'utf8') === reloadDisk0
    // R3 明确放弃：磁盘外改 → 确认 → 放弃 → 正文=磁盘新文 + dirty 清
    fs.appendFileSync(targetFile, `\n${RELOAD_DISK_MARKER}\n`)
    await pressButton('重载')
    await stateIs('reload_confirm_open', 'true')
    await pressReloadDialogButton('放弃修改并重载')
    await stateHas('active_body', RELOAD_DISK_MARKER, 8000)
    await stateIs('active_dirty', 'false')
    // R4 干净直入：再外改 → 重载 → 无确认直读
    fs.appendFileSync(targetFile, `\n${RELOAD_DISK2_MARKER}\n`)
    await pressButton('重载')
    await stateHas('active_body', RELOAD_DISK2_MARKER, 8000)
    let r4Ok = true
    try { await stateIs('reload_confirm_open', 'false', 1200) } catch { r4Ok = false }
    // R5 缺档保文：弄脏 → 删档 → 确认 → 放弃 → 失败提示 + 正文/脏标保持
    const reloadDiskAtR5 = fs.readFileSync(targetFile, 'utf8')
    await typeWholeDoc(`${bodyOf(reloadDiskAtR5)}\n\n${RELOAD_DIRTY2_MARKER}`)
    await stateIs('active_dirty', 'true')
    fs.rmSync(targetFile)
    await pressButton('重载')
    await stateIs('reload_confirm_open', 'true')
    await pressReloadDialogButton('放弃修改并重载')
    await stateHas('save_note', '重载失败：文件已不存在', 8000)
    await stateHas('active_body', RELOAD_DIRTY2_MARKER)
    await stateIs('active_dirty', 'true')
    const r5Ok = !fs.existsSync(targetFile)
    // R5 恢复：按 tab 已知正文重建磁盘（fm 前缀 + ③后正文）→ 放弃重载 →
    // 干净（check 9 前置态复原——磁盘存在 + frontmatter 在）。
    const reloadFmPart = reloadDisk0.slice(0, reloadDisk0.indexOf(bodyOf(reloadDisk0)))
    fs.writeFileSync(targetFile, reloadFmPart + bodyOf(reloadDiskAtR5) + `\n\n${RELOAD_DIRTY2_MARKER}`)
    await pressButton('重载')
    await stateIs('reload_confirm_open', 'true')
    await pressReloadDialogButton('放弃修改并重载')
    await stateHas('active_body', RELOAD_DIRTY2_MARKER, 8000)
    await stateIs('active_dirty', 'false')
    const r5RecOk = fs.existsSync(targetFile) && fs.readFileSync(targetFile, 'utf8').includes('title: Hello World')
    // R6 untitled 提示不读盘：新建 → INPUT_TEXT 弄脏（空档引擎键入无落点
    // ——上游空文档渲染行为；vm 经 INPUT_TEXT 口覆盖脏 untitled 形）→
    // 重载 → 无确认弹层 + 可读提示 + 正文保。
    await pressButton('新建')
    await typeWholeDoc('安全重载untitled草稿')
    await stateIs('active_dirty', 'true')
    await pressButton('重载')
    let r6Ok = true
    try { await stateIs('reload_confirm_open', 'false', 1200) } catch { r6Ok = false }
    await stateHas('save_note', '请先保存此文档', 8000)
    await stateHas('active_body', '安全重载untitled草稿')
    // 收尾：untitled 弃改关闭 → 回 Hello World（check 9 前置口径）。
    await pressActiveTabClose('未命名')
    await stateIs('confirm_open', 'true')
    await pressButton('放弃修改并关闭', { exact: true })
    await pressTab('Hello World')
    await stateIs('active_title', tabTitleOf(TARGET_LABEL))
    check('R', 'reload-safe', r1Ok && r2Ok && r4Ok && r5Ok && r5RecOk && r6Ok,
      `安全手动重载六弧（R1 确认开 未读盘=${r1Ok}/R2 取消全保=${r2Ok}/R3 放弃落盘正文=磁盘新文/R4 干净直入 无确认=${r4Ok}/R5 缺档保文 磁盘未建=${r5Ok}+按 tab 正文复原 fm 在=${r5RecOk}/R6 untitled 提示不读 无弹层=${r6Ok}——迟到/异常门 vue 拦截臂承载 e2e reload-safety ⑥；弹层钮区域锚消歧）`)

    // —— LC 生命周期受检组（PLAN-032 T-06；R-02b）——有界三弧（子步
    // 不占检查位——10c 同款，fail 即臂败）：
    //   LC1 阻断门：LC-B 单检查点脏（有界键入预算）→ LC-A 活动 → 改名
    //        → 阻断弹层（LC-B 未保存在列——变更域精确面）→ 取消零提交
    //   LC2 重试：LC-B 保存 → 重改名 → ok（被迁档 tab 跟随 + 引用源
    //        磁盘改写 + 无守卫 Reload/TabsRenamed 退役面）
    //   LC3 删除：清洁开档实例协调关闭（CloseTabsOf 无条件关闭退役面）
    const pressInBlockDialog = async (buttonText) => {
      const dl = Date.now() + 8000
      for (;;) {
        const t = await snapshot()
        const title = findFirst(t, (n) => ownText(n) === '文件操作被阻止')
        if (title) {
          const header = findParent(t, title)
          const content = findParent(t, header)
          const btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === buttonText) : null
          if (btn) {
            const res = await callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`press ${buttonText}(lc-block) not ok: ${res}`)
            return
          }
        }
        if (Date.now() > dl) throw new Error(`button "${buttonText}" in lc-block-dialog not found`)
        await sleep(300)
      }
    }
    const lcBFile = path.join(FIXTURE, LC_B)
    const lcAFile = path.join(FIXTURE, LC_A)
    const lcDelFile = path.join(FIXTURE, LC_DEL)
    // LC1 阻断门
    await pressTree('LC-B')
    await typeWholeDoc(`${bodyOf(fs.readFileSync(lcBFile, 'utf8'))}\n\n${LC_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressTree('LC-A')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput('LC-A2')
    await pressInRenameDialog('重命名')
    await stateIs('lc_block_open', 'true')
    const lcBlockSnap = await snapshotText()
    const lcBlockOk = lcBlockSnap.includes('LC-B — 未保存') && !lcBlockSnap.includes('LC-A — 未保存')
    await pressInBlockDialog('取消')
    await stateIs('lc_block_open', 'false')
    const lc1Ok = lcBlockOk && fs.existsSync(lcAFile) && !fs.existsSync(path.join(FIXTURE, 'LC-A2.ad'))
    // LC2 重试（保存 LC-B 后重新分析——重试不沿用旧列表）
    await pressTab('LC-B')
    await pressButton('保存')
    const lcSaveDl = Date.now() + 10000
    for (;;) {
      if (fs.readFileSync(lcBFile, 'utf8').includes(LC_MARKER)) break
      if (Date.now() > lcSaveDl) throw new Error('LC-B save never landed')
      await sleep(200)
    }
    await pressTab('LC-A')
    await pressButton('文件', { exact: true })
    await pressButton('重命名…', { exact: true })
    await stateIs('rename_open', 'true')
    await typeIntoRenameInput('LC-A2')
    await pressInRenameDialog('重命名')
    await stateIs('rename_open', 'false')
    const lcRenamedDl = Date.now() + 10000
    for (;;) {
      if (!fs.existsSync(lcAFile) && fs.existsSync(path.join(FIXTURE, 'LC-A2.ad'))) break
      if (Date.now() > lcRenamedDl) throw new Error('LC rename never landed')
      await sleep(200)
    }
    const lcBAfter = fs.readFileSync(lcBFile, 'utf8')
    const lc2Ok = lcBAfter.includes('[[LC-A2]]') && lcBAfter.includes(LC_MARKER)
    await stateIs('active_title', 'LC-A2')
    // LC3 删除：清洁开档 → 协调关闭
    await pressTree('LC-Del')
    await pressButton('文件', { exact: true })
    await pressButton('删除…', { exact: true })
    await pressButton('删除', { exact: true })
    // **F-32-R2 上游 blocker 精确断言口径（PLAN-033 T-04 承 032 在录）**：
    // vm 臂 LC3-delete 落上游帧槽别名安全终态（verdict=reject 零磁盘变更
    // +弹层留置+save_note 如实——032 LC3-DBG 转储定谳值）。超时不再中止
    // 臂（中止会连带放弃 12/13/R 组当前代码验证面）：匹配安全终态四断言
    // → 单列 blocker 续跑；不匹配（终态漂移）才 fail——blocker 与本片
    // 新增失败严格分列，不合并称全绿。
    const lcDelDl = Date.now() + 10000
    let lc3Landed = false
    for (;;) {
      if (!fs.existsSync(lcDelFile)) { lc3Landed = true; break }
      if (Date.now() > lcDelDl) break
      await sleep(200)
    }
    let lc3Ok = lc3Landed && !fs.existsSync(lcDelFile) && fs.existsSync(path.join(FIXTURE, '.trash', LC_DEL))
    let lc3SafeOk = false
    if (!lc3Landed) {
      const verdictTxt = await stateText('lc_verdict')
      const noteTxt = await stateText('save_note')
      const dlgTxt = await stateText('delete_open')
      const verdict = verdictTxt.match(/lc_verdict:\s*"([^"]*)"/)?.[1] ?? ''
      const note = noteTxt.match(/save_note:\s*"([^"]*)"/)?.[1] ?? ''
      const dlgOpen = /delete_open:\s*true/.test(dlgTxt)
      lc3SafeOk = verdict === 'reject' && dlgOpen && note.includes('文件操作被拒绝')
        && fs.existsSync(lcDelFile) && !fs.existsSync(path.join(FIXTURE, '.trash', LC_DEL))
      console.log(`  [LC3 blocker] F-32-R2 安全终态断言=${lc3SafeOk ? 'PASS' : 'FAIL'}（verdict=${verdict} 弹层留置=${dlgOpen} 零磁盘变更=${fs.existsSync(lcDelFile)} save_note="${note.slice(0, 30)}"——单列不合并全绿）`)
      // 现场复原：取消删除弹层（pressInDeleteDialog 同款两级父锚——
      // title→header→content，按钮在 content；后续组 12/13 弹层锚消歧
      // 不受留置弹层串扰）。
      if (lc3SafeOk) {
        const dl2 = Date.now() + 8000
        for (;;) {
          const t = await snapshot()
          const title = findFirst(t, (n) => ownText(n) === '删除页面')
          if (title) {
            const header = findParent(t, title)
            const content = header ? findParent(t, header) : null
            const cancel = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '取消') : null
            if (cancel) {
              await callTool('autoui_action', { element_id: elementIdOf(cancel), action: 'press' })
              break
            }
          }
          if (Date.now() > dl2) throw new Error('LC3 blocker 复原失败（删除弹层取消钮未现）')
          await sleep(300)
        }
        await stateIs('delete_open', 'false')
      }
    }
    await stateIs('lc_block_open', 'false')
    check('LC', 'lifecycle', lc1Ok && lc2Ok && (lc3Ok || lc3SafeOk),
      `生命周期受检组（LC1 脏引用源阻断+取消零提交=${lc1Ok}/LC2 保存后重试 ok+源页改写+被迁档跟随=${lc2Ok}/LC3 清洁开档删除协调关闭+回收站落点=${lc3Ok || `F-32-R2 上游 blocker 安全终态精确断言=${lc3SafeOk}[reject+零变更+弹层留置+save_note 如实——032 在录单列，非本片新增失败]`}——无守卫 Reload/TabsRenamed/CloseTabsOf 收尾退役面；无关脏页不列断言=e2e lifecycle ①；键入有界=单检查点窗 D-45②）`)

    // 9 退出存盘：dirty → 文件菜单退出 → 确认弹层 → QuitSaveClose →
    // 磁盘三验 + 进程退出。恒为臂内最后一项（Process.exit 杀进程）。
    // **激活复原前置（PLAN-033 T-04——LC 组 blocker 终态复原后活跃=LC-Del
    // 留置；032 时代臂中止于 LC3 本点从未达）**：断言域 = Hello World 落盘
    // ——先复原激活再键入。
    await pressTree('Hello World')
    await stateHas('active_body', PARA_ANCHOR)
    await typeWholeDoc(`${bodyOf(fs.readFileSync(targetFile, 'utf8'))}\n\n${QUIT_MARKER}`)
    await stateIs('active_dirty', 'true')
    await pressButton('文件', { exact: true })
    await pressButton('退出', { exact: true })
    await stateIs('quit_confirm_open', 'true')
    let quitRes = ''
    try {
      quitRes = await callTool('autoui_action', {
        element_id: elementIdOf(await waitButton('保存并退出', { exact: true })),
        action: 'press',
      })
    } catch {
      // Process.exit 可能先于 HTTP 响应杀进程——连接断开即成功路径
      //（auto-edit desktop_mcp T8 同款口径）。
    }
    const quitDeadline = Date.now() + 10000
    while (app.exitCode === null && Date.now() < quitDeadline) await sleep(300)
    const exited = app.exitCode !== null
    let quitDisk = ''
    if (exited) {
      for (const dl = Date.now() + 6000; ; ) {
        quitDisk = fs.readFileSync(targetFile, 'utf8')
        if (quitDisk.includes(QUIT_MARKER)) break
        if (Date.now() > dl) break
        await sleep(150)
      }
    }
    const quitOk = exited && quitDisk.includes(QUIT_MARKER) && quitDisk.includes(PARA_ANCHOR) && quitDisk.includes('title: Hello World')
    check('9', 'quit', quitOk, `进程退出=${exited}（exit=${app.exitCode}${quitRes ? '' : '，press 响应随进程终止断连——成功路径'}） 磁盘三验（原文/标记/frontmatter）=${quitOk}`)

    // —— ⑩b/⑩c（PLAN-021 T-03；臂尾第二 boot——fail 即臂败不占检查位，
    // 10m/10c 子步同款纪律）：check 9 退出存盘 = 真会话终态，此处进程重
    // 启 = 跨会话载入半真弧（Init → recent_paths_get 读盘 → recents_
    // split 入态；§10.1 落定：「进程内二 Init 模拟或直证面」取**进程重
    // 启真弧**——强于二 Init 模拟，e2e reload 弧线的 vm 轨对位）。
    // ⑩b 载入态：recent_paths state 清单逐行 = 磁盘逐行（⑨ 弧终态
    // RecCap12..RecCap3）+ 快开「最近」段渲染。
    // ⑩c 防线案：fs 造 201 页微语料 → ActDaily（TreeRefresh 重计数）→
    // ws_warn 警示文案（store 态——vm 组件子树快照不可见，StatusBar 渲
    // 染面 = e2e 臂断言）+ 警示窗内快开可用（纯显示面零功能影响）→ 清
    // 料再刷 → 零警示回归。
    const bootAgain = async () => {
      const app2 = spawn(AUTO_EXE, split ? ['run', '-r', 'vm', '--no-merge'] : ['run', '-r', 'vm'], {
        cwd: repoRoot,
        env: { ...process.env, AUTOUI_MCP_PORT: String(port), JADE_WORKSPACE: FIXTURE },
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let out2 = ''
      app2.stdout.on('data', (d) => (out2 += d))
      app2.stderr.on('data', (d) => (out2 += d))
      const client2 = makeClient(port)
      const dl = Date.now() + 45000
      for (;;) {
        try {
          await client2.rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-edit-vm-matrix-reboot', version: '0.2.0' } })
          break
        } catch (err) {
          if (app2.exitCode !== null) throw new Error(`reboot app exited early (code ${app2.exitCode}):\n${out2.slice(-1500)}`)
          if (Date.now() > dl) throw new Error(`reboot MCP not reachable: ${err.message}`)
          await sleep(500)
        }
      }
      const snap2Text = async () => await client2.callTool('autoui_snapshot', {})
      const state2Text = async () => (await client2.callTool('autoui_state', {})).trim()
      const press2 = async (label, { exact = false, timeoutMs = 8000 } = {}) => {
        const dl2 = Date.now() + timeoutMs
        for (;;) {
          const t = parseAura(await snap2Text())
          const btn = findFirst(t, (n) => n.head.startsWith('button ') && elementIdOf(n) && (exact ? ownText(n) === label : ownText(n) === label || ownText(n).endsWith(label)))
          if (btn) {
            const res = await client2.callTool('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
            if (!/status: ok/.test(res)) throw new Error(`reboot press ${label} not ok: ${res}`)
            return
          }
          if (Date.now() > dl2) throw new Error(`reboot button "${label}" not found`)
          await sleep(300)
        }
      }
      const poll2 = async (pred, label, timeoutMs = 8000) => {
        const dl2 = Date.now() + timeoutMs
        for (;;) {
          const ok = await pred()
          if (ok) return
          if (Date.now() > dl2) throw new Error(`reboot poll timeout: ${label}`)
          await sleep(300)
        }
      }
      return { app2, snap2Text, state2Text, press2, poll2, call2: (name, args) => client2.callTool(name, args) }
    }
    const boot2 = await bootAgain()
    try {
      const { snap2Text, state2Text, press2, poll2, call2 } = boot2
      await poll2(async () => /status:\s*"?ready"?/.test(await state2Text()), 'boot ready', 30000)
      // ⑩b 载入态：state 清单逐行 = 磁盘逐行（真值 = check 9 退出时磁盘
      // 件——12/13 组 rename/move/daily/deep 触点在 ⑨ 弧后仍会改写清单，
      // 硬编码 RecCap 面不成立；不变式 = 重启读盘 = 退出时落盘）。
      let loadedRows = []
      await poll2(async () => {
        const m = (await state2Text()).match(/recent_paths:\s*\[([^\]]*)\]/)
        if (!m) return false
        loadedRows = m[1].split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter((s) => s !== '')
        return loadedRows.length > 0
      }, 'recent_paths loaded (non-empty state)', 10000)
      const diskRows2 = fs.readFileSync(path.join(FIXTURE, '.jade', 'recents.txt'), 'utf8').split('\n').filter((l) => l !== '')
      const reloadRowsOk = loadedRows.length > 0 && JSON.stringify(loadedRows) === JSON.stringify(diskRows2)
      if (!reloadRowsOk) throw new Error(`⑩b 载入态逐行失守 loaded=${JSON.stringify(loadedRows)} disk=${JSON.stringify(diskRows2)}`)
      // 载入态快开：「最近」段渲染（RecCap*.ad 同文树行在——段标题为唯
      // 一判别面；行序面 = state 清单已逐行锁）。**PLAN-038 弹层面**：
      // 关层 = 弹层标题锚取消钮（D-29③ 族——闭态 alert-dialog 取消钮居
      // 前，全树首「取消」误中）。
      await press2('视图')
      await press2('快速打开')
      await poll2(async () => (await snap2Text()).includes('最近'), '「最近」段渲染（载入态）')
      {
        let btn = null
        for (let i = 0; i < 10 && !btn; i++) {
          const t = parseAura(await snap2Text())
          const title = findFirst(t, (n) => ownText(n) === '快速打开' && !n.head.startsWith('button '))
          const header = title ? findParent(t, title) : null
          const content = header ? findParent(t, header) : null
          btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '取消') : null
          if (!btn) await sleep(300)
        }
        if (!btn) throw new Error('quick cancel button not found（⑩b）')
        const res = await call2('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
        if (!/status: ok/.test(res)) throw new Error(`⑩b quick cancel not ok: ${res}`)
      }
      await poll2(async () => /quick_open:\s*false/.test(await state2Text()), 'quick dialog closed')
      // ⑩c 防线案：201 页微语料（P≤200 安全线 +1——阈值 >200 直证）。
      for (let i = 1; i <= 201; i++) fs.writeFileSync(path.join(FIXTURE, `WarnFill${i}.ad`), `# WarnFill${i}\n\n`, 'utf8')
      await press2('今日笔记')
      const WARN_TEXT = '工作区超 200 页（上游 VM 上限）——索引可能不稳定'
      await poll2(async () => (await state2Text()).includes(`ws_warn: "${WARN_TEXT}"`), 'ws_warn 警示文案（201 页）', 15000)
      // 警示窗内功能零影响：快开 files 面板照常开合（纯显示面——收集面
      // 语义由 recents 替换态承载，警示不拦截任何路径）。
      await press2('视图')
      await press2('快速打开')
      await poll2(async () => (await snap2Text()).includes('最近'), '警示窗内快开可用')
      {
        let btn = null
        for (let i = 0; i < 10 && !btn; i++) {
          const t = parseAura(await snap2Text())
          const title = findFirst(t, (n) => ownText(n) === '快速打开' && !n.head.startsWith('button '))
          const header = title ? findParent(t, title) : null
          const content = header ? findParent(t, header) : null
          btn = content ? findFirst(content, (n) => n.head.startsWith('button ') && elementIdOf(n) && ownText(n) === '取消') : null
          if (!btn) await sleep(300)
        }
        if (!btn) throw new Error('quick cancel button not found（⑩c）')
        const res = await call2('autoui_action', { element_id: elementIdOf(btn), action: 'press' })
        if (!/status: ok/.test(res)) throw new Error(`⑩c quick cancel not ok: ${res}`)
      }
      await poll2(async () => /quick_open:\s*false/.test(await state2Text()), 'quick dialog closed (warn window)')
      // 清料回归：删 201 件 → ActDaily 再刷 → 零警示。
      for (let i = 1; i <= 201; i++) fs.rmSync(path.join(FIXTURE, `WarnFill${i}.ad`), { force: true })
      await press2('今日笔记')
      await poll2(async () => /ws_warn:\s*""/.test(await state2Text()), 'ws_warn 清空回归（零警示）', 15000)
      console.log('  [⑩b/⑩c] PASS — 重启载入弧（recent_paths state 逐行=check 9 退出时磁盘逐行+「最近」段渲染——Init 载入半真弧）+ 防线案（201 页警示文案+警示窗内快开可用[纯显示面零功能影响]+清料零警示回归）')
    } finally {
      try { execFileSync('taskkill', ['/PID', String(boot2.app2.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
      await sleep(400)
    }
  } finally {
    await kill()
  }

  return results
}

// ---------------- run ----------------
const arms = ARM === 'all' ? ['merged', 'split'] : [ARM]
const all = []
let failed = 0
for (const [idx, arm] of arms.entries()) {
  const port = 9381 + idx * 2
  const results = await runArm(arm, port)
  all.push({ arm, results })
  failed += results.filter((r) => !r.ok).length
}
for (const { arm, results } of all) {
  const pass = results.filter((r) => r.ok).length
  console.log(`[matrix:${arm}] ${pass}/${results.length} checks passed`)
}
if (failed > 0) process.exitCode = 1
if (all.every(({ results }) => results.every((r) => r.ok))) {
  console.log(`[matrix] ALL GREEN：${arms.join(' + ')} 臂检查单全过（六检查 + 基线[merged] + E cmd-avail[merged] + tab/editops/link/create/find/rename/file/meta 扩单 + quit）`)
}
