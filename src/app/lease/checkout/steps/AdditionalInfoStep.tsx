'use client';

import { useState } from 'react';
import { CreateRentalApplicationRequest, ReferenceRequest } from '@/types/application';
import { PropertyResponse } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';

interface AdditionalInfoStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

export default function AdditionalInfoStep({ formData, updateFormDataAction }: AdditionalInfoStepProps) {
  const [newReference, setNewReference] = useState<ReferenceRequest>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  const addReference = () => {
    if (newReference.name && newReference.relationship && newReference.phone) {
      const references = [...(formData.references || []), newReference];
      updateFormDataAction({ references });
      setNewReference({ name: '', relationship: '', phone: '', email: '' });
    }
  };

  const removeReference = (index: number) => {
    const references = formData.references?.filter((_, i) => i !== index) || [];
    updateFormDataAction({ references });
  };

  return (
    <div className="space-y-6">
      {/* Pets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="hasPets">Do you have pets?</Label>
            <p className="text-sm text-muted-foreground">
              Let the landlord know if you plan to bring pets
            </p>
          </div>
          <Switch
            id="hasPets"
            checked={formData.hasPets || false}
            onCheckedChange={(checked) => updateFormDataAction({ hasPets: checked })}
          />
        </div>

        {formData.hasPets && (
          <div className="space-y-2">
            <Label htmlFor="petDescription">Pet Description</Label>
            <Textarea
              id="petDescription"
              value={formData.petDescription || ''}
              onChange={(e) => updateFormDataAction({ petDescription: e.target.value })}
              placeholder="E.g., 1 small dog (Labrador, 2 years old, house-trained)"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Describe your pet(s) - type, breed, age, and any relevant behavior information
            </p>
          </div>
        )}
      </div>

      {/* References */}
      <div className="border-t pt-6">
        <h4 className="font-semibold mb-4">References (Optional)</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Provide references from previous landlords or employers
        </p>

        {/* Existing References */}
        {formData.references && formData.references.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.references.map((ref, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{ref.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ref.relationship} • {ref.phone}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReference(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="refName">Name</Label>
            <Input
              id="refName"
              value={newReference.name}
              onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refRelationship">Relationship</Label>
            <Input
              id="refRelationship"
              value={newReference.relationship}
              onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })}
              placeholder="Previous Landlord"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refPhone">Phone</Label>
            <Input
              id="refPhone"
              value={newReference.phone}
              onChange={(e) => setNewReference({ ...newReference, phone: e.target.value })}
              placeholder="+260 xxx xxx xxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refEmail">Email (Optional)</Label>
            <Input
              id="refEmail"
              type="email"
              value={newReference.email}
              onChange={(e) => setNewReference({ ...newReference, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addReference}
          disabled={!newReference.name || !newReference.relationship || !newReference.phone}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>

      {/* Additional Notes */}
      <div className="border-t pt-6">
        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            value={formData.additionalNotes || ''}
            onChange={(e) => updateFormDataAction({ additionalNotes: e.target.value })}
            placeholder="Any additional information you'd like the landlord to know..."
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            Optional: Share any special circumstances or requests
          </p>
        </div>
      </div>
    </div>
  );
}

