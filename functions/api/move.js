// functions/api/move.js
function getR2(env) {
  const g = env.R2 || env.R2_BUCKET || env["r2-explorer-bucket"] || env.r2;
  if (g && typeof g.put === "function") return g;
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") return v;
  }
  throw new Error("R2 binding not found.");
}

function bn(key) { return key.split("/").pop(); }
function dir(p = "") { return p.replace(/^\/+/, "").replace(/\/+$/, "") + "/"; }

function splitName(name) {
  const i = name.lastIndexOf(".");
  return i > 0 ? [name.slice(0, i), name.slice(i)] : [name, ""];
}

async function ensureUnique(R2, dstKey) {
  // 若目标不存在，直接用；否则 name → name (n)
  let k = dstKey;
  const exists = async (k) => !!(await R2.head(k));
  if (!(await exists(k))) return k;
  const d = k.lastIndexOf("/");
  const base = d >= 0 ? k.slice(0, d + 1) : "";
  const name = d >= 0 ? k.slice(d + 1) : k;
  const [b, ext] = splitName(name);
  let n = 1;
  while (n < 1000) {
    const cand = `${base}${b} (${n})${ext}`;
    if (!(await exists(cand))) return cand;
    n++;
  }
  // 兜底
  return `${base}${crypto.randomUUID()}-${name}`;
}

export const onRequestPost = async ({ request, env }) => {
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return new Response(JSON.stringify({ error: "Use application/json" }), { status: 400 });
  }
  const { keys, toPrefix, overwrite = false, flatten = true } = await request.json();
  if (!Array.isArray(keys) || keys.length === 0) {
    return new Response(JSON.stringify({ error: "keys must be array" }), { status: 400 });
  }
  const targetDir = dir(toPrefix || "");

  const R2 = getR2(env);
  const moved = [], skipped = [], errors = [];

  for (const k of keys) {
    try {
      const name = flatten ? bn(k) : k; // flatten=true：仅保留文件名
      let dst = targetDir + (flatten ? name : k.replace(/^\/*/, ""));
      if (!overwrite) dst = await ensureUnique(R2, dst);

      if (typeof R2.copy === "function") {
        // 优先用内部拷贝
        await R2.copy(k, dst);
      } else {
        const obj = await R2.get(k);
        if (!obj) { skipped.push({ key: k, reason: "not found" }); continue; }
        await R2.put(dst, obj.body, { httpMetadata: obj.httpMetadata, customMetadata: obj.customMetadata });
      }
      await R2.delete(k);
      moved.push({ from: k, to: dst });
    } catch (e) {
      errors.push({ key: k, error: String(e?.message || e) });
    }
  }

  return new Response(JSON.stringify({ moved, skipped, errors }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
