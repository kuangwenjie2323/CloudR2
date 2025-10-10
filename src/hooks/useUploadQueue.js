import { useStore } from '../app/store'


// 提供 add/remove/update 接口；实际上传逻辑留给 utils/r2.js
export default function useUploadQueue(){
const { tasks, setTasks } = useStore()


function add(file){
setTasks(prev=>[...prev, { name:file.name, size:file.size, progress:0 }])
}
function update(name, patch){
setTasks(prev=> prev.map(t=> t.name===name? {...t,...patch}:t))
}
function remove(name){
setTasks(prev=> prev.filter(t=> t.name!==name))
}


return { tasks, add, update, remove }
}