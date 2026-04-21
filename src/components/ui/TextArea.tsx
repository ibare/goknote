import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = ({ label, className = '', ...props }: TextAreaProps) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-[13px] font-medium text-ink-2">{label}</label>}
    <textarea
      {...props}
      className={`px-4 py-3 bg-cream-soft rounded-field text-[15px] outline-none border border-transparent focus:border-ink-4 transition-colors placeholder:text-ink-3 resize-none ${className}`}
    />
  </div>
);
