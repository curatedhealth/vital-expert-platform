/**
 * AssetResultsCount - Shared results count display for asset pages
 *
 * Used by: Agents, Tools, Skills, Prompts, Knowledge pages
 */
'use client';

import React from 'react';

export interface AssetResultsCountProps {
  count: number;
  singular: string;
  plural?: string;
  className?: string;
}

export function AssetResultsCount({
  count,
  singular,
  plural,
  className = '',
}: AssetResultsCountProps) {
  const label = count === 1 ? singular : (plural || `${singular}s`);

  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {count.toLocaleString()} {label} found
    </p>
  );
}

export default AssetResultsCount;
