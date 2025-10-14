import React from 'react'

const baseSvgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 独立的图标组件，避免为了简单图标引入额外依赖
export function FilesIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      {...baseSvgProps}
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <path d="M8 4.5h4.3a1.5 1.5 0 0 1 1.06.44l3.2 3.2a1.5 1.5 0 0 1 .44 1.06V19.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5v-13A2 2 0 0 1 8 4.5Z" />
      <path d="M13 4.5V9a.5.5 0 0 0 .5.5H18" />
      <path d="M9.5 12.25h5" />
      <path d="M9.5 16h5" />
    </svg>
  )
}

export function UploadIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      {...baseSvgProps}
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <path d="M12 16V6.75" />
      <path d="m8.75 10.25 3.25-3.25 3.25 3.25" />
      <path d="M5.5 16.5V18a2.5 2.5 0 0 0 2.5 2.5h8A2.5 2.5 0 0 0 18.5 18v-1.5" />
    </svg>
  )
}

export function SearchIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      {...baseSvgProps}
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="5" />
      <path d="m15.5 15.5 3.75 3.75" />
    </svg>
  )
}

export function SettingsIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      {...baseSvgProps}
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <line x1="6" y1="4.5" x2="6" y2="19.5" />
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <line x1="18" y1="4.5" x2="18" y2="19.5" />
      <circle cx="6" cy="9.5" r="2.2" />
      <circle cx="12" cy="15" r="2.2" />
      <circle cx="18" cy="7.5" r="2.2" />
    </svg>
  )
}
