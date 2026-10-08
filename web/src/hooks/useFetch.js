import { useCallback, useEffect, useRef, useState } from 'react';

// Generic loader: const { data, loading, error, reload } = useFetch(() => api.call(), [deps])
export default function useFetch(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fnRef.current();
      if (alive.current) setState({ data: res?.data ?? res, loading: false, error: null });
    } catch (e) {
      if (alive.current) setState({ data: null, loading: false, error: e.message });
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (immediate) reload(); }, deps);
  return { ...state, reload };
}
