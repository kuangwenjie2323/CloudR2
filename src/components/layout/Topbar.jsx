import React from 'react'
import SearchBar from '../search/SearchBar'
import Button from '../common/Button'
import { useStore } from '../../app/store'
import UploadButton from "../UploadButton.jsx";

export default function Topbar() {
  const { view, setView } = useStore()

  return (
    <div className="px-3 sm:px-6 py-3">
      {/* 使用响应式网格确保搜索栏在移动端占满一行，在桌面端居中对齐 */}
      <div className="grid gap-3 sm:grid-cols-[auto,minmax(0,1fr),auto] sm:items-center">
        <div className="text-lg font-semibold">Cloud Files</div>
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="whitespace-nowrap">
            {view === 'grid' ? '列表视图' : '网格视图'}
          </Button>
          <UploadButton className="h-9 px-3 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
