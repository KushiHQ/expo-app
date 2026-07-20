import { MagePreviewFill } from '@/components/icons/i-preview';
import { SolarTagPriceOutline } from '@/components/icons/i-price';
import { SolarVerifiedCheckOutline } from '@/components/icons/i-verified';
import { Video } from '@/components/icons/i-camera';
import { CustomSvgProps } from '@/lib/types/svgType';
import {
  FileSignature,
  HousePlus,
  Images,
  LucideIcon,
  MapPinHouse,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { showTenancySteps, showAmenitiesStep } from './step-rules';

export type OnboardingStep = {
  icon: LucideIcon | React.FC<CustomSvgProps>;
  title: string;
  description: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: HousePlus,
    title: 'Enter Property Details',
    description: 'Start by choosing how it’s managed, the property type, and the listing style.',
  },
  {
    icon: Images,
    title: 'Add Photos',
    description: 'Add clear images for each room.',
  },
  {
    icon: Video,
    title: 'Record a Video Walkthrough',
    description:
      'Optionally record a short tour (up to 5 minutes) so guests can see the property in motion.',
  },
  {
    icon: MapPinHouse,
    title: 'Set Your Location',
    description: 'Pinpoint your property on the map and add your address so guests can find you.',
  },
  {
    icon: Sparkles,
    title: 'Select Amenities & Features',
    description:
      'Select all the great features and amenities your place offers, from Wi-Fi to a swimming pool.',
  },
  {
    icon: SolarTagPriceOutline,
    title: 'Set Your Price',
    description:
      'Define your price, payment interval (e.g., /year), and the bank account for your payouts.',
  },
  {
    icon: ShieldCheck,
    title: 'Landlord Mandate',
    description:
      'Verify your authorization to let this property. Upload your mandate to build trust with guests and enable secure payouts.',
  },
  {
    icon: FileSignature,
    title: 'Tenancy Terms & Rules',
    description:
      'Set clear boundaries to protect your property. Define occupancy limits, set house rules, and digitally sign your standardized lease agreement.',
  },
  {
    icon: MagePreviewFill,
    title: 'Review & Publish',
    description:
      'Name and describe your listing (AI can help), give everything a final look, and submit.',
  },
  {
    icon: SolarVerifiedCheckOutline,
    title: 'Get Verified',
    description:
      "Our team will review your submission. You'll be notified as soon as your listing is approved and goes live!",
  },
];

/**
 * Returns the visible steps and a mapping from original step index
 * to filtered position. Used by onboarding.tsx and step navigation.
 *
 * Original indices:
 *   0 = Property Details, 1 = Photos, 2 = Video Walkthrough, 3 = Location,
 *   4 = Amenities, 5 = Price, 6 = Mandate, 7 = Tenancy Terms,
 *   8 = Review, 9 = Verified
 */
export function getVisibleSteps(
  listingType?: string | null,
  propertyType?: string | null,
): { steps: OnboardingStep[]; indexMap: number[] } {
  const tenancy = showTenancySteps(listingType, propertyType);
  const amenities = showAmenitiesStep(propertyType);

  const steps: OnboardingStep[] = [];
  const indexMap: number[] = [];

  ONBOARDING_STEPS.forEach((step, originalIndex) => {
    if (originalIndex === 4 && !amenities) return;
    if (originalIndex === 6 && !tenancy) return;
    if (originalIndex === 7 && !tenancy) return;

    steps.push(step);
    indexMap.push(originalIndex);
  });

  return { steps, indexMap };
}
