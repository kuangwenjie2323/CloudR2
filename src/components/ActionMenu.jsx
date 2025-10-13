// src/components/ActionMenu.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// 传入：obj（当前文件对象）, anchorRef（按钮ref）, ctxPos（右键/长按坐标，可为空）, onClose()
export default function ActionMenu({
  obj,
  anchorRef,
  ctxPos,
  onClose,
  onPreview,
  onRename,
  onMove,
  onDelete
}) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // 屏幕坐标
  const [ready, setReady] = useState(false);

  // 计算并设置菜单位置（考虑视口边界）
  const computePosition = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = 0, y = 0;

    if (ctxPos && typeof ctxPos.x === "number" && typeof ctxPos.y === "number") {
      x = ctxPos.x;
      y = ctxPos.y;
    } else if (anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      x = r.right;
      y = r.bottom + 6;
    } else {
      x = vw / 2; y = vh / 2;
    }

    // 等菜单挂上再测尺寸，进行边界修正
    const el = menuRef.current;
    const mw = el ? el.offsetWidth : 240;
    const mh = el ? el.offsetHeight : 160;

    // 预留 8px 边距
    const margin = 8;
    // 优先右下方展开，越界则往左/上收
    let left = Math.min(x, vw - mw - margin);
    let top  = Math.min(y, vh - mh - margin);
    left = Math.max(margin, left);
    top  = Math.max(margin, top);

    setPos({ x: left, y: top });
    setReady(true);
  };

  useLayoutEffect(() => {
    // 初次定位
    requestAnimationFrame(computePosition);
    // 监听滚动/窗口变化，实时重算
    const ro = () => computePosition();
    window.addEventListener("resize", ro);
    window.addEventListener("scroll", ro, true);
    return () => {
      window.removeEventListener("resize", ro);
      window.removeEventListener("scroll", ro, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRef, ctxPos?.x, ctxPos?.y]);

  // 点击外部关闭、Esc 关闭
  useEffect(() => {
    const onDown = (e) => {
      const m = menuRef.current;
      const a = anchorRef?.current;
      if (!m) return;
      if (m.contains(e.target)) return;
      if (a && a.contains(e.target)) return;
      onClose?.();
    };
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, anchorRef]);

  // 菜单内容（你可以在这里替换为真正的操作项）
  const content = (
    <div
      ref={menuRef}
      className="z-[50] rounded-xl border border-zinc-200 bg-white shadow-xl p-2 min-w-[180px]"
      style={{ position: "fixed", left: pos.x, top: pos.y, opacity: ready ? 1 : 0 }}
      role="menu"
    >
      <button
        className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-100"
        onClick={async () => {
          await onPreview?.(obj);
          onClose?.();
        }}
      >
        预览/打开
      </button>
      <button
        className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-100"
        onClick={async () => {
          await onRename?.(obj);
          onClose?.();
        }}
      >
        重命名
      </button>
      <button
        className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-100"
        onClick={async () => {
          await onMove?.(obj);
          onClose?.();
        }}
      >
        移动到
      </button>
      <button
        className="block w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600"
        onClick={async () => {
          await onDelete?.(obj);
          onClose?.();
        }}
      >
        删除
      </button>
    </div>
  );

  // 兜底：如果运行时没有 portal（极端别名错误），也渲染在当前位置，至少不白屏
  const canPortal = typeof document !== "undefined" && typeof createPortal === "function";
  return canPortal ? createPortal(content, document.body) : content;
}
