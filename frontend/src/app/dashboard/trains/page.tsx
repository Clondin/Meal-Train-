'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, Button, Badge, Input, Select, Spinner } from '@/components/ui';
import { MealTrain } from '@/types';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | 'active' | 'completed';

export default function TrainsPage() {
  const [trains, setTrains] = useState<MealTrain[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<MealTrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    loadTrains();
  }, []);

  useEffect(() => {
    filterTrains();
  }, [trains, searchQuery, statusFilter]);

  const loadTrains = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyMealTrains();
      setTrains(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meal trains');
    } finally {
      setLoading(false);
    }
  };

  const filterTrains = () => {
    let filtered = [...trains];

    // Filter by status
    if (statusFilter !== 'all') {
      const now = new Date();
      if (statusFilter === 'active') {
        filtered = filtered.filter((train) => new Date(train.endDate) >= now);
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter((train) => new Date(train.endDate) < now);
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (train) =>
          train.recipientName.toLowerCase().includes(query) ||
          train.description.toLowerCase().includes(query) ||
          train.recipientAddress.toLowerCase().includes(query)
      );
    }

    setFilteredTrains(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTrainStatus = (train: MealTrain): { label: string; variant: 'success' | 'neutral' } => {
    const now = new Date();
    const endDate = new Date(train.endDate);

    if (endDate >= now) {
      return { label: 'Active', variant: 'success' };
    }
    return { label: 'Completed', variant: 'neutral' };
  };

  const getTrainStats = (train: MealTrain) => {
    const totalDates = train.mealDates?.length || 0;
    const claimedDates = train.mealDates?.filter((d) => d.status === 'claimed' || d.status === 'delivered').length || 0;
    const participants = train.participants?.length || 0;
    const donations = train.donations?.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0) || 0;

    return { totalDates, claimedDates, participants, donations };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Meal Trains</h1>
            <p className="mt-2 text-gray-600">
              Manage all your organized meal trains
            </p>
          </div>
          <Link href="/trains/create">
            <Button variant="primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Train
            </Button>
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by recipient name, description, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Trains List */}
      {filteredTrains.length === 0 ? (
        <Card>
          <div className="text-center py-12">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No trains found' : 'No meal trains yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first meal train'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/trains/create">
                <Button>Create Your First Train</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrains.map((train) => {
            const status = getTrainStatus(train);
            const stats = getTrainStats(train);

            return (
              <Card key={train.id} hover padding="none">
                <Link href={`/dashboard/trains/${train.id}`} className="block">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {train.recipientName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(train.startDate)} - {formatDate(train.endDate)}
                        </p>
                      </div>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {train.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Meal Dates</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {stats.claimedDates}/{stats.totalDates}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Participants</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {stats.participants}
                        </p>
                      </div>
                    </div>

                    {stats.donations > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Total Donations</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(stats.donations)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
                      View Details
                    </span>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {filteredTrains.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredTrains.length} of {trains.length} meal train{trains.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
