import { useState } from 'react';
import { Link } from 'react-router-dom';
import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import TierBadge from '../../components/receipt/TierBadge';
import { adminApi } from '../../services/adminApi';
import { toast } from '../../store/notificationStore';

export default function Workers() {
  const [target, setTarget] = useState(null); // { worker, action }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);

  const close = () => { setTarget(null); setReason(''); };
  const needsReason = target && target.action !== 'unfreeze';

  const submit = async () => {
    if (needsReason && reason.trim().length < 5) return toast.error('Give a reason (at least 5 characters)');
    setBusy(true);
    const id = target.worker._id;
    try {
      if (target.action === 'clear') await adminApi.clearFlag(id, reason.trim());
      if (target.action === 'freeze') await adminApi.freezeWorker(id, reason.trim());
      if (target.action === 'unfreeze') await adminApi.unfreezeWorker(id);
      toast.success('Done');
      close(); setKey((k) => k + 1);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const titles = { clear: 'Clear flag?', freeze: 'Freeze trust score?', unfreeze: 'Unfreeze trust score?' };

  return (
    <>
      <ResourceTable key={key} title="Flagged workers" subtitle="Patterns that may indicate fake jobs. Review before acting."
        fetcher={adminApi.flaggedWorkers} dataKey="workers" exportName="flagged-workers"
        columns={[
          { key: 'displayName', header: 'Worker', render: (w) => w.slug
            ? <Link className="font-medium text-primary" to={`/w/${w.slug}`}>{w.displayName}</Link> : w.displayName },
          { key: 'tier', header: 'Tier', render: (w) => <TierBadge tier={w.tier} /> },
          { key: 'verifiedJobsCount', header: 'Verified jobs' },
          { key: 'riskScore', header: 'Risk' },
          { key: 'riskSignals', header: 'Signals', render: (w) => (
            <ul className="space-y-1 text-xs">{(w.riskSignals || []).map((s) => <li key={s.code}>{s.detail}</li>)}</ul>) },
          { key: 'scoreFrozen', header: 'Status', render: (w) => w.scoreFrozen ? <Badge tone="danger">Frozen</Badge> : <Badge tone="warning">Flagged</Badge> },
          { key: 'actions', header: '', render: (w) => (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setTarget({ worker: w, action: 'clear' })}>Clear</Button>
              {w.scoreFrozen
                ? <Button size="sm" variant="outline" onClick={() => setTarget({ worker: w, action: 'unfreeze' })}>Unfreeze</Button>
                : <Button size="sm" variant="danger" onClick={() => setTarget({ worker: w, action: 'freeze' })}>Freeze</Button>}
            </div>) },
        ]} />
      <Modal open={!!target} onClose={close} title={target ? titles[target.action] : ''}
        footer={<><Button variant="outline" onClick={close}>Cancel</Button>
          <Button variant={target?.action === 'freeze' ? 'danger' : 'primary'} loading={busy} onClick={submit}>Confirm</Button></>}>
        {target?.action === 'unfreeze'
          ? <p className="text-sm">The real score and tier are restored.</p>
          : <Textarea label="Reason (recorded in the audit log)" value={reason} onChange={(e) => setReason(e.target.value)} />}
        {target?.action === 'freeze' && <p className="mt-2 text-xs text-ink-muted">The public score and tier are pinned to zero until unfrozen.</p>}
      </Modal>
    </>
  );
}