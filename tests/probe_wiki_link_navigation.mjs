#!/usr/bin/env node
// probe_wiki_link_navigation.mjs — PLAN-036 正文内链导航探针（T-01 有界
// 原型 + T-02 单参解析换装；probe_editor_host.mjs 配方 + 上游审计隔离
// vue 运行时配方〔.am/quoted-link-audit 持久化〕）。
//
//   指纹臂    auto.exe 版本/SHA、auto-lang/auto-down rev、engine dist SHA、
//            auto-jade HEAD——运行时证据绑定。
//   形状臂    探针工程 `auto build -r vue --gen-only` 生成 SFC 绑定形状：
//            完整事件名 `on "open-wiki-link"` → @open-wiki-link（匹配引擎
//            emit 名）；简称 `onopenwikilink` → @openwikilink（不匹配——
//            阴性对照）；双参 handler 保留。
//   merged 臂  探针工程 `auto run -r vm` + MCP：协调 handler（NavStart）
//            同步全流程——源票据捕获/活动选择世代/四级解析已知答案
//            （link_index vs resolve_wiki_link 逐案对读——T-02 生产解析
//            口）/每等待期门/Store 同步提交门（含陈旧票据直派阴性对照）
//            /无效输入 resolve-invalid 独立终态。
//   split 臂   serve-back HTTP：link_index 四级已知答案 + resolve_wiki_link
//            单参案（裸数组协议/missing 行/无效 []/dtitle-only 不拼路径/
//            零写面/旧 link_index 响应字节恒等）。
//   runtime 臂 隔离 Vite 挂载生成组件（engine dist 指向真实 dist）+
//            Playwright 真实 .autodown-wikilink-label 点击 + /api 路由
//            拦截延迟：E 组（真实点击/缺参归一/一次触发）+
//            S 组原型级迟到反例（切档/A→B→A/迟到输入/逆序双点击——
//            延迟窗 = resolve_wiki_link POST）。
//
// 原型边界：缺页 = missing/invalid 计数终止（确认流归 T-04）；tab 模型 =
// 最小 {uid,key,path,body}（生产构造字段归 T-03 与 Open 同构）；正文导航
// 生产接线 = T-03（app.at 事件 + editor_store.at NavCommit），本探针工程
// 即其冻结形态可执行样张。
//
// 结果标签：PASS（预期且实测相符）/ FAIL（意外——计失败）/ BLOCKED
// （载体阻断——owner/重入条件在案）。
//
// 用法（仓根）：node tests/probe_wiki_link_navigation.mjs [--phase all]

import { spawn, execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const ENGINE_ROOT = process.env.AUTO_JADE_ENGINE_ROOT ?? 'D:/autostack/auto-down/autodown/packages/engine'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-wiki-link')
const MERGED_WS = path.join(RUNTIME, 'probe-wiki-link-ws')
const SPLIT_WS = path.join(RUNTIME, 'probe-wiki-link-ws-split')
const MERGED_PORT = 9377
const SPLIT_PORT = await pickPort()

const argOf = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const PHASE = argOf('--phase') ?? 'all'
const RUN_BACKEND = PHASE === 'all' || PHASE === 'backend'
const RUN_RUNTIME = PHASE === 'all' || PHASE === 'runtime'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase()

// ---------------- 语料 ----------------
// Tgt 别名两级 + Note 别名一级 + 中文页 CJK stem + Other 旁档 + Src 链接面。
// ⚠ Src 首块 = 标题（T-01 执行期定谳：未聚焦编辑器的**首块** wikilink 点击
// 被引擎吞掉不达应用 handler——聚焦后任意块可达；链接一律置非首块，
// 上游边界记录归契约附件）。
const CORPUS = {
  'Tgt.ad': '---\naliases:\n- 靶心\n- 目标页\n---\n\n# Tgt\n\n别名目标正文。\n',
  'Note.ad': '---\naliases:\n- 便签\n---\n\n# Note\n\n便签正文。\n',
  'Attr.ad': '---\ntitle: 属性名\n---\n\n# Attr\n\n标题域正文。\n',
  '中文页.ad': '# 中文页\n\n中文正文。\n',
  'Other.ad': '# Other\n\n旁档正文。\n',
  'Src.ad': '# 源页\n\n见 [[靶心]] 与 [[Tgt#sec1]] 与 [[tgt]] 与 [[中文页]] 与 [[便签]] 与 [[缺失页]] 一处。\n\n尾部段落。\n',
}

function writeCorpus(ws) {
  fs.mkdirSync(ws, { recursive: true })
  for (const [rel, body] of Object.entries(CORPUS)) {
    fs.writeFileSync(path.join(ws, rel), body, 'utf8')
  }
}

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  writeCorpus(ws)
}

// ---------------- 探针工程生成 ----------------
// 嵌入语料正文（.at 字面量转义：反斜杠/引号/换行）。
const atLit = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')

function makeStoreAt() {
  return `// nav 原型 store（tests/probe_wiki_link_navigation.mjs 生成件——
// T-01 有界原型：最小 tab 模型 {uid,key,path,body} + 活动选择世代 +
// NavCommit 同步门。生产构造字段（草稿/lc_review 族）归 T-03 与 Open 同构）。
use back.api: read_wiki

store EditorStore {
    model {
        var tabs Array<str> = []
        var tab int = -1
        var tab_count int = 0
        var active_uid int = 0
        var active_path str = ""
        var active_key str = ""
        var active_body str = ""
        // 活动选择世代：TabActivate/构造递增——切档往返（A→B→A）后代次
        // 不回退，仅字段相同的旧票据不复活（§5.2②）。
        var sel_gen int = 0
        var tab_seq int = 0
        // 同步提交观察面：成功/拒绝计数 + 末次提交 path#anchor。
        var commit_count int = 0
        var commit_rejects int = 0
        var commit_last str = ""
    }

    msg {
        TabActivate(int), ProtoOpen(map), ProtoGoto(str), ProtoType(str),
        ProtoEdit(str), NavCommit(map),
    }

    on {
        .TabActivate(i) -> {
            .tab_count = .tabs.len()
            .tab = i
            .active_uid = .tabs[i].uid
            .active_path = .tabs[i].path
            .active_key = .tabs[i].key
            .active_body = .tabs[i].body
            .sel_gen = .sel_gen + 1
        }

        // ---- 原型开档：已开即激活；否则读盘构造（Init 播种/调试口——
        // 非导航口；导航唯一口 = NavCommit 同步门）。----
        .ProtoOpen(a) -> {
            var path = a.path
            var found int = -1
            var i int = 0
            while i < .tabs.len() {
                var tp str = .tabs[i].path
                if tp == path {
                    found = i
                }
                i = i + 1
            }
            if found < 0 {
                var body str = ""
                var ok bool = true
                try {
                    body = read_wiki(path)
                } catch (e) {
                    ok = false
                }
                if ok {
                    .tab_seq = .tab_seq + 1
                    .tabs.push({ uid: .tab_seq, key: path, path: path, body: body })
                    found = .tabs.len() - 1
                }
            }
            if found >= 0 {
                store.TabActivate(found)
            }
        }

        // ---- 仅激活已开档（调试切档口——世代递增可见面）----
        .ProtoGoto(path) -> {
            var found int = -1
            var i int = 0
            while i < .tabs.len() {
                var tp str = .tabs[i].path
                if tp == path {
                    found = i
                }
                i = i + 1
            }
            if found >= 0 {
                store.TabActivate(found)
            }
        }

        // ---- 等待期新输入模拟（追加标记——源票据 body 失效面）----
        .ProtoType(text) -> {
            if .tab >= 0 {
                .tabs[.tab].body = .tabs[.tab].body + text
                .active_body = .tabs[.tab].body
            }
        }

        // ---- 编辑回写（oninput 全文——源票据 body 失效面同源）----
        .ProtoEdit(text) -> {
            if .tab >= 0 {
                .tabs[.tab].body = text
                .active_body = text
            }
        }

        // ---- 导航同步提交门（T-01 冻结形态；生产=T-03 NavCommit 同构）：
        // App 协调 handler 已过每等待期门（请求号+来源），本门以 store
        // 权威态**同步**重查来源身份与选择世代（身份权威单点——vue 臂
        // App 读与 store 派发同微任务，重查为结构性不变式非竞态补丁）；
        // 通过 = 目标已开转激活 / 未开按票据已读正文构造（零二次 I/O）；
        // 拒绝 = 零 tab 变化零激活。----
        .NavCommit(a) -> {
            var ok bool = true
            if a.uid != .active_uid {
                ok = false
            }
            if a.gen != .sel_gen {
                ok = false
            }
            if a.key != .active_key {
                ok = false
            }
            if a.body != .active_body {
                ok = false
            }
            if ok {
                var path str = a.path
                var found int = -1
                var i int = 0
                while i < .tabs.len() {
                    var tp str = .tabs[i].path
                    if tp == path {
                        found = i
                    }
                    i = i + 1
                }
                if found < 0 {
                    .tab_seq = .tab_seq + 1
                    .tabs.push({ uid: .tab_seq, key: path, path: path, body: a.body2 })
                    found = .tabs.len() - 1
                }
                store.TabActivate(found)
                .commit_count = .commit_count + 1
                .commit_last = path + "#" + a.anchor
            } else {
                .commit_rejects = .commit_rejects + 1
            }
        }
    }
}
`
}

