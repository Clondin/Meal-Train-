import Link from 'next/link';
import {
  HeartIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GiftIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const howItWorksSteps = [
  {
    name: 'Create',
    description:
      'Set up a meal train in minutes. Add recipient details, dietary preferences, and schedule.',
    icon: CalendarDaysIcon,
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    name: 'Share',
    description:
      'Invite friends and family via email or share a link. They can easily sign up for meal slots.',
    icon: UserGroupIcon,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Receive Meals',
    description:
      'Recipients get delicious home-cooked meals delivered with love. Everyone stays coordinated.',
    icon: HeartIcon,
    gradient: 'from-purple-500 to-indigo-500',
  },
];

const useCases = [
  {
    title: 'New Baby',
    description: 'Welcome a new arrival with warm meals for tired parents',
    icon: SparklesIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Illness',
    description: 'Support loved ones during recovery with nourishing food',
    icon: HeartIcon,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    title: 'Surgery',
    description: 'Help someone heal with convenient, healthy meal deliveries',
    icon: ShieldCheckIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Loss',
    description: 'Provide comfort during difficult times with thoughtful meals',
    icon: HeartIcon,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Injury',
    description: 'Make recovery easier with home-delivered, delicious food',
    icon: BoltIcon,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Special Occasions',
    description: 'Celebrate milestones with coordinated meal support',
    icon: GiftIcon,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
];

const stats = [
  { label: 'Meals Delivered', value: '2.5M+' },
  { label: 'Active Meal Trains', value: '50K+' },
  { label: 'Community Members', value: '1M+' },
  { label: 'Countries Served', value: '25+' },
];

const testimonials = [
  {
    content:
      "MealTrain made it so easy to organize meals for my friend after her surgery. Everyone knew exactly what to bring and when. It took all the stress out of coordinating!",
    author: 'Sarah Johnson',
    role: 'Community Organizer',
    rating: 5,
  },
  {
    content:
      'When our twins were born, we were overwhelmed. Our community rallied around us through MealTrain, and we had delicious home-cooked meals for weeks. We felt so loved and supported.',
    author: 'Michael Chen',
    role: 'New Parent',
    rating: 5,
  },
  {
    content:
      "As a recipient, I can't express how grateful I am. During my cancer treatment, MealTrain allowed my friends to show their love in the most practical way. It made a huge difference.",
    author: 'Emily Rodriguez',
    role: 'Cancer Survivor',
    rating: 5,
  },
];

const features = [
  'Easy scheduling and calendar management',
  'Dietary restrictions and preferences',
  'Automatic reminders and notifications',
  'Mobile-friendly interface',
  'Privacy controls and settings',
  'Gift card and donation options',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-rose-50 to-transparent" />
          <div className="absolute top-0 left-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-rose-200 to-orange-200 opacity-20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 ring-1 ring-inset ring-rose-600/10">
              <SparklesIcon className="mr-2 h-4 w-4" />
              Join over 1 million caring community members
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Organize Meal Deliveries{' '}
              <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                with Love
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Bring your community together during life's important moments.
              Create a meal train to coordinate meal deliveries for friends,
              family, and neighbors when they need it most.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/meal-trains/create"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center">
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-rose-500 hover:text-rose-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Free to use
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Setup in 5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-rose-500 to-orange-500 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-rose-50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-rose-500">
              Simple Process
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              How It Works
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get started in three easy steps. No technical skills required.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {howItWorksSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.name}
                    className="relative group"
                  >
                    <div className="relative h-full p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-rose-200">
                      {/* Step number */}
                      <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white text-xl font-bold shadow-lg">
                        {index + 1}
                      </div>

                      {/* Icon */}
                      <div className="mb-6 mt-4">
                        <div
                          className={`inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {step.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Connector line (hidden on last item) */}
                    {index < howItWorksSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-rose-300 to-orange-300" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-rose-500">
              For Every Occasion
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              When to Start a Meal Train
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Life brings many moments when a home-cooked meal makes all the
              difference. Here are some common situations.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={useCase.title}
                  className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-rose-200"
                >
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${useCase.bgColor} mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-7 w-7 ${useCase.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="text-base font-semibold leading-7 text-rose-500">
                Powerful Features
              </h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                Everything you need to coordinate with care
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Our platform makes it simple to organize meal deliveries,
                communicate with participants, and ensure everyone has what they
                need.
              </p>
              <div className="mt-10 space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-orange-100 rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <HeartIcon className="h-32 w-32 text-white opacity-80" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  <div className="h-4 bg-gray-200 rounded-full w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-rose-500">
              Testimonials
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Loved by communities everywhere
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-8 border border-gray-100"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </blockquote>
                <div className="border-t border-gray-100 pt-6">
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-rose-500 to-orange-500 py-24 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600 to-orange-600 opacity-50" />
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white opacity-10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white opacity-10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to start your meal train?
          </h2>
          <p className="mt-6 text-lg leading-8 text-rose-50">
            Join thousands of caring communities who use MealTrain to show love
            and support when it matters most. Create your first meal train in
            minutes—completely free.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/meal-trains/create"
              className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-rose-600 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <span className="flex items-center">
                Create Meal Train
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/meal-trains/find"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border-2 border-white rounded-xl hover:bg-white hover:text-rose-600 transition-all duration-200"
            >
              Find a Meal Train
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
