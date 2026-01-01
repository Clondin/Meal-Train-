'use client';

import { MealComponent, MEAL_COMPONENT_LABELS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface SplitMealSignupProps {
    selectedComponent: MealComponent;
    onSelect: (component: MealComponent) => void;
    availableComponents: MealComponent[];
    disabledComponents?: MealComponent[];
}

export default function SplitMealSignup({
    selectedComponent,
    onSelect,
    availableComponents,
    disabledComponents = [],
}: SplitMealSignupProps) {
    return (
        <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700">
                Which part of the meal can you provide?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableComponents.map((component) => {
                    const isDisabled = disabledComponents.includes(component);
                    const isSelected = selectedComponent === component;

                    return (
                        <button
                            key={component}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onSelect(component)}
                            className={cn(
                                'relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left',
                                isSelected
                                    ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600 ring-opacity-20'
                                    : 'border-gray-100 hover:border-gray-200 bg-white',
                                isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100'
                            )}
                        >
                            <div className="flex flex-col">
                                <span className={cn(
                                    'text-sm font-bold',
                                    isSelected ? 'text-primary-900' : 'text-gray-900'
                                )}>
                                    {MEAL_COMPONENT_LABELS[component]}
                                </span>
                                {isDisabled && (
                                    <span className="text-xs text-red-500 font-medium mt-1">
                                        Already filled
                                    </span>
                                )}
                            </div>
                            <div className={cn(
                                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                                isSelected
                                    ? 'bg-primary-600 border-primary-600'
                                    : 'border-gray-300'
                            )}>
                                {isSelected && (
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
