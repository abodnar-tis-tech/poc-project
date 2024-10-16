"use client";

import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
  Skeleton,
} from "@chakra-ui/react";

interface DisplayPhotosProps {
  refetchFlag: boolean;
}

type Image = {
  name: string;
  url: string;
};

export default function DisplayPhotos({ refetchFlag }: DisplayPhotosProps) {
  const [imageUrls, setImageUrls] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAnalyzeImage, setLoadingAnalyzeImage] = useState(false);
  const toast = useToast();

  const analyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setLoadingAnalyzeImage(true);
      const res = await fetch("/api/open-ai-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: selectedImage.url,
          imageName: selectedImage.name,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAnalysis(data.description);
      } else {
        throw new Error(data.error || "Failed to analyze the image.");
      }
    } catch (error) {
      console.log("🚀 ~ analyzeImage ~ error:", error);
      toast({
        title: "Error analyzing image.",
        description: "There was an issue analyzing the image.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAnalyzeImage(false);
    }
  };

  const fetchAnalysis = async (name: string) => {
    if (!selectedImage) return;

    try {
      const res = await fetch(
        `/api/analysis?imageName=${encodeURIComponent(name)}`
      );
      const data = await res.json();

      if (res.ok && data.analysisText) {
        setAnalysis(data.analysisText);
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.log("🚀 ~ fetchAnalysis ~ error:", error);
      toast({
        title: "Error fetching analysis.",
        description: "There was an issue retrieving the image analysis.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setAnalysis(null);
    }
  };

  const handleDeletePhoto = async (imageName?: string) => {
    if (!imageName) return;

    try {
      const res = await fetch("/api/photo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: imageName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchImages();
        setIsModalOpen(false);
        toast({
          title: "Image deleted.",
          description: "The image was successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || "Failed to delete the image.");
      }
    } catch (error) {
      console.log("🚀 ~ deleteImage ~ error:", error);
      toast({
        title: "Error deleting image.",
        description: "There was an issue deleting the image.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImageClick = (image: Image) => {
    setAnalysis(null);
    setSelectedImage(image);
    setIsModalOpen(true);
    fetchAnalysis(image.name);
  };

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/photo");
      const data = await res.json();

      if (res.ok) {
        console.log(data);
        setImageUrls(data.urls);
      } else {
        throw new Error(data.error || "Failed to load images.");
      }

      setLoading(false);
    } catch (error) {
      console.log("🚀 ~ fetchImages ~ error:", error);
      toast({
        title: "Error loading images.",
        description: "There was an issue loading the images from storage.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refetchFlag]);

  return (
    <VStack alignItems="center" spacing={6}>
      <Text fontSize="2xl" mb={4}>
        Uploaded Photos
      </Text>

      {loading ? (
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          spacing={4}
          width="100%"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              height="300px"
              width="300px"
              borderRadius="lg"
            />
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          spacing={4}
          width="100%"
        >
          {imageUrls.map((image, index) => (
            <Box
              key={index}
              overflow="hidden"
              display={"flex"}
              onClick={() => handleImageClick(image)}
              cursor="pointer"
              justifyContent={"center"}
            >
              <Image
                src={image.url}
                alt={`Uploaded image ${index + 1}`}
                objectFit="cover"
                boxSize="300px"
              />
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Image Analysis</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt="Selected Image"
                width="100%"
              />
            )}
            {analysis && (
              <Text mt={4}>
                <strong>Analysis:</strong> {analysis}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            {!analysis && (
              <Button
                colorScheme="blue"
                onClick={analyzeImage}
                isDisabled={!selectedImage}
                isLoading={loadingAnalyzeImage}
              >
                {loadingAnalyzeImage ? "Analyzing ..." : "Analyze Image"}
              </Button>
            )}
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => handleDeletePhoto(selectedImage?.name)}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
