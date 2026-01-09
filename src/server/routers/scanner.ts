import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const scannerRouter = router({
    analyzeImage: protectedProcedure
        .input(z.object({
            imageBase64: z.string(), // Base64 encoded image
        }))
        .mutation(async ({ input }) => {
            const systemPrompt = `You are a carbon footprint analyzer. Analyze this image and identify food items, products, or transport methods visible.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, just raw JSON):
{
    "identified_item": "name of the main item",
    "confidence": "high" | "medium" | "low",
    "category": "DIET" | "TRANSPORT" | "WASTE" | "ENERGY",
    "estimated_carbon_kg": number,
    "description": "brief description of what you see",
    "eco_tip": "one tip related to this item",
    "suggested_action": "transport-bike" | "diet-vegan" | etc (use action IDs like: diet-meat-high, diet-meat-low, diet-vegetarian, diet-vegan, transport-car-gas, transport-bike, waste-plastic-bottle, etc)
}

Carbon estimates (kg CO2e):
- Beef meal: 3-5 kg
- Chicken meal: 1-2 kg  
- Vegetarian meal: 0.5 kg
- Vegan meal: 0.3 kg
- Plastic bottle: 0.08 kg
- Car per km: 0.19 kg
- Bus per km: 0.1 kg

If you cannot identify anything carbon-related, return:
{
    "identified_item": "unknown",
    "confidence": "low",
    "category": "UNKNOWN",
    "estimated_carbon_kg": 0,
    "description": "Could not identify carbon-relevant items",
    "eco_tip": "Try taking a clearer photo of food, products, or transport",
    "suggested_action": null
}`;

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                // Remove data URL prefix if present
                const base64Data = input.imageBase64.replace(/^data:image\/\w+;base64,/, "");

                const result = await model.generateContent([
                    { text: systemPrompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Data,
                        },
                    },
                ]);

                const responseText = result.response.text();

                // Parse JSON from response (handle potential markdown wrapping)
                let jsonStr = responseText;
                if (responseText.includes("```json")) {
                    jsonStr = responseText.split("```json")[1].split("```")[0];
                } else if (responseText.includes("```")) {
                    jsonStr = responseText.split("```")[1].split("```")[0];
                }

                const parsed = JSON.parse(jsonStr.trim());

                return {
                    success: true as const,
                    error: null,
                    data: {
                        identifiedItem: parsed.identified_item,
                        confidence: parsed.confidence,
                        category: parsed.category,
                        estimatedCarbonKg: parsed.estimated_carbon_kg,
                        description: parsed.description,
                        ecoTip: parsed.eco_tip,
                        suggestedAction: parsed.suggested_action,
                    },
                };
            } catch (error) {
                console.error("Scanner Error:", error);
                return {
                    success: false as const,
                    error: "Failed to analyze image. Please try again.",
                    data: null,
                };
            }
        }),
});
