'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { listApplications, withdrawApplication } from '@/lib/api-applications';
import { RentalApplicationListItem, ApplicationStatus } from '@/types/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Home, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ApplicationsPageContent />
    </Suspense>
  );
}

function ApplicationsPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [applications, setApplications] = useState<RentalApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');

  // Show success message if redirected after submission
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: 'Application submitted!',
        description: 'Your rental application has been successfully submitted.',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await listApplications({
        status: filter !== 'all' ? filter : undefined,
        page: 1,
        pageSize: 50,
        sortBy: 'submitted',
        sortOrder: 'desc',
      });

      setApplications(response.applications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await withdrawApplication(id);
      toast({
        title: 'Application withdrawn',
        description: 'Your application has been withdrawn.',
      });
      fetchApplications();
    } catch (err) {
      console.error('Failed to withdraw:', err);
      toast({
        title: 'Error',
        description: 'Failed to withdraw application.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants: Record<ApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [ApplicationStatus.Draft]: 'outline',
      [ApplicationStatus.Submitted]: 'secondary',
      [ApplicationStatus.UnderReview]: 'default',
      [ApplicationStatus.AdditionalInfoRequested]: 'secondary',
      [ApplicationStatus.Approved]: 'default',
      [ApplicationStatus.Rejected]: 'destructive',
      [ApplicationStatus.Withdrawn]: 'outline',
      [ApplicationStatus.Expired]: 'destructive',
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">My Applications</h1>
        <p className="text-muted-foreground">
          Track your rental applications and their status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(a =>
                a.status === ApplicationStatus.Submitted ||
                a.status === ApplicationStatus.UnderReview
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === ApplicationStatus.Approved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Rental Applications</CardTitle>
          <CardDescription>
            View and manage your property applications
          </CardDescription>
          {/* Filter Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === ApplicationStatus.Submitted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(ApplicationStatus.Submitted)}
            >
              Submitted
            </Button>
            <Button
              variant={filter === ApplicationStatus.Approved ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(ApplicationStatus.Approved)}
            >
              Approved
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                No applications yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Apply to properties you're interested in to see them here
              </p>
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Browse Properties
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/properties/${app.propertyId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {app.propertyTitle}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : 'Draft'}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>ZMW {app.monthlyIncome.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {app.status === ApplicationStatus.Submitted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(app.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                        {app.status === ApplicationStatus.Approved && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
