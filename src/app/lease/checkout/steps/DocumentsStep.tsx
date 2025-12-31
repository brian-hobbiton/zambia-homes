'use client';

import { useState } from 'react';
import { CreateRentalApplicationRequest, ApplicationDocumentRequest } from '@/types/application';
import { PropertyResponse } from '@/types/property';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';

interface DocumentsStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

const DOCUMENT_TYPES = [
  { value: 'id', label: 'National ID / Passport' },
  { value: 'income', label: 'Proof of Income (Pay Slip)' },
  { value: 'employment', label: 'Employment Letter' },
  { value: 'bank', label: 'Bank Statement' },
  { value: 'reference', label: 'Reference Letter' },
  { value: 'other', label: 'Other Document' },
];

export default function DocumentsStep({ formData, updateFormDataAction }: DocumentsStepProps) {
  const [selectedType, setSelectedType] = useState('id');

  const { upload, isUploading, progress, error } = useFileUpload({
    category: 'documents',
    onSuccess: (result) => {
      const newDocument: ApplicationDocumentRequest = {
        documentType: selectedType,
        documentUrl: result.url,
        fileName: result.fileName,
      };

      const documents = [...(formData.documents || []), newDocument];
      updateFormDataAction({ documents });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await upload(file);

    // Reset file input
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    const documents = formData.documents?.filter((_, i) => i !== index) || [];
    updateFormDataAction({ documents });
  };

  return (
    <div className="space-y-6">
      {/* Document Upload */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Upload Documents</h4>
          <p className="text-sm text-muted-foreground">
            Upload supporting documents to strengthen your application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Upload File</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading...
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Uploaded Documents */}
      {formData.documents && formData.documents.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Uploaded Documents</h4>
          <div className="space-y-2">
            {formData.documents.map((doc, index) => {
              const docTypeLabel = DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label || doc.documentType;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">{docTypeLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocument(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Documents */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">Recommended Documents</h5>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>National ID or Passport (Required)</li>
          <li>Recent pay slips (last 3 months)</li>
          <li>Employment letter or contract</li>
          <li>Bank statements (last 3 months)</li>
          <li>Reference letters from previous landlords</li>
        </ul>
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>Note:</strong> Documents are optional but highly recommended. Providing complete documentation significantly increases your chances of approval and speeds up the review process.
        </p>
      </div>
    </div>
  );
}

