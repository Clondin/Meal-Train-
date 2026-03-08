'use client';

import { DeliveryStatus } from '@/types';
import { DeliveryStatusTracker as SharedDeliveryStatusTracker } from '@/components/chesed/DeliveryStatusTracker';

interface DeliveryStatusTrackerProps {
  currentStatus: DeliveryStatus;
  onStatusUpdate: (status: DeliveryStatus) => Promise<void>;
  isReadOnly?: boolean;
}

export default function DeliveryStatusTracker({
  currentStatus,
  onStatusUpdate,
  isReadOnly = false,
}: DeliveryStatusTrackerProps) {
  return (
    <SharedDeliveryStatusTracker
      currentStatus={currentStatus}
      onStatusChange={(status) => {
        void onStatusUpdate(status);
      }}
      isContributor={!isReadOnly}
    />
  );
}
