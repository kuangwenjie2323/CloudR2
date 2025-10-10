// ⚠️ 仅测试用途：浏览器直连 R2。后续改为服务端签名或 /api 代理。
export async function uploadToR2(file){
const access = import.meta.env.VITE_R2_ACCESS_KEY_ID
const secret = import.meta.env.VITE_R2_SECRET_ACCESS_KEY
const bucket = import.meta.env.VITE_R2_BUCKET_NAME
const account = import.meta.env.VITE_R2_ACCOUNT_ID


if(!access || !secret || !bucket || !account){
throw new Error('缺少 R2 环境变量，请先配置 .env')
}


const endpoint = `https://${account}.r2.cloudflarestorage.com/${bucket}/${encodeURIComponent(file.name)}`


const res = await fetch(endpoint, {
method: 'PUT',
headers: {
// 这里只是占位，真实场景应通过 V4 签名或临时凭证；
// 你后续会改成服务端生成签名 URL。
'Content-Type': file.type || 'application/octet-stream',
},
body: file
})


if(!res.ok){
throw new Error(`上传失败：${res.status}`)
}


return true
}