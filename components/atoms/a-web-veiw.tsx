import React from "react";
import { WebView as RNWebView } from "react-native-webview";

interface Props {
	html: string;
}

const WebView: React.FC<Props> = ({ html }) => {
	return (
		<RNWebView
			source={{ html }}
			style={{
				flex: 0,
				minHeight: 1000,
			}}
			scalesPageToFit={true}
			showsVerticalScrollIndicator={true}
			showsHorizontalScrollIndicator={true}
			allowsInlineMediaPlayback={true}
			startInLoadingState={false}
			javaScriptEnabled={true}
		/>
	);
};

export default WebView;
