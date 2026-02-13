import { GoogleGenAI, Type } from "@google/genai";
import { Formulation, NoteType } from "../types";

// Initialize Gemini
// Ensure API_KEY is set in environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const formulationSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Evocative name of the perfume" },
    description: { type: Type.STRING, description: "Short poetic description of the scent profile" },
    totalSillage: { type: Type.NUMBER, description: "Estimated sillage score from 0 to 100" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          casNumber: { type: Type.STRING, description: "Chemical Abstracts Service number" },
          molecularWeight: { type: Type.NUMBER },
          note: { type: Type.STRING, enum: ["Top", "Heart", "Base"] },
          chemicalFamily: { type: Type.STRING, description: "e.g. Terpene, Aldehyde, Musk, Ester" },
          biologicalReceptor: { type: Type.STRING, description: "Specific Olfactory Receptor ID, e.g. OR5AN1, OR1A1" },
          neuroTrigger: { type: Type.STRING, description: "Neuro-aesthetic effect e.g. 'Calm', 'Alertness', 'Nostalgia'" },
          quantity: { type: Type.NUMBER, description: "Parts per hundred" },
          description: { type: Type.STRING, description: "Olfactive description" },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: "Volatility/Freshness Index (0=Warm/Base, 100=Fresh/Top)" },
              y: { type: Type.NUMBER, description: "Olfactive Character (0=Stimulating/Dry/Bitter, 100=Narcotic/Sweet/Soft)" }
            },
            required: ["x", "y"]
          }
        },
        required: ["name", "casNumber", "molecularWeight", "note", "chemicalFamily", "biologicalReceptor", "neuroTrigger", "quantity", "description", "coordinates"]
      }
    }
  },
  required: ["name", "description", "ingredients", "totalSillage"]
};

export const generateFormulation = async (input: string, imageBase64?: string): Promise<Formulation> => {
  try {
    // Upgraded to gemini-3-pro-preview for complex reasoning and deep chemical knowledge
    const model = "gemini-3-pro-preview"; 
    
    let userPrompt = "";
    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", 
          data: imageBase64
        }
      });
      userPrompt = `Analyze this image as a source of olfactive inspiration. `;
    }
    
    userPrompt += `Create a haute couture perfume formulation based on this brief: "${input}".`;

    const systemPrompt = `
      You are a Master Perfumer (Nez) with a PhD in Biochemistry and deep knowledge of Olfactory Receptors (ORs).
      
      Your goal is to create "stellar", chemically accurate, and artistically profound fragrance formulations.
      
      Methodology:
      1. **Jellinek's Odor Effects Diagram**: Structure the scent around the dimensions found in Zarzo & Stanton's research.
         - **X-Axis (Volatility/Freshness)**: 
           - 0 = Heavy, Erogenous, Warm, Animalic (High Substantivity).
           - 100 = Light, Refreshing, Cool, Green/Citrus (High Volatility).
         - **Y-Axis (Character)**: 
           - 0 = Stimulating, Dry, Bitter, Masculine-leaning (e.g., Vetiver, Herbs).
           - 100 = Narcotic, Soft, Sweet, Floral, Feminine-leaning (e.g., Tuberose, Vanilla).
      
      2. **Ingredient Selection**:
         - Use specific raw materials (e.g., "Bergamot Oil Reggio", "Ambroxan", "Iso E Super", "Rose de Mai Absolute").
         - Provide real CAS numbers.
         - Balance the composition across Top, Heart, and Base notes.
         - Suggest specific **Olfactory Receptors (ORs)** that these molecules are known or hypothesized to trigger (e.g., OR1D2 for aldehydes).
      
      3. **Neuro-aesthetics**:
         - Define the "neuroTrigger" based on the psychological effect (e.g., "Sedative" for Narcotic ingredients, "Invigorating" for Stimulating ones).

      Output must be strictly JSON matching the schema.
    `;

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: formulationSchema,
        temperature: 0.6, // Slightly lower temperature for chemical accuracy
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        ingredients: data.ingredients.map((ing: any, index: number) => ({
            ...ing,
            id: `ing-${index}-${Date.now()}`
        }))
      };
    } else {
      throw new Error("No formulation generated");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};