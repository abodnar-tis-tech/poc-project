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

export default function DisplayPhotos({ refetchFlag }: DisplayPhotosProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchAnalysis = async () => {
    if (!selectedImage) return;

    try {
      const res = await fetch("/api/analyzePhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: selectedImage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAnalysis(data.description);
      } else {
        throw new Error(data.error || "Failed to analyze the image.");
      }
    } catch (error) {
      console.log("🚀 ~ fetchAnalysis ~ error:", error);
      toast({
        title: "Error analyzing image.",
        description: "There was an issue analyzing the image.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
    setAnalysis(null);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/photos");
        const data = await res.json();

        if (res.ok) {
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

    fetchImages();
  }, [refetchFlag, toast]);

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
          {imageUrls.map((url, index) => (
            <Box
              key={index}
              overflow="hidden"
              display={"flex"}
              onClick={() => handleImageClick(url)}
              cursor="pointer"
              justifyContent={"center"}
            >
              <Image
                src={url}
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
              <Image src={selectedImage} alt="Selected Image" width="100%" />
            )}
            {analysis && (
              <Text mt={4}>
                <strong>Analysis:</strong> {analysis}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={fetchAnalysis}
              isDisabled={!selectedImage}
            >
              Analyze Image
            </Button>
            <Button
              variant="ghost"
              ml={3}
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
