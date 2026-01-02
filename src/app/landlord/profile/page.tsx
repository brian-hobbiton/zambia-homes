'use client';

import { UserProfileForm } from '@/components/user/profile-form';
import { KYCDocumentUpload } from '@/components/user/kyc-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function LandlordProfilePage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <UserProfileForm />
        </TabsContent>

        <TabsContent value="kyc" className="mt-6">
          <KYCDocumentUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}

