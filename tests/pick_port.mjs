// pick_port.mjs — probe 族共享端口避让助手（PLAN-016 G4 环境卫生件）。
//
// WinNAT 排除区段随重启漂移（F-R8-1：8251-8950；F-R13-1：4094-4193 等
// 三次逼迁 probe 固定端口实录——8254→8223/8252→8222/probe_tags
// 8254→8221），固定常量 = 环境复发痛。本件 = 系统修：候选段内逐端口
// try-bind（net.createServer 真实 listen 探测——EACCES/EADDRINUSE 双拒
// 均跳过），返回首个可绑端口；env 强制通道（JADE_PROBE_PORT*）保留
// 复现/指定能力（F-R13-1 适配案手工重跑口径）。
//
// 用法（probe 脚本内）：
//   const SPLIT_PORT = await pickPort()                 // 默认段 8221..8260
//   const SPLIT_PORT = await pickPort({ env: 'JADE_PROBE_PORT_TRASH' })
//
// 段选择口径：8221..8260 = 探针族在册口的超集（8221..8232/8241/8253 全
// 落段内）——逐 probe 顺序执行（workers=1/串行臂），首空闲即所得；与
// serve-back 默认 8211 / e2e 8211/4443 无交叠。

import net from 'node:net'

const canBind = (host, port) =>
  new Promise((resolve) => {
    const srv = net.createServer()
    srv.once('error', () => resolve(false))
    srv.once('listening', () => srv.close(() => resolve(true)))
    srv.listen(port, host)
  })

export async function pickPort({ host = '127.0.0.1', start = 8221, end = 8260, env = 'JADE_PROBE_PORT' } = {}) {
  const forced = Number(process.env[env] ?? 0)
  if (Number.isInteger(forced) && forced > 0) return forced
  for (let p = start; p <= end; p++) {
    if (await canBind(host, p)) return p
  }
  throw new Error(`[pick_port] 候选段 ${start}..${end} 无可绑端口（host ${host}）——WinNAT 排除区段整段漂移？扩段或 env ${env} 强制指定`)
}