function makeAppAt() {
  return `// 探针 widget（tests/probe_wiki_link_navigation.mjs 生成件——直证后随
// .runtime 再生，非入库源）。完整事件名 on "open-wiki-link" 双参 handler
// （真实引擎 emit 名 open-wiki-link——第二参 = 目标锚点，可 undefined）+
// 简称 onopenwikilink 阴性对照编辑器 + 协调 handler NavStart（源票据/
// 请求号/每等待期门/同步提交单 owner）+ 调试直派钮（merged 臂驱动面）。
use editor_store: EditorStore
use back.api: write_wiki, read_wiki, link_index, resolve_wiki_link

/// int 观察面 → 状态列文本（视图裸 computed text 节点委托——D-33② 在册
/// 唯一形态：单函数调用；视图位零 .str() 直排实勘缺口规避）。
fn s_of(n int) str {
    return n.str()
}

/// link_index Src.ad 出链行 target→target_path 摘取（back 已知答案面）。
fn back_path_of(pages List, target str) str {
    var hit str = ""
    var i int = 0
    while i < pages.len() {
        var p = pages[i]
        var pp str = p.path
        if pp == "Src.ad" {
            var links List = p.links
            var k int = 0
            while k < links.len() {
                var ln = links[k]
                var tg str = ln.target
                if tg == target {
                    var tp str = ln.target_path
                    hit = tp
                }
                k = k + 1
            }
        }
        i = i + 1
    }
    return hit
}

widget App {
    msg {
        Init,
        NavStart(str, str),
        NavAlias, NavAnchor, NavCase, NavCjk, NavMiss, NavInvalid,
        GotoSrc, GotoOther, DebugType, DebugStale,
        Edit(str),
    }
    model {
        var boot str = "booting"
        // —— 四级已知答案对读（back link_index vs resolve_wiki_link）——
        var lk_check str = ""
        var lk_back str = ""
        var lk_resolve str = ""
        // —— 导航协调观察面 ——
        var nav_starts int = 0
        var nav_seq int = 0
        var nav_last_target str = ""
        var nav_last_anchor str = ""
        var nav_ticket str = ""
        var nav_reject str = "none"
        var nav_missing int = 0
        var nav_invalid int = 0
    }
    computed {
        s_starts => s_of(.nav_starts)
        s_seq => s_of(.nav_seq)
        s_missing => s_of(.nav_missing)
        s_commits => s_of(.store.commit_count)
        s_rejects => s_of(.store.commit_rejects)
        s_tabs => s_of(.store.tab_count)
        s_uid => s_of(.store.active_uid)
    }
    view {
        col (style: "h-full w-full") {
            row (style: "h-8 items-center gap-1 shrink-0 px-1") {
                button (text: "导航别名", variant: "ghost") { onclick: .NavAlias, style: "h-6 px-2 text-[11px]" }
                button (text: "导航带锚", variant: "ghost") { onclick: .NavAnchor, style: "h-6 px-2 text-[11px]" }
                button (text: "导航大小写", variant: "ghost") { onclick: .NavCase, style: "h-6 px-2 text-[11px]" }
                button (text: "导航中文", variant: "ghost") { onclick: .NavCjk, style: "h-6 px-2 text-[11px]" }
                button (text: "导航缺失", variant: "ghost") { onclick: .NavMiss, style: "h-6 px-2 text-[11px]" }
                button (text: "导航无效", variant: "ghost") { onclick: .NavInvalid, style: "h-6 px-2 text-[11px]" }
                button (text: "到Src", variant: "ghost") { onclick: .GotoSrc, style: "h-6 px-2 text-[11px]" }
                button (text: "到Other", variant: "ghost") { onclick: .GotoOther, style: "h-6 px-2 text-[11px]" }
                button (text: "键入", variant: "ghost") { onclick: .DebugType, style: "h-6 px-2 text-[11px]" }
                button (text: "陈旧直派", variant: "ghost") { onclick: .DebugStale, style: "h-6 px-2 text-[11px]" }
            }
            // 状态列（runtime 臂按序索引读——顺序冻结）：0 boot / 1 lk_check
            // / 2 starts / 3 seq / 4 target / 5 anchor / 6 ticket / 7 reject
            // / 8 missing / 9 commits / 10 rejects / 11 commit_last / 12 tabs
            // / 13 uid / 14 active_path / 15 active_key / 16 body
            col (style: "shrink-0 px-1 gap-0") {
                text .boot { style: "text-[11px]" }
                text .lk_check { style: "text-[11px]" }
                text .s_starts { style: "text-[11px]" }
                text .s_seq { style: "text-[11px]" }
                text .nav_last_target { style: "text-[11px]" }
                text .nav_last_anchor { style: "text-[11px]" }
                text .nav_ticket { style: "text-[11px]" }
                text .nav_reject { style: "text-[11px]" }
                text .s_missing { style: "text-[11px]" }
                text .s_commits { style: "text-[11px]" }
                text .s_rejects { style: "text-[11px]" }
                text .store.commit_last { style: "text-[11px]" }
                text .s_tabs { style: "text-[11px]" }
                text .s_uid { style: "text-[11px]" }
                text .store.active_path { style: "text-[11px]" }
                text .store.active_key { style: "text-[11px]" }
                text .store.active_body { style: "text-[11px]" }
            }
            // 完整事件名编辑器（真实导航入口——key 随活动档重挂载播种）。
            // ⚠ 引擎 wikilink opener = 全局单槽（last-mounted-wins——
            // EngineEditor registerWikilinkOpener seam）——本探针恒单编辑器
            // 实例（生产同形）；简称对照 = 形状臂生成面（@openwikilink 不匹
            // 配 emit 名），不同时挂载第二编辑器（否则点击全局路由到后挂载
            // 实例——T-01 定谳，见契约附件 §）。
            autodown_editor (key: .store.active_key, final: true, style: "flex-1 w-full") {
                content: .store.active_body
                oninput: .Edit
                on "open-wiki-link": .NavStart
            }
        }
    }
    on {
        .Init -> {
            // 语料播种（幂等——复跑零漂移）
            write_wiki("Tgt.ad", "${atLit(CORPUS['Tgt.ad'])}")
            write_wiki("Note.ad", "${atLit(CORPUS['Note.ad'])}")
            write_wiki("Attr.ad", "${atLit(CORPUS['Attr.ad'])}")
            write_wiki("中文页.ad", "${atLit(CORPUS['中文页.ad'])}")
            write_wiki("Other.ad", "${atLit(CORPUS['Other.ad'])}")
            write_wiki("Src.ad", "${atLit(CORPUS['Src.ad'])}")
            store.ProtoOpen({ path: "Other.ad" })
            store.ProtoOpen({ path: "Src.ad" })
            // —— 四级已知答案对读：back link_index（back resolver 产物）
            // vs resolve_wiki_link 单参口（T-02 共享 resolver 双读恒等见证）
            // ——六案逐对——（⚠ D-20⑤：json.to_value 恒 call-arg 形内联）——
            var pages List = []
            var pok bool = true
            try {
                pages = json.to_value(link_index("", 8))
            } catch (e) {
                pok = false
            }
            if pok {
                var b1 str = back_path_of(pages, "靶心")
                var b2 str = back_path_of(pages, "Tgt")
                var b3 str = back_path_of(pages, "tgt")
                var b4 str = back_path_of(pages, "中文页")
                var b5 str = back_path_of(pages, "便签")
                var b6 str = back_path_of(pages, "缺失页")
                // resolve_wiki_link 单参六案（每案一行裸数组；未命中行
                // exists=false → path 记 ""——与 link_index 悬空行同口径）
                var p1 str = ""
                var p2 str = ""
                var p3 str = ""
                var p4 str = ""
                var p5 str = ""
                var p6 str = ""
                var q1 List = json.to_value(resolve_wiki_link("靶心"))
                if q1.len() >= 1 {
                    var e1r = q1[0]
                    var ex1 bool = e1r.exists
                    if ex1 {
                        p1 = e1r.target_path
                    }
                }
                var q2 List = json.to_value(resolve_wiki_link("Tgt"))
                if q2.len() >= 1 {
                    var e2r = q2[0]
                    var ex2 bool = e2r.exists
                    if ex2 {
                        p2 = e2r.target_path
                    }
                }
                var q3 List = json.to_value(resolve_wiki_link("tgt"))
                if q3.len() >= 1 {
                    var e3r = q3[0]
                    var ex3 bool = e3r.exists
                    if ex3 {
                        p3 = e3r.target_path
                    }
                }
                var q4 List = json.to_value(resolve_wiki_link("中文页"))
                if q4.len() >= 1 {
                    var e4r = q4[0]
                    var ex4 bool = e4r.exists
                    if ex4 {
                        p4 = e4r.target_path
                    }
                }
                var q5 List = json.to_value(resolve_wiki_link("便签"))
                if q5.len() >= 1 {
                    var e5r = q5[0]
                    var ex5 bool = e5r.exists
                    if ex5 {
                        p5 = e5r.target_path
                    }
                }
                var q6 List = json.to_value(resolve_wiki_link("缺失页"))
                if q6.len() >= 1 {
                    var e6r = q6[0]
                    var ex6 bool = e6r.exists
                    if ex6 {
                        p6 = e6r.target_path
                    }
                }
                .lk_back = b1 + "|" + b2 + "|" + b3 + "|" + b4 + "|" + b5 + "|" + b6
                .lk_resolve = p1 + "|" + p2 + "|" + p3 + "|" + p4 + "|" + p5 + "|" + p6
                var same bool = true
                if b1 != p1 { same = false }
                if b2 != p2 { same = false }
                if b3 != p3 { same = false }
                if b4 != p4 { same = false }
                if b5 != p5 { same = false }
                if b6 != p6 { same = false }
                if same {
                    .lk_check = "match"
                } else {
                    .lk_check = "diff"
                }
            } else {
                .lk_check = "links-error"
            }
            .boot = "ready"
        }

        // —— 协调 handler（T-02 起生产形态：等待窗① = resolve_wiki_link
        // 单参 POST——T-01 page_names 内联原型退役，形态零变化；契约 §2）——
        // 入口同步捕获源票据与请求号；两级等待窗（解析/读盘）各自后过门；
        // 最终同步提交（store.NavCommit）。
        .NavStart(target, anchor) -> {
            .nav_starts = .nav_starts + 1
            .nav_seq = .nav_seq + 1
            var myseq int = .nav_seq
            // 缺参归一：引擎无锚 emit undefined（render-node.ts # 缺席臂）
            // ——JS 串接收敛后与字面比较归一（vue 臂可观测；直派恒串）。
            var rawa str = "" + anchor
            var anc str = rawa
            if rawa == "undefined" {
                anc = ""
            }
            // 源票据（第一 await 前同步捕获——单次不可变）
            var t_uid int = .store.active_uid
            var t_gen int = .store.sel_gen
            var t_key str = .store.active_key
            var t_path str = .store.active_path
            var t_body str = .store.active_body
            .nav_last_target = target
            .nav_last_anchor = anc
            .nav_ticket = t_uid.str() + ":" + t_gen.str() + ":" + t_key
            // —— 等待窗①：解析（单参 POST 裸数组——无效 [] 与 missing
            // 行严格区分：行缺 = resolve-invalid 不开建页，AC-08）——
            var res List = []
            var rok bool = true
            try {
                res = json.to_value(resolve_wiki_link(target))
            } catch (e) {
                rok = false
            }
            if !rok {
                .nav_reject = "resolve-error"
            } else {
                if res.len() < 1 {
                    .nav_invalid = .nav_invalid + 1
                    .nav_reject = "resolve-invalid"
                } else {
                    // ⚠ D-20②：行元素先拷局部变量再取字段。
                    var r0 = res[0]
                    var ex bool = r0.exists
                    var tp str = r0.target_path
                    if !ex {
                        tp = ""
                    }
                    if tp == "" {
                        .nav_missing = .nav_missing + 1
                        .nav_reject = "missing"
                    } else {
                    // —— 门①（解析后）：请求号 + 来源身份 + 选择世代 ——
                    var g1 bool = true
                    if .nav_seq != myseq { g1 = false }
                    if .store.active_uid != t_uid { g1 = false }
                    if .store.sel_gen != t_gen { g1 = false }
                    if .store.active_key != t_key { g1 = false }
                    if .store.active_body != t_body { g1 = false }
                    if !g1 {
                        .nav_reject = "stale-after-resolve"
                    } else {
                        if tp == t_path {
                            // 目标 = 源页：同步激活自身（零读盘）
                            store.NavCommit({ uid: t_uid, gen: t_gen, key: t_key, body: t_body, path: tp, anchor: anc, body2: t_body })
                            .nav_reject = "none"
                        } else {
                            // —— 等待窗②：目标读盘（只读）——
                            var body2 str = ""
                            var dok bool = true
                            try {
                                body2 = read_wiki(tp)
                            } catch (e3) {
                                dok = false
                            }
                            if !dok {
                                .nav_reject = "read-error"
                            } else {
                                // —— 门②（读盘后、提交前）——
                                var g2 bool = true
                                if .nav_seq != myseq { g2 = false }
                                if .store.active_uid != t_uid { g2 = false }
                                if .store.sel_gen != t_gen { g2 = false }
                                if .store.active_key != t_key { g2 = false }
                                if .store.active_body != t_body { g2 = false }
                                if !g2 {
                                    .nav_reject = "stale-after-read"
                                } else {
                                    store.NavCommit({ uid: t_uid, gen: t_gen, key: t_key, body: t_body, path: tp, anchor: anc, body2: body2 })
                                    .nav_reject = "none"
                                }
                            }
                        }
                    }
                }
            }
        }
        }

        // —— 调试直派（merged 臂驱动面；runtime 臂真实点击不经此）——
        .NavAlias -> { .NavStart("靶心", "") }
        .NavAnchor -> { .NavStart("靶心", "sec1") }
        .NavCase -> { .NavStart("tgt", "") }
        .NavCjk -> { .NavStart("中文页", "") }
        .NavMiss -> { .NavStart("缺失页", "") }
        .NavInvalid -> { .NavStart("", "") }
        .GotoSrc -> { store.ProtoGoto("Src.ad") }
        .GotoOther -> { store.ProtoGoto("Other.ad") }
        .DebugType -> { store.ProtoType("（迟到输入）") }
        // 同步门阴性对照：陈旧票据直派（uid/gen/key/body 全不匹配）——
        // store 门独立拒绝面（零 tab 变化零激活）。
        .DebugStale -> {
            store.NavCommit({ uid: 999, gen: 999, key: "stale", body: "stale", path: "Note.ad", anchor: "", body2: "stale-body" })
        }

        .Edit(text) -> {
            store.ProtoEdit(text)
        }
    }
}
`
}

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), makeAppAt(), 'utf8')
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'editor_store.at'), makeStoreAt(), 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "auto-jade-probe-wiki-link"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeWikiLinkNav"
window: "1000x800"
`,
    'utf8',
  )
}

// 形状对照专用模板（仅 gen-only 消费——简称 onopenwikilink 的生成面阴性
// 对照。不进主模板：引擎 wikilink opener 全局单槽 last-mounted-wins，
// 双编辑器同时挂载会使点击全局路由到后挂载实例，运行时阴性不可行的
// T-01 定谳——见契约附件）。
function makeShapeAt() {
  return `// 简称生成对照探针（tests/probe_wiki_link_navigation.mjs 生成件——
