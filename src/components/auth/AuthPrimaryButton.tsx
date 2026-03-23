import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface AuthPrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function AuthPrimaryButton({
  className,
  children,
  disabled,
  loading = false,
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <button
      className={cn(
        'mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#5b83e8] px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(91,131,232,0.24)] transition-all hover:bg-[#4a74de] disabled:cursor-not-allowed disabled:bg-[#c8d5f7] disabled:text-white/90 disabled:shadow-none',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
    </button>
  );
}
