import React from 'react'
import { NavLink } from 'react-router-dom'

const Tab = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex-1 text-center text-sm py-3 ${isActive ? "font-medium" : "text-zinc-500"}`
    }
  >
    {label}
  </NavLink>
)

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t glass pb-[env(safe-area-inset-bottom)]"
      aria-label="底部导航"
    >
      {/* 固定高度和 Safe Area 内边距，避免与系统手势冲突 */}
      <div className="flex h-[var(--tabbar-h)] items-stretch">
        <Tab to="/" label="文件" />
        <Tab to="/uploads" label="上传" />
        <Tab to="/search" label="搜索" />
        <Tab to="/settings" label="设置" />
      </div>
    </nav>
  )
}
