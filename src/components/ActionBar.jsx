import React, { useMemo, useState } from "react";
import { useStore } from "../app/store";
import { deleteR2, renameR2 } from "../utils/api";
import { mkdirR2 } from "../utils/api";
import useMoveTask from "../hooks/useMoveTask";
import FolderPickerDialog from "./FolderPickerDialog";

const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function ActionBar({ items = [], variant = "desktop", className = "" }) {
  const { prefix, selected, selectAll, clearSelection, addTask, updateTask } = useStore();
  const [busy, setBusy] = useState(false);
  // —— 批量移动：弹出文件夹选择器的显隐
  const [moveOpen, setMoveOpen] = useState(false);
  const moveTask = useMoveTask();

  // 当前可全选的 key 列表（只针对“文件”，不含目录 chip）
  const allKeys = useMemo(() => items.map(o => o.key), [items]);

  // —— 全选按钮：第一次点击全选；若已经全选，再次点击就是“取消全选”
  const handleToggleSelectAll = () => {
    if (selected.length === allKeys.length) {
      clearSelection();
    } else {
      selectAll(allKeys);
    }
  };

  const handleCancel = () => clearSelection();

  const handleDelete = async () => {
    if (selected.length === 0 || busy) return;
    setBusy(true);
    try {
      for (const key of selected) {
        const id = uid();
        addTask({ id, name: `删除 ${key}`, status: "pending", pct: 0 });
        try {
          await deleteR2([key]);
          updateTask(id, { status: "done", pct: 100 });
        } catch (e) {
          updateTask(id, { status: "error", error: String(e?.message || e) });
        }
      }
      window.dispatchEvent(new CustomEvent("r2:reload"));
      clearSelection();
    } finally { setBusy(false); }
  };

  const handleRename = async () => {
    if (selected.length !== 1 || busy) return;
    const from = selected[0];
    const oldName = from.split("/").pop();
    const input = prompt("输入新文件名（可包含子路径，相对当前目录）:", oldName);
    if (!input) return;

    // 生成目标 key：若输入包含 '/' 则尊重；否则保留目录只改文件名
    let to = input.includes("/") ? input : from.replace(/[^/]+$/, input);

    const id = uid();
    setBusy(true);
    addTask({ id, name: `重命名 ${oldName} → ${input}`, status: "pending", pct: 0 });
    try {
      await renameR2(from, to, { overwrite: false });
      updateTask(id, { status: "done", pct: 100 });
      window.dispatchEvent(new CustomEvent("r2:reload"));
      clearSelection();
    } catch (e) {
      updateTask(id, { status: "error", error: String(e?.message || e) });
      alert(`重命名失败：${String(e?.message || e)}`);
    } finally { setBusy(false); }
  };

  const handleMoveClick = () => {
    if (selected.length === 0 || busy) return;
    setMoveOpen(true);
  };

  const handleMoveConfirm = async (targetPrefix) => {
    const keys = [...selected];
    setMoveOpen(false);
    if (!keys.length || targetPrefix == null) return;

    setBusy(true);
    try {
      await moveTask({
        keys,
        targetPrefix,
        label: `移动 ${keys.length} 项 → ${targetPrefix || "/"}`,
      });
    } catch (e) {
      alert(`移动失败：${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleMoveCancel = () => {
    setMoveOpen(false);
  };

  const handleMkdir = async () => {
    const name = prompt("新建文件夹名（可多级路径，例如 a/b/c）", "");
    if (!name) return;
    setBusy(true);
    const id = uid();
    const p = (prefix || "") + name; // 在当前前缀之下新建
    addTask({ id, name: `新建文件夹 ${p}`, status: "pending", pct: 0 });
    try {
      await mkdirR2(p);
      updateTask(id, { status: "done", pct: 100 });
      window.dispatchEvent(new CustomEvent("r2:reload"));
    } catch (e) {
      updateTask(id, { status: "error", error: String(e?.message || e) });
      alert(`创建失败：${String(e?.message || e)}`);
    } finally { setBusy(false); }
  };

  if (selected.length === 0 && allKeys.length === 0) return null;

  // —— 根据调用场景（桌面/移动抽屉）调整外层样式
  const isDesktopVariant = variant === "desktop";
  const containerClassName = [
    isDesktopVariant
      ? "sticky top-16 z-30 mx-4 mb-2 p-2 rounded-xl border bg-white shadow flex items-center gap-2"
      : "flex flex-wrap items-center gap-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={containerClassName}>
        {isDesktopVariant && <div className="text-sm">已选 {selected.length} 项</div>}
        <button onClick={handleToggleSelectAll} className="px-2 py-1 rounded bg-zinc-100">
          {selected.length === allKeys.length ? "取消全选" : "全选"}
        </button>
        <button onClick={handleMkdir} disabled={busy} className="px-3 py-1 rounded bg-zinc-100 disabled:opacity-50">新建文件夹</button>
        <button onClick={handleMoveClick} disabled={busy || selected.length === 0} className="px-3 py-1 rounded bg-zinc-100 disabled:opacity-50">移动到</button>
        <button onClick={handleRename} disabled={busy || selected.length !== 1} className="px-3 py-1 rounded bg-zinc-900 text-white disabled:opacity-50">重命名</button>
        <button onClick={handleDelete} disabled={busy || selected.length === 0} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50">删除</button>
        <button onClick={handleCancel} className="ml-auto px-2 py-1 rounded bg-zinc-100">取消</button>
      </div>
      <FolderPickerDialog
        open={moveOpen}
        initialPrefix={prefix}
        onClose={handleMoveCancel}
        onConfirm={handleMoveConfirm}
      />
    </>
  );
}
