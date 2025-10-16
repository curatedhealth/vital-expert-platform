'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatEnhancedPage() {
  useEffect(() => {
    // Redirect to main chat page to ensure consistent behavior
    redirect('/chat');
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to Chat...</h2>
        <p className="text-gray-600">Please wait while we redirect you to the main chat interface.</p>
      </div>
    </div>
  );
}
