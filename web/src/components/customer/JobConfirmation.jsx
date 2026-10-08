import { User, Wrench, IndianRupee, Calendar, MapPin } from 'lucide-react';
import { formatCurrency, formatDate, receiptTitle } from '../../utils/formatters';
import EvidenceGallery from '../receipt/EvidenceGallery';
import { getVertical } from '../../utils/verticals';

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3">
    <Icon size={18} className="mt-0.5 text-ink-muted" />
    <div><p className="text-xs text-ink-muted">{label}</p><p className="text-sm font-medium">{children}</p></div>
  </div>
);

export default function JobConfirmation({ receipt }) {
  const v = getVertical(receipt.vertical || receipt.worker?.vertical);
  const photos = [receipt.photoBefore, receipt.photoAfter, ...(receipt.evidence || [])].filter(Boolean);
  return (
    <div>
      <div className="divide-y divide-line">
        <Row icon={User} label={v.key === 'education' ? 'Teacher' : 'Worker'}>{receipt.worker?.name}{receipt.worker?.category?.name ? ` · ${receipt.worker.category.name}` : ''}</Row>
        <Row icon={Wrench} label={v.key === 'education' ? 'Subject / session' : 'Work done'}>{receiptTitle(receipt)}{receipt.description ? ` - ${receipt.description}` : ''}</Row>
        <Row icon={IndianRupee} label="Amount">{formatCurrency(receipt.amount)}</Row>
        <Row icon={Calendar} label="Date">{formatDate(receipt.createdAt)}</Row>
        {receipt.pincode && <Row icon={MapPin} label="Location">{receipt.pincode}</Row>}
      </div>
      {photos.length > 0 && <div className="mt-4"><EvidenceGallery images={photos} /></div>}
    </div>
  );
}
