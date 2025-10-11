export async function fetchR2List({ prefix = "", limit = 1000, cursor = null, delimiter = "/" } = {}) {
  const params = new URLSearchParams({ prefix, limit, delimiter });
  if (cursor) params.set("cursor", cursor);

  const resp = await fetch(`/api/list?${params.toString()}`, {
    headers: { "x-auth": localStorage.getItem("upload_token") || "" }
  });
  if (!resp.ok) throw new Error(`List failed: ${resp.status} ${await resp.text()}`);
  return resp.json();
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

// 带进度条版本（XMLHttpRequest）
export function uploadToR2WithProgress(file, { prefix = "", onProgress = () => {} } = {}) {
  const token = localStorage.getItem("upload_token") || "";
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.setRequestHeader("x-auth", token);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress({ loaded: e.loaded, total: e.total, pct: e.loaded / e.total * 100 });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { reject(new Error("Bad JSON from /api/upload")); }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));

    const form = new FormData();
    form.append("file", file);
    form.append("filename", file.name || "upload.bin");
    form.append("contentType", file.type || "application/octet-stream");
    form.append("size", String(file.size || 0));
    form.append("prefix", prefix);
    xhr.send(form);
  });
}
