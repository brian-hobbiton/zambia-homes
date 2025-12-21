'use client';

import { useEffect, useState } from 'react';
import { listPropertyInquiries, updatePropertyInquiry } from '@/lib/api-inquiries';
import { PropertyInquiryListItem } from '@/types/inquiry';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Mail, MailOpen, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function LandlordInquiriesPage() {
  const [inquiries, setInquiries] = useState<PropertyInquiryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { toast } = useToast();

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filterParams: { isRead?: boolean } = {};
      if (filter === 'unread') filterParams.isRead = false;
      if (filter === 'read') filterParams.isRead = true;

      const response = await listPropertyInquiries({
        ...filterParams,
        page: 1,
        pageSize: 100,
        sortBy: 'inquiryDate',
        sortOrder: 'desc',
      });

      setInquiries(response.inquiries);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inquiries';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const handleToggleRead = async (inquiryId: string, currentIsRead: boolean) => {
    try {
      setUpdatingId(inquiryId);
      await updatePropertyInquiry(inquiryId, { isRead: !currentIsRead });

      // Update local state
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId ? { ...inq, isRead: !currentIsRead } : inq
        )
      );

      toast({
        title: currentIsRead ? 'Marked as unread' : 'Marked as read',
        description: 'Inquiry status updated successfully.',
      });
    } catch (err) {
      console.error('Failed to update inquiry:', err);
      toast({
        title: 'Update failed',
        description: 'Could not update inquiry status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = inquiries.filter((inq) => !inq.isRead).length;

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
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inquiries.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Property Inquiries</CardTitle>
          <CardDescription>
            Manage inquiries from potential tenants about your properties.
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
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {filter === 'all'
                  ? 'No inquiries yet.'
                  : filter === 'unread'
                  ? 'No unread inquiries.'
                  : 'No read inquiries.'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                When tenants contact you about properties, they'll appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow
                    key={inquiry.id}
                    className={!inquiry.isRead ? 'bg-muted/30' : ''}
                  >
                    <TableCell>
                      {inquiry.isRead ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-orange-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{inquiry.propertyTitle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{inquiry.userName}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="p-0 h-auto text-left">
                            <span className="truncate block max-w-[300px]">
                              {inquiry.message}
                            </span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-1">Property</h4>
                              <p className="text-sm text-muted-foreground">
                                {inquiry.propertyTitle}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-1">From</h4>
                              <p className="text-sm text-muted-foreground">
                                {inquiry.userName}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-1">Date</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(inquiry.inquiryDate).toLocaleString()}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-1">Message</h4>
                              <p className="text-sm whitespace-pre-wrap">
                                {inquiry.message}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(inquiry.inquiryDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(inquiry.inquiryDate).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleRead(inquiry.id, inquiry.isRead)
                          }
                          disabled={updatingId === inquiry.id}
                        >
                          {updatingId === inquiry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : inquiry.isRead ? (
                            'Mark Unread'
                          ) : (
                            'Mark Read'
                          )}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/messaging">Reply</Link>
                        </Button>
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

