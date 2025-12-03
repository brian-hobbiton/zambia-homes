'use client';

import SiteHeader from '@/components/layout/site-header';

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
          {children}
      </main>
      <footer className="bg-secondary">
          <div className="container mx-auto px-4 py-6 text-center text-secondary-foreground">
              <p>&copy; {new Date().getFullYear()} Zambia Homes. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
