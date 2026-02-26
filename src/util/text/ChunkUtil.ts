/**
 * 对 memo 内容进行智能分块
 * @param content 用户输入的 memo 文本
 * @param maxChunkLength 最大块长度（字符数），默认 500
 * @param minContentLength 不分块的阈值（字符数），默认 200
 * @returns 分块后的字符串数组
 */
export function chunkMemo(
  content: string,
  maxChunkLength: number = 500,
  minContentLength: number = 200
): string[] {
  // 去除首尾空白
  const trimmed = content.trim();

  // 短内容直接返回
  if (trimmed.length <= minContentLength) {
    return trimmed ? [trimmed] : [];
  }

  // 按双换行符分割段落（优先）
  let paragraphs = splitByDoubleNewline(trimmed);

  // 如果没有双换行，尝试按单换行分（但合并连续非空行）
  if (paragraphs.length === 1 && trimmed.includes('\n')) {
    paragraphs = splitBySingleNewlineSmart(trimmed);
  }

  // 如果仍只有一段且太长，则按最大长度软切分（尽量在句号/问号/感叹号后切）
  if (paragraphs.length === 1 && paragraphs[0]!.length > maxChunkLength) {
    paragraphs = softSplitByLength(paragraphs[0]!, maxChunkLength);
  }

  // 过滤空段落
  const nonEmpty = paragraphs.filter(p => p.trim() !== '');

  // 如果结果为空，回退到原始内容（安全兜底）
  return nonEmpty.length > 0 ? nonEmpty : [trimmed];
}

// 辅助函数：按 \n\n 分割
function splitByDoubleNewline(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p !== '');
}

// 辅助函数：智能按单换行分（保留换行符）
function splitBySingleNewlineSmart(text: string): string[] {
  const lines = text.split('\n');
  const paragraphs: string[] = [];
  let currentPara = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      if (currentPara !== '') {
        paragraphs.push(currentPara);
        currentPara = '';
      }
    } else {
      currentPara += (currentPara ? '\n' : '') + line;
    }
  }
  if (currentPara !== '') {
    paragraphs.push(currentPara);
  }

  return paragraphs;
}

// 辅助函数：在不超过 maxLen 的前提下，尽量在句子边界切分
function softSplitByLength(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);

    // 如果还没到末尾，尝试向后找最近的句子结束符
    if (end < text.length) {
      const sub = text.slice(start, end);
      // 从后往前找 . ! ? ，但避开小数点（简单处理）
      const lastSentenceEnd = Math.max(
        sub.lastIndexOf('.'),
        sub.lastIndexOf('!'),
        sub.lastIndexOf('?')
      );

      if (lastSentenceEnd > 10) { // 至少有10字符才切
        end = start + lastSentenceEnd + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks;
}