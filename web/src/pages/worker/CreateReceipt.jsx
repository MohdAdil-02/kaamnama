import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import FileUpload from '../../components/common/FileUpload';
import PhoneInput from '../../components/auth/PhoneInput';
import Button from '../../components/common/Button';
import PrivacyNote from '../../components/common/PrivacyNote';
import useVertical from '../../hooks/useVertical';
import api from '../../services/api';
import { receiptApi } from '../../services/receiptApi';
import { validate, required, isPhone } from '../../utils/validators';
import { toast } from '../../store/notificationStore';

const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

// Backend errors arrive as [{ field, message }]; the form wants { field: message }
const fieldErrors = (list) =>
  Array.isArray(list) ? Object.fromEntries(list.map((e) => [e.field, e.message])) : {};

export default function CreateReceipt() {
  const navigate = useNavigate();
  const v = useVertical();
  const [cats, setCats] = useState([]);
  const [f, setF] = useState({
    customerPhone: '', customerName: '', category: '', title: '',
    description: '', amount: '', workDate: isoDay(0), address: '',
  });
  const [before, setBefore] = useState([]);
  const [after, setAfter] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    api.get('/directory/categories').then((res) => setCats(res.data.categories)).catch((e) => toast.error(e.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(f, {
      customerPhone: (x) => (isPhone(x) ? '' : 'Enter a valid 10-digit mobile number'),
      category: required,
      title: (x) => (x.trim().length >= 3 ? '' : 'Describe the job (at least 3 characters)'),
      amount: (x) => (Number(x) >= 0 && x !== '' ? '' : 'Enter the amount'),
      workDate: required,
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      customerPhone: f.customerPhone,
      category: f.category,
      title: f.title.trim(),
      amount: Number(f.amount),
      workDate: f.workDate,
    };
    if (f.customerName.trim()) payload.customerName = f.customerName.trim();
    if (f.description.trim()) payload.description = f.description.trim();
    if (f.address.trim()) payload.address = f.address.trim();

    setLoading(true);
    try {
      const res = await receiptApi.create(payload);
      const { receipt, verification } = res.data;

      // Photos are a second step. A failed upload must not lose the receipt.
      const files = [...before, ...after];
      if (files.length) {
        try { await receiptApi.uploadPhotos(receipt._id, files); }
        catch (err) { toast.error(`Receipt saved, but photos were not uploaded: ${err.message}`); }
      }

      toast.success('Receipt created. Now send it to your customer.');
      // The raw token exists only in this response, so pass it along for the share screen
      navigate(`/worker/receipts/${receipt._id}`, { state: { share: true, receipt, verification } });
    } catch (err) {
      setErrors({ form: err.message, ...fieldErrors(err.errors) });
    } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader title={`Log a ${v.noun}`} subtitle="It counts only after your customer confirms it with an OTP." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3" noValidate>
        <div className="card space-y-5 lg:col-span-2">
          <h2>Job details</h2>
          <Select label="Category" placeholder="Select a category" value={f.category} onChange={set('category')}
            error={errors.category} options={cats.map((c) => ({ value: c._id, label: c.name }))} />
          <Input label={v.workLabel} placeholder={v.workPlaceholder} value={f.title} onChange={set('title')} error={errors.title} />
          <Textarea label="Description (optional)" value={f.description} onChange={set('description')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Work date" type="date" min={isoDay(-90)} max={isoDay(0)} value={f.workDate}
              onChange={set('workDate')} error={errors.workDate} />
            <Input label={v.amountLabel} prefix="₹" type="number" min="0" value={f.amount}
              onChange={set('amount')} error={errors.amount} />
          </div>
          <Input label="Address (optional)" value={f.address} onChange={set('address')} error={errors.address} />

          <h2 className="pt-2">Customer</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <PhoneInput label={v.customerLabel} value={f.customerPhone}
              onChange={(x) => setF({ ...f, customerPhone: x })} error={errors.customerPhone} />
            <Input label="Customer name (optional)" value={f.customerName} onChange={set('customerName')} />
          </div>
          <PrivacyNote>The customer’s phone number is used only to send the confirmation code.</PrivacyNote>

          <h2 className="pt-2">Photos (optional)</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload label={v.photoBefore} files={before} onChange={setBefore} max={1} />
            <FileUpload label={v.photoAfter} files={after} onChange={setAfter} max={1} />
          </div>

          {errors.form && <p className="text-sm text-danger" role="alert">{errors.form}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create receipt</Button>
          </div>
        </div>

        <aside className="card h-fit space-y-4">
          <h3>What happens next</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
            <li>You show the QR or send the link to your customer.</li>
            <li>The customer confirms with an OTP sent to their phone.</li>
            <li>Your receipt becomes verified and your trust score updates.</li>
          </ol>
          <p className="text-xs text-ink-muted">Pending receipts expire after 7 days.</p>
        </aside>
      </form>
    </>
  );
}