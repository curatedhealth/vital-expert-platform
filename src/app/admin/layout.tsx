'use client';

import { Shield } from 'lucide-react';

import AdminClientWrapper from '@/components/admin/AdminClientWrapper';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminClientWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
              <div className="flex items-center flex-shrink-0 px-4">
                <Shield className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">
                    Super Admin
                  </p>
                </div>
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <AdminNav className="px-2" />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </AdminClientWrapper>
  );
}
