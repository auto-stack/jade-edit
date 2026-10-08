# wiki-link-navigation — 正文内链导航（PLAN-036 Vue 片 · R-03b2；PLAN-037 原生 merged 片 · R-03b3）

> 状态：**功能接线规范**——Vue 正文 `[[页面]]` / `[[别名#锚点]]` 点击经现行四级解析打开正确页面的完整应用链：事件消费、单目标只读解析、导航时序与来源/世代门、缺页确认、失败终态与锚点边界。
> 范围：Vue 载体与 **VM 原生 merged 载体**正文导航（PLAN-037 交付——上游供给链 auto-lang PLAN-732/737/739：wikilink attr 语义消费/合成通道派发/输入补丁摘臂；merged 生产真实点击经 `on "open-wiki-link"` 直达本规范全门，native split 状态单列 [editor-host-capabilities](editor-host-capabilities.md) §1.3）。caret/reveal 定位、保存事件、命令桥仍为供给缺口（§3/§4 维持分列）；简称 `onopenwikilink` 简写已由上游绑定支持（便利形态），导航主链消费完整事件名。
> 证据：[036-wiki-link-contract.md](../plans/attachments/036-wiki-link-contract.md)（T-01 冻结件+B-1..B-10 执行期定谳）+ `tests/probe_wiki_link_navigation.mjs`（merged/split/形状/运行时四臂）+ `e2e/wiki-link-navigation.spec.ts`（E/U/D/S/M/F/B 八测）。

## 1. 事件与单目标解析（SD-01）

| 面 | 规则 | 证据 |
| --- | --- | --- |
| 事件绑定 | 编辑器块 `on "open-wiki-link": .OpenWikiLink`（完整 kebab 事件名 = 引擎 `emit('open-wiki-link', title, blockId?)`）；双参 handler：第一参 target（引擎已 trim 页面名），第二参 = **目标锚点**（`#` 首现后段 trim）——不是源块身份，不得接保存/判源 | e2e events 三案（英文 stem/中文 stem/带锚）+ 生成面 `@open-wiki-link="OpenWikiLink"` |
| 缺参归一 | 无锚时引擎 emit `undefined`（`undefined == ""` 为 false）——handler 以串接收敛归一：`var rawa str = "" + anchor; if rawa == "undefined" { anc = "" }`；无锚导航零提示且无 `undefined` 字面 | probe E1 + e2e events（无锚零提示断言） |
| 简称对照 | `onopenwikilink` 生成 `@openwikilink`（不匹配引擎 emit 名→零监听）——阴性对照以生成面为准；运行时不同挂载第二编辑器（引擎 wikilink opener 全局单槽 last-mounted-wins，契约 B-1） | probe 形状臂（@openwikilink 发射+kebab 唯一归属全名） |
| 只读解析口 | `POST /api/resolve_wiki_link`（单参 target，body 传参 D-19 免疫）→ 顶层裸数组**恰一行**：命中 `{"target","exists":true,"target_path"}`；正常未命中 `exists:false` + path 空；无效输入（trim 空/跨行）→ `[]`。前端行缺=invalid、行内 exists=false=missing——两者严格区分（invalid 不开建页） | probe B3 十案 + e2e fail（畸形/离线不开确认） |
| 解析语义 | 复用 `collect_ad_pages / page_aliases / resolve_target` 共享四级 resolver（stem 精确→alias 精确→stem casefold→alias casefold，级内 walk 首现）；**目录现读**（不用保存后的 link_index/缓存——未保存来源同面可解析）；title/dtitle 不参与身份；`resolve_wiki_link` 与 `link_index` 已知答案恒等（旧端点语义零变化） | probe M0 六案对读 + B3 dtitle-only（属性名）不拼路径 + split 零写/旧响应字节恒等 |
| 零写边界 | 解析接口只读零写面：不调用 write_wiki/create_page，target 非 filesystem 路径参数——路径/URL 样式字符串仅作 resolver 文字输入，未命中不得读盘/建目录；普通 Markdown 外链不进本路由（零 resolver 请求） | probe split 零写 walk-sha + e2e boundary 外链案 |

## 2. 导航时序、身份与保护（SD-02）

协调 handler（`.OpenWikiLink`）单 owner 拥有全部异步读取；冻结形态见[契约 §2/§3](../plans/attachments/036-wiki-link-contract.md)：

0. **来源先验（原生轨）**：上游回调为结构性 per-instance 绑定（PLAN-732 K-02 冻结——widget 实例持自己的 callback，无 Vue 轨 opener 全局单槽问题）；双同正文实例各发各来源、换内容零冒领由上游 `plan732_dual_instance_isolated_activation` + jade 原生探针 O 组（双实例真实点击）双面承载；载荷双 Str（target/target_anchor，无锚空串）与 Vue 消费逐值同语义。

