'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChesedTrain, Contribution, DeliveryStatus } from '@/types';
import { api } from '@/lib/api';
import TrainHero from '../components/TrainHero';
import DeliveryStatusTracker from '../components/DeliveryStatusTracker';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { devLogError } from '@/lib/dev-log';

export default function DeliveryPage() {
    const params = useParams<{ slug: string }>();
    const slug = typeof params.slug === 'string' ? params.slug : '';
    const [train, setTrain] = useState<ChesedTrain | null>(null);
    const [activeContributions, setActiveContributions] = useState<Contribution[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const trainData = await api.getChesedTrain(slug);
                setTrain(trainData);

                // In a real app, filter for the current user's contributions
                // For now, we'll show all contributions that are for today +/- 1 day
                const today = new Date();
                const relevant = (trainData.contributions || []).filter(c => {
                    if (!c.slot) return false;
                    const slotDate = new Date(c.slot.date);
                    const diff = Math.abs(slotDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                    return diff <= 1 && c.status === 'CONFIRMED';
                });

                setActiveContributions(relevant);
            } catch (error) {
                devLogError('Failed to load delivery data:', error);
                toast.error('Failed to load delivery data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const handleStatusUpdate = async (contributionId: string, status: DeliveryStatus) => {
        try {
            await api.patch(`/contributions/${contributionId}`, { deliveryStatus: status });

            // Update local state
            setActiveContributions(prev =>
                prev.map(c => c.id === contributionId ? { ...c, deliveryStatus: status } : c)
            );

            toast.success(`Status updated to ${status.replace('_', ' ')}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="p-20 text-center font-bold">Loading...</div>;
    if (!train) return <div className="p-20 text-center font-bold">Train not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <TrainHero train={train} />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Command Center</h1>
                    <p className="text-gray-500 font-medium">Keep the family updated on your progress</p>
                </div>

                {activeContributions.length > 0 ? (
                    activeContributions.map(contribution => (
                        <Card key={contribution.id} className="p-8 border-none bg-white shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                            <div className="flex justify-between items-start border-b border-gray-50 pb-6 mb-8">
                                <div>
                                    <Badge variant="info" className="mb-2">ACTIVE DELIVERY</Badge>
                                    <h2 className="text-xl font-black text-gray-900">
                                        {contribution.itemDescription || 'Chesed Contribution'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 font-bold">
                                        <span>🗓️ {contribution.slot ? format(new Date(contribution.slot.date), 'EEEE, MMMM do') : 'Today'}</span>
                                        <span>•</span>
                                        <span className="text-primary-600">📍 {train.recipientAddress}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recipient</div>
                                    <div className="font-bold text-gray-900">{train.recipientName}</div>
                                </div>
                            </div>

                            <DeliveryStatusTracker
                                currentStatus={contribution.deliveryStatus}
                                onStatusUpdate={(status) => handleStatusUpdate(contribution.id, status)}
                            />
                        </Card>
                    ))
                ) : (
                    <Card className="p-12 text-center bg-white rounded-3xl border-none shadow-xl">
                        <div className="text-5xl mb-4">📍</div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Active Deliveries</h3>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium">
                            You don't have any meals or tasks scheduled for delivery right now.
                        </p>
                    </Card>
                )}

                <div className="p-6 bg-primary-900 rounded-3xl text-white shadow-lg shadow-primary-200">
                    <h4 className="font-black mb-2 flex items-center gap-2">
                        <span>💡</span> Pro-Tip
                    </h4>
                    <p className="text-sm text-primary-100 font-medium">
                        Updating your status sends a helpful notification to the family so they know when to set the table or prepare for your arrival.
                    </p>
                </div>
            </div>
        </div>
    );
}
