'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChesedTrain, MealDate } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface DateSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  train: ChesedTrain;
  selectedDate: Date;
}

export default function DateSignupModal({
  isOpen,
  onClose,
  train,
  selectedDate,
}: DateSignupModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Form state
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');
  const [mealDescription, setMealDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Check if user is logged in (in a real app, this would check auth state)
  const checkAuthStatus = () => {
    // This is a simplified check - in production, use your auth store
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      return !!token;
    }
    return false;
  };

  const isLoggedIn = checkAuthStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Find if there's already a meal date for this day
      const existingMealDate = train.dates?.find((md) => {
        const mdDate = new Date(md.date);
        return (
          mdDate.getFullYear() === selectedDate.getFullYear() &&
          mdDate.getMonth() === selectedDate.getMonth() &&
          mdDate.getDate() === selectedDate.getDate()
        );
      });

      if (existingMealDate) {
        // Claim existing meal date
        await api.claimMealDate(train.id, existingMealDate.id, {
          notes: `${mealDescription}${notes ? `\n\n${notes}` : ''}`,
        });

        // If guest, create participant
        if (!isLoggedIn && guestName && guestEmail) {
          await api.createParticipant(train.id, {
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
          });
        }

        toast.success('Successfully signed up for this meal!');
      } else {
        // Create new meal date
        const newMealDate = await api.createMealDate(train.id, {
          date: selectedDate.toISOString(),
          mealType,
          notes: `${mealDescription}${notes ? `\n\n${notes}` : ''}`,
        });

        // Claim it
        await api.claimMealDate(train.id, newMealDate.id, {
          notes: `${mealDescription}${notes ? `\n\n${notes}` : ''}`,
        });

        // If guest, create participant
        if (!isLoggedIn && guestName && guestEmail) {
          await api.createParticipant(train.id, {
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
          });
        }

        toast.success('Successfully signed up for this meal!');
      }

      // Refresh the page to show updated data
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Error signing up for meal:', error);
      toast.error(error.message || 'Failed to sign up for meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign Up for Meal"
      description={`${format(selectedDate, 'EEEE, MMMM d, yyyy')}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`px-4 py-2 rounded-md border-2 font-medium transition-colors capitalize ${mealType === type
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Description */}
        <Input
          label="What will you bring?"
          placeholder="e.g., Lasagna with salad and garlic bread"
          value={mealDescription}
          onChange={(e) => setMealDescription(e.target.value)}
          required
        />

        {/* Additional Notes */}
        <Textarea
          label="Additional Notes (Optional)"
          placeholder="Any special preparations, delivery time, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* Guest Information (if not logged in) */}
        {!isLoggedIn && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Please provide your contact information so the coordinator can reach you.
            </p>

            <Input
              label="Your Name"
              placeholder="John Doe"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="(555) 123-4567"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
          </div>
        )}

        {/* Dietary Info Reminder */}
        {(train.dietaryPreferences || train.allergies) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Please Remember:
            </h4>
            {train.dietaryPreferences && (
              <p className="text-sm text-yellow-800 mb-1">
                <strong>Dietary Preferences:</strong> {train.dietaryPreferences}
              </p>
            )}
            {train.allergies && (
              <p className="text-sm text-yellow-800">
                <strong>Allergies:</strong> {train.allergies}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Sign Up
          </Button>
        </div>
      </form>
    </Modal>
  );
}
