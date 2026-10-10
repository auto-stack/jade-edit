#!/usr/bin/env node
// probe_dir_ops.mjs — PLAN-014 T-01 delete_dir 六案 + rename_dir 六案直证
// （双臂）+ 嵌套案（merged 探针域）+ 链接零扰动归一 diff。
//
//   merged 臂  临时探针工程（e2e/.runtime/probe-dir-ops/，脚本生成——pac.at
//              render vm + src/back 整树拷贝 + probe_support.at[嵌套目录
//              造档通道——create_dir 清洗层结构性不含分隔符，仅探针消费，
//              非入库源] + 探针 widget Init 内直调全案，返回值落 model
//              字段），`auto run -r vm` 进程内 CALL——autoui_state dump
//              读回；直证后随 .runtime 再生存续（不入库源）。
//   split 臂   serve-back（`auto run --server vm`，同 matrix/e2e 后端配方）
//              POST /api/delete_dir、/api/rename_dir（JSON body——D-19 面：
//              目录路径/新名 CJK 常态走 body）。
//
// **probe C 定谳件**：File.remove_dir / File.remove_dir_all 可调性首闸
// ——别名双表在册[native_catalog 1014/1015]，同族 create_dir/is_dir
// 探针 A/B 已证；解析层不可调则探针工程 boot 即 fatal（D-24① 同判面），
// 全案绿 = 可调 + 语义双定谳。
//
// 案表（§6 十一案展开；期望值 = SD-1401 三步/五步定文）：
//   d① 根拒+非目录拒  delete_dir("") → ""；delete_dir("DelFile.ad") → ""
//   d② 递归基础       DirDel（2 档含内链）删除 → "DirDel"；目录+档全消
//   d③ 空目录         EmptyDir → "EmptyDir"；消
//   d④ CJK            临时目录（中文甲）→ "临时目录"；消
//   d⑤ 缺失再删       DirDel 再删 → ""（卫面——双复核前置）
//   r① 基础           DirRen（RenA+RenB）→ "DirRen2"；逐文件新位 + 字节
//                     整迁 + 旧目录消
//   r② 纯 .ad 卫      混入 notes.txt → ""；目录/档零变化（DirRen3 不在）
//   r③ 同层同名拒     → Sibling（同名目录）→ ""；→ Blocker（同名档）→ ""
//   r④ casefold 拒    DirRen2 → dirren2 → ""（006 G3 口径目录级）
//   r⑤ CJK            资料夹（中文乙）→ 归档夹 → "归档夹"；字节整迁
//   r⑥ 缺失拒         no-such-dir → ""
//   r⑦ 嵌套（merged） DirNest/sub/Deep.ad → "DirNest2"；余段迁移 + 旧
//                     嵌套目录清理（逆序 remove_dir 面）——setup 走
//                     probe_support.ws_join（split 臂无此通道，案跳过）
//   r⑧ 链接零扰动     link_index 前后定向 diff 归一相等（仅 path/
//                     target_path 字段变化——moved 集合归一 <MOVED> 后
//                     逐字节相等；三联对照目录级固化）双臂
//
// **PLAN-018 T-01 扩**（SD-1801——move_dir 七案 + depth 8 + url_decode
// 重勘；双臂）：
//   m① 基础           DirMove（MoveA+MoveB）→ Tgt → "Tgt/DirMove"；逐文件
//                     新位 + 字节整迁 + 旧目录消
//   m② 循环卫         → 自身（"DirMove"）→ ""；→ 后代（"DirMove/sub"
//                     ——merged 域）→ ""；零落盘
//   m③ 合并拒         Tgt2/DirMove 同名**文件**占位 → ""（双臂）；Tgt3/
//                     DirMove 同名**目录**（merged 域 ws_join）→ ""——
//                     目录合并 v1 不做（§10.2 r2 留口）
//   m④ 纯 .ad 卫      DirMove2 混入 notes.txt → ""；零变化
//   m⑤ 同父幂等       DirMove2（根）→ ""（new_parent=根=现父）→
//                     "DirMove2" 零变化
//   m⑥ CJK            目录丙（档丙.ad）→ Tgt → "Tgt/目录丙"；字节整迁
//   m⑦ 链接零扰动     link_index 前后定向 diff 归一相等（三联对照移动级
//                     ——与 r⑧/012 档移动同判）双臂
//   p⑨ depth 8 统一   link_index("",1) 不含 wiki/ 深度档而 ("",8) 全含
//                     （fs.tree depth 钳制语义双臂）；merged 域另造 5 层
//                     深档（L1/L2/L3/L4/Deep5.ad——ws_join）→ depth 8 含/
//                     depth 4 不含（**4→8 覆盖收窄收口直证**）+ search
//                     内部 8 walk 命中
//   p⑩ CJK exists     split 臂 POST exists{path:归档夹/中文乙.ad} → 1
//                     （PLAN-028 翻绿随校——017 GET query D-19 立案面随三
//                     契约 POST 化收口；0 = 免疫通道破——fail 即信号）
//
// **PLAN-019 T-01 扩**（SD-1901——move_dir 扩参 merge 九案；双臂）：
//   mb① 合并基础       DirMg（MgA.ad）→ MgTgt/DirMg（MgB.ad 已在）merge=true
//                      → "MgTgt/DirMg"；并入 + 源目录消 + 双档并存
//   mb② 冲突后缀保双份 DirMg2（MgC.ad=SrcC）→ 靶 MgC.ad=TgtC 在 →
//                      merge=true → MgC--1.ad 后缀新档字节整迁 + 靶原档
//                      不变（零数据丢失默认——trash_target 同族规则）
//   mb③ merge=false 拒 DirMg3 → 靶同名在 → "" 拒径回归（018 案零变化）
//   mb④ merge 循环卫   → 自身 merge=true → ""（循环卫先于合并分支）
//   mb⑤ merge 文件占位 → Tgt2/DirMove（**文件**）merge=true → ""（并入
//                      面是目录——同名文件占位仍拒）
//   mb⑥ 域卫·源        ".trash/NoDir" → ""（**F-R18-1 直证闭账案**——
//                      018 执行期加护无直证面，本批双面补证）
//   mb⑦ 域卫·目标      → ".trash" merge=true → ""（域卫先于合并分支）
//   mb⑧ CJK 合并       目录合并甲（档甲.ad）→ 合并靶/目录合并甲（靶档
//                      .ad 在）→ "合并靶/目录合并甲"；双档并存
//   mb⑨ 链接零扰动     DirMgLink（MgLink.ad 含 [[MoveA]]）→ MgTgt2
//                      （无冲突）merge=true → link_index 前后归一 diff
//                      相等（无冲突全入径=纯移动语义；冲突后缀档=新档
//                      零改写口径 SD-1901 注记随 mb② 磁盘案承载）
//
// **PLAN-025 T-03 扩**（SD-2501——move_dir 四参三择 + moves 映射返回形；
// **返回形 = JSON {"dir","moves"}——全案 dir 抽取随校 + 双臂 raw 字节
// 等值升级；m①..mb⑨ 全案 strategy="both" 四参化 = 零漂移回归承载**）：
//   s② skip 基础       SkA（SkP.ad=SrcP2）→ SkT（twin SkA/SkP.ad=SrcP
//                      在）merge=true skip → "SkT/SkA"；靶 twin 档逐字
//                      节不动 + 源冲突档 .trash/SkA/SkP.ad（SrcP2）+
//                      moves 恰一对[src→.trash 位]
//   s③ skip 多冲突     SkA 重建双档（SkP=SrcP3+SkQ=SrcQ）→ skip →
//                      .trash 序号续接 SkP--1.ad + 首入 SkQ.ad；moves
//                      二对集等
//   s④ overwrite 基础  OvA（OvP=SrcOv2+OvX 含 [[OvP]]）→ OvT（twin
//                      OvA/OvP.ad=TgtOv）overwrite → 靶旧档 .trash/
//                      OvT/OvA/OvP.ad + 源档落靶位逐字节 + 双映射对[
//                      靶旧→.trash + 源→靶位] + OvX 正常迁
//   s⑤ 策略×卫正交     循环卫/域卫双面/纯 .ad 卫/同名文件占位拒 ×
//                      skip/overwrite 八案全 "" 零变化（拒径与 strategy
//                      值无关直证）
//   s⑥ fail-closed     未知策略 "xxx"/空串 → ""（合法几何下仍拒——
//                      白名单前置直证）；UkD 磁盘零变化
//   s⑦ CJK skip        跳甲（跳档.ad=跳源2）→ 跳靶（twin 跳甲/跳档.ad
//                      =跳源）→ 靶档逐字节不动 + .trash/跳甲/跳档.ad
//   s⑧ 回滚弧          trash_restore 对 skip/overwrite 改道档：SkP--1
//                      恢复回源位去后缀名（SrcP3 逐字节）→ SkP.ad 再
//                      恢复受 exists 卫拒（""——v1 冲突守卫）→ overwrite
//                      占用期恢复受拒两步可回（occupant 移出后恢复
//                      TgtOv 逐字节）——probe_trash 域联证
//   s⑨ 链接零扰动     ov4 径 link_index 前后归一 diff 相等（m⑦ 口径
//                      三择径续——moved 集含 .trash 改道位归一）
//   s⑩ moves 完整性   成功径迁移档数 == 映射对数（mb①/mb②/s② 恰一
//                      对精确形；s③ 二对/s④ 三对[overwrite 双对计]
//                      集等；m⑤ 幂等 moves=[] 精确形）
//                      双臂
//
// 嵌套目标目录造档通道（双臂同构零 ws_join 依赖——write_text 不建父目
// 录，create_dir 清洗层不含分隔符）：MgBoot 根目录 + 档 → move_dir 入
// MgTgt → rename_dir 改名靶名——全部已证 back 通道五连。
//
// 双臂一致 = 返回值逐案相等 + link JSON 归一相等。D-21 负载窗 flake：
// 无-RESULT 早崩按 README 口径重跑即绿。
//
// 用法（仓根）：node tests/probe_dir_ops.mjs

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pickPort } from './pick_port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.AUTO_JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'
const RUNTIME = path.join(repoRoot, 'e2e', '.runtime')
const PROBE_DIR = path.join(RUNTIME, 'probe-dir-ops')
const MERGED_WS = path.join(RUNTIME, 'probe-dir-ops-workspace')
const MERGED_PORT = 9362
// 8251-8950 = WinNAT 排除区段（F-R8-1）；8222..8227 = 探针族在册口——
// 本案 8231（8228 首跑撞临时源端口 CLOSE_WAIT 出站连接[10048]——非监听
// 占用，顺延避让）。
const SPLIT_PORT = await pickPort()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 案表（双臂共享；expect = 归一路径 / ""）----
const CASES = [
  { id: 'd1-root', expect: '' },
  { id: 'd2-not-dir', expect: '' },
  { id: 'd3-recursive', expect: 'DirDel' },
  { id: 'd4-empty', expect: 'EmptyDir' },
  { id: 'd5-cjk', expect: '临时目录' },
  { id: 'd6-missing', expect: '' },
  { id: 'r1-basic', expect: 'DirRen2' },
  { id: 'r2-pur-ad', expect: '' },
  { id: 'r3a-same-dir', expect: '' },
  { id: 'r3b-same-file', expect: '' },
  { id: 'r4-casefold', expect: '' },
  { id: 'r5-cjk', expect: '归档夹' },
  { id: 'r6-missing', expect: '' },
  // PLAN-018 move_dir 六案（共享面——m2b/m3b 后代/同名目录形 merged 域）
  { id: 'm1-basic', expect: 'Tgt/DirMove' },
  { id: 'm2-cycle', expect: '' },
  { id: 'm3-merge-file', expect: '' },
  { id: 'm4-pur-ad', expect: '' },
  { id: 'm5-idem', expect: 'DirMove2' },
  { id: 'm6-cjk', expect: 'Tgt/目录丙' },
  // PLAN-019 move_dir merge 九案（SD-1901——共享面；嵌套靶 back 通道建成）
  { id: 'mb1-merge-basic', expect: 'MgTgt/DirMg' },
  { id: 'mb2-conflict-suffix', expect: 'MgTgt/DirMg2' },
  { id: 'mb3-merge-false', expect: '' },
  { id: 'mb4-merge-cycle', expect: '' },
  { id: 'mb5-merge-file-block', expect: '' },
  { id: 'mb6-trash-src', expect: '' },
  { id: 'mb7-trash-dst', expect: '' },
  { id: 'mb8-cjk-merge', expect: '合并靶/目录合并甲' },
  { id: 'mb9-link-merge', expect: 'MgTgt2/DirMgLink' },
  // PLAN-025 三择案组（SD-2501——返回 JSON dir 抽取随校；全案四参化）
  { id: 's2-skip-basic', expect: 'SkT/SkA' },
  { id: 's3-skip-multi', expect: 'SkT/SkA' },
  { id: 's4-over-basic', expect: 'OvT/OvA' },
  { id: 's5a-cycle-skip', expect: '' },
  { id: 's5b-cycle-over', expect: '' },
  { id: 's5c-trash-src', expect: '' },
  { id: 's5d-trash-dst', expect: '' },
  { id: 's5e-purad-skip', expect: '' },
  { id: 's5f-purad-over', expect: '' },
  { id: 's5g-block-skip', expect: '' },
  { id: 's5h-block-over', expect: '' },
  { id: 's6a-unknown', expect: '' },
  { id: 's6b-empty-strat', expect: '' },
  { id: 's7-cjk-skip', expect: '跳靶/跳甲' },
]
const RET_FIELD = {
  'd1-root': 'd1', 'd2-not-dir': 'd2', 'd3-recursive': 'd3', 'd4-empty': 'd4',
  'd5-cjk': 'd5', 'd6-missing': 'd6', 'r1-basic': 'r1', 'r2-pur-ad': 'r2',
  'r3a-same-dir': 'r3', 'r3b-same-file': 'r4', 'r4-casefold': 'r5',
  'r5-cjk': 'r6', 'r6-missing': 'r7',
  'm1-basic': 'm1', 'm2-cycle': 'm2', 'm3-merge-file': 'm3', 'm4-pur-ad': 'm4',
  'm5-idem': 'm5', 'm6-cjk': 'm6',
  'mb1-merge-basic': 'mb1', 'mb2-conflict-suffix': 'mb2', 'mb3-merge-false': 'mb3',
  'mb4-merge-cycle': 'mb4', 'mb5-merge-file-block': 'mb5', 'mb6-trash-src': 'mb6',
  'mb7-trash-dst': 'mb7', 'mb8-cjk-merge': 'mb8', 'mb9-link-merge': 'mb9',
  's2-skip-basic': 'sk2', 's3-skip-multi': 'sk3', 's4-over-basic': 'ov4',
  's5a-cycle-skip': 'g5a', 's5b-cycle-over': 'g5b', 's5c-trash-src': 'g5c',
  's5d-trash-dst': 'g5d', 's5e-purad-skip': 'g5e', 's5f-purad-over': 'g5f',
  's5g-block-skip': 'g5g', 's5h-block-over': 'g5h', 's6a-unknown': 'uk6a',
  's6b-empty-strat': 'uk6b', 's7-cjk-skip': 'cjk7',
}
// s⑩ moves 完整性期望（PLAN-025——成功径每迁移档恰一对；overwrite 双
// 对计；幂等 moves=[]。数组对 = [old,new]；set 形 = 顺序无关集合等）。
const MOVES_EXACT = {
  'm1-basic': [['DirMove/MoveA.ad', 'Tgt/DirMove/MoveA.ad'], ['DirMove/MoveB.ad', 'Tgt/DirMove/MoveB.ad']],
  'm5-idem': [],
  'mb1-merge-basic': [['DirMg/MgA.ad', 'MgTgt/DirMg/MgA.ad']],
  'mb2-conflict-suffix': [['DirMg2/MgC.ad', 'MgTgt/DirMg2/MgC--1.ad']],
  's2-skip-basic': [['SkA/SkP.ad', '.trash/SkA/SkP.ad']],
}
const MOVES_SET = {
  's3-skip-multi': { pairs: [['SkA/SkP.ad', '.trash/SkA/SkP--1.ad'], ['SkA/SkQ.ad', '.trash/SkA/SkQ.ad']] },
  's4-over-basic': { pairs: [['OvT/OvA/OvP.ad', '.trash/OvT/OvA/OvP.ad'], ['OvA/OvP.ad', 'OvT/OvA/OvP.ad'], ['OvA/OvX.ad', 'OvT/OvA/OvX.ad']] },
}
// r⑦ 嵌套（merged 探针域）+ r⑧ 链接面（link_index 前后采 dual field）
// + PLAN-018 m2b（循环卫后代形——ws_join 域）/m3b（合并拒同名目录形）
const MERGED_ONLY_CASES = [
  { id: 'r7-nested', expect: 'DirNest2', field: 'r8' },
  { id: 'm2b-cycle-desc', expect: '', field: 'm2b' },
  { id: 'm3b-merge-dir', expect: '', field: 'm3b' },
]

