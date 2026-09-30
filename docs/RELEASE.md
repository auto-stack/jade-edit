# jade-edit v0.1.0 Release 文档（试用就绪——第二十七切片，PLAN-029）

> v0.1.0 = **源码里程碑「试用就绪」**：面向中文个人 wiki 目标用户的
> `.ad`（AutoDown/markdown-wiki）桌面编辑器首号试用版。产品定位/北标
> 见 [README.md](README.md) 与 [ARCHITECTURE.md](ARCHITECTURE.md) §1；
> 双轨差异/已知缺口登记见 [parity-ledger.md](parity-ledger.md)。
> 本文档 = v0.1.0 判据定文（PLAN-028 §4.3 提案定文化，r1 草案经
> work/review 流交用户复审）+ 交付形态 + 试用指南 + 已知限制 +
> 切片摘要。

## 1. v0.1.0 判据（「试用就绪」三收口件）

**三收口件**（tag 前收口清单——PLAN-028 §4.3 提案定文化）：

| # | 收口件 | 状态 | 证据锚 |
| --- | --- | --- | --- |
| ① | CJK 开档 vue 轨 | ✅ 已收口（PLAN-028） | 三契约 POST 化（read_wiki/exists/page_meta）+ receipt g①/g② 翻绿直证 + e2e 15 cjk 开档全弧——archived/028 |
| ② | 真实试用 ≥1 轮（用户侧） | ⏳ 待用户确认 | **回执注记位：用户试用 ≥1 轮后在此注记一句确认即可**（确认口径 = 用户一句话回执；反馈件另按池立项，非本判据阻塞面） |
| ③ | release 批全量回归 receipt | ✅ 本批落档 | 六面 fresh 全绿 receipt——docs/plans/029 §8（RELG-2901） |

**已达面清单**（v0.1.0 内容面）：

- **功能切片 21**（第一..第二十六切片中的功能面——开档/编辑保存/
  双链反链/查找双模式/建页/改名改写/树管理/标签/提及/别名/属性写面/
  目录面/显示名/每日笔记/回收站/casefold/目录移动/目录合并/孤页/
  最近打开/合并三择/CJK 全弧）；
- **性能批 3 + 有界调查 1**（索引单趟 022/watch 读取面 023/mtime 缓存
  no-go 关账 024）+ **回执批 2**（上游回执复测 026/单取形重推回退
  027）——全程判绿链六面承载（vm 矩阵基线 v20 零漂移 + e2e 十五段 +
  vue build + probe 15 件 + bench150 + 双臂分段注记）；
- 结构基线 **v20** 零漂移在册（`tests/baseline/structure-v20.txt`
  ——vm 轨 state 逐字节 + vnode id 序列两仪器）。

**tag 前置条件清单**（三件齐备 → 一命令即达）：

1. ✅ 全量回归 receipt 在档（本批 §8——RELG-2901 六面）；
2. ✅ dist 现势核验通过（本批 T-03——✓built@tip + 双形冒烟）；
3. ⏳ **用户真实试用 ≥1 轮确认**（判据②——唯一待办）。

**tag 命令预案**（**本批不打**——前置③未满足，状态 = tag-ready；
用户自打，或用户明示后代打）：

```sh
git tag -a v0.1.0 -m "jade-edit v0.1.0 试用就绪——二十六切片/CJK 双臂全弧/双轨判绿链六面全绿（vm 基线 v20+e2e 十五段+probe 15 件+build+bench150）/已知限制五件注记见 docs/RELEASE.md §4"
```

> message 草案要点：二十六切片 + CJK 双臂 + 回归 receipt 锚
> （docs/plans/029 §8）+ 已知限制指针。tag = 对外承诺动作（硬不可
> 逆面）——本批止于 tag-ready 态，`git tag` 保持 0（AC-04 断言面）。

## 2. 交付形态

**v0.1.0 = 源码里程碑**（仓库自建自用形态——**无独立安装包**：
打包批[独立 exe/installer/zip] = v0.2.0 候选，另立计划）。

| 形态 | 启动 | 说明 |
| --- | --- | --- |
| **merged（默认推荐）** | `JADE_WORKSPACE=<wiki 目录> auto run -r vm` | back 进程内直调，单命令单进程；iced 原生窗 |
| **vue（单命令集成形）** | `JADE_WORKSPACE=<wiki 目录> auto run -r vue --server vm -B 8211 -F 4443` | 工具链集成：vue 前端 serve + HTTP 后端自动接线 + 工具链窗（webview）；后端 8211/前端 4443 可按需换端口 |

