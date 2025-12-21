'use client';

import { CreateRentalApplicationRequest, EmploymentStatus } from '@/types/application';
import { PropertyResponse } from '@/types/property';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

export default function ReviewStep({ property, formData }: ReviewStepProps) {
  const { user } = useAuth();

  const getEmploymentStatusLabel = (status?: EmploymentStatus) => {
    switch (status) {
      case EmploymentStatus.Employed: return 'Employed';
      case EmploymentStatus.SelfEmployed: return 'Self-Employed';
      case EmploymentStatus.Unemployed: return 'Unemployed';
      case EmploymentStatus.Retired: return 'Retired';
      case EmploymentStatus.Student: return 'Student';
      default: return 'Not specified';
    }
  };

  const isComplete = !!(
    formData.currentAddress &&
    formData.monthlyIncome &&
    formData.desiredMoveInDate &&
    formData.leaseTermMonths &&
    formData.emergencyContactName &&
    formData.emergencyContactPhone
  );

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className={`p-4 rounded-lg border-2 ${
        isComplete 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-start gap-3">
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          )}
          <div>
            <h4 className={`font-semibold ${
              isComplete ? 'text-green-900' : 'text-amber-900'
            }`}>
              {isComplete ? 'Application Ready!' : 'Please Complete Required Fields'}
            </h4>
            <p className={`text-sm ${
              isComplete ? 'text-green-800' : 'text-amber-800'
            }`}>
              {isComplete
                ? 'Your application is complete and ready to submit.'
                : 'Some required information is missing. Please go back and complete all required fields.'}
            </p>
          </div>
        </div>
      </div>

      {/* Property Summary */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Property</h3>
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-medium">{property.title}</p>
          <p className="text-sm text-muted-foreground">{property.city}, {property.province}</p>
          <p className="text-lg font-semibold text-primary mt-2">
            {property.currency} {property.price.toLocaleString()}/month
          </p>
        </div>
      </div>

      <Separator />

      {/* Applicant Information */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Applicant Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Full Name</dt>
            <dd className="font-medium">{user?.firstName} {user?.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Phone</dt>
            <dd className="font-medium">{user?.phoneNumber || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Current Address</dt>
            <dd className="font-medium">{formData.currentAddress || 'Not provided'}</dd>
          </div>
        </dl>
      </div>

      <Separator />

      {/* Employment & Income */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Employment & Income</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Employment Status</dt>
            <dd className="font-medium">{getEmploymentStatusLabel(formData.employmentStatus)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Monthly Income</dt>
            <dd className="font-medium">ZMW {formData.monthlyIncome?.toLocaleString() || 0}</dd>
          </div>
          {formData.employerName && (
            <div>
              <dt className="text-sm text-muted-foreground">Employer</dt>
              <dd className="font-medium">{formData.employerName}</dd>
            </div>
          )}
          {formData.employerPhone && (
            <div>
              <dt className="text-sm text-muted-foreground">Employer Phone</dt>
              <dd className="font-medium">{formData.employerPhone}</dd>
            </div>
          )}
        </dl>
      </div>

      <Separator />

      {/* Move-in Details */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Move-in Details</h3>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Desired Move-in Date</dt>
            <dd className="font-medium">
              {formData.desiredMoveInDate
                ? new Date(formData.desiredMoveInDate).toLocaleDateString()
                : 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Lease Term</dt>
            <dd className="font-medium">{formData.leaseTermMonths} months</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Number of Occupants</dt>
            <dd className="font-medium">{formData.numberOfOccupants}</dd>
          </div>
        </dl>
      </div>

      <Separator />

      {/* Emergency Contact */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Emergency Contact</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Contact Name</dt>
            <dd className="font-medium">{formData.emergencyContactName || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Contact Phone</dt>
            <dd className="font-medium">{formData.emergencyContactPhone || 'Not provided'}</dd>
          </div>
        </dl>
      </div>

      {/* Pets */}
      {formData.hasPets && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-3">Pets</h3>
            <p className="text-sm">{formData.petDescription}</p>
          </div>
        </>
      )}

      {/* References */}
      {formData.references && formData.references.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-3">References</h3>
            <div className="space-y-2">
              {formData.references.map((ref, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{ref.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ref.relationship} • {ref.phone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Documents */}
      {formData.documents && formData.documents.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-3">Documents</h3>
            <div className="flex flex-wrap gap-2">
              {formData.documents.map((doc, index) => (
                <Badge key={index} variant="secondary">
                  {doc.fileName}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Additional Notes */}
      {formData.additionalNotes && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-3">Additional Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{formData.additionalNotes}</p>
          </div>
        </>
      )}

      {/* Consent */}
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm">
          By submitting this application, you confirm that all information provided is accurate and complete. You authorize the landlord to verify the information and conduct background checks as necessary.
        </p>
      </div>
    </div>
  );
}

