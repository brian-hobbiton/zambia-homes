'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle2, Upload, X, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPropertyById, updateProperty } from '@/lib/api-properties';
import { PropertyResponse, PropertyType, FurnishingStatus } from '@/types/property';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';
import { StorageImage } from '@/components/ui/storage-image';
import Link from 'next/link';

const amenitiesList = [
  { id: 'garden', label: 'Garden' },
  { id: 'modern-kitchen', label: 'Modern Kitchen' },
  { id: 'electric-fence', label: 'Electric Fence' },
  { id: 'pet-friendly', label: 'Pet Friendly' },
  { id: 'swimming-pool', label: 'Swimming Pool' },
  { id: 'cctv', label: 'CCTV' },
  { id: 'gated-community', label: 'Gated Community' },
  { id: 'fully-furnished', label: 'Fully Furnished' },
  { id: 'backup-generator', label: 'Backup Generator' },
];

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  propertyType: z.string().min(1, 'Property type is required.'),
  description: z.string().min(50, 'Description must be at least 50 characters.'),
  rent: z.coerce.number().positive('Rent must be a positive number.'),
  deposit: z.coerce.number().min(0, 'Deposit cannot be negative.'),
  location: z.string().min(3, 'Location is required.'),
  bedrooms: z.coerce.number().int().min(1, 'Must have at least 1 bedroom.'),
  bathrooms: z.coerce.number().int().min(1, 'Must have at least 1 bathroom.'),
  parkingSpots: z.coerce.number().int().min(0, 'Parking spots cannot be negative.'),
  furnishingStatus: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitPending, setSubmitPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading, progress, error: uploadError } = useFileUpload({
    category: 'properties',
    onSuccess: (result) => {
      setUploadedImages((prev) => [...prev, result.url]);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      propertyType: PropertyType.Apartment,
      description: '',
      rent: 0,
      deposit: 0,
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      furnishingStatus: FurnishingStatus.Unfurnished,
      amenities: [],
    },
  });

  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getPropertyById(propertyId);
        setProperty(data);

        // Populate form with existing data
        const location = data.address
          ? `${data.address.street || ''}, ${data.city || ''}, ${data.province || ''}`
          : `${data.city || ''}, ${data.province || ''}`;

        form.reset({
          title: data.title,
          propertyType: data.propertyType,
          description: data.description,
          rent: data.price,
          deposit: data.securityDeposit || 0,
          location: location.replace(/^,\s*/, '').replace(/,\s*$/, ''),
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          parkingSpots: data.parkingSpaces || 0,
          furnishingStatus: data.furnishingStatus || FurnishingStatus.Unfurnished,
          amenities: data.amenities || [],
        });

        // Set existing images
        if (data.images && data.images.length > 0) {
          setUploadedImages(data.images);
        }
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await upload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitError(null);
    setSubmitPending(true);

    try {
      // Parse location into address components
      const locationParts = values.location.split(',').map(part => part.trim());
      const street = locationParts[0] || '';
      const city = locationParts[1] || '';
      const province = locationParts[2] || 'Lusaka';

      const updateData = {
        title: values.title,
        propertyType: values.propertyType as PropertyType,
        description: values.description,
        price: values.rent,
        address: {
          street: street || values.location,
          city: city || 'Lusaka',
          province: province,
        },
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        parkingSpaces: values.parkingSpots,
        furnishingStatus: values.furnishingStatus as FurnishingStatus,
        amenities: values.amenities,
        imageUrls: uploadedImages,
      };

      await updateProperty(propertyId, updateData);
      setSubmitSuccess(true);

      setTimeout(() => {
        router.push('/landlord/properties');
      }, 1500);
    } catch (err) {
      console.error('Failed to update property:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setSubmitPending(false);
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/landlord/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">Edit Property</h1>
          <p className="text-muted-foreground">Update your property listing</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Property Details</CardTitle>
          <CardDescription>
            Update the details of your property listing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Property updated successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}
          {submitError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{submitError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Modern Family Home in Woodlands" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PropertyType).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the key features, location, and appeal of your property..."
                        {...field}
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Images Upload */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base">Property Images</FormLabel>
                  <FormDescription>
                    Upload high-quality photos of your property. The first image will be the main listing photo.
                  </FormDescription>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">
                    {uploadedImages.length}/10 images
                  </span>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                )}

                {uploadError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{uploadError}</AlertDescription>
                  </Alert>
                )}

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border">
                          <StorageImage
                            src={imageUrl}
                            alt={`Property image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent (ZMW per month)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit (ZMW)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kabulonga, Lusaka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parkingSpots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parking Spots</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="furnishingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Furnishing Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select furnishing status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(FurnishingStatus).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Amenities</FormLabel>
                      <FormDescription>
                        Select all the amenities that apply to your property.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {amenitiesList.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== item.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push('/landlord/properties')}
                  disabled={submitPending || submitSuccess}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitPending || submitSuccess}>
                  {submitPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

