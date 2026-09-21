# jade-edit 架构定版（SD-01，PLAN-081）

> 新应用首个 spec 面（本仓无既有 spec 历史）。锚定 2026-09-20 PLAN-081
> 初始版；后续所有功能的架构锚。决策证据链：
> [plans/attachments/081-t00-rulings.md](plans/attachments/081-t00-rulings.md)（T-00 三勘定）+
> auto-down `docs/plans/081-jade-edit-bootstrap.md`（计划本体）。

## 1. 定位

jade-edit = AutoDown（`.ad`）编辑器，**AutoUI 单工程双轨首例**：同一份
`src/front/*.at` 单源，vm 轨解释渲染（iced 原生窗）、vue 轨生成 Vue3+Vite
工程。双轨一致性从初始版起同日落地（gate 双臂同断言域），不积累组装级
差异——旧 jade-garden 两工程分裂（front/auto vue + front/desktop VM
twin 副本）的教训不在此重演。溯源（全新应用非拷贝、家族/冻结池关系）：
[PROVENANCE.md](PROVENANCE.md)。

## 2. 单工程双轨机制（T-00 R-1 裁定 A'）

pac.at 单声明 `render: ["vm","vue"]` + **双命令分工**：

| 轨 | 命令 | 说明 |
| --- | --- | --- |
| vm | `auto run -r vm` | CLI `--render` 运行期覆盖；解释渲染 iced 窗；MCP 经 `AUTOUI_MCP_PORT` env 开放（自动化通道） |
| vue | `auto build -r vue` | build 期同款覆盖；生成 `gen/front/vue` Vue3+Vite 工程 |

- **围栏**：禁止裸 `auto build`——Multi 声明下选 vm 项走 C/ninja 转译
  路径（T-00 探针①实证）。vue 生成一律经 `pnpm build`
  （= `scripts/regen-vue.mjs`，内含 `-r vue`）。
- `gen/`（生成树）、`deps/`（bp 物化）、`build/`（C 产物）、
  `rust-workspace/` 均不入库——vue 面是纯生成物，jade-edit 无手写 vue
  文件，故无 demo/jade 的 deploy-into-src 步（零 committed 漂移面）。

## 3. 单源与消费面（013 形态定形，T-06 实证）

```
src/front/app.at          App 壳：filetree + 编辑区 + status 行（自有
                           ft_*/status 状态）+ on 纯薄委托
src/front/editor_store.at EditorStore：tabs/脏标/保存流 + active_* 显示
                           投影（状态权威；视图唯一读面 .store.*）
src/back/api.at           /api 契约（自有 Auto 源，与实现同 commit——
                          契约副本与漂移门已随换基退役，见 §5）
```

- **状态权威与显示投影全在 store**；App 视图经 `.store.*` 读（vue=响应式
  ref 投影 / vm=合并根状态），App handler 不回读 store 状态。
- 双轨硬约束（T-03/T-06 实测定律，写入前先查此表）：

| # | 约束 | 处置 |
| --- | --- | --- |
| C-1 | JsonAny 经 VM 变量/Obj 字面量存取均损坏（对象 id 泄漏 / `<vmref>`） | Save 内 read→传不落变量（editor_store `.Save` 注记） |
| C-2 | 合并根状态裸读（`.tabs` 等）仅 vm 成立；vue 发射裸标识符 | 视图一律 `.store.*`，handler 纯薄委托 |
| C-3 | store computed 在 vue 发射为未声明标识符 | 不写 store computed；handler 内联 find |
| C-4 | findIndex VM 静默失效；for-in 参数列表零迭代（P614） | `.find(t => …)` + while+索引 |
| C-5 | INPUT_TEXT / type_text = 整文替换语义（jade 080 同裁定） | 编辑矩阵以磁盘原文构造全文 |
| C-6 | msg 载荷单类型；裸 `var x = []` VM 静默坏列表 | 单 map 载荷；typed 声明 |

- **active_body 镜像语义（SD-201，PLAN-002 T-03 固化）**：`active_body`
  是每键整文回写的镜像——编辑器 `oninput`（vm INPUT_TEXT / vue
  `@update:modelValue` 同源）把**整份文档**经 `.Edit(text)` 回写 store，
  store 即文档事实源（保存/脏标/重载全走它）。这是 **vue 通道承重**
  结构：vue 编辑器 `:content` 单向播种 + 整文回传，无区间增量面；与
  auto-edit 的「编辑器权威 + 去镜像」形态结构性不同（jade 编辑器组件
  不持文档事实源）。**大文档上限受制于此**：每键 O(n) 整文回传 +
  read_wiki 整文读（实测 1MB 文档整文读链阻塞，bench `open_large_doc`
  blocked-upstream 记账）。**unlock = 上游 rope delta/分块读**（delta
  事件流 + back 分块读端点，见 [upstream 供料包](upstream/2026-09-jade-supply.md)
  §1/§2）——上游落地前禁对该路径调优，测试矩阵以磁盘原文构造全文
  （C-5）即其纪律面。

- vue 生成链补件已随上游清偿退役（2026-09-21，照 auto-edit d845e54
  先例；上游 PLAN-671 r1+Phase 2 + PLAN-646，工具链 ≥ v0.4.2-1652）：
  natives 声明层/条件抛错桩、store 自调别名内联、int 负初值、button
  text variant、menubar 族 schema 吸收（strict 零 S001，`--lenient`
  摘除）、多段插值、auto-sources 真值、vite-env 均生成器自备。残余三
  补件（regen-vue.mjs pattern 断言守，见 [parity-ledger.md](parity-ledger.md)
  D-13/D-15）：vm-natives 运行期垫片（e2e 热路径）、tree JSON.parse
  （str 标量契约）、tabs.remove→splice（R010 直通，上游未清偿）。

