'use client';

import {useEffect, useState} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {
    Building2,
    Eye,
    MessageSquare,
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {getLandlordPropertyStats} from '@/lib/api-properties';
import {getMyKYCDocuments} from '@/lib/api-user';
import {PropertyStatsResponse} from '@/types/property';
import {KYCDocumentResponse} from '@/types/user';
import Link from 'next/link';

export default function LandlordDashboard() {
    const {user, isLoading: authLoading} = useAuth();
    const [stats, setStats] = useState<PropertyStatsResponse | null>(null);
    const [kycDocs, setKycDocs] = useState<KYCDocumentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            loadDashboardData();
        }
    }, [authLoading, user]);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const [propertyStats, kycDocuments] = await Promise.all([
                getLandlordPropertyStats().catch(() => null),
                getMyKYCDocuments().catch(() => []),
            ]);
            setStats(propertyStats);
            setKycDocs(kycDocuments);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getKYCStatus = () => {
        if (kycDocs.length === 0) {
            return {status: 'not_submitted', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: AlertCircle};
        }

        const hasVerified = kycDocs.some(doc => doc.status === 'approved');
        const hasPending = kycDocs.some(doc => doc.status === 'pending');
        const hasRejected = kycDocs.every(doc => doc.status === 'rejected');

        if (hasVerified) {
            return {status: 'verified', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2};
        } else if (hasPending) {
            return {status: 'pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock};
        } else if (hasRejected) {
            return {status: 'rejected', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle};
        }

        return {status: 'not_submitted', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: AlertCircle};
    };

    const kycStatus = getKYCStatus();
    const KYCIcon = kycStatus.icon;

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary"/>
                                <Badge variant="default" className="capitalize">
                                    Landlord
                                </Badge>
                            </div>
                            <h2 className="text-2xl font-bold font-headline">
                                Welcome back, {user?.firstName || user?.username || 'Landlord'}!
                            </h2>
                            <p className="text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KYC Status Alert */}
            {kycStatus.status !== 'verified' && (
                <Alert variant={kycStatus.status === 'rejected' ? 'destructive' : 'default'}>
                    <KYCIcon className="h-4 w-4"/>
                    <AlertDescription className="flex items-center justify-between">
            <span>
              {kycStatus.status === 'not_submitted' && 'Please complete your KYC verification to list properties.'}
                {kycStatus.status === 'pending' && 'Your KYC documents are under review. We\'ll notify you once verified.'}
                {kycStatus.status === 'rejected' && 'Your KYC documents were rejected. Please upload new documents.'}
            </span>
                        <Link href="/landlord/profile">
                            <Button variant="outline" size="sm">
                                {kycStatus.status === 'not_submitted' ? 'Upload Documents' : 'View Status'}
                            </Button>
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.activeListings || 0} active listings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all properties
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalInquiries || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total inquiries received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingApproval || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Properties awaiting review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* KYC Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle>KYC Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${kycStatus.bgColor}`}>
                                <KYCIcon className={`h-6 w-6 ${kycStatus.color}`}/>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold capitalize">{kycStatus.status.replace('_', ' ')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {kycDocs.length} document(s) submitted
                                </p>
                            </div>
                            <Link href="/landlord/profile">
                                <Button variant="outline">Manage Documents</Button>
                            </Link>
                        </div>

                        {kycDocs.length > 0 && (
                            <div className="border-t pt-4 space-y-2">
                                {kycDocs.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between text-sm">
                                        <span
                                            className="capitalize">{doc.documentType.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <Badge
                                            variant={
                                                doc.status === 'approved'
                                                    ? 'default'
                                                    : doc.status === 'pending'
                                                        ? 'secondary'
                                                        : 'destructive'
                                            }
                                        >
                                            {doc.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/landlord/properties/new" className="block">
                            <Button className="w-full" disabled={kycStatus.status !== 'verified'}>
                                <Building2 className="mr-2 h-4 w-4"/>
                                Add Property
                            </Button>
                        </Link>
                        <Link href="/landlord/properties" className="block">
                            <Button variant="outline" className="w-full">
                                <FileText className="mr-2 h-4 w-4"/>
                                View Properties
                            </Button>
                        </Link>
                        <Link href="/landlord/inquiries" className="block">
                            <Button variant="outline" className="w-full">
                                <MessageSquare className="mr-2 h-4 w-4"/>
                                View Inquiries
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
