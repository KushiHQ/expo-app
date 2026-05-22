import { gql } from 'urql';

export const ADMIN_FEE_CONFIG_QUERY = gql`
  query AdminFeeConfig {
    adminFeeConfig {
      id
      shortLetHostChargesPercent
      shortLetGuestChargesPercent
      secureLeaseGuestContributionPercent
      standardLegalFee
      cautionCustodyFeePercent
      cautionDisputeFee
      cautionClaimWindowDays
    }
  }
`;

export const ADMIN_LEGAL_CONFIG_QUERY = gql`
  query AdminLegalConfig {
    adminLegalConfig {
      id
      legalFeePercentage
      inspectionNoticeDays
      cautionRefundDays
      gracePeriodDays
      latePaymentInterestRate
      breakNoticePeriod
      minimumOccupationPeriod
      renewalNoticeMonths
      guestStayDays
      forfeitureGracePeriodDays
      mesneProfitRate
    }
  }
`;
