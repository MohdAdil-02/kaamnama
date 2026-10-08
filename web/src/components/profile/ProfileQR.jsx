import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy } from 'lucide-react';
import Button from '../common/Button';
import { profileUrl, downloadQrFromCanvas } from '../../utils/qr';
import { toast } from '../../store/notificationStore';

export default function ProfileQR({ slug, size = 220 }) {
  const url = profileUrl(slug);
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success('Link copied'); } catch { toast.error('Could not copy link'); } };
  return (
    <div className="flex flex-col items-center text-center">
      <div className="rounded-xl border border-line bg-white p-4">
        <QRCodeCanvas id="profile-qr" value={url} size={size} level="M" includeMargin />
      </div>
      <p className="mt-3 max-w-full break-all text-sm text-ink-muted">{url}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button variant="outline" icon={Copy} onClick={copy}>Copy link</Button>
        <Button icon={Download} onClick={() => downloadQrFromCanvas('profile-qr', `${slug}-qr.png`)}>Download QR</Button>
      </div>
    </div>
  );
}
