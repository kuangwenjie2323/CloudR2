// functions/api/mkdir.js
function getR2(env) {
  const g = env.R2 || env.R2_BUCKET || env["r2-explorer-bucket"] || env.r2;
  if (g && typeof g.put === "function") return g;
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") return v;
  }
  throw new Error("R2 binding not found.");
}

function normPrefix(p = "") {
  return p.replace(/^\/+/, "").replace(/\/+$/, "") + "/";
}

export const onRequestPost = async ({ request, env }) => {
  // 简单口令鉴权（与 upload/delete 一致）
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return new Response(JSON.stringify({ error: "Use application/json" }), { status: 400 });
  }

  const { prefix } = await request.json();
  if (!prefix) return new Response(JSON.stringify({ error: "prefix required" }), { status: 400 });

  const dir = normPrefix(prefix);
  const key = `${dir}.keep`; // 占位对象；前端/后端列表会把它隐藏
  const R2 = getR2(env);
  await R2.put(key, new Uint8Array(0), {
    httpMetadata: { contentType: "application/octet-stream" },
    customMetadata: { folder: "1" },
  });

  return new Response(JSON.stringify({ created: dir }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
