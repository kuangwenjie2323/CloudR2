import React, { useState } from 'react'
import { fuzzyMatch } from '../../utils/fuzzy'


export default function SearchBar(){
const [q, setQ] = useState('')
// 这里只渲染 UI；实际过滤放到文件列表 Hook 中
return (
<div className="relative">
<input
value={q}
onChange={e=>setQ(e.target.value)}
placeholder="搜索文件（支持通配符与模糊）"
className="w-full rounded-xl2 border bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
/>
{q && (
<div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{q.length}</div>
)}
</div>
)
}