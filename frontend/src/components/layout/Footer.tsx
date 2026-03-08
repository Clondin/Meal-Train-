import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa';

const navigation = {
  product: [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Create Chesed Train', href: '/create' },
    { name: 'Find Chesed Train', href: '/search' },
  ],
  support: [
    { name: 'Help', href: 'mailto:support@chesedtrain.com' },
    { name: 'Contact', href: 'mailto:hello@chesedtrain.com' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/chesedtrain',
    icon: FaFacebookF,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/chesedtrain',
    icon: FaTwitter,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/chesedtrain',
    icon: FaInstagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/chesedtrain',
    icon: FaLinkedinIn,
  },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-background" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative p-1">
                <HeartIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              </div>
              <span className="text-2xl font-serif font-bold text-background tracking-tight">
                Chesed Train
              </span>
            </Link>
            <p className="text-sm leading-6 text-background/70">
              Bringing communities together through the simple act of sharing
              kosher meals. Organize support for friends, family, and neighbors
              during times of need. A service by Kosher.com.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-background/70 hover:text-primary transition-colors hover:-translate-y-1 transform duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white font-serif tracking-wide">
                  Product
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      {item.href.startsWith('mailto:') ? (
                        <a href={item.href} className="text-sm leading-6 text-background/70 hover:text-primary transition-colors">
                          {item.name}
                        </a>
                      ) : (
                        <Link href={item.href} className="text-sm leading-6 text-background/70 hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white font-serif tracking-wide">
                  Support
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      {item.href.startsWith('mailto:') ? (
                        <a href={item.href} className="text-sm leading-6 text-background/70 hover:text-primary transition-colors">
                          {item.name}
                        </a>
                      ) : (
                        <Link href={item.href} className="text-sm leading-6 text-background/70 hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white font-serif tracking-wide">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-background/70 hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white font-serif tracking-wide">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-background/70 hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-background/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-background/50 text-center">
            &copy; {new Date().getFullYear()} Chesed Train. All rights reserved.
            Made with <HeartIcon className="inline h-4 w-4 text-primary" /> for
            communities everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
