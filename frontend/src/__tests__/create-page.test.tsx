import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateChesedTrainPage from '@/app/create/page';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    createChesedTrain: jest.fn(),
  },
  api: {
    createChesedTrain: jest.fn(),
  },
}));

describe('CreateChesedTrainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const api = jest.requireMock('@/lib/api').default;
    api.createChesedTrain.mockResolvedValue({ slug: 'johnsons' });
  });

  it('submits the completed wizard payload and redirects to the train page', async () => {
    render(<CreateChesedTrainPage />);

    fireEvent.change(screen.getByLabelText('Recipient Name'), {
      target: { value: 'Johnson Family' },
    });
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Lakewood' },
    });
    fireEvent.change(screen.getByLabelText('State'), {
      target: { value: 'NJ' },
    });
    fireEvent.change(screen.getByLabelText('Zip Code'), {
      target: { value: '08701' },
    });
    fireEvent.change(screen.getByLabelText('Story / Description'), {
      target: { value: 'Helping after a new baby.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.change(await screen.findByLabelText('Chesed Train Title'), {
      target: { value: 'Meals for the Johnson Family' },
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-03-10' },
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2026-03-14' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Food Preferences');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Donations & Settings');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Privacy & Settings');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Create Chesed Train' }));

    await waitFor(() => {
      const api = jest.requireMock('@/lib/api').default;
      expect(api.createChesedTrain).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Meals for the Johnson Family',
          recipientName: 'Johnson Family',
          recipientAddress: '123 Main St',
          recipientCity: 'Lakewood',
          recipientState: 'NJ',
          recipientZip: '08701',
          description: 'Helping after a new baby.',
          startDate: '2026-03-10',
          endDate: '2026-03-14',
          trainType: 'STANDARD',
          allowDonations: false,
          allowGiftCards: false,
          isPublic: true,
        })
      );
    });

    const toast = jest.requireMock('react-hot-toast').default;
    expect(toast.success).toHaveBeenCalledWith('Chesed Train created successfully!');
    expect(push).toHaveBeenCalledWith('/train/johnsons');
  });
});
