/**
 * 美化数据单位
 *
 * @param {number} value 需要美化的值
 */
export function prettyDataUnit(value: number) {
  const gb = 1024 * 1024 * 1024.0;
  if (value > gb) {
    const temp = value / gb;
    return temp.toFixed(2) + "GB";
  }
  const mb = 1024 * 1024.0;
  if (value > mb) {
    const temp = value / mb;
    return temp.toFixed(2) + "MB";
  }
  const b = 1024.0;
  if (value > b) {
    const temp = value / b;
    return temp.toFixed(2) + "KB";
  }
  return value + "B";
}
