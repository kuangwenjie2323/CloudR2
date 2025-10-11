// functions/api/delete.js
function getR2(env) {
  const g = env.R2 || env.R2_BUCKET || env["r2-explorer-bucket"] || env.r2;
  if (g && typeof g.delete === "function") return g;
  for (const [k, v] of Object.entries(env)) {
    if (v && typeof v.list === "function" && typeof v.get === "function" && typeof v.put === "function") return v;
  }
  throw new Error("R2 binding not found.");
}

export const onRequestPost = async ({ request, env }) => {
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return new Response(JSON.stringify({ error: "Use application/json" }), { status: 400 });
  }
  const { keys } = await request.json();
  if (!Array.isArray(keys) || keys.length === 0) {
    return new Response(JSON.stringify({ error: "keys must be a non-empty array" }), { status: 400 });
  }
  if (keys.length > 1000) {
    return new Response(JSON.stringify({ error: "Too many keys (<=1000)" }), { status: 400 });
  }
  const R2 = getR2(env);
  await R2.delete(keys);
  return new Response(JSON.stringify({ deleted: keys.length }), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
