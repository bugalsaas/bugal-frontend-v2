'use client';

import React from 'react';

interface DescriptionItemProps {
  title: string;
  content: React.ReactNode;
  titleColSizePx?: number;
}

export function DescriptionItem({ title, content, titleColSizePx }: DescriptionItemProps) {
  return (
    <div className="flex items-start space-x-4 py-2">
      <div 
        className="text-sm font-medium text-gray-700 flex-shrink-0"
        style={titleColSizePx ? { width: `${titleColSizePx}px` } : {}}
      >
        {title}:
      </div>
      <div className="text-sm text-gray-900 flex-1">
        {content}
      </div>
    </div>
  );
}
