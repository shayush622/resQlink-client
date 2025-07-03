import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function verifyImageWithGemini(imageUrl: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })  

    const imageBuffer = await fetch(imageUrl).then((res) => {
      if (!res.ok) throw new Error("Image fetch failed: " + res.status)
      return res.arrayBuffer()
    })

    const imageBase64 = Buffer.from(imageBuffer).toString("base64")

    const prompt = `
      You are a disaster response AI.
      This image was submitted during an ongoing disaster.

      Based only on the visual information, determine:
      - Does this appear to be a real disaster (like a flood, fire, or earthquake)?
      - Are there visible signs of manipulation, AI generation, or irrelevance?
      - Be honest and give a 2-3 sentence analysis.
    `

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
    return response.text()
  } 
  catch (error: unknown) {
    let message = "Unknown error"
    if (error instanceof Error) message = error.message
    else if (typeof error === "string") message = error

    console.error("Gemini verification failed:", message)
    return `Gemini failed to verify image. Error: ${message}`
  }
}
