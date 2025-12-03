'use client';

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
import type { Property } from '@/lib/data';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

export default function ListingApprovalTable({
  properties,
}: {
  properties: Property[];
}) {

    if (properties.length === 0) {
        return <p className="text-muted-foreground">No listings in this category.</p>
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Rent (ZMW)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((prop) => (
          <TableRow key={prop.id}>
            <TableCell className="font-medium">
                <Link href={`/properties/${prop.id}`} className="hover:underline" target="_blank">
                    {prop.title}
                </Link>
            </TableCell>
            <TableCell>{prop.location}</TableCell>
            <TableCell>{prop.rent.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={prop.status === 'APPROVED' ? 'default' : prop.status === 'PENDING' ? 'secondary' : 'destructive'}>
                {prop.status}
              </Badge>
            </TableCell>
            <TableCell>
                {prop.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                        </Button>
                    </div>
                )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
