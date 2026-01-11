export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  let timeoutId!: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, ms);
  });

  try {
    return (await Promise.race([promise, timeoutPromise])) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
