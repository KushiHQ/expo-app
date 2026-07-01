import moment from 'moment';
import BottomSheet from '@/components/atoms/a-bottom-sheet';
import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { VaadinPaintbrush } from '@/components/icons/i-brush';
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
import { SURFACE } from '@/lib/constants/surface';
import { Image } from 'expo-image';
import { Href } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { toast } from '@/lib/hooks/use-toast';
import { FluentDelete24Regular } from '../icons/i-delete';
import { Support } from '../icons/i-support';
import { useDeleteAccountMutation } from '@/lib/services/graphql/generated';

const ProfileScreen = () => {
  const user = useUser();
  const router = useRouter();
  const colors = useThemeColors();
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [_, deleteAccount] = useDeleteAccountMutation();
  const id = user.user.user?.id;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const res = await deleteAccount({});
    setIsDeleting(false);
    if (res.data?.deleteAccount?.data) {
      toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: res.data.deleteAccount.message || 'Your account has been deleted.',
      });
      setDeleteConfirm(false);
      router.replace('/logout');
    } else if (res.error) {
      toast.show({
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
      icon: Support,
      href: '/support',
      label: 'Help & Support',
    },
  ];

  return (
    <>
      <DetailsLayout title="Profile">
        <View className="mt-4 gap-6">
          <View
            className="items-center gap-5 rounded-3xl p-6"
            style={{
              backgroundColor: hexToRgba(colors.text, 0.05),
              boxShadow: SURFACE.shadow,
            }}
          >
            <UserProfileSummary />
            {user.user.user?.createdAt ? (
              <ThemedText
                style={{
                  fontSize: 12,
                  color: hexToRgba(colors.text, 0.45),
                  fontFamily: Fonts.medium,
                }}
              >
                Member since {moment(user.user.user.createdAt).format('MMMM YYYY')}
              </ThemedText>
            ) : null}
            <Pressable
              onPress={() => router.push(`/users/${id}/profile/edit`)}
              className="w-full flex-row items-center justify-center gap-2 rounded-full py-3.5"
              style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
            >
              <VaadinPaintbrush color={colors.text} size={15} />
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 14 }}>
                Edit Profile
              </ThemedText>
            </Pressable>
          </View>

          <View
            className="overflow-hidden rounded-3xl"
            style={{
              backgroundColor: hexToRgba(colors.text, 0.05),
              boxShadow: SURFACE.shadow,
            }}
          >
            {NAVIGATION.map((nav, index) => {
              const Icon = nav.icon;
              return (
                <React.Fragment key={index}>
                  <Pressable
                    onPress={() => router.push(nav.href)}
                    className="flex-row items-center justify-between px-4 py-3.5"
                  >
                    <View className="flex-row items-center gap-3.5">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
                      >
                        <Icon size={20} color={colors.primary} />
                      </View>
                      <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 15 }}>
                        {nav.label}
                      </ThemedText>
                    </View>
                    <ChevronRight size={20} color={hexToRgba(colors.text, 0.3)} />
                  </Pressable>
                  {index < NAVIGATION.length - 1 ? (
                    <View
                      style={{
                        height: 1,
                        marginLeft: 70,
                        backgroundColor: hexToRgba(colors.text, 0.05),
                      }}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>

          <View
            className="overflow-hidden rounded-3xl"
            style={{
              backgroundColor: hexToRgba(colors.text, 0.05),
              boxShadow: SURFACE.shadow,
            }}
          >
            <Pressable
              onPress={() => setLogoutConfirm(true)}
              className="flex-row items-center gap-3.5 px-4 py-3.5"
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: hexToRgba(colors.text, 0.08) }}
              >
                <SolarLogout2Broken size={20} color={colors.text} />
              </View>
              <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 15 }}>Logout</ThemedText>
            </Pressable>
            <View
              style={{ height: 1, marginLeft: 70, backgroundColor: hexToRgba(colors.text, 0.05) }}
            />
            <Pressable
              onPress={() => setDeleteConfirm(true)}
              className="flex-row items-center gap-3.5 px-4 py-3.5"
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: hexToRgba(colors.error, 0.12) }}
              >
                <FluentDelete24Regular size={20} color={colors.error} />
              </View>
              <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 15, color: colors.error }}>
                Delete Account
              </ThemedText>
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
