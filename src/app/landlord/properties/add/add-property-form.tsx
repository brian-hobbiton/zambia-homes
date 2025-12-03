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
import { generateSummary } from './actions';
import { useState, useTransition } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

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
  description: z.string().min(50, 'Description must be at least 50 characters.'),
  summary: z.string().optional(),
  rent: z.coerce.number().positive('Rent must be a positive number.'),
  deposit: z.coerce.number().positive('Deposit must be a positive number.'),
  location: z.string().min(3, 'Location is required.'),
  bedrooms: z.coerce.number().int().min(1, 'Must have at least 1 bedroom.'),
  bathrooms: z.coerce.number().int().min(1, 'Must have at least 1 bathroom.'),
  parkingSpots: z.coerce.number().int().min(0, 'Parking spots cannot be negative.'),
  amenities: z.array(z.string()).optional(),
});

export default function AddPropertyForm() {
  const [isPending, startTransition] = useTransition();
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      summary: '',
      rent: 0,
      deposit: 0,
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      amenities: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here you would typically send the data to your backend
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
        setSummaryError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Property Details</CardTitle>
        <CardDescription>Fill out the form below to list your property. It will be sent for admin approval.</CardDescription>
      </CardHeader>
      <CardContent>
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
                <Button variant="outline" type="button" onClick={() => form.reset()}>Cancel</Button>
                <Button type="submit">Submit for Approval</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
