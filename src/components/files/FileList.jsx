import React from 'react'


export default function FileList({files}){
return (
<div className="border rounded-2xl overflow-hidden bg-white">
<div className="grid grid-cols-12 px-3 py-2 text-xs text-zinc-500 border-b">
<div className="col-span-7">名称</div>
<div className="col-span-3">大小</div>
<div className="col-span-2 text-right">操作</div>
</div>
{files.map(f=> (
<div key={f.id} className="grid grid-cols-12 px-3 py-2 border-b last:border-none">
<div className="col-span-7 truncate">{f.name}</div>
<div className="col-span-3">{(f.size/1024).toFixed(1)} KB</div>
<div className="col-span-2 text-right">
<button className="text-xs px-2 py-1 border rounded">下载</button>
</div>
</div>
))}
</div>
)
}