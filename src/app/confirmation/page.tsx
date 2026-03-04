'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrderData = {
    id: string;
    table_number: number | null;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    status: string;
    payment_method: string;
    created_at: string;
};

export default function ConfirmationPage() {
    const [order, setOrder] = useState<OrderData | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('yeti-order');
        if (stored) {
            try {
                setOrder(JSON.parse(stored));
            } catch { }
        }
    }, []);

    if (!order) {
        return (
            <div className="min-h-dvh yeti-gradient relative flex flex-col items-center justify-center px-6">
                <div className="mountain-bg" />
                <div className="relative z-10 text-center">
                    <span className="text-5xl mb-4 block">🏔️</span>
                    <h2 className="font-heading text-xl font-bold text-yeti-text mb-2">No order found</h2>
                    <Link href="/" className="yeti-btn-primary mt-4 inline-block">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh yeti-gradient relative">
            <div className="mountain-bg" />

            {/* Floating particles */}
            <div className="float-particle" style={{ left: '20%', top: '30%', animationDelay: '0s' }} />
            <div className="float-particle" style={{ left: '70%', top: '40%', animationDelay: '2s' }} />
            <div className="float-particle" style={{ left: '40%', top: '50%', animationDelay: '4s' }} />

            <main className="relative z-10 px-6 py-12 max-w-lg mx-auto text-center">
                {/* Success animation */}
                <div className="animate-slide-up mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yeti-green/10 border-2 border-yeti-green flex items-center justify-center" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
                        <span className="text-4xl">✓</span>
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-yeti-text mb-1">Order Confirmed!</h2>
                    <p className="text-yeti-muted text-sm">Your Himalayan feast is being prepared</p>
                </div>

                {/* Order details */}
                <div className="yeti-card p-5 text-left mb-6 animate-slide-up-delay-1">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-xs text-yeti-muted uppercase tracking-wider">Order ID</p>
                            <p className="font-heading font-bold text-yeti-gold text-sm">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-yeti-muted uppercase tracking-wider">Status</p>
                            <span className="inline-flex items-center gap-1 text-yeti-green text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-yeti-green animate-pulse" />
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {order.table_number && (
                        <div className="bg-yeti-gold/5 rounded-lg p-3 mb-4 border border-yeti-gold/10">
                            <p className="text-xs text-yeti-muted">Table Number</p>
                            <p className="font-heading font-bold text-yeti-gold text-lg">#{order.table_number}</p>
                        </div>
                    )}

                    <div className="border-t border-yeti-border pt-4">
                        <p className="text-xs text-yeti-muted uppercase tracking-wider mb-3">Items</p>
                        <div className="space-y-2">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-yeti-text">
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span className="text-yeti-muted">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-yeti-border mt-4 pt-4">
                        <div className="flex justify-between text-sm text-yeti-muted mb-1">
                            <span>Subtotal</span>
                            <span>₹{order.total}</span>
                        </div>
                        <div className="flex justify-between text-sm text-yeti-muted mb-2">
                            <span>GST (5%)</span>
                            <span>₹{Math.round(order.total * 0.05)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-heading font-bold text-yeti-text">Total Paid</span>
                            <span className="font-heading font-bold text-yeti-gold text-lg">
                                ₹{Math.round(order.total * 1.05)}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-yeti-border mt-4 pt-4 flex justify-between text-sm">
                        <span className="text-yeti-muted">Payment</span>
                        <span className="text-yeti-text capitalize">
                            {order.payment_method === 'upi' ? '📱 UPI' : order.payment_method === 'card' ? '💳 Card' : '💵 Cash'}
                        </span>
                    </div>
                </div>

                {/* Estimated time */}
                <div className="yeti-card p-4 mb-6 animate-slide-up-delay-2">
                    <p className="text-xs text-yeti-muted uppercase tracking-wider mb-1">Estimated Preparation Time</p>
                    <p className="font-heading text-2xl font-bold text-yeti-gold">20-25 mins</p>
                    <p className="text-xs text-yeti-muted mt-1">Freshly prepared from the Himalayan kitchen 🏔️</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 animate-slide-up-delay-3">
                    <Link href="/" className="yeti-btn-primary w-full text-center block">
                        🏠 Back to Home
                    </Link>
                    <Link href="/menu" className="yeti-btn-secondary w-full text-center block">
                        📜 Order More
                    </Link>
                </div>
            </main>
        </div>
    );
}