// 仅形状臂 gen-only；不挂载运行）。
widget App {
    msg {
        NavShort(str, str),
    }
    model {
        var nav_short int = 0
    }
    view {
        col (style: "h-full w-full") {
            autodown_editor (key: "short-probe", final: true, style: "h-24 w-full") {
                content: "简称对照：[[靶心]]"
                onopenwikilink: .NavShort
            }
        }
    }
    on {
        .NavShort(t, a) -> {
            .nav_short = .nav_short + 1
        }
    }
}
`
}

// ---------------- dump 字段捕获 ----------------
const strField = (dump, name) => {
  const raw = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]
  if (raw === undefined) return null
  try { return JSON.parse(`"${raw}"`) } catch { return raw }
}
const intField = (dump, name) => {
  const m = dump.match(new RegExp(`${name}:\\s*(-?\\d+)`))
  return m ? Number(m[1]) : null
}

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
    if (result.isError) {
      const msg = result.content.map((c) => c.text ?? '').join('\n')
      const err = new Error(`tool ${name} failed: ${msg}`)
      err.toolError = true
      throw err
    }
    return result.content.map((c) => c.text ?? '').join('\n')
  }
  return { rpc, callTool }
}

// ---------------- 形状臂 ----------------

// 三步生成：①主模板 gen → 全名形状；②形状对照模板 gen → 简称阴性形状；
// ③主模板重建 gen（运行时臂消费主模板生成树）。返回 rec。
function vueShapeCheck(rec) {
  const genSfc = () => {
    const gen = spawnSync(AUTO_EXE, ['build', '-r', 'vue', '--gen-only'], { cwd: PROBE_DIR, encoding: 'utf8' })
    rec.vue_gen_exit = gen.status
    if (gen.status !== 0) {
      rec.vue_gen_tail = ((gen.stdout ?? '') + (gen.stderr ?? '')).slice(-1500)
      return null
    }
    const sfcPath = path.join(PROBE_DIR, 'gen', 'front', 'vue', 'src', 'App.vue')
    if (!fs.existsSync(sfcPath)) {
      rec.vue_gen_exit = -1
      rec.vue_gen_tail = `generated SFC not found under ${sfcPath}`
      return null
    }
    return fs.readFileSync(sfcPath, 'utf8')
  }

  // ① 主模板：全名形状 + 双参 handler。
  buildProbeProject()
  const mainSfc = genSfc()
  if (mainSfc === null) return rec
  const mainLines = mainSfc.split('\n').filter((l) => /<AutoDownEditor/.test(l))
  rec.vue_editor_lines = mainLines.map((l) => l.trim().slice(0, 300))
  rec.vue_shape = {
    full_name_listener: mainLines.some((l) => /@open-wiki-link="NavStart"/.test(l)),
    two_param_handler: /function NavStart\(target[^)]*,[^)]*anchor[^)]*\)/.test(mainSfc),
  }

  // ② 形状对照模板：简称阴性形状。
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), makeShapeAt(), 'utf8')
  const shortSfc = genSfc()
  if (shortSfc === null) return rec
  const shortLines = shortSfc.split('\n').filter((l) => /<AutoDownEditor/.test(l))
  rec.vue_shape_short = {
    short_name_listener: shortLines.some((l) => /@openwikilink="NavShort"/.test(l)),
    full_name_kebab_absent: !shortLines.some((l) => /@open-wiki-link=/.test(l)),
    short_two_param: /function NavShort\([^)]*,[^)]*\)/.test(shortSfc),
  }

  // ③ 主模板重建（运行时臂消费）。
  buildProbeProject()
  const restoreSfc = genSfc()
  rec.vue_restore_ok = restoreSfc !== null && /@open-wiki-link="NavStart"/.test(restoreSfc)
  return rec
}

// ---------------- merged 臂 ----------------

async function runMergedArm(rec) {
  buildProbeProject()
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: PROBE_DIR,
    env: { ...process.env, AUTOUI_MCP_PORT: String(MERGED_PORT), AUTO_JADE_WORKSPACE: MERGED_WS },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let appOut = ''
  app.stdout.on('data', (d) => (appOut += d))
  app.stderr.on('data', (d) => (appOut += d))
  try {
    const { rpc, callTool } = makeClient(MERGED_PORT)
    const deadline = Date.now() + 45000
    for (;;) {
      try {
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'auto-jade-probe-wiki-link', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-2500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    const statePoll = async (field, want, timeoutMs = 10000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const st = (await callTool('autoui_state', {})).trim()
        const got = intField(st, field) ?? 0
        if (got >= want) return st
        if (Date.now() > dl) throw new Error(`state.${field} never reached ${want} (got ${got})`)
        await sleep(200)
      }
    }
    const stateEqPoll = async (field, want, timeoutMs = 10000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const st = (await callTool('autoui_state', {})).trim()
        if (strField(st, field) === want) return st
        if (Date.now() > dl) throw new Error(`state.${field} never equaled ${JSON.stringify(want)}`)
        await sleep(200)
      }
    }
    const pressBtn = async (label) => {
      const snap = await callTool('autoui_snapshot', {})
      const lines = snap.split('\n').filter((l) => l.includes(`"${label}"`) && /vnode_\d+/.test(l))
      const id = lines.map((l) => l.match(/#(vnode_\d+)/)?.[1]).find(Boolean)
      if (!id) throw new Error(`button "${label}" not found in snapshot`)
      await callTool('autoui_action', { element_id: id, action: 'press' })
    }
    rec.helpers = { statePoll, stateEqPoll, pressBtn, callTool }

    // —— boot：Init 语料 + 开档 + 四级对读 ——
    const st0 = await stateEqPoll('boot', 'ready')
    rec.m0_boot = strField(st0, 'boot')
    rec.m0_lk_check = strField(st0, 'lk_check')
    rec.m0_lk_back = strField(st0, 'lk_back')
    rec.m0_lk_resolve = strField(st0, 'lk_resolve')
    rec.m0_tab_count = intField(st0, 'tab_count')
    rec.m0_active_path = strField(st0, 'active_path')

    // —— M1 导航别名（无锚直派——归一 ""）——
    await pressBtn('导航别名')
    {
      const st = await statePoll('commit_count', 1)
      rec.m1_target = strField(st, 'nav_last_target')
      rec.m1_anchor = strField(st, 'nav_last_anchor')
      rec.m1_reject = strField(st, 'nav_reject')
      rec.m1_commits = intField(st, 'commit_count')
      rec.m1_tabs = intField(st, 'tab_count')
      rec.m1_active = strField(st, 'active_path')
      rec.m1_commit_last = strField(st, 'commit_last')
    }

    // —— M2 回源页 + 导航带锚（已开目标激活不重复建 tab）——
    await pressBtn('到Src')
    await pressBtn('导航带锚')
    {
      const st = await statePoll('commit_count', 2)
      rec.m2_anchor = strField(st, 'nav_last_anchor')
      rec.m2_commits = intField(st, 'commit_count')
      rec.m2_tabs = intField(st, 'tab_count')
      rec.m2_active = strField(st, 'active_path')
      rec.m2_commit_last = strField(st, 'commit_last')
    }

    // —— M3 大小写 casefold 级 + 中文 stem 级 ——
    await pressBtn('到Src')
    await pressBtn('导航大小写')
    {
      const st = await statePoll('commit_count', 3)
      rec.m3_active = strField(st, 'active_path')
      rec.m3_reject = strField(st, 'nav_reject')
    }
    await pressBtn('到Src')
    await pressBtn('导航中文')
    {
      const st = await statePoll('commit_count', 4)
      rec.m4_active = strField(st, 'active_path')
      rec.m4_reject = strField(st, 'nav_reject')
      rec.m4_tabs = intField(st, 'tab_count')
    }

    // —— M4 缺失页：missing 计数、零提交、页态不变 ——
    await pressBtn('到Src')
    {
      const before = (await callTool('autoui_state', {})).trim()
      rec.m4s_commits = intField(before, 'commit_count')
      rec.m4s_tabs = intField(before, 'tab_count')
    }
    await pressBtn('导航缺失')
    {
      const st = await statePoll('nav_missing', 1)
      rec.m5_missing = intField(st, 'nav_missing')
      rec.m5_commits = intField(st, 'commit_count')
      rec.m5_tabs = intField(st, 'tab_count')
      rec.m5_active = strField(st, 'active_path')
      rec.m5_reject = strField(st, 'nav_reject')
    }

    // —— M5 陈旧票据直派：store 同步门独立拒绝 ——
    await pressBtn('陈旧直派')
    {
      const st = await statePoll('commit_rejects', 1)
      rec.m6_rejects = intField(st, 'commit_rejects')
      rec.m6_commits = intField(st, 'commit_count')
      rec.m6_tabs = intField(st, 'tab_count')
      rec.m6_active = strField(st, 'active_path')
    }

    // —— M7 无效输入（空 target → resolve [] ）：resolve-invalid ≠ missing ——
    await pressBtn('导航无效')
    {
      const st = await statePoll('nav_invalid', 1)
      rec.m7_invalid = intField(st, 'nav_invalid')
      rec.m7_missing = intField(st, 'nav_missing')
      rec.m7_reject = strField(st, 'nav_reject')
      rec.m7_commits = intField(st, 'commit_count')
      rec.m7_active = strField(st, 'active_path')
    }
    rec.merged_tail = appOut.slice(-300)
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
  return rec
}

// ---------------- split HTTP 臂 ----------------

async function runSplitHttp(rec) {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT, workspace: SPLIT_WS })
  // serveBackend 返回 = 工作区已重置为 fixture 拷贝——语料在其后写入
  //（probe_editor_host 同款时序）。
  writeCorpus(back.workspace)
  try {
    const getJson = async (api, query) => {
      const res = await fetch(`${back.url}/api/${api}${query ?? ''}`)
      if (!res.ok) throw new Error(`GET ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      try { return JSON.parse(text) } catch { return text }
    }
    const unwrap = (raw) => (typeof raw === 'string' ? JSON.parse(raw) : raw)
    // link_index（GET 既有端点）四级已知答案（后端供给面——T-01 基线）。
    const pages = unwrap(await getJson('link_index', '?path=&depth=8'))
    const src = Array.isArray(pages) ? pages.find((p) => p.path === 'Src.ad') : null
    const rowOf = (target) => (Array.isArray(src?.links) ? src.links.find((l) => l.target === target) : null)
    const fmt = (r) => (r ? `${r.target}>${r.target_path ?? ''}` : '(missing)')
    rec.split_http = {
      alias: fmt(rowOf('靶心')),
      exact: fmt(rowOf('Tgt')),
      casefold: fmt(rowOf('tgt')),
      cjk: fmt(rowOf('中文页')),
      note: fmt(rowOf('便签')),
      miss: fmt(rowOf('缺失页')),
    }
    const anchorRow = Array.isArray(src?.links) ? src.links.find((l) => (l.anchor ?? '') !== '') : null
    rec.split_http.anchor = anchorRow ? `${anchorRow.target}#${anchorRow.anchor}>${anchorRow.target_path}` : '(missing)'
    // page_names（原型 resolver 输入面——split 臂形状核验）。
    const names = unwrap(await getJson('page_names'))
    rec.split_names_rows = Array.isArray(names) ? names.length : -1
    rec.split_names_has_alias = Array.isArray(names) && names.some((n) => Array.isArray(n.aliases) && n.aliases.includes('靶心'))
    // —— T-02：resolve_wiki_link 单参案（POST 裸数组协议 + 失败区分 +
    // 零写面 + 旧 link_index 响应恒等——AC-02/03/08）——
    const walkWs = (dir, prefix = '') => {
      const out = {}
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${e.name}` : e.name
        if (e.isDirectory()) Object.assign(out, walkWs(path.join(dir, e.name), rel))
        else out[rel] = sha(path.join(dir, e.name))
      }
      return out
    }
    const rawLinkIndex = async () => {
      const v = unwrap(await getJson('link_index', '?path=&depth=8'))
      return typeof v === 'string' ? v : JSON.stringify(v)
    }
    const wsBefore = walkWs(back.workspace)
    const linkIndexBefore = await rawLinkIndex()
    const postResolve = async (target) => {
      const res = await fetch(`${back.url}/api/resolve_wiki_link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      })
      if (!res.ok) throw new Error(`POST resolve_wiki_link -> HTTP ${res.status}`)
      const text = await res.text()
      let v
      try { v = JSON.parse(text) } catch { return { parse_err: text.slice(0, 80) } }
      if (typeof v === 'string') {
        try { v = JSON.parse(v) } catch { return { parse_err: String(v).slice(0, 80) } }
      }
      return v
    }
    const fmtResolve = (rows) => {
      const r = Array.isArray(rows) && rows.length >= 1 ? rows[0] : null
      if (!r) return '(no-row)'
      return `${r.target}>${r.exists ? r.target_path : ''}`
    }
    const invalidLen = async (target) => {
      const rows = await postResolve(target)
      return Array.isArray(rows) ? rows.length : -1
    }
    rec.split_resolve = {
      alias: fmtResolve(await postResolve('靶心')),
      exact: fmtResolve(await postResolve('Tgt')),
      casefold: fmtResolve(await postResolve('tgt')),
      cjk: fmtResolve(await postResolve('中文页')),
      note: fmtResolve(await postResolve('便签')),
      miss: fmtResolve(await postResolve('缺失页')),
      // dtitle-only 未命中（title 不参与链接身份——Attr.ad fm title=属性名）
      title_only: fmtResolve(await postResolve('属性名')),
      invalid_empty_len: await invalidLen(''),
      invalid_blank_len: await invalidLen('   '),
      invalid_multiline_len: await invalidLen('两\n行'),
    }
    // 零写面 + 旧 link_index 响应字节恒等（AC-03）。
    rec.split_ws_zero_write = JSON.stringify(walkWs(back.workspace)) === JSON.stringify(wsBefore)
    rec.split_link_index_stable = (await rawLinkIndex()) === linkIndexBefore
    // T-03 扩展点：正文导航 e2e（E/U/D/S/M/F/B 组）追加于 e2e/wiki-link-navigation.spec.ts。
  } finally {
    await back.stop()
  }
  return rec
}

