'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { TaskSlot, TaskType, SlotStatus, TASK_TYPE_LABELS, isMealTask, isShabbosTask } from '@/types';

interface TaskSlotCalendarProps {
    taskSlots: TaskSlot[];
    startDate: Date;
    endDate: Date;
    onSlotClick?: (slot: TaskSlot) => void;
    onDateClick?: (date: Date) => void;
    onAddSlot?: (date: Date, taskType: TaskType) => void;
    selectedDate?: Date;
    showNonMealTasks?: boolean;
    isOrganizer?: boolean;
}

interface DaySlotGroup {
    date: Date;
    slots: TaskSlot[];
    mealSlots: TaskSlot[];
    taskSlots: TaskSlot[];
}

const TASK_TYPE_ICONS: Record<TaskType, string> = {
    MEAL_BREAKFAST: '🌅',
    MEAL_LUNCH: '☀️',
    MEAL_DINNER: '🌙',
    MEAL_SHABBOS_FRIDAY_NIGHT: '🕯️',
    MEAL_SHABBOS_DAY: '✨',
    MEAL_SEUDAH_SHLISHIS: '🌅',
    BABYSITTING: '👶',
    HOSPITAL_VISIT: '🏥',
    RIDES: '🚗',
    GROCERY_RUN: '🛒',
    ERRANDS: '📋',
    LAUNDRY: '🧺',
    HOUSEHOLD_HELP: '🏠',
    DOG_WALKING: '🐕',
    CHILDCARE_PICKUP: '🎒',
    OTHER_TASK: '📌',
};

const SLOT_STATUS_COLORS: Record<SlotStatus, { bg: string; border: string; text: string }> = {
    AVAILABLE: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    PARTIALLY_FILLED: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    FILLED: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    CLOSED: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500' },
    CANCELLED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-500' },
};

export function TaskSlotCalendar({
    taskSlots,
    startDate,
    endDate,
    onSlotClick,
    onDateClick,
    onAddSlot,
    selectedDate,
    showNonMealTasks = true,
    isOrganizer = false,
}: TaskSlotCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(startDate));

    // Group slots by date
    const slotsByDate = useMemo(() => {
        const groups: Record<string, DaySlotGroup> = {};

        taskSlots.forEach(slot => {
            const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: new Date(slot.date),
                    slots: [],
                    mealSlots: [],
                    taskSlots: [],
                };
            }
            groups[dateKey].slots.push(slot);
            if (isMealTask(slot.taskType)) {
                groups[dateKey].mealSlots.push(slot);
            } else {
                groups[dateKey].taskSlots.push(slot);
            }
        });

        return groups;
    }, [taskSlots]);

    // Get days in current month view
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day of week offset
    const startDayOfWeek = monthStart.getDay();

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const renderSlotIndicator = (slot: TaskSlot) => {
        const colors = SLOT_STATUS_COLORS[slot.status];
        const icon = TASK_TYPE_ICONS[slot.taskType];
        const isShabbos = isShabbosTask(slot.taskType);

        return (
            <button
                key={slot.id}
                onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick?.(slot);
                }}
                className={`
          flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium truncate w-full
          ${colors.bg} ${colors.border} ${colors.text} border
          ${isShabbos ? 'ring-1 ring-purple-300' : ''}
          hover:opacity-80 transition-opacity
        `}
                title={`${TASK_TYPE_LABELS[slot.taskType]} - ${slot.status}`}
            >
                <span>{icon}</span>
                <span className="truncate">{TASK_TYPE_LABELS[slot.taskType]}</span>
            </button>
        );
    };

    const renderDay = (date: Date, index: number) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = slotsByDate[dateKey];
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isPast = isBefore(date, startOfDay(new Date()));
        const isInRange = date >= startDate && date <= endDate;
        const today = isToday(date);

        // Filter slots based on showNonMealTasks
        const visibleSlots = dayData?.slots.filter(slot =>
            showNonMealTasks || isMealTask(slot.taskType)
        ) || [];

        return (
            <div
                key={dateKey}
                onClick={() => !isPast && isInRange && onDateClick?.(date)}
                className={`
          min-h-[100px] p-1 border border-gray-100 transition-colors
          ${isPast ? 'bg-gray-50 text-gray-400' : 'bg-white'}
          ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
          ${today ? 'bg-blue-50/50' : ''}
          ${!isPast && isInRange ? 'cursor-pointer hover:bg-gray-50' : ''}
          ${!isInRange ? 'opacity-40' : ''}
        `}
            >
                {/* Day number */}
                <div className={`
          text-sm font-medium mb-1 flex items-center justify-between
          ${today ? 'text-blue-600' : 'text-gray-700'}
        `}>
                    <span className={`
            w-6 h-6 flex items-center justify-center rounded-full
            ${today ? 'bg-blue-600 text-white' : ''}
          `}>
                        {format(date, 'd')}
                    </span>
                    {dayData?.slots.length > 0 && (
                        <span className="text-xs text-gray-400">
                            {dayData.slots.length} slot{dayData.slots.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Slot indicators */}
                <div className="space-y-1">
                    {visibleSlots.slice(0, 3).map(slot => renderSlotIndicator(slot))}
                    {visibleSlots.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                            +{visibleSlots.length - 3} more
                        </div>
                    )}
                </div>

                {/* Add slot button for organizers */}
                {isOrganizer && !isPast && isInRange && visibleSlots.length === 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddSlot?.(date, 'MEAL_DINNER');
                        }}
                        className="w-full mt-1 p-1 text-xs text-gray-400 border border-dashed border-gray-200 rounded hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        + Add
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h2 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>

                <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div
                        key={day}
                        className={`
              py-2 text-center text-sm font-medium
              ${i === 6 ? 'bg-purple-50 text-purple-700' : 'text-gray-600'}
            `}
                    >
                        {day}
                        {i === 5 && <span className="ml-1 text-xs">🕯️</span>}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {/* Empty cells for start offset */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 border border-gray-100" />
                ))}

                {/* Day cells */}
                {daysInMonth.map((date, index) => renderDay(date, index))}
            </div>

            {/* Legend */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-medium text-gray-700">Status:</span>
                    {Object.entries(SLOT_STATUS_COLORS).map(([status, colors]) => (
                        <div key={status} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
                            <span className="text-gray-600">{status.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TaskSlotCalendar;
