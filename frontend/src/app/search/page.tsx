'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select, Card, CardBody, Badge, Spinner } from '@/components/ui';
import { api } from '@/lib/api';
import type { ChesedTrain } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'NEW_BABY', label: 'New Baby' },
  { value: 'ILLNESS', label: 'Illness' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'LOSS', label: 'Loss' },
  { value: 'INJURY', label: 'Injury' },
  { value: 'OTHER', label: 'Other' },
];

const getCategoryLabel = (category: string) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.label || category;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'NEW_BABY':
      return 'bg-pink-100 text-pink-800';
    case 'ILLNESS':
      return 'bg-blue-100 text-blue-800';
    case 'SURGERY':
      return 'bg-purple-100 text-purple-800';
    case 'LOSS':
      return 'bg-gray-100 text-gray-800';
    case 'INJURY':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [trains, setTrains] = useState<ChesedTrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTrains();
  }, [query, category, page]);

  const fetchTrains = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await api.get<{ trains: ChesedTrain[]; pagination: { pages: number } }>(`/trains?${params.toString()}`);
      setTrains(response.data.trains);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTrains();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Chesed Train</h1>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, location, or description..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <FunnelIcon className="w-5 h-5" />
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                <Select
                  options={CATEGORIES}
                  value={category}
                  onChange={(value) => {
                    setCategory(String(value));
                    setPage(1);
                  }}
                />
              </div>

              <Button type="submit">Search</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : trains.length === 0 ? (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No chesed trains found</h2>
            <p className="text-gray-600 mb-6">
              {query || category
                ? 'Try adjusting your search or filters'
                : 'There are no public chesed trains at this time'}
            </p>
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Create a Chesed Train
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Found {trains.length} chesed train{trains.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trains.map((train) => (
                <Link key={train.id} href={`/train/${train.slug}`}>
                  <Card hover className="h-full">
                    <CardBody>
                      {/* Category Badge */}
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-3 ${getCategoryColor(train.category)}`}>
                        {getCategoryLabel(train.category)}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {train.title}
                      </h3>

                      {/* Recipient */}
                      <p className="text-gray-600 text-sm mb-3">
                        For: {train.recipientName}
                      </p>

                      {/* Description */}
                      {train.description && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {train.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-auto">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(train.startDate), 'MMM d')} - {format(new Date(train.endDate), 'MMM d')}
                        </div>
                        {train.recipientCity && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {train.recipientCity}, {train.recipientState}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1 text-sm">
                          <UserGroupIcon className="w-4 h-4 text-primary-500" />
                          <span>{train._count?.contributions || 0} volunteers</span>
                        </div>
                        {train.allowDonations && (
                          <Badge variant="success" className="text-xs">
                            Donations Open
                          </Badge>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
