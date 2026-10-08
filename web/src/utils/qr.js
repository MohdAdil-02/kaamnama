import { APP_URL } from './constants';
export const profileUrl = (slug) => `${APP_URL}/w/${slug}`;
export const confirmLink = (r) => r?.confirmUrl || `${APP_URL}/confirm/${r?._id}`;
export const downloadQrFromCanvas = (canvasId, filename = 'kaamnama-qr.png') => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  a.click();
};
