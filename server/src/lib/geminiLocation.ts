import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractLocationWithGemini(description: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Given the following user input, extract only the most relevant geographical location. 
Respond with a city/state/country/place that can be used for geocoding.
Input: "${description}"`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim().replace(/^"|"$/g, ''); // remove quotes if present
}
