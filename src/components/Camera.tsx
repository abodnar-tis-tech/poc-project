"use client";

import { useRef, useState, useEffect } from "react";
import { Box, Button, VStack, Image, Text, useToast } from "@chakra-ui/react";

interface CameraProps {
  onUploadComplete: () => void;
}

export default function Camera({ onUploadComplete }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsCameraActive(true);
      };
    }
  }, [stream, videoRef]);

  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing the camera:", err);
      toast({
        title: "Error accessing the camera.",
        description: "Please check your camera permissions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setPhoto(imageData);

      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach((track) => track.stop());

      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const handleUpload = async () => {
    if (!photo) return;

    const base64File = photo.split(",")[1];
    const fileName = `photo-${Date.now()}.jpg`;

    try {
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
      console.log("Upload error:", error);
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

  return (
    <VStack spacing={4}>
      <Box>
        {isCameraActive ? (
          <video
            ref={videoRef}
            style={{
              width: "300px",
              height: "auto",
              border: "2px solid black",
            }}
          />
        ) : (
          <Text>Camera is off</Text>
        )}
      </Box>

      {!isCameraActive && (
        <Button onClick={handleStartCamera} colorScheme="teal">
          Start Camera
        </Button>
      )}

      {isCameraActive && (
        <Button onClick={handleTakePhoto} colorScheme="teal">
          Take Photo
        </Button>
      )}

      {photo && (
        <>
          <Image src={photo} alt="Captured" boxSize="300px" objectFit="cover" />
          <Button onClick={handleUpload} colorScheme="teal">
            Upload Photo
          </Button>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </VStack>
  );
}
