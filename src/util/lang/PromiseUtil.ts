export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function promiseRetry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number; // 最多重试次数（含第一次）
    delay?: number; // 第一次重试间隔（ms）
    backoff?: number; // 退避系数，默认 2
    onRetry?: (err: Error, left: number) => void;
  } = {}
): Promise<T> {
  const { attempts = 3, delay = 100, backoff = 2, onRetry = () => {} } = options;

  let left = attempts;
  let currentDelay = delay;

  while (left > 0) {
    try {
      return await fn();
    } catch (err) {
      left--;
      if (left === 0) throw err; // 最后一次也失败就抛出去
      onRetry(err as Error, left);
      await sleep(currentDelay);
      currentDelay *= backoff;
    }
  }
  throw new Error("unreachable");
}
