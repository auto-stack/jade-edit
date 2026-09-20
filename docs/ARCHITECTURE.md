# jade-edit 架构定版（SD-01，PLAN-081）

> 新应用首个 spec 面（本仓无既有 spec 历史）。锚定 2026-09-20 PLAN-081
> 初始版；后续所有功能的架构锚。决策证据链：
> [plans/081-t00-rulings.md](plans/081-t00-rulings.md)（T-00 三勘定）+
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
src/back/api.at           /api 契约副本（GENERATED，漂移门守）
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

- vue 生成链已知四缺口（regen-vue.mjs 内补丁 + pattern 断言，上游修复
  后断言失败提示撤除）：通配路由 URL 不替换、`List<T>` 直译、`JsonAny`
  直译、`map` 参数类型直译。另：`auto-sources.ts`/`env.d.ts` 为 gen-only
  流补件（`auto run` vue 流才写真值）。

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

## 5. 后端复用（T-00 R-3 裁定：axum 模式）

- 后端 = **外部服务器进程** jade-garden-back（auto-down 冻结仓构建产物，
  直引路径——`scripts/run-back.mjs` 一处定位 + 缺失提示构建命令）。
- **exe 拷贝隔离**（e2e-prepare 原配方）：服务器把 `jade-garden-config.json`
  存在 exe 旁且 **config 的 workspace_root 压过
  `JADE_GARDEN_DEFAULT_WORKSPACE` env**（server state.rs:27）——原地跑
  exe 时一份陈年 config 即可让所有写落错位置（T-03 实录事故：auto-down
  源 fixture 被写坏）。run-back 跑 `e2e/.runtime` 副本 + 删副本旁 config
  + 启动后 `GET /api/workspace` 实际根断言（belt）。
- fixture workspace 每次全新隔离拷贝（源 = auto-down `tmp/wiki-demo`，
  `JADE_FIXTURE` 可覆）——测试会打字保存，源零污染。
- split 模式：vm 轨 `AUTO_VM_MERGE=0` + `AUTO_BACKEND=<url>`；vue 轨经
  vite `/api` 代理（`AUTO_HTTP_PORT`）。
- VM 模式（`JADE_GARDEN_SERVER=vm`，/api 整面跑 AutoVM）= 同 exe 一 env
  开关，**实验**（无在跑门消费），战略后续另行验证——run-back `--vm`
  可切。契约面 `src/back/api.at` 与模式无关（副本 + 漂移门常绿）。

## 6. 测试体系（双轨一致性门 v0）

| 门 | 命令 | 断言域 |
| --- | --- | --- |
| vm 矩阵 | `node tests/vm_matrix.mjs` | 六检查（boot/tree/open/edit/save/reload）+ 结构基线零漂移（`tests/baseline/structure-v0.txt`，vnode id 为结构确定性哈希） |
| vue build | `pnpm build` | regen + 补丁 + vue-tsc 0 错 + vite build |
| vue e2e | `pnpm test:e2e` | playwright **同一检查单**（单 test：playwright 每 test 新页面，状态延续只在单 test 内） |
| 契约门 | `node scripts/contract-sync.mjs --check` | 副本 ↔ auto-down 冻结源字节等价 + 四路由标记在册 |
| 双臂总门 | `node scripts/gate.mjs` | ①vm ②vue(build+e2e) ③契约 顺序全绿 |

断言域 = 两轨交集（结构/文本/磁盘字节，**非像素**）；差异登记面 =
[parity-ledger.md](parity-ledger.md)（从第一天记账）。

## 7. 双轨纪律

- **同日落地**：新功能单源写入后，vm/vue 两轨验证同日完成（gate 双臂），
  不允许"先 vm 后补 vue"（旧 jade-garden 分裂成因，PLAN-081 立项裁定）。
- 差异不静默：任何一轨暂缺的面 → parity-ledger 记账（形态/处置/升级
  路径），不留在代码注释里埋伏。
- 旧 jade-garden 冻结零改动（功能池）；其 vue 专属组件迁 AutoUI/BP 属
  后续批（design 30 §6 判定），不在本仓 v0 面。
