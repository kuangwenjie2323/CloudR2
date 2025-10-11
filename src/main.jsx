export async function fetchR2List({ prefix = "", limit = 1000, cursor = null, delimiter = "/" } = {}) {
  const params = new URLSearchParams({ prefix, limit, delimiter });
  if (cursor) params.set("cursor", cursor);

  const resp = await fetch(`/api/list?${params.toString()}`, {
    headers: {
      "x-auth": localStorage.getItem("upload_token") || ""  // 简单示例
    }
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`List failed: ${resp.status} ${text}`);
    }
  return resp.json();
}
