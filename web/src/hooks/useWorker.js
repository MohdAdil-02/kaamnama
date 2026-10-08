import useFetch from './useFetch';
import { workerApi } from '../services/workerApi';
export default function useWorker() {
  return useFetch(() => workerApi.getMe(), []);
}
