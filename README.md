# baikbingo-vite-plugin-mock-server

[![NPM version](https://img.shields.io/npm/v/@baikbingo/vite-plugin-mock-server.svg?style=flat)](https://npmjs.org/package/@baikbingo/vite-plugin-mock-server)
[![NPM downloads](http://img.shields.io/npm/dm/@baikbingo/vite-plugin-mock-server.svg?style=flat)](https://npmjs.org/package/@baikbingo/vite-plugin-mock-server)

## Install

```bash
$ npm i @baikbingo/vite-plugin-mock-server
```

```use
import { viteMockServe } from '@baikbingo/vite-plugin-mock-server'

export default defineConfig({
  plugins: [
    ...
    viteMockServe({
      mockPath: './src/mocks',
      localEnabled: process.env.npm_lifecycle_event.includes('dev:mock'),
    }),
    ...
  ]
})
```

```hook
import { useMock } from '@baikbingo/vite-plugin-mock-server'

/**
 * 获取钩子
 * 参考文档：http://mockjs.com/examples.html
 */
const mock = useMock()

// 列表
mock.post('/api/page').response(request => {
  const { type } = request.body
  return mock.page(request.body).generate(
    {
      id: '@id',
      name: '@csentence(3, 10)',
      createTime: '@datetime("T")',
      type: type || /[1-2]/,
    },
    98,
  )
})

// 安装
export default mock.setup()
```
## LICENSE

MIT
