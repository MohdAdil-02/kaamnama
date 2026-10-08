import { Search } from 'lucide-react';
import Input from '../common/Input';
export default function SearchBar({ value, onChange, placeholder = 'Search by name or skill' }) {
  return <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} prefix={<Search size={16} />} aria-label="Search" />;
}
