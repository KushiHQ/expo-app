import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { RefreshControl, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import {
	HostingQuery,
	PublishStatus,
	SubClause,
	SubClauseValueInput,
	TenancySection,
	UpdateHostMutation,
	UpdateHostMutationVariables,
	useAuthHostQuery,
	useTenancyAgreementTemplateQuery,
	VariableType,
} from "@/lib/services/graphql/generated";
import LoadingModal from "@/components/atoms/a-loading-modal";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";
import { useGalleryStore } from "@/lib/stores/gallery";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { UPDATE_HOST } from "@/lib/services/graphql/requests/mutations/users";
import { generateRNFile } from "@/lib/utils/file";
import SignatureImage from "@/components/molecules/m-signature-image";
import Collapsible from "@/components/molecules/m-collapsible";
import { capitalize, splitVariables } from "@/lib/utils/text";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import BottomSheet from "@/components/atoms/a-bottom-sheet";
import Button from "@/components/atoms/a-button";
import { FluentTextBulletListSquareEdit20Regular } from "@/components/icons/i-edit";
import Skeleton from "@/components/atoms/a-skeleton";
import { formatNaira } from "@/lib/utils/currency";

export default function NewHostingStep6() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const {
		input,
		hosting,
		mutate,
		refetch,
		mutating,
		updateInput,
		fetching: fetchingHosting,
	} = useHostingForm(id);
	const { gallery } = useGalleryStore();
	const [{ data: hostQueryData, fetching: hostFetching }, refetchHost] =
		useAuthHostQuery();
	const [editOpen, setEditOpen] = React.useState(false);
	const [uploading, setUploading] = React.useState(false);
	const [{ data: templateData, fetching: templateFetching }, refetchTemplate] =
		useTenancyAgreementTemplateQuery();

	const loading = fetchingHosting || mutating || uploading;
	const activeSectionIds = React.useMemo(() => {
		const ids = new Set<string>();
		input.tenancyAgreementTemplate?.sections.forEach((sec) => ids.add(sec.id));
		return ids;
	}, [input.tenancyAgreementTemplate?.sections]);

	const activeSubClauseIds = React.useMemo(() => {
		const ids = new Set<string>();
		input.tenancyAgreementTemplate?.sections.forEach((sec) => {
			sec.subClauses.forEach((sub) => ids.add(sub.id));
		});
		return ids;
	}, [input.tenancyAgreementTemplate?.sections]);

	React.useEffect(() => {
		if (
			templateData &&
			(!input.tenancyAgreementTemplate ||
				input.tenancyAgreementTemplate.sections.length < 1)
		) {
			const processedSections = templateData.tenancyAgreementTemplate.sections
				.reduce(
					(acc, section) => {
						let activeSubClauses = section.subClauses
							.filter((sub) => sub.isActive || sub.isMandatory)
							.sort((a, b) => a.priority - b.priority);

						if (!input.serviceCharge) {
							activeSubClauses = activeSubClauses.filter(
								(sub) => sub.id !== "sub_service_charge",
							);
						}
						if (!input.cautionFee) {
							activeSubClauses = activeSubClauses.filter(
								(sub) => sub.id !== "sub_caution",
							);
						}

						if (activeSubClauses.length > 0 || !section.subClauses.length) {
							acc.push({
								...section,
								subClauses: activeSubClauses,
							});
						}
						return acc;
					},
					[] as (typeof templateData)["tenancyAgreementTemplate"]["sections"],
				)
				.sort((a, b) => a.priority - b.priority);

			updateInput({
				tenancyAgreementTemplate: {
					sections: processedSections,
				},
			});
		}
	}, [input.tenancyAgreementTemplate, templateData]);

	const handleMutate = () => {
		for (const section of input.tenancyAgreementTemplate?.sections ?? []) {
			for (const subClause of section.subClauses) {
				if (subClause.requiredVariables.length > 0) {
					for (const variable of subClause.requiredVariables) {
						if (
							!subClause.providedValues.find((v) => v.key === variable.name)
						) {
							Toast.show({
								type: "error",
								text1: "Missing Value",
								text2: `Please provide a value for ${variable.name}`,
							});
							return;
						}
					}
				}
			}
		}
		mutate({ input }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createOrUpdateHosting.message,
				});
				refetch();
				router.push(
					`/hostings/form/step-7?id=${res.data?.createOrUpdateHosting.data?.id}`,
				);
			}
		});
	};

	useFocusEffect(
		React.useCallback(() => {
			let signature = gallery.at(0);

			if (
				signature &&
				!hostQueryData?.authHost.signature?.publicUrl &&
				!hostFetching
			) {
				setUploading(true);
				formMutation<UpdateHostMutation, UpdateHostMutationVariables>(
					UPDATE_HOST,
					{
						input: {
							signature: generateRNFile(signature),
						},
					},
				)
					.then((res) => {
						if (res.error) {
							handleError(res.error);
						}
						if (res.data) {
							refetchHost({ requestPolicy: "network-only" });
							Toast.show({
								type: "success",
								text1: "Success",
								text2: res.data.updateHost.message,
							});
						}
					})
					.finally(() => setUploading(false));
			}
		}, [
			gallery,
			hostFetching,
			hostQueryData?.authHost.signature?.publicUrl,
			refetchHost,
		]),
	);

	function handleUpdateVariable(
		sectionIndex: number,
		subClauseIndex: number,
		variable: SubClauseValueInput,
	) {
		const currentSections = input.tenancyAgreementTemplate?.sections ?? [];

		const newSections = currentSections.map((sec, sIdx) => {
			if (sIdx !== sectionIndex) return sec;

			return {
				...sec,
				subClauses: sec.subClauses.map((sub, cIdx) => {
					if (cIdx !== subClauseIndex) return sub;

					const newProvidedValues = [...sub.providedValues];
					const vIndex = newProvidedValues.findIndex(
						(v) => v.key === variable.key,
					);

					if (vIndex > -1) {
						newProvidedValues[vIndex] = variable;
					} else {
						newProvidedValues.push(variable);
					}

					return {
						...sub,
						providedValues: newProvidedValues,
					};
				}),
			};
		});

		updateInput({ tenancyAgreementTemplate: { sections: newSections } });
	}

	function toggleSection(section: TenancySection) {
		const toUpdate = {
			sections: [...(input.tenancyAgreementTemplate?.sections ?? [])],
		};

		if (toUpdate.sections.find((sec) => sec.id === section.id)) {
			toUpdate.sections = toUpdate.sections.filter(
				(sec) => sec.id !== section.id,
			);
		} else {
			toUpdate.sections.push(section);
		}

		toUpdate.sections.sort((a, b) => a.priority - b.priority);

		updateInput({ tenancyAgreementTemplate: toUpdate });
	}

	function toggleSubClause(parentSectionId: string, subClause: SubClause) {
		const currentSections = input.tenancyAgreementTemplate?.sections ?? [];
		let newSections = currentSections.map((sec) => ({
			...sec,
			subClauses: [...sec.subClauses],
		}));

		const sectionIndex = newSections.findIndex(
			(sec) => sec.id === parentSectionId,
		);

		if (sectionIndex > -1) {
			const subIndex = newSections[sectionIndex].subClauses.findIndex(
				(sub) => sub.id === subClause.id,
			);

			if (subIndex > -1) {
				newSections[sectionIndex].subClauses.splice(subIndex, 1);
			} else {
				if (subClause.id === "sub_caution" && !input.cautionFee) {
					Toast.show({
						type: "error",
						text1: "Missing Value",
						text2:
							"Please provide cuation fee in the pricing section to add caution fee sub clause",
					});
					return;
				} else if (
					subClause.id === "sub_service_charge" &&
					!input.serviceCharge
				) {
					Toast.show({
						type: "error",
						text1: "Missing Value",
						text2:
							"Please provide service charge in the pricing section to add service charge sub clause",
					});
					return;
				}
				newSections[sectionIndex].subClauses.push(subClause);
			}
			newSections[sectionIndex].subClauses.sort(
				(a, b) => a.priority - b.priority,
			);
		} else {
			const parentSection =
				templateData?.tenancyAgreementTemplate.sections.find(
					(s) => s.id === parentSectionId,
				);
			if (parentSection) {
				newSections.push({
					...parentSection,
					subClauses: [subClause],
				});
			}
		}

		newSections.sort((a, b) => a.priority - b.priority);

		updateInput({
			tenancyAgreementTemplate: { sections: newSections },
		});
	}

	const hasSection = React.useCallback(
		(section: TenancySection) => {
			return activeSectionIds.has(section.id);
		},
		[activeSectionIds],
	);

	const hasSubClause = React.useCallback(
		(clause: SubClause) => {
			return activeSubClauseIds.has(clause.id);
		},
		[activeSubClauseIds],
	);

	return (
		<>
			<DetailsLayout
				title="Hosting"
				refreshControl={
					<RefreshControl
						refreshing={templateFetching}
						onRefresh={() => refetchTemplate()}
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
						{templateFetching && (
							<View className="gap-3">
								{Array.from({ length: 7 }).map((_, index) => (
									<Skeleton
										key={index}
										style={{ height: 50, borderRadius: 12 }}
									/>
								))}
							</View>
						)}
						<View>
							{input.tenancyAgreementTemplate?.sections.map(
								(section, sectionIndex) => (
									<Collapsible
										title={section.title}
										description={section.description}
										key={section.id}
									>
										<View className="mt-4">
											{section.preamble && (
												<VariableText
													hosting={hosting}
													text={section.preamble}
												/>
											)}
										</View>
										<View className="mt-4">
											{section.subClauses.map((clause, clauseIndex) => (
												<Collapsible
													title={clause.title}
													description={clause.description}
													key={clause.id}
												>
													<View className="mt-4">
														{clause.content && (
															<VariableText
																hosting={hosting}
																providedValues={clause.providedValues}
																text={clause.content}
															/>
														)}
													</View>
													{clause.requiredVariables.length > 0 && (
														<View className="mt-6">
															{clause.requiredVariables.map(
																(variable, index) => (
																	<FloatingLabelInput
																		key={index}
																		focused
																		value={
																			clause.providedValues[index]?.value
																				? variable.type === VariableType.Number
																					? Number(
																						clause.providedValues[
																							index
																						]?.value.replaceAll(",", ""),
																					).toLocaleString()
																					: clause.providedValues[index]?.value
																				: undefined
																		}
																		onChangeText={(v) => {
																			handleUpdateVariable(
																				sectionIndex,
																				clauseIndex,
																				{
																					key: variable.name,
																					value: v,
																				},
																			);
																		}}
																		placeholder={
																			variable.type === VariableType.Number
																				? "0.00"
																				: "Enter value"
																		}
																		keyboardType={
																			variable.type === VariableType.Number
																				? "numeric"
																				: "default"
																		}
																		label={capitalize(
																			variable.name
																				.replaceAll("_", " ")
																				.toLowerCase(),
																			true,
																		)}
																	/>
																),
															)}
														</View>
													)}
												</Collapsible>
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
				<View>
					<ThemedText
						type="semibold"
						style={{ fontSize: 18 }}
						className="mb-8 px-2"
					>
						Edit Clauses
					</ThemedText>
					{templateData?.tenancyAgreementTemplate.sections.map((section) => (
						<Collapsible
							withCheckbox
							checked={hasSection(section)}
							onCheckedChange={() => toggleSection(section)}
							checkDisabled={
								!!section.subClauses.find((sub) => sub.isMandatory) ||
								!section.subClauses.length
							}
							tint={hasSection(section) ? "primary" : "shade"}
							title={section.title}
							description={section.description}
							key={section.title}
						>
							<View className="mt-4">
								{section.preamble && (
									<VariableText
										replace={false}
										hosting={hosting}
										text={section.preamble}
									/>
								)}
							</View>
							<View className="mt-4">
								{section.subClauses.map((clause) => (
									<Collapsible
										withCheckbox
										checked={hasSubClause(clause)}
										onCheckedChange={() => toggleSubClause(section.id, clause)}
										checkDisabled={clause.isMandatory}
										tint={hasSubClause(clause) ? "primary" : "shade"}
										title={clause.title}
										description={clause.description}
										key={clause.title}
									>
										<View className="mt-4">
											{clause.content && (
												<VariableText
													replace={false}
													hosting={hosting}
													text={clause.content}
												/>
											)}
										</View>
										{clause.requiredVariables.length > 0 && (
											<View className="mt-6">
												{clause.requiredVariables.map((variable, index) => (
													<FloatingLabelInput
														focused
														disabled
														key={index}
														placeholder={
															variable.type === VariableType.Number
																? "0.00"
																: "Enter value"
														}
														keyboardType={
															variable.type === VariableType.Number
																? "numeric"
																: "default"
														}
														label={capitalize(
															variable.name.replaceAll("_", " ").toLowerCase(),
															true,
														)}
													/>
												))}
											</View>
										)}
									</Collapsible>
								))}
							</View>
						</Collapsible>
					))}
				</View>
			</BottomSheet>
		</>
	);
}

const VariableText: React.FC<{
	text: string;
	replace?: boolean;
	providedValues?: SubClauseValueInput[];
	hosting?: HostingQuery["hosting"];
}> = React.memo(({ text, hosting, providedValues, replace = true }) => {
	const colors = useThemeColors();

	const hostingAddress = React.useMemo(() => {
		if (!hosting) {
			return "";
		}
		return [
			hosting.landmarks ?? "",
			hosting.city ?? "",
			hosting.state ?? "",
			hosting.country ?? "",
		]
			.filter((v) => v.length > 0)
			.join(" ");
	}, [hosting]);

	const replacedText = React.useMemo(() => {
		if (!replace) return text;

		const formated = formatNaira(hosting?.price);

		let newText = text
			.replaceAll(
				"{{PROPERTY_DESCRIPTION}}",
				`{{<<${capitalize(hosting?.title ?? "", true)}>>}}`,
			)
			.replaceAll(
				"{{PROPERTY_ADDRESS}}",
				`{{<<${capitalize(hostingAddress, true)}>>}}`,
			)
			.replaceAll("{{PRICE}}", `{{<<${formated.formated}>>}}`)
			.replaceAll("{{PRICE_IN_WORDS}}", `{{<<${formated.amountInWords}>>}}`);

		if (hosting?.cautionFee) {
			newText = newText.replace(
				"{{CAUTION_FEE}}",
				`{{<<${formatNaira(hosting.cautionFee).formated}>>}}`,
			);
		}
		if (hosting?.serviceCharge) {
			newText = newText.replace(
				"{{SERVICE_CHARGE}}",
				`{{<<${formatNaira(hosting.serviceCharge).formated}>>}}`,
			);
		}

		if (providedValues && providedValues.length > 0) {
			providedValues.forEach((val) => {
				if (val.value && val.value.trim() !== "") {
					newText = newText.replaceAll(
						`{{${val.key}}}`,
						`{{<<${val.value}>>}}`,
					);
				}
			});
		}

		return newText;
	}, [text, replace, hosting?.title, hostingAddress, providedValues]);

	return (
		<ThemedText>
			{splitVariables(replacedText).map((part, index) => {
				if (part.startsWith("{{") && part.endsWith("}}")) {
					const rawVariable = part.slice(2, -2);
					const cleanVariable = rawVariable.replace(/_/g, " ");
					const isValue = cleanVariable.startsWith("<<");
					return (
						<ThemedText
							key={index}
							type="semibold"
							style={{ color: colors.accent }}
						>
							{isValue
								? cleanVariable.replaceAll("<<", "").replaceAll(">>", "")
								: `[${cleanVariable}]`}
						</ThemedText>
					);
				}
				return part;
			})}
		</ThemedText>
	);
});
VariableText.displayName = "VariableText";
