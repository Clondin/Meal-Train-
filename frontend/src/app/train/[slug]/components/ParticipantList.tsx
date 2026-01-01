'use client';

import { ChesedTrain, Contribution, TaskSlot, TASK_TYPE_LABELS, MEAL_CATEGORY_LABELS, MEAL_COMPONENT_LABELS } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { format, isBefore, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ParticipantListProps {
  train: ChesedTrain;
}

export default function ParticipantList({ train }: ParticipantListProps) {
  const today = startOfToday();

  // Get all contributions
  const contributions = train.contributions || [];

  // Sort contributions by slot date
  const sortedContributions = [...contributions].sort((a, b) => {
    const dateA = a.slot ? new Date(a.slot.date).getTime() : 0;
    const dateB = b.slot ? new Date(b.slot.date).getTime() : 0;
    return dateA - dateB;
  });

  const upcomingContributions = sortedContributions.filter(
    (c) => c.slot && !isBefore(new Date(c.slot.date), today)
  );

  const pastContributions = sortedContributions.filter(
    (c) => c.slot && isBefore(new Date(c.slot.date), today)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="info" className="rounded-lg px-3">Scheduled</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" className="rounded-lg px-3">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" className="rounded-lg px-3">Cancelled</Badge>;
      default:
        return <Badge variant="neutral" className="rounded-lg px-3">{status}</Badge>;
    }
  };

  if (contributions.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="text-gray-300 mb-4 text-6xl">🤝</div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          No contributors yet
        </h3>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
          Be the first to support this family! Head over to the calendar to pick a slot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Upcoming Contributions */}
      {upcomingContributions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Upcoming Chesed
            </h3>
            <span className="h-px flex-grow bg-gray-100" />
            <Badge variant="info" className="rounded-full">{upcomingContributions.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingContributions.map((cont) => (
              <ContributionCard key={cont.id} contribution={cont} isPast={false} />
            ))}
          </div>
        </div>
      )}

      {/* Past Contributions */}
      {pastContributions.length > 0 && (
        <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-black text-gray-500 tracking-tight">
              Past Support
            </h3>
            <span className="h-px flex-grow bg-gray-100" />
            <Badge variant="neutral" className="rounded-full">{pastContributions.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastContributions.map((cont) => (
              <ContributionCard key={cont.id} contribution={cont} isPast={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContributionCard({ contribution, isPast }: { contribution: Contribution, isPast: boolean }) {
  const { slot, user, guestName, itemDescription, mealCategory, mealComponent, status } = contribution;
  const name = user?.name || guestName || 'Anonymous';

  return (
    <Card className={cn(
      "p-5 rounded-2xl border-none shadow-xl shadow-gray-200/50 flex flex-col gap-4",
      isPast ? "bg-gray-50/50" : "bg-white"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex flex-col items-center justify-center border-2 border-white shadow-sm">
              <span className="text-[10px] font-black text-primary-600 uppercase leading-none">
                {slot ? format(new Date(slot.date), 'MMM') : '-'}
              </span>
              <span className="text-lg font-black text-primary-900 leading-none mt-0.5">
                {slot ? format(new Date(slot.date), 'd') : '-'}
              </span>
            </div>
          </div>
          <div>
            <div className="font-black text-gray-900 text-sm leading-tight">
              {name}
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {slot ? TASK_TYPE_LABELS[slot.taskType] : 'General'}
            </div>
          </div>
        </div>
        <Badge variant={status === 'CONFIRMED' ? 'info' : status === 'COMPLETED' ? 'success' : 'neutral'} size="sm">
          {status}
        </Badge>
      </div>

      <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
        <div className="text-xs font-bold text-gray-800 mb-1">
          {itemDescription || "Signing up to help!"}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {mealComponent && mealComponent !== 'FULL_MEAL' && (
            <Badge variant="info" size="sm" className="bg-white border text-[9px]">
              {MEAL_COMPONENT_LABELS[mealComponent]}
            </Badge>
          )}
          {mealCategory && (
            <Badge variant={mealCategory === 'FLEISHIG' ? 'error' : mealCategory === 'MILCHIG' ? 'info' : 'success'} size="sm" className="bg-white border text-[9px]">
              {MEAL_CATEGORY_LABELS[mealCategory]}
            </Badge>
          )}
        </div>
      </div>

      {isPast && (
        <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tight">
          <span>Completed on {slot ? format(new Date(slot.date), 'MM/dd/yy') : 'N/A'}</span>
          <span className="text-green-500">✓</span>
        </div>
      )}
    </Card>
  );
}
