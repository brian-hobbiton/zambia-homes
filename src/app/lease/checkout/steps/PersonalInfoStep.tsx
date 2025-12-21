'use client';

import { useAuth } from '@/hooks/use-auth';
import { CreateRentalApplicationRequest } from '@/types/application';
import { PropertyResponse } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PersonalInfoStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

export default function PersonalInfoStep({ formData, updateFormDataAction }: PersonalInfoStepProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* User Info (Read-only) */}
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          This information is from your profile
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Full Name</Label>
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <p className="font-medium">{user?.phoneNumber || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Current Address */}
      <div className="space-y-2">
        <Label htmlFor="currentAddress">
          Current Address <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="currentAddress"
          value={formData.currentAddress || ''}
          onChange={(e) => updateFormDataAction({ currentAddress: e.target.value })}
          placeholder="123 Main Street, City, Province, Postal Code"
          rows={3}
          required
        />
        <p className="text-sm text-muted-foreground">
          Your current residential address
        </p>
      </div>

      {/* Reason for Moving */}
      <div className="space-y-2">
        <Label htmlFor="reasonForMoving">Reason for Moving</Label>
        <Textarea
          id="reasonForMoving"
          value={formData.reasonForMoving || ''}
          onChange={(e) => updateFormDataAction({ reasonForMoving: e.target.value })}
          placeholder="E.g., Job relocation, closer to work, larger space needed..."
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Help the landlord understand your situation
        </p>
      </div>

      {/* Emergency Contact */}
      <div className="border-t pt-6">
        <h4 className="font-semibold mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">
              Contact Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName || ''}
              onChange={(e) => updateFormDataAction({ emergencyContactName: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">
              Contact Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone || ''}
              onChange={(e) => updateFormDataAction({ emergencyContactPhone: e.target.value })}
              placeholder="+260 xxx xxx xxx"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

