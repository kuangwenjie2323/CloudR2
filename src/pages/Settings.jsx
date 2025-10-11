import React, { useState, useEffect } from "react";

export default function Settings() {
  const [token, setToken] = useState("");
  useEffect(() => setToken(localStorage.getItem("upload_token") || ""), []);

  const save = () => {
    localStorage.setItem("upload_token", token.trim());
    alert("已保存。");
  };

  return (
    <div className="p-4 space-y-3">
      <div className="text-lg font-semibold">安全设置</div>
      <label className="block text-sm text-zinc-600">上传口令</label>
      <input
        className="w-full max-w-md px-3 py-2 rounded border border-zinc-300"
        value={token}
        onChange={e=>setToken(e.target.value)}
        placeholder="粘贴管理员提供的口令"
      />
      <div>
        <button onClick={save} className="px-4 py-2 rounded bg-zinc-900 text-white">保存</button>
      </div>
      <p className="text-xs text-zinc-500">用于 /api/upload 等敏感操作的鉴权。列表在开启 LIST_PUBLIC 后无需口令。</p>
    </div>
  );
}
