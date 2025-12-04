import React from "react";
import { WebView as RNWebView } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";

interface Props {
	source: WebViewSource & {
		html?: string;
	};
}

const WebView: React.FC<Props> = ({ source }) => {
	return (
		<RNWebView
			source={source}
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
