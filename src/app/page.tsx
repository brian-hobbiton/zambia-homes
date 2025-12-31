'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BedDouble,
  Bath,
  Car,
  MapPin,
  Search,
  Loader2,
  SlidersHorizontal,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/components/layout/site-header';
import { listProperties } from '@/lib/api-properties';
import { PropertyResponse, PropertyStatus, PropertyType, FurnishingStatus, ListPropertiesRequest } from '@/types/property';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StorageImage } from '@/components/ui/storage-image';

function PropertyCard({ property }: { property: PropertyResponse }) {
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : `https://picsum.photos/seed/${property.id}/600/400`;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/properties/${property.id}`} className="block relative">
          <StorageImage
            src={imageUrl}
            alt={property.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            fallbackSrc={`https://picsum.photos/seed/${property.id}/600/400`}
          />
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm font-bold py-1 px-3 rounded-full shadow-md">
            {property.currency} {property.price.toLocaleString()}/mo
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
          {property.city}, {property.province}
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
          {property.parkingSpaces && property.parkingSpaces > 0 && (
            <div className="flex items-center gap-2">
              <Car size={20} className="text-primary" />
              <span>{property.parkingSpaces} Parking</span>
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

// Filter state interface
interface FilterState {
  search: string;
  city: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  furnishingStatus: string;
  hasSecurity: boolean;
  boreholeWater: boolean;
  solarPower: boolean;
  sortBy: string;
  sortOrder: string;
}

const initialFilters: FilterState = {
  search: '',
  city: '',
  propertyType: '',
  minPrice: 0,
  maxPrice: 50000,
  minBedrooms: 0,
  furnishingStatus: '',
  hasSecurity: false,
  boreholeWater: false,
  solarPower: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// Zambian cities for dropdown
const zambianCities = [
  'Lusaka',
  'Ndola',
  'Kitwe',
  'Kabwe',
  'Chingola',
  'Mufulira',
  'Livingstone',
  'Luanshya',
  'Kasama',
  'Chipata',
  'Solwezi',
  'Mongu',
  'Mansa',
  'Choma',
  'Mazabuka',
];

export default function Home() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    appliedFilters.city !== '',
    appliedFilters.propertyType !== '',
    appliedFilters.minPrice > 0,
    appliedFilters.maxPrice < 50000,
    appliedFilters.minBedrooms > 0,
    appliedFilters.furnishingStatus !== '',
    appliedFilters.hasSecurity,
    appliedFilters.boreholeWater,
    appliedFilters.solarPower,
  ].filter(Boolean).length;

  const fetchProperties = useCallback(async (filterState: FilterState) => {
    try {
      setIsLoading(true);
      setError(null);

      const request: ListPropertiesRequest = {
        page: 1,
        pageSize: 100,
        search: filterState.search || undefined,
        city: filterState.city || undefined,
        propertyType: filterState.propertyType as PropertyType || undefined,
        minPrice: filterState.minPrice > 0 ? filterState.minPrice : undefined,
        maxPrice: filterState.maxPrice < 50000 ? filterState.maxPrice : undefined,
        minBedrooms: filterState.minBedrooms > 0 ? filterState.minBedrooms : undefined,
        furnishingStatus: filterState.furnishingStatus as FurnishingStatus || undefined,
        hasSecurity: filterState.hasSecurity || undefined,
        boreholeWater: filterState.boreholeWater || undefined,
        solarPower: filterState.solarPower || undefined,
        sortBy: filterState.sortBy || undefined,
        sortOrder: filterState.sortOrder || undefined,
      };

      const response = await listProperties(request);

      // Filter only active properties for public display
      const activeProperties = response.properties.filter(
        (p) => p.status === PropertyStatus.Active || p.status === PropertyStatus.Rented
      );

      setProperties(activeProperties);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(appliedFilters);
  }, [fetchProperties, appliedFilters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFilters = { ...appliedFilters, search: filters.search };
    setAppliedFilters(newFilters);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));

    // If input is cleared, reset search
    if (!value.trim()) {
      setAppliedFilters(prev => ({ ...prev, search: '' }));
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setIsFilterOpen(false);
  };

  const handleRemoveFilter = (filterKey: keyof FilterState) => {
    const newFilters = { ...appliedFilters };
    if (typeof initialFilters[filterKey] === 'boolean') {
      (newFilters[filterKey] as boolean) = false;
    } else if (typeof initialFilters[filterKey] === 'number') {
      (newFilters[filterKey] as number) = initialFilters[filterKey] as number;
    } else {
      (newFilters[filterKey] as string) = '';
    }
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-primary/10 py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="container mx-auto px-4 text-center relative">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-primary">
              Find Your Next Home in Zambia
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
              The trusted platform for long-term rentals. Explore listings, connect with landlords, and settle in.
            </p>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-background p-2 rounded-lg shadow-lg">
                <Search className="text-muted-foreground ml-2" />
                <Input
                  type="text"
                  placeholder="Enter a city, neighborhood, or address..."
                  className="flex-grow border-none focus-visible:ring-0 text-base"
                  value={filters.search}
                  onChange={handleSearchInputChange}
                />
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button type="button" variant="outline" size="icon" className="relative">
                      <SlidersHorizontal className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filter Properties</SheetTitle>
                      <SheetDescription>
                        Refine your search with these filters
                      </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                      {/* City */}
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select
                          value={filters.city || 'all'}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, city: value === 'all' ? '' : value }))}
                        >
                          <SelectTrigger id="city">
                            <SelectValue placeholder="All Cities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {zambianCities.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Property Type */}
                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select
                          value={filters.propertyType || 'all'}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value === 'all' ? '' : value }))}
                        >
                          <SelectTrigger id="propertyType">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value={PropertyType.Apartment}>Apartment</SelectItem>
                            <SelectItem value={PropertyType.House}>House</SelectItem>
                            <SelectItem value={PropertyType.Townhouse}>Townhouse</SelectItem>
                            <SelectItem value={PropertyType.Condo}>Condo</SelectItem>
                            <SelectItem value={PropertyType.Studio}>Studio</SelectItem>
                            <SelectItem value={PropertyType.Villa}>Villa</SelectItem>
                            <SelectItem value={PropertyType.Room}>Room</SelectItem>
                            <SelectItem value={PropertyType.Bedsitter}>Bedsitter</SelectItem>
                            <SelectItem value={PropertyType.Duplex}>Duplex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-4">
                        <Label>Price Range (ZMW/month)</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice === 50000 ? '' : filters.maxPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 50000 }))}
                            className="w-24"
                          />
                        </div>
                        <Slider
                          min={0}
                          max={50000}
                          step={500}
                          value={[filters.minPrice, filters.maxPrice]}
                          onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>K{filters.minPrice.toLocaleString()}</span>
                          <span>K{filters.maxPrice.toLocaleString()}{filters.maxPrice === 50000 ? '+' : ''}</span>
                        </div>
                      </div>

                      {/* Bedrooms */}
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Minimum Bedrooms</Label>
                        <Select
                          value={filters.minBedrooms.toString()}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, minBedrooms: Number(value) }))}
                        >
                          <SelectTrigger id="bedrooms">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Any</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Furnishing Status */}
                      <div className="space-y-2">
                        <Label htmlFor="furnishing">Furnishing</Label>
                        <Select
                          value={filters.furnishingStatus || 'any'}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, furnishingStatus: value === 'any' ? '' : value }))}
                        >
                          <SelectTrigger id="furnishing">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value={FurnishingStatus.Unfurnished}>Unfurnished</SelectItem>
                            <SelectItem value={FurnishingStatus.SemiFurnished}>Semi-Furnished</SelectItem>
                            <SelectItem value={FurnishingStatus.FullyFurnished}>Fully Furnished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amenities */}
                      <div className="space-y-3">
                        <Label>Amenities</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="security"
                              checked={filters.hasSecurity}
                              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasSecurity: checked as boolean }))}
                            />
                            <label htmlFor="security" className="text-sm font-medium leading-none cursor-pointer">
                              24/7 Security
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="borehole"
                              checked={filters.boreholeWater}
                              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, boreholeWater: checked as boolean }))}
                            />
                            <label htmlFor="borehole" className="text-sm font-medium leading-none cursor-pointer">
                              Borehole Water
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="solar"
                              checked={filters.solarPower}
                              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, solarPower: checked as boolean }))}
                            />
                            <label htmlFor="solar" className="text-sm font-medium leading-none cursor-pointer">
                              Solar Power
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="space-y-2">
                        <Label htmlFor="sortBy">Sort By</Label>
                        <Select
                          value={`${filters.sortBy}-${filters.sortOrder}`}
                          onValueChange={(value) => {
                            const [sortBy, sortOrder] = value.split('-');
                            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                          }}
                        >
                          <SelectTrigger id="sortBy">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="createdAt-desc">Newest First</SelectItem>
                            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="bedrooms-desc">Most Bedrooms</SelectItem>
                            <SelectItem value="bedrooms-asc">Fewest Bedrooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <SheetFooter className="flex gap-2">
                      <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                        Reset All
                      </Button>
                      <SheetClose asChild>
                        <Button onClick={handleApplyFilters} className="flex-1">
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Search
                </Button>
              </form>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {appliedFilters.city && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      City: {appliedFilters.city}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('city')} />
                    </Badge>
                  )}
                  {appliedFilters.propertyType && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {appliedFilters.propertyType}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('propertyType')} />
                    </Badge>
                  )}
                  {appliedFilters.minPrice > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Min: K{appliedFilters.minPrice.toLocaleString()}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('minPrice')} />
                    </Badge>
                  )}
                  {appliedFilters.maxPrice < 50000 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Max: K{appliedFilters.maxPrice.toLocaleString()}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('maxPrice')} />
                    </Badge>
                  )}
                  {appliedFilters.minBedrooms > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {appliedFilters.minBedrooms}+ Beds
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('minBedrooms')} />
                    </Badge>
                  )}
                  {appliedFilters.furnishingStatus && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {appliedFilters.furnishingStatus}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('furnishingStatus')} />
                    </Badge>
                  )}
                  {appliedFilters.hasSecurity && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Security
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('hasSecurity')} />
                    </Badge>
                  )}
                  {appliedFilters.boreholeWater && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Borehole
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('boreholeWater')} />
                    </Badge>
                  )}
                  {appliedFilters.solarPower && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Solar
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveFilter('solarPower')} />
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-6 text-xs">
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
              <h2 className="text-3xl font-bold font-headline text-center sm:text-left">
                {appliedFilters.search || activeFilterCount > 0 ? 'Search Results' : 'Featured Properties'}
              </h2>
              {!isLoading && (
                <p className="text-muted-foreground mt-2 sm:mt-0">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                </p>
              )}
            </div>

            {error && (
              <Alert className="mb-8 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  {appliedFilters.search || activeFilterCount > 0
                    ? 'No properties found matching your criteria.'
                    : 'No properties available at the moment.'}
                </p>
                {(appliedFilters.search || activeFilterCount > 0) && (
                  <Button variant="outline" onClick={handleResetFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.slice(0, 6).map((prop) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>
                {properties.length > 6 && (
                  <div className="text-center mt-12">
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/properties">
                        View All Properties ({properties.length})
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
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
