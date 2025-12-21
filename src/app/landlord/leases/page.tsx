'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listLeases } from '@/lib/api-leases';
import { LeaseAgreementListItem, LeaseStatus } from '@/types/lease';
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
import { Loader2, AlertCircle, FileText, Eye, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function LandlordLeasesPage() {
  const router = useRouter();
  const [leases, setLeases] = useState<LeaseAgreementListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | LeaseStatus>('all');

  useEffect(() => {
    fetchLeases();
  }, [filter]);

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await listLeases({
        status: filter !== 'all' ? filter : undefined,
        page: 1,
        pageSize: 100,
        sortBy: 'startdate',
        sortOrder: 'desc',
      });

      setLeases(response.leases);
    } catch (err) {
      console.error('Failed to fetch leases:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leases');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: LeaseStatus | string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }> = {
      [LeaseStatus.Draft]: { variant: 'outline' },
      [LeaseStatus.PendingTenantSignature]: { variant: 'secondary', className: 'bg-amber-100 text-amber-800' },
      [LeaseStatus.PendingLandlordSignature]: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      [LeaseStatus.Active]: { variant: 'default', className: 'bg-green-100 text-green-800' },
      [LeaseStatus.Expired]: { variant: 'destructive' },
      [LeaseStatus.Terminated]: { variant: 'destructive' },
      [LeaseStatus.Renewed]: { variant: 'outline' },
    };

    const statusConfig = config[status] || { variant: 'outline' as const };
    return <Badge variant={statusConfig.variant} className={statusConfig.className}>{status}</Badge>;
  };

  const activeCount = leases.filter(l => l.status === LeaseStatus.Active).length;
  const pendingCount = leases.filter(l =>
    l.status === LeaseStatus.PendingTenantSignature ||
    l.status === LeaseStatus.PendingLandlordSignature
  ).length;
  const expiringSoonCount = leases.filter(l => {
    if (l.status !== LeaseStatus.Active) return false;
    const endDate = new Date(l.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">Lease Agreements</h1>
          <p className="text-muted-foreground">
            Manage lease agreements for your properties
          </p>
        </div>
        <Button asChild>
          <Link href="/landlord/leases/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Lease
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoonCount}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Lease Agreements</CardTitle>
          <CardDescription>
            View and manage all your lease agreements
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
              variant={filter === LeaseStatus.Active ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(LeaseStatus.Active)}
            >
              Active
            </Button>
            <Button
              variant={filter === LeaseStatus.PendingTenantSignature ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(LeaseStatus.PendingTenantSignature)}
            >
              Pending Signature
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {leases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                No lease agreements yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a lease agreement to get started
              </p>
              <Button asChild>
                <Link href="/landlord/leases/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lease
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => {
                  const endDate = new Date(lease.endDate);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = lease.status === LeaseStatus.Active && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                  return (
                    <TableRow key={lease.id} className={isExpiringSoon ? 'bg-orange-50' : ''}>
                      <TableCell className="font-medium">
                        {lease.propertyTitle}
                      </TableCell>
                      <TableCell>{lease.tenantName}</TableCell>
                      <TableCell>
                        {new Date(lease.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(lease.endDate).toLocaleDateString()}
                        {isExpiringSoon && (
                          <span className="block text-xs text-orange-600">
                            Expires in {daysUntilExpiry} days
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(lease.status)}</TableCell>
                      <TableCell className="font-semibold">
                        ZMW {lease.monthlyRent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/landlord/leases/${lease.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

