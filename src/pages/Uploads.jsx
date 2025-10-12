import React from 'react'
import { useStore } from '../app/store'


export default function Uploads(){
const { tasks } = useStore()
return (
<div>
<div className="text-lg font-semibold mb-3">上传任务</div>
<div className="space-y-2">
{tasks.length===0 && <div className="text-sm text-zinc-500">暂无任务</div>}
{tasks.map((t,i)=> (
<div key={i} className="p-3 border rounded-xl bg-white">
<div className="font-medium text-sm">{t.name}</div>
<div className="h-2 bg-zinc-100 rounded mt-1">
<div className="h-2 bg-zinc-900 rounded" style={{width:`${t.progress||0}%`}}/>
</div>
</div>
))}
</div>
</div>
)
}
