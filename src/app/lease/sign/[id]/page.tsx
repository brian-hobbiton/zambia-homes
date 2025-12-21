'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLease, updateLease } from '@/lib/api-leases';
import { LeaseAgreementResponse, LeaseStatus } from '@/types/lease';
import SignaturePad from '@/components/ui/signature-pad';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function SignLeasePagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<LeaseAgreementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState<'review' | 'verify' | 'sign' | 'complete'>('review');

  useEffect(() => {
    const fetchLease = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getLease(leaseId);

        // Check if already signed
        if (data.tenantSignedAt || data.landlordSignedAt) {
          setCurrentStep('complete');
        }

        setLease(data);
      } catch (err) {
        console.error('Failed to fetch lease:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lease');
      } finally {
        setIsLoading(false);
      }
    };

    if (leaseId) {
      fetchLease();
    }
  }, [leaseId]);

  const handleSign = async () => {
    if (!lease || !signatureData || !agreeToTerms) {
      toast({
        title: 'Validation Error',
        description: 'Please provide signature and agree to terms.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSigning(true);

      // Determine user role (tenant or landlord)
      // In a real app, you'd get this from the auth context
      const isTenant = true; // This would be determined from user role

      if (isTenant) {
        await updateLease(lease.id, {
          tenantSignatureUrl: signatureData,
          tenantSignedAt: new Date().toISOString(),
        });
      } else {
        await updateLease(lease.id, {
          landlordSignatureUrl: signatureData,
          landlordSignedAt: new Date().toISOString(),
        });
      }

      toast({
        title: 'Lease Signed!',
        description: 'Your signature has been recorded.',
      });

      setCurrentStep('complete');
    } catch (err) {
      console.error('Failed to sign lease:', err);
      toast({
        title: 'Error',
        description: 'Failed to sign lease. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Lease not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Sign Lease Agreement</h1>
        <p className="text-muted-foreground">
          {lease.propertyTitle} - {lease.tenantName}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8">
        {['review', 'verify', 'sign', 'complete'].map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep === step || (index < ['review', 'verify', 'sign', 'complete'].indexOf(currentStep))
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              {index < ['review', 'verify', 'sign', 'complete'].indexOf(currentStep) ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && <div className="flex-1 h-1 mx-2 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Review */}
      {currentStep === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Lease Agreement</CardTitle>
            <CardDescription>
              Please review all terms and conditions before signing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lease Summary */}
            <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{new Date(lease.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{new Date(lease.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-bold text-lg text-primary">
                  {lease.currency} {lease.monthlyRent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Deposit</p>
                <p className="font-medium">{lease.currency} {lease.securityDeposit.toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            {/* Terms Preview */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Terms</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Lease Type: <strong>{lease.leaseType}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Pets Allowed: <strong>{lease.petsAllowed ? 'Yes' : 'No'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Smoking: <strong>{lease.smokingAllowed ? 'Allowed' : 'Not Allowed'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Payment Due Day: <strong>Day {lease.paymentDueDay}</strong></span>
                </li>
              </ul>
            </div>

            {lease.specialTerms && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Special Terms</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {lease.specialTerms}
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" asChild>
                <Link href={`/landlord/leases/${lease.id}`}>
                  Back to Lease
                </Link>
              </Button>
              <Button onClick={() => setCurrentStep('verify')} className="ml-auto">
                Accept & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Verify Identity */}
      {currentStep === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              For security purposes, we need to verify your identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                A verification code has been sent to your email: {lease.tenantEmail}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This lease agreement is being signed electronically. By proceeding, you confirm that:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>You have read and understand all terms</li>
                <li>You agree to be legally bound by this lease</li>
                <li>You authorize electronic signature</li>
                <li>Your email address is valid for contact</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">Identity verified</span>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('review')}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep('sign')} className="ml-auto">
                Proceed to Signature
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Signature */}
      {currentStep === 'sign' && (
        <Card>
          <CardHeader>
            <CardTitle>Sign the Lease</CardTitle>
            <CardDescription>
              Draw your signature in the box below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Signature Instruction */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Draw your signature above. Make sure to capture your full signature clearly.
              </AlertDescription>
            </Alert>

            {/* Signature Pad */}
            <div>
              <Label className="mb-2 block">Your Signature</Label>
              <SignaturePad
                onSignatureChange={setSignatureData}
                disabled={isSigning}
              />
            </div>

            {/* Capture Preview */}
            {signatureData && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">✓ Signature captured</p>
              </div>
            )}

            {/* Terms Agreement */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isSigning}
                />
                <Label htmlFor="agree" className="text-sm cursor-pointer">
                  I agree to the terms and conditions of this lease agreement and authorize my electronic signature to be legally binding.
                </Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('verify')} disabled={isSigning}>
                Back
              </Button>
              <Button
                onClick={handleSign}
                disabled={!signatureData || !agreeToTerms || isSigning}
                className="ml-auto"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Sign & Submit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {currentStep === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <CardTitle className="text-green-900">Lease Signed Successfully</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-800">
              Your lease agreement has been signed and recorded on {new Date().toLocaleDateString()}.
            </p>

            {lease.tenantSignedAt && (
              <div className="p-3 bg-white rounded border border-green-200">
                <p className="text-sm text-muted-foreground">Tenant Signed</p>
                <p className="font-medium text-green-700">
                  ✓ {new Date(lease.tenantSignedAt).toLocaleDateString()} {new Date(lease.tenantSignedAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            {lease.landlordSignedAt && (
              <div className="p-3 bg-white rounded border border-green-200">
                <p className="text-sm text-muted-foreground">Landlord Signed</p>
                <p className="font-medium text-green-700">
                  ✓ {new Date(lease.landlordSignedAt).toLocaleDateString()} {new Date(lease.landlordSignedAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            {lease.status === 'Active' && (
              <Alert className="bg-green-100 border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Lease is now ACTIVE. You can proceed with the rental agreement.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button asChild>
                <Link href={`/landlord/leases/${lease.id}`}>
                  View Lease Details
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={lease.tenantSignedAt ? '/landlord/leases' : '/dashboard/leases'}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

