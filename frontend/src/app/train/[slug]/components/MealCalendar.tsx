'use client';

import { useState, useMemo } from 'react';
import { MealTrain, MealDate } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import DateSignupModal from './DateSignupModal';
import { cn } from '@/lib/utils';

interface MealCalendarProps {
  train: MealTrain;
}

export default function MealCalendar({ train }: MealCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = startOfToday();

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get meal date for a specific day
  const getMealDateForDay = (day: Date): MealDate | undefined => {
    return train.dates?.find((mealDate) =>
      isSameDay(new Date(mealDate.date), day)
    );
  };

  // Get status for a day
  const getDayStatus = (day: Date): 'available' | 'filled' | 'past' | 'none' => {
    const mealDate = getMealDateForDay(day);
    const isPast = isBefore(day, today);

    if (!mealDate) return 'none';
    if (isPast) return 'past';
    if (mealDate.status === 'claimed' || mealDate.status === 'delivered') {
      return 'filled';
    }
    return 'available';
  };

  // Handle date click
  const handleDateClick = (day: Date) => {
    const status = getDayStatus(day);
    const isPast = isBefore(day, today);

    // Only allow clicking on available dates in the future
    if (status === 'available' || (status === 'none' && !isPast)) {
      setSelectedDate(day);
      setIsModalOpen(true);
    }
  };

  // Navigate months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            aria-label="Next month"
          >
            →
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500" />
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500" />
          <span className="text-gray-700">Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-400" />
          <span className="text-gray-700">Past/Unavailable</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const status = getDayStatus(day);
            const mealDate = getMealDateForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isClickable = status === 'available' || (status === 'none' && !isBefore(day, today));

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-24 p-2 border-b border-r border-gray-200',
                  !isCurrentMonth && 'bg-gray-50',
                  isClickable && 'cursor-pointer hover:bg-gray-50',
                  'transition-colors'
                )}
                onClick={() => isClickable && handleDateClick(day)}
              >
                <div
                  className={cn(
                    'text-sm font-medium mb-1',
                    !isCurrentMonth && 'text-gray-400',
                    isCurrentMonth && 'text-gray-900',
                    isToday && 'text-blue-600 font-bold'
                  )}
                >
                  {format(day, 'd')}
                </div>

                {mealDate && (
                  <div className="space-y-1">
                    <Badge
                      variant={
                        status === 'available'
                          ? 'success'
                          : status === 'filled'
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                      className="w-full text-xs"
                    >
                      {status === 'available' && 'Open'}
                      {status === 'filled' &&
                        (mealDate.participant?.name || 'Claimed')}
                      {status === 'past' && 'Past'}
                    </Badge>
                    <div className="text-xs text-gray-600 truncate">
                      {mealDate.mealType}
                    </div>
                  </div>
                )}

                {!mealDate && isClickable && (
                  <div className="text-xs text-gray-400 mt-1">Click to sign up</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-friendly list view */}
      <div className="mt-6 lg:hidden">
        <h4 className="font-semibold text-gray-900 mb-3">Available Dates</h4>
        <div className="space-y-2">
          {train.dates
            ?.filter((mealDate) => {
              const day = new Date(mealDate.date);
              return (
                isSameMonth(day, currentMonth) &&
                !isBefore(day, today) &&
                mealDate.status === 'available'
              );
            })
            .map((mealDate) => (
              <button
                key={mealDate.id}
                onClick={() => {
                  setSelectedDate(new Date(mealDate.date));
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    {format(new Date(mealDate.date), 'EEEE, MMMM d')}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {mealDate.mealType}
                  </div>
                </div>
                <Badge variant="success">Available</Badge>
              </button>
            ))}
        </div>
      </div>

      {/* Signup Modal */}
      {selectedDate && (
        <DateSignupModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          train={train}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
