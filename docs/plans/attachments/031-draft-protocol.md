# PLAN-031 T-01 附件：草稿协议能力原型与决策（031-draft-protocol）

日期：2026-09-30。执行：/auto-plan:work T-01。基线：jade-edit main `1e6ddf7`（工作树仅 Plan 记账件）。
结论：**本仓可行，协议定型如下，继续 T-02**。证据 = 一次性探针装置（`e2e/.runtime/p31/`，git-ignored 在档再生），
编排脚本 `p31/t01.mjs` 终态 **90 PASS / 0 FAIL（ALL GREEN）**，完整转录 `p31/t01-transcript.log`。

## 1. 装置形态（可复现）

- 探针后端 `p31/drafts_probe.at`（候选协议原型全文，T-02 产品化落 `src/back/drafts.at`）+ 探针前端
  `p31/probe_app.at`（相位经 `P31_PHASE` 环境选择：cap/write/act/recover/clean/bench）。
- 编排：`node e2e/.runtime/p31/t01.mjs`（仓根执行）。装配探针工程 `p31/probe-proj/`（repo `src/back`
  api.at+wsys.at 拷贝 + 追加 `d31_*` 临时 API 面 + drafts_probe.at），**merged 臂每相位一独立进程**
  （`auto run -r vm` + AUTOUI_MCP_PORT，autoui_state 读回——重启语义即探针本体），**split 臂同一 back
  模块起 HTTP 服务**（`auto run --server vm -B <port>`）。四个隔离工作区（cap/merged/split/bench），
  互不共享。命令与判据（Node 侧独立 sha256/字节对照为权威，dump 值为佐证）全部在脚本内。
- 开发期脚本修复 3 轮（注释内 `use wsys` 误替换 / `link` 保留字 / seq 分配），逐轮转录在案。

## 2. 工具链原语定谳（先证后用——catalog 登记不等于可用）

| 原语 | 定谳 | 证据 |
| --- | --- | --- |
| `File.write_text/read_text` 全字符往返 | ✅ CJK/emoji(4字节)/引号/反斜杠/tab/CRLF/尾随换行/空文 **逐字节保真**（merged+split 双臂，Node 侧 Buffer 对照） | H1/语料 A..F5B 全案 PASS |
| `Hash.file_sha256(path)` | ✅ 可调，返回 hex 摘要；`sha256("abc")` 已知向量对上 | cap `sha_abc_file=ba7816bf…` |
| `Hash.sha256(str)` str 面 | ❌ **返回值 Nil（Void 型标记）**——str+ 拼接即 `TypeError: str + NoneType` 崩 handler（首轮实录）。str 级哈希出局，协议只用文件面 | 首轮 transcript `[CALL_HANDLER_ERR]` |
| `fs.rename` | ⚠️ 移动 ✅（源消失目标在）；**覆盖既有目标 = 覆盖生效**（非抛错——Windows 实证）。数据破坏面在案 → 协议**不用 rename 发布路径**，坚持写新名不覆盖 | cap `rename_move=moved` / `rename_onto_existing=overwrote` |
| `fs.size(path)` | ✅ 可调，返回**字节数**（`"second"`=6）→ 协议第三重校验 `slen` 依据 | cap `size_b=6` |
| `fs.read_dir(path)` | ✅ 返回 JSON 文件名数组；缺目录**抛错**（try/catch 容错）；JSON 手工剥壳可行（名字域受限 [a-z0-9_.]） | cap `readdir=[...]` + 全案 |
| `File.create_dir` | ✅ 递归语义（D-29① 续证）——`.jade/drafts/v1/d0001` 一次建链 | 全案 |
| `File.delete` | 返值恒 0 不可信（D-24② 续证）——清理后以清单/exists 复核 | clean 案 |
| `str.length` | **字符（标量）计数**，非字节（`"中中"`=2；PLAN-055 语义；jade-edit strip_ad 注释「字节语义」已过时——T-02 顺修该注释）。字节面走 `fs.size` | cap `lenbytes=2` |
| `str.char_at(i)` | **字符语义**（`"A中".char_at(1)`=20013） | cap `charbyte=20013` |
| `str.substr(a,b)` | **(start, LEN) 语义**（shim_str_substr 测试钉死）——非 (start,end) | 开发期 seq 分配缺陷根因 |
| `Date.now()` | ⚠️ i32 截断为**负**（-2.19e8）——绝对毫秒不可用；**短窗差值（bench ms）可用** | cap `nowms=-219016407` |
| `Date.format(Date.now(),…)` | ✅ `2026-09-30 23:32:26` 格式化正常（daily_note 同源）——展示戳可用 | cap `date=…` |
| replace 含反斜杠替换串 | ⚠️ 反直觉：`"\\"`→1 反斜杠、`"\\\\"`→2 反斜杠**可靠**；但 `\\n` 形态→「反斜杠+LF」（r4/r5len 原子钉死）。纪律：**替换串/字面量避免 `\`+转义字母相邻形态** | cap `r2/r4/r5len` 原子 |
| `json_esc`（wsys） | 只转义引号/反斜杠——换行面缺口实证（预览裸 LF 依赖 V8 JSON.parse 宽容才未炸）。协议自带 d_jesc（见 §3） | 首轮 split 清单实录 |

## 3. 协议决策（写入 T-02 契约）

**存储布局**（工作区本地，`.jade/` 点前缀 walk 忽略 D-33① 实证延续）：

```
.jade/drafts/v1/
  d%04d/            稳定文档身份一目录（后端盘扫 max+1 分配，d10000 五位自然生长）
    c%05d.body      检查点正文（原始字节直写——正文本体不经任何转义层）
    c%05d.orig      原文基准（original_body 同上）
    c%05d.meta      行式 k=v：schema=1, doc, event=checkpoint, epoch, erev,
                    len(字符)/leno, slen(字节)/sleno, sha/shao(file_sha256),
                    path(来源，""=untitled), name(显示名), at(展示戳)
    s%05d.meta      结算墓碑（永留）：event=saved|discarded|recovered,
                    seq, settle_erev, link(恢复副本关联), at
