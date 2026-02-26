/**
 * 将字符串转换为 ArrayBuffer
 */
function str2ab(str: string) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * 将 ArrayBuffer 转换为 Hex 字符串
 */
function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 计算 SHA-256 签名
 * @param {string} message - 待签名的原始字符串
 * @returns {Promise<string>} - 返回 Hex 格式的哈希值
 */
export async function sha256(message: string) {
  // 1. 将消息编码为 Uint8Array
  const msgBuffer = str2ab(message);

  // 2. 计算哈希 (返回 Promise<ArrayBuffer>)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // 3. 转换为 Hex 字符串
  return bufferToHex(hashBuffer);
}