'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Badge, Button, Card, CardBody, Modal, Spinner } from '@/components/ui';
import { api } from '@/lib/api';
import { Contribution, ThankYouNote } from '@/types';

const formatTaskLabel = (contribution: Contribution) => {
  const slot = contribution.slot;
  if (!slot) return 'Contribution';

  if (slot.taskTitle) return slot.taskTitle;

  return slot.taskType
    .replace(/^MEAL_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusBadge = (status: Contribution['status']) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="success">Confirmed</Badge>;
    case 'PENDING':
      return <Badge variant="warning">Pending Approval</Badge>;
    case 'CANCELLED':
      return <Badge variant="error">Cancelled</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'NO_SHOW':
      return <Badge variant="error">No Show</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

const getDeliveryBadge = (deliveryStatus: Contribution['deliveryStatus']) => (
  <Badge variant={deliveryStatus === 'DELIVERED' ? 'success' : 'info'}>
    {deliveryStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}
  </Badge>
);

function ThankYouList({ notes }: { notes: ThankYouNote[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-900">Thank-you notes</p>
      <div className="mt-3 space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg bg-white/80 p-3">
            <p className="text-sm text-gray-700">{note.message}</p>
            <p className="mt-2 text-xs text-gray-500">
              Sent {format(new Date(note.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ParticipationsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<Contribution | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchParticipations = async () => {
      try {
        const response = await api.getUserParticipations();
        setContributions(response.contributions);
      } catch {
        toast.error('Failed to load participations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipations();
  }, []);

  const handleCancel = async () => {
    if (!cancelModal || !cancelModal.train) return;

    setIsCancelling(true);
    try {
      const updated = await api.cancelContribution(cancelModal.train.id, cancelModal.id);
      setContributions((current) =>
        current.map((contribution) =>
          contribution.id === updated.id ? { ...contribution, ...updated } : contribution
        )
      );
      toast.success('Participation cancelled');
      setCancelModal(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  const { upcoming, past, cancelled } = useMemo(() => {
    const grouped = {
      upcoming: [] as Contribution[],
      past: [] as Contribution[],
      cancelled: [] as Contribution[],
    };

    contributions.forEach((contribution) => {
      if (!contribution.slot) return;

      const slotDate = new Date(contribution.slot.date);
      if (contribution.status === 'CANCELLED') {
        grouped.cancelled.push(contribution);
      } else if (isPast(slotDate) && !isToday(slotDate)) {
        grouped.past.push(contribution);
      } else {
        grouped.upcoming.push(contribution);
      }
    });

    return grouped;
  }, [contributions]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Participations</h1>
          <p className="mt-1 text-gray-600">Tasks and meals you&apos;ve committed to deliver</p>
        </div>

        <Card>
          <CardBody className="py-12 text-center">
            <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No participations yet</h3>
            <p className="mb-4 text-gray-600">You haven&apos;t signed up for any trains yet.</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Find a Chesed Train
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  const renderContribution = (
    contribution: Contribution,
    options: { hideCancel?: boolean; dimmed?: boolean } = {}
  ) => {
    if (!contribution.slot || !contribution.train) return null;

    const slotDate = new Date(contribution.slot.date);
    const address = [
      contribution.train.recipientAddress,
      contribution.train.recipientCity,
      contribution.train.recipientState,
      contribution.train.recipientZip,
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <Card key={contribution.id} hover={!options.hideCancel} className={options.dimmed ? 'opacity-60' : undefined}>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Link
                  href={`/train/${contribution.train.slug}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                >
                  {contribution.train.title}
                </Link>
                {getStatusBadge(contribution.status)}
                {getDeliveryBadge(contribution.deliveryStatus)}
              </div>

              <p className="text-gray-600">For: {contribution.train.recipientName}</p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {formatTaskLabel(contribution)}
                {contribution.itemDescription ? ` • ${contribution.itemDescription}` : ''}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {format(slotDate, 'EEEE, MMMM d, yyyy')}
                  {isToday(slotDate) && <Badge variant="warning" className="ml-2">Today</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {contribution.slot.startTime || contribution.slot.endTime
                    ? [contribution.slot.startTime, contribution.slot.endTime].filter(Boolean).join(' - ')
                    : 'Flexible'}
                </div>
                {address && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {address}
                  </div>
                )}
              </div>

              {contribution.notes && (
                <p className="mt-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Notes:</span> {contribution.notes}
                </p>
              )}

              <ThankYouList notes={contribution.thankYouNotes || []} />
            </div>

            <div className="flex gap-2">
              <Link
                href={`/train/${contribution.train.slug}`}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                View Train
              </Link>
              {!options.hideCancel && contribution.status !== 'CANCELLED' && (
                <Button variant="ghost" size="sm" onClick={() => setCancelModal(contribution)}>
                  <XMarkIcon className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Participations</h1>
        <p className="mt-1 text-gray-600">Tasks and meals you&apos;ve committed to deliver</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Upcoming Deliveries ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardBody className="py-8 text-center text-gray-600">
              No upcoming deliveries
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">{upcoming.map((contribution) => renderContribution(contribution))}</div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Past Deliveries ({past.length})</h2>
          <div className="space-y-4">
            {past.map((contribution) => renderContribution(contribution, { hideCancel: true }))}
          </div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-500">Cancelled ({cancelled.length})</h2>
          <div className="space-y-4">
            {cancelled.map((contribution) =>
              renderContribution(contribution, { hideCancel: true, dimmed: true })
            )}
          </div>
        </section>
      )}

      <Modal
        isOpen={Boolean(cancelModal)}
        onClose={() => !isCancelling && setCancelModal(null)}
        title="Cancel participation"
        actions={
          <>
            <Button variant="outline" onClick={() => setCancelModal(null)} disabled={isCancelling}>
              Keep it
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              Cancel participation
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          This will release your slot so someone else can claim it.
        </p>
      </Modal>
    </div>
  );
}
