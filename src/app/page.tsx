'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useEffect, useState, useRef, useCallback } from 'react';

// ── Data ──
const FOOD_ITEMS = [
    { src: '/food-momos.png', name: 'Steam Momos', price: '₹395', emoji: '🥟', dur: '5s', delay: '0s' },
    { src: '/food-jhol-momos.png', name: 'Jhol Momos', price: '₹525', emoji: '🌶️', dur: '6.5s', delay: '0.8s' },
    { src: '/food-thukpa.png', name: 'Thukpa', price: '₹475', emoji: '🍜', dur: '5.5s', delay: '0.4s' },
    { src: '/food-ema-datshi.png', name: 'Ema Datshi', price: '₹525', emoji: '🧀', dur: '7s', delay: '1.2s' },
];

const CARD_LAYOUT = [
    { side: 'left', left: '-2%', top: '22%', rotate: '-5deg', size: 95 },
    { side: 'left', left: '0%', top: '56%', rotate: '3deg', size: 90 },
    { side: 'right', right: '-2%', top: '22%', rotate: '6deg', size: 92 },
    { side: 'right', right: '0%', top: '56%', rotate: '-4deg', size: 95 },
];

const STARS = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.round((i * 137.5) % 100),
    y: Math.round((i * 97.3) % 100),
    size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
    delay: `${(i * 0.4) % 8}s`,
    dur: `${5 + (i % 5)}s`,
}));

// ── Snow particles with parallax depth layers ──
const SNOW_PARTICLES = Array.from({ length: 35 }, (_, i) => {
    const layer = i < 8 ? 'far' : i < 22 ? 'mid' : 'near';
    const configs = {
        far: { size: [2, 4], dur: [18, 28], blur: [1.5, 2.5], opacity: [0.2, 0.35] },
        mid: { size: [3, 6], dur: [12, 20], blur: [0.5, 1], opacity: [0.3, 0.5] },
        near: { size: [5, 9], dur: [8, 14], blur: [0, 0.3], opacity: [0.4, 0.65] },
    };
    const c = configs[layer];
    const r = (min: number, max: number) => min + ((i * 73.7) % 100) / 100 * (max - min);
    return {
        id: i, layer,
        x: Math.round((i * 31.7 + 13) % 100),
        size: Math.round(r(c.size[0], c.size[1]) * 10) / 10,
        dur: Math.round(r(c.dur[0], c.dur[1]) * 10) / 10,
        delay: Math.round(((i * 2.3) % 12) * 10) / 10,
        blur: Math.round(r(c.blur[0], c.blur[1]) * 10) / 10,
        opacity: Math.round(r(c.opacity[0], c.opacity[1]) * 100) / 100,
        sway: Math.round((15 + ((i * 47) % 40)) * (i % 2 === 0 ? 1 : -1)),
        swayDur: Math.round(r(4, 9) * 10) / 10,
    };
});

// ── Mist layers ──
const MIST_LAYERS = [
    { id: 0, top: '15%', width: 400, height: 120, dur: 30, delay: 0, opacity: 0.06, start: '-50%', end: '120%' },
    { id: 1, top: '45%', width: 500, height: 100, dur: 38, delay: 8, opacity: 0.05, start: '120%', end: '-50%' },
    { id: 2, top: '70%', width: 350, height: 140, dur: 25, delay: 15, opacity: 0.07, start: '-60%', end: '130%' },
    { id: 3, top: '30%', width: 450, height: 90, dur: 35, delay: 20, opacity: 0.04, start: '110%', end: '-40%' },
];

// ── Steam particles for ticker ──
const STEAM_CURLS = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: 20 + i * 15,
    w: 4 + (i % 3) * 3,
    h: 6 + (i % 2) * 5,
    dur: 2.5 + (i * 0.4),
    delay: i * 0.5,
}));

