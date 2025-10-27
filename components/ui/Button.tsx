
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-cyan-400 text-slate-900 hover:bg-cyan-500',
    secondary: 'bg-slate-600 text-white hover:bg-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-cyan-300 hover:bg-slate-700'
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
