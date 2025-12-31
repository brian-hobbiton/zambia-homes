'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { isStorageUrl, refreshPresignedUrl } from '@/lib/storage';

interface StorageImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * Image component that handles Railway storage presigned URLs
 * Automatically refreshes the URL if it expires (403 error)
 */
export function StorageImage({ src, fallbackSrc, alt, ...props }: StorageImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(typeof src === 'string' ? src : '');
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    if (typeof src === 'string') {
      setCurrentSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = async () => {
    // If we've already tried refreshing or it's not a storage URL, show fallback
    if (hasError || isRefreshing) {
      return;
    }

    const srcString = typeof src === 'string' ? src : '';

    // Only attempt refresh for Railway storage URLs
    if (isStorageUrl(srcString)) {
      setIsRefreshing(true);
      try {
        const newUrl = await refreshPresignedUrl(srcString);
        setCurrentSrc(newUrl);
      } catch (error) {
        console.error('Failed to refresh image URL:', error);
        setHasError(true);
        if (fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setHasError(true);
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    }
  };

  // Determine if we should use unoptimized
  const shouldUnoptimize = isStorageUrl(currentSrc);

  if (!currentSrc) {
    return null;
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
      unoptimized={shouldUnoptimize}
    />
  );
}

