import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getOpenAIClient(): OpenAI {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('Missing OPENAI_API_KEY environment variable');
    return new OpenAI({ apiKey: key });
}

function getGeminiClient(): GoogleGenerativeAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('Missing GEMINI_API_KEY environment variable');
    return new GoogleGenerativeAI(key);
}

export type MealItinerary = {
    name: string;
    tagline: string;
    main: { name: string; price: number; description: string };
    side: { name: string; price: number; description: string };
    drink: { name: string; price: number; description: string };
    dessert: { name: string; price: number; description: string } | null;
    total: number;
    why_it_matches: string;
    add_ons: { name: string; price: number }[];
};

export type AIRecommendationRequest = {
    mood: string;
    mealType: string;
    dietary: string;
    spiceLevel: number;
    experience: string;
    budget: string;
    customThought?: string;
};

export type AIUsage = {
    inputTokens: number | null;
    outputTokens: number | null;
};

/**
 * Fetch all available menu items from the database and format them into
 * a structured string the LLM can reason over.
 */
async function fetchMenuForPrompt(): Promise<string> {
    const { data: items, error } = await supabase
        .from('menu_items')
        .select('name, category, subcategory, price, dietary, spice_level, description, options')
        .eq('is_available', true)
        .order('category')
        .order('price');

    if (error || !items || items.length === 0) {
        console.error('Failed to fetch menu from database:', error);
        return 'Menu could not be loaded – use your best knowledge of Himalayan cuisine.';
    }

    // Group items by category for a cleaner prompt
    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    }

    let menuText = '';
    for (const [category, catItems] of Object.entries(grouped)) {
        menuText += `\n### ${category}\n`;
        for (const item of catItems) {
            const opts = item.options ? ` [Options: ${(item.options as string[]).join(', ')}]` : '';
            const desc = item.description ? ` – ${item.description}` : '';
            menuText += `- ${item.name} | ₹${item.price} | ${item.dietary} | Spice ${item.spice_level}/5${desc}${opts}\n`;
        }
    }

    return menuText;
}

function buildSystemPrompt(menuText: string): string {
    return `You are a Himalayan cuisine expert and meal curator working at Yeti – The Himalayan Kitchen, a restaurant specializing in authentic Nepali, Tibetan, Bhutanese, and Northeastern Indian cuisine.

Your job is to create personalised meal itineraries for customers based on their mood, dietary needs, spice tolerance, budget, and experience level.

## RULES
1. You MUST only recommend dishes that appear in the MENU below – never invent dishes.
2. Each itinerary must contain EXACTLY:
   - 1 Main dish (from Main Course, Platters, Thalis, Bhutanese, Momos, Thukpa, or Noodles)
   - 1 Side dish (from Appetizers, Breads, Rice, or a lighter category)
   - 1 Drink (from Beverages, Mocktails, or Tea/Coffee)
   - 1 Optional Dessert (from Shakes or Beverages – can be null for budget-friendly options)
   - A "why_it_matches" sentence connecting the meal to the user's stated mood/vibe
   - 2 smart add-on suggestions from the menu
3. Respect dietary restrictions STRICTLY (veg/non-veg/vegan/egg).
4. Respect the spice level – never exceed the user's stated tolerance.
5. Match the budget range as closely as possible.
6. Give each itinerary a creative name and a short catchy tagline.
7. Make the 3 itineraries noticeably different from each other (different cuisines / categories).

## OUTPUT FORMAT
Return ONLY valid JSON – no markdown fences, no extra text, no explanation.
{
  "itineraries": [
    {
      "name": "Creative itinerary name",
      "tagline": "A short catchy tagline",
      "main": { "name": "Exact dish name from menu", "price": 399, "description": "Short flavour description" },
      "side": { "name": "Exact dish name from menu", "price": 99, "description": "Short description" },
      "drink": { "name": "Exact drink name from menu", "price": 149, "description": "Short description" },
      "dessert": { "name": "Exact dessert name from menu", "price": 179, "description": "Short description" },
      "total": 826,
      "why_it_matches": "Because this meal ...",
      "add_ons": [
        { "name": "Exact dish name", "price": 99 },
        { "name": "Exact dish name", "price": 149 }
      ]
    }
  ]
}

Prices are in Indian Rupees (₹). The "total" field must be the arithmetic sum of main + side + drink + dessert prices.

## RESTAURANT MENU
${menuText}`;
}

