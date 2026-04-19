import {
	HostingQuery,
	SubClause,
	SubClauseValueInput,
} from "@/lib/services/graphql/generated";
import React from "react";
import Collapsible from "../molecules/m-collapsible";
import { View } from "react-native";
import TenancyAgreementVariableText from "../molecules/m-tenancy-aggreement-variable-text";
import MemoizedVariableInput from "../molecules/m-momoised-variable-input";

const MemoizedSubClause = React.memo(
	({
		clause,
		sectionIndex,
		clauseIndex,
		hosting,
		onUpdateVariable,
	}: {
		clause: SubClause;
		sectionIndex: number;
		clauseIndex: number;
		hosting: HostingQuery["hosting"];
		onUpdateVariable: (
			sectionIndex: number,
			subClauseIndex: number,
			variable: SubClauseValueInput,
		) => void;
	}) => {
		return (
			<Collapsible
				title={clause.title}
				description={clause.description}
				key={clause.id}
			>
				<View className="mt-4">
					{clause.content && (
						<TenancyAgreementVariableText
							hosting={hosting}
							providedValues={clause.providedValues}
							text={clause.content}
						/>
					)}
				</View>
				{clause.requiredVariables.length > 0 && (
					<View className="mt-6">
						{clause.requiredVariables.map((variable, vIdx) => (
							<MemoizedVariableInput
								key={variable.name}
								variable={variable}
								index={vIdx}
								providedValue={clause.providedValues[vIdx]?.value}
								onUpdate={(v) =>
									onUpdateVariable(sectionIndex, clauseIndex, {
										key: variable.name,
										value: v,
									})
								}
							/>
						))}
					</View>
				)}
			</Collapsible>
		);
	},
);

MemoizedSubClause.displayName = "MemoizedSubClause";

export default MemoizedSubClause;