// ── Prayer flags ──
const FLAG_COLORS = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce'];

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
    const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; sx: number; sy: number }>>([]);
    const primaryBtnRef = useRef<HTMLAnchorElement>(null);

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

    // Button ripple + sparkle handler
    const handleBtnClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Ripple
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple-effect';
        ripple.style.left = `${x - 20}px`;
        ripple.style.top = `${y - 20}px`;
        e.currentTarget.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);

        // Sparkles
        const newSparkles = Array.from({ length: 8 }, (_, i) => ({
            id: Date.now() + i,
            x, y,
            sx: (Math.random() - 0.5) * 80,
            sy: -(Math.random() * 60 + 20),
        }));
        setSparkles(prev => [...prev, ...newSparkles]);
        setTimeout(() => setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id))), 700);
    }, []);

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

            {/* ── Snow / Mist Drift (Multi-layer parallax) ── */}
            {mounted && (
                <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
                    {SNOW_PARTICLES.map(p => (
                        <div key={p.id} className="snow-particle"
                            style={{
                                left: `${p.x}%`,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                '--snow-dur': `${p.dur}s`,
                                '--snow-delay': `${p.delay}s`,
                                '--snow-blur': `${p.blur}px`,
                                '--snow-opacity': p.opacity,
                                '--snow-sway': `${p.sway}px`,
                                '--snow-sway-dur': `${p.swayDur}s`,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}

            {/* ── Mist / Fog Layers ── */}
            {mounted && (
                <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
                    {MIST_LAYERS.map(m => (
                        <div key={m.id} className="mist-layer"
                            style={{
                                top: m.top,
                                width: m.width,
                                height: m.height,
                                '--mist-dur': `${m.dur}s`,
                                '--mist-delay': `${m.delay}s`,
                                '--mist-opacity': m.opacity,
                                '--mist-start': m.start,
                                '--mist-end': m.end,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}

            {/* ── Ambient glow blobs ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)', top: '-8%', left: '50%', transform: 'translateX(-50%)' }} />
                <div className="absolute rounded-full" style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', bottom: '5%', right: '-8%' }} />
                <div className="absolute rounded-full" style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)', bottom: '18%', left: '-5%' }} />
            </div>

            {/* ── Prayer Flags (top edge) ── */}
            {mounted && (
                <div className="absolute top-[52px] left-0 right-0 z-[3] pointer-events-none flex items-start justify-center overflow-hidden"
                    style={{ height: 20 }}>
                    {/* String line */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(212,165,116,0.12)' }} />
                    {/* Flags */}
                    <div className="flex gap-[2px]">
                        {Array.from({ length: 28 }, (_, i) => (
                            <div key={i} className="prayer-flag"
                                style={{
                                    background: FLAG_COLORS[i % FLAG_COLORS.length],
                                    '--flag-w': `${12 + (i % 3) * 3}px`,
                                    '--flag-h': `${8 + (i % 2) * 4}px`,
                                    '--flag-dur': `${2.5 + (i % 4) * 0.5}s`,
                                    '--flag-opacity': 0.15 + (i % 3) * 0.05,
                                    animationDelay: `${(i * 0.15) % 2}s`,
                                    clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                                } as React.CSSProperties}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Mountain silhouette with summit draw ── */}
            <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none" style={{ height: 180 }}>
                <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full">
                    {/* Filled silhouettes */}
                    <polygon points="0,120 60,35 120,70 180,12 240,55 310,5 360,42 400,22 400,120" fill="rgba(15,52,96,0.25)" />
                    <polygon points="0,120 40,56 100,85 150,30 200,66 260,20 320,52 380,38 400,58 400,120" fill="rgba(26,35,50,0.18)" />
                    {/* Glowing summit line */}
                    {mounted && (
                        <polyline
                            className="summit-line"
                            points="0,120 60,35 120,70 180,12 240,55 310,5 360,42 400,22"
                            fill="none"
                            stroke="rgba(99,102,241,0.2)"
                            strokeWidth="1.5"
                            style={{ '--summit-len': 600 } as React.CSSProperties}
                        />
                    )}
                </svg>
            </div>

            {/* ── Fog overlays on left & right edges ── */}
            <div className="absolute inset-y-0 left-0 z-[11] pointer-events-none" style={{ width: '30%', background: 'linear-gradient(to right, rgba(6,10,20,0.92) 0%, rgba(6,10,20,0.6) 40%, transparent 100%)' }} />
            <div className="absolute inset-y-0 right-0 z-[11] pointer-events-none" style={{ width: '30%', background: 'linear-gradient(to left, rgba(6,10,20,0.92) 0%, rgba(6,10,20,0.6) 40%, transparent 100%)' }} />

            {/* ── Floating Food Cards ── */}
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
                style={{ paddingLeft: 'max(110px, 30vw)', paddingRight: 'max(110px, 30vw)', paddingTop: 8, paddingBottom: 8 }}>

                {/* Ambient center glow */}
                <div className="absolute rounded-full pointer-events-none"
                    style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%)' }} />

                {/* Mountain badge with aurora pulse */}
                <div style={{ ...fadeStyle(showIcon), marginBottom: 16 }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative animate-aurora-pulse mx-auto"
                        style={{ border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
                        <span className="text-3xl select-none" style={{ animation: 'glow-breathe 4s ease-in-out infinite', display: 'inline-block' }}>🏔️</span>
                        <span className="absolute animate-star-drift" style={{ top: -7, left: 6, fontSize: 9, color: 'rgba(99,102,241,0.5)', animationDelay: '0s' }}>✦</span>
                        <span className="absolute animate-star-drift" style={{ top: 3, right: -9, fontSize: 7, color: 'rgba(59,130,246,0.5)', animationDelay: '1.5s' }}>✧</span>
                        <span className="absolute animate-star-drift" style={{ bottom: -5, right: 5, fontSize: 8, color: 'rgba(99,102,241,0.4)', animationDelay: '3s' }}>✦</span>
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

                {/* CTA Buttons with ripple + sparkle */}
                <div style={{ ...fadeStyle(showBtns), display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    <Link href="/mood" ref={primaryBtnRef}
                        className="yeti-btn-primary flex items-center justify-center gap-1.5 relative"
                        style={{ fontSize: 13, padding: '11px 16px', borderRadius: 12 }}
                        onClick={handleBtnClick}>
                        ✨ AI Journey
                        {/* Sparkles */}
                        {sparkles.map(s => (
                            <span key={s.id} className="sparkle"
                                style={{
                                    left: s.x, top: s.y,
                                    '--spark-x': `${s.sx}px`,
                                    '--spark-y': `${s.sy}px`,
                                } as React.CSSProperties}
                            />
                        ))}
                    </Link>
                    <Link href="/menu" className="yeti-btn-secondary flex items-center justify-center gap-1.5"
                        style={{ fontSize: 13, padding: '11px 16px', borderRadius: 12 }}>
                        📜 View Menu
                    </Link>
                </div>

                {/* Live food ticker with steam */}
                <div style={{ ...fadeStyle(showTicker), marginTop: 20 }}>
                    <div className="inline-flex items-center gap-2 rounded-full relative animate-warm-glow"
                        style={{ padding: '7px 14px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,165,116,0.18)' }}>
                        {/* Steam curls rising from ticker */}
                        {STEAM_CURLS.map(s => (
                            <div key={s.id} className="steam-curl"
                                style={{
                                    left: `${s.left}%`, top: -4,
                                    '--steam-w': `${s.w}px`,
                                    '--steam-h': `${s.h}px`,
                                    '--steam-dur': `${s.dur}s`,
                                    '--steam-delay': `${s.delay}s`,
                                } as React.CSSProperties}
                            />
                        ))}
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
