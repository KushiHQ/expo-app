import {
  GuestFormEmploymentStatus,
  GuestFormGuarantorRelationships,
  HostingPropertyRelationship,
  HostingVerificationTier,
  HostingQuery,
  PaymentInterval,
  SubClause,
  TenancyTemplate,
  TenancyTemplateInput,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';

export function cleanupAgreementTemplateInput(
  agreement: TenancyTemplate | TenancyTemplateInput,
): TenancyTemplateInput {
  const toUpdate = { sections: [...agreement.sections] };
  const secs = toUpdate.sections.map((sec) => {
    let updated = { ...sec };
    if (cast<TenancyTemplate['sections'][number]>(sec)['__typename']) {
      const { __typename, ...rest } = cast<TenancyTemplate['sections'][number]>(sec);
      updated = rest;
    }
    const refinedSubClauses = updated.subClauses.map((clause) => {
      if (cast<SubClause>(clause)['__typename']) {
        const { __typename, ...rest } = cast<SubClause>(clause);
        const { requiredVariables, providedValues, ...restVals } = rest;

        return {
          ...restVals,
          requiredVariables: requiredVariables.map(({ __typename, ...v }) => v),
          providedValues: providedValues.map(({ __typename, ...v }) => v),
        };
      } else {
        return clause;
      }
    });

    updated['subClauses'] = refinedSubClauses;
    return updated;
  });

  return {
    sections: secs,
    totalSections: 'totalSections' in agreement ? agreement.totalSections : secs.length,
  };
}

export interface IntervalVars {
  intervalLabel: string;
  frequencyLabel: string;
  dueDateClause: string;
  annualMultiplier: number;
  minOccupationPeriod: string;
  breakNoticePeriod: string;
}

export function intervalVars(interval?: PaymentInterval | null): IntervalVars {
  switch (interval) {
    case PaymentInterval.Monthly:
      return {
        intervalLabel: 'per month',
        frequencyLabel: 'monthly in advance',
        dueDateClause: 'on the 1st day of each calendar month',
        annualMultiplier: 12,
        minOccupationPeriod: '3 months',
        breakNoticePeriod: '1 month',
      };
    case PaymentInterval.Weekly:
      return {
        intervalLabel: 'per week',
        frequencyLabel: 'weekly in advance',
        dueDateClause: 'every Monday of each week',
        annualMultiplier: 52,
        minOccupationPeriod: '4 weeks',
        breakNoticePeriod: '2 weeks',
      };
    case PaymentInterval.Nightly:
      return {
        intervalLabel: 'per night',
        frequencyLabel: 'nightly in advance',
        dueDateClause: 'on each day of occupation',
        annualMultiplier: 365,
        minOccupationPeriod: 'N/A',
        breakNoticePeriod: 'N/A',
      };
    case PaymentInterval.OneTimePayment:
      return {
        intervalLabel: 'as a one-time payment',
        frequencyLabel: 'in full upon execution of this Agreement',
        dueDateClause: 'upon execution of this Agreement',
        annualMultiplier: 1,
        minOccupationPeriod: 'N/A',
        breakNoticePeriod: 'N/A',
      };
    default:
      return {
        intervalLabel: 'per annum',
        frequencyLabel: 'annually in advance',
        dueDateClause: 'on the anniversary of the Commencement Date each year',
        annualMultiplier: 1,
        minOccupationPeriod: '6 months',
        breakNoticePeriod: '1 month',
      };
  }
}

export function landlordTypeLabel(
  relationship?: HostingPropertyRelationship | null,
  tier?: HostingVerificationTier | null,
): string {
  let base: string;
  switch (relationship) {
    case HostingPropertyRelationship.Agent:
      base = 'Property Agent';
      break;
    case HostingPropertyRelationship.Subletter:
      base = 'Sub-Lessor';
      break;
    default:
      base = 'Landlord';
  }
  if (
    tier === HostingVerificationTier.OwnerVerified ||
    tier === HostingVerificationTier.KushiVetted
  ) {
    return `${base} (Kushi Verified)`;
  }
  return base;
}

export function verificationTierLabel(tier?: HostingVerificationTier | null): string {
  switch (tier) {
    case HostingVerificationTier.IdentityVerified:
      return 'Identity Verified';
    case HostingVerificationTier.AddressVerified:
      return 'Address Verified';
    case HostingVerificationTier.OwnerVerified:
      return 'Owner Verified';
    case HostingVerificationTier.KushiVetted:
      return 'Kushi Vetted';
    default:
      return 'Unverified';
  }
}

export function mediationInstitutionLabel(state?: string | null): string {
  const s = (state ?? '').toLowerCase();
  if (s.includes('abuja') || s.includes('fct')) return 'Abuja Multi-Door Courthouse';
  if (s.includes('lagos')) return 'Lagos Multi-Door Courthouse';
  if (s.includes('rivers')) return 'Rivers State Multi-Door Courthouse';
  return 'Multi-Door Courthouse';
}

export function courtJurisdictionPhrase(state?: string | null): string {
  const s = (state ?? '').toLowerCase();
  if (s.includes('abuja') || s.includes('fct')) {
    return 'the appropriate Area Court or High Court of the Federal Capital Territory';
  }
  if (!state) return 'the appropriate court of competent jurisdiction';
  return `the appropriate Magistrate Court or High Court of ${state} State`;
}

export function employmentStatusLabel(status?: GuestFormEmploymentStatus | null): string {
  switch (status) {
    case GuestFormEmploymentStatus.Employed:
      return 'Employed Person';
    case GuestFormEmploymentStatus.SelfEmployed:
      return 'Self-Employed Person';
    case GuestFormEmploymentStatus.CorpMember:
      return 'NYSC Corps Member';
    case GuestFormEmploymentStatus.Student:
      return 'Student';
    case GuestFormEmploymentStatus.Unemployed:
      return 'Unemployed Person';
    default:
      return 'N/A';
  }
}

export function guarantorRelationshipLabel(rel?: GuestFormGuarantorRelationships | null): string {
  switch (rel) {
    case GuestFormGuarantorRelationships.Parent:
      return 'Parent';
    case GuestFormGuarantorRelationships.Sibling:
      return 'Sibling';
    case GuestFormGuarantorRelationships.Employer:
      return 'Employer';
    case GuestFormGuarantorRelationships.Spouse:
      return 'Spouse';
    case GuestFormGuarantorRelationships.Clergy:
      return 'Clergy';
    case GuestFormGuarantorRelationships.Other:
      return 'Personal Acquaintance';
    default:
      return 'N/A';
  }
}

interface DurationResult {
  metric: string;
  startDateFormatted: string;
  endDateFormatted: string;
  endDate: Date;
}

export function hostingDuration(
  paymentInterval?: PaymentInterval | null,
  multiplier?: number | null,
  startDate: Date = new Date(),
): DurationResult {
  const safeMultiplier = Math.max(1, multiplier ?? 1);
  let label = 'Years';

  switch (paymentInterval) {
    case PaymentInterval.Nightly:
      label = 'Nights';
      break;
    case PaymentInterval.Weekly:
      label = 'Weeks';
      break;
    case PaymentInterval.Monthly:
      label = 'Months';
      break;
    case PaymentInterval.Anually:
      label = 'Years';
      break;
    default:
      label = 'Years';
  }

  const metric =
    safeMultiplier === 1
      ? `${safeMultiplier} ${label.slice(0, -1).toUpperCase()}`
      : `${safeMultiplier} ${label.toUpperCase()}`;

  const endDate = new Date(startDate.getTime());

  if (paymentInterval === PaymentInterval.Nightly) {
    endDate.setDate(endDate.getDate() + safeMultiplier);
  } else if (paymentInterval === PaymentInterval.Weekly) {
    endDate.setDate(endDate.getDate() + safeMultiplier * 7);
  } else if (paymentInterval === PaymentInterval.Monthly) {
    endDate.setMonth(endDate.getMonth() + safeMultiplier);
    endDate.setDate(endDate.getDate() - 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + safeMultiplier);
    endDate.setDate(endDate.getDate() - 1);
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    metric,
    startDateFormatted: formatter.format(startDate),
    endDateFormatted: formatter.format(endDate),
    endDate,
  };
}

/**
 * Returns false if a sub-clause should be hidden because the underlying hosting/application
 * data that gives it meaning is absent.
 *
 * Pass `application` as `undefined` (not null) in host-only contexts (no application yet) —
 * this makes the guarantor clause always pass so hosts can still configure it.
 */
export function subClauseConditionMet(
  id: string,
  hosting: HostingQuery['hosting'],
  application?: { guestFormData?: { guarantorRelationships?: unknown } | null } | null,
): boolean {
  switch (id) {
    case 'sub_caution_fee':
      return (hosting?.cautionFee ?? 0) > 0;
    case 'sub_service_charge':
      return (hosting?.serviceCharge ?? 0) > 0;
    case 'sub_guarantor':
      if (application === undefined) return true;
      return !!application?.guestFormData?.guarantorRelationships;
    default:
      return true;
  }
}
