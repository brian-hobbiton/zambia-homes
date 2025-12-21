'use client';

import { useEffect, useState } from 'react';
import { listPayments } from '@/lib/api-payments';
import { PaymentScheduleListItem, PaymentStatus, PaymentType } from '@/types/payment';
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

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentScheduleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await listPayments({
        status: filter !== 'all' ? filter : undefined,
        page: 1,
        pageSize: 500,
        sortBy: 'duedate',
        sortOrder: 'asc',
      });

      setPayments(response.payments);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      [PaymentStatus.Pending]: { variant: 'outline' },
      [PaymentStatus.PartiallyPaid]: { variant: 'secondary' },
      [PaymentStatus.Paid]: { variant: 'default' },
      [PaymentStatus.Overdue]: { variant: 'destructive' },
      [PaymentStatus.Waived]: { variant: 'outline' },
      [PaymentStatus.Refunded]: { variant: 'outline' },
      [PaymentStatus.Cancelled]: { variant: 'outline' },
    };

    const { variant } = config[status];
    return <Badge variant={variant}>{status}</Badge>;
  };

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === PaymentStatus.Paid).length,
    overdue: payments.filter(p => p.status === PaymentStatus.Overdue).length,
    pending: payments.filter(p => p.status === PaymentStatus.Pending || p.status === PaymentStatus.PartiallyPaid).length,
  };

  const totalDue = payments
    .filter(p => p.status !== PaymentStatus.Paid && p.status !== PaymentStatus.Waived && p.status !== PaymentStatus.Refunded)
    .reduce((sum, p) => sum + (p.amount - p.amountPaid), 0);

  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

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
        <h1 className="text-3xl font-bold font-headline mb-2">Payments Oversight</h1>
        <p className="text-muted-foreground">
          Monitor all payments and financial transactions system-wide
        </p>
      </div>

      {/* Alert for Overdue */}
      {stats.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {stats.overdue} overdue payment(s) detected. Immediate action may be required.
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ZMW {(totalPaid / 1000).toFixed(1)}K
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ZMW {(totalDue / 1000).toFixed(1)}K
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Payment Transactions</CardTitle>
          <CardDescription>
            View all payment transactions across the system
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
              variant={filter === PaymentStatus.Overdue ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(PaymentStatus.Overdue)}
            >
              Overdue
            </Button>
            <Button
              variant={filter === PaymentStatus.Pending ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(PaymentStatus.Pending)}
            >
              Pending
            </Button>
            <Button
              variant={filter === PaymentStatus.Paid ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(PaymentStatus.Paid)}
            >
              Paid
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const remaining = payment.amount - payment.amountPaid;
                const isOverdue = payment.status === PaymentStatus.Overdue;

                return (
                  <TableRow key={payment.id} className={isOverdue ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{payment.leasePropertyTitle}</TableCell>
                    <TableCell>{payment.leaseTenantName}</TableCell>
                    <TableCell>{payment.paymentType}</TableCell>
                    <TableCell>
                      {new Date(payment.dueDate).toLocaleDateString()}
                      {isOverdue && (
                        <span className="block text-xs text-red-600">Overdue</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ZMW {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600">
                      ZMW {payment.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className={remaining > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      ZMW {remaining.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
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

