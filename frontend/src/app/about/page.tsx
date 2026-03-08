import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-32">
        <h1 className="text-4xl font-bold">About Chesed Train</h1>
        <p className="mt-6 text-lg text-gray-600">
          Chesed Train helps Jewish communities coordinate meals, practical help, donations, and simcha contributions with the clarity and care these moments deserve.
        </p>
        <div className="mt-10 space-y-6 text-gray-700">
          <p>We built the platform to go beyond a generic meal calendar. Organizers can capture kosher expectations, household preferences, reminder settings, and broader acts of support in one place.</p>
          <p>Our goal is simple: reduce coordination friction so communities can spend more energy showing up for each other.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
