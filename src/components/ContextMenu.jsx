import { createPortal } from 'react';

export default function ContextMenu({ file, x, y, onAction, onClose }) {
  const handle = (action) => (e) => {
    e.preventDefault();
    e.stopPropagation();           // 防止被外层“点外关闭”先拦截
    onAction?.(action, file);
    onClose?.();
  };

  return createPortal(
    <div
      className="context-menu"
      style={{
        position: 'fixed',
        inset: 'auto auto auto auto',
        left: x,
        top: y,
        zIndex: 1000,
        background: 'var(--menu-bg, #fff)',
        borderRadius: 8,
        boxShadow: '0 6px 24px rgba(0,0,0,.15)',
        padding: 8,
        minWidth: 160,
        userSelect: 'none'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" onClick={handle('preview')} className="menu-item">预览/打开</button>
      <button type="button" onClick={handle('rename')}  className="menu-item">重命名</button>
      <button type="button" onClick={handle('move')}    className="menu-item">移动到</button>
      <button type="button" onClick={handle('delete')}  className="menu-item" style={{color:'#e5484d'}}>删除</button>
      <style>{`
        .menu-item{ width:100%; text-align:left; padding:8px 10px; border:0; background:transparent; cursor:pointer; border-radius:6px }
        .menu-item:hover{ background:rgba(0,0,0,.06)}
      `}</style>
    </div>,
    document.body
  );
}
