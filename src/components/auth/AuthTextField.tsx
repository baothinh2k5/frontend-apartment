import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  toggleablePassword?: boolean;
}

export function AuthTextField({
  label,
  error,
  className,
  type = 'text',
  toggleablePassword = false,
  ...props
}: AuthTextFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const actualType = toggleablePassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      <div className="relative">
        <Input
          type={actualType}
          className={cn(
            'h-12 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#86a5ef] focus-visible:ring-[#dfe8ff]',
            error && 'border-red-400 bg-red-50/40 focus-visible:border-red-500 focus-visible:ring-red-100',
            toggleablePassword && 'pr-11',
            className,
          )}
          {...props}
        />

        {toggleablePassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
