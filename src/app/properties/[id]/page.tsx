'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    BedDouble,
    Bath,
    Car,
    MapPin,
    Building,
    CheckCircle,
    MessageSquare,
    Star,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Alert, AlertDescription} from '@/components/ui/alert';
import SiteHeader from '@/components/layout/site-header';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import {Separator} from '@/components/ui/separator';
import {getPropertyById} from '@/lib/api-properties';
import {PropertyResponse} from '@/types/property';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {createPropertyInquiry} from '@/lib/api-inquiries';

export default function PropertyDetailsPage() {
    const params = useParams();
    const propertyId = params.id as string;

    const [property, setProperty] = useState<PropertyResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [sending, setSending] = useState(false);
    const {toast} = useToast();

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
                const errorMessage = err instanceof Error ? err.message : 'Failed to load property details';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const handleSendInquiry = async () => {
        if (!property) return;
        const msg = inquiryMessage.trim();
        if (msg.length < 10) {
            toast({
                title: 'Message too short',
                description: 'Please provide at least 10 characters.',
                variant: 'destructive'
            });
            return;
        }
        try {
            setSending(true);
            await createPropertyInquiry({propertyId: property.id, message: msg});
            toast({title: 'Inquiry sent', description: 'The landlord has been notified. They may contact you soon.'});
            setIsContactOpen(false);
            setInquiryMessage('');
        } catch (err) {
            console.error(err);
            toast({
                title: 'Failed to send',
                description: 'Please try again or check your connection.',
                variant: 'destructive'
            });
        } finally {
            setSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <SiteHeader/>
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </main>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="flex flex-col min-h-screen">
                <SiteHeader/>
                <main className="flex-1 flex items-center justify-center">
                    <Alert className="max-w-md border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600"/>
                        <AlertDescription className="text-red-800">
                            {error || 'Property not found.'}
                        </AlertDescription>
                    </Alert>
                </main>
            </div>
        );
    }

    // Get initials for landlord avatar fallback
    const landlordInitials = property.landlordName
        ? property.landlordName.split(' ').map((n) => n[0]).join('')
        : 'LL';

    // Property images - use real images from property
    const propertyImages = property.images && property.images.length > 0
        ? property.images
        : [`https://picsum.photos/seed/${property.id}/1200/800`];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <SiteHeader/>
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        {/* Image Carousel */}
                        <Card className="mb-8 shadow-lg">
                            <CardContent className="p-4">
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {propertyImages.map((imageUrl, index) => (
                                            <CarouselItem key={index}>
                                                <Image
                                                    src={imageUrl}
                                                    alt={`${property.title} - Image ${index + 1}`}
                                                    width={1200}
                                                    height={800}
                                                    className="w-full h-96 object-cover rounded-lg"
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {propertyImages.length > 1 && (
                                        <>
                                            <CarouselPrevious className="left-4"/>
                                            <CarouselNext className="right-4"/>
                                        </>
                                    )}
                                </Carousel>
                            </CardContent>
                        </Card>

                        {/* Property Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-3xl">{property.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-md pt-2">
                                    <MapPin size={18}/>
                                    {property?.address?.city ?? "Lusaka"}, {property?.address?.province ?? "Lusaka"}
                                </CardDescription>
                                <Badge className="w-fit mt-2">{property.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                {/* Key Features */}
                                <div className="flex items-center space-x-6 border-y py-4 my-4 flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-lg">
                                        <BedDouble size={24} className="text-primary"/>
                                        <span>{property.bedrooms} Bedrooms</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-lg">
                                        <Bath size={24} className="text-primary"/>
                                        <span>{property.bathrooms} Bathrooms</span>
                                    </div>
                                    {property.parkingSpaces && property.parkingSpaces > 0 && (
                                        <div className="flex items-center gap-2 text-lg">
                                            <Car size={24} className="text-primary"/>
                                            <span>{property.parkingSpaces} Parking</span>
                                        </div>
                                    )}
                                    {property.squareMeters && (
                                        <div className="flex items-center gap-2 text-lg">
                                            <Building size={24} className="text-primary"/>
                                            <span>{property.squareMeters} m²</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="prose max-w-none text-foreground/90">
                                    <h3 className="font-headline text-xl font-semibold mb-2">Description</h3>
                                    <p className="whitespace-pre-wrap">{property.description}</p>
                                </div>

                                {/* Additional Property Info */}
                                {(property.furnishingStatus || property.minimumLeaseMonths) && (
                                    <>
                                        <Separator className="my-6"/>
                                        <div>
                                            <h3 className="font-headline text-xl font-semibold mb-4">Property
                                                Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {property.furnishingStatus && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Furnishing</p>
                                                        <p className="font-semibold">{property.furnishingStatus}</p>
                                                    </div>
                                                )}
                                                {property.minimumLeaseMonths && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Minimum Lease</p>
                                                        <p className="font-semibold">{property.minimumLeaseMonths} months</p>
                                                    </div>
                                                )}
                                                {property.availableFrom && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Available From</p>
                                                        <p className="font-semibold">
                                                            {new Date(property.availableFrom).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Amenities */}
                                {property.amenities && property.amenities.length > 0 && (
                                    <>
                                        <Separator className="my-6"/>
                                        <div>
                                            <h3 className="font-headline text-xl font-semibold mb-4">Amenities</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {property.amenities.map((amenity) => (
                                                    <div key={amenity} className="flex items-center gap-2">
                                                        <CheckCircle size={18} className="text-green-500"/>
                                                        <span>{amenity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Special Features */}
                                {(property.hasSecurity || property.boreholeWater || property.solarPower || property.backupGenerator) && (
                                    <>
                                        <Separator className="my-6"/>
                                        <div>
                                            <h3 className="font-headline text-xl font-semibold mb-4">Special
                                                Features</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {property.hasSecurity && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={18} className="text-green-500"/>
                                                        <span>Security Features</span>
                                                    </div>
                                                )}
                                                {property.boreholeWater && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={18} className="text-green-500"/>
                                                        <span>Borehole Water</span>
                                                    </div>
                                                )}
                                                {property.solarPower && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={18} className="text-green-500"/>
                                                        <span>Solar Power</span>
                                                    </div>
                                                )}
                                                {property.backupGenerator && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={18} className="text-green-500"/>
                                                        <span>Backup Generator</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-8">
                        {/* Pricing Card */}
                        <Card className="shadow-lg sticky top-24">
                            <CardHeader className="text-center">
                                <p className="text-muted-foreground">Rent per month</p>
                                <p className="text-4xl font-bold font-headline text-primary">
                                    {property.currency} {property.price.toLocaleString()}
                                </p>
                                {property.securityDeposit && (
                                    <p className="text-muted-foreground">
                                        Deposit: {property.currency} {property.securityDeposit.toLocaleString()}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full text-lg" size="lg" asChild>
                                    <Link href={`/lease/checkout?propertyId=${propertyId}`}>Apply to Rent</Link>
                                </Button>
                                <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <MessageSquare size={16} className="mr-2"/>
                                            Contact Landlord
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Contact Landlord about {property.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-2">
                                            <Textarea
                                                value={inquiryMessage}
                                                onChange={(e) => setInquiryMessage(e.target.value)}
                                                placeholder="Write your message (at least 10 characters)..."
                                                rows={5}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Your name and contact details from your profile will be attached to this
                                                inquiry.
                                            </p>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsContactOpen(false)}
                                                    disabled={sending}>Cancel</Button>
                                            <Button onClick={handleSendInquiry} disabled={sending}>
                                                {sending ? (<><Loader2
                                                    className="h-4 w-4 mr-2 animate-spin"/>Sending...</>) : 'Send Inquiry'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                        {/* Landlord Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">About the Landlord</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center text-center">
                                <Avatar className="w-20 h-20 mb-4 z-0">
                                    <AvatarImage src={property.landlordAvatar} alt={property.landlordName}/>
                                    <AvatarFallback>{landlordInitials}</AvatarFallback>
                                </Avatar>
                                <h4 className="font-semibold">{property.landlordName || 'Property Owner'}</h4>
                                <Badge variant="secondary" className="mt-2">
                                    Verified Landlord
                                </Badge>
                                <div className="flex items-center gap-1 mt-3">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400"/>
                                    <span className="text-sm">4.8 ({property.inquiryCount} inquiries)</span>
                                </div>
                                <Button asChild variant="outline" className="w-full mt-4">
                                    <Link href="/messaging">
                                        <MessageSquare size={16} className="mr-2"/>
                                        Chat with Landlord
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Property Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">Property Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Views</span>
                                    <span className="font-semibold">{property.viewCount}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Saved</span>
                                    <span className="font-semibold">{property.saveCount}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Inquiries</span>
                                    <span className="font-semibold">{property.inquiryCount}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