## 4. 编辑器消费（外部官方组件）

编辑器内核 = `@autodown/engine`（auto-down，AutoUI 标准组件化；出口契约
1.0 冻结）——**唯一特殊 = 不在 auto-lang 仓**，以外部官方组件注册：

- vm 轨：auto-lang `autodown_editor` 官方件位（PLAN-068 T-02）；
  `autodown_editor (key: .store.active_path, final: true) { content: …,
  oninput: .Edit }`——key 变即重挂载 = 播种通道；快照投影为 `textarea`
  （Q1 冻结形态）。
- vue 轨：npm_deps link → 生成 App.vue 的 `AutoDownEditor`
  （`:content` + `@update:modelValue`）；engine dist 新鲜度经
  `assert-dist-fresh` 卫兵（regen-vue 内 fail-fast）。
- engine rust/VM 平台面 experimental（engine ARCHITECTURE §2）——深层
  行为差异入 [parity-ledger.md](parity-ledger.md)。

## 5. 后端（PLAN-001 换基定版：自有 Auto src/back——supersede R-3）

> PLAN-081 T-00 R-3（外部 axum exe 复用）为 bootstrap 期零后端工作量
> 捷径，2026-09-20/21 用户改道裁定后由本节取代（HTTP-always split =
> 旧 jade-garden 纯 Vue 时代遗产配方；历史见
> [plans/001-jade-edit-rebase-autoedit.md](plans/001-jade-edit-rebase-autoedit.md)
> §4 supersede 登记）。

- 后端 = **自有 `src/back`（Auto 写）**：`api.at` 契约（`#[api]` fn，
  013-todo 形态）+ `wsys.at` 实现本体（全部 FS IO 收口；front 零
  `fs.*`/`File.*` 内建——vue 轨 ts_adapter 将其拦为 `__vmOnly`）。
  契约与实现同文件同 commit ⇒ 结构性无漂移（PLAN-081 的契约副本 +
  漂移门随之退役）。
- **边界三形态**（auto-lang main.rs:1002-1025 实证）：
  - vm merged（默认）：`use back.api` = 进程内 CALL 直调，零 HTTP 零端口；
  - vm split：`auto run -r vm --no-merge`（AutoVM HTTP 同进程起服）；
  - vue：ts_adapter 生成 HTTP client + vite `/api` 代理（`AUTO_HTTP_PORT`），
    后端独立供给 = `auto run --server vm -B <port>`（`scripts/serve-back.mjs`）。
- **pac 纪律：不写 `api:` 字段**——服务引擎（AutoVM HTTP / a2r rust）
  留运行期 `--server` 切换；`api:"rust"` 会杀 merged 且当前 a2r 生成器
  缺口在册（auto-edit PLAN-003 F-R1，E0432）。旧 28 路由功能面
  （parser/linkgraph/agenda/multipart）仍属 jade-garden 冻结功能池，后续批
  以 Auto 形态移植。
- 工作区根解析：`JADE_WORKSPACE`（fixture 隔离通道）→ `AUTO_PROJECT_DIR`
  （auto-man 无条件注入工程目录——automan.rs:1435，故隔离需独立名）→
  `"."`；相对路径 back 侧 `resolve()` 拼根（VM 渲染期 CWD 会切 src/front）。
- wiki 域语义：`read_wiki` 只回 body（frontmatter 在 back 侧字符串层
  保留/拼回——PLAN-081 的 VM JsonAny 损坏类结构性消除）；`updated_at`
  补写 v0 不做（frontmatter 逐字保留，功能池后续批）。
- fixture workspace 每次全新隔离拷贝（源 = auto-down `tmp/wiki-demo`，
  `JADE_FIXTURE` 可覆）——测试会打字保存，源零污染。Auto back 无 config
  文件 ⇒ 旧「exe 旁陈年 config 压 env」事故类别结构性消失（belt 保留为
  ws_root 实际根断言）。

## 6. 测试体系（双轨一致性门；PLAN-001 T-04 换基迁移）

| 门 | 命令 | 断言域 |
| --- | --- | --- |
| vm 矩阵（双臂） | `node tests/vm_matrix.mjs` | merged 臂（进程内直调）+ split 臂（`--no-merge` HTTP）各六检查（boot/tree/open/edit/save/reload）+ 结构基线 v1 零漂移（merged 臂锁，`tests/baseline/structure-v1.txt`；v0 留档） |
| vue build | `pnpm build`（= regen-vue.mjs） | 裸 strict 生成 + 三残余补件 + vue-tsc 0 错 + vite build |
| vue e2e | `pnpm test:e2e` | playwright **同一检查单**（serve-back AutoVM 后端 + vite 双 webServer） |
| 双臂总门 | `node scripts/gate.mjs` | ①vm 双臂 ②vue(build+e2e) 顺序全绿（契约漂移段已随自有源退役） |

断言域 = 两轨交集（结构/文本/磁盘字节，**非像素**）；差异登记面 =
[parity-ledger.md](parity-ledger.md)（从第一天记账）。

## 7. 双轨纪律

- **同日落地**：新功能单源写入后，vm/vue 两轨验证同日完成（gate 双臂），
  不允许"先 vm 后补 vue"（旧 jade-garden 分裂成因，PLAN-081 立项裁定）。
- 差异不静默：任何一轨暂缺的面 → parity-ledger 记账（形态/处置/升级
  路径），不留在代码注释里埋伏。
- 旧 jade-garden 冻结零改动（功能池）；其 vue 专属组件迁 AutoUI/BP 属
  后续批（design 30 §6 判定），不在本仓 v0 面。
