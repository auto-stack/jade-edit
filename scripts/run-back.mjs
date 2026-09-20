#!/usr/bin/env node
// run-back.mjs — PLAN-081 T-04b：jade-garden-back 外部服务器定位/启动 +
// fixture workspace 隔离拷贝（jade e2e-prepare.mjs 模式：测试会写文件，
// 拷贝隔离不污染源）。
//
// CLI（人工/排障用）：
//   node scripts/run-back.mjs [--port 8199] [--workspace <dir>] [--vm]
//     --workspace 未给 = 隔离拷贝 fixture（e2e/.runtime/workspace，每次
//     全新鲜）；给定 = 直接用该目录（如指向只读冒烟 fixture）。
//     --vm = JADE_GARDEN_SERVER=vm 透传（实验 VM 模式，T-00 R-3 登记
//     战略后续；默认 axum 模式=双轨在跑配方）。
//
// 库（tests/vm_matrix.mjs / e2e 消费）：
//   import { startBackend } from './run-back.mjs'
//   const back = await startBackend({ port, workspace, vm })
//   … back.url / back.workspace / await back.stop()

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 后端二进制：直引 auto-down 构建产物（§10 默认裁定 #5——一处定位 +
// 缺失提示构建命令；组 worktree 场景经 JADE_BACKEND_EXE 覆盖）。
const BACKEND_EXE =
  process.env.JADE_BACKEND_EXE ??
  'D:/autostack/auto-down/jade-garden/back/server/target/debug/jade-garden-back.exe'

// fixture 源：旧 jade vm-smoke 同源（JADE_FIXTURE 可覆）。
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Windows 路径归一（\\?\ 前缀 / 盘符大小写 / 分隔符）——workspace 断言用。
const normPath = (p) => p.replace(/^\\\\\?\\/, '').replace(/\\/g, '/').toLowerCase()

export async function startBackend({ port = 8199, workspace, vm = false } = {}) {
  if (!fs.existsSync(BACKEND_EXE)) {
    throw new Error(
      `[run-back] backend exe not found: ${BACKEND_EXE}\n` +
        `[run-back] build it first: cd D:/autostack/auto-down/jade-garden/back/server && cargo build\n` +
        `[run-back] (or point JADE_BACKEND_EXE at an existing build)`
    )
  }

  let ws = workspace
  if (!ws) {
    if (!fs.existsSync(FIXTURE_SOURCE)) throw new Error(`[run-back] fixture source missing: ${FIXTURE_SOURCE}`)
    // 隔离拷贝：每次全新（e2e-prepare 同款——测试会打字保存，源零污染）。
    ws = path.join(repoRoot, 'e2e', '.runtime', 'workspace')
    fs.rmSync(ws, { recursive: true, force: true })
    fs.mkdirSync(ws, { recursive: true })
    fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })
  }

  // exe 拷贝隔离（e2e-prepare 原配方）：服务器把 jade-garden-config.json
  // 存在 exe 旁且 **config 里的 workspace_root 压过 JADE_GARDEN_DEFAULT_
  // WORKSPACE env**（server/src/state.rs:27）——原地跑 exe 时一份陈年 config
  // 即可让本脚本的所有写落进 auto-down 源 fixture（T-03 实录事故）。跑
  // .runtime 副本 + 删副本旁陈年 config ⇒ env 恒生效，且结构性不可能写
  // 进 auto-down。
  const runtimeDir = path.join(repoRoot, 'e2e', '.runtime')
  fs.mkdirSync(runtimeDir, { recursive: true })
  const exeCopy = path.join(runtimeDir, 'jade-garden-back.exe')
  fs.copyFileSync(BACKEND_EXE, exeCopy)
  fs.rmSync(path.join(runtimeDir, 'jade-garden-config.json'), { force: true })

  const env = {
    ...process.env,
    JADE_GARDEN_PORT: String(port),
    JADE_GARDEN_DEFAULT_WORKSPACE: ws,
  }
  if (vm) env.JADE_GARDEN_SERVER = 'vm'

  const child = spawn(exeCopy, [], { cwd: runtimeDir, env, stdio: ['ignore', 'pipe', 'pipe'] })
  let out = ''
  child.stdout.on('data', (d) => (out += d))
  child.stderr.on('data', (d) => (out += d))

  const url = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 30000
  for (;;) {
    if (child.exitCode !== null) throw new Error(`[run-back] backend exited early (code ${child.exitCode}):\n${out.slice(-2000)}`)
    try {
      const res = await fetch(`${url}/api/health`)
      if (res.ok) break
    } catch {}
    if (Date.now() > deadline) {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
      throw new Error(`[run-back] health not reachable on ${url} in 30s\n${out.slice(-2000)}`)
    }
    await sleep(400)
  }

  // workspace 实际根断言（belt）：env 未生效（陈年 config 等）即 fail-fast，
  // 不让任何写落到预期之外的位置。
  const wsRes = await fetch(`${url}/api/workspace`)
  const wsJson = await wsRes.json().catch(() => null)
  const gotRoot = normPath(String(wsJson?.root ?? ''))
  const wantRoot = normPath(ws)
  if (!gotRoot || !gotRoot.startsWith(wantRoot)) {
    try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    throw new Error(`[run-back] server workspace mismatch: got "${gotRoot}" want "${wantRoot}"（env 未生效——陈年 config？）`)
  }

  return {
    url,
    workspace: ws,
    child,
    log: () => out,
    stop: async () => {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
      await sleep(400)
    },
  }
}

// ---- CLI ----
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const argOf = (name) => {
    const i = args.indexOf(name)
    return i >= 0 ? args[i + 1] : undefined
  }
  const port = Number(argOf('--port') ?? 8199)
  const workspace = argOf('--workspace')
  const vm = args.includes('--vm')
  const back = await startBackend({ port, workspace, vm })
  console.log(`[run-back] ${vm ? 'VM(experimental)' : 'axum'} backend up: ${back.url}/api/health -> ok`)
  console.log(`[run-back] workspace: ${back.workspace}`)
  console.log('[run-back] Ctrl+C to stop')
  back.child.on('exit', (code) => {
    console.log(`[run-back] backend exited (code ${code})`)
    process.exit(0)
  })
}
