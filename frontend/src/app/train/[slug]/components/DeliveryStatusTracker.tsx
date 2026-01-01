'use client';

import { DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DeliveryStatusTrackerProps {
    currentStatus: DeliveryStatus;
    onStatusUpdate: (status: DeliveryStatus) => Promise<void>;
    isReadOnly?: boolean;
}

const statusOrder: DeliveryStatus[] = [
    'NOT_STARTED',
    'PREPARING',
    'LEAVING_NOW',
    'EN_ROUTE',
    'ARRIVING_SOON',
    'DELIVERED',
];

const statusIcons: Record<DeliveryStatus, string> = {
    NOT_STARTED: '🏠',
    PREPARING: '🍳',
    LEAVING_NOW: '🚗',
    EN_ROUTE: '🛣️',
    ARRIVING_SOON: '🔔',
    DELIVERED: '✅',
};

export default function DeliveryStatusTracker({
    currentStatus,
    onStatusUpdate,
    isReadOnly = false,
}: DeliveryStatusTrackerProps) {
    const [loadingStatus, setLoadingStatus] = useState<DeliveryStatus | null>(null);

    const handleUpdate = async (status: DeliveryStatus) => {
        if (isReadOnly || status === currentStatus) return;

        setLoadingStatus(status);
        try {
            await onStatusUpdate(status);
        } finally {
            setLoadingStatus(null);
        }
    };

    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">{statusIcons[currentStatus]}</div>
                <div className="text-lg font-bold text-gray-900">
                    {DELIVERY_STATUS_LABELS[currentStatus]}
                </div>
            </div>

            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />

                {/* Progress Bar Active */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
                />

                {/* Status Steps */}
                <div className="relative flex justify-between items-center px-1">
                    {statusOrder.map((status, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const isPast = index < currentIndex;

                        return (
                            <div key={status} className="flex flex-col items-center">
                                <button
                                    type="button"
                                    disabled={isReadOnly || loadingStatus !== null}
                                    onClick={() => handleUpdate(status)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10",
                                        isCompleted
                                            ? "bg-white border-primary-500 text-primary-600 shadow-sm"
                                            : "bg-white border-gray-200 text-gray-400 hover:border-primary-300",
                                        isCurrent && "ring-4 ring-primary-100 scale-110",
                                        loadingStatus === status && "animate-pulse"
                                    )}
                                >
                                    <span className="text-sm font-bold">
                                        {isPast ? '✓' : index + 1}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            {!isReadOnly && (
                <div className="grid grid-cols-2 gap-3 mt-8">
                    {currentIndex < statusOrder.length - 1 && (
                        <Button
                            className="w-full"
                            onClick={() => handleUpdate(statusOrder[currentIndex + 1])}
                            loading={loadingStatus === statusOrder[currentIndex + 1]}
                        >
                            Next Step: {DELIVERY_STATUS_LABELS[statusOrder[currentIndex + 1]]}
                        </Button>
                    )}
                    {currentStatus === 'DELIVERED' ? (
                        <div className="col-span-2 p-3 bg-green-50 border border-green-200 rounded-xl text-center text-green-800 font-medium">
                            Meal successfully delivered! Thank you for your chesed.
                        </div>
                    ) : (
                        currentIndex > 0 && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleUpdate(statusOrder[currentIndex - 1])}
                                disabled={loadingStatus !== null}
                            >
                                Back to {DELIVERY_STATUS_LABELS[statusOrder[currentIndex - 1]]}
                            </Button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