> **dist 产物注记**：`pnpm build` 产出的 `gen/front/vue/dist` = release
> 构建物（本批 ✓built@tip 现势在册——assert-dist-fresh 通道随 build
> 链执行）。dist **独立静态 serve**（`vite preview`）当前不代理 `/api`
> （vite 5.4.21 实测：preview 未应用 server.proxy——API 404）——vue
> 形试用以集成单命令形承载；dist 独立 serve 通道 = 打包批（v0.2.0
> 候选）一并收口。
>
> **集成形运行注记（F-29-R3）**：`auto run -r vue` 启动即再生
> `gen/front/vue` 部分生成文件（工具链原生 run 语义）——会抹掉
> `pnpm build`（regen-vue）铺设的运行期补件面（tabs splice + 垫片
> no-op；D-15/R010 族在册）。**用户试用零影响**（工具链原生行为自
> 洽）；**repo 验证链注意**：任何 `auto run -r vue` 之后跑 e2e/build
> 前，先重跑 `pnpm build` 恢复补件态。vue 集成形下退出/终止面 =
> 工具链原生语义（D-13 上游族在册）。

**依赖**：

- `auto.exe`（auto-lang 工具链，**≥ v0.4.2-2125**——PLAN-699 Axum/
  Hyper HTTP 传输 + 671/682 生成器批次在含；本批验收窗载体 =
  **v0.4.2-2311-g7fcf913eb** 实录）在 PATH 或 `AUTO_EXE` env；
- Node.js + pnpm（vue 形态构建/serve 用；仓根 `pnpm install` 装
  playwright 与 gen 面依赖）。

## 3. 试用指南（命令实走验证——本批 T-03 逐条直证）

**一次性准备**（仓根执行）：

```sh
pnpm install        # playwright + gen 面依赖
pnpm build          # vue 生成链一键重建（regen+vue-tsc+vite build → dist）
```

**形态 A——merged 单命令**（推荐）：

```sh
JADE_WORKSPACE=<你的 wiki 目录> auto run -r vm
```

**形态 B——vue 集成单命令**：

```sh
JADE_WORKSPACE=<你的 wiki 目录> auto run -r vue --server vm -B 8211 -F 4443
# 工具链窗打开即用（前端 http://localhost:4443；后端 8211 自动接线）
```

> 工作区根机制（`wsys.at` root_dir）：`JADE_WORKSPACE` env →
> `AUTO_PROJECT_DIR` env → `.`（cwd）三级回退——**两种形态都必须
> 显式 `JADE_WORKSPACE` 指向你的 wiki**（缺省回落 cwd 非用户语料）。
> `scripts/serve-back.mjs` 为开发/e2e 联调形态（fixture 隔离拷贝，
> JADE_WORKSPACE 被其托管——不适用真实工作区，见 README 运行矩阵）。
> 工作区 = `.ad`（AutoDown/markdown-wiki）文件目录；>200 页触发
> StatusBar 知情警示（§4 ②）。

**核心弧 walkthrough**（十弧，各一行）：

| 弧 | 操作 |
| --- | --- |
| 开档 | 左侧 EXPLORER 树点击 `.ad` 行 → 编辑器打开（CJK 档名全弧可用） |
| 编辑保存 | 编辑器内直接改 → 工具栏「保存」（脏标清零；已有 `updated_at` 键的档自动维护时间戳） |
| 建页 | EXPLORER 头部「＋」新建；或正文写 `[[还不存在的页]]` → 反链面板悬空行点击 → 确认弹层建页接回 |
| 双链反链 | 正文写 `[[页面名]]` → 视图菜单「切换反链」→ 反链/出链/未链接提及三段面板 |
| 标签 | frontmatter 写 `tags:` 或正文行内 `#tag` → Ctrl+T 标签面板（计数 → 展开 → 导航） |
| 检索 | Ctrl+P 快开（文件名/最近）；Ctrl+Shift+F 全文检索（CJK 查询可用） |
| 目录操作 | EXPLORER「⊕」新建目录；文件菜单「移动到目录…/重命名目录…/删除目录…」（移动/改名零断链——stem 不变语义） |
| 回收站 | Delete 键/菜单删除 → 移入 `.trash/`（可恢复可清空）→ Ctrl+Shift+T 回收站面板 |
| 每日笔记 | Ctrl+Alt+N/工具栏日历钮 → 今日笔记（`yyyy_MM_dd` 幂等建档） |
| 快开最近 | Ctrl+P 空 input → 「最近」段（跨会话恢复——`.jade/recents.txt`） |

## 4. 已知限制（五件注记面——release notes 如实记载）

1. **split 臂 boot 域**（`auto run -r vm --no-merge` 形态——dev/测试
   通道）：boot FAIL+wiki 树行不现缺陷域在册（F-R17-1 留观第十三窗
   ，上游家族独立缺陷——**交付形态 merged/vue 集成单命令形不涉**
   [F-29-R2 补正——vue 形定形见 §2]；split 臂 CJK 双臂化接线已就位
   ，家族专项修复后即跑）。
