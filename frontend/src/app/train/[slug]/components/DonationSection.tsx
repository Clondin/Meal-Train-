'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChesedTrain, Donation } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface DonationSectionProps {
  train: ChesedTrain;
}

export default function DonationSection({ train }: DonationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate totals
  const completedDonations = train.donations?.filter(
    (donation) => donation.status === 'COMPLETED'
  ) || [];

  const totalDonations = completedDonations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  const recentDonations = completedDonations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Donation Stats */}
      <Card>
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ${totalDonations.toFixed(2)}
          </div>
          <p className="text-gray-600 mb-4">
            Raised from {completedDonations.length} donation{completedDonations.length !== 1 ? 's' : ''}
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            Make a Donation
          </Button>
        </div>
      </Card>

      {/* Recent Donations */}
      {recentDonations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Donations
          </h3>
          <div className="space-y-3">
            {recentDonations.map((donation) => (
              <Card key={donation.id} padding="md" hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {donation.donorName}
                      </h4>
                      <Badge variant="success">${donation.amount.toFixed(2)}</Badge>
                    </div>
                    {donation.message && (
                      <p className="text-sm text-gray-600 italic">
                        "{donation.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(donation.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {completedDonations.length === 0 && (
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No donations yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to support this chesed train!
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            Make a Donation
          </Button>
        </div>
      )}

      {/* Donation Modal */}
      <Elements stripe={stripePromise}>
        <DonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          train={train}
        />
      </Elements>
    </div>
  );
}

// Donation Form Component with Stripe
function DonationModal({
  isOpen,
  onClose,
  train,
}: {
  isOpen: boolean;
  onClose: () => void;
  train: ChesedTrain;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found. Please refresh and try again.');
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount.');
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const { clientSecret } = await api.createDonationPaymentIntent(
        train.id,
        donationAmount
      );

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorName,
            email: donorEmail,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create donation record
        await api.createDonation(train.id, {
          donorName,
          donorEmail,
          amount: donationAmount,
          message,
        });

        toast.success('Thank you for your donation!');
        router.refresh();
        onClose();
      }
    } catch (error: any) {
      console.error('Error processing donation:', error);
      toast.error(error.message || 'Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Make a Donation"
      description="Support this chesed train with a monetary donation"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <Input
            label="Donation Amount"
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

        {/* Card Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
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
          <Button type="submit" isLoading={isLoading} disabled={!stripe}>
            Donate ${amount || '0.00'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
