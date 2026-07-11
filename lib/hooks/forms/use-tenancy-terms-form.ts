import React from 'react';
import { useClient } from 'urql';
import { useRouter } from 'expo-router';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import {
  RecommendedTenancyTemplateDocument,
  SubClause,
  SubClauseValueInput,
  TenancySection,
  TenancyTemplate,
  UpdateHostMutation,
  UpdateHostMutationVariables,
  useAuthHostQuery,
  useRecommendedTenancyTemplateQuery,
  useTenancyAgreementSummaryQuery,
  useTenancyAgreementTemplateQuery,
} from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';
import { useToast } from '@/lib/hooks/use-toast';
import { cast } from '@/lib/types/utils';
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
  // Pass the hosting id so the server returns the template filtered to this
  // listing's use-class (residential/commercial/land/short-let).
  const [{ data: templateData, fetching: templateFetching }, refetchTemplate] =
    useTenancyAgreementTemplateQuery({ variables: { hostingId: id }, pause: !id });

  const allTemplateSections = templateData?.tenancyAgreementTemplate?.sections || [];

  const hasExistingTemplate =
    (input.tenancyAgreementTemplate?.sections?.length ?? 0) > 0;

  // First-time default: the AI recommendation (server falls back to the
  // filtered template). Paused once an agreement exists so revisits don't
  // spend tokens.
  const [{ data: recData, fetching: recFetching }] = useRecommendedTenancyTemplateQuery({
    variables: { hostingId: id },
    pause: !id || hasExistingTemplate,
  });
  const recommendedSections = recData?.recommendedTenancyTemplate?.template?.sections || [];

  // Cached plain-English summary of the SAVED agreement.
  const [{ data: summaryData }, refetchSummary] = useTenancyAgreementSummaryQuery({
    variables: { hostingId: id },
    pause: !id || !hasExistingTemplate,
  });
  const savedSummary = summaryData?.tenancyAgreementSummary ?? [];

  // On-demand "Suggest tenancy agreement" — previews a full replacement
  // (clauses AND summary together) without saving. The host then Accepts
  // (persist) or Rejects (revert to the pre-suggest working state).
  const client = useClient();
  const [suggesting, setSuggesting] = React.useState(false);
  const [pendingSuggestion, setPendingSuggestion] = React.useState(false);
  // Working state captured the instant Suggest is pressed, so Reject can undo.
  const preSuggestSnapshot = React.useRef<TenancyTemplate | null | undefined>(undefined);
  // Summary of the previewed/accepted suggestion (overrides the saved summary
  // while a preview is live and immediately after an Accept).
  const [suggestedSummary, setSuggestedSummary] = React.useState<string[] | null>(null);

  const suggestTenancy = async () => {
    if (!id || suggesting) return;
    setSuggesting(true);
    try {
      const res = await client
        .query(RecommendedTenancyTemplateDocument, { hostingId: id }, { requestPolicy: 'network-only' })
        .toPromise();
      const rec = res.data?.recommendedTenancyTemplate;
      const t = rec?.template;
      if (res.error || !t) {
        if (res.error) handleError(res.error);
        else show({ type: 'error', text2: "Couldn't generate a suggestion" });
        return;
      }
      // Snapshot the current working terms before overwriting (Reject undoes).
      preSuggestSnapshot.current = input.tenancyAgreementTemplate;
      // Keep only the clauses the server marked active (mandatory floor + AI
      // selection − fee-gated clauses) so the previewed clause list matches the
      // summary. Drop sections left empty.
      const activeTemplate = {
        totalSections: 0,
        sections: (t.sections as TenancySection[])
          .map((s) => ({ ...s, subClauses: s.subClauses.filter((c) => c.isActive) }))
          .filter((s) => s.subClauses.length > 0),
      };
      updateInput({
        tenancyAgreementTemplate: cleanupAgreementTemplateInput(cast<TenancyTemplate>(activeTemplate)),
      });
      setSuggestedSummary(rec?.summary ?? []);
      setPendingSuggestion(true);
      templateInitialized.current = true;
      show({
        type: 'success',
        text1: 'Suggestion ready',
        text2: 'Review below, then Accept or Reject.',
      });
    } finally {
      setSuggesting(false);
    }
  };

  // Accept the live preview: persist it. Stays on the step so the host can
  // keep filling variables / signing.
  const acceptSuggestion = async () => {
    if (!input.tenancyAgreementTemplate) return;
    const res = await mutate({
      input: {
        ...input,
        tenancyAgreementTemplate: cleanupAgreementTemplateInput(input.tenancyAgreementTemplate),
      },
    });
    if (res.error) {
      handleError(res.error);
      return;
    }
    setPendingSuggestion(false);
    preSuggestSnapshot.current = undefined;
    refetch();
    // Server will regenerate/cache the saved summary; our preview summary
    // matches it, so keep showing it in the meantime.
    refetchSummary({ requestPolicy: 'network-only' });
    show({ type: 'success', text1: 'Saved', text2: 'Tenancy agreement updated.' });
  };

  // Reject the live preview: revert to the state before Suggest was pressed.
  const rejectSuggestion = () => {
    if (preSuggestSnapshot.current !== undefined) {
      updateInput({ tenancyAgreementTemplate: preSuggestSnapshot.current ?? undefined });
    }
    preSuggestSnapshot.current = undefined;
    setSuggestedSummary(null);
    setPendingSuggestion(false);
  };

  // While previewing (and just after accepting) show the suggestion's summary;
  // otherwise the cached summary of the saved agreement.
  const tenancySummary = suggestedSummary ?? savedSummary;

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
    if (!fetchingHosting && !recFetching && hosting && recData && input.id) {
      setIsReadyToInitialize(true);
    }
  }, [fetchingHosting, recFetching, hosting, recData]);

  React.useEffect(() => {
    const initialize = () => {
      if (isReadyToInitialize && !templateInitialized.current) {
        const currentTemplate = input.tenancyAgreementTemplate;

        if (!currentTemplate || currentTemplate.sections.length === 0) {
          // Seed the first-time default from the AI recommendation. Keep only
          // the clauses the server marked active — the mandatory floor, AI
          // selection, and fee-gating (caution / service-charge / deposit) are
          // already resolved server-side, so `isActive` is authoritative.
          const processedSections = recommendedSections
            .reduce((acc, { __typename, ...section }) => {
              const activeSubClauses = section.subClauses
                .filter((sub) => sub.isActive)
                .sort((a, b) => a.priority - b.priority);

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
  }, [recommendedSections, input, updateInput, fetchingHosting, isReadyToInitialize]);

  const handleHostSignatureSave = async (base64DataUrl: string) => {
    setUploading(true);
    try {
      const pureBase64 = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
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
    tenancySummary,
    suggestTenancy,
    suggesting,
    pendingSuggestion,
    acceptSuggestion,
    rejectSuggestion,
  };
};
