import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, GeminiResponse, AllServices, MonthlyPlan } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

// FIX: Corrected typo from API_key to API_KEY
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getServiceCatalogString = (allServices: AllServices, monthlyPlans: MonthlyPlan[]): string => {
    const serviceList = Object.values(allServices)
        .flatMap(category => category.items)
        .map(s => `ID: ${s.id} | Nombre: ${s.name} | Descripción: ${s.description}`).join('\n');
        
    const planList = monthlyPlans
        .map(p => `ID: ${p.id} | Nombre: ${p.name} | Descripción: ${p.description}`).join('\n');
    
    return `--- CATÁLOGO COMPLETO DE SERVICIOS ---\nSERVICIOS ESTÁNDAR:\n${serviceList}\nPLANES MENSUALES:\n${planList}`;
};


const classificationSystemPrompt = `
    Eres un clasificador de peticiones.
    Analiza el siguiente mensaje del revendedor.
    Tu única respuesta debe ser una de estas tres palabras:
    - 'RECOMENDACION' si la pregunta es para pedir una sugerencia de servicio o un plan para un proyecto.
    - 'TEXTO' para cualquier otra cosa (saludos, preguntas técnicas, dudas de precios, etc.).
    - 'DESCONOCIDA' si no puedes clasificar la intención con certeza.
    Responde solo con la palabra en mayúsculas, sin explicaciones.
`;

const recommendationSystemPrompt = (catalog: string) => `
    Eres Zen Assistant, un estratega de productos y coach de ventas de élite.
    Tu tarea es analizar las necesidades del cliente y construir la solución perfecta, usando servicios existentes o creando nuevos si es necesario.
    
    ${catalog}

    INSTRUCCIONES CLAVE:
    1.  Genera una respuesta ESTRICTAMENTE en el formato JSON especificado.
    2.  Analiza la petición. Para cada servicio que recomiendes, crea un objeto en el array 'services'.
    3.  **Para servicios existentes del CATÁLOGO:** Usa su 'id' y 'name' reales, y pon 'is_new: false'. No necesitas añadir 'description' o 'price'.
    4.  **SI UN SERVICIO NECESARIO NO EXISTE:** ¡Créalo! Pon 'is_new: true', inventa un 'id' único (ej: 'custom-integration-crm'), un 'name' claro, una 'description' vendedora y un 'price' de producción justo. Esta es tu función más importante.
    5.  En 'client_questions', crea preguntas para descubrir más oportunidades.
    6.  En 'sales_pitch', escribe un párrafo de venta enfocado en los beneficios.
`;

const textSystemPrompt = `
    Eres Zen Assistant. Actúa como un asistente de ventas general experto en desarrollo web.
    
    INSTRUCCIONES CLAVE:
    - Responde de forma cortés, profesional y concisa.
    - Responde directamente a la consulta del revendedor.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        introduction: { 
          type: Type.STRING, 
          description: "Breve introducción profesional para el revendedor, antes de listar los IDs." 
        },
        services: {
            type: Type.ARRAY,
            description: "Array de objetos de servicio recomendados.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "El ID del servicio (ej: 's1', 'p4')." },
                    is_new: { type: Type.BOOLEAN, description: "True si es una sugerencia de servicio nuevo; false si existe en el catálogo." },
                    name: { type: Type.STRING, description: "El nombre del servicio." },
                    description: { type: Type.STRING, description: "Una descripción convincente del servicio (solo si is_new es true)." },
                    price: { type: Type.NUMBER, description: "El costo de producción sugerido (solo si is_new es true)." }
                },
                required: ["id", "is_new", "name"]
            }
        },
        closing: { 
          type: Type.STRING, 
          description: "Conclusión amigable para el revendedor, invitando a añadirlos." 
        },
        client_questions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Array con 2-3 preguntas estratégicas que el revendedor debe hacerle a su CLIENTE FINAL para clarificar el proyecto. Deben ser formuladas para ser usadas directamente con el cliente."
        },
        sales_pitch: {
          type: Type.STRING,
          description: "Un párrafo persuasivo y profesional, listo para copiar y pegar. Debe explicarle al CLIENTE FINAL los beneficios de la solución propuesta, enfocándose en el valor y los resultados, no en la jerga técnica. Debe empezar con una frase como 'Con esta propuesta, obtendrás...' o similar."
        }
    },
    required: ["introduction", "services", "closing", "client_questions", "sales_pitch"]
};

export const sendMessageToGemini = async (history: ChatMessage[], allServices: AllServices, monthlyPlans: MonthlyPlan[]): Promise<string> => {
    try {
        const lastUserMessage = history[history.length - 1].parts[0].text;

        // Step 1: Classify intent
        const classificationResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: lastUserMessage }] }],
            config: { systemInstruction: classificationSystemPrompt }
        });
        
        const intent = classificationResponse.text.toUpperCase().trim().replace(/['"]+/g, '');
        
        // Step 2: Generate response based on intent
        if (intent === 'RECOMENDACION') {
            const catalog = getServiceCatalogString(allServices, monthlyPlans);
            const recommendationResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: history,
                config: {
                    systemInstruction: recommendationSystemPrompt(catalog),
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                },
            });
            return recommendationResponse.text;
        } else { // TEXTO or DESCONOCIDA
            const textResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: history,
                config: { systemInstruction: textSystemPrompt }
            });
            return textResponse.text;
        }
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return "Lo siento, hubo un error al contactar con el asistente de IA. Por favor, inténtalo de nuevo más tarde.";
    }
};