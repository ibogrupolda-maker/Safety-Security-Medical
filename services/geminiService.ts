
import { GoogleGenAI, Type } from "@google/genai";
import { ProtocolSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProtocolAdvice = async (scenario: string): Promise<ProtocolSuggestion> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analise o seguinte cenário de emergência médica e classifique-o de acordo com os protocolos padrão (A: Crítico/Emergência, B: Elevado/Urgente, C: Moderado/Semi-urgente, D: Baixo/Não urgente). 
    Cenário: "${scenario}"
    Forneça a resposta em formato JSON seguindo estritamente o esquema definido. Importante: Use Português de Portugal (PT-PT) em todos os textos explicativos.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          classification: { type: Type.STRING, enum: ['A', 'B', 'C', 'D'] },
          actionRequired: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          suggestedResources: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["classification", "actionRequired", "reasoning", "suggestedResources"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Resposta vazia do modelo de IA");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Falha ao analisar resposta do Gemini", error);
    throw new Error("A análise do protocolo falhou.");
  }
};
