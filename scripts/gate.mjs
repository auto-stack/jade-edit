#!/usr/bin/env node
// gate.mjs — 双轨一致性门（PLAN-081 T-07 立；PLAN-001 T-04 换基改三段）。
// 顺序执行，任一失败即 exit 1：
//
//   ① vm 矩阵    node tests/vm_matrix.mjs（双臂 merged+split 六检查 + 基线 v1 零漂移）
//   ② vue 面     pnpm build（regen+补丁+vue-tsc+vite）+ pnpm test:e2e
//                （playwright 六检查同一检查单）
//   ③（退役）契约漂移门——PLAN-001 T-00 ②：api.at 转自有源后契约与实现
//                同文件同 commit，结构性无漂移可守（gate 三段化）
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

console.log('\n[gate] ALL GREEN：vm 双臂矩阵 + vue build/e2e 全过（漂移门已随换基退役）')
