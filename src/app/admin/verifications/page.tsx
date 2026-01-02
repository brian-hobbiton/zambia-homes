'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllKYCDocuments, verifyKYCDocument } from '@/lib/api-user';
import { KYCDocumentResponse } from '@/types/user';
import { Check, X, Loader2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<KYCDocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocumentResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setIsLoading(true);
      const data = await getAllKYCDocuments();
      setVerifications(data);
    } catch (error) {
      console.error('Failed to load verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load KYC verifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await verifyKYCDocument(id, status);
      toast({
        title: 'Success',
        description: `Document ${status} successfully`,
      });
      loadVerifications();
    } catch (error) {
      console.error('Failed to verify document:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document status',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = (doc: KYCDocumentResponse) => {
    setSelectedDoc(doc);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Landlord KYC Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No verifications found
                  </TableCell>
                </TableRow>
              ) : (
                verifications.map((kyc) => (
                  <TableRow key={kyc.id}>
                    <TableCell className="capitalize">{kyc.documentType}</TableCell>
                    <TableCell>{kyc.documentNumber}</TableCell>
                    <TableCell>{new Date(kyc.createdAt || kyc.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          kyc.status === 'approved'
                            ? 'default'
                            : kyc.status === 'pending'
                            ? 'secondary'
                            : kyc.status === 'underReview'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(kyc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {kyc.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleVerify(kyc.id, 'approved')}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleVerify(kyc.id, 'rejected')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>KYC Document</DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <div className="space-y-2">
                  <p className="capitalize">Type: {selectedDoc.documentType.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p>Number: {selectedDoc.documentNumber}</p>
                  <p>Issue Date: {new Date(selectedDoc.issueDate).toLocaleDateString()}</p>
                  <p>Expiry Date: {new Date(selectedDoc.expiryDate).toLocaleDateString()}</p>
                  <Badge
                    variant={
                      selectedDoc.status === 'approved'
                        ? 'default'
                        : selectedDoc.status === 'pending'
                        ? 'secondary'
                        : selectedDoc.status === 'underReview'
                        ? 'outline'
                        : 'destructive'
                    }
                  >
                    {selectedDoc.status.charAt(0).toUpperCase() + selectedDoc.status.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="mt-4">
              <img
                src={selectedDoc.documentUrl}
                alt={`${selectedDoc.documentType} document`}
                className="w-full h-auto rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="18">Document not available</text></svg>';
                }}
              />
              {selectedDoc.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleVerify(selectedDoc.id, 'approved');
                      setIsDialogOpen(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Document
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleVerify(selectedDoc.id, 'rejected');
                      setIsDialogOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Document
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
