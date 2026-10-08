import { useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  isError: boolean;
}

export function useAsyncResource<T>(loader: () => Promise<T>, initialData: T): AsyncState<T> {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    loader()
      .then((result) => {
        if (isMounted) {
          setData(result);
          setIsError(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, isError };
}
