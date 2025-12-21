'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApplication, reviewApplication } from '@/lib/api-applications';
import { RentalApplicationResponse, ApplicationStatus, EmploymentStatus } from '@/types/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Briefcase,
  Home,
  Calendar,
  FileText,
  Phone,
  Mail,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<RentalApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (!applicationId) return;

    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getApplication(applicationId);
        setApplication(data);
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleApprove = async () => {
    if (!application) return;

    try {
      setIsProcessing(true);

      await reviewApplication(application.id, {
        status: ApplicationStatus.Approved,
        comments: comments || 'Application approved. Excellent applicant!',
      });

      toast({
        title: 'Application Approved',
        description: 'The application has been approved. You can now create a lease agreement.',
      });

      router.push(`/landlord/leases/create?applicationId=${application.id}`);
    } catch (err) {
      console.error('Failed to approve:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!application) return;
    if (!comments.trim()) {
      toast({
        title: 'Comments required',
        description: 'Please provide details about what information is needed.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);

      await reviewApplication(application.id, {
        status: ApplicationStatus.AdditionalInfoRequested,
        comments: comments,
      });

      toast({
        title: 'Information Requested',
        description: 'The tenant has been notified about the additional information needed.',
      });

      router.push('/landlord/applications');
    } catch (err) {
      console.error('Failed to request info:', err);
      toast({
        title: 'Error',
        description: 'Failed to request information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;

    try {
      setIsProcessing(true);

      await reviewApplication(application.id, {
        status: ApplicationStatus.Rejected,
        comments: comments || 'Application does not meet our requirements.',
      });

      toast({
        title: 'Application Rejected',
        description: 'The tenant has been notified of the decision.',
      });

      router.push('/landlord/applications');
    } catch (err) {
      console.error('Failed to reject:', err);
      toast({
        title: 'Error',
        description: 'Failed to reject application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmploymentStatusLabel = (status: EmploymentStatus) => {
    const labels = {
      [EmploymentStatus.Employed]: 'Employed',
      [EmploymentStatus.SelfEmployed]: 'Self-Employed',
      [EmploymentStatus.Unemployed]: 'Unemployed',
      [EmploymentStatus.Retired]: 'Retired',
      [EmploymentStatus.Student]: 'Student',
    };
    return labels[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Application not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const canReview = application.status === ApplicationStatus.Submitted ||
                    application.status === ApplicationStatus.UnderReview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">
            Application Review
          </h1>
          <p className="text-muted-foreground">
            Review rental application for {application.propertyTitle}
          </p>
        </div>
        <Badge className="text-base px-3 py-1">
          {application.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Full Name</dt>
                  <dd className="font-medium">{application.tenantName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {application.tenantEmail || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {application.tenantPhone || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Current Address</dt>
                  <dd className="font-medium">{application.currentAddress}</dd>
                </div>
              </dl>
              {application.reasonForMoving && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <dt className="text-sm text-muted-foreground mb-1">Reason for Moving</dt>
                    <dd className="text-sm">{application.reasonForMoving}</dd>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Employment & Income */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment & Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Employment Status</dt>
                  <dd className="font-medium">{getEmploymentStatusLabel(application.employmentStatus)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Monthly Income</dt>
                  <dd className="font-medium text-lg text-green-600">
                    ZMW {application.monthlyIncome.toLocaleString()}
                  </dd>
                </div>
                {application.employerName && (
                  <>
                    <div>
                      <dt className="text-sm text-muted-foreground">Employer</dt>
                      <dd className="font-medium">{application.employerName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Employer Phone</dt>
                      <dd className="font-medium">{application.employerPhone}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Move-in Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Move-in Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Desired Move-in</dt>
                  <dd className="font-medium">
                    {new Date(application.desiredMoveInDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Lease Term</dt>
                  <dd className="font-medium">{application.leaseTermMonths} months</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Occupants</dt>
                  <dd className="font-medium">{application.numberOfOccupants}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd className="font-medium">{application.emergencyContactName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{application.emergencyContactPhone}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Pets */}
          {application.hasPets && (
            <Card>
              <CardHeader>
                <CardTitle>Pets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.petDescription}</p>
              </CardContent>
            </Card>
          )}

          {/* References */}
          {application.references && application.references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>References</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.references.map((ref, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{ref.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ref.relationship} • {ref.phone}
                        {ref.email && ` • ${ref.email}`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {application.additionalNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{application.additionalNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{application.propertyTitle}</p>
              <p className="text-sm text-muted-foreground mb-3">{application.propertyAddress}</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/properties/${application.propertyId}`}>
                  View Property
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Review Actions */}
          {canReview && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
                <CardDescription>
                  Approve, request more info, or reject this application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments / Feedback</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add your comments..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  {/* Approve */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" disabled={isProcessing}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will approve the application and allow you to create a lease agreement. The tenant will be notified.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Request Info */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full" disabled={isProcessing}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Information
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Request Additional Information?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The tenant will be notified to provide the additional information specified in your comments. Make sure you've added comments explaining what's needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRequestInfo}>
                          Send Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Reject */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={isProcessing}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reject the application. The tenant will be notified of the decision. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Review */}
          {application.reviewComments && (
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">
                    Reviewed {application.reviewedAt && new Date(application.reviewedAt).toLocaleDateString()}
                  </p>
                  <p className="whitespace-pre-wrap">{application.reviewComments}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