// ---------------- vue 运行时臂（真实点击 + 延迟反例） ----------------

async function runRuntimeArm(rec) {
  const { chromium } = await import('@playwright/test')
  const taskModules = path.join(repoRoot, 'gen', 'front', 'vue', 'node_modules')
  if (!fs.existsSync(path.join(taskModules, 'vite'))) {
    rec.runtime_error = `vite modules missing under ${taskModules}（先跑 scripts/regen-vue.mjs）`
    return rec
  }
  const { createServer } = await import(pathToFileURL(path.join(taskModules, 'vite/dist/node/index.js')).href)
  const { default: vuePlugin } = await import(pathToFileURL(path.join(taskModules, '@vitejs/plugin-vue/dist/index.mjs')).href)
  // 组件库导入链回退生产 gen 树（探针工程 gen-only 无自装 node_modules——
  // button 组件 → reka-ui/cva/clsx/tailwind-merge 裸模块落生产依赖面）。
  const prodVue = path.join(repoRoot, 'gen', 'front', 'vue')
  const runtimeRoot = path.join(PROBE_DIR, 'runtime')
  fs.mkdirSync(runtimeRoot, { recursive: true })
  fs.writeFileSync(path.join(runtimeRoot, 'index.html'), '<div id="app"></div><script type="module" src="/entry.js"></script>')
  fs.writeFileSync(
    path.join(runtimeRoot, 'entry.js'),
    "import { createApp } from 'vue'; import App from '../gen/front/vue/src/App.vue'; createApp(App).mount('#app');",
  )
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT, workspace: SPLIT_WS })
  let browser
  let server
  try {
    server = await createServer({
      configFile: false,
      root: runtimeRoot,
      logLevel: 'error',
      plugins: [vuePlugin()],
      resolve: {
        alias: [
          { find: /^vue$/, replacement: path.join(taskModules, 'vue/dist/vue.runtime.esm-bundler.js') },
          { find: /^@autodown\/engine$/, replacement: path.join(ENGINE_ROOT, 'dist/index.js') },
          { find: /^@\/components/, replacement: path.join(prodVue, 'src', 'components') },
          { find: /^@\//, replacement: path.join(PROBE_DIR, 'gen', 'front', 'vue', 'src') + path.sep },
          {
            find: /^(reka-ui|clsx|tailwind-merge|class-variance-authority|lucide-vue-next)$/,
            replacement: path.join(prodVue, 'node_modules') + path.sep + '$1',
          },
        ],
        dedupe: ['vue'],
      },
      css: { postcss: { plugins: [] } },
      server: {
        port: 0,
        host: '127.0.0.1',
        proxy: { '/api': { target: back.url, changeOrigin: true } },
        fs: { allow: [path.resolve(repoRoot, '..')] },
      },
    })
    await server.listen()
    const addr = server.httpServer.address()
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))

    // 状态列读面：根 col 第二子 col（按钮行后）的 span 序列（顺序冻结，
    // 17 节点——计数不足=渲染未完成，继续轮询）。
    const statusValues = async () => {
      const spans = page.locator('#app > div > div:nth-child(2) > span')
      const n = await spans.count()
      const out = []
      for (let i = 0; i < n; i++) out.push((await spans.nth(i).textContent()) ?? '')
      return out
    }
    const waitStatus = async (idx, want, timeoutMs = 15000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const vals = await statusValues()
        if (vals.length >= 17 && vals[idx] === want) return vals
        if (Date.now() > dl) throw new Error(`status[${idx}] never became ${JSON.stringify(want)} (got ${JSON.stringify(vals)})`)
        await sleep(150)
      }
    }
    // 联合等待（多 span 同步落定——单 store 同步提交的跨 span 读一致性面）。
    const waitStatusAll = async (pairs, timeoutMs = 15000) => {
      const dl = Date.now() + timeoutMs
      for (;;) {
        const vals = await statusValues()
        if (vals.length >= 17 && pairs.every(([idx, want]) => vals[idx] === want)) return vals
        if (Date.now() > dl) throw new Error(`status joint wait failed ${JSON.stringify(pairs)} (got ${JSON.stringify(vals)})`)
        await sleep(150)
      }
    }
    const clickLink = async (label, which = 'first') => {
      const scope = which === 'last' ? page.locator('.autodown-editor:visible').last() : page.locator('.autodown-editor:visible').first()
      const link = scope.locator('.autodown-wikilink-label').filter({ hasText: new RegExp(`^${label}$`) }).first()
      await link.waitFor({ timeout: 15000 })
      await link.click()
    }
    const clickBtn = async (label) => {
      await page.getByRole('button', { name: label, exact: true }).first().click()
    }

    await page.goto(`http://127.0.0.1:${addr.port}`)
    const ready = await waitStatus(0, 'ready')
    rec.rt_lk_check = ready[1]

    // —— E1 真实点击：中文别名无锚（缺参归一 ""）→ 解析+读盘+提交+激活 ——
    rec.rt_editor_visible = await page.locator('.autodown-editor:visible').count()
    await clickLink('靶心')
    {
      const vals = await waitStatusAll([[14, 'Tgt.ad'], [9, '1']])
      rec.e1_target = vals[4]
      rec.e1_anchor = vals[5]
      rec.e1_starts = vals[2]
      rec.e1_commits = vals[9]
      rec.e1_tabs = vals[12]
      rec.e1_reject = vals[7]
      rec.e1_active = vals[14]
    }

    // —— E2 带锚点击：锚点保留 + 已开目标激活（tab 不重复）——
    await clickBtn('到Src')
    await waitStatusAll([[14, 'Src.ad'], [9, '1']])
    await clickLink('Tgt#sec1')
    {
      const vals = await waitStatusAll([[9, '2'], [11, 'Tgt.ad#sec1']])
      rec.e2_anchor = vals[5]
      rec.e2_commits = vals[9]
      rec.e2_tabs = vals[12]
      rec.e2_active = vals[14]
      rec.e2_commit_last = vals[11]
    }

    // —— E3 casefold + 中文 stem ——
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    await clickLink('tgt')
    await waitStatus(9, '3')
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    await clickLink('中文页')
    {
      const vals = await waitStatus(9, '4')
      rec.e3_cjk_active = vals[14]
      rec.e3_tabs = vals[12]
    }

    // —— E5 缺失页点击：missing 计数、零提交、零崩溃 ——
    //（简称运行时阴性不可行——opener 全局单槽；对照归形状臂。）
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    {
      const commitsBefore = (await statusValues())[9]
      await clickLink('缺失页')
      await sleep(1000)
      const vals = await statusValues()
      rec.e5_missing = vals[8]
      rec.e5_commits_unchanged = vals[9] === commitsBefore
      rec.e5_active = vals[14]
    }

    // —— S1 解析等待窗切档：旧结果零提交零激活 ——
    let delayMs = 0
    await page.route('**/api/resolve_wiki_link', async (route) => {
      if (delayMs > 0) {
        const d = delayMs
        delayMs = 0
        await new Promise((r) => setTimeout(r, d))
      }
      await route.continue()
    })
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    delayMs = 2500
    await clickLink('靶心')
    await clickBtn('到Other')
    await waitStatus(14, 'Other.ad')
    await sleep(4000)
    {
      const vals = await statusValues()
      rec.s1_reject = vals[7]
      rec.s1_commits = vals[9]
      rec.s1_active = vals[14]
    }

    // —— S2 逆序双点击：快者恰一提交（新 tab +1）、慢者零 tab 零提交 ——
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    {
      const before = await statusValues()
      const commitsBefore = Number(before[9])
      const tabsBefore = Number(before[12])
      delayMs = 3000
      await clickLink('靶心')
      await clickLink('便签')
      await waitStatus(14, 'Note.ad')
      await sleep(4500)
      const vals = await statusValues()
      rec.s2_commits_delta = Number(vals[9]) - commitsBefore
      rec.s2_tabs_delta = Number(vals[12]) - tabsBefore
      rec.s2_active = vals[14]
    }

    // —— S3 等待期新输入：源票据 body 失效拒绝，源正文保持 ——
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    {
      const bodyBefore = (await statusValues())[16]
      const commitsBefore = (await statusValues())[9]
      delayMs = 2000
      await clickLink('靶心')
      await clickBtn('键入')
      await sleep(3500)
      const vals = await statusValues()
      rec.s3_reject = vals[7]
      rec.s3_commits_unchanged = vals[9] === commitsBefore
      // 键入经 store 直改 body → 编辑器 content prop 变更 → 引擎 replaceDoc
      // 规范化回声（plan-030 D-03 家族——实测恰补一尾 \n）。断言容忍该回
      // 声增量：原文逐字节 + 标记保住即算保持（生产导航流零 content 回写
      // ——回声面为本探针直改路径特有）。
      const b = vals[16] ?? ''
      const want = bodyBefore + '（迟到输入）'
      rec.s3_body_preserved = b === want || b === want + '\n'
      rec.s3_active = vals[14]
      rec.s3_body_after_tail = b.slice(-30)
      rec.s3_body_expected_tail = (want + '\n').slice(-30)
    }

    // —— S4 A→B→A 切档往返：仅世代不同即拒绝（字段全同不复活）——
    await clickBtn('到Src')
    await waitStatus(14, 'Src.ad')
    {
      const commitsBefore = (await statusValues())[9]
      delayMs = 2500
      await clickLink('靶心')
      await clickBtn('到Other')
      await waitStatus(14, 'Other.ad')
      await clickBtn('到Src')
      await waitStatus(14, 'Src.ad')
      await sleep(4000)
      const vals = await statusValues()
      rec.s4_reject = vals[7]
      rec.s4_commits_unchanged = vals[9] === commitsBefore
      rec.s4_active = vals[14]
      // 字段全同直证：票据 uid/key 与当前活动 uid/key 相同（仅 gen 不同）。
      const ticketParts = (vals[6] ?? ':').split(':')
      rec.s4_ticket_uid = ticketParts[0]
      rec.s4_ticket_key = ticketParts.slice(2).join(':')
      rec.s4_cur_uid = vals[13]
      rec.s4_cur_key = vals[15]
      rec.s4_fields_match = ticketParts[0] === vals[13] && ticketParts.slice(2).join(':') === vals[15]
    }

    rec.page_errors = errors.slice(0, 5)
    rec.runtime_ok = true
  } catch (e) {
    rec.runtime_error = String(e.message ?? e).slice(0, 800)
  } finally {
    if (browser) await browser.close().catch(() => {})
    if (server) await server.close().catch(() => {})
    await back.stop()
  }
  return rec
}

