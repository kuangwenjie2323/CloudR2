import React from 'react'


export default function Settings(){
return (
<div className="space-y-3">
<div className="text-lg font-semibold">设置</div>
<ul className="list-disc pl-5 text-sm text-zinc-600">
<li>主题：浅色/深色（后续在 useTheme 中实现）</li>
<li>R2：凭证、安全提示、切换到 API 代理</li>
<li>外观：网格密度、缩略图大小</li>
</ul>
</div>
)
}