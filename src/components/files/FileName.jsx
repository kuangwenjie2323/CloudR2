import React from "react";

/**
 * 文件名展示组件：保持主干部分可截断、扩展名始终可见，以便在 UI 中显示中间省略号。
 * 通过 flex 布局配合 `truncate`，在保持单行显示的同时保留后缀信息。
 */
export default function FileName({
  name,
  as: Component = "div",
  className = "",
  stemClassName = "",
  extClassName = "",
  ...rest
}) {
  const filename = name ?? "";
  const lastDotIndex = filename.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0 && lastDotIndex < filename.length - 1;

  // 按最后一个点拆分主干与扩展名，保留扩展名前的点，确保视觉一致。
  const stem = hasExtension ? filename.slice(0, lastDotIndex) : filename;
  const extension = hasExtension ? filename.slice(lastDotIndex) : "";

  return (
    <Component
      className={`flex min-w-0 items-baseline ${className}`.trim()}
      {...rest}
    >
      {/* 仅让主干参与截断，扩展名保持可见，满足后缀保留的需求。 */}
      <span className={`truncate ${stemClassName}`.trim()}>{stem}</span>
      {extension ? (
        <span className={`flex-shrink-0 ${extClassName}`.trim()}>{extension}</span>
      ) : null}
    </Component>
  );
}