```

**核心规则**（全部实验支撑）：
1. **写 = 新 seq 直写**：seq = 盘扫 max+1（c\* 三件组 + **s\* 墓碑全计**——已结算 seq 亦占号，
   迟到写入排到墓碑之后，号序即史序；act 案实证 `late=ok:3`）。**从不覆盖既有名**（rename 覆盖
   语义反证 + AC-03 坏件不抹除）。中断半写 = 该 seq 校验不过被读者忽略 + bad[] 线索，前序有效
   记录不受影响。
2. **确认四步**：body 写→读回比对 → orig 写→读回比对 → sha=磁盘字节 file_sha256 → meta 写→
   读回解析复核（doc/len/slen/sha）→ 才回执 `ok:<seq>`。失败回执 `err:<code>`，残件留盘不删。
3. **三重正交校验**：len=字符数（VM 语义）/ slen=字节数（fs.size）/ sha=字节面 SHA256——截断、
   追加、原地改、半写全被捕获（d3/d4/d6/d7 故障案 + split 读回门实证）。
4. **恢复 = 逐目录校验**，settle_erev 门排除已结算域（**迟到旧写入 erev ≤ settle_erev 不复活**
   ——act+recover 案实证），erev 最大有效者为 pending；损坏/畸形入 `bad[{file,err}]` 线索不删
   （recover 案 pending 恰 d2/d5/d8 + bad 恰 7；split 案 Node 独立校验器逐字段对读一致）。
5. **结算**：墓碑写→读回复核→**然后**清理 ≤seq 检查点三件组（best-effort，残留被门双保险排除）。
   墓碑永留 → 重启不复活（clean 案：d2 只余 s00001.meta；doc 目录保留含墓碑）。
6. **会话代次 epoch**：只读盘扫 c\*.meta epoch max+1，空库=1；front 每 session 调一次持值复用。
   实证跨进程单调 1→2→3，无新检查点不续增。展示/溯源域，不作唯一顺序依据。
7. **身份与编辑器 key 分离**：doc_id 后端分配（`d%04d`），与 active_key/nonce/tab 索引无涉；
   守卫拒畸形 id / `..` / 盘符 / 前导斜杠 / 反斜杠 / 换行路径 / 非法 event / 畸形 link /
   erev<1（cap 守卫案 10 项返回码逐项对上）。
8. **预览净化（展示域）**：反斜杠加倍（JSON 合法性——裸 `\` 是唯一让 JSON.parse 硬炸的字符，
   Node 实证）+ LF/CR/TAB→可见符号（⏎/␍/⋅）+ 引号→单引号。正文本体走独立文件零转义。
   文件名含 `"` 由 Windows 规则结构性排除（如实边界）。
9. **正常离开等待上限**：200KB 正文检查点实测 **≈5ms**（merged/split 双臂一致）→ 每文档屏障
   等待上限取 **3000ms**（≈600× 余量），超时保留文档、提示重试、不退出——不无限阻塞。
10. **空文合法**：body="" 检查点/恢复/读回全链路一等公民（len=0/slen=0/sha=e3b0c442…，
    split 空文 V2 + 读回案）。**工作区身份**：工作区=目录本身（JADE_WORKSPACE 隔离），两工作区
    草稿库天然互不可见（双臂四工作区全案隔离）；跨设备同步非目标。

## 4. 已证边界（如实登记）

- 普通无草稿启动（begin/list 只读路径）**不建 `.jade` 目录**（split 空库两案 + Node exists 断言）。
- tree/link_index/全文检索对 `.jade/drafts` 零感知（dot 前缀 walk 忽略——含 emoji 草稿正文不进检索）。
- 恢复枚举**零写面**（草稿树前后逐字节不变——29 文件 hash 对读）。
- 迟到结算竞态语义见上 4；「保存期间新修订不结算」由 settle_erev 门 + front 单在-flight 纪律共同
  保证，T-03/T-05 落 store 侧。
- C++/Rust 侧 fsync/断电保证非目标（计划 §1 非目标如实）；json.to_value 未在 back 侧使用
  （read_dir JSON 手工剥壳——名字域受限为前提）。
- 预览截断按字符数（120）——展示域截断，正文完整性由三重校验保证。
