'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Home } from 'lucide-react';
import Link from 'next/link';

export default function SavedPropertiesPage() {
  const [savedProperties] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Saved Properties</h1>
        <p className="text-muted-foreground">
          Properties you've saved for later viewing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Favorites</CardTitle>
          <CardDescription>
            Keep track of properties you're interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedProperties.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                No saved properties yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Browse properties and click the heart icon to save them here
              </p>
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Browse Properties
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Saved properties will be displayed here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

