'use client';

import { ChesedTrain } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { format, isBefore, startOfToday } from 'date-fns';

interface ParticipantListProps {
  train: ChesedTrain;
}

export default function ParticipantList({ train }: ParticipantListProps) {
  const today = startOfToday();

  // Get all claimed meal dates sorted by date
  const claimedMealDates = train.dates
    ?.filter((mealDate) => mealDate.status === 'claimed' || mealDate.status === 'delivered')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // Separate upcoming and past meals
  const upcomingMeals = claimedMealDates.filter(
    (mealDate) => !isBefore(new Date(mealDate.date), today)
  );

  const pastMeals = claimedMealDates.filter(
    (mealDate) => isBefore(new Date(mealDate.date), today)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'claimed':
        return <Badge variant="info">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">Available</Badge>;
    }
  };

  if (claimedMealDates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No participants yet
        </h3>
        <p className="text-gray-600">
          Be the first to sign up for a meal!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Meals */}
      {upcomingMeals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Meals ({upcomingMeals.length})
          </h3>
          <div className="space-y-3">
            {upcomingMeals.map((mealDate) => (
              <Card key={mealDate.id} padding="none" hover className="overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 text-center bg-blue-50 rounded-lg p-3 min-w-[80px]">
                    <div className="text-2xl font-bold text-blue-600">
                      {format(new Date(mealDate.date), 'd')}
                    </div>
                    <div className="text-xs font-medium text-blue-600 uppercase">
                      {format(new Date(mealDate.date), 'MMM')}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {format(new Date(mealDate.date), 'yyyy')}
                    </div>
                  </div>

                  {/* Participant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={mealDate.participant?.name || 'Anonymous'}
                          size="md"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {mealDate.participant?.name || 'Anonymous'}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {mealDate.mealType} • {format(new Date(mealDate.date), 'EEEE')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(mealDate.status)}
                    </div>

                    {/* Meal Description/Notes */}
                    {mealDate.notes && (
                      <div className="bg-gray-50 rounded-md p-3 mt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {mealDate.notes}
                        </p>
                      </div>
                    )}

                    {/* Contact Info (only show email if available) */}
                    {mealDate.participant?.email && (
                      <div className="mt-2 text-sm text-gray-500">
                        Contact: {mealDate.participant.email}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Meals */}
      {pastMeals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Past Meals ({pastMeals.length})
          </h3>
          <div className="space-y-3">
            {pastMeals.map((mealDate) => (
              <Card key={mealDate.id} padding="none" className="opacity-75">
                <div className="flex items-start gap-4 p-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 text-center bg-gray-50 rounded-lg p-3 min-w-[80px]">
                    <div className="text-2xl font-bold text-gray-600">
                      {format(new Date(mealDate.date), 'd')}
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase">
                      {format(new Date(mealDate.date), 'MMM')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(mealDate.date), 'yyyy')}
                    </div>
                  </div>

                  {/* Participant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={mealDate.participant?.name || 'Anonymous'}
                          size="md"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {mealDate.participant?.name || 'Anonymous'}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {mealDate.mealType} • {format(new Date(mealDate.date), 'EEEE')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(mealDate.status)}
                    </div>

                    {/* Meal Description/Notes */}
                    {mealDate.notes && (
                      <div className="bg-gray-50 rounded-md p-3 mt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {mealDate.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
