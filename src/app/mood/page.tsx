'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MOODS = [
    { id: 'warm-mountain', emoji: '🏔️', label: 'Warm Like a Mountain Home', desc: 'Comforting, hearty, soul-warming', gradient: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)' },
    { id: 'high-altitude', emoji: '🧗', label: 'Taste the High Altitude', desc: 'Bold, adventurous, unique flavors', gradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' },
    { id: 'festival-feast', emoji: '🎉', label: 'Himalayan Festival Feast', desc: 'Celebratory, grand, indulgent', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
    { id: 'slow-evening', emoji: '☁️', label: 'Slow Evening in the Hills', desc: 'Light, relaxing, unhurried', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' },
    { id: 'fresh-valley', emoji: '🌿', label: 'Fresh from the Valley', desc: 'Healthy, light, garden-fresh', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { id: 'tibetan-street', emoji: '🌶️', label: 'Bold Tibetan Street Style', desc: 'Spicy, street food, punchy', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    { id: 'monastery-sweet', emoji: '🍯', label: 'Monastery Sweet Cravings', desc: 'Sweet treats, desserts, warmth', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { id: 'traveler-quick', emoji: '⚡', label: "Traveler's Quick Bite", desc: 'Fast, filling, on-the-go', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' },
];

// Snowfall for mood page
const SNOW = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.round((i * 31.7 + 5) % 100),
    size: 2 + ((i * 17) % 5),
    dur: 10 + ((i * 7) % 12),
    delay: ((i * 1.7) % 8),
    sway: 10 + ((i * 13) % 25) * (i % 2 === 0 ? 1 : -1),
    opacity: 0.15 + ((i * 11) % 30) / 100,
    blur: ((i * 3) % 3) * 0.5,
}));

// Trail steps
const TRAIL_STEPS = [
    { label: 'Mood', icon: '🎭', active: true },
    { label: 'Preferences', icon: '⚙️', active: false },
    { label: 'Discover', icon: '🏔️', active: false },
];

export default function MoodPage() {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [customThought, setCustomThought] = useState('');
    const [cardsRevealed, setCardsRevealed] = useState(false);
    const [selectedGradient, setSelectedGradient] = useState<string | null>(null);

    useEffect(() => {
        // Stagger-reveal mood cards
        const t = setTimeout(() => setCardsRevealed(true), 300);
        return () => clearTimeout(t);
    }, []);

    const handleMoodSelect = (mood: typeof MOODS[0]) => {
        if (mood.id === selectedMood) {
            setSelectedMood(null);
            setSelectedGradient(null);
        } else {
            setSelectedMood(mood.id);
            setSelectedGradient(mood.gradient);
        }
    };

    const handleContinue = () => {
        if (!selectedMood && !customThought.trim()) return;
        const mood = selectedMood ? MOODS.find((m) => m.id === selectedMood)?.label : customThought;
        const params = new URLSearchParams();
        params.set('mood', mood || '');
        if (customThought.trim()) params.set('custom', customThought.trim());
        router.push(`/preferences?${params.toString()}`);
    };

    return (
        <div className="min-h-dvh relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #060a14 0%, #0d1220 40%, #111827 75%, #0c1a27 100%)' }}>

            {/* Ambient mood-shift glow */}
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                style={{
                    opacity: selectedGradient ? 0.12 : 0,
                    background: selectedGradient || 'transparent',
                }} />

            {/* Mountain BG */}
            <div className="mountain-bg" />

            {/* Snow particles */}
            <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
                {SNOW.map(p => (
                    <div key={p.id} className="snow-particle"
                        style={{
                            left: `${p.x}%`,
                            width: `${p.size}px`, height: `${p.size}px`,
                            '--snow-dur': `${p.dur}s`,
                            '--snow-delay': `${p.delay}s`,
                            '--snow-blur': `${p.blur}px`,
                            '--snow-opacity': p.opacity,
                            '--snow-sway': `${p.sway}px`,
                            '--snow-sway-dur': `${4 + (p.id % 4)}s`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Trail Progress Bar */}
            <div className="relative z-10 px-6 pt-4">
                <div className="flex items-center justify-center gap-1 mb-2">
                    {TRAIL_STEPS.map((step, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-500 ${step.active
                                ? 'bg-yeti-gold/15 border border-yeti-gold/40 text-yeti-gold'
                                : 'bg-white/5 border border-white/10 text-yeti-muted/50'
                                }`}>
                                <span style={{ fontSize: 11 }}>{step.icon}</span>
                                <span>{step.label}</span>
                            </div>
                            {i < TRAIL_STEPS.length - 1 && (
                                <div className="w-6 h-px bg-white/10" />
                            )}
                        </div>
                    ))}
                </div>
                {/* Yeti paw on active step */}
                <div className="flex justify-center">
                    <span style={{ fontSize: 8, color: '#d4a574', opacity: 0.6 }}>🐾</span>
                </div>
            </div>

            {/* Header */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-3">
                <Link href="/" className="flex items-center gap-2 text-yeti-muted hover:text-yeti-gold transition-colors">
                    <span className="text-xl">←</span>
                    <span className="text-sm">Back</span>
                </Link>
                <span className="text-xs text-yeti-muted uppercase tracking-[0.15em]">Step 1 of 3</span>
            </nav>

            <main className="relative z-10 px-6 pb-8 max-w-2xl mx-auto">
                <div className="text-center mb-8 animate-slide-up">
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-yeti-gold to-yeti-amber bg-clip-text text-transparent">
                            How are you feeling?
                        </span>
                    </h2>
                    <p className="text-yeti-muted text-sm">Pick a mood and we&apos;ll craft your perfect Himalayan meal</p>
                </div>

                {/* Mood Grid with stagger animation */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {MOODS.map((mood, i) => (
                        <button
                            key={mood.id}
                            onClick={() => handleMoodSelect(mood)}
                            className={`yeti-card p-4 text-left transition-all duration-300 ${cardsRevealed ? 'animate-mood-enter' : 'opacity-0'
                                } ${selectedMood === mood.id
                                    ? 'border-yeti-gold bg-yeti-gold/10 shadow-lg shadow-yeti-gold/10 scale-[1.03]'
                                    : selectedMood ? 'opacity-60 scale-[0.97]' : ''
                                }`}
                            style={{
                                animationDelay: `${i * 0.08}s`,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Subtle mood-color glow when selected */}
                            {selectedMood === mood.id && (
                                <div className="absolute inset-0 pointer-events-none opacity-10"
                                    style={{ background: mood.gradient }} />
                            )}
                            <span className="text-2xl mb-2 block relative z-10"
                                style={{
                                    transform: selectedMood === mood.id ? 'scale(1.2)' : 'scale(1)',
                                    transition: 'transform 0.3s cubic-bezier(.34,1.4,.64,1)',
                                }}>{mood.emoji}</span>
                            <h3 className="font-heading text-sm font-semibold text-yeti-text leading-tight mb-1 relative z-10">
                                {mood.label}
                            </h3>
                            <p className="text-xs text-yeti-muted leading-snug relative z-10">{mood.desc}</p>

                            {/* Spice particles for spicy mood */}
                            {selectedMood === mood.id && mood.id === 'tibetan-street' && (
                                <>
                                    {[0, 1, 2, 3, 4].map(j => (
                                        <div key={j} className="spice-particle"
                                            style={{
                                                left: `${20 + j * 15}%`, bottom: '30%',
                                                background: j % 2 === 0 ? '#ef4444' : '#f97316',
                                                '--spice-y': `${-20 - j * 8}px`,
                                                '--spice-x': `${(j - 2) * 8}px`,
                                                '--spice-dur': `${1.5 + j * 0.3}s`,
                                                '--spice-delay': `${j * 0.2}s`,
                                            } as React.CSSProperties}
                                        />
                                    ))}
                                </>
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom thought */}
                <div className="yeti-card p-4 mb-6" style={{ animation: cardsRevealed ? 'fade-in-up 0.5s ease-out 0.7s forwards' : 'none', opacity: cardsRevealed ? undefined : 0 }}>
                    <label className="text-xs text-yeti-muted uppercase tracking-wider mb-2 block">
                        Or share your thoughts...
                    </label>
                    <textarea
                        value={customThought}
                        onChange={(e) => setCustomThought(e.target.value)}
                        placeholder="I'm craving something warm and soupy, maybe with a hint of chili..."
                        className="w-full bg-transparent text-yeti-text placeholder-yeti-muted/50 text-sm resize-none focus:outline-none min-h-[70px]"
                        rows={3}
                    />
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!selectedMood && !customThought.trim()}
                    className={`yeti-btn-primary w-full text-center ${!selectedMood && !customThought.trim() ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                    style={{
                        animation: cardsRevealed ? 'fade-in-up 0.5s ease-out 0.85s forwards' : 'none',
                        opacity: cardsRevealed ? undefined : 0,
                    }}
                >
                    Continue →
                </button>
            </main>
        </div>
    );
}
