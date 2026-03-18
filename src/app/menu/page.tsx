'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { MenuItem } from '@/lib/supabase';

const CATEGORIES = [
    'all',
    'Momos',
    'Thakali Thalis',
    'Noodles',
    'Bhutanese Appetizers',
    'Thukpa & Thenthuk',
    'Veg Nepali Appetizers',
    'Non-Veg Nepali Appetizers',
    'Veg Tibetan Appetizers',
    'Non-Veg Tibetan Appetizers',
    'Platters',
    'Mains',
    'Mocktails',
    'Beverages'
];
const DIETARY_FILTERS = ['all', 'veg', 'non-veg', 'egg'];

export default function MenuPage() {
    const { addItem, items: cartItems, itemCount } = useCart();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [dietary, setDietary] = useState('all');
    const [showAddedId, setShowAddedId] = useState<number | null>(null);
    const [selectedItemForOptions, setSelectedItemForOptions] = useState<MenuItem | null>(null);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== 'all') params.set('category', category);
            if (dietary !== 'all') params.set('dietary', dietary);

            const res = await fetch(`/api/menu?${params.toString()}`);
            const data = await res.json();
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMenu();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, dietary]);

    const filteredItems = menuItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const groupedItems = filteredItems.reduce((acc, item) => {
        const cat = item.category.startsWith('Beverages') ? 'Beverages' :
            item.category.includes('Main Course') ? 'Mains' :
                item.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const handleAddItem = (item: MenuItem, option?: string) => {
        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            dietary: item.dietary,
            selectedOption: option
        });
        setSelectedItemForOptions(null);
        setShowAddedId(item.id);
        setTimeout(() => setShowAddedId(null), 1200);
    };

    const getSpiceDots = (level: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className="spice-dot"
                style={{
                    background: i < level ? '#ef4444' : 'rgba(148, 163, 184, 0.2)',
                }}
            />
        ));
    };

    const getItemQuantityInCart = (id: number) => {
        return cartItems.filter(item => item.id === id).reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <div className="min-h-dvh yeti-gradient relative">
            <div className="mountain-bg" />

            {/* Header */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-yeti-bg/80 backdrop-blur-lg border-b border-yeti-border">
                <Link href="/" className="flex items-center gap-2 text-yeti-muted hover:text-yeti-gold transition-colors">
                    <span className="text-xl">←</span>
                    <span className="text-sm font-medium">Home</span>
                </Link>
                <h1 className="font-heading text-lg font-bold text-yeti-gold">Yeti Menu</h1>
                {itemCount > 0 ? (
                    <Link href="/cart" className="relative p-2 flex items-center gap-2 bg-yeti-gold/10 rounded-full pr-4 border border-yeti-gold/20">
                        <span className="text-xl">🛒</span>
                        <span className="text-xs font-bold text-yeti-gold">{itemCount} items</span>
                    </Link>
                ) : <div className="w-10" />}
            </nav>

            <div className="relative z-10 py-6">
                {/* Search */}
                <div className="px-6 mb-6">
                    <div className="yeti-card flex items-center gap-3 px-4 py-3 bg-white/5 border-white/10">
                        <span className="text-yeti-muted">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find momos, thalis, Bhutanese specials..."
                            className="flex-1 bg-transparent text-yeti-text placeholder-yeti-muted/50 text-sm focus:outline-none"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="px-6 mb-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`yeti-chip whitespace-nowrap ${category === cat ? 'active' : ''}`}
                            >
                                {cat === 'all' ? '🍽️ All' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dietary Filter */}
                <div className="px-6 mb-8">
                    <div className="flex gap-2">
                        {DIETARY_FILTERS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDietary(d)}
                                className={`yeti-chip px-4 ${dietary === d ? 'active' : ''}`}
                            >
                                {d === 'all' ? '🍽️ All' : d === 'veg' ? '🥬 Veg' : d === 'non-veg' ? '🍗 Non-Veg' : '🥚 Egg'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                <main className="px-6 pb-24">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="text-6xl animate-bounce">🏔️</div>
                            <p className="text-yeti-muted text-sm animate-pulse">Climbing the mountain for your food...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="text-5xl mb-4 block">🏔️</span>
                            <p className="text-yeti-text font-bold mb-1">No items found</p>
                            <p className="text-yeti-muted text-sm">Try exploring another category</p>
                        </div>
                    ) : (
                        Object.entries(groupedItems).map(([cat, items]) => (
                            <div key={cat} className="mb-10">
                                <h2 className="font-heading text-xl font-bold text-yeti-gold mb-6 pb-2 border-b border-yeti-gold/20 flex items-center justify-between">
                                    {cat}
                                    <span className="text-xs font-normal px-2 py-1 bg-yeti-gold/10 rounded-full text-yeti-gold">
                                        {items.length} dishes
                                    </span>
                                </h2>
                                <div className="grid gap-4">
                                    {items.map((item) => {
                                        const qtyInCart = getItemQuantityInCart(item.id);
                                        return (
                                            <div key={item.id} className="yeti-card group active:scale-[0.98] transition-all overflow-hidden">
                                                <div className="p-4 flex gap-4">
                                                    {/* Item details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center bg-white/5 ${item.dietary === 'veg' ? 'border-green-600' : item.dietary === 'egg' ? 'border-yellow-500' : 'border-red-600'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${item.dietary === 'veg' ? 'bg-green-600' : item.dietary === 'egg' ? 'bg-yellow-500' : 'bg-red-600'}`} />
                                                            </span>
                                                            <h3 className="font-heading text-base font-bold text-yeti-text group-hover:text-yeti-gold transition-colors truncate">
                                                                {item.name}
                                                            </h3>
                                                        </div>
                                                        <p className="text-xs text-yeti-muted mb-3 line-clamp-2 italic leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="font-heading text-lg font-bold text-yeti-gold">
                                                                ₹{item.price}
                                                            </span>
                                                            <div className="flex items-center gap-0.5">
                                                                {getSpiceDots(item.spice_level)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Add button */}
                                                    <div className="flex flex-col items-center justify-center shrink-0 w-24">
                                                        {showAddedId === item.id ? (
                                                            <button className="w-full py-2.5 rounded-xl bg-yeti-green text-white text-xs font-bold shadow-lg shadow-yeti-green/20">
                                                                SAVED!
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => item.options ? setSelectedItemForOptions(item) : handleAddItem(item)}
                                                                className={`w-full py-2.5 rounded-xl text-xs font-black tracking-wider transition-all border ${qtyInCart > 0
                                                                        ? 'bg-yeti-gold text-white border-yeti-gold shadow-lg shadow-yeti-gold/20'
                                                                        : 'bg-white/5 text-yeti-gold border-yeti-gold/30 hover:border-yeti-gold hover:bg-yeti-gold/10'
                                                                    }`}
                                                            >
                                                                {qtyInCart > 0 ? `ADD MORE (${qtyInCart})` : 'ADD +'}
                                                            </button>
                                                        )}
                                                        {item.options && (
                                                            <p className="text-[10px] text-yeti-muted mt-1.5 font-medium animate-pulse">Has options</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </main>
            </div>

            {/* Option Selection Modal */}
            {selectedItemForOptions && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-yeti-card-bg border border-yeti-border rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-heading text-xl font-bold text-yeti-gold mb-1">Customize</h3>
                                <p className="text-sm text-yeti-text">{selectedItemForOptions.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedItemForOptions(null)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-yeti-muted hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs font-bold text-yeti-muted uppercase tracking-widest mb-4">Select Option</p>
                        <div className="space-y-2 mb-8">
                            {selectedItemForOptions.options?.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleAddItem(selectedItemForOptions, opt)}
                                    className="w-full p-4 rounded-2xl border border-yeti-border hover:border-yeti-gold hover:bg-yeti-gold/10 text-left flex items-center justify-between group transition-all"
                                >
                                    <span className="font-bold text-yeti-text group-hover:text-yeti-gold">{opt}</span>
                                    <span className="text-yeti-gold font-bold">+</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedItemForOptions(null)}
                            className="w-full py-4 text-yeti-muted text-sm font-bold active:scale-95 transition-transform"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Cart Bar */}
            {itemCount > 0 && !selectedItemForOptions && (
                <div className="fixed bottom-6 left-6 right-6 z-50 animate-slide-up">
                    <Link
                        href="/cart"
                        className="bg-yeti-gold hover:bg-yeti-amber text-white p-4 rounded-2xl shadow-2xl shadow-yeti-gold/40 flex items-center justify-between transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">🛒</div>
                            <div>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Your Order</p>
                                <p className="font-bold leading-none">{itemCount} Dishes Added</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-heading font-black pr-2">VIEW CART</span>
                            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
