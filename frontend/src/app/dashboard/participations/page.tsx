'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isPast, isFuture, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { CalendarIcon, MapPinIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Badge, Card, CardBody, Modal, Spinner } from '@/components/ui';
import { api } from '@/lib/api';

interface Participation {
  id: string;
  trainId: string;
  dateId: string;
  mealDescription: string;
  notes: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  train: {
    id: string;
    slug: string;
    title: string;
    recipientName: string;
    recipientAddress: string;
    recipientCity: string;
    recipientState: string;
  };
  date: {
    id: string;
    date: string;
    deliveryTime: string;
  };
}

export default function ParticipationsPage() {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<Participation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      const response = await api.get<{ participations: Participation[] }>('/users/participations');
      setParticipations(response.data.participations);
    } catch (error) {
      toast.error('Failed to load participations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;

    setIsCancelling(true);
    try {
      await api.delete(`/participants/${cancelModal.id}`);
      toast.success('Participation cancelled');
      setParticipations(participations.filter(p => p.id !== cancelModal.id));
      setCancelModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelled</Badge>;
      case 'NO_SHOW':
        return <Badge variant="error">No Show</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const upcoming = participations.filter(
    p => p.status !== 'CANCELLED' && isFuture(new Date(p.date.date))
  );
  const past = participations.filter(
    p => p.status !== 'CANCELLED' && isPast(new Date(p.date.date)) && !isToday(new Date(p.date.date))
  );
  const cancelled = participations.filter(p => p.status === 'CANCELLED');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Participations</h1>
        <p className="text-gray-600 mt-1">
          Meal trains you've signed up to help with
        </p>
      </div>

      {participations.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No participations yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't signed up for any meal trains yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Find a Meal Train
            </Link>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Upcoming Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Deliveries ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8">
                  <p className="text-gray-600">No upcoming deliveries</p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcoming.map((participation) => (
                  <Card key={participation.id} hover>
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Link
                              href={`/train/${participation.train.slug}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {participation.train.title}
                            </Link>
                            {getStatusBadge(participation.status)}
                          </div>
                          <p className="text-gray-600 mb-3">
                            For: {participation.train.recipientName}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(participation.date.date), 'EEEE, MMMM d, yyyy')}
                              {isToday(new Date(participation.date.date)) && (
                                <Badge variant="warning" className="ml-2">Today</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {participation.date.deliveryTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              {participation.train.recipientAddress}, {participation.train.recipientCity}, {participation.train.recipientState}
                            </div>
                          </div>
                          {participation.mealDescription && (
                            <p className="mt-3 text-sm">
                              <strong>Your meal:</strong> {participation.mealDescription}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/train/${participation.train.slug}`}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          >
                            View Train
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelModal(participation)}
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Section */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Past Deliveries ({past.length})
              </h2>
              <div className="space-y-4">
                {past.map((participation) => (
                  <Card key={participation.id}>
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 opacity-75">
                          <div className="flex items-center gap-2 mb-2">
                            <Link
                              href={`/train/${participation.train.slug}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {participation.train.title}
                            </Link>
                            <Badge variant="success">Delivered</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">
                            For: {participation.train.recipientName}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(participation.date.date), 'MMMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Section */}
          {cancelled.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-500 mb-4">
                Cancelled ({cancelled.length})
              </h2>
              <div className="space-y-4">
                {cancelled.map((participation) => (
                  <Card key={participation.id}>
                    <CardBody>
                      <div className="opacity-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {participation.train.title}
                          </span>
                          <Badge variant="error">Cancelled</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(participation.date.date), 'MMMM d, yyyy')}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Participation"
        size="md"
      >
        {cancelModal && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel your participation in{' '}
              <strong>{cancelModal.train.title}</strong> on{' '}
              {format(new Date(cancelModal.date.date), 'MMMM d, yyyy')}?
            </p>
            <p className="text-sm text-gray-500">
              This will free up the date for another volunteer to sign up.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCancelModal(null)}>
                Keep Participation
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
                isLoading={isCancelling}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
