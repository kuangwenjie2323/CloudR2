import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  const stop = (e) => e.stopPropagation();

  return createPortal(
    <div
      onMouseDown={onClose}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,.45)', display:'flex',
        alignItems:'center', justifyContent:'center', padding:16
      }}
    >
      <div onMouseDown={stop} onClick={stop}
        style={{ background:'#fff', borderRadius:12, minWidth:320, maxWidth:'min(92vw, 900px)', maxHeight:'80dvh', display:'flex', flexDirection:'column'}}
      >
        <div style={{padding:'12px 16px', borderBottom:'1px solid rgba(0,0,0,.06)', fontWeight:600}}>{title}</div>
        <div style={{padding:16, overflow:'auto', minHeight:120}}>{children}</div>
        <div style={{padding:12, borderTop:'1px solid rgba(0,0,0,.06)', textAlign:'right'}}>
          <button type="button" onClick={onClose} style={{padding:'6px 12px'}}>关闭</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
