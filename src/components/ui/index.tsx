import React from 'react';
import { cn } from '@/lib/utils';

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("bg-white border border-[#DCE5EE] rounded-lg overflow-hidden transition-all duration-200", className)} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("px-6 py-4 border-b border-[#DCE5EE] flex flex-col gap-1", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("text-base font-bold text-[#17345C]", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-xs text-[#6B7C93]", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-6", className)} {...props} />
);

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}
export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-[#6B7C93] border-slate-200',
    secondary: 'bg-[#17345C]/5 text-[#17345C] border-[#17345C]/10',
    success: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
    info: 'bg-[#4DA3FF]/10 text-[#17345C] border-[#4DA3FF]/20',
  };
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider", 
        variants[variant], 
        className
      )} 
      {...props} 
    />
  );
};

// Table
export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-auto">
    <table className={cn("w-full text-left border-collapse text-sm text-[#6B7C93]", className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn("bg-[#EEF4F8] border-b border-[#DCE5EE] font-semibold text-[#17345C] text-xs uppercase tracking-wider", className)} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn("divide-y divide-[#DCE5EE]", className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn("hover:bg-[#EEF4F8]/40 transition-colors", className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn("px-6 py-3 font-semibold", className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn("px-6 py-3.5 align-middle", className)} {...props} />
);

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded transition-all duration-200 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#17345C] hover:bg-[#0f233f] text-white shadow-none",
    secondary: "bg-[#4DA3FF] hover:bg-[#3d92e6] text-white shadow-none",
    outline: "border border-[#DCE5EE] bg-white hover:bg-[#EEF4F8] text-[#17345C]",
    danger: "bg-[#EF4444] hover:bg-[#dc2626] text-white",
    ghost: "hover:bg-[#EEF4F8] text-[#6B7C93] hover:text-[#17345C]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  
  return (
    <button 
      className={cn(baseStyle, variants[variant], sizes[size], className)} 
      {...props} 
    />
  );
};

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input: React.FC<InputProps> = ({ className, type = "text", ...props }) => (
  <input 
    type={type} 
    className={cn(
      "w-full px-3 py-2 bg-white border border-[#DCE5EE] rounded text-sm text-[#17345C] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] transition-all", 
      className
    )} 
    {...props} 
  />
);

// Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
export const Select: React.FC<SelectProps> = ({ className, children, ...props }) => (
  <select 
    className={cn(
      "px-3 py-2 bg-white border border-[#DCE5EE] rounded text-sm text-[#17345C] focus:outline-none focus:ring-1 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] transition-all cursor-pointer", 
      className
    )} 
    {...props}
  >
    {children}
  </select>
);

// Dialog / Modal
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#17345C]/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      {/* Modal Card */}
      <div className="bg-white border border-[#DCE5EE] rounded-lg shadow-xl max-w-2xl w-full z-10 overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
        <div className="px-6 py-4 border-b border-[#DCE5EE] flex items-center justify-between">
          <h3 className="font-bold text-[#17345C] text-base">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 font-bold text-lg leading-none p-1 hover:bg-[#EEF4F8] rounded cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

