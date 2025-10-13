import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import Button from "../common/Button";
import { useStore } from "../../app/store";
import UploadButton from "../UploadButton.jsx";

// 路由 -> 顶部栏展示配置映射，方便集中维护不同页面的标题与控件
const ROUTE_CONFIG = {
  "/": {
    title: "我的文件",
    showPath: true,
    showMobileSearchShortcut: true,
    showReload: true,
    showViewToggle: true,
    searchBarClassName: "hidden sm:block w-full sm:max-w-3xl sm:mx-auto",
  },
  "/search": {
    title: "搜索",
    searchBarClassName: "w-full sm:max-w-3xl sm:mx-auto",
  },
  "/uploads": {
    title: "上传任务",
  },
  "/recycle": {
    title: "回收站",
  },
  "/settings": {
    title: "设置",
  },
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { view, setView, prefix, reloadList } = useStore();

  const config = useMemo(() => {
    return ROUTE_CONFIG[location.pathname] || { title: "Cloud Files" };
  }, [location.pathname]);

  const handleReload = () => {
    if (typeof reloadList === "function") {
      reloadList();
    }
  };

  return (
    <div className="px-3 sm:px-6 py-3">
      {/* 使用响应式网格确保搜索栏在移动端占满一行，在桌面端居中对齐 */}
      <div className="grid gap-3 sm:grid-cols-[auto,minmax(0,1fr),auto] sm:items-center">
        <div className="flex items-center gap-2 min-w-0">
          {config.showMobileSearchShortcut && (
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="sm:hidden px-3 py-1.5 rounded-xl text-sm font-medium bg-white border border-zinc-200 shadow-soft"
              aria-label="搜索"
              title="搜索"
            >
              🔍
            </button>
          )}
          <div className="text-lg font-semibold truncate">
            <span>{config.title}</span>
            {config.showPath && (
              <span className="ml-2 text-sm font-normal text-zinc-400 truncate align-middle">
                {prefix || "/"}
              </span>
            )}
          </div>
        </div>
        <div className={config.searchBarClassName || "w-full sm:max-w-3xl sm:mx-auto"}>
          {config.searchBarClassName !== undefined && <SearchBar />}
        </div>
        <div className="flex items-center gap-2 justify-end">
          {config.showReload && (
            <Button onClick={handleReload}>
              刷新
            </Button>
          )}
          {config.showViewToggle && (
            <Button onClick={() => setView(view === "grid" ? "list" : "grid")} className="whitespace-nowrap">
              {view === "grid" ? "列表视图" : "网格视图"}
            </Button>
          )}
          <UploadButton className="h-9 px-3 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
