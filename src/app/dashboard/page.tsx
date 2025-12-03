'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { properties } from '@/lib/data';

export default function TenantDashboard() {
  const { user } = useAuth();
  // This is mock data. In a real app, you'd fetch this for the logged-in tenant.
  const rentedProperty = properties[0];
  const rentDueDate = new Date();
  rentDueDate.setDate(1);
  rentDueDate.setMonth(rentDueDate.getMonth() + 1);

  const isRentDue = new Date() > new Date(rentDueDate.getFullYear(), rentDueDate.getMonth(), -5);

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Loading user data...</p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">
        Welcome back, {user.name.split(' ')[0]}!
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Property</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{rentedProperty.title}</div>
            <p className="text-xs text-muted-foreground">
              {rentedProperty.location}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Rent Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {rentDueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <p className="text-xs text-muted-foreground">
              ZMW {rentedProperty.rent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Agreement</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <Button variant="outline" size="sm" asChild>
                <Link href="/lease/contract">View Document</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">1 Unread</div>
             <Button variant="outline" size="sm" asChild className="mt-1">
                <Link href="/messaging">Go to Inbox</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className={`shadow-lg ${isRentDue ? 'border-primary' : ''}`}>
        <CardHeader>
          <CardTitle className="font-headline">Rent Payment</CardTitle>
          <CardDescription>
            {isRentDue
              ? "Your rent is due. Please make a payment to avoid late fees."
              : "Your next rent payment is not due yet. We'll notify you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-6 bg-secondary/30 rounded-lg">
                <div>
                    <p className="text-muted-foreground">Amount Due</p>
                    <p className="text-3xl font-bold text-primary">ZMW {rentedProperty.rent.toLocaleString()}</p>
                </div>
                <Button size="lg" disabled={!isRentDue} asChild>
                    <Link href="/lease/checkout">Pay Now</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
