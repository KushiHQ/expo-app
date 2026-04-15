import { create } from "zustand";
import Daily, {
	DailyCall,
	DailyParticipant,
} from "@daily-co/react-native-daily-js";

export type CallState = {
	call: DailyCall | null;
	localParticipant: DailyParticipant | null;
	remoteParticipant: DailyParticipant | null;
	isRinging: boolean;
	cameraEnabled: boolean;
	micEnabled: boolean;
	isSpeakerOn: boolean;
	callId: string | null;
	chatId: string | null;
	isJoining: boolean;
	networkState: string;

	// Actions
	setCall: (call: DailyCall | null) => void;
	setParticipants: (local: DailyParticipant | null, remote: DailyParticipant | null) => void;
	setIsRinging: (isRinging: boolean) => void;
	setCameraEnabled: (enabled: boolean) => void;
	setMicEnabled: (enabled: boolean) => void;
	setIsSpeakerOn: (enabled: boolean) => void;
	setCallId: (callId: string | null) => void;
	setChatId: (chatId: string | null) => void;
	setIsJoining: (isJoining: boolean) => void;
	setNetworkState: (state: string) => void;
	resetCallState: () => void;
};

export const useCallStore = create<CallState>((set) => ({
	call: null,
	localParticipant: null,
	remoteParticipant: null,
	isRinging: true,
	cameraEnabled: false,
	micEnabled: true,
	isSpeakerOn: false,
	callId: null,
	chatId: null,
	isJoining: false,
	networkState: "connected",

	setCall: (call) => set({ call }),
	setParticipants: (local, remote) => set({ localParticipant: local, remoteParticipant: remote }),
	setIsRinging: (isRinging) => set({ isRinging }),
	setCameraEnabled: (cameraEnabled) => set({ cameraEnabled }),
	setMicEnabled: (micEnabled) => set({ micEnabled }),
	setIsSpeakerOn: (isSpeakerOn) => set({ isSpeakerOn }),
	setCallId: (callId) => set({ callId }),
	setChatId: (chatId) => set({ chatId }),
	setIsJoining: (isJoining) => set({ isJoining }),
	setNetworkState: (networkState) => set({ networkState }),
	resetCallState: () => set({
		localParticipant: null,
		remoteParticipant: null,
		isRinging: true,
		cameraEnabled: false,
		micEnabled: true,
		isSpeakerOn: false,
		callId: null,
		chatId: null,
		isJoining: false,
		networkState: "connected",
	}),
}));
