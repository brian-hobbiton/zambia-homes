'use client';

import { useState, useCallback } from 'react';
import { uploadFileClient, uploadFilesClient, FileCategory, UploadResult } from '@/lib/storage';

interface UseFileUploadOptions {
  category: FileCategory;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  maxFiles?: number;
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>;
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for handling file uploads in components
 */
export function useFileUpload({
  category,
  onSuccess,
  onError,
  maxFiles = 10,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(50); // Simulated progress
        const result = await uploadFileClient(file, category);
        setProgress(100);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [category, onSuccess, onError]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return [];
      }

      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const results: UploadResult[] = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
          const result = await uploadFileClient(files[i], category);
          results.push(result);
          setProgress(Math.round(((i + 1) / totalFiles) * 100));
          onSuccess?.(result);
        }

        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        return [];
      } finally {
        setIsUploading(false);
      }
    },
    [category, maxFiles, onSuccess, onError]
  );

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    reset,
  };
}

