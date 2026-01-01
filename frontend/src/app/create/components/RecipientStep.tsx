'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { MealTrainFormData } from '../page';

interface RecipientStepProps {
  register: UseFormRegister<MealTrainFormData>;
  errors: FieldErrors<MealTrainFormData>;
  onImageUpload?: (url: string) => void;
  defaultImage?: string;
}

export const RecipientStep: React.FC<RecipientStepProps> = ({
  register,
  errors,
  onImageUpload,
  defaultImage,
}) => {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(defaultImage);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    if (onImageUpload) {
      setUploading(true);
      try {
        // Simulate upload - in real app, use api.uploadFile(file)
        const objectUrl = URL.createObjectURL(file);
        onImageUpload(objectUrl);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipient Information</h2>
        <p className="text-sm text-gray-600">
          Tell us about the person or family receiving meals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Recipient Name"
          {...register('recipientName', {
            required: 'Recipient name is required',
          })}
          error={errors.recipientName?.message}
          placeholder="John and Jane Doe"
        />

        <Input
          label="Email"
          type="email"
          {...register('recipientEmail')}
          error={errors.recipientEmail?.message}
          placeholder="recipient@example.com"
        />

        <Input
          label="Phone"
          type="tel"
          {...register('recipientPhone')}
          error={errors.recipientPhone?.message}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-4">
        <Input
          label="Street Address"
          {...register('recipientAddress', {
            required: 'Address is required',
          })}
          error={errors.recipientAddress?.message}
          placeholder="123 Main St"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            {...register('city', {
              required: 'City is required',
            })}
            error={errors.city?.message}
            placeholder="Springfield"
          />

          <Input
            label="State"
            {...register('state', {
              required: 'State is required',
            })}
            error={errors.state?.message}
            placeholder="IL"
            maxLength={2}
          />

          <Input
            label="Zip Code"
            {...register('zip', {
              required: 'Zip code is required',
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: 'Invalid zip code',
              },
            })}
            error={errors.zip?.message}
            placeholder="62701"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <div className="flex items-start gap-4">
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
              <img
                src={imagePreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="coverImage">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={uploading}
                onClick={() => document.getElementById('coverImage')?.click()}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Add a cover photo for the meal train
            </p>
          </div>
        </div>
      </div>

      <Textarea
        label="Story / Description"
        {...register('description', {
          required: 'Description is required',
        })}
        error={errors.description?.message}
        placeholder="Tell people why you're organizing this meal train and any important details they should know..."
        rows={6}
      />
    </div>
  );
};
