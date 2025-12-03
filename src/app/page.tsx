import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BedDouble,
  Bath,
  Car,
  MapPin,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { properties } from '@/lib/data';
import { placeHolderImages } from '@/lib/placeholder-images';
import SiteHeader from '@/components/layout/site-header';

function PropertyCard({ property }: { property: (typeof properties)[0] }) {
  const image = placeHolderImages.find((img) => img.id === property.imageId);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/properties/${property.id}`} className="block relative">
          <Image
            src={image?.imageUrl || `https://picsum.photos/seed/${property.id}/600/400`}
            alt={image?.description || property.title}
            data-ai-hint={image?.imageHint || 'house exterior'}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm font-bold py-1 px-3 rounded-full shadow-md">
            ZMW {property.rent.toLocaleString()}/mo
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="font-headline text-xl mb-2">
          <Link href={`/properties/${property.id}`} className="hover:text-primary transition-colors">
            {property.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin size={16} />
          {property.location}
        </CardDescription>
        <div className="flex justify-around text-center border-t border-b py-3 text-sm">
          <div className="flex items-center gap-2">
            <BedDouble size={20} className="text-primary" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath size={20} className="text-primary" />
            <span>{property.bathrooms} Baths</span>
          </div>
          {property.parkingSpots > 0 && (
            <div className="flex items-center gap-2">
              <Car size={20} className="text-primary" />
              <span>{property.parkingSpots} Parking</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/properties/${property.id}`}>
            View Details <ArrowRight className="ml-2" size={16} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-primary/10 py-20 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            <div className="container mx-auto px-4 text-center relative">
                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-primary-foregroundmix">Find Your Next Home in Zambia</h1>
                <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
                    The trusted platform for long-term rentals. Explore listings, connect with landlords, and settle in.
                </p>
                <div className="max-w-2xl mx-auto">
                    <form className="flex items-center gap-2 bg-background p-2 rounded-lg shadow-lg">
                        <Search className="text-muted-foreground ml-2" />
                        <Input
                            type="text"
                            placeholder="Enter a city, neighborhood, or address..."
                            className="flex-grow border-none focus-visible:ring-0 text-base"
                        />
                        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            Search
                        </Button>
                    </form>
                </div>
            </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-headline text-center mb-12">
              Featured Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.slice(0, 6).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Properties
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-secondary">
          <div className="container mx-auto px-4 py-6 text-center text-secondary-foreground">
              <p>&copy; {new Date().getFullYear()} Zambia Homes. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
