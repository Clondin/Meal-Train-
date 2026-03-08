import { notFound } from 'next/navigation';
import { ChesedTrain, TaskType, TASK_TYPE_LABELS, isMealTask } from '@/types';
import TrainHero from '../components/TrainHero';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

interface PageProps {
    params: {
        slug: string;
    };
}

async function getChesedTrain(slug: string): Promise<ChesedTrain | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/chesed-trains/${slug}`, {
            cache: 'no-store',
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.train ?? data;
    } catch (error) {
        return null;
    }
}

export default async function TasksPage({ params }: PageProps) {
    const train = await getChesedTrain(params.slug);

    if (!train) {
        notFound();
    }

    // Filter for non-meal tasks
    const tasks = (train.taskSlots || []).filter(slot => !isMealTask(slot.taskType));

    return (
        <div className="min-h-screen bg-gray-50">
            <TrainHero train={train} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Helpful Tasks & Errands</h1>
                    <p className="text-gray-500 font-medium">Beyond meals, here are other ways to support {train.recipientName}</p>
                </div>

                {tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map(task => {
                            const statusColors = {
                                AVAILABLE: 'success',
                                PARTIALLY_FILLED: 'warning',
                                FILLED: 'info',
                                CLOSED: 'neutral',
                                CANCELLED: 'error',
                            };

                            return (
                                <Card key={task.id} className="p-6 bg-white rounded-3xl border-none shadow-xl shadow-gray-200/50 flex flex-col hover:transform hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                                            {getTaskIcon(task.taskType)}
                                        </div>
                                        <Badge variant={statusColors[task.status] as any}>{task.status}</Badge>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-1">
                                        {task.taskTitle || TASK_TYPE_LABELS[task.taskType]}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-bold mb-4">
                                        <span>🗓️ {format(new Date(task.date), 'MMM do')}</span>
                                        {task.startTime && <span>• {task.startTime}</span>}
                                    </div>

                                    <p className="text-sm text-gray-600 font-medium mb-6 flex-grow line-clamp-3">
                                        {task.taskDescription || "No specific instructions provided."}
                                    </p>

                                    <div className="space-y-3">
                                        <Button
                                            className="w-full rounded-xl font-bold"
                                            variant={task.status === 'AVAILABLE' ? 'primary' : 'outline'}
                                            disabled={task.status === 'FILLED'}
                                        >
                                            {task.status === 'AVAILABLE' ? 'Sign Up for Task' : 'View Details'}
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🤝</div>
                        <h2 className="text-2xl font-black text-gray-900">No tasks currently posted</h2>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium mt-2">
                            The organizer hasn't listed any non-meal tasks yet. Check back soon or contact the organizer if you'd like to help in other ways.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function getTaskIcon(type: TaskType): string {
    const icons: Partial<Record<TaskType, string>> = {
        BABYSITTING: '👶',
        HOSPITAL_VISIT: '🏥',
        RIDES: '🚗',
        GROCERY_RUN: '🛒',
        ERRANDS: '🏃',
        LAUNDRY: '🧺',
        HOUSEHOLD_HELP: '🏡',
        DOG_WALKING: '🦮',
        CHILDCARE_PICKUP: '🎒',
        OTHER_TASK: '🤝',
    };
    return icons[type] || '🤝';
}
