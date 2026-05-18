import Button from '@/components/atoms/a-button';
import Centered from '@/components/atoms/a-centered';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import LoadingModal from '@/components/atoms/a-loading-modal';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import BankSelectOption from '@/components/molecules/m-bank-select-option';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import PaymentDetailsSelectOption from '@/components/molecules/m-payment-details-seclect-option';
import SelectInput, { SelectOption } from '@/components/molecules/m-select-input';
import SelectedPaymentDetails from '@/components/molecules/m-selected-payment-detail';
import { Fonts } from '@/lib/constants/theme';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useBanksQuery } from '@/lib/services/external/banks';
import {
  PaymentInterval,
  useCreateUpdateHostPaymentDetailsMutation,
  useHostPaymentDetailsQuery,
  useResolveBankAccountQuery,
  VerifyAccountInput,
} from '@/lib/services/graphql/generated';
import { Bank } from '@/lib/types/queries/banks';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleQuestionMark } from 'lucide-react-native';
import React, { useRef } from 'react';
import { TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function NewHostingStep5() {
  const router = useRouter();
  const colors = useThemeColors();
  const serviceChargeRef = useRef<TextInput>(null);
  const cautionFeeRef = useRef<TextInput>(null);
  const { data } = useBanksQuery();
  const { id } = useLocalSearchParams();
  const {
    input,
    mutate,
    updateInput,
    hosting,
    mutating,
    fetching: fetchingHosting,
  } = useHostingForm(id);
  const [selectedAccount, setSelectedAcount] = React.useState(hosting?.paymentDetails);
  const [newAccountInput, setNewAccountInput] = React.useState({} as VerifyAccountInput);
  const [{ data: hostPaymentDetails }, refetchPaymentDetails] = useHostPaymentDetailsQuery({
    requestPolicy: 'network-only',
  });
  const [{ fetching: resolving, data: resolveData, error: resolveError }, verifyAccount] =
    useResolveBankAccountQuery({
      variables: { input: newAccountInput },
      pause: true,
    });

  const [{ fetching: creatingPaymentDetail, error: savePaymentDetailsError }, savePaymentDetails] =
    useCreateUpdateHostPaymentDetailsMutation();

  const selectedAccountString = React.useMemo(() => {
    if (selectedAccount) {
      const num = selectedAccount.accountNumber;
      const acc = `${num.slice(-3)}***${num.slice(0, 3)}`;

      return `${acc} ${selectedAccount.bankDetails?.name}`;
    }
    return null;
  }, [selectedAccount]);

  React.useEffect(() => {
    if (resolveError) {
      handleError(resolveError);
    }
    if (savePaymentDetailsError) {
      handleError(savePaymentDetailsError);
    }
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
          Toast.show({
            type: 'success',
            text1: 'Success',
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
    refetchPaymentDetails,
    savePaymentDetails,
    selectedAccount,
  ]);

  const handleMutate = () => {
    updateInput({ paymentDetailsId: selectedAccount?.id });
    mutate({ input: { ...input, paymentDetailsId: selectedAccount?.id } }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data?.createOrUpdateHosting) {
        router.push(`/hostings/form/step-6?id=${res.data?.createOrUpdateHosting.data?.id}`);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createOrUpdateHosting.message,
        });
      }
    });
  };

  const loading = creatingPaymentDetail || resolving || mutating || fetchingHosting;

  return (
    <>
      <DetailsLayout
        title="Hosting"
        footer={
          <HostingStepper
            onPress={handleMutate}
            loading={mutating}
            disabled={!selectedAccount || !input.paymentInterval || !input.price}
            step={5}
          />
        }
      >
        <View className="min-h-[600px]">
          <View className="mt-2 gap-4">
            <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
              <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
              {'  '}
              Define your property&apos;s Pricing and how often you expect rent (e.g., Annually).
              Then, link a Bank Account for secure payments, payments will be sent here after
              booking confirmation, either by selecting a saved account or adding a new one.
            </ThemedText>
            <ThemedText style={{ fontFamily: Fonts.medium }}>
              {'Pricing & Payment Details'}
            </ThemedText>
            <View className="flex-row gap-4">
              <SelectInput
                focused
                label="Payment Interval"
                placeholder="Anually"
                defaultValue={
                  input.paymentInterval
                    ? {
                        label: input.paymentInterval,
                        value: input.paymentInterval,
                      }
                    : undefined
                }
                onSelect={(v) => updateInput({ paymentInterval: v.value })}
                options={Object.keys(PaymentInterval).map((v) => ({
                  label: v,
                  value: PaymentInterval[v as keyof typeof PaymentInterval],
                }))}
                renderItem={SelectOption}
              />
              <View className="flex-1">
                <FloatingLabelInput
                  focused
                  inputMode="numeric"
                  label="Price"
                  value={Number(input.price).toLocaleString()}
                  onChangeText={(v) =>
                    updateInput({
                      price: v.replace('₦', '').replaceAll(',', ''),
                    })
                  }
                  placeholder="100,000 (₦)"
                  returnKeyType="next"
                  onSubmitEditing={() => serviceChargeRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FloatingLabelInput
                  ref={serviceChargeRef}
                  focused
                  inputMode="numeric"
                  label="Service Charge (Optional)"
                  value={
                    input.serviceCharge ? Number(input.serviceCharge).toLocaleString() : undefined
                  }
                  onChangeText={(v) =>
                    updateInput({
                      serviceCharge: v.replace('₦', '').replaceAll(',', ''),
                    })
                  }
                  placeholder="100,000 (₦)"
                  returnKeyType="next"
                  onSubmitEditing={() => cautionFeeRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              <View className="flex-1">
                <FloatingLabelInput
                  ref={cautionFeeRef}
                  focused
                  inputMode="numeric"
                  label="Caution Fee (Optional)"
                  value={input.cautionFee ? Number(input.cautionFee).toLocaleString() : undefined}
                  onChangeText={(v) =>
                    updateInput({
                      cautionFee: v.replace('₦', '').replaceAll(',', ''),
                    })
                  }
                  placeholder="100,000 (₦)"
                  returnKeyType="done"
                />
              </View>
            </View>
            <View>
              <ThemedText className="mb-4" style={{ fontFamily: Fonts.medium }}>
                Select account
              </ThemedText>
              <View className="h-[68px]">
                <SelectInput
                  focused
                  searchable
                  searchField="name"
                  label="Account"
                  selectedValueString={selectedAccountString ?? undefined}
                  placeholder="Select account"
                  defaultValue={selectedAccount ?? undefined}
                  onSelect={setSelectedAcount}
                  renderItem={PaymentDetailsSelectOption}
                  getValueString={(v) => v?.id}
                  options={hostPaymentDetails?.hostPaymentDetails ?? []}
                />
              </View>
              <View className="mt-4">
                <Centered>
                  <ThemedText>Or</ThemedText>
                </Centered>
                <ThemedText style={{ fontFamily: Fonts.medium }}>Create New Account</ThemedText>
              </View>
            </View>
            <View className="gap-4">
              <View className="flex-row items-center gap-4">
                <View className="flex-1">
                  <FloatingLabelInput
                    focused
                    inputMode="numeric"
                    label="Account Number"
                    onChangeText={(v) => setNewAccountInput((c) => ({ ...c, accountNumber: v }))}
                    placeholder="Payments will be transfered here"
                  />
                </View>
                <SelectInput
                  focused
                  searchable
                  searchField="name"
                  label="Bank"
                  placeholder="Select bank"
                  onSelect={(v) => {
                    setNewAccountInput((c) => ({ ...c, bankCode: v.code }));
                  }}
                  getLabelString={(v) => v?.name ?? ''}
                  renderItem={BankSelectOption}
                  getValueString={(v: Bank) => v?.name}
                  options={data ?? []}
                />
              </View>
              <Button
                type="text"
                onPress={() => {
                  setSelectedAcount(undefined);
                  verifyAccount({ requestPolicy: 'network-only' });
                }}
                disabled={!newAccountInput.bankCode || !newAccountInput.accountNumber || resolving}
                loading={resolving}
              >
                <ThemedText content="text">Save</ThemedText>
              </Button>
            </View>
            {selectedAccount && (
              <View className="mt-4">
                <SelectedPaymentDetails details={selectedAccount} />
              </View>
            )}
          </View>
        </View>
      </DetailsLayout>
      <LoadingModal visible={loading} />
    </>
  );
}
