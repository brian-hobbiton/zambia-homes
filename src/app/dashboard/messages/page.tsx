'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Home } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Chat with landlords about properties
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Conversations</CardTitle>
          <CardDescription>
            All your messages with landlords in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              No messages yet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Start a conversation by contacting a landlord about a property
            </p>
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Browse Properties
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

