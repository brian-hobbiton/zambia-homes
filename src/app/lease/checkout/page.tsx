'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createApplication, updateApplication } from '@/lib/api-applications';
import { getPropertyById } from '@/lib/api-properties';
import { PropertyResponse } from '@/types/property';
import {
  CreateRentalApplicationRequest,
  EmploymentStatus,
} from '@/types/application';

// Import step components
import PropertyReviewStep from './steps/PropertyReviewStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import EmploymentStep from './steps/EmploymentStep';
import MoveInDetailsStep from './steps/MoveInDetailsStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import DocumentsStep from './steps/DocumentsStep';
import ReviewStep from './steps/ReviewStep';

const STEPS = [
  { id: 1, title: 'Property Review', component: PropertyReviewStep },
  { id: 2, title: 'Personal Information', component: PersonalInfoStep },
  { id: 3, title: 'Employment & Income', component: EmploymentStep },
  { id: 4, title: 'Move-in Details', component: MoveInDetailsStep },
  { id: 5, title: 'Additional Information', component: AdditionalInfoStep },
  { id: 6, title: 'Documents', component: DocumentsStep },
  { id: 7, title: 'Review & Submit', component: ReviewStep },
];

export default function ApplicationWizard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ApplicationWizardContent />
    </Suspense>
  );
}

function ApplicationWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const propertyId = searchParams.get('propertyId');
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateRentalApplicationRequest>>({
    propertyId: propertyId || '',
    desiredMoveInDate: '',
    leaseTermMonths: 12,
    numberOfOccupants: 1,
    monthlyIncome: 0,
    employmentStatus: EmploymentStatus.Employed,
    employerName: '',
    employerPhone: '',
    currentAddress: '',
    reasonForMoving: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    hasPets: false,
    petDescription: '',
    references: [],
    documents: [],
    additionalNotes: '',
    submitNow: false,
  });

  // Load property details
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        toast({
          title: 'Error',
          description: 'Property ID is required',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        const propertyData = await getPropertyById(propertyId);
        setProperty(propertyData);
      } catch (err) {
        console.error('Failed to load property:', err);
        toast({
          title: 'Error',
          description: 'Failed to load property details',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, router, toast]);

  // Auto-save draft every 30 seconds (starting from Step 3)
  useEffect(() => {
    if (!formData.propertyId || currentStep < 4) return;

    const autoSave = setInterval(async () => {
      try {
        await saveDraft();
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSave);
  }, [formData, currentStep]);

  // Minimum days required between today and desired move-in
  const MIN_MOVE_IN_DAYS = 7;

  // Helper: check if a YYYY-MM-DD date string is more than minDays from today
  const isDateStringValidForMoveIn = (dateStr?: string, minDays = MIN_MOVE_IN_DAYS) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    // selected date at local midnight
    const selected = new Date(year, month, day, 0, 0, 0, 0);

    // today at local midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const diffMs = selected.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    // Use > (strictly greater) to ensure date is safely in future
    return diffDays > minDays;
  };

  const formatFormDataForBackend = (data: Partial<CreateRentalApplicationRequest>) => {
    let formattedDate: string | undefined;

    if (data.desiredMoveInDate) {
      // Parse the date string (format: YYYY-MM-DD from HTML date input)
      const dateValue = data.desiredMoveInDate;

      // Create a date object from the string at local midnight
      const date = new Date(dateValue);

      // Add 12 hours to move it to noon in the local timezone to ensure it's in the future
      // and avoid timezone-related issues where midnight UTC might be yesterday
      date.setHours(date.getHours() + 12);

      // Convert to ISO string
      formattedDate = date.toISOString();
    }

    return {
      ...data,
      desiredMoveInDate: formattedDate,
    };
  };

  const saveDraft = async () => {
    try {
      // Only save drafts from Step 3 onwards
      if (currentStep < 4) {
        return;
      }

      // If move-in date is provided, ensure it's valid before saving
      if (formData.desiredMoveInDate && !isDateStringValidForMoveIn(formData.desiredMoveInDate)) {
        // Skip auto-save silently if date is invalid (user will see error when trying to proceed)
        return;
      }

      // From Step 4 onwards, desiredMoveInDate is required
      if (currentStep >= 4 && !formData.desiredMoveInDate) {
        return;
      }

      const formattedData = formatFormDataForBackend(formData);
      if (applicationId) {
        // Update existing draft
        await updateApplication(applicationId, {
          ...formattedData,
          submitNow: false,
        });
      } else {
        // Create new draft
        const response = await createApplication({
          ...formattedData as CreateRentalApplicationRequest,
          submitNow: false,
        });
        setApplicationId(response.id);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (!validateStep(currentStep)) {
      return;
    }

    // Save draft before moving to next step
    try {
      setIsSaving(true);
      await saveDraft();
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } catch (err) {
      console.error('Failed to save draft:', err);
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Validate move-in date before submitting
    if (!formData.desiredMoveInDate || !isDateStringValidForMoveIn(formData.desiredMoveInDate)) {
      toast({
        title: 'Invalid move-in date',
        description: `Desired move-in date must be at least ${MIN_MOVE_IN_DAYS} days from today. Please pick another date.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const formattedData = formatFormDataForBackend(formData);

      if (applicationId) {
        // Update and submit existing draft - ALWAYS set submitNow: true
        await updateApplication(applicationId, {
          ...formattedData,
          submitNow: true,
        });
      } else {
        // Create and submit new application - ALWAYS set submitNow: true
        await createApplication({
          ...formattedData as CreateRentalApplicationRequest,
          submitNow: true,
        });
      }

      toast({
        title: 'Application submitted!',
        description: 'Your rental application has been submitted successfully.',
      });

      router.push('/dashboard/applications?success=true');
    } catch (err) {
      console.error('Failed to submit application:', err);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Property review is always valid
      case 2:
        return !!(formData.currentAddress);
      case 3:
        return !!(formData.monthlyIncome && formData.monthlyIncome > 0 && formData.employmentStatus);
      case 4:
        return !!(formData.desiredMoveInDate && formData.leaseTermMonths && formData.numberOfOccupants);
      case 5:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone);
      case 6:
        return true; // Documents are optional
      case 7:
        return true; // Review step
      default:
        return true;
    }
  };

  const updateFormDataAction = (data: Partial<CreateRentalApplicationRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline mb-2">
            Rental Application
          </h1>
          <p className="text-muted-foreground">
            Complete your application to rent {property.title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {STEPS[currentStep - 1].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < STEPS.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-center hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Review the property details before proceeding'}
              {currentStep === 2 && 'Provide your personal information'}
              {currentStep === 3 && 'Tell us about your employment and income'}
              {currentStep === 4 && 'When would you like to move in?'}
              {currentStep === 5 && 'Additional details about your application'}
              {currentStep === 6 && 'Upload required documents'}
              {currentStep === 7 && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              property={property}
              formData={formData}
              updateFormDataAction={updateFormDataAction}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSaving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={isSaving}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
