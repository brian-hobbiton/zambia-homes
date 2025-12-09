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

  // Load existing documents on mount
  useEffect(() => {
    if (!authLoading && user?.role === 'landlord') {
      loadDocuments();
    } else {
      setIsLoadingDocuments(false);
    }
  }, [authLoading, user]);

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

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          documentUrl: base64,
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file');
    }
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

      const response = await uploadKYCDocument(formData);

      setSuccess('Document uploaded successfully!');
      setDocuments((prev) => [...prev, response]);

      // Reset form
      setFormData({
        documentType: 'passport',
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

  const documentTypeLabel = {
    passport: 'Passport',
    nationalId: 'National ID',
    driverLicense: 'Driver License',
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
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="nationalId">National ID</SelectItem>
                      <SelectItem value="driverLicense">Driver License</SelectItem>
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
                    disabled={isLoading}
                    required
                  />
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
                      required
                    />
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
                      required
                    />
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
                                  doc.status === 'verified'
                                    ? 'default'
                                    : doc.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {doc.status}
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

