'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, Button, Badge } from '@/components/ui';
import { Donation } from '@/types';
import { cn } from '@/lib/utils';

interface DonationReportProps {
  trainId: string;
  donations: Donation[];
  onUpdate: () => void;
}

export default function DonationReport({ trainId, donations, onUpdate }: DonationReportProps) {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Donation['status']) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'warning' as const },
      completed: { label: 'Completed', variant: 'success' as const },
      failed: { label: 'Failed', variant: 'error' as const },
      refunded: { label: 'Refunded', variant: 'neutral' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStats = () => {
    const completed = donations.filter((d) => d.status === 'completed');
    const totalAmount = completed.reduce((sum, d) => sum + d.amount, 0);
    const averageAmount = completed.length > 0 ? totalAmount / completed.length : 0;
    const pending = donations.filter((d) => d.status === 'pending').length;
    const refunded = donations.filter((d) => d.status === 'refunded');
    const refundedAmount = refunded.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalAmount,
      averageAmount,
      completedCount: completed.length,
      pendingCount: pending,
      refundedCount: refunded.length,
      refundedAmount,
    };
  };

  const handleExportCSV = () => {
    const headers = ['Donor Name', 'Email', 'Amount', 'Status', 'Message', 'Date'];
    const rows = donations.map((donation) => [
      donation.donorName,
      donation.donorEmail || '',
      formatCurrency(donation.amount),
      donation.status,
      donation.message || '',
      formatDate(donation.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${trainId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Donation Report</h2>
          <p className="text-sm text-gray-500 mt-1">
            View all donations and financial statistics
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Raised</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Average Donation</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.averageAmount)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Refunded</p>
            <p className="text-2xl font-bold text-gray-900">{stats.refundedCount}</p>
            {stats.refundedAmount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats.refundedAmount)}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Donations List */}
      {donations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
            <p className="text-gray-500">
              Donations will appear here when people contribute to this chesed train
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donorName}
                          </div>
                          {donation.donorEmail && (
                            <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(donation.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {donation.message || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(donation.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Summary */}
      {donations.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">By Status</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Completed:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {stats.completedCount} ({formatCurrency(stats.totalAmount)})
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Pending:</dt>
                  <dd className="text-sm font-semibold text-gray-900">{stats.pendingCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Refunded:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {stats.refundedCount} ({formatCurrency(stats.refundedAmount)})
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Statistics</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Total Donations:</dt>
                  <dd className="text-sm font-semibold text-gray-900">{donations.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Average Amount:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {formatCurrency(stats.averageAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Total Raised:</dt>
                  <dd className="text-sm font-semibold text-green-600">
                    {formatCurrency(stats.totalAmount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      )}

      {/* Note */}
      <Card>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">About Donations</h4>
            <p className="text-sm text-gray-600">
              All donations are processed securely through Stripe. Refund requests should be
              handled through your Stripe dashboard. For questions about donations, please
              contact support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
