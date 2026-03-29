import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  BookOpen,
  FilePlus,
  Settings,
  Home,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: "tong-quan", label: "Tổng quan", icon: LayoutDashboard },
  { id: "duyet-tin-dang", label: "Duyệt tin đăng", icon: ClipboardList },
  { id: "quan-ly-host", label: "Quản lý host", icon: Users },
  { id: "tat-ca-tin-dang", label: "Tất cả tin đăng", icon: FileText },
  { id: "tin-dang-cua-toi", label: "Tin đăng của tôi", icon: BookOpen },
  { id: "dang-tin-moi", label: "Đăng tin mới", icon: FilePlus },
  { id: "cai-dat", label: "Cài đặt", icon: Settings },
];

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const roleCode = user?.role?.code || "HOST";

  const filteredMenuItems = menuItems.filter((item) => {
    if (roleCode === "ADMIN") return true;

    // HOST only sees these
    return ["tin-dang-cua-toi", "dang-tin-moi", "cai-dat"].includes(item.id);
  });

  return (
    <div className="w-[220px] min-h-screen bg-[#1a2340] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-wide">RentHub</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-left transition-all duration-150 ${isActive
                ? "bg-teal-500 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
