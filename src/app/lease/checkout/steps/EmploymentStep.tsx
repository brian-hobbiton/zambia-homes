'use client';

import { CreateRentalApplicationRequest, EmploymentStatus } from '@/types/application';
import { PropertyResponse } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmploymentStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

export default function EmploymentStep({ formData, updateFormDataAction }: EmploymentStepProps) {
  return (
    <div className="space-y-6">
      {/* Employment Status */}
      <div className="space-y-2">
        <Label htmlFor="employmentStatus">
          Employment Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.employmentStatus}
          onValueChange={(value) => updateFormDataAction({ employmentStatus: value as EmploymentStatus })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EmploymentStatus.Employed}>Employed</SelectItem>
            <SelectItem value={EmploymentStatus.SelfEmployed}>Self-Employed</SelectItem>
            <SelectItem value={EmploymentStatus.Unemployed}>Unemployed</SelectItem>
            <SelectItem value={EmploymentStatus.Retired}>Retired</SelectItem>
            <SelectItem value={EmploymentStatus.Student}>Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Monthly Income */}
      <div className="space-y-2">
        <Label htmlFor="monthlyIncome">
          Monthly Income (ZMW) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="monthlyIncome"
          type="number"
          value={formData.monthlyIncome || ''}
          onChange={(e) => updateFormDataAction({ monthlyIncome: parseFloat(e.target.value) || 0 })}
          placeholder="5000"
          min="0"
          step="100"
          required
        />
        <p className="text-sm text-muted-foreground">
          Your gross monthly income before taxes
        </p>
      </div>

      {/* Employer Information (conditional) */}
      {(formData.employmentStatus === EmploymentStatus.Employed ||
        formData.employmentStatus === EmploymentStatus.SelfEmployed) && (
        <>
          <div className="space-y-2">
            <Label htmlFor="employerName">
              {formData.employmentStatus === EmploymentStatus.SelfEmployed
                ? 'Business Name'
                : 'Employer Name'}
            </Label>
            <Input
              id="employerName"
              value={formData.employerName || ''}
              onChange={(e) => updateFormDataAction({ employerName: e.target.value })}
              placeholder={formData.employmentStatus === EmploymentStatus.SelfEmployed
                ? 'ABC Trading Ltd'
                : 'Company Name'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employerPhone">
              {formData.employmentStatus === EmploymentStatus.SelfEmployed
                ? 'Business Phone'
                : 'Employer Phone'}
            </Label>
            <Input
              id="employerPhone"
              value={formData.employerPhone || ''}
              onChange={(e) => updateFormDataAction({ employerPhone: e.target.value })}
              placeholder="+260 xxx xxx xxx"
            />
            <p className="text-sm text-muted-foreground">
              For employment verification purposes
            </p>
          </div>
        </>
      )}

      {/* Income Requirement Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Most landlords require monthly income to be at least 2.5-3x the monthly rent. This helps ensure you can comfortably afford the property.
        </p>
      </div>
    </div>
  );
}

