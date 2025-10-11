const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB 示例：根据你实际限制调整
const ALLOW_TYPES = [
  "image/png","image/jpeg","image/webp","image/gif",
  "video/mp4","video/webm","audio/mpeg","audio/mp3","audio/aac","audio/wav",
  "application/pdf","text/plain","application/zip","application/x-7z-compressed"
];

function sanitizeName(name) {
  // 去掉控制字符、去除前导“/”、把空白压缩、保留常用可见字符
  const base = name.replace(/[\x00-\x1F\x7F]/g, "")
                   .replace(/^\/+/, "")
                   .replace(/\s+/g, " ")
                   .replace(/[<>:"\\|?*]+/g, "_")
                   .slice(0, 255);
  return base || `unnamed-${Date.now()}`;
}

function makeKey(prefix, filename) {
  // 生成 {yyyy}/{mm}/{dd}/uuid-安全名 结构，或用你自己的路径策略
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const safe = sanitizeName(filename);
  const uid = crypto.randomUUID();
  const cleanPrefix = prefix ? prefix.replace(/^\/+/, "").replace(/\/+$/, "") + "/" : "";
  return `${cleanPrefix}${y}/${m}/${day}/${uid}-${safe}`;
}

export const onRequestPost = async (context) => {
  const { request, env } = context;

  // 认证（最简口令头；可替换为 JWT 校验）
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const ct = request.headers.get("content-type") || "";
  if (!ct.startsWith("multipart/form-data")) {
    return new Response(JSON.stringify({ error: "Use multipart/form-data" }), { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.stream !== "function") {
    return new Response(JSON.stringify({ error: "file field missing" }), { status: 400 });
  }

  const clientPrefix = (form.get("prefix") || "").toString();
  const origName = (form.get("filename") || file.name || "upload.bin").toString();
  const contentType = (form.get("contentType") || file.type || "application/octet-stream").toString();

  if (!ALLOW_TYPES.includes(contentType)) {
    return new Response(JSON.stringify({ error: `MIME not allowed: ${contentType}` }), { status: 415 });
  }

  const sizeHeader = form.get("size");
  const declaredSize = sizeHeader ? Number(sizeHeader) : (file.size ?? undefined);
  if (declaredSize && declaredSize > MAX_BYTES) {
    return new Response(JSON.stringify({ error: `File too large (> ${MAX_BYTES} bytes)` }), { status: 413 });
  }

  const key = makeKey(clientPrefix, origName);

  // 可选：重复名策略（同目录同名可按你需要查询/拒绝/重命名）
  // 这里我们用了 uuid 前缀，天然避免重复覆盖

  // 写入 R2（可流式）
  const putOptions = {
    httpMetadata: { contentType },
    customMetadata: {
      origName: origName,
      uploadedBy: "pages-func",
      ts: String(Date.now()),
    }
  };

  // 注意：如果你希望强制校验 MD5，可传 customMetadata + 服务器端再做校验（自行实现）
  const putRes = await env.R2.put(key, file.stream(), putOptions);

  return new Response(JSON.stringify({
    key,
    size: putRes.size,
    etag: putRes.httpEtag,
    uploaded: new Date().toISOString(),
  }), { headers: { "content-type": "application/json; charset=utf-8" } });
};
