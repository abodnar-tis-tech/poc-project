"use client";

import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  VStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";

interface DisplayPhotosProps {
  refetchFlag: boolean;
}

export default function DisplayPhotos({ refetchFlag }: DisplayPhotosProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
        <Spinner size="xl" />
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
    </VStack>
  );
}
