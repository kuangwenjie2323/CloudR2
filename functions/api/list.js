function getR2(env) {
  // 优先常见命名，其次自动探测（适配你现在的 r2-explorer-bucket）
  const guess = env.R2 || env.R2_BUCKET || env.r2 || env.r2_bucket || env["r2-explorer-bucket"];
  if (guess && typeof guess.list === "function") return guess;

  // 自动探测：找一个拥有 list/get/put 的对象
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") {
      return v;
    }
  }
  throw new Error("R2 binding not found. Check Pages → Settings → Functions → Bindings.");
}

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix") || "";
  const limit = Math.min(Number(url.searchParams.get("limit") || 1000), 1000);
  const cursor = url.searchParams.get("cursor") || undefined;
  const delimiter = url.searchParams.get("delimiter") ?? "/";

  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const R2 = getR2(env);
  const res = await R2.list({ prefix, limit, cursor, delimiter });

  const objects = (res.objects || []).map(o => ({
    key: o.key,
    size: o.size,
    etag: o.httpEtag,
    uploaded: o.uploaded.toISOString(),
    customMetadata: o.customMetadata || {}
  }));
  const folders = (res.delimitedPrefixes || []).map(p => ({ prefix: p }));

  return new Response(JSON.stringify({
    prefix, delimiter: delimiter || null, objects, folders,
    truncated: !!res.truncated, cursor: res.cursor || null
  }), { headers: { "content-type": "application/json; charset=utf-8" } });
};
