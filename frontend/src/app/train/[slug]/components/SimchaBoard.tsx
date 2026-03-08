'use client';

import { ChesedTrain } from '@/types';
import { SimchaBoard as SharedSimchaBoard } from '@/components/chesed/SimchaBoard';

interface SimchaBoardProps {
  train: ChesedTrain;
  onAddContribution?: () => void;
}

export default function SimchaBoard({ train, onAddContribution }: SimchaBoardProps) {
  return (
    <SharedSimchaBoard
      contributions={train.simchaContributions || []}
      onAddContribution={onAddContribution}
      eventTitle={train.title}
      eventDate={train.startDate}
    />
  );
}
