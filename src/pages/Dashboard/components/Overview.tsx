import { useEffect, useState } from "react";
import { Search, Calendar, ChevronDown, Sun, TrendingUp, Users, FileText } from "lucide-react";
import { StatCard } from "./StatCard";
import { TrendChart } from "./TrendChart";
import dashboardApi, { AdminDashboardStats } from "../../../api/dashboardApi";
import { toast } from "sonner";

export function Overview() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("Tháng Này");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userRole = user?.role?.code?.toUpperCase();

      if (userRole !== "ADMIN") {
        setLoading(false);
        return;
      }

      try {
        const data = await dashboardApi.getAdminOverview();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        toast.error("Không thể tải dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Prepare trend data for StatCards (last 10 points)
  const getTrendData = (type: 'views' | 'props') => {
    if (!stats || !stats.trends) return Array.from({ length: 10 }, () => ({ v: 0 }));
    return stats.trends.slice(-10).map(t => ({ v: t.count }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.role?.code?.toUpperCase() !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-gray-500 italic">Bác không có quyền xem trang quản trị này. Vui lòng quay lại trang của Bác.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Tổng Quan Hoạt Động (Admin)</h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 bg-white w-40 transition-all"
            />
          </div>
          {/* Month Picker */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {selectedMonth}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4 mb-5">
        <StatCard
          title="Tổng Tin Đăng"
          value={stats?.totalProperties.toLocaleString() || "0"}
          data={getTrendData('props')}
          color="#22c55e"
          icon={<FileText className="w-4 h-4 text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          title="Số Chủ Nhà"
          value={stats?.totalHosts.toLocaleString() || "0"}
          data={getTrendData('views')} // Just as placeholder
          color="#3b82f6"
          icon={<Users className="w-4 h-4 text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Tổng Lượt Xem"
          value={stats?.totalViews.toLocaleString() || "0"}
          data={stats?.trends.slice(-10).map(t => ({ v: t.count })) || []}
          color="#f97316"
          icon={<Sun className="w-4 h-4 text-orange-500" />}
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Tổng Người Dùng"
          value={stats?.totalUsers.toLocaleString() || "0"}
          data={[]}
          color="#6366f1"
          icon={<TrendingUp className="w-4 h-4 text-indigo-400" />}
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Trend Chart */}
      <div className="mb-5">
        <TrendChart data={stats?.trends} loading={loading} />
      </div>

      {/* Note: MonthlyVisitChart is removed or kept as placeholder if needed */}
      <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 text-sm italic">
        * Dữ liệu biểu đồ hiển thị xu hướng lượt xem bất động sản trong 30 ngày gần nhất.
      </div>
    </div>
  );
}
