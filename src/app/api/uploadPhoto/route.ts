import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function POST(request: Request) {
  const { file, fileName } = await request.json();

  if (!file || !fileName) {
    return NextResponse.json(
      { error: "File or fileName missing" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(file, "base64");
    const storageRef = ref(storage, `uploads/${fileName}`);
    const snapshot = await uploadBytes(storageRef, buffer);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ downloadURL }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
