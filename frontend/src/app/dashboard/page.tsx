'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody, Button, Badge, Spinner } from '@/components/ui';
import { ChesedTrain, DashboardStats, TASK_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [myTrains, setMyTrains] = useState<ChesedTrain[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrains: 0,
    activeTrains: 0,
    totalContributions: 0,
    totalDonationsAmount: 0,
    upcomingDeliveries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trains, dashboardStats] = await Promise.all([
        api.getMyChesedTrains({ limit: 3 }),
        api.getDashboardStats(),
      ]);

      setMyTrains(trains);
      setStats(dashboardStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || user?.email || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your chesed trains
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Trains
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.totalTrains}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Trains
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.activeTrains}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Upcoming Deliveries
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.upcomingDeliveries.length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Donations
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalDonationsAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Link href="/create">
                <Button variant="primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Train
                </Button>
              </Link>
              <Link href="/dashboard/trains">
                <Button variant="outline">View All Trains</Button>
              </Link>
              <Link href="/dashboard/participations">
                <Button variant="outline">My Participations</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* My Organized Chesed Trains */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                My Organized Chesed Trains
              </h2>
              <Link href="/dashboard/trains">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {myTrains.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You haven't organized any chesed trains yet
                </p>
                <Link href="/create">
                  <Button size="sm">Create Your First Train</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myTrains.slice(0, 3).map((train) => {
                  const isActive = new Date(train.endDate) >= new Date();
                  return (
                    <Link
                      key={train.id}
                      href={`/dashboard/trains/${train.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {train.recipientName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(train.startDate)} - {formatDate(train.endDate)}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {train.description}
                          </p>
                        </div>
                        <Badge variant={isActive ? 'success' : 'neutral'} size="sm">
                          {isActive ? 'Active' : 'Completed'}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Upcoming Deliveries
              </h2>
              <Link href="/dashboard/participations">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {stats.upcomingDeliveries.length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">No upcoming deliveries</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingDeliveries.map((slot) => (
                  <Link
                    key={slot.id}
                    href={`/dashboard/trains/${slot.trainId}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {slot.train?.recipientName || slot.train?.title || 'Upcoming delivery'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(slot.date)} · {TASK_TYPE_LABELS[slot.taskType]}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          {(slot.contributions || [])
                            .map((contribution) =>
                              contribution.user
                                ? `${contribution.user.firstName || ''} ${contribution.user.lastName || ''}`.trim() || contribution.user.email
                                : contribution.guestName || 'Guest volunteer'
                            )
                            .join(', ')}
                        </p>
                      </div>
                      <Badge variant="info" size="sm">
                        {slot.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
