import {
  atomWithStorage as jAtomWithStorage,
  createJSONStorage,
} from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function atomWithStorageStorage<T>(key: string, content: T) {
  const storage = createJSONStorage<T>(() => AsyncStorage);

  return jAtomWithStorage<T>(key, content, storage);
}
