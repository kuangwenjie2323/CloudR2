import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Uploads from "../pages/Uploads";
import Search from "../pages/Search";
import RecycleBin from "../pages/RecycleBin";
import Settings from "../pages/Settings";

export default function RoutesView() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/uploads" element={<Uploads />} />
      <Route path="/search" element={<Search />} />
      <Route path="/recycle" element={<RecycleBin />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
