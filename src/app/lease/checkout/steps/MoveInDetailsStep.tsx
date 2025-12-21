'use client';

import { CreateRentalApplicationRequest } from '@/types/application';
import { PropertyResponse } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MoveInDetailsStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

export default function MoveInDetailsStep({ formData, updateFormDataAction }: MoveInDetailsStepProps) {
  // Calculate minimum move-in date (7 days from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Desired Move-in Date */}
      <div className="space-y-2">
        <Label htmlFor="desiredMoveInDate">
          Desired Move-in Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="desiredMoveInDate"
          type="date"
          value={formData.desiredMoveInDate || ''}
          onChange={(e) => updateFormDataAction({ desiredMoveInDate: e.target.value })}
          min={minDateString}
          required
        />
        <p className="text-sm text-muted-foreground">
          Minimum 7 days from today
        </p>
      </div>

      {/* Lease Term */}
      <div className="space-y-2">
        <Label htmlFor="leaseTermMonths">
          Preferred Lease Term (months) <span className="text-red-500">*</span>
        </Label>
        <Select
          value={String(formData.leaseTermMonths || 12)}
          onValueChange={(value) => updateFormDataAction({ leaseTermMonths: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lease term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">12 months (1 year)</SelectItem>
            <SelectItem value="18">18 months</SelectItem>
            <SelectItem value="24">24 months (2 years)</SelectItem>
            <SelectItem value="36">36 months (3 years)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          How long do you plan to rent?
        </p>
      </div>

      {/* Number of Occupants */}
      <div className="space-y-2">
        <Label htmlFor="numberOfOccupants">
          Number of Occupants <span className="text-red-500">*</span>
        </Label>
        <Input
          id="numberOfOccupants"
          type="number"
          value={formData.numberOfOccupants || 1}
          onChange={(e) => updateFormDataAction({ numberOfOccupants: parseInt(e.target.value) || 1 })}
          min="1"
          max="10"
          required
        />
        <p className="text-sm text-muted-foreground">
          Total number of people who will be living in the property
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>Important:</strong> The landlord may require additional documentation or background checks based on your move-in date and number of occupants.
        </p>
      </div>
    </div>
  );
}

