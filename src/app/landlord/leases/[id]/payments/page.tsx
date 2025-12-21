'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLease } from '@/lib/api-leases';
import { listPayments, recordPayment, waivePayment } from '@/lib/api-payments';
import { LeaseAgreementResponse } from '@/types/lease';
import { PaymentScheduleResponse, PaymentStatus, PaymentType } from '@/types/payment';
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
import { Loader2, AlertCircle, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeasePaymentsPage() {
  const params = useParams();
  const leaseId = params.id as string;
  const { toast } = useToast();

  const [lease, setLease] = useState<LeaseAgreementResponse | null>(null);
  const [payments, setPayments] = useState<PaymentScheduleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingPaymentId, setRecordingPaymentId] = useState<string | null>(null);
  const [waiverPaymentId, setWaiverPaymentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [waiverReason, setWaiverReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [leaseId]);

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
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (paymentId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRecordingPaymentId(paymentId);

      await recordPayment(paymentId, {
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod,
        transactionReference: transactionRef || undefined,
      });

      toast({
        title: 'Payment recorded',
        description: `${paymentAmount} has been recorded.`,
      });

      setPaymentAmount('');
      setTransactionRef('');
      setPaymentMethod('Bank Transfer');
      fetchData();
    } catch (err) {
      console.error('Failed to record payment:', err);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRecordingPaymentId(null);
    }
  };

  const handleWaivePayment = async (paymentId: string) => {
    if (!waiverReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for waiving this payment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setWaiverPaymentId(paymentId);

      await waivePayment(paymentId, {
        reason: waiverReason,
      });

      toast({
        title: 'Payment waived',
        description: 'The payment has been waived.',
      });

      setWaiverReason('');
      fetchData();
    } catch (err) {
      console.error('Failed to waive payment:', err);
      toast({
        title: 'Error',
        description: 'Failed to waive payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setWaiverPaymentId(null);
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

  const totalDue = payments.reduce((sum, p) => {
    if (p.status !== PaymentStatus.Paid && p.status !== PaymentStatus.Waived && p.status !== PaymentStatus.Refunded) {
      return sum + (p.amount - p.amountPaid);
    }
    return sum;
  }, 0);

  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalWaived = payments.filter(p => p.status === PaymentStatus.Waived).reduce((sum, p) => sum + p.amount, 0);

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
        <h1 className="text-3xl font-bold font-headline mb-2">Payment Schedule</h1>
        <p className="text-muted-foreground">
          Manage payments for {lease?.propertyTitle}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {lease?.currency} {lease?.monthlyRent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lease?.currency} {totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {lease?.currency} {totalDue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Waived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {lease?.currency} {totalWaived.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Payment Schedule</CardTitle>
          <CardDescription>
            View and manage payment schedule for this lease
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const isPending = payment.status === PaymentStatus.Pending || payment.status === PaymentStatus.PartiallyPaid;
                const isOverdue = payment.status === PaymentStatus.Overdue;

                return (
                  <TableRow
                    key={payment.id}
                    className={isOverdue ? 'bg-red-50' : isPending ? 'bg-yellow-50' : ''}
                  >
                    <TableCell className="font-medium">{payment.paymentType}</TableCell>
                    <TableCell>
                      {new Date(payment.dueDate).toLocaleDateString()}
                      {isOverdue && (
                        <span className="block text-xs text-red-600">Overdue</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {lease?.currency} {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {lease?.currency} {payment.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isPending && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Record
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Payment</DialogTitle>
                                <DialogDescription>
                                  Record payment for {payment.paymentType}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Amount Due: {lease?.currency} {payment.amount.toLocaleString()}</Label>
                                  <Label htmlFor="amount">Amount Paid</Label>
                                  <Input
                                    id="amount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="method">Payment Method</Label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                      <SelectItem value="Cash">Cash</SelectItem>
                                      <SelectItem value="Check">Check</SelectItem>
                                      <SelectItem value="Online">Online Payment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="ref">Transaction Reference (Optional)</Label>
                                  <Input
                                    id="ref"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    placeholder="e.g., TXN123456"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setPaymentAmount('');
                                    setTransactionRef('');
                                  }}
                                  disabled={recordingPaymentId === payment.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleRecordPayment(payment.id)}
                                  disabled={recordingPaymentId === payment.id}
                                >
                                  {recordingPaymentId === payment.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Recording...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Record Payment
                                    </>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {isPending && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Waive
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Waive Payment</DialogTitle>
                                <DialogDescription>
                                  Waive {payment.paymentType} of {lease?.currency} {payment.amount.toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="waiverReason">Reason</Label>
                                  <Textarea
                                    id="waiverReason"
                                    value={waiverReason}
                                    onChange={(e) => setWaiverReason(e.target.value)}
                                    placeholder="Why is this payment being waived?"
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setWaiverReason('')}
                                  disabled={waiverPaymentId === payment.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleWaivePayment(payment.id)}
                                  disabled={waiverPaymentId === payment.id}
                                >
                                  {waiverPaymentId === payment.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Waiving...
                                    </>
                                  ) : (
                                    'Waive Payment'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
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

