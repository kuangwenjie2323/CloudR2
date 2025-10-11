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

const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const ALLOW_TYPES = [
  "image/png","image/jpeg","image/webp","image/gif",
  "video/mp4","video/webm","audio/mpeg","audio/mp3","audio/aac","audio/wav",
  "application/pdf","text/plain","application/zip","application/x-7z-compressed"
];

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
  if (!file?.stream) return new Response(JSON.stringify({ error: "file field missing" }), { status: 400 });

  const clientPrefix = (form.get("prefix") || "").toString();
  const origName = (form.get("filename") || file.name || "upload.bin").toString();
  const contentType = (form.get("contentType") || file.type || "application/octet-stream").toString();

  if (!ALLOW_TYPES.includes(contentType)) {
    return new Response(JSON.stringify({ error: `MIME not allowed: ${contentType}` }), { status: 415 });
  }
  const declaredSize = form.get("size") ? Number(form.get("size")) : (file.size ?? undefined);
  if (declaredSize && declaredSize > MAX_BYTES) {
    return new Response(JSON.stringify({ error: `File too large (> ${MAX_BYTES} bytes)` }), { status: 413 });
  }

  const key = makeKey(clientPrefix, origName);
  const R2 = getR2(env);
  const putRes = await R2.put(key, file.stream(), {
    httpMetadata: { contentType },
    customMetadata: { origName, uploadedBy: "pages-func", ts: String(Date.now()) }
  });

  return new Response(JSON.stringify({
    key, size: putRes.size, etag: putRes.httpEtag, uploaded: new Date().toISOString()
  }), { headers: { "content-type": "application/json; charset=utf-8" } });
};
