import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function SidebarLayout() {
  return (
    <>
      <Sidebar />
      <div className="pl-[17%] p-2 bg-[#081317]">
        <Outlet />
      </div>
    </>
  );
}
