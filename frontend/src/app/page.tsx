import Link from 'next/link';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GiftIcon,
  ShieldCheckIcon,
  HeartIcon as HeartOutline,
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop"
            alt="Family sharing a meal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="animate-fade-in space-y-8">
            <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 text-sm font-medium text-white shadow-lg ring-1 ring-inset ring-white/10 mb-8">
              <SparklesIcon className="mr-2 h-4 w-4 text-amber-300" />
              <span className="tracking-wide">Trusted by 1M+ families worldwide</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white mb-6 drop-shadow-lg">
              Support Through <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-100 italic pr-2">
                Every Season
              </span>
            </h1>

            <p className="mt-6 text-xl leading-8 text-gray-100 max-w-2xl mx-auto font-light tracking-wide shadow-black drop-shadow-md">
              Organize meal deliveries with love. Whether it's a new baby, an illness, or a loss, bring your community together when it matters most.
            </p>

            <div className="mt-10 flex items-center justify-center gap-6 flex-col sm:flex-row">
              <Link
                href="/create"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] hover:-translate-y-1"
              >
                Start a Meal Train
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                Find a Meal Train
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 rounded-full bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        </div>
      </section>

      {/* Stats Section - Floating Glass */}
      <div className="relative z-20 -mt-24 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
          {[
            { label: 'Meals Delivered', value: '2.5M+' },
            { label: 'Families Supported', value: '50K+' },
            { label: 'Community Members', value: '1M+' },
            { label: 'Countries Served', value: '25+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="text-4xl lg:text-5xl font-serif font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-sm uppercase tracking-widest text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-semibold tracking-widest text-primary uppercase mb-3">Simple Process</h2>
            <p className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              How It Works
            </p>
            <p className="mt-6 text-lg text-muted-foreground">
              Coordinating support shouldn't be complicated. We've made it effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Create',
                desc: 'Set up a page in minutes. Add preferences, allergies, and delivery times.',
                icon: CalendarDaysIcon,
              },
              {
                title: 'Invite',
                desc: 'Share the link with friends, family, and neighbors via text or social media.',
                icon: UserGroupIcon,
              },
              {
                title: 'Support',
                desc: 'Community members sign up for slots and deliver meals with love.',
                icon: HeartSolid,
              },
            ].map((step, idx) => (
              <div key={step.title} className="relative group">
                <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary mb-6 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {idx !== 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-[2px] bg-border transform -translate-y-1/2 z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase - Split View */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] transform rotate-6 scale-95 opacity-70" />
              <img
                src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop"
                alt="Delicious home cooked meal"
                className="relative rounded-[2.5rem] shadow-2xl w-full object-cover h-[600px] transform hover:-rotate-2 transition-transform duration-500 hover:shadow-primary/20"
              />

              <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs animate-slide-in-bottom">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">+12 friends</span>
                </div>
                <p className="text-sm font-medium text-gray-900">"Sarah signed up for Lasagna on Tuesday!"</p>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                More Than Just <br /> <span className="text-primary">A Calendar</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We've thought of everything so you don't have to. From dietary restrictions to donation funds, we provide the tools to organize comprehensive support.
              </p>

              <ul className="space-y-6">
                {[
                  'interactive drag-and-drop calendar',
                  'Dietary preferences & allergy alerts',
                  'Donation funds & gift cards',
                  'Updates & photo journal',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-foreground/80 text-lg">
                    <CheckCircleIcon className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="capitalize">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-8">
                <Link href="/create" className="text-primary font-medium hover:text-primary/80 inline-flex items-center text-lg group">
                  Explore all features
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Editorial Style */}
      <section className="py-32 bg-primary text-primary-foreground relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <HeartSolid className="w-16 h-16 text-white/90 mx-auto mb-12 animate-pulse" />

          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-16 max-w-4xl mx-auto leading-normal">
            "It was incredible to see our community rally around us. The food was delicious, but the feeling of being cared for was the real gift."
          </h2>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-serif pr-0.5">M</div>
            <div className="text-left">
              <div className="font-bold text-lg">Michael & Sarah</div>
              <div className="text-primary-foreground/80 text-sm">New Parents</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8">
            Ready to spread the love?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Create a Meal Train today. It's free, easy, and makes a world of difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/create"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Start a Meal Train
            </Link>
            <Link
              href="/search"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-full transition-all"
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
