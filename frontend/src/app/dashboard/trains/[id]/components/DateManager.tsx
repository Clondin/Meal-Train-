'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, Button, Badge, Modal, Input, Select } from '@/components/ui';
import { MealDate, CreateMealDateData } from '@/types';
import { cn } from '@/lib/utils';

interface DateManagerProps {
  trainId: string;
  dates: MealDate[];
  onUpdate: () => void;
}

export default function DateManager({ trainId, dates, onUpdate }: DateManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<MealDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateMealDateData>({
    date: '',
    mealType: 'dinner',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      date: '',
      mealType: 'dinner',
      notes: '',
    });
    setError(null);
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.createMealDate(trainId, formData);
      setShowAddModal(false);
      resetForm();
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to add meal date');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError(null);
      await api.updateMealDate(trainId, selectedDate.id, formData);
      setShowEditModal(false);
      setSelectedDate(null);
      resetForm();
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to update meal date');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    if (!confirm('Are you sure you want to delete this meal date?')) return;

    try {
      setLoading(true);
      setError(null);
      await api.deleteMealDate(trainId, dateId);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to delete meal date');
    } finally {
      setLoading(false);
    }
  };

  const handleUnclaimDate = async (dateId: string) => {
    if (!confirm('Are you sure you want to unclaim this meal date?')) return;

    try {
      setLoading(true);
      setError(null);
      await api.unclaimMealDate(trainId, dateId);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to unclaim meal date');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (dateId: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.markMealDateDelivered(trainId, dateId);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as delivered');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (date: MealDate) => {
    setSelectedDate(date);
    setFormData({
      date: date.date.split('T')[0],
      mealType: date.mealType,
      notes: date.notes || '',
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: MealDate['status']) => {
    const statusConfig = {
      available: { label: 'Available', variant: 'info' as const },
      claimed: { label: 'Claimed', variant: 'warning' as const },
      delivered: { label: 'Delivered', variant: 'success' as const },
      cancelled: { label: 'Cancelled', variant: 'error' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Group dates by month
  const groupedDates = dates.reduce((acc, date) => {
    const monthYear = new Date(date.date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(date);
    return acc;
  }, {} as Record<string, MealDate[]>);

  // Sort dates within each group
  Object.keys(groupedDates).forEach((key) => {
    groupedDates[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meal Dates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage all meal dates for this train
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Meal Date
        </Button>
      </div>

      {/* Dates List */}
      {Object.keys(groupedDates).length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meal dates yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first meal date</p>
            <Button onClick={() => setShowAddModal(true)}>Add Meal Date</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDates).map(([monthYear, monthDates]) => (
            <Card key={monthYear}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{monthYear}</h3>
              <div className="space-y-3">
                {monthDates.map((date) => (
                  <div
                    key={date.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-gray-900">{formatDate(date.date)}</p>
                        <Badge variant="neutral" size="sm">
                          {date.mealType.charAt(0).toUpperCase() + date.mealType.slice(1)}
                        </Badge>
                        {getStatusBadge(date.status)}
                      </div>
                      {date.participant && (
                        <p className="text-sm text-gray-600 mb-1">
                          Claimed by: {date.participant.name}
                        </p>
                      )}
                      {date.notes && (
                        <p className="text-sm text-gray-500">{date.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {date.status === 'available' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(date)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDate(date.id)}
                            disabled={loading}
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </>
                      )}
                      {date.status === 'claimed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkDelivered(date.id)}
                            disabled={loading}
                          >
                            Mark Delivered
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnclaimDate(date.id)}
                            disabled={loading}
                          >
                            Unclaim
                          </Button>
                        </>
                      )}
                      {date.status === 'delivered' && (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Date Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Meal Date"
      >
        <form onSubmit={handleAddDate}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type *
              </label>
              <Select
                required
                value={formData.mealType}
                onChange={(e) =>
                  setFormData({ ...formData, mealType: e.target.value as 'breakfast' | 'lunch' | 'dinner' })
                }
                options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'dinner', label: 'Dinner' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes for this date..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Date
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Date Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDate(null);
          resetForm();
        }}
        title="Edit Meal Date"
      >
        <form onSubmit={handleEditDate}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type *
              </label>
              <Select
                required
                value={formData.mealType}
                onChange={(e) =>
                  setFormData({ ...formData, mealType: e.target.value as 'breakfast' | 'lunch' | 'dinner' })
                }
                options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'dinner', label: 'Dinner' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes for this date..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedDate(null);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Update Date
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
