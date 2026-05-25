import { formMutation, generateRNFile } from '@/lib/services/graphql/utils/fetch';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';
import * as FileSystem from 'expo-file-system/legacy';
import { DocumentNode } from 'graphql';
import React from 'react';

export function useSignatureUpload(mutation: DocumentNode, onSuccess?: () => void) {
  const [uploading, setUploading] = React.useState(false);

  async function upload(base64DataUrl: string) {
    setUploading(true);
    try {
      const pureBase64 = base64DataUrl.includes(',')
        ? base64DataUrl.split(',')[1]
        : base64DataUrl;
      const uri = `${FileSystem.cacheDirectory}signature_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(uri, pureBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const file = generateRNFile(uri);
      const res = await formMutation(mutation, { input: { signature: file } });
      if (res.error) {
        handleError(res.error);
      } else {
        onSuccess?.();
      }
    } catch {
      toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save signature' });
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading };
}
