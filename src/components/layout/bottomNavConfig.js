import { FilesIcon, UploadIcon, SearchIcon, SettingsIcon } from './BottomNavIcons'

// 配置式定义，便于在不同场景重用或拓展底部导航
export const bottomNavItems = [
  { to: '/', label: '文件', Icon: FilesIcon },
  { to: '/uploads', label: '上传', Icon: UploadIcon },
  { to: '/search', label: '搜索', Icon: SearchIcon },
  { to: '/settings', label: '设置', Icon: SettingsIcon },
]
