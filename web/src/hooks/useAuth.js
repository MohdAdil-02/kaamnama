import { useAuthStore } from '../store/authStore';
export default function useAuth() {
  const { token, user, setSession, setUser, logout } = useAuthStore();
  return { token, user, role: user?.role, isAuthenticated: !!token, setSession, setUser, logout };
}
