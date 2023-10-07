const toString = Object.prototype.toString

export function is(val, type) {
  return toString.call(val) === `[object ${type}]`
}

export function isFunction(val) {
  return is(val, 'Function') || is(val, 'AsyncFunction')
}

export function isArray(val) {
  return val && Array.isArray(val)
}

export function isRegExp(val) {
  return is(val, 'RegExp')
}

export function isAbsPath(path) {
  if (!path) {
    return false
  }
  // Windows 路径格式：C:\ 或 \\ 开头，或已含盘符（D:\path\to\file）
  if (/^([a-zA-Z]:\\|\\\\|(?:\/|\uFF0F){2,})/.test(path)) {
    return true
  }
  // Unix/Linux 路径格式：/ 开头
  return /^\/[^/]/.test(path)
}

export function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('')
    }, time)
  })
}
