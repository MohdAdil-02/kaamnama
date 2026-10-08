import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Printer } from 'lucide-react';
import DataState from '../../components/common/DataState';
import Button from '../../components/common/Button';
import ReceiptStatus from '../../components/receipt/ReceiptStatus';
import ReceiptTimeline from '../../components/receipt/ReceiptTimeline';
import EvidenceGallery from '../../components/receipt/EvidenceGallery';
import ShareConfirmation from '../../components/receipt/ShareConfirmation';
import TierBadge from '../../components/receipt/TierBadge';
import PaymentReference from '../../components/customer/PaymentReference';
import StarRating from '../../components/common/StarRating';
import useReceipt from '../../hooks/useReceipt';
import usePageTitle from '../../hooks/usePageTitle';
import { receiptApi } from '../../services/receiptApi';
import { toast } from '../../store/notificationStore';
import { formatCurrency, formatDate, maskPhone, receiptTitle } from '../../utils/formatters';
import { RECEIPT_STATUS } from '../../utils/constants';
import { tierOf } from '../../utils/tiers';

export default function ReceiptDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const res = useReceipt(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [reminding, setReminding] = useState(false);
  usePageTitle(res.data ? receiptTitle(res.data) : 'Receipt');
  useEffect(() => { if (state?.share) setShareOpen(true); }, [state]);

  const remind = async () => {
    setReminding(true);
    try { await receiptApi.resend(id); toast.success('Reminder sent to the customer'); res.reload(); }
    catch (e) { toast.error(e.message); } finally { setReminding(false); }
  };
  return (
    <>
      <Link to="/worker/receipts" className="no-print mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><ArrowLeft size={16} />Back to receipts</Link>
      <DataState result={res}>
        {(r) => {
          const pending = r.status === RECEIPT_STATUS.PENDING;
          const photos = [r.photoBefore && { url: r.photoBefore }, r.photoAfter && { url: r.photoAfter }, ...(r.evidence || [])].filter(Boolean);
          return (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h1 className="!text-2xl">{receiptTitle(r)}</h1><p className="mt-1 text-ink-muted">{formatDate(r.createdAt)}{r.pincode ? ` · ${r.pincode}` : ''}</p></div>
                    <TierBadge tier={tierOf(r)} />
                  </div>
                  <div className="mt-5"><ReceiptStatus status={r.status} /></div>
                  {r.description && <p className="mt-5 text-sm leading-relaxed">{r.description}</p>}
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-ink-muted">Customer</dt><dd className="font-medium">{r.customerName || maskPhone(r.customerPhone)}</dd></div>
                    <div><dt className="text-ink-muted">Amount</dt><dd className="font-medium">{formatCurrency(r.amount)}</dd></div>
                    <div><dt className="text-ink-muted">{r.org ? 'Organization' : 'Category'}</dt><dd className="font-medium">{r.org?.name || r.category?.name || 'Independent'}</dd></div>
                  </dl>
                  <div className="mt-5"><PaymentReference mode={r.paymentMode} reference={r.paymentReference} /></div>
                  <div className="no-print mt-5 flex flex-wrap gap-2">
                    {pending && <Button variant="success" icon={MessageCircle} onClick={() => setShareOpen(true)}>Send on WhatsApp</Button>}
                    {pending && <Button variant="outline" loading={reminding} onClick={remind}>Resend OTP link</Button>}
                    <Button variant="ghost" icon={Printer} onClick={() => window.print()}>Print</Button>
                  </div>
                </div>
                <div className="card"><h2 className="mb-4">Photos</h2><EvidenceGallery images={photos} /></div>
                {r.rating && (
                  <div className="card">
                    <h2 className="mb-2">Customer rating</h2>
                    <StarRating value={r.rating.value ?? r.rating} />
                    {r.rating.tags?.length > 0 && <p className="mt-2 text-sm text-ink-muted">{r.rating.tags.join(' · ')}</p>}
                    {r.rating.comment && <p className="mt-2 text-sm text-ink-muted">“{r.rating.comment}”</p>}
                  </div>
                )}
              </div>
              <div className="card h-fit"><h2 className="mb-5">Activity</h2><ReceiptTimeline receipt={r} /></div>
              <ShareConfirmation receipt={{ ...state?.receipt, ...r }} open={shareOpen} onClose={() => setShareOpen(false)} />
            </div>
          );
        }}
      </DataState>
    </>
  );
}
