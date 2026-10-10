import { gql } from 'urql';

/* Mutations for the redesigned apply flow (field sets mirror the web app). */

export const K_INITIATE_APPLICATION = gql`
	mutation KInitiateBookingApplication($hostingId: String!) {
		initiateBookingApplication(hostingId: $hostingId) {
			message
			data {
				id
				status
				email
				fullName
				correspondenceAddress
				commencementDate
				phoneNumber
				intervalMultiplier
				guestFormData {
					employmentStatus
					incomeRanges
					occupancyTypes
					guarantorRelationships
					guarantorName
					guarantorPhone
					guarantorAddress
				}
				bookingAggrement {
					totalSections
					sections {
						id
						title
						description
						priority
						preamble
						subClauses {
							id
							title
							description
							priority
							content
							isMandatory
							isActive
							isCustom
							requiredVariables {
								name
								type
							}
							providedValues {
								key
								value
							}
						}
					}
				}
			}
		}
	}
`;
export const K_UPDATE_APPLICATION = gql`
	mutation KUpdateBookingApplication($input: BookingApplicationUpdateInput!) {
		updateBookingApplication(input: $input) {
			message
			data {
				id
				fullName
				email
				phoneNumber
				commencementDate
				correspondenceAddress
				intervalMultiplier
				status
				statusDetails
				createdAt
				lastUpdated
				bookingAggrement {
					totalSections
					sections {
						id
						title
						description
						priority
						preamble
						subClauses {
							id
							title
							description
							priority
							content
							isMandatory
							isActive
							isCustom
							requiredVariables {
								name
								type
							}
							providedValues {
								key
								value
							}
						}
					}
				}
				guestFormData {
					employmentStatus
					incomeRanges
					occupancyTypes
					guarantorRelationships
					guarantorName
					guarantorPhone
					guarantorAddress
				}
			}
		}
	}
`;
