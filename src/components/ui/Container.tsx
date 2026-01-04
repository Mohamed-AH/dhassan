import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  variant?: 'reading' | 'wide';
  className?: string;
}

export default function Container({
  children,
  variant = 'wide',
  className = '',
}: ContainerProps) {
  const variantClasses = {
    reading: 'container-reading',
    wide: 'container-wide',
  };

  const combinedClasses = `${variantClasses[variant]} ${className}`;

  return <div className={combinedClasses}>{children}</div>;
}
