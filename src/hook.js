import Mock from 'mockjs'

// 获取配置
const getOpt = (opt = {}) => {
  return {
    url: '',
    methon: 'post',
    ...opt,
  }
}

// 返回数据格式化
const formatResponse = {
  success: data => ({ code: 200, message: 'success', data }),
  netwarn: data => ({ code: 500, message: 'server error', data }),
}

// 模拟数据
const useMockData = anyData => {
  return Mock.mock(anyData)
}

// 模拟随机数
const useMockRandom = (keyname = 'id') => {
  return Mock.Random[keyname]()
}

// 模拟时间
const useMockDatetime = cmd => {
  return Mock.Random.datetime(cmd)
}

// 模拟数组
const useMockArray = anyData => {
  return {
    need: (n = 10) => {
      const nullArray = new Array(n).fill(null)
      return nullArray.map(() => Mock.mock(anyData))
    },
  }
}

// 模拟分页
const useMockPage = (params = {}) => {
  const { pageNo = 1, pageSize = 10 } = params
  const pageNum = pageNo < 1 ? 1 : pageNo
  const startIndex = (pageNum - 1) * pageSize
  const generate = (anyData, total = 0) => {
    const endTotal = total - startIndex
    const n = endTotal > pageSize ? pageSize : endTotal
    return {
      list: useMockArray(anyData).need(n),
      total,
    }
  }
  return { generate }
}

// 延迟
const useTimer = (t = 0) => {
  let l = new Date().getTime()
  let r = l
  while (r - l < t) {
    r = new Date().getTime()
  }
}

/**
 * 模拟数据
 * https://github.com/nuysoft/Mock/wiki
 */
export const useMock = () => {
  // 注册
  const mockApis = []

  // 注册
  const api = opt => {
    const response = callback => {
      mockApis.push({
        ...getOpt(opt),
        response: request => {
          try {
            const data = callback(request)
            return formatResponse.success(data)
          } catch (e) {
            return formatResponse.netwarn(e)
          }
        },
      })
    }
    return {
      response,
    }
  }

  // get
  const get = (url, opt = {}) => {
    const methon = 'get'
    const getApi = api({ url, methon, ...opt })
    return getApi
  }

  // get
  const post = (url, opt = {}) => {
    const methon = 'post'
    const postApi = api({ url, methon, ...opt })
    return postApi
  }

  // 安装
  const setup = () => mockApis

  // 导出
  return {
    api,
    get,
    post,
    setup,
    timer: useTimer,
    data: useMockData,
    datetime: useMockDatetime,
    random: useMockRandom,
    array: useMockArray,
    page: useMockPage,
  }
}
