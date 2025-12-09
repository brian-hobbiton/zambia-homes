'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUsers, getUserStats, updateUserStatus, updateUserRole } from '@/lib/api-user';
import { UserListRequest, UserListResponse, UserStatsResponse } from '@/types/user';
import { AccountStatus, UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Home, Shield, CheckCircle2 } from 'lucide-react';

export function AdminUsersPage() {
  const { role, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [users, setUsers] = useState<UserListResponse | null>(null);
  const [filters, setFilters] = useState<UserListRequest>({
    page: 1,
    pageSize: 20,
    sortBy: 'created',
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && role === 'admin') {
      loadData();
    }
  }, [authLoading, role, filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, usersData] = await Promise.all([
        getUserStats(),
        getUsers(filters),
      ]);

      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleStatusChange = async (userId: string, newStatus: AccountStatus) => {
    try {
      await updateUserStatus(userId, {
        status: newStatus,
        reason: 'Updated by admin',
      });
      // Reload users
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, {
        role: newRole,
        reason: 'Updated by admin',
      });
      // Reload users
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (role !== 'admin') {
    return (
      <Alert>
        <AlertDescription>
          You do not have permission to view this page. Admin access required.
        </AlertDescription>
      </Alert>
    );
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'landlord':
        return 'default';
      case 'tenant':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && !isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Landlords</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLandlords}</div>
              <p className="text-xs text-muted-foreground">
                {stats.kycVerifiedLandlords} KYC verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newUsersThisWeek} new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingUsers}</div>
              <p className="text-xs text-muted-foreground">
                awaiting verification
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Search by email, name, username..."
              value={search}
              onChange={handleSearch}
              className="flex-1"
            />
            <Button variant="outline">Search</Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : users?.users.length === 0 ? (
            <Alert>
              <AlertDescription>No users found</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{user.fullName || user.username || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{user.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value as UserRole)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="tenant">Tenant</SelectItem>
                              <SelectItem value="landlord">Landlord</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.status}
                            onValueChange={(value) =>
                              handleStatusChange(user.id, value as AccountStatus)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.isKYCVerified ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {users && users.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {users.page} of {users.totalPages} (
                    {users.totalCount} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={users.page === 1}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: prev.page! - 1,
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={users.page === users.totalPages}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: prev.page! + 1,
                        }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

