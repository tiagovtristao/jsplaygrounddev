export default function throttle<T extends (...args: any) => any>(
  fn: T,
  interval: number = 1000 / 60,
): [(...args: Parameters<T>) => ReturnType<T> | void, () => void] {
  let executed = false;

  const intervalId = setInterval(() => {
    executed = false;
  }, interval);

  return [
    (...args: Parameters<T>) => {
      if (!executed) {
        executed = true;
        return fn.apply(fn, args);
      }
    },
    () => {
      clearInterval(intervalId);
    },
  ];
}
