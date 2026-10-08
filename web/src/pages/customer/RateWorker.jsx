import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import CustomerShell from './CustomerShell';
import RatingForm from '../../components/customer/RatingForm';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import useT from '../../hooks/useT';
import usePageTitle from '../../hooks/usePageTitle';
import { customerApi } from '../../services/customerApi';
import { toast } from '../../store/notificationStore';
import { getVertical } from '../../utils/verticals';

export default function RateWorker() {
  usePageTitle('Rate the work');
  const { t } = useT();
  const { receiptId } = useParams();
  const receipt = useFetch(() => customerApi.getReceipt(receiptId), [receiptId]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const v = getVertical(receipt.data?.vertical || receipt.data?.worker?.vertical);

  const submit = async (payload) => {
    setLoading(true);
    try { await customerApi.rate(receiptId, payload); setDone(true); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  if (done) {
    return (
      <CustomerShell title={t('rate.thanks', 'Thank you')}>
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 size={48} className="text-success" />
          <p className="mt-3 text-sm text-ink-muted">Your confirmation and rating are saved. You just helped build {receipt.data?.worker?.name ? `${receipt.data.worker.name}’s` : 'a worker’s'} verified record.</p>
          <Link to="/" className="mt-6"><Button variant="outline">About Kaamnama</Button></Link>
        </div>
      </CustomerShell>
    );
  }
  return (
    <CustomerShell title={t('rate.title', 'Job confirmed')} subtitle={t('rate.sub', 'How was the work? Your rating helps others decide.')}>
      <RatingForm onSubmit={submit} loading={loading} tags={v.ratingTags} />
      <Link to="/" className="mt-4 block text-center text-sm text-ink-muted">{t('rate.skip', 'Skip for now')}</Link>
    </CustomerShell>
  );
}
