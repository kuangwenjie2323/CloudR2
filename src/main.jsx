import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/index.css";

// —— 把全局状态 Provider 包回入口（修复 useContext null）
import { Provider } from "./app/store.jsx"; // 如果你的 store 在 src/app/store.jsx，则改成 "./app/store.jsx"

// —— API 函数集中导入并挂到 window（方便控制台调试）
import { fetchR2List, uploadToR2, uploadToR2WithProgress } from "./utils/api.js";
if (typeof window !== "undefined") {
  Object.assign(window, { fetchR2List, uploadToR2, uploadToR2WithProgress });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 注意：BrowserRouter 不要传 future 标志；那个是给 RouterProvider 的 */}
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
