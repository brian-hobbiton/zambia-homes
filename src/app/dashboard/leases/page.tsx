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
import { Loader2, AlertCircle, FileText, Eye, Download, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function TenantLeasesPage() {
  const router = useRouter();
  const [leases, setLeases] = useState<LeaseAgreementListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await listLeases({
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

  const getStatusBadge = (status: LeaseStatus) => {
    const config: Record<LeaseStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }> = {
      [LeaseStatus.Draft]: { variant: 'outline' },
      [LeaseStatus.PendingTenantSignature]: { variant: 'secondary', className: 'bg-amber-100 text-amber-800' },
      [LeaseStatus.PendingLandlordSignature]: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      [LeaseStatus.Active]: { variant: 'default', className: 'bg-green-100 text-green-800' },
      [LeaseStatus.Expired]: { variant: 'destructive' },
      [LeaseStatus.Terminated]: { variant: 'destructive' },
      [LeaseStatus.Renewed]: { variant: 'outline' },
    };

    const { variant, className } = config[status];
    return <Badge variant={variant} className={className}>{status}</Badge>;
  };

  const activeLeases = leases.filter(l => l.status === LeaseStatus.Active);
  const pendingLeases = leases.filter(l =>
    l.status === LeaseStatus.PendingTenantSignature ||
    l.status === LeaseStatus.PendingLandlordSignature
  );

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
        <h1 className="text-3xl font-bold font-headline mb-2">My Leases</h1>
        <p className="text-muted-foreground">
          View and manage your rental lease agreements
        </p>
      </div>

      {/* Pending Signature Alert */}
      {pendingLeases.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Mail className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have {pendingLeases.length} lease(s) waiting for your signature. Please sign to activate the lease.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Leases Section */}
      {activeLeases.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">Active Leases</h2>
          <div className="grid gap-4">
            {activeLeases.map((lease) => (
              <Card key={lease.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{lease.propertyTitle}</CardTitle>
                      <CardDescription>
                        Landlord: {lease.landlordName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(lease.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{new Date(lease.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{new Date(lease.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-bold text-lg text-primary">
                        ZMW {lease.monthlyRent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/leases/${lease.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Signature Section */}
      {pendingLeases.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">Awaiting Signature</h2>
          <div className="grid gap-4">
            {pendingLeases.map((lease) => (
              <Card key={lease.id} className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{lease.propertyTitle}</CardTitle>
                      <CardDescription>
                        Landlord: {lease.landlordName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(lease.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-amber-900">
                    This lease is ready for your signature. Please review and sign to activate.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={`/lease/sign/${lease.id}`}>
                        Sign Lease
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/leases/${lease.id}`}>
                        Review Terms
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Leases Section */}
      {leases.filter(l => l.status === LeaseStatus.Expired || l.status === LeaseStatus.Terminated).length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">Past Leases</h2>
          <div className="space-y-2">
            {leases
              .filter(l => l.status === LeaseStatus.Expired || l.status === LeaseStatus.Terminated)
              .map((lease) => (
                <Card key={lease.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{lease.propertyTitle}</CardTitle>
                        <CardDescription>
                          {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(lease.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {leases.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                No leases yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Once your application is approved, a lease will appear here
              </p>
              <Button asChild>
                <Link href="/dashboard/applications">
                  View Applications
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

