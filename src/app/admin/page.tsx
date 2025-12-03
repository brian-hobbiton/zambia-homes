import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Building2,
  FileCheck,
  Activity,
} from 'lucide-react';
import { properties, users, kycVerifications } from '@/lib/data';
import ListingApprovalTable from './listings/listing-approval-table';

export default function AdminDashboard() {
  const pendingListings = properties.filter((p) => p.status === 'PENDING');
  const pendingKycs = kycVerifications.filter((k) => k.status === 'PENDING');

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      description: 'All user accounts',
    },
    {
      title: 'Total Properties',
      value: properties.length,
      icon: Building2,
      description: 'All listed properties',
    },
    {
      title: 'Pending Listings',
      value: pendingListings.length,
      icon: FileCheck,
      description: 'Properties awaiting approval',
    },
    {
      title: 'Pending KYC',
      value: pendingKycs.length,
      icon: Activity,
      description: 'Landlords needing verification',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-headline font-bold mb-4">Recent Pending Listings</h2>
        <ListingApprovalTable properties={pendingListings.slice(0, 5)} />
      </div>
    </div>
  );
}
