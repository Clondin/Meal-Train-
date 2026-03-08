'use client';

import React from 'react';
import { MealComponent, MEAL_COMPONENT_LABELS } from '@/types';

interface SplitMealSignupProps {
    selectedComponent: MealComponent;
    onComponentChange: (component: MealComponent) => void;
    allowSplit: boolean;
    claimedComponents?: MealComponent[];
    disabled?: boolean;
    showFullMealOption?: boolean;
}

interface ComponentOption {
    value: MealComponent;
    label: string;
    icon: string;
    description: string;
}

const COMPONENT_OPTIONS: ComponentOption[] = [
    { value: 'FULL_MEAL', label: 'Full Meal', icon: '🍽️', description: 'Complete meal for the family' },
    { value: 'PROTEIN_MAIN', label: 'Protein/Main', icon: '🍖', description: 'Main protein or entrée' },
    { value: 'SIDES', label: 'Sides', icon: '🥔', description: 'Side dishes' },
    { value: 'SALAD', label: 'Salad', icon: '🥗', description: 'Fresh salad' },
    { value: 'SOUP', label: 'Soup', icon: '🍲', description: 'Soup course' },
    { value: 'KUGEL', label: 'Kugel', icon: '🥧', description: 'Kugel or casserole' },
    { value: 'BREAD_CHALLAH', label: 'Challah/Bread', icon: '🍞', description: 'Fresh challah or bread' },
    { value: 'APPETIZER', label: 'Appetizer', icon: '🥙', description: 'Appetizer or starter' },
    { value: 'DESSERT', label: 'Dessert', icon: '🍰', description: 'Dessert or sweets' },
    { value: 'DRINKS', label: 'Drinks', icon: '🥤', description: 'Beverages' },
    { value: 'OTHER', label: 'Other', icon: '📦', description: 'Other contribution' },
];

export function SplitMealSignup({
    selectedComponent,
    onComponentChange,
    allowSplit,
    claimedComponents = [],
    disabled = false,
    showFullMealOption = true,
}: SplitMealSignupProps) {
    // Filter options based on whether split is allowed
    const availableOptions = allowSplit
        ? COMPONENT_OPTIONS.filter(opt => showFullMealOption || opt.value !== 'FULL_MEAL')
        : COMPONENT_OPTIONS.filter(opt => opt.value === 'FULL_MEAL');

    const isComponentClaimed = (component: MealComponent) => {
        return claimedComponents.includes(component) && component !== selectedComponent;
    };

    if (!allowSplit) {
        // If split not allowed, just show simple full meal selection
        return (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🍽️</span>
                    <div>
                        <p className="font-semibold text-primary-900">Full Meal</p>
                        <p className="text-sm text-primary-700">You're signing up to provide a complete meal</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                    What would you like to bring?
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Split meal enabled
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableOptions.map((option) => {
                    const isClaimed = isComponentClaimed(option.value);
                    const isSelected = selectedComponent === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !isClaimed && onComponentChange(option.value)}
                            disabled={disabled || isClaimed}
                            className={`
                relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                                    ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200'
                                    : isClaimed
                                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-xl">{option.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                                        {option.label}
                                    </p>
                                    <p className={`text-xs truncate ${isSelected ? 'text-primary-700' : 'text-gray-500'}`}>
                                        {option.description}
                                    </p>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}

                            {isClaimed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl">
                                    <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
                                        Already claimed
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 border-primary-500 bg-primary-50"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 border-gray-200 bg-gray-100"></div>
                    <span>Already claimed</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 border-gray-200 bg-white"></div>
                    <span>Available</span>
                </div>
            </div>
        </div>
    );
}

export default SplitMealSignup;
