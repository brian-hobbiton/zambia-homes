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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { properties, users } from '@/lib/data';
import { placeHolderImages } from '@/lib/placeholder-images';
import SiteHeader from '@/components/layout/site-header';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from '@/components/ui/separator';

export default function PropertyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const property = properties.find((p) => p.id === params.id);
  const landlord = users.find((u) => u.id === property?.landlordId);

  if (!property || !landlord) {
    return (
        <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Property not found.</p>
        </main>
      </div>
    );
  }

  const propertyImages = property.images.map(id => placeHolderImages.find(img => img.id === id)).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card className="mb-8 shadow-lg">
                    <CardContent className="p-4">
                        <Carousel className="w-full">
                            <CarouselContent>
                                {propertyImages.map((image, index) => (
                                <CarouselItem key={index}>
                                    <Image
                                        src={image?.imageUrl!}
                                        alt={image?.description!}
                                        data-ai-hint={image?.imageHint}
                                        width={1200}
                                        height={800}
                                        className="w-full h-96 object-cover rounded-lg"
                                    />
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                        </Carousel>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">{property.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-md pt-2">
                            <MapPin size={18} />
                            {property.location}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-6 border-y py-4 my-4">
                            <div className="flex items-center gap-2 text-lg">
                                <BedDouble size={24} className="text-primary" />
                                <span>{property.bedrooms} Bedrooms</span>
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <Bath size={24} className="text-primary" />
                                <span>{property.bathrooms} Bathrooms</span>
                            </div>
                            {property.parkingSpots > 0 && (
                                <div className="flex items-center gap-2 text-lg">
                                <Car size={24} className="text-primary" />
                                <span>{property.parkingSpots} Parking</span>
                                </div>
                            )}
                        </div>

                        <div className="prose max-w-none text-foreground/90">
                            <h3 className="font-headline text-xl font-semibold mb-2">Summary</h3>
                            <p>{property.summary}</p>
                            <h3 className="font-headline text-xl font-semibold mt-6 mb-2">Full Description</h3>
                            <p>{property.description}</p>
                        </div>
                        
                        <Separator className="my-6" />

                        <div>
                            <h3 className="font-headline text-xl font-semibold mb-4">Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.amenities.map((amenity) => (
                                <div key={amenity} className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span>{amenity}</span>
                                </div>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-1 space-y-8">
                <Card className="shadow-lg sticky top-24">
                    <CardHeader className="text-center">
                        <p className="text-muted-foreground">Rent per month</p>
                        <p className="text-4xl font-bold font-headline text-primary">
                            ZMW {property.rent.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Deposit: ZMW {property.deposit.toLocaleString()}</p>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full text-lg" size="lg" asChild>
                            <Link href="/lease/contract">Apply to Rent</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">About the Landlord</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <Avatar className="w-20 h-20 mb-4">
                            <AvatarImage src={landlord.avatarUrl} alt={landlord.name} />
                            <AvatarFallback>{landlord.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h4 className="font-semibold">{landlord.name}</h4>
                        <Badge variant="secondary" className="mt-2">Verified Landlord</Badge>
                        <div className="flex items-center gap-1 mt-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm">4.9 (15 reviews)</span>
                        </div>
                        <Button asChild variant="outline" className="w-full mt-4">
                            <Link href="/messaging">
                                <MessageSquare size={16} className="mr-2"/>
                                Chat with Landlord
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
