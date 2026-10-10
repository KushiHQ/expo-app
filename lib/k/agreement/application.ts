import type { TenancyAgreementTemplateQuery } from '@/lib/services/graphql/generated';

export function sortGuestTenancyAggreement(
	templateData: TenancyAgreementTemplateQuery['tenancyAgreementTemplate']
) {
	const processedSections = templateData!.sections
		.reduce(
			(acc, { __typename, ...section }) => {
				let activeSubClauses = section.subClauses
					.filter((sub) => sub.isActive || sub.isMandatory)
					.sort((a, b) => a.priority - b.priority);

				if (activeSubClauses.length > 0 || !section.subClauses.length) {
					acc.push({ ...section, subClauses: activeSubClauses });
				}
				return acc;
			},
			[] as TenancyAgreementTemplateQuery['tenancyAgreementTemplate']['sections']
		)
		.sort((a, b) => a.priority - b.priority);

	return { sections: processedSections, totalSections: templateData!.totalSections };
}
