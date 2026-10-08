import { useMemo, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { compressImage } from '../../utils/image';

// Controlled image picker (files: File[]). Photos are compressed before upload to save mobile data.
export default function FileUpload({ label, files = [], onChange, max = 5, hint, capture }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  const add = async (e) => {
    const picked = Array.from(e.target.files);
    e.target.value = '';
    setBusy(true);
    const compressed = await Promise.all(picked.map((f) => compressImage(f)));
    setBusy(false);
    onChange([...files, ...compressed].slice(0, max));
  };
  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium">{label}</span>}
      <div className="flex flex-wrap gap-3">
        {files.map((f, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-line">
            <img src={previews[i]} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-0.5 text-white" aria-label="Remove"><X size={12} /></button>
          </div>
        ))}
        {files.length < max && (
          <button type="button" onClick={() => ref.current.click()} disabled={busy}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-ink-muted hover:bg-slate-50 disabled:opacity-60">
            <ImagePlus size={20} />{busy ? '…' : 'Add'}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" capture={capture} multiple={max > 1} className="hidden" onChange={add} />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
