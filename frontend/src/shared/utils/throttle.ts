export function throttle<T extends (..._args: any[]) => void>(func: T, wait: number): T {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;

  const throttled = function(this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    lastArgs = args;

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      lastCall = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        func.apply(this, lastArgs!);
      }, remaining);
    }
  } as T;

  return throttled;
} 
