import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import Toaster from './components/common/Toaster';
import ErrorBoundary from './components/common/ErrorBoundary';
import useAuth from './hooks/useAuth';
import { authApi } from './services/authApi';

// Refreshes the logged-in user from the server on load (role, vertical, name may have changed)
function SessionBootstrap() {
  const { token, setUser } = useAuth();
  useEffect(() => {
    if (!token) return;
    authApi.me().then((r) => { const u = r.data?.user || r.data; if (u?.role) setUser(u); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SessionBootstrap />
      <AppRoutes />
      <Toaster />
    </ErrorBoundary>
  );
}
