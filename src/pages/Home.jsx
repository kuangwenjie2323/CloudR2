import React from 'react'
import { useStore } from '../app/store'
import ViewToggle from '../components/files/ViewToggle'
import FileGrid from '../components/files/FileGrid'
import FileList from '../components/files/FileList'
import useFiles from '../hooks/useFiles'


export default function Home(){
const { view } = useStore()
const { files } = useFiles()


return (
<div className="space-y-3">
<div className="flex items-center justify-between">
<div className="text-lg font-semibold">我的文件</div>
<ViewToggle />
</div>
{view==='grid' ? <FileGrid files={files}/> : <FileList files={files}/>}
</div>
)
}