function prepareWorkspace(ws) {
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(ws, { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
}

const REN_B_BYTES = '# RenB\n\n正文。\n'
const REN_A_TMPL = '# RenA\n\n'
const CJK_YI_TMPL = '# 中文乙\n\n'

/** r⑧ 链接零扰动归一（vm_matrix ljNorm 同族——moved 集合 path/target_path
 *  归一 <MOVED> + 页序无关排序后逐字节比对）。dropBefore = 单侧剔除集
 *  （PLAN-025 s⑨ overwrite 2→1 塌缩：被覆盖靶旧档退出索引面[内容存续
 *  .trash walk 忽略域]——前态剔除使页集可比，后态占位页保留）。 */
function ljNorm(raw, movedSet, dropBefore = null) {
  const unesc = (s) => { try { return JSON.parse(`"${s}"`) } catch { return s } }
  try {
    const pages = JSON.parse(unesc(raw))
    const norm = (p) => (movedSet.has(p) ? '<MOVED>' : p)
    return JSON.stringify(pages.filter((p) => !(dropBefore && dropBefore.has(p.path))).map((p) => ({
      path: norm(p.path), title: p.title, dtitle: p.dtitle,
      links: p.links.map((l) => ({ ...l, target_path: norm(l.target_path) })),
    })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
  } catch {
    return '<unparsable>'
  }
}

/** PLAN-025 返回形 dir 抽取（返回 = JSON {"dir","moves"}；"" 拒哨兵
 *  原样穿透——非 JSON 形输入按原文返回）。 */
function dirOf(raw) {
  try {
    const v = JSON.parse(raw)
    if (v && typeof v === 'object' && typeof v.dir === 'string') return v.dir
  } catch { /* 非 JSON——拒哨兵形 */ }
  return raw
}

/** PLAN-025 moves 抽取（JSON 形 → [old,new][]；形外 = null）。 */
function movesOf(raw) {
  try {
    const v = JSON.parse(raw)
    if (v && typeof v === 'object' && Array.isArray(v.moves)) return v.moves
  } catch { /* 非 JSON */ }
  return null
}

/** split 臂 HTTP 封套剥离（serve-back 对 str 返回再 JSON 字符串编码一
 *  层——move_dir 的 JSON 返回形被双重编码；剥至内层 JSON 原文与 merged
 *  臂 dump 字段同形，双臂 raw 字节等值比较面归一）。 */
function unwrapStr(raw) {
  try {
    const v = JSON.parse(raw)
    if (typeof v === 'string') return v
  } catch { /* 非 JSON 封套——原文 */ }
  return raw
}

function diskAsserts(ws, tag, failures, opts = {}) {
  const nested = opts.nested === true
  const ck = (ok, label) => {
    console.log(`  [${tag}] ${ok ? 'PASS' : 'FAIL'} — ${label}`)
    if (!ok) failures.push(`${tag}: ${label}`)
  }
  const read = (rel) => {
    try { return fs.readFileSync(path.join(ws, rel), 'utf8') } catch { return null }
  }
  const isDir = (rel) => {
    try { return fs.statSync(path.join(ws, rel)).isDirectory() } catch { return false }
  }
  // d② 递归：目录+档全消
  ck(!isDir('DirDel'), 'd② DirDel/ 目录已消')
  ck(read('DirDel/DelPageA.ad') === null, 'd② DirDel/DelPageA.ad 已消')
  ck(read('DirDel/DelPageB.ad') === null, 'd② DirDel/DelPageB.ad 已消')
  // d③ 空目录
  ck(!isDir('EmptyDir'), 'd③ EmptyDir/ 已消')
  // d④ CJK
  ck(!isDir('临时目录'), 'd④ 临时目录/ 已消')
  // d⑤ 缺失再删零复活
  ck(!isDir('DirDel'), 'd⑤ DirDel/ 零复活')
  // d① 非目录拒：档原样
  ck(read('DelFile.ad') === '# DelFile\n\n', 'd① DelFile.ad 原样（非目录拒零落盘）')
  // r① 基础：旧无新有 + 字节整迁
  ck(!isDir('DirRen'), 'r① DirRen/ 旧目录已消')
  ck(read('DirRen2/RenA.ad') === REN_A_TMPL, 'r① DirRen2/RenA.ad 模板逐字节')
  ck(read('DirRen2/RenB.ad') === REN_B_BYTES, 'r① DirRen2/RenB.ad 字节整迁逐字节')
  // r② 纯 .ad 卫：目录零变化 + DirRen3 不在
  ck(isDir('DirRen2'), 'r② DirRen2/ 原样（卫拒零落盘）')
  ck(read('DirRen2/notes.txt') === 'x\n', 'r② notes.txt 原样')
  ck(!isDir('DirRen3'), 'r② DirRen3/ 不应在')
  ck(read('DirRen2/RenA.ad') === REN_A_TMPL, 'r② RenA.ad 原样')
  // r③ 同层同名拒两形：Sibling/Blocker 原样
  ck(isDir('Sibling'), 'r③ Sibling/ 原样')
  ck(read('Blocker.ad') === '# Blocker\n\n', 'r③ Blocker.ad 原样')
  ck(isDir('DirRen2'), 'r③ DirRen2/ 原样')
  // r④ casefold：目录名 casefold 计数恰 1（Windows 不敏感 FS——probe_rename ⑧ 同款）
  const rootEntries = fs.readdirSync(ws)
  const drCount = rootEntries.filter((f) => f.toLowerCase() === 'dirren2').length
  ck(drCount === 1, `r④ dirren2 casefold 计数=1（实际 ${drCount}）`)
  // r⑤ CJK
  ck(!isDir('资料夹'), 'r⑤ 资料夹/ 旧目录已消')
  ck(read('归档夹/中文乙.ad') === CJK_YI_TMPL, 'r⑤ 归档夹/中文乙.ad 模板逐字节')
  // r⑥ 缺失拒
  ck(!isDir('xx'), 'r⑥ xx/ 不应在')
  // r⑦ 嵌套（merged 探针域）
  if (nested) {
    ck(!isDir('DirNest'), 'r⑦ DirNest/ 旧目录已消（含嵌套清理）')
    ck(isDir('DirNest2/sub'), 'r⑦ DirNest2/sub/ 镜像嵌套目录在')
    ck(read('DirNest2/sub/Deep.ad') === '# Deep\n\n', 'r⑦ DirNest2/sub/Deep.ad 余段迁移逐字节')
  }
  // —— PLAN-018 move_dir 面（SD-1801）——
  // m① 基础：旧无新有 + 字节整迁
  ck(!isDir('DirMove'), 'm① DirMove/ 旧目录已消')
  ck(read('Tgt/DirMove/MoveA.ad') === '# MoveA\n\n', 'm① Tgt/DirMove/MoveA.ad 模板逐字节')
  ck(read('Tgt/DirMove/MoveB.ad') === '# MoveB\n\n正文乙。\n', 'm① Tgt/DirMove/MoveB.ad 字节整迁逐字节')
  // m②③ 循环/合并拒：目标零变化（目录留置 + 占位原样）
  ck(isDir('Tgt/DirMove'), 'm②③ Tgt/DirMove/ 原样（循环卫/合并拒零落盘）')
  ck(read('Tgt2/DirMove') === 'x\n', 'm③a Tgt2/DirMove 文件占位原样')
  ck(read('Tgt/DirMove/MoveA.ad') === '# MoveA\n\n', 'm②③ MoveA.ad 原样（拒后未动）')
  // m④ 纯 .ad 卫：notes.txt 原样 + 不迁移
  ck(read('Tgt/DirMove/notes.txt') === 'x\n', 'm④ notes.txt 原样（卫拒零落盘）')
  ck(!isDir('Tgt4/DirMove'), 'm④ Tgt4/DirMove 不应在')
  // m⑤ 同父幂等：零变化
  ck(isDir('DirMove2'), 'm⑤ DirMove2/ 原样（同父幂等零变化）')
  ck(read('DirMove2/MoveC.ad') === '# MoveC\n\n', 'm⑤ DirMove2/MoveC.ad 原样')
  // m⑥ CJK
  ck(!isDir('目录丙'), 'm⑥ 目录丙/ 旧目录已消')
  ck(read('Tgt/目录丙/档丙.ad') === '# 档丙\n\n', 'm⑥ Tgt/目录丙/档丙.ad 模板逐字节')
  // merged 域形（m2b 后代占位 sub 目录 / m3b 同名目录占位——拒后留置）
  if (nested) {
    ck(isDir('Tgt/DirMove/sub'), 'm2b Tgt/DirMove/sub/ 占位原样（后代循环拒零落盘）')
    ck(isDir('Tgt3/DirMove'), 'm3b Tgt3/DirMove/ 同名目录占位原样（合并拒）')
  }
  // —— PLAN-019 merge 面（SD-1901）——
  // mb① 合并基础：并入 + 源消 + 双档并存
  ck(read('MgTgt/DirMg/MgA.ad') === '# MgA\n\n', 'mb① MgTgt/DirMg/MgA.ad 并入逐字节')
  ck(read('MgTgt/DirMg/MgB.ad') === '# MgB\n\n', 'mb① MgTgt/DirMg/MgB.ad 靶原档不变')
  ck(!isDir('DirMg'), 'mb① DirMg/ 源目录已消')
  // mb② 冲突后缀保双份：靶原档不变 + 后缀新档字节整迁
  ck(read('MgTgt/DirMg2/MgC.ad') === '# TgtC\n\n', 'mb② MgC.ad 靶原档不变')
  ck(read('MgTgt/DirMg2/MgC--1.ad') === '# SrcC\n\n', 'mb② MgC--1.ad 后缀新档字节整迁')
  ck(!isDir('DirMg2'), 'mb② DirMg2/ 源目录已消')
  // mb③ merge=false 拒径回归：零变化
  ck(isDir('DirMg3'), 'mb③ DirMg3/ 原样（拒径零落盘）')
  ck(read('DirMg3/MgD.ad') === '# MgD\n\n', 'mb③ DirMg3/MgD.ad 原样')
  ck(read('MgTgt/DirMg3/MgE.ad') === '# MgE\n\n', 'mb③ 靶 MgE.ad 原样')
  ck(read('MgTgt/DirMg3/MgD.ad') === null, 'mb③ 靶无 MgD（未并入）')
  // mb④⑤ merge=true 循环卫/文件占位：零变化
  ck(isDir('Tgt/DirMove'), 'mb④⑤ Tgt/DirMove/ 原样（循环卫先于合并分支）')
  ck(read('Tgt/DirMove/MoveA.ad') === '# MoveA\n\n', 'mb④ MoveA.ad 原样')
  ck(read('Tgt2/DirMove') === 'x\n', 'mb⑤ Tgt2/DirMove 文件占位原样（并入面是目录）')
  // mb⑥⑦ .trash 域卫双面：拒绝操作零残留（.trash 本体 = d②/d④ delete
  // 改道案合法副产物——在册态；域卫直证 = 被拒操作在 .trash 内零落点。
  // F-R18-1 闭账案）
  ck(!isDir('.trash/NoDir'), 'mb⑥ .trash/NoDir 零创建（源域卫拒——零落盘）')
  ck(!isDir('.trash/DirMove'), 'mb⑦ .trash/DirMove 零创建（目标域卫拒 merge=true 亦不绕——零落盘）')
  ck(read('.trash/DirDel/DelPageA.ad') === '# DelPageA\n\n', '域卫在册态：.trash 改道档原样（d② 副产物非本案面）')
  // mb⑧ CJK 合并：双档并存
  ck(read('合并靶/目录合并甲/档甲.ad') === '# 档甲\n\n', 'mb⑧ 档甲.ad 并入逐字节')
  ck(read('合并靶/目录合并甲/靶档.ad') === '# 靶档\n\n', 'mb⑧ 靶档.ad 靶原档不变')
  ck(!isDir('目录合并甲'), 'mb⑧ 目录合并甲/ 源目录已消')
  // mb⑨ 链接案源迁移逐字节
  ck(read('MgTgt2/DirMgLink/MgLink.ad') === '# MgLink\n\n见 [[MoveA]] 一处。\n', 'mb⑨ MgLink.ad 迁移逐字节')
  // —— PLAN-025 三择面（SD-2501）——
  // s② skip 基础：靶 twin 档逐字节不动 + 源冲突档 .trash 改道 + 源目录消
  ck(read('SkT/SkA/SkP.ad') === '# SrcP\n\n', 's② SkT/SkA/SkP.ad 靶 twin 档逐字节不动（skip 零触碰）')
  ck(read('.trash/SkA/SkQ.ad') === '# SrcQ\n\n', 's③ .trash/SkA/SkQ.ad 首入改道逐字节')
  ck(isDir('SkA'), 's②③ SkA/ 仅 rs⑧ 恢复重建位（重建复消后恢复面重建——SkP.ad 逐字节随 s⑧ 断言）')
  // s③ skip 多冲突：.trash 序号续接（SkP--1 = rs⑧ 已恢复出——恢复面断言）
  ck(!fs.existsSync(path.join(ws, '.trash', 'SkA', 'SkP--1.ad')), 's③⑧ .trash/SkA/SkP--1.ad 已随 rs⑧ 恢复出（.trash 清位）')
  ck(read('SkT/SkA/SkQ.ad') === '# TgtQ\n\n', 's③ SkT/SkA/SkQ.ad 靶 twin 档逐字节不动')
  // s④ overwrite：靶旧档 .trash + 源档落靶位逐字节 + OvX 正常迁
  ck(read('OvT/OvA/OvP.ad') === '# TgtOv\n\n', 's④⑧ OvT/OvA/OvP.ad = 靶旧档恢复回位逐字节（rs⑧ 两步可回）')
  ck(read('.trash/OvT/OvA/OvP.ad') === null, 's④⑧ .trash/OvT/OvA/OvP.ad 已随 rs⑧ 恢复出（.trash 清位）')
  ck(read('OvT/OvA/OvX.ad') === '# OvX\n\n见 [[OvP]] 一处。\n', 's④ OvX.ad 正常迁移逐字节')
  ck(!isDir('OvA'), 's④ OvA/ 源目录已消')
  ck(read('UkD/OvP.ad') === '# SrcOv2\n\n', 's④⑧ UkD/OvP.ad 占用档移出逐字节（恢复前置步）')
  // s⑤ 卫正交：GuardD/BlockD/UkD 零变化 + 占位原样
  ck(read('GuardD/G.ad') === '# G\n\n', 's⑤ GuardD/G.ad 原样（纯 .ad 卫拒零落盘）')
  ck(read('GuardD/notes.txt') === 'x\n', 's⑤ GuardD/notes.txt 原样')
  ck(read('SkT/BlockD') === 'x\n', 's⑤ SkT/BlockD 文件占位原样')
  ck(read('BlockD/B.ad') === '# B\n\n', 's⑤ BlockD/B.ad 原样（同名文件占位拒零落盘）')
  ck(read('UkD/U.ad') === '# U\n\n', 's⑥ UkD/U.ad 原样（fail-closed 拒零落盘）')
  // s⑦ CJK skip：靶 twin 档不动 + 改道 .trash
  ck(read('跳靶/跳甲/跳档.ad') === '# 跳源\n\n', 's⑦ 跳靶/跳甲/跳档.ad 靶 twin 档逐字节不动')
  ck(read('.trash/跳甲/跳档.ad') === '# 跳源2\n\n', 's⑦ .trash/跳甲/跳档.ad 改道逐字节')
  // s⑧ 回滚弧：SkP--1 恢复回源位去后缀名（SrcP3）；SkP.ad 再恢复受卫拒
  ck(read('SkA/SkP.ad') === '# SrcP3\n\n', 's⑧ SkA/SkP.ad = SkP--1 恢复回源位去后缀名逐字节')
  // 副作用圈定：根 .ad 集合恰为四档（+LinkSrc2——PLAN-018 素材）；语料 json 不动
  const rootAds = rootEntries.filter((f) => f.endsWith('.ad')).sort()
  ck(rootAds.join(',') === 'Blocker.ad,DelFile.ad,LinkSrc.ad,LinkSrc2.ad', `根 .ad 集合恰为四档（实际：${rootAds.join(', ')}）`)
  ck(read('jade-garden-index.json') !== null, '语料 jade-garden-index.json 在盘（非 .ad 零涉）')
}

// ---------------- merged 臂：探针工程 + 进程内直调 ----------------

const PROBE_AT = `// 探针 widget（tests/probe_dir_ops.mjs 生成件——直证后随 .runtime 再生，
// 非入库源）。Init 内进程内直调 setup + delete_dir 六案 + rename_dir 六案
// + 嵌套案 + link_index 前后采，返回值落 model 字段供 autoui_state dump。
// 入口文件名固定 app.at（auto 前端入口约定）。
use back.api: create_dir, move_page, create_page, write_wiki, delete_dir, rename_dir, move_dir, link_index, search_wiki, trash_restore
use back.probe_support: ws_join

widget App {
    msg { Init }
    model {
        var done bool = false
        var s1 str = ""
        var s2 str = ""
        var s3 str = ""
        var s4 str = ""
        var s5 str = ""
        var s6 str = ""
        var s7 str = ""
        var s8 str = ""
        var s9 str = ""
        var s10 str = ""
        var s11 str = ""
        var s12 str = ""
        var s13 str = ""
        var s14 str = ""
        var s15 str = ""
        var d1 str = ""
        var d2 str = ""
        var d3 str = ""
        var d4 str = ""
        var d5 str = ""
        var d6 str = ""
        var l1 str = ""
        var r1 str = ""
        var r2 str = ""
        var r3 str = ""
        var r4 str = ""
        var r5 str = ""
        var r6 str = ""
        var r7 str = ""
        var r8 str = ""
        var w1 bool = false
        var l2 str = ""
        // —— PLAN-018 扩（SD-1801——move_dir/depth/search 面）——
        var s16 str = ""
        var s17 str = ""
        var s18 bool = false
        var s19 str = ""
        var s20 str = ""
        var s21 str = ""
        var s22 bool = false
        var s23 str = ""
        var s24 bool = false
        var s25 str = ""
        var s26 str = ""
        var s27 bool = false
        var s28 str = ""
        var l3 str = ""
        var l4 str = ""
        var l5 str = ""
        var m8 str = ""
        var l6 str = ""
        var m1 str = ""
        var m2 str = ""
        var m2b str = ""
        var m3 str = ""
        var m3b str = ""
        var w2 bool = false
        var m4 str = ""
        var m5 str = ""
        var m6 str = ""
        var l7 str = ""
        // —— PLAN-019 扩（SD-1901——move_dir merge 面）——
        var s29 str = ""
        var s30 str = ""
        var s31 str = ""
        var s32 str = ""
        var s33 str = ""
        var mb1 str = ""
        var mb2 str = ""
        var mb3 str = ""
        var mb4 str = ""
        var mb5 str = ""
        var mb6 str = ""
        var mb7 str = ""
        var mb8 str = ""
        var mb9 str = ""
        var l8 str = ""
        var l9 str = ""
        // —— PLAN-025 扩（SD-2501——move_dir 三择 + moves 映射面）——
        var s34 str = ""
        var s35 bool = false
        var s36 bool = false
        var s37 str = ""
        var s38 str = ""
        var s39 bool = false
        var s40 bool = false
        var s41 bool = false
        var sk2 str = ""
        var sk3 str = ""
        var s42 str = ""
        var s43 str = ""
        var s44 str = ""
        var s45 bool = false
        var ov4 str = ""
        var l10 str = ""
        var l11 str = ""
        var s46 bool = false
        var g5a str = ""
        var g5b str = ""
        var g5c str = ""
        var g5d str = ""
        var g5e str = ""
        var g5f str = ""
        var g5g str = ""
        var g5h str = ""
        var s47 bool = false
        var uk6a str = ""
        var uk6b str = ""
        var s48 str = ""
        var s49 bool = false
        var cjk7 str = ""
        var rs8a str = ""
        var rs8b str = ""
        var rs8c str = ""
        var rs8d str = ""
    }
    view {
        col (style: "h-full w-full items-center justify-center") {
            text "probe: dir ops (delete/rename/move)" { style: "text-[13px] text-muted-foreground" }
        }
    }
    on {
        .Init -> {
            // setup（自证字段 s1..s15——一调用一字段）
            s1 = create_page("DelFile")
            s2 = create_dir("DirDel")
            s3 = create_page("DelPageA")
            s4 = move_page("DelPageA.ad", "DirDel")
            s5 = write_wiki("DirDel/DelPageB.ad", "# B\\n\\n[[DelPageA]]\\n")
            s6 = create_dir("EmptyDir")
            s7 = create_dir("临时目录")
            s8 = create_page("中文甲")
            s9 = move_page("中文甲.ad", "临时目录")
            s10 = create_dir("DirRen")
            s11 = create_page("RenA")
            s12 = move_page("RenA.ad", "DirRen")
            s13 = write_wiki("DirRen/RenB.ad", "# RenB\\n\\n正文。\\n")
            s14 = create_dir("Sibling")
            s14 = create_page("Blocker")
            s15 = create_dir("资料夹")
            s15 = create_page("中文乙")
            s15 = move_page("中文乙.ad", "资料夹")
            s15 = ws_join("DirNest/sub")
            s15 = write_wiki("DirNest/sub/Deep.ad", "# Deep\\n\\n")
            s15 = create_page("LinkSrc")
            s15 = write_wiki("LinkSrc.ad", "# LS\\n\\n[[RenA]] 与 [[RenB]]。\\n")
            // delete_dir 六案（d①..d⑤——⑤ 缺失再删在 d② 后）
            d1 = delete_dir("")
            d2 = delete_dir("DelFile.ad")
            d3 = delete_dir("DirDel")
            d4 = delete_dir("EmptyDir")
            d5 = delete_dir("临时目录")
            d6 = delete_dir("DirDel")
            // r⑧ 链接前采（删除面已收口——DirDel 页不在窗内）
            l1 = link_index("", 4)
            // rename_dir 六案
            r1 = rename_dir("DirRen", "DirRen2")
            w1 = write_wiki("DirRen2/notes.txt", "x\\n")
            r2 = rename_dir("DirRen2", "DirRen3")
            r3 = rename_dir("DirRen2", "Sibling")
            r4 = rename_dir("DirRen2", "Blocker")
            r5 = rename_dir("DirRen2", "dirren2")
            r6 = rename_dir("资料夹", "归档夹")
            r7 = rename_dir("no-such-dir", "xx")
            r8 = rename_dir("DirNest", "DirNest2")
            l2 = link_index("", 4)
            // —— PLAN-018 setup（自证 s16..s28）：move 素材 + depth 深档 ——
            s16 = create_dir("Tgt")
            s17 = create_dir("Tgt2")
            s18 = write_wiki("Tgt2/DirMove", "x\\n")
            s19 = create_dir("Tgt4")
            s20 = create_dir("DirMove")
            s21 = create_page("MoveA")
            s21 = move_page("MoveA.ad", "DirMove")
            s22 = write_wiki("DirMove/MoveB.ad", "# MoveB\\n\\n正文乙。\\n")
            s23 = create_dir("DirMove2")
            s24 = write_wiki("DirMove2/MoveC.ad", "# MoveC\\n\\n")
            s25 = create_dir("目录丙")
            s26 = create_page("档丙")
            s26 = move_page("档丙.ad", "目录丙")
            s27 = create_page("LinkSrc2")
            s27 = write_wiki("LinkSrc2.ad", "# LS2\\n\\n[[MoveA]] 与 [[MoveB]] 与 [[档丙]]。\\n")
            // p⑨ depth 案（深档 5 层——ws_join 域）+ 三深度采（移动前）
            s28 = ws_join("L1/L2/L3/L4")
            s28 = write_wiki("L1/L2/L3/L4/Deep5.ad", "# Deep5\\n\\n")
            l3 = link_index("", 1)
            l4 = link_index("", 8)
            l5 = link_index("", 4)
            m8 = search_wiki("Deep5", 5)
            // move_dir 六案 + 前后链接采（**PLAN-025：全案四参化**——
            // strategy="both" = v1 行为零漂移回归承载）
            l6 = link_index("", 4)
            m1 = move_dir("DirMove", "Tgt", false, "both")
            m2 = move_dir("Tgt/DirMove", "Tgt/DirMove", false, "both")
            s28 = ws_join("Tgt/DirMove/sub")
            m2b = move_dir("Tgt/DirMove", "Tgt/DirMove/sub", false, "both")
            m3 = move_dir("Tgt/DirMove", "Tgt2", false, "both")
            s28 = ws_join("Tgt3/DirMove")
            m3b = move_dir("Tgt/DirMove", "Tgt3", false, "both")
            w2 = write_wiki("Tgt/DirMove/notes.txt", "x\\n")
            m4 = move_dir("Tgt/DirMove", "Tgt4", false, "both")
            m5 = move_dir("DirMove2", "", false, "both")
            m6 = move_dir("目录丙", "Tgt", false, "both")
            l7 = link_index("", 4)
            // —— PLAN-019 merge 面（SD-1901）——setup：嵌套靶目录 back
            // 通道建成（MgBoot 根建+档 → move_dir 入 MgTgt → rename_dir
            // 改靶名——双臂同构零 ws_join 依赖）+ merge 九案（**PLAN-025
            // 全案四参化 both**）。
            s29 = create_dir("MgTgt")
            s29 = create_dir("MgBoot")
            s29 = create_page("MgB")
            s29 = move_page("MgB.ad", "MgBoot")
            s29 = move_dir("MgBoot", "MgTgt", false, "both")
            s29 = rename_dir("MgTgt/MgBoot", "DirMg")
            s29 = create_dir("DirMg")
            s29 = create_page("MgA")
            s29 = move_page("MgA.ad", "DirMg")
            mb1 = move_dir("DirMg", "MgTgt", true, "both")
            s30 = create_dir("MgBoot2")
            s30 = create_page("MgC")
            s30 = move_page("MgC.ad", "MgBoot2")
            s30 = write_wiki("MgBoot2/MgC.ad", "# TgtC\\n\\n")
            s30 = move_dir("MgBoot2", "MgTgt", false, "both")
            s30 = rename_dir("MgTgt/MgBoot2", "DirMg2")
            s30 = create_dir("DirMg2")
            s30 = create_page("MgC")
            s30 = write_wiki("MgC.ad", "# SrcC\\n\\n")
            s30 = move_page("MgC.ad", "DirMg2")
            mb2 = move_dir("DirMg2", "MgTgt", true, "both")
            s31 = create_dir("MgBoot3")
            s31 = create_page("MgE")
            s31 = move_page("MgE.ad", "MgBoot3")
            s31 = move_dir("MgBoot3", "MgTgt", false, "both")
            s31 = rename_dir("MgTgt/MgBoot3", "DirMg3")
            s31 = create_dir("DirMg3")
            s31 = create_page("MgD")
            s31 = move_page("MgD.ad", "DirMg3")
            mb3 = move_dir("DirMg3", "MgTgt", false, "both")
            mb4 = move_dir("Tgt/DirMove", "Tgt/DirMove", true, "both")
            mb5 = move_dir("Tgt/DirMove", "Tgt2", true, "both")
            mb6 = move_dir(".trash/NoDir", "Tgt", false, "both")
            mb7 = move_dir("Tgt/DirMove", ".trash", true, "both")
            s32 = create_dir("合并靶")
            s32 = create_dir("MgCjkBoot")
            s32 = create_page("靶档")
            s32 = move_page("靶档.ad", "MgCjkBoot")
            s32 = move_dir("MgCjkBoot", "合并靶", false, "both")
            s32 = rename_dir("合并靶/MgCjkBoot", "目录合并甲")
            s32 = create_dir("目录合并甲")
            s32 = create_page("档甲")
            s32 = move_page("档甲.ad", "目录合并甲")
            mb8 = move_dir("目录合并甲", "合并靶", true, "both")
            s33 = create_dir("MgTgt2")
            s33 = create_dir("DirMgLink")
            s33 = create_page("MgLink")
            s33 = write_wiki("MgLink.ad", "# MgLink\\n\\n见 [[MoveA]] 一处。\\n")
            s33 = move_page("MgLink.ad", "DirMgLink")
            l8 = link_index("", 4)
            mb9 = move_dir("DirMgLink", "MgTgt2", true, "both")
            l9 = link_index("", 4)
            // —— PLAN-025 三择面（SD-2501）——skip 基础/多冲突（twin 目
            // 标靶经 move_dir+rename_dir 双通道建成）+ overwrite 基础（
            // 链接零扰动前后采）+ 卫正交八案 + fail-closed + CJK skip +
            // trash_restore 回滚弧。
            s34 = create_dir("SkT")
            s35 = write_wiki("SkT/SkP.ad", "# TgtP\\n\\n")
            s36 = create_dir("SkBoot")
            s36 = write_wiki("SkBoot/SkP.ad", "# SrcP\\n\\n")
            s37 = move_dir("SkBoot", "SkT", false, "both")
            s38 = rename_dir("SkT/SkBoot", "SkA")
            s39 = create_dir("SkA")
            s39 = write_wiki("SkA/SkP.ad", "# SrcP2\\n\\n")
            sk2 = move_dir("SkA", "SkT", true, "skip")
            s40 = write_wiki("SkT/SkA/SkQ.ad", "# TgtQ\\n\\n")
            s41 = create_dir("SkA")
            s41 = write_wiki("SkA/SkP.ad", "# SrcP3\\n\\n")
            s41 = write_wiki("SkA/SkQ.ad", "# SrcQ\\n\\n")
            sk3 = move_dir("SkA", "SkT", true, "skip")
            s42 = create_dir("OvT")
            s43 = create_dir("OvA0")
            s43 = write_wiki("OvA0/OvP.ad", "# TgtOv\\n\\n")
            s43 = move_dir("OvA0", "OvT", false, "both")
            s44 = rename_dir("OvT/OvA0", "OvA")
            s45 = create_dir("OvA")
            s45 = write_wiki("OvA/OvP.ad", "# SrcOv2\\n\\n")
            s45 = write_wiki("OvA/OvX.ad", "# OvX\\n\\n见 [[OvP]] 一处。\\n")
            l10 = link_index("", 4)
            ov4 = move_dir("OvA", "OvT", true, "overwrite")
            l11 = link_index("", 4)
            s46 = create_dir("GuardD")
            s46 = write_wiki("GuardD/G.ad", "# G\\n\\n")
            s46 = write_wiki("GuardD/notes.txt", "x\\n")
            g5a = move_dir("SkT", "SkT", true, "skip")
            g5b = move_dir("SkT", "SkT", true, "overwrite")
            g5c = move_dir(".trash/NoDir", "SkT", true, "skip")
            g5d = move_dir("SkT", ".trash", true, "overwrite")
            g5e = move_dir("GuardD", "SkT", true, "skip")
            g5f = move_dir("GuardD", "SkT", true, "overwrite")
            s46 = write_wiki("SkT/BlockD", "x\\n")
            s46 = create_dir("BlockD")
            s46 = write_wiki("BlockD/B.ad", "# B\\n\\n")
            g5g = move_dir("BlockD", "SkT", true, "skip")
            g5h = move_dir("BlockD", "SkT", true, "overwrite")
            s47 = create_dir("UkD")
            s47 = write_wiki("UkD/U.ad", "# U\\n\\n")
            uk6a = move_dir("UkD", "SkT", false, "xxx")
            uk6b = move_dir("UkD", "SkT", false, "")
            s48 = create_dir("跳靶")
            s48 = create_dir("跳Boot")
            s48 = write_wiki("跳Boot/跳档.ad", "# 跳源\\n\\n")
            s48 = move_dir("跳Boot", "跳靶", false, "both")
            s48 = rename_dir("跳靶/跳Boot", "跳甲")
            s49 = create_dir("跳甲")
            s49 = write_wiki("跳甲/跳档.ad", "# 跳源2\\n\\n")
            cjk7 = move_dir("跳甲", "跳靶", true, "skip")
            rs8a = trash_restore(".trash/SkA/SkP--1.ad")
            rs8b = trash_restore(".trash/SkA/SkP.ad")
            rs8c = move_page("OvT/OvA/OvP.ad", "UkD")
            rs8d = trash_restore(".trash/OvT/OvA/OvP.ad")
            done = true
        }
    }
}
`

const PROBE_SUPPORT_AT = `// 探针专用支撑件（tests/probe_dir_ops.mjs 生成——随 .runtime 再生，非
// 入库源）：嵌套目录造档通道。create_dir 清洗层 "/"→'-' 结构性不含分隔
// 符（SD-1201 v1 单层口径），r⑦ 嵌套案 setup 专用——直调 File.create_dir
//（create_dir_all 递归语义，探针 A 定谳）+ is_dir 复核。
fn ws_root() str {
    var root str = Env.get("AUTO_JADE_WORKSPACE")
    if root == "" {
        root = Env.get("AUTO_PROJECT_DIR")
    }
    if root == "" {
        root = "."
    }
    return root
}

pub fn ws_join(rel str) str {
    var full str = ws_root() + "/" + rel
    File.create_dir(full)
    if File.is_dir(full) {
        return rel
    }
    return ""
}
`

function buildProbeProject() {
  fs.rmSync(PROBE_DIR, { recursive: true, force: true })
  fs.mkdirSync(path.join(PROBE_DIR, 'src', 'front'), { recursive: true })
  fs.cpSync(path.join(repoRoot, 'src', 'back'), path.join(PROBE_DIR, 'src', 'back'), { recursive: true })
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'back', 'probe_support.at'), PROBE_SUPPORT_AT, 'utf8')
  fs.writeFileSync(path.join(PROBE_DIR, 'src', 'front', 'app.at'), PROBE_AT, 'utf8')
  fs.writeFileSync(
    path.join(PROBE_DIR, 'pac.at'),
    `name: "auto-jade-probe-dir-ops"
version: "0.1.0"
scene: "ui"
render: ["vm"]
title: "ProbeDirOps"
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

// dump 字符串字段捕获（\" 转义面）+ 反转义回实际串
const strField = (dump, name) => {
  const raw = dump.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1]
  if (raw === undefined) return null
  try { return JSON.parse(`"${raw}"`) } catch { return raw }
}
const boolField = (dump, name) => dump.match(new RegExp(`${name}:\\s*(true|1|false|0)`))?.[1]

async function runMergedArm() {
  prepareWorkspace(MERGED_WS)
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
        await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'auto-jade-probe-dir-ops', version: '0.1.0' } })
        break
      } catch (err) {
        if (app.exitCode !== null) throw new Error(`probe app exited early (code ${app.exitCode}):\n${appOut.slice(-1500)}`)
        if (Date.now() > deadline) throw new Error(`MCP not reachable: ${err.message}`)
        await sleep(500)
      }
    }
    // 轮询等 Init 直调链落定（done=true）
    const pollDeadline = Date.now() + 30000
    let dump = ''
    for (;;) {
      dump = (await callTool('autoui_state', {})).trim()
      if (/done:\s*true/.test(dump)) break
      if (Date.now() > pollDeadline) throw new Error(`probe Init never completed:\n${dump.slice(0, 800)}\n---\n${appOut.slice(-800)}`)
      await sleep(300)
    }
    // setup 自证（失败先抛——案值失真前置排除）
    const truthy = (v) => v !== null && v !== '0' && v !== 'false'
    const setupOk = strField(dump, 's1') === 'DelFile.ad' && strField(dump, 's2') === 'DirDel'
      && strField(dump, 's3') === 'DelPageA.ad' && strField(dump, 's4') === 'DirDel/DelPageA.ad'
      && truthy(boolField(dump, 's5')) && strField(dump, 's6') === 'EmptyDir'
      && strField(dump, 's7') === '临时目录' && strField(dump, 's8') === '中文甲.ad'
      && strField(dump, 's9') === '临时目录/中文甲.ad' && strField(dump, 's10') === 'DirRen'
      && strField(dump, 's11') === 'RenA.ad' && strField(dump, 's12') === 'DirRen/RenA.ad'
      && truthy(boolField(dump, 's13')) && strField(dump, 's14') === 'Blocker.ad'
      && truthy(boolField(dump, 's15'))
    if (!setupOk) throw new Error(`probe setup failed:\n${dump.slice(0, 1200)}`)
    // PLAN-018 setup 自证（s16..s28）
    const setupOk2 = strField(dump, 's16') === 'Tgt' && strField(dump, 's17') === 'Tgt2'
      && truthy(boolField(dump, 's18')) && strField(dump, 's19') === 'Tgt4'
      && strField(dump, 's20') === 'DirMove' && strField(dump, 's21') === 'DirMove/MoveA.ad'
      && truthy(boolField(dump, 's22')) && strField(dump, 's23') === 'DirMove2'
      && truthy(boolField(dump, 's24')) && strField(dump, 's25') === '目录丙'
      && strField(dump, 's26') === '目录丙/档丙.ad' && truthy(boolField(dump, 's27'))
      && strField(dump, 's28') === 'Tgt3/DirMove'
    if (!setupOk2) throw new Error(`probe setup (PLAN-018) failed:\n${dump.slice(0, 1200)}`)
    // PLAN-019 setup 自证（s29..s33——嵌套靶 back 通道 + 源目录就位）
    const setupOk3 = strField(dump, 's29') === 'DirMg/MgA.ad' && strField(dump, 's30') === 'DirMg2/MgC.ad'
      && strField(dump, 's31') === 'DirMg3/MgD.ad' && strField(dump, 's32') === '目录合并甲/档甲.ad'
      && strField(dump, 's33') === 'DirMgLink/MgLink.ad'
    if (!setupOk3) throw new Error(`probe setup (PLAN-019) failed:\n${dump.slice(0, 1200)}`)
    // PLAN-025 setup 自证（s34..s49——三择素材链关键回执：twin 靶 move+
    // rename 双通道、Ov 链、CJK 链；move_dir 回执 = JSON 形 dir 抽取）
    const setupOk4 = dirOf(strField(dump, 's37')) === 'SkT/SkBoot' && strField(dump, 's38') === 'SkT/SkA'
      && truthy(boolField(dump, 's35')) && truthy(boolField(dump, 's40'))
      && dirOf(strField(dump, 's43')) === 'OvT/OvA0' && strField(dump, 's44') === 'OvT/OvA'
      && truthy(boolField(dump, 's46')) && truthy(boolField(dump, 's47'))
      && strField(dump, 's48') === '跳靶/跳甲' && truthy(boolField(dump, 's49'))
    if (!setupOk4) throw new Error(`probe setup (PLAN-025) failed:\n${dump.slice(0, 2400)}`)
    const returns = {}
    for (const c of CASES) {
      returns[c.id] = strField(dump, RET_FIELD[c.id])
      if (returns[c.id] === null) throw new Error(`probe state missing ${RET_FIELD[c.id]}:\n${dump.slice(0, 800)}`)
    }
    for (const c of MERGED_ONLY_CASES) {
      returns[c.id] = strField(dump, c.field)
      if (returns[c.id] === null) throw new Error(`probe state missing ${c.field}`)
    }
    const links = { before: strField(dump, 'l1'), after: strField(dump, 'l2') }
    if (links.before === null || links.after === null) throw new Error('probe state missing l1/l2')
    // PLAN-018 面：depth 三采 + 深档检索 + 移动前后链接采
    const depth = { d1: strField(dump, 'l3'), d8: strField(dump, 'l4'), d4: strField(dump, 'l5') }
    const deepSearch = strField(dump, 'm8')
    const linksM = { before: strField(dump, 'l6'), after: strField(dump, 'l7') }
    if (!depth.d1 || !depth.d8 || !depth.d4 || deepSearch === null || !linksM.before || !linksM.after) {
      throw new Error('probe state missing l3..l7/m8')
    }
    // PLAN-019 面：mb⑨ 合并（无冲突全入径）前后链接采
    const linksMb = { before: strField(dump, 'l8'), after: strField(dump, 'l9') }
    if (!linksMb.before || !linksMb.after) {
      throw new Error('probe state missing l8/l9')
    }
    // PLAN-025 面：ov4 三择径前后链接采 + trash_restore 回滚弧字段
    const linksOv = { before: strField(dump, 'l10'), after: strField(dump, 'l11') }
    if (!linksOv.before || !linksOv.after) {
      throw new Error('probe state missing l10/l11')
    }
    const restores = {
      rs8a: strField(dump, 'rs8a'), rs8b: strField(dump, 'rs8b'),
      rs8c: strField(dump, 'rs8c'), rs8d: strField(dump, 'rs8d'),
    }
    if (restores.rs8a === null || restores.rs8b === null || restores.rs8c === null || restores.rs8d === null) {
      throw new Error('probe state missing rs8a..rs8d')
    }
    return {
      returns, links, nested: true, depth, deepSearch, linksM, linksMb, linksOv, restores,
      diskCheck: (failures) => diskAsserts(MERGED_WS, 'merged', failures, { nested: true }),
    }
  } finally {
    try { execFileSync('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    await sleep(400)
  }
}

// ---------------- split 臂：serve-back POST ----------------

async function runSplitArm() {
  const { serveBackend } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'serve-back.mjs')).href)
  const back = await serveBackend({ port: SPLIT_PORT })
  try {
    const post = async (api, payload) => {
      const res = await fetch(`${back.url}/api/${api}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`POST ${api}(${JSON.stringify(payload)}) -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const text = await res.text()
      let val
      try { val = JSON.parse(text) } catch { val = text }
      return String(val)
    }
    // 原文捕获（PLAN-025——move_dir 返回 JSON 对象形，String() 化会
    // 坍缩 "[object Object]"；raw 直返供 dirOf/movesOf 解包）。
    const postRaw = async (api, payload) => {
      const res = await fetch(`${back.url}/api/${api}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`POST ${api}(${JSON.stringify(payload)}) -> HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      return (await res.text()).trim()
    }
    const get = async (api, params) => {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${back.url}/api/${api}${qs ? `?${qs}` : ''}`)
      if (!res.ok) throw new Error(`GET ${api} -> HTTP ${res.status}`)
      const text = await res.text()
      let val
      try { val = JSON.parse(text) } catch { val = text }
      return String(val)
    }
    const returns = {}
    const exec = async (id, api, payload) => { returns[id] = await post(api, payload) }
    // move_dir 案专用（PLAN-025——JSON 返回形原文捕获 + HTTP 封套剥离）
    const execRaw = async (id, api, payload) => { returns[id] = unwrapStr(await postRaw(api, payload)) }
    // setup
    if (await post('create_page', { title: 'DelFile' }) !== 'DelFile.ad') throw new Error('setup DelFile failed')
    if (await post('create_dir', { name: 'DirDel' }) !== 'DirDel') throw new Error('setup DirDel failed')
    if (await post('create_page', { title: 'DelPageA' }) !== 'DelPageA.ad') throw new Error('setup DelPageA failed')
    if (await post('move_page', { path: 'DelPageA.ad', dir: 'DirDel' }) !== 'DirDel/DelPageA.ad') throw new Error('setup move DelPageA failed')
    if (!(await post('write_wiki', { path: 'DirDel/DelPageB.ad', body: '# B\n\n[[DelPageA]]\n' }))) throw new Error('setup DelPageB failed')
    if (await post('create_dir', { name: 'EmptyDir' }) !== 'EmptyDir') throw new Error('setup EmptyDir failed')
    if (await post('create_dir', { name: '临时目录' }) !== '临时目录') throw new Error('setup 临时目录 failed')
    if (await post('create_page', { title: '中文甲' }) !== '中文甲.ad') throw new Error('setup 中文甲 failed')
    if (await post('move_page', { path: '中文甲.ad', dir: '临时目录' }) !== '临时目录/中文甲.ad') throw new Error('setup move 中文甲 failed')
    if (await post('create_dir', { name: 'DirRen' }) !== 'DirRen') throw new Error('setup DirRen failed')
    if (await post('create_page', { title: 'RenA' }) !== 'RenA.ad') throw new Error('setup RenA failed')
    if (await post('move_page', { path: 'RenA.ad', dir: 'DirRen' }) !== 'DirRen/RenA.ad') throw new Error('setup move RenA failed')
    if (!(await post('write_wiki', { path: 'DirRen/RenB.ad', body: REN_B_BYTES }))) throw new Error('setup RenB failed')
    if (await post('create_dir', { name: 'Sibling' }) !== 'Sibling') throw new Error('setup Sibling failed')
    if (await post('create_page', { title: 'Blocker' }) !== 'Blocker.ad') throw new Error('setup Blocker failed')
    if (await post('create_dir', { name: '资料夹' }) !== '资料夹') throw new Error('setup 资料夹 failed')
    if (await post('create_page', { title: '中文乙' }) !== '中文乙.ad') throw new Error('setup 中文乙 failed')
    if (await post('move_page', { path: '中文乙.ad', dir: '资料夹' }) !== '资料夹/中文乙.ad') throw new Error('setup move 中文乙 failed')
    if (await post('create_page', { title: 'LinkSrc' }) !== 'LinkSrc.ad') throw new Error('setup LinkSrc failed')
    if (!(await post('write_wiki', { path: 'LinkSrc.ad', body: '# LS\n\n[[RenA]] 与 [[RenB]]。\n' }))) throw new Error('setup LinkSrc body failed')
    // delete_dir 六案
    await exec('d1-root', 'delete_dir', { path: '' })
    await exec('d2-not-dir', 'delete_dir', { path: 'DelFile.ad' })
    await exec('d3-recursive', 'delete_dir', { path: 'DirDel' })
    await exec('d4-empty', 'delete_dir', { path: 'EmptyDir' })
    await exec('d5-cjk', 'delete_dir', { path: '临时目录' })
    await exec('d6-missing', 'delete_dir', { path: 'DirDel' })
    // r⑧ 链接前采
    const links = { before: await get('link_index', { path: '', depth: '4' }) }
    // rename_dir 六案（r⑦ 嵌套案 split 臂无造档通道——跳过）
    await exec('r1-basic', 'rename_dir', { path: 'DirRen', new_name: 'DirRen2' })
    if (!(await post('write_wiki', { path: 'DirRen2/notes.txt', body: 'x\n' }))) throw new Error('setup notes.txt failed')
    await exec('r2-pur-ad', 'rename_dir', { path: 'DirRen2', new_name: 'DirRen3' })
    await exec('r3a-same-dir', 'rename_dir', { path: 'DirRen2', new_name: 'Sibling' })
    await exec('r3b-same-file', 'rename_dir', { path: 'DirRen2', new_name: 'Blocker' })
    await exec('r4-casefold', 'rename_dir', { path: 'DirRen2', new_name: 'dirren2' })
    await exec('r5-cjk', 'rename_dir', { path: '资料夹', new_name: '归档夹' })
    await exec('r6-missing', 'rename_dir', { path: 'no-such-dir', new_name: 'xx' })
    links.after = await get('link_index', { path: '', depth: '4' })
    // —— PLAN-018（SD-1801）：move setup（m2b/m3b 后代/同名目录形与深档
    // 均 ws_join 域——split 臂无造档通道，跳过；depth 案以语料 wiki/ 现成
    // 深度结构承载语义面）——
    if (await post('create_dir', { name: 'Tgt' }) !== 'Tgt') throw new Error('setup Tgt failed')
    if (await post('create_dir', { name: 'Tgt2' }) !== 'Tgt2') throw new Error('setup Tgt2 failed')
    if (!(await post('write_wiki', { path: 'Tgt2/DirMove', body: 'x\n' }))) throw new Error('setup Tgt2/DirMove blocker failed')
    if (await post('create_dir', { name: 'Tgt4' }) !== 'Tgt4') throw new Error('setup Tgt4 failed')
    if (await post('create_dir', { name: 'DirMove' }) !== 'DirMove') throw new Error('setup DirMove failed')
    if (await post('create_page', { title: 'MoveA' }) !== 'MoveA.ad') throw new Error('setup MoveA failed')
    if (await post('move_page', { path: 'MoveA.ad', dir: 'DirMove' }) !== 'DirMove/MoveA.ad') throw new Error('setup move MoveA failed')
    if (!(await post('write_wiki', { path: 'DirMove/MoveB.ad', body: '# MoveB\n\n正文乙。\n' }))) throw new Error('setup MoveB failed')
    if (await post('create_dir', { name: 'DirMove2' }) !== 'DirMove2') throw new Error('setup DirMove2 failed')
    if (!(await post('write_wiki', { path: 'DirMove2/MoveC.ad', body: '# MoveC\n\n' }))) throw new Error('setup MoveC failed')
    if (await post('create_dir', { name: '目录丙' }) !== '目录丙') throw new Error('setup 目录丙 failed')
    if (await post('create_page', { title: '档丙' }) !== '档丙.ad') throw new Error('setup 档丙 failed')
    if (await post('move_page', { path: '档丙.ad', dir: '目录丙' }) !== '目录丙/档丙.ad') throw new Error('setup move 档丙 failed')
    if (await post('create_page', { title: 'LinkSrc2' }) !== 'LinkSrc2.ad') throw new Error('setup LinkSrc2 failed')
    if (!(await post('write_wiki', { path: 'LinkSrc2.ad', body: '# LS2\n\n[[MoveA]] 与 [[MoveB]] 与 [[档丙]]。\n' }))) throw new Error('setup LinkSrc2 body failed')
    // p⑨ depth 三采（split 域无深档——d1/d8 语料语义面）
    const depth = {
      d1: await get('link_index', { path: '', depth: '1' }),
      d8: await get('link_index', { path: '', depth: '8' }),
      d4: await get('link_index', { path: '', depth: '4' }),
    }
    const deepSearch = await post('search_wiki', { query: 'Deep5', limit: 5 })
    // move_dir 六案 + 前后链接采（m2b/m3b 跳过——同 r⑦ 口径；**PLAN-025
    // ：全案 payload 四参化 + JSON 返回原文捕获**——strategy="both" =
    // v1 行为零漂移回归承载）
    const linksM = { before: await get('link_index', { path: '', depth: '4' }) }
    await execRaw('m1-basic', 'move_dir', { path: 'DirMove', new_parent: 'Tgt', merge: false, strategy: 'both' })
    await execRaw('m2-cycle', 'move_dir', { path: 'Tgt/DirMove', new_parent: 'Tgt/DirMove', merge: false, strategy: 'both' })
    await execRaw('m3-merge-file', 'move_dir', { path: 'Tgt/DirMove', new_parent: 'Tgt2', merge: false, strategy: 'both' })
    if (!(await post('write_wiki', { path: 'Tgt/DirMove/notes.txt', body: 'x\n' }))) throw new Error('setup move notes.txt failed')
    await execRaw('m4-pur-ad', 'move_dir', { path: 'Tgt/DirMove', new_parent: 'Tgt4', merge: false, strategy: 'both' })
    await execRaw('m5-idem', 'move_dir', { path: 'DirMove2', new_parent: '', merge: false, strategy: 'both' })
    await execRaw('m6-cjk', 'move_dir', { path: '目录丙', new_parent: 'Tgt', merge: false, strategy: 'both' })
    linksM.after = await get('link_index', { path: '', depth: '4' })
    // —— PLAN-019（SD-1901）：merge setup（嵌套靶 back 通道——create_dir
    // + write_wiki + move_dir + rename_dir 全已证通道，双臂同构）——
    if (await post('create_dir', { name: 'MgTgt' }) !== 'MgTgt') throw new Error('setup MgTgt failed')
    if (await post('create_dir', { name: 'MgBoot' }) !== 'MgBoot') throw new Error('setup MgBoot failed')
    if (await post('create_page', { title: 'MgB' }) !== 'MgB.ad') throw new Error('setup MgB failed')
    if (await post('move_page', { path: 'MgB.ad', dir: 'MgBoot' }) !== 'MgBoot/MgB.ad') throw new Error('setup move MgB failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: 'MgBoot', new_parent: 'MgTgt', merge: false, strategy: 'both' }))) !== 'MgTgt/MgBoot') throw new Error('setup move MgBoot failed')
    if (await post('rename_dir', { path: 'MgTgt/MgBoot', new_name: 'DirMg' }) !== 'MgTgt/DirMg') throw new Error('setup rename DirMg failed')
    if (await post('create_dir', { name: 'DirMg' }) !== 'DirMg') throw new Error('setup DirMg failed')
    if (await post('create_page', { title: 'MgA' }) !== 'MgA.ad') throw new Error('setup MgA failed')
    if (await post('move_page', { path: 'MgA.ad', dir: 'DirMg' }) !== 'DirMg/MgA.ad') throw new Error('setup move MgA failed')
    await execRaw('mb1-merge-basic', 'move_dir', { path: 'DirMg', new_parent: 'MgTgt', merge: true, strategy: 'both' })
    if (await post('create_dir', { name: 'MgBoot2' }) !== 'MgBoot2') throw new Error('setup MgBoot2 failed')
    if (await post('create_page', { title: 'MgC' }) !== 'MgC.ad') throw new Error('setup MgC failed')
    if (await post('move_page', { path: 'MgC.ad', dir: 'MgBoot2' }) !== 'MgBoot2/MgC.ad') throw new Error('setup move MgC failed')
    if (!(await post('write_wiki', { path: 'MgBoot2/MgC.ad', body: '# TgtC\n\n' }))) throw new Error('setup TgtC body failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: 'MgBoot2', new_parent: 'MgTgt', merge: false, strategy: 'both' }))) !== 'MgTgt/MgBoot2') throw new Error('setup move MgBoot2 failed')
    if (await post('rename_dir', { path: 'MgTgt/MgBoot2', new_name: 'DirMg2' }) !== 'MgTgt/DirMg2') throw new Error('setup rename DirMg2 failed')
    if (await post('create_dir', { name: 'DirMg2' }) !== 'DirMg2') throw new Error('setup DirMg2 failed')
    if (await post('create_page', { title: 'MgC' }) !== 'MgC.ad') throw new Error('setup MgC(2) failed')
    if (!(await post('write_wiki', { path: 'MgC.ad', body: '# SrcC\n\n' }))) throw new Error('setup SrcC body failed')
    if (await post('move_page', { path: 'MgC.ad', dir: 'DirMg2' }) !== 'DirMg2/MgC.ad') throw new Error('setup move MgC(2) failed')
    await execRaw('mb2-conflict-suffix', 'move_dir', { path: 'DirMg2', new_parent: 'MgTgt', merge: true, strategy: 'both' })
    if (await post('create_dir', { name: 'MgBoot3' }) !== 'MgBoot3') throw new Error('setup MgBoot3 failed')
    if (await post('create_page', { title: 'MgE' }) !== 'MgE.ad') throw new Error('setup MgE failed')
    if (await post('move_page', { path: 'MgE.ad', dir: 'MgBoot3' }) !== 'MgBoot3/MgE.ad') throw new Error('setup move MgE failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: 'MgBoot3', new_parent: 'MgTgt', merge: false, strategy: 'both' }))) !== 'MgTgt/MgBoot3') throw new Error('setup move MgBoot3 failed')
    if (await post('rename_dir', { path: 'MgTgt/MgBoot3', new_name: 'DirMg3' }) !== 'MgTgt/DirMg3') throw new Error('setup rename DirMg3 failed')
    if (await post('create_dir', { name: 'DirMg3' }) !== 'DirMg3') throw new Error('setup DirMg3 failed')
    if (await post('create_page', { title: 'MgD' }) !== 'MgD.ad') throw new Error('setup MgD failed')
    if (await post('move_page', { path: 'MgD.ad', dir: 'DirMg3' }) !== 'DirMg3/MgD.ad') throw new Error('setup move MgD failed')
    await execRaw('mb3-merge-false', 'move_dir', { path: 'DirMg3', new_parent: 'MgTgt', merge: false, strategy: 'both' })
    await execRaw('mb4-merge-cycle', 'move_dir', { path: 'Tgt/DirMove', new_parent: 'Tgt/DirMove', merge: true, strategy: 'both' })
    await execRaw('mb5-merge-file-block', 'move_dir', { path: 'Tgt/DirMove', new_parent: 'Tgt2', merge: true, strategy: 'both' })
    await execRaw('mb6-trash-src', 'move_dir', { path: '.trash/NoDir', new_parent: 'Tgt', merge: false, strategy: 'both' })
    await execRaw('mb7-trash-dst', 'move_dir', { path: 'Tgt/DirMove', new_parent: '.trash', merge: true, strategy: 'both' })
    if (await post('create_dir', { name: '合并靶' }) !== '合并靶') throw new Error('setup 合并靶 failed')
    if (await post('create_dir', { name: 'MgCjkBoot' }) !== 'MgCjkBoot') throw new Error('setup MgCjkBoot failed')
    if (await post('create_page', { title: '靶档' }) !== '靶档.ad') throw new Error('setup 靶档 failed')
    if (await post('move_page', { path: '靶档.ad', dir: 'MgCjkBoot' }) !== 'MgCjkBoot/靶档.ad') throw new Error('setup move 靶档 failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: 'MgCjkBoot', new_parent: '合并靶', merge: false, strategy: 'both' }))) !== '合并靶/MgCjkBoot') throw new Error('setup move MgCjkBoot failed')
    if (await post('rename_dir', { path: '合并靶/MgCjkBoot', new_name: '目录合并甲' }) !== '合并靶/目录合并甲') throw new Error('setup rename 目录合并甲 failed')
    if (await post('create_dir', { name: '目录合并甲' }) !== '目录合并甲') throw new Error('setup 目录合并甲 failed')
    if (await post('create_page', { title: '档甲' }) !== '档甲.ad') throw new Error('setup 档甲 failed')
    if (await post('move_page', { path: '档甲.ad', dir: '目录合并甲' }) !== '目录合并甲/档甲.ad') throw new Error('setup move 档甲 failed')
    await execRaw('mb8-cjk-merge', 'move_dir', { path: '目录合并甲', new_parent: '合并靶', merge: true, strategy: 'both' })
    if (await post('create_dir', { name: 'MgTgt2' }) !== 'MgTgt2') throw new Error('setup MgTgt2 failed')
    if (await post('create_dir', { name: 'DirMgLink' }) !== 'DirMgLink') throw new Error('setup DirMgLink failed')
    if (await post('create_page', { title: 'MgLink' }) !== 'MgLink.ad') throw new Error('setup MgLink failed')
    if (!(await post('write_wiki', { path: 'MgLink.ad', body: '# MgLink\n\n见 [[MoveA]] 一处。\n' }))) throw new Error('setup MgLink body failed')
    if (await post('move_page', { path: 'MgLink.ad', dir: 'DirMgLink' }) !== 'DirMgLink/MgLink.ad') throw new Error('setup move MgLink failed')
    const linksMb = { before: await get('link_index', { path: '', depth: '4' }) }
    await execRaw('mb9-link-merge', 'move_dir', { path: 'DirMgLink', new_parent: 'MgTgt2', merge: true, strategy: 'both' })
    linksMb.after = await get('link_index', { path: '', depth: '4' })
    // —— PLAN-025（SD-2501）：三择案组（skip 基础/多冲突 → overwrite 基础
    // [链接零扰动前后采] → 卫正交八案 → fail-closed → CJK skip →
    // trash_restore 回滚弧；twin 靶 move+rename 双通道同 mb 套路）——
    if (await post('create_dir', { name: 'SkT' }) !== 'SkT') throw new Error('setup SkT failed')
    if (!(await post('write_wiki', { path: 'SkT/SkP.ad', body: '# TgtP\n\n' }))) throw new Error('setup SkT/SkP failed')
    if (await post('create_dir', { name: 'SkBoot' }) !== 'SkBoot') throw new Error('setup SkBoot failed')
    if (!(await post('write_wiki', { path: 'SkBoot/SkP.ad', body: '# SrcP\n\n' }))) throw new Error('setup SkBoot/SkP failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: 'SkBoot', new_parent: 'SkT', merge: false, strategy: 'both' }))) !== 'SkT/SkBoot') throw new Error('setup move SkBoot failed')
    if (await post('rename_dir', { path: 'SkT/SkBoot', new_name: 'SkA' }) !== 'SkT/SkA') throw new Error('setup rename SkA failed')
    if (await post('create_dir', { name: 'SkA' }) !== 'SkA') throw new Error('setup SkA failed')
    if (!(await post('write_wiki', { path: 'SkA/SkP.ad', body: '# SrcP2\n\n' }))) throw new Error('setup SkA/SkP failed')
    await execRaw('s2-skip-basic', 'move_dir', { path: 'SkA', new_parent: 'SkT', merge: true, strategy: 'skip' })
    if (!(await post('write_wiki', { path: 'SkT/SkA/SkQ.ad', body: '# TgtQ\n\n' }))) throw new Error('setup SkT/SkA/SkQ failed')
    if (await post('create_dir', { name: 'SkA' }) !== 'SkA') throw new Error('setup SkA(2) failed')
    if (!(await post('write_wiki', { path: 'SkA/SkP.ad', body: '# SrcP3\n\n' }))) throw new Error('setup SkA/SkP(3) failed')
    if (!(await post('write_wiki', { path: 'SkA/SkQ.ad', body: '# SrcQ\n\n' }))) throw new Error('setup SkA/SkQ failed')
    await execRaw('s3-skip-multi', 'move_dir', { path: 'SkA', new_parent: 'SkT', merge: true, strategy: 'skip' })
    if (await post('create_dir', { name: 'OvT' }) !== 'OvT') throw new Error('setup OvT failed')
    if (await post('create_dir', { name: 'OvA0' }) !== 'OvA0') throw new Error('setup OvA0 failed')
    if (!(await post('write_wiki', { path: 'OvA0/OvP.ad', body: '# TgtOv\n\n' }))) throw new Error('setup OvA0/OvP failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: 'OvA0', new_parent: 'OvT', merge: false, strategy: 'both' }))) !== 'OvT/OvA0') throw new Error('setup move OvA0 failed')
    if (await post('rename_dir', { path: 'OvT/OvA0', new_name: 'OvA' }) !== 'OvT/OvA') throw new Error('setup rename OvA failed')
    if (await post('create_dir', { name: 'OvA' }) !== 'OvA') throw new Error('setup OvA(2) failed')
    if (!(await post('write_wiki', { path: 'OvA/OvP.ad', body: '# SrcOv2\n\n' }))) throw new Error('setup OvA/OvP failed')
    if (!(await post('write_wiki', { path: 'OvA/OvX.ad', body: '# OvX\n\n见 [[OvP]] 一处。\n' }))) throw new Error('setup OvA/OvX failed')
    const linksOv = { before: await get('link_index', { path: '', depth: '4' }) }
    await execRaw('s4-over-basic', 'move_dir', { path: 'OvA', new_parent: 'OvT', merge: true, strategy: 'overwrite' })
    linksOv.after = await get('link_index', { path: '', depth: '4' })
    if (await post('create_dir', { name: 'GuardD' }) !== 'GuardD') throw new Error('setup GuardD failed')
    if (!(await post('write_wiki', { path: 'GuardD/G.ad', body: '# G\n\n' }))) throw new Error('setup GuardD/G failed')
    if (!(await post('write_wiki', { path: 'GuardD/notes.txt', body: 'x\n' }))) throw new Error('setup GuardD/notes failed')
    await execRaw('s5a-cycle-skip', 'move_dir', { path: 'SkT', new_parent: 'SkT', merge: true, strategy: 'skip' })
    await execRaw('s5b-cycle-over', 'move_dir', { path: 'SkT', new_parent: 'SkT', merge: true, strategy: 'overwrite' })
    await execRaw('s5c-trash-src', 'move_dir', { path: '.trash/NoDir', new_parent: 'SkT', merge: true, strategy: 'skip' })
    await execRaw('s5d-trash-dst', 'move_dir', { path: 'SkT', new_parent: '.trash', merge: true, strategy: 'overwrite' })
    await execRaw('s5e-purad-skip', 'move_dir', { path: 'GuardD', new_parent: 'SkT', merge: true, strategy: 'skip' })
    await execRaw('s5f-purad-over', 'move_dir', { path: 'GuardD', new_parent: 'SkT', merge: true, strategy: 'overwrite' })
    if (!(await post('write_wiki', { path: 'SkT/BlockD', body: 'x\n' }))) throw new Error('setup SkT/BlockD failed')
    if (await post('create_dir', { name: 'BlockD' }) !== 'BlockD') throw new Error('setup BlockD failed')
    if (!(await post('write_wiki', { path: 'BlockD/B.ad', body: '# B\n\n' }))) throw new Error('setup BlockD/B failed')
    await execRaw('s5g-block-skip', 'move_dir', { path: 'BlockD', new_parent: 'SkT', merge: true, strategy: 'skip' })
    await execRaw('s5h-block-over', 'move_dir', { path: 'BlockD', new_parent: 'SkT', merge: true, strategy: 'overwrite' })
    if (await post('create_dir', { name: 'UkD' }) !== 'UkD') throw new Error('setup UkD failed')
    if (!(await post('write_wiki', { path: 'UkD/U.ad', body: '# U\n\n' }))) throw new Error('setup UkD/U failed')
    await execRaw('s6a-unknown', 'move_dir', { path: 'UkD', new_parent: 'SkT', merge: false, strategy: 'xxx' })
    await execRaw('s6b-empty-strat', 'move_dir', { path: 'UkD', new_parent: 'SkT', merge: false, strategy: '' })
    if (await post('create_dir', { name: '跳靶' }) !== '跳靶') throw new Error('setup 跳靶 failed')
    if (await post('create_dir', { name: '跳Boot' }) !== '跳Boot') throw new Error('setup 跳Boot failed')
    if (!(await post('write_wiki', { path: '跳Boot/跳档.ad', body: '# 跳源\n\n' }))) throw new Error('setup 跳Boot/跳档 failed')
    if (dirOf(unwrapStr(await postRaw('move_dir', { path: '跳Boot', new_parent: '跳靶', merge: false, strategy: 'both' }))) !== '跳靶/跳Boot') throw new Error('setup move 跳Boot failed')
    if (await post('rename_dir', { path: '跳靶/跳Boot', new_name: '跳甲' }) !== '跳靶/跳甲') throw new Error('setup rename 跳甲 failed')
    if (await post('create_dir', { name: '跳甲' }) !== '跳甲') throw new Error('setup 跳甲(2) failed')
    if (!(await post('write_wiki', { path: '跳甲/跳档.ad', body: '# 跳源2\n\n' }))) throw new Error('setup 跳甲/跳档 failed')
    await execRaw('s7-cjk-skip', 'move_dir', { path: '跳甲', new_parent: '跳靶', merge: true, strategy: 'skip' })
    const restores = {
      rs8a: await post('trash_restore', { entry: '.trash/SkA/SkP--1.ad' }),
      rs8b: await post('trash_restore', { entry: '.trash/SkA/SkP.ad' }),
      rs8c: await post('move_page', { path: 'OvT/OvA/OvP.ad', dir: 'UkD' }),
      rs8d: await post('trash_restore', { entry: '.trash/OvT/OvA/OvP.ad' }),
    }
    // p⑩ CJK exists 随校（PLAN-028 翻新——017 GET query D-19 立案面随
    // 三契约 POST 化收口：POST body 直通免疫域，期望 1 翻绿）。
    const cjkExistsPost = await post('exists', { path: '归档夹/中文乙.ad' })
    return {
      returns, links, nested: false, depth, deepSearch, linksM, linksMb, linksOv, restores, cjkExistsPost,
      diskCheck: (failures) => diskAsserts(back.workspace, 'split', failures, { nested: false }),
    }
  } finally {
    await back.stop()
  }
}

// ---------------- run ----------------

const failures = []
console.log(`[probe-dir-ops] arm 1: merged 直调（探针工程 ${path.relative(repoRoot, PROBE_DIR)}，进程内 CALL）`)
const merged = await runMergedArm()
merged.diskCheck(failures)

console.log(`[probe-dir-ops] arm 2: split serve-back POST（:${SPLIT_PORT}，JSON body CJK 通道）`)
const split = await runSplitArm()
split.diskCheck(failures)

console.log('\n[probe-dir-ops] 双臂返回值逐案对读（PLAN-025：返回 JSON dir 抽取随校 + 双臂 raw 字节等值）：')
let agree = true
for (const c of CASES) {
  const m = merged.returns[c.id]
  const s = split.returns[c.id]
  const ok = m === s && dirOf(m) === c.expect
  if (m !== s) agree = false
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" split="${s}" expect(dir)=${JSON.stringify(c.expect)}`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" split="${s}" expect(dir)=${JSON.stringify(c.expect)}`)
}
for (const c of MERGED_ONLY_CASES) {
  const m = merged.returns[c.id]
  const ok = m === c.expect
  console.log(`  [${c.id}] ${ok ? 'PASS' : 'FAIL'} — merged="${m}" expect="${c.expect}"（探针域——split 无嵌套造档通道）`)
  if (!ok) failures.push(`case ${c.id}: merged="${m}" expect="${c.expect}"`)
}

// s⑩ moves 完整性（PLAN-025——双臂各自解包：精确形逐对等 / 集形无序等 +
// 计数不变式；mb② 后缀新位映射直证）
{
  const eqPair = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === 2 && b.length === 2 && a[0] === b[0] && a[1] === b[1]
  for (const [id, expectPairs] of Object.entries(MOVES_EXACT)) {
    const mMoves = movesOf(merged.returns[id])
    const sMoves = movesOf(split.returns[id])
    const ok = mMoves !== null && sMoves !== null && mMoves.length === expectPairs.length
      && sMoves.length === expectPairs.length
      && expectPairs.every((p, i) => eqPair(mMoves[i], p) && eqPair(sMoves[i], p))
    console.log(`  [s10-moves ${id}] ${ok ? 'PASS' : 'FAIL'} — moves 恰 ${expectPairs.length} 对精确形 merged=${JSON.stringify(mMoves)} split=${JSON.stringify(sMoves)}`)
    if (!ok) failures.push(`s10-moves ${id}: 精确形失守`)
  }
  for (const [id, spec] of Object.entries(MOVES_SET)) {
    const key = (p) => (Array.isArray(p) ? p.join('=>') : String(p))
    const mMoves = movesOf(merged.returns[id])
    const sMoves = movesOf(split.returns[id])
    const wantSet = new Set(spec.pairs.map(key))
    const ok = mMoves !== null && sMoves !== null && mMoves.length === spec.pairs.length
      && sMoves.length === spec.pairs.length
      && mMoves.every((p) => wantSet.has(key(p))) && sMoves.every((p) => wantSet.has(key(p)))
      && new Set(mMoves.map(key)).size === spec.pairs.length
    console.log(`  [s10-moves ${id}] ${ok ? 'PASS' : 'FAIL'} — moves 恰 ${spec.pairs.length} 对集等（overwrite 双对计/多冲突）merged=${JSON.stringify(mMoves)} split=${JSON.stringify(sMoves)}`)
    if (!ok) failures.push(`s10-moves ${id}: 集形失守`)
  }
}

// s⑧ trash_restore 回滚弧（PLAN-025——skip 改道档恢复回源位去后缀名 +
// exists 卫拒 + overwrite 两步可回；双臂同判）
{
  const rOk = merged.restores.rs8a === 'SkA/SkP.ad' && split.restores.rs8a === 'SkA/SkP.ad'
    && merged.restores.rs8b === '' && split.restores.rs8b === ''
    && merged.restores.rs8c === 'UkD/OvP.ad' && split.restores.rs8c === 'UkD/OvP.ad'
    && merged.restores.rs8d === 'OvT/OvA/OvP.ad' && split.restores.rs8d === 'OvT/OvA/OvP.ad'
  console.log(`  [s8-restore] ${rOk ? 'PASS' : 'FAIL'} — SkP--1 恢复回源位去后缀名（${merged.restores.rs8a}）+ SkP.ad 再恢复卫拒（${merged.restores.rs8b}）+ occupant 移出（${merged.restores.rs8c}）+ overwrite 改道档两步恢复（${merged.restores.rs8d}）双臂同判`)
  if (!rOk) failures.push(`s8-restore: merged=${JSON.stringify(merged.restores)} split=${JSON.stringify(split.restores)}`)
}

// r⑧ 链接零扰动归一 diff（双臂 + 一致）
const movedBoth = new Set([
  'DirRen/RenA.ad', 'DirRen2/RenA.ad', 'DirRen/RenB.ad', 'DirRen2/RenB.ad',
  '资料夹/中文乙.ad', '归档夹/中文乙.ad',
])
const movedMerged = new Set([...movedBoth, 'DirNest/sub/Deep.ad', 'DirNest2/sub/Deep.ad'])
const mNorm = ljNorm(merged.links.before, movedMerged) + '||' + ljNorm(merged.links.after, movedMerged)
const sNorm = ljNorm(split.links.before, movedBoth) + '||' + ljNorm(split.links.after, movedBoth)
const linkOk = !mNorm.includes('<unparsable>') && !sNorm.includes('<unparsable>')
  && ljNorm(merged.links.before, movedMerged) === ljNorm(merged.links.after, movedMerged)
  && ljNorm(split.links.before, movedBoth) === ljNorm(split.links.after, movedBoth)
console.log(`  [r8-link-net] ${linkOk ? 'PASS' : 'FAIL'} — link_index 归一 diff 双臂零扰动（仅 path/target_path 变化）`)
if (!linkOk) failures.push('r8-link-net: link_index 归一 diff 失守')

// m⑦ 移动链接零扰动归一 diff（PLAN-018——三联对照移动级；双臂 + 一致）
const movedMBoth = new Set([
  'DirMove/MoveA.ad', 'Tgt/DirMove/MoveA.ad', 'DirMove/MoveB.ad', 'Tgt/DirMove/MoveB.ad',
  '目录丙/档丙.ad', 'Tgt/目录丙/档丙.ad',
])
const mMoveOk = !ljNorm(merged.linksM.before, movedMBoth).includes('<unparsable>')
  && !ljNorm(split.linksM.before, movedMBoth).includes('<unparsable>')
  && ljNorm(merged.linksM.before, movedMBoth) === ljNorm(merged.linksM.after, movedMBoth)
  && ljNorm(split.linksM.before, movedMBoth) === ljNorm(split.linksM.after, movedMBoth)
console.log(`  [m7-link-net] ${mMoveOk ? 'PASS' : 'FAIL'} — move 前后 link_index 归一 diff 双臂零扰动（stem 不变零改写——三联对照移动级）`)
if (!mMoveOk) failures.push('m7-link-net: move 前后 link_index 归一 diff 失守')

// mb⑨ 合并（无冲突全入径）链接零扰动归一 diff（PLAN-019——merge=true
// 无冲突 = 纯移动语义直证；双臂 + 一致）
const movedMb = new Set(['DirMgLink/MgLink.ad', 'MgTgt2/DirMgLink/MgLink.ad'])
const mbLinkOk = !ljNorm(merged.linksMb.before, movedMb).includes('<unparsable>')
  && !ljNorm(split.linksMb.before, movedMb).includes('<unparsable>')
  && ljNorm(merged.linksMb.before, movedMb) === ljNorm(merged.linksMb.after, movedMb)
  && ljNorm(split.linksMb.before, movedMb) === ljNorm(split.linksMb.after, movedMb)
console.log(`  [mb9-link-net] ${mbLinkOk ? 'PASS' : 'FAIL'} — merge（无冲突全入径）前后 link_index 归一 diff 双臂零扰动（merge=true 无冲突 = 纯移动语义）`)
if (!mbLinkOk) failures.push('mb9-link-net: merge 前后 link_index 归一 diff 失守')

// s⑨ 三择径（overwrite）链接零扰动归一 diff（PLAN-025——m⑦ 口径三择径
// 续：moved 集含改道 .trash 位归一；.trash walk 忽略域不入索引，改道
// 档链接解析恒达[同 rel 同 stem]；overwrite 2→1 塌缩——被覆盖靶旧档
// 前态剔除[内容存续 .trash 域，占位页后态保留]；双臂 + 一致）
const movedOv = new Set([
  'OvA/OvP.ad', 'OvT/OvA/OvP.ad', 'OvA/OvX.ad', 'OvT/OvA/OvX.ad',
])
const dropOvBefore = new Set(['OvT/OvA/OvP.ad'])
const ovLinkOk = !ljNorm(merged.linksOv.before, movedOv, dropOvBefore).includes('<unparsable>')
  && !ljNorm(split.linksOv.before, movedOv, dropOvBefore).includes('<unparsable>')
  && ljNorm(merged.linksOv.before, movedOv, dropOvBefore) === ljNorm(merged.linksOv.after, movedOv)
  && ljNorm(split.linksOv.before, movedOv, dropOvBefore) === ljNorm(split.linksOv.after, movedOv)
console.log(`  [s9-link-net] ${ovLinkOk ? 'PASS' : 'FAIL'} — overwrite 三择径前后 link_index 归一 diff 双臂零扰动（m⑦ 口径三择径续——改道位归一+被覆盖靶旧档前态剔除[2→1 塌缩]）`)
if (!ovLinkOk) failures.push('s9-link-net: overwrite 径 link_index 归一 diff 失守')

// p⑨ depth 8 统一（PLAN-018——fs.tree depth 语义面）：depth 1 不含 wiki/
// 深度档、depth 8 全含（双臂语料现成结构）；merged 域深档（5 层）depth 8
// 含 / depth 4 不含——**4→8 覆盖收窄收口直证** + search 内部 8 walk 命中。
{
  const deepRel = 'L1/L2/L3/L4/Deep5.ad'
  const shallowMiss = !merged.depth.d1.includes('wiki/Hello World.ad') && !split.depth.d1.includes('wiki/Hello World.ad')
  const fullHit = merged.depth.d8.includes('wiki/Hello World.ad') && split.depth.d8.includes('wiki/Hello World.ad')
  // 语料 flat 零漂移：split 域无深档——depth 4 与 8 逐字节相等
  const flatZeroDrift = split.depth.d4 === split.depth.d8
  // merged 域深档（5 层）：depth 8 含 / depth 4 不含——4→8 覆盖收窄收口直证
  const deepGap = merged.depth.d8.includes(deepRel) && !merged.depth.d4.includes(deepRel)
  const searchDeep = merged.deepSearch.includes(deepRel)
  const deepOk = shallowMiss && fullHit && flatZeroDrift && deepGap && searchDeep && split.deepSearch === '[]'
  console.log(`  [p9-depth8] ${deepOk ? 'PASS' : 'FAIL'} — depth1 不含/depth8 全含 wiki 档（双臂）+ 语料 flat d4==d8 零漂移（split）+ 5 层深档 d8 含/d4 不含（merged——覆盖收窄收口）+ search 内部 8 walk 命中=${searchDeep}`)
  if (!deepOk) failures.push('p9-depth8: depth 8 统一断言失守')
}

// p⑩ CJK exists POST 随校（PLAN-028 T-02——017 立案 GET query D-19 面
// 随三契约 POST 化收口：POST body 直通免疫域，期望 1 翻绿[bool 序列化
// 裸 1/0；015 回执 g① 同源]。0 = 免疫通道破——fail 即信号，probe+ledger
// 随改）。
{
  const udOk = split.cjkExistsPost === '1'
  console.log(`  [p10-cjk-exists-post] ${udOk ? 'PASS' : 'FAIL'} — POST exists{path:归档夹/中文乙.ad} → ${split.cjkExistsPost}（D-19 repo 侧收口 = 1 翻绿——GET query 缺口随 POST 化免疫；0 = 免疫通道破，probe+ledger 随改）`)
  if (!udOk) failures.push(`p10-cjk-exists-post: 期望 1（POST body CJK 翻绿——D-19 repo 侧收口），实际 ${split.cjkExistsPost}`)
}

if (failures.length > 0) {
  console.error(`\n[probe-dir-ops] FAIL（${failures.length} 项）:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`\n[probe-dir-ops] RESULT: merged + split 全案通过（probe C 定谳[remove_dir 族可调]+delete_dir 六案+rename_dir 六案+嵌套案[merged]+链接零扰动归一 diff[r⑧+m⑦+mb⑨+s⑨]+磁盘逐字节/双复核/副作用圈定+双臂一致=${agree}；**PLAN-018：move_dir 六案+循环卫后代形/合并拒同名目录形[merged]+depth 8 统一[三深度采+5 层深档收口直证+search 8 walk]+url_decode 重勘面随 PLAN-028 收口[p⑩ CJK exists POST 翻绿]；PLAN-019：move_dir merge 九案[合并基础/冲突后缀保双份/merge=false 拒径回归/循环卫先于合并/文件占位仍拒/.trash 域卫双面直证——F-R18-1 闭账/CJK 合并/无冲突链接零扰动]+mb② 冲突档=新档磁盘承载；PLAN-025：move_dir 四参三择+moves 映射返回形[dir 抽取随校全案四参化 both 零漂移+双臂 raw 字节等值升级/s②③ skip 零数据丢失[靶 twin 逐字节不动+源冲突档 .trash 改道+序号续接]/s④ overwrite 零数据丢失[靶旧改道+源落位+双映射对]/s⑤ 策略×卫正交八案/s⑥ fail-closed 白名单前置/s⑦ CJK skip/s⑧ trash_restore 回滚弧[去后缀名回源位+exists 卫拒+两步可回]/s⑨ 三择径链接零扰动/s⑩ moves 完整性[精确形+集形+幂等空对]]**）`)
