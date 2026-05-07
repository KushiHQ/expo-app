import ChatScreen from "@/components/screens/chat";
import React from "react";
import AuthGuard from "@/components/guards/auth-guard";

export default function GuestChat() {
	return (
		<AuthGuard>
			<ChatScreen />
		</AuthGuard>
	);
}
