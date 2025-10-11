// 自适配 R2 绑定
function getR2(env) {
  const guess = env.R2 || env.R2_BUCKET || env.r2 || env.r2_bucket || env["r2-explorer-bucket"];
  if (guess && typeof guess.put === "function") return guess;
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") {
      return v;
    }
  }
  throw new Error("R2 binding not found.");
}

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

// 放宽策略：允许常见前缀 + 若干精确类型
const ALLOW_PREFIX = ["image/", "video/", "audio/", "text/"];
const ALLOW_EXACT = new Set([
  "application/pdf",
  "application/zip",
  "application/x-7z-compressed",
  "application/json",
  "application/xml",
  "application/octet-stream",
]);

// 额外做一次按扩展名猜测
function extToMime(ext) {
  switch (ext) {
    case "html": return "text/html";
    case "htm":  return "text/html";
    case "css":  return "text/css";
    case "js":   return "text/javascript";
    case "mjs":  return "text/javascript";
    case "txt":  return "text/plain";
    case "md":   return "text/markdown";
    case "csv":  return "text/csv";
    case "json": return "application/json";
    case "xml":  return "application/xml";
    default:     return null;
  }
}

function isAllowed(ct) {
  if (!ct) return true; // 空类型放过，按 octet-stream 存
  if (ALLOW_EXACT.has(ct)) return true;
  return ALLOW_PREFIX.some(p => ct.startsWith(p));
}

function sanitizeName(name) {
  return (name || "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/^\/+/, "")
    .replace(/\s+/g, " ")
    .replace(/[<>:"\\|?*]+/g, "_")
    .slice(0, 255) || `unnamed-${Date.now()}`;
}

function makeKey(prefix, filename) {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const safe = sanitizeName(filename);
  const uid = crypto.randomUUID();
  const cleanPrefix = prefix ? prefix.replace(/^\/+/, "").replace(/\/+$/, "") + "/" : "";
  return `${cleanPrefix}${y}/${m}/${day}/${uid}-${safe}`;
}

export const onRequestPost = async ({ request, env }) => {
  // 简单口令认证
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
  if (!file?.stream) {
    return new Response(JSON.stringify({ error: "file field missing" }), { status: 400 });
  }

  const clientPrefix = (form.get("prefix") || "").toString();
  const origName = (form.get("filename") || file.name || "upload.bin").toString();
  let contentType = (form.get("contentType") || file.type || "application/octet-stream").toString();

  const declaredSize = form.get("size") ? Number(form.get("size")) : (file.size ?? undefined);
  if (declaredSize && declaredSize > MAX_BYTES) {
    return new Response(JSON.stringify({ error: `File too large (> ${MAX_BYTES} bytes)` }), { status: 413 });
  }

  // 若不被允许，尝试按扩展名推断一次
  if (!isAllowed(contentType)) {
    const ext = origName.split(".").pop()?.toLowerCase() || "";
    const guessed = extToMime(ext);
    if (guessed) contentType = guessed;
  }

  if (!isAllowed(contentType)) {
    return new Response(JSON.stringify({ error: `MIME not allowed: ${contentType}` }), { status: 415 });
  }

  // 对“可执行/可脚本”的文本类型（html/js/css）强制浏览器下载，避免将来直链预览引起 XSS
  const risky = contentType.startsWith("text/html") || contentType === "text/javascript" || contentType === "text/css";
  const downloadName = sanitizeName(origName);
  const httpMetadata = risky
    ? { contentType, contentDisposition: `attachment; filename="${downloadName}"` }
    : { contentType };

  const key = makeKey(clientPrefix, origName);
  const R2 = getR2(env);
  const putRes = await R2.put(key, file.stream(), {
    httpMetadata,
    customMetadata: { origName, uploadedBy: "pages-func", ts: String(Date.now()) }
  });

  return new Response(JSON.stringify({
    key, size: putRes.size, etag: putRes.httpEtag, uploaded: new Date().toISOString()
  }), { headers: { "content-type": "application/json; charset=utf-8" } });
};
