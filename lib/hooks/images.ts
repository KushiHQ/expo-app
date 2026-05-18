import React from 'react';

export const useFallbackImages = () => {
  const [failedImages, setFailedImages] = React.useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return { failedImages, handleImageError };
};
