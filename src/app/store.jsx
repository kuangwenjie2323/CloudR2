import { createContext, useCallback, useContext, useMemo, useState } from "react";

// 统一的上下文默认值，避免未包 Provider 时解构报错
const defaultCtx = {
  view: "grid", setView: () => {},
  prefix: "", setPrefix: () => {},
  tasks: [], addTask: () => {}, updateTask: () => {}, removeTask: () => {}, clearDone: () => {},
  selected: [], toggleSelect: () => {}, clearSelection: () => {}, selectAll: () => {},
  reloadList: null, setReloadList: () => {},
};

const Ctx = createContext(defaultCtx);

export function Provider({ children }) {
  const [view, setView] = useState("grid");
  const [prefix, setPrefix] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [reloadList, setReloadListState] = useState(null);

  const addTask = (t) => setTasks((xs) => [...xs, t]);
  const updateTask = (id, patch) => setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeTask = (id) => setTasks((xs) => xs.filter((x) => x.id !== id));
  const clearDone = () => setTasks((xs) => xs.filter((x) => x.status !== "done"));

  const toggleSelect = (key) =>
    setSelected((xs) => (xs.includes(key) ? xs.filter((k) => k !== key) : [...xs, key]));
  const clearSelection = () => setSelected([]);
  const selectAll = (keys) => setSelected(keys);

  // 保持顶部栏触发的刷新回调可配置，避免页面之间的耦合
  const setReloadList = useCallback((fn) => {
    setReloadListState(() => (typeof fn === "function" ? fn : null));
  }, []);

  const api = useMemo(
    () => ({ view, setView, prefix, setPrefix, tasks, addTask, updateTask, removeTask, clearDone, selected, toggleSelect, clearSelection, selectAll, reloadList, setReloadList }),
    [view, prefix, tasks, selected, reloadList, setReloadList]
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
