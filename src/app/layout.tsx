import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Yeti – The Himalayan Kitchen | AI Mood-Based Ordering',
    description:
        'Discover your perfect Himalayan meal. Let AI guide you through authentic Nepali, Tibetan, Bhutanese, and Northeastern Indian cuisine based on your mood.',
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#0a0e17',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="antialiased">
                <CartProvider>{children}</CartProvider>
            </body>
        </html>
    );
}
