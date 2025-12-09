'use client';

import { UserProfileForm } from '@/components/user/profile-form';
import { KYCDocumentUpload } from '@/components/user/kyc-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Profile</h1>

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

