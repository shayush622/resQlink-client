import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function verifyImageWithGemini(imageUrl: string): Promise<{isVerified: boolean, summary: string}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })  

    const imageBuffer = await fetch(imageUrl).then((res) => {
      if (!res.ok) throw new Error("Image fetch failed: " + res.status)
      return res.arrayBuffer()
    })

    const imageBase64 = Buffer.from(imageBuffer).toString("base64")

    const prompt = `
      You are a disaster verification AI.

      Your job is to inspect images from a disaster-reporting app and return ONLY a valid JSON object without any explanation, markdown, or code blocks.

      The image may or may not contain signs of real disasters like floods, fires, earthquakes, etc.

      Return strictly the following JSON format:

      {
        "isVerified": boolean,
        "reason": string
      }

      Do NOT wrap the JSON inside \`\`\` or provide any explanation or notes.
      Return ONLY the JSON object as plain text.
      `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    })

    const response = await result.response
    const raw = response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) 
      throw new Error("No valid JSON found in Gemini response");

    const parsed = JSON.parse(jsonMatch[0]); 
    return {
      isVerified: parsed.isVerified,
      summary: parsed.reason,
    };
  } 
  catch (error: unknown) {
    let message = "Unknown error"
    if (error instanceof Error) message = error.message
    else if (typeof error === "string") message = error
    console.error("Gemini verification failed:", message);
    return {
      isVerified: false,
      summary: `Gemini failed to verify image. Error: ${message}`,
    };
  }
}
