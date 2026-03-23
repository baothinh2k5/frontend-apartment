import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthFlowShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function AuthFlowShell({
  title,
  description,
  children,
  backTo = '/login',
  backLabel = 'Quay lại',
}: AuthFlowShellProps) {
  return (
    <div
      className="flex flex-col flex-grow items-center justify-center px-4 py-10 min-h-[calc(100vh-64px)]"
      style={{ background: 'radial-gradient(circle at top, #f8fbff 0%, #eef2ff 22%, #f8fafc 58%, #ffffff 100%)' }}
    >
      <div className="w-full max-w-[460px] rounded-[32px] border border-slate-100 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8 sm:py-8">
        <Link
          to={backTo}
          className="mb-7 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-800"
          aria-label={backLabel}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="mb-7">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
