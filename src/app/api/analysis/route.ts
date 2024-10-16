import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";

const getAnalysisFromRealtimeDB = async (imageName: string) => {
  try {
    const imageRef = ref(database, `${imageName}`);

    const snapshot = await get(imageRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return data.analysisText;
    } else {
      console.log("No analysis found for this image.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving analysis from Realtime Database:", error);
    return null;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageName = searchParams.get("imageName");

  if (!imageName) {
    return NextResponse.json(
      { error: "Image URL is required" },
      { status: 400 }
    );
  }

  try {
    const analysisText = await getAnalysisFromRealtimeDB(imageName);

    if (analysisText) {
      return NextResponse.json({ analysisText });
    } else {
      return NextResponse.json(
        { message: "No analysis found for this image." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error retrieving analysis:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analysis." },
      { status: 500 }
    );
  }
}
