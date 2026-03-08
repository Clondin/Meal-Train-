import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GuestSignupPage from '@/app/guest-signup/page';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'returnUrl' ? '/train/demo' : null),
  }),
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
    createGuestSession: jest.fn(),
    verifyGuestSession: jest.fn(),
  },
  api: {
    createGuestSession: jest.fn(),
    verifyGuestSession: jest.fn(),
  },
}));

describe('GuestSignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const api = jest.requireMock('@/lib/api').api;
    api.createGuestSession.mockResolvedValue({ id: 'session-1', verified: false });
    api.verifyGuestSession.mockResolvedValue({
      id: 'session-1',
      identifier: 'guest@example.com',
      identifierType: 'email',
      verified: true,
      expiresAt: '2026-03-08T12:00:00.000Z',
      createdAt: '2026-03-08T11:45:00.000Z',
    });
  });

  it('requests and verifies a guest session before redirecting back', async () => {
    render(<GuestSignupPage />);

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'guest@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send Verification Code' }));

    await waitFor(() => {
      const api = jest.requireMock('@/lib/api').api;
      expect(api.createGuestSession).toHaveBeenCalledWith({
        identifier: 'guest@example.com',
        identifierType: 'email',
      });
    });

    fireEvent.change(screen.getByLabelText('Verification Code'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Continue' }));

    await waitFor(() => {
      const api = jest.requireMock('@/lib/api').api;
      expect(api.verifyGuestSession).toHaveBeenCalledWith({
        identifier: 'guest@example.com',
        identifierType: 'email',
        verificationCode: '123456',
      });
    });

    expect(window.localStorage.getItem('guest-session')).toContain('guest@example.com');
    const toast = jest.requireMock('react-hot-toast').default;
    expect(toast.success).toHaveBeenCalledWith('Successfully verified!');
    expect(push).toHaveBeenCalledWith('/train/demo');
  });
});
