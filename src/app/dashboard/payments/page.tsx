'use client';

import { useEffect, useState } from 'react';
import { listLeases } from '@/lib/api-leases';
import { listPayments } from '@/lib/api-payments';
import { LeaseAgreementListItem, LeaseStatus } from '@/types/lease';
import { PaymentScheduleListItem, PaymentStatus } from '@/types/payment';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TenantPaymentsPage() {
  const [leases, setLeases] = useState<LeaseAgreementListItem[]>([]);
  const [payments, setPayments] = useState<PaymentScheduleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [leasesData, paymentsData] = await Promise.all([
        listLeases({
          status: LeaseStatus.Active,
          page: 1,
          pageSize: 100,
        }),
        listPayments({
          page: 1,
          pageSize: 100,
          sortBy: 'duedate',
          sortOrder: 'asc',
        }),
      ]);

      setLeases(leasesData.leases);
      setPayments(paymentsData.payments);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }> = {
      [PaymentStatus.Pending]: { variant: 'outline', className: 'bg-gray-100 text-gray-800' },
      [PaymentStatus.PartiallyPaid]: { variant: 'secondary', className: 'bg-amber-100 text-amber-800' },
      [PaymentStatus.Paid]: { variant: 'default', className: 'bg-green-100 text-green-800' },
      [PaymentStatus.Overdue]: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      [PaymentStatus.Waived]: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
      [PaymentStatus.Refunded]: { variant: 'outline', className: 'bg-purple-100 text-purple-800' },
      [PaymentStatus.Cancelled]: { variant: 'outline', className: 'bg-gray-100 text-gray-800' },
    };

    const { variant, className } = config[status];
    return <Badge variant={variant} className={className}>{status}</Badge>;
  };

  const upcomingPayments = payments.filter(p =>
    p.status === PaymentStatus.Pending || p.status === PaymentStatus.PartiallyPaid
  );
  const overduePayments = payments.filter(p => p.status === PaymentStatus.Overdue);
  const totalDue = upcomingPayments.reduce((sum, p) => sum + (p.amount - p.amountPaid), 0);

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
        <h1 className="text-3xl font-bold font-headline mb-2">My Payments</h1>
        <p className="text-muted-foreground">
          View your payment schedule and make payments
        </p>
      </div>

      {/* Alert for Overdue */}
      {overduePayments.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {overduePayments.length} overdue payment(s). Please make payment immediately to avoid penalties.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingPayments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ZMW {totalDue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Payment Schedule</CardTitle>
          <CardDescription>
            Your upcoming and past rental payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No active payments
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const isPending = payment.status === PaymentStatus.Pending || payment.status === PaymentStatus.PartiallyPaid;
                  const isOverdue = payment.status === PaymentStatus.Overdue;
                  const remaining = payment.amount - payment.amountPaid;

                  return (
                    <TableRow
                      key={payment.id}
                      className={isOverdue ? 'bg-red-50' : isPending ? 'bg-yellow-50' : ''}
                    >
                      <TableCell className="font-medium">{payment.leasePropertyTitle}</TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString()}
                        {isOverdue && (
                          <span className="block text-xs text-red-600">Overdue</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ZMW {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ZMW {payment.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className={remaining > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        ZMW {remaining.toLocaleString()}
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Make Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Contact Your Landlord</p>
                <p className="text-sm text-muted-foreground">
                  Get the payment details and preferred payment method
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">Make Payment</p>
                <p className="text-sm text-muted-foreground">
                  Use bank transfer, mobile money, or your landlord's preferred method
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Save Receipt</p>
                <p className="text-sm text-muted-foreground">
                  Keep your payment receipt and transaction reference for records
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <p className="font-medium">Track Status</p>
                <p className="text-sm text-muted-foreground">
                  Your landlord will update payment status after receiving payment
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

