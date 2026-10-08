import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerShell from './CustomerShell';
import DataState from '../../components/common/DataState';
import JobConfirmation from '../../components/customer/JobConfirmation';
import PaymentReference from '../../components/customer/PaymentReference';
import ReceiptStatus from '../../components/receipt/ReceiptStatus';
import PrivacyNote from '../../components/common/PrivacyNote';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import useFetch from '../../hooks/useFetch';
import useT from '../../hooks/useT';
import usePageTitle from '../../hooks/usePageTitle';
import { customerApi } from '../../services/customerApi';
import { toast } from '../../store/notificationStore';
import { RECEIPT_STATUS } from '../../utils/constants';

export default function ConfirmReceipt() {
  usePageTitle('Confirm job');
  const { t } = useT();
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const res = useFetch(() => customerApi.getReceipt(receiptId), [receiptId]);
  const [sending, setSending] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const start = async () => {
    setSending(true);
    try { await customerApi.sendOtp(receiptId); navigate(`/confirm/${receiptId}/otp`); }
    catch (e) { toast.error(e.message); } finally { setSending(false); }
  };
  const reject = async () => {
    setRejecting(true);
    try { await customerApi.reject(receiptId, reason); setRejectOpen(false); toast.success('Response recorded'); res.reload(); }
    catch (e) { toast.error(e.message); } finally { setRejecting(false); }
  };

  return (
    <CustomerShell title={t('cust.title', 'Confirm this job')} subtitle={t('cust.sub', 'Check the details. Only confirm if the work was done.')}>
      <DataState result={res}>
        {(r) => (
          <div className="space-y-4">
            <JobConfirmation receipt={r} />
            <PaymentReference mode={r.paymentMode} reference={r.paymentReference} />
            {r.status !== RECEIPT_STATUS.PENDING ? <ReceiptStatus status={r.status} /> : (
              <div className="space-y-2 pt-2">
                <Button size="lg" className="w-full" loading={sending} onClick={start}>{t('cust.send', 'Send OTP to confirm')}</Button>
                <Button variant="ghost" className="w-full" onClick={() => setRejectOpen(true)}>{t('cust.notcorrect', 'This is not correct')}</Button>
              </div>
            )}
            <PrivacyNote>{t('cust.privacy', 'Your phone number is stored hashed and used only to confirm this job. No app install needed.')}</PrivacyNote>
          </div>
        )}
      </DataState>
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Report a problem"
        footer={<><Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant="danger" loading={rejecting} onClick={reject}>Reject job</Button></>}>
        <Textarea label="What is wrong?" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell us why you are rejecting this job" />
      </Modal>
    </CustomerShell>
  );
}
