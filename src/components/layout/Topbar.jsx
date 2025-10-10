import React from 'react'
import SearchBar from '../search/SearchBar'
import Button from '../common/Button'
import { useStore } from '../../app/store'


export default function Topbar(){
const { view, setView } = useStore()
return (
<div className="flex items-center gap-3 px-3 sm:px-6 py-3">
<div className="text-lg font-semibold">Cloud Files</div>
<div className="flex-1 max-w-3xl mx-auto"><SearchBar /></div>
<div className="flex items-center gap-2">
<Button onClick={()=>setView(view==='grid'?'list':'grid')}>
{view==='grid'?'列表视图':'网格视图'}
</Button>
<Button intent="primary">上传</Button>
</div>
</div>
)
}