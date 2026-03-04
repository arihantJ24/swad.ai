'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem } from '@/lib/supabase';

type CartState = {
    items: CartItem[];
    total: number;
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: number }
    | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find((item) =>
                item.id === action.payload.id && item.selectedOption === action.payload.selectedOption
            );
            let newItems;
            if (existing) {
                newItems = state.items.map((item) =>
                    (item.id === action.payload.id && item.selectedOption === action.payload.selectedOption)
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                newItems = [...state.items, action.payload];
            }
            const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { items: newItems, total };
        }
        case 'REMOVE_ITEM': {
            // Updated to handle complex IDs if needed, but for now using index or simple filter
            const newItems = state.items.filter((_, index) => index !== action.payload);
            const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { items: newItems, total };
        }
        case 'UPDATE_QUANTITY': {
            const newItems = state.items.map((item, index) =>
                index === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
            ).filter(item => item.quantity > 0);
            const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { items: newItems, total };
        }
        case 'CLEAR_CART':
            return { items: [], total: 0 };
        case 'LOAD_CART': {
            const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { items: action.payload, total };
        }
        default:
            return state;
    }
}

type CartContextType = {
    items: CartItem[];
    total: number;
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

    useEffect(() => {
        const saved = localStorage.getItem('yeti-cart');
        if (saved) {
            try {
                const items = JSON.parse(saved);
                dispatch({ type: 'LOAD_CART', payload: items });
            } catch { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('yeti-cart', JSON.stringify(state.items));
    }, [state.items]);

    const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: item.quantity || 1 } });
    };

    const removeItem = (id: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
    };

    const updateQuantity = (id: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items: state.items, total: state.total, addItem, removeItem, updateQuantity, clearCart, itemCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
