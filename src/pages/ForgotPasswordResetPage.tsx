import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { AuthFlowShell } from '../components/auth/AuthFlowShell';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { AuthTextField } from '../components/auth/AuthTextField';
import {
  clearForgotPasswordFlow,
  getForgotPasswordEmail,
  getForgotPasswordResetToken,
} from '../utils/forgotPasswordFlow';

interface ResetLocationState {
  email?: string;
  resetToken?: string;
}

export default function ForgotPasswordResetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ResetLocationState;
  const email = state.email || getForgotPasswordEmail();
  const resetToken = state.resetToken || getForgotPasswordResetToken();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGeneralError('');

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!formData.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu mới.';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Mật khẩu mới cần có ít nhất 8 ký tự.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage('');
      return;
    }

    if (!email || !resetToken) {
      setGeneralError('Phiên đặt lại mật khẩu không còn hợp lệ. Vui lòng bắt đầu lại.');
      return;
    }

    try {
      setLoading(true);
      setGeneralError('');
      await authApi.resetPassword({
        email,
        resetToken,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      clearForgotPasswordFlow();
      setSuccessMessage('Mật khẩu mới đã được cập nhật. Đang chuyển bạn về trang đăng nhập...');

      window.setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err: any) {
      setSuccessMessage('');
      setGeneralError(err?.message || err?.error || 'Không thể cập nhật mật khẩu mới.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    formData.password.trim().length >= 8 &&
    formData.confirmPassword.trim().length >= 8 &&
    formData.password === formData.confirmPassword;

  return (
    <AuthFlowShell
      title="Đặt lại mật khẩu mới"
      description="Tạo một mật khẩu mới. Đảm bảo nó khác với các mật khẩu trước đó để đảm bảo an toàn."
      backTo="/forgot-password/confirmed"
      backLabel="Quay lại bước xác nhận"
    >
      {generalError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthTextField
          label="Password"
          name="password"
          placeholder="Nhập mật khẩu mới"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          toggleablePassword
        />

        <AuthTextField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu mới"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          toggleablePassword
        />

        <p className="text-sm leading-6 text-slate-500">
          Sử dụng ít nhất 8 ký tự và tránh sử dụng lại mật khẩu trước đó.
        </p>

        <AuthPrimaryButton type="submit" disabled={!canSubmit || !email || !resetToken} loading={loading}>
          Cập nhật mật khẩu
        </AuthPrimaryButton>
      </form>

      {successMessage && (
        <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Muốn đăng nhập?{' '}
        <Link to="/login" className="font-semibold text-[#5b83e8] transition-colors hover:text-[#4a74de]">
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthFlowShell>
  );
}
