// playwright.config.ts — vue 轨六检查（与 vm 矩阵同一检查单）。双
// webServer（PLAN-001 T-04 换基后配方）：① serve-back.mjs（AutoVM HTTP
// 后端独立 serve，`auto run --server vm`，8211 + 隔离 fixture）② vite dev
//（gen/front/vue，4181；/api 经代理 → AUTO_HTTP_PORT）。
import { defineConfig } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vueDir = path.join(repoRoot, 'gen', 'front', 'vue')
const BACK_PORT = 8211
// 4443 = F-R8-1 同款环境适配（2026-09-24 实勘：原 4181 落入 WinNAT 排除
// 区段 4094-4193 新窗——EACCES listen 拒；排除区随重启漂移，ledger v16 记账）
const FRONT_PORT = 4443

export default defineConfig({
  testDir: '.',
  // PLAN-002 T-01 扩单（六检查 → 九检查同单）：HTTP 往返逐拍累加
  // （D-03 切换面 0.5-1.2s/拍），单 test 预算 30s→90s。
  timeout: 90_000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${FRONT_PORT}` },
  webServer: [
    {
      command: `node "${path.join(repoRoot, 'scripts', 'serve-back.mjs')}" --port ${BACK_PORT}`,
      url: `http://127.0.0.1:${BACK_PORT}/api/ws_root`,
      reuseExistingServer: false,
      timeout: 90_000,
    },
    {
      // --host 127.0.0.1：vite 默认绑 localhost(::1)，127.0.0.1 探活不通
      //（jade front 同款）；--strictPort：端口冲突显式炸而非静默换端口。
      command: 'node node_modules/vite/bin/vite.js --strictPort --host 127.0.0.1',
      cwd: vueDir,
      url: `http://127.0.0.1:${FRONT_PORT}`,
      reuseExistingServer: false,
      timeout: 90_000,
      env: {
        AUTO_HTTP_PORT: String(BACK_PORT),
        AUTO_FRONT_PORT: String(FRONT_PORT),
        TAURI_ENV: '1', // vite config：不自动开浏览器
      },
    },
  ],
})
