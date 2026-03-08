'use client';

import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { format, parseISO } from 'date-fns';
import { ChesedTrainFormData } from '../page';

interface ReviewStepProps {
  watch: UseFormWatch<ChesedTrainFormData>;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  watch,
  onEdit,
  isSubmitting,
}) => {
  const formData = watch();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'Not set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-sm text-gray-600">
          Review your chesed train details before creating
        </p>
      </div>

      {/* Recipient Information Section */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Recipient Information
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
          >
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Name:</dt>
            <dd className="text-gray-900">{formData.recipientName || 'Not set'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email:</dt>
            <dd className="text-gray-900">{formData.recipientEmail || 'Not set'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Phone:</dt>
            <dd className="text-gray-900">{formData.recipientPhone || 'Not set'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Address:</dt>
            <dd className="text-gray-900">
              {formData.recipientAddress || 'Not set'}
              {formData.city && formData.state && formData.zip && (
                <>, {formData.city}, {formData.state} {formData.zip}</>
              )}
            </dd>
          </div>
          {formData.description && (
            <div>
              <dt className="font-medium text-gray-700">Story:</dt>
              <dd className="text-gray-900 whitespace-pre-line">
                {formData.description}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Schedule Section */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
          >
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Title:</dt>
            <dd className="text-gray-900">{formData.title || 'Not set'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Duration:</dt>
            <dd className="text-gray-900">
              {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Default Delivery Time:</dt>
            <dd className="text-gray-900">
              {formatTime(formData.defaultDeliveryTime)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Timezone:</dt>
            <dd className="text-gray-900">{formData.timezone || 'Not set'}</dd>
          </div>
        </dl>
      </div>

      {/* Food Preferences Section */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Food Preferences
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
          >
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Household Size:</dt>
            <dd className="text-gray-900">
              {formData.householdSize || 'Not set'}
            </dd>
          </div>
          {formData.dietaryPreferences && (
            <div>
              <dt className="font-medium text-gray-700">Dietary Preferences:</dt>
              <dd className="text-gray-900 whitespace-pre-line">
                {formData.dietaryPreferences}
              </dd>
            </div>
          )}
          {formData.allergies && (
            <div>
              <dt className="font-medium text-gray-700">Allergies:</dt>
              <dd className="text-gray-900 whitespace-pre-line">
                {formData.allergies}
              </dd>
            </div>
          )}
          {formData.foodLikes && (
            <div>
              <dt className="font-medium text-gray-700">Food Likes:</dt>
              <dd className="text-gray-900 whitespace-pre-line">
                {formData.foodLikes}
              </dd>
            </div>
          )}
          {formData.foodDislikes && (
            <div>
              <dt className="font-medium text-gray-700">Food Dislikes:</dt>
              <dd className="text-gray-900 whitespace-pre-line">
                {formData.foodDislikes}
              </dd>
            </div>
          )}
          {(formData.acceptsMilchig || formData.acceptsFleishig || formData.acceptsPareve) && (
            <div>
              <dt className="font-medium text-gray-700">Accepted categories:</dt>
              <dd className="text-gray-900">
                {[
                  formData.acceptsMilchig && 'Milchig',
                  formData.acceptsFleishig && 'Fleishig',
                  formData.acceptsPareve && 'Pareve',
                ].filter(Boolean).join(', ')}
              </dd>
            </div>
          )}
          {(formData.requireCholovYisroel || formData.requirePasYisroel || formData.requireYoshon || formData.requireGlatt) && (
            <div>
              <dt className="font-medium text-gray-700">Kashrus requirements:</dt>
              <dd className="text-gray-900">
                {[
                  formData.requireCholovYisroel && 'Cholov Yisroel',
                  formData.requirePasYisroel && 'Pas Yisroel',
                  formData.requireYoshon && 'Yoshon',
                  formData.requireGlatt && 'Glatt',
                ].filter(Boolean).join(', ')}
              </dd>
            </div>
          )}
          {(formData.allergyNuts || formData.allergyDairy || formData.allergyGluten || formData.allergyEggs || formData.allergyFish || formData.allergyShellfish || formData.allergySoy || formData.allergyOther) && (
            <div>
              <dt className="font-medium text-gray-700">Structured allergies:</dt>
              <dd className="text-gray-900">
                {[
                  formData.allergyNuts && 'Nuts',
                  formData.allergyDairy && 'Dairy',
                  formData.allergyGluten && 'Gluten',
                  formData.allergyEggs && 'Eggs',
                  formData.allergyFish && 'Fish',
                  formData.allergyShellfish && 'Shellfish',
                  formData.allergySoy && 'Soy',
                  formData.allergyOther,
                ].filter(Boolean).join(', ')}
              </dd>
            </div>
          )}
          {formData.deliveryInstructions && (
            <div>
              <dt className="font-medium text-gray-700">Delivery Instructions:</dt>
              <dd className="text-gray-900 whitespace-pre-line">
                {formData.deliveryInstructions}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Donations & Settings Section */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Donations & Settings
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(4)}
          >
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Train Type:</dt>
            <dd className="text-gray-900">
              {formData.trainType || 'STANDARD'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Monetary Donations:</dt>
            <dd className="text-gray-900">
              {formData.donationsEnabled ? (
                <>
                  Enabled
                  {formData.donationGoal && ` (Goal: $${formData.donationGoal})`}
                </>
              ) : (
                'Disabled'
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Gift Cards:</dt>
            <dd className="text-gray-900">
              {formData.giftCardsEnabled ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Privacy Section */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Privacy</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(5)}
          >
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Visibility:</dt>
            <dd className="text-gray-900">
              {formData.isPublic ? 'Public' : 'Private'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Sign-up Approval:</dt>
            <dd className="text-gray-900">
              {formData.requireApproval ? 'Required' : 'Not required'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Participant List:</dt>
            <dd className="text-gray-900">
              {formData.showParticipants ? 'Visible' : 'Hidden'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email Reminders:</dt>
            <dd className="text-gray-900">
              {formData.enableReminders ? (
                <>Enabled ({formData.reminderHours} hours before)</>
              ) : (
                'Disabled'
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Submit Section */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-primary-400"
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
            <h3 className="text-sm font-medium text-primary-800">
              Ready to create your chesed train?
            </h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>
                Once you create the chesed train, you'll be able to share it with
                friends and family. You can always edit these details later.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="px-8"
        >
          Create Chesed Train
        </Button>
      </div>
    </div>
  );
};
