'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { listPropertyInquiries } from '@/lib/api-inquiries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Mail, FileText, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TenantDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch inquiries count
        const inquiriesResponse = await listPropertyInquiries({
          page: 1,
          pageSize: 1,
        });
        setInquiriesCount(inquiriesResponse.totalCount);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isAuthLoading && user) {
      fetchDashboardData();
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Please log in to access your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">
          Welcome back, {user.firstName || user.username}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your rental journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Properties you've saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiriesCount}</div>
            <p className="text-xs text-muted-foreground">Messages to landlords</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Rental applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lease</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Current rental</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you find your next home</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
            <Link href="/">
              <Home className="h-5 w-5" />
              <div>
                <div className="font-semibold">Browse Properties</div>
                <div className="text-xs text-muted-foreground">Find your next home</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
            <Link href="/dashboard/saved">
              <Heart className="h-5 w-5" />
              <div>
                <div className="font-semibold">Saved Properties</div>
                <div className="text-xs text-muted-foreground">View your favorites</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
            <Link href="/dashboard/inquiries">
              <Mail className="h-5 w-5" />
              <div>
                <div className="font-semibold">My Inquiries</div>
                <div className="text-xs text-muted-foreground">Track your messages</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
            <Link href="/dashboard/applications">
              <FileText className="h-5 w-5" />
              <div>
                <div className="font-semibold">Applications</div>
                <div className="text-xs text-muted-foreground">Manage applications</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
            <Link href="/dashboard/profile">
              <FileText className="h-5 w-4" />
              <div>
                <div className="font-semibold">Complete Profile</div>
                <div className="text-xs text-muted-foreground">Update your details</div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet.</p>
            <p className="text-sm mt-2">Start browsing properties to see your activity here.</p>
          </div>
        </CardContent>
      </Card>

      {/* Tips for Tenants */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Tips for Finding Your Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Complete Your Profile</p>
              <p className="text-sm text-muted-foreground">
                Landlords prefer tenants with complete profiles. Add your details and verification documents.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Respond Quickly</p>
              <p className="text-sm text-muted-foreground">
                Properties go fast. Respond to landlord messages within 24 hours to show you're serious.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Ask Questions</p>
              <p className="text-sm text-muted-foreground">
                Don't hesitate to ask landlords about utilities, maintenance, and neighborhood amenities.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              4
            </div>
            <div>
              <p className="font-medium">Save Properties</p>
              <p className="text-sm text-muted-foreground">
                Use the save feature to create a shortlist of your favorite properties for easy comparison.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

