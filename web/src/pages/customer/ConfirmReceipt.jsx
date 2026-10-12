import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerShell from './CustomerShell';
import DataState from '../../components/common/DataState';
import ReceiptStatus from '../../components/receipt/ReceiptStatus';
import PrivacyNote from '../../components/common/PrivacyNote';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import useFetch from '../../hooks/useFetch';
import useT from '../../hooks/useT';
import usePageTitle from '../../hooks/usePageTitle';
import { receiptApi } from '../../services/receiptApi';
import { toast } from '../../store/notificationStore';
import { RECEIPT_STATUS } from '../../utils/constants';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ConfirmReceipt() {
  usePageTitle('Confirm job');
  const { t } = useT();
  const { token } = useParams();
  const navigate = useNavigate();
  const res = useFetch(() => receiptApi.preview(token), [token]);
  const [sending, setSending] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [reason, setReason] = useState('');

  const start = async (action, why) => {
    setSending(true);
    try {
      await receiptApi.sendOtp(token);
      navigate(`/verify/${token}/otp`, { state: { action, reason: why } });
    } catch (e) { toast.error(e.message); } finally { setSending(false); }
  };

  return (
    <CustomerShell title={t('cust.title', 'Confirm this job')} subtitle={t('cust.sub', 'Check the details. Only confirm if the work was done.')}>
      <DataState result={res}>
        {(d) => {
          const r = d.receipt ?? d.data?.receipt;
          return (
            <div className="space-y-4">
              <div className="card space-y-3">
                <div>
                  <p className="text-sm text-ink-muted">Work done by</p>
                  <p className="font-semibold">{r.worker.displayName}</p>
                  {r.worker.city && <p className="text-sm text-ink-muted">{r.worker.city}</p>}
                </div>
                <div>
                  <p className="text-lg font-semibold">{r.title}</p>
                  {r.category?.name && <p className="text-sm text-ink-muted">{r.category.name}</p>}
                  {r.description && <p className="mt-2 text-sm">{r.description}</p>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Date</span><span>{fmtDate(r.workDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Amount</span><span>₹{r.amount}</span>
                </div>
                <p className="text-xs text-ink-muted">Code will be sent to {r.customerPhoneMasked}</p>
                {r.photos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {r.photos.map((u) => <img key={u} src={u} alt="Job" className="aspect-square rounded-lg object-cover" />)}
                  </div>
                )}
              </div>

              {r.status !== RECEIPT_STATUS.PENDING ? <ReceiptStatus status={r.status} /> : (
                <div className="space-y-2 pt-2">
                  <Button size="lg" className="w-full" loading={sending} onClick={() => start('verify')}>
                    {t('cust.send', 'Send OTP to confirm')}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setProblemOpen(true)}>
                    {t('cust.notcorrect', 'This is not correct')}
                  </Button>
                </div>
              )}
              <PrivacyNote>{t('cust.privacy', 'Your phone number is used only to confirm this job. No app install needed.')}</PrivacyNote>
            </div>
          );
        }}
      </DataState>

      <Modal open={problemOpen} onClose={() => setProblemOpen(false)} title="Report a problem"
        footer={<>
          <Button variant="outline" onClick={() => setProblemOpen(false)}>Cancel</Button>
          <Button variant="danger" loading={sending} disabled={reason.trim().length < 5}
            onClick={() => start('reject', reason.trim())}>Continue</Button>
        </>}>
        <Textarea label="What is wrong?" value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Tell us why this is not correct (at least 5 characters)" />
        <p className="mt-2 text-xs text-ink-muted">We will send a code to your phone to confirm it is you.</p>
      </Modal>
    </CustomerShell>
  );
}