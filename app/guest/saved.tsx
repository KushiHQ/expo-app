import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import SavedHostingCard, {
	SavedHostingCardSkeleton,
} from "@/components/molecules/m-saved-hosting-card";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import * as Haptics from "expo-haptics";
import { Platform, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";
import Button from "@/components/atoms/a-button";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedView from "@/components/atoms/a-themed-view";
import { hexToRgba } from "@/lib/utils/colors";
import { FolderPlus } from "lucide-react-native";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import BottomSheet from "@/components/atoms/a-bottom-sheet";
import SavedHostingFolderCard from "@/components/molecules/m-saved-hosting-folder-card";
import {
	useSavedHostingFoldersQuery,
	useSavedHostingsQuery,
} from "@/lib/services/graphql/generated";
import EmptyList from "@/components/molecules/m-empty-list";
import SavedHostingFolderModal from "@/components/organisms/o-saved-hosting-folder-modal";
import { useRouter } from "expo-router";
import AuthGuard from "@/components/guards/auth-guard";

export default function GuestSaved() {
	return (
		<AuthGuard>
			<SavedContent />
		</AuthGuard>
	);
}

function SavedContent() {
	const router = useRouter();
	const colors = useThemeColors();
	const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
	const [selectFolderOpen, setSelectFolderOpen] = React.useState(false);
	const [selectMode, setSelectMode] = React.useState(false);
	const [selected, setSelected] = React.useState<string[]>([]);
	const [selectedFolder, setSelectedFolder] = React.useState("");
	const insets = useSafeAreaInsets();
	const [{ fetching: folderFetching, data: folderData }, refetchFolders] =
		useSavedHostingFoldersQuery({ requestPolicy: "cache-and-network" });
	const [{ fetching: savedFetching, data: savedData }] = useSavedHostingsQuery({
		variables: {
			filters: {
				noFolder: true,
			},
		},
	});

	const toggleSelectMode = () => {
		setSelectMode((c) => !c);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
	};

	const handleSelect = (id: string) => {
		setSelected((c) => {
			const newVal = new Set(c);
			newVal.add(id);

			return Array.from(newVal);
		});
	};

	const handleDeSelect = (id: string) => {
		setSelected((c) => {
			const newVal = new Set(c);
			newVal.delete(id);

			return Array.from(newVal);
		});
	};

	const handleCreate = () => {
		refetchFolders({ requestPolicy: "network-only" });
		setCreateFolderOpen(false);
		setSelectMode((c) => !c);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
	};

	const handleOrganize = () => {
		setSelectMode(false);
		setSelectFolderOpen(false);
	};

	return (
		<>
			<DetailsLayout title="Saved Listings" withProfile>
				<View className="mt-6 gap-8">
					{(folderFetching || savedFetching) && (
						<View className="gap-2">
							<View className="px-2">
								<Skeleton
									style={{
										width: "100%",
										height: 22,
										borderRadius: 12,
										maxWidth: 230,
									}}
								/>
							</View>
							<SimpleGrid
								listKey={undefined}
								itemDimension={160}
								data={Array.from({ length: 5 }).map((_, index) => index + 1)}
								renderItem={() => <SavedHostingCardSkeleton />}
							/>
						</View>
					)}

					{!folderFetching &&
						!savedFetching &&
						folderData?.savedHostingFolders &&
						folderData?.savedHostingFolders.length < 1 &&
						savedData?.savedHostings &&
						savedData?.savedHostings.length < 1 && (
							<EmptyList
								message="No saved hostings yet"
								buttonTitle="Explore Homes"
								onButtonPress={() => router.replace("/guest/home")}
							/>
						)}

					{folderData?.savedHostingFolders &&
						folderData?.savedHostingFolders.length > 0 && (
							<View className="gap-2">
								<ThemedText
									className="px-3"
									style={{ fontFamily: Fonts.bold, fontSize: 18 }}
								>
									Folders
								</ThemedText>
								<SimpleGrid
									listKey="id"
									itemDimension={160}
									data={folderData?.savedHostingFolders ?? []}
									renderItem={({ item }) => (
										<SavedHostingFolderCard folder={item} />
									)}
								/>
							</View>
						)}

					{savedData?.savedHostings && savedData?.savedHostings.length > 0 && (
						<View className="gap-2">
							<ThemedText
								className="px-2"
								style={{ fontFamily: Fonts.bold, fontSize: 18 }}
							>
								Saved
							</ThemedText>
							<SimpleGrid
								listKey="id"
								itemDimension={160}
								data={savedData?.savedHostings ?? []}
								renderItem={({ item }) => (
									<SavedHostingCard
										selected={selected.includes(item.id)}
										onSelect={handleSelect}
										onDeSelect={handleDeSelect}
										onSelectMode={toggleSelectMode}
										selectMode={selectMode}
										hosting={item}
									/>
								)}
							/>
						</View>
					)}
				</View>
				<SavedHostingFolderModal
					open={createFolderOpen}
					onClose={() => setCreateFolderOpen(false)}
					onCreate={handleCreate}
				/>
				<BottomSheet
					isVisible={selectFolderOpen}
					onClose={() => setSelectFolderOpen(false)}
				>
					<View className="min-h-72">
						<View className="gap-8">
							<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
								Select Folder
							</ThemedText>
							<SelectInput
								focused
								label="Select"
								placeholder="Add to folder"
								value={selectedFolder}
								onSelect={(v) => setSelectedFolder(v.label)}
								renderItem={SelectOption}
								options={["Folder 1", "Folder 2"].map((v) => ({
									label: v,
									value: v,
								}))}
							/>
						</View>
						<View className="flex-row items-center justify-end mt-4 gap-8 px-4">
							<Button
								onPress={handleOrganize}
								disabled={selectedFolder.length === 0}
							>
								<ThemedText content="tinted">Save</ThemedText>
							</Button>
						</View>
					</View>
				</BottomSheet>
			</DetailsLayout>
			{selectMode ? (
				<ThemedView
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						paddingBottom: insets.bottom,
						paddingLeft: insets.left,
						paddingRight: insets.right,
						paddingTop: 16,
						borderTopWidth: 1,
						borderTopColor: hexToRgba(colors.text, 0.1),
						...Platform.select({
							ios: {
								shadowColor: colors.primary,
								shadowOffset: { width: 0, height: -2 },
								shadowOpacity: 0.1,
								shadowRadius: 8,
							},
							android: {
								elevation: 8,
								shadowColor: hexToRgba(colors.primary, 0.3),
							},
						}),
					}}
					className="flex-row items-center gap-3 px-4"
				>
					<Button onPress={() => setSelectFolderOpen(true)} className="flex-1">
						<ThemedText>Organize</ThemedText>
					</Button>
					<Button className="flex-1">
						<ThemedText style={{ color: colors.error }}>Delete</ThemedText>
					</Button>
				</ThemedView>
			) : (
				<View
					className="items-center justify-center"
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						paddingBottom: insets.bottom,
						paddingLeft: insets.left,
						paddingRight: insets.right,
						paddingTop: 16,
					}}
				>
					<Button
						className="mb-4"
						onPress={() => setCreateFolderOpen(true)}
						type="background"
					>
						<View className="flex-row items-center gap-2">
							<ThemedText>Organize</ThemedText>
							<FolderPlus size={16} color={colors.text} />
						</View>
					</Button>
				</View>
			)}
		</>
	);
}
