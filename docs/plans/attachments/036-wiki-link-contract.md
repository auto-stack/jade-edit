# 036-wiki-link-contract — Vue 正文内链导航·有界协议原型冻结件（PLAN-036 T-01）

> 状态：**T-01 冻结件**——冻结导航协调形态（源票据／活动选择世代／每等待期门／Store 同步提交）、缺参归一化、调试配方与执行期定谳边界；T-02..T-04 实施与回归以本件为准，偏离须在计划 §9 记录证据。
> 原型载体：`tests/probe_wiki_link_navigation.mjs`（探针工程 + merged/split/形状/vue 运行时五臂，全案 36 断言三连绿）。上游依据：[上游依赖复核](../../analysis/2026-10-02-upstream-dependency-audit.md) §3（隔离点击）+ [editor-host-capabilities](../../specs/editor-host-capabilities.md) §1.3/§2.4。
> 原型边界：解析 = 内联 page_names 四级（T-02 换 `resolve_wiki_link` 单参后零形态变化）；缺页 = 计数终止（确认流归 T-04）；tab 模型 = 最小 `{uid,key,path,body}`（生产构造字段归 T-03 与 Open 同构）。

## 1. 事件与缺参归一（SD-01 冻结）

- 绑定形态（生产 = App 编辑器块）：`on "open-wiki-link": .OpenWikiLink`；handler 双参 `OpenWikiLink(str, str)`——第一参 target（引擎已 trim 页面名），第二参 = **目标锚点**（`render-node.ts` 首个 `#` 后段 trim；不是源块身份，不能接保存）。
- 生成面（实测）：`@open-wiki-link="NavStart"`（匹配 EngineEditor `emit('open-wiki-link', title, blockId)`）；简称 `onopenwikilink` 生成 `@openwikilink=`（不匹配 emit 名——阴性对照在案，简称兼容修复归 auto-lang，不阻塞本片）。
- **缺参归一（冻结实现）**：引擎无锚 emit `undefined`（`raw.indexOf('#') < 0` 臂）。JS 语义下 `undefined == ""` 为 false，直用空等判失效——归一化必须串接收敛：

```auto
var rawa str = "" + anchor
var anc str = rawa
if rawa == "undefined" {
    anc = ""
}
```

  运行时实测：无锚真实点击后 `nav_last_anchor == ""`（非 `"undefined"` 字面）；带锚 `[[Tgt#sec1]]` → `anchor == "sec1"`。若上游未来原生归一 `""`，本形态恒等收敛。
- handler 派发恰一次（`nav_starts == 1`/点击）；零 pageerror。

## 2. 协调 handler 冻结形态（SD-02；T-03 生产同构）

单协调 handler 拥有全部异步读取；入口同步捕获**单次不可变源票据**，两级等待窗各自过门，最终**同步**提交：

```auto
.NavStart(target, anchor) -> {
    .nav_starts = .nav_starts + 1
    .nav_seq = .nav_seq + 1
    var myseq int = .nav_seq
    // 缺参归一（§1）
    // 源票据（第一 await 前同步捕获）
    var t_uid int = .store.active_uid
    var t_gen int = .store.sel_gen        // 活动选择世代
    var t_key str = .store.active_key
    var t_path str = .store.active_path
    var t_body str = .store.active_body
    // —— 等待窗①：解析（T-02 起 = resolve_wiki_link 单参 POST）——
    // 门前判定：tp == "" → missing 终态（T-04 确认流）；解析异常 → 独立错误
    // —— 门①（解析后）：seq + uid + gen + key + body 五查，败 → stale-after-resolve
    // —— tp == t_path → 同步激活自身（零读盘）
    // —— 等待窗②：read_wiki(tp)（只读；异常 → 独立错误非 missing）
    // —— 门②（读盘后、提交前）：同五查，败 → stale-after-read
    // —— 同步提交：store.NavCommit({ uid, gen, key, body, path, anchor, body2 })
}
```

