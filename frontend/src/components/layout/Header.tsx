'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User';

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 transition-all duration-300">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative p-1">
                <HeartIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-foreground tracking-tight group-hover:text-primary transition-colors leading-none">
                  Chesed Train
                </span>
                <span className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-widest pl-0.5">
                  by Kosher.com
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {['How It Works'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {item}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link
              href="/search"
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
            >
              Find a Chesed Train
            </Link>
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-full border border-border/60 bg-white/70 px-3 py-2 text-sm font-medium text-foreground shadow-sm"
                >
                  <Avatar name={displayName} src={user?.avatar} size="sm" />
                  <span className="max-w-32 truncate">{displayName}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/create"
                className="px-6 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">
                {mobileMenuOpen ? 'Close menu' : 'Open menu'}
              </span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl p-4 animate-slide-in-top">
            <div className="space-y-4">
              <Link
                href="#how-it-works"
                className="block text-base font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="block text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              <div className="pt-4 grid gap-3">
                <Link
                  href="/search"
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-foreground bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find a Chesed Train
                </Link>
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href="/create"
                    className="block w-full text-center px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-lg shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