export async function getAIRecommendations(
    request: AIRecommendationRequest
): Promise<MealItinerary[]> {
    // 1. Fetch real menu from the database
    const menuText = await fetchMenuForPrompt();

    // 2. Build the system prompt with real menu data
    const systemPrompt = buildSystemPrompt(menuText);

    // 3. Build user prompt from preferences
    const budgetHint = request.budget
        ? `My budget for the full meal is around ₹${request.budget}.`
        : '';

    const userPrompt = `
My mood / vibe right now: ${request.mood}
${request.customThought ? `Additional thoughts: ${request.customThought}` : ''}
Meal type I'm looking for: ${request.mealType}
Dietary preference: ${request.dietary}
My spice tolerance: ${request.spiceLevel}/5
My experience with Himalayan food: ${request.experience}
${budgetHint}

Please suggest 3 distinct meal itineraries that match my mood and preferences. Remember to use ONLY dishes from the menu provided.`;

    try {
        const { text: responseText } = await generateWithProvider({ systemPrompt, userPrompt });

        // Extract JSON from the response (handle potential markdown fences)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in AI response');

        const parsed = JSON.parse(jsonMatch[0]);

        if (!parsed.itineraries || !Array.isArray(parsed.itineraries)) {
            throw new Error('Response missing itineraries array');
        }

        // Validate & sanitise each itinerary
        const itineraries: MealItinerary[] = parsed.itineraries.map((it: Record<string, unknown>) => ({
            name: String(it.name || 'Himalayan Feast'),
            tagline: String(it.tagline || 'A curated meal just for you'),
            main: sanitiseDish(it.main as Record<string, unknown>),
            side: sanitiseDish(it.side as Record<string, unknown>),
            drink: sanitiseDish(it.drink as Record<string, unknown>),
            dessert: it.dessert ? sanitiseDish(it.dessert as Record<string, unknown>) : null,
            total: Number(it.total) || 0,
            why_it_matches: String(it.why_it_matches || ''),
            add_ons: Array.isArray(it.add_ons)
                ? (it.add_ons as Record<string, unknown>[]).map((a) => ({
                    name: String(a.name || ''),
                    price: Number(a.price) || 0,
                }))
                : [],
        }));

        // Recalculate totals to be correct
        for (const it of itineraries) {
            it.total =
                it.main.price +
                it.side.price +
                it.drink.price +
                (it.dessert?.price ?? 0);
        }

        console.log(`✅ AI returned ${itineraries.length} itineraries for mood: "${request.mood}"`);
        return itineraries;
    } catch (error) {
        console.error('AI API error:', error);
        throw error;
    }
}

export async function getAIRecommendationsWithUsage(
    request: AIRecommendationRequest
): Promise<{ itineraries: MealItinerary[]; usage: AIUsage }> {
    // 1. Fetch real menu from the database
    const menuText = await fetchMenuForPrompt();

    // 2. Build the system prompt with real menu data
    const systemPrompt = buildSystemPrompt(menuText);

    // 3. Build user prompt from preferences
    const budgetHint = request.budget
        ? `My budget for the full meal is around ₹${request.budget}.`
        : '';

    const userPrompt = `
My mood / vibe right now: ${request.mood}
${request.customThought ? `Additional thoughts: ${request.customThought}` : ''}
Meal type I'm looking for: ${request.mealType}
Dietary preference: ${request.dietary}
My spice tolerance: ${request.spiceLevel}/5
My experience with Himalayan food: ${request.experience}
${budgetHint}

Please suggest 3 distinct meal itineraries that match my mood and preferences. Remember to use ONLY dishes from the menu provided.`;

    const { text: responseText, usage } = await generateWithProvider({ systemPrompt, userPrompt });

    // Extract JSON from the response (handle potential markdown fences)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.itineraries || !Array.isArray(parsed.itineraries)) {
        throw new Error('Response missing itineraries array');
    }

    // Validate & sanitise each itinerary
    const itineraries: MealItinerary[] = parsed.itineraries.map((it: Record<string, unknown>) => ({
        name: String(it.name || 'Himalayan Feast'),
        tagline: String(it.tagline || 'A curated meal just for you'),
        main: sanitiseDish(it.main as Record<string, unknown>),
        side: sanitiseDish(it.side as Record<string, unknown>),
        drink: sanitiseDish(it.drink as Record<string, unknown>),
        dessert: it.dessert ? sanitiseDish(it.dessert as Record<string, unknown>) : null,
        total: Number(it.total) || 0,
        why_it_matches: String(it.why_it_matches || ''),
        add_ons: Array.isArray(it.add_ons)
            ? (it.add_ons as Record<string, unknown>[]).map((a) => ({
                name: String(a.name || ''),
                price: Number(a.price) || 0,
            }))
            : [],
    }));

    // Recalculate totals to be correct
    for (const it of itineraries) {
        it.total = it.main.price + it.side.price + it.drink.price + (it.dessert?.price ?? 0);
    }

    return { itineraries, usage };
}

/** Safely extract a dish object from the LLM response */
function sanitiseDish(d: Record<string, unknown> | undefined | null): {
    name: string;
    price: number;
    description: string;
} {
    if (!d) return { name: 'Unknown', price: 0, description: '' };
    return {
        name: String(d.name || 'Unknown'),
        price: Number(d.price) || 0,
        description: String(d.description || ''),
    };
}

// Note: no static fallbacks here — this project should always generate via LLM

async function generateWithProvider({
    systemPrompt,
    userPrompt,
}: {
    systemPrompt: string;
    userPrompt: string;
}): Promise<{ text: string; usage: AIUsage }> {
    // Prefer Gemini if configured; fall back to OpenAI if present.
    if (process.env.GEMINI_API_KEY) {
        const gemini = getGeminiClient();
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const model = gemini.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        const text = result.response.text();
        const usageMetadata = result.response.usageMetadata;
        const inputTokens =
            typeof usageMetadata?.promptTokenCount === 'number'
                ? usageMetadata.promptTokenCount
                : null;
        const outputTokens =
            typeof usageMetadata?.candidatesTokenCount === 'number'
                ? usageMetadata.candidatesTokenCount
                : null;
        return { text, usage: { inputTokens, outputTokens } };
    }

    const openai = getOpenAIClient();
    const result = await openai.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    });
    const inputTokens =
        typeof (result as unknown as { usage?: { input_tokens?: unknown } }).usage?.input_tokens === 'number'
            ? (result as unknown as { usage: { input_tokens: number } }).usage.input_tokens
            : null;
    const outputTokens =
        typeof (result as unknown as { usage?: { output_tokens?: unknown } }).usage?.output_tokens === 'number'
            ? (result as unknown as { usage: { output_tokens: number } }).usage.output_tokens
            : null;
    return { text: result.output_text, usage: { inputTokens, outputTokens } };
}
