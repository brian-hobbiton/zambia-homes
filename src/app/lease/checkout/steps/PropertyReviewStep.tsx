'use client';

import Image from 'next/image';
import { PropertyResponse } from '@/types/property';
import { CreateRentalApplicationRequest } from '@/types/application';
import { MapPin, BedDouble, Bath, Car, Building } from 'lucide-react';

interface PropertyReviewStepProps {
  property: PropertyResponse;
  formData: Partial<CreateRentalApplicationRequest>;
  updateFormDataAction: (data: Partial<CreateRentalApplicationRequest>) => void;
}

export default function PropertyReviewStep({ property }: PropertyReviewStepProps) {
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : `https://picsum.photos/seed/${property.id}/800/400`;

  return (
    <div className="space-y-6">
      {/* Property Image */}
      <div className="relative w-full h-64 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Property Details */}
      <div>
        <h3 className="text-2xl font-bold font-headline mb-2">{property.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span>{property.city}, {property.province}</span>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <BedDouble className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">{property.bedrooms}</div>
            <div className="text-xs text-muted-foreground">Bedrooms</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Bath className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">{property.bathrooms}</div>
            <div className="text-xs text-muted-foreground">Bathrooms</div>
          </div>
        </div>
        {property.parkingSpaces && property.parkingSpaces > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Car className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">{property.parkingSpaces}</div>
              <div className="text-xs text-muted-foreground">Parking</div>
            </div>
          </div>
        )}
        {property.squareMeters && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">{property.squareMeters}m²</div>
              <div className="text-xs text-muted-foreground">Area</div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-primary/10 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted-foreground">Monthly Rent</div>
            <div className="text-2xl font-bold text-primary">
              {property.currency} {property.price.toLocaleString()}
            </div>
          </div>
          {property.securityDeposit && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Security Deposit</div>
              <div className="text-lg font-semibold">
                {property.currency} {property.securityDeposit.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {property.description}
          </p>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {amenity}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> By proceeding with this application, you confirm that you are interested in renting this property at the listed price and terms.
        </p>
      </div>
    </div>
  );
}

