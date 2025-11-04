'use client';

import dynamic from 'next/dynamic';

// Dynamic import with no SSR to prevent DOM access during server rendering
const SonnerToaster = dynamic(
  () => import('sonner').then((mod) => mod.Toaster),
  { ssr: false }
);

export function Toaster() {
  return <SonnerToaster position="top-right" richColors closeButton />;
}

