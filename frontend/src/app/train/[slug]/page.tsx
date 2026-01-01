import { notFound } from 'next/navigation';
import { ChesedTrain } from '@/types';
import TrainHero from './components/TrainHero';
import TaskSlotCalendar from './components/TaskSlotCalendar';
import ParticipantList from './components/ParticipantList';
import DonationSection from './components/DonationSection';
import GiftCardSection from './components/GiftCardSection';
import ShareButtons from './components/ShareButtons';

interface PageProps {
  params: {
    slug: string;
  };
}

// Fetch chesed train data on the server
async function getChesedTrain(slug: string): Promise<ChesedTrain | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${apiUrl}/chesed-trains/${slug}`, {
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching chesed train:', error);
    return null;
  }
}

export default async function TrainPage({ params }: PageProps) {
  const train = await getChesedTrain(params.slug);

  if (!train) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <TrainHero train={train} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Share Buttons */}
        <div className="mb-6">
          <ShareButtons train={train} />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <TabNavigation trainId={train.id} />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Calendar Tab (Default) */}
          <section id="calendar">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Chesed Schedule
              </h2>
              <TaskSlotCalendar train={train} />
            </div>
          </section>

          {/* Participants Tab */}
          <section id="participants">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Participants
              </h2>
              <ParticipantList train={train} />
            </div>
          </section>

          {/* Donations Tab */}
          <section id="donations">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Donations
              </h2>
              <DonationSection train={train} />
            </div>
          </section>

          {/* Gift Cards Tab */}
          <section id="gift-cards">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Gift Cards
              </h2>
              <GiftCardSection train={train} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Client component for tab navigation
function TabNavigation({ trainId }: { trainId: string }) {
  'use client';

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'participants', label: 'Participants', icon: '👥' },
    { id: 'donations', label: 'Donations', icon: '💰' },
    { id: 'gift-cards', label: 'Gift Cards', icon: '🎁' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="flex border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => scrollToSection(tab.id)}
          className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent transition-colors whitespace-nowrap"
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const train = await getChesedTrain(params.slug);

  if (!train) {
    return {
      title: 'Chesed Train Not Found',
    };
  }

  return {
    title: `${train.recipientName}'s Chesed Train`,
    description: train.description,
  };
}
