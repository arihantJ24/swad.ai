import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

const SYSTEM_PROMPT = `You are a Himalayan cuisine expert working at Yeti – The Himalayan Kitchen, a restaurant specializing in authentic Nepali, Tibetan, Bhutanese, and Northeastern Indian cuisine.

Based on the user's mood and preferences, generate exactly 3 curated meal itineraries. Each itinerary must include:
- 1 Main dish
- 1 Side dish
- 1 Drink
- 1 Optional Dessert (can be null for some more affordable options)
- A short sentence on why it matches the user's mood
- 2 smart add-on suggestions

You MUST return valid JSON in this EXACT format (no markdown, no extra text):
{
  "itineraries": [
    {
      "name": "Creative itinerary name",
      "tagline": "A short catchy tagline",
      "main": { "name": "Dish name", "price": 399, "description": "Short description" },
      "side": { "name": "Side name", "price": 99, "description": "Short description" },
      "drink": { "name": "Drink name", "price": 149, "description": "Short description" },
      "dessert": { "name": "Dessert name", "price": 179, "description": "Short description" },
      "total": 826,
      "why_it_matches": "Because this meal...",
      "add_ons": [
        { "name": "Add-on 1", "price": 99 },
        { "name": "Add-on 2", "price": 149 }
      ]
    }
  ]
}

Use ONLY dishes from the Yeti menu. Here are the available dishes:
MOMOS: SHABALAY MOMOS (475), ALOO MOMOS (395), NEWARI MOMOS CHA (425-475), SCHEZWAN MOMOS (395-495), STEAM MOMOS BUFF/CHICKEN/MUTTON/PORK (395-425), YETI SPECIAL KOTHEY MOMOS (425-475), JHOL MOMOS (475-525)
NOODLES: CHOW CHOW (345-425), CHILLI GARLIC CHOW CHOW (395-445), YETI-SPECIAL CHOW CHOW (455), WAI WAI (375-395)
THUKPA & SOUP: THUKPA (475-525), KEEMA THUKPA (525), MOTHUK (425-525), THENTHUK (475-525), YETI SPECIAL THENTHUK (575), TOMATO SOUP (325)
APPETIZERS: ALOO SADHEKO (325), CHANA CHIURA (375), ALOO KO ACHAR (325), MUSHROOM CHOILA (475), PANEER TAREKO (455), SUKUTI SADHEKO (475), MACCHA TAREKO (525), SEKUWA (495), CHOILA (495), CHELEY (455), GYUMA (545), CHICKEN LAPHING (455)
BHUTANESE: EMA DATSHI (525), KEWA DATSHI (525), TSHOEM (555), SHA DATSHI (555)
PLATTERS/THALI: YETI VEG PLATTER (545), VEG MOMO PLATTER (625), NEPALESE PLATTER (695), HIMALAYAN PLATTER (745), VEG THAKALI THALI (645), NON-VEG THAKALI THALI (745)
MAINS: ALOO TARKARI (325), PAHADI DAL (455), SAAG PANEER GRAVY (575), KHASI KO LEDO (625), KOKRA KO LEDO (575), PORK BAMBOO SHOOT (575)
RICE: STEAMED RICE (295), FRIED RICE (395-425), CHILLI GARLIC FRIED RICE (395-445)
DRINKS: SAMBUCUS (295), VIRGIN MOJITO (295), ICE TEA (275), HIMALAYAN HIGHBALL (295), COLD COFFEE (225), MATCHA (295), SAFFRON KAHWA (225)

Prices are in Indian Rupees (₹). Respect the user's dietary restrictions strictly.`;

export async function getAIRecommendations(
    request: AIRecommendationRequest
): Promise<MealItinerary[]> {
    const isPlaceholder = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here';

    if (isPlaceholder) {
        console.log('Using placeholder API key, skipping Gemini call and using fallbacks.');
        return getFallbackRecommendations(request);
    }

    const userPrompt = `
My mood: ${request.mood}
${request.customThought ? `My thoughts: ${request.customThought}` : ''}
Meal type: ${request.mealType}
Dietary preference: ${request.dietary}
Spice level: ${request.spiceLevel}/5
Experience with Himalayan food: ${request.experience}
Budget range: ${request.budget}

Please suggest 3 meal itineraries that match my mood and preferences.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent([
            { text: SYSTEM_PROMPT },
            { text: userPrompt },
        ]);

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.itineraries;
    } catch (error) {
        console.error('Gemini API error:', error);
        return getFallbackRecommendations(request);
    }
}

function getFallbackRecommendations(
    request: AIRecommendationRequest
): MealItinerary[] {
    const isVeg = request.dietary === 'veg' || request.dietary === 'vegan';

    return [
        {
            name: 'The Thakali Tradition',
            tagline: 'A wholesome Himalayan feast',
            main: isVeg
                ? { name: 'VEG THAKALI THALI', price: 645, description: 'Traditional multi-item vegetarian platter' }
                : { name: 'NON-VEG THAKALI THALI', price: 745, description: 'Traditional platter with choice of meat curry' },
            side: { name: 'ALOO SADHEKO', price: 325, description: 'Tangy sautéed spiced potatoes' },
            drink: { name: 'VIRGIN MOJITO', price: 295, description: 'Refreshing lime and mint cooler' },
            dessert: { name: 'SAFFRON KAHWA', price: 225, description: 'Warm spiced saffron tea' },
            total: isVeg ? 1490 : 1590,
            why_it_matches: 'The Thakali Thali represents the heart of Himalayan dining, perfect for a complete experience.',
            add_ons: [
                { name: 'ROTI', price: 55 },
                { name: 'ALOO KO ACHAR', price: 325 },
            ],
        },
        {
            name: 'Momo Trail Journey',
            tagline: 'Dumplings from the roof of the world',
            main: isVeg
                ? { name: 'YETI SPECIAL KOTHEY MOMOS (Veg)', price: 425, description: 'Signature pan-fried dumplings' }
                : { name: 'JHOL MOMOS (Non-Veg)', price: 525, description: 'Momos in spicy nepali soyabean broth' },
            side: { name: 'VEG LAPHING', price: 395, description: 'Spicy Tibetan cold green gram noodles' },
            drink: { name: 'ICE TEA', price: 275, description: 'Chilled iced tea' },
            dessert: null,
            total: isVeg ? 1095 : 1195,
            why_it_matches: 'Discover the iconic taste of the Himalayas with this momo-centric pairing.',
            add_ons: [
                { name: 'SCHEZWAN MOMOS', price: 495 },
                { name: 'TINGMO', price: 95 },
            ],
        },
        {
            name: 'Bhutanese Cheese Quest',
            tagline: 'Rich, comforting, and spicy',
            main: { name: 'EMA DATSHI', price: 525, description: 'Spicy Bhutanese chilli cheese curry' },
            side: { name: 'TINGMO', price: 95, description: 'Soft fluffy steamed buns' },
            drink: { name: 'SAMBUCUS', price: 295, description: 'Elderflower and cucumber cooler' },
            dessert: { name: 'KIT-KAT SHAKE', price: 275, description: 'Sweet chocolate treat' },
            total: 1190,
            why_it_matches: 'Experience the unique cheesy heat of Bhutanese cuisine, balanced with soft breads.',
            add_ons: [
                { name: 'KEWA DATSHI', price: 525 },
                { name: 'MUSHROOM CHOILA', price: 475 },
            ],
        },
    ];
}
