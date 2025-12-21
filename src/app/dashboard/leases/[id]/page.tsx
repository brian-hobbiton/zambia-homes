'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLease } from '@/lib/api-leases';
import { listPayments } from '@/lib/api-payments';
import { LeaseAgreementResponse } from '@/types/lease';
import { PaymentScheduleListItem } from '@/types/payment';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, FileText, Download, Mail, Calendar, DollarSign, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function TenantLeaseDetailsPage() {
  const params = useParams();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<LeaseAgreementResponse | null>(null);
  const [payments, setPayments] = useState<PaymentScheduleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [leaseData, paymentsData] = await Promise.all([
          getLease(leaseId),
          listPayments({
            leaseId: leaseId,
            page: 1,
            pageSize: 100,
            sortBy: 'duedate',
            sortOrder: 'asc',
          }),
        ]);

        setLease(leaseData);
        setPayments(paymentsData.payments);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lease');
      } finally {
        setIsLoading(false);
      }
    };

    if (leaseId) {
      fetchData();
    }
  }, [leaseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lease) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error || 'Lease not found.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">
          Lease Agreement
        </h1>
        <p className="text-muted-foreground">
          {lease.propertyTitle}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{lease.propertyTitle}</p>
              <p className="text-sm text-muted-foreground mb-3">{lease.propertyAddress}</p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/properties/${lease.propertyId}`}>
                  View Property
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Landlord Info */}
          <Card>
            <CardHeader>
              <CardTitle>Landlord Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{lease.landlordName}</p>
              <div className="space-y-1 text-sm">
                {lease.landlordEmail && <p>{lease.landlordEmail}</p>}
                {lease.landlordPhone && <p>{lease.landlordPhone}</p>}
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={`mailto:${lease.landlordEmail}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Landlord
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Lease Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lease Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Start Date</dt>
                  <dd className="font-medium text-lg">
                    {new Date(lease.startDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">End Date</dt>
                  <dd className="font-medium text-lg">
                    {new Date(lease.endDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Type</dt>
                  <dd className="font-medium text-lg">{lease.leaseType}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Monthly Rent</dt>
                  <dd className="font-bold text-xl text-primary">
                    {lease.currency} {lease.monthlyRent.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Security Deposit</dt>
                  <dd className="font-semibold text-lg">
                    {lease.currency} {lease.securityDeposit.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Payment Due Day</dt>
                  <dd className="font-medium">Day {lease.paymentDueDay}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Late Fee</dt>
                  <dd className="font-medium">
                    {lease.lateFeeAmount ? `${lease.currency} ${lease.lateFeeAmount}` : 'None'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lease Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Signed Lease
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          {/* Property Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Property Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Pets</dt>
                  <dd className="font-medium">
                    {lease.petsAllowed ? 'Allowed' : 'Not Allowed'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Smoking</dt>
                  <dd className="font-medium">
                    {lease.smokingAllowed ? 'Allowed' : 'Not Allowed'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Subletting</dt>
                  <dd className="font-medium">
                    {lease.sublettingAllowed ? 'Allowed' : 'Not Allowed'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Utilities */}
          {lease.utilitiesIncluded && lease.utilitiesIncluded.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Utilities Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lease.utilitiesIncluded.map((utility, index) => (
                    <Badge key={index} variant="secondary">{utility}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance */}
          {lease.maintenanceResponsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lease.maintenanceResponsibilities}</p>
              </CardContent>
            </Card>
          )}

          {/* Special Terms */}
          {lease.specialTerms && (
            <Card>
              <CardHeader>
                <CardTitle>Special Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lease.specialTerms}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>
                View your payment schedule for this lease
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{new Date(payment.dueDate).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{payment.leasePropertyTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">ZMW {payment.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No payments scheduled</p>
              )}
              <Button asChild className="mt-4">
                <Link href="/dashboard/payments">
                  View All Payments
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

