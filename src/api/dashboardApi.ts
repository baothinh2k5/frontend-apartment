import axiosClient from "./axiosClient";

export interface DailyTrend {
  date: string;
  count: number;
}

export interface AdminDashboardStats {
  totalProperties: number;
  totalHosts: number;
  totalViews: number;
  totalUsers: number;
  trends: DailyTrend[];
}

const dashboardApi = {
  getAdminOverview: (): Promise<AdminDashboardStats> => {
    return axiosClient.get("/admin/dashboard/overview");
  },
};

export default dashboardApi;
