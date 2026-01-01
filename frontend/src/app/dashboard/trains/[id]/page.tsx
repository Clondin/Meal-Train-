'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { ChesedTrain, MealDate, Participant, Donation } from '@/types';
import { cn } from '@/lib/utils';
import DateManager from './components/DateManager';
import ParticipantManager from './components/ParticipantManager';
import DonationReport from './components/DonationReport';
import TrainSettings from './components/TrainSettings';

type TabType = 'overview' | 'dates' | 'participants' | 'donations' | 'settings';

export default function TrainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trainId = params.id as string;

  const [train, setTrain] = useState<ChesedTrain | null>(null);
  const [dates, setDates] = useState<MealDate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    loadTrainData();
  }, [trainId]);

  const loadTrainData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trainData, datesData, participantsData, donationsData] = await Promise.all([
        api.getChesedTrain(trainId),
        api.getMealDates(trainId),
        api.getParticipants(trainId),
        api.getDonations(trainId),
      ]);

      setTrain(trainData);
      setDates(datesData);
      setParticipants(participantsData);
      setDonations(donationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load chesed train data');
      if (err.statusCode === 404) {
        router.push('/dashboard/trains');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getTrainStatus = () => {
    if (!train) return { label: 'Unknown', variant: 'neutral' as const };
    const now = new Date();
    const endDate = new Date(train.endDate);

    if (endDate >= now) {
      return { label: 'Active', variant: 'success' as const };
    }
    return { label: 'Completed', variant: 'neutral' as const };
  };

  const getStats = () => {
    const totalDates = dates.length;
    const claimedDates = dates.filter((d) => d.status === 'claimed' || d.status === 'delivered').length;
    const deliveredDates = dates.filter((d) => d.status === 'delivered').length;
    const totalParticipants = participants.length;
    const totalDonations = donations
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      totalDates,
      claimedDates,
      deliveredDates,
      availableDates: totalDates - claimedDates,
      totalParticipants,
      totalDonations,
      donationCount: donations.filter((d) => d.status === 'completed').length,
    };
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'dates' as TabType, label: 'Dates', icon: '📅' },
    { id: 'participants' as TabType, label: 'Participants', icon: '👥' },
    { id: 'donations' as TabType, label: 'Donations', icon: '💰' },
    { id: 'settings' as TabType, label: 'Settings', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chesed Train</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link href="/dashboard/trains">
              <Button>Back to Trains</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const status = getTrainStatus();
  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/trains" className="hover:text-gray-700">Trains</Link>
          <span>/</span>
          <span className="text-gray-900">{train.recipientName}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{train.recipientName}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-gray-600 mb-2">{train.description}</p>
            <p className="text-sm text-gray-500">
              {formatDate(train.startDate)} - {formatDate(train.endDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/trains/${trainId}`}>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Public Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Dates</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDates}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Claimed</p>
            <p className="text-2xl font-bold text-green-600">{stats.claimedDates}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Participants</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalParticipants}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Donations</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalDonations)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Train Information */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Train Information</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Recipient</dt>
                    <dd className="text-sm text-gray-900 mt-1">{train.recipientName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900 mt-1">{train.recipientAddress}</dd>
                  </div>
                  {train.recipientPhone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.recipientPhone}</dd>
                    </div>
                  )}
                  {train.recipientEmail && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.recipientEmail}</dd>
                    </div>
                  )}
                  {train.householdSize && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Household Size</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.householdSize} people</dd>
                    </div>
                  )}
                  {train.defaultDeliveryTime && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Preferred Meal Time</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.defaultDeliveryTime}</dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Dietary Information */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dietary Information</h2>
                <dl className="space-y-3">
                  {train.dietaryPreferences && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dietary Preferences</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.dietaryPreferences}</dd>
                    </div>
                  )}
                  {train.allergies && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.allergies}</dd>
                    </div>
                  )}
                  {train.deliveryInstructions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Delivery Instructions</dt>
                      <dd className="text-sm text-gray-900 mt-1">{train.deliveryInstructions}</dd>
                    </div>
                  )}
                  {!train.dietaryPreferences && !train.allergies && !train.deliveryInstructions && (
                    <p className="text-sm text-gray-500">No dietary information provided</p>
                  )}
                </dl>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {dates.filter(d => d.status === 'claimed').slice(0, 5).map((date) => (
                  <div key={date.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {date.participant?.name || 'Unknown'} claimed {date.mealType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(date.date)}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">Claimed</Badge>
                  </div>
                ))}
                {dates.filter(d => d.status === 'claimed').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'dates' && (
          <DateManager
            trainId={trainId}
            dates={dates}
            onUpdate={loadTrainData}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantManager
            trainId={trainId}
            participants={participants}
            dates={dates}
            onUpdate={loadTrainData}
          />
        )}

        {activeTab === 'donations' && (
          <DonationReport
            trainId={trainId}
            donations={donations}
            onUpdate={loadTrainData}
          />
        )}

        {activeTab === 'settings' && (
          <TrainSettings
            train={train}
            onUpdate={loadTrainData}
          />
        )}
      </div>
    </div>
  );
}
