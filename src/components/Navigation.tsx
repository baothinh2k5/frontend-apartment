import { Home, Info, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button className="flex items-center space-x-2 text-gray-900 hover:text-teal-600">
              <Home size={20} />
              <span>Trang chủ</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-teal-600">
              <Info size={20} />
              <span>Về chúng tôi</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/register" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-black font-medium transition-colors">
              <span>Đăng ký</span>
            </Link>
            <Link to="/login" className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:text-teal-700 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors">
              <LogIn size={20} />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
