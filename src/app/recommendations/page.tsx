'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import type { MealItinerary } from '@/lib/gemini';

// Snow particles
const SNOW = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.round((i * 29.3 + 7) % 100),
    size: 2 + ((i * 13) % 5),
    dur: 11 + ((i * 6) % 11),
    delay: ((i * 1.9) % 8),
    sway: 8 + ((i * 11) % 22) * (i % 2 === 0 ? 1 : -1),
    opacity: 0.1 + ((i * 9) % 25) / 100,
}));

export default function RecommendationsPage() {
    const router = useRouter();
    const { addItem, itemCount } = useCart();
    const [itineraries] = useState<MealItinerary[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = sessionStorage.getItem('yeti-recommendations');
        if (!stored) return [];
        try {
            return JSON.parse(stored) as MealItinerary[];
        } catch {
            return [];
        }
    });
    const [mood] = useState(() => {
        if (typeof window === 'undefined') return '';
        return sessionStorage.getItem('yeti-mood') || '';
    });
    const [error] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        return sessionStorage.getItem('yeti-recommendations-error') || '';
    });
    const [addedCards, setAddedCards] = useState<Set<number>>(new Set());
    const [yetiCelebrate, setYetiCelebrate] = useState(false);

    const handleAddItinerary = (itinerary: MealItinerary, index: number) => {
        const items = [itinerary.main, itinerary.side, itinerary.drink];
        if (itinerary.dessert) items.push(itinerary.dessert);

        items.forEach((item, i) => {
            // For AI suggested items, the ID should be unique or mapped to a real menu ID if possible.
            // For now using index-based placeholder IDs to avoid collisions.
            addItem({
                id: -(index * 10 + i + 1), // Negative IDs for AI suggestions to distinguish from DB items
                name: item.name,
                price: item.price,
                category: i === 0 ? 'Main' : i === 1 ? 'Side' : i === 2 ? 'Drink' : 'Dessert',
                dietary: 'mixed',
            });
        });

        setAddedCards((prev) => new Set([...prev, index]));
        // Yeti chef celebration
        setYetiCelebrate(true);
        setTimeout(() => setYetiCelebrate(false), 3500);
    };

    const handleAddSingleItem = (item: { name: string; price: number }, itIndex: number, itemIndex: number) => {
        addItem({
            id: -(itIndex * 100 + itemIndex + 10),
            name: item.name,
            price: item.price,
            category: 'Add-on',
            dietary: 'mixed',
        });
    };

    if (error) {
        return (
            <div className="min-h-dvh yeti-gradient relative flex flex-col items-center justify-center px-6">
                <div className="mountain-bg opacity-30" />
                <div className="relative z-10 text-center bg-black/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 max-w-md">
                    <span className="text-6xl mb-4 block">🏔️</span>
                    <h2 className="font-heading text-2xl font-bold text-yeti-gold mb-3">Couldn&apos;t generate AI paths</h2>
                    <p className="text-yeti-muted text-sm mb-6 leading-relaxed break-words">
                        {error}
                    </p>
                    <div className="space-y-3">
                        <Link href="/mood" className="yeti-btn-primary px-10 block">Try Again</Link>
                        <Link href="/menu" className="yeti-btn-secondary px-10 block">Browse Menu</Link>
                    </div>
                    <p className="text-yeti-muted/60 text-[11px] mt-5 leading-relaxed">
                        If you see a quota / 429 error, enable billing or increase OpenAI API quota for this key/project.
                    </p>
                </div>
            </div>
        );
    }

    if (itineraries.length === 0) {
        return (
            <div className="min-h-dvh yeti-gradient relative flex flex-col items-center justify-center px-6">
                <div className="mountain-bg opacity-30" />
                <div className="relative z-10 text-center bg-black/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10">
                    <span className="text-6xl mb-4 block animate-bounce">🏔️</span>
                    <h2 className="font-heading text-2xl font-bold text-yeti-gold mb-3">No suggestions yet</h2>
                    <p className="text-yeti-muted text-sm mb-8 leading-relaxed">Let the Yeti AI know your mood to get personalized Himalayan meal paths!</p>
                    <Link href="/mood" className="yeti-btn-primary px-10">Start AI Journey</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #060a14 0%, #0d1220 40%, #111827 75%, #0c1a27 100%)' }}>
            <div className="mountain-bg opacity-20" />

            {/* Snow */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
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
                            '--snow-sway-dur': `${4 + (p.id % 4)}s`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Header */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-yeti-bg/80 backdrop-blur-lg border-b border-yeti-border">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-yeti-muted hover:text-yeti-gold transition-colors"
                >
                    <span className="text-xl">←</span>
                    <span className="text-sm font-medium">Retry</span>
                </button>
                <h1 className="font-heading text-lg font-bold text-yeti-gold">Yeti AI Paths</h1>
                <Link href="/cart" className="relative p-2 bg-yeti-gold/10 rounded-full pr-4 border border-yeti-gold/20 flex items-center gap-2">
                    <span className="text-xl">🛒</span>
                    <span className="text-xs font-bold text-yeti-gold">{itemCount}</span>
                </Link>
            </nav>

            <main className="relative z-10 px-6 pb-24 max-w-2xl mx-auto pt-8">
                {/* Title */}
                <div className="text-center mb-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-yeti-gold/10 border border-yeti-gold/20 text-yeti-gold text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        Artificial Intelligence
                    </div>
                    <h2 className="font-heading text-3xl font-black mb-2 text-white">
                        Curated For <span className="text-yeti-gold">{mood.toUpperCase()}</span>
                    </h2>
                    <p className="text-yeti-muted text-sm italic">&quot;A journey of a thousand momos begins with a single mood.&quot;</p>
                </div>

                {/* Itinerary Cards */}
                <div className="space-y-8">
                    {itineraries.map((it, i) => (
                        <div
                            key={i}
                            className={`yeti-card overflow-hidden animate-sherpa-arrive bg-black/40 border-yeti-border hover:border-yeti-gold/30 transition-all ${addedCards.has(i) ? 'ring-2 ring-yeti-green/50 border-yeti-green/50' : ''
                                }`}
                            style={{ animationDelay: `${i * 0.2}s` }}
                        >
                            {/* Card Header */}
                            <div className="p-6 pb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-heading text-2xl font-black text-yeti-gold leading-tight">{it.name}</h3>
                                        <p className="text-yeti-muted text-xs font-medium uppercase tracking-wider mt-1">{it.tagline}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-yeti-gold text-white px-3 py-1 rounded-lg font-black text-xl shadow-lg shadow-yeti-gold/20">
                                            ₹{it.total}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-yeti-gold opacity-50"></span>
                                    <p className="text-[11px] text-yeti-gold/80 font-bold italic tracking-wide">
                                        {it.why_it_matches}
                                    </p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="px-6 py-4 border-t border-white/5 space-y-5 bg-white/5">
                                {[
                                    { label: 'MAIN', item: it.main, icon: '🍛' },
                                    { label: 'SIDE', item: it.side, icon: '🥗' },
                                    { label: 'DRINK', item: it.drink, icon: '🥤' },
                                    ...(it.dessert ? [{ label: 'SWEET', item: it.dessert, icon: '🍰' }] : []),
                                ].map(({ label, item, icon }, j) => (
                                    <div key={j} className="flex gap-4 group">
                                        <span className="text-xl opacity-80 group-hover:scale-125 transition-transform">{icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[10px] font-black text-white/40 tracking-widest leading-none">{label}</p>
                                                <span className="text-xs font-bold text-yeti-gold/70">₹{item.price}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-yeti-text mt-1">{item.name}</h4>
                                            <p className="text-[11px] text-yeti-muted leading-relaxed line-clamp-1 italic">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Why it matches */}
                            <div className="px-5 pb-3">
                                <div className="bg-yeti-gold/5 rounded-lg p-3 border border-yeti-gold/10">
                                    <p className="text-xs text-yeti-gold">
                                        ✨ {it.why_it_matches}
                                    </p>
                                </div>
                            </div>

                            {/* Add-ons */}
                            {it.add_ons && it.add_ons.length > 0 && (
                                <div className="px-5 pb-3">
                                    <p className="text-xs text-yeti-muted mb-2">Smart Add-ons:</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {it.add_ons.map((addon, j) => (
                                            <button
                                                key={j}
                                                onClick={() => handleAddSingleItem(addon, i, j + 50)}
                                                className="yeti-chip text-xs hover:border-yeti-gold"
                                            >
                                                + {addon.name} · ₹{addon.price}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="p-5 pt-2">
                                {addedCards.has(i) ? (
                                    <div className="w-full py-3 text-center rounded-xl bg-yeti-green/10 text-yeti-green font-heading font-semibold text-sm border border-yeti-green/30">
                                        ✓ Added to Cart
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAddItinerary(it, i)}
                                        className="yeti-btn-primary w-full text-center"
                                    >
                                        Add Full Itinerary to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom actions */}
                <div className="mt-8 space-y-3">
                    {itemCount > 0 && (
                        <Link href="/cart" className="yeti-btn-primary w-full text-center block">
                            🛒 View Cart ({itemCount} items)
                        </Link>
                    )}
                    <Link href="/menu" className="yeti-btn-secondary w-full text-center block">
                        📜 Explore Full Menu
                    </Link>
                </div>
            </main>

            {/* Yeti Chef Celebration */}
            {yetiCelebrate && (
                <div className="fixed bottom-20 right-4 z-50 animate-yeti-chef flex flex-col items-center gap-1">
                    <Image src="/swadai-mascot.png" alt="Yeti Chef" width={56} height={56}
                        className="object-contain" style={{ filter: 'drop-shadow(0 0 12px rgba(212,165,116,0.4))' }} />
                    <span className="text-[10px] bg-black/80 text-yeti-gold px-2 py-1 rounded-full border border-yeti-gold/20 whitespace-nowrap">
                        Great choice! 🏔️✨
                    </span>
                </div>
            )}
        </div>
    );
}
