// src/components/common/Button.jsx
import React from 'react'

export default function Button({ children, intent = 'default', ...props }) {
  const base =
    'px-3 py-1.5 rounded-xl text-sm font-medium transition border shadow-soft'
  const style =
    intent === 'primary'
      ? 'bg-primary text-white hover:bg-sky-600'
      : 'bg-white hover:bg-zinc-100 text-zinc-700'
  return (
    <button {...props} className={`${base} ${style}`}>
      {children}
    </button>
  )
}
