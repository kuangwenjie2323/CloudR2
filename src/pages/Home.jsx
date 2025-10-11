import React, { useEffect } from "react";
import useR2List from "../hooks/useR2List";
import { useStore } from "../app/store";
import ActionBar from "../components/ActionBar";

const fmt = (n) => {
  if (n == null) return "-";
  const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0, x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(1)} ${u[i]}`;
};

export default function Home() {
  const { view, setView, prefix, setPrefix, selected, toggleSelect } = useStore();
  const { items, folders, loading, error, cursor, loadMore, reload } = useR2List(prefix);

  // 监听“上传成功”的刷新事件；不要在这里再调用 useStore()
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
          <button onClick={() => setView("grid")} className={`px-3 py-1 rounded ${view === "grid" ? "bg-zinc-900 text-white" : "bg-zinc-200"}`}>网格</button>
          <button onClick={() => setView("list")} className={`px-3 py-1 rounded ${view === "list" ? "bg-zinc-900 text-white" : "bg-zinc-200"}`}>列表</button>
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
              onClick={() => setPrefix(prefix.split("/").slice(0, -2).join("/") + (prefix.includes("/") ? "/" : ""))}
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
            <div key={o.key} className="relative rounded-2xl p-3 bg-white shadow-sm border border-zinc-100">
              <input
                type="checkbox"
                className="absolute top-2 left-2 w-4 h-4"
                checked={selected.includes(o.key)}
                onChange={() => toggleSelect(o.key)}
                title="选择"
              />
              <div className="aspect-video rounded-xl bg-zinc-100 mb-2" />
              <div className="text-sm font-medium truncate" title={o.key}>{o.key.split("/").pop()}</div>
              <div className="text-xs text-zinc-500">{fmt(o.size)} · {new Date(o.uploaded).toLocaleString()}</div>
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
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.key} className="border-t">
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
