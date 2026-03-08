import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SentryUserContext } from '@/components/SentryUserContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Chesed Train - Organize Kosher Meal Deliveries with Love',
    template: '%s | Chesed Train by Kosher.com',
  },
  description:
    'Organize and coordinate kosher meal deliveries for friends, family, and community members. A Chesed project by Kosher.com offering support during times of need.',
  keywords: [
    'chesed train',
    'meal train',
    'kosher meals',
    'community support',
    'food coordination',
    'meal schedule',
    'help neighbors',
    'kosher.com',
  ],
  authors: [{ name: 'Chesed Train by Kosher.com' }],
  creator: 'Kosher.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chesedtrain.com',
    title: 'Chesed Train - Organize Kosher Meal Deliveries with Love',
    description:
      'Organize and coordinate kosher meal deliveries for friends, family, and community members. A Chesed project by Kosher.com offering support during times of need.',
    siteName: 'Chesed Train',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chesed Train - Organize Kosher Meal Deliveries with Love',
    description:
      'Organize and coordinate kosher meal deliveries for friends, family, and community members. A Chesed project by Kosher.com offering support during times of need.',
    creator: '@chesedtrain',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Providers>
          <SentryUserContext />
          {children}
        </Providers>
      </body>
    </html>
  );
}
