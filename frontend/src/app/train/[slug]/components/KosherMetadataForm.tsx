'use client';

import { MealCategory, MEAL_CATEGORY_LABELS, ChesedTrain } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface KosherMetadataFormProps {
    train: ChesedTrain;
    selectedCategory: MealCategory | undefined;
    onCategoryChange: (category: MealCategory) => void;
    kashrusSettings: {
        isCholovYisroel: boolean;
        isPasYisroel: boolean;
        isYoshon: boolean;
        isGlatt: boolean;
    };
    onKashrusChange: (settings: {
        isCholovYisroel: boolean;
        isPasYisroel: boolean;
        isYoshon: boolean;
        isGlatt: boolean;
    }) => void;
}

export default function KosherMetadataForm({
    train,
    selectedCategory,
    onCategoryChange,
    kashrusSettings,
    onKashrusChange,
}: KosherMetadataFormProps) {
    const toggleKashrus = (key: keyof typeof kashrusSettings) => {
        onKashrusChange({
            ...kashrusSettings,
            [key]: !kashrusSettings[key],
        });
    };

    return (
        <div className="space-y-6">
            {/* Meal Category Selection */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 block">
                    Meal Type
                </label>
                <div className="flex flex-wrap gap-3">
                    {(['MILCHIG', 'FLEISHIG', 'PAREVE'] as MealCategory[]).map((cat) => {
                        // Check if the train accepts this category
                        const isSupported =
                            (cat === 'MILCHIG' && train.acceptsMilchig) ||
                            (cat === 'FLEISHIG' && train.acceptsFleishig) ||
                            (cat === 'PAREVE' && train.acceptsPareve);

                        if (!isSupported) return null;

                        const isSelected = selectedCategory === cat;

                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => onCategoryChange(cat)}
                                className={cn(
                                    'px-4 py-2 rounded-full border-2 text-sm font-bold transition-all duration-200',
                                    isSelected
                                        ? 'border-primary-600 bg-primary-600 text-white shadow-md transform scale-105'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                )}
                            >
                                {MEAL_CATEGORY_LABELS[cat]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Kashrus Requirement Checkboxes */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                    Kashrus Certifications
                    <span className="ml-1 text-xs font-normal text-gray-500">(Confirm your meal meets these standards)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <KashrusCheckbox
                        label="Cholov Yisroel"
                        checked={kashrusSettings.isCholovYisroel}
                        onChange={() => toggleKashrus('isCholovYisroel')}
                        required={train.requireCholovYisroel}
                    />
                    <KashrusCheckbox
                        label="Pas Yisroel"
                        checked={kashrusSettings.isPasYisroel}
                        onChange={() => toggleKashrus('isPasYisroel')}
                        required={train.requirePasYisroel}
                    />
                    <KashrusCheckbox
                        label="Yoshon"
                        checked={kashrusSettings.isYoshon}
                        onChange={() => toggleKashrus('isYoshon')}
                        required={train.requireYoshon}
                    />
                    <KashrusCheckbox
                        label="Glatt"
                        checked={kashrusSettings.isGlatt}
                        onChange={() => toggleKashrus('isGlatt')}
                        required={train.requireGlatt}
                    />
                </div>
            </div>

            {/* Allergy Warning if train has specific allergies */}
            {(train.allergyNuts || train.allergyDairy || train.allergyGluten || train.allergyEggs || train.allergyFish || train.allergyShellfish || train.allergySoy || train.allergyOther) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-2">
                        <span className="text-amber-500">⚠️</span>
                        <div className="text-xs text-amber-800">
                            <span className="font-bold">Important:</span> This family has the following allergies:
                            <div className="mt-1 flex flex-wrap gap-1">
                                {train.allergyNuts && <Badge variant="warning" size="sm">Nuts</Badge>}
                                {train.allergyDairy && <Badge variant="warning" size="sm">Dairy</Badge>}
                                {train.allergyGluten && <Badge variant="warning" size="sm">Gluten</Badge>}
                                {train.allergyEggs && <Badge variant="warning" size="sm">Eggs</Badge>}
                                {train.allergyFish && <Badge variant="warning" size="sm">Fish</Badge>}
                                {train.allergyShellfish && <Badge variant="warning" size="sm">Shellfish</Badge>}
                                {train.allergySoy && <Badge variant="warning" size="sm">Soy</Badge>}
                                {train.allergyOther && <span className="text-amber-900 italic">{train.allergyOther}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function KashrusCheckbox({
    label,
    checked,
    onChange,
    required,
}: {
    label: string;
    checked: boolean;
    onChange: () => void;
    required: boolean;
}) {
    return (
        <label className={cn(
            "flex items-center gap-3 cursor-pointer group",
            required && !checked && "opacity-80"
        )}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={onChange}
                />
                <div className={cn(
                    "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
                    checked
                        ? "bg-primary-600 border-primary-600"
                        : "bg-white border-gray-300 group-hover:border-primary-400"
                )}>
                    {checked && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
            <div className="flex flex-col">
                <span className={cn(
                    "text-sm font-medium",
                    checked ? "text-gray-900" : "text-gray-600"
                )}>
                    {label}
                </span>
                {required && !checked && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Required</span>
                )}
            </div>
        </label>
    );
}
