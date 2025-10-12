// src/components/RowActionButton.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 8;   // 锚点与菜单的间距
const SAFE = 8;  // 视口安全边距

export default function RowActionButton({ obj, openFromContext }) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [anchorRect, setAnchorRect] = useState(null); // 记录按钮位置

  // 点击三点打开
  const openMenuFromButton = () => {
    const el = btnRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
    setOpen(true);
  };

  // 右键打开：沿用你传入的坐标，构造一个“假 rect”
  useEffect(() => {
    if (openFromContext) {
      const { x, y } = openFromContext;
      setAnchorRect({ left: x, right: x, top: y, bottom: y });
      setOpen(true);
    }
  }, [openFromContext]);

  // 计算/更新菜单位置 —— 在 open 为 true 且菜单已挂载后执行
  const recalc = () => {
    if (!open || !anchorRect) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const mw = menuRef.current?.offsetWidth ?? 240;  // 估值兜底
    const mh = menuRef.current?.offsetHeight ?? 200;

    // 1) 先给一个“理想位置”：右对齐 + 下方展开
    let x = anchorRect.right - mw;   // 与触发点右侧对齐，体验更像系统菜单
    let y = anchorRect.bottom + GAP; // 默认在下方

    // 2) 若下方放不下 -> 翻到上方
    if (y + mh + SAFE > vh) {
      y = anchorRect.top - mh - GAP;
    }
    // 3) 进行边界夹取：不超出视口
    x = Math.min(vw - SAFE - mw, Math.max(SAFE, x));
    y = Math.min(vh - SAFE - mh, Math.max(SAFE, y));

    setPos({ x, y });
  };

  // 打开后/菜单宽高变化后，做一次布局计算
  useLayoutEffect(() => {
    if (!open) return;
    // 两帧：先打开再 rAF，确保 DOM 已渲染到 body
    const id = requestAnimationFrame(() => recalc());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorRect]);

  // 窗口变化时重算
  useEffect(() => {
    if (!open) return;
    const onWin = () => recalc();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true); // 捕获阶段处理滚动容器
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorRect]);

  // 点击外部/Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onDown = () => setOpen(false);
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

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 min-w-40 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-auto"
          style={{
            left: pos.x,
            top: pos.y,
            maxHeight: `calc(100vh - ${SAFE * 2}px)`, // 超高时可滚动
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MenuItem label="下载"        onClick={() => {/* TODO: download */}} />
          <MenuItem label="重命名"      onClick={() => {/* TODO: rename */}} />
          <MenuDivider />
          <MenuItem label="复制链接"    onClick={() => {/* TODO: copy url */}} />
          <MenuItem label="删除" danger onClick={() => {/* TODO: delete */}} />
        </div>,
        document.body
      )}
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
