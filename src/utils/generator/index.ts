/* eslint-disable */
import { parseTime } from '../ruoyi'

/**
 * 表格时间格式化
 */
export function formatDate(cellValue: string | number | Date | null): string {
  if (cellValue == null || cellValue === '') return ''
  const date = new Date(cellValue)
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time: number | string, option?: string): string {
  if ((time + '').length === 10) {
    time = parseInt(time as string) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000

  if (diff < 30) return '刚刚'
  else if (diff < 3600) return Math.ceil(diff / 60) + '分钟前'
  else if (diff < 3600 * 24) return Math.ceil(diff / 3600) + '小时前'
  else if (diff < 3600 * 24 * 2) return '1天前'

  if (option) {
    return parseTime(time, option)
  } else {
    return (
      `${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url?: string): Record<string, string> {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj: Record<string, string> = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (_rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return ''
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str: string): number {
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray<T>(actual: (T | null | undefined | false)[]): T[] {
  return actual.filter(Boolean) as T[]
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json: Record<string, any>): string {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url: string): Record<string, string> {
  const search = decodeURIComponent(url.split('?')[1] || '').replace(/\+/g, ' ')
  const obj: Record<string, string> = {}
  if (!search) return obj
  search.split('&').forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val: string): string {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText || ''
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target: any, source: any): any {
  if (typeof target !== 'object') target = {}
  if (Array.isArray(source)) return source.slice()
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element: HTMLElement, className: string): void {
  if (!element || !className) return
  const classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    element.className += ' ' + className
  } else {
    element.className = classString.substring(0, nameIndex) + classString.substring(nameIndex + className.length)
  }
}

/**
 * @param {string} type
 * @returns {Date | number}
 */
export function getTime(type: 'start' | 'end'): number | Date {
  if (type === 'start') {
    return Date.now() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number, immediate: boolean): (...args: Parameters<T>) => ReturnType<T> {
  let timeout: ReturnType<typeof setTimeout> | null
  let args: any
  let context: any
  let timestamp: number
  let result: any

  const later = () => {
    const last = Date.now() - timestamp
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(this: any, ..._args: any[]) {
    context = this
    args = _args
    timestamp = Date.now()
    const callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }
    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone<T>(source: T): T {
  if (!source || typeof source !== 'object') {
    throw new Error('Invalid arguments: deepClone expects a non-null object')
  }
  const targetObj: any = Array.isArray(source) ? [] : {}
  Object.keys(source).forEach(key => {
    const val = (source as any)[key]
    targetObj[key] = (val && typeof val === 'object') ? deepClone(val) : val
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString(): string {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536 + '') + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(elm: HTMLElement, cls: string): boolean {
  return !!elm.className.match(new RegExp('(^|\\s)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(elm: HTMLElement, cls: string): void {
  if (!hasClass(elm, cls)) elm.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(elm: HTMLElement, cls: string): void {
  if (hasClass(elm, cls)) {
    const reg = new RegExp('(^|\\s)' + cls + '(\\s|$)')
    elm.className = elm.className.replace(reg, ' ')
  }
}

export function makeMap(str: string, expectsLowerCase?: boolean): (val: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

export const exportDefault = 'export default '

export const beautifierConf = {
  html: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'separate',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  },
  js: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: true,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  }
}

// 首字母大小
export function titleCase(str: string): string {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str: string): string {
  return str.replace(/_[a-z]/g, str1 => str1.charAt(1).toUpperCase())
}

export function isNumberStr(str: string): boolean {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}
