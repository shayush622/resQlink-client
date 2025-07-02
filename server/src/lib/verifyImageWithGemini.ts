import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function verifyImageWithGemini(imageUrl: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    // Load image bytes from URL
    const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer())
    const imageBase64 = Buffer.from(imageBuffer).toString("base64")

    const prompt = 
        `Analyze this image and answer the following:
        - Is it showing a real disaster scene like a flood, fire, or earthquake?
        - Are there signs of manipulation or AI generation?
        Give a short and clear response.`
    

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg", 
          data: imageBase64,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    return text
  }
   catch (error) {
    console.error("Gemini verification failed:", error)
    return "Unable to verify image due to error."
  }
}
