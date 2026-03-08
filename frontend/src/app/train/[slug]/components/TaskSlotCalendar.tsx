'use client';

import { useState } from 'react';
import { ChesedTrain } from '@/types';
import { TaskSlotCalendar as SharedTaskSlotCalendar } from '@/components/chesed/TaskSlotCalendar';
import DateSignupModal from './DateSignupModal';

interface TaskSlotCalendarProps {
  train: ChesedTrain;
}

export default function TaskSlotCalendar({ train }: TaskSlotCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <>
      <SharedTaskSlotCalendar
        taskSlots={train.taskSlots || []}
        startDate={new Date(train.startDate)}
        endDate={new Date(train.endDate)}
        onDateClick={setSelectedDate}
        selectedDate={selectedDate || undefined}
        showNonMealTasks={train.allowNonMealTasks}
      />

      {selectedDate && (
        <DateSignupModal
          isOpen={Boolean(selectedDate)}
          onClose={() => setSelectedDate(null)}
          train={train}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
}
