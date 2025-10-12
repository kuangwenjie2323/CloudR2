import React, { useEffect, useRef, useState } from "react";
import useR2List from "../hooks/useR2List";
import { useStore } from "../app/store";
import ActionBar from "../components/ActionBar";
import RowActionButton from "../components/RowActionButton";

const fmt = (n) => {
  if (n == null) return "-";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(1)} ${u[i]}`;
};

export default function Home() {
  const { view, setView, prefix, setPrefix, selected, toggleSelect } = useStore();
  const { items, folders, loading, error, cursor, loadMore, reload } = useR2List(prefix);
  const [ctx, setCtx] = useState(null); // { key, x, y } 右键/长按菜单位置

  // 100vh 兼容：iOS 地址栏折叠/展开导致高度漂移
  useEffect(() => {
    const setVhVar = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVhVar();
    window.addEventListener("resize", setVhVar);
    return () => window.removeEventListener("resize", setVhVar);
  }, []);

  // 监听“上传成功”的刷新事件
  useEffect(() => {
    const h = () => reload();
    window.addEventListener("r2:reload", h);
    return () => window.removeEventListener("r2:reload", h);
  }, [reload, prefix]);

  const hasSelected = selected.length > 0;

  // 长按辅助：移动端 300ms 长按打开 RowActionButton（模拟右键）
  const bindLongPress = (el, key) => {
    if (!el) return;
    let t;
    const onStart = () => {
      t = setTimeout(() => {
        const r = el.getBoundingClientRect();
        setCtx({ key, x: r.left + r.width / 2, y: r.top + 32 });
      }, 300);
    };
    const onEnd = () => clearTimeout(t);
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  };

  return (
    <div className="px-4 pb-safe space-y-4">
      {/* 顶部栏：左标题 + 右侧刷新/视图切换 */}
      <header className="sticky top-0 z-10 -mx-4 px-4 py-3 md:py-0 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* 移动端：用图标跳转到搜索页 */}
            <button
              onClick={() => (window.location.hash = "#/search")}
              className="px-3 py-1 rounded bg-zinc-200 md:hidden"
              aria-label="搜索"
              title="搜索"
            >🔍</button>

            {/* ≥md：再显示真正的搜索输入/组件（你以后可以在 Search.jsx 里封装一个输入组件） */}
            <div className="hidden md:block w-[240px]">
              {/* 这里先留空位或挂你的 SearchInput 组件 */}
            </div>

            <button onClick={reload} className="px-3 py-1 rounded bg-zinc-200">刷新</button>
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="px-3 py-1 rounded bg-zinc-200"
              title="切换视图"
            >
              {view === "grid" ? "列表视图" : "网格视图"}
            </button>
          </div>

          <div className="text-lg font-semibold">
            我的文件 <span className="text-zinc-400">{prefix || "/"}</span>
          </div>
        </div>
      </header>

      {/* 桌面端：内联批量操作条；移动端：底部抽屉（见文末） */}
      <div className="hidden md:block">
        <ActionBar items={items} />
      </div>

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
              onClick={() =>
                setPrefix(prefix.split("/").slice(0, -2).join("/") + (prefix.includes("/") ? "/" : ""))
              }
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
            <CardGrid
              key={o.key}
              obj={o}
              isChecked={selected.includes(o.key)}
              onToggle={() => toggleSelect(o.key)}
              onContext={(x, y) => setCtx({ key: o.key, x, y })}
              bindLongPress={bindLongPress}
              openFromContext={ctx?.key === o.key ? { x: ctx.x, y: ctx.y } : null}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-zinc-200">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-zinc-50">
              <tr>
                <th className="w-8"></th>
                <th className="text-left p-2 w-[52vw]">文件名</th>
                <th className="text-left p-2">大小</th>
                <th className="text-left p-2">时间</th>
                <th className="text-right p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <RowList
                  key={o.key}
                  obj={o}
                  isChecked={selected.includes(o.key)}
                  onToggle={() => toggleSelect(o.key)}
                  onContext={(x, y) => setCtx({ key: o.key, x, y })}
                  bindLongPress={bindLongPress}
                  openFromContext={ctx?.key === o.key ? { x: ctx.x, y: ctx.y } : null}
                />
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

      {/* 移动端底部抽屉版 ActionBar（避免挡底部导航/任务胶囊） */}
      <div
        className={[
          "md:hidden fixed left-0 right-0 bottom-drawer z-40 transition-transform duration-200",
          hasSelected ? "translate-y-0" : "translate-y-[110%]"
        ].join(" ")}
        aria-hidden={!hasSelected}
      >
        <div className="mx-3 mb-3 rounded-2xl border border-zinc-200 bg-white shadow-lg p-3">
          <div className="text-sm text-zinc-500 mb-2">已选 {selected.length} 项</div>
          <ActionBar items={items} />
        </div>
      </div>
    </div>
  );
}

/** ------- 子组件：网格卡片 ------- */
function CardGrid({ obj, isChecked, onToggle, onContext, bindLongPress, openFromContext }) {
  const ref = useRef(null);
  useEffect(() => bindLongPress?.(ref.current, obj.key), [ref.current]);

  const onContextMenu = (e) => {
    e.preventDefault();
    onContext?.(e.clientX, e.clientY);
  };

  return (
    <div
      ref={ref}
      className="relative rounded-2xl p-3 bg-white shadow-sm border border-zinc-100 group"
      onContextMenu={onContextMenu}
    >
      <input
        type="checkbox"
        className="absolute top-2 left-2 w-4 h-4"
        checked={isChecked}
        onChange={onToggle}
        title="选择"
      />
      {/* 顶角三点（hover 才出现；移动端靠长按） */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <RowActionButton obj={obj} openFromContext={openFromContext} />
      </div>
      <div className="aspect-video rounded-xl bg-zinc-100 mb-2" />
      <div className="text-sm font-medium truncate" title={obj.key}>{obj.key.split("/").pop()}</div>
      <div className="text-xs text-zinc-500">{fmt(obj.size)} · {new Date(obj.uploaded).toLocaleString()}</div>
    </div>
  );
}

/** ------- 子组件：列表行 ------- */
function RowList({ obj, isChecked, onToggle, onContext, bindLongPress, openFromContext }) {
  const ref = useRef(null);
  useEffect(() => bindLongPress?.(ref.current, obj.key), [ref.current]);

  const onContextMenu = (e) => {
    e.preventDefault();
    onContext?.(e.clientX, e.clientY);
  };

  return (
    <tr ref={ref} className="border-t group" tabIndex={0} onContextMenu={onContextMenu}>
      <td className="p-2">
        <input type="checkbox" checked={isChecked} onChange={onToggle} title="选择" />
      </td>
      <td className="p-2 truncate max-w-[52vw]" title={obj.key}>{obj.key}</td>
      <td className="p-2">{fmt(obj.size)}</td>
      <td className="p-2">{new Date(obj.uploaded).toLocaleString()}</td>
      <td className="p-2 text-right">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-block">
          <RowActionButton obj={obj} openFromContext={openFromContext} />
        </div>
      </td>
    </tr>
  );
}
