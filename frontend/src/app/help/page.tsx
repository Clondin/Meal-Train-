import Link from 'next/link';

const faqs = [
  {
    question: 'What information should I prepare before creating a train?',
    answer:
      'Have the recipient details, date range, delivery notes, dietary preferences, and privacy settings ready before you start the wizard.',
  },
  {
    question: 'Should I make a train public or private?',
    answer:
      'Use private trains for links shared with a known group. Use public trains only when you want the train discoverable in search.',
  },
  {
    question: 'How do guest volunteers sign up?',
    answer:
      'Guests verify their email address or phone number first, then use that verified session to claim a contribution slot.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
            Help
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900">
            Guide to creating a chesed train
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-600">
            Use this page as a quick checklist before you publish a train. The goal is to make
            sign-up easy for volunteers while keeping recipient information appropriately private.
          </p>

          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <section key={faq.question} className="rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900">{faq.question}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Create a train
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
