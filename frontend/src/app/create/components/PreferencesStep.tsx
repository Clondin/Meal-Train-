'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChesedTrainFormData } from '../page';

interface PreferencesStepProps {
  register: UseFormRegister<ChesedTrainFormData>;
  errors: FieldErrors<ChesedTrainFormData>;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Food Preferences</h2>
        <p className="text-sm text-gray-600">
          Help contributors know what to bring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Household Size"
          type="number"
          {...register('householdSize', {
            min: { value: 1, message: 'Must be at least 1' },
            valueAsNumber: true,
          })}
          error={errors.householdSize?.message}
          placeholder="4"
          helperText="Number of people meals should serve"
        />
      </div>

      <Textarea
        label="Dietary Preferences"
        {...register('dietaryPreferences')}
        error={errors.dietaryPreferences?.message}
        placeholder="Vegetarian, vegan, gluten-free, dairy-free, etc."
        rows={3}
        helperText="Any dietary restrictions or preferences"
      />

      <Textarea
        label="Allergies"
        {...register('allergies')}
        error={errors.allergies?.message}
        placeholder="Peanuts, shellfish, tree nuts, etc."
        rows={3}
        helperText="Important allergy information"
      />

      <Textarea
        label="Food Likes"
        {...register('foodLikes')}
        error={errors.foodLikes?.message}
        placeholder="Italian, Mexican, chicken dishes, casseroles, etc."
        rows={3}
        helperText="Foods the family enjoys"
      />

      <Textarea
        label="Food Dislikes"
        {...register('foodDislikes')}
        error={errors.foodDislikes?.message}
        placeholder="Spicy foods, seafood, etc."
        rows={3}
        helperText="Foods the family prefers to avoid"
      />

      <Textarea
        label="Delivery Instructions"
        {...register('deliveryInstructions')}
        error={errors.deliveryInstructions?.message}
        placeholder="Leave on porch, ring doorbell, gate code, parking instructions, etc."
        rows={4}
        helperText="Special instructions for meal drop-off"
      />
    </div>
  );
};
