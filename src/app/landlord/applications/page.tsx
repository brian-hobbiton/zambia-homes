'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {listApplications} from '@/lib/api-applications';
import {RentalApplicationListItem, ApplicationStatus} from '@/types/application';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {Loader2, AlertCircle, FileText, Eye} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Input} from '@/components/ui/input';

export default function LandlordApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<RentalApplicationListItem[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<RentalApplicationListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredApplications(applications);
            return;
        }

        const search = searchTerm.toLowerCase();
        const filtered = applications.filter((app) => {
            return (
                app.propertyTitle.toLowerCase().includes(search) ||
                app.tenantName.toLowerCase().includes(search)
            );
        });

        setFilteredApplications(filtered);
    }, [searchTerm, applications]);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await listApplications({
                status: filter !== 'all' ? filter : undefined,
                page: 1,
                pageSize: 100,
                sortBy: 'submitted',
                sortOrder: 'desc',
            });

            setApplications(response.applications);
            setFilteredApplications(response.applications);
        } catch (err) {
            console.error('Failed to fetch applications:', err);
            setError(err instanceof Error ? err.message : 'Failed to load applications');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: ApplicationStatus | string) => {
        const config: Record<string, {
            variant: 'default' | 'secondary' | 'destructive' | 'outline',
            className?: string
        }> = {
            [ApplicationStatus.Draft]: {variant: 'outline'},
            [ApplicationStatus.Submitted]: {variant: 'secondary', className: 'bg-blue-100 text-blue-800'},
            [ApplicationStatus.UnderReview]: {variant: 'default', className: 'bg-orange-100 text-orange-800'},
            [ApplicationStatus.AdditionalInfoRequested]: {
                variant: 'secondary',
                className: 'bg-amber-100 text-amber-800'
            },
            [ApplicationStatus.Approved]: {variant: 'default', className: 'bg-green-100 text-green-800'},
            [ApplicationStatus.Rejected]: {variant: 'destructive'},
            [ApplicationStatus.Withdrawn]: {variant: 'outline'},
            [ApplicationStatus.Expired]: {variant: 'destructive'},
        };

        const statusConfig = config[status] || {variant: 'outline' as const};
        return <Badge variant={statusConfig.variant} className={statusConfig.className}>{status}</Badge>;
    };

    const pendingCount = applications.filter(a =>
        a.status === ApplicationStatus.Submitted ||
        a.status === ApplicationStatus.UnderReview
    ).length;

    const approvedCount = applications.filter(a => a.status === ApplicationStatus.Approved).length;
    const rejectedCount = applications.filter(a => a.status === ApplicationStatus.Rejected).length;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600"/>
                <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-2">Applications</h1>
                <p className="text-muted-foreground">
                    Review and manage rental applications for your properties
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Rental Applications</CardTitle>
                    <CardDescription>
                        Review applications from potential tenants
                    </CardDescription>
                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="flex gap-2">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === ApplicationStatus.Submitted ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(ApplicationStatus.Submitted)}
                            >
                                Submitted ({applications.filter(a => a.status === ApplicationStatus.Submitted).length})
                            </Button>
                            <Button
                                variant={filter === ApplicationStatus.Approved ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(ApplicationStatus.Approved)}
                            >
                                Approved
                            </Button>
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Search by property or tenant name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                            <p className="text-lg text-muted-foreground mb-2">
                                {searchTerm
                                    ? 'No applications match your search.'
                                    : filter === 'all'
                                        ? 'No applications yet.'
                                        : 'No applications with this status.'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Applications will appear here when tenants apply to your properties.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Income</TableHead>
                                    <TableHead>Move-in Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">
                                            {app.propertyTitle}
                                        </TableCell>
                                        <TableCell>{app.tenantName}</TableCell>
                                        <TableCell>
                                            {app.submittedAt
                                                ? new Date(app.submittedAt).toLocaleDateString()
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                                        <TableCell>ZMW {app.monthlyIncome.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {new Date(app.desiredMoveInDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/landlord/applications/${app.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-2"/>
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

