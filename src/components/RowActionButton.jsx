// src/components/RowActionButton.jsx
import React, { useEffect, useRef, useState } from "react";
import ActionMenu from "./ActionMenu";

export default function RowActionButton({ obj, openFromContext }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);

  // 点击三点打开
  const openMenuFromButton = () => {
    setOpen(true);
  };

  // 右键打开：沿用你传入的坐标，构造一个“假 rect”
  useEffect(() => {
    if (openFromContext) {
      setOpen(true);
    }
  }, [openFromContext]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="p-1 rounded hover:bg-zinc-200"
        aria-label="更多操作"
        onClick={openMenuFromButton}
        onMouseDown={(e) => e.stopPropagation()}
      >
        ⋯
      </button>

      {open && (
        <ActionMenu
          obj={obj}
          anchorRef={btnRef}
          ctxPos={openFromContext}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
