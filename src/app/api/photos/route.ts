import { NextResponse } from "next/server";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function GET() {
  try {
    const imagesRef = ref(storage, "uploads/");
    const result = await listAll(imagesRef);

    const urls = await Promise.all(
      result.items.map((item) => getDownloadURL(item))
    );
    return NextResponse.json({ urls });
  } catch (error) {
    console.log("🚀 ~ GET ~ error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve images." },
      { status: 500 }
    );
  }
}
