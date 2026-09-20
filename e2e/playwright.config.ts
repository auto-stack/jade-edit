// playwright.config.ts — PLAN-081 T-06：vue 轨六检查（与 vm 矩阵同一
// 检查单，AC-04）。双 webServer：① run-back 隔离 fixture 后端（axum，
// 8211）② vite dev（gen/front/vue，4181；/api 经代理 → AUTO_HTTP_PORT）。
import { defineConfig } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vueDir = path.join(repoRoot, 'gen', 'front', 'vue')
const BACK_PORT = 8211
const FRONT_PORT = 4181

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${FRONT_PORT}` },
  webServer: [
    {
      command: `node "${path.join(repoRoot, 'scripts', 'run-back.mjs')}" --port ${BACK_PORT}`,
      url: `http://127.0.0.1:${BACK_PORT}/api/health`,
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
