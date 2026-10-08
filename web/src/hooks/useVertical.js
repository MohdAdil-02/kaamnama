import useAuth from './useAuth';
import { getVertical } from '../utils/verticals';
export default function useVertical(override) {
  const { user } = useAuth();
  return getVertical(override || user?.vertical || user?.category);
}
