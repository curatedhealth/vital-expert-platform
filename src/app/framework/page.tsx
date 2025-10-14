'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FrameworkPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page with framework section anchor
    router.push('/#framework');
  }, [router]);

  return (
    <div className="min-h-screen bg-vital-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-regulatory-blue mx-auto mb-4"></div>
        <p className="text-vital-gray-60">Redirecting to framework section...</p>
      </div>
    </div>
  );
}