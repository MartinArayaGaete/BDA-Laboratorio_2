import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div
        className="flex-grow-1 bg-light"
        style={{ overflowX: "hidden", overflowY: "auto", maxHeight: "100vh" }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
