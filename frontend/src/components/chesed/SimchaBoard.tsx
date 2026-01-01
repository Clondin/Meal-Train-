'use client';

import React, { useState } from 'react';
import {
    SimchaContribution,
    SimchaItemCategory,
    MealCategory,
    SIMCHA_CATEGORY_LABELS,
    MEAL_CATEGORY_LABELS
} from '@/types';

interface SimchaBoardProps {
    contributions: SimchaContribution[];
    onAddContribution?: () => void;
    onEditContribution?: (contribution: SimchaContribution) => void;
    onDeleteContribution?: (contributionId: string) => void;
    currentUserId?: string;
    isOrganizer?: boolean;
    eventTitle?: string;
    eventDate?: string;
}

interface CategoryGroup {
    category: SimchaItemCategory;
    contributions: SimchaContribution[];
}

const CATEGORY_ICONS: Record<SimchaItemCategory, string> = {
    APPETIZER: '🥙',
    MAIN_DISH: '🍖',
    SIDE_DISH: '🥗',
    SALAD: '🥬',
    SOUP: '🍲',
    KUGEL: '🥧',
    CHALLAH_BREAD: '🍞',
    DESSERT: '🍰',
    DRINKS: '🥤',
    SNACKS: '🍪',
    PAPER_GOODS: '🧻',
    OTHER: '📦',
};

const CATEGORY_ORDER: SimchaItemCategory[] = [
    'APPETIZER',
    'MAIN_DISH',
    'SIDE_DISH',
    'SALAD',
    'SOUP',
    'KUGEL',
    'CHALLAH_BREAD',
    'DESSERT',
    'DRINKS',
    'SNACKS',
    'PAPER_GOODS',
    'OTHER',
];

export function SimchaBoard({
    contributions,
    onAddContribution,
    onEditContribution,
    onDeleteContribution,
    currentUserId,
    isOrganizer = false,
    eventTitle = 'Simcha',
    eventDate,
}: SimchaBoardProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Group contributions by category
    const groupedContributions: CategoryGroup[] = CATEGORY_ORDER.map(category => ({
        category,
        contributions: contributions.filter(c => c.itemCategory === category),
    })).filter(group => group.contributions.length > 0);

    // Calculate totals
    const totalContributions = contributions.length;
    const totalServings = contributions.reduce((sum, c) => sum + (c.servings || 0), 0);
    const uniqueContributors = new Set(
        contributions.map(c => c.userId || c.guestPhone || c.guestEmail || c.guestName)
    ).size;

    const getMealCategoryBadge = (mealCategory?: MealCategory) => {
        if (!mealCategory) return null;
        const colors = {
            MILCHIG: 'bg-blue-100 text-blue-700',
            FLEISHIG: 'bg-red-100 text-red-700',
            PAREVE: 'bg-green-100 text-green-700',
        };
        return (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[mealCategory]}`}>
                {MEAL_CATEGORY_LABELS[mealCategory]}
            </span>
        );
    };

    const renderContributionCard = (contribution: SimchaContribution) => {
        const isOwner = currentUserId && contribution.userId === currentUserId;
        const icon = CATEGORY_ICONS[contribution.itemCategory];

        return (
            <div
                key={contribution.id}
                className={`
          bg-white rounded-xl border border-gray-200 p-4 transition-all duration-200
          ${isOwner ? 'ring-2 ring-blue-200' : ''}
          hover:shadow-md
        `}
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                            {contribution.itemDescription}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            {contribution.quantity && (
                                <span className="text-sm text-gray-600">{contribution.quantity}</span>
                            )}
                            {contribution.servings && (
                                <span className="text-sm text-gray-500">
                                    (~{contribution.servings} servings)
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {getMealCategoryBadge(contribution.mealCategory)}
                            {contribution.isCholovYisroel && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">CY</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            👤
                        </div>
                        <span className="text-sm text-gray-600 truncate">
                            {contribution.user?.firstName || contribution.guestName || 'Anonymous'}
                        </span>
                    </div>

                    {(isOwner || isOrganizer) && (
                        <div className="flex items-center gap-1">
                            {onEditContribution && (
                                <button
                                    onClick={() => onEditContribution(contribution)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            )}
                            {onDeleteContribution && (
                                <button
                                    onClick={() => onDeleteContribution(contribution.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{eventTitle}</h2>
                        {eventDate && (
                            <p className="text-white/80">{eventDate}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">{totalContributions}</p>
                        <p className="text-sm text-white/80">contributions</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{uniqueContributors}</p>
                        <p className="text-xs text-white/80">contributors</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{totalServings || '—'}</p>
                        <p className="text-xs text-white/80">~servings</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{groupedContributions.length}</p>
                        <p className="text-xs text-white/80">categories</p>
                    </div>
                </div>
            </div>

            {/* Add contribution button */}
            {onAddContribution && (
                <button
                    onClick={onAddContribution}
                    className="w-full py-4 bg-white border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-medium hover:bg-purple-50 hover:border-purple-400 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="text-xl">➕</span>
                    <span>Add What You're Bringing</span>
                </button>
            )}

            {/* View toggle */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">What's Being Brought</h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Contributions by category */}
            {contributions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <span className="text-4xl mb-3 block">🍽️</span>
                    <p className="text-gray-600">No contributions yet</p>
                    <p className="text-sm text-gray-500">Be the first to add what you're bringing!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedContributions.map(group => (
                        <div key={group.category}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{CATEGORY_ICONS[group.category]}</span>
                                <h4 className="font-medium text-gray-900">{SIMCHA_CATEGORY_LABELS[group.category]}</h4>
                                <span className="text-sm text-gray-500">({group.contributions.length})</span>
                            </div>

                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}>
                                {group.contributions.map(contribution => renderContributionCard(contribution))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Duplication warning */}
            {contributions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div>
                            <p className="font-medium text-yellow-800">Avoid duplicates!</p>
                            <p className="text-yellow-700">
                                Check the list above before adding your contribution to prevent multiple people bringing the same thing.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SimchaBoard;
