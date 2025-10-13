import React, { useCallback, useEffect, useRef, useState } from "react";
import useR2List from "../hooks/useR2List";
import { useStore } from "../app/store";
import ActionBar from "../components/ActionBar";
import RowActionButton from "../components/RowActionButton";
import PreviewModal from "../components/PreviewModal";
import FolderPickerDialog from "../components/FolderPickerDialog";
import { deleteR2, renameR2 } from "../utils/api";
import useMoveTask from "../hooks/useMoveTask";
import { formatBytes, formatDateTime } from "../utils/format";

const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function Home() {
  const {
    view,
    prefix,
    setPrefix,
    selected,
    toggleSelect,
    clearSelection,
    addTask,
    updateTask,
    setReloadList
  } = useStore();
  const { items, folders, loading, error, cursor, loadMore, reload } = useR2List(prefix);
  const [ctx, setCtx] = useState(null); // { key, x, y } 右键/长按菜单位置
  const [previewFile, setPreviewFile] = useState(null);
  const moveTask = useMoveTask();
  // —— 控制“移动到”弹窗的状态（批量/单个复用同一套逻辑）
  const [moveOpen, setMoveOpen] = useState(false);
  const [pendingMoveKeys, setPendingMoveKeys] = useState([]);
  const [moving, setMoving] = useState(false);

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

  // 将当前列表的刷新函数暴露给顶部栏，保持触发入口统一
  useEffect(() => {
    setReloadList(() => reload);
    return () => setReloadList(null);
  }, [reload, setReloadList]);

  const hasSelected = selected.length > 0;

  const handleCloseMenu = useCallback(() => setCtx(null), []);

  const handlePreview = useCallback((file) => {
    if (!file) return;
    setPreviewFile(file);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const handleDelete = useCallback(
    async (file) => {
      if (!file?.key) return;

      const id = uid();
      addTask({ id, name: `删除 ${file.key}`, status: "pending", pct: 0 });
      try {
        await deleteR2([file.key]);
        updateTask(id, { status: "done", pct: 100 });
        window.dispatchEvent(new CustomEvent("r2:reload"));
        clearSelection();
      } catch (e) {
        updateTask(id, { status: "error", error: String(e?.message || e) });
        alert(`删除失败：${String(e?.message || e)}`);
      }
    },
    [addTask, clearSelection, updateTask]
  );

  const handleRename = useCallback(
    async (file) => {
      if (!file?.key) return;

      const from = file.key;
      const oldName = from.split("/").pop();
      const input = prompt("输入新文件名（可包含子路径，相对当前目录）:", oldName);
      if (!input) return;

      const to = input.includes("/") ? input : from.replace(/[^/]+$/, input);

      const id = uid();
      addTask({ id, name: `重命名 ${oldName} → ${input}`, status: "pending", pct: 0 });
      try {
        await renameR2(from, to, { overwrite: false });
        updateTask(id, { status: "done", pct: 100 });
        window.dispatchEvent(new CustomEvent("r2:reload"));
        clearSelection();
      } catch (e) {
        updateTask(id, { status: "error", error: String(e?.message || e) });
        alert(`重命名失败：${String(e?.message || e)}`);
      }
    },
    [addTask, clearSelection, updateTask]
  );

  const handleMove = useCallback(
    (file) => {
      if (!file?.key || moving) return;
      setPendingMoveKeys([file.key]);
      setMoveOpen(true);
    },
    [moving]
  );

  const handleMoveConfirm = async (targetPrefix) => {
    const keys = pendingMoveKeys;
    setMoveOpen(false);
    setPendingMoveKeys([]);
    if (!keys.length || targetPrefix == null) return;

    setMoving(true);
    try {
      await moveTask({
        keys,
        targetPrefix,
        label: `移动 ${keys[0]} → ${targetPrefix || "/"}`,
      });
    } catch (e) {
      alert(`移动失败：${String(e?.message || e)}`);
    } finally {
      setMoving(false);
    }
  };

  const handleMoveCancel = () => {
    setMoveOpen(false);
    setPendingMoveKeys([]);
  };


  // hasSelected 已存在
  useEffect(() => {
    document.body.dataset.mode = selected.length > 0 ? 'select' : 'browse';
    return () => { delete document.body.dataset.mode; };
  }, [selected.length]);

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
    <div className="px-4 space-y-4 pb-6 lg:pb-8">
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
                onPreview={handlePreview}
                onRename={handleRename}
                onMove={handleMove}
                onDelete={handleDelete}
                onMenuClose={handleCloseMenu}
              />
            ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-zinc-200">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-zinc-50">
              <tr>
                <th className="w-8"></th>
                <th className="text-left p-2">文件名</th>
                <th className="text-left p-2 hidden md:table-cell">大小</th>
                <th className="text-left p-2 hidden md:table-cell">时间</th>
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
                  onPreview={handlePreview}
                  onRename={handleRename}
                  onMove={handleMove}
                  onDelete={handleDelete}
                  onMenuClose={handleCloseMenu}
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
      <FolderPickerDialog
        open={moveOpen}
        initialPrefix={prefix}
        onClose={handleMoveCancel}
        onConfirm={handleMoveConfirm}
      />
      <PreviewModal file={previewFile} open={Boolean(previewFile)} onClose={handleClosePreview} />
    </div>
  );
}

/** ------- 子组件：网格卡片 ------- */
function CardGrid({
  obj,
  isChecked,
  onToggle,
  onContext,
  bindLongPress,
  openFromContext,
  onPreview,
  onRename,
  onMove,
  onDelete,
  onMenuClose
}) {
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
        <RowActionButton
          obj={obj}
          openFromContext={openFromContext}
          onPreview={onPreview}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          onMenuClose={onMenuClose}
        />
      </div>
      <div className="aspect-video rounded-xl bg-zinc-100 mb-2" />
      <div className="text-sm font-medium truncate" title={obj.key}>{obj.key.split("/").pop()}</div>
      <div className="text-xs text-zinc-500">{formatBytes(obj.size)} · {formatDateTime(obj.uploaded)}</div>
    </div>
  );
}

