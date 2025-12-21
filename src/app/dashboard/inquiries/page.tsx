'use client';

import { useEffect, useState } from 'react';
import { listPropertyInquiries } from '@/lib/api-inquiries';
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
import { Loader2, AlertCircle, MessageSquare, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function TenantInquiriesPage() {
  const [inquiries, setInquiries] = useState<PropertyInquiryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tenant's sent inquiries (backend filters by userId from JWT)
        const response = await listPropertyInquiries({
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

    fetchInquiries();
  }, []);

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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Inquiries Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Awaiting Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inquiries.filter((inq) => !inq.isRead).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Inquiries</CardTitle>
          <CardDescription>
            View all inquiries you've sent to landlords about properties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No inquiries sent yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Browse properties and contact landlords to get started.
              </p>
              <Button asChild className="mt-4">
                <Link href="/">Browse Properties</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div className="font-medium">
                        <Link
                          href={`/properties/${inquiry.propertyId}`}
                          className="hover:text-primary hover:underline"
                        >
                          {inquiry.propertyTitle}
                        </Link>
                      </div>
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
                              <Link
                                href={`/properties/${inquiry.propertyId}`}
                                className="text-sm text-primary hover:underline"
                              >
                                {inquiry.propertyTitle}
                              </Link>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-1">Date Sent</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(inquiry.inquiryDate).toLocaleString()}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-1">Your Message</h4>
                              <p className="text-sm whitespace-pre-wrap">
                                {inquiry.message}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-1">Status</h4>
                              <Badge variant={inquiry.isRead ? 'default' : 'secondary'}>
                                {inquiry.isRead ? 'Read by Landlord' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(inquiry.inquiryDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(inquiry.inquiryDate).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={inquiry.isRead ? 'default' : 'secondary'}>
                        {inquiry.isRead ? (
                          <>
                            <Mail className="h-3 w-3 mr-1" />
                            Read
                          </>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/properties/${inquiry.propertyId}`}>
                          View Property
                        </Link>
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

