'use client';

import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ className = '', children, onClick }) => (
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
