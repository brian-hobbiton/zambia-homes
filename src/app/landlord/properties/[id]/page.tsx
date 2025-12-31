'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPropertyById } from '@/lib/api-properties';
import { PropertyResponse } from '@/types/property';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Edit,
  FileText,
  BedDouble,
  Bath,
  Car,
  Building,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StorageImage } from '@/components/ui/storage-image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error || 'Property not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const propertyImages = property.images && property.images.length > 0
    ? property.images
    : [`https://picsum.photos/seed/${propertyId}/800/600`];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pendingapproval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/landlord/properties">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-headline">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.city}, {property.province}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/landlord/properties/${propertyId}/applications`}>
              <FileText className="h-4 w-4 mr-2" />
              View Applications
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/landlord/properties/${propertyId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Image Carousel */}
          <Card>
            <CardContent className="p-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {propertyImages.map((imageUrl, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <StorageImage
                          src={imageUrl}
                          alt={`${property.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          fallbackSrc={`https://picsum.photos/seed/${propertyId}/800/600`}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {propertyImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
              </Carousel>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{property.description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-xs text-muted-foreground">Bedrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-xs text-muted-foreground">Bathrooms</div>
                  </div>
                </div>
                {property.parkingSpaces && property.parkingSpaces > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.parkingSpaces}</div>
                      <div className="text-xs text-muted-foreground">Parking</div>
                    </div>
                  </div>
                )}
                {property.squareMeters && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.squareMeters}m²</div>
                      <div className="text-xs text-muted-foreground">Area</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="capitalize">{amenity.replace(/-/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Rent</div>
                <div className="text-3xl font-bold text-primary">
                  {property.currency} {property.price.toLocaleString()}
                </div>
              </div>
              {property.securityDeposit && (
                <div>
                  <div className="text-sm text-muted-foreground">Security Deposit</div>
                  <div className="text-xl font-semibold">
                    {property.currency} {property.securityDeposit.toLocaleString()}
                  </div>
                </div>
              )}
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Property Type</div>
                <div className="font-medium capitalize">{property.propertyType}</div>
              </div>
              {property.furnishingStatus && (
                <div>
                  <div className="text-sm text-muted-foreground">Furnishing</div>
                  <div className="font-medium capitalize">
                    {property.furnishingStatus.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {property.address?.street && (
                  <div>{property.address.street}</div>
                )}
                <div>
                  {property.city}, {property.province}
                </div>
                {property.address?.postalCode && (
                  <div>{property.address.postalCode}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/landlord/properties/${propertyId}/applications`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Applications
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/landlord/properties/${propertyId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/properties/${propertyId}`} target="_blank">
                  View Public Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

