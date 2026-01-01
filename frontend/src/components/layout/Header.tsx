'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <HeartIcon className="h-8 w-8 text-rose-500 group-hover:text-rose-600 transition-colors" />
                <div className="absolute inset-0 bg-rose-500 blur-lg opacity-30 group-hover:opacity-40 transition-opacity" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                MealTrain
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#use-cases"
              className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
            >
              Use Cases
            </Link>
            <Link
              href="/signin"
              className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link
              href="/meal-trains/find"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Find Meal Train
            </Link>
            <Link
              href="/meal-trains/create"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg hover:from-rose-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              Create Meal Train
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-rose-500 transition-colors"
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
          <div className="lg:hidden">
            <div className="space-y-1 pb-4 pt-2">
              <Link
                href="#how-it-works"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-rose-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#use-cases"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-rose-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Use Cases
              </Link>
              <Link
                href="/signin"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-rose-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <div className="pt-4 space-y-2">
                <Link
                  href="/meal-trains/find"
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Meal Train
                </Link>
                <Link
                  href="/meal-trains/create"
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg hover:from-rose-600 hover:to-orange-600 transition-all shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Meal Train
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
