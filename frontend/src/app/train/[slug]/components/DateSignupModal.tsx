'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChesedTrain, TaskSlot, TaskType, MealCategory, MealComponent, CreateContributionData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import SplitMealSignup from './SplitMealSignup';
import KosherMetadataForm from './KosherMetadataForm';

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
  const [activeSlot, setActiveSlot] = useState<TaskSlot | null>(null);

  // Form state
  const [mealCategory, setMealCategory] = useState<MealCategory | undefined>(undefined);
  const [mealComponent, setMealComponent] = useState<MealComponent>('FULL_MEAL');
  const [itemDescription, setItemDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [kashrusSettings, setKashrusSettings] = useState({
    isCholovYisroel: false,
    isPasYisroel: false,
    isYoshon: false,
    isGlatt: true,
  });

  // Find slot for selected date
  useEffect(() => {
    const slots = (train.taskSlots || []).filter(slot =>
      format(new Date(slot.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
    // For now, just pick the first available or first slot
    if (slots.length > 0) {
      setActiveSlot(slots[0]);
    } else {
      setActiveSlot(null);
    }
  }, [selectedDate, train.taskSlots]);

  // Auth check
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth-token');
    }
    return false;
  };

  const isLoggedIn = checkAuthStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let slotId = activeSlot?.id;

      // If no slot exists, create one (default dinner)
      if (!slotId) {
        const newSlot = await api.post<TaskSlot>(`/chesed-trains/${train.id}/task-slots`, {
          date: selectedDate.toISOString(),
          taskType: 'MEAL_DINNER',
        });
        slotId = newSlot.data.id;
      }

      // Prepare contribution data
      const contributionData: any = {
        slotId,
        mealComponent,
        mealCategory,
        itemDescription,
        notes,
        ...kashrusSettings,
      };

      if (!isLoggedIn) {
        contributionData.guestName = guestName;
        contributionData.guestEmail = guestEmail;
        contributionData.guestPhone = guestPhone;
      }

      // Create contribution
      await api.post(`/chesed-trains/${train.id}/contributions`, contributionData);

      toast.success('Successfully signed up!');
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeSlot ? `Sign Up: ${format(selectedDate, 'MMM d')}` : "Choose a Task"}
      description={activeSlot ? `${activeSlot.taskType.replace('MEAL_', '').replace('_', ' ')}` : "Select what you can do"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Split Meal Selection (if allowed) */}
        {activeSlot?.allowSplit && (
          <SplitMealSignup
            selectedComponent={mealComponent}
            onSelect={setMealComponent}
            availableComponents={[
              'FULL_MEAL', 'PROTEIN_MAIN', 'SIDES', 'SALAD', 'SOUP', 'DESSERT', 'DRINKS', 'BREAD_CHALLAH'
            ]}
            disabledComponents={
              activeSlot.contributions
                ?.filter(c => c.status === 'CONFIRMED')
                .map(c => c.mealComponent) || []
            }
          />
        )}

        {/* Kosher Metadata */}
        <KosherMetadataForm
          train={train}
          selectedCategory={mealCategory}
          onCategoryChange={setMealCategory}
          kashrusSettings={kashrusSettings}
          onKashrusChange={setKashrusSettings}
        />

        {/* Item Description */}
        <Input
          label="What are you bringing/doing?"
          placeholder="e.g., Baked Ziti with Caesar Salad"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          required
        />

        {/* Additional Notes */}
        <Textarea
          label="Notes for the family"
          placeholder="e.g., I'll drop this off by 5:30 PM on the porch."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* Guest Information */}
        {!isLoggedIn && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Your Contact Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <Input
              label="Phone (Optional)"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="rounded-xl font-bold px-8 shadow-lg shadow-primary-200"
          >
            Confirm Signup
          </Button>
        </div>
      </form>
    </Modal>
  );
}
