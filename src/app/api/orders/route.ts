import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.items || !body.total) {
            return NextResponse.json({ error: 'Missing items or total' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                table_number: body.table_number || null,
                items: body.items,
                total: body.total,
                status: 'confirmed',
                payment_method: body.payment_method || 'cash',
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
