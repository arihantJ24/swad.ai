import { NextResponse } from 'next/server';
import { getAIRecommendationsWithUsage, AIRecommendationRequest } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body: AIRecommendationRequest = await request.json();

        if (!body.mood || !body.mealType || !body.dietary) {
            return NextResponse.json(
                { error: 'Missing required fields: mood, mealType, dietary' },
                { status: 400 }
            );
        }

        const { itineraries, usage } = await getAIRecommendationsWithUsage(body);

        return NextResponse.json({
            itineraries,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
        });
    } catch (error) {
        console.error('AI recommendation error:', error);
        const message =
            error instanceof Error ? error.message : 'Failed to generate recommendations';
        const status =
            typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            typeof (error as { status?: unknown }).status === 'number'
                ? (error as { status: number }).status
                : /quota|Too Many Requests|429/i.test(message)
                    ? 429
                    : 500;
        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
