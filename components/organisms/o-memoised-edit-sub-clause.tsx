import React from "react";
import { View } from "react-native";
import Collapsible from "@/components/molecules/m-collapsible";
import TenancyAgreementVariableText from "@/components/molecules/m-tenancy-aggreement-variable-text";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import {
	VariableType,
	SubClause,
	TenancySection,
	HostingQuery,
} from "@/lib/services/graphql/generated";
import { capitalize } from "@/lib/utils/text";

export const MemoizedEditSubClause = React.memo(
	({
		clause,
		sectionId,
		hosting,
		isChecked,
		onToggle,
	}: {
		clause: SubClause;
		sectionId: string;
		hosting: HostingQuery["hosting"];
		isChecked: boolean;
		onToggle: (sectionId: string, clause: SubClause) => void;
	}) => {
		return (
			<Collapsible
				withCheckbox
				checked={isChecked}
				onCheckedChange={() => onToggle(sectionId, clause)}
				checkDisabled={clause.isMandatory}
				tint={isChecked ? "primary" : "shade"}
				title={clause.title}
				description={clause.description}
			>
				<View className="mt-4">
					{clause.content && (
						<TenancyAgreementVariableText
							hosting={hosting}
							replace={false}
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
									variable.type === VariableType.Number ? "0.00" : "Enter value"
								}
								keyboardType={
									variable.type === VariableType.Number ? "numeric" : "default"
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
		);
	},
);

MemoizedEditSubClause.displayName = "MemoizedEditSubClause";

export const MemoizedEditSection = React.memo(
	({
		section,
		hosting,
		isChecked,
		onToggleSection,
		hasSubClause,
		onToggleSubClause,
	}: {
		section: TenancySection;
		hosting: HostingQuery["hosting"];
		isChecked: boolean;
		onToggleSection: (section: TenancySection) => void;
		hasSubClause: (clause: SubClause) => boolean;
		onToggleSubClause: (sectionId: string, clause: SubClause) => void;
	}) => {
		return (
			<Collapsible
				withCheckbox
				checked={isChecked}
				onCheckedChange={() => onToggleSection(section)}
				checkDisabled={
					!!section.subClauses.find((sub) => sub.isMandatory) ||
					!section.subClauses.length
				}
				tint={isChecked ? "primary" : "shade"}
				title={section.title}
				description={section.description}
			>
				<View className="mt-4">
					{section.preamble && (
						<TenancyAgreementVariableText
							hosting={hosting}
							replace={false}
							text={section.preamble}
						/>
					)}
				</View>
				<View className="mt-4">
					{hosting &&
						section.subClauses.map((clause) => (
							<MemoizedEditSubClause
								key={clause.id || clause.title}
								clause={clause}
								sectionId={section.id}
								hosting={hosting}
								isChecked={hasSubClause(clause)}
								onToggle={onToggleSubClause}
							/>
						))}
				</View>
			</Collapsible>
		);
	},
);

MemoizedEditSection.displayName = "MemoizedEditSection";
