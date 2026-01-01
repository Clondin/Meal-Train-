'use client';

import { ChesedTrain, SimchaContribution, SIMCHA_CATEGORY_LABELS, MEAL_CATEGORY_LABELS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SimchaBoardProps {
    train: ChesedTrain;
    onAddContribution?: () => void;
}

export default function SimchaBoard({ train, onAddContribution }: SimchaBoardProps) {
    const contributions = train.simchaContributions || [];

    // Group contributions by category
    const groupedContributions = contributions.reduce((acc, cont) => {
        const cat = cont.itemCategory;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(cont);
        return acc;
    }, {} as Record<string, SimchaContribution[]>);

    const categories = Object.keys(SIMCHA_CATEGORY_LABELS);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Contribution List</h2>
                    <p className="text-sm text-gray-500">
                        See what others are bringing and add your own item to avoid duplicates.
                    </p>
                </div>
                {onAddContribution && (
                    <button
                        onClick={onAddContribution}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <span>+ Add Item</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((catKey) => {
                    const items = groupedContributions[catKey] || [];
                    const label = SIMCHA_CATEGORY_LABELS[catKey as keyof typeof SIMCHA_CATEGORY_LABELS];

                    return (
                        <Card key={catKey} className={cn(
                            "p-5 flex flex-col h-full border-t-4",
                            items.length > 0 ? "border-t-primary-500" : "border-t-gray-200"
                        )}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">{label}</h3>
                                <Badge variant={items.length > 0 ? "info" : "neutral"}>
                                    {items.length} {items.length === 1 ? 'item' : 'items'}
                                </Badge>
                            </div>

                            <div className="flex-grow space-y-4">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {item.itemDescription}
                                                </span>
                                                {item.mealCategory && (
                                                    <Badge size="sm" variant={item.mealCategory === 'FLEISHIG' ? 'error' : item.mealCategory === 'MILCHIG' ? 'info' : 'success'} className="text-[10px]">
                                                        {item.mealCategory.charAt(0)}
                                                    </Badge>
                                                )}
                                            </div>

                                            {item.quantity && (
                                                <div className="text-xs text-gray-600 font-medium">
                                                    Qty: {item.quantity}
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="w-5 h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center text-[10px]">
                                                    👤
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                    {item.user?.name || item.guestName || 'Anonymous'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                        <span className="text-2xl mb-2 opacity-30">🍽️</span>
                                        <span className="text-xs text-gray-400">No items yet</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
