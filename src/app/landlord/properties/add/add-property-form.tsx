'use client';

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
import { generateSummary } from './actions';
import { useState, useTransition, useRef } from 'react';
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createProperty } from '@/lib/api-properties';
import { PropertyType, FurnishingStatus } from '@/types/property';
import { useRouter } from 'next/navigation';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';
import { StorageImage } from '@/components/ui/storage-image';

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
  summary: z.string().optional(),
  rent: z.coerce.number().positive('Rent must be a positive number.'),
  deposit: z.coerce.number().positive('Deposit must be a positive number.'),
  location: z.string().min(3, 'Location is required.'),
  bedrooms: z.coerce.number().int().min(1, 'Must have at least 1 bedroom.'),
  bathrooms: z.coerce.number().int().min(1, 'Must have at least 1 bathroom.'),
  parkingSpots: z.coerce.number().int().min(0, 'Parking spots cannot be negative.'),
  furnishingStatus: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export default function AddPropertyForm() {
  const [isPending, startTransition] = useTransition();
  const [submitPending, setSubmitPending] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; fileName: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { upload, isUploading, progress, error: uploadError } = useFileUpload({
    category: 'properties',
    onSuccess: (result) => {
      setUploadedImages((prev) => [...prev, { url: result.url, fileName: result.fileName }]);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Upload files one by one
    for (const file of Array.from(files)) {
      await upload(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      propertyType: PropertyType.Apartment,
      description: '',
      summary: '',
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      setSubmitError('You must be logged in to add a property');
      return;
    }

    setSubmitError(null);
    setSubmitPending(true);

    try {
      // Parse location into address components (simple split by comma)
      const locationParts = values.location.split(',').map(part => part.trim());
      const street = locationParts[0] || '';
      const city = locationParts[1] || '';
      const province = locationParts[2] || 'Lusaka'; // Default to Lusaka if not provided

      const propertyData = {
        title: values.title,
        propertyType: values.propertyType as PropertyType,
        description: values.description,
        price: values.rent, // Backend expects 'price' not 'rent'
        address: {
          street: street || values.location,
          city: city || 'Lusaka',
          province: province, // Now always has a value
        },
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        parkingSpaces: values.parkingSpots,
        furnishingStatus: values.furnishingStatus as FurnishingStatus,
        amenities: values.amenities,
        contactPhone: user.phoneNumber || undefined,
        contactEmail: user.email || undefined,
        imageUrls: uploadedImages.map((img) => img.url),
      };

      console.log('Submitting property:', propertyData);

      const response = await createProperty(propertyData);

      console.log('Property created successfully:', response);
      setSubmitSuccess(true);

      // Redirect to properties page after a brief delay
      setTimeout(() => {
        router.push('/landlord/properties');
      }, 1500);
    } catch (error) {
      console.error('Failed to create property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create property. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setSubmitPending(false);
    }
  }

  const handleGenerateSummary = () => {
    const description = form.getValues('description');
    if (!description || description.length < 50) {
      setSummaryError('Please provide a description of at least 50 characters to generate a summary.');
      return;
    }
    setSummaryError(null);

    startTransition(async () => {
      const result = await generateSummary(description);
      if (result.success) {
        form.setValue('summary', result.summary);
      } else {
        setSummaryError(result.error || 'Failed to generate summary');
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              You must be logged in as a landlord to add properties.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Property Details</CardTitle>
        <CardDescription>
          Fill out the form below to list your property. It will be sent for admin approval.
        </CardDescription>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Listing as:</p>
          <p className="font-semibold">{user.fullName || user.username}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent>
        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Property submitted successfully! Redirecting to your properties...
            </AlertDescription>
          </Alert>
        )}
        {submitError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Textarea placeholder="Describe the key features, location, and appeal of your property..." {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>AI-Generated Summary</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateSummary} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Summary
                        </Button>
                    </div>
                  <FormControl>
                    <Textarea placeholder="A concise summary will be generated here..." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>
                    Click the button above to automatically generate a catchy summary for your listing. You can edit it afterward.
                  </FormDescription>
                   {summaryError && <p className="text-sm font-medium text-destructive">{summaryError}</p>}
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

              {/* Upload Button */}
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
                  {uploadedImages.length}/10 images uploaded
                </span>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{uploadError}</AlertDescription>
                </Alert>
              )}

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <StorageImage
                          src={image.url}
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

              {/* Empty State */}
              {uploadedImages.length === 0 && !isUploading && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No images uploaded yet. Click &quot;Upload Images&quot; to add photos.
                  </p>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      render={({ field }) => {
                        return (
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
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => form.reset()} disabled={submitPending || submitSuccess}>Cancel</Button>
                <Button type="submit" disabled={submitPending || submitSuccess}>
                  {submitPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submitted
                    </>
                  ) : (
                    'Submit for Approval'
                  )}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
