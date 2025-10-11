import { createContext, useContext, useMemo, useState } from "react";

// 任务结构：{ id, name, size, status: 'pending'|'uploading'|'done'|'error', pct, loaded, total, speed, key?, error? }
const defaultCtx = {
  view: "grid", setView: () => {},
  prefix: "", setPrefix: () => {},
  tasks: [], addTask: () => {}, updateTask: () => {}, removeTask: () => {}, clearDone: () => {},
};

const Ctx = createContext(defaultCtx);

export function Provider({ children }) {
  const [view, setView] = useState("grid");
  const [prefix, setPrefix] = useState(""); // 形如 "photos/2025/"
  const [tasks, setTasks] = useState([]);

  const addTask = (t) => setTasks((xs) => [...xs, t]);
  const updateTask = (id, patch) =>
    setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeTask = (id) => setTasks((xs) => xs.filter((x) => x.id !== id));
  const clearDone = () => setTasks((xs) => xs.filter((x) => x.status !== "done"));

  const api = useMemo(
    () => ({ view, setView, prefix, setPrefix, tasks, addTask, updateTask, removeTask, clearDone }),
    [view, prefix, tasks]
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
