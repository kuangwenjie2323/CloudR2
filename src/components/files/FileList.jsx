import React from "react";
import FileName from "./FileName";

export default function FileList({ files }) {
  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <div className="grid grid-cols-12 border-b px-3 py-2 text-xs text-zinc-500">
        <div className="col-span-7">名称</div>
        <div className="col-span-3">大小</div>
        <div className="col-span-2 text-right">操作</div>
      </div>
      {files.map((file) => {
        const sizeLabel = `${(file.size / 1024).toFixed(1)} KB`;
        return (
          <div
            key={file.id}
            className="grid grid-cols-12 border-b px-3 py-2 last:border-none"
          >
            <FileName
              name={file.name}
              className="col-span-7 text-sm"
              title={file.name}
            />
            <div className="col-span-3 text-sm text-zinc-600">{sizeLabel}</div>
            <div className="col-span-2 text-right">
              {/* 名称统一由 FileName 处理，按钮区保持原样，便于扩展。 */}
              <button className="text-xs px-2 py-1 border rounded">下载</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
