import url from 'url'
import fg from 'fast-glob'
import Mock from 'mockjs'
import path from 'path'
import chokidar from 'chokidar'
import colors from 'picocolors'
import { build } from 'esbuild';
import { pathToRegexp, match } from 'path-to-regexp'
import { isArray, isFunction, sleep, isRegExp, isAbsPath } from './utils'
import module from 'module'

export let mockData = []

const parseJson = req => {
  return new Promise((resolve) => {
    let body = ''
    let jsonStr = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      try {
        jsonStr = JSON.parse(body)
      } catch (err) {
        jsonStr = ''
      }
      resolve(jsonStr)
      return true
    })
  })
}

const loggerOutput = (title, msg, type = 'info') => {
  const tag = type === 'info' ? colors.cyan(`[vite:mock]`) : colors.red(`[vite:mock-server]`)
  return console.log(
    `${colors.dim(new Date().toLocaleTimeString())} ${tag} ${colors.green(title)} ${colors.dim(
      msg,
    )}`,
  )
}

// get custom config file path and mock dir path
const getPath = (opt = {}) => {
  const { mockPath } = opt
  const cwd = process.cwd()
  const absMockPath = isAbsPath(mockPath) ? mockPath : path.join(cwd, mockPath || '')
  return { absMockPath }
}

// Parse file content
const loadConfigFromBundledFile = (fileName, bundledCode) => {
  const extension = path.extname(fileName);

  // @ts-expect-error
  const extensions = module.Module._extensions;
  let defaultLoader = extensions[extension];
  const isJs = extension === '.js';
  if (isJs) {
    defaultLoader = extensions[extension];
  }

  extensions[extension] = (module, filename) => {
    if (filename === fileName) {
      module._compile(bundledCode, filename);
    } else if (!isJs) {
        extensions[extension](module, filename);
      } else {
        defaultLoader(module, filename);
      }
  };
  let config;
  try {
    if (isJs && require && require.cache) {
      delete require.cache[fileName];
    }
    const raw = require(fileName);
    config = raw.__esModule ? raw.default : raw;
    if (defaultLoader && isJs) {
      extensions[extension] = defaultLoader;
    }
  } catch (error) {
    console.error(error);
  }

  return config;
}

// Inspired by vite
const resolveModule = async p => {
  const result = await build({
    entryPoints: [p],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: 'cjs',
    metafile: true,
    target: 'es2015',
  });
  const { text } = result.outputFiles[0];
  const loadResult = await loadConfigFromBundledFile(p, text)
  return loadResult;
}

// clear cache
const cleanRequireCache = opt => {
  if (!require || !require.cache) {
    return;
  }
  const { absMockPath } = getPath(opt);
  Object.keys(require.cache).forEach((file) => {
    if (file.indexOf(absMockPath) > -1) {
      delete require.cache[file];
    }
  });
}

// load mock files and watch
const getMockConfig = async (opt = {}) => {
  cleanRequireCache(opt)
  const { absMockPath } = getPath(opt)
  const { ignore } = opt

  let ret = []
  const mockFiles = fg
    .sync(`**/*.{mjs,js}`, {
      cwd: absMockPath,
    })
    .filter((item) => {
      if (!ignore) {
        return true
      }
      if (isFunction(ignore)) {
        return ignore(item)
      }
      if (isRegExp(ignore)) {
        return !ignore.test(path.basename(item))
      }
      return true
    })

  try {
    ret = []
    const resolveModulePromiseList = []

    for (let index = 0; index < mockFiles.length; index++) {
      const mockFile = mockFiles[index]
      resolveModulePromiseList.push(resolveModule(path.join(absMockPath, mockFile)))
    }

    const loadAllResult = await Promise.all(resolveModulePromiseList)
    for (const resultModule of loadAllResult) {
      let mod = resultModule
      if (!isArray(mod)) {
        mod = [mod]
      }
      ret = [...ret, ...mod]
    }
  } catch (e) {
    loggerOutput(`mock reload error`, e)
    ret = []
  }

  return ret
}

// create watch mock
function createWatch(opt) {
  const { logger  } = opt
  const { absMockPath } = getPath(opt)

  if (process.env.VITE_DISABLED_WATCH_MOCK === 'true') {
    return
  }
  const watcher = chokidar.watch([absMockPath], {
    ignoreInitial: true
  })

  watcher.on('all', async (event, file) => {
    logger && loggerOutput(`mock file ${event}`, file);
    mockData = await getMockConfig(opt);
  });
}

export const createMockServer = async (opt = {}) => {
  opt = {
    mockPath: 'mock',
    logger: true,
    ...opt,
  }

  if (mockData.length > 0) return
  mockData = await getMockConfig(opt)
  await createWatch(opt)
}

// request match
export const requestMiddleware = async (opt = {}) => {
  const { logger = true } = opt
  const middleware = async (req, res, next) => {
    let queryParams = {}

    if (req.url) {
      queryParams = url.parse(req.url, true)
    }

    const reqUrl = queryParams.pathname

    const matchRequest = mockData.find((item) => {
      if (!reqUrl || !item || !item.url) {
        return false
      }
      if (item.method && item.method.toUpperCase() !== req.method) {
        return false
      }
      return pathToRegexp(item.url).test(reqUrl)
    })

    if (matchRequest) {
      const isGet = req.method && req.method.toUpperCase() === 'GET'
      const { response, rawResponse, timeout, statusCode, url } = matchRequest

      if (timeout) {
        await sleep(timeout)
      }

      const urlMatch = match(url, { decode: decodeURIComponent })

      let query = queryParams.query
      if (reqUrl) {
        if ((isGet && JSON.stringify(query) === '{}') || !isGet) {
          const params = (urlMatch(reqUrl)).params
          if (JSON.stringify(params) !== '{}') {
            query = (urlMatch(reqUrl)).params || {}
          } else {
            query = queryParams.query || {}
          }
        }
      }

      const self = { req, res, parseJson: parseJson.bind(null, req) }
      if (isFunction(rawResponse)) {
        await rawResponse.bind(self)(req, res)
      } else {
        const body = await parseJson(req)
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = statusCode || 200
        const mockResponse = isFunction(response)
          ? response.bind(self)({ url: req.url, body, query, headers: req.headers })
          : response
        res.end(JSON.stringify(Mock.mock(mockResponse)))
      }

      logger && loggerOutput('request invoke', !req.url)
      return
    }
    next()
  }
  return middleware
}




