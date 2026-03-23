import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passwordPlaintext: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.passwordPlaintext || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (formData.passwordPlaintext !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        passwordPlaintext: formData.passwordPlaintext,
        passwordHash: '', // Handled by backend usually, but structure has it
      };

      const res = await authApi.registerHost(requestData);
      
      if (res && res.status === 201) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => {
          // Navigate to some success or login page
          navigate('/');
        }, 2000);
      } else {
        setError(res.message || 'Đăng ký thất bại.');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8 p-6 mx-auto border border-gray-100">
        
        {/* Tabs */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl mb-8">
          <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-gray-500 rounded-lg hover:text-gray-900 transition-colors">
            Đăng nhập
          </Link>
          <div className="flex-1 text-center py-2.5 text-sm font-medium bg-white text-gray-900 shadow-sm rounded-lg">
            Đăng ký
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Đăng ký tài khoản Chủ nhà</h1>
          <p className="text-gray-500 text-sm">Tạo tài khoản mới để bắt đầu đăng tin</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#f3f3f5] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#f3f3f5] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              placeholder="0901234567"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#f3f3f5] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Mật khẩu</label>
            <input
              type="password"
              name="passwordPlaintext"
              placeholder="••••••••"
              value={formData.passwordPlaintext}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#f3f3f5] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#f3f3f5] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#030213] hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm flex justify-center items-center mt-6 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}
