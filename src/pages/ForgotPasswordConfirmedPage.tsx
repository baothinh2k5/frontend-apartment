import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AuthFlowShell } from '../components/auth/AuthFlowShell';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { getForgotPasswordEmail, getForgotPasswordResetToken } from '../utils/forgotPasswordFlow';

interface ConfirmedLocationState {
  email?: string;
  resetToken?: string;
}

export default function ForgotPasswordConfirmedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmedLocationState;
  const email = state.email || getForgotPasswordEmail() || 'contact@lscodetech.com';
  const resetToken = state.resetToken || getForgotPasswordResetToken();

  return (
    <AuthFlowShell
      title="Đặt lại mật khẩu"
      description="Mật khẩu của bạn đã được xác minh thành công. Nhấn xác nhận để tiếp tục và đặt một mật khẩu mới."
      backTo="/forgot-password/verify"
      backLabel="Quay lại xác thực"
    >
      <div className="mb-8 rounded-3xl border border-[#dfe8ff] bg-[#f5f8ff] px-5 py-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#5b83e8] shadow-[0_12px_30px_rgba(91,131,232,0.18)]">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Xác minh đã hoàn tất cho <span className="font-semibold text-slate-900">{email}</span>.
        </p>
      </div>

      <AuthPrimaryButton
        type="button"
        onClick={() =>
          navigate('/forgot-password/reset', {
            state: {
              email,
              resetToken,
            },
          })
        }
        disabled={!resetToken}
      >
        Xác nhận
      </AuthPrimaryButton>

      {!resetToken && (
        <p className="mt-4 text-sm text-red-500">
          Phiên xác thực không còn hợp lệ. Vui lòng quay lại bước nhập mã.
        </p>
      )}
    </AuthFlowShell>
  );
}
