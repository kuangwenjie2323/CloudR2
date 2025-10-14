import React, { useCallback, useMemo, useState } from "react";
import { useStore } from "../app/store";

export const clampPct = (n = 0) => Math.min(100, Math.max(0, n));
export const formatPct = (n = 0) => `${clampPct(n).toFixed(0)}%`;

/**
 * 粒度拆分：任务浮窗由按钮 + 弹层组成，方便后续替换其一。
 */
export default function TaskDrawer() {
  const { tasks, clearDone } = useStore();
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const uploading = tasks.filter((t) => t.status === "uploading").length;
    return { total, done, uploading };
  }, [tasks]);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleClearDone = useCallback(() => {
    if (stats.done > 0) {
      clearDone();
    }
  }, [clearDone, stats.done]);

  return (
    <div className="task-pill flex flex-col items-end gap-3">
      {open && (
        <TaskPanel
          tasks={tasks}
          stats={stats}
          onClearDone={handleClearDone}
        />
      )}
      <TaskToggleButton stats={stats} open={open} onToggle={handleToggle} />
    </div>
  );
}

function TaskToggleButton({ stats, open, onToggle }) {
  /**
   * 任务胶囊主按钮：控制弹层显示，并展示任务完成度。
   */
  return (
    <button
      type="button"
      onClick={onToggle}
      className="px-4 py-2 rounded-full bg-zinc-900 text-white shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-colors"
      aria-expanded={open}
      aria-label="切换任务面板"
    >
      任务 {stats.done}/{stats.total}
    </button>
  );
}

function TaskPanel({ tasks, stats, onClearDone }) {
  const hasTasks = tasks.length > 0;

  return (
    <div
      className="w-[min(90vw,22rem)] max-h-[60vh] overflow-auto rounded-2xl bg-white shadow-2xl shadow-zinc-900/10 border border-zinc-200 p-4"
      role="dialog"
      aria-label="上传任务列表"
    >
      <header className="flex items-center justify-between mb-3">
        <div className="text-sm text-zinc-500">
          进行中 {stats.uploading} · 完成 {stats.done}
        </div>
        <button
          type="button"
          onClick={onClearDone}
          className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-50"
          disabled={stats.done === 0}
        >
          清除完成
        </button>
      </header>

      <div className="space-y-3">
        {hasTasks ? (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
        ) : (
          <div className="text-sm text-zinc-400 text-center py-10">暂无任务</div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task }) {
  /**
   * 单条任务行：含名称、进度条和状态描述。
   */
  const isError = task.status === "error";
  const isDone = task.status === "done";
  const barColor = isError ? "bg-red-500" : "bg-emerald-500";

  return (
    <div className="p-3 rounded-xl border border-zinc-200">
      <div className="text-sm font-medium truncate" title={task.name}>
        {task.name}
      </div>
      <div className="h-2 bg-zinc-100 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ease-out ${barColor}`}
          style={{ width: formatPct(task.pct) }}
        />
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        {isError
          ? `失败：${task.error}`
          : isDone
          ? "已完成"
          : `上传中 ${formatPct(task.pct)}`}
      </div>
    </div>
  );
}
