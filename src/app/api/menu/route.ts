import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const dietary = searchParams.get('dietary');
    const spiceLevel = searchParams.get('spice_level');
    const search = searchParams.get('search');
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');

    let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('price');

    if (category && category !== 'all') {
        query = query.eq('category', category);
    }
    if (dietary && dietary !== 'all') {
        query = query.eq('dietary', dietary);
    }
    if (spiceLevel) {
        query = query.lte('spice_level', parseInt(spiceLevel));
    }
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }
    if (priceMin) {
        query = query.gte('price', parseInt(priceMin));
    }
    if (priceMax) {
        query = query.lte('price', parseInt(priceMax));
    }

    const { data, error } = await query;

    if (error) {
        console.error('Database error fetching menu:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
