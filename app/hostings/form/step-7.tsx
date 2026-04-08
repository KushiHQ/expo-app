import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { RefreshControl, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import { PublishStatus } from "@/lib/services/graphql/generated";
import LoadingModal from "@/components/atoms/a-loading-modal";
import SignatureImage from "@/components/molecules/m-signature-image";
import Collapsible from "@/components/molecules/m-collapsible";
import BottomSheet from "@/components/atoms/a-bottom-sheet";
import Button from "@/components/atoms/a-button";
import { FluentTextBulletListSquareEdit20Regular } from "@/components/icons/i-edit";
import Skeleton from "@/components/atoms/a-skeleton";
import TenancyAgreementVariableText from "@/components/molecules/m-tenancy-aggreement-variable-text";

import { useTenancyTermsForm } from "@/lib/hooks/forms/use-tenancy-terms-form";
import MemoizedSubClause from "@/components/organisms/o-memoised-sub-clause";
import { MemoizedEditSection } from "@/components/organisms/o-memoised-edit-sub-clause";

export default function NewHostingStep7() {
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();

	const {
		input,
		hosting,
		hostQueryData,
		templateData,
		editOpen,
		setEditOpen,
		loading,
		fetchingHosting,
		templateFetching,
		mutating,
		refetch,
		refetchTemplate,
		handleMutate,
		handleUpdateVariable,
		toggleSection,
		toggleSubClause,
		hasSection,
		hasSubClause,
	} = useTenancyTermsForm(String(id));

	return (
		<>
			<DetailsLayout
				title="Hosting"
				refreshControl={
					<RefreshControl
						refreshing={templateFetching || fetchingHosting}
						onRefresh={() => {
							refetchTemplate();
							refetch();
						}}
					/>
				}
				footer={
					<HostingStepper
						onPress={handleMutate}
						published={hosting?.publishStatus === PublishStatus.Live}
						loading={mutating}
						disabled={
							!input.tenancyAgreementTemplate ||
							!hostQueryData?.authHost.signature?.publicUrl
						}
						step={6}
					/>
				}
			>
				<View className="mt-2 gap-4">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						{"Tenancy Terms & Rules"}
					</ThemedText>
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Select the restrictions, rules, and clauses that apply to your
						property. This information will be automatically included in the
						final digital lease signed by your tenant.
					</ThemedText>
					<View className="gap-2">
						{templateFetching ||
							(fetchingHosting && (
								<View className="gap-3">
									{Array.from({ length: 7 }).map((_, index) => (
										<Skeleton
											key={index}
											style={{ height: 50, borderRadius: 12 }}
										/>
									))}
								</View>
							))}
						<View>
							{hosting &&
								input.tenancyAgreementTemplate?.sections.map(
									(section, sIdx) => (
										<Collapsible
											title={section.title}
											description={section.description}
											key={section.id}
										>
											<View className="mt-4">
												{section.preamble && (
													<TenancyAgreementVariableText
														hosting={hosting}
														text={section.preamble}
													/>
												)}
											</View>
											<View className="mt-4">
												{section.subClauses.map((clause, cIdx) => (
													<MemoizedSubClause
														key={clause.id}
														clause={clause}
														sectionIndex={sIdx}
														clauseIndex={cIdx}
														hosting={hosting}
														onUpdateVariable={handleUpdateVariable}
													/>
												))}
											</View>
										</Collapsible>
									),
								)}
						</View>
						<View className="mt-4">
							<Button
								type="text"
								className="self-end"
								onPress={() => setEditOpen(true)}
							>
								<View className="flex-row items-center gap-2">
									<FluentTextBulletListSquareEdit20Regular
										color={colors.background}
										size={28}
									/>
								</View>
							</Button>
							<SignatureImage
								signature={hostQueryData?.authHost.signature?.publicUrl}
							/>
						</View>
					</View>
				</View>
			</DetailsLayout>

			<LoadingModal visible={loading} />

			<BottomSheet isVisible={editOpen} onClose={() => setEditOpen(false)}>
				{editOpen && (
					<View>
						<ThemedText
							type="semibold"
							style={{ fontSize: 18 }}
							className="mb-8 px-2"
						>
							Edit Clauses
						</ThemedText>
						{hosting &&
							templateData?.tenancyAgreementTemplate.sections.map((section) => (
								<MemoizedEditSection
									key={section.id || section.title}
									section={section}
									hosting={hosting}
									isChecked={hasSection(section)}
									onToggleSection={toggleSection}
									hasSubClause={hasSubClause}
									onToggleSubClause={toggleSubClause}
								/>
							))}
					</View>
				)}
			</BottomSheet>
		</>
	);
}
