export function isJSON(str: string) {
  return /^[\],:{}\s]*$/.test(
    str
      .replace(/\\["\\/bfnrtu]/g, "@")
      .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, "]")
      .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
  );
}

/**
 * 是否是空字符串
 * @param str
 */
export function isEmptyString(str?: any): boolean {
  if (!str) {
    return true;
  }
  if (typeof str !== "string") {
    return true;
  }
  return str.trim() === "";
}

export function isNotEmptyString(str?: string) {
  return !isEmptyString(str);
}

export function isEmptyArray(arr?: Array<any>): boolean {
  if (!arr) {
    return true;
  }
  if (!Array.isArray(arr)) {
    return true;
  }
  return arr.length === 0;
}

export function isNotEmptyArray(arr?: Array<any>): boolean {
  return !isEmptyArray(arr);
}

/**
 * If value is null or undefined, return default value.
 * @param value 检测值
 * @param defaultValue 默认值
 */
export function defaultIfNull<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || typeof value === "undefined" ? defaultValue : value;
}

/**
 * If object is null or undefined, return default value.
 * @param value
 * @param attr
 * @param defaultValue
 */
export function ifObjectIsNull<T extends Record<string, any>, A extends T[K], K extends keyof T>(
  value: T | null | undefined,
  attr: K,
  defaultValue: A
): A {
  if (value) {
    return value[attr] ?? defaultValue;
  } else {
    return defaultValue;
  }
}
