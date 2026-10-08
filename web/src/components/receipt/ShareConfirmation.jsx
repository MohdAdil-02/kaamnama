import { MessageCircle, Copy } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import PrivacyNote from '../common/PrivacyNote';
import { confirmLink } from '../../utils/qr';
import { whatsappLink } from '../../utils/whatsapp';
import { receiptTitle, formatCurrency } from '../../utils/formatters';
import { toast } from '../../store/notificationStore';
import useVertical from '../../hooks/useVertical';

// Workflow step 3: the worker sends the customer a confirmation link (WhatsApp in Stage 1).
export default function ShareConfirmation({ receipt, open, onClose }) {
  const v = useVertical();
  if (!receipt) return null;
  const url = confirmLink(receipt);
  const text = `Namaste ${receipt.customerName || ''}, I have recorded the ${receiptTitle(receipt)} ${v.noun} (${formatCurrency(receipt.amount)}) on Kaamnama. Please confirm it here. No app needed: ${url}`.replace('  ', ' ');
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success('Link copied'); } catch { toast.error('Could not copy link'); } };
  return (
    <Modal open={open} onClose={onClose} title="Send to customer for confirmation"
      footer={<Button variant="outline" onClick={onClose}>Done</Button>}>
      <p className="mb-4 text-sm text-ink-muted">Your {v.noun} counts only after the customer confirms it with an OTP. Send them this link.</p>
      <div className="mb-4 break-all rounded-lg bg-slate-50 p-3 text-sm">{url}</div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a href={whatsappLink(receipt.customerPhone, text)} target="_blank" rel="noreferrer" className="flex-1"><Button variant="success" icon={MessageCircle} className="w-full">Send on WhatsApp</Button></a>
        <Button variant="outline" icon={Copy} className="flex-1" onClick={copy}>Copy link</Button>
      </div>
      <PrivacyNote className="mt-4">The customer does not need to install anything. The link opens in their browser.</PrivacyNote>
    </Modal>
  );
}
