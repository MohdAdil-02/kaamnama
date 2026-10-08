import { useState } from 'react';
import StarRating from '../common/StarRating';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import useT from '../../hooks/useT';

// 1-5 stars + short tags, as in the Job Receipt spec
export default function RatingForm({ onSubmit, loading, tags = [] }) {
  const { t } = useT();
  const [rating, setRating] = useState(0);
  const [picked, setPicked] = useState([]);
  const [comment, setComment] = useState('');
  const toggle = (x) => setPicked((p) => (p.includes(x) ? p.filter((y) => y !== x) : [...p, x]));
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (rating) onSubmit({ rating, tags: picked, comment }); }} className="space-y-5">
      <div className="flex flex-col items-center gap-2">
        <StarRating value={rating} onChange={setRating} size={36} />
        <p className="text-sm text-ink-muted">{rating ? `${rating} / 5` : 'Tap a star'}</p>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((x) => (
            <button key={x} type="button" onClick={() => toggle(x)} aria-pressed={picked.includes(x)}
              className={`rounded-full border px-3 py-1.5 text-sm ${picked.includes(x) ? 'border-primary bg-primary-light text-primary' : 'border-line bg-white text-ink-muted'}`}>{x}</button>
          ))}
        </div>
      )}
      <Textarea label="Comment (optional)" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button type="submit" size="lg" className="w-full" disabled={!rating} loading={loading}>{t('rate.submit', 'Submit rating')}</Button>
    </form>
  );
}
