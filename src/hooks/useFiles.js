import { useEffect, useState } from 'react'


// 初期使用假数据；后续替换为 R2 列表接口
export default function useFiles(){
const [files, setFiles] = useState([])
useEffect(()=>{
const mock = Array.from({length: 12}).map((_,i)=> ({
id: i+1,
name: `示例文件_${i+1}.png`,
size: 8_192 + i*1_024,
}))
setFiles(mock)
},[])
return { files }
}