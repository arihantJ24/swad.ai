'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const LOADING_MESSAGES = [
    'Consulting the Himalayan sages...',
    'Traversing mountain trails for flavors...',
    'Picking fresh herbs from the valley...',
    'Warming up the clay oven...',
    'Crafting your perfect mountain meal...',
    'Almost there... the feast awaits!',
];

function LoadingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);

        const dotInterval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        return () => {
            clearInterval(msgInterval);
            clearInterval(dotInterval);
        };
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const body = {
                    mood: searchParams.get('mood') || '',
                    mealType: searchParams.get('meal') || 'dinner',
                    dietary: searchParams.get('dietary') || 'non-veg',
                    spiceLevel: parseInt(searchParams.get('spice') || '3'),
                    experience: searchParams.get('experience') || 'first-time',
                    budget: searchParams.get('budget') || '400-700',
                    customThought: searchParams.get('custom') || '',
                };

                const res = await fetch('/api/ai-recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                const data = await res.json();

                // Store in sessionStorage for the recommendations page
                sessionStorage.setItem('yeti-recommendations', JSON.stringify(data.itineraries));
                sessionStorage.setItem('yeti-mood', body.mood);

                // Small delay so the animation doesn't feel abrupt
                await new Promise((r) => setTimeout(r, 1500));
                router.push('/recommendations');
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                // Navigate anyway with fallback data
                router.push('/recommendations');
            }
        };

        fetchRecommendations();
    }, [router, searchParams]);

    return (
        <div className="min-h-dvh yeti-gradient relative flex items-center justify-center">
            <div className="mountain-bg" />

            {/* Animated circles */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-yeti-gold/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute w-64 h-64 rounded-full border border-yeti-gold/5 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute w-80 h-80 rounded-full border border-yeti-gold/3 animate-ping" style={{ animationDuration: '5s' }} />
            </div>

            <div className="relative z-10 text-center px-8">
                {/* Spinning mountain icon */}
                <div className="mb-8 relative">
                    <div className="text-7xl animate-bounce" style={{ animationDuration: '2s' }}>
                        🏔️
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-yeti-gold/20 rounded-full blur-sm" />
                </div>

                {/* Loading text */}
                <h2 className="font-heading text-xl font-bold text-yeti-gold mb-3">
                    Finding Your Perfect Meal{dots}
                </h2>

                <p className="text-yeti-muted text-sm mb-8 h-6 transition-all duration-500">
                    {LOADING_MESSAGES[messageIndex]}
                </p>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-yeti-gold"
                            style={{
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: `${i * 0.2}s`,
                                opacity: 0.3,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function LoadingAIPage() {
    return (
        <Suspense fallback={
            <div className="min-h-dvh yeti-gradient flex items-center justify-center">
                <div className="text-4xl animate-bounce">🏔️</div>
            </div>
        }>
            <LoadingContent />
        </Suspense>
    );
}
