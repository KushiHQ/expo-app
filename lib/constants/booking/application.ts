import {
  GuestFormEmploymentStatus,
  GuestFormGuarantorRelationships,
  GuestFormIncomeRange,
  GuestFormOccupancyType,
  BookingApplicationStatus,
} from '@/lib/services/graphql/generated';

export const BOOKING_APPLICATION_EMPLOYMENT_STATUS: {
  label: keyof typeof GuestFormEmploymentStatus;
  value: GuestFormEmploymentStatus;
  description?: string;
}[] = [
  {
    label: 'Employed',
    value: GuestFormEmploymentStatus.Employed,
    description:
      'You currently hold a full-time or part-time position with an employer and receive a regular salary or wage.',
  },
  {
    label: 'SelfEmployed',
    value: GuestFormEmploymentStatus.SelfEmployed,
    description:
      'You operate your own business, work as a freelancer, or are an independent contractor generating your own income.',
  },
  {
    label: 'Student',
    value: GuestFormEmploymentStatus.Student,
    description:
      'You are actively enrolled in a university or tertiary institution. (You may be asked to provide a financial sponsor).',
  },
  {
    label: 'Unemployed',
    value: GuestFormEmploymentStatus.Unemployed,
    description:
      'You are not currently working. (You may be asked to provide proof of savings or a strong financial guarantor to support your application).',
  },
];

export const BOOKING_APPLICATION_INCOME_RANGES: {
  label: string;
  value: GuestFormIncomeRange;
  description?: string;
  sequence?: number;
}[] = [
  {
    label: 'Under ₦200,000 per month',
    value: GuestFormIncomeRange.Low,
    sequence: 1,
  },
  {
    label: '₦200,000 – ₦800,000 per month.',
    value: GuestFormIncomeRange.Mid,
    sequence: 2,
  },
  {
    label: '₦800,000 – ₦2,000,000 per month.',
    value: GuestFormIncomeRange.High,
    sequence: 3,
  },
  {
    label: 'Over ₦2,000,000 per month.',
    value: GuestFormIncomeRange.Vip,
    sequence: 4,
  },
];

export const BOOKING_APPLICATION_OCCUPANCY_TYPES: {
  label: string;
  value: GuestFormOccupancyType;
  description?: string;
  sequence?: number;
}[] = [
  {
    label: 'Single',
    value: GuestFormOccupancyType.Single,
    description: 'One adult living alone. You will be the sole occupant of the property.',
    sequence: 1,
  },
  {
    label: 'Couple',
    value: GuestFormOccupancyType.Couple,
    description: 'Two adults living together, such as married spouses or partners.',
    sequence: 2,
  },
  {
    label: 'Small Family',
    value: GuestFormOccupancyType.SmallFamily,
    description: 'A household of 3 to 4 people, typically parents with one or two children.',
    sequence: 3,
  },
  {
    label: 'Large Family',
    value: GuestFormOccupancyType.LargeFamily,
    description:
      'A household of 5 or more people, including multiple children, dependents, or extended family members.',
    sequence: 4,
  },
];

export const BOOKING_APPLICATION_GUARANTOR_RELATIONSHIPS: {
  label: string;
  value: GuestFormGuarantorRelationships;
  description?: string;
  sequence?: number;
}[] = [
  {
    label: 'Parent',
    value: GuestFormGuarantorRelationships.Parent,
    description:
      'Your mother, father, or legal guardian who can vouch for your character and financial stability.',
    sequence: 1,
  },
  {
    label: 'Sibling',
    value: GuestFormGuarantorRelationships.Sibling,
    description:
      'A brother or sister who can serve as an emergency contact and strong character reference.',
    sequence: 2,
  },
  {
    label: 'Employer',
    value: GuestFormGuarantorRelationships.Employer,
    description:
      'Your current manager, HR director, or business partner who can verify your professional standing.',
    sequence: 3,
  },
  {
    label: 'Spouse',
    value: GuestFormGuarantorRelationships.Spouse,
    description:
      'Your legally married partner (typically used if they are not signing the lease as a co-tenant).',
    sequence: 4,
  },
  {
    label: 'Clergy',
    value: GuestFormGuarantorRelationships.Clergy,
    description:
      'A recognized religious leader (such as a Pastor or Imam) who has known you for a significant period.',
    sequence: 5,
  },
  {
    label: 'Other',
    value: GuestFormGuarantorRelationships.Other,
    description:
      'A trusted mentor, senior colleague, or extended family member (e.g., Uncle or Aunt).',
    sequence: 6,
  },
];

export const BOOKING_APPLICATION_STATUS_COLORS: Record<BookingApplicationStatus, string> = {
  [BookingApplicationStatus.InProgress]: '#F59E0B',
  [BookingApplicationStatus.Submited]: '#3B82F6',
  [BookingApplicationStatus.SystemVerified]: '#8B5CF6',
  [BookingApplicationStatus.HostVerified]: '#14B8A6',
  [BookingApplicationStatus.AdminVerified]: '#2563EB',
  [BookingApplicationStatus.Accepted]: '#10B981',
  [BookingApplicationStatus.Rejected]: '#EF4444',
  [BookingApplicationStatus.Cancelled]: '#94A3B8',
};
