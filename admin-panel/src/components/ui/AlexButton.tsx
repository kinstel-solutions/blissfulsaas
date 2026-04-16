import React from 'react';
import Link from 'next/link';

interface AlexButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function AlexButton({
  href,
  onClick,
  children,
  className = '',
  size = 'md',
  type = 'button',
  icon,
  disabled = false,
}: AlexButtonProps) {
  const sizeClasses = {
    sm: {
      btn: 'py-1 pl-1 pr-2 gap-2 text-sm',
      circle: 'w-7 h-7',
      arrow: 'w-3 h-3'
    },
    md: {
      btn: 'py-1.5 pl-1.5 pr-2.5 gap-2.5',
      circle: 'w-8 h-8',
      arrow: 'w-3.5 h-3.5'
    },
    lg: {
      btn: 'py-2 pl-2 pr-3.5 gap-3',
      circle: 'w-10 h-10',
      arrow: 'w-4 h-4'
    }
  };

  const selectedSize = sizeClasses[size];

  const content = (
    <>
      <span className={`cta-icon-circle ${selectedSize.circle} rounded-full shrink-0`}>
        {icon || (
          <svg className={`animate-arrow ${selectedSize.arrow}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        )}
      </span>
      <span className="truncate">{children}</span>
    </>
  );

  const baseClasses = `group alex-button inline-flex items-center justify-center rounded-full transition-all duration-300 font-semibold ${selectedSize.btn} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      className={`${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