1. **源票据**：入口第一 await 前同步捕获单次不可变快照——`active_uid / sel_gen / active_key / active_path / active_body`（untitled 源同样有 tab_uid，不要求来源磁盘存在）+ App 侧递增请求号 `nav_seq`。
2. **每等待期门**：解析（resolve_wiki_link）与读盘（read_wiki）两个等待窗各自之后、最终提交前五查——请求号 + uid + gen + key + body；任一失配即终止（`stale-after-resolve` / `stale-after-read`），**零激活零建 tab 零提示回写**。迟到拒绝不区分原因写面（旧结果不覆盖任何状态）。
3. **活动选择世代**：`sel_gen` 于 TabActivate 递增、切档往返（A→B→A）不回退——仅字段相同的旧票据不复活（世代门是独立判据，不可用字段比较替代）。
4. **同步提交门**：最终提交 = `store.NavCommit(map)` 同步 msg——store 以权威态重查来源身份与世代（身份权威单点）；通过 = 目标已开转**激活现有内存页**（零读盘零覆盖 dirty——内存脏目标优先）/ 未开按票据已读正文构造新 tab（Open 全字段同构：tab_seq、草稿五字段、recover 三字段、tab_uid、lc_review）；拒绝 = 零 tab 变化零激活。
5. **成功副作用**：只有真实提交成功（同步回执 active_path==目标）才写最近文件（push_recent+持久化）、重算反链/出链行、刷新提及——刷新用成功目标 path 显式入参；失败/过期零副作用。
6. **源保护**：导航不 Save/Reload 源页、不清 dirty、不改 original_body、不结算草稿；在途草稿检查点继续正常排水。e2e U 组直证：脏源导航后源内存 body/dirty 保持、磁盘字节不变、草稿已保护账面存续。

## 3. 缺页、错误与锚点（SD-03）

| 面 | 规则 | 证据 |
| --- | --- | --- |
| 正常 missing → 既有确认 | 票据复检有效才开 `store.CreateConfirmOpen`（复用悬空建页确认弹层与路径预览），**零 create_page 调用**；确认票据（uid/gen/key/body+锚点）入 App `navc_*` | e2e missing M1（弹层+预览可见） |
| 取消零建页 | 取消/ESC 只关确认——页面集合与字节不变、零 tab | e2e missing M1/M3（fs 断言 absent） |
| 确认创建 | 有效票据消费后走既有 CreateGo 建页流（create_page 清洗/幂等/根落位全套——已存在页不覆盖）；**确认期来源失效（防御门）→ 拒绝旧确认提交**：关确认+独立提示「页面创建确认已过期——请重新点击链接」+零 create_page。vue 模态确认期 UI 不可切档——该门为防御性不变式，运行直派证据归 vm 矩阵（MCP 词表无 msg dispatch，直派不可达如实分列） | e2e missing M2/M3 + 门代码生成面；防御门直派不可达=B 族仪器边界 |
| 创建后开页单口 | nav 来源创建成功后开页统一走 NavCommit 单口（read_wiki→fresh 票据→提交；读失败回落 OpenLink）——OpenLink 的 store.Open await 窗与 NavCommit 构造并行会双建 tab（§5.2③ 创建流特化，契约 B-9） | e2e missing M2/M4（恰一 tab） |
| 建页口隔离 | 面板来源确认入口（CreateClick）清导航确认旗标——面板确认永不被旧导航票据门染（ESC 关闭不派发取消的泄漏面封死，契约 B-10） | e2e missing M3（ESC 后流程可用） |
| 错误独立可见 | 独立提示字段 `wiki_nav_note`（状态栏天蓝行）——不占 save_note、不覆盖草稿注记；解析失败「链接解析失败，请重试」/读盘失败「页面读取失败，请重试」；再次点击即新请求（旧错误不覆盖新成功——成功清提示）；错误绝不当 missing 开确认 | e2e fail 三案 + boundary save_note 分域并存 |
| 锚点边界 | 锚点非空：真实开页提交成功后显示「已打开页面，暂不支持定位到锚点：<anchor>」（确认创建后同享）；无锚成功清提示；**开页≠reveal**——零定位调用、不宣称块选择/caret 移动 | e2e events E3 + missing M4 + boundary B2 |
| 迟到反例全谱 | 解析/读盘两等待窗：切档、A→B→A（仅世代不同）、关闭重开同 path、源新输入、逆序双点击——旧结果零激活零建 tab 零提示 | e2e stale 六案 + probe 运行时 S1–S4 |

## 4. 不变量与验证

- 不变量：导航前后源页 body/dirty/doc_id/draft_erev 磁盘字节恒定；目标已开 dirty 实例激活后内存正文不被磁盘覆盖；最近文件只在真实成功后变化；save_note/草稿注记与 wiki_nav_note 互不覆盖。
- 原生 merged 交付证据（PLAN-037）：真实左键完整点击（生产 core.handle_input 完整点击门）英文/中文/别名/带锚四链接导航正确目标、拖选/press-only/非链接/围栏零激活、双实例来源隔离、缺页确认取消/创建真建页——`tests/probe_native_wiki_link.mjs`（指纹/N 真实点击/O origin/P 保护/M 缺页五臂；N/O/P/M 各臂全绿在案）。
- 已知边界（如实分列，不因本片宣称消失）：引擎无输入期 wikilink 解析（键入 `[[` 保持字面——链接仅加载期解析，untitled 源带链接点击导航结构性不可达，契约 B-6）；空编辑器渲染零块无 caret 目标（B-7）；块底 boundary 命中区遮挡单行链接段中心点（B-8）；caret/reveal 供给维持缺口；原生 split 载体的链接消费未联验（单列 editor-host-capabilities §1.3）；native merged 的等待窗迟到族无真实异步窗（消费同步，036 vue S 组+上游语料承载）。
- 可重跑：`node tests/probe_wiki_link_navigation.mjs`（四臂全案）；`pnpm exec playwright test -c e2e/playwright.config.ts e2e/wiki-link-navigation.spec.ts`（八测单跑）。
- 历史证据不改写：034 的「链接缺供给」与 035 的入口收口记录维持其时点结论；本片消费面以本规范为准。
