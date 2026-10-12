import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, MessageCircle, Printer, RefreshCw, Send } from 'lucide-react';
import DataState from '../../components/common/DataState';
import Button from '../../components/common/Button';
import ReceiptStatus from '../../components/receipt/ReceiptStatus';
import EvidenceGallery from '../../components/receipt/EvidenceGallery';
import useReceipt from '../../hooks/useReceipt';
import usePageTitle from '../../hooks/usePageTitle';
import { receiptApi } from '../../services/receiptApi';
import { toast } from '../../store/notificationStore';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';
import { RECEIPT_STATUS } from '../../utils/constants';

const EVENT_LABEL = {
  created: 'Receipt created',
  otp_sent: 'Code sent to customer',
  otp_failed: 'Wrong code entered',
  resent: 'Link sent to customer',
  verified: 'Customer confirmed',
  disputed: 'Customer disputed',
  rejected: 'Customer rejected',
  expired: 'Expired',
};

export default function ReceiptDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const res = useReceipt(id);
  const [verification, setVerification] = useState(state?.verification || null);
  const [busy, setBusy] = useState('');
  usePageTitle('Receipt');

  useEffect(() => { if (state?.verification) setVerification(state.verification); }, [state]);

  const newQr = async () => {
    setBusy('qr');
    try {
      const r = await receiptApi.newQr(id);
      setVerification(r.data.verification);
      toast.success('New QR created. The previous link no longer works.');
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };

  const sms = async () => {
    setBusy('sms');
    try {
      const r = await receiptApi.sendLink(id);
      toast.success(`Link sent to ${r.data.sentTo}`);
      res.reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };

  const copy = async (url) => {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    catch { toast.error('Could not copy. Select the link and copy it manually.'); }
  };

  return (
    <>
      <Link to="/worker/receipts" className="no-print mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} />Back to receipts
      </Link>
      <DataState result={res}>
        {(d) => {
          const payload = d.receipt ? d : d.data || d;
          const r = payload.receipt;
          const events = payload.events || [];
          const pending = r.status === RECEIPT_STATUS.PENDING;
          const photos = (r.photos || []).map((p) => ({ url: p.url }));
          const waText = verification
            ? encodeURIComponent(`Please confirm the job "${r.title}" I did for you: ${verification.url}`)
            : '';
          const waPhone = String(r.customerPhone || '').replace(/\D/g, '');

          return (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="card">
                  <h1 className="!text-2xl">{r.title}</h1>
                  <p className="mt-1 text-ink-muted">{r.receiptNumber} · {formatDate(r.workDate)}</p>
                  <div className="mt-5"><ReceiptStatus status={r.status} /></div>
                  {r.description && <p className="mt-5 text-sm leading-relaxed">{r.description}</p>}
                  {r.disputeReason && <p className="mt-3 text-sm text-danger">Customer note: {r.disputeReason}</p>}
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-ink-muted">Customer</dt><dd className="font-medium">{r.customerName || maskPhone(r.customerPhone)}</dd></div>
                    <div><dt className="text-ink-muted">Amount</dt><dd className="font-medium">{formatCurrency(r.amount)}</dd></div>
                    <div><dt className="text-ink-muted">Category</dt><dd className="font-medium">{r.category?.name || '-'}</dd></div>
                  </dl>
                  <div className="no-print mt-5 flex flex-wrap gap-2">
                    <Button variant="ghost" icon={Printer} onClick={() => window.print()}>Print</Button>
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="card"><h2 className="mb-4">Photos</h2><EvidenceGallery images={photos} /></div>
                )}

                <div className="card">
                  <h2 className="mb-4">Timeline</h2>
                  <ul className="space-y-2 text-sm">
                    {events.map((e, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{EVENT_LABEL[e.type] || e.type}</span>
                        <span className="text-ink-muted">{new Date(e.createdAt).toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {pending && (
                <aside className="card no-print h-fit space-y-4">
                  <h2>Send to customer</h2>
                  {verification ? (
                    <>
                      <img src={verification.qrDataUrl} alt="QR code to confirm this job" className="mx-auto w-48" />
                      <p className="break-all rounded bg-slate-50 p-2 text-xs">{verification.url}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" icon={Copy} onClick={() => copy(verification.url)}>Copy link</Button>
                        <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noreferrer">
                          <Button variant="success" icon={MessageCircle} type="button">WhatsApp</Button>
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-ink-muted">
                      For security the link is shown only once, right after creating the receipt.
                      Generate a new QR to share it again (this cancels the old link).
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" icon={RefreshCw} loading={busy === 'qr'} onClick={newQr}>New QR</Button>
                    <Button variant="outline" icon={Send} loading={busy === 'sms'} onClick={sms}>SMS the link</Button>
                  </div>
                  <p className="text-xs text-ink-muted">Expires {formatDate(r.expiresAt)}.</p>
                </aside>
              )}
            </div>
          );
        }}
      </DataState>
    </>
  );
}