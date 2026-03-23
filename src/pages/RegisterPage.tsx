import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// List of common disposable email domains to block
const disposableDomains = [
  'mailinator.com', 'temp-mail.org', '10minutemail.com', 
  'guerrillamail.com', 'yopmail.com'
];

// Zod Schema for Validation (OWASP 2025 & VN Phone)
const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên quá dài'),
  email: z.string().email('Email không đúng định dạng').refine((val) => {
    const domain = val.split('@')[1];
    return !disposableDomains.includes(domain?.toLowerCase());
  }, 'Email tạm thời không được chấp nhận'),
  phone: z.string().regex(/^(0|84|\+84)[35789][0-9]{8}$/, 'Số điện thoại di động Việt Nam không hợp lệ'),
  password: z.string()
    .min(12, 'Mật khẩu phải có ít nhất 12 ký tự (OWASP 2025)')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ viết thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
    .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setFormErrors({});
    setSuccess('');

    // Use safeParse to guarantee error catching without relying on instanceof
    const validationResult = registerSchema.safeParse(formData);
    
    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      const newFormErrors: Record<string, string> = {};
      
      // Zod flatten() maps errors to their respective path keys
      Object.entries(flattenedErrors.fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          newFormErrors[key] = messages[0]; // Grabs the first error message for that field
        }
      });
      
      setFormErrors(newFormErrors);
      return; // Stop form submission here
    }

    try {
      setLoading(true);
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.confirmPassword, 
      };

      const res = await authApi.registerHost(requestData);
      
      if (res && res.status === 201) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setGeneralError(res.message || 'Đăng ký thất bại.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = (fieldName: string) => `
    w-full px-4 py-3 bg-[#f3f3f5] border focus:bg-white focus:outline-none focus:ring-4 rounded-xl text-sm transition-all
    ${formErrors[fieldName] 
      ? 'border-red-500 focus:ring-red-100 focus:border-red-500 bg-red-50/30' 
      : 'border-transparent focus:ring-gray-100 focus:border-gray-300'
    }
  `;

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
          <p className="text-gray-500 text-sm">Tạo tài khoản mới cùng các tính năng quản lý</p>
        </div>

        {generalError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex gap-2 items-center">
            <AlertCircle className="w-4 h-4" />
            <span>{generalError}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              className={inputClassName('fullName')}
            />
            {formErrors.fullName && <p className="mt-1.5 text-[13px] text-red-500">{formErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              className={inputClassName('email')}
            />
            {formErrors.email && <p className="mt-1.5 text-[13px] text-red-500">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              placeholder="0901234567"
              value={formData.phone}
              onChange={handleChange}
              className={inputClassName('phone')}
            />
            {formErrors.phone && <p className="mt-1.5 text-[13px] text-red-500">{formErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              className={inputClassName('password')}
            />
            {formErrors.password && <p className="mt-1.5 text-[13px] text-red-500">{formErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClassName('confirmPassword')}
            />
            {formErrors.confirmPassword && <p className="mt-1.5 text-[13px] text-red-500">{formErrors.confirmPassword}</p>}
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
