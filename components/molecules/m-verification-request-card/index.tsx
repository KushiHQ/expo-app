import ThemedText from "@/components/atoms/a-themed-text";
import Collapsible from "@/components/molecules/m-collapsible";
import StatusPill from "@/components/molecules/m-verification-status-pill";
import Button from "@/components/atoms/a-button";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import {
	HostingVerificationRequestStatus,
	HostingVerificationTier,
} from "@/lib/services/graphql/generated";
import { formatTierLabel } from "@/lib/utils/verification/tier";
import { FileText, ImageIcon, Clock } from "lucide-react-native";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

type Document = {
	id: string;
	name: string;
	asset: {
		id: string;
		publicUrl: string;
	};
};

type LogEntry = {
	datetime: string;
	variant: string;
	staffId?: string | null;
	action: string;
	statusDetail?: string | null;
};

type Props = {
	id: string;
	tier: HostingVerificationTier;
	status: HostingVerificationRequestStatus;
	statusDetails?: string | null;
	documents: Document[];
	logs: LogEntry[];
	createdAt: string;
	/** When set, the rejected-state footer renders a "Request again" button. */
	onRequestAgain?: () => void;
};

const formatDate = (iso: string): string => {
	const d = new Date(iso);
	return d.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

const isImage = (mimeOrName: string): boolean =>
	/\.(png|jpe?g|webp|gif|heic)$/i.test(mimeOrName);

const RequestCard: React.FC<Props> = ({
	tier,
	status,
	statusDetails,
	documents,
	logs,
	createdAt,
	onRequestAgain,
}) => {
	const colors = useThemeColors();
	const isRejected = status === HostingVerificationRequestStatus.Rejected;
	const isVerified = status === HostingVerificationRequestStatus.Verified;
	const tint: "default" | "primary" | "success" = isVerified
		? "success"
		: isRejected
			? "default"
			: "primary";

	return (
		<Collapsible
			title={formatTierLabel(tier)}
			description={`Submitted ${formatDate(createdAt)}`}
			tint={tint}
			defaultExpanded={isRejected}
		>
			<View className="gap-4 pt-3">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						<Clock size={12} color={hexToRgba(colors.text, 0.5)} />
						<ThemedText
							style={{
								fontSize: 11,
								color: hexToRgba(colors.text, 0.6),
							}}
						>
							{formatDate(createdAt)}
						</ThemedText>
					</View>
					<StatusPill status={status} />
				</View>

				{statusDetails ? (
					<View
						className="rounded-xl p-3"
						style={{
							backgroundColor: hexToRgba(colors.text, 0.04),
							borderLeftWidth: 3,
							borderLeftColor: colors.primary,
						}}
					>
						<ThemedText
							style={{
								fontSize: 10,
								color: hexToRgba(colors.text, 0.5),
								fontFamily: Fonts.semibold,
								textTransform: "uppercase",
								letterSpacing: 0.5,
								marginBottom: 4,
							}}
						>
							Admin feedback
						</ThemedText>
						<ThemedText
							style={{
								fontSize: 13,
								color: colors.text,
								lineHeight: 19,
							}}
						>
							{statusDetails}
						</ThemedText>
					</View>
				) : null}

				{documents.length > 0 ? (
					<View>
						<ThemedText
							style={{
								fontSize: 10,
								color: hexToRgba(colors.text, 0.5),
								fontFamily: Fonts.semibold,
								textTransform: "uppercase",
								letterSpacing: 0.5,
								marginBottom: 8,
							}}
						>
							Documents ({documents.length})
						</ThemedText>
						<View
							className="flex-row flex-wrap gap-2"
							style={{ marginHorizontal: -4 }}
						>
							{documents.map((doc) => (
								<Pressable
									key={doc.id}
									onPress={() => Linking.openURL(doc.asset.publicUrl)}
									accessibilityLabel={`Open ${doc.name}`}
									className="flex-row items-center gap-2 rounded-lg p-2"
									style={{
										backgroundColor: hexToRgba(colors.text, 0.04),
										flexBasis: "100%",
									}}
								>
									{isImage(doc.name) ? (
										<Image
											source={{ uri: doc.asset.publicUrl }}
											style={{ width: 36, height: 36, borderRadius: 6 }}
											contentFit="cover"
										/>
									) : (
										<View
											className="h-9 w-9 items-center justify-center rounded-md"
											style={{
												backgroundColor: hexToRgba(colors.primary, 0.12),
											}}
										>
											<FileText size={16} color={colors.primary} />
										</View>
									)}
									<ThemedText
										numberOfLines={1}
										style={{
											fontSize: 12,
											color: colors.text,
											flex: 1,
											fontFamily: Fonts.medium,
										}}
									>
										{doc.name}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</View>
				) : null}

				{logs.length > 0 ? (
					<View>
						<ThemedText
							style={{
								fontSize: 10,
								color: hexToRgba(colors.text, 0.5),
								fontFamily: Fonts.semibold,
								textTransform: "uppercase",
								letterSpacing: 0.5,
								marginBottom: 8,
							}}
						>
							Activity
						</ThemedText>
						<View className="gap-2.5">
							{logs.map((log, idx) => (
								<View
									key={`${log.datetime}-${idx}`}
									className="flex-row gap-2.5"
								>
									<View className="items-center pt-1">
										<View
											style={{
												width: 8,
												height: 8,
												borderRadius: 4,
												backgroundColor:
													log.variant === "staff"
														? colors.primary
														: hexToRgba(colors.text, 0.3),
											}}
										/>
										{idx < logs.length - 1 ? (
											<View
												style={{
													width: 1,
													flex: 1,
													backgroundColor: hexToRgba(colors.text, 0.1),
													marginTop: 2,
												}}
											/>
										) : null}
									</View>
									<View className="flex-1 pb-1">
										<ThemedText
											style={{
												fontSize: 12,
												color: colors.text,
												fontFamily: Fonts.medium,
											}}
										>
											{prettifyAction(log.action)}
										</ThemedText>
										<ThemedText
											style={{
												fontSize: 10,
												color: hexToRgba(colors.text, 0.5),
												marginTop: 1,
											}}
										>
											{formatDate(log.datetime)} · {log.variant}
										</ThemedText>
										{log.statusDetail ? (
											<ThemedText
												style={{
													fontSize: 11,
													color: hexToRgba(colors.text, 0.7),
													marginTop: 2,
												}}
											>
												{log.statusDetail}
											</ThemedText>
										) : null}
									</View>
								</View>
							))}
						</View>
					</View>
				) : null}

				{isRejected && onRequestAgain ? (
					<View className="pt-1" style={{ marginTop: 4 }}>
						<Button type="primary" onPress={onRequestAgain}>
							<ThemedText>Request again</ThemedText>
						</Button>
					</View>
				) : null}

				{isVerified ? (
					<View
						className="flex-row items-center gap-2 rounded-lg p-2.5"
						style={{ backgroundColor: hexToRgba(colors.success, 0.1) }}
					>
						<ImageIcon size={14} color={colors.success} />
						<ThemedText
							style={{
								fontSize: 12,
								color: colors.success,
								fontFamily: Fonts.semibold,
								flex: 1,
							}}
						>
							Your hosting now displays the {formatTierLabel(tier)} badge.
						</ThemedText>
					</View>
				) : null}
			</View>
		</Collapsible>
	);
};

function prettifyAction(action: string): string {
	return action.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export default RequestCard;
