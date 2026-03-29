import { Home, Info, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navClassName = (path: string) =>
    `flex items-center space-x-2 transition-colors ${
      location.pathname === path ? "text-teal-600" : "text-gray-700 hover:text-teal-600"
    }`;

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className={navClassName("/")}>
              <Home size={20} />
              <span>Trang chủ</span>
            </Link>
            <Link to="/about" className={navClassName("/about")}>
              <Info size={20} />
              <span>Về chúng tôi</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="flex items-center space-x-2 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-black">
                  <span>Đăng ký</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 rounded-lg border border-teal-600 px-4 py-2 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                >
                  <LogIn size={20} />
                  <span>Đăng nhập</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-teal-600">
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <span>Đăng xuất</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
