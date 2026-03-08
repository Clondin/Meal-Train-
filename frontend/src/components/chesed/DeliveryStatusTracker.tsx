'use client';

import React from 'react';
import { DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';

interface DeliveryStatusTrackerProps {
    currentStatus: DeliveryStatus;
    onStatusChange?: (status: DeliveryStatus) => void;
    estimatedArrival?: string;
    onEstimatedArrivalChange?: (time: string) => void;
    isContributor?: boolean; // If true, show editable controls
    disabled?: boolean;
    compact?: boolean; // Compact view for list items
}

interface StatusStep {
    status: DeliveryStatus;
    label: string;
    icon: string;
    color: string;
    activeColor: string;
}

const STATUS_STEPS: StatusStep[] = [
    { status: 'NOT_STARTED', label: 'Not Started', icon: '⏳', color: 'bg-gray-200', activeColor: 'bg-gray-500' },
    { status: 'PREPARING', label: 'Preparing', icon: '👨‍🍳', color: 'bg-yellow-200', activeColor: 'bg-yellow-500' },
    { status: 'LEAVING_NOW', label: 'Leaving Now', icon: '🚗', color: 'bg-primary-200', activeColor: 'bg-primary-500' },
    { status: 'EN_ROUTE', label: 'On the Way', icon: '🛣️', color: 'bg-indigo-200', activeColor: 'bg-indigo-500' },
    { status: 'ARRIVING_SOON', label: 'Arriving Soon', icon: '📍', color: 'bg-purple-200', activeColor: 'bg-purple-500' },
    { status: 'DELIVERED', label: 'Delivered', icon: '✅', color: 'bg-green-200', activeColor: 'bg-green-500' },
];

const getStatusIndex = (status: DeliveryStatus) => {
    return STATUS_STEPS.findIndex(s => s.status === status);
};

export function DeliveryStatusTracker({
    currentStatus,
    onStatusChange,
    estimatedArrival,
    onEstimatedArrivalChange,
    isContributor = false,
    disabled = false,
    compact = false,
}: DeliveryStatusTrackerProps) {
    const currentIndex = getStatusIndex(currentStatus);
    const currentStep = STATUS_STEPS[currentIndex];

    // Compact view for list items
    if (compact) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${currentStep.color}`}>
                <span>{currentStep.icon}</span>
                <span>{currentStep.label}</span>
            </div>
        );
    }

    // Contributor quick action buttons
    if (isContributor && onStatusChange) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-900">
                        Update Delivery Status
                    </label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStep.color}`}>
                        {currentStep.icon} {currentStep.label}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="relative">
                    <div className="flex items-center justify-between">
                        {STATUS_STEPS.map((step, index) => {
                            const isComplete = index <= currentIndex;
                            const isCurrent = index === currentIndex;

                            return (
                                <div key={step.status} className="flex flex-col items-center relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => onStatusChange(step.status)}
                                        disabled={disabled}
                                        className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-200
                      ${isComplete ? step.activeColor : 'bg-gray-200'}
                      ${isCurrent ? 'ring-4 ring-offset-2 ring-primary-200 scale-110' : ''}
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    `}
                                    >
                                        {step.icon}
                                    </button>
                                    <span className={`text-xs mt-1 ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress line */}
                    <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-0">
                        <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {currentIndex < STATUS_STEPS.length - 1 && (
                        <button
                            type="button"
                            onClick={() => onStatusChange(STATUS_STEPS[currentIndex + 1].status)}
                            disabled={disabled}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            <span>{STATUS_STEPS[currentIndex + 1].icon}</span>
                            <span>Mark as {STATUS_STEPS[currentIndex + 1].label}</span>
                        </button>
                    )}

                    {currentIndex === STATUS_STEPS.length - 1 && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-xl font-medium">
                            <span>✅</span>
                            <span>Delivery Complete!</span>
                        </div>
                    )}
                </div>

                {/* Estimated arrival (only show for en-route statuses) */}
                {['EN_ROUTE', 'ARRIVING_SOON'].includes(currentStatus) && onEstimatedArrivalChange && (
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Arrival Time
                        </label>
                        <input
                            type="time"
                            value={estimatedArrival || ''}
                            onChange={(e) => onEstimatedArrivalChange(e.target.value)}
                            disabled={disabled}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                )}
            </div>
        );
    }

    // Recipient view (read-only)
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Delivery Status</span>
                {estimatedArrival && ['EN_ROUTE', 'ARRIVING_SOON'].includes(currentStatus) && (
                    <span className="text-sm text-gray-600">
                        ETA: {estimatedArrival}
                    </span>
                )}
            </div>

            {/* Status indicator */}
            <div className={`flex items-center gap-3 p-4 rounded-xl ${currentStep.color}`}>
                <span className="text-3xl">{currentStep.icon}</span>
                <div>
                    <p className="font-semibold text-gray-900">{currentStep.label}</p>
                    <p className="text-sm text-gray-600">
                        {currentStatus === 'NOT_STARTED' && "Your meal hasn't started preparation yet"}
                        {currentStatus === 'PREPARING' && "Your meal is being prepared"}
                        {currentStatus === 'LEAVING_NOW' && "Your meal is leaving now"}
                        {currentStatus === 'EN_ROUTE' && "Your meal is on the way"}
                        {currentStatus === 'ARRIVING_SOON' && "Your meal is almost there!"}
                        {currentStatus === 'DELIVERED' && "Your meal has been delivered"}
                    </p>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
                {STATUS_STEPS.map((step, index) => (
                    <div
                        key={step.status}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${index <= currentIndex ? step.activeColor : 'bg-gray-200'
                            } ${index === currentIndex ? 'scale-125' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default DeliveryStatusTracker;
