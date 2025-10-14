import React from 'react'
import { NavLink } from 'react-router-dom'
import { bottomNavItems } from './bottomNavConfig'

const Tab = ({ to, label, Icon }) => {
  const baseClass = 'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs leading-none transition-colors'
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `${baseClass} ${isActive ? 'text-sky-600 font-medium' : 'text-zinc-500 font-normal'}`
      }
    >
      {/* 图标继承文字颜色，视觉层级更紧凑 */}
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t glass pb-[env(safe-area-inset-bottom)]"
      aria-label="底部导航"
    >
      {/* 固定高度与 Safe Area 补丁，避免被系统手势遮挡 */}
      <div className="flex min-h-[var(--tabbar-h)] items-stretch">
        {bottomNavItems.map((tab) => (
          <Tab key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  )
}
