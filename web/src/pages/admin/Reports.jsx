import { useState } from 'react';
import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import { adminApi } from '../../services/adminApi';
import { toast } from '../../store/notificationStore';
import { formatDate } from '../../utils/formatters';

export default function Reports() {
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);
  const close = () => { setTarget(null); setReason(''); };

  const hide = async () => {
    if (reason.trim().length < 5) return toast.error('Give a reason (at least 5 characters)');
    setBusy(true);
    try { await adminApi.hideRating(target._id, reason.trim()); toast.success('Rating hidden'); close(); setKey((k) => k + 1); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const unhide = async (r) => {
    try { await adminApi.unhideRating(r._id); toast.success('Rating restored'); setKey((k) => k + 1); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <ResourceTable key={key} title="Ratings" subtitle="Hide abusive or fake ratings. The worker's score updates immediately."
        fetcher={adminApi.ratings} dataKey="ratings"
        filters={[{ name: 'hidden', placeholder: 'All', options: [{ value: 'false', label: 'Visible' }, { value: 'true', label: 'Hidden' }] }]}
        columns={[
          { key: 'worker', header: 'Worker', render: (r) => r.worker?.displayName },
          { key: 'customerUser', header: 'Customer', render: (r) => r.customerUser?.name },
          { key: 'stars', header: 'Stars' },
          { key: 'comment', header: 'Comment' },
          { key: 'isHidden', header: 'Status', render: (r) => r.isHidden ? <Badge tone="danger">Hidden</Badge> : <Badge tone="success">Visible</Badge> },
          { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
          { key: 'actions', header: '', render: (r) => r.isHidden
            ? <Button size="sm" variant="outline" onClick={() => unhide(r)}>Restore</Button>
            : <Button size="sm" variant="danger" onClick={() => setTarget(r)}>Hide</Button> },
        ]} />
      <Modal open={!!target} onClose={close} title="Hide this rating?"
        footer={<><Button variant="outline" onClick={close}>Cancel</Button><Button variant="danger" loading={busy} onClick={hide}>Hide</Button></>}>
        <Textarea label="Reason (recorded in the audit log)" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </>
  );
}