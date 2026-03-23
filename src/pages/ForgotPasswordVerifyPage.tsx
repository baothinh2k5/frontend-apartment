import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { AuthFlowShell } from '../components/auth/AuthFlowShell';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { OtpCodeField } from '../components/auth/OtpCodeField';
import {
  getForgotPasswordEmail,
  setForgotPasswordEmail,
  setForgotPasswordResetToken,
} from '../utils/forgotPasswordFlow';

interface VerifyLocationState {
  email?: string;
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 3) {
    return `${localPart[0] ?? ''}***@${domain}`;
  }

  return `${localPart.slice(0, 3)}${'*'.repeat(Math.max(localPart.length - 3, 2))}@${domain}`;
}

export default function ForgotPasswordVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as VerifyLocationState;
  const email = state.email || getForgotPasswordEmail() || 'contact@lscodetech.com';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số xác thực.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authApi.verifyResetCode({ email, code });
      const resetToken = response?.data?.resetToken;

      if (!resetToken) {
        throw new Error('Không nhận được reset token từ máy chủ.');
      }

      setForgotPasswordEmail(email);
      setForgotPasswordResetToken(resetToken);

      navigate('/forgot-password/confirmed', {
        state: {
          email,
          resetToken,
        },
      });
    } catch (err: any) {
      setError(err?.message || err?.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setError('');
      await authApi.requestPasswordReset({ email });
      setForgotPasswordEmail(email);
      setCode('');
      setResent(true);
    } catch (err: any) {
      setError(err?.message || err?.error || 'Không thể gửi lại email xác thực.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthFlowShell
      title="Kiểm tra email của bạn"
      description={`Chúng tôi đã gửi mã xác thực đến ${maskedEmail}, vui lòng nhập 6 chữ số bên dưới để tiếp tục.`}
      backTo="/forgot-password"
      backLabel="Quay lại nhập email"
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <OtpCodeField
          value={code}
          onChange={(value) => {
            setCode(value);
            if (error) {
              setError('');
            }
          }}
          error={error}
        />

        <AuthPrimaryButton type="submit" disabled={code.length !== 6} loading={loading}>
          Xác nhận OTP
        </AuthPrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Vẫn chưa nhận được email?{' '}
        <button
          type="button"
          onClick={handleResend}
          className="font-semibold text-[#5b83e8] transition-colors hover:text-[#4a74de] disabled:opacity-60"
          disabled={resending}
        >
          {resending ? 'Đang gửi...' : 'Gửi lại email'}
        </button>
      </p>

      {resent && (
        <p className="mt-3 text-center text-sm text-green-600">
          Một email xác thực mới đã được gửi đến {maskedEmail}.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Sai địa chỉ email?{' '}
        <Link to="/forgot-password" className="font-semibold text-[#5b83e8] transition-colors hover:text-[#4a74de]">
          Đổi email
        </Link>
      </p>
    </AuthFlowShell>
  );
}
