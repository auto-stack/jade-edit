#!/usr/bin/env node
// gate.mjs — PLAN-081 T-07：双轨一致性门 v0（component-gallery gate 模式
// 裁剪版）。顺序三段，任一失败即 exit 1：
//
//   ① vm 矩阵    node tests/vm_matrix.mjs（六检查 + 结构基线零漂移）
//   ② vue 面     pnpm build（regen+补丁+vue-tsc+vite）+ pnpm test:e2e
//                （playwright 六检查同一检查单）
//   ③ 契约漂移门 node scripts/contract-sync.mjs --check（副本 ↔ 冻结源）
//
// 断言域 = 两轨交集（结构/文本/磁盘字节，非像素）；差异登记面 =
// docs/parity-ledger.md。
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const run = (name, cmd, args, opts = {}) => {
  console.log(`\n=== [gate ${name}] ${cmd} ${args.join(' ')} ===`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: repoRoot, shell: false, ...opts })
  if (r.status !== 0) {
    console.error(`\n[gate] FAIL at ${name} (exit ${r.status})`)
    process.exit(1)
  }
  console.log(`[gate] ${name}: PASS`)
}

run('1 vm-matrix', process.execPath, ['tests/vm_matrix.mjs'])
run('2 vue-build', 'pnpm', ['build'], { shell: process.platform === 'win32' })
run('2 vue-e2e', 'pnpm', ['test:e2e'], { shell: process.platform === 'win32' })
run('3 contract', process.execPath, ['scripts/contract-sync.mjs', '--check'])

console.log('\n[gate] ALL GREEN：vm 矩阵 + vue build/e2e + 契约漂移门 三段全过')
