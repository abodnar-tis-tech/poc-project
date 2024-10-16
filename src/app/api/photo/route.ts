import { NextResponse } from "next/server";
import {
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  deleteObject,
  uploadBytes,
} from "firebase/storage";
import { ref as dbRef, remove } from "firebase/database";
import { storage, database } from "@/lib/firebase";

export async function GET() {
  try {
    const imagesRef = ref(storage, "uploads/");
    const result = await listAll(imagesRef);

    const urlsWithMetadata = await Promise.all(
      result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        const metadata = await getMetadata(item);
        return {
          url,
          name: item.name,
          createdAt: metadata.timeCreated,
        };
      })
    );

    const sortedUrls = urlsWithMetadata
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map((item) => ({
        url: item.url,
        name: item.name,
      }));

    return NextResponse.json({ urls: sortedUrls });
  } catch (error) {
    console.log("🚀 ~ GET ~ error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve images." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }

    const fileRef = ref(storage, `uploads/${name}`);
    await deleteObject(fileRef);

    const dbRecordRef = dbRef(database, `${name}`);
    await remove(dbRecordRef);

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.log("🚀 ~ DELETE ~ error:", error);
    return NextResponse.json(
      { error: "Failed to delete image." },
      { status: 500 }
    );
  }
}

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
