'use client';

import React, { useMemo } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { format, addDays, eachDayOfInterval, parseISO } from 'date-fns';
import { MealTrainFormData } from '../page';

interface ScheduleStepProps {
  register: UseFormRegister<MealTrainFormData>;
  errors: FieldErrors<MealTrainFormData>;
  watch: UseFormWatch<MealTrainFormData>;
}

const timeOptions = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
];

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  register,
  errors,
  watch,
}) => {
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const preferredMealTime = watch('preferredMealTime') || '18:00';
  const timezone = watch('timezone') || 'America/New_York';

  // Calculate minimum end date (must be after start date)
  const minEndDate = useMemo(() => {
    if (!startDate) return undefined;
    const start = new Date(startDate);
    return format(addDays(start, 1), 'yyyy-MM-dd');
  }, [startDate]);

  // Generate calendar preview
  const calendarDays = useMemo(() => {
    if (!startDate || !endDate) return [];
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (start > end) return [];
      const days = eachDayOfInterval({ start, end });
      return days.slice(0, 14); // Show max 14 days in preview
    } catch {
      return [];
    }
  }, [startDate, endDate]);

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Details</h2>
        <p className="text-sm text-gray-600">
          Set up when meals will be delivered
        </p>
      </div>

      <Input
        label="Meal Train Title"
        {...register('title', {
          required: 'Title is required',
        })}
        error={errors.title?.message}
        placeholder="Meals for the Johnson Family"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          {...register('startDate', {
            required: 'Start date is required',
          })}
          error={errors.startDate?.message}
          min={today}
        />

        <Input
          label="End Date"
          type="date"
          {...register('endDate', {
            required: 'End date is required',
          })}
          error={errors.endDate?.message}
          min={minEndDate || today}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Default Delivery Time"
          value={preferredMealTime}
          onChange={(value) => {
            const event = {
              target: { name: 'preferredMealTime', value: value as string },
            } as any;
            register('preferredMealTime').onChange(event);
          }}
          options={timeOptions}
        />

        <Select
          label="Timezone"
          value={timezone}
          onChange={(value) => {
            const event = {
              target: { name: 'timezone', value: value as string },
            } as any;
            register('timezone').onChange(event);
          }}
          options={timezoneOptions}
        />
      </div>

      {/* Calendar Preview */}
      {calendarDays.length > 0 && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Calendar Preview
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className="text-center p-2 bg-white border border-gray-200 rounded"
              >
                <div className="text-xs font-medium text-gray-500">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {format(day, 'MMM d')}
                </div>
              </div>
            ))}
          </div>
          {calendarDays.length === 14 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing first 14 days...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
