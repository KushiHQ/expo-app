import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { RefreshControl, View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PublishStatus } from '@/lib/services/graphql/generated';
import LoadingModal from '@/components/atoms/a-loading-modal';
import SignaturePad from '@/components/molecules/m-signature-pad';
import Collapsible from '@/components/molecules/m-collapsible';
import BottomSheet from '@/components/atoms/a-bottom-sheet';
import Button from '@/components/atoms/a-button';
import { FluentTextBulletListSquareEdit20Regular } from '@/components/icons/i-edit';
import Skeleton from '@/components/atoms/a-skeleton';
import TenancyAgreementVariableText from '@/components/molecules/m-tenancy-aggreement-variable-text';
import { useTenancyTermsForm } from '@/lib/hooks/forms/use-tenancy-terms-form';
import { subClauseConditionMet } from '@/lib/utils/hosting/tenancyAgreement';
import MemoizedSubClause from '@/components/organisms/o-memoised-sub-clause';
import { MemoizedEditSection } from '@/components/organisms/o-memoised-edit-sub-clause';
import { FileText, PenLine } from 'lucide-react-native';
import { Fonts } from '@/lib/constants/theme';

export default function NewHostingStep7() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();

  const {
    input,
    hosting,
    hostQueryData,
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
  } = useTenancyTermsForm(String(id));

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!templateFetching && !fetchingHosting) setRefreshing(false);
  }, [templateFetching, fetchingHosting]);

  return (
    <>
      <DetailsLayout
        title="Hosting"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
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
              !input.tenancyAgreementTemplate || !hostQueryData?.authHost.signature?.publicUrl
            }
            step={7}
          />
        }
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <SectionCard
            icon={<FileText size={16} color={colors.primary} />}
            title="Agreement Clauses"
            subtitle="Select the rules and restrictions that apply to your property"
          >
            {(templateFetching || fetchingHosting) && (
              <View style={{ gap: 10 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} style={{ height: 50, borderRadius: 12 }} />
                ))}
              </View>
            )}
            {hosting &&
              input.tenancyAgreementTemplate?.sections.map((section, sIdx) => {
                const visibleClauses = section.subClauses.filter((clause) =>
                  subClauseConditionMet(clause.id, hosting),
                );
                // Roll up variable-completion for the whole section so the
                // collapsed header signals unfinished business at a glance:
                // red while any required variable is blank, green once all are
                // filled, neutral when the section has no variables to fill.
                const sectionVariables = visibleClauses.flatMap((clause) =>
                  clause.requiredVariables.map((variable) => ({ clause, variable })),
                );
                const sectionTint =
                  sectionVariables.length === 0
                    ? 'default'
                    : sectionVariables.every(({ clause, variable }) => {
                        const value = clause.providedValues.find(
                          (pv) => pv.key === variable.name,
                        )?.value;
                        return !!value && value.trim().length > 0;
                      })
                      ? 'success'
                      : 'error';
                return (
                  <Collapsible
                    title={section.title}
                    description={section.description}
                    key={section.id}
                    tint={sectionTint}
                  >
                    <View style={{ marginTop: 12 }}>
                      {section.preamble && (
                        <TenancyAgreementVariableText hosting={hosting} text={section.preamble} />
                      )}
                    </View>
                    <View style={{ marginTop: 12 }}>
                      {visibleClauses.map((clause, cIdx) => (
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
                );
              })}
            <Button type="text" style={{ alignSelf: 'flex-end' }} onPress={() => setEditOpen(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FluentTextBulletListSquareEdit20Regular color={colors.background} size={24} />
                <ThemedText
                  content="text"
                  style={{
                    fontSize: 12,
                    color: hexToRgba(colors.background, 0.5),
                  }}
                >
                  Edit clauses
                </ThemedText>
              </View>
            </Button>
          </SectionCard>

          <SectionCard
            icon={<PenLine size={16} color={colors.primary} />}
            title="Your Signature"
            subtitle="Sign to validate the tenancy agreement"
          >
            <SignaturePad
              existingUrl={hostQueryData?.authHost.signature?.secureUrl}
              onSave={handleHostSignatureSave}
              uploading={loading}
            />
          </SectionCard>
        </View>
      </DetailsLayout>

      <LoadingModal visible={loading} />

      <BottomSheet isVisible={editOpen} onClose={() => setEditOpen(false)}>
        {editOpen && (
          <View style={{ flex: 1 }}>
            <ThemedText
              type="semibold"
              style={{ fontSize: 18, marginBottom: 24, paddingHorizontal: 8 }}
            >
              Edit Clauses
            </ThemedText>
            {hosting && (
              <FlatList
                data={allTemplateSections}
                keyExtractor={(item) => item.id || item.title}
                renderItem={({ item: section }) => (
                  <MemoizedEditSection
                    section={section}
                    hosting={hosting}
                    isChecked={hasSection(section)}
                    onToggleSection={toggleSection}
                    hasSubClause={hasSubClause}
                    onToggleSubClause={toggleSubClause}
                  />
                )}
                ListFooterComponent={
                  templateFetching ? (
                    <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
                  ) : null
                }
                contentContainerStyle={{ paddingBottom: 40 }}
              />
            )}
          </View>
        )}
      </BottomSheet>
    </>
  );
}
