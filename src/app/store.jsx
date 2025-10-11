import { createContext, useContext, useMemo, useState } from "react";

// 给一个安全默认值，避免 Provider 不在时解构崩溃
const defaultCtx = {
  view: "grid",
  setView: () => {},
  tasks: [],
  setTasks: () => {},
};

const Ctx = createContext(defaultCtx);

export function Provider({ children }) {
  const [view, setView] = useState("grid"); // 'grid' | 'list'
  const [tasks, setTasks] = useState([]);   // 上传/下载任务数组

  const api = useMemo(() => ({ view, setView, tasks, setTasks }), [view, tasks]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
