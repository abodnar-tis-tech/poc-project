import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const saveAnalysisToRealtimeDB = async (
  imageName: string,
  imageUrl: string,
  description: string
) => {
  try {
    const imageRef = ref(database, `${imageName}`);

    await set(imageRef, {
      imageUrl: imageUrl,
      analysisText: description,
      timestamp: new Date().toISOString(),
    });

    console.log("Analysis saved to Realtime Database");
  } catch (error) {
    console.error("Error saving analysis to Realtime Database:", error);
  }
};

export async function POST(request: Request) {
  const { imageUrl, imageName } = await request.json();

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Image URL is required" },
      { status: 400 }
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this menu?",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const description =
      response.choices[0].message.content || "No description available";

    await saveAnalysisToRealtimeDB(imageName, imageUrl, description);

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
