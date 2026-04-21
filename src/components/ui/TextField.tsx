import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextField = ({ label, error, className = '', ...props }: TextFieldProps) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-[13px] font-medium text-ink-2">{label}</label>}
    <input
      {...props}
      className={`h-12 px-4 bg-cream-soft rounded-field text-[15px] outline-none border border-transparent focus:border-ink-4 transition-colors placeholder:text-ink-3 ${className}`}
    />
    {error && <p className="text-[12px] text-rose-500">{error}</p>}
  </div>
);
