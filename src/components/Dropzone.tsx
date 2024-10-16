"use client";

import { useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Image,
  useToast,
} from "@chakra-ui/react";

interface DropzoneProps {
  onUploadComplete: () => void;
}

export default function Dropzone({ onUploadComplete }: DropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const toast = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64File = (reader.result as string).split(",")[1];

      try {
        const fileName = `${selectedFile.name}-${Date.now()}`;
        const res = await fetch("/api/uploadPhoto", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64File,
            fileName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          toast({
            title: "Upload successful!",
            description: `Photo uploaded successfully. URL: ${data.downloadURL}`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onUploadComplete();
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.log("🚀 ~ reader.onload= ~ error:", error);
        toast({
          title: "Error uploading file.",
          description:
            "There was an issue uploading the photo. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
  };

  return (
    <VStack spacing={4} width="100%" alignItems="center">
      <Box
        border="2px dashed #ccc"
        borderRadius="md"
        padding={4}
        textAlign="center"
        width="100%"
        maxW="500px"
      >
        <Text fontSize="lg" mb={2}>
          Drag and drop a file here or select one to upload
        </Text>
        <Input
          type="file"
          onChange={handleFileChange}
          display="none"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button as="span" cursor={"pointer"}>
            Select File
          </Button>
        </label>
      </Box>
      {imagePreview && (
        <Image
          src={imagePreview}
          alt="Preview"
          boxSize="200px"
          objectFit="cover"
        />
      )}
      {selectedFile && (
        <Button onClick={handleUpload} colorScheme="teal">
          Upload Photo
        </Button>
      )}
    </VStack>
  );
}
