import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, MoreHorizontal, BedDouble, Bath } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { properties } from '@/lib/data';
import { placeHolderImages } from '@/lib/placeholder-images';
import { LandlordWelcome } from '@/components/landlord/landlord-welcome';

export default function LandlordPropertiesPage() {
  const landlordProperties = properties; // In a real app, this would be filtered by landlord ID

  return (
    <div>
      <LandlordWelcome />
      <div className="flex items-center justify-end mb-4">
        <Button asChild>
          <Link href="/landlord/properties/add">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Properties</CardTitle>
          <CardDescription>
            Manage your property listings and view their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                const image = placeHolderImages.find((img) => img.id === prop.imageId);
                return (
                  <TableRow key={prop.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={prop.title}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={image?.imageUrl || `https://picsum.photos/seed/${prop.id}/64/64`}
                        width="64"
                        data-ai-hint={image?.imageHint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{prop.title}</TableCell>
                    <TableCell>
                      <Badge variant={prop.status === 'APPROVED' ? 'default' : prop.status === 'PENDING' ? 'secondary' : 'destructive'}>
                        {prop.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ZMW {prop.rent.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><BedDouble className="h-4 w-4"/> {prop.bedrooms}</div>
                            <div className="flex items-center gap-1"><Bath className="h-4 w-4"/> {prop.bathrooms}</div>
                        </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Applications</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{landlordProperties.length}</strong> of <strong>{landlordProperties.length}</strong> properties
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
