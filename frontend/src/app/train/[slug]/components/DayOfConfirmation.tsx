'use client';

import { Contribution, MealCategory, MEAL_CATEGORY_LABELS } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DayOfConfirmationProps {
    contribution: Contribution;
    onConfirm: (category: MealCategory) => Promise<void>;
}

export default function DayOfConfirmation({
    contribution,
    onConfirm,
}: DayOfConfirmationProps) {
    const [selectedCategory, setSelectedCategory] = useState<MealCategory | null>(
        contribution.mealCategory || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!selectedCategory) return;
        setIsSubmitting(true);
        try {
            await onConfirm(selectedCategory);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-6 border-2 border-primary-100 shadow-xl max-w-md mx-auto">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                    🍱
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                    Confirm Your Meal Type
                </h3>
                <p className="text-sm text-gray-600">
                    Hi {contribution.user?.firstName || contribution.guestName}! Just a quick check for today's delivery to help the family prepare. What kind of meal are you bringing?
                </p>

                <div className="grid grid-cols-3 gap-2 py-4">
                    {(['MILCHIG', 'FLEISHIG', 'PAREVE'] as MealCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all",
                                selectedCategory === cat
                                    ? "border-primary-600 bg-primary-50 text-primary-700"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                            )}
                        >
                            {MEAL_CATEGORY_LABELS[cat].split(' ')[0]}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <Button
                        className="w-full h-12 text-lg"
                        disabled={!selectedCategory || isSubmitting}
                        onClick={handleConfirm}
                        loading={isSubmitting}
                    >
                        Confirm & Send Update
                    </Button>
                    <p className="text-[10px] text-gray-400">
                        This notifies the recipient family so they can coordinate other meals.
                    </p>
                </div>
            </div>
        </Card>
    );
}
