'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const LOADING_MESSAGES = [
    'Consulting the Himalayan sages...',
    'Traversing mountain trails for flavors...',
    'Picking fresh herbs from the valley...',
    'Warming up the clay oven...',
    'Crafting your perfect mountain meal...',
    'Almost there... the feast awaits!',
];

// Snow particles for loading page
const SNOW = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.round((i * 37.1 + 8) % 100),
    size: 2 + ((i * 11) % 4),
    dur: 12 + ((i * 5) % 10),
    delay: ((i * 2.1) % 7),
    sway: 8 + ((i * 9) % 20) * (i % 2 === 0 ? 1 : -1),
    opacity: 0.12 + ((i * 7) % 20) / 100,
}));

function LoadingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');
    const [yetiVisible, setYetiVisible] = useState(false);

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);

        const dotInterval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        // Show yeti chef after a moment
        const yetiTimer = setTimeout(() => setYetiVisible(true), 2000);

        return () => {
            clearInterval(msgInterval);
            clearInterval(dotInterval);
            clearTimeout(yetiTimer);
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
                sessionStorage.setItem('yeti-recommendations', JSON.stringify(data.itineraries));
                sessionStorage.setItem('yeti-mood', body.mood);

                await new Promise((r) => setTimeout(r, 1500));
                router.push('/recommendations');
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                router.push('/recommendations');
            }
        };

        fetchRecommendations();
    }, [router, searchParams]);

    return (
        <div className="min-h-dvh relative flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #060a14 0%, #0d1220 40%, #111827 75%, #0c1a27 100%)' }}>
            <div className="mountain-bg" />

            {/* Snow */}
            <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
                {SNOW.map(p => (
                    <div key={p.id} className="snow-particle"
                        style={{
                            left: `${p.x}%`,
                            width: `${p.size}px`, height: `${p.size}px`,
                            '--snow-dur': `${p.dur}s`,
                            '--snow-delay': `${p.delay}s`,
                            '--snow-blur': '0.5px',
                            '--snow-opacity': p.opacity,
                            '--snow-sway': `${p.sway}px`,
                            '--snow-sway-dur': `${5 + (p.id % 3)}s`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Singing bowl ripples (replaces plain animated circles) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="bowl-ripple"
                        style={{
                            width: 120 + i * 50,
                            height: 120 + i * 50,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${2.5 + i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 text-center px-8">
                {/* Mountain icon with aurora pulse */}
                <div className="mb-8 relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative animate-aurora-pulse mx-auto"
                        style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
                        <span className="text-5xl" style={{ animation: 'glow-breathe 3s ease-in-out infinite', display: 'inline-block' }}>
                            🏔️
                        </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-yeti-gold/20 rounded-full blur-sm" />

                    {/* Steam rising from the icon */}
                    {[0, 1, 2].map(j => (
                        <div key={j} className="steam-curl"
                            style={{
                                left: `calc(50% + ${(j - 1) * 14}px)`,
                                top: -8,
                                '--steam-w': `${5 + j * 2}px`,
                                '--steam-h': `${8 + j * 3}px`,
                                '--steam-dur': `${2 + j * 0.5}s`,
                                '--steam-delay': `${j * 0.6}s`,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>

                {/* Loading text */}
                <h2 className="font-heading text-xl font-bold text-yeti-gold mb-3">
                    Finding Your Perfect Meal{dots}
                </h2>

                <p className="text-yeti-muted text-sm mb-8 h-6 transition-all duration-500"
                    style={{ animation: 'fade-in-up 0.4s ease-out' }}>
                    {LOADING_MESSAGES[messageIndex]}
                </p>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
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

                {/* Yeti Chef Pop-in */}
                {yetiVisible && (
                    <div className="animate-yeti-chef flex flex-col items-center gap-2">
                        <Image src="/swadai-mascot.png" alt="Yeti Chef" width={48} height={48}
                            className="object-contain" style={{ filter: 'drop-shadow(0 0 12px rgba(212,165,116,0.3))' }} />
                        <span className="text-xs text-yeti-muted/60 italic">Chef Yeti is cooking...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LoadingAIPage() {
    return (
        <Suspense fallback={
            <div className="min-h-dvh flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #060a14 0%, #0d1220 40%, #111827 75%, #0c1a27 100%)' }}>
                <div className="text-4xl animate-bounce">🏔️</div>
            </div>
        }>
            <LoadingContent />
        </Suspense>
    );
}
