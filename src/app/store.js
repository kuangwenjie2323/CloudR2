// 轻量全局状态（可替换为 Zustand/Recoil；此处保持零依赖）
import { createContext, useContext, useMemo, useState } from 'react'


const Ctx = createContext()


export function Provider({ children }){
const [view, setView] = useState('grid') // 'list' | 'grid'
const [tasks, setTasks] = useState([]) // 上传/下载任务


const api = useMemo(()=>({ view, setView, tasks, setTasks }),[view,tasks])
return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}


export const useStore = () => useContext(Ctx)