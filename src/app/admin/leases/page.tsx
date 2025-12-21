'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLeasesPage() {
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
        pageSize: 500,
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

  const getStatusBadge = (status: LeaseStatus) => {
    const config: Record<LeaseStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      [LeaseStatus.Draft]: { variant: 'outline' },
      [LeaseStatus.PendingTenantSignature]: { variant: 'secondary' },
      [LeaseStatus.PendingLandlordSignature]: { variant: 'secondary' },
      [LeaseStatus.Active]: { variant: 'default' },
      [LeaseStatus.Expired]: { variant: 'destructive' },
      [LeaseStatus.Terminated]: { variant: 'destructive' },
      [LeaseStatus.Renewed]: { variant: 'outline' },
    };

    const { variant } = config[status];
    return <Badge variant={variant}>{status}</Badge>;
  };

  const stats = {
    total: leases.length,
    active: leases.filter(l => l.status === LeaseStatus.Active).length,
    expiringSoon: leases.filter(l => {
      if (l.status !== LeaseStatus.Active) return false;
      const endDate = new Date(l.endDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
    pendingSignature: leases.filter(l =>
      l.status === LeaseStatus.PendingTenantSignature || l.status === LeaseStatus.PendingLandlordSignature
    ).length,
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
        <h1 className="text-3xl font-bold font-headline mb-2">Leases Oversight</h1>
        <p className="text-muted-foreground">
          Monitor all lease agreements system-wide
        </p>
      </div>

      {/* Alert for Expiring Leases */}
      {stats.expiringSoon > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {stats.expiringSoon} lease(s) expiring within 30 days. Please monitor for renewals.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingSignature}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Leases</CardTitle>
          <CardDescription>
            View all lease agreements in the system
          </CardDescription>
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
              variant={filter === LeaseStatus.Expired ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(LeaseStatus.Expired)}
            >
              Expired
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Landlord</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
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
                    <TableCell className="font-medium">{lease.propertyTitle}</TableCell>
                    <TableCell>{lease.tenantName}</TableCell>
                    <TableCell>{lease.landlordName}</TableCell>
                    <TableCell>{new Date(lease.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {new Date(lease.endDate).toLocaleDateString()}
                      {isExpiringSoon && (
                        <span className="block text-xs text-orange-600">
                          Expires in {daysUntilExpiry} days
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ZMW {lease.monthlyRent.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(lease.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

