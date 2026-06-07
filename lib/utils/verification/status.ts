import { CheckCircle2, Clock, AlertCircle, Loader } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { HostingVerificationRequestStatus } from '@/lib/services/graphql/generated';

export type StatusConfig = {
  label: string;
  /** A NativeWind class list for the pill background + border. */
  containerClass: string;
  /** A NativeWind class list for the icon + text color. */
  accentClass: string;
  Icon: LucideIcon;
};

export const VERIFICATION_STATUS_CONFIG: Record<HostingVerificationRequestStatus, StatusConfig> = {
  [HostingVerificationRequestStatus.Pending]: {
    label: 'Pending',
    containerClass: 'bg-yellow-500/10 border border-yellow-500/30',
    accentClass: 'text-yellow-500',
    Icon: Clock,
  },
  [HostingVerificationRequestStatus.UnderReview]: {
    label: 'Under Review',
    containerClass: 'bg-blue-500/10 border border-blue-500/30',
    accentClass: 'text-blue-500',
    Icon: Loader,
  },
  [HostingVerificationRequestStatus.Verified]: {
    label: 'Verified',
    containerClass: 'bg-green-500/10 border border-green-500/30',
    accentClass: 'text-green-500',
    Icon: CheckCircle2,
  },
  [HostingVerificationRequestStatus.Rejected]: {
    label: 'Rejected',
    containerClass: 'bg-red-500/10 border border-red-500/30',
    accentClass: 'text-red-500',
    Icon: AlertCircle,
  },
};

export const VERIFICATION_STATUSES: HostingVerificationRequestStatus[] = [
  HostingVerificationRequestStatus.Pending,
  HostingVerificationRequestStatus.UnderReview,
  HostingVerificationRequestStatus.Verified,
  HostingVerificationRequestStatus.Rejected,
];
