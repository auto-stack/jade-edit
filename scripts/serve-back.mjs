#!/usr/bin/env node
// serve-back.mjs — PLAN-001 T-04：AutoVM 后端独立 serve（vue e2e / 联调
// 用）——run-back.mjs（外部 Rust exe 消费，PLAN-081 配方）的换基替代。
//
// 形态：spawn `auto run --server vm -B <port>`（同进程 AutoVM HTTP 后端，
// 不开窗——T-00 ① 勘定配方）+ fixture 隔离拷贝（源零污染）+ ws_root belt。
// 旧 exe 旁陈年 config 压 env 的事故类别在 Auto back 无 config 文件 =
// 结构性消失；belt 保留为 JADE_WORKSPACE 未生效的 fail-fast。
//
// CLI：node scripts/serve-back.mjs [--port 8211]
// 库：import { serveBackend } from './serve-back.mjs'

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const AUTO_EXE = process.env.AUTO_EXE ?? 'D:/autostack/auto-lang/target/debug/auto.exe'
const FIXTURE_SOURCE = process.env.JADE_FIXTURE ?? 'D:/autostack/auto-down/tmp/wiki-demo'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const normPath = (p) => p.replace(/^\\\\\?\\/, '').replace(/\\/g, '/').toLowerCase()

export async function serveBackend({ port = 8211 } = {}) {
  const ws = path.join(repoRoot, 'e2e', '.runtime', 'workspace')
  if (!fs.existsSync(FIXTURE_SOURCE)) throw new Error(`[serve-back] fixture source missing: ${FIXTURE_SOURCE}`)
  fs.rmSync(ws, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(ws), { recursive: true })
  fs.cpSync(FIXTURE_SOURCE, ws, { recursive: true })

  const child = spawn(AUTO_EXE, ['run', '--server', 'vm', '-B', String(port)], {
    cwd: repoRoot,
    env: { ...process.env, JADE_WORKSPACE: ws },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  child.stdout.on('data', (d) => (out += d))
  child.stderr.on('data', (d) => (out += d))

  const url = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 30000
  for (;;) {
    if (child.exitCode !== null) throw new Error(`[serve-back] backend exited early (code ${child.exitCode}):\n${out.slice(-2000)}`)
    try {
      const res = await fetch(`${url}/api/ws_root`)
      if (res.ok) break
    } catch {}
    if (Date.now() > deadline) {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
      throw new Error(`[serve-back] not reachable on ${url} in 30s\n${out.slice(-2000)}`)
    }
    await sleep(400)
  }

  // belt：ws_root 实际指向 fixture（JADE_WORKSPACE 未生效即 fail-fast）。
  // 响应体 = JSON 编码字符串（含转义反斜杠）——JSON.parse 解包后再比。
  const belt = await fetch(`${url}/api/ws_root`)
  const beltText = JSON.parse(await belt.text())
  if (!normPath(beltText).includes(normPath(ws))) {
    try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
    throw new Error(`[serve-back] ws_root mismatch: got "${beltText}" want prefix "${ws}"（JADE_WORKSPACE 未生效？）`)
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
  const i = args.indexOf('--port')
  const port = Number(i >= 0 ? args[i + 1] : 8211)
  const back = await serveBackend({ port })
  console.log(`[serve-back] AutoVM backend up: ${back.url}/api/ws_root -> ok`)
  console.log(`[serve-back] workspace: ${back.workspace}`)
  console.log('[serve-back] Ctrl+C to stop')
  back.child.on('exit', (code) => {
    console.log(`[serve-back] backend exited (code ${code})`)
    process.exit(0)
  })
}
