// functions/api/upload.js

// —— 取 R2 绑定（自适配）
function getR2(env) {
  const guess = env.R2 || env.R2_BUCKET || env["r2-explorer-bucket"] || env.r2;
  if (guess && typeof guess.put === "function") return guess;
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") return v;
  }
  throw new Error("R2 binding not found.");
}

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

// —— 允许的 MIME（前缀 + 精确）
const ALLOW_PREFIX = ["image/", "video/", "audio/", "text/"];
const ALLOW_EXACT = new Set([
  "application/pdf",
  "application/zip",
  "application/x-7z-compressed",
  "application/json",
  "application/xml",
  "application/octet-stream",
]);

// —— 扩展名到 MIME 的简单映射（兜底）
function extToMime(ext) {
  switch ((ext || "").toLowerCase()) {
    case "html":
    case "htm":  return "text/html";
    case "css":  return "text/css";
    case "js":
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
  if (!ct) return true;                          // 没声明就当 octet-stream
  if (ALLOW_EXACT.has(ct)) return true;
  return ALLOW_PREFIX.some(p => ct.startsWith(p));
}

// —— 安全化文件名
function sanitizeName(name = "") {
  return (name || "")
    .replace(/[\x00-\x1F\x7F]/g, "")            // 控制字符
    .replace(/[<>:"\\|?*]+/g, "_")              // Windows 不允许
    .replace(/\s+/g, " ")                       // 压空白
    .replace(/^\/+/, "")                        // 去开头斜杠
    .slice(0, 255) || `unnamed-${Date.now()}`;
}

// —— 切分扩展名
function splitFileName(name) {
  const i = name.lastIndexOf(".");
  return i > 0 ? [name.slice(0, i), name.slice(i)] : [name, ""];
}

// —— 归一化前缀
function normPrefix(p = "") {
  const s = p.replace(/^\/+/, "").replace(/\/+$/, "");
  return s ? s + "/" : "";
}

// —— 用“当前目录 + 原文件名”构造 key
function makeKey(prefix, filename) {
  return normPrefix(prefix) + sanitizeName(filename);
}

// —— 若存在同名，自动编号为 name (n).ext
async function ensureUniqueKey(R2, key) {
  if (!(await R2.head(key))) return key;

  const slash = key.lastIndexOf("/");
  const dir = slash >= 0 ? key.slice(0, slash + 1) : "";
  const file = slash >= 0 ? key.slice(slash + 1) : key;
  const [stem, ext] = splitFileName(file);

  let n = 1;
  while (n < 1000) {
    const cand = `${dir}${stem} (${n})${ext}`;
    if (!(await R2.head(cand))) return cand;
    n++;
  }
  // 极端兜底
  return `${dir}${crypto.randomUUID?.() || Date.now()}-${file}`;
}

// —— 主处理：multipart 上传
export const onRequestPost = async ({ request, env }) => {
  // 1) 简单口令鉴权
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2) 校验表单类型
  const ct = request.headers.get("content-type") || "";
  if (!ct.startsWith("multipart/form-data")) {
    return new Response(JSON.stringify({ error: "Use multipart/form-data" }), { status: 400 });
  }

  // 3) 解析表单
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.stream !== "function") {
    return new Response(JSON.stringify({ error: "file field missing" }), { status: 400 });
  }

  const clientPrefix = (form.get("prefix") || "").toString();
  const origName = (form.get("filename") || file.name || "upload.bin").toString();
  let contentType = (form.get("contentType") || file.type || "application/octet-stream").toString();

  // 体积限制（可选）
  const declaredSize = form.get("size") ? Number(form.get("size")) : (file.size ?? undefined);
  if (declaredSize && declaredSize > MAX_BYTES) {
    return new Response(JSON.stringify({ error: `File too large (> ${MAX_BYTES} bytes)` }), { status: 413 });
  }

  // 4) MIME 白名单（不通过则试着按扩展名猜一次）
  if (!isAllowed(contentType)) {
    const guessed = extToMime((origName.split(".").pop() || "").toLowerCase());
    if (guessed) contentType = guessed;
  }
  if (!isAllowed(contentType)) {
    return new Response(JSON.stringify({ error: `MIME not allowed: ${contentType}` }), { status: 415 });
  }

  // 5) 对可脚本的文本类型强制附件下载，避免日后直链 XSS
  const risky = contentType.startsWith("text/html") ||
                contentType === "text/javascript" ||
                contentType === "text/css";
  const httpMetadata = risky
    ? { contentType, contentDisposition: `attachment; filename="${sanitizeName(origName)}"` }
    : { contentType };

  // 6) 生成 key：保留原文件名；若重名则自动编号
  const R2 = getR2(env);
  let key = makeKey(clientPrefix, origName);
  key = await ensureUniqueKey(R2, key);

  // 7) 存入 R2
  const putRes = await R2.put(key, file.stream(), {
    httpMetadata,
    customMetadata: {
      origName,
      uploadedBy: "pages-func",
      ts: String(Date.now()),
    },
  });

  // 8) 返回上传结果
  return new Response(JSON.stringify({
    key,
    size: putRes.size,
    etag: putRes.httpEtag,
    uploaded: new Date().toISOString(),
  }), { headers: { "content-type": "application/json; charset=utf-8" } });
};
