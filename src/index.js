import { createMockServer, requestMiddleware } from './createMockServer'

/**
 * 环境检测
 *
 * name: @baikbingo/vite-plugin-mock-server
 * auther: wei.zhouu
 * date: 2023年8月11日
 *
 */
;(async () => {
  try {
    await import('mockjs')
  } catch (e) {
    throw new Error('@baikbingo/vite-plugin-mock-server requires mockjs to be present in the dependency tree.')
  }
})()

/**
 * 安装插件
 */
export default opt => {
  let isDev = false

  return {
    name: '@baikbingo/vite-plugin-mock-server',
    configResolved: config => {
      isDev = config.command === 'serve'
      isDev && createMockServer(opt)
    },
    configureServer: async ({ middlewares }) => {
      const { localEnabled = isDev } = opt
      if (!localEnabled) {
        return
      }
      const middleware = await requestMiddleware(opt)
      middlewares.use(middleware)
    },
  }
}
