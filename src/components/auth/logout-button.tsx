'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logoutAction();
        router.push('/login');
        router.refresh();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}

