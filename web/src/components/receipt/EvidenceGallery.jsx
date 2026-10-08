import { useState } from 'react';
import Modal from '../common/Modal';

export default function EvidenceGallery({ images = [] }) {
  const [active, setActive] = useState(null);
  if (!images.length) return <p className="text-sm text-ink-muted">No photos attached.</p>;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => {
          const src = img.url || img;
          return (
            <button key={i} onClick={() => setActive(src)} className="aspect-square overflow-hidden rounded-lg border border-line">
              <img src={src} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover transition hover:scale-105" loading="lazy" />
            </button>
          );
        })}
      </div>
      <Modal open={!!active} onClose={() => setActive(null)} title="Evidence photo">
        {active && <img src={active} alt="Evidence" className="w-full rounded-lg" />}
      </Modal>
    </>
  );
}
