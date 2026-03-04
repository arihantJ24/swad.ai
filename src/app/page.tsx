'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

const FOOD_ITEMS = [
    { src: '/food-momos.png', name: 'Steam Momos', price: '₹395', emoji: '🥟', dur: '5s', delay: '0s' },
    { src: '/food-jhol-momos.png', name: 'Jhol Momos', price: '₹525', emoji: '🌶️', dur: '6.5s', delay: '0.8s' },
    { src: '/food-thali.png', name: 'Thakali Thali', price: '₹645', emoji: '🍱', dur: '4.5s', delay: '1.6s' },
    { src: '/food-thukpa.png', name: 'Thukpa', price: '₹475', emoji: '🍜', dur: '5.5s', delay: '0.4s' },
    { src: '/food-ema-datshi.png', name: 'Ema Datshi', price: '₹525', emoji: '🧀', dur: '7s', delay: '1.2s' },
    { src: '/food-sekuwa.png', name: 'Sekuwa', price: '₹495', emoji: '🍖', dur: '6s', delay: '2s' },
];

// 3 cards on the left edge, 3 on the right edge — kept tightly to the edges
const CARD_LAYOUT = [
    { side: 'left', left: '0%', top: '18%', rotate: '-5deg', size: 130 },
    { side: 'left', left: '2%', top: '44%', rotate: '3deg', size: 122 },
    { side: 'left', left: '0%', top: '70%', rotate: '-4deg', size: 126 },
    { side: 'right', right: '0%', top: '18%', rotate: '6deg', size: 124 },
    { side: 'right', right: '1%', top: '44%', rotate: '-5deg', size: 130 },
    { side: 'right', right: '0%', top: '70%', rotate: '4deg', size: 122 },
];

const STARS = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.round((i * 137.5) % 100),
    y: Math.round((i * 97.3) % 100),
    size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
    delay: `${(i * 0.4) % 8}s`,
    dur: `${5 + (i % 5)}s`,
}));

function useFadeIn(delayMs: number) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delayMs);
        return () => clearTimeout(t);
    }, [delayMs]);
    return visible;
}

