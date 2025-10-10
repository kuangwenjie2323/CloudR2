import React from 'react'
import FileCard from './FileCard'


export default function FileGrid({files}){
return (
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
{files.map(f=> <FileCard key={f.id} f={f} />)}
</div>
)
}