/** ------- 子组件：列表行 ------- */
function RowList({
  obj,
  isChecked,
  onToggle,
  onContext,
  bindLongPress,
  openFromContext,
  onPreview,
  onRename,
  onMove,
  onDelete,
  onMenuClose
}) {
  const ref = useRef(null);
  useEffect(() => bindLongPress?.(ref.current, obj.key), [ref.current]);

  const displayName = obj?.key?.split("/").filter(Boolean).pop() || obj?.key;

  const onContextMenu = (e) => {
    e.preventDefault();
    onContext?.(e.clientX, e.clientY);
  };

  return (
    <tr ref={ref} className="border-t group" tabIndex={0} onContextMenu={onContextMenu}>
      <td className="p-2 align-top">
        <input type="checkbox" checked={isChecked} onChange={onToggle} title="选择" />
      </td>
      <td className="p-2" title={obj.key}>
        <div className="truncate font-medium text-zinc-700">{displayName}</div>
        {/* 移动端：把体积/时间信息折叠到名称下方，避免列宽不足时重叠 */}
        <div className="md:hidden mt-1 text-xs text-zinc-500 flex flex-wrap gap-x-2 gap-y-1">
          <span>{formatBytes(obj.size)}</span>
          <span>{formatDateTime(obj.uploaded)}</span>
        </div>
      </td>
      <td className="p-2 hidden md:table-cell">{formatBytes(obj.size)}</td>
      <td className="p-2 hidden md:table-cell">{formatDateTime(obj.uploaded)}</td>
      <td className="p-2 text-right align-top">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-block">
          <RowActionButton
            obj={obj}
            openFromContext={openFromContext}
            onPreview={onPreview}
            onRename={onRename}
            onMove={onMove}
            onDelete={onDelete}
            onMenuClose={onMenuClose}
          />
        </div>
      </td>
    </tr>
  );
}
