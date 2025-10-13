// src/utils/format.js
// 通用的格式化工具，供多处 UI 复用，避免在组件里重复声明
export const formatBytes = (size) => {
  if (size == null || Number.isNaN(Number(size))) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Number(size);
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1)} ${units[index]}`;
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return String(value);
  }
};
