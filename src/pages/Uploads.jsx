import React from "react";
import { useStore } from "../app/store";
import { formatPct } from "../components/TaskDrawer";

export default function Uploads() {
  const { tasks } = useStore();

  return (
    <div>
      <div className="text-lg font-semibold mb-3">上传任务</div>
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="text-sm text-zinc-500">暂无任务</div>
        )}
        {tasks.map((task, index) => (
          <div key={index} className="p-3 border rounded-xl bg-white">
            <div className="font-medium text-sm">{task.name}</div>
            <div className="h-2 bg-zinc-100 rounded mt-1 overflow-hidden">
              <div
                className="h-2 bg-zinc-900 rounded transition-all duration-200"
                // 与任务浮窗共享的格式化逻辑，确保进度展示一致
                style={{ width: formatPct(task.pct ?? 0) }}
              />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {formatPct(task.pct ?? 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
