'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/auth';
import { clearAuthTokens } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logoutAction();
        // Clear tokens from localStorage
        clearAuthTokens();
        router.push('/login');
        router.refresh();
      } catch (error) {
        console.error('Logout failed:', error);
        // Still clear tokens even if server action fails
        clearAuthTokens();
        router.push('/login');
        router.refresh();
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

