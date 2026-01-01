'use client';

import { useState, useMemo } from 'react';
import { ChesedTrain, TaskSlot, TaskType, TASK_TYPE_LABELS, isMealTask } from '@/types';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isBefore,
    startOfToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isSameMonth,
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import DateSignupModal from './DateSignupModal';
import { cn } from '@/lib/utils';

interface TaskSlotCalendarProps {
    train: ChesedTrain;
}

export default function TaskSlotCalendar({ train }: TaskSlotCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const today = startOfToday();

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // Get all slots for a specific day
    const getSlotsForDay = (day: Date): TaskSlot[] => {
        return (train.taskSlots || []).filter((slot) =>
            isSameDay(new Date(slot.date), day)
        );
    };

    // Handle date click
    const handleDateClick = (day: Date) => {
        const isPast = isBefore(day, today);
        if (!isPast) {
            setSelectedDate(day);
            setIsModalOpen(true);
        }
    };

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={previousMonth}
                        className="hover:bg-white hover:shadow-sm h-9 w-9 p-0 rounded-lg"
                    >
                        ←
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date())}
                        className="hover:bg-white hover:shadow-sm px-4 h-9 rounded-lg font-bold text-xs"
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextMonth}
                        className="hover:bg-white hover:shadow-sm h-9 w-9 p-0 rounded-lg"
                    >
                        →
                    </Button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Filled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Partially Filled</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                            key={day}
                            className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 divide-x divide-y divide-gray-50 border-r border-b border-gray-100">
                    {calendarDays.map((day, idx) => {
                        const slots = getSlotsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, today);
                        const isPast = isBefore(day, today);
                        const isClickable = !isPast;

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    'min-h-[120px] p-2 transition-all duration-200 group relative',
                                    !isCurrentMonth && 'bg-gray-50/30',
                                    isClickable && 'cursor-pointer hover:bg-primary-50/30',
                                    isToday && 'bg-blue-50/20'
                                )}
                                onClick={() => isClickable && handleDateClick(day)}
                            >
                                <div
                                    className={cn(
                                        'text-sm font-black mb-2 flex items-center justify-between',
                                        !isCurrentMonth && 'text-gray-300',
                                        isCurrentMonth && 'text-gray-900',
                                        isToday && 'text-blue-600'
                                    )}
                                >
                                    <span>{format(day, 'd')}</span>
                                    {isToday && (
                                        <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase">Today</span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {slots.map((slot) => {
                                        const isFilled = slot.status === 'FILLED';
                                        const isPartial = slot.status === 'PARTIALLY_FILLED';
                                        const isMeal = isMealTask(slot.taskType);

                                        return (
                                            <div
                                                key={slot.id}
                                                className={cn(
                                                    "px-2 py-1 rounded-md text-[10px] font-bold truncate transition-colors",
                                                    isFilled
                                                        ? "bg-blue-100 text-blue-700"
                                                        : isPartial
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-green-100 text-green-700 border border-green-200",
                                                    isPast && "grayscale opacity-50"
                                                )}
                                            >
                                                <span className="mr-1">{isMeal ? '🍱' : '🤝'}</span>
                                                {TASK_TYPE_LABELS[slot.taskType].replace('MEAL_', '')}
                                                {isFilled && slot.contributions && slot.contributions.length > 0 && (
                                                    <span className="ml-1 opacity-60 font-normal">
                                                        • {slot.contributions[0].user?.firstName || slot.contributions[0].guestName}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {isClickable && slots.length === 0 && isCurrentMonth && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-primary-500 font-bold uppercase text-center mt-4">
                                            + Add Slot
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Slot List */}
            <div className="lg:hidden space-y-4">
                <h4 className="font-bold text-gray-900 border-b pb-2">Schedule for {format(currentMonth, 'MMMM')}</h4>
                <div className="space-y-3">
                    {calendarDays
                        .filter(day => isSameMonth(day, currentMonth) && !isBefore(day, today))
                        .map(day => {
                            const slots = getSlotsForDay(day);
                            if (slots.length === 0) return null;

                            return (
                                <div key={day.toISOString()} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="font-black text-gray-900 mb-2 border-b border-gray-50 pb-2">
                                        {format(day, 'EEEE, MMM do')}
                                    </div>
                                    <div className="space-y-2">
                                        {slots.map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => {
                                                    setSelectedDate(day);
                                                    setIsModalOpen(true);
                                                }}
                                                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{isMealTask(slot.taskType) ? '🍱' : '🤝'}</span>
                                                    <div className="text-left">
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {TASK_TYPE_LABELS[slot.taskType]}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 font-medium">
                                                            {slot.startTime ? `${slot.startTime} - ${slot.endTime || '...'}` : 'Anytime'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant={slot.status === 'AVAILABLE' ? 'success' : slot.status === 'FILLED' ? 'info' : 'warning'}>
                                                    {slot.status}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Signup Modal */}
            {selectedDate && (
                <DateSignupModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDate(null);
                    }}
                    train={train}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
}
