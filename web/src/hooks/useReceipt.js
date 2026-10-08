import useFetch from './useFetch';
import { receiptApi } from '../services/receiptApi';
export default function useReceipt(id) {
  return useFetch(() => receiptApi.get(id), [id]);
}