2. **P ≤ 200 上限**（上游 VM 字符串池值损坏域——D-35②）：>200 页
   工作区 StatusBar 知情警示（「索引可能不稳定」——知情不禁用，
   纯显示面）；150 页实测健康（P≤200 稳定域驻留实测在册）。
3. **D-39 双取形**（vue 轨链接刷新 workaround——纯性能 ~0.3s/触点
   ）：单取形触发 dev-stack 树响应滞留竞态（023/027 两窗四象限
   定谳），双取形维持；功能零影响，不阻断任何弧。
4. **大纲/行:列/图谱**（上游门控面）：autodown_editor 无
   oncursor/anchor-reveal 事件臂（D-12——行:列降级为文档计数+脏标
   ；大纲/图谱 tab 顺位后移待上游组件面）；检索/提及/标签等知识面
   不受涉。
5. **D-41 probe_mtime release 载体挂起**（**仪器面非产品**——测试
   探针在 release exe 上挂起，debug 正常）：probe_mtime 按路由纪律
   走 debug 载体（供料候选在册）；产品 merged/vue 面零涉。

## 5. 切片摘要（001..028 一行一览）

| 计划 | 切片 | 一行 |
| --- | --- | --- |
| 001 | （前置） | 换基自有 back——Auto src/back 进程内直调，supersede 外部 exe 复用 |
| 002 | （前置） | 双轨同步批——判绿口径定文（SD-204）+ 测量套件（SD-205）+ tab/editops/quit 扩单 |
| 003 | 第一 | wikilink 索引 + 反链/出链面板（知识库方向移植首片） |
| 004 | 第二 | 查找面板——快开 Ctrl+P + 全文检索 Ctrl+Shift+F 双模式 |
| 005 | 第三 | 悬空建页闭环——悬空行点击 → 确认 → 建页 → 索引/树刷新 |
| 006 | 第四 | 重命名 + 反链改写——磁盘改名 + 全部入链源文自动改写 |
| 007 | 第五 | 树文件管理——新建/删除（入链悬空化，删除语义如实） |
| 008 | 第六 | 标签面板 + 悬空链接清单（wanted 模式——发现→建页→消缺） |
| 009 | 第七 | 未链接提及 + 行内 #tag（反链面板第三段 + tags 聚合扩面） |
| 010 | 第八 | 别名解析 + 提及转链接（frontmatter aliases + linkify） |
| 011 | 第九 | 页面属性写面——frontmatter 受控写首开（tags/aliases/title） |
| 012 | 第十 | 目录面 + 检索 alias（新建/移动目录 + stem∪aliases 检索） |
| 013 | 第十一 | 显示名——frontmatter title 消费 + 两域边界定文 |
| 014 | 第十二 | 目录面二期 + 面板行显示名化（删除/重命名目录收口） |
| 015 | 第十三 | 上游解锁兑现批——每日笔记/updated_at 自动维护/HTTP 回执负结果定谳 |
| 016 | 第十四 | 回收站——`.trash/` 改道 + trash_list/restore/purge 三契约 |
| 017 | 第十五 | casefold + 词边界——解析四级序 + case-only 改名解锁 |
| 018 | 第十六 | 目录移动 + 上量微批（move_dir + StringBuilder 装配 + depth 8；P≤200 定界） |
| 019 | 第十七 | 目录合并 + trash 增强（merge 参数 + 恢复全部/行预览） |
| 020 | 第十八 | 孤页清单 + 最近打开（知识健康 + 快速切换器） |
| 021 | 第十九 | 试用赋能批——recents 持久化（`.jade/`）+ P≤200 防线 + 150 页实测 |
| 022 | 第二十 | 索引单趟合并性能批——tags 246ms/孤页弧 −0.93s/boot-ready 2.64s |
| 023 | 第二十一 | watch 批读面/取面收口（部分交付——双取形挂账 D-39） |
| 024 | 第二十二 | mtime 键控缓存专项探针批（no-go 关账——收益面实测否定） |
| 025 | 第二十三 | 目录合并三择 + tab 重映射批（both/skip/overwrite + moves 映射） |
| 026 | 第二十四 | 上游回执复测批（blocked → 706r2 重入全绿——D-21 正出口） |
| 027 | 第二十五 | 双取形消除重推批（回退出口——单取形 2/2 败实勘，三选维持①） |
| 028 | 第二十六 | CJK HTTP 面 POST 化适配批（里程碑收口件——D-19 repo 侧收口 + CJK 双臂化） |

---

> **判据交裁注记**：本 §1 判据表为 r1 草案（「试用 ≥1 轮」确认口径
> + 无安装包语义 + 注记面五件加減）——经 work/review 流交用户复审
> 裁处；修订走计划契约流，不静默改判据。
