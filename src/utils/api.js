// 未来切换到 Pages Functions /api/* 时，仅需改此文件
export async function listFiles(){
// return fetch('/api/list').then(r=>r.json())
return []
}


export function uploadToR2WithProgress(file, { prefix = "", onProgress = () => {} } = {}) {
  const token = localStorage.getItem("upload_token") || "";
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.setRequestHeader("x-auth", token);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress({ loaded: e.loaded, total: e.total, pct: e.loaded / e.total * 100 });
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
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

}
