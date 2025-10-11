// src/components/ActionMenu.jsx
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import { renameR2, moveR2, deleteR2 } from "../utils/api";
import { useStore } from "../app/store";

// 简易 uid
const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

function usePortal() {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }
  useEffect(() => {
    const el = elRef.current;
    document.body.appendChild(el);
    return () => document.body.removeChild(el);
  }, []);
  return elRef.current;
}

// 计算菜单位置（避免溢出）
function place(x, y, w = 240, h = 320) {
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = x, top = y;
  if (left + w > vw - 8) left = Math.max(8, vw - w - 8);
  if (top + h > vh - 8) top = Math.max(8, vh - h - 8);
  return {left, top};
}

export default function ActionMenu({
  obj,                     // { key, size, uploaded ... }
  anchorRef,               // 行尾“···”按钮 ref
  ctxPos,                  // {x,y} 右键打开位置（可空）
  onClose,                 // 关闭回调
}) {
  const portal = usePortal();
  const [pos, setPos] = useState({left: 0, top: 0});
  const wrapRef = useRef(null);
  const subRef  = useRef(null);
  const { addTask, updateTask, addRecentMoveTarget, recentMoveTargets } = useStore();

  // 定位：来自右键直接用 ctxPos，否则用锚点按钮位置
  useLayoutEffect(() => {
    if (ctxPos) {
      setPos(place(ctxPos.x, ctxPos.y, 248, 360));
    } else if (anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos(place(r.right, r.bottom, 248, 360));
    }
  }, [ctxPos, anchorRef]);

  // 关闭条件：Esc/点击外部/窗口滚动或缩放
  useEffect(() => {
    const onKey = e => (e.key === "Escape") && onClose?.();
    const onDown = e => {
      if (!wrapRef.current?.contains(e.target)) onClose?.();
    };
    const onBlur = () => onClose?.();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("wheel", onBlur, {passive: true});
    window.addEventListener("resize", onBlur);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("wheel", onBlur);
      window.removeEventListener("resize", onBlur);
    };
  }, [onClose]);

  // —— actions
  const openPreview = () => {
    const url = `${location.origin}/api/get?key=${encodeURIComponent(obj.key)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose?.();
  };

  const copyLink = async () => {
    const url = `${location.origin}/api/get?key=${encodeURIComponent(obj.key)}`;
    await navigator.clipboard.writeText(url);
    window.dispatchEvent(new CustomEvent("toast", { detail: { text: "已复制链接" }}));
    onClose?.();
  };

  const download = () => {
    const url = `${location.origin}/api/get?key=${encodeURIComponent(obj.key)}`;
    const a = document.createElement("a");
    a.href = url; a.rel = "noopener noreferrer"; a.target = "_blank";
    a.click();
    onClose?.();
  };

  const rename = async () => {
    const old = obj.key.split("/").pop();
    const val = prompt("输入新文件名：", old);
    if (!val || val === old) return;
    const to = obj.key.replace(/[^/]+$/, val);
    const id = uid();
    addTask({ id, name: `重命名 ${old} → ${val}`, status: "pending", pct: 0 });
    try {
      await renameR2(obj.key, to, { overwrite: false });
      updateTask(id, { status: "done", pct: 100 });
      window.dispatchEvent(new CustomEvent("r2:reload"));
    } catch (e) {
      updateTask(id, { status: "error", error: String(e?.message || e) });
      alert(`重命名失败：${String(e?.message || e)}`);
    } finally { onClose?.(); }
  };

  const moveTo = async (target) => {
    const id = uid();
    addTask({ id, name: `移动 1 项 → ${target || "/"}`, status: "pending", pct: 0 });
    try {
      await moveR2([obj.key], target || "", { overwrite: false, flatten: true });
      addRecentMoveTarget?.(target || "");
      updateTask(id, { status: "done", pct: 100 });
      window.dispatchEvent(new CustomEvent("r2:reload"));
    } catch (e) {
      updateTask(id, { status: "error", error: String(e?.message || e) });
      alert(`移动失败：${String(e?.message || e)}`);
    } finally { onClose?.(); }
  };

  const moveOther = async () => {
    const val = prompt("移动到文件夹（相对路径，如 photos/2025/）", "");
    if (val == null) return;
    await moveTo(val.trim());
  };

  const del = async () => {
    if (!confirm(`确定删除：\n${obj.key}`)) return;
    const id = uid();
    addTask({ id, name: `删除 ${obj.key}`, status: "pending", pct: 0 });
    try {
      await deleteR2([obj.key]);
      updateTask(id, { status: "done", pct: 100 });
      window.dispatchEvent(new CustomEvent("r2:reload"));
    } catch (e) {
      updateTask(id, { status: "error", error: String(e?.message || e) });
      alert(`删除失败：${String(e?.message || e)}`);
    } finally { onClose?.(); }
  };

  // 菜单项
  const items = [
    { label: "预览/打开",   kbd: "Enter",    onClick: openPreview },
    { label: "复制链接",     kbd: "Ctrl/Cmd+C", onClick: copyLink },
    { label: "下载",         onClick: download },
    { divider: true },
    { label: "重命名…",     kbd: "F2",      onClick: rename },
    {
      label: "移动到",
      submenu: [
        ...(recentMoveTargets?.slice(0, 6) || []).map(p => ({
          label: p || "(根目录)", onClick: () => moveTo(p)
        })),
        { divider: true },
        { label: "其他位置…", onClick: moveOther },
      ]
    },
    { divider: true },
    { label: "删除",         danger: true, kbd: "Del", onClick: del },
  ];

  const menu = (
    <div
      ref={wrapRef}
      className="fixed z-[1000] min-w-[248px] rounded-xl bg-white shadow-2xl border border-zinc-200 overflow-hidden select-none"
      style={{ left: pos.left, top: pos.top }}
      role="menu"
    >
      {items.map((it, i) => it.divider ? (
        <div key={i} className="h-px bg-zinc-200 my-1" />
      ) : it.submenu ? (
        <div
          key={i}
          className="relative flex items-center justify-between px-3 py-2 hover:bg-zinc-100 cursor-default"
          onMouseEnter={() => {
            const r = wrapRef.current?.getBoundingClientRect?.();
            const y = (r?.top || 0) + 8 + i * 36;
            const x = (r?.right || 0) - 4;
            if (subRef.current) {
              const {left, top} = place(x, y, 220, 220);
              subRef.current.style.left = `${left}px`;
              subRef.current.style.top  = `${top}px`;
            }
          }}
        >
          <span>{it.label}</span>
          <span className="text-zinc-400">›</span>
          <div
            ref={subRef}
            className="fixed hidden group-hover:block"
            onMouseEnter={e => e.currentTarget.classList.remove("hidden")}
            onMouseLeave={e => e.currentTarget.classList.add("hidden")}
          >
            <div className="min-w-[220px] rounded-lg bg-white shadow-xl border border-zinc-200 overflow-hidden">
              {(it.submenu || []).map((s, j) => s.divider ? (
                <div key={j} className="h-px bg-zinc-200 my-1" />
              ) : (
                <button
                  key={j}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-100"
                  onClick={s.onClick}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          key={i}
          className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 ${it.danger ? "text-red-600" : ""}`}
          onClick={it.onClick}
        >
          <span>{it.label}</span>
          {it.kbd && <span className="text-xs text-zinc-400">{it.kbd}</span>}
        </button>
      ))}
    </div>
  );

  return portal ? React.createPortal(menu, portal) : null;
}
