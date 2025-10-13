import React from 'react'
import RoutesView from './app/routes'
import Topbar from './components/layout/Topbar'
import BottomNav from './components/layout/BottomNav'

// ✅ 只保留这一条：我们写的任务浮窗
import TaskDrawer from "./components/TaskDrawer.jsx"

// 可留：上传按钮（你已在 Header 用）
import UploadButton from "./components/UploadButton.jsx"

// 若 App.jsx 里没直接用到这些 API，可以把这行删掉（不影响功能）
/* import { fetchR2List, uploadToR2, uploadToR2WithProgress } from "./utils/api" */

export default function App() {
  return (
    <div className="app bg-zinc-50">
      <main className="app-main flex flex-col">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
          <Topbar />
        </div>

        <section className="flex-1 min-h-0 p-3 sm:p-6">
          <RoutesView />
        </section>

        <div className="lg:hidden sticky bottom-0 z-40">
          <BottomNav />
        </div>
      </main>

      {/* 浮动任务抽屉 */}
      <TaskDrawer />
    </div>
  )
}
