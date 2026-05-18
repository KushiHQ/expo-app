import React from 'react';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function shareViewAsSinglePagePdf(ref: React.RefObject<ViewShot | null>) {
  try {
    const uri = await ref.current?.capture?.();
    const html = `
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                height: 100%; /* Ensure body takes full page height */
              }
              img { 
                width: 100%; /* Make image fill the width */
                max-height: 95vh; /* Limit height to 95% of the page height */
                object-fit: contain; /* Scale image down to fit, maintaining aspect ratio */
              }
            </style>
          </head>
          <body>
            <img src="data:image/png;base64,${uri}" />
          </body>
        </html>
      `;
    const { uri: pdfUri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Receipt',
      });
    }
  } catch {
    alert('Oops, something went wrong while generating the PDF.');
  }
}

export async function shareViewAsImage(ref: React.RefObject<ViewShot | null>) {
  try {
    const imageUri = await ref.current?.capture?.();

    if (!imageUri) {
      throw new Error('Failed to capture the view.');
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share or Save Image',
      });
    } else {
      alert('Sharing is not available on this device.');
    }
  } catch (error) {
    console.log(error);
    alert('Oops, something went wrong while preparing the image.');
  }
}
