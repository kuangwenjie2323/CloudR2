import React from "react";
import FileName from "./FileName";

export default function FileCard({ f }) {
  const sizeLabel = `${(f.size / 1024).toFixed(1)} KB`;

  return (
    <div className="group rounded-2xl border bg-white p-3 shadow-soft transition hover:shadow-md">
      <div className="aspect-video rounded-xl bg-zinc-100 mb-2" />
      <FileName
        name={f.name}
        className="text-sm font-medium"
        title={f.name}
      />
      <div className="text-xs text-zinc-500">{sizeLabel}</div>
      <div className="opacity-0 group-hover:opacity-100 transition mt-2 flex gap-2">
        {/* 复用 FileName 后，操作区保持不变，仅为示例按钮。 */}
        <button className="text-xs px-2 py-1 border rounded">预览</button>
        <button className="text-xs px-2 py-1 border rounded">下载</button>
        <button className="text-xs px-2 py-1 border rounded">更多</button>
      </div>
    </div>
  );
}
