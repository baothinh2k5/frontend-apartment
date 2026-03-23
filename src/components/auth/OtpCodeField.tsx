import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

interface OtpCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpCodeField({ value, onChange, error }: OtpCodeFieldProps) {
  return (
    <div className="space-y-3">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        containerClassName="justify-between gap-2"
        className="w-full"
      >
        <InputOTPGroup className="w-full justify-between gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="h-14 w-12 rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-900 first:rounded-xl first:border last:rounded-xl"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
