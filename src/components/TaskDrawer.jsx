import React, { useMemo, useState } from "react";
import { useStore } from "../app/store";

const fmtPct = (n=0) => `${Math.min(100, Math.max(0, n)).toFixed(0)}%`;

export default function TaskDrawer() {
  const { tasks, clearDone } = useStore();
  const [open, setOpen] = useState(true);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    const uploading = tasks.filter(t => t.status === "uploading").length;
    return { total, done, uploading };
  }, [tasks]);

  return (
    <div className="fixed right-4 bottom-4">
      <button onClick={()=>setOpen(!open)} className="px-3 py-2 rounded-full bg-zinc-900 text-white shadow">
        任务 {stats.done}/{stats.total}
      </button>

      {open && (
        <div className="mt-2 w-80 max-h-[60vh] overflow-auto rounded-2xl bg-white shadow-2xl border border-zinc-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-zinc-500">进行中 {stats.uploading} · 完成 {stats.done}</div>
            <button onClick={clearDone} className="text-xs px-2 py-1 bg-zinc-100 rounded">清除完成</button>
          </div>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="p-2 rounded-lg border border-zinc-200">
                <div className="text-sm font-medium truncate">{t.name}</div>
                <div className="h-2 bg-zinc-100 rounded mt-1 overflow-hidden">
                  <div className={`h-full ${t.status==="error"?"bg-red-500":"bg-emerald-500"}`} style={{ width: fmtPct(t.pct) }} />
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {t.status === "error" ? `失败：${t.error}` :
                   t.status === "done" ? "已完成" :
                   `上传中 ${fmtPct(t.pct)}`}
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-sm text-zinc-400 text-center py-6">暂无任务</div>}
          </div>
        </div>
      )}
    </div>
  );
}
