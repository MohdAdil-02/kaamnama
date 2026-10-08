import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

export default function SessionForm({ subjects = [], onSubmit, loading }) {
  const [v, setV] = useState({ studentName: '', subject: '', duration: '', date: '' });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="grid gap-4 sm:grid-cols-2">
      <Input label="Student name" value={v.studentName} onChange={set('studentName')} required />
      <Select label="Subject" value={v.subject} onChange={set('subject')} options={subjects.map((s) => ({ value: s, label: s }))} />
      <Input label="Duration (minutes)" type="number" min="15" value={v.duration} onChange={set('duration')} />
      <Input label="Date" type="date" value={v.date} onChange={set('date')} />
      <div className="sm:col-span-2"><Button type="submit" loading={loading}>Log session</Button></div>
    </form>
  );
}
