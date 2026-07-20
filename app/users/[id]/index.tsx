import { Pressable, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import moment from 'moment';
import { Star, Flag, MessageSquareText, BadgeCheck, ShieldCheck } from 'lucide-react-native';
import DetailsLayout from '@/components/layouts/details';
import ThemedText from '@/components/atoms/a-themed-text';
import Button from '@/components/atoms/a-button';
import TextArea from '@/components/atoms/a-textarea';
import RatingInput from '@/components/atoms/a-rating-input';
import BottomSheet from '@/components/atoms/a-bottom-sheet';
import ManagementBadge from '@/components/atoms/a-management-badge';
import { useRouter } from '@/lib/hooks/use-router';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import { Fonts } from '@/lib/constants/theme';
import { useUser } from '@/lib/hooks/user';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { formatNaira } from '@/lib/utils/currency';
import {
  ManagementType,
  useReportAgentReviewMutation,
  useReviewAgentMutation,
  useUserProfileQuery,
} from '@/lib/services/graphql/generated';

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(rating);
        return (
          <Star
            key={n}
            size={size}
            color={filled ? colors.primary : hexToRgba(colors.text, 0.3)}
            fill={filled ? colors.primary : 'transparent'}
          />
        );
      })}
    </View>
  );
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useUser();
  const myId = user.user?.id;

  const [{ data, fetching }, refetch] = useUserProfileQuery({ variables: { userId: id } });
  const profile = data?.userProfile;

  const [, reviewAgent] = useReviewAgentMutation();
  const [, reportReview] = useReportAgentReviewMutation();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const isSelf = !!myId && myId === id;

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.show({ type: 'error', text2: 'Please select a rating' });
      return;
    }
    setSubmitting(true);
    const res = await reviewAgent({
      agentId: id,
      rating,
      comment: comment.trim() || undefined,
    });
    setSubmitting(false);
    if (res.error) return handleError(res.error);
    toast.show({ type: 'success', text1: 'Thank you', text2: 'Your review has been submitted' });
    setSheetOpen(false);
    setComment('');
    setRating(0);
    refetch({ requestPolicy: 'network-only' });
  };

  const handleReport = async (reviewId: string) => {
    const res = await reportReview({ reviewId });
    if (res.error) return handleError(res.error);
    toast.show({ type: 'success', text2: 'Review reported to our team' });
  };

  const card = {
    backgroundColor: hexToRgba(colors.text, 0.05),
    boxShadow: SURFACE.shadow,
  } as const;

  return (
    <DetailsLayout title="Profile">
      <View className="gap-5 px-4 pb-10">
        {/* Header */}
        <View className="items-center gap-3 rounded-3xl p-6" style={card}>
          <View className="h-20 w-20 overflow-hidden rounded-full">
            <Image
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
              source={{
                uri:
                  profile?.avatar ??
                  getDefaultProfileImageUrl(profile?.fullName ?? ''),
              }}
            />
          </View>
          <View className="flex-row items-center gap-1.5">
            <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 18 }}>
              {profile?.fullName ?? (fetching ? 'Loading…' : 'User')}
            </ThemedText>
            {profile?.verified && (
              <BadgeCheck size={18} color={colors.primary} fill={hexToRgba(colors.primary, 0.15)} />
            )}
          </View>
          {profile?.verified ? (
            <View
              className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
            >
              <ShieldCheck size={12} color={colors.primary} />
              <ThemedText style={{ color: colors.primary, fontSize: 11, fontFamily: Fonts.medium }}>
                Identity verified
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.4), fontSize: 11 }}>
              Identity not yet verified
            </ThemedText>
          )}
          {profile?.memberSince && (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.5), fontSize: 12 }}>
              Member since {moment(profile.memberSince).format('MMMM YYYY')}
            </ThemedText>
          )}
          {(profile?.agentReviewCount ?? 0) > 0 ? (
            <View className="flex-row items-center gap-2">
              <Stars rating={profile?.agentRatingAvg ?? 0} />
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 13 }}>
                {(profile?.agentRatingAvg ?? 0).toFixed(1)} · {profile?.agentReviewCount}{' '}
                review{profile?.agentReviewCount === 1 ? '' : 's'}
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.5), fontSize: 13 }}>
              No reviews yet
            </ThemedText>
          )}
          {!isSelf && (
            <Button className="mt-1" onPress={() => setSheetOpen(true)}>
              <View className="flex-row items-center gap-2">
                <MessageSquareText size={16} color="#050505" />
                <ThemedText content="primary">Leave a review</ThemedText>
              </View>
            </Button>
          )}
        </View>

        {/* Listings */}
        {(profile?.listings.length ?? 0) > 0 && (
          <View className="gap-3">
            <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15 }}>
              Active listings ({profile?.listings.length})
            </ThemedText>
            {profile?.listings.map((l) => (
              <Pressable
                key={l.id}
                className="flex-row items-center gap-3 rounded-2xl p-3"
                style={card}
                onPress={() => router.push(`/hostings/${l.id}`)}
              >
                <View className="h-16 w-16 overflow-hidden rounded-xl">
                  <Image
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    source={{ uri: l.coverImage?.asset.publicUrl }}
                  />
                </View>
                <View className="flex-1 gap-1">
                  <ThemedText numberOfLines={1} style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
                    {l.title ?? 'Untitled listing'}
                  </ThemedText>
                  <ThemedText style={{ color: hexToRgba(colors.text, 0.55), fontSize: 12 }}>
                    {[l.city, l.state].filter(Boolean).join(', ')}
                  </ThemedText>
                  <View className="flex-row items-center gap-2">
                    {l.price != null && (
                      <ThemedText style={{ color: colors.primary, fontSize: 13, fontFamily: Fonts.semibold }}>
                        {formatNaira(Number(l.price)).formated}
                      </ThemedText>
                    )}
                    {l.managementType === ManagementType.AgentManaged && (
                      <ManagementBadge managementType={l.managementType} />
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Reviews */}
        <View className="gap-3">
          <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15 }}>
            Reviews {(profile?.reviews.length ?? 0) > 0 ? `(${profile?.reviews.length})` : ''}
          </ThemedText>
          {(profile?.reviews.length ?? 0) === 0 && !fetching && (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.5), fontSize: 13 }}>
              This host has no reviews yet.
            </ThemedText>
          )}
          {profile?.reviews.map((r) => (
            <View key={r.id} className="gap-2 rounded-2xl p-4" style={card}>
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 overflow-hidden rounded-full">
                  <Image
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    source={{
                      uri: r.reviewerAvatar ?? getDefaultProfileImageUrl(r.reviewerName),
                    }}
                  />
                </View>
                <View className="flex-1">
                  <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
                    {r.reviewerName}
                  </ThemedText>
                  <View className="flex-row items-center gap-2">
                    <Stars rating={r.rating} size={12} />
                    <ThemedText style={{ color: hexToRgba(colors.text, 0.45), fontSize: 11 }}>
                      {moment(r.createdAt).fromNow()}
                    </ThemedText>
                  </View>
                </View>
                <Pressable hitSlop={10} onPress={() => handleReport(r.id)}>
                  <Flag size={16} color={hexToRgba(colors.text, 0.4)} />
                </Pressable>
              </View>
              {!!r.comment && (
                <ThemedText style={{ color: hexToRgba(colors.text, 0.8), fontSize: 13, lineHeight: 19 }}>
                  {r.comment}
                </ThemedText>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Review sheet */}
      <BottomSheet isVisible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <View className="gap-5 pb-4">
          <View className="items-center gap-1">
            <ThemedText type="semibold" style={{ fontSize: 16 }}>
              Rate {profile?.fullName ?? 'this host'}
            </ThemedText>
            <ThemedText
              className="text-center"
              style={{ color: hexToRgba(colors.text, 0.6), fontSize: 13 }}
            >
              Share your experience dealing with this host.
            </ThemedText>
          </View>
          <View className="items-center">
            <RatingInput value={rating} onChange={setRating} />
          </View>
          <TextArea
            placeholder="Add a comment (optional)"
            value={comment}
            onChangeText={setComment}
          />
          <Button onPress={handleSubmit} disabled={submitting}>
            <ThemedText content="primary">
              {submitting ? 'Submitting…' : 'Submit review'}
            </ThemedText>
          </Button>
        </View>
      </BottomSheet>
    </DetailsLayout>
  );
}