export default function WelcomePage() {
    const { itemCount } = useCart();
    const [mounted, setMounted] = useState(false);
    const [activeFood, setActiveFood] = useState(0);

    const showIcon = useFadeIn(150);
    const showTitle = useFadeIn(350);
    const showDivider = useFadeIn(540);
    const showSub = useFadeIn(660);
    const showBtns = useFadeIn(800);
    const showTicker = useFadeIn(960);

    useEffect(() => {
        setMounted(true);
        const t = setInterval(() => setActiveFood(p => (p + 1) % FOOD_ITEMS.length), 2500);
        return () => clearInterval(t);
    }, []);

    const fadeStyle = (show: boolean): React.CSSProperties => ({
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.65s ease, transform 0.65s ease',
    });

    return (
        <div className="min-h-dvh relative overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg, #060a14 0%, #0d1220 40%, #111827 75%, #0c1a27 100%)' }}>

            {/* ── Starfield ── */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {STARS.map(s => (
                    <div key={s.id} className="absolute rounded-full bg-white"
                        style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: 0, animation: `star-drift ${s.dur} ${s.delay} ease-in-out infinite` }} />
                ))}
            </div>

            {/* ── Ambient glow blobs ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)', top: '-8%', left: '50%', transform: 'translateX(-50%)' }} />
                <div className="absolute rounded-full" style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', bottom: '5%', right: '-8%' }} />
                <div className="absolute rounded-full" style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)', bottom: '18%', left: '-5%' }} />
            </div>

            {/* ── Mountain silhouette ── */}
            <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none" style={{ height: 160 }}>
                <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full opacity-25">
                    <polygon points="0,100 60,30 120,65 180,12 240,50 310,5 360,40 400,22 400,100" fill="rgba(15,52,96,0.9)" />
                    <polygon points="0,100 40,52 100,80 150,28 200,62 260,18 320,48 380,35 400,55 400,100" fill="rgba(26,35,50,0.7)" />
                </svg>
            </div>

            {/* ── Floating Food Cards (pointer-events-none, absolute, z-10) ── */}
            {mounted && FOOD_ITEMS.map((food, i) => {
                const layout = CARD_LAYOUT[i];
                const isRight = layout.side === 'right';
                return (
                    <div key={i} className="absolute z-10 pointer-events-none"
                        style={{
                            top: layout.top,
                            left: !isRight ? (layout as { left?: string }).left : undefined,
                            right: isRight ? (layout as { right?: string }).right : undefined,
                            width: layout.size,
                            height: layout.size,
                            borderRadius: 16,
                            overflow: 'hidden',
                            border: `1px solid ${activeFood === i ? 'rgba(212,165,116,0.7)' : 'rgba(212,165,116,0.18)'}`,
                            boxShadow: activeFood === i
                                ? '0 0 28px rgba(212,165,116,0.4), 0 10px 36px rgba(0,0,0,0.7)'
                                : '0 10px 36px rgba(0,0,0,0.55)',
                            transform: `rotate(${layout.rotate})`,
                            animation: `food-bob ${food.dur} ${food.delay} ease-in-out infinite`,
                            transition: 'box-shadow 0.6s ease, border-color 0.6s ease',
                        }}>
                        <Image src={food.src} alt={food.name} width={layout.size} height={layout.size}
                            className="object-cover w-full h-full"
                            style={{ filter: activeFood === i ? 'brightness(1.1)' : 'brightness(0.6)' }} />
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)' }}>
                            <p className="text-white font-black uppercase tracking-wider truncate leading-tight" style={{ fontSize: 8 }}>{food.name}</p>
                            <p className="font-black" style={{ fontSize: 10, color: '#d4a574' }}>{food.price}</p>
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(15,20,35,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,165,116,0.3)', fontSize: 11 }}>
                            {food.emoji}
                        </div>
                    </div>
                );
            })}

            {/* ── Orbit rings ── */}
            <div className="absolute z-10 pointer-events-none"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, height: 260 }}>
                <div className="absolute inset-0 rounded-full border animate-ring-pulse" style={{ borderColor: 'rgba(212,165,116,0.07)' }} />
                <div className="absolute inset-8 rounded-full border animate-ring-pulse" style={{ borderColor: 'rgba(212,165,116,0.05)', animationDelay: '-1.5s' }} />
                <div className="absolute inset-16 rounded-full border animate-ring-pulse" style={{ borderColor: 'rgba(212,165,116,0.035)', animationDelay: '-3s' }} />
            </div>

            {/* ── Nav ── */}
            <nav className="relative z-30 flex items-center justify-between px-5 py-4 shrink-0">
                {/* Left: Yeti branding */}
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-glow-breathe"
                        style={{ background: 'rgba(212,165,116,0.12)', border: '1px solid rgba(212,165,116,0.3)' }}>
                        <span className="text-lg">🏔️</span>
                    </div>
                    <div>
                        <p className="font-heading text-base font-black tracking-[0.15em]"
                            style={{ background: 'linear-gradient(90deg, #d4a574, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>YETI</p>
                        <p style={{ fontSize: 8, letterSpacing: '0.3em', color: '#94a3b8', textTransform: 'uppercase' }}>The Himalayan Kitchen</p>
                    </div>
                </div>

                {/* Right: SwadAI — same pattern as left side */}
                <div className="flex items-center gap-2.5">
                    <div className="text-right">
                        <p className="font-heading text-base font-black tracking-wide"
                            style={{ background: 'linear-gradient(90deg, #f97316, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SwadAI</p>
                        <p style={{ fontSize: 7, letterSpacing: '0.15em', color: '#6b9a5b', fontStyle: 'italic', fontWeight: 600 }}>Jo dil chahe, SwadAI bataye</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden animate-glow-breathe"
                        style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)' }}>
                        <Image src="/swadai-mascot.png" alt="SwadAI" width={32} height={32} className="object-contain" />
                    </div>
                </div>
            </nav>

            {/* ── Hero Content ── */}
            <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center"
                style={{ paddingLeft: 'max(144px, 37vw)', paddingRight: 'max(144px, 37vw)', paddingTop: 8, paddingBottom: 8 }}>

                {/* Ambient center glow */}
                <div className="absolute rounded-full pointer-events-none"
                    style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%)' }} />

                {/* Mountain badge */}
                <div style={{ ...fadeStyle(showIcon), marginBottom: 16 }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative animate-glow-breathe mx-auto"
                        style={{ background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(212,165,116,0.3)', boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
                        <span className="text-3xl select-none">🏔️</span>
                        <span className="absolute animate-star-drift" style={{ top: -7, left: 6, fontSize: 9, color: 'rgba(212,165,116,0.5)', animationDelay: '0s' }}>✦</span>
                        <span className="absolute animate-star-drift" style={{ top: 3, right: -9, fontSize: 7, color: 'rgba(212,165,116,0.5)', animationDelay: '1.5s' }}>✧</span>
                        <span className="absolute animate-star-drift" style={{ bottom: -5, right: 5, fontSize: 8, color: 'rgba(212,165,116,0.4)', animationDelay: '3s' }}>✦</span>
                    </div>
                </div>

                {/* Headline */}
                <div style={{ ...fadeStyle(showTitle), marginBottom: 6 }}>
                    <h2 className="font-heading font-black leading-none" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)' }}>
                        <span className="block animate-text-shimmer" style={{ lineHeight: 1.1 }}>Explore the</span>
                        <span className="block" style={{ color: '#f1f5f9', fontSize: '88%', fontWeight: 800, lineHeight: 1.1 }}>Himalayas</span>
                    </h2>
                    <p className="font-heading font-semibold uppercase mt-2" style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.2em' }}>on a Plate</p>
                </div>

                {/* Divider */}
                <div style={{ ...fadeStyle(showDivider), display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 14 }}>
                    <div style={{ height: 1, width: 28, background: 'linear-gradient(to right, transparent, rgba(212,165,116,0.4))' }} />
                    <span style={{ fontSize: 9, color: 'rgba(212,165,116,0.6)', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Himalayan Cuisine
                    </span>
                    <div style={{ height: 1, width: 28, background: 'linear-gradient(to left, transparent, rgba(212,165,116,0.4))' }} />
                </div>

                {/* Sub-text */}
                <p style={{ ...fadeStyle(showSub), fontSize: 12, color: '#94a3b8', lineHeight: 1.65, marginBottom: 20, maxWidth: '100%' }}>
                    Authentic Nepali, Tibetan &amp; Bhutanese cuisine. AI curates your perfect mountain feast.
                </p>

                {/* CTA Buttons */}
                <div style={{ ...fadeStyle(showBtns), display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    <Link href="/mood" className="yeti-btn-primary flex items-center justify-center gap-1.5"
                        style={{ fontSize: 13, padding: '11px 16px', borderRadius: 12 }}>
                        ✨ AI Journey
                    </Link>
                    <Link href="/menu" className="yeti-btn-secondary flex items-center justify-center gap-1.5"
                        style={{ fontSize: 13, padding: '11px 16px', borderRadius: 12 }}>
                        📜 View Menu
                    </Link>
                </div>

                {/* Live food ticker */}
                <div style={{ ...fadeStyle(showTicker), marginTop: 20 }}>
                    <div className="inline-flex items-center gap-2 rounded-full"
                        style={{ padding: '7px 14px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,165,116,0.18)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-yeti-green animate-pulse shrink-0" />
                        <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>Now serving</span>
                        <span className="font-heading font-bold" style={{ fontSize: 11, color: '#d4a574', transition: 'all 0.5s ease', whiteSpace: 'nowrap' }}>
                            {FOOD_ITEMS[activeFood].emoji} {FOOD_ITEMS[activeFood].name} — {FOOD_ITEMS[activeFood].price}
                        </span>
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <div className="relative z-30 py-3 text-center shrink-0">
                <div className="flex items-center justify-center gap-3" style={{ color: 'rgba(148,163,184,0.35)', fontSize: 9 }}>
                    <div className="h-px w-8" style={{ background: 'rgba(30,41,59,0.6)' }} />
                    <span className="uppercase tracking-[0.3em]">Scan QR at your table</span>
                    <div className="h-px w-8" style={{ background: 'rgba(30,41,59,0.6)' }} />
                </div>
            </div>
        </div>
    );
}
