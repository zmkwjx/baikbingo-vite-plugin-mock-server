# @baikbingo/vite-plugin-mock-server

[![NPM version](https://img.shields.io/npm/v/@baikbingo/vite-plugin-mock-server.svg?style=flat)](https://npmjs.org/package/@baikbingo/vite-plugin-mock-server)[![NPM downloads](http://img.shields.io/npm/dm/@baikbingo/vite-plugin-mock-server.svg?style=flat)](https://npmjs.org/package/@baikbingo/vite-plugin-mock-server)

提供本地模拟服务。

vite 的数据模拟插件，是基于 vite.js 开发的。 并同时支持本地环境和生产环境。mockjs 在生产环境中使用。

### 安装 (yarn or npm）

**node version:** >=12.0.0

**vite version:** >=2.0.0

```
yarn add mockjs
# or
npm i mockjs -S
```

and

```
yarn add @baikbingo/vite-plugin-mock-server -D
# or
npm i @baikbingo/vite-plugin-mock-server -D
```

## 使用

**开发环境**

您可以在 Google Chrome 控制台中查看网络请求记录

- vite.config.ts 配置

```js
import { UserConfigExport, ConfigEnv } from 'vite'

import { viteMockServe } from '@baikbingo/vite-plugin-mock-server'
import vue from '@vitejs/plugin-vue'

export default ({ command }: ConfigEnv): UserConfigExport => {
  return {
    plugins: [
      vue(),
      viteMockServe({
      	mockPath: './src/mocks',
        localEnabled: command === 'serve',
      })
    ]
  }
}
```

- viteMockServe 配置

```
{
    mockPath?: string;
    ignore?: RegExp | ((fileName: string) => boolean);
    localEnabled?: boolean;
    logger?:boolean;
}
```

#### mockPath

**type:** string

**default:** `mock`

设置模拟.js 文件的存储文件夹

#### ignore

**type:** `RegExp | ((fileName: string) => boolean)`;

**default:** `undefined`

自动读取模拟 `.js` 文件时，请忽略指定格式的文件

#### localEnabled

**type:** `boolean`

**default:** `command === 'serve'`

设置是否启用本地` xxx.js` 文件，不要在生产环境中打开它.设置为 `false` 将禁用 mock 功能

#### logger

**type:** `boolean`

**default:** `true`

是否在控制台显示请求日志

## Mock file example

参考文档：http://mockjs.com/examples.html

```js
/src/mocks
// test.js

import { useMock } from '@baikbingo/vite-plugin-mock-server'
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

// 注册
export default mock.setup()
```

## useMock API

```js
import { useMock } from '@baikbingo/vite-plugin-mock-server'
const mock = useMock()

// 注册
export default mock.setup()
```

| 方法          | 说明          | 入参                                                       |
| ------------- | ------------- | ---------------------------------------------------------- |
| mock.api      | 自定义api模拟 | 参考 Opt                                                   |
| mock.get      | 模拟GET请求   | void(url, opt = {})                                        |
| mock.post     | 模拟POST请求  | void(url, opt = {})                                        |
| mock.timer    | 延迟请求      | void(t = 0)                                                |
| mock.data     | 模拟数据      | 参考 mockjs.mock                                           |
| mock.datetime | 模拟时间      | void(cmd), 参考 mockjs.Random.datetime(cmd)                |
| mock.random   | 模拟随机数    | void(keyname), 参考 mockjs.Random\[keyname\]()             |
| array         | 模拟数组      | void(data: any): { need(n = 10): any }                     |
| page          | 模拟分页      | void(params = {}): { generate(data: any, total = 0): any } |

### Opt

```
{
  // 请求地址
  url: string;
  // 请求方式
  method?: MethodType;
  // 设置超时时间
  timeout?: number;
  // 状态吗
  statusCode?:number;
  // 响应数据（JSON）
  response?: ((opt: { [key: string]: string; body: Record<string,any>; query:  Record<string,any>, headers: Record<string, any>; }) => any) | any;
  // 响应（非JSON）
  rawResponse?: (req: IncomingMessage, res: ServerResponse) => void;
}
```

## 注意事项

- 无法在 mock.js 文件中使用 node 模块，否则生产环境将失败
- 模拟数据如果用于生产环境，仅适用于某些测试环境。 不要在正式环境中打开它，以避免不必要的错误。 同时，在生产环境中，它可能会影响正常的 Ajax 请求，例如文件上传/下载失败等。