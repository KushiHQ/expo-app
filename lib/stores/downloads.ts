import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DownloadsStore = {
  downloads: Record<string, string>;
  recordDownload: (remoteUrl: string, localUri: string) => void;
  isDownloaded: (remoteUrl: string) => boolean;
  getLocalUri: (remoteUrl: string) => string | null;
};

export const useDownloadsStore = create<DownloadsStore>()(
  persist(
    (set, get) => ({
      downloads: {},
      recordDownload(remoteUrl, localUri) {
        set((state) => ({
          downloads: { ...state.downloads, [remoteUrl]: localUri },
        }));
      },
      isDownloaded(remoteUrl) {
        const { downloads } = get();

        return !!downloads[remoteUrl];
      },
      getLocalUri(remoteUrl) {
        const { downloads } = get();
        const localUri = downloads[remoteUrl];

        if (localUri) {
          return localUri;
        }
        return null;
      },
    }),
    { name: "downloads-store", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
