'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export function AdminWelcome() {
  const { user, role } = useAuth();

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <Badge variant="default" className="capitalize">
                {role}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold font-headline">
              Welcome back, {user?.firstName || user?.username || 'Admin'}!
            </h2>
            <p className="text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Here's an overview of your platform activity
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

