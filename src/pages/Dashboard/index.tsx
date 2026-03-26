import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Overview } from "./components/Overview";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { MyProperties } from "./components/MyProperties";
import { AddProperty } from "./components/AddProperty";
import { AdminPropertyApproval } from "./components/AdminPropertyApproval";
import { Plus } from "lucide-react";

const pages: Record<string, { title: string; description: string }> = {
  "duyet-tin-dang": { title: "Duyệt Tin Đăng", description: "Quản lý và duyệt các tin đăng từ người dùng." },
  "quan-ly-host": { title: "Quản Lý Host", description: "Xem và quản lý danh sách chủ nhà đã đăng ký." },
  "tat-ca-tin-dang": { title: "Tất Cả Tin Đăng", description: "Xem toàn bộ tin đăng bất động sản trên hệ thống." },
  "tin-dang-cua-toi": { title: "Tin Đăng Của Tôi", description: "Quản lý tin đăng cá nhân của bạn." },
  "dang-tin-moi": { title: "Đăng Tin Mới", description: "Tạo tin đăng bất động sản mới." },
  "cai-dat": { title: "Cài Đặt", description: "Quản lý cài đặt tài khoản và hệ thống." },
};

export default function Dashboard() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isHost = user?.role?.code === "HOST";

  const [activePage, setActivePage] = useState(isHost ? "tin-dang-cua-toi" : "tong-quan");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-[#eef2f8] overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <div className="flex-1 overflow-hidden flex flex-col p-5">
          {activePage === "tong-quan" && <Overview />}
          {activePage === "tin-dang-cua-toi" && <MyProperties onPageChange={setActivePage} />}
          {activePage === "dang-tin-moi" && <AddProperty onPageChange={setActivePage} />}
          {activePage === "duyet-tin-dang" && <AdminPropertyApproval />}
          {!["tong-quan", "tin-dang-cua-toi", "dang-tin-moi", "duyet-tin-dang"].includes(activePage) && (
            <PlaceholderPage
              title={pages[activePage]?.title || ""}
              description={pages[activePage]?.description}
            />
          )}
        </div>
      </div>

      {/* FAB - Chỉ hiện cho HOST hoặc nếu thích */}
      {isHost && (
        <button 
          onClick={() => setActivePage("dang-tin-moi")}
          className="fixed bottom-6 right-6 w-12 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50 hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
