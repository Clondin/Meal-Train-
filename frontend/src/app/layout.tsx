import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'MealTrain - Organize Meal Deliveries with Love',
    template: '%s | MealTrain',
  },
  description:
    'Organize and coordinate meal deliveries for friends, family, and community members during times of need. Create meal trains, manage schedules, and show support.',
  keywords: [
    'meal train',
    'meal delivery',
    'community support',
    'food coordination',
    'meal schedule',
    'help neighbors',
  ],
  authors: [{ name: 'MealTrain' }],
  creator: 'MealTrain',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mealtrain.com',
    title: 'MealTrain - Organize Meal Deliveries with Love',
    description:
      'Organize and coordinate meal deliveries for friends, family, and community members during times of need.',
    siteName: 'MealTrain',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MealTrain - Organize Meal Deliveries with Love',
    description:
      'Organize and coordinate meal deliveries for friends, family, and community members during times of need.',
    creator: '@mealtrain',
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
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
          suppressHydrationWarning
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }
