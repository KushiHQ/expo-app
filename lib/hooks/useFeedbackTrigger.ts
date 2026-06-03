import React from 'react';
import { useCanLeaveBookingFeedbackQuery, useShouldShowNpsSurveyQuery } from '@/lib/services/graphql/generated';

interface UseFeedbackTriggerOptions {
  bookingId?: string;
  enabled?: boolean;
}

interface UseFeedbackTriggerResult {
  showBookingFeedback: boolean;
  showNPSSurvey: boolean;
  loading: boolean;
  dismissBookingFeedback: () => void;
  dismissNPSSurvey: () => void;
}

const NPS_DISMISS_KEY = 'nps_survey_dismissed_at';
const BOOKING_FEEDBACK_DISMISS_PREFIX = 'booking_feedback_dismissed_';

/**
 * Hook to determine when to show feedback prompts.
 * - Booking feedback: shown once per completed booking
 * - NPS survey: shown quarterly (90 days) with dismiss option
 */
export function useFeedbackTrigger({
  bookingId,
  enabled = true,
}: UseFeedbackTriggerOptions): UseFeedbackTriggerResult {
  const [dismissedBookingFeedback, setDismissedBookingFeedback] = React.useState<Set<string>>(new Set());
  const [dismissedNPS, setDismissedNPS] = React.useState(false);

  // Query: can user leave feedback for this booking?
  const [{ data: bookingFeedbackData, fetching: bookingFetching }] =
    useCanLeaveBookingFeedbackQuery({
      variables: { bookingId: bookingId ?? '' },
      pause: !enabled || !bookingId,
    });

  // Query: should we show NPS survey?
  const [{ data: npsData, fetching: npsFetching }] = useShouldShowNpsSurveyQuery({
    pause: !enabled,
  });

  const showBookingFeedback = React.useMemo(() => {
    if (!bookingId || !enabled) return false;
    if (dismissedBookingFeedback.has(bookingId)) return false;
    return bookingFeedbackData?.canLeaveBookingFeedback === true;
  }, [bookingId, enabled, dismissedBookingFeedback, bookingFeedbackData]);

  const showNPSSurvey = React.useMemo(() => {
    if (!enabled) return false;
    if (dismissedNPS) return false;
    return npsData?.shouldShowNpsSurvey === true;
  }, [enabled, dismissedNPS, npsData]);

  const dismissBookingFeedback = React.useCallback(() => {
    if (bookingId) {
      setDismissedBookingFeedback(prev => new Set(prev).add(bookingId));
    }
  }, [bookingId]);

  const dismissNPSSurvey = React.useCallback(() => {
    setDismissedNPS(true);
  }, []);

  return {
    showBookingFeedback,
    showNPSSurvey,
    loading: bookingFetching || npsFetching,
    dismissBookingFeedback,
    dismissNPSSurvey,
  };
}
