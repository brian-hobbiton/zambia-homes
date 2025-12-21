'use client';

import { useEffect, useState } from 'react';
import { listApplications } from '@/lib/api-applications';
import { RentalApplicationListItem, ApplicationStatus } from '@/types/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<RentalApplicationListItem[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<RentalApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [incomeFilter, setIncomeFilter] = useState<{ min?: number; max?: number }>({});
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((app) =>
        app.tenantName.toLowerCase().includes(search) ||
        app.propertyTitle.toLowerCase().includes(search)
      );
    }

    // Income filter
    if (incomeFilter.min || incomeFilter.max) {
      filtered = filtered.filter((app) => {
        if (incomeFilter.min && app.monthlyIncome < incomeFilter.min) return false;
        return !(incomeFilter.max && app.monthlyIncome > incomeFilter.max);
      });
    }

    setFilteredApplications(filtered);
  }, [searchTerm, incomeFilter, applications]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await listApplications({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: 1,
        pageSize: 500,
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
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      [ApplicationStatus.Draft]: { variant: 'outline' },
      [ApplicationStatus.Submitted]: { variant: 'secondary' },
      [ApplicationStatus.UnderReview]: { variant: 'default' },
      [ApplicationStatus.AdditionalInfoRequested]: { variant: 'secondary' },
      [ApplicationStatus.Approved]: { variant: 'default' },
      [ApplicationStatus.Rejected]: { variant: 'destructive' },
      [ApplicationStatus.Withdrawn]: { variant: 'outline' },
      [ApplicationStatus.Expired]: { variant: 'destructive' },
    };

    const statusConfig = config[status] || { variant: 'outline' as const };
    return <Badge variant={statusConfig.variant}>{status}</Badge>;
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === ApplicationStatus.Approved).length,
    rejected: applications.filter(a => a.status === ApplicationStatus.Rejected).length,
    pending: applications.filter(a =>
      a.status === ApplicationStatus.Submitted || a.status === ApplicationStatus.UnderReview
    ).length,
  };

  const approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Applications Oversight</h1>
        <p className="text-muted-foreground">
          Monitor and manage all rental applications system-wide
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvalRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Applications</CardTitle>
          <CardDescription>
            Advanced filtering and search across all applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search tenant or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Min income"
              onChange={(e) => setIncomeFilter(prev => ({
                ...prev,
                min: e.target.value ? parseFloat(e.target.value) : undefined
              }))}
            />
            <Input
              type="number"
              placeholder="Max income"
              onChange={(e) => setIncomeFilter(prev => ({
                ...prev,
                max: e.target.value ? parseFloat(e.target.value) : undefined
              }))}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ApplicationStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value={ApplicationStatus.Submitted}>Submitted</option>
              <option value={ApplicationStatus.Approved}>Approved</option>
              <option value={ApplicationStatus.Rejected}>Rejected</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.tenantName}</TableCell>
                  <TableCell>{app.propertyTitle}</TableCell>
                  <TableCell>ZMW {app.monthlyIncome.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

