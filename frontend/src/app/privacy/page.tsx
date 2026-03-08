import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-32">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <div className="mt-8 space-y-6 text-gray-700">
          <p>We collect the information needed to run Chesed Train, including account details, train setup information, participant submissions, and payment-related metadata for donations and gift cards.</p>
          <p>We use that information to operate the service, communicate about contributions, send reminders, and help organizers coordinate support.</p>
          <p>We do not sell personal information. Access to private train data is limited to authorized users, organizers, and system administrators as needed to operate the platform.</p>
          <p>For privacy questions, contact <a className="text-primary-600 hover:text-primary-700" href="mailto:privacy@chesedtrain.com">privacy@chesedtrain.com</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
