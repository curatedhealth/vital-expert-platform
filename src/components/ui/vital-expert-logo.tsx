'use client';

import React from 'react';

interface VitalExpertLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function VitalExpertLogo({ 
  size = 'md', 
  className = '',
  showText = true 
}: VitalExpertLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} font-bold ${className}`}>
      <span className="text-black">VITAL</span>
      <div className={`${dotSizeClasses[size]} rounded-full mx-2`} style={{ backgroundColor: '#04009A' }} />
      {showText && <span className="text-black lowercase">expert</span>}
    </div>
  );
}
