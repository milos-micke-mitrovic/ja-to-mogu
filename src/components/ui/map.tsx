'use client';

import dynamic from 'next/dynamic';
import { Spinner } from './spinner';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  markerTitle?: string;
}

// Dynamically import the map implementation with SSR disabled
const MapImplementation = dynamic(
  () => import('./map-implementation').then((mod) => mod.MapImplementation),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[200px] w-full items-center justify-center rounded-lg bg-muted">
        <Spinner size="md" />
      </div>
    ),
  }
);

export function Map(props: MapProps) {
  return <MapImplementation {...props} />;
}
