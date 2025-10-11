import React, { useEffect, useState } from "react";
import useR2List from "../hooks/useR2List";
import { useStore } from "../app/store";
import ActionBar from "../components/ActionBar";
import RowActionButton from "../components/RowActionButton";

const fmt = (n) => {
  if (n == null) return "-";
  const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0, x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(1)} ${u[i]}`;
};

export default function Home() {
  const { view, prefix, setPrefix, selected, toggleSelect } = useStore();
  const { items, folders, loading, error, cursor, loadMore, reload } = useR2List(prefix);
  const [ctx, setCtx] = useState(null); // { key, x, y } 右键菜单位置

  // 上传成功的统一刷新事件
  useEffect(() => {
    const h = () => reload();
    window.addEventListener("r2:reload", h);
    return () => window.removeEventListener("r2:reload", h);
  }, [reload, prefix]);

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="text-xl font-semibold">
          我的文件 <span className="text-zinc-400">{prefix || "/"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} className="px-3 py-1 rounded bg-zinc-200">刷新</button>
        </div>
      </header>

      {/* 批量操作条 */}
      <ActionBar items={items} />

      {/* 目录 */}
      {folders?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <button
              key={f.prefix}
              onClick={() => setPrefix(f.prefix)}
              className="px-3 py-2 rounded bg-zinc-100 hover:bg-zinc-200"
              title={f.prefix}
            >
              📁 {f.prefix.replace(prefix, "")}
            </button>
          ))}
          {prefix && (
            <button
              onClick={() => {
                const up = prefix.split("/").slice(0, -2).join("/");
                setPrefix(up ? up + "/" : "");
              }}
              className="px-3 py-2 rounded bg-zinc-100 hover:bg-zinc-200"
            >
              ⬆ 上级
            </button>
          )}
        </div>
      )}

      {/* 文件 */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((o) => (
            <div
              key={o.key}
              className="relative rounded-2xl p-3 bg-white shadow-sm border border-zinc-100 group"
              onContextMenu={(e) => { e.preventDefault(); setCtx({ key: o.key, x: e.clientX, y: e.clientY }); }}
            >
              <input
                type="checkbox"
                className="absolute top-2 left-2 w-4 h-4"
                checked={selected.includes(o.key)}
                onChange={() => toggleSelect(o.key)}
                title="选择"
              />
              {/* 顶角三点（hover 才出现） */}
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <RowActionButton
                  obj={o}
                  openFromContext={ctx?.key === o.key ? { x: ctx.x, y: ctx.y } : null}
                />
              </div>

              <div className="aspect-video rounded-xl bg-zinc-100 mb-2" />
              <div className="text-sm font-medium truncate" title={o.key}>
                {o.key.split("/").pop()}
              </div>
              <div className="text-xs text-zinc-500">
                {fmt(o.size)} · {new Date(o.uploaded).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="w-8"></th>
                <th className="text-left p-2">文件名</th>
                <th className="text-left p-2">大小</th>
                <th className="text-left p-2">时间</th>
                <th className="text-right p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr
                  key={o.key}
                  className="border-t group"
                  tabIndex={0}
                  onContextMenu={(e) => { e.preventDefault(); setCtx({ key: o.key, x: e.clientX, y: e.clientY }); }}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(o.key)}
                      onChange={() => toggleSelect(o.key)}
                      title="选择"
                    />
                  </td>
                  <td className="p-2 truncate" title={o.key}>{o.key}</td>
                  <td className="p-2">{fmt(o.size)}</td>
                  <td className="p-2">{new Date(o.uploaded).toLocaleString()}</td>
                  <td className="p-2 text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                      <RowActionButton
                        obj={o}
                        openFromContext={ctx?.key === o.key ? { x: ctx.x, y: ctx.y } : null}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 翻页 / 状态 */}
      <div className="flex items-center gap-3">
        {cursor && <button onClick={loadMore} className="px-3 py-1 rounded bg-zinc-200">加载更多</button>}
        {loading && <span className="text-zinc-500">加载中…</span>}
        {error && <span className="text-red-600 text-sm">加载失败：{String(error.message || error)}</span>}
      </div>
    </div>
  );
}
