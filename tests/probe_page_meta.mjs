#!/usr/bin/env node
// probe_page_meta.mjs — PLAN-011 T-01 页面属性写面十案 + 互作案直证（双臂）
// + PLAN-013 T-01 title 面五案扩（三键契约回归——扩参不破旧）。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-page-meta/，脚本生成——
//              pac.at render vm + src/back 整树拷贝 + 探针 widget Init 内
//              直调 page_meta GET 与 set_page_meta POST 各案，返回值落
//              model 字段供 autoui_state dump 读回）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              GET /api/page_meta + POST /api/set_page_meta 各案。
//
// 案表（§6 十案 + 互作案 + PLAN-013 title 面五案；全 ASCII 档名——CJK 值
// 走 POST body 无 D-19 面，GET path 面 CJK 排除；011 案全量带 title 现值
// ——in-place 同字节改写，契约扩不破旧）：
//   ① 既有键改写归一（MetaMix 两缩进 tags + inline aliases → 无缩进 block-list 原位）
//   ② 其余键逐字节保留（MetaMix status/注释/folded/未知键——diff 仅目标键块）
//   ③ 新增键尾追（MetaNoTags 有 frontmatter 无两键 → 闭合界符前追 tags/aliases）
//   ④ 空值删键（MetaEmpty 两键清空 → 键行+项行整删）
//   ⑤ 无 frontmatter 增建（MetaNoFm → 界符段插 body 前 + body 逐字节不变）
//   ⑥ CRLF 档保真（MetaCRLF 造档 \r\n——非目标行/界符行尾风格不变，新段 \r\n 同步）
//   ⑦ 幂等（MetaMix 同值再写逐字节不变 + MetaEmpty 二次空写 no-op "ok" 零写盘）
//   ⑧ 双键同写（MetaBoth 一次写两键 + 既有他键保留）
//   ⑨ CJK 值（MetaCJK tags/aliases 中文——POST 双臂 + 读回保真）
//   ⑩ 读回闭环（写→page_meta 读回一致；删键后缺席项形态）
//   附 与 write_body 顺序互作案（属性写→body 保存→frontmatter 段存续）
//   ③t title 写面（PLAN-013 SD-1301 单行键）：改写[MetaTitle 键行整行
//      替换——diff 仅 title 行] + 删键/删后幂等[MetaTitleDel——防线三值
//      扩] + 尾追[MetaTitleAdd status 后] + 三键同写增建[MetaTrio——
//      title 位首] + 读回装配序[title,tags,aliases] + CJK title POST
//   ②t 引号壳（MetaQuote `title: "Quoted Name"` → 读回剥壳 Quoted Name
//      + 改写落裸值 Quoted Two——page_fm_value/fm_set_line 剥壳面）
//
// 用法（仓根）：node tests/probe_page_meta.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-page-meta')
const MERGED_WS = path.join(RUNTIME, 'probe-page-meta-workspace')
const MERGED_PORT = 9398
const SPLIT_PORT = 8226

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// —— 素材预期态（单源：materialize 与断言共用） ——

const MIX_BEFORE = `---
title: Mix
status: draft
# comment line
summary: >
  folded
  text
tags:
  - old-one
  - old-two
custom_key: keep me
aliases: mixed-a, mixed-b
note: tail

---
Body line one.
Body line two.
`
const MIX_AFTER = `---
title: Mix
status: draft
# comment line
summary: >
  folded
  text
tags:
- new-a
- new-b
custom_key: keep me
aliases:
- alias-x
note: tail

---
Body line one.
Body line two.
`

const NOTAGS_BEFORE = `---
title: NoTags
status: wip
---
Body N.
`
const NOTAGS_AFTER = `---
title: NoTags
status: wip
tags:
- t1
aliases:
- a1
---
Body N.
`

const EMPTY_BEFORE = `---
title: Empty
tags:
  - gone-one
aliases:
  - gone-two
---
Body E.
`
const EMPTY_AFTER = `---
title: Empty
---
Body E.
`

const NOFM_BEFORE = `Body NF line.
`
const NOFM_AFTER = `---
tags:
- nf-1
- nf-2
aliases:
- nf-a
---
Body NF line.
`

const CRLF_BEFORE = `---\r\ntitle: CRLF Doc\r\ntags:\r\n  - old-c\r\n---\r\nBody C line one.\r\nBody C line two.\r\n`
const CRLF_AFTER = `---\r\ntitle: CRLF Doc\r\ntags:\r\n- new-c\r\naliases:\r\n- ca\r\n---\r\nBody C line one.\r\nBody C line two.\r\n`

