import React from 'react'
import { NavLink } from 'react-router-dom'


const Item = ({to,children}) => (
<NavLink to={to} className={({isActive})=>
`block px-5 py-3 rounded-xl2 mx-3 my-1 ${isActive? 'bg-zinc-100 font-medium':'hover:bg-zinc-50'}`
}>{children}</NavLink>
)


export default function Sidebar(){
return (
<nav className="py-4">
<div className="px-5 pb-2 text-sm text-zinc-500">导航</div>
<Item to="/">文件</Item>
<Item to="/uploads">上传</Item>
<Item to="/search">搜索</Item>
<Item to="/recycle">回收站</Item>
<Item to="/settings">设置</Item>
</nav>
)
}