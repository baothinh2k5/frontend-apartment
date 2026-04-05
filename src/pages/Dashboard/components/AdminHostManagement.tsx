import { useCallback, useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Search,
  Unlock,
  UserCheck,
  Users,
  X,
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

type StatusFilter = "ALL" | "ACTIVE" | "LOCKED" | "PENDING";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Hoạt động", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  LOCKED: { label: "Đã khóa", cls: "bg-red-100 text-red-700 border border-red-200" },
  PENDING: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
};

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  ALL: "Tất cả",
  ACTIVE: "Hoạt động",
  PENDING: "Chờ duyệt",
  LOCKED: "Đã khóa",
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

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", phone: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [lockTarget, setLockTarget] = useState<Host | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [lockLoading, setLockLoading] = useState(false);
  const [lockError, setLockError] = useState("");

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

      const res: any = await axiosClient.get("/admin/hosts", { params });
      const pageResult: PageResult = res.data?.data ?? res.data ?? res;
      setHosts(pageResult.content ?? []);
      setTotalPages(pageResult.totalPages ?? 1);
      setTotalElements(pageResult.totalElements ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, statusFilter]);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, statusFilter]);

  const handleCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreateLoading(true);
    try {
      await axiosClient.post("/admin/hosts", createForm);
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
    setLockError("");
    setLockLoading(true);
    try {
      await axiosClient.patch(`/admin/hosts/${lockTarget.id}/status`, {
        status: "LOCKED",
        reason: lockReason.trim() || "Vi phạm chính sách nền tảng",
      });
      setLockTarget(null);
      setLockReason("");
      setLockError("");
      fetchHosts();
    } catch (err: any) {
      setLockError(err?.response?.data?.message || "Khóa tài khoản thất bại. Vui lòng thử lại.");
    } finally {
      setLockLoading(false);
    }
  };

  const handleSetActive = async (host: Host, actionLabel: string) => {
    if (!confirm(`${actionLabel} tài khoản "${host.fullName}"?`)) return;
    try {
      await axiosClient.patch(`/admin/hosts/${host.id}/status`, { status: "ACTIVE" });
      fetchHosts();
    } catch (err) {
      console.error(err);
    }
  };

  const currentAdminId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").id;
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quản lý Host</h2>
            <p className="text-sm text-gray-500">{totalElements} tài khoản Chủ nhà</p>
          </div>
        </div>
        <button
          id="btn-create-host"
          onClick={() => {
            setShowCreate(true);
            setCreateError("");
            setCreateSuccess("");
          }}
          className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-teal-200 transition-all hover:bg-teal-600 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Thêm Host mới
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="host-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "PENDING", "LOCKED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              id={`filter-${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                statusFilter === s ? "bg-teal-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {STATUS_FILTER_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-teal-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["Chủ nhà", "Liên hệ", "Trạng thái", "Ngày tạo", "Đăng nhập cuối", "Thao tác"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {hosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center italic text-gray-400">
                      Không tìm thấy tài khoản Host nào.
                    </td>
                  </tr>
                ) : (
                  hosts.map((host) => {
                    const isMe = host.id === currentAdminId;
                    const badge = STATUS_BADGE[host.status] ?? STATUS_BADGE.PENDING;

                    return (
                      <tr key={host.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                              {host.fullName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{host.fullName}</div>
                              <div className="font-mono text-xs text-gray-400">{host.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">{host.email}</div>
                          <div className="text-xs text-gray-400">{host.phone}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>
                              {badge.label}
                            </span>
                            {host.status === "LOCKED" && host.lockReason && (
                              <span className="line-clamp-1 text-xs italic text-red-400" title={host.lockReason}>
                                {host.lockReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(host.createdAt)}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(host.lastLoginAt)}</td>
                        <td className="px-5 py-4">
                          {isMe ? (
                            <span className="text-xs italic text-gray-400">Bạn</span>
                          ) : host.status === "LOCKED" ? (
                            <button
                              id={`btn-unlock-${host.id}`}
                              onClick={() => handleSetActive(host, "Mở khóa")}
                              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                            >
                              <Unlock className="h-3.5 w-3.5" />
                              Mở khóa
                            </button>
                          ) : host.status === "PENDING" ? (
                            <button
                              id={`btn-activate-${host.id}`}
                              onClick={() => handleSetActive(host, "Kích hoạt")}
                              className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-100"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Kích hoạt
                            </button>
                          ) : (
                            <button
                              id={`btn-lock-${host.id}`}
                              onClick={() => {
                                setLockTarget(host);
                                setLockError("");
                              }}
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                            >
                              <Lock className="h-3.5 w-3.5" />
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-4">
            <span className="text-sm text-gray-500">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                id="btn-prev-page"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                id="btn-next-page"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in rounded-2xl bg-white shadow-2xl fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Thêm Host mới</h3>
                  <p className="text-xs text-gray-500">Hệ thống sẽ tự sinh mật khẩu và gửi email</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHost} className="space-y-4 px-6 py-5">
              {createError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {createSuccess}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên *</label>
                <input
                  id="create-host-fullname"
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
                <input
                  id="create-host-email"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="host@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại *</label>
                <input
                  id="create-host-phone"
                  type="tel"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0901234567"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Mật khẩu ngẫu nhiên sẽ được tạo và gửi đến email của Host. Admin sẽ không biết mật khẩu này.</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  id="btn-submit-create-host"
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-60"
                >
                  {createLoading ? "Đang tạo..." : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lockTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in rounded-2xl bg-white shadow-2xl fade-in zoom-in duration-200">
            <div className="border-b border-gray-100 px-6 pb-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100">
                  <Lock className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Khóa tài khoản Host</h3>
                  <p className="text-xs text-red-500">
                    {lockTarget.fullName} · {lockTarget.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-gray-600">
                Hành động này sẽ <strong>thu hồi toàn bộ phiên đăng nhập</strong> và <strong>ẩn tất cả tin đăng</strong> của
                Host này ngay lập tức.
              </p>
              {lockError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {lockError}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lý do khóa</label>
                <textarea
                  id="lock-reason-input"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  className="h-28 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm transition-all focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/40"
                  placeholder="Mô tả lý do khóa tài khoản (tùy chọn)..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setLockTarget(null);
                    setLockReason("");
                    setLockError("");
                  }}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  id="btn-confirm-lock"
                  onClick={handleLockConfirm}
                  disabled={lockLoading}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-60"
                >
                  {lockLoading ? "Đang khóa..." : "Xác nhận khóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
