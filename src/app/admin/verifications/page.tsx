import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { kycVerifications } from '@/lib/data';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerificationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Landlord KYC Verifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Landlord</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kycVerifications.map((kyc) => (
              <TableRow key={kyc.id}>
                <TableCell className="font-medium">{kyc.landlordName}</TableCell>
                <TableCell>{kyc.documentType}</TableCell>
                <TableCell>{kyc.submittedAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={kyc.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {kyc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {kyc.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                            <X className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
