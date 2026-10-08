import Input from '../common/Input';
export default function PhoneInput({ value, onChange, error, label = 'Phone Number' }) {
  return (
    <Input label={label} prefix="+91" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national"
      placeholder="Enter phone number" value={value} error={error}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} />
  );
}
