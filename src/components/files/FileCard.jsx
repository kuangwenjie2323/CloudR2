import React from 'react'


export default function FileCard({f}){
return (
<div className="group rounded-2xl border bg-white p-3 shadow-soft hover:shadow-md transition">
<div className="aspect-video bg-zinc-100 rounded-xl mb-2" />
<div className="text-sm font-medium truncate">{f.name}</div>
<div className="text-xs text-zinc-500">{(f.size/1024).toFixed(1)} KB</div>
<div className="opacity-0 group-hover:opacity-100 transition mt-2 flex gap-2">
<button className="text-xs px-2 py-1 border rounded">预览</button>
<button className="text-xs px-2 py-1 border rounded">下载</button>
<button className="text-xs px-2 py-1 border rounded">更多</button>
</div>
</div>
)
}