// 简易模糊匹配；后续可换 fuse.js 或自研索引
export function fuzzyMatch(text, pattern){
if(!pattern) return true
// 支持通配符 * ?
const esc = s=> s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const re = new RegExp('^' + pattern.split('*').map(p=> esc(p).replace(/\\\?/g,'.')).join('.*') + '$', 'i')
return re.test(text)
}