const BOTH_BEFORE = `---
title: Both
status: live
---
Body B.
`
const BOTH_AFTER = `---
title: Both
status: live
tags:
- b1
- b2
aliases:
- ba1
---
Body B.
`

const CJK_BEFORE = `---
title: CJK
---
Body J.
`
const CJK_AFTER = `---
title: CJK
tags:
- 标签一
- 标签二
aliases:
- 别名甲
---
Body J.
`

const ROUND_BEFORE = `---
title: Round
---
Body R.
`
const ROUND_AFTER_W1 = `---
title: Round
tags:
- r1
- r2
aliases:
- ra
---
Body R.
`
const ROUND_AFTER_DEL = `---
title: Round
aliases:
- ra
---
Body R.
`

const INTER_BEFORE = `---
title: Inter
---
Body I old.
`
const INTER_AFTER = `---
title: Inter
tags:
- i1
---
NEW BODY from write_body.`

// —— PLAN-013 title 面素材（SD-1301 三键扩；单行值键）——

const TITLE_BEFORE = `---
title: 旧名
status: draft
---
Body T.
`
const TITLE_AFTER_RW = `---
title: 新名
status: draft
---
Body T.
`
const TITLE_AFTER_DEL = `---
status: draft
---
Body T.
`

const TITLEADD_BEFORE = `---
status: draft
---
Body TA.
`
const TITLEADD_AFTER = `---
status: draft
title: T 后加
---
Body TA.
`

const TRIO_BEFORE = `Body TR.
`
const TRIO_AFTER = `---
title: Trio 标
tags:
- tg1
aliases:
- al1
---
Body TR.
`

const QUOTE_BEFORE = `---
title: "Quoted Name"
---
Body Q.
`
const QUOTE_AFTER = `---
title: Quoted Two
---
Body Q.
`

function materializeWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })

  const w = (rel, content) => fs.writeFileSync(path.join(ws, 'wiki', rel), content, 'utf8')
  w('MetaMix.ad', MIX_BEFORE)
  w('MetaNoTags.ad', NOTAGS_BEFORE)
  w('MetaEmpty.ad', EMPTY_BEFORE)
  w('MetaNoFm.ad', NOFM_BEFORE)
  fs.writeFileSync(path.join(ws, 'wiki', 'MetaCRLF.ad'), CRLF_BEFORE, 'utf8')
  w('MetaBoth.ad', BOTH_BEFORE)
  w('MetaCJK.ad', CJK_BEFORE)
  w('MetaRound.ad', ROUND_BEFORE)
  w('MetaIdem.ad', NOFM_BEFORE)
  w('MetaInter.ad', INTER_BEFORE)
  w('MetaTitle.ad', TITLE_BEFORE)
  w('MetaTitleDel.ad', TITLE_BEFORE)
  w('MetaTitleAdd.ad', TITLEADD_BEFORE)
  w('MetaTrio.ad', TRIO_BEFORE)
  w('MetaQuote.ad', QUOTE_BEFORE)
}

// —— 双臂共通案序（返回值表 + 终态磁盘断言）——

const CJK_TAGS = '标签一, 标签二'
const CJK_ALIASES = '别名甲'

