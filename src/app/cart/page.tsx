'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const router = useRouter();
    const { items, total, updateQuantity, removeItem, clearCart, itemCount } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [tableNumber, setTableNumber] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        setIsOrdering(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    total,
                    table_number: tableNumber ? parseInt(tableNumber) : null,
                    payment_method: paymentMethod,
                }),
            });

            const order = await res.json();
            if (order.id) {
                sessionStorage.setItem('yeti-order', JSON.stringify(order));
                clearCart();
                router.push('/confirmation');
            }
        } catch (error) {
            console.error('Order error:', error);
            setIsOrdering(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-dvh yeti-gradient relative flex flex-col items-center justify-center px-6">
                <div className="mountain-bg" />
                <div className="relative z-10 text-center">
                    <span className="text-6xl mb-4 block">🏔️</span>
                    <h2 className="font-heading text-xl font-bold text-yeti-text mb-2">Your cart is empty</h2>
                    <p className="text-yeti-muted text-sm mb-6">Start exploring the Himalayan menu!</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/mood" className="yeti-btn-primary text-center">✨ Start AI Journey</Link>
                        <Link href="/menu" className="yeti-btn-secondary text-center">📜 Browse Menu</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh yeti-gradient relative">
            <div className="mountain-bg" />

            {/* Header */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-yeti-muted hover:text-yeti-gold transition-colors"
                >
                    <span className="text-xl">←</span>
                    <span className="text-sm">Back</span>
                </button>
                <h1 className="font-heading text-lg font-bold text-yeti-gold">Your Cart</h1>
                <button
                    onClick={clearCart}
                    className="text-xs text-yeti-red hover:text-red-400 transition-colors"
                >
                    Clear All
                </button>
            </nav>

            <main className="relative z-10 px-6 pb-8 max-w-lg mx-auto">
                {/* Cart Items */}
                <div className="space-y-4 mb-8">
                    {items.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="yeti-card p-5 group hover:border-yeti-gold/50 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-heading text-base font-bold text-yeti-text truncate">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] text-yeti-muted uppercase tracking-widest">{item.category}</p>
                                        {item.selectedOption && (
                                            <span className="px-1.5 py-0.5 rounded bg-yeti-gold/10 text-yeti-gold text-[10px] font-black border border-yeti-gold/20">
                                                {item.selectedOption}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-yeti-muted hover:text-yeti-red hover:bg-yeti-red/10 transition-all ml-3"
                                >
                                    🗑️
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 bg-white/5 rounded-xl p-1 px-3 border border-white/10">
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                        className="text-yeti-text hover:text-yeti-gold transition-colors font-black text-lg p-1"
                                    >
                                        −
                                    </button>
                                    <span className="font-heading font-black text-yeti-text w-6 text-center text-sm">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                        className="text-yeti-text hover:text-yeti-gold transition-colors font-black text-lg p-1"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-yeti-muted line-through opacity-50">₹{item.price}</p>
                                    <span className="font-heading font-black text-yeti-gold text-lg">
                                        ₹{item.price * item.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Number */}
                <div className="yeti-card p-5 mb-5 bg-white/5">
                    <label className="text-[10px] text-yeti-muted uppercase font-black tracking-widest mb-3 block">
                        Dining Information
                    </label>
                    <div className="flex items-center gap-4 border-b border-yeti-border pb-2 group-focus-within:border-yeti-gold transition-colors">
                        <span className="text-xl">🪑</span>
                        <input
                            type="number"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Your Table Number"
                            className="w-full bg-transparent text-yeti-text placeholder-yeti-muted/40 text-sm focus:outline-none"
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="yeti-card p-4 mb-6">
                    <label className="text-xs text-yeti-muted uppercase tracking-wider mb-3 block">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'upi', label: '📱 UPI' },
                            { id: 'card', label: '💳 Card' },
                            { id: 'cash', label: '💵 Cash' },
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`py-3 rounded-xl text-sm font-medium transition-all ${paymentMethod === method.id
                                    ? 'bg-yeti-gold/20 border border-yeti-gold text-yeti-gold'
                                    : 'bg-yeti-border/30 border border-transparent text-yeti-muted hover:border-yeti-border'
                                    }`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="yeti-card p-5 mb-6">
                    <h3 className="font-heading font-bold text-yeti-text mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-yeti-muted">
                            <span>Subtotal ({itemCount} items)</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="flex justify-between text-yeti-muted">
                            <span>GST (5%)</span>
                            <span>₹{Math.round(total * 0.05)}</span>
                        </div>
                        <div className="border-t border-yeti-border pt-2 flex justify-between">
                            <span className="font-heading font-bold text-yeti-text">Total</span>
                            <span className="font-heading font-bold text-yeti-gold text-lg">
                                ₹{Math.round(total * 1.05)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Place Order */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={isOrdering}
                    className={`yeti-btn-primary w-full text-center text-lg ${isOrdering ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                >
                    {isOrdering ? '🔄 Placing Order...' : `🍽️ Place Order · ₹${Math.round(total * 1.05)}`}
                </button>

                <Link href="/menu" className="block mt-3 text-center text-yeti-muted text-sm hover:text-yeti-gold transition-colors">
                    + Add more items
                </Link>
            </main>
        </div>
    );
}
