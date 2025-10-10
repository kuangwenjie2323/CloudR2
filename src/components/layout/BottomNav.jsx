import React from 'react'
import { NavLink } from 'react-router-dom'

const Tab = ({to,label}) => (
  <NavLink to={to} className={({isActive})=>
    `flex-1 text-center py-3 ${isActive? 'font-medium':'text-zinc-500'}`
  }>{label}</NavLink>
)

export default function BottomNav(){
  return (
    <div className="glass border-t">
      <div className="flex">
        <Tab to="/" label="文件"/>
        <Tab to="/uploads" label="上传"/>
        <Tab to="/search" label="搜索"/>
        <Tab to="/settings" label="设置"/>
      </div>
    </div>
  )
}