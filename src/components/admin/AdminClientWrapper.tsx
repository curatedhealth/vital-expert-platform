'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { Loader2 } from 'lucide-react';

interface AdminClientWrapperProps {
  children: React.ReactNode;
}

export default function AdminClientWrapper({ children }: AdminClientWrapperProps) {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || loading) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // Check if user has admin role
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    
    if (!isAdmin) {
      console.log('User is not admin, redirecting to forbidden');
      router.push('/admin/forbidden');
      return;
    }

    console.log('User authorized for admin access:', user.email, 'Role:', user.role);
  }, [user, loading, isInitialized, router]);

  // Show loading while auth is initializing
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authorization
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