- **活动选择世代（sel_gen）**：Store 在 TabActivate/构造时递增，切档往返（A→B→A）不回退。S4 实测定谳：往返后 uid/key/body 与票据全同、仅 gen 不同即拒绝——世代门是不可省略的独立判据（仅字段比较会复活旧票据）。
- 请求号（nav_seq）归 App 协调 handler；身份/世代门在 Store 同步提交内**重查**（身份权威单点；vue 臂 App 读与 store 派发同微任务，重查为结构性不变式非竞态补丁）。

## 3. Store 同步提交门冻结形态（T-03 = NavCommit 同构，字段与 Open 同构）

```auto
.NavCommit(a) -> {
    // 同步重查：a.uid == .active_uid && a.gen == .sel_gen && a.key == .active_key && a.body == .active_body
    // 通过 = 目标已开转激活（零读盘零覆盖 dirty）/ 未开按票据已读正文构造（零二次 I/O）
    // 拒绝 = 零 tab 变化零激活（commit_rejects 计数）
}
```

- 阴性对照实测：陈旧票据直派（uid/gen/key/body 全不匹配）→ rejects=1、零 tab 零激活（merged 臂 M6）。
- **T-03 义务**：生产构造段沿用 `store.Open` 的完整 tab 字段形（tab_seq、doc_id/draft_erev/draft_state/draft_seq/draft_conf、recover_src_*、tab_uid、lc_review 全套缺省）——原型最小 `{uid,key,path,body}` 仅为观察面，不得照抄。

## 4. 执行期定谳边界（T-02/T-03/T-05 设计约束）

| # | 定谳 | 证据 | 消费方 |
| --- | --- | --- | --- |
| B-1 | **引擎 wikilink opener = 全局单槽（last-mounted-wins）**——`registerWikilinkOpener` seam，后挂载编辑器获胜；双编辑器同时挂载时点击全局路由到后挂载实例 | EngineEditor.vue `registerWikilinkOpener(wikilinkOpener)` + 探针双编辑器点击零达 handler | T-03：生产恒单编辑器实例（活动 tab 唯一）兼容；禁止同屏第二 autodown_editor 消费链接事件；运行时简称阴性不可行，简称对照以形状臂（生成面）为准 |
| B-2 | **未聚焦编辑器的首块 wikilink 点击被吞**（不达应用 handler）；聚焦后任意块可达；非首块未聚焦也可达 | 变体 K（第二段）过 / L（首段）败 / M（聚焦后首段）过 | T-03/T-05：e2e 语料与断言链接一律置非首块（fixture index.ad 链接在后续块，天然合规）；上游边界如实记录（owner=auto-down），不在本片修 |
| B-3 | **content prop 回写回声**：store 直改 body → 编辑器 `:content` 变更 → 引擎 replaceDoc 规范化回声 `update:modelValue`（plan-030 D-03 家族，实测恰补一尾 `\n`）；纯链接点击零回声（edit_count=0 实证） | 探针 S3 after_tail 实录 + echo 变体 edit_count 观察 | T-03：生产导航流不回写源 content，无此回声面；凡程序化 content 回写处（open/reload/lc-sync）沿用 reload_nonce key 重挂载在册形态；探针 S3 断言容忍恰一尾 `\n` |
| B-4 | **pickPort 假阳性**（F-R8-1/F-R13-1 家族新形态）：本机客户端出站连接占用 LAN 接口临时端口（192.168.68.6:8221 ESTABLISHED），`127.0.0.1` 绑定测试通过而 AutoVM 的 `0.0.0.0` 绑定撞 os error 10048——serve-back 子进程「exit 0 静默退」即此 | 探针 split 臂失败实录 + 复现脚本 `Backend API server port: 8221 (from cli)` + `Async server bind failed` | tests/pick_port.mjs 缺省改绑 `0.0.0.0`（严格强于 127.0.0.1）——已修；e2e 固定 8211 若同族占用属独立环境项 |
| B-5 | 探针状态列跨 span 读存在瞬时不同步窗（active_path 先于 commit_count 可见一拍）；单 store 同步提交语义不变 | E1 读数竞态实录（commits=0 与 active=Tgt.ad 同帧）+ E2 联合等待后恒一致 | 探针用 waitStatusAll 联合等待（多 span 落定后读）；生产无此读面（无逐帧断言） |

