'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { listApplications } from '@/lib/api-applications';
import { getPropertyById } from '@/lib/api-properties';
import { RentalApplicationListItem, ApplicationStatus } from '@/types/application';
import { PropertyResponse } from '@/types/property';
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
import { Loader2, AlertCircle, FileText, Eye, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StorageImage } from '@/components/ui/storage-image';

export default function PropertyApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [applications, setApplications] = useState<RentalApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch property and applications in parallel
        const [propertyData, applicationsData] = await Promise.all([
          getPropertyById(propertyId),
          listApplications({
            propertyId,
            page: 1,
            pageSize: 100,
            sortBy: 'submitted',
            sortOrder: 'desc',
          }),
        ]);

        setProperty(propertyData);
        setApplications(applicationsData.applications);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const getStatusBadge = (status: ApplicationStatus | string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      [ApplicationStatus.Draft]: { variant: 'outline' },
      [ApplicationStatus.Submitted]: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      [ApplicationStatus.UnderReview]: { variant: 'default', className: 'bg-orange-100 text-orange-800' },
      [ApplicationStatus.AdditionalInfoRequested]: { variant: 'secondary', className: 'bg-amber-100 text-amber-800' },
      [ApplicationStatus.Approved]: { variant: 'default', className: 'bg-green-100 text-green-800' },
      [ApplicationStatus.Rejected]: { variant: 'destructive' },
      [ApplicationStatus.Withdrawn]: { variant: 'outline' },
      [ApplicationStatus.Expired]: { variant: 'destructive' },
    };

    const statusConfig = config[status] || { variant: 'outline' as const };
    return <Badge variant={statusConfig.variant} className={statusConfig.className}>{status}</Badge>;
  };

  const pendingCount = applications.filter(
    (a) => a.status === ApplicationStatus.Submitted || a.status === ApplicationStatus.UnderReview
  ).length;

  const approvedCount = applications.filter((a) => a.status === ApplicationStatus.Approved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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

  const imageUrl = property?.images && property.images.length > 0
    ? property.images[0]
    : `https://picsum.photos/seed/${propertyId}/200/150`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/landlord/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">Property Applications</h1>
          <p className="text-muted-foreground">View applications for this property</p>
        </div>
      </div>

      {/* Property Summary */}
      {property && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <StorageImage
                  src={imageUrl}
                  alt={property.title}
                  fill
                  className="object-cover"
                  fallbackSrc={`https://picsum.photos/seed/${propertyId}/200/150`}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold font-headline">{property.title}</h2>
                <p className="text-muted-foreground">
                  {property.city}, {property.province}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  <span className="font-semibold">
                    {property.currency} {property.price.toLocaleString()}/mo
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Badge>{property.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
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
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Applications</CardTitle>
          <CardDescription>
            {applications.length === 0
              ? 'No applications have been submitted for this property yet.'
              : `${applications.length} application${applications.length !== 1 ? 's' : ''} received`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">No applications yet</p>
              <p className="text-sm text-muted-foreground">
                Applications will appear here when tenants apply to rent this property.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Move-in Date</TableHead>
                  <TableHead>Lease Term</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.tenantName}</TableCell>
                    <TableCell>
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>ZMW {app.monthlyIncome.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(app.desiredMoveInDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{app.leaseTermMonths} months</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/landlord/applications/${app.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
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

