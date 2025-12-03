'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import React from 'react';
import { Building } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = React.useState<'TENANT' | 'LANDLORD' | 'ADMIN'>('TENANT');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    if (role === 'ADMIN') {
        router.push('/admin');
    } else if (role === 'LANDLORD') {
        router.push('/landlord');
    } else {
        router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-sm w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
              <Building className="h-8 w-8 text-primary" />
              <span className="font-bold font-headline text-2xl ml-2">Zambia Homes</span>
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Select your role and enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="test@example.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <div className="grid gap-2">
              <Label>Login as</Label>
              <RadioGroup defaultValue="TENANT" onValueChange={(value) => setRole(value as any)} className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="TENANT" id="tenant" className="peer sr-only" />
                  <Label htmlFor="tenant" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Tenant
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="LANDLORD" id="landlord" className="peer sr-only" />
                  <Label htmlFor="landlord" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Landlord
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="ADMIN" id="admin" className="peer sr-only" />
                  <Label htmlFor="admin" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Admin
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
