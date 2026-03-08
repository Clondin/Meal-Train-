'use client';

import { MealComponent } from '@/types';
import { SplitMealSignup as SharedSplitMealSignup } from '@/components/chesed/SplitMealSignup';

interface SplitMealSignupProps {
  selectedComponent: MealComponent;
  onSelect: (component: MealComponent) => void;
  availableComponents: MealComponent[];
  disabledComponents?: MealComponent[];
}

export default function SplitMealSignup({
  selectedComponent,
  onSelect,
  availableComponents,
  disabledComponents = [],
}: SplitMealSignupProps) {
  return (
    <SharedSplitMealSignup
      selectedComponent={selectedComponent}
      onComponentChange={onSelect}
      allowSplit={true}
      claimedComponents={disabledComponents}
      showFullMealOption={availableComponents.includes('FULL_MEAL')}
    />
  );
}
