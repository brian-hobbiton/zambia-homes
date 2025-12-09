'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';

export function LandlordWelcome() {
  const { user, role } = useAuth();

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <Badge variant="default" className="capitalize">
                {role}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold font-headline">
              Welcome, {user?.firstName || user?.username || 'Landlord'}!
            </h2>
            <p className="text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Manage your properties and connect with potential tenants
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

