'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MealTrainFormData } from '../page';

interface DonationsStepProps {
  register: UseFormRegister<MealTrainFormData>;
  errors: FieldErrors<MealTrainFormData>;
  watch: UseFormWatch<MealTrainFormData>;
  setValue: UseFormSetValue<MealTrainFormData>;
}

const trainTypeOptions = [
  { value: 'standard', label: 'Standard - Traditional meal delivery' },
  { value: 'potluck', label: 'Potluck - Multiple contributors per day' },
];

export const DonationsStep: React.FC<DonationsStepProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const donationsEnabled = watch('donationsEnabled');
  const giftCardsEnabled = watch('giftCardsEnabled');
  const trainType = watch('trainType') || 'standard';

  const handleToggle = (field: 'donationsEnabled' | 'giftCardsEnabled') => {
    const currentValue = watch(field);
    setValue(field, !currentValue);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Donations & Settings</h2>
        <p className="text-sm text-gray-600">
          Configure donation options and meal train type
        </p>
      </div>

      <Select
        label="Meal Train Type"
        value={trainType}
        onChange={(value) => {
          const event = {
            target: { name: 'trainType', value: value as string },
          } as any;
          register('trainType').onChange(event);
        }}
        options={trainTypeOptions}
        helperText="Standard allows one meal per day, Potluck allows multiple contributors"
      />

      {/* Enable Donations Toggle */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Enable Monetary Donations
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Allow people to contribute money instead of meals
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('donationsEnabled')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${donationsEnabled ? 'bg-blue-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={donationsEnabled}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full
                bg-white shadow ring-0 transition duration-200 ease-in-out
                ${donationsEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {donationsEnabled && (
          <div className="mt-4">
            <Input
              label="Donation Goal Amount (Optional)"
              type="number"
              {...register('donationGoal', {
                min: { value: 0, message: 'Must be positive' },
                valueAsNumber: true,
              })}
              error={errors.donationGoal?.message}
              placeholder="500"
              helperText="Optional: Set a fundraising goal"
            />
          </div>
        )}
      </div>

      {/* Enable Gift Cards Toggle */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Enable Gift Cards
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Allow people to send restaurant gift cards
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('giftCardsEnabled')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${giftCardsEnabled ? 'bg-blue-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={giftCardsEnabled}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full
                bg-white shadow ring-0 transition duration-200 ease-in-out
                ${giftCardsEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {giftCardsEnabled && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Contributors will be able to send gift cards from popular restaurants
              to help the family order meals when convenient.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Donations
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Enabling donations allows supporters to contribute financially if
                they can't provide a meal. All donation processing is secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
