'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createLease } from '@/lib/api-leases';
import { getApplication } from '@/lib/api-applications';
import { listProperties } from '@/lib/api-properties';
import { RentalApplicationResponse } from '@/types/application';
import { PropertyListItem } from '@/types/property';
import { CreateLeaseRequest, LeaseType } from '@/types/lease';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function CreateLeasePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <CreateLeasePageContent />
    </Suspense>
  );
}

function CreateLeasePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const applicationId = searchParams.get('applicationId');
  const [isLoading, setIsLoading] = useState(!!applicationId);
  const [isSaving, setIsSaving] = useState(false);
  const [application, setApplication] = useState<RentalApplicationResponse | null>(null);
  const [properties, setProperties] = useState<PropertyListItem[]>([]);

  const [formData, setFormData] = useState<CreateLeaseRequest>({
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    leaseType: LeaseType.Fixed,
    currency: 'ZMW',
    paymentDueDay: 1,
    lateFeeAmount: 0,
    lateFeeGraceDays: 5,
    petsAllowed: false,
    smokingAllowed: false,
    sublettingAllowed: false,
    maintenanceResponsibilities: '',
    utilitiesIncluded: [],
    specialTerms: '',
    landlordSignatureRequired: true,
  });

  // Load application data if creating from application
  useEffect(() => {
    if (!applicationId) {
      setIsLoading(false);
      loadProperties();
      return;
    }

    const loadApplication = async () => {
      try {
        setIsLoading(true);
        const appData = await getApplication(applicationId);
        setApplication(appData);

        // Pre-fill form with application data
        const moveInDate = new Date(appData.desiredMoveInDate);
        const endDate = new Date(moveInDate);
        endDate.setMonth(endDate.getMonth() + appData.leaseTermMonths);

        setFormData(prev => ({
          ...prev,
          applicationId: appData.id,
          propertyId: appData.propertyId,
          tenantId: appData.tenantId,
          startDate: appData.desiredMoveInDate,
          endDate: endDate.toISOString().split('T')[0],
          petsAllowed: appData.hasPets,
        }));
      } catch (err) {
        console.error('Failed to load application:', err);
        toast({
          title: 'Error',
          description: 'Failed to load application data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId, toast]);

  const loadProperties = async () => {
    try {
      const response = await listProperties({
        page: 1,
        pageSize: 100,
      });
      setProperties(response.properties);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const convertDateToUTC = (dateStr: string): string => {
    if (!dateStr) return '';
    // Parse the date string (format: YYYY-MM-DD from HTML date input)
    const date = new Date(dateStr);
    // Convert to UTC ISO string
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please provide start and end dates.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.monthlyRent || formData.monthlyRent <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a valid monthly rent amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Convert dates to UTC ISO format
      const leaseData = {
        ...formData,
        startDate: convertDateToUTC(formData.startDate),
        endDate: convertDateToUTC(formData.endDate),
      };

      const lease = await createLease(leaseData);

      toast({
        title: 'Lease created!',
        description: 'The lease agreement has been created successfully.',
      });

      router.push(`/landlord/leases/${lease.id}`);
    } catch (err) {
      console.error('Failed to create lease:', err);
      toast({
        title: 'Error',
        description: 'Failed to create lease. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (data: Partial<CreateLeaseRequest>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleUtilitiesChange = (utility: string, checked: boolean) => {
    const utilities = formData.utilitiesIncluded || [];
    if (checked) {
      updateFormData({ utilitiesIncluded: [...utilities, utility] });
    } else {
      updateFormData({ utilitiesIncluded: utilities.filter(u => u !== utility) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">
          {applicationId ? 'Create Lease from Application' : 'Create Lease Agreement'}
        </h1>
        <p className="text-muted-foreground">
          {applicationId
            ? `Create a lease agreement for ${application?.tenantName}`
            : 'Create a new lease agreement for a tenant'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property & Tenant Selection (Manual mode only) */}
        {!applicationId && (
          <Card>
            <CardHeader>
              <CardTitle>Property & Tenant</CardTitle>
              <CardDescription>Select the property and tenant for this lease</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => updateFormData({ propertyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant ID <span className="text-red-500">*</span></Label>
                <Input
                  id="tenantId"
                  value={formData.tenantId || ''}
                  onChange={(e) => updateFormData({ tenantId: e.target.value })}
                  placeholder="Enter tenant user ID"
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Info (if from application) */}
        {application && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Property</dt>
                  <dd className="font-medium">{application.propertyTitle}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Tenant</dt>
                  <dd className="font-medium">{application.tenantName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Desired Move-in</dt>
                  <dd className="font-medium">
                    {new Date(application.desiredMoveInDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Requested Term</dt>
                  <dd className="font-medium">{application.leaseTermMonths} months</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Lease Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Lease Terms</CardTitle>
            <CardDescription>Define the lease duration and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData({ startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseType">Lease Type</Label>
                <Select
                  value={formData.leaseType}
                  onValueChange={(value) => updateFormData({ leaseType: value as LeaseType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LeaseType.Fixed}>Fixed Term</SelectItem>
                    <SelectItem value={LeaseType.MonthToMonth}>Month-to-Month</SelectItem>
                    <SelectItem value={LeaseType.RentToOwn}>Rent-to-Own</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Terms</CardTitle>
            <CardDescription>Set rent, deposits, and payment terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent <span className="text-red-500">*</span></Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={formData.monthlyRent || ''}
                  onChange={(e) => updateFormData({ monthlyRent: parseFloat(e.target.value) })}
                  placeholder="5000"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit <span className="text-red-500">*</span></Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  value={formData.securityDeposit || ''}
                  onChange={(e) => updateFormData({ securityDeposit: parseFloat(e.target.value) })}
                  placeholder="10000"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => updateFormData({ currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZMW">ZMW (Zambian Kwacha)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDueDay">Payment Due Day</Label>
                <Input
                  id="paymentDueDay"
                  type="number"
                  value={formData.paymentDueDay || 1}
                  onChange={(e) => updateFormData({ paymentDueDay: parseInt(e.target.value) })}
                  min="1"
                  max="31"
                />
                <p className="text-xs text-muted-foreground">Day of month (1-31)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFeeAmount">Late Fee Amount</Label>
                <Input
                  id="lateFeeAmount"
                  type="number"
                  value={formData.lateFeeAmount || 0}
                  onChange={(e) => updateFormData({ lateFeeAmount: parseFloat(e.target.value) })}
                  min="0"
                  step="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFeeGraceDays">Grace Period (days)</Label>
                <Input
                  id="lateFeeGraceDays"
                  type="number"
                  value={formData.lateFeeGraceDays || 5}
                  onChange={(e) => updateFormData({ lateFeeGraceDays: parseInt(e.target.value) })}
                  min="0"
                  max="30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Property Rules</CardTitle>
            <CardDescription>Define what's allowed on the property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="petsAllowed">Pets Allowed</Label>
                <p className="text-sm text-muted-foreground">Allow tenants to keep pets</p>
              </div>
              <Switch
                id="petsAllowed"
                checked={formData.petsAllowed}
                onCheckedChange={(checked) => updateFormData({ petsAllowed: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smokingAllowed">Smoking Allowed</Label>
                <p className="text-sm text-muted-foreground">Allow smoking on the property</p>
              </div>
              <Switch
                id="smokingAllowed"
                checked={formData.smokingAllowed}
                onCheckedChange={(checked) => updateFormData({ smokingAllowed: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sublettingAllowed">Subletting Allowed</Label>
                <p className="text-sm text-muted-foreground">Allow subletting to others</p>
              </div>
              <Switch
                id="sublettingAllowed"
                checked={formData.sublettingAllowed}
                onCheckedChange={(checked) => updateFormData({ sublettingAllowed: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Utilities */}
        <Card>
          <CardHeader>
            <CardTitle>Utilities Included</CardTitle>
            <CardDescription>Select which utilities are included in the rent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Water', 'Electricity', 'Gas', 'Internet', 'Garbage', 'Sewage'].map((utility) => (
                <div key={utility} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={utility}
                    checked={formData.utilitiesIncluded?.includes(utility)}
                    onChange={(e) => handleUtilitiesChange(utility, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={utility} className="cursor-pointer">{utility}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Terms</CardTitle>
            <CardDescription>Specify maintenance and special terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceResponsibilities">Maintenance Responsibilities</Label>
              <Textarea
                id="maintenanceResponsibilities"
                value={formData.maintenanceResponsibilities || ''}
                onChange={(e) => updateFormData({ maintenanceResponsibilities: e.target.value })}
                placeholder="Define who is responsible for what maintenance..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialTerms">Special Terms & Conditions</Label>
              <Textarea
                id="specialTerms"
                value={formData.specialTerms || ''}
                onChange={(e) => updateFormData({ specialTerms: e.target.value })}
                placeholder="Any special terms or conditions..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Create Lease
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
