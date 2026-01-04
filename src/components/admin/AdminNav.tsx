'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Button from '../ui/Button';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/lectures', label: 'Lectures' },
  { href: '/admin/lectures/new', label: 'New Lecture' },
  { href: '/admin/books', label: 'Books' },
  { href: '/admin/sheikhs', label: 'Sheikhs' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-bg-paper border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Title */}
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Islamic Lecture Notes
            </h2>
            <span className="metadata-text text-primary">Admin</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* View Site */}
            <Link
              href="/"
              className="px-4 py-2 text-text-secondary hover:bg-bg-accent rounded-lg transition-colors"
              target="_blank"
            >
              View Site →
            </Link>

            {/* Logout */}
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
