import React from 'react'
import RoutesView from './app/routes'
import Topbar from './components/layout/Topbar'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import TaskDrawer from './components/layout/TaskDrawer'
import UploadButton from "./components/UploadButton.jsx";
import TaskDrawer from "./components/TaskDrawer.jsx";
import { fetchR2List, uploadToR2, uploadToR2WithProgress } from "./utils/api";

export default function App() {
return (
<div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-zinc-200 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Cloud Files</div>
          <div className="flex items-center gap-2">
            <UploadButton />
          </div>
        </div>
      </header>


<main className="flex flex-col">
<div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
<Topbar />
</div>


<section className="flex-1 p-3 sm:p-6">
<RoutesView />
</section>


{/* Mobile bottom nav */}
<div className="lg:hidden sticky bottom-0 z-40">
<BottomNav />
</div>
</main>


{/* Floating task drawer */}
<TaskDrawer />
</div>
)
}
