'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChesedTrainFormData } from '../page';

interface PreferencesStepProps {
  register: UseFormRegister<ChesedTrainFormData>;
  errors: FieldErrors<ChesedTrainFormData>;
  watch: UseFormWatch<ChesedTrainFormData>;
  setValue: UseFormSetValue<ChesedTrainFormData>;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const toggle = (field: keyof ChesedTrainFormData) => {
    setValue(field, !watch(field), { shouldDirty: true });
  };

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

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900">Accepted meal categories</h3>
        <p className="mt-1 text-sm text-gray-600">Tell contributors what kinds of meals work for this household.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ['acceptsMilchig', 'Milchig'],
            ['acceptsFleishig', 'Fleishig'],
            ['acceptsPareve', 'Pareve'],
          ].map(([field, label]) => (
            <button
              key={field}
              type="button"
              onClick={() => toggle(field as keyof ChesedTrainFormData)}
              className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                watch(field as keyof ChesedTrainFormData)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900">Kashrus requirements</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ['requireCholovYisroel', 'Require Cholov Yisroel'],
            ['requirePasYisroel', 'Require Pas Yisroel'],
            ['requireYoshon', 'Require Yoshon'],
            ['requireGlatt', 'Require Glatt'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(watch(field as keyof ChesedTrainFormData))}
                onChange={() => toggle(field as keyof ChesedTrainFormData)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <Textarea
        label="Dietary Preferences"
        {...register('dietaryPreferences')}
        error={errors.dietaryPreferences?.message}
        placeholder="Vegetarian, vegan, gluten-free, dairy-free, etc."
        rows={3}
        helperText="Any dietary restrictions or preferences"
      />

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900">Structured allergies</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ['allergyNuts', 'Nuts'],
            ['allergyDairy', 'Dairy'],
            ['allergyGluten', 'Gluten'],
            ['allergyEggs', 'Eggs'],
            ['allergyFish', 'Fish'],
            ['allergyShellfish', 'Shellfish'],
            ['allergySoy', 'Soy'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(watch(field as keyof ChesedTrainFormData))}
                onChange={() => toggle(field as keyof ChesedTrainFormData)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Input
            label="Other allergy details"
            {...register('allergyOther')}
            error={errors.allergyOther?.message}
            placeholder="Sesame, fragrance sensitivity, etc."
          />
        </div>
      </div>

      <Textarea
        label="Allergies summary"
        {...register('allergies')}
        error={errors.allergies?.message}
        placeholder="Cross-contamination concerns, severity notes, or anything contributors should know."
        rows={3}
        helperText="Optional narrative details in addition to the structured allergy fields"
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
