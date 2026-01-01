'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChesedTrain } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface GiftCardSectionProps {
  train: ChesedTrain;
}

// Popular gift card retailers
const RETAILERS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'target', label: 'Target' },
  { value: 'walmart', label: 'Walmart' },
  { value: 'whole-foods', label: 'Whole Foods' },
  { value: 'instacart', label: 'Instacart' },
  { value: 'uber-eats', label: 'Uber Eats' },
  { value: 'doordash', label: 'DoorDash' },
  { value: 'grubhub', label: 'Grubhub' },
  { value: 'kroger', label: 'Kroger' },
  { value: 'safeway', label: 'Safeway' },
  { value: 'other', label: 'Other' },
];

export default function GiftCardSection({ train }: GiftCardSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get gift cards
  const giftCards = train.giftCards || [];
  const sentGiftCards = giftCards.filter((card) => card.status === 'COMPLETED');

  const recentGiftCards = sentGiftCards
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Info Section */}
      <Card>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Send a Gift Card
          </h3>
          <p className="text-gray-600 mb-4">
            Gift cards are a great way to give the recipient flexibility in choosing their own meals or groceries.
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            Send Gift Card
          </Button>
        </div>
      </Card>

      {/* Available Retailers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Popular Retailers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {RETAILERS.slice(0, -1).map((retailer) => (
            <div
              key={retailer.value}
              className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="font-medium text-gray-900">{retailer.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Gift Cards */}
      {recentGiftCards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Gift Cards ({sentGiftCards.length})
          </h3>
          <div className="space-y-3">
            {recentGiftCards.map((giftCard) => (
              <Card key={giftCard.id} padding="md" hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {giftCard.purchaserName}
                      </h4>
                      <Badge variant="success">${giftCard.amount.toFixed(2)}</Badge>
                      <Badge variant="info" className="capitalize">
                        {giftCard.vendor.replace('-', ' ')}
                      </Badge>
                    </div>
                    {giftCard.message && (
                      <p className="text-sm text-gray-600 italic mb-2">
                        "{giftCard.message}"
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-gray-500">
                        {format(new Date(giftCard.createdAt), 'MMMM d, yyyy')}
                      </p>
                      <Badge
                        variant={giftCard.status === 'COMPLETED' ? 'success' : 'info'}
                        size="sm"
                      >
                        {giftCard.status === 'COMPLETED' ? 'Delivered' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sentGiftCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No gift cards yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to send a gift card!
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            Send Gift Card
          </Button>
        </div>
      )}

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        train={train}
      />
    </div>
  );
}

// Gift Card Form Modal
function GiftCardModal({
  isOpen,
  onClose,
  train,
}: {
  isOpen: boolean;
  onClose: () => void;
  train: ChesedTrain;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [retailer, setRetailer] = useState('amazon');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const giftCardAmount = parseFloat(amount);
      if (isNaN(giftCardAmount) || giftCardAmount <= 0) {
        toast.error('Please enter a valid amount.');
        return;
      }

      const code = [cardNumber, pin].filter(Boolean).join(' / ') || undefined;

      await api.createGiftCard(train.id, {
        vendor: retailer,
        amount: giftCardAmount,
        code,
        purchaserName: donorName,
        purchaserEmail: donorEmail,
        message,
      });

      toast.success('Gift card sent successfully!');
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Error creating gift card:', error);
      toast.error(error.message || 'Failed to send gift card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send a Gift Card"
      description="Send a gift card to help the recipient"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Retailer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retailer
          </label>
          <select
            value={retailer}
            onChange={(e) => setRetailer(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {RETAILERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <Input
            label="Gift Card Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            step="0.01"
            leftIcon={<span className="text-gray-600">$</span>}
          />
          <div className="mt-2 flex gap-2">
            {[25, 50, 100, 250].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Card Number */}
        <Input
          label="Gift Card Number (Optional)"
          placeholder="Enter gift card number if already purchased"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />

        {/* PIN */}
        <Input
          label="PIN (Optional)"
          placeholder="Enter PIN if applicable"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        {/* Donor Name */}
        <Input
          label="Your Name"
          placeholder="John Doe"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
        />

        {/* Donor Email */}
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          required
        />

        {/* Message */}
        <Textarea
          label="Message (Optional)"
          placeholder="Leave a message of support..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> If you haven't purchased the gift card yet, you can submit this form
            and add the card details later. The coordinator will receive your information and follow up.
          </p>
        </div>

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
            Send Gift Card
          </Button>
        </div>
      </form>
    </Modal>
  );
}
