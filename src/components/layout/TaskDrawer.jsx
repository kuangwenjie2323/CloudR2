import React, { useState } from 'react'
import { useStore } from '../../app/store'


export default function TaskDrawer(){
const { tasks } = useStore()
const [open, setOpen] = useState(false)
const pct = tasks.length? Math.round(
tasks.reduce((a,t)=>a + (t.progress||0),0) / tasks.length
):0


return (
<div className="fixed bottom-16 right-3 sm:right-6 z-50">
<button onClick={()=>setOpen(!open)} className="px-4 py-2 rounded-full shadow-soft bg-white border">
任务 {pct}%
</button>


{open && (
<div className="mt-2 w-[320px] max-w-[90vw] p-3 rounded-2xl shadow-soft bg-white border">
<div className="font-medium mb-2">任务队列</div>
<div className="space-y-2 max-h-80 overflow-auto">
{tasks.length===0 && <div className="text-sm text-zinc-500">暂无任务</div>}
{tasks.map((t,i)=> (
<div key={i} className="p-2 border rounded-xl">
<div className="text-sm">{t.name}</div>
<div className="h-2 bg-zinc-100 rounded mt-1">
<div className="h-2 bg-primary rounded" style={{width:`${t.progress||0}%`}}/>
</div>
<div className="text-xs text-zinc-500 mt-1">{t.speed || '--'} · ETA {t.eta || '--'}</div>
</div>
))}
</div>
</div>
)}
</div>
)
}