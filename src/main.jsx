import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/index.css";

// —— API 函数集中导入并挂到 window（方便控制台调试）
import { fetchR2List, uploadToR2, uploadToR2WithProgress } from "./utils/api.js";
if (typeof window !== "undefined") {
  Object.assign(window, { fetchR2List, uploadToR2, uploadToR2WithProgress });
}

// —— 恢复 Router（解决 “Cannot destructure 'future' … is null”）
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* react-router v6 的 BrowserRouter 也接受 future 标志 */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
