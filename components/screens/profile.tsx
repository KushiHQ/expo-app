import moment from 'moment';
import BottomSheet from '@/components/atoms/a-bottom-sheet';
import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { VaadinPaintbrush } from '@/components/icons/i-brush';
import { CuidaBuildingOutline } from '@/components/icons/i-home';
import { LinkIcon } from '@/components/icons/i-link';
import { SolarLogout2Broken } from '@/components/icons/i-logout';
import { IonNotificationsOutline } from '@/components/icons/i-notifications';
import { SolarCardLinear, SolarWalletMoneyOutline } from '@/components/icons/i-payments';
import { HugeiconsShieldUser, UilUser } from '@/components/icons/i-user';
import DetailsLayout from '@/components/layouts/details';
import UserProfileSummary from '@/components/molecules/m-user-profile-summary';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import { CustomSvgProps } from '@/lib/types/svgType';
import { hexToRgba } from '@/lib/utils/colors';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useMutation } from 'urql';
import Toast from 'react-native-toast-message';
import { FluentDelete24Regular } from '../icons/i-delete';

const DELETE_ACCOUNT = `
  mutation DeleteAccount {
    deleteAccount {
      message
      data
    }
  }
`;

const ProfileScreen = () => {
  const user = useUser();
  const router = useRouter();
  const colors = useThemeColors();
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [_, deleteAccount] = useMutation(DELETE_ACCOUNT);
  const id = user.user.user?.id;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const res = await deleteAccount({});
    setIsDeleting(false);
    if (res.data?.deleteAccount?.data) {
      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: res.data.deleteAccount.message || 'Your account has been deleted.',
      });
      setDeleteConfirm(false);
      router.replace('/logout');
    } else if (res.error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: res.error.message || 'Failed to delete account.',
      });
    }
  };

  const NAVIGATION: {
    icon: React.FC<CustomSvgProps>;
    href: Href;
    label: string;
  }[] = [
    {
      icon: UilUser,
      href: `/users/${id}/profile/edit`,
      label: 'Profile',
    },
    {
      icon: SolarCardLinear,
      href: `/bookings`,
      label: 'My Bookings',
    },
    {
      icon: SolarWalletMoneyOutline,
      href: `/users/${id}/transactions`,
      label: 'Payments',
    },
    {
      icon: IonNotificationsOutline,
      href: `/users/${id}/notification-settings`,
      label: 'Notifications',
    },
    {
      icon: HugeiconsShieldUser,
      href: '/kyc',
      label: 'KYC',
    },
    {
      icon: LinkIcon,
      href: '/host/listings',
      label: 'Hostings',
    },
  ];

  return (
    <>
      <DetailsLayout title="Profile">
        <View className="mt-4">
          <View
            className="flex-row flex-wrap items-center gap-4 rounded-xl border p-6"
            style={{
              borderColor: hexToRgba(colors.primary, 0.2),
              backgroundColor: colors.background,
              ...Platform.select({
                ios: {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                },
                android: {
                  elevation: 10,
                  shadowColor: hexToRgba(colors.text, 0.5),
                },
              }),
            }}
          >
            <UserProfileSummary />
            <View
              style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
              className="min-w-[40px] flex-[1.5] gap-5 rounded-xl p-4"
            >
              <View className="flex-row items-center gap-2">
                <CuidaBuildingOutline color={colors.accent} size={16} />
                <ThemedText style={{ fontSize: 12 }}>
                  {moment(user.user.user?.createdAt).fromNow()}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => router.push(`/users/${id}/profile/edit`)}
                className="flex-row items-center justify-center gap-2 rounded-lg p-1"
                style={{ backgroundColor: colors.text }}
              >
                <VaadinPaintbrush color={colors.background} size={16} />
                <ThemedText style={{ color: colors.background }}>Edit Profile</ThemedText>
              </Pressable>
            </View>
          </View>
          <View className="mt-8 gap-2">
            {NAVIGATION.map((nav, index) => {
              const Icon = nav.icon;
              return (
                <Pressable
                  onPress={() => router.push(nav.href)}
                  key={index}
                  className="flex-row items-center justify-between p-2 py-4"
                >
                  <View className="flex-row items-center gap-3">
                    <Icon size={24} color={colors.primary} />
                    <ThemedText style={{ fontFamily: Fonts.medium }}>{nav.label}</ThemedText>
                  </View>
                  <ChevronRight size={24} color={colors.text} />
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setDeleteConfirm(true)}
              className="flex-row items-center justify-between p-2 py-4"
            >
              <View className="flex-row items-center gap-3">
                <FluentDelete24Regular size={24} color={colors.error} />
                <ThemedText style={{ fontFamily: Fonts.medium, color: colors.error }}>
                  Delete Account
                </ThemedText>
              </View>
              <ChevronRight size={24} color={colors.error} />
            </Pressable>
            <Pressable
              onPress={() => setLogoutConfirm(true)}
              className="flex-row items-center justify-between p-2 py-4"
            >
              <View className="flex-row items-center gap-3">
                <SolarLogout2Broken size={24} color={colors.error} />
                <ThemedText style={{ fontFamily: Fonts.medium }}>Logout</ThemedText>
              </View>
              <ChevronRight size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </DetailsLayout>
      <BottomSheet isVisible={logoutConfirm} onClose={() => setLogoutConfirm(false)}>
        <View className="items-center gap-8 pb-20">
          <Image
            style={{
              width: 250,
              height: 250,
              objectFit: 'cover',
            }}
            source={require('@/assets/images/caution.png')}
          />
          <ThemedText type="semibold">Are you sure you want to logout?</ThemedText>
          <View className="max-w-[400px] flex-row items-center gap-4">
            <Button type="error" className="flex-1" onPress={() => router.replace('/logout')}>
              <ThemedText content="error">Logout</ThemedText>
            </Button>
            <Button
              variant="outline"
              type="shade"
              className="flex-1"
              onPress={() => setLogoutConfirm(false)}
            >
              <ThemedText>Cancel</ThemedText>
            </Button>
          </View>
        </View>
      </BottomSheet>
      <BottomSheet isVisible={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <View className="items-center gap-8 pb-20">
          <Image
            style={{
              width: 250,
              height: 250,
              objectFit: 'cover',
            }}
            source={require('@/assets/images/caution.png')}
          />
          <ThemedText type="semibold">
            Are you sure you want to delete your account? This action cannot be undone.
          </ThemedText>
          <View className="max-w-[400px] flex-row items-center gap-4">
            <Button
              type="error"
              className="flex-1"
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ThemedText>Deleting...</ThemedText>
              ) : (
                <ThemedText content="error">Delete</ThemedText>
              )}
            </Button>
            <Button
              variant="outline"
              type="shade"
              className="flex-1"
              onPress={() => setDeleteConfirm(false)}
              disabled={isDeleting}
            >
              <ThemedText>Cancel</ThemedText>
            </Button>
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default ProfileScreen;
