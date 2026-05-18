import * as FileSystem from 'expo-file-system/legacy';
import { useDownloadsStore } from '../stores/downloads';
import React from 'react';

export const useDownlods = () => {
  const [downloading, setDownloading] = React.useState(false);
  const { recordDownload, getLocalUri, isDownloaded } = useDownloadsStore();

  const download = async (url: string, filename: string) => {
    try {
      const encodedUrl = encodeURI(url);

      const localPath = FileSystem.cacheDirectory + filename;

      setDownloading(true);
      const result = await FileSystem.downloadAsync(encodedUrl, localPath);
      recordDownload(encodedUrl, result.uri);
      return result.uri;
    } catch (err) {
      console.error('PDF preload failed:', err);
      return null;
    } finally {
      setDownloading(false);
    }
  };

  return { download, getLocalUri, downloading, isDownloaded };
};
