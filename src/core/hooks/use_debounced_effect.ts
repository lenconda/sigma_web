import { useCallback, useEffect } from 'react';

export const useDebouncedEffect = (effect: (...args: any[]) => any, delay: number, deps: Array<any>) => {
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
};
