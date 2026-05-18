import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export const AUDIO_EXTENSIONS = ['m4a', 'mp3', 'wav', 'caf', '3gp', 'aac', 'ogg', 'webm', 'amr'];

export const getMimeType = (ext: string | undefined): string => {
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    default:
      return 'application/octet-stream';
  }
};

export const getMimeTypeFromExtension = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'png';

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    heic: 'image/heic',

    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',

    mp4: 'video/mp4',
    mov: 'video/quicktime',

    mp3: 'audio/mpeg',
    wav: 'audio/wav',

    m4a: 'audio/mp4',
    caf: 'audio/x-caf',
    '3gp': 'audio/3gpp',
    webm: 'audio/webm',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

interface ReactNativeFileOptions {
  uri: string;
  name: string;
  type: string;
}

export class ReactNativeFile {
  public uri: string;
  public name: string;
  public type: string;

  constructor({ uri, name, type }: ReactNativeFileOptions) {
    this.uri = uri;
    this.name = name;
    this.type = type;
  }
}

export function generateRNFile(uri: string) {
  return new ReactNativeFile({
    uri,
    name: uri.split('/').pop() ?? '',
    type: getMimeTypeFromExtension(uri),
  });
}

export function openLocalFile(uri: string) {
  FileSystem.getContentUriAsync(uri).then((cUri) => {
    if (Platform.OS === 'ios') {
      Sharing.shareAsync(cUri);
    } else {
      IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: cUri,
        flags: 1,
      });
    }
  });
}
