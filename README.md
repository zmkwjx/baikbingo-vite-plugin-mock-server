# baikbingo-vite-plugin-mock-server

[![NPM version](https://img.shields.io/npm/v/baikbingo-vite-plugin-mock-server.svg?style=flat)](https://npmjs.org/package/baikbingo-vite-plugin-mock-server)
[![NPM downloads](http://img.shields.io/npm/dm/baikbingo-vite-plugin-mock-server.svg?style=flat)](https://npmjs.org/package/baikbingo-vite-plugin-mock-server)

## Install

```bash
$ npm i @baikbingo/vite-plugin-mock-server
```

```bash
import viteMockServer from '@baikbingo/vite-plugin-mock-server'

export default defineConfig({
  plugins: [
    ...
    viteMockServer({
      mockPath: './src/mocks',
      localEnabled: process.env.npm_lifecycle_event.includes('dev:mock'),
    }),
    ...
  ]
})
```

## LICENSE

MIT
