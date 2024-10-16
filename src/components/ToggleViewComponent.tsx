"use client";

import { useState } from "react";
import { VStack } from "@chakra-ui/react";
import Camera from "@/components/Camera";
import Dropzone from "@/components/Dropzone";
import Toggle from "@/components/Toggle";
import DisplayPhotos from "@/components/DisplayPhotos";

export default function ToggleViewComponent() {
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [refetchFlag, setRefetchFlag] = useState(false);

  const handleToggle = () => {
    setIsUploadMode((prev) => !prev);
  };

  const handleRefetch = () => {
    setRefetchFlag((prev) => !prev);
  };

  return (
    <VStack spacing={6} mt={5}>
      <Toggle isUploadMode={isUploadMode} onToggle={handleToggle} />
      {isUploadMode ? (
        <Dropzone onUploadComplete={handleRefetch} />
      ) : (
        <Camera onUploadComplete={handleRefetch} />
      )}
      <DisplayPhotos refetchFlag={refetchFlag} />
    </VStack>
  );
}
