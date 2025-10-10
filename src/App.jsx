import React from 'react'
import RoutesView from './app/routes'
import Topbar from './components/layout/Topbar'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import TaskDrawer from './components/layout/TaskDrawer'


export default function App() {
return (
<div className="min-h-screen grid lg:grid-cols-[240px_1fr]">
{/* Desktop sidebar */}
<aside className="hidden lg:block bg-white shadow-soft">
<Sidebar />
</aside>


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