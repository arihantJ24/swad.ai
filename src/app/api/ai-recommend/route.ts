import { NextResponse } from 'next/server';
import { getAIRecommendations, AIRecommendationRequest } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body: AIRecommendationRequest = await request.json();

        if (!body.mood || !body.mealType || !body.dietary) {
            return NextResponse.json(
                { error: 'Missing required fields: mood, mealType, dietary' },
                { status: 400 }
            );
        }

        const recommendations = await getAIRecommendations(body);

        return NextResponse.json({ itineraries: recommendations });
    } catch (error) {
        console.error('AI recommendation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
