// 未来切换到 Pages Functions /api/* 时，仅需改此文件
export async function listFiles(){
// return fetch('/api/list').then(r=>r.json())
return []
}


export async function uploadToR2(file, { prefix = "" } = {}) {
  const token = localStorage.getItem("upload_token") || "";
  const form = new FormData();
  form.append("file", file);
  form.append("filename", file.name || "upload.bin");
  form.append("contentType", file.type || "application/octet-stream");
  form.append("size", String(file.size || 0));
  form.append("prefix", prefix);

  const resp = await fetch("/api/upload", {
    method: "POST",
    headers: { "x-auth": token },
    body: form
  });
  if (!resp.ok) throw new Error(`Upload failed: ${resp.status} ${await resp.text()}`);
  return resp.json();
}
