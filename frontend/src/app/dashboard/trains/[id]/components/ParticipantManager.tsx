'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Badge, Button, Card, Input, Modal, Textarea } from '@/components/ui';
import { Contribution, TaskSlot } from '@/types';

interface ParticipantManagerProps {
  trainId: string;
  participants: Contribution[];
  dates: TaskSlot[];
  onUpdate: () => void;
}

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

const getContributorName = (contribution: Contribution) =>
  contribution.guestName ||
  [contribution.user?.firstName, contribution.user?.lastName].filter(Boolean).join(' ') ||
  contribution.user?.email ||
  'Anonymous';

const getContributorEmail = (contribution: Contribution) =>
  contribution.guestEmail || contribution.user?.email || '';

const getContributorPhone = (contribution: Contribution) =>
  contribution.guestPhone || contribution.user?.phone || '';

const getStatusVariant = (status: Contribution['status']) => {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return 'success' as const;
    case 'PENDING':
      return 'warning' as const;
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'error' as const;
    default:
      return 'neutral' as const;
  }
};

export default function ParticipantManager({
  trainId,
  participants,
  dates,
  onUpdate,
}: ParticipantManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [isSubmittingThanks, setIsSubmittingThanks] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const stats = useMemo(() => {
    const completed = participants.filter((participant) => participant.deliveryStatus === 'DELIVERED').length;
    const upcoming = participants.filter((participant) => {
      if (!participant.slot) return false;
      return participant.status !== 'CANCELLED' && new Date(participant.slot.date) >= new Date();
    }).length;

    return {
      total: participants.length,
      completed,
      upcoming,
      openSlots: dates.filter((slot) => slot.status === 'AVAILABLE').length,
    };
  }, [dates, participants]);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery) return participants;

    const query = searchQuery.toLowerCase();
    return participants.filter((participant) => {
      const haystack = [
        getContributorName(participant),
        getContributorEmail(participant),
        getContributorPhone(participant),
        formatTaskLabel(participant),
        participant.itemDescription || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [participants, searchQuery]);

  const resetThankYouModal = () => {
    setSelectedContribution(null);
    setThankYouMessage('');
  };

  const handleExportCSV = () => {
    const headers = ['Contributor', 'Email', 'Phone', 'Task', 'Date', 'Status', 'Delivery', 'Thank You Notes'];
    const rows = filteredParticipants.map((participant) => [
      getContributorName(participant),
      getContributorEmail(participant),
      getContributorPhone(participant),
      formatTaskLabel(participant),
      participant.slot ? format(new Date(participant.slot.date), 'yyyy-MM-dd') : '',
      participant.status,
      participant.deliveryStatus,
      String(participant.thankYouNotes?.length || 0),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contributors-${trainId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendThanks = async () => {
    if (!selectedContribution || !thankYouMessage.trim()) return;

    setIsSubmittingThanks(true);
    try {
      await api.createThankYouNote(trainId, {
        contributionId: selectedContribution.id,
        recipientUserId: selectedContribution.userId,
        message: thankYouMessage.trim(),
      });
      toast.success('Thank-you note sent');
      resetThankYouModal();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send thank-you note');
    } finally {
      setIsSubmittingThanks(false);
    }
  };

  const handleCancelContribution = async (contribution: Contribution) => {
    if (!confirm('Cancel this contribution and free the slot?')) return;

    setIsCancelling(true);
    try {
      await api.cancelContribution(trainId, contribution.id);
      toast.success('Contribution cancelled');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel contribution');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contributors</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage signed-up meals and tasks, then follow up with thank-you notes.
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-gray-500">Total contributions</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="mt-1 text-2xl font-semibold text-primary-600">{stats.upcoming}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{stats.completed}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Open slots</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{stats.openSlots}</p>
        </Card>
      </div>

      <Card>
        <Input
          placeholder="Search by contributor, contact info, or task..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Card>

      {filteredParticipants.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              {searchQuery ? 'No matching contributors' : 'No contributions yet'}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchQuery
                ? 'Try a broader search.'
                : 'Contributors will appear here as soon as slots are claimed.'}
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contributor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Thanks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900">{getContributorName(participant)}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        {getContributorEmail(participant) || 'No email'}
                      </div>
                      {getContributorPhone(participant) && (
                        <div className="text-sm text-gray-500">{getContributorPhone(participant)}</div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        {participant.userId ? 'Registered user' : 'Guest contributor'}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900">{formatTaskLabel(participant)}</div>
                      {participant.itemDescription && (
                        <div className="mt-1 text-sm text-gray-500">{participant.itemDescription}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-gray-700">
                      {participant.slot ? format(new Date(participant.slot.date), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="space-y-2 px-6 py-4 align-top">
                      <Badge variant={getStatusVariant(participant.status)} size="sm">
                        {participant.status.replace(/_/g, ' ')}
                      </Badge>
                      <div>
                        <Badge variant={participant.deliveryStatus === 'DELIVERED' ? 'success' : 'info'} size="sm">
                          {participant.deliveryStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {participant.thankYouNotes?.length ? (
                        <div className="space-y-1">
                          <Badge variant="success" size="sm">
                            {participant.thankYouNotes.length} sent
                          </Badge>
                          <p className="max-w-xs text-xs text-gray-500">
                            Latest: {participant.thankYouNotes[0].message}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex justify-end gap-2">
                        {participant.userId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedContribution(participant);
                              setThankYouMessage('');
                            }}
                          >
                            Send thanks
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Guest only
                          </Button>
                        )}
                        {participant.status !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelContribution(participant)}
                            disabled={isCancelling}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={Boolean(selectedContribution)}
        onClose={() => !isSubmittingThanks && resetThankYouModal()}
        title="Send thank-you note"
        description={
          selectedContribution ? `This will notify ${getContributorName(selectedContribution)}.` : undefined
        }
        actions={
          <>
            <Button variant="outline" onClick={resetThankYouModal} disabled={isSubmittingThanks}>
              Cancel
            </Button>
            <Button onClick={handleSendThanks} isLoading={isSubmittingThanks} disabled={!thankYouMessage.trim()}>
              Send note
            </Button>
          </>
        }
      >
        <Textarea
          label="Message"
          placeholder="Thank you for stepping in and helping this family..."
          value={thankYouMessage}
          onChange={(event) => setThankYouMessage(event.target.value)}
          rows={5}
        />
      </Modal>
    </div>
  );
}
