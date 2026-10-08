import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FileUpload from '../../components/common/FileUpload';
import PhoneInput from '../../components/auth/PhoneInput';
import Button from '../../components/common/Button';
import TierBadge from '../../components/receipt/TierBadge';
import PrivacyNote from '../../components/common/PrivacyNote';
import useFetch from '../../hooks/useFetch';
import useVertical from '../../hooks/useVertical';
import { workerApi } from '../../services/workerApi';
import { receiptApi } from '../../services/receiptApi';
import { validate, required, isPhone, isPincode } from '../../utils/validators';
import { FEATURES } from '../../utils/constants';
import { toast } from '../../store/notificationStore';

export default function CreateReceipt() {
  const navigate = useNavigate();
  const v = useVertical();
  const orgs = useFetch(() => (FEATURES.organizations ? workerApi.memberships() : Promise.resolve({ data: [] })), []);
  const activeOrgs = (orgs.data?.items ?? orgs.data ?? []).filter((m) => !m.endDate);
  const [f, setF] = useState({ customerPhone: '', customerName: '', workType: '', pincode: '', amount: '', paymentReference: '', durationType: 'one-time', orgId: '' });
  const [before, setBefore] = useState([]);
  const [after, setAfter] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const expected = f.paymentReference.trim() ? 'T2' : 'T1';

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(f, {
      customerPhone: (x) => (isPhone(x) ? '' : 'Enter a valid 10-digit mobile number'),
      workType: required,
      pincode: (x) => (isPincode(x) ? '' : 'Enter a 6-digit pincode'),
      amount: (x) => (Number(x) > 0 ? '' : 'Enter the amount'),
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const fd = new FormData();
    Object.entries(f).forEach(([k, val]) => val !== '' && fd.append(k, val));
    if (before[0]) fd.append('photoBefore', before[0]);
    if (after[0]) fd.append('photoAfter', after[0]);
    setLoading(true);
    try {
      const res = await receiptApi.create(fd);
      toast.success('Receipt created. Now send it to your customer.');
      navigate(res.data?._id ? `/worker/receipts/${res.data._id}` : '/worker/receipts', { state: { share: true, receipt: res.data } });
    } catch (err) { setErrors({ form: err.message, ...(err.errors || {}) }); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader title={`Log a ${v.noun}`} subtitle={`It counts only after your customer confirms it with an OTP.`} />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3" noValidate>
        <div className="card space-y-5 lg:col-span-2">
          <h2>{v.key === 'education' ? 'Session details' : 'Job details'}</h2>
          <div>
            <Input label={v.workLabel} placeholder={v.workPlaceholder} list="work-suggestions" value={f.workType} onChange={set('workType')} error={errors.workType} />
            <datalist id="work-suggestions">{v.workSuggestions.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Location pincode" inputMode="numeric" maxLength={6} placeholder="e.g. 275101" value={f.pincode}
              onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, '') })} error={errors.pincode} />
            <Input label={v.amountLabel} prefix="₹" type="number" min="0" value={f.amount} onChange={set('amount')} error={errors.amount} />
          </div>
          {v.key === 'education' && (
            <Select label="Type" value={f.durationType} onChange={set('durationType')} placeholder="Select"
              options={[{ value: 'one-time', label: 'One-time session' }, { value: 'recurring', label: 'Recurring (monthly tuition)' }]} />
          )}
          {activeOrgs.length > 0 && (
            <Select label="Done under an organization? (optional)" placeholder="No, I did this independently" value={f.orgId} onChange={set('orgId')}
              options={activeOrgs.map((m) => ({ value: m.orgId || m.org?._id, label: m.org?.name || m.orgName }))} />
          )}
          <h2 className="pt-2">Customer</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <PhoneInput label={v.customerLabel} value={f.customerPhone} onChange={(x) => setF({ ...f, customerPhone: x })} error={errors.customerPhone} />
            <Input label="Customer name (optional)" value={f.customerName} onChange={set('customerName')} />
          </div>
          <PrivacyNote>The customer’s phone number is stored hashed and used only for the OTP confirmation.</PrivacyNote>
          <h2 className="pt-2">Payment and photos</h2>
          <Input label="Payment reference (optional)" placeholder="UPI transaction ID" value={f.paymentReference} onChange={set('paymentReference')}
            hint="Attach a UPI reference to earn the stronger T2 tier." />
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload label={v.photoBefore} files={before} onChange={setBefore} max={1} />
            <FileUpload label={v.photoAfter} files={after} onChange={setAfter} max={1} />
          </div>
          {errors.form && <p className="text-sm text-danger" role="alert">{errors.form}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create receipt</Button>
          </div>
        </div>
        <aside className="card h-fit space-y-4">
          <h3>What happens next</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
            <li>You send the confirmation link on WhatsApp.</li>
            <li>The customer confirms with an OTP and rates the work.</li>
            <li>Your receipt becomes verified and your score updates.</li>
          </ol>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="mb-1 flex items-center gap-1 text-ink-muted"><Info size={14} />Expected tier once confirmed</p>
            <TierBadge tier={expected} />
          </div>
        </aside>
      </form>
    </>
  );
}
