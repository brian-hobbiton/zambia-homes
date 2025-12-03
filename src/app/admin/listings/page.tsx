import { properties } from '@/lib/data';
import ListingApprovalTable from './listing-approval-table';

export default function ListingManagementPage() {
  const pendingProperties = properties.filter(p => p.status === 'PENDING');
  const approvedProperties = properties.filter(p => p.status === 'APPROVED');
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Pending Approval</h2>
        <ListingApprovalTable properties={pendingProperties} />
      </div>
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Approved Listings</h2>
        <ListingApprovalTable properties={approvedProperties} />
      </div>
    </div>
  );
}
