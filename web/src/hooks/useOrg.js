import { useCallback, useEffect, useState } from 'react';
import { organizationApi } from '../services/organizationApi';

// Loads the org admin's first organization. `org` stays null until one is created.
export default function useOrg() {
  const [state, setState] = useState({ loading: true, error: null, org: null });
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await organizationApi.mine();
      const list = res.data?.organizations ?? [];
      setState({ loading: false, error: null, org: list[0] || null });
    } catch (e) { setState({ loading: false, error: e.message, org: null }); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}