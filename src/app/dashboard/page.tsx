'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, role } = useAuth();

  // Redirect based on role after auth is loaded
  useEffect(() => {
    if (!isLoading && user) {
      // Redirect landlords and admins to their dashboards
      if (user.role === 'landlord') {
        router.push('/landlord');
      } else if (user.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Authenticated</CardTitle>
          <CardDescription>Please log in to view your dashboard.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">
          Welcome back, {user.firstName || user.username || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your account today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="capitalize">
              Active
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="capitalize">
              {role || 'user'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Email Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              Not Verified
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-sm text-muted-foreground">Full Name</dt>
              <dd className="text-lg">{user.fullName || 'Not set'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-sm text-muted-foreground">Email</dt>
              <dd className="text-lg">{user.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-sm text-muted-foreground">Username</dt>
              <dd className="text-lg">{user.username || 'Not set'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-sm text-muted-foreground">User ID</dt>
              <dd className="text-sm font-mono text-muted-foreground">{user.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {role === 'landlord' && (
              <p>• <a href="/landlord/properties/add" className="text-primary hover:underline">Add a new property</a></p>
            )}
            {role === 'tenant' && (
              <p>• <a href="/properties" className="text-primary hover:underline">Browse available properties</a></p>
            )}
            <p>• <a href="/messaging" className="text-primary hover:underline">View messages</a></p>
            <p>• <a href="/profile" className="text-primary hover:underline">Update your profile</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

