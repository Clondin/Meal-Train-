import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-32">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <div className="mt-8 space-y-6 text-gray-700">
          <p>By using Chesed Train, you agree to use the platform lawfully, provide accurate information, and respect the privacy and dignity of recipients, organizers, and contributors.</p>
          <p>You are responsible for the content you post, the commitments you make, and compliance with any applicable local laws or community norms.</p>
          <p>Payments are processed by third-party providers. Chesed Train may update or suspend features as the service evolves.</p>
          <p>Questions about these terms can be sent to <a className="text-blue-600 hover:text-blue-700" href="mailto:hello@chesedtrain.com">hello@chesedtrain.com</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
