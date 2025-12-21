'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLease, terminateLease } from '@/lib/api-leases';
import { LeaseAgreementResponse, LeaseStatus, TerminationReason } from '@/types/lease';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, FileText, XCircle, Download, Calendar, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<LeaseAgreementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationNotes, setTerminationNotes] = useState('');
  const [terminationReason, setTerminationReason] = useState<TerminationReason>(TerminationReason.EndOfTerm);

  useEffect(() => {
    if (!leaseId) return;

    const fetchLease = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getLease(leaseId);
        setLease(data);
      } catch (err) {
        console.error('Failed to fetch lease:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lease');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLease();
  }, [leaseId]);

  const handleTerminate = async () => {
    if (!lease) return;

    try {
      setIsTerminating(true);

      await terminateLease(lease.id, {
        terminationDate: new Date().toISOString().split('T')[0],
        reason: terminationReason,
        notes: terminationNotes,
      });

      toast({
        title: 'Lease Terminated',
        description: 'The lease agreement has been terminated.',
      });

      router.push('/landlord/leases');
    } catch (err) {
      console.error('Failed to terminate lease:', err);
      toast({
        title: 'Error',
        description: 'Failed to terminate lease. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTerminating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Lease not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

  const canTerminate = lease.status === LeaseStatus.Active;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">
            Lease Agreement
          </h1>
          <p className="text-muted-foreground">
            {lease.propertyTitle} - {lease.tenantName}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(lease.status)}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Property & Parties */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">{lease.propertyTitle}</p>
                <p className="text-sm text-muted-foreground mb-3">{lease.propertyAddress}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/properties/${lease.propertyId}`}>
                    View Property
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">{lease.tenantName}</p>
                <div className="space-y-1 text-sm">
                  {lease.tenantEmail && <p>{lease.tenantEmail}</p>}
                  {lease.tenantPhone && <p>{lease.tenantPhone}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <dt className="text-sm text-muted-foreground">Lease Type</dt>
                  <dd className="font-medium text-lg">{lease.leaseType}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Terms</CardTitle>
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
                  <dd className="font-medium">{lease.paymentDueDay} of each month</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Late Fee</dt>
                  <dd className="font-medium">
                    {lease.lateFeeAmount ? `${lease.currency} ${lease.lateFeeAmount}` : 'None'}
                    {lease.lateFeeGraceDays && (
                      <span className="block text-xs text-muted-foreground">
                        {lease.lateFeeGraceDays} days grace
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Signatures */}
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Tenant Signature</dt>
                  {lease.tenantSignedAt ? (
                    <dd className="flex items-center gap-2 text-green-600">
                      <FileText className="h-4 w-4" />
                      Signed on {new Date(lease.tenantSignedAt).toLocaleDateString()}
                    </dd>
                  ) : (
                    <dd className="text-amber-600">Pending</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Landlord Signature</dt>
                  {lease.landlordSignedAt ? (
                    <dd className="flex items-center gap-2 text-green-600">
                      <FileText className="h-4 w-4" />
                      Signed on {new Date(lease.landlordSignedAt).toLocaleDateString()}
                    </dd>
                  ) : (
                    <dd className="text-amber-600">Pending</dd>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {canTerminate && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Terminate Lease
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Terminate Lease Agreement?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will terminate the lease agreement. Please provide a reason and notes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="terminationReason">Reason</Label>
                        <Select
                          value={terminationReason}
                          onValueChange={(value) => setTerminationReason(value as TerminationReason)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TerminationReason.EndOfTerm}>End of Term</SelectItem>
                            <SelectItem value={TerminationReason.EarlyTerminationByTenant}>Early Termination by Tenant</SelectItem>
                            <SelectItem value={TerminationReason.EarlyTerminationByLandlord}>Early Termination by Landlord</SelectItem>
                            <SelectItem value={TerminationReason.Eviction}>Eviction</SelectItem>
                            <SelectItem value={TerminationReason.MutualAgreement}>Mutual Agreement</SelectItem>
                            <SelectItem value={TerminationReason.Breach}>Breach of Contract</SelectItem>
                            <SelectItem value={TerminationReason.Other}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminationNotes">Notes</Label>
                        <Textarea
                          id="terminationNotes"
                          value={terminationNotes}
                          onChange={(e) => setTerminationNotes(e.target.value)}
                          placeholder="Additional details about the termination..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleTerminate}
                        disabled={isTerminating}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isTerminating ? 'Terminating...' : 'Terminate'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>
                View and manage payment schedule for this lease
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="text-2xl font-bold text-primary">
                    {lease.currency} {lease.monthlyRent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Due Day</p>
                  <p className="text-2xl font-bold">{lease.paymentDueDay}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Late Fee</p>
                  <p className="text-2xl font-bold">
                    {lease.lateFeeAmount ? `${lease.currency} ${lease.lateFeeAmount}` : 'None'}
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/landlord/leases/${lease.id}/payments`}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Manage Payment Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Lease Documents</CardTitle>
              <CardDescription>
                Signed agreements and related documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Document management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

