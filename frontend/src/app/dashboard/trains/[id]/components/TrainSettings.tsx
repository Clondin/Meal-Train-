'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Input, Textarea, Select, Modal } from '@/components/ui';
import { api } from '@/lib/api';
import type { ChesedTrain } from '@/types';

interface TrainSettingsProps {
  train: ChesedTrain;
  onUpdate: () => void;
}

interface SettingsFormData {
  title: string;
  description: string;
  story: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  dietaryPreferences: string;
  allergies: string;
  foodLikes: string;
  foodDislikes: string;
  deliveryInstructions: string;
  householdSize: number;
  defaultDeliveryTime: string;
  isPublic: boolean;
  allowDonations: boolean;
  allowGiftCards: boolean;
  donationGoal: number | null;
  requireApproval: boolean;
  showParticipantList: boolean;
  enableReminders: boolean;
  reminderHours: number;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
];

const TIME_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 9;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: `${displayHour}:00 ${ampm}`,
  };
});

export default function TrainSettings({ train, onUpdate }: TrainSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(train.status);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<SettingsFormData>({
    defaultValues: {
      title: train.title,
      description: train.description || '',
      story: train.story || '',
      recipientName: train.recipientName,
      recipientEmail: train.recipientEmail || '',
      recipientPhone: train.recipientPhone || '',
      recipientAddress: train.recipientAddress || '',
      recipientCity: train.recipientCity || '',
      recipientState: train.recipientState || '',
      recipientZip: train.recipientZip || '',
      dietaryPreferences: train.dietaryPreferences || '',
      allergies: train.allergies || '',
      foodLikes: train.foodLikes || '',
      foodDislikes: train.foodDislikes || '',
      deliveryInstructions: train.deliveryInstructions || '',
      householdSize: train.householdSize,
      defaultDeliveryTime: train.defaultDeliveryTime,
      isPublic: train.isPublic,
      allowDonations: train.allowDonations,
      allowGiftCards: train.allowGiftCards,
      donationGoal: train.donationGoal ? parseFloat(train.donationGoal.toString()) : null,
      requireApproval: train.requireApproval,
      showParticipantList: train.showParticipantList,
      enableReminders: train.enableReminders,
      reminderHours: train.reminderHours,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      await api.updateChesedTrain(train.slug, {
        ...data,
        status: selectedStatus,
      });
      toast.success('Settings updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== train.title) {
      toast.error('Please type the chesed train title to confirm');
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteChesedTrain(train.slug);
      toast.success('Chesed train deleted');
      router.push('/dashboard/trains');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete chesed train');
    } finally {
      setIsLoading(false);
    }
  };

  const allowDonations = watch('allowDonations');
  const enableReminders = watch('enableReminders');

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Status Section */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Chesed Train Status</h3>
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(String(value) as ChesedTrain['status'])}
          />
          <p className="text-sm text-gray-500 mt-2">
            {selectedStatus === 'ACTIVE' && 'Volunteers can sign up for dates.'}
            {selectedStatus === 'PAUSED' && 'Temporarily hide from public. No new sign-ups.'}
            {selectedStatus === 'COMPLETED' && 'Mark this chesed train as complete.'}
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <Input
              label="Title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />
            <Textarea
              label="Description"
              {...register('description')}
              rows={3}
            />
            <Textarea
              label="Story"
              {...register('story')}
              rows={4}
              helperText="Share the recipient's story to encourage volunteers"
            />
          </div>
        </div>

        {/* Recipient Info */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Recipient Name"
              {...register('recipientName', { required: 'Recipient name is required' })}
              error={errors.recipientName?.message}
            />
            <Input
              label="Email"
              type="email"
              {...register('recipientEmail')}
            />
            <Input
              label="Phone"
              {...register('recipientPhone')}
            />
            <Input
              label="Household Size"
              type="number"
              {...register('householdSize', { valueAsNumber: true, min: 1 })}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                {...register('recipientAddress')}
              />
            </div>
            <Input
              label="City"
              {...register('recipientCity')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                {...register('recipientState')}
              />
              <Input
                label="ZIP"
                {...register('recipientZip')}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Food Preferences</h3>
          <div className="space-y-4">
            <Textarea
              label="Dietary Preferences"
              {...register('dietaryPreferences')}
              rows={2}
            />
            <Textarea
              label="Allergies"
              {...register('allergies')}
              rows={2}
            />
            <Textarea
              label="Food Likes"
              {...register('foodLikes')}
              rows={2}
            />
            <Textarea
              label="Food Dislikes"
              {...register('foodDislikes')}
              rows={2}
            />
            <Textarea
              label="Delivery Instructions"
              {...register('deliveryInstructions')}
              rows={2}
            />
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
          <Select
            label="Default Delivery Time"
            options={TIME_OPTIONS}
            value={watch('defaultDeliveryTime')}
            onChange={(value) => setValue('defaultDeliveryTime', String(value))}
          />
        </div>

        {/* Donation Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Donations & Gift Cards</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('allowDonations')}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Allow monetary donations</span>
            </label>

            {allowDonations && (
              <Input
                label="Donation Goal (optional)"
                type="number"
                {...register('donationGoal', { valueAsNumber: true })}
                placeholder="e.g., 500"
              />
            )}

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('allowGiftCards')}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Allow gift card purchases</span>
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Make chesed train public (visible in search)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('requireApproval')}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Require approval for volunteer sign-ups</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('showParticipantList')}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Show participant list publicly</span>
            </label>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Reminder Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('enableReminders')}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Send email reminders to volunteers</span>
            </label>

            {enableReminders && (
              <Input
                label="Hours before delivery"
                type="number"
                {...register('reminderHours', { valueAsNumber: true, min: 1, max: 72 })}
                helperText="How many hours before the scheduled delivery to send a reminder"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-red-600 text-sm mb-4">
          Deleting a chesed train is permanent and cannot be undone. All associated data including
          participants, donations, and gift cards will be deleted.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete Chesed Train
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Chesed Train"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This action cannot be undone. This will permanently delete the chesed train
            <strong className="text-gray-900"> {train.title}</strong> and all associated data.
          </p>
          <Input
            label={`Type "${train.title}" to confirm`}
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={train.title}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
              disabled={deleteConfirmation !== train.title}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
