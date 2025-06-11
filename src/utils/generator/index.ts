import { parseTime } from '../ruoyi';

/**
 * 表格时间格式化
 */
export function formatDate(cellValue: string | number | Date): string {
  if (cellValue == null || cellValue === '') return '';

  const date = new Date(cellValue);
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化时间为相对时间
 * @param time 时间戳或日期字符串
 * @param option 格式化选项
 */
export function formatTime(time: string | number, option?: string): string {
  let timestamp: number;

  if (('' + time).length === 10) {
    timestamp = parseInt(time as string) * 1000;
  } else {
    timestamp = +time;
  }

  const d = new Date(timestamp);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;

  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }

  if (option) {
    return parseTime(timestamp, option);
  } else {
    return `${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`;
  }
}

/**
 * 解析URL查询参数
 * @param url URL字符串
 */
export function getQueryObject(url?: string): Record<string, string> {
  const targetUrl = url == null ? window.location.href : url;
  const search = targetUrl.substring(targetUrl.lastIndexOf('?') + 1);
  const obj: Record<string, string> = {};

  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });

  return obj;
}

/**
 * 计算字符串的字节长度
 * @param str 输入字符串
 */
export function byteLength(str: string): number {
  let s = str.length;

  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) i--;
  }

  return s;
}

/**
 * 清理数组中的空值
 * @param actual 原始数组
 */
export function cleanArray<T>(actual: T[]): T[] {
  return actual.filter((item) => item);
}

/**
 * 对象转URL查询字符串
 * @param json 参数对象
 */
export function param(json: Record<string, any>): string {
  if (!json) return '';

  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return '';
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    })
  ).join('&');
}

/**
 * URL查询字符串转对象
 * @param url URL字符串
 */
export function param2Obj(url: string): Record<string, string> {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ');
  if (!search) return {};

  const obj: Record<string, string> = {};
  const searchArr = search.split('&');

  searchArr.forEach((v) => {
    const index = v.indexOf('=');
    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });

  return obj;
}

/**
 * HTML转纯文本
 * @param val HTML字符串
 */
export function html2Text(val: string): string {
  const div = document.createElement('div');
  div.innerHTML = val;
  return div.textContent || div.innerText;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param source 源对象
 */
export function objectMerge<T, U>(target: T, source: U): T & U {
  if (typeof target !== 'object') {
    target = {} as T;
  }

  if (Array.isArray(source)) {
    return source.slice() as any;
  }

  Object.keys(source).forEach((property) => {
    const sourceProperty = (source as any)[property];

    if (typeof sourceProperty === 'object') {
      (target as any)[property] = objectMerge((target as any)[property], sourceProperty);
    } else {
      (target as any)[property] = sourceProperty;
    }
  });

  return target as T & U;
}

/**
 * 切换元素的类名
 * @param element HTML元素
 * @param className 类名
 */
export function toggleClass(element: HTMLElement, className: string): void {
  if (!element || !className) return;

  let classString = element.className;
  const nameIndex = classString.indexOf(className);

  if (nameIndex === -1) {
    classString += ' ' + className;
  } else {
    classString = classString.substring(0, nameIndex) + classString.substring(nameIndex + className.length);
  }

  element.className = classString;
}

/**
 * 获取时间范围
 * @param type 时间类型 ('start' 或 'end')
 */
export function getTime(type: 'start' | 'end'): number {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90;
  } else {
    return new Date(new Date().toDateString()).getTime();
  }
}

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 等待时间(毫秒)
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => ReturnType<T> | void {
  let timeout: ReturnType<typeof setTimeout> | null;
  let args: any;
  let context: any;
  let timestamp: number;
  let result: ReturnType<T> | void;

  const later = function () {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (this: any, ...innerArgs: Parameters<T>): ReturnType<T> | void {
    context = this;
    args = innerArgs;
    timestamp = Date.now();

    const callNow = immediate && !timeout;

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * 深拷贝
 * @param source 要拷贝的对象
 */
export function deepClone<T>(source: T): T {
  if (!source || typeof source !== 'object') {
    return source;
  }

  const targetObj: any = Array.isArray(source) ? [] : {};

  Object.keys(source).forEach((key) => {
    if ((source as any)[key] && typeof (source as any)[key] === 'object') {
      targetObj[key] = deepClone((source as any)[key]);
    } else {
      targetObj[key] = (source as any)[key];
    }
  });

  return targetObj as T;
}

/**
 * 数组去重
 * @param arr 原始数组
 */
export function uniqueArr<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * 生成唯一字符串
 */
export function createUniqueString(): string {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor((1 + Math.random()) * 65536).toString();
  return (+(randomNum + timestamp)).toString(32);
}

/**
 * 检查元素是否有指定类名
 * @param ele HTML元素
 * @param cls 类名
 */
export function hasClass(ele: HTMLElement, cls: string): boolean {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

/**
 * 为元素添加类名
 * @param ele HTML元素
 * @param cls 类名
 */
export function addClass(ele: HTMLElement, cls: string): void {
  if (!hasClass(ele, cls)) {
    ele.className += ' ' + cls;
  }
}

/**
 * 移除元素的类名
 * @param ele HTML元素
 * @param cls 类名
 */
export function removeClass(ele: HTMLElement, cls: string): void {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    ele.className = ele.className.replace(reg, ' ');
  }
}

/**
 * 创建映射函数
 * @param str 逗号分隔的字符串
 * @param expectsLowerCase 是否小写
 */
export function makeMap(str: string, expectsLowerCase?: boolean): (val: string) => boolean {
  const map: Record<string, boolean> = Object.create(null);
  const list = str.split(',');

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val];
}

export const exportDefault = 'export default ';

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
};

/**
 * 首字母大写
 * @param str 输入字符串
 */
export function titleCase(str: string): string {
  return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

/**
 * 下划线转驼峰
 * @param str 输入字符串
 */
export function camelCase(str: string): string {
  return str.replace(/_[a-z]/g, (str1) => str1.substr(-1).toUpperCase());
}

/**
 * 检查字符串是否为数字
 * @param str 输入字符串
 */
export function isNumberStr(str: string): boolean {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str);
}
