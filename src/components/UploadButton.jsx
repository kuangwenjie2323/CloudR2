import React, { useRef } from "react";
import { useStore } from "../app/store";
import { uploadToR2WithProgress } from "../utils/api";

const uuid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function UploadButton({ className = "" }) {
  const { prefix, addTask, updateTask } = useStore();
  const inputRef = useRef(null);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const id = uuid();
      addTask({ id, name: file.name, size: file.size, status: "pending", pct: 0, loaded: 0, total: file.size });

      uploadToR2WithProgress(file, {
        prefix,
        onProgress: ({ loaded, total, pct }) => {
          const now = Date.now();
          updateTask(id, { status: "uploading", loaded, total, pct });
        }
      })
        .then((res) => {
          updateTask(id, { status: "done", pct: 100, key: res.key });
        // ✅ 上传成功后通知页面刷新列表
          window.dispatchEvent(new CustomEvent("r2:reload"));
        })  
        .catch((err) => {
          updateTask(id, { status: "error", error: String(err?.message || err) });
        });
    }
    e.target.value = ""; // 允许重复选择同一文件
  };

  return (
    <>
      <button onClick={onPick} className={`px-4 py-2 rounded-full bg-sky-500 text-white shadow ${className}`}>
        上传
      </button>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={onChange} />
    </>
  );
}
