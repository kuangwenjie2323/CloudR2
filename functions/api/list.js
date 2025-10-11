export const onRequestGet = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // 可选查询参数：?prefix=folder/&limit=1000&cursor=xxx&delimiter=/
  const prefix = url.searchParams.get("prefix") || "";
  const limit = Math.min(Number(url.searchParams.get("limit") || 1000), 1000);
  const cursor = url.searchParams.get("cursor") || undefined;
  // delimiter 默认 "/"，这样能拿到 "虚拟目录"
  const delimiter = url.searchParams.get("delimiter") ?? "/";

  // 认证（可选：列表通常可匿名，如果你要保护目录，就要求 token）
  const token = request.headers.get("x-auth");
  if (env.UPLOAD_TOKEN && token !== env.UPLOAD_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const listOptions = { prefix, limit, cursor };
  if (delimiter) listOptions.delimiter = delimiter;

  const res = await env.R2.list(listOptions);

  // res: { objects, delimitedPrefixes, truncated, cursor }
  const objects = (res.objects || []).map(obj => ({
    key: obj.key,
    size: obj.size,
    etag: obj.httpEtag,
    uploaded: obj.uploaded.toISOString(),
    customMetadata: obj.customMetadata || {},
  }));

  // 目录（delimitedPrefixes）做成 "folders"
  const folders = (res.delimitedPrefixes || []).map(p => ({
    prefix: p
  }));

  return new Response(JSON.stringify({
    prefix,
    delimiter: delimiter || null,
    objects,
    folders,
    truncated: !!res.truncated,
    cursor: res.cursor || null
  }), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
