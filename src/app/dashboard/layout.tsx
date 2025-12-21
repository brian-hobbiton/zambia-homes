'use client';

import { SidebarProvider, Sidebar, SidebarContent } from '@/components/ui/sidebar';
import TenantSidebar from '@/components/layout/tenant-sidebar';
import SiteHeader from '@/components/layout/site-header';

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <SidebarProvider>
        <div className="flex flex-1  overflow-hidden">
          <Sidebar>
            <SidebarContent>
              <div className="p-4 mt-14">
                <h2 className="text-lg font-semibold font-headline mb-4">
                  Tenant Dashboard
                </h2>
                <TenantSidebar />
              </div>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

