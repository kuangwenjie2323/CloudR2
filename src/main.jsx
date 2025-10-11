import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// 如果有全局样式就保留这行（没有就删掉）
import "./styles/index.css";

// —— 从工具模块导入 API 函数
import { fetchR2List, uploadToR2, uploadToR2WithProgress } from "./utils/api.js";

// —— 为了方便控制台调试，挂到 window；同时也防止被 tree-shaking 掉
if (typeof window !== "undefined") {
  Object.assign(window, { fetchR2List, uploadToR2, uploadToR2WithProgress });
}

// —— 挂载 React 应用（这是你页面空白的根因）
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
