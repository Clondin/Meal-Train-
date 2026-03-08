'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { ChesedTrainFormData } from '../page';

interface PrivacyStepProps {
  register: UseFormRegister<ChesedTrainFormData>;
  errors: FieldErrors<ChesedTrainFormData>;
  watch: UseFormWatch<ChesedTrainFormData>;
  setValue: UseFormSetValue<ChesedTrainFormData>;
}

export const PrivacyStep: React.FC<PrivacyStepProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const isPublic = watch('isPublic');
  const requireApproval = watch('requireApproval');
  const showParticipants = watch('showParticipants');
  const enableReminders = watch('enableReminders');
  const reminderHours = watch('reminderHours') || 24;

  const handleToggle = (
    field: 'isPublic' | 'requireApproval' | 'showParticipants' | 'enableReminders'
  ) => {
    const currentValue = watch(field);
    setValue(field, !currentValue);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Settings</h2>
        <p className="text-sm text-gray-600">
          Control who can see and participate in this chesed train
        </p>
      </div>

      {/* Public/Private Toggle */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Public Chesed Train
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isPublic
                ? 'Anyone with the link can view and sign up'
                : 'Only people you invite can view and sign up'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('isPublic')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${isPublic ? 'bg-primary-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={isPublic}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full
                bg-white shadow ring-0 transition duration-200 ease-in-out
                ${isPublic ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Require Approval Toggle */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Require Sign-up Approval
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {requireApproval
                ? 'You must approve each meal sign-up before it\'s confirmed'
                : 'People can sign up immediately without approval'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('requireApproval')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${requireApproval ? 'bg-primary-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={requireApproval}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full
                bg-white shadow ring-0 transition duration-200 ease-in-out
                ${requireApproval ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Show Participants Toggle */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Show Participant List
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {showParticipants
                ? 'Everyone can see who has signed up'
                : 'Participant names are hidden from other users'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('showParticipants')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${showParticipants ? 'bg-primary-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={showParticipants}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full
                bg-white shadow ring-0 transition duration-200 ease-in-out
                ${showParticipants ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Enable Reminders Toggle */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Enable Email Reminders
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {enableReminders
                ? 'Send automatic reminders to participants'
                : 'No automatic reminders will be sent'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('enableReminders')}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${enableReminders ? 'bg-primary-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={enableReminders}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full
                bg-white shadow ring-0 transition duration-200 ease-in-out
                ${enableReminders ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {enableReminders && (
          <div className="mt-4">
            <Input
              label="Reminder Time"
              type="number"
              {...register('reminderHours', {
                min: { value: 1, message: 'Must be at least 1 hour' },
                max: { value: 168, message: 'Cannot exceed 168 hours (1 week)' },
                valueAsNumber: true,
              })}
              error={errors.reminderHours?.message}
              helperText="Hours before delivery to send reminder"
            />
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
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
            <h3 className="text-sm font-medium text-gray-800">
              Privacy Recommendation
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                We recommend starting with a public chesed train and participant
                visibility enabled. This makes it easier for friends and family to
                coordinate and see what dates are available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
