import Modal from './Modal';
import Button from './Button';
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmText = 'Confirm', danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmText}</Button>
      </>}>
      <div className="text-sm text-ink-muted">{message}</div>
    </Modal>
  );
}
