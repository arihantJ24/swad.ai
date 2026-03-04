'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STEPS = [
    {
        id: 'meal',
        question: 'What meal are you looking for?',
        options: [
            { label: '🌅 Breakfast', value: 'breakfast' },
            { label: '☀️ Lunch', value: 'lunch' },
            { label: '🌙 Dinner', value: 'dinner' },
            { label: '🍿 Snack', value: 'snack' },
        ],
    },
    {
        id: 'dietary',
        question: 'Any dietary preferences?',
        options: [
            { label: '🥬 Veg', value: 'veg' },
            { label: '🍗 Non-Veg', value: 'non-veg' },
            { label: '🌱 Vegan', value: 'vegan' },
            { label: '🕉️ Jain', value: 'jain' },
        ],
    },
    {
        id: 'spice',
        question: 'How much spice can you handle?',
        type: 'slider',
        labels: ['Mild', 'Medium', 'Hot', 'Fire', '🔥 Volcano'],
    },
    {
        id: 'experience',
        question: 'Himalayan food experience?',
        options: [
            { label: '🆕 First Timer', value: 'first-time' },
            { label: '🏔️ Been There, Eaten That', value: 'experienced' },
        ],
    },
    {
        id: 'budget',
        question: "What's your budget?",
        options: [
            { label: '💰 ₹200 – ₹400', value: '200-400' },
            { label: '💎 ₹400 – ₹700', value: '400-700' },
            { label: '👑 ₹700+', value: '700+' },
        ],
    },
];

function PreferencesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mood = searchParams.get('mood') || '';
    const custom = searchParams.get('custom') || '';

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [spiceLevel, setSpiceLevel] = useState(3);

    const currentStep = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    const handleSelect = (value: string) => {
        const newAnswers = { ...answers, [currentStep.id]: value };
        setAnswers(newAnswers);

        if (step < STEPS.length - 1) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            finishPreferences(newAnswers);
        }
    };

    const handleSpiceConfirm = () => {
        const newAnswers = { ...answers, spice: spiceLevel.toString() };
        setAnswers(newAnswers);
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            finishPreferences(newAnswers);
        }
    };

    const finishPreferences = (finalAnswers: Record<string, string>) => {
        const params = new URLSearchParams();
        params.set('mood', mood);
        if (custom) params.set('custom', custom);
        params.set('meal', finalAnswers.meal || 'dinner');
        params.set('dietary', finalAnswers.dietary || 'non-veg');
        params.set('spice', finalAnswers.spice || '3');
        params.set('experience', finalAnswers.experience || 'first-time');
        params.set('budget', finalAnswers.budget || '400-700');
        router.push(`/loading-ai?${params.toString()}`);
    };

    return (
        <div className="min-h-dvh yeti-gradient relative">
            <div className="mountain-bg" />

            <nav className="relative z-10 flex items-center justify-between px-6 py-5">
                <button
                    onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
                    className="flex items-center gap-2 text-yeti-muted hover:text-yeti-gold transition-colors"
                >
                    <span className="text-xl">←</span>
                    <span className="text-sm">Back</span>
                </button>
                <span className="text-xs text-yeti-muted uppercase tracking-[0.15em]">Step 2 of 3</span>
            </nav>

            <main className="relative z-10 px-6 pb-8 max-w-lg mx-auto">
                {/* Progress bar */}
                <div className="w-full h-1 bg-yeti-border rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yeti-gold to-yeti-amber rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question */}
                <div className="text-center mb-8 animate-slide-up" key={step}>
                    <h2 className="font-heading text-2xl font-bold text-yeti-text mb-2">
                        {currentStep.question}
                    </h2>
                    <p className="text-yeti-muted text-xs">
                        Question {step + 1} of {STEPS.length}
                    </p>
                </div>

                {/* Options */}
                {currentStep.type === 'slider' ? (
                    <div className="animate-slide-up" key={`slider-${step}`}>
                        <div className="yeti-card p-8 text-center">
                            <div className="text-5xl mb-4">
                                {['😌', '😊', '😋', '🥵', '🌋'][spiceLevel - 1]}
                            </div>
                            <p className="font-heading text-lg font-semibold text-yeti-gold mb-6">
                                {currentStep.labels![spiceLevel - 1]}
                            </p>
                            <input
                                type="range"
                                min={1}
                                max={5}
                                value={spiceLevel}
                                onChange={(e) => setSpiceLevel(parseInt(e.target.value))}
                                className="w-full accent-yeti-gold mb-6"
                            />
                            <div className="flex justify-between text-xs text-yeti-muted mb-6">
                                <span>Mild</span>
                                <span>🔥 Volcano</span>
                            </div>
                            <button onClick={handleSpiceConfirm} className="yeti-btn-primary w-full">
                                Confirm Spice Level →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3" key={`options-${step}`}>
                        {currentStep.options!.map((option, i) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`animate-slide-up yeti-card w-full p-5 text-left text-lg font-heading font-medium flex items-center gap-4 ${answers[currentStep.id] === option.value
                                        ? 'border-yeti-gold bg-yeti-gold/10'
                                        : ''
                                    }`}
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <span className="text-2xl">{option.label.split(' ')[0]}</span>
                                <span>{option.label.split(' ').slice(1).join(' ')}</span>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function PreferencesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-dvh yeti-gradient flex items-center justify-center">
                <div className="animate-spin-slow text-4xl">🏔️</div>
            </div>
        }>
            <PreferencesContent />
        </Suspense>
    );
}
