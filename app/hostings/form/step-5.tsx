import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import BankSelectOption from "@/components/molecules/m-bank-select-option";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import PaymentDetailsSelectOption from "@/components/molecules/m-payment-details-seclect-option";
import SectionCard from "@/components/molecules/m-section-card";
import SelectInput, {
  SelectOption,
} from "@/components/molecules/m-select-input";
import SelectedPaymentDetails from "@/components/molecules/m-selected-payment-detail";
import { Fonts } from "@/lib/constants/theme";
import { showTenancySteps } from "@/lib/constants/hosting/step-rules";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
  Bank,
  ListingType,
  PaymentInterval,
  useBanksQuery,
  useCreateUpdateHostPaymentDetailsMutation,
  useHostPaymentDetailsQuery,
  useResolveBankAccountQuery,
  VerifyAccountInput,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "@/lib/hooks/use-router";
import { CircleDollarSign, Plus, Wallet } from "lucide-react-native";
import React, { useRef } from "react";
import { TextInput, View } from "react-native";
import { toast } from "@/lib/hooks/use-toast";

export default function NewHostingStep5() {
  const router = useRouter();
  const colors = useThemeColors();
  const serviceChargeRef = useRef<TextInput>(null);
  const cautionFeeRef = useRef<TextInput>(null);
  const maxOccupantsRef = useRef<TextInput>(null);
  const [{ data: banksData }] = useBanksQuery({
    requestPolicy: "cache-first",
  });
  const { id } = useLocalSearchParams();
  const { input, mutate, updateInput, hosting, mutating } = useHostingForm(id);
  const [selectedAccount, setSelectedAcount] = React.useState(
    hosting?.paymentDetails,
  );
  const [newAccountInput, setNewAccountInput] = React.useState(
    {} as VerifyAccountInput,
  );
  const [{ data: hostPaymentDetails }, refetchPaymentDetails] =
    useHostPaymentDetailsQuery({
      requestPolicy: "network-only",
    });
  const [
    { fetching: resolving, data: resolveData, error: resolveError },
    verifyAccount,
  ] = useResolveBankAccountQuery({
    variables: { input: newAccountInput },
    pause: true,
  });

  const [
    { fetching: creatingPaymentDetail, error: savePaymentDetailsError },
    savePaymentDetails,
  ] = useCreateUpdateHostPaymentDetailsMutation();

  const selectedAccountString = React.useMemo(() => {
    if (selectedAccount) {
      const num = selectedAccount.accountNumber;
      const acc = `${num.slice(-3)}***${num.slice(0, 3)}`;
      return `${acc} ${selectedAccount.bankDetails?.name}`;
    }
    return null;
  }, [selectedAccount]);

  React.useEffect(() => {
    if (resolveError) handleError(resolveError);
    if (savePaymentDetailsError) handleError(savePaymentDetailsError);
  }, [resolveError, savePaymentDetailsError]);

  React.useEffect(() => {
    if (resolveData && !selectedAccount) {
      savePaymentDetails({
        input: {
          accountNumber: newAccountInput.accountNumber,
          accountName: resolveData.resolveBankAccount,
          bankCode: newAccountInput.bankCode,
        },
      }).then((res) => {
        if (res.error) {
          handleError(res.error);
        }
        if (res.data?.createUpdateHostPaymentDetails.data) {
          const data = res.data.createUpdateHostPaymentDetails;
          toast.show({
            type: "success",
            text1: "Success",
            text2: data.message,
          });
          setSelectedAcount(res.data?.createUpdateHostPaymentDetails.data);
        }
        refetchPaymentDetails();
      });
    }
  }, [
    resolveData,
    newAccountInput.bankCode,
    newAccountInput.accountNumber,
    refetchPaymentDetails,
    savePaymentDetails,
    selectedAccount,
  ]);

  const handleMutate = () => {
    updateInput({ paymentDetailsId: selectedAccount?.id });
    mutate({ input: { ...input, paymentDetailsId: selectedAccount?.id } }).then(
      (res) => {
        if (res.error) handleError(res.error);
        if (res.data?.createOrUpdateHosting) {
          router.push(
            showTenancySteps(hosting?.listingType, hosting?.propertyType)
              ? `/hostings/form/step-6?id=${res.data?.createOrUpdateHosting.data?.id}`
              : `/hostings/form/step-8?id=${res.data?.createOrUpdateHosting.data?.id}`,
          );
          toast.show({
            type: "success",
            text1: "Success",
            text2: res.data.createOrUpdateHosting.message,
          });
        }
      },
    );
  };

  const loading = creatingPaymentDetail || resolving || mutating;
  const canSaveNewAccount =
    !!(newAccountInput.bankCode && newAccountInput.accountNumber) && !resolving;
  const isSale = hosting?.listingType === ListingType.Sale;

  return (
    <>
      <DetailsLayout
        title="Hosting"
        footer={
          <HostingStepper
            onPress={handleMutate}
            loading={mutating}
            disabled={
              !selectedAccount ||
              !input.price ||
              (!isSale && !input.paymentInterval)
            }
            step={6}
          />
        }
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          {/* Pricing section */}
          <SectionCard
            icon={<CircleDollarSign size={16} color={colors.primary} />}
            title="Pricing"
            subtitle={
              isSale
                ? "Set the sale price"
                : "Set the rental price and optional fees"
            }
          >
            {isSale ? (
              <FloatingLabelInput
                focused
                inputMode="numeric"
                label="Sale Price"
                value={Number(input.price).toLocaleString()}
                onChangeText={(v) =>
                  updateInput({
                    price: v.replace("₦", "").replaceAll(",", ""),
                  })
                }
                placeholder="₦ 0"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            ) : (
              <>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <SelectInput
                      focused
                      label="Payment Interval"
                      placeholder="Annually"
                      defaultValue={
                        input.paymentInterval
                          ? {
                            label: input.paymentInterval,
                            value: input.paymentInterval,
                          }
                          : undefined
                      }
                      onSelect={(v) =>
                        updateInput({ paymentInterval: v.value })
                      }
                      options={Object.keys(PaymentInterval).map((v) => ({
                        label: PaymentInterval[
                          v as keyof typeof PaymentInterval
                        ]
                          .split("_")
                          .join(" "),
                        value:
                          PaymentInterval[v as keyof typeof PaymentInterval],
                      }))}
                      renderItem={SelectOption}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FloatingLabelInput
                      focused
                      inputMode="numeric"
                      label="Rent Price"
                      value={Number(input.price).toLocaleString()}
                      onChangeText={(v) =>
                        updateInput({
                          price: v.replace("₦", "").replaceAll(",", ""),
                        })
                      }
                      placeholder="₦ 0"
                      returnKeyType="next"
                      onSubmitEditing={() => serviceChargeRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <FloatingLabelInput
                      ref={serviceChargeRef}
                      focused
                      inputMode="numeric"
                      label="Service Charge"
                      value={
                        input.serviceCharge
                          ? Number(input.serviceCharge).toLocaleString()
                          : undefined
                      }
                      onChangeText={(v) =>
                        updateInput({
                          serviceCharge: v.replace("₦", "").replaceAll(",", ""),
                        })
                      }
                      placeholder="Optional"
                      returnKeyType="next"
                      onSubmitEditing={() => cautionFeeRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FloatingLabelInput
                      ref={cautionFeeRef}
                      focused
                      inputMode="numeric"
                      label="Caution Fee"
                      value={
                        input.cautionFee
                          ? Number(input.cautionFee).toLocaleString()
                          : undefined
                      }
                      onChangeText={(v) =>
                        updateInput({
                          cautionFee: v.replace("₦", "").replaceAll(",", ""),
                        })
                      }
                      placeholder="Optional"
                      returnKeyType="next"
                      onSubmitEditing={() => maxOccupantsRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>
              </>
            )}
          </SectionCard>

          {/* Payout account section */}
          <SectionCard
            icon={<Wallet size={16} color={colors.primary} />}
            title="Payout Account"
            subtitle="Payments are disbursed here after booking confirmation"
          >
            {selectedAccount ? (
              <View style={{ gap: 12 }}>
                <SelectedPaymentDetails details={selectedAccount} />
                <Button
                  variant="outline"
                  type="shade"
                  onPress={() => setSelectedAcount(undefined)}
                >
                  <ThemedText
                    style={{ fontSize: 13, color: hexToRgba(colors.text, 0.6) }}
                  >
                    Change Account
                  </ThemedText>
                </Button>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {/* Saved accounts */}
                {(hostPaymentDetails?.hostPaymentDetails ?? []).length > 0 && (
                  <View style={{ gap: 8 }}>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontFamily: Fonts.medium,
                        color: hexToRgba(colors.text, 0.5),
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Saved Accounts
                    </ThemedText>
                    <SelectInput
                      focused
                      searchable
                      searchField="name"
                      label="Select a saved account"
                      selectedValueString={selectedAccountString ?? undefined}
                      placeholder="Choose account"
                      defaultValue={selectedAccount ?? undefined}
                      onSelect={setSelectedAcount}
                      renderItem={PaymentDetailsSelectOption}
                      getValueString={(v) => v?.id}
                      options={hostPaymentDetails?.hostPaymentDetails ?? []}
                    />
                  </View>
                )}

                {/* Divider */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: hexToRgba(colors.text, 0.08),
                    }}
                  />
                  <ThemedText
                    style={{
                      fontSize: 11,
                      color: hexToRgba(colors.text, 0.35),
                      fontFamily: Fonts.medium,
                    }}
                  >
                    {(hostPaymentDetails?.hostPaymentDetails ?? []).length > 0
                      ? "OR ADD NEW"
                      : "ADD ACCOUNT"}
                  </ThemedText>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: hexToRgba(colors.text, 0.08),
                    }}
                  />
                </View>

                {/* New account form */}
                <View style={{ gap: 12 }}>
                  <ThemedText
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.medium,
                      color: hexToRgba(colors.text, 0.5),
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    New Account
                  </ThemedText>
                  <FloatingLabelInput
                    focused
                    inputMode="numeric"
                    label="Account Number"
                    onChangeText={(v) =>
                      setNewAccountInput((c) => ({ ...c, accountNumber: v }))
                    }
                    placeholder="10-digit account number"
                  />
                  <SelectInput
                    focused
                    searchable
                    searchField="name"
                    label="Bank"
                    placeholder="Select your bank"
                    onSelect={(v) =>
                      setNewAccountInput((c) => ({ ...c, bankCode: v.code }))
                    }
                    getLabelString={(v) => v?.name ?? ""}
                    renderItem={BankSelectOption}
                    getValueString={(v: Bank) => v?.name}
                    options={banksData?.banks ?? []}
                  />
                  <Button
                    type="primary"
                    onPress={() => {
                      setSelectedAcount(undefined);
                      verifyAccount({ requestPolicy: "network-only" });
                    }}
                    disabled={!canSaveNewAccount}
                    loading={resolving}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Plus size={16} color="#fff" />
                      <ThemedText
                        content="primary"
                        style={{ fontFamily: Fonts.medium }}
                      >
                        Verify & Save Account
                      </ThemedText>
                    </View>
                  </Button>
                </View>
              </View>
            )}
          </SectionCard>
        </View>
      </DetailsLayout>
      <LoadingModal visible={loading} />
    </>
  );
}
