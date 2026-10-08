import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { HOME_BY_ROLE } from '../../utils/constants';

export default function AuthGuard({ roles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(role)) return <Navigate to={HOME_BY_ROLE[role] || '/'} replace />;
  return <Outlet />;
}
