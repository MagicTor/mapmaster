'use client';

import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export const Card = ({ className = '', children, onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={`
      bg-white dark:bg-gray-800
      rounded-lg shadow-md
      p-6 transition-shadow hover:shadow-lg
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);