async function runCases(call) {
  // call: async (fn, args) -> str（merged 直调 / split HTTP POST/GET 封装）
  // PLAN-013：set_page_meta 三值参（title 值参首位）——011 旧案全量带
  // title 现值（in-place 同字节改写——契约扩不破旧）；新增 title 面五案。
  const r = {}
  r.mix1 = await call('set_page_meta', ['wiki/MetaMix.ad', 'Mix', 'new-a, new-b', 'alias-x'])
  r.mix2 = await call('set_page_meta', ['wiki/MetaMix.ad', 'Mix', 'new-a, new-b', 'alias-x'])
  r.notags = await call('set_page_meta', ['wiki/MetaNoTags.ad', 'NoTags', 't1', 'a1'])
  r.empty1 = await call('set_page_meta', ['wiki/MetaEmpty.ad', 'Empty', '', ''])
  r.empty2 = await call('set_page_meta', ['wiki/MetaEmpty.ad', 'Empty', '', ''])
  r.nofm = await call('set_page_meta', ['wiki/MetaNoFm.ad', '', 'nf-1, nf-2', 'nf-a'])
  r.crlf = await call('set_page_meta', ['wiki/MetaCRLF.ad', 'CRLF Doc', 'new-c', 'ca'])
  r.both = await call('set_page_meta', ['wiki/MetaBoth.ad', 'Both', 'b1,b2', 'ba1'])
  r.cjk = await call('set_page_meta', ['wiki/MetaCJK.ad', 'CJK', CJK_TAGS, CJK_ALIASES])
  r.round1 = await call('set_page_meta', ['wiki/MetaRound.ad', 'Round', 'r1,r2', 'ra'])
  r.roundRead1 = await call('page_meta', ['wiki/MetaRound.ad'])
  r.roundDel = await call('set_page_meta', ['wiki/MetaRound.ad', 'Round', '', 'ra'])
  r.roundRead2 = await call('page_meta', ['wiki/MetaRound.ad'])
  r.inter1 = await call('set_page_meta', ['wiki/MetaInter.ad', 'Inter', 'i1', ''])
  r.interBody = await call('write_wiki', ['wiki/MetaInter.ad', 'NEW BODY from write_body.'])
  r.missing = await call('page_meta', ['wiki/nonexistent.ad'])
  r.idemNoKey = await call('set_page_meta', ['wiki/MetaIdem.ad', '', '', ''])
  // title 面五案（T-01 ③④⑤⑦⑧）：
  r.titleRewrite = await call('set_page_meta', ['wiki/MetaTitle.ad', '新名', '', ''])
  r.titleRead1 = await call('page_meta', ['wiki/MetaTitle.ad'])
  r.titleDel = await call('set_page_meta', ['wiki/MetaTitleDel.ad', '', '', ''])
  r.titleDelIdem = await call('set_page_meta', ['wiki/MetaTitleDel.ad', '', '', ''])
  r.titleAdd = await call('set_page_meta', ['wiki/MetaTitleAdd.ad', 'T 后加', '', ''])
  r.trio = await call('set_page_meta', ['wiki/MetaTrio.ad', 'Trio 标', 'tg1', 'al1'])
  r.trioRead = await call('page_meta', ['wiki/MetaTrio.ad'])
  r.quoteRead = await call('page_meta', ['wiki/MetaQuote.ad'])
  r.quoteWrite = await call('set_page_meta', ['wiki/MetaQuote.ad', 'Quoted Two', '', ''])
  return r
}

function verifyDisk(ws, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const rd = (rel) => fs.readFileSync(path.join(ws, 'wiki', rel), 'utf8')

  ck(rd('MetaMix.ad') === MIX_AFTER, '①② MetaMix 改写归一 + 非目标键逐字节保留')
  ck(rd('MetaNoTags.ad') === NOTAGS_AFTER, '③ MetaNoTags 新增键尾追')
  ck(rd('MetaEmpty.ad') === EMPTY_AFTER, '④ MetaEmpty 空值删键')
  ck(rd('MetaNoFm.ad') === NOFM_AFTER, '⑤ MetaNoFm 无 frontmatter 增建 + body 逐字节不变')
  ck(rd('MetaCRLF.ad') === CRLF_AFTER, '⑥ MetaCRLF CRLF 保真（非目标行零变化 + 新段 \\r\\n）')
  ck(rd('MetaBoth.ad') === BOTH_AFTER, '⑧ MetaBoth 双键同写 + 他键保留')
  ck(rd('MetaCJK.ad') === CJK_AFTER, '⑨ MetaCJK CJK 值落盘')
  ck(rd('MetaRound.ad') === ROUND_AFTER_DEL, '⑩ MetaRound 删键后终态')
  ck(rd('MetaInter.ad') === INTER_AFTER, '附 MetaInter 属性写→body 保存互作（frontmatter 段存续）')
  // PLAN-013 title 面：
  ck(rd('MetaTitle.ad') === TITLE_AFTER_RW, '③t MetaTitle title 改写（键行整行替换——diff 仅 title 行，status 直通）')
  ck(rd('MetaTitleDel.ad') === TITLE_AFTER_DEL, '③t MetaTitleDel title 删键（键行删——无项行块）')
  ck(rd('MetaTitleAdd.ad') === TITLEADD_AFTER, '③t MetaTitleAdd 无 title 键尾追（fm 段闭合界符前——status 后）')
  ck(rd('MetaTrio.ad') === TRIO_AFTER, '⑦t MetaTrio 三键同写增建（title 位首 + tags/aliases 归一）')
  ck(rd('MetaQuote.ad') === QUOTE_AFTER, '②t MetaQuote 引号壳档 title 改写（壳不落新值——裸值形态）')
}

