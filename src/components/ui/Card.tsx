import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat';
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'elevated',
  className = '',
  onClick,
}: CardProps) {
  const variantClasses = {
    elevated: 'card-elevated',
    flat: 'card-flat',
  };

  const combinedClasses = `${variantClasses[variant]} ${className}`;

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
}
