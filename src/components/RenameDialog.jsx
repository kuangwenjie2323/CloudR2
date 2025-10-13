import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function RenameDialog({ file, open, onClose, onConfirm }) {
  const [value, setValue] = useState('');
  useEffect(() => { setValue(file?.name || file?.key || ''); }, [file]);

  const submit = async () => {
    if (!value || value === (file?.name || file?.key)) return onClose();
    await onConfirm?.(file, value);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="重命名">
      <div style={{display:'grid', gap:10}}>
        <input value={value} onChange={(e)=>setValue(e.target.value)}
          style={{padding:'8px 10px', border:'1px solid #d0d7de', borderRadius:8}}/>
        <div style={{textAlign:'right'}}>
          <button type="button" onClick={submit} style={{padding:'6px 12px'}}>确定</button>
        </div>
      </div>
    </Modal>
  );
}