function verifyReturns(r, tag, failures) {
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  ck(r.mix1 === 'ok' && r.mix2 === 'ok', '①⑦ set_page_meta 返回 ok（改写 + 同值重写）')
  ck(r.notags === 'ok', '③ 尾追返回 ok')
  ck(r.empty1 === 'ok' && r.empty2 === 'ok', '④⑦ 删键返回 ok + 二次空写幂等 ok')
  ck(r.nofm === 'ok', '⑤ 增建返回 ok')
  ck(r.crlf === 'ok', '⑥ CRLF 案返回 ok')
  ck(r.both === 'ok', '⑧ 双键同写返回 ok')
  ck(r.cjk === 'ok', '⑨ CJK 写返回 ok')
  const rd1 = JSON.parse(r.roundRead1)
  ck(
    Array.isArray(rd1) && rd1.length === 3
    && rd1[0].key === 'title' && rd1[0].value === 'Round'
    && rd1[1].key === 'tags' && rd1[1].value === 'r1,r2'
    && rd1[2].key === 'aliases' && rd1[2].value === 'ra',
    '⑩ 读回闭环：写后裸数组 [{title Round},{tags r1,r2},{aliases ra}]——013 三项装配（title 位首）',
  )
  const rd2 = JSON.parse(r.roundRead2)
  ck(
    Array.isArray(rd2) && rd2.length === 2
    && rd2[0].key === 'title' && rd2[0].value === 'Round'
    && rd2[1].key === 'aliases' && rd2[1].value === 'ra',
    '⑩ 删键后缺席项形态（title + aliases 两项——tags 缺席不装配）',
  )
  ck(r.roundDel === 'ok', '⑩ 删键写返回 ok')
  ck(r.inter1 === 'ok', '附 属性写 ok（body 保存面由磁盘终态断言承载）')
  ck(r.missing === '[]', '⑩ 缺失档 page_meta → []')
  ck(r.idemNoKey === 'ok', '① 幂等防线：三值空 + 档无键 → no-op ok')
  // PLAN-013 title 面返回值：
  const rt1 = JSON.parse(r.titleRead1)
  ck(
    Array.isArray(rt1) && rt1.length === 1 && rt1[0].key === 'title' && rt1[0].value === '新名',
    '③t title 改写读回（CJK 值 POST 双臂保真 + title 位首单项形态）',
  )
  ck(r.titleDel === 'ok' && r.titleDelIdem === 'ok', '③t title 删键 ok + 删后空写幂等 no-op ok（防线三值扩）')
  ck(r.titleAdd === 'ok', '③t title 尾追 ok')
  ck(r.trio === 'ok', '⑦t 三键同写 ok')
  const rt2 = JSON.parse(r.trioRead)
  ck(
    Array.isArray(rt2) && rt2.length === 3
    && rt2[0].key === 'title' && rt2[0].value === 'Trio 标'
    && rt2[1].key === 'tags' && rt2[1].value === 'tg1'
    && rt2[2].key === 'aliases' && rt2[2].value === 'al1',
    '⑦t 三项读回装配序 title,tags,aliases（title 位首）',
  )
  const rt3 = JSON.parse(r.quoteRead)
  ck(
    Array.isArray(rt3) && rt3.length === 1 && rt3[0].key === 'title' && rt3[0].value === 'Quoted Name',
    '②t 引号壳剥离读回（`"Quoted Name"` → Quoted Name——page_fm_value 剥壳）',
  )
  ck(r.quoteWrite === 'ok', '②t 引号壳档改写 ok')
}

// —— 期望磁盘终态（跨臂字节对读用）——
const DISK_FILES = [
  ['MetaMix.ad', MIX_AFTER],
  ['MetaNoTags.ad', NOTAGS_AFTER],
  ['MetaEmpty.ad', EMPTY_AFTER],
  ['MetaNoFm.ad', NOFM_AFTER],
  ['MetaCRLF.ad', CRLF_AFTER],
  ['MetaBoth.ad', BOTH_AFTER],
  ['MetaCJK.ad', CJK_AFTER],
  ['MetaRound.ad', ROUND_AFTER_DEL],
  ['MetaInter.ad', INTER_AFTER],
  ['MetaTitle.ad', TITLE_AFTER_RW],
  ['MetaTitleDel.ad', TITLE_AFTER_DEL],
  ['MetaTitleAdd.ad', TITLEADD_AFTER],
  ['MetaTrio.ad', TRIO_AFTER],
  ['MetaQuote.ad', QUOTE_AFTER],
]

