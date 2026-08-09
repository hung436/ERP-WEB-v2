import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, dependencyKey = '') {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(async () => {
    void dependencyKey;
    setLoading(true);
    setError(null);
    try { setData(await loaderRef.current()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Đã xảy ra lỗi.'); }
    finally { setLoading(false); }
  }, [dependencyKey]);

  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, reload: load };
}
