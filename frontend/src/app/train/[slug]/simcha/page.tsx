import { notFound } from 'next/navigation';
import { ChesedTrain } from '@/types';
import SimchaBoard from '../components/SimchaBoard';
import TrainHero from '../components/TrainHero';
import ShareButtons from '../components/ShareButtons';

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

export default async function SimchaPage({ params }: PageProps) {
    const train = await getChesedTrain(params.slug);

    if (!train || train.trainType !== 'SIMCHA') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TrainHero train={train} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <ShareButtons train={train} />
                    <div className="text-sm font-bold bg-primary-100 text-primary-700 px-4 py-2 rounded-full ring-2 ring-primary-200">
                        🎉 Simcha Contribution Mode
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                    <SimchaBoard
                        train={train}
                        onAddContribution={() => {
                            // This would ideally open a modal, but since this is a server component
                            // we might need a client wrapper or a hash-based modal trigger
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
