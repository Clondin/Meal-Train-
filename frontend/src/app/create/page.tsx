'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { StepIndicator, Step } from './components/StepIndicator';
import { RecipientStep } from './components/RecipientStep';
import { ScheduleStep } from './components/ScheduleStep';
import { PreferencesStep } from './components/PreferencesStep';
import { DonationsStep } from './components/DonationsStep';
import { PrivacyStep } from './components/PrivacyStep';
import { ReviewStep } from './components/ReviewStep';
import api from '@/lib/api';

// Extended form data type to include all wizard fields
export interface MealTrainFormData {
  // Recipient details
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientAddress: string;
  city: string;
  state: string;
  zip: string;
  coverImage?: string;
  description: string;

  // Schedule
  title: string;
  startDate: string;
  endDate: string;
  defaultDeliveryTime?: string;
  timezone?: string;

  // Preferences
  dietaryPreferences?: string;
  allergies?: string;
  foodLikes?: string;
  foodDislikes?: string;
  deliveryInstructions?: string;
  householdSize?: number;

  // Donations
  donationsEnabled?: boolean;
  donationGoal?: number;
  giftCardsEnabled?: boolean;
  trainType?: string;

  // Privacy
  isPublic?: boolean;
  requireApproval?: boolean;
  showParticipants?: boolean;
  enableReminders?: boolean;
  reminderHours?: number;
}

const steps: Step[] = [
  { id: 1, name: 'recipient', label: 'Recipient' },
  { id: 2, name: 'schedule', label: 'Schedule' },
  { id: 3, name: 'preferences', label: 'Preferences' },
  { id: 4, name: 'donations', label: 'Donations' },
  { id: 5, name: 'privacy', label: 'Privacy' },
  { id: 6, name: 'review', label: 'Review' },
];

export default function CreateMealTrainPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<MealTrainFormData>({
    defaultValues: {
      defaultDeliveryTime: '18:00',
      timezone: 'America/New_York',
      trainType: 'standard',
      donationsEnabled: false,
      giftCardsEnabled: false,
      isPublic: true,
      requireApproval: false,
      showParticipants: true,
      enableReminders: true,
      reminderHours: 24,
      householdSize: 4,
    },
  });

  // Field validation by step
  const stepFields: Record<number, (keyof MealTrainFormData)[]> = {
    1: ['recipientName', 'recipientAddress', 'city', 'state', 'zip', 'description'],
    2: ['title', 'startDate', 'endDate'],
    3: [], // All optional fields
    4: [], // All optional fields
    5: [], // All optional fields
    6: [], // Review step, no validation needed
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const fields = stepFields[step];
    if (!fields || fields.length === 0) return true;

    const result = await trigger(fields);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: MealTrainFormData) => {
    // Validate all steps before submission
    for (let step = 1; step <= 5; step++) {
      const isValid = await validateStep(step);
      if (!isValid) {
        setCurrentStep(step);
        toast.error(`Please complete step ${step}: ${steps[step - 1].label}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Transform form data to match API CreateMealTrainData interface
      const mealTrainData = {
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        recipientPhone: data.recipientPhone,
        recipientAddress: `${data.recipientAddress}, ${data.city}, ${data.state} ${data.zip}`,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        dietaryPreferences: data.dietaryPreferences,
        allergies: data.allergies,
        householdSize: data.householdSize,
        defaultDeliveryTime: data.defaultDeliveryTime,
        deliveryInstructions: data.deliveryInstructions,
      };

      const mealTrain = await api.createMealTrain(mealTrainData);

      toast.success('Meal train created successfully!');

      // Redirect to the meal train page
      router.push(`/train/${mealTrain.id}`);
    } catch (error: any) {
      console.error('Failed to create meal train:', error);
      toast.error(error.message || 'Failed to create meal train');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <RecipientStep
            register={register}
            errors={errors}
            onImageUpload={(url) => setValue('coverImage', url)}
            defaultImage={watch('coverImage')}
          />
        );
      case 2:
        return (
          <ScheduleStep
            register={register}
            errors={errors}
            watch={watch}
          />
        );
      case 3:
        return (
          <PreferencesStep
            register={register}
            errors={errors}
          />
        );
      case 4:
        return (
          <DonationsStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      case 5:
        return (
          <PrivacyStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      case 6:
        return (
          <ReviewStep
            watch={watch}
            onEdit={handleEdit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create a Meal Train
          </h1>
          <p className="mt-2 text-gray-600">
            Coordinate meal deliveries for friends and family in need
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step Content */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < steps.length && (
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          )}

          {/* Navigation for Review Step (submit handled in ReviewStep component) */}
          {currentStep === steps.length && (
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check out our{' '}
            <a href="/help" className="text-blue-600 hover:text-blue-800">
              guide to creating a meal train
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
