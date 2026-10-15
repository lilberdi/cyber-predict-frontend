import { useCallback, useEffect, useRef, useState } from 'react';

export interface Resource<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  updatedAt: number | undefined;
  reload: () => void;
}

/**
 * Загрузка ресурса с отменой запросов и опциональным опросом.
 * Опрос приостанавливается, пока вкладка скрыта. При ошибке опроса прежние данные остаются.
 */
export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>, deps: unknown[], intervalMs?: number): Resource<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number>();
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const lastRun = useRef(0);

  useEffect(() => {
    const ctrl = new AbortController();
    lastRun.current = Date.now();
    loaderRef
      .current(ctrl.signal)
      .then((result) => {
        if (ctrl.signal.aborted) return;
        setData(result);
        setError(undefined);
        setUpdatedAt(Date.now());
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setIsLoading(false);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  useEffect(() => {
    if (!intervalMs) return;
    const timer = setInterval(() => {
      if (!document.hidden) setTick((t) => t + 1);
    }, intervalMs);
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastRun.current >= intervalMs) setTick((t) => t + 1);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { data, error, isLoading, updatedAt, reload };
}

export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export type Theme = 'dark' | 'light';

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'));
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* приватный режим */
      }
      return next;
    });
  }, []);
  return [theme, toggle];
}
