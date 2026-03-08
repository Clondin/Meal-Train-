import { ChesedTrain } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

interface TrainHeroProps {
  train: ChesedTrain;
}

export default function TrainHero({ train }: TrainHeroProps) {
  // Calculate stats
  const totalMealDates = train.taskSlots?.length || 0;
  const claimedMeals = train.taskSlots?.filter(
    (date) => date.status === 'FILLED' || date.status === 'PARTIALLY_FILLED'
  ).length || 0;
  const deliveredMeals = train.contributions?.filter(
    (contribution) => contribution.deliveryStatus === 'DELIVERED'
  ).length || 0;

  const totalDonations = train.donations?.reduce(
    (sum, donation) => sum + (donation.status === 'COMPLETED' ? Number(donation.amount) : 0),
    0
  ) || 0;

  const totalGiftCards = train.giftCards?.filter(
    (card) => card.status === 'COMPLETED'
  ).length || 0;

  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      {/* Cover Image with Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl">
          {/* Category Badge */}
          <div className="mb-4">
            <Badge variant="info" size="md" className="bg-white/20 text-white border-white/30">
              Chesed Train
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            {train.recipientName}
          </h1>

          {/* Date Range */}
          <p className="text-lg lg:text-xl text-blue-100 mb-6">
            {format(new Date(train.startDate), 'MMMM d, yyyy')} -{' '}
            {format(new Date(train.endDate), 'MMMM d, yyyy')}
          </p>

          {/* Description */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-blue-50 leading-relaxed whitespace-pre-wrap">
              {train.description}
            </p>
          </div>

          {/* Important Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {train.householdSize && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-sm text-blue-100 mb-1">Household Size</div>
                <div className="text-lg font-semibold">
                  {train.householdSize} {train.householdSize === 1 ? 'person' : 'people'}
                </div>
              </div>
            )}

            {train.defaultDeliveryTime && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-sm text-blue-100 mb-1">Default Delivery Time</div>
                <div className="text-lg font-semibold">{train.defaultDeliveryTime}</div>
              </div>
            )}
          </div>

          {/* Dietary Preferences & Allergies */}
          {(train.dietaryPreferences || train.allergies) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              {train.dietaryPreferences && (
                <div className="mb-3">
                  <div className="text-sm text-blue-100 mb-1">Dietary Preferences</div>
                  <div className="text-base">{train.dietaryPreferences}</div>
                </div>
              )}
              {train.allergies && (
                <div>
                  <div className="text-sm text-blue-100 mb-1">Allergies</div>
                  <div className="text-base text-yellow-200 font-medium">
                    ⚠️ {train.allergies}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Instructions */}
          {train.deliveryInstructions && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-100 mb-1">Delivery Instructions</div>
              <p className="text-base whitespace-pre-wrap">{train.deliveryInstructions}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">{claimedMeals}/{totalMealDates}</div>
              <div className="text-sm text-blue-100">Meals Scheduled</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">{deliveredMeals}</div>
              <div className="text-sm text-blue-100">Meals Delivered</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">${totalDonations.toFixed(0)}</div>
              <div className="text-sm text-blue-100">Donated</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">{totalGiftCards}</div>
              <div className="text-sm text-blue-100">Gift Cards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
