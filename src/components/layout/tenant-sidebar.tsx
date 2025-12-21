'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  FileText,
  User,
  Heart,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {usePathname} from "next/navigation";

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/saved', icon: Heart, label: 'Saved Properties' },
  { href: '/dashboard/inquiries', icon: Mail, label: 'My Inquiries' },
  { href: '/dashboard/applications', icon: FileText, label: 'Applications' },
  { href: '/dashboard/leases', icon: FileText, label: 'My Leases' },
  { href: '/dashboard/payments', icon: DollarSign, label: 'Payments' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function TenantSidebar() {
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
              (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && 'bg-accent text-primary font-semibold'
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

