import { Home, Info, LogIn, Globe } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAuthenticated = !!localStorage.getItem("accessToken");

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLang = e.target.value;
    i18n.changeLanguage(nextLang);
    // Remove window.location.reload() to let React render effortlessly!
  };

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
              <span>{t("nav.home")}</span>
            </Link>
            <Link to="/about" className={navClassName("/about")}>
              <Info size={20} />
              <span>{t("nav.about", "Về chúng tôi")}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg mr-2 transition-colors focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <Globe size={16} className="text-gray-400" />
              <select
                value={i18n.language?.startsWith("vi") ? "vi" : "en"}
                onChange={changeLanguage}
                className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer p-1"
                title={t("common.changeLanguage", "Đổi ngôn ngữ")}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            {!isAuthenticated ? (
              <>
                <Link to="/register" className="flex items-center space-x-2 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-black">
                  <span>{t("nav.signUp")}</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 rounded-lg border border-teal-600 px-4 py-2 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                >
                  <LogIn size={20} />
                  <span>{t("nav.signIn")}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-teal-600">
                  <span>{t("nav.dashboard")}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <span>{t("nav.logout")}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
