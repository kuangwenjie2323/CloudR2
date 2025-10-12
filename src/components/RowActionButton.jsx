// src/components/RowActionButton.jsx
import React, {useEffect, useRef, useState } from "react";
import ActionMenu from "./ActionMenu";
import { createPortal } from "react-dom";

// 这个组件就是你三点菜单的按钮 + 弹层
export default function RowActionButton({ obj, openFromContext }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // 打开菜单（点击三点）
  function openMenuFromButton() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: r.right, y: r.bottom + 6 });
    setOpen(true);
  }

  // 右键打开传入的位置（已有）
  useEffect(() => {
    if (openFromContext) {
      setPos({ x: openFromContext.x, y: openFromContext.y });
      setOpen(true);
    }
  }, [openFromContext]);

  // 点击外部/Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

      {/* ⚠️ 这里用 createPortal 渲染到 body */}
      {open && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-50 min-w-40 rounded-xl border border-zinc-200 bg-white shadow-xl"
            style={{ left: pos.x, top: pos.y }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <MenuItem label="下载" onClick={() => {/* TODO */}} />
            <MenuItem label="重命名" onClick={() => {/* TODO 调 renameR2 */}} />
            <MenuDivider />
            <MenuItem label="复制链接" onClick={() => {/* TODO 调 getPublicUrl */}} />
            <MenuItem label="删除" danger onClick={() => {/* TODO 调 deleteR2 */}} />
          </div>,
          document.body
        )
      }
    </>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      className={
        "w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 " +
        (danger ? "text-red-600" : "text-zinc-800")
      }
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      {label}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-zinc-200 my-1" />;
}
