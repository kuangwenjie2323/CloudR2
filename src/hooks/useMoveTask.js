import { useCallback } from "react";
import { useStore } from "../app/store";
import { moveR2 } from "../utils/api";

const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

/**
 * 封装移动任务的执行逻辑，方便在不同入口复用。
 * 统一负责：
 *  - 创建/更新任务胶囊
 *  - 调用后端移动接口
 *  - 成功后触发刷新、清空选择
 */
export default function useMoveTask() {
  const { addTask, updateTask, clearSelection } = useStore();

  return useCallback(
    async ({
      keys = [],
      targetPrefix = "",
      label,
      overwrite = false,
      flatten = true,
      clearAfter = true,
    } = {}) => {
      if (!keys.length) return;
      const id = uid();
      const name = label ?? `移动 ${keys.length} 项 → ${targetPrefix || "/"}`;
      addTask({ id, name, status: "pending", pct: 0 });

      try {
        await moveR2(keys, targetPrefix, { overwrite, flatten });
        updateTask(id, { status: "done", pct: 100 });
        if (clearAfter) clearSelection();
        window.dispatchEvent(new CustomEvent("r2:reload"));
      } catch (error) {
        updateTask(id, { status: "error", error: String(error?.message || error) });
        throw error;
      }
    },
    [addTask, updateTask, clearSelection]
  );
}
