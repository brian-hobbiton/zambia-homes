'use client';

import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, X, Loader2, MoreVertical, AlertTriangle, Wrench } from 'lucide-react';
import Link from 'next/link';
import { PropertyResponse, PropertyStatus } from '@/types/property';
import { approveProperty, rejectProperty, suspendProperty, markPropertyUnderMaintenance } from '@/lib/api-properties';
import { useToast } from '@/hooks/use-toast';

export default function ListingApprovalTable({
  properties,
  onUpdate,
}: {
  properties: PropertyResponse[];
  onUpdate: () => void;
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApprove = async (propertyId: string) => {
    try {
      setProcessingId(propertyId);
      await approveProperty(propertyId);

      toast({
        title: 'Property Approved',
        description: 'The property has been successfully approved and is now active.',
      });

      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve property:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (propertyId: string) => {
    const confirmed = confirm('Are you sure you want to reject this property? It will be moved back to draft status.');
    if (!confirmed) return;

    try {
      setProcessingId(propertyId);
      await rejectProperty(propertyId);

      toast({
        title: 'Property Rejected',
        description: 'The property has been rejected and moved to draft status.',
      });

      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject property:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (propertyId: string) => {
    const confirmed = confirm('Are you sure you want to suspend this property? It will be temporarily unavailable.');
    if (!confirmed) return;

    try {
      setProcessingId(propertyId);
      await suspendProperty(propertyId);

      toast({
        title: 'Property Suspended',
        description: 'The property has been suspended.',
        variant: 'default',
      });

      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to suspend property:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleMaintenance = async (propertyId: string) => {
    const confirmed = confirm('Are you sure you want to mark this property as under maintenance?');
    if (!confirmed) return;

    try {
      setProcessingId(propertyId);
      await markPropertyUnderMaintenance(propertyId);

      toast({
        title: 'Property Status Updated',
        description: 'The property has been marked as under maintenance.',
      });

      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to update property:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.Active:
        return <Badge variant="default">Active</Badge>;
      case PropertyStatus.PendingApproval:
        return <Badge variant="secondary">Pending Approval</Badge>;
      case PropertyStatus.Draft:
        return <Badge variant="outline">Draft</Badge>;
      case PropertyStatus.Suspended:
        return <Badge variant="destructive">Suspended</Badge>;
      case PropertyStatus.UnderMaintenance:
        return <Badge className="bg-orange-500">Under Maintenance</Badge>;
      case PropertyStatus.Rented:
        return <Badge className="bg-green-600">Rented</Badge>;
      case PropertyStatus.Deleted:
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (properties.length === 0) {
    return <p className="text-muted-foreground">No listings in this category.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Rent</TableHead>
          <TableHead>Landlord</TableHead>
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
            <TableCell>{prop.city}, {prop.province}</TableCell>
            <TableCell>{prop?.currency??"ZMW"} {prop?.price?.toLocaleString()}</TableCell>
            <TableCell>{prop.landlordName || 'N/A'}</TableCell>
            <TableCell>
              {getStatusBadge(prop.status)}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {prop.status === PropertyStatus.PendingApproval && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-500 hover:text-green-600"
                      onClick={() => handleApprove(prop.id)}
                      disabled={processingId === prop.id}
                      title="Approve"
                    >
                      {processingId === prop.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="sr-only">Approve</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleReject(prop.id)}
                      disabled={processingId === prop.id}
                      title="Reject"
                    >
                      {processingId === prop.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="sr-only">Reject</span>
                    </Button>
                  </>
                )}
                {(prop.status === PropertyStatus.Active || prop.status === PropertyStatus.Suspended || prop.status === PropertyStatus.UnderMaintenance) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={processingId === prop.id}
                      >
                        {processingId === prop.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {prop.status !== PropertyStatus.Active && (
                        <DropdownMenuItem onClick={() => handleApprove(prop.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {prop.status !== PropertyStatus.Suspended && (
                        <DropdownMenuItem onClick={() => handleSuspend(prop.id)}>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {prop.status !== PropertyStatus.UnderMaintenance && (
                        <DropdownMenuItem onClick={() => handleMaintenance(prop.id)}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Mark Under Maintenance
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleReject(prop.id)} className="text-red-600">
                        <X className="mr-2 h-4 w-4" />
                        Move to Draft
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

