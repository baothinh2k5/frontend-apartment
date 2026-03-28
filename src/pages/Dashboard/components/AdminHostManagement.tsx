import { useEffect, useState, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  Users,
  Plus,
  Search,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

interface Host {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "LOCKED" | "PENDING";
  roleCode: string;
  roleName: string;
  createdAt: string;
  lastLoginAt: string | null;
  lockReason: string | null;
}

interface PageResult {
  content: Host[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

type StatusFilter = "ALL" | "ACTIVE" | "LOCKED";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Hoạt động", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  LOCKED: { label: "Đã khóa", cls: "bg-red-100 text-red-700 border border-red-200" },
  PENDING: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
};

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export const AdminHostManagement = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Create host modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", phone: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Lock modal
  const [lockTarget, setLockTarget] = useState<Host | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [lockLoading, setLockLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), size: "12" };
      if (debouncedQuery) params.query = debouncedQuery;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res: any = await axiosClient.get("/api/v1/admin/hosts", { params });
      const data: PageResult = res.data ?? res;
      setHosts(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, statusFilter]);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, statusFilter]);

  const handleCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreateLoading(true);
    try {
      await axiosClient.post("/api/v1/admin/hosts", createForm);
      setCreateSuccess("Tạo tài khoản Host thành công! Email thông tin đăng nhập đã được gửi.");
      setCreateForm({ fullName: "", email: "", phone: "" });
      fetchHosts();
      setTimeout(() => {
        setShowCreate(false);
        setCreateSuccess("");
      }, 2500);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Tạo Host thất bại. Vui lòng thử lại.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLockConfirm = async () => {
    if (!lockTarget) return;
    setLockLoading(true);
    try {
      await axiosClient.patch(`/api/v1/admin/hosts/${lockTarget.id}/status`, {
        status: "LOCKED",
        reason: lockReason.trim() || "Vi phạm chính sách nền tảng",
      });
      setLockTarget(null);
      setLockReason("");
      fetchHosts();
    } catch (err) {
      console.error(err);
    } finally {
      setLockLoading(false);
    }
  };

  const handleUnlock = async (host: Host) => {
    if (!confirm(`Mở khóa tài khoản "${host.fullName}"?`)) return;
    try {
      await axiosClient.patch(`/api/v1/admin/hosts/${host.id}/status`, { status: "ACTIVE" });
      fetchHosts();
    } catch (err) {
      console.error(err);
    }
  };

  const currentAdminId = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").id; } catch { return null; }
  })();

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quản lý Host</h2>
            <p className="text-sm text-gray-500">{totalElements} tài khoản Chủ nhà</p>
          </div>
        </div>
        <button
          id="btn-create-host"
          onClick={() => { setShowCreate(true); setCreateError(""); setCreateSuccess(""); }}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-sm hover:shadow-teal-200 shadow-md text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Host mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="host-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-gray-50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "LOCKED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              id={`filter-${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "Tất cả" : s === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Chủ nhà", "Liên hệ", "Trạng thái", "Ngày tạo", "Đăng nhập cuối", "Thao tác"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {hosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400 italic">
                      Không tìm thấy tài khoản Host nào.
                    </td>
                  </tr>
                ) : (
                  hosts.map((host) => {
                    const isMe = host.id === currentAdminId;
                    const badge = STATUS_BADGE[host.status] ?? STATUS_BADGE.PENDING;
                    return (
                      <tr key={host.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                              {host.fullName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{host.fullName}</div>
                              <div className="text-xs text-gray-400 font-mono">{host.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-gray-700 text-sm">{host.email}</div>
                          <div className="text-xs text-gray-400">{host.phone}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.cls}`}>
                              {badge.label}
                            </span>
                            {host.status === "LOCKED" && host.lockReason && (
                              <span className="text-xs text-red-400 italic line-clamp-1" title={host.lockReason}>
                                {host.lockReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-sm">{fmtDate(host.createdAt)}</td>
                        <td className="px-5 py-4 text-gray-500 text-sm">{fmtDate(host.lastLoginAt)}</td>
                        <td className="px-5 py-4">
                          {isMe ? (
                            <span className="text-xs text-gray-400 italic">Bạn</span>
                          ) : host.status === "LOCKED" ? (
                            <button
                              id={`btn-unlock-${host.id}`}
                              onClick={() => handleUnlock(host)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              Mở khóa
                            </button>
                          ) : (
                            <button
                              id={`btn-lock-${host.id}`}
                              onClick={() => setLockTarget(host)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Khóa
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                id="btn-prev-page"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-next-page"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === Create Host Modal === */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Thêm Host mới</h3>
                  <p className="text-xs text-gray-500">Hệ thống sẽ tự sinh mật khẩu và gửi email</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHost} className="px-6 py-5 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                  ✅ {createSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên *</label>
                <input
                  id="create-host-fullname"
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  id="create-host-email"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="host@example.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại *</label>
                <input
                  id="create-host-phone"
                  type="tel"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0901234567"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Mật khẩu ngẫu nhiên sẽ được tạo và gửi đến email của Host. Admin sẽ không biết mật khẩu này.</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  id="btn-submit-create-host"
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all font-medium text-sm disabled:opacity-60 active:scale-95"
                >
                  {createLoading ? "Đang tạo…" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === Lock Confirm Modal === */}
      {lockTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Khóa tài khoản Host</h3>
                  <p className="text-xs text-red-500">{lockTarget.fullName} · {lockTarget.email}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                Hành động này sẽ <strong>thu hồi toàn bộ phiên đăng nhập</strong> và{" "}
                <strong>ẩn tất cả tin đăng</strong> của Host này ngay lập tức.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do khóa</label>
                <textarea
                  id="lock-reason-input"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  className="w-full h-28 p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 resize-none transition-all"
                  placeholder="Mô tả lý do khóa tài khoản (tùy chọn)..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setLockTarget(null); setLockReason(""); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  id="btn-confirm-lock"
                  onClick={handleLockConfirm}
                  disabled={lockLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium text-sm disabled:opacity-60 active:scale-95"
                >
                  {lockLoading ? "Đang khóa…" : "Xác nhận khóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
