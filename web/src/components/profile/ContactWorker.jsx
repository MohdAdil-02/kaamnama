import { Phone, MessageCircle, Share2 } from 'lucide-react';
import Button from '../common/Button';
import { whatsappLink } from '../../utils/whatsapp';
import { toast } from '../../store/notificationStore';

// Directory rule from the product layout: contact is direct (call / WhatsApp). No hiring flow, no in-app payment.
export default function ContactWorker({ worker }) {
  const share = async () => {
    const data = { title: `${worker.name} on Kaamnama`, url: window.location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast.success('Profile link copied'); } } catch { /* cancelled */ }
  };
  return (
    <>
      {worker.phone && <>
        <a href={whatsappLink(worker.phone, `Hi ${worker.name}, I found your profile on Kaamnama.`)} target="_blank" rel="noreferrer"><Button icon={MessageCircle} className="w-full">WhatsApp</Button></a>
        <a href={`tel:+91${String(worker.phone).replace(/^\+?91/, '')}`}><Button variant="outline" icon={Phone} className="w-full">Call</Button></a>
      </>}
      <Button variant="ghost" icon={Share2} onClick={share}>Share</Button>
    </>
  );
}