## 5. 四级解析与已知答案（T-02 义务基线）

- back 面（link_index GET，merged 直调 + split HTTP 双臂逐案一致）：`[[靶心]]`→Tgt.ad（alias 精确）、`[[Tgt]]`→Tgt.ad（stem 精确）、`[[tgt]]`→Tgt.ad（stem casefold）、`[[中文页]]`→中文页.ad（CJK stem）、`[[便签]]`→Note.ad（alias）、`[[缺失页]]`→""（悬空）、`[[Tgt#sec1]]`→Tgt.ad+anchor=sec1。
- 内联 resolver（原型）与 back 产物六案逐对 match（M0 / E0 双臂见证）；title/dtitle 不参与身份。
- **T-02**：新增 `resolve_wiki_link(target) → wsys.resolve_wiki_link_json`（POST 单参、顶层裸数组一行、`exists`/`target_path` 与错误严格区分）后，本探针 R 组案换装单参接口（追加于 split 臂 T-02 扩展点），解析语义零变化。

## 6. 运行配方与指纹（复现绑定）

```text
node tests/probe_wiki_link_navigation.mjs            # 全臂（缺省）
node tests/probe_wiki_link_navigation.mjs --phase backend   # 指纹+merged+split+形状
node tests/probe_wiki_link_navigation.mjs --phase runtime   # vue 运行时（真实点击+延迟反例）
```

- 指纹（三连绿时点）：auto.exe `auto 0.1.0+v0.4.2-2573-g982e80004-dirty`（SHA256 `D63B3DDC…70B19B`）；auto-lang HEAD `31192447223d66c29c1abf9ae06ef8a6dc229c3b`（外部 WIP 在录——binary 恒等证据链同 035 F-35-R1 口径）；auto-down HEAD `895f8d0f…`；engine dist `index.js` SHA256 `AE6CCD56…A640`（assert-dist-fresh 在册义务延续）；jade-edit `9baa301b…`。
- 延迟反例配方：Playwright `page.route('**/api/page_names', …)` 单次延迟消费旗标（2000–3000ms）——T-03 生产 e2e 同配方拦 `**/api/resolve_wiki_link` 与 `**/api/read_wiki` 两等待窗。
- 断言面：merged 臂 M0–M6（协调形态同步全流程 + 世代门 + 陈旧直派阴性）；split 臂 B1–B2（双臂已知答案 + page_names 行集）；形状臂 6 项（全名/简称/双参/重建恢复）；运行时臂 E0–E5/S1–S4（真实点击 + 缺参归一 + 四类迟到反例 + 零 pageerror）。合计 36 断言三连绿。

## 7. 失败复测记录（每问题一次原型＋一次复测预算内）

| 问题 | 首原型现象 | 复测定谳 |
| --- | --- | --- |
| split 臂静默退 | serve-back exit 0 无输出 | B-4 根因（0.0.0.0 绑定假阳性）→ pickPort 修复后全绿 |
| split 语料空 | link_index 全 missing | serveBackend 返回时工作区已重置为 fixture——语料改在其后写入（probe_editor_host 同款时序） |
| 运行时点击零达 | nav_starts 恒 0 | 双因：B-1（双编辑器单槽）+ B-2（首块吞点击）——单编辑器 + 语料首块标题化后全绿 |
| E1 读数竞态 | commits=0 与 active=Tgt.ad 同帧 | B-5 → waitStatusAll 联合等待 |
| S3 body 断言 | 尾多一 `\n` | B-3 content 回写回声 → 断言容忍规范化增量（原文字节 + 标记保持口径不变） |
