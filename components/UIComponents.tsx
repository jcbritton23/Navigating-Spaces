import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth, className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-display font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-background hover:bg-white hover:shadow-[0_0_15px_rgba(167,139,250,0.5)]",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
    danger: "bg-danger text-white hover:bg-red-600",
    ghost: "bg-transparent text-primary hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; selected?: boolean }> = ({ children, className = '', onClick, selected }) => (
  <div 
    onClick={onClick}
    className={`
      glass-panel p-6 rounded-2xl transition-all duration-300
      ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(167,139,250,0.3)]' : ''}
      ${selected ? 'ring-2 ring-safe bg-safe/10' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

export const BatteryDisplay: React.FC<{ value: number }> = ({ value }) => {
  let color = 'text-safe';
  let pulse = '';
  
  if (value < 40) {
    color = 'text-accent';
    pulse = 'animate-pulse-slow';
  }
  if (value < 10) {
    color = 'text-danger';
    pulse = 'animate-pulse-fast';
  }

  return (
    <div className={`flex items-center gap-2 font-mono text-xl ${color} ${pulse}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>{Math.round(value)}%</span>
    </div>
  );
};
