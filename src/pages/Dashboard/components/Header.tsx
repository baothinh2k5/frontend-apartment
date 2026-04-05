import { Bell, ChevronDown, Loader2, LogOut, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

interface HeaderProps {
  onMenuToggle: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const fmtTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userName = user?.fullName || "User";
  const userRole = user?.role?.name || "Member";
  const initial = userName.charAt(0).toUpperCase();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const unreadBadge = useMemo(() => (unreadCount > 99 ? "99+" : String(unreadCount)), [unreadCount]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res: any = await axiosClient.get("/notifications", {
        params: { page: 0, size: 8 },
      });

      const payload = res?.data ?? {};
      setNotifications(payload.content ?? []);
      setUnreadCount(payload.unreadCount ?? 0);
    } catch (error) {
      console.error("Fetch notifications failed:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = window.setInterval(fetchNotifications, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleBellClick = async () => {
    const nextValue = !showNotifications;
    setShowNotifications(nextValue);
    if (nextValue) {
      await fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      if (!notification.isRead) {
        await axiosClient.patch(`/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Mark notification read failed:", error);
    }

    setShowNotifications(false);
    navigate(notification.link || "/dashboard");
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosClient.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications read failed:", error);
    }
  };

  return (
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
      <button onClick={onMenuToggle} className="text-gray-500 transition-colors hover:text-gray-700">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-4">
        <div ref={notificationRef} className="relative">
          <button
            onClick={handleBellClick}
            className="relative text-gray-500 transition-colors hover:text-gray-700"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {unreadBadge}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-9 z-30 w-[360px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Thông báo</div>
                  <div className="text-xs text-slate-500">{unreadCount} chưa đọc</div>
                </div>
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs font-semibold text-teal-600 transition-colors hover:text-teal-700 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-10 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">Chưa có thông báo nào.</div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        notification.isRead ? "bg-white" : "bg-teal-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{notification.title}</span>
                            {!notification.isRead && <span className="h-2 w-2 rounded-full bg-teal-500" />}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">{fmtTime(notification.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-gray-200" />

        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-xs font-bold text-white">
              {initial}
            </div>
            <span className="text-sm text-gray-700">
              {userName} ({userRole})
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
