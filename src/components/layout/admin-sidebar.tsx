'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Gavel,
  BadgeCent,
  Mail,
  FileText,
  CheckCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/applications', icon: FileText, label: 'Applications' },
  { href: '/admin/leases', icon: CheckCircle, label: 'Leases' },
  { href: '/admin/listings', icon: Building2, label: 'Listings' },
  { href: '/admin/inquiries', icon: Mail, label: 'Inquiries' },
  { href: '/admin/payments', icon: BadgeCent, label: 'Payments' },
  { href: '/admin/verifications', icon: ShieldCheck, label: 'Verifications' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/disputes', icon: Gavel, label: 'Disputes' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
];

export default function AdminSidebar() {
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
              pathname === item.href && 'bg-accent text-primary font-semibold'
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