// ---------------- merged 臂 ----------------

const PROBE_AT = `use back.api: page_meta, set_page_meta, write_wiki

widget App {
    msg { Init }
    model {
        var done bool = false
        var r_mix1 str = ""
        var r_mix2 str = ""
        var r_notags str = ""
        var r_empty1 str = ""
        var r_empty2 str = ""
        var r_nofm str = ""
        var r_crlf str = ""
        var r_both str = ""
        var r_cjk str = ""
        var r_round1 str = ""
        var r_roundRead1 str = ""
        var r_roundDel str = ""
        var r_roundRead2 str = ""
        var r_inter1 str = ""
        var r_interBody bool = false
        var r_missing str = ""
        var r_idemNoKey str = ""
        var r_titleRewrite str = ""
        var r_titleRead1 str = ""
        var r_titleDel str = ""
        var r_titleDelIdem str = ""
        var r_titleAdd str = ""
        var r_trio str = ""
        var r_trioRead str = ""
        var r_quoteRead str = ""
        var r_quoteWrite str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: page meta" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            r_mix1 = set_page_meta("wiki/MetaMix.ad", "Mix", "new-a, new-b", "alias-x")
            r_mix2 = set_page_meta("wiki/MetaMix.ad", "Mix", "new-a, new-b", "alias-x")
            r_notags = set_page_meta("wiki/MetaNoTags.ad", "NoTags", "t1", "a1")
            r_empty1 = set_page_meta("wiki/MetaEmpty.ad", "Empty", "", "")
            r_empty2 = set_page_meta("wiki/MetaEmpty.ad", "Empty", "", "")
            r_nofm = set_page_meta("wiki/MetaNoFm.ad", "", "nf-1, nf-2", "nf-a")
            r_crlf = set_page_meta("wiki/MetaCRLF.ad", "CRLF Doc", "new-c", "ca")
            r_both = set_page_meta("wiki/MetaBoth.ad", "Both", "b1,b2", "ba1")
            r_cjk = set_page_meta("wiki/MetaCJK.ad", "CJK", "标签一, 标签二", "别名甲")
            r_round1 = set_page_meta("wiki/MetaRound.ad", "Round", "r1,r2", "ra")
            r_roundRead1 = page_meta("wiki/MetaRound.ad")
            r_roundDel = set_page_meta("wiki/MetaRound.ad", "Round", "", "ra")
            r_roundRead2 = page_meta("wiki/MetaRound.ad")
            r_inter1 = set_page_meta("wiki/MetaInter.ad", "Inter", "i1", "")
            r_interBody = write_wiki("wiki/MetaInter.ad", "NEW BODY from write_body.")
            r_missing = page_meta("wiki/nonexistent.ad")
            r_idemNoKey = set_page_meta("wiki/MetaIdem.ad", "", "", "")
            r_titleRewrite = set_page_meta("wiki/MetaTitle.ad", "新名", "", "")
            r_titleRead1 = page_meta("wiki/MetaTitle.ad")
            r_titleDel = set_page_meta("wiki/MetaTitleDel.ad", "", "", "")
            r_titleDelIdem = set_page_meta("wiki/MetaTitleDel.ad", "", "", "")
            r_titleAdd = set_page_meta("wiki/MetaTitleAdd.ad", "T 后加", "", "")
            r_trio = set_page_meta("wiki/MetaTrio.ad", "Trio 标", "tg1", "al1")
            r_trioRead = page_meta("wiki/MetaTrio.ad")
            r_quoteRead = page_meta("wiki/MetaQuote.ad")
            r_quoteWrite = set_page_meta("wiki/MetaQuote.ad", "Quoted Two", "", "")
            done = true
        }
    }
}
`

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "jade-probe-page-meta"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbePageMeta"
window: "400x300"
`,
    'utf8',
  )
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
    if (result.isError) throw new Error(`tool ${name} failed: ${JSON.stringify(result.content)}`)
    return result.content.map((c) => c.text ?? '').join('\n')
  }
  return { rpc, callTool }
}

function unescapeDump(raw) {
  return raw.replace(/\\(["\\])/g, '$1')
}

async function runMergedArm() {
  materializeWorkspace(MERGED_WS)
  buildProbeProject()
  const app = spawn(AUTO_EXE, ['run', '-r', 'vm'], {
    cwd: PROBE_DIR,
    env: { ...process.env, AUTOUI_MCP_PORT: String(MERGED_PORT), JADE_WORKSPACE: MERGED_WS },
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'jade-probe-page-meta', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    const pollDeadline = Date.now() + 30000
    let dump = ''
    for (;;) {
      dump = (await callTool('autoui_state', {})).trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}`)
      await sleep(300)
    }

    const field = (name) => {
      const m = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
      return m ? unescapeDump(m[1]) : null
    }

    return {
      r: {
        mix1: field('r_mix1'),
        mix2: field('r_mix2'),
        notags: field('r_notags'),
        empty1: field('r_empty1'),
        empty2: field('r_empty2'),
        nofm: field('r_nofm'),
        crlf: field('r_crlf'),
        both: field('r_both'),
        cjk: field('r_cjk'),
        round1: field('r_round1'),
        roundRead1: field('r_roundRead1'),
        roundDel: field('r_roundDel'),
        roundRead2: field('r_roundRead2'),
        inter1: field('r_inter1'),
        interBody: field('r_interBody'),
        missing: field('r_missing'),
        idemNoKey: field('r_idemNoKey'),
        titleRewrite: field('r_titleRewrite'),
        titleRead1: field('r_titleRead1'),
        titleDel: field('r_titleDel'),
        titleDelIdem: field('r_titleDelIdem'),
        titleAdd: field('r_titleAdd'),
        trio: field('r_trio'),
        trioRead: field('r_trioRead'),
        quoteRead: field('r_quoteRead'),
        quoteWrite: field('r_quoteWrite'),
      },
      diskCheck: (failures) => verifyDisk(MERGED_WS, 'merged', failures),
    }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂 ----------------

