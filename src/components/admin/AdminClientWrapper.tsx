'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface AdminClientWrapperProps {
  children: React.ReactNode;
}

export default function AdminClientWrapper({ children }: AdminClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait a bit for session to be available
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          router.push('/login');
          return;
        }
        
        if (!session?.user) {
          console.log('No session found, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('Session found for user:', session.user.email);

        // Check if user is admin based on email
        const isAdmin = session.user.email === 'hn@vitalexpert.com' || 
                       session.user.email?.includes('admin') || 
                       session.user.email?.includes('manager');

        if (!isAdmin) {
          console.log('User is not admin, redirecting to forbidden');
          router.push('/admin/forbidden');
          return;
        }

        console.log('User authorized for admin access');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out, redirecting to login');
          router.push('/login');
          return;
        }
        
        if (session?.user) {
          const isAdmin = session.user.email === 'hn@vitalexpert.com' || 
                         session.user.email?.includes('admin') || 
                         session.user.email?.includes('manager');
          
          if (isAdmin) {
            console.log('User authorized via auth state change');
            setIsAuthorized(true);
            setIsLoading(false);
          } else {
            console.log('User not admin via auth state change');
            router.push('/admin/forbidden');
          }
        }
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
