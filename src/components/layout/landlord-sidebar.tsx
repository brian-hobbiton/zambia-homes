'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  BadgeCent,
  User,
  Mail,
  FileText,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/landlord', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/landlord/properties', icon: Building2, label: 'Properties' },
  { href: '/landlord/applications', icon: FileText, label: 'Applications' },
  { href: '/landlord/leases', icon: FileCheck, label: 'Leases' },
  { href: '/landlord/inquiries', icon: Mail, label: 'Inquiries' },
  { href: '/landlord/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/landlord/payouts', icon: BadgeCent, label: 'Payouts' },
  { href: '/landlord/profile', icon: User, label: 'Profile & KYC' },
];

export default function LandlordSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent',
              (pathname === item.href || (item.href !== '/landlord' && pathname.startsWith(item.href))) && 'bg-accent text-primary font-semibold'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
