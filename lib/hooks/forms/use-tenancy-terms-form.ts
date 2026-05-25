import React from 'react';
import { useRouter } from 'expo-router';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import {
  SubClause,
  SubClauseValueInput,
  TenancySection,
  UpdateHostMutation,
  UpdateHostMutationVariables,
  useAuthHostQuery,
  useTenancyAgreementTemplateQuery,
} from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';
import { useToast } from '@/lib/hooks/use-toast';
import { formMutation, generateRNFile } from '@/lib/services/graphql/utils/fetch';
import { UPDATE_HOST } from '@/lib/services/graphql/requests/mutations/users';
import { cleanupAgreementTemplateInput } from '@/lib/utils/hosting/tenancyAgreement';
import * as FileSystem from 'expo-file-system/legacy';

export const useTenancyTermsForm = (id: string) => {
  const router = useRouter();
  const { show } = useToast();
  const {
    input,
    hosting,
    mutate,
    refetch,
    mutating,
    updateInput,
    fetching: fetchingHosting,
  } = useHostingForm(id);
  const [{ data: hostQueryData, fetching: hostFetching }, refetchHost] = useAuthHostQuery();
  const [{ data: templateData, fetching: templateFetching }, refetchTemplate] =
    useTenancyAgreementTemplateQuery();

  const allTemplateSections = templateData?.tenancyAgreementTemplate?.sections || [];

  const [editOpen, setEditOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const loading = mutating || uploading;

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

  const templateInitialized = React.useRef(false);
  const [isReadyToInitialize, setIsReadyToInitialize] = React.useState(false);

  React.useEffect(() => {
    if (!fetchingHosting && !templateFetching && hosting && templateData && input.id) {
      setIsReadyToInitialize(true);
    }
  }, [fetchingHosting, templateFetching, hosting, templateData]);

  React.useEffect(() => {
    const initialize = () => {
      if (isReadyToInitialize && !templateInitialized.current) {
        const currentTemplate = input.tenancyAgreementTemplate;

        if (!currentTemplate || currentTemplate.sections.length === 0) {
          const processedSections = allTemplateSections
            .reduce((acc, { __typename, ...section }) => {
              let activeSubClauses = section.subClauses
                .filter((sub) => sub.isActive || sub.isMandatory)
                .sort((a, b) => a.priority - b.priority);

              if (!input.serviceCharge) {
                activeSubClauses = activeSubClauses.filter(
                  (sub) => sub.id !== 'sub_service_charge',
                );
              }
              if (!input.cautionFee) {
                activeSubClauses = activeSubClauses.filter((sub) => sub.id !== 'sub_caution');
              }

              if (activeSubClauses.length > 0 || !section.subClauses.length) {
                acc.push({ ...section, subClauses: activeSubClauses });
              }
              return acc;
            }, [] as TenancySection[])
            .sort((a, b) => a.priority - b.priority);

          updateInput({
            tenancyAgreementTemplate: {
              sections: processedSections,
              totalSections: processedSections.length,
            },
          });

          templateInitialized.current = true;
        }
      }
    };

    initialize();
  }, [allTemplateSections, input, updateInput, fetchingHosting, isReadyToInitialize]);

  const handleHostSignatureSave = async (base64DataUrl: string) => {
    setUploading(true);
    try {
      const pureBase64 = base64DataUrl.includes(',')
        ? base64DataUrl.split(',')[1]
        : base64DataUrl;
      const uri = `${FileSystem.cacheDirectory}signature_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(uri, pureBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const file = generateRNFile(uri);
      const res = await formMutation<UpdateHostMutation, UpdateHostMutationVariables>(UPDATE_HOST, {
        input: { signature: file },
      });
      if (res.error) handleError(res.error);
      if (res.data) {
        refetchHost({ requestPolicy: 'network-only' });
        show({ type: 'success', text1: 'Success', text2: res.data.updateHost.message });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleMutate = () => {
    for (const section of input.tenancyAgreementTemplate?.sections ?? []) {
      for (const subClause of section.subClauses) {
        if (subClause.requiredVariables.length > 0) {
          for (const variable of subClause.requiredVariables) {
            if (!subClause.providedValues.find((v) => v.key === variable.name)) {
              show({
                type: 'error',
                text1: 'Missing Value',
                text2: `Please provide a value for ${variable.name} in section ${section.title} and sub clause ${subClause.title}`,
              });
              return;
            }
          }
        }
      }
    }
    mutate({
      input: {
        ...input,
        tenancyAgreementTemplate: cleanupAgreementTemplateInput(input.tenancyAgreementTemplate!),
      },
    }).then((res) => {
      if (res.error) handleError(res.error);
      if (res.data) {
        show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createOrUpdateHosting.message,
        });
        refetch();
        router.push(`/hostings/form/step-8?id=${res.data?.createOrUpdateHosting.data?.id}`);
      }
    });
  };

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
          const vIndex = newProvidedValues.findIndex((v) => v.key === variable.key);
          if (vIndex > -1) {
            newProvidedValues[vIndex] = variable;
          } else {
            newProvidedValues.push(variable);
          }
          return { ...sub, providedValues: newProvidedValues };
        }),
      };
    });
    updateInput({
      tenancyAgreementTemplate: {
        sections: newSections,
        totalSections: newSections.length,
      },
    });
  }

  function toggleSection(section: TenancySection) {
    const toUpdate = {
      sections: [...(input.tenancyAgreementTemplate?.sections ?? [])],
    };
    if (toUpdate.sections.find((sec) => sec.id === section.id)) {
      toUpdate.sections = toUpdate.sections.filter((sec) => sec.id !== section.id);
    } else {
      toUpdate.sections.push(section);
    }
    toUpdate.sections.sort((a, b) => a.priority - b.priority);
    updateInput({
      tenancyAgreementTemplate: {
        sections: toUpdate.sections,
        totalSections: toUpdate.sections.length,
      },
    });
  }

  function toggleSubClause(parentSectionId: string, subClause: SubClause) {
    const currentSections = input.tenancyAgreementTemplate?.sections ?? [];
    let newSections = currentSections.map((sec) => ({
      ...sec,
      subClauses: [...sec.subClauses],
    }));
    const sectionIndex = newSections.findIndex((sec) => sec.id === parentSectionId);

    if (sectionIndex > -1) {
      const subIndex = newSections[sectionIndex].subClauses.findIndex(
        (sub) => sub.id === subClause.id,
      );
      if (subIndex > -1) {
        newSections[sectionIndex].subClauses.splice(subIndex, 1);
      } else {
        if (subClause.id === 'sub_caution' && !input.cautionFee) {
          show({
            type: 'error',
            text1: 'Missing Value',
            text2: 'Please provide caution fee...',
          });
          return;
        } else if (subClause.id === 'sub_service_charge' && !input.serviceCharge) {
          show({
            type: 'error',
            text1: 'Missing Value',
            text2: 'Please provide service charge...',
          });
          return;
        }
        newSections[sectionIndex].subClauses.push(subClause);
      }
      newSections[sectionIndex].subClauses.sort((a, b) => a.priority - b.priority);
    } else {
      const parentSection = allTemplateSections.find((s) => s.id === parentSectionId);
      if (parentSection) {
        newSections.push({ ...parentSection, subClauses: [subClause] });
      }
    }
    newSections.sort((a, b) => a.priority - b.priority);
    updateInput({
      tenancyAgreementTemplate: {
        sections: newSections,
        totalSections: newSections.length,
      },
    });
  }

  const hasSection = React.useCallback(
    (section: TenancySection) => activeSectionIds.has(section.id),
    [activeSectionIds],
  );
  const hasSubClause = React.useCallback(
    (clause: SubClause) => activeSubClauseIds.has(clause.id),
    [activeSubClauseIds],
  );

  return {
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
    handleHostSignatureSave,
    handleUpdateVariable,
    toggleSection,
    toggleSubClause,
    hasSection,
    hasSubClause,
    allTemplateSections,
  };
};
