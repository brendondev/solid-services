'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { Toaster } from 'react-hot-toast';
import { CommandPaletteProvider } from '@/components/command-palette';
import { NotificationsProvider } from '@/contexts/notifications/NotificationsContext';
import ToastContainer from '@/components/notifications/ToastContainer';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = authApi.getStoredUser();
    const token = authApi.getStoredToken();

    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }

    setUser(storedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CommandPaletteProvider>
      <NotificationsProvider>
        <Toaster />
        <ToastContainer />
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </NotificationsProvider>
    </CommandPaletteProvider>
  );
}
