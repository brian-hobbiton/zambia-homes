'use client';

import Link from 'next/link';
import Image from 'next/image';
import {PlusCircle, MoreHorizontal, BedDouble, Bath, Loader2, AlertCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {LandlordWelcome} from '@/components/landlord/landlord-welcome';
import { useEffect, useState } from 'react';
import { listLandlordProperties, deleteProperty } from '@/lib/api-properties';
import { PropertyResponse, PropertyStatus } from '@/types/property';
import { useAuth } from '@/hooks/use-auth';

export default function LandlordPropertiesPage() {
    const [landlordProperties, setLandlordProperties] = useState<PropertyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const {user, isLoading: isAuthLoading} = useAuth();

    useEffect(() => {
        if (isAuthLoading || !user) return;

        const fetchProperties = async () => {
            try {
                setIsLoading(true);
                setError(null);

        // Fetch landlord's own properties
        const response = await listLandlordProperties({
          page: 1,
          pageSize: 100,
        });

                setLandlordProperties(response.properties);
            } catch (err) {
                console.error('Failed to fetch properties:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, [user, isAuthLoading]);

    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            setDeletingId(propertyId);
            await deleteProperty(propertyId);
            setLandlordProperties((prev) =>
                prev.filter((prop) => prop.id !== propertyId)
            );
        } catch (err) {
            console.error('Failed to delete property:', err);
            alert('Failed to delete property. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    if (isAuthLoading) {
        return (
            <div>
                <LandlordWelcome/>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <LandlordWelcome/>
            <div className="flex items-center justify-end mb-4">
                <Button asChild>
                    <Link href="/landlord/properties/add">
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        Add Property
                    </Link>
                </Button>
            </div>

            {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600"/>
                    <AlertDescription className="text-red-800">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Properties</CardTitle>
                    <CardDescription>
                        Manage your property listings and view their status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                        </div>
                    ) : landlordProperties.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">You haven't added any properties yet.</p>
                            <Button asChild className="mt-4">
                                <Link href="/landlord/properties/add">Add Your First Property</Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">
                                        Image
                                    </TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Rent</TableHead>
                                    <TableHead className="hidden md:table-cell">Details</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {landlordProperties.map((prop) => {
                                    const imageUrl = prop.images && prop.images.length > 0
                                        ? prop.images[0]
                                        : `https://picsum.photos/seed/${prop.id}/64/64`;

                                    const getStatusVariant = (status: PropertyStatus) => {
                                        switch (status) {
                                            case PropertyStatus.Active:
                                                return 'default';
                                            case PropertyStatus.PendingApproval:
                                                return 'secondary';
                                            case PropertyStatus.Draft:
                                                return 'outline';
                                            case PropertyStatus.Suspended:
                                            case PropertyStatus.Deleted:
                                                return 'destructive';
                                            default:
                                                return 'secondary';
                                        }
                                    };

                                    return (
                                        <TableRow key={prop.id}>
                                            <TableCell className="hidden sm:table-cell">
                                                <Image
                                                    alt={prop.title}
                                                    className="aspect-square rounded-md object-cover"
                                                    height="64"
                                                    src={imageUrl}
                                                    width="64"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{prop.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(prop.status)}>
                                                    {prop.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {prop.currency} {prop.price.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1"><BedDouble
                                                        className="h-4 w-4"/> {prop.bedrooms}</div>
                                                    <div className="flex items-center gap-1"><Bath
                                                        className="h-4 w-4"/> {prop.bathrooms}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            aria-haspopup="true"
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={deletingId === prop.id}
                                                        >
                                                            {deletingId === prop.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                                            ) : (
                                                                <MoreHorizontal className="h-4 w-4"/>
                                                            )}
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Link
                                                                href={`/landlord/properties/${prop.id}/edit`}>Edit</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Link href={`/landlord/properties/${prop.id}/applications`}>View
                                                                Applications</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600"
                                                                          onClick={() => handleDeleteProperty(prop.id)}>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                {!isLoading && landlordProperties.length > 0 && (
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-{landlordProperties.length}</strong> of <strong>{landlordProperties.length}</strong> properties
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
