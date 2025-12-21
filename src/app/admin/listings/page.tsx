'use client';

import {useEffect, useState} from 'react';
import {listAdminProperties} from '@/lib/api-properties';
import {PropertyResponse, PropertyStatus} from '@/types/property';
import {Loader2, AlertCircle} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Card, CardContent} from '@/components/ui/card';
import ListingApprovalTable from './listing-approval-table';

export default function ListingManagementPage() {
    const [properties, setProperties] = useState<PropertyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await listAdminProperties({
                    page: 1,
                    pageSize: 100,
                });

                setProperties(response.properties);
            } catch (err) {
                console.error('Failed to fetch properties:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const pendingProperties = properties.filter(p => p.status === PropertyStatus.PendingApproval);
    const approvedProperties = properties.filter(p => p.status === PropertyStatus.Active);
    console.log('Pending Properties:', pendingProperties);

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
                <AlertDescription className="text-red-800">
                    {error}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Pending Approval ({pendingProperties.length})</h2>
                <ListingApprovalTable properties={pendingProperties} onUpdate={() => {
                    // Refetch properties after approval/rejection
                    listAdminProperties({page: 1, pageSize: 100}).then(response => {
                        setProperties(response.properties);
                    });
                }}/>
            </div>
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Approved Listings
                    ({approvedProperties.length})</h2>
                <ListingApprovalTable properties={approvedProperties} onUpdate={() => {
                    // Refetch properties after approval/rejection
                    listAdminProperties({page: 1, pageSize: 100}).then(response => {
                        setProperties(response.properties);
                    });
                }}/>
            </div>
        </div>
    );
}
