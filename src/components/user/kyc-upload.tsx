'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { uploadKYCDocument, getMyKYCDocuments } from '@/lib/api-user';
import { UploadKYCDocumentRequest, KYCDocumentResponse, KYCDocumentType } from '@/types/user';
import { AuthError } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';

export function KYCDocumentUpload() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KYCDocumentResponse[]>([]);

  const [formData, setFormData] = useState<UploadKYCDocumentRequest>({
    documentType: 'passport',
    documentNumber: '',
    documentUrl: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  // File upload hook for KYC documents
  const { upload, isUploading, progress, error: uploadError } = useFileUpload({
    category: 'kyc',
    onSuccess: (result) => {
      setFormData((prev) => ({
        ...prev,
        documentUrl: result.url,
      }));
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Load existing documents on mount
  useEffect(() => {
    if (!authLoading && user?.role?.toLocaleLowerCase() === 'landlord') {
      loadDocuments();
    } else {
      setIsLoadingDocuments(false);
    }
  }, [authLoading, user]);

  console.log(user?.role);
  const loadDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const docs = await getMyKYCDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      documentType: value as KYCDocumentType,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload file to storage
    await upload(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.documentNumber) {
        throw new Error('Document number is required');
      }
      if (!formData.documentUrl) {
        throw new Error('Please upload a document');
      }
      if (!formData.issueDate || !formData.expiryDate) {
        throw new Error('Issue and expiry dates are required');
      }

      // Validate that issue date is not in the future
      const issueDate = new Date(formData.issueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (issueDate > today) {
        throw new Error('Issue date cannot be in the future');
      }

      // Validate that expiry date is after issue date
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= issueDate) {
        throw new Error('Expiry date must be after the issue date');
      }

      const response = await uploadKYCDocument(formData);

      setSuccess('Document uploaded successfully!');
      setDocuments((prev) => [...prev, response]);

      // Reset form
      setFormData({
        documentType: 'nationalID',
        documentNumber: '',
        documentUrl: '',
        issueDate: '',
        expiryDate: '',
        notes: '',
      });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload document');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'landlord') {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              KYC document upload is only available for landlords.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const documentTypeLabel: Record<KYCDocumentType, string> = {
    nationalID: 'National ID',
    passport: 'Passport',
    driversLicense: 'Driver License',
    businessLicense: 'Business License',
    titleDeed: 'Title Deed',
    utilityBill: 'Utility Bill',
    bankStatement: 'Bank Statement',
    taxClearance: 'Tax Clearance',
    other: 'Other',
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="documents">
            My Documents ({documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload KYC Document</CardTitle>
              <CardDescription>
                Submit your identity documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={handleSelectChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nationalID">National ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driversLicense">Driver License</SelectItem>
                      <SelectItem value="businessLicense">Business License</SelectItem>
                      <SelectItem value="titleDeed">Title Deed</SelectItem>
                      <SelectItem value="utilityBill">Utility Bill</SelectItem>
                      <SelectItem value="bankStatement">Bank Statement</SelectItem>
                      <SelectItem value="taxClearance">Tax Clearance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Document Number</Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="e.g., A12345678"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload Document Image</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={isLoading || isUploading}
                    required={!formData.documentUrl}
                  />
                  {isUploading && (
                    <div className="space-y-1">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    </div>
                  )}
                  {formData.documentUrl && !isUploading && (
                    <p className="text-xs text-green-600">✓ Document uploaded successfully</p>
                  )}
                  {uploadError && (
                    <p className="text-xs text-red-600">{uploadError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PNG, JPG, PDF (Max 5MB)
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={handleChange}
                      disabled={isLoading}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Cannot be a future date
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      disabled={isLoading}
                      min={formData.issueDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be after the issue date
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Any additional information..."
                    value={formData.notes || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>
                Your uploaded KYC documents and their verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div>Loading documents...</div>
              ) : documents.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    You haven't uploaded any documents yet.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {documentTypeLabel[doc.documentType]}
                              </h4>
                              <Badge
                                variant={
                                  doc.status === 'approved'
                                    ? 'default'
                                    : doc.status === 'pending'
                                    ? 'secondary'
                                    : doc.status === 'underReview'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace(/([A-Z])/g, ' $1')}
                              </Badge>
                              {doc.isExpired && (
                                <Badge variant="destructive">Expired</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Document #: {doc.documentNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Issued: {new Date(doc.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            View
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

