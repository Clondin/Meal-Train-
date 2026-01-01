'use client';

import React from 'react';
import { MealCategory, MEAL_CATEGORY_LABELS } from '@/types';

interface KosherMetadataFormProps {
    // Current values
    mealCategory?: MealCategory;
    isCholovYisroel?: boolean;
    isPasYisroel?: boolean;
    isYoshon?: boolean;
    isGlatt?: boolean;
    allergyInfo?: string;

    // onChange handlers
    onMealCategoryChange: (category: MealCategory) => void;
    onCholovYisroelChange: (checked: boolean) => void;
    onPasYisroelChange: (checked: boolean) => void;
    onYoshonChange: (checked: boolean) => void;
    onGlattChange: (checked: boolean) => void;
    onAllergyInfoChange?: (info: string) => void;

    // Configuration
    requireMealCategory?: boolean;
    showKashrusOptions?: boolean;
    showAllergyField?: boolean;
    disabled?: boolean;
    errors?: {
        mealCategory?: string;
        kashrus?: string;
    };
}

export function KosherMetadataForm({
    mealCategory,
    isCholovYisroel = false,
    isPasYisroel = false,
    isYoshon = false,
    isGlatt = true,
    allergyInfo = '',
    onMealCategoryChange,
    onCholovYisroelChange,
    onPasYisroelChange,
    onYoshonChange,
    onGlattChange,
    onAllergyInfoChange,
    requireMealCategory = true,
    showKashrusOptions = true,
    showAllergyField = true,
    disabled = false,
    errors,
}: KosherMetadataFormProps) {
    const categoryOptions: { value: MealCategory; label: string; icon: string; color: string }[] = [
        { value: 'MILCHIG', label: MEAL_CATEGORY_LABELS.MILCHIG, icon: '🧀', color: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100' },
        { value: 'FLEISHIG', label: MEAL_CATEGORY_LABELS.FLEISHIG, icon: '🥩', color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100' },
        { value: 'PAREVE', label: MEAL_CATEGORY_LABELS.PAREVE, icon: '🥗', color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Meal Category Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Meal Type {requireMealCategory && <span className="text-red-500">*</span>}
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {categoryOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onMealCategoryChange(option.value)}
                            disabled={disabled}
                            className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                ${mealCategory === option.value
                                    ? `${option.color} border-current ring-2 ring-offset-2 ring-current`
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            <span className="text-2xl mb-1">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                            {mealCategory === option.value && (
                                <div className="absolute top-2 right-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                {errors?.mealCategory && (
                    <p className="mt-2 text-sm text-red-600">{errors.mealCategory}</p>
                )}
            </div>

            {/* Kashrus Certifications */}
            {showKashrusOptions && (
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Kashrus Certifications
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isCholovYisroel}
                                onChange={(e) => onCholovYisroelChange(e.target.checked)}
                                disabled={disabled}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🥛</span>
                                <span className="font-medium text-gray-800">Cholov Yisroel</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPasYisroel}
                                onChange={(e) => onPasYisroelChange(e.target.checked)}
                                disabled={disabled}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🍞</span>
                                <span className="font-medium text-gray-800">Pas Yisroel</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isYoshon}
                                onChange={(e) => onYoshonChange(e.target.checked)}
                                disabled={disabled}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🌾</span>
                                <span className="font-medium text-gray-800">Yoshon</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isGlatt}
                                onChange={(e) => onGlattChange(e.target.checked)}
                                disabled={disabled}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🥩</span>
                                <span className="font-medium text-gray-800">Glatt Kosher</span>
                            </div>
                        </label>
                    </div>
                    {errors?.kashrus && (
                        <p className="mt-2 text-sm text-red-600">{errors.kashrus}</p>
                    )}
                </div>
            )}

            {/* Allergy Information */}
            {showAllergyField && onAllergyInfoChange && (
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Allergy Information
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-lg">⚠️</span>
                        <textarea
                            value={allergyInfo}
                            onChange={(e) => onAllergyInfoChange(e.target.value)}
                            disabled={disabled}
                            placeholder="List any allergens in your food (e.g., contains nuts, dairy, gluten...)"
                            rows={2}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Please note if your food contains common allergens like nuts, dairy, gluten, eggs, etc.
                    </p>
                </div>
            )}
        </div>
    );
}

export default KosherMetadataForm;
