"use client";

import { FormControl, FormLabel, Switch, VStack } from "@chakra-ui/react";

interface ToggleProps {
  isUploadMode: boolean;
  onToggle: () => void;
}

export default function Toggle({ isUploadMode, onToggle }: ToggleProps) {
  return (
    <VStack>
      <FormControl display="flex" alignItems="center">
        <FormLabel mb="0">
          {isUploadMode ? "Upload from your device" : "Take a new photo"}
        </FormLabel>
        <Switch
          isChecked={!isUploadMode}
          onChange={onToggle}
          colorScheme="teal"
          size="lg"
        />
      </FormControl>
    </VStack>
  );
}
