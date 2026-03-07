import React from 'react';
import { cn } from '@/lib/utils';

interface MapShellProps {
  children: React.ReactNode;
  className?: string;
  summaryBar?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
}

/**
 * Command-centre layout shell.
 * Renders a full-height map area with optional overlay zones:
 *  - summaryBar: top bar across the full width
 *  - leftPanel: left side controls/filters (absolute overlay)
 *  - rightPanel: right side detail drawer (absolute overlay)
 *  - bottomLeft / bottomRight: floating cards at bottom corners
 *  - children: the <MapLibreMap /> itself
 */
const MapShell: React.FC<MapShellProps> = ({
  children,
  className,
  summaryBar,
  leftPanel,
  rightPanel,
  bottomLeft,
  bottomRight,
}) => {
  return (
    <div className={cn('relative w-full h-full min-h-[calc(100vh-64px)]', className)}>
      {/* Map fills entire container */}
      {children}

      {/* Summary bar — top */}
      {summaryBar && (
        <div className="absolute top-4 left-4 right-4 z-20">
          {summaryBar}
        </div>
      )}

      {/* Left panel — below summary bar */}
      {leftPanel && (
        <div className="absolute top-20 left-4 z-20 max-w-xs w-full">
          {leftPanel}
        </div>
      )}

      {/* Right panel — detail drawer */}
      {rightPanel && (
        <div className="absolute top-20 right-4 bottom-4 z-20 w-80 max-w-[calc(100vw-2rem)]">
          {rightPanel}
        </div>
      )}

      {/* Bottom-left floating card */}
      {bottomLeft && (
        <div className="absolute bottom-6 left-4 z-20 max-w-xs">
          {bottomLeft}
        </div>
      )}

      {/* Bottom-right floating card */}
      {bottomRight && (
        <div className="absolute bottom-6 right-4 z-20">
          {bottomRight}
        </div>
      )}
    </div>
  );
};

export default MapShell;