async function runSplitArm() {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT })
  try {
    materializeWorkspace(back.workspace)

    const post = async (api, payload) => {
      const res = await fetch(`${back.url}/api/${api}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`POST ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      try {
        const v = JSON.parse(text)
        return String(v)
      } catch {
        return text
      }
    }
    const getMeta = async (p) => {
      const res = await fetch(`${back.url}/api/page_meta?path=${encodeURIComponent(p)}`)
      if (!res.ok) throw new Error(`GET page_meta -> HTTP ${res.status}`)
      const text = await res.text()
      try {
        const v = JSON.parse(text)
        return typeof v === 'string' ? v : text
      } catch {
        return text
      }
    }

    const r = await runCases(async (fn, args) => {
      if (fn === 'page_meta') return getMeta(args[0])
      if (fn === 'write_wiki') return post(fn, { path: args[0], body: args[1] })
      return post(fn, { path: args[0], title: args[1], tags: args[2], aliases: args[3] })
    })

    return {
      r,
      ws: back.workspace,
      diskCheck: (failures) => verifyDisk(back.workspace, 'split', failures),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-page-meta] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
verifyReturns(merged.r, 'merged', failures)
merged.diskCheck(failures)

console.log(`[probe-page-meta] arm 2: split serve-back GET/POST（:${SPLIT_PORT}）`)
const split = await runSplitArm()
verifyReturns(split.r, 'split', failures)
split.diskCheck(failures)

console.log('\n[probe-page-meta] 双臂对读：')
const ck = (ok, label) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${label}`)
  if (!ok) failures.push(`consistency: ${label}`)
}

for (const [rel, want] of DISK_FILES) {
  const m = fs.readFileSync(path.join(MERGED_WS, 'wiki', rel), 'utf8')
  const s = fs.readFileSync(path.join(split.ws, 'wiki', rel), 'utf8')
  ck(m === s && m === want, `双臂 ${rel} 磁盘逐字节一致且等于期望态`)
}
ck(merged.r.roundRead1 === split.r.roundRead1, '双臂 page_meta 读回一致')
ck(merged.r.roundRead2 === split.r.roundRead2, '双臂 page_meta 删后读回一致')
ck(merged.r.titleRead1 === split.r.titleRead1, '双臂 title 面读回一致（PLAN-013）')
ck(merged.r.trioRead === split.r.trioRead, '双臂 三项读回一致（PLAN-013）')
ck(merged.r.quoteRead === split.r.quoteRead, '双臂 引号壳读回一致（PLAN-013）')

if (failures.length > 0) {
  console.error(`\n[probe-page-meta] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-page-meta] RESULT: merged + split 全案通过（011 十案 + 互作案 + 013 title 面五案双臂全绿）`)
