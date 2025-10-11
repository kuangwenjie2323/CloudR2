// src/components/RowActionButton.jsx
import React, { useRef, useState } from "react";
import ActionMenu from "./ActionMenu";

export default function RowActionButton({ obj, openFromContext }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [ctxPos, setCtxPos] = useState(null);

  // 右键/长按也用这个组件打开
  React.useEffect(() => {
    if (!openFromContext) return;
    setCtxPos(openFromContext);
    setOpen(true);
  }, [openFromContext]);

  // 移动端长按
  React.useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    let timer = null;
    const onTouchStart = e => {
      timer = setTimeout(() => {
        setCtxPos({x: e.touches[0].clientX, y: e.touches[0].clientY});
        setOpen(true);
      }, 500);
    };
    const clear = () => { if (timer) clearTimeout(timer); };
    el.addEventListener("touchstart", onTouchStart, {passive: true});
    el.addEventListener("touchend", clear, {passive: true});
    el.addEventListener("touchcancel", clear, {passive: true});
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", clear);
      el.removeEventListener("touchcancel", clear);
    };
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        className="px-2 py-1 rounded hover:bg-zinc-100 text-xl leading-none"
        aria-label="更多操作"
        onClick={() => { setCtxPos(null); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
        }}
      >
        ···
      </button>
      {open && (
        <ActionMenu
          obj={obj}
          anchorRef={btnRef}
          ctxPos={ctxPos}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