// ---------------- 工具链指纹 ----------------

function fingerprints(rec) {
  const fp = {}
  try {
    const v = spawnSync(AUTO_EXE, ['--version'], { encoding: 'utf8', timeout: 20000 })
    fp.auto_exe_version = ((v.stdout ?? '') + (v.stderr ?? '')).trim().split('\n')[0] || `exit ${v.status}`
  } catch (e) {
    fp.auto_exe_version = `unavailable: ${String(e).slice(0, 80)}`
  }
  try { fp.auto_exe_sha = sha(AUTO_EXE) } catch { fp.auto_exe_sha = 'unavailable' }
  const rev = (dir) => {
    try {
      return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    } catch {
      return 'unavailable'
    }
  }
  fp.auto_lang = rev('D:/autostack/auto-lang')
  fp.auto_down = rev('D:/autostack/auto-down')
  try {
    fp.engine_dist_entry_sha = sha(path.join(ENGINE_ROOT, 'dist', 'index.js'))
  } catch { fp.engine_dist_entry_sha = 'unavailable' }
  fp.auto_jade = rev(repoRoot)
  rec.fingerprints = fp
  return rec
}

// ---------------- 断言 ----------------

const failures = []
const ck = (ok, label) => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`)
  if (!ok) failures.push(label)
}
const bl = (label) => {
  console.log(`  [BLOCKED] ${label}`)
}

function checks(rec) {
  console.log('\n[probe-wiki-link] 工具链指纹：')
  for (const [k, v] of Object.entries(rec.fingerprints ?? {})) console.log(`  ${k} = ${String(v).slice(0, 100)}`)

  console.log('\n[probe-wiki-link] vue 生成形状（探针工程 gen-only）：')
  if (rec.vue_gen_exit === 0 && rec.vue_shape && rec.vue_shape_short) {
    const s = rec.vue_shape
    const t = rec.vue_shape_short
    ck(s.full_name_listener, '形状：完整事件名 → @open-wiki-link="NavStart"（引擎 emit 名匹配——真实监听）')
    ck(s.two_param_handler, '形状：NavStart 双参 handler 保留（target, anchor——第二参=目标锚点非来源身份）')
    ck(t.short_name_listener, '形状：简称 onopenwikilink → @openwikilink="NavShort"（生成但名不匹配引擎 emit 名——阴性对照在案）')
    ck(t.full_name_kebab_absent, '形状：简称绑定零 @open-wiki-link 发射（kebab 名唯一归属完整事件名）')
    ck(t.short_two_param, '形状：NavShort 双参 handler 保留（对照面同形）')
    ck(rec.vue_restore_ok === true, '形状：主模板重建恢复（运行时臂消费主模板生成树）')
  } else {
    bl(`vue 生成形状检查未达：exit=${rec.vue_gen_exit} ${(rec.vue_gen_tail ?? '').replace(/\s+/g, ' ').slice(0, 220)}`)
  }

  if (RUN_BACKEND) {
    console.log('\n[probe-wiki-link] merged 臂（协调形态同步全流程）：')
    if (rec.m0_boot === 'ready') {
      ck(rec.m0_lk_check === 'match', `M0 四级对读 match（link_index vs resolve_wiki_link——back=[${(rec.m0_lk_back ?? '').slice(0, 60)}] resolve=[${(rec.m0_lk_resolve ?? '').slice(0, 60)}]）`)
      ck(rec.m0_tab_count === 2 && rec.m0_active_path === 'Src.ad', `M0 Init 双 tab 开档激活 Src.ad（tabs=${rec.m0_tab_count}）`)
      ck(rec.m1_target === '靶心' && rec.m1_anchor === '' && rec.m1_reject === 'none', 'M1 导航别名直派：target=靶心 anchor=""（缺参归一）reject=none')
      ck(rec.m1_commits === 1 && rec.m1_active === 'Tgt.ad' && rec.m1_tabs === 3, `M1 同步提交：commits=1 active=Tgt.ad 新建 tab（3）`)
      ck(rec.m2_anchor === 'sec1' && rec.m2_tabs === 3 && rec.m2_active === 'Tgt.ad', `M2 带锚导航：anchor=sec1 已开目标激活零重复 tab（3）commit_last=${rec.m2_commit_last}`)
      ck(rec.m3_active === 'Tgt.ad' && rec.m3_reject === 'none', 'M3 casefold 级 [[tgt]] → Tgt.ad')
      ck(rec.m4_active === '中文页.ad' && rec.m4_reject === 'none' && rec.m4_tabs === 4, 'M4 中文 stem 级 [[中文页]] → 中文页.ad（新 tab=4）')
      ck(rec.m5_missing === 1 && rec.m5_commits === rec.m4s_commits && rec.m5_tabs === rec.m4s_tabs && rec.m5_reject === 'missing', `M5 缺失页：missing=1 零提交零 tab（missing 终态计数——确认流归 T-04）`)
      ck(rec.m6_rejects === 1 && rec.m6_commits === 4 && rec.m6_tabs === rec.m4s_tabs && rec.m6_active === 'Src.ad', 'M6 陈旧票据直派：store 同步门独立拒绝（rejects=1 零 tab 零激活——阴性对照）')
      ck(rec.m7_invalid === 1 && rec.m7_missing === 1 && rec.m7_reject === 'resolve-invalid' && rec.m7_commits === 4, 'M7 无效输入：resolve-invalid ≠ missing（invalid 计数独立、零提交——AC-08）')
    } else {
      bl(`merged 臂 boot 未达：${String(rec.merged_error ?? rec.m0_boot ?? '').slice(0, 260)}`)
    }

    console.log('\n[probe-wiki-link] split 臂（HTTP 供给面）：')
    if (rec.split_http) {
      const h = rec.split_http
      ck(h.alias === '靶心>Tgt.ad', `B1 split [[靶心]] alias 级 → Tgt.ad（实际：${h.alias}）`)
      ck(h.exact === 'Tgt>Tgt.ad', `B1 split [[Tgt]] stem 精确 → Tgt.ad（实际：${h.exact}）`)
      ck(h.casefold === 'tgt>Tgt.ad', `B1 split [[tgt]] casefold 级 → Tgt.ad（实际：${h.casefold}）`)
      ck(h.cjk === '中文页>中文页.ad', `B1 split [[中文页]] CJK stem → 中文页.ad（实际：${h.cjk}）`)
      ck(h.note === '便签>Note.ad', `B1 split [[便签]] alias → Note.ad（实际：${h.note}）`)
      ck(h.miss === '缺失页>', `B1 split [[缺失页]] 悬空（实际：${h.miss}）`)
      ck(h.anchor === 'Tgt#sec1>Tgt.ad', `B1 split anchor 伴随解析（实际：${h.anchor}）`)
      ck(rec.split_names_rows > 0 && rec.split_names_has_alias === true, `B2 split page_names 行集含 aliases（rows=${rec.split_names_rows}）`)
    } else {
      bl(`split 臂未达：${String(rec.split_error ?? '').slice(0, 260)}`)
    }
    console.log('\n[probe-wiki-link] split 臂·resolve_wiki_link 单参案（T-02）：')
    if (rec.split_resolve) {
      const r = rec.split_resolve
      ck(r.alias === '靶心>Tgt.ad', `B3 split resolve 靶心 alias 级（实际：${r.alias}）`)
      ck(r.exact === 'Tgt>Tgt.ad', `B3 split resolve Tgt stem 精确（实际：${r.exact}）`)
      ck(r.casefold === 'tgt>Tgt.ad', `B3 split resolve tgt casefold 级（实际：${r.casefold}）`)
      ck(r.cjk === '中文页>中文页.ad', `B3 split resolve 中文页 CJK stem（实际：${r.cjk}）`)
      ck(r.note === '便签>Note.ad', `B3 split resolve 便签 alias（实际：${r.note}）`)
      ck(r.miss === '缺失页>', `B3 split resolve 缺失页 正常 missing 行（exists=false path 空——实际：${r.miss}）`)
      ck(r.title_only === '属性名>', `B3 split resolve dtitle-only 未命中不拼路径（title 不参与身份——实际：${r.title_only}）`)
      ck(r.invalid_empty_len === 0 && r.invalid_blank_len === 0 && r.invalid_multiline_len === 0, `B3 split resolve 无效输入 []（空=${r.invalid_empty_len} 空白=${r.invalid_blank_len} 跨行=${r.invalid_multiline_len}——与 missing 严格区分）`)
      ck(rec.split_ws_zero_write === true, 'B3 split resolve 零写面（工作区文件集合/字节恒等——AC-03）')
      ck(rec.split_link_index_stable === true, 'B3 split resolve 前后旧 link_index 响应字节恒等（AC-03 旧语义不变）')
    } else {
      bl(`split resolve 案未达：${String(rec.split_error ?? '').slice(0, 200)}`)
    }
  }

  if (RUN_RUNTIME) {
    console.log('\n[probe-wiki-link] vue 运行时臂（真实点击 + 延迟反例）：')
    if (rec.runtime_ok) {
      ck(rec.rt_lk_check === 'match', `E0 Init 四级对读 match（boot 即对读——runtime 臂同见证）`)
      ck(rec.rt_editor_visible === 1, `E0 单编辑器挂载（visible=${rec.rt_editor_visible}——opener 全局单槽兼容面）`)
      ck(rec.e1_active === 'Tgt.ad' && rec.e1_commits === '1', `E1 真实点击 [[靶心]] → 解析+读盘+提交+激活（active=${rec.e1_active} commits=${rec.e1_commits} starts=${rec.e1_starts} reject=${rec.e1_reject}）`)
      ck(rec.e1_anchor === '' && rec.e1_target === '靶心', `E1 缺参归一：anchor=""（非 undefined 字面）target=靶心`)
      ck(rec.e1_starts === '1', 'E1 handler 一次触发（nav_starts=1）')
      ck(rec.e2_anchor === 'sec1' && rec.e2_tabs === rec.e1_tabs && rec.e2_commit_last === 'Tgt.ad#sec1', `E2 带锚点击：锚点保留+已开激活零重复 tab（anchor=sec1 commit_last=${rec.e2_commit_last}）`)
      ck(rec.e3_cjk_active === '中文页.ad' && rec.e3_tabs === String(Number(rec.e2_tabs ?? 3) + 1), `E3 casefold+中文 stem 真实点击（active=${rec.e3_cjk_active} tabs=${rec.e3_tabs}）`)
      ck(rec.e5_missing === '1' && rec.e5_commits_unchanged === true, `E5 缺失页点击：missing=1 零提交（确认流归 T-04）`)
      ck(rec.s1_reject === 'stale-after-resolve' && rec.s1_active === 'Other.ad' && rec.s1_commits === '4', `S1 解析等待窗切档：旧结果拒绝（reject=${rec.s1_reject} active=${rec.s1_active} 零新提交）`)
      ck(rec.s2_commits_delta === 1 && rec.s2_tabs_delta === 1 && rec.s2_active === 'Note.ad', `S2 逆序双点击：快者恰一提交（Δcommits=${rec.s2_commits_delta} Δtabs=${rec.s2_tabs_delta}——慢者零 tab）active=Note.ad`)
      ck(rec.s3_reject === 'stale-after-resolve' && rec.s3_body_preserved === true && rec.s3_commits_unchanged === true, `S3 等待期新输入：票据失效拒绝 + 源正文保持（reject=${rec.s3_reject} body_preserved=${rec.s3_body_preserved} commits_unchanged=${rec.s3_commits_unchanged} after_tail=[${JSON.stringify(rec.s3_body_after_tail)}] expected_tail=[${JSON.stringify(rec.s3_body_expected_tail)}]）`)
      ck(rec.s4_reject === 'stale-after-resolve' && rec.s4_commits_unchanged === true && rec.s4_active === 'Src.ad' && rec.s4_fields_match === true, `S4 A→B→A 往返：字段全同（uid/key 与票据一致）仅世代不同即拒绝——选择世代门直证`)
      ck((rec.page_errors ?? []).length === 0, `E* 运行时零 pageerror（${JSON.stringify(rec.page_errors ?? [])}）`)
    } else {
      bl(`vue 运行时臂未达：${String(rec.runtime_error ?? '').replace(/\s+/g, ' ').slice(0, 400)}`)
    }
  }
}

// ---------------- run ----------------

console.log(`[probe-wiki-link] phase=${PHASE} — 指纹 → merged 臂（探针工程 ${path.relative(repoRoot, PROBE_DIR)}）→ split 臂 → 形状 → vue 运行时臂`)
let rec = {}
rec = fingerprints(rec)

if (RUN_BACKEND) {
  prepareWorkspace(MERGED_WS)
  try {
    rec = await runMergedArm(rec)
  } catch (e) {
    rec.merged_error = String(e.message ?? e).slice(0, 1200)
  }
  prepareWorkspace(SPLIT_WS)
  try {
    rec = await runSplitHttp(rec)
  } catch (e) {
    rec.split_error = String(e.message ?? e).slice(0, 600)
  }
}

// 形状臂（自含三步生成——主模板/形状对照模板/主模板重建；运行时臂消费
// 步③主模板生成树）。
rec = vueShapeCheck(rec)

if (RUN_RUNTIME) {
  prepareWorkspace(SPLIT_WS)
  rec = await runRuntimeArm(rec)
}

checks(rec)

if (failures.length > 0) {
  console.error(`\n[probe-wiki-link] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-wiki-link] RESULT: phase ${PHASE} 全案通过（协调形态冻结+单参解析+生产接线同构见证）`)
