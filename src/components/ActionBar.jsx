import React, { useState } from "react";
import { useStore } from "../app/store";
import { deleteR2, renameR2 } from "../utils/api";

const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function ActionBar({ items = [] }) {
  const { selected, clearSelection, selectAll, addTask, updateTask } = useStore();
  const [busy, setBusy] = useState(false);

  const handleSelectAll = () => selectAll(items.map(o => o.key));
  const handleCancel = () => clearSelection();

  const handleDelete = async () => {
    if (selected.length === 0 || busy) return;
    setBusy(true);
    try {
      // 逐个做任务，方便展示进度
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
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async () => {
    if (selected.length !== 1 || busy) return;
    const from = selected[0];
    const oldName = from.split("/").pop();
    const input = prompt("输入新文件名（可带路径，相对当前目录）:", oldName);
    if (!input) return;

    // 生成目标 key：同目录 + 新名（如果用户填了 / 则尊重其路径）
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
    } finally {
      setBusy(false);
    }
  };

  if (selected.length === 0) return null;

  return (
    <div className="sticky top-16 z-30 mx-4 mb-2 p-2 rounded-xl border bg-white shadow flex items-center gap-2">
      <div className="text-sm">已选 {selected.length} 项</div>
      <button onClick={handleSelectAll} className="px-2 py-1 rounded bg-zinc-100">全选</button>
      <button onClick={handleDelete} disabled={busy} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50">删除</button>
      <button onClick={handleRename} disabled={busy || selected.length !== 1} className="px-3 py-1 rounded bg-zinc-900 text-white disabled:opacity-50">重命名</button>
      <button onClick={handleCancel} className="ml-auto px-2 py-1 rounded bg-zinc-100">取消</button>
    </div>
  );
}
