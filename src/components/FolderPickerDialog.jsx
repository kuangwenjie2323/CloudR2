import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useR2List from "../hooks/useR2List";
import { mkdirR2 } from "../utils/api";

const normalizePrefix = (value = "") => {
  const trimmed = value.replace(/^\/+/g, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const buildNewFolderPrefix = (base, name) => {
  const cleaned = name.trim().replace(/^\/+/g, "").replace(/\/+/g, "/");
  const withoutTrailing = cleaned.replace(/\/+$/g, "");
  if (!withoutTrailing) return null;
  const basePrefix = base ? (base.endsWith("/") ? base : `${base}/`) : "";
  return `${basePrefix}${withoutTrailing}/`;
};

export default function FolderPickerDialog({ open, initialPrefix = "", onClose, onConfirm }) {
  const [current, setCurrent] = useState(normalizePrefix(initialPrefix));
  const [newFolder, setNewFolder] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const { folders, loading, error, reload } = useR2List(current);

  useEffect(() => {
    if (open) {
      setCurrent(normalizePrefix(initialPrefix));
      setNewFolder("");
      setCreateError("");
    }
  }, [open, initialPrefix]);

  const listError = useMemo(
    () => (error ? String(error?.message || error) : ""),
    [error]
  );

  const crumbs = useMemo(() => {
    const parts = current.split("/").filter(Boolean);
    const acc = [];
    parts.forEach((part, idx) => {
      const prefix = `${parts.slice(0, idx + 1).join("/")}/`;
      acc.push({ label: part, prefix });
    });
    return acc;
  }, [current]);

  const handleCreate = async () => {
    if (!newFolder.trim() || creating) return;
    const targetPrefix = buildNewFolderPrefix(current, newFolder);
    if (!targetPrefix) {
      setCreateError("请输入有效的文件夹名称");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      await mkdirR2(targetPrefix);
      setNewFolder("");
      await reload();
    } catch (e) {
      setCreateError(`创建失败：${String(e?.message || e)}`);
    } finally {
      setCreating(false);
    }
  };

  const confirmSelection = () => {
    onConfirm?.(current);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="选择目标文件夹">
      <div className="flex flex-col gap-4 text-sm text-zinc-700">
        <div className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <span>当前位置：</span>
          <button
            type="button"
            onClick={() => setCurrent("")}
            className={`rounded px-2 py-1 hover:bg-zinc-100 ${current ? "" : "bg-zinc-200 text-zinc-900"}`}
          >
            根目录
          </button>
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.prefix}>
              <span>/</span>
              <button
                type="button"
                onClick={() => setCurrent(crumb.prefix)}
                className={`rounded px-2 py-1 hover:bg-zinc-100 ${idx === crumbs.length - 1 ? "bg-zinc-200 text-zinc-900" : ""}`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col gap-2 max-h-64 overflow-auto border border-zinc-200 rounded-lg p-2">
          {loading && <div className="text-center text-zinc-400">加载中...</div>}
          {listError && !loading && (
            <div className="text-center text-red-500">加载失败：{listError}</div>
          )}
          {!loading && !listError && folders.length === 0 && (
            <div className="text-center text-zinc-400">此目录暂无子文件夹</div>
          )}
          {!loading && !listError &&
            folders.map((folder) => (
              <button
                key={folder.prefix}
                type="button"
                onClick={() => setCurrent(folder.prefix)}
                className="flex items-center gap-2 rounded px-3 py-2 text-left hover:bg-zinc-100"
                title={folder.prefix}
              >
                <span role="img" aria-label="folder">📁</span>
                <span>{folder.prefix.slice(current.length) || folder.prefix}</span>
              </button>
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-500" htmlFor="newFolderInput">在当前目录下新建文件夹</label>
          <div className="flex items-center gap-2">
            <input
              id="newFolderInput"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="文件夹名称"
              className="flex-1 rounded border border-zinc-200 px-3 py-2"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newFolder.trim()}
              className="rounded bg-zinc-900 px-3 py-2 text-white disabled:opacity-50"
            >
              新建
            </button>
          </div>
          {createError && <div className="text-xs text-red-500">{createError}</div>}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={confirmSelection}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            移动到这里
          </button>
        </div>
      </div>
    </Modal>
  );
}
