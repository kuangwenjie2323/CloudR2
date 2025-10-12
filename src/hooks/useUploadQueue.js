import { useRef } from 'react'
import { useStore } from '../app/store'


// 提供 add/remove/update 接口；实际上传逻辑留给 utils/r2.js
export default function useUploadQueue(){
const { tasks, addTask, updateTask, removeTask } = useStore()
const nameToIdRef = useRef({})

function resolveId(name){
if (nameToIdRef.current[name]){
return nameToIdRef.current[name]
}
const task = tasks.find(t=> t.name===name)
return task?.id ?? name
}

function add(file){
const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
nameToIdRef.current[file.name] = id
addTask({ id, name:file.name, size:file.size, progress:0, status:'pending' })
}
function update(name, patch){
const id = resolveId(name)
updateTask(id, patch)
}
function remove(name){
const id = resolveId(name)
removeTask(id)
delete nameToIdRef.current[name]
}


return { tasks, add, update, remove }
}