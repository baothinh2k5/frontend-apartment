import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';

export default function WaitingApprovalPage() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 text-center border border-slate-100">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm">
              <ShieldCheck className="w-6 h-6 text-teal-500 fill-teal-50" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
          Đang chờ duyệt tài khoản
        </h1>
        
        <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
          Chào <span className="font-semibold text-slate-800">{user?.fullName || 'bạn'}</span>, tài khoản của bạn đang được hệ thống kiểm duyệt. 
          Quá trình này thường mất từ 12-24h làm việc. Chúng tôi sẽ thông báo cho bạn ngay khi hoàn tất!
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50 text-left">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <p className="text-sm text-teal-800 font-medium">Đã tiếp nhận thông tin đăng ký</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left opacity-60">
            <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
            <p className="text-sm text-slate-600 font-medium">Đang trong quá trình kiểm duyệt</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-3 px-6 text-slate-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs">
        © 2026 LeaseLink. All rights reserved.
      </p>
    </div>
  );
}
