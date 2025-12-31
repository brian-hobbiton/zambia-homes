'use client';

import Link from 'next/link';
import { Building, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import SiteHeader from '@/components/layout/site-header';
import LandlordSidebar from '@/components/layout/landlord-sidebar';
import { usePathname } from 'next/navigation';

const getHeadline = (pathname: string) => {
    if (pathname.includes('/properties/add')) return 'Add New Property';
    if (pathname.match(/\/properties\/[^/]+\/edit/)) return 'Edit Property';
    if (pathname.match(/\/properties\/[^/]+\/applications/)) return 'Property Applications';
    if (pathname.match(/\/properties\/[^/]+$/)) return 'Property Details';
    if (pathname.includes('/properties')) return 'My Properties';
    if (pathname.includes('/applications/')) return 'Application Review';
    if (pathname.includes('/applications')) return 'Applications';
    if (pathname.includes('/leases/')) return 'Lease Details';
    if (pathname.includes('/leases')) return 'Leases';
    if (pathname.includes('/inquiries')) return 'Inquiries';
    if (pathname.includes('/messages')) return 'Messages';
    if (pathname.includes('/payouts')) return 'Payouts';
    if (pathname.includes('/profile')) return 'Profile & KYC';
    return 'Landlord Dashboard';
}

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Building className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">Zambia Homes</span>
            </Link>
          </div>
          <div className="flex-1 p-4">
            <LandlordSidebar />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <div className="p-4">
                    <LandlordSidebar />
                </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="font-semibold text-xl font-headline">{getHeadline(pathname)}</h1>
          </div>
          <div className="ml-auto">
            <SiteHeader />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
