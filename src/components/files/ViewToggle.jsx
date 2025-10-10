import React from 'react'
import { useStore } from '../../app/store'


export default function ViewToggle(){
const { view, setView } = useStore()
return (
<div className="inline-flex border rounded-xl overflow-hidden">
<button onClick={()=>setView('grid')} className={`px-3 py-1 ${view==='grid'?'bg-zinc-100':''}`}>网格</button>
<button onClick={()=>setView('list')} className={`px-3 py-1 ${view==='list'?'bg-zinc-100':''}`}>列表</button>
</div>
)
}