// functions/api/rename.js
function getR2(env) {
  const g = env.R2 || env.R2_BUCKET || env["r2-explorer-bucket"] || env.r2;
  if (g && typeof g.put === "function") return g;
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") return v;
  }
  throw new Error("R2 binding not found.");
}
function sanitizeKey(k = "") {
  return k.replace(/^\/*/, "").replace(/[\x00-\x1F\x7F]/g, "");
}

export const onRequestPost = async ({ request, env }) => {
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return new Response(JSON.stringify({ error: "Use application/json" }), { status: 400 });
  }
  const { from, to, overwrite = false } = await request.json();
  if (!from || !to) return new Response(JSON.stringify({ error: "from/to required" }), { status: 400 });

  const src = sanitizeKey(from);
  const dst = sanitizeKey(to);
  if (src === dst) return new Response(JSON.stringify({ error: "same key" }), { status: 400 });

  const R2 = getR2(env);
  const obj = await R2.get(src);
  if (!obj) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });

  if (!overwrite) {
    const head = await R2.head(dst);
    if (head) return new Response(JSON.stringify({ error: "target exists" }), { status: 409 });
  }

  await R2.put(dst, obj.body, {
    httpMetadata: obj.httpMetadata,
    customMetadata: obj.customMetadata
  });
  await R2.delete(src);

  return new Response(JSON.stringify({ from: src, to: dst }), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
