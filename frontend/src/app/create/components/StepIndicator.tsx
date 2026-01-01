'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  name: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'relative flex flex-col items-center',
              index !== steps.length - 1 ? 'flex-1' : ''
            )}
          >
            {/* Connector line */}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 w-full h-0.5 -z-10',
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                )}
                aria-hidden="true"
              />
            )}

            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors bg-white',
                  currentStep > step.id &&
                    'border-blue-600 bg-blue-600 text-white',
                  currentStep === step.id &&
                    'border-blue-600 text-blue-600',
                  currentStep < step.id &&
                    'border-gray-300 text-gray-500'
                )}
              >
                {currentStep > step.id ? (
                  // Checkmark icon for completed steps
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center whitespace-nowrap',
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
