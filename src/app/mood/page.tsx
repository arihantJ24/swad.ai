'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MOODS = [
    { id: 'warm-mountain', emoji: '🏔️', label: 'Warm Like a Mountain Home', desc: 'Comforting, hearty, soul-warming' },
    { id: 'high-altitude', emoji: '🧗', label: 'Taste the High Altitude', desc: 'Bold, adventurous, unique flavors' },
    { id: 'festival-feast', emoji: '🎉', label: 'Himalayan Festival Feast', desc: 'Celebratory, grand, indulgent' },
    { id: 'slow-evening', emoji: '☁️', label: 'Slow Evening in the Hills', desc: 'Light, relaxing, unhurried' },
    { id: 'fresh-valley', emoji: '🌿', label: 'Fresh from the Valley', desc: 'Healthy, light, garden-fresh' },
    { id: 'tibetan-street', emoji: '🌶️', label: 'Bold Tibetan Street Style', desc: 'Spicy, street food, punchy' },
    { id: 'monastery-sweet', emoji: '🍯', label: 'Monastery Sweet Cravings', desc: 'Sweet treats, desserts, warmth' },
    { id: 'traveler-quick', emoji: '⚡', label: "Traveler's Quick Bite", desc: 'Fast, filling, on-the-go' },
];

export default function MoodPage() {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [customThought, setCustomThought] = useState('');

    const handleContinue = () => {
        if (!selectedMood && !customThought.trim()) return;
        const mood = selectedMood ? MOODS.find((m) => m.id === selectedMood)?.label : customThought;
        const params = new URLSearchParams();
        params.set('mood', mood || '');
        if (customThought.trim()) params.set('custom', customThought.trim());
        router.push(`/preferences?${params.toString()}`);
    };

    return (
        <div className="min-h-dvh yeti-gradient relative">
            <div className="mountain-bg" />

            {/* Header */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5">
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

                {/* Mood Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {MOODS.map((mood, i) => (
                        <button
                            key={mood.id}
                            onClick={() => setSelectedMood(mood.id === selectedMood ? null : mood.id)}
                            className={`yeti-card p-4 text-left transition-all duration-300 ${selectedMood === mood.id
                                    ? 'border-yeti-gold bg-yeti-gold/10 shadow-lg shadow-yeti-gold/10'
                                    : ''
                                }`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <span className="text-2xl mb-2 block">{mood.emoji}</span>
                            <h3 className="font-heading text-sm font-semibold text-yeti-text leading-tight mb-1">
                                {mood.label}
                            </h3>
                            <p className="text-xs text-yeti-muted leading-snug">{mood.desc}</p>
                        </button>
                    ))}
                </div>

                {/* Custom thought */}
                <div className="yeti-card p-4 mb-6">
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
                >
                    Continue →
                </button>
            </main>
        </div>
    );